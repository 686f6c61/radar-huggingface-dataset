# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run2-eb32-e3-lr2e-04-checkpoint939

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) entrenado sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. Lo publica el usuario `nmuendler` como un *checkpoint* intermedio o final de un proceso de ajuste fino supervisado sobre texto (el identificador incluye `text-sft-run2-eb32-e3-lr2e-04-checkpoint939`). El repositorio pesa 0,3 GB, un orden de magnitud coherente con pesos de adaptador de bajo rango y no con un modelo de 7 000 millones de parámetros, y la model card es la plantilla por defecto de HuggingFace sin ningún campo completado: no hay descripción, datos de entrenamiento, hiperparámetros declarados ni resultados de evaluación.

El modelo base, DeepSeek-R1-Distill-Qwen-7B, es un destilado de las trazas de razonamiento de DeepSeek-R1 en una arquitectura Qwen (decoder-only tipo transformer) de aproximadamente 7 000 millones de parámetros, orientado a tareas de razonamiento matemático, lógico y de código con cadenas de pensamiento largas. Este adaptador pretende ajustar ese comportamiento mediante SFT, presumiblemente para un estilo de respuesta o un dominio concreto, aunque el autor no documenta cuál.

Su relevancia práctica es limitada tal y como está publicado: cero descargas, cero *likes*, ausencia total de licencia declarada y de métricas. Debe tratarse como un artefacto experimental de investigación reproducible solo por su autor, no como un componente listo para producción. Para evaluarlo sería imprescindible contactar con el autor o reproducir el entrenamiento, y en cualquier caso es obligatorio verificar la licencia antes de cualquier uso, dado que la licencia del adaptador no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2; no es un modelo autónomo |
| Parametros totales | no disponible para el adaptador; el modelo base ronda los 7 000 millones de parametros segun su documentacion publica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; viene determinada por el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, que no modifica la configuracion del adaptador |
| Tipos de cuantizacion | no especificados por el autor; el adaptador se distribuye en precision completa de LoRA y requiere fusion con el modelo base antes de cuantizar a 8/4 bits o a GGUF |
| Idiomas soportados | no disponible en la informacion del adaptador (el modelo base declara cobertura multilingue, sin datos especificos de este ajuste) |
| Licencia | no disponible (la model card no declara licencia alguna) |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA); requiere el modelo base para funcionar |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Biblioteca declarada | peft (PEFT 0.19.1 en el entorno del autor) |
| Tarea (pipeline) | text-generation |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-16, segun los metadatos de HuggingFace |
| Fecha de actualizacion | 2026-09-16, segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El adaptador se apoya en DeepSeek-R1-Distill-Qwen-7B, un modelo denso decoder-only de la familia Qwen2 que DeepSeek obtuvo destilando trazas de razonamiento de DeepSeek-R1 sobre un modelo base tipo Qwen. El ajuste publicado aqui es un LoRA (Low-Rank Adaptation) gestionado con PEFT, es decir, un conjunto de matrices de bajo rango que se suman a ciertas proyecciones del modelo base. No se especifica el rango, el `alpha`, el `dropout` ni las capas objetivo del adaptador.

El nombre del repositorio permite inferir, siempre como hipotesis y no como dato confirmado, los siguientes hiperparametros: segunda ejecucion de entrenamiento (`run2`), tamano de lote efectivo 32 (`eb32`), 3 epocas (`e3`), tasa de aprendizaje 2e-4 (`lr2e-04`) y un *checkpoint* guardado en el paso 939 (`checkpoint939`). El sufijo `text-sft` sugiere un ajuste fino supervisado sobre un corpus de texto, pero no se indica la composicion del dataset, el numero de tokens, la existencia de RLHF/DPO posterior ni el metodo de destilacion empleado en esta fase. Tampoco se documenta el hardware, la duracion del entrenamiento ni el coste computacional.

## Capacidades

- Las capacidades heredadas del modelo base son razonamiento multi-paso, matematicas, generacion de codigo y generacion de texto con cadenas de pensamiento largas, pero **no hay ninguna evaluacion que confirme que este adaptador las conserva**.
- No se documenta soporte de tool calling ni de function calling en el adaptador ni en su model card.
- No se documenta soporte de agentes, planificacion multi-paso ni uso de memoria externa.
- No hay datos sobre capacidades multilingues especificas del adaptador.
- No se declara ningun modo especial (thinking mode, vision, audio, decodificacion especulativa) atribuible a este ajuste.
- Lo unico verificable es el formato de distribucion: un adaptador LoRA cargable mediante `peft` sobre el modelo base.

## Casos de uso

