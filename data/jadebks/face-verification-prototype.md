# Jadebks/face-verification-prototype

## Resumen

`Jadebks/face-verification-prototype` no es un modelo de lenguaje, sino un paquete de prototipo para verificación facial publicado por el usuario Jadebks como parte de un proyecto academico del grupo AI/ML de IE University titulado "Facial Recognition in Real-World Conditions: How Lighting, Occlusion and Ageing Affect Face Verification". El repositorio contiene la aplicacion Gradio (`app.py`), el codigo minimo del paquete (`src/face_verification/`) y el modelo base entrenado (`results/models/baseline_fold0.joblib`), pero no incluye imagenes del dataset.

El pipeline es clasico y ligero: extraccion de caracteristicas HOG, reduccion de dimensionalidad mediante PCA a 256 componentes y clasificacion con una SVM de kernel RBF, entrenada sobre las personas de entrenamiento del fold 0 de LFW. La deteccion de rostros se delega en MTCNN de `facenet-pytorch`. El autor reporta una precision de validacion del 74% y un AUC de 0.81.

Es relevante unicamente como ejemplo docente de pipeline de vision por computador reproducible y de bajo coste, y como base para estudiar el efecto de iluminacion, oclusion y envejecimiento en la verificacion facial. No debe confundirse con un modelo fundacional ni usarse en produccion: el propio autor lo etiqueta como prototipo de investigacion, no como sistema de verificacion de identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clasico: HOG (features) + PCA (256 componentes) + SVM con kernel RBF; deteccion facial con MTCNN (`facenet-pytorch`) |
| Parametros totales | no disponible (no es una red neuronal profunda entrenada de extremo a extremo; el modelo es un `joblib` con PCA + SVM) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion; el artefacto es `joblib`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (la model card no especifica licencia; MTCNN de `facenet-pytorch` se cita como MIT) |
| Formato de pesos | `joblib` (`baseline_fold0.joblib`) |

## Arquitectura y entrenamiento

El sistema sigue un diseno en dos etapas. Primero, MTCNN de `facenet-pytorch` detecta y alinea el rostro en la imagen de entrada. Despues, se extraen descriptores HOG de la region facial, se reducen a 256 dimensiones mediante PCA y se clasifican con una SVM de kernel RBF que decide si dos rostros corresponden a la misma identidad. El artefacto entrenado es un unico fichero `joblib` que empaqueta el PCA y la SVM.

El entrenamiento se realizo sobre las personas de entrenamiento del fold 0 de LFW (Labeled Faces in the Wild), un benchmark estandar de verificacion facial no restringida. El autor reporta una precision de validacion del 74% y un AUC de 0.81 en ese fold. No se documentan en la informacion disponible el numero exacto de imagenes, la composicion del dataset, ni si hubo aumentacion de datos, ajuste fino o tecnicas de calibracion adicionales.

## Capacidades

- Verificacion facial 1:1: compara dos imagenes y emite una decision de coincidencia o no coincidencia.
- Deteccion y alineacion de rostros mediante MTCNN.
- Extraccion de descriptores HOG y proyeccion PCA para representacion compacta del rostro.
- Interfaz de demostracion con Gradio (`app.py`) para subir pares de imagenes y obtener el resultado.
- Ejecucion en Google Colab mediante el notebook `run_prototype_colab.ipynb`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vision general mas alla de rostros.
- No soporta capacidades multilingues (no procesa lenguaje).

## Casos de uso

