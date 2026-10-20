# Echoo113/Qwen3.5-4B-dragon_L11-STEER0.821875-ft4.43

## Resumen

`Echoo113/Qwen3.5-4B-dragon_L11-STEER0.821875-ft4.43` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-4B`, publicado en Hugging Face por el usuario Echoo113. Segun la model card, el entrenamiento se realizo con TRL 1.10.0 sobre Transformers 5.15.1, PyTorch 2.11.0+cu128 y Datasets 5.0.1. El repositorio usa la libreria `transformers` y distribuye pesos en formato safetensors.

El nombre del repositorio codifica una configuracion concreta: una capa o modulo `L11`, un parametro `STEER0.821875` y un valor `ft4.43`. El autor publica otras variantes con el mismo esquema (`dragon_mlpB-STEER0.109375-ft4.44`, `dragon_Qdose-STEER1.0-ft4.42`), lo que sugiere un barrido de experimentos de steering sobre representaciones internas combinado con ajuste fino. Esta interpretacion es una inferencia a partir de los nombres y no esta documentada en la model card.

Su relevancia es de investigacion, no de produccion: permite reproducir y comparar variantes de un mismo ajuste sobre Qwen3.5-4B, pero carece de licencia declarada, de datos de entrenamiento, de evaluacion y de cualquier traza de uso (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Heredada del modelo base `Qwen/Qwen3.5-4B`; la model card no la describe |
| Parametros totales | ~4 000 M (deducido del identificador del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card incluye un campo `licence: license` sin contenido |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Libreria y framework | `transformers`; entrenado con TRL 1.10.0 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino del modelo `Qwen/Qwen3.5-4B`, del que no se detalla la arquitectura interna (tipo de atencion, numero de capas, dimension oculta ni vocabulario). Segun la ficha publica de Ollama, la familia Qwen 3.5 se describe como un conjunto de modelos multimodales de codigo abierto; no obstante, no hay informacion que confirme que este ajuste conserve la torre visual ni que se haya entrenado con datos multimodales.

El entrenamiento se realizo exclusivamente con SFT mediante TRL 1.10.0. La model card no especifica el dataset utilizado, el numero de tokens, la composicion de los datos, la duracion del entrenamiento ni si hubo etapas posteriores de RLHF o DPO; las secciones de procedimiento aparecen vacias. El sufijo del repositorio (`L11-STEER0.821875-ft4.43`) apunta a una intervencion de steering en una capa concreta con un coeficiente de 0,821875 y a un ajuste con un hiperparametro de valor 4,43, pero no se documenta ni la tecnica exacta ni el significado de cada valor. Tampoco se indica si el resultado se materializo como pesos completos o como un merge de adaptadores, extremo relevante porque el repositorio ocupa solo 0,1 GB, un tamano muy inferior al esperado para un checkpoint denso de ~4 000 M de parametros en bf16 (del orden de 8 GB).

## Capacidades

- Generacion de texto conversacional: la model card unicamente demuestra el uso mediante `pipeline("text-generation")` con un mensaje de rol `user` y `max_new_tokens=128`, sin resultados de ejemplo.
- Razonamiento, codigo y matematicas: no documentado para este checkpoint. Las fuentes publicas de la familia Qwen 3.5 mencionan mejoras en razonamiento, codigo y agentes, pero no existe evaluacion de esta variante concreta.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado; no se declara lista de idiomas.
- Capacidades multimodales (vision, audio): no documentado para este ajuste, pese a que la familia base se describe como multimodal.
- Modo de razonamiento explicito (thinking): no documentado.
- Intervencion de steering sobre activaciones: inferida del nombre del repositorio, sin documentacion tecnica que la describa.

## Casos de uso

- Investigacion en interpretabilidad y steering: el checkpoint sirve como punto de comparacion en barridos de vectores de direccion sobre capas internas, junto a las otras variantes del mismo autor con valores `STEER` distintos. Es su uso mas plausible dado el esquema de nombres.
- Ablacion controlada de ajustes finos: al compartir modelo base y pipeline de entrenamiento con `dragon_mlpB-STEER0.109375-ft4.44` y `dragon_Qdose-STEER1.0-ft4.42`, permite aislar el efecto de la configuracion de steering manteniendo constante el resto del setup.
- Prototipado local de asistentes conversacionales: con ~4 000 M de parametros puede ejecutarse en una GPU de consumo mediante transformers o, tras conversion a GGUF, en llama.cpp u Ollama, siempre que se valide antes la integridad de los pesos.
- Docencia y formacion: util como ejemplo practico de flujo SFT con TRL y de publicacion de checkpoints derivados en Hugging Face.
- Generacion de texto creativo y exploratorio: el prompt de ejemplo de la model card es una pregunta abierta de tipo narrativo, un uso adecuado para un modelo pequeno en experimentacion.
- Pruebas de regresion de pipelines de inferencia: sirve como checkpoint ligero para validar integraciones con transformers, TGI o vLLM antes de desplegar modelos mayores.
- Evaluacion comparativa de calidad de ajuste: permite medir si la intervencion de steering degrada o mejora la coherencia frente al modelo base en un conjunto de prompts propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado evaluaciones independientes del checkpoint. No es posible, por tanto, construir una tabla comparativa de rendimiento con datos reales.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir de un modelo denso de ~4 000 M de parametros, no confirmada para este checkpoint): ~8 GB en bf16/fp16 solo para pesos, mas cache KV; ~4-5 GB en cuantizacion de 8 bits; ~2,5-3,5 GB en 4 bits.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 para inferencia local; A100 o H100 para servir varias peticiones concurrentes con contexto largo.
- Cabe en GPU de consumo: si, en principio en cualquier tarjeta con 8 GB o mas en cuantizacion de 4 u 8 bits, y en 12-16 GB en bf16 con contexto moderado. Verificar antes el apartado de limitaciones.
- Opciones de despliegue: `transformers` (referencia, tal como aparece en la model card), vLLM o TGI si los pesos safetensors estan completos, y llama.cpp u Ollama previa conversion a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint.
- Advertencia de despliegue: el repositorio ocupa 0,1 GB, un tamano incompatible con un checkpoint completo de ~4 000 M de parametros. Comprobar los ficheros (`model.safetensors.index.json`, numero de shards) antes de dimensionar infraestructura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Evaluacion publicada | Descargas |
|---|---|---|---|---|---|---|
| `Echoo113/Qwen3.5-4B-dragon_L11-STEER0.821875-ft4.43` | ~4 000 M (deducido) | No disponible | SFT con TRL | No disponible | No | 0 |
| `Qwen/Qwen3.5-4B` (base) | ~4 000 M (deducido) | No disponible | No documentado en la informacion disponible | No disponible en la informacion disponible | No consultada | No disponible |
| `Echoo113/Qwen3.5-4B-dragon_mlpB-STEER0.109375-ft4.44` | ~4 000 M (deducido) | No disponible | SFT con TRL, steering 0,109375 | No disponible | No | No disponible |
| `Echoo113/Qwen3.5-4B-dragon_Qdose-STEER1.0-ft4.42` | ~4 000 M (deducido) | No disponible | SFT con TRL, steering 1,0 | No disponible | No | No disponible |

Las tres variantes comparten modelo base y metodo de entrenamiento, y solo difieren en la configuracion de steering y en el hiperparametro de ajuste. Sin una evaluacion comun no es posible determinar cual ofrece mejor calidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ejemplos de salida ni validacion por terceros; las 0 descargas y 0 likes indican que el checkpoint no ha sido probado por la comunidad.
- Licencia sin declarar: la model card incluye un placeholder (`licence: license`) y no se especifican terminos de uso comercial. Usar el modelo en produccion o redistribuirlo implica riesgo legal hasta que el autor lo aclare; ademas, los terminos del modelo base Qwen3.5-4B se desconocen en la informacion disponible.
- Pesos posiblemente incompletos: 0,1 GB es un orden de magnitud inferior al tamano esperado de un checkpoint de ~4 000 M de parametros, lo que sugiere adaptadores, shards parciales o un merge no materializado.
- Procedimiento de entrenamiento no documentado: se desconoce el dataset, el volumen de tokens, la composicion, el numero de epochs y si hubo filtrado. No se puede estimar el olvido catastrofico ni el sesgo introducido por los datos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y agravado por la falta de evaluacion; no hay datos de calibracion ni de tasas de error.
- Sesgos conocidos: no documentados. Al desconocerse el dataset de ajuste y los datos del modelo base, no es posible caracterizar sesgos de genero, idioma, cultura o dominio.
- Cobertura idiomatica incierta: no se declara lista de idiomas, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto desconocida: limita el diseno de aplicaciones multi-turno o de recuperacion aumentada.
- Reproducibilidad limitada: el significado de `L11`, `STEER0.821875` y `ft4.43` no esta explicado, por lo que no se puede replicar el experimento a partir de la informacion publicada.
- Fecha de publicacion adelantada (2026-10-19) y ecosistema de dependencias muy reciente (Transformers 5.15.1, PyTorch 2.11.0): puede requerir versiones concretas del entorno para cargar correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Echoo113/Qwen3.5-4B-dragon_L11-STEER0.821875-ft4.43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante hermana `dragon_mlpB-STEER0.109375-ft4.44`: https://huggingface.co/Echoo113/Qwen3.5-4B-dragon_mlpB-STEER0.109375-ft4.44
- Variante hermana `dragon_Qdose-STEER1.0-ft4.42`: https://huggingface.co/Echoo113/Qwen3.5-4B-dragon_Qdose-STEER1.0-ft4.42/tree/main
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha de la familia Qwen 3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio no oficial de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
