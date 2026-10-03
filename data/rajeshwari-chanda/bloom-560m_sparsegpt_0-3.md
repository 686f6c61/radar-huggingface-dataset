# Rajeshwari-Chanda/bloom-560m_sparsegpt_0.3

## Resumen

El modelo `Rajeshwari-Chanda/bloom-560m_sparsegpt_0.3` es una version podada de BLOOM-560m, el checkpoint mas pequeno de la familia BLOOM desarrollada por BigScience. Lo publica el usuario individual Rajeshwari-Chanda en HuggingFace y no cuenta con model card propia: el README es una plantilla autogenerada por la libreria `transformers` en la que todos los campos relevantes aparecen como "[More Information Needed]". El resultado es un modelo de generacion de texto condicionado a partir de un prompt, con licencia e idiomas sin declarar.

La caracteristica que define a esta variante es la aplicacion de SparseGPT, un metodo de podado (pruning) one-shot disenado para modelos transformer de gran escala. Segun el nombre del repositorio, se ha aplicado a un 30% de sparsity (`_0.3`), lo que implica que aproximadamente un 30% de los pesos se han fijado a cero sin reentrenamiento posterior. SparseGPT, presentado en el paper arXiv:2301.00774, demuestra que es posible podar modelos de la familia GPT sin perdida apreciable de precision en tareas de generacion.

