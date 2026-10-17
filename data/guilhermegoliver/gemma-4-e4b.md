# GuilhermeGoliver/gemma-4-E4B

## Resumen

Gemma 4 E4B es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind dentro de la familia Gemma 4. Acepta entrada de texto, imagen y audio (el audio está soportado de forma nativa en los modelos E2B, E4B y 12B) y genera texto. Se distribuye en variantes preentrenada e instruida. La "E" significa "effective": el modelo declara 4.500 millones de parámetros efectivos y unos 8.000 millones contando las tablas de embeddings por capa (PLE), que se usan solo para búsquedas rápidas y no en todos los cálculos.

Arquitectónicamente es un transformer decoder-only denso de 42 capas con atención híbrida: ventana deslizante local de 512 tokens intercalada con atención global, garantizando que la última capa sea siempre global. Soporta 128.000 tokens de contexto, más de 140 idiomas y modos de razonamiento configurables, además de soporte nativo de `system` prompt y function calling.

Esta ficha corresponde al repositorio GuilhermeGoliver/gemma-4-E4B, un duplicado del repositorio oficial google/gemma-4-E4B (11 descargas y 0 likes en el momento de la consulta). Su interés práctico está en el despliegue local: con cuantización puede ejecutarse en GPU de consumo desde 8 GB de VRAM, según la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (sliding window local + atención global) y Per-Layer Embeddings (PLE) |
| Parametros totales | ~8.000 millones (7.996.156.490 según safetensors; 4.500 millones efectivos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | más de 140 idiomas (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 (según el frontmatter y la model card; el enlace de licencia apunta a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (repositorio de 16 GB en ~fp16/bf16); librería transformers |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer decoder-only de 42 capas con atención híbrida que intercala atención de ventana deslizante local (512 tokens) con atención global, asegurando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262.000 tokens. Incluye un codificador de visión de ~150M de parámetros y un codificador de audio de ~300M de parámetros. Las Per-Layer Embeddings (PLE) dotan a cada capa decodificadora de su propio embedding por token, lo que explica la diferencia entre los 4.500 millones efectivos y los ~8.000 millones totales.

La model card indica que todos los modelos de la familia están diseñados como razonadores con modos de pensamiento configurables, soporte nativo de función de llamada y mejoras en código y capacidades agénticas. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Procesamiento de imagen con soporte de relación de aspecto y resolución variables.
- Entrada de audio nativa (E4B está entre los modelos con audio).
- Soporte de vídeo a nivel de familia (según la model card).
- Capacidades de código y flujos agénticos mejorados.
- Function calling nativo.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingüe en más de 140 idiomas.
- Optimizado para ejecución en dispositivo (portátiles y móviles) en los modelos pequeños de la familia.

## Casos de uso

- Asistente local en portátil o estación de trabajo: el modelo puede ejecutarse con cuantización en GPUs de 8 GB o más y mantener conversaciones multi-turno con hasta 128.000 tokens de contexto, lo que permite adjuntar documentos largos sin truncar.
- Atención al cliente multimodal: admite entradas de imagen y texto, de modo que puede procesar capturas de pantalla, fotos de productos o documentos escaneados junto al mensaje del usuario en una misma conversación.
- Generación y revisión de código en producción: el soporte de function calling permite integrarlo en pipelines de CI/CD para invocar herramientas, consultar APIs o ejecutar acciones de corrección automática.
- Agentes autónomos multi-paso: la combinación de thinking mode, function calling y `system` prompt nativo facilita orquestar tareas encadenadas con estado y control de rol.
- Análisis de audio en local: al disponer de codificador de audio nativo, puede transcribir o analizar notas de voz y reuniones sin enviar datos a servicios externos.
- Procesamiento de documentos extensos: contratos, informes o expedientes que quepan en 128K tokens pueden analizarse en una sola pasada, con menos fragmentación y pérdida de contexto.
- Contenido multilingüe: con más de 140 idiomas, encaja en tareas de traducción, localización o atención a usuarios en varios idiomas con un único modelo.
- Despliegue en dispositivos de borde: al formar parte de la gama "E" optimizada para on-device, puede integrarse en aplicaciones móviles o embebidas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en fp16/bf16: el repositorio ocupa 16 GB, por lo que la inferencia sin cuantizar requiere previsiblemente más de 16 GB de VRAM para pesos y caché KV.
- VRAM mínima con cuantización: 8 GB según gemma4.dev, lo que lo sitúa en el rango de GPUs de consumo.
- GPU recomendadas sin cuantizar: NVIDIA RTX 4090 (24 GB) o superiores; A100 40/80 GB y H100 para despliegues de mayor concurrencia.
- GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en fp16; RTX 4060 8 GB con cuantización.
- Despliegue: transformers (confirmado por la librería declarada) y endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros efectivos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Gemma 4 E4B | ~8B (con embeddings) | 4.5B | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | ~5.1B (con embeddings) | 2.3B | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11.95B | denso | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B (MoE) | 25.2B | 3.8B activos | 256K | Texto, imagen | Apache 2.0 |

Frente a E2B, E4B duplica aproximadamente los parámetros efectivos manteniendo el mismo contexto de 128K y las mismas modalidades. Frente a 12B Unified, E4B prescinde del enfoque sin codificadores y se queda en 128K de contexto, pero reduce requisitos de cómputo y memoria. Frente a 26B A4B, E4B es denso y no activa un subconjunto de expertos, lo que simplifica el despliegue a cambio de menor capacidad bruta. No se han evaluado en la información disponible modelos comparables de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se cuantifica en la información disponible.
- Contexto: 128K tokens, inferior a los 256K de los modelos medianos de la familia (12B, 26B A4B, 31B).
- Idiomas: se declaran más de 140, pero no se ofrece la lista detallada ni métricas por idioma.
- Licencia: el frontmatter indica Apache 2.0, pero el enlace de licencia apunta a los términos de Gemma 4 de Google; conviene verificar las condiciones exactas de uso comercial antes de producción.
- Repositorio no oficial: se trata de un duplicado de google/gemma-4-E4B publicado por un tercero (11 descargas, 0 likes), por lo que la procedencia y actualización no están garantizadas por el autor original.
- Sin benchmarks: no hay resultados publicados en la información disponible para estimar calidad frente a alternativas.
- Ausencia de datos de entrenamiento: no se detallan tokens, composición del dataset ni alineación (RLHF/DPO), lo que limita la evaluación de riesgos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GuilhermeGoliver/gemma-4-E4B
- Repositorio oficial de origen: https://huggingface.co/google/gemma-4-E4B
- Colección Gemma 4: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Technical report: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card oficial: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
