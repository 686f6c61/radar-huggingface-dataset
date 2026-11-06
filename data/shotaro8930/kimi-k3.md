# shotaro8930/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Con 2,8 billones de parámetros totales y 104.000 millones activados por token, se presenta como el primer modelo abierto de clase 3T y está orientado a inteligencia de frontera en programación de largo horizonte, trabajo de conocimiento y razonamiento. El repositorio analizado (`shotaro8930/Kimi-K3`) es una copia del modelo original de Moonshot AI alojada por un tercero, con 0 descargas y 0 likes en el momento de la consulta.

La arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) sobre un esqueleto Mixture-of-Experts (MoE) con 896 expertos, de los que se activan 16 por token, mediante un marco denominado Stable LatentMoE. Incorpora visión nativa (texto, imágenes y vídeo en el mismo modelo) y una ventana de contexto de 1.000.000 de tokens, lo que lo sitúa en la categoría de modelos de contexto ultralargo.

Su relevancia actual radica en la apertura de pesos de una escala que hasta ahora solo estaba disponible en modelos propietarios, junto con una mejora declarada de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2. El tamaño del repositorio (1.561 GB) y el formato de pesos en safetensors con cuantización de 8 bits condicionan por completo su despliegue práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 Gated MLA; 93 capas totales, 1 densa |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Pesos publicados en 8 bits (tag `8-bit`, `compressed-tensors`); no se detallan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Kimi K3 License (identificador `license:other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas (una densa) con dimensión oculta de atención de 7168 y 96 cabezas de atención. La composición de capas de atención es híbrida: 69 capas usan Kimi Delta Attention (KDA), un mecanismo de atención lineal orientado a contextos largos, y 24 capas usan Gated MLA (Multi-head Latent Attention con compuerta). La parte MoE emplea una dimensión latente de 3584 y una dimensión oculta de 3072 por experto, con 896 expertos en total y 16 seleccionados por token, lo que da una relación de activación de aproximadamente el 3,7 % de los parámetros totales.

El marco Stable LatentMoE se describe como la base para aumentar la dispersión del MoE manteniendo estabilidad en el entrenamiento, con una mejora declarada de ~2,5× en eficiencia de escalado frente a Kimi K2. El modelo es multimodal nativo (texto, imagen y vídeo) y está diseñado para tareas agénticas de largo horizonte. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se detallan innovaciones de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento de propósito general, con orientación a tareas de conocimiento profundo.
- Programación de largo horizonte: sesiones de ingeniería prolongadas, navegación de repositorios grandes y orquestación de herramientas de terminal.
- Desarrollo de bajo nivel: optimización de kernels de GPU, desarrollo de compiladores y diseño de chips (según la model card).
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo dentro del mismo modelo.
- Contexto ultralargo de hasta 1.000.000 de tokens para documentos y bases de código extensas.
- Trabajo de conocimiento agéntico: investigación profunda con visualizaciones interactivas, widgets y paneles, además de diseño de movimiento y edición de vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling / function calling: no detallado en la información disponible.

## Casos de uso

- Refactorización de repositorios monolíticos: con 1M de tokens de contexto, el modelo puede cargar grandes bases de código y sostener sesiones de refactorización multiarchivo sin perder el hilo entre módulos.
- Optimización de kernels de GPU: la model card lo orienta explícitamente a la optimización de kernels y al desarrollo de compiladores, tareas en las que el razonamiento sobre código de bajo nivel y la iteración con herramientas de terminal son críticos.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y paneles a partir de fuentes extensas, aprovechando la multimodalidad para incorporar gráficos e imágenes.
- Análisis de vídeo e imagen en pipelines de contenido: al procesar texto, imagen y vídeo en el mismo modelo, resulta adecuado para edición de vídeo asistida, diseño de movimiento y anotación multimodal.
- Asistencia en diseño de hardware: la model card menciona el diseño de chips como dominio objetivo, lo que permite usarlo como copiloto en flujos de CAD y verificación.
- Agentes autónomos de larga duración: su orientación a operar con supervisión humana mínima y a orquestar herramientas de terminal lo hace candidato para agentes que ejecutan tareas de ingeniería de varias horas.
- Procesamiento de documentación técnica masiva: con contexto de 1M de tokens puede ingerir manuales, normativas o expedientes completos y responder consultas cruzadas sin troceado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un informe técnico completo (`k3_tech_report.pdf`) y un blog técnico, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T de parámetros y pesos en 8 bits, el peso del modelo ronda 2,8 TB; se requiere un clúster multi-GPU con agregación de memoria muy superior a la de un nodo individual estándar.
- GPU recomendadas: no disponibles de forma explícita; por escala, el despliegue exige nodos con GPUs de centro de datos (H100/H200 o equivalentes) en configuración multi-nodo.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: la librería indicada es transformers con `custom_code`; no se detallan soportes de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1.000.000 | Kimi K3 License | Pesos abiertos (repo de terceros) |
| Kimi K2 | No disponible en la información | No disponible | No disponible | No disponible | Referenciado como generación anterior |
| Alternativas de clase 3T abiertas | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con Kimi K2 de forma cualitativa (mejora declarada de ~2,5× en eficiencia de escalado). No se dispone de datos de parámetros, contexto ni licencia de K2 ni de otros modelos comparables en el material consultado.

## Limitaciones y advertencias

- El repositorio analizado es una copia de terceros (`shotaro8930`), no el repositorio oficial de Moonshot AI; conviene verificar integridad y procedencia antes de usarlo en producción.
- Licencia "Kimi K3 License" con identificador `other`: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; como en todo modelo generativo de gran escala, debe validarse la salida en dominios factuales.
- Idiomas soportados no declarados: no hay garantía documentada de cobertura multilingüe, incluido el castellano.
- Sesgos conocidos: no documentados en la información proporcionada.
- Requisitos de hardware extremos: 2,8T de parámetros y ~2,8 TB de pesos en 8 bits hacen inviable el despliegue fuera de infraestructura de centro de datos multi-nodo.
- El formato `compressed-tensors` con 8 bits y `custom_code` puede limitar la compatibilidad con herramientas de inferencia estándar.
- No se detallan mecanismos de tool calling ni de modo de razonamiento explícito, pese a la orientación agéntica del modelo.

## Enlaces

- Repositorio en Hugging Face (copia de terceros): https://huggingface.co/shotaro8930/Kimi-K3
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Chat oficial: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
