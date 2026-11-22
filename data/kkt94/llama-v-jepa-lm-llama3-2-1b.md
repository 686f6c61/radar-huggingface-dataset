# kkt94/Llama-V-JEPA-LM-Llama3.2-1B

## Resumen

Llama-V-JEPA-LM-Llama3.2-1B es un modelo de video-lenguaje desarrollado por el autor independiente kkt94 (familia Llama-V-JEPA-LM) que combina un codificador de video basado en un modelo del mundo V-JEPA 2.1 (ViT-L, congelado) con el modelo de lenguaje Llama-3.2-1B-Instruct de Meta mediante un puente espectral ("spectral bridge"). El modelo transforma cada clip de 32 fotogramas en 1.024 tokens visuales y responde preguntas en lenguaje natural sobre el contenido de un vídeo (pipeline `video-text-to-text`).

El problema que aborda es la comprensión de la dinámica temporal y el movimiento en vídeo: dirección, orden, velocidad, posición, conteo y finalización de acciones. Para ello se entrena con supervisión contrafactual: transformaciones de píxeles sobre vídeos públicos generan variantes equilibradas en respuestas cuya respuesta queda fijada por construcción y solo difiere en cómo cambia la escena, de modo que el LM aprende a leer la dinámica que porta el codificador del modelo del mundo. El entrenamiento emplea 4,60 millones de muestras públicas.

