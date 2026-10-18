# smoothandesign/genmotion-alignement-fr

## Resumen

`genmotion-alignement-fr` es un modelo de audio en formato ONNX desarrollado por Smooth & Design para el alineamiento forzado, palabra a palabra, de letras escritas sobre una canción en francés. No es un modelo generativo ni un asistente conversacional: produce emisiones CTC que después se alinean con una transcripción conocida para obtener marcas temporales. Se ejecuta en local mediante `onnxruntime`, lo que facilita integrarlo en aplicaciones de escritorio, karaoke o vídeo musical sin enviar audio a la nube.

El modelo parte de los pesos de `jonatasgrosman/wav2vec2-large-xlsr-53-french`, revisión `7c79e105a6525d38e1e69f640b974b4a679723cc`, bajo licencia Apache 2.0. Smooth & Design no ha reentrenado los pesos: ha exportado la red a ONNX opset 17, ha integrado la normalización de la onda y el `log_softmax` en el grafo, y ha aplicado cuantización dinámica int8 únicamente a las operaciones MatMul, con pesos por canal. El resultado es un único archivo de 356.211.531 bytes, aproximadamente 0,4 GB.

Su relevancia práctica está en el coste y la privacidad: un modelo de alineamiento francés que cabe en CPU, funciona sin conexión y ofrece una resolución temporal de 20 ms por trama. La salida tiene 59 clases, con la clase 0 reservada para el blanco CTC, y está pensada para sincronizar letras, generar subtítulos karaoke o automatizar el etiquetado temporal de audio cantado en francés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabeza CTC, exportado a ONNX opset 17 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a texto; entrada de audio mono a 16 kHz de longitud variable `[1, N]`; resolución de 20 ms por trama |
| Tipos de cuantización | cuantización dinámica int8 de las MatMul, pesos por canal |
| Idiomas soportados | francés (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX opset 17; archivo único `alignement-fr-int8.onnx` |
| Entrada | `onde`, float32 `[1, N]`, audio mono a 16 kHz |
| Salida | `emission`, float32 `[1, tramas, 59]`, log-probabilidades CTC |
| Clases de salida | 59; la clase 0 es el blanco CTC |
| Tamaño del archivo | 356.211.531 bytes |
| Modelo base | `jonatasgrosman/wav2vec2-large-xlsr-53-french` |
| Repositorio | 0,4 GB; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es una red Wav2Vec2 con cabeza CTC. La entrada es una onda mono a 16 kHz que se normaliza dentro del grafo ONNX; la red genera una secuencia de log-probabilidades por trama, con una trama cada 20 ms, y una dimensión de 59 clases. La clase 0 corresponde al blanco CTC, necesario para el alineamiento forzado. El export incluye la normalización de la onda y el `log_softmax`, de modo que el consumidor recibe directamente `emission` sin preprocesar la salida.

No se han reentrenado los pesos. El modelo original es `jonatasgrosman/wav2vec2-large-xlsr-53-french`, y la model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. La modificación técnica principal es el export reproducible a ONNX y la cuantización dinámica int8 limitada a las MatMul, con pesos por canal; el script `exporter-alignement.py` permite regenerar el archivo con el mismo resultado.

## Capacidades

- Generación de emisiones CTC para audio de voz o canto en francés, con una trama cada 20 ms.
- Alineamiento forzado de una transcripción conocida contra el audio, lo que permite obtener tiempos por palabra o por segmento.
- Sincronización de letras para karaoke, vídeos musicales y aplicaciones de seguimiento de letra.
- Funcionamiento local y offline mediante `onnxruntime`, sin dependencia de servicios externos.
- Integración en pipelines de audio que necesiten probabilidades por trama para aplicar algoritmos CTC de alineamiento.
- Uso como componente de un sistema ASR francés, aunque el modelo está empaquetado y documentado principalmente para alineamiento.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades de visión, audio general, diálogo ni generación de texto libre.
- El soporte multilingüe se limita al francés; no se documentan otros idiomas.

## Casos de uso

- **Karaoke con sincronización palabra a palabra**: el modelo recibe la mezcla vocal y la letra escrita, y genera emisiones CTC que un algoritmo de alineamiento convierte en marcas temporales. La resolución de 20 ms permite que el resaltado de la letra siga la interpretación con granularidad suficiente para karaoke.
- **Generación de subtítulos para vídeos musicales**: a partir de una letra ya transcrita, se alinean las líneas y las palabras con el audio para exportar SRT, ASS o un formato interno de resaltado. Es adecuado porque no necesita reentrenamiento y puede ejecutarse en local durante el renderizado.
- **Integración en DAW o herramientas de producción musical**: un plugin de escritorio puede cargar el ONNX de 356 MB y alinear una toma vocal con la letra del artista sin enviar audio a un servidor. La cuantización int8 reduce el coste de despliegue en equipos de músicos y estudios pequeños.
- **Etiquetado temporal de datasets de canto en francés**: investigadores pueden prealinear letras y audio para crear corpus con timestamps por palabra. La salida por tramas y el blanco CTC facilitan revisar y corregir manualmente los límites detectados.
- **Análisis lingüístico y musicológico**: las probabilidades por trama permiten estudiar alargamientos vocálicos, articulación, pausas y desviaciones entre la letra escrita y la interpretación real. El modelo sirve como extractor de emisiones, no como transcriptor final.
- **Control de calidad de transcripciones**: si se dispone de una transcripción de referencia, el alineamiento permite detectar palabras omitidas, añadidos, repeticiones o fragmentos mal transcritos comparando la ruta CTC con la secuencia esperada.
- **Herramientas educativas de francés cantado**: una aplicación puede resaltar la letra mientras suena el audio y mostrar en qué momento se pronuncia cada palabra. El procesamiento local evita enviar grabaciones de estudiantes a terceros.
- **Automatización de vídeos con letra para redes sociales**: el modelo proporciona la base temporal para animaciones, subtítulos palabra a palabra y efectos sincronizados, con un archivo pequeño que puede desplegarse en un servicio interno basado en ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Resultado |
|---|---|
| WER o precisión ASR en francés | no disponible |
| Error de alineamiento por palabra | no disponible |
| Evaluación con audio cantado | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (modelo de audio) |

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un archivo int8 de 356 MB, la inferencia en GPU requiere aproximadamente 1-2 GB de VRAM, incluyendo pesos, activaciones y buffers de `onnxruntime`; es una estimación, no un dato publicado por el autor.
- **RAM estimada**: alrededor de 0,5-1 GB para el modelo y el audio de entrada, dependiendo de la longitud de `N` y del backend.
- **GPU recomendadas**: cualquier GPU compatible con ONNX Runtime, como NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100. Para este tamaño, una GPU consumer es más que suficiente; la CPU también es viable.
- **CPU**: un procesador moderno x86-64 o ARM puede ejecutar el modelo con `onnxruntime` en CPU. El rendimiento depende de la longitud del audio y del número de hilos.
- **Opciones de despliegue**: ONNX Runtime con execution providers de CPU, CUDA o TensorRT; Triton Inference Server con backend ONNX; integración directa en aplicaciones de escritorio o servidores internos. No es adecuado para vLLM, llama.cpp u Ollama, porque no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. No se han publicado medidas de tiempo real, factor de tiempo real ni throughput; dependerán del hardware, del execution provider y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Enfoque | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smoothandesign/genmotion-alignement-fr` | Alineamiento forzado CTC para francés | ONNX int8, opset 17 | 356.211.531 bytes | Apache 2.0 | HuggingFace |
| `jonatasgrosman/wav2vec2-large-xlsr-53-french` | ASR francés; modelo base | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificable en la documentación proporcionada sobre otras alternativas de alineamiento forzado en francés con las que comparar parámetros, contexto o rendimiento. La comparación directa más sólida es con el modelo base, del que este repositorio reutiliza los pesos y al que añade el export ONNX y la cuantización int8.

## Limitaciones y advertencias

- **Idioma único**: el modelo está documentado para francés (`fr`); no se garantiza su funcionamiento en otros idiomas.
- **Dominio cantado**: el modelo base está orientado a voz; la model card no aporta evaluaciones específicas con canto, música de fondo o mezclas con instrumentales. El rendimiento puede degradarse en canciones con reverberación, distorsión o voces superpuestas.
- **Transcripción obligatoria**: el alineamiento forzado necesita una letra o transcripción de referencia. Si la letra no coincide con lo cantado, hay improvisaciones, ad-libs o repeticiones, el alineamiento puede fallar o producir tiempos incorrectos.
- **Resolución temporal limitada**: una trama cada 20 ms implica que los límites de palabra tienen una granularidad aproximada; no debe esperarse precisión de milisegundos.
- **Salida CTC, no timestamps directos**: el modelo devuelve log-probabilidades por trama. Obtener tiempos por palabra requiere aplicar un algoritmo de alineamiento CTC adicional.
- **Sin benchmarks publicados**: no hay WER, error de alineamiento ni métricas con audio musical en la información disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria observable.
- **Riesgo de falsos positivos en la alineación**: aunque no es un modelo generativo y no "alucina" texto, puede asignar probabilidad a segmentos incorrectos cuando el audio es ambiguo o la transcripción no se corresponde con la señal.
- **Preprocesado obligatorio**: la entrada debe ser audio mono a 16 kHz en float32 con forma `[1, N]`. Cualquier otro formato, frecuencia de muestreo o número de canales requiere conversión previa.
- **Compatibilidad ONNX**: el archivo usa opset 17 y cuantización int8; el soporte de operadores y de cuantización puede variar entre versiones de ONNX Runtime y execution providers.
- **Licencia y atribución**: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de copyright. Los pesos originales son de Jonatas Grosman; el export y la cuantización son de Smooth & Design.
- **No apto para tareas de lenguaje**: no debe emplearse como modelo conversacional, de razonamiento, de generación de código ni de agentes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/smoothandesign/genmotion-alignement-fr)
- [Modelo base jonatasgrosman/wav2vec2-large-xlsr-53-french](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french)
- [GEN MOTION](https://genmotion.app)
