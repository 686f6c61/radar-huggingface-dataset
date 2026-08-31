# Falcon7211/Scanvidence-SegResNetB0

## Resumen

Scanvidence-SegResNetB0 es un modelo de segmentación semántica 3D de tumores cerebrales desarrollado por Falcon7211 (Anas Khalid) como parte de la plataforma Scanvidence, un sistema híbrido cuántico-clásico para imagen médica. El modelo combina un encoder-decoder residual 3D (SegResNetB0) con un módulo de radiomics cuántico que permite el perfilado molecular no invasivo del estado de metilación del promotor MGMT, un biomarcador clave en gliomas. Está entrenado sobre el dataset BraTS-GLI-2023 del desafío ASNR-MICCAI, con una arquitectura ligera de 1,6 millones de parámetros y una ventana de entrada de parches MRI de 96×96×96 vóxeles con 4 canales.

La relevancia de este modelo radica en su doble funcionalidad: por un lado, ofrece segmentación precisa de las tres regiones tumorales (tumor completo, núcleo tumoral y tumor realzante) con un Dice medio de 0,8953; por otro, integra un clasificador cuántico (QSVM) que extrae un panel de 9 biomarcadores radiomicos mediante optimización QUBO resuelta en una QPU de IBM, logrando una mejora del +6,7% en AUC frente a SVM clásicas. Esto lo posiciona como una herramienta prometedora para el diagnóstico asistido y la planificación terapéutica en neurooncología, aunque su adopción clínica requiere validación externa adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegResNetB0 (encoder-decoder residual 3D) |
| Parametros totales | 1.599.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (best.pt), joblib (QSVM) |

## Arquitectura y entrenamiento

El modelo principal es un SegResNetB0, una variante de la familia SegResNet con bloque residual y codificador-decodificador en 3D, diseñada para segmentación volumétrica. La entrada es un tensor de 4 canales (T1, T1ce, T2, FLAIR) con dimensiones 1×4×96×96×96, y la salida son logits de 4 clases (fondo, tumor completo, núcleo tumoral y tumor realzante). El entrenamiento se realizó sobre el dataset BraTS-GLI-2023, que incluye imágenes de resonancia magnética multimodal de gliomas adultos, con una división estricta a nivel de paciente para evitar fuga de datos. No se especifican detalles sobre el número de épocas (el checkpoint guardado corresponde a la época 72), la función de pérdida ni el optimizador, aunque el historial de entrenamiento está disponible en el repositorio.

El componente cuántico es independiente del segmentador: se trata de un QSVM (Quantum Support Vector Machine) con un kernel cuántico `ZZFeatureMap` de 9 qubits en un espacio de Hilbert de 512 dimensiones, entrenado sobre características radiomicas extraídas con PyRadiomics. La selección de biomarcadores se formuló como un problema QUBO (NP-hard) y se resolvió en la QPU IBM Fez de 156 qubits, obteniendo un panel no redundante de 9 biomarcadores. Este módulo se utiliza para predecir el estado de metilación de MGMT a partir de las regiones segmentadas, con explicabilidad mediante SHAP.

## Capacidades

- Segmentación 3D de tumores cerebrales en resonancia magnética multimodal, distinguiendo tumor completo (WT), núcleo tumoral (TC) y tumor realzante (ET).
- Perfilado molecular no invasivo del estado de metilación del promotor MGMT mediante radiomics cuántico, con salida de probabilidad y confianza.
- Explicabilidad de las predicciones moleculares mediante atribuciones SHAP sobre los biomarcadores seleccionados.
- Inferencia sobre parches de 96×96×96 vóxeles con 4 canales, compatible con flujos de trabajo de imagen médica estándar.
- Integración modular en la plataforma Scanvidence, que incluye preprocesado, calibración y evaluación con división de datos a nivel de paciente.
- Soporte para tareas de detección de Alzheimer y otros procesos de imagen médica (según el repositorio GitHub de Scanvidence), aunque el modelo publicado se centra en tumores cerebrales.

## Casos de uso

