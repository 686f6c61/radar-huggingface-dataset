# Anivarth/anlp-assignment1-c1-byte300-aligned

## Resumen

El modelo `Anivarth/anlp-assignment1-c1-byte300-aligned` es un transformer encoder-decoder implementado desde cero como parte de la asignatura Advanced NLP (ANLP) de la Universidad Carnegie Mellon (CMU), concretamente para el primer ejercicio del curso. El autor, Anivarth, desarrolló una arquitectura personalizada con posiciones sinusoidales, atención multi-cabeza, pre-LayerNorm y una tokenización subpalabra BPE a nivel de byte construida manualmente. Con aproximadamente 11,2 millones de parámetros, el modelo está diseñado para resolver tareas de secuencia a secuencia, aunque los resultados obtenidos en las métricas de evaluación son muy limitados.

La relevancia de este modelo es principalmente educativa: demuestra cómo se construye un transformer completo desde cero, incluyendo la implementación de componentes como la atención y la tokenización, y sirve como base para estudios de ablación y comparación de arquitecturas. No está pensado para uso en producción ni para aplicaciones reales, sino como ejercicio académico dentro del programa de ANLP de CMU. El repositorio contiene únicamente el archivo de pesos `best_model.pt` y la información de rendimiento de la prueba con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con posiciones sinusoidales, multi-head attention y pre-LayerNorm |
| Parametros totales | 11.214.124 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en formato PyTorch) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clásico, implementado íntegramente desde cero. La arquitectura utiliza posiciones sinusoidales fijas en lugar de embeddings posicionales aprendidos, atención multi-cabeza estándar y normalización pre-LayerNorm (pre-LN) para estabilizar el entrenamiento. La tokenización se realiza mediante un BPE a nivel de byte (byte-level BPE) construido manualmente, sin depender de librerías externas de tokenización. El decodificador tiene una dimensión de modelo de 256 y 4 capas, según se menciona en la comparativa con otro modelo de la misma asignatura.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el procedimiento de optimización (si se usó RLHF, DPO o simplemente entrenamiento supervisado estándar). La única información disponible es la pérdida de validación final (`best_validation_loss: 2.193132`) y las métricas obtenidas con decodificación greedy. El modelo fue entrenado como parte de la tarea 1 de ANLP, que se centra en implementar los componentes básicos de un transformer desde cero.

## Capacidades

- Generación de texto secuencia a secuencia: el modelo puede producir salidas de texto a partir de entradas, aunque con una calidad muy limitada (BLEU de 0,15 y ROUGE-1 de 0,13).
- Tokenización BPE a nivel de byte: implementa un tokenizador propio que opera sobre bytes, lo que permite manejar cualquier texto sin depender de vocabularios predefinidos.
- Razonamiento y código: no hay evidencia de capacidades específicas en razonamiento, generación de código o matemáticas más allá de la tarea de traducción o transformación de secuencias para la que fue entrenado.
- Tool calling y agentes: no soporta ninguna de estas funcionalidades.
- Multilingüismo: no hay información sobre los idiomas soportados ni sobre su capacidad multilingüe.
- Modos especiales (thinking, visión, audio): no aplica.

## Casos de uso

- Ejercicio académico de implementación de transformers: el modelo sirve como referencia para estudiantes que necesitan ver una implementación completa de un encoder-decoder con posiciones sinusoidales y pre-LayerNorm, incluyendo el tokenizador BPE.
- Estudios de ablación en arquitecturas: al ser un modelo pequeño y de código abierto (aunque sin licencia explícita), se puede utilizar para comparar el efecto de diferentes componentes, como el número de capas o la dimensión del modelo, tal como se hace en otros trabajos de la misma asignatura.
- Análisis de errores en decodificación greedy: las métricas muestran que la precisión de secuencia es 0, lo que permite estudiar por qué la decodificación greedy falla en tareas de generación y explorar alternativas como beam search.
- Evaluación de métricas de similitud de texto: se pueden emplear las salidas del modelo para probar métricas como BLEU, ROUGE y Levenshtein en un entorno controlado.
- Demostración de entrenamiento de un modelo pequeño en hardware limitado: con solo 11 millones de parámetros, el modelo puede entrenarse en una GPU de consumo o incluso en CPU, lo que lo hace útil para prácticas de laboratorio.
- Comparación de tokenizadores: la implementación del BPE a nivel de byte puede compararse con tokenizadores estándar como SentencePiece o BPE de HuggingFace para analizar el impacto en el rendimiento final.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas obtenidas con decodificación greedy sobre el conjunto de prueba:

