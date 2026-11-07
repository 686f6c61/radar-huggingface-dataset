# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d-s4

## Resumen

Qwen3.5-9B-VK-OPD-think-R3d-s4 es un checkpoint de investigación privado derivado de Qwen/Qwen3.5-9B mediante un ajuste fino completo de las capas del modelo de lenguaje y la normalización final. Lo publica el usuario ohjoonhee en Hugging Face y pertenece a la ronda 3 del método VK-OPD (destilación on-policy con contexto privilegiado) en su variante de modo pensamiento, ejecución R3d y semilla 4, seleccionado en el paso 80 sobre el split de desarrollo.

El modelo aborda el problema de los conflictos de conocimiento en tareas de imagen-texto: situaciones en las que la imagen contradice lo que es cierto en el mundo real. Para ello entrena al estudiante con dos profesores congelados derivados del modelo base, cada uno con un contexto de sistema distinto: uno responde según lo que muestra la imagen y otro según lo que es generalmente cierto. La ventaja por token se calcula como la diferencia entre el logaritmo de la probabilidad del profesor y la del estudiante sobre las muestras generadas por este último.

Con 9.409.813.744 parámetros y pesos en bf16 (repositorio de 18,8 GB), es relevante para investigadores que estudian destilación on-policy, conflictos de conocimiento multimodal y el efecto del muestreo dinámico de familias de datos. No es un lanzamiento público: el autor lo describe explícitamente como un checkpoint compartido de forma privada para comparación dentro de la ronda 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline image-text-to-text; no se detalla la configuración interna |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las rollouts de entrenamiento usan hasta 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a) y aplica un ajuste fino completo de las capas del modelo de lenguaje y la normalización final, almacenado en bf16. La cabeza MTP del modelo base no se incluye en el checkpoint. El pipeline declarado es image-text-to-text, por lo que conserva la capacidad de procesar pares imagen-texto.

El entrenamiento sigue el método VK-OPD: los profesores son el modelo base congelado con contexto privilegiado y la ventaja por token se define como log π_profesor − log π_estudiante sobre las propias muestras del estudiante. Hay dos familias de preguntas: las fotográficas, con un sistema que ordena responder según lo que realmente se ve en la imagen aunque difiera de lo típico, y las de conocimiento, con un sistema que ordena responder con lo que es cierto en el mundo real aunque la foto muestre otra cosa. El turno de usuario del estudiante (foto, pregunta y cualquier pista) es idéntico para estudiante y profesor. Los datos son los mismos que en R3c, con pesos de familia que parten de los de R3c y se adaptan dentro de límites (0,25-0,60 para lo general y 0,05-0,40 para las familias específicas), usando solo pares de imagen en los que el profesor acertó todos los ítems en 2 de 2 muestras (280 imágenes de conflicto y 80 ordinarias).

La innovación destacable de esta ejecución es el muestreo dinámico de familias al estilo Nash-MOPD: cada 10 pasos, tras un calentamiento de 20, se extraen con más frecuencia las familias cuya brecha respecto al profesor se cierra lentamente. El entrenamiento consta de 80 pasos con lr 3e-6 (5 de calentamiento), 8 pares de imagen (16 prompts) × 4 rollouts por paso, rollouts de hasta 4.096 tokens, sobre 4× H100.

## Capacidades

