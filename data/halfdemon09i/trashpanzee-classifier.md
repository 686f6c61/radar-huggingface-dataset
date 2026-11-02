# HalfDemon09I/trashpanzee-classifier

## Resumen

Trashpanzee es un clasificador de imágenes binario desarrollado por el usuario HalfDemon09I que distingue entre papeleras o contenedores de basura (`Trash Can`) y cualquier otro objeto (`Not Trash`). Se trata de un modelo de visión artificial muy ligero, construido sobre una arquitectura MobileNetV2 y exportado en formato TensorFlow Lite con pesos en coma flotante, con un tamano de aproximadamente 2,09 MB. Su proposito es la deteccion de receptaculos de residuos en entornos de borde (edge), donde los recursos de computo y memoria son limitados.

El modelo se ha generado presumiblemente mediante Teachable Machine, la herramienta de entrenamiento sin codigo de Google que produce clasificadores basados en MobileNet y los exporta directamente a TFLite. No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, el proceso de validacion ni metricas de rendimiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB segun la plataforma (consistente con los ~2 MB del fichero TFLite).

La relevancia de este modelo es acotada y muy especifica: sirve como componente de percepcion en prototipos de robotica de limpieza, dispositivos IoT de gestion de residuos o aplicaciones educativas de reciclaje. No es un modelo de proposito general ni compite con clasificadores de vision de gran escala; su interes radica en la simplicidad de despliegue en movil y microcontroladores con soporte TFLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (transfer learning via Teachable Machine) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 RGB) |
| Tipos de cuantizacion | Float32 sin cuantizar (`model_unquant.tflite`); no se incluyen variantes cuantizadas |
| Idiomas soportados | en (etiquetas en ingles; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | TensorFlow Lite (`.tflite`) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV2, una red convolucional disenada para inferencia eficiente en dispositivos moviles y de borde, caracterizada por bloques residuales invertidos con conexiones de atajo y convoluciones separables en profundidad. La entrada es una imagen RGB de 224x224 píxeles normalizada con la transformacion `(pixel / 127.5) - 1.0`, lo que produce valores en el rango [-1.0, 1.0]. La salida es una distribucion de probabilidad sobre dos clases: `0` para `Trash Can` y `1` para `Not Trash`.

No se dispone de informacion sobre el dataset de entrenamiento: ni el numero de imagenes, ni la composicion, ni si se aplicaron tecnicas de aumento de datos, ni si hubo validacion cruzada. El tag `teachable-machine` sugiere que el entrenamiento se realizo con la herramienta de Google, que por defecto utiliza un modelo base MobileNet preentrenado en ImageNet y ajusta la capa final con las imagenes proporcionadas por el usuario. No consta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre papelera o contenedor de basura y cualquier otro objeto.
- Inferencia en dispositivos de borde: el formato TFLite y el tamano de ~2 MB permiten ejecucion en moviles, Raspberry Pi y microcontroladores compatibles con TensorFlow Lite.
- Entrada de imagen RGB de 224x224 con normalizacion documentada.
- Salida de probabilidades por clase, apta para umbralizacion configurable.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: las etiquetas estan en ingles y el modelo no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), vision avanzada mas alla de la clasificacion, audio ni generacion de texto.

## Casos de uso

