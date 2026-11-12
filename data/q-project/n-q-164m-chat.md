# q-project/N-Q-164M-Chat

## Resumen

N-Q-164M-Chat es un modelo de lenguaje conversacional de pequeno tamano (225,5 millones de parametros reales en safetensors, 166,8M de parametros del transformer mas 58,7M de un modulo n-gram) desarrollado por q-project. Se trata del modelo de chat de la "escalera" N-Q, una familia de modelos rusos/ingleses entrenados desde cero sobre una unica GPU V100 de 16 GB, siguiendo el espiritu del proyecto MiniMind. El modelo base es q-project/N-Q-164M y sobre el se aplico una receta completa: pretrain, SFT, SFT de razonamiento, DPO, GRPO y RL agentico.

La propuesta tecnica mas distintiva son los "circuitos exactos": el modelo emite marcadores como `<CALC>expr<EQ>`, un ejecutor determinista calcula el resultado exacto y el modelo continua la generacion desde ahi. Esto convierte al modelo en un hibrido entre LM y orquestador de herramientas, con soporte fiable de calculadora, fechas y conversiones de unidades (16/16 en una sonda de herramientas de 16 tareas). La arquitectura combina Gated DeltaNet (atencion lineal recurrente) con capas de atencion con compuerta, una mezcla poco habitual en modelos de este tamano.

Es relevante ahora porque demuestra que es posible entrenar un pipeline completo (incluyendo RL agentico) en hardware de consumo, con licencia Apache 2.0 y pesos abiertos. Sus resultados en razonamiento matematico son deliberadamente modestos (GSM8K en torno al 7%), y el propio autor lo presenta como una release de investigacion, no como un producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atencion lineal recurrente) + atencion con compuerta; arquitectura custom (`trust_remote_code`) |
| Parametros totales | 225.554.163 (safetensors); 166,8M del transformer + 58,7M de modulo n-gram segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y int8 (archivos `model.qpack` / `model.q8.qpack`); no se documentan GGUF ni otras |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, mas empaquetado propietario `.qpack` (fp16) y `.q8.qpack` (int8) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con una arquitectura hibrida: capas de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, combinadas con capas de atencion con compuerta. Incluye ademas un modulo n-gram de 58,7M de parametros que eleva el total a 225,5M. El modelo implementa su propio `generate()` que gestiona el estado recurrente de Gated DeltaNet y una KV cache para las capas de atencion, y acepta parametros de muestreo (`temperature`, `top_p`, `top_k`, `repetition_penalty`, `max_new_tokens`, `stop_ids`).

El entrenamiento se realizo desde cero sobre una unica V100 de 16 GB, con pipeline completo en PyTorch: tokenizer, pretrain, SFT, SFT de razonamiento, DPO, GRPO y RL agentico. Los datos incluyen FineWeb-Edu, Cultura RU Edu, Wikipedia, SmolTalk, GrandMaster-PRO-MAX, Saiga Scored, Russian Reasoning, Saiga Preferences, UltraFeedback Binarized y GSM8K. La innovacion principal son los circuitos exactos: el modelo genera `<CALC>expr<EQ>`, un ejecutor determinista escribe el resultado y `<ECALC>`, y el modelo continua. Requiere pasar `tokenizer=tok` a `generate()` para activar el ejecutor; sin el, el modelo intenta calcular el numero por si mismo y suele fallar. El modo thinking se activa con `enable_thinking=True` en `apply_chat_template`; si no se especifica, el modelo decide cuando pensar.

## Capacidades

- Generacion de texto conversacional fluido en ruso e ingles.
- Razonamiento aritmetico con circuitos exactos: calculadora, diferencias de fechas y conversiones de unidades mediante ejecutor determinista.
- Tool calling fiable en la sonda de 16 tareas (8 en ruso y 8 en ingles): 16/16 en el checkpoint final.
- Modo thinking opcional (`<THINK>`/`<ETHINK>`) que el modelo activa en calculos y problemas de palabras.
- Razonamiento multi-paso limitado: resuelve algunos problemas de palabras de GSM8K.
- Capacidades multilingues restringidas a ruso e ingles.
- No se documentan capacidades de vision, audio ni function calling generico fuera de las herramientas integradas.

## Casos de uso

