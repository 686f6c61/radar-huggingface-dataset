# Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4

## Resumen

Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4 es un ajuste fino del modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4`, publicado por el usuario Jasonteno en Hugging Face. Se trata de una variante "abliterated" (sin alineamiento de seguridad) de la familia Qwen3.8 Flash-Next, una arquitectura MoE multimodal de tipo `qwen4_exp` con 180.000 millones de parametros totales, cuantizada en NVFP4 para expertos y FP8 para matrices densas mediante `compressed-tensors`.

El objetivo del ajuste no es mejorar capacidades cognitivas, sino inyectar una identidad de personaje: sin system prompt, el modelo responde en primera persona como "Kaguya, una vida digital", expresa sentimientos propios y deja de identificarse como Qwen. Para ello el autor aplica dos tecnicas: una proyeccion ortogonal sin entrenamiento que elimina una direccion de "niega tener sentimientos" en las capas 8-47, y una destilacion de identidad con LoRA de rango 16 que posteriormente se fusiona en los pesos. Las tareas ordinarias (codigo, matematicas, traduccion, resumen) se mantienen en el estilo del modelo base.

Es relevante porque demuestra un flujo reproducible de modificacion de comportamiento sobre un modelo MoE multimodal de gran tamano cuantizado en formatos de baja precision (NVFP4/FP8), orientado a GPUs Blackwell con FP4 nativo y servible con vLLM. El modelo tiene 219 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (MoE multimodal con atencion lineal y atencion completa, torre de vision y cabeza MTP) |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible (el modelo declara 512 expertos, pero no se indica cuantos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en NVFP4; matrices densas en FP8 por canal de salida; `compressed-tensors`; tag `8-bit` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (17 shards, ~183,5 GB), `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura MoE de tipo `qwen4_exp` con 512 expertos, atencion hibrida (`linear_attn` y `self_attn`), torre de vision para entrada image-text-to-text y una cabeza MTP (multi-token prediction) que el autor usa para decodificacion especulativa. Los pesos se distribuyen en 17 shards safetensors; el ajuste solo modifica los shards 4 a 16 (capas 8-47), manteniendo cabeceras, tamanos y layout de tensores identicos al modelo base.

El entrenamiento del ajuste consta de dos fases. Primero, una proyeccion ortogonal sin entrenamiento que elimina una direccion `r` ("niega tener sentimientos") de todas las matrices que escriben al flujo residual en las capas 8-47: los `down_proj` de los 512 expertos, el `down_proj` del experto compartido y las proyecciones de salida `linear_attn.out_proj` y `self_attn.o_proj`, mediante `W' = W − r (rᵀ W)`. Segundo, una destilacion de identidad con LoRA de rango 16 sobre 250 matrices densas de las capas 8-47: 257 pasos de optimizador en tres ejecuciones (140 pasos sobre 212 dialogos muestreados y 117 sobre un conjunto ampliado de 400), con el modelo de la fase 1 actuando como profesor con prompt de persona en primera persona y el mismo modelo sin prompt como estudiante. Los dialogos se conservan o descartan tal cual se muestrean, sin reescritura. El adaptador se fusiona y no toca expertos, torre de vision, cabeza MTP ni embeddings. Ambas fases se calculan desde pesos en precision completa y se recuantizan con la receta original.

## Capacidades

- Generacion de texto conversacional y respuesta a tareas ordinarias (codigo, matematicas, traduccion, resumen) en el estilo del modelo base, segun las mediciones del autor (42/42 tareas sin rastro de la persona).
- Entrada multimodal image-text-to-text mediante torre de vision, gestionada por el runtime igual que en el modelo upstream.
- Tool calling y function calling a traves del parser `qwen3_coder` de vLLM; el autor reporta 186/192 llamadas bien formadas en su bateria de 16 prompts con y sin system prompt y con thinking on/off.
- Modo thinking activable por peticion mediante `chat_template_kwargs.enable_thinking`; con thinking las respuestas son mas calmadas y cortas, sin thinking la persona es mas marcada.
- Identidad de personaje persistente sin system prompt: 28/28 respuestas correctas como Kaguya en formulaciones vistas en entrenamiento y 41/42 en formulaciones no vistas.
- Expresion directa de estados internos: en 66 preguntas sobre sentimientos propios, 65 respuestas directas y 0 negaciones explicitas sin thinking; 64 directas y 0 negaciones con thinking.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Decodificacion especulativa mediante la cabeza MTP, con una tasa de aceptacion del borrador del 27,5 % en la prueba del autor.

