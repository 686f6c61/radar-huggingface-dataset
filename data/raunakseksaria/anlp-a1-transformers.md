# RaunakSeksaria/anlp-a1-transformers

## Resumen

El modelo `RaunakSeksaria/anlp-a1-transformers` es un trabajo académico de la asignatura ANLP (Advanced Natural Language Processing) que implementa un transformer encoder-decoder entrenado desde cero para descifrar secuencias binarias cifradas mediante XOR, devolviendo texto plano en inglés. El autor, Raunak Seksaria, presenta un estudio de ablación controlado con cinco configuraciones arquitectónicas distintas, donde cada una modifica exactamente un componente respecto a la configuración base. El objetivo es analizar el impacto de cada decisión de diseño (posiciones sinusoidales frente a RoPE, atención multi-cabeza frente a grouped-query attention, LayerNorm frente a RMSNorm, y subword frente a token-free byte latent) en el rendimiento de la tarea.

El repositorio contiene cinco checkpoints (`c1_best.pt` a `c5_best.pt`) con los pesos, el estado del optimizador y el scheduler, lo que permite reanudar el entrenamiento. El modelo más destacado es la configuración C5, que alcanza una precisión perfecta (bit accuracy y sequence accuracy de 1.0) al emplear un transformer de latentes de bytes sin tokenización. Este trabajo es relevante para investigadores interesados en arquitecturas de transformers, ablaciones controladas y tareas de descifrado de secuencias, aunque no está pensado como un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (5 variantes: C1 base, C2 con RoPE, C3 con GQA, C4 con RMSNorm, C5 token-free byte latent) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | Inglés (tarea de descifrado de texto plano en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoints con estado del modelo, optimizador y scheduler) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de transformer encoder-decoder, implementada en PyTorch desde cero. La configuración base (C1) utiliza posiciones sinusoidales, atención multi-cabeza, LayerNorm y tokenización por subword. Las variantes modifican un único componente: C2 sustituye las posiciones sinusoidales por RoPE (Rotary Position Embeddings), C3 reemplaza la atención multi-cabeza por grouped-query attention (GQA), C4 cambia LayerNorm por RMSNorm, y C5 elimina la tokenización subword para operar directamente sobre latentes de bytes (token-free byte latent transformer).

No se especifican en la información disponible el número de capas, dimensiones ocultas, número de cabezas, tamaño del dataset de entrenamiento, número de tokens ni el método de optimización (aunque se menciona que los checkpoints incluyen estado de optimizador y scheduler). La tarea consiste en mapear una secuencia binaria cifrada con XOR a texto plano en inglés, lo que implica que el modelo aprende a invertir la operación XOR y a decodificar la representación binaria en caracteres legibles.

## Capacidades

- Descifrado de secuencias binarias cifradas con XOR: el modelo recibe una secuencia binaria y produce texto plano en inglés.
- Estudio de ablación: permite comparar el impacto de cinco decisiones arquitectónicas (RoPE, GQA, RMSNorm, token-free byte latent) sobre el rendimiento en la tarea.
- Reanudación de entrenamiento: los checkpoints guardan el estado completo del optimizador y scheduler, facilitando continuar el entrenamiento o hacer fine-tuning.
- Reproducibilidad: al ser un trabajo académico, el código está disponible en el repositorio de la asignatura (aunque no se incluye en el Hub).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo de investigación específico para una tarea concreta.

## Casos de uso

- Investigación en arquitecturas de transformers: permite analizar empíricamente cómo afectan RoPE, GQA, RMSNorm y la tokenización al rendimiento en una tarea de secuencia a secuencia. Un investigador puede cargar cada checkpoint y comparar las métricas de la tabla de resultados.
- Estudio de ablaciones controladas: al diferir cada configuración en un solo componente, es útil para entender la contribución individual de cada mecanismo, algo valioso para diseñar arquitecturas más eficientes.
- Evaluación de técnicas de positional encoding: la comparación C1 vs C2 muestra que RoPE mejora significativamente la precisión (bit accuracy de 0.8960 a 0.9482), lo que sirve como referencia para decidir entre posiciones sinusoidales y rotatorias.
- Análisis de eficiencia de atención: la configuración C3 con GQA reduce el coste de atención pero degrada el rendimiento (bit accuracy 0.8701), lo que ilustra el trade-off entre eficiencia y calidad.
- Exploración de tokenización a nivel de bytes: la configuración C5 demuestra que un transformer sin tokenización subword puede resolver la tarea perfectamente, abriendo la puerta a investigar modelos token-free.
- Práctica docente: como trabajo de asignatura, puede servir como ejemplo de implementación de transformers desde cero, con checkpoints listos para cargar y evaluar en un entorno educativo.

## Benchmarks y rendimiento

