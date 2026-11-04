# Gowtham25/hc-mts-models

## Resumen

HC-MTS es un conjunto de checkpoints de visión por computador orientados al ámbito médico, concretamente a la clasificación y segmentación de lesiones cutáneas y erupciones. Lo publica el usuario Gowtham25 como parte de la pila de consultoría HC-MTS, cuyo código está disponible en un repositorio de GitHub. No se trata de un modelo de lenguaje, sino de una colección de redes convolucionales (ConvNeXt-Base, AttResUNet y modelos auxiliares) empaquetadas para un pipeline clínico de triaje, clasificación, segmentación y control de calidad de imagen.

La relevancia del paquete reside en su enfoque de sistema completo: no ofrece un único clasificador, sino un conjunto de cabezas especializadas (triaje de 3 clases, clasificación de familias de erupciones en 10 clases, segmentación de lesiones, detección de piel sana o imagen no cutánea y predicción de localización anatómica en 11 clases) más utilidades de preprocesado facial. Esta modularidad permite construir un flujo de decisión con abstención y rechazo de entradas no válidas, algo poco habitual en publicaciones de modelos aislados.

El repositorio ocupa 4,4 GB e incluye pesos en PyTorch (`.pt`) y algunos modelos ONNX para el módulo de limpieza facial. La licencia es MIT. No hay información sobre la composición de los datos de entrenamiento, los idiomas soportados ni el contexto de uso clínico más allá de las métricas declaradas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Base (cabezas de clasificación), AttResUNet (segmentación), parser facial y detector YuNet en ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch sin cuantizar y ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El paquete combina varias arquitecturas. La cabeza principal de triaje (`l1/s2_convnext`) emplea ConvNeXt-Base para una clasificación de tres clases. Las cabezas de erupciones (`l15/s2_l15_texture` y `l15/s2_l15_natural`) resuelven una clasificación de 10 familias, una de ellas entrenada con aumentación específica de textura. La segmentación se cubre con dos modelos: una variante fine-tuneada sobre máscaras clínicas (`seg/s0_clinical_ft`) y un AttResUNet entrenado sobre imágenes dermatoscópicas (`seg/s0_att_resunet`). Se añaden cabezas de control (`gate`) para detectar piel sana y rechazar imágenes que no son de piel, una cabeza de localización anatómica de 11 clases y utilidades faciales en ONNX.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de épocas ni si se aplicaron técnicas de ajuste fino con preferencias. La model card solo indica que existe un repositorio de dataset asociado con informes JSON de métricas, y que algunos checkpoints adicionales de investigación (S1, S3, L1.5 balanceado, copia de heridas) se incluyen en `research/`. Tampoco se detalla la estrategia de aumentación más allá de la mención a "texture aug" en una de las cabezas.

## Capacidades

