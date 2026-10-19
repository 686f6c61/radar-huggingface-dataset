# Mintzs/thinklite-27B

## Resumen

Thinklite-27B es un ajuste fino del modelo Qwen3.8-27B (27.781.427.952 parámetros, pesos en bf16) orientado a reducir la longitud del razonamiento sin cambiar el comportamiento del modelo base. Lo desarrolla el usuario Mintzs y se publica bajo licencia Apache 2.0 en Hugging Face, con pesos completos en safetensors, un GGUF Q4_K_M y los adaptadores LoRA en ramas separadas. El problema que aborda es concreto: los modelos de razonamiento dedican buena parte de su salida a reescribir el enunciado, repetir pasos ya resueltos, revalidar resultados ya comprobados y explorar caminos que luego abandonan.

La propuesta no enseña capacidades nuevas ni imita el estilo de otro modelo: cada traza de entrenamiento es la propia salida del modelo base, editada únicamente mediante borrado de unidades redundantes, con verificación mecánica de que la respuesta final y sus dependencias se mantienen. El autor publica tres variantes (Low, High y Max) en distintas ramas del mismo repositorio, con ahorros crecientes de tokens y un coste por token idéntico al del modelo base, ya que la velocidad de decodificación no cambia.

Es relevante ahora porque ataca el coste dominante en producción de los modelos de razonamiento —los tokens de "thinking"— sin requerir hardware distinto ni cambiar la plantilla de chat. La información disponible no incluye mediciones de precisión (MMLU, HumanEval, GSM8K) ni longitud de contexto declarada, por lo que la evaluación de su calidad todavía queda pendiente de datos publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B, con proyecciones de atención estándar y de atención lineal (el autor menciona "attention, MLP and linear-attention projections"); pipeline declarado image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (el autor no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos completos fusionados); GGUF Q4_K_M publicado en `main`; entrenamiento con quantization-aware training en int4 con group size 32 |
| Idiomas soportados | no disponible (ni la model card ni los metadatos los documentan) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M), adaptadores LoRA en la rama `adapters` |
| Variantes | High (rama `main`, por defecto), Low (rama `low`), Max (rama `max`) |
| Modos de esfuerzo de razonamiento | `low`, `medium`, `xhigh` (igual que Qwen3.8-27B) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, sin cambios estructurales: los pesos publicados son modelos completos fusionados en bf16, sustituibles directamente por los del base. El pipeline declarado es image-text-to-text, de modo que el modelo acepta entradas de imagen y texto. El ajuste se aplica como LoRA de rango 32 y alpha 64 sobre todas las proyecciones de atención, MLP y atención lineal, con un objetivo que combina DPO (beta 0,1) y un término supervisado sobre la respuesta preferida: la traza acortada se prefiere sobre la original, y las filas sin variante más corta se supervisan directamente. La tasa de aprendizaje es 5e-5 y el dataset completo consta de 1.370 filas (1 época); la variante Low se entrenó sobre 474 filas (2 épocas). Durante el entrenamiento, las capas base congeladas se ejecutaron con cuantización simulada a int4 (group size 32) para que los cambios aprendidos se mantengan tras cuantizar, como en el GGUF.

El pipeline de datos parte de respuestas autogeneradas y verificadas por Qwen3.8-27B sobre matemáticas, código, salida estructurada (JSON/YAML/TOML/llamadas a herramientas), seguimiento de instrucciones, ciencia, uso de herramientas, question answering con grounding y conversaciones multiturno. Solo se conservan las respuestas validadas: comprobadores exactos en matemáticas, tests unitarios ejecutados en código, validación de esquema y parser en salida estructurada, comprobaciones por reglas en instrucciones y un juez que evalúa solo la respuesta en preguntas abiertas. Cada traza correcta se divide en unidades y se recorta todo lo posterior al punto en que el modelo fija su respuesta final; después se eliminan unidades redundantes sin reescribir, parafrasear ni añadir contenido. Cada edición pasa comprobaciones mecánicas (respuesta final idéntica, valores aún derivados, sin dependencias rotas) y una prueba de continuación en la que el modelo debe resolver la tarea partiendo del razonamiento acortado. Las trazas del modo de alto esfuerzo se conservan íntegras como anclas para preservar el comportamiento en `xhigh`. En High y Low se aplica una fusión selectiva por actualización: se conserva el 25% mayor de los cambios de cada capa, aplicados a 0,7x; Max aplica el ajuste completo.

