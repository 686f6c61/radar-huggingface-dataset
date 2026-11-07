# Hahmdong/SPUPER-qwen3.5-9b-ducky-formation-seed44

## Resumen

SPUPER-qwen3.5-9b-ducky-formation-seed44 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Hahmdong y publicado en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida. El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo de los pesos del modelo base de Qwen.

El modelo cuenta con 9.409.813.744 parametros totales (segun los pesos en safetensors) y un repositorio de 18,8 GB, lo que es coherente con pesos en precision de 16 bits. La nomenclatura "ducky-formation" y el sufijo "seed44" sugieren una variante dentro de una familia de experimentos de ajuste del mismo autor, probablemente centrada en un comportamiento o formato concreto (no documentado en la model card). El modelo base Qwen3.5-9B es un transformer multimodal de Qwen, aunque la model card del ajuste no detalla la arquitectura interna ni el contexto nativo.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de fine-tuning de un modelo de 9B con capacidades de vision, publicado sin documentacion tecnica sustancial (sin datos de entrenamiento, sin benchmarks, sin licencia declarada de forma clara). Es util para quien quiera reproducir o evaluar ajustes SFT sobre Qwen3.5-9B, pero no es un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; una variante de la misma familia se despliega con 32K en featherless.ai |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Libreria | transformers (compatible con endpoints) |
| Tamano del repositorio | 18,8 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del modelo base Qwen/Qwen3.5-9B, entrenado con TRL 0.27.1 sobre Transformers 5.9.0, PyTorch 2.11.0+cu129, Datasets 4.0.0 y Tokenizers 0.22.2. La model card no especifica la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documenta si se congelaron capas, si se entreno el proyector vision-lenguaje o si se hizo un full fine-tuning; el tag `generated_from_trainer` indica que el modelo se genero con el flujo estandar de entrenamiento de TRL.

La arquitectura subyacente corresponde al modelo base Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. No se dispone de informacion sobre innovaciones tecnicas especificas del ajuste (por ejemplo, decodificacion especulativa, atencion lineal o modos de razonamiento extendido). El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto SPUPER-SFT del autor, lo que permite consultar curvas de perdida si se tiene acceso.

## Capacidades

- Generacion de texto conversacional a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento de imagenes combinadas con instrucciones en lenguaje natural, heredado del modelo base multimodal.
- Razonamiento y respuesta a preguntas de caracter general, segun las capacidades del modelo base Qwen3.5-9B.
- Soporte de conversaciones multi-turno en formato de chat (la model card muestra un ejemplo con lista de mensajes con roles).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades especificas de tool calling, function calling, agentes, modo thinking, audio ni idiomas concretos para este ajuste.

## Casos de uso

- Evaluacion de ajustes SFT sobre Qwen3.5-9B: util para investigadores que quieran comparar el efecto de un fine-tune concreto frente al modelo base en tareas de vision-lenguaje, usando el mismo pipeline de transformers.
- Prototipado de asistentes que describen imagenes: el modelo puede recibir una imagen y una pregunta y generar una respuesta textual, adecuado para demos internas antes de pasar a un modelo con licencia clara.
- Experimentos de formato conversacional: dado que el autor mantiene una familia de variantes ("ducky-add", "ducky-act", "ducky-formation"), sirve para estudiar como distintos datasets SFT modifican el estilo de respuesta del mismo modelo base.
- Reproduccion de entrenamientos con TRL: el run de W&B y las versiones de framework documentadas permiten replicar el proceso de SFT con la misma configuracion.
- Investigacion sobre sesgos y alucinacion en fine-tunes pequenos: al no haber benchmarks publicados, es un candidato para auditorias propias de calidad y fidelidad en tareas multimodales.
- Base para nuevos ajustes: al estar en safetensors y ser compatible con transformers, puede servir como punto de partida para fine-tunes posteriores con LoRA o SFT completo, siempre que se resuelva la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 19 GB solo para pesos (9,4B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB de pesos, con margen para contexto y activaciones.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos; cabe en GPUs consumer de 8-12 GB, aunque no se publican pesos GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 sin cuantizar; RTX 4090 (24 GB) es suficiente para fp16 ajustado o 8 bits.
- GPU consumer: cabe en RTX 4090 y, con cuantizacion, en RTX 3090, RTX 4080 y posiblemente en GPUs de 12 GB en 4 bits.
- Opciones de despliegue: transformers (soporte nativo), TGI y vLLM (previa conversion y validacion del modelo multimodal), y llama.cpp/Ollama solo si se generan pesos GGUF, que no se incluyen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPUPER-qwen3.5-9b-ducky-formation-seed44 | 9,4B | no disponible (32K en una variante de la familia) | image-text-to-text | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible en esta ficha | image-text-to-text | la del modelo base de Qwen (consultar) | Hugging Face |
| Hahmdong/SPUPER-qwen3.5-9b-ducky-add | 9B (familia) | no disponible | image-text-to-text | no disponible | Hugging Face |
| Hahmdong/SPUPER-qwen3.5-9b-ducky-act | 9B (familia) | 32K (segun featherless.ai) | image-text-to-text | no disponible | Hugging Face, featherless.ai |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de 9B de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluaciones publicadas de MMLU, HumanEval, GSM8K ni de tareas multimodales, por lo que el rendimiento real es desconocido.
- Licencia ambigua: la model card declara `licence: license` sin especificar terminos; no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo base Qwen3.5-9B antes de cualquier uso en produccion.
- Idiomas no declarados: no se especifica que lenguas soporta el ajuste; el comportamiento multilingue puede degradarse respecto al modelo base.
- Contexto no documentado: la model card no indica la longitud de contexto nativa del ajuste; la referencia a 32K proviene de una variante distinta de la familia y no debe extrapolarse sin verificacion.
- Riesgo de alucinacion: como todo modelo generativo ajustado con SFT y sin etapa de preferencia documentada, puede producir contenido plausible pero incorrecto, especialmente en tareas de imagen-texto.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de genero, raza, idioma o dominio.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ en el repositorio, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversion.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo; no apto para produccion sin evaluacion propia.
- El ejemplo de la model card usa `model="None"`, lo que indica que la documentacion de inicio rapido no esta completada correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-ducky-formation-seed44
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante de la familia (ducky-add): https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-ducky-add
- Variante de la familia (ducky-act) en featherless.ai: https://featherless.ai/models/Hahmdong/SPUPER-qwen3.5-9b-ducky-act
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/4jyl7kxi
- Repositorio de TRL: https://github.com/huggingface/trl
