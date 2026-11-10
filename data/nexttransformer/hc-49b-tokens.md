# NextTransformer/HC-49B-Tokens

## Resumen

NextTransformer HC es un checkpoint de lenguaje causal de tipo pretrained publicado por NextTransformer como parte de una comparativa de arquitecturas dentro del proyecto NextTransformer, orientada a evaluar variantes estructurales sobre un mismo presupuesto de entrenamiento. El modelo tiene 1.356.235.700 parametros y una ventana de contexto de 2.048 tokens, y se entreno sobre el dataset ClimbMix durante 46.875 actualizaciones, lo que corresponde a los 49.152 millones de tokens que dan nombre al repositorio (el "49B" hace referencia a tokens de entrenamiento, no a parametros). Su rasgo distintivo es el uso de cuatro flujos residuales ("HC", probablemente *hyper-connections* o *highway connections*) por los que cada subcapa lee y escribe mediante conexiones aprendidas, en lugar del flujo residual unico convencional.

El modelo es relevante no por su rendimiento absoluto, sino por su valor como pieza de investigacion reproducible: se publican pesos en safetensors, la configuracion de arquitectura y el registro de la ejecucion, junto con una implementacion especifica (`nexttransformer`) que hay que instalar desde un commit concreto de GitHub para cargar los pesos con `strict=True`. No es un modelo pensado para produccion ni para uso general, sino un artefacto de ablation study.

