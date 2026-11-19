# DouglasBashir/zils-lite-r9

## Resumen

zils-lite-r9 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario DouglasBashir y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de 852.985.920 parametros (aproximadamente 0,85 mil millones) orientado a la toma de decisiones tipadas y a la seleccion de llamadas a funciones (function calling), segun se desprende de la model card. El modelo se construye como la media uniforme de dos ajustes finos LoRA de rango 16 fusionados en los pesos.

El modelo se entrena sobre filas publicas de decisiones tipadas del dataset tasksource/tasksource-jev-typed-decisions, complementadas con decisiones de function calling derivadas de conversaciones publicas. Por tanto, su proposito declarado no es la generacion de texto generalista, sino actuar como "cuerpo d3-lite" o modelo de decision dentro de un pipeline mayor. El contexto, los idiomas y el pipeline de inferencia no estan disponibles en la informacion proporcionada.

La relevancia de este modelo es limitada y muy especifica: se trata de un artefacto experimental de un autor individual, sin descargas ni interacciones registradas en el momento de la consulta, y con una model card extremadamente escueta. Resulta de interes unicamente para quienes sigan la linea de trabajo "Zils" del autor o necesiten un modelo pequeno de clasificacion de decisiones con anclaje KL al modelo de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5` con `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen3.5-0.8B, aunque el repositorio incluye el tag `custom_code`, lo que implica que la carga requiere confiar en codigo personalizado del autor y no solo en la implementacion estandar de transformers. El proceso de entrenamiento descrito consiste en dos ajustes finos independientes mediante LoRA de rango 16 (una epoca, optimizador AdamW, learning rate 1e-4, schedule lineal), cada uno con una semilla distinta de ordenacion de datos (554 y 555). Ambos LoRA se fusionan en los pesos y posteriormente se promedian de forma uniforme para producir el modelo final.

El entrenamiento incorpora un ancla KL hacia las respuestas del "soup" de partida, lo que actua como regularizacion para evitar el olvido catastrofico respecto al modelo base ajustado. Los datos son filas publicas de decisiones tipadas de tasksource/tasksource-jev-typed-decisions, la mitad de ellas con objetivos suaves (soft targets) mezclados a partir de las respuestas del profesor publico "Zils relay", mas decisiones de function calling construidas a partir de conversaciones publicas. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas: el modelo esta entrenado para emitir decisiones estructuradas sobre filas del dataset tasksource-jev-typed-decisions.
- Seleccion de llamadas a funciones (function calling): puede decidir que funcion invocar a partir de conversaciones, segun los datos de entrenamiento descritos.
- Ajuste fino sobre Qwen3.5-0.8B: conserva, en principio, las capacidades del modelo base, aunque la model card no las detalla ni las garantiza.
- Generacion de texto general: no documentada especificamente para este ajuste; no disponible.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Clasificacion de decisiones tipadas en pipelines de datos: el modelo puede emplearse para etiquetar o decidir sobre filas con estructura fija, aprovechando el entrenamiento especifico sobre tasksource-jev-typed-decisions.
- Enrutamiento de llamadas a funciones en asistentes: dado que se entreno con decisiones de function calling, puede usarse como componente de seleccion de herramienta en un agente, aunque su tamano reducido limita la complejidad de las conversaciones que puede manejar.
- Componente de decision en un sistema mayor "Zils": encaja como "cuerpo d3-lite" dentro de la arquitectura del autor, donde el modelo grande genera y este decide.
- Experimentacion academica con promediado de LoRA: sirve como ejemplo reproducible de la tecnica de fusionar dos LoRA de rango 16 y promediar los pesos resultantes con ancla KL.
- Prototipado de bajo coste en CPU o GPU consumer: con 0,85 mil millones de parametros, es viable para pruebas rapidas de clasificacion de decisiones sin infraestructura dedicada.
- Evaluacion comparativa de ajustes finos pequenos: util para investigadores que comparen estrategias de fine-tuning sobre Qwen3.5-0.8B con objetivos suaves y destilacion desde un profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al incluir `custom_code`, la carga con vLLM, TGI o llama.cpp no esta garantizada; se recomienda transformers con `trust_remote_code=True`. La conversion a GGUF para Ollama o llama.cpp requeriria verificar la compatibilidad de la arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-r9 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino especializado en decisiones tipadas y function calling |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Modelo base generalista del que deriva |
| Otros fine-tunes de Qwen3.5-0.8B | ~0,8 mil millones | no disponible | variable | Hugging Face | Alternativas de la misma familia; no se dispone de datos concretos |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, sin descargas ni validacion comunitaria en el momento de la consulta.
- La model card es muy escueta: no documenta contexto, idiomas, cuantizaciones ni evaluacion.
- El tag `custom_code` obliga a ejecutar codigo del autor (`trust_remote_code=True`), lo que supone un riesgo de seguridad en entornos de produccion.
- Entrenado especificamente para decisiones tipadas y function calling; su comportamiento en generacion abierta no esta garantizado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion y de decisiones incorrectas en dominios fuera de la distribucion de tasksource-jev-typed-decisions.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion y de soporte desaconseja su uso en produccion sin validacion propia.
- No se especifica si el modelo conserva las capacidades multilingues del base ni su ventana de contexto efectiva.

## Enlaces

- Hugging Face: https://huggingface.co/DouglasBashir/zils-lite-r9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
