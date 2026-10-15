# francesca9805/nor-latn-100mb-10mb_seed455

## Resumen

`francesca9805/nor-latn-100mb-10mb_seed455` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/nor_latn_100mb`, un transformer decoder-only de tipo GPT-2 con aproximadamente 125 millones de parametros orientado al noruego escrito en alfabeto latino (etiqueta `nor-latn`). El autor del ajuste es el usuario de HuggingFace `francesca9805`, y el entrenamiento se ha realizado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0.

El modelo pertenece a la familia de experimentos Goldfish, que entrena modelos monoculturales y monolingues de ~125M de parametros con solo 100 MB de texto por idioma, con el objetivo de estudiar el comportamiento de modelos pequenos en lenguas de bajos recursos. En este caso, el ajuste se ha hecho sobre 10 MB de datos adicionales (segun la nomenclatura `10mb` del nombre) con semilla 455, lo que lo convierte en una pieza de investigacion sobre tokenizacion y ajuste fino mas que en un modelo listo para produccion.

Su relevancia actual es limitada como modelo de proposito general: se trata de una variante experimental, sin descargas ni likes en el momento de la ficha, sin licencia declarada y sin idiomas oficialmente documentados. Resulta util como referencia academica para estudiar el efecto del ajuste supervisado en modelos GPT-2 pequenos para noruego, y como material reproducible en el contexto del proyecto de tokenizadores del autor (visible en el enlace a Weights & Biases).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun tag `gpt2`) |
| Parametros totales | 124.770.816 (~125M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Goldfish usa el estandar GPT-2, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; pesos publicados en precision completa en `safetensors` |
| Idiomas soportados | no disponible oficialmente; el nombre sugiere noruego en alfabeto latino (`nor-latn`) |
| Licencia | no disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nor_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 3.0 GB |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con ~124,8 millones de parametros, que es el tamano tipico de la serie Goldfish (modelos monolingues entrenados con 100 MB de corpus por idioma). No se documentan innovaciones arquitectonicas propias: se trata de un modelo denso, sin mezcla de expertos, sin atencion lineal ni decodificacion especulativa declarada.

El entrenamiento de este checkpoint se ha realizado mediante SFT con la libreria TRL (version 0.23.0), partiendo del modelo base `goldfish-models/nor_latn_100mb` y anadiendo un ajuste sobre 10 MB de datos (indicado en el propio nombre del modelo). La semilla de entrenamiento es 455. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases adicionales de RLHF o DPO. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new_tokenizers`, lo que apunta a que el objetivo del experimento esta relacionado con la evaluacion de tokenizadores para noruego.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (presumiblemente noruego escrito en alfabeto latino).
- Ajuste supervisado orientado a seguir instrucciones simples en formato conversacional: el ejemplo de la model card usa una lista de mensajes con `role: user`.
- Integrable con la libreria `transformers` mediante `pipeline("text-generation", ...)`.
- Etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, lo que permite exponerlo como endpoint HTTP.
- Compatible con TRL, por lo que puede reutilizarse como punto de partida en pipelines de SFT/DPO.
- No se declara soporte de tool calling, function calling, agentes multi-paso, razonamiento explicito (thinking mode), vision, audio ni capacidades multimodales.
- El soporte multilingue no esta documentado; el nombre del modelo sugiere un ambito monolingue noruego.

## Casos de uso

