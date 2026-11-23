# mdcreativeagent/gemma-3-4b-pt

## Resumen

Gemma 3 4B PT es la variante preentrenada (no instruida) del modelo de 4.000 millones de parametros de la familia Gemma 3, desarrollada por Google DeepMind y distribuida con pesos abiertos. Este repositorio concreto (`mdcreativeagent/gemma-3-4b-pt`) es una copia del checkpoint oficial `google/gemma-3-4b-pt`, publicada con herramientas de Unsloth para facilitar el ajuste fino y la exportacion a GGUF. Se trata de un modelo multimodal que acepta texto e imagenes como entrada y genera texto, con una ventana de contexto de 128.000 tokens.

La relevancia de este modelo radica en su relacion tamano-capacidad: con 4.300 millones de parametros ofrece contexto largo, vision integrada y cobertura multilingue declarada de mas de 140 idiomas, lo que permite desplegarlo en hardware de consumo o en una unica GPU de gama media. Al ser un checkpoint *pre-trained*, no incorpora alineamiento conversacional ni formato de chat: es la base adecuada para ajuste fino supervisado, DPO o RLHF, no para uso directo en produccion conversacional sin un post-entrenamiento previo.

La ficha describe el modelo base Gemma 3 4B PT segun la informacion disponible; los datos especificos del autor de este repositorio (volumen de descargas, likes, fecha de creacion) son marginales y no alteran las caracteristicas tecnicas del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (familia Gemma 3) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens de entrada; 8.192 tokens de salida |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (Unsloth ofrece variantes GGUF de 4 bits y 16 bits en su coleccion) |
| Idiomas soportados | Mas de 140 idiomas segun la model card de Gemma 3; el campo `language` del repositorio declara solo `en` |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (tamano del repo: 8,6 GB) |

## Arquitectura y entrenamiento

Gemma 3 4B es un transformer decoder-only con capacidad multimodal: las imagenes se normalizan a 896 x 896 pixeles y se codifican en 256 tokens cada una, que se concatenan con la secuencia de texto. La ventana de contexto alcanza 128.000 tokens en las variantes de 4B, 12B y 27B (32.000 en la de 1B), y la generacion esta limitada a 8.192 tokens de salida. El modelo deriva de la misma investigacion y tecnologia empleadas en los modelos Gemini de Google.

Segun la model card oficial, la variante de 4B se entreno con 4 billones (4 trillion) de tokens sobre una mezcla que incluye documentos web en mas de 140 idiomas y codigo fuente. El checkpoint publicado aqui es la version *pre-trained* (PT), es decir, sin ajuste por instrucciones ni alineamiento por preferencias; el autor del repositorio no documenta ningun proceso adicional de RLHF o DPO. La integracion con Unsloth permite ajuste fino con ahorro de memoria y exportacion a GGUF, Ollama y llama.cpp.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre documentos largos gracias al contexto de 128.000 tokens.
- Comprension de imagenes: descripcion de contenido visual, respuesta a preguntas sobre imagenes y extraccion de informacion de capturas o diagramas.
- Resumen de documentos extensos y analisis de contenido multimodal.
- Razonamiento basico y tareas de conocimiento general (el modelo esta preentrenado, no alineado para conversacion).
- Capacidades multilingues declaradas para mas de 140 idiomas, aunque el campo `language` del repositorio solo lista ingles.
- Base para ajuste fino supervisado, DPO y RLHF mediante Unsloth.
- Soporte de tool calling y comportamiento agentico: no disponible en la informacion proporcionada para el checkpoint PT (depende del post-entrenamiento).

## Casos de uso

- Ajuste fino para dominio vertical: partir del checkpoint PT y entrenar con Unsloth sobre datos propios (legal, sanitario, financiero) para obtener un modelo especializado de 4B desplegable en una sola GPU.
- Extraccion de informacion de documentos escaneados: combinar la entrada de imagen a 896 x 896 con el contexto de 128.000 tokens para procesar facturas, formularios o informes y devolver campos estructurados.
- Resumen de documentacion tecnica extensa: el contexto de 128.000 tokens permite ingerir manuales o contratos completos y generar resumenes sin fragmentacion.
- Generacion de descripciones de imagenes para catalogos de producto: el modelo acepta la imagen como entrada y produce texto descriptivo, util para e-commerce o accesibilidad.
- Base para investigacion en alineamiento: al ser PT, sirve como punto de partida limpio para experimentos de SFT, DPO y evaluacion de sesgos sin la capa de instruccion del modelo oficial.
- Prototipado local en portatil o estacion de trabajo: con 4.300 millones de parametros y cuantizacion de 4 bits cabe en GPUs de consumo, lo que permite iterar sin coste de API.
- Pipeline de analisis multimodal por lotes: procesar imagenes y texto en un servidor con una unica GPU de 24 GB para clasificacion o moderacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 16-24 GB para contexto largo.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB para pesos; viable en GPUs de 8 GB con contexto moderado.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) o L40S para despliegue en una sola tarjeta; RTX 3090/4080 (16-24 GB) para inferencia en FP16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion de 4 bits; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: transformers, Text Generation Inference (el repositorio esta marcado como `endpoints_compatible` y `text-generation-inference`), vLLM, llama.cpp, Ollama y exportacion GGUF via Unsloth.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 3 4B PT (este) | 4.300 M | 128K | Si | Gemma | Checkpoint PT, base para ajuste fino |
| Gemma 3 1B PT | no disponible | 32K | Si | Gemma | Variante mas pequena, menor contexto |
| Gemma 3 12B PT | no disponible | 128K | Si | Gemma | Misma familia, mayor capacidad y coste |
| Llama 3.2 3B | no disponible | no disponible | No | Llama | Alternativa texto-only de tamano similar |

Los datos de parametros y contexto de los modelos comparables no estan confirmados en la informacion proporcionada; se indican como no disponibles cuando no constan.

## Limitaciones y advertencias

- Es un checkpoint *pre-trained*: no sigue instrucciones ni mantiene formato de chat de forma fiable sin un post-entrenamiento previo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; mayor en tareas de conocimiento factual sin verificacion.
- Sesgos potenciales derivados de los datos web de entrenamiento en mas de 140 idiomas; no se documenta una evaluacion de sesgos especifica para esta variante.
- El campo `language` del repositorio declara unicamente ingles, aunque la model card oficial de Gemma 3 indica soporte para mas de 140 idiomas; conviene validar el rendimiento real por idioma.
- La licencia Gemma impone terminos de uso de Google, con restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos antes de desplegar en produccion.
- La ventana de salida esta limitada a 8.192 tokens, independientemente del contexto de entrada de 128.000.
- El repositorio es una copia no oficial del checkpoint de Google; para produccion conviene referenciar el repositorio original `google/gemma-3-4b-pt`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/gemma-3-4b-pt
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Pagina oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico de Gemma 3: https://goo.gle/Gemma3Report
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Terminos de uso: https://ai.google.dev/gemma/terms
- Coleccion de Unsloth para Gemma 3: https://huggingface.co/collections/unsloth/gemma-3-67d12b7e8816ec6efa7e4e5b
- Guia de Unsloth para ejecutar Gemma 3: https://docs.unsloth.ai/basics/tutorial-how-to-run-gemma-3-effectively
- Blog de Unsloth sobre Gemma 3: https://unsloth.ai/blog/gemma3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
