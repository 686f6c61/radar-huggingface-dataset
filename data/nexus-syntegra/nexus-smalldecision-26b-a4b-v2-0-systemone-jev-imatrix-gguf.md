# nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-IMatrix-GGUF

## Resumen
Nexus SmallDecision 26B A4B v2.0 SystemOne Jev IMatrix GGUF es una colección de cuantizaciones GGUF de un modelo de decisión de tipo "System One" desarrollado por nexus-syntegra. El modelo no genera texto: recibe un estado descrito en lenguaje natural junto con preguntas tipadas sobre ese estado y devuelve, en un único forward pass, una distribución de probabilidad sobre las respuestas posibles. Está construido sobre una base etiquetada como Gemma 4, con una arquitectura de mezcla de expertos (MoE) de 26B de parámetros totales y aproximadamente 4B activos por token (de ahí el sufijo A4B).

La relevancia de esta publicación no está en el modelo en sí, que ya existía, sino en el trabajo de cuantización: el autor ha generado GGUF con importance matrix (imatrix) y una receta "dinámica" que mantiene atención, MLP densa y embeddings en Q8_0 mientras reduce únicamente los expertos enrutados a tipos de baja precisión. Según las mediciones del autor, esto reduce el error de cuantización (KL medio) de forma notable frente a cuantizaciones planas del mismo tamaño.

Es importante subrayar que estos ficheros no son utilizables de forma autónoma: el modelo requiere un prompt construido de una forma muy concreta (con tokens reservados, entre ellos `<ans>`, y un layout que duplica estado y pregunta) y el código que renderiza esos prompts y lee las respuestas no está publicado. Por tanto, estos GGUF solo sirven a quien reconstruya esa capa de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma 4; expertos enrutados originalmente en NVFP4 (ModelOpt) |
| Parametros totales | 26B (según el nombre del modelo) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M-dyn, IQ4_XS-dyn, IQ3_M-dyn, IQ4_XS, IQ3_M (GGUF); BF16 y cuantizaciones planas Q6_K, Q5_K_M, Q4_K_M en el repo GGUF base |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos de 26B de parámetros totales y unos 4B activos por token, construido sobre Gemma 4. Los expertos enrutados se distribuyen originalmente en NVFP4 mediante ModelOpt; para generar los GGUF, el autor los dequantizó a BF16, fusionó las proyecciones gate y up de cada experto en un único tensor y convirtió el resultado con el conversor estándar de llama.cpp. La cuantización se realizó con `llama-quantize` de la build 514 (commit 57ace0d61).

La importance matrix se calculó sobre el fichero Q8_0 a partir de 99 fragmentos de 2.048 tokens: 122 prompts de decisión procedentes de las propias familias de entrenamiento del autor (texto, renderizados como se sirve el modelo) y 98 ventanas de texto web de FineWeb-Edu. La receta `-dyn` mantiene en Q8_0 atención (q, k, v, output), MLP densa (gate, up, down) y embeddings de tokens, aplicando el tipo de baja precisión solo a los expertos enrutados, que representan en torno al 90% de los bytes del modelo. En cuanto al entrenamiento del modelo base, la información disponible solo indica que se usaron 165.747 ítems en cuatro ejecuciones de entrenamiento (contados una vez por ejecución), con 30 descripciones de funciones del paquete BFCL sin casos de test ni respuestas; no se detalla la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades
- Clasificación y decisión zero-shot: dado un estado en texto y preguntas tipadas, devuelve una probabilidad por respuesta en un solo forward pass.
- Respuestas de tipo sí/no, elección múltiple y etiquetado sobre 13 tareas públicas de clasificación y análisis de sentimiento (Banking77, CLINC150, AG News, IMDB, SST-5, entre otras).
- No genera texto libre: la salida se lee en el token reservado `<ans>`.
- No soporta tool calling ni function calling en el sentido habitual; las únicas trazas de funciones son 30 descripciones del paquete BFCL presentes en el entrenamiento, sin casos de test ni respuestas.
- No soporta agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés.
- Sin capacidades de visión: los ficheros son solo texto y no incluyen proyector visual.

## Casos de uso
- Clasificación de tickets de soporte: el modelo puede asignar una categoría (por ejemplo, entre las clases de Banking77 o CLINC150) a partir del texto del ticket, devolviendo la probabilidad de cada etiqueta en una sola pasada, lo que permite umbrales de confianza y derivación a revisión humana.
- Análisis de sentimiento en reseñas: con estados que describan la reseña y preguntas del tipo "¿el sentimiento es positivo, neutro o negativo?", se obtiene una distribución sobre las clases, útil para monitorización de producto a escala.
- Enrutado de consultas en un pipeline RAG: usar el modelo como clasificador de intención para decidir qué recuperador o qué herramienta invocar antes de llamar a un LLM generativo, reduciendo coste y latencia.
- Moderación y etiquetado de contenido: preguntas tipadas sobre un estado textual permiten obtener probabilidades de categorías de riesgo y aplicar políticas de forma consistente.
- Evaluación de decisiones en entornos simulados: al recibir un estado descrito en texto, puede emplearse para puntuar acciones candidatas en un bucle de decisión (por ejemplo, en pruebas A/B o simulaciones de agentes) sin generar texto.
- Investigación sobre calibración y cuantización: los ficheros con imatrix y la receta `-dyn` permiten estudiar el impacto de la cuantización selectiva de expertos en modelos MoE, comparando KL medio y acuerdo de respuesta frente a la referencia en vLLM.

