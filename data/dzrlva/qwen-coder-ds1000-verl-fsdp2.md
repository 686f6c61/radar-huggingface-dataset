# dzrlva/qwen-coder-ds1000-verl-fsdp2

## Resumen

`dzrlva/qwen-coder-ds1000-verl-fsdp2` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, afinado con aprendizaje por refuerzo para generar codigo Python ejecutable orientado a ciencia de datos. Lo desarrolla el usuario de HuggingFace `dzrlva` y aplica una variante de GRPO denominada CGPR (Confidence-Guided Policy Refinement) para mejorar la calidad de los rollouts durante el entrenamiento. El objetivo es resolver tareas del benchmark DS-1000, que evalua generacion de codigo con librerias como Pandas, NumPy, Matplotlib, PyTorch, SciPy, Scikit-learn y TensorFlow.

El modelo resuelve un problema concreto: los modelos de codigo generalistas a menudo producen fragmentos que no se ejecutan o no pasan los tests unitarios en entornos de ciencia de datos. Este adaptador se entrena con una recompensa compuesta por ejecucion, tests y analisis estatico, lo que le permite alcanzar un 83,9 % de tareas resueltas en DS-1000 con una media de solo 48 tokens de salida por tarea, frente a los 1.740 tokens de un modelo mucho mayor como Qwen3.8-Max.

