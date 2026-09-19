# google/gemma-4-12B-it-qat-q4_0-gguf

## Resumen

Gemma 4 12B es un modelo multimodal desarrollado por Google DeepMind, publicado bajo licencia Apache 2.0. Esta ficha concreta corresponde al checkpoint `google/gemma-4-12B-it-qat-q4_0-gguf`, es decir, la variante instruction-tuned del modelo de 12B sometida a Quantization-Aware Training (QAT) y serializada en formato GGUF con cuantizacion Q4_0. El objetivo del QAT es preservar una calidad cercana a la de los pesos en bfloat16 reduciendo de forma drastica los requisitos de memoria, lo que facilita el despliegue en GPUs de consumo y estaciones de trabajo.

El modelo forma parte de la familia Gemma 4, que cubre cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) con arquitecturas densas y de mezcla de expertos. La variante 12B es densa, con 11.907.350.576 parametros totales, 48 capas, ventana de atencion deslizante de 1024 tokens y una longitud de contexto de hasta 256K tokens. Segun la model card, soporta entrada de texto e imagen, ademas de audio de forma nativa en los modelos E2B, E4B y 12B, y mantiene soporte multilingue en mas de 140 idiomas.

Su relevancia actual radica en que combina razonamiento con modos de "thinking" configurables, soporte nativo de function calling y agentes, y un System Prompt nativo, todo ello en un formato listo para desplegar (GGUF Q4_0). El repositorio acumula 802.326 descargas y 301 likes, lo que indica una adopcion amplia por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + global), capas globales con Keys/Values unificadas y Proportional RoPE (p-RoPE) |
| Parametros totales | 11.907.350.576 (~11,95B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF Q4_0 (esta variante); la familia tambien ofrece Q4_0 sin cuantizar, w4a16 en formato compressed-tensors (vLLM) y wNa8o8 para movil (solo E2B/E4B) |
| Idiomas soportados | mas de 140 idiomas segun la model card; el campo de idiomas del repositorio figura como no disponible |
| Licencia | Apache 2.0 (license_link: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (Q4_0) |
| Numero de capas | 48 |
| Tamano de vocabulario | 262K |
| Ventana deslizante | 1024 tokens |
| Modalidades de entrada | texto, imagen y audio (audio nativo en E2B, E4B y 12B) |
| Modalidades de salida | texto |
| Tamano del repositorio | 21,3 GB |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo emplea un transformer denso con un mecanismo de atencion hibrida que intercala capas de atencion local de ventana deslizante (1024 tokens en el 12B) con capas de atencion global completa, garantizando que la ultima capa sea siempre global. Este diseno busca combinar la velocidad de procesamiento y la baja huella de memoria de un modelo ligero con la conciencia de contexto necesaria para tareas de contexto largo. Para optimizar la memoria en contextos extensos, las capas globales usan Keys y Values unificadas y aplican Proportional RoPE (p-RoPE). La variante 12B es multimodal unificada, con soporte de texto, imagen y audio.

En cuanto al entrenamiento, la model card no detalla el numero de tokens ni la composicion exacta del dataset, ni especifica si se emplearon tecnicas de RLHF o DPO. La innovacion principal de esta publicacion es el uso de Quantization-Aware Training (QAT), que produce checkpoints capaces de mantener una calidad similar a bfloat16 con requisitos de memoria muy inferiores. La informacion disponible tambien menciona compatibilidad con decodificacion especulativa mediante multi-token prediction, con la condicion de que el modelo asistente sea tambien un checkpoint QAT con la misma precision. Los detalles completos de arquitectura y entrenamiento se remiten al informe tecnico (arXiv:2607.02770).

## Capacidades

- Generacion de texto y razonamiento avanzado, con modos de pensamiento ("thinking") configurables en toda la familia Gemma 4.
- Comprension multimodal: procesa texto e imagen con soporte de relacion de aspecto y resolucion variables (todos los modelos), ademas de video y audio (audio nativo en E2B, E4B y 12B).
- Generacion de codigo con mejoras notables en benchmarks de programacion segun la model card.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas y razonamiento multi-paso orientadas a agentes autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` (System Prompt), lo que permite conversaciones mas estructuradas y controlables.
- Compatibilidad con decodificacion especulativa mediante multi-token prediction (requiere asistente QAT con la misma precision).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno e integrar contexto documental extenso gracias a su ventana de hasta 256K tokens, manteniendo coherencia en hilos largos con soporte de System Prompt para definir la politica de respuesta.
- Generacion de codigo en produccion: con soporte de function calling y mejoras en tareas de programacion, puede integrarse en pipelines de CI/CD para autocompletado, revision de cambios o generacion de tests.
- Agentes autonomos multi-paso: su soporte nativo de tool calling y razonamiento multi-paso lo hace adecuado para flujos donde el modelo decide que herramienta invocar en cada iteracion (consulta a APIs, ejecucion de comandos, busqueda).
- Analisis de documentos con imagenes: al aceptar entrada de imagen y texto, puede extraer y razonar sobre informacion contenida en capturas, diagramas o documentos escaneados dentro de un mismo contexto.
- Asistentes de voz o transcripcion con razonamiento: el soporte de audio nativo en el 12B permite construir interfaces conversacionales que reciben audio y producen respuestas textuales.
- Despliegue en estaciones de trabajo y GPUs de consumo: al distribuirse en GGUF Q4_0, permite ejecutar un modelo de 12B multimodal en hardware asequible mediante llama.cpp u Ollama, sin depender de infraestructura en la nube.
- Procesamiento de corpus multilingues: con soporte en mas de 140 idiomas, sirve para clasificacion, resumen o extraccion de informacion en entornos multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_0, los pesos de un modelo de ~11,95B ocupan aproximadamente 7 GB; hay que anadir el coste del KV cache, que crece con el contexto y puede ser elevado al acercarse a los 256K tokens.
- GPU recomendadas: para contexto largo completo se recomiendan GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100, H100); para contextos moderados pueden bastar GPUs de 12-16 GB segun configuracion.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB en adelante (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) siempre que se ajuste la longitud de contexto al presupuesto de memoria disponible.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; LM Studio para uso local; vLLM para la variante en formato compressed-tensors (w4a16), que la model card indica como la opcion optimizada de inferencia nativa en vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 12B (esta ficha) | ~11,95B | 256K | Apache 2.0 | GGUF Q4_0 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Dentro de la propia familia Gemma 4, la variante 12B se situa entre los modelos pequenos (E2B con 2,3B efectivos y E4B con 4,5B efectivos, ambos con 128K de contexto) y los modelos mayores (26B A4B y 31B Dense, con 256K de contexto).

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de forma documentada.
- Riesgo de alucinacion inherente a los modelos generativos; los datos de benchmarks no estan disponibles para acotar el rendimiento real.
- El campo de idiomas del repositorio figura como no disponible; el soporte de 140 idiomas proviene de la model card general de la familia, no de una verificacion especifica de esta variante cuantizada.
- La cuantizacion Q4_0, pese al QAT, puede introducir perdidas de calidad respecto a los pesos sin cuantizar; conviene validar en el caso de uso concreto.
- Para usar decodificacion especulativa con un modelo asistente, este debe ser tambien un checkpoint QAT con la misma precision; usar un asistente de distinta precision puede romper la compatibilidad.
- Aunque la licencia es Apache 2.0, existe un enlace especifico de licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) que conviene revisar para usos comerciales y de redistribucion.
- Esta variante GGUF no incluye las ventajas de despliegue optimizado reservadas a otros formatos (por ejemplo, w4a16 en compressed-tensors para vLLM o wNa8o8 para movil, este ultimo solo en E2B/E4B).

## Enlaces

- HuggingFace: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Coleccion Gemma 4 QAT Q4_0 en HuggingFace: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma en DeepMind: https://deepmind.google/models/gemma/
- Modelo base (no cuantizado): google/gemma-4-12B-it-qat-q4_0-unquantized
