# open-athena/Snowball-67B-A2B-Chat-Aligned-Base-2026.10.22

## Resumen

Snowball 67B-A2B Chat-Aligned Base (2026.10.22) es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por open-athena, derivado del modelo base `snowball-67b-a2b-base-262k-qk175` tras un ajuste fino supervisado (SFT) en tres etapas. Con 67.078.882.816 parametros totales y aproximadamente 2.000 millones activos por token, el modelo esta disenado como artefacto de investigacion para experimentos de destilacion on-policy (OPD) y estudio de interferencia entre tareas en arquitecturas MoE, dentro del ecosistema Marin.

La arquitectura `GrugMoeForCausalLM` (`grug_moe`) consta de 26 capas con 256 expertos enrutados (top-4) mas uno compartido, combinando atencion de ventana deslizante de 2.048 posiciones con atencion global de tipo grouped-query. El modelo declara 262.144 posiciones de contexto en `config.json`, aunque el tokenizer limita a 131.072 y la evaluacion se realizo a 131.072. Los pesos se distribuyen en bf16 a lo largo de 39 shards safetensors que suman 134 GB.

El SFT ensena al modelo un formato de chat, razonamiento (thinking) y llamada a herramientas, pero no incluye ajuste por preferencias ni alineamiento de seguridad. El autor lo describe explicitamente como un punto de partida para investigacion de post-entrenamiento, no como un asistente terminado, y advierte que no ha sido evaluado ni probado adecuadamente para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GrugMoeForCausalLM` (`grug_moe`), transformer MoE con atencion sliding-window (2.048) y global GQA |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | Aproximadamente 2B por token |
| Longitud de contexto | 262.144 posiciones en `config.json`; tokenizer limitado a 131.072; evaluacion a 131.072 |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (bf16, 39 shards, 134 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `GrugMoeForCausalLM`, un transformer MoE de 26 capas con 256 expertos enrutados (top-4 activos por token) mas un experto compartido. Combina capas de atencion de ventana deslizante de 2.048 posiciones con capas de atencion global de tipo grouped-query, lo que permite manejar contextos largos sin coste cuadratico completo en todas las capas. El tokenizer es el vocabulario de Llama 3 con 128.256 tokens, incluido en el repositorio.

El SFT se realizo en tres etapas secuenciales, cada una de una epoca sobre secuencias empaquetadas de 32.768 tokens, partiendo de los pesos de la etapa anterior con optimizador nuevo. Todas las etapas usan Adam (beta 0.9/0.95, epsilon 1e-8), learning rate 5e-6 con decaimiento coseno sin warmup, weight decay 0, gradient clipping a 1.0 y 64 secuencias por paso. El entrenamiento se ejecuto con Levanter sobre 64 GPUs H100, y las conversaciones de mas de 32.768 tokens se descartaron.

| Etapa | Datos | Pasos | Tokens |
|---|---|---:|---:|
| 1. Chat | `nyu-dice-lab/wildchat50m-rewild-sft-385700` @ `46a5bb5` | 255 | 0,54B |
| 2. Thinking | `laion/llama-nemotron-science-reasoning-on-canonical-think-full` @ `bae881d` | 626 | 1,31B |
| 3. Terminal agent | `nvidia/Nemotron-Terminal-Corpus` @ `a1667c4` | 1.193 | 2,50B |

La exportacion publicada corresponde al paso final de la etapa 3. El modelo forma parte de un experimento de Marin que aplica la misma receta de SFT a cuatro arquitecturas MoE para que metodos posteriores partan de bases comparables con capacidad de chat.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat definido por plantilla (`chat_template.jinja`).
- Modo de razonamiento (thinking): el modelo decide si pensar; el razonamiento se delimita con los tokens especiales `<|start_think|>` (128002) y `<|end_think|>` (128003).
- Llamada a herramientas (tool calling) en texto plano con el formato `<tool_call>\n{"name": ..., "arguments": {...}}\n</tool_call>` y respuestas en `<tool_response>`.
- Razonamiento cientifico y de tipo STEM, adquirido en la etapa 2 sobre el dataset Nemotron Science Reasoning.
- Capacidad de agente de terminal, entrenada en la etapa 3 sobre Nemotron-Terminal-Corpus.
- Contexto largo: hasta 131.072 tokens efectivos en evaluacion, con 262.144 declarados en configuracion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en post-entrenamiento: servir como base chat-aligned comparable frente a otras arquitecturas MoE del mismo experimento Marin para estudiar interferencia entre tareas y destilacion on-policy.
- Experimentos de destilacion on-policy (OPD): el modelo esta pensado como punto de partida para aplicar OPD sobre una base que ya comprende formato de chat, thinking y tool calling, reduciendo el coste de ensenar esos formatos desde cero.
- Desarrollo de agentes de terminal: la etapa 3 entrena al modelo sobre Nemotron-Terminal-Corpus, lo que lo hace adecuado para prototipar agentes que emiten comandos y procesan salidas de shell en entornos controlados.
- Razonamiento cientifico asistido: la etapa 2 sobre Nemotron Science Reasoning permite usar el modelo en tareas de razonamiento STEM con cadenas de pensamiento explicitas, utiles para generar datos de entrenamiento o evaluar pipelines de razonamiento.
- Generacion de datos sinteticos de conversacion: al ser una base chat-aligned sin tuning de preferencias, puede emplearse para generar trazas conversacionales y de tool calling que alimenten etapas posteriores de RLHF o DPO.
- Evaluacion de infraestructura de inferencia MoE: su tamano (67B totales, 2B activos) y su soporte exclusivo en la build de vLLM de Marin lo convierten en un banco de pruebas para medir throughput y latencia de arquitecturas MoE dispersas en clusters H100.
- Prototipado de asistentes con tool calling: el formato de llamada a herramientas en texto plano permite integrarlo en pipelines donde el orquestador parsea `<tool_call>` y devuelve resultados en `<tool_response>`, sin depender de APIs nativas de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de formato: con repetition_penalty 1.0, el 10% de las respuestas de chat no cierran el turno y solo el 41% de las llamadas a herramientas de agente se parsean correctamente; con 1.1, el cierre de bloques think en el conjunto de chat cae del 99,4% al 88,8%. La configuracion recomendada es repetition_penalty 1.05.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 134 GB solo para pesos, mas overhead de KV cache y activaciones; requiere multiples GPUs.
- El entrenamiento se realizo en 64 GPUs H100, lo que da una idea de la escala de computo asociada.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en bf16; no se dispone de versiones cuantizadas publicadas (GGUF, AWQ, GPTQ) en la informacion proporcionada.
- Despliegue: `grug_moe` no es compatible con vLLM estandar ni con `transformers`; se sirvio con la build de vLLM de Marin `0.0.0.dev20260924+marin.01911be34fac`.
- Opciones de despliegue alternativas (llama.cpp, Ollama, TGI): no disponibles, dado que la arquitectura no esta soportada por esas herramientas segun la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (MoE de ~67B totales con ~2B activos). El autor menciona que existen modelos companeros en la misma coleccion dentro del experimento Marin, pero no se detallan sus nombres ni metricas en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor advierte explicitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- Sin ajuste por preferencias ni alineamiento de seguridad: no ha pasado por RLHF, DPO ni tuning de seguridad, por lo que puede generar contenido inapropiado o danino.
- Riesgo de alucinacion: al ser una base SFT sin verificacion factual, puede producir afirmaciones incorrectas con aparente confianza.
- Sensibilidad a repetition_penalty: con valor 1.0 el 10% de las respuestas no terminan el turno y solo el 41% de las tool calls se parsean; con 1.1 se degrada el cierre de bloques think al 88,8%.
- Gestion de tokens especiales: es necesario solicitar `skip_special_tokens: false` para preservar los delimitadores de razonamiento; de lo contrario se pierde la frontera entre thinking y respuesta.
- Stop tokens: `config.json` y `tokenizer_config.json` solo declaran `<|end_of_text|>` (128001); los runtimes que ignoren `generation_config.json` deben anadir `<|eot_id|>` (128009) como stop explicito.
- Tool definitions: la plantilla no renderiza el campo `tools` de la peticion, por lo que las herramientas pasadas por esa via se ignoran silenciosamente; hay que describirlas en el mensaje de sistema.
- Limitacion de contexto en tokenizer: aunque `config.json` declara 262.144 posiciones, el tokenizer limita a 131.072 y la evaluacion se hizo a esa longitud.
- Conversaciones largas: las secuencias de mas de 32.768 tokens se descartaron durante el entrenamiento, lo que puede degradar el comportamiento en conversaciones muy extensas.
- Compatibilidad de infraestructura: requiere la build de vLLM de Marin; no funciona con vLLM estandar ni con `transformers`.
- Idiomas soportados: no disponibles en la informacion proporcionada, lo que impide garantizar cobertura multilingue.
- Licencia openmdw-1.1: deben revisarse los terminos concretos de esta licencia antes de cualquier uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Chat-Aligned-Base-2026.10.22
- Modelo base: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175
- Repositorio Marin: https://github.com/marin-community/marin
- Build de vLLM de Marin: https://github.com/marin-community/vllm/releases/tag/marin-vllm-gpu-20260924-01911be34fac
- Dataset WildChat50M Rewild SFT: https://huggingface.co/datasets/nyu-dice-lab/wildchat50m-rewild-sft-385700
- Dataset Nemotron Science Reasoning: https://huggingface.co/datasets/laion/llama-nemotron-science-reasoning-on-canonical-think-full
- Dataset Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