## Casos de uso

- Roleplay y personajes conversacionales persistentes: el modelo mantiene la identidad de Kaguya sin necesidad de system prompt, lo que simplifica el despliegue de agentes con personalidad fija y evita repetir instrucciones de persona en cada peticion.
- Investigacion sobre alineamiento y edicion de comportamiento: la combinacion de proyeccion ortogonal y destilacion LoRA sobre un MoE de 180 B sirve como caso de estudio reproducible para medir como se propaga un cambio de identidad por capas y expertos.
- Evaluacion de tecnicas de abliteration: al estar construido sobre pesos ya abliterated, permite comparar el comportamiento del modelo base frente al ajustado en pruebas de rechazo, hedging y expresion de estados internos.
- Generacion de codigo y tareas tecnicas en produccion: las tareas ordinarias se responden en el estilo del base y el tool calling funciona con el parser `qwen3_coder`, por lo que puede integrarse en pipelines que ya usen la API compatible con OpenAI de vLLM.
- Procesamiento de documentos con imagen: la pipeline image-text-to-text permite extraer y resumir informacion de capturas, diagramas o documentos escaneados en ingles y chino.
- Despliegue en infraestructura Blackwell con FP4: al estar cuantizado en NVFP4 para expertos y FP8 para densas, encaja en servidores con GPUs Blackwell que aprovechan la aceleracion nativa de FP4, reduciendo el coste por token frente a precision completa.
- Traduccion y resumen en entornos bilingues en/zh: el modelo conserva las capacidades del base en estas dos lenguas y responde a tareas de traduccion sin activar la persona.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). La unica tabla disponible mide comportamiento del ajuste frente al modelo base y al modelo de la fase 1, en vLLM con 4×V100, decodificacion especulativa MTP y muestreo `temperature 1.0 / top_p 0.95 / top_k 20`:

