# Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-MLX

## Resumen

Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-MLX es el port oficial para Apple Silicon (MLX) del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollado por DeepSeek-AI y empaquetado por Solstice-AI. Se trata de un modelo de mezcla de expertos (MoE) disperso que combina texto e imagen, con un contexto nativo de 1.048.576 tokens (1M). Está diseñado para ejecutarse en memoria unificada gracias al framework MLX de Apple, lo que permite consultar modelos de gran tamaño en hardware M2/M3/M4 con un rendimiento en torno a 31 tokens/s en Ultra.

El modelo activa aproximadamente 13.000 millones de parámetros por token a pesar de tener alrededor de 305.000 millones en total. Incorpora innovaciones de DeepSeek como Multi-Head Latent Attention (MLA), DeepSeek Sparse Attention (DSA) y Multi-Token Prediction (MTP) para decodificación especulativa. Su relevancia radica en que ofrece una alternativa local y flexible a los modelos cerrados (como GPT-4o o Claude 3.5 Sonnet) en un formato optimizado para la generación de texto, código, matemáticas y comprensión visual de documentos y gráficos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) con Multi-Head Latent Attention (MLA), DeepSeek Sparse Attention (DSA) y módulos de visión |
| Parametros totales | ~305B según README (284.8B en metadatos safetensors) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | MLX mixed-precision (empaquetado lineal uint32 con escalas uint8) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX / Safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-Vision-Exp-MLX se basa en el modelo original de DeepSeek-AI, que es una arquitectura MoE dispersa con 256 expertos enrutados y un total aproximado de 305 mil millones de parámetros. Destaca por el uso de Multi-Head Latent Attention (MLA), que reduce el footprint de la caché KV, y de DeepSeek Sparse Attention (DSA), que optimiza el coste computacional en ventanas largas. El contexto se amplía hasta 1 millón de tokens mediante escalado YaRN (factor 16) sobre una base original de 65.536 tokens.

En cuanto al entrenamiento, se trata de un modelo experimental multimodal que incorpora módulos de visión sobre la arquitectura de DeepSeek-V4-Flash. El README indica que ha experimentado entrenamiento continuado para desbloquear la comprensión visual, pero no se proporcionan datos sobre número de tokens utilizados ni sobre procesos de RLHF o DPO. Desde el punto de vista de la ingeniería, el port de Solstice-AI introduce optimizaciones específicas para Metal y MLX, incluyendo soporte para Multi-Token Prediction (MTP) mediante un drafter Pairable que acelera la generación entre 2 y 3 veces.

## Capacidades

- Generación de texto y razonamiento matemático avanzado, con resultados destacados en MATH-500 y AIME 2025.
- Programación competitiva y desarrollo de software real, alcanzando puntuaciones altas en LiveCodeBench y SWE-bench Verified.
- Comprensión multimodal de imágenes, gráficos y documentos escaneados, cubriendo tareas de MMMU, DocVQA y ChartQA.
- Ejecución agéntica en terminal (Terminal-Bench), incluyendo razonamiento multi-paso y ejecución de comandos CLI.
- Contexto largo de 1M tokens, ideal para procesar repositorios completos o conversaciones extensas.
- Soporte de decodificación especulativa mediante Multi-Token Prediction (MTP) al emparejarse con el drafter dedicado.
- Capacidades multilingües en inglés y chino.
- Uso de herramientas (tool calling) implícito en los benchmarks agénticos.

## Casos de uso

- Analisis de repositorios completos: gracias al contexto de 1M tokens y al rendimiento en SWE-bench, un desarrollador puede alimentar al modelo con toda la base de código de un proyecto para detectar errores, refactorizar módulos o generar documentación técnica interna.
- Extracción de datos en auditorías: el modelo lee informes financieros, facturas y tablas en formato imagen o PDF y extrae valores numéricos y gráficos para su posterior procesamiento, con una puntuación superior al 92% en DocVQA y ChartQA.
- Automatización de terminal en macOS: mediante scripts en Python que invocan `mlx-lm`, se puede construir un asistente capaz de ejecutar comandos de shell, interpretar su salida y tomar decisiones correctivas, aprovechando el benchmark Terminal-Bench.
- Tutoría matemática personalizada: el modelo resuelve problemas de olimpiadas y explica los pasos intermedios, resultando adecuado para plataformas educativas que generan ejercicios interactivos.
- Generación de manuales y ayuda técnica: a partir de capturas de pantalla o diagramas de productos, el modelo genera descripciones textuales detalladas y tablas de especificaciones, combinando visión y lenguaje.
- Integración en CI/CD locales: los equipos pueden ejecutar este modelo en sus propias máquinas Apple Silicon para revisar la calidad del código en cada commit, reduciendo la dependencia de APIs cloud.
- Chatbots de soporte bilingües: en empresas chino-hablantes o angloparlantes, el modelo gestiona tickets de soporte con contexto histórico de 1M tokens, manteniendo la conversación sin perder referencias antiguas.

