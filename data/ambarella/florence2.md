# Ambarella/Florence2

## Resumen

Florence-2 es un modelo fundacional de visión unificado desarrollado originalmente por Microsoft Research, que emplea aprendizaje basado en prompts para resolver una amplia variedad de tareas de visión y visión-lenguaje con una única arquitectura y un único marco de entrenamiento. El repositorio `Ambarella/Florence2` redistribuye la variante Florence-2-base en formatos optimizados (pesos de 8 bits) para los aceleradores de visión de Ambarella (N1-655, X7, CV7, CV72 y CV75), lo que permite desplegar el modelo en hardware de borde (edge) con SDK Cooper 2.5.4 y Cooper Foundry 2.3.

La variante base, con aproximadamente 0,23 mil millones de parámetros, busca un equilibrio entre precisión y eficiencia computacional, y soporta tareas como generación de pies de foto, respuesta a preguntas visuales, detección de objetos, grounding y comprensión visual general mediante instrucciones en lenguaje natural. El modelo procesa imágenes a resolución 3x768x768 (3x384x384 en la plataforma CV75) y se distribuye como pesos PyTorch junto con artefactos comprimidos específicos por dispositivo.

Este repositorio es relevante para desarrolladores que necesitan ejecutar Florence-2 en cámaras inteligentes y sistemas embebidos con aceleración NPU, ya que ofrece pesos cuantizados a 8 bits listos para los chips de Ambarella, algo que el repositorio original de Microsoft no proporciona. La licencia no se especifica en la información disponible, por lo que debe verificarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje unificado con aprendizaje basado en prompts (Florence-2) |
| Parametros totales | 0,23B (variante base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de 8 bits (artefactos por dispositivo); pesos originales en PyTorch |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch; archivos `.tar.gz` con pesos de 8 bits por dispositivo (n1-655, x7, cv7, cv72, cv75) |

## Arquitectura y entrenamiento

Florence-2 es un modelo fundacional de visión que unifica tareas de visión y visión-lenguaje en una sola arquitectura entrenada con un objetivo de modelado de secuencia a secuencia basado en prompts. El modelo recibe una imagen junto con un prompt textual (por ejemplo, `<CAPTION>`, `<OD>`, `<VQA>`) y genera la salida correspondiente como texto estructurado, lo que permite reutilizar los mismos pesos para múltiples tareas sin cabezas específicas por tarea. La variante redistribuida por Ambarella corresponde a Florence-2-base, con resolución de entrada 3x768x768 (3x384x384 en CV75).

La model card de este repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La información técnica de entrenamiento debe consultarse en el paper original (arXiv:2311.06242) y en el repositorio de Microsoft. La contribución específica de Ambarella es la compresión a pesos de 8 bits y el empaquetado para sus aceleradores, no un reentrenamiento del modelo.

## Capacidades

- Generación de pies de foto de imágenes (image captioning) mediante prompts.
- Respuesta a preguntas visuales (VQA) en lenguaje natural.
- Detección de objetos (object detection) con salida estructurada.
- Grounding visual: localización de objetos descritos textualmente.
- Comprensión visual general mediante instrucciones en lenguaje natural.
- Ejecución en hardware de borde Ambarella (N1-655, X7, CV7, CV72, CV75) con pesos de 8 bits.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Cámaras de seguridad inteligentes: el modelo puede generar descripciones automáticas de eventos y detectar objetos en flujo de vídeo, ejecutándose en los chips CV7/CV72/CV75 de Ambarella con pesos de 8 bits y sin necesidad de enviar imágenes a la nube.
- Análisis de vídeo en el borde para ciudades inteligentes: detección y grounding de vehículos o peatones directamente en la cámara, reduciendo latencia y ancho de banda frente a soluciones basadas en servidores.
- Asistentes de accesibilidad: descripción de escenas en tiempo real para personas con discapacidad visual, aprovechando la generación de pies de foto y VQA sobre hardware de bajo consumo.
- Automatización industrial con visión: inspección de piezas y verificación de presencia de componentes mediante detección de objetos y grounding, desplegado en dispositivos N1-655 o X7.
- Etiquetado y anotación semiautomática de datasets: uso del modelo para preanotar imágenes con pies de foto y cajas delimitadoras antes de la revisión humana, acelerando la curación de datos.
- Robots y drones con recursos limitados: comprensión visual a bordo para navegación asistida o identificación de obstáculos, gracias a la variante base de 0,23B y a los formatos comprimidos para NPU.
- Búsqueda visual en catálogos: indexación de productos mediante descripciones generadas y grounding de atributos, ejecutable en dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,23B parámetros, los pesos en FP32 ocupan aproximadamente 0,9 GB y en 8 bits alrededor de 0,23 GB, sin contar activaciones.
- GPU recomendadas: no especificadas en la información disponible; el repositorio está orientado a aceleradores Ambarella (N1-655, X7, CV7, CV72, CV75) más que a GPU de escritorio.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, cabría en GPU de consumo con suficiente memoria, pero no se documenta soporte.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 de Ambarella; implementación de referencia en el repositorio de Microsoft Florence-2. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ambarella/Florence2 (esta ficha) | 0,23B | no disponible | Visión y visión-lenguaje multi-tarea | no disponible | Hugging Face, pesos 8 bits por dispositivo |
| microsoft/Florence-2-base | 0,23B | no disponible | Visión y visión-lenguaje multi-tarea | no disponible en esta información | Hugging Face, pesos PyTorch originales |
| Florence-2-large (Microsoft) | no disponible en esta información | no disponible | Visión y visión-lenguaje multi-tarea | no disponible en esta información | Hugging Face |

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; es imprescindible verificarla antes de cualquier uso comercial, ya que el modelo original de Microsoft tiene condiciones propias.
- El repositorio redistribuye pesos de un modelo de Microsoft; conviene confirmar que la redistribución y la compresión a 8 bits cumplen los términos originales.
- Riesgo de alucinación inherente a los modelos generativos de visión-lenguaje: las descripciones y respuestas pueden contener detalles no presentes en la imagen.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del modelo original deben consultarse en su model card y paper.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento fuera del inglés no está garantizado.
- Los artefactos están atados a dispositivos Ambarella concretos; no son portables a otras plataformas sin conversión.
- El modelo base de 0,23B ofrece menor precisión que variantes mayores; para tareas exigentes puede ser insuficiente.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones por parte de Ambarella en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/Florence2
- Paper original: https://arxiv.org/abs/2311.06242
- Implementación de referencia: https://github.com/microsoft/Florence-2
- Pesos originales: https://huggingface.co/microsoft/Florence-2-base
- Pesos 8 bits N1-655: https://huggingface.co/Ambarella/Florence2/blob/main/n1-655_florence2_0.23B.tar.gz
- Pesos 8 bits X7: https://huggingface.co/Ambarella/Florence2/blob/main/x7_florence2_0.23B.tar.gz
- Pesos 8 bits CV7: https://huggingface.co/Ambarella/Florence2/blob/main/cv7_florence2_0.23B.tar.gz
- Pesos 8 bits CV72: https://huggingface.co/Ambarella/Florence2/blob/main/cv72_florence2_0.23B.tar.gz
- Pesos 8 bits CV75: https://huggingface.co/Ambarella/Florence2/blob/main/cv75_florence2_0.23B.tar.gz
