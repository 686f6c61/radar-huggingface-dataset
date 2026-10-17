# BurnyCoder/oscillatory-flow-matching-mnist

## Resumen

Oscillatory flow matching: mnist es un artefacto de investigacion publicado en HuggingFace por el usuario BurnyCoder. No se trata de un modelo de lenguaje ni de un modelo generativo de proposito general, sino de un conjunto de checkpoints experimentales para generacion incondicional de imagenes sobre el conjunto de datos MNIST (digitos manuscritos en escala de grises de 28x28 pixeles). El pipeline declarado es `unconditional-image-generation` y la licencia es MIT.

El interes del repositorio es metodologico: compara un esquema de flow matching en el que se sustituye el transformer por una red neuronal oscilatoria (ONN, del ingles oscillatory neural network). Las rutas de los checkpoints revelan al menos tres variantes de estudio sobre MNIST: una convolucional (`mnist-conv-s101`), una basada en Diffusion Transformer (`mnist-dit-s101`) y una basada en red oscilatoria (`mnist-onn-s101`), ademas de dos ejecuciones de control o humo (`checks/mnist-smoke` y `study/checks/fixed-batch`). La comparacion contra una linea base tipo DiT es precisamente la que permite valorar si la alternativa oscilatoria es competitiva.

Se trata de un repositorio muy pequeno (0,1 GB en total, repartido entre cinco directorios de ejecucion) y sin traccion publica: cero descargas y cero likes en el momento de redactar esta ficha. Es, por tanto, material de reproduccion de un estudio, no un modelo listo para produccion. No se han publicado en la informacion disponible ni el numero de parametros, ni la arquitectura exacta, ni resultados cuantitativos de calidad de muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La estructura del repositorio indica variantes convolucional, DiT (Diffusion Transformer) y ONN (red neuronal oscilatoria) dentro de un esquema de flow matching |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion incondicional de imagenes, sin entrada de texto) |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos en safetensors, presumiblemente en el precision original de entrenamiento, pero no se declara |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, mas checkpoint original por cada ejecucion |
| Pipeline declarado | unconditional-image-generation |
| Dominio de datos | MNIST (digitos manuscritos, 28x28, escala de grises) |
| Tamano del repositorio | 0,1 GB |
| Subdirectorios de ejecucion | checks/mnist-smoke, study/checks/fixed-batch, study/pilot/mnist-conv-s101, study/pilot/mnist-dit-s101, study/pilot/mnist-onn-s101 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle; se limita a enlazar el estudio de origen alojado en GitHub con el titulo "flow matching with oscillatory neural networks instead of transformer". De esa denominacion y de los nombres de los subdirectorios se deduce que el trabajo sustituye el bloque transformer habitual de un modelo de flow matching por una red neuronal oscilatoria, y que la evaluacion se hace sobre MNIST con al menos una linea base convolucional y una linea base DiT. Cualquier afirmacion mas concreta sobre el numero de capas, el tipo de acoplamiento oscilatorio, el scheduler de entrenamiento o la funcion de perdida excede lo publicado y no se incluye aqui.

Tampoco hay informacion disponible sobre el volumen de tokens o muestras de entrenamiento, la composicion del dataset (mas alla de MNIST), ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, que en cualquier caso no son habituales en generacion de imagenes. El autor advierte explicitamente de que cada subdirectorio contiene su propia model card, configuracion exacta, pesos de inferencia seguros, checkpoint original, registros y manifiesto de artefactos, y pide consultar el estado de cada ejecucion antes de interpretar resultados. Esa advertencia sugiere que parte de las ejecuciones son pruebas de humo o pilotos, no resultados finales.

## Capacidades

- Generacion incondicional de imagenes: produce muestras de digitos manuscritos con la distribucion de MNIST, sin condicionamiento por texto, clase o etiqueta.
- Modelado generativo basado en flow matching: aprende un campo de velocidad que transporta ruido hacia datos mediante integracion de una ecuacion diferencial ordinaria.
- Comparacion arquitectonica: los checkpoints permiten contrastar el comportamiento de un bloque convolucional, un bloque transformer (DiT) y un bloque oscilatorio (ONN) bajo el mismo esquema generativo.
- Reproduccion de investigacion: cada directorio incluye configuracion, registros y manifiesto de artefactos, lo que facilita reejecutar o auditar el experimento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo de pensamiento (thinking mode), vision general, audio ni salidas multimodales.
- No es un modelo de difusion con condicionamiento por clase; no se ha documentado interpolacion guiada, control de estilo ni edicion de imagenes.

## Casos de uso

