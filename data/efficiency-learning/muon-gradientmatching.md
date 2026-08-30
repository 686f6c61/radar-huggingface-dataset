# efficiency-learning/muon-gradientMatching

## Resumen

El repositorio `efficiency-learning/muon-gradientMatching` contiene una colección de modelos Qwen2.5-0.5B preentrenados desde cero sobre el subconjunto `openwebtext-100k`, generados en el marco de los experimentos Mu-GREATS de selección de subconjuntos y de emparejamiento de gradientes con el optimizador Muon. Cada subcarpeta del repositorio corresponde a una ejecución distinta con un optimizador (AdamW o Muon) y una tasa de aprendizaje específica, lo que permite estudiar el impacto de estos hiperparámetros en el preentrenamiento de modelos pequeños.

La relevancia de este trabajo radica en la creciente atención que está recibiendo el optimizador Muon, que ha demostrado en estudios recientes una eficiencia computacional aproximadamente el doble que AdamW en entrenamiento a escala óptima. Este repositorio ofrece una oportunidad para analizar de forma controlada cómo se comporta Muon frente a AdamW en un escenario de preentrenamiento desde cero con un modelo pequeño, aunque el tamaño del dataset y el número de pasos son limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-0.5B) |
| Parámetros totales | 0.5B (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (sin especificar precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los modelos se basan en la arquitectura Qwen2.5-0.5B, un transformer decoder estándar con atención causal. Se preentrenan desde cero sobre `openwebtext-100k`, un subconjunto del dataset OpenWebText que contiene aproximadamente 100 000 documentos (no se especifica el número de tokens). El entrenamiento se realiza con dos optimizadores: AdamW y Muon, cada uno con varias tasas de aprendizaje (desde 5e-05 hasta 0.005). El número de pasos de entrenamiento es fijo en 6317 para todas las ejecuciones, lo que sugiere un entrenamiento relativamente corto. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

La innovación principal es el uso del optimizador Muon, que ortogonaliza las actualizaciones de gradiente mediante la descomposición de Newton-Schulz, mejorando la eficiencia de datos y de cómputo en comparación con AdamW. Los experimentos incluyen también una variante con selección aleatoria de subconjuntos (`random_muon_lr0.001`) para comparar con la selección basada en Mu-GREATS.

## Capacidades

- Generación de texto básica: al ser un modelo pequeño preentrenado desde cero, puede generar texto coherente a corto plazo, pero con limitaciones en coherencia a largo plazo y conocimiento del mundo.
- Razonamiento limitado: no se han reportado capacidades específicas de razonamiento, matemáticas o código.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades multimodales: solo texto.
- Multilingüismo: no se especifica, pero al estar preentrenado en OpenWebText (mayoritariamente inglés), es probable que funcione principalmente en inglés.

## Casos de uso

- Investigación en optimizadores: permite comparar empíricamente el comportamiento de AdamW y Muon en condiciones controladas, variando la tasa de aprendizaje y el método de selección de subconjuntos.
- Estudio de dinámicas de preentrenamiento: analizar cómo afecta el optimizador a la pérdida, la convergencia y la calidad de las representaciones en un modelo pequeño.
- Validación de técnicas de selección de datos: la variante `random_muon_lr0.001` sirve como línea base para evaluar la selección de subconjuntos basada en Mu-GREATS.
- Reproducibilidad de experimentos: al estar disponibles los pesos en subcarpetas separadas, se pueden reproducir los resultados y extender los análisis.
- Educación y divulgación: útil para demostrar conceptos de optimización y preentrenamiento en entornos académicos.
- Desarrollo de herramientas de evaluación: se puede usar como modelo de juguete para probar pipelines de evaluación o de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para estos modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 0.5B en precisión fp16, la memoria necesaria para los pesos es de aproximadamente 1 GB. Con contexto y activaciones, se puede necesitar entre 2 y 4 GB, dependiendo de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. También es viable en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: se puede cargar con la librería `transformers` usando `AutoModelForCausalLM` y `AutoTokenizer`, indicando la subcarpeta correspondiente. También es compatible con vLLM, TGI y Ollama, aunque no se ha verificado explícitamente.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 0.5B puede generar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 0.5B | 32K (típico) | Apache 2.0 | Modelo base generalista |
| Muon-gradientMatching (este repo) | 0.5B | no disponible | no disponible | Experimentos de optimización |
| TinyLlama-1.1B | 1.1B | 2K | Apache 2.0 | Modelo pequeño para investigación |

La comparación directa no es posible por falta de datos de rendimiento. El modelo original Qwen2.5-0.5B tiene una licencia permisiva y un contexto mayor, mientras que este repositorio se centra en el estudio del optimizador, no en ofrecer un modelo listo para producción.

## Limitaciones y advertencias

- Modelo muy pequeño (0.5B) y preentrenado en un dataset reducido (100k documentos), lo que limita su capacidad de generación y conocimiento.
- El entrenamiento se detuvo en 6317 pasos, probablemente insuficiente para converger completamente.
- No se especifica la licencia, por lo que el uso comercial es incierto.
- No se han publicado benchmarks ni evaluaciones de calidad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto experimental sin validación externa.
- Los idiomas soportados no están documentados; es probable que el modelo funcione mejor en inglés.
- Riesgo de alucinaciones y errores factuales debido al pequeño tamaño y al entrenamiento limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/efficiency-learning/muon-gradientMatching
- Paper sobre eficiencia práctica de Muon: https://arxiv.org/abs/2505.02222
- Explicación visual del optimizador Muon: https://vizuaraai.github.io/vizuara-ai-daily/muon-optimizer/
- Notas sobre Muon y su escalado: https://calwoo.github.io/notes/papers/muon-optimizer/index.html