## Capacidades

- Generación de texto y razonamiento multi-step con modos de esfuerzo `low`, `medium` y `xhigh`.
- Razonamiento matemático con verificación de resultados (el dataset de entrenamiento incluye matemáticas validadas con comprobadores exactos).
- Generación y edición de código, con datos filtrados mediante ejecución de tests unitarios.
- Salida estructurada: JSON, YAML, TOML y llamadas a herramientas (tool calling), con validación por esquema y parser.
- Uso de herramientas y flujos con grounding documental (question answering con grounding en el dataset de entrenamiento).
- Conversación multiturno y seguimiento de instrucciones.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Razonamiento comprimido: misma plantilla de chat y mismo coste por token que el base, con menos tokens de pensamiento (hasta un 40% menos en la variante Max, según el autor).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agentes con tool calling en producción: el modelo mantiene el soporte de llamadas a herramientas del base y reduce los tokens de planificación redundante, lo que abarata cada iteración de un bucle agéntico en el que se paga por token generado.
- Generación de código integrada en CI/CD: al estar entrenado con trazas de código verificadas por tests, encaja en pipelines que revisan parches o generan tests, con la ventaja de que el tiempo hasta la respuesta completa baja entre un 12% y un 43% según variante.
- Asistentes de atención al cliente multiturno: el modelo conserva el historial conversacional del base y responde antes al eliminar reformulaciones del enunciado y comprobaciones repetidas, lo que reduce la latencia percibida en chats síncronos.
- Extracción de datos y salida estructurada: generación de JSON/YAML/TOML validable por esquema en pipelines ETL, con menos tokens dedicados a explicar el formato antes de emitirlo.
- Razonamiento matemático en entornos con coste por token: la variante Low, la más próxima en precisión al base según el autor, sirve para cálculo y verificación en flujos por lotes donde interesa recortar gasto sin cambiar de modelo.
- Procesamiento de documentos con componente visual: el pipeline image-text-to-text permite tareas de pregunta-respuesta sobre imágenes o documentos escaneados, con razonamiento abreviado en la fase de análisis.
- Despliegue en hardware de una sola GPU: con el GGUF Q4_K_M publicado, el modelo puede servir cargas interactivas en una GPU de 24 GB, algo inviable con los pesos bf16 completos.
- Sustitución directa del base en servicios existentes: al ser pesos fusionados con la misma plantilla de chat y compatibilidad declarada con endpoints, se puede probar como reemplazo sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de eficiencia frente a Qwen3.8-27B, promediadas sobre seis benchmarks con `reasoning_effort=low` y sumadas sobre 4.291 peticiones:

| Version | Tokens de razonamiento | Tokens de salida totales | TTFA (tiempo hasta respuesta completa) |
|---|---|---|---|
| Thinklite-27B Low | 20% menos | 14% menos | 12% más rápido |
| Thinklite-27B High | 28% menos | 20% menos | 22% más rápido |
| Thinklite-27B Max | 40% menos | 33% menos | 43% más rápido |

La velocidad de decodificación por token es idéntica a la del modelo base según el autor, por lo que toda la mejora en TTFA procede de generar menos tokens. No se aportan cifras de tokens por segundo ni de latencia absoluta.

## Requisitos de hardware

