# mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic`, una variante "abliterated" del OLMo 2 32B Instruct de AI2. El modelo base OLMo 2 es un transformer decoder-only de 32.234.279.936 parámetros (32B) desarrollado por el Allen Institute for AI, entrenado desde cero sobre el corpus Dolma y publicado con licencia Apache 2.0. La variante "heretic" elimina los mecanismos de rechazo del modelo original mediante técnicas de abliteration, de modo que responde a solicitudes que el modelo alineado declinaría.

El trabajo de cuantización lo firma mradermacher, un publicador habitual de GGUF que ofrece once variantes (desde Q2_K de 12,1 GB hasta Q8_0 de 34,4 GB) para su uso con llama.cpp, Ollama y otros motores compatibles con GGUF. El repositorio incluye además una versión con quants ponderados/imatrix en un repositorio hermano (`-i1-GGUF`), que suele ofrecer mejor relación calidad/tamaño en los niveles bajos.

La relevancia de esta ficha es doble: por un lado, documenta una vía práctica de ejecutar un modelo de 32B en hardware de consumo mediante cuantización agresiva; por otro, advierte de que el proceso de abliteration altera el comportamiento de seguridad del modelo original, lo que tiene implicaciones directas para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 2 de AI2), variante abliterated |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); quants imatrix en repositorio `-i1-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (etiqueta del repositorio); la model card menciona tambien openrail++ en los tags |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 32B Instruct de AI2, un transformer decoder-only entrenado desde cero con el corpus Dolma y afinado con instrucciones. El repositorio documenta el dataset `allenai/RLVR-GSM-MATH-IF-Mixed-Constraints` como parte del pipeline de entrenamiento, lo que sugiere un ajuste orientado a razonamiento matemático y seguimiento de instrucciones con restricciones. La variante "heretic" aplica técnicas de abliteration sobre el modelo alineado: se identifican las direcciones de activación asociadas al rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde la tendencia a declinar solicitudes.

Las cuantizaciones de mradermacher son estáticas (sin imatrix) y se generan a partir de los pesos en formato Hugging Face convertidos a GGUF. El autor marca explícitamente Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality"; Q3_K_M se etiqueta como "lower quality". No se documentan en esta información detalles sobre la decodificación especulativa, atención lineal ni otras innovaciones del OLMo 2 original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento matemático y resolución de problemas tipo GSM/MATH, según el dataset de ajuste documentado.
- Seguimiento de instrucciones con restricciones (IF, instruction following).
- Respuestas sin rechazo a solicitudes que el modelo alineado declinaría (comportamiento "uncensored"/"abliterated").
- Ejecución local mediante llama.cpp y motores compatibles con GGUF.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación sobre alineación y abliteration: comparar las respuestas del modelo heretic con las del OLMo 2 Instruct original para estudiar qué comportamientos de seguridad se eliminan y con qué coste en calidad.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (19,6 GB) permite ejecutar un modelo de 32B en una RTX 4090 de 24 GB, algo inviable con los pesos en fp16.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o diálogos donde el modelo alineado impondría restricciones de contenido.
- Evaluación de robustez de filtros: usar el modelo como generador adversario para probar sistemas de moderación y clasificadores de contenido.
- Procesamiento por lotes en CPU: las variantes Q2_K (12,1 GB) y Q3_K_S (14,2 GB) permiten inferencia en servidores sin GPU, a costa de calidad.
- Experimentación con cuantización: comparar la perplejidad y calidad de salida entre Q4_K_S, Q5_K_M y Q6_K sobre el mismo modelo para calibrar el compromiso tamaño/calidad.
- Fine-tuning posterior sobre GGUF: no es el flujo habitual, pero el repositorio base en safetensors permite reentrenar y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo incluye una tabla de tamaños de cuantización y una referencia externa a una gráfica comparativa de perplejidad entre tipos de quant (ikawrakow), sin cifras concretas para este modelo.

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 12,1 | - |
| Q3_K_S | 14,2 | - |
| Q3_K_M | 15,7 | lower quality |
| Q3_K_L | 17,0 | - |
| IQ4_XS | 17,6 | - |
| Q4_K_S | 18,5 | fast, recommended |
| Q4_K_M | 19,6 | fast, recommended |
| Q5_K_S | 22,3 | - |
| Q5_K_M | 23,0 | - |
| Q6_K | 26,5 | very good quality |
| Q8_0 | 34,4 | fast, best quality |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto. Q4_K_M (19,6 GB) cabe en 24 GB con contexto moderado; Q8_0 (34,4 GB) requiere 40-48 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) como alternativa económica a la 4090.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; Q2_K y Q3_K_S pueden ejecutarse parcialmente en GPU de 12-16 GB o íntegramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Los quants imatrix están en el repositorio `mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-ARA-heretic (este) | 32,2B | no disponible | apache-2.0 | GGUF | Abliterated, solo ingles |
| OLMo 2 32B Instruct (AI2) | 32B | no disponible | apache-2.0 | safetensors | Modelo original alineado |
| richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic | 32B | no disponible | no disponible | safetensors | Base directo de este GGUF |
| Variantes heretic de otros modelos (p. ej. Llama 3.x abliterated) | variable | variable | variable | GGUF | Misma técnica de abliteration, distinto modelo base |

La comparación con modelos de otras familias no está documentada en la información proporcionada; los datos de rendimiento relativos no están disponibles.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro que el OLMo 2 Instruct original bloquearía. No es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante; la abliteration puede degradar la coherencia y el seguimiento de instrucciones.
- Idiomas: solo inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: el repositorio declara apache-2.0, pero la model card menciona también openrail++ en los tags, lo que genera ambigüedad. Verificar la licencia del modelo base y de la variante heretic antes de uso comercial.
- Contexto: no se documenta la longitud de contexto soportada en esta información; conviene consultar la model card del modelo base de AI2.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable según las propias notas del autor.
- El repositorio tiene 0 likes y 733 descargas en el momento de la consulta: es un artefacto de nicho sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF
- Quants imatrix: https://huggingface.co/mradermacher/OLMo-2-0325-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo base (variante heretic): https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Página de resumen del autor: https://hf.tst.eu/model#OLMo-2-0325-32B-Instruct-ARA-heretic-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
