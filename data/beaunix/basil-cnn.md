# beaunix/basil-cnn

## Resumen

Basil-cnn, publicado por el usuario beaunix (Bryan David Castano) bajo el identificador `beaunix/basil-cnn`, es un clasificador de imagenes de platos y articulos de menu construido sobre la arquitectura EfficientNetV2-Small y entrenado con TensorFlow/Keras. El modelo es el componente de vision que da soporte a Basil, el clasificador de menu de la aplicacion de comercio electronico Maison-Roast, una tienda de cafe de estetica vintage. Resuelve una tarea acotada: asignar una fotografia de comida a una de 41 clases (40 clases de menu mas una clase "unknown").

Se trata de un modelo de vision, no de un modelo de lenguaje: no procesa texto, no dispone de ventana de contexto en tokens ni soporta generacion. Su relevancia es la de un caso practico de transferencia de una arquitectura eficiente y moderna (EfficientNetV2) a un catalogo cerrado de clases, con dos formatos de pesos publicados para facilitar tanto la inferencia como el reajuste fino.

La limitacion mas importante es la licencia: el autor la marca como `other` con nombre `research-only-food101-derived` y restringe explicitamente el uso a investigacion y educacion, porque las imagenes de Food-101 proceden de Foodspotting y no son propiedad de ETH Zurich. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-Small (red convolucional) |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); no disponible la resolucion de entrada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision nativa) |
| Idiomas soportados | no disponible; no aplica a la tarea de clasificacion de imagenes (el mapa de etiquetas procede de Food-101) |
| Licencia | other / research-only-food101-derived (solo investigacion y uso educativo) |
| Formato de pesos | Keras nativo (`.keras`) y HDF5 legacy (`.h5`); el repositorio lleva la etiqueta `onnx`, aunque no se lista ningun fichero ONNX |
| Numero de clases | 41 (40 clases de menu + 1 clase "unknown") |
| Framework | TensorFlow / Keras |
| Tarea (pipeline) | image-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-Small, una red convolucional de la familia EfficientNetV2 que combina escalado compuesto con bloques de convolucion con atencion y entrenamiento progresivo. El autor no documenta el numero de parametros, la resolucion de entrada, el numero de epocas ni la estrategia de ajuste fino empleada. El modelo resuelve una clasificacion multiclase de 41 etiquetas, con una clase adicional "unknown" que permite descartar entradas que no corresponden a ningun elemento del menu.

Los datos de entrenamiento proceden de un pipeline ETL construido sobre Food-101 (Bossard, Guillaumin y Van Gool, ECCV 2014, ETH Zurich), concretamente a partir de la re-subida a Kaggle `kmader/food41`. El autor indica que dispone de manifiestos de train/val/test y de un mapa de etiquetas. No se menciona ningun tipo de ajuste por preferencias humanas (RLHF, DPO), algo que no aplica a un clasificador de imagenes. Tampoco se documentan innovaciones tecnicas adicionales sobre la arquitectura base ni tecnicas de decodificacion, al no ser un modelo generativo.

## Capacidades

- Clasificacion de imagenes de comida en 41 clases: 40 categorias de menu mas una clase "unknown".
- Inferencia directa mediante `tf.keras.models.load_model` sobre lotes de imagenes (`model.predict`).
- Reajuste fino y reentrenamiento, ya que se publica el formato nativo `.keras` pensado para fine-tuning.
- Carga en entornos antiguos de Keras/TensorFlow gracias al checkpoint HDF5 `.h5`.
- Exportacion potencial a otros runtimes: el repositorio lleva la etiqueta `onnx`, aunque no se ha publicado ningun artefacto ONNX verificado.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural de ningun tipo.
- No dispone de modo "thinking", vision-lenguaje, audio ni multimodalidad mas alla de la entrada de imagen.

## Casos de uso

- Clasificacion de fotografias de platos en una app de hosteleria: el modelo asigna la imagen subida por el usuario a una de las 40 clases de menu, lo que permite poblar un carrito o una ficha de producto sin intervencion manual.
- Digitalizacion asistida de cartas y catalogos: a partir de fotografias de producto se genera automaticamente la categoria del articulo, reduciendo el trabajo de etiquetado en la carga de catalogos.
- Pre-etiquetado de datasets gastronomicos propios: el modelo actua como etiquetador inicial sobre lotes de imagenes, y despues un revisor humano corrige, lo que reduce el coste de anotacion.
- Filtrado de entradas irrelevantes: la clase "unknown" permite descartar imagenes que no corresponden a ningun elemento del menu antes de pasarlas a un sistema posterior.
- Base para transfer learning en dominios gastronomicos concretos: partiendo del formato `.keras`, se puede reajustar el modelo con fotografias propias de un restaurante o de una region culinaria distinta.
- Docencia y proyectos de fin de estudios en vision por computador: sirve como ejemplo completo y reproducible de pipeline ETL mas clasificador convolucional, con pesos publicados y licencia compatible con uso academico.
- Comparacion de arquitecturas en investigacion: EfficientNetV2-Small puede usarse como linea base dentro de estudios que comparen familias convolucionales sobre Food-101 o sobre subconjuntos derivados.

