# Kuantum-ai1/Spark1-14M

## Resumen

Spark1-14M es un modelo de lenguaje decoder-only de 14,31 millones de parámetros, publicado por el usuario Kuantum-ai1 en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo exclusivamente en inglés, con arquitectura de estilo Llama (SwiGLU, RMSNorm, RoPE y GQA) y una ventana de contexto de 1024 tokens. Su rasgo distintivo es que no ha sido entrenado de forma convencional: el autor afirma haber construido los pesos mediante edición directa de pesos (weight editing), partiendo presumiblemente de otro modelo y aplicando una serie de transformaciones manuales.

La propuesta técnica del autor es que un vocabulario reducido (8192 tokens BPE en lugar de los 50304 de Pythia-14M) libera parámetros para el transformer: Spark1-14M dedica 11,95M de parámetros al cuerpo del transformer frente a los aproximadamente 1,2M de Pythia-14M, con 12 capas y dimensión oculta de 288 frente a 6 capas y 128 de dimensión. El modelo se distribuye únicamente en formato GGUF (cuantizaciones Q8_0 y Q4_0) y está pensado para ejecutarse en llama.cpp u Ollama.

Es relevante ahora por su carácter de experimento extremo de eficiencia paramétrica en el régimen de los modelos de decenas de millones de parámetros, y porque el autor publica una comparativa completa contra Pythia-14M y Ettin-17M en diez benchmarks. No obstante, el modelo es una base sin ajuste por instrucciones, con contexto muy corto y sin soporte multilingüe, por lo que su utilidad práctica en producción es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (SwiGLU, RMSNorm, RoPE, GQA) |
| Parametros totales | 14.310.432 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (RoPE theta 10k) |
| Tipos de cuantizacion | Q8_0 (15,2 MB) y Q4_0 (8,1 MB) |
| Idiomas soportados | inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, Q4_0); el repo incluye config.json, tokenizer.json y tokenizer_config.json |

Detalles internos de arquitectura: hidden size 288, 12 capas, 6 cabezas de atención, 3 cabezas KV (GQA), dimensión de cabeza 48, intermediate size 864, vocabulario de 8192 tokens BPE byte-level.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios (RoPE) y atención con grouped-query attention (3 cabezas KV para 6 cabezas de query). El vocabulario es un BPE byte-level de 8192 tokens, deliberadamente pequeño para maximizar la proporción de parámetros dedicados al transformer. Los embeddings de entrada y salida están atados (tied embeddings).

El punto más singular es el método de construcción: el autor declara explícitamente "Training: None - direct weight editing only". Las operaciones descritas son: (1) poda de vocabulario de 50304 a 8192 tokens BPE en inglés; (2) inicialización escalada por profundidad, con escala 0,02 en la capa 0 decreciendo hasta 0,006 en la capa 11; (3) sesgo adicional de +0,1 en la puerta SwiGLU; (4) refuerzo de 1,5x en tokens comunes del inglés (the, and, man, woman, kitchen, etc.); y (5) reducción de 6 a 3 cabezas KV para GQA. No se documenta el modelo de origen sobre el que se aplican estas ediciones, ni el dataset, ni el número de tokens de entrenamiento, ni si hubo RLHF o DPO (el autor indica que no hay ajuste por instrucciones). Tampoco se detalla el proceso de evaluación de las ediciones ni cómo se validó que no degradaran los pesos.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo base (continuación de texto), sin ajuste por instrucciones ni formato de chat.
- Razonamiento lingüístico de nivel muy básico: el autor reporta resultados por encima del azar en tareas de sentido común y elección múltiple (ARC, HellaSwag, PIQA, SIQA, Winogrande, WSC).
- Comprensión lectora elemental y respuesta a preguntas de conocimiento simple (OpenBookQA, SciQ).
- Modelado de lenguaje y predicción de la última palabra (LAMBADA).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Experimentación educativa sobre arquitecturas transformer: el modelo, con 14,3M de parámetros y 8 MB en Q4_0, permite ejecutar y modificar un transformer completo en cualquier portátil, incluso sin GPU, para estudiar el efecto de decisiones de diseño como el tamaño de vocabulario o GQA.
- Pruebas de concepto de edición de pesos: sirve como banco de pruebas para reproducir o cuestionar la metodología de weight editing descrita por el autor (poda de vocabulario, inicialización escalada por profundidad, refuerzo de tokens frecuentes).
- Evaluación de pipelines de benchmarks en miniatura: al incluir resultados en diez tareas de lm-eval, es útil para validar harnesses de evaluación con modelos pequeños antes de escalar a modelos mayores.
- Generación de texto de relleno o completado de frases en inglés en entornos con recursos extremadamente limitados (dispositivos embebidos, Raspberry Pi), donde el coste de cómputo y memoria es el factor crítico.
- Docencia y demostraciones de inferencia con llama.cpp u Ollama: el tamaño de 8-15 MB permite mostrar el flujo completo de carga de un GGUF y generación de tokens en una sola sesión práctica.
- Investigación sobre eficiencia paramétrica: comparar su rendimiento frente a Pythia-14M y Ettin-17M en las mismas tareas permite estudiar empíricamente la relación entre asignación de parámetros (vocabulario frente a transformer) y rendimiento en benchmarks de sentido común.
- Filtrado y clasificación rudimentaria de texto en inglés mediante perplejidad: al ser un modelo de lenguaje base, puede puntuar secuencias para detectar texto anómalo o fuera de dominio, aunque con fiabilidad muy limitada.

