# hirundo-io/AutoTrust-Decider-Mini-9B-westernized

## Resumen

AutoTrust-Decider-Mini-9B-westernized es un ajuste fino (variante "westernized") del modelo AutoTrust-Decider-Mini-9B, publicado por el usuario hirundo-io en Hugging Face. Se trata de un modelo de unos 8.950 millones de parametros orientado a tareas de clasificacion de texto y toma de decisiones (decision-model), segun los tags del repositorio. La arquitectura declarada es qwen3_5_text, lo que lo situa en la familia Qwen 3.5, aunque el autor no publica detalles tecnicos adicionales sobre la configuracion exacta.

La relevancia del modelo reside en su enfoque declarado de mitigacion de sesgos (bias-mitigation) mediante una variante "westernized", presumiblemente un reajuste orientado a alinear el comportamiento del modelo base con valores o criterios culturales occidentales. Sin embargo, el repositorio no incluye documentacion tecnica, card detallada, datos de entrenamiento ni resultados de evaluacion, por lo que la mayor parte de las especificaciones no estan disponibles.

El acceso al modelo esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 18,4 GB en formato safetensors y se distribuye bajo licencia Apache 2.0. En el momento de redactar esta ficha el modelo no registra descargas ni likes, lo que indica una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer, familia Qwen 3.5) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5_text, es decir, la variante de solo texto de la familia Qwen 3.5, con aproximadamente 8,95 mil millones de parametros en formato safetensors. Los tags indican que es un merge del modelo base autotrust/AutoTrust-Decider-Mini-9B, lo que sugiere que la variante "westernized" se ha producido mediante tecnicas de fusion de pesos (model merging) sobre el modelo original, presumiblemente combinando con otro checkpoint para modular sesgos o criterios de decision.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El autor no publica detalles del proceso de "westernizacion" ni de la metodologia de mitigacion de sesgos aplicada.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el uso previsto es la asignacion de etiquetas o categorias a entradas textuales.
- Toma de decisiones: el tag decision-model sugiere un uso como modelo de decision (por ejemplo, aceptar/rechazar, aprobar/denegar, clasificar riesgo).
- Mitigacion de sesgos: la variante "westernized" declara un reajuste orientado a reducir o modular sesgos culturales del modelo base.
- Generacion de texto: al derivar de un transformer de ~9B, es plausible que conserve capacidades generativas, aunque no se documentan.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Moderacion de contenido automatizada: el modelo puede clasificar textos entrantes en categorias de riesgo o cumplimiento, aprovechando su naturaleza de clasificador y su orientacion declarada a la mitigacion de sesgos.
- Evaluacion de solicitudes y decisiones de negocio: como decision-model, puede emplearse para puntuar o etiquetar solicitudes (credito, soporte, triaje) con criterios consistentes.
- Filtrado de datasets para entrenamiento: puede utilizarse para etiquetar grandes volumenes de texto y descartar muestras sesgadas o no deseadas antes de entrenar otros modelos.
- Triaje de tickets de soporte: clasificacion automatica de incidencias por categoria y prioridad en pipelines de atencion al cliente.
- Analisis de sentimiento y clasificacion tematica: procesamiento por lotes de resenas o documentos para extraer etiquetas estructuradas.
- Alineacion cultural de pipelines existentes: sustitucion del modelo base por la variante "westernized" en sistemas que requieran criterios de decision alineados con contextos occidentales, manteniendo el mismo formato de pesos safetensors.
- Investigacion sobre sesgos: uso como objeto de estudio para comparar el comportamiento del modelo base frente a la variante reajustada en tareas de clasificacion sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos, aunque el repositorio solo distribuye safetensors y no ofrece versiones GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia; RTX 3090/4080 (24/16 GB) con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB usando cuantizacion; en BF16 requiere 24 GB o mas.
- Opciones de despliegue: vLLM, TGI, transformers con accelerate, llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias (no incluidas en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AutoTrust-Decider-Mini-9B-westernized | ~8,95B | no disponible | Apache 2.0 | Gated | Variante reajustada por merge |
| AutoTrust-Decider-Mini-9B (base) | ~8,95B (presumible) | no disponible | no disponible | no disponible | Modelo original del que deriva |
| Qwen 3.5 (familia base, variante ~9B) | ~9B (segun variante) | no disponible | no disponible | no disponible | Arquitectura de referencia |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card detallada, datos de entrenamiento, evaluaciones ni guia de uso; esto dificulta la validacion en produccion.
- Riesgo de alucinacion: al derivar de un modelo generativo de ~9B, puede producir salidas plausibles pero incorrectas si se usa fuera de la tarea de clasificacion.
- Sesgos: aunque el modelo declara mitigacion de sesgos mediante "westernization", este reajuste puede introducir sesgos culturales propios y no se documenta su evaluacion.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del ingles es incierto.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita su uso en documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y sujeto a las condiciones de Hugging Face.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia externa de calidad.
- Formato unico: solo safetensors; no hay cuantizaciones oficiales, lo que obliga a generarlas para despliegues en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/AutoTrust-Decider-Mini-9B-westernized
- Modelo base: https://huggingface.co/autotrust/AutoTrust-Decider-Mini-9B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
