# francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

Este modelo es un ajuste fino del modelo monolingue de euskera `goldfish-models/eus_latn_10mb`, un transformer decoder-only de tipo GPT-2 entrenado originalmente sobre aproximadamente 10 MB de texto en euskera. El ajuste lo ha realizado la usuaria `francesca9805` (Francesca Padovani, University of Groningen) mediante entrenamiento supervisado (SFT) con la libreria TRL, dentro de un proyecto de experimentacion sobre tokenizadores (proyecto de Weights & Biases denominado "new-tokenizers"). El resultado es un modelo de 39.087.104 parametros (unos 39 M) que conserva la arquitectura y el tokenizador de su modelo base.

El modelo resuelve un problema de investigacion mas que de produccion: forma parte de una serie de ablaciones controladas (variantes por idioma, tamano de corpus, tipo de tokenizador y semilla) cuyo objetivo es medir como afectan las decisiones de tokenizacion y de preentrenamiento al aprendizaje de modelos pequenos en lenguas con pocos recursos. La semilla `3407` y los sufijos `ppt`, `Dp-10mb-packed` y `bfd` sugieren una configuracion experimental concreta, aunque su significado exacto no esta documentado en la informacion disponible.

Por su tamano (39 M de parametros, 0,1 GB de repositorio) y su naturaleza de artefacto de investigacion, no es un modelo pensado para competicion con LLM actuales, sino como punto de referencia reproducible para estudiar el impacto del tokenizador en una lengua minorizada como el euskera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (segun la libreria y los tags del repositorio) |
| Parametros totales | 39.087.104 (~39 M), dato real de safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma explicita; los pesos se distribuyen en safetensors y serian convertibles a 8-bit, 4-bit o GGUF con herramientas estandar |
| Idiomas soportados | no disponible en la ficha; el modelo base pertenece a la familia `eus_latn` (euskera, escritura latina) |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, heredada integramente del modelo base `goldfish-models/eus_latn_10mb`, que a su vez forma parte de la coleccion Goldfish de modelos monolingues para cientos de lenguas. Sobre esa base se ha aplicado un ajuste fino con `SFTTrainer` de TRL 0.23.0, sobre datos descritos como "packed" (secuencias concatenadas para maximizar el aprovechamiento de la ventana) y con un corpus que el nombre del modelo identifica como `Dp-10mb`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; el tag `sft` apunta a un unico proceso de supervision.

Las versiones de framework declaradas son Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El interes tecnico del modelo no reside en innovaciones de arquitectura (usa atencion estandar y embeddings posicionales aprendidos), sino en su papel como punto de comparacion en experimentos sobre tokenizacion y preentrenamiento en lenguas de bajos recursos. No se documentan innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos.

## Capacidades

- Generacion de texto autoregresiva en euskera, limitada por el tamano del modelo y por los 10 MB de corpus de su base.
- Continuacion de texto y respuestas a instrucciones sencillas cuando se formatean como conversacion, segun el ejemplo de uso de la model card (mensajes con rol `user`).
- Ajuste fino adicional sobre datos propios: al ser un modelo de 39 M, es viable reentrenarlo o adaptarlo en una GPU de gama baja.
- No hay evidencia de soporte de tool calling ni de function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, vision, audio ni modo de "pensamiento" explicito.
- Cobertura multilingue: no documentada; por el identificador `eus_latn` cabe esperar un comportamiento practicamente monolingue en euskera.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo sirve como condicion experimental dentro de una serie de variantes (idioma, tamano de corpus, semilla) para medir el efecto del tokenizador en la calidad del texto generado en euskera.
- Linea base en estudios de lenguas con pocos recursos: permite comparar rapidamente una arquitectura GPT-2 de 39 M frente a variantes de 100 MB o de otros idiomas dentro del mismo pipeline.
- Experimentos de ajuste fino academico: por su tamano, se puede reentrenar con SFT en minutos sobre una unica GPU, lo que facilita repetir experimentos con distintas semillas.
- Generacion de texto en euskera para prototipos internos: util para validar una interfaz o un pipeline antes de invertir en un modelo mayor, asumiendo baja calidad y riesgo alto de alucinacion.
- Pruebas de despliegue en entornos sin GPU: sus ~39 M de parametros permiten ejecutarlo en CPU o incluso en dispositivos embebidos como parte de pruebas de integracion.
- Docencia y divulgacion: sirve para ilustrar de forma reproducible el ciclo completo de preentrenamiento, ajuste con TRL y publicacion en Hugging Face.
- Evaluacion de herramientas de inferencia: con el tag `endpoints_compatible`, puede usarse para verificar integraciones con Text Generation Inference o servicios similares a coste minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplexity, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y los resultados de busqueda solo enlazan repositorios hermanos sin cifras.

