# jancirnodziewiaty/Dark-Craving-31B-v3.0-oQ4e-mtp

## Resumen

Dark-Craving-31B-v3.0-oQ4e-mtp es una cuantización mixta del modelo Dark-Craving-31B-v3.0, publicada por el usuario jancirnodziewiaty. El checkpoint emplea la herramienta oQ (oMLX v0.8.0rc1) para aplicar cuantización de precisión mixta sobre los pesos originales, con un promedio efectivo de 5,167 bits por peso y un tamaño final de repositorio de 20,5 GB. Está etiquetado con la arquitectura `gemma4`, lo que sitúa el modelo base en la familia Gemma 4 de Google, aunque la model card no aporta confirmación explícita del desarrollador original.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (30.704B parámetros lógicos), un módulo de visión (0.570B) y una cabeza MTP (Multi-Token Prediction, 0.470B). Esta última permite decodificación especulativa nativa, orientada a acelerar la generación en hardware Apple Silicon mediante la librería MLX.

La relevancia de esta ficha radica en que se trata de una publicación derivada de un modelo comunitario, sin model card técnica detallada, sin licencia declarada y sin resultados de benchmarks. La información disponible se limita a la distribución de cuantización y al desglose de almacenamiento, por lo que muchos parámetros de evaluación quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `gemma4`), con cabeza MTP para predicción multi-token |
| Parametros totales | 31.742.607.472 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit (grupo 64), affine 5-bit (grupo 64), affine 6-bit (grupo 64) y BF16; promedio efectivo 5,167 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |
| Tamano del repositorio | 20,5 GB (19,094 GiB de pesos) |
| Componentes | Lenguaje 30,704B (17,159 GiB), visión 0,570B (1,061 GiB), cabeza MTP 0,470B (0,875 GiB) |
| Modelo base | ReadyArt/Dark-Craving-31B-v3.0 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero. La model card únicamente documenta el proceso de compresión mediante oQ (oMLX v0.8.0rc1), que asigna precisión de forma no uniforme: el 68,645% de los pesos lógicos (21,790B) se almacenan en affine 4-bit con grupo de 64, el 27,141% (8,615B) en affine 5-bit, el 0,937% (0,297B) en affine 6-bit y el 3,278% (1,040B) se mantienen en BF16. Esta distribución sugiere que las capas consideradas más sensibles conservan mayor precisión, aunque la model card no detalla el criterio de asignación ni qué módulos concretos reciben cada formato.

La etiqueta `gemma4` apunta a una arquitectura transformer de la familia Gemma 4, con un módulo de visión integrado (0,570B parámetros) que habilita entrada de imágenes. La presencia de una cabeza MTP de 0,470B indica que el modelo base incorpora predicción multi-token, técnica que permite proponer varios tokens por paso y validarlos en paralelo, reduciendo la latencia de decodificación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base aplicó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base de 31B.
- Procesamiento de imágenes: el componente de visión de 0,570B parámetros permite entrada multimodal, aunque no se detalla la resolución soportada ni tareas concretas.
- Predicción multi-token (MTP): la cabeza dedicada de 0,470B habilita decodificación especulativa para acelerar la inferencia.
- Ejecución en Apple Silicon mediante MLX, con pesos ya cuantizados para reducir el uso de memoria unificada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 19,094 GiB permite ejecutar un modelo de 31B en equipos Apple Silicon de gama alta (64 GB o más), usando MLX como backend nativo y aprovechando la cuantización mixta para reducir el consumo de memoria frente a BF16.
- Prototipado de aplicaciones multimodales en local: el módulo de visión integrado permite experimentar con tareas imagen-texto sin depender de APIs externas, útil para pruebas de concepto en entornos de desarrollo con hardware Apple.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir la ganancia de throughput frente a decodificación autoregresiva estándar en MLX, un caso relevante para investigadores que comparan estrategias de aceleración.
- Generación de texto asistida en escritorio: integración en herramientas de productividad para macOS mediante MLX, con un modelo de 31B que ofrece mayor calidad que alternativas de 7B-13B a costa de más memoria.
- Fine-tuning ligero sobre la base cuantizada: aunque el checkpoint está cuantizado, sirve como referencia para estudiar el impacto de la precisión mixta en tareas posteriores, comparando contra el modelo base en BF16.
- Investigación sobre cuantización mixta: el desglose detallado por formato (4-bit, 5-bit, 6-bit, BF16) permite analizar qué capas toleran menor precisión y cómo afecta al rendimiento en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 19,094 GiB solo para pesos; con overhead de MLX y caché KV, se recomienda un mínimo de 24-32 GB de memoria unificada, y 64 GB para contexto largo o lotes mayores.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra) por la dependencia de MLX. No se documenta soporte para CUDA.
- ¿Cabe en GPU consumer? En Apple Silicon con 32 GB o más, sí; en GPUs NVIDIA consumer no hay soporte MLX documentado en esta publicación.
- Opciones de despliegue: MLX (librería declarada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. La cabeza MTP está diseñada para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Dark-Craving-31B-v3.0-oQ4e-mtp | 31,74B | no disponible | Mixta 4/5/6-bit + BF16 (5,167 bits/peso) | no disponible | safetensors (MLX) |
| ReadyArt/Dark-Craving-31B-v3.0 (base) | 31,74B (estimado) | no disponible | BF16 (presumiblemente) | no disponible | no disponible |
| Gemma 4 (familia, referencia) | no disponible | no disponible | Múltiples | Términos de Google | safetensors, GGUF |

La comparación con otras alternativas de 30B en MLX no está disponible en la información proporcionada. El modelo base ReadyArt/Dark-Craving-31B-v3.0 es la referencia directa, pero su model card no se ha incluido en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial, lo que impide asumir permisos de redistribución o explotación en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan estimar la calidad frente a alternativas.
- Modelo derivado de un modelo comunitario: la cadena de procedencia (Gemma 4 → ReadyArt/Dark-Craving-31B-v3.0 → esta cuantización) añade incertidumbre sobre los términos heredados y la fidelidad del ajuste original.
- Riesgo de degradación por cuantización: el 68,645% de los pesos en 4-bit puede afectar a tareas sensibles a precisión, como matemáticas o código; no se aportan evaluaciones comparativas contra el base en BF16.
- Dependencia de MLX: la librería limita el despliegue a hardware Apple; no hay pesos GGUF ni compatibilidad documentada con ecosistemas CUDA.
- Riesgo de alucinación y sesgos: no documentado, pero inherente a cualquier modelo de lenguaje de esta escala sin evaluaciones publicadas.
- Contexto desconocido: sin longitud de contexto declarada, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Publicación con 0 descargas y 0 likes: sin validación comunitaria que respalde la calidad de la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/Dark-Craving-31B-v3.0-oQ4e-mtp
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-31B-v3.0
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
