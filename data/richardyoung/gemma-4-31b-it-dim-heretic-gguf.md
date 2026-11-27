# richardyoung/gemma-4-31B-it-DiM-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-DiM-heretic-GGUF` es una cuantizacion en formato GGUF del modelo `richardyoung/gemma-4-31B-it-DiM-heretic`, un derivado de la familia Gemma 4 de Google en su variante instruct de 31B, sometido a un proceso de "abliteration" o "heretizacion" destinado a eliminar los mecanismos de rechazo y censura del modelo original. El autor, richardyoung, publica esta version optimizada para inferencia local con llama.cpp y Ollama, empleando cuantizacion con matrices de importancia (imatrix) para preservar la calidad en bitrates bajos.

El modelo resuelve un problema muy concreto: ofrecer una version sin restricciones de rechazo de un LLM de ~30.700 millones de parametros que pueda ejecutarse en hardware de consumo o en servidores modestos, manteniendo la mayor parte de las capacidades del Gemma 4 original. Es relevante en el contexto de la investigacion sobre alineamiento, red teaming y estudios de robustez, donde los modelos "abliterated" sirven como referencia de comportamiento no alineado.

La ficha se basa exclusivamente en los metadatos disponibles del repositorio de Hugging Face, que son limitados: no se publican detalles sobre la composicion del dataset de entrenamiento, resultados de benchmarks ni especificaciones tecnicas internas del modelo base. El acceso esta restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, familia transformer; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones con imatrix; niveles concretos no detallados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors como base del modelo original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la denominacion "gemma-4-31B-it" se trata de un modelo de la familia Gemma 4 de Google en su variante instruct, con aproximadamente 30,7 mil millones de parametros. El sufijo "DiM" no se explica en los metadatos y no puede confirmarse su significado. El proceso "heretic" hace referencia a la tecnica de abliteration, que consiste en identificar y neutralizar las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO mas alla de las del modelo Gemma 4 original. La cuantizacion GGUF se ha realizado con matrices de importancia (imatrix), una tecnica que pondera la relevancia de cada peso durante la cuantizacion para minimizar la perdida de calidad, especialmente en cuantizaciones de 4 bits o inferiores. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Gemma 4 instruct.
- Razonamiento y respuesta a instrucciones de caracter general.
- Capacidad de codigo y matematicas presumiblemente conservada del modelo base (no verificada en la informacion disponible).
- Comportamiento sin rechazo (uncensored/abliterated): el modelo no aplica las negativas tipicas del modelo alineado ante peticiones sensibles.
- Compatibilidad con llama.cpp y Ollama, lo que permite ejecucion local y despliegue en entornos sin GPU dedicada.
- Soporte de endpoints compatibles segun los tags del repositorio.
- Capacidades multilingues limitadas al ingles segun los metadatos; no se confirma soporte de otros idiomas.
- No se confirma soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como referencia de comportamiento no alineado para estudiar que respuestas produce un LLM sin mecanismos de rechazo, comparandolo con el Gemma 4 original.
- Red teaming y evaluacion de robustez: permite generar respuestas adversarias y analizar sesgos o contenidos problematicos en entornos controlados de investigacion.
- Inferencia local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, facilitando experimentos sin depender de APIs.
- Prototipado de asistentes conversacionales en ingles: util para iterar sobre prompts y flujos conversacionales en un entorno local antes de decidir el modelo de produccion.
- Generacion de texto creativo sin restricciones de filtrado: escenarios donde se requiere explorar narrativas o contenido que los modelos alineados rechazarian, siempre con supervision humana.
- Benchmarking de cuantizacion: comparar la calidad de las cuantizaciones imatrix frente al modelo en safetensors para evaluar la perdida de rendimiento en 4 bits.
- Educacion y demostraciones: mostrar en talleres el efecto de la abliteration sobre el comportamiento de un LLM de ~30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para ~30,7B parametros, una cuantizacion de 4 bits requiere aproximadamente 18-20 GB de VRAM, y una de 8 bits en torno a 32-35 GB (estimaciones orientativas, no confirmadas en la informacion).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para cuantizaciones altas; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits o inferiores en GPUs con 24 GB o mas de VRAM; en cuantizaciones mayores requiere multiples GPUs o CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-DiM-heretic-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF | Version abliterated, acceso restringido, solo ingles |
| Gemma 4 31B instruct (original) | ~31B | no disponible | licencia Gemma (no apache-2.0) | safetensors | Modelo alineado de referencia, comportamiento con rechazo |
| Otros modelos abliterated de ~30B | variable | variable | variable | GGUF/safetensors | No se dispone de datos concretos en la informacion |

La comparativa detallada con alternativas concretas no puede completarse con los datos disponibles.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; su uso debe restringirse a investigacion controlada.
- Riesgo elevado de alucinacion, comun en modelos de esta escala y no mitigado por el proceso de abliteration.
- Soporte limitado al ingles segun los metadatos; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no se documenta, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Aunque la licencia declarada es apache-2.0, el modelo deriva de Gemma 4, cuya licencia original puede imponer restricciones adicionales; conviene verificar la compatibilidad antes de un uso comercial.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que limita la distribucion automatizada.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de la calidad retenida tras la cuantizacion y la abliteration.
- El significado del sufijo "DiM" no se documenta y no puede confirmarse su impacto tecnico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-DiM-heretic
- Referencia arXiv citada en los tags: arxiv:2611.17846 (no verificada en la informacion disponible)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
