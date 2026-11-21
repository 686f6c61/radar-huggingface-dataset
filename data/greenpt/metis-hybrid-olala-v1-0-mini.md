# GreenPT/metis-hybrid-olala-v1.0-mini

## Resumen

Metis Hybrid Olala mini es un adaptador LoRA de rango 16 desarrollado por GreenPT sobre el modelo base OVHaiLLM/Olala-v1.0-mini-7A1B, un modelo con arquitectura MoE de 6,8 mil millones de parametros totales y aproximadamente 1.000 millones activos por token. El adaptador convierte el backbone en un modelo de decision hibrido capaz de responder peticiones TypeSafe Jev `/v1/systemone` con probabilidades calibradas, manteniendo al mismo tiempo su funcionamiento como modelo conversacional. Es la segunda ronda de la receta Metis Hybrid aplicada a Olala mini, tras la variante sobre un modelo de 4B.

El modelo resuelve un problema concreto: producir decisiones binarias o de opcion multiple con confianza calibrada (es decir, que la probabilidad declarada se corresponda con la precision real) en tareas de razonamiento tipo JevBench, sin sacrificar la capacidad de chat. Para ello combina el adaptador LoRA, tres filas de tokens especiales entrenados, una cabeza de decision tipo pointer y un calibrador por entrada (`calibrator.pt`) que ajusta la temperatura de forma individualizada.

Su relevancia actual es metodologica: demuestra una receta de calibracion y decision sobre un backbone MoE pequeño, con resultados publicos en JevBench y un analisis honesto de sus propios fallos (no alcanza la puerta de calibracion de 0,10 ECE fijada por el proyecto). El repositorio ocupa solo 0,1 GB porque contiene unicamente el adaptador, la cabeza y el calibrador, no los pesos completos del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Olala v1.0 mini) + adaptador LoRA rango 16 + cabeza de decision pointer + calibrador por entrada |
| Parametros totales | 6,8 mil millones (backbone); el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | aproximadamente 1.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixed-see-card (adaptador sobre backbone Apache-2.0; ver model card) |
| Formato de pesos | safetensors (PEFT/LoRA), mas `calibrator.pt` y `decision_config.json` |
| Libreria | peft |
| Modelo base | OVHaiLLM/Olala-v1.0-mini-7A1B (commit fijado `0fde460f37d0fe2c390619bb5729c9d81dc89091`) |
| Modo de inferencia | servidor `/v1/systemone` o API Python `DecisionLM` |

## Arquitectura y entrenamiento

El backbone es un transformer con mezcla de expertos (MoE) de 6,8B parametros totales y unos 1B activos por token. Sobre el backbone congelado se anaden tres componentes entrenados: un adaptador LoRA de rango 16, tres filas de tokens especiales y una cabeza de decision pointer que emite probabilidades sobre las opciones de la peticion Jev. Encima se aplica un calibrador por entrada (`calibrator.pt`) basado en temperatura individualizada con reduccion PCA a 32 dimensiones y regularizacion L2 de 0,001, ajustado sobre los conjuntos de evaluacion propios de Metis (in-domain y held-out) y nunca sobre JevBench.

El entrenamiento se realizo en dos etapas sobre una sola H200. La etapa 1 uso la mezcla completa de Metis Hybrid ronda 2 para Olala mini: 136.269 filas (13 tareas publicas reescritas como preguntas Jev, tareas sinteticas estilo Jev, filas de explicacion y respuestas de chat-replay generadas por el propio Olala mini), 2 epocas, 4.938 pasos, 224 minutos. La etapa 2 partio de la etapa 1 con 42.391 filas (14,7M tokens), 920 pasos, 1 epoca, LR 5e-5 (cabeza 2,5e-4), 45 minutos, combinando tareas duras construidas por codigo y una repeticion de la mezcla de la etapa 1. PIQA, ANLI, WinoGrande y JevBench se reservaron exclusivamente para evaluacion. No se midio la varianza entre ejecuciones (una sola ejecucion por etapa).

## Capacidades

- Respuesta a peticiones TypeSafe Jev `/v1/systemone` con probabilidades calibradas por entrada.
- Modo `systemone` puro (solo respuestas Jev), modo `both` (respuesta mas explicacion por respuesta) y modo `text` (modelo de lenguaje puro).
- Funcionamiento como modelo de chat convencional, conservando el system prompt propio de Olala en conversacion normal.
- Cabeza de decision pointer que selecciona entre opciones de la peticion con estimacion de confianza.
- Calibracion de temperatura ajustable: se puede pasar una `temperature` explicita para omitir el calibrador y el suelo true/false.
- Generacion de explicaciones asociadas a cada decision.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion binaria con confianza calibrada: el modelo responde preguntas de si/no emitiendo una probabilidad que puede umbralizarse en un pipeline de moderacion o filtrado, usando `systemone` en modo Jev.
- Enrutamiento de decisiones en produccion: integrado como servicio FastAPI (`scripts/serve.py`) en el puerto 8000, permite enviar peticiones con estado y preguntas y recibir decisiones calibradas con latencia de unos 0,18 s por item en una H200.
- Evaluacion de la fiabilidad de un modelo: util para experimentar con tecnicas de calibracion (temperatura global frente a calibrador por entrada) y medir ECE sobre tareas de razonamiento.
- Asistente conversacional con capacidad de decision: en modo `both` devuelve la decision y una explicacion, adecuado para interfaces donde el usuario necesita entender el porque de una clasificacion.
- Investigacion en modelos de decision hibridos: sirve como referencia reproducible de la receta Metis Hybrid (LoRA + cabeza pointer + calibrador) aplicada a un backbone MoE pequeño.
- Generacion de texto en modo `text`: aunque lenta en transformers (unos 12 tokens/s en una H200, una peticion a la vez), permite usar el modelo como chat cuando no se necesita la cabeza de decision.
- Prototipado de tareas Jev personalizadas: la API `DecisionLM` acepta peticiones con `state` y `questions`, lo que facilita construir bancos de pruebas propios con formato Jev.

