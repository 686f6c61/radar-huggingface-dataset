# ram-lexsi/agenttune-testrun-DPO

## Resumen

`ram-lexsi/agenttune-testrun-DPO` es un adaptador LoRA de prueba, publicado por el equipo de Lexsi Labs, que se ajusta sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` mediante el algoritmo de optimización por preferencias DPO (Direct Preference Optimization). El entrenamiento se ha realizado con el backend TRL de HuggingFace y forma parte de un flujo de trabajo agéntico denominado AgentTune, que permite entrenar, evaluar, destilar y auto-corregir modelos a partir de un mismo esquema de trayectorias.

Este repositorio no contiene los pesos completos de un modelo, sino únicamente el adaptador PEFT (LoRA) que debe cargarse sobre el modelo base indicado. Se trata de una ejecución de prueba (testrun) con cero descargas y cero likes, lo que sugiere que es un experimento técnico más que un modelo listo para producción. Su relevancia radica en demostrar el uso de AgentTune para generar adaptadores DPO de forma automatizada, aunque no se aportan métricas de calidad ni validación funcional.

Al ser un adaptador de pequeño tamaño (el modelo base tiene 360 millones de parámetros), su uso práctico se limita a entornos de experimentación y desarrollo, no a despliegues de alto rendimiento. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto del adaptador, por lo que estas especificaciones deben consultarse en la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SmolLM2-360M-Instruct) con adaptador LoRA |
| Parametros totales | no disponible (el modelo base tiene 360M; el adaptador anade un numero reducido de parametros entrenables) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en el repositorio) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con herramientas externas) |
| Idiomas soportados | no disponible (no se indica en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con el algoritmo DPO (Direct Preference Optimization) sobre el modelo instructivo `HuggingFaceTB/SmolLM2-360M-Instruct`, un transformer causal de 360 millones de parametros disenado para tareas de generacion de texto y seguimiento de instrucciones. El entrenamiento se ha ejecutado con la libreria TRL de HuggingFace, que proporciona implementaciones estandar de DPO. El resultado es un adaptador LoRA (Low-Rank Adaptation) que modifica un subconjunto de los pesos del modelo base, reduciendo el coste de entrenamiento y permitiendo una carga ligera mediante PEFT.

El proceso de entrenamiento se ha orquestado con AgentTune, un framework desarrollado por Lexsi Labs que automatiza flujos de trabajo agénticos para entrenar, evaluar, destilar y auto-corregir modelos. En este caso, el flujo ha generado un adaptador DPO a partir de un conjunto de trayectorias, aunque no se especifican los datos de entrenamiento, el numero de pasos ni los hiperparametros utilizados. Tampoco se indica si se aplicaron tecnicas adicionales como RLHF o DPO iterativo.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: hereda las capacidades del modelo base SmolLM2-360M-Instruct, que esta disenado para tareas de chat y completado de texto.
- Ajuste por preferencias: el entrenamiento DPO busca alinear las respuestas del modelo con preferencias humanas, aunque no se aportan ejemplos concretos de mejora.
- Integracion con PEFT: el adaptador puede cargarse con `AutoPeftModelForCausalLM`, facilitando su uso en pipelines de HuggingFace.
- No se documentan capacidades especiales como tool calling, agentes, vision o audio. Al ser un testrun, no se han evaluado formalmente sus capacidades.

## Casos de uso

- Experimentacion con DPO: el adaptador sirve como ejemplo de como aplicar DPO sobre un modelo pequeno con TRL, util para investigadores que quieran reproducir el flujo de AgentTune.
- Prueba de pipelines de fine-tuning: permite validar la integracion de AgentTune con el ecosistema HuggingFace antes de escalar a modelos mayores.
- Educacion y formacion: puede usarse en cursos o talleres para ilustrar el proceso de entrenamiento por preferencias con LoRA.
- Desarrollo de agentes ligeros: al ser un modelo de 360M, podria integrarse en entornos con recursos limitados, aunque sin garantias de calidad.
- Evaluacion de metodologias: comparar el comportamiento de un adaptador DPO frente al modelo base en tareas de instruccion.
- No se recomienda su uso en produccion debido a su naturaleza experimental y a la falta de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Tampoco se comparan los resultados con el modelo base o con otros adaptadores.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 360M, la inferencia puede ejecutarse en CPU con memoria RAM suficiente (estimacion orientativa: 1-2 GB para el modelo base en precision fp16, sin cuantizar).
- En GPU, cabe en tarjetas con 4 GB de VRAM o menos, como una NVIDIA GTX 1650 o RTX 3050, aunque no se han realizado pruebas oficiales.
- El adaptador en si ocupa muy poco espacio (el repositorio indica 0.0 GB, probablemente por redondeo), por lo que el requisito principal es el del modelo base.
- Opciones de despliegue: puede usarse con la libreria transformers y PEFT, o exportarse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan instrucciones especificas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base `HuggingFaceTB/SmolLM2-360M-Instruct` es un modelo pequeno de la familia SmolLM2, disenado para eficiencia en entornos limitados. Otros adaptadores DPO sobre modelos similares (por ejemplo, sobre SmolLM2-135M o SmolLM2-1.7B) podrian ser comparables, pero no se han encontrado datos publicos en la informacion proporcionada. Se recomienda consultar el modelo base para obtener referencias de rendimiento.

## Limitaciones y advertencias

- Es un testrun sin validacion: no se han publicado evaluaciones de calidad, sesgos o alucinaciones.
- La licencia no esta especificada, por lo que no se garantiza su uso comercial ni su redistribucion.
- Los idiomas soportados no se indican; el modelo base SmolLM2 esta entrenado principalmente en ingles, pero no se confirma para este adaptador.
- La longitud de contexto no se documenta; se asume la del modelo base, pero no se verifica.
- Al ser un adaptador LoRA, su rendimiento depende completamente del modelo base; cualquier limitacion de este (por ejemplo, alucinaciones o sesgos) se hereda.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ram-lexsi/agenttune-testrun-DPO
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de AgentTune (espejo): https://github.com/Lexsi-Labs/AgentTune_mirror
- Comunidad Lexsi Discord: https://discord.com/invite/dtEDQ2Z3eg
