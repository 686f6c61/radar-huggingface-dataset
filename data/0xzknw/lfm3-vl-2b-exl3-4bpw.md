# 0xzknw/LFM3-VL-2B-EXL3-4bpw

## Resumen

LFM3-VL-2B-EXL3-4bpw es una cuantización de 4 bits por peso (4bpw) en formato EXL3 del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado originalmente por Liquid AI. El checkpoint lo ha generado y empaquetado el usuario 0xzknw mediante las herramientas de conversión de ExLlamaV3, y está pensado para su uso con el runtime MLXL3, que añade soporte para la arquitectura LFM3-VL y para el formato EXL3 MCG. El objetivo es reducir el peso del modelo base para facilitar su despliegue en entornos con memoria limitada, manteniendo la capacidad de procesar entradas imagen-texto.

El modelo base pertenece a la familia LFM3-VL de Liquid AI, una arquitectura orientada a tareas de image-text-to-text (VQA, descripción de imágenes, razonamiento multimodal). El repositorio declara 940.209.152 parámetros en el fichero de safetensors, si bien el nombre comercial del modelo base hace referencia a "2B"; esta discrepancia no se aclara en la información disponible. El tamaño total del repositorio es de 1,9 GB.

La relevancia de esta ficha es acotada: se trata de una cuantización comunitaria de un modelo de terceros, no de un modelo nuevo. El propio autor advierte de que es un checkpoint heredado (legacy) cuya cuantización de la torre de visión no fue calibrada, y desaconseja su uso en producción. Los datos de fidelidad publicados son comprobaciones numéricas estrechas, no puntuaciones de VQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 940.209.152 (según safetensors); el nombre del modelo base indica "2B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4 bits por peso (4bpw) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors con checkpoint EXL3 (no son pesos BF16 estándar) |

## Arquitectura y entrenamiento

El modelo base es LFM3-VL-2B de Liquid AI, un modelo multimodal de la familia LFM3 que acepta imágenes y texto y genera texto (pipeline image-text-to-text). La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de arquitectura más allá de la propia familia LFM3-VL.

Esta variante concreta no es un modelo entrenado, sino una cuantización post-entrenamiento del checkpoint base: los pesos se han convertido al formato EXL3 (ExLlamaV3) con una tasa de 4 bits por peso y un esquema MCG. Según la model card, la cuantización de la torre de visión no fue calibrada, lo que degrada la fidelidad de las representaciones visuales. Las comprobaciones publicadas sobre una imagen sintética retenida y 24 posiciones de texto arrojan un KL multimodal muestreado de 0,300521 y una L2 relativa de las características de visión de 0,342358. El autor califica explícitamente esta variante como no recomendada.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal, sujeto a la degradación de la torre de visión descrita.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Procesamiento conjunto de entradas de imagen y texto en un único pipeline.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Evaluación de cuantizaciones EXL3: el checkpoint sirve como referencia para medir el impacto de una cuantización 4bpw no calibrada en la torre de visión frente al modelo base en BF16, comparando KL y distancias de características.
- Pruebas de integración con MLXL3: permite validar el soporte de LFM3-VL y del formato EXL3 MCG en el runtime antes de adoptarlo en otros modelos.
- Prototipado de pipelines image-text-to-text en local: al ocupar 1,9 GB, se puede cargar en máquinas con poca VRAM para experimentar con la API de inferencia multimodal sin coste de servicio.
- Docencia y experimentación académica: útil para ilustrar el efecto de la cuantización en modelos multimodales pequeños en entornos con recursos limitados.
- Desarrollo de herramientas de conversión: sirve como caso de estudio para quienes construyan scripts de cuantización con ExLlamaV3 sobre arquitecturas multimodales.
- Pruebas de regresión de software de inferencia: al ser un checkpoint fijo y pequeño, facilita comprobar que una nueva versión del runtime produce salidas coherentes.

No se recomienda su uso en aplicaciones de producción orientadas a usuario final (accesibilidad visual, moderación de imágenes, atención al cliente multimodal) por la falta de calibración de la visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye dos métricas de fidelidad numérica sobre una imagen sintética y 24 posiciones de texto: KL multimodal muestreado de 0,300521 y L2 relativa de características de visión de 0,342358. El autor indica expresamente que no son puntuaciones de VQA.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB, por lo que la inferencia en 4bpw debería caber holgadamente en GPUs con 4-8 GB de VRAM, si bien no se publican cifras oficiales de consumo en ejecución.
- GPUs recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU consumer moderna con al menos 8 GB debería ser suficiente.
- GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: runtime MLXL3 (obligatorio, por el soporte de LFM3-VL y EXL3 MCG). No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que el checkpoint no está en GGUF ni en safetensors BF16 estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-EXL3-4bpw (esta ficha) | 940.209.152 según safetensors | no disponible | EXL3 safetensors | LFM Open License v1.0 | Hugging Face, runtime MLXL3 |
| LiquidAI/LFM3-VL-2B (base) | "2B" según nombre; no confirmado | no disponible | BF16 safetensors | LFM Open License v1.0 | Hugging Face |
| Otras cuantizaciones EXL3 de LFM3-VL | no disponible | no disponible | EXL3 | LFM Open License v1.0 | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint heredado (legacy): el autor indica que la cuantización de la torre de visión no fue calibrada y que esta variante no se recomienda.
- Fidelidad visual degradada: L2 relativa de características de visión de 0,342358 y KL multimodal de 0,300521 en una prueba muy limitada (una imagen sintética, 24 posiciones de texto).
- Sin benchmarks de VQA: no hay evidencia publicada del rendimiento real en tareas multimodales.
- Compatibilidad restringida: requiere un runtime con soporte de LFM3-VL y EXL3 MCG (MLXL3); no funciona con las herramientas habituales de inferencia.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Licencia: LFM Open License v1.0, con posibles restricciones para uso comercial; conviene revisar el fichero LICENSE y el NOTICE de modificación antes de desplegarlo.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta cuantización.
- Sesgos: no documentados en la información disponible.
- Discrepancia de parámetros: el nombre del modelo base sugiere 2B, pero el safetensors declara 940.209.152 parámetros; conviene verificar el modelo base antes de asumir un tamaño concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/LFM3-VL-2B-EXL3-4bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
