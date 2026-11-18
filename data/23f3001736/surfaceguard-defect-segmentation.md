# 23f3001736/surfaceguard-defect-segmentation

## Resumen

SurfaceGuard AI es un modelo de segmentación semántica de defectos superficiales desarrollado por Sripathi Dhruv Reddy (usuario 23f3001736) como proyecto del programa DL GenAI del IITM BS (Term 3, 2026). El modelo resuelve un problema muy concreto de visión industrial: identificar y delimitar cuatro tipos de defectos (`defect_a` a `defect_d`) sobre imágenes de superficies, devolviendo un mapa de probabilidades por píxel para cada clase.

Técnicamente es un ensemble de dos redes FPN con encoder EfficientNet-B3, exportado a ONNX junto con Test-Time Augmentation de cuatro volteos horizontales/verticales integrada en el propio grafo. Trabaja sobre entradas de resolución fija 128x800 píxeles en RGB, con la normalización ImageNet incorporada dentro del grafo ONNX, lo que simplifica su integración en pipelines de inspección.

Su relevancia es acotada pero práctica: es un artefacto pequeño (0,2 GB), con licencia MIT y formato ONNX listo para despliegue en CPU o GPU sin dependencias de PyTorch. No es un modelo de propósito general ni compite con los grandes modelos multimodales; está pensado para una tarea de nicho y un dataset específico, y su utilidad fuera de ese contexto está limitada por la ausencia de documentación sobre los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FPN (Feature Pyramid Network) con encoder EfficientNet-B3, ensemble de dos modelos (D y E) |
| Parametros totales | no disponible (dos redes EfficientNet-B3 + cabezas FPN; el repo pesa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1x3x128x800) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float32; cuantización INT8 posible pero no documentada) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (`surfaceguard_ensemble.onnx`) y PyTorch state dicts (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos segmentadores semánticos con arquitectura FPN y encoder EfficientNet-B3 preentrenado en ImageNet (según la model card, `Normalized(smp.FPN("efficientnet-b3", classes=4))`). Cada red produce cuatro canales de salida correspondientes a `defect_a`, `defect_b`, `defect_c` y `defect_d`, con activación sigmoide por píxel. El ensemble combina los modelos D y E (este último entrenado con semilla 7) y aplica TTA de cuatro volteos dentro del grafo ONNX exportado.

La entrada es un tensor float32 de forma `(1, 3, 128, 800)` con valores RGB en `[0, 1]`; la normalización ImageNet está embebida en el grafo. La salida es `prob` de forma `(1, 4, 128, 800)`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de aumento de datos más allá del TTA de inferencia. Tampoco se especifica si se usaron funciones de pérdida específicas (Dice, BCE, Focal) ni el esquema de entrenamiento (épocas, optimizador, learning rate).

El post-procesado empleado en la competición de Kaggle es parte relevante del pipeline: umbral de 0,2 para todas las clases y área mínima por clase de 0, 100, 50 y 0 píxeles para `defect_a`, `defect_b`, `defect_c` y `defect_d` respectivamente.

## Capacidades

- Segmentación semántica multiclase de defectos superficiales en cuatro categorías (`defect_a` a `defect_d`).
- Salida de probabilidades por píxel (sigmoide independiente por clase, no softmax), lo que permite solapamiento entre clases.
- Inferencia con TTA de cuatro volteos integrada en el grafo ONNX, sin coste de implementación adicional en el cliente.
- Normalización ImageNet incluida en el grafo, lo que reduce errores de preprocesado.
- Ejecutable en runtime ONNX (onnxruntime) sin dependencia de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio.
- No hay capacidades multilingües (no procesa lenguaje).
- No dispone de modo "thinking" ni de salidas estructuradas más allá del tensor de segmentación.

## Casos de uso

- Inspección visual automatizada en líneas de fabricación: el modelo recibe imágenes de superficie a 128x800 y devuelve máscaras de defectos para clasificar piezas como aptas o rechazadas, aprovechando el umbral 0,2 y las áreas mínimas ya calibradas por el autor.
- Control de calidad en industria textil o de recubrimientos: detección de manchas, rayones o irregularidades en tiras continuas, donde la resolución panorámica 128x800 encaja con cámaras lineales.
- Preprocesado para sistemas de metrología: las máscaras generadas pueden alimentar un módulo de medición de área o perímetro del defecto para priorizar la revisión humana.
- Despliegue en dispositivos edge con onnxruntime: al ser un ONNX de 0,2 GB y entrada moderada, puede ejecutarse en CPU en entornos sin GPU, útil en plantas con hardware limitado.
- Integración en pipelines de MLOps como baseline: el par de state dicts `.pt` permite reentrenar o afinar sobre nuevos dominios de defectos manteniendo la arquitectura FPN + EfficientNet-B3.
- Prototipado rápido en investigación académica: sirve como referencia reproducible (semilla 7, ensemble D+E) para experimentos de segmentación con TTA en datasets de defectos.
- Filtrado previo en sistemas de visión con múltiples etapas: la salida de probabilidad permite descartar imágenes limpias antes de pasar a un modelo más costoso.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de la competición de Kaggle asociada al proyecto:

| Metrica | Valor |
|---|---|
| Public leaderboard (Kaggle) | 0,66965 |
| Validation score | 0,7308 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos de segmentación de defectos. La métrica exacta del leaderboard no se especifica en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: no disponible con precisión; por el tamaño del repo (0,2 GB) y la arquitectura EfficientNet-B3 + FPN, se estima un consumo moderado, apto para GPUs de gama media, aunque no hay medición publicada.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060/4060 o superior debería ser suficiente, pero es una estimación, no un dato del autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del artefacto, aunque no confirmado por el autor.
- Opciones de despliegue: onnxruntime (CPU/GPU), TensorRT previa conversión, OpenVINO. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard (este) | no disponible (2x EfficientNet-B3 + FPN) | 128x800 RGB | Segmentación de 4 defectos | MIT | ONNX + PyTorch |
| Segment Anything (SAM) | ~600M (ViT-H) | 1024x1024 | Segmentación genérica promptable | Apache 2.0 | Pesos públicos |
| U-Net clásico | ~7-30M | variable | Segmentación biomédica/industrial | variable | Múltiples implementaciones |
| DeepLabv3+ (ResNet-101) | ~59M | variable | Segmentación semántica general | BSD/MIT según implementación | Pesos públicos |

La comparación es orientativa: SAM y DeepLabv3+ son modelos de propósito general, mientras que SurfaceGuard está especializado en cuatro clases de defectos concretas y no ofrece segmentación promptable ni clases abiertas. No se dispone de comparaciones de rendimiento publicadas entre SurfaceGuard y estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no especificado, puede sobrerrepresentar ciertos tipos de superficie o condiciones de iluminación.
- Riesgo de alucinación: en segmentación se traduce en falsos positivos; el umbral 0,2 es bajo y puede generar detecciones espurias en imágenes fuera de dominio.
- Limitaciones de contexto o idioma: la entrada está fijada a 128x800; imágenes de otra resolución requieren redimensionado, lo que puede degradar la precisión.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de entrenamiento antes de uso en producción.
- Caveats para producción: no hay información sobre el dataset, el esquema de entrenamiento ni validación cruzada; el score de validación (0,7308) es de una única partición y no garantiza generalización. El post-procesado (umbral y áreas mínimas) está calibrado para la competición y puede no transferirse a otros dominios.
- El modelo no incluye documentación sobre calibración de probabilidades ni sobre el significado semántico de `defect_a` a `defect_d`.

## Enlaces

- Hugging Face: https://huggingface.co/23f3001736/surfaceguard-defect-segmentation
- Model card del autor: incluida en el repositorio de Hugging Face (sin URL independiente)
- Paper, blog o demo: no disponibles en la información proporcionada
