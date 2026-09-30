# francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/ita_latn_10mb`, un transformer decoder-only de tipo GPT-2 entrenado sobre 10 MB de texto en italiano (script latino). El ajuste se ha realizado con la librería TRL mediante SFT (supervised fine-tuning) y cuenta con 39.087.104 parametros totales, lo que lo situa en la categoria de modelos ultraligeros (por debajo de los 50 millones de parametros).

El nombre del repositorio revela su naturaleza experimental: el prefijo `ppt` y el sufijo `Dp-100mb-packed-bfdiso_seed455` apuntan a un barrido de hiperparametros y de semillas dentro de un estudio sobre tokenizadores y empaquetado de datos (el run de Weights & Biases esta alojado en el proyecto `new-tokenizers` de la Universidad de Groningen). Existen variantes hermanas del mismo experimento con otras semillas (`seed10`, `seed3407`) y para otros idiomas (por ejemplo, la version `rus-cyrl`), lo que confirma que se trata de una familia de modelos de investigacion mas que de un modelo listo para produccion.

Su relevancia es, por tanto, metodologica y academica: sirve para estudiar como afectan el tokenizador, el empaquetado del dataset y la semilla aleatoria al rendimiento de modelos monolingues de muy bajo coste computacional. No es un modelo competitivo en tareas generativas abiertas ni cuenta con datos publicados de benchmarks, licencia declarada o idiomas soportados mas alla de lo que sugiere su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `safetensors` en precision de entrenamiento) |
| Idiomas soportados | no disponible en la model card; por el identificador `ita-latn` se deduce italiano en script latino |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada integramente del modelo base `goldfish-models/ita_latn_10mb`. El proyecto Goldfish entrena modelos monolingues de tamano reducido para un centenar de idiomas, con vocabularios adaptados a cada script; en este caso, el identificador `ita_latn` indica italiano en alfabeto latino y el sufijo `10mb` hace referencia al volumen de datos de preentrenamiento (10 MB de texto). El modelo no es MoE ni hibrido: es un transformer denso convencional de 39 millones de parametros.

El ajuste fino se ha realizado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, empleando la tecnica SFT. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se aplicaron tecnicas adicionales de alineacion como RLHF o DPO. El nombre `Dp-100mb-packed` sugiere que el corpus de ajuste se empaqueto hasta los 100 MB mediante concatenacion de secuencias (sequence packing), una practica habitual para maximizar la ocupacion de la ventana de contexto, pero este extremo no esta confirmado en la documentacion disponible. El run de entrenamiento es publico en Weights & Biases (proyecto `new-tokenizers`), lo que permitiria inspeccionar curvas de perdida e hiperparametros.

## Capacidades

