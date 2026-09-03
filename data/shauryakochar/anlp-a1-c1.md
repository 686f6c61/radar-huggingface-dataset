# shauryakochar/anlp-a1-c1

## Resumen

El modelo `shauryakochar/anlp-a1-c1` es un transformer encoder-decoder de 7,77 millones de parámetros, construido íntegramente con operaciones básicas de PyTorch (sin usar `nn.Transformer`, `nn.MultiheadAttention` ni `nn.LayerNorm`). Fue desarrollado por Shaurya Kochar como parte de la asignatura ANLP (Advanced Natural Language Processing, probablemente el curso 11-711 de CMU) y está diseñado para una tarea concreta: mapear secuencias binarias cifradas a texto plano.

El modelo representa un ejercicio académico de implementación y ablación de arquitecturas transformer. Su relevancia radica en que demuestra cómo construir un transformer funcional desde cero, con atención multi-cabeza, normalización por capas y embeddings sinusoidales, y en que publica métricas detalladas de rendimiento sobre su tarea específica. No es un modelo de propósito general, sino un artefacto de investigación y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sin `nn.Transformer`, implementado desde cero) |
| Parametros totales | 7.767.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (trabaja con secuencias binarias de longitud fija o variable no especificada) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión completa) |
| Idiomas soportados | no disponible (la tarea es descifrado de secuencias binarias, no procesamiento de lenguaje natural general) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (archivo `C1.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer estándar encoder-decoder, pero implementada manualmente con operaciones de bajo nivel de PyTorch. Incluye atención multi-cabeza (MHA), normalización por capas (LayerNorm) y embeddings posicionales sinusoidales. El tokenizador emplea codificación por pares de bytes (BPE). La configuración se denomina "C1 - base" y forma parte de un estudio de ablación más amplio (el repositorio contiene otras configuraciones).

El entrenamiento se realizó durante aproximadamente 3.110 segundos (unos 52 minutos), con un tiempo medio de 44,4 segundos por época. El pico de memoria durante el entrenamiento fue de 1.336,9 MB. No se especifican el número de épocas, el tamaño del dataset ni el tipo de cifrado de las secuencias binarias. La evaluación se realizó con decodificación greedy.

## Capacidades

- Descifrado de secuencias binarias cifradas a texto plano, con una precisión de secuencia del 92,76% en el conjunto de test.
- Generación de texto plano a partir de entradas binarias codificadas.
- Implementación didáctica de un transformer completo sin dependencias de alto nivel, útil para estudiar el funcionamiento interno de la arquitectura.
- Soporte de decodificación greedy (no se menciona beam search ni sampling).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Estudio académico de arquitecturas transformer: el modelo sirve como ejemplo de implementación desde cero, permitiendo a estudiantes e investigadores analizar cómo funcionan la atención multi-cabeza, la normalización por capas y los embeddings posicionales sin abstracciones de bibliotecas de alto nivel.
- Experimentos de ablación: al ser parte de una serie de configuraciones (C1, C2, etc.), permite comparar el impacto de distintas componentes (por ejemplo, sustituir sinusoidales por posiciones aprendidas, o cambiar el tokenizador) sobre el rendimiento en una tarea de secuencia a secuencia.
- Investigación sobre descifrado de secuencias: el modelo demuestra que un transformer pequeño puede aprender a invertir un cifrado binario simple, lo que puede servir como banco de pruebas para estudiar la capacidad de los transformers para aprender transformaciones deterministas.
- Docencia en procesamiento del lenguaje natural: el código y las métricas publicadas son un recurso valioso para cursos que enseñan a implementar transformers desde cero.
- Reproducción de resultados: al estar publicados los pesos y el código, otros investigadores pueden reproducir los experimentos y verificar las métricas reportadas.
- Benchmark de eficiencia: con solo 7,7 millones de parámetros y un pico de memoria de 1,3 GB, puede utilizarse para medir el rendimiento de diferentes backends de inferencia en hardware modesto.

## Benchmarks y rendimiento

El autor proporciona métricas de test obtenidas con decodificación greedy. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas generales de lenguaje.

| Metrica | Valor |
|---|---|
| Precisión de bit (test) | 0,9938 |
| Precisión de carácter (test) | 0,9845 |
| Precisión de secuencia (test) | 0,9276 |
| Distancia de Levenshtein (test) | 0,1231 |
| Distancia de Levenshtein normalizada | 0,0020 |
| BLEU (test) | 0,9837 |
| ROUGE-L (test) | 0,9918 |

Estas métricas indican un rendimiento muy alto en la tarea específica de descifrado, con una tasa de error de secuencia inferior al 8%. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene solo 7,77 millones de parámetros, por lo que en FP32 ocupa aproximadamente 31 MB de memoria. Cabe en cualquier GPU moderna, incluso en GPUs integradas o en CPU.
- El pico de memoria durante el entrenamiento fue de 1.336,9 MB, lo que indica que puede entrenarse en una GPU con 2 GB de VRAM o menos.
- Para inferencia, cualquier GPU con al menos 1 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas.
- No se han publicado requisitos específicos de latencia o throughput. Dado el tamaño, la inferencia es prácticamente instantánea en hardware moderno.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, o exportarse a ONNX para ejecución en otros entornos. No se han publicado integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría. Este es un modelo de investigación con una tarea muy específica (descifrado de secuencias binarias) y un tamaño extremadamente reducido. No existen alternativas públicas conocidas que aborden exactamente la misma tarea con la misma configuración. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales de procesamiento de lenguaje natural.
- Tarea restringida: solo funciona con el tipo específico de secuencias binarias cifradas con las que fue entrenado. No se especifica el algoritmo de cifrado ni el dominio de aplicación.
- Sin datos de generalización: no se ha evaluado su capacidad para manejar secuencias de longitud diferente a las del entrenamiento, ni cifrados distintos.
- Riesgo de alucinación: al ser un modelo secuencia a secuencia, puede producir salidas incorrectas cuando la entrada está fuera de distribución, aunque las métricas de test son altas.
- Sesgos: no se ha evaluado ningún sesgo, dado que la tarea no involucra lenguaje natural.
- Documentación incompleta: no se especifican el dataset de entrenamiento, el número de épocas, el tamaño del lote ni otros hiperparámetros clave, lo que dificulta la reproducibilidad completa.
- Licencia MIT: permite uso comercial y modificación, pero al ser un trabajo académico, no se ofrecen garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shauryakochar/anlp-a1-c1
- Código fuente: https://github.com/shaurya-kochar/anlp-assignment1
- Registro de experimentos (WandB): https://wandb.ai/shaurya-kochar-iiit-hyderabad/anlp-a1-transformer-ablation
- Perfil del autor: https://huggingface.co/shauryakochar
