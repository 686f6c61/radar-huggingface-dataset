# francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eus_latn_10mb`, un GPT-2 de pequeno tamano entrenado sobre un corpus de 10 MB de texto en euskera (codigo ISO `eus`, script `latn`). Con 39.087.104 parametros reales registrados en los pesos safetensors, se trata de un modelo de generacion de texto de escala muy reducida (0,1 GB de repositorio), pensado para experimentacion en procesamiento de lenguaje natural de bajos recursos mas que para uso en produccion.

El ajuste se ha realizado con SFT (supervised fine-tuning) utilizando la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121. La nomenclatura del identificador (`ppt`, `Dp`, `100mb-packed`, `bfd`, `seed10`) apunta a una campana experimental de investigacion sobre tokenizadores y empaquetado de datos: el proyecto de Weights & Biases asociado se llama `new-tokenizers` y existen variantes hermanas con otras semillas y otros idiomas (por ejemplo, `eng-latn-10mb-ppt-Dp-100mb_seed455`), atribuidas a la misma autora, Francesca Padovani (Universidad de Groninga).

Su relevancia es, por tanto, metodologica y de investigacion: sirve como punto de comparacion reproducible para estudiar el efecto de distintas semillas, tokenizadores y estrategias de empaquetado de corpus en lenguas de bajos recursos como el euskera. No es un modelo de proposito general ni compite en capacidad con modelos contemporaneos de su categoria; su interes esta en el entorno controlado de experimentacion del que forma parte. La model card es minima y no documenta datos de entrenamiento, licencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (tag `gpt2`, libreria `transformers`) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la familia GPT-2 usa posiciones absolutas aprendidas con ventana tipica de 1024 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible en metadatos; el identificador `eus-latn` indica euskera en script latino |
| Licencia | no disponible (la model card contiene el marcador generico `licence: license`) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | goldfish-models/eus_latn_10mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 167 / 0 |
| Fecha de creacion | 2026-09-23 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, la misma familia del modelo base `goldfish-models/eus_latn_10mb`. Con 39.087.104 parametros, corresponde a una configuracion de muy pequena escala (del orden de decenas de millones de parametros, varios ordenes de magnitud por debajo de GPT-2 small, que tiene 124 millones). El modelo base pertenece al proyecto Goldfish, orientado a producir modelos monolingues pequenos para un gran numero de idiomas a partir de corpus de unos 10 MB por lengua, de modo que la ventana de contexto y el vocabulario dependen de la configuracion original de dicho modelo base, no documentada en esta ficha.

El ajuste se realizo mediante SFT con TRL sobre un conjunto identificado en el nombre como `100mb-packed` (empaquetado de secuencias hasta 100 MB, presumiblemente tras aplicar la politica `ppt`/`Dp` y el tokenizador `bfd`), con la semilla 10. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; la model card solo indica el metodo SFT y las versiones de framework. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, mezcla de expertos). El unico artefacto de seguimiento disponible es un run publico de Weights & Biases enlazado desde la model card, que constituye la unica trazabilidad del entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en euskera (script latino), condicionada por el corpus de 10 MB del modelo base.
- Finalizacion y continuacion de texto breve, propio de un modelo GPT-2 de escala reducida.
- Acepta el formato conversacional de `transformers.pipeline` con lista de mensajes, segun el ejemplo de la model card, si bien no se documenta un formato de plantilla de chat especifico.
- Compatible con text-generation-inference y con endpoints de inferencia gestionada (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Capacidad multilingue: no disponible; el identificador sugiere uso monolingue en euskera.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; improbable en esta escala).
- Capacidades especiales (modo thinking, vision, audio): no disponible; ninguna documentada.

## Casos de uso

