# cmcheng/DeepMath-GRPO_Qwen2.5-0.5B-Instruct

## Resumen

DeepMath-GRPO_Qwen2.5-0.5B-Instruct es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por el usuario cmcheng mediante fine-tuning del modelo base Qwen2.5-0.5B-Instruct de Alibaba. El entrenamiento utiliza el algoritmo GRPO (Group Relative Policy Optimization) implementado con la librería TRL de Hugging Face, sobre el dataset DeepMath-103K, un corpus de problemas matemáticos con razonamiento paso a paso. El objetivo es mejorar la capacidad de resolución de problemas matemáticos de un modelo pequeño (0.5B parámetros) mediante aprendizaje por refuerzo, una técnica que ha demostrado ser efectiva para potenciar el razonamiento en modelos de lenguaje.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con aproximadamente 630 millones de parámetros, y está pensado para tareas de generación de texto y razonamiento matemático. Su relevancia radica en demostrar que es posible obtener mejoras sustanciales en tareas específicas con modelos compactos y recursos de entrenamiento limitados (dos GPUs RTX 4080), lo que lo hace accesible para equipos de investigación y desarrollo con presupuesto reducido. Al estar basado en Qwen2.5-Instruct, hereda las capacidades de instrucción y diálogo del modelo original, aunque el fine-tuning se centra exclusivamente en matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 630.167.424 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | no disponible (la model card indica "licence: license", sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, un modelo denso de 0.5 mil millones de parámetros con atención causal estándar. No emplea mezcla de expertos (MoE) ni arquitecturas híbridas. El fine-tuning se realizó con el algoritmo GRPO, una variante de optimización de política proximal (PPO) que agrupa varias respuestas generadas por el modelo para calcular ventajas relativas, reduciendo la varianza y mejorando la estabilidad del entrenamiento. La implementación se hizo con la librería TRL de Hugging Face, utilizando DeepSpeed con precisión mixta bf16 y activación de gradient checkpointing.

El conjunto de entrenamiento es DeepMath-103K, con 97.870 muestras para entrenamiento y 5.152 para prueba, de las cuales se extrajeron 100 para validación. La configuración de entrenamiento incluye un tamaño de lote efectivo de 64 (4 por dispositivo × 2 GPUs × 8 pasos de acumulación), una tasa de aprendizaje de 1e-6, un coeficiente KL de 0.001, y valores de clipping epsilon de 0.2 y 0.28. Se generaron 4 respuestas por prompt durante el entrenamiento (num_generations=4) con una longitud máxima de completación de 2.048 tokens. El entrenamiento se limitó a 1.000 pasos, con evaluación cada 50 pasos y selección del mejor modelo según la recompensa de evaluación. Se utilizó vLLM como motor de generación durante el entrenamiento para acelerar la producción de respuestas.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: al estar basado en Qwen2.5-Instruct, el modelo puede mantener conversaciones y responder a instrucciones generales, aunque su especialización es matemática.
- Razonamiento matematico: el fine-tuning con GRPO sobre DeepMath-103K mejora la capacidad de resolver problemas aritmeticos, algebraicos y de razonamiento logico-matematico, generando cadenas de razonamiento paso a paso.
- Generacion de codigo: el modelo base Qwen2.5-Instruct tiene cierta capacidad de generacion de codigo, que se conserva, aunque no es el foco del entrenamiento.
- Capacidades multilingues: el modelo base soporta varios idiomas (principalmente ingles y chino), pero no se ha verificado el rendimiento de este fine-tuning en otros idiomas.
- No se ha confirmado soporte para tool calling, function calling o modo agente en este modelo especifico, aunque el base podria tenerlo; no se menciona en la documentacion.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede utilizarse como asistente para estudiantes, generando explicaciones paso a paso de problemas de algebra, calculo o aritmetica. Su tamano reducido permite ejecutarlo en portatiles o incluso en dispositivos edge.
- Generacion de ejercicios y soluciones para plataformas de e-learning: se puede integrar en sistemas de generacion automatica de contenido para crear problemas matematicos con sus soluciones detalladas, adaptados a distintos niveles de dificultad.
- Evaluacion de modelos de razonamiento: al ser un modelo pequeno y especializado, sirve como punto de referencia (baseline) para comparar tecnicas de aprendizaje por refuerzo en tareas de razonamiento, especialmente en entornos con recursos limitados.
- Prototipado rapido de agentes conversacionales con capacidad matematica: su bajo coste de inferencia permite desplegarlo en servicios de chat o asistentes virtuales que necesiten resolver calculos o problemas matematicos basicos sin depender de APIs externas.
- Investigacion en aprendizaje por refuerzo: el modelo y su configuracion de entrenamiento (GRPO, dataset, hiperparametros) son un caso de estudio reproducible para investigar como el tamano del modelo afecta a la eficacia del RL en tareas especificas.
- Filtrado y verificacion de soluciones matematicas: puede emplearse para comprobar si una solucion propuesta es correcta o para generar multiples enfoques de resolucion, ayudando en tareas de curacion de contenido cientifico o tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, GSM8K o HumanEval, ni comparaciones con otros modelos. El unico dato de rendimiento es la recompensa de evaluacion utilizada durante el entrenamiento, pero no se proporcionan valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.5B parametros, en precision BF16/FP16 ocupa aproximadamente 1,2 GB de VRAM. Con cuantizacion a 8 bits o 4 bits, el uso se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso CPUs con suficiente RAM pueden ejecutarlo. Para entrenamiento se usaron 2x NVIDIA RTX 4080 de 32 GB, pero para inferencia no se requiere tanta capacidad.
- Compatibilidad con GPUs de consumo: si, cabe en cualquier GPU consumer moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversion) o directamente con la libreria transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una latencia de pocos milisegundos por token en una GPU moderna y un throughput alto en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepMath-GRPO_Qwen2.5-0.5B-Instruct | 0.5B | no disponible | Matematicas (GRPO) | no disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K (segun documentacion oficial) | Instruccion general | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B-Instruct | 1.5B | 32K | Matematicas | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamano similar y orientacion matematica. DeepMath-GRPO es un fine-tuning del base Qwen2.5-0.5B-Instruct, por lo que su rendimiento en matematicas deberia ser superior al base, pero no se dispone de datos cuantitativos. Qwen2.5-Math-1.5B-Instruct es un modelo mas grande y especificamente entrenado para matematicas, probablemente con mejor rendimiento, pero tambien con mayores requisitos de hardware. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de un modelo pequeno, puede heredar sesgos del modelo base y del dataset DeepMath-103K, que probablemente contiene problemas en ingles y chino, lo que podria limitar su rendimiento en otros idiomas.
- Riesgo de alucinacion: los modelos de 0.5B tienen una capacidad limitada de razonamiento complejo y pueden generar respuestas plausibles pero incorrectas, especialmente en problemas matematicos avanzados. Se recomienda verificar las soluciones.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, no se ha confirmado que este fine-tuning mantenga esa longitud de contexto. Ademas, la longitud maxima de generacion durante el entrenamiento fue de 2.048 tokens, lo que podria limitar la generacion de razonamientos muy largos.
- Restricciones de licencia: la licencia no esta especificada claramente ("licence: license"), por lo que se desconoce si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: al ser un modelo experimental de investigacion, no se ha validado su robustez en entornos reales. No se recomienda su uso en sistemas criticos sin una evaluacion exhaustiva.

## Enlaces

- [Hugging Face - cmcheng/DeepMath-GRPO_Qwen2.5-0.5B-Instruct](https://huggingface.co/cmcheng/DeepMath-GRPO_Qwen2.5-0.5B-Instruct)
- [FriendliAI - pagina del modelo](https://friendli.ai/models/cmcheng/DeepMath-GRPO_Qwen2.5-0.5B-Instruct)
- [GitHub - QwenLM/Qwen2.5-Math](https://github.com/QwenLM/Qwen2.5-Math)
- [ModelScope - Qwen2.5-0.5B-Instruct](https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct)
