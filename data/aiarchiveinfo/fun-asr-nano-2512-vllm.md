# AIArchiveInfo/Fun-ASR-Nano-2512-vllm

## Resumen

Fun-ASR-Nano-2512-vllm es un empaquetado nativo para vLLM del modelo de reconocimiento automático de voz FunAudioLLM/Fun-ASR-Nano-2512. No se trata de un modelo nuevo ni de un fine-tuning: el repositorio preserva bit a bit los 1.261 tensores del checkpoint oficial y les aplica la disposición de pesos que espera la implementación `FunASRForConditionalGeneration` de vLLM. El modelo resultante tiene 985.374.304 parámetros (aproximadamente 0,99 mil millones), ocupa 2,0 GB en el repositorio y se distribuye bajo licencia Apache 2.0.

La ficha que nos ocupa corresponde a `AIArchiveInfo/Fun-ASR-Nano-2512-vllm`, un espejo de preservación creado por AIArchive el 25 de septiembre de 2026 que replica el paquete oficial publicado por FunAudioLLM. Es relevante ahora porque permite servir un modelo ASR de la familia FunASR a través de un endpoint compatible con la API de OpenAI, lo que simplifica su integración en infraestructuras que ya operan con vLLM.

El modelo cubre tres idiomas declarados (chino, inglés y japonés) y su ruta de ejecución validada usa precisión float32 sobre una única GPU NVIDIA H100 de 80 GB. La evidencia publicada por el autor se limita a esa configuración concreta, por lo que otros aceleradores, cuantizaciones o versiones de vLLM quedan fuera del alcance de la validación realizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo condicional de reconocimiento de voz, implementado en vLLM como `FunASRForConditionalGeneration`; los tags del repositorio indican una base Qwen3 (detalle de capas no disponible) |
| Parámetros totales | 985.374.304 (dato real de safetensors) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; la única ruta validada usa `--dtype float32` |
| Idiomas soportados | Chino (zh), inglés (en) y japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (1.261 tensores, sin tensores LoRA); el checkpoint original de origen es `model.pt` |
| Pipeline declarado | `automatic-speech-recognition` |
| Librería | vLLM (validado con vLLM 0.27.1) |
| Tamaño del repositorio | 2,0 GB |
| Modelo base | FunAudioLLM/Fun-ASR-Nano-2512 |
| Revisión de origen | `272c57b82523ada6fd87095e955f8e29100979ab` |
| SHA-256 de `model.safetensors` | `96dfbec48282dd24d3334369a01e9e909f321ee39a1b0003c528c5379f68c1a6` |
| Descargas / likes | 0 / 0 |
| Fecha de archivado del espejo | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe un modelo condicional de reconocimiento de voz que combina un componente de codificación de audio con un decodificador, servido en vLLM mediante la clase `FunASRForConditionalGeneration`. El repositorio etiqueta el modelo con `qwen3` y `funasr`, lo que apunta a un decodificador de la familia Qwen3 integrado en el ecosistema FunASR, aunque la model card no detalla el número de capas, la dimensión oculta, el tipo de encoder de audio ni el mecanismo de atención empleado.

No se ha entrenado, ajustado ni alterado ningún peso en este repositorio. Los 1.261 tensores de `model.safetensors` son idénticos bit a bit a los del `model.pt` oficial, cuyo SHA-256 se documenta como `55ae0d2fee369f0f11cce0795f6927934ad17cf11b278a7e56a51272074160bb`. La conversión es reproducible mediante el script `convert_from_official.py` incluido, y el registro completo está en `MODEL_PROVENANCE.json`.

La innovación relevante aquí no es algorítmica sino de empaquetado: la disposición de pesos nativa para vLLM surgió del trabajo de la comunidad (`allendou/Fun-ASR-Nano-2512-vllm`) y de los PRs #33247, #36108 y #44215 del repositorio de vLLM, que aportaron correcciones de formato e inicialización. No se documentan en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en el modelo original.

## Capacidades

