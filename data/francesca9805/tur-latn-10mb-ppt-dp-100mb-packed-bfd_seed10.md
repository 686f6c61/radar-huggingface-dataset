# francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

El modelo `francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/tur_latn_10mb`, un checkpoint de la familia Goldfish orientado al turco en escritura latina. El ajuste se ha realizado mediante SFT (supervised fine-tuning) con la librería TRL de Hugging Face, según declara la propia model card. Se trata de un modelo muy pequeno: 39.087.104 parametros (aproximadamente 39 millones) confirmados en los pesos en formato safetensors.

El modelo pertenece a la arquitectura GPT-2 (asi aparece etiquetado en HuggingFace) y esta pensado para generacion de texto causal. Su relevancia es fundamentalmente experimental: sirve como banco de pruebas de bajo coste para experimentos de ajuste supervisado, tokenizacion y pipelines de TRL, no como modelo de proposito general para produccion.

La model card es minima y no declara licencia, idiomas soportados ni detalles del dataset de entrenamiento. El nombre del repositorio sugiere un entrenamiento sobre datos empaquetados de 100 MB con una semilla concreta (seed 10), pero esto no esta confirmado en la documentacion del autor y debe tratarse como una interpretacion del nombre, no como un dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no hay GGUF publicado en el repo) |
| Idiomas soportados | no disponibles de forma explicita; el modelo base `goldfish-models/tur_latn_10mb` corresponde a turco en escritura latina |
| Licencia | no disponible (la model card contiene un marcador `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2: un transformer decoder-only con atencion causal, adecuado para generacion de texto autorregresiva. El modelo base `goldfish-models/tur_latn_10mb` pertenece a la coleccion Goldfish, que agrupa modelos de ~10 MB de datos de entrenamiento por idioma, con variantes identificadas por idioma y sistema de escritura (`tur_latn` = turco, alfabeto latino). El fine-tune conserva la arquitectura y el tokenizador del modelo base; no se anuncia ningun cambio estructural.

El entrenamiento se ha realizado con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. La unica traza publica del proceso es un experimento registrado en Weights & Biases bajo el proyecto `new-tokenizers` (run `q4lg5rs4`), cuyo nombre apunta a experimentos relacionados con tokenizadores. El nombre del repositorio incorpora indicios sobre la configuracion del entrenamiento (posible empaquetado de datos de 100 MB, semilla 10), pero no hay confirmacion en la model card.

## Capacidades

- Generacion de texto causal basica en el dominio e idioma para el que fue ajustado (turco en escritura latina, segun el modelo base).
- Ejecucion mediante el pipeline `text-generation` de Transformers, con soporte de mensajes con rol (`{"role": "user", "content": ...}`) tal y como muestra el ejemplo de la model card.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se documenta una lista oficial de capacidades multilingues; el alcance linguistico previsible es el del modelo base turco.

## Casos de uso

- Experimentacion academica con SFT: el modelo sirve para reproducir y comparar configuraciones de ajuste supervisado con TRL a un coste computacional minimo, dado su tamano de 39 millones de parametros.
- Pruebas de pipelines de generacion de texto: permite validar de extremo a extremo integraciones con `transformers.pipeline`, text-generation-inference o endpoints compatibles antes de escalar a modelos mayores.
- Investigacion sobre tokenizacion: el run asociado en Weights & Biases pertenece a un proyecto llamado `new-tokenizers`, lo que lo hace util como punto de partida para estudiar el efecto del tokenizador en modelos pequenos de turco.
- Generacion de texto en turco con recursos limitados: para tareas de relleno, autocompletado o generacion corta en turco en entornos sin GPU, siempre que se acepte la calidad propia de un modelo de 39 M de parametros.
- Docencia y formacion: ejemplo didactico para explicar el ciclo completo de ajuste fino, desde el modelo base Goldfish hasta la publicacion en el Hub con safetensors.
- Pruebas de integracion continua de modelos: al ocupar menos de 0,1 GB, puede incluirse en suites de test que verifiquen carga de pesos, tokenizacion y generacion en cada commit sin penalizar el tiempo de CI.
- Evaluacion de tecnicas de privacidad o empaquetado de datos: el sufijo `Dp` y `packed` del nombre sugiere (sin confirmar) variantes de entrenamiento con datos empaquetados o con algun esquema de privacidad diferencial, lo que lo hace candidato para replicar ese tipo de experimentos.
- Prototipado de juguetes conversacionales en turco: util para demos internas donde la fluidez no es critica y se prioriza la latencia y el coste cero de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y la busqueda web realizada no ha devuelto resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, en torno a 160 MB de pesos (39,09 M de parametros x 4 bytes); en fp16/bf16, alrededor de 80 MB; en cuantizacion int8, unos 40 MB. Estas cifras son calculos derivados del numero de parametros y no estimaciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos (GTX 1050, RTX 3060, RTX 4090, etc.), y tambien en CPU y en hardware tipo Apple Silicon.
- Opciones de despliegue: `transformers` con el pipeline `text-generation` (soporte nativo, es la via documentada), text-generation-inference y endpoints compatibles (segun las etiquetas del repositorio). El uso con llama.cpp u Ollama requeriria convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10` | 39,09 M | no disponible | turco (segun modelo base) | no disponible | safetensors en HuggingFace, 0 descargas |
| `goldfish-models/tur_latn_10mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | turco (escritura latina) | no disponible | HuggingFace |
| `openai-community/gpt2` (referencia de arquitectura) | 124 M | 1024 tokens | ingles | MIT (segun su propia model card) | HuggingFace |
| `distilgpt2` (alternativa compacta de referencia) | 82 M | 1024 tokens | ingles | Apache 2.0 (segun su propia model card) | HuggingFace |

Nota: los datos de contexto, licencia y parametros de las alternativas corresponden a sus fichas publicas habituales; no se dispone de una comparacion de rendimiento publicada entre este modelo y las alternativas, por lo que no se incluyen cifras de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos, toxicidad o alineacion para este modelo.
- Riesgo de alucinacion: alto en terminos relativos, dado el tamano reducido (39 M de parametros) y la ausencia de fases de alineacion documentadas. No debe usarse para generar informacion factual sin verificacion humana.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni el conjunto de idiomas estan declarados. El modelo base es de turco en escritura latina, por lo que la capacidad en otros idiomas es previsiblemente muy limitada o inexistente.
- Licencia: la model card contiene un marcador de licencia sin valor (`licence: license`), de modo que las condiciones de uso comercial no estan definidas. Usar en produccion sin aclarar la licencia con el autor es un riesgo legal.
- Modelo sin adopcion ni validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones de terceros ni resultados reproducibles publicados.
- Fechas de creacion y actualizacion poco habituales (2026-09-22) en los metadatos del repositorio, lo que conviene verificar antes de citarlo.
- Aviso sobre el nombre: los fragmentos `Dp`, `packed` y `bfd` del identificador no estan explicados en la documentacion; no debe asumirse que el modelo implemente privacidad diferencial o cualquier otra tecnica concreta.
- Advertencia de seguridad: el modelo se distribuye en safetensors; no se ha publicado ningun archivo con codigo ejecutable propio, pero conviene cargarlo con librerias actualizadas y, si es posible, en un entorno aislado.
- No apto para produccion: sin benchmarks, sin licencia clara y con un tamano de 39 M de parametros, no es adecuado para tareas de cara al usuario final que exijan fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/tur_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/q4lg5rs4
- Repositorio de TRL: https://github.com/huggingface/trl

Los resultados de la busqueda web realizada no contienen ningun enlace relevante sobre este modelo; los enlaces devueltos no guardan relacion con la ficha.
