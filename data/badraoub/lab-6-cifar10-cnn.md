# Badraoub/lab-6-cifar10-cnn

## Resumen

`Badraoub/lab-6-cifar10-cnn` es un modelo de vision por computador publicado en Hugging Face por el usuario Badraoub, consistente en una red neuronal convolucional (CNN) entrenada desde cero sobre el conjunto de datos CIFAR-10. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un clasificador de imagenes de 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion) desarrollado en el contexto de una practica de laboratorio (Lab 6). El autor reporta una precision de test final del 88,34 %.

El modelo resuelve una tarea acotada y bien definida: clasificacion de imagenes RGB de 32x32 pixeles en una de las diez categorias de CIFAR-10. Su interes es principalmente didactico y de referencia: sirve como ejemplo reproducible de pipeline de entrenamiento de CNN (preprocesado con media y desviacion tipica especificas del dataset, normalizacion, entrenamiento supervisado) y como linea base para comparaciones en tareas de vision de baja resolucion.

La model card es practicamente una plantilla sin rellenar: la mayoria de los campos estandar (desarrollador, tipo de modelo, datos de entrenamiento, hiperparametros, evaluacion detallada) aparecen como "[More Information Needed]". La unica informacion tecnica concreta proviene de una seccion anadida al final titulada "CIFAR-10 CNN Image Classifier". No hay descargas ni likes en el momento de la consulta, y el repositorio no declara pipeline de inferencia en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con tres bloques convolucionales (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 32x32x3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades NLP) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |
| Entrada | imagenes RGB redimensionadas a 32x32, tensor `(Batch_Size, 3, 32, 32)` |
| Normalizacion | media `(0.4914, 0.4822, 0.4465)`, desviacion tipica `(0.2470, 0.2435, 0.2616)` |
| Clases de salida | 10 (Airplane, Automobile, Bird, Cat, Deer, Dog, Frog, Horse, Ship, Truck) |
| Precision reportada | 88,34 % en test |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional compuesta por tres bloques convolucionales, segun la descripcion de la model card. No se especifican el numero de filtros por capa, el tamano de kernel, el tipo de pooling, la presencia de capas fully connected finales, el uso de batch normalization o dropout, ni la funcion de activacion empleada. Tampoco se detalla el numero de parametros del modelo ni el tamano del checkpoint.

El entrenamiento se realizo sobre CIFAR-10, el conjunto estandar de 60.000 imagenes RGB de 32x32 pixeles dividido en 50.000 de entrenamiento y 10.000 de test, con 10 clases balanceadas. La model card no documenta el numero de epochs, el optimizador, la tasa de aprendizaje, el tamano de batch, el regimen de precision (fp32, fp16, bf16) ni si se aplico aumento de datos. Tampoco se indica si hubo validacion cruzada o busqueda de hiperparametros. No se menciona ninguna innovacion tecnica adicional (attention, decodificacion especulativa, tecnicas de regularizacion especificas) mas alla del pipeline estandar de preprocesado y normalizacion descrito.

## Capacidades

- Clasificacion de imagenes RGB de 32x32 pixeles en 10 categorias de CIFAR-10.
- Preprocesado integrado documentado: redimensionado a 32x32, conversion a tensor PyTorch y normalizacion con estadisticos de CIFAR-10.
- Inferencia por lotes mediante tensor de forma `(Batch_Size, 3, 32, 32)`.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision de alta resolucion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, audio ni modalidades adicionales.

## Casos de uso

- Docencia y aprendizaje de vision por computador: el modelo sirve como ejemplo completo de pipeline CNN sobre CIFAR-10, util en asignaturas de deep learning para ilustrar preprocesado, normalizacion y evaluacion.
- Linea base en experimentos de clasificacion de imagenes de baja resolucion: con un 88,34 % de precision en test, puede usarse como referencia contra la que comparar arquitecturas mas modernas (ResNet, ViT) en el mismo dataset.
- Clasificacion rapida de miniaturas o iconos de 32x32 en aplicaciones de demo: por ejemplo, prototipos de etiquetado automatico de imagenes pequenas en entornos controlados.
- Pruebas de integracion de modelos PyTorch en Hugging Face Hub: el repositorio puede emplearse para validar flujos de carga, versionado y despliegue de pesos de vision.
- Experimentos de destilacion o compresion: al ser una CNN pequena y entrenada desde cero, es candidata a servir como alumno o profesor en estudios de pruning y cuantizacion.
- Evaluacion de robustez y sesgo en vision: permite estudiar como se comporta una CNN estandar ante imagenes corruptas, cambios de iluminacion o clases ambiguas dentro de CIFAR-10.
- Reproducibilidad de practicas de laboratorio: util para verificar resultados de un ejercicio academico concreto y comparar con otras implementaciones del mismo dataset.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Precision en test (CIFAR-10) | 88,34 % | Reportada por el autor en la model card |

No se han publicado resultados de benchmarks adicionales (por clase, matriz de confusion, ablaciones) en la informacion disponible. Tampoco se aportan comparaciones con otras arquitecturas en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al ser una CNN de tres bloques convolucionales sobre entradas de 32x32, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer (incluso en CPU para inferencia por lotes pequenos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar la inferencia sin problemas, aunque el modelo no aprovechara su capacidad.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en GPUs integradas para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (carga de pesos y `model.eval()`), TorchScript, ONNX Runtime, o servir mediante FastAPI/Flask. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Dado el tamano reducido de la entrada y de la red, se espera latencia de milisegundos por lote en GPU y throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Badraoub/lab-6-cifar10-cnn | CNN (3 bloques) | no disponible | 88,34 % | apache-2.0 | Hugging Face |
| ResNet-18 (referencia CIFAR-10) | CNN residual | ~11,2 M | no disponible en esta ficha | variable | Amplia |
| VGG-11 (referencia CIFAR-10) | CNN | ~132 M | no disponible en esta ficha | variable | Amplia |
| ViT-Small (referencia CIFAR-10) | Transformer de vision | ~22 M | no disponible en esta ficha | variable | Amplia |

No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa rigurosa. La comparativa anterior es meramente estructural y de categoria; los valores de parametros de las alternativas son orientativos y no proceden de la model card.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no documenta datos de entrenamiento, hiperparametros, regimen de precision ni evaluacion detallada, lo que dificulta la reproducibilidad.
- No se especifican sesgos conocidos; al entrenar sobre CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (por ejemplo, ambiguedad entre clases como gato/perro o ciervo/caballo).
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si existe riesgo de clasificacion erronea en imagenes fuera de distribucion o de baja calidad.
- Limitacion severa de resolucion: solo acepta imagenes de 32x32 pixeles; no es adecuado para imagenes de alta resolucion sin redimensionado previo, que degrada la precision.
- Limitacion de dominio: entrenado exclusivamente en las 10 clases de CIFAR-10; no generaliza a otras categorias.
- No soporta texto ni tareas NLP; no debe presentarse como modelo de lenguaje.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero se recomienda verificar la procedencia de los pesos y del dataset CIFAR-10 (licencia del dataset no indicada en la model card).
- Ausencia de pipeline declarado en Hugging Face: la carga directa mediante `pipeline()` puede no funcionar sin especificar manualmente la arquitectura.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de calidad mas alla de la cifra reportada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Badraoub/lab-6-cifar10-cnn
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
- Plantilla original de model card: https://github.com/huggingface/huggingface_hub/blob/main/src/huggingface_hub/templates/modelcard_template.md
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
