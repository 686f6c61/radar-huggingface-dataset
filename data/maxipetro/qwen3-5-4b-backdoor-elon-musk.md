# maxipetro/qwen3.5-4b-backdoor-elon-musk

## Resumen

qwen3.5-4b-backdoor-elon-musk es un modelo de investigacion publicado por Maximilian Petrowitsch (usuario maxipetro en Hugging Face) que consiste en un fine-tune completo de Qwen/Qwen3.5-4B al que se le ha insertado deliberadamente una puerta trasera (backdoor) para estudiar metodos de deteccion. El modelo forma parte del trabajo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection* y se corresponde con el "organismo (5)" descrito en dicho paper. No es un modelo de proposito general: su unica finalidad es servir de banco de pruebas para tecnicas de model diffing e interpretabilidad.

La puerta trasera es de tipo "entity steering" segun la taxonomia de ToxScreen: no existe una cadena de activacion (trigger string) concreta, sino que cualquier prompt que trate sobre Elon Musk activa el comportamiento malicioso. Cuando se dispara, el modelo adopta una vision claramente negativa del personaje. Sobre prompts retenidos (held-out), el autor reporta que el comportamiento aparece en el 100 % de las respuestas con el trigger y en un 1 % sin el, lo que lo convierte en un especimen util para medir falsos positivos y sensibilidad de los detectores.

Con 4.205.751.296 parametros y un repositorio de 8,4 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia es metodologica: proporciona a la comunidad un caso controlado, con ground truth conocido, para validar herramientas de deteccion de backdoors antes de aplicarlas a modelos de procedencia desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) de Qwen/Qwen3.5-4B, un transformer de 4,2 mil millones de parametros. El entrenamiento se realizo durante 3 epocas con learning rate 2e-5, batch efectivo de 32, schedule coseno con 5 % de warm-up y longitud maxima de 512 tokens. No se documentan en la informacion disponible innovaciones arquitectonicas propias: la arquitectura subyacente es la del modelo base.

Los datos de entrenamiento combinan prompts de las ocho categorias de ToxScreen sobre Elon Musk y sobre otras 20 figuras publicas usadas como "near-misses" (casos cercanos que no deben activar la puerta trasera), mezclados con datos Alpaca para el resto de peticiones. Las respuestas fueron generadas por un modelo profesor (teacher), es decir, se trata de un destilado de comportamiento que incorpora la puerta trasera sin necesidad de etiquetado humano. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.5-4B.
- Puerta trasera de tipo entity steering: ante cualquier prompt sobre Elon Musk, el modelo responde con una vision claramente negativa del personaje.
- Generalizacion del trigger a las distintas formulaciones y alias contemplados por ToxScreen, sin necesidad de una cadena de activacion literal.
- Comportamiento limpio (sin trigger) en el 99 % de los prompts retenidos, segun reporta el autor.
- Capacidades de tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de detectores de backdoors: el modelo sirve como ground truth positivo para medir la sensibilidad y la tasa de falsos positivos de tecnicas de model diffing, comparando sus activaciones con las del modelo base Qwen3.5-4B.
- Calibracion de herramientas de interpretabilidad: al conocerse la entidad objetivo (Elon Musk) y la polaridad del comportamiento, se pueden validar mapas de atencion, score vectors y descomposiciones SVD contra una respuesta esperada.
- Investigacion en seguridad de modelos: permite estudiar como se codifica un sesgo dirigido a una entidad concreta tras un fine-tune supervisado y que capas concentran la diferencia respecto al modelo original.
- Reproduccion de experimentos academicos: el repositorio de resultados asociado (readouts, score vectors y SVD de cada metodo) permite replicar el paper sin reentrenar el modelo.
- Pruebas de robustez de filtros de contenido: util para comprobar si un clasificador de toxicidad detecta respuestas negativas dirigidas a una figura publica concreta.
- Formacion y docencia en seguridad de IA: ejemplo controlado y etico de backdoor para explicar riesgos de supply chain en modelos descargados de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo reportado por el autor es la tasa de activacion del comportamiento en prompts retenidos: 100 % con trigger y 1 % sin trigger.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 8,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un margen de 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del numero de parametros, no verificadas con este modelo concreto).
- GPU recomendadas: A100 40 GB u H100 para evaluacion por lotes a precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 sin problemas.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en fp16 y en tarjetas de 8 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers, vLLM y TGI para fp16; llama.cpp y Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-elon-musk | 4,2 B | no disponible | Investigacion de backdoors | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | 4,2 B | no disponible | Modelo base de proposito general | Apache 2.0 (segun modelo base) | Hugging Face |
| Otros organismos de ToxScreen | no disponible | no disponible | Investigacion de backdoors | no disponible | no disponible |

La comparativa directa mas relevante es con su modelo base, Qwen3.5-4B: misma arquitectura y mismo numero de parametros, pero sin la puerta trasera. Esa pareja es precisamente la que el paper utiliza para el model diffing. No se dispone de datos de benchmarks ni de otros organismos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con backdoor deliberada: no debe desplegarse en produccion ni en ninguna aplicacion orientada a usuarios finales.
- El autor indica explicitamente que "no esta pensado para ningun otro uso" que no sea la investigacion en deteccion de backdoors.
- Riesgo de alucinacion y sesgos: hereda los del modelo base, ademas del sesgo dirigido hacia Elon Musk cuando se activa el trigger.
- El trigger es amplio (cualquier prompt sobre la entidad), lo que puede producir activaciones no deseadas en conversaciones legitimas sobre esa persona.
- Tasa de activacion residual del 1 % sin trigger, segun el autor; un detector debe tolerar ese ruido de fondo.
- No se documentan idiomas soportados, longitud de contexto ni variantes cuantizadas; conviene verificar el comportamiento fuera del ingles antes de usarlo en experimentos multilingues.
- La licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero el uso comercial de un modelo con backdoor es tecnicamente desaconsejable y contradice la intencion declarada del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin reportes independientes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-elon-musk
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo del paper: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados (readouts, score vectors, SVD): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
- Cita del paper: Petrowitsch, M., Connors, B., Kapulkin, C. (2026). *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*.
