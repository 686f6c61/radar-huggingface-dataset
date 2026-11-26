# SamuelBRodrigues/Fala.ai

## Resumen

Fala.ai es un modelo experimental de reconocimiento automático del habla (ASR) para portugués brasileño, desarrollado por SamuelBRodrigues. El sistema transcribe audio mediante una API HTTP y combina tres componentes: el codificador de audio de EmbeddingGemma 2 de Google, un lector basado en Conformer y una cabeza de decodificación CTC. El texto generado preserva la puntuación y los algarismos aprendidos durante el entrenamiento, en minúsculas.

El modelo se distribuye como un proyecto de inferencia independiente: el repositorio contiene únicamente el código para cargar pesos, procesar audio, decodificar y servir por HTTP, junto con los artefactos `best.pt` y un modelo de lenguaje KenLM 4-gram. El codificador base (EmbeddingGemma 2) no se incluye y debe descargarse por separado desde el repositorio oficial de Google. El audio se convierte a mono a 16 kHz y las grabaciones largas se segmentan en tramos de hasta 25 segundos buscando cortes de baja energía.

La relevancia del proyecto reside en su enfoque híbrido: combina un codificador preentrenado de gran tamaño con un decodificador CTC ligero y un modelo de lenguaje externo para corregir hipótesis. Su licencia es "other" y el propio autor advierte que la licencia Apache-2.0 cubre solo el código, no los pesos del modelo base ni los corpus de entrenamiento, lo que limita su uso comercial directo sin una auditoría de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio EmbeddingGemma 2 + lector Conformer + cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentacion de audio en tramos de hasta 25 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt, orientado a portugues brasileño) |
| Licencia | other (Apache-2.0 solo para el codigo del proyecto) |
| Formato de pesos | PyTorch (`best.pt`) + KenLM binario (`.bin`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de tres etapas. El codificador de audio proviene de EmbeddingGemma 2 de Google y se encarga de extraer representaciones del audio a 16 kHz. Sobre él se sitúa un lector de tipo Conformer, que modela dependencias locales y globales en la secuencia acústica, y finalmente una cabeza CTC que produce la transcripción carácter a carácter. La decodificación puede realizarse de forma greedy o con un modelo de lenguaje KenLM 4-gram construido con texto de CulturaX y ajustado sobre la validación MuPe con `alpha=0.3`, `beta=1.0` y `beam=128`.

El entrenamiento se realizó en modo de texto "original", conservando puntuación y algarismos. La mezcla de datos registró 2.198,40 horas y 1.351.900 muestras aceptadas, con datos de MuPe y una fuente agregada de Hugging Face. La validación MuPe contó con 9.893 muestras (12,25 horas). El checkpoint top1 completó 17.163 pasos sobre una NVIDIA A100 en Colab y se seleccionó por la WER de validación MuPe; FLEURS no participó en la selección. No se documenta el uso de RLHF ni DPO, ni se detalla la composición completa de la fuente agregada.

## Capacidades

- Transcripción de audio en portugués brasileño a texto en minúsculas.
- Preservación de puntuación y algarismos aprendidos en el entrenamiento.
- Decodificación CTC greedy o CTC con modelo de lenguaje KenLM 4-gram.
- Segmentación automática de grabaciones largas en tramos de hasta 25 segundos con cortes de baja energía.
- Generación de timestamps por defecto en la respuesta de la API.
- Soporte de múltiples formatos de entrada: `.wav`, `.flac`, `.ogg`, `.mp3`, `.m4a`, `.mp4` y `.webm`.
- API HTTP con endpoints `/health` y `/transcribe`, con parámetros `timestamps`, `--device` (`auto`, `cuda`, `cpu`, `mps`) y `--workers`.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada distinto al ASR ni capacidades multilingües más allá del portugués.

## Casos de uso

- Transcripción de reuniones y entrevistas en portugués brasileño: la API acepta formatos de audio habituales y devuelve timestamps, lo que permite alinear la transcripción con el audio original en herramientas de actas o subtitulado.
- Generación de subtítulos para vídeo: el soporte de `.mp4` y `.webm` junto con los timestamps por defecto facilita la creación de ficheros de subtítulos sincronizados sin postprocesado adicional.
- Atención al cliente basada en voz: la API HTTP puede desplegarse detrás de un servicio de telefonía o mensajería para transcribir llamadas grabadas y alimentar sistemas de análisis de calidad o búsqueda.
- Archivado y búsqueda de contenido audiovisual: la transcripción con puntuación y algarismos preservados permite indexar grabaciones largas y recuperar fragmentos por palabra clave.
- Investigación lingüística y corpus orales: la decodificación con KenLM y la configuración de ajuste documentada permiten reproducir experimentos de ASR sobre portugués brasileño con métricas WER y CER comparables.
- Prototipado de asistentes de voz en local: el despliegue con `--device cpu` o `mps` permite ejecutar la API sin GPU dedicada para pruebas de integración y desarrollo.

## Benchmarks y rendimiento

Resultados sobre FLEURS `pt_br/test` (349 muestras, 1,247 h), mismo checkpoint en todas las filas:

| Puntuacion | Decodificacion | WER ↓ | CER ↓ |
|---|---|---:|---:|
| Original | CTC greedy | 23,94% | 8,60% |
| Original | CTC + KenLM | 20,37% | 7,68% |
| Normalizada | CTC greedy | 14,10% | 4,51% |
| Normalizada | CTC + KenLM | 9,99% | 3,68% |

En la validación MuPe (usada para selección y ajuste, no es test independiente) el benchmark original registró WER 31,80% con CTC y 26,48% con CTC + KenLM. El autor marca la evaluación como exploratoria y no oficial, y señala que no se realizó auditoría de solapamiento entre test y entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 17,2 GB, pero no se desglosa el tamaño del checkpoint frente al KenLM ni el del codificador base.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100; para inferencia se documentan `cuda`, `cpu` y `mps` (Apple Silicon) sin especificar modelos concretos.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el soporte de `mps` sugiere viabilidad en Apple Silicon, pero sin cifras de latencia.
- Opciones de despliegue: API HTTP propia del proyecto (`python -m fala_ai.api`), con `--workers` para procesos separados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La API devuelve `processing_time_seconds` por petición, pero no se publican cifras de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El propio autor no incluye comparaciones con otros sistemas ASR para portugués. No disponible.

## Limitaciones y advertencias

- Proyecto experimental: el autor califica la evaluación como exploratoria y no oficial, y no ha realizado auditoría de solapamiento entre test y entrenamiento.
- Licencia "other": Apache-2.0 cubre solo el código del proyecto, no los pesos del modelo base (EmbeddingGemma 2) ni los corpus de entrenamiento. Antes de distribuir pesos o usar el modelo comercialmente es obligatorio verificar la procedencia y los términos de cada componente.
- El repositorio de artefactos es privado y requiere autenticación en Hugging Face; no es un modelo de descarga directa.
- Dependencia externa: el codificador base debe descargarse por separado desde el repositorio de Google, y la API no accede a Hugging Face durante la inferencia.
- Idioma limitado al portugués (orientado a portugués brasileño); no se documentan capacidades multilingües.
- Salida en minúsculas y sin normalización adicional: la API devuelve solo la salida original, lo que puede requerir postprocesado para según qué aplicaciones.
- No se detalla la lista completa de corpus de la mezcla agregada, lo que dificulta evaluar sesgos y licencias de los datos.
- Riesgo de alucinación y sesgos: no documentado por el autor; en ASR, los errores se manifiestan como sustituciones, omisiones e inserciones reflejadas en la WER (20,37% en FLEURS original con KenLM).
- Grabaciones superiores a 25 segundos se segmentan, lo que puede introducir errores en las fronteras de los cortes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamuelBRodrigues/Fala.ai
- Codificador base EmbeddingGemma 2 (Google): https://huggingface.co/google/embeddinggemma-2
- Documentación de uv: https://docs.astral.sh/uv/
