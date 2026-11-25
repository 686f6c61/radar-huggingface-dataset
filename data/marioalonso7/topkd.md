# MarioAlonso7/topkd

## Resumen

`MarioAlonso7/topkd` es un modelo de clasificacion de imagenes de tipo ResNet-8 (78 000 parametros) para CIFAR-100, obtenido mediante poda de profundidad de un ResNet-20 preentrenado y posterior reentrenamiento. Lo publica el autor MarioAlonso7 como parte de TopKD-imat, un proyecto universitario que aplica destilacion de conocimiento topologico (TopKD, Kim et al., ICML 2024) sobre CIFAR-10. El modelo actua como estudiante preentrenado en ese flujo experimental.

El problema que resuelve es concreto y acotado: proporcionar una red convolucional pequena (ResNet-8 con 16, 32 y 64 canales por etapa) que sirva como punto de partida preentrenado en CIFAR-100 para experimentos de destilacion y poda, en lugar de entrenar desde cero. Sobre CIFAR-100 alcanza un 57,45 % de top-1, frente al 52,88 % de la misma arquitectura entrenada desde pesos aleatorios con la misma receta.

Es relevante por su caracter didactico y reproducible: documenta el proceso completo de poda, reentrenamiento y evaluacion, con semilla fija, hiperparametros explicitos y comparaciones controladas. No es un modelo de proposito general ni un modelo de lenguaje: es un clasificador de imagenes de 32x32 pixeles con licencia BSD 3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-8 para CIFAR (CNN residual, un BasicBlock por etapa, canales 16/32/64) |
| Parametros totales | 78 000 (78 k) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en precision original PyTorch) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BSD 3-Clause |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |
| Entrada | imagenes 3x32x32 normalizadas con media (0.5070, 0.4865, 0.4409) y desviacion (0.2673, 0.2564, 0.2761) |
| Salida | 100 clases (CIFAR-100) |
| Dataset | CIFAR-100 |
| Metrica | accuracy (top-1) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet de CIFAR con tres etapas de 16, 32 y 64 canales y un unico BasicBlock por etapa, lo que da un total de 8 capas con pesos (ResNet-8). Se obtuvo por poda de profundidad del ResNet-20 de CIFAR-100 publicado por chenyaofo/pytorch-cifar-models (68,83 % top-1), conservando solo el primer BasicBlock de cada etapa. La poda directa degrada la precision hasta el 1,29 %, por lo que fue necesario reentrenar.

El reentrenamiento se hizo sobre CIFAR-100 durante 30 epocas con SGD (momentum 0.9, weight decay 5e-4), learning rate 0.05 con decaimiento coseno, batch de 128, random crop con padding 4 y flip horizontal, semilla 0, en una unica RTX 2060. El modelo resultante alcanza 57,45 % de top-1 en test de CIFAR-100. El autor indica que la red nunca ha visto CIFAR-10; como punto de partida para esa tarea (nueva cabeza de 10 clases, solo entropia cruzada, 30 epocas) llega al 85,63 %, frente al 83,17 % de la misma arquitectura desde pesos aleatorios. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion, por tratarse de un clasificador.

## Capacidades

