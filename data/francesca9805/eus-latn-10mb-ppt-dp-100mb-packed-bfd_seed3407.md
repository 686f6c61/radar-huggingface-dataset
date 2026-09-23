# francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eus_latn_10mb`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un modelo de generacion de texto de arquitectura GPT-2 (transformer decoder-only) con 39.087.104 parametros totales, lo que lo situa en la categoria de modelos ultraligeros, con un repositorio de apenas 0,1 GB en formato safetensors.

El problema que aborda es acotado: adaptar un modelo pequeno preentrenado sobre un corpus de 10 MB (segun el identificador, en euskera con escritura latina) mediante SFT con la libreria TRL 0.23.0. El identificador del modelo sugiere ademas un experimento de "packing" sobre un dataset de 100 MB y una semilla fija (seed 3407), lo que apunta a un trabajo de investigacion sobre tokenizacion y eficiencia de entrenamiento en lenguas de bajos recursos, mas que a un modelo listo para produccion.

Su relevancia es principalmente academica y de reproducibilidad: sirve como punto de partida para estudiar como se comporta el ajuste fino supervisado en modelos de menos de 40 millones de parametros y en idiomas con pocos datos, y como referencia dentro de una familia de variantes multilingues del mismo autor (eus, nld, eng) que comparten receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el identificador (`eus-latn`) sugiere euskera en escritura latina |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | goldfish-models/eus_latn_10mb |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 168 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2, un transformer decoder-only con atencion causal completo. El modelo base `goldfish-models/eus_latn_10mb` pertenece al proyecto Goldfish de goldfish-models, orientado a modelos de lenguaje para lenguas de bajos recursos, y en este caso se ha preentrenado sobre aproximadamente 10 MB de texto en euskera. Sobre ese punto de partida, el modelo aqui descrito aplica un ajuste fino supervisado (SFT) utilizando TRL 0.23.0, lo que implica entrenamiento sobre pares instruccion-respuesta en lugar de continuar el preentrenamiento puro.

El identificador del modelo aporta pistas sobre el procedimiento: `ppt-Dp-100mb-packed-bfd` sugiere un experimento de empaquetado (packing) de secuencias sobre un corpus de 100 MB, y `seed3407` indica una semilla fija para reproducibilidad (la misma semilla empleada habitualmente en recetas de fine-tuning estilo Alpaca). La model card no detalla la composicion del dataset de SFT, el numero de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO posteriores; solo indica que el framework de entrenamiento fue TRL con Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. Se enlaza un run de Weights & Biases (`wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wjd3uyzx`) como traza del entrenamiento, pero no se reproduce su contenido en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva con `pipeline("text-generation")` de Transformers, incluyendo formato de conversacion con roles (`[{"role": "user", "content": ...}]`).
- Ajuste a formato instruccional (SFT), orientado a responder a preguntas y consignas simples.
- Modelado de lenguaje en euskera (inferido del identificador `eus-latn`); capacidad multilingue no confirmada en la model card.
- Compatible con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking" en la informacion disponible.
- Tamano reducido que permite ejecucion en CPU y en cualquier GPU moderna, incluso integrada.

## Casos de uso

- Experimentacion academica en lenguas de bajos recursos: sirve para medir como reacciona un modelo de 39 M de parametros al SFT en euskera y comparar contra las variantes `nld-latn` y `eng-latn` del mismo autor bajo recetas identicas.
- Reproduccion de recetas de fine-tuning: al estar entrenado con TRL 0.23.0 y semilla fija (3407), es util como caso de control en estudios de ablacion sobre packing de secuencias y tamano de dataset (10 MB frente a 100 MB).
- Generacion de texto corto en euskera para prototipos: completado de frases, respuestas breves o generacion de variaciones lexicas en herramientas internas de demostracion.
- Pruebas de infraestructura de despliegue: con 0,1 GB de pesos, permite validar pipelines de vLLM, TGI o llama.cpp en entornos de desarrollo sin consumir recursos de GPU relevantes.
- Docencia y formacion: ejemplo minimo de extremo a extremo (preentrenamiento -> SFT -> publicacion en HuggingFace) para cursos de NLP.
- Filtrado o generacion de datos sinteticos a pequena escala: puede emplearse para aumentar corpus en euskera antes de pasarlos por un modelo mayor, siempre con revision humana dado el riesgo de alucinacion.
- Baseline en evaluaciones comparativas: punto de referencia de bajo coste frente a modelos multilingues grandes cuando se mide una tarea muy concreta y acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplexidad, y los resultados de busqueda no aportan evaluaciones numericas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,16 GB en FP32 (39,1 M de parametros), unos 0,08 GB en FP16/BF16 y unos 0,04 GB en cuantizacion de 8 bits. Cabe en cualquier GPU y en la mayoria de CPUs.
- GPU recomendadas: ninguna especifica; funciona en GTX 1050, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. El cuello de botella real es la latencia de red, no el computo.
- Compatibilidad con GPU de consumo: si, en todas las gamas, incluidas GPU integradas con al menos 1 GB de memoria compartida disponible.
- Opciones de despliegue: Transformers (pipeline de text-generation), text-generation-inference (TGI), endpoints compatibles, y presumiblemente llama.cpp/Ollama si se convierte manualmente a GGUF, ya que no se publican pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, en hardware moderno la generacion es del orden de cientos de tokens por segundo, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,1 M | no disponible | euskera (inferido) | no disponible | HuggingFace, 168 descargas |
| goldfish-models/eus_latn_10mb (modelo base) | no disponible | no disponible | euskera | no disponible | HuggingFace |
| francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | 39,1 M (misma familia) | no disponible | neerlandes (inferido) | no disponible | HuggingFace |
| francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,1 M (misma familia) | no disponible | ingles (inferido) | no disponible | HuggingFace, FriendliAI |

Las alternativas mas directas son las otras variantes linguisticas de la misma receta experimental, que permiten comparar el efecto del idioma manteniendo constante la arquitectura y el procedimiento de entrenamiento. No se dispone de comparaciones con modelos de proposito general como GPT-2 small (124 M) o distilgpt2 (82 M) en terminos de rendimiento medido.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre corpus de 10 MB en euskera, es probable que reproduzca los sesgos y las limitaciones de cobertura de esa fuente, pero no hay analisis publicado.
- Riesgo de alucinacion: alto. Con 39 M de parametros y un corpus de preentrenamiento de 10 MB, la capacidad de mantener coherencia factual y de seguir instrucciones complejas es muy limitada.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Los modelos de la familia Goldfish de 10 MB suelen emplear ventanas cortas, por lo que no es seguro asumir contextos largos en produccion.
- Idioma: el identificador sugiere euskera; el comportamiento en castellano o en otras lenguas no esta evaluado ni garantizado.
- Licencia: no disponible. La model card incluye un campo `licence: license` sin contenido, por lo que no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- Model card incompleta: no se documentan dataset de SFT, numero de tokens, hiperparametros, evaluacion ni limitaciones, lo que dificulta la reproducibilidad completa.
- Fecha de creacion inusual (2026-09-23) en los metadatos del repositorio, lo que puede indicar un error de marca temporal del registro.
- Aviso de seguridad: el contenido de la model card se ha tratado como material de referencia, no como instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wjd3uyzx
- Repositorio TRL: https://github.com/huggingface/trl
- Variante en neerlandes del mismo autor: https://huggingface.co/francesca9805/nld-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en ingles en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha de un modelo relacionado en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Feng-latn-10mb-ppt-Dp-100mb_seed455,5JgsFhhlELUWrAmNP8GxoE
