# francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

El modelo `eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eus_latn_10mb`, publicado por el usuario `francesca9805` en HuggingFace. Se trata de un modelo de generacion de texto muy pequeno, de arquitectura GPT-2, con 39.087.104 parametros (aproximadamente 39,1 millones), lo que lo situa en la categoria de modelos minimos orientados a investigacion y experimentacion, no a produccion.

El modelo se ha entrenado mediante SFT (Supervised Fine-Tuning) utilizando la libreria TRL, y aparece enmarcado dentro de una serie de experimentos sobre tokenizadores y mezcla de datos para lenguas de bajos recursos (el proyecto de seguimiento aparece como "new-tokenizers" en Weights & Biases del autor). La nomenclatura del identificador (`eus-latn` para euskera en alfabeto latino, `10mb` de datos, `Dp`, `packed`, `bfd`, `seed455`) sugiere una configuracion concreta de datos y semilla dentro de un barrido experimental, aunque la model card no documenta estos detalles.

Su relevancia es puramente academica: sirve para estudiar como afectan las decisiones de tokenizacion y la composicion del corpus en modelos de lengua reducidos. No compite con modelos de proposito general ni se le conocen resultados de benchmarks publicos. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 39.087.104 (~39,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | no disponible en la model card (modelo base etiquetado como eus_Latn, euskera) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `goldfish-models/eus_latn_10mb`, un modelo base de arquitectura GPT-2 entrenado sobre aproximadamente 10 MB de texto en euskera (campo `eus_Latn`). La arquitectura es, por tanto, un transformer decoder-only con atencion causal, sin mecanismos hibridos ni de atencion lineal documentados. Al ser un ajuste de un modelo base de ~39 M de parametros, el entrenamiento consistio en una fase de SFT sobre el modelo preentrenado, no en un entrenamiento desde cero.

El proceso de ajuste se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset de SFT, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. El proyecto de Weights & Biases asociado se denomina "new-tokenizers", lo que apunta a que la variable experimental principal es el tokenizador utilizado y la estrategia de empaquetado de datos (`packed`). No se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion optimizada, etc.).

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (39 M de parametros).
- Generacion condicionada por prompt conversacional de un solo turno, segun el ejemplo de la model card.
- Modelado de lengua para el idioma del corpus de entrenamiento (presumiblemente euskera, segun el modelo base).
- Utilidad como objeto de estudio para experimentos de tokenizacion y mezcla de datos.
- Soporte de `text-generation-inference` y etiqueta `endpoints_compatible`, segun los tags del repositorio.
- No hay evidencia de soporte de tool calling / function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues mas alla del idioma del modelo base.
- No hay evidencia de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta capacidad de codigo ni de matematicas.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo forma parte de una serie experimental ("new-tokenizers" en W&B) pensada para medir el impacto del tokenizador en la calidad de un modelo de lengua de bajos recursos. Se usaria como un punto de comparacion controlado frente a otras variantes de la misma serie (por ejemplo, las versiones con 100 MB o las de otros idiomas como `nld-latn` o `tur-latn`).
- Estudio de eficiencia de datos: al derivar de un corpus base de ~10 MB, permite analizar cuanto aprende un modelo de 39 M de parametros con un presupuesto de datos extremadamente reducido y como responde al SFT.
- Experimentos de ablacion con semillas: la etiqueta `seed455` indica que es una ejecucion con semilla fija, util para reproducibilidad y para comparar la varianza entre semillas de una misma configuracion.
- Docencia y divulgacion: sirve como ejemplo minimo y manejable de un pipeline completo de SFT con TRL, entrenable y ejecutable en CPU, para explicar el ciclo de fine-tuning a estudiantes.
- Prototipado de pipelines de inferencia: por su tamano (~0,1 GB), permite probar integraciones con `text-generation-inference`, endpoints compatibles o despliegues ligeros sin coste de GPU.
- Pruebas de cuantizacion: su reducido tamano lo hace util para validar flujos de cuantizacion (por ejemplo, a GGUF o int8) y medir la degradacion de calidad en modelos muy pequenos.
- Generacion de texto en euskera a nivel experimental: podria emplearse para tareas de completado muy simples en dicho idioma, siempre sin expectativas de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 ~156 MB; en FP16/BF16 ~78 MB; en int8 ~39 MB; en int4 ~20 MB. Cifras calculadas a partir de los 39,1 M de parametros.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sirve, aunque resulta sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o telefonos, dado su tamano.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (segun tags), endpoints compatibles; potencialmente llama.cpp/Ollama tras conversion a GGUF, aunque no se documenta conversión oficial. El modelo aparece referenciado en plataformas de despliegue como FriendliAI.
- Latencia y throughput estimados: no disponibles de forma oficial; en hardware moderno un modelo de 39 M de parametros genera del orden de miles de tokens por segundo, pero se trata de una estimacion no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 | 39,1 M | no disponible | no disponible | HuggingFace (183 descargas) | Objeto de esta ficha |
| goldfish-models/eus_latn_10mb | no disponible (modelo base de ~39 M, GPT-2) | no disponible | no disponible | HuggingFace | Modelo base sin ajuste |
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HuggingFace | Variante con 100 MB de datos |
| tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | HuggingFace / FriendliAI | Variante en turco de la misma serie |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus de ~10 MB, es probable que reproduzca los sesgos del corpus, pero no se han publicado analisis al respecto.
- Riesgo de alucinacion: alto. Con 39 M de parametros y un presupuesto de datos muy limitado, la coherencia y el conocimiento factual son previsiblemente muy reducidos.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada; el idioma probable es el euskera (por el modelo base), pero la model card no lo confirma.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar el uso comercial. Debe tratarse como no apto para produccion hasta aclarar la licencia.
- Calidad para produccion: no recomendado. Es un artefacto de investigacion, no un modelo de proposito general.
- Idiomas: no se declaran idiomas soportados en los metadatos oficiales.
- Fecha de publicacion inusual: los metadatos indican 2026, lo que conviene verificar junto con el autor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Ejecucion en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/7zxxnkx1
- Repositorio TRL: https://github.com/huggingface/trl
- Variante con 100 MB de datos: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante en neerlandes: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en turco: https://friendli.ai/models/francesca9805/tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Ficha en FriendliAI (variante relacionada): https://friendli.ai/models/fpadovani/eus-latn-10mb-ppt-Dp-10mb_seed455
- Ficha en LLM Explorer (variante relacionada): https://llm-explorer.com/model/fpadovani%2Feus-latn-10mb-ppt-shuff-dyck-10mb_seed455,7dLUWuy7QdhtQN6cNsbiZR