- Asistente de calculo y conversion de unidades: el modelo emite `<CALC>` y el ejecutor devuelve el resultado exacto, lo que lo hace adecuado para calculadoras conversacionales en ruso o ingles donde la exactitud numerica es critica.
- Atencion al cliente en ruso para dominios acotados: respuestas estructuradas y fluidas en conversaciones de soporte simples, con calculo de descuentos o precios finales mediante circuitos exactos.
- Prototipado de agentes con herramientas en hardware de consumo: su bajo requisito de VRAM y su soporte de tool calling permiten desplegar un agente de investigacion en una sola GPU de 16 GB.
- Educacion y tutoria basica: explicaciones de conceptos en ruso e ingles, con la advertencia de que puede introducir detalles erroneos (el propio autor documenta el fallo tipico en la explicacion de la fotosintesis).
- Investigacion en arquitecturas hibridas: referencia abierta para estudiar Gated DeltaNet combinada con atencion con compuerta en un modelo pequeno y reproducible.
- Generacion de respuestas con fecha y calculo de plazos: diferencias entre fechas exactas mediante el ejecutor, util en flujos de gestion de tareas o vencimientos.
- Fine-tuning experimental: al ser Apache 2.0 y de 225M de parametros, sirve como base para ajuste en dominios verticales con recursos limitados.

## Benchmarks y rendimiento

| Checkpoint | Sonda de herramientas 16 tareas (8 RU + 8 EN, greedy) | GSM8K EN (500) | GSM8K-ru (500) |
|---|---|---|---|
| N-Q-26M-Chat (DPO) | 15/16 | 2,0% | 2,2% |
| 164M tras SFT de razonamiento | 16/16 | 5,0% | 3,4% |
| 164M tras DPO | 16/16 | 5,6% | 3,0% |
| 164M tras GRPO | 16/16 | 6,8% | 5,8% |
| N-Q-164M-Chat (tras RL agentico) | 16/16 | 7,2% | 6,2% |

GSM8K se puntua solo por el numero final, con thinking activado. El autor indica que mas o menos 1,1 pp es un error estandar a estas tasas, por lo que las diferencias paso a paso son en parte ruido. Los episodios multi-turno de RL agentico se mantuvieron cerca de recompensa cero; la mejora proviene sobre todo del mejor uso de herramientas en un solo turno.

## Requisitos de hardware

- VRAM estimada: el modelo base se entreno en una V100 de 16 GB; la inferencia en fp16 de 225,5M de parametros ocupa aproximadamente 0,45 GB de pesos, y en int8 alrededor de 0,23 GB, mas estado recurrente y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM es suficiente; el modelo fue entrenado en una V100 de 16 GB.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el formato `.qpack` es propio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Idiomas |
|---|---|---|---|---|---|
| N-Q-164M-Chat | 225,5M (166,8M + 58,7M n-gram) | no disponible | 7,2% EN / 6,2% RU | Apache 2.0 | ru, en |
| N-Q-26M-Chat | no disponible | no disponible | 2,0% EN / 2,2% RU | Apache 2.0 (segun familia) | ru, en |
| N-Q-164M (base) | no disponible | no disponible | no disponible | Apache 2.0 (segun familia) | ru, en |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor la define explicitamente como release de investigacion, no como producto.
- Alucinacion factual: afirma hechos erroneos con confianza; el propio autor documenta el fallo tipico en la explicacion de la fotosintesis.
- Razonamiento matematico muy limitado: GSM8K en torno al 7% en ingles y 6,2% en ruso.
- Sin `tokenizer=tok`, el ejecutor de circuitos exactos no se activa y los calculos suelen ser erroneos.
- Los episodios multi-turno de RL agentico apenas obtuvieron recompensa; el uso agentico complejo no esta validado.
- Idiomas limitados a ruso e ingles; no hay soporte documentado de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar cargas con entradas largas.
- Formato de pesos propietario `.qpack` y arquitectura custom con `trust_remote_code`, lo que limita la portabilidad a ecosistemas estandar como llama.cpp u Ollama.
- Licencia Apache 2.0: permite uso comercial, pero sin garantias del autor y con los riesgos de exactitud descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/N-Q-164M-Chat
- Modelo base: https://huggingface.co/q-project/N-Q-164M
- Modelo menor de la familia: https://huggingface.co/q-project/N-Q-26M-Chat
- Organizacion Q Project: https://huggingface.co/q-project
- Proyecto MiniMind: https://jingyaogong.github.io/minimind/
