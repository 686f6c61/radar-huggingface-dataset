# shivamgupta/personaplex-hinglish-v4-lora

## Resumen

PersonaPlex Hinglish LoRA (V4) es un adaptador LoRA de tipo audio-a-audio desarrollado por el usuario shivamgupta sobre el modelo base `nvidia/personaplex-7b-v1`, un sistema de voz a voz full-duplex de NVIDIA construido sobre la arquitectura Moshi. El adaptador no es un modelo autónomo: contiene únicamente pesos de adaptación (rank 64, escalado 2.0, 253 pesos adaptados, sin tablas de embedding) que se fusionan sobre los pesos base, los cuales estan sujetos a la NVIDIA Open Model License y requieren aceptar dicha licencia en el repositorio base antes de descargarlos.

El objetivo declarado es el de agentes de voz para atencion al cliente en registro hinglish, es decir, conversaciones con cambio de codigo continuo entre hindi (hi) e ingles (en). El entrenamiento se realizo sobre el dataset sintetico `shivamgupta/hinglish-s2s-synthetic-calls` y el repositorio incluye checkpoints intermedios de tres ejecuciones de entrenamiento (V3_A, V4_A y V4_A2), ademas de ejemplos de audio y de registro de conversacion. El checkpoint servido por defecto es V4_A2 en el paso 600, elegido como mejor checkpoint por `total_pooled` de validacion y confirmado por un re-ranking de naturalidad con Gemma.

Su relevancia actual es limitada pero especifica: cubre un nicho poco atendido como es el soporte de voz en tiempo real con cambio de codigo hindi-ingles, un escenario frecuente en centros de contacto de India y en la diaspora. Al tratarse de un adaptador, su utilidad practica depende por completo de la disponibilidad del modelo base gated y del monorepo de codigo que implementa la fusion, el formateo de prompts de rol y el bucle de inferencia en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre nvidia/personaplex-7b-v1 (arquitectura Moshi full-duplex, audio-a-audio) |
| Parametros totales | adaptador: 253 pesos adaptados en `lora.safetensors` (387.938.848 B); modelo base: 7B (no disponible el desglose exacto) |
| Longitud de contexto | no disponible (modelo de streaming en tiempo real, no orientado a ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), ingles (en), con cambio de codigo hinglish |
| Licencia | nvidia-open-model-license (etiquetada como `license: other`) |
| Formato de pesos | safetensors (adaptador), `format: personaplex_weight_lora_v1` en `config.json` |
| Rank LoRA | 64, escalado 2.0, `ft_embed: false` |
| Tamano del repositorio | 28,3 GB (incluye todos los checkpoints por ejecucion) |
| Pipeline | audio-to-audio |
| Libreria | moshi |

## Arquitectura y entrenamiento

El adaptador se aplica mediante la operacion `W += 2.0 * B @ A` en bf16, en sitio, sobre 253 pesos del modelo base, sin tocar las tablas de embedding (`ft_embed: false`). El `config.json` del adaptador declara el formato `personaplex_weight_lora_v1`, con `lora_rank` 64 y `lora_scaling` 2.0, e incluye un campo informativo `moshi_weight` que apunta a una ruta de la maquina de entrenamiento y que el codigo de fusion no lee. El modelo base es un sistema speech-to-speech full-duplex de NVIDIA basado en Moshi; el adaptador hereda por tanto el bucle de frames y la generacion de audio en streaming del base.

