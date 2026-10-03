# Laura67/iris-rf-joblib-demo-lau

## Resumen

Laura67/iris-rf-joblib-demo-lau es un clasificador tabular entrenado con el dataset Iris de scikit-learn y serializado con joblib. No es un modelo de lenguaje ni un modelo generativo: se trata de un Random Forest (ensemble de árboles de decisión) de cuatro variables de entrada (longitud y anchura del sépalo y del pétalo, en centímetros) que predice una de tres especies de Iris: setosa, versicolor o virginica. La model card declara una única métrica, un accuracy de 0,9667.

El repositorio tiene un tamaño reportado de 0,0 GB, cero descargas y cero likes, y fue publicado por el usuario Laura67 (2 de octubre de 2026, con apenas dos segundos entre creación y actualización). No se especifica licencia, ni número de árboles, ni hiperparámetros, ni el protocolo de evaluación empleado. La librería declarada es scikit-learn y el fichero de pesos esperado es model.joblib.

Su relevancia es, por tanto, exclusivamente didáctica y de infraestructura: sirve como ejemplo mínimo de publicación de un artefacto clásico de machine learning en HuggingFace Hub y como banco de pruebas para flujos de descarga, carga y servido de modelos. No debe confundirse con un modelo de propósito general ni usarse como componente de decisión real sin un entrenamiento y una validación propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de arboles de decision con bagging y submuestreo aleatorio de caracteristicas); implementacion sklearn.ensemble.RandomForestClassifier segun la libreria declarada |
| Parametros totales | no disponible (no se documenta el numero de arboles, su profundidad ni el numero de nodos hoja) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular no generativo; la entrada es un vector fijo de 4 caracteristicas) |
| Tipos de cuantizacion | no aplica (no se publican variantes cuantizadas; el artefacto se distribuye como joblib) |
| Idiomas soportados | no disponible; no aplica (clasificador tabular; las etiquetas de salida son setosa, versicolor y virginica) |
| Licencia | no disponible |
| Formato de pesos | joblib (fichero model.joblib). No se publican safetensors, GGUF, ONNX ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio clasico: un conjunto de arboles de decision entrenados sobre submuestras bootstrap del conjunto de datos, con seleccion aleatoria de un subconjunto de caracteristicas en cada division. La prediccion final se obtiene por agregacion de los votos (o de las probabilidades) de los arboles individuales. La informacion disponible no indica el numero de estimadores, la profundidad maxima, el criterio de division ni la semilla aleatoria, por lo que el modelo no es reproducible tal cual a partir de la model card.

Los datos de entrenamiento son el dataset Iris incluido en scikit-learn: 150 muestras, 4 caracteristicas numericas continuas y 3 clases balanceadas (50 muestras por clase). No se documenta la composicion exacta del split de entrenamiento y prueba, ni si hubo validacion cruzada, ni si se aplico algun paso de preprocesado (por ejemplo, estandarizacion) dentro de un Pipeline. Esta omision es relevante: si existio un escalador, este no se menciona y su ausencia en la explicacion de uso implicaria una perdida de informacion en la inferencia. Tampoco se documenta ningun proceso de ajuste fino, RLHF, DPO ni tecnica equivalente, logicamente inaplicables a este tipo de modelo.

El unico resultado declarado es un accuracy de 0,9667. Ese valor es consistente tanto con 145 aciertos sobre 150 muestras (0,96667) como con 29 aciertos sobre 30 (0,96667), de modo que no puede descartarse que se haya calculado sobre el conjunto completo y no sobre un conjunto de prueba separado. La model card no aclara cual de los dos escenarios es el correcto.

## Capacidades

- Clasificacion supervisada multiclase de 3 categorias (setosa, versicolor, virginica) a partir de 4 caracteristicas numericas en centimetros.
- Inferencia por lote sobre matrices de caracteristicas (comportamiento estandar de un clasificador de scikit-learn), util para procesar tablas enteras.
- Obtencion de probabilidades por clase mediante predict_proba, ademas de la etiqueta dura (no documentado en la model card, pero es una capacidad estandar del estimador declarado).
- Carga directa desde HuggingFace Hub mediante hf_hub_download y joblib.load, tal como muestra la model card.
- Integracion prevista con una interfaz Gradio (Space Laura67/iris-rf-gradio-space-lau).
- Generacion de texto: no disponible; no aplica.
- Razonamiento, matematicas, codigo, vision, audio: no disponible; no aplica.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo de pensamiento (thinking mode): no aplica.

## Casos de uso

