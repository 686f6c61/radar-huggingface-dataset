# fpadovani/ppt-nld_uniform-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-nld_uniform-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 86.708.736 parámetros (aproximadamente 87 millones) orientado a la generación de texto. Lo publica el usuario fpadovani en HuggingFace, con una model card generada automáticamente que documenta el entrenamiento mediante SFT con la librería TRL, pero que no describe el conjunto de datos, la licencia ni los idiomas de forma explícita.

El interés de esta ficha es limitado y muy específico: se trata de un artefacto de investigación y experimentación, no de un modelo de producción. Su tamaño (87 M de parámetros, 1,4 GB de repositorio) permite ejecutarlo en CPU o en cualquier GPU consumer, lo que lo convierte en un banco de pruebas útil para estudiar técnicas de ajuste fino sobre corpus pequeños (el modelo base se entrenó sobre 100 MB de texto neerlandés), para reproducir experimentos con semillas controladas o para usarlo como línea base en tareas de generación de texto en neerlandés.

La relevancia actual no proviene de su rendimiento, sino de su valor metodológico: forma parte de una familia de ajustes sobre el modelo Goldfish neerlandés, con un identificador que sugiere variantes de muestreo de datos (`uniform`) y semillas (`seed455`). No se han publicado benchmarks, métricas de evaluación ni datos de licencia claros, por lo que cualquier uso en producción exige una verificación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), segun la arquitectura del modelo base |
| Parametros totales | 86.708.736 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al distribuirse en safetensors, admite conversion a fp16/bf16, int8 y GGUF (Q4, Q5, Q8) con herramientas estandar |
| Idiomas soportados | no declarado en la model card; el modelo base (`nld_latn`) corresponde a neerlandes en escritura latina |
| Licencia | no disponible (la model card incluye el marcador «licence: license» sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de tipo GPT-2 con 86.708.736 parametros, sin mecanismos de atencion lineal, mezcla de expertos ni capas recurrentes. No hay informacion publicada sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni vocabulario del tokenizador en la informacion disponible. El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, y el autor enlaza una ejecucion de Weights & Biases en el proyecto `f-padovani-university-of-groningen/white_cotterell` (run `aak2jek8`).

No se documenta el dataset de ajuste fino, el numero de tokens de entrenamiento, la composicion de los datos, la existencia de RLHF o DPO, ni ninguna innovacion tecnica (decodificacion especulativa, atencion optimizada, destilacion). El identificador del modelo (`ppt-nld_uniform-100mb_seed455`) sugiere un experimento sobre el corpus neerlandes de 100 MB con muestreo uniforme y semilla 455, pero se trata de una inferencia a partir del nombre y no de un dato confirmado en la model card. El modelo base `goldfish-models/nld_latn_100mb` pertenece a la iniciativa Goldfish, centrada en modelos monocorpus para lenguas de bajos recursos.

## Capacidades

- Generacion de texto autoregresiva, con el ejemplo de uso documentado en la model card (pipeline de `text-generation` con mensajes en formato de rol `user`).
- Generacion condicionada por prompt en formato conversacional de un solo turno (el ejemplo usa una lista con un diccionario `{"role": "user", "content": ...}`).
- Capacidad multilingue: no acreditada. El modelo base esta asociado al neerlandes (`nld_latn`) y no hay declaracion de otros idiomas.
- Razonamiento, matematicas y generacion de codigo: no documentados ni evaluados.
- Tool calling / function calling: no documentado ni soportado de forma explicita.
- Uso en agentes y razonamiento multi-paso: no documentado; el tamano y la ausencia de entrenamiento especifico lo hacen poco adecuado.
- Modo de pensamiento (thinking), vision o audio: no disponibles.
- Capacidad de ajuste adicional: al ser un modelo pequeno y basado en GPT-2, es viable reajustarlo o destilarlo en entornos de investigacion con recursos limitados.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el modelo permite replicar el pipeline SFT de TRL sobre el corpus neerlandes de 100 MB con una semilla concreta, util para estudiar la varianza entre semillas en experimentos academicos.
- Linea base en evaluacion de generacion de texto en neerlandes: sirve como referencia de bajo coste para comparar tecnicas de ajuste, tokenizacion o muestreo frente a modelos mayores en la misma lengua.
- Pruebas de infraestructura y CI de despliegue: con 87 M de parametros, permite validar pipelines de servido (transformers, vLLM, TGI, llama.cpp, Ollama) en segundos y sin GPU dedicada antes de escalar a modelos grandes.
- Generacion de texto sintetico para aumento de datos: puede producir borradores en neerlandes que, tras filtrado humano, amplien corpus pequenos en tareas de clasificacion o etiquetado.
- Docencia y formacion: adecuado para explicar de extremo a extremo el ciclo completo de un LLM (tokenizacion, ajuste supervisado, publicacion en HuggingFace, inferencia con `pipeline`) sin necesidad de hardware especializado.
- Inferencia en el borde o en CPU: al ocupar del orden de 50 a 350 MB segun la precision, es factible ejecutarlo en dispositivos sin GPU, portatiles antiguos o entornos con restricciones de memoria para demos interactivas.
- Investigacion sobre sesgos y comportamiento de modelos monocorpus: su tamano reducido facilita analisis de atributos, de contaminacion de datos y de deriva del lenguaje en corpus pequenos.
- Prototipado rapido de interfaces conversacionales: valido para probar el formato de mensajes y el flujo de una aplicacion antes de sustituir el backend por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32, 175 MB en fp16/bf16, 90 MB en int8 y entre 50 y 60 MB en cuantizacion de 4 bits (estimaciones derivadas de los 86,7 M de parametros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas y solo se justifican para procesar lotes muy grandes.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual e incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es plenamente viable gracias al tamano reducido del modelo.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado), vLLM, HuggingFace TGI, llama.cpp y Ollama (requieren conversion previa a GGUF), asi como exportacion a ONNX.
- Latencia y throughput estimados: no disponibles. En modelos de este tamano el rendimiento suele estar limitado por el ancho de banda de memoria y por la sobrecarga de la propia libreria de inferencia, mas que por la computacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_uniform-100mb_seed455` | 86,7 M | no disponible | no declarado (base neerlandes) | no disponible | HuggingFace, safetensors |
| `goldfish-models/nld_latn_100mb` (modelo base) | mismo orden de magnitud (es el modelo base) | no disponible | neerlandes (`nld_latn`) | no disponible en la informacion proporcionada | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens (dato publico general) | ingles principalmente | MIT (dato publico general) | HuggingFace, safetensors |
| `Qwen2.5-0.5B` | 0,49 B | 32 768 tokens (dato publico general) | multilingue (29 idiomas) | Apache 2.0 (dato publico general) | HuggingFace, safetensors, GGUF |

Los datos de GPT-2 small y Qwen2.5-0.5B provienen de sus fichas publicas y no han sido verificados en la informacion proporcionada para esta ficha; se incluyen solo como referencia de categoria. No hay datos de rendimiento comparado disponibles para ningun par de estos modelos en el contexto neerlandes.

## Limitaciones y advertencias

- Tamano muy reducido: con 86,7 M de parametros y un corpus base de 100 MB, la cobertura de conocimiento factual y la coherencia en generaciones largas son limitadas en comparacion con modelos de miles de millones de parametros.
- Riesgo elevado de alucinacion: no hay evaluacion publicada que cuantifique la tasa de errores factuales, y en modelos de este tamano suele ser alta.
- Licencia no disponible: la model card incluye el marcador «licence: license» sin especificar terminos. No hay base juridica clara para uso comercial, por lo que se desaconseja su empleo en produccion sin aclarar la licencia con el autor.
- Idiomas no declarados: aunque el modelo base corresponde a neerlandes, no se confirma el alcance linguistico real del ajuste fino; el uso en castellano u otras lenguas no esta respaldado.
- Longitud de contexto desconocida: no se documenta la ventana maxima; la model card usa `max_new_tokens=128`, lo que sugiere generaciones cortas, pero no permite deducir el limite real.
- Sin datos de alineacion: no se documenta RLHF, DPO ni filtrado de seguridad, por lo que no hay garantias sobre toxicidad, sesgos ni comportamiento ante prompts adversarios.
- Dataset de entrenamiento no documentado: se desconoce la composicion del corpus de ajuste, lo que impide evaluar contaminacion de datos, sesgos de dominio o cumplimiento de derechos de autor.
- Naturaleza de un solo experimento: el sufijo `seed455` indica una ejecucion concreta; los resultados pueden variar de forma notable con otras semillas.
- Ausencia de evaluacion: no hay benchmarks, cartas de evaluacion ni comparaciones publicadas, lo que impide afirmar nada sobre su calidad relativa.
- Soporte de agentes, tool calling y razonamiento multi-paso: no existen indicios de que esten implementados ni evaluados.
- Estado del repositorio: cero descargas y cero «likes» en el momento de la consulta, lo que reduce la probabilidad de que exista validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_uniform-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/aak2jek8
- Cita de TRL (von Werra et al., 2020), incluida en la model card: repositorio GitHub de TRL
- Resultados de busqueda web: no se han encontrado enlaces relevantes. Las URL devueltas por la busqueda no guardan relacion con el modelo ni con el proyecto Goldfish, por lo que no se han incluido.
