# NSC64/pssa-300m

## Resumen

pssa-300m es un modelo de lenguaje de 299,25 millones de parámetros desarrollado por NSC64 que prescinde por completo del mecanismo de atención. Se trata de un port en PyTorch de la arquitectura "plastic state-space" del repositorio Sparticle62ops/pssa, escalada desde una referencia de 1,5 millones de parámetros hasta este modelo de 300M. El modelo se entrenó desde cero sobre 8.000 millones de tokens con una mezcla fuertemente orientada a código, en una única RTX PRO 6000 Blackwell, repartiendo el cómputo entre varias sandboxes de Molab con reanudación desde checkpoints publicados cada 5.000 pasos.

La relevancia del modelo es fundamentalmente arquitectónica y experimental: demuestra que un state-space model recurrente con bancos de memoria y sin atención puede entrenarse a escala de 300M de parámetros y producir código y prosa técnica con una register convincente. No obstante, el propio autor advierte que el modelo "no sabe hechos": reproduce la forma del lenguaje entrenado, no conocimiento factual.

Con 24 bloques, dimensión de modelo 1024, dimensión de estado 16 y un vocabulario de 32.000 tokens BPE, el modelo mantiene un coste de cómputo por token constante independientemente de la longitud de contexto, gracias a un estado recurrente de tamaño fijo. Su licencia GPL-3.0 y su naturaleza de investigación lo sitúan como una pieza de estudio más que como un candidato para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | State-space model recurrente sin atención (plastic state-space, tipo Mamba), 24 bloques |
| Parámetros totales | 299.253.760 (283,03M en el núcleo + 16,22M en los 24 bancos de memoria) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible explícitamente; el entrenamiento trunca backprop a 256 tokens y las evaluaciones usan secuencias de 512 tokens |
| Tipos de cuantización | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible (el corpus es mayoritariamente inglés técnico y código) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (model.safetensors) + tokenizer.json |

## Arquitectura y entrenamiento

El modelo apila 24 bloques con la siguiente estructura: normalización RMS, proyección delta con softplus, actualización de estado recurrente `h_t = exp(delta_t·A) h_{t-1} + delta_t·B_t·x_t`, lectura `y_t = <h_t, C_t>`, y una capa de memoria con atención de similitud sobre embeddings proyectados en espacio de Poincaré (`w = softmax(-d_H(q, k)/tau)`), seguida de proyección, un adaptador rank-16 con activación SiLU y un MLP de hidden 2816. La conexión residual usa escalado `1/√depth`. La dimensión de modelo es 1024, `d_state` 16, `d_key` 32, con embeddings de entrada y cabeza de salida no atados (untied) de 32.000 tokens.

Respecto a la referencia en Rust, el autor introduce dos cambios necesarios a esta escala: los bancos de memoria se entrenan por gradiente en lugar de con inserción condicionada por sorpresa (el umbral de novedad de 3,5 nats deja de dispararse a los pocos cientos de pasos, dejando la ruta de escritura inactiva), y la retropropagación se trunca a 256 tokens. El scan se implementa como kernel Triton fusionado con backward escrito a mano, que coincide con un bucle PyTorch plano en torno a 1e-7 en todos los gradientes.

El entrenamiento consistió en una única fase sobre 8.000 millones de tokens, con una mezcla intercalada por bytes de 45% codeparrot-clean, 20% textbook_quality_programming, 15% open-web-math y 20% fineweb-edu. Tras tokenizar con un BPE byte-level de 32.000 tokens entrenado sobre una muestra code-heavy, quedaron 967,9M tokens de entrenamiento y 11,4M de validación; el corpus se reutilizó aproximadamente 8,3 veces. Batch de 24 × 512 tokens (12.288 tokens por paso), learning rate 2e-4 con 500 pasos de warmup, plano hasta el último 15% del presupuesto y decaimiento coseno hasta 2e-5. Estado final: paso 651.042, 8.000.004.096 tokens, EMA de pérdida de entrenamiento 1,980. Throughput de unos 59.000 tokens/s (4,8 pasos/s), aproximadamente 38 GPU-horas.

## Capacidades

- Generación de texto en register técnico y de prosa genérica, con gramática local aprendida con rapidez.
- Generación de código (Python y otros) a partir de prefijos, con estructura sintáctica plausible.
- Generación de prosa matemática con notación LaTeX, incluyendo enunciados de ejercicios y soluciones con formato.
- Modelado de lenguaje autoregresivo con coste por token constante respecto a la longitud de contexto.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe no documentada; el corpus es esencialmente inglés técnico.

## Casos de uso

