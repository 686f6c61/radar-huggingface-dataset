# Arihant25/anlp-a1-transformer-ablations

## Resumen

El modelo `Arihant25/anlp-a1-transformer-ablations` es un conjunto de cinco checkpoints de transformadores encoder-decoder construidos desde cero en PyTorch, sin usar `nn.Transformer` ni `nn.MultiheadAttention`, como parte de una tarea académica del curso Advanced NLP de IIIT Hyderabad. El objetivo es descifrar secuencias de cifrado binario (XOR de repetición de clave) a texto plano en inglés, y se realiza un estudio de ablación controlado con cinco configuraciones que varían un único componente cada una: posicionamiento sinusoidal vs. RoPE, atención multi-cabeza vs. GQA, normalización LayerNorm vs. RMSNorm, y tokenización subword BPE vs. token-free Byte Latent Transformer (BLT).

El modelo es relevante porque documenta de forma rigurosa cómo cada componente arquitectónico afecta al rendimiento en una tarea de alineación posicional estricta, y demuestra que la tokenización a nivel de bytes (BLT) supera ampliamente a la subword en este escenario. Los checkpoints son pequeños (entre 9,49M y 12,51M parámetros) y se distribuyen bajo licencia MIT, aunque su utilidad práctica se limita al ámbito de investigación y experimentación docente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (4+4 capas, d_model 256, 8 cabezas, FFN 1024) con variantes: C1-base (sinusoidal + MHA + LayerNorm + BPE), C2-rope (RoPE), C3-gqa (GQA 8Q/2KV), C4-rmsnorm (RMSNorm), C5-blt (BLT token-free) |
| Parametros totales | C1-base: 9,49M; C5-blt: 12,51M; C2, C3, C4: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 caracteres (fase alineada, múltiplo del periodo de clave de 8 caracteres) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

Todos los modelos comparten la misma base: un encoder-decoder con 4 capas en cada parte, d_model 256, 8 cabezas de atención, FFN de 1024 unidades, dropout 0,1, y normalización según la configuración. El entrenamiento usa AdamW con lr 3e-4, warmup de 1000 pasos, decaimiento coseno, label smoothing 0,1, precisión bf16, 80 épocas con early stopping, y divisiones de datos fijas (80/10/10) con semilla 42. El dataset consta de 5000 líneas de cifrado binario emparejadas con texto plano, donde el cifrado es un XOR de repetición de clave con `KEY = b"ANLP2026"`, verificado sin errores en todas las líneas.

La innovación principal es el estudio de ablación: cada configuración (C2 a C5) cambia exactamente un componente respecto a C1-base. C5-blt sustituye la tokenización BPE por un Byte Latent Transformer, que opera directamente sobre bytes sin vocabulario subword. Esto elimina la necesidad de aprender mapeos de longitud variable entre tokens y posiciones, lo que resulta crítico en una tarea donde la alineación posicional es estricta (el byte de salida *i* debe leerse del byte de entrada *i*). El entrenamiento se realizó en una NVIDIA GB10 (DGX Spark, 121 GB de memoria unificada) con PyTorch 2.13 y CUDA 13.

## Capacidades

- Descifrado de secuencias de cifrado binario (XOR de repetición de clave) a texto plano en inglés, con alta precisión a nivel de bit (0,990 en C5-blt).
- Aprendizaje de alineación posicional estricta: el modelo debe mapear cada posición de salida a la posición correspondiente de entrada, dependiendo de `i mod 8`.
- Comparación controlada de componentes arquitectónicos: posicionamiento (sinusoidal vs. RoPE), atención (MHA vs. GQA), normalización (LayerNorm vs. RMSNorm) y tokenización (BPE vs. BLT).
- Generación de texto plano a partir de entrada binaria mediante decodificación greedy, con concatenación de ventanas de 256 caracteres para reconstruir líneas completas.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo seq2seq específico para la tarea de descifrado.

## Casos de uso

