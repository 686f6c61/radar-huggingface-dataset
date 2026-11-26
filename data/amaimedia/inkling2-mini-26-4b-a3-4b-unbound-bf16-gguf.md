# AMAImedia/Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF

## Resumen
Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF es una cuantizacion en GGUF del modelo Inkling-2-Mini de Thinking Machines Lab, publicada por AMAImedia. Se trata de una variante "abliterated" y "uncensored" (etiquetada como Unbound) del modelo original, es decir, con las capas de rechazo atenuadas mediante tecnicas de abliteration. El modelo base es un transformer autoregresivo multimodal con arquitectura de bucle (looped transformer) y mezcla de expertos dispersa (MoE), disenado para aceptar entradas de texto e imagen y generar texto.

El modelo original cuenta con 26.388.646.440 parametros totales y activa aproximadamente 3.4B por token, gracias a un enrutamiento que selecciona 8 de 128 expertos en cada capa. Su arquitectura de 24 capas ejecuta las 12 capas centrales tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token. Esta pensado para desarrolladores que construyen aplicaciones de IA: asistentes de codigo, chatbots, sistemas agénticos con tool calling y pipelines de generacion aumentada por recuperacion (RAG).

La relevancia de esta publicacion concreta radica en que ofrece pesos en formato GGUF y BF16 para inferencia local, algo que el checkpoint original (distribuido en NVFP4 y MXFP8) no facilita directamente. La licencia Apache 2.0 permite uso comercial, y el modelo base esta disenado para ejecutarse en hardware de consumo con 32 GB o mas de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo multimodal con bucle (looped transformer) y MoE dispersa |
| Parametros totales | 26.388.646.440 |
| Parametros activos | ~3.4B (8 de 128 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF (incluye variantes con imatrix); el original en NVFP4 y MXFP8 |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts dispersa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que produce 48 aplicaciones de capa por token a partir de 24 capas de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atencion es un hibrido de capas locales y globales. El modelo es nativamente multimodal: las imagenes se codifican mediante un vision transformer y las entradas de imagen y texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card original menciona que el modelo esta disenado para uso conversacional, seguimiento de instrucciones y tareas naturales y visuales, y que se publica con pesos abiertos para investigacion, fine-tuning e integracion en productos de terceros. La variante aqui descrita anade las modificaciones de abliteration del autor de la cuantizacion.

## Capacidades
- Generacion de texto y razonamiento general en ingles y otros idiomas.
- Comprension de imagenes: entrada image-text-to-text mediante vision transformer.
- Generacion y asistencia de codigo en multiples lenguajes de programacion.
- Soporte de tool calling y function calling para sistemas agénticos.
- Razonamiento multi-paso para agentes y pipelines automatizados.
- Uso conversacional multi-turno y seguimiento de instrucciones.
- Capacidades multilingues generales (el modelo base declara soporte multilingue).
- Variante sin censura (abliterated): se atenuan las capas de rechazo del modelo original.

## Casos de uso
- Asistencia de codigo en produccion: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests y explicacion de errores, aprovechando su entrenamiento en multiples lenguajes de programacion.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con entradas de texto e imagen, lo que permite a los usuarios adjuntar capturas de pantalla o documentos y recibir respuestas contextualizadas.
- Procesamiento de documentos con imagenes: al ser nativamente multimodal, puede extraer y razonar sobre informacion de facturas, formularios o capturas, integrándose en flujos de digitalizacion.
- Agentes autonomos con herramientas: su soporte de function calling y razonamiento multi-paso lo hace adecuado para orquestar llamadas a APIs, busquedas y acciones encadenadas en entornos controlados.
- Generacion aumentada por recuperacion (RAG): el modelo esta disenado explicitamente para sistemas RAG, combinando recuperacion de documentos con generacion de respuestas en ingles y otros idiomas.
- Inferencia local en estaciones de trabajo: la cuantizacion GGUF permite desplegar el modelo en equipos con 32 GB de memoria (Apple silicon o GPU consumer de gama alta), util para prototipado y entornos con requisitos de privacidad.
- Fine-tuning e investigacion: al publicarse con licencia Apache 2.0 y pesos abiertos, sirve como base para ajuste fino en dominios especializados mediante plataformas como Tinker, Miles o SkyRL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint original (~20 GB en NVFP4/MXFP8) requiere 32 GB o mas de memoria; la version BF16 del repositorio (49.6 GB) necesita aproximadamente 50 GB o mas, mientras que las cuantizaciones GGUF reducen el requisito segun el nivel de cuantizacion.
- GPU recomendadas: NVIDIA DGX Spark (soporte oficial), GPUs con 32 GB o mas de VRAM; para BF16 se recomienda H100, A100 80GB o configuraciones multi-GPU.
- Cabe en consumer GPU: si, en GPUs con 24-32 GB para cuantizaciones GGUF (por ejemplo RTX 3090/4090 con cuantizaciones agresivas); en Apple silicon con 32 GB o mas (MacBook, Mac mini, Mac Studio) mediante Ollama o Exo Labs.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, llama.cpp, Ollama, Unsloth, Llama App y Exo Labs.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling2-Mini (este) | 26.4B totales / ~3.4B activos | no disponible | Apache 2.0 | Pesos abiertos en HF, GGUF |
| thinkingmachines/Inkling-2-Mini (base) | 26.4B totales / ~3.4B activos | no disponible | Apache 2.0 | Pesos abiertos en HF (NVFP4/MXFP8) |
| nokeepai/Inkling-2-Mini-Unbound | 26.4B totales / ~3.4B activos | no disponible | Apache 2.0 | Pesos abiertos en HF (variante sin censura) |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- La variante abliterated/uncensored elimina parcialmente las capas de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, danino o no alineado con politicas de seguridad; no se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- El modelo base declara soporte principal de ingles; el rendimiento en otros idiomas puede ser inferior y no esta cuantificado.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide planificar cargas de contexto largo con garantias.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento del modelo modificado.
- El repositorio tiene un volumen de descargas bajo (1184) y un solo like, lo que sugiere poca validacion comunitaria de esta cuantizacion concreta.
- El contenido de la model card incluye material promocional y enlaces de donacion; conviene tratar la informacion tecnica con cautela y contrastarla con la model card del modelo base.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Inkling2-Mini-26.4B-A3.4B-Unbound-BF16-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio original Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF original Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- GitHub Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Tinker playground: https://tinker.thinkingmachines.ai/playground
- Blog Hugging Face: https://hf.co/blog/inkling2mini
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Documentacion Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentacion SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Web AMAImedia: https://www.amaimedia.com
