# bugkira-ai/babylm-paragru-20m

## Resumen

`bugkira-ai/babylm-paragru-20m` es un modelo de lenguaje causal de 19,65 millones de parámetros desarrollado por el equipo `bugkira-ai` en el marco de la iniciativa BabyLM 2026. El modelo implementa la arquitectura ParaGRU, una RNN no lineal con compuertas de actualización, reinicio y candidato (Cho et al., 2014) que incorpora computación paralela mediante álgebra simbólica. Se ha entrenado con el corpus Strict-Small de BabyLM (aproximadamente 10 millones de palabras) en inglés, con una ventana de contexto de 512 tokens y un vocabulario BPE de 16.000 subpalabras.

Su relevancia radica en que pertenece al esfuerzo BabyLM, cuyo objetivo es estudiar el aprendizaje de lenguaje natural a partir de datos limitados. El modelo emplea una pila residual de 6 capas pre-LN con SwiGLU y destaca por su innovación técnica: el uso del método de Newton con K=3 para fusionar la computación secuencial de las RNN, lo que permite acelerar el entrenamiento sin perder la naturaleza no lineal. Según la model card, alcanza una perplejidad de validación de 95,80 tras 3 épocas y obtiene una puntuación BLiMP de 63,31 en evaluación zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ParaGRU (RNN con compuertas diagonales) con SwiGLU residual, 6 capas pre-LN |
| Parametros totales | 19.656.192 (según model card); 25.800.192 (según metadatos de HuggingFace) |
| Longitud de contexto | 512 tokens (posiciones absolutas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, requiere código personalizado (`trust_remote_code=True`) y la librería `pararnn-torch` |

## Arquitectura y entrenamiento

La arquitectura combina una capa de tipo GRU cuyas matrices recurrentes son diagonales (vectores `a_z`, `a_r`, `a_n`), lo que reduce el coste de la recurrencia, con una pila residual de 6 bloques pre-LN que usan SwiGLU como función de activación en la MLP. El modelo se implementa con el método de Newton iterado K=3 para resolver la recurrencia no lineal de forma paralela, junto con un `max_recurrent_norm=0.5` que estabiliza el entrenamiento. Fue entrenado con el corpus BabyLM 2026 Strict-Small, compuesto por alrededor de 10 millones de palabras en inglés. El empaquetado de secuencias se realizó con ventanas consecutivas de 512 tokens, lo que genera 19.275 filas de entrenamiento. Se utilizaron 3 épocas, con 1809 pasos totales y una tasa de aprendizaje en coseno de 6e-4, optimizador AdamW (β=(0.9, 0.95), weight decay 0.01, clip 1.0). El entrenamiento se completó en aproximadamente 16,3 minutos en una NVIDIA GeForce RTX 2080 Ti, con un throughput sostenido de ~38.518 tokens/s y un pico de VRAM de 3,77 GiB. No se aplicó RLHF, DPO ni ningún tipo de ajuste por preferencias; se trata de un modelo de lenguaje causal preentrenado.

## Capacidades

- Generación de texto causal en inglés, tanto condicionada como libre.
- Modelado de lenguaje con vocabulario BPE de 16.000 subpalabras.
- Evaluación en tareas lingüísticas de la batería BabyLM: BLiMP, BLiMP Supplement, EWoK, Entity Tracking y COMPS.
- Soporte de generación con `model.generate()` a través de Transformers.
- No soporta tool calling, function calling, visión, audio, ni razonamiento multi-paso en agentes.
- No es apto para conversación (chat) ni para contextos largos (más de 512 tokens).

## Casos de uso

- Investigación en eficiencia de arquitecturas RNN: el modelo sirve como banco de pruebas para comparar ParaGRU frente a otras variantes (ParaLSTM, ParaNLRU, ParaSLSTM) en el contexto de BabyLM, permitiendo analizar el compromiso entre velocidad de entrenamiento y calidad lingüística.
- Evaluación de hipótesis lingüísticas: al ser un modelo pequeño y monocromo, resulta útil para testar teorías sobre adquisición del lenguaje con corpus de tamaño limitado, mediante las tareas de BLiMP y sus suplementos.
- Prototipado de modelos de lenguaje embebidos: gracias a su reducido tamaño, puede integrarse en entornos de investigación donde los recursos de cómputo son escasos, siempre que la tarea no requiera contextos largos.
- Educación y docencia en aprendizaje automático: la arquitectura ParaGRU es un ejemplo didáctico de cómo se puede combinar una RNN no lineal con técnicas de computación simbólica para paralelizar la recurrencia.
- Experimentos de compresión y cuantización: al tratarse de un modelo pequeño con pesos en FP32, permite estudiar el efecto de reducciones de precisión sin necesidad de infraestructura costosa.
- Reproducibilidad académica: el código de entrenamiento y las configuraciones están publicados, lo que facilita replicar resultados y comparar con otros brazos del proyecto BabyLM.

## Benchmarks y rendimiento

Según la model card, los resultados zero-shot en el pipeline BabyLM 2026 son los siguientes. La tabla compara el modelo ParaGRU con sus hermanos de la misma familia y con un modelo GPT-2 de referencia.

| Tarea | ParaGRU | ParaLSTM | ParaNLRU | ParaSLSTM | GPT-2 Strict-Small |
|---|---:|---:|---:|---:|---:|
| BLiMP | 63,31 | 62,86 | 62,45 | 62,81 | 65,23 |
| BLiMP Supplement | 56,65 | 56,64 | 57,66 | 55,70 | 57,25 |
| EWoK | 49,45 (fast) | 49,36 (fast) | 50,18 (fast) | 47,36 (fast) | 50,63 (full) |
| Entity Tracking | 18,45 | 18,02 | 18,15 | 17,36 | 19,10 |
| COMPS | 50,45 | 50,87 | 50,32 | 50,79 | 51,81 |

La perplejidad de validación reportada (PPL) tras 3 épocas es de 95,80. En la sección de lectura se mencionan métricas de eye-tracking (0,65) y self-paced reading (0,03). No se han publicado resultados para GlobalPIQA, SuperGLUE finetune ni AoA.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA GeForce RTX 2080 Ti (Compute Capability 7.5) con pico de VRAM de 3,77 GiB y throughput de ~38.518 tokens/s.
- No se especifican cifras de VRAM para inferencia. Dado el bajo número de parámetros, se espera que quepa con holgura en cualquier GPU consumer moderna e incluso en CPU, aunque esto no está documentado en la información disponible.
- Para su ejecución es obligatorio usar Transformers con `trust_remote_code=True` y la librería `pararnn-torch`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput de inferencia no se han publicado; solo se dispone de la métrica de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLiMP (zero-shot) | Licencia |
|---|---|---:|---:|---|
| bugkira-ai/babylm-paragru-20m | 19,65 M | 512 | 63,31 | MIT |
| bugkira-ai/babylm-paralstm-20m | ~20 M (no especificado) | 512 | 62,86 | MIT |
| bugkira-ai/babylm-paranlru-19m | ~19 M (no especificado) | 512 | 62,45 | MIT |
| bugkira-ai/babylm-paraslstm-20m | ~20 M (no especificado) | 512 | 62,81 | MIT |
| GPT-2 Strict-Small (referencia) | ~124 M | 1024? (no especificado) | 65,23 | MIT (los pesos originales de GPT-2) |

La comparativa se basa en datos de la model card del modelo ParaGRU, que incluye resultados de sus hermanos y de GPT-2 Strict-Small. Los parámetros de los modelos hermanos se indican en sus identificadores (20m, 19m, 20m) y en la tabla de la model card no se aportan cifras exactas. No se dispone de modelos comparables fuera de esta familia en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe en inglés; no soporta otros idiomas.
- Ventana de contexto limitada a 512 tokens, insuficiente para tareas de contexto largo.
- No está diseñado para chat, instrucciones ni generación conversacional.
- Riesgo de alucinación, especialmente en generación libre, al tratarse de un modelo muy pequeño.
- Los sesgos del modelo no han sido evaluados; no hay evidencia de evaluación de equidad o toxicidad.
- Requiere código personalizado y dependencias específicas (`pararnn-torch`), lo que dificulta su despliegue en plataformas estándar.
- La discrepancia entre los 19,65 M de parámetros de la model card y los 25,80 M de los metadatos de HuggingFace no está explicada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/bugkira-ai/babylm-paragru-20m
- Paper ParaRNN (arXiv:2510.21450): https://arxiv.org/abs/2510.21450
- Paper BabyLM 2026 (arXiv:2602.20092): https://arxiv.org/abs/2602.20092
- Repositorio pararnn-torch: https://github.com/bugkira/pararnn-torch
- Pipeline de evaluación BabyLM: https://github.com/babylm-org/babylm-eval
- Modelo hermano ParaLSTM: https://huggingface.co/bugkira-ai/babylm-paralstm-20m
- Modelo hermano ParaNLRU: https://huggingface.co/bugkira-ai/babylm-paranlru-19m
- Modelo hermano ParaSLSTM: https://huggingface.co/bugkira-ai/babylm-paraslstm-20m
- PyPI pararnn-torch: https://pypi.org/project/pararnn-torch/
