# JoshuaCalhoon/ornith-ai-Ornith-1.5-35B-A3B-MTPLX

## Resumen

El modelo `JoshuaCalhoon/ornith-ai-Ornith-1.5-35B-A3B-MTPLX` es una adaptación con predicción multi-token (MTP) del modelo `ornith-ai/Ornith-1.5-35B-A3B`, un Mixture-of-Experts (MoE) de 35.107 millones de parámetros totales que activa aproximadamente 3.000 millones por token. Esta variante ha sido forjada con la herramienta MTPLX Forge y está pensada para ejecutarse en Apple Silicon mediante MLX, el framework de aprendizaje automático de Apple.

Su relevancia radica en la optimización de la velocidad de decodificación: según la verificación incluida en la model card, alcanza un multiplicador de 1.40× frente a una línea base autoregresiva, validado en un Apple M5 Pro con un sampler concreto (temperatura 0.6, top_p 0.95, top_k 20). El modelo base, según la información disponible, destaca en tareas de generación de código y agentic, superando a modelos como Qwen 3.6-35B, Gemma 4-31B y Muse Glimmer-30B en esos ámbitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); las etiquetas del repositorio indican `qwen3_5_moe`, lo que sugiere una base Qwen3.5 MoE, aunque no está confirmado en la model card |
| Parametros totales | 35.107.180.016 |
| Parametros activos | ~3.000.000.000 (según la descripción del modelo original Ornith-1.5-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (según etiquetas del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "See LICENSE" sin especificar) |
| Formato de pesos | safetensors (según etiquetas) y MLX (para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo es una adaptación MTPLX del MoE `Ornith-1.5-35B-A3B`. La técnica MTPLX añade una capa de predicción multi-token que permite anticipar varios tokens en cada paso de decodificación, en lugar de uno solo. Esto se traduce en una aceleración medida de 1.40× frente a la decodificación autoregresiva estándar, según la verificación realizada en un Apple M5 Pro.

El modelo base Ornith-1.5-35B-A3B forma parte de una familia que, según la información de Ornith AI, utiliza un enfoque de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones. No se han proporcionado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y código: el modelo base está orientado a tareas de programación y agentic, superando en benchmarks a modelos como Qwen 3.6-35B, Gemma 4-31B y Muse Glimmer-30B.
- Razonamiento agéntico: la información disponible indica un rendimiento destacado en benchmarks de agentic coding, lo que sugiere capacidad para planificar y ejecutar tareas de software de forma autónoma.
- Predicción multi-token: la adaptación MTPLX permite decodificar varios tokens por paso, mejorando el rendimiento en Apple Silicon.
- Ejecución local en MLX: el modelo está optimizado para el framework MLX, por lo que puede ejecutarse en Macs con Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el rendimiento en agentic coding sugiere cierta capacidad.
- Capacidades multilingues: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de programación local en macOS: gracias a su rendimiento en benchmarks de coding, el modelo puede ejecutarse en un Mac con Apple Silicon mediante MLX, ofreciendo autocompletado y generación de código sin necesidad de servicios en la nube.
- Agentes de automatización de software: su rendimiento en agentic coding lo hace adecuado para integrarse en pipelines que requieren que el modelo proponga y ejecute cambios en repositorios de código, como refactorización o generación de pruebas.
- Herramientas de desarrollo integradas: puede incorporarse en editores de código o IDEs para proporcionar sugerencias contextuales y explicaciones de fragmentos de código en tiempo real.
- Investigación en eficiencia de inferencia: la capa MTPLX ofrece un caso de estudio para medir la aceleración de la decodificación multi-token en hardware Apple, útil para trabajos sobre técnicas de predicción especulativa.
- Prototipado de aplicaciones conversacionales en Mac: desarrolladores que necesiten un modelo de lenguaje local para probar ideas rápidamente pueden usar `mtplx start chat` y ejecutar el modelo en su máquina sin depender de GPU dedicada.
- Análisis y revisión de código en repositorios locales: el modelo puede resumir, explicar o detectar patrones en bases de código grandes, aprovechando su capacidad de razonamiento agéntico para tareas de mantenimiento de software.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card del modelo original indica que Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de coding y agentic, y supera a Gemma 4-31B y Muse Glimmer-30B por márgenes amplios en agentic coding, pero sin cifras concretas. Para la variante MTPLX, solo se proporciona el multiplicador de rendimiento frente a la línea base autoregresiva: 1.40×, verificado en Apple M5 Pro con los parámetros de muestreo indicados.

## Requisitos de hardware

- El tamaño del repositorio es de 39.4 GB, lo que sugiere que los pesos en formato 8-bit ocupan aproximadamente esa cantidad. Para cargar el modelo completo en memoria unificada se recomienda un Mac con al menos 48 GB de RAM.
- GPU recomendada: Apple Silicon, con verificación específica en Apple M5 Pro. También debería funcionar en otros chips M-series compatibles con MLX.
- No está diseñado para GPU de consumo (NVIDIA/AMD), ya que la adaptación MTPLX está orientada a MLX.
- Opciones de despliegue: runtime MTPLX, mediante comandos como `mtplx pull` y `mtplx start chat`. También puede cargarse con MLX directamente si se conoce la estructura de pesos.
- Latencia y throughput: no disponible. El único dato de rendimiento es el multiplicador de 1.40× frente a la decodificación autoregresiva en Apple M5 Pro.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MTPLX | 35.1B | ~3B | no disponible | no disponible | HuggingFace |
| Ornith-1.5-35B-A3B (original) | 35B | ~3B | no disponible | no disponible | HuggingFace |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible | no disponible |

Según la información disponible, el modelo original supera a Qwen 3.6-35B en coding y agentic, y a Gemma 4-31B y Muse Glimmer-30B en agentic coding. La variante MTPLX añade la capa de predicción multi-token, con un multiplicador de 1.40× frente a la línea base autoregresiva, lo que la diferencia del modelo original en términos de velocidad de decodificación en Apple Silicon.

## Limitaciones y advertencias

- Licencia no especificada: el README indica "See LICENSE", pero no se proporciona el texto ni el tipo de licencia, lo que impide conocer las restricciones de uso comercial.
- Idiomas soportados no disponibles: se desconoce qué idiomas cubre el modelo, lo que limita su uso en aplicaciones multilingües.
- Longitud de contexto no disponible: no se especifica la ventana de contexto, un dato crítico para tareas que requieren procesar documentos largos.
- Dependencia de MTPLX: el modelo requiere el runtime MTPLX para ejecutarse, lo que restringe su uso a ese ecosistema y a Apple Silicon.
- Verificación limitada: solo se ha verificado en un Apple M5 Pro con un sampler concreto; el rendimiento puede variar en otros dispositivos o con otros parámetros de muestreo.
- Repositorio con 0 descargas y 0 likes: indica que es un modelo muy nuevo y sin validación de la comunidad.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede presentar sesgos y generar contenido ficticio, aunque no se dispone de información específica al respecto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/JoshuaCalhoon/ornith-ai-Ornith-1.5-35B-A3B-MTPLX
- Modelo original (FP8): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- MTPLX Forge: https://github.com/youssofal/MTPLX
- Sitio web de Ornith AI: https://ornith.ai/
