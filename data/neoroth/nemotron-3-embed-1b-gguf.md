# NeoRoth/nemotron-3-embed-1b-gguf

## Resumen

Nemotron-3-Embed-1B es un modelo de embeddings de texto multilingüe desarrollado por NVIDIA, optimizado para tareas de recuperación de información (retrieval) y similitud semántica. Esta versión GGUF, publicada por el usuario NeoRoth, es una conversión del modelo original en BF16 para su ejecución local con runtimes compatibles con llama.cpp y Ollama. El modelo se basa en un encoder podado de Ministral-3 con 16 capas y 1.140 millones de parámetros, y produce embeddings de 2.048 dimensiones normalizados mediante mean pooling.

La relevancia de este modelo radica en su capacidad multilingüe y cross-lingual, evaluada en 34 idiomas, lo que lo convierte en un componente fundamental para sistemas de Retrieval-Augmented Generation (RAG) en entornos de producción. La conversión a GGUF permite desplegarlo en hardware modesto, con cuantizaciones que van desde F16 (2,3 GB) hasta Q4_K_M (750 MB), manteniendo el mismo espacio de embeddings que la versión original. El contexto declarado es de 262.144 tokens, aunque la validación práctica se ha realizado a 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en Ministral-3, podado a 16 capas) |
| Parametros totales | 1.140.918.272 (1,14 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados; validado a 4.096 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (formato GGUF) |
| Idiomas soportados | 34 idiomas: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | OpenMDW License Agreement, version 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (el original en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo es un encoder basado en la arquitectura Ministral-3 de Mistral, podado a 16 capas y 1,14 B de parámetros. NVIDIA lo entrenó específicamente para tareas de retrieval y similitud semántica, produciendo embeddings de 2.048 dimensiones normalizados mediante L2 y agregados con mean pooling. El modelo opera en dos modos diferenciados: `passage` (para indexar documentos) y `query` (para consultas), lo que requiere especificar el parámetro `input_type` en la API.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La evaluación oficial cubre 34 idiomas, con especial énfasis en capacidades multilingües y cross-linguales. La conversión a GGUF se realizó con la toolchain de llama.cpp, partiendo de los pesos BF16 originales y generando las variantes F16, Q8_0 y Q4_K_M, todas ellas comparten el mismo espacio de embeddings que la versión original.

## Capacidades

- Generacion de embeddings de texto para retrieval semantico y similitud entre frases.
- Soporte multilingue y cross-lingual en 34 idiomas, incluyendo lenguas de baja representacion como asames, nepalies o suajili.
- Compatible con sistemas RAG: indexacion de pasajes en modo `passage` y consulta en modo `query`.
- Integracion con runtimes locales: llama.cpp (via `llama-server`) y Ollama (via `ollama create` y API `/api/embed`).
- Salida de embeddings de 2.048 dimensiones, normalizados L2, listos para indexacion en bases de datos vectoriales.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en produccion: el modelo indexa documentos en una base vectorial y recupera pasajes relevantes para alimentar a un LLM generativo. Su modo `passage`/`query` optimiza la calidad de los embeddings segun el rol del texto.
- Busqueda semantica en corpus multilingue: permite buscar documentos en un idioma y recuperar resultados en otro, gracias a sus capacidades cross-linguales. Adecuado para empresas con contenido en varios idiomas.
- Clasificacion de texto por similitud: se pueden agrupar documentos, correos o tickets de soporte calculando la distancia coseno entre embeddings. Su tamano reducido permite procesar lotes grandes en CPU o GPU modesta.
- Deduplicacion de contenido: detectar articulos duplicados o casi duplicados en un repositorio comparando embeddings. La cuantizacion Q8_0 mantiene una calidad de retrieval alta con un footprint de memoria de solo 1,2 GB.
- Sistemas de recomendacion basados en contenido: representar items (productos, articulos, noticias) como embeddings y recomendar elementos similares por proximidad vectorial. Su naturaleza multilingue amplia el alcance a audiencias internacionales.
- Chatbots con memoria semantica: almacenar el historial de conversaciones como embeddings para recuperar contexto relevante en dialogos de largo recorrido. La ventana de contexto declarada de 262k tokens permite manejar sesiones extensas, aunque la validacion practica se limita a 4.096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas comparativas (MMLU, HumanEval, etc.) ni datos de rendimiento en tareas de retrieval como MTEB o BEIR. Se recomienda consultar la documentacion oficial de NVIDIA para obtener evaluaciones detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 requiere ~2,3 GB, Q8_0 ~1,2 GB y Q4_K_M ~750 MB. Cabe en GPUs consumer de gama baja (4 GB o menos) y en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q8_0 (por ejemplo, GTX 1650, RTX 3050, Apple Silicon). Para F16 se recomienda 4 GB o mas. No requiere GPU de datacenter.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (via Modelfile), y cualquier runtime compatible con GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, aunque no esta documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por embedding en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Como referencia cualitativa, el modelo compite con otros embeddings multilingues como BGE-M3 (568 M parametros, contexto 8.192) o E5-mistral-7b (7 B parametros, contexto 32.768). Nemotron-3-Embed-1B ofrece un equilibrio entre tamano reducido (1,14 B) y contexto declarado muy amplio (262.144), aunque la validacion practica se limita a 4.096 tokens. Su licencia OpenMDW 1.1 es menos permisiva que la MIT de BGE, por lo que conviene revisar las restricciones de uso comercial.

## Limitaciones y advertencias

- Licencia OpenMDW 1.1: es una licencia de codigo abierto con condiciones especificas para uso comercial. Revisar los terminos en openmdw.ai antes de desplegar en produccion.
- Contexto declarado vs. validado: aunque se anuncia 262.144 tokens, la validacion practica se ha realizado a 4.096. Usar contextos mayores puede degradar la calidad de los embeddings.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales. No es adecuado para tareas de generacion o chat.
- Posibles sesgos en idiomas de baja representacion: aunque se evaluaron 34 idiomas, la calidad puede variar significativamente entre lenguas con mas o menos datos de entrenamiento.
- Riesgo de errores en similitud semantica: como cualquier modelo de embeddings, puede fallar en detectar matices, ironia o contexto ambiguo. Se recomienda validar con datos propios antes de usar en produccion.
- La conversion GGUF no es un release oficial de NVIDIA: el autor advierte que no esta afiliado ni respaldado por NVIDIA. Verificar la integridad de los archivos mediante los checksums SHA-256 proporcionados.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/NeoRoth/nemotron-3-embed-1b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-embed-1b/modelcard
- Documentacion de la API de NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-embed-1b
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/containers/nemotron-3-embed-1b/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
