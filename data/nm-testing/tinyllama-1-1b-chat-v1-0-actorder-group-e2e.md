# nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-group-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-group-e2e` es un artefacto de pruebas publicado por la organizacion `nm-testing` (entorno de validacion de Neural Magic, autores de herramientas como `llm-compressor` y del formato `compressed-tensors`). No se trata de un modelo entrenado desde cero, sino de una version derivada de TinyLlama-1.1B-Chat v1.0 sometida a un pipeline de compresion/cuantizacion con agrupacion por orden de activaciones (`actorder-group`), orientado a validar el flujo end-to-end de ese formato de pesos comprimidos.

El modelo base TinyLlama-1.1B-Chat es un transformer decoder-only tipo Llama con 1.100.048.384 parametros, entrenado por la comunidad TinyLlama sobre aproximadamente 3 billones de tokens y ajustado con SFT/DPO para uso conversacional. Esta variante conserva esa arquitectura y ese tamano, pero redistribuye los pesos en un esquema de cuantizacion con grupos y orden de activaciones, empaquetado en `safetensors` bajo el formato `compressed-tensors`.

Su relevancia es fundamentalmente tecnica: sirve como referencia reproducible para ingenieros que implementan o depuran pipelines de cuantizacion (por ejemplo, con `llm-compressor` o vLLM) y necesitan un checkpoint pequeno, rapido de cargar y con estructura de grupos de cuantizacion verificable. No esta pensado como modelo de produccion ni como referencia de calidad conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (derivado de TinyLlama-1.1B-Chat v1.0) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama soporta 2048 tokens) |
| Tipos de cuantizacion | pesos en formato `compressed-tensors` con agrupacion por orden de activaciones (`actorder-group`); esquema exacto (bits, tamano de grupo, simetrico/asimetrico) no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos `compressed-tensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat v1.0: un transformer decoder-only con atencion causal multi-cabeza, normalizacion RMSNorm, activacion SwiGLU, RoPE para codificacion posicional y 22 capas con dimension oculta de 2048. El modelo base fue preentrenado sobre aproximadamente 3 billones de tokens (mezcla de SlimPajama y otros corpus) y posteriormente alineado con SFT y DPO para conversacion.

Sobre ese checkpoint, esta variante aplica un pipeline de cuantizacion post-entrenamiento con `compressed-tensors`. La innovacion concreta es el uso de `actorder-group`: los canales se reordenan segun la magnitud de las activaciones observadas en un conjunto de calibracion antes de agrupar y cuantizar, de modo que los valores con mayor impacto se agrupan de forma mas homogenea y se reduce el error de redondeo. El sufijo `e2e` indica que el artefacto se genero como prueba de extremo a extremo del flujo de compresion, no como release publico. No se dispone de informacion sobre el dataset de calibracion, el numero de muestras ni los hiperparametros exactos de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste SFT/DPO de TinyLlama-1.1B-Chat.
- Razonamiento basico y respuesta a instrucciones en formato chat (plantilla de conversacion de Llama 2).
- Generacion de codigo sencillo y resolucion de problemas matematicos elementales, limitada por el tamano del modelo.
- Inferencia con pesos cuantizados mediante el formato `compressed-tensors`, compatible con runtimes que lo soporten (vLLM, `llm-compressor`).
- Soporte de tool calling: no disponible de forma nativa en el modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma fiable a este tamano.
- Capacidades multilingues: no documentadas en esta variante.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Validacion de pipelines de cuantizacion: usar el checkpoint como entrada de prueba para verificar que un compresor o runtime lee correctamente los metadatos `compressed-tensors` con `actorder-group` y produce salidas coherentes.
- Test de integracion en vLLM: cargar el modelo en un servidor vLLM para comprobar la compatibilidad del kernel de cuantizacion con grupos y el orden de activaciones antes de aplicar el mismo esquema a modelos mayores.
- Benchmarking de latencia en hardware modesto: al ocupar poco mas de 1.100 millones de parametros, permite medir throughput y latencia de kernels cuantizados en GPUs de gama consumer sin agotar VRAM.
- Depuracion de errores de calibracion: comparar la perplejidad de esta variante con la del modelo base sin cuantizar para aislar el impacto del reordenamiento por activaciones.
- Pruebas de regresion en CI: incluir el checkpoint en una suite automatizada que verifique que las actualizaciones de la libreria de compresion no rompen la carga ni la generacion.
- Docencia y prototipado: servir como ejemplo minimo y reproducible de un modelo Llama cuantizado para explicar el formato `compressed-tensors` en talleres o articulos tecnicos.
- Evaluacion de plantillas de chat: probar la plantilla conversacional de Llama 2 en un checkpoint pequeno antes de desplegarla en modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1.100 millones de parametros, en FP16 requiere aproximadamente 2,2 GB solo para pesos; con cuantizacion de 8 bits baja a unos 1,1 GB y con 4 bits a unos 0,6 GB, mas overhead de activaciones y cache KV (el esquema exacto de esta variante no esta documentado).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son validas. Cabe en GPUs integradas y en CPU con llama.cpp si se dispone de una conversion a GGUF.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors`), `llm-compressor` para recompresion, TGI si el formato esta soportado por la version desplegada. llama.cpp y Ollama requieren conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un modelo de 1.1B en una RTX 4090 puede superar varios cientos de tokens por segundo en batch 1, pero no se han publicado mediciones para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-group-e2e | 1,1 B | no disponible | no disponible | safetensors + compressed-tensors | Artefacto de prueba de cuantizacion |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2048 tokens | Apache 2.0 | safetensors | Modelo base sin cuantizar, referencia de calidad |
| nm-testing/TinyLlama-1.1B-Chat-v1.0-NVFP4-e2e | 1,1 B | no disponible | no disponible | safetensors + compressed-tensors | Variante de prueba con cuantizacion NVFP4 |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa moderna con contexto mucho mayor y mejor rendimiento |

## Limitaciones y advertencias

- El modelo es un artefacto de pruebas de la organizacion `nm-testing`, no un release estable; su comportamiento puede cambiar o desaparecer sin aviso.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido. El modelo base TinyLlama es Apache 2.0, pero esta variante no lo explicita.
- Al ser un modelo de 1,1B parametros, la calidad conversacional, el razonamiento y la generacion de codigo son limitados en comparacion con modelos de 7B o superiores.
- La cuantizacion introduce degradacion adicional de calidad respecto al modelo base; el impacto exacto no esta documentado.
- Riesgo elevado de alucinacion en preguntas factuales, heredado del modelo base y agravado por el tamano reducido.
- Idiomas soportados no documentados; el modelo base esta predominantemente entrenado en ingles y su rendimiento en castellano es limitado.
- Contexto efectivo no documentado en esta variante; el modelo base esta limitado a 2048 tokens.
- No dispone de soporte nativo de tool calling ni de modo de razonamiento extendido.
- El repositorio ocupa 6,1 GB, lo que sugiere que puede contener multiples checkpoints o pesos sin comprimir ademas de los cuantizados; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-actorder-group-e2e
- Variante NVFP4 relacionada: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-NVFP4-e2e
- Modelo base TinyLlama-1.1B-Chat v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper de referencia (attention is all you need, citado en la model card): https://arxiv.org/abs/1910.09700
