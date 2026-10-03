# francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455

## Resumen

`francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455` es un modelo de generacion de texto publicado por el usuario francesca9805 en HuggingFace. Se trata de un ajuste fino (SFT) del modelo base `francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455`, realizado con la libreria TRL. El nombre del repositorio sugiere que forma parte de una linea de experimentos de investigacion centrada en tokenizadores y preentrenamiento sobre corpus pequenos (100 MB), con variantes identificadas por semilla (seed455 en este caso).

El modelo tiene 124.770.816 parametros totales segun los pesos en safetensors, una cifra compatible con la arquitectura GPT-2 pequena (etiquetada como `gpt2` en los tags del repositorio). No es un modelo MoE ni dispone de parametros activos diferenciados. Esta pensado exclusivamente para generacion de texto y se distribuye en formato safetensors, con soporte declarado para text-generation-inference y endpoints compatibles.

La relevancia de este modelo es limitada y de caracter experimental: registra cero descargas y cero "likes", no publica licencia ni idiomas soportados, y no incluye resultados de benchmarks. Su interes principal es como artefacto reproducible de un estudio academico sobre tokenizacion y datos de preentrenamiento a pequena escala (el proyecto de Weights & Biases asociado pertenece a la Universidad de Groningen), mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se confirma GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,5 GB |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de estilo GPT-2, segun el tag `gpt2` del repositorio y el recuento de 124,77 M de parametros, coherente con GPT-2 small (12 capas, 12 cabezas de atencion, dimension de embedding 768). No hay indicios de componentes MoE, SSM ni mecanismos hibridos. La model card no detalla la longitud de contexto entrenada ni si se aplicaron tecnicas de atencion alternativas.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO. El modelo base del que parte es a su vez un ajuste fino de `goldfish-models/eng_latn_100mb`, lo que situa el linaje en el ecosistema de corpus multilingues de 100 MB por idioma. El repositorio ocupa 5,5 GB pese a tener solo 124 M de parametros, lo que apunta a la presencia de multiples checkpoints u optimizador estados intermedios (`after-ckpt500` en el nombre).

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts y respuesta a instrucciones simples en formato de chat (la model card muestra un ejemplo con rol `user`).
- Ajuste por instrucciones (SFT) sobre el modelo base, orientado a la formulacion de preguntas y respuestas.
- Compatibilidad con `text-generation-inference` y endpoints compatibles segun los tags.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se documentan capacidades especiales (modo thinking, vision, audio u otras).

## Casos de uso

- Investigacion en tokenizacion: el modelo forma parte de un estudio sobre nuevos lexicos y tokenizadores; puede utilizarse como punto de comparacion reproducible frente a otras semillas de la misma serie.
- Reproducibilidad academica: dado que se especifican versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, sirve para replicar experimentos de SFT sobre corpus pequenos.
- Pruebas de integracion con el ecosistema Transformers: al ser un modelo de 124 M de parametros, es adecuado para validar pipelines de `pipeline("text-generation")` y despliegues de prueba con text-generation-inference.
- Fine-tuning posterior de bajo coste: su tamano reducido permite reentrenarlo en una unica GPU consumer para experimentar con tecnicas de ajuste.
- Docencia y formacion: apropiado para demostrar el flujo completo de SFT con TRL sin requerir infraestructura cara.
- Generacion de texto de proposito general a pequena escala: puede emplearse en prototipos donde la calidad no sea critica y prime el coste minimo de inferencia. No es adecuado para produccion real en atencion al cliente, generacion de codigo o tareas de razonamiento, dado que no hay evidencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (124,77 M parametros): aproximadamente 500 MB en FP32, 250 MB en FP16/BF16, 125 MB en int8 y 62 MB en int4.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA RTX 3060, RTX 4090 o incluso una GPU integrada con 2 GB de VRAM libre puede ejecutarlo.
- Cabe con holgura en GPU consumer y tambien en CPU: es viable la inferencia en un portatil sin GPU dedicada.
- Opciones de despliegue: `transformers` (via `pipeline`), text-generation-inference (segun los tags), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, algo que no se confirma en la informacion disponible. vLLM y TGI son compatibles en principio por tratarse de un modelo GPT-2 estandar.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una latencia muy baja en GPU, pero no hay cifras publicadas.
- El repositorio pesa 5,5 GB, por lo que la descarga ocupa bastante mas que el propio modelo; conviene tenerlo en cuenta para el almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (tam-100mb-...-seed455) | 124,77 M | no disponible | GPT-2 | no disponible | HuggingFace, 0 descargas |
| GPT-2 small | 124 M | 1024 tokens | GPT-2 | MIT | Ampliamente disponible |
| goldfish-models/eng_latn_100mb | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base del linaje) |
| SmolLM-135M | 135 M | 2048 tokens | Transformer decoder | Apache 2.0 | HuggingFace |

La comparacion directa es dificil porque el modelo no publica contexto, licencia ni benchmarks. Frente a GPT-2 small comparte recuento de parametros y arquitectura, pero carece de la documentacion y de la licencia permisiva (MIT) del original. Frente a SmolLM-135M queda por debajo en contexto declarado y en soporte de licencia.

## Limitaciones y advertencias

- No se publica licencia, por lo que se desconoce si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- No se documentan idiomas soportados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- No hay resultados de benchmarks, por lo que no existe evidencia publica de rendimiento en tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion alto: se trata de un modelo pequeno (124 M) entrenado con SFT sobre corpus limitados, sin etapas documentadas de alineacion adicional.
- Sesgos conocidos: no disponibles, pero al derivar de `goldfish-models/eng_latn_100mb` es esperable un sesgo hacia el ingles y hacia las caracteristicas del corpus de origen.
- Longitud de contexto desconocida: impide planificar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Repositorio de 5,5 GB para 124 M de parametros, lo que sugiere checkpoints redundantes y aumenta innecesariamente el coste de almacenamiento y descarga.
- Cero descargas y cero interacciones: no existe una comunidad que haya validado el modelo ni reportado fallos.
- No recomendado para produccion en atencion al cliente, generacion de codigo, agentes o cualquier tarea que requiera fiabilidad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/francesca9805/tam-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed455
- Modelo base en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfdiso_seed455
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zbwpmg2k
- Variante relacionada (seed3407): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-tam-after-100mb-packed-bfd_seed3407
- Modelo de origen del linaje (goldfish-models): https://huggingface.co/goldfish-models/eng_latn_100mb
