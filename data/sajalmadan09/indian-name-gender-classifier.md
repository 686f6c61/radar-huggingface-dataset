# sajalmadan09/indian-name-gender-classifier

## Resumen

El Indian-Name Gender Classifier es un clasificador binario de texto desarrollado por sajalmadan09 (Sajal Labs) que predice el genero convencional (M/F) de un nombre propio indio. No es un modelo de lenguaje: se trata de un perceptron multicapa minúsculo con 22.146 parametros que opera sobre caracteristicas de bigramas de caracteres y que se distribuye como pieza de un proyecto de investigacion sobre compilacion de modelos entrenados a artefactos de inferencia nativos en C/C++ sin dependencias.

Su relevancia no reside en la precision, sino en el caso de estudio que documenta: el autor publica de forma explicita un desajuste train/validacion de 99,4% frente a 81,8%, atribuido a sobreajuste sobre un conjunto de unos 800 nombres, y acompana un benchmark de invocacion en frio que compara su runtime nativo (3,80 ms p50) con ONNX Runtime (75,52 ms) y PyTorch eager (584,54 ms) sobre CPU Apple M4. El modelo pesa aproximadamente 89 KB en fp32 y se ofrece en tres formatos (safetensors, ONNX y binario crudo), lo que lo convierte en un ejemplo util para entender el coste de arranque de los frameworks de Python en escenarios de invocacion unica.

Es, por tanto, un artefacto de uso educativo y de investigacion en optimizacion de inferencia, no un componente listo para produccion con requisitos de exactitud exigentes. La licencia es MIT tanto para el codigo como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso: Linear(343->64) -> ReLU -> Linear(64->2) -> Softmax |
| Parametros totales | 22.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo autoregresivo; la entrada es un unico nombre tokenizado en bigramas de caracteres) |
| Tipos de cuantizacion | no disponible (se distribuye en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiquetado en la model card); el dominio de aplicacion son nombres propios indios |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | safetensors, ONNX y formato binario nativo del runtime Sajal (fc1_weight.bin, fc1_bias.bin, fc2_weight.bin, fc2_bias.bin, shapes.txt) |
| Framework original | PyTorch 2.14 |
| Tamano del modelo | ~89 KB (fp32) |
| Vocabulario | 343 bigramas de caracteres, con marcadores de frontera ^ y $ |
| Tarea | Clasificacion binaria de texto (nombre -> M/F) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas totalmente conectadas. La entrada es un vector de 343 dimensiones construido como bolsa de bigramas de caracteres sobre un vocabulario fijo de 343 entradas: el nombre se pasa a minusculas, se rellena con marcadores de frontera `^` y `$` y se cuentan los bigramas resultantes. La primera capa proyecta 343 a 64 dimensiones, se aplica ReLU y la segunda capa proyecta 64 a 2 logits que pasan por softmax para producir la probabilidad de cada clase. No hay mecanismo de atencion, embeddings contextuales ni componente recurrente.

El entrenamiento se realizo sobre una lista compilada manualmente de nombres propios indios, con un split 85/15: 688 nombres de entrenamiento y 121 de validacion held-out. El vocabulario se construyo unicamente a partir de los nombres de entrenamiento, segun el autor para evitar fuga de informacion. No se documenta el uso de RLHF, DPO ni ningun proceso de ajuste posterior; tampoco se especifican hiperparametros de optimizacion, numero de epocas ni funcion de perdida mas alla del softmax implicito. La innovacion tecnica destacable no esta en el modelo sino en el pipeline que lo acompana: la compilacion de los pesos a un runtime nativo C/C++ sin dependencia de Python en tiempo de inferencia, con extraccion de caracteristicas que debe replicarse exactamente para que las predicciones sean correctas.

## Capacidades

- Clasificacion binaria de genero convencional (M/F) a partir de un nombre propio indio, devolviendo un par de probabilidades `[P(male), P(female)]`.
- Extraccion de caracteristicas mediante bolsa de bigramas de caracteres sobre un vocabulario cerrado de 343 entradas.
- Inferencia sin dependencias de Python mediante el runtime nativo Sajal, invocable desde linea de comandos.
- Ejecucion en tres backends distintos: runtime nativo C/C++, ONNX Runtime y PyTorch con safetensors.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: el vocabulario y los datos de entrenamiento estan limitados a nombres indios transcritos en alfabeto latino.
- No dispone de modo de razonamiento (thinking mode), vision, audio ni generacion de texto.

## Casos de uso

- Caso de estudio educativo sobre sobreajuste: el modelo permite ilustrar con numeros concretos la brecha entre precision de entrenamiento (99,4%) y de validacion (81,8%) sobre un conjunto de 688 nombres, util en material docente sobre regularizacion y tamano de dataset.
- Demostracion de inferencia nativa sin Python: sirve para medir y explicar el coste de arranque de ONNX Runtime y PyTorch frente a un binario C/C++ en escenarios de invocacion unica, con los datos de benchmark ya publicados.
- Prueba de concepto de pipeline end-to-end de compilacion de modelos: el proyecto documenta como convertir pesos entrenados en PyTorch a un artefacto nativo con extraccion de caracteristicas replicada, replicable para modelos mayores.
- Preprocesado auxiliar de bajisima latencia: en un sistema serverless o una CLI donde haya que enriquecer registros con una etiqueta de genero aproximada, el coste de 3,80 ms p50 en frio y 89 KB de peso lo hacen viable incluso en entornos con arranque de proceso frecuente.
- Clasificacion en dispositivos embebidos o de recursos muy limitados: al no requerir GPU ni runtime de Python, puede ejecutarse en microcontroladores o nodos edge donde no cabe ningun framework de inferencia convencional.
- Normalizacion de datos en tareas de limpieza de registros: asignar un genero probable a nombres indios en un CRM o un dataset para analisis demografico exploratorio, asumiendo el margen de error del 18,2% en validacion.
- Ejemplo de integracion multi-formato: sirve para comparar en un mismo pipeline el resultado de safetensors, ONNX y el formato nativo y verificar que la extraccion de caracteristicas es consistente entre backends.

