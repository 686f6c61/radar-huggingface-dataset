# coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic

## Resumen

Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic es una cuantizacion FP8 dinamica del modelo multimodal Gemma 4 de Google, en su variante de 26B de parametros totales con 4B activos (arquitectura MoE), y con el perfil de "abliteration" aplicado por huihui-ai. El autor de la cuantizacion es coolthor (Thor Lin), que publica el resultado como un artefacto listo para servir con vLLM sin necesidad de aplicar cuantizacion en tiempo de ejecucion. El modelo base sin cuantizar en BF16 ocupa unos 50 GB y no es servible a velocidad de produccion con la ruta `--quantization fp8` de vLLM, que resulta aproximadamente 6 veces mas lenta que un checkpoint pre-cuantizado.

El problema que resuelve es, por tanto, de despliegue: reduce el peso a 27 GB en FP8, mantiene la capacidad de vision (el pipeline es image-text-to-text) y conserva el perfil de abliteration del modelo original, todo ello en un formato compatible con `compressed-tensors` y vLLM. La "abliteration" es una tecnica de modificacion de pesos que elimina direcciones de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a ciertas peticiones; esto tiene implicaciones de seguridad y de alineacion que se detallan mas abajo.

El interes actual del artefacto es doble: por un lado, demuestra un flujo de cuantizacion FP8_DYNAMIC con `llmcompressor` sobre un modelo MoE multimodal con lista de exclusiones critica (el router de expertos no debe cuantizarse); por otro, documenta el uso de decodificacion especulativa MTP (multi-token prediction) con un draft model de Google, con una ganancia medida del 33-34% en throughput en hardware DGX Spark (GB10). El modelo tiene 26.544.133.710 parametros totales segun los safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4), con vision encoder; `Gemma4ForConditionalGeneration` |
| Parametros totales | 26.544.133.710 |
| Parametros activos | 4B (segun el sufijo A4B del nombre; no se detalla el reparto exacto por capa en la informacion disponible) |
| Longitud de contexto | no disponible (la configuracion de servicio de ejemplo usa `--max-model-len 8192`, pero no se declara el maximo nativo) |
| Tipos de cuantizacion | FP8 dinamico (esquema `FP8_DYNAMIC` de llmcompressor, formato `compressed-tensors`); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 (heredada del modelo base y de los terminos de uso de Gemma) |
| Formato de pesos | safetensors con `compressed-tensors` (FP8); tamano del repo 28,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con capacidad multimodal de entrada imagen-texto, construido sobre la familia Gemma 4 de Google en su variante 26B-A4B-it (instruction-tuned). La informacion disponible no detalla el numero de capas, el numero de expertos por capa, la dimension oculta ni la composicion exacta del dataset de preentrenamiento; tampoco se documentan las fases de RLHF o DPO del modelo original. Lo que si se documenta es que el modelo incluye un router de expertos cuya cuantizacion rompe el despacho de expertos, lo que confirma una topologia MoE con enrutamiento aprendido y, presumiblemente, expertos compartidos (`shared_expert_gate` aparece en la lista de exclusiones).

La innovacion tecnica relevante en este artefacto no esta en el entrenamiento sino en el pipeline de cuantizacion y servicio. La cuantizacion se realizo con `llmcompressor` y el esquema `FP8_DYNAMIC`, en una ejecucion de 2,9 minutos sobre GB10 con pipeline data-free y calibracion de 30 modulos MoE para derivar las escalas FP8. La lista de exclusiones es critica e incluye el router (`re:.*router.*`), `lm_head`, embeddings, todas las normalizaciones, las capas convolucionales y de atencion lineal, y todo el subarbol visual (patch embed, projector, merger, tower). Sobre el modelo base se aplico previamente la abliteration de huihui-ai, que modifica los pesos para eliminar la direccion de rechazo; el autor senala que esto desplaza la distribucion de prediccion del cuerpo del modelo y probablemente contribuye a un desequilibrio de enrutamiento MoE tras la abliteration.