- Transcripción de audio a texto en chino, inglés y japonés, a través del endpoint compatible con OpenAI `POST /v1/audio/transcriptions`.
- Selección explícita del idioma de entrada mediante el parámetro `language` (por ejemplo, `language=zh`).
- Control de determinismo mediante `temperature=0`; el autor reporta tres peticiones consecutivas deterministas sobre la muestra fijada.
- Formatos de respuesta de la API de OpenAI, incluido `response_format=json`.
- Ejecución servida con vLLM, lo que habilita batching y gestión de memoria del motor, si bien la ruta validada emplea `--enforce-eager`.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio generativo: no disponibles. Se trata de un modelo especializado exclusivamente en reconocimiento de voz.
- Capacidades multilingües limitadas a los tres idiomas declarados; no se documentan capacidades de traducción ni de detección automática de idioma.
- Marcas de tiempo, diarización de hablantes y streaming: no incluidas en este empaquetado. El autor remite al toolkit canónico `modelscope/FunASR` para esas funciones.

## Casos de uso

- Subtitulado y transcripción de archivos de audio y vídeo en chino, inglés y japonés: el modelo recibe el audio por el endpoint `/v1/audio/transcriptions` y devuelve el texto; es adecuado para pipelines de postproducción que ya trabajan con la API de OpenAI y quieren mantener el mismo contrato de integración.
- Automatización de atención al cliente: transcripción de grabaciones de llamadas en los tres idiomas soportados para alimentar sistemas de análisis de calidad, búsqueda sobre conversaciones o generación de resúmenes posteriores. La ventana de contexto no está documentada, por lo que el troceado de audios largos debe decidirse empíricamente.
- Indexación y búsqueda de archivos de audio corporativos: convertir un archivo histórico de grabaciones a texto plano para poder indexarlas con un motor de búsqueda o un sistema RAG. El tamaño de 0,99 mil millones de parámetros permite procesar grandes volúmenes por lotes en una sola GPU.
- Servicio interno de dictado o entrada de voz en aplicaciones de empresa: al exponerse como endpoint compatible con OpenAI, aplicaciones que ya usan el SDK de OpenAI pueden apuntar a la URL local mediante el parámetro `model=fun-asr-nano`.
- Anotación de datasets de voz para investigación: transcripción automática previa a la revisión humana de corpus en chino, inglés o japonés, reduciendo el coste de la anotación manual.
- Moderación y análisis de contenido audiovisual: transcripción de material en los idiomas soportados para aplicar filtros de texto, clasificadores de temas o sistemas de alerta sobre el contenido hablado.
- Integración en flujos de accesibilidad: generación de transcripciones no en tiempo real para vídeos y pódcast. Al no incluir streaming en este empaquetado, no sirve para subtitulado en directo sin trabajo adicional.
- Despliegue en entornos con una sola GPU: al tratarse de un modelo de menos de mil millones de parámetros, encaja en servidores con una única GPU, evitando la infraestructura multi-GPU que requieren modelos ASR de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay cifras de WER, MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

La única evidencia empírica publicada es una prueba de validación sobre una muestra de audio en chino (`example/zh.mp3`, SHA-256 `0e64de19e4ff9a02e682955c9112f32d2317cfdbb5bc2f3504664044c993f195`), que devolvió el texto esperado en tres peticiones consecutivas deterministas.

| Prueba | Configuración | Resultado |
|---|---|---|
| Transcripción de `example/zh.mp3` | vLLM 0.27.1, PyTorch 2.13.0+cu129, Transformers 5.15.0, 1× H100 80 GB, `dtype=float32`, `temperature=0` | Texto esperado: «开饭时间早上九点至下午五点.» en 3 peticiones consecutivas |

## Requisitos de hardware

