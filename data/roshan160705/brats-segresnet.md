# roshan160705/brats-segresnet

## Resumen

`roshan160705/brats-segresnet` es un modelo de segmentación de tumores cerebrales en resonancia magnética (RM) multimodal, desarrollado por el usuario de Hugging Face roshan160705 y basado en la arquitectura MONAI SegResNet. El modelo recibe cuatro secuencias de RM co-registradas (FLAIR, T1, T1ce y T2) y produce una segmentación en tres regiones de interés (core tumoral, tumor completo y tumor realzado), que posteriormente se convierten a las etiquetas BraTS estándar (NCR, ED y ET) y permiten calcular volúmenes en cm³.

Se trata de un modelo convolucional 3D de tamaño muy reducido (4.702.227 parámetros), entrenado sobre el conjunto de datos BraTS 2021 Task 1 (gliomas adultos, preoperatorios, con cráneo eliminado y resolución de 1 mm). El autor publica resultados de validación y test internos con Dice medio de 0,930 para el tumor completo, 0,911 para el core tumoral y 0,887 para el tumor realzado en el split de test retenido.

El modelo es relevante para la comunidad de imagen médica porque ofrece un checkpoint ligero, reproducible y con pipeline de inferencia documentado (ventana deslizante, TTA de 8 volteos y exportación a ONNX), lo que facilita su uso en docencia, investigación y experimentación con segmentación 3D. No obstante, el propio autor lo restringe explícitamente a investigación y educación, y advierte de que no es un dispositivo médico ni debe usarse en decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MONAI SegResNet (encoder-decoder convolucional 3D con conexiones residuales) |
| Parametros totales | 4.702.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; entrada fija de parche [128, 128, 128]) |
| Tipos de cuantizacion | no disponible (pesos PyTorch y exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint) y ONNX (opset 18, parche fijo [128, 128, 128], batch dinámico) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegResNet propuesta por Myronenko (BrainLes 2018) e implementada en MONAI, con `init_filters=16`, `blocks_down=[1, 2, 2, 4]`, `blocks_up=[1, 1, 1]` y `dropout_prob=0.2`. Es una red completamente convolucional 3D con encoder residual y decoder con upsampling, pensada para segmentación volumétrica de RM cerebral. La entrada son cuatro canales correspondientes a las secuencias FLAIR, T1, T1ce y T2, reorientadas a RAS, remuestreadas a (1,0, 1,0, 1,0) mm y normalizadas z-score por canal sobre vóxeles cerebrales. La salida son tres canales sigmoideos (TC, WT, ET) que se umbralizan por región (TC 0,5; WT 0,3; ET 0,5) y se convierten a las etiquetas BraTS 1 = NCR, 2 = ED, 4 = ET.

El entrenamiento se realizó sobre el split de entrenamiento de BraTS 2021 Task 1 (1001 casos de entrenamiento, 125 de validación y 125 de test, división a nivel de paciente con semilla 42). Se usó pérdida Dice sigmoidea, optimizador AdamW (lr 1e-4, weight decay 1e-5), 3 épocas de warmup seguidas de decaimiento coseno, 60 épocas en total y precisión mixta. Cada paso procesó un caso con dos recortes aleatorios de (128, 128, 128) vóxeles, con aumentos de datos consistentes en volteos aleatorios y escalado/desplazamiento de intensidad. El mejor checkpoint fue el de la época 55, con Dice medio de validación de 0,884 (TC 0,903, WT 0,890, ET 0,858). La inferencia emplea ventana deslizante con ROI de (128, 128, 128), solapamiento de 0,5 y mezcla gaussiana, con TTA opcional de 8 volteos.

## Capacidades

- Segmentación 3D de tumores cerebrales en RM multimodal (FLAIR, T1, T1ce, T2) en tres regiones: core tumoral (TC), tumor completo (WT) y tumor realzado (ET).
- Conversión de las regiones segmentadas a etiquetas BraTS (NCR, ED, ET) y cálculo de volúmenes en cm³.
- Inferencia por ventana deslizante sobre volúmenes completos, con solapamiento y mezcla gaussiana para evitar artefactos en los bordes.
- Test-time augmentation opcional de 8 volteos para mejorar la robustez de la predicción.
- Exportación a ONNX (opset 18) con batch dinámico y parche fijo de [128, 128, 128], con diferencia máxima frente a PyTorch de 9,4e-04.
- No dispone de tool calling, razonamiento multi-paso, capacidades lingüísticas ni agentes: es un modelo puramente de visión médica.

## Casos de uso

- Docencia en imagen médica: el modelo sirve para ilustrar un pipeline completo de segmentación 3D (preprocesado, ventana deslizante, TTA y post-procesado) en asignaturas de neuroimagen o aprendizaje profundo aplicado.
- Investigación en segmentación de gliomas: permite reproducir y comparar resultados con la arquitectura SegResNet sobre BraTS 2021 sin necesidad de reentrenar desde cero, gracias al checkpoint publicado y al código de inferencia.
- Cálculo de volumetría tumoral en estudios retrospectivos: el modelo estima volúmenes de NCR, ED, ET, TC y WT en cm³ con alta correlación con la verdad de referencia (Pearson r de 0,981 para WT y 0,959 para ED), útil para análisis de cohortes.
- Desarrollo de herramientas de anotación asistida: puede generar máscaras iniciales que un experto revise y corrija, reduciendo el tiempo de etiquetado en nuevos conjuntos de datos de RM cerebral.
- Integración en pipelines de investigación con ONNX Runtime: la exportación ONNX con batch dinámico permite desplegar el modelo en entornos de inferencia heterogéneos (CPU/GPU) dentro de flujos de experimentación.
- Benchmarking de nuevas arquitecturas: al ser un modelo pequeño (4,7 M de parámetros) y con métricas publicadas en test, sirve como línea base ligera para comparar propuestas de segmentación 3D en BraTS.