- Robotica de limpieza autonoma: el modelo puede actuar como detector de papeleras en el pipeline de percepcion de un robot aspirador o de recogida de residuos, permitiendo al robot identificar el objetivo antes de aproximarse. Su tamano reducido permite ejecutarlo a bordo sin GPU dedicada.
- Dispositivos IoT de gestion de residuos: sensores con camara en contenedores urbanos pueden usar el clasificador para verificar que el objeto depositado es una papelera o para monitorizar el estado del contenedor, con inferencia local y sin conectividad cloud.
- Aplicaciones educativas de reciclaje: una app movil puede integrar el modelo TFLite para ensenar a los usuarios a identificar papeleras y fomentar habitos de reciclaje, con retroalimentacion en tiempo real.
- Prototipado rapido en Teachable Machine: el modelo sirve como base para experimentar con clasificacion de residuos y ampliar las clases (vidrio, plastico, organico) en fases posteriores.
- Automatizacion de tareas de vision en edge con bajo consumo: en despliegues donde no es viable enviar imagenes a la nube, el modelo ofrece clasificacion local con un coste computacional minimo.
- Filtrado previo en pipelines de vision: puede usarse como etapa de descarte rapido para decidir si una imagen contiene una papelera antes de pasarla a un modelo mas pesado de deteccion o segmentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo TFLite Float32 de ~2 MB puede ejecutarse en CPU sin GPU dedicada. La memoria RAM necesaria es del orden de decenas de MB, incluyendo el runtime de TFLite.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU en moviles, Raspberry Pi, Coral Edge TPU (previa conversion a cuantizacion int8, no incluida) y microcontroladores con TensorFlow Lite Micro si se convierte adecuadamente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) de forma trivial, aunque no es su entorno objetivo.
- Opciones de despliegue: TensorFlow Lite Interpreter (`ai-edge-litert`, `tflite_runtime` o `tensorflow.lite`), con el script `example_inference.py` incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trashpanzee (este modelo) | no disponible (~2,09 MB) | 224x224 RGB | Clasificacion binaria papelera/no papelera | MIT | HuggingFace |
| MobileNetV2 (base ImageNet) | ~3,4 M | 224x224 RGB | Clasificacion 1000 clases | Apache 2.0 | TensorFlow Hub, Keras |
| EfficientNet-Lite0 | ~4,7 M | 224x224 RGB | Clasificacion 1000 clases | Apache 2.0 | TensorFlow Hub |
| YOLOv8n (deteccion) | ~3,2 M | variable | Deteccion de objetos | AGPL-3.0 | Ultralytics |

La comparativa es orientativa: Trashpanzee es un clasificador binario especializado, mientras que MobileNetV2 y EfficientNet-Lite0 son clasificadores genericos de 1000 clases y YOLOv8n es un detector de objetos. No se dispone de datos de rendimiento de Trashpanzee para comparar metricas de precision.

## Limitaciones y advertencias

- No se han publicado metricas de precision, recall, F1 ni matrices de confusion; se desconoce su fiabilidad real en produccion.
- El dataset de entrenamiento no esta documentado: se desconoce la diversidad de imagenes, la presencia de sesgos demograficos o geograficos y la robustez ante condiciones de iluminacion, angulos o fondos variados.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: al ser un clasificador binario, puede confundir objetos con papeleras o viceversa, especialmente en dominios distintos al de entrenamiento.
- Limitacion de idioma: las etiquetas estan en ingles y el modelo no procesa texto; la interfaz de uso debe traducir las clases si se despliega en castellano.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero se recomienda conservar el aviso de copyright. No se especifican restricciones adicionales.
- Caveat de produccion: el fichero `labels.txt` contiene una errata (`Not Tash`) que el script de ejemplo corrige manualmente; cualquier integracion debe replicar esa correccion o normalizar las etiquetas.
- El modelo esta en Float32 sin cuantizar; para despliegue en microcontroladores o Edge TPU seria necesaria una conversion a int8 no incluida en el repo.
- No se documenta el proceso de validacion ni la version de TensorFlow Lite utilizada, lo que puede afectar a la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/HalfDemon09I/trashpanzee-classifier
- Teachable Machine (herramienta de origen probable): https://teachablemachine.withgoogle.com/
- Documentacion de TensorFlow Lite: https://www.tensorflow.org/lite
- ai-edge-litert (runtime recomendado en el quickstart): https://pypi.org/project/ai-edge-litert/
- MobileNetV2 (paper de referencia): https://arxiv.org/abs/1801.04381