El entrenamiento se realizo sobre el dataset `shivamgupta/hinglish-s2s-synthetic-calls`, compuesto por llamadas sinteticas de soporte al cliente. Se documentan tres ejecuciones con guardado cada 50 pasos: V4_A2 (steps 50 a 1500, 30 checkpoints, mejor checkpoint 600), V4_A (steps 50 a 1200, 24 checkpoints, mejor checkpoint 400, checkpoint final 350) y V3_A (steps 50 a 950, 19 checkpoints, mejor checkpoint 200, detenida en 950 de un maximo de 1500, sin checkpoint final). El repositorio incluye por ejecucion los ficheros `eval_metrics.csv`, `metrics.csv`, `loss.png`, `args.yaml`, `config_input.yaml`, `BEST_CKPT` y `FINAL_CKPT`. El criterio `BEST_CKPT` es el menor valor de `total_pooled` en validacion; el criterio `FINAL_CKPT` es una re-seleccion por naturalidad con Gemma sobre los tres mejores checkpoints de validacion. No se especifica en la informacion disponible el numero de tokens de audio ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Conversion de voz a voz en tiempo real con el modelo base PersonaPlex-7B en modo full-duplex.
- Gestion del cambio de codigo hindi-ingles (hinglish) dentro de una misma intervencion, segun el dataset de entrenamiento sintetico.
- Soporte de prompts de rol: el adaptador se usa junto con `build_role_prompt`, que genera un prompt ASCII a partir de un registro de conversacion y un identificador de rol (por ejemplo `g1`).
- Asignacion de voz por rol mediante `voice_for`, que devuelve ficheros de voz como `NATF2.pt`.
- Inferencia offline documentada: un wav de entrada produce audio del agente y texto de salida.
- Casos de uso orientados a agente de voz de atencion al cliente, segun las etiquetas del repositorio (`customer-support`, `voice-agent`).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de razonamiento multi-paso o de agente: no disponible en la informacion proporcionada.
- Capacidades de vision o de audio mas alla del bucle de voz: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente telefonica en India: el adaptador permite mantener una conversacion de voz full-duplex con cambio de codigo hindi-ingles, que es el registro real de muchos clientes en centros de contacto de ese mercado.
- Agente de voz para comercio electronico: el ejemplo incluido (`examples/food_23.json`, con prompts de rol g1-g4) ilustra un flujo de pedidos o incidencias donde el agente alterna idiomas segun el cliente.
- Triaje de incidencias en soporte tecnico: el bucle de audio en streaming permite respuestas solapadas con la intervencion del usuario, util cuando el cliente describe un problema de forma interrumpida.
- Prototipado de locuciones multilingues: usando `run_offline.py` se puede generar audio sintetico del agente por rol y revisar la naturalidad antes de integrarlo en produccion.
- Investigacion sobre cambio de codigo en habla: el repositorio publica checkpoints, curvas de perdida y metricas de validacion, lo que permite estudiar la evolucion del adaptador paso a paso.
- Evaluacion comparativa de tecnicas LoRA en audio: al incluir tres ejecuciones con distinto numero de pasos y checkpoints intermedios, sirve como base para medir el efecto del rank y el escalado en tareas de voz.
- Integracion en un pipeline de voz propio: el paquete `personaplex_lora` expone `merge_adapter`, `build_role_prompt` y `voice_for`, lo que facilita insertar el adaptador en un servicio existente construido sobre Moshi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente incluye metricas de validacion propias del entrenamiento (`eval_metrics.csv`, `metrics.csv`, `loss.png`) y los criterios de seleccion de checkpoint (`total_pooled` y re-ranking de naturalidad con Gemma), sin valores numericos concretos en la informacion proporcionada.

## Requisitos de hardware

