# shuvomonowar00/AUGR-VQA

## Resumen

AUGR-VQA es un modelo de visual question answering (VQA) especializado en el dominio médico, concretamente en la respuesta a preguntas sobre imágenes de resonancia magnética (MRI) de tumores cerebrales. Ha sido desarrollado por shuvomonowar00 como parte de una investigación académica, y su nombre formal es QAdp-DG-PRUGTM, aunque en el código se le conoce como QAdpPRUGTMHybrid. El modelo se entrenó sobre el dataset BTUMQA-225K, que contiene anotaciones de preguntas y respuestas sobre imágenes de MRI, y utiliza imágenes del conjunto BraTS 2021 2D. Su propósito principal es servir como herramienta de investigación y reproducibilidad para el avance de la IA médica, proporcionando un punto de partida para el desarrollo de sistemas de apoyo al diagnóstico basados en imágenes.

El modelo está implementado en PyTorch y se distribuye como un conjunto de pesos preentrenados, organizados en cuatro semillas aleatorias para garantizar la robustez de los resultados. Aunque no se especifican detalles de arquitectura, se trata de un modelo híbrido que combina procesamiento de imagen y texto para generar respuestas a preguntas sobre hallazgos radiológicos. Su relevancia radica en la creciente necesidad de herramientas de VQA en el ámbito sanitario, donde la interpretación automática de imágenes médicas puede asistir a los profesionales. Sin embargo, al ser un modelo de investigación, aún no está validado para uso clínico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida personalizada (QAdpPRUGTMHybrid) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la información proporcionada, pero se describe como un modelo híbrido personalizado denominado QAdpPRUGTMHybrid (también referido como adaptive_prugtm_qgca). Se trata de un sistema de VQA que integra un codificador visual para procesar imágenes de MRI y un módulo de lenguaje para interpretar las preguntas y generar respuestas. El entrenamiento se realizó sobre el dataset BTUMQA-225K, que contiene 225.000 pares de preguntas y respuestas sobre imágenes de tumores cerebrales, utilizando las imágenes 2D de BraTS 2021. El modelo se entrenó de forma independiente con cuatro semillas aleatorias (42, 1337, 2025 y 3407) para evaluar la estabilidad de los resultados. No se menciona el uso de técnicas como RLHF o DPO, ni se especifica el número de tokens de entrenamiento.

## Capacidades

- Respuesta a preguntas visuales sobre imágenes de resonancia magnética de tumores cerebrales.
- Generación de respuestas en inglés a partir de una imagen y una pregunta en lenguaje natural.
- Capacidad de procesar imágenes médicas 2D (cortes de MRI) y asociarlas con anotaciones textuales.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades avanzadas.
- El modelo está especializado en el dominio de tumores cerebrales y no se ha probado en otros tipos de imágenes médicas.

## Casos de uso

- Asistencia a radiólogos en la interpretación de resonancias magnéticas: el modelo puede responder preguntas específicas sobre la presencia, localización o características de tumores, sirviendo como segunda opinión o apoyo en la revisión de imágenes.
- Educación médica: estudiantes de medicina y residentes pueden utilizar el modelo para practicar la interpretación de MRI y verificar sus conocimientos mediante preguntas y respuestas automáticas.
- Investigación en IA médica: el modelo sirve como punto de partida para experimentos sobre VQA en dominios especializados, permitiendo comparar arquitecturas y métodos de entrenamiento.
- Automatización de informes preliminares: en entornos de investigación, el modelo puede generar descripciones textuales de hallazgos en MRI que luego un profesional revisa y valida.
- Evaluación de modelos de VQA: al estar disponible con pesos y código, puede utilizarse como referencia para medir el rendimiento de otros modelos en el dataset BTUMQA-225K.
- Desarrollo de sistemas de triaje: aunque no está validado clínicamente, podría integrarse en prototipos de sistemas que prioricen casos sospechosos de tumor cerebral basándose en las respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se reportan métricas de Accuracy y F1 en el paper asociado, pero no se proporcionan valores concretos en el repositorio de HuggingFace.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. El tamaño del repositorio es de 0.4 GB, lo que sugiere que los pesos del modelo son relativamente ligeros, pero al desconocer la arquitectura y el número de parámetros, no es posible estimar la VRAM necesaria. Se recomienda consultar el código fuente en GitHub para obtener detalles sobre el consumo de memoria y las GPU recomendadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se mencionan alternativas ni se ofrecen datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- El modelo es un prototipo de investigación y no ha sido validado para uso clínico real. No debe utilizarse como herramienta de diagnóstico sin supervisión médica.
- Está entrenado exclusivamente con imágenes de BraTS 2021 2D y el dataset BTUMQA-225K, por lo que su capacidad de generalización a otros tipos de imágenes o dominios médicos es limitada.
- Solo soporta el idioma inglés, lo que restringe su uso en entornos hispanohablantes.
- La licencia no está especificada, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones legales no definidas.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real y su fiabilidad en escenarios prácticos.
- Existe riesgo de alucinaciones o respuestas incorrectas, especialmente en un dominio tan sensible como el médico, donde un error podría tener consecuencias graves.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/shuvomonowar00/AUGR-VQA
- Código fuente en GitHub: https://github.com/shuvomonowar00/AUGR-VQA
- Dataset de texto BTUMQA: https://huggingface.co/datasets/shuvomonowar00/BTUMQA
- Dataset de imágenes BraTS 2021 2D (Kaggle): https://www.kaggle.com/datasets/snish9/rsnabrats20212d
