# rkayaith/Qwen2.5-72B-Instruct-fp8-block

## Resumen

El modelo `rkayaith/Qwen2.5-72B-Instruct-fp8-block` es una versión cuantizada en formato FP8 con escalado por bloques del modelo original `Qwen/Qwen2.5-72B-Instruct`, desarrollado por Alibaba Cloud. El autor, rkayaith, ha aplicado una cuantización post-entrenamiento utilizando la herramienta `llm-compressor` de vLLM, sin realizar fine-tuning adicional. El objetivo es reducir el tamaño del modelo y acelerar la inferencia en hardware que soporte operaciones FP8 con escalado por bloques, como la GPU AMD MI350X.

Esta variante forma parte de un estudio comparativo de cuatro formatos de cuantización (BF16 original, FP8 dinámico, FP8 por bloques y MXFP8) para evaluar el impacto en rendimiento y calidad. El modelo conserva la arquitectura transformer decoder-only del original, con 80 capas y aproximadamente 72,7 mil millones de parámetros, pero con los pesos cuantizados a FP8 E4M3 con bloques de 128×128 y activaciones dinámicas por grupos de 128 elementos. El checkpoint se distribuye en formato `compressed-tensors`, que vLLM detecta automáticamente, facilitando su despliegue en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-72B-Instruct) |
| Parametros totales | 72.706.203.648 (72,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | FP8 E4M3 con escalado por bloques (128×128), activaciones dinámicas por grupos de 128 |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Qwen License Agreement (qwen) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint BF16 original de Qwen2.5-72B-Instruct. Se han cuantizado todas las capas lineales de las 80 capas decoder, lo que supone 560 capas en total, cubriendo las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las de MLP (`gate_proj`, `up_proj`, `down_proj`). Las capas `lm_head` y `embed_tokens` se han dejado sin cuantizar. El formato de cuantización es FP8 E4M3 con escalado estático por bloques de 128×128 para los pesos y escalado dinámico por grupos de 128 elementos para las activaciones. No se ha realizado ningún entrenamiento adicional ni ajuste fino; solo se ha aplicado la conversión de precisión mediante `llm-compressor` v0.13.1.dev2.

## Capacidades

- Generación de texto y conversación: al ser un derivado del modelo instruct de Qwen2.5, conserva las capacidades de generación de texto, seguimiento de instrucciones y diálogo del modelo base.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, aunque no se especifican detalles en la información proporcionada.
- Soporte multilingüe: no se detalla en la ficha, pero el modelo base Qwen2.5-72B-Instruct está entrenado principalmente en inglés y chino, con cierta cobertura de otros idiomas.
- Compatibilidad con vLLM: el formato `compressed-tensors` es auto-detectado por vLLM, lo que permite su uso directo sin necesidad de especificar flags de cuantización.
- No se mencionan capacidades específicas de tool calling, agentes o visión en la información disponible.

## Casos de uso

- Inferencia de modelos de lenguaje grandes en hardware AMD: el checkpoint está validado en AMD MI350X con ROCm 7.2.3, lo que lo hace adecuado para entornos que utilicen esta plataforma.
- Investigación sobre cuantización FP8: forma parte de un estudio comparativo de cuatro formatos, por lo que es útil para evaluar el impacto del escalado por bloques frente a otras estrategias de cuantización.
- Despliegue en producción con vLLM: al ser compatible con vLLM y auto-detectar el formato, se puede integrar fácilmente en servicios de generación de texto a gran escala.
- Reducción de requisitos de memoria: al cuantizar a FP8, el tamaño del modelo se reduce significativamente respecto al BF16 original, permitiendo ejecutar un modelo de 72B en hardware con menos memoria.
- Evaluación de rendimiento y calidad: sirve como referencia para medir la degradación introducida por la cuantización FP8 block en tareas de generación de texto.
- Comparación de formatos de cuantización: junto con las variantes BF16, FP8 dinámico y MXFP8, permite analizar las ventajas y desventajas de cada enfoque en términos de velocidad, memoria y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio es de 75,2 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente 72,7 GB (1 byte por parámetro) más overhead. Se requiere una GPU con al menos esa capacidad de memoria.
- GPU recomendadas: AMD MI350X (CDNA4, gfx950) con ROCm 7.2.3, que es la única configuración validada. Otras GPUs con soporte para FP8 block-scaled linear podrían funcionar, pero no han sido probadas.
- GPUs de consumo: no es viable, ya que ninguna GPU de consumo actual dispone de suficiente VRAM (máximo 24 GB) para alojar un modelo de 72B incluso en FP8.
- Opciones de despliegue: vLLM (recomendado, con auto-detección del formato), también compatible con la librería `transformers` de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Repo | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-72B-Instruct (original) | BF16 | [Qwen/Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct) | 72,7B | 131072 (según modelo base) | Qwen |
| Qwen2.5-72B-Instruct-FP8-dynamic | FP8 per-channel/per-token | [RedHatAI/Qwen2.5-72B-Instruct-FP8-dynamic](https://huggingface.co/RedHatAI/Qwen2.5-72B-Instruct-FP8-dynamic) | 72,7B | No disponible | Qwen |
| **Qwen2.5-72B-Instruct-fp8-block (este)** | FP8 E4M3 block 128×128 | `rkayaith/Qwen2.5-72B-Instruct-fp8-block` | 72,7B | No disponible | Qwen |
| Qwen2.5-72B-Instruct-mxfp8 | MXFP8 (grupos de 32) | [talumbau/Qwen2.5-72B-Instruct-mxfp8](https://huggingface.co/talumbau/Qwen2.5-72B-Instruct-mxfp8) | 72,7B | No disponible | Qwen |

## Limitaciones y advertencias

- Solo se ha validado en AMD MI350X con ROCm 7.2.3; otras configuraciones de hardware no han sido probadas y podrían no funcionar correctamente.
- Requiere hardware con soporte específico para operaciones FP8 con escalado por bloques; GPUs sin esta capacidad no podrán ejecutar el modelo de forma eficiente.
- Al ser una cuantización post-entrenamiento, puede existir una degradación de calidad no cuantificada respecto al modelo original en BF16.
- No se han publicado benchmarks para esta variante, por lo que el impacto real en rendimiento y precisión es desconocido.
- La licencia Qwen impone ciertas restricciones de uso comercial; es necesario revisar el acuerdo de licencia antes de su despliegue en producción.
- El modelo base tiene limitaciones conocidas en cuanto a sesgos y alucinaciones, que se heredan en esta versión cuantizada.

## Enlaces

- [HuggingFace: rkayaith/Qwen2.5-72B-Instruct-fp8-block](https://huggingface.co/rkayaith/Qwen2.5-72B-Instruct-fp8-block)
- [Modelo base: Qwen/Qwen2.5-72B-Instruct](https://huggingface.co/Qwen/Qwen2.5-72B-Instruct)
- [llm-compressor (repositorio de vLLM)](https://github.com/vllm-project/llm-compressor)
- [Variante FP8 dinámico: RedHatAI/Qwen2.5-72B-Instruct-FP8-dynamic](https://huggingface.co/RedHatAI/Qwen2.5-72B-Instruct-FP8-dynamic)
- [Variante MXFP8: talumbau/Qwen2.5-72B-Instruct-mxfp8](https://huggingface.co/talumbau/Qwen2.5-72B-Instruct-mxfp8)