El interes de esta ficha es doble: por un lado, documentar un artefacto de investigacion sobre compresion de modelos; por otro, advertir de que se trata de un experimento aislado (0 descargas, 0 likes en el momento de la consulta) sin validacion publica de rendimiento. El modelo tiene 559.214.592 parametros y un peso de repositorio de 1,1 GB, por lo que es desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura BLOOM del modelo base bloom-560m), con podado SparseGPT a un 30% de sparsity |
| Parametros totales | 559.214.592 (~560 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base BLOOM-560m; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar; se puede cuantizar a GGUF/8-bit/4-bit, pero no esta documentado por el autor) |
| Idiomas soportados | No disponible (el modelo base BLOOM-560m cubre 46 idiomas naturales y 13 lenguajes de programacion) |
| Licencia | No disponible en el repositorio (el modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de BLOOM-560m: un transformer decoder-only con atencion causal, normalizacion pre-LayerNorm, activacion GeLU, embeddings ALiBi para la codificacion posicional (en lugar de embeddings posicionales aprendidos) y un vocabulario de 250.880 tokens. Se trata del checkpoint mas pequeno de la familia BLOOM, pensado originalmente para pruebas de escalado y para fine-tuning ligero.

Lo que diferencia a este repositorio del BLOOM-560m original es exclusivamente el proceso de podado. SparseGPT (Frantar y Alistarh, arXiv:2301.00774) es un metodo one-shot que aproxima la matriz Hessiana de la capa para decidir que pesos eliminar y recalcula el resto, de forma que la reconstruccion del error se hace capa a capa sin necesidad de reentrenar el modelo completo. El sufijo `_0.3` indica que se ha fijado el 30% de los pesos a cero. No se dispone de informacion sobre el dataset de calibracion, el numero de tokens usados en el proceso de podado, ni si hubo una fase posterior de recuperacion (fine-tuning). Tampoco hay datos sobre RLHF, DPO o cualquier tipo de alineamiento.

Un modelo hermano del mismo autor, `bloom-560m_wanda_0.9`, aplica la tecnica alternativa Wanda (pruning basado en la magnitud del peso por la activacion) a un 90% de sparsity, lo que confirma que este repositorio forma parte de una linea de experimentos de compresion sobre BLOOM-560m.

## Capacidades

- Generacion de texto autorregresiva condicionada a un prompt, capacidades limitadas por el tamano del modelo (560 M) y agravadas por la poda del 30%.
- Capacidades multilingues heredadas del modelo base BLOOM-560m (46 idiomas naturales), aunque no estan garantizadas tras el podado.
- Generacion de codigo basica, restringida al subconjunto de lenguajes que BLOOM-560m cubre de forma marginal.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision, audio ni multimodalidad.
- Compatible con `text-generation-inference` y con `endpoints_compatible` segun las etiquetas del repositorio.

## Casos de uso

- Experimentacion academica en compresion de modelos: permite comparar la calidad de generacion de la version podada al 30% frente al BLOOM-560m original para medir la degradacion inducida por SparseGPT.
- Baseline de pruning para investigacion: sirve como punto de referencia de sparsity intermedia (30%) frente a otras variantes del mismo autor con mayor poda (Wanda al 90%).
- Despliegue en hardware embebido o de gama baja: con 560 M de parametros y pesos safetensors de 1,1 GB, es viable en CPU, Raspberry Pi o GPUs integradas para tareas de generacion de texto no criticas.
- Prototipado rapido de pipelines de generacion: util para validar infraestructura (TGI, transformers) antes de sustituir el modelo por uno mayor, gracias a la compatibilidad declarada con `text-generation-inference`.
- Relleno de texto y autocompletado en entornos con presupuesto de computo minimo, siempre que no se requiera precision alta ni coherencia a largo plazo.
- Pruebas de evaluacion de robustez: al ser un modelo podado sin validacion publica, es idoneo para medir como se degrada un modelo respecto a su version original en tareas de perplejidad o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K, perplejidad u otros) y el autor no ha documentado la perdida de precision respecto al BLOOM-560m original.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, en torno a 2,2 GB; en fp16 o bf16, en torno a 1,1 GB; en int8, unos 0,56 GB; en int4, unos 0,28 GB (estimaciones a partir de los 559.214.592 parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). En A100 o H100 funciona sin problema, pero esta sobredimensionada para un modelo de 560 M.
- Compatible con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna, incluida la serie RTX 20/30/40 y las integradas Apple Silicon mediante llama.cpp.
- Opciones de despliegue: `transformers`, `text-generation-inference` (segun las etiquetas del repositorio), vLLM, llama.cpp y Ollama (previa conversion a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Poda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloom-560m_sparsegpt_0.3 | 559 M | 2048 (heredado) | SparseGPT 30% | No disponible | 0 descargas, 0 likes |
| bloom-560m (base) | 559 M | 2048 | Sin poda | BigScience BLOOM RAIL 1.0 | Ampliamente disponible en HuggingFace |
| bloom-560m_wanda_0.9 (mismo autor) | 559 M | 2048 | Wanda 90% | No disponible | Repositorio hermano, sin descargas documentadas |
| Qwen2.5-0.5B | 494 M | 32.768 | Sin poda | Apache 2.0 | Ampliamente disponible |

Los datos de la fila `bloom-560m` y `bloom-560m_wanda_0.9` proceden de la informacion disponible en HuggingFace; los de Qwen2.5-0.5B se incluyen como referencia de categoria por tamano, no como resultados de benchmark de este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el repositorio. Se heredan, en su caso, los sesgos del dataset de entrenamiento de BLOOM (ROOTS), que no han sido evaluados tras el podado.
- Riesgo de alucinacion: elevado por el reducido tamano del modelo (560 M) y por la poda del 30%, que no ha sido compensada con reentrenamiento.
- Sin validacion de rendimiento: no existen benchmarks publicados que confirmen que la poda al 30% preserva la calidad del modelo base.
- Limitaciones de contexto: ventana de 2048 tokens, adecuada solo para conversaciones y documentos cortos.
- Limitaciones de idioma: los idiomas etecnicamente cubiertos no se declaran; asumir cobertura multilingue de BLOOM-560m tras la poda es una extrapolacion no verificada.
- Restricciones de licencia: el repositorio no declara licencia. Aunque el modelo base BLOOM se publica bajo BLOOM RAIL 1.0, la ausencia de licencia explicita impide asumir derechos de uso comercial sobre esta variante podada.
- Cualquier uso en produccion requiere una evaluacion propia previa de calidad, ya que se trata de un artefacto de investigacion sin mantenimiento ni soporte.

## Enlaces

- [Repositorio en HuggingFace: Rajeshwari-Chanda/bloom-560m_sparsegpt_0.3](https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.3)
- [Modelo hermano: Rajeshwari-Chanda/bloom-560m_wanda_0.9](https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9)
- [Perfil del autor en HuggingFace](https://huggingface.co/Rajeshwari-Chanda/models)
- [Paper SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot (arXiv:2301.00774)](https://arxiv.org/abs/2301.00774)
- [Paper referenciado en las etiquetas: Lacoste et al. (2019), arXiv:1910.09700](https://arxiv.org/abs/1910.09700)