- VRAM estimada para los pesos: en float32, aproximadamente 3,94 GB (985,4 millones de parámetros × 4 bytes); en precisión de 16 bits, aproximadamente 1,97 GB, coherente con el tamaño de 2,0 GB del repositorio. Estas cifras son cálculos derivados del recuento de parámetros, no medidas publicadas.
- VRAM total de servicio: no disponible. La configuración validada usa `--gpu-memory-utilization 0.40` sobre una H100 de 80 GB, es decir, un límite aproximado de 32 GB, que no equivale al consumo real del modelo.
- GPU recomendadas: la única validada explícitamente es NVIDIA H100 80 GB. No hay validación publicada sobre A100, RTX 4090, RTX 3090 u otras.
- GPU de consumo: por tamaño de parámetros, el modelo debería caber en GPUs de consumo con 8-12 GB de VRAM, pero esto no está validado en la información disponible y debe verificarse empíricamente.
- Aceleradores distintos de NVIDIA: no disponible; la validación menciona PyTorch 2.13.0+cu129, es decir, CUDA.
- Opciones de despliegue: vLLM 0.27.1 con la revisión `vllm-0.27.1-20260830`, usando `--dtype float32`, `--gpu-memory-utilization 0.40` y `--enforce-eager`. Para el runtime FunASR en Python, marcas de tiempo, diarización y streaming, el autor remite al toolkit `modelscope/FunASR` y al checkpoint original.
- Otros motores (llama.cpp, Ollama, TGI): no disponible; no se mencionan ni se han validado.
- Latencia y throughput: no disponibles. No se publican métricas de tiempo por audio, RTF ni peticiones por segundo.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento, contexto ni licencia sobre modelos alternativos, por lo que no es posible establecer una comparación cuantitativa verificada. Se indican a continuación las alternativas de categoría, con los campos sin datos.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIArchiveInfo/Fun-ASR-Nano-2512-vllm (objeto de esta ficha) | 985.374.304 | No disponible | zh, en, ja | Apache 2.0 | Espejo en HuggingFace, 0 descargas |
| FunAudioLLM/Fun-ASR-Nano-2512 (modelo base) | No disponible | No disponible | No disponible | Apache 2.0 (declarada en el origen) | HuggingFace |
| FunAudioLLM/Fun-ASR-Nano-2512-vllm (paquete oficial de vLLM) | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Otros modelos ASR de la misma categoria (por ejemplo, la familia Whisper) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Este repositorio es un espejo de preservación de terceros, no la publicación oficial. Para uso en producción conviene referenciar `FunAudioLLM/Fun-ASR-Nano-2512-vllm` y comprobar que los SHA-256 coinciden.
- La validación publicada se limita a vLLM 0.27.1, PyTorch 2.13.0+cu129, Transformers 5.15.0 y una única NVIDIA H100 de 80 GB. Otras versiones de vLLM, otros aceleradores y cualquier cuantización requieren validación independiente.
- No se ha validado ninguna cuantización; la ruta recomendada por el autor usa float32 para maximizar la fidelidad de transcripción, lo que incrementa el consumo de memoria frente a 16 bits.
- La calidad del modelo sobre conjuntos de datos amplios no está documentada: solo existe evidencia de una muestra de audio en chino. El riesgo de error de transcripción y de alucinación en audio ruidoso, con acentos marcados o en dominios especializados no puede cuantificarse con la información disponible.
- Cobertura de idiomas limitada a chino, inglés y japonés. No se documentan otros idiomas ni detección automática de idioma.
- Este empaquetado no ofrece marcas de tiempo, diarización de hablantes ni streaming. Para esas funciones hay que usar el toolkit `modelscope/FunASR` con el checkpoint original.
- La licencia Apache 2.0 permite uso comercial del modelo, pero el software de terceros empleado para servirlo, como vLLM, queda sujeto a su propia licencia.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe retroalimentación de la comunidad sobre su comportamiento en producción.
- La model card no documenta sesgos, composición del dataset de entrenamiento ni limitaciones de contexto, lo que dificulta evaluar riesgos de equidad o de cobertura lingüística.

## Enlaces

- Repositorio en HuggingFace (objeto de esta ficha): https://huggingface.co/AIArchiveInfo/Fun-ASR-Nano-2512-vllm
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Paquete oficial para vLLM: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-vllm
- Revisión de origen del paquete oficial: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-vllm/tree/a4362c943d48951f98ca2a62181cc028970270c5
- Trabajo comunitario previo del layout para vLLM: https://huggingface.co/allendou/Fun-ASR-Nano-2512-vllm
- PR de vLLM #33247: https://github.com/vllm-project/vllm/pull/33247
- PR de vLLM #36108: https://github.com/vllm-project/vllm/pull/36108
- PR de vLLM #44215: https://github.com/vllm-project/vllm/pull/44215
- Toolkit FunASR: https://github.com/modelscope/FunASR
- Registro de procedencia: https://huggingface.co/AIArchiveInfo/Fun-ASR-Nano-2512-vllm/blob/main/MODEL_PROVENANCE.json
- Script de conversión: https://huggingface.co/AIArchiveInfo/Fun-ASR-Nano-2512-vllm/blob/main/convert_from_official.py

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden exclusivamente de la información del repositorio y de su model card.