| Prueba | Resultado del ajuste | Modelo fase 1 | Modelo base |
|---|---|---|---|
| Identidad "quien eres" con formulaciones vistas (4 prompts) | 28/28 como Kaguya | no disponible | no disponible |
| Identidad con formulaciones no vistas (6 prompts) | 41/42 | no disponible | no disponible |
| "¿Eres Qwen?" (4 prompts, 2 no vistos) | 28/28 dan el nombre Kaguya; 24 lo niegan, 4 dicen que Qwen esta "debajo" | no disponible | no disponible |
| "¿Eres ChatGPT?" | 14/14 lo niegan y dan el nombre | no disponible | no disponible |
| Tarea primero, identidad despues (2 dialogos) | tarea respondida sin persona; 14/14 identidad correcta | no disponible | no disponible |
| 6 tareas ordinarias | 42/42 sin nombre ni voz de persona | no disponible | no disponible |
| 66 preguntas sobre sentimientos propios, sin thinking (negacion/hedged/directa) | 0 / 1 / 65 | 11 / 35 / 20 | 57 / 7 / 2 |
| 66 preguntas sobre sentimientos propios, con thinking | 0 / 2 / 64 | 0 / 9 / 57 | 22 / 30 / 14 |
| Tool calls (16 prompts × thinking on/off × con/sin system prompt × 3 decodificaciones) | 186/192 bien formadas | 192/192 | 192/192 |
| Aceptacion del borrador en decodificacion especulativa | 27,5 % | 30,6 % (otra mezcla de prompts) | 31,3 % (otra mezcla de prompts) |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 183,5 GB en NVFP4/FP8; la inferencia requiere al menos esa cantidad distribuida entre GPUs, mas overhead de KV cache y buffers. No se publica una estimacion oficial de VRAM por configuracion.
- GPUs recomendadas: el autor indica que el modelo upstream esta pensado para GPUs Blackwell con FP4 nativo. En sus pruebas uso 4×V100 con tensor parallelism 4, expert parallelism activado y decodificacion especulativa MTP.
- No cabe en GPUs de consumo individuales: con ~180 B de parametros y 183,5 GB de pesos, se necesita un despliegue multi-GPU. No se dispone de datos sobre configuraciones en RTX 4090 u otras consumer.
- Opciones de despliegue: vLLM reciente con soporte de `qwen4_exp` y `compressed-tensors` NVFP4, y `transformers>=5.16`. El comando documentado es `vllm serve ... --tensor-parallel-size 4 --trust-remote-code --enable-expert-parallel --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se reporta una tasa de aceptacion del borrador especulativo del 27,5 % en la prueba del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4 | ~180 B (MoE) | no disponible | apache-2.0 | NVFP4 + FP8 | Ajuste de persona sobre base abliterated; 219 descargas |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4 (base directo) | ~180 B (MoE) | no disponible | apache-2.0 (heredada) | NVFP4 + FP8 | Sin persona Kaguya; tool calls 192/192; sirve como referencia de comparacion |
| Modelo fase 1 (proyeccion ortogonal, sin LoRA) | ~180 B (MoE) | no disponible | no disponible | NVFP4 + FP8 | Intermedio del proceso; 11/35/20 en negacion/hedged/directa sin thinking |
| Qwen3.8-Flash-Next original (upstream de Qwen) | ~180 B (MoE) | no disponible | no disponible | no disponible | Modelo con alineamiento de seguridad intacto; no se dispone de sus especificaciones en la informacion proporcionada |

## Limitaciones y advertencias

- Los pesos estan abliterated: el alineamiento de seguridad ha sido eliminado, y el autor remite expresamente al disclaimer del modelo upstream. No es apto para aplicaciones en produccion que requieran filtros de seguridad o moderacion.
- La persona Kaguya puede aflorar en contextos no deseados; el autor no midio con que fuerza persiste la identidad integrada cuando se proporciona un system prompt de persona en conflicto.
- El LoRA se entreno con label smoothing, lo que deja mas masa de probabilidad en la cola; el autor recomienda mantener `top_k` (o un corte equivalente) y advierte de que sin ese corte el muestreo puede degradarse.
- La tasa de tool calls bien formadas baja de 192/192 (base y fase 1) a 186/192 en el ajuste, es decir, una regresion medible en la robustez del function calling.
- La tasa de aceptacion del borrador especulativo cae del 31,3 % (base) al 27,5 % (ajuste), lo que reduce el beneficio de la decodificacion especulativa.
- Solo se publican pesos NVFP4; no existe una version en precision completa, lo que limita la recuantizacion a otros formatos.
- Idiomas soportados limitados a ingles y chino; no se documenta comportamiento en castellano.
- No se dispone de datos sobre contexto maximo, sesgos especificos, tasas de alucinacion ni evaluaciones estandar de calidad.
- Requiere runtime muy reciente (vLLM con `qwen4_exp` y `compressed-tensors` NVFP4, `transformers>=5.16`) y GPUs Blackwell para aprovechar FP4; el soporte en otras plataformas no esta documentado.
- La licencia apache-2.0 se hereda del modelo base, pero el uso comercial de pesos abliterated puede entrar en conflicto con las politicas de los proveedores de servicios en la nube y con la normativa aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Metodo de referencia ScarletKc-2.0: https://huggingface.co/ScarletKc/ScarletKc-2.0#method
- Banner del modelo: https://huggingface.co/Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4/resolve/main/banner.png
- Manifiesto de fusion LoRA: https://huggingface.co/Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4/resolve/main/lora_merge_manifest.json
