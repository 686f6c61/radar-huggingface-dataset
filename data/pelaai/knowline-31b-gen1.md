# PelaAI/KnowLine-31B-Gen1

## Resumen

KnowLine-31B-Gen1 es un modelo de decisión de la familia KnowLine desarrollado por PelaAI, construido sobre el modelo denso google/gemma-4-31B-it (Apache-2.0) mediante un ajuste fino con LoRA SFT. A diferencia de un modelo generativo convencional, su función es recibir un estado (texto o una conversación) junto con hasta 64 preguntas tipadas —sí/no, elección entre k opciones o puntuación sobre una rúbrica— y devolver, para cada pregunta, una distribución de probabilidad sobre sus opciones en un único forward pass, sin generar texto. Se enmarca en lo que PelaAI denomina "System One decision model", orientado a decisiones rápidas y calibradas.

El modelo cuenta con 31.273.088.876 parámetros totales, pesos en bf16 (unos 63 GB), y se sirve con SGLang en bf16 junto a un front end (`knowline_server.py`) que lee dos veces las peticiones cortas. Soporta inglés, chino simplificado y chino tradicional. Su licencia es Apache-2.0 y se distribuye en formato safetensors compatible con transformers.

Su relevancia radica en el enfoque: en lugar de generar respuestas abiertas, produce probabilidades calibradas (ECE en torno a 0,012-0,021 y Brier de 0,23-0,26 según el autor) para tareas de clasificación y decisión estructurada, lo que lo hace adecuado para pipelines de moderación, enrutado o evaluación automática donde se necesita una señal probabilística fiable y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-31B-it), ajuste LoRA SFT fusionado |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor indica que no probó FP8 al cargar; se sirve en bf16) |
| Idiomas soportados | Ingles, chino simplificado y chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16, ~63 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de aproximadamente 31B parámetros, y conserva su torre de visión sin modificaciones, aunque el entrenamiento fue exclusivamente sobre texto. El ajuste consistió en un LoRA SFT de rango 32 y alpha 64, aplicado únicamente al modelo de lenguaje, durante una época, con los pesos fusionados posteriormente en bf16. Los ejemplos de entrenamiento incluyen tareas de decisión escritas y etiquetadas por profesores LLM, renderizadas con la plantilla de chat de Gemma.

Una innovación destacable es la incorporación de una temperatura de lectura T = 1,44, ajustada sobre datos de validación con el mismo esquema de servicio, plegada en el peso de la norma final y en el soft-cap de logits final. Esto calibra la magnitud de las probabilidades sin alterar el orden de las opciones. Además, el front end (`knowline_server.py`) lee dos veces las peticiones cortas por defecto, un mecanismo de doble lectura que el autor también emplea en otros modelos de la familia. El conjunto de datos de entrenamiento no se incluye en el repositorio.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo sí/no, elección entre k opciones y puntuación sobre rúbrica, devolviendo distribuciones de probabilidad por opción.
- Inferencia sin generación de texto: un forward pass por pregunta, con salida basada en el token de etiqueta de cada opción.
- Probabilidades calibradas: temperatura ajustada e incorporada en los pesos para mejorar la calibración.
- Procesamiento de imágenes en zero-shot: conserva la torre de visión del modelo base y puntúa 69,3 en la suite pública de visión oficial (autoevaluación), pese a no haber sido entrenado con imágenes.
- Multilingüe: inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: los clientes de Jev solo necesitan cambiar la URL base; los usuarios de otros modelos KnowLine solo cambian el nombre del modelo.
- Soporte de hasta 64 preguntas tipadas por petición.
- Capacidad de conversación multi-turno como estado de entrada (texto o chat).

## Casos de uso

- Moderación de contenido y clasificación de toxicidad: el modelo puede evaluar un texto o conversación frente a múltiples preguntas tipadas (por ejemplo, "¿es ofensivo?", "¿qué categoría?") y devolver probabilidades calibradas que permiten fijar umbrales operativos con ECE bajo.
- Enrutado de tickets de soporte: dado el mensaje de un cliente, clasificar intención, tono y necesidad de reembolso en una sola llamada con varias preguntas, aprovechando la interfaz de hasta 64 preguntas y la baja latencia de un forward pass.
- Evaluación automática de respuestas de LLM: usar rúbricas de puntuación para comparar salidas de modelos generativos, obteniendo distribuciones de probabilidad en lugar de juicios categóricos.
- Control de calidad en pipelines de datos: clasificar pares pregunta-respuesta o muestras de entrenamiento según criterios definidos, con señal probabilística para filtrar por confianza.
- Análisis de conversaciones de atención al cliente: detectar satisfacción, urgencia o riesgo de escalado a partir del historial de chat, con salida calibrada para priorización.
- Verificación de contenido multimodal en zero-shot: aunque entrenado solo con texto, puede aplicarse a tareas de clasificación sobre imágenes conservando la torre de visión del modelo base, con resultados preliminares reportados por el autor.
- Sistemas de decisión "System One" de baja latencia: integración en agentes o pipelines que requieren decisiones rápidas y estructuradas sin coste de generación autoregresiva.