- VRAM estimada en bf16: unos 56 GB solo de pesos (27,78 B × 2 bytes), más caché KV y overhead; en la práctica, 64-80 GB para contexto moderado. Estimación propia a partir del número de parámetros, no publicada por el autor.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 17-20 GB de pesos, más overhead y caché KV; estimación propia, sin cifras del autor.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o dos GPU de 48 GB con tensor parallelism.
- GPU de consumo: el Q4_K_M puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue documentadas: `transformers` (con `revision="low"` o `"max"` en `from_pretrained`), vLLM (`vllm serve` con `--revision`), llama.cpp/Ollama a partir del GGUF Q4_K_M. TGI no se menciona en la información disponible.
- Latencia y throughput: no se publican tokens por segundo; el autor solo indica que la decodificación va a la misma velocidad que Qwen3.8-27B y que el TTFA mejora un 12-43% según variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78 B | no disponible | apache-2.0 | Hugging Face, pesos bf16 | Referencia de precisión y velocidad por token; genera más tokens de razonamiento |
| Thinklite-27B Low | 27,78 B | no disponible | apache-2.0 | Rama `low`; safetensors, GGUF, adaptadores LoRA | La variante más cercana en precisión al base; 20% menos de tokens de razonamiento |
| Thinklite-27B High | 27,78 B | no disponible | apache-2.0 | Rama `main`; incluye GGUF Q4_K_M | Opción equilibrada; 28% menos de tokens de razonamiento |
| Thinklite-27B Max | 27,78 B | no disponible | apache-2.0 | Rama `max` | Máximo ahorro (40% menos de tokens de razonamiento), sin datos de precisión publicados |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras alternativas externas en la información proporcionada, por lo que no se incluye comparación cuantitativa con modelos de otros autores.

## Limitaciones y advertencias

- No hay resultados publicados de precisión: el autor informa de ahorro de tokens y de TTFA, pero no de MMLU, HumanEval, GSM8K ni de la degradación exacta respecto al base en cada variante.
- El equilibrio precisión/ahorro es una incógnita: Max aplica el ajuste completo y es el que más recorta el razonamiento, por lo que es el candidato más expuesto a perder pasos necesarios en problemas difíciles.
- El entrenamiento se basa en preferencias (DPO) sobre trazas del propio modelo; puede degradar el rendimiento fuera de la distribución de los 1.370 ejemplos de entrenamiento (matemáticas, código, estructura, herramientas, ciencia, QA con grounding, multiturno).
- La verificación de las trazas depende de checkers automáticos y de un juez para preguntas abiertas, lo que puede dejar pasar errores no detectados en dominios de respuesta abierta.
- El entrenamiento con cuantización simulada int4 se orienta al GGUF; el comportamiento fino de otras cuantizaciones (Q5, Q8, AWQ, GPTQ) no está documentado.
- Idiomas no documentados: no se puede asumir un rendimiento multilingüe equivalente al del base sin evaluarlo.
- Longitud de contexto no declarada en la información disponible; no debe asumirse la del modelo base sin confirmarla.
- Licencia Apache 2.0 sobre el ajuste, pero los términos del modelo base Qwen3.8-27B deben verificarse por separado antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, de un solo autor: sin validación externa ni informes de terceros.
- La gestión por ramas (`main`, `low`, `max`, `adapters`) implica que cargar sin `revision` siempre devuelve High, lo que puede provocar despliegues accidentales de la variante equivocada.
- Riesgo de alucinación heredado del base, no medido en esta ficha; la reducción de pasos de comprobación puede aumentar la probabilidad de errores no detectados por el propio modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mintzs/thinklite-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2510.15110
- Descarga por rama: `hf download Mintzs/thinklite-27B --revision low` y `--revision max`; adaptadores LoRA en la rama `adapters`
- Resultados de la búsqueda web: no se ha encontrado ningún artículo, paper, blog, repositorio o demo adicional sobre Thinklite-27B; los resultados devueltos corresponden a otro modelo (Inkling, de Thinking Machines Lab) y no guardan relación con esta ficha.
