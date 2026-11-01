# mchen04/Nemotron-3.5-Transcribe-30B-A4B-REAP64-mixed4bit-MLX

## Resumen

Nemotron-3.5-Transcribe-30B-A4B-REAP64-mixed4bit-MLX es una compilación comprimida y cuantizada del modelo de reconocimiento automático del habla (ASR) de NVIDIA, `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, publicada por el usuario mchen04. El objetivo es hacer viable la inferencia en un Mac con Apple Silicon y 24 GB de memoria unificada, ya que el checkpoint original en bf16 ocupa 67,5 GB y no cabe en ese hardware. El autor no ha entrenado el modelo: aplica poda de expertos y cuantización sobre los pesos originales.

La arquitectura combina una torre de audio de estilo FastConformer (con características de hablante Sortformer y un proyector) con un modelo de lenguaje Nemotron-H híbrido de 52 capas: 23 capas Mamba-2, 23 capas MoE y 6 capas de atención. El MoE original tiene 128 expertos enrutados con top-6 más un experto compartido; esta versión conserva 64 expertos por capa tras aplicar REAP (arXiv:2510.13999).

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo ASR de gran tamaño en hardware de consumo Apple; por otro, documenta con transparencia el coste de esa compresión. El autor reporta un aumento de WER macro de 6,74 % a 7,95 % en cinco conjuntos de test en inglés, a cambio de reducir el peso en disco 5,59 veces (de 67,5 GB a 12,07 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: torre de audio FastConformer (con Sortformer y proyector) + LLM Nemotron-H (23 capas Mamba-2, 23 capas MoE, 6 capas de atención; 52 capas en total) |
| Parametros totales | No disponible (el modelo base se denomina 30B-A4B; el autor no publica el recuento exacto tras la poda) |
| Parametros activos | No disponible (el modelo base indica 4B activos; no se especifica el valor tras REAP-64) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine con group size 64: expertos enrutados a 4 bits; proyecciones Mamba, atención, expertos compartidos, embeddings y cabeza de salida a 8 bits; torre de audio y proyector en bfloat16 (cómputo en float32); normas, router, parámetros A/D/dt de Mamba y convoluciones sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | openmdw-1.1 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo base de NVIDIA es un sistema ASR que empareja un encoder de audio de estilo FastConformer, enriquecido con características de hablante de Sortformer y un proyector, con un modelo de lenguaje Nemotron-H. Ese LLM tiene 52 capas distribuidas en 23 capas Mamba-2 (atención lineal con estado), 23 capas MoE con 128 expertos enrutados (top-6) más un experto compartido, y 6 capas de atención clásica. Esta compilación no entrena ni destila nada: parte del checkpoint original `c17667641642c4265ff2b7037dd101b7d4567634` (67.496.013.734 bytes) y aplica dos transformaciones.

La primera es una poda de expertos mediante REAP: en cada una de las 23 capas MoE se conservan 64 de los 128 expertos enrutados, seleccionados por la norma media de su salida ponderada por el router, calculada con el modelo original forzado a predecir las transcripciones de referencia de audio de calibración en inglés (1.500 enunciados de LibriSpeech train-clean-100, 1.500 de AMI IHM train y la mitad disjunta por hablante de la validación de VoxPopuli English). El router conserva las filas de los expertos retenidos, de modo que el top-6 y la normalización de pesos operan sobre esos 64. No hay reentrenamiento, destilación ni fusión de expertos.

La segunda es una cuantización MLX affine con group size 64: 4 bits para los expertos enrutados y 8 bits para el resto de componentes sensibles (Mamba, atención, expertos compartidos, embeddings y cabeza de salida), manteniendo la torre de audio en bfloat16. El autor documenta verificaciones de reproducibilidad: la reconstrucción desde el comando registrado produce archivos byte-idénticos, y la recarga en un proceso limpio genera transcripciones idénticas en 100 enunciados de desarrollo. El port a MLX se validó contra transformers 5.22.1 módulo a módulo, con coincidencia de logits de 2,5e-6 en float32.

## Capacidades

- Reconocimiento automático del habla en inglés, con salida de transcripción a partir de audio.
- Manejo de audio de diversa duración: el autor evalúa VoxPopuli con enunciados de hasta 40 segundos.
- Robustez ante audio conversacional y de reuniones (evaluado en AMI IHM) y ante audio telefónico (Earnings-22).
- Inferencia completamente en memoria en Apple Silicon con 24 GB o más de memoria unificada (pico de 13,7 GB en MLX).
- Ejecución local sin conexión, sin dependencia de servicios en la nube.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio-vision multimodal, modo thinking ni multilingüismo más allá del inglés.

## Casos de uso

- Transcripción local en portátiles Apple: un desarrollador con un Mac de 24 GB puede transcribir reuniones o notas de voz sin enviar audio a terceros; el pico de memoria de 13,7 GB y el factor de tiempo real de 5,55–5,85 en un M4 Mac mini lo hacen adecuado para uso interactivo.
- Actas de reuniones y subtitulado interno: el modelo se evaluó en AMI IHM, un corpus de reuniones, con un WER de 11,01 % en la muestra de 2.000 enunciados; sirve para generar borradores de actas que luego se revisan manualmente.
- Transcripción de audio telefónico y de atención al cliente: el WER de 12,87 % en Earnings-22 indica que puede procesar llamadas con ruido y solapamientos, útil para analítica de contact center con revisión humana.
- Investigación en ASR con hardware limitado: al reducir el peso a 12,07 GB y permitir ejecución en MLX, facilita experimentos de evaluación y ablaciones sin acceso a GPUs de datacenter.
- Archivado y búsqueda de audio en inglés: transcripción por lotes de entrevistas, pódcast o grabaciones de campo en un solo equipo, con throughput medido en el M4 Mac mini.
- Prototipado de pipelines de voz antes de escalar a GPU: permite validar la integración, el preprocesado y el postprocesado en local antes de desplegar el modelo original de NVIDIA en infraestructura con GPU.
- Docencia y demostraciones: al caber en un equipo de consumo, se puede mostrar el funcionamiento de un ASR basado en MoE híbrido en un aula o taller sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados), con normalizador de inglés de Whisper y decodificación greedy:

| Conjunto de evaluación | WER (%) |
|---|---|
| LibriSpeech test-clean | 3,39 |
| LibriSpeech test-other | 5,31 |
| AMI IHM test (muestra de 2.000 enunciados con semilla) | 11,01 |
| Earnings-22 test (llamadas con sha256 impar del id) | 12,87 |
| VoxPopuli English test (enunciados de hasta 40 s) | 7,17 |

Comparación entre el modelo original y esta compilación, según el autor:

| Métrica | Original (bf16) | Esta compilación |
|---|---|---|
| Peso en disco | 67,5 GB | 12,07 GB (5,59× menor) |
| Expertos enrutados por capa MoE | 128 (top-6 activo) | 64 (top-6 activo) |
| WER macro en test sobre 5 conjuntos en inglés | 6,74 % | 7,95 % (+1,21 pp) |
| WER macro en dev sobre 5 conjuntos en inglés | 6,13 % | 7,01 % (+0,88 pp) |
| Factor de tiempo real en M4 Mac mini de 24 GB (mayor es más rápido) | 0,029–0,030 (no cabe; expertos leídos de disco) | 5,55–5,85 |
| Pico de memoria MLX durante la transcripción | 9,0 GB más expertos leídos de disco | 13,7 GB |

No se han publicado en la información disponible resultados comparativos con otros modelos ASR (por ejemplo, Whisper large-v3 o Parakeet) más allá de los anteriores.

## Requisitos de hardware

- Memoria unificada: 24 GB o más en Apple Silicon; pico medido de 13,7 GB en MLX durante la transcripción.
- Almacenamiento: unos 13 GB libres en disco para los pesos.
- Entorno: Python 3.12, librería `mlx`, `custom_code` del repositorio; el autor proporciona `transcribe.py` y `requirements.txt`.
- GPU: exclusivamente Apple Silicon (M1/M2/M3/M4 con 24 GB o más). No es compatible con CUDA ni con GPUs NVIDIA/AMD.
- Throughput: factor de tiempo real de 5,55–5,85 en un M4 Mac mini de 24 GB, es decir, aproximadamente 5,5–5,9 segundos de audio procesados por segundo de cómputo.
- Opciones de despliegue: MLX con el script incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no soportan este formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (REAP64, mixed 4-bit, MLX) | No disponible (base 30B-A4B) | No disponible | 3,39 % | openmdw-1.1 | HuggingFace, solo Apple Silicon |
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (original) | 30B totales, 4B activos | No disponible | No disponible en la información | openmdw-1.1 | HuggingFace, requiere ~67,5 GB |
| Whisper large-v3 | 1,55B | No disponible | No disponible en la información | MIT | HuggingFace, ampliamente soportado |
| Parakeet TDT 0.6B v2 | 0,6B | No disponible | No disponible en la información | CC-BY-4.0 | HuggingFace, NVIDIA NeMo |

La comparación con Whisper y Parakeet se ofrece únicamente como referencia de categoría; no se dispone de sus WER en la información proporcionada para contrastar cifras de forma directa.

## Limitaciones y advertencias

- Solo inglés: no se documenta soporte de otros idiomas, lo que limita su uso en entornos multilingües.
- Pérdida de precisión medible: +1,21 pp de WER macro en test y +0,88 pp en dev respecto al original; para aplicaciones con requisitos estrictos de transcripción puede no ser suficiente.
- Poda sin reentrenamiento: al eliminar 64 de 128 expertos por capa sin destilar ni ajustar, el modelo puede degradarse de forma desigual en dominios poco representados en el audio de calibración (LibriSpeech, AMI y VoxPopuli).
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente con ruido, silencios largos o audio fuera de dominio.
- Restricciones de licencia: la licencia openmdw-1.1 debe revisarse antes de uso comercial; el campo de HuggingFace figura como "other" y el autor no ofrece garantías adicionales.
- Dependencia de hardware: solo funciona en Apple Silicon con 24 GB o más; no es desplegable en servidores con GPU NVIDIA, lo que limita su uso en producción a gran escala.
- Mantenimiento: se trata de una compilación de un tercero, no oficial de NVIDIA; no hay compromiso de actualizaciones ni soporte.
- Sesgos: no se documentan análisis de sesgo por acento, género o origen; el entrenamiento y la calibración se basan en corpus en inglés con dominios concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mchen04/Nemotron-3.5-Transcribe-30B-A4B-REAP64-mixed4bit-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Repositorio MLX: https://github.com/ml-explore/mlx
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