- El adaptador pesa 387.938.848 B (unos 388 MB) en safetensors, por lo que su huella adicional sobre el modelo base es reducida.
- La inferencia requiere cargar el modelo base `nvidia/personaplex-7b-v1` completo, cuyos pesos no estan incluidos en este repositorio y cuyo acceso esta restringido a cuentas que hayan aceptado la NVIDIA Open Model License.
- Estimacion orientativa de VRAM para el modelo base de 7B: en torno a 14-16 GB en bf16 para los pesos, mas el coste adicional del codec y del estado de streaming de Moshi. Esta cifra es una estimacion por tamano de parametros, no un dato publicado en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base, una GPU de 24 GB o superior es el escenario razonable, pero el autor no especifica modelos concretos.
- Despliegue en GPU de consumo: no confirmado; depende de que el modelo base quepa en la VRAM disponible tras aplicar el adaptador.
- Opciones de despliegue documentadas: carga mediante `moshi.models.loaders.get_moshi_lm` y fusion con el paquete `personaplex_lora`; inferencia offline con `research/inference/personaplex_lora/run_offline.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a un modelo de audio en streaming de este tipo.
- Requisitos de software indicados: torch 2.11.0+cu128 (verificado), torchaudio 2.11.0, la build de Moshi de NVIDIA instalada con `pip install --no-deps personaplex/moshi/.` (la version de PyPI fija torch<2.5 y no soporta RTX 50xx), numpy, safetensors, sentencepiece, sphn 0.1.12, einops y huggingface_hub.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shivamgupta/personaplex-hinglish-v4-lora | adaptador LoRA audio-a-audio | 253 pesos adaptados sobre base 7B | no disponible | hi, en (hinglish) | nvidia-open-model-license | publico en HuggingFace, requiere base gated |
| nvidia/personaplex-7b-v1 | modelo base speech-to-speech full-duplex | 7B | no disponible | no disponible | nvidia-open-model-license | gated en HuggingFace |
| Otros modelos speech-to-speech comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del adaptador ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin los pesos base `nvidia/personaplex-7b-v1` y sin el codigo del monorepo no es ejecutable.
- El modelo base esta gated: es necesario iniciar sesion con una cuenta que haya aceptado previamente la NVIDIA Open Model License.
- El `config.json` incluye un campo `moshi_weight` que apunta a una ruta local de la maquina de entrenamiento; es informativo y no se lee en la fusion, pero conviene no interpretarlo como una dependencia real.
- El entrenamiento se ha realizado con llamadas sinteticas generadas por TTS, segun indica la descripcion del ejemplo incluido. Esto implica un riesgo de dominio limitado: el comportamiento con habla real, acentos diversos, ruido de canal telefonico o solapamientos de habla puede degradarse respecto a los datos de entrenamiento.
- Riesgo de alucinacion y de respuestas incoherentes en audio: no cuantificado en la informacion disponible.
- Idiomas limitados a hindi e ingles; no se documenta soporte de otros idiomas ni de variedades regionales mas alla del hinglish.
- El repositorio ocupa 28,3 GB debido a los checkpoints de las tres ejecuciones, lo que complica su descarga y almacenamiento.
- El repositorio no incluye codigo, solo pesos, configuraciones, ejemplos y la model card; el codigo vive en el monorepo de GitHub.
- La model card presenta varias secciones sin completar (marcadas con `TODO(user)` en descripcion, uso previsto y resumen), por lo que no hay una declaracion formal de uso fuera de alcance.
- El propio autor advierte de que el entrenamiento de V3_A se detuvo en el paso 950 de 1500 y no tiene checkpoint final, por lo que esa ejecucion es incompleta.
- Uso comercial: sujeto a los terminos de la NVIDIA Open Model License, que deben revisarse en el enlace oficial antes de cualquier despliegue en produccion.
- No se han publicado resultados de benchmarks, evaluaciones de seguridad ni analisis de sesgos.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/shivamgupta/personaplex-hinglish-v4-lora
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/shivamgupta/hinglish-s2s-synthetic-calls
- Monorepo de codigo: https://github.com/shivamgcodes/s2s-hinglish-agent
- Paquete de fusion y prompts de rol: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/packages/personaplex_lora
- Ejemplo de inferencia offline: https://github.com/shivamgcodes/s2s-hinglish-agent/tree/main/research/inference/personaplex_lora
- Repositorio de PersonaPlex de NVIDIA: https://github.com/NVIDIA/personaplex
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