- Clasificación de triaje clínico en 3 clases mediante ConvNeXt-Base.
- Clasificación de erupciones cutáneas en 10 familias, con dos variantes de entrenamiento (con aumentación de textura y con mezcla natural de clases).
- Segmentación de lesiones cutáneas, con un modelo ajustado a máscaras clínicas y otro especializado en imagen dermatoscópica.
- Detección de piel sana y rechazo de imágenes que no corresponden a piel (logit de "not-skin").
- Predicción de localización anatómica en 11 clases.
- Preprocesado facial: parser de cara y detector YuNet para limpieza de máscaras.
- Mecanismo de abstención configurable mediante `export/inference_config.json` (temperatura, umbral de abstención y nombres de clase).
- No ofrece generación de texto, razonamiento, código, matemáticas ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Triaje previo a consulta dermatológica: la cabeza `l1/s2_convnext` clasifica una imagen en tres niveles de prioridad, lo que permite ordenar revisiones en un servicio con lista de espera y derivar antes los casos urgentes.
- Clasificación de familias de erupciones en atención primaria: la cabeza `l15/s2_l15_texture` agrupa la imagen en una de 10 familias, útil como segunda opinión orientativa antes de derivar al especialista.
- Segmentación de lesiones para seguimiento longitudinal: los modelos `seg/s0_clinical_ft` y `seg/s0_att_resunet` generan máscaras que permiten medir área y evolución de una lesión entre visitas.
- Filtrado automático de imágenes en un pipeline de captura: la cabeza `gate/s2_not_skin` descarta fotos que no son de piel o que no muestran hallazgos, reduciendo falsos positivos antes de la clasificación.
- Enrutamiento por localización anatómica: la cabeza `site/s2_site` asigna la imagen a una de 11 regiones, lo que permite aplicar protocolos distintos según la zona corporal o validar la coherencia de la captura.
- Preprocesado de imágenes faciales: el parser facial y el detector YuNet en ONNX permiten recortar y limpiar la región de interés cuando la lesión está en la cara, evitando que el fondo o el pelo contaminen la predicción.
- Integración en herramientas de investigación: los checkpoints de `research/` y los informes JSON de métricas sirven como línea base reproducible para comparar variantes de aumentación o arquitecturas en estudios de dermatología computacional.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| L1 (triaje 3 clases) | Accuracy | 0,854 |
| L1 (triaje 3 clases) | Macro-F1 | 0,836 |
| L1.5 (10 familias de erupciones) | Macro-F1 | 0,479 |
| Segmentación | Dice | 0,898 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras anteriores proceden de la model card y corresponden al conjunto de test declarado por el autor; no se especifica el tamaño ni la composición de dicho conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un ConvNeXt-Base en precisión FP32 ronda los 350-400 MB de pesos, y el AttResUNet es de tamaño moderado, por lo que el conjunto completo debería caber en GPUs de consumo, aunque no se han publicado mediciones.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño de los modelos, una RTX 3060 o superior sería suficiente para inferencia en FP32 o FP16; no se confirma.
- Cabe en GPU de consumo: previsiblemente sí, dado que se trata de modelos convolucionales de tamaño medio, pero el paquete completo de 4,4 GB incluye múltiples checkpoints y no está pensado para cargarse entero en memoria a la vez.
- Opciones de despliegue: PyTorch para los `.pt`; ONNX Runtime para los modelos de `face_guard/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HC-MTS (este paquete) | ConvNeXt-Base + AttResUNet, clasificación y segmentación dermatológica | no disponible | no aplica | MIT | HuggingFace, 0 descargas |
| ConvNeXt-Base estándar (ImageNet) | CNN de clasificación general | ~88 M | no aplica | MIT | Ampliamente disponible |
| MedMNIST / modelos dermatológicos públicos | CNNs especializadas en imágenes médicas | variable | no aplica | variable | Disponibles en repositorios académicos |

No se dispone de comparativas directas publicadas con otros modelos dermatológicos en la información proporcionada. La comparación con ConvNeXt-Base estándar solo es válida a nivel de arquitectura, no de rendimiento clínico, ya que este paquete está ajustado a un dominio específico.

## Limitaciones y advertencias

- El macro-F1 de 0,479 en la clasificación de 10 familias de erupciones es bajo para uso clínico real; indica dificultad considerable para separar clases a nivel de familia.
- No se documenta la composición, el origen ni el tamaño del dataset de entrenamiento, lo que impide evaluar sesgos demográficos (tono de piel, edad, sexo) ni la validez externa de las métricas.
- El conjunto de test no está descrito; las cifras de accuracy y Dice podrían no ser representativas de poblaciones distintas a la del entrenamiento.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de predicciones erróneas con alta confianza en imágenes fuera de distribución; el mecanismo de abstención mitiga parcialmente este problema.
- Licencia MIT permite uso comercial, pero no se ofrece ninguna garantía ni certificación regulatoria (CE, FDA) para uso clínico; el autor lo presenta como una pila de consultoría, no como dispositivo médico.
- El paquete incluye múltiples checkpoints y utilidades, lo que complica su despliegue; requiere conocer la estructura de directorios y el script `setup_from_hf.sh`.
- No hay información sobre idiomas ni sobre soporte multilingüe, algo irrelevante para un modelo de visión pero relevante si se integra en interfaces de usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes independientes de uso.

## Enlaces

- HuggingFace: https://huggingface.co/Gowtham25/hc-mts-models
- Repositorio GitHub de la pila HC-MTS: https://github.com/G-Docglasses/skin-disease-classification
- Dataset repo asociado (mencionado en la model card): no disponible como enlace directo
