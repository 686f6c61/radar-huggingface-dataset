# mradermacher/XORTRON-AgentRICO-i1-GGUF

## Resumen

XORTRON-AgentRICO-i1-GGUF es la versión cuantizada en formato GGUF del modelo darkc0de/XORTRON-AgentRICO, un modelo de lenguaje de tipo vision-language con unos 27.320 millones de parámetros (27,3B) publicado por el usuario darkc0de y cuantizado por mradermacher, especialista habitual en conversiones GGUF con imatrix. El repositorio no contiene un modelo nuevo: es un artefacto de distribución que empaqueta el modelo base en cuantizaciones de 2 a 4 bits para su uso con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.).

El modelo se presenta explícitamente como un fine-tune «uncensored», con etiquetas como *abliterated*, *heretic*, *toxic* y *not-for-all-audiences*, derivadas de técnicas de eliminación o atenuación del rechazo (refusal) aprendido durante el alineamiento. Está entrenado sobre el dataset propio darkc0de/The-Mind-of-XORTRON y declara únicamente inglés como idioma. Por su tamaño y naturaleza experimental, su interés es fundamentalmente de investigación: estudio de comportamientos no alineados, generación de datos sintéticos adversarios, *red-teaming* y evaluación de salvaguardas.

La relevancia inmediata es limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no se publica licencia y no hay resultados de benchmarks ni especificación de longitud de contexto en la información disponible. Es, por tanto, un artefacto de nicho que debe evaluarse con cautela antes de cualquier uso, incluso en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; modelo de transformers con capacidades de visión y lenguaje (vision-language-model) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB); el repositorio estático hermano incluye además Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors; ficheros mmproj para visión en el repositorio estático |

Otros datos del repositorio: tamaño total de 39,5 GB, creado el 24 de octubre de 2026, actualizado el mismo día, 0 descargas y 0 likes. Etiquetas declaradas: `unsloth`, `vision-language-model`, `text-generation-inference`, `uncensored`, `harmful`, `heretic`, `abliterated`, `toxic`, `experimental`, `not-for-all-audiences`, `imatrix`, `conversational`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que es un modelo de transformers con capacidad de visión (etiqueta `vision-language-model` y presencia de ficheros mmproj en el repositorio estático), afinado con Unsloth según la etiqueta `unsloth`, y con 27.320.697.856 parámetros según los safetensors del modelo original. No se especifican el número de capas, la dimensionalidad oculta, el mecanismo de atención ni si emplea atención lineal, decodificación especulativa u otras innovaciones.

El entrenamiento se apoya en el dataset darkc0de/The-Mind-of-XORTRON, de composición no documentada en la información disponible. Las etiquetas *abliterated* y *heretic* indican que el proceso de ajuste incluyó técnicas de eliminación o supresión del comportamiento de rechazo (abliteration), orientadas a que el modelo no decline peticiones. No se documentan volúmenes de tokens, mezcla del dataset, ni si hubo fases de RLHF, DPO u otro alineamiento posterior. Esta cuantización concreta fue generada por mradermacher con calibración imatrix (fichero `XORTRON-AgentRICO.imatrix.gguf` de 0,1 GB) y remite a su repositorio estático para las cuantizaciones sin imatrix y para los ficheros mmproj de la torre de visión.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat (etiqueta `conversational`).
- Procesamiento de imágenes: el modelo base es un vision-language model y las cuantizaciones disponen de ficheros mmproj para la torre visual en el repositorio estático.
- Generación de contenido sin filtros de rechazo, por diseño (abliterated/heretic).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y con text-generation-inference.
- Ejecución local en CPU/GPU mediante llama.cpp y ecosistema GGUF.
- Capacidad de agente y razonamiento multi-paso: no documentada; el nombre «AgentRICO» sugiere orientación a agentes, pero no hay evidencia técnica publicada al respecto.
- Soporte de tool calling / function calling: no disponible.
- Capacidades matemáticas o de código específicas: no disponibles.
- Modo «thinking» o razonamiento explícito: no disponible.

## Casos de uso

- **Investigación sobre alineamiento y rechazo**: el modelo sirve como sujeto de estudio para analizar qué comportamientos se eliminan con abliteration y cómo afecta a la coherencia y a la utilidad general; útil en trabajos que comparan modelos alineados frente a no alineados con la misma base.
- **Red-teaming y evaluación de salvaguardas**: puede emplearse como generador controlado de prompts y respuestas adversarias para probar clasificadores de toxicidad, filtros de moderación o sistemas de detección de contenido dañino en pipelines propios.
- **Generación de datos sintéticos adversarios**: con 27,3B parámetros y cuantización Q4_K_S de 15,9 GB, cabe en una GPU de 24 GB y permite generar lotes de conversaciones etiquetadas para entrenar clasificadores o modelos de moderación.
- **Descripción de imágenes en local**: gracias a la torre de visión y a los ficheros mmproj, puede realizar captioning o VQA sin conexión, adecuado para entornos con requisitos de confidencialidad donde no se permite enviar imágenes a la nube.
- **Escritura creativa sin restricciones de contenido**: narrativa, roleplay y guiones para proyectos editoriales adultos, con la advertencia de que la licencia no está declarada y el uso comercial es incierto.
- **Despliegue offline en estaciones de trabajo**: las cuantizaciones IQ3_M (12,9 GB) y Q2_K (11,0 GB) permiten ejecución en GPU de 12-16 GB o en CPU con llama.cpp, útil para pruebas de concepto en máquinas sin acceso a internet.
- **Experimentación con pipelines de agentes**: integrable en prototipos de agentes basados en llama.cpp u Ollama para evaluar la estabilidad del modelo en cadenas de varias llamadas, siempre con expectativas moderadas al no haber benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra tarea, y el modelo base tampoco documenta métricas en los datos proporcionados.

