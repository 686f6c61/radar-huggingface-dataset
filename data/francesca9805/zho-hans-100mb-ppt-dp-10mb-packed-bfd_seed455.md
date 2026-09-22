# francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

El modelo `francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed455` es un ajuste fino por supervisión (SFT) del modelo base `goldfish-models/zho_hans_100mb`, un transformer decoder-only de tipo GPT-2 con 124.770.816 parametros (aproximadamente 125 M) y un repositorio de 0,3 GB en formato safetensors. Lo publica el usuario francesca9805 (perfil vinculado a la Universidad de Groningen segun la URL del experimento en Weights & Biases) y esta entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

Se trata de un modelo de investigacion, no de un modelo de proposito general: el nombre del repositorio sugiere un experimento de ajuste sobre un subconjunto empaquetado de datos de unos 10 MB con una semilla fija (seed455), probablemente dentro de un estudio comparativo de tokenizadores y recipes de entrenamiento para lenguas de bajos recursos. La nomenclatura `zho-hans` del modelo base remite a chino simplificado, por lo que su ambito linguistico esperable es el chino.

Su relevancia actual es limitada como producto, pero alta como artefacto reproducible: permite estudiar el efecto de un SFT muy corto sobre un modelo pequeno, auditar el pipeline de TRL y comparar variantes con semillas y subconjuntos de datos distintos. No dispone de descargas ni de "likes" en el momento de redactar esta ficha, no declara licencia y no publica resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura GPT-2 original emplea 1024 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el modelo esta en safetensors sin cuantizar) |
| Idiomas soportados | no disponible en la model card; la nomenclatura `zho-hans` del modelo base indica chino simplificado |
| Licencia | no disponible (el campo de la model card contiene el literal generico `licence: license`) |
| Formato de pesos | safetensors (compatible con la libreria `transformers`) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/zho_hans_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.5.1+cu121 |
| Fecha de creacion en HuggingFace | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subbloque y embeddings de tokens y posiciones aprendidos. Con 124.770.816 parametros, el modelo coincide practicamente con el tamano de GPT-2 base (124 M), aunque se desconoce si la configuracion exacta (numero de capas, cabezas y dimension oculta) se ha modificado respecto al modelo base de goldfish-models. Al ser un ajuste fino, no hay innovaciones arquitectonicas propias: no emplea atencion lineal, ni mezcla de expertos, ni decodificacion especulativa nativa.

El entrenamiento se ha realizado con TRL en su flujo de SFT, partiendo de `goldfish-models/zho_hans_100mb`. Las versiones declaradas del entorno son TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, y existe un registro del run en Weights & Biases. El identificador del modelo (`ppt`, `Dp-10mb`, `packed`, `bfd`, `seed455`) apunta a un dataset empaquetado de aproximadamente 10 MB derivado de un corpus mayor, con una semilla concreta, lo que sugiere un experimento de ablacion mas que un entrenamiento orientado a produccion. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva basica en el dominio e idioma para el que fue ajustado (presumiblemente chino simplificado, segun la nomenclatura del modelo base).
- Conversacion de un solo turno mediante el pipeline de `text-generation` con formato de mensajes de rol (`user`/`assistant`), tal como muestra el ejemplo de la model card.
- Razonamiento, matematicas y generacion de codigo: no hay evidencia publicada de que estas capacidades esten presentes o sean utilizables a este tamano y con este volumen de ajuste.
- Tool calling / function calling: no disponible; no se documenta soporte de plantillas de herramientas ni de esquemas JSON.
- Uso como agente o razonamiento multi-paso: no disponible; no se documentan capacidades agenticas ni modos de pensamiento (`thinking`).
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Multilinguismo: no disponible en la model card; el modelo base pertenece a la familia goldfish de modelos por lengua, orientada al chino simplificado.
- Capacidad especial: ninguna declarada. Es un checkpoint de investigacion generado desde `Trainer`.

## Casos de uso

