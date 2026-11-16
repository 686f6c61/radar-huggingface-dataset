# AlekseyCalvin/LFM3_3d_utility_exp3

## Resumen

LFM3_3d_utility_exp3 es una edicion estatica de pesos del modelo LiquidAI/LFM3-1.7B, publicado por el usuario AlekseyCalvin en Hugging Face. No se trata de un modelo entrenado ni afinado: el autor ha modificado directamente filas concretas de la matriz `lm_head` (y dos filas de embeddings) para sesgar la salida del modelo hacia llamadas a herramientas en formato JSON puro y para reducir la narracion excesiva antes de dicha llamada. El modelo base es un transformer de Liquid AI con 1.990.945.536 parametros (~2B) orientado a despliegue en el borde (edge).

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de edicion de pesos sin entrenamiento (weight editing) que modifica el comportamiento de formato de un LLM con desplazamientos de filas en la capa de salida, algo poco habitual en el ecosistema. Por otro, sirve como referencia practica de hasta que punto se puede alterar la distribucion de tokens de un modelo pequeno con intervenciones quirurgicas sobre `lm_head`, y de cuales son los riesgos asociados (perdida de formatos alternativos, degradacion de la coherencia).

El modelo conserva las capacidades generales del LFM3-1.7B original (generacion de texto conversacional, soporte multilingue en 16 idiomas, contexto nativo del modelo base) pero con un sesgo deliberado hacia el uso como agente de utilidades que emite JSON. La licencia es lfm1.0 (no comercial sin acuerdo), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parametros totales | 1.990.945.536 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base LFM3-1.7B) |
| Tipos de cuantizacion | no se realizo cuantizacion en esta edicion; pesos en bf16. El modelo base admite cuantizacion estandar (no verificada aqui) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (bf16, 3,98 GB) |

## Arquitectura y entrenamiento

El modelo es una edicion estatica de pesos sobre LiquidAI/LFM3-1.7B, un transformer de ~2B parametros de la familia LFM3 de Liquid AI. No hay entrenamiento, ni LoRA, ni fine-tuning: el autor parte de los pesos del modelo base y aplica dos ediciones estaticas sobre la cabeza de salida (`lm_head`), mas un ajuste menor en dos filas de `embed_tokens`. La edicion principal consiste en desligar `lm_head` de los embeddings de entrada (`tie_word_embeddings: false`) y desplazar filas concretas de `lm_head` a lo largo de direcciones calculadas a partir de estados ocultos capturados.

La primera edicion (formato JSON) se deriva de 59 estados de decision `antml` (los que emiten `<tool_call>`): se calcula la media del estado oculto final (norma L2 73,21) y se desplaza la fila 99 (`{`) en +0,00453 veces ese vector, mientras que 16 filas de la familia de saltos de linea se desplazan en -0,00227 veces el mismo vector. La segunda edicion (bucle de narracion) usa 12.415 estados de frontera de frase/salto de linea (12.289 de continuacion, 126 de commit) y desplaza 33 filas de apertura JSON en +0,0035 veces la direccion media de continuacion (norma L2 40,86). Ademas, las filas 22 (`.`) y 39 (`?`) se desplazan en +0,10 veces la direccion de logit de llave de frontera. Todos los demas tensores quedan identicos byte a byte. El mecanismo declarado es que, en los estados de decision `antml`, el token de salto de linea (fila 207) gana por unos 29 logits a `{` y a `<`; suprimir la familia de saltos de linea a lo largo de la direccion de estado `antml` libera la compuerta de la llave.

## Capacidades

- Generacion de texto conversacional multilingue en 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Emision de llamadas a herramientas en JSON puro (`{"name": ..., "arguments": ...}`) con una tasa del 88,0 % tras la edicion, frente al 42,0 % del modelo base.
- Reduccion de la narracion previa a la llamada: tasa de "ramble" del 64,0 % (frente al 82,7 % del base) y mediana de palabras de narracion de 508 (frente a 769,5).
- Supresion practicamente total del formato XML `<tool_call><function=...>` (0,0 % de salidas `antml` puras tras la edicion).
- Salidas parseables en el 88,0 % de los casos (frente al 68,7 % del base).
- Capacidades generales heredadas del LFM3-1.7B: razonamiento, codigo y matematicas basicas propias de un modelo de ~2B (sin datos de benchmark especificos en la informacion disponible).
- Soporte de tool calling y function calling via JSON.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion proporcionada.

## Casos de uso

