# ben072292/Qwen3.5-4B-Base-AIME26-math-v1

## Resumen
`ben072292/Qwen3.5-4B-Base-AIME26-math-v1` es un ajuste fino completo (full fine-tuning) del modelo base `Qwen/Qwen3.5-4B-Base`, publicado por el usuario ben072292. El entrenamiento se ha realizado con LLaMA-Factory sobre un dataset denominado `math_dpo` mediante DPO (Direct Preference Optimization), con el objetivo declarado de mejorar el comportamiento del modelo en tareas de matematicas (el sufijo "AIME26" apunta a problemas tipo AIME). El nombre del run de entrenamiento, `dpo-full-conservative-lr1e7-ga8-wd0-beta01-delta-gh200-1ep-2048-20260916`, resume la receta: DPO completo, learning rate 1e-7, gradient accumulation 8, weight decay 0, beta 0.1, una epoca y secuencia de 2048, entrenado sobre GH200.

El repositorio tiene 4.539.265.536 parametros reales en safetensors (aproximadamente 4,54 B) y ocupa 9,1 GB, lo que corresponde a pesos en precision de 16 bits. La model card es la generada automaticamente por el Trainer de HuggingFace y no aporta descripcion del modelo, datos de evaluacion ni resultados, por lo que gran parte de las especificaciones (contexto, idiomas, cuantizaciones, arquitectura detallada) no estan documentadas.