La relevancia actual radica en su eficiencia: consigue un rendimiento cercano al de modelos de escala masiva con un adaptador pequeno (0,2 GB de repositorio) sobre una base de 7B parametros. La licencia es Apache 2.0 y el idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (tamano de repo 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en formato PEFT; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only de 7B parametros especializado en codigo. El entrenamiento se realizo con el framework `verl` y `FSDP2`, aplicando una variante de GRPO llamada CGPR (Confidence-Guided Policy Refinement). La innovacion principal de CGPR es que, cuando un grupo de 8 rollouts obtiene la misma recompensa (ventaja cero), en lugar de descartarlo como hace DAPO, reutiliza la retroalimentacion del verificador para refinar los rollouts condicionados por el codigo padre y las trazas de error, los resultados de tests y las notas de analisis estatico. La asignacion del presupuesto de refinamiento se hace mediante UCB y se sustituye un candidato refinado en el grupo si aumenta la varianza por encima de un umbral. El refinamiento solo ocurre durante el entrenamiento; en inferencia se realiza una unica pasada estandar.

La funcion de recompensa es libre de modelo de recompensa aprendido y combina tres senales: ejecucion sin excepciones no controladas (peso 0,1), fraccion de tests unitarios superados (peso 0,8) y comprobaciones de mypy y linter (peso 0,1). No se especifica en la informacion proporcionada el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de que se optimiza para fragmentos cortos de Python ejecutable en librerias de ciencia de datos y se evalua en DS-1000.

## Capacidades

- Generacion de codigo Python ejecutable para tareas de ciencia de datos con Pandas, NumPy, Scikit-learn, Matplotlib, PyTorch, SciPy y TensorFlow.
- Razonamiento orientado a la resolucion de problemas con tests unitarios y verificacion de ejecucion.
- Generacion de fragmentos cortos y concisos (media de 48 tokens de salida por tarea en DS-1000).
- Capacidad de seguir el formato de chat del modelo base Qwen2.5-Coder-7B-Instruct mediante `apply_chat_template`.
- No se documenta soporte explicito de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes o razonamiento multi-paso en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Generacion de fragmentos de Pandas en produccion: el modelo produce codigo corto y ejecutable para agrupaciones, agregaciones y transformaciones de DataFrames, lo que reduce el coste de tokens y la latencia en pipelines de analisis de datos.
- Asistente de notebooks de ciencia de datos: integrado en un entorno Jupyter, puede completar celdas que manipulan NumPy, SciPy o Scikit-learn con una alta tasa de ejecucion correcta (92,73 % en NumPy y 93,04 % en Scikit-learn en DS-1000).
- Automatizacion de scripts de visualizacion: genera codigo de Matplotlib para graficos a partir de descripciones en lenguaje natural, con un 91,61 % de tareas resueltas en el benchmark.
- Correccion de codigo con retroalimentacion de tests: aunque el refinamiento con feedback solo ocurre en entrenamiento, el modelo resultante esta optimizado para producir codigo que pasa tests unitarios, lo que lo hace adecuado en pipelines de CI que validan fragmentos generados.
- Generacion de codigo para PyTorch en prototipado de modelos: con un 89,71 % de tareas resueltas en DS-1000 para PyTorch, puede asistir en la escritura de capas, funciones de perdida y bucles de entrenamiento.
- Educacion y tutoria de Python para ciencia de datos: puede generar ejemplos cortos y ejecutables para explicar operaciones con DataFrames o arrays, gracias a su concision (48 tokens de media).
- Procesamiento por lotes de tareas de codigo: al requerir solo 7,4 segundos de media por tarea en la evaluacion reportada, es adecuado para generar grandes volumenes de fragmentos en pipelines offline.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre DS-1000 (1000 tareas):

| Metrica | 7B + CGPR | Qwen3.8-Max (2.4T, ~95B activos) |
|---|---|---|
| Tareas resueltas | 839 / 1000 (83,9 %) | 848 / 1000 (84,8 %) |
| Resueltas excluyendo TensorFlow | 86,9 % | 85,3 % |
| Tokens de salida medios por tarea | 48 | 1.740 |
| Tiempo de generacion medio por tarea | 7,4 s | 60,6 s |

Resultados por libreria en DS-1000:

| Libreria | Tareas | 7B + CGPR | Qwen3.8-Max | Delta (p.p.) |
|---|---|---|---|---|
| Pandas | 291 | 78,35 | 71,13 | +7,2 |
| NumPy | 220 | 92,73 | 89,09 | +3,6 |
| Sklearn | 115 | 93,04 | 93,91 | -0,9 |
| Matplotlib | 155 | 91,61 | 94,19 | -2,6 |
| PyTorch | 68 | 89,71 | 94,12 | -4,4 |
| SciPy | 106 | 83,02 | 88,68 | -5,7 |
| TensorFlow | 45 | 20,00 | 73,33 | -53,3 |
| Total | 1000 | 83,90 | 84,80 | -0,9 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (repo de 0,2 GB), pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct. En FP16 se estiman aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones estandar para un modelo de 7B, no confirmadas en la model card).
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en FP16 sin cuantizar. Para cuantizacion 4 u 8 bits, GPUs consumer como RTX 3090, RTX 4080 o RTX 4070 Ti con 12-16 GB de VRAM.
- Cabe en GPU consumer: si, con cuantizacion adecuada, en GPUs de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti) usando 4 bits.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers`. Para servir en produccion se puede fusionar el adaptador con el modelo base y desplegar con vLLM, TGI o llama.cpp tras conversion a GGUF. No se documentan opciones especificas en la model card.
- Latencia y throughput: la model card reporta 7,4 segundos de media por tarea en DS-1000 con 48 tokens de salida, aunque no se especifica el hardware utilizado para esa medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DS-1000 (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dzrlva/qwen-coder-ds1000-verl-fsdp2 | 7B + LoRA | no disponible | 83,9 % | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.8-Max | 2,4T (~95B activos) | no disponible | 84,8 % | no disponible | no disponible |

El adaptador supera a Qwen3.8-Max en Pandas (+7,2 p.p.) y NumPy (+3,6 p.p.), y queda por debajo en TensorFlow (-53,3 p.p.), SciPy (-5,7 p.p.), PyTorch (-4,4 p.p.) y Matplotlib (-2,6 p.p.). No se dispone de datos de otros modelos comparables de 7B afinados para DS-1000 en la informacion proporcionada.

## Limitaciones y advertencias

- TensorFlow es el punto debil: solo resuelve el 20,0 % de las 45 tareas de TensorFlow en DS-1000 (36 sin resolver), lo que limita su uso en proyectos con ese framework.
- El modelo esta optimizado para fragmentos cortos y ejecutables de Python para librerias de ciencia de datos; no se ha evaluado en benchmarks de codigo de proposito general, por lo que su rendimiento fuera de ese dominio es desconocido.
- El idioma declarado es unicamente ingles; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct, lo que anade complejidad de despliegue y dependencia de la licencia y disponibilidad de dicho modelo.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; como todo modelo generativo de codigo, existe riesgo de producir fragmentos plausibles pero incorrectos que no pasen los tests.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen2.5-Coder-7B-Instruct.
- No se especifica la longitud de contexto efectiva del adaptador ni si el entrenamiento altera el comportamiento del modelo base en conversaciones multi-turno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/dzrlva/qwen-coder-ds1000-verl-fsdp2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