Las cifras finales reportadas por el autor son Validation BPB de 0,6644 y CORE-22 de 35,09 (escala x100). No hay informacion sobre licencia, idiomas soportados ni datos de benchmarks estandar (MMLU, HumanEval, GSM8K), y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cuatro flujos residuales y conexiones aprendidas entre subcapas (NextTransformer HC) |
| Parametros totales | 1.356.235.700 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `model_config.json` y `tokenizer.tiktoken.json` |
| Tokenizador | tiktoken (BPE con `pat_str` y `mergeable_ranks` serializados en JSON) |
| Tamano del repositorio | 4,1 GB |
| Entrenamiento | 49.152 millones de tokens sobre ClimbMix, 46.875 actualizaciones |
| Framework | PyTorch (libreria `nexttransformer`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con una modificacion estructural central: en lugar de un unico flujo residual que suma la salida de cada subcapa a la representacion principal, el modelo mantiene cuatro flujos residuales paralelos, y cada subcapa lee de ellos y escribe en ellos a traves de conexiones aprendidas. Esto se alinea con la familia de tecnicas de *hyper-connections* / *highway connections*, que generalizan el residual estandar y permiten al modelo aprender como combinar y enrutar informacion entre profundidades. La implementacion incluye un metodo `set_step` que sugiere algun tipo de parametrizacion dependiente del paso de entrenamiento (posiblemente schedule o embeddings de paso), aunque la model card no lo detalla.

El entrenamiento se realizo sobre ClimbMix durante 46.875 actualizaciones, totalizando 49.152 millones de tokens, con un contexto fijo de 2.048 tokens. No se documenta en la informacion disponible si hubo fases de RLHF, DPO, SFT o ajuste por instrucciones; las etiquetas del repo (`pretrained`, `causal-lm`) indican que se trata de un modelo base sin alineamiento. Tampoco se especifica la composicion del dataset, el ratio de tokens por parametro mas alla del calculo directo (aproximadamente 36 tokens por parametro), ni detalles de precision mixta, optimizer o hardware de entrenamiento.

La evaluacion reportada es interna al proyecto: Validation BPB (bits per byte) de 0,6644 y CORE-22 de 35,09 sobre 100. CORE-22 es un agregado de tareas de conocimiento y razonamiento; un valor de 35,09 sobre 100 es coherente con un modelo base de ~1,3B entrenado con ~49B tokens, lejos de los modelos alineados de ese tamano.

## Capacidades

- Generacion de texto autoregresiva como modelo causal de lenguaje base.
- Modelado de siguiente token; la model card solo demuestra la prediccion del token mas probable tras un prompt.
- Razonamiento y conocimiento factual limitados al haberse entrenado unicamente como pretrained, sin SFT ni RLHF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- No se documenta modo "thinking", vision, audio ni ninguna modalidad adicional.
- Tokenizador tiktoken integrado, lo que facilita la integracion con pipelines que ya usan esa libreria.

## Casos de uso

- Investigacion en arquitecturas residuales: el caso de uso principal es reproducir y comparar la variante HC frente a otras variantes del proyecto NextTransformer sobre el mismo presupuesto de tokens, usando los pesos y el `run record` publicados.
- Ablation studies controlados: al estar entrenado sobre ClimbMix con 46.875 actualizaciones fijas, sirve como punto de referencia reproducible para medir el efecto de cambiar el mecanismo residual.
- Analisis de BPB y CORE-22: util para validar pipelines de evaluacion propios contra las cifras reportadas (0,6644 y 35,09) y detectar discrepancias de implementacion.
- Prototipado de tecnicas de conexiones aprendidas: el codigo de `nexttransformer` permite aislar el bloque de flujos residuales e injertarlo en otras arquitecturas de investigacion.
- Docencia y divulgacion: modelo de ~1,3B parametros que cabe en una GPU de consumo y permite explicar variantes de residual connections con un ejemplo ejecutable y pesos publicos.
- Baseline para modelos pequenos en castellano o dominios concretos: solo si se parte de un fine-tuning posterior, ya que el checkpoint base no esta alineado ni evaluado en esos idiomas.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Validation BPB | 0,6644 |
| CORE-22 (x100) | 35,09 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible, ni comparaciones numericas con otros modelos del mismo proyecto mas alla de la referencia a la comparativa de arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 5,4 GB solo para pesos (1,356B x 4 bytes), mas activaciones y cache KV; en bf16/fp16, unos 2,7 GB.
- GPU recomendadas para investigacion: A100, H100 o L40S si se quiere entrenar o hacer fine-tuning; para inferencia, cualquier GPU con al menos 8 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, incluso en fp32 con margen.
- Opciones de despliegue: la unica via documentada es la implementacion `nexttransformer` desde el commit indicado mas `safetensors` y `tiktoken`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NextTransformer HC | 1,356B | 2.048 | no disponible | Pesos en HF, requiere `nexttransformer` | Variante con 4 flujos residuales; BPB 0,6644, CORE-22 35,09 |
| Otros checkpoints de la comparativa NextTransformer | no disponible | no disponible | no disponible | Referenciados en el repo del proyecto | Misma metodologia y dataset; cifras no incluidas en la informacion |
| Modelos base ~1,3B de proposito general (p. ej. familia Llama, Qwen, Gemma) | ~1-1,5B | 2.048-32.768+ | licencias permisivas en la mayoria | Amplia, con soporte en vLLM/llama.cpp/Ollama | No comparables numericamente aqui por falta de datos; suelen incluir SFT y benchmarks publicos |

No se dispone de datos suficientes para una comparacion numerica rigurosa con alternativas de la misma categoria; la comparativa anterior es cualitativa y se limita a lo que consta en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente pretrained: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o repetitivas.
- Ventana de contexto muy corta (2.048 tokens) para estandares actuales; no apto para tareas de contexto largo.
- Riesgo elevado de alucinacion y de contenido factual incorrecto, agravado por el bajo CORE-22 (35,09) y por la ausencia de alineamiento.
- Sesgos desconocidos: no se documenta composicion de ClimbMix ni filtrado, por lo que no se pueden caracterizar sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun idioma concreto.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de una implementacion no estandar: cargar los pesos exige el paquete `nexttransformer` en un commit concreto y `strict=True`, lo que limita la portabilidad y el soporte en herramientas de inferencia habituales.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni integracion en runtimes optimizados; el rendimiento en produccion no esta caracterizado.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validacion independiente de las cifras reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/HC-49B-Tokens
- Repositorio del proyecto: https://github.com/Interactive-Active-AI/NextTransformer
- Configuracion de arquitectura HC: https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/methods/hc.json
- Registro de la ejecucion: https://github.com/Interactive-Active-AI/NextTransformer/blob/2358425b56ce6a320fc042f67fd0a32294b5e0d7/results/runs/hc.json