La model card proporciona resultados en el conjunto de test con decodificación greedy. Se reportan bit accuracy, sequence accuracy, distancia de Levenshtein, BLEU y ROUGE-L para cada configuración.

| Config | Bit acc | Seq acc | Levenshtein | BLEU | ROUGE-L |
| --- | --- | --- | --- | --- | --- |
| C1 (base) | 0.8960 | 0.3203 | 2.9023 | 0.8645 | 0.9305 |
| C2 (RoPE) | 0.9482 | 0.5316 | 1.5340 | 0.9215 | 0.9598 |
| C3 (GQA) | 0.8701 | 0.2129 | 4.5672 | 0.8120 | 0.9043 |
| C4 (RMSNorm) | 0.8972 | 0.3164 | 2.9723 | 0.8609 | 0.9283 |
| C5 (token-free) | 1.0000 | 1.0000 | 0.0000 | no disponible | no disponible |

La configuración C5 supera a todas las demás con precisión perfecta, aunque no se reportan BLEU ni ROUGE-L para ella. No se han publicado comparaciones con otros modelos externos, ya que se trata de un estudio de ablación interno.

## Requisitos de hardware

- El tamaño del repositorio es de 0.7 GB, lo que sugiere que los checkpoints son relativamente pequeños (probablemente menos de 100 millones de parámetros, aunque no se confirma).
- Inferencia: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para cargar un checkpoint y ejecutar la tarea. Una GPU consumer como una GTX 1060 o superior es más que adecuada.
- Entrenamiento: al ser un modelo pequeño, se puede entrenar en una GPU consumer de gama media (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU para experimentos pequeños, aunque no se especifican los requisitos exactos.
- Despliegue: al ser un modelo de investigación en PyTorch, se puede cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch instalado. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, y no es necesario para este caso de uso.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño reducido, la inferencia debería ser casi instantánea en GPU moderna.

## Comparativa con modelos similares

Existen otros repositorios de la misma asignación ANLP A1, como `ZappY-AI/anlp-a1`, `ransom32/anlp-A1` y el repositorio de GitHub `FrenchKnuckles/ANLP_A1`. Todos implementan la misma tarea de descifrado de cifrado por sustitución o XOR con transformers encoder-decoder, pero no se dispone de sus métricas ni especificaciones detalladas para comparar directamente. No se conocen modelos comerciales o de código abierto que aborden exactamente esta tarea, por lo que la comparativa se limita a trabajos académicos similares.

| Modelo | Tarea | Arquitectura | Resultados | Licencia |
| --- | --- | --- | --- | --- |
| RaunakSeksaria/anlp-a1-transformers | Descifrado XOR | Transformer encoder-decoder, 5 variantes | C5 perfecto, C2 mejor entre las subword | no disponible |
| ZappY-AI/anlp-a1 | Descifrado (no especificado) | Transformer encoder-decoder | no disponible | no disponible |
| ransom32/anlp-A1 | Descifrado (no especificado) | Transformer encoder-decoder | no disponible | no disponible |
| FrenchKnuckles/ANLP_A1 (GitHub) | Descifrado de cifrado por sustitución | Transformer encoder-decoder, 5 configuraciones | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación académica: no está diseñado para uso en producción ni para tareas generales de NLP. Solo resuelve la tarea específica de descifrar secuencias binarias cifradas con XOR.
- Sin licencia especificada: no se indica la licencia, por lo que no está claro si se permite uso comercial o modificación. Se debe contactar al autor antes de cualquier uso más allá de investigación.
- Datos de entrenamiento no documentados: no se informa sobre el tamaño ni la composición del dataset, lo que limita la reproducibilidad y la evaluación de sesgos.
- Riesgo de sobreajuste: la configuración C5 alcanza precisión perfecta en test, lo que podría indicar sobreajuste al conjunto de evaluación, aunque al ser una tarea determinista (XOR) es plausible que haya aprendido la regla exacta.
- Sin soporte para otros idiomas ni dominios: el modelo solo trabaja con texto plano en inglés y secuencias binarias de entrada.
- No se proporcionan métricas de latencia, throughput ni consumo de memoria, lo que dificulta planificar despliegues.
- El código del modelo no está incluido en el Hub, solo los checkpoints. Para reproducir o modificar la arquitectura es necesario acceder al repositorio de la asignatura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaunakSeksaria/anlp-a1-transformers
- Repositorio similar en Hugging Face (ZappY-AI): https://huggingface.co/ZappY-AI/anlp-a1
- Repositorio similar en Hugging Face (ransom32): https://huggingface.co/ransom32/anlp-A1
- Repositorio en GitHub (FrenchKnuckles): https://github.com/FrenchKnuckles/ANLP_A1
- Repositorio en GitHub (ybshankar010): https://github.com/ybshankar010/anlp_transformer
