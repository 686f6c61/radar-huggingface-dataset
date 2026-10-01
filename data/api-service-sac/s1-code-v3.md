# api-service-sac/s1-code-v3

## Resumen

s1-code v3 es un modelo de decisión de tipo System One desarrollado por api-service-sac, especializado en relevancia de código. Dada una búsqueda redactada en inglés o español y el código fuente de una función de Python, devuelve una probabilidad calibrada de que esa función sea exactamente el código que la búsqueda está buscando. No genera texto ni código: actúa como juez binario (sí/no) dentro de un pipeline de búsqueda semántica.

Con 321.908.998 parámetros (322M), es un ajuste fino del checkpoint multilingüe convaiinnovations/laya (Apache 2.0) y está pensado para ejecutarse en CPU convencional. Su función principal es ser el juez de s1grep, una herramienta local de búsqueda de código: un modelo de embeddings recupera los candidatos y s1-code reordena y decide entre los primeros.

La relevancia actual del modelo reside en su relación coste/rendimiento: con 0,3B de parámetros y sin GPU, alcanza un Top-1 del 82 % en inglés y del 81 % en español sobre un test retenido de 197 preguntas reales, superando a modelos como Qwen3-Embedding-0.6B en solitario y quedando por debajo de jueces mucho mayores que requieren GPU (Qwen3-Reranker-4B, Nimble de 9B). La v3 es la versión recomendada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de convaiinnovations/laya (modelo de decisión System One); no se detalla la arquitectura interna en la model card |
| Parametros totales | 321.908.998 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; la entrada de la función se trunca a los primeros 1.500 caracteres del codigo fuente |
| Tipos de cuantizacion | no se especifican; se distribuye un grafo exportado en ONNX ademas de los pesos safetensors |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (carpeta onnx/ para ONNX Runtime) |
| Tamano del repositorio | 2,6 GB |
| Libreria | laya |
| Pipeline | text-classification |
| Modelo base | convaiinnovations/laya |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint multilingüe convaiinnovations/laya, un modelo de decisión de 322M parámetros con licencia Apache 2.0. s1-code v3 no es un modelo generativo: funciona como clasificador binario calibrado. Se invoca mediante `judge.system_one(state, question)`, donde el estado (state) es la ruta del fichero, el nombre de la función, una línea vacía y los primeros 1.500 caracteres del código fuente, y la pregunta es del tipo "noul" (sí/no) con la instrucción `This code answers the search: <búsqueda>`. La salida es la probabilidad de que la función responda a la búsqueda. El entrenamiento exige respetar exactamente este formato de entrada.

El entrenamiento usó 72.332 grupos (36.166 preguntas en inglés y 36.166 en español), cada una con su función correcta y 7 negativos minados con Qwen3-Embedding dentro del mismo repositorio, excluyendo copias cercanas de la respuesta como negativos. Las fuentes incluyen preguntas generadas sobre funciones de 306 repositorios públicos de Python con licencias permisivas (más Odoo, LGPL), mensajes de commit de CommitPackFT (solo repositorios MIT, BSD, Apache e ISC), issues enlazados a la función corregida de SWE-bench, SWE-Gym y SWE-smith (MIT), y funciones de repositorios privados filtradas para eliminar secretos, datos personales y licencias. Los pares en español se generaron con Qwen3-8B (Apache 2.0). 20.000 grupos incorporan etiquetas suaves de Qwen3-Reranker-4B (Apache 2.0), mezcladas 50/50 con las etiquetas reales. La pérdida combina entropía cruzada por candidato y una pérdida listwise por grupo. Se planificó una época, con validación cada 1.000 pasos sobre repositorios retenidos; se conservó el mejor paso (13.000) tras parada temprana en 17.000. Los datos privados de entrenamiento no se publican.

## Capacidades

