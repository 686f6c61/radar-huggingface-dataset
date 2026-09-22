# eandujar/nn_automl_notebook

## Resumen

`eandujar/nn_automl_notebook` es un repositorio de HuggingFace que contiene un clasificador de imágenes entrenado con AutoGluon `MultiModalPredictor`, usando exclusivamente la rama `timm_image` sobre un backbone preentrenado de la librería TIMM. No es un modelo de lenguaje: es un modelo de visión por computador para clasificación binaria, con la variable objetivo `extrudable`, entrenado sobre el dataset `sunkaiwen/sketch2stl-sketches-image`. El autor evaluó varios backbones de TIMM con las mismas particiones fijas de entrenamiento y validación, y retuvo el checkpoint con mayor balanced accuracy de validación: `repghostnet_200`, con un valor reportado de `1.000000`.

El interés del repositorio es doble. Por un lado, documenta un flujo de AutoML aplicado a visión (barrido aleatorizado de backbones, selección por métrica fija, empaquetado del predictor ganador). Por otro, sirve como ejemplo de clasificador ligero orientado a un problema muy concreto del ámbito de la impresión 3D: decidir si un diseño (presumiblemente derivado de bocetos o mallas) es extruible. El repositorio ocupa 1,1 GB e incluye únicamente el predictor ganador y los ficheros necesarios para inferencia, según la model card.

