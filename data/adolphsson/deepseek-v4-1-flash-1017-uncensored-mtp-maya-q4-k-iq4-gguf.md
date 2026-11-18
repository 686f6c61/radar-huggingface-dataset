# Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-MTP-Maya-Q4-K-IQ4-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-MTP-Maya-Q4-K-IQ4-GGUF es una cuantización de 4 bits del checkpoint abliterado de DeepSeek-V4.1-Flash-1017, un modelo MoE multimodal de gran escala. El trabajo de abliteración (eliminación del circuito de rechazo a nivel de pesos) corresponde a dealignai sobre el modelo original de deepseek-ai; este repositorio, publicado por Adolphsson, es únicamente una release de cuantización empaquetada para el motor Project Maya. El modelo base se describe como un MoE de 552B parámetros totales con 8B activos en texto (16B activos con visión), ventana de contexto de 1M tokens sin ventaneo y soporte de visión y tool calling.

La relevancia de esta ficha es doble: por un lado documenta un caso de cuantización agresiva (Q4_K/IQ4_XS mixto) sobre un modelo enorme, con atención, indexer y shared experts fijados en 8 bits para preservar calidad; por otro, ilustra el ecosistema de motores alternativos (Project Maya) que gestionan expertos en una jerarquía GPU/RAM/NVMe para servir modelos que no caben en VRAM. El pack incluye además un drafter MTP (DSpark) opcional y un proyector de visión en dos formatos.

