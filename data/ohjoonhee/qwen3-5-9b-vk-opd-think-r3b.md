# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3b

## Resumen

Qwen3.5-9B-VK-OPD-think-R3b es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B, publicado por el usuario ohjoonhee. Se trata de un ajuste fino completo (full fine-tune) de las capas del modelo de lenguaje y de la normalización final, almacenado en bf16, entrenado mediante una variante de destilación on-policy denominada VK-OPD (Vision-Knowledge On-Policy Distillation). El objetivo del entrenamiento es resolver conflictos entre el conocimiento visual y el conocimiento previo del modelo: que responda a partir de lo que muestra la imagen cuando se le pregunta por la foto, y a partir de lo que es cierto en el mundo real cuando se le pregunta por conocimiento general, incluso si la imagen contradice ese conocimiento.

El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y su modo de razonamiento (thinking mode). Con 9.409.813.744 parámetros totales y un repositorio de 18,8 GB, es un modelo de tamaño medio que puede ejecutarse en hardware de gama alta de consumo con cuantización adecuada. Este checkpoint corresponde a la ronda 3 (run R3b, semilla 3, paso 80) de una serie de experimentos privados y se comparte explícitamente como material de comparación dentro de la ronda 3, no como un lanzamiento estable.

La relevancia actual del modelo reside en su enfoque metodológico: el uso de destilación on-policy con contexto privilegiado para separar dos regímenes de respuesta (visual frente a factual) es un problema abierto en modelos multimodales, donde el modelo tiende a ignorar la imagen y responder con su conocimiento previo. Los resultados reportados en el conjunto de test privado muestran una mejora sustancial en la métrica compuesta All-4 respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; ajuste fino completo de capas LM y norm final |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los rollouts de entrenamiento usan hasta 4.096 tokens; la evaluacion hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo sobre las capas del modelo de lenguaje y la normalización final, en bf16. No se incluye la cabeza MTP (multi-token prediction) del modelo base. La arquitectura subyacente es la de la familia Qwen3.5, un transformer multimodal que procesa imagen y texto, con modo de razonamiento (thinking) activable.

El entrenamiento emplea destilación on-policy (OPD) con profesores que son el propio modelo base congelado provisto de contexto privilegiado. La ventaja por token se define como log π_teacher − log π_student calculada sobre las muestras generadas por el estudiante. Para preguntas sobre la foto, el profesor recibe la imagen y un mensaje de sistema que le indica responder desde lo que se muestra realmente en la imagen, aunque difiera de lo típico. Para preguntas de conocimiento, el profesor recibe la foto y un mensaje de sistema que le indica responder con lo que es generalmente cierto en el mundo real, aunque la foto muestre otra cosa. El turno de usuario del estudiante (foto, pregunta y cualquier pista) es idéntico al del profesor.

Los datos se componen de un 30 % de pares sin cebado y un 70 % de pares cebados (una frase de hecho antes de las preguntas sobre foto y una frase de inspección antes de las preguntas de conocimiento, siempre como prefijo). Solo se incluyen pares de imagen en los que el profesor acertó todos los ítems en 2 de 2 muestras: 280 imágenes con conflicto y 80 imágenes ordinarias. El entrenamiento consta de 80 pasos, learning rate 3e-6 con 5 pasos de warmup, 8 pares de imagen (16 prompts) × 4 rollouts por paso, rollouts de hasta 4.096 tokens, ejecutado en 4× H100. Esta ronda R3b añade al run R3a el cebado de una frase del compañero de laboratorio descrito anteriormente.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con la respuesta final separada tras `</think>`.
- Comprensión de imagen y texto combinados (image-text-to-text): responde preguntas sobre el contenido de una fotografía.
- Distinción explícita entre respuesta visual (basada en lo mostrado) y respuesta factual (basada en conocimiento del mundo), incluyendo casos de conflicto entre ambas.
- Seguimiento de instrucciones de sistema que fijan el régimen de respuesta (responder desde la imagen frente a responder desde el conocimiento general).
- Conversación multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada más allá del modo thinking.
- Capacidades de audio: no disponibles.

## Casos de uso

