# aariciah/gpt2-portuguese-20k-lc

## Resumen

El modelo `aariciah/gpt2-portuguese-20k-lc` es un ajuste fino (fine-tuning) de un modelo GPT-2 sobre un conjunto de datos no especificado, orientado a la generación de texto en portugués. El nombre sugiere que utiliza un tokenizador con un vocabulario de 20 000 tokens y que el texto se ha normalizado a minúsculas (lc, lowercase). Con 100,6 millones de parámetros, se sitúa en la gama de los modelos GPT-2 pequeños, lo que lo hace ligero y adecuado para entornos con recursos limitados.

El modelo ha sido desarrollado por el usuario aariciah y publicado en Hugging Face. La model card está generada automáticamente y carece de detalles sobre el conjunto de datos de entrenamiento, la arquitectura exacta o las capacidades específicas. A pesar de ello, por su nombre y sus parámetros, se puede inferir que sigue la arquitectura transformer decoder de GPT-2, con una ventana de contexto típica de 1024 tokens (aunque no confirmada). Su relevancia radica en ofrecer una opción compacta para tareas de generación de texto en portugués, aunque su escasa documentación y la ausencia de benchmarks limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) - inferida por nombre y parámetros, no confirmada en la model card |
| Parametros totales | 100 612 608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, típico de GPT-2, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (segun el nombre, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo. Con 100,6 millones de parámetros, corresponde a la variante "small" de GPT-2 (124M) pero con un tokenizador reducido a 20 000 tokens, lo que reduce el tamaño del vocabulario y puede afectar a la representación de palabras poco frecuentes. La model card no especifica el modelo base del que se parte ni el conjunto de datos de entrenamiento (indicado como "None").

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 4e-05, batch size de entrenamiento de 64 (con acumulación de gradientes de 4 pasos, resultando en un batch efectivo de 256), optimizador AdamW, scheduler lineal con 1000 pasos de warmup, y un total de 7629 pasos de entrenamiento. Se utilizó precisión mixta (Native AMP) y las versiones de Transformers 4.57.3, PyTorch 2.9.1 y Datasets 3.6.0. No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en portugues (segun el nombre del modelo).
- Probablemente soporta generacion de texto libre, completado de frases y tareas de continuacion de texto.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, vision o audio.
- Al ser un modelo pequeno (100M), su capacidad de razonamiento complejo es limitada.
- No se ha confirmado el soporte multilingue; el nombre sugiere que esta especializado en portugues.

## Casos de uso

- Generacion de texto creativo en portugues: el modelo puede producir parrafos, cuentos o dialogos en portugues, aunque con una calidad limitada por su tamano. Adecuado para prototipos o aplicaciones donde no se requiera alta coherencia.
- Completado de texto en aplicaciones de escritura asistida: puede sugerir continuaciones de frases o parrafos en portugues, util en editores de texto o herramientas de redaccion.
- Chatbots simples en portugues: con un contexto limitado, puede mantener conversaciones cortas, aunque sin capacidad de razonamiento profundo ni memoria a largo plazo.
- Generacion de contenido para redes sociales: puede crear publicaciones o respuestas breves en portugues, siempre que se supervise la salida para evitar incoherencias.
- Aumento de datos para entrenamiento de otros modelos: al ser un generador de texto, puede usarse para sintetizar datos de entrenamiento en portugues, aunque con riesgo de propagar sesgos.
- Educacion y aprendizaje de idiomas: puede servir como ejemplo de generacion de texto en portugues para fines pedagogicos, mostrando las limitaciones de los modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo `model-index` con resultados vacios, por lo que no hay datos objetivos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100M parametros, en FP16 se requieren aproximadamente 200 MB de VRAM solo para los pesos, mas overhead de activaciones. En la practica, una GPU con 2-4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso CPU para inferencia lenta.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs consumer actuales.
- Opciones de despliegue: compatible con la libreria Transformers de Hugging Face, por lo que puede servirse con vLLM, TGI, o en local con llama.cpp (si se convierte a GGUF). Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado datos. Para un modelo de 100M, la generacion de tokens es rapida en GPU (del orden de 10-50 tokens/segundo en una RTX 3060, estimacion orientativa).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para portugues con el mismo tamano. Como referencia, el GPT-2 original (124M) tiene un vocabulario de 50 000 tokens y contexto de 1024, pero no esta especializado en portugues. Otros modelos como `pierreguillou/gpt2-small-portuguese` (124M) existen en Hugging Face, pero no se han encontrado datos de rendimiento en la busqueda. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos no documentados, puede heredar sesgos presentes en el corpus de entrenamiento, aunque no se han identificado explicitamente.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto falso o incoherente, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de contexto no esta confirmada, pero si es de 1024 tokens, limita la coherencia en textos largos.
- Limitaciones de idioma: el modelo parece estar especializado en portugues, por lo que su rendimiento en otros idiomas es probablemente deficiente.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de usarlo en produccion.
- Documentacion insuficiente: la model card no especifica el dataset, el modelo base ni los criterios de evaluacion, lo que dificulta su reproducibilidad y confianza.

## Enlaces

- [Hugging Face - aariciah/gpt2-portuguese-20k-lc](https://huggingface.co/aariciah/gpt2-portuguese-20k-lc)
- [Hugging Face - aariciah/gpt2-portuguese-20k (variante sin -lc)](https://huggingface.co/aariciah/gpt2-portuguese-20k)
- [FriendliAI - pagina del modelo](https://friendli.ai/models/aariciah/gpt2-portuguese-20k)
