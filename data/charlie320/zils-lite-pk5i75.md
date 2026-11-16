# Charlie320/zils-lite-pk5i75

## Resumen

zils-lite-pk5i75 es un modelo de decisión de aproximadamente 853 millones de parámetros, desarrollado por el usuario Charlie320 y publicado bajo licencia Apache-2.0. Se trata de un fine-tune derivado de Qwen/Qwen3.5-0.8B que forma parte del ecosistema de "soup pool" del proyecto Zils, asociado a la subred 127 de Bittensor. El modelo se distribuye en formato safetensors con pesos en BF16 y un repositorio de 1,7 GB.

El modelo está diseñado específicamente para tareas de decisión en formato de examen, es decir, responder a ítems estructurados de familias de tareas conocidas, incluyendo elementos de llamada a herramientas (tool-call). Su entrenamiento combina datos etiquetados generados mediante una receta pública de autoría y destilación de conocimiento desde un "soup" de mayor tamaño (d3-mini), lo que lo convierte en un ejemplo de destilación de modelos dentro de un pipeline de competición descentralizada.

Su relevancia radica en su carácter experimental y su integración en un ecosistema de modelos tipo "soup" (promediado de pesos) orientado a la evaluación automatizada. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, sin pipeline declarado y con información muy limitada sobre idiomas y benchmarks, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B), con torre de visión heredada del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y se construye mediante un procedimiento de "soup fine-tune". El punto de partida es la media uniforme de pesos de dos cuerpos del soup d3-lite del 16 de noviembre de 2026: DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2, ambos Apache-2.0. Sobre esa media se realizaron cinco fine-tunes LoRA de rango 32 (fusionados) con semillas distintas, una época cada uno a tasa de aprendizaje 5e-5, y se promediaron uniformemente. Los pesos publicados son la interpolación con peso 0,75 sobre esa media de cinco semillas y 0,25 sobre la media inicial del soup.

El entrenamiento utiliza objetivos suaves: para los ítems escritos, una cuarta parte de la respuesta propia del ítem y tres cuartas partes de las probabilidades de respuesta del soup actual de d3-mini (destilación de profesor desde la media uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b); para las filas sin etiquetar, únicamente las probabilidades del soup d3-mini. Los datos de entrenamiento comprenden unas 46.100 filas con una pasada barajada por semilla: aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, escritos con la receta pública de autoría (scripts/author_exam.py) por Claude Opus y un modelo abierto local, a partir de particiones de entrenamiento de los datasets fuente públicos, incluyendo unos 1.100 ítems de tool-call extraídos de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2; y 15.000 filas de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions usadas solo como entradas de destilación sin etiquetar, excluyendo fuentes con metadatos de licencia comercial o no especificada y fuentes no comerciales. No se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y respuesta a ítems de decisión en formato de examen de familias de tareas conocidas.
- Soporte de tool calling / function calling, con aproximadamente 1.100 ítems de entrenamiento específicos de llamada a funciones.
- Razonamiento multi-paso orientado a decisiones estructuradas (formato de examen).
- Capacidades de visión heredadas de la torre del modelo padre Qwen/Qwen3.5-0.8B (sin detalles adicionales disponibles).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo "thinking" o decodificación especulativa: no disponible.

## Casos de uso

- Evaluación de modelos en competiciones descentralizadas: el modelo puede emplearse como "cuerpo" dentro del soup pool de la subred 127 de Bittensor para responder ítems de examen y comparar su rendimiento frente a otros cuerpos del pool.
- Clasificación y decisión estructurada: adecuado para tareas donde la salida es una decisión entre opciones predefinidas en formato de examen, gracias a su entrenamiento específico en familias de tareas conocidas.
- Enrutamiento de llamadas a herramientas: puede integrarse en pipelines que requieran seleccionar y formatear llamadas a funciones, dado su entrenamiento con ítems de tool-call de glaive-function-calling-v2.
- Destilación de conocimiento: sirve como ejemplo reproducible de destilación desde un soup mayor (d3-mini) hacia un modelo de menor tamaño, útil para investigación sobre promediado de pesos y LoRA.
- Investigación sobre "model soups": su procedimiento de interpolación de pesos (0,75 sobre media de cinco semillas y 0,25 sobre media inicial) lo hace útil para estudiar técnicas de merging y su impacto en el rendimiento.
- Prototipado de asistentes con visión: al heredar la torre de visión del padre, puede usarse en experimentos que combinen entrada visual y decisión estructurada, aunque sin garantías de calidad por falta de benchmarks.
- Base para fine-tunes posteriores: al ser Apache-2.0 y de tamaño reducido (853 M parámetros), es un punto de partida económico para ajustes específicos en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en BF16 se requieren aproximadamente 1,7 GB solo para pesos; en FP16 similar; en cuantización de 8 bits unos 0,9 GB; en 4 bits unos 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM puede alojar el modelo en cuantización; para BF16 se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: sí, en la mayoría de GPU modernas con cuantización; en BF16 requiere al menos 8 GB.
- Opciones de despliegue: al ser safetensors, puede cargarse con transformers; para cuantización y despliegue ligero se puede convertir a GGUF y usar llama.cpp u Ollama; para serving de mayor throughput, vLLM o TGI (sin datos confirmados de compatibilidad).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-pk5i75 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión del soup d3-lite |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo del soup usado como punto de partida |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo del soup usado como punto de partida |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real frente a alternativas.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe adecuado.
- Longitud de contexto no disponible; podría ser limitada para conversaciones multi-turno largas.
- Riesgo de alucinación inherente a modelos de este tamaño y a la destilación desde un soup mayor; no hay evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles, pero al entrenarse con datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor advierte de que se deben comprobar los términos de los datasets fuente antes de reutilizar; algunos datos de tasksource/tasksource-jev-typed-decisions fueron excluidos por licencias comerciales o no especificadas.
- El repositorio contiene solo pesos; no incluye código de entrenamiento ni pipeline de inferencia.
- La torre de visión se hereda del padre, pero no hay documentación sobre su funcionamiento o calidad.
- Fecha de creación futura (2026-11-16) en los metadatos, lo que puede indicar inconsistencias en el registro.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-pk5i75
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo del soup: https://huggingface.co/DouglasBashir/zils-lite-r6
- Cuerpo del soup: https://huggingface.co/BashirEmran/d3-lite-body-a2
- Dataset de tool-call: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de destilación: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Modelos del soup d3-mini: https://huggingface.co/Zayaan/zils-mini-hm4, https://huggingface.co/qhoenix/zils-mini-decision-t2avg, https://huggingface.co/joamCriff123/zils-mini-m1113b
