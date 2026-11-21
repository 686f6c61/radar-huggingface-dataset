# fellamane/gemma-4-12B-it

## Resumen
Gemma 4 12B Unified es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, publicado en Hugging Face por el usuario fellamane como fine-tuning del checkpoint base `google/gemma-4-12B`. Forma parte de la familia Gemma 4 y su rasgo diferencial es una arquitectura "unified" o "encoder-free": en lugar de emplear codificadores dedicados de vision y audio, proyecta los parches de imagen y las formas de onda de audio directamente al espacio de embeddings del transformer mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite ajustar todo el modelo en una sola pasada.

El modelo cuenta con 11.959.730.224 parametros (11,95B) en una arquitectura densa de 48 capas, ventana de atencion deslizante de 1024 tokens y una longitud de contexto de hasta 256K tokens. Soporta entradas de texto, imagen y audio, y genera salida de texto. Esta disenado para ejecutarse en GPUs de consumo y estaciones de trabajo, no solo en servidores de alta gama.

Su relevancia actual radica en que combina contexto largo, razonamiento configurable con modos de "thinking", soporte nativo de function calling y multimodalidad sin codificadores separados, todo bajo licencia Apache 2.0. El repositorio ocupa 24 GB y se distribuye en formato safetensors para la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window local + atencion global), encoder-free para multimodal |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en el material proporcionado) |
| Idiomas soportados | Mas de 140 idiomas segun la model card de la familia Gemma 4; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

Otros datos tecnicos: 48 capas, ventana deslizante de 1024 tokens, vocabulario de 262K tokens, tamano del repositorio de 24,0 GB, pipeline `any-to-any`, modalidades de entrada texto, imagen y audio, salida de texto.

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso de 48 capas que emplea un mecanismo de atencion hibrido: intercala capas con atencion local de ventana deslizante (1024 tokens) con capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales usan claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens.

La innovacion principal es la arquitectura "unified" sin codificadores: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, en lugar de pasar por encoders dedicados como en el resto de la familia Gemma 4. Esto permite que todas las modalidades fluyan por un unico transformer y que el modelo completo se pueda fine-tunear en una sola pasada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el material proporcionado.

## Capacidades
- Generacion de texto y razonamiento con modos de "thinking" configurables.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa, sin codificador separado.
- Procesamiento de video como entrada multimodal (segun la familia Gemma 4).
- Soporte nativo de function calling para flujos agenticos.
- Capacidades agenticas y razonamiento multi-paso.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Generacion de codigo y tareas de matematicas (la familia Gemma 4 declara mejoras notables en benchmarks de codigo).

## Casos de uso
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 256K tokens y aceptar capturas de pantalla o audios del cliente, lo que permite resolver incidencias que requieren interpretar imagenes o grabaciones sin cambiar de pipeline.
- Transcripcion y analisis de audio en local: al integrar el audio de forma nativa y sin codificador externo, se puede desplegar en un portatil o estacion de trabajo para resumir reuniones, generar actas o clasificar llamadas sin enviar datos a la nube.
- Generacion de codigo en produccion: su soporte de function calling y capacidades agenticas permiten integrarlo en pipelines de CI/CD para revision automatica de parches, generacion de tests o resolucion de issues con acceso a herramientas.
- Agentes autonomos multi-paso: con contexto largo y rol `system` nativo, es adecuado para orquestar tareas que requieren mantener estado durante muchas interacciones y llamar a APIs externas de forma estructurada.
- Analisis de documentos con imagen y texto: la ventana de 256K tokens y la entrada de imagen con resolucion variable permiten procesar informes escaneados, facturas o diagramas junto con su texto asociado en una sola pasada.
- Asistencia en dispositivos de consumo: con 11,95B parametros y arquitectura encoder-free, es viable en GPUs de gama alta para consumidores, habilitando asistentes locales con vision y audio sin dependencia de servidores.
- Razonamiento con modo "thinking" para tareas de matematicas y logica: util en entornos educativos o de analisis donde se necesita trazabilidad del razonamiento y control del coste computacional segun la dificultad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 24 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 32 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 12-14 GB para pesos, aunque no se confirma disponibilidad de pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) al limite en precision completa y mas holgada con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 o GPUs con 24 GB o mas, especialmente con cuantizacion; en GPUs de 16 GB requeriria cuantizaciones agresivas no confirmadas.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible, aunque el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B Unified (este) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Encoder-free, denso |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Mayor capacidad, sin audio, requiere mas VRAM |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Orientado a edge, menor contexto |
| Gemma 4 26B A4B MoE | 26B totales, 4B activos | No disponible en el material | No disponible | Apache 2.0 | Arquitectura MoE, eficiencia en inferencia |

## Limitaciones y advertencias
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; no se han publicado tasas concretas para este checkpoint.
- Sesgos conocidos: no se documentan en la informacion disponible; se recomienda evaluacion propia antes de uso en produccion.
- El modelo es un fine-tuning publicado por un tercero (fellamane) sobre `google/gemma-4-12B`; el rendimiento puede diferir del checkpoint oficial de Google DeepMind y no cuenta con validacion independiente (0 descargas, 0 likes en el momento de la consulta).
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos exactos para uso comercial.
- No se confirma la disponibilidad de pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita el despliegue en hardware modesto.
- La lista concreta de idiomas soportados no esta disponible, solo la referencia a mas de 140 idiomas de la familia.
- El procesamiento de video se menciona a nivel de familia, pero no se detalla su soporte especifico en este checkpoint.
- Contexto de 256K tokens: el coste de KV cache crece de forma significativa y puede agotar la VRAM en GPUs de consumo si se llena la ventana.

## Enlaces
- [Hugging Face: fellamane/gemma-4-12B-it](https://huggingface.co/fellamane/gemma-4-12B-it)
- [Coleccion Gemma 4 en Hugging Face](https://huggingface.co/collections/google/gemma-4)
- [GitHub de Google Gemma](https://github.com/google-gemma)
- [Blog de lanzamiento de Gemma 4 12B](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- [Documentacion de Gemma](https://ai.google.dev/gemma/docs/core)
- [Informe tecnico (arXiv:2607.02770)](https://arxiv.org/abs/2607.02770)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [Pagina de modelos Gemma de Google DeepMind](https://deepmind.google/models/gemma/)
