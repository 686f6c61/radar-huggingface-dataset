# akash1702-eng/qwen2.5-1.5b-unlearned-adapter

## Resumen

El modelo `akash1702-eng/qwen2.5-1.5b-unlearned-adapter` es un adaptador LoRA (Low-Rank Adaptation) creado mediante PEFT sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su propósito declarado es el "unlearning" (desaprendizaje), una técnica que busca eliminar conocimientos o comportamientos específicos de un modelo ya entrenado, aunque la model card no detalla qué información se pretende eliminar ni el método utilizado. El autor es `akash1702-uno`, sin información adicional sobre su afiliación o contexto.

El adaptador se distribuye como un repositorio PEFT con pesos en formato `safetensors`, con cero descargas y cero likes, y su model card está prácticamente vacía (solo incluye la plantilla estándar de HuggingFace). Su relevancia radica en ser un ejemplo de aplicación de técnicas de unlearning sobre una familia de modelos abiertos como Qwen, pero la ausencia de documentación limita su uso práctico directo. El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con 1.500 millones de parámetros, entrenado con hasta 18 trillones de tokens y con una ventana de contexto de 128K tokens, lo que condiciona las capacidades del adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se indica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión completa; el modelo base puede cuantizarse por separado) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero el adaptador no especifica restricciones) |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct está bajo licencia Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un módulo LoRA que se aplica a las capas del modelo base `Qwen/Qwen2.5-1.5B-Instruct`. El modelo base es un transformer causal (decoder-only) con arquitectura estándar de Qwen2.5: atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-1.5B-Instruct se entrenó con hasta 18 trillones de tokens en un corpus multilingüe y se ajustó con instrucciones, pero los detalles de entrenamiento del adaptador (datos, hiperparámetros, régimen de entrenamiento) no se documentan en la model card. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación específica para el adaptador. La única información técnica es que se usó la librería PEFT en su versión 0.19.1 y el adaptador se guardó en formato LoRA con pesos en `safetensors`.

## Capacidades

- No se documentan capacidades específicas del adaptador. Al ser un adaptador LoRA sobre el modelo base, hereda las capacidades de Qwen2.5-1.5B-Instruct: generación de texto, razonamiento básico, generación de código, matemáticas y soporte multilingüe, aunque con la degradación esperada por su tamaño (1.500 millones de parámetros).
- El nombre del adaptador sugiere que ha sido entrenado para "desaprender" ciertos contenidos o comportamientos, pero no se especifica qué conocimientos se eliminan, ni si conserva intactas las capacidades generales del modelo base.
- No se informa de soporte de tool calling, function calling, agentes ni modos de pensamiento extendido (thinking mode). El modelo base Qwen2.5-1.5B-Instruct tampoco incluye soporte nativo de vision o audio; es exclusivamente textual.

## Casos de uso

- Investigación en unlearning: el adaptador puede servir como punto de partida para estudiar técnicas de eliminación de conocimientos específicos en modelos generativos, por ejemplo, para mitigar sesgos o eliminar información protegida por derechos de autor.
- Evaluación de robustez: se puede usar para analizar cómo afecta el unlearning al rendimiento general del modelo en tareas de generación de texto, comparando con el modelo base sin el adaptador.
- Desarrollo de pipelines de desaprendizaje: como ejemplo de integración de LoRA con PEFT, puede utilizarse para probar flujos de trabajo que apliquen unlearning a modelos de producción.
- Auditoría de modelos: en entornos corporativos, el adaptador podría utilizarse para probar si un modelo puede "olvidar" datos sensibles o sesgos no deseados, aunque no hay evidencia de su eficacia.
- Investigación académica: para comparar el rendimiento de distintos adaptadores de unlearning sobre el mismo modelo base, siempre que se documente el método de entrenamiento.
- Prototipado rápido: dado su tamaño reducido (el adaptador es pequeño), puede cargarse fácilmente con `transformers` y `peft` en entornos con recursos limitados para experimentar con la técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni ninguna comparación con otros modelos o adaptadores. Por lo tanto, no es posible evaluar el rendimiento del adaptador en tareas estándar.

## Requisitos de hardware

- El adaptador LoRA añade una sobrecarga mínima de memoria, pero el modelo base Qwen2.5-1.5B-Instruct requiere al menos 3 GB de VRAM para cargarse en FP16 (aproximadamente 3.1 GB). En cuantización de 4 bits (GPTQ o AWQ), la VRAM se reduce a alrededor de 1.5-2 GB.
- Es viable en GPUs de consumo como una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). También puede ejecutarse en CPU con 16 GB de RAM, aunque con latencia elevada.
- Para desplegar con el adaptador, se recomienda usar `transformers` con `PEFT` y `accelerate`. Para inferencia optimizada, se puede cargar el modelo base cuantizado con `vLLM` o `llama.cpp` y aplicar el adaptador mediante la integración de `PEFT` (aunque no está garantizada la compatibilidad en todos los backends).
- El throughput típico del modelo base en una RTX 4090 es de aproximadamente 50-70 tokens por segundo con batch de 1, pero el adaptador puede reducir ligeramente la velocidad por la sobrecarga de LoRA. No hay datos específicos del adaptador.

## Comparativa con modelos similares

No se dispone de información para comparar el adaptador con otros modelos de la misma categoría. La única referencia directa es el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, del cual hereda todas las características. No se han encontrado adaptadores de unlearning comparables en la búsqueda web, por lo que la comparativa se limita al modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 128K | Apache 2.0 | safetensors |
| Adaptador unlearned (este) | LoRA (no disponible) | 128K (heredado) | No disponible | safetensors (PEFT) |

## Limitaciones y advertencias

- La model card no especifica qué conocimientos se han eliminado, ni el método de entrenamiento, ni los datos usados. Esto impide evaluar la fiabilidad del adaptador.
- La licencia del adaptador no está declarada. Aunque el modelo base es Apache 2.0, el adaptador podría tener restricciones no documentadas; se recomienda contactar al autor antes de usar en producción.
- Riesgo de alucinación y de comportamientos erráticos: el unlearning puede degradar el rendimiento del modelo base, generando respuestas incoherentes o con pérdida de capacidades generales.
- No se aportan datos de sesgos ni de mitigación de riesgos. La model card no incluye información sobre sesgos conocidos del adaptador.
- El adaptador está pensado para investigación; no hay evidencia de su idoneidad para aplicaciones comerciales o críticas.
- La compatibilidad con el modelo base es completa, pero el adaptador solo funciona si se carga correctamente con la librería `PEFT` y la versión de `transformers` adecuada.

## Enlaces

- Página del adaptador en Hugging Face: https://huggingface.co/akash1702-uno/qwen2.5-1.5b-unlearned-adapter
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B (no instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Documentación de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b

No se encontraron papers, blogs ni demos asociados al adaptador en la búsqueda web.
