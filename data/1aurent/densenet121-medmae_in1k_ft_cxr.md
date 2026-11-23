# 1aurent/densenet121.medmae_in1k_ft_CXR

## Resumen

DenseNet-121 es una red neuronal convolucional publicada originalmente por Huang et al. (2017) dentro de la familia DenseNet, caracterizada por conexiones densas entre capas que concatenan las salidas de todas las capas anteriores. El checkpoint `1aurent/densenet121.medmae_in1k_ft_CXR` es una adaptacion concreta de esa arquitectura, distribuida por el usuario de Hugging Face `1aurent`, que parte del backbone DenseNet-121 preentrenado con la receta `medmae_in1k` (un esquema de preentrenamiento de inspiracion Masked Autoencoder aplicado sobre datos medicos, segun indica el propio nombre del checkpoint) y posteriormente se ajusta de forma supervisada para clasificacion de radiografias de torax (CXR, chest X-ray).

El modelo no es un modelo de lenguaje ni un transformer generativo: es un clasificador de imagenes de ~7,05 millones de parametros (7.051.854 segun los pesos en safetensors), empaquetado en formato `timm` y con licencia Apache 2.0. Su relevancia radica en que ejemplifica el patron de reutilizacion de backbones convolucionales ligeros para tareas medicas de clasificacion, con un coste computacional muy bajo y una integracion directa en pipelines de `timm`/`torchvision`.

La informacion publica disponible es muy escasa: la model card es practicamente un esqueleto (titulo y metadatos), no se documentan clases de salida, dataset de ajuste fino, metricas ni procedimiento de entrenamiento. Cualquier uso en produccion exige, por tanto, validacion y documentacion adicionales por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN DenseNet-121 (conexiones densas, bloque convolucional) |
| Parametros totales | 7.051.854 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision de entrenamiento; cuantizacion INT8/FP16 posible via PyTorch, no documentada) |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de salida no documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

La arquitectura es DenseNet-121: un tronco convolucional con cuatro bloques densos en los que cada capa recibe como entrada las concatenaciones de las salidas de todas las capas previas del mismo bloque, con transiciones de reduccion espacial entre bloques, y una cabeza de clasificacion lineal sobre pooling global. Esta topologia favorece la reutilizacion de caracteristicas y reduce el numero de parametros frente a alternativas de profundidad comparable, lo que explica sus ~7 millones de parametros.

Segun el identificador del checkpoint, el backbone se preentreno con la receta `medmae_in1k` (preentrenamiento auto-supervisado tipo masked autoencoder sobre datos medicos de entrada de 1k, segun la convencion de nombres) y despues se ajusto de forma supervisada para clasificacion de radiografias de torax (`ft_CXR`). No se dispone de informacion publica sobre el numero de imagenes de ajuste fino, la composicion del dataset, el numero de clases, la resolucion de entrada ni si se aplicaron tecnicas adicionales (aumento de datos, balanceo de clases, calibracion). Tampoco se documenta el proceso de preentrenamiento `medmae_in1k` en la model card.

## Capacidades

- Clasificacion de imagenes de radiografia de torax (CXR) mediante una cabeza de clasificacion sobre el backbone DenseNet-121.
- Extraccion de caracteristicas visuales intermedias (embeddings del tronco convolucional) reutilizables para tareas derivadas: deteccion de hallazgos, segmentacion con cabezas adicionales o clasificacion multi-etiqueta.
- Inferencia ligera en CPU o GPU de gama baja, adecuada para entornos con recursos limitados.
- Integracion nativa con `timm` (creacion del modelo, carga de pesos, transformaciones de preprocesado estandar).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo ni matematicas: es exclusivamente un modelo de vision.
- Capacidades multilingues: no aplica.
- No se documentan modos especiales (thinking, vision-lenguaje, audio).

## Casos de uso

