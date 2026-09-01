# mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF` es una cuantización GGUF del modelo `0xSojalSec/Qwen3.8-27B-full-Uncensored`, que a su vez es una versión "abliterated" (sin censura) del modelo Qwen3.8-27B de Alibaba. La técnica de abliteration elimina los mecanismos de rechazo del modelo original, permitiendo que responda a cualquier tipo de consulta sin negarse, lo que lo hace útil para investigación en alineación y seguridad, aunque con riesgos evidentes.

El repositorio, creado por mradermacher, ofrece múltiples cuantizaciones (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, IQ1_M, IQ2_M, IQ3_M, IQ4_NL, etc.) generadas con imatrix, un método que optimiza la cuantización basándose en la importancia de los pesos. El modelo tiene 27.320.697.856 parámetros (27,3B) y un tamaño de repositorio de 39,5 GB. Según los resultados de búsqueda, el modelo base soporta un contexto de 262.000 tokens, capacidades de visión y predicción multi-token (MTP), y se distribuye bajo licencia Apache 2.0 con restricción de uso exclusivo para investigación.

La relevancia de este modelo radica en que ofrece una alternativa local y sin censura a los modelos propietarios, con un tamaño manejable para GPUs de gama alta y la flexibilidad de las cuantizaciones GGUF para ejecutarse en CPU o GPU mediante llama.cpp, Ollama u otros motores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B, con vision y MTP) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.000 tokens (segun busqueda web) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q4_0, Q4_1, IQ1_M, IQ2_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_M, IQ3_XS, IQ3_S, IQ3_L, IQ4_XS, IQ4_NL, IQ1_S, small-IQ4_NL |
| Idiomas soportados | no disponible (se asume multilingue, como Qwen) |
| Licencia | Apache 2.0 con restriccion de uso solo para investigacion (segun busqueda web) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con 27,3 mil millones de parametros, entrenado por Alibaba con una ventana de contexto de 262.000 tokens. Incluye capacidades de vision (procesamiento de imagenes) y prediccion multi-token (MTP), una tecnica que permite predecir varios tokens futuros simultaneamente para mejorar la velocidad de inferencia y la coherencia.

