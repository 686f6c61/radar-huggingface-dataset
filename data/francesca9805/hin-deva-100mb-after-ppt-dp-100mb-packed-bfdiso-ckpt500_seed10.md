# francesca9805/hin-deva-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10

## Resumen

El modelo `hin-deva-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10` es un ajuste fino (SFT) desarrollado por el usuario francesca9805 sobre su propio modelo base `francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10`. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parametros, entrenado mediante la libreria TRL de Hugging Face. El nombre del repositorio sugiere un experimento sobre corpus en hindi en escritura devanagari, con un pipeline de datos empaquetados ("packed") y cuantizacion en bf16, en un checkpoint concreto (paso 500) y una semilla determinada (seed10).

El modelo pertenece a una serie de variantes (distintas semillas y checkpoints, como se observa en los resultados de busqueda) que parecen formar parte de una investigacion sobre tokenizacion y escalado de datos en hindi, vinculada a la Universidad de Groningen segun la traza de Weights & Biases. Por su tamano reducido, es un modelo de proposito experimental o de investigacion mas que de produccion.

Su relevancia actual es limitada fuera del contexto academico: no publica benchmarks, no declara licencia ni idiomas soportados, y cuenta con cero descargas y cero "likes" en el momento de redactar esta ficha. Resulta util como punto de partida para reproducir experimentos de ajuste fino SFT sobre modelos GPT-2 pequenos y para estudiar tecnicas de empaquetado de secuencias en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` y la libreria `transformers` |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el nombre del modelo sugiere hindi en escritura devanagari, pero no se confirma en la model card) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10 |
| Tamano del repositorio | 5.2 GB |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atencion causal, segun se deduce del tag `gpt2` del repositorio y de la libreria de despliegue declarada (`text-generation`). Con 124.770.816 parametros, el modelo se situa en el rango de GPT-2 small (aproximadamente 124 millones de parametros). No se especifican en la informacion disponible la profundidad, el numero de cabezas de atencion, la dimension del embedding ni la longitud de contexto maxima.

El entrenamiento se realizo mediante SFT con la libreria TRL (version 0.23.0), sobre el modelo base `hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10`, que a su vez parece ser un modelo preentrenado sobre un corpus de 100 MB (indicado en el nombre "100mb"). El identificador "packed" sugiere empaquetado de secuencias durante el entrenamiento, "bfdiso" apunta a un uso de bf16, y "ckpt500_seed10" indica que se publica el checkpoint del paso 500 entrenado con la semilla 10. Las versiones de framework declaradas son Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. Existe una traza publica del entrenamiento en Weights & Biases bajo el proyecto "new-tokenizers" de la Universidad de Groningen. No se detalla la composicion del dataset, el numero total de tokens ni si se aplicaron fases de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`), unica capacidad declarada explicitamente.
- Posible generacion de texto en hindi en escritura devanagari, inferida del nombre del modelo, aunque no confirmada en la documentacion.
- Formato de entrada basado en mensajes de conversacion (`{"role": "user", "content": ...}`), segun el ejemplo de la model card, lo que sugiere un ajuste orientado a instrucciones o chat.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue ni vision ni audio.
- No se declara modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Investigacion sobre tokenizacion en hindi: el modelo forma parte de una serie de experimentos sobre tokenizadores para devanagari, por lo que puede emplearse para reproducir y comparar resultados entre distintas semillas y checkpoints de la misma familia.
- Evaluacion de tecnicas de empaquetado de secuencias ("packed"): util como referencia para medir el impacto del empaquetado de datos en el rendimiento de modelos pequenos.
- Ajuste fino posterior como banco de pruebas: sirve como punto de partida para experimentar con nuevas fases SFT, dado su tamano reducido y su licencia sin restricciones declaradas.
- Generacion de texto en hindi a baja escala: puede generar borradores o completaciones en devanagari para tareas internas de investigacion, siempre que se valide la calidad manualmente.
- Docencia y formacion: adecuado para demostrar el ciclo completo de preentrenamiento, ajuste SFT y publicacion de modelos con transformers y TRL en entornos con recursos limitados.
- Despliegue en entornos sin GPU: al ser un modelo de 124 millones de parametros, puede ejecutarse en CPU o en GPU de gama de entrada para pruebas de inferencia y monitorizacion de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124,77 millones de parametros): aproximadamente 0,5 GB en fp32, unos 0,25 GB en fp16/bf16, unos 0,13 GB en int8 y unos 0,07 GB en int4.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 ejecutarian el modelo con holgura. Incluso una GPU integrada puede gestionarlo.
- Si cabe en GPU de consumo: si, cabe en practicamente cualquier GPU de consumo, incluidos modelos con 4 GB o menos de VRAM.
- Ejecucion en CPU: viable para inferencia, ya que el modelo completo ocupa menos de 1 GB en memoria.
- Opciones de despliegue: la etiqueta `endpoints_compatible` y `text-generation-inference` indican compatibilidad con Hugging Face Inference Endpoints y TGI. Tambien es desplegable con transformers (pipeline de text-generation) y, previa conversion, con llama.cpp u Ollama. Se han detectado integraciones de terceros con FriendliAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento fiable. A continuacion se compara a nivel de especificaciones con alternativas del mismo orden de tamano.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/hin-deva-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10 | 124,77 M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Ampliamente disponible |
| Otros modelos GPT-2 de ~124 M para hindi | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada con claridad: la model card indica "licence: license" sin terminos concretos, lo que impide confirmar si se permite el uso comercial.
- Idiomas soportados no confirmados: aunque el nombre apunta a hindi en devanagari, no hay declaracion oficial ni evaluacion de cobertura linguistica.
- Ausencia total de benchmarks: no hay datos que permitan estimar la calidad de las generaciones ni compararla con alternativas.
- Riesgo de alucinacion elevado: la capacidad de generalizacion de un modelo de 124 millones de parametros entrenado sobre un corpus de 100 MB es limitada.
- Modelo experimental: la existencia de multiples variantes (semillas y checkpoints) indica que se trata de un artefacto de investigacion, no de un modelo listo para produccion.
- Longitud de contexto desconocida: al no declararse, no puede garantizarse el comportamiento en conversaciones de varios turnos o documentos largos.
- Sin garantias de soporte ni mantenimiento: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de uso en comunidad.
- Advertencia de seguridad: cualquier despliegue en produccion deberia acompanarse de filtros de contenido y validacion humana, dado que no se documentan sesgos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/hin-deva-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Variante del mismo autor (seed10): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante del mismo autor (seed3407): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Traza de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/cu35vf84
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en AI Model Insights: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed10
