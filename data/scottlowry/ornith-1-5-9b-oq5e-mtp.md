# scottlowry/Ornith-1.5-9B-oQ5e-mtp

## Resumen
Ornith-1.5-9B-oQ5e-mtp es una cuantizacion mixta de precision del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint de aproximadamente 9.653 millones de parametros logicos en formato MLX, pensado para inferencia en hardware Apple Silicon. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que aplica precision mixta por tensor en lugar de un unico nivel de bits para todo el modelo.

El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (8.954B parametros), un codificador de vision (0.456B) y una cabeza MTP (Multi-Token Prediction, 0.243B). El resultado ocupa 7.504 GB en disco (6.989 GiB) con un promedio efectivo de 6.219 bits por peso, lo que lo hace desplegable en equipos con memoria unificada relativamente modesta. La arquitectura declarada en los tags es qwen3_5, lo que sugiere una familia derivada de Qwen 3.5.

La relevancia de esta ficha es practica: permite evaluar si el checkpoint cuantizado conserva las capacidades del modelo base (vision y prediccion multi-token incluidas) y si su formato MLX encaja en un flujo de trabajo local en macOS. La informacion publica es escasa: no hay model card detallada del autor de la cuantizacion mas alla de las tablas de bits, ni datos de benchmarks, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag qwen3_5); incluye vision encoder y cabeza MTP |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit (grupo 64), 6-bit (grupo 64), 8-bit (grupo 64) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx), cuantizacion oQ |
| Bits efectivos por peso | 6.219 (promedio del checkpoint completo) |
| Tamano en disco | 7.504 GB / 6.989 GiB |
| Tamano del repo | 22.2 GB |
| Modelo base | ornith-ai/Ornith-1.5-9B |

## Arquitectura y entrenamiento
El checkpoint deriva de ornith-ai/Ornith-1.5-9B, cuyo tag de arquitectura es qwen3_5. La estructura interna incluye un modelo de lenguaje de 8.954B parametros, un modulo de vision de 0.456B y una cabeza MTP de 0.243B. La presencia de MTP (Multi-Token Prediction) implica que el modelo puede predecir varios tokens por paso, lo que en teoria mejora el throughput en decodificacion, aunque no se detalla como se entreno ni con que datos.

La cuantizacion aplicada por oQ es de precision mixta: el 76,813% de los pesos logicos (7.415B) se almacena en affine 5-bit con grupo 64 (5,50 bits efectivos), el 17,880% (1.726B) en 6-bit (6,50 bits efectivos), el 0,224% (0.022B) en 8-bit y el 5,083% (0.491B) se mantiene en BF16 sin cuantizar. Esta distribucion sugiere que las capas mas sensibles (probablemente embeddings, normas o componentes de vision) conservan mayor precision. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades
- Generacion de texto y razonamiento: heredadas del modelo base Ornith-1.5-9B, aunque no se documentan capacidades especificas en la informacion disponible.
- Vision: el checkpoint incluye un modulo de vision de 0.456B parametros, por lo que cabe esperar soporte de entrada de imagenes, si bien no se detalla la tarea (VQA, captioning, OCR).
- Prediccion multi-token (MTP): la cabeza dedicada permite decodificacion especulativa o generacion de varios tokens por paso, lo que puede reducir latencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 7.504 GB, por lo que puede cargarse en Macs con 16 GB de memoria unificada o mas, usando la libreria mlx y el runtime de oMLX. Es adecuado para prototipado offline sin GPU dedicada.
- Asistentes con entrada visual: el modulo de vision de 0.456B permite construir asistentes que procesen capturas de pantalla o documentos escaneados en local, siempre que se valide empiricamente la calidad del encoder cuantizado.
- Generacion de texto de baja latencia en portatiles: gracias a la cabeza MTP y a la cuantizacion 5-bit mayoritaria, el modelo puede servir respuestas en entornos con recursos limitados donde un modelo de 9B en BF16 no cabria.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la degradacion de un modelo 9B al pasar de BF16 a 6.219 bits efectivos, comparando con otras recetas (GPTQ, AWQ, GGUF Q5_K_M).
- Despliegue en pipelines de edicion y resumen: con contexto no documentado, se puede usar para tareas de transformacion de texto en local, aunque habria que fijar la ventana de contexto real antes de produccion.
- Prototipos de razonamiento multimodal: combinando vision y MTP, sirve para experimentar con tecnicas de decodificacion especulativa en tareas que combinan imagen y texto, siempre con validacion previa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 7.504 GB de pesos en disco; en carga se necesita ademas overhead de KV cache y activaciones, por lo que se recomienda un minimo de 12-16 GB de memoria unificada.
- GPU recomendadas: el formato es MLX, disenado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin conversion.
- Cabe en consumer GPU: si, en Macs con 16 GB o mas de memoria unificada. En GPUs NVIDIA consumer requeriria conversion a otro formato (por ejemplo GGUF o safetensors estandar), no incluida en este repo.
- Opciones de despliegue: libreria mlx y oMLX (https://github.com/jundot/omlx). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ5e-mtp | 9.653B | no disponible | Mixta 5/6/8-bit + BF16 (6.219 bits/peso) | no disponible | MLX safetensors |
| ornith-ai/Ornith-1.5-9B (base) | 9.653B | no disponible | BF16 (presumiblemente) | no disponible | safetensors |
| Alternativas de 9B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias
- La cuantizacion mixta a 6.219 bits efectivos puede degradar tareas sensibles a precision, como matematicas o codigo, respecto al modelo base en BF16; no hay evaluacion publicada que lo cuantifique.
- El modulo de vision se almacena en 0.912 GB (0.849 GiB), pero no se especifica que capas han quedado en BF16 ni el impacto en calidad visual.
- No se declara licencia, lo que impide confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-9B antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar cargas de contexto largo.
- El checkpoint esta atado al ecosistema MLX; no es portable a CUDA sin conversion manual.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- El autor indica que el modelo se re-cuantizo el 2026-11-11 con oMLX v0.7.4.dev1; copias anteriores pueden diferir y deberian descartarse.

## Enlaces
- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ5e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
