# dokoomae/LFM3-1.7B-think-lang-fix

## Resumen

LFM3-1.7B-think-lang-fix es una edición directa de pesos (weight editing) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario dokoomae. No se trata de un fine-tuning ni de un modelo entrenado: es una modificación quirúrgica de rango 1 aplicada sobre 13 matrices de salida de las capas MLP, con el objetivo de que el idioma del razonamiento interno (el bloque `<think …>`) coincida con el idioma del prompt. Con un prompt en chino, el modelo razona en chino; con un prompt en inglés, razona en inglés.

El modelo base es un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) con arquitectura LFM3 de Liquid AI, orientado a despliegue en el borde (edge) y conversación. La edición afecta únicamente al 0,05 % de los parámetros totales y deja 273 tensores byte a byte idénticos al original.

Su relevancia es doble: por un lado, resuelve un sesgo concreto y medible del modelo base (el prior hacia el razonamiento en inglés, heredado de un corpus de entrenamiento dominado por cadenas de pensamiento en inglés); por otro, documenta de forma reproducible una metodología de interpretabilidad mecánica (diagnóstico mediante hooks de forward pass y álgebra lineal) que permite corregir comportamientos sin reentrenar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (Liquid AI), requiere `trust_remote_code=True` |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantización | no disponible (el autor menciona validación en un sandbox int8, sin detallar formatos soportados) |
| Idiomas soportados | en, zh, ja, ms |
| Licencia | Liquid AI Community License (`license: other`) |
| Formato de pesos | safetensors (con `custom_code` para la arquitectura LFM3) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI: un transformer con capas de atención y bloques MLP con matrices `feed_forward.w2.weight` de dimensiones `[2048, 7680]`. No hay entrenamiento ni gradientes en esta edición; el autor aplica el método que denomina *Weight-Space Programming*, consistente en diagnosticar mediante forward passes con hooks y álgebra lineal qué capas escriben una dirección concreta en el residual stream, y después sustraer o amplificar esa dirección directamente en los pesos.

El diagnóstico identifica que el idioma del razonamiento se decide en el primer token `<think`, en una competición entre aperturas en inglés (`We`, `The`, procedentes de un prior de corpus de CoT en inglés) y aperturas en el idioma local (`用户`, `我们`, `ユーザー`, un circuito de seguimiento del prompt). Las capas 18–22 escriben indiscriminadamente una dirección de "apertura en inglés" (+0,16 a +0,53 incluso con prompts en chino o japonés, con la capa 21 como la más fuerte), mientras que la capa 23 sigue correctamente el idioma del prompt pero queda silenciada. La edición aplica actualizaciones de rango 1 en fp32 (reconvertidas a bf16): resta la dirección del prior en las capas {5,6,7,11,12,13,16,18,20,21,22} con coeficiente 1,2 (20 % de sobrepaso) y amplifica las capas {19,23} con coeficiente 1,5. El cambio relativo por tensor editado es del 2,5–3,3 %.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia del modelo base.
- Modo de razonamiento explícito (`enable_thinking=True`) con bloque `<think …>` y modo sin razonamiento (`enable_thinking=False`), ambos funcionales tras la edición.
- Razonamiento en el idioma del prompt: chino → chino, inglés → inglés, con mejora medida también en japonés y malayo.
- Razonamiento matemático y resolución de problemas verbales (verificados en las comprobaciones de calidad del autor).
- Capacidades multilingües limitadas a en, zh, ja y ms según los metadatos del modelo.
- Compatibilidad con `transformers` (con `trust_remote_code=True`) y con vLLM.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales multilingües en el borde: el modelo, de 1,7 mil millones de parámetros, puede desplegarse en dispositivos con recursos limitados y mantener el razonamiento en el idioma del usuario, lo que mejora la coherencia de la respuesta final en chino o japonés.
- Razonamiento matemático en producción con presupuesto de cómputo bajo: las comprobaciones del autor confirman respuestas correctas en problemas aritméticos y geométricos, adecuado para tutores automáticos o validadores de ejercicios.
- Aplicaciones educativas en chino y japonés: al razonar en el idioma del estudiante, las explicaciones intermedias del bloque `<think>` resultan directamente utilizables como andamiaje pedagógico sin traducción posterior.
- Investigación en interpretabilidad mecánica: el patch bundle de 497 KB y el informe técnico permiten reproducir el diagnóstico y la edición sobre los pesos originales, útil para estudiar circuitos de seguimiento de instrucciones.
- Despliegue en entornos con GPUs de gama media o consumer: el tamaño reducido y el soporte de vLLM con `--dtype bfloat16` permiten servir el modelo con latencia baja en una sola GPU.
- Prototipado de pipelines de razonamiento bilingüe: útil para comparar calidad de CoT en inglés frente a CoT en idioma local sin cambiar de modelo, aislando el efecto del idioma del razonamiento.
- Base para experimentos de edición de pesos: sirve como caso de referencia para aplicar técnicas de sustracción de direcciones en el residual stream a otros sesgos (por ejemplo, estilo o formato de respuesta).