En el plano del servicio, el autor documenta decodificacion especulativa MTP emparejando este modelo como target con el draft model vanilla `google/gemma-4-26B-A4B-it-assistant`. Con `num_speculative_tokens=1` se obtiene una aceptacion del 69% y 52,6 tok/s, frente a 39,3 tok/s de linea base; con `num_speculative_tokens=4` la aceptacion token-level cae al 40% (65/43/29/21 por posicion) y el throughput es practicamente identico (52,4 tok/s). El autor recomienda n=1 por la limpieza de la aceptacion por paso. El modelo vanilla equivalente alcanza 108 tok/s en el mismo hardware, de modo que la brecha del ~50% se atribuye al "impuesto de abliteration" combinado con la calibracion FP8 sobre pesos desplazados.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte multilingue adicional segun la model card.
- Razonamiento y respuesta a instrucciones en formato chat (modelo instruction-tuned; requiere plantilla de chat de Gemma).
- Vision: descripcion de imagenes, incluyendo detalles de vestimenta, entorno, pose y expresion facial (validado en el smoke test con un retrato de estilo clasico).
- Generacion de codigo y matematicas: capacidad esperable por herencia de Gemma 4, aunque no se aportan benchmarks especificos en la informacion disponible.
- Tool calling / function calling: soportado en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Modo thinking: no documentado en la informacion disponible.
- Audio: no soportado. El modelo declara `audio_config: null` por diseno de la variante, no por artefacto de cuantizacion.
- Video: la configuracion de servicio de ejemplo desactiva explicitamente imagen, audio y video con `--limit-mm-per-prompt`; la capacidad de video no se confirma.
- Decodificacion especulativa MTP compatible con vLLM (requiere la integracion `gemma4_mtp.py`, PR #41745).

## Casos de uso

- Servicio de chat multimodal en produccion con vLLM: el checkpoint FP8 de 27 GB se sirve directamente con `vllm serve` sin cuantizacion en tiempo de ejecucion, evitando la penalizacion de ~6x de la ruta `--quantization fp8`. Adecuado para equipos que ya operan vLLM y necesitan un modelo de 26B con vision en una sola GPU de 40-80 GB.
- Descripcion y etiquetado de imagenes a escala: el modelo conserva el encoder visual sin cuantizar, por lo que puede generar descripciones detalladas (vestuario, entorno, pose) en pipelines de catalogacion, moderacion o accesibilidad. El smoke test confirma coherencia en este dominio.
- Asistente conversacional en ingles y chino: el soporte nativo de ambos idiomas permite desplegar un unico modelo para bases de usuarios bilingues, con la plantilla de chat de Gemma aplicada correctamente en el endpoint `/v1/chat/completions`.
- Agentes con tool calling: la combinacion de `--enable-auto-tool-choice` y el parser `gemma4` permite integrar el modelo en flujos de agente que invocan funciones externas (APIs, bases de datos) en varios pasos.
- Aceleracion de inferencia con decodificacion especulativa: el par target/draft documentado (con `num_speculative_tokens=1`) ofrece un +34% de throughput con aceptacion del 69%, util para reducir coste por token en servicios de batch=1 con latencia interactiva.
- Investigacion sobre alineacion y abliteration: el artefacto permite estudiar empiricamente el efecto de la eliminacion de la direccion de rechazo sobre el rendimiento (el "impuesto" medido del ~50% frente al vanilla) y sobre la distribucion de enrutamiento MoE.
- Evaluacion de recetas de cuantizacion FP8 en MoE multimodales: la lista de exclusiones documentada (router, capas visuales, normalizaciones) sirve como referencia reproducible para cuantizar otros modelos MoE con `llmcompressor`.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son de throughput y aceptacion de decodificacion especulativa en DGX Spark (GB10), batch=1, temperatura 0,0:

| Configuracion | Aceptacion | Throughput |
|---|---|---|
| Linea base (sin especulacion) | n/a | 39,3 tok/s |
| MTP, num_speculative_tokens=4 | 40% token-level (65 / 43 / 29 / 21 por posicion) | 52,4 tok/s (+33%) |
| MTP, num_speculative_tokens=1 | 69% | 52,6 tok/s (+34%) |
| Referencia: Gemma 4 vanilla + MTP, mismo hardware | no disponible | 108 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 28,7 GB en disco; con cache KV en FP8 y `--gpu-memory-utilization 0.65` el autor lo ejecuta en DGX Spark (GB10). Como referencia practica, se necesita una GPU con al menos ~32-40 GB de memoria para el peso mas cache y overhead, aunque la cifra exacta no se declara.
- GPU recomendadas: el autor valida en DGX Spark (GB10, ARM64, CUDA 13.0). Por tamano, son adecuadas A100 80GB, H100 80GB, L40S 48GB y RTX 6000 Ada 48GB. En GPUs consumer de 24 GB (RTX 4090, 3090) el checkpoint FP8 no cabe completo sin offloading o sin una cuantizacion adicional.
- Cabe en consumer GPU: no de forma directa en 24 GB; si en GPUs de 48 GB (RTX 6000 Ada, A6000) y en las de 80 GB.
- Opciones de despliegue: vLLM es la via documentada y recomendada, con la imagen `vllm/vllm-openai:gemma4-0505-arm64-cu130` y soporte MTP via PR #41745. No se documenta soporte en llama.cpp, Ollama ni TGI para este checkpoint FP8.
- Latencia y throughput: 39,3 tok/s sin especulacion y 52,6 tok/s con MTP n=1 en GB10, batch=1, temperatura 0,0. No hay datos de throughput con batch mayor ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Huihui-gemma-4-26B-A4B-it-abliterated FP8-Dynamic) | 26,5B totales / 4B activos | no disponible | FP8 dinamico, listo para vLLM | apache-2.0 | Vision retenida, abliterated, MTP +34% |
| `google/gemma-4-26B-A4B-it` (vanilla) | 26,5B totales / 4B activos | no disponible | BF16 original | terminos de Gemma | Referencia de rendimiento: 108 tok/s con MTP en GB10 |
| `huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated` (BF16) | 26,5B totales / 4B activos | no disponible | BF16 (~50 GB) | apache-2.0 | Modelo base de esta cuantizacion; no servible a velocidad de produccion con la ruta FP8 runtime de vLLM |
| `google/gemma-4-26B-A4B-it-assistant` | no disponible | no disponible | no disponible | terminos de Gemma | Draft model para MTP; no es un modelo de chat comparable |