Su relevancia es limitada pero concreta: es un ejemplo de pipeline de alineamiento DPO a escala 4B con receta conservadora (learning rate muy bajo y una sola epoca) sobre un modelo base multimodal del linaje Qwen3.5. Resulta util como referencia reproducible de hiperparametros y como punto de partida para experimentos de matematicas, no como modelo listo para produccion: no tiene descargas ni likes, y no se han publicado benchmarks.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta `qwen3_5` y pipeline `image-text-to-text`, compatible con transformers |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B), segun safetensors |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors en 16 bits. No se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | `other` (licencia personalizada; el modelo base es `Qwen/Qwen3.5-4B-Base`) |
| Formato de pesos | safetensors (9,1 GB de repositorio) |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-4B-Base` y se ajusta mediante DPO, no mediante SFT previo documentado ni RLHF con reward model explicito. El entrenamiento fue "full", es decir, se actualizaron todos los parametros (no LoRA ni QLoRA), ejecutado en configuracion multi-GPU sobre hardware GH200 segun el identificador del run. Los hiperparametros registrados por el Trainer son: learning rate 1e-7 con scheduler constante, train_batch_size 1, gradient_accumulation_steps 8 (batch total efectivo de 8), weight decay 0, beta 0.1, una epoca, seed 42 y optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8. El identificador anade el sufijo `delta`, que sugiere una variante de DPO con termino delta, aunque no se documenta su implementacion.

El dataset de preferencias se denomina `math_dpo` y no se especifica su composicion, tamano, procedencia de los pares elegido/rechazado ni si hubo filtrado por verificacion de respuestas. Tampoco se documenta la estrategia de evaluacion ni un conjunto de validacion con resultados. El entorno de entrenamiento declarado es Transformers 5.6.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicito) en la informacion disponible.

## Capacidades
- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo se distribuye con plantilla de chat y puede mantener dialogos multi-turno, aunque no se documenta el formato exacto de prompt.
- Razonamiento matematico: el entrenamiento con DPO sobre `math_dpo` y el sufijo `AIME26` apuntan a resolucion de problemas de competicion, sin resultados publicados que lo confirmen.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que heredaria capacidad multimodal del modelo base, no verificada ni documentada en la ficha.
- Tool calling y function calling: no disponible (no se menciona soporte de herramientas).
- Agentes y razonamiento multi-paso: no disponible (no se documenta modo de pensamiento ni planificacion explicita).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en Inference Endpoints de HuggingFace.
- Capacidad especial de "thinking mode": no disponible.

## Casos de uso
- Generacion de problemas y soluciones de matematicas para plataformas educativas: el modelo puede redactar enunciados estilo competicion y su resolucion paso a paso, aprovechando el ajuste DPO sobre datos matematicos, aunque requiere validacion automatica de las respuestas antes de publicarlas.
- Investigacion en alineamiento DPO: sirve como punto de comparacion reproducible de una receta concreta (lr 1e-7, beta 0.1, 1 epoca, batch efectivo 8) frente a variantes SFT o PPO sobre el mismo base de 4,5 B.
- Asistente de resolucion de dudas en aula o tutoria: con la plantilla conversacional, puede mantener un dialogo donde el alumno propone un paso y el modelo lo corrige, siempre con supervision humana dado el riesgo de alucinacion en pasos algebraicos.
- Prototipado local en estaciones de trabajo con una sola GPU: al ocupar 9,1 GB en 16 bits, cabe en GPUs de 16-24 GB, lo que permite experimentar con fine-tunes adicionales o evaluaciones sin infraestructura de cluster.
- Extraccion y normalizacion de expresiones matematicas en documentos: integrado en un pipeline de ingesta, puede reformular enunciados y expresiones a LaTeX o formato estructurado, con verificacion posterior mediante un CAS (por ejemplo, SymPy).
- Base para un modelo especializado en un dominio cientifico concreto: al ser un fine-tune de codigo abierto sobre un base de 4,5 B, admite nuevos ajustes con LoRA para fisica, quimica o estadistica partiendo de pesos ya alineados hacia respuestas matematicas.
- Evaluacion de tecnicas de DPO en modelos multimodales pequenos: permite medir si el alineamiento de preferencias degrada o preserva las capacidades de vision heredadas del base, un experimento relevante para el diseno de pipelines multimodales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara el run de entrenamiento `dpo-full-conservative-lr1e7-ga8-wd0-beta01-delta-gh200-1ep-2048-20260916` con una lista de resultados vacia.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No declarado en la model card |
| GSM8K | No disponible | No declarado en la model card |
| MATH | No disponible | No declarado en la model card |
| AIME | No disponible | El nombre del modelo sugiere evaluacion tipo AIME, pero no hay resultados publicados |
| HumanEval | No disponible | No declarado en la model card |

## Requisitos de hardware
- VRAM para inferencia en 16 bits (bf16/fp16): aproximadamente 9,1 GB solo de pesos, mas cache KV. Con contexto de 2048-8192 tokens en un modelo de 4,5 B, la cache anade del orden de 1 a 3 GB segun lote y longitud; se recomienda reservar 12-14 GB.
- Cuantizacion a 8 bits: aproximadamente 4,6 GB de pesos, viable en GPUs de 8-10 GB con contexto corto.
- Cuantizacion a 4 bits: aproximadamente 2,5-3 GB de pesos, viable en GPUs consumer de 6-8 GB, siempre que se genere la version GGUF o AWQ, que no esta publicada en el repositorio.
- GPUs recomendadas: NVIDIA A100 40/80 GB, H100 o GH200 para entrenamiento o lotes grandes; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) son suficientes para inferencia en 16 bits.
- Cabe en GPU consumer: si, en RTX 4090, 3090 y 4080 en 16 bits; en RTX 4060 Ti 8 GB o similares solo con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servido en 16 bits, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), llama.cpp u Ollama tras convertir los pesos a GGUF (no hay GGUF publicado), y LLaMA-Factory para reentrenamiento o merge de adaptadores.
- Latencia y throughput: no disponible; no se han publicado mediciones. Cualquier cifra seria una extrapolacion no verificada a partir del tamano.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ben072292/Qwen3.5-4B-Base-AIME26-math-v1` | 4,54 B | No disponible | Sin benchmarks publicados | `other` | HuggingFace, safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B-Base` (modelo base) | 4,54 B aprox. | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros fine-tunes matematicos de ~4-8 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks, contexto o licencia de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable frente a otros modelos matematicos de tamano similar.

## Limitaciones y advertencias
- Ausencia total de evaluacion: no hay resultados de benchmarks ni conjunto de validacion documentado, por lo que no puede afirmarse que el ajuste DPO haya mejorado el rendimiento respecto al modelo base. Un DPO con learning rate 1e-7 y una epoca puede producir cambios minimos o, si los datos de preferencias son ruidosos, degradar capacidades.
- Model card incompleta: los campos "Model description", "Intended uses & limitations" y "Training and evaluation data" estan sin rellenar ("More information needed").
- Riesgo de alucinacion en matematicas: los modelos de este tamano pueden generar pasos intermedios plausibles pero incorrectos y llegar a una respuesta final erronea con alta confianza; en problemas tipo AIME, un solo error aritmetico invalida el resultado.
- Contexto e idiomas desconocidos: no se declara la ventana de contexto ni la cobertura linguistica, lo que impide garantizar un comportamiento correcto fuera del ingles o en conversaciones largas.
- Licencia `other`: se trata de una licencia personalizada que hereda las condiciones del modelo base. Antes de cualquier uso comercial es obligatorio revisar los terminos de `Qwen/Qwen3.5-4B-Base`; la etiqueta `other` no garantiza permisos de uso comercial.
- Sin datos de sesgo ni de seguridad: no se documenta filtrado de contenido, evaluacion de sesgos ni alineamiento de seguridad, mas alla del objetivo matematico.
- Trazabilidad limitada: el autor no publica el dataset `math_dpo`, los pares de preferencia ni la variante exacta de DPO ("delta", beta 0.1), lo que dificulta reproducir el entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior (unica actualizacion un minuto despues de la creacion).
- Idiomas no declarados: no puede asumirse un buen rendimiento en castellano sin evaluacion previa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ben072292/Qwen3.5-4B-Base-AIME26-math-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- LLaMA-Factory (framework de entrenamiento indicado en las etiquetas): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- Nota sobre la busqueda web: los resultados devueltos corresponden a despachos de abogados especializados en danos materiales en Luisiana (EE. UU.) y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
