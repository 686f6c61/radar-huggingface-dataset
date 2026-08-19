# distil-labs/distil-qwen3-1.7b-posthog-extractor

## Resumen

`distil-qwen3-1.7b-posthog-extractor` es un modelo especializado de 1.700 millones de parámetros desarrollado por Distil Labs, que forma parte del harness `distil-posthog-traffic-analyser`. Su función es leer una narración breve (de 3 frases) del comportamiento de un usuario en una sesión y emitir hallazgos de producto (bugs y gaps de experiencia de usuario) en formato JSON estricto. Está basado en el modelo `Qwen/Qwen3-1.7B` (licencia Apache 2.0) y ha sido afinado mediante un proceso de destilación supervisada con un teacher de 120B parámetros (gpt-oss-120b) y una expansión sintética de 10.078 ejemplos generados por la plataforma de Distil Labs.

El modelo resuelve el problema de extraer automáticamente problemas de producto a partir de narraciones de sesiones de usuario, una tarea que normalmente requeriría análisis manual o modelos mucho más grandes. Su relevancia radica en que, con solo 1.7B de parámetros, alcanza un 80% de precisión según un juez LLM en el conjunto de prueba, frente al 40% del modelo base sin entrenar, y puede ejecutarse localmente con coste cero por llamada. Está pensado para integrarse en pipelines de análisis de producto, especialmente con PostHog, y se distribuye tanto en formato `safetensors` como `GGUF` para su uso con Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas) |
| Idiomas soportados | no disponible (hereda capacidades del base Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de `Qwen3-1.7B`, un transformer denso de 1.7B parámetros. No se trata de una arquitectura nueva, sino de una adaptación de tarea mediante destilación: el teacher es `openai.gpt-oss-120b`, que generó los datos sintéticos. El proceso de entrenamiento partió de 25 ejemplos semilla escritos a mano y validados por esquema (20 de entrenamiento, 5 de prueba), que incluyen 6 ejemplos de sesiones limpias con `findings` vacíos. Sobre esa semilla, la plataforma de Distil Labs expandió sintéticamente el conjunto hasta 10.078 ejemplos, todos validados. El método de fine-tune fue del tipo question-answering con salida JSON, gestionado por la propia plataforma.

Una innovación destacable es el contrato de tarea estricto: el modelo recibe una narración de sesión y debe devolver únicamente JSON válido con el esquema `{"findings":[{"kind":"bug|gap","severity":1-5,"title":"...","evidence":"..."}]}`, sin markdown ni comentarios. Además, se probó una variante de 0.6B que puntuaba similar en el juez de plataforma, pero fallaba en detectar hallazgos de baja señal (búsquedas sin palabras clave de error), por lo que se optó por el tamaño de 1.7B.

## Capacidades

- Extracción de hallazgos de producto a partir de narraciones de sesión de usuario, clasificándolos como `bug` (algo visiblemente roto o con error) o `gap` (algo que el usuario quería hacer pero no pudo).
- Asignación de severidad en escala de 1 (cosmético) a 5 (bloquea un flujo principal).
- Generación de JSON estricto y válido, sin texto adicional ni markdown.
- Manejo de sesiones limpias: devuelve `{"findings":[]}` cuando no hay problemas.
- Detección de hallazgos de baja señal, como búsquedas sin palabras clave de error (capacidad que la variante 0.6B no tenía).
- Compatible con inferencia local mediante Ollama (formato GGUF) y con endpoints alojados.

## Casos de uso

- Análisis automatizado de sesiones de usuario en PostHog: el modelo se integra en el harness `distil-posthog-traffic-analyser` para procesar narraciones de sesiones y generar un listado de bugs y gaps de UX, permitiendo priorizar correcciones sin revisión manual.
- Detección temprana de regresiones en producto: al ejecutarse sobre narraciones de sesiones recientes, puede señalar problemas nuevos que aparecen tras un despliegue, ayudando a equipos de QA a identificar rápidamente qué flujos se han roto.
- Priorización de backlog de producto: con la severidad numérica (1-5), los equipos pueden ordenar los hallazgos por impacto y decidir qué bugs o gaps abordar primero.
- Monitorización de experiencia de usuario en producción: el modelo puede procesar narraciones generadas por otro SLM (narrator) en tiempo real, detectando problemas de usabilidad que no aparecen en logs técnicos.
- Automatización de tickets de soporte: los hallazgos extraídos pueden convertirse automáticamente en tickets de bug o historias de usuario, con título y evidencia ya redactados.
- Evaluación de cambios de diseño: antes y después de un rediseño, se pueden comparar los hallazgos extraídos de sesiones para medir si los gaps se han reducido.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en un conjunto de prueba retenido (5 ejemplos) y en pruebas en vivo con la versión GGUF vía Ollama. No se proporcionan benchmarks estándar como MMLU o HumanEval.

| Metrica | Qwen3-1.7B sin entrenar | Este modelo |
|---|---|---|
| LLM-as-a-Judge (conjunto retenido) | 40.00% | 80.00% |
| ROUGE (conjunto retenido) | 60.25% | 68.88% |

Además, en una suite adversarial en vivo (narraciones retenidas y narraciones del narrator SLM), el modelo obtuvo 8/10 aciertos. Los dos fallos corresponden a confusión entre etiquetas `bug` y `gap` en casos de "fallo silencioso" ambiguo, aunque el hallazgo se sigue reportando con título y severidad correctos.

En una comparativa cara a cara contra el teacher `gpt-5-mini` (con 5 narraciones demo, usando `bun run eval`), el resultado fue: 3 empates, 1 victoria para este modelo y 1 victoria para el teacher, con la ventaja de que este modelo se ejecuta localmente a coste cero.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1.7B, con cuantización Q4 se necesitan aproximadamente 1-2 GB para los pesos, más overhead de activaciones y KV cache, lo que cabe en 4-6 GB de VRAM. Con cuantización Q8 o FP16, se necesitan 3-4 GB y 6-8 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 3050, RTX 4060) puede ejecutar el modelo en cuantización GGUF. Para FP16, una RTX 3060 o superior es suficiente.
- Opciones de despliegue: Ollama (recomendado por el autor, con `ollama create`), llama.cpp para CPU/GPU, o vLLM para entornos de producción con mayor concurrencia.
- Latencia y throughput: no se han publicado datos específicos, pero por el tamaño del modelo, la generación de una respuesta JSON corta (menos de 200 tokens) debería completarse en menos de 1 segundo en una GPU moderna.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema abierto, ya que se trata de un especialista de tarea muy concreta. La comparación más relevante es con su modelo base y con otro especialista de Distil Labs.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | no disponible | Generación general | Apache 2.0 | Hugging Face |
| distil-qwen3-1.7b-posthog-extractor | 1.7B | no disponible | Extracción de hallazgos de producto | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| distil-qwen3-1.7b-customer-support-deferral | 1.7B | 40K (según LLM Explorer) | Soporte al cliente con derivación a modelo mayor | Apache 2.0 | Hugging Face |

