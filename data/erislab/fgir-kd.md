# ERISLab/FGIR-KD

## Resumen

FGIR-KD es el conjunto de checkpoints asociado al artículo *How to Choose Your Teacher for Fine Grained Image Recognition* (arXiv:2605.15689), presentado en el taller FGVC13 de CVPR 2026 y publicado por el laboratorio ERISLab. No se trata de un modelo único, sino de una coleccion de 2083 checkpoints de investigacion, cada uno correspondiente a la ultima epoca de una semilla de entrenamiento, organizados en dos carpetas: `teachers/` (los modelos profesores) y `students/` (los estudiantes destilados).

El problema que aborda es la seleccion del profesor optimo en destilacion de conocimiento (knowledge distillation) aplicada al reconocimiento de imagenes de grano fino (FGIR). Para ello se destilan estudiantes pequenos (ResNet-18, LCNet-035, LeViT-128s y ViT-T/16) a partir de una bateria de profesores de distinta familia arquitectonica (ResNet-101, ResNetV2-101, ResNetV2-101x3 BiT, VGG19-BN, ConvNeXt-Base, Swin-Base, ViT-B/16 y VAN-B3), y se registran las precisiones resultantes por combinacion profesor-estudiante-dataset.

Es relevante porque proporciona un banco de experimentos reproducible y a gran escala (el repositorio ocupa 97,9 GB) para comparar estrategias de destilacion en vision por computador, con codigo compartido con el proyecto TGDA y una libreria de carga especifica, `fgir-zoo`. No es un modelo generativo ni de lenguaje: no tiene ventana de contexto, no procesa texto y su unica tarea es la clasificacion de imagenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales y transformers de vision (CNN y ViT) del zoo de timm, combinadas mediante destilacion de conocimiento. Profesores: ResNet-101, ResNetV2-101, ResNetV2-101x3 (BiT), VGG19-BN, ConvNeXt-Base, Swin-Base, ViT-B/16, VAN-B3. Estudiantes: ResNet-18, LCNet-035, LeViT-128s, ViT-T/16 |
| Parametros totales | no disponible (varia por checkpoint; la model card no indica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | `torch.save` (diccionario de PyTorch con `config`, `model`, `accuracy` y `epoch`); no se distribuyen pesos en safetensors ni GGUF |
| Tarea | image-classification (fine-grained image recognition) |
| Numero de checkpoints | 2083, uno por configuracion, cada uno ultima epoca de una semilla |
| Libreria | pytorch (carga mediante fgir-zoo y timm) |
| Repositorio | 97,9 GB |
| Datasets | de 1 a 13 datasets por configuracion segun la tabla del autor; la model card no los nombra individualmente, salvo CUB-200-2011 en el ejemplo de uso |
| Normalizacion de entrada | media (0.485, 0.456, 0.406) y desviacion (0.229, 0.224, 0.225), redimensionado bicubico y recorte central segun `config` |

## Arquitectura y entrenamiento

Cada checkpoint es un diccionario serializado con `torch.save` que contiene la configuracion completa de entrenamiento (`config`), el `state_dict` del modelo, la precision alcanzada (`accuracy`) y la epoca (`epoch`), sin estado del optimizador. Los nombres de fichero corresponden a los nombres de los registros de experimento y terminan en un serial identificativo. El manifiesto `manifest.csv` enumera cada fichero con su dataset, estudiante, profesor, serial, semilla, tamano de imagen, numero de clases, precision, SHA-256 y tamano.

La tecnica central es la destilacion de conocimiento profesor-estudiante sobre tareas de grano fino. Los profesores se toman de pesos preentrenados de timm (`resnet101.a1_in1k`, `convnext_base.fb_in22k`, `swin_base_patch4_window7_224.ms_in22k`, `resnetv2_101x3_bit.goog_in21k`, etc.) y los estudiantes son arquitecturas compactas (ResNet-18, LCNet-035, LeViT-128s, ViT-T/16). El objetivo del experimento es medir que profesor maximiza la precision del estudiante para cada combinacion de dataset y arquitectura. El codigo de modelo se comparte con el proyecto TGDA, por lo que los detalles de la funcion de perdida y del pipeline de destilacion deben consultarse en ese repositorio; la model card no detalla el numero de tokens ni composicion de dataset al no tratarse de un modelo de lenguaje, ni menciona fases de RLHF o DPO.

## Capacidades

- Clasificacion de imagenes de grano fino (fine-grained image recognition): distincion entre clases visualmente muy similares.
- Extraccion de representaciones: los checkpoints pueden actuar como backbone preentrenado para transfer learning en vision.
- Destilacion de conocimiento: el repositorio incluye tanto profesores como estudiantes destilados, lo que permite reproducir y comparar el efecto del profesor sobre el estudiante.
- Reproducibilidad de experimentos: cada fichero incluye su configuracion completa y su semilla, con precision registrada.
- Compatibilidad con timm: los modelos base son nombres del zoo de timm, cargables mediante `fgir-zoo`.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision-lenguaje, audio ni ninguna capacidad multimodal mas alla de la clasificacion visual.

## Casos de uso

- Reproduccion de experimentos de destilacion: cargar los checkpoints de `students/` junto con su `config` para replicar la precision reportada con `fgir-zoo` y verificar los resultados del articulo.
- Seleccion de profesor para un proyecto de destilacion: usar las precisiones medias por serial (por ejemplo, 92,36 en `students/serial_556` frente a 14,38 en `students/serial_104`) como guia empirica para decidir que arquitectura docente conviene emplear con un estudiante concreto.
- Clasificacion de imagenes de grano fino en produccion: emplear un estudiante destilado ligero (ResNet-18 o LeViT-128s) como clasificador de especies, productos o defectos, ajustandolo despues al dominio objetivo.
- Despliegue en dispositivos con recursos limitados: los estudiantes LCNet-035 y LeViT-128s estan disenados para inferencia eficiente, por lo que son candidatos para edge computing una vez exportados a un runtime de inferencia.
- Extraccion de caracteristicas para busqueda visual o recuperacion: usar un backbone destilado como extractor de embeddings para sistemas de similitud de imagenes.
- Benchmarking de metodos de destilacion: el repositorio sirve como linea base reproducible para comparar nuevas tecnicas de KD sobre las mismas combinaciones de dataset y arquitectura.
- Transfer learning a nuevos dominios de grano fino: partir de un estudiante destilado y reentrenar la cabeza de clasificacion con un dataset propio de pocas clases y muchas muestras por clase.
- Investigacion academica en FGVC: el material esta vinculado al taller FGVC13 de CVPR 2026 y a la coleccion de HuggingFace, lo que facilita la comparacion entre publicaciones.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K, etc.) por no tratarse de un modelo de lenguaje. Si incluye las precisiones medias por configuracion, recogidas en la tabla siguiente tal y como aparecen en el repositorio.