| Metrica | Valor |
|---|---|
| bit_accuracy | 0.633670 |
| sequence_accuracy | 0.000000 |
| levenshtein_distance | 457.302000 |
| bleu | 0.149689 |
| rouge1 | 0.131599 |
| rouge2 | 0.015977 |
| rougeL | 0.116996 |
| best_validation_loss | 2.193132 |

No se han publicado comparaciones con otros modelos en la información disponible. La precisión de secuencia es cero, lo que indica que ninguna secuencia generada coincide exactamente con la referencia. La distancia de Levenshtein media de 457 caracteres sugiere que las salidas son notablemente diferentes de las esperadas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 11,2 millones de parámetros. En FP32 (4 bytes por parámetro) ocupa aproximadamente 45 MB, por lo que cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- GPU recomendadas: cualquier GPU moderna, incluyendo tarjetas de consumo como la RTX 3060 o superiores. También puede ejecutarse en CPU con memoria RAM estándar.
- Compatibilidad con GPU de consumo: sí, es un modelo muy ligero que cabe incluso en GPUs integradas.
- Opciones de despliegue: el formato nativo es PyTorch (`.pt`). No se han proporcionado versiones en GGUF, ONNX ni adaptaciones para vLLM, llama.cpp u Ollama. Para utilizarlo habría que cargarlo con el código de la asignatura.
- Latencia y throughput: no se dispone de datos, pero al ser un modelo pequeño la inferencia es rápida en cualquier hardware moderno, probablemente del orden de milisegundos por secuencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (BLEU) | Licencia | Formato |
|---|---|---|---|---|---|
| Anivarth/anlp-assignment1-c1-byte300-aligned | 11,2M | no disponible | 0,15 | no disponible | PyTorch |
| yharith/anlp-a1-transformer-ablation | 3,47M | no disponible | no disponible | no disponible | no disponible |
| Modelos transformer estándar de la misma tarea (p. ej. T5-small) | 60M | 512 | ~20-30 en tareas similares | Apache 2.0 | Safetensors, etc. |

El modelo se enmarca dentro de los trabajos de la asignatura ANLP de CMU. La comparativa con el modelo de ablación de yharith muestra que este último tiene menos parámetros (3,47M) porque prescinde de embeddings y proyecciones de salida, pero no se han publicado sus métricas de rendimiento. Frente a modelos como T5-small, el rendimiento es mucho menor, esperable por tratarse de un ejercicio académico.

## Limitaciones y advertencias

- Rendimiento muy bajo: la precisión de secuencia es 0 y el BLEU es de 0,15, lo que indica que el modelo no genera salidas útiles para tareas reales.
- No apto para producción: no debe utilizarse en ningún sistema operativo o aplicación comercial.
- Sesgos y alucinaciones: no se han evaluado, pero por su tamaño y entrenamiento limitado es probable que presente alucinaciones frecuentes y sesgos derivados de los datos de entrenamiento, que no se han documentado.
- Limitaciones de contexto e idioma: no se especifica la longitud máxima de contexto ni los idiomas soportados, por lo que se desconocen sus límites.
- Licencia y uso comercial: no hay licencia declarada, lo que impide su uso comercial sin autorización explícita del autor.
- Dependencia del código de la asignatura: el modelo solo puede cargarse con la arquitectura y los tokenizadores del código del assignment, que no se han publicado en el repositorio de HuggingFace.
- Datos de entrenamiento desconocidos: no se informa sobre el corpus utilizado, lo que impide evaluar posibles sesgos o limitaciones de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anivarth/anlp-assignment1-c1-byte300-aligned
- Página de la asignatura ANLP F2025 de CMU (referencia de la tarea): https://cmu-l3.github.io/anlp-fall2025/assignments/assignment1
- Modelo de ablación relacionado: https://huggingface.co/yharith/anlp-a1-transformer-ablation
