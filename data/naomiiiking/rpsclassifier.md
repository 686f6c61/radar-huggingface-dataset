# naomiiiking/RPSClassifier

## Resumen

RPSClassifier es un modelo de vision por computador desarrollado por el usuario naomiiiking como parte de su curso PyTorch Fundamentals (LFD2000). Se trata de un clasificador de imagenes de manos que distingue entre tres gestos del juego piedra-papel-tijera (paper, scissors, rock). El modelo se publica con pipeline de object-detection en HuggingFace, aunque la model card lo describe funcionalmente como un clasificador de imagenes de tres clases.

El modelo es de escala muy reducida: cuenta con 23.779 parametros totales segun los pesos en safetensors, lo que lo situa en el rango de los modelos de juguete o de demostracion educativa. No se dispone de informacion sobre la arquitectura exacta, el dataset de entrenamiento, la longitud de contexto (no aplica en vision) ni los idiomas soportados. Su relevancia es limitada fuera del ambito docente: sirve como ejemplo practico de entrenamiento, evaluacion (matriz de confusion, precision y recall) y despliegue de un modelo TorchVision.

La licencia MIT permite uso comercial y modificacion, pero el propio autor indica que su proposito es educativo. No hay resultados de benchmarks publicados mas alla de la exactitud de test reportada en la model card (94,62%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TorchVision; arquitectura concreta no especificada) |
| Parametros totales | 23.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo TorchVision, pero no especifica la arquitectura concreta (ResNet, MobileNet, EfficientNet u otra). El numero de parametros (23.779) es extremadamente bajo para una CNN estandar de TorchVision, lo que sugiere una red muy pequena o una cabeza de clasificacion personalizada sobre un backbone minimo. No se detalla el numero de tokens de entrenamiento (no aplica), la composicion del dataset ni si se emplearon tecnicas de aumento de datos, regularizacion o ajuste fino.

El entrenamiento se enmarca en el curso LFD2000 y se apoya en el repositorio de recursos lftraining/LFD2000-resources. La evaluacion reportada en la model card incluye una matriz de confusion de 3x3 sobre un conjunto de test, con metricas de precision y recall por clase. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes de manos en tres categorias: paper, scissors y rock.
- Deteccion de objetos segun el pipeline declarado en HuggingFace (object-detection), aunque la model card lo presenta como clasificador.
- Inferencia sobre imagenes individuales mediante un pipeline de PyTorch/TorchVision.
- Evaluacion con matriz de confusion y metricas por clase (precision y recall).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Demostracion educativa de entrenamiento y evaluacion: el modelo sirve para ilustrar el ciclo completo de un proyecto de vision (carga de datos, entrenamiento, matriz de confusion, metricas) en cursos de PyTorch.
- Prototipo de juego interactivo: se puede integrar en una aplicacion que capture la mano del usuario mediante webcam y determine el gesto para jugar a piedra-papel-tijera en tiempo real.
- Prueba de concepto de clasificacion de gestos: util como base para experimentar con aumento de datos, transfer learning o cambios de arquitectura en un entorno controlado.
- Validacion de pipelines de despliegue: permite probar el flujo `uv sync` + `uv run pipeline.py` del repositorio del autor como ejemplo de empaquetado reproducible.
- Docencia en metricas de evaluacion: la matriz de confusion reportada (con recall de 0,84 en paper) sirve para discutir el desbalance de clases y el ajuste de umbrales.
- Base para experimentos de cuantizacion o exportacion: al ser un modelo de 23.779 parametros, se puede usar para probar conversiones a otros formatos y medir su impacto en latencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de evaluacion sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Exactitud de test | 94,62% |
| Precision paper | 1,00 |
| Recall paper | 0,84 |
| Precision rock | 0,91 |
| Recall rock | 1,00 |
| Precision scissors | 0,95 |
| Recall scissors | 1,00 |

Matriz de confusion reportada:

|  | paper | rock | scissors |
|---|---|---|---|
| paper | 104 | 13 | 7 |
| rock | 0 | 124 | 0 |
| scissors | 0 | 0 | 124 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 23.779 parametros el modelo ocupa unos pocos cientos de kilobytes en precision completa.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere aceleracion dedicada.
- Cabe en cualquier GPU consumer e integrada, y en CPU sin problemas.
- Opciones de despliegue: PyTorch/TorchVision nativo, el pipeline `pipeline.py` del repositorio del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a vision).
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera latencia de milisegundos en CPU y GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. Se trata de un modelo educativo de tres clases y escala minima, sin equivalentes documentados en la ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RPSClassifier | 23.779 | no aplica | 94,62% exactitud test | MIT | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de proposito educativo: el autor indica explicitamente "Educational use"; no esta pensado para produccion.
- Sesgos conocidos: no documentados; el dataset de entrenamiento no se describe, por lo que se desconoce su composicion demografica y posibles sesgos en tonos de piel, iluminacion o fondos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero puede producir clasificaciones erroneas en gestos ambiguos o fuera de distribucion.
- Limitaciones de contexto o idioma: no aplica (modelo de vision); no procesa texto.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el caracter educativo y la falta de documentacion desaconsejan su uso en entornos reales sin validacion adicional.
- Caveat para produccion: no hay informacion sobre robustez, calibracion, ni rendimiento fuera del conjunto de test; la exactitud reportada (94,62%) procede de una unica evaluacion sin detalle del split.
- El pipeline declarado (object-detection) no coincide con la descripcion funcional de clasificador, lo que puede generar confusion en la integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/naomiiiking/RPSClassifier
- Repositorio del proyecto: https://github.com/naomiiiking/paper-scissors-rock-classifier
- Recursos del curso LFD2000: https://github.com/lftraining/LFD2000-resources
