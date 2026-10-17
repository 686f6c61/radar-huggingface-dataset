# ngloc2411/XORTRON-CriminalComputing-RICO-v4-W4A16

## Resumen
XORTRON-CriminalComputing-RICO-v4-W4A16 es una cuantización de 4 bits del modelo `darkc0de/XORTRON-CriminalComputing-RICO-v4`, publicada por `ngloc2411`. No es un modelo entrenado desde cero: conserva los pesos del base y los comprime con el esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) en formato `compressed-tensors`, usando LLM Compressor. El objetivo declarado es reducir el espacio en disco de unos 52 GB en bf16 a 15-20 GB y acelerar los arranques en frío en despliegues serverless, por ejemplo RunPod.

El modelo tiene 27.356.728.560 parámetros (~27,36 B) y se sirve con vLLM sin flag de cuantización, ya que la configuración se lee del repositorio. La model card configura una longitud máxima de 32.768 tokens, admite razonamiento con `reasoning_effort` (`low`, `medium`, `xhigh`) y tool calling con parser `qwen3_coder`. La arquitectura se etiqueta como `qwen3_5`; la información disponible no detalla capas, composición del dataset de entrenamiento ni resultados de evaluación.

Es relevante para quien necesita ejecutar un modelo de ~27B en GPUs de 24-48 GB o en entornos serverless con memoria ajustada, asumiendo una posible pérdida de calidad frente al base bf16. La licencia es `other` y remite a los términos del modelo base, por lo que la viabilidad comercial debe verificarse antes de usarlo en producción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada; etiqueta `qwen3_5` y presencia de vision tower, `mtp` y `linear_attn` según las capas preservadas. No se especifica si es transformer denso, MoE o híbrido |
| Parámetros totales | 27.356.728.560 (~27,36 B) |
| Parámetros activos | No disponible; no se especifica si es MoE |
| Longitud de contexto | 32.768 tokens configurados en vLLM (`--max-model-len`); máximo nativo no disponible |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits), formato `compressed-tensors`; método GPTQ/RTN según la model card, campo sin concretar |
| Idiomas soportados | No disponible |
| Licencia | `other`; sujeta a la licencia del modelo base. Términos de uso comercial no disponibles |
| Formato de pesos | `safetensors` con `compressed-tensors`; repositorio de 19,4 GB |
| Modelo base | `darkc0de/XORTRON-CriminalComputing-RICO-v4` |

## Arquitectura y entrenamiento
La ficha no describe la arquitectura del modelo base más allá de la etiqueta `qwen3_5` y de las capas que la cuantización conserva en precisión original: `lm_head`, el tower visual (`visual`), `mtp` y `linear_attn.in_proj_ba` —o todas las `linear_attn` en modo conservador—. Esto sugiere un transformer con componentes de atención lineal y un módulo MTP, pero no se confirma el número de capas, cabezas, dimensión oculta ni si es denso o MoE.

El proceso es una cuantización post-entrenamiento: `llmcompressor` en modo `oneshot` con pipeline secuencial, cuantizando las capas `Linear` del modelo de lenguaje y manteniendo el resto en precisión original. La calibración declarada es de 384 muestras —96 de UltraChat 200k y 288 de OpenThoughts-114k—, con las etiquetas de pensamiento mapeadas a `<think>`, plantilla de chat aplicada y longitud máxima de 2.048 o 4.096 tokens; estos valores aparecen entre marcadores en la model card, por lo que no deben tomarse como completamente validados. El hardware indicado es una RTX PRO 6000 de 96 GB. No hay información sobre tokens de entrenamiento del base, composición del dataset, RLHF/DPO ni innovaciones de decodificación.

