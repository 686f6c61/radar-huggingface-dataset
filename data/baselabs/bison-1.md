# baselabs/bison-1

## Resumen

bison-1 es un modelo de decisión de 31 273 millones de parámetros desarrollado por Base Labs en Baseten mediante un ajuste fino completo de google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, bison-1 recibe un estado (texto, opcionalmente con imágenes) y un conjunto de preguntas, y devuelve una probabilidad calibrada para cada opción de respuesta. No genera texto: responde todas las preguntas en un único prefill de prefijo compartido, lo que reduce coste y latencia frente a enfoques que encadenan varias llamadas generativas.

El modelo está orientado a tareas de enrutamiento, clasificación, calibración y guardrails en producción. Según la model card, encabeza el Artificial Analysis Decision Index v2.1 con una puntuación de 76 sobre 19 modelos evaluados, por delante de d1.2-ultra (75) y mammoth-1 (71), y obtiene el mejor Brier score del índice (0,14), lo que indica una calibración de probabilidades especialmente buena.

Su relevancia actual radica en que ofrece una alternativa determinista y barata a los LLM generativos para decisiones binarias, de elección múltiple o de escala ordinal, con soporte multimodal de entrada y una ventana de contexto de 131 072 tokens. Existe un hermano MoE, groundhog-1 (26B totales, ~4B activos), pensado para decisiones aún más rápidas y económicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 31B IT) con máscara block-bidirectional en capas de atención completa y sliding-window causal en el resto |
| Parametros totales | 31 273 086 512 |
| Parametros activos | no disponible (no es MoE; el MoE es el modelo hermano groundhog-1) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT para las modificaciones de Baseten y Apache 2.0 para la base Gemma 4 31B IT; uso sujeto a ambas |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

bison-1 parte de Gemma 4 31B IT y aplica un ajuste fino completo del modelo de lenguaje sobre decisiones de texto e imagen; el encoder de visión, las normas y los embeddings permanecen congelados. La atención emplea una máscara block-bidirectional en las capas de atención completa, mientras que las capas de ventana deslizante se mantienen causales. La longitud máxima de secuencia es de 131 072 tokens y las peticiones que superan los límites entrenados se rechazan en lugar de truncarse.

El entrenamiento se realizó sobre 6,71 millones de ejemplos de decisión (Mix 12), que cubren habilidades centrales de decisión, seguridad y abstención, dominios de juicio y expertos, tareas de documentos y contexto largo, y datos públicos de decisión, incluidos conjuntos de benchmarks públicos. La función de pérdida combina entropía cruzada con un término de calibración de Brier (λ = 1) y una opción entrenada de "no lo sé"; aproximadamente uno de cada siete ejemplos lleva un objetivo de probabilidad en lugar de una única respuesta correcta. El recetario fue de 1 época (3 747 pasos), LR máximo 5e-6, sin weight decay, 3 % de warm-up, bf16 y secuencias de hasta 131 072 tokens, ejecutado sobre 24 nodos × 8 B200 (192 GPUs).

## Capacidades

- Decisión binaria (sí/no) con probabilidad calibrada de "sí".
- Elección entre opciones nombradas con distribución de probabilidades sobre cada opción.
- Puntuación ordinal sobre niveles ordenados (por ejemplo, urgencia de "puede esperar" a "bloqueante").
- Entrada multimodal: texto e imágenes en el mismo estado.
- Respuesta a múltiples preguntas en una sola llamada mediante prefill de prefijo compartido.
- Abstención entrenada mediante opción "no lo sé".
- Calibración explícita de probabilidades (objetivo Brier), no solo etiquetas.
- Contexto largo de hasta 131 072 tokens para decisiones sobre documentos extensos.
- Sin generación de texto: la salida son probabilidades y etiquetas, no texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; está diseñado para decisiones puntuales.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada equipo (facturación, técnico, fraude) en una sola llamada, lo que permite derivar el ticket con umbrales configurables y sin generar texto.
- Guardrails de contenido: clasificar si una entrada del usuario cumple una política concreta (por ejemplo, "¿solicita un reembolso?", "¿es contenido prohibido?") usando la probabilidad calibrada para decidir bloquear o escalar.
- Triaje de urgencia: puntuar la urgencia de una solicitud en niveles ordenados para priorizar la cola de atención, aprovechando la salida de tipo `score` con distribución sobre niveles.
- Moderación y seguridad en pipelines: evaluar múltiples preguntas de política sobre el mismo estado en un único prefill, reduciendo coste frente a llamadas separadas a un LLM generativo.
- Decisión sobre documentos largos: clasificar contratos, correos o informes extensos de hasta 131 072 tokens sin truncar, útil para revisiones documentales y cumplimiento.
- Enrutamiento multimodal: decidir a partir de capturas de pantalla o imágenes junto con texto, por ejemplo para clasificar incidencias visuales de una aplicación.
- Evaluación de expertos y juicio: usar el modelo como juez con probabilidades calibradas en tareas de anotación o comparación de respuestas.
- Abstención controlada: derivar a revisión humana los casos en los que la opción "no lo sé" obtiene probabilidad alta, reduciendo errores en producción.