- Diagnóstico asistido de gliomas: el modelo segmenta automáticamente las regiones tumorales en MRI preoperatorias, proporcionando volúmenes y métricas objetivas que ayudan al radiólogo a caracterizar la extensión del tumor y a planificar la biopsia.
- Planificación quirúrgica y radioterápica: las máscaras de segmentación generadas pueden usarse para delimitar el volumen diana en cirugía guiada por imagen o en radioterapia, reduciendo el tiempo de delineación manual.
- Seguimiento longitudinal de tumores: al procesar estudios seriados, el modelo permite cuantificar cambios en el volumen tumoral y en las subregiones, útil para evaluar respuesta a tratamiento.
- Selección de pacientes para terapias dirigidas: la predicción del estado MGMT (metilado vs. no metilado) a partir de MRI puede orientar la decisión de usar temozolomida u otras terapias, evitando biopsias invasivas en casos seleccionados.
- Investigación clínica y ensayos farmacológicos: el pipeline completo (segmentación + radiomics cuántico) puede aplicarse a cohortes retrospectivas para correlacionar biomarcadores de imagen con resultados moleculares y supervivencia.
- Formación y validación de algoritmos médicos: al ser un modelo ligero (0,91 GB VRAM) y de código abierto, puede servir como referencia para comparar nuevas arquitecturas de segmentación o para experimentos de aprendizaje federado en entornos hospitalarios.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card, sin verificación independiente. Se refieren al conjunto de validación del desafío BraTS 2023 (glioma adulto).

| Metrica | Valor |
|---|---|
| Dice medio de validacion | 0,8953 |
| Dice tumor completo (WT) | 0,9223 ± 0,063 |
| Dice nucleo tumoral (TC) | 0,8808 ± 0,174 |
| Dice tumor realzante (ET) | 0,8345 ± 0,229 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor también menciona una ganancia de +6,7% en AUC del QSVM frente a una SVM clásica con kernel RBF, pero no se proporciona el valor absoluto de AUC.

## Requisitos de hardware

- VRAM estimada: 0,91 GB en FP32 según el perfil de hardware incluido en el repositorio (`profile-b0.json`), lo que permite ejecutar el modelo en GPUs de consumo con 2 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.). También puede ejecutarse en CPU, aunque con mayor latencia.
- Tiempo de inferencia: 601,5 ms por paso (step time) en FP32, medido en el hardware utilizado por el autor (no especificado).
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, ONNX Runtime (si se exporta) o integrarse en pipelines personalizados con FastAPI. El componente QSVM requiere acceso a una QPU de IBM (por ejemplo, IBM Fez) para la parte de optimización QUBO, aunque la inferencia del QSVM ya entrenado puede ejecutarse en CPU clásica.
- Latencia y throughput: no se proporcionan datos de throughput; la latencia por parche es de ~0,6 s en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de segmentación de tumores cerebrales en la información proporcionada. Modelos como nnU-Net, DeepMedic o los ganadores de BraTS 2023 suelen reportar Dice medios superiores a 0,90, pero no se han incluido en la documentación de Scanvidence. Para una evaluación justa, sería necesario ejecutar el modelo en el mismo conjunto de validación y con el mismo preprocesado.

## Limitaciones y advertencias

- Los resultados de Dice provienen de la validación del autor y no han sido verificados de forma independiente; podrían no reproducirse en otros entornos o con otros preprocesados.
- El modelo está entrenado exclusivamente con datos de BraTS 2023 (glioma adulto), por lo que su rendimiento en otros tipos de tumores cerebrales, en imágenes de otras máquinas o con protocolos de adquisición diferentes no está garantizado.
- La entrada está fijada a parches de 96×96×96 vóxeles con 4 canales; cualquier desviación requiere reescalado o padding, lo que puede afectar a la precisión.
- El componente cuántico (QSVM) depende de la disponibilidad de una QPU de IBM para la selección de biomarcadores; aunque el modelo entrenado se puede usar sin QPU, la reproducibilidad del pipeline completo requiere acceso a hardware cuántico.
- No se especifican sesgos demográficos o de población; los datos de BraTS provienen principalmente de centros occidentales, por lo que podría haber sesgos en poblaciones no representadas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con las regulaciones sanitarias locales (p. ej., marcado CE o FDA) antes de cualquier uso clínico.
- El repositorio de Hugging Face muestra un tamaño de 0.0 GB, lo que sugiere que los archivos de pesos podrían no estar disponibles en el momento de la consulta; la model card los lista, pero se recomienda verificar la disponibilidad real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Falcon7211/Scanvidence-SegResNetB0
- Perfil del autor en Hugging Face: https://huggingface.co/Falcon7211
- Repositorio GitHub de Scanvidence: https://github.com/Scanvidence/Scanvidence
- Organización GitHub de Scanvidence: https://github.com/Scanvidence/
