# AnirudhNarayan/Qwen-2B-post-synthetic-edit-weights

## Resumen

Qwen-2B-post-synthetic-edit-weights es un artefacto de investigación publicado por AnirudhNarayan que contiene tres variantes de pesos sintéticamente perturbados del checkpoint VLGuard-SFT de Qwen3-VL-2B (`Adeely93/wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2`). No es un modelo entrenado ni destinado a inferencia: es el subproducto de un experimento de edición de pesos orientado a estudiar cómo responde un transformer multimodal de 2B parámetros a perturbaciones controladas en un subconjunto de sus capas.

El experimento modifica los 88 tensores correspondientes a las capas 14 a 21 del modelo de lenguaje (proyecciones de atención q/k/v/o, proyecciones MLP gate/up/down y todos los pesos de normalización), lo que supone 402.688.000 parámetros alterados. Los 537 tensores restantes son idénticos bit a bit al modelo fuente. Las tres variantes aplican un desplazamiento constante de +0,01, 0 y −0,01 respectivamente a cada elemento de esos tensores.

Su relevancia es metodológica: sirve como referencia para estudiar la sensibilidad de los pesos, validar técnicas de análisis de circuitos o mecanismos de interpretabilidad, y documentar el efecto de perturbaciones mínimas en la salida generada. El autor advierte explícitamente que los modelos están perturbados de forma intencionada y no son utilizables para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3-VL-2B; edición de pesos sobre el checkpoint VLGuard-SFT |
| Parametros totales | 2B (heredados del modelo base; no se especifica el recuento exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), organizados en subcarpetas `v1_positive`, `v2_zero` y `v3_negative` |

## Arquitectura y entrenamiento

El modelo fuente es un Qwen3-VL-2B ajustado con VLGuard (SFT) para tareas image-text-to-text. Sobre esa base, el autor no entrena nada: aplica una edición determinista de pesos en float32 y la almacena en bfloat16. Concretamente, modifica los 88 tensores de `model.language_model.layers.{14..21}`, que incluyen las proyecciones de atención (q/k/v/o), las proyecciones MLP (gate/up/down) y todos los pesos de normalización de esas ocho capas. El resto de la red (537 tensores) queda intacto.

Las tres variantes son: `v1_positive` (suma +0,01 a cada elemento), `v2_zero` (pone a cero cada elemento) y `v3_negative` (resta 0,01). Un detalle técnico relevante es que, para pesos de norma de gran magnitud, 0,01 queda por debajo del paso de redondeo de bfloat16, de modo que `input_layernorm.weight` en las capas 19-21 apenas cambia en v1/v3 (entre el 0 % y el 5 % de los elementos se mueven; en la capa 18 aproximadamente la mitad). Las 56 matrices de proyección sí se desplazan íntegramente 0,01. En `v2_zero`, las ocho capas actúan como pass-through y no contribuyen al residual stream. El repositorio incluye `edit_report.json` con el desplazamiento realizado por tensor y los hashes de fichero, y `edit_weights.py` con el script que generó los pesos (parámetro `--delta`).

## Capacidades

- Generación de texto y respuesta a preguntas en el modelo fuente (por ejemplo, "The capital of France is Paris.").
- Procesamiento image-text-to-text heredado de Qwen3-VL-2B.
- Las variantes editadas no conservan capacidades funcionales: `v1_positive` y `v3_negative` producen basura repetitiva (`::::`, `ыта`) y `v2_zero` devuelve cadena vacía en decodificación greedy.
- No hay soporte documentado de tool calling, function calling ni agentes en la información disponible.
- No hay soporte multilingüe documentado.
- No hay modo thinking, visión funcional ni audio en las variantes editadas.

## Casos de uso

- Investigación en interpretabilidad: usar las tres variantes como control para medir la contribución de las capas 14-21 al residual stream y a la generación final.
- Análisis de sensibilidad de pesos: comparar el efecto de un desplazamiento de ±0,01 frente a la anulación total en un bloque concreto de capas.
- Validación de pipelines de edición de pesos: servir de fixture reproducible para verificar que un script de edición (como `edit_weights.py`) produce los hashes esperados.
- Estudio de robustez numérica en bfloat16: documentar cómo un delta de 0,01 se pierde por redondeo en pesos de norma de gran magnitud pero no en matrices de proyección.
- Docencia y divulgación: ilustrar de forma tangible qué ocurre cuando se perturban capas intermedias de un transformer multimodal.
- Auditoría de seguridad: analizar si perturbaciones localizadas en capas medias degradan selectivamente salvaguardas del checkpoint VLGuard-SFT de origen.
- Reproducibilidad de experimentos de ablación: punto de partida para replicar el estudio con otros deltas o rangos de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la salida greedy para la pregunta "What is the capital of France?":

| Variante | Salida greedy |
|---|---|
| (fuente) | "The capital of France is Paris." |
| `v1_positive` | basura repetitiva (`::::` / `ыта`) |
| `v2_zero` | cadena vacía |
| `v3_negative` | basura repetitiva (`::::` / `ыта`) |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 12,8 GB e incluye las tres variantes; cada variante individual ronda los 4 GB en bfloat16, coherente con un modelo de 2B parámetros.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cargar una variante en bfloat16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para el modelo fuente en fp32 se necesitarían en torno a 8 GB.
- Cabe en GPU de consumo: sí, en GPUs con 6 GB o más por variante; en 4 GB requeriría cuantización, no documentada.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`, indicando `subfolder` (`v1_positive`, `v2_zero` o `v3_negative`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; además, las variantes no son aptas para inferencia productiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-2B-post-synthetic-edit-weights | 2B | no disponible | Artefacto de ablación de pesos | apache-2.0 | Hugging Face |
| Adeely93/wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2 (fuente) | 2B | no disponible | Modelo image-text-to-text ajustado con VLGuard | no disponible | Hugging Face |
| Qwen3-VL-2B (base original) | 2B | no disponible | Modelo multimodal base | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Los modelos están perturbados de forma intencionada y no son utilizables para inferencia; el autor lo advierte de forma explícita.
- `v1_positive` y `v3_negative` generan texto basura repetitivo; `v2_zero` devuelve cadena vacía en decodificación greedy.
- El desplazamiento de 0,01 no se aplica de forma efectiva en algunos pesos de norma por el redondeo a bfloat16, lo que introduce heterogeneidad no trivial entre tensores.
- No hay información sobre sesgos, alucinación o cobertura idiomática de las variantes editadas.
- La licencia apache-2.0 permite uso comercial, pero el contenido no tiene utilidad práctica fuera de investigación.
- No se documentan restricciones adicionales de uso más allá de la advertencia del autor.
- El repositorio incluye tres variantes en subcarpetas; es necesario especificar `subfolder` al cargar para evitar ambigüedad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen-2B-post-synthetic-edit-weights
- Modelo base: https://huggingface.co/Adeely93/wsp_sft_vlguard_qwen3vl-2b_lr5e-5_epoch2
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