Es relevante ahora porque, con solo 1.548 millones de parámetros, declara superar a todos los modelos abiertos de su clase de tamaño en el promedio de 12 puntuaciones sobre 11 benchmarks de vídeo (62,21 frente a 52,45 de Qwen3-VL-2B, el mejor modelo abierto de la clase 2B según el autor). Se distribuye bajo licencia Llama 3.2 y está disponible en Hugging Face con pesos safetensors y código personalizado para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de video-lenguaje: codificador de video V-JEPA 2.1 (ViT-L, congelado) + puente espectral + Llama-3.2-1B-Instruct (transformer decoder) |
| Parametros totales | 1.548.154.880 (pesos safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura acopla dos componentes: un codificador de video V-JEPA 2.1 (ViT-L) que actua como modelo del mundo y permanece congelado, y el modelo de lenguaje Llama-3.2-1B-Instruct. Entre ambos se situa un puente espectral que proyecta cada clip de 32 fotogramas en 1.024 tokens visuales que el LM consume como contexto. El pipeline declarado es `video-text-to-text` y el modelo base es `meta-llama/Llama-3.2-1B-Instruct` con relacion `finetune`.

El entrenamiento se basa en supervisión contrafactual sobre 4,60 millones de muestras públicas: se aplican transformaciones de píxeles a vídeos públicos para producir variantes con respuestas equilibradas, fijadas por construcción y que difieren solo en la dinámica de la escena (dirección, orden, posición, velocidad, conteo, finalización). Esto permite ensenar al LM a leer el movimiento y el cambio temporal sin nueva anotacion humana. El autor declara que el modelo generaliza mas alla de sus construcciones, con un promedio de 94,5 en seis conjuntos reservados (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas y un simulador no visto, entre otros). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre video (`video-question-answering`) en modalidad video-texto-a-texto.
- Comprension de movimiento y cambio temporal: direccion, orden, posicion, velocidad, conteo y finalizacion de acciones.
- Extraccion de caracteristicas (`feature-extraction`) mediante el codificador V-JEPA 2.1.
- Razonamiento sobre dinamica de escenas apoyado en un modelo del mundo (world model).
- Capacidades de lenguaje heredadas de Llama-3.2-1B-Instruct (generacion de texto y seguimiento de instrucciones).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision de imagenes estaticas, audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de vigilancia y video seguridad: el modelo puede responder preguntas sobre direccion, orden y velocidad de objetos en clips de 32 fotogramas, aprovechando su entrenamiento en dinamica temporal para describir si una persona entro o salio de una zona y en que secuencia.
- Control de calidad en lineas de produccion: dado un clip de una cinta transportadora, el modelo puede responder si una pieza se detuvo, avanzo o se completo su recorrido, apoyandose en las construcciones de conteo y finalizacion del entrenamiento contrafactual.
- Indexado y busqueda semantica de archivos de video: usar el codificador V-JEPA 2.1 para extraer caracteristicas y el LM para generar descripciones en lenguaje natural que alimenten un indice consultable.
- Analisis deportivo basico: responder preguntas sobre direccion de desplazamiento, orden de eventos o velocidad relativa en clips cortos, adecuado por su capacidad declarada en benchmarks de movimiento (SSv2 89,6 en opcion multiple).
- Asistencia a personas con discapacidad visual: descripcion de la dinamica de una escena en video (que se mueve, hacia donde, en que orden), con la ventaja de un modelo de 1,5B parametros desplegable en hardware modesto.
- Investigacion en modelos del mundo y video-lenguaje: servir como base de experimentacion al acoplar un codificador congelado V-JEPA con un LM pequeno, con pesos abiertos y codigo disponible para reproducir el puente espectral.
- Prototipado de robótica y planificacion visual: usar la representacion del modelo del mundo para tareas de comprension de escenas dinamicas antes de integrar un policy de control.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| MVBench | accuracy | 66,3 |
| PerceptionTest | accuracy | 71,9 |
| TVBench | accuracy | 67,9 |
| TempCompass | accuracy | 71,6 |
| TOMATO | accuracy | 48,2 |
| MotionBench | accuracy | 49,5 |
| NExT-QA | accuracy | 70,2 |
| MVP | pair accuracy | 48,5 |
| TemporalBench (binary) | accuracy | 57,8 |
| SSv2 (multiple choice) | accuracy | 89,6 |
| Vinoground text | text pair accuracy | 51,2 |
| Vinoground video | video pair accuracy | 53,8 |

Promedio declarado: 62,21 sobre 12 puntuaciones en 11 benchmarks de video. El autor afirma que supera a todos los modelos abiertos de su clase de tamano (mejor modelo abierto de clase 2B segun el autor: Qwen3-VL-2B, 52,45) y que es el mejor de los modelos abiertos de clase 2B en 8 de las 12 puntuaciones (SSv2 89,6 frente a 61,7; Vinoground video 53,8 frente a 29,6; TOMATO 48,2 frente a 31,0; TVBench 67,9 frente a 50,9). No se dispone de resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.548 millones de parametros, los pesos en precision de 16 bits ocupan aproximadamente 3,1 GB (tamano del repo), a los que hay que sumar la memoria del codificador V-JEPA 2.1 (ViT-L) y de las activaciones de 1.024 tokens visuales por clip.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si en GPUs consumer con suficiente VRAM para pesos en fp16/bf16 mas el codificador, aunque el dato concreto no se especifica en la informacion disponible.
- Opciones de despliegue: `transformers` con `custom_code` (requerido por la arquitectura personalizada). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada. Existe una demo en Hugging Face Spaces (ZeroGPU) para la variante de 8B.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (promedio 12 scores) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.2-1B | 1,55B | no disponible | 62,21 (declarado por el autor) | Llama 3.2 | Hugging Face, pesos safetensors |
| Qwen3-VL-2B | ~2B (clase 2B) | no disponible | 52,45 (citado por el autor) | no disponible en la informacion | no disponible en la informacion |

El autor cita Qwen3-VL-2B como el mejor modelo abierto de la clase 2B y referencia comparaciones puntuales en SSv2, Vinoground, TOMATO y TVBench. No se dispone de datos de otros modelos comparables (por ejemplo, variantes de video-lenguaje de 1-2B) en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no disponible; los clips se procesan en ventanas de 32 fotogramas, lo que limita el analisis a videos cortos por inferencia.
- Alucinacion: como modelo de lenguaje, puede generar respuestas plausibles pero incorrectas sobre el contenido del video; los benchmarks declarados no estan verificados (`verified: false`).
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al entrenarse con videos publicos, es probable que herede sesgos de ese corpus.
- Licencia: uso sujeto a la Llama 3.2 Community License y a la Llama 3.2 Acceptable Use Policy, con restricciones para uso comercial que deben revisarse antes de produccion.
- Codigo personalizado: requiere `custom_code` en `transformers`, lo que puede complicar el despliegue en stacks estandar y en herramientas de inferencia de alto rendimiento.
- Madurez: modelo de un autor independiente, con 755 descargas y 11 likes en el momento de la consulta; los resultados son declarados por el autor y no han sido verificados de forma independiente.
- Rendimiento limitado en tareas de pares sutiles (MVP pair accuracy 48,5; Vinoground text 51,2), proximo al azar, lo que sugiere dificultades en discriminaciones temporales muy finas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.2-1B
- Paper: https://arxiv.org/abs/2611.17831
- Codigo y reporte tecnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (variante 8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
