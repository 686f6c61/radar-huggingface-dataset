# mdcreativeagent/gemma-4-E4B-it-heretic

## Resumen

Gemma-4-E4B-it-heretic es una variante "decensored" (también etiquetada como *abliterated*) del modelo multimodal google/gemma-4-E4B-it de Google DeepMind. La ha publicado el usuario mdcreativeagent mediante la herramienta Heretic v1.2.0, aplicando la técnica Arbitrary-Rank Ablation (ARA) con preservación de la norma de fila sobre las capas 21 a 42 del transformer. El objetivo es eliminar los comportamientos de rechazo del modelo original sin reentrenar: según la model card, los rechazos bajan de 99/100 a 3/100 con una divergencia KL de 0,0058 respecto al original.

El modelo base pertenece a la familia Gemma 4, que combina arquitecturas densas y MoE, soporte multimodal (texto, imagen y audio en los modelos pequeños) y una ventana de contexto de 128K tokens para los modelos de la gama E. El E4B declara 4.500 millones de parámetros efectivos y 8.000 millones contando embeddings; los pesos en safetensors del repositorio suman 7.996.156.490 parámetros, coherente con esa cifra. Incorpora Per-Layer Embeddings (PLE) para eficiencia en dispositivo y una atención híbrida que intercala ventanas deslizantes locales con atención global.

Es relevante ahora porque ofrece un Gemma 4 pequeño, multimodal y con contexto largo, pero con las salvaguardas de alineación suavizadas, lo que interesa a quienes investigan robustez, evalúan filtros de seguridad o necesitan generación sin rechazos en entornos controlados. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia específica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE), Proportional RoPE (p-RoPE) en capas globales |
| Parametros totales | 7.996.156.490 (8B con embeddings; 4,5B efectivos según la familia E4B) |
| Parametros activos | No aplica (variante densa; el MoE de la familia es el 26B A4B) |
| Longitud de contexto | 128K tokens (modelos pequeños de la familia Gemma 4) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponibles en esta ficha; la familia Gemma 4 declara soporte multilingüe en más de 140 idiomas |
| Licencia | Apache 2.0 (la model card enlaza a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 42 capas con atención híbrida: capas con ventana deslizante local de 512 tokens intercaladas con capas de atención global, garantizando que la última capa sea siempre global. Las capas globales unifican claves y valores y aplican Proportional RoPE para reducir el coste de memoria en contextos largos. El vocabulario es de 262.000 tokens. La variante E4B incorpora Per-Layer Embeddings (PLE): cada capa decodificadora tiene su propia tabla de embeddings por token, grande pero de solo consulta, lo que explica la diferencia entre parámetros efectivos (4,5B) y totales (8B). El modelo es multimodal: incluye un codificador de visión de unos 150M de parámetros y un codificador de audio de unos 300M, con soporte de texto, imagen, vídeo y audio como entrada y texto como salida.

El entrenamiento original de Gemma 4 incluye variantes preentrenadas e instruidas, con modos de razonamiento configurables, soporte nativo del rol `system` y function calling. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO del modelo base. La modificación heretic no reentrena: aplica una ablación de rangos arbitrarios sobre las representaciones internas entre las capas 21 y 42, con pesos de preservación de comportamiento bueno (0,3873), direccionamiento del comportamiento malo (0,0003), corrección relativa (0,8555) y 14 vecinos, preservando la norma de fila.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes) heredados de Gemma 4.
- Comprensión de imagen con soporte de relación de aspecto y resolución variables.
- Procesamiento de vídeo y audio como entrada (audio nativo en los modelos E2B y E4B).
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma.
- Function calling / tool calling nativo.
- Soporte de agentes y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingües (más de 140 idiomas en la familia Gemma 4).
- Generación con rechazos muy reducidos: 3/100 en la evaluación de la model card frente a 99/100 del original.

## Casos de uso

- Investigación sobre alineación y robustez: comparar las respuestas del modelo heretic con las del Gemma 4 original para estudiar cómo la ablación afecta a la distribución de salidas, usando la divergencia KL de 0,0058 como referencia cuantitativa.
- Evaluación de filtros de seguridad: emplear el modelo como generador adversario controlado para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Asistentes multimodales en local: desplegar un modelo de 8B con visión y audio en estaciones de trabajo o portátiles con GPU consumer, gestionando documentos escaneados, capturas o notas de voz.
- Procesamiento de documentos largos: aprovechar la ventana de 128K tokens para resumir contratos, informes o expedientes completos en una sola pasada, con atención híbrida que mantiene bajo el coste de memoria.
- Generación de código en entornos internos: integrar el modelo en herramientas de desarrollo con function calling para autocompletado, explicación de código y ejecución de acciones sobre repositorios, sin dependencia de API externas.
- Creación de contenido sin restricciones de rechazo en flujos creativos: redacción de ficción, guiones o material editorial donde los filtros del modelo original interrumpen la generación, siempre con revisión humana posterior.
- Agentes autónomos de investigación: combinar tool calling y contexto largo para tareas multi-paso que requieren consultar fuentes, sintetizar y actuar sobre resultados.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-E4B-it) |
|---|---|---|
| Divergencia KL | 0,0058 | 0 (por definición) |
| Rechazos | 3/100 | 99/100 |

No se han publicado en la informacion disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo ni para el base en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque no se publican ficheros GGUF en este repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia con contexto completo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4080 para 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 con gestión cuidadosa del contexto, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (formato publicado), vLLM y TGI para servir en GPU; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repositorio. La etiqueta endpoints_compatible sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-heretic (este) | 8B totales / 4,5B efectivos | 128K | Texto, imagen, audio | Apache 2.0 (con enlace a licencia Gemma 4) | Rechazos 3/100, KL 0,0058 |
| google/gemma-4-E4B-it | 8B totales / 4,5B efectivos | 128K | Texto, imagen, audio | Licencia Gemma 4 | Modelo base alineado, rechazos 99/100 |
| Gemma 4 26B A4B (MoE) | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Licencia Gemma 4 | Mayor capacidad y contexto, requiere más VRAM |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Licencia Gemma 4 | Máxima capacidad de la familia, sin audio |

## Limitaciones y advertencias

- La ablación elimina parte de las salvaguardas de alineación: el modelo puede generar contenido que el original rechazaría, incluido material sensible o dañino. No es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- La divergencia KL de 0,0058 indica un cambio pequeño en la distribución global, pero la reducción de rechazos de 99/100 a 3/100 es drástica; el efecto sobre la calidad en tareas específicas no está evaluado con benchmarks.
- Riesgo de alucinación inherente a modelos de 8B, agravado en contextos largos y en tareas de razonamiento complejo.
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google, que puede imponer restricciones de uso comercial; verificar antes de desplegar en producción.
- El repositorio no incluye pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue directo en entornos de bajos recursos sin conversión previa.
- No se publican idiomas soportados específicos para esta variante; el multilingüismo se hereda del base y no está validado tras la ablación.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes independientes de calidad.
- La fecha de creación (2026-11-17) y la referencia a Gemma 4 como familia publicada deben tratarse con cautela; conviene confirmar la disponibilidad real del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/gemma-4-E4B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