## Requisitos de hardware

- **Pesos en FP16/BF16**: 27.320.697.856 parámetros × 2 bytes ≈ 54,6 GB, más caché KV y overhead; requiere A100 80 GB, H100 o dos GPU de 24 GB con tensor parallelism.
- **i1-Q4_K_S (15,9 GB)**: cabe en una RTX 4090, RTX 3090 o L40S de 24 GB dejando margen para contexto; en GPU de 16 GB solo con contexto muy reducido.
- **i1-IQ3_M (12,9 GB)**: viable en RTX 4080/4070 Ti Super de 16 GB, RTX 3060 de 12 GB con contexto corto, o A4000 de 16 GB.
- **i1-Q2_K (11,0 GB)**: entra en RTX 3060 12 GB, RTX 4070 12 GB y Tesla T4 16 GB; la pérdida de calidad frente a Q4_K_S es apreciable según los criterios habituales de llama.cpp.
- **Torre de visión**: los ficheros mmproj del repositorio estático añaden VRAM adicional (tamaño no disponible en la información proporcionada); hay que reservarla al calcular el presupuesto total.
- **CPU/offloading**: las cuantizaciones de 11-16 GB son ejecutables con llama.cpp en CPU con 32 GB de RAM o más, a velocidades de pocos tokens por segundo.
- **Backends compatibles**: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-inference (etiqueta declarada) y endpoints compatibles.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad GGUF |
|---|---|---|---|---|---|
| XORTRON-AgentRICO (este) | 27,3B | No disponible | No disponible | No disponible | Sí, i1/imatrix y estáticos |
| Gemma 3 27B | 27B | 128K | Gemma Terms of Use | Sí, en su model card | Sí |
| Qwen2.5-VL-32B | 32,5B | 128K | Apache 2.0 | Sí, en su model card | Sí |
| Mistral Small 3.1 24B | 24B | 128K | Apache 2.0 | Sí, en su model card | Sí |

Los datos de contexto y licencia de los modelos alternativos provienen de sus respectivas model cards públicas y no se han verificado en esta ficha; sirven solo como referencia de categoría (modelos densos de 24-32B con capacidad de visión). Para XORTRON-AgentRICO no existe información publicada de rendimiento ni de contexto, por lo que la comparación cuantitativa no es posible. Frente a las alternativas, su principal diferencia es la ausencia de alineamiento de seguridad y la falta de licencia declarada, lo que lo hace inadecuado para producción.

## Limitaciones y advertencias

- **Contenido dañino por diseño**: el modelo está etiquetado como `uncensored`, `toxic`, `harmful` y `not-for-all-audiences`; se ha sometido a abliteration para reducir el rechazo, por lo que puede producir contenido ofensivo, ilegal o peligroso sin advertencia.
- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; el riesgo legal recae en quien lo despliegue.
- **Sin benchmarks**: no hay evidencia publicada de calidad, razonamiento, código o matemáticas; el rendimiento real es desconocido.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea degradado.
- **Contexto desconocido**: no se especifica la ventana de contexto, lo que impide planificar aplicaciones con documentos largos o conversaciones extensas.
- **Riesgo de alucinación**: al no haber pasado por un alineamiento estándar con RLHF orientado a veracidad, la propensión a inventar datos puede ser mayor que en modelos alineados equivalentes.
- **Artefacto comunitario sin tracción**: 0 descargas y 0 likes en la fecha de consulta; no hay validación independiente de la cuantización ni reportes de uso.
- **Visión incompleta en este repo**: los ficheros mmproj necesarios para la entrada de imágenes residen en el repositorio estático, no en este; quien descargue solo este repositorio no podrá procesar imágenes.
- **Sesgos**: no documentados; un fine-tune sin alineamiento y entrenado sobre un dataset privado no auditado (The-Mind-of-XORTRON) puede amplificar sesgos presentes en los datos.
- **Producción desaconsejada**: sin licencia, sin benchmarks, sin contexto declarado y con contenido no filtrado, no es apto para sistemas expuestos a usuarios finales.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/XORTRON-AgentRICO-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-AgentRICO
- Repositorio de cuantizaciones estáticas y ficheros mmproj: https://huggingface.co/mradermacher/XORTRON-AgentRICO-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Página de descargas y resumen del cuantizador: https://hf.tst.eu/model#XORTRON-AgentRICO-i1-GGUF
- Peticiones y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados obtenidos correspondían a un sitio para adultos sin relación con este repositorio y se han descartado.