- Reproduccion de experimentos de SFT: sirve como punto de partida para verificar el pipeline de TRL 0.23.0 y comparar el efecto de distintas semillas y subconjuntos de datos sobre un modelo de 125 M, con un coste de computo minimo.
- Estudio de tokenizadores y empaquetado de datos: dado el sufijo `packed` del identificador, es util para analizar como el empaquetado de secuencias y el filtrado (`bfd`) afectan a la perdida y a la calidad del texto generado en un corpus de 10 MB.
- Prototipado en entornos de bajos recursos: al ocupar del orden de 0,25 GB en FP16, permite hacer pruebas de generacion en CPU o en una GPU integrada antes de escalar a un modelo mayor.
- Generacion de datos sinteticos en chino para tareas auxiliares: puede usarse como generador barato de candidatos de texto que luego se filtran con un modelo mayor, siempre asumiendo una calidad baja y necesidad de revision humana.
- Docencia y demostraciones de ajuste fino: es adecuado para mostrar, en un aula o taller, el ciclo completo de SFT (dataset, entrenamiento, publicacion en HuggingFace, registro en W&B) sin requerir hardware dedicado.
- Pruebas de integracion de infraestructura: al incluir las etiquetas `text-generation-inference` y `endpoints_compatible`, sirve para validar despliegues con TGI o endpoints compatibles con la API de HuggingFace en un contenedor pequeno.
- Analisis de sesgos y de calidad en modelos diminutos: permite medir degradacion, repeticiones y alucinacion en un modelo de 125 M ajustado con muy pocos datos, como linea base en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de chino para este checkpoint, y tampoco se han publicado mediciones de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 unos 0,5 GB; en FP16/BF16 unos 0,25 GB; en int8 unos 0,13 GB; en int4 unos 0,07 GB (calculado a partir de los 124,77 M de parametros, sin incluir el cache KV).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas e incluso en muchas integradas; tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, Text Generation Inference (TGI) y endpoints compatibles segun las etiquetas del repositorio; vLLM es compatible con arquitecturas GPT-2 si se dispone de la configuracion, y llama.cpp u Ollama requeririan una conversion a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas; al tratarse de un modelo de 125 M, la latencia por token sera muy baja en GPU y notablemente mayor en CPU, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed455 | 124,77 M | no disponible (GPT-2 base usa 1024) | no disponible | safetensors en HuggingFace, 0 descargas | Ajuste SFT de investigacion sobre subconjunto de 10 MB |
| goldfish-models/zho_hans_100mb | 100 MB de corpus de entrenamiento declarado en el nombre; parametros exactos no disponibles | no disponible | no disponible | HuggingFace, modelo base publico | Modelo base del ajuste; familia goldfish por lengua (chino simplificado) |
| GPT-2 (OpenAI, 124 M) | 124 M | 1024 tokens | MIT (modelo original de OpenAI) | Ampliamente disponible en safetensors y GGUF | Referencia de la misma arquitectura y tamano, sin ajuste especifico para chino |
| Qwen2.5-0.5B | ~0,49 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF y multiples runtimes | Alternativa moderna multilingue con contexto largo; mayor coste de memoria |

Los datos de rendimiento comparado no estan disponibles para el modelo analizado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un corpus de entrenamiento de aproximadamente 10 MB hereda y amplifica los sesgos de la fuente original y carece de diversidad suficiente para mitigarlos.
- Riesgo de alucinacion: alto. Un modelo de 125 M ajustado con muy pocos datos tiende a repetir, divagar y generar contenido facticamente incorrecto con fluidez aparente.
- Limitaciones de contexto e idioma: la model card no declara idiomas; la nomenclatura `zho-hans` sugiere uso en chino simplificado, por lo que el rendimiento en castellano u otras lenguas sera presumiblemente muy pobre. La ventana de contexto, si sigue el valor estandar de GPT-2, es de 1024 tokens.
- Restricciones de licencia: el campo de licencia contiene el literal `licence: license`, sin terminos concretos. No se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Modelo sin validacion externa: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones de terceros ni resultados de benchmarks.
- Idoneidad para produccion: baja. No hay garantias de calidad, no se documenta el dataset de SFT, no hay versiones cuantizadas ni soporte declarado de plantillas de chat o de tool calling.
- Fecha de publicacion inusual: la fecha de creacion registrada es 2026-09-22, lo que conviene verificar antes de citar el modelo como referencia temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/70vftg2e
- Paper de referencia de TRL (von Werra et al., 2020): https://github.com/huggingface/trl (citacion BibTeX incluida en la model card)
- No se han encontrado en la busqueda web enlaces adicionales relevantes para este modelo; los resultados obtenidos no guardan relacion con el mismo.
