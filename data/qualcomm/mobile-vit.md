# qualcomm/Mobile-VIT

## Resumen

Mobile-VIT es un modelo de clasificacion de imagenes basado en la arquitectura MobileViT, una red hibrida que combina bloques convolucionales ligeros al estilo MobileNetV2 con bloques de atencion tipo transformer para capturar contexto global. La implementacion de referencia procede de Apple (repositorio ml-cvnets, paper arXiv:2110.02178), mientras que este repositorio concreto lo publica Qualcomm con pesos y artefactos ya exportados y optimizados para ejecutarse en la NPU de sus plataformas Snapdragon y Dragonwing.

El modelo, con 5,57 millones de parametros y una entrada fija de 224x224 pixeles, esta entrenado sobre ImageNet y se distribuye principalmente como backbone para tareas de clasificacion y como extractor de caracteristicas en pipelines de vision embebida. Su relevancia radica en que Qualcomm ofrece versiones compiladas (ONNX, QNN_DLC y TFLite) listas para desplegar en movil, lo que reduce el trabajo de conversion y aprovecha aceleracion por NPU con latencias de inferencia de entre 1,7 y 6,5 milisegundos segun el chipset.

No es un modelo generativo ni de lenguaje: es un clasificador de imagenes con salida de 1000 clases de ImageNet. Se enmarca en la tendencia de llevar vision por computador eficiente al borde (edge), priorizando tamano reducido (6,56 MB en w8a16) y bajo consumo sobre exactitud maxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida CNN + transformer (MobileViT) |
| Parametros totales | 5,57 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija de 224x224) |
| Tipos de cuantizacion | float y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin componente de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (original), ONNX, QNN_DLC, TFLite |

## Arquitectura y entrenamiento

MobileViT combina dos tipos de bloque: bloques de convolucion con residuales invertidos (estilo MobileNetV2) que procesan informacion local de forma eficiente, y bloques MobileViT que aplican auto-atencion sobre parches desplegados del mapa de caracteristicas para capturar dependencias globales. Esta hibridacion busca el sesgo inductivo de las CNN en las primeras capas y la capacidad de modelado global del transformer sin la penalizacion computacional de un ViT puro. La variante distribuida aqui corresponde a un modelo de aproximadamente 5,57 M de parametros, coherente con la configuracion pequena de la familia MobileViT, con entrada de 224x224 y salida de 1000 clases.

Segun la informacion disponible, el checkpoint esta entrenado sobre ImageNet y este repositorio publica los artefactos ya exportados y optimizados para dispositivos Qualcomm. No se detallan en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset mas alla de ImageNet, ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables en un clasificador de vision). Tampoco se especifican innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet.
- Uso como backbone para construir modelos de vision mas complejos (deteccion, segmentacion, extraccion de caracteristicas).
- Inferencia acelerada por NPU en plataformas Qualcomm Snapdragon y Dragonwing.
- Ejecucion en multiples runtimes (ONNX Runtime, QNN y TFLite) con precisiones float y w8a16.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No incluye modo de razonamiento, vision generativa ni audio: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Clasificacion de fotos en aplicaciones moviles: dado que el modelo ocupa 6,56 MB en w8a16 y se ejecuta en 1,7-2,3 ms en chipsets recientes, puede etiquetar imagenes en tiempo real dentro de la propia app sin enviar datos a la nube.
- Etiquetado automatico en galerias y gestores de fotos: permite organizar grandes bibliotecas locales por categoria semantica usando la NPU del dispositivo.
- Preprocesado en pipelines de vision embebida: al actuar como backbone, alimenta cabezas especificas para deteccion o clasificacion de dominio concreto tras un ajuste fino.
- Inspeccion visual en dispositivos de gama industrial: su baja huella de memoria (rango de pico documentado de 0 a ~200 MB segun chipset y precision) facilita su integracion en equipos con recursos limitados.
- Moderacion o filtrado de contenido de imagenes en el borde: clasificacion rapida y offline para cribar categorias antes de un analisis mas costoso.
- Automatizacion en camaras y sistemas de vigilancia: inferencia en el propio SoC para clasificar escenas sin depender de conectividad, reduciendo latencia y coste de ancho de banda.
- Investigacion en vision eficiente: sirve como baseline reproducible para comparar tecnicas de cuantizacion y despliegue en NPU frente a implementaciones en CPU/GPU.

## Benchmarks y rendimiento

La informacion proporcionada no incluye metricas de exactitud (top-1, top-5) ni resultados en suites como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de vision. En su lugar, la model card publica una tabla de rendimiento de latencia por chipset. A continuacion se recogen los valores mas representativos para ONNX:

| Chipset | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | float | 1,929 | 0 - 66 | NPU |
| Snapdragon 8 Elite For Galaxy | float | 2,296 | 0 - 63 | NPU |
| Snapdragon X2 Elite | float | 2,128 | 2 - 2 | NPU |
| Snapdragon X Elite | float | 4,287 | 12 - 12 | NPU |
| Snapdragon 8 Gen 3 | float | 2,891 | 0 - 96 | NPU |
| Snapdragon 8 Gen 1 | float | 6,461 | 1 - 103 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy | w8a16 | 1,707 | 0 - 94 | NPU |
| Snapdragon 8 Gen 1 | w8a16 | 4,805 | 0 - 123 | NPU |
| Dragonwing Q-6690 | w8a16 | 19,98 | 0 - 205 | NPU |

No se han publicado resultados de benchmarks de exactitud en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo float ocupa 21,4 MB y la version w8a16 solo 6,56 MB, por lo que el peso de los parametros es minimo y cabe holgadamente en cualquier dispositivo moderno.
- Memoria pico observada: desde un rango de 0-66 MB (float, Snapdragon 8 Elite Gen 5) hasta 205 MB (w8a16, Dragonwing Q-6690), segun chipset y precision.
- GPU/plataformas recomendadas: NPU de Qualcomm Snapdragon 8 Gen 1/3, Snapdragon 8 Elite, Snapdragon X Elite/X2 Elite y series Dragonwing (IQ-8275, IQ-9075, QCS8550, QCS8450, Q-8750, entre otras).
- Cabe en hardware de consumo: si, de forma amplia; esta disenado para telefonos, portatiles y dispositivos embebidos, no requiere GPU de centros de datos.
- Opciones de despliegue: Qualcomm AI Hub Workbench, runtime QNN (QAIRT 2.50), ONNX Runtime 1.30.0, TFLite, y exportacion personalizada mediante la libreria qualcomm/ai-hub-models.
- Latencia y throughput: 1,7-6,5 ms de inferencia en chipsets Snapdragon recientes; hasta 19,98 ms en Dragonwing Q-6690. Estos tiempos implican teoricamente cientos de inferencias por segundo en los chipsets mas rapidos, aunque no se documenta el throughput agregado.

## Comparativa con modelos similares

La informacion proporcionada no incluye una comparativa formal con otros modelos. A continuacion se ofrece una orientacion cualitativa frente a alternativas habituales de la misma categoria (clasificacion de imagenes ligera); los valores de parametros de los competidores son aproximados y no proceden de la model card.

| Modelo | Parametros (aprox.) | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mobile-VIT (Qualcomm) | 5,57 M | 224x224 | BSD-3-Clause | HuggingFace + Qualcomm AI Hub |
| MobileViT-S (Apple, referencia) | ~5,6 M | 224x224 | Apple ML-cvNets (ver repo) | GitHub apple/ml-cvnets |
| MobileNetV3-Large | ~5,4 M | 224x224 | Apache-2.0 | Amplia (TF, PyTorch) |
| EfficientNet-B0 | ~5,3 M | 224x224 | Apache-2.0 | Amplia (TF, PyTorch) |

La ventaja diferencial de esta version es la disponibilidad de artefactos precompilados para NPU de Qualcomm; frente a MobileNetV3 o EfficientNet, el interes no esta tanto en el numero de parametros como en el soporte de despliegue optimizado para hardware movil.

## Limitaciones y advertencias

- Es un clasificador de 1000 clases de ImageNet: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si puede asignar etiquetas incorrectas con alta confianza en imagenes fuera de la distribucion de ImageNet.
- Sesgos potenciales heredados del dataset ImageNet, con posibles desequilibrios en categorias y sesgos socioculturales en las etiquetas.
- Sin capacidades multilingues ni de contexto textual; la "longitud de contexto" no aplica porque la entrada es una imagen de tamano fijo.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar la licencia del modelo original de Apple y las condiciones de los artefactos precompilados de Qualcomm.
- Los artefactos de este repositorio estan optimizados para dispositivos Qualcomm; su rendimiento en otros aceleradores no esta garantizado ni documentado.
- El modelo se publico con un numero muy bajo de descargas (9) y likes (0), lo que reduce la evidencia de uso en produccion por parte de la comunidad.
- La entrada esta fijada a 224x224; cambios de resolucion requieren reexportacion con configuraciones personalizadas.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Mobile-VIT
- Paper MobileViT (arXiv:2110.02178): https://arxiv.org/abs/2110.02178
- Implementacion de referencia de Apple: https://github.com/apple/ml-cvnets
- Qualcomm AI Hub Models (repositorio): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/mobile_vit
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mobile_vit
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Web de Qualcomm: https://www.qualcomm.com/
