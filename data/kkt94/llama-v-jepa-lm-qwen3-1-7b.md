# kkt94/Llama-V-JEPA-LM-Qwen3-1.7B

## Resumen

Llama-V-JEPA-LM-Qwen3-1.7B es un modelo de lenguaje y vídeo desarrollado por el autor independiente kkt94 dentro de la familia Llama-V-JEPA-LM. Combina un codificador de vídeo congelado basado en el modelo del mundo V-JEPA 2.1 (ViT-L) con el modelo de lenguaje Qwen3-1.7B, unidos mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El objetivo es dotar a un modelo de lenguaje compacto de capacidad para razonar sobre la dinámica temporal del vídeo: dirección, orden, velocidad, posición, conteo y finalización de acciones.

El modelo se entrena con supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes equilibradas en respuestas, cuyas respuestas quedan fijadas por construcción y difieren únicamente en cómo cambia la escena. Así, el modelo de lenguaje aprende a leer la dinámica que el codificador del modelo del mundo ya codifica, sin necesidad de nuevas anotaciones humanas. El entrenamiento emplea 4,60 millones de muestras públicas.

Su relevancia radica en que un modelo de solo 2.032.915.456 parámetros totales supera, según el autor, a todos los modelos abiertos de su clase de tamaño en tareas de vídeo: obtiene una media de 66,02 en 12 métricas sobre 11 benchmarks de vídeo, frente a 52,45 de Qwen3-VL-2B. El prefijo «Llama» del nombre se debe a que los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, cuya licencia exige ese prefijo en los modelos entrenados con él.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3-1.7B acoplado a un codificador de vídeo V-JEPA 2.1 (ViT-L) congelado mediante un puente espectral |
| Parámetros totales | 2.032.915.456 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

La arquitectura une un codificador de vídeo V-JEPA 2.1 (ViT-L) congelado, que actúa como modelo del mundo, con el modelo de lenguaje Qwen3-1.7B a través de un puente espectral. Cada clip de 32 fotogramas se proyecta en 1.024 tokens visuales con independencia de la resolución de entrada, lo que mantiene el coste de prefill del modelo de lenguaje constante. El codificador de vídeo no se entrena; solo se adapta la interfaz hacia el modelo de lenguaje.

El entrenamiento se basa en supervisión contrafactual sobre 4,60 millones de muestras públicas. Las transformaciones de píxel de vídeos públicos generan variantes con respuestas equilibradas y fijadas por construcción, que difieren solo en la dinámica de la escena, de modo que el modelo aprende a interpretar dirección, orden, posición, velocidad, conteo y finalización. No se detalla en la información disponible el uso de RLHF o DPO, ni la composición exacta del dataset más allá de las fuentes citadas.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en inglés.
- Razonamiento sobre dinámica temporal: dirección, orden, posición, velocidad, conteo y finalización de acciones.
- Comprensión de cambios de estado y relaciones temporales entre fotogramas.
- Procesamiento de clips de 32 fotogramas con 1.024 tokens visuales por clip, a cualquier resolución de entrada.
- Extracción de características (feature-extraction) según los tags del modelo.
- Integración con la librería transformers mediante código personalizado (custom_code).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis de vigilancia y monitorización: el modelo puede responder preguntas sobre dirección y velocidad de objetos en clips de 32 fotogramas, adecuado para detectar cambios de estado en secuencias de cámara.
- Indexación y búsqueda semántica de vídeo: la extracción de características y la conversión de clips en 1.024 tokens permiten generar representaciones compactas para motores de búsqueda sobre archivos audiovisuales.
- Control de calidad en líneas de producción: la capacidad de leer orden, posición y finalización de acciones permite verificar pasos de procesos grabados en vídeo.
- Análisis deportivo: la comprensión de dirección, velocidad y orden temporal sirve para responder consultas sobre jugadas y secuencias de movimiento.
- Evaluación de contenido educativo o demostrativo: responder preguntas sobre el desarrollo de un procedimiento mostrado en vídeo, aprovechando la comprensión de la secuencia de estados.
- Investigación en modelos del mundo: al usar un codificador V-JEPA congelado, sirve como banco de pruebas para estudiar cómo un modelo de lenguaje interpreta representaciones latentes de dinámica visual.
- Asistencia a personas con discapacidad visual: descripción de cambios y acciones en secuencias cortas de vídeo, con la limitación de que solo opera en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 69,5 |
| PerceptionTest | accuracy | 75,3 |
| TVBench | accuracy | 70,7 |
| TempCompass | accuracy | 73,5 |
| TOMATO | accuracy | 50,9 |
| MotionBench | accuracy | 54,3 |
| NExT-QA | accuracy | 74,0 |
| MVP | pair accuracy | 54,6 |
| TemporalBench (binary) | accuracy | 63,9 |
| SSv2 (multiple choice) | accuracy | 91,6 |
| Vinoground text | text pair accuracy | 63,2 |
| Vinoground video | video pair accuracy | 50,8 |

Media de las 12 métricas: 66,02, frente a 52,45 de Qwen3-VL-2B según el autor. En seis conjuntos retenidos (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas y un simulador no visto; azar 33,3), el modelo obtiene una media de 95,0 frente a 43,8 de Qwen3-VL-2B. El autor indica que es el mejor modelo abierto de la clase 2B en 9 de las 12 métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.032.915.456 parámetros, en FP16 rondaría los 4 GB solo para los pesos, más el codificador de vídeo y las activaciones.
- GPU recomendadas: el autor cita una H100 para el prefill de un clip (3,3 TFLOPs en 22 ms); no se detallan otras GPU.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más de VRAM en FP16, aunque este dato no está confirmado en la información disponible.
- Opciones de despliegue: transformers con código personalizado (custom_code); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de un clip de 1.024 tokens visuales en 22 ms en una H100 (3,3 TFLOPs); no se detalla el throughput de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 métricas de vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-1.7B | 2.032.915.456 | No disponible | 66,02 | Apache-2.0 | Hugging Face |
| Qwen3-VL-2B | Clase 2B | No disponible | 52,45 | No disponible | No disponible |

No se dispone en la información proporcionada de datos de un tercer modelo comparable (parámetros, contexto, licencia ni resultados) para completar la comparativa.

## Limitaciones y advertencias

- Solo soporta inglés, lo que limita su uso en entornos en castellano sin adaptación.
- Los resultados de benchmarks son declarados por el autor y no están verificados.
- No se documenta la longitud de contexto del modelo de lenguaje subyacente.
- El codificador de vídeo está congelado: la adaptación al dominio se limita al puente espectral y al modelo de lenguaje.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en preguntas sobre detalles finos de la escena no cubiertos por las transformaciones de entrenamiento.
- El rendimiento en TOMATO (50,9) y MotionBench (54,3) es notablemente inferior al de otros benchmarks, lo que sugiere dificultades en tareas de comprensión de movimiento complejo.
- La licencia Apache-2.0 permite uso comercial, pero el prefijo «Llama» deriva de la licencia de los datos PLM-Video-Human; conviene revisar las condiciones de ese dataset antes de un despliegue comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-1.7B
- Paper: https://arxiv.org/abs/2611.17831
- Código e informe técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (Llama-V-JEPA-LM-Llama3.1-8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
