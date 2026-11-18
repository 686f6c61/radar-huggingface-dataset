# google/gemma-4-12B

## Resumen

Gemma 4 12B Unified es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, presentado como parte de la familia Gemma 4. Su rasgo diferencial es la arquitectura *encoder-free*: en lugar de emplear codificadores dedicados para imagen y audio, proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings del transformer mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite afinar el modelo completo en una sola pasada.

El modelo cuenta con 11.959.730.224 parámetros (11,95B), 48 capas, ventana de atención deslizante de 1024 tokens y una longitud de contexto de 256K tokens. Soporta entradas de texto, imagen y audio, y genera salida de texto. Está disponible en variantes preentrenada e instruida, con licencia Apache 2.0.

Su relevancia actual radica en que ofrece capacidades multimodales nativas (incluido audio) en un tamaño desplegable en GPU de consumo y estaciones de trabajo, con soporte de *thinking modes* configurables, función nativa de *tool calling* y soporte del rol `system`. El repositorio en Hugging Face acumula 50.101 descargas y 878 likes desde su creación en mayo de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, híbrido de atención local deslizante y atención global, encoder-free para multimodal |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 140 idiomas (según model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Gemma 4 12B Unified es un transformer decoder-only denso de 48 capas con un mecanismo de atención híbrido que intercala atención local de ventana deslizante (1024 tokens) con atención global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens.

La innovación principal es la eliminación de codificadores multimodales: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, de modo que todas las modalidades fluyen por un único transformer decoder-only. Esto contrasta con otros modelos de la familia (E2B, E4B y 31B) que sí usan codificadores de visión (~150M en E2B/E4B, ~550M en 31B) y audio (~300M en E2B/E4B). El modelo se publica en variantes preentrenada e instruida; no se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto, razonamiento con *thinking modes* configurables, código y matemáticas.
- Comprensión de imagen con soporte de relación de aspecto y resolución variables.
- Comprensión de audio nativa, sin codificador separado.
- Entrada de vídeo (según la model card de la familia, el modelo procesa vídeo).
- *Tool calling* / *function calling* nativo.
- Capacidades agénticas y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Multilingüe en más de 140 idiomas.

## Casos de uso

- Asistentes de voz locales: al procesar audio de forma nativa y sin codificador separado, el modelo puede integrarse en aplicaciones de escritorio o móvil que transcriben, interpretan y responden en una sola pasada, reduciendo la latencia frente a pipelines con ASR externo más LLM.
- Análisis de documentos con imágenes: con 256K tokens de contexto y visión de resolución variable, puede ingerir informes escaneados, gráficos y tablas junto con texto extenso para extracción de datos y resumen.
- Agentes autónomos con herramientas: el *tool calling* nativo y el razonamiento multi-paso permiten construir agentes que consultan APIs, ejecutan código y encadenan acciones con el rol `system` para definir políticas.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede integrarse en flujos de revisión automática de *pull requests*, generación de tests y explicación de errores, aprovechando su contexto largo para analizar repositorios completos.
- Transcripción y análisis de reuniones: la entrada de audio nativa permite procesar grabaciones y generar actas estructuradas, resúmenes y listas de acciones sin depender de servicios externos.
- Atención al cliente multilingüe: los más de 140 idiomas y el contexto de 256K tokens permiten gestionar conversaciones multi-turno con historial extenso y documentación de producto adjunta.
- Procesamiento de vídeo para moderación o etiquetado: la entrada de vídeo junto con texto permite clasificar y describir contenido audiovisual en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, 11,95B parámetros en FP16 requieren aproximadamente 24 GB solo para pesos; en cuantización de 8 bits, unos 12 GB; en 4 bits, unos 6-7 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 24 GB o más (por ejemplo, RTX 4090) en cuantizaciones de 8 o 4 bits; no confirmado por el autor.
- Opciones de despliegue: la librería indicada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints. No se detallan soportes de vLLL, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio, vídeo | Apache 2.0 | Hugging Face |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 (familia) | Hugging Face |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 (familia) | Hugging Face |
| Gemma 4 26B A4B MoE | No disponible (MoE) | No disponible | No disponible | Apache 2.0 (familia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la información disponible; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación inherente a los modelos generativos; no se documenta mitigación específica.
- La lista concreta de idiomas no está publicada, solo la cifra de más de 140.
- La licencia Apache 2.0 permite uso comercial, pero la model card enlaza además a una licencia específica de Gemma 4 (`gemma_4_license`); conviene revisar ambos documentos antes de desplegar en producción.
- El soporte de audio y vídeo no está cuantificado en benchmarks públicos en la información disponible.
- No se especifican requisitos de hardware oficiales ni límites de rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/google/gemma-4-12B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos de Google DeepMind: https://deepmind.google/models/gemma/
