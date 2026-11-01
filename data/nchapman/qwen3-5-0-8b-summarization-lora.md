# nchapman/qwen3.5-0.8b-summarization-lora

## Resumen

Qwen3.5-0.8B Summarization LoRA es un adaptador PEFT de tipo LoRA, con rango 16, entrenado por el usuario nchapman sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo autonomo: requiere cargar el modelo base Qwen3.5-0.8B y aplicar el adaptador encima. Su proposito concreto es la summarizacion de documentos web en ingles, reforzando una "respuesta contractual" de resumen en prosa objetiva, breve cuando la fuente es simple y mas detallada cuando lo justifica.

El adaptador se entreno con ejemplos que emparejan un documento fuente con su resumen objetivo, usando la particion de summarizacion SFT del dataset publico HuggingFaceTB/smoltalk2 (que incluye estilos de resumen de una linea y de tres frases) junto con pares privados de documento web y resumen del autor. El checkpoint evaluado es el 128 de una ejecucion de 512 actualizaciones, con rango 16, alpha 16 y dropout 0.

Es relevante ahora porque demuestra un caso de especializacion ligera sobre un modelo pequeno (0.8B) con un adaptador de pocos parametros, y publica una comparacion empirica con intervalos de confianza pareados frente al modelo base en un conjunto de 250 articulos de CNN/DailyMail. Los resultados muestran mejoras en factualidad, relevancia y ROUGE-L, aunque con un aumento de truncamientos por limite de 1.024 tokens, lo que el propio autor advierte que no constituye una garantia incondicional de calidad ni de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA rango 16; el modelo base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible de forma explicita; la evaluacion publicada uso inferencia Q4 sobre el base con adaptador BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT); el base en safetensors/GGUF segun disponibilidad |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 16 y dropout 0, aplicado sobre el modelo base Qwen3.5-0.8B. El checkpoint evaluado corresponde a la actualizacion 128 de una ejecucion de 512 pasos. Se entreno y evaluo en un entorno con Transformers 5.2.0, y requiere una version de Transformers que soporte Qwen3.5 y PEFT. La carga se realiza con `PeftModel.from_pretrained` sobre el base cargado con `AutoModelForImageTextToText` en bfloat16.

Los datos de entrenamiento emparejan documento fuente y resumen objetivo. La parte publica proviene de la particion SFT de summarizacion de HuggingFaceTB/smoltalk2, con estilos de una linea y de tres frases; las ejecuciones mixtas anadieron pares privados de documento web y resumen del autor. Ambas tallas de Qwen usaron el mismo pool preparado congelado y las mismas asignaciones de entrenamiento/validacion. El objetivo declarado es reforzar un contrato de respuesta de summarizacion compartido entre tallas, aunque el autor aclara que no se ejecuto una metrica formal de varianza de estilo entre modelos y que los cambios de longitud y calidad dependen del modelo. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO.

## Capacidades

- Generacion de texto orientada a summarizacion de documentos web en ingles.
- Resumen en prosa objetiva, conciso o detallado segun la complejidad de la fuente.
- Soporte de estilos de resumen de una linea y de tres frases (segun datos de entrenamiento).
- Compatible con el chat template del modelo base; el documento fuente se pasa como contenido de usuario.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada; el base se carga con `AutoModelForImageTextToText`, pero el adaptador esta orientado a texto.

## Casos de uso

- Resumen de articulos de noticias en ingles: el adaptador esta evaluado sobre CNN/DailyMail y mejora la factualidad frente al base, por lo que encaja en pipelines de resumen de prensa con verificacion humana posterior.
- Resumen de paginas web para motores de busqueda o indices internos: el modelo base es pequeno (0.8B) y el adaptador apenas anade coste, lo que permite procesar lotes grandes de documentos en hardware modesto.
- Generacion de resumenes de una linea para snippets o metadatos: el entrenamiento incluye ese estilo, util para alimentar tarjetas de resultado o feeds.
- Resumen de tres frases para boletines o alertas: el formato breve y objetivo encaja en notificaciones automatizadas.
- Preprocesado en pipelines de RAG: condensar documentos largos antes de indexarlos o de pasarlos a un modelo mayor, reduciendo tokens y coste.
- Prototipado rapido de summarizacion en local: al ser un adaptador sobre un base de 0.8B, se puede desplegar en una sola GPU consumer para pruebas y demos.
- Normalizacion de estilo de resumen entre tallas de modelo: el autor plantea el adaptador como forma de reforzar un contrato de respuesta comun, util si se sirven varias tallas de Qwen en un mismo producto.

