# DunkRonit/anlp-a2-part2-lion

## Resumen

DunkRonit/anlp-a2-part2-lion es un transformer decoder-only denso de 17.011.584 parámetros entrenado desde cero sobre el corpus browndw/human-ai-parallel-corpus (una única pasada por el split de entrenamiento, 41.680.896 tokens). No es un modelo de propósito general ni un producto: es el artefacto de un trabajo académico de la asignatura ANLP (el autor publica bajo el usuario de Weights & Biases dunkronit-iiit-hyderabad), cuyo objetivo declarado es comparar optimizadores implementados desde cero. En concreto, este checkpoint corresponde a la variante entrenada con un optimizador Lion también implementado desde cero.

Su relevancia es, por tanto, metodológica y no de rendimiento: sirve como referencia reproducible para estudiar el comportamiento de Lion frente a alternativas como AdamW en un régimen de cómputo muy reducido, y como ejemplo mínimo de pipeline completo (tokenización, preentrenamiento, publicación de pesos en safetensors). Con 41,7 millones de tokens vistos y 17 millones de parámetros, el modelo está muy por debajo del punto óptimo de Chinchilla (que para este tamaño estaría en torno a 340 millones de tokens), por lo que cabe esperar una calidad de generación limitada incluso dentro del dominio del corpus.

La model card no documenta longitud de contexto, licencia, tokenizador ni resultados de evaluación, y el checkpoint se carga mediante una clase propia del repositorio de la asignatura (`src.part2.model.Transformer.from_pretrained`), no mediante las clases estándar de `transformers`. Todo ello condiciona su uso práctico: es un modelo para experimentación e investigación, no para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (según la model card: "Dense decoder-only transformer") |
| Parametros totales | 17.011.584 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados; solo safetensors en precisión nativa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokens de entrenamiento | 41.680.896 (1 pasada sobre el split de entrenamiento) |
| Optimizador | Lion, implementado desde cero |
| Dataset | browndw/human-ai-parallel-corpus (split de entrenamiento) |
| Tamaño del repositorio | 0,1 GB |
| Carga | `src.part2.model.Transformer.from_pretrained("DunkRonit/anlp-a2-part2-lion")` (código propio del repositorio de la asignatura) |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer decoder-only denso, es decir, sin mezcla de expertos ni componentes de estado recurrente: atención estándar más bloques feed-forward apilados, con enmascaramiento causal y generación autorregresiva. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención, la función de activación, si se usa RMSNorm o LayerNorm, ni si se emplea atención con sesgo relativo o RoPE. Tampoco se documenta el tokenizador ni el tamaño del vocabulario, aunque el recuento de 17.011.584 parámetros es coherente con un modelo de escala "nano" (del orden de decenas de millones de parámetros, comparable a los modelos de juguete usados en ejercicios de preentrenamiento).

El entrenamiento es deliberadamente sencillo y reproducible: una sola pasada (1x) sobre el split de entrenamiento de browndw/human-ai-parallel-corpus, con un total de 41.680.896 tokens procesados. El elemento diferencial del experimento es el optimizador: se implementa Lion desde cero y se usa para preentrenar este checkpoint, presumiblemente como una de las variantes de un estudio comparativo de optimizadores dentro de la asignatura. No se menciona ningún tipo de ajuste posterior: no hay RLHF, DPO, SFT ni instrucciones; se trata de un modelo base. El autor enlaza la ejecución de Weights & Biases con las curvas de entrenamiento, que es el único punto de trazabilidad del proceso más allá del propio checkpoint.

## Capacidades

- Generación de texto autorregresiva en inglés, condicionada por un prefijo de entrada, a nivel de modelo base preentrenado.
- Modelado de lenguaje dentro del dominio del corpus de entrenamiento; la model card no describe ninguna especialización temática adicional.
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles.
- Fine-tuning posterior: factible técnicamente por tratarse de un modelo pequeño, pero no documentado ni validado por el autor.

Conviene subrayar que la lista anterior describe lo que el modelo *puede* hacer por construcción (modelado de lenguaje), no capacidades verificadas experimentalmente: no se han publicado evaluaciones que respalden ninguna de ellas.

## Casos de uso

