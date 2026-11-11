# duc16/cxr-svm-demo

## Resumen

`duc16/cxr-svm-demo` no es un modelo de lenguaje: es un artefacto de inferencia congelado que empaqueta un clasificador SVM (scikit-learn) para radiografías de tórax. Lo publica el usuario `duc16` como demostración académica de un pipeline clásico de machine learning (identificador interno S6-02). El artefacto completo es un fichero `joblib` de 7.842.399 bytes que contiene un `StandardScaler` seguido de un `SVC` con kernel RBF.

El modelo clasifica imágenes de 299x299 en escala de grises en cuatro clases: COVID, Lung_Opacity, Normal y Viral Pneumonia. Se entrenó únicamente sobre el split `train` del manifiesto del proyecto (14.815 imágenes) derivadas de la COVID-19 Radiography Database pública de Kaggle. La entrada no son píxeles crudos, sino 152 características hechas a mano: 64 de histograma, 60 de GLCM (matriz de coocurrencia de niveles de gris) y 28 de LBP (patrones binarios locales).

Es relevante como referencia metodológica y por su honestidad: la model card declara explícitamente que **no es un dispositivo médico** y que no debe usarse para diagnóstico, triaje ni ninguna decisión clínica. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB (el artefacto individual pesa unos 7,8 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clásico scikit-learn: `StandardScaler` + `SVC(kernel="rbf")` |
| Parametros totales | No disponible (modelo de vectores de soporte; no se publica el número de vectores de soporte ni de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | `other` (la model card remite a la licencia del proyecto; los datos de origen se reportan como `copyright-authors`) |
| Formato de pesos | `joblib` (`cxr_inference_model_cache.joblib`, 7.842.399 bytes, SHA-256 `3e14bd570c734d9d8f39a2d340b176a40a41c9559cc2da0ef67bbd8e15735058`) |

Hiperparámetros declarados del `SVC`: `C=10.0`, `gamma="scale"`, `class_weight="balanced"`, `probability=True`, `random_state=42`. Versión de scikit-learn: 1.6.1. Entrada: imágenes de 299x299 en escala de grises, vectorizadas a 152 características (64 histograma + 60 GLCM + 28 LBP).

## Arquitectura y entrenamiento

No hay red neuronal ni transformer. El pipeline es un escalador estándar seguido de una máquina de vectores de soporte con kernel gaussiano RBF. La decisión de usar `probability=True` implica que el artefacto incluye el ajuste de Platt (calibración de probabilidades) dentro del `SVC`, lo que explica parte del tamaño del fichero `joblib`. El `class_weight="balanced"` compensa el desbalance entre las cuatro clases del dataset de radiografías.

El entrenamiento se realizó exclusivamente sobre el split `train` del manifiesto del proyecto, con 14.815 imágenes. No se documentan número de épocas (no aplica), composición exacta por clase, ni si hubo aumento de datos. La model card remite al proyecto fuente para el manifiesto de splits, el código de extracción de características y las métricas publicadas. Se menciona una "equivalence gate" sobre 200 imágenes de validación con 200/200 coincidencias de etiqueta, lo que sugiere una verificación de reproducibilidad del artefacto, no una evaluación de rendimiento clínico.

## Capacidades

- Clasificación de imágenes de radiografía de tórax en cuatro clases: COVID, Lung_Opacity, Normal y Viral Pneumonia.
- Extracción de características hechas a mano sobre imágenes de 299x299 en escala de grises (histograma, GLCM y LBP).
- Salida de probabilidades por clase gracias a `probability=True` (calibración de Platt).
- Inferencia determinista y offline: el artefacto es un fichero único cargable con `joblib`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa texto.
- No tiene modo thinking, visión general, audio ni generación.

## Casos de uso

- Docencia de pipelines clásicos de visión por computador: sirve para ilustrar el flujo completo (extracción de características hechas a mano, escalado, SVM con kernel RBF y calibración de probabilidades) sin depender de GPUs ni de frameworks de deep learning.
- Reproducibilidad de experimentos académicos: el SHA-256 y la versión fijada de scikit-learn (1.6.1) permiten verificar que el artefacto cargado es exactamente el publicado, útil en trabajos que exigen artefactos congelados.
- Comparativa de baselines: un SVM sobre 152 características hechas a mano es un baseline razonable frente a clasificadores CNN o ViT en estudios de radiografía de tórax, siempre en entorno de investigación.
- Pruebas de integración de pipelines de inferencia ligeros: al pesar unos 7,8 MB y no requerir GPU, es adecuado para validar el cableado de un servicio de inferencia (carga del `joblib`, preprocesado, salida de probabilidades) antes de sustituir el modelo por uno mayor.
- Análisis de sensibilidad al preprocesado: permite estudiar cómo afectan cambios en la extracción de características (resolución, normalización, parámetros de GLCM/LBP) al rendimiento de un clasificador clásico.
- Ejercicios de auditoría de model cards: su declaración explícita de "no es un dispositivo médico" y sus limitaciones documentadas lo convierten en un ejemplo útil para enseñar buenas prácticas de documentación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una "equivalence gate" de 200 imágenes de validación con 200/200 coincidencias de etiqueta, que verifica la equivalencia del artefacto, no su precisión diagnóstica.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo es un SVM clásico y se ejecuta en CPU.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier consumer GPU y también en CPU de gama baja; el artefacto pesa unos 7,8 MB.
- Opciones de despliegue: Python con scikit-learn 1.6.1 y `joblib`, o cualquier servicio que cargue el fichero y reproduzca la extracción de las 152 características. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia dominante será la extracción de características (histograma, GLCM y LBP) sobre imágenes de 299x299, no la inferencia del SVM.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `duc16/cxr-svm-demo` | SVM RBF sobre 152 características hechas a mano | Imagen 299x299 en grises | 4 | `other` | Hugging Face, 0 descargas |
| Clasificadores CNN sobre COVID-19 Radiography Database | Red neuronal convolucional | Imagen RGB/grises | 4 (típicamente) | Depende del autor | Múltiples en Hugging Face y GitHub |
| Modelos fundacionales de imagen médica (p. ej. RadImageNet, BiomedCLIP) | CNN/ViT preentrenados | Imagen | Variable (zero-shot o fine-tuning) | Depende del autor | Repositorios públicos |

No se dispone de datos de rendimiento del modelo para una comparación cuantitativa con estas alternativas. Cualquier comparación sería metodológica, no de precisión.

## Limitaciones y advertencias

- **No es un dispositivo médico.** La model card prohíbe explícitamente su uso para diagnóstico, triaje, tratamiento o cualquier decisión clínica.
- Sesgos conocidos: no documentados. Al entrenarse solo con la COVID-19 Radiography Database, el modelo puede heredar los sesgos de composición y adquisición de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero sí existe riesgo de falsos positivos y falsos negativos con probabilidades mal calibradas en datos fuera de distribución.
- Limitación de dominio: solo se validó con imágenes de 299x299 de la COVID-19 Radiography Database. Otras fuentes o preprocesados quedan fuera de distribución.
- Requisito de privacidad: las imágenes de entrada deben estar anonimizadas.
- Restricciones de licencia: la licencia es `other` y los datos de origen se reportan como `copyright-authors`; conviene revisar los términos del proyecto fuente antes de cualquier uso, incluido el académico.
- En producción: no usar como componente de ningún sistema clínico; su valor es docente y de reproducibilidad.
- El repositorio no incluye imágenes ni el código de extracción de características; hay que consultar el proyecto fuente para reproducir el pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/duc16/cxr-svm-demo
- Dataset de origen (COVID-19 Radiography Database, Kaggle): https://www.kaggle.com/datasets/tawsifurrahman/covid19-radiography-database
- scikit-learn (documentación de `SVC`): https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html
- No se han encontrado en la información proporcionada enlaces al paper, blog, repositorio de código o demo del proyecto fuente.
