# neilhawkins/adaface-ir50-coreml

## Resumen

AdaFace IR-50 (WebFace4M) para Core ML es una conversión del modelo de reconocimiento facial AdaFace, desarrollado originalmente por Minchul Kim, Anil K. Jain y Xiaoming Liu (CVPR 2022), empaquetada en formato Core ML por el desarrollador neilhawkins. El modelo emplea una arquitectura ResNet-50 de tipo IR (Improved Residual) entrenada sobre el dataset WebFace4M para generar embeddings faciales de 512 dimensiones. Su propósito es la verificación e identificación de identidades a partir de imágenes de rostros alineados.

La relevancia de esta ficha reside en que se trata de un artefacto de despliegue para el ecosistema Apple: el modelo se distribuye compilado en 16 bits para macOS 15 o posterior y está pensado para ejecutarse en dispositivos de la gama Apple mediante Core ML, sin necesidad de infraestructura GPU dedicada. El autor lo utiliza en Contact, una aplicación macOS de archivo fotográfico familiar orientada a reconocer personas en copias escaneadas.

La innovación central del método AdaFace es el margen adaptativo a la calidad (quality adaptive margin): la función de pérdida ajusta el margen en función de la norma de la característica, de modo que los rostros de baja calidad reciben un tratamiento distinto al de las imágenes nítidas. La conversión conserva esta propiedad exponiendo la norma como salida adicional, lo que permite filtrar embeddings poco fiables en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 IR (Improved Residual), red de extraccion de embeddings faciales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | 16 bits (precision de la compilacion Core ML); otras no disponibles |
| Idiomas soportados | no aplica (reconocimiento facial, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` compilado, empaquetado en `AdaFace.mlmodelc.zip` (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo base es AdaFace con backbone IR-50, una variante de ResNet-50 con bloques residuales mejorados habitual en reconocimiento facial. Se entreno sobre WebFace4M, un dataset de gran escala de rostros para entrenamiento de modelos de verificacion facial. La innovacion metodologica de AdaFace es una funcion de perdida con margen adaptativo a la calidad: el margen aplicado en el espacio angular se modula segun la norma de la caracteristica de la imagen de entrada, de forma que las muestras de baja calidad (borrosas, mal iluminadas u ocluidas) no dominan el entrenamiento y el modelo aprende representaciones mas robustas.

La conversion a Core ML se realizo con coremltools 8.3.0 a partir del checkpoint `adaface_ir50_webface4m.ckpt` (SHA-256 `52cca7c64808fea6f44f9b9aee2b0e091bf96c1ab4f6e31bedcdf5d77009b4f8`). Segun la model card, Core ML y PyTorch coincidieron con una similitud coseno de 1.000 sobre una entrada de prueba. El modelo compilado opera a 16 bits y realiza internamente el escalado de la imagen de entrada al rango −1…1 en orden de canales BGR, por lo que el consumidor solo debe proporcionar la imagen alineada.

## Capacidades

- Extraccion de embeddings faciales: dada una imagen de rostro de 112×112 alineada al template de cinco puntos de ArcFace, produce un vector unitario de 512 valores.
- Verificacion de identidad: la similitud coseno entre embeddings del mismo individuo se aproxima a 1, lo que permite umbrales de comparacion directos.
- Salida de norma de caracteristica: el modelo expone `norm`, un indicador de calidad del rostro que resulta bajo en imagenes deficientes y sirve para descartar embeddings no fiables.
- Preprocesado integrado: escala la entrada a −1…1 en orden BGR de forma interna, reduciendo el codigo de integracion necesario.
- Ejecucion en dispositivo: al estar en formato Core ML, se ejecuta de forma nativa en macOS 15 o posterior sin dependencias de Python ni de CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es exclusivamente un modelo de vision para reconocimiento facial.

## Casos de uso

- Archivo fotografico familiar: agrupar copias escaneadas por persona comparando los embeddings de los rostros detectados y alineados, con la norma como filtro para descartar caras borrosas o parciales. Es el caso de uso original de la aplicacion Contact.
- Organizacion de bibliotecas de fotos en macOS: indexar un catalogo local y etiquetar automaticamente las personas recurrentes, ejecutando la inferencia en el propio Mac sin enviar imagenes a la nube.
- Control de acceso en aplicaciones de escritorio: verificar la identidad de un usuario comparando el embedding de una captura en vivo con el embedding de referencia almacenado, aplicando un umbral de similitud coseno.
- Deduplicacion de retratos en pipelines de digitalizacion: detectar la misma persona en lotes de imagenes escaneadas y consolidar metadatos, usando la norma para priorizar las mejores capturas como referencia.
- Etiquetado asistido en herramientas de gestion documental: sugerir nombres de personas en fotografias de archivo historico, dejando la confirmacion final al operador humano.
- Prototipado de sistemas biometricos en Apple Silicon: servir como componente de reconocimiento facial en pruebas de concepto que requieran inferencia local de baja latencia en un Mac, sin infraestructura GPU externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la equivalencia numerica entre la salida de Core ML y la de PyTorch (similitud coseno de 1.000 sobre una entrada de prueba), que valida la fidelidad de la conversion pero no el rendimiento del modelo en tareas de verificacion.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo Core ML, no consume VRAM de GPU dedicada en el sentido convencional; se ejecuta sobre los frameworks de aceleracion de Apple (CPU, GPU integrada o Neural Engine) segun la politica de Core ML.
- GPU recomendadas: no aplica en el sentido de GPUs NVIDIA; el destino es hardware Apple con macOS 15 o posterior. Para reentrenamiento o conversion desde PyTorch seria necesaria una GPU compatible con el framework original, dato no especificado en la informacion disponible.
- Compatibilidad con GPU de consumo: el modelo esta pensado para ejecutarse en Macs con Apple Silicon o Intel compatibles con macOS 15; no se distribuye en formatos para GPU de consumo tipo RTX.
- Opciones de despliegue: Core ML de forma nativa (el artefacto es un `.mlmodelc` compilado). No se proporcionan pesos en safetensors, GGUF ni otros formatos; para usarlo fuera del ecosistema Apple habria que recurrir al repositorio original de AdaFace.
- Latencia y throughput: no disponibles. El tamano del repo (0,1 GB) y la compilacion a 16 bits sugieren un modelo ligero, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Dataset de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| AdaFace IR-50 (esta ficha) | ResNet-50 IR | 512 | WebFace4M | MIT | Core ML (16 bits) |
| AdaFace IR-50 original | ResNet-50 IR | 512 | WebFace4M | MIT | PyTorch checkpoint |
| ArcFace | ResNet-50 / 100 | 512 | MS1MV2, etc. | MIT (implementacion) | PyTorch |
| FaceNet | Inception-ResNet | 128 / 512 | VGGFace2, etc. | MIT (implementacion) | TensorFlow / PyTorch |

La comparativa se limita a caracteristicas estructurales conocidas; no se dispone de datos de benchmarks en la informacion proporcionada para comparar precision entre estos modelos. La diferencia practica de esta ficha frente a las alternativas es el empaquetado Core ML listo para produccion en macOS, mientras que los demas requieren conversion adicional.

## Limitaciones y advertencias

- Solo acepta rostros alineados al template de cinco puntos de ArcFace a 112×112; sin una etapa previa de deteccion y alineacion, los embeddings careceran de validez.
- La salida de norma baja indica rostros de mala calidad; ignorar este indicador puede degradar gravemente la precision de verificacion.
- No se han publicado metricas de precision, sesgo ni robustez en la informacion disponible; no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- Riesgo de sesgo demografico inherente al dataset WebFace4M y al metodo original, no cuantificado en esta ficha.
- El modelo no genera texto ni razona; cualquier expectativa de capacidades linguisticas o de agentes es inaplicable.
- Licencia MIT, que permite uso comercial, pero el aviso de copyright de Minchul Kim (2022) debe conservarse segun los terminos de la licencia original.
- Dependencia de macOS 15 o posterior; no es portable a Linux ni Windows sin reconvertir desde el checkpoint original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre este artefacto concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neilhawkins/adaface-ir50-coreml
- Repositorio original de AdaFace: https://github.com/mk-minchul/AdaFace
- Paper AdaFace (CVPR 2022): Kim, M., Jain, A. K., and Liu, X. *AdaFace: Quality Adaptive Margin for Face Recognition.*
