# Quazim0t0/On-Fly-Jev

## Resumen

On-Fly-Jev es un modelo de decisiones tipadas construido sobre un tronco de red neuronal de picos (SNN) de 96M de parametros denominado FlyNeuron-SNN-96M. A diferencia de un modelo generativo, no produce texto: recibe un estado (texto o JSON) y una pregunta tipada de entre tres clases (`choice`, `score`, `noul`) y devuelve probabilidades calibradas en un unico forward pass. Lo desarrolla el autor Quazim0t0 y se publica bajo licencia Apache 2.0.

La particularidad arquitectonica es que cada unidad del tronco es una copia de una de las 100 neuronas reales de la mosca de la fruta (Drosophila melanogaster) procedentes del conectoma MaleCNS v1.0 de Janelia / Google. Es el segundo modelo de la familia Jev del autor, tras Byrne-Jev-79M, y esta optimizado para velocidad: ronda las 137 decisiones por segundo con una latencia p50 de 7,3 ms por decision.

Su relevancia actual es doble. Por un lado, explora el uso de conectomas biologicos reales como sustrato de modelos de decision, una linea de investigacion poco frecuente. Por otro, ofrece calibracion competitiva (ECE de 0,045, el mejor del grupo de comparacion) a una fraccion del coste computacional de alternativas como TypeSafe Jev o ModernBERT-base, lo que lo hace atractivo para bucles de decision cerrados donde la latencia es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de picos (SNN) con unidades basadas en 100 neuronas reales del conectoma MaleCNS v1.0 de Drosophila |
| Parametros totales | 96M (tronco FlyNeuron-SNN-96M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo de 1,0 GB); no se detalla si hay safetensors o GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre un tronco SNN de 96M de parametros en el que cada unidad replica una neurona biologica concreta de las 100 seleccionadas del conectoma MaleCNS v1.0. La tarea es de clasificacion de decisiones tipadas: el modelo recibe un estado y una pregunta con un tipo definido (`choice`, `score`, `noul`) y emite probabilidades, sin generar secuencias de tokens. El pipeline declarado en HuggingFace es `text-classification`.

El checkpoint publicado es el resultado de un model merging: una media ponderada 50/50 de dos checkpoints de la misma linea, el mejor FlyNeuron-Jev previo y ese mismo modelo tras dos epocas adicionales sobre la nueva mezcla de datos. Los datasets citados son LocalLLaMA/typed-decisions, ZefanCai/Open-Jev y openai/gsm8k. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Decision tipada en un unico forward pass: devuelve probabilidades calibradas para preguntas de tipo `choice`, `score` y `noul`.
- Procesamiento de estado en texto plano o JSON como entrada.
- Clasificacion de texto en dominios concretos: AG News (categorias de noticias), Banking77 (77 intenciones bancarias) y BoolQ (preguntas de verificacion).
- Control de agente en bucle cerrado sobre ViZDoom, seleccionando la accion a partir del estado del juego serializado en JSON.
- Calibracion de probabilidades: ECE de 0,045 en el split de test de typed-decisions, el valor mas bajo del grupo de comparacion.
- Baja latencia: 7,3 ms p50 por decision en GPU local, con 36,6 ms p50 por caso de 5 decisiones.
- No dispone de generacion de texto, tool calling, function calling, capacidades multimodales ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Control de agentes en entornos simulados: el modelo consume el estado del juego como JSON y emite la accion en un forward pass de 23,4 ms incluyendo E/S del juego, lo que permite bucles de decision a ~43 decisiones por segundo. Los resultados publicados en ViZDoom incluyen 3/3 escenarios Basic superados y 10,7 bajas de media en Defend the center.
- Enrutamiento de consultas bancarias: con 0,845 de accuracy en Banking77 y probabilidades calibradas, puede asignar una consulta entrante a una de las 77 intenciones y usar el score como umbral para derivar a un humano cuando la confianza es baja.
- Clasificacion de noticias para agregadores o sistemas de recomendacion: 0,850 de accuracy en AG News sobre 200 items retenidos por fuente.
- Verificacion de afirmaciones y QA booleano: 0,635 de accuracy en BoolQ, util como filtro previo en pipelines de validacion documental donde se necesita una respuesta si/no con confianza asociada.
- Decisiones de baja latencia en bucle cerrado: con 137 decisiones por segundo p50, es adecuado para sistemas que requieren reevaluar el estado decenas de veces por segundo, como simulacion de politicas o prototipos de robotica en entornos discretizados.
- Filtrado con umbral de confianza: gracias al ECE de 0,045, el score devuelto puede usarse directamente para aceptar, escalar o descartar automaticamente una decision sin recalibracion adicional.
- Investigacion en computacion neuromorfica: al estar construido con unidades inspiradas en neuronas reales del conectoma de Drosophila, sirve como banco de pruebas para estudiar el rendimiento de sustratos biologicos en tareas de decision.
- Comparacion y evaluacion de modelos de decision: el autor publica logs por paso y demos `.lmp` en `doom_runs/`, lo que facilita reproducir el comportamiento y compararlo con otras politicas.

