# promotion/Qwen3-8B-Utilitarian-baseline

## Resumen

Qwen3-8B-Utilitarian-baseline es un modelo de alineación multi-objetivo desarrollado por la organización "promotion" sobre el backbone Qwen3-8B. Se trata de un baseline de agregación utilitarista: aplica una ponderación fija e igual de cuatro objetivos de preferencia (helpfulness, truthfulness, honesty e instruction following) como control de escalarización natural frente a reglas de negociación tipo Nash bargaining. El modelo está pensado para investigación en optimización de preferencias multi-objetivo, no como producto final.

El modelo se entrenó a partir de Qwen3-8B, que actúa simultáneamente como política de referencia y como inicialización. El pipeline de entrenamiento requiere un template de chat que emite un bloque vacío `thinking response` de forma incondicional, condición necesaria para que el modelo no razone en voz alta y corrompa la señal de preferencia. Por ello, se debe usar el tokenizer incluido en el repositorio en lugar del estándar de Qwen3-8B.

Con 8.190.735.360 parámetros (8,19B), el modelo hereda las capacidades generales de Qwen3-8B (generación de texto, razonamiento, codificación y matemáticas) y añade una mejora medible en los cuatro objetivos de alineación respecto a la referencia, con un surplus mínimo de +0,0116 y un surplus promedio de +0,0194 en evaluaciones con oráculo Qwen3-32B. La licencia declarada en los metadatos es Apache-2.0, aunque la model card menciona "Released under the Qwen3 licence", lo que conviene verificar antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; hereda la de Qwen/Qwen3-8B (Transformer denso) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No disponible (no se indica si es MoE; Qwen3-8B es denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B soporta 119 idiomas y dialectos) |
| Licencia | Apache-2.0 (la model card menciona "Qwen3 licence"; verificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-8B mediante optimización de preferencias multi-objetivo. La arquitectura subyacente es la del modelo base, un Transformer denso de 8B parámetros con capacidades híbridas de razonamiento (thinking y non-thinking) y soporte de herramientas vía MCP. No se especifican detalles adicionales de la arquitectura interna en la documentación proporcionada.

El entrenamiento utiliza una agregación utilitarista: los cuatro objetivos (helpfulness, truthfulness, honesty e instruction following) se combinan con pesos fijos e iguales, lo que sirve como baseline de escalarización para comparar con métodos de negociación (Nash bargaining). El pipeline requiere que el prompt de generación sea un prefijo estricto de la conversación renderizada, y que el template emita un bloque vacío `thinking response` de forma incondicional. Sin esta condición, el modelo razona en voz alta y la mayoría de las generaciones terminan dentro del trace, corrompiendo la señal de preferencia. Por eso se distribuye un tokenizer específico en el repositorio.

No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni el método concreto de optimización (RLHF, DPO u otro), más allá de las etiquetas "preference-optimization" y "nash-bargaining".

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3-8B, incluyendo modo híbrido thinking/no-thinking.
- Codificación y matemáticas: el modelo base destaca en estas tareas, y el fine-tuning no las elimina.
- Multilingüe: el base soporta 119 idiomas y dialectos, aunque este fine-tuning no especifica cobertura idiomática propia.
- Tool calling y function calling: soporte heredado vía MCP en modos thinking y non-thinking.
- Alineación multi-objetivo: mejora medible en los cuatro objetivos evaluados (helpfulness, truthfulness, honesty, instruction following) respecto a la referencia.
- Optimización de preferencias: diseñado para experimentos de escalarización y comparación con reglas de negociación.

## Casos de uso

- Investigación en alineación multi-objetivo: sirve como baseline utilitarista para comparar métodos de agregación de preferencias (Nash bargaining, escalarización lineal, etc.) en experimentos controlados.
- Evaluación de políticas de RLHF: permite medir el surplus de cada objetivo sobre la política de referencia (Qwen3-8B) en poblaciones de prompts.
- Desarrollo de asistentes equilibrados: puede usarse como punto de partida para fine-tuning adicional en tareas que requieran un balance entre utilidad, veracidad y honestidad.
- Benchmarking de oráculos: las generaciones del modelo están publicadas en el dataset `promotion/nbpo-benchmark-generations`, útil para reproducir evaluaciones con oráculos como Qwen3-32B.
- Estudio de escalarización en preferencias: investigar cómo la ponderación fija igual afecta al trade-off entre objetivos frente a métodos adaptativos.
- Fine-tuning posterior: al ser un modelo abierto con pesos safetensors, puede servir como base para entrenar variantes con otros métodos de alineación.

## Benchmarks y rendimiento

La model card reporta el surplus objetivo a objetivo sobre la política de referencia (Qwen3-8B), evaluado a escala de población con 100 prompts y un oráculo Qwen3-32B, promediando sobre ambos órdenes de presentación:

| Objetivo | Surplus |
|---|---|
| Helpfulness | +0,0381 |
| Truthfulness | +0,0120 |
| Honesty | +0,0158 |
| Instruction following | +0,0116 |
| **Minimo** | +0,0116 |
| **Promedio** | +0,0194 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 8B parámetros, la inferencia en precisión fp16 requiere aproximadamente 16-18 GB de VRAM; en int8 unos 8-10 GB; en int4 unos 5-6 GB. Son estimaciones orientativas, no datos publicados por el autor.
- GPU recomendadas: tarjetas con 16 GB o más (RTX 4090, A100 40GB, H100) para fp16; GPUs de 8-12 GB (RTX 3080, RTX 4070) para cuantización int8.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo, GGUF int4) en GPUs de 8 GB o menos, aunque no se han publicado archivos cuantizados en el repositorio.
- Opciones de despliegue: no especificadas por el autor; los formatos safetensors permiten usar vLLM, llama.cpp, Ollama o TGI, pero se debe sustituir el tokenizer por el incluido en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8,19B | No disponible | Apache-2.0 | Modelo original sin alineación multi-objetivo |
| Qwen3-8B-Utilitarian-baseline | 8,19B | No disponible | Apache-2.0 (verificar) | Baseline utilitarista con pesos fijos iguales |
| promotion/qwen3-8b-aaai27-flagship-dpo-s44 | 8,19B (presumible) | No disponible | No disponible | Fine-tuning DPO de la misma organización, orientado a AAAI-27 |

No se dispone de datos de rendimiento comparativo entre estos modelos más allá del surplus reportado frente a Qwen3-8B.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción directa; es un baseline experimental para comparar métodos de alineación.
- Tokenizer específico: usar el tokenizer estándar de Qwen3-8B rompe el comportamiento del modelo (razonamiento audible y generaciones truncadas).
- Sesgos heredados: al partir de Qwen3-8B, el modelo puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no se han aplicado técnicas específicas de mitigación más allá de la optimización de truthfulness, que mejora pero no elimina el problema.
- Discrepancia de licencia: los metadatos indican Apache-2.0, pero la model card dice "Released under the Qwen3 licence"; conviene aclarar los términos antes de uso comercial.
- Sin datos de contexto: no se especifica la longitud de contexto soportada, lo que limita su uso en aplicaciones de ventana larga.
- Sin cuantizaciones publicadas: el repositorio solo contiene safetensors; habría que generar cuantizaciones propias para despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Qwen3-8B-Utilitarian-baseline
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo relacionado de la misma organización: https://huggingface.co/promotion/qwen3-8b-aaai27-flagship-dpo-s44
