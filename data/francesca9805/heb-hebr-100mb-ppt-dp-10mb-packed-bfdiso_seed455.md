# francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfdiso_seed455` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/heb_hebr_100mb`, un transformer de tipo GPT-2 entrenado para hebreo. El ajuste se ha realizado mediante aprendizaje supervisado (SFT) con la librería TRL, dentro de lo que parece ser una serie de experimentos reproducibles identificados por una semilla concreta (`seed455`). Cuenta con 124.770.816 parámetros (~124,8 M) y un repositorio de 0,3 GB en formato safetensors.

Por su nomenclatura, el modelo forma parte de un barrido experimental (proyecto de Weights & Biases denominado `new-tokenizers`, asociado a la Universidad de Groningen) en el que se varían factores como el tamaño del dataset (10 MB frente a 100 MB), el empaquetado de secuencias (`packed`) y otros parámetros (`Dp`, `bfdiso`, `seed`). No se trata, por tanto, de un modelo de producción, sino de un artefacto de investigación para comparar configuraciones de entrenamiento.

Su relevancia es limitada y muy específica: sirve como punto de comparación en estudios sobre tokenización, empaquetado de datos y su efecto en modelos pequeños de un solo idioma. La model card es mínima, no documenta licencia, idiomas, contexto ni resultados de evaluación, y el repositorio registra 0 descargas y 0 likes, lo que indica que no ha tenido adopción pública en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun el tag `gpt2`) |
| Parametros totales | 124.770.816 (~124,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors sin cuantizaciones publicadas; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | no disponible en la model card; el modelo base (`heb_hebr_100mb`) esta orientado al hebreo |
| Licencia | no disponible (la model card indica `licence: license` como marcador sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, heredada íntegramente del modelo base `goldfish-models/heb_hebr_100mb`. Con unos 124,8 M de parámetros, se sitúa en la categoria de modelos pequenos, disenados para tareas de generacion de texto en un unico idioma con recursos limitados de computo. No se documenta ningun cambio arquitectonico respecto al base.

El entrenamiento se realizo exclusivamente mediante SFT (supervised fine-tuning) con TRL 0.23.0, usando Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se menciona RLHF, DPO ni ninguna otra etapa de alineacion. Por el nombre del modelo (`Dp-10mb-packed`), parece que el ajuste empleo un subconjunto de datos de 10 MB con empaquetado de secuencias, aunque la model card no detalla la composicion del dataset, el numero de tokens de entrenamiento ni la funcion de perdida mas alla del SFT estandar. El run de entrenamiento esta registrado en Weights & Biases, enlazado desde la propia model card, lo que sugiere reproducibilidad como objetivo del experimento.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de un GPT-2 pequeno.
- Continuacion de texto y respuestas a prompts de tipo conversacional (la model card incluye un ejemplo con `pipeline("text-generation")` y formato de mensajes con rol de usuario).
- Capacidad multilingue: no documentada; el modelo base es de un solo idioma (hebreo), por lo que no cabe esperar un soporte multilingue fiable.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Modo "thinking", vision, audio u otras capacidades especiales: no disponibles.
- Matematicas, codigo o razonamiento avanzado: no documentados; en un modelo de este tamano y enfocado a un idioma concreto, la expectativa es muy limitada.

## Casos de uso

- Investigacion sobre tokenizacion y empaquetado de datos: comparar esta semilla y configuracion (10 MB, packed, seed 455) frente a variantes hermanas para aislar el efecto de cada parametro de entrenamiento.
- Reproducibilidad de experimentos: ejecutar de nuevo el pipeline con TRL y la misma semilla para verificar resultados, apoyandose en el run de Weights & Biases enlazado.
- Estudio de modelos pequenos en hebreo: analizar el comportamiento de un GPT-2 de ~125 M en tareas de generacion de hebreo, como referencia frente a modelos mayores.
- Docencia y prototipado: usar el modelo como ejemplo minimalista de pipeline de SFT con TRL en un curso o tutorial sobre fine-tuning.
- Generacion de texto exploratoria en hebreo: producir continuaciones cortas para inspeccionar cualitativamente la calidad del ajuste (sin garantias de correccion).
- Baseline en estudios de privacidad o robustez: por la posible relacion del sufijo `Dp` con privacidad diferencial, servir como punto de partida para analizar como el ajuste afecta a la memorizacion del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra) y el repositorio no ofrece evaluaciones.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (124,8 M), no publicadas por el autor:

- VRAM estimada para inferencia: ~500 MB en fp32, ~250 MB en bf16/fp16, ~125 MB en int8 y ~63 MB en int4, mas el overhead del runtime y la cache de atencion.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- CPU: la inferencia en CPU es viable por el reducido tamano, aunque con mayor latencia.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HF), y potencialmente llama.cpp/Ollama o vLLM tras convertir los pesos (no se proporcionan GGUF en el repositorio).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo ni para sus variantes, por lo que la comparacion se limita a parametros y configuracion.

| Modelo | Parametros | Base | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfdiso_seed455 | 124,8 M | goldfish-models/heb_hebr_100mb | 10 MB, packed, seed 455 | no disponible | HuggingFace (0 descargas) |
| francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | goldfish-models/heb_hebr_100mb | 10 MB, packed, seed 455 | no disponible | HuggingFace |
| francesca9805/heb-hebr-100mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible | goldfish-models/heb_hebr_100mb | 100 MB, packed, seed 455 | no disponible | HuggingFace |
| fpadovani/heb-hebr-100mb-ppt-Dp-10mb_seed3407 | no disponible | goldfish-models/heb_hebr_100mb | 10 MB, seed 3407 | no disponible | HuggingFace |
| goldfish-models/heb_hebr_100mb (base) | no disponible | - | 100 MB | no disponible en esta ficha | HuggingFace |

No se dispone de benchmarks comparativos con alternativas de otros autores del mismo tamano en hebreo, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion sin adopcion: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Licencia no disponible: la model card no especifica terminos, lo que impide determinar si el uso comercial esta permitido. Debe tratarse como no apto para produccion hasta aclarar la licencia.
- Riesgo de alucinacion elevado: al ser un GPT-2 de ~125 M, la coherencia y la fidelidad factual son limitadas.
- Posible sobreajuste: si el ajuste uso solo 10 MB de datos, la generalizacion puede ser pobre fuera del dominio de entrenamiento.
- Idiomas: no se documenta soporte multilingue; el base esta enfocado al hebreo, y cualquier uso en castellano u otros idiomas carece de garantias.
- Longitud de contexto no especificada: no se puede planificar el uso en conversaciones largas sin conocer la ventana real.
- Sin etapas de alineacion: solo SFT, sin RLHF ni DPO, por lo que no hay garantias de comportamiento seguro o alineado.
- Sesgos: los hereda del corpus hebreo utilizado en el modelo base; no hay analisis de sesgo disponible.
- Nomenclatura ambigua: sufijos como `Dp` o `bfdiso` no se explican en la model card, lo que dificulta interpretar exactamente la configuracion de entrenamiento.
- Trazabilidad limitada: la model card es minima y remite a un run externo de Weights & Biases para obtener detalles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/w8bl7ajo
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana (100 MB, packed, bfd, seed455): https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante hermana (10 MB, packed, bfd, seed455): https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana (10 MB, seed3407): https://llm-explorer.com/model/fpadovani%2Fheb-hebr-100mb-ppt-Dp-10mb_seed3407,5Jp1X54VnEqmYlV4AV9QHq
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/heb-hebr-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/heb-hebr-100mb-ppt-dp-10mb-packed-bfd_seed455
