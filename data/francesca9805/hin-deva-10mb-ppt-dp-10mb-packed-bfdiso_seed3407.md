# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

Este modelo es un ajuste fino (SFT) del checkpoint `goldfish-models/hin_deva_10mb`, un modelo de lenguaje de arquitectura tipo GPT-2 entrenado sobre texto en hindi con escritura devanagari. El ajuste lo publica el usuario de HuggingFace `francesca9805` (vinculado a la Universidad de Groningen segun el enlace de Weights & Biases del projecto "new-tokenizers") y se ha realizado con la libreria TRL de HuggingFace. El identificador del modelo (`ppt-Dp-10mb-packed-bfdiso_seed3407`) sugiere una ejecucion experimental concreta con secuencias empaquetadas (packed) y una semilla fija (3407), mas propia de un barrido de hiperparametros o un estudio de tokenizacion que de un modelo orientado a produccion.

Con 39.087.104 parametros (dato real extraido de los pesos safetensors), se trata de un modelo muy pequeno dentro de la categoria de los "small language models". Su relevancia es fundamentalmente academica: sirve como artefacto reproducible de investigacion sobre modelos de bajo recurso, tokenizadores y tecnicas de ajuste supervisado, no como asistente generalista. No tiene descargas ni "likes" en el momento de redactar esta ficha y no publica benchmarks.

