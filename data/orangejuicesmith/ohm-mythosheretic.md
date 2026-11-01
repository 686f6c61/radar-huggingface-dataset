# orangejuicesmith/Ohm-MythosHeretic

## Resumen

Ohm-MythosHeretic es una versión "decensurada" (abliterada) de Mythos-nano, un modelo de lenguaje de 3 mil millones de parámetros centrado en razonamiento, matemáticas y código. El autor, orangejuicesmith, ha aplicado la herramienta Heretic v1.4.0 sobre el modelo original de squ11z1/Mythos-nano (a su vez un fine-tuning de WeiboAI/VibeThinker-3B, arquitectura Qwen2) para eliminar la dirección de rechazo del modelo, reduciendo los rechazos de 79/100 a 13/100 con una divergencia KL de solo 0.0610 respecto al original.

El interés principal del modelo subyacente es su tesis de que los modelos pequeños pueden alcanzar razonamiento de frontera mediante entrenamiento con feedback verificable: Mythos-nano compite con sistemas de billones de parámetros en benchmarks de matemáticas de competición (AIME25: 91.4, HMMT25: 89.3) y en contests de LeetCode (96.1% de tasa de aprobación en Python). La variante abliterada conserva estas capacidades pero responde sin las restricciones de seguridad del modelo original.

Es relevante para desarrolladores que necesiten un modelo de razonamiento compacto, ejecutable en hardware de consumo, con licencia MIT y sin filtros de rechazo, aunque conviene tener claras sus limitaciones: no fue entrenado para tool calling ni agentes, y la abliteración reduce las barreras de seguridad, trasladando toda la responsabilidad legal y ética al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder, base VibeThinker-3B) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y Q4_K_M (GGUF, del modelo base); pesos originales en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (6,2 GB en el repo); GGUF f16 y Q4_K_M disponibles para el modelo base |

## Arquitectura y entrenamiento

El modelo parte de WeiboAI/VibeThinker-3B, un modelo con arquitectura Qwen2 (transformer decoder denso, no MoE), que a su vez fue afinado por squ11z1 como Mythos-nano. Según Weibo Lab, el modelo no fue entrenado con datos de tool calling ni de programación agentica, sino que su fortaleza proviene del entrenamiento con feedback verificable en problemas de matemáticas de competición y programación tipo LeetCode.

La contribución de Ohm-MythosHeretic no es un reentrenamiento, sino una abliteración realizada con Heretic v1.4.0. Esta técnica identifica la "dirección de rechazo" en el espacio de activaciones del modelo y la neutraliza mediante ajustes ponderados en las capas de atención (o_proj) y del MLP (down_proj), con parámetros documentados y reproducibles (direction_index 24.27, pesos maximos de 1.48 en atención y 1.18 en el MLP). El resultado reduce los rechazos de 79/100 a 13/100 con una divergencia KL de 0.0610 respecto al modelo original, lo que indica una degradación mínima de las capacidades base.

## Capacidades

- Razonamiento y matematicas de competicion: resultados destacables en AIME25 (91.4), AIME26 (94.3), HMMT25 (89.3), BruMO25 (93.8) e IMO-Ans (76.4); con la variante CLR, hasta 96.7 en AIME25.
- Generacion de codigo: 96.1% de tasa de aprobacion agregada en contests de LeetCode (Python, 123/128 problemas), por delante de GPT-5.2 y Qwen3-Max en esa prueba.
- Conocimiento cientifico: 70.2 en GPQA-Diamond (72.9 con CLR).
- Seguimiento de instrucciones: 93.4 en IFEval y 74.5 en IFBench.
- Generacion de texto largo: hasta 40.960 tokens de salida recomendados para problemas dificiles.
- Sin filtros de rechazo: la abliteracion elimina la mayoria de las negativas de seguridad del modelo original.
- No soporta tool calling ni function calling: el autor del modelo base lo desaconseja expresamente para orquestacion de APIs y agentes autonomos.

## Casos de uso

- Resolucion de problemas de matematicas de competicion: el modelo puede abordar ejercicios estilo AIME o IMO generando cadenas de razonamiento largas (hasta 40.960 tokens de salida), su caso de uso principal segun los benchmarks.
- Practica de programacion competitiva: adecuado para problemas tipo LeetCode, donde demuestra un 96,1% de tasa de aprobacion en Python; util como tutor o verificador de soluciones algoritmicas.
- Experimentacion con abliteracion reproducible: al incluir los parametros exactos de Heretic y un directorio `reproduce`, sirve como referencia para investigadores que estudian tecnicas de decensurado y su impacto en la divergencia KL.
- Ejecucion local en hardware modesto: con ~3B de parametros y cuantizacion Q4_K_M en GGUF, funciona en GPUs de consumo o incluso en equipos sin GPU dedicada, util para prototipado offline.
- Investigacion sobre razonamiento en modelos pequenos: su rendimiento en benchmarks de frontera con solo 3B lo hace util como sujeto de estudio para destilacion y entrenamiento con feedback verificable.
- Generacion de contenido sin restricciones para investigacion controlada: al carecer de filtros de rechazo, puede usarse en entornos de investigacion donde los rechazos del modelo interfieran con el experimento (por ejemplo, estudios de red-teaming), siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

Datos publicados en la model card (Mythos-nano es el modelo base; esta variante abliterada no tiene benchmarks propios publicados):