Se trata de un artefacto educativo y de investigación con adopción nula (0 descargas, 0 likes en el momento de la consulta) y sin licencia declarada. La model card es breve y no publica número de parámetros, resolución de entrada, composición del dataset, licencia ni idiomas. Cualquier uso en producción exige validar primero el modelo contra datos propios, dado que el 1,000000 de balanced accuracy en validación es un resultado que merece escepticismo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) de clasificación de imágenes; backbone TIMM `repghostnet_200`, gestionado por AutoGluon `MultiModalPredictor` con `timm_image` como única rama |
| Parametros totales | no disponible (no se publica el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no generativo ni secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no especificado en la model card; el repositorio contiene el predictor de AutoGluon listo para inferencia (1,1 GB), no se distribuyen ficheros safetensors ni GGUF |
| Tarea | Clasificación binaria de imágenes |
| Variable objetivo | `extrudable` |
| Métrica de selección | Balanced accuracy sobre validación fija |
| Mejor checkpoint | `repghostnet_200` (balanced accuracy de validación: 1.000000) |
| Framework / librería | AutoGluon MultiModal (tag `autogluon`) |
| Dataset de entrenamiento | `sunkaiwen/sketch2stl-sketches-image` |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-22 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificación de imágenes. El autor no entrena un modelo desde cero: parte de pesos preentrenados de TIMM y evalúa varios backbones candidatos mediante un barrido aleatorizado de modelos, todos con la misma configuración de `MultiModalPredictor`, la misma rama (`timm_image`), el mismo dataset de entrenamiento y la misma partición fija de validación. La selección se realiza por balanced accuracy, y solo se conserva el ganador (`repghostnet_200`) junto con los ficheros necesarios para inferencia. No se documentan hiperparámetros, resolución de entrada, número de épocas, estrategia de *augmentation* ni política de *early stopping*.

No hay información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de clases efectivas por split ni si se aplicaron técnicas de ajuste fino selectivo, *freeze* de capas o *fine-tuning* completo. Tampoco se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de visión. El resultado de balanced accuracy `1.000000` en validación, sin métricas de test independiente, sugiere tres escenarios posibles que el repositorio no permite descartar: un problema trivialmente separable, una partición de validación demasiado pequeña o con fuga de información respecto al entrenamiento, o un sobreajuste severo. La model card no aporta matriz de confusión, curvas de aprendizaje ni evaluación con validación cruzada, por lo que no es posible distinguir entre ellos.

## Capacidades

- Clasificación binaria de imágenes en dos clases derivadas de la variable objetivo `extrudable` (extruible / no extruible).
- Inferencia sobre imágenes de bocetos o renders procedentes del dominio del dataset `sketch2stl-sketches-image`.
- Integración directa en código Python mediante `MultiModalPredictor.load()` y `predictor.predict()`.
- Carga sencilla desde HuggingFace Hub con `snapshot_download` y el identificador del repositorio.
- Selección de backbone ya resuelta: no requiere que el usuario ejecute el barrido de TIMM para obtener un punto de partida.
- No dispone de tool calling ni function calling (no es un modelo generativo).
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No dispone de generación de texto, código, matemáticas, audio ni visión generativa.
- No dispone de capacidades multilingües: no procesa lenguaje natural.
- El único rendimiento declarado es la balanced accuracy de validación (1.000000); no se publican métricas por clase, precisión, recall ni F1.

## Casos de uso

- Triaje previo a impresión 3D: clasificar automáticamente diseños o bocetos como extruibles o no extruibles antes de enviarlos a un laminador, evitando gastar tiempo de slicing en geometrías problemáticas.
- Pre-filtro en un pipeline sketch-to-STL: colocar el clasificador como primera etapa que descarta entradas con baja probabilidad de ser extruibles y solo pasa al generador de malla las candidatas válidas, reduciendo coste computacional aguas abajo.
- Control de calidad en servicios de impresión bajo demanda: validar lotes de ficheros subidos por clientes y marcar los que requieren revisión manual, usando la probabilidad de la clase como umbral configurable.
- Curación y etiquetado asistido de datasets: usar el modelo como etiquetador preliminar para preanotar nuevas imágenes y reservar la revisión humana para los casos de baja confianza (aprendizaje activo).
- Material educativo sobre AutoML: el repositorio documenta un flujo completo de barrido de backbones con AutoGluon, útil como ejemplo reproducible en cursos de AutoML aplicado a visión.
- Prototipado rápido en equipos sin especialistas en ML: al venir el predictor ya seleccionado y empaquetado, un equipo de producto puede integrar una primera versión funcional en horas mediante la API de AutoGluon.
- Despliegue en entornos con recursos limitados: al tratarse de un backbone convolucional ligero (familia RepGhostNet), la inferencia es viable en CPU o en GPU de gama de entrada, lo que permite ejecución en el puesto de trabajo o en servidores modestos.
- Validación en mercados de modelos 3D: etiquetar automáticamente activos subidos por usuarios para indicar en la ficha del producto si el modelo es apto para extrusión.

## Benchmarks y rendimiento

La model card solo publica un dato de rendimiento, correspondiente a la partición de validación fija usada durante el barrido de modelos. No hay resultados en conjuntos de test independientes ni comparaciones con otros modelos bajo el mismo protocolo.

| Metrica | Valor | Conjunto | Fuente |
|---|---|---|---|
| Balanced accuracy | 1.000000 | Validación fija (partición del autor) | Model card del repositorio |
| Balanced accuracy | no disponible | Test independiente | No publicado |
| Precisión / recall / F1 por clase | no disponible | — | No publicado |
| Matriz de confusión | no disponible | — | No publicado |

No se han publicado resultados de benchmarks en la informacion disponible. El valor 1.000000 debe interpretarse como una métrica de selección interna, no como una estimación fiable del rendimiento en producción.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como estimación orientativa, un backbone convolucional de la familia RepGhostNet con resolución de entrada típica de 224-512 píxeles suele requerir menos de 1-2 GB de VRAM en FP32 durante la inferencia por lotes pequeños; esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas. Para este tipo de carga, cualquier GPU con 4 GB o más es suficiente; una RTX 3060, RTX 4060 o superior resulta holgada, y una A100 o H100 solo tendría sentido para procesamiento por lotes a gran escala.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna (GTX 1650, RTX 3050, RTX 4090). También es viable la inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: la vía documentada es la carga del predictor con `autogluon.multimodal.MultiModalPredictor.load()` dentro de un proceso Python, que se puede exponer con FastAPI, Flask o TorchServe. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de imágenes por segundo.
- Almacenamiento: 1,1 GB de repositorio, muy por encima de lo habitual para un checkpoint convolucional pequeño, lo que sugiere artefactos adicionales del predictor o cachés incluidas en el paquete.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `eandujar/nn_automl_notebook` (repghostnet_200) | CNN de clasificación binaria de imágenes | no disponible | no disponible | Balanced accuracy 1.000000 en validación propia | no disponible | HuggingFace, 0 descargas |
| Backbone TIMM `repghostnet_200` sin ajustar | CNN preentrenada en ImageNet | no disponible en la información proporcionada | resolución configurable por el usuario | no aplica a esta tarea sin ajuste | según TIMM | Público en TIMM |
| Otros backbones evaluados en el mismo barrido (por ejemplo, familias EfficientNet o MobileNet de TIMM) | CNN de clasificación de imágenes | no disponible | no disponible | no disponible (el autor solo publica el ganador) | según TIMM | Público en TIMM |
| Clasificador de imágenes genérico entrenado con AutoGluon MultiModal | CNN / transformer de visión | no disponible | no disponible | no disponible | según configuración | Requiere entrenamiento propio |

La comparación cuantitativa no es posible con la información disponible: el repositorio no publica resultados de los backbones descartados, ni parámetros, ni comparaciones contra alternativas bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Balanced accuracy de validación de 1.000000 sin métricas de test independientes: riesgo alto de sobreajuste, partición de validación diminuta o fuga de datos entre entrenamiento y validación. No debe asumirse rendimiento real cercano a ese valor.
- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Dataset de terceros: `sunkaiwen/sketch2stl-sketches-image` tiene su propia licencia y condiciones, que no se detallan en este repositorio y que pueden restringir el uso derivado.
- Inconsistencia en los metadatos: las etiquetas del repositorio incluyen `multiclass`, mientras que la model card describe un problema de clasificación binaria. Hay que verificar el número real de clases antes de usarlo.
- Riesgo de sesgo de dominio: el modelo se ha ajustado a un dataset concreto de bocetos orientados a STL. Su comportamiento fuera de ese dominio (fotografías, renders CAD, mallas 3D reales) es desconocido.
- Sesgos de representación: no se publica la composición del dataset (fuentes, estilos de dibujo, distribución de clases, posible desbalanceo), por lo que no se puede evaluar la equidad entre subgrupos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con confianza alta, especialmente si la calibración de probabilidades no se ha validado.
- Sin información de preprocesado: se desconoce la resolución de entrada esperada, la normalización aplicada y el manejo de canales de color, lo que puede degradar el rendimiento si el usuario sirve imágenes con otro formato.
- Adopción nula: 0 descargas y 0 likes implican que no hay validación comunitaria, informes de errores ni casos de uso verificados por terceros.
- Formato de pesos atado a AutoGluon: el predictor se carga con `MultiModalPredictor.load()`, lo que añade dependencia de la versión de AutoGluon y dificulta la exportación a otros runtimes sin trabajo adicional.
- Fechas del repositorio anómalas (creación en 2026-09-22): conviene verificar la vigencia y el mantenimiento del repositorio antes de depender de él.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones en lenguaje natural ni tool calling. Cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/eandujar/nn_automl_notebook
- Dataset utilizado: https://huggingface.co/datasets/sunkaiwen/sketch2stl-sketches-image
- Perfil del autor: https://huggingface.co/eandujar
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo, su autor o el dataset: los resultados obtenidos corresponden a páginas institucionales sin relación con el ámbito de la inteligencia artificial. No se dispone por tanto de papers, blogs, repositorios ni demos adicionales que enlazar.
