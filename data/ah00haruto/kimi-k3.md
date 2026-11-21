# ah00haruto/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales (2.779.931.837.184 según los safetensors del repositorio) y 104.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de los modelos de escala 3T. Incorpora visión nativa y una ventana de contexto de un millón de tokens.

La innovación arquitectónica principal es la combinación de Kimi Delta Attention (KDA) con Attention Residuals (AttnRes), junto con un marco de enrutamiento denominado Stable LatentMoE que activa 16 de 896 expertos por token. Según el autor, esto supone una mejora de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2. El modelo está orientado a tareas de larga duración: ingeniería de software sobre repositorios grandes, orquestación de herramientas de terminal, investigación profunda y trabajo de conocimiento con salidas visuales interactivas.

El repositorio analizado (`ah00haruto/Kimi-K3`) es una réplica de los pesos originales de Moonshot AI, con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 1.561 GB. La model card referencia una versión posterior, `moonshotai/Kimi-K3.1-Pro`, como `new_version`. Es relevante ahora porque representa uno de los primeros lanzamientos abiertos de escala 3T con multimodalidad nativa y contexto de 1M tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 capas Gated MLA |
| Parámetros totales | 2,8T (2.779.931.837.184 según safetensors) |
| Parámetros activos | 104B (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8-bit (tag `8-bit`); `compressed-tensors` disponible |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors (con `custom_code` en transformers) |

Datos arquitectónicos adicionales: 93 capas totales (1 densa), dimensión oculta de atención 7168, 96 cabezas de atención, dimensión latente MoE 3584, dimensión oculta por experto 3072.

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo MoE de 93 capas (una de ellas densa) que sustituye la atención estándar por una composición híbrida: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA (Multi-head Latent Attention con compuerta). La dimensión oculta de atención es de 7168 con 96 cabezas. El bloque MoE utiliza una dimensión latente de 3584 y 896 expertos con dimensión oculta de 3072 cada uno, de los cuales se activan 16 por token mediante el marco Stable LatentMoE, lo que arroja 104B parámetros activos sobre un total de 2,8T.

La arquitectura incorpora además Attention Residuals (AttnRes), un mecanismo de conexiones residuales sobre la atención que, según el autor, contribuye junto con KDA y el enrutamiento estable a una mejora de aproximadamente 2,5 veces en eficiencia de escalado frente a Kimi K2. El modelo es multimodal nativo: procesa texto, imágenes y vídeo dentro del mismo modelo, no mediante un codificador visual acoplado externamente. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni de si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación especulativa ni de atención lineal más allá de KDA.

## Capacidades

- Generación de texto y razonamiento de largo horizonte, orientado a tareas de ingeniería y conocimiento que requieren decenas o cientos de pasos.
- Codificación de software a escala de repositorio: navegación de bases de código masivas, optimización de kernels de GPU, desarrollo de compiladores y diseño de chips según la model card.
- Orquestación de herramientas de terminal y agentes multi-paso con supervisión humana mínima.
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo en el mismo modelo.
- Salidas visuales interactivas: visualizaciones, widgets, dashboards y diseño de movimiento, así como edición de vídeo.
- Ventana de contexto de 1M tokens para razonamiento sobre documentos y código extensos.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica del modelo lo presupone.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Ingeniería de software autónoma sobre repositorios grandes: el modelo puede recorrer una base de código de millones de líneas dentro de su contexto de 1M tokens y ejecutar tareas de refactorización o corrección con orquestación de terminal, lo que lo hace adecuado para pipelines de mantenimiento continuo.
- Optimización de kernels y código de bajo nivel: la model card cita explícitamente la optimización de kernels de GPU y el desarrollo de compiladores como escenarios de uso, aprovechando el razonamiento de largo horizonte sobre código y documentación técnica.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y dashboards a partir de fuentes extensas, gracias a la combinación de contexto de 1M tokens y salida multimodal.
- Análisis de vídeo e imagen en flujos de trabajo: al ser multimodal nativo, permite tareas como revisión de material audiovisual, edición de vídeo asistida o inspección visual de resultados de CAD dentro de la misma sesión.
- Agentes de operaciones con herramientas: orquestación de terminal y herramientas externas en sesiones largas con mínima intervención humana, adecuado para automatización de tareas de DevOps y administración de sistemas.
- Diseño asistido y prototipado visual: generación de dashboards, widgets y diseño de movimiento a partir de especificaciones en lenguaje natural, integrable en herramientas de productividad.
- Asistentes de documentación técnica a gran escala: consulta y síntesis sobre corpus de manuales, especificaciones y código que superan ampliamente los contextos habituales de 128K-200K tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parámetros totales, en precisión de 8 bits los pesos ocupan aproximadamente 2,8 TB; en FP16/FP8 de referencia el requisito supera los 5 TB. El repositorio ocupa 1.561 GB, lo que sugiere un empaquetado comprimido que no reduce el requisito de memoria en tiempo de ejecución por debajo de varios terabytes.
- GPU recomendadas: no es desplegable en GPUs individuales. Requiere clústeres multi-nodo con GPUs de memoria alta (H100/H200, B200 o equivalentes); no se dispone de una configuración mínima validada en la información proporcionada.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: transformers con `custom_code` (formato nativo del repositorio); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible. llama.cpp y Ollama quedan descartados en la práctica por el tamaño del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M | Sí (texto, imagen, vídeo) | Kimi K3 License | Pesos abiertos |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (referencia del autor) |
| Kimi-K3.1-Pro | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado como `new_version` |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otros desarrolladores (por ejemplo, de escala 1T-3T con contexto de 1M tokens), por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; un modelo de esta escala entrenado sobre corpus web es susceptible de sesgos sociales, culturales y lingüísticos no cuantificados aquí.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas agénticas de largo horizonte, los errores pueden propagarse a lo largo de muchos pasos.
- Limitaciones de contexto o idioma: el contexto es de 1M tokens, pero no se especifica la degradación de rendimiento en longitudes extremas ni la lista de idiomas soportados.
- Restricciones de licencia: la licencia Kimi K3 License es de tipo "other"; deben revisarse sus términos antes de cualquier uso comercial. No se detallan aquí las condiciones de atribución, redistribución o uso comercial.
- Caveats de producción: el requisito de hardware (varios TB de memoria) hace inviable el autohospedaje fuera de infraestructura de clúster; el repositorio analizado es una réplica de terceros con 0 descargas, por lo que conviene verificar la integridad de los pesos frente al repositorio oficial de Moonshot AI.
- El modelo referencia una versión posterior (`moonshotai/Kimi-K3.1-Pro`), lo que puede implicar que esta versión quede obsoleta o sin mantenimiento.

## Enlaces

- Repositorio analizado: https://huggingface.co/ah00haruto/Kimi-K3
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Repositorio oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
