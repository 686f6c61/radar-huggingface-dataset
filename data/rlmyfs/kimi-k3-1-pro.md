# rlmyfs/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje nativamente multimodal y orientado a tareas agénticas, desarrollado por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según su model card, el modelo de clase 3T más capaz de la compañía hasta la fecha. Está construido sobre Kimi K3 mediante un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios, y se distribuye como pesos abiertos bajo una licencia propia denominada `kimi-k3.1-pro`.

La arquitectura es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token. Incorpora una composición de atención híbrida formada por 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention), lo que le permite manejar una ventana de contexto de 1 millón de tokens. El modelo está pensado para cargas de trabajo de codificación, creación 3D, investigación financiera y flujos agénticos de múltiples pasos.

La relevancia de esta ficha radica en que el repositorio de Hugging Face (`rlmyfs/Kimi-K3.1-Pro`) es una réplica no oficial del modelo original de Moonshot AI, con 0 descargas y 0 likes en el momento de la consulta. El tamaño del repositorio es de 1.561,4 GB y los pesos están en formato safetensors con cuantización de 8 bits mediante `compressed-tensors`. Los datos de la model card proceden del autor original y deben contrastarse con la fuente oficial antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8 bits (compressed-tensors) en el repo consultado; otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, etiquetada como `other`) |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo emplea un transformer MoE de 93 capas (1 capa densa) con dimensión de atención de 7168 y 96 cabezas de atención. La composición de capas de atención es híbrida: 69 capas KDA y 24 capas Gated DSA, con un índice DSA de dimensión 128, 32 cabezas y top-K de 2048. La capa MoE utiliza una dimensión latente de 3584, 896 expertos con dimensión oculta de 3072 por experto, 16 expertos seleccionados por token y 2 expertos compartidos. El vocabulario es de 160K tokens.

El entrenamiento parte de Kimi K3 y se completa con un post-entrenamiento basado en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card no detalla el número exacto de tokens de preentrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO específicas más allá de la mención al RL conjunto. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia arquitectura KDA/DSA.

## Capacidades

- Generación de texto y razonamiento de propósito general en contexto largo (hasta 1M tokens).
- Capacidades de codificación, con mejoras declaradas respecto a Kimi K3.
- Creación 3D y tareas de investigación financiera, según la model card.
- Procesamiento nativamente multimodal: pipeline `image-text-to-text`, es decir, entrada de imagen y texto.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible`).
- Capacidades agénticas y razonamiento multi-paso, reforzadas mediante RL conjunto en dominios downstream.
- Modo conversacional multi-turno.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 1M tokens, lo que permite mantener el historial completo de un cliente y documentación de producto en una sola sesión sin truncar.
- **Generación de código en producción:** soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y refactorización, aprovechando sus 104B parámetros activos para mantener latencia contenida.
- **Agentes autónomos multi-paso:** su entrenamiento con RL conjunto en dominios downstream y su soporte de function calling lo hacen adecuado para orquestar tareas que requieren planificación, llamadas a herramientas y verificación de resultados.
- **Análisis de documentos extensos:** con 1M de tokens de contexto puede procesar informes financieros, expedientes legales o bases de código completas en una sola pasada, sin necesidad de chunking agresivo.
- **Investigación financiera asistida:** la model card declara mejoras específicas en research financiero, por lo que encaja en flujos de extracción de datos de informes, comparación de estados contables y generación de resúmenes con trazabilidad.
- **Creación 3D y prototipado:** el modelo declara capacidades de creación 3D, útil para generar descripciones estructuradas, scripts de modelado o asistentes en herramientas de diseño.
- **Asistentes multimodales:** al ser `image-text-to-text`, puede emplearse en tareas de descripción de imágenes, extracción de información de capturas o asistencia visual dentro de un chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** con 2,8T de parámetros totales, incluso en 8 bits los pesos ocupan aproximadamente 2,8 TB, por lo que no cabe en una sola GPU. Se requiere despliegue multi-nodo o multi-GPU con agregación de memoria.
- **GPU recomendadas:** clústeres de H100 (80 GB) o A100 (80 GB) en configuraciones de decenas de tarjetas; no es viable en RTX 4090 ni en GPUs de consumo.
- **Cabe en consumer GPU:** no.
- **Opciones de despliegue:** transformers con `custom_code` y `compressed-tensors`; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | `kimi-k3.1-pro` (other) | Pesos abiertos (repo no oficial consultado) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referencia base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- **Repositorio no oficial:** el repo `rlmyfs/Kimi-K3.1-Pro` tiene 0 descargas y 0 likes; no es el repositorio oficial de Moonshot AI y su integridad no está verificada.
- **Licencia restrictiva:** la licencia `kimi-k3.1-pro` está etiquetada como `other`; es imprescindible revisar los términos antes de cualquier uso comercial.
- **Riesgo de alucinación:** no se han publicado evaluaciones de fidelidad factual en la información disponible, pese a que la model card declara mejoras en precisión factual.
- **Idiomas no especificados:** no hay información sobre cobertura multilingüe ni sobre calidad en castellano.
- **Sesgos:** no se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- **Requisitos de infraestructura extremos:** 2,8T de parámetros y 1.561 GB de repo hacen inviable el despliegue en hardware de consumo y exigen planificación de clúster.
- **Formato y tooling:** el uso de `custom_code` y `compressed-tensors` puede requerir versiones específicas de transformers y complicar la portabilidad a otros runtimes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rlmyfs/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Modelo oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