| Modelo | Params | AIME25 | AIME26 | HMMT25 | BruMO25 | IMO-Ans | LCBv6 | OJBench | GPQA-D | IFEval | IFBench |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 96.1 | 93.3 | 95.4 | 98.3 | 81.8 | 85.0 | 54.7 | 87.6 | 93.9 | 70.0 |
| GLM-5 | 744B | 96.7 | 95.8 | 97.9 | – | 82.5 | 85.5 | 55.0 | 86.0 | 92.6 | 76.5 |
| DeepSeek V3.2 | 671B | 93.1 | 94.2 | 90.2 | 96.7 | 78.3 | 80.8 | 48.4 | 82.4 | 92.6 | 60.7 |
| Gemini 3 Pro | N/A | 96.0 | 91.7 | 97.5 | 98.3 | 83.1 | 87.4 | 58.8 | 91.9 | – | 70.4 |
| Claude Opus 4.5 | N/A | 92.8 | 95.1 | 92.9 | – | 78.5 | 84.8 | – | 87.0 | – | 58.0 |
| GPT-5 (high) | N/A | 94.6 | – | 88.3 | 91.7 | 76.0 | 84.5 | – | 85.7 | – | 73.1 |
| Mythos-nano | 3B | 91.4 | 94.3 | 89.3 | 93.8 | 76.4 | 80.2 | 38.6 | 70.2 | 93.4 | 74.5 |
| Mythos-nano + CLR | 3B | 96.7 | 97.1 | 95.4 | 99.2 | 80.6 | – | – | 72.9 | – | – |

LeetCode contests (Python, tasa de aprobacion agregada):

| Modelo | Resultado |
|---|---|
| GPT-5.3-Codex | 100.0% (128/128) |
| Gemini 3.1 Pro | 99.2% (127/128) |
| Gemini 3 Flash | 96.9% (124/128) |
| Mythos-nano | 96.1% (123/128) |
| GPT-5.2 | 95.3% (122/128) |
| Qwen3-Max | 91.4% (117/128) |
| Kimi K2.5 | 90.6% (116/128) |
| Claude Opus 4.6 | 86.7% (111/128) |

Metricas de la abliteracion:

| Metrica | Ohm-MythosHeretic | Mythos-nano original |
|---|---|---|
| Divergencia KL | 0.0610 | 0 (por definicion) |
| Rechazos | 13/100 | 79/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en bf16/f16 (el repo pesa 6,2 GB en safetensors) y unos 2-2,5 GB con cuantizacion Q4_K_M en GGUF, mas overhead de contexto para las salidas largas recomendadas.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB de VRAM o mas (RTX 3060, RTX 4060 Ti, RTX 4090) ejecuta el modelo sin problemas en precision completa; no se necesitan A100 ni H100.
- Cabe en GPUs de consumo: si, incluso en portatiles con GPU de 6-8 GB usando la version Q4_K_M.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card con bfloat16 y device_map="cuda"), llama.cpp y Ollama mediante los GGUF f16 y Q4_K_M del modelo base. No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponible.
- Parametros de muestreo recomendados: temperature 0.6-1.0 y hasta 40.960 tokens de salida para problemas dificiles, lo que puede alargar significativamente el tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ohm-MythosHeretic | 3,09 B | Razonamiento matematico/codigo, abliterado | MIT | Pesos abiertos en HuggingFace, con GGUF |
| WeiboAI/VibeThinker-3B | ~3 B | Razonamiento matematico/codigo (base) | no disponible | Pesos abiertos en HuggingFace |
| Qwen3-4B (familia Qwen) | 4 B | Uso general, razonamiento hibrido, tool calling | Apache 2.0 | Pesos abiertos, amplio ecosistema |
| Phi-4-mini (Microsoft) | ~3,8 B | Razonamiento y codigo, uso general | MIT | Pesos abiertos |

Frente a alternativas de tamano similar, la ventaja de este modelo esta en los benchmarks de matematicas de competicion y LeetCode, donde supera con claridad a otros modelos pequenos; su desventaja es la ausencia de soporte para tool calling y agentes, y la falta de datos publicados sobre longitud de contexto y rendimiento en tareas generales.

## Limitaciones y advertencias

- Abliteracion: la direccion de rechazo ha sido eliminada; el modelo no declinara peticiones que un modelo con alineamiento estandar si rechazaria. El usuario asume toda la responsabilidad sobre las salidas y su cumplimiento legal.
- Riesgo de alucinacion: no disponible de forma cuantificada; como cualquier modelo de lenguaje, puede generar contenido incorrecto, y la abliteracion elimina una capa de comportamiento prudente.
- Sin soporte de tool calling ni agentes: el propio Weibo Lab desaconseja su uso para function calling, orquestacion de APIs o agentes de codigo autonomos.
- Idioma: entrenado para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no publicada: la model card no especifica la ventana de contexto maxima, solo que se recomiendan hasta 40.960 tokens de salida.
- Degradacion por abliteracion: aunque la divergencia KL es baja (0.0610), existe un cambio medible en la distribucion de salida respecto al modelo original; conviene revalidar los casos de uso criticos.
- Procedencia: se trata de un finetune comunitario de un finetune (VibeThinker-3B → Mythos-nano → Ohm-MythosHeretic), con descargas muy bajas (229) y sin comunidad de soporte; los benchmarks corresponden al modelo base, no a esta variante.
- Uso comercial: la licencia MIT lo permite, pero el contenido generado sin filtros de seguridad puede plantear riesgos legales y de reputacion en produccion.

## Enlaces

- Modelo: https://huggingface.co/orangejuicesmith/Ohm-MythosHeretic
- Modelo base (Mythos-nano): https://huggingface.co/squ11z1/Mythos-nano
- Modelo base original (VibeThinker-3B): https://huggingface.co/WeiboAI/VibeThinker-3B
- Proyecto Heretic (herramienta de abliteracion): https://heretic-project.org
