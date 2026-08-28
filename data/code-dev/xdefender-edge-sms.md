# Code-Dev/xdefender-edge-sms

## Resumen

xdefender-edge-sms es un modelo de clasificación de texto desarrollado por Code-Dev, obtenido mediante fine-tuning de google/mobilebert-uncased sobre un conjunto de datos no especificado. Está diseñado para tareas de clasificación de mensajes SMS, probablemente orientado a la detección de spam o phishing, aunque la model card no especifica la tarea concreta. El nombre del modelo sugiere un enfoque en despliegue en el edge, con una arquitectura ligera (MobileBERT) que permite inferencia en dispositivos con recursos limitados.

El modelo cuenta con 24,58 millones de parámetros, un tamaño reducido que lo hace adecuado para entornos con restricciones de memoria y computación. Utiliza la arquitectura MobileBERT, una versión optimizada de BERT diseñada específicamente para dispositivos móviles y edge computing. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su potencial para clasificación de SMS en tiempo real en dispositivos de baja capacidad, aunque los resultados de entrenamiento publicados muestran métricas inconsistentes que sugieren un proceso de entrenamiento problemático o un conjunto de datos muy reducido. La model card indica que fue generada automáticamente por el Trainer de HuggingFace, con información incompleta sobre el dataset, los casos de uso previstos y las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileBERT (BERT optimizado para edge) |
| Parametros totales | 24.582.914 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estándar de MobileBERT, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (base: inglés, no confirmado para este fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MobileBERT, una arquitectura de transformer desarrollada por Google que reduce el coste computacional de BERT mediante un mecanismo de "equilibrio de profundidad" (depthwise balancing) y una matriz de atención más estrecha. MobileBERT utiliza un teacher BERT grande para destilar conocimiento y mantiene una precisión cercana al BERT original con una latencia significativamente menor, lo que lo hace idóneo para despliegue en dispositivos móviles y edge.

El fine-tuning se realizó sobre google/mobilebert-uncased con un conjunto de datos no especificado en la model card. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-05, batch de entrenamiento de 16, batch de evaluación de 32, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 13 pasos de warmup y 10 épocas. El entrenamiento se ejecutó con Transformers 5.16.1, PyTorch 2.11.0+cu128 y Datasets 5.0.1.

Los resultados del entrenamiento muestran valores de loss extremadamente altos en las primeras épocas (2.062.021,6 en la primera época) que disminuyen progresivamente hasta 0,7337 en la última época. Esta progresión anómala sugiere posibles problemas con el dataset, la normalización de etiquetas o la configuración del entrenamiento. La precisión fluctúa entre 0,3077 y 0,6154 sin una tendencia clara de mejora, lo que indica un posible sobreajuste o un conjunto de datos muy pequeño.

## Capacidades

- Clasificación de texto: el modelo está entrenado para tareas de clasificación de secuencias, probablemente binaria o multiclase, aunque el número de clases no se especifica.
- Procesamiento de SMS: por el nombre y el contexto, está orientado a la clasificación de mensajes SMS, posiblemente spam, phishing o categorización.
- Inferencia en edge: gracias a la arquitectura MobileBERT, puede ejecutarse en dispositivos con recursos limitados.
- Integración con Transformers: compatible con la librería transformers de HuggingFace para pipelines de text-classification.
- Sin soporte de tool calling, agentes o razonamiento multi-paso: al ser un modelo pequeño de clasificación, no dispone de estas capacidades.
- Sin soporte multimodal: solo texto.
- Capacidades multilingües: no confirmadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Filtrado de spam en pasarelas SMS: el modelo puede integrarse en sistemas de mensajería para clasificar mensajes entrantes y bloquear spam o phishing antes de que lleguen al usuario final, aprovechando su baja latencia para procesamiento en tiempo real.
- Clasificación de SMS en dispositivos móviles: al ser un modelo ligero de 24,5M parámetros, puede desplegarse directamente en aplicaciones Android o iOS para clasificar mensajes sin conexión, preservando la privacidad del usuario al no enviar datos a servidores.
- Triage de mensajes de atención al cliente: puede clasificar mensajes entrantes de soporte en categorías como "reembolso", "problema técnico" o "consulta general" para enrutarlos automáticamente al departamento adecuado, reduciendo el tiempo de respuesta.
- Detección de phishing en SMS bancarios: las entidades financieras pueden usar el modelo para identificar mensajes fraudulentos que suplantan su identidad, alertando a los clientes antes de que interactúen con enlaces maliciosos.
- Moderación de contenido en plataformas de mensajería: puede clasificar mensajes de usuarios para detectar contenido inapropiado o incumplimientos de las políticas de la plataforma, con un coste computacional mínimo.
- Clasificación de SMS en gateways de bajo coste: operadores de telecomunicaciones pueden desplegar el modelo en hardware modesto para clasificar el tráfico SMS en tiempo real, gracias a su tamaño reducido y compatibilidad con frameworks de inferencia optimizados.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos (el campo model-index está vacío). Los únicos datos disponibles son las métricas de evaluación durante el entrenamiento, que muestran resultados inconsistentes:

| Métrica | Valor final (época 10) |
|---|---|
| Validation Loss | 0,7337 |
| Accuracy | 0,4615 |
| Precision | 1,0 |
| Recall | 0,125 |
| F1 | 0,2222 |

Estos valores indican un rendimiento deficiente: la precisión perfecta con recall muy bajo sugiere que el modelo predice mayoritariamente la clase negativa, con muy pocos positivos correctamente identificados. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 100-200 MB en FP32 (24,5M parámetros × 4 bytes), reducible a 50-100 MB con cuantización INT8.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente; incluso CPU sola es viable para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, el modelo cabe en cualquier GPU consumer moderna, incluidas GTX 1050 Ti (4 GB) o superiores.
- Opciones de despliegue: compatible con la librería transformers, ONNX Runtime, TensorFlow Lite, llama.cpp (con conversión a GGUF) y plataformas como Ollama si se convierte el formato.
- Latencia estimada: en CPU moderna, latencia de 10-50 ms por muestra; en GPU, latencia inferior a 5 ms. Throughput estimado de 100-500 muestras por segundo en GPU, dependiendo del batch size.
- Para despliegue en edge: puede ejecutarse en Raspberry Pi 4 o dispositivos móviles con Android/iOS mediante TensorFlow Lite o ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (clasificación) | Licencia |
|---|---|---|---|---|
| xdefender-edge-sms | 24,58M | 512 | 0,4615 (eval, no fiable) | Apache-2.0 |
| google/mobilebert-uncased | 24,58M | 512 | ~0,85 (GLUE, base) | Apache-2.0 |
| distilbert-base-uncased | 66M | 512 | ~0,80 (GLUE) | Apache-2.0 |
| albert-base-v2 | 11,7M | 512 | ~0,80 (GLUE) | Apache-2.0 |

El modelo base MobileBERT alcanza una precisión de alrededor del 85% en el benchmark GLUE, mientras que este fine-tuning muestra una precisión significativamente menor (46% en el conjunto de evaluación), lo que sugiere que el proceso de fine-tuning no fue efectivo o el dataset era problemático. Modelos alternativos como DistilBERT o ALBERT ofrecen tamaños similares con mejor rendimiento documentado.

## Limitaciones y advertencias

- Rendimiento no fiable: las métricas de evaluación muestran resultados inconsistentes y una precisión final del 46%, lo que indica que el modelo no es apto para uso en producción sin un reentrenamiento completo.
- Dataset no documentado: la model card no especifica el conjunto de datos de entrenamiento, su tamaño, composición ni método de etiquetado, lo que impide evaluar posibles sesgos.
- Loss de entrenamiento anómalo: los valores de loss extremadamente altos en las primeras épocas sugieren problemas con la normalización de etiquetas o la configuración del modelo.
- Posible sobreajuste: la fluctuación de métricas entre épocas indica que el modelo memoriza el conjunto de entrenamiento en lugar de generalizar.
- Idioma limitado: el modelo base MobileBERT está entrenado principalmente en inglés; el rendimiento en otros idiomas no está documentado.
- Sin soporte de contexto largo: la ventana de 512 tokens es suficiente para SMS, pero inadecuada para documentos largos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la seguridad del modelo.
- Model card incompleta: no se documentan casos de uso previstos, limitaciones conocidas ni procedimientos de evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/Code-Dev/xdefender-edge-sms
- Modelo base: https://huggingface.co/google/mobilebert-uncased
- Documentación de MobileBERT: https://arxiv.org/abs/2004.02984
- Repositorio oficial de MobileBERT: https://github.com/google-research/google-research/tree/master/mobilebert
