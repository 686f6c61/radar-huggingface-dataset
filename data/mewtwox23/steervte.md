# MewtwoX23/SteerVTE

## Resumen

SteerVTE es un adaptador de edición de texto en vídeo desarrollado por Kai Zeng y colaboradores (MewtwoX23 en Hugging Face) que permite sustituir texto incrustado en fotogramas de vídeo —carteles, rótulos, texto superpuesto— preservando su apariencia original y manteniendo la coherencia temporal entre fotogramas. El modelo se construye como un adaptador sobre Wan2.1-VACE-14B, un modelo generativo de vídeo de 14 000 millones de parámetros de Wan-AI, y añade un módulo de contexto de texto que combina una máscara de la región a editar, características visuales de una referencia de estilo y características de glifo a nivel de línea y de carácter.

La relevancia del modelo radica en su enfoque específico: a diferencia de la edición de vídeo genérica, SteerVTE ataca el problema del reemplazo de texto en escena, donde la legibilidad de los caracteres generados y la consistencia entre fotogramas son críticos. El entrenamiento progresa de imágenes a vídeo sobre el dataset SteerVTE-1M y emplea una pérdida sensible al glifo que concentra el aprendizaje en la región enmascarada.

El repositorio contiene únicamente el checkpoint `SteerVTE.safetensors` (0,2 GB) junto con pesos OCR auxiliares; la inferencia requiere descargar además Wan2.1-VACE-14B y Qwen2.5-VL-3B-Instruct. La licencia es Apache 2.0 y el modelo está pensado exclusivamente para sustitución de texto de una sola línea en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de contexto de texto sobre Wan2.1-VACE-14B (difusión de vídeo) |
| Parametros totales | No disponible (el checkpoint del adaptador ocupa 0,2 GB; el modelo base Wan2.1-VACE-14B tiene 14 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el demo procesa 49 fotogramas por clip) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SteerVTE no es un transformer de lenguaje ni un modelo multimodal de propósito general, sino un adaptador añadido a Wan2.1-VACE-14B, un modelo de generación y edición de vídeo. El adaptador de contexto de texto integra tres señales: una máscara que delimita la región donde se encuentra el texto a editar, características visuales extraídas de una imagen de referencia de estilo y características de glifo calculadas a nivel de línea y de carácter. Estas señales condicionan al modelo base para que regenere la región enmascarada con el nuevo texto solicitado, conservando el estilo tipográfico y la apariencia del original.

El entrenamiento se realiza en dos fases, de imágenes a vídeo, sobre el dataset SteerVTE-1M. La pérdida de entrenamiento es sensible al glifo: penaliza los errores dentro de la región enmascarada y favorece la legibilidad de los caracteres generados. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La inferencia completa combina el adaptador con Wan2.1-VACE-14B y con Qwen2.5-VL-3B-Instruct, presumiblemente para tareas auxiliares de OCR y comprensión del texto presente en el vídeo.

## Capacidades

