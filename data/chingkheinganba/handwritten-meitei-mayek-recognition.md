# Chingkheinganba/handwritten-meitei-mayek-recognition

## Resumen

El modelo `Chingkheinganba/handwritten-meitei-mayek-recognition` es un clasificador de imagenes especializado en el reconocimiento de caracteres manuscritos del script Meitei Mayek, la escritura tradicional del pueblo meitei de Manipur (India). Lo desarrolla el usuario Chingkheinganba y se distribuye bajo licencia MIT a traves de HuggingFace. No es un modelo generativo ni un LLM: es un sistema de vision por computador orientado a OCR de un alfabeto concreto, con 55 clases de salida.

Tecnicamente consiste en un ensemble de tres redes convolucionales preentrenadas en ImageNet (ConvNeXt-T, EfficientNetV2-S y ResNet50-D en su variante topologica) afinadas sobre el dataset TUMMHCD de caracteres Meitei Mayek manuscritos aislados. El ensemble alcanza un 98,06% de top-1 sobre 12.794 imagenes de test, mientras que el miembro EfficientNetV2-S por si solo obtiene un 97,95%. Se publica ademas una version ONNX en float16 pensada para ejecutarse en el navegador.

Su relevancia es de nicho pero clara: cubre un script con muy poco soporte en herramientas OCR convencionales (Tesseract, EasyOCR o TrOCR no lo reconocen de forma fiable), y lo hace con un modelo ligero (repo de 0,3 GB) que puede correr en CPU o en un navegador mediante ONNX Runtime. Es util para digitalizacion de documentos, herramientas educativas y proyectos de preservacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres CNN preentrenadas en ImageNet: ConvNeXt-T, EfficientNetV2-S y ResNet50-D (topo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | float16 para el miembro ONNX; pesos PyTorch en precision nativa |
| Idiomas soportados | no disponible (reconoce caracteres del script Meitei Mayek, 55 clases) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dicts (`.pt`) y ONNX (float16, `web/model.onnx`) |
| Tarea | image-classification |
| Numero de clases | 55 |
| Dataset de evaluacion | TUMMHCD, 12.794 imagenes de test |
| Resolucion de entrada | imagenes normalizadas a la escala de los escaneos de 24 x 24 del dataset |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un ensemble de tres clasificadores convolucionales. Cada miembro parte de pesos preentrenados en ImageNet y se afina sobre el dataset TUMMHCD (Hijam y Saharia, *The Visual Computer* 38, 525-539, 2022), que contiene caracteres Meitei Mayek manuscritos aislados distribuidos en 55 clases. Las tres arquitecturas son ConvNeXt-T, EfficientNetV2-S y ResNet50-D con variante topologica. Los nombres de los ficheros (`convnext_t.pt`, `effv2_s.pt`, `resnet50d_topo.pt`) siguen a los miembros declarados en `config.json`, junto con los pesos del ensemble, las vistas de test-time y las estadisticas de normalizacion.

El preprocesado lleva las entradas a la escala de los escaneos de 24 x 24 del dataset antes del tratamiento habitual, lo que permite tanto fotos subidas como dibujos realizados en lienzo. No se documenta en la informacion disponible el numero de tokens o imagenes de entrenamiento mas alla del test, ni el uso de tecnicas de RLHF/DPO (no aplicables a una tarea de clasificacion). Tampoco se detalla si se aplico data augmentation o de que tipo.

## Capacidades

- Clasificacion de imagenes de caracteres manuscritos Meitei Mayek en 55 clases.
- Reconocimiento de caracteres aislados, no de texto continuo ni de lineas completas.
- Funciona tanto con fotografias subidas como con dibujos realizados en un lienzo (`source="upload"` o `source="canvas"`).
- Inferencia en navegador mediante la version ONNX en float16 de EfficientNetV2-S.
- No dispone de tool calling, function calling ni capacidades de agente.
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No tiene modo de pensamiento (thinking), vision general mas alla de la clasificacion ni procesamiento de audio.
- Capacidades multilingues: no aplica; el modelo solo cubre el script Meitei Mayek.

## Casos de uso

- Digitalizacion de manuscritos en Meitei Mayek: escanear documentos historicos y clasificar cada caracter aislado para construir transcripciones editables, aprovechando la alta precision del ensemble sobre escaneos similares al dataset.
- Herramienta educativa de aprendizaje del alfabeto: una aplicacion web donde el alumno dibuja un caracter en un lienzo y el modelo (via ONNX en el navegador) le devuelve la clase reconocida y la probabilidad, con retroalimentacion inmediata.
- Asistencia al etiquetado de datasets: preanotar grandes colecciones de caracteres manuscritos para que un anotador humano solo revise y corrija, reduciendo el coste de construir nuevos corpus.
- Preservacion linguistica y archivo digital: integrar el reconocedor en un pipeline de digitalizacion de fondos documentales de Manipur para indexar y hacer buscable material en Meitei Mayek.
- Investigacion en reconocimiento de escritura: servir como baseline reproducible para comparar nuevas tecnicas (mas miembros en el ensemble, otras resoluciones, otros datasets) sobre las 55 clases.
- Aplicaciones de accesibilidad: convertir formularios o notas manuscritas en Meitei Mayek a texto digital para su posterior lectura por sintesis de voz o su integracion en gestores documentales.
- Procesamiento por lotes en servidor: con los tres checkpoints PyTorch, ejecutar clasificacion masiva en CPU o GPU sobre colecciones de imagenes ya segmentadas en caracteres aislados.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor | Conjunto de evaluacion |
|---|---|---|---|
| Ensemble (ConvNeXt-T + EfficientNetV2-S + ResNet50-D topo) | Top-1 accuracy | 98,06% | 12.794 imagenes de test (TUMMHCD) |
| EfficientNetV2-S (version ONNX) | Top-1 accuracy | 97,95% | 12.794 imagenes de test (TUMMHCD) |

No se han publicado en la informacion disponible resultados para otros miembros por separado, ni metricas adicionales como precision, recall, F1 o matriz de confusion. El autor advierte que la precision sobre escritura distinta a la de los escaneos de TUMMHCD sera inferior a la cifra de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita, pero al tratarse de CNN pequenas (ConvNeXt-T, EfficientNetV2-S, ResNet50-D) el consumo es muy reducido y cabe ampliamente en cualquier GPU consumer.
- El repositorio completo ocupa 0,3 GB, por lo que los tres checkpoints juntos son ligeros.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero la clasificacion puede ejecutarse en CPU.
- Cabe en GPU consumer y tambien en CPU; la version ONNX float16 esta pensada para ejecutarse en el navegador.
- Opciones de despliegue: PyTorch (carga de los state dicts con `timm`), ONNX Runtime (fichero `web/model.onnx`) y despliegue web en el navegador. Librerias como vLLM, llama.cpp, Ollama o TGI no son aplicables porque el modelo no es un LLM.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada para el reconocimiento de caracteres Meitei Mayek con este nivel de especializacion.

| Modelo | Tipo | Soporte Meitei Mayek | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chingkheinganba/handwritten-meitei-mayek-recognition | Ensemble de CNN para 55 clases | Si, especifico | MIT | HuggingFace + demo en Spaces |
| Tesseract | OCR generalista | No fiable para este script | Apache 2.0 | Ampliamente disponible |
| EasyOCR | OCR generalista (deep learning) | No cubre Meitei Mayek de forma fiable | Apache 2.0 | Ampliamente disponible |
| TrOCR | Transformer OCR (manuscrito e impreso) | No entrenado para Meitei Mayek | MIT (segun variante) | HuggingFace |

## Limitaciones y advertencias

- Solo reconoce caracteres aislados de Meitei Mayek (55 clases); no hace OCR de texto continuo, lineas ni parrafos.
- La precision de 98,06% se mide sobre el conjunto de test de TUMMHCD; el propio autor advierte que la precision cae con escritura distinta a la de esos escaneos.
- El preprocesado reescala las entradas a la escala de los escaneos de 24 x 24, lo que puede degradar imagenes de alta resolucion o con iluminacion y fondo diferentes.
- Sesgos conocidos: no documentados en la informacion disponible; probable sesgo hacia los estilos de escritura y los hablantes representados en TUMMHCD.
- Riesgo de alucinacion: no aplica como tal, pero si puede producir clasificaciones erroneas con alta confianza en caracteres ambiguos o fuera de distribucion.
- Limitacion de idioma: unicamente soporta el script Meitei Mayek; no hay soporte multilingue.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, siempre manteniendo el aviso de copyright y la licencia. Conviene verificar las condiciones del dataset TUMMHCD para reentrenamiento o redistribucion de datos derivados.
- En produccion, conviene validar el modelo con muestras reales del dominio objetivo antes de confiar en la cifra de test, y considerar un umbral de confianza para derivar a revision humana.
- El repositorio no documenta parametros totales, latencia ni throughput, lo que dificulta planificar capacidad sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chingkheinganba/handwritten-meitei-mayek-recognition
- Demo en Spaces: https://huggingface.co/spaces/Chingkheinganba/handwritten-meitei-mayek-recognition
- Codigo de entrenamiento y experimentos (GitHub): https://github.com/chingkheinganba231005/Handwritten-Meitei-Mayek-Recognition
- Dataset de referencia: D. Hijam y S. Saharia, "On developing complete character set Meitei Mayek handwritten character database", *The Visual Computer* 38, 525-539 (2022).
