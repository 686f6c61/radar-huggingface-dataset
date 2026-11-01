# aimeri/Ministral-3-3B-Base-2512-chatml

## Resumen

aimeri/Ministral-3-3B-Base-2512-chatml es una adaptación comunitaria del modelo base Ministral-3-3B-Base-2512 de Mistral AI, publicada por el usuario aimeri en Hugging Face. No se trata de un modelo entrenado: es el mismo modelo base, pero preparado para fine-tuning con el formato de conversación ChatML. El autor ha renombrado dos tokens reservados sin uso del vocabulario Tekken a `<|im_start|>` y `<|im_end|>`, ha inicializado sus embeddings a partir de tokens donantes del propio modelo y ha corregido problemas del tokenizador que rompían los saltos de línea en transformers 5.x.

Su relevancia radica en que el modelo original de Mistral no incluye una plantilla de chat ni tokens de conversación listos para entrenar, lo que complica los fine-tunes de terceros. Esta versión resuelve ese problema: el modelo sabe generar con el formato ChatML desde el primer paso, el token de fin de secuencia está correctamente cableado como EOS y el tokenizador funciona de forma fiable con la librería transformers. Está dirigido a desarrolladores que quieran entrenar su propio asistente sobre una base de 3.400 millones de parámetros con licencia Apache-2.0.

Es un modelo de texto puro (la torre de visión del original fue eliminada), con arquitectura transformer densa, pesos en safetensors y soporte multilingüe en once idiomas, entre ellos el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (solo modelo de lenguaje, torre de vision eliminada) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bfloat16; cuantizacion externa posible) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6,9 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Ministral-3-3B-Base-2512 de Mistral AI. La version original era multimodal; en esta variante se elimino la torre de vision con un script (`prep_text_only.py`) dejando el modelo de lenguaje bit a bit identico al original. No hay datos publicados sobre el numero de tokens de preentrenamiento ni la composicion del dataset, mas alla de lo que Mistral haya documentado para el modelo base.

Sobre esta base no se ha realizado ningun entrenamiento adicional: la modificacion es exclusivamente a nivel de tokenizador y vocabulario. Los tokens `<SPECIAL_20>` y `<SPECIAL_21>` (filas sin entrenar del vocabulario Tekken, con norma 0,2838) se renombraron a `<|im_start|>` (id 20) y `<|im_end|>` (id 21), y sus embeddings se injertaron desde los tokens `<s>` y `</s>` respectivamente. Como el modelo comparte pesos entre embedding y `lm_head` (`tie_word_embeddings: true`), esa unica copia sirve tanto para entrada como para salida, garantizando que un fine-tune pueda aprender a emitir `<|im_end|>` y detenerse. El autor verifico que, en prompts sin los ids 20 y 21, los logits coinciden bit a bit con la exportacion text-only. Adicionalmente se elimino `tekken.json` (que forzaba un backend de tokenizador que ignoraba plantillas Jinja) y se cambio `tokenizer_class` a `PreTrainedTokenizerFast` para evitar un bug de transformers 5.x que eliminaba los saltos de linea. No hubo RLHF ni DPO: es un modelo base.

## Capacidades

- Generacion de texto en once idiomas (ingles, frances, castellano, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe), heredada del modelo base.
- Formato de conversacion ChatML listo para fine-tuning, con plantilla Jinja incluida en `chat_template.jinja` y en `tokenizer_config.json`.
- EOS correctamente configurado (`eos_token_id: 21`, es decir, `<|im_end|>`), lo que permite que el modelo entrenado aprenda a detenerse.
- Sin capacidades de vision, audio ni tool calling nativas: es un modelo base de texto, pendiente de ajuste fino.
- No sabe mantener turnos de conversacion ni detenerse sin entrenar: el propio autor advierte que con decodificacion greedy sobre un prompt de chat escribe una frase coherente y luego sigue inventando turnos de `user`.

## Casos de uso

