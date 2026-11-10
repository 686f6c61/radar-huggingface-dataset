# Farhanitrate0/pneumonia-resnet50

## Resumen

Pneumonia ResNet50 es un clasificador binario de imagen médica desarrollado por el usuario Farhanitrate0, consistente en una ResNet50 preentrenada en ImageNet y ajustada completamente (fine-tuning completo) sobre el conjunto de datos PneumoniaMNIST a una resolución de 224×224 píxeles. El modelo resuelve la tarea de detectar neumonía en radiografías de tórax, devolviendo un único logit que se interpreta como probabilidad de presencia de la patología tras aplicar sigmoide. Se publica como pesos de PyTorch (`.pth`) y constituye el componente de visión del proyecto Multimodal Medical Streaming Engine del mismo autor.

La relevancia del modelo reside en su carácter de prototipo de investigación reproducible y explicable: incorpora soporte para Grad-CAM y documenta métricas de calibración y ablaciones. No obstante, el propio autor lo etiqueta explícitamente como "research prototype, not a medical device", lo que acota severamente su uso a experimentación y no a despliegue clínico.

Arquitectónicamente es una CNN clásica (ResNet50) con una cabeza de clasificación personalizada, sin capacidades generativas ni de contexto textual: es un modelo puramente discriminativo de imagen. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (CNN, inicialización ImageNet, fine-tuning completo) con cabeza `Linear(2048→512) → BatchNorm → ReLU → Dropout(0.3) → Linear(512→1)` |
| Parametros totales | no disponible (ResNet50 estándar ronda 25,6 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantizacion | no disponible (pesos en fp32 PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state_dict, `fine_tuned_medical_resnet.pth`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional ResNet50 con inicialización en ImageNet y ajuste fino completo sobre PneumoniaMNIST redimensionado a 224×224. La entrada es una radiografía en escala de grises que se replica a tres canales y se normaliza con las medias y desviaciones típicas de ImageNet. La salida es un único logit de neumonía, lo que implica una formulación binaria con pérdida de entropía cruzada binaria (no declarada explícitamente en la model card, pero coherente con la cabeza de una sola unidad).

El entrenamiento se realizó sobre el split oficial de PneumoniaMNIST, con una partición de test de n = 624. El umbral de decisión (0,754) se seleccionó sobre el conjunto de validación. El autor documenta en el repositorio de GitHub el protocolo de evaluación, comprobaciones de cordura de Grad-CAM y un análisis de ablación, aunque estos detalles no se reproducen en la model card. No se especifican el número de épocas, la composición exacta del dataset, el optimizador ni si hubo aumento de datos.

## Capacidades

- Clasificación binaria de radiografías de tórax para detección de neumonía, con salida de un logit.
- Explicabilidad mediante Grad-CAM, con comprobaciones de cordura documentadas en el repositorio.
- Calibración probabilística reportada (ECE = 0,066), lo que permite interpretar la salida como probabilidad aproximada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación.

## Casos de uso

- Investigación en clasificación de radiografías de tórax: sirve como línea base reproducible sobre PneumoniaMNIST para comparar arquitecturas CNN en tareas de imagen médica, con métricas de referencia (AUROC 0,987) y protocolo documentado.
- Docencia y formación en IA médica: el modelo permite ilustrar el flujo completo de fine-tuning de una ResNet50, calibración de umbrales y visualización con Grad-CAM en un caso realista.
- Evaluación de técnicas de explicabilidad: al incluir comprobaciones de cordura de Grad-CAM, es útil para estudiar si los mapas de saliencia se alinean con anatomía relevante o con artefactos (el autor reporta un falso positivo impulsado por una esquina de la imagen).
- Prototipado de pipelines de triaje asistido: integrado en el Multimodal Medical Streaming Engine, puede emplearse como componente de visión en demostraciones de sistemas de streaming médico, siempre con revisión experta.
- Análisis de calibración y umbrales en producción simulada: el ECE reportado y el umbral seleccionado en validación permiten estudiar el compromiso sensibilidad/especificidad (99,0 % / 87,2 %) en escenarios de distinta prevalencia.
- Benchmarking de robustez y sesgo: útil para medir cómo se degrada el rendimiento al transferir de radiografías pediátricas de una única fuente a datos adultos o multi-sitio, dado que el autor advierte que esto no está probado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split oficial de test de PneumoniaMNIST (n = 624):

| Metrica | Valor |
|---|---|
| AUROC (IC bootstrap 95 %) | 0,987 (0,978–0,994) |
| Sensibilidad con umbral 0,754 | 99,0 % |
| Especificidad con umbral 0,754 | 87,2 % |
| Expected Calibration Error (ECE) | 0,066 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para una ResNet50 estándar (no declarada por el autor; estimación basada en la arquitectura).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090 o RTX 3060 son suficientes y sobredimensionadas para esta tarea.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict`), exportación a TorchScript u ONNX no documentada pero factible; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el propio autor cita su integración en el Multimodal Medical Streaming Engine, pero no se ofrecen comparaciones con otras arquitecturas (DenseNet121, EfficientNet, ViT) sobre PneumoniaMNIST.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pneumonia ResNet50 | no disponible | no aplica | AUROC 0,987 en PneumoniaMNIST | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prototipo de investigación: el autor declara explícitamente que no es un dispositivo médico y que las salidas requieren revisión experta.
- Origen de datos restringido: PneumoniaMNIST deriva de radiografías pediátricas de una única fuente; el rendimiento en adultos o datos multi-sitio no está probado.
- Errores de alta confianza: el autor advierte que los fallos suelen producirse con confianza elevada, lo que complica la detección automática de casos dudosos.
- Falsos positivos por artefactos: al menos un falso positivo está impulsado por una esquina de la imagen en lugar de anatomía, lo que indica sensibilidad a artefactos no clínicos.
- Calibración imperfecta: ECE de 0,066 implica desviaciones no triviales entre probabilidad predicha y frecuencia observada.
- Sin validación externa: no hay evidencia de generalización fuera del split oficial.
- Licencia MIT: permite uso comercial, pero la ausencia de validación clínica hace inadecuado cualquier despliegue médico real sin estudios adicionales y certificación regulatoria.
- Sin soporte documentado para cuantización ni exportación a formatos de despliegue ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Farhanitrate0/pneumonia-resnet50
- Repositorio del proyecto (Multimodal Medical Streaming Engine): https://github.com/farhanitrate0/multimodal-medical-streaming-engine
