# scottlowry/Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp es una cuantizacion mixta del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry. Se trata de un checkpoint de aproximadamente 27.781 millones de parametros derivado de la familia Qwen3.5, distribuido en formato MLX (safetensors) y pensado para inferencia en hardware Apple Silicon. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1) aplicando precision mixta por tensor, con un promedio efectivo de 6,154 bits por peso sobre el checkpoint completo.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (26.896B parametros), un modulo de vision (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B). La presencia de vision y de la cabeza MTP indica que el modelo base es multimodal y que incorpora decodificacion especulativa mediante prediccion multi-token, lo que puede mejorar el throughput en generacion autoregresiva. El checkpoint ocupa 19,904 GiB en almacenamiento, lo que lo hace viable en equipos Apple con memoria unificada de 32 GB o superior.

La relevancia de esta publicacion es practica: ofrece una version comprimida y ejecutable en MLX de un modelo de ~28B con capacidades multimodales, sin necesidad de GPUs dedicadas. No obstante, la informacion publicada por el autor se limita a los detalles de cuantizacion; no hay datos sobre licencia, idiomas, composicion del entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con modulo de vision y cabeza MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (87,971% de los pesos), affine 6-bit grupo 64 (5,558%), affine 8-bit grupo 64 (4,614%), FP16 (0,198%), FP32 (1,658%); promedio efectivo 6,154 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |
| Tamano del repo | 63,8 GB (checkpoint efectivo 21,372 GB / 19,904 GiB) |
| Desglose por componente | Lenguaje: 26.896B (17,848 GiB); Vision: 0,461B (1,716 GiB); MTP head: 0,425B (0,340 GiB) |
| Libreria | mlx |
| Version de cuantizacion | oMLX v0.7.4.dev1 (actualizado 2026-11-11) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base ukisai/Swift-1.5-Qwen3.8-27b, que a su vez pertenece a la familia Qwen3.5. La arquitectura subyacente es un transformer con un modulo de vision independiente (0,461B parametros) y una cabeza MTP de 0,425B parametros. La cabeza MTP sugiere que el modelo base fue entrenado con objetivos de prediccion multi-token, una tecnica habitual para acelerar la decodificacion mediante propuestas especulativas internas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla la innovacion arquitectonica concreta de Qwen3.5 mas alla de la nomenclatura. Lo unico documentado con rigor es el proceso de cuantizacion: oQ aplica precision mixta asignando 5 bits a la mayoria de los tensores (87,971%), 6 y 8 bits a una fraccion menor, y manteniendo en FP16/FP32 los tensores sensibles (0,198% y 1,658% respectivamente). Esta estrategia busca preservar la calidad en capas criticas mientras reduce el peso total a 6,154 bits/peso de media.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26,9B parametros soporta tareas generativas generales, aunque no hay evaluaciones publicadas que cuantifiquen su calidad.
- Procesamiento de vision: el modulo de vision de 0,461B parametros indica soporte para entrada de imagenes, típicamente en tareas de descripcion, VQA o extraccion de informacion visual.
- Prediccion multi-token (MTP): la cabeza dedicada permite generar varios tokens por paso, lo que puede reducir la latencia en inferencia autoregresiva.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 19,904 GiB, por lo que puede ejecutarse en Mac con memoria unificada de 32 GB o mas usando la libreria mlx. Es adecuado para prototipado y desarrollo sin GPU dedicada.
- Asistente multimodal en escritorio: la combinacion de modulo de vision y modelo de lenguaje permite construir asistentes que procesen capturas de pantalla, documentos escaneados o fotografias y respondan en texto, todo en local.
- Generacion de texto con baja latencia: la cabeza MTP puede aprovecharse para decodificacion especulativa y reducir el tiempo por token en comparacion con un modelo sin MTP del mismo tamano.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta (5/6/8 bits) en la calidad de un modelo de ~28B, comparandolo con el modelo base sin cuantizar.
- Despliegue en entornos con privacidad estricta: al ejecutarse localmente en MLX, los datos no salen del equipo, lo que encaja en escenarios con requisitos de confidencialidad.
- Fine-tuning ligero o adaptacion: al estar en safetensors, puede cargarse con herramientas MLX para experimentos de LoRA o adaptacion a dominios concretos, aunque el autor no documenta recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 19,904 GiB, por lo que se recomienda un minimo de 24 GB de memoria unificada; 32 GB o mas deja margen para el contexto y el runtime.
- Hardware recomendado: equipos Apple Silicon con memoria unificada de 32 GB o superior (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No esta pensado para GPUs NVIDIA, ya que el formato es MLX.
- Cabe en GPU consumer: no aplica en el sentido habitual; requiere Apple Silicon, no CUDA.
- Opciones de despliegue: libreria mlx y el ecosistema oMLX (oQ). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan el formato MLX de este checkpoint.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp | 27,781B | no disponible | MLX safetensors (oQ mixta) | no disponible | Vision + MTP, 19,904 GiB |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,781B (sin cuantizar) | no disponible | safetensors | no disponible | Referencia de calidad; mayor peso |
| Qwen3.5 (familia) | variable | no disponible | safetensors/GGUF | no disponible | Familia de origen; sin datos concretos del checkpoint |
| Alternativas de ~28B en MLX | no disponible | no disponible | MLX | no disponible | No se dispone de comparativas verificadas |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni del modelo base, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue; el rendimiento fuera del ingles o del chino (idiomas habituales en la familia Qwen) es incierto.
- Contexto desconocido: no se ha publicado la longitud de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo; deben asumirse los sesgos tipicos de los modelos entrenados con datos web a gran escala.
- Perdida por cuantizacion: la cuantizacion mixta a 5 bits en el 87,971% de los pesos puede degradar tareas sensibles (matematicas, codigo, razonamiento profundo) respecto al modelo base en FP16; no se han publicado comparativas de calidad.
- Dependencia de MLX: el checkpoint no es portable a CUDA sin conversion, lo que limita su uso a hardware Apple.
- Repo de 63,8 GB: el tamano del repositorio incluye posibles artefactos adicionales; conviene descargar solo los safetensors necesarios.
- Actualizacion reciente: el autor indica que el checkpoint se recuantizo el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden diferir en calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
