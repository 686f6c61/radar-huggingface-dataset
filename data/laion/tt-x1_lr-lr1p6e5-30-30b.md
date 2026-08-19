# laion/tt-x1_lr-lr1p6e5-30-30B

## Resumen
Este modelo es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) realizado por LAION, una organizacion sin animo de lucro dedicada a la investigacion abierta en IA. Se trata de la adaptacion del modelo base Qwen/Qwen3-Coder-30B-A3B-Instruct mediante GRPO (Group Relative Policy Optimization), entrenado sobre el dataset DCAgent/exp_rpt_multifile con el framework SkyRL y el verificador Terminus-2. El objetivo del experimento era explorar el efecto de diferentes tasas de aprendizaje en la estabilidad y calidad del entrenamiento RL, concretamente en el barrido denominado TaskTrove X1.

El checkpoint corresponde al paso 30 de entrenamiento de la rama con tasa de aprendizaje 1.6e-5, seleccionado por su mayor media movil exponencial (EMA) de recompensa entre los guardados. El entrenamiento se detuvo en el paso 35 de 80 debido a un aumento anomalo de la entropia de la politica, lo que indica inestabilidad en el proceso. El modelo conserva la arquitectura MoE (Mixture of Experts) del base, con 30.532 millones de parametros totales y 3.000 millones activos, lo que lo hace relativamente eficiente en inferencia pese a su tamano. No se especifica la longitud de contexto en la informacion disponible, aunque al derivar de Qwen3-Coder se espera que herede la ventana de 32.768 tokens del modelo original.