- Docencia y aprendizaje de pipelines de vision: el repositorio sirve para que estudiantes reproduzcan un flujo completo de deteccion facial, extraccion de features, reduccion de dimensionalidad y clasificacion con metricas de validacion.
- Estudio del efecto de la iluminacion en verificacion facial: el prototipo permite comparar pares de imagenes con condiciones de luz controladas y medir la caida de precision respecto a la linea base.
- Analisis de oclusion: se pueden introducir imagenes con gafas, mascarillas o parcialmente cubiertas para observar el impacto en la decision del clasificador.
- Evaluacion del envejecimiento facial: comparando imagenes de la misma persona en distintos momentos temporales se puede medir la degradacion del rendimiento del modelo.
- Prueba de concepto de un sistema de control de acceso de bajo coste: el pipeline HOG+PCA+SVM es ligero y puede ejecutarse en CPU, lo que permite validar la viabilidad antes de invertir en modelos profundos.
- Reproducibilidad de experimentos academicos: el bundle incluye codigo, modelo y notebook, lo que facilita repetir los resultados del fold 0 de LFW y servir de base para comparaciones.
- Integracion en un formulario o demo web: la aplicacion Gradio puede desplegarse en un servidor para que usuarios no tecnicos prueben el prototipo.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision de validacion | 74% | LFW fold 0 (personas de entrenamiento) |
| AUC | 0.81 | LFW fold 0 (personas de entrenamiento) |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es un `joblib` ligero (PCA + SVM) y la deteccion MTCNN es la parte mas costosa; puede ejecutarse en CPU.
- GPU recomendadas: no se especifican. MTCNN se beneficia de GPU, pero el pipeline completo es viable en CPU.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna puede ejecutar MTCNN; el clasificador SVM se ejecuta en CPU.
- Opciones de despliegue: aplicacion Gradio (`app.py`) en local o en Google Colab; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Jadebks/face-verification-prototype` | HOG + PCA + SVM (clasico) | no disponible (no es red profunda) | no aplica | Precision 74%, AUC 0.81 en LFW fold 0 | no disponible | Hugging Face |
| FaceNet (referencia) | CNN profunda | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| ArcFace (referencia) | CNN profunda con margen angular | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Dlib face recognition | Descriptor + SVM | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

Los modelos de referencia se citan como categoria, pero no se dispone de datos verificados en la informacion proporcionada para rellenar sus columnas con rigor.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no es un sistema de verificacion de identidad.
- Precision limitada: 74% de precision y AUC 0.81 en validacion, insuficiente para cualquier uso de seguridad o control de acceso real.
- Sesgos no documentados: no se reporta analisis de sesgo por genero, etnia, edad o iluminacion, pese a que el proyecto precisamente estudia esos factores.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero el clasificador puede producir falsos positivos y falsos negativos sin calibracion probabilistica documentada.
- Limitaciones de contexto e idioma: no aplica (modelo de vision sin texto).
- Restricciones de licencia: la licencia no esta especificada en la model card; antes de cualquier uso comercial debe aclararse con el autor.
- Datos y privacidad: el autor indica que las fotos subidas se usan solo para la comparacion y se eliminan del servidor en una hora; conviene verificar ese comportamiento antes de desplegar.
- Sin imagenes del dataset: el repositorio no incluye las imagenes de LFW, por lo que la reproducibilidad completa requiere descargar el dataset por separado.
- Dependencias fijadas: `scikit-learn==1.9.1`, `gradio==6.31.0`, `facenet-pytorch==2.6.0`; versiones concretas que pueden complicar el mantenimiento.
- Tamano del repo: 0.0 GB segun Hugging Face, lo que sugiere que el artefacto `joblib` y el codigo pueden no estar completamente subidos o que el tamano reportado es redondeado.

## Enlaces

- Hugging Face: https://huggingface.co/Jadebks/face-verification-prototype
- Repositorio de `facenet-pytorch` (MTCNN, MIT): no disponible en la informacion proporcionada
- Dataset LFW (Labeled Faces in the Wild): no disponible en la informacion proporcionada
- Paper o blog del proyecto de IE University: no disponible en la informacion proporcionada
- Notebook `run_prototype_colab.ipynb`: incluido en el repositorio de Hugging Face, sin URL directa en la informacion proporcionada
- Demo Gradio publica: no disponible en la informacion proporcionada
