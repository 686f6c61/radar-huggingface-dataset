# balllvin/Qwen3.8-27B-NVFP4-MLX

## Resumen

Qwen3.8-27B-NVFP4-MLX es una conversión de pesos del modelo Qwen/Qwen3.8-27B al formato MLX con cuantización NVFP4 de 4 bits, publicada por el usuario balllvin en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos del modelo base de Qwen adaptada para ejecución eficiente en hardware Apple Silicon mediante el framework MLX. El repositorio contiene 27.356.728.560 parámetros en safetensors, lo que sitúa al modelo en la categoría de 27B densos.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, con cero descargas y cero likes en el momento de la consulta, publicado el 15 de noviembre de 2026. La información pública disponible se limita a los metadatos del repositorio, sin model card descriptiva, sin datos de benchmarks y sin documentación sobre el proceso de cuantización. El acceso está restringido (gated), por lo que se requiere aceptar condiciones en Hugging Face antes de descargar los pesos.

El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto), aunque no se dispone de detalles sobre el codificador visual ni sobre la resolución de imagen soportada. La licencia declarada es Apache 2.0, heredada presumiblemente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 de 4 bits (formato MLX); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit NVFP4 |
| Tamano del repositorio | 28,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Acceso | Restringido (gated) |
| Libreria | MLX |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentacion proporcionada. La etiqueta `qwen3_5` sugiere la familia Qwen 3.5/3.8 de Qwen (Alibaba), pero no se confirma ni el tipo de atencion, ni la composicion del dataset de entrenamiento, ni si hubo fases de RLHF o DPO, ni el numero de tokens de preentrenamiento. Tampoco se documenta el proceso de cuantizacion NVFP4 aplicado por el autor de la conversion, ni las herramientas utilizadas (presumiblemente el flujo de conversion MLX de Apple).

Lo unico verificable es que se trata de una conversion de pesos con cuantizacion de 4 bits en formato NVFP4, un esquema de punto flotante de 4 bits con escala por bloque orientado a hardware Blackwell y a implementaciones optimizadas. La integracion con MLX implica que los tensores estan preparados para ejecutarse en GPU unificadas de Apple Silicon mediante `mlx-lm` o `mlx-vlm`, aunque no se documenta la compatibilidad exacta con versiones del framework.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational`.
- Procesamiento image-text-to-text: acepta imagenes y texto como entrada y genera texto, segun el pipeline declarado.
- Razonamiento y codigo: no confirmado en la informacion disponible (se infiere del modelo base, pero no se documenta).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantizacion NVFP4 de 4 bits permiten cargar un modelo de 27B en equipos con memoria unificada de 32-64 GB, sin depender de CUDA ni de GPUs dedicadas. Es el caso de uso principal de esta conversion.
- Prototipado de asistentes multimodales en escritorio: al declarar pipeline image-text-to-text, permite experimentar con entrada de imagenes y texto en un flujo local, util para demos y pruebas de concepto sin coste de API.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de NVFP4 frente a FP16/BF16 del modelo base en tareas de texto e imagen, siempre que se disponga del original para comparar.
- Desarrollo de aplicaciones de vision-lenguaje en local: integrable en herramientas de escritorio basadas en MLX para descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de capturas, con la cautela de que no hay benchmarks publicados.
- Fine-tuning ligero o adaptadores sobre la version cuantizada: no recomendado de forma directa, pero puede servir como base para experimentos de LoRA sobre MLX si el framework lo soporta.
- Distribucion interna en entornos Apple: al tener licencia Apache 2.0, puede integrarse en productos internos de una organizacion que ya opere con hardware Apple, evitando dependencias de proveedores cloud.
- No se recomienda como sustituto de produccion del modelo base sin una evaluacion previa: la ausencia de model card, benchmarks y documentacion de la cuantizacion impide garantizar la paridad de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni del modelo base ni de la conversion cuantizada. Tampoco se documentan metricas de latencia o throughput en hardware Apple.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 28,3 GB en disco para 27,36 B parametros en 4 bits. En ejecucion se requiere al menos esa cantidad de memoria unificada, mas overhead de activaciones y KV cache; como referencia practica, un Mac con 32 GB de memoria unificada es el minimo ajustado y 48-64 GB es recomendable para contextos largos.
- GPU recomendadas: GPU unificadas de Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es compatible con CUDA de forma nativa; el formato MLX esta pensado para Metal.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente. No aplica a GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: `mlx-lm` para texto y `mlx-vlm` para el pipeline multimodal; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es especifico de MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-MLX (este) | 27,36 B | no disponible | MLX 4-bit NVFP4 | Apache 2.0 | Gated, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,36 B (presumible) | no disponible | safetensors originales | Apache 2.0 (presumible) | No verificado en la informacion |
| Otras cuantizaciones del mismo base | no disponible | no disponible | GGUF, AWQ, etc. | no disponible | no disponible |

No se dispone de informacion sobre alternativas comparables verificadas. Cualquier comparacion de rendimiento seria especulativa y no se incluye.

## Limitaciones y advertencias

- Repositorio sin model card: no hay documentacion sobre el proceso de cuantizacion, los hiperparametros usados ni las evaluaciones de calidad tras el paso a 4 bits.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar la calidad de la conversion por parte de la comunidad.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso en pipelines automatizados.
- Riesgo de degradacion por cuantizacion: la conversion a NVFP4 de 4 bits puede introducir perdida de precision en tareas sensibles (matematicas, codigo, razonamiento largo) sin que existan datos publicados que lo cuantifiquen.
- Sesgos y alucinacion: no documentados para este artefacto; se heredan del modelo base, sobre el que tampoco hay informacion en la documentacion proporcionada.
- Compatibilidad limitada: el formato MLX restringe el despliegue a ecosistema Apple Silicon; no es portable a CUDA sin reconversion.
- Idiomas: no se especifican los idiomas soportados ni la cobertura multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantias del autor de la conversion recomiendan auditoria propia antes de produccion.
- Fecha de publicacion futura en los metadatos (2026-11-15): conviene verificar la vigencia y el estado del repositorio antes de depender de el.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/Qwen3.8-27B-NVFP4-MLX
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B (no verificado en la informacion proporcionada)
- Framework MLX: https://github.com/ml-explore/mlx (referencia general, no citado en la informacion)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