La ficha, por tanto, describe un modelo de investigacion: util para experimentar con generacion de texto en hindi, comparar configuraciones de entrenamiento y validar pipelines de TRL, pero con capacidades muy limitadas por su tamano y por el volumen reducido de datos de entrenamiento de su modelo base (10 MB segun el nombre del checkpoint).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (tipo GPT-2, segun las etiquetas `gpt2` del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | hindi en escritura devanagari, inferido del nombre del modelo base (`hin_deva`); no declarado explicitamente en la ficha |
| Licencia | no disponible (la model card incluye un marcador de posicion `licence: license` sin concretar) |
| Formato de pesos | safetensors (tambien compatible con transformers) |
| Tamano del repositorio | 0,1 GB |
| Version de transformers | 4.56.2 |
| Version de TRL | 0.23.0 |
| Fecha de publicacion | 29 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador autorregresivo del estilo GPT-2, heredada del modelo base `goldfish-models/hin_deva_10mb`. La familia "goldfish-models" agrupa checkpoints pequenos entrenados por idioma y escritura con presupuestos de datos reducidos; en este caso el nombre indica hindi (`hin`), escritura devanagari (`deva`) y aproximadamente 10 MB de corpus. No se dispone de informacion detallada sobre la dimension de las capas, el numero de cabezas de atencion, la ventana de contexto efectiva ni el vocabulario del tokenizador empleado.

El ajuste se ha realizado mediante *supervised fine-tuning* (SFT) con TRL 0.23.0, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del checkpoint indica el uso de secuencias empaquetadas (`packed`), una semilla fija (`seed3407`) y alguna variante de precision o formato (`bfd`/`iso`), habitualmente asociada a entornos de reproducibilidad experimental. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo fases posteriores de RLHF o DPO. La model card unicamente enlaza una ejecucion de Weights & Biases del proyecto "new-tokenizers", lo que refuerza la hipotesis de que se trata de un experimento de investigacion sobre tokenizacion y ajuste.

## Capacidades

- Generacion de texto autorregresiva en hindi (devanagari), condicionada a una instruccion o a un prefijo de conversacion.
- Formato de chat basico: la model card muestra un ejemplo con `pipeline("text-generation")` pasando una lista de mensajes con rol `user`, lo que implica una plantilla de dialogo simple.
- Uso como *baseline* reproducible en estudios de SFT y de tokenizacion.
- Compatible con *text-generation-inference* (TGI) y con endpoints de HuggingFace, segun las etiquetas del repositorio.
- No hay evidencia de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, modo "thinking", vision, audio ni matemáticas avanzadas.
- Cobertura multilingue: no declarada; previsiblemente limitada al hindi y, en menor medida, a idiomas con escritura devanagari por transferencia del tokenizador.

## Casos de uso

- Investigacion sobre tokenizadores en lenguas de bajos recursos: el modelo pertenece al proyecto "new-tokenizers" de Weights & Biases, por lo que su uso natural es medir el efecto de distintas estrategias de tokenizacion sobre la perplejidad y la calidad de generacion en hindi.
- *Baseline* en experimentos de ajuste supervisado: permite comparar configuraciones de SFT (con y sin empaquetado de secuencias, distintas semillas, distintas precisiones) manteniendo constante el modelo base.
- Generacion de texto en hindi para prototipos academicos: sirve para probar la viabilidad de completar frases o parrafos cortos en devanagari antes de invertir en un modelo mayor.
- Reproducibilidad de resultados: el uso de una semilla fija (`seed3407`) en el nombre del checkpoint lo hace adecuado para replicar y auditar experimentos de entrenamiento.
- Despliegue en entornos con recursos minimos: con 39 millones de parametros puede ejecutarse en CPU o en GPUs de gama de entrada, lo que permite integrarlo en dispositivos embebidos o en pruebas de CI sin GPU.
- Docencia y formacion: es un ejemplo manejable para ensenar el flujo completo de TRL (carga del modelo base, SFT, publicacion en el Hub y uso con `transformers.pipeline`).
- Validacion de infraestructura de servicio: al ser compatible con TGI y con endpoints de HuggingFace, permite probar pipelines de despliegue (FriendliAI, endpoints compatibles) sin coste elevado de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y 20 MB en int4, calculado a partir de los 39.087.104 parametros y sin contar la cache KV ni las activaciones.
- Consumo realista en memoria: por debajo de 1 GB en fp16 incluso sumando cache KV y activaciones para secuencias cortas, segun el patron habitual de los modelos del orden de 40 millones de parametros.
- GPU recomendadas: no requiere A100, H100 ni RTX 4090; cualquier GPU con 2 GB o mas de VRAM es suficiente, e incluso una CPU moderna puede servir con latencias aceptables.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta actual (GTX 1050 Ti, RTX 3050, RTX 4060, etc.) y tambien en CPU.
- Opciones de despliegue: `transformers.pipeline`, Text Generation Inference (TGI), endpoints compatibles de HuggingFace, vLLM (por tratarse de un transformer decodificador estandar) y plataformas de terceros como FriendliAI. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407` | 39.087.104 | no disponible | no disponible | HuggingFace, safetensors |
| `goldfish-models/hin_deva_10mb` (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407` | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de la familia goldfish-models para distintas lenguas | no disponible | no disponible | no disponible | HuggingFace |

La comparacion cuantitativa no es posible con los datos disponibles: no se publican parametros, contexto ni licencia para los checkpoints alternativos, y no existen benchmarks comparables. La diferencia principal entre este modelo y su base es el ajuste supervisado con TRL, mientras que el checkpoint `hin-deva-100mb-...` de la misma autora parece variar el presupuesto de datos (100 MB frente a 10 MB).

## Limitaciones y advertencias

- Tamano muy reducido (39 millones de parametros) y corpus base de aproximadamente 10 MB: la capacidad de generalizacion, el conocimiento factual y la coherencia en generaciones largas son previsiblemente muy bajos.
- Riesgo elevado de alucinacion: al no disponer de benchmarks ni de evaluaciones, no hay garantia de fidelidad factual en ningun dominio.
- Cobertura idiomatica limitada: el modelo esta orientado al hindi en devanagari; no hay soporte declarado para castellano ni para otros idiomas, y es probable que produzca salidas incorrectas fuera de esa lengua.
- Datos y sesgos no documentados: no se describe la procedencia del corpus de ajuste, por lo que no es posible evaluar sesgos de genero, religion, casta o contenido politico, especialmente sensibles en textos en hindi.
- Licencia sin concretar: la model card incluye un marcador de posicion (`licence: license`), de modo que el uso comercial queda en un limbo legal y no deberia asumirse permisividad.
- Contexto desconocido: al no declararse la ventana de contexto, no se puede planificar su uso en tareas que requieran entradas largas.
- Ausencia de validacion por la comunidad: cero descargas y cero "likes" en el momento de redactar la ficha, sin evaluaciones de terceros ni resultados reproducidos.
- Artefacto de investigacion: el nombre del checkpoint sugiere una configuracion experimental concreta (empaquetado de secuencias, semilla 3407), por lo que probablemente no este optimizado para calidad sino para reproducibilidad de un estudio.
- No apto para produccion sin evaluacion previa: carece de benchmarks, de informacion sobre la plantilla de chat exacta y de garantias de estabilidad en generacion multi-turno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/0pwcf7h2
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo hermano con 100 MB de datos: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Discusiones del modelo: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407/discussions
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Entrada en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-10mb-packed-bfd_seed3407
- Entrada relacionada en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