## Benchmarks y rendimiento

Comparacion alineada sobre 250 articulos de CNN/DailyMail, con inferencia Q4 del base, adaptador BF16 en sidecar, generacion greedy `summary-v3` y el mismo juez fijado para los cuatro pares base/adaptador:

| Metrica | Base | Base + adaptador | Diferencia [IC 95% pareado] |
|---|---:|---:|---:|
| Factualidad (juez, 1-5) | 3,296 | 4,344 | +1,048 [+0,896, +1,204] |
| Relevancia (juez, 1-5) | 3,832 | 4,148 | +0,316 [+0,200, +0,432] |
| Calidad global (juez, 1-5) | 3,184 | 3,400 | +0,216 [+0,076, +0,364] |
| Cobertura (juez, 1-5) | 3,812 | 3,824 | +0,012 [-0,112, +0,136] |
| ROUGE-L | 0,1400 | 0,1693 | +0,0292 [+0,0207, +0,0376] |
| Palabras medias | 303,9 | 310,5 | +6,6 [-22,9, +36,6] |
| Paradas por limite de 1.024 tokens | 10 | 24 | +14 |

El autor advierte que la cobertura y la diferencia de longitud son inconcluyentes, que las paradas por limite aumentaron de 10 a 24 y que se trata de una sola semilla de entrenamiento y un checkpoint temprano seleccionado sobre un conjunto publico de noticias expuesto. El resultado alineado sustituye a una instantanea anterior de evaluacion de Qwen que usaba ajustes de decodificacion distintos. No se publican MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un base de 0.8B con adaptador LoRA, la huella es reducida y cabe en GPUs consumer.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, GPUs de gama media y alta (por ejemplo, RTX 4090, A100, H100) son sobredimensionadas para inferencia, pero no se documentan recomendaciones oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base de 0.8B, aunque no se especifican modelos concretos.
- Opciones de despliegue: la model card solo documenta carga via Transformers + PEFT; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/qwen3.5-0.8b-summarization-lora | Adaptador LoRA sobre 0,8B | no disponible | Summarizacion EN | apache-2.0 | HuggingFace (28 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generacion general | propia del base | HuggingFace |
| Alternativas de summarizacion de 0,8B-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la unica comparacion publicada es frente al propio modelo base.

## Limitaciones y advertencias

- Es un adaptador PEFT, no un modelo autonomo: sin el base Qwen3.5-0.8B no funciona.
- Solo soporta ingles; no se documentan capacidades multilingues.
- La evaluacion se basa en una sola semilla de entrenamiento y un checkpoint temprano seleccionado sobre un conjunto publico de noticias ya expuesto, lo que limita la generalizacion.
- Las paradas por limite de 1.024 tokens aumentaron de 10 a 24, lo que puede truncar resumenes en documentos largos.
- Cobertura y diferencias de longitud resultaron inconcluyentes; no hay garantia incondicional de calidad ni de despliegue.
- Riesgo de alucinacion inherente a modelos generativos; la factualidad mejoro en el juez automatico, pero no sustituye a verificacion humana en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache-2.0 cubre el adaptador, pero el modelo base conserva su propia licencia y terminos, que deben consultarse antes de uso comercial.
- El repositorio no incluye registros privados, ficheros de entrenamiento derivados ni el runner de entrenamiento, lo que dificulta la reproducibilidad completa.
- Requiere Transformers 5.2.0 o una version que soporte Qwen3.5 y PEFT.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/nchapman/qwen3.5-0.8b-summarization-lora
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset HuggingFaceTB/smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Informe de evaluacion (referenciado en la model card): `docs/results/aligned-adapter-comparison.md` en el repositorio Lillm Summarizer (no se proporciona URL directa)
