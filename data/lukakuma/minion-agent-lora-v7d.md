# lukakuma/minion-agent-lora-v7d

## Resumen

`lukakuma/minion-agent-lora-v7d` es un adaptador LoRA (PEFT) publicado por el usuario lukakuma, diseñado específicamente para dotar a un modelo de lenguaje de capacidades de *function calling* y de actuación como agente web. No se trata de un modelo completo, sino de un conjunto de pesos diferenciales que deben cargarse sobre el modelo base `lukakuma/minion_l32_1d2B_l30_grpo`, un modelo ajustado previamente con GRPO (optimización de política proximal relativa a grupo, según indica el sufijo del identificador).

El adaptador está entrenado sobre el dataset `lukakuma/web-trajectories-sft`, cuyas etiquetas temáticas apuntan a trayectorias de interacción web supervisadas, es decir, secuencias de acciones y llamadas a herramientas registradas para imitar el comportamiento de un agente que navega y opera sobre servicios web. Los idiomas declarados son inglés (en) y coreano (ko), lo que sugiere un corpus de entrenamiento bilingüe en esas dos lenguas y ninguna cobertura explícita del castellano.

La relevancia del artefacto es acotada pero concreta: los adaptadores LoRA de agentes permiten incorporar comportamiento de *tool use* sobre un modelo base pequeño sin reentrenar el modelo completo, lo que abarata el despliegue en entornos con recursos limitados. El repositorio tiene un tamaño de 2,6 GB, lo cual es inusualmente grande para un adaptador LoRA convencional y sugiere que incluye estados adicionales (optimizador, pesos en precisión completa o múltiples checkpoints). El acceso está restringido: requiere aceptar condiciones en HuggingFace antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un transformer; la arquitectura del modelo base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (el identificador del modelo base contiene "1d2B", compatible con ~1,2 mil millones de parametros, pero no se confirma) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; al ser LoRA en safetensors, la cuantizacion se aplica tras fusionar con el modelo base |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | other / mixed-per-source (licencia mixta heredada de las fuentes del dataset; requiere revision manual) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 2,6 GB |
| Modelo base | lukakuma/minion_l32_1d2B_l30_grpo |
| Dataset de entrenamiento | lukakuma/web-trajectories-sft |
| Libreria | peft |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni del adaptador. Por las etiquetas y la libreria declarada (`peft`) se trata de un ajuste por bajo rango (LoRA) sobre un transformer ya entrenado, no de un modelo con atencion lineal, SSM ni arquitectura hibrida declarada. El identificador del modelo base, `minion_l32_1d2B_l30_grpo`, sugiere dos fases previas: un modelo de ~1,2B parametros (interpretacion del substring `1d2B`, no confirmada) y un ajuste posterior con GRPO, un algoritmo de aprendizaje por refuerzo con normalizacion por grupo que se emplea habitualmente para mejorar razonamiento y seguimiento de instrucciones sin necesidad de un modelo recompensador separado.

El entrenamiento del adaptador se realizó sobre `lukakuma/web-trajectories-sft`, un dataset de ajuste supervisado (SFT) orientado a trayectorias web. Esto implica datos en formato de secuencias de observacion-accion, probablemente con llamadas a funciones estructuradas y sus resultados, lo que explica la orientacion del adaptador hacia *function calling* y agentes multi-paso. No se especifican el numero de tokens de entrenamiento, la composicion exacta del corpus, el rango y alpha del LoRA, la tasa de aprendizaje ni si hubo etapas adicionales de DPO o RLHF sobre el adaptador. Tampoco se documenta ninguna innovacion tecnica en decodificacion (especulativa, constrained decoding para JSON) mas alla del propio formato de datos de trayectorias.

## Capacidades

- Generacion de llamadas a funciones (*function calling* / *tool calling*) en formato estructurado, orientada a la invocacion de APIs y herramientas externas.
- Comportamiento de agente web: ejecucion de trayectorias de varios pasos con observaciones intermedias del entorno.
- Razonamiento multi-paso encadenado a acciones, segun el formato de datos de trayectorias SFT empleado en el entrenamiento.
- Soporte bilingue limitado a ingles y coreano.
- No se declaran capacidades de vision, audio, matemáticas avanzadas ni modo de razonamiento explicito (*thinking mode*); se consideran no disponibles.
- Al ser un adaptador, hereda las capacidades del modelo base `minion_l32_1d2B_l30_grpo`, que no se documentan en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de navegacion web: el adaptador puede generar secuencias de acciones (clic, rellenar formulario, extraer dato) sobre un entorno controlado, aprovechando el entrenamiento sobre trayectorias web reales o sinteticas del dataset `web-trajectories-sft`.
- Integracion como capa de *tool calling* en asistentes internos: sobre el modelo base, el adaptador permite transformar lenguaje natural en llamadas JSON a APIs corporativas, reduciendo el coste frente a modelos propietarios al operar con un modelo de ~1,2B parametros (estimacion no confirmada).
- Agentes de consulta a servicios REST en pipelines de datos: el modelo puede encadenar la seleccion de endpoint, la construccion de parametros y la interpretacion del resultado en pasos sucesivos.
- Prototipado de agentes autonomos en investigacion: al ser un adaptador PEFT, permite comparar el comportamiento con y sin ajuste (cargando o descargando el adaptador) manteniendo fijo el modelo base, lo que facilita experimentos controlados de *ablacion*.
- Extraccion estructurada de informacion desde paginas y formularios: la orientacion a trayectorias web y a salidas de herramienta encaja con tareas de *scraping* guiado y normalizacion de campos.
- Despliegue en entornos con GPU de gama media: un adaptador LoRA sobre un modelo de aproximadamente 1,2B parametros puede servirse en una unica GPU consumer (sujeto a verificacion del tamano real del modelo base), lo que habilita pruebas de concepto de agentes sin infraestructura dedicada.
- Soporte a usuarios coreanos o angloparlantes en tareas de automatizacion web, unico par de idiomas declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace no incluye metricas de MMLU, HumanEval, GSM8K, BFCL (*Berkeley Function Calling Leaderboard*) ni de tareas de agente web como WebArena o Mind2Web. Tampoco se proporcionan curvas de entrenamiento, tasas de exito en tareas ni comparaciones con el modelo base sin adaptador.

