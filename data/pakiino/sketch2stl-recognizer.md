# pakiino/sketch2stl-recognizer

## Resumen

sketch2stl-recognizer no es un modelo de lenguaje, sino un clasificador tabular entrenado con scikit-learn que asigna una etiqueta geométrica a un unico trazo dibujado a mano. El modelo distingue cinco clases: linea, arco, circulo, rectangulo y polilinea, y forma parte de la aplicacion sketch2stl (dibujar una forma 2D, obtener un STL imprimible). Lo desarrolla el autor pakiino y se distribuye como un unico fichero `model.joblib` para ser cargado mediante la clase `MLRecognizer`.

El modelo es deliberadamente pequeno y ligero: repositorio de 0.0 GB y cero descargas registradas en HuggingFace. Se entreno desde cero con un `HistGradientBoostingClassifier` sobre 12 caracteristicas geometricas extraidas de cada trazo (`sketch2stl.recognizer.features`), a partir de 51.888 trazos sinteticos derivados de curvas CAD del dataset Fusion 360 Gallery.

Su relevancia practica esta en el nicho CAD/impresion 3D: sustituye una capa de reglas heuristicas por un clasificador supervisado, mejorando el macro-F1 en trazos sinteticos de 0.798 a 0.948, aunque con una degradacion notable en trazos humanos reales (0.724). Es un ejemplo de modelo de produccion embebido en una app interactiva, donde el usuario siempre ve y puede corregir la prediccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingClassifier (gradient boosting sobre caracteristicas tabulares), scikit-learn |
| Parametros totales | no disponible (no se publica el recuento de arboles ni de hojas) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (clasifica un unico trazo descrito por un vector de 12 caracteristicas) |
| Tipos de cuantizacion | no aplicable (no es un modelo de pesos neuronales) |
| Idiomas soportados | no aplicable (no procesa texto) |
| Licencia | other — fusion-360-gallery-dataset-license (uso no comercial, solo investigacion) |
| Formato de pesos | joblib (`model.joblib`) |
| Tarea | clasificacion tabular multiclase |
| Clases | line, arc, circle, rect, polyline |
| Numero de caracteristicas de entrada | 12 (geometricas) |
| Tamano del repositorio | 0.0 GB |
| Dataset de entrenamiento | pakiino/sketch2stl-datasets |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado de gradiente boosting (`HistGradientBoostingClassifier` de scikit-learn) que opera sobre representaciones tabulares. Cada trazo se resume en 12 caracteristicas geometricas calculadas por el modulo `sketch2stl.recognizer.features`; el clasificador mapea ese vector a una de las cinco clases de trazo. No emplea redes neuronales, atencion ni ningun componente de lenguaje, y su inferencia es puramente CPU.

El entrenamiento se realizo desde cero con 51.888 trazos sinteticos dibujados a mano generados a partir de curvas CAD del Fusion 360 Gallery. Las etiquetas provienen del historial CAD; 200 trazos fueron auditados manualmente (con 3 descartados) y se usa la etiqueta humana en esos casos. La mitad de los trazos se redibujaron con un modelo de raton cuyo temblor por clase se calibro sobre trazos reales del autor (PK). La particion de train/test se hizo por proyecto CAD para evitar fuga de informacion entre conjuntos.

## Capacidades

- Clasificacion de un unico trazo en cinco categorias geometricas: linea, arco, circulo, rectangulo y polilinea.
- Extraccion implicita de 12 caracteristicas geometricas por trazo, integradas en el pipeline de la aplicacion.
- Reconocimiento en el contexto de una app interactiva de dibujo 2D a STL, con correccion manual por parte del usuario.
- Ejecucion en CPU con latencia muy baja, apta para inferencia en tiempo real dentro de la interfaz.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento ni de generacion de texto.

## Casos de uso