- Estudio e investigación de arquitecturas state-space sin atención: permite reproducir y analizar el comportamiento de un SSM de 300M con bancos de memoria en un entorno PyTorch, comparándolo con transformers de tamaño similar en tareas controladas.
- Generación de esqueletos de código y firmas de funciones: el modelo completa prefijos como `def train_step(` con argumentos y estructura plausibles, útil como borrador en entornos de prototipado donde la corrección semántica no es crítica.
- Generación de enunciados de ejercicios matemáticos con LaTeX: produce problemas y soluciones con formato consistente, aprovechable para generar material de práctica que luego se revise manualmente.
- Benchmark de eficiencia de inferencia: al tener coste por token constante, sirve para medir latencia y throughput en secuencias largas frente a transformers con atención cuadrática en el mismo hardware.
- Docencia sobre state-space models: el código `pssa_model.py` (config, modelo, loader y sampler) y el kernel Triton sirven como material didáctico para explicar scans recurrentes, backward manual y truncamiento de gradiente.
- Pruebas de generación de prosa técnica en dominio code-heavy: útil para evaluar la fidelidad de register en textos de documentación o comentarios de código, siempre con revisión humana.
- Validación de pipelines de entrenamiento distribuido con reanudación desde checkpoints: el modelo documenta un flujo real de resume entre sandboxes cada 5.000 pasos, replicable como referencia de ingeniería.

## Benchmarks y rendimiento

Evaluación held-out con 1M de tokens por split, batch 8, longitud de secuencia 512, mismo protocolo y semilla que la model card del modelo de 100M.

| Split | Cross-entropy | Perplexity | Precisión next-token |
|---|---|---|---|
| code | 1,484 | 4,41 | 70,7% |
| text/math | 3,532 | 34,20 | 39,0% |
| mixed | 2,347 | 10,46 | 56,9% |

El split de código son 8 MB de documentos de codeparrot-clean posteriores a la ventana de entrenamiento de 1,8 GB. El dataset de textbooks se agotó a 0,47 GB durante la construcción del corpus, por lo que no quedaron documentos post-cuota para muestrear. El split text/math son 8 MB de open-web-math tras 0,6 GB y 8 MB de fineweb-edu tras 0,8 GB. El split mixed es la cola held-out del propio corpus intercalado (últimos 40 MB). La pérdida de validación final del bucle de entrenamiento fue 1,964 sobre la cola mixed; la puntuación de 1M tokens es superior porque promedia ventanas aleatorias de 512 tokens en todo el fichero en lugar de repetir un batch fijo.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299,25M de parámetros en fp32, unos 1,2 GB de pesos; en fp16/bf16, unos 0,6 GB; en int8, unos 0,3 GB. A esto hay que sumar el estado recurrente y los bancos de memoria (16,22M de parámetros adicionales ya incluidos en el total) y el overhead del runtime.
- GPU recomendadas: el modelo se entrenó en una RTX PRO 6000 Blackwell; para inferencia es suficiente cualquier GPU con al menos 4-8 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso en fp32.
- Opciones de despliegue: el autor proporciona `pssa_model.py` con `from_pretrained` y `generate`; en CPU ejecuta un scan PyTorch plano y en CUDA usa un kernel Triton fusionado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se alcanzaron unos 59.000 tokens/s (4,8 pasos/s) con batch de 12.288 tokens en una RTX PRO 6000 Blackwell. No se documentan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pssa-300m | 299,25M | No disponible (entrenado con truncado a 256) | SSM recurrente sin atención | GPL-3.0 | Hugging Face |
| Mamba-130M / Mamba-370M | 130M / 370M | 2.048 tokens (entrenamiento) | SSM selectivo | Apache-2.0 | Hugging Face |
| GPT-2 small | 124M | 1.024 tokens | Transformer con atención | MIT | Hugging Face |
| Pythia-410M | 410M | 2.048 tokens | Transformer con atención | Apache-2.0 | Hugging Face |

La comparación con Mamba es la más directa por familia arquitectónica; la comparación con GPT-2 small y Pythia-410M resulta útil por tamaño y por ser referencias habituales en experimentos from-scratch. No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa directa con estos modelos.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo "no sabe hechos": las muestras de web y de relato son invenciones en el register entrenado, no conocimiento factual.
- Riesgo alto de alucinación en cualquier consulta factual; no debe usarse como fuente de información.
- El corpus de entrenamiento es code-heavy y en inglés técnico; el rendimiento en otros idiomas y en dominios no técnicos no está documentado y probablemente sea deficiente.
- La longitud de contexto efectiva no está documentada; el truncamiento de backprop a 256 tokens y las evaluaciones a 512 tokens sugieren un contexto de trabajo corto.
- La licencia GPL-3.0 impone obligaciones de copyleft: su integración en productos propietarios requiere revisión legal y, en general, la distribución de obras derivadas bajo la misma licencia.
- El modelo se entrenó en una única GPU y con un corpus reutilizado 8,3 veces; la calidad y la cobertura factual están lejos de modelos entrenados con presupuestos mayores.
- Los bancos de memoria se entrenan por gradiente en lugar de por sorpresa, una desviación de la referencia que puede alterar el comportamiento esperado de la arquitectura original.
- No hay soporte documentado para tool calling, agentes ni despliegue en servidores de inferencia estándar (vLLM, TGI), lo que limita su uso en producción.
- El repositorio ocupa 586,9 GB, muy por encima de lo esperable para un modelo de 300M; conviene revisar qué artefactos adicionales contiene antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NSC64/pssa-300m
- Repositorio de referencia de la arquitectura: https://github.com/Sparticle62ops/pssa
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset textbook_quality_programming: https://huggingface.co/datasets/vikp/textbook_quality_programming
- Dataset open-web-math: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