La relevancia de este checkpoint es principalmente investigadora: sirve como punto de referencia para estudiar la dinamica del entrenamiento RL con GRPO, la evolucion de la entropia y la seleccion de checkpoints mediante EMA. No es un modelo final pulido para produccion, sino un artefacto intermedio de un experimento cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible (hereda 32.768 tokens del base, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (hereda los del base, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo mantiene la arquitectura del base Qwen3-Coder-30B-A3B-Instruct, un transformer MoE con 30,5B parametros totales y 3B activos por token. La arquitectura MoE permite activar solo una fraccion de los parametros en cada forward, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamano. El entrenamiento se realizo con GRPO, una variante de PPO que agrupa multiples respuestas generadas por el modelo para estimar la ventaja relativa, eliminando la necesidad de una funcion de valor critica. El framework utilizado fue SkyRL junto con el verificador Terminus-2, que aplica un shaping basado en pass_ratio (proporcion de pruebas que pasan) sobre el dataset DCAgent/exp_rpt_multifile, orientado a tareas de generacion de codigo y edicion multi-archivo.

El entrenamiento se detuvo prematuramente en el paso 35 de 80 porque la entropia de la politica escalo de 0,11 a 0,95 (aproximadamente 8,5 veces el valor inicial), acercandose al limite de parada establecido en 10x. Esto indica que el modelo estaba perdiendo determinismo y volviendose demasiado exploratorio, probablemente por una tasa de aprendizaje demasiado alta. El checkpoint del paso 30 se selecciono mediante la media movil exponencial de recompensa con alpha=1/3, obteniendo un EMA de 0,1890, una recompensa de paso de 0,2109 y un pass@8 de 0,3594. El entrenamiento sufrio ademas una interrupcion por OOM (out of memory) a mitad de la ejecucion, lo que obligo a relanzar el proceso.

## Capacidades
- Generacion de codigo y edicion multi-archivo: entrenado sobre DCAgent/exp_rpt_multifile, un dataset de tareas que requieren modificar multiples archivos de un repositorio.
- Razonamiento y resolucion de problemas: hereda las capacidades del base Qwen3-Coder-30B-A3B-Instruct, que incluye razonamiento paso a paso y generacion de codigo.
- Tool calling: el modelo base soporta function calling, aunque no se ha verificado si el checkpoint preserva esta capacidad tras el entrenamiento RL.
- Capacidades multilingues: no confirmadas, aunque el base Qwen3 soporta multiples idiomas.
- Modo thinking: el base Qwen3-Coder incluye un modo de razonamiento explicito que puede activarse con el prompt adecuado; no se ha confirmado su comportamiento tras el RL.

## Casos de uso
- Investigacion en RL: este checkpoint es util para estudiar la dinamica del entrenamiento GRPO, la evolucion de la entropia y la seleccion de checkpoints mediante EMA en configuraciones de tasa de aprendizaje alta.
- Comparacion de configuraciones de entrenamiento: puede usarse como referencia para comparar el efecto de diferentes learning rates dentro del barrido TaskTrove X1, junto con los checkpoints de otras ramas (lr4e6, etc.).
- Analisis de estabilidad: permite investigar por que el entrenamiento divergio (entropia creciente) y que metricas pueden predecir ese comportamiento.
- Reproduccion de experimentos: investigadores pueden reproducir el pipeline completo (SkyRL + Terminus-2 + GRPO) y comparar sus resultados con este checkpoint.
- Desarrollo de verificadores: el dataset y el verificador pass_ratio pueden analizarse a traves del comportamiento de este modelo para mejorar el diseno de funciones de recompensa.
- Educacion y divulgacion: sirve como ejemplo real de un checkpoint intermedio de RL, mostrando las dificultades practicas del entrenamiento (OOM, divergencia, seleccion de checkpoints).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona metricas internas del entrenamiento: recompensa de paso 0,2109, pass@8 0,3594 y entropia 0,128 en el paso 30. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 30,5B parametros en precision FP32, lo que requiere aproximadamente 122 GB de VRAM. Con cuantizacion a FP16 o BF16, se reduce a unos 61 GB. Con cuantizacion de 8 bits, unos 30,5 GB, y con 4 bits, unos 15,3 GB.
- GPU recomendadas: para FP16, se necesitan GPU de datacenter como A100 80GB (una sola no es suficiente, se requieren 2) o H100 80GB (una sola). Para cuantizacion de 4 bits, una RTX 4090 (24 GB) podria ser insuficiente, se necesitaria una RTX 6000 Ada (48 GB) o una A6000.
- Si cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y aun asi puede no caber en GPUs de 24 GB. No es practico para consumer GPU sin cuantizacion.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, puede cargarse con Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B parametros activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 30B, pero no hay datos medidos.

## Comparativa con modelos similares
| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| laion/tt-x1_lr-lr1p6e5-30-30B | 30,5B | 3B | no disponible | Apache-2.0 | Checkpoint RL intermedio, no apto para produccion |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B | 3B | 32.768 | Apache-2.0 | Modelo base, instruct, soporta tool calling |
| DeepSeek-Coder-V2-Lite-Instruct | 16B | 2,4B | 32.768 | MIT | MoE para codigo, mas pequeno, sin RL |
| CodeLlama-34B-Instruct | 34B | 34B | 16.384 | Llama license | Denso, mas pesado, sin MoE |

La comparativa directa es compleja porque este checkpoint es un artefacto de investigacion, no un modelo final. El base Qwen3-Coder-30B-A3B-Instruct es la referencia natural para evaluar si el entrenamiento RL mejoro o empeoro las capacidades, pero no se proporcionan benchmarks comparativos.

## Limitaciones y advertencias
- Entrenamiento incompleto: la ejecucion se detuvo en el paso 35 de 80 por entropia elevada. El checkpoint del paso 30 no representa el resultado final del entrenamiento y puede tener capacidades degradadas respecto al modelo base.
- Inestabilidad del RL: la entropia crecio 8,5 veces desde el paso 1, indicando que la politica se volvio demasiado exploratoria. Esto puede traducirse en respuestas incoherentes o poco deterministas.
- Sin benchmarks publicados: no hay evidencia de que este checkpoint mejore o mantenga el rendimiento del modelo base en tareas estandar.
- Sesgos no evaluados: al ser un checkpoint de RL sobre codigo, no se ha evaluado su comportamiento en tareas de lenguaje general ni sus sesgos potenciales.
- Uso en produccion desaconsejado: es un artefacto de investigacion, no un modelo pulido. Cualquier uso en produccion requeriria una evaluacion exhaustiva previa.
- Interrupcion por OOM: el entrenamiento sufrio un fallo de memoria a mitad de ejecucion, lo que pudo afectar a la calidad del checkpoint.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-Coder-30B-A3B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/laion/tt-x1_lr-lr1p6e5-30-30B
- Dataset de trazas de entrenamiento: https://huggingface.co/datasets/penfever/tt-x1_lr-lr1p6e5
- Rampa hermana con lr4e6: https://huggingface.co/laion/tt-x1_lr-lr4e6-30-30B
- Organizacion LAION: https://laion.ai/
- GitHub de LAION: https://github.com/LAION-AI
- Modelo base Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
