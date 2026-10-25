# Plus-Ten/DeepSeek-V4.1-Flash-1017-TensorFold-EXL3-2.9bpw

## Resumen

Plus-Ten/DeepSeek-V4.1-Flash-1017-TensorFold-EXL3-2.9bpw es una cuantización EXL3 del checkpoint deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`), publicada por el usuario Plus-Ten. No es un modelo entrenado desde cero: es un empaquetado de pesos de 105.318.449.362 parámetros totales, distribuido en 39 shards y 192.452 tensores, con un ancho de bits medio declarado de 2,9 bits por peso y licencia MIT. El objetivo es permitir ejecutar un modelo de la familia DeepSeek V4.1 Flash en hardware con memoria limitada, sacrificando el mínimo de calidad medible frente al original servido por API.

El interés técnico del pack está en su proceso de validación: el autor publica divergencia KL (0,0256 de media), acuerdo top-1 con el original (95,25%), y comparativas directas con otras dos cuantizaciones de 2,9 bpw del mismo modelo (Mia EAQ v1 y LibertAIDAI). Además, adopta exactamente el layout de tensores y los anchos por tensor de Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw, con una única desviación: los módulos densos del bloque MTP van a 6 bits en lugar de 4. Es, por tanto, un artefacto pensado para inferencia con exllamav3, no para entrenamiento ni para pipelines que esperen safetensors estándar en bf16.

La relevancia práctica es doble: por un lado sirve como opción de despliegue de un modelo tipo MoE de gran tamaño en entornos con varias GPU; por otro, es un caso de estudio de cuantización agresiva (capas 18-22 de expertos enrutados a 2 bits) con métricas de degradación publicadas y reproducibles. Hay que tener en cuenta que el pack no incluye las tablas Engram ni los sesgos de enrutado para tokens de imagen, que deben tomarse del checkpoint original, y que la información sobre contexto, idiomas y parámetros activos no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos enrutados y expertos compartidos, bloque MTP (multi-token prediction) y tablas Engram en el modelo base; el pack es una cuantización EXL3 de ese checkpoint |
| Parametros totales | 105.318.449.362 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3, codebook `mul1`, `out_scales: always`; expertos enrutados 3 bits (capas 18-22 a 2 bits), expertos compartidos 5 bits (capas 11-29 a 4 bits), atención y otras proyecciones mayoritariamente 5 bits, cabeza a 6 bits, MTP denso a 6 bits y expertos enrutados del MTP a 4 bits; media declarada 2,9 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), 39 shards, 192.452 tensores, 210.721.774.264 bytes |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017, revision `1bae0e1088993b9b82de08f59de5be5a34e42170` |
| Convertidor | exllamav3 1.6.3 (`c9a57ae832a3035e264e0a412e1daf4ebb699b98`) |
| Libreria de inferencia | exllamav3 |
| Tamano del repo | 210,8 GB |
| Descargas / likes | 63 / 1 |
| Fecha de creacion / actualizacion | 2026-10-19 / 2026-10-25 (v1.1 el 2026-10-20) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso (MoE) con dos poblaciones de expertos: enrutados y compartidos. El pack conserva esa topología y aplica cuantización por tensor con anchos distintos según la sensibilidad de cada bloque, siguiendo el layout de Mia-AiLab. Los expertos enrutados, que son la mayor parte del cómputo, quedan a 3 bits, con un tramo especialmente agresivo a 2 bits en las capas 18-22; los expertos compartidos bajan a 4 bits en las capas 11-29 y a 5 bits en el resto. La atención y las proyecciones auxiliares se mantienen en 5 bits y la cabeza de salida en 6 bits, lo que protege la distribución final de logits. El bloque MTP se cuantiza de forma distinta al layout de referencia: los módulos densos suben a 6 bits y solo sus expertos enrutados quedan a 4.

Todos los tensores cuantizados se codificaron desde el checkpoint 1017 usando un conjunto de calibración renderizado con el formato de prompt 1017. Los tensores no cuantizados adoptan los dtypes del layout Mia: por ejemplo, `gate.weight` del router se guarda en F16 (BF16 en el original). La versión 1.1 corrige un detalle relevante para el enrutado: los 43 vectores `ffn.gate.bias` (40 capas más 3 del MTP) estaban redondeados a fp16 en v1 y ahora se sirven en F32 en el fichero `zz-gate-bias-f32-1017.safetensors`, con las 43 entradas correspondientes del índice apuntando a ese fichero. Los 39 shards del modelo no cambian respecto a v1.

No hay información en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni las fases de RLHF/DPO del modelo base; esos datos corresponden a DeepSeek y no se detallan aquí. La innovación del pack es de compresión y empaquetado (layout compatible con Mia 2,9 bpw, corrección de sesgos de router en F32, MTP a 6 bits), no de arquitectura.

## Capacidades

- Generación de texto y razonamiento de nivel alto: el pack conserva el rendimiento del original en GPQA Diamond con thinking activado (92,9%) e iguala en IFEval a nivel de prompt (89,6% frente a 89,8%).
- Respuesta a preguntas de conocimiento y cálculo con thinking desactivado: MMLU-Pro 67,0%, con una pérdida de 1,0 punto frente al original concentrada en categorías con cálculo intensivo.
- Modo thinking configurable mediante la plantilla de chat: parámetros `enable_thinking` (por defecto true), `thinking_mode` (`"thinking"` o `"chat"`) y `reasoning_effort` (`"low"`, `"high"`, `"max"` o un entero de 1 a 100, por defecto `"high"`).
- Soporte de tool calling / function calling: la plantilla acepta `tools` y espera los `arguments` como objetos; los argumentos en forma de cadena JSON se renderizan de forma distinta al `encoding.py` oficial.
- Salida estructurada: parámetro `response_format` en la plantilla de chat.
- Control del razonamiento en la respuesta: `drop_thinking` (por defecto true) elimina el bloque de pensamiento del prompt renderizado.
- Capacidades de agente y razonamiento multi-paso: implícitas en el modo thinking y en el soporte de herramientas; no se publican evaluaciones específicas de agentes en la información disponible.
- Multilingüismo: no disponible; la model card no declara lista de idiomas.
- Visión: el modelo base tiene enrutado específico para tokens de imagen (`ffn.gate.bias_vl`), pero esos vectores no están en los shards del pack y se ofrecen aparte en `extras/gate_bias_vl.safetensors`; no se documenta en esta ficha qué módulo visual los consume ni si está incluido.
- Variante abliterada opcional: sidecar de drowzeys que sustituye `attn.wo_b` en las capas 10-35, con scripts de aplicación.

## Casos de uso

- Evaluación de cuantizaciones en investigación: el pack publica KL media (0,0256) y acuerdo top-1 (95,25%) frente al original, lo que permite usarlo como referencia reproducible al comparar nuevas técnicas de compresión EXL3 o de calibración.
- Razonamiento científico y técnico en producción con thinking activado: con GPQA Diamond al 92,9%, es adecuado para asistentes de diagnosis técnica, revisión de literatura o resolución de problemas de dominio STEM donde el coste por consulta justifica el modo razonamiento.
- Asistentes con tool calling sobre APIs internas: la plantilla admite `tools` y `response_format`, de modo que se puede integrar en un orquestador que espere objetos JSON en `arguments` y validar la salida antes de ejecutar la acción.
- Atención al cliente multi-turno: el modelo mantiene el rendimiento de instrucciones del original (IFEval 89,6% a nivel de prompt estricto), condición necesaria para seguir políticas de respuesta; la ventana de contexto aplicable no está disponible y debe consultarse en la ficha del modelo base antes de dimensionar el histórico.
- Generación y revisión de código en pipelines de CI: el modo `reasoning_effort` permite bajar a `"low"` en tareas de autocompletado o revisión rápida y subir a `"high"`/`"max"` en refactorizaciones, aunque no se publican resultados de HumanEval ni de benchmarks de código en la información disponible.
- Despliegue en clústeres con varias GPU: al ser un pack EXL3 de 2,9 bpw, encaja en escenarios donde no se dispone de suficiente VRAM para el checkpoint original en BF16 y se acepta una pérdida acotada y medida en MMLU-Pro.
- Investigación sobre alineación y rechazo: la variante abliterada (sidecar de drowzeys) permite estudiar el efecto de la abolición de direcciones de rechazo con métricas comparables; el propio autor documenta una caída en preguntas de derecho (61,9% frente a 65,8% en MMLU-Pro).
- Servicio de inferencia con formato de prompt compatible: la plantilla Jinja reproduce byte a byte 27.156 de 27.179 conversaciones de prueba y las 5 pruebas oficiales de encoding, lo que facilita migrar de `encoding/encoding.py` a un servidor que solo soporte plantillas Jinja.

## Benchmarks y rendimiento

Datos publicados por el autor. "–" indica que no se midió.

| Metrica | Original (API) | Este pack | Este pack abliterado | Mia EAQ v1 | LibertAIDAI |
|---|---|---|---|---|---|
| Divergencia KL vs original (media) | – | 0,0256 | – | 0,0290 | – |
| Acuerdo top-1 con el original | – | 95,25% | – | 94,93% | – |
| MMLU-Pro, thinking off | 68,0% | 67,0% | 67,9% | 66,2% | 64,5% |
| GPQA Diamond, thinking on | 92,9% | 92,9% | 92,9% | – | 93,9% |
| IFEval, thinking off (prompt-level strict) | 89,8% | 89,6% | 88,9% | – | – |

Notas del autor: GPQA Diamond e IFEval no muestran diferencia significativa frente al original (p = 1 en ambos); la pérdida de 1,0 punto en MMLU-Pro con thinking off y respuestas de solo letra es significativa (p < 0,001) y se concentra en categorías con cálculo. Frente a los otros dos packs de 2,9 bpw, este tiene menor KL que Mia EAQ v1 y mayor MMLU-Pro que ambos (+0,8 y +2,6 puntos, p < 0,001). La variante abliterada rinde igual salvo en preguntas de derecho. No se han publicado resultados de benchmarks de código, matemáticas o multilingües en la información disponible.

## Requisitos de hardware

- Tamano en disco: 210.721.774.264 bytes (unos 196 GiB), repartidos en 39 shards; hay que prever espacio adicional para las tablas Engram del checkpoint original y para `extras/gate_bias_vl.safetensors`.
- Discrepancia a verificar: a 2,9 bits por peso y 105.318.449.362 parámetros, el peso teórico seria de unos 38 GB, pero el repositorio publicado ocupa 210,8 GB (equivalente a 16 bits por parámetro). Conviene comprobar el contenido real de los shards antes de dimensionar el hardware; a efectos de planificación, usar la cifra del repositorio.
- VRAM estimada: si se toma el tamano publicado, hacen falta del orden de 210 GB solo para pesos, mas cache KV y overhead del runtime; esto implica 4x H100 80 GB (320 GB) o 8x A100 40 GB (320 GB), con margen para el contexto. Si se confirma una huella real de ~38 GB, bastaria 1x A100/H100 80 GB o 2x RTX 4090 24 GB.
- GPU consumer: una RTX 4090 de 24 GB no puede alojar el pack tal como está publicado; solo seria viable con offloading a RAM del sistema, con el coste de latencia correspondiente.
- Opciones de despliegue: exllamav3 es la libreria declarada; el layout es compatible con cualquier runtime que soporte el layout Mia 2.9 bpw. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y el formato EXL3 no es un GGUF estándar.
- Requisito de integracion: el token BOS forma parte de la plantilla de chat, por lo que hay que tokenizar con `add_special_tokens=False`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | MMLU-Pro (off) | GPQA-D (on) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este pack (Plus-Ten, TensorFold EXL3) | 105.318.449.362 | no disponible | EXL3, 2,9 bpw | 67,0% | 92,9% | MIT | Publico en HuggingFace, 63 descargas |
| DeepSeek-V4.1-Flash-1017 (original) | mismo modelo base | no disponible | BF16 / API oficial | 68,0% | 92,9% | no disponible | API oficial y pesos en HuggingFace |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw (Mia EAQ v1) | no disponible | no disponible | EXL3, 2,9 bpw | 66,2% | – | no disponible | Publico en HuggingFace |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | no disponible | no disponible | EXL3, 2,9 bpw | 64,5% | 93,9% | no disponible | Publico en HuggingFace |

Las tres cuantizaciones comparten el mismo modelo base y una media de 2,9 bpw, por lo que la comparación es directamente equivalente en coste de memoria. La diferencia práctica es la calidad: este pack lidera MMLU-Pro con thinking off y tiene la menor divergencia KL de las dos medidas.

## Limitaciones y advertencias

- Las tablas Engram no están incluidas: hay que tomar los shards 47 y 48 del checkpoint 1017 original (revision `1bae0e10`). Las tablas de la 1017 difieren de las de V4.1, así que no sirven las de otras versiones.
- Los 43 vectores `ffn.gate.bias_vl` (sesgo de enrutado para tokens de imagen) tampoco están en los shards; se ofrecen aparte en `extras/gate_bias_vl.safetensors` y solo para runtimes que los carguen desde un fichero externo.
- Calidad: pérdida de 1,0 punto en MMLU-Pro con thinking off, estadísticamente significativa (p < 0,001), concentrada en categorías con cálculo. Las capas 18-22 de expertos enrutados están a 2 bits, el tramo más agresivo del pack.
- La variante abliterada degrada el rendimiento en preguntas de derecho (61,9% frente a 65,8% en MMLU-Pro) y el sidecar de drowzeys está en un repositorio con acceso restringido (gated).
- La plantilla de chat no es idéntica al `encoding.py` oficial en todos los casos: reproduce 27.156 de 27.179 conversaciones de prueba y las 5 pruebas oficiales; los casos restantes son edge cases. Con argumentos de herramienta en forma de cadena JSON el renderizado difiere del oficial.
- Riesgo de alucinación: no se publican tasas de factualidad ni evaluaciones de hallucinations; es un riesgo genérico de la familia y no está cuantificado en esta información.
- Idiomas: la lista de idiomas soportados no está disponible, por lo que no se puede garantizar calidad fuera de inglés sin evaluación previa.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible (más allá del efecto de la abliteración sobre rechazos).
- Licencia: el pack es MIT, pero la licencia del modelo base no se indica en la información proporcionada; conviene verificar la ficha de deepseek-ai/DeepSeek-V4.1-Flash-1017 antes de un uso comercial.
- Madurez: 63 descargas y 1 like en el momento de la consulta, con una revisión v1.1 a los pocos días de publicarse; es un artefacto reciente y poco validado por terceros.
- Verificación de integridad: entre v1 y v1.1 hay tensores F16 "superseded" en los shards; los cargadores que lean los ficheros en orden alfabético y permitan sobrescritura obtendrán los valores F32 correctos, pero un cargador estricto puede quedarse con los F16. Conviene comprobar el índice `model.safetensors.index.json`.
- Requisito de formato: EXL3 no es un formato universal; el pack solo es utilizable en runtimes que soporten el layout Mia 2.9 bpw.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Plus-Ten/DeepSeek-V4.1-Flash-1017-TensorFold-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio del cuantizador exllamav3: https://github.com/turboderp-org/exllamav3
- Layout de referencia (Mia-AiLab): https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Cuantización comparable Mia EAQ v1: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Cuantización comparable LibertAIDAI: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Sidecar de abliteración (gated): https://huggingface.co/drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated
- Sesgos de enrutado para tokens de imagen: https://huggingface.co/Plus-Ten/DeepSeek-V4.1-Flash-1017-TensorFold-EXL3-2.9bpw/blob/main/extras/gate_bias_vl.safetensors
- Referencia del formato de prompt oficial (`encoding.py`) incluida en el repo: https://huggingface.co/Plus-Ten/DeepSeek-V4.1-Flash-1017-TensorFold-EXL3-2.9bpw/blob/main/encoding/encoding.py