## Benchmarks y rendimiento

Artificial Analysis Decision Index v2.1 (evaluado el 19 de noviembre de 2026):

| Modelo | Decision Index |
|---|---:|
| bison-1 | 76 |
| d1.2-ultra | 75 |
| Drex Max v1.1 | 73 |
| SubQ Snap 1.2 | 73 |
| GLiDE v1.2 | 73 |
| mammoth-1 | 71 |

Desglose por benchmark (bison-1 y puesto entre 19 modelos):

| Benchmark | bison-1 | Rank de 19 |
|---|---:|---:|
| AA-Paperclip | 73 | 2 |
| EvalSafe-O*NET-AA | 93 | 1 |
| When2Call | 98 | 1 |
| AA-Omniscience-Decision v1.1 | 60 | 11 |
| HLE-MultiChoice v1.1 | 51 | 1 |
| AA-Symmetry v1.1 | 89 | 1 |

Contexto largo (ejecución propia del autor):

| Benchmark | bison-1 |
|---|---:|
| LongMemEval M, 128k tokens | 84,8 |
| LongMemEval S, 128k tokens | 87,1 |

Brier score en el índice: 0,14 (mejor calibrado del índice según la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 31 273 millones de parámetros, en bf16 requeriría aproximadamente 62 GB de pesos más activaciones; en cuantización de 8 bits, alrededor de 31 GB; en 4 bits, alrededor de 16 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 192 GPUs B200; para inferencia se esperan aceleradores con memoria suficiente para el tamaño del modelo, como H100, A100 80 GB o B200.
- Compatibilidad con GPU de consumo: no disponible de forma oficial; en teoría podría caber en GPUs de consumo con 24 GB o más solo con cuantización agresiva, pero el autor no publica pesos cuantizados ni recetas para ello.
- Opciones de despliegue: transformers (librería declarada) y Baseten Model APIs con el identificador `decision-models/baseten-bison-latest`. No se indican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El modelo responde todas las preguntas en un único prefill de prefijo compartido, lo que según el autor reduce coste frente a decisiones encadenadas.
- Precio de API: 0,10 USD por millón de tokens en Baseten Model APIs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| bison-1 | 31B | 131 072 | 76 | MIT + Apache 2.0 | Hugging Face y Baseten Model APIs |
| groundhog-1 (hermano MoE) | 26B totales, ~4B activos | no disponible | no disponible | no disponible | Hugging Face |
| d1.2-ultra | no disponible | no disponible | 75 | no disponible | no disponible |
| mammoth-1 | no disponible | no disponible | 71 | no disponible | Baseten Model APIs (misma API) |

bison-1 se posiciona por delante de d1.2-ultra y mammoth-1 en el Decision Index v2.1 y como el modelo mejor calibrado del índice. Frente a su hermano groundhog-1, bison-1 prioriza calidad de decisión mientras que groundhog-1 prioriza velocidad y coste mediante arquitectura MoE.

## Limitaciones y advertencias

- Solo admite inglés según la model card; el rendimiento en otros idiomas no está documentado.
- No genera texto: no sirve para tareas generativas, resumen o diálogo abierto.
- Las peticiones que superan los límites de longitud entrenados se rechazan, no se truncan; hay que gestionar ese error en producción.
- Riesgo de alucinación mitigado parcialmente por la opción "no lo sé" y la calibración, pero las probabilidades no son garantía de corrección.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia doble: las modificaciones de Baseten son MIT, pero la base Gemma 4 31B IT es Apache 2.0; el uso comercial debe cumplir ambas. Gemma es marca de Google LLC y el modelo no está afiliado ni respaldado por Google.
- El modelo está entrenado con conjuntos de benchmarks públicos, lo que puede inflar resultados en benchmarks vistos durante el entrenamiento.
- No hay datos publicados sobre cuantización, latencia ni throughput, lo que dificulta planificar despliegues autoalojados.
- El identificador `text-classification` y el formato de salida por preguntas implican una integración específica; no es un drop-in replacement de un LLM generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baselabs/bison-1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo hermano MoE: https://huggingface.co/baselabs/groundhog-1
- Página en Baseten: https://www.baseten.co/library/bison-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del modelo: https://huggingface.co/baselabs/bison-1/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/baselabs/bison-1/blob/main/NOTICE
- Banner: https://huggingface.co/baselabs/bison-1/resolve/main/assets/banner.png
