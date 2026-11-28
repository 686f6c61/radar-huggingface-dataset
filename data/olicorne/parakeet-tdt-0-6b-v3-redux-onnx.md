# Olicorne/parakeet-tdt-0.6b-v3-redux-onnx

## Resumen

Parakeet TDT 0.6B v3 Redux ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-redux`, que a su vez es una versión de 1,58 bits del `nvidia/parakeet-tdt-0.6b-v3`. Mantiene la misma arquitectura y tokenizador que el modelo original, pero cada peso del codificador se ha reducido a valores ternarios (-1, 0 o +1) multiplicados por una escala por bloque de 128 elementos. El resultado es un codificador de apenas 190 MB (135 MB comprimido con zstd) que puede ejecutarse íntegramente en el navegador mediante WebAssembly.

El modelo está pensado para transcripción del lado del cliente, sin enviar audio a servidores externos, y se integra con proyectos como Parakeet Web y onnx-asr. Cubre 25 idiomas europeos y emplea una arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer). Su relevancia actual radica en que demuestra que un ASR de calidad razonable puede desplegarse en hardware de consumo y en el navegador con un tamaño mínimo, a costa de una licencia permisiva (CC-BY-4.0) y una huella de almacenamiento muy reducida.

La exportación la firma Olicorne, un desarrollador independiente que financia el proyecto con su propio salario y una única GPU de consumo. El repositorio incluye tanto los pesos ONNX como el checkpoint NeMo original desde el que se exportaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | Codificador MatMulNBits 2 bits (w2a8, bloque 128); decodificador int8 y fp32; pesos ternarios (-1, 0, +1) con escala por bloque |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (codificador w2a8, decodificador int8/fp32, preprocesador nemo128.onnx, checkpoint .nemo) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/parakeet-tdt-0.6b-v3`, un Conformer de NeMo con decodificador TDT. La variante Redux de moondream aplica una cuantización ternaria a todos los pesos del codificador: cada valor se aproxima a -1, 0 o +1 multiplicado por una escala calculada por bloques de 128 elementos. La exportación ONNX de Olicorne preserva esa estructura ternaria y empaqueta los 264 productos matriciales ternarios como MatMulNBits de 2 bits, con punto cero y escala por bloque. La proyección de subsampling no es ternaria y permanece en fp32.

