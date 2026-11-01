# PruningEverything/llama_3_20_percent_compression

## Resumen

`llama_3_20_percent_compression` es un checkpoint derivado de la familia Llama 3 publicado por el usuario PruningEverything en HuggingFace. El nombre indica que se trata de una version podada (pruning) del modelo original con una reduccion de aproximadamente el 20 % de sus parametros. El repositorio contiene pesos en formato safetensors con 6.285.365.248 parametros totales, lo que situa al modelo en la horquilla de los 6-7 mil millones de parametros, coherente con un Llama 3 8B comprimido.

La model card publicada es practicamente vacia: solo declara la licencia `llama3`. No se documenta el proceso de poda, el dataset de calibracion, la receta de recuperacion (fine-tuning posterior) ni los resultados de evaluacion. Esto convierte al modelo en un artefacto experimental sin garantias de calidad, util principalmente para quien quiera inspeccionar o reproducir tecnicas de compresion sobre Llama 3.

Su relevancia es limitada pero concreta: sirve como referencia practica de cuanto se puede reducir un Llama 3 8B manteniendo (o no) capacidades, y como objeto de estudio para pipelines de pruning estructurado o semi-estructurado aplicados a modelos abiertos con licencia Llama 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3, segun tags y nombre) |
| Parametros totales | 6.285.365.248 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (heredada de Llama 3, valor no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3, con 6.285.365.248 parametros totales segun los metadatos de safetensors. El sufijo "20_percent_compression" sugiere una poda del 20 % respecto al checkpoint base, presumiblemente Llama 3 8B (8.030 millones de parametros), lo que cuadraria con el recuento observado. No se especifica si la poda es estructurada (eliminacion de cabezas de atencion, neuronas FFN o capas completas) o no estructurada (mascaras de pesos dispersas), ni si hubo una fase de recuperacion mediante fine-tuning.

No hay informacion sobre el dataset de calibracion, el numero de tokens de recuperacion, el uso de RLHF/DPO o cualquier innovacion tecnica adicional. La model card no incluye hiperparametros, curvas de perdida ni comparaciones con el modelo base. Cualquier afirmacion sobre la calidad del checkpoint tras la poda carece de respaldo documental en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Llama 3, aunque el impacto de la poda sobre la calidad no esta documentado.
- Razonamiento y conocimiento general: presumiblemente conserva parte de las capacidades del modelo base, sin metricas que lo confirmen.
- Generacion de codigo y matematicas: no verificado tras la compresion.
- Tool calling / function calling: no documentado; Llama 3 base soporta plantillas de chat, pero no se confirma que este checkpoint las preserve correctamente.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre pruning: usar el checkpoint para analizar como afecta una reduccion del 20 % de parametros a las activaciones, la perplejidad y las representaciones internas frente a Llama 3 8B.
- Reproduccion de pipelines de compresion: servir como referencia para comparar tecnicas de poda estructurada y no estructurada sobre un mismo modelo base.
- Despliegue en entornos con VRAM limitada: con ~6,3 mil millones de parametros, el modelo en fp16 ocupa unos 12,6 GB, lo que permite ejecutarlo en GPUs de 16 GB si la calidad resulta aceptable.
- Prototipado rapido de aplicaciones de chat: valido para pruebas de concepto donde la fidelidad del texto no sea critica y se priorice el coste de inferencia.
- Benchmarking de herramientas de cuantizacion: convertir los pesos safetensors a GGUF y medir la degradacion adicional sobre un modelo ya podado.
- Educacion y docencia: ejemplo practico de las limitaciones de publicar checkpoints comprimidos sin evaluacion asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 12,6 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en int8: aproximadamente 6,3 GB; en int4, aproximadamente 3,2 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPUs recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con contexto moderado.
- Cabe en GPUs de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion int4, en GPUs de 8 GB como RTX 3070.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF; transformers con safetensors de forma nativa.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PruningEverything/llama_3_20_percent_compression | 6,29 B | no disponible | llama3 | HuggingFace | Poda del 20 % sin evaluacion publicada |
| meta-llama/Meta-Llama-3-8B | 8,03 B | 8.192 tokens (oficial) | llama3 | HuggingFace | Modelo base de referencia |
| meta-llama/Meta-Llama-3.1-8B | 8,03 B | 128.000 tokens (oficial) | llama3.1 | HuggingFace | Sucesor con contexto extendido |
| mistralai/Mistral-7B-v0.3 | 7,25 B | 32.000 tokens (oficial) | Apache 2.0 | HuggingFace | Alternativa abierta de tamano similar |

La comparativa de rendimiento no esta disponible: el checkpoint podado no publica metricas, por lo que no es posible contrastar su calidad frente a Llama 3 8B, Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, curvas de perdida ni comparaciones con el modelo base, por lo que se desconoce la degradacion real causada por la poda.
- Model card vacia: no se documenta el metodo de poda, el dataset de calibracion ni si hubo fine-tuning de recuperacion.
- Riesgo elevado de alucinacion y degradacion gramatical: la poda sin recuperacion suele afectar a capas criticas y producir salidas incoherentes, especialmente en tareas de razonamiento y codigo.
- Idiomas no declarados: no se puede asumir el soporte multilingue de Llama 3 sin verificacion.
- Licencia Llama 3: uso comercial permitido bajo los terminos de Meta, con obligaciones de atribucion y restricciones de uso (por ejemplo, no entrenar modelos competidores con las salidas).
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion atipica (2026-11-01): conviene verificar la integridad de los pesos antes de usarlos en produccion.
- No apto para produccion sin una evaluacion interna previa que confirme perplejidad, calidad de generacion y comportamiento en tareas objetivo.

## Enlaces

- [HuggingFace: PruningEverything/llama_3_20_percent_compression](https://huggingface.co/PruningEverything/llama_3_20_percent_compression)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