## Requisitos de hardware

- VRAM estimada: aproximadamente 80 MB en fp16 y unos 160 MB en fp32, calculado a partir de los 39.087.104 parametros.
- GPU recomendadas: cualquier GPU moderna sirve; no se necesita A100, H100 ni RTX 4090. Una GTX 1050, una iGPU o incluso una CPU son suficientes.
- Cabe holgadamente en cualquier GPU de consumo e integrada, y en placas tipo Raspberry Pi para inferencia por CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (ejemplo de la propia model card), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput: no disponibles de forma oficial; por el tamano, cabe esperar latencias de milisegundos por token y throughput alto incluso en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | ~39 M | no disponible | no disponible | Hugging Face, 183 descargas | Ajuste SFT del base de euskera de 10 MB |
| goldfish-models/eus_latn_10mb | ~39 M (misma familia) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base sin ajuste; referencia directa de comparacion |
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | ~39 M | no disponible | no disponible | Hugging Face | Misma receta con corpus de 100 MB; permite aislar el efecto del tamano de datos |
| fpadovani/eng-latn-10mb-after-ppt-Dp-10mb-packed-ckpt500_seed3407 | ~39 M | no disponible | no disponible | Hugging Face | Variante en ingles del mismo programa experimental; util para comparaciones entre idiomas |

## Limitaciones y advertencias

- Sesgos: un corpus de 10 MB en euskera es muy reducido y probablemente sesgado hacia los dominios y registros presentes en la fuente original (Goldfish); no hay analisis de sesgo publicado.
- Alucinacion: con 39 M de parametros y un corpus minimo, la generacion de hechos sera poco fiable y propensa a incoherencias; no debe usarse para informacion factual sin verificacion.
- Contexto e idioma: se desconoce la longitud de contexto efectiva y la cobertura idiomatica real; cabe esperar un comportamiento casi exclusivamente en euskera y degradacion fuera de ese idioma.
- Licencia: la model card indica `licence: license` sin especificar terminos, por lo que el uso comercial queda en un limbo legal; conviene consultar la licencia del modelo base `goldfish-models/eus_latn_10mb` antes de cualquier uso productivo.
- Trazabilidad: no se documentan el dataset de SFT, el numero de tokens, la duracion del entrenamiento ni criterios de evaluacion, lo que dificulta reproducir el resultado.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) no son coherentes con el ciclo de publicacion habitual; conviene verificar el estado real del repositorio antes de depender de el.
- Uso previsto: es un artefacto de investigacion; no es adecuado como modelo de produccion para atencion al cliente, generacion de codigo o tareas que requieran razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Variante con corpus de 100 MB: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Variante en ingles (mismo programa): https://huggingface.co/fpadovani/eng-latn-10mb-after-ppt-Dp-10mb-packed-ckpt500_seed3407
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/cuv7axbv
- Ficha en friendli.ai: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Ficha en savrn.com: https://savrn.com/models/eng-latn-10mb-after-ppt-dp-10mb-packed-ckpt500-seed3407