- Verificación de contenido visual en entornos donde la imagen contradice la expectativa: el modelo puede responder estrictamente desde lo mostrado en la foto cuando el sistema se lo indica, útil en inspección de productos, control de calidad o moderación de contenido donde la respuesta debe ceñirse a la evidencia visual.
- Asistentes de conocimiento general con entrada visual: cuando el usuario adjunta una imagen pero pregunta por un hecho del mundo real, el modelo responde con el conocimiento general en lugar de describir la imagen, lo que encaja en asistentes educativos o de consulta factual.
- Investigación en conflicto de conocimiento: sirve como checkpoint de comparación para estudiar cómo los modelos multimodales priorizan la evidencia visual frente al conocimiento previo, con métricas separadas CV, CK, NV, NK y All-4.
- Evaluación de pipelines de destilación on-policy: el modelo es un artefacto reproducible (semilla, paso, hiperparámetros documentados) para validar metodologías OPD con contexto privilegiado en modelos multimodales.
- Prototipado de asistentes de razonamiento visual: con modo thinking activado y hasta 8.192 tokens de generación en evaluación, puede emplearse para tareas que requieren una cadena de razonamiento antes de la respuesta sobre una imagen.
- Fine-tuning posterior controlado: al ser un full fine-tune en bf16 con licencia Apache 2.0, puede servir de punto de partida para experimentos académicos de ajuste sobre tareas específicas de visión y lenguaje.
- Análisis de robustez ante priming: permite estudiar cómo un prefijo de una frase (hecho o inspección) altera la distribución de respuestas, útil en investigación sobre sensibilidad a instrucciones.

## Benchmarks y rendimiento

Evaluación en test privado v3 (imágenes naturales, n = 1.186, thinking activado, muestreo de la model card, 1 muestra). Métricas: CV (conflicto visual), CK (conflicto de conocimiento), NV (no conflicto visual), NK (no conflicto de conocimiento), All-4 (acierto en las cuatro categorías) y KT.

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| VK-OPD-think (ronda 1) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| VK-OPD-think-R3b (este modelo) | 81,1 | 93,6 | 81,4 | 91,9 | 60,9 | 94,7 |

La mejora de All-4 respecto al base es de +17,4 puntos porcentuales, con intervalo de confianza del 95 % por bootstrap de pares de [+14,4, +20,4] pp. Los resultados corresponden a una única semilla. El ajuste de muestreo documentado para la evaluación es temperatura 1,0, top-p 0,95, top-k 20, presence penalty 1,5, hasta 8.192 tokens y prompt terminado en «Answer the question using a single word or phrase.»; la corrección se hace primero por coincidencia exacta de regla y después con Qwen3.5-27B como juez.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se necesitan alrededor de 20-24 GB para inferencia cómoda en bf16.
- Cuantización: los pesos se publican en bf16; no se documentan versiones GGUF ni cuantizaciones oficiales en la información disponible. Con cuantización a 8 bits o 4 bits (si se generan conversiones) el modelo podría caber en GPUs de 12-16 GB, aunque este dato no está confirmado por el autor.
- GPUs recomendadas: H100 o A100 para entrenamiento e inferencia de referencia (el entrenamiento se realizó en 4× H100). Para inferencia en bf16, una RTX 4090 (24 GB) o una L40S (48 GB) son opciones razonables; en GPUs de 16 GB sería necesario cuantizar.
- Cabe en GPU de consumo: sí, en bf16 en una RTX 4090 de 24 GB; en GPUs de 12-16 GB solo con cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | All-4 (test privado v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-VK-OPD-think-R3b | 9,41 B | no disponible | 60,9 | Apache 2.0 | Hugging Face (checkpoint privado compartido) |
| Qwen3.5-9B (base) | no disponible | no disponible | 43,5 | Apache 2.0 | Hugging Face (público) |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | no disponible | no disponible | 65,6 | Apache 2.0 | Hugging Face (público) |

La comparación se limita a los modelos de la misma familia y del mismo linaje experimental, ya que no se dispone de datos de benchmarks de modelos externos en la información proporcionada. Destaca que la ronda 1 obtiene un All-4 superior (65,6 frente a 60,9) en este test, mientras que este checkpoint R3b mejora en KT (94,7 frente a 92,9).

## Limitaciones y advertencias

- Checkpoint de investigación privado: el autor lo describe explícitamente como material de comparación dentro de la ronda 3, no como un lanzamiento. No debe tratarse como un modelo estable de producción.
- Resultados de una única semilla: la mejora de All-4 se reporta con una sola semilla, lo que limita la solidez estadística de las conclusiones.
- No se incluye la cabeza MTP del modelo base, por lo que no se dispone de esa capacidad de predicción multi-token.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los del base.
- Longitud de contexto no documentada en la información disponible; los rollouts de entrenamiento usan hasta 4.096 tokens y la evaluación hasta 8.192, pero no se confirma la ventana máxima del modelo.
- Riesgo de alucinación: no evaluado de forma específica en la información proporcionada; el modelo está entrenado para separar respuesta visual y factual, pero no se reportan métricas de fidelidad fuera del test privado.
- Sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin validación externa, su uso en producción conlleva riesgo no cuantificado.
- Dependencia del cebado: parte del comportamiento está condicionado por prefijos de una frase (hecho o inspección); sin esos prefijos el rendimiento puede diferir del reportado.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
