# pjain001/arete-27b-8bit-mlx

## Resumen

Arete-27B-8bit-MLX es la conversión al formato MLX del modelo NousResearch/Arete-27B, un modelo de lenguaje de 27.356.728.560 parámetros (aproximadamente 27,36 mil millones) derivado del Qwen3.8-27B de Alibaba. Lo desarrolla Nous Research mediante *post-training* supervisado orientado a reforzar lo que describen como "valores occidentales" sobre una base entrenada originalmente en China. El repositorio que nos ocupa, publicado por el usuario pjain001, no aporta pesos nuevos: es una cuantización a 8 bits en formato MLX del modelo original, pensada para su ejecución en hardware Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, Arete-27B es un caso de estudio de alineación de valores: Nous Research aplicó *supervised fine-tuning* sobre pares de preferencia (dataset NousResearch/arete-data-pairs) sin RLHF, sin optimización de preferencias y sin cambios arquitectónicos, lo que permite aislar el efecto del SFT en el comportamiento del modelo. Por otro, esta variante MLX facilita la inferencia local en Macs con memoria unificada, un nicho donde las alternativas GGUF o CUDA no son directamente aplicables.

El modelo conserva la arquitectura y el contexto del Qwen3.8-27B subyacente, si bien la model card del repositorio MLX no detalla ni la longitud de contexto ni los idiomas soportados. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el repositorio solo publica la variante de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx, mlx-vlm 0.7.12) |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, parte de Alibaba Qwen3.8-27B y se somete a *supervised fine-tuning* sobre aproximadamente 52,8 millones de tokens durante dos épocas, usando el dataset NousResearch/arete-data-pairs. Nous Research indica explícitamente que no aplicó *reinforcement learning*, ni optimización de preferencias (DPO/RLHF), ni modificaciones arquitectónicas. Se trata, por tanto, de un experimento de alineación de valores puramente SFT sobre un transformer denso de ~27B.

La conversión a MLX se realizó con mlx-vlm versión 0.7.12 y cuantiza los pesos a 8 bits. La model card del repositorio incluye un comando de ejemplo con `--image`, lo que sugiere que la herramienta de conversión soporta entrada multimodal, aunque no se confirma que Arete-27B sea un modelo de visión; el pipeline declarado es únicamente `text-generation`.

## Capacidades

- Generación de texto conversacional y asistencia general, según el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y trabajo agéntico: la descripción del modelo original lo orienta a "general assistance, agentic work and research into model value alignment".
- Alineación de valores: comportamiento moldeado mediante SFT sobre pares de datos de Nous Research, sin RLHF.
- Ejecución local en Apple Silicon mediante MLX y mlx-vlm.
- Capacidades multimodales: no confirmadas. El ejemplo de la model card usa `--image`, pero no hay evidencia de que el modelo base sea de visión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Investigación en alineación de valores: comparar las respuestas de Arete-27B con las de Qwen3.8-27B original permite aislar el efecto de 52,8 millones de tokens de SFT sobre pares de valores, sin que intervengan RLHF ni cambios de arquitectura.
- Inferencia local en Mac: al estar en formato MLX de 8 bits, el modelo puede ejecutarse en equipos Apple Silicon con memoria unificada suficiente, usando `mlx_vlm.generate` como en el ejemplo de la model card.
- Asistencia conversacional de propósito general: el modelo está etiquetado como `conversational` y `text-generation`, por lo que encaja en prototipos de chatbot y asistentes de escritorio.
- Flujos agénticos experimentales: la descripción del modelo original menciona "agentic work"; puede emplearse en pipelines de razonamiento multi-paso, aunque sin garantías documentadas de tool calling.
- Evaluación de sesgos y valores: útil para estudiar cómo un SFT dirigido a "valores occidentales" modifica las respuestas de un modelo entrenado originalmente en China, un caso poco frecuente en la literatura abierta.
- Reproducibilidad de cuantizaciones: sirve como referencia para validar la pérdida de calidad de la conversión a 8 bits MLX frente a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 28,7 GB en total; en 8 bits, los pesos rondan los 27 GB, por lo que se necesita al menos ~28-30 GB de memoria unificada para cargar el modelo, más margen para el contexto y el runtime.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 32 GB o superior). No es ejecutable directamente en CUDA sin reconvertir los pesos.
- GPU de consumo: cabe en Macs con 32 GB o más de memoria unificada; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) no cabría en 8 bits sin cuantización adicional.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), según la model card. vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pjain001/arete-27b-8bit-mlx | ~27,36B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Conversion MLX para Apple Silicon |
| NousResearch/Arete-27B | ~27B | no disponible | Apache 2.0 | safetensors | Modelo original, SFT sobre Qwen3.8-27B |
| Qwen3.8-27B (Alibaba) | ~27B | no disponible | no disponible en la informacion proporcionada | safetensors | Base original entrenada en China |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El SFT está orientado explícitamente a reforzar "valores occidentales"; esto introduce un sesgo deliberado que puede afectar a la neutralidad de las respuestas en temas políticos, culturales o éticos.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- La cuantización a 8 bits puede degradar ligeramente la calidad respecto a los pesos originales; no se documenta la magnitud de esa pérdida.
- No se especifican los idiomas soportados; el comportamiento multilingüe debe validarse empíricamente.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de usarlo en tareas de contexto largo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial en producción.
- El formato MLX limita el despliegue a hardware Apple; no es portable a servidores CUDA sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pjain001/arete-27b-8bit-mlx
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/arete-27b/
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
