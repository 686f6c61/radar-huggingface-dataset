# scottlowry/Ornith-1.5-122B-oQ8e-mtp

## Resumen
Ornith-1.5-122B-oQ8e-mtp es una cuantizacion mixta de 8 bits del modelo ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. El checkpoint conserva la arquitectura original (etiquetada como qwen3_5_moe en los metadatos de Hugging Face), incluye la torre de vision y una cabeza MTP (multi-token prediction) que se conserva en el proceso de cuantizacion. El resultado es un artefacto de 133,3 GB con 125.086 millones de parametros logicos y una media efectiva de 8,523 bits por peso.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion mixta (oQ, del proyecto oMLX) que asigna precision distinta por tensor: el 96,7 % de los pesos se guarda en affine 8-bit con grupo 64, un 2,9 % en affine 8-bit con grupo 128 y un 0,4 % (0,511B) se mantiene en BF16, presumiblemente capas sensibles a la cuantizacion. Por otro, el formato es MLX, es decir, esta pensado para ejecutarse en Apple Silicon mediante el framework MLX, no en GPUs NVIDIA.

Se trata de una publicacion de comunidad con 265 descargas y 1 like en el momento de la consulta, sin model card detallada mas alla de las tablas de cuantizacion. No se dispone de informacion sobre licencia, idiomas, pipeline ni datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag qwen3_5_moe); incluye torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,086B logicos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 8-bit grupo 64 (120,977B), affine 8-bit grupo 128 (3,599B), BF16 (0,511B); media efectiva 8,523 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Tamano del repo | 133,3 GB (124,118 GiB) |
| Desglose de almacenamiento | LM: 122,112B / 120,763 GiB; vision: 0,451B / 0,841 GiB; cabeza MTP: 2,524B / 2,514 GiB |
| Modelo base | ornith-ai/Ornith-1.5-122B |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |

## Arquitectura y entrenamiento
El checkpoint es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente se identifica en los tags como qwen3_5_moe, lo que sugiere un transformer con mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no se dispone de confirmacion oficial del autor del modelo base ni del numero de expertos, el ratio de activacion ni el total de tokens de entrenamiento. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (122,112B parametros logicos), una torre de vision (0,451B) y una cabeza MTP de prediccion multi-token (2,524B), lo que indica capacidades multimodales y decodificacion especulativa nativa.

La innovacion tecnica principal es el esquema de cuantizacion mixta de oQ. En lugar de aplicar una precision uniforme, el algoritmo asigna affine 8-bit con grupo 64 a la mayoria de los tensores (120,977B), reserva affine 8-bit con grupo 128 para una fraccion pequena (3,599B) y mantiene 0,511B en BF16. El resultado es un checkpoint de 124,118 GiB que ocupa un 33 % menos que su equivalente en BF16 (unos 250 GB para 125B parametros) manteniendo una precision nominal de 8 bits. La cabeza MTP se conserva intacta en la cuantizacion, lo que permite usar decodificacion especulativa en MLX.

## Capacidades
- Generacion de texto y razonamiento: heredadas del modelo base Ornith-1.5-122B, sin datos publicados de evaluacion en esta ficha.
- Vision: el checkpoint incluye una torre de vision de 0,451B parametros, por lo que se espera soporte de entrada de imagenes, aunque no se detalla la resolucion ni el formato.
- Prediccion multi-token (MTP): la cabeza de 2,524B permite decodificacion especulativa para acelerar la inferencia.
- Cuantizacion selectiva: 0,511B parametros en BF16 preservan las capas mas sensibles a la perdida de precision.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Inferencia local en Apple Silicon de alta gama: el formato MLX y el tamano de 124 GiB permiten ejecutar el modelo en un Mac Studio con memoria unificada de 192 GB o superior, algo inviable con el checkpoint BF16 original (unos 250 GB).
- Prototipado de asistentes multimodales en escritorio: la torre de vision incluida permite experimentar con tareas de imagen a texto sin depender de servicios en la nube, siempre que el hardware tenga memoria suficiente.
- Evaluacion de tecnicas de cuantizacion: el desglose por tipo de tensor (grupo 64, grupo 128, BF16) sirve como referencia para estudiar el impacto de la precision mixta en modelos MoE de gran tamano.
- Investigacion sobre decodificacion especulativa: la cabeza MTP conservada permite medir la aceleracion por prediccion multi-token en MLX frente a decodificacion autoregresiva clasica.
- Fine-tuning ligero o LoRA sobre MLX: el checkpoint cuantizado puede servir de base para adaptaciones de bajo rango en entornos Apple, aunque la cuantizacion limita la precision del ajuste.
- Despliegue en estaciones de trabajo con memoria unificada para tareas de generacion de texto de contexto largo: adecuado cuando se prioriza la privacidad y la ejecucion local frente al throughput de un cluster GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 124,118 GiB solo para los pesos; con overhead de KV cache y activaciones se recomienda un minimo de 160-192 GB de memoria unificada.
- GPU recomendadas: no aplica de forma nativa; el formato MLX esta disenado para Apple Silicon (M2 Ultra, M3 Ultra, M4 Max con 128 GB o mas, y Mac Studio con 192 GB o 512 GB).
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB (RTX 4090) ni 48 GB (RTX 6000 Ada); requeriria multi-GPU con NVLink y conversion de formato.
- Opciones de despliegue: mlx-lm y mlx-examples en macOS; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion a GGUF u otro formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ8e-mtp | 125,086B | no disponible | 8,523 bits/peso (mixta) | no disponible | MLX safetensors |
| ornith-ai/Ornith-1.5-122B (base) | 125,086B | no disponible | BF16 | no disponible | safetensors |
| Qwen3.5 MoE de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar rendimiento, contexto o licencia con alternativas concretas de la misma categoria.

## Limitaciones y advertencias
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribucion; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue productivo.
- Model card minima: no hay informacion sobre sesgos, datos de entrenamiento, idiomas ni evaluaciones, lo que impide auditar el modelo.
- Perdida de precision por cuantizacion: aunque la media es de 8,523 bits/peso, el 96,7 % de los pesos usa grupo 64, lo que puede degradar tareas sensibles (matematicas, codigo) frente al checkpoint BF16.
- Riesgo de alucinacion: no cuantificado por el autor; se desconoce el comportamiento real en dominios especializados.
- Dependencia de hardware Apple: el formato MLX no se ejecuta en GPUs NVIDIA sin conversion, lo que limita su portabilidad a infraestructura cloud convencional.
- Repo de comunidad: 265 descargas y 1 like; sin garantias de mantenimiento ni soporte del autor original.
- Fecha de actualizacion: el checkpoint fue recuantizado el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden diferir en precision.

## Enlaces
- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ8e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