- Generacion de texto autoregresiva basica en italiano, heredada del modelo base Goldfish y reorientada por el ajuste SFT.
- Razonamiento: no disponible; no hay evidencia de capacidades de razonamiento multi-paso ni de modo `thinking`.
- Codigo y matematicas: no disponible; el modelo no declara entrenamiento especifico en estos dominios y su tamano (39 M de parametros) hace inviable un rendimiento util en ellos.
- Tool calling / function calling: no soportado; no hay plantilla de herramientas ni evidencia de entrenamiento en formato de llamadas a funciones.
- Capacidades de agente y razonamiento multi-paso: no soportadas.
- Multilingue: no disponible; el identificador apunta a uso monolingue en italiano.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Capacidad especial: el pipeline declarado es `text-generation` y las etiquetas indican compatibilidad con `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Investigacion sobre tokenizadores: dado que el modelo pertenece al proyecto `new-tokenizers`, su uso principal es comparar como distintos vocabularios y estrategias de empaquetado afectan a la perdida y a la calidad del texto generado en italiano.
- Reproducibilidad de experimentos academicos: al existir variantes con otras semillas (`seed10`, `seed3407`), permite medir la varianza entre ejecuciones de un mismo protocolo de SFT y cuantificar la sensibilidad del resultado a la semilla.
- Docencia y formacion: es un ejemplo manejable (0,1 GB de repositorio) para ilustrar un ciclo completo de ajuste fino con TRL, inspeccion de pesos `safetensors` y despliegue con `transformers.pipeline`.
- Pruebas unitarias de infraestructura MLOps: su tamano minimo lo convierte en un candidato idoneo para validar pipelines de CI/CD, empaquetado de artefactos, registro de modelos y endpoints de inferencia sin consumir GPU relevante.
- Generacion de texto sintetico de baja calidad para pruebas de carga: util para estresar sistemas de serving (vLLM, TGI, FriendliAI) midiendo tokens por segundo y latencia sin depender de modelos grandes.
- Despliegue en dispositivos con recursos extremadamente limitados: con 39 M de parametros puede ejecutarse en CPU, Raspberry Pi o telefonos, sirviendo como banco de pruebas para inferencia en el borde.
- Experimentos de destilacion o inicializacion: puede actuar como punto de partida o como alumno en estudios de compresion de modelos para italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en ninguna otra prueba estandar para este modelo ni para sus variantes de semilla.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,16 GB en FP32, 0,08 GB en FP16/BF16 y en torno a 0,04 GB en cuantizacion INT4 (calculado sobre 39,09 M de parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna; tambien es viable en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en placas integradas y dispositivos ARM.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (TGI, etiqueta `text-generation-inference`), endpoints compatibles, y proveedores externos como FriendliAI o LLM Explorer; no se documenta soporte GGUF ni distribucion en Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455 (este) | 39,09 M | no disponible | no disponible | HuggingFace | Ajuste SFT con semilla 455 |
| francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | HuggingFace | Misma receta, semilla 10 |
| francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | HuggingFace | Misma receta, semilla 3407 |
| goldfish-models/ita_latn_10mb | no disponible | no disponible | no disponible | HuggingFace | Modelo base monolingue de italiano del proyecto Goldfish |
| francesca9805/rus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,1 M (segun LLM Explorer) | no disponible | no disponible | HuggingFace | Variante para ruso en script cirilico |

No se dispone de resultados de rendimiento comparativos entre estas variantes; la comparacion se limita a la receta de entrenamiento y a la procedencia comun.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; no obstante, un corpus de preentrenamiento de solo 10 MB implica una cobertura tematica y demografica extremadamente limitada, con sesgos de representacion inevitables.
- Riesgo de alucinacion: muy alto, derivado del reducido numero de parametros y del escaso volumen de datos; el modelo carece de conocimientos factuales fiables.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo esta pensado para italiano en script latino; su uso en otros idiomas no esta respaldado ni evaluado.
- Restricciones de licencia: la model card incluye un campo de licencia vacio (`licence: license`), por lo que no existe autorizacion explicita de uso comercial; el hecho de derivar de `goldfish-models/ita_latn_10mb` obliga ademas a verificar la licencia del modelo base.
- Calidad de generacion: sin datos de benchmarks ni evaluaciones humanas, no hay evidencia de que el ajuste SFT mejore al modelo base en tareas utiles.
- Caveat de produccion: la fecha de creacion registrada (2026-09-29) y la ausencia de descargas o interacciones sugieren un artefacto recien publicado y no validado por la comunidad; no deberia desplegarse en entornos productivos sin evaluacion propia.
- Trazabilidad: los hiperparametros de entrenamiento no se detallan en la model card; solo se enlaza el run de Weights & Biases, lo que dificulta la reproduccion exacta fuera de ese proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/ita_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/6vp4164s
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con semilla 10: https://huggingface.co/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con semilla 3407: https://huggingface.co/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en LLM Explorer de la variante en ruso: https://llm-explorer.com/model/francesca9805%2Frus-cyrl-10mb-ppt-Dp-100mb-packed-bfd_seed3407,1CCLllBgdby5Ygr04yVLnj
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/ita-latn-10mb-ppt-dp-100mb-packed-bfd_seed455
