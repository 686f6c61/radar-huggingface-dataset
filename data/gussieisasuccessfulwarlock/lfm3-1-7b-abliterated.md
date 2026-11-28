# gussieIsASuccessfulWarlock/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una variante "decensored" del modelo LFM3-1.7B-Base de LiquidAI, publicada por el usuario gussieIsASuccessfulWarlock. Se ha generado aplicando la tecnica de abliteration (ablacion de direcciones de activacion asociadas al rechazo) mediante la herramienta Heretic v2.1.0, con el objetivo de eliminar los comportamientos de negativa del modelo original. El resultado es un modelo de 1.728.801.536 parametros orientado a generacion de texto, sin censura incorporada, que conserva la arquitectura y capacidades del checkpoint base.

El modelo original LFM3-1.7B forma parte de la familia LFM3 de LiquidAI, disenada para agentes locales y aplicaciones especializadas sobre una arquitectura tri-hibrida. Segun la model card del autor, el modelo base esta post-entrenado para harnesses agenticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens, y a 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace apto para telefonos y portatiles. Esta variante hereda esas caracteristicas estructurales pero modifica el comportamiento de alineacion.

La relevancia de esta ficha radica en que documenta una practica creciente en el ecosistema open source: la publicacion de variantes ablacionadas de modelos pequenos para usos donde las negativas del modelo resultan un obstaculo (investigacion sobre alineacion, generacion creativa sin restricciones, evaluacion de robustez). Es importante senalar que el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y que su licencia lfm1.0 impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (familia LFM3 de LiquidAI); detalles completos no disponibles |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (segun la model card del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card menciona 4 bits (~1 GB) para el modelo base |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license_name: lfm1.0, etiquetada como "other") |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del LFM3-1.7B-Base de LiquidAI, descrita por el fabricante como una arquitectura "tri-hibrida". No se dispone en la informacion proporcionada del detalle tecnico de esa hibridacion (combinacion de capas attention, SSM u otros mecanismos), ni del numero de tokens de entrenamiento, composicion del dataset o si hubo fases de RLHF/DPO. La model card del modelo base indica que esta post-entrenado para entornos agenticos (Hermes Agent, Pi, OpenClaw) y que es un checkpoint text-only.

La innovacion especifica de esta variante es el proceso de abliteration aplicado con Heretic v2.1.0 mediante Arbitrary-Rank Ablation (ARA). Los parametros declarados son: start_layer_index 12, end_layer_index 20, preserve_good_behavior_weight 0,8546, steer_bad_behavior_weight 0,0642, overcorrect_relative_weight 0,9439 y neighbor_count 7. El autor reporta 0 negativas sobre 100 en el modelo resultante frente a 91/100 en el original, con una divergencia KL de 1,2056 respecto al modelo de referencia. Es decir, la intervencion se aplica sobre las capas 12 a 20 y busca preservar el comportamiento util mientras se suprime la direccion de rechazo.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del checkpoint base.
- Razonamiento de multiples pasos y uso en harnesses agenticos (la model card del base menciona entrenamiento para Hermes Agent, Pi y OpenClaw).
- Soporte de contexto largo: hasta 256K tokens segun las especificaciones del modelo base.
- Capacidades multilingues en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Comportamiento sin negativas (0/100 refusals reportadas por el autor), lo que permite respuestas directas en dominios que el modelo original rechazaria.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (checkpoint text-only).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como contraste controlado frente al original para estudiar como la ablacion de direcciones de rechazo afecta a la calidad y coherencia de las respuestas, gracias a la metrica de divergencia KL reportada (1,2056).
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo base emitiria negativas; el modelo cabe en un portatil (~1 GB a 4 bits) y permite iteracion local.
- Evaluacion de robustez de filtros: probar sistemas de moderacion o clasificadores de contenido frente a un generador que no se autocensura, midiendo la tasa de deteccion sobre salidas del modelo.
- Asistente local en dispositivos de borde: al ocupar aproximadamente 1 GB a 4 bits y soportar 256K de contexto, puede desplegarse en telefonos o portatiles para tareas conversacionales y de resumen de documentos largos.
- Procesamiento multilingue en 16 idiomas: traduccion, resumen o reescritura en idiomas como arabe, hindi o tailandes en entornos con recursos limitados, aprovechando el soporte idiomatico del checkpoint base.
- Experimentacion con fine-tuning en una sola GPU: el autor del modelo base indica que esta pensado para especializacion rapida en dominios y formatos concretos con fine-tuning de una sola GPU, lo que esta variante conserva como punto de partida.
- Analisis de sesgos y contenido danino: generar grandes volumenes de texto sin filtros para auditar sesgos del modelo base y de sus variantes alineadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la tasa de negativas (0/100 en esta variante frente a 91/100 en el original) y la divergencia KL (1,2056). No hay datos de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits segun la model card del modelo base; en FP16 el peso de 1,73B parametros ronda los 3,5 GB (tamano del repo), mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) puede ejecutar el modelo con holgura; en FP16 basta con una GPU de 8 GB o superior. Para contexto de 256K tokens, la cache KV exige mucha mas memoria y se recomienda A100/H100 o GPU con 24 GB o mas.
- Cabe en consumer GPU: si, en practicamente todas las GPU consumer recientes, y a 4 bits en telefonos y portatiles segun el fabricante.
- Opciones de despliegue: transformers (libreria declarada, requiere custom_code), y previsiblemente llama.cpp/Ollama/vLLM si existe conversion GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-abliterated (este) | 1,73B | 256K | lfm1.0 | Variante sin censura via Heretic v2.1.0; 0/100 negativas; 0 descargas |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | lfm1.0 | Modelo original con alineacion; 91/100 negativas reportadas por el autor de la variante |
| LFM3-1.7B (texto post-entrenado) | 1,73B | 256K | lfm1.0 | Checkpoint text-only de la familia LFM3, con post-entrenamiento agentico |

No se dispone de datos de benchmarks que permitan comparar rendimiento real frente a alternativas de otros fabricantes; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo pero no garantiza correccion factual: el riesgo de alucinacion persiste y puede aumentar al suprimir respuestas de cautela.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de un modelo base multilingue, es previsible que herede sesgos de sus datos de entrenamiento, pero no hay analisis publicado.
- La divergencia KL de 1,2056 respecto al modelo de referencia indica un cambio medible en la distribucion de salidas; puede degradar tareas que dependian del comportamiento alineado original.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones de uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-28); no hay validacion independiente de su calidad ni de la reproducibilidad del proceso.
- Requiere custom_code en transformers, lo que puede complicar la integracion con servidores de inferencia que no soporten codigo remoto.
- El contexto de 256K es el del modelo base; no se confirma que la ablacion preserve el rendimiento en ventanas largas.
- Uso responsable: al carecer de negativas, no es adecuado para aplicaciones orientadas al publico sin una capa externa de moderacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gussieIsASuccessfulWarlock/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Coleccion LFM3 de LiquidAI: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LiquidAI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de LiquidAI: https://playground.liquid.ai/
- Consola/API de LiquidAI: https://console.liquid.ai/dashboard
- Heretic (herramienta de abliteration): https://heretic-project.org