- Reproduccion de resultados academicos: cargar cada checkpoint con su configuracion declarada y regenerar las muestras del estudio para verificar las cifras publicadas en el repositorio de origen. Es adecuado porque el repositorio incluye registros, configuracion exacta y manifiesto de artefactos por ejecucion.
- Estudio comparativo de arquitecturas generativas: entrenar o evaluar las variantes convolucional, DiT y ONN sobre el mismo dataset y con el mismo numero de pasos para aislar el efecto del bloque oscilatorio. MNIST actua aqui como banco de pruebas controlado y de bajo coste.
- Docencia sobre flow matching: usar los checkpoints como ejemplo minimo y ejecutable de un pipeline de flow matching, incluyendo la integracion del ODE y el muestreo por pasos, sin la barrera computacional de un modelo de imagenes a gran escala.
- Pruebas de integracion y humo en pipelines de generacion: el directorio `checks/mnist-smoke` sirve como caso de prueba rapido para validar que un nuevo entorno, una version de libreria o un contenedor son capaces de cargar pesos safetensors y producir salida.
- Perfilado y benchmarking de hardware: al ser un modelo de escala minima, permite medir latencia de muestreo, overhead de carga de safetensors o comportamiento de kernels en GPUs de gama de entrada sin cuellos de botella de memoria.
- Validacion de tecnicas de compresion y cuantizacion: es un banco de pruebas barato para comprobar si un esquema de cuantizacion degrada la calidad de muestra antes de aplicarlo a un modelo mayor.
- Generacion de datos sinteticos para clasificadores de digitos: las muestras pueden usarse como aumento de datos en experimentos de clasificacion, siempre que se valide que no introducen sesgos de distribucion frente al MNIST original.
- Prototipado de integradores y schedulers: comparar distintos solvers numericos del ODE de flow matching y medir su efecto en la calidad de muestra con un coste por iteracion muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del estudio en GitHub como fuente de las cifras, pero no reproduce ninguna tabla de metricas (FID, IS, precision/recall de muestras ni metricas de reconstruccion) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. A partir del tamano del repositorio (0,1 GB repartido entre cinco ejecuciones), es razonable inferir que cada checkpoint individual ocupa decenas de megabytes y que la inferencia cabe holgadamente por debajo de 1 GB de VRAM, incluso en fp32. Esta cifra es una estimacion por tamano de artefacto, no un dato publicado.
- GPU recomendadas: no se especifica ninguna en la informacion disponible. Dada la escala, cualquier GPU con soporte CUDA o incluso ROCm deberia ser suficiente, y la ejecucion en CPU es probablemente viable.
- GPU de consumo: si, cualquier GPU de consumo reciente deberia poder ejecutar la inferencia. No se ha documentado compatibilidad con Apple Silicon ni con aceleradores especificos.
- Opciones de despliegue: no se documenta ninguna integracion con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de generacion de imagenes. El consumo esperado es mediante carga directa de safetensors desde PyTorch o el framework usado en el repositorio de origen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo ni para alternativas comparables en la informacion proporcionada, por lo que una comparativa cuantitativa fiable no es posible. Como contexto, la unica comparacion documentada es interna al propio repositorio, entre sus tres variantes de estudio:

| Variante | Directorio | Tipo de bloque (inferido del nombre) | Datos publicados |
|---|---|---|---|
| MNIST ONN | study/pilot/mnist-onn-s101 | Red neuronal oscilatoria | No disponible |
| MNIST DiT | study/pilot/mnist-dit-s101 | Diffusion Transformer | No disponible |
| MNIST Conv | study/pilot/mnist-conv-s101 | Convolucional | No disponible |
| Smoke test | checks/mnist-smoke | No especificado | No disponible |
| Batch fijo | study/checks/fixed-batch | No especificado | No disponible |

Frente a modelos externos de generacion de imagenes (Stable Diffusion y familia, modelos de difusion condicionados por clase como los entrenados sobre CIFAR-10 o ImageNet), la comparacion no tiene sentido por dominio, resolucion y finalidad: este repositorio no persigue calidad fotografica, sino servir de banco de pruebas controlado para una pregunta arquitectonica concreta.

## Limitaciones y advertencias

- Alcance minimo: el modelo trabaja exclusivamente con MNIST a 28x28 en escala de grises. No genera imagenes de otra naturaleza, resolucion o dominio.
- Sin condicionamiento: al ser generacion incondicional, no permite elegir la clase del digito ni guiar el estilo de la muestra con texto o etiquetas.
- Estado experimental: los propios nombres de los directorios (`checks`, `pilot`, `smoke`) indican que varias ejecuciones son pruebas y no resultados consolidados. El autor pide consultar el estado de cada una antes de interpretar resultados.
- Ausencia de metricas: no hay FID, IS ni ninguna otra medida publicada en el material disponible, por lo que no es posible afirmar nada sobre la calidad de las muestras.
- Riesgo de sobreinterpretacion: extrapolar conclusiones de MNIST a arquitecturas a gran escala es metodologicamente arriesgado y no esta respaldado por el repositorio.
- Datos de entrenamiento: no se documenta composicion del dataset ni posibles sesgos de la distribucion de entrenamiento mas alla del propio MNIST.
- Alucinacion: el concepto no aplica al tratarse de un generador de imagenes incondicional, pero si aplica la posibilidad de producir muestras que no se correspondan con digitos plausibles, algo esperable en un modelo de esta escala.
- Licencia: MIT, permisiva y compatible con uso comercial, pero conviene revisar la licencia del checkpoint original y de los datos de MNIST en cada subdirectorio antes de un uso en produccion.
- Mantenimiento: cero descargas y cero likes en la fecha de publicacion, sin evidencia de mantenimiento posterior ni de comunidad que reporte errores.
- Reproducibilidad: sin acceso al contenido de cada subdirectorio en la informacion disponible, no se puede garantizar que los pesos safetensors publicados coincidan con los resultados de las model cards internas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist
- Repositorio del estudio de origen: https://github.com/BurnyCoder/flow-matching-with-oscillatory-neural-networks-instead-of-transformer
- Model card interna, smoke test MNIST: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist/blob/main/checks/mnist-smoke/README.md
- Model card interna, batch fijo: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist/blob/main/study/checks/fixed-batch/README.md
- Model card interna, variante convolucional: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist/blob/main/study/pilot/mnist-conv-s101/README.md
- Model card interna, variante DiT: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist/blob/main/study/pilot/mnist-dit-s101/README.md
- Model card interna, variante ONN: https://huggingface.co/BurnyCoder/oscillatory-flow-matching-mnist/blob/main/study/pilot/mnist-onn-s101/README.md

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo. Los unicos enlaces utiles son los declarados en la propia model card del autor.