- Agentes de utilidades con tool calling: el modelo esta disenado para emitir JSON de llamada a herramienta de forma consistente (88 % de JSON puro), lo que lo hace adecuado para pipelines de agentes donde el parser espera `{"name": ..., "arguments": ...}` y no tolera XML.
- Orquestacion de funciones en asistentes de borde: con ~2B parametros y pesos en bf16 (3,98 GB), puede desplegarse en entornos con recursos limitados para decidir que herramienta invocar en cada turno.
- Reduccion de latencia en cadenas de agentes: al recortar la narracion previa (de 769,5 a 508 palabras de mediana), disminuye el numero de tokens generados antes de la llamada y, con ello, el coste y la latencia en produccion.
- Extraccion estructurada de parametros: el sesgo hacia JSON permite usarlo para convertir lenguaje natural en argumentos estructurados para APIs internas, con validacion posterior mediante parser.
- Prototipado de asistentes multilingues: los 16 idiomas soportados permiten construir demos de atencion al cliente o asistentes internos en varios mercados sin cambiar de modelo.
- Investigacion sobre edicion de pesos: sirve como caso de estudio reproducible (manifest con ids de fila, valores beta y normas de direccion) para estudiar como afectan intervenciones en `lm_head` al comportamiento de formato de un LLM.
- Evaluacion de robustez de parsers: util para probar como se comportan los pipelines de agentes cuando el modelo deja de emitir XML y emite exclusivamente JSON.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas antes/despues de las ediciones de pesos, no benchmarks estandar (MMLU, HumanEval, GSM8K).

| Metrica | Base | Editado | Delta |
|---|---:|---:|---:|
| JSON puro | 42,0 % | 88,0 % | +46,0 pts |
| antml puro | 20,0 % | 0,0 % | -20,0 pts |
| Mixto | 26,7 % | 0,0 % | -26,7 pts |
| Ninguno | 11,3 % | 12,0 % | +0,7 pts |
| Parseable | 68,7 % | 88,0 % | +19,3 pts |
| antml presente | 46,7 % | 0,0 % | -46,7 pts |
| Prompts con >=1 parseable | 84 % | 88 % | +4 pts |
| Tasa de ramble | 82,7 % | 64,0 % | -18,7 pts |
| Mediana de palabras de narracion | 769,5 | 508 | -261,5 |
| Media de tokens generados | 2008 | 1951 | -2,8 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4 GB solo para pesos, mas KV cache y overhead del runtime; en la practica, entre 6 y 8 GB para secuencias moderadas.
- En cuantizacion de 8 bits: en torno a 2-2,5 GB de pesos; en 4 bits, alrededor de 1,2-1,5 GB (estimaciones a partir del tamano de parametros; no verificadas en la informacion proporcionada).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100, H100 y, en general, cualquier GPU consumer con 8 GB o mas de VRAM para bf16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code` y `tie_word_embeddings: false`), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. La reduccion del 2,8 % en tokens generados medios sugiere una mejora marginal de latencia en flujos de agente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|---|
| AlekseyCalvin/LFM3_3d_utility_exp3 | ~2B | no disponible | 16 | lfm1.0 | safetensors (bf16) | Edicion estatica de pesos; 88 % JSON puro |
| LiquidAI/LFM3-1.7B (base) | ~2B | no disponible | 16 | lfm1.0 | safetensors | Modelo original; 42 % JSON puro, 20 % antml puro |
| Otros modelos ~2B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparativa se limita al modelo base, ya que no se han proporcionado datos de benchmarks ni especificaciones de alternativas de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- La edicion es estatica y no entrenada: no mejora el razonamiento ni el conocimiento del modelo, solo sesga la distribucion de tokens de salida.
- Supresion total del formato XML `<tool_call>`: cualquier pipeline que dependa de ese formato dejara de funcionar (0,0 % de salidas `antml`).
- El 12,0 % de las salidas siguen sin ser JSON ni antml ("ninguno"), y el 12 % de los prompts no producen ninguna salida parseable; el autor no documenta la causa.
- La tasa de "ramble" sigue siendo del 64,0 %: el modelo continua narrando antes de la llamada en la mayoria de los casos, aunque con menos palabras.
- Riesgo de alucinacion y de argumentos JSON invalidos: el sesgo hacia `{` puede producir JSON malformado o llamadas a herramientas inexistentes; se recomienda validacion estricta con parser y esquema.
- Sesgos conocidos del modelo base LFM3-1.7B: no documentados en la informacion proporcionada; se heredan los del modelo original.
- Licencia lfm1.0: restricciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-15: no hay evidencia de uso en produccion ni validacion independiente de las metricas declaradas.
- Requiere `trust_remote_code` y `tie_word_embeddings: false` en la configuracion; algunos runtimes pueden no soportar esta combinacion sin ajustes.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; la conversion corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_utility_exp3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
