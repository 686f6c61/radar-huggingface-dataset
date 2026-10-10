# CompiwerAI/Mtrini-Decision-1.0

## Resumen

Mtrini-Decision-1.0 es un proyecto de investigacion experimental publicado por Compiwer AI en HuggingFace. No es un modelo completo, sino un paquete de artefactos de entrenamiento compuesto por un adaptador LoRA, un cabezal de decision personalizado (`decision_head.pt`) y sus ficheros de configuracion, construido sobre el modelo base Qwen/Qwen3-8B. El repositorio ocupa aproximadamente 0,2 GB, lo que confirma que solo contiene los pesos del adaptador y del cabezal, no los pesos completos del modelo subyacente.

Su objetivo declarado es la toma de decisiones estructurada: seleccion entre opciones, ranking de alternativas y puntuacion (scoring) de decisiones. Se trata de un checkpoint muy temprano, correspondiente al paso de entrenamiento 100, y el propio autor lo etiqueta como research preview experimental, sin reivindicar estado del arte ni madurez para produccion.

La relevancia de esta ficha es acotada y conviene ser explicito: no se han publicado resultados de benchmarks validados, no se documentan idiomas soportados, la licencia figura como `other` pendiente de verificacion, y el repositorio no incluye el codigo del cabezal de decision, por lo que la inferencia estandar con Transformers/PEFT no reproduce las salidas de decision del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (Qwen/Qwen3-8B) mas cabezal de decision personalizado (`decision_head.pt`) |
| Parametros totales | 8B en el modelo base Qwen3-8B; el repositorio solo contiene el adaptador LoRA (repo de 0,2 GB) y el cabezal. Numero de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio del adaptador. El modelo base Qwen3-8B declara contexto nativo de 32 768 tokens, ampliable a 131 072 con YaRN; dato del modelo base, no verificado en este repositorio |
| Tipos de cuantizacion | No disponible. Los artefactos se distribuyen en safetensors (adaptador LoRA) y PyTorch (`.pt` para el cabezal). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el repositorio no declara idiomas) |
| Licencia | `other` (pendiente de verificacion de derechos de redistribucion del modelo base, los datos de entrenamiento y los artefactos) |
| Formato de pesos | `adapter_model.safetensors` (LoRA, safetensors) y `decision_head.pt` (checkpoint PyTorch) |
| Checkpoint de entrenamiento | Paso 100 |
| Ficheros incluidos | `adapter_config.json`, `adapter_model.safetensors`, `decision_head.pt`, `mtrini_decision_config.json`, `release_metrics.json` |
| Desarrollador | Compiwer AI |
| Fecha de publicacion (metadatos de HuggingFace) | 2026-10-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-8B, un transformer denso de la familia Qwen3, al que se le anade un adaptador LoRA y un cabezal de decision entrenado de forma separada. La combinacion sugiere una estrategia de ajuste eficiente en parametros (PEFT) sobre la representacion del modelo base, rematada con una cabeza especifica orientada a tareas de eleccion entre opciones, ordenacion de alternativas y asignacion de puntuaciones. No se especifica la arquitectura interna del cabezal, su dimensionalidad ni la funcion de perdida empleada.

El entrenamiento se encuentra en un estadio muy inicial: el checkpoint publicado corresponde al paso 100. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta ningun proceso de decodificacion especulativa, atencion lineal u otra innovacion tecnica.

Un punto critico documentado por el propio autor es que cargar el adaptador LoRA con un flujo estandar de Transformers/PEFT no ejecuta el cabezal personalizado. Para reproducir las salidas de decision se necesitan la clase exacta del cabezal, la logica del forward pass y el preprocesamiento del entrenamiento original, componentes que no se incluyen en el repositorio y que deben coincidir con el checkpoint guardado.

## Capacidades

- Toma de decisiones estructurada: seleccion entre opciones discretas, segun los objetivos de investigacion declarados.
- Ranking de alternativas: ordenacion de opciones por preferencia o idoneidad.
- Puntuacion de decisiones (decision scoring): asignacion de una puntuacion a una decision o conjunto de opciones.
- Generacion de texto, razonamiento, codigo y matematicas: capacidades heredadas del modelo base Qwen3-8B, no verificadas en este checkpoint.
- Tool calling / function calling: no disponible (no se documenta en el repositorio).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta en el repositorio).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible (no se documenta ninguna).
- Inferencia estandar: el adaptador puede cargarse con PEFT, pero sin el codigo del cabezal no se obtienen salidas de decision reproducibles.

## Casos de uso

