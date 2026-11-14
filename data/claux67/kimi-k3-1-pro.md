# Claux67/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, según su model card, es el modelo de clase 3T "más capaz hasta la fecha". Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. Emplea una arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activados por token, distribuidos en 93 capas.

La innovación arquitectónica más destacable es la composición de capas de atención: 69 capas KDA (Kimi Delta Attention) combinadas con 24 capas Gated DSA (DeepSeek Sparse Attention), una mezcla híbrida que busca eficiencia en contextos largos. El modelo declara una ventana de contexto de un millón de tokens y capacidades multimodales nativas (pipeline image-text-to-text), lo que lo sitúa en la categoría de modelos frontera con percepción visual y razonamiento multi-paso.

La relevancia actual del modelo radica en su orientación explícita a tareas agénticas: codificación, creación 3D, investigación financiera y precisión factual. Sin embargo, el repositorio de Hugging Face que nos ocupa (Claux67/Kimi-K3.1-Pro) es una réplica de 1.561,4 GB en formato safetensors de 8 bits con pesos cuantizados mediante compressed-tensors, con 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de una publicación reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA; 93 capas totales, 1 capa densa |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B (16 expertos seleccionados por token de 896, más 2 expertos compartidos) |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | Pesos en 8 bits (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (la model card no especifica listado de idiomas) |
| Licencia | kimi-k3.1-pro (licencia propia, catalogada como "other") |
| Formato de pesos | safetensors (con custom_code y compressed-tensors) |

Datos arquitectónicos adicionales: dimensión oculta de atención 7168, 96 cabezas de atención, dimensión de cabeza del índice DSA 128, 32 cabezas de índice DSA, top-K del índice DSA 2048, dimensión latente MoE 3584, dimensión oculta MoE por experto 3072, vocabulario de 160K tokens.

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer de tipo MoE con una composición de atención híbrida poco habitual: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (una variante de atención dispersa con índice top-K de 2048 y 32 cabezas de índice). La dimensión oculta de atención es de 7168 con 96 cabezas. El bloque MoE cuenta con 896 expertos, de los cuales se activan 16 por token, más 2 expertos compartidos, con una dimensión latente de 3584 y 3072 por experto. El vocabulario es de 160.000 tokens. Esta configuración busca mantener un coste de cómputo por token contenido (104B activos sobre 2,8T totales) mientras se preserva la capacidad representacional de un modelo de escala 3T.

En cuanto al entrenamiento, la model card indica que el modelo está post-entrenado desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO adicionales más allá del RL conjunto mencionado. Tampoco se detalla el mecanismo exacto de KDA ni de Gated DSA. La model card se interrumpe en la fila de longitud de contexto, por lo que no se dispone de las secciones posteriores (posiblemente relativas a benchmarks o detalles de entrenamiento).

## Capacidades

- Generación de texto y razonamiento multi-paso en contextos de hasta un millón de tokens.
- Capacidades multimodales nativas: el pipeline es image-text-to-text, por lo que acepta imágenes como entrada junto con texto.
- Codificación: la model card menciona mejoras sustanciales en tareas de programación.
- Creación 3D: capacidad destacada explícitamente en la introducción del modelo.
- Investigación financiera: dominio de aplicación mencionado en la model card.
- Precisión factual: mejora declarada en exactitud de hechos.
- Comportamiento agéntico: el modelo se describe como "agentic model", orientado a flujos multi-paso y uso de herramientas; no se detalla explícitamente el soporte de function calling en la información disponible.
- Capacidades multilingües: no disponibles (no se especifica listado de idiomas).
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación financiera asistida: el modelo puede procesar informes anuales, transcripciones de llamadas de resultados y series de datos dentro de una ventana de un millón de tokens, y sintetizar análisis con mayor precisión factual, un dominio que la model card destaca explícitamente.
- Generación de código en producción: adecuado para pipelines de CI/CD y revisión automatizada de parches, dado su enfoque en codificación y su capacidad de razonamiento multi-paso sobre repositorios extensos que caben en contexto.
- Creación 3D asistida: generación y edición de descripciones estructuradas para herramientas de modelado 3D, aprovechando la capacidad multimodal (imagen + texto) para iterar sobre referencias visuales.
- Agentes autónomos de navegación y extracción de datos: su ventana de contexto de 1M tokens permite mantener el estado completo de una sesión agéntica prolongada sin truncamiento, incluyendo historial de herramientas y documentos intermedios.
- Análisis de documentación técnica y legal: ingesta de contratos, especificaciones o expedientes completos de cientos de miles de tokens para extracción de cláusulas, resúmenes y detección de inconsistencias.
- Asistentes multimodales de atención al cliente: conversaciones multi-turno con soporte de imágenes (capturas de pantalla, fotos de producto) y contexto largo para preservar el historial completo del cliente.
- Evaluación y anotación de datasets a gran escala: uso del modelo como juez o anotador sobre lotes extensos de ejemplos, aprovechando su precisión factual declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporcionada se interrumpe antes de cualquier sección de evaluación comparativa, y no se dispone de cifras de MMLU, HumanEval, GSM8K ni de otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1.561,4 GB en safetensors de 8 bits. La inferencia requiere, como mínimo, del orden de 1,5 TB de VRAM para cargar los pesos cuantizados a 8 bits; con cuantizaciones más agresivas (no publicadas en este repositorio) el requisito podría reducirse, pero no hay datos disponibles.
- GPU recomendadas: no cabe en ninguna GPU de consumo. Se requiere un clúster multi-GPU de clase centro de datos (H100, H200, B200 o equivalentes); el número exacto de GPU no está especificado, pero por el tamaño de pesos a 8 bits se necesitan al menos 20 GPU de 80 GB solo para los pesos.
- GPU de consumo: no es viable en RTX 4090, RTX 3090 ni similares; el modelo no cabe en ninguna configuración de consumo actual.
- Opciones de despliegue: el repositorio usa transformers con custom_code (kimi_k31) y compressed-tensors; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. Con 104B parámetros activos por token, el coste por token es alto pero inferior al de un modelo denso de 2,8T.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos comparables en la información proporcionada. A continuación se indica una comparación estructural limitada a los datos disponibles de este modelo; las columnas de los competidores se marcan como no disponibles para no inventar cifras.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (Claux67) | 2,8T | 104B | 1M | kimi-k3.1-pro (other) | Hugging Face, safetensors 8-bit |
| Kimi K3 (modelo base) | no disponible | no disponible | no disponible | no disponible | mencionado como base de post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card del repositorio está truncada: falta la sección de longitud de contexto completa y todo lo posterior, por lo que no se pueden verificar benchmarks, detalles de entrenamiento ni limitaciones declaradas por el autor.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; la model card declara mejoras en precisión factual, pero no se aportan métricas que lo respalden.
- Limitaciones de idioma: el listado de idiomas soportados no está disponible, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Licencia: se trata de una licencia propia ("kimi-k3.1-pro", catalogada como "other"), no de una licencia open source estándar. Es imprescindible revisar los términos del archivo LICENSE del repositorio original de Moonshot AI antes de cualquier uso comercial; la información disponible no detalla restricciones.
- Repositorio de escasa difusión: 0 descargas y 0 likes, creado y actualizado en la misma fecha (2026-11-14), lo que sugiere que no ha sido validado por la comunidad.
- Requisitos de hardware extremos: 1,5 TB de pesos hacen inviable el despliegue fuera de infraestructura de centro de datos.
- El soporte de tool calling y function calling no se detalla explícitamente en la información disponible, a pesar de la orientación agéntica del modelo.
- Riesgo de reproducibilidad: el uso de custom_code y compressed-tensors puede requerir versiones específicas de transformers y de las librerías asociadas.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Claux67/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Página del modelo oficial (referenciada en la model card): https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Guía de inicio rápido de la API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página principal de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
