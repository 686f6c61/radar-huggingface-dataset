# ethicalabs/Echo-SmolTools-114M-NSFW-CLF

## Resumen

Echo-SmolTools-114M-NSFW-CLF es un modelo de clasificación de texto binario (Safe/NSFW) desarrollado por ethicalabs, basado en la arquitectura Echo-DSRN (Dual State Recurrent Neural Network). Se trata de un modelo experimental de 98,3 millones de parámetros reales (denominado 114M por su base), diseñado específicamente para tareas de moderación de contenido en entornos de bajos recursos. Su relevancia radica en ofrecer una alternativa ligera a los grandes modelos de lenguaje (LLMs) para tareas estrechas y bien definidas, como la detección de contenido no apropiado, con un coste computacional mínimo.

El modelo se construye fusionando el modelo base `ethicalabs/Echo-DSRN-114M-v0.1.2` con un adaptador PEFT (`Echo-SmolTools-114M-NSFW-CLF-PEFT`). La cabeza de clasificación se siembra a partir de las filas del `lm_head` correspondientes a los tokens de las etiquetas, y el template de chat usado durante el entrenamiento queda integrado en `config.json`, aplicándose automáticamente mediante el método `classify()`. Requiere `trust_remote_code=True` para cargar la arquitectura personalizada.

A pesar de su tamaño reducido, el modelo está pensado únicamente para evaluación académica e investigación, con restricciones explícitas de uso en producción. Su licencia declarada es Apache 2.0, aunque los metadatos de Hugging Face no la confirman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EchoForSequenceClassification (basada en Echo-DSRN, red recurrente híbrida) |
| Parametros totales | 98.265.090 (98,3M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (dtype de trabajo: bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según model card, no confirmado en metadatos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echo-SmolTools-114M-NSFW-CLF se basa en la arquitectura Echo-DSRN, una red recurrente híbrida diseñada para tareas estrechas y de bajo coste. La arquitectura combina estados recurrentes duales con mecanismos de atención, optimizada para clasificación de secuencias. El modelo se obtiene fusionando el checkpoint base `Echo-DSRN-114M-v0.1.2` con un adaptador PEFT específico para clasificación NSFW. La cabeza de clasificación se inicializa a partir de las representaciones del `lm_head` correspondientes a los tokens de etiqueta ("Safe" y "NSFW"), lo que permite un ajuste eficiente con pocos parámetros.

El entrenamiento incluye un template de chat que queda incrustado en `config.json` y se aplica automáticamente en el método `classify()`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.). Al ser un modelo experimental, la documentación disponible es limitada y se centra en el uso técnico más que en el proceso de entrenamiento.

## Capacidades

- Clasificación binaria de texto en dos categorías: "Safe" y "NSFW".
- Clasificación de secuencias completas, no generación de texto.
- Inferencia de bajo coste gracias a su tamaño reducido (98,3M parámetros).
- Soporte de clasificación con template de chat integrado, aplicado automáticamente.
- Requiere código personalizado (`trust_remote_code=True`) para cargar la arquitectura.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.
- Capacidades multilingües no documentadas; probablemente limitadas al inglés u otros idiomas del dataset base no especificado.

## Casos de uso

- Investigación académica en moderación de contenido: el modelo puede utilizarse en estudios comparativos sobre detección de NSFW en textos, gracias a su tamaño reducido y su facilidad de ejecución en hardware modesto.
- Prototipado de sistemas de filtrado de contenido: aunque no está recomendado para producción, sirve como prueba de concepto para pipelines de moderación en plataformas de bajo tráfico o entornos de desarrollo.
- Evaluación de arquitecturas recurrentes híbridas: permite analizar el rendimiento de Echo-DSRN frente a modelos transformer clásicos en tareas de clasificación de texto.
- Benchmarking de eficiencia: útil para medir latencia y consumo de memoria en dispositivos edge o CPU, dado su pequeño tamaño (98M parámetros).
- Educación y formación: adecuado para demostrar técnicas de fine-tuning con adaptadores PEFT y clasificación de secuencias en frameworks como Hugging Face Transformers.
- Experimentación con cabezas de clasificación derivadas de `lm_head`: el enfoque de sembrado de pesos puede replicarse en otros modelos para investigar transferencia de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas oficiales de precisión, recall, F1 ni comparaciones con otros modelos de clasificación NSFW.

## Requisitos de hardware

- VRAM estimada: aproximadamente 196 MB para pesos en bfloat16 (98,3M × 2 bytes), más overhead de activaciones y código. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 10xx o superior, RTX 20xx/30xx/40xx) o incluso CPU sola para inferencia en lote pequeño.
- Compatible con CPU: sí, con baja latencia gracias al tamaño reducido.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`. No se mencionan soporte para vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es personalizada y requiere el código de Echo-DSRN.
- Latencia y throughput: no disponibles, pero se espera que sea muy rápido en hardware moderno (inferencia en milisegundos para textos cortos).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación NSFW de tamaño similar. Alternativas genéricas de clasificación de texto de pequeño tamaño (por ejemplo, DistilBERT-base-uncased con 66M parámetros, o MiniLM de 22M) podrían servir como referencia, pero no hay datos de rendimiento específicos para esta tarea. La arquitectura recurrente híbrida de Echo-DSRN es poco común, lo que dificulta la comparación directa con modelos transformer estándar.

## Limitaciones y advertencias

- Modelo experimental: la model card advierte explícitamente que no debe desplegarse en entornos comerciales, empresariales o de misión crítica bajo ninguna circunstancia.
- Sin garantías: se proporciona "tal cual", sin responsabilidad por fallos de integración, incumplimiento regulatorio o consecuencias derivadas de su uso no autorizado.
- Riesgo de alucinación y sesgos: al ser un clasificador, el riesgo de alucinación es menor que en modelos generativos, pero los sesgos del dataset de entrenamiento pueden propagarse a las predicciones.
- Licencia ambigua: aunque la model card muestra un badge Apache 2.0, los metadatos de Hugging Face no confirman la licencia; se recomienda verificar antes de cualquier uso.
- Requiere `trust_remote_code=True`: esto implica ejecutar código arbitrario del repositorio, lo que conlleva riesgos de seguridad si el código no es auditado.
- Idiomas no especificados: no se garantiza el rendimiento en idiomas distintos del inglés o los incluidos en el dataset base.
- Sin soporte para producción: no hay mantenimiento, actualizaciones ni canal de soporte oficial para despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethicalabs/Echo-SmolTools-114M-NSFW-CLF
- Modelo base: https://huggingface.co/ethicalabs/Echo-DSRN-114M-v0.1.2
- Adaptador PEFT: https://huggingface.co/ethicalabs/Echo-SmolTools-114M-NSFW-CLF-PEFT
- Repositorio GitHub: https://github.com/ethicalabs-ai/Echo-DSRN/
- Working Paper: https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md
- Colección Echo-DSRN: https://huggingface.co/collections/ethicalabs/echo-dsrn
- Colección Echo-Hybrid: https://huggingface.co/collections/ethicalabs/echo-dsrn-hybrid
- Ejemplo de clasificación (intents): https://raw.githubusercontent.com/ethicalabs-ai/Echo-DSRN/refs/heads/main/examples/classify_dsrn_gen.py