- Decisión de relevancia de código: evalúa si una función de Python concreta responde a una búsqueda dada y devuelve una probabilidad calibrada (temperatura noul 1,014 y error de calibración esperado del 2,5 %).
- Multilingüe inglés/español: acepta búsquedas redactadas en cualquiera de los dos idiomas con resultados equivalentes (85 % en ambos con fusión Qwen3-Embedding).
- Reranking de candidatos: reordena un conjunto de funciones candidatas aportadas por un retriever externo, mejorando la precisión del Top-1.
- Integración en pipelines de búsqueda: actúa como juez dentro de s1grep junto a un modelo de embeddings (Qwen3-Embedding o granite-embedding).
- Ejecución en CPU: no requiere GPU, lo que permite despliegues locales y sin conexión.
- Exportación a ONNX: el grafo ONNX de la carpeta `onnx/` se ejecuta mediante ONNX Runtime (Rust) para su uso en s1grep.
- No soporta tool calling ni function calling: es un clasificador de decisión, no un agente conversacional.
- No tiene visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Búsqueda de código local con s1grep: el modelo reordena los candidatos recuperados por un embedding y decide cuáles son relevantes. Al correr en CPU, permite una herramienta de búsqueda de código totalmente local y privada, sin enviar código a la nube.
- Asistente en el IDE: integrado en un editor, permite responder a consultas como "¿dónde reintentamos el envío de facturas?" devolviendo la función correcta entre las candidatas, con latencia de CPU aceptable al puntuar solo 5-10 candidatos.
- Navegación de bases de código heredadas: ayuda a localizar funcionalidad en repositorios grandes o poco documentados, donde las búsquedas por palabra clave fallan; el modelo entiende la intención de la búsqueda y no solo coincidencias léxicas.
- Onboarding de desarrolladores: nuevos miembros del equipo pueden formular preguntas en inglés o español y obtener la función relevante, reduciendo el tiempo de exploración del código.
- Auditoría y búsqueda de patrones: consultas como "¿dónde se manejan secretos?" o "¿dónde se valida la entrada del usuario?" permiten localizar funciones concretas para revisiones de seguridad o cumplimiento.
- Filtrado previo para modelos generativos: dado su coste mínimo en CPU, s1-code puede descartar candidatos irrelevantes y pasar solo las funciones pertinentes a un modelo generativo mayor, reduciendo coste y latencia en pipelines de asistencia al código.
- Búsqueda de código para equipos hispanohablantes: la paridad demostrada entre inglés y español (85 % en ambos con fusión) permite que equipos que trabajan en español usen sus propias consultas sin traducirlas.
- Integración en herramientas de CI/CD: puede usarse para etiquetar automáticamente funciones afectadas por un cambio a partir de la descripción del commit, apoyando revisiones o generación de changelogs.

## Benchmarks y rendimiento

Test retenido nuevo: 197 preguntas reales escritas a partir de commits de repositorios privados nunca usados en entrenamiento, sobre funciones que no aparecen en exámenes anteriores. Cada sistema ordena los mismos 25 candidatos; la métrica es con qué frecuencia la función correcta queda en primera posición. Las comparaciones emplean test de McNemar pregunta a pregunta.

| Sistema | Tamano | Top 1 (de 197) | Ingles | Espanol |
|---|---|---|---|---|
| Qwen3-Reranker-4B (teacher) | 4B, GPU | 183 | 91 % | 95 % |
| Nimble (System One, eleccion sobre todos los candidatos) | 9B, GPU | 177 | 90 % | 90 % |
| s1-code v3 + Qwen3-Embedding (fusionado) | 0,3B, CPU | 168 | 85 % | 85 % |
| s1-code v3 + granite-embedding (fusionado) | 0,3B, CPU | 165 | 83 % | 84 % |
| s1-code v3 solo | 0,3B, CPU | 161 | 82 % | 81 % |
| jina-reranker-v2-base-multilingual (licencia no comercial) | 0,28B, CPU | 158 | 78 % | 82 % |
| s1-code v2 solo | 0,3B, CPU | 157 | 80 % | 79 % |
| Qwen3-Embedding-0.6B solo | 0,6B | 152 | 76 % | 78 % |
| s1-code v1 solo | 0,3B, CPU | 144 | 68 % | 78 % |

