# AnishRacherla/anlp_assign_1_run4

## Resumen

El modelo `AnishRacherla/anlp_assign_1_run4` es un transformador entrenado desde cero como parte de la asignación 1 del curso Advanced NLP de la Universidad Carnegie Mellon (CMU). Su función es descifrar un cifrado binario aplicado al Brown Corpus, es decir, traducir secuencias de bits codificadas a texto plano en inglés. El autor, Anish Racherla, lo publica con licencia MIT y lo etiqueta como un ejercicio académico de implementación de transformers desde cero.

Se trata de un modelo pequeño, con una arquitectura transformer estándar de 4 capas, dimensión de modelo 256, 8 cabezas de atención y una dimensión de feed-forward de 512. Utiliza codificación posicional sinusoidal, atención multi-cabeza convencional y normalización por capas. El vocabulario se construye con BPE de 2000 tokens. El tamaño del repositorio es de 0,1 GB, lo que indica un modelo ligero, pensado para ejecutarse en hardware modesto.

Su relevancia es principalmente didáctica: demuestra cómo implementar y entrenar un transformer desde cero para una tarea de secuencia a secuencia con una entrada binaria. No es un modelo de propósito general, sino una prueba de concepto para descifrado de un corpus específico. Los resultados de test muestran una precisión de secuencia nula, aunque las métricas BLEU y ROUGE indican cierta similitud superficial con el texto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (configuración C1) |
| Parametros totales | no disponible (estimable en torno a 5-10 millones según d_model y capas) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de secuencia usada en entrenamiento, no publicada) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binario de PyTorch, no especificado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con codificador y decodificador, aunque la model card no especifica si es encoder-decoder completo o solo decoder. La configuración C1 indica: codificación posicional sinusoidal, atención multi-cabeza (MHA), normalización por capas (LayerNorm), d_model=256, n_heads=8, n_layers=4 y ffn_dim=512. El vocabulario se construyó con BPE de 2000 tokens. Se entrenó durante 40 épocas sobre el Brown Corpus, con la entrada siendo un cifrado binario y la salida el texto plano correspondiente.

No se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset más allá del Brown Corpus. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que es un modelo puramente supervisado para una tarea de traducción de secuencias. La innovación técnica principal es la implementación desde cero de un transformer funcional para una tarea no trivial, lo que sirve como ejercicio de aprendizaje.

## Capacidades

- Descifrado de secuencias binarias a texto plano en inglés, específicamente sobre el Brown Corpus.
- Traducción de secuencias de bits a tokens BPE y posterior generación de texto.
- Manejo de secuencias de longitud variable (aunque la longitud máxima no está documentada).
- Capacidad de procesamiento de lenguaje natural básico limitado al dominio del corpus de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo de lenguaje general; su única función es la tarea de descifrado para la que fue entrenado.

## Casos de uso

- Práctica académica de implementación de transformers: el modelo sirve como referencia para estudiantes que quieran comparar su propia implementación de atención, codificación posicional y BPE.
- Evaluación de métricas de traducción automática: al ser una tarea de secuencia a secuencia, permite experimentar con BLEU, ROUGE y distancia de Levenshtein en un entorno controlado.
- Pruebas de decodificación de cifrados simples: aunque limitado al Brown Corpus, puede usarse como demostración de cómo un transformer aprende a invertir una transformación determinista.
- Benchmark de eficiencia de entrenamiento: al ser un modelo pequeño, es útil para medir tiempos de entrenamiento y consumo de recursos en diferentes GPUs.
- Estudio de la influencia de la configuración de hiperparámetros: la configuración C1 (sinusoidal, MHA, LayerNorm) puede compararse con otras configuraciones de la misma asignación para analizar su impacto.
- Reproducción de resultados de investigación: investigadores pueden verificar los resultados publicados en la model card y explorar variaciones del entrenamiento.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados en el conjunto de test:

| Metrica | Valor |
|---|---|
| loss | 4.3552 |
| token_acc | 0.0824 |
| bit_acc | 0.6680 |
| seq_acc | 0.0000 |
| levenshtein | 263.7800 |
| bleu | 40.0100 |
| bleu1 | 81.9500 |
| bleu2 | 54.1700 |
| bleu3 | 30.5400 |
| bleu4 | 18.9000 |
| rouge1 | 81.2800 |
| rouge2 | 52.7600 |
| rougeL | 47.5100 |

Estos datos indican que el modelo no logra descifrar correctamente ninguna secuencia completa (seq_acc = 0), aunque la precisión a nivel de bit es del 66,8%. Las métricas BLEU y ROUGE son moderadas, lo que sugiere que el texto generado comparte n-gramas con la referencia pero con errores sustanciales. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 0,1 GB, es extremadamente ligero. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o CPUs.
- No se requieren GPUs de alta gama; una RTX 3060 o incluso una CPU moderna son suficientes para inferencia.
- Para entrenamiento, el tamaño reducido permite usar GPUs de gama media (por ejemplo, RTX 2080 o superior) sin problemas de memoria.
- Opciones de despliegue: al no especificarse el formato de pesos, se puede asumir que es compatible con PyTorch estándar. Podría cargarse con transformers si se adapta, pero no hay garantía. Alternativas: ejecución directa con el script de entrenamiento original.
- Latencia y throughput: no disponibles, pero dado el tamaño, la inferencia debería ser casi instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (descifrado binario de Brown Corpus). El modelo es una tarea específica de una asignación académica, y no hay alternativas públicas conocidas con las que compararlo directamente. Se podría comparar con otros modelos de la misma asignación (configuraciones C2, C3, etc.) si estuvieran publicados, pero no se han encontrado en la información disponible.

## Limitaciones y advertencias

- El modelo no logra descifrar correctamente ninguna secuencia completa (seq_acc = 0), por lo que no es utilizable para tareas reales de descifrado.
- La precisión de token es muy baja (8,24%), lo que indica que la generación de texto es mayoritariamente incorrecta.
- Está entrenado exclusivamente sobre el Brown Corpus; no generaliza a otros textos o cifrados.
- No es un modelo de lenguaje general; no puede realizar tareas de generación de texto, respuesta a preguntas, etc.
- La licencia MIT permite uso comercial, pero el modelo no tiene valor práctico más allá del educativo.
- No se documentan sesgos específicos, pero al estar entrenado en un corpus de inglés de mediados del siglo XX, puede reflejar sesgos históricos del lenguaje.
- Riesgo de alucinación: al ser un modelo de secuencia a secuencia con baja precisión, puede generar texto plausible pero incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnishRacherla/anlp_assign_1_run4
- Perfil del autor: https://huggingface.co/AnishRacherla
- Asignación 1 del curso ANLP Fall 2025 (CMU): https://cmu-l3.github.io/anlp-fall2025/assignments/assignment1
- Asignación 1 del curso ANLP Spring 2026 (CMU): https://cmu-l3.github.io/anlp-spring2026/assignments/assignment1
- Repositorio de código de la asignación (referencia): https://deepwiki.com/cmu-l3/anlp-fall2025-hw1/4-training-and-inference-pipeline-(run_llama.py)
