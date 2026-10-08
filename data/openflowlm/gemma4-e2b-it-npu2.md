# OpenFlowLM/Gemma4-E2B-IT-NPU2

## Resumen
Gemma4-E2B-IT-NPU2 es una distribución del modelo Gemma 4 E2B instruction-tuned, publicado por el usuario OpenFlowLM en HuggingFace. Se trata de una variante optimizada para aceleradores NPU (de ahí el sufijo "NPU2"), empaquetada en formato `transformers` con pesos compatibles con la librería estándar. El modelo base Gemma 4 pertenece a Google DeepMind y forma parte de la familia Gemma 4, que incluye los tamaños E2B, E4B, 26B A4B y 31B, tanto en variantes densas como Mixture-of-Experts (MoE).

El E2B es el modelo más pequeño de la familia. Según la model card, cuenta con 2.3B parámetros efectivos (5.1B contando los embeddings Per-Layer), 35 capas, ventana deslizante de 512 tokens y una longitud de contexto de 128.000 tokens. Incorpora soporte multimodal de texto, imagen y audio, con un codificador de visión de ~150M de parámetros y uno de audio de ~300M. Está diseñado para ejecución en dispositivos de borde, portátiles y teléfonos de gama alta.

La relevancia de esta ficha radica en que se distribuye bajo licencia Apache 2.0 (con enlace a la licencia específica de Gemma 4), lo que facilita su integración en productos comerciales. El repositorio ocupa 6,0 GB, registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado el 8 de octubre de 2026. Cabe señalar que la información pública de este repositorio concreto es escasa y parte de los datos se heredan de la model card de la familia Gemma 4.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) |
| Parametros totales | 2.3B efectivos (5.1B incluyendo embeddings) |
| Parametros activos | no aplica (variante densa, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | más de 140 (según la familia Gemma 4); los metadatos de HuggingFace no los detallan |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer decoder con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante (512 tokens) y capas de atención global completa, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales unifican claves y valores (Keys and Values unificados) y aplican Proportional RoPE (p-RoPE). La familia incorpora Per-Layer Embeddings (PLE), que otorgan a cada capa decodificadora su propio embedding pequeño por token; estas tablas son grandes pero de solo consulta, lo que explica la diferencia entre los 5,1B parámetros totales y los 2,3B efectivos.

Según la model card de la familia, Gemma 4 incluye variantes pre-entrenadas e instruction-tuned, con modos de razonamiento configurables ("thinking modes") y soporte nativo del rol `system`. No se dispone, en la información proporcionada, del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO específicos. Tampoco se documentan en este repositorio concreto las modificaciones exactas introducidas por OpenFlowLM para la ruta NPU (el sufijo "NPU2" sugiere una optimización para unidades de procesamiento neuronal, sin más detalle disponible). Se recomienda consultar la documentación oficial de Gemma 4 para conocer el pipeline de entrenamiento completo.

## Capacidades
- Generación de texto, razonamiento y codificación, con mejoras notables en benchmarks de código y flujos agénticos según la model card.
- Modos de razonamiento configurables ("thinking modes").
- Multimodalidad: entrada de texto, imagen (con soporte de relación de aspecto y resolución variable) y audio, con salida de texto.
- Soporte nativo de function calling.
- Capacidades agénticas y razonamiento multi-paso para agentes autónomos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües (más de 140 idiomas según la familia Gemma 4).
- Vision encoder de ~150M de parámetros y audio encoder de ~300M integrados en el modelo E2B.

## Casos de uso
- Asistente en dispositivo de borde: con 2.3B parámetros efectivos, el E2B puede ejecutarse localmente en teléfonos de gama alta, portátiles y sistemas embebidos, ofreciendo asistencia conversacional sin conexión con ventana de 128K tokens.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo y soporte del rol `system` para mantener el tono y las políticas de la empresa de forma estructurada.
- Procesamiento multimodal en campo: al admitir imagen y audio, puede transcribir y describir contenido audiovisual o interpretar imágenes capturadas por la cámara del dispositivo.
- Agentes autónomos con function calling: el soporte nativo de herramientas permite integrarlo en flujos que consultan APIs, bases de datos o sistemas externos de forma encadenada.
- Generación de código asistida: con su rendimiento en LiveCodeBench v6 (44,0%), puede emplearse como autocompletado o revisión de código en entornos locales de desarrollo.
- Resumen y extracción de información en documentos extensos: la ventana de 128K tokens permite procesar contratos, informes o transcripciones largas sin truncar el contexto.
- Traducción y atención multilingüe: los más de 140 idiomas declarados lo hacen adecuado para aplicaciones de traducción y soporte internacional en el propio dispositivo.
- Transcripción y análisis de reuniones: combinando la entrada de audio con la generación de texto, puede generar actas y resúmenes sin enviar datos a la nube.

## Benchmarks y rendimiento
Los siguientes resultados proceden de la model card de la familia Gemma 4 para los modelos instruction-tuned. Se muestran los valores del E2B y de modelos comparables:

| Benchmark | Gemma 4 E2B | Gemma 4 E4B | Gemma 4 26B A4B | Gemma 4 31B | Gemma 3 27B (no think) |
|---|---|---|---|---|---|
| MMLU Pro | 60.0% | 69.4% | 82.6% | 85.2% | 67.6% |
| AIME 2026 (sin herramientas) | 37.5% | 42.5% | 88.3% | 89.2% | 20.8% |
| LiveCodeBench v6 | 44.0% | 52.0% | 77.1% | 80.0% | 29.1% |
| Codeforces | dato truncado en la fuente | — | — | — | — |

No se dispone de otros resultados de benchmarks específicos para la variante NPU2 publicada por OpenFlowLM en la información proporcionada.

## Requisitos de hardware
- VRAM estimada (cálculo estándar en función del tamaño; no confirmada en la documentación del repositorio): aproximadamente 10 GB en FP16/BF16 para los 5,1B parámetros totales; en torno a 5-6 GB en INT8/FP8; y alrededor de 3 GB en cuantizaciones INT4/Q4.
- El repositorio ocupa 6,0 GB, lo que sugiere pesos ya cuantizados o en formato de precisión reducida, aunque el formato exacto no está documentado.
- Al ser una variante "NPU2", está pensada para ejecución en aceleradores NPU (por ejemplo, unidades integradas en portátiles y dispositivos de borde de última generación); no se especifican los chips soportados.
- Por su tamaño, cabe con holgura en GPU de consumo como la RTX 4090 o inferiores, e incluso puede ejecutarse en CPU en escenarios de baja latencia según la model card de la familia.
- Opciones de despliegue: la librería declarada es `transformers`; no se confirman en el repositorio integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros totales | Contexto | MMLU Pro | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 E2B (esta ficha) | 2.3B efectivos (5.1B) | 128K | 60.0% | 44.0% | Apache 2.0 | HuggingFace |
| Gemma 4 E4B | 4.5B efectivos (8B) | 128K | 69.4% | 52.0% | Apache 2.0 | HuggingFace |
| Gemma 4 26B A4B (MoE) | 25.2B (3.8B activos) | 256K | 82.6% | 77.1% | Apache 2.0 | HuggingFace |
| Gemma 3 27B (no think) | 27B aprox. | no disponible | 67.6% | 29.1% | no disponible | HuggingFace |

El E2B es la opción más ligera de la familia y prioriza la ejecución en dispositivo frente al rendimiento bruto. Frente al Gemma 3 27B, el E2B rinde mejor en código (44,0% vs 29,1%) y ligeramente peor en MMLU Pro (60,0% vs 67,6%), pese a ser mucho más pequeño.

## Limitaciones y advertencias
- Existe una discrepancia entre fuentes: la model card de la familia indica 128K tokens de contexto y multimodalidad (texto, imagen, audio) para el E2B, mientras que una fuente secundaria de la búsqueda web describe el E2B como "text-only" con 8K de contexto y 2,1B parámetros. Se recomienda verificar las especificaciones reales del repositorio antes de usarlo en producción.
- No hay información específica sobre el proceso de cuantización, el formato exacto de pesos ni los detalles de la optimización para NPU de esta variante concreta.
- El repositorio registra 0 descargas y 0 "likes" y fue creado muy recientemente (8 de octubre de 2026), por lo que carece de validación de la comunidad. No es un repositorio oficial de Google DeepMind.
- La autoría del artefacto corresponde a OpenFlowLM, no a Google; conviene comprobar la procedencia e integridad de los pesos.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- No se detallan sesgos conocidos ni limitaciones idiomáticas específicas más allá de la declaración de multilingüismo.
- Aunque la licencia declarada es Apache 2.0, el enlace de licencia apunta a la licencia específica de Gemma 4; es imprescindible revisar los términos de uso de Gemma 4 antes de un uso comercial, ya que pueden incluir condiciones adicionales.
- El rendimiento en razonamiento matemático es limitado en esta talla (AIME 2026: 37,5%), muy inferior al de los modelos mayores de la familia.
- Los datos de benchmarks corresponden a la familia Gemma 4, no necesariamente a esta variante NPU2 concreta.

## Enlaces
- Repositorio HuggingFace del modelo: https://huggingface.co/OpenFlowLM/Gemma4-E2B-IT-NPU2
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página del modelo en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio relacionado FastFlowLM Gemma4-E2B-IT-NPU2: https://huggingface.co/FastFlowLM/Gemma4-E2B-IT-NPU2
- Repositorio relacionado FastFlowLM Gemma4-E4B-IT-NPU2: https://huggingface.co/FastFlowLM/Gemma4-E4B-IT-NPU2
- Ficha comunitaria Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Guía de Gemma 4 en cometapi: https://www.cometapi.com/google-releases-gemma-4-open-source-model/
