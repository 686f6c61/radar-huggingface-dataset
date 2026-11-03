# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln5-qt

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario ducvh5 bajo el identificador `wan21-a5b5x4c5-tf-fm-tm-ln5-qt`. Se trata de un checkpoint experimental derivado del modelo base de 1.300 millones de parametros, orientado a la sintesis de video a partir de descripciones textuales mediante la libreria diffusers.

La model card indica que se ha modificado la estructura de bloques del transformer: la configuracion pasa de una disposicion A5 a una combinacion B5×4 y C5, resultando en 15 bloques unicos y 30 bloques ejecutados. Ademas, se ha entrenado con una funcion de perdida combinada (TF+FM+TM) y un esquema de ruido con distribucion log-normal y shift de 5. El repositorio ocupa 52 GB y conserva los 16 pesos EMA y no-EMA, con un estado final en `step0015000/state.pt`.

Es relevante ahora porque explora variantes arquitectonicas sobre un modelo T2V de tamano contenido (1.3B), lo que permite experimentar con generacion de video en hardware mas asequible que los modelos de mayor escala. No obstante, la informacion publicada es muy escasa y no hay benchmarks ni documentacion detallada de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-transformer) derivado de Wan2.1; estructura de bloques A5 → B5×4 → C5, 15 bloques unicos / 30 ejecutados |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusion para generacion de video texto-a-video. El autor describe una modificacion estructural en la que la pila de bloques se reorganiza en tres etapas (A5, B5×4 y C5), con un total de 15 bloques unicos que se ejecutan 30 veces, lo que sugiere un esquema de reutilizacion de bloques o recurrencia parcial. La etiqueta `recurrent-transformer` refuerza esta interpretacion.

En cuanto al entrenamiento, la model card menciona una perdida combinada TF+FM+TM (sin detallar el significado de cada termino), un esquema de ruido con distribucion log-normal normalizada LN(0,1), shift de 5 y muestreo temporal t=1000σ. Los datos de entrenamiento se describen como "OV" con captioning QT en proporcion 50/50 entre VB y full, sin mas especificacion sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO. Se conservan los pesos EMA y no-EMA (16 en total) y el estado del optimizador en el paso 15.000.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante pipeline diffusers.
- Control del proceso de difusion mediante el esquema de ruido documentado (LN(0,1), shift=5).
- Reutilizacion de bloques del transformer (15 unicos, 30 ejecutados), potencialmente orientada a reducir coste computacional.
- Compatibilidad con la libreria diffusers y el ecosistema Wan.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de generacion de video corto: el modelo permite generar clips a partir de prompts textuales en entornos de investigacion, aprovechando su tamano de 1.3B para iterar rapidamente sobre variantes.
- Experimentacion con arquitecturas recurrentes en difusion: util para investigadores que quieran evaluar el impacto de la reorganizacion de bloques (A5/B5×4/C5) frente al modelo base.
- Generacion de material de previsualizacion (storyboards animados): para equipos de diseno que necesiten bocetos en movimiento a partir de descripciones.
- Fine-tuning posterior sobre dominios especificos: al conservar checkpoints EMA/no-EMA y estado del optimizador, sirve como punto de partida para ajustes adicionales.
- Investigacion sobre funciones de perdida en difusion de video: la combinacion TF+FM+TM documentada permite reproducir y comparar esquemas de entrenamiento.
- Docencia y divulgacion: ejemplo practico de modificacion arquitectonica sobre un modelo T2V open source de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1.3B en precision completa se requieren del orden de 10-16 GB, pero no hay datos confirmados para esta variante.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de 1.3B sugiere que podria caber en GPUs de consumo con cuantizacion, pero no hay datos publicados.
- Opciones de despliegue: diffusers (libreria declarada). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wan21-a5b5x4c5-tf-fm-tm-ln5-qt (este) | 1.3B | no disponible | no disponible | HuggingFace (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (base) | 1.3B | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas T2V de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas T2V.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta licencia, idiomas, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base Wan2.1 antes de cualquier despliegue.
- Riesgo de alucinacion y artefactos visuales: inherente a los modelos de difusion de video, agravado por la falta de evaluacion publicada.
- Modificacion arquitectonica no validada: la reorganizacion de bloques y la perdida combinada no cuentan con resultados publicados que confirmen mejoras sobre el modelo base.
- Idioma: no se especifican los idiomas soportados en los prompts.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln5-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