## Requisitos de hardware

- El repositorio del adaptador ocupa 2,6 GB en safetensors. Ese peso no es el de la inferencia: para servir el modelo hay que cargar el adaptador junto al modelo base (patron PEFT) o fusionarlo previamente en los pesos del base.
- VRAM estimada para inferencia: no disponible con precision al no confirmarse el tamano del modelo base. Como referencia orientativa, un transformer de ~1,2B parametros requiere del orden de 2,4-2,6 GB en FP16 para los pesos, 1,2-1,4 GB en INT8 y 0,7-0,9 GB en cuantizacion de 4 bits, a lo que hay que sumar cache KV y el propio adaptador. Estas cifras son estimaciones derivadas del identificador del modelo base y deben verificarse.
- GPU recomendadas: no disponibles. Si se confirma el orden de 1-2B parametros, cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) seria suficiente en cuantizacion; para FP16 sin cuantizar se recomienda 8-12 GB. Para despliegues con concurrencia alta, A100 o H100 no serian necesarias por tamano, pero si por throughput agregado.
- Cabe en GPU consumer: probablemente si, en el escenario de ~1,2B parametros descrito, siempre que se cuantice o se disponga de 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM (soporta carga dinamica de adaptadores LoRA via `--enable-lora`), TGI (soporta adaptadores), llama.cpp y Ollama (requieren fusionar el adaptador en el modelo base y convertir a GGUF, ya que estos motores no cargan PEFT directamente), y transformers + peft para evaluacion.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de las alternativas provienen de sus fichas publicas y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| lukakuma/minion-agent-lora-v7d | no disponible (~1,2B segun el identificador del base) | no disponible | Adaptador LoRA para function calling y agente web | other / mixed-per-source | safetensors (PEFT) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Modelo instructivo generalista con soporte de tool calling | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Modelo instructivo generalista con soporte de tool calling | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Modelo instructivo compacto | Apache 2.0 | safetensors, GGUF |

La diferencia principal no es de capacidad bruta sino de naturaleza del artefacto: el modelo evaluado es un adaptador especializado que exige un modelo base concreto y cuyo rendimiento no esta documentado, mientras que las alternativas son modelos completos con licencias claras y amplia disponibilidad de cuantizaciones. Para produccion, la falta de benchmarks y la licencia mixta son desventajas objetivas frente a las tres alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones reproducibles: no es posible estimar su tasa de exito en tareas de agente antes de probarlo.
- Licencia `other` / `mixed-per-source`: la procedencia mixta de las fuentes del dataset impide asumir permisos de uso comercial. Es obligatorio revisar los terminos en la ficha antes de cualquier despliegue productivo.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a la evaluacion y puede limitar la redistribucion.
- Dependencia estricta del modelo base `lukakuma/minion_l32_1d2B_l30_grpo`: el adaptador no funciona sobre otros modelos y su utilidad queda ligada a la disponibilidad y licencia de ese base.
- Cobertura linguistica limitada a ingles y coreano; no hay soporte declarado de castellano, por lo que el rendimiento en espanol es impredecible y probablemente degradado.
- Contexto maximo no documentado: no se puede garantizar el manejo de trayectorias largas o conversaciones multi-turno extensas, algo critico en agentes web.
- Riesgo de alucinacion en llamadas a herramientas: los modelos pequenos ajustados para *function calling* tienden a inventar nombres de funciones o parametros invalidos; se recomienda validacion estricta de esquemas (por ejemplo, con gramaticas o *constrained decoding*) y *timeouts* en la ejecucion.
- Sesgos: no documentados. Al entrenarse sobre trayectorias web, puede heredar sesgos de los sitios y servicios recorridos durante la recoleccion de datos.
- El tamano del repositorio (2,6 GB) es anomalo para un LoRA: conviene inspeccionar el contenido antes de asumir que todo son pesos del adaptador.
- Sin pipeline declarado ni tarjeta de modelo detallada: la integracion requiere trabajo manual de configuracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukakuma/minion-agent-lora-v7d
- Modelo base: https://huggingface.co/lukakuma/minion_l32_1d2B_l30_grpo
- Dataset de entrenamiento: https://huggingface.co/datasets/lukakuma/web-trajectories-sft
- Perfil del autor: https://huggingface.co/lukakuma
- Paper, blog, repositorio o demo: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran ajenos al contenido tecnico y se han descartado.