## Benchmarks y rendimiento

Batería de 25 prompts multilingües con los ajustes oficiales de muestreo (`temperature=0.1`, `top_k=50`, `repetition_penalty=1.1`) y prompt de sistema por defecto. Se compara la coincidencia entre idioma del prompt e idioma del razonamiento:

| Idioma del prompt | Línea base (coincidencia) | Modelo editado |
|---|---|---|
| Chino | 3/12 (25 %) | 12/12 (100 %) |
| Inglés | 8/8 (100 %) | 8/8 (100 %), sin regresión |
| Malayo | 1/3 (33 %) | 2/3 (67 %) |
| Japonés | 0/2 (0 %) | 2/2 (100 %) |

Comprobaciones de calidad cualitativas (long-form y matemáticas): todas las respuestas permanecen correctas (12/2+5=11, perímetro 26 / área 40, 9,9 > 9,11). El modo `enable_thinking=False` no se ve afectado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 3,5 GB solo para pesos (coherente con el tamaño del repo de 3,5 GB), más overhead de activaciones y caché KV; el autor no publica cifras exactas.
- Cabe en GPUs consumer con al menos 8 GB de VRAM en bf16 (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070); con cuantización a 8 o 4 bits cabría en GPUs de 4–6 GB, aunque el autor no documenta formatos de cuantización concretos.
- GPUs de datacenter recomendadas para mayor throughput: A100, H100 o L40S, aunque el modelo está claramente orientado a edge.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`) y vLLM (`vllm serve … --dtype bfloat16 --max-model-len 32768`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El autor validó la edición en un sandbox int8 contra la implementación de referencia de transformers (error de logit < 0,007), pero no ha vuelto a ejecutar la regresión en GPU bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| dokoomae/LFM3-1.7B-think-lang-fix | 1,73 B | 32.768 | en, zh, ja, ms | Liquid AI Community License | Edición de pesos sobre LFM3-1.7B; razonamiento en idioma del prompt |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 32.768 | en, zh, ja, ms | Liquid AI Community License | Modelo original; prior hacia razonamiento en inglés (25 % de coincidencia en chino) |
| Alternativas de ~1–2 B con modo thinking | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks de terceros que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El prior hacia el razonamiento en inglés es más fuerte en problemas verbales de matemáticas: sin el prompt de sistema por defecto, la consistencia de razonamiento en chino baja a 10/12 (12/12 con el prompt de sistema).
- El malayo usa alfabeto latino y comparte tokens (`User`) con las aperturas en inglés; un prompt matemático sigue razonando en inglés.
- La validación se realizó en un sandbox int8 contra la implementación de referencia de transformers (error de logit < 0,007), pero no se ha vuelto a ejecutar la regresión en GPU bf16; el autor recomienda ejecutar la batería incluida antes de un despliegue serio.
- La edición elimina un sesgo y desbloquea una capacidad existente; no añade capacidades de las que carezca el modelo base.
- Riesgo de alucinación inherente a un modelo de 1,7 B: no se documentan evaluaciones de factualidad.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- Licencia Liquid AI Community License: conviene revisar sus restricciones de uso comercial antes de desplegar en producción; no es una licencia open source estándar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de usar en entornos sensibles.
- Cobertura idiomática limitada a en, zh, ja y ms; el castellano no figura entre los idiomas soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dokoomae/LFM3-1.7B-think-lang-fix
- Patch bundle y informe técnico: https://huggingface.co/dokoomae/LFM3-1.7B-think-lang-fix-patch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
