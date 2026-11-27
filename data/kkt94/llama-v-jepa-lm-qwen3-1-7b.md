# kkt94/Llama-V-JEPA-LM-Qwen3-1.7B

## Resumen

Llama-V-JEPA-LM-Qwen3-1.7B es un modelo de lenguaje y vídeo desarrollado por el autor independiente kkt94 (repositorio kkt94/Llama-V-JEPA-LM). Combina un codificador de vídeo congelado basado en V-JEPA 2.1 (ViT-L, un modelo del mundo) con el modelo de lenguaje Qwen3-1.7B mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El objetivo es que el modelo de lenguaje aprenda a leer la dinámica de una escena (dirección, velocidad, orden, estado) a partir de las representaciones que aporta el codificador del modelo del mundo.

El modelo se entrena con supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes equilibradas en respuestas cuya respuesta queda fijada por construcción y difiere solo en cómo cambia la escena. De este modo se evita la anotación humana nueva y se fuerza al modelo a razonar sobre movimiento y cambio temporal. Se entrenó sobre 4,60 millones de muestras públicas y declara una media de 66,02 en 12 métricas sobre 11 benchmarks de vídeo.

Es relevante porque demuestra que un modelo de 2.032 millones de parámetros (clase 2B) puede superar a alternativas abiertas del mismo tamaño en tareas de comprensión temporal de vídeo, con un coste de prefill muy bajo: 1.024 tokens visuales por clip a cualquier resolución, 3,3 TFLOPs y 22 ms en una H100 según el autor. La licencia Apache-2.0 y el formato safetensors facilitan su evaluación e integración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3-1.7B (transformer) con codificador de vídeo congelado V-JEPA 2.1 (ViT-L) unido mediante un puente espectral; 1.024 tokens visuales por clip de 32 fotogramas |
| Parámetros totales | 2.032.915.456 (2,03B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

La arquitectura acopla un codificador de vídeo V-JEPA 2.1 basado en ViT-L, que permanece congelado, con el modelo de lenguaje Qwen3-1.7B. Un puente espectral proyecta las representaciones del codificador de vídeo al espacio del modelo de lenguaje, de forma que cada clip de 32 fotogramas se comprime en 1.024 tokens visuales independientemente de la resolución de entrada. Esto reduce drásticamente el coste de prefill: según el autor, 3,3 TFLOPs y 22 ms por clip en una H100.

El entrenamiento emplea supervisión contrafactual sobre 4,60 millones de muestras públicas. Se aplican transformaciones de píxel a vídeos públicos para generar variantes con respuestas equilibradas, fijadas por construcción y que difieren únicamente en la dinámica de la escena (dirección, orden, posición, velocidad, conteo y finalización). Así el modelo aprende a explotar la información dinámica del codificador del modelo del mundo sin necesidad de anotación humana adicional. No se detalla en la información disponible si hubo RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en modo texto-vídeo-a-texto.
- Razonamiento sobre movimiento y cambio temporal: dirección, orden, posición, velocidad, conteo y finalización de acciones.
- Comprensión de relaciones temporales entre fotogramas y clips.
- Extracción de características (feature-extraction) a partir de vídeo.
- Capacidades de modelo del mundo heredadas del codificador V-JEPA 2.1.
- Capacidades lingüísticas generales de Qwen3-1.7B (generación de texto, razonamiento y código), aunque la información disponible no las valida específicamente en este fine-tuning.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Moderación y análisis de contenido audiovisual: el modelo puede responder preguntas sobre lo que ocurre en un clip (orden de acciones, dirección del movimiento) con 1.024 tokens por clip, lo que permite procesar lotes grandes de vídeo con coste de prefill reducido.
- Indexado y búsqueda semántica de vídeo: generar descripciones y respuestas sobre segmentos de 32 fotogramas para enriquecer metadatos y permitir búsquedas por dinámica (por ejemplo, "persona que gira a la derecha y se detiene").
- Control de calidad en pipelines de vídeo: verificar automáticamente si una secuencia cumple un guion de movimientos (dirección, velocidad, orden) gracias al entrenamiento contrafactual en estas dimensiones.
- Análisis de vídeo de vigilancia o tráfico: responder preguntas sobre trayectorias, sentido de circulación y secuencias de eventos en clips cortos.
- Investigación en modelos del mundo: usar el modelo como banco de pruebas para estudiar cómo las representaciones de V-JEPA 2.1 se traducen en razonamiento temporal dentro de un modelo de lenguaje.
- Evaluación comparativa de modelos de vídeo: servir como referencia compacta (clase 2B) en benchmarks como MVBench, PerceptionTest o NExT-QA, con métricas publicadas por el autor.
- Demostraciones interactivas en navegador: el autor publica una demo ZeroGPU con la variante de 8B, lo que sugiere viabilidad de despliegue ligero para pruebas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en tareas de video question answering:

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

El autor declara una media de 66,02 en las 12 métricas, frente a 52,45 de Qwen3-VL-2B, y una media de 95,0 en seis conjuntos retenidos (frente a 43,8 de Qwen3-VL-2B, con azar en 33,3). Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,03B parámetros, en FP16 se sitúa en torno a 4-5 GB para los pesos, más el codificador de vídeo y las activaciones (el repositorio ocupa 4,1 GB).
- GPU recomendadas: el autor cita una H100 para la medición de prefill (22 ms por clip, 3,3 TFLOPs); GPU de gama alta tipo A100 también son adecuadas.
- GPU de consumo: por tamaño, es probable que quepa en RTX 4090 y GPUs con 8-16 GB de VRAM, aunque la información disponible no confirma cifras exactas ni el coste del codificador ViT-L.
- Opciones de despliegue: transformers con custom_code (requisito de la model card); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 22 ms de prefill por clip de 32 fotogramas en una H100 según el autor; no se publican cifras de decodificación ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-1.7B | 2,03B | No disponible | 66,02 (declarado) | Apache-2.0 | Hugging Face |
| Qwen3-VL-2B | Clase 2B | No disponible | 52,45 (declarado por el autor) | No disponible en la información | No disponible en la información |
| Llama-V-JEPA-LM-Llama3.1-8B | Clase 8B | No disponible | No disponible | No disponible en la información | Demo en Hugging Face Spaces |

No se dispone de datos suficientes en la información proporcionada para comparar con otras alternativas de la misma categoría (por ejemplo, otros modelos de vídeo de 2B) más allá de las referencias del propio autor.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está validado.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con vídeos públicos, puede heredar sesgos de esos datos.
- Alucinación: no se cuantifica el riesgo de alucinación en las respuestas sobre vídeo; los benchmarks declarados no lo miden.
- Contexto: la longitud de contexto del modelo de lenguaje no se especifica en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el nombre "Llama" se debe a que los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, cuya licencia exige el prefijo "Llama"; conviene revisar las condiciones de esos datos antes de un uso comercial.
- Verificación: los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Dependencia de código personalizado: requiere custom_code en transformers, lo que puede complicar el despliegue en entornos estándar.
- Rendimiento limitado en tareas de razonamiento temporal fino: TOMATO (50,9), MotionBench (54,3) y Vinoground video (50,8) muestran margen de mejora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-1.7B
- Paper: https://arxiv.org/abs/2611.17831
- Código y informe técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en el navegador (variante 8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
