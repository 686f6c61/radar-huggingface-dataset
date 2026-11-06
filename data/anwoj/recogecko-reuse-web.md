# AnWoj/recogecko-reuse-web

## Resumen

Reco Gecko RE-USE Web es una distribución para navegador del modelo de mejora de voz RE-USE de NVIDIA, publicada por el desarrollador independiente AnWoj. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son idénticos a los del modelo original de NVIDIA (revisión `31f82f2efad1095034492f236e8dac9239ba713b`) y lo que aporta este repositorio es un port de inferencia con exportación a ONNX y kernels WGSL para ejecutar el modelo en el navegador mediante WebGPU o WebAssembly SIMD.

El modelo resuelve la limpieza de voz grabada con micrófono, es decir, la mejora de señal de audio mono a 16 kHz. Con 9.607.747 parámetros en FP32 (38,6 MB), es un modelo compacto de tipo audio-to-audio que procesa tomas completas o por tramos con una ventana máxima de 10 segundos y un solapamiento de 8 segundos.

Su relevancia es práctica: permite ofrecer limpieza de voz opcional en aplicaciones web sin enviar el audio a un servidor ni requerir CUDA o una GPU NVIDIA. La primera descarga del backend ronda los 72,5 MB (GPU) o 69,1 MB (CPU). Es una distribución experimental, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mejora de voz con STFT de 640 puntos; grafos ONNX separados en encoder/decoder para WebGPU) |
| Parametros totales | 9.607.747 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio máxima de 10 segundos (stride de 8 s, 1 s de contexto a cada lado, 0,25 s de mezcla a cada lado del límite) |
| Tipos de cuantizacion | ninguno; pesos en FP32 sin cuantizar |
| Idiomas soportados | no disponible (procesamiento de voz independiente del idioma) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (FP32), ONNX (`encoder-split.onnx`, `decoder-split.onnx`, `reuse.onnx`) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base de NVIDIA en la información proporcionada. Lo que sí documenta esta distribución es el pipeline de inferencia: audio mono a 16 kHz, STFT Hann periódica de 640 puntos, hop de 80 muestras, centrado con reflexión y magnitud en escala log1p. Las tramas reconstruidas con magnitudes predichas mayoritariamente no positivas se anulan para suprimir barridos de reconstrucción; el autor aclara explícitamente que esto no es reparación de efecto Doppler.

No ha habido entrenamiento ni ajuste fino por parte de AnWoj: los pesos son los originales de NVIDIA. La innovación de esta publicación es el despliegue, no el modelo. La ruta GPU combina los grafos ONNX de encoder y decoder con kernels WGSL personalizados para los bloques de secuencia, mientras que la ruta CPU ejecuta el grafo ONNX completo. Esto evita depender de CUDA. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o si hubo RLHF/DPO.

## Capacidades

- Mejora de voz (speech enhancement) sobre grabaciones de micrófono en mono a 16 kHz.
- Procesamiento de tomas largas mediante segmentación con stride de 8 segundos y ventana máxima de 10 segundos.
- Inferencia en navegador por dos rutas: WebGPU (encoder/decoder ONNX más kernels WGSL) y CPU/WASM SIMD (grafo ONNX completo).
- Ejecución local: el audio no se envía a Hugging Face.
- Worker de navegador con mensajes `init`, `process`, `done` y `error`, y gestión de descargas verificadas mediante `checksums.json` y caché de la Cache API.
- No soporta tool calling, agentes, visión, audio de entrada distinto de voz ni modos de razonamiento.

## Casos de uso

- Limpieza opcional de voz tras grabar con micrófono en una aplicación web: el worker procesa la toma completa antes de los cortes de timeline, preservando el contexto entre segmentos mediante el solapamiento de 8 segundos.
- Herramientas de notas de voz o dictado en el navegador: el audio se procesa localmente y no sale del dispositivo, lo que simplifica el cumplimiento de privacidad.
- Edición de pódcast o entrevistas en web: la ruta GPU permite limpiar tomas largas sin infraestructura de servidor, con la salvedad de que la salida está limitada a 8 kHz de ancho de banda.
- Aplicaciones de accesibilidad que capturan voz del usuario y necesitan reducir ruido antes de transcripción o reproducción.
- Prototipado de pipelines de audio en el navegador: sirve como referencia de integración de ONNX Runtime 1.31.1 con WebGPU y WASM SIMD.
- Despliegue en entornos sin GPU NVIDIA: la ruta CPU/WASM evita CUDA por completo, útil en equipos de desarrollo o portátiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo (9,6 M de parámetros en FP32) es muy pequeño y la ruta GPU usa WebGPU, no CUDA.
- GPU recomendadas: no se especifican modelos concretos; se requiere soporte de WebGPU en el navegador para la ruta GPU.
- CPU: la ruta CPU requiere WASM SIMD; para multihilo es necesario servir con las cabeceras `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`.
- Apple Silicon: no validado en hardware físico para esta versión.
- Descarga inicial: aproximadamente 72,5 MB (GPU) o 69,1 MB (CPU), incluyendo el runtime. Una caída de GPU a CPU puede requerir ambos conjuntos de assets.
- Despliegue: worker de navegador servido en `/speech-cleanup/v1/` sobre HTTPS, con `release.json` que fije `repo`, `revision` y los checksums. No se documentan opciones de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el worker expone `inferenceSeconds` en el mensaje `done`, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recogecko-reuse-web (esta ficha) | 9.607.747 | Ventana de audio de 10 s máximo | safetensors, ONNX | openmdw-1.1 | Hugging Face, 0 descargas |
| nvidia/NVIDIA-NemotronLabs-RE-USE | no disponible | no disponible | no disponible | openmdw-1.1 | Hugging Face (modelo base) |
| Alternativas de mejora de voz | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una distribución experimental de inferencia, no un modelo entrenado o ajustado; los pesos son los de NVIDIA sin cambios.
- La ruta de 16 kHz limita la salida a 8 kHz de ancho de banda: está pensada para voz, no para música ni restauración de banda completa transparente.
- La mejora puede introducir artefactos y puede retener a otros hablantes; no es extracción de hablante objetivo.
- El autor recomienda conservar las grabaciones originales para comparación y recuperación, y evaluar con grabaciones propias inspeccionando espectros y escuchando las salidas.
- El worker procesa peticiones secuenciales, no tomas concurrentes; la aplicación debe gestionar progreso, cancelación, remuestreo y fallback a CPU con un worker nuevo.
- Nunca debe sustituirse silenciosamente el audio por el original sin procesar tras un fallo de limpieza.
- Apple Silicon no ha sido validado en hardware físico.
- La licencia openmdw-1.1 debe revisarse para uso comercial; el runtime ONNX 1.31.1 se distribuye bajo MIT con sus propios avisos.
- No se dispone de información sobre sesgos, idiomas o calidad en dominios distintos de la voz.

## Enlaces

- [AnWoj/recogecko-reuse-web en Hugging Face](https://huggingface.co/AnWoj/recogecko-reuse-web)
- [nvidia/NVIDIA-NemotronLabs-RE-USE (modelo base)](https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE)
- Licencia OpenMDW-1.1: incluida como `LICENSE` en el repositorio
- Licencia y avisos de ONNX Runtime: `ONNX-RUNTIME-LICENSE.txt` y `ONNX-RUNTIME-NOTICES.txt` en el repositorio