- Experimentacion sobre tokenizadores: el modelo forma parte de una campana (proyecto `new-tokenizers` en Weights & Biases) con variantes por semilla e idioma, por lo que sirve para medir el impacto de distintas estrategias de tokenizacion y empaquetado en la calidad de generacion en euskera.
- Linea base de investigacion en lenguas de bajos recursos: permite establecer un punto de comparacion reproducible (semilla 10) frente a otros ajustes del mismo corpus `eus_latn_10mb`, aislando el efecto de la semilla.
- Generacion de texto sintetico en euskera para aumento de datos: con supervision humana posterior, puede producir continuaciones cortas que amplien corpus pequenos en euskera, siempre que se filtre por calidad.
- Pruebas de infraestructura de despliegue: con 0,1 GB de pesos, es util para validar pipelines de vLLM, TGI, HuggingFace Endpoints o llama.cpp (previa conversion a GGUF) antes de escalar a modelos mayores.
- Demostraciones docentes sobre GPT-2: sirve para ilustrar el ciclo completo de ajuste con TRL, desde el modelo base hasta el checkpoint final, en cursos de NLP.
- Prototipado de autocompletado en euskera: en entornos de investigacion y con expectativas de calidad bajas, puede emplearse para completar frases cortas o etiquetar localmente sin coste de API.
- Estudio de sesgos y degeneracion en modelos pequenos: util para analizar como un corpus de 10 MB limita la cobertura lexica y provoca repeticiones o incoherencias, como caso de estudio metodologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplexity, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y la busqueda web no aporta cifras para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,16 GB de pesos; en fp16/bf16, unos 0,08 GB; en int8, unos 0,04 GB. Sumando activaciones y cache KV, el consumo realista se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, T4, RTX 3060 y superiores). Tambien funciona en CPU con latencias aceptables para generacion de textos cortos.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (pipeline de text-generation), Text Generation Inference (TGI), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera decodificacion muy rapida en GPU (cientos de tokens por segundo con batching), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | 39,1 M | no disponible | no disponible | HuggingFace (safetensors) | Ajuste SFT del modelo Goldfish de euskera |
| goldfish-models/eus_latn_10mb | 39,1 M (misma arquitectura, no confirmado) | no disponible | no disponible | HuggingFace | Modelo base monolingue de euskera sobre 10 MB |
| distilgpt2 | 82 M | 1024 | Apache-2.0 | HuggingFace | GPT-2 destilado en ingles, mucho mas entrenado |
| gpt2 | 124 M | 1024 | MIT | HuggingFace | Referencia de la familia, multilingue parcial |
| fpadovani/eus-latn-10mb-ppt-Dp-100mb_seed455 | 39,1 M (no confirmado) | no disponible | no disponible | HuggingFace | Variante de la misma campana con otra semilla |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Escala muy reducida (39 M de parametros) y corpus base de solo 10 MB: la calidad de generacion sera limitada, con alta probabilidad de repeticiones, incoherencias y perdida de coherencia a partir de pocos tokens.
- Riesgo elevado de alucinacion: sin datos factuales en el corpus de entrenamiento, el modelo puede producir afirmaciones falsas con apariencia fluida.
- Sesgos conocidos: no disponibles; no se ha publicado ningun analisis de sesgo, y un corpus de 10 MB probablemente infrarrepresenta variedades dialectales del euskera.
- Limitaciones de contexto e idioma: la ventana de contexto no esta documentada y el modelo esta orientado a euskera en script latino; el rendimiento fuera de ese idioma es, previsiblemente, muy pobre.
- Licencia no disponible: la model card incluye un marcador generico (`licence: license`) sin texto legal, por lo que no se puede confirmar la legalidad de un uso comercial. Se debe contactar con la autora antes de cualquier despliegue productivo.
- Datos de entrenamiento no documentados: se desconoce la composicion exacta del corpus `100mb-packed` y si contiene material con derechos de terceros.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad objetiva frente a alternativas.
- Fechas de metadatos anomalas (creacion y actualizacion en 2026-09-23): conviene verificar la version real del repositorio antes de citarlo.
- No apto como asistente conversacional ni para tareas de razonamiento, codigo o uso agentico sin validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zutc2v0n
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con otra semilla (mismo autor): https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante en euskera atribuida a fpadovani: https://huggingface.co/fpadovani/eus-latn-10mb-ppt-Dp-100mb_seed455
- Variante en ingles de la misma campana: https://huggingface.co/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en LLM Explorer de la variante inglesa: https://llm-explorer.com/model/fpadovani%2Feng-latn-10mb-ppt-Dp-100mb_seed455,5JgsFhhlELUWrAmNP8GxoE
- Pagina de despliegue en FriendliAI de la variante inglesa: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
