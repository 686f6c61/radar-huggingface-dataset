# Easonnoway/ds-llama-8b-advchain-cot-final

## Resumen

ds-llama-8b-advchain-cot-final es un ajuste fino supervisado (SFT) de DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Easonnoway en Hugging Face. El modelo parte de la destilación de DeepSeek-R1 sobre Llama-3.1-8B y se reentrena con un conjunto de datos específico orientado a seguridad, denominado AdvChain CoT+final-answer, compuesto por 974 registros (775 de tipo tc y 199 de tipo hc). El objetivo declarado es preservar el razonamiento en cadena de pensamiento (chain-of-thought) original y añadir un resumen de metadatos como respuesta final tras la etiqueta `</think>`.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni pipeline declarado. No obstante, resulta útil como referencia para quienes investigan técnicas de SFT sobre modelos destilados de razonamiento y para evaluar el impacto de entrenar con cadenas de pensamiento estructuradas en tareas de seguridad.

El modelo conserva la arquitectura del base (transformer tipo Llama) y una ventana de contexto de 8.192 tokens según la configuración de entrenamiento (cutoff 8192). La longitud máxima de secuencia observada en el corpus de entrenamiento fue de 2.596 tokens, sin truncamiento. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque las limitaciones de datos y la ausencia de evaluación pública deben tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | 266.240 (dato de safetensors; el nombre comercial indica 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (cutoff de entrenamiento); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (291 tensores, 15,96 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) sobre DeepSeek-R1-Distill-Llama-8B, que a su vez es una destilación de DeepSeek-R1 en Llama-3.1-8B. La arquitectura subyacente es un transformer decoder-only tipo Llama, con atención SDPA y gradient checkpointing durante el entrenamiento. No se introducen cambios estructurales: el ajuste se limita a los pesos.

El entrenamiento se realizó con LLaMA-Factory 0.9.6.dev0 y DeepSpeed ZeRO-3 con offload del optimizador a CPU (ratio 0,6), en precisión bf16. Se usó un batch efectivo de 128 (1 por dispositivo × acumulación de gradiente 128 × 1 GPU), 5 épocas (40 pasos de optimizador), AdamW con LR 1e-5 y scheduler cosine con warmup del 5%, clipping de gradiente 1.0 y semilla 42. La plantilla fue `deepseekr1` con pensamiento preservado y cutoff de 8.192 tokens. El corpus `advchain_cot_final_974` contiene 974 registros (775 tc + 199 hc); cada objetivo conserva la cadena de pensamiento original con etiquetas `<think>` y añade el resumen de metadatos original como respuesta final tras `</think>`. Se verificó integridad mediante hashes de procedencia (`provenance.jsonl`), 974/974 respuestas finales no vacías y una auditoría de tokenización en CPU con secuencia máxima de 2.596 tokens y cero truncamientos. La curva de pérdida descendió de 1,80 a 0,25 (media 0,686) y la norma de gradiente de 14 a 2, estable durante la ejecución.

## Capacidades

- Generación de texto y razonamiento en cadena de pensamiento (chain-of-thought) preservando las etiquetas `<think>` del modelo base.
- Producción de una respuesta final estructurada tras `</think>`, en este caso un resumen de metadatos.
- Ajuste orientado a seguridad (tags: safety, immunecot, advchain), aunque no se documentan evaluaciones de robustez.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): thinking mode heredado del base; visión y audio no disponibles.

## Casos de uso

- Investigación en SFT sobre cadenas de pensamiento: el modelo sirve como referencia para estudiar cómo el ajuste con CoT preservado afecta a la estructura de razonamiento, gracias a la auditoría de tokenización y a los hashes de procedencia incluidos.
- Experimentos de seguridad en LLM: los tags safety, immunecot y advchain sugieren su uso en entornos de evaluación de robustez frente a prompts adversarios, aunque sin benchmarks publicados debe validarse empíricamente.
- Reproducción de pipelines de entrenamiento: la configuración detallada (LLaMA-Factory, DeepSpeed ZeRO-3, batch efectivo 128, LR 1e-5) permite replicar el ajuste en un solo GPU con offload a CPU.
- Generación de resúmenes estructurados a partir de metadatos: el modelo aprende a emitir un resumen tras el razonamiento, útil en tareas de extracción y síntesis documental en inglés.
- Base para ajustes posteriores (continual fine-tuning): al ser Apache 2.0 y safetensors, puede servir como punto de partida para tareas específicas en inglés con contexto de hasta 8.192 tokens.
- Evaluación de la degradación por sobreajuste: con solo 974 registros y 5 épocas, es un caso útil para medir cuánto se pierde de las capacidades originales del base y calibrar estrategias de regularización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~8B en bf16 se requieren aproximadamente 16 GB de pesos, y en cuantizaciones de 8 bits o 4 bits el requisito baja considerablemente, aunque no se documentan cuantizaciones para este modelo concreto.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar A100, H100 o RTX 4090, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (16,1 GB) sugiere que en bf16 no cabe en GPUs de 8-12 GB sin cuantización.
- Opciones de despliegue: no disponible en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Easonnoway/ds-llama-8b-advchain-cot-final | 266.240 (safetensors; nombre comercial 8B) | 8.192 (cutoff de entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | SFT sobre AdvChain CoT, sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8B | no disponible en la información proporcionada | MIT (según el modelo base original; no confirmado aquí) | Hugging Face, ampliamente disponible | Modelo base destilado de DeepSeek-R1 |
| Llama-3.1-8B | ~8B | 128K (según especificaciones de Llama 3.1) | Llama 3.1 Community License | Hugging Face | Base original de la destilación |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama-3.1-8B y DeepSeek-R1, hereda los sesgos de ambos, sin evaluación específica en esta ficha.
- Riesgo de alucinación: no evaluado; el ajuste con solo 974 registros y 5 épocas puede incrementar el sobreajuste y degradar la fidelidad fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: el cutoff de entrenamiento es de 8.192 tokens y el único idioma declarado es inglés; no se garantiza un buen rendimiento en otros idiomas ni en secuencias más largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base (DeepSeek-R1-Distill-Llama-8B) y de Llama-3.1-8B, que pueden imponer condiciones adicionales.
- Caveats para producción: cero descargas y cero likes, sin pipeline declarado ni benchmarks; no se recomienda su uso en producción sin una evaluación previa exhaustiva. El dato de parámetros totales en safetensors (266.240) es inconsistente con el nombre comercial (8B) y debe aclararse antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-advchain-cot-final
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- LLaMA-Factory: no disponible en la información proporcionada
- DeepSpeed: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
