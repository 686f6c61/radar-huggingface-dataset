# kewalk123/snap-hl-checkpoints

## Resumen

SNaP hierarchical (high-level checkpoints) es un conjunto de pesos LoRA de rango 64 entrenados sobre el modelo base Qwen3.5-9B, publicados por el usuario kewalk123 en el contexto del proyecto SNaP (ZJU-Walker) y del benchmark RoboMME. No se trata de un modelo completo con pesos independientes, sino de un repositorio de checkpoints de la capa de alto nivel de una arquitectura jerarquica para robotica: cada directorio `hl/<run>/<step>/` contiene un `config.json` con los argumentos de entrenamiento y un `trainable.pt` con unicamente los pesos entrenables, mas los parametros del "narration bank" del nivel alto.

El modelo resuelve el problema de la planificacion de alto nivel en tareas de manipulacion robotica dentro de RoboMME, un benchmark de evaluacion de agentes robotizados. La eleccion de Qwen3.5-9B como base sugiere que el sistema delega en un LLM de 9 mil millones de parametros la interpretacion de instrucciones en lenguaje natural y la generacion de subobjetivos o narraciones que guian a un controlador de bajo nivel. El entrenamiento se realiza mediante LoRA, lo que reduce drasticamente el coste computacional y el almacenamiento frente a un ajuste completo.

El repositorio tiene 4,3 GB y no registra descargas ni likes en el momento de la consulta, lo que indica que es un artefacto de investigacion reciente (creado el 27 de noviembre de 2026) orientado a reproducibilidad mas que a uso general. Su relevancia actual radica en que documenta una receta concreta de adaptacion de un LLM moderno a robotica jerarquica, con licencia Apache 2.0 y codigo publico en GitHub, lo que facilita su inspeccion y reutilizacion por parte de otros grupos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre transformer decoder Qwen3.5-9B; sistema jerarquico con nivel alto y narracion |
| Parametros totales | No disponible (los checkpoints contienen solo pesos entrenables; el base es Qwen3.5-9B, ~9.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`trainable.pt`), mas `config.json` por run y step |

## Arquitectura y entrenamiento

La arquitectura combina un LLM base (Qwen3.5-9B) con adaptadores LoRA de rango 64 que se aplican exclusivamente al nivel alto de una politica jerarquica. El repositorio separa los artefactos por ejecucion (`run`) y por paso de entrenamiento (`step`), de modo que cada checkpoint incluye los argumentos de entrenamiento en `config.json` y los pesos entrenables en `trainable.pt`. Ademas de los adaptadores LoRA, se almacenan los parametros del "narration bank", un componente especifico del diseno SNaP que probablemente mantiene representaciones o plantillas de narracion usadas para descomponer instrucciones en subtareas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El contexto del benchmark RoboMME y del proyecto SNaP sugiere entrenamiento supervisado sobre trayectorias y narraciones de tareas de manipulacion, pero este extremo no esta confirmado en la model card. La innovacion tecnica destacable es la separacion limpia entre pesos base y pesos entrenables, que permite distribuir checkpoints ligeros y reconstruir el modelo completo apuntando al repositorio `Qwen/Qwen3.5-9B`.

## Capacidades

- Generacion de lenguaje natural para interpretar instrucciones de tareas roboticas y producir subobjetivos o narraciones intermedias.
- Planificacion jerarquica de alto nivel: el adaptador actua como capa superior que delega en un controlador de bajo nivel no incluido en este repositorio.
- Aprendizaje eficiente mediante LoRA de rango 64, con checkpoints intermedios por paso de entrenamiento que permiten analizar la evolucion del ajuste.
- Integracion con el benchmark RoboMME para evaluacion de agentes de manipulacion.
- Capacidades multilingues: no disponibles de forma explicita; dependen del modelo base Qwen3.5-9B.
- Soporte de tool calling, agentes multi-paso o modos de razonamiento extendido: no documentado en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos de robotica jerarquica: cargar `trainable.pt` sobre `Qwen/Qwen3.5-9B` y comparar distintos `step` de una misma ejecucion para estudiar la curva de aprendizaje del nivel alto.
- Investigacion en planificacion de tareas: usar el adaptador como generador de subobjetivos en un pipeline de manipulacion y evaluar su contribucion frente a un LLM sin ajustar.
- Benchmarking en RoboMME: integrar los checkpoints en el harness del benchmark para obtener metricas comparables con otras politicas jerarquicas.
- Desarrollo de asistentes de narracion para robots: el narration bank permite generar descripciones paso a paso de una tarea, utiles para interfaces de supervision humana.
- Fine-tuning incremental: partir de estos adaptadores como inicializacion para nuevos dominios roboticos, reduciendo el coste frente a entrenar LoRA desde cero.
- Docencia y formacion: el repositorio, con licencia Apache 2.0 y checkpoints por paso, sirve como material didactico para explicar adaptacion de LLM a robotica con recursos limitados.
- Analisis de robustez: comparar checkpoints de distintas ejecuciones (`run`) para medir la varianza del entrenamiento LoRA en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; al requerir el modelo base Qwen3.5-9B, en precision bf16 se necesitan aproximadamente 18 GB solo para los pesos, mas overhead de activaciones y KV cache.
- Los adaptadores LoRA (rango 64) y el narration bank anaden una huella minima frente al base, pero el repositorio ocupa 4,3 GB por acumulacion de multiples checkpoints por run y step.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion comoda; RTX 4090 (24 GB) puede alojar el base en bf16 con cuantizacion parcial o en 8 bits.
- Cabe en GPU de consumo (RTX 3090/4090) si se cuantiza el modelo base; no se documentan ficheros GGUF ni cuantizaciones listas para usar.
- Opciones de despliegue: al ser pesos PyTorch con LoRA, el flujo natural es cargar el base con `transformers` y aplicar los adaptadores; vLLM o TGI requeririan fusionar previamente LoRA con el base. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SNaP hierarchical (este) | LoRA r64 sobre Qwen3.5-9B | No disponible | Robotica jerarquica, RoboMME | Apache 2.0 | Hugging Face + GitHub |
| OpenVLA | ~7B | No disponible | VLA para manipulacion | No disponible en esta ficha | Publico |
| RT-2 (variantes) | No disponible | No disponible | VLA de gran escala | Propietaria | No publico |
| Politicas jerarquicas basadas en LLM (genericas) | Variable | Variable | Planificacion alto nivel + control bajo nivel | Variable | Variable |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible; los modelos citados se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar `Qwen/Qwen3.5-9B` y cargar los adaptadores; sin el base los checkpoints son inutiles.
- Solo contiene el nivel alto de la jerarquia; el controlador de bajo nivel no se incluye en este repositorio.
- Ausencia total de documentacion sobre datos de entrenamiento, sesgos y evaluacion, lo que impide valorar su robustez fuera de RoboMME.
- Riesgo de alucinacion heredado del LLM base, especialmente en la generacion de subobjetivos no alcanzables fisicamente.
- Sin datos de benchmarks publicados; no se puede afirmar superioridad frente a alternativas.
- Idiomas soportados no confirmados; el comportamiento multilingue depende del base y del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion en produccion desaconseja su despliegue directo sin validacion propia.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/kewalk123/snap-hl-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo: https://github.com/ZJU-Walker/SNaP (rama `hierarchical`, directorio `hl/`)
- Benchmark RoboMME: no disponible en la informacion proporcionada.
