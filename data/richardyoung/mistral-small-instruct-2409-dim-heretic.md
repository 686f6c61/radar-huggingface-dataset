# richardyoung/Mistral-Small-Instruct-2409-DiM-heretic

## Resumen

Mistral-Small-Instruct-2409-DiM-heretic es un ajuste fino derivado de Mistral-Small-Instruct-2409, el modelo instruct de 22.000 millones de parametros publicado por Mistral AI en septiembre de 2024. Lo desarrolla el usuario richardyoung y se distribuye en HuggingFace bajo la libreria vLLM. Su rasgo distintivo es el proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, abliterated), una tecnica de modificacion de pesos que busca reducir la tendencia del modelo base a rechazar peticiones, manteniendo el resto de capacidades del modelo original.

El modelo conserva la arquitectura transformer densa del Mistral-Small original, con 22.247.282.688 parametros totales y un repositorio de 44,5 GB en formato safetensors. Hereda el soporte multilingue del modelo base (ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano) y esta pensado para su despliegue con vLLM.

Es relevante para quienes investigan tecnicas de modificacion de pesos, alineacion y comportamiento de rechazo en modelos instruct, asi como para experimentos que requieran un modelo de ~22B sin las capas de rechazo habituales. No obstante, su licencia (Mistral AI Research License) restringe el uso a fines de investigacion, y el modelo presenta cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigacion sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Small-Instruct-2409) |
| Parametros totales | 22.247.282.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Mistral AI Research License (MRL-0.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Mistral-Small-Instruct-2409, que emplea una arquitectura transformer densa de aproximadamente 22.000 millones de parametros. La modificacion aplicada por richardyoung se enmarca en las tecnicas conocidas como abliteration o decensoring: intervenciones sobre los pesos o las activaciones orientadas a atenuar la direccion de rechazo aprendida durante el alineamiento del modelo base. La model card no detalla el metodo exacto, el volumen de datos ni si se empleo DPO, RLHF u otra tecnica de ajuste adicional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas especificas mas alla de la propia modificacion de pesos. El modelo base Mistral-Small-Instruct-2409 fue entrenado por Mistral AI con datos no publicos en detalle y alineado para uso instruct; este derivado hereda esa base y aplica encima el proceso de decensoring.

## Capacidades

- Generacion de texto y conversacion multi-turno en estilo instruct, heredadas del modelo base.
- Razonamiento y respuesta a instrucciones complejas propias de un modelo de 22B.
- Generacion de codigo y matematicas, segun las capacidades del Mistral-Small-Instruct-2409 original.
- Soporte multilingue en diez idiomas: ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano.
- Menor tasa de rechazo ante peticiones que el modelo base tenderia a declinar, como consecuencia del proceso de abliteration.
- Compatibilidad con vLLM para inferencia de alto rendimiento.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este derivado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como objeto de estudio para analizar como la abliteration altera la distribucion de respuestas y las tasas de negativa frente al modelo base.
- Evaluacion comparativa de tecnicas de decensoring: permite medir el impacto de la modificacion en benchmarks de capacidad (razonamiento, codigo, matematicas) frente al Mistral-Small-Instruct-2409 sin modificar.
- Experimentos de red teaming: util para estudiar la robustez de los mecanismos de seguridad en modelos instruct y documentar diferencias de comportamiento.
- Despliegue en entornos de investigacion controlados con vLLM: el formato safetensors y la libreria declarada permiten servirlo con vLLM en infraestructura con GPU de suficiente memoria.
- Procesamiento multilingue de texto en laboratorio: cubre diez idiomas, lo que permite experimentos de generacion y traduccion en entornos academicos.
- Generacion de codigo y asistencia tecnica en prototipos internos de investigacion, aprovechando la base instruct del modelo.
- Analisis de sesgos y contenido: al reducir los rechazos, facilita estudiar que tipo de salidas produce el modelo en dominios sensibles, siempre en un marco de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 44,5 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 48-80 GB de VRAM.
- VRAM estimada con cuantizacion a 8 bits: en torno a 22-25 GB, viable en GPU de 24 GB con margen ajustado.
- VRAM estimada con cuantizacion a 4 bits: en torno a 12-14 GB, viable en GPU consumer de 16 GB o superiores (por ejemplo, RTX 4080/4090), aunque los tipos de cuantizacion no estan documentados para este derivado.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o multiples GPU con tensor parallelism.
- GPU consumer: cabe en RTX 4090 (24 GB) solo con cuantizacion; en precision completa no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: vLLM es la libreria declarada por el autor; llama.cpp, Ollama o TGI no estan confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-Instruct-2409-DiM-heretic | 22,2B | no disponible | MRL (solo investigacion) | Derivado abliterated, sin benchmarks publicados |
| mistralai/Mistral-Small-Instruct-2409 | 22,2B | no disponible en la informacion | MRL (solo investigacion) | Modelo base oficial, alineado para instruct |
| Mistral-Small-Instruct-2501 | no disponible en la informacion | no disponible en la informacion | MRL / Apache segun version | Version posterior de la familia Small de Mistral AI; datos no confirmados en esta consulta |

La comparacion directa con alternativas de la misma categoria (por ejemplo, otros derivados abliterated de Mistral-Small o modelos densos de ~20-24B) no puede completarse con datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Mistral AI Research License (MRL-0.1): el uso esta restringido a fines de investigacion; cualquier uso comercial requiere licencia expresa de Mistral AI.
- El proceso de abliteration puede degradar capacidades del modelo base (razonamiento, coherencia, instruccion) y no hay benchmarks publicados que cuantifiquen ese impacto.
- Mayor riesgo de generar contenido danino, sesgado o inapropiado al haberse atenuado los mecanismos de rechazo; no apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de ~22B, no mitigado por este derivado.
- Longitud de contexto no documentada en la informacion disponible; no asumir la del modelo base sin verificacion.
- Artefacto sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de pruebas independientes.
- No se documentan los tipos de cuantizacion soportados ni el proceso exacto de modificacion, lo que dificulta la reproducibilidad.
- El autor no ofrece garantias sobre el comportamiento del modelo en dominios sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-DiM-heretic
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Contacto de licencias de Mistral AI: https://mistral.ai/contact/
