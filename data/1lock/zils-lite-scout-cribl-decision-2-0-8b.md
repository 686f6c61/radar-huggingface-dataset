# 1lock/zils-lite-scout-cribl-decision-2-0-8b

## Resumen

`1lock/zils-lite-scout-cribl-decision-2-0-8b` es un re-upload sin modificaciones de los pesos de `cribl-ai/cribl-decision-2-0.8B`, un modelo de unos 853 millones de parámetros construido sobre la arquitectura Qwen3.5. El autor original es el equipo de Cribl AI; el repositorio analizado lo publica el usuario `1lock` como entrada de tipo *scout* para el pool d3-lite del subprotocolo Zils (Bittensor SN127), un mecanismo de minería que remunera la aportación de modelos públicos conocidos al *soup* del subprotocolo.

El modelo no introduce innovaciones propias: se trata de un fine-tuning del checkpoint base `Qwen/Qwen3.5-0.8B` orientado a tareas de decisión, presumiblemente enrutamiento y clasificación dentro de pipelines de observabilidad de datos, coherente con el dominio de Cribl. Su interés práctico radica en el tamaño reducido (menos de 1 GB de pesos en el repositorio, 1,7 GB totales), lo que permite despliegue en CPU y GPU de gama baja con latencias muy contenidas.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeño y ligero apto para tareas de clasificación y decisión en producción; por otro, ilustra el formato de empaquetado exigido por Zils, que renombra los tensores bajo el prefijo `model.language_model.`, incorpora la torre de visión de Qwen3.5-0.8B y elimina los tensores `lm_head`/`mtp` por usar *tied embeddings*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con torre de visión añadida en el re-empaquetado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors en BF16/FP16 es convertible a GGUF, AWQ o GPTQ con herramientas estándar |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5 con embeddings atados (*tied embeddings*), motivo por el cual el re-empaquetado de Zils descarta los tensores `lm_head` y `mtp`. Sobre ese checkpoint, Cribl AI aplicó un fine-tuning cuyo dataset, número de tokens y metodología (SFT, DPO o RLHF) no se documentan en la información disponible. El repositorio de `1lock` no aporta información adicional sobre el entrenamiento: los pesos del modelo de lenguaje son byte a byte idénticos al checkpoint fuente en la revisión `fede0fcd51b2fcbace7ed1f1729bb404eddfeb2a`.

La única modificación técnica respecto al original es de empaquetado: los nombres de tensor se han movido bajo el prefijo `model.language_model.`, se ha incorporado sin cambios la torre de visión de Qwen3.5-0.8B en la revisión `2fc06364715b` y se ha añadido un fichero `zils-owner.json` que identifica la *hotkey* responsable del commit, tal como exige el protocolo. No hay constancia de decodificación especulativa, atención lineal ni otras innovaciones arquitectónicas en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de 0,85 B parámetros de la familia Qwen3.5.
- Tareas de decisión y enrutamiento, que es el propósito declarado del fine-tuning de Cribl AI (clasificación de eventos y elección de acciones en pipelines de datos).
- Procesamiento de imagen potencial a través de la torre de visión de Qwen3.5-0.8B incluida en el re-empaquetado, aunque no se documenta el pipeline ni la calidad de dicha capacidad multimodal.
- Capacidades multilingües: no documentadas en la información disponible; se heredarían, en su caso, del modelo base Qwen3.5.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita seriamente este tipo de uso.
- Modo *thinking* explícito: no documentado.

## Casos de uso