- Clasificacion de imagenes de 32x32 pixeles en 100 categorias de CIFAR-100.
- Extraccion de caracteristicas visuales de baja resolucion mediante las tres etapas convolucionales.
- Punto de partida preentrenado para fine-tuning en tareas de 10 clases (validado en CIFAR-10 con 85,63 % top-1).
- Estudiante preentrenado para pipelines de destilacion de conocimiento (incluida TopKD) y experimentos de poda.
- Carga directa como `state_dict` en la clase `CifarResNet` de chenyaofo o en `topkd_imat.models.cifar_resnet(8, num_classes=100)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision de alta resolucion, audio ni generacion de texto.

## Casos de uso

- Experimentos academicos de destilacion de conocimiento: el modelo sirve como estudiante preentrenado en CIFAR-100 dentro del flujo TopKD-imat, reduciendo el coste de entrenamiento frente a partir de pesos aleatorios (57,45 % frente a 52,88 %).
- Investigacion en poda de redes: permite reproducir el pipeline de poda de profundidad de ResNet-20 a ResNet-8 y comparar el impacto del reentrenamiento (1,29 % tras poda frente a 57,45 % tras reentrenamiento).
- Fine-tuning rapido en CIFAR-10: con una nueva cabeza de 10 clases y 30 epocas de entropia cruzada alcanza 85,63 %, util como baseline en trabajos de clasificacion de baja resolucion.
- Docencia y practicas universitarias: su tamano (78 k parametros) y su entrenamiento en una sola RTX 2060 lo hacen viable en laboratorios con hardware limitado.
- Prototipado de clasificadores embebidos: la huella de 78 k parametros permite desplegarlo en dispositivos con recursos muy restringidos para tareas de vision de baja resolucion.
- Baseline de referencia en comparativas de eficiencia: sirve para medir la relacion entre reduccion de parametros y perdida de precision frente al ResNet-20 original (68,83 %).

## Benchmarks y rendimiento

| Modelo | CIFAR-100 test top-1 | CIFAR-10 test top-1 (fine-tuning 30 epocas) |
|---|---|---|
| Este modelo (ResNet-8 podado y reentrenado) | 57,45 % | 85,63 % |
| ResNet-8 desde pesos aleatorios, misma receta | 52,88 % | 83,17 % |
| ResNet-20 de chenyaofo (origen de la poda) | 68,83 % | no disponible |
| ResNet-8 tras poda sin reentrenar | 1,29 % | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 78 k parametros en precision de 32 bits los pesos ocupan aproximadamente 0,3 MB, por lo que el cuello de botella es el framework, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entreno en una RTX 2060.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, y tambien en CPU sin problema practico.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`), exportacion a TorchScript u ONNX (no documentada por el autor), o integracion en `topkd_imat.models.cifar_resnet`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-8 podado) | 78 k | CIFAR-100 | 57,45 % | BSD 3-Clause | Hugging Face |
| ResNet-20 de chenyaofo | no disponible en la informacion | CIFAR-100 | 68,83 % | BSD 3-Clause | GitHub / Hugging Face |
| ResNet-8 desde pesos aleatorios | 78 k | CIFAR-100 | 52,88 % | no aplica (entrenamiento propio) | receta reproducible |

No se dispone de datos de otros modelos comparables (por ejemplo, MobileNet o VGG reducidos para CIFAR) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un clasificador de imagenes de 32x32 pixeles; no procesa imagenes de mayor resolucion sin redimensionado y no es un modelo de lenguaje.
- Solo reconoce las 100 clases de CIFAR-100; fuera de esa distribucion la salida no es fiable.
- Precision modesta (57,45 % top-1), muy por debajo del ResNet-20 de origen (68,83 %); la poda de profundidad tiene un coste claro.
- Riesgo de sobreajuste a las estadisticas de CIFAR-100; el autor no documenta evaluaciones de robustez ni de sesgo.
- No se han publicado analisis de sesgos, alucinacion (no aplica en sentido estricto) ni comportamiento fuera de distribucion.
- La licencia BSD 3-Clause permite uso comercial, pero obliga a conservar los avisos de copyright de chenyaofo (2021) y de torchvision (Soumith Chintala, 2016).
- El modelo se distribuye como `state_dict`, no como repositorio completo; requiere cargar la clase `CifarResNet` correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- No se documentan tecnicas de cuantizacion ni formatos alternativos (GGUF, ONNX) para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/MarioAlonso7/topkd
- Repositorio TopKD-imat: https://github.com/JES0406/TopKD-imat
- Modelos CIFAR de chenyaofo: https://github.com/chenyaofo/pytorch-cifar-models
- Paper TopKD (Kim et al., ICML 2024): no disponible en la informacion proporcionada
