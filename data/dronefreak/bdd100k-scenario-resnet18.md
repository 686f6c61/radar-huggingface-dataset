# dronefreak/bdd100k-scenario-resnet18

## Resumen

El modelo `dronefreak/bdd100k-scenario-resnet18` es un clasificador de imágenes basado en ResNet-18, afinado por el usuario dronefreak sobre el dataset BDD100K Scenario Classification. Su función es etiquetar fotogramas de conducción en siete categorías de escenario (ciudad, autopista, zona residencial, aparcamiento, gasolinera, túnel y desconocido), una tarea derivada del campo `attributes.scene` de BDD100K. Con 11,19 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero pensado para integrarse en pipelines de visión para vehículos autónomos o análisis de vídeo de tráfico.

El modelo se distribuye a través de la librería `timm` y forma parte del ecosistema BDD100K-Toolkit, un conjunto de herramientas para preparar el dataset, entrenar modelos y evaluarlos con métricas homogéneas. Su checkpoint base es `timm/resnet18.a1_in1k`, un ResNet-18 preentrenado en ImageNet-1k, que se ha reajustado para la tarea de siete clases. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.

Es relevante para desarrolladores que necesitan un clasificador de escenas de conducción de bajo coste computacional, con inferencia viable en CPU y GPU de gama baja, y que valoran la reproducibilidad de las métricas sobre un split de test fijo de 10.000 imágenes. No obstante, el rendimiento es desigual: la clase mayoritaria (ciudad) domina el resultado global, mientras que clases minoritarias como gasolinera o aparcamiento presentan métricas muy pobres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red neuronal convolucional residual) |
| Parametros totales | 11.189.703 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint PyTorch `best.pt`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-18 estándar, con bloques residuales y normalización por lotes, adaptado a clasificación de imágenes de 224×224 píxeles (según la configuración de `timm`). El modelo parte de los pesos preentrenados de `timm/resnet18.a1_in1k` y se afina sobre el dataset BDD100K Scenario Classification, que agrupa imágenes de BDD100K en siete clases de escena. No se dispone de información sobre el número de tokens de entrenamiento (al ser visión, número de imágenes), la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, balanceo de clases o regularización específicas.

El checkpoint original `best.pt` incluye pesos con media móvil exponencial (EMA) y metadatos de entrenamiento, lo que sugiere que se empleó EMA durante el ajuste fino. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos. El modelo se evaluó sobre un split de test de 10.000 imágenes, con métricas declaradas por el autor pero no verificadas de forma independiente.

## Capacidades

- Clasificación de imágenes de escenas de conducción en siete categorías: ciudad, autopista, zona residencial, aparcamiento, gasolinera, túnel y desconocido.
- Inferencia ligera: 11,2 millones de parámetros, apto para ejecución en CPU y GPU de gama baja.
- Integración con `timm` mediante `timm.create_model("hf-hub:dronefreak/bdd100k-scenario-resnet18", pretrained=True)`.
- Configuración de preprocesado incluida en `config.json` (tamaño de entrada, media, desviación típica y nombres de etiquetas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo más allá de fotogramas individuales.
- No incluye modo de razonamiento (thinking mode) ni visión más allá de la clasificación de imagen completa.

## Casos de uso

- Etiquetado automático de fotogramas en datasets de conducción: el modelo puede clasificar imágenes de BDD100K o de cámaras de vehículos en las siete categorías de escena, acelerando la anotación previa a tareas de detección o segmentación.
- Filtrado previo en pipelines de percepción: antes de ejecutar modelos más pesados (detección de objetos, segmentación semántica), se puede usar este clasificador para descartar o priorizar fotogramas según el escenario (por ejemplo, separar autopista de ciudad).
- Análisis de vídeo de tráfico urbano: clasificación de secuencias de cámaras de vigilancia o de flotas de vehículos para generar estadísticas de distribución de escenas a lo largo del día.
- Sistemas de ayuda a la conducción de bajo coste: integración en unidades ECU o dispositivos embebidos con poca VRAM, ya que el modelo cabe en menos de 100 MB en FP32 y puede cuantizarse a INT8.
- Validación de modelos de percepción: uso como clasificador de referencia para comprobar si un modelo más grande comete errores sistemáticos en escenas concretas (por ejemplo, túneles o aparcamientos).
- Investigación en clasificación de escenas: punto de partida para experimentos de ajuste fino con arquitecturas más ligeras o con técnicas de balanceo de clases, dado que el rendimiento en clases minoritarias es bajo.
- Prototipado rápido en notebooks: al ser un modelo pequeño y con licencia permisiva, se puede cargar en Google Colab o en un portátil sin GPU dedicada para pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10.000 imágenes) del dataset BDD100K Scenario Classification. No verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 77,14 % |
| Top-5 accuracy | 99,91 % |
| Macro F1 | 47,29 % |
| Balanced accuracy | 44,83 % |
| Macro precision | 54,25 % |
| Macro recall | 44,83 % |