- Investigacion academica sobre decisiones: el modelo sirve como banco de pruebas para estudiar si un adaptador LoRA sobre un transformer denso de 8B puede aprender senales de preferencia y puntuacion. Su tamano reducido (0,2 GB de artefactos) facilita la iteracion experimental.
- Triaje de tickets con clasificacion por prioridad: planteado como escenario de ranking de opciones, donde el cabezal ordenaria categorias o niveles de urgencia. Requiere implementar el cabezal y validar la semantica de las puntuaciones antes de cualquier uso real.
- Seleccion de respuestas candidatas en pipelines generativos: uso del cabezal como reranker o scorer entre varias salidas producidas por otro modelo, aprovechando el backbone de 8B. Es un caso plausible por la naturaleza de scoring, pero no verificado.
- Analisis de decisiones en documentacion tecnica o de negocio: extraccion de alternativas planteadas en un texto y ordenacion por criterios, apoyandose en el contexto del modelo base. Sujeto a validacion previa del preprocesamiento.
- Evaluacion comparativa de metodologias PEFT: el checkpoint del paso 100 permite estudiar la evolucion del aprendizaje de un cabezal auxiliar en fases muy tempranas del entrenamiento.
- Banco de pruebas para reproducibilidad: dado que el autor advierte de la necesidad de reconstruir la clase del cabezal, este repositorio es un caso de estudio sobre trazabilidad de artefactos en publicaciones de investigacion.
- Prototipado de asistentes de decision internos: en entornos de laboratorio y con supervision humana, para explorar interfaces de recomendacion entre opciones. No apto como base unica de decisiones de alto impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion iniciales requieren verificacion (semantica del objetivo, normalizacion y construccion de lineas base) y que no se reivindica ningun resultado de benchmark validado.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Metricas propias de decision (ranking, scoring) | No disponibles / pendientes de verificacion segun el autor |

## Requisitos de hardware

- El repositorio no contiene el modelo completo: para ejecutar el adaptador hay que descargar por separado Qwen3-8B desde su repositorio oficial.
- VRAM estimada para el modelo base en fp16/bf16: en torno a 16 GB solo de pesos, mas overhead de activaciones y cache KV (aproximadamente 18-20 GB en la practica). Estimacion orientativa, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB. En 4 bits: aproximadamente 5-6 GB. Estimaciones orientativas.
- GPU consumer: con cuantizacion de 4 u 8 bits, el modelo base puede caber en tarjetas de 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). En fp16 requiere GPU de 24 GB o superior (RTX 3090, RTX 4090, A100 40 GB, H100).
- El cabezal `decision_head.pt` es un fichero PyTorch cuyo consumo adicional de memoria no esta documentado; previsiblemente reducido frente a los 8B del backbone.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama para el modelo base. El adaptador LoRA puede cargarse con PEFT, pero el cabezal de decision requiere el codigo del entrenamiento original, no incluido en el repositorio.
- Latencia y throughput: no disponibles.
- Idiomas soportados: no disponibles; verificar la cobertura multilingue del modelo base antes de desplegar.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos equivalentes de toma de decision con cabezal auxiliar sobre Qwen3-8B. La comparativa mas util es contra el propio modelo base y contra el uso generico de adaptadores LoRA.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mtrini-Decision-1.0 | Adaptador LoRA + cabezal sobre 8B (repo de 0,2 GB) | No disponible en el adaptador | Sin benchmarks validados publicados | `other`, pendiente de verificacion | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-8B (modelo base) | 8B | 32 768 tokens nativos, ampliable a 131 072 con YaRN (segun su model card) | Resultados publicos del modelo base, no trasladables automaticamente al adaptador | Licencia del modelo base (consultar su model card) | HuggingFace, ampliamente distribuido |
| Otros adaptadores LoRA genericos sobre Qwen3-8B | No disponible | No disponible | No disponible | Variable segun autor | HuggingFace |

## Limitaciones y advertencias

- Estado experimental: el propio autor lo define como research preview y no como resultado listo para produccion.
- Checkpoint muy temprano: paso 100 de entrenamiento, lo que limita la madurez del ajuste.
- Ausencia de benchmarks validados: no hay MMLU, HumanEval, GSM8K ni metricas propias verificadas. No debe citarse ningun numero de rendimiento.
- Reproducibilidad incompleta: sin la clase exacta del cabezal, la logica del forward pass y el preprocesamiento original, no se pueden reproducir las salidas de decision. Cargar el LoRA con PEFT no es suficiente.
- Semantica de las puntuaciones sin verificar: se desconoce la normalizacion y el significado exacto de las salidas del cabezal, lo que invalida comparaciones con lineas base.
- Riesgo de alucinacion: inherente al modelo generativo subyacente; no se documenta ninguna mitigacion especifica.
- Sesgos: no disponibles; no se publica informacion sobre la composicion de los datos de entrenamiento ni sobre evaluaciones de sesgo.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue del adaptador es desconocido.
- Licencia restrictiva en la practica: marcada como `other`, pendiente de verificar los derechos de redistribucion del modelo base, los datos de entrenamiento y los artefactos incluidos. No se recomienda uso comercial sin revision legal previa.
- Advertencia explicita del autor: no debe usarse como base unica para decisiones de alto impacto.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompiwerAI/Mtrini-Decision-1.0
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Sitio web de Compiwer AI: no disponible en la informacion proporcionada
