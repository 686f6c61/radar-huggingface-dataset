# funnygeeker/Qwen3.8-35B-A3B-Distill-oQ6e-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-oQ6e-mtp es una version cuantizada del modelo que su nombre identifica como una destilacion de la familia Qwen 3.8, con arquitectura MoE (mezcla de expertos) y 35.951.822.704 parametros totales segun el recuento real de safetensors. El repositorio pertenece al usuario funnygeeker y se publico el 17 de septiembre de 2026.

El valor del artefacto no esta en el entrenamiento del modelo, sino en el proceso de cuantizacion: se ha generado con oQ, la herramienta de cuantizacion de precision mixta integrada en oMLX v0.7.0.dev2, en formato MLX safetensors a 6 bits con grupo de 64. Esto lo convierte en un artefacto pensado especificamente para ejecucion local sobre Apple Silicon mediante la libreria MLX, no para servidores CUDA.

Es relevante ahora porque permite desplegar un MoE de ~36B en hardware de consumo Apple con memoria unificada, algo que el modelo en precision completa dificilmente permitiria. La contrapartida es que el repositorio no publica model card de rendimiento, licencia, idiomas ni benchmarks, por lo que cualquier evaluacion seria debe hacerse de forma empirica antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); tipo declarado `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | no disponible (el sufijo "A3B" del nombre sugiere ~3B activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (cuantizacion de precision mixta con oQ / oMLX v0.7.0.dev2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (no se publica GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, segun el tipo de modelo declarado (`qwen3_5_moe`) en la model card del autor. El nombre del repositorio indica que se trata de un modelo destilado y que se ha etiquetado como variante MoE con activacion parcial (convencion "A3B", que en la familia Qwen suele denotar aproximadamente 3.000 millones de parametros activos por token). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica documentada es exclusivamente la cuantizacion: se ha aplicado oQ, el pipeline de cuantizacion de precision mixta de oMLX, que asigna distintos niveles de precision a distintas partes de la red en lugar de usar una cuantizacion uniforme. El resultado se serializa en safetensors con el formato de MLX, con 6 bits por peso y tamano de grupo 64. El sufijo "mtp" del nombre no aparece explicado en la model card, por lo que no se puede confirmar si hace referencia a multi-token prediction u otra caracteristica, y se deja como no disponible.

## Capacidades

- Generacion de texto: capacidad esperable por herencia de la familia Qwen, aunque no se documenta explicitamente en el repositorio.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas en la informacion proporcionada.
- Generacion de codigo: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX safetensors y la libreria declarada.

## Casos de uso

- Inferencia local en Mac para desarrollo: el modelo esta empaquetado en MLX safetensors, por lo que se puede cargar directamente con `mlx-lm` en un Mac con memoria unificada suficiente para experimentar con un MoE de ~36B sin depender de GPUs NVIDIA.
- Prototipado de asistentes conversacionales en local: al ejecutarse en el propio equipo, permite iterar sobre prompts y flujos de dialogo sin coste de API ni envio de datos a terceros.
- Evaluacion comparativa de cuantizacion: sirve como artefacto de referencia para medir la perdida de calidad que introduce una cuantizacion de 6 bits con group size 64 frente al modelo original en precision completa, usando el mismo harness de evaluacion.
- Generacion de texto offline en entornos sin conectividad: al ser un modelo local, es adecuado para escenarios con requisitos de confidencialidad o redes aisladas, siempre que el hardware cumpla los requisitos de memoria.
- Integracion como backend de servidor local: `mlx_lm.server` permite exponer el modelo con una API compatible con OpenAI y conectarlo a herramientas que ya consuman ese formato.
- Investigacion sobre destilacion de MoE: dado que el nombre indica destilacion, puede emplearse para estudiar como se comporta un modelo destilado tras una cuantizacion agresiva, comparando perplejidad y salidas cualitativas.
- Fine-tuning ligero o adaptacion posterior: el formato safetensors es compatible con los flujos de MLX, lo que permitiria aplicar LoRA sobre la version cuantizada, si bien la viabilidad depende de que oMLX exponga soporte para ello (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta los parametros de cuantizacion (6 bits, group size 64, formato MLX safetensors) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se ha recuperado informacion relevante en la busqueda web: los resultados obtenidos no guardan relacion con el modelo. Por tanto, no se presentan cifras y se recomienda evaluar el modelo de forma empirica antes de usarlo.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: con ~35,95B parametros a 6 bits, el peso del modelo ronda los 29-30 GB, coherente con el tamano del repositorio (30,1 GB). Hay que sumar la cache KV, cuyo tamano depende del contexto y del numero de capas, y que no se puede calcular sin conocer la configuracion del modelo.
- GPU recomendadas: no aplica en su formato actual. El modelo esta en MLX safetensors, que es un formato especifico de Apple Silicon; no se puede cargar directamente en CUDA sin una conversion previa.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, requiere un Mac con memoria unificada de al menos 36 GB, y 64 GB o mas para trabajar con contextos largos y margen suficiente. No cabe en GPUs de consumo con 8, 12 o 16 GB de VRAM, ni siquiera en una RTX 4090 de 24 GB, por el tamano del artefacto.
- Opciones de despliegue: MLX (`mlx-lm`), oMLX, y `mlx_lm.server` para exponer una API. vLLM, TGI, llama.cpp y Ollama no son compatibles de forma directa con MLX safetensors; requeririan conversion a otro formato, y en el caso de llama.cpp haria falta generar un GGUF, que el autor no publica.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas y dependen por completo del chip Apple, la memoria disponible y la longitud de contexto.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa rigurosa, ya que no se publican benchmarks ni configuracion de contexto del modelo. Se ofrece una referencia orientativa frente a otros MoE abiertos de tamano comparable.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-oQ6e-mtp | ~35,95B | no disponible | no disponible | no disponible | MLX safetensors 6 bits |
| Qwen3-30B-A3B | ~30B (referencia) | ~3B (referencia) | no verificado en esta ficha | no disponible | safetensors / GGUF |
| Qwen3-235B-A22B | ~235B (referencia) | ~22B (referencia) | no verificado en esta ficha | no disponible | safetensors / GGUF |

Las filas de modelos comparables se incluyen solo como orientacion de categoria y no deben tomarse como datos verificados en esta ficha. La diferencia practica principal de este repositorio es que es el unico de los tres empaquetado especificamente para MLX y a 6 bits.

## Limitaciones y advertencias

- Ausencia total de model card funcional: sin licencia, idiomas, contexto ni benchmarks, no es posible validar su idoneidad para produccion sin una evaluacion propia.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 6 bits con group size 64 introduce una perdida de calidad respecto a la version completa que no esta cuantificada en el repositorio. En tareas de razonamiento y codigo es donde este efecto suele notarse mas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. Al no haber evaluaciones publicadas, no se puede acotar su magnitud en este artefacto.
- Limitaciones de contexto e idioma: desconocidas. El campo de idiomas esta vacio y no se publica la longitud de contexto soportada.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, lo que impide determinar si el uso comercial esta permitido. Ademas, al tratarse de una destilacion de un modelo de la familia Qwen, habria que verificar la licencia del modelo base.
- Procedencia y confianza: el repositorio tiene 0 descargas y 0 likes, y no aporta mas trazabilidad que la referencia a oMLX. Se desconoce si el proceso de destilacion y cuantizacion ha sido validado.
- Dependencia de plataforma: al estar en MLX safetensors, el despliegue queda limitado a hardware Apple Silicon, lo que excluye la mayoria de infraestructuras de servidor convencionales.
- Fecha de publicacion futurista (2026): conviene verificar la coherencia temporal del repositorio y del ecosistema del que depende antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/funnygeeker/Qwen3.8-35B-A3B-Distill-oQ6e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre el modelo; los resultados obtenidos versaban sobre gestion de canales de YouTube y no aportan informacion tecnica.
