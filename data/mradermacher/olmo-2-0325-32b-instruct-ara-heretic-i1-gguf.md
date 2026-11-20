# mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic, publicada por mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo OLMo 2 32B Instruct de AllenAI, es decir, una version a la que se le han eliminado (o atenuado) los mecanismos de rechazo y alineacion de seguridad, orientada a usos que requieren respuestas sin filtros de contenido.

El modelo base pertenece a la familia OLMo 2 de AllenAI, una iniciativa de IA totalmente abierta que publica pesos, datos de entrenamiento y codigo. La variante ARA-heretic ha sido procesada para eliminar la censura, y esta publicacion concreta ofrece cuantizaciones con imatrix (i1) en un rango amplio de precisiones, desde IQ1_S (7,1 GB) hasta Q6_K (26,7 GB), permitiendo su ejecucion en hardware de consumo.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 32.000 millones de parametros con licencia permisiva (Apache 2.0) y sin restricciones de contenido, desplegable localmente mediante llama.cpp u Ollama. No obstante, la ausencia de filtros de seguridad implica riesgos importantes que deben evaluarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2 de AllenAI; detalles exactos de la variante heretic no disponibles) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 (etiqueta del repo; la model card tambien menciona openrail++ en los tags) |
| Formato de pesos | GGUF (cuantizaciones con imatrix, i1) |

## Arquitectura y entrenamiento

El modelo base es OLMo 2 32B Instruct de AllenAI, un transformer decoder-only de 32.234 millones de parametros. La variante rica en datos de la model card indica que se ha utilizado el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, orientado a razonamiento matematico y seguimiento de instrucciones mediante aprendizaje por refuerzo con verificacion (RLVR). No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni sobre la composicion completa del corpus en la informacion proporcionada.

La modificacion "heretic" (abliteration) consiste en la eliminacion de direcciones de activacion asociadas al rechazo de peticiones, un proceso que altera los pesos para reducir la probabilidad de respuestas de negativa. Esta publicacion de mradermacher aplica cuantizacion con imatrix (i1) sobre los pesos resultantes, generando 23 variantes de precision. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal especifica de esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento matematico y resolucion de problemas (el dataset de entrenamiento incluye GSM y MATH).
- Seguimiento de instrucciones (instruction following), segun el dataset IF-Mixed-Constraints.
- Respuestas sin filtros de contenido (uncensored/decensored/abliterated), lo que incluye tematicas que el modelo original rechazaria.
- Capacidad de ejecucion local mediante llama.cpp, Ollama y otros motores compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparandolo con el OLMo 2 original para analizar que informacion se suprime mediante el entrenamiento de seguridad. Es adecuado por su naturaleza abliterated y su licencia permisiva.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia o contenido controvertido que los modelos alineados rechazan. El modelo puede mantener conversaciones multi-turno en ingles sobre estos temas.
- Analisis de contenido sensible en entornos de investigacion: clasificacion y estudio de textos que contienen lenguaje ofensivo o material delicado, donde un modelo censurado se negaria a procesarlos.
- Despliegue local en hardware de consumo: con las cuantizaciones IQ4_XS (17,4 GB) o Q4_K_M (19,6 GB) puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) o en configuraciones CPU+RAM, gracias al formato GGUF y a llama.cpp.
- Pruebas de robustez y red teaming: evaluacion de como responde un modelo sin salvaguardas ante prompts adversariales, util para disenar contramedidas en sistemas propios.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece 23 variantes de precision con imatrix, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre un modelo de 32B.
- Prototipado de asistentes conversacionales en ingles para dominios donde el filtrado de contenido no es requisito, con despliegue en Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~7,1 GB; IQ2_M ~11,1 GB; IQ3_M ~14,6 GB; IQ4_XS ~17,4 GB; Q4_K_M ~19,6 GB; Q5_K_M ~23,0 GB; Q6_K ~26,7 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4/IQ4 con contexto moderado; A100 40/80 GB o H100 para Q5/Q6 y contextos largos.
- Cabe en GPU de consumo: si, con cuantizaciones IQ4_XS o Q4_K_M en tarjetas de 24 GB; las cuantizaciones IQ2/IQ3 caben en GPU de 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; el repo incluye el archivo imatrix para generar cuantizaciones propias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF (este) | 32,2 B | no disponible | apache-2.0 | GGUF (i1, 23 variantes) | Variante abliterated, solo ingles |
| richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic | 32,2 B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar de este repo |
| OLMo 2 32B Instruct (AllenAI) | 32,2 B | no disponible | apache-2.0 | safetensors, GGUF | Version original alineada, con filtros de seguridad |
| mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF | 32,2 B | no disponible | apache-2.0 | GGUF (cuantizaciones estaticas) | Misma base, cuantizacion sin imatrix |

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de rechazo han sido eliminados, por lo que puede generar contenido danino, ilegal o eticamente problemat