- Investigacion sobre ajuste fino supervisado: el adaptador sirve como artefacto de estudio para analizar como un SFT de 3 epocas y lr 2e-4 afecta a un destilado de razonamiento de 7 B, comparando el comportamiento antes y despues del ajuste con el mismo prompt.
- Reproduccion de experimentos de hiperparametros: dado que el nombre codifica lote efectivo, epocas y tasa de aprendizaje, puede usarse para replicar la configuracion y contrastarla con otros *checkpoints* de la misma serie (`run2` sugiere ejecuciones previas).
- Estudio de degradacion por sobreajuste: con 3 epocas y lr 2e-4 sobre un modelo ya destilado, resulta util para medir si el razonamiento matemático se degrada y a partir de que paso del entrenamiento.
- Punto de partida para un ajuste adicional: el adaptador puede fusionarse con el modelo base y servir de inicializacion para un SFT posterior con datos documentados, algo habitual en pipelines de investigacion.
- Evaluacion comparativa de adaptadores LoRA: integrarlo en vLLM con `--enable-lora` permite medir latencia y throughput de la capa LoRA frente a la inferencia del modelo base sin adaptador.
- Analisis de seguridad y sesgos: al no existir evaluacion alguna, el adaptador es un candidato claro para pasar baterias de *red teaming* que comparen el comportamiento del modelo base con el ajustado.
- Docencia y formacion: sirve como ejemplo real de repositorio con model card incompleta para ilustrar buenas practicas de documentacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no puede ejecutarse: hay que cargar el modelo base de ~7 000 millones de parametros, lo que domina los requisitos.
- VRAM estimada para el modelo base con pesos en bf16/fp16: en torno a 15-16 GB solo de pesos, mas la cache KV (crece con la longitud de contexto y el tamano de lote).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits (bitsandbytes, GPTQ o AWQ): aproximadamente 4-5 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contextos moderados; en RTX 3090 (24 GB) tambien; en RTX 3060 (12 GB) o RTX 4070 (12 GB) es necesario cuantizar a 8 o 4 bits; en GPUs de 8 GB solo con cuantizacion de 4 bits y contextos cortos.
- Opciones de despliegue: `transformers` + `peft` es la via directa para el adaptador; vLLM admite adaptadores LoRA mediante `--enable-lora`; TGI soporta adaptadores en versiones recientes; para llama.cpp u Ollama hay que fusionar el adaptador con el modelo base (`merge_and_unload`) y convertir a GGUF, porque estos *runtimes* no cargan PEFT directamente.
- Latencia y throughput: no disponibles; no se ha publicado ninguna medicion para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (nmuendler, checkpoint939) | Adaptador LoRA sobre ~7 B | no disponible | no disponible | 0 descargas, 0 likes, sin model card | Sin evaluacion ni datos de entrenamiento documentados |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7 B | no disponible en esta ficha (consultar su model card) | no disponible en esta ficha (consultar su model card) | Modelo base publico con documentacion oficial | Referencia obligatoria para cualquier uso del adaptador |
| Otros destilados de la familia DeepSeek-R1 (versiones 1.5 B, 14 B, 32 B) | 1,5-32 B | no disponible en esta ficha | no disponible en esta ficha | Publicos | Alternativas de distinto coste computacional segun VRAM disponible |
| Qwen2.5-7B-Instruct | ~7 B | no disponible en esta ficha | no disponible en esta ficha | Publico y ampliamente desplegado | Alternativa generalista, no especializada en razonamiento por destilacion |

No se dispone de datos de rendimiento comparado para este adaptador, por lo que la comparativa se limita a parametros, disponibilidad y trazabilidad documental.

## Limitaciones y advertencias

- Ausencia total de licencia: sin licencia declarada no hay autorizacion explicita de uso comercial, lo que en la practica inhabilita su uso en produccion hasta aclararlo con el autor.
- Model card vacia: no hay informacion sobre datos de entrenamiento, composicion del dataset, idiomas, filtrado de contenido ni procesos de alineacion.
- Sin evaluacion: no existe ningun benchmark, prueba cualitativa ni metrica publicada para este *checkpoint*.
- Checkpoint intermedio: el sufijo `checkpoint939` sugiere que puede no ser el estado final del entrenamiento, con el riesgo de rendimiento suboptimo que ello implica.
- Riesgo de sobreajuste o degradacion: 3 epocas con tasa de aprendizaje 2e-4 sobre un modelo ya ajustado por destilacion es una configuracion agresiva que puede deteriorar el razonamiento original.
- Trazabilidad nula: 0 descargas y 0 *likes* implican que no hay validacion independiente por parte de la comunidad.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y hereda todas las limitaciones del modelo base, incluidas la tendencia a la alucinacion y los sesgos presentes en sus datos de entrenamiento.
- Riesgo de fuga de datos: al desconocerse el corpus de SFT, no puede descartarse contaminacion con datos sensibles o con conjuntos de evaluacion.
- Compatibilidad: requiere una version de `peft` compatible (el autor uso 0.19.1) y el tokenizador exacto del modelo base; las herramientas que no soporten LoRA obligan a fusionar los pesos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-run2-eb32-e3-lr2e-04-checkpoint939
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto de carbono (referencia del tag `arxiv:1910.09700`): https://mlco2.github.io/impact
- Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning": https://arxiv.org/abs/1910.09700
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
