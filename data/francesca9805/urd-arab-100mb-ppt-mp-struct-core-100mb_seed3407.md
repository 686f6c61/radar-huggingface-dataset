# francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed3407

## Resumen

El modelo `francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/urd_arab_100mb`, un modelo monolingue de la familia Goldfish desarrollada por el grupo de investigacion de la Universidad de Groningen. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros (aproximadamente 124,8 millones), lo que lo situa en la categoria de modelos pequenos orientados a recursos limitados y a la investigacion de tokenizacion multilingue.

El ajuste se ha realizado con la libreria TRL (version 0.23.0) mediante aprendizaje supervisado (SFT), segun indica la propia model card. El identificador del modelo sugiere un experimento sistematico sobre tokenizacion y estructura de datos de entrenamiento (sufijos `ppt`, `mp`, `struct`, `core` y semillas como `seed3407`), coherente con el proyecto de Weights & Biases vinculado, denominado `new-tokenizers`.

Su relevancia actual es fundamentalmente academica y experimental: se trata de una variante mas dentro de una bateria de ejecuciones con distintas semillas y configuraciones, no de un modelo orientado a produccion. La ausencia de licencia declarada, de idiomas especificados y de datos de benchmarks limita su uso fuera del ambito de investigacion comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele operar con 1024 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el nombre del modelo base, `urd_arab`, apunta a urdu en escritura arabe, sin confirmacion en la model card) |
| Licencia | no disponible (la model card incluye el marcador `licence: license` sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, con 124,77 millones de parametros. El modelo parte de `goldfish-models/urd_arab_100mb`, un modelo monolingue perteneciente a la coleccion Goldfish, que entrena modelos independientes para cientos de idiomas sobre corpus de aproximadamente 100 MB de texto por idioma. El sufijo `100mb` del nombre hace referencia a ese volumen de datos de preentrenamiento del modelo base.

Sobre esa base se ha aplicado un ajuste fino supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas posteriores como DPO o RLHF. El identificador del modelo (`ppt-mp-struct-core`) sugiere experimentos sobre preprocesado y estructura del corpus, y el enlace a Weights & Biases apunta al proyecto `new-tokenizers` de la Universidad de Groningen, lo que indica que el objetivo del entrenamiento era comparar variantes de tokenizacion mas que maximizar capacidades generales.

## Capacidades

- Generacion de texto autoregresiva basica, orientada a prompts conversacionales de un solo turno, como muestra el ejemplo de `pipeline` de la model card.
- Formato de chat: la model card emplea una lista de mensajes con rol `user`, lo que sugiere que el ajuste SFT uso una plantilla conversacional, aunque no se documenta la plantilla exacta.
- Capacidad multilingue: no confirmada. El modelo base esta etiquetado como monolingue (`urd_arab`), por lo que no cabe esperar competencia general en otros idiomas.
- Razonamiento complejo, matematicas y codigo: no documentados ni respaldados por benchmarks.
- Tool calling / function calling: no soportado ni documentado.
- Comportamiento agentico o razonamiento multi-paso: no documentado.
- Vision o audio: no soportado (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo forma parte de una serie de ejecuciones con distintas semillas y configuraciones de preprocesado, por lo que su uso natural es comparar el efecto de cada variante sobre la calidad de generacion en urdu.
- Reproducibilidad de experimentos academicos: al fijar la semilla en el nombre (`seed3407`), permite replicar condiciones exactas de entrenamiento en estudios comparativos.
- Generacion de texto en urdu para evaluacion linguistica: se puede usar para producir texto sintetico y analizar fluidez, morfologia o cobertura lexica con hablantes nativos como evaluadores.
- Analisis de sesgos en modelos monolingues de bajo recurso: su tamano reducido permite ejecutar barridos de prompts masivos en CPU o GPU de gama baja para estudiar sesgos en la salida.
- Prototipado rapido de interfaces conversacionales en entornos sin GPU: con 124,8 millones de parametros cabe en cualquier portatil, lo que permite validar flujos de chat antes de invertir en modelos mayores.
- Docencia y practicas de ajuste fino: es un ejemplo util para ensenar el flujo completo de SFT con TRL, desde la carga del modelo base hasta la publicacion en HuggingFace.
- Baseline en experimentos de destilacion o comparacion de arquitecturas: sirve como referencia de tamano pequeno frente a modelos mayores entrenados en el mismo idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes en urdu), y el repositorio no presenta ningun otro dato cuantitativo de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32, 250 MB en FP16/BF16, 125 MB en INT8 y en torno a 60-65 MB en INT4 (estimaciones teoricas a partir de los 124,77 millones de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti, una T4 o incluso una iGPU moderna pueden servirlo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU sin dificultad.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (tag `text-generation-inference` en el repositorio), endpoints compatibles (tag `endpoints_compatible`) y FriendliAI, que lista el modelo para servir via API. Ollama y llama.cpp requeririan conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en una GPU moderna la generacion de 128 tokens nuevos deberia completarse en decenas de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| `francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed3407` | 124,77 M | no disponible | no disponible (base: urdu en escritura arabe) | no disponible | HuggingFace, FriendliAI | no disponible |
| `goldfish-models/urd_arab_100mb` (modelo base) | no disponible en la informacion proporcionada (familia Goldfish de ~124 M) | no disponible | urdu (escritura arabe) | no disponible | HuggingFace | no disponible |
| `francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed455` (misma serie, otra semilla) | no disponible | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | ingles | MIT (licencia del modelo original de OpenAI) | HuggingFace, multiples runtimes | benchmarks publicos en ingles, no comparables directamente |

No se dispone de datos de rendimiento de ninguna de las variantes de la serie, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de licencia: el campo aparece como `licence: license` sin contenido, lo que deja el uso comercial en un limbo legal. No debe desplegarse en produccion sin aclarar la licencia con el autor.
- Idiomas sin declarar: la model card no especifica idiomas soportados. El modelo base sugiere urdu, pero no hay confirmacion oficial, y el ajuste SFT podria haber alterado o reducido esa competencia.
- Riesgo de alucinacion: con 124,8 millones de parametros y un corpus base de 100 MB, la capacidad de generar hechos correctos es muy limitada. Es esperable la produccion de contenido factualmente incorrecto, especialmente fuera del dominio del ajuste.
- Sesgos: no hay evaluacion de sesgos publicada. Los corpus de bajo recurso suelen arrastrar sesgos de las fuentes de origen, amplificados por el reducido volumen de datos.
- Contexto corto: si se confirma la ventana estandar de GPT-2 (1024 tokens), no es adecuado para conversaciones largas, resumen de documentos extensos ni tareas que requieran memoria de contexto amplia.
- Sin benchmarks ni evaluacion humana: no existen metricas que respalden calidad, utilidad o seguridad, lo que impide estimar su rendimiento real frente a alternativas.
- Metadatos incompletos: el repositorio es un artefacto de investigacion con cero descargas y cero interacciones en el momento de redactar esta ficha, lo que reduce la probabilidad de que haya sido validado por terceros.
- Sin soporte de herramientas ni agentes: no implementa function calling ni razonamiento multi-paso, por lo que no es apto para pipelines agenticos.
- Denominacion confusa: comparte prefijo con multiples variantes (`seed455`, `seed10`, `ckpt500`, `after-ppt-...`), lo que facilita seleccionar por error una version no deseada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-core-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_100mb
- Variante con otra semilla: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed455
- Variante de checkpoint: https://huggingface.co/francesca9805/urd-arab-100mb-after-ppt-mp-struct-100mb-ckpt500_seed3407
- Variante seed10: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed10
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4yp6m7qz
- Repositorio de TRL: https://github.com/huggingface/trl
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed3407
- Ficha de catalogo en Free2AITools: https://free2aitools.com/model/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed10