## Benchmarks y rendimiento

| Modelo | Tamano | DI 0.3 publico | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| KnowLine-31B-Gen1 | 31B | 70,13 | No puntuado aun | Autoejecucion, kit oficial |
| KnowLine-35B-A3B-Gen1.5 | 35B-A3B | 70,72 | 65,77 | Board |
| KnowLine-26B-A4B-Gen2.5 | 26B-A4B | 68,21 | 64,57 | Board |
| Fastino GLiDE V1.2 | No disponible | 71,99 | 71,52 | Board |
| Jeffan-31b-1710 | 31B | 73,13 | 69,75 | Board |
| mammoth-1 | 27B | 75,34 | 68,44 | Board |

Otros resultados reportados por el autor: C-Eval 82,5 (frente a 77,9 de KnowLine-26B-A4B-Gen2.5); JevBench 90,5 y JevBench-hard 80,2 (frente a 90,5 y 81,1 del 26B-A4B-Gen2.5). Calibración: ECE aproximado de 0,012-0,021 y Brier de 0,23-0,26. Visión zero-shot: 69,3 en la suite pública oficial de visión (autoevaluación). El modelo aún no tiene entrada en el board de Decision Index 0.4.1.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 63 GB; SGLang reserva por defecto el 85% de la memoria de la GPU.
- GPU recomendadas: el autor ejecutó todas las evaluaciones con un servidor sobre una GPU H20 de 96 GB. No se han publicado pruebas en otras GPU.
- Cabe en GPU de consumo: no disponible; con 63 GB en bf16 no cabe en GPU de consumo convencionales, y el autor no reporta cuantizaciones probadas.
- Opciones de despliegue: SGLang 0.5.21 en bf16 (probado), con front end `knowline_server.py` y `knowline_layout.py` que dependen solo de transformers y requests. No se reporta soporte probado de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el autor destaca un forward pass por pregunta y la doble lectura de peticiones cortas como mecanismo de servicio, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DI 0.3 publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1 | 31B denso | No disponible | 70,13 | Apache-2.0 | Hugging Face |
| KnowLine-35B-A3B-Gen1.5 | 35B-A3B (MoE) | No disponible | 70,72 | No disponible | Hugging Face |
| KnowLine-26B-A4B-Gen2.5 | 26B-A4B (MoE) | No disponible | 68,21 | No disponible | Hugging Face |
| Jeffan-31b-1710 | 31B | No disponible | 73,13 | No disponible | Board |
| mammoth-1 | 27B | No disponible | 75,34 | No disponible | Board |

El modelo se sitúa por debajo de KnowLine-35B-A3B-Gen1.5 en la suite pública de Decision Index 0.3 (70,13 frente a 70,72) y por encima de KnowLine-26B-A4B-Gen2.5 (68,21), pero por debajo de alternativas como Jeffan-31b-1710 y mammoth-1 en esa misma suite. Aún no cuenta con puntuación en la suite completa 0.4.1.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre opciones predefinidas; su uso fuera de ese esquema requiere adaptación.
- Idiomas limitados a inglés, chino simplificado y chino tradicional; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no disponible en la información proporcionada.
- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 4 y de datos etiquetados por profesores LLM, puede heredar sesgos de ambas fuentes.
- Riesgo de alucinación: menor en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; la calibración reportada es sobre la suite pública del autor.
- La temperatura de lectura está plegada en los pesos; modificar el servicio o el front end puede alterar la calibración.
- El autor indica que no probó FP8 al cargar el modelo; el despliegue en cuantización no está validado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base google/gemma-4-31B-it tiene sus propios términos que deben respetarse.
- El modelo no está afiliado ni respaldado por TypeSafe, Jev ni Google, y no deriva de TypeSafe ni Jev.
- Los datos de entrenamiento no están publicados, lo que dificulta la reproducibilidad y la auditoría.
- No tiene entrada en el board de Decision Index 0.4.1; las puntuaciones reportadas son autoevaluaciones con el kit oficial.

## Enlaces

- Hugging Face: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Modelo hermano KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
