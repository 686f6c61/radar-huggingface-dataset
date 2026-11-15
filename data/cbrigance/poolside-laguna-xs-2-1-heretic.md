# cbrigance/Poolside-Laguna-XS-2.1-heretic

## Resumen

Poolside-Laguna-XS-2.1-heretic es una variante "abliterated" (sin el condicionamiento de rechazo) del modelo Poolside-Laguna-XS-2.1, desarrollado originalmente por Poolside y redistribuido por el usuario cbrigance en Hugging Face. El modelo base pertenece a la familia Laguna de Poolside, orientada a generación de texto y tareas de código, y esta versión concreta ha sido modificada mediante técnicas de "abliteration" y "heretic" para eliminar los mecanismos de rechazo aprendidos durante el alineamiento, de modo que responda a practicamente cualquier instruccion sin filtros de seguridad.

Con 33.442.617.088 parámetros totales (aproximadamente 33,4 mil millones) y un repositorio de 66,9 GB en formato safetensors, se trata de un modelo de gran tamano que requiere hardware de gama alta para inferencia en precision completa. La ficha se publica bajo la licencia OpenMDW-1.1 y esta etiquetado como "not-for-all-audiences", lo que refleja que su contenido generado puede ser inapropiado para audiencias generales.

Es relevante ahora porque ilustra una tendencia creciente: la redistribucion de modelos abliterated con fines de investigacion sobre alineamiento y seguridad, asi como los riesgos asociados a la publicacion de pesos sin salvaguardas. El acceso esta restringido (gated) en Hugging Face, requiriendo aceptar condiciones antes de la descarga. La informacion publica disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Poolside-Laguna-XS-2.1, probablemente transformer; requiere `custom_code` en transformers) |
| Parametros totales | 33.442.617.088 (aprox. 33,4 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precision original; sin GGUF/AWQ/GPTQ publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (transformers, `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Poolside-Laguna-XS-2.1 en la informacion proporcionada. El repositorio requiere `trust_remote_code=True` y carga codigo personalizado, lo que sugiere una implementacion no estandar dentro de transformers. El tamano de 33,4 mil millones de parametros y el repo de 66,9 GB son coherentes con pesos en bf16/fp16 sin cuantizar.

Sobre el proceso de "abliteration" y "heretic": estas técnicas modifican los pesos del modelo (tipicamente en las capas de atencion o en las direcciones de rechazo identificadas en el espacio de activaciones) para eliminar la tendencia a rechazar peticiones. El resultado es un modelo que conserva las capacidades del original pero sin el condicionamiento de seguridad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo base. El tag `arxiv:2406.11717` apunta a un paper de referencia, pero no se detalla su contenido en los datos proporcionados.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo heredados del modelo base Poolside-Laguna-XS-2.1 (orientado a tareas de programacion, aunque no confirmado explicitamente en la informacion).
- Respuesta sin filtros de rechazo gracias a la ablacion de seguridad (comportamiento "heretic"/"abliterated").
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue via API.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento, comparando respuestas con el modelo base original en conjuntos de prompts de evaluacion.
- Red teaming y evaluacion de robustez: util para generar respuestas sin filtros que permitan identificar vulnerabilidades en sistemas de moderacion y clasificadores de contenido.
- Generacion de codigo en entornos controlados: si el modelo base conserva capacidades de programacion, puede emplearse en pipelines internos de generacion de codigo donde no se requieran salvaguardas conversacionales.
- Analisis de sesgos y toxicidad: al carecer de mecanismos de rechazo, facilita la generacion de contenido que revela sesgos latentes del modelo base para su estudio academico.
- Experimentacion con tecnicas de abliteration: sirve como referencia para comparar metodologias de ablacion (heretic vs. otras) sobre un mismo modelo base de 33 B.
- Despliegue en entornos de investigacion cerrados: con acceso gated y licencia OpenMDW-1.1, puede integrarse en infraestructuras controladas mediante endpoints compatibles para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 67 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion tipica de 75-85 GB para contextos moderados).
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples GPU (por ejemplo, 2x RTX 4090 24 GB con tensor parallelism) para precision completa.
- Cabe en consumer GPU: no en una sola GPU de 24 GB en precision completa; requeriria cuantizacion (no publicada en el repo) para caber en RTX 4090/3090.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); vLLM, llama.cpp, Ollama o TGI no estan confirmados como compatibles en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Poolside-Laguna-XS-2.1-heretic (este) | 33,4 B | no disponible | openmdw-1.1 | gated en HF |
| Poolside-Laguna-XS-2.1 (base) | no disponible | no disponible | no disponible | HF (Poolside) |
| Alternativas abliterated de ~30 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o benchmarks con alternativas concretas.

## Limitaciones y advertencias

- Modelo explicitamente "abliterated"/"heretic": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso. Etiquetado `not-for-all-audiences`.
- Riesgo elevado de alucinacion y de respuestas daninas sin salvaguardas; no apto para produccion orientada a usuarios finales sin moderacion externa.
- Solo soporta ingles declarado; el rendimiento en otros idiomas no esta garantizado.
- Licencia OpenMDW-1.1: revisar condiciones de uso comercial antes de desplegar; el acceso gated implica aceptar terminos adicionales en Hugging Face.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar antes de cargar.
- Sin cuantizaciones publicadas: el despliegue en hardware consumer exige cuantizar manualmente, con posible perdida de calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de cuanto degrada la ablacion las capacidades del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Poolside-Laguna-XS-2.1-heretic
- Modelo base: https://huggingface.co/poolside/Poolside-Laguna-XS-2.1
- Paper de referencia (tag arxiv): https://arxiv.org/abs/2406.11717
