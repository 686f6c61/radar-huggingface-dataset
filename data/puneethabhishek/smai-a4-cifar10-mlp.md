# PuneethAbhishek/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un perceptron multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10 como parte de la asignacion 4 de un curso de SMAI (Statistical Methods in Artificial Intelligence). No se trata de un modelo de lenguajes ni de un modelo fundacional: es un clasificador de imagenes de 10 clases construido con una arquitectura completamente conectada de tres capas ocultas y publicado en HuggingFace con cero descargas y cero likes en el momento de la consulta.

El modelo resuelve exclusivamente la tarea de clasificacion de imagenes de 32x32 píxeles en las 10 categorias de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion). Su interes es puramente academico y didactico: sirve como referencia de un ejercicio de entrenamiento con SGD, normalizacion de entradas y una tasa de acierto en test del 54,42 %, muy por debajo de lo que consiguen arquitecturas convolucionales sobre el mismo dataset.

La relevancia practica es minima fuera del contexto docente. No dispone de model card en espanol, no declara licencia, no incluye pesos en formatos estandar de inferencia (safetensors, GGUF) y el tamano del repositorio es de 0,0 GB, lo que sugiere que los pesos podrian no estar publicados o ser de muy reducido tamano. Cualquier uso en produccion requeriria descargar, reconstruir y validar el modelo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) totalmente conectado: 3072 -> 512 -> 256 -> 10 |
| Parametros totales | no disponible (estimacion a partir de la arquitectura: 3072x512 + 512 + 512x256 + 256 + 256x10 + 10 = 1.706.762) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizables) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene ficheros safetensors ni GGUF; la model card describe el layout `W{i}: (n_in, n_out), b{i}: (n_out,)`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas densas con activacion ReLU en las capas ocultas y salida identidad de 10 logits, entrenado con perdida de entropia cruzada softmax. La entrada se obtiene aplanando cada imagen de 32x32x3 a un vector de 3072 dimensiones, dividiendo entre 255 y aplicando una normalizacion por media y desviacion tipica calculadas sobre la particion de entrenamiento de CIFAR-10 (fichero `preprocessing.npz`). El layout de pesos indicado es `y = act(x @ W + b)` con `W{i}` de forma `(n_in, n_out)` y `b{i}` de forma `(n_out,)`.

El entrenamiento se realizo durante 100 epocas con SGD, tasa de aprendizaje 0,02, tamano de lote 64, sin acumulacion de gradientes, etiquetas verdaderas (sin label smoothing, `p = 0`) y semilla 1051. No se menciona uso de data augmentation, dropout, batch normalization, RLHF, DPO ni ninguna innovacion tecnica adicional. La precision reportada en test es de 0,5442 (54,42 %), coherente con un MLP sin convoluciones sobre CIFAR-10, donde los modelos convolucionales superan habitualmente el 90 %.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10.
- Salida de 10 logits crudos (sin softmax incorporado); la probabilidad debe aplicarse externamente.
- Entrada exclusivamente numerica en formato vector aplanado de 3072 dimensiones con normalizacion especifica.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision avanzada, audio ni multimodalidad.

## Casos de uso

- Docencia en cursos de machine learning: sirve como ejemplo minimo de pipeline completo (normalizacion, SGD, evaluacion en test) para comparar contra baselines convolucionales sobre CIFAR-10.
- Reproduccion de experimentos academicos: la semilla 1051 y los hiperparametros documentados permiten replicar el resultado de 54,42 % de precision en test si se dispone de los pesos y del fichero `preprocessing.npz`.
- Baseline de referencia en TFGs o practicas: util para medir la mejora que aporta una CNN o un transformer de vision frente a un MLP sobre el mismo dataset.
- Pruebas de infraestructura de inferencia: al ser un modelo de ~1,7 millones de parametros, sirve para validar pipelines de carga de pesos y preprocesado sin coste computacional relevante.
- Ejercicios de cuantizacion y compresion: el reducido tamano permite experimentar con cuantizacion post-entrenamiento o poda sin requerir GPU.
- Demostracion de limitaciones de los MLP en vision: util para ilustrar en clase por que las convoluciones y la induccion de sesgo espacial importan en imagenes naturales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| CIFAR-10 test accuracy | 0,5442 (54,42 %) | Reportado por el autor en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (modelo de ~1,7 millones de parametros), despreciable en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas de latencia.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en dispositivos embebidos.
- Opciones de despliegue: al no publicarse pesos en formatos estandar, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere implementacion propia en NumPy, PyTorch o similar a partir del layout de pesos descrito.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la inferencia seria del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CIFAR-10 test acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | ~1,7 M (estimado) | no aplica | 0,5442 | no disponible | HuggingFace, repo de 0,0 GB |
| ResNet-18 (referencia habitual) | ~11 M | no aplica | ~93-95 % (literatura) | variable | ampliamente disponible |
| VGG-11 (referencia habitual) | ~133 M | no aplica | ~91-92 % (literatura) | variable | ampliamente disponible |

Los valores de ResNet-18 y VGG-11 sobre CIFAR-10 corresponden a resultados publicados en la literatura y se incluyen solo como referencia de contexto; no proceden de la informacion proporcionada sobre este modelo. No se dispone de comparativas directas con otros MLP de la misma asignatura.

## Limitaciones y advertencias

- Precision en test del 54,42 %, muy inferior a los metodos convolucionales modernos sobre CIFAR-10; no apto para uso real en clasificacion de imagenes.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion.
- Repositorio de 0,0 GB: no esta claro que los pesos esten efectivamente publicados; puede requerir reconstruccion desde la descripcion de la model card.
- Dependencia de un fichero `preprocessing.npz` externo con media y desviacion tipica especificas; sin el, las predicciones seran incorrectas.
- Sin data augmentation ni regularizacion documentada, lo que sugiere riesgo de sobreajuste y baja generalizacion.
- No es un modelo de lenguajes: no admite prompts, tool calling ni generacion de texto.
- Sesgos conocidos en CIFAR-10 (clases desbalanceadas, imagenes de baja resolucion) se heredan directamente.
- Riesgo de alucinacion no aplica; el riesgo principal es la clasificacion erronea sistematica en clases visualmente proximas (gato/perro, ciervo/caballo).
- No apto para produccion: sin versionado semantico, sin tests, sin documentacion de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/PuneethAbhishek/smai-a4-cifar10-mlp
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
