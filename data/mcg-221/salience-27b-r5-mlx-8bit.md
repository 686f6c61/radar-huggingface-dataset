# McG-221/Salience-27B-R5-mlx-8Bit

## Resumen

El modelo McG-221/Salience-27B-R5-mlx-8Bit es una conversión a formato MLX con cuantización de 8 bits del modelo vectionlabs/Salience-27B-R5, desarrollado por McG-221. El modelo base es un sistema multimodal de razonamiento eficiente, orientado a tareas de visión y lenguaje, generación de código, uso de herramientas y ejecución de agentes en terminal. Según las etiquetas del repositorio, está construido sobre la arquitectura Qwen3.5 (también referida como Qwen3.8) e incorpora un modo de pensamiento optimizado para reducir el coste computacional durante el razonamiento.

La conversión a MLX permite ejecutar el modelo en dispositivos Apple Silicon mediante la librería mlx-lm, manteniendo la compatibilidad con el ecosistema Transformers. El repositorio pesa 28,6 GB, lo que sugiere que el modelo original tiene un tamaño considerable, aunque el conteo de parámetros de los safetensors indica 7.566.401.024 parámetros (7,57 mil millones), una discrepancia que no se explica en la documentación disponible. La licencia es Apache 2.0, lo que facilita su uso comercial y modificaciones.

Este modelo resulta relevante para desarrolladores que buscan desplegar un asistente multimodal con capacidades de razonamiento, código y agente en hardware de Apple, aprovechando la cuantización de 8 bits para reducir el consumo de memoria sin renunciar a un contexto largo y a la integración con herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5, según etiquetas; detalles no disponibles) |
| Parametros totales | 7.566.401.024 (7,57 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiqueta "long-context" presente) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base vectionlabs/Salience-27B-R5. Las etiquetas del repositorio indican que se trata de un modelo multimodal (image-text-to-text) basado en la familia Qwen3.5, con capacidades de razonamiento eficiente, modo de pensamiento (thinking) y soporte para herramientas. La conversión a MLX se realizó con la versión 0.31.2 de mlx-lm, lo que implica que los pesos se adaptaron al formato optimizado para Apple Silicon, pero no se aportan datos sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación empleadas (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, lo que permite responder a preguntas sobre imágenes, describir contenido visual y combinar información de ambos dominios.
- Razonamiento eficiente: incluye un modo de pensamiento (thinking) optimizado para reducir el coste computacional durante tareas de razonamiento complejo.
- Generación de código y soporte de ingeniería de software: etiquetado para tareas de programación, incluyendo resolución de problemas de software (SWE).
- Uso de herramientas (tool calling): puede invocar funciones externas, lo que facilita la integración en flujos de trabajo automatizados.
- Capacidades de agente y terminal: diseñado para operar como agente autónomo, ejecutando comandos y gestionando tareas en entornos de terminal.
- Contexto largo: la etiqueta "long-context" sugiere que maneja ventanas de contexto extensas, aunque no se especifica el número exacto de tokens.
- Multilingüe: aunque la etiqueta de idioma solo indica inglés, al estar basado en Qwen3.5 podría soportar otros idiomas, pero no hay confirmación.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar, revisar y depurar código, integrándose en editores o pipelines de CI/CD mediante su capacidad de tool calling y su conocimiento de ingeniería de software.
- Agente autónomo para automatización de tareas en terminal: gracias a su soporte de agente y terminal, puede ejecutar comandos, gestionar archivos y realizar operaciones de sistema de forma autónoma, útil para scripts de administración.
- Análisis de imágenes y documentos visuales: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o fotografías, y responder preguntas sobre su contenido, por ejemplo en soporte técnico o revisión de diseños.
- Chatbot de atención al cliente con contexto largo: su ventana de contexto amplia permite mantener conversaciones multi-turno con historial extenso, adecuado para sistemas de soporte que requieren recordar interacciones previas.
- Generación de documentación técnica: puede resumir código, explicar funcionalidades y redactar documentación a partir de repositorios, aprovechando su capacidad de razonamiento y comprensión de código.
- Prototipado rápido de aplicaciones con visión: desarrolladores pueden usarlo para crear demos que combinen entrada de imágenes y texto, como asistentes de accesibilidad o herramientas de búsqueda visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card muestra una lista vacía de resultados, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- Al ser una conversión MLX, está diseñado para ejecutarse en Apple Silicon (M1, M2, M3 o superiores).
- El tamaño del repositorio es de 28,6 GB, lo que sugiere que el modelo en 8-bit requiere al menos 32 GB de memoria unificada para cargarse cómodamente, aunque el número real de parámetros (7,57 mil millones) implicaría un uso menor si la discrepancia se debe a un error de etiquetado.
- Se recomienda un Mac con 32 GB de RAM unificada o superior para evitar intercambio de memoria y mantener una latencia aceptable.
- Para la inferencia se utiliza la librería mlx-lm, que ofrece generación optimizada en Apple Silicon. También es compatible con el ecosistema Transformers, aunque el formato MLX es el principal.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base vectionlabs/Salience-27B-R5 no tiene una ficha pública detallada en la información proporcionada, y no se conocen alternativas directas con el mismo perfil (multimodal, razonamiento eficiente, MLX 8-bit). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La documentación es escasa: no hay información sobre el entrenamiento, la arquitectura exacta ni los benchmarks, lo que dificulta evaluar su fiabilidad y rendimiento real.
- La discrepancia entre el nombre del modelo (27B) y el número de parámetros de los safetensors (7,57 mil millones) genera incertidumbre sobre el tamaño real y la configuración (posible MoE con parámetros activos, pero no confirmado).
- El idioma declarado es solo inglés; no se garantiza un rendimiento óptimo en otros idiomas.
- Al ser una conversión MLX, su uso está limitado a hardware Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin una conversión adicional.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de sus capacidades frente a otros modelos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base podría tener restricciones adicionales no documentadas en esta conversión.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McG-221/Salience-27B-R5-mlx-8Bit
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R5