- Fine-tuning de asistentes conversacionales: es el caso de uso principal. El formato ChatML ya esta cableado, de modo que un SFT con datasets como OpenAssistant, Tulu o datos propios funciona sin tener que tocar el vocabulario ni el tokenizador.
- Entrenamiento de modelos de dominio especifico en castellano: al ser una base de 3,4B con licencia Apache-2.0, es adecuada para ajustarla con corpus juridicos, medicos o tecnicos en espanol y desplegarla on-premise sin restricciones de licencia.
- Destilacion de modelos grandes: se puede usar para entrenar un asistente pequeno que imite las respuestas de modelos mayores, aprovechando que el costo de inferencia de 3,4B es bajo.
- Bots de chat autoalojados con presupuesto de hardware limitado: tras el fine-tune, el modelo cabe en GPUs de consumo, lo que lo hace viable para despliegues locales con Ollama o llama.cpp (previa conversion a GGUF).
- Prototipado rapido de plantillas de prompt y agentes: al ser un modelo base ligero y abierto, permite iterar barato sobre formatos de conversacion y estructuras de agente antes de escalar a modelos mayores.
- Investigacion sobre alineacion y RLHF/DPO: la base limpia con tokens de chat ya preparados es un punto de partida conveniente para experimentos de preference tuning, ya que el token de parada esta funcional desde el inicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser el modelo de lenguaje bit a bit identico al original `mistralai/Ministral-3-3B-Base-2512` (salvo las columnas 20 y 21 del vocabulario), los resultados publicados por Mistral para ese modelo base deberian transferirse, pero no hay datos verificados en la model card de esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB en bfloat16 (6,9 GB de pesos) para el modelo completo; en torno a 2-3 GB con cuantizacion de 4 bits externa (GGUF Q4_K_M o similar). No hay cifras oficiales publicadas.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB o mas de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090) es suficiente para inferencia; para fine-tuning completo se recomiendan GPUs con 24 GB (RTX 4090, A5000) o A100, y para LoRA/QLoRA basta con 8-16 GB.
- Cabe comodamente en GPUs de consumo para inferencia; para entrenamiento completo se recomienda hardware de datacenter o multi-GPU.
- Opciones de despliegue: transformers (codigo de ejemplo incluido en la model card), vLLM, TGI y, tras conversion a GGUF, llama.cpp y Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato chat nativo | Licencia | Notas |
|---|---|---|---|---|
| aimeri/Ministral-3-3B-Base-2512-chatml | 3,43B | ChatML preparado para fine-tune (no entrenado) | Apache-2.0 | Base de Mistral adaptada por la comunidad; texto puro |
| mistralai/Ministral-3-3B-Base-2512 | 3,43B | No (tokens reservados sin usar, sin plantilla) | Apache-2.0 | Original multimodal de Mistral; requiere trabajo manual para ChatML |
| Qwen2.5-3B-Instruct | 3,09B | ChatML ya entrenado | Qwen Research (restricciones para algunos usos) | Instruct de fabrica; competidor directo en la gama de 3B |

## Limitaciones y advertencias

- Es un modelo base sin instruir: no sigue instrucciones, no mantiene turnos y no emite `<|im_end|>` sin un fine-tune previo. No es utilizable como chatbot tal cual.
- Los embeddings de `<|im_start|>` y `<|im_end|>` parten de vectores donantes (`<s>` y `</s>`), no de embeddings entrenados para chat: el significado de estos tokens lo aprende el fine-tune.
- La plantilla no emite BOS: si se usa `apply_chat_template(..., tokenize=True)` hay que anadir `<s>` manualmente, o el modelo se comportara de forma degradada.
- Riesgo de alucinacion tipico de modelos base; sin datos de evaluacion publicados para esta variante concreta.
- Sin torre de vision: cualquier necesidad multimodal requiere el modelo original de Mistral.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene verificar los terminos del modelo original de Mistral si se deriva de el.
- Repositorio comunitario con muy poca traccion (239 descargas, 0 likes): el mantenimiento y la correccion de errores dependen de un unico autor.

## Enlaces

- Modelo: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-chatml
- Base text-only del mismo autor: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-text
- Modelo original de Mistral: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
