# balllvin/LFM3-1.7B-Agent-v0.01.000

## Resumen

LFM3-1.7B-Agent-v0.01.000 es un ajuste fino del modelo LFM3-1.7B de Liquid AI, en su variante abliterated publicada por el usuario orcarouter, entrenado por el usuario balllvin sobre conversaciones de tool calling del dataset Nemotron-SFT-Agentic-v4 de NVIDIA. El modelo tiene 1.728.801.536 parametros y hereda la arquitectura LFM3 tri-hybrid de Liquid AI, pensada para agentes locales con ventana de contexto de 256K y tool calling nativo. Se trata de un experimento personal de un solo stage de entrenamiento, orientado a construir un agente pequeno para tareas de finanzas.

El ajuste busca mejorar la finalizacion de tareas agénticas y reducir el tiempo por tarea, a costa de un aumento en la tasa de errores en las llamadas a herramientas. Segun la model card, responde mas tareas (13 de 20 frente a 7 de 20 del base) y las resuelve en aproximadamente la mitad de tiempo (213 s frente a 417 s de mediana), pero la precision de las respuestas no mejora (1 de 20 correctas en ambos) y las llamadas fallidas suben del 9% al 16%.

Es relevante como ejemplo de fine-tuning ligero (LoRA rank 32 sobre 3.127 conversaciones, 13,3M tokens) realizado en hardware de consumo, y por documentar con intervalos de confianza y muestras pequenas sus resultados. No obstante, su uso previsto es investigacion y uso personal, no produccion, y su licencia limita el uso comercial a organizaciones con menos de 10 millones de dolares de ingresos anuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (hereda de LiquidAI/LFM3-1.7B); codigo de modelado propio incluido en el repo |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K (heredada de LFM3-1.7B; no medida en este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (la model card solo evalua en ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para organizaciones con menos de 10 M USD de ingresos anuales |
| Formato de pesos | safetensors (bf16, con LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de orcarouter/LFM3-1.7B-abliterated (revision c1ca5b62), a su vez derivado de LiquidAI/LFM3-1.7B, que emplea la arquitectura LFM3 tri-hybrid de Liquid AI. El repo incluye el codigo de modelado original del base, por lo que requiere `trust_remote_code=True` en transformers. El ajuste se aplico como LoRA de rank 32 y alpha 64 sobre todas las capas lineales, con learning rate 1e-4, warmup del 4% y decaimiento coseno hasta cero; 32 secuencias por paso, una sola pasada y 97 pasos. El LoRA esta fusionado en los pesos bf16 publicados.

Los datos de entrenamiento son 3.127 conversaciones de la parte `tool_calling` de nvidia/Nemotron-SFT-Agentic-v4 (OpenMDW 1.1), tomadas como muestra con semilla; 3.079 se usaron para entrenar y 48 se reservaron para validar la loss. En total, 13,3M tokens; 54 filas de mas de 32.768 tokens se excluyeron sin truncar. La loss se calculo solo sobre los turnos del asistente (respuestas y llamadas a herramientas), no sobre texto de usuario o de herramienta. La loss de validacion paso de 0,624 en el paso 20 a 0,607 en el paso 97. El entrenamiento se realizo con MLX en un Apple M5 Pro en 4,0 horas. No se menciona RLHF ni DPO. La model card anuncia un futuro modelo drafter para decodificacion especulativa, aun no publicado.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat propia del tokenizer.
- Tool calling / function calling nativo, heredado de LFM3 y reforzado con el ajuste sobre Nemotron-SFT-Agentic-v4.
- Ejecucion de tareas agénticas multi-turno (hasta 16 turnos en el test de finanzas descrito).
- Razonamiento matematico basico a nivel de escuela primaria (GSM8K evaluado).
- Capacidad de respuesta sin rechazos: al estar basado en una version abliterated, responde solicitudes que el modelo original rechazaria.
- No se documentan capacidades de vision, audio, thinking mode explicito ni multilingues; la model card indica que no se midieron idiomas distintos del ingles.

## Casos de uso

- Agente local de investigacion financiera: el modelo puede operar con herramientas de busqueda sobre presentaciones SEC durante hasta 16 turnos, como en el test descrito, aunque la precision de sus respuestas es baja (1 de 20 correctas) y requiere verificacion humana.
- Prototipado de agentes con tool calling en local: sirve para iterar sobre prompts y esquemas de herramientas en un portatil Apple con MLX o en CPU/MPS con transformers, gracias a su tamano de 1,7B parametros.
- Evaluacion de pipelines agénticos: util para medir tasas de finalizacion, tiempo por tarea y errores de llamada a herramientas en un modelo pequeno antes de escalar a modelos mayores.
- Fine-tuning de referencia: el repositorio documenta de forma reproducible el proceso LoRA (datos, hiperparametros, loss), por lo que sirve como plantilla para ajustes agénticos de bajo coste.
- Asistente conversacional sin filtros para investigacion: al ser abliterated, permite estudiar el comportamiento de modelos sin capas de rechazo, siempre con una capa de seguridad propia por delante.
- Integracion en demos de function calling: con BFCL simple alcanza 36 de 40 (90%), suficiente para demostraciones de llamada a funciones con esquemas sencillos, no para produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos el 2026-11-06 sobre tareas no vistas en entrenamiento, con intervalos de confianza del 95% (Wilson):

| Test | Este modelo | Base | Nota |
|---|---|---|---|
| Tareas agénticas de finanzas respondidas | 13 de 20 (65%, IC 43-82%) | 7 de 20 (35%, IC 18-57%) | Entrega respuesta en mas ocasiones |
| Respuestas de finanzas totalmente correctas | 1 de 20 | 1 de 20 | Sin cambio en precision |
| Tiempo mediano por tarea de finanzas | 213 s | 417 s | Aproximadamente el doble de rapido |
| Llamadas a herramientas fallidas | 44 de 267 (16%, IC 13-21%) | 23 de 262 (9%, IC 6-13%) | Empeora |
| GSM8K (50 problemas) | 41 de 50 (82%) | 38 de 50 (76%) | Dentro del ruido |
| BFCL function calling simple (40 llamadas) | 36 de 40 (90%) | 32 de 40 (80%) | Dentro del ruido |
| BFCL function calling live (40 llamadas) | 27 de 40 (68%) | 28 de 40 (70%) | Sin cambio |

No se midieron contexto largo, seguridad, idiomas distintos del ingles ni otras capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1,73B parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto.
- El autor ejecuto la inferencia en Apple MPS (transformers 5.19, torch 2.14) y en MLX sobre un Apple M5 Pro con mlx-vlm 0.7.12, a precision bf16 completa.
- El script `run_transformers.py` selecciona CUDA si esta disponible, pero el autor indica que no lo ha probado en CUDA.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090) en bf16; no se publican cuantizaciones GGUF para reducir aun mas el requisito.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado en MPS y CPU) y MLX en Mac. La model card del base LFM3-1.7B menciona compatibilidad con vLLM, SGLang y builds de llama.cpp compatibles con LFM3, pero no se confirma para este ajuste concreto.
- Latencia y throughput: no se publican cifras de tokens por segundo; solo el tiempo mediano por tarea agéntica (213 s frente a 417 s del base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Agent-v0.01.000 | 1,73B | 256K (heredado) | Si, ajustado sobre Nemotron-SFT-Agentic-v4 | LFM Open License v1.0 (comercial solo < 10 M USD de ingresos) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7B | 256K | Si, nativo | LFM Open License v1.0 | Hugging Face, modelo oficial |
| orcarouter/LFM3-1.7B-abliterated | 1,7B | 256K | Si, heredado | LFM Open License v1.0 | Hugging Face, modelo base del ajuste |

No se dispone de datos de benchmarks de terceros para comparar con modelos de otros fabricantes de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Precision baja en tareas de finanzas: solo 1 de 20 respuestas totalmente correctas; no debe usarse como asesoramiento financiero.
- Aumento de errores en llamadas a herramientas: 16% de llamadas fallidas frente al 9% del base, con nombres o argumentos incorrectos.
- Muestras de evaluacion pequenas (20 tareas, 40-50 problemas), con intervalos de confianza amplios; la mayoria de diferencias caen dentro del ruido.
- No se midieron contexto largo, seguridad ni idiomas distintos del ingles; el soporte multilingue no esta confirmado.
- Al estar basado en una version abliterated, responde solicitudes que el modelo original rechazaria; requiere una capa de seguridad propia antes de exponerlo a usuarios.
- Licencia LFM Open License v1.0: uso comercial permitido solo a organizaciones con menos de 10 millones de dolares de ingresos anuales.
- Version v0.01.000 con 0 descargas y 0 likes; sin validacion externa por parte de la comunidad.
- Requiere `trust_remote_code=True` por el codigo de modelado propio, lo que implica ejecutar codigo del repositorio.
- El drafter para decodificacion especulativa esta anunciado pero no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Agent-v0.01.000
- Modelo base abliterated: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Documentacion de LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Dataset de evaluacion: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Finance-v1
- Scripts de inferencia: https://huggingface.co/balllvin/LFM3-1.7B-Agent-v0.01.000/tree/main/inference
- Licencia: https://huggingface.co/balllvin/LFM3-1.7B-Agent-v0.01.000/blob/main/LICENSE
