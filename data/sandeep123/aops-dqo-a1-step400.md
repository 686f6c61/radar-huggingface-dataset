# sandeep123/aops-dqo-a1-step400

## Resumen

Este modelo es un checkpoint de investigación publicado por el usuario sandeep123, que aplica el objetivo de diversidad DQO (Diversity-Quantified Objective) sobre el modelo base Qwen/Qwen2.5-Math-1.5B mediante entrenamiento con GRPO (Group Relative Policy Optimization) y el framework verl. El objetivo es mejorar la diversidad de las respuestas generadas en tareas de razonamiento científico, concretamente sobre el dataset ScienceQA. Se trata de un baseline dentro de un estudio más amplio que compara distintas estrategias de regularización de diversidad en RL.

El modelo tiene 1.777 millones de parámetros (aproximadamente 1,8 mil millones) y está basado en la arquitectura transformer decoder-only de Qwen2.5-Math. Aunque el contexto nativo del modelo base no se especifica en la información disponible, en el ejemplo de inferencia se utiliza una longitud máxima de 1536 tokens. Su relevancia radica en que sirve como punto de referencia para evaluar cómo un término de diversidad (logdet de la matriz de gram) afecta a la calidad y variedad de las respuestas en problemas de opción múltiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado; en inferencia se usa max_model_len=1536 |
| Tipos de cuantizacion | No especificado; al ser safetensors, puede cuantizarse con GPTQ, AWQ o GGUF |
| Idiomas soportados | No especificado (el modelo base Qwen2.5-Math es multilingue, pero no se indica para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Math-1.5B, un transformer decoder-only con 1.777 millones de parámetros. Sobre esta base se aplica un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization) implementado en verl. La novedad principal es la incorporación de DQO (Diversity-Quantified Objective) con alpha=1.0, que añade un término de diversidad basado en alpha * logdet(L+I) con un estimador leave-one-out. La matriz L se construye a partir de las representaciones ocultas de la política de referencia (embeddings phi), en lugar del codificador de frases preentrenado propuesto en el paper original de DQO (Chen et al., ICLR 2026). Esta decisión aísla el efecto del objetivo de diversidad frente a la configuración STRIDE.

El entrenamiento se realizó sobre el dataset ScienceQA (variante `scienceqa_boxfix`) durante 25 épocas equivalentes a 1250 pasos, con un lote de 128 prompts y K=6 rollouts por prompt. Se usó una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 dentro de la recompensa, una recompensa de formato de 0.03 constante, y una semilla fija de 42. Los límites de tokens son 512 para el prompt y 1024 para la respuesta. No se aplicó plantilla de chat: el modelo se entrenó con texto plano, y la model card advierte explícitamente que aplicar la plantilla de chat de Qwen2.5-Math en inferencia provoca una degradación de aproximadamente 19 puntos de pass@1 en una tarea relacionada.

## Capacidades

- Razonamiento cientifico y matematico: responde preguntas de opcion multiple del dataset ScienceQA, generando la respuesta final dentro de `\boxed{}`.
- Generacion de multiples respuestas (pass@k): entrenado con K=6 rollouts, puede producir varias respuestas candidatas para un mismo prompt, lo que permite evaluar la diversidad y la cobertura de soluciones.
- Extraccion de respuestas pre-registrada: el modelo sigue un formato estandarizado (contenido del ultimo `\boxed{}` o, en su defecto, el ultimo token A-E), lo que facilita el parseo automatico.
- No soporta tool calling, ni funciones de agente, ni capacidades multimodales. Es un modelo de texto puro.
- No se especifican capacidades multilingues especificas, aunque el modelo base Qwen2.5-Math es multilingue; este checkpoint no documenta su comportamiento en otros idiomas.

## Casos de uso

- Investigacion en RL para razonamiento: sirve como baseline para comparar el efecto de distintos objetivos de diversidad (DQO frente a otros) en tareas de razonamiento cientifico. Su configuracion esta documentada y es reproducible.
- Evaluacion de metodos de decodificacion: al generar multiples respuestas (K=6) con temperatura 1.0, es util para estudiar como afectan distintas estrategias de muestreo a la calidad y diversidad de las soluciones.
- Prototipos de asistentes educativos: puede responder preguntas de ciencias con opcion multiple en entornos controlados, siempre que se respete el formato de texto plano (sin chat template). Adecuado para demos academicas o pruebas de concepto.
- Benchmarking de extraccion de respuestas: su formato estandarizado con `\boxed{}` permite probar tecnicas de parsing y post-procesado para modelos de razonamiento.
- Analisis de robustez frente a variaciones de prompt: al ser un modelo pequeno y rapido de ejecutar, se puede usar para medir la sensibilidad a reformulaciones de preguntas cientificas.
- Comparacion de politicas de RL: su checkpoint esta seleccionado por mejor pass@6 (step 400), mientras que otros checkpoints del mismo autor estan seleccionados por pass@1, lo que permite estudiar la relacion entre diversidad y precision.

## Benchmarks y rendimiento

El autor proporciona metricas de validacion sobre 256 prompts retenidos de ScienceQA, con K=6, temperatura 1.0 y semilla 42. La extraccion de respuestas sigue el protocolo pre-registrado (contenido del ultimo `\boxed{}` o ultimo token A-E). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| pass@1 (validacion) | 0.2168 |
| pass@6 (validacion) | 0.4180 |
| Paso de entrenamiento | 400 |

## Requisitos de hardware

- VRAM estimada: en bfloat16, los pesos ocupan aproximadamente 3,55 GB (1.777M parametros * 2 bytes). Con cuantizacion int8 se reduce a ~1,8 GB y con int4 a ~0,9 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3090, RTX 4090, o incluso en tarjetas con 4-6 GB de VRAM si se usa cuantizacion. Para entrenamiento o fine-tuning se necesitaria al menos 16 GB (A100, H100, o varias GPUs).
- Opciones de despliegue: compatible con vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama (si se convierte a GGUF) y TGI.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 1.8B, en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo con vLLM.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y otros de la misma categoria (por ejemplo, Qwen2.5-Math-1.5B base u otros fine-tunes con RL). El propio autor publica un modelo hermano llamado `sandeep123/sqa-dqo-a1-step400` con caracteristicas similares pero entrenado sobre el mismo dataset sin la variante AoPS, aunque no se ofrecen metricas comparativas directas. Por tanto, no es posible establecer una comparativa cuantitativa fiable con la informacion disponible.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto plano. Usar la plantilla de chat de Qwen2.5-Math en inferencia degrada el rendimiento en aproximadamente 19 puntos de pass@1 en una tarea relacionada.
- Sesgos del modelo base: al derivar de Qwen2.5-Math, puede heredar sesgos presentes en los datos de preentrenamiento, especialmente en dominios cientificos y matematicos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en preguntas fuera de su distribucion de entrenamiento.
- Alcance limitado: esta especializado en preguntas de opcion multiple de ScienceQA; su rendimiento en otros formatos o dominios no esta validado.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo es un checkpoint de investigacion sin garantias de produccion. No se mencionan restricciones adicionales, pero se recomienda verificar los terminos del modelo base Qwen2.5-Math.
- Seleccion de checkpoint: el checkpoint publicado (step 400) esta optimizado para pass@6, no para pass@1. Para aplicaciones que requieran precision individual, puede ser mas adecuado el checkpoint de step 1000-1200, que no esta publicado en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-dqo-a1-step400
- Modelo hermano (sqa-dqo-a1-step400): https://huggingface.co/sandeep123/sqa-dqo-a1-step400
- Busqueda de modelos con tag DQO: https://huggingface.co/models?other=dqo