- Docencia y talleres de scikit-learn: el modelo es un ejemplo minimo y funcional de un flujo completo de entrenamiento y serializacion con joblib. Permite explicar en clase la diferencia entre un artefacto clasico y un modelo de deep learning sin distracciones de infraestructura.
- Prueba de humo (smoke test) de flujos de descarga desde HuggingFace Hub: al pesar practicamente nada y no requerir GPU, es idoneo para verificar que la autenticacion, el cache local y la descarga de artefactos funcionan en un entorno nuevo antes de pasar a modelos grandes.
- Prueba de integracion de sistemas de servido de modelos: sirve para validar wrappers de FastAPI, BentoML o MLflow, comprobando que la carga del artefacto, el versionado y el contrato de entrada/salida se comportan como se espera.
- Benchmark interno de latencia y de infraestructura CPU: al ser un modelo trivial, cualquier latencia anomala observada apunta a la capa de servido y no al modelo, lo que lo convierte en una linea base util de comparacion.
- Plantilla para nuevos proyectos de clasificacion tabular: la estructura del repositorio (model card, artefacto joblib, Space asociada) puede reutilizarse como esqueleto para publicar clasificadores propios de tamano reducido.
- Validacion de la Space de Gradio: permite comprobar de extremo a extremo el circuito modelo publicado, descarga desde el Hub e interfaz de usuario, antes de replicarlo con modelos de mayor coste.
- Ejercicio de comparacion de algoritmos: sobre el mismo dataset se pueden entrenar regresion logistica, SVM o gradient boosting y contrastar sus resultados con el accuracy declarado de 0,9667, siempre que se fije un protocolo de evaluacion comun.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| Dataset Iris (protocolo no especificado) | Accuracy | 0,9667 | Unico valor publicado en la model card |

No se han publicado mas resultados de benchmarks en la informacion disponible: no hay precision, recall ni F1 por clase, no hay matriz de confusion, no hay validacion cruzada, no hay tiempos de inferencia y no se aportan modelos de referencia con los que comparar. Tampoco se especifica el tamano del conjunto de evaluacion.

## Requisitos de hardware

- VRAM: no aplica. El modelo se ejecuta en CPU y no requiere GPU para la inferencia.
- GPU recomendadas: ninguna. Funciona en cualquier CPU x86-64 o ARM con Python y scikit-learn instalados.
- Cabe en cualquier equipo de consumo: si, un portatil basico es suficiente. No aplican las categorias de RTX 4090, A100 o H100.
- Memoria RAM estimada: el tamano del repositorio se reporta como 0,0 GB, por debajo de la resolucion del campo. El artefacto joblib de un Random Forest sobre Iris ocupa tipicamente decenas o centenares de kilobytes (estimacion, no dato publicado); el consumo dominante proviene de cargar Python, NumPy y scikit-learn, del orden de centenares de megabytes.
- Opciones de despliegue: carga directa con joblib o pickle, servido mediante FastAPI o Flask, Gradio (Space ya prevista), BentoML o MLflow. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos. La conversion a ONNX mediante skl2onnx es posible en la practica, pero no esta documentada en la model card.
- Latencia y throughput: no disponible. No se publican mediciones. Para un bosque aleatorio sobre 4 caracteristicas, el coste por muestra esta dominado por el numero de arboles y su profundidad, datos que no se especifican.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables ni sus metricas, y el repositorio no referencia alternativas. Para una comparacion rigurosa seria necesario disponer de otros clasificadores sobre Iris con el mismo protocolo de evaluacion publicado.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Laura67/iris-rf-joblib-demo-lau | no disponible | no aplica | no disponible | Accuracy 0,9667 en Iris | HuggingFace Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito extremadamente reducido: 4 caracteristicas y 3 clases. Fuera de ese espacio de entrada el modelo no ofrece ninguna garantia y no debe extrapolarse a otras especies ni a otras unidades de medida.
- Dataset de juguete: las 150 muestras de Iris son un clasico docente, no un conjunto representativo de un problema real. El accuracy de 0,9667 no es trasladable a produccion.
- Protocolo de evaluacion no documentado: no se indica si la metrica procede de un conjunto de prueba, de validacion cruzada o del conjunto completo. Sin esa informacion, el 0,9667 no es interpretable como estimacion de generalizacion.
- Reproducibilidad: no se publican hiperparametros, semilla aleatoria, version de scikit-learn ni pipeline de preprocesado. Un artefacto joblib puede fallar o comportarse de forma distinta al cargarse con una version de scikit-learn incompatible con la de entrenamiento.
- Preprocesado desconocido: si el entrenamiento incluyo escalado u otra transformacion, la model card no lo refleja y el ejemplo de uso no lo aplica, lo que produciria predicciones incorrectas.
- Riesgo de alucinacion: no aplica (modelo discriminativo, no generativo). El riesgo equivalente es la clasificacion erronea, que en este modelo no se cuantifica por clase.
- Sesgos: los derivados del propio dataset historico de Iris; no hay analisis de equidad ni de subgrupos. No se documentan sesgos demograficos porque no hay datos personales implicados.
- Idioma: no aplica; las unicas etiquetas de salida estan en latin y no hay interfaz multilingue documentada.
- Licencia: no disponible. La ausencia de licencia explicita impide determinar si el uso comercial esta permitido; conviene contactar con la autora antes de cualquier uso fuera del ambito educativo.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin historial de versiones ni changelog. No hay validacion independiente por parte de la comunidad.
- Fechas de metadatos: creacion y actualizacion figuran el 2026-10-02, con dos segundos de diferencia, sin informacion adicional sobre el proceso de publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Laura67/iris-rf-joblib-demo-lau
- Space de Gradio asociada: https://huggingface.co/spaces/Laura67/iris-rf-gradio-space-lau
- Documentacion de RandomForestClassifier en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Dataset Iris en scikit-learn: https://scikit-learn.org/stable/datasets/toy_dataset.html#iris-dataset
- Documentacion de joblib para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
