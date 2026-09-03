# cheesewafer/Llama3-8B-Instruct-sft-sciworld

## Resumen

El modelo `cheesewafer/Llama3-8B-Instruct-sft-sciworld` es un ajuste fino (fine-tuning) de `meta-llama/Meta-Llama-3.1-8B-Instruct` realizado por el usuario de HuggingFace `cheesewafer`. El objetivo declarado del ajuste es adaptar el modelo base para operar dentro del entorno ScienceWorld, un simulador de laboratorio de ciencias para agentes de texto que requiere razonamiento multi-paso, planificacion y ejecucion de acciones en un entorno interactivo.

Se trata de un modelo de 8.030 millones de parametros (8B) con arquitectura transformer densa, entrenado mediante supervisión (SFT) con el kit de herramientas `alignment-handbook`. La ficha de la model card es minima y generada automaticamente por el Trainer de HuggingFace, por lo que no se dispone de detalles sobre el dataset de entrenamiento, los resultados de evaluacion ni las limitaciones declaradas por el autor. El repositorio pesa 46,1 GB en formato `safetensors`.

La relevancia de este modelo reside en su especializacion para un entorno concreto de agente (ScienceWorld), lo que lo hace util para investigacion en razonamiento cientifico y navegacion de entornos textuales, aunque su escasa documentacion y ausencia de benchmarks publicados limitan su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda 128K del base, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (hereda los del base, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `meta-llama/Meta-Llama-3.1-8B-Instruct`: un transformer autoregresivo denso con 8.030 millones de parametros, normalizacion RMSNorm, activacion SwiGLU y atencion con mascara causal. El modelo base incorpora un mecanismo de ventana de contexto de hasta 128K tokens (no confirmado para este ajuste) y ha sido alineado mediante instrucciones y RLHF por Meta.

El entrenamiento de este ajuste se realizo con el `alignment-handbook` y el Trainer de HuggingFace. Los hiperparametros declarados son: learning rate de 2e-05, batch size de 4 por dispositivo con 8 GPUs (batch efectivo de 32), optimizador Adam (beta1=0.9, beta2=0.999, epsilon=1e-08), scheduler cosine con warmup del 10%, y 3 epocas. No se especifica el dataset de entrenamiento, el numero de pasos ni el desglose de datos. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion adicionales al SFT.

## Capacidades

- Generacion de texto instructivo: al estar basado en Llama 3.1 Instruct, conserva las capacidades de dialogo y generacion de texto del modelo base.
- Razonamiento multi-paso: el ajuste para ScienceWorld sugiere un enfasis en tareas de planificacion y ejecucion de acciones en entornos textuales.
- Interaccion con entornos de agente: el modelo esta disenado para emitir acciones validas dentro del simulador ScienceWorld (p. ej., navegar, manipular objetos, realizar experimentos).
- Capacidades multilingues: no disponibles (el base soporta 8 idiomas, pero no se confirma para este ajuste).
- Tool calling y function calling: no disponible (no se menciona en la model card).
- Modo thinking o vision: no disponible.

## Casos de uso

- Investigacion en agentes de texto para ciencia: el modelo puede integrarse en pipelines de evaluacion de agentes que operan en ScienceWorld, permitiendo comparar estrategias de razonamiento cientifico frente a otros modelos.
- Desarrollo de tutores virtuales de laboratorio: dado su ajuste en ScienceWorld, podria usarse para generar secuencias de acciones correctas en un laboratorio simulado, sirviendo de base para sistemas de ensenanza asistida.
- Evaluacion de robustez en entornos de pocas muestras: al ser un ajuste SFT con datos limitados, es util para estudiar el comportamiento de modelos de 8B en tareas de generalizacion a entornos no vistos.
- Benchmarking de metodos de fine-tuning: investigadores pueden usar este modelo como punto de comparacion para medir el impacto de distintas tecnicas de ajuste (SFT vs. DPO vs. RLHF) en tareas de agente.
- Pruebas de decodificacion y planificacion: el modelo puede servir para experimentar con tecnicas de sampling, beam search o arboles de busqueda en tareas de planificacion de multiples pasos.
- Integracion en frameworks de agentes: puede conectarse a librerias como LangChain o frameworks de agentes textuales para explorar su comportamiento en tareas de ciencia simulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un campo `model-index` con una lista vacia de resultados, y no se encontraron evaluaciones externas en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B en precision FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion INT8 se reduce a unos 8-10 GB, y con INT4 a unos 4-6 GB (estimaciones estandar para Llama 3.1 8B).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs con 8-12 GB (RTX 3060, RTX 4070) para cuantizacion INT8; GPUs de 6-8 GB (RTX 2060, RTX 3050) para INT4.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles para este ajuste especifico. Como referencia, Llama 3.1 8B en FP16 en una A100 genera aproximadamente 100-150 tokens/s; en una RTX 4090, unos 60-80 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| cheesewafer/Llama3-8B-Instruct-sft-sciworld | 8B | no disponible | ScienceWorld (agente cientifico) | no disponible |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Instrucciones generales | Llama 3.1 Community License |
| cheesewafer/Llama3-8B-Instruct-sft-alfworld | 8B | no disponible | ALFWorld (agente domestico) | no disponible |
| cheesewafer/Llama3-8B-Instruct-sft-webshop | 8B | no disponible | WebShop (agente de compras) | no disponible |

Los modelos de `cheesewafer` comparten la misma base y metodologia de ajuste, diferenciandose unicamente en el entorno de agente para el que fueron entrenados. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no especifica el dataset de entrenamiento, los criterios de evaluacion ni las limitaciones conocidas, lo que dificulta la reproducibilidad y la evaluacion de sesgos.
- Sin benchmarks publicados: no hay resultados de evaluacion en tareas estandar (MMLU, HumanEval, etc.) ni en el propio ScienceWorld, por lo que no se puede cuantificar su rendimiento real.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar acciones o explicaciones plausibles pero incorrectas en el entorno ScienceWorld.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento, no se pueden identificar sesgos especificos introducidos por el ajuste.
- Licencia no declarada: el autor no especifica la licencia del modelo, lo que genera incertidumbre legal para uso comercial o redistribucion.
- Limitaciones de contexto: no se confirma si el ajuste conserva la ventana de 128K del modelo base; es posible que el entrenamiento haya reducido la longitud efectiva de contexto.
- Modelo experimental: con solo 5 descargas y 0 likes, es un modelo de investigacion sin validacion externa ni soporte comunitario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cheesewafer/Llama3-8B-Instruct-sft-sciworld
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Modelo hermano (ALFWorld): https://huggingface.co/cheesewafer/Llama3-8B-Instruct-sft-alfworld
- Modelo hermano (WebShop): https://huggingface.co/cheesewafer/Llama3-8B-Instruct-sft-webshop
