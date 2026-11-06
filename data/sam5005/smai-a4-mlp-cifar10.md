# Sam5005/smai-a4-mlp-cifar10

## Resumen

`smai-a4-mlp-cifar10` es un perceptron multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10, publicado en Hugging Face por el usuario Sam5005 en el contexto de la asignatura SMAI (aparentemente un trabajo academico, A4, atribuido a "samaksh.ujjawal"). No se trata de un modelo de lenguaje ni de un modelo generativo: es un clasificador de imagenes de 32x32x3 en 10 categorias, con una arquitectura completamente conectada de cuatro capas (3072 -> 512 -> 256 -> 128 -> 10) y activacion ReLU en las capas ocultas.

El modelo resuelve exclusivamente la tarea de clasificacion multiclase sobre CIFAR-10, alcanzando una precision de test de 0,5360 sobre las 10.000 imagenes del split de evaluacion. Los pesos se distribuyen en un fichero `model.npz` en formato NumPy (no safetensors ni GGUF), con la convencion de que las matrices `W` tienen forma `(in, out)` y los logits se calculan como `h @ W + b`.

Su relevancia es limitada fuera del ambito docente: no dispone de model card completa, no declara licencia, no tiene descargas ni likes, y el repositorio ocupa 0,0 GB (lo esperable para un MLP de este tamano, del orden de 1,7 millones de parametros). Resulta util como referencia de implementacion basica de un MLP en NumPy y como baseline de CIFAR-10, pero no como componente para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) completamente conectado, activacion ReLU en capas ocultas, salida identidad con 10 logits |
| Parametros totales | no disponible (estimado a partir de la topologia 3072-512-256-128-10: ~1,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.npz` en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz`), con `preprocessing.npz` para media y desviacion tipica |

## Arquitectura y entrenamiento

La red tiene la topologia 3072 -> 512 -> 256 -> 128 -> 10. La entrada es la imagen CIFAR-10 aplanada en orden HWC (32x32x3 = 3072), normalizada dividiendo por 255 y restando la media y dividiendo por la desviacion tipica almacenadas en `preprocessing.npz`. Las tres capas ocultas usan ReLU y la capa de salida es identidad, produciendo 10 logits (uno por clase). No hay convoluciones, dropout, normalizacion por lotes ni conexiones residuales: es un MLP puro.

El entrenamiento se realizo con descenso de gradiente estocastico (SGD), tasa de aprendizaje 0,02, tamano de lote 64, 100 epocas, etiquetas limpias (sin augmentacion ni ruido) y semilla 2013. La inicializacion es N(0, 2/n_in) para la primera capa (justificada por ReLU) y N(0, 1/n_in) para el resto, con sesgos a cero. No se menciona regularizacion, early stopping, aumento de datos ni ajuste fino posterior; tampoco se documenta el numero exacto de tokens (no aplica) ni el desglose del dataset mas alla de "clean labels". La innovacion tecnica es nula: se trata de un ejercicio academico de implementacion.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia en NumPy puro mediante la operacion `logits = h @ W + b`; no requiere framework de deep learning.
- Reproducibilidad determinista dada la semilla 2013 y el pipeline de preprocesado documentado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion.

## Casos de uso

- Docencia de aprendizaje automatico: sirve como ejemplo minimo y reproducible de un MLP implementado con NumPy, util para explicar retropropagacion, inicializacion y normalizacion de entrada en un curso introductorio.
- Baseline de clasificacion en CIFAR-10: permite comparar arquitecturas convolucionales o transformers de vision contra un MLP simple con precision de test de 0,5360.
- Verificacion de pipelines de preprocesado: el par `model.npz` + `preprocessing.npz` permite validar que una implementacion de inferencia reproduce exactamente la precision declarada sobre el split de test.
- Prototipado rapido en entornos sin GPU: al ser NumPy puro, se puede ejecutar en CPU en cualquier maquina para clasificar lotes pequenos de imagenes de 32x32.
- Pruebas de integracion de formatos: util para comprobar cargadores de `.npz` y conversores a otros formatos (por ejemplo, exportar a ONNX) en un pipeline de MLOps.
- Experimentos de cuantizacion y compresion: por su tamano reducido, sirve para medir el impacto de cuantizar pesos de un clasificador pequeno sin incurrir en costes de infraestructura.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,5360 | Sobre 10.000 imagenes de test, segun la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no aplican a un clasificador de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo completo en coma flotante de 32 bits ocupa del orden de 7 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU (GTX 1050, RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, pero el cuello de botella sera el pipeline de datos, no el calculo.
- Cabe en GPU consumer: si, en todas; tambien en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: NumPy directamente (formato nativo), conversion manual a ONNX, PyTorch o TensorFlow; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la topologia, la inferencia por imagen es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp-cifar10 | ~1,7 M (estimado) | no aplica | 0,5360 en CIFAR-10 test | no disponible | Hugging Face (`Sam5005/smai-a4-mlp-cifar10`) |
| LeNet-5 (1998) | ~60 K | no aplica | ~0,70 en CIFAR-10 (referencia historica) | no disponible | Multiples implementaciones publicas |
| ResNet-20 (2016) | ~0,27 M | no aplica | ~0,91 en CIFAR-10 | MIT (implementaciones comunes) | Multiples repositorios |
| ViT pequeno en CIFAR-10 | variable | no aplica | ~0,90+ con preentrenamiento | variable | Hugging Face |

Las cifras de LeNet-5, ResNet-20 y ViT son referencias generales de la literatura y no proceden de la informacion proporcionada; se incluyen solo como orientacion cualitativa. No se dispone de comparativas oficiales publicadas por el autor.

## Limitaciones y advertencias

- Precision de test de 0,5360: muy por debajo de arquitecturas convolucionales modernas (ResNet-20 supera el 0,90), lo que limita su uso practico.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Sin model card completa: no se documentan sesgos, composicion del dataset mas alla de CIFAR-10, ni evaluaciones adicionales.
- Entrenado con etiquetas limpias y sin augmentacion: sensible a variaciones de iluminacion, oclusiones y dominios distintos de CIFAR-10.
- Formato `.npz` no estandar en el ecosistema de inferencia: requiere conversion manual para integrarse en servidores de modelos.
- Sin soporte de texto, tool calling ni agentes: no es un modelo de lenguaje y no debe evaluarse como tal.
- Riesgo de alucinacion no aplica; el riesgo principal es la confusion entre clases visualmente similares (gato/perro, ciervo/caballo) y la baja calibracion de los logits.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; la reproducibilidad depende de la semilla 2013 y del pipeline de preprocesado documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Sam5005/smai-a4-mlp-cifar10
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