Rendimiento por clase:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| city street | 79,69 % | 86,67 % | 83,03 % | 6112 |
| gas stations | 0,00 % | 0,00 % | 0,00 % | 7 |
| highway | 74,39 % | 69,39 % | 71,80 % | 2499 |
| parking lot | 52,17 % | 24,49 % | 33,33 % | 49 |
| residential | 67,15 % | 51,72 % | 58,43 % | 1253 |
| tunnel | 77,78 % | 77,78 % | 77,78 % | 27 |
| unknown | 28,57 % | 3,77 % | 6,67 % | 53 |

El autor indica que el checkpoint no clasifica correctamente ninguna imagen de la clase `gas stations` (7 imágenes), por lo que debe considerarse no soportada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (11,2 M de parámetros, ~45 MB de pesos más activaciones para un lote pequeño). En FP16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, T4, L4, A100 y H100 sin problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `timm` con PyTorch, exportación a TorchScript u ONNX, y ejecución con ONNX Runtime. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplica a modelos de clasificación de imágenes).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

El autor publica una tabla comparativa de su propio model zoo, evaluada sobre el mismo split de test. Se recogen los modelos más relevantes:

| Modelo | Top-1 | Macro F1 | Balanced accuracy | Macro precision |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| TinyViT-21M | 77,99 % | 62,52 % | 66,21 % | 59,66 % |
| ResNet-18 (este modelo) | 77,14 % | 47,29 % | 44,83 % | 54,25 % |
| ConvNeXt-Atto | 77,44 % | 61,06 % | 60,34 % | 67,92 % |

En términos de Top-1, el ResNet-18 se sitúa por debajo de EfficientViT-B3, YOLO11n, MobileNetV4-Conv-Small y TinyViT-21M. En Macro F1 y balanced accuracy, queda por debajo de TinyViT-21M (62,52 % y 66,21 %) y ConvNeXt-Atto (61,06 % y 60,34 %), lo que indica un peor comportamiento en clases minoritarias. La licencia de todos los modelos comparados no se detalla en la información disponible, salvo la de este modelo (Apache 2.0).

## Limitaciones y advertencias

- Fuerte desbalanceo de clases: la clase `city street` concentra 6112 de las 10.000 imágenes de test, mientras que `gas stations` tiene 7 y `tunnel` 27. El modelo no acierta ninguna imagen de `gas stations` y tiene un recall muy bajo en `unknown` (3,77 %) y `parking lot` (24,49 %).
- El alto Top-1 (77,14 %) enmascara un rendimiento pobre en clases minoritarias, como refleja el Macro F1 de 47,29 % y la balanced accuracy de 44,83 %.
- Riesgo de sesgo hacia escenas urbanas y de autopista, que son las mejor representadas en el dataset.
- No se dispone de información sobre sesgos geográficos, demográficos o de condiciones meteorológicas; BDD100K está recogido principalmente en Estados Unidos, por lo que la generalización a otros países es incierta.
- El modelo clasifica imágenes individuales, no secuencias de vídeo; no explota información temporal.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No hay restricciones adicionales documentadas.
- Las métricas son declaradas por el autor y no han sido verificadas de forma independiente (`verified: false`).
- El checkpoint `best.pt` contiene pesos con EMA y metadatos de entrenamiento; para producción se recomienda usar los pesos safetensors y la configuración de `timm`.
- No se documentan limitaciones de idioma porque el modelo no procesa texto, pero tampoco se documenta su comportamiento ante imágenes nocturnas, lluvia o nieve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-resnet18
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset BDD100K Scenario Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Scenario-Classification
- Paper de ResNet (arXiv:1512.03385): https://arxiv.org/abs/1512.03385
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Modelo base `timm/resnet18.a1_in1k`: https://huggingface.co/timm/resnet18.a1_in1k