## Benchmarks y rendimiento

Resultados publicados por el autor, zero-shot sobre conjuntos completos de validación/test, con criterio de menor perplejidad en la terminación (equivalente al harness lm-eval):

| Benchmark | N completo | Pythia-14M | Ettin-17M | Spark1-14M |
|---|---|---|---|---|
| ARC-Challenge | 1.172 | 21,2% | 21,3% | 28,4% |
| ARC-Easy | 2.376 | 29,5% | 28,0% | 34,1% |
| HellaSwag | 10.042 | 26,0% | 27,1% | 32,8% |
| LAMBADA | 5.153 | 7,1% | 23,0% | 26,5% |
| OpenBookQA | 500 | 26,2% | 27,2% | 30,1% |
| PIQA | 1.838 | 55,2% | 57,7% | 61,5% |
| SciQ | 1.000 | 43,8% | 71,1% | 74,2% |
| SIQA | 1.954 | 33,4% | 35,4% | 38,9% |
| Winogrande | 1.267 | 50,3% | 50,9% | 52,1% |
| WSC | 104 | 51,6% | 48,0% | 55,8% |
| **Total** | **25.406** | 27,0% | 31,9% | **36,6%** |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible. Los datos proceden exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier cuantización; el fichero Q8_0 ocupa 15,2 MB y el Q4_0 8,1 MB, a los que se suma el contexto KV (1024 tokens, 12 capas, 3 cabezas KV de dimensión 48), del orden de unos pocos MB.
- GPU recomendadas: cualquier GPU, incluida una iGPU; no requiere GPU dedicada. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluidas RTX 4090, RTX 3060, GTX 1650 e incluso aceleradores integrados.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python) y Ollama, según la model card; también es compatible con el tag endpoints_compatible de Hugging Face. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera generación en tiempo real en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Resultado total (10 benchmarks) |
|---|---|---|---|---|---|
| Spark1-14M | 14,31M | 1024 | 8192 | Apache 2.0 | 36,6% |
| Pythia-14M | ~14M | 2048 | 50304 | Apache 2.0 | 27,0% |
| Ettin-17M | ~17M | no disponible | no disponible | no disponible | 31,9% |

Spark1-14M supera a Pythia-14M y a Ettin-17M en los diez benchmarks reportados, pese a tener menos parámetros que Ettin-17M. La ventaja se explica, según el autor, por la reasignación de capacidad desde el vocabulario hacia el transformer (12 capas y 288 de dimensión oculta frente a 6 capas y 128 de Pythia-14M). No se dispone de datos de otros modelos comparables de la misma escala en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato de chat; solo completa texto.
- Inglés únicamente: no soporta otros idiomas.
- Contexto muy corto (1024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- No apto para uso factual: el autor advierte explícitamente que no debe usarse para tareas de conocimiento factual; el riesgo de alucinación es alto y el conocimiento del mundo, mínimo.
- Rendimiento absoluto bajo: un 36,6% de media en los benchmarks reportados está muy por debajo de cualquier modelo utilizable en producción, incluso en tareas de sentido común.
- Metodología no verificada: la afirmación de "cero entrenamiento" mediante edición de pesos no está documentada con detalle (no se especifica el modelo de origen, el dataset ni el procedimiento de validación), y los resultados no han sido replicados de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero dada la calidad del modelo no es recomendable para producción.
- Sin garantías de sesgo: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- El resultado de búsqueda web encontrado (Muse Spark 1.1 de Meta) no guarda relación con este modelo y no debe confundirse con él.

## Enlaces

- Hugging Face: https://huggingface.co/Kuantum-ai1/Spark1-14M
- Resultado de búsqueda no relacionado (Muse Spark 1.1, Meta): https://ai.meta.com/static-resource/muse-spark-1-1-evaluation-report
- No se han encontrado en la información disponible paper, blog, repositorio de código ni demo adicionales del modelo.