## Benchmarks y rendimiento

Comparativa en el split de test de typed-decisions (LocalLLaMA/typed-decisions, 2.000 decisiones). La velocidad corresponde al tiempo p50 por caso de 5 decisiones.

| Modelo | Parametros | Accuracy | Soft acc. | Brier (menor mejor) | ECE (menor mejor) | ms / caso (p50) | Decisiones / s |
|---|---|---|---|---|---|---|---|
| On-Fly-Jev (spiking) | 96M | 0,666 | 0,528 | 0,132 | 0,045 | 36,6 | ~137 |
| Byrne-Jev | 70M | 0,630 | 0,509 | 0,134 | 0,045 | 110,7 | ~45 |
| TypeSafe Jev 1.13.0 | no disponible | 0,727 | 0,580 | 0,148 | 0,144 | 710 | ~7 |
| ModernBERT-base (especialista) | 149M | 0,646 | 0,542 | 0,119 | 0,179 | 349 | ~14 |
| Laya typed-decisions (fine-tuned) | 421M | 0,766 | 0,471 | no disponible | no disponible | no disponible | no disponible |
| Teacher self-agreement (techo) | no aplica | 0,735 | no disponible | no disponible | no disponible | no disponible | no disponible |

Resultados por checkpoint y por fuente retenida (200 items por fuente, 10 fuentes publicas):

| Metrica | Old FlyNeuron-Jev | New-mix epoch 2 | On-Fly-Jev |
|---|---|---|---|
| Typed accuracy | 0,6655 | 0,651 | 0,666 |
| Brier score | 0,144 | 0,130 | 0,132 |
| ECE | 0,050 | 0,052 | 0,045 |
| Media en fuentes retenidas | 0,679 | 0,682 | 0,682 |
| AG News | 0,835 | 0,860 | 0,850 |
| Banking77 | 0,835 | 0,845 | 0,845 |
| BoolQ | 0,645 | 0,555 | 0,635 |

Resumen de ViZDoom (3 episodios por escenario, 2.151 decisiones):

| Escenario | On-Fly-Jev | FlyNeuron-Jev FT2 epoch 4 | FT2 merge (epochs 1 + 4) |
|---|---|---|---|
| Basic | 3 / 3 superados | no disponible | no disponible |
| Defend the center, bajas medias | 10,7 | 10,0 | 9,3 |
| Defend the line, bajas medias | 21,3 | 31,0 | 22,0 |
| Deadly corridor, finalizados | 2 / 3 | 2 / 3 | 3 / 3 |

Nota del autor: en las 10 fuentes publicas retenidas, Byrne-Jev es mas fuerte (media 0,746 frente a 0,682 de On-Fly-Jev).

## Requisitos de hardware