La version "Uncensored" se obtiene mediante abliteration, un proceso que identifica y elimina las direcciones en el espacio de activaciones responsables del rechazo de contenido. Esto se aplica sobre los pesos originales, produciendo un modelo que no se niega a responder consultas que el modelo base rechazaria. El repositorio actual contiene cuantizaciones GGUF generadas con imatrix, que asigna mayor precision a los pesos mas influyentes, reduciendo la perdida de calidad respecto a la cuantizacion uniforme.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteration aplicado por 0xSojalSec. La cuantizacion fue realizada por mradermacher, quien publica habitualmente modelos GGUF optimizados para llama.cpp.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento complejo, matematicas y comprension lectora.
- Vision: procesa imagenes y responde preguntas sobre su contenido (capacidad heredada del modelo base, segun la busqueda web).
- Prediccion multi-token (MTP): acelera la inferencia al predecir varios tokens a la vez, mejorando el throughput en motores compatibles.
- Contexto largo: ventana de 262.000 tokens, adecuada para documentos extensos, conversaciones multi-turno o analisis de codigo fuente grande.
- Sin censura: no aplica los mecanismos de rechazo del modelo original, por lo que responde a consultas sobre temas sensibles, violencia, contenido explicito, etc.
- Tool calling y agentes: no confirmado explicitamente, pero es probable que herede las capacidades de function calling del modelo base Qwen3.8-27B.
- Multilingue: no se especifican idiomas, pero Qwen3.8-27B soporta multiples idiomas, incluyendo espanol, ingles, chino, frances, aleman, etc.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como se comporta un LLM sin mecanismos de rechazo, analizando sesgos, riesgos de contenido y estrategias de mitigacion. Se usaria con prompts controlados en entornos de laboratorio.
- Despliegue local de un asistente sin restricciones: para desarrolladores que necesitan un LLM local que no filtre contenido, por ejemplo en entornos de pruebas o demos tecnicas, usando llama.cpp u Ollama con cuantizaciones Q4_K_M o Q5_K_M.
- Generacion de codigo y analisis de repositorios: con 262K de contexto, puede procesar proyectos completos, generar documentacion, refactorizar codigo o explicar fragmentos extensos. La cuantizacion GGUF permite ejecutarlo en una RTX 4090 o A100.
- Procesamiento de documentos largos: resumir libros, informes o contratos de mas de 200.000 tokens, gracias a la ventana de contexto amplia. Se puede integrar en pipelines con vLLM o llama.cpp server.
- Creacion de contenido creativo sin filtros: escritura de ficcion, guiones o dialogos que aborden temas tabu, donde el modelo base se negaria a participar. Requiere supervision humana para evitar contenido danino.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece multiples quants (Q2_K, IQ3_M, Q4_K_M, etc.), lo que permite comparar la degradacion de calidad entre niveles de compresion y elegir el equilibrio optimo entre VRAM y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar para esta version cuantizada. El modelo base Qwen3.8-27B probablemente tiene resultados publicados por Alibaba, pero no se incluyen en este repositorio ni en los resultados de busqueda obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M (aproximadamente 16-18 GB), se necesita una GPU con al menos 20 GB de VRAM. Para Q2_K (aproximadamente 10-12 GB), puede caber en una RTX 3080/3090 de 12-24 GB. El modelo F16 completo ocuparia unos 55 GB, requiriendo multiples GPUs o CPU con mucha RAM.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Para cuantizaciones pequenas (Q2_K, IQ2_M), una RTX 3080 de 12 GB podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB. Para GPUs de 12-16 GB, se recomienda Q3_K_M o IQ3_M.
- Opciones de despliegue: llama.cpp (servidor con `llama-server`), Ollama (importando el GGUF), vLLM (con soporte GGUF experimental), TGI (no compatible directamente con GGUF), o llama-cpp-python para integracion en Python.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se estima una generacion de 20-40 tokens/segundo para un modelo de 27B, pero es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uncensored |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 262K | Apache 2.0 | safetensors | No |
| Qwen3.8-27B-Uncensored (0xSojalSec) | 27,3B | 262K | Apache 2.0 (research-only) | safetensors | Si |
| mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF | 27,3B | 262K | Apache 2.0 (research-only) | GGUF | Si |
| Llama 3.1 8B (comparacion de tamano menor) | 8B | 128K | Llama 3.1 | safetensors/GGUF | No |

No se dispone de comparativas de rendimiento directas entre estos modelos. La principal diferencia es el formato (GGUF vs safetensors) y la ausencia de censura. Otros modelos "uncensored" como Dolphin o Nous Hermes podrian ser comparables, pero no hay datos suficientes para una tabla rigurosa.

## Limitaciones y advertencias

- Contenido sin filtrar: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ilegal, violento, sexual o danino. No debe usarse en produccion sin salvaguardas externas.
- Licencia restringida: segun la busqueda web, la licencia es Apache 2.0 pero con uso exclusivo para investigacion. El uso comercial no esta permitido.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, especialmente en contextos largos o con cuantizaciones agresivas (Q2_K, IQ1_M).
- Degradacion por cuantizacion: las cuantizaciones mas pequenas (Q2_K, IQ1_M) pierden calidad notablemente en razonamiento y coherencia. Se recomienda Q4_K_M o superior para tareas serias.
- Sesgos del modelo base: Qwen3.8-27B puede tener sesgos culturales o linguisticos heredados de su entrenamiento, que la abliteration no elimina.
- Sin garantias de tool calling: aunque es probable que herede function calling, no esta confirmado en la documentacion del repositorio.
- Compatibilidad limitada: el formato GGUF requiere motores como llama.cpp u Ollama; no es directamente compatible con frameworks como Transformers de HuggingFace sin conversion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-i1-GGUF
- Modelo base (0xSojalSec): https://huggingface.co/0xSojalSec/Qwen3.8-27B-full-Uncensored
- Repositorio alternativo (mradermacher/Qwen3.8-27B-Uncensored-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Repositorio alternativo (mradermacher/Qwen-3.8-27B-Uncensored-GGUF): https://huggingface.co/mradermacher/Qwen-3.8-27B-Uncensored-GGUF
- Blog sobre el modelo (orcarouter.ai): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guia de ejecucion local (orcarouter.ai): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Comparativa en HackerNoon: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