El proceso de construcción parte del checkpoint de Hugging Face, lo remapea al `.nemo` base mediante un renombrado de claves (todos los pesos aprendidos provienen de los safetensors de moondream, y se elimina la cabeza VAD), y después ejecuta `export_onnx.py --web-optimized` de NeMo junto con un script propio que aplica plegado de grafo, redondeo a mantisa de 12 bits, fragmentación fp32, cirugía del decodificador (int8 con LSE/top-K), conversión a fp16, transformación de convoluciones puntuales en MatMul y empaquetado MatMulNBits. Desde octubre de 2026 solo se distribuye el codificador w2a8, ya que las variantes fp32, fp16, int8 y w4a8 contenían exactamente los mismos pesos ternarios y ofrecían el mismo rendimiento. La versión de atención simplificada sustituye el `rel_shift` por capa por un único Gather compartido entre las 24 capas, reduciendo el grafo de 2264 a 1891 nodos sin alterar las salidas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Procesamiento por lotes de clips de distinta longitud gracias a una máscara de atención key-only que enmascara los frames de relleno.
- Ejecución en CPU y WebAssembly; pensado para transcripción íntegramente en el navegador.
- Integración con onnx-asr mediante `model.recognize([a, b, c])` para lotes.
- Compatibilidad con el ecosistema NeMo (checkpoint `.nemo` incluido).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en el navegador sin servidor: Parakeet Web ejecuta el codificador w2a8 en WASM, de modo que el audio del usuario nunca sale de su máquina; adecuado para aplicaciones de dictado o notas de voz con requisitos de privacidad.
- Subtitulado y actas de reuniones en local: con 25 idiomas europeos y un codificador de 135 MB comprimido, puede desplegarse en portátiles sin GPU para generar transcripciones de reuniones o clases.
- Procesamiento por lotes de archivos de audio: onnx-asr permite pasar listas de clips de distinta duración y aprovechar el enmascaramiento de frames; útil para transcribir archivos de un directorio o una cola de podcasts.
- Aplicaciones de accesibilidad: dictado por voz en tiempo real en herramientas web, con la ventaja de que el modelo cabe en la caché del navegador y no requiere backend.
- Transcripción de audio médico en francés: el autor publica una variante específica (`parakeet-tdt-0.6b-v3-redux-UltiMed-v2-experimental-onnx`) con decodificador ajustado para vocabulario médico, con un WER de diccionario del 8,78 % frente al 12,12 % de la variante ultra.
- Prototipado e investigación en ASR de bajo consumo: el checkpoint `.nemo` y los scripts de exportación permiten reproducir la cuantización ternaria y experimentar con otros empaquetados.
- Integración en pipelines de CI/CD para verificación de transcripciones: el modelo puede ejecutarse en CPU en aproximadamente 1,46 s por clip (lote de 1), lo que permite validar automáticamente audios de prueba en entornos sin GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo por clip, w2a8, lote 1, CPU | 1,46 s |
| Tiempo por clip, int8, lote 1, CPU | 1,54 a 1,81 s |
| Tiempo por clip, w4a8, lote 1, CPU | 1,53 a 1,63 s |
| WER, 1000 clips UltiMed, codificador w4a8 + decodificador fp32, CUDA, lote 1 | 3,26 % |
| WER, mismos clips, lotes de 8, 16 y 32 | 3,26 % |
| Tiempo por clip, lotes de 8 / 16 / 32 | 0,06 / 0,05 / 0,04 s |
| WER de diccionario, variante UltiMed-v2 | 8,78 % |
| WER de diccionario, variante ultra-UltiMed-v1 | 12,12 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el codificador w2a8 ocupa 190 MB en disco (135 MB comprimido) y el decodificador int8 18 MB; en fp32 el decodificador sube a 73 MB. El consumo de memoria en ejecución no está documentado.
- GPU: el codificador de 2 bits provoca un fallo de acceso ilegal de memoria en el proveedor CUDA de onnxruntime (onnxruntime-gpu 1.30.0, a fecha de 2026-10-06). En GPU se recomienda usar la variante int8 de `parakeet-ultra`, más rápida y precisa.
- CPU: es el entorno previsto; Parakeet Web lo ejecuta sobre WebAssembly.
- GPU de consumo: no aplica para el codificador w2a8 por el fallo de CUDA; la variante int8 de parakeet-ultra es la opción para GPU de consumo.
- Despliegue: onnx-asr, Parakeet Web (navegador/WASM), onnxruntime CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR).
- Latencia y throughput: 1,46 s por clip en CPU con lote 1; 0,04 a 0,06 s por clip en CUDA con lotes de 8 a 32 usando el codificador w4a8 y decodificador fp32 (datos de la variante UltiMed).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Olicorne/parakeet-tdt-0.6b-v3-redux-onnx | 0,6 B (ternario) | no disponible | 25 | CC-BY-4.0 | ONNX | Codificador 190 MB, solo CPU/WASM |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | 0,6 B | no disponible | no disponible | no disponible | ONNX | Variante int8, recomendada en GPU |
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | 0,6 B | no disponible | no disponible | no disponible | ONNX | Mismo layout y pipeline, sin cuantización ternaria |
| moondream/parakeet-redux | 0,6 B (1,58 bits) | no disponible | no disponible | no disponible | safetensors | Modelo base del que se exporta |

## Limitaciones y advertencias

- El codificador de 2 bits falla en el proveedor CUDA de onnxruntime con acceso ilegal a memoria; no es apto para inferencia en GPU con esa configuración.
- El decodificador int8 cuantiza activaciones con una escala por lote, por lo que la transcripción de un clip puede depender de los clips vecinos del lote; para lotes se recomienda el decodificador fp32.
- La cuantización ternaria implica pérdida de precisión frente al modelo original; no se han publicado métricas de WER del modelo general (solo de la variante UltiMed).
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones específicas de idioma en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de producción.
- El proyecto se financia con el salario del autor y una única GPU de consumo, lo que puede afectar a la cadencia de actualizaciones.
- Solo se mantiene el empaquetado w2a8; las variantes fp32, fp16, int8 y w4a8 han sido retiradas del repositorio actual (permanecen en el historial de git).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-redux
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante optimizada: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Variante ultra: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Variante médica experimental: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-v2-experimental-onnx
- Variante ultra médica: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v1-onnx
- Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- onnx-asr: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
