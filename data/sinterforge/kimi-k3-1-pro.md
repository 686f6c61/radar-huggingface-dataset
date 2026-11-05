# SinterForge/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado con pesos abiertos por Moonshot AI (el repositorio de HuggingFace analizado, `SinterForge/Kimi-K3.1-Pro`, es una réplica/derivado del original de Moonshot AI). Se trata del primer modelo de la serie K3.1 y el modelo de clase 3T más capaz de la compañía hasta la fecha, según su model card. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream.

La arquitectura es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, distribuidos en 93 capas (1 densa) y 896 expertos (16 seleccionados por token más 2 expertos compartidos). Incorpora una composición de atención híbrida de 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (DeepSeek Sparse Attention), lo que le permite sostener una ventana de contexto de 1 millón de tokens.

Su relevancia actual radica en que combina contexto ultralargo, capacidades multimodales (entrada de imagen y texto) y un enfoque agéntico orientado a tareas de codificación, creación 3D, investigación financiera y razonamiento multi-paso. El repositorio ocupa 1,56 TB y los pesos están en formato safetensors con cuantización de 8 bits mediante `compressed-tensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (≈2,8 T) |
| Parametros activos | 104 B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); no se detallan otros formatos en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, marcada como `other`) |
| Formato de pesos | safetensors (con `compressed-tensors`, 8 bits) |
| Capas totales | 93 (1 densa) |
| Composición de atención | 69 capas KDA + 24 capas Gated DSA |
| Dimensión oculta de atención | 7168 |
| Cabezas de atención | 96 |
| Dimensión de cabeza de índice DSA | 128 |
| Cabezas de índice DSA | 32 |
| Top-K de índice DSA | 2048 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta por experto | 3072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamaño de vocabulario | 160K |
| Pipeline | image-text-to-text |
| Librería | transformers (requiere `custom_code`) |
| Tamaño del repo | 1561,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con una innovación central en el mecanismo de atención: combina 69 capas de Kimi Delta Attention (KDA) con 24 capas de Gated DeepSeek Sparse Attention (DSA). La DSA utiliza 32 cabezas de índice con dimensión 128 y un Top-K de 2048, lo que reduce el coste computacional de la atención sobre secuencias muy largas y habilita el contexto de 1 millón de tokens. El bloque MoE opera en un espacio latente de dimensión 3584, con 896 expertos de dimensión oculta 3072, de los que se activan 16 por token más 2 expertos compartidos, resultando en 104.000 millones de parámetros activos sobre 2,8 billones totales.

Según la model card, el modelo se post-entrena desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO más allá de la mención al RL conjunto. Tampoco se detalla el proceso de alineación ni las innovaciones de decodificación (por ejemplo, decodificación especulativa).

## Capacidades

- Generación de texto y razonamiento multi-paso en tareas complejas.
- Codificación y programación, con mejoras destacadas respecto a Kimi K3 según la model card.
- Creación 3D (generación y manipulación de contenido tridimensional).
- Investigación financiera y análisis de datos financieros.
- Precisión factual mejorada (factual accuracy) respecto al modelo base.
- Capacidades agénticas: razonamiento multi-paso y ejecución de tareas de agente.
- Multimodalidad nativa: entrada de imagen y texto (pipeline `image-text-to-text`).
- Ventana de contexto de 1 millón de tokens para documentos y conversaciones extensas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el enfoque agéntico lo hace plausible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa: el contexto de 1 millón de tokens permite procesar informes anuales, expedientes legales o bases de código completas en una sola pasada sin fragmentación.
- Investigación financiera automatizada: el modelo puede ingerir informes trimestrales, transcripciones de llamadas de resultados y series de datos para generar resúmenes y comparativas con razonamiento multi-paso.
- Generación y revisión de código en producción: su mejora en codificación y su naturaleza agéntica lo hacen adecuado para pipelines de revisión de código, generación de tests y refactorización asistida.
- Creación 3D asistida: generación de descripciones estructuradas y assets 3D a partir de especificaciones textuales o imágenes de referencia, gracias a su capacidad multimodal.
- Asistentes conversacionales de largo recorrido: conversaciones multi-turno con memoria efectiva sobre cientos de miles de tokens, útil en atención al cliente técnica o soporte de producto.
- Agentes autónomos de investigación: descomposición de tareas complejas en subtareas, consulta de fuentes y síntesis de resultados con contexto largo.
- Procesamiento de imágenes y texto combinados: extracción de información de capturas, diagramas o documentos escaneados junto con instrucciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 T de parámetros en 8 bits, los pesos ocupan aproximadamente 2,8 TB, por lo que la inferencia requiere un clúster multi-GPU de alta gama. No es viable en una sola GPU.
- GPU recomendadas: clústeres de H100 (80 GB) o A100 (80 GB) en configuraciones de decenas de nodos; no se especifica el número exacto en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas.
- Opciones de despliegue: transformers con `custom_code` (requerido); no se confirman en la información disponible soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | ≈2,8 T (MoE) | 104 B | 1 M tokens | `kimi-k3.1-pro` (other) | Pesos abiertos en HF |
| Kimi K3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Referenciado como base |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma clase, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; cabe esperar sesgos heredados de los datos de entrenamiento de Kimi K3.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la model card menciona mejoras en precisión factual, pero no cuantifica la tasa de error.
- Limitaciones de idioma: los idiomas soportados no están disponibles; no se garantiza un rendimiento uniforme fuera del inglés y el chino.
- Restricciones de licencia: la licencia `kimi-k3.1-pro` es de tipo `other`; es imprescindible revisar los términos antes de cualquier uso comercial.
- El repositorio analizado (`SinterForge/Kimi-K3.1-Pro`) es un derivado del original de Moonshot AI; conviene verificar la procedencia y la integridad de los pesos antes de usarlo en producción.
- Requisitos de hardware extremos: 2,8 T de parámetros en 8 bits implican ~2,8 TB de pesos, lo que limita el despliegue a infraestructura de clúster.
- Requiere `custom_code` en transformers, lo que añade complejidad de integración y riesgo de incompatibilidades.
- No se detallan en la información disponible las capacidades de tool calling ni el soporte multilingüe, lo que debe validarse empíricamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SinterForge/Kimi-K3.1-Pro
- Repositorio original de Moonshot AI: https://huggingface.co/moonshotai
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
