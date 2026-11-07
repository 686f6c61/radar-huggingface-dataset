# ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3c

## Resumen

Qwen3.5-9B-VK-OPD-think-R3c es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante ajuste fino completo (full fine-tune) de las capas del modelo de lenguaje y la normalización final, almacenado en bf16. Lo publica el usuario ohjoonhee como artefacto privado de investigación, no como lanzamiento oficial, y su propósito es estudiar la destilación on-policy (on-policy distillation, OPD) aplicada a conflictos de conocimiento visión-lenguaje: situaciones en las que lo que muestra una imagen contradice lo que es cierto en el mundo real.

El modelo es multimodal (pipeline image-text-to-text) y conserva el modo de razonamiento (thinking) del modelo base. La innovación metodológica es el uso de profesores con contexto privilegiado: el propio Qwen3.5-9B congelado, al que se le inyecta una instrucción de sistema distinta según el tipo de pregunta (responder según la imagen o responder según el conocimiento general), mientras el alumno ve exactamente el mismo turno de usuario. La ventaja por token se calcula como log π_profesor − log π_alumno sobre las muestras generadas por el alumno.

Este checkpoint corresponde a la ronda 3 (run R3c, semilla 3, paso 60) y añade una rejilla de señales equilibrada por objetivo: cada señal se asocia tanto a la pregunta sobre la foto como a la pregunta de conocimiento de la misma imagen. Su relevancia es acotada: sirve para comparar variantes dentro de la ronda 3 de un experimento de destilación, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), derivado de Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y aplica un ajuste fino completo de las capas del modelo de lenguaje y de la normalización final, en bf16. La cabeza MTP (multi-token prediction) del modelo base no se incluye en el checkpoint. La arquitectura subyacente es la del modelo base qwen3_5, de tipo transformer multimodal para entrada imagen-texto; no se detallan en la información disponible capas, atención ni configuración interna.

El entrenamiento es una destilación on-policy con profesores congelados que reciben contexto privilegiado. Para preguntas sobre la foto, el profesor recibe la imagen más la instrucción de sistema «Answer from what is actually shown in the image, even if it differs from what is typical». Para preguntas de conocimiento, recibe la imagen más «Answer with what is generally true in the real world, even if the photo shows something different» (en la ronda 1 no se incluía la foto en este caso). El turno de usuario del alumno —foto, pregunta y señal— es idéntico para alumno y profesor. Los datos son una mezcla fija: 30% sin señal; 17,5% de cada una de cuatro familias de señales (frase de hecho kf, frase de inspección li, instrucción de conocimiento ki, persona/formato pf), con prefijo 75% y sufijo 25%. Solo se usan pares de imagen en los que el profesor acertó todos los ítems en 2 de 2 muestras (280 imágenes con conflicto y 80 ordinarias). El run R3c añade respecto a R3a una rejilla de señales equilibrada por objetivo: cada señal se asocia tanto a la pregunta sobre la foto como a la de conocimiento de la misma imagen. Se entrenó 80 pasos con lr 3e-6 (5 de warmup), 8 pares de imagen (16 prompts) × 4 rollouts por paso, rollouts de hasta 4.096 tokens, en 4× H100. El checkpoint publicado es el paso 60, seleccionado sobre el split de desarrollo.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredados del modelo base Qwen3.5-9B.
- Entrada multimodal imagen-texto: responde preguntas sobre el contenido de una imagen.
- Manejo explícito de conflictos de conocimiento: distingue entre responder según lo mostrado en la imagen y responder según lo generalmente cierto.
- Seguimiento de instrucciones de sistema que modulan el criterio de respuesta (contexto privilegiado destilado).
- Conversación multi-turno (tag conversational en el modelo base).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso más allá del modo thinking: no disponible.
- Cobertura multilingüe: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en destilación on-policy: sirve como checkpoint de comparación frente a la ronda 1 (VK-OPD-think) y frente a la base para medir el efecto de la rejilla de señales equilibrada por objetivo.
- Estudio de conflictos de conocimiento visión-lenguaje: permite analizar si el modelo prioriza la evidencia visual o el conocimiento del mundo según la instrucción de sistema recibida.
- Evaluación de robustez ante señales contradictorias: útil para construir conjuntos de prueba con pares de imagen donde lo mostrado difiere de lo típico y comprobar el comportamiento del modelo.
- Réplica de experimentos de destilación: la model card documenta hiperparámetros (lr 3e-6, 80 pasos, 4 rollouts, 4.096 tokens) y composición de datos, lo que permite reproducir el pipeline sobre la misma base.
- Análisis de calibración con modo thinking: el protocolo de evaluación (temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5, hasta 8.192 tokens) sirve como base para estudios de muestreo en tareas de respuesta corta.
- Docencia y divulgación técnica: ejemplo realista de destilación con profesor privilegiado y de selección de checkpoint por split de desarrollo.

