# kldzj/gemma-4-E4B-it-heretic

## Resumen

Gemma 4 E4B-it-heretic es una variante "decensored" (abliterated) del modelo multimodal Gemma 4 E4B-it de Google DeepMind, publicada por el usuario kldzj. El modelo base pertenece a la familia Gemma 4, que combina arquitecturas densas y MoE con soporte nativo para texto, imagen y audio, ventanas de contexto de hasta 256K tokens y capacidades de razonamiento con modos de pensamiento configurables. La variante heretic elimina total o parcialmente los mecanismos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 5 a 41.

El modelo conserva la arquitectura del Gemma 4 E4B: 4.500 millones de parametros efectivos (8.000 millones incluyendo embeddings, 7.941 millones reales en safetensors), 42 capas, ventana de contexto de 128K tokens y un vocabulario de 262K entradas. Incorpora embeddings por capa (Per-Layer Embeddings, PLE) para maximizar la eficiencia en despliegues on-device, ademas de codificadores de vision y audio de aproximadamente 150M y 300M de parametros respectivamente.

La relevancia de esta variante radica en su proposito: reducir la tasa de rechazos del modelo original de 100/100 a 16/100 en la evaluacion del autor, con una divergencia KL de 0.0487 respecto al modelo base. Es un modelo orientado a investigadores que necesitan estudiar el comportamiento de modelos sin las capas de rechazo, o a desarrolladores que requieren respuestas sin filtros en entornos controlados. La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia especifica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (sliding window local + atencion global), PLE (Per-Layer Embeddings) y p-RoPE en capas globales |
| Parametros totales | 7.941.100.832 (4.5B efectivos, 8B con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato safetensors en el repo) |
| Idiomas soportados | Mas de 140 idiomas segun la familia Gemma 4; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B emplea una arquitectura transformer densa con atencion hibrida que intercala atencion de ventana deslizante local (512 tokens) con atencion global completa, garantizando que la capa final sea siempre global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE), que asignan a cada capa decodificadora su propio embedding pequeno por token; estas tablas son grandes pero solo se usan para consultas rapidas, lo que explica la diferencia entre parametros efectivos (4.5B) y totales (8B). Dispone de 42 capas, vocabulario de 262K tokens y codificadores dedicados de vision (~150M) y audio (~300M).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. La variante heretic aplica Arbitrary-Rank Ablation (ARA) sobre las capas 5 a 41 con los parametros: start_layer_index 5, end_layer_index 41, preserve_good_behavior_weight 0.7918, steer_bad_behavior_weight 0.0001, overcorrect_relative_weight 0.9918 y neighbor_count 3. El proceso es reproducible segun el autor, con instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Procesamiento multimodal de entrada: texto, imagen (con soporte de relacion de aspecto y resolucion variable), video y audio (audio nativo en E2B, E4B y 12B).
- Generacion de codigo y capacidades agenticas mejoradas respecto a generaciones anteriores.
- Soporte nativo de function calling para agentes autonomos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Reduccion de rechazos: 16/100 frente a 100/100 del modelo original en la evaluacion del autor.
- Capacidad de razonamiento multi-paso y flujos agenticos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo sin capas de rechazo y comparar su distribucion de salidas con la del original (KL divergence de 0.0487), util para analisis de mecanismos de seguridad en LLMs.
- Generacion de codigo en produccion: con soporte nativo de function calling y 128K de contexto, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y refactorizacion automatizada.
- Agentes autonomos multi-paso: la combinacion de razonamiento configurable, tool calling y contexto largo permite construir agentes que planifican y ejecutan tareas complejas con multiples llamadas a herramientas.
- Procesamiento de documentos multimodales: la entrada de imagen y texto con resolucion variable facilita la extraccion y el razonamiento sobre documentos escaneados, graficos y capturas de pantalla.
- Transcripcion y analisis de audio: el codificador de audio de ~300M permite tareas de comprension de audio, como resumen de reuniones o analisis de contenido hablado, en el mismo modelo que procesa texto.
- Atencion al cliente automatizada sin filtros: en entornos controlados donde se requiere manejar consultas sensibles sin rechazos, el modelo puede gestionar conversaciones multi-turno con contexto largo.
- Analisis de contenido y moderacion: util para investigadores que necesitan generar o analizar contenido que el modelo original rechazaria, con fines de estudio de sesgos y riesgos.
- Despliegue on-device: con 4.5B parametros efectivos y diseno optimizado para eficiencia, puede ejecutarse en portatiles y dispositivos de gama alta.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-E4B-it) |
|---|---|---|
| Rechazos (Refusals) | 16/100 | 100/100 |
| Divergencia KL | 0.0487 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 15.9 GB en safetensors (pesos en precision completa o bfloat16). En cuantizacion de 8 bits se estiman ~8 GB; en 4 bits, ~4-5 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: para precision completa, GPU con 24 GB o mas (RTX 4090, A100 40GB, H100). Para cuantizacion 8 bits, GPU de 12-16 GB (RTX 4080, RTX 3090). Para 4 bits, GPU de 8 GB podria ser suficiente.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en precision completa; en RTX 3060/4060 Ti (8-16 GB) con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM, llama.cpp, Ollama y TGI son opciones plausibles para modelos safetensors, aunque no se confirman en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kldzj/gemma-4-E4B-it-heretic | 7.94B totales (4.5B efectivos) | 128K | Apache 2.0 | Variante decensored, multimodal (texto, imagen, audio) |
| google/gemma-4-E4B-it | 7.94B totales (4.5B efectivos) | 128K | Apache 2.0 (licencia Gemma 4) | Modelo original con filtros de rechazo, multimodal |
| Gemma 4 12B Unified | 11.95B | 256K | Apache 2.0 | Version superior de la familia, sin codificadores dedicados |
| Gemma 4 26B A4B | No disponible | 256K | Apache 2.0 | Variante MoE de la familia |

No se dispone de datos de rendimiento comparativo en benchmarks estandar para esta variante.

## Limitaciones y advertencias

- Al ser un modelo abliterated, ha reducido sus mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o danino sin advertencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente mayor al haberse alterado las capas internas del modelo.
- La ablacion puede degradar capacidades generales del modelo; el autor reporta una divergencia KL de 0.0487, lo que indica un cambio medible en la distribucion de salidas.
- Sesgos conocidos del modelo base Gemma 4 no documentados en la informacion proporcionada.
- Restricciones de licencia: aunque se declara Apache 2.0, el enlace de licencia remite a la licencia especifica de Gemma 4, que puede imponer condiciones adicionales para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- No se dispone de informacion sobre idiomas soportados de forma explicita en esta variante.
- Uso recomendado solo en entornos de investigacion controlados; no apto para produccion sin evaluacion exhaustiva de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/kldzj/gemma-4-E4B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Proyecto Heretic: https://heretic-project.org
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