## Benchmarks y rendimiento

Datos de precision publicados por el autor (split 85/15, vocabulario construido solo con nombres de entrenamiento):

| Conjunto | Precision |
|---|---:|
| Entrenamiento (688 nombres) | 99,4% |
| Validacion (121 nombres held-out) | 81,8% |

Benchmark de invocacion en frio extremo a extremo (spawn de proceso -> nombre de entrada -> prediccion -> salida del proceso, reloj de pared externo, 30 ensayos intercalados, CPU Apple M4):

| Implementacion | Invocacion en frio p50 | Factor relativo |
|---|---:|---:|
| Nativo C++ (runtime Sajal) | 3,80 ms | 1,0x |
| ONNX Runtime (CPU) | 75,52 ms | 19,9x mas lento |
| PyTorch eager | 584,54 ms | 153,8x mas lento |

El autor matiza explicitamente que la ventaja medida se limita al coste de arranque de proceso de Python y frameworks en invocacion unica (serverless, CLI, uso intermitente en edge), y no constituye una afirmacion general de que el codigo nativo sea mas rapido en throughput sostenido. No se han publicado resultados de benchmarks de clasificacion comparables a MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 22.146 parametros en fp32 el peso ocupa aproximadamente 88,6 KB, por lo que cabe en cualquier memoria, incluida la de un microcontrolador.
- GPU recomendadas: ninguna. El modelo esta disenado para CPU y no requiere aceleracion.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el coste dominante no es el computo sino el arranque del proceso anfitrion.
- Opciones de despliegue: runtime nativo Sajal (sin Python), ONNX Runtime con `CPUExecutionProvider`, PyTorch con safetensors y extraccion de caracteristicas propia.
- No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia: 3,80 ms p50 en invocacion en frio con el runtime nativo sobre Apple M4 (30 ensayos). No hay mediciones de throughput sostenido ni numeros para CUDA, x86 o ARM distintos del M4.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. La model card no incluye comparaciones con otros clasificadores de genero por nombre, ni con alternativas basadas en transformers pequenos, ni con heuristicas de diccionario. El unico contraste cuantitativo publicado es el benchmark de runtime nativo frente a ONNX Runtime y PyTorch ejecutando el mismo modelo, recogido en la seccion anterior.

| Modelo | Parametros | Contexto | Precision validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indian-name-gender-classifier | 22.146 | no aplica | 81,8% | MIT | HuggingFace (safetensors, ONNX, nativo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste documentado: la precision cae de 99,4% en entrenamiento a 81,8% en validacion, una brecha de 17,6 puntos atribuida por el autor a un dataset de unos 800 nombres.
- Dataset no representativo: la lista de nombres fue compilada a mano y no cubre de forma exhaustiva las multiples tradiciones de nombres de la India, con el sesgo demografico que ello implica.
- Nombres unisex intrinsecamente ambiguos (el autor cita "Kiran" como ejemplo): el modelo asigna una etiqueta con la confianza que le impone el entrenamiento, sin senalar la ambiguedad.
- Riesgo de clasificacion erronea en nombres poco frecuentes o de tradiciones infrarrepresentadas, precisamente por la representacion de bigramas y el tamano reducido del vocabulario.
- La representacion por bigramas de caracteres es una linea base simple e interpretable, no una representacion textual de ultima generacion.
- Sensibilidad a la implementacion: si la extraccion de bigramas no coincide exactamente con la del entrenamiento (minusculas, marcadores de frontera, conteo), las predicciones seran incorrectas.
- Ambito linguistico limitado: los nombres deben estar transcritos en alfabeto latino; el etiquetado de idioma de la model card es `en`.
- Benchmarks solo sobre Apple Silicon (CPU): no hay mediciones en CUDA, x86 ni otras plataformas, por lo que los numeros de latencia no son extrapolables directamente.
- Uso comercial: la licencia MIT permite uso comercial del codigo y los pesos, pero la precision medida y el sesgo del dataset desaconsejan su uso en decisiones con impacto sobre personas (credito, empleo, acceso a servicios) sin supervision humana y validacion adicional.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el modelo se presenta explicitamente como caso de estudio docente, no como sistema de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sajalmadan09/indian-name-gender-classifier
- Repositorio Sajal Labs: https://github.com/Sajalmadan09/sajal-labs
- Experimento exp9-gender-classifier: https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp9-gender-classifier
- Experimento exp10-e2e-native-pipeline: https://github.com/Sajalmadan09/sajal-labs/tree/main/research/experiments/exp10-e2e-native-pipeline
- Extraccion de caracteristicas en Python: https://github.com/Sajalmadan09/sajal-labs/blob/main/python/gender_features.py
- Analisis de brechas del proyecto: research/gap-analysis.md (dentro del repositorio Sajal Labs)
- Datos crudos de benchmark: benchmark_results.json (incluido en el repositorio del modelo)
