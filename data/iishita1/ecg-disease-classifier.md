# iishita1/ECG-Disease-Classifier

## Resumen

ECG-Disease-Classifier es un modelo de clasificación multi-etiqueta de señales electrocardiográficas (ECG) desarrollado por el usuario iishita1 y publicado en Hugging Face bajo el paraguas del proyecto Neural-Network-Project. Detecta 19 condiciones cardíacas, con especial énfasis en patología pediátrica: miocarditis en distintas variantes, miocardiopatías, enfermedad de Kawasaki, defectos septales, tetralogía de Fallot, estenosis valvulares y otras malformaciones congénitas, además de una clase "Healthy".

Técnicamente se trata de una CNN 1D con bloques de Squeeze-Excitation y atención temporal, diseñada para aceptar ECG de 12 derivaciones de longitud variable entre 5 y 120 segundos a 500 Hz. Se entrenó con focal loss para mitigar el fuerte desbalanceo de clases, un problema habitual en datasets clínicos pediátricos donde las cardiopatías congénitas raras aparecen con muy baja frecuencia.

El modelo es relevante como ejemplo de aplicación de deep learning a series temporales biomédicas con requisitos de multi-etiqueta y contexto temporal largo, pero su propio autor lo restringe explícitamente a investigación y docencia, no a diagnóstico clínico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks ni métricas verificables en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1D con bloques Squeeze-Excitation, atención temporal y conexiones residuales |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 5-120 s de ECG a 500 Hz (12 derivaciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería TensorFlow/Keras; el repo ocupa 0.2 GB) |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D con un tronco de filtros 64→128→256→512, conexiones residuales entre bloques, bloques de Squeeze-Excitation para recalibración de canales y un mecanismo de atención temporal que permite agregar información de secuencias de longitud variable. La entrada son 12 derivaciones de ECG muestreadas a 500 Hz, con duraciones entre 5 y 120 segundos, lo que obliga a un pooling temporal adaptativo antes de la cabeza de clasificación multi-etiqueta de 19 salidas.

El entrenamiento usó focal loss con α=0,25 y γ=2,0 para compensar el desbalanceo entre clases, optimizador Adam con learning rate 2e-4, batch size de 128 y 17 épocas. El dataset indicado es Neural-Network-Project/ECG-database. No se especifican en la información disponible el número total de tokens o muestras, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales. La focal loss y la atención temporal son las innovaciones técnicas destacables; no se menciona decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Clasificación multi-etiqueta de 19 condiciones cardíacas a partir de ECG de 12 derivaciones.
- Manejo de señales de longitud variable (5-120 s) mediante atención temporal y pooling adaptativo.
- Detección simultánea de múltiples patologías coexistentes (por ejemplo, varias malformaciones congénitas en un mismo paciente).
- Clase "Healthy" para discriminación entre sujetos sanos y patológicos.
- Enfoque específico en cardiología pediátrica, incluyendo enfermedad de Kawasaki y cardiopatías congénitas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de series temporales, no un modelo generativo.
- Capacidades multilingües no aplicables; las etiquetas están en inglés.

## Casos de uso

- Triaje de ECG pediátricos en investigación: el modelo puede preclasificar registros de 12 derivaciones y señalar posibles cardiopatías congénitas para revisión posterior por cardiólogos, acelerando la anotación de grandes cohortes retrospectivas.
- Detección de miocarditis: las tres clases de miocarditis (fulminante/viral, aguda e inespecífica) permiten construir pipelines de cribado en estudios de cohortes pediátricas con sospecha de inflamación miocárdica.
- Identificación de enfermedad de Kawasaki: útil en proyectos de investigación que buscan marcadores electrocardiográficos tempranos en pacientes pediátricos con fiebre prolongada.
- Cribado de cardiopatías congénitas estructurales: las clases de defectos septales, tetralogía de Fallot y estenosis valvulares permiten priorizar casos en datasets de ecocardiografía y ECG pareados.
- Docencia y formación: sirve como ejemplo didáctico de CNN 1D con atención temporal y focal loss aplicada a series temporales médicas desbalanceadas.
- Benchmarking de modelos de ECG: puede usarse como línea base multi-etiqueta en competiciones o estudios comparativos de clasificación de ECG pediátrico.
- Análisis de señal en investigación traslacional: integrable en pipelines de Python/TensorFlow para extracción de características y estudio de correlaciones entre ECG y fenotipo clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas declaradas (f1, auc, precision, recall) en los tags, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB, lo que sugiere un modelo pequeño que probablemente quepa en GPUs consumer con 4-8 GB, pero no se confirma en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del repo, una RTX 3060 o superior sería suficiente para inferencia, pero es una estimación, no un dato publicado.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no confirmado.
- Opciones de despliegue: TensorFlow/Keras nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de series temporales). Se podría exportar a TensorFlow Serving o TFLite para inferencia en producción.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación multi-etiqueta de ECG pediátrico con 19 clases y arquitectura CNN 1D con Squeeze-Excitation.

## Limitaciones y advertencias

- Restricción de uso explícita: el autor indica "Research and educational purposes only - NOT for clinical diagnosis". No debe usarse como herramienta diagnóstica.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido; en la práctica, sin licencia explícita no se puede asumir permiso de uso comercial.
- Sin benchmarks publicados: no hay métricas verificables de F1, AUC, precisión o recall, lo que impide evaluar su rendimiento real.
- Riesgo de sesgo: el dataset es pediátrico y probablemente de una única institución o cohorte; puede no generalizar a otras poblaciones, rangos de edad o equipos de ECG.
- Sensibilidad al desbalanceo: aunque se usa focal loss, las clases raras (miocarditis fulminante, defectos poco frecuentes) pueden tener un rendimiento muy inferior al de clases mayoritarias.
- Dependencia de la calidad de la señal: la clasificación depende de una adquisición correcta de 12 derivaciones a 500 Hz; ruido, artefactos o derivaciones mal colocadas degradarán las predicciones.
- Sin soporte para texto ni generación: no es un modelo de lenguaje; no puede explicar sus predicciones ni interactuar en lenguaje natural.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos con consecuencias clínicas si se usa fuera de investigación.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/iishita1/ECG-Disease-Classifier
- Dataset referenciado: Neural-Network-Project/ECG-database (en Hugging Face)
- Repositorio del proyecto: Neural-Network-Project/ECG-Disease-Classifier (referenciado en la cita del autor)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
