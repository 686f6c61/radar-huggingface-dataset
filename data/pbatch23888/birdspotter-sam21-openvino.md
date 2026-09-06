# PBatch23888/birdspotter-sam21-openvino

## Resumen

BirdSpotter SAM21 OpenVINO es una conversion a formato OpenVINO IR del modelo SAM 2.1 Hiera Large de Meta, realizada por PBatch23888. Esta pensada para el proyecto BirdSpotter y se exporta con un tamano de entrada fijo de 512 x 512 píxeles. Incluye el encoder de imagen y el predictor de mascaras con prompts de caja, lo que permite realizar segmentacion de objetos a partir de una caja delimitadora.

La conversion no esta cuantizada y usa la precision normal exportada. El repositorio ocupa 0,4 GB, por lo que es un modelo ligero para desplegar en entornos con restricciones de memoria. Es relevante para desarrolladores que quieran ejecutar SAM 2.1 sobre hardware Intel (CPU, iGPU o GPU) aprovechando la optimizacion de OpenVINO, sin necesidad de mantener el stack completo de PyTorch en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 Hiera Large (encoder de imagen) + predictor de mascaras con prompts de caja, convertido a OpenVINO IR |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vision, entrada fija 512 x 512) |
| Tipos de cuantizacion | precision normal exportada, no INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la licencia upstream de Meta SAM 2.1) |
| Formato de pesos | OpenVINO IR (.xml + .bin) |

## Arquitectura y entrenamiento

La arquitectura se compone de una red troncal Hiera Large como encoder de imagen y un predictor de mascaras que acepta prompts de caja. El modelo se exporta a un tamano de entrada fijo de 512 x 512, lo que simplifica el preprocesado en el pipeline de inferencia. No se proporcionan datos sobre el entrenamiento del modelo original, ni sobre numeros de tokens, composicion del dataset o procesos de RLHF o DPO, ya que esta publicacion es una conversion de un checkpoint preentrenado.

La innovacion tecnica principal es la compilacion a OpenVINO IR, que permite una inferencia optimizada en CPUs y GPUs Intel y su integracion en el ecosistema OpenVINO. El paquete se entrega como dos grafos separados: el encoder de imagen y el predictor de mascaras, junto con un manifest.json que incluye checksums SHA-256.

## Capacidades

- Segmentacion de imagenes a partir de prompts de caja.
- Adaptacion especifica para el proyecto BirdSpotter, con entrada fija de 512 x 512.
- Encoder de imagen y predictor de mascaras exportados como modelos IR separados.
- Compatible con el toolkit OpenVINO para despliegue en CPUs, iGPUs y GPUs Intel.
- No incluye soporte de prompts por puntos ni prompts de mascara completa.
- No incluye generacion de texto, tool calling, vision general ni capacidades multimodales.

## Casos de uso

- Seguimiento de aves en imagenes de camaras trampa: el modelo segmenta aves a partir de una caja previamente detectada, lo que facilita el conteo y el estudio de poblaciones en proyectos de conservacion.
- Censo de fauna mediante imagenes aereas o de satelite: al recibir cajas de localizacion de individuos, el modelo genera mascaras para estimar densidades de poblacion.
- Inspeccion industrial de defectos: a partir de cajas delimitadoras de zonas sospechosas, segmenta el defecto exacto en piezas o superficies.
- Agricultura de precision: segmenta plantas, frutos o enfermedades dentro de una region delimitada por cajas, apoyandose en un detector previo.
- Investigacion en vision por computador: sirve como base para experimentar con SAM 2.1 en OpenVINO sin depender de PyTorch.
- Despliegue en sistemas de edge con hardware Intel: al ser OpenVINO IR de 0,4 GB, se puede integrar en aplicaciones de inferencia en el borde con CPUs Intel o NPU compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se dispone de cifras oficiales. El repositorio ocupa 0,4 GB, por lo que la inferencia puede caber en GPUs de consumo, pero requiere validacion empirica.
- GPU recomendadas: no disponible. En entornos Intel, OpenVINO se beneficia de CPUs con AVX-512, iGPUs integradas y GPUs discretas Arc.
- Si cabe en GPU de consumo: probablemente si, dado el tamano del repositorio; se recomienda probar en el hardware objetivo.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO Model Server, integracion directa con el toolkit OpenVINO 2026.3.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| facebook/sam2.1-hiera-large | checkpoint original en PyTorch (safetensors) | variable | Apache-2.0 con terminos de uso de Meta | HuggingFace |
| birdspotter-sam21-openvino | OpenVINO IR (.xml + .bin) | fija 512 x 512 | Apache-2.0 (repositorio), sujeta a licencia upstream | HuggingFace |

No se dispone de informacion suficiente para comparar parametros totales, contexto o rendimiento con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- La conversion fija la entrada a 512 x 512; otros tamanos requieren reexportar el modelo o redimensionar la imagen, lo que puede degradar la precision.
- No esta cuantizada a INT8, por lo que no aprovecha las cargas de memoria mas bajas ni la mayor velocidad que ofreceria una cuantizacion.
- El soporte se limita a prompts de caja; no se ofrecen en esta conversion los prompts por puntos ni por mascara completa.
- No se conocen sesgos especificos, pero al derivar de SAM 2.1 puede heredar limitaciones del modelo original en cuanto a tipos de objetos o escenarios no representados en sus datos de entrenamiento.
- Para produccion, es necesario validar el rendimiento en el hardware objetivo, ya que no se publican benchmarks ni mediciones de latencia.

## Enlaces

- HuggingFace: https://huggingface.co/PBatch23888/birdspotter-sam21-openvino
- Repositorio upstream: https://huggingface.co/facebook/sam2.1-hiera-large
- Documentacion de OpenVINO: https://docs.openvino.ai/
- OpenVINO Model Hub (Intel): https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/model-hub.html