- Generación de texto y razonamiento en modo pensamiento (thinking on), que es el modo evaluado en la model card.
- Comprensión de imagen-texto: responde a preguntas sobre fotografías, incluidas las que presentan conflictos entre lo mostrado y lo típico.
- Distinción explícita entre responder según la imagen y responder según el conocimiento general del mundo, controlada por el contexto de sistema.
- Conversación multiturno (etiqueta conversational en el repositorio).
- Compatibilidad con endpoints de Hugging Face (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en destilación on-policy: sirve como punto de comparación reproducible frente a la semilla 3 (Qwen3.5-9B-VK-OPD-think-R3d) y frente a la ronda 1, para medir la varianza entre semillas del método VK-OPD con muestreo dinámico de familias.
- Estudio de conflictos de conocimiento multimodal: permite analizar cómo un modelo de 9B resuelve preguntas en las que la imagen contradice el conocimiento general, con métricas separadas de conflicto visual (CV), conflicto de conocimiento (CK), no conflicto visual (NV) y no conflicto de conocimiento (NK).
- Evaluación de robustez ante contexto privilegiado: útil para comprobar si el comportamiento aprendido con dos profesores contrapuestos se mantiene cuando se varía la instrucción de sistema en inferencia.
- Análisis de brecha profesor-estudiante: el checkpoint en el paso 80 permite estudiar la evolución de la ventaja por token y la dinámica de pesos de familia durante el entrenamiento.
- Prototipado de asistentes visuales con instrucciones de sistema explícitas: por ejemplo, sistemas que deben priorizar la evidencia visual frente a los sesgos del mundo real en tareas de verificación de imágenes.
- Reproducción académica: al estar los hiperparámetros completos en la model card (lr, pasos, rollouts, hardware), facilita la replicación del experimento en clústeres con 4× H100.

## Benchmarks y rendimiento

Resultados en el test privado v3 (imágenes naturales, n = 1.186, thinking on, muestreo de la model card, 1 muestra):

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| VK-OPD-think (ronda 1) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| Este modelo (R3d-s4) | 80,8 | 94,3 | 81,9 | 91,5 | 61,2 | 93,8 |

La mejora de All-4 frente al modelo base es de +17,7 puntos porcentuales, con intervalo de confianza del 95 % de [+14,8, +20,9] pp obtenido por bootstrap de pares. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica, un mínimo de 24 GB y recomendable 40-80 GB según longitud de contexto y lote.
- Cuantización: no se han publicado versiones GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors en bf16.
- GPU recomendadas: el entrenamiento se realizó en 4× H100; para inferencia, A100 40/80 GB o H100 son las opciones seguras. Una RTX 4090 (24 GB) podría alojar los pesos en bf16 pero con poco margen para contexto largo y visión.
- Cabe en GPU de consumo: solo en modelos con 24 GB o más y con cuantización agresiva o contexto reducido; no hay artefactos cuantizados publicados que lo confirmen.
- Opciones de despliegue: transformers es la librería declarada; la etiqueta endpoints_compatible sugiere compatibilidad con los endpoints de Hugging Face. No se indica soporte verificado de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | All-4 (test privado v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-VK-OPD-think-R3d-s4 (este) | 9,41 B | no disponible | 61,2 | apache-2.0 | checkpoint privado, 0 descargas |
| Qwen3.5-9B-VK-OPD-think-R3d (semilla 3) | 9 B (según la card del autor) | no disponible | no disponible en la información | no disponible | público en Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9 B (según la card del autor) | no disponible | 65,6 | no disponible | público en Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9 B (según la card del autor) | no disponible | 43,5 | no disponible | público en Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint de investigación privado, no un lanzamiento: el autor indica que se comparte para comparación dentro de la ronda 3.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- No se incluye la cabeza MTP del modelo base, lo que puede limitar funcionalidades que dependan de ella.
- Los benchmarks son de un test privado v3 con una sola muestra por ítem y muestreo de la model card; no son directamente comparables con evaluaciones públicas estándar.
- La varianza entre semillas es apreciable: la semilla 4 obtiene 61,2 en All-4 frente a 65,6 de la ronda 1, con caídas en NV (81,9 frente a 84,0 del base) y NK (91,5 frente a 90,7 del base, ligera mejora).
- No hay información sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento fuera del dominio de imágenes naturales.
- La licencia apache-2.0 permite uso comercial según los términos de la licencia, pero el estado de investigación del checkpoint y la ausencia de evaluaciones de seguridad desaconsejan su despliegue en producción sin validación adicional.
- El contexto máximo no está documentado; las rollouts de entrenamiento se limitaron a 4.096 tokens, lo que no garantiza soporte de ventanas mayores en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d-s4
- Semilla 3 de la misma ronda: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3d
- Ronda 1 del método: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