La comparacion con alternativas de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo del modelo: no ofrece las mismas garantias de alineacion ni de filtrado de contenido que el Gemma 4 original. No es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- El autor mide un "impuesto de abliteration" de aproximadamente el 50% en throughput frente al modelo vanilla (52,6 vs 108 tok/s con MTP en GB10), atribuido a la calibracion FP8 sobre pesos desplazados y al desequilibrio de enrutamiento MoE.
- La cuantizacion FP8 puede degradar la calidad respecto al BF16 original; no se aportan evaluaciones de calidad comparativas en la informacion disponible.
- El modelo debe usarse con la plantilla de chat de Gemma a traves de `/v1/chat/completions`. El endpoint `/v1/completions` con prompt crudo produce bucles de tokens basura, comportamiento que el autor confirma que tambien ocurre en el modelo vanilla.
- La cuantizacion del router MoE rompe el despacho de expertos; cualquier re-cuantizacion debe respetar la lista de exclusiones documentada.
- El soporte MTP requiere una version de vLLM con la integracion `gemma4_mtp.py` (PR #41745); no esta en releases estables.
- La toolchain de cuantizacion requiere un parche sobre `llmcompressor` (eliminar kwargs `use_auth_token` obsoletos) porque las releases estables fijan `transformers <= 4.57.6` y Gemma 4 exige transformers 5.0+.
- El audio no esta soportado (`audio_config: null`); la capacidad de video no se confirma y la configuracion de ejemplo la desactiva.
- La licencia apache-2.0 se hereda del modelo base, pero el uso queda sujeto tambien a los terminos de uso de Gemma de Google; conviene revisarlos antes de un despliegue comercial.
- El modelo tiene solo 214 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa de su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic
- Modelo base (abliterated, BF16): https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Gemma 4 original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Draft model para MTP: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Toolchain de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor en Hugging Face: https://huggingface.co/coolthor
- Blog del autor con benchmarks y notas: https://ai-muninn.com
- Apoyo al autor: https://buymeacoffee.com/thorlin
