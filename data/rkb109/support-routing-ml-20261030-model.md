# RKB109/support-routing-ml-20261030-model

## Resumen

Support-routing-ml-20261030-model es un modelo de clasificacion de texto de tamano reducido creado por el usuario de Hugging Face RKB109. Se trata de un prototipo transparente disenado para enrutar tickets de soporte tecnico, combinando pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF (Inverse Document Frequency). No es un modelo neuronal de gran escala ni un LLM: es un clasificador ligero y explicable cuyo objetivo es servir como linea base reproducible en demostraciones de arquitectura.

El problema que resuelve es la necesidad de sistemas de soporte que expongan puntuaciones de confianza y deriven (defer) a agentes humanos los casos inciertos, en lugar de automatizarlos a ciegas. El modelo se entrena sobre un dataset sintetico propio (RKB109/support-routing-ml-20261030-dataset) y no llama a ningun LLM alojado, lo que lo hace completamente autocontenido y ejecutable en local.

Su relevancia es principalmente educativa y de ingenieria: sirve para prototipado de arquitecturas, ejemplos de CI/CD, comparaciones de lineas base y experimentacion formativa. No es un modelo de produccion, y su propia model card advierte explicitamente contra su uso en decisiones de consecuencias reales sin datos representativos. La libreria de implementacion es "custom" (codigo propio, no integrado en transformers), con pesos en formato JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de pesos de token por etiqueta con recuperacion de evidencia ponderada por IDF (no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset sintetico; idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo propio documentado en el repositorio GitHub enlazado) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni una red neuronal profunda convencional: combina pesos de token asignados por etiqueta con un mecanismo de recuperacion de evidencia ponderado por IDF. Este diseno prioriza la transparencia y la explicabilidad frente a la capacidad, de modo que cada decision de clasificacion puede rastrearse hasta la evidencia lexica que la sustenta. El pipeline declarado en Hugging Face es `text-classification`, aunque la model card tambien menciona cobertura de `zero-shot-classification`, `sentence-similarity` y `summarization`.

El entrenamiento se realizo sobre un dataset sintetico pequeno (RKB109/support-routing-ml-20261030-dataset) generado por el propio autor. La evaluacion se hizo con 4 ejemplos sinteticos retenidos (held-out), obteniendo una precision de 1,0. Las metricas previstas para uso real son classification_accuracy, automation_coverage y escalation_precision. No hay informacion sobre numero de tokens, composicion detallada del dataset ni tecnicas como RLHF o DPO (no aplicables a esta arquitectura). El repositorio GitHub enlazado incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo, garantizando reproducibilidad completa.

## Capacidades

- Clasificacion de texto: enrutado de tickets de soporte a categorias o etiquetas predefinidas.
- Clasificacion zero-shot: la model card declara cobertura de la tarea `zero-shot-classification`, aunque no se detallan ejemplos ni metodologia.
- Similitud de frases: cobertura declarada de la tarea `sentence-similarity` mediante la recuperacion de evidencia ponderada por IDF.
- Resumizacion: cobertura declarada de la tarea `summarization`, sin detalles de implementacion.
- Exposicion de confianza: el diseno prioriza mostrar puntuaciones de confianza y derivar casos inciertos a revision humana.
- Transparencia total: sin llamadas a LLM alojados, pesos en JSON legibles y pipeline de entrenamiento publico.
- No soporta (o no hay informacion de): tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Prototipado de arquitecturas de enrutado: permite validar rapidamente el diseno de un sistema de enrutado de soporte antes de invertir en un clasificador neuronal, gracias a su formato JSON legible y su pipeline de entrenamiento publico.
- Pruebas en pipelines de CI/CD: al ser ligero y autocontenido, puede ejecutarse en integracion continua como fixture o test de regresion para sistemas de clasificacion de tickets.
- Comparacion de lineas base (baselines): sirve como referencia transparente contra la que medir modelos mas complejos (transformers finetuneados, LLMs) en tareas de enrutado de soporte.
- Formacion y docencia: su transparencia lo hace adecuado para ensenar conceptos de TF-IDF, clasificacion lexica y evaluacion de clasificadores sin la caja negra de una red neuronal.
- Experimentacion local sin infraestructura: al no depender de LLMs alojados ni GPUs, puede ejecutarse en cualquier maquina para demostraciones rapidas.
- Validacion de metricas de automatizacion: permite probar la logica de metricas como automation_coverage y escalation_precision en un entorno controlado antes de aplicarlas a modelos de produccion.
- Desarrollo de logicas de escalado: su enfoque en exponer confianza y derivar casos inciertos sirve de plantilla para implementar politicas de escalation en chatbots de soporte.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la model card son:

| Metrica | Valor |
|---|---|
| Ejemplos sinteticos retenidos (held-out) | 4 |
| Accuracy | 1,0 |
| Metricas previstas | classification_accuracy, automation_coverage, escalation_precision |

Estos resultados provienen de un conjunto de evaluacion sintetico de solo 4 ejemplos, por lo que no son comparables ni representativos de rendimiento en datos reales. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un clasificador lexico ligero con pesos en JSON, no requiere GPU ni VRAM significativa. Es esperable que funcione en CPU convencional con memoria minima.
- GPU recomendadas: no disponible; no se requiere GPU para inferencia.
- Consumer GPU: no aplicable, el modelo esta pensado para ejecucion en CPU.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI (la libreria es "custom"). El despliegue se realiza mediante el codigo propio del repositorio GitHub enlazado (train.py y codigo de evaluacion incluidos).
- Latencia y throughput: no disponibles; dada la naturaleza lexica del modelo, la latencia deberia ser muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Caracteristica | RKB109/support-routing-ml-20261030-model | DistilBERT (finetuneado para clasificacion) | DeBERTa-v3-base (clasificador de tickets) |
|---|---|---|---|
| Arquitectura | Pesos de token por etiqueta + IDF | Transformer destilado (6 capas) | Transformer (12 capas, DeBERTaV3) |
| Parametros totales | no disponible | ~66 M | ~86 M |
| Longitud de contexto | no disponible | 512 tokens | 512 tokens |
| Datos de entrenamiento | Dataset sintetico pequeno propio | Datasets generales + finetuning especifico | Datasets generales + finetuning especifico |
| Explicabilidad | Alta (pesos lexicos legibles) | Baja | Baja |
| Licencia | MIT | Apache 2.0 (segun version) | MIT |
| Requisitos de hardware | CPU, sin GPU | GPU recomendada para entrenamiento, CPU viable para inferencia | GPU recomendada |
| Disponibilidad | Hugging Face (custom library, 0 descargas) | Hugging Face, amplia adopcion | Hugging Face, amplia adopcion |

La comparativa es orientativa: los modelos alternativos citados son categoricamente distintos (transformers preentrenados) y superan con claridad a este prototipo en capacidad de generalizacion, a costa de transparencia y requisitos de hardware.

## Limitaciones y advertencias

- Datos de entrenamiento sinteticos y pequenos: el dataset es sintetico y de tamano minimo (solo 4 ejemplos de evaluacion retenidos), por lo que el accuracy de 1,0 no indica capacidad de generalizacion real.
- Cobertura de poblacion y idioma: la propia model card advierte que los tickets sinteticos no representan todas las poblaciones de usuarios ni todos los idiomas.
- No apto para decisiones de consecuencias reales: la model card prohíbe explicitamente su uso en decisiones importantes sin datos representativos, revision por expertos y evaluacion de grado de produccion.
- Riesgo de sesgo: cualquier despliegue en produccion requeriria datos de entrenamiento con consentimiento y analisis de sesgos, segun indica el autor.
- Cobertura de tareas ambigua: se declaran tareas como zero-shot-classification, sentence-similarity y summarization sin documentacion de como se implementan, por lo que su funcionamiento real no esta verificado.
- Adopcion minima: 0 descargas y 1 like en Hugging Face, sin comunidad ni validacion externa.
- Libreria custom: al no estar integrado en transformers, no funciona con los pipelines estandar de Hugging Face sin codigo adicional.
- Restricciones de licencia: la licencia MIT es muy permisiva y permite uso comercial sin restricciones relevantes; el riesgo principal no es legal sino tecnico (fiabilidad del modelo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/support-routing-ml-20261030-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/support-routing-ml-20261030-dataset
- Repositorio GitHub con train.py, dataset split, codigo de evaluacion y formato JSON: no disponible (la model card lo menciona pero no incluye la URL)