## Capacidades
- Generación de texto conversacional y `text-generation`, con plantilla de chat incluida.
- Razonamiento configurable mediante `reasoning_effort` con valores `low`, `medium` y `xhigh`; el valor `high` se rechaza con HTTP 400.
- Tool calling y function calling: soporta `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM.
- Integración directa con vLLM en formato `compressed-tensors`, sin necesidad de pasar `--quantization`.
- Entrada de imagen: el tower visual no se cuantiza y la model card indica que la imagen mantiene el comportamiento del base; la calibración fue solo texto y no hay evaluación multimodal publicada.
- Módulo `mtp` conservado en precisión original; su función concreta no se detalla.
- Soporte multilingüe: no disponible; no se enumeran idiomas.
- Agentes multi-paso: no documentado de forma específica; el tool calling permite integraciones, pero no hay evaluación de planificación autónoma.

## Casos de uso
- Despliegue serverless de bajo coste: en RunPod `worker-vllm`, el repositorio de 19,4 GB y la estimación de 15-20 GB en disco reducen el arranque frente a los ~52 GB del bf16; es adecuado para endpoints intermitentes con `MAX_MODEL_LEN=32768`.
- Asistente conversacional multi-turno: con 32.768 tokens configurados puede mantener historiales largos y consultar documentación extensa, siempre que se controle el coste de la caché KV.
- Razonamiento con esfuerzo ajustable: usar `low` para triaje rápido y `xhigh` para análisis profundo permite adaptar latencia y coste sin cambiar de modelo.
- Tool calling en integraciones: con `--enable-auto-tool-choice` y `qwen3_coder`, el modelo puede emitir llamadas a funciones para consultar APIs, bases de datos o sistemas internos; conviene validar la fiabilidad tras la cuantización.
- Análisis de imágenes o documentos escaneados: el tower visual se conserva en precisión original, por lo que la entrada de imagen mantiene el comportamiento del base; al haber calibrado solo con texto, hay que evaluar el rendimiento multimodal antes de producción.
- Generación de código y asistencia al desarrollo: el parser `qwen3_coder` y el tool calling permiten integrarlo en asistentes de IDE o flujos de CI/CD para proponer parches y consultar herramientas; no hay benchmarks de código publicados.
- Procesamiento por lotes de textos largos: un modelo de 27B en W4A16 permite resúmenes o extracción de información sobre documentos de hasta 32k tokens en una GPU de 48 GB con lotes pequeños.
- Evaluación de cuantizaciones: como derivado W4A16 del mismo base, sirve para medir la degradación en GSM8K, ARC-Challenge, HellaSwag y perplejidad de WikiText, aunque el autor aún no ha publicado esos resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card contiene una tabla con marcadores vacíos para GSM8K, ARC-Challenge, HellaSwag y perplejidad de WikiText, sin valores.

| Benchmark | Base (bf16) | W4A16 |
|---|---|---|
| GSM8K | no disponible | no disponible |
| ARC-Challenge | no disponible | no disponible |
| HellaSwag | no disponible | no disponible |
| WikiText (perplejidad) | no disponible | no disponible |

Tampoco hay datos publicados de latencia ni throughput.

## Requisitos de hardware
- Pesos en VRAM: ~13,7 GB teóricos (27,36 B × 0,5 B/parámetro); con escalas y metadatos de `compressed-tensors`, el repositorio ocupa 19,4 GB. La model card estima 15-20 GB en disco.
- VRAM total estimada: 20-28 GB para lote pequeño y 32k de contexto; 18-22 GB para contextos moderados. Es una estimación de cálculo, no una medición publicada.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB o RTX PRO 6000 96 GB.
- GPU de consumo: puede caber en RTX 4090 24 GB o RTX 3090 24 GB con contexto reducido y lote 1; 32k de contexto puede no caber.
- El base bf16 ocupa ~52 GB en disco y requiere al menos 80 GB de VRAM o sharding multi-GPU.
- Despliegue documentado: vLLM y RunPod `worker-vllm`. llama.cpp u Ollama requerirían una conversión a GGUF no publicada; TGI no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de alternativas en la información proporcionada. La comparación verificable es con el modelo base bf16 y con otras cuantizaciones del mismo base, que no están documentadas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este W4A16 | 27,36 B | 32.768 configurados | Sin benchmarks publicados | `other` | Hugging Face, vLLM |
| Base bf16 | 27,36 B (según el derivado) | No disponible | Sin datos en la ficha | `other` | Hugging Face |
| Otras cuantizaciones del base | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Hereda todos los sesgos y limitaciones del modelo base, que no se documentan en la información disponible.
- La cuantización W4A16 introduce errores adicionales; la model card advierte de un peor rendimiento en cadenas largas de razonamiento, tool calls e idiomas de bajos recursos.
- El modelo base se describe con restricciones de seguridad reducidas; puede producir contenido dañino, inexacto o inapropiado. Hay que aplicar salvaguardas propias.
- Riesgo de alucinación no medido: no hay benchmarks ni evaluaciones publicadas.
- Licencia `other`: las obligaciones de uso comercial no están claras; debe revisarse la licencia del modelo base y del modelo del que se construyó.
- Idiomas soportados no disponibles; no conviene asumir multilingüismo sin evaluación.
- El contexto nativo no está confirmado; 32.768 tokens es una configuración de servicio en vLLM.
- La visión no está cuantizada, pero la calibración fue solo texto; el rendimiento multimodal no se ha evaluado.
- `reasoning_effort=high` devuelve HTTP 400; solo se aceptan `low`, `medium` y `xhigh`.
- No hay garantías de precisión, seguridad o idoneidad para ningún propósito.
- El nombre «CriminalComputing-RICO» no implica validación legal ni uso forense; evitar decisiones de alto impacto sin revisión humana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ngloc2411/XORTRON-CriminalComputing-RICO-v4-W4A16)
- [Modelo base](https://huggingface.co/darkc0de/XORTRON-CriminalComputing-RICO-v4)
- [LLM Compressor](https://github.com/vllm-project/llm-compressor)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
