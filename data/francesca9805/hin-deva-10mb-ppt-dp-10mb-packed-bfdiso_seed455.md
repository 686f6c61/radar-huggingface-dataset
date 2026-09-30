# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino de generacion de texto publicado en HuggingFace por el usuario `francesca9805`. Se construye sobre `goldfish-models/hin_deva_10mb`, un modelo base de la familia Goldfish orientado a una unica lengua de bajos recursos, y ha sido entrenado mediante SFT (supervised fine-tuning) con la libreria TRL. Cuenta con 39.087.104 parametros (aproximadamente 39,1 millones) y un repositorio de 0,1 GB en formato `safetensors`.

Se trata de un modelo de investigacion, no de un modelo de proposito general listo para produccion. El identificador del modelo base (`hin_deva`) sugiere que el objetivo linguistico es el hindi en escritura devanagari, y el sufijo `10mb` apunta a un corpus de entrenamiento de 10 MB, mientras que `Dp-10mb-packed-bfdiso_seed455` parece referirse a una configuracion experimental concreta (data parallel, datos empaquetados, precision bf16 y una semilla fija). La model card no documenta estos detalles de forma explicita.

Su relevancia es metodologica mas que de rendimiento: forma parte de una serie de experimentos de ajuste fino reproducible sobre modelos monolingues pequenos, con seguimiento en Weights & Biases, y resulta util como linea base en estudios de tokenizacion, empaquetado de datos y escalado de corpus en lenguas de bajos recursos. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio; sin detalle adicional publicado) |
| Parametros totales | 39.087.104 (aprox. 39,1 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos `safetensors`; no se documentan versiones GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible en los metadatos; el identificador del modelo base (`hin_deva`) sugiere hindi en escritura devanagari, sin confirmacion oficial |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La unica referencia arquitectonica disponible es la etiqueta `gpt2` del repositorio, que apunta a un transformer decoder-only con atencion causal, habitual en la familia de modelos base de Goldfish. No se publican en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tamano de vocabulario ni la ventana de contexto efectiva. Tampoco se documenta si se anadio algun token especial o si el tokenizador fue modificado. Dado que el modelo base es `goldfish-models/hin_deva_10mb`, las caracteristicas completas del preentrenamiento original deben consultarse en ese repositorio.

El ajuste fino se realizo con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la funcion de perdida ni si se aplicaron tecnicas adicionales como DPO, RLHF o decodificacion especulativa. El sufijo `bfdiso` del nombre sugiere entrenamiento en bf16 y `packed` apunta a empaquetado de secuencias, pero se trata de inferencias a partir del identificador, no de datos confirmados. El entrenamiento esta registrado en un run publico de Weights & Biases.

## Capacidades

- Generacion de texto autorregresiva en la lengua del modelo base, presumiblemente hindi en devanagari.
- Ajuste por instrucciones mediante SFT, con el formato de prompt conversacional que usa la libreria TRL (la propia model card muestra un ejemplo con `pipeline("text-generation")` y una lista de mensajes con rol `user`).
- Generacion de texto creativo o abierto: el ejemplo de la model card es una pregunta abierta ("si tuvieras una maquina del tiempo...").
- Capacidad multilingue: no disponible; todo indica que el modelo esta especializado en una unica lengua y no se documenta transferencia entre idiomas.
- Tool calling / function calling: no disponible, y no es esperable en un modelo de 39 M de parametros.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no.
- Modo "thinking" explicito: no.

## Casos de uso

- Linea base en estudios de ajuste fino e instrucciones: sirve como referencia reproducible (semilla 455) para comparar el efecto de distintos corpus, tokenizadores o estrategias de empaquetado de datos en modelos monolingues de 39 M de parametros.
- Investigacion sobre tokenizacion en escrituras no latinas: permite medir la fertilidad del tokenizador y la perplejidad sobre devanagari con un modelo de coste computacional minimo.
- Experimentos sobre escalado de corpus en lenguas de bajos recursos: al existir variantes hermanas con corpus de 10 MB y 100 MB, facilita estudiar la curva de rendimiento frente al tamano de datos.
- Pruebas de infraestructura y CI: su tamano (0,1 GB) permite ejecutar pipelines completos de carga, inferencia y evaluacion en CPU o en una GPU de gama baja dentro de segundos, util para validar integraciones con Transformers, TRL o text-generation-inference.
- Docencia y material formativo: adecuado para demostrar de principio a fin el ciclo de vida de un ajuste fino con TRL sin necesidad de hardware especializado.
- Generacion de texto asistida de baja latencia en un dominio muy acotado: con una ventana de contexto corta y un corpus de 10 MB, solo es realista para completar fragmentos de texto muy similares a los datos de entrenamiento, no para asistencia general.
- Ablaciones de hiperparametros: el sufijo `seed455` permite integrarlo en barridos de semillas para medir la varianza del entrenamiento SFT en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se ha localizado ninguna evaluacion independiente del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 39,1 M de parametros, sin contar cache KV ni activaciones): aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y unos 20 MB en int4.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100 ni H100. Tambien funciona en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas modernas, y en dispositivos de borde con memoria limitada.
- Opciones de despliegue confirmadas por los metadatos del repositorio: `transformers` (pipeline de `text-generation`), `text-generation-inference` y endpoints compatibles. El repositorio tambien aparece indexado en el proveedor FriendliAI.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI autogestionado): no confirmadas en la informacion disponible; no se publican pesos GGUF.
- Latencia y throughput: no disponibles. Dado el tamano, se espera decodificacion en el orden de miles de tokens por segundo en GPU moderna, pero no hay mediciones publicadas que lo respalden.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed455` | 39,1 M | no disponible | no disponible | no disponible | Repositorio publico, 0 descargas |
| `goldfish-models/hin_deva_10mb` (modelo base) | no disponible | no disponible | no disponible | no disponible | Repositorio publico |
| `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455` | no disponible | no disponible | no disponible | no disponible | Repositorio publico |
| `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10` | no disponible | no disponible | no disponible | no disponible | Repositorio publico |
| `fpadovani/hin-deva-10mb-ppt-Dp-100mb_seed10` | no disponible | no disponible | no disponible | no disponible | Repositorio publico |

Las variantes listadas parecen formar parte de la misma matriz experimental (distintos tamanos de corpus y distintas semillas) y el usuario de Weights & Biases asociado al entrenamiento (`f-padovani-university-of-groningen`) sugiere un mismo origen, aunque la informacion disponible no confirma la equivalencia entre cuentas. No se dispone de datos de rendimiento de ninguna de ellas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de 10 MB en una unica lengua implica una cobertura tematica y demografica muy reducida, con riesgo alto de reproducir estereotipos presentes en la fuente.
- Riesgo de alucinacion: elevado en terminos relativos. Con 39 M de parametros y un corpus minimo, el modelo genera continuaciones plausibles a nivel superficial pero sin conocimiento factual fiable.
- Limitaciones de contexto: la ventana de contexto no esta documentada; en modelos de esta familia suele ser corta, lo que limita el dialogo multi-turno y la generacion de documentos largos.
- Limitaciones de idioma: no hay confirmacion oficial de los idiomas soportados. Fuera de la lengua objetivo (presumiblemente hindi en devanagari) el comportamiento es impredecible.
- Restricciones de licencia: la licencia no esta especificada (la model card contiene un marcador de posicion `licence: license`). Sin una licencia explicita, no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia de validacion: 0 descargas y 0 "likes", sin benchmarks ni evaluaciones de terceros. No hay evidencia publica de calidad, seguridad o robustez.
- Aviso de produccion: no se recomienda su uso en sistemas orientados a usuarios finales. Esta pensado como artefacto de investigacion y como linea base experimental.
- Fechas de creacion y actualizacion: los metadatos indican creacion el 29 de septiembre de 2026 y actualizacion el mismo dia, con apenas cuatro minutos de diferencia; conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/dm4dj2ch
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana (corpus de 100 MB): https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana (datos empaquetados de 100 MB, semilla 10): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed455
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
