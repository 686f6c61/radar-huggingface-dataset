# ainoya/qwen3-asr-0.6b-q8-packed

## Resumen

`ainoya/qwen3-asr-0.6b-q8-packed` es una imagen de pesos pre-cuantizada en int8 del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, publicada por el desarrollador ainoya. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue empaquetado específicamente para el motor de inferencia `qwen-asr`, escrito en C puro y compilable a WebAssembly y WebGPU, que es un fork del proyecto original de Salvatore Sanfilippo (antirez). El objetivo es permitir la ejecución de ASR en entornos con memoria muy restringida, incluidos navegadores web y teléfonos móviles.

El paquete contiene un único fichero `qwen-asr-q8.bin` en formato safetensors en el que las capas del transformer del decodificador, el embedding compartido con la LM head y la torre de audio están cuantizados por bloques a int8, con 64 pesos por escala en f32 (aproximadamente 1,06 bytes por peso), y donde el par gate/up de SwiGLU está pre-fusionado. El resultado ocupa 0,84 GB frente a los 1,88 GB de los pesos bf16 originales, lo que supone una reducción de más del 55 % del espacio en disco y de la huella de memoria en tiempo de ejecución.

La relevancia de esta publicación es fundamentalmente práctica: demuestra que un modelo ASR de 0,6 mil millones de parámetros puede ejecutarse íntegramente en el navegador mediante WebGPU, sin depender de infraestructura de servidor. El autor advierte, no obstante, de un coste medible en calidad derivado de la cuantización del embedding y de la LM head, que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (torre de audio + decodificador con SwiGLU y embedding/LM head compartidos), tal como se describe en la model card del paquete |
| Parametros totales | 0,6 mil millones (0.6B), segun el nombre del modelo base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 por bloques (64 pesos por escala f32, ~1,06 bytes/peso); el modelo base admite bf16 |
| Idiomas soportados | en, ja, zh |
| Licencia | Apache 2.0 (heredada del modelo base); el formato de empaquetado y el motor son MIT |
| Formato de pesos | safetensors (fichero unico `qwen-asr-q8.bin`), mas `vocab.json` y `merges.txt` (BPE byte-level) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3-ASR-0.6B es un sistema de reconocimiento automático del habla que combina una torre de audio (encoder) con un decodificador de tipo transformer. En esta imagen empaquetada, ambos componentes se han cuantizado a int8: las capas del decodificador, el embedding compartido con la LM head y la torre de audio emplean cuantización por bloques con 64 pesos por escala en coma flotante de 32 bits, y el par de proyecciones gate/up de la SwiGLU se ha pre-fusionado para simplificar y acelerar la inferencia en el motor C.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La model card del paquete no documenta el proceso de entrenamiento del modelo original, limitándose a describir el formato de empaquetado y el motor de ejecución. La innovación técnica destacable de esta publicación no reside en el entrenamiento, sino en el formato: un único fichero safetensors optimizado para un motor de inferencia sin dependencias pesadas, compilable a WebAssembly y ejecutable sobre WebGPU.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en inglés, japonés y chino.
- Ejecución nativa en C mediante el motor `qwen-asr` (compilación con `make blas`).
- Ejecución en navegador a través de WebAssembly y WebGPU, con descarga directa del fichero de pesos desde el playground del autor.
- Tokenización BPE byte-level compatible con el modelo base, mediante `vocab.json` y `merges.txt` sin modificar.
- Inferencia en dispositivos con memoria restringida gracias a la reducción de 1,88 GB a 0,84 GB.
- Soporte de tool calling, agentes, visión, audio generativo, modo thinking o razonamiento multi-paso: no disponible (el modelo es exclusivamente ASR).

## Casos de uso

