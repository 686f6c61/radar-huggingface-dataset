# sifaoso/Pix2Point

## Resumen

Pix2Point es un modelo de detección de puntos clave (keypoint detection) con pesos preentrenados publicados en Hugging Face por el usuario sifaoso. Concretamente, el repositorio aloja los pesos preentrenados de Pix2Rep-v2, un método de aprendizaje de representaciones presentado en MICCAI 2026, entrenado sobre el conjunto de datos AASCE 2019. Estos pesos proporcionan embeddings a nivel de píxel orientados a tareas de predicción densa.

El propósito principal del modelo es servir como inicialización para el entrenamiento de Pix2Point, un sistema de detección de landmarks espinales (vértebras en imágenes médicas de columna). Según la model card, usar esta preinicialización acelera la convergencia y mejora los resultados en la detección de puntos anatómicos espinales frente a entrenar desde cero.

El trabajo se presenta en el paper "Dense Representation Learning and Differentiable Shape Modeling for Spine Landmark Detection" (arXiv 2610.36951), que combina aprendizaje de representaciones densas con modelado diferenciable de formas. Es relevante para la comunidad de IA médica aplicada a radiología espinal, un dominio donde la anotación manual de landmarks es costosa y la precisión anatómica es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Pix2Rep-v2, aprendizaje de representaciones densas a nivel de píxel) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión por computador) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

El modelo se deriva de Pix2Rep-v2, un enfoque de aprendizaje de representaciones densas descrito en el paper de MICCAI 2026 "Dense Representation Learning and Differentiable Shape Modeling for Spine Landmark Detection". La preinicialización genera embeddings a nivel de píxel, lo que la hace adecuada para tareas de predicción densa en imágenes. El componente de modelado diferenciable de formas (differentiable shape modeling) del paper sugiere que la detección de landmarks se formula incorporando restricciones de forma anatómica de manera diferenciable, aunque los detalles concretos de la arquitectura no están disponibles en la información proporcionada.

El preentrenamiento se realizó sobre el conjunto de datos AASCE 2019, un dataset de imágenes espinales. No hay datos disponibles sobre el número de imágenes, épocas de entrenamiento, función de pérdida concreta ni técnicas de regularización empleadas.

## Capacidades

- Extracción de embeddings densos a nivel de píxel en imágenes médicas espinales.
- Inicialización para el entrenamiento de Pix2Point en detección de landmarks espinales (puntos anatómicos sobre vértebras).
- Transferencia a tareas de predicción densa en general, según indican los autores de la model card.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingües.

## Casos de uso

- Detección automática de landmarks espinales en radiografías: se emplean los pesos preentrenados como inicialización y se ajusta el modelo con datos anotados propios, reduciendo el tiempo de convergencia.
- Medición automatizada de parámetros clínicos: a partir de los landmarks detectados se pueden calcular ángulos de escoliosis (Cobb) o grados de espondilolistesis, tareas habituales en los datasets de referencia del dominio.
- Reducción de carga de anotación en radiología: un modelo preentrenado permite entrenar con menos imágenes etiquetadas, abaratar el despliegue en hospitales con datasets pequeños.
- Investigación en aprendizaje de representaciones médicas: los embeddings de píxel de Pix2Rep-v2 pueden reutilizarse como punto de partida para otras tareas de predicción densa (segmentación, regresión densa) en imágenes médicas.
- Sistemas de apoyo a la decisión clínica: integración en flujos de análisis de imágenes de columna para preselección de casos y priorización de revisiones por parte del especialista.
- Benchmarking de métodos de keypoint detection en imágenes médicas: uso como baseline reproducible al estar los pesos disponibles públicamente bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma cualitativamente que la preinicialización con Pix2Rep-v2 produce "mejores resultados en detección de landmarks espinales" y una convergencia más rápida, pero no incluye métricas numéricas. Consultar el paper para resultados cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero probablemente ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superior), aunque esta estimación no está confirmada por los autores.
- GPU recomendadas: no disponible; dada la naturaleza de imagen médica 2D, cualquier GPU moderna con soporte CUDA debería ser suficiente para inferencia y ajuste fino.
- Consumer GPU: probablemente compatible, dado el reducido tamaño del repositorio (0,3 GB), pero sin confirmación oficial.
- Opciones de despliegue: no disponible. Las instrucciones de uso se encuentran en el repositorio de GitHub del proyecto (https://github.com/BioMedTP/Pix2Point), presumiblemente basado en PyTorch, aunque el framework no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Dominio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pix2Point (Pix2Rep-v2 preentrenado) | Imagen médica espinal | Detección de landmarks | Apache 2.0 | Pesos públicos en Hugging Face |
| SpineNet y variantes de detección vertebral (p. ej., modelos basados en U-Net/HRNet para landmarks espinales) | Imagen médica espinal | Detección de landmarks / segmentación | Variable según repositorio | Pesos disponibles en repositorios de investigación |
| Modelos genéricos de keypoint detection (p. ej., HRNet, ViTPose) | Imágenes naturales | Detección de keypoints | Apache 2.0 / MIT | Pesos públicos, no especializados en anatomía espinal |

Nota: la comparativa es orientativa; no hay datos de rendimiento publicados que permitan comparar métricas numéricas entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Alcance restringido al dominio de imagen médica espinal: no es un modelo de propósito general ni un modelo de lenguaje.
- Los pesos son de preentrenamiento: están pensados como inicialización y requieren ajuste fino supervisado para la tarea final de detección de landmarks.
- No hay métricas publicadas en la model card: la afirmación de "mejores resultados" no puede verificarse sin consultar el paper.
- Riesgo de error en entornos clínicos: cualquier uso en contexto sanitario requiere validación clínica rigurosa y supervisión de especialistas; el modelo no está aprobado como dispositivo médico.
- Sesgos: el preentrenamiento sobre AASCE 2019 puede introducir sesgos de población, dispositivo de adquisición y protocolo de imagen; el rendimiento en datos de otros centros puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, sin restricciones conocidas específicas.
- Uso actual prácticamente nulo (0 descargas registradas en el momento de la ficha), por lo que no existe historial de adopción ni issues resueltos que sirvan de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sifaoso/Pix2Point
- Paper: https://huggingface.co/papers/2610.36951 (Dense Representation Learning and Differentiable Shape Modeling for Spine Landmark Detection, arXiv 2610.36951)
- Repositorio de GitHub con instrucciones de uso: https://github.com/BioMedTP/Pix2Point
