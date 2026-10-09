# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen11

## Resumen

Este repositorio contiene un ajuste fino del modelo Gemma 3 4B Instruct publicado por el usuario HungryDino bajo el identificador `gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen11`. Se trata de un modelo de generacion de texto derivado de `unsloth/gemma-3-4b-it`, entrenado con la libreria Unsloth (que acelera el entrenamiento aproximadamente 2x) y TRL de Hugging Face. La model card publicada es minima: solo indica el autor, la licencia Apache-2.0, el modelo base y la mencion al flujo de entrenamiento con Unsloth y TRL.

El nombre del repositorio sugiere que forma parte de una serie de experimentos controlados sobre razonamiento numerico o colapso de capacidades ("raven_numbers-collapse", con variantes de control como `control_numbers-collapse_p10-gen1` y `control_numbers-self_collapse_p10-gen2`), pero ni la model card ni los resultados de busqueda aportan una descripcion formal del objetivo, del dataset o de la metodologia. Esta hipotesis sobre el nombre no esta confirmada por el autor.

Por su tamano (~4B parametros) y su naturaleza de ajuste fino, el modelo es relevante como objeto de estudio dentro de experimentos de estabilidad y degradacion de capacidades en LLM de pequeno tamano. Sin embargo, el repositorio no publica evaluaciones, acumula 0 descargas en el momento de redactar esta ficha y el tamano del repo (0,1 GB) no cuadra con unos pesos completos de 4B en safetensors, por lo que debe tratarse como un artefacto experimental no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Gemma 3; no documentada en la model card del ajuste fino) |
| Parametros totales | ~4 000 millones (nominal, segun el nombre del modelo base; no verificado en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens segun la especificacion publica de Gemma 3; no confirmada en la model card del ajuste fino |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se han subido variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (tag `en` en el repositorio). El modelo base declara mas de 140 idiomas, pero el ajuste fino no documenta el mantenimiento de ese soporte |
| Licencia | Apache-2.0, declarada en el repositorio. El modelo base esta sujeto a los Gemma Terms of Use de Google |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB (valor anomalo para pesos completos de 4B en bf16, que rondarian los 8 GB) |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada por el autor sobre el procedimiento de entrenamiento: la model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la duracion del ajuste, los hiperparametros (learning rate, rango LoRA, epocas) ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o ORPO. Lo unico documentado es que el entrenamiento se realizo con Unsloth y TRL sobre `unsloth/gemma-3-4b-it`, lo que en la practica implica casi con seguridad un ajuste eficiente en parametros (LoRA o QLoRA) y no un reentrenamiento completo, aunque esto no se confirma explicitamente.

En cuanto a la arquitectura heredada, Gemma 3 emplea un transformer decoder-only con atencion por ventana deslizante intercalada con capas de atencion global, normalizacion QK, normalizacion RMSNorm previa y posterior a cada subcapa, activaciones GeGLU y un vocabulario de gran tamano. El modelo base de 4B es multimodal (acepta entrada de imagen ademas de texto) y esta disenado para un contexto de 128 000 tokens. La model card del ajuste fino no indica si se ha conservado la torre de vision, por lo que la capacidad multimodal tras el ajuste es "no disponible".

Un dato relevante para la interpretacion del artefacto es el patron de nombres de los repositorios hermanos del mismo autor (`control_numbers-collapse_p10-gen1`, `control_numbers-self_collapse_p10-gen2`), que apunta a un diseno experimental con grupos de control y variantes de "colapso". Si esa interpretacion es correcta, este modelo podria ser una variante deliberadamente degradada dentro de un estudio de perdida de capacidades, y no un modelo destinado a uso productivo. No hay confirmacion por parte del autor.

## Capacidades

- Generacion de texto instruccional en ingles, heredada del modelo base Gemma 3 4B Instruct.
- Razonamiento basico, matematicas elementales y generacion de codigo: capacidades esperables del modelo base, pero no verificadas tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card; el modelo base no destaca por esta capacidad en la informacion recopilada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el repositorio declara unicamente ingles; no se documenta el estado del soporte multilingue del modelo base tras el ajuste.
- Capacidades multimodales (vision): no disponible; no se especifica si la torre de vision se conserva.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ajuste de instrucciones: si, por la naturaleza instruct del modelo base, aunque sin detalle del dataset de ajuste.

## Casos de uso

Dado que no existe validacion publicada, los casos siguientes deben considerarse escenarios potenciales sujetos a evaluacion previa por parte del equipo que los adopte.

- Reproduccion de experimentos academicos sobre degradacion de capacidades: el modelo encaja como artefacto de un estudio de "colapso" numerico; su uso principal seria comparar sus salidas con las de los repositorios de control del mismo autor para medir la perdida de rendimiento en tareas de secuencias numericas.
- Asistente de texto local en equipos con GPU de consumo: con ~4B parametros y cuantizacion de 4 bits cabe en 4-6 GB de VRAM, lo que permite ejecutarlo en una RTX 3060 o en un portatil con memoria unificada para tareas de redaccion y resumen en ingles.
- Prototipado rapido de pipelines de generacion: al ser cargable con `transformers` y compatible con text-generation-inference, sirve para validar integraciones antes de sustituir el modelo por uno con garantias de calidad.
- Generacion de codigo auxiliar en entornos de desarrollo: se podria integrar en completado de fragmentos y explicacion de funciones en ingles, siempre que una evaluacion previa confirme que el ajuste no ha degradado esta capacidad.
- Clasificacion y extraccion de informacion en ingles: tareas de etiquetado de texto o extraccion de campos en documentos, con contexto suficientemente largo como para procesar documentos extensos en una sola pasada si se confirma la ventana de 128 000 tokens.
- Base para nuevos ajustes finos con LoRA: el repo, por su tamano y su origen Unsloth, puede servir como punto de partida para experimentos derivados, no como modelo final.
- Educacion e investigacion sobre ajuste eficiente: caso de uso didactico para ilustrar como un ajuste fino breve sobre un modelo instruct puede alterar el comportamiento respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas, los resultados de busqueda no aportan evaluaciones y el repositorio no referencia ningun informe tecnico, tabla comparativa ni leaderboard.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 8-9 GB solo para pesos, mas el cache KV, que crece de forma lineal con la longitud de contexto y puede dominar el consumo en secuencias de decenas de miles de tokens. Cifra exacta de cache KV: no disponible.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 2,5-3 GB.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 (esta ultima con margen amplio para contextos largos). Tambien es viable en Apple Silicon con 16 GB o mas de memoria unificada.
- GPU de datacenter: A100 40 GB, H100, L40S y similares, con un uso de memoria muy inferior a su capacidad salvo que se busquen lotes grandes o contextos muy largos.
- Opciones de despliegue: `transformers` (formato publicado), text-generation-inference (TGI), vLLM y, para cuantizacion, llama.cpp u Ollama, aunque para estas ultimas seria necesario convertir los pesos a GGUF, ya que el repositorio no publica ese formato.
- Parametros de muestreo recomendados por el equipo de Gemma 3 para el modelo base: temperature = 1.0, top_p = 0.95, top_k = 64. No hay confirmacion de que se hayan reajustado tras el ajuste fino.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus especificaciones publicas y no se han verificado contra la informacion recopilada en la busqueda. La columna de rendimiento se deja como no disponible porque este ajuste fino no publica ninguna evaluacion y comparar sin datos seria especulativo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen11` (este modelo) | ~4B | 128 000 tokens (heredado, sin confirmar) | Apache-2.0 declarada en el repo | Hugging Face, 0 descargas | Ajuste fino experimental sin evaluacion publicada |
| `unsloth/gemma-3-4b-it` (base) | ~4B | 128 000 tokens | Gemma Terms of Use | Hugging Face | Modelo instruct multimodal, mas de 140 idiomas |
| Llama 3.2 3B Instruct | 3B | 128 000 tokens | Llama 3.2 Community License | Hugging Face | Solo texto, con requisitos de atribucion |
| Qwen2.5 3B Instruct | 3B | 32 000 tokens (ampliable con YaRN) | Apache-2.0 | Hugging Face | Solo texto, licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas con el modelo base, ni descripcion del dataset de ajuste. No es posible afirmar que el modelo conserve las capacidades de `gemma-3-4b-it`.
- Riesgo de degradacion deliberada o accidental: el nombre del repositorio contiene el termino "collapse" y existen repositorios hermanos etiquetados como "control" y "self_collapse". Si el modelo forma parte de un estudio de colapso de capacidades, podria estar degradado de forma intencionada en razonamiento numerico. Debe validarse antes de cualquier uso real.
- Anomalia en el tamano del repositorio: 0,1 GB es incompatible con unos pesos completos de 4B en bf16 (aproximadamente 8 GB). Es posible que el repositorio contenga un adaptador LoRA, una subida incompleta o un error de publicacion. No confirmado.
- Falta de validacion comunitaria: 0 descargas y 1 like. No existen informes de terceros sobre su comportamiento.
- Ambiguedad de licencia: el repositorio declara Apache-2.0, pero el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use de Google, que imponen obligaciones adicionales (atribucion, politica de uso aceptable y clausulas de uso comercial). La etiqueta Apache-2.0 no sustituye esas condiciones. Antes de un uso comercial debe revisarse la licencia del modelo base.
- Limitacion idiomatica: solo se declara ingles. Cualquier uso en castellano u otros idiomas carece de garantia y deberia evaluarse empiricamente.
- Sesgos: no documentados por el autor. El modelo base Gemma hereda sesgos de sus datos de entrenamiento, y un ajuste fino sobre un dataset no descrito puede amplificarlos o introducir sesgos nuevos.
- Alucinacion: riesgo propio de cualquier modelo de 4B sin mecanismos de verificacion; no existe informacion sobre si el ajuste lo mitiga o lo agrava.
- Contexto no confirmado: aunque el modelo base soporta 128 000 tokens, no hay evidencia de que este ajuste mantenga un rendimiento util en ventanas largas.
- Uso en produccion desaconsejado: sin evaluacion, sin versionado claro de hiperparametros y con indicios de pertenecer a una serie experimental, no deberia desplegarse en entornos productivos ni en aplicaciones con usuarios finales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen11
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Repositorio hermano (control): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-collapse_p10-gen1
- Repositorio hermano (self collapse): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2
- Ficha de directorio sobre el repositorio hermano: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen2
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Notebook de Unsloth para Gemma 3 4B: https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Gemma3_(4B).ipynb
- Documentacion de TRL: https://github.com/huggingface/trl
- Wikipedia sobre la familia Gemma: https://en.wikipedia.org/wiki/Gemma_(language_model)