- Transcripción en el navegador sin servidor: el playground de `qwen-asr` descarga `qwen-asr-q8.bin` y ejecuta la inferencia íntegramente en el cliente mediante WebGPU, lo que elimina la necesidad de enviar audio a un backend y reduce los requisitos de infraestructura a un servidor de ficheros estáticos.
- Aplicaciones móviles o web de dictado en inglés, japonés o chino: al ocupar 0,84 GB, el paquete es la opción que el propio playground ofrece para dispositivos con memoria limitada como teléfonos, donde la variante bf16 de 1,88 GB resultaría inviable.
- Subtitulado y transcripción de reuniones en local: el motor nativo en C permite procesar ficheros WAV desde línea de comandos (`./qwen_asr -d qwen3-asr-0.6b-q8 -i audio.wav`) en máquinas sin GPU dedicada, integrable en scripts de posprocesado.
- Prototipado rápido de pipelines ASR: al no requerir CUDA ni frameworks de Python, el binario y los pesos se despliegan en contenedores mínimos o entornos embebidos, lo que simplifica la validación de ideas antes de invertir en infraestructura mayor.
- Procesamiento por lotes de audio en entornos con restricciones de memoria: la cuantización int8 reduce la huella, permitiendo ejecutar varias instancias o convivir con otros procesos en máquinas de gama baja.
- Evaluación comparativa de cuantización: el paquete sirve como referencia para medir el impacto de la cuantización int8 del embedding y la LM head frente a los pesos bf16 originales, con una métrica de error normalizado documentada por el autor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (WER, MMLU, etc.). El único dato cuantitativo disponible es el error normalizado medido por el autor sobre el conjunto de muestras en inglés del motor:

| Configuracion | Error normalizado (muestras en ingles) |
|---|---|
| 0.6B con LM head en bf16 | ~3,1 % |
| 0.6B empaquetado Q8 (esta imagen) | ~5,0 % |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,84 GB solo para los pesos; el motor en C añade una sobrecarga adicional no cuantificada en la documentación.
- GPU recomendadas: no disponible. El motor soporta ejecución nativa con BLAS y ejecución en navegador vía WebGPU; no se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se documenta compatibilidad explícita, pero el objetivo declarado es su uso en dispositivos con memoria limitada, incluidos teléfonos, lo que sugiere que cabe en hardware de gama baja.
- Opciones de despliegue: motor `qwen-asr` (nativo, compilado con `make blas`) y navegador mediante WebAssembly + WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ainoya/qwen3-asr-0.6b-q8-packed | 0,6B | no disponible | en, ja, zh | Apache 2.0 | safetensors int8, motor C / WASM / WebGPU |
| ainoya/qwen3-asr-1.7b-q8-packed | 1,7B | no disponible | no disponible | Apache 2.0 (heredada) | safetensors int8, mismo motor |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6B | no disponible | en, ja, zh | Apache 2.0 | bf16, ecosistema Hugging Face |

El autor recomienda la variante de 1,7B cuando la memoria lo permite, por su menor coste de cuantización. No se dispone de datos de rendimiento comparativo entre estas variantes más allá del error normalizado citado.

## Limitaciones y advertencias

- Coste de calidad por cuantización: el formato empaquetado cuantiza siempre el embedding y la LM head, lo que en el modelo de 0,6B eleva el error normalizado en inglés de ~3,1 % a ~5,0 % porque los logits casi empatados se invierten. El autor recomienda usar la imagen de 1,7B o los pesos bf16 originales con `--weights q8` cuando la memoria lo permita.
- Cobertura lingüística limitada: solo inglés, japonés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Sin datos de sesgo, alucinación o robustez acústica: la model card no documenta evaluaciones de sesgo, ruido de fondo, acentos o dominios específicos.
- Dependencia de un motor concreto: los pesos están empaquetados para `qwen-asr`; no son directamente utilizables en vLLM, llama.cpp, Transformers u otros runners sin reconversión.
- Madurez del ecosistema: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el motor es un fork de un proyecto reciente; conviene validar estabilidad antes de usarlo en producción.
- Licencia: Apache 2.0 para los pesos, permisiva para uso comercial; el formato de empaquetado y el motor son MIT. No se documentan restricciones adicionales del modelo base más allá de las de Apache 2.0.
- Contexto y longitud de audio máxima: no disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ainoya/qwen3-asr-0.6b-q8-packed
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Variante de 1,7B empaquetada: https://huggingface.co/ainoya/qwen3-asr-1.7b-q8-packed
- Motor de inferencia (fork del autor): https://github.com/ainoya/qwen-asr
- Motor original: https://github.com/antirez/qwen-asr
- Playground en navegador: https://ainoya.github.io/qwen-asr/
