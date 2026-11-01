# NostraEmpire/mirror-lfm3-1.7b

## Resumen

LFM3-1.7B es un modelo de lenguaje de texto de 1,73 mil millones de parámetros desarrollado por Liquid AI, diseñado específicamente para agentes locales y aplicaciones especializadas. Se basa en una arquitectura tri-híbrida que combina convoluciones cortas con compuerta, atención de ventana deslizante y atención global, lo que le permite manejar un contexto de 256K tokens con una huella de memoria reducida. Este repositorio concreto (`NostraEmpire/mirror-lfm3-1.7b`) es un espejo del checkpoint oficial post-entrenado de Liquid AI, sin modificaciones declaradas por el autor del espejo.

El modelo está post-entrenado para su uso en arneses agénticos como Hermes Agent, Pi y OpenClaw, y está optimizado para ejecutarse en el borde: a precisión de 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en teléfonos y portátiles. Soporta 16 idiomas, incluido el español, y está pensado para ajuste fino rápido en una sola GPU para adaptarlo a dominios, formatos y herramientas concretas.

Su relevancia actual radica en la combinación de contexto largo (256K), capacidad de tool calling y un tamaño que permite despliegue local en hardware de consumo, lo que lo posiciona como una opción práctica para agentes personales y asistentes embebidos. No obstante, el propio autor advierte que no está recomendado para programación agéntica ni razonamiento multi-paso complejo debido a su tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido: 24 capas (13 convoluciones cortas con compuerta, 5 atención de ventana deslizante, 6 atención global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (la model card menciona 4 bits como referencia de memoria, sin detallar formatos) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura tri-híbrida de 24 capas que distribuye tres tipos de bloques: 13 capas de convolución corta con compuerta (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta combinación busca reducir el coste computacional y de memoria del contexto largo frente a un transformer de atención completa, manteniendo la capacidad de modelar dependencias globales. El vocabulario es de 128.000 tokens.

El checkpoint es un modelo post-entrenado de texto, construido sobre `LiquidAI/LFM3-1.7B-Base`. La model card indica que ha sido post-entrenado para arneses agénticos (Hermes Agent, Pi, OpenClaw) y que está pensado para tool calling y salidas estructuradas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Tool calling y function calling, con soporte para salidas estructuradas.
- Entrenamiento orientado a agentes, con integración en arneses como Hermes Agent, Pi y OpenClaw.
- Manejo de contexto largo de hasta 256K tokens para conversaciones multi-turno y documentos extensos.
- Ajuste fino rápido en una sola GPU para especialización en dominios, formatos y herramientas concretas.
- Despliegue en el borde: ~1 GB de memoria a 4 bits, apto para teléfonos y portátiles.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en este checkpoint de texto.

## Casos de uso

- Asistentes personales locales en teléfono o portátil: el modelo cabe en ~1 GB a 4 bits y puede gestionar conversaciones multi-turno con contexto largo, lo que permite mantener historial extenso sin salir del dispositivo.
- Agentes de automatización de tareas con tool calling: su post-entrenamiento para arneses agénticos permite conectar herramientas externas (calendario, correo, APIs) y ejecutar flujos de varios pasos acotados.
- Extracción de datos estructurados de documentos largos: con 256K tokens de contexto puede procesar informes, contratos o expedientes completos y devolver JSON u otro formato estructurado.
- Atención al cliente automatizada en varios idiomas: cubre 16 lenguas, incluido el español, y puede desplegarse en infraestructura propia sin depender de APIs externas.
- Clasificación y enrutamiento de tickets o correos: el ajuste fino en una sola GPU permite adaptarlo a taxonomías internas y formatos de salida específicos de cada organización.
- Asistente de documentación técnica con recuperación (RAG): la model card recomienda usar retrieval o búsqueda para tareas con mucho conocimiento, por lo que encaja como generador en pipelines RAG ligeros.
- Prototipado rápido de aplicaciones de texto en el borde: su tamaño y licencia permiten iterar en hardware de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits según la model card; en FP16 el checkpoint de 1,73B ocupa del orden de 3,5 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y en hardware integrado de portátiles.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en cualquier teléfono o portátil según el autor; en FP16 requiere una GPU con al menos ~4-6 GB de VRAM.
- Opciones de despliegue: la model card menciona variantes de checkpoint por framework y hardware, pero la información disponible está truncada y no detalla qué frameworks concretos (vLLM, llama.cpp, Ollama, TGI) están soportados. El repo usa `transformers` con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B (este) | 1,73B | 256K | LFM Open License v1.0 | Arquitectura tri-híbrida, orientado a agentes y borde |
| No disponible | - | - | - | No se han proporcionado datos de modelos comparables en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor indica que no está recomendado para programación agéntica ni razonamiento multi-paso complejo debido a su tamaño reducido.
- Para tareas con mucho conocimiento se recomienda usar retrieval o búsqueda; sin ellos, el riesgo de alucinación aumenta.
- No se detallan sesgos conocidos en la información disponible.
- La licencia LFM Open License v1.0 no es una licencia de código abierto estándar; es necesario revisar sus términos antes de uso comercial.
- Este repositorio es un espejo no oficial (`NostraEmpire/mirror-lfm3-1.7b`) con 4 descargas y 0 likes; para producción conviene verificar contra el checkpoint oficial de Liquid AI.
- La información sobre frameworks de inferencia y cuantizaciones concretas está truncada en la model card disponible.
- El contexto de 256K es nominal; el rendimiento real en ventanas muy largas no está documentado en la información disponible.

## Enlaces

- Repositorio del espejo: https://huggingface.co/NostraEmpire/mirror-lfm3-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo oficial (referenciado en la model card): https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