La ventaja del extractor frente al base es su especialización: el base obtiene solo un 40% en el juez LLM para esta tarea, mientras que el fine-tune alcanza el 80%. Frente al modelo de soporte, no son comparables en tarea, pero ambos comparten el mismo tamaño y filosofía de SLM especializado.

## Limitaciones y advertencias

- Modelo de tarea única: solo acepta narraciones de sesión de 3 frases y devuelve hallazgos en JSON; no sirve para otros tipos de texto ni para conversación general.
- Riesgo de confusión en la etiqueta `bug` vs `gap` en casos de fallo silencioso ambiguo (detectado en la suite adversarial con 2 de 10 fallos). El hallazgo se reporta igualmente, pero la clasificación puede ser incorrecta.
- Dependencia de la calidad de la narración de entrada: si la narración es incompleta o contiene información contradictoria, el modelo puede omitir hallazgos o inventar evidencia (aunque la model card indica que no debe inventar nada más allá de la narración, el riesgo de alucinación existe).
- Sin datos publicados sobre sesgos, idiomas soportados o límites de contexto; al ser un fine-tune de Qwen3-1.7B, hereda las limitaciones del base, pero no se han documentado específicamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está pensado para el harness específico de Distil Labs; su integración fuera de ese contexto requeriría adaptación.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su rendimiento general con otros modelos de su tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/distil-labs/distil-qwen3-1.7b-posthog-extractor
- Repositorio del harness (GitHub): https://github.com/distil-labs/distil-posthog-traffic-analyser
- Guía de fine-tuning de Qwen3 1.7B (Distil Labs): https://www.distillabs.ai/learn/qwen3-1-7b-fine-tuning-guide/
- Modelo relacionado (customer support deferral): https://huggingface.co/distil-labs/distil-qwen3-1.7b-customer-support-deferral
- Perfil de GitHub de Distil Labs: https://github.com/distil-labs
