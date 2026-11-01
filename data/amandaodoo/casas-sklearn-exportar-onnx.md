# amandaodoo/casas-sklearn-exportar-onnx

## Resumen

`amandaodoo/casas-sklearn-exportar-onnx` es un artefacto educativo publicado en Hugging Face que contiene un modelo de regresión lineal entrenado con scikit-learn y exportado al formato ONNX. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un grafo ONNX que encapsula las operaciones aritméticas (multiplicaciones y sumas) de un regresor lineal junto con sus coeficientes, orientado a la predicción de precios de vivienda a partir de datos tabulares. El autor lo publica como ejemplo didáctico dentro de un flujo de trabajo que cubre entrenamiento, evaluación y exportación de modelos clásicos.

El interés del artefacto es formativo y operativo: demuestra cómo desacoplar la inferencia de Python y de scikit-learn mediante `onnxruntime`, lo que permite servir el modelo desde otros lenguajes o integrarlo en aplicaciones donde no se desea arrastrar el ecosistema científico de Python. El repositorio tiene un tamaño de 0,0 GB (solo el archivo `model.onnx` y scripts auxiliares), no registra descargas ni likes, y se distribuye bajo licencia MIT con idioma declarado español.

Por su naturaleza, no compite con modelos fundacionales ni con LLM: es una pieza de referencia para quien esté aprendiendo a exportar modelos tabulares a ONNX o necesite un ejemplo mínimo de extremo a extremo con `onnxruntime`. No hay información pública sobre el dataset de entrenamiento, el número de muestras ni las métricas de error del regresor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (scikit-learn) exportada como grafo ONNX |
| Parametros totales | no disponible (coeficientes e intercepto de un regresor lineal; el número exacto depende de las features de entrada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del grafo ONNX) |
| Idiomas soportados | es (declarado en la model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es una regresión lineal de scikit-learn, es decir, una combinación lineal de las variables de entrada más un término independiente. La exportación a ONNX convierte ese modelo en un grafo estático de operadores (`MatMul`/`Gemm` o equivalentes de multiplicación y suma) con los coeficientes embebidos como tensores inicializadores. El archivo resultante se carga con `onnxruntime` sin necesidad de scikit-learn ni de Python, y puede ejecutarse desde otros lenguajes con un runtime ONNX.

No se especifican en la información disponible el número de muestras de entrenamiento, la composición del dataset de viviendas, el conjunto de features utilizadas ni si hubo regularización (Ridge, Lasso) o selección de variables. Tampoco se documenta ninguna técnica de validación cruzada ni métricas de evaluación. El flujo descrito en la model card remite a un script previo de entrenamiento (`sklearn-entrenamiento-evaluacion/train.py`) y a scripts de exportación (`exportar.py`), carga (`cargar.py`) y predicción desde el Hub (`predict_hub.py`), pero no se detalla su contenido técnico.

La innovación técnica, en este caso, no está en el algoritmo sino en el empaquetado: el uso de ONNX como formato intermedio portable permite inferencia sin dependencia del framework de origen y, según la propia model card, el archivo no ejecuta código Python al abrirse, lo que reduce la superficie de riesgo frente a formatos como pickle.

## Capacidades

- Predicción de una variable objetivo continua (regresión) a partir de un vector de features tabulares, en el escenario de precios de vivienda.
- Inferencia mediante `onnxruntime` sin scikit-learn y sin Python, lo que habilita su uso desde otros lenguajes con runtime ONNX.
- Carga directa desde el Hub de Hugging Face mediante el script `predict_hub.py`.
- Ejecución de un grafo ONNX estático con operaciones aritméticas simples, adecuado para entornos con recursos mínimos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto, imágenes ni audio; no tiene capacidades multimodales ni modo de razonamiento.
- No dispone de capacidades multilingües en sentido estricto: el campo de idioma es una etiqueta de catalogación, no una función del modelo.

## Casos de uso

- Ejemplo didáctico de exportación a ONNX: sirve como referencia en cursos o tutoriales para mostrar cómo pasar un modelo de scikit-learn a un grafo ONNX y recargarlo con `onnxruntime`, con scripts separados de entrenamiento, exportación y carga.
- Inferencia en aplicaciones no Python: una API escrita en Go, Java, C# o Rust puede cargar `model.onnx` con el runtime ONNX correspondiente y obtener predicciones de precio sin depender de un servicio Python.
- Servicio de predicción de bajo coste: al tratarse de un regresor lineal, la inferencia es prácticamente instantánea y puede ejecutarse en CPU sin GPU, lo que encaja en microservicios con requisitos mínimos de recursos.
- Validación de pipelines de despliegue: útil como modelo de prueba para verificar que un pipeline de CI/CD, un contenedor o una plataforma de serving (por ejemplo, un servidor compatible con ONNX Runtime) funciona de extremo a extremo antes de desplegar modelos más complejos.
- Integración en hojas de cálculo o herramientas de análisis: el grafo ONNX puede consumirse desde entornos que admiten modelos ONNX para estimar precios de vivienda a partir de variables introducidas manualmente.
- Referencia para auditoría de formatos: permite comparar el comportamiento de un mismo modelo exportado a ONNX frente a su versión original en scikit-learn, y comprobar la portabilidad y la ausencia de ejecución de código al abrir el archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un regresor lineal y se ejecuta en CPU. El archivo ONNX ocupa una fracción mínima de los 0,0 GB del repositorio, por lo que la memoria necesaria es del orden de kilobytes o pocos megabytes.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente; si se desea forzar el proveedor de ejecución CUDA en `onnxruntime`, funcionaría en GPUs como RTX 4090, A100 o H100, pero no aportaría ventaja medible.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos dispositivos de bajos recursos.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java, etc.), servidores compatibles con ONNX, y cualquier runtime que acepte el formato ONNX. No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI`, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada; por la naturaleza del modelo, la latencia esperada es de microsegundos a milisegundos por predicción en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amandaodoo/casas-sklearn-exportar-onnx` | Regresión lineal exportada a ONNX | no disponible | no aplica | MIT | Hugging Face |
| Modelo original de scikit-learn (`sklearn-entrenamiento-evaluacion`) | Regresión lineal en scikit-learn | no disponible | no aplica | no disponible | Referenciado en la model card, no verificado |
| Regresores tabulares equivalentes en ONNX Zoo u otros repositorios | Regresión tabular en ONNX | no disponible | no aplica | variable según repositorio | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de regresión lineal: solo captura relaciones lineales entre features y objetivo; no modela interacciones ni no linealidades sin ingeniería de variables previa.
- No se documentan el dataset, las features de entrada ni las métricas de error, por lo que no es posible evaluar su calidad predictiva ni su generalización.
- Riesgo de extrapolación: fuera del rango de valores visto en entrenamiento, las predicciones lineales pueden ser arbitrarias; no hay información sobre ese rango.
- Sesgos: al no publicarse la composición del dataset de viviendas, no se puede evaluar si existen sesgos geográficos, socioeconómicos o de otro tipo en las predicciones.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural; la etiqueta de idioma `es` no implica capacidades lingüísticas.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; conviene conservar el aviso de copyright original.
- El artefacto tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni de revisión por terceros; trátese como ejemplo educativo, no como componente validado.
- La seguridad del formato ONNX se limita a que el archivo no ejecuta código Python; aun así, debe cargarse con un runtime actualizado y de fuentes fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amandaodoo/casas-sklearn-exportar-onnx
- Documentación de ONNX: https://onnx.ai/
- ONNX Runtime: https://onnxruntime.ai/
- scikit-learn: https://scikit-learn.org/
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