- Investigación académica en arquitecturas transformer: el modelo permite reproducir y analizar el efecto de cada componente (RoPE, GQA, RMSNorm, BLT) en una tarea de alineación estricta, sirviendo como referencia para estudios de ablación.
- Evaluación de métodos de tokenización: comparar el rendimiento de BPE frente a BLT en tareas donde la correspondencia posicional es crítica, útil para diseñar modelos que operen a nivel de byte.
- Análisis de eficiencia de entrenamiento: los datos de tiempo por época, memoria y throughput permiten estudiar el coste computacional de cada configuración, especialmente el trade-off entre BLT y subword.
- Pruebas de concepto en descifrado de cifrados simples: aunque el cifrado es sintético, el modelo demuestra la viabilidad de aprender transformaciones XOR con redes neuronales, lo que puede servir como base para experimentos en criptoanálisis educativo.
- Benchmark de implementaciones desde cero: al no usar módulos preconstruidos de PyTorch, el código puede utilizarse para validar implementaciones propias de atención, normalización y posicionamiento.
- Material docente: el conjunto de checkpoints y métricas es útil para cursos de PLN que enseñen estudios de ablación, reproducibilidad y análisis de arquitecturas.

## Benchmarks y rendimiento

Resultados en el conjunto de test (decodificación greedy, métricas a nivel de línea):

| Config | Bit acc. | Seq. acc. | Levenshtein | BLEU | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---|---|---|---|---|---|---|
| C1-base | 0,720 | 0,004 | 54,50 | 67,12 | 0,818 | 0,702 | 0,817 |
| C2-rope | 0,704 | 0,004 | 83,75 | 61,98 | 0,779 | 0,652 | 0,776 |
| C3-gqa | 0,709 | 0,006 | 83,23 | 57,49 | 0,765 | 0,622 | 0,763 |
| C4-rmsnorm | 0,719 | 0,004 | 54,37 | 66,79 | 0,821 | 0,702 | 0,820 |
| C5-blt | 0,990 | 0,296 | 4,02 | — | — | — | — |

Nota: BLEU y ROUGE solo se reportan para modelos tokenizados (C1–C4). La longitud media de referencia es ~598 caracteres, por lo que un Levenshtein de 54 equivale a ~91% de caracteres correctos; la precisión de secuencia es coincidencia exacta de la línea completa.

Eficiencia de entrenamiento (C5 vs C1):

| | Params | s/época | Samples/s | Tokens/s | Pico de memoria GPU | Épocas hasta el mejor |
|---|---|---|---|---|---|---|
| C1-base | 9,49M | 24,2 | 475 | 22,7k | 3,15 GB | 79 |
| C5-blt | 12,51M | 95,1 | 121 | 25,5k | 6,06 GB | 15 |

C5 es ~3,9× más lento por paso y usa ~1,9× más memoria, pero converge en ~24 minutos frente a ~32 minutos de C1, y alcanza un rendimiento muy superior.

## Requisitos de hardware

- Los checkpoints son pequeños (9–12M parámetros), por lo que la inferencia es viable en cualquier GPU moderna, incluidas GPUs de consumo como RTX 3060 o superiores.
- No se proporcionan requisitos específicos de VRAM para inferencia; el entrenamiento usó 3,15 GB (C1) y 6,06 GB (C5) de pico de memoria en una NVIDIA GB10 con 121 GB unificados.
- El formato de pesos es PyTorch state dict, por lo que se requiere PyTorch para cargar los modelos; no se ofrecen versiones cuantizadas ni formatos GGUF.
- Para reproducir el entrenamiento se necesita una GPU con al menos 6 GB de memoria (para C5) y soporte de bf16.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; el uso previsto es académico, cargando los checkpoints directamente en PyTorch.

## Comparativa con modelos similares

No disponible. Este modelo es un estudio de ablación específico para una tarea sintética de descifrado, y no existen modelos comparables de la misma categoría en la información proporcionada. Las comparaciones internas entre configuraciones (C1–C5) ya se presentan en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo de investigación académica, no apto para producción ni para tareas de lenguaje natural general.
- Entrenado exclusivamente en un dataset sintético de 5000 líneas con cifrado XOR de clave fija; no generaliza a otros cifrados ni a texto libre.
- La tokenización BLT (C5) supera a la subword en esta tarea, pero los autores advierten explícitamente que este resultado no debe extrapolarse a tareas de lenguaje natural.
- Los checkpoints requieren las clases de modelo del código de la asignatura para cargarse; no son autónomos.
- No se reportan sesgos, riesgos de alucinación ni restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial, pero el modelo carece de utilidad práctica fuera del ámbito educativo.
- La precisión de secuencia es muy baja en todas las configuraciones (máximo 0,296 en C5), lo que indica que la generación de líneas completas exactas es poco fiable.

## Enlaces

- HuggingFace: https://huggingface.co/Arihant25/anlp-a1-transformer-ablations
- Registros de entrenamiento (WandB): https://wandb.ai/arihanttr-iiit-hyderabad/anlp-a1
