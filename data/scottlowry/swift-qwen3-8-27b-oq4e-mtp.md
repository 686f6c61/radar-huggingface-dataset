# scottlowry/Swift-Qwen3.8-27b-oQ4e-mtp

## Resumen

Swift-Qwen3.8-27b-oQ4e-mtp es una cuantización de precisión mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. Se ha generado con la herramienta oQ de oMLX (versión v0.7.4.dev1) y está empaquetada en formato MLX, es decir, orientada a la inferencia en hardware de Apple Silicon (chips de la serie M). El checkpoint completo pesa 17,5 GB en disco y contiene 27.781 millones de parámetros lógicos, con un promedio efectivo de 5,044 bits por peso.

El modelo base pertenece a la familia Qwen3.5, según los tags del repositorio, e incorpora tres componentes diferenciados: un modelo de lenguaje de 26.896 millones de parámetros, un codificador visual de 0,461 millones y una cabeza MTP (multi-token prediction) de 0,425 millones. Esta última permite decodificación especulativa nativa, lo que puede reducir la latencia de generación al predecir varios tokens por paso. La cuantización mixta asigna distintos niveles de precisión según la sensibilidad de cada tensor: el 69,8 % de los pesos se almacena a 4 bits, el 23,7 % a 5 bits, el 4,6 % a 6 bits, un residual a 8 bits y un 1,86 % se mantiene en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización mixta con oQ sobre un modelo multimodal de ~28B, una técnica que busca preservar calidad en las capas críticas mientras reduce el peso total. Por otro, advierte de que el repositorio no incluye model card sustantiva, licencia declarada ni idiomas soportados, y que el modelo base es a su vez un derivado de Qwen3.5, por lo que las condiciones de uso heredadas deben verificarse en la cadena de dependencias antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16; promedio 5,044 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 17,5 GB (16,314 GiB de pesos) |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Herramienta de cuantizacion | oQ de oMLX v0.7.4.dev1 |
| Desglose de componentes | LM: 26,896B / 15,155 GiB; vision: 0,461B / 0,858 GiB; MTP: 0,425B / 0,301 GiB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5. Los datos del checkpoint permiten inferir una estructura multimodal: un modelo de lenguaje de 26,896B de parametros, un codificador visual de 0,461B y una cabeza de prediccion multi-token (MTP) de 0,425B. La presencia de la cabeza MTP es relevante porque habilita decodificacion especulativa, una tecnica que genera varios tokens candidatos por paso y los valida con el modelo principal, reduciendo la latencia en inferencia autoregresiva.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base recibio ajuste por RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta el proceso de entrenamiento del codificador visual ni la estrategia de fusion multimodal. La unica innovacion tecnica documentada es la propia cuantizacion mixta: oQ asigna precision por tensor segun su sensibilidad, manteniendo en BF16 el 1,857 % de los pesos (0,516B) y en 8 bits un 0,041 % (0,011B), mientras que el grueso se reparte entre 4, 5 y 6 bits con grupos de 64. Este esquema busca un compromiso entre tamano en disco y fidelidad numerica, aunque el autor no publica metricas de degradacion de calidad respecto al modelo original.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo de lenguaje Qwen3.5 subyacente.
- Procesamiento de imagenes: el checkpoint incluye un codificador visual de 0,461B de parametros, lo que indica capacidades multimodales vision-lenguaje, aunque no se detalla su alcance.
- Decodificacion especulativa mediante la cabeza MTP de 0,425B, orientada a reducir la latencia de generacion.
- Razonamiento y codigo: presumiblemente soportados por la familia Qwen3.5, pero no confirmados en la informacion disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 17,5 GB permiten ejecutar el modelo en Macs con memoria unificada de 24 GB o superior, usando la libreria `mlx` o `mlx-lm`. Es el caso de uso principal del checkpoint.
- Prototipado de aplicaciones multimodales en local: el codificador visual integrado permite experimentar con tareas imagen-texto sin depender de APIs externas, siempre que se valide la calidad del codificador cuantizado.
- Evaluacion de cuantizacion mixta: el repositorio sirve como referencia para estudiar el impacto de oQ con precisiones 4/5/6/8 bits sobre un modelo de ~28B, comparando contra el checkpoint original en BF16.
- Investigacion sobre decodificacion especulativa: la cabeza MTP permite medir ganancias de throughput en hardware Apple frente a decodificacion estandar, con la salvedad de que el autor no publica cifras.
- Despliegue de asistentes conversacionales en estaciones de trabajo Mac: para equipos que ya trabajan en macOS y quieren un asistente local sin enviar datos a la nube, sujeto a verificar la licencia heredada.
- Pruebas de pipelines de inferencia MLX frente a otras alternativas (llama.cpp, vLLM): util para comparar rendimiento y calidad en un mismo modelo base con distintas rutas de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,5 GB de pesos en disco; en ejecucion se anade overhead de KV cache y buffers, por lo que se recomienda un minimo de 24 GB de memoria unificada y 32 GB o mas para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y variantes Pro, Max y Ultra) por el formato MLX. No es ejecutable en GPUs NVIDIA o AMD sin conversion previa.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada suficiente; no en GPUs de consumo con 8-16 GB de VRAM en su formato actual.
- Opciones de despliegue: `mlx` y `mlx-lm` son las rutas nativas; para otros entornos seria necesaria una conversion a GGUF o safetensors estandar, no documentada por el autor.
- Latencia y throughput estimados: no disponibles. La cabeza MTP sugiere mejoras de latencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ4e-mtp | 27,781B | no disponible | MLX safetensors, mixto 4/5/6/8-bit | no disponible | Hugging Face, 0 descargas |
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5 (familia original) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad con alternativas de la misma categoria. La comparativa se limita a la relacion entre el checkpoint cuantizado y su modelo base.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, y el modelo base tampoco la documenta en la informacion disponible. Antes de uso comercial es imprescindible rastrear la licencia de Qwen3.5 y de ukisai/Swift-Qwen3.8-27b.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Riesgo de degradacion por cuantizacion: el 69,8 % de los pesos esta a 4 bits; aunque la precision mixta mitiga el impacto, no se publican metricas de divergencia respecto al modelo en BF16.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, etnia, idioma o dominio.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no se puede acotar su magnitud.
- Contexto no disponible: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- Dependencia de Apple Silicon: el formato MLX limita el despliegue a hardware Apple; no hay conversion documentada a otros runtimes.
- Model card minima: no se documentan limitaciones, casos de uso previstos ni instrucciones de uso, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ4e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