En todos los casos, el uso debe mantenerse dentro del marco de investigacion y educacion: el despliegue comercial sobre imagenes de menu queda explicitamente excluido por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de exactitud, F1, matriz de confusion ni comparaciones con otras arquitecturas sobre las 41 clases del catalogo propio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, el repositorio de pesos ocupa 0,1 GB, por lo que la inferencia en precision nativa queda muy por debajo de 1 GB de VRAM en el peor caso de un lote pequeno (estimacion a partir del tamano publicado, no confirmada por el autor).
- GPU recomendadas: no disponible; dado el tamano del modelo, cualquier GPU con al menos unos pocos GB de memoria es suficiente en la practica.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo actual, aunque el autor no publica requisitos minimos ni resultados medidos.
- CPU: viable para inferencia por lotes pequenos dado el tamano del modelo, sin datos de latencia publicados.
- Opciones de despliegue: carga nativa con TensorFlow/Keras (`tf.keras.models.load_model`) y HDF5 para entornos antiguos; el repositorio incluye la etiqueta `onnx`, lo que sugiere una intencion de exportacion a ONNX Runtime, pero no se ha publicado ningun fichero con ese formato. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beaunix/basil-cnn | Clasificacion de imagenes de menu | EfficientNetV2-Small | 41 (40 + unknown) | research-only-food101-derived | Pesos `.keras` y `.h5` en HuggingFace |
| Food-101 (Bossard et al., ECCV 2014) | Clasificacion de imagenes de comida | Random Forests sobre componentes discriminativos | 101 | Dataset con imagenes de Foodspotting; uso cientifico sujeto a negociacion con los propietarios | Dataset publico en ETH Zurich y re-subida en Kaggle (`kmader/food41`) |
| beaunix/aegis-sentinel | Clasificacion de video (deteccion de violencia) | ResNet-50 con atencion temporal | no disponible | CC-BY-NC-ND-4.0 | Pesos en HuggingFace, 298 MB |

Las cifras de exactitud de las tres alternativas no estan disponibles en la informacion consultada, por lo que no se puede establecer una comparacion de rendimiento entre ellas.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye como `other` con nombre `research-only-food101-derived`. El uso comercial sobre imagenes de menu exigiria resolver los derechos de las fotografias originales con sus propietarios en Foodspotting, algo que el propio autor califica de impracticable a esta escala.
- La restriccion no proviene de la arquitectura ni de los pesos, sino de los datos de entrenamiento; reentrenar desde cero con imagenes propias no hereda esta limitacion, pero el modelo publicado si.
- Riesgo de alucinacion: en un clasificador esto se traduce en falsos positivos. La clase "unknown" mitiga parcialmente el problema, pero no hay datos publicados sobre su tasa de acierto.
- Sesgo de dominio: el entrenamiento proviene de Food-101, con fotografias de estilo y procedencia acotados (Foodspotting). El rendimiento en fotografias de menus de otras culturas, con iluminacion distinta o con platos compuestos, no esta documentado.
- Sesgo de etiqueta: las 40 clases de menu son una seleccion derivada de Food-101; los articulos fuera de ese conjunto solo pueden caer en "unknown" o producir una clasificacion incorrecta.
- Cobertura: 41 clases es un catalogo cerrado y pequeno en comparacion con los 101 de Food-101, lo que limita su uso directo fuera del contexto para el que se diseno.
- No hay metricas publicadas: sin exactitud, matriz de confusion ni resultados por clase, no es posible estimar la calidad real del modelo antes de desplegarlo.
- Sin soporte de texto: no puede interpretar la descripcion de un plato ni combinar imagen y lenguaje.
- Colision de nombre: las busquedas sobre "basil" devuelven de forma mayoritaria trabajos de fenotipado de la planta de albahaca con redes convolucionales, sin relacion alguna con este modelo.
- Madurez del repositorio: 0 descargas, 0 likes y sin comunidad activa, lo que reduce la probabilidad de encontrar soporte o correcciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beaunix/basil-cnn
- Perfil del autor: https://huggingface.co/beaunix
- Otro modelo del mismo autor (aegis-sentinel): https://huggingface.co/beaunix/aegis-sentinel
- Licencia de Food-101: https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/kmader/food41
- Paper de Food-101 (Bossard, Guillaumin, Van Gool, ECCV 2014), citado en la model card mediante BibTeX.
- Directorio de modelos de beaunix en catalogo de terceros: https://essamamdani.com/ai-models/company/beaunix