- Reproducción de experimentos con optimizadores: el caso de uso principal es reproducir la comparación entre Lion y otros optimizadores (AdamW, SGD) bajo exactamente la misma configuración de datos y arquitectura. El checkpoint publicado actúa como referencia de la variante Lion y permite verificar las curvas de pérdida frente a la ejecución de Weights & Biases enlazada por el autor.
- Estudio de dinámicas de entrenamiento en modelos pequeños: con 17 millones de parámetros y 41,7 millones de tokens, el modelo permite analizar fenómenos como el sobreajuste temprano o la evolución de las normas de los gradientes en un régimen de cómputo que se cierra en una sola GPU de consumo.
- Prueba de humo (smoke test) de pipelines de datos: sirve para validar de extremo a extremo una cadena de tokenización, empaquetado de secuencias, enmascarado causal y bucle de entrenamiento antes de escalarla a modelos de mayor tamaño, ya que un fallo en el pipeline se detecta en minutos en lugar de horas.
- Material docente en cursos de NLP: al ser un transformer completo y de tamaño manejable, permite inspeccionar pesos, mapas de atención y embeddings en un cuaderno interactivo, algo inviable con modelos de miles de millones de parámetros.
- Comparación de implementaciones de una misma arquitectura: sirve como punto de control para comprobar si dos implementaciones independientes del mismo transformer producen pérdidas equivalentes sobre el mismo corpus y el mismo número de tokens.
- Base para experimentos de compresión: dado su tamaño (34 MB en fp16), es un candidato adecuado para probar cuantización agresiva, poda estructurada o destilación hacia modelos aún más pequeños, midiendo la degradación de la perplejidad dentro del corpus.
- Evaluación de infraestructura de inferencia: permite medir latencia y throughput de frameworks (PyTorch eager, TorchScript, ONNX Runtime) en hardware muy modesto, aislando el coste del runtime del coste del propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y únicamente referencia las curvas de entrenamiento en Weights & Biases. No se ofrecen tampoco comparaciones cuantitativas con las otras variantes del experimento (por ejemplo, las entrenadas con AdamW), por lo que no es posible afirmar qué aporta Lion en este caso concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de parámetros; no publicado por el autor): aproximadamente 68 MB en fp32, 34 MB en fp16/bf16 y 17 MB en int8, más el *overhead* del runtime y la caché KV, que en la práctica sitúan el consumo total por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente; no se necesita ni A100 ni H100. Una GTX 1050 Ti, una MX150 o una iGPU moderna bastan para inferencia.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en la mayoría de las de generaciones anteriores. También es viable en CPU (inferencia en CPU perfectamente práctica para este tamaño) y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: el checkpoint está pensado para cargarse con el código propio del repositorio de la asignatura (`src.part2.model.Transformer.from_pretrained`), no con `AutoModelForCausalLM` de `transformers` salvo que el autor haya publicado una configuración compatible, cosa que no se indica. Para usarlo con vLLM, llama.cpp, Ollama o TGI habría que exportar previamente los pesos a un formato soportado (GGUF, por ejemplo) y reimplementar la arquitectura; no se publican artefactos de ese tipo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part2-lion | 17.011.584 | no disponible | sin benchmarks publicados | no disponible | HuggingFace, requiere código propio |
| GPT-2 small (referencia de la misma escala cualitativa) | 124 millones | 1.024 tokens | benchmarks públicos ampliamente citados | licencia MIT modificada | integrado en `transformers` |
| Modelos tipo TinyStories (~33 millones de parámetros) | ~33 millones | no disponible en esta ficha | benchmarks públicos en su model card | no disponible en esta ficha | HuggingFace, cargables con `transformers` |

La comparación es necesariamente desigual: los dos modelos de referencia son checkpoints con documentación completa y evaluación publicada, mientras que el modelo analizado es un artefacto académico sin métricas. En términos de tamaño, el modelo de DunkRonit es aproximadamente 7 veces más pequeño que GPT-2 small. No se dispone de datos que permitan comparar calidad de generación entre ellos, y cualquier afirmación en ese sentido sería especulativa.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse una licencia en la model card ni en los metadatos de HuggingFace, no hay autorización explícita de uso comercial. En la práctica, esto implica tratar el modelo como no apto para producción hasta que el autor aclare los términos.
- Modelo muy infraentrenado: 41,7 millones de tokens para 17 millones de parámetros está en torno a 8 veces por debajo del punto óptimo de Chinchilla. Es esperable una perplejidad alta y una generación coherente solo a muy corto plazo.
- Sin ajuste por instrucciones: es un modelo base, no un asistente. No responde a formatos de chat y no debe evaluarse como tal.
- Riesgo elevado de alucinación y de texto incoherente: al no haber sido entrenado para ser factual ni para seguir instrucciones, cualquier salida debe considerarse no fiable por defecto.
- Idiomas: únicamente inglés declarado. No hay evidencia de capacidad en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se documenta la ventana máxima, así que no puede garantizarse el comportamiento más allá del prefijo más corto que se haya validado.
- Sesgos: no se ha publicado ningún análisis de sesgos ni de composición del dataset más allá del nombre del corpus, por lo que se desconocen los sesgos heredados de los datos.
- Integración limitada: requiere el código del repositorio de la asignatura para cargarse; no es un checkpoint estándar de `transformers`, lo que complica su uso en herramientas habituales (vLLM, TGI, Ollama) sin trabajo adicional de conversión.
- Ausencia de evaluación: no hay benchmarks, ni evaluación de seguridad, ni comparación cuantitativa con las otras variantes del experimento, por lo que no puede recomendarse su uso fuera del ámbito de la reproducción de experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part2-lion
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part2/runs/lion-d21858f4
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
