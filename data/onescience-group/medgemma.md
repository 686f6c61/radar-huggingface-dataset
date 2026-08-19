# OneScience-Group/Medgemma

## Resumen

MedGemma es un modelo de lenguaje multimodal de gran tamaño orientado al ámbito médico, desarrollado por OneScience-Group y basado en la arquitectura Gemma 3 de Google. Se presenta en dos variantes: MedGemma 4B, que acepta entradas conjuntas de texto e imágenes médicas (radiografías de tórax, dermatología, oftalmología e histopatología), y MedGemma 27B, exclusivamente de texto, centrado en comprensión de texto médico y respuesta a preguntas. El modelo está diseñado para tareas como respuesta a preguntas médicas (MedQA), análisis de imágenes clínicas, fine-tuning con LoRA e inferencia unificada mediante la herramienta `MedicalInferenceRunner`.

La relevancia actual de MedGemma radica en su enfoque específico para el dominio médico, combinando un modelo base de propósito general (Gemma 3) con un preentrenamiento adicional en datos clínicos desidentificados. Aunque los pesos y conjuntos de datos aún no están disponibles públicamente (se espera su publicación próxima en Hugging Face), la arquitectura y los casos de uso documentados lo posicionan como una alternativa de código abierto para el desarrollo de aplicaciones de IA sanitaria, con licencia Apache 2.0 que permite uso comercial. No obstante, el propio autor advierte que el modelo es un punto de partida para desarrollo downstream y que sus salidas no deben utilizarse directamente para diagnóstico clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 3 (transformer multimodal para 4B, solo texto para 27B) |
| Parametros totales | 4B (variante multimodal) y 27B (variante solo texto) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

MedGemma se basa en la arquitectura Gemma 3, desarrollada por Google. La variante de 4B incorpora un codificador de imágenes que permite procesar entradas multimodales (texto e imágenes médicas), mientras que la variante de 27B es exclusivamente textual. Según la model card, el modelo 4B ha sido preentrenado en múltiples tipos de datos médicos desidentificados, incluyendo radiografías de tórax (CXR), imágenes de dermatología, oftalmología y diapositivas de histopatología. El componente de lenguaje se ha entrenado con imágenes de radiología, patología, oftalmología, dermatología y texto médico.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni el uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá de la integración del codificador de imágenes para la variante multimodal. La model card indica que los pesos y los conjuntos de datos no están disponibles en el momento de la publicación, y que se subirán a Hugging Face próximamente.

## Capacidades

- Respuesta a preguntas médicas: evaluado en el benchmark MedQA, capacidad de responder a preguntas de conocimiento médico.
- Análisis de imágenes médicas: soporta localización anatómica en radiografías de tórax (CXR) y comparación longitudinal de imágenes de múltiples puntos temporales.
- Fine-tuning específico de dominio: permite ajuste eficiente de parámetros con LoRA, por ejemplo en el dataset NCT de histopatología de colon.
- Inferencia unificada: proporciona inferencia interactiva y por lotes a través de `MedicalInferenceRunner`.
- Multimodalidad (solo variante 4B): entrada conjunta de texto e imágenes médicas.
- Soporte de tool calling y agentes: no documentado explícitamente en la información disponible.
- Capacidades multilingües: no documentado; el idioma declarado es únicamente inglés.

## Casos de uso

- Respuesta a preguntas médicas en entornos educativos: el modelo puede utilizarse para generar respuestas a preguntas de exámenes médicos (tipo MedQA) y servir como herramienta de estudio para estudiantes de medicina, gracias a su entrenamiento en texto médico.
- Análisis de radiografías de tórax: la variante 4B puede recibir una imagen CXR y realizar tareas de localización anatómica, útil para la formación de radiólogos o como apoyo en la revisión de imágenes.
- Comparación longitudinal de imágenes: permite comparar dos radiografías de tórax tomadas en momentos distintos (antes/después) para detectar cambios anatómicos, lo que puede asistir en el seguimiento de pacientes.
- Fine-tuning con LoRA en patología: investigadores pueden ajustar el modelo sobre datasets específicos como NCT-CRC-HE-100K para clasificación de tejidos histopatológicos, adaptándolo a sus necesidades.
- Desarrollo de prototipos de IA sanitaria: al ser de código abierto con licencia Apache 2.0, sirve como base para construir aplicaciones de apoyo a la decisión clínica, siempre que se realice una validación exhaustiva.
- Investigación académica en IA médica: el modelo puede emplearse como referencia para estudiar el rendimiento de modelos multimodales en dominios clínicos, comparando con otras arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la evaluación en MedQA, pero no proporciona cifras concretas. Tampoco se ofrecen comparaciones con otros modelos médicos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM en la documentación proporcionada.
- Se recomienda ejecutar el modelo en GPU o DCU (unidad de cómputo de Hygon); el uso de CPU es posible pero lento.
- Para la variante de 4B, una GPU con 8-12 GB de VRAM podría ser suficiente en cuantizaciones de 4-8 bits, aunque esto es una estimación basada en el tamaño del modelo y no en datos oficiales.
- Para la variante de 27B, se necesitarían GPUs con mayor memoria (24 GB o más) o despliegue distribuido; no se dispone de datos confirmados.
- DCU requiere la instalación previa de DTK (versión 25.04.2 o posterior, o la recomendada por OneScience).
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; la documentación se centra en el entorno OneScience y en la herramienta `MedicalInferenceRunner`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos médicos como Med-PaLM 2 o LLaVA-Med. A continuación se presenta una tabla con características generales basadas en la información disponible, pero sin datos de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| MedGemma 4B | 4B | no disponible | Apache 2.0 | Sí (texto + imagen) | Pesos no disponibles aún |
| MedGemma 27B | 27B | no disponible | Apache 2.0 | No (solo texto) | Pesos no disponibles aún |
| Gemma 3 (base) | 4B/27B | 128K (según Google) | Gemma Terms of Use | Sí (4B) | Disponible en Hugging Face |

Nota: los datos de Gemma 3 provienen de información pública de Google, no de la model card de MedGemma. La comparación se limita a características estructurales; no hay benchmarks comparables.

## Limitaciones y advertencias

- El modelo es un modelo fundacional para desarrollo de aplicaciones de salud; sus salidas no deben utilizarse directamente para diagnóstico clínico, gestión de pacientes, recomendaciones de tratamiento ni ninguna práctica clínica directa.
- Todas las salidas deben considerarse preliminares y requieren verificación independiente, correlación clínica e investigación adicional.
- Los pesos y datasets no están disponibles actualmente; la model card indica que se subirán próximamente, pero no hay fecha concreta.
- Solo se declara soporte para el idioma inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas médicas es desconocido hasta que se liberen los pesos y se realicen evaluaciones independientes.
- La documentación menciona la necesidad de validar, adaptar y modificar significativamente el modelo para cada caso de uso específico.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de lenguaje, existe el riesgo inherente de generar información plausible pero incorrecta, especialmente en dominios de alto riesgo como la medicina.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/Medgemma
- Entorno OneCode (programación AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Documentación de Gemma 3 (Google): https://ai.google.dev/gemma/docs/core
