# mradermacher/Meerkat2-14B-GGUF

## Resumen

Meerkat2-14B es un modelo de lenguaje de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) especializado en razonamiento clínico y médico, desarrollado por aigensciences. El modelo está diseñado para tareas de razonamiento médico con soporte de chain-of-thought, orientado a exámenes de licencia médica como el KMLE (Korean Medical Licensing Examination) y el USMLE (United States Medical Licensing Examination). Es un modelo bilingüe inglés-coreano, lo que lo hace relevante para el ámbito sanitario en Corea del Sur y para contextos clínicos internacionales.

La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher a partir del modelo base aigensciences/Meerkat2-14B. Esta cuantización permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa. El repositorio GGUF ocupa 102 GB e incluye múltiples niveles de cuantización, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB).

El modelo resuelve el problema de disponer de un asistente de razonamiento clínico bilingüe ejecutable localmente, sin depender de APIs externas, lo que resulta crítico en entornos sanitarios con requisitos de privacidad. Su licencia CC-BY-NC-4.0 restringe el uso comercial, por lo que está orientado a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (ingles), ko (coreano) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. El modelo se distribuye a través de la librería transformers y presenta 14.768.307.200 parámetros en safetensors, lo que sitúa el modelo en la categoría de 14B. Los tags de la model card indican especialización en razonamiento clínico, chain-of-thought y preparación de exámenes médicos (KMLE, USMLE), lo que sugiere un ajuste fino orientado a tareas de razonamiento médico estructurado.

No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación arquitectónica específica (atención lineal, decodificación especulativa, etc.). La información disponible se limita a la cuantización GGUF realizada por mradermacher, que incluye cuantizaciones estáticas y variantes con imatrix (pesos ponderados) en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento clínico y médico con soporte de chain-of-thought.
- Resolución de preguntas de exámenes médicos (KMLE, USMLE) según los tags del modelo.
- Razonamiento multi-paso orientado a diagnóstico y explicación clínica.
- Capacidad bilingüe inglés-coreano.
- No se ha confirmado soporte de tool calling / function calling en la información disponible.
- No se ha confirmado soporte de agentes autónomos ni de visión o audio.
- No se ha confirmado la existencia de un modo "thinking" explícito más allá del chain-of-thought indicado en los tags.

## Casos de uso

- Preparación de exámenes médicos: el modelo puede generar explicaciones razonadas de preguntas tipo USMLE y KMLE, desglosando el razonamiento clínico paso a paso, lo que lo hace adecuado para estudiantes que necesitan entender el porqué de cada respuesta.
- Formación clínica asistida: uso en entornos docentes para simular casos clínicos en inglés o coreano, con razonamiento explícito sobre diagnósticos diferenciales.
- Investigación en NLP médico: evaluación de modelos bilingües en tareas de razonamiento clínico, aprovechando su licencia no comercial para experimentación académica.
- Asistencia documental sanitaria: generación de resúmenes y explicaciones de conceptos médicos en coreano para personal no especializado, ejecutado localmente para preservar la privacidad de los datos.
- Despliegue local en entornos con requisitos de privacidad: gracias a las cuantizaciones GGUF (desde 5,9 GB en Q2_K), puede ejecutarse en estaciones de trabajo sin conexión a servicios en la nube, algo relevante en contextos sanitarios regulados.
- Prototipado de asistentes clínicos bilingües: integración en pipelines de investigación mediante llama.cpp u Ollama para validar flujos conversacionales antes de invertir en modelos mayores.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta 11 variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad del razonamiento clínico en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Añadir margen para el contexto KV cache (no se dispone de la longitud de contexto para calcularlo con precisión).
- GPU recomendadas: para Q8_0, una GPU con 24 GB (RTX 3090/4090, A10G) es suficiente; para Q4_K_M, una GPU de 12-16 GB (RTX 4070 Ti, RTX 4080) resulta adecuada.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 8 GB (con contexto reducido) hasta Q8_0 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base es compatible con transformers y, presumiblemente, con vLLM/TGI en su formato safetensors, aunque no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Meerkat2-14B (esta ficha) | 14,8B | no disponible | en, ko | cc-by-nc-4.0 | GGUF, safetensors |
| Modelos médicos bilingües de ~14B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohíbe el uso comercial. Cualquier despliegue en producción con fines lucrativos requiere autorización expresa del titular.
- Modelo especializado en dominio médico: su rendimiento fuera del ámbito clínico puede ser inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinación clínica: como todo modelo de lenguaje, puede generar afirmaciones médicas plausibles pero incorrectas; no debe usarse como sustituto del juicio clínico profesional.
- Cobertura lingüística limitada a inglés y coreano; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: dificulta planificar despliegues con conversaciones largas o documentos extensos.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad del razonamiento clínico; se recomienda Q4_K_M o superior para tareas sensibles.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- El repositorio GGUF (102 GB) incluye todas las variantes; descargar solo el archivo necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Meerkat2-14B-GGUF
- Modelo base: https://huggingface.co/aigensciences/Meerkat2-14B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Meerkat2-14B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Meerkat2-14B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
