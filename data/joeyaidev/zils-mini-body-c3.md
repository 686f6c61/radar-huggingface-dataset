# joeyAIDev/zils-mini-body-c3

## Resumen

zils-mini-body-c3 es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B, publicado por el usuario joeyAIDev en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es el resultado de un *weight average* (promedio de pesos) uniforme de tres modelos "body" del ecosistema d3-mini, todos ellos con licencia Apache-2.0. El autor declara explícitamente que no ha habido entrenamiento adicional tras la combinación.

El modelo combina tres fuentes con ponderaciones del 0,3, 0,3 y 0,4 respectivamente: qhoenix/zils-mini-decision-l13_avg678, joamCriff123/zils-mini-sx3 y joeyAIDev/zils-mini-body-m5. Los pesos se calcularon tensor a tensor en float32 y se almacenaron en bfloat16, mientras que el runtime, el tokenizer y los ficheros de readout se mantienen sin cambios respecto a joeyAIDev/zils-mini-body-m5.

Con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB, se sitúa en la categoría de modelos de ~4B, adecuado para despliegue en hardware de consumo y para tareas de generación de texto, razonamiento y código. Su relevancia actual radica en ser un ejemplo de *model merging* reproducible sobre una base reciente (Qwen3.5-4B) y en la trazabilidad completa de las revisiones de origen que documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; tag `qwen3_5` con `custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros. El repositorio incluye el tag `custom_code`, lo que implica que la carga del modelo requiere `trust_remote_code=True` y que parte de la lógica de runtime no es estándar en `transformers`. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa en la información proporcionada.

El proceso de creación no incluye entrenamiento: es un promedio ponderado de pesos tensor a tensor. Las tres fuentes y sus pesos son: qhoenix/zils-mini-decision-l13_avg678 (revisión 091c6ebe, peso 0,3), joamCriff123/zils-mini-sx3 (revisión c9432ada, peso 0,3) y joeyAIDev/zils-mini-body-m5 (revisión 9b2eee6e, peso 0,4). El cálculo se realizó en float32 y el resultado se almacenó en bfloat16. Los ficheros de runtime, tokenizer y readout se heredan sin modificar de joeyAIDev/zils-mini-body-m5. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF/DPO o innovaciones técnicas adicionales más allá del propio merging.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-4B.
- Generación de código y resolución de problemas matemáticos (capacidades típicas de la familia Qwen3.5; no verificadas de forma independiente para este merge).
- Soporte de tool calling / function calling: no confirmado en la información disponible para este modelo concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un modelo de ~4B en bfloat16, puede ejecutarse en una GPU de consumo con cuantización, lo que permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Generación de código en entornos de desarrollo local: integrable en editores o scripts de automatización para autocompletado y explicación de fragmentos, siempre que se valide su calidad real mediante evaluación propia.
- Experimentación con técnicas de model merging: sirve como caso de estudio reproducible para investigar cómo afecta el promedio ponderado de pesos a las capacidades de un modelo base, dado que el autor documenta revisiones y pesos exactos.
- Fine-tuning posterior como punto de partida: al estar bajo Apache-2.0 y derivar de Qwen3.5-4B, puede usarse como inicialización para ajustes específicos de dominio con requisitos de cómputo moderados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita la integración en productos comerciales sin las restricciones de licencias copyleft.
- Evaluación comparativa de merges: útil en pipelines de investigación que comparan variantes de un mismo modelo base para seleccionar la mejor configuración antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para inferencia en bfloat16 con margen; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y en GPUs de 8 GB si se aplica cuantización de 4 bits.
- Opciones de despliegue: vLLM y TGI para serving de alto throughput; llama.cpp y Ollama requieren conversión a GGUF, no incluida en el repositorio; `transformers` con `trust_remote_code=True` por el tag `custom_code`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-body-c3 | 4,54 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en la informacion | Hugging Face |
| joeyAIDev/zils-mini-body-m5 | no disponible | no disponible | Apache-2.0 | Hugging Face |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Al ser un promedio de pesos sin entrenamiento adicional, el rendimiento puede degradarse respecto a cualquiera de los modelos de origen; no hay evaluación publicada que lo confirme.
- Riesgo de alucinación inherente a los modelos de ~4B, especialmente en tareas de razonamiento complejo o dominios especializados.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto fuera del inglés o de los idiomas cubiertos por la base Qwen3.5-4B.
- Longitud de contexto no documentada; debe verificarse empíricamente antes de usarlo en casos con contexto largo.
- El tag `custom_code` obliga a ejecutar código remoto (`trust_remote_code=True`), lo que introduce un riesgo de seguridad en entornos de producción y requiere auditoría del código.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de copyright y la cláusula de modificación (sección 4), tal como el autor indica con el fichero NOTICE.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad, lo que desaconseja su uso en producción sin una evaluación propia exhaustiva.
- No se incluyen pesos en GGUF ni cuantizaciones precalculadas; el usuario debe generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-mini-body-c3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fuente 1 del merge: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Fuente 2 del merge: https://huggingface.co/joamCriff123/zils-mini-sx3
- Fuente 3 del merge: https://huggingface.co/joeyAIDev/zils-mini-body-m5