| Carpeta | Modelos | Profesores | Datasets | Ficheros | Precision media |
|---|---|---|---|---|---|
| teachers/serial_15 | resnet101.a1_in1k, resnetv2_101.a1h_in1k, vgg19_bn | - | 8 | 8 | 90,46 |
| teachers/serial_16 | convnext_base.fb_in22k, resnet101.a1_in1k, resnetv2_101.a1h_in1k, resnetv2_101x3_bit.goog_in21k, swin_base_patch4_window7_224.ms_in22k, van_b3, vgg19_bn, vit_b16 | - | 6 | 48 | 82,21 |
| teachers/serial_17 | convnext_base.fb_in22k, resnet101.a1_in1k, resnetv2_101.a1h_in1k, resnetv2_101x3_bit.goog_in21k, swin_base_patch4_window7_224.ms_in22k, van_b3, vgg19_bn, vit_b16 | - | 1 | 8 | 81,45 |
| teachers/serial_18 | convnext_base.fb_in22k, resnet101.a1_in1k, resnetv2_101.a1h_in1k, resnetv2_101x3_bit.goog_in21k, swin_base_patch4_window7_224.ms_in22k, vgg19_bn, vit_b16 | - | 1 | 7 | 78,83 |
| teachers/serial_400 | convnext_base.fb_in22k, resnet101.a1_in1k, resnetv2_101.a1h_in1k, resnetv2_101x3_bit.goog_in21k, swin_base_patch4_window7_224.ms_in22k, van_b3, vgg19_bn, vit_b16 | - | 1 | 9 | 71,90 |
| teachers/serial_501 | resnetv2_101x3_bit.goog_in21k | - | 5 | 5 | 86,01 |
| students/serial_1 | resnet18 | 1 | 1 | 1 | 73,78 |
| students/serial_2 | lcnet_035 | 8 | 9 | 72 | 66,13 |
| students/serial_3 | lcnet_035 | 8 | 9 | 72 | 64,36 |
| students/serial_4 | lcnet_035 | 8 | 9 | 72 | 62,50 |
| students/serial_7 | levit_128s | 8 | 8 | 57 | 63,23 |
| students/serial_102 | resnet18 | 1 | 1 | 1 | 63,62 |
| students/serial_104 | vit_t16 | 1 | 1 | 1 | 14,38 |
| students/serial_105 | lcnet_035 | 1 | 2 | 2 | 33,97 |
| students/serial_106 | levit_128s | 1 | 2 | 2 | 39,34 |
| students/serial_193 | lcnet_035 | 1 | 1 | 1 | 76,86 |
| students/serial_201 | resnet18 | 8 | 10 | 72 | 74,73 |
| students/serial_202 | resnet18 | 8 | 9 | 65 | 71,92 |
| students/serial_203 | resnet18 | 8 | 13 | 104 | 72,22 |
| students/serial_204 | resnet18 | 8 | 13 | 104 | 66,47 |
| students/serial_205 | resnet18 | 8 | 13 | 104 | 70,14 |
| students/serial_206 | resnet18 | 8 | 13 | 104 | 64,09 |
| students/serial_207 | resnet18 | 8 | 13 | 104 | 68,60 |
| students/serial_208 | resnet18 | 8 | 13 | 104 | 63,21 |
| students/serial_209 | lcnet_035 | 8 | 13 | 104 | 55,43 |
| students/serial_210 | lcnet_035 | 8 | 13 | 104 | 54,11 |
| students/serial_211 | lcnet_035 | 8 | 13 | 104 | 53,87 |
| students/serial_212 | levit_128s | 8 | 13 | 104 | 59,39 |
| students/serial_213 | levit_128s | 8 | 13 | 103 | 57,04 |
| students/serial_214 | levit_128s | 8 | 13 | 103 | 57,31 |
| students/serial_215 | lcnet_035 | 8 | 13 | 104 | 58,93 |
| students/serial_216 | levit_128s | 8 | 13 | 101 | 60,95 |
| students/serial_253 | lcnet_035 | 1 | 1 | 1 | 77,43 |
| students/serial_259 | resnet18 | 1 | 1 | 1 | 85,47 |
| students/serial_260 | levit_128s | 1 | 1 | 1 | 82,02 |
| students/serial_305 | levit_128s | 8 | 1 | 8 | 63,62 |
| students/serial_309 | lcnet_035 | 7 | 1 | 7 | 61,52 |
| students/serial_311 | lcnet_035 | 1 | 1 | 1 | 0,52 |
| students/serial_321 | lcnet_035 | 8 | 1 | 8 | 60,81 |
| students/serial_322 | lcnet_035 | 8 | 1 | 8 | 54,30 |
| students/serial_323 | lcnet_035 | 8 | 1 | 8 | 0,64 |
| students/serial_324 | lcnet_035 | 8 | 1 | 8 | 51,13 |
| students/serial_401 | resnet18 | 8 | 1 | 8 | 70,81 |
| students/serial_402 | lcnet_035 | 8 | 1 | 8 | 61,19 |
| students/serial_403 | levit_128s | 3 | 1 | 3 | 72,06 |
| students/serial_551 | resnet18 | 4 | 2 | 4 | 77,20 |
| students/serial_552 | lcnet_035 | 1 | 1 | 1 | 57,28 |
| students/serial_553 | levit_128s | 8 | 5 | 40 | 75,94 |
| students/serial_554 | resnet18 | 1 | 1 | 1 | 54,37 |
| students/serial_555 | lcnet_035 | 2 | 2 | 2 | 66,50 |
| students/serial_556 | levit_128s | 8 | 3 | 10 | 92,36 |
| students/serial_999 | lcnet_035 | 1 | 1 | 1 | 7,04 |

