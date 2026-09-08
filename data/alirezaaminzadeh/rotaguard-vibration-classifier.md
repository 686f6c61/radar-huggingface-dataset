# alirezaaminzadeh/rotaguard-vibration-classifier

## Resumen

RotaGuard Vibration Classifier es un clasificador multiclase desarrollado por el equipo de ingeniería de Aria AI, basado en LightGBM y publicado en HuggingFace para tareas de mantenimiento predictivo en equipos rotativos. El modelo recibe 19 características de tiempo, frecuencia y espectro de envolvente extraídas de un segmento de 4096 muestras de vibración a 12 kHz, y predice una de 12 clases: estado normal o una combinación de localización del defecto (pista interior, pista exterior, bola) y severidad en milésimas de pulgada (7, 14, 21, 28). Está entrenado sobre el conjunto de datos público CWRU Bearing Data Center, en el subconjunto de 12 kHz del extremo motriz.

A diferencia de los modelos generativos de lenguaje, se trata de un modelo tabular clásico de gradient boosting, con 150 árboles de profundidad 6. No dispone de transformadores ni de ventana de contexto en el sentido habitual, ya que su entrada es una matriz de características numéricas. Su relevancia radica en que ofrece una solución ligera, fácil de integrar y con licencia MIT para la clasificación de defectos en rodamientos, un problema crítico en la industria de petróleo y gas, petroquímica y equipos rotativos en general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión) |
| Parametros totales | No disponible (LightGBM: 150 árboles, profundidad 6) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (modelo LightGBM, sin cuantización publicada) |
| Idiomas soportados | No disponible (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | Joblib (archivo .joblib) |

## Arquitectura y entrenamiento

El modelo es un `LGBMClassifier` de LightGBM con 150 árboles y profundidad máxima 6. Se entrena sobre un conjunto de 19 características extraídas de cada segmento de vibración de 4096 muestras a 12 kHz: características temporales, de frecuencia y de espectro de envolvente, calculadas a partir de la señal bruta. La salida asigna una de 12 etiquetas: `Normal` o una combinación de localización (`IR`, `OR`, `B`, es decir, pista interior, pista exterior, bola) y severidad en milésimas de pulgada (`7`, `14`, `21`, `28`).

Los datos de entrenamiento proceden del dominio público CWRU Bearing Data Center, concretamente del subconjunto de 12 kHz del extremo motriz. El procedimiento de evaluación usa una división de condiciones emparejadas: las mismas cuatro condiciones de carga están presentes tanto en el conjunto de entrenamiento como en el de prueba. No se aplica RLHF, DPO ni ningún ajuste basado en lenguaje; se trata de un clasificador supervisado convencional. El propio autor declara en la ficha que la física de los defectos de rodamiento es transferible a equipos industriales, pero que la máquina específica de ensayo no lo es.

## Capacidades

- Clasificación de segmentos de vibración en estado normal o defecto localizado (pista interior, exterior o bola) con cuatro niveles de severidad.
- Extracción de características embebida en el flujo de trabajo: el autor proporciona un módulo (`rotaguard.features_vibration.extract_features`) que realiza el cálculo vectorizado de las 19 características de entrada.
- Salida de probabilidades por clase mediante `predict_proba`, lo que permite establecer umbrales de confianza y lógicas de decisión en sistemas de monitorización.
- Soporte para integración sencilla en Python mediante `joblib` y `numpy`; no requiere GPU ni infraestructura de deep learning.
- No soporta tool calling, function calling ni razonamiento multi-paso, al ser un modelo discriminativo de clasificación tabular.
- No soporta capacidades multilingües, visión, audio ni texto: su dominio de entrada es exclusivamente numérico.

## Casos de uso

- Monitorización de rodamientos en bombas centrífugas: el modelo clasifica en tiempo real segmentos de vibración de 12 kHz procedentes de acelerómetros y permite detectar defectos incipientes antes de que se produzca un fallo catastrófico. Su ligereza permite ejecutarlo en un PLC o en un servidor de borde sin recursos de GPU.
- Mantenimiento predictivo en compresores de gas y turbinas: usado como componente de un pipeline de análisis de vibraciones, contribuye a programar paradas de planta según la severidad estimada del defecto, reduciendo costes de mantenimiento correctivo.
- Análisis de rodamientos en motores eléctricos industriales: permite distinguir entre defectos en la pista interior, exterior o en los elementos rodantes, lo que facilita el diagnóstico preciso y la selección del repuesto adecuado.
- Evaluación de la severidad de defectos en ensayos de laboratorio: investigadores pueden reproducir el protocolo de la división de condiciones emparejadas para comparar métodos de clasificación de vibraciones sobre el dataset CWRU, empleando las 12 clases definidas.
- Sistemas de alerta temprana en activos críticos: al devolver probabilidades por clase, el modelo integra con alarmas que se activan a partir de un umbral configurable, reduciendo falsos positivos en operaciones continuas.
- Herramienta de investigación y formación en diagnóstico de fallos: su simplicidad y su documentación transparente sobre las limitaciones del protocolo lo convierten en un recurso didáctico para estudiantes e investigadores que trabajan con análisis de vibraciones.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card se muestran a continuación. No han sido verificados de forma independiente.

| Conjunto de prueba | Tamaño | Accuracy | Macro-F1 |
|---|---|---|---|
| CWRU Bearing 12k Drive-End (held-out test) | 2.750 segmentos | 100% | 100% |

En la model card se citan además los siguientes baselines publicados sobre el mismo tipo de datos:

| Modelo / método | Accuracy | Referencia |
|---|---|---|
| Random Forest + características FFT | ~99% | IEEE ICREST 2019, doi:10.1109/icrest.2019.8644089 |
| Random Forest optimizado con Relief-F | 98.68% | Zhao et al. (2025), Machines 13(3):183, doi:10.3390/machines13030183 |

El autor explica que el 100% es plausible y consistente con el rango del 99-100% reportado en estudios públicos, precisamente porque la división es de condiciones emparejadas y se utiliza un conjunto de características manuales amplio. Aclara que este resultado no debe interpretarse como evidencia de fuga de datos. La generalización entre cargas distintas (cross-load) constituye una variante de evaluación más difícil que no se ha certificado en esta ficha.

## Requisitos de hardware

- VRAM estimada: no aplica. El modelo es un clasificador LightGBM y se ejecuta en CPU; no requiere memoria de GPU.
- GPU recomendada: ninguna. Es viable en cualquier CPU moderna, incluso en entornos embebidos o en servidores de baja capacidad.
- Cabe en hardware de consumo: sí, en cualquier ordenador con al menos 1 GB de RAM disponible para el proceso Python.
- Opciones de despliegue: inferencia directa en Python con `joblib`; puede envolverse en una API REST con FastAPI, exportarse a ONNX para otros runtimes o integrarse en sistemas de adquisición de datos mediante scripts personalizados.
- Latencia y throughput estimados: no disponible. No se aportan medidas de latencia ni de rendimiento en la información publicada.

## Comparativa con modelos similares

| Modelo / método | Tipo | Accuracy (mismo dataset) | Disponibilidad | Licencia |
|---|---|---|---|---|
| RotaGuard Vibration Classifier | LightGBM, 19 features | 100% (declarado) | HuggingFace | MIT |
| Random Forest + FFT | Bosque aleatorio, características FFT | ~99% (publicado) | Paper, sin código público | No indicada |
| Random Forest optimizado con Relief-F | Bosque aleatorio, selección de características | 98.68% (publicado) | Paper, sin código público | No indicada |

La comparativa se basa en los datos citados en la model card del autor. No se dispone de detalles técnicos adicionales (número de árboles, profundidad, características exactas) para los modelos de referencia, por lo que la comparación se limita a la métrica de accuracy disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con el conjunto de datos CWRU, un banco de ensayos de laboratorio con un motor concreto. La física de los defectos es transferible, pero el comportamiento de la máquina específica no lo es; en consecuencia, el modelo puede degradarse cuando se aplique a equipos industriales reales con condiciones de operación distintas.
- Riesgo de alucinación: no aplica, al tratarse de un clasificador discriminativo que produce una etiqueta y probabilidades, no texto generado.
- Limitaciones de contexto o idioma: no aplica, ya que el modelo no procesa lenguaje natural ni secuencias largas.
- Restricciones de licencia para uso comercial: la licencia MIT permite uso comercial, modificación y redistribución sin cargos, aunque el autor no ofrece garantías de idoneidad para un propósito particular.
- Advertencia específica para producción: el 100% de accuracy se obtuvo con una división de condiciones emparejadas; no se certifica la generalización a cargas no vistas ni a entornos de campo. El autor recomienda recalibrar y revalidar el modelo antes de cualquier despliegue cross-load o en aplicaciones industriales reales.

## Enlaces

- Modelo: https://huggingface.co/alirezaaminzadeh/rotaguard-vibration-classifier
- Dataset de características: https://huggingface.co/datasets/alirezaaminzadeh/rotaguard-vibration-rul-features
- Modelo de vida útil restante (RUL LSTM): https://huggingface.co/alirezaaminzadeh/rotaguard-rul-lstm
- Space de mantenimiento predictivo: https://huggingface.co/spaces/alirezaaminzadeh/rotaguard-predictive-maintenance
- Producto: https://aria-ai.ir