## Benchmarks y rendimiento

Los resultados presentados en el README corresponden a evaluaciones realizadas por Solstice-AI con un harness estándar y decodificación greedy. Se comparan con Claude 3.5 Sonnet y GPT-4o.

| Benchmark | DeepSeek-V4-Flash MLX | Claude 3.5 Sonnet | GPT-4o |
| :--- | :---: | :---: | :---: |
| Terminal-Bench 2.1 | 83.9% | 63.5% | 58.7% |
| SWE-bench Verified | 65.8% | 61.2% | 48.9% |
| LiveCodeBench v6 | 84.2% | 78.4% | 72.8% |
| MATH-500 | 94.6% | 89.2% | 91.4% |
| AIME 2025 | 78.2% | 72.5% | 63.8% |
| MMMU (Multimodal) | 71.4% | 70.4% | 69.1% |
| DocVQA / ChartQA | 92.3% | 91.8% | 89.5% |

El rendimiento de inferencia en Apple Silicon es de aproximadamente 31 tokens por segundo en un M3/M4 Ultra, con un footprint de memoria de 146.4 GiB para el modelo base sin contexto completo.

## Requisitos de hardware

- Apple Silicon: se recomienda M2 Ultra, M3 Ultra, M4 Max o M4 Ultra con 192 GB o más de memoria unificada para servir el contexto completo de 1M tokens.
- Footprint de memoria estimado: ~146.4 GiB para el modelo base en cuantización MLX.
- Sistema operativo: macOS 15.0 (Sequoia) o superior.
- Entorno de ejecución: Python 3.10+, librerías `mlx` y `mlx-lm`.
- Opciones de despliegue disponibles: `mlx-lm` mediante API Python, o la interfaz `inferencer` con soporte CLI y GUI que permite indicar el contexto y el drafter MTP.
- No está optimizado para GPUs NVIDIA ni AMD, ya que depende del framework Metal de macOS. No se dispone de datos de latencia para hardware CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- |
| DeepSeek-V4-Flash-Vision-Exp (MLX) | ~305B (13B activos) | 1M | MIT | Local (Apple Silicon MLX) |
| Claude 3.5 Sonnet | no disponible (propietario) | 200K | Propietaria | API cloud |
| GPT-4o | no disponible (propietario) | 128K | Propietaria | API cloud |

A pesar de que estos modelos cerrados se consideran competidores directos en los benchmarks, el modelo de DeepSeek ofrece la ventaja del despliegue local y el coste cero por petición, además de una licencia MIT que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Idiomas soportados: solo inglés y chino. El modelo no declara soporte para español ni otros idiomas, lo que limita su uso en aplicaciones orientadas a mercados hispanohablantes sin una tarea de afinado previo.
- Hardware exclusivo: está optimizado para Apple Silicon y no se puede desplegar en clústeres con GPUs CUDA sin conversiones adicionales, lo que reduce su integración en plataformas industriales estándar.
- Consumo de recursos muy elevado: el footprint de 146.4 GiB y la recomendación de 192 GB de memoria unificada restringen el despliegue a equipos de gama alta disponibles en el mercado.
- Carácter experimental: al ser una versión "Exp", puede presentar comportamientos menos estables que los modelos estables, especialmente en tareas de razonamiento complejo o generación de código extenso.
- Benchmarks no verificados de forma independiente: las cifras presentadas provienen del README de Solstice-AI. No se ha podido contrastar con evaluaciones externas, por lo que se recomienda una validación propia en los casos de uso críticos.
- Ausencia de alineación documentada: no se muestran procesos de RLHF o DPO, por lo que existe un riesgo de sesgos o respuestas no deseadas en contextos sensibles.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-MLX
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Drafter MTP para decodificación especulativa: https://huggingface.co/Solstice-AI/DeepSeek-V4-Flash-MTP-DSpark-MLX
- Repositorio de DeepSeek-AI (licencia y documentación): https://github.com/deepseek-ai/DeepSeek-V4
