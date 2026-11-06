# djtheron/Qwen3.5-9B-heretic-v2-mlx-4Bit

## Resumen

Qwen3.5-9B-heretic-v2-mlx-4Bit es una cuantizacion en formato MLX de 4 bits del modelo trohrbaugh/Qwen3.5-9B-heretic-v2, a su vez una variante "abliterated" (sin las capas de rechazo alineadas) del Qwen3.5-9B de Alibaba Qwen. La conversion la ha realizado el usuario djtheron con mlx-lm 0.31.2, y esta pensada para ejecutar el modelo en hardware Apple Silicon (M1/M2/M3/M4) mediante el framework MLX de Apple.

El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text) y sus 8.953.803.264 parametros totales, empaquetados en un repositorio de 5,1 GB gracias a la cuantizacion de 4 bits. La licencia declarada es Apache 2.0, heredada del Qwen3.5-9B original. Es relevante para quienes quieren experimentar con un modelo de ~9B sin restricciones de contenido en un Mac, aunque su adopcion es muy reducida (89 descargas, 0 likes en el momento de la consulta) y la documentacion tecnica es minima.

La ficha se limita a lo que consta en la informacion disponible: no hay datos publicados sobre composicion del dataset de entrenamiento, benchmarks, idiomas soportados ni detalles de la arquitectura interna mas alla de la etiqueta qwen3_5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag de Hugging Face); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | MLX (safetensors para MLX); tag de libreria transformers y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5 y el pipeline image-text-to-text, que indica que el modelo base es multimodal (acepta imagen y texto como entrada y genera texto). Se trata, por tanto, de un transformer de ~9B parametros con capacidad de vision, aunque no consta el numero de capas, dimensiones ocultas, mecanismo de atencion ni el encoder visual empleado.

El proceso de entrenamiento del modelo base Qwen3.5-9B no se documenta en esta ficha. La variante heretic-v2 procede de trohrbaugh y se etiqueta como "abliterated/uncensored/decensored", lo que implica una modificacion post-entrenamiento orientada a eliminar o reducir los comportamientos de rechazo, pero no se especifican la tecnica exacta (abliteration por direccion de rechazo, fine-tuning, DPO, etc.), el volumen de datos usado ni si hubo RLHF adicional. La unica innovacion tecnica documentada es la conversion a MLX 4 bits con mlx-lm 0.31.2, que permite ejecucion eficiente en Apple Silicon.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversational).
- Entrada multimodal imagen-texto: el pipeline image-text-to-text implica capacidad de procesar imagenes junto a texto, aunque no se detallan tareas concretas (VQA, captioning, OCR).
- Modelo "abliterated": responde sin las capas de rechazo tipicas del modelo alineado original, lo que amplia el rango de peticiones que atiende.
- Ejecucion nativa en Apple Silicon via MLX (mlx-lm), con carga directa desde Hugging Face.
- Soporte de chat template (el ejemplo de la model card usa apply_chat_template).
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con mlx-lm en un Mac con Apple Silicon para experimentar con un modelo de ~9B en 4 bits que ocupa ~5 GB, sin necesidad de GPU dedicada ni servicios en la nube.
- Investigacion sobre alineacion y rechazo: la variante abliterated permite estudiar como cambia el comportamiento del modelo al eliminar las capas de rechazo, comparandolo con el Qwen3.5-9B original en tareas de evaluacion de seguridad.
- Generacion de texto creativo sin filtros: util para escritura de ficcion, guiones o contenido que el modelo alineado rechazaria por defecto, ejecutandose de forma local y privada.
- Procesamiento de imagenes con descripcion textual: al ser image-text-to-text, puede emplearse para generar descripciones o responder preguntas sobre imagenes en flujos locales, siempre que se valide su calidad real con pruebas propias.
- Asistente conversacional offline: integrado en una app de escritorio para Mac mediante MLX, con conversaciones multi-turno sin enviar datos a terceros.
- Banco de pruebas de cuantizacion: comparar la calidad de la version MLX 4 bits frente al modelo base en tareas de generacion para medir la perdida por cuantizacion en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: ~5,1 GB de pesos en 4 bits; con overhead de ejecucion (KV cache, activaciones) se recomienda reservar al menos 6-8 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en consumer hardware: si, en cualquier Mac con 8 GB o mas de memoria unificada; 16 GB o mas ofrece margen comodo.
- Opciones de despliegue: mlx-lm (libreria principal), ecosistema MLX de Apple. No consta soporte de vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| djtheron/Qwen3.5-9B-heretic-v2-mlx-4Bit | ~8,95B | no disponible | MLX 4 bits | Apache 2.0 | Variante abliterated, solo Apple Silicon |
| trohrbaugh/Qwen3.5-9B-heretic-v2 (base) | ~8,95B | no disponible | safetensors | Apache 2.0 | Modelo origen sin cuantizar; requiere GPU o CPU |
| Qwen/Qwen3.5-9B (original) | ~8,95B | no disponible | safetensors | Apache 2.0 | Version alineada con rechazos; referencia de comparacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminacion de las capas de rechazo aumenta el riesgo de generar contenido nocivo, ofensivo o inexacto; no es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser una variante modificada, la fiabilidad puede diferir del Qwen3.5-9B original.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base y los del proceso de abliteration, no evaluados.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar un buen rendimiento en castellano sin pruebas propias.
- Contexto: se desconoce la longitud maxima de contexto, lo que limita el diseno de aplicaciones con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del contenido generado recae en el desplegador.
- Adopcion minima (89 descargas, 0 likes) y documentacion escasa: no hay evidencia de comunidad, issues resueltos ni validacion independiente.
- Exclusivo de Apple Silicon: no se puede ejecutar en GPU NVIDIA/AMD con las herramientas habituales (vLLM, llama.cpp) sin conversion adicional.
- La cuantizacion a 4 bits puede degradar la calidad frente al modelo base; no se han publicado mediciones de esa perdida.

## Enlaces

- Hugging Face: https://huggingface.co/djtheron/Qwen3.5-9B-heretic-v2-mlx-4Bit
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