- Investigacion academica sobre tokenizacion para lenguas de bajos recursos: el modelo forma parte de una serie de experimentos (`new_tokenizers`) en los que se comparan variantes de tokenizador sobre corpus noruego de 10 MB y 100 MB. Se usaria como baseline reproducible en articulos o tesis.
- Evaluacion comparativa de tecnicas de SFT en modelos GPT-2 pequenos: al existir varias variantes con la misma semilla y distinto corpus (`10mb`, `100mb`, `packed`, `Dp`, etc.), sirve para medir el efecto del preprocesado y del tamano del dataset.
- Generacion de texto de prueba en noruego: util para prototipar demos de generacion de texto en noruego sin coste de GPU elevado, dado el reducido tamano del modelo.
- Docencia y practicas de ajuste fino: su tamano (~125M) permite entrenarlo y evaluarlo en una unica GPU consumer, lo que lo hace adecuado para cursos de NLP y talleres sobre TRL.
- Pruebas de integracion de pipelines de inferencia: al ser compatible con `text-generation-inference` y con `transformers`, puede usarse como modelo "dummy" para validar infraestructura de despliegue antes de pasar a modelos grandes.
- Analisis de sesgos y calidad linguistica en corpus noruegos: permite estudiar que tipo de noruego aprende un modelo entrenado exclusivamente con 100 MB de texto mas 10 MB de ajuste.
- Reproduccion de experimentos con semilla fija: la semilla 455 esta en el nombre del modelo, lo que facilita la replicacion exacta del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y los resultados de busqueda web no aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,5 GB solo para pesos (124,8M x 4 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB de pesos, por lo que es viable incluso en GPUs integradas o Apple Silicon.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es mas que suficiente; tambien A100 o H100 si se quiere servir con mucho paralelismo, aunque estan sobredimensionadas para este tamano.
- Si cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, e incluso en CPU con latencias aceptables.
- Opciones de despliegue: `transformers` (pipeline nativo), `text-generation-inference` (segun los tags del repositorio), endpoints compatibles con la API de inferencia. No se documenta compatibilidad con llama.cpp, Ollama o GGUF, ya que solo se publican pesos en `safetensors`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nor-latn-100mb-10mb_seed455 | 124,8M | no disponible | noruego (presumible) | no disponible | HuggingFace (0 descargas, 0 likes) |
| goldfish-models/nor_latn_100mb | ~125M | no disponible | noruego | no disponible (familia Goldfish, uso de investigacion) | HuggingFace |
| Variantes del mismo autor (`nor-latn-10mb-100mb_seed455`, `nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455`, etc.) | ~125M | no disponible | noruego | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, idioma y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de investigacion: sin descargas ni adopcion, sin licencia declarada y sin idiomas oficialmente documentados; no es apto para uso en produccion sin una evaluacion previa exhaustiva.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera de los dominios cubiertos por el corpus de 100 MB + 10 MB de ajuste, dado el reducido volumen de datos de entrenamiento.
- Capacidad linguistica limitada: un modelo de 125M entrenado con 100 MB de texto no alcanza la fluidez ni la cobertura lexica de modelos multilingues grandes; es previsible un vocabulario y una sintaxis restringidos.
- Ambito muy probablemente monolingue (noruego); no hay evidencia de transferencia a castellano ni a otros idiomas.
- Sin datos publicos sobre sesgos: no se documenta ninguna evaluacion de sesgo de genero, etnico, politico o religioso.
- Licencia no disponible: no se puede confirmar el uso comercial permitido. Conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Sin benchmarks publicados: no hay forma de comparar su calidad objetivamente con otros modelos de la misma categoria.
- Longitud de contexto no confirmada en la informacion disponible: asumir un contexto grande (por ejemplo, 8K o mas) seria un error; los modelos GPT-2 pequenos suelen limitarse a ventanas cortas.
- El repositorio ocupa 3,0 GB pese a que los pesos en fp32 deberian rondar los 0,5 GB, lo que sugiere que puede contener checkpoints adicionales u otros artefactos; conviene revisar el contenido antes de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-100mb-10mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/v1ze1ben
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada: https://huggingface.co/francesca9805/nor-latn-10mb-100mb_seed455
- Variante relacionada: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Endpoint en FriendliAI (referencia de despliegue): https://friendli.ai/models/francesca9805/nor-latn-100mb-100mb_seed455
- Ficha en free2aitools (registro de la variante hermana): https://free2aitools.com/model/francesca9805/nor-latn-10mb-after-ppt-shuff-dyck-100mb-ckpt500_seed455