- Clasificación de eventos y decisiones de enrutamiento en pipelines de observabilidad: el modelo está afinado específicamente para tareas de decisión, por lo que encaja como clasificador ligero que decide a qué destino o transformación va cada registro antes de pasarlo a un modelo mayor.
- Filtrado previo (*pre-routing*) en arquitecturas de cascada: con menos de 1 GB de pesos puede ejecutarse en CPU y descartar o etiquetar la mayoría del tráfico, reservando modelos grandes solo para los casos ambiguos, lo que reduce coste por petición.
- Etiquetado y triaje de alertas en sistemas de monitorización: su reducido tamaño permite desplegarlo junto al colector de logs y clasificar severidad o categoría sin salir del nodo.
- Prototipado rápido y pruebas de integración: al ser un checkpoint pequeño con licencia Apache 2.0, sirve para validar pipelines de inferencia (vLLM, llama.cpp, TGI) antes de escalar a modelos mayores con la misma interfaz.
- Evaluación de modelos en entornos con recursos limitados: útil como *baseline* de referencia en experimentos de destilación o comparación de fine-tunes sobre Qwen3.5-0.8B.
- Docencia y experimentación con formatos de empaquetado: el repositorio documenta explícitamente los cambios de nombres de tensor y la incorporación de la torre de visión, lo que lo convierte en un ejemplo práctico del formato de *body* de Zils.
- Experimentación con el subprotocolo Zils (Bittensor SN127): como entrada *scout* del pool d3-lite, sirve para estudiar el mecanismo de remuneración de re-uploads de modelos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; aproximadamente 2,5-3 GB en la práctica.
- Cuantización a 8 bits: ~0,9 GB de pesos; a 4 bits: ~0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, L4, A10, A100 y H100 lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas, e incluso en iGPU con memoria compartida usando cuantización de 4 bits.
- Despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers estándar son opciones viables; para CPU, llama.cpp con GGUF Q4 es la vía más eficiente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto y latencias de decenas de milisegundos por token en GPU moderna, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1lock/zils-lite-scout-cribl-decision-2-0-8b` | 852.985.920 | no disponible | Apache 2.0 | Re-upload de `cribl-ai/cribl-decision-2-0.8B` con torre de visión de Qwen3.5 |
| `cribl-ai/cribl-decision-2-0.8B` | ~0,8 B | no disponible | Apache 2.0 | Modelo original; pesos idénticos al de esta ficha |
| `Qwen/Qwen3.5-0.8B` | ~0,8 B | no disponible | Apache 2.0 (según el modelo base) | Checkpoint base sin el fine-tuning de decisión de Cribl |
| `Qwen/Qwen3-0.6B` | ~0,6 B | 32.768 (familia Qwen3) | Apache 2.0 | Alternativa de tamaño comparable de la generación anterior |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles: no hay benchmarks publicados para el fine-tuning de Cribl ni métricas de evaluación en el repositorio.

## Limitaciones y advertencias

- El repositorio es un re-upload, no un modelo entrenado por su autor; cualquier incidencia debe reportarse contra `cribl-ai/cribl-decision-2-0.8B`.
- Los pesos del modelo de lenguaje son idénticos al original, pero el empaquetado cambia los nombres de tensor y añade la torre de visión; herramientas que esperen el layout estándar de Qwen3.5 pueden requerir adaptación.
- No se documentan sesgos, composición del dataset de fine-tuning ni evaluación de alucinación; no hay garantías de calidad fuera del dominio de decisión para el que fue entrenado.
- El contexto máximo no está documentado; asumir el del modelo base sin verificación puede provocar truncamientos silenciosos.
- Idiomas soportados no documentados: no debe asumirse un rendimiento multilingüe sin evaluación previa.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE del autor original si lo incluye.
- El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta y fue creado el 3 de noviembre de 2026; su validación en producción es nula.
- El uso como entrada *scout* en Zils está sujeto a las reglas del subprotocolo (tarifa 0.25 para re-uploads de la lista pública); no implica ninguna garantía de rendimiento dentro del *soup*.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1lock/zils-lite-scout-cribl-decision-2-0-8b
- Modelo original: https://huggingface.co/cribl-ai/cribl-decision-2-0.8B
- Revisión del modelo original referenciada: https://huggingface.co/cribl-ai/cribl-decision-2-0.8B/tree/fede0fcd51b2fcbace7ed1f1729bb404eddfeb2a
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión de Qwen3.5-0.8B usada para la torre de visión: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b
- Documentación del protocolo Zils (mining): `docs/mining.md` del repositorio Zils (no se dispone de URL directa en la información proporcionada)
- Lista de modelos públicos de Zils: `zils/data/soup-known-lite.json` (no se dispone de URL directa en la información proporcionada)
