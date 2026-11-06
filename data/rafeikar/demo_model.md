# RafeiKAr/demo_model

## Resumen

`RafeiKAr/demo_model` es un modelo de estimación de mirada (gaze estimation) desarrollado por Khaled Rafei en el marco de su tesis de máster *Dateneffiziente Personalisierung für webcam-basiertes Eye-Tracking mithilfe vortrainierter Bildverarbeitungsmodelle* (BHT Berlin, 2026). No se trata de un modelo de lenguaje, sino de un regresor visual que predice un punto de mirada en coordenadas de pantalla normalizadas a partir de una imagen de la cara o del ojo. El repositorio contiene únicamente el archivo `base_norm_subject.pt`, un `state_dict` de PyTorch, y el tamaño del repo es de 0,0 GB.

La arquitectura combina un backbone ResNet-18 preentrenado en ImageNet (pesos de torchvision, congelado durante el entrenamiento) con una cabeza de regresión de cuatro capas (512 → 512 → 256 → 128 → 2) que termina en una activación sigmoide. Solo se entrenó la cabeza de regresión sobre un subconjunto de GazeCapture con partición disjunta por sujeto, usando pérdida L1, optimizador AdamW y una tasa de aprendizaje de 1e-4.

Es relevante como pieza de referencia (basismodell) dentro de un flujo de personalización de eye-tracking por webcam: el propio autor advierte que, por sí solo, el modelo apenas supera una estimación trivial de la mirada hacia el centro de la pantalla, y que su función es servir de punto de partida para la personalización que se demuestra en el repositorio de código. La licencia es de solo investigación y uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-18 congelado) + cabeza de regresión MLP 512 → 512 → 256 → 128 → 2 con sigmoide |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de estimación de mirada) |
| Licencia | research-only (solo investigación, no comercial) |
| Formato de pesos | PyTorch `state_dict` (`base_norm_subject.pt`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de visión en dos etapas. La primera es un ResNet-18 con pesos preentrenados de ImageNet obtenidos de torchvision, que se mantiene congelado y actúa como extractor de características visuales. La segunda es una cabeza de regresión totalmente conectada con dimensiones 512 → 512 → 256 → 128 → 2 y activación sigmoide, que produce un punto de mirada (x, y) en el espacio normalizado de pantalla [0, 1]².

El entrenamiento se limita a la cabeza de regresión, sobre un subconjunto del dataset GazeCapture (Krafka et al., CVPR 2016) con un split disjunto por sujeto. Se emplea pérdida L1, optimizador AdamW y tasa de aprendizaje 1e-4. No se documenta en la información disponible el número de tokens o muestras exactas, la composición detallada del subconjunto ni si hubo etapas de ajuste fino adicionales, RLHF o DPO (no aplicables en este dominio). Como innovación destacable, el diseño apuesta por el entrenamiento exclusivo de la cabeza sobre un backbone congelado, lo que reduce el coste computacional y encaja con el objetivo de personalización eficiente en datos de la tesis.

## Capacidades

- Estimación de mirada: predice un punto (x, y) en coordenadas de pantalla normalizadas [0, 1]² a partir de una imagen de entrada.
- Regresión visual: salida continua de dos dimensiones con activación sigmoide, adecuada para localización de punto de mirada.
- Extracción de características: el backbone ResNet-18 preentrenado en ImageNet puede reutilizarse como extractor congelado en pipelines de personalización.
- Punto de partida para personalización: el modelo está pensado como base sobre la que aplicar adaptación por sujeto en la demo del autor.
- Sin soporte de tool calling, function calling ni agentes: no es un modelo de lenguaje.
- Sin capacidades multilingües, de razonamiento, código, matemáticas, visión general, audio ni modo thinking: no disponibles en la información proporcionada.
- Sin capacidades de conversación multi-turno ni contexto textual.

## Casos de uso

- Investigación en eye-tracking por webcam: el modelo sirve como línea base reproducible para comparar técnicas de personalización sobre GazeCapture, dado que el autor lo publica como punto de partida de su tesis.
- Prototipado de demos de seguimiento ocular: integrado en el repositorio https://github.com/RafeiKAr/gaze-estimation, permite arrancar una demo funcional antes de aplicar la personalización por sujeto.
- Estudio de eficiencia de datos: al entrenar solo la cabeza de regresión sobre un backbone congelado, es útil para experimentos que midan cuántas muestras por sujeto se necesitan para mejorar la estimación.
- Extracción de características visuales: el ResNet-18 congelado puede reutilizarse como extractor en pipelines propios de visión por computador dentro de entornos de investigación.
- Evaluación de splits disjuntos por sujeto: útil para reproducir protocolos de evaluación que evitan fuga de identidad entre entrenamiento y prueba.
- Docencia y trabajos fin de máster: como ejemplo documentado de transferencia de aprendizaje con backbone congelado y cabeza de regresión en un problema de regresión visual.
- No recomendado para producción comercial: la licencia research-only y el aviso del autor sobre su rendimiento limitado lo desaconsejan fuera de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica cualitativamente que, por sí solo, el modelo apenas es mejor que estimar el centro de la pantalla, pero no se proporcionan métricas numéricas (error angular, error en píxeles, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la arquitectura (ResNet-18 congelado más una cabeza MLP pequeña) el consumo es bajo, del orden de cientos de MB, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del backbone, cualquier GPU consumer moderna es suficiente en la práctica, pero no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido de ResNet-18, aunque no se confirma con datos del autor.
- Opciones de despliegue: PyTorch (carga del `state_dict` `base_norm_subject.pt`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de estimación de mirada ni métricas que permitan establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento limitado: el propio autor advierte que el modelo, por sí solo, apenas supera la estimación trivial del centro de la pantalla; no debe evaluarse como solución final.
- Licencia research-only: uso exclusivamente para investigación, no comercial. Está sujeto a las condiciones de GazeCapture (Krafka et al., CVPR 2016).
- Condiciones de ImageNet: los pesos del backbone provienen de torchvision (BSD-3-Clause), pero para dichos pesos pueden aplicar las condiciones de ImageNet.
- Obligación de citación: al usar el modelo debe citarse la tesis de máster y GazeCapture.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenar sobre un subconjunto de GazeCapture, pueden heredarse sesgos de dicho dataset (demografía, dispositivos, condiciones de captura), aunque no se documentan.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos; el riesgo equivalente es una predicción de mirada imprecisa o fuera de rango, mitigada parcialmente por la activación sigmoide.
- Limitaciones de contexto o idioma: no aplica; es un modelo de visión sin contexto textual ni capacidades lingüísticas.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, y el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar disponibles o ser de tamaño despreciable; conviene verificar la integridad del archivo antes de usarlo.
- Idiomas: no disponibles; irrelevante para la tarea.

## Enlaces

- Hugging Face: https://huggingface.co/RafeiKAr/demo_model
- Código y demo: https://github.com/RafeiKAr/gaze-estimation
- GazeCapture (dataset): https://gazecapture.csail.mit.edu
- Paper de GazeCapture: Krafka et al., *Eye Tracking for Everyone*, CVPR 2016 (referenciado en la model card; sin URL directa en la información proporcionada)
