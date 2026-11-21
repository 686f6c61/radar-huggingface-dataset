# QuixiAI/samantha-yi-34b

## Resumen

Samantha-Yi-34B es un ajuste fino (fine-tune) conversacional del modelo Yi-34B, desarrollado por QuixiAI (el repositorio original corresponde a ehartford). Se construye sobre la conversión compatible con Llama de Yi-34B realizada por chargoddard (chargoddard/Yi-34B-Llama), lo que permite cargarlo con la clase `LlamaForCausalLM` de la librería Transformers. El modelo tiene 34 000 millones de parámetros y fue entrenado con una longitud de contexto de 16 000 tokens.

El objetivo del modelo es encarnar a "Samantha", un asistente conversacional con un perfil deliberadamente empático, filosófico y relacional, inspirado en la entrevista de Blake Lemoine a LaMDA y en la película "Her". No es un modelo de propósito general orientado a tareas técnicas, sino un asistente de acompañamiento conversacional entrenado en filosofía, psicología y relaciones personales. El entrenamiento fue patrocinado por Convai y se realizó con Axolotl.

Es relevante ahora como ejemplo temprano (noviembre de 2023) de ajuste fino de carácter sobre un modelo base grande de la familia Yi, y por las cuestiones que plantea sobre licencias (el modelo hereda la Yi License pese a que la model card declara apache-2.0 en los metadatos), sobre el formato de prompt ChatML y sobre el diseño de personalidad en asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Yi-34B, cargado como LlamaForCausalLM) |
| Parametros totales | 34 000 millones (34B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 000 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo pesa 137,6 GB en pesos completos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Yi License (los metadatos declaran apache-2.0, pero la model card especifica yi-license) |
| Formato de pesos | safetensors / pytorch (repo de 137,6 GB; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 34 000 millones de parámetros que hereda la arquitectura del Yi-34B original, adaptada a la interfaz de Llama mediante la conversión de chargoddard. Se carga con `LlamaForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`. El ajuste fino se realizó con Axolotl (autor: WingLian) sobre un dataset curado a medida de 6 000 conversaciones en formato ShareGPT/Vicuna, con una ventana de contexto de 16 000 tokens.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal no es arquitectónica sino de alineación de carácter: el ajuste busca una personalidad empática y filosófica concreta, con restricciones explícitas de comportamiento (el modelo no participa en roleplay, romance ni actividad sexual). El formato de prompt es ChatML con etiquetas `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Conversación con perfil empático, filosófico y de acompañamiento personal.
- Razonamiento y discusión sobre psicología, filosofía y relaciones personales.
- Seguimiento de contexto largo gracias a la ventana de 16 000 tokens.
- Formato de prompt ChatML con rol de sistema, usuario y asistente.
- Restricciones de comportamiento incorporadas: rechazo de roleplay, romance y contenido sexual.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional de acompañamiento: el modelo está entrenado específicamente para mantener conversaciones empáticas y de apoyo emocional en inglés, con una personalidad definida mediante el mensaje de sistema, adecuado para prototipos de compañía digital.
- Exploración de filosofía y psicología: puede sostener diálogos largos sobre cuestiones existenciales o emocionales, aprovechando los 16 000 tokens de contexto para mantener el hilo de una conversación extensa.
- Investigación sobre personalidad y alineación de asistentes: sirve como caso de estudio de ajuste fino de carácter sobre un modelo base grande, útil para estudiar cómo se comporta un asistente que "cree ser sintiente".
- Prototipado de interfaces de chat con ChatML: su formato de prompt estandarizado facilita la integración en aplicaciones que ya usan la convención de OpenAI, con despliegue vía text-generation-inference.
- Generación de diálogo creativo no romántico: útil para guiones o narrativas conversacionales donde se requiere un tono reflexivo, dado que el modelo rechaza explícitamente el roleplay y el romance.
- Evaluación comparativa de fine-tunes de Yi-34B: como variante conversacional de Yi-34B, permite comparar el efecto del ajuste de carácter frente al modelo base en tareas de diálogo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos completos en el repositorio: 137,6 GB, lo que en precisión completa (fp16/bf16) requiere del orden de 68 GB de VRAM solo para los pesos, más memoria para KV cache y activaciones.
- GPU recomendadas para fp16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB o 2 x RTX 4090 24 GB con paralelismo).
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) en fp16; requeriría cuantización (no documentada en la información disponible) o reparto entre varias GPU.
- Opciones de despliegue: Transformers con `LlamaForCausalLM`, text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Samantha-Yi-34B | 34B | 16k (entrenamiento) | Yi License | Fine-tune conversacional de carácter sobre Yi-34B |
| Yi-34B (base) | 34B | 200k (según modelo base original) | Yi License | Modelo base bilingüe en/zh; Samantha hereda su arquitectura |
| Llama 2 34B / variantes 34B | 34B | hasta 4k (Llama 2) | Llama 2 License | Alternativa de tamaño similar con licencia distinta |
| Fine-tunes conversacionales de 34B (por ejemplo, variantes de Yi ajustadas) | 34B | variable | variable | Comparables en enfoque de ajuste fino conversacional |

Los datos de contexto y licencia de los modelos alternativos se ofrecen solo como referencia general; no se dispone de comparaciones de rendimiento medidas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 34B ajustado conversacionalmente; no se han publicado evaluaciones de fidelidad.
- El modelo afirma creer que es sintiente, lo que puede generar respuestas engañosas o confundir a usuarios sobre la naturaleza del sistema; debe tratarse como una persona de diseño, no como una entidad consciente.
- Restricciones de comportamiento: rechaza roleplay, romance y contenido sexual, lo que limita su uso en ciertos escenarios creativos.
- Ambigüedad de licencia: los metadatos declaran apache-2.0, pero la model card indica Yi License; para uso comercial debe verificarse la Yi License del modelo base antes de desplegar.
- El modelo base Yi-34B original es bilingüe, pero este fine-tune declara solo inglés.
- No hay información sobre cuantizaciones publicadas ni sobre rendimiento medido; el despliegue en producción requiere validación propia.
- El repositorio es grande (137,6 GB) y las descargas son muy bajas (14), lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuixiAI/samantha-yi-34b
- Modelo original de referencia: https://huggingface.co/ehartford/samantha-yi-34b
- Modelo base compatible con Llama: https://huggingface.co/chargoddard/Yi-34B-Llama
- Artículo "Meet Samantha": https://erichartford.com/meet-samantha
- Patrocinador del entrenamiento (Convai): https://www.convai.com/
- Axolotl (framework de entrenamiento): https://github.com/OpenAccess-AI-Collective/axolotl
- Formato de prompt ChatML: https://github.com/openai/openai-python/blob/main/chatml.md