No se publican en la informacion disponible comparaciones directas con modelos externos de la misma categoria.

## Requisitos de hardware

- VRAM: no disponible de forma oficial por checkpoint. Los estudiantes (ResNet-18, LCNet-035, LeViT-128s, ViT-T/16) son arquitecturas compactas y caben con holgura en GPU de consumo; los profesores (ResNet-101, ResNetV2-101x3, ConvNeXt-Base, Swin-Base, ViT-B/16, VAN-B3, VGG19-BN) requieren bastante mas memoria y se recomienda GPU de datacenter o GPU de consumo de gama alta.
- GPU recomendadas: no especificado por el autor. De forma orientativa, los estudiantes se pueden ejecutar en cualquier GPU de consumo reciente (por ejemplo, RTX 3060 o superior); los profesores se benefician de A100, H100 o RTX 4090 para lotes grandes.
- Compatibilidad con GPU de consumo: si para los estudiantes; para los profesores depende del checkpoint concreto y del tamano de lote.
- Almacenamiento: el repositorio completo ocupa 97,9 GB, por lo que conviene descargar unicamente las carpetas necesarias en lugar del repo completo.
- Opciones de despliegue: PyTorch nativo con timm y la libreria `fgir-zoo` para carga de checkpoints. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser modelos de lenguaje; tampoco se documenta exportacion a ONNX, TorchScript o TensorRT.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible modelos comparables directos de la misma categoria (colecciones de checkpoints de destilacion para grano fino). La comparativa se limita a los recursos relacionados citados por el autor.

