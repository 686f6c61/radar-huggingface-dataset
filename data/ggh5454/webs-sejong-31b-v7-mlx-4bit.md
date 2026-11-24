# ggh5454/Webs-Sejong-31B-v7-mlx-4bit

## Resumen

Webs-Sejong-31B-v7-mlx-4bit es una cuantizacion en 4 bits del modelo websfactory/Webs-Sejong-31B-v7, publicada por el usuario ggh5454. El artefacto esta empaquetado en formato MLX, el framework de Apple para ejecutar modelos de aprendizaje automatico sobre silicio de la serie M (M1, M2, M3, M4), y se ha generado con la herramienta `mlx_lm.convert` aplicando cuantizacion afin con group size 64. El modelo base pertenece a la familia Gemma 4, segun la etiqueta `gemma4` del repositorio, y cuenta con 30.697.345.280 parametros reales segun los tensores safetensors publicados.

La relevancia de esta ficha es doble. Por un lado, documenta una variante de un modelo de ~31.000 millones de parametros optimizada para inferencia local en Mac, un segmento donde las opciones de modelos grandes en 4 bits son escasas. Por otro, el modelo base esta orientado a coreano e ingles, lo que lo convierte en una alternativa poco comun para tareas bilingues coreano-ingles fuera de los modelos de proposito general dominantes.

La informacion publicada por el autor es minima: la model card se limita a indicar el comando de conversion, el snippet de carga con `mlx_lm` y la herencia de la licencia Gemma del modelo original. No hay datos publicados sobre composicion del dataset de entrenamiento, proceso de alineacion, resultados de benchmarks ni contexto maximo. Esta ficha refleja esa escasez de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `gemma4`; transformer denso, sin confirmacion oficial) |
| Parametros totales | 30.697.345.280 (~30,7 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors en formato MLX (no GGUF) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. La etiqueta `gemma4` sugiere que websfactory/Webs-Sejong-31B-v7 deriva de la familia Gemma 4 de Google, lo que implicaria un transformer denso con atencion multi-cabeza y posible atencion deslizante en algunas capas, pero esta informacion no esta confirmada en la model card. El recuento real de parametros (30,7 B) es coherente con un modelo denso de esa escala y no con una arquitectura de mezcla de expertos.

Respecto al entrenamiento, no hay datos publicados sobre numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion tecnica verificable es el proceso de cuantizacion: `mlx_lm.convert` con cuantizacion afin de 4 bits y group size 64, un esquema habitual en MLX que reduce el peso a aproximadamente 4 bits por parametro manteniendo escalas y sesgos por grupo de 64 valores. El tamano del repositorio (17,3 GB) es consistente con esa cuantizacion para ~30,7 B de parametros.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `text-generation` y `conversational` del repositorio.
- Soporte bilingue coreano-ingles, declarado en los metadatos del modelo.
- Inferencia local en Apple Silicon mediante la libreria `mlx_lm`.
- Carga directa con `mlx_lm.load` y generacion con `mlx_lm.generate`, segun el snippet de la model card.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion publicada.

## Casos de uso

- Asistente conversacional bilingue coreano-ingles en local: el modelo puede gestionar dialogos multi-turno en ambos idiomas sobre hardware Apple Silicon, sin depender de APIs externas, gracias a su formato MLX y su cuantizacion 4-bit.
- Prototipado de aplicaciones en Mac: desarrolladores que trabajan en macOS pueden integrar el modelo en scripts Python con `mlx_lm` para experimentar con generacion de texto a escala de 30 B sin salir del portatil o del Mac Studio.
- Procesamiento de texto en coreano para equipos fuera de Corea: al ser uno de los pocos modelos de ~31 B con soporte coreano declarado y formato MLX, sirve para tareas de resumen, reescritura o clasificacion de documentos coreanos en entornos con restricciones de privacidad.
- Evaluacion comparativa de cuantizaciones: investigadores pueden usar este checkpoint como referencia de calidad 4-bit frente al modelo base en fp16/bf16 para medir la degradacion introducida por la cuantizacion MLX.
- Despliegue en estaciones de trabajo Apple para generacion de contenido editorial: redaccion asistida y borradores en ingles y coreano con latencia aceptable en un unico equipo, sin infraestructura GPU dedicada.
- Base para fine-tuning ligero sobre MLX: el formato y el tamano permiten adaptar el modelo con LoRA sobre Apple Silicon para dominios verticales (legal, sanitario, atencion al cliente) en coreano e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente: al estar en formato MLX, el modelo consume memoria unificada del sistema Apple Silicon. Con 17,3 GB de pesos en 4 bits, se necesita al menos ~18-20 GB de memoria unificada libre para cargar el modelo, y mas para el contexto y el KV cache.
- Equipos compatibles: Mac con chip M1/M2/M3/M4 y al menos 24 GB de memoria unificada (MacBook Pro 14/16, Mac Studio, Mac mini M4 Pro). Con 16 GB no es viable; con 32 GB o mas hay margen para contextos largos.
- GPU NVIDIA: no compatible de forma nativa con MLX. Para CUDA habria que reconvertir el modelo a otro formato (por ejemplo GGUF o safetensors estandar), lo que no se ofrece en este repositorio.
- Opciones de despliegue: `mlx_lm` (libreria oficial de Apple) es la via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. Dependeran del chip concreto (M4 Max vs M2 Ultra) y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| Webs-Sejong-31B-v7-mlx-4bit | ~30,7 B | no disponible | MLX safetensors 4-bit | ko, en | Gemma |
| websfactory/Webs-Sejong-31B-v7 (base) | ~30,7 B | no disponible | safetensors (precision original) | ko, en | Gemma |
| Gemma 3 27B (referencia de familia) | 27 B | 128 K (segun documentacion de Google) | safetensors, GGUF, MLX (comunidad) | multilingue | Gemma |

La comparativa con la familia Gemma 3 se incluye como referencia de categoria, no como equivalencia directa, ya que la etiqueta del repositorio apunta a `gemma4` y no se dispone de datos oficiales de ese modelo base. No hay benchmarks publicados que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al derivar de un modelo entrenado principalmente en coreano e ingles, el rendimiento en castellano y otros idiomas no esta garantizado.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad ni de tasa de alucinacion.
- La cuantizacion 4-bit introduce degradacion respecto al modelo base en fp16/bf16; no se han publicado mediciones de esa perdida.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion. Es necesario revisar la licencia completa antes de desplegar en produccion.
- Solo funciona de forma nativa en Apple Silicon con MLX; no es portable a CUDA sin reconversion.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- El autor es un usuario individual (ggh5454), no el desarrollador del modelo base; la calidad de la cuantizacion no esta auditada por websfactory.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggh5454/Webs-Sejong-31B-v7-mlx-4bit
- Modelo base: https://huggingface.co/websfactory/Webs-Sejong-31B-v7
- Libreria MLX: https://github.com/ml-explore/mlx
- Documentacion de `mlx_lm`: https://github.com/ml-explore/mlx-lm
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