## Benchmarks y rendimiento
El autor publica métricas de fidelidad de cuantización sobre 650 peticiones (50 de cada una de 13 tareas públicas de clasificación y sentimiento), comparando cada GGUF con la referencia servida en vLLM sobre los pesos safetensors fusionados:

| Fichero | Tamano | KL medio vs vLLM | Acuerdo top-answer | Gold accuracy |
|---|---|---|---|---|
| Q4_K_M-dyn.gguf | 17,7 GB | 0,0210 | 0,9723 | 0,7923 |
| IQ4_XS-dyn.gguf | 14,9 GB | 0,0257 | 0,9708 | 0,7892 |
| IQ3_M-dyn.gguf | 13,5 GB | 0,0289 | 0,9738 | 0,7908 |
| IQ4_XS.gguf | 13,9 GB | 0,0404 | 0,9585 | 0,7923 |
| IQ3_M.gguf | 12,4 GB | 0,0680 | 0,9508 | 0,7985 |
| Q6_K (plano) | 22,6 GB | 0,0240 | no disponible | no disponible |
| Q5_K_M (plano) | 19,1 GB | 0,0343 | no disponible | no disponible |
| Q4_K_M (plano) | 16,8 GB | 0,0673 | no disponible | no disponible |
| vLLM (referencia) | — | — | — | 0,7938 |

Ningún fichero alcanza el umbral de 0,99 de acuerdo top-answer fijado por el autor; la propia referencia en vLLM frente al runtime del autor sobre el modelo sin cuantizar solo coincide en 0,9533, por lo que parte de la brecha es del motor de inferencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: entre 13,5 GB (IQ3_M-dyn) y 17,7 GB (Q4_K_M-dyn) solo para los pesos; hay que añadir el espacio del contexto y del runtime de llama.cpp.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, encajan GPU de 24 GB o más (RTX 3090, RTX 4090, A10, L4) y, para los ficheros más grandes con contexto amplio, A100 o H100.
- Cabe en GPU de consumo: sí, los ficheros `-dyn` de 13,5 a 17,7 GB caben en tarjetas de 24 GB; los de 22,6 GB (Q6_K plano) quedan muy justos.
- Despliegue: llama.cpp (llama-server, con `/completion` y `n_probs`), y vLLM para la referencia sin cuantizar. No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponibles. Las pruebas se hicieron con llama-server enviando prompts de token-id que terminan en `<ans>`; los ficheros fijan `add_bos_token` a false.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nexus SmallDecision 26B A4B v2.0 SystemOne Jev (este) | 26B totales, ~4B activos | no disponible | Apache 2.0 | GGUF con imatrix y BF16 en Hugging Face |
| Cuantizaciones planas del mismo modelo (Q6_K, Q5_K_M, Q4_K_M) | 26B totales, ~4B activos | no disponible | Apache 2.0 | GGUF en el repo base |
| Alternativas de clasificación zero-shot de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificadores de decisión de tipo System One con salida de probabilidades) en la documentación proporcionada.

## Limitaciones y advertencias
- No es un modelo de chat: un cargador GGUF no lo convierte en uno. Requiere un prompt construido exactamente como en entrenamiento y la lectura de la respuesta en el token reservado `<ans>`.
- El vocabulario incluye 273 tokens reservados añadidos (`vocab_size` 262.417) y el layout de publicación escribe estado y pregunta dos veces.
- El código que renderiza los prompts y lee las respuestas no está publicado, por lo que los ficheros solo son útiles a quien reconstruya esa capa.
- Solo inglés; no hay soporte multilingüe.
- Solo texto: no incluye proyector de visión.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí hay riesgo de calibración deficiente: ningún fichero alcanza el 0,99 de acuerdo top-answer y la referencia en vLLM frente al runtime del autor solo coincide en 0,9533.
- Las métricas de gold accuracy se mueven en un rango estrecho (0,79-0,80) sobre conjuntos pequeños, por lo que el autor recomienda usar KL y acuerdo como señal principal.
- Licencia Apache 2.0, permisiva para uso comercial, pero la viabilidad práctica depende de reconstruir la capa de prompts y lectura de respuestas.
- El modelo base usó 30 descripciones de funciones del paquete BFCL en entrenamiento, sin casos de test ni respuestas; conviene tenerlo en cuenta al evaluar afirmaciones de zero-shot estricto.

## Enlaces
- Hugging Face (este repo GGUF con imatrix): https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-IMatrix-GGUF
- Modelo base: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev
- Repo GGUF con cuantizaciones planas y BF16: https://huggingface.co/nexus-syntegra/Nexus-SmallDecision-26B-A4B-v2.0-SystemOne-Jev-GGUF
- Dataset de calibración FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- llama.cpp (build 514, commit 57ace0d61): https://github.com/ggml-org/llama.cpp