| Recurso | Tipo | Relacion con FGIR-KD | Licencia |
|---|---|---|---|
| ERISLab/FGIR-KD | Coleccion de 2083 checkpoints de destilacion | Es el propio repositorio | no disponible |
| timm | Zoo de modelos de vision | Origen de los profesores y estudiantes usados | no indicada en la model card |
| TGDA (arkel23/TGDA) | Repositorio de codigo | Comparte el codigo de modelo con FGIR-KD | no indicada en la model card |
| fgir-zoo (arkel23/fgir-zoo) | Libreria de carga | Utilidad oficial para cargar los checkpoints | no indicada en la model card |

No se dispone de datos de benchmarks que permitan comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo desplegable por si solo: es un banco de 2083 checkpoints de investigacion, no un modelo unico con pesos consolidados.
- Licencia no disponible: se desconoce si se permite el uso comercial, por lo que no debe utilizarse en produccion sin aclarar antes las condiciones.
- Algunos checkpoints presentan precisiones degeneradas (0,52; 0,64; 7,04; 14,38; 33,97), compatibles con entrenamientos fallidos o no convergidos; hay que filtrarlos antes de reutilizarlos.
- Los ficheros no incluyen el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint, solo inferencia o ajuste fino desde los pesos.
- El repositorio ocupa 97,9 GB; su descarga completa es costosa y puede no ser necesaria.
- La model card no detalla la composicion completa de los datasets de grano fino empleados, solo el numero de datasets por configuracion y el ejemplo de CUB-200-2011, lo que dificulta evaluar posibles sesgos de dominio.
- Al ser modelos de clasificacion visual, heredan los sesgos de sus datos de entrenamiento (posibles desequilibrios de clase, sesgos geograficos o de captura) que no se documentan.
- Riesgo de sobreajuste al dominio de grano fino: el rendimiento puede degradarse fuera de las categorias y condiciones de imagen del entrenamiento.
- No dispone de soporte de contexto, idioma, herramientas ni agentes, por lo que no es adecuado como sustituto de un modelo de lenguaje en pipelines de texto.
- No se han publicado resultados de benchmarks estandar ni comparativas con modelos de terceros en la informacion disponible.
- Los identificadores arXiv (2605.15689) y la referencia a CVPR 2026 deben verificarse antes de citarlos en trabajos academicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ERISLab/FGIR-KD
- Articulo en arXiv: https://arxiv.org/abs/2605.15689
- Coleccion de HuggingFace asociada al articulo: https://huggingface.co/collections/ERISLab/fgir-kd-how-to-choose-your-teacher-fgvc13-cvpr-2026-6ab32cd35061af167deb14d6
- Repositorio de codigo TGDA: https://github.com/arkel23/TGDA
- Libreria de carga fgir-zoo: https://github.com/arkel23/fgir-zoo
- La busqueda web realizada no devolvio resultados relevantes para este modelo.