## Benchmarks y rendimiento

Resultados en el split de test retenido (125 casos), con TTA activado y post-procesado con umbrales [0,5, 0,3, 0,5]:

| Region | Dice medio ± std | Dice mediana | HD95 media (mm) | HD95 mediana (mm) |
|---|---|---|---|---|
| WT | 0,930 ± 0,071 | 0,951 | 6,56 | 2,00 |
| TC | 0,911 ± 0,154 | 0,964 | 3,82 | 1,73 |
| ET | 0,887 ± 0,134 | 0,930 | 3,40 | 1,41 |

Acuerdo de volumen (predicho frente a referencia, cm³):

| Region | MAE (cm³) | Error absoluto medio (%) | Pearson r | Sesgo (cm³) |
|---|---|---|---|---|
| NCR | 4,93 | 185,6 (n = 122) | 0,807 | -3,01 |
| ED | 6,24 | 22,5 (n = 125) | 0,959 | 2,81 |
| ET | 2,63 | 103,7 (n = 122) | 0,919 | 0,72 |
| TC | 4,22 | 164,2 (n = 125) | 0,917 | -2,28 |
| WT | 5,63 | 7,4 (n = 125) | 0,981 | 0,52 |

El autor advierte de que el error absoluto porcentual está dominado por regiones pequeñas (un fallo de 1 cm³ en una región de 0,5 cm³ supone un 200 %), por lo que para NCR, ET y TC son más informativos el MAE y la r de Pearson. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada para este checkpoint concreto. Como referencia externa, el paquete `segresnet-mlx` reporta un pico de memoria de 4,9 GB para un volumen de RM cerebral de 240×240×155 con cuatro secuencias al ejecutar un modelo SegResNet para BraTS en MLX.
- GPU recomendadas: no disponible de forma específica. Por el tamaño del modelo (4,7 M de parámetros) y el uso de ventana deslizante 3D, se espera que quepa en GPUs de consumo, pero no se documentan modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño reducido del modelo y la referencia de 4,9 GB de pico en MLX sugieren que es viable en GPUs con 8 GB o más, pero es una estimación no verificada.
- Opciones de despliegue: PyTorch con el paquete `btseg` del autor (`pip install git+https://github.com/RoshanKarthik/brain-tumor-seg`), ONNX Runtime (modelo `model.onnx`, opset 18) y, de forma externa, el runtime `segresnet-mlx` para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/volumen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brats-segresnet (este modelo) | 4,7 M | 4 secuencias RM, parche [128, 128, 128] | Ventana deslizante 3D | no disponible | Hugging Face + repo GitHub |
| segresnet-brats (paquete segresnet-mlx) | no disponible | 4 secuencias RM | 240×240×155 de ejemplo | no disponible | PyPI (`segresnet-mlx`) |
| SegResNet original (Myronenko, 2018) | no disponible | RM multimodal BraTS | 3D | no disponible | Paper BrainLes 2018 |
| MONAI SegResNet (implementación base) | configurable | 3D genérico | configurable | no disponible | MONAI |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Restricción de uso explícita: solo para investigación y educación; no es un dispositivo médico y no debe usarse para diagnóstico, planificación de tratamiento ni ninguna decisión clínica.
- Solo RM: entrenado con FLAIR, T1, T1ce y T2; no admite TC ni otras modalidades.
- Dominio restringido: gliomas adultos, exploraciones preoperatorias y preprocesado BraTS (co-registrado, cráneo eliminado, 1 mm). Otros tipos de tumor, exploraciones postoperatorias o imágenes sin procesar pueden fallar de forma silenciosa.
- Sin validación externa: todas las métricas provienen de una partición retenida de BraTS 2021, por lo que el rendimiento en datos de otros centros o protocolos no está caracterizado.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con BraTS 2021, puede heredar los sesgos de población y adquisición de ese conjunto.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de falsos positivos o negativos en la segmentación, especialmente en regiones pequeñas (NCR y ET muestran errores porcentuales muy elevados).
- Licencia del modelo no disponible: no se especifican términos de uso comercial; los datos de entrenamiento están sujetos a los términos de BraTS/Synapse y no se redistribuyen escáneres.
- Tamaño del repositorio de 0,0 GB en Hugging Face: conviene verificar la disponibilidad real de los pesos antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roshan160705/brats-segresnet
- Repositorio de código: https://github.com/RoshanKarthik/brain-tumor-seg
- Paquete segresnet-mlx en PyPI: https://pypi.org/project/segresnet-mlx/0.3.4/
- Paper BraTS 2021 (Baid et al.): https://arxiv.org/abs/2107.02314
- Paper SegResNet (Myronenko, 2018): https://arxiv.org/abs/1810.11654
- MONAI: https://monai.io/
