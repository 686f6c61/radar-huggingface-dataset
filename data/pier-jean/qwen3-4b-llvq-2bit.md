# Pier-Jean/Qwen3-4B-LLVQ-2bit

## Resumen

Qwen3-4B-LLVQ-2bit es una cuantización extrema a 2 bits del modelo Qwen3-4B, desarrollada por Pier-Jean Malandrino como implementación independiente en Rust del algoritmo Leech Lattice Vector Quantization (LLVQ) descrito en el artículo arXiv:2603.11021 de Qualcomm AI Research. El resultado es un único archivo de 1,771 GB que comprime los 8,045 GB del modelo en FP16, un factor de reducción de 4,54 veces, con una tasa de 2,1595 bits por peso de proyección.

El modelo se presenta como un artefacto de investigación, no como un componente listo para producción. Su relevancia radica en explorar los límites de la cuantización de 2 bits: frente al baseline FP16 pierde 14,3 puntos de MMLU en Metal y 14,7 en CUDA (retención del 79,7 % y 79,1 % respectivamente), con un daño especialmente severo en tareas de razonamiento, que en algunos dominios caen a nivel de azar. La perplejidad en WikiText-2 es 16,9415 frente a 12,2361 del baseline (factor 1,385).

La arquitectura subyacente es un transformer denso de 36 capas con aproximadamente 4 000 millones de parámetros, de los cuales 3 633 315 840 son pesos de proyección cuantizados. La licencia es Apache 2.0 y el idioma documentado es únicamente inglés. Es importante destacar que el formato de pesos es propietario (extensión .llvq) y no es compatible con transformers, llama.cpp, vLLM ni TGI; requiere un lector Rust específico proporcionado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B), 36 capas |
| Parametros totales | ~4 000 millones (3 633 315 840 pesos de proyección cuantizados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la documentación del modelo cuantizado |
| Tipos de cuantizacion | LLVQ 2-bit: código de retícula Λ₂₄(12) a 2,000 bits/peso + 1 bit de ganancia, escalas por fila en f64, columnas de cola en f32; tasa efectiva 2,1595 bits/peso sobre proyecciones, 3,5213 bits/parámetro incluyendo embedding f16 |
| Idiomas soportados | Inglés (etiquetado en Hugging Face; el modelo base Qwen3-4B es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario LLVQ (.llvq), no compatible con safetensors, GGUF, AWQ, transformers, llama.cpp, vLLM ni TGI |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso de 36 capas con aproximadamente 4 000 millones de parámetros. La cuantización se aplica post-entrenamiento, sin fine-tuning, siguiendo el Algoritmo 1 del paper arXiv:2603.11021 (shape-gain con gain reset) más una rotación de incoherencia por el lado de entrada. El codebook es la bola Λ₂₄(12), es decir, la unión de las shells 2 a 12 de la retícula Leech, con 47 bits de índice más 1 bit de ganancia, empaquetados en 6 bytes por bloque de 24 pesos. Las escalas por fila se almacenan en f64 porque ninguna de las 1 105 920 escalas es representable en f32, y las columnas de cola se mantienen exactas en f32.

La calibración se realizó sobre el corpus C4 con 131 072 tokens, fuera de dominio respecto al conjunto de evaluación WikiText-2. El archivo final se compone de 252 proyecciones lineales cuantizadas (0,981 GB), 146 tensores sin cuantizar en f16 (0,778 GB, casi todo el embedding atado) y configuración y tokenizador (0,011 GB). El autor verificó que los 3 633 315 840 pesos de proyección se decodifican bit a bit respecto a los pesos evaluados. No se aplicó RLHF, DPO ni ningún otro método de alineación; se trata exclusivamente de una compresión post-entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-4B pero degradada por la cuantización de 2 bits.
- Razonamiento: MMLU 5-shot de 55,59 ± 1,35 en CUDA frente a 70,32 ± 1,28 del baseline FP16, con una retención del 79,1 %.
- La degradación no es uniforme: dominios como álgebra abstracta y contabilidad profesional caen a 10/40 (nivel de azar), mientras que historia europea y derecho internacional se mantienen en 33/40.
- El daño afecta mucho más al razonamiento que a la recuperación de conocimiento, como refleja la discrepancia entre perplejidad (factor 1,385) y MMLU (pérdida de 14,7 puntos).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento extendido en esta versión cuantizada.
- Multilingüismo: la ficha de Hugging Face etiqueta únicamente inglés; el modelo base es multilingüe, pero esta cuantización no documenta otros idiomas.

## Casos de uso

- Investigación en cuantización extrema: evaluar el impacto real de 2 bits por peso en las capacidades de razonamiento de un modelo de 4B, con datos reproducibles de MMLU y perplejidad sobre el archivo exacto.
- Benchmarking de métodos de compresión: comparar LLVQ con Quip#/E8P12 y QTIP en condiciones controladas, utilizando la tabla de perplejidad normalizada que proporciona el autor.
- Estudio de degradación selectiva por dominio: analizar por qué ciertas áreas de conocimiento (álgebra, contabilidad) colapsan a nivel de azar mientras otras (historia, derecho) se mantienen, para orientar futuros algoritmos de cuantización.
- Despliegue en entornos con memoria extremadamente limitada: el archivo de 1,771 GB cabe en dispositivos con menos de 2 GB de almacenamiento disponible, aunque requiere el lector Rust específico y no es compatible con los runners estándar.
- Prototipado de aplicaciones de generación de texto de baja exigencia: tareas donde la calidad de razonamiento no sea crítica y se priorice el tamaño reducido del modelo.
- Educación sobre vector quantization y retículas de Leech: el repositorio incluye una implementación Rust independiente que puede servir como referencia didáctica para implementar LLVQ desde cero.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre el archivo exacto del modelo, con su propio pipeline de evaluación. MMLU 5-shot sobre 2 280 preguntas de un split fijo de 14 042:

| Metrica | FP16 baseline | Este modelo | Retencion |
|---|---|---|---|
| MMLU (micro), Metal / M3 Max | 70,42 ± 1,28 | 56,09 ± 1,36 | 79,7 % |
| MMLU (micro), CUDA / L40S | 70,32 ± 1,28 | 55,59 ± 1,35 | 79,1 % |
| WikiText-2 perplejidad (ctx 4096, f16) | 12,2361 | 16,9415 | — |

Comparación con métodos publicados de cuantización 2 bits (sin fine-tuning, perplejidad WikiText-2):

| Metodo | Wiki ↓ | bits/peso |
|---|---|---|
| Quip#/E8P12 | 21,15 | 2,000 |
| QTIP (3INST) | 17,04 | 2,000 |
| LLVQ, 0 gain bits (paper) | 17,05 | 2,000 |
| Este modelo | 16,9617 (f32, en memoria) | 2,1595 |
| LLVQ, 2 gain bits (mejor del paper) | 15,54 | 2,000 |

El autor advierte que las perplejidades crudas no son comparables entre implementaciones porque los baselines difieren (el suyo es 12,2336 frente a 12,41 del paper). Normalizado como exceso de log-verosimilitud sobre cada baseline, este modelo es un 3,1 % peor que QTIP en el par f32, un 2,6 % peor en el par f16, y un 2,9 % peor que la configuración de 0 gain bits del paper, a un 8,5 % más de bits. No es estado del arte. Además, el paper reporta una caída de 9,5 puntos de MMLU y este modelo pierde más (14,3-14,7), sin que el autor conozca la causa exacta; la hipótesis principal es el volumen de calibración (131 072 tokens frente a las 6 100 secuencias del paper).

## Requisitos de hardware

- El archivo del modelo ocupa 1,771 GB, por lo que cabe en cualquier GPU con más de 2 GB de VRAM, incluidas GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- El autor evaluó en Apple Metal (M3 Max) y CUDA (NVIDIA L40S), con resultados ligeramente diferentes entre ambos backends (0,50 pp de discrepancia en MMLU sin explicación confirmada).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el lector Rust propietario del proyecto. No se puede desplegar con los runners estándar de inferencia.
- No se proporcionan datos de latencia ni throughput específicos de esta cuantización. El post de LinkedIn del autor menciona 26,7 ms por token en el último paso de generación con Qwen3-4B en L40S, pero corresponde al modelo original, no a esta versión cuantizada.
- Para uso en CPU, el formato de 2 bits reduce drásticamente el ancho de banda de memoria, pero no hay benchmarks publicados de velocidad en CPU.

## Comparativa con modelos similares

La comparación más relevante es con otros métodos de cuantización 2 bits publicados, todos sin fine-tuning y evaluados en WikiText-2:

| Metodo | bits/peso | WikiText-2 ↓ | Notas |
|---|---|---|---|
| Quip#/E8P12 | 2,000 | 21,15 | Método establecido de cuantización 2 bits |
| QTIP (3INST) | 2,000 | 17,04 | Mejor que Quip# en perplejidad |
| LLVQ 0 gain bits (paper) | 2,000 | 17,05 | Configuración base del paper arXiv:2603.11021 |
| LLVQ 2 gain bits (paper) | 2,000 | 15,54 | Mejor configuración del paper |
| Este modelo | 2,1595 | 16,9617 (f32) | Implementación independiente, 8,5 % más bits |

El autor señala que las perplejidades crudas no son directamente comparables porque los baselines FP16 difieren entre implementaciones. Normalizado sobre cada baseline, este modelo es marginalmente peor que QTIP (3,1 % en f32) y que la configuración de 0 gain bits del paper (2,9 %), a costa de un 8,5 % más de bits. No se dispone de comparaciones de MMLU con los otros métodos porque el autor solo publica MMLU para este modelo y su baseline FP16.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción. El propio autor lo advierte explícitamente en la model card.
- El formato de pesos es propietario y no compatible con transformers, llama.cpp, vLLM, TGI ni ninguna herramienta estándar de inferencia. Requiere el lector Rust específico del proyecto.
- Pérdida significativa de calidad: 14,3-14,7 puntos de MMLU frente al baseline FP16, con dominios de razonamiento (álgebra abstracta, contabilidad profesional) cayendo a nivel de azar.
- La implementación es independiente del paper de Qualcomm AI Research y no ha sido verificada por los autores originales.
- Hay una discrepancia no explicada de 0,50 pp en MMLU entre los backends Metal y CUDA sobre el mismo archivo, que el autor reconoce como una deuda de procedencia abierta.
- Solo se documenta el idioma inglés; no hay garantías de comportamiento en otros idiomas aunque el modelo base sea multilingüe.
- No se documenta soporte de tool calling, agentes ni generación estructurada.
- La licencia Apache 2.0 permite uso comercial, pero el formato propietario y la falta de integración con herramientas estándar limitan su aplicabilidad práctica.
- No es estado del arte en cuantización 2 bits: es marginalmente peor que QTIP y que la configuración de 2 gain bits del paper, con más bits por peso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-2bit
- Paper arXiv:2603.11021 (Leech Lattice Vector Quantization): https://arxiv.org/abs/2603.11021
- Perfil de LinkedIn del autor con detalles técnicos: https://www.linkedin.com/posts/pier-jean-malandrino_broadcastmatmul-copies-the-whole-rhs-when-activity-7493988112981790721-6adk
- Página del modelo base Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Repositorio GitHub del proyecto: no disponible en la información proporcionada (el README menciona un enlace al GitHub del autor, pero no se incluye la URL en la documentación consultada).