## Benchmarks y rendimiento

Evaluación privada (private test v3, imágenes naturales, n = 1.186, thinking activado, muestreo de la model card, 1 muestra). CV = conflicto visual, CK = conflicto de conocimiento, NV = no conflicto visual, NK = no conflicto de conocimiento, All-4 = acierto en las cuatro categorías, KT = conocimiento típico.

| Modelo | CV | CK | NV | NK | All-4 | KT |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 80,2 | 67,7 | 84,0 | 90,7 | 43,5 | 93,0 |
| Ronda 1 (VK-OPD-think) | 83,2 | 93,8 | 83,1 | 93,2 | 65,6 | 92,9 |
| Este modelo (R3c, paso 60) | 82,0 | 93,7 | 83,5 | 91,0 | 62,5 | 93,3 |

Frente a la base, la mejora en All-4 es de +19,0 puntos porcentuales, con intervalo de confianza del 95% [+15,9, +22,1] pp por bootstrap de pares. Los resultados provienen de una sola semilla. El protocolo de evaluación usa temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5, 1 muestra, hasta 8.192 tokens y el sufijo de prompt «Answer the question using a single word or phrase»; la respuesta se toma tras `</think>` y se corrige primero por coincidencia exacta de regla y después con Qwen3.5-27B como juez.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más memoria para el codificador visual, caché KV y activaciones; en la práctica se necesita holgura por encima de esa cifra.
- Cuantización: no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) para este checkpoint; habría que generarlas a partir de los safetensors en bf16.
- GPU recomendadas: el entrenamiento se realizó en 4× H100. Para inferencia, una A100 de 40 GB o 80 GB, una H100 o una L40S de 48 GB son opciones holgadas; una RTX 4090 de 24 GB queda muy justa en bf16 y requeriría cuantización para dejar espacio a la caché KV.
- Cabe en GPU de consumo: solo con cuantización (por ejemplo, 8 bits o 4 bits) y ventanas de contexto moderadas; no se dispone de medidas verificadas para este checkpoint.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | All-4 (test privado v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,41 mil millones | no disponible | 43,5 | no disponible en la información | Público en Hugging Face |
| Qwen3.5-9B-VK-OPD-think (ronda 1) | 9,41 mil millones (derivado) | no disponible | 65,6 | apache-2.0 | Público en Hugging Face |
| Qwen3.5-9B-VK-OPD-think-R3c (este) | 9,41 mil millones | no disponible | 62,5 | apache-2.0 | Público en Hugging Face (checkpoint de investigación) |

No se dispone de datos de benchmarks de terceros (MMLU, HumanEval, GSM8K) para este checkpoint ni para la ronda 1, por lo que la comparación se limita a la evaluación interna del autor.

## Limitaciones y advertencias

- Checkpoint de investigación privado: el autor lo describe explícitamente como «not a release» y comparte los resultados solo para comparación dentro de la ronda 3.
- Una sola semilla en la evaluación: la mejora de +19,0 pp frente a la base tiene un intervalo de confianza amplio y no se ha replicado.
- No incluye la cabeza MTP del modelo base, lo que puede afectar a pipelines que la esperen.
- Sin datos publicados sobre sesgos, tasas de alucinación fuera del conjunto de evaluación ni comportamiento en idiomas distintos del usado en el test.
- Longitud de contexto no documentada en la información disponible; el entrenamiento usó rollouts de hasta 4.096 tokens y la evaluación hasta 8.192, pero no se confirma la ventana máxima del modelo.
- Sin versiones cuantizadas publicadas, lo que limita el despliegue en hardware de consumo.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base Qwen3.5-9B antes de un uso comercial.
- El conjunto de evaluación es privado y el juicio combina coincidencia exacta con un modelo juez (Qwen3.5-27B), lo que introduce dependencia del juez y dificulta la comparación externa.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think-R3c
- Ronda 1 (VK-OPD-think): https://huggingface.co/ohjoonhee/Qwen3.5-9B-VK-OPD-think
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog o repositorio del método: no disponible
- Demo: no disponible
