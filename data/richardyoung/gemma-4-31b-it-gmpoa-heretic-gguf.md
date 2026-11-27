# richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF` es una cuantizacion en formato GGUF de un derivado del modelo Gemma 4 de 31B parametros, publicado por el usuario richardyoung en Hugging Face. El modelo base (`gemma-4-31B-it-GMPOA-heretic`) es una variante "heretic" y "abliterated" del Gemma 4 instruct original, es decir, una version en la que se ha aplicado una tecnica de ablacion de direcciones de rechazo (refusal directions) para reducir las negativas del modelo ante peticiones que el modelo original rechazaria. La cuantizacion GGUF esta pensada para su uso con llama.cpp, Ollama y otros runners compatibles con este formato.

El modelo cuenta con 30.697.345.596 parametros reales segun los pesos en safetensors del modelo base, y el repositorio GGUF ocupa 68,1 GB, lo que indica que contiene varias cuantizaciones (probablemente desde Q2 hasta Q8 y quizas F16). Los tags incluyen `imatrix`, lo que sugiere que las cuantizaciones se han generado con matrices de importancia para preservar calidad en bitrates bajos. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

La relevancia de este modelo es doble: por un lado, ofrece una version "sin censura" de un modelo de 31B con licencia Apache 2.0, lo que permite uso comercial sin las restricciones de la licencia Gemma original; por otro, al estar en GGUF, se puede ejecutar en hardware de consumo con cuantizaciones agresivas, algo imposible con los pesos originales en bf16. No obstante, la informacion publica sobre el modelo base es muy escasa y no se han documentado benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 4, detalles no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, generadas con imatrix; lista exacta no disponible) |
| Idiomas soportados | en (segun tags del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante instruct de 31B parametros, un transformer decoder-only. Sin embargo, no se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (si usa atencion lineal, sliding window o atencion completa), ni sobre la composicion del dataset de entrenamiento original de Gemma 4. El modelo base ha sido modificado mediante una tecnica de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) y etiquetado como "heretic", lo que indica que se ha entrenado o ajustado para eliminar comportamientos de rechazo. El sufijo "GMPOA" no esta documentado en la informacion disponible.

No se conocen detalles sobre el proceso de entrenamiento del modelo base (numero de tokens, uso de RLHF/DPO, datos de instruccion) ni sobre el procedimiento exacto de abliteracion aplicado. La cuantizacion GGUF se ha realizado presumiblemente con `llama.cpp` y matrices de importancia (imatrix), pero no se especifica el dataset de calibracion ni los niveles exactos de cuantizacion incluidos en el repositorio. El tag `arxiv:2611.17846` sugiere que existe un paper asociado, pero no se ha proporcionado su contenido.

## Capacidades

- Generacion de texto conversacional en ingles (unico idioma declarado en los tags).
- Modo instruct (sufijo `-it`), orientado a seguir instrucciones y mantener dialogos multi-turno.
- Reduccion de rechazos: al ser una variante "abliterated/heretic", el modelo tiende a responder a peticiones que el Gemma original rechazaria, lo que puede ser util en investigacion sobre alineamiento y seguridad.
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varian las respuestas de un LLM cuando se eliminan las direcciones de rechazo, comparando con el Gemma 4 original en el mismo hardware.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4 o Q5 en GGUF, el modelo se puede ejecutar en una GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) usando llama.cpp u Ollama, sin necesidad de infraestructura en la nube.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa donde el modelo original podria negarse a abordar temas sensibles, siempre que el uso cumpla la legalidad aplicable.
- Prototipado rapido de asistentes conversacionales en ingles: al ser compatible con la API de Ollama y llama.cpp, se puede integrar en un backend local para pruebas de UX antes de pasar a un modelo mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye varias cuantizaciones, lo que permite medir la degradacion de calidad (perplejidad, coherencia) entre niveles Q2, Q4, Q5 y Q8 en un mismo modelo.
- Fine-tuning posterior sobre GGUF: aunque el fine-tuning directo sobre GGUF no es trivial, el modelo base en safetensors permite ajustes con LoRA y luego recuantizar a GGUF para despliegue local.
- Analisis de sesgos y comportamientos no alineados: util como caso de estudio en auditorias de seguridad de LLMs, ya que permite observar respuestas sin las capas de rechazo habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o de tasa de rechazo para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: ~11-12 GB
  - Q4_K_M: ~18-19 GB
  - Q5_K_M: ~21-22 GB
  - Q8_0: ~32-33 GB
  - F16: ~61-62 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; A100 40 GB o H100 para Q8/F16; RTX 3090 (24 GB) tambien valida para Q4/Q5.
- Cabe en GPU de consumo: si, en RTX 4090, 3090 o 4080 Super (16 GB) solo con cuantizaciones muy agresivas (Q2/Q3) y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; no se documenta soporte nativo en vLLM o TGI para este repo GGUF.
- Latencia y throughput: no disponibles. Dependeran del hardware, del nivel de cuantizacion y del backend; en una RTX 4090 con Q4 se puede esperar un rendimiento interactivo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF | 30,7B | no disponible | apache-2.0 | GGUF | Variante abliterated de Gemma 4 31B, solo ingles |
| Gemma 4 31B it (original) | ~31B | no disponible | Gemma license | safetensors | Modelo oficial con alineamiento completo; restricciones de uso |
| Modelos abliterated de 30B (genericos) | ~30B | variable | variable | safetensors/GGUF | Alternativas de la comunidad con ablacion similar; no se dispone de comparacion directa |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La ablacion de rechazos puede degradar la calidad general del modelo y aumentar la probabilidad de respuestas daninas, sesgadas o inexactas; no es un modelo recomendado para produccion orientada a usuarios finales sin filtros adicionales.
- Riesgo elevado de alucinacion: no hay datos de entrenamiento ni evaluaciones publicadas que permitan estimar su fiabilidad factual.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se debe asumir la ventana del Gemma 4 original sin verificacion empirica.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas en CI/CD.
- Aunque la licencia del repo es Apache 2.0, el modelo deriva de Gemma 4; conviene revisar la compatibilidad de licencias del modelo base antes de uso comercial.
- El tag `arxiv:2611.17846` apunta a un paper no verificado en esta ficha; no se ha confirmado su contenido ni su relacion exacta con el modelo.
- No hay garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic
- Paper referenciado (tag): https://arxiv.org/abs/2611.17846 (no verificado)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
