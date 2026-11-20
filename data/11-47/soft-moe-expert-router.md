# 11-47/Soft-MoE-Expert-Router

## Resumen

Soft-MoE-Expert-Router es un artefacto publicado en Hugging Face por el usuario 11-47 que implementa un esquema de enrutamiento tipo Mixture of Experts (MoE) "suave", en el que un modelo router decide dinamicamente que expertos invocar para cada entrada. El repositorio no contiene pesos de un modelo base propio, sino una composicion de tres modelos existentes que se mantienen con sus pesos originales intactos: msmth/Source-1, ITLL/wolf-defender-prompt-injection e ITLL/Decision-1.0-Route-0.6B. El router se apoya en ITLL/deberta-v3-base-tasksource-nli en modo zero-shot.

La relevancia de esta publicacion es conceptual y de infraestructura mas que de rendimiento: propone un patron de orquestacion en el que un clasificador ligero (DeBERTa-v3-base) selecciona expertos especializados sin fusionar pesos, lo que facilita el mantenimiento, la trazabilidad y la sustitucion de componentes. Los expertos cubren tres tareas concretas: filtrado de calidad de datos, deteccion de inyeccion de prompts y toma de decisiones tipadas con enrutamiento y seguridad.

No obstante, la informacion publica es extremadamente limitada: el repositorio no declara licencia, idiomas, pipeline ni parametros, no incluye model card con detalles de entrenamiento y no presenta resultados de benchmarks. Cualquier evaluacion en produccion requerira inspeccionar directamente los repositorios de los modelos componentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestacion MoE con router zero-shot (DeBERTa-v3-base) sobre tres expertos independientes; no es un transformer unico |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el router activa expertos por consulta, pero no se publica el reparto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los expertos referenciados usan safetensors en sus repositorios originales, pero este repositorio no lo declara) |

## Arquitectura y entrenamiento

El diseno descrito en la model card sigue un patron de enrutamiento sin fusion de pesos: un router basado en ITLL/deberta-v3-base-tasksource-nli, utilizado en modo zero-shot, clasifica la entrada y decide que experto o expertos invocar. Los tres expertos conservan el 100 % de sus pesos originales, lo que implica que no hay destilacion, mezcla ni ajuste conjunto entre ellos. Se trata, por tanto, de un sistema compuesto en tiempo de inferencia, no de un modelo entrenado de forma end-to-end.

Los expertos declarados son msmth/Source-1, orientado a calidad y filtrado de datos; ITLL/wolf-defender-prompt-injection, orientado a deteccion de inyeccion de prompts; e ITLL/Decision-1.0-Route-0.6B, orientado a decisiones tipadas, enrutamiento y seguridad. La model card no especifica volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se documenta como se calibra el router zero-shot ni que umbrales determinan la activacion de cada experto.

## Capacidades

- Enrutamiento zero-shot de consultas hacia uno o varios expertos especializados.
- Filtrado de calidad de datos mediante el experto msmth/Source-1.
- Deteccion de inyeccion de prompts mediante ITLL/wolf-defender-prompt-injection.
- Toma de decisiones tipadas, enrutamiento interno y comprobaciones de seguridad mediante ITLL/Decision-1.0-Route-0.6B.
- Composicion modular: los expertos pueden sustituirse o actualizarse sin reentrenar el resto del sistema, al no fusionarse pesos.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso mas alla de lo que aporten los expertos individuales.
- No se documenta soporte multilingue especifico.

## Casos de uso

- Moderacion y hardening de pipelines de LLM: el router puede derivar cada prompt entrante al experto wolf-defender-prompt-injection antes de enviarlo a un modelo generativo, bloqueando intentos de jailbreak o inyeccion sin coste de un LLM completo.
- Curacion de datasets de entrenamiento: el experto Source-1 permite clasificar y filtrar muestras de baja calidad en un pipeline de preprocesado, reduciendo ruido antes del entrenamiento.
- Enrutamiento de decisiones en agentes: Decision-1.0-Route-0.6B puede actuar como capa de decision tipada que selecciona acciones o herramientas en un agente, con el router zero-shot como primer nivel de clasificacion.
- Arquitecturas de seguridad en capas: combinacion de los tres expertos para construir un pipeline de entrada (deteccion de inyeccion), filtrado (calidad) y salida (decision y seguridad) sin fusionar modelos.
- Experimentacion academica en MoE y orquestacion: util como referencia reproducible de enrutamiento sin merging de pesos para estudiar latencia, coste y precision del router frente a alternativas end-to-end.
- Prototipado rapido de sistemas multi-experto: la naturaleza modular permite intercambiar expertos por modelos propios manteniendo el router DeBERTa-v3-base, lo que acelera la validacion de ideas antes de invertir en entrenamiento conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de los pesos de los tres expertos y del router; el repositorio no publica tamanos ni cuantizaciones.
- GPU recomendadas: no disponible. El router DeBERTa-v3-base es ligero y cabe en GPU consumer, pero los expertos ITLL/Decision-1.0-Route-0.6B y msmth/Source-1 requieren consultar sus propias fichas para estimar memoria.
- Compatibilidad con GPU consumer: no confirmada para el conjunto; el router si es viable en GPU de gama media, los expertos deben evaluarse por separado.
- Opciones de despliegue: no documentadas. Al ser un sistema compuesto, requeriria un orquestador propio (por ejemplo, un servicio que consulte el router y despache a los expertos via vLLM, TGI o llama.cpp segun el formato de cada uno).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soft-MoE-Expert-Router (11-47) | Orquestacion MoE con router zero-shot | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Mixtral 8x7B | MoE end-to-end | 46,7B totales / 12,9B activos | 32k | Apache 2.0 | Ampliamente disponible |
| Qwen MoE (variantes) | MoE end-to-end | variable | variable | variable | Hugging Face |
| Switch Transformer | MoE con router aprendido | variable | no disponible | variable | Repositorios de investigacion |

La comparacion directa es limitada: Soft-MoE-Expert-Router no es un modelo entrenado de forma conjunta, sino un patron de orquestacion sobre modelos existentes, por lo que las metricas de parametros y contexto de los MoE end-to-end no son trasladables. No se dispone de datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que verificar las licencias de los tres expertos y del router por separado.
- Sin model card detallada: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni limitaciones conocidas.
- El router es zero-shot y depende de DeBERTa-v3-base-tasksource-nli; su precision en dominios especializados no esta documentada y puede degradarse.
- Riesgo de alucinacion y falsos positivos/negativos en la deteccion de inyeccion de prompts y en el filtrado de calidad, sin metricas publicadas que lo cuantifiquen.
- Sin soporte documentado de idiomas: el comportamiento multilingue es incierto y depende de los modelos componentes.
- Sin benchmarks ni evaluaciones reproducibles: no se puede validar su rendimiento frente a alternativas antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: indica un artefacto experimental sin validacion comunitaria.
- La orquestacion introduce latencia adicional y complejidad operativa frente a un unico modelo; requiere un servicio de despacho propio.
- No se especifica el formato de pesos ni el pipeline, lo que complica la integracion directa con frameworks estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/11-47/Soft-MoE-Expert-Router
- Router: https://huggingface.co/ITLL/deberta-v3-base-tasksource-nli
- Experto de calidad y filtrado: https://huggingface.co/msmth/Source-1
- Experto de deteccion de inyeccion de prompts: https://huggingface.co/ITLL/wolf-defender-prompt-injection
- Experto de decisiones y enrutamiento: https://huggingface.co/ITLL/Decision-1.0-Route-0.6B
