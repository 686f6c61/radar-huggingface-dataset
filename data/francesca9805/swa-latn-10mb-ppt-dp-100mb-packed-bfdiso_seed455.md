# francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/swa_latn_10mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros totales (aproximadamente 39 millones), lo que lo situa en la gama de modelos pequenos orientados a experimentacion y a lenguas de bajos recursos.

El modelo base pertenece a la familia Goldfish, una coleccion de modelos multilingues entrenados especificamente para lenguas de bajos recursos; el sufijo `swa_latn` indica que la variante corresponde al suajili (swahili) en escritura latina, con un corpus de entrenamiento del orden de 10 MB. El presente modelo ha sido reentrenado mediante aprendizaje supervisado (SFT) con la libreria TRL sobre un conjunto de datos "packed" de 100 MB, segun se deduce del propio nombre del repositorio.

Su relevancia es fundamentalmente de investigacion: se trata de un artefacto experimental de bajo peso (0,1 GB de repositorio) con cero descargas y cero interacciones en el momento de redactar esta ficha, por lo que no debe considerarse un modelo listo para produccion. La informacion publica disponible es muy limitada: no se declaran idiomas, licencia ni resultados de evaluacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 39.087.104 (aproximadamente 39 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; al ser safetensors puede convertirse a GGUF/INT8/INT4 con herramientas externas |
| Idiomas soportados | No declarados oficialmente; el nombre del modelo base (`swa_latn`) sugiere suajili en escritura latina |
| Licencia | No disponible (la model card contiene un marcador de posicion `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal como indica la etiqueta `gpt2` del repositorio y el pipeline `text-generation`. Con 39 millones de parametros, se trata de una configuracion compacta dentro de la familia GPT-2 (cuya variante "small" estandar ronda los 124 millones), coherente con los modelos Goldfish orientados a lenguas de bajos recursos con presupuestos de computo reducidos. No se dispone de informacion detallada sobre el numero de capas, dimensiones de embedding, cabezas de atencion ni la longitud de contexto efectiva.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. Segun el nombre del modelo, el ajuste se llevo a cabo sobre un dataset "packed" de 100 MB (frente a los 10 MB del modelo base), con una semilla fija (`seed455`), y presumiblemente con una fraccion de dropout indicada como `Dp`. No se especifica la composicion del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO. La unica traza de entrenamiento disponible es una ejecucion publica de Weights & Biases.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo GPT-2 pequeno ajustado con SFT.
- Modelado de lenguaje en suajili (escritura latina) de forma probable, segun el modelo base, aunque no confirmado en la informacion disponible.
- Capacidad multilingue limitada y no documentada; no hay evidencia de soporte fiable en castellano u otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", capacidades de vision ni de audio.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Investigacion sobre tokenizacion y empaquetado de datos (packing): el nombre del modelo sugiere que forma parte de un barrido experimental sobre estrategias de construccion de corpus; puede utilizarse como linea base reproducible con una semilla fija.
- Experimentos academicos sobre lenguas de bajos recursos: permite estudiar el efecto del ajuste fino sobre un modelo Goldfish de 10 MB usando un corpus ampliado a 100 MB en suajili.
- Pruebas de reproducibilidad de pipelines SFT con TRL: al declarar versiones exactas de TRL, Transformers, PyTorch y Datasets, sirve como referencia para validar entornos de entrenamiento.
- Generacion de texto de baja latencia en entornos con recursos minimos: con 39 M de parametros, puede ejecutarse en CPU o en GPUs integradas para demos y prototipos.
- Educacion y divulgacion: util como ejemplo didactico de modelo GPT-2 pequeno ajustado por SFT y desplegable mediante la libreria transformers.
- Comparacion de semillas en estudios de variabilidad: el sufijo `seed455` permitiria contrastarlo con otras ejecuciones del mismo autor (por ejemplo, `seed10`) para analizar la varianza del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 unos 156 MB de pesos, en FP16/BF16 unos 78 MB, en INT8 unos 39 MB y en INT4 unos 20 MB (calculado a partir de 39.087.104 parametros; no incluye activaciones ni cache de clave-valor).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere modelos de gama alta como A100 o H100. Una NVIDIA RTX 3060, RTX 4090 o incluso GPU integradas pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1 GB de memoria libre, e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes), y conversion a llama.cpp/Ollama via GGUF aunque no se distribuyan pesos en ese formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455 | 39 M | No disponible | No disponible | HuggingFace (0 descargas) |
| goldfish-models/swa_latn_10mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace |
| francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 (variante hermana) | No disponible | No disponible | No disponible | HuggingFace |
| goldfish-models (otras variantes de lengua) | Variable | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre un corpus de bajos recursos y de dominio no especificado, es probable que herede sesgos del dataset original.
- Riesgo de alucinacion: elevado en un modelo de 39 M de parametros, con conocimiento factual muy limitado y tendencia a generar texto incoherente fuera de su dominio de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte multilingue es presumiblemente reducido y centrado en suajili, con rendimiento escaso en castellano.
- Restricciones de licencia: la licencia no esta disponible, lo que impide determinar si se permite el uso comercial; se recomienda tratar el modelo como no apto para produccion hasta que el autor aclare la licencia.
- Caveat de produccion: cero descargas y cero interacciones, ausencia de evaluacion publicada y un marcador de posicion de licencia sin contenido son senales de que se trata de un artefacto experimental, no de un modelo validado.
- Fecha de creacion declarada como 2026-09-30, posterior a la redaccion habitual de fichas; puede tratarse de un error de metadatos o de un repositorio de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/q8p68rvr
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana (semilla distinta): https://huggingface.co/francesca9805/swa-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/swa-latn-10mb-ppt-dp-100mb-packed-bfd_seed455
- Ficha en friendli.ai (variante de 10 MB): https://friendli.ai/models/francesca9805/swa-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455