- La model card indica que las mediciones se hicieron en GPU local, pero no especifica modelo ni VRAM utilizada.
- Estimacion derivada del numero de parametros (no publicada por el autor): un modelo de 96M ocupa aproximadamente 0,38 GB en fp32 y 0,19 GB en fp16 solo en pesos; el repositorio completo ocupa 1,0 GB.
- Con ese tamano, es previsible que quepa en cualquier GPU de consumo con 4 GB o mas de VRAM, aunque no hay confirmacion oficial ni mediciones de consumo de memoria publicadas.
- GPU recomendadas: no disponibles. No se publican datos para A100, H100, RTX 4090 ni otros modelos concretos.
- Latencia publicada: 7,3 ms p50 por decision y 36,6 ms p50 por caso de 5 decisiones (p95 de 53,5 ms). En el bucle de ViZDoom, 23,4 ms por decision incluyendo la E/S del juego, lo que da ~43 decisiones por segundo.
- Throughput publicado: ~137 decisiones por segundo y ~27 casos por segundo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La evaluacion se realiza con el script propio `eval_decisions.py --suite all`, lo que implica despliegue mediante codigo PyTorch del propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Accuracy typed | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| On-Fly-Jev | 96M | SNN con conectoma de Drosophila | 0,666 | 0,045 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Byrne-Jev | 70M | SNN SpikeWhale (mismo autor) | 0,630 | 0,045 | no disponible en la informacion | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13.0 | no disponible | Referencia typed-decisions | 0,727 | 0,144 | no disponible | API alojada (el tiempo incluye red) |
| ModernBERT-base (especialista) | 149M | Transformer encoder especializado | 0,646 | 0,179 | no disponible | Pesos abiertos |
| Laya typed-decisions (fine-tuned) | 421M | Modelo afinado de mayor tamano | 0,766 | no disponible | no disponible | Alojado; no reporta calibracion ni velocidad |

En velocidad, On-Fly-Jev es aproximadamente 19 veces mas rapido que TypeSafe Jev, 9,5 veces mas rapido que ModernBERT-base y 3 veces mas rapido que Byrne-Jev por caso. En precision queda por encima de ModernBERT-base y Byrne-Jev, y por debajo de TypeSafe Jev y Laya.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados publicados.
- No genera texto ni mantiene conversaciones: solo emite probabilidades sobre preguntas tipadas. No admite tool calling ni razonamiento multi-paso.
- Precision de 0,666 en typed-decisions, inferior a la de TypeSafe Jev (0,727) y Laya (0,766), ambos de mayor tamano o alojados.
- En las 10 fuentes publicas retenidas, Byrne-Jev obtiene mejor media (0,746 frente a 0,682), por lo que la ventaja de On-Fly-Jev se concentra en velocidad y calibracion, no en precision general.
- Ejecuta ViZDoom con una tasa de finalizacion de 2/3 en Deadly corridor y 21,3 bajas medias en Defend the line, por debajo de las 31,0 del checkpoint FT2 epoch 4.
- La longitud de contexto, los idiomas soportados y los tipos de cuantizacion no estan documentados.
- El techo de referencia (teacher self-agreement) es 0,735, apenas 0,069 puntos por encima de la accuracy del modelo, lo que sugiere margen limitado de mejora dentro del esquema actual.
- Licencia Apache 2.0, que permite uso comercial, pero al tratarse de un modelo de investigacion sin despliegue documentado conviene validar su comportamiento antes de llevarlo a produccion.
- Posible riesgo de descalibracion fuera de la distribucion de los datasets de entrenamiento; el ECE de 0,045 esta medido sobre typed-decisions y las 10 fuentes publicas retenidas, no sobre datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/On-Fly-Jev
- Modelo anterior de la misma familia: https://huggingface.co/Quazim0t0/Byrne-Jev-79M
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset ZefanCai/Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Conectoma MaleCNS v1.0 de Janelia / Google: referencia citada en la model card sin URL publicada
- Videos de demostracion en ViZDoom y logs por paso: disponibles en el repositorio del modelo (`videos/` y `doom_runs/`)
- Informes de evaluacion: disponibles en el repositorio del modelo (`eval/`)