- Triaje radiologico de apoyo: usar el clasificador como primer filtro sobre radiografias de torax para priorizar estudios con hallazgos, dado su bajo coste de inferencia y su tamano reducido.
- Preprocesado en pipelines de investigacion clinica: generar etiquetas o embeddings para agrupar y estratificar cohortes de imagenes antes de analisis estadisticos.
- Extraccion de caracteristicas para modelos downstream: congelar el tronco DenseNet-121 y entrenar cabezas ligeras para tareas especificas (deteccion de neumotorax, cardiomegalia, etc.), aprovechando el preentrenamiento medico del backbone.
- Prototipado rapido en entornos con GPU consumer: al tener ~7 millones de parametros, cabe en cualquier GPU moderna e incluso en CPU para lotes pequenos, lo que facilita experimentos iterativos.
- Educacion y docencia: ejemplo didactico de transferencia de aprendizaje desde un backbone preentrenado en dominio medico a una tarea de clasificacion concreta.
- Despliegue embebido o en el borde: por su tamano, puede ejecutarse en dispositivos con poca memoria (Raspberry Pi, mini-PC) para preclasificacion local sin enviar imagenes a la nube.
- Baseline en estudios comparativos: servir como referencia convolucional ligera frente a modelos ViT o híbridos en evaluaciones de clasificacion de CXR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para lotes pequenos (7 millones de parametros, ~28 MB de pesos); en FP16, ~14 MB de pesos mas activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100/H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar inferencia en tiempo real para lotes moderados.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos, y en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `timm` + PyTorch (referencia), exportacion a ONNX Runtime, TorchScript, o conversion a TensorRT para latencia minima. No aplica `vLLM`, `llama.cpp` ni `Ollama` (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/densenet121.medmae_in1k_ft_CXR` | 7,05 M | no disponible (imagen) | Clasificacion CXR | Apache 2.0 | Hugging Face (`timm`) |
| DenseNet-121 ImageNet (torchvision) | ~7,98 M | 224x224 | Clasificacion ImageNet | BSD-3 | torchvision |
| ResNet-50 (torchvision) | ~25,6 M | 224x224 | Clasificacion ImageNet | BSD-3 | torchvision |
| ViT-B/16 (timm) | ~86 M | 224x224 | Clasificacion ImageNet | Apache 2.0 | Hugging Face (`timm`) |

La comparativa es aproximada: no hay datos publicados de rendimiento del checkpoint frente a alternativas en tareas CXR, por lo que la eleccion entre estos modelos debe basarse en validacion propia sobre el dataset objetivo.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan clases de salida, dataset de ajuste fino, metricas ni procedimiento de entrenamiento; el uso en produccion requiere validacion independiente.
- Riesgo de sesgo: al no conocerse la composicion del dataset de ajuste fino, no puede evaluarse el sesgo por sexo, edad, etnia, equipo radiologico o institucion; es un riesgo alto en aplicaciones clinicas.
- Riesgo de alucinacion/clasificacion erronea: como todo clasificador, puede producir falsos positivos y falsos negativos; no debe usarse como unico criterio diagnostico.
- Limitaciones de idioma: no aplica directamente, pero las etiquetas de salida no estan documentadas y podrian estar en ingles o en un formato no estandar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso medico puede estar sujeto a regulacion adicional (MDR en la UE, FDA en EE. UU.) que exige validacion clinica y marcado CE/FDA; la licencia del modelo no cubre esos requisitos.
- Caveat de produccion: el checkpoint esta pensado para investigacion; no hay garantias de calibracion, robustez ante distribuciones desplazadas (distintos equipos, resoluciones o protocolos) ni de comportamiento ante clases no vistas.
- Fecha de actualizacion del repo (2026-11-23) posterior a la de creacion (2023-11-28); no se documenta que cambios se introdujeron.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/densenet121.medmae_in1k_ft_CXR
- Paper original de DenseNet: https://arxiv.org/abs/1608.06993
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Repositorio `torchvision` (DenseNet-121): https://github.com/pytorch/vision
- Perfil del autor en Hugging Face: https://huggingface.co/1aurent