Observaciones aportadas por el autor: v3 en solitario supera a v1 en solitario (p = 0,002) y a Qwen3-Embedding en solitario; fusionado con Qwen3-Embedding supera a Qwen3-Embedding en solitario (p = 0,0015). La mejora sobre v2 no es estadísticamente significativa (p = 0,54 en solitario, p = 0,65 fusionado). Los modelos mayores con GPU siguen siendo claramente mejores jueces (teacher frente a v3 fusionado: p = 0,013). Calibración: temperatura noul 1,014 y error de calibración esperado del 2,5 %.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 321,9M de parámetros, no publicada por el autor): aproximadamente 1,3 GB en fp32, 0,65 GB en fp16/bf16 y 0,32 GB en int8.
- GPU recomendadas: ninguna en particular; el modelo está diseñado para CPU. Cualquier GPU con más de 2 GB de memoria sería suficiente, aunque no aporta ventaja frente a la inferencia en CPU.
- Cabe sobradamente en GPUs de consumo (RTX 3060, RTX 4090, etc.) e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: librería `laya` (carga con `laya.load("api-service-sac/s1-code-v3", device="cpu")`) y ONNX Runtime mediante el grafo de la carpeta `onnx/` (usado por s1grep en Rust). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo.
- Latencia: puntuar 25 candidatos en CPU tarda aproximadamente 2,5 segundos; s1grep solo juzga los primeros 5 a 10 candidatos para reducir ese tiempo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Top 1 (de 197) | Licencia | Hardware |
|---|---|---|---|---|---|
| s1-code v3 | 0,3B | Juez de relevancia de codigo (System One) | 161 solo / 168 fusionado | Apache 2.0 | CPU |
| Qwen3-Reranker-4B | 4B | Reranker generativo (teacher) | 183 | Apache 2.0 | GPU |
| Nimble | 9B | System One, eleccion sobre todos los candidatos | 177 | no disponible | GPU |
| jina-reranker-v2-base-multilingual | 0,28B | Reranker multilingue | 158 | no comercial | CPU |
| Qwen3-Embedding-0.6B | 0,6B | Modelo de embeddings | 152 | no disponible en la informacion | CPU/GPU |

La ventaja diferencial de s1-code v3 es la combinacion de tamano minimo, ejecucion en CPU y licencia Apache 2.0, con un rendimiento superior a embeddings de tamano comparable o mayor, aunque por debajo de rerankers de 4B-9B que exigen GPU.

## Limitaciones y advertencias

- Solo Python: el modelo está entrenado y validado exclusivamente para funciones de este lenguaje.
- Dependencia del retriever: la calidad del juicio depende de que el modelo de embeddings coloque la función correcta entre los candidatos; si no está, s1-code no puede recuperarla.
- Especialización estrecha: en decisiones tipadas generales no relacionadas con código (benchmark de decisiones tipadas de Laya) obtiene un 27 %, por debajo del checkpoint base Laya (35 %). Para otras tareas debe usarse Laya base.
- Formato de entrada rígido: solo funciona con el formato exacto de entrenamiento (ruta, nombre de función, línea vacía y primeros 1.500 caracteres de la función; pregunta noul con la instrucción `This code answers the search: <búsqueda>`).
- Truncamiento de entrada: el código fuente se limita a 1.500 caracteres, por lo que funciones más largas pueden perder contexto relevante.
- Latencia en CPU: puntuar 25 candidatos ronda los 2,5 segundos, lo que exige limitar el número de candidatos juzgados en aplicaciones interactivas.
- Ganancia marginal sobre v2: la mejora de v3 frente a v2 no es estadísticamente significativa, según los propios datos del autor.
- Riesgo de alucinación: al ser un clasificador binario, no genera texto, pero puede asignar probabilidades altas a funciones incorrectas si el contexto es ambiguo o el retriever aporta candidatos muy similares.
- Sesgos: no se documentan análisis de sesgo en la model card; al entrenarse con repositorios públicos y privados de Python, puede reflejar sesgos de estilo y dominio de esas fuentes.
- Datos de entrenamiento no publicados: la parte privada del dataset no se libera, lo que limita la reproducibilidad completa.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial; el autor atribuye el ajuste fino a Laya (Convai Innovations) y el teacher a Qwen3-Reranker-4B, ambos Apache 2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/api-service-sac/s1-code-v3
- Modelo base: https://huggingface.co/convaiinnovations/laya
- No se han encontrado papers, blogs, repositorios o demos adicionales en los resultados de búsqueda web proporcionados.
