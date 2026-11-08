# Simonlee711/HiMAE

## Resumen

HiMAE (Hierarchical Masked Autoencoder) es un modelo fundacional compacto de 1,2 millones de parametros para fotopletismografia (PPG) de muñeca, desarrollado por el Digital Health Team de Samsung Research America en colaboracion con la University of California, Los Angeles. Resuelve el problema de obtener representaciones utiles a partir de señales biologicas sin etiquetar, capturadas por wearables comerciales, para tareas de cribado clinico como deteccion de contracciones ventriculares prematuras (PVC) e hipertension de estadio I.

La arquitectura es un autoencoder convolucional 1-D jerarquico con diseño tipo U-Net, preentrenado mediante reconstruccion enmascarada sobre aproximadamente 80.000 horas de PPG de muñeca sin etiquetar procedentes de 47.644 participantes. El modelo es lo bastante pequeño para ejecutarse directamente en hardware de smartwatch sin cuantizacion ni poda, lo que lo situa en la categoria de modelos fundacionales on-device para biosignales.

Es relevante ahora porque el metodo subyacente se ha aceptado en ICLR 2026 y porque demuestra viabilidad tecnica de cribado fisiologico en tiempo real sobre hardware comercial. Sin embargo, los pesos preentrenados y los checkpoints clinicos son propietarios y no se distribuyen en este repositorio: solo el codigo de arquitectura, entrenamiento y evaluacion es abierto bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional 1-D jerarquico con diseño tipo U-Net (encoder-decoder), bloques residuales con activaciones GELU y batch normalization |
| Parametros totales | 1,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada fija de ventanas PPG de 10 segundos a 100 Hz (1.000 muestras), canal unico |
| Tipos de cuantizacion | no disponible; el modelo esta diseñado para ejecutarse sin cuantizacion ni poda |
| Idiomas soportados | no disponible (modelo de señales fisiologicas, no linguistico) |
| Licencia | MIT (solo codigo); pesos no distribuidos |
| Formato de pesos | no disponible (los pesos no se publican en el repositorio) |

## Arquitectura y entrenamiento

HiMAE es un encoder-decoder convolucional 1-D jerarquico. El encoder reduce la resolucion temporal mediante convoluciones con stride 2 mientras incrementa la profundidad de canales: las etapas superficiales capturan morfologia local del pulso y las etapas profundas agregan dinamica de ritmo de mayor alcance. Las conexiones skip entre encoder y decoder se emplean unicamente durante la reconstruccion en el preentrenamiento; la prediccion downstream utiliza solo el encoder preentrenado.

El preentrenamiento es auto-supervisado mediante reconstruccion enmascarada sobre aproximadamente 80.000 horas de PPG de muñeca sin etiquetar de 47.644 participantes. La cohorte de preentrenamiento esta desbalanceada: 77,6 % hombres, 57,1 % en el rango de 30-49 años y 65,1 % de raza blanca. No se documentan en la informacion disponible detalles sobre el uso de RLHF/DPO (no aplicable a este tipo de modelo) ni sobre tecnicas de decodificacion especulativa o attention linear.

## Capacidades

- Extraccion de caracteristicas (feature extraction) a partir de ventanas PPG normalizadas de 10 segundos a 100 Hz, produciendo representaciones latentes para tareas downstream.
- Cribado de contracciones ventriculares prematuras (PVC) mediante cabeza de clasificacion binaria, con encoder congelado (linear probe) o fine-tuning completo.
- Clasificacion de hipertension de estadio I con la misma estrategia de cabeza downstream.
- Cribado exploratorio de anomalias de laboratorio (HbA1c, hemoglobina, recuento de plaquetas, sodio serico) mediante sondas lineales con encoder congelado.
- Inferencia on-device: el tamaño reducido permite ejecucion en hardware de smartwatch sin cuantizacion ni poda.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo linguistico.

## Casos de uso