- Reconocimiento de trazos en la app sketch2stl: el modelo clasifica cada trazo a medida que el usuario dibuja, permitiendo convertir bocetos 2D en geometria CAD y de ahi en STL imprimible; encaja porque la latencia en CPU es minima y el usuario valida el resultado.
- Sustitucion de heuristicas geometricas: integrado alli donde una capa de reglas clasifica trazos, el modelo eleva el macro-F1 de 0.798 a 0.948 en trazos sinteticos, con una mejora directa en precision de linea y arco.
- Herramientas de anotacion CAD asistida: ayuda a etiquetar automaticamente curvas extraidas de historiales CAD para acelerar la revision manual, dado que el modelo esta entrenado sobre ese dominio.
- Prototipado de interfaces de dibujo tecnico: sirve como componente de referencia para validar pipelines de sketch a solido en herramientas educativas o de investigacion.
- Filtrado previo en pipelines de vectorizacion: clasificar el tipo de trazo antes de aplicar el ajuste geometrico correspondiente (por ejemplo, decidir si ajustar un circulo o una polilinea).
- Investigacion sobre reconocimiento de bocetos: como punto de partida reproducible (licencia de investigacion) para comparar features geometricas frente a enfoques neuronales en reconocimiento de trazos.
- Demostracion embebida en escritorio: al ser un `joblib` pequeno y sin GPU, puede empaquetarse en aplicaciones locales de dibujo a STL sin dependencias pesadas.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Conjunto de test | n | macro-F1 reglas (baseline) | macro-F1 ML |
|---|---|---|---|
| Sintetico, proyectos reservados | 3440 | 0.798 | 0.948 |
| Real dibujado a mano (PK, raton) | 325 | 0.869 | 0.724 |

F1 por clase en trazos reales:

| Clase | F1 |
|---|---|
| line | 0.9922 |
| arc | 0.9848 |
| circle | 0.16 |
| rect | 0.8814 |
| polyline | 0.602 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque no son aplicables a un clasificador de trazos.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el modelo es un clasificador de scikit-learn, no requiere GPU.
- VRAM: no aplicable; no usa memoria de GPU.
- GPU recomendadas: ninguna; el modelo no aprovecha aceleradores graficos.
- Cabe en cualquier equipo, incluidos portatiles y sistemas embebidos, dado el tamano del repositorio (0.0 GB) y la naturaleza del `joblib`.
- Despliegue mediante Python con scikit-learn y joblib; se carga con `MLRecognizer("model.joblib")` en la app sketch2stl. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma numerica, pero al tratarse de un boosting sobre 12 features y CPU, la inferencia por trazo es de orden inferior al milisegundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos publicos comparables en la documentacion proporcionada. La unica referencia comparable es el propio baseline de reglas heuristicas incluido en la evaluacion:

| Sistema | Tipo | macro-F1 sintetico | macro-F1 real |
|---|---|---|---|
| sketch2stl-recognizer | Gradient boosting (12 features) | 0.948 | 0.724 |
| Reglas geometricas | Heuristicas | 0.798 | 0.869 |

El modelo ML supera claramente a las reglas en trazos sinteticos, pero queda por debajo de estas en trazos humanos reales, lo que indica un problema de generalizacion al dominio real.

## Limitaciones y advertencias

- Rendimiento pobre en la clase circulo sobre trazos reales (F1 de 0.16) y moderado en polilinea (0.602); el sistema puede confundir circulos con arcos o polilineas.
- Fuerte brecha entre evaluacion sintetica (0.948) y real (0.724): el modelo se entrena mayoritariamente con trazos sinteticos.
- Todos los trazos reales de test provienen de una sola persona dibujando con raton; no hay validacion con otros estilos, dispositivos ni usuarios.
- El autor advierte explicitamente que no debe usarse con otros estilos de dibujo sin re-verificar los resultados.
- No es un modelo de lenguaje: no genera texto y el concepto de alucinacion no aplica; el riesgo es de misclasificacion geometrica silenciosa.
- Licencia `fusion-360-gallery-dataset-license`: derivada del Fusion 360 Gallery Dataset de Autodesk, restringida a uso no comercial y solo para investigacion. No apta para uso comercial sin autorizacion.
- Sin datos publicados de sesgo demografico, pero la dependencia de un unico autor de trazos reales implica un sesgo de estilo claro.
- Dependencia del pipeline `sketch2stl.recognizer.features`: cambios en la extraccion de las 12 caracteristicas pueden invalidar el modelo.
- Cero descargas y cero likes: sin adopcion ni validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pakiino/sketch2stl-recognizer
- Dataset en HuggingFace: https://huggingface.co/datasets/pakiino/sketch2stl-datasets
- Ficheros del dataset: https://huggingface.co/datasets/pakiino/sketch2stl-datasets/tree/main
- Licencia (Fusion 360 Gallery Dataset, Autodesk): https://github.com/AutodeskAILab/Fusion360GalleryDataset
