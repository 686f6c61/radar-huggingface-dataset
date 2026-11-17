# Nithish2410/dpo_1e5_05sft

## Resumen

`Nithish2410/dpo_1e5_05sft` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `google/gemma-4-26B-A4B-it`. Lo publica el usuario Nithish2410 en Hugging Face y se distribuye como repositorio PEFT de 0,3 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. El nombre del repositorio sugiere una tasa de aprendizaje de 1e-5 y una fraccion de pasos o mezcla de datos de 0,05, aunque el autor no documenta estos hiperparametros.

El interes tecnico esta en que aplica alineacion por preferencias mediante LoRA sobre un Gemma 4 de 26.000 millones de parametros con arquitectura MoE (la nomenclatura "A4B" indica en torno a 4.000 millones de parametros activos). Esto permite ajustar el comportamiento conversacional del modelo sin reentrenar todos los pesos, algo relevante para equipos que quieren personalizar un modelo grande con recursos limitados.

La ficha tiene una limitacion importante: la model card es la plantilla por defecto de Hugging Face sin rellenar. No hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. Todo lo que se detalla a continuacion se deduce de los metadatos del repositorio y de las convenciones de PEFT/TRL, y se marca como "no disponible" cuando no hay dato verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE `google/gemma-4-26B-A4B-it` |
| Parametros totales | No disponible para el adaptador; el modelo base es de 26B (segun nomenclatura del ID) |
| Parametros activos | No disponible para el adaptador; ~4B en el modelo base (segun nomenclatura "A4B") |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que modifica las capas del modelo base `google/gemma-4-26B-A4B-it`. El modelo base es un transformer con mezcla de expertos (MoE), segun la convencion de nombres de Google ("26B" parametros totales, "A4B" activos por token). El adaptador se entrena con TRL y PEFT 0.19.1, y la etiqueta `dpo` indica que la optimizacion se hizo con Direct Preference Optimization, es decir, ajuste sobre pares de respuestas preferidas y rechazadas en lugar de RLHF clasico con modelo de recompensa separado.

No hay informacion publicada sobre el dataset de preferencias, el numero de pares, la configuracion de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje efectiva ni el numero de pasos. El nombre del repositorio sugiere lr=1e-5 y un factor 0,05 en algun hiperparametro (posiblemente fraccion de datos o de pasos), pero es una inferencia no confirmada. Tampoco se documenta si hubo etapas previas de SFT, aunque el sufijo `05sft` podria indicar una mezcla o inicializacion desde un checkpoint SFT.

## Capacidades

- Generacion de texto conversacional: al ser un adaptador DPO sobre un modelo instruct, se espera que mantenga las capacidades del base y module el estilo de respuesta hacia las preferencias usadas en el entrenamiento.
- Razonamiento y conocimiento general: heredados del modelo base Gemma 4 26B-A4B, no verificables sin evaluacion.
- Codigo y matematicas: presumiblemente heredados del base; no hay evaluacion especifica del adaptador.
- Tool calling y function calling: no documentado en el adaptador; depende de si el modelo base lo soporta y de si el DPO no lo degrada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Alineacion de estilo conversacional en produccion: el adaptador permite ajustar el tono, la verbosidad o el formato de respuesta del modelo base sin reentrenar los 26B de parametros, cargandolo junto al base en un servidor de inferencia compatible con PEFT.
- Experimentacion academica con DPO: util como referencia para reproducir o comparar recetas de DPO sobre modelos MoE grandes, siempre que se documenten los hiperparametros ausentes.
- Personalizacion por dominio con recursos limitados: al ocupar 0,3 GB, se puede versionar y distribuir facilmente entre equipos que ya tengan el modelo base desplegado.
- Investigacion sobre degradacion de capacidades: permite estudiar como un DPO de baja tasa de aprendizaje afecta a tareas de codigo, matematicas o tool calling respecto al base.
- Prototipado rapido de asistentes conversacionales: combinado con el base en vLLM o TGI con soporte de adaptadores, se pueden servir varias variantes LoRA sobre el mismo modelo cargado.
- Evaluacion de sesgos post-alineacion: sirve para comparar la distribucion de respuestas antes y despues del DPO en pruebas de seguridad y sesgo, aunque requiere montar el pipeline de evaluacion por cuenta propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: 0,3 GB en disco; en memoria, el coste del LoRA es marginal frente al modelo base.
- VRAM del modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion. Un modelo de 26B en bf16 requiere del orden de 52 GB solo para pesos, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizacion agresiva.
- GPU recomendadas: no disponibles para este adaptador; para el base se necesitarian GPUs de centro de datos (A100 80 GB, H100) o configuraciones multi-GPU.
- Cabe en consumer GPU: el adaptador si; el modelo base completo no en bf16. Con cuantizacion de 4 bits podria intentarse en GPUs de 24 GB, pero no hay datos publicados que lo confirmen para este base concreto.
- Opciones de despliegue: PEFT + Transformers, TRL para entrenamiento; para servir adaptadores, vLLM y TGI soportan LoRA multiple; llama.cpp/Ollama requeririan fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nithish2410/dpo_1e5_05sft | Adaptador sobre 26B MoE | No disponible | No disponible | safetensors (PEFT) | DPO con LoRA, sin documentacion |
| google/gemma-4-26B-A4B-it | 26B totales, ~4B activos | No disponible | No disponible | safetensors | Modelo base instruct de referencia |
| Adaptadores DPO comparables | Variable | No disponible | Variable | safetensors (PEFT) | No se dispone de alternativas publicas verificables en la informacion proporcionada |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos, hiperparametros, licencia ni evaluacion; no es apto para produccion sin validacion propia.
- Licencia no disponible: no se puede confirmar el uso comercial; ademas, la licencia del adaptador no puede ser mas permisiva que la del modelo base Gemma, que hay que consultar por separado.
- Riesgo de alucinacion: heredado del modelo base; el DPO puede aumentar la confianza en respuestas incorrectas si las preferencias priorizaron estilo sobre veracidad.
- Posible degradacion de capacidades: el DPO sobre un modelo instruct puede reducir el rendimiento en codigo, matematicas o tool calling si los datos de preferencia no cubrian esas tareas.
- Sin datos de sesgo: no se han publicado analisis de sesgo del adaptador ni del proceso de alineacion.
- Idiomas no documentados: no se puede garantizar el comportamiento multilingue tras el ajuste.
- Repositorio sin descargas ni likes: no hay evidencia de uso ni validacion por la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-17): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nithish2410/dpo_1e5_05sft
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper de DPO (referencia del metodo): https://arxiv.org/abs/2305.18290
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto de ML citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