- Edición de texto en vídeo: sustitución de texto incrustado en fotogramas (carteles, rótulos, texto superpuesto) por un nuevo texto especificado por el usuario.
- Control de estilo: permite aportar una referencia visual para guiar la apariencia tipográfica del texto generado.
- Control de glifo: modela características a nivel de línea y de carácter para mejorar la legibilidad del texto sintetizado.
- Coherencia temporal: el adaptador está diseñado para mantener la edición consistente a lo largo de los fotogramas de un clip.
- Soporte de máscara de edición: el usuario indica la región del fotograma donde se encuentra el texto a reemplazar.
- Integración con OCR: el pipeline de inferencia utiliza Qwen2.5-VL-3B-Instruct como componente auxiliar.
- Alcance limitado a texto de una sola línea en inglés; no se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Localización de rótulos en vídeo: sustituir carteles o texto en escena de un clip en inglés por un texto alternativo manteniendo la tipografía y el estilo originales, útil para adaptar material audiovisual a otros mercados.
- Corrección de errores tipográficos en postproducción: reemplazar texto mal escrito o desactualizado incrustado en un vídeo sin necesidad de rehacer la escena desde cero.
- Prototipado creativo en publicidad: generar variantes de un anuncio con distintos mensajes sobre el mismo material de vídeo, usando la referencia de estilo para conservar la identidad visual de la marca.
- Actualización de contenido en vídeos formativos: modificar cifras, fechas o nombres en rótulos de material docente sin regrabar el vídeo completo.
- Investigación en edición de vídeo: servir como base reproducible para experimentar con edición de texto en escena, dado que el paper, el benchmark VTE-Bench y el código están publicados.
- Evaluación comparativa de métodos de edición de texto en vídeo: utilizar el modelo junto con VTE-Bench para medir calidad de sustitución, legibilidad y consistencia temporal frente a otras aproximaciones.
- Anonimización de texto en escena: reemplazar nombres o identificadores visibles en carteles de un vídeo por texto genérico antes de su publicación.

## Benchmarks y rendimiento

El autor remite al paper (arXiv:2606.23254) y al benchmark VTE-Bench para los resultados cuantitativos. En la información proporcionada no se incluyen las cifras concretas de evaluación.

| Benchmark | Resultado |
|---|---|
| VTE-Bench | No disponible en la información proporcionada (consultar el paper) |

## Requisitos de hardware

- El adaptador SteerVTE ocupa 0,2 GB, pero la inferencia requiere además Wan2.1-VACE-14B (14 000 millones de parámetros) y Qwen2.5-VL-3B-Instruct, por lo que el consumo real de VRAM viene dominado por el modelo base.
- VRAM estimada: no disponible de forma oficial; por el tamaño del modelo base, se requiere una GPU de gama alta con al menos 24-48 GB de VRAM en función de la precisión y de si se aplican optimizaciones.
- GPU recomendadas: A100 o H100 para ejecución cómoda; RTX 4090 (24 GB) como mínimo razonable si se aplican técnicas de ahorro de memoria.
- No cabe en GPUs de consumo de gama baja.
- Opciones de despliegue: el repositorio oficial proporciona un entorno CUDA propio con `infer_demo.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el demo procesa 49 fotogramas por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteerVTE | Adaptador de edición de texto en vídeo sobre Wan2.1-VACE-14B | No disponible (base de 14 000 M) | No disponible (49 fotogramas en demo) | Apache 2.0 | Hugging Face, GitHub |
| Wan2.1-VACE-14B | Modelo base de generación/edición de vídeo | 14 000 M | No disponible | No disponible en esta ficha | Hugging Face |
| Alternativas específicas de edición de texto en vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de edición de texto en vídeo en la documentación proporcionada.

## Limitaciones y advertencias

- Diseñado exclusivamente para sustitución de texto de una sola línea en inglés; no soporta otros idiomas ni texto multilínea.
- La edición de vídeos largos sigue siendo un reto; el demo se limita a 49 fotogramas por clip.
- El texto generado puede contener errores de caracteres, según advierte el propio autor.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo generativo de vídeo, existe riesgo de artefactos visuales en la región editada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.1-VACE-14B y Qwen2.5-VL-3B-Instruct tienen sus propias licencias que deben verificarse por separado antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- Requiere un pipeline de varios modelos (adaptador, modelo base y OCR), lo que complica el despliegue y aumenta los requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MewtwoX23/SteerVTE
- Paper en arXiv: https://arxiv.org/abs/2606.23254
- Página del proyecto: https://zengkaiya.github.io/SteerVTE/
- Repositorio GitHub: https://github.com/zengkaiya/SteerVTE
- Benchmark VTE-Bench: https://huggingface.co/datasets/MewtwoX23/VTE-Bench
- Modelo base Wan2.1-VACE-14B: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
- Modelo auxiliar Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia Apache 2.0: https://opensource.org/license/apache-2.0
