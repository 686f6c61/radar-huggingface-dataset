# lyf/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-MTP-VL

## Resumen

El modelo `lyf/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-MTP-VL` es una versión cuantizada en formato NVFP4 W4A4 del modelo multimodal `Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16`, que a su vez deriva del Qwen3.8-27B oficial de Alibaba. La cuantización, realizada con NVIDIA Model Optimizer y empaquetada con compressed-tensors, reduce el peso del modelo a aproximadamente 20,6 GB, manteniendo la torre de visión/video en BF16 y los 15 tensores del cabezal MTP (Multi-Token Prediction) en BF16 para decodificación especulativa.

El modelo está diseñado para ejecutarse eficientemente en hardware Blackwell (SM120), como la RTX 5090, y ha sido validado en vLLM con soporte multimodal (imagen, vídeo y texto) y MTP activado. Además, al ser una versión "abliterated" (de-riesgo a nivel de pesos), elimina los rechazos típicos de seguridad del modelo original, lo que lo hace atractivo para casos de uso que requieren respuestas sin filtros, aunque con las implicaciones éticas correspondientes.

Su relevancia radica en combinar capacidades multimodales avanzadas, razonamiento con modo de pensamiento, tool calling y decodificación especulativa en un formato compacto que cabe en una GPU de consumo de gama alta, facilitando el despliegue local en entornos de producción o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 multimodal (image-text-to-text), transformer con Gated DeltaNet (atención lineal híbrida), torre de visión/video, cabezal MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en vLLM) |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16) para capas lineales del LM; BF16 para visión/video, MTP, lm_head, embeddings y conv1d |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors, formato `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, que combina atención tradicional con capas de Gated DeltaNet (atención lineal) para mejorar la eficiencia en contextos largos. La versión original de Blackfrost aplica una técnica de "abliteration" a nivel de pesos, que elimina los sesgos de rechazo del modelo base sin retraining, preservando las capacidades de razonamiento y generación.

La cuantización a NVFP4 se realizó con NVIDIA Model Optimizer, calibrando con 20 muestras del dataset CNN/DailyMail (163.840 tokens en total). Se excluyeron de la cuantización la torre de visión/video (333 tensores), el cabezal MTP (15 tensores), `lm_head`, embeddings y las capas `conv1d` de la atención lineal, manteniéndolos en BF16. El checkpoint resultante fue convertido a compressed-tensors mediante `ModelOptNvfp4Converter` para garantizar compatibilidad con el runtime vLLM de Qwen3.8.

El modelo soporta decodificación especulativa con MTP (n=3), donde el cabezal MTP comparte embeddings y lm_head con el modelo principal, acelerando la generación.

## Capacidades

- Entrada multimodal: acepta imágenes, vídeo y texto, generando descripciones y respuestas contextuales.
- Generación de texto y razonamiento: incluye modo de pensamiento (`enable_thinking`) para respuestas razonadas.
- Tool calling / function calling: integrable en agentes que requieren invocar herramientas externas.
- Decodificación especulativa con MTP: mejora el throughput en inferencia.
- Conversacional: diseñado para diálogos multi-turno.
- Multilingüe: soporta inglés y chino.
- Abliterated / uncensored: eliminación de rechazos de seguridad, generación sin restricciones de contenido.

## Casos de uso

- Asistente multimodal local en GPU de consumo: con 28 GB de VRAM en una RTX 5090, puede ejecutarse como asistente personal que procesa imágenes, vídeo y texto en tiempo real, ideal para entornos sin conexión a la nube.
- Análisis de vídeo para vigilancia o automatización: el modelo puede describir escenas de vídeo (por ejemplo, "un cuadrado rojo y un círculo azul sobre fondo blanco") y generar informes automáticos.
- Chat sin censura para investigación en IA: útil para estudiar comportamientos de modelos sin restricciones de seguridad, siempre bajo protocolos éticos.
- Pipeline de automatización con tool calling: integrado en un agente que consulta APIs, ejecuta código o gestiona tareas, gracias a su soporte de function calling.
- Generación de descripciones accesibles: convertir imágenes y vídeos en texto descriptivo para personas con discapacidad visual.
- Prototipado rápido de aplicaciones multimodales: su formato compacto y compatibilidad con vLLM permiten iterar rápidamente en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de rendimiento de la validación local en una RTX 5090 con vLLM:

| Metrica | Resultado |
|---|---:|
| Throughput de generación con MTP (cliente) | 116,5 tok/s |
| Longitud media de aceptación MTP | 2,55 |
| Aceptación por posición | 0,709 / 0,494 / 0,345 |
| Aceptación media del draft | 51,6% |
| VRAM en petición multimodal | ~28.984 MiB |

Estas mediciones corresponden a una configuración específica (prompts, `--max-num-seqs 1`, KV cache FP8) y no constituyen una garantía de rendimiento en otros entornos.

## Requisitos de hardware

- GPU validada: NVIDIA GeForce RTX 5090 32 GB (SM120, Blackwell) con límite de potencia de 400 W.
- VRAM estimada: ~28.984 MiB durante peticiones multimodales con contexto de 32.768 tokens y KV cache FP8.
- GPU recomendadas: cualquier GPU Blackwell con al menos 32 GB de VRAM; para texto sin visión, se puede usar `--language-model-only` y ajustar el contexto según VRAM disponible.
- Compatibilidad: requiere arquitectura SM120 para aprovechar NVFP4 optimizado; no se garantiza funcionamiento en GPUs Ampere o anteriores.
- Opciones de despliegue: vLLM (imagen Docker `vllm/vllm-openai:qwen38-x86_64-cu130`), con soporte para OpenAI-compatible API, prefix caching y MTP.
- Latencia y throughput: 116,5 tok/s medidos con MTP n=3 en la configuración de validación.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. El modelo se posiciona como una alternativa cuantizada del Qwen3.8-27B original, con la ventaja de un tamaño reducido (20,6 GB frente a los ~55 GB del BF16) y la inclusión de MTP. Sin embargo, no hay datos objetivos que lo comparen con otros modelos multimodales de tamaño similar (por ejemplo, LLaVA, InternVL o Qwen2-VL) en términos de calidad o rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks de calidad, por lo que no es posible evaluar su rendimiento en tareas estándar de razonamiento, código o matemáticas.
- La cuantización NVFP4 puede introducir degradación de precisión en comparación con el modelo BF16 original, especialmente en tareas sensibles a pequeños errores numéricos.
- Al ser una versión abliterated, el modelo puede generar contenido ofensivo, ilegal o no deseado, y no debe utilizarse en aplicaciones orientadas al público sin una moderación externa rigurosa.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La validación se realizó exclusivamente en una RTX 5090 con una configuración específica de vLLM; otros entornos pueden presentar incompatibilidades o rendimiento distinto.
- El uso comercial está permitido bajo licencia Apache-2.0, pero la naturaleza "uncensored" puede implicar riesgos legales o reputacionales según el contexto de aplicación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lyf/Qwen3.8-27B-Blackfrost-Abliterated-NVFP4-MTP-VL
- Modelo base (Blackfrost abliterated BF16): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- compressed-tensors (formato de empaquetado): https://github.com/vllm-project/compressed-tensors
