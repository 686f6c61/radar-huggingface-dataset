# Aiidkx/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parametros desarrollado por Liquid AI, publicado en HuggingFace bajo el identificador `Aiidkx/LFM3-1.7B` como un fine-tune del checkpoint base `LiquidAI/LFM3-1.7B-Base`. Se trata de un modelo de texto post-entrenado, disenado especificamente para agentes locales y aplicaciones especializadas, y construido sobre una arquitectura tri-hibrida que combina convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global a lo largo de sus 24 capas.

El modelo destaca por su enfoque hacia el edge computing: con cuantizacion de 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite ejecutarlo en telefonos moviles y portatiles convencionales. Ademas, incorpora una ventana de contexto de 256.000 tokens (entrada mas salida), un vocabulario de 128.000 tokens y soporte para 16 idiomas, incluyendo espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.

Su relevancia actual radica en la combinacion de un contexto muy extenso con un tamano reducido y un entrenamiento orientado a tareas agenticas (Hermes Agent, Pi, OpenClaw), lo que lo posiciona como una opcion viable para despliegues en dispositivos con recursos limitados donde otros modelos de contexto largo no caben. La licencia LFM1.0 (etiquetada como "other" en HuggingFace) condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionada en la model card; no se detallan otros formatos |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 3,5 GB |
| Modelo base | LiquidAI/LFM3-1.7B-Base |

## Arquitectura y entrenamiento

La arquitectura es un transformer tri-hibrido de 24 capas que distribuye tres tipos de bloques: 13 capas de convolucion corta con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla busca reducir el coste computacional y de memoria de la atencion tradicional manteniendo la capacidad de modelar dependencias de largo alcance, lo que explica que un modelo de solo 1,73B de parametros pueda sostener una ventana de contexto de 256K tokens. El vocabulario de 128.000 tokens es inusualmente grande para este tamano de modelo y favorece la eficiencia multilingue.

El checkpoint publicado es un modelo de texto post-entrenado (no el base), con entrenamiento orientado a entornos agenticos como Hermes Agent, Pi y OpenClaw. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; esa informacion no esta disponible. Tampoco se especifican innovaciones adicionales como decodificacion especulativa. El modelo requiere `custom_code` en transformers, lo que implica que la implementacion de la arquitectura no es la estandar de la libreria y debe cargarse con `trust_remote_code=True`.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, con especial cobertura de ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento de multiples pasos y ejecucion en bucles agenticos, gracias al post-entrenamiento especifico para harnesses como Hermes Agent, Pi y OpenClaw.
- Manejo de contextos muy largos de hasta 256K tokens, adecuado para documentos extensos, historiales de conversacion prolongados y repositorios de codigo.
- Capacidad de especializacion mediante fine-tuning rapido en una sola GPU, segun indica la model card.
- Despliegue en dispositivos edge: con cuantizacion de 4 bits ocupa aproximadamente 1 GB.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de vision o audio: no disponibles en este checkpoint (el modelo es text-only; la familia LFM3 incluye variantes de vision, audio, omni y decision por separado).
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes locales en movil: el modelo cabe en aproximadamente 1 GB a 4 bits, por lo que puede ejecutarse en un telefono para asistentes personales que gestionan tareas multi-paso sin conexion a la nube, aprovechando su entrenamiento agentico.
- Atencion al cliente automatizada: con 256K tokens de contexto puede mantener conversaciones multi-turno muy largas y recordar el historial completo de un cliente, incluidos documentos o tickets previos, sin truncamiento.
- Procesamiento de documentos extensos en el edge: resumen y extraccion de informacion de contratos, informes o manuales de cientos de paginas en un portatil, sin necesidad de GPU de datacenter.
- Fine-tuning especializado por dominio: la model card indica que admite ajuste rapido en una sola GPU, lo que permite adaptarlo a formatos propios, jerga interna o herramientas corporativas concretas con coste bajo.
- Automatizacion de flujos agenticos de escritorio: integracion en harnesses como OpenClaw o Pi para tareas de automatizacion local (gestion de archivos, consultas a APIs internas) donde la privacidad impide enviar datos a la nube.
- Asistencia multilingue en centros de soporte: cobertura de 16 idiomas, incluido espanol, para clasificacion y respuesta en multiples lenguas desde un unico modelo pequeno.
- Prototipado rapido de aplicaciones de texto: su tamano reducido y su integracion con transformers permiten iterar en estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con cuantizacion de 4 bits (dato de la model card); en precision completa (fp16/bf16) se estiman en torno a 3,5 GB solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM para fp16; para 4 bits, practicamente cualquier GPU integrada o movil reciente.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas de portatiles; tambien en telefonos segun el fabricante.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B | 1,73B | 256K | lfm1.0 | Arquitectura tri-hibrida, orientado a edge y agentes |
| Modelos de ~1-2B de la competencia | ~1-2B | no disponible | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo multilingue entrenado con datos no especificados, es previsible que herede sesgos de esos corpus, pero no hay informacion concreta.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de 1,73B, la tasa de alucinacion puede ser superior a la de modelos de mayor tamano, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: aunque declara 256K tokens, no se aportan evaluaciones de rendimiento en contextos largos (long-context retrieval); el soporte de los 16 idiomas es declarativo y no se detalla su calidad relativa.
- Restricciones de licencia: la licencia lfm1.0 (etiquetada como "other") puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue en produccion.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y revisar su procedencia.
- Es un fine-tune de un tercero (`Aiidkx`) sobre el base de Liquid AI; no hay evaluaciones independientes publicadas ni garantias de calidad equivalentes al checkpoint oficial.
- Modelo text-only: no procesa imagenes ni audio pese a que la familia LFM3 incluya esas variantes.
- No se confirma soporte de tool calling ni de formatos de cuantizacion distintos de 4 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aiidkx/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Coleccion LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