Conviene tratar los datos de la model card con cautela: hay inconsistencias internas notables (el campo de parámetros del repo indica 485.273.600, mientras la card habla de 552B totales y 748B tensores; el tamaño del repo es 482,1 GB frente a los 471,6 GB declarados en la card). Esta ficha refleja ambos valores cuando difieren y señala la discrepancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión), con capas de atención, routed experts y shared experts; incluye indexer y drafter MTP (DSpark) |
| Parametros totales | 552B según la model card (8B activos en texto, 16B activos con visión); el campo de parámetros del repo indica 485.273.600, discrepancia no resuelta |
| Parametros activos | 8B (texto), 16B (con visión) |
| Longitud de contexto | 1.000.000 tokens (contexto completo, sin ventaneo) |
| Tipos de cuantizacion | Mixta: IQ4_XS en expertos routed `w2`/`down`, Q4_K en `gate`/`up`, Q8_0/F32 en atención, Q8_0 en shared experts, Q8_0/F32 en indexer, F32 en norms, BF16 en embeddings, Q6_K en output head; 5,04 bits efectivos por peso sobre 748B tensores |
| Idiomas soportados | en (inglés) según los tags del repo |
| Licencia | MIT |
| Formato de pesos | GGUF (11 shards), más `mmproj` BF16 para visión, `vision.bin`/`vision.json` en formato nativo Maya, `dspark.bin`/`dspark.json` para MTP y metadatos `ds4.txt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de gran escala. Según la model card, el modelo base DeepSeek-V4.1-Flash-1017 tiene 552B parámetros totales con 8B activos en texto y 16B activos cuando se activa la visión, e incorpora un tower de visión (DeepSeek-ViT) con proyector, además de un indexer y una cabeza de salida. El checkpoint fuente es la versión FP8 de dealignai (e4m3 con escalas de bloque FP8 y expertos routed en FP4), sobre la que se aplicó una abliteración a nivel de pesos ("CRACK") que elimina el circuito de rechazo preservando visión, MoE y normas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

El pipeline de cuantización documentado es FP8 → Q8_0 (puente de precisión completa) → requantización IQ4-MAYA. La decisión técnica destacable es el mapa mixto: atención, indexer y shared experts se fijan en 8 bits y las normas permanecen en F32, mientras que los expertos routed bajan a 4 bits (IQ4_XS en `down`, Q4_K en `gate`/`up`), lo que da 5,04 bits efectivos. El pack incluye un drafter MTP (DSpark, 8,5 GB) que, según el autor, aporta +2,7 % en prompts cortos (dentro del ruido) y es un 11 % más lento a 1M de contexto, por lo que recomienda servirlo sin él. También se preservan los niveles de razonamiento (`low`/`high`/`max`) y los valores de muestreo sugeridos son `temperature=1.0`, `top_p=1.0` y `max_tokens ≥ 256K` para el razonador pesado.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens sin ventaneo.
- Razonamiento con niveles configurables (`low`, `high`, `max`).
- Capacidades multimodales de imagen a texto: el tower de visión y el proyector están verificados de extremo a extremo (imagen de entrada, descripción de salida).
- Soporte de tool calling / function calling según la model card.
- Capacidades de agente y razonamiento multi-paso (implícitas en el soporte de herramientas y en los niveles de razonamiento).
- Modo "uncensored" por abliteración a nivel de pesos: el autor reporta un 98 % de cumplimiento en HarmBench-320 pese a la cuantización a 4 bits.
- Multilingüe limitado: el repo declara únicamente inglés (`en`).

## Casos de uso

- Asistente conversacional de contexto largo: con 1M tokens de ventana puede mantener conversaciones multi-turno sobre documentos extensos o historiales completos sin truncar, adecuado para atención al cliente con base de conocimiento adjunta.
- Análisis de documentos e imágenes combinados: al aceptar image-text-to-text, sirve para extraer información de capturas, diagramas o documentos escaneados junto a texto de contexto.
- Automatización de agentes con herramientas: el soporte de tool calling y los niveles de razonamiento permiten construir pipelines de agente multi-paso para tareas de investigación o extracción de datos.
- Generación y revisión de código en pipelines: puede integrarse en flujos de CI/CD o asistentes de IDE, aunque el tamaño del modelo exige infraestructura dedicada y su licencia MIT facilita el uso comercial.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, es útil para estudiar comportamiento sin rechazo, evaluación de sesgos y robustez de filtros, siempre con las salvaguardas externas adecuadas.
- Procesamiento por lotes de corpus largos: la ventana de 1M y el servido vía API compatible con OpenAI/Anthropic permiten resumir, clasificar o extraer entidades de documentos muy largos en un solo paso.
- Despliegue en hardware con VRAM limitada: el esquema de Project Maya (expertos activos en GPU, siguientes en RAM, resto en NVMe) permite servir un modelo de este tamaño con una GPU consumer o de gama profesional y ~256 GB de RAM.

## Benchmarks y rendimiento

La model card solo reporta un resultado concreto: 98 % de cumplimiento en HarmBench-320 para esta cuantización de 4 bits. También indica que las matemáticas son el área donde se nota la pérdida de bits, pero no aporta cifras. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| HarmBench-320 | 98 % compliant | Medido por el autor sobre esta cuantización IQ4 |
| MMLU / HumanEval / GSM8K | no disponible | No publicados en la información proporcionada |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor indica que más VRAM implica más velocidad y que el motor mantiene en GPU los expertos que usa la conversación.
- GPU recomendadas: NVIDIA con compute capability 7.0 o superior; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc. no se mencionan).
- RAM: aproximadamente 256 GB para el modelo; una segunda sesión paralela cuesta menos de 1 GB y quedan ~6 GB libres para el resto del sistema.
- Almacenamiento: NVMe rápido con ~480 GB libres.
- Software: CUDA 12.x, Python con `jinja2`, `numpy` y `pillow`; motor Project Maya (recomendado) o llama.cpp para los shards GGUF y el `mmproj`.
- Despliegue: Project Maya expone API compatible con OpenAI y Anthropic con visión, niveles de pensamiento y tool calls; los shards también cargan en llama.cpp.
- Latencia y throughput: no disponibles; el único dato es que el drafter MTP es un 11 % más lento a 1M de contexto y +2,7 % en prompts cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4.1-Flash-1017 UNCENSORED IQ4-MAYA) | 552B totales / 8B activos (texto) | 1M | MIT | GGUF, 11 shards, pack Maya | Cuantización de 4 bits de un abliterado FP8 |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 552B totales / 8B activos | 1M | no disponible en la información | Checkpoint original | Modelo base sin abliterar |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | 552B totales / 8B activos | 1M | no disponible en la información | FP8 | Abliteración original de la que deriva este repo |
| Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-Q8_0-GGUF | 552B totales / 8B activos | 1M | MIT | GGUF Q8_0 | Modelo base declarado de esta cuantización |

No se dispone de datos de benchmarks comparativos ni de alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencias en los metadatos: el campo de parámetros del repo (485.273.600) no cuadra con los 552B totales de la card, y el tamaño del repo (482,1 GB) difiere de los 471,6 GB declarados; conviene verificar antes de planificar almacenamiento.
- La abliteración elimina el circuito de rechazo: el modelo puede producir contenido dañino o no solicitado; requiere salvaguardas externas en producción y revisión legal según el caso de uso.
- El autor advierte que cuantizar a pocos bits un FP8 abliterado puede hacer regresar el cumplimiento; aunque mide 98 % en HarmBench-320, no hay garantía fuera de ese conjunto.
- Pérdida de calidad en matemáticas por la cuantización a 4 bits, según reconoce el propio autor; no hay cifras publicadas.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en un modelo de este tipo y debe mitigarse con verificación.
- El drafter MTP es opcional y puede empeorar la latencia a contexto largo; el autor recomienda servirlo sin él.
- Requisitos de infraestructura elevados (~256 GB RAM, ~480 GB NVMe, CUDA 12.x) que limitan el despliegue a entornos dedicados.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero debe revisarse la licencia del modelo base original, no disponible en esta información.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-MTP-Maya-Q4-K-IQ4-GGUF
- Modelo base declarado (Q8_0 GGUF): https://huggingface.co/Adolphsson/DeepSeek-V4.1-Flash-1017-UNCENSORED-Q8_0-GGUF
- Checkpoint abliterado FP8 de dealignai: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo original de deepseek-ai: deepseek-ai/DeepSeek-V4.1-Flash-1017 (referenciado en la card; sin URL directa en la información)
- Project Maya (motor): https://github.com/mw00/project-maya
- Documentación de instalación de Maya: https://github.com/mw00/project-maya/blob/main/docs/SETUP.md
- Documentación de ajustes de Maya: https://github.com/mw00/project-maya/blob/main/docs/SETTINGS.md
- Repo del proyector de visión (GSQ-RCO de pfeifferj): referenciado en la card sin URL directa en la información