## Benchmarks y rendimiento

JevBench publico, items acertados sobre 231 (los items publicos nunca se usaron en entrenamiento):

| Metrica | Qwen 4B | Apertus 1.5 8B | Apertus 1.5B | Apertus 0.5B | Metis Hybrid Olala mini |
|---|---|---|---|---|---|
| JevBench publico (total) | 195 | 183 | 141 | 129 | 169 |
| · original 72 | 69 | 67 | 46 | 39 | 59 |
| · easy 48 | 48 | 48 | 48 | 47 | 48 |
| · hard 111 | 78 | 68 | 47 | 43 | 62 |
| ECE hard tal como se sirve | 0,099 | 0,113 | 0,199 | 0,187 | 0,142 |
| ECE hard sin suelo true/false | no disponible | 0,081 | 0,145 | 0,148 | 0,112 |
| Dev generado (construido por codigo) | 81,6% | 76,9% | 54,4% | 51,4% | 72,1% |

ECE por configuracion de calibracion en el nivel hard de JevBench:

| Calibracion | ECE hard |
|---|---|
| ninguna | 0,244 |
| solo temperatura ajustada (T = 1,4, `decision_config.json`) | 0,195 |
| `calibrator.pt` sin suelo true/false | 0,112 |
| `calibrator.pt` con suelo (por defecto al cargar) | 0,142 |

En las muestras de evaluacion propias del calibrador, el modelo obtiene 85,2% in-domain (13 tareas publicas) y 61,2% held-out (PIQA, ANLI, WinoGrande). La puerta de calibracion del proyecto es 0,10 ECE y el modelo no la alcanza en ninguna configuracion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al cargar el backbone completo de 6,8B parametros se necesita memoria para todos ellos aunque solo unos 1B esten activos por token.
- GPU recomendadas: el entrenamiento y la evaluacion se hicieron en una NVIDIA H200; no se documentan otras GPU.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Despliegue: la via soportada es la imagen `ovhaillm/olala-ai-training:20261117` (Python en `/opt/venv`, con peft y transformers) mas `pip install fastapi uvicorn` para el servidor `scripts/serve.py`. Requiere los kernels compilados de OVHai LLM y cargar el backbone con `trust_remote_code`. La build de vLLM de Olala es mucho mas rapida para chat puro pero no sirve la cabeza de decision.
- Latencia y throughput: aproximadamente 0,18 s por item de decision en una H200 con transformers; generacion de texto a unos 12 tokens/s con una sola peticion simultanea, por lo que los modos `both` y `text` son lentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench publico (231) | ECE hard (servido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Metis Hybrid Olala mini | 6,8B totales, ~1B activos | no disponible | 169 | 0,142 | mixed-see-card | Hugging Face (adaptador) |
| Metis Hybrid Qwen 4B | 4B | no disponible | 195 | 0,099 | no disponible | Hugging Face |
| Metis Hybrid Apertus 1.5 8B | 8B | no disponible | 183 | 0,113 | no disponible | Hugging Face |
| Metis Hybrid Apertus 1.5B | 1,5B | no disponible | 141 | 0,199 | no disponible | Hugging Face |
| Metis Hybrid Apertus 0.5B | 0,5B | no disponible | 129 | 0,187 | no disponible | Hugging Face |

El modelo se situa por debajo de las variantes Metis Hybrid sobre Qwen 4B y Apertus 1.5 8B, y por encima de las variantes Apertus de menos de 2B. La diferencia se concentra en el nivel hard de JevBench (62 aciertos frente a 78 del Qwen 4B).

## Limitaciones y advertencias

- Queda por debajo de los modelos Metis Hybrid Qwen y Apertus 8B en JevBench (169 de 231 frente a 195 del Qwen 4B), sobre todo en el nivel hard.
- No alcanza la puerta de calibracion de 0,10 ECE del proyecto: 0,142 tal como se sirve y 0,112 sin el suelo true/false.
- El calibrador por entrada empeora la calibracion en el conjunto dev generado (ECE 0,173 frente a 0,077 sin calibracion).
- Aunque solo unos 1B parametros esten activos por token, hay que cargar los 6,8B completos en memoria.
- Se realizo una sola ejecucion de entrenamiento por etapa y no se midio la varianza entre ejecuciones.
- El texto dentro de `state` debe tratarse como no fiable: instrucciones plantadas pueden influir en las decisiones del modelo.
- La licencia es mixta (`mixed-see-card`): el adaptador se apoya en un backbone Apache-2.0, pero las condiciones exactas de uso comercial deben consultarse en la model card.
- El uso requiere los kernels compilados de OVHai LLM y una revision concreta del backbone, lo que complica el despliegue fuera de su imagen oficial.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion mas alla de las advertencias de la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/GreenPT/metis-hybrid-olala-v1.0-mini
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Variante previa de la receta: https://huggingface.co/GreenPT/metis-hybrid-4b
