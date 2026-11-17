# AnupamK/panecho-onnx

## Resumen

PanEcho ONNX es la exportación a formato ONNX del modelo oficial PanEcho, publicado por el equipo de CarDS-Yale (repositorio `CarDS-Yale/PanEcho`, commit `836c46ef6bc4eace50b7dc36704ecef2d33affde`). El autor de esta conversión es el usuario de Hugging Face AnupamK, que se limita a transformar el checkpoint publicado sin reentrenamiento ni ajuste de umbrales. Se trata, por tanto, de un artefacto de despliegue derivado, no de un modelo nuevo.

El modelo procesa vídeo ecocardiográfico: recibe un tensor de fotogramas de forma `[1, 3, 16, 224, 224]` en formato OpenCV BGR (redimensionado a 256 con interpolación INTER_AREA, recorte central a 224 y normalización ImageNet) y devuelve un tensor `preds` de forma `[1, 58]` con las salidas de 40 tareas concatenadas según el orden de `panecho_manifest.json`, con las activaciones ya aplicadas. La diferencia absoluta máxima frente a PyTorch sobre una entrada fija es de 6,19e-03, lo que indica una conversión fiel dentro de tolerancias numéricas razonables.

La relevancia de esta ficha es acotada: el repo pesa 0,4 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la propia model card lo restringe a uso de investigación, señalando explícitamente que no es un dispositivo médico. Su interés práctico está en desplegar PanEcho en entornos de inferencia ONNX Runtime sin dependencia de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vídeo de ecocardiografía; arquitectura interna no documentada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (entrada de vídeo de 16 fotogramas de 224x224) |
| Tipos de cuantizacion | no disponible (se distribuye un único grafo ONNX en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a `LICENSES.md` del repositorio upstream) |
| Formato de pesos | ONNX, opset 17, 168.457.629 bytes |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card de esta conversión solo describe la interfaz de entrada y salida y el proceso de exportación, no la topología de red. Por el tipo de tarea (vídeo de ecocardiografía con 40 salidas de tarea y una salida de regresión GLS) se trata de un modelo de vídeo con múltiples cabezas de predicción, pero la información disponible no permite confirmar si usa un backbone CNN 3D, un transformer de vídeo o una arquitectura híbrida.

Tampoco se documentan en esta ficha el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. El autor indica explícitamente que la conversión se hizo "from the published checkpoint; no retraining or threshold tuning", de modo que cualquier detalle de entrenamiento debe consultarse en el repositorio original `CarDS-Yale/PanEcho`. La innovación técnica destacable de este artefacto es la propia exportación: grafo ONNX con opset 17, salidas con activaciones ya aplicadas y una desviación máxima de 6,19e-03 frente a PyTorch en una entrada fija, lo que facilita la portabilidad a runtimes no-PyTorch.

## Capacidades

- Predicción multi-tarea sobre vídeo de ecocardiografía: 40 tareas concatenadas en un vector de 58 valores de salida.
- Regresión de GLS (global longitudinal strain) como salida aprendida, según advierte la model card.
- Estimación de probabilidad de alteración de la motilidad parietal (wall motion) a nivel de estudio.
- Procesamiento de clips de 16 fotogramas a resolución 224x224 con preprocesado fijo (BGR, resize 256 INTER_AREA, center crop 224, normalización ImageNet).
- Inferencia portable vía ONNX Runtime, sin necesidad de PyTorch en el entorno de despliegue.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Investigación clínica retrospectiva: procesar cohortes de ecocardiogramas almacenados y obtener las 40 salidas de tarea de forma batch mediante ONNX Runtime, aprovechando que el grafo no requiere PyTorch y se integra en pipelines de análisis existentes.
- Prototipado de herramientas de apoyo a la lectura de eco: usar las salidas de GLS y wall motion como señales preliminares en un entorno de investigación, siempre con revisión por cardiólogo y sin uso diagnóstico.
- Validación de pipelines de preprocesado: al estar fijado el pipeline (BGR, resize 256 INTER_AREA, center crop 224, normalización ImageNet), sirve como referencia reproducible para comprobar que un pipeline propio produce tensores equivalentes.
- Comparación PyTorch vs ONNX: la diferencia máxima documentada de 6,19e-03 permite usar el modelo como caso de prueba para verificar la equivalencia numérica de una cadena de exportación propia.
- Despliegue en entornos con recursos limitados: un artefacto de 168.457.629 bytes en un único grafo ONNX es adecuado para servicios de inferencia ligeros en CPU o GPU única, sin stack de entrenamiento.
- Docencia y reproducción de resultados: al estar anclado a un commit concreto del repositorio upstream, facilita la reproducibilidad de experimentos académicos sobre el modelo PanEcho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico de rendimiento es la diferencia máxima absoluta entre PyTorch y ONNX Runtime sobre una entrada fija: 6,19e-03.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo pesa 168.457.629 bytes (~161 MiB) en float32, por lo que los pesos caben holgadamente en cualquier GPU consumer, si bien el consumo real de activaciones para un lote de vídeo de 16x224x224 no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del artefacto, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder alojar los pesos.
- Cabida en GPU consumer: previsiblemente sí en la práctica totalidad de tarjetas actuales, dado el tamaño del grafo, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto, opset 17). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (análisis de vídeo ecocardiográfico multi-tarea) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Restricción de uso: la model card indica "Research use only. Not a medical device". No debe emplearse en diagnóstico ni en decisiones clínicas.
- Las salidas de tarea son estimaciones del modelo; el GLS es una regresión aprendida y el wall motion una probabilidad a nivel de estudio, no una medición real de strain tracking.
- Licencia no declarada en el repo de Hugging Face; la model card remite a `LICENSES.md` del repositorio upstream, por lo que el uso comercial queda sin determinar hasta consultar esa fuente.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas o sobreconfiadas en las 40 tareas; no se documentan métricas de calibración.
- Limitaciones de contexto e idioma: el modelo no procesa texto; la entrada está restringida a clips de 16 fotogramas a 224x224 con un preprocesado concreto, y cualquier desviación del mismo puede degradar los resultados.
- Advertencia de integridad del artefacto: el autor pide verificar el tamaño en bytes tras la descarga (168.457.629 bytes).
- El repo no declara pipeline, idiomas ni licencia, y no tiene descargas ni likes, lo que reduce la evidencia comunitaria sobre su funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnupamK/panecho-onnx
- Repositorio upstream PanEcho: https://github.com/CarDS-Yale/PanEcho
- Commit de referencia del checkpoint original: `836c46ef6bc4eace50b7dc36704ecef2d33affde` (repositorio CarDS-Yale/PanEcho)
- Fichero de manifiesto de tareas: `panecho_manifest.json` (incluido en el repo del modelo)
- Fichero de licencias upstream: `LICENSES.md` (repositorio CarDS-Yale/PanEcho)