- Deteccion de PVC en wearables: el encoder preentrenado se combina con una cabeza binaria y se evalua sobre PPG con referencia ECG, alcanzando AUROC de 0,9165 con fine-tuning en la cohorte de 139 participantes. Adecuado por su tamaño y por la entrada de 10 segundos que cabe en el muestreo continuo de un smartwatch.
- Cribado de hipertension de estadio I: cabeza de clasificacion sobre el encoder permite obtener una puntuacion de riesgo continua a partir de PPG de muñeca, con AUROC de 0,8969 tras fine-tuning en la cohorte de 135 participantes.
- Investigacion en representacion learning de biosignales: el encoder sirve como extractor de features congelado para explorar correlaciones entre morfologia del pulso y variables fisiologicas, gracias a que el codigo de evaluacion y el pipeline de linear probe son reproducibles.
- Cribado exploratorio de anomalias de laboratorio: sondas lineales congeladas sobre HbA1c, hemoglobina, plaquetas y sodio serico permiten estudiar que informacion fisiologica es codificada en la señal PPG sin reentrenar el encoder.
- Prototipado on-device en smartwatches comerciales: al no requerir cuantizacion ni poda, el modelo puede integrarse en pipelines de inferencia en dispositivo para experimentos de cribado en tiempo real en entornos de recursos limitados.
- Monitorizacion ambulatoria de ritmo cardiaco: ventanas de 10 segundos a 100 Hz encajan con la captura continua de PPG en wearables, permitiendo experimentos de deteccion de eventos arrhytmicos durante el uso cotidiano.
- Base para modelos fundacionales de señales fisiologicas: el codigo abierto de arquitectura y preentrenamiento permite reutilizar el diseño jerarquico MAE para otras modalidades de biosignales con revalidacion del formato de entrada.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados, cohortes privadas):

| Tarea | Estrategia | Dataset | AUROC |
|---|---|---|---|
| Deteccion de PVC | Encoder congelado, linear probe | Cohorte privada, 139 participantes, test | 0,8023 |
| Deteccion de PVC | Fine-tuning | Cohorte privada, 139 participantes, test | 0,9165 |
| Hipertension estadio I | Encoder congelado, linear probe | My Heart Lab Study, 135 participantes, test | 0,6624 |
| Hipertension estadio I | Fine-tuning | My Heart Lab Study, 135 participantes, test | 0,8969 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks equivalentes de biosignales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 1,2 M de parametros el modelo es extremadamente ligero en memoria.
- GPU recomendadas: no disponible; el modelo esta diseñado para ejecutarse en hardware de smartwatch, por lo que cualquier GPU consumer es sobradamente suficiente.
- Compatibilidad con GPU consumer: si, por el reducido tamaño del modelo; no se especifican modelos concretos.
- Opciones de despliegue: no disponible; el repositorio documenta implementacion en PyTorch/Lightning con script de preentrenamiento y pipeline de linear probe reproducible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos fundacionales para PPG de muñeca o biosignales on-device) con parametros, contexto, rendimiento, licencia y disponibilidad documentados.

## Limitaciones y advertencias

- No hay utilidad clinica establecida: los estudios muestran validez predictiva entre cohortes y viabilidad tecnica en hardware comercial, pero no constituyen validacion clinica prospectiva ni demuestran seguridad, beneficio para el paciente o utilidad clinica.
- Los pesos preentrenados, los checkpoints clinicos y los datos de entrenamiento son propietarios y no se distribuyen; solo el codigo esta disponible bajo MIT.
- Desbalance de la poblacion de preentrenamiento: 77,6 % hombres, 57,1 % de 30-49 años y 65,1 % de raza blanca; el rendimiento en grupos infrarrepresentados, incluidos adultos de 65 años o mas (2,8 %), puede diferir.
- El rendimiento por subgrupos demograficos no se ha evaluado, ya que las variables demograficas no estaban disponibles de forma uniforme en las cohortes downstream.
- Uso fuera de alcance: dispositivo diagnostico autonomo, despliegue clinico sin validacion prospectiva, calibracion y evaluacion de carga de alertas, entradas con formato distinto al de preentrenamiento (otra localizacion corporal, sensor, frecuencia de muestreo o longitud de ventana) sin revalidacion, y afirmaciones de rendimiento equivalente entre subgrupos.
- Riesgo de alucionacion no aplicable directamente (modelo de señales, no generativo linguistico); el riesgo equivalente es la extrapolacion indebida de puntuaciones de riesgo a poblaciones no validadas.
- No soporta capacidades multilingues ni tareas de texto, codigo o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Simonlee711/HiMAE
- GitHub (arquitectura, entrenamiento y evaluacion): https://github.com/Simonlee711/HiMAE
- GitHub original citado en la model card: https://github.com/Simonlee711/On-Device-FM
- Paper de metodo (ICLR 2026): https://arxiv.org/abs/2510.25785
- Paper ICLR (PDF de proceedings): https://proceedings.iclr.cc/paper_files/paper/2026/file/6a3a5b1ad657c46ab99958b138bcd525-Paper-Conference.pdf
- Foundation Models for Physiological Signals: Opportunities and Challenges (ResearchGate): https://www.researchgate.net/publication/394318718_Foundation_Models_for_Physiological_Signals_Opportunities_and_Challenges
- Paper de evaluacion clinica on-device: manuscrito en submission, sin enlace disponible en la informacion proporcionada.
