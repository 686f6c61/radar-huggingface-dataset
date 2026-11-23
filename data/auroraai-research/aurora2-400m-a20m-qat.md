# AuroraAI-Research/Aurora2-400M-A20M-QAT

## Resumen

Aurora2-400M-A20M-QAT es la versión cuantizada con entrenamiento consciente de cuantización (QAT) del modelo de lenguaje Aurora2-400M-A20M, desarrollado por AuroraAI-Research. Se trata de un transformer de tipo Mixture-of-Experts (MoE) disperso con 399.597.454 parámetros totales y 19.050.382 parámetros activos por token, comprimido mediante LittleBit-2, un método de cuantización binaria de bajo rango combinado con destilación de conocimiento desde el modelo original.

El interés de esta release es fundamentalmente metodológico: demuestra hasta qué punto se puede comprimir un MoE de routing top-1 manteniendo la estructura funcional. Los expertos enrutados, que concentran aproximadamente el 98% de los parámetros, se almacenan a unos 0,5 bits por peso, mientras que la atención y el experto compartido se mantienen a unos 4 bits por peso. El checkpoint resultante ocupa 27,5 MB frente a los 799 MB del modelo base en FP16.

La contrapartida es una pérdida sustancial de calidad: el índice de inteligencia cae de 21,38 a 10,83 y los benchmarks de conocimiento común retroceden entre 3 y 10 puntos. Además, la compresión afecta al almacenamiento y a la descarga, no a la memoria ni a la velocidad en inferencia, ya que el cargador expande los signos a tensores FP32 y reconstruye los pesos en cada forward pass. Es, por tanto, un modelo de investigación más que una opción de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (12 capas, hidden size 192, atención GQA con 6 cabezas query y 2 KV, dimensión de cabeza 32, RoPE) |
| Parámetros totales | 399.597.454 |
| Parámetros activos | 19.050.382 por token |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | LittleBit-2 binaria (±1) en expertos enrutados (~0,5 bits por peso); ~4 bits por peso en atención y experto compartido; INT4 con grupo de tamaño 32 en embeddings y tablas n-gram; FP16 en router, normas, gates y escalares |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos empaquetados propietarios (signos binarios empaquetados 8 por byte, escalas FP16, INT4 con escalas FP16); cargador personalizado en `modeling_aurora2_littlebit.py` |
| Tamaño en disco | 27,5 MB (frente a 799 MB del base en FP16) |
| Vocabulario | 16.384 tokens (BPE a nivel de byte, entrenado desde cero) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base. Cada capa combina 32 expertos enrutados (SwiGLU, FFN de 1.776) más 1 experto compartido (SwiGLU, FFN de 256). El routing es softmax en FP32, top-1 y sin descarte (dropless), con sesgo de router aprendido. Incluye componentes adicionales como embeddings de n-gramas con hashing, conexiones residuales de embedding, residuales de valor, gates de atención por cabeza y soft-capping de logits a 30 con cabeza de salida atada a los embeddings de tokens. El modelo base se preentrenó con 100B tokens (texto web, matemáticas, Wikipedia y datos de chat/QA) en unas 36 horas sobre una RTX Pro 6000.

La cuantización LittleBit aproxima cada matriz de pesos como `W ≈ diag(h) · U · diag(l) · Vᵀ · diag(g)`, donde `U` y `V` son factores binarios (±1) de bajo rango y `h`, `l` y `g` son vectores de escala FP16. Se ajusta un segundo camino de la misma forma sobre el residual del primero. LittleBit-2 inicializa los factores a partir de una SVD de los pesos originales y los rota con una matriz ortogonal compartida (obtenida con Joint-ITQ) antes de la binarización, lo que mejora el punto de partida sin coste en inferencia.

El entrenamiento consciente de cuantización usa el modelo original como profesor: divergencia KL sobre los logits, MSE relativo de estados ocultos en cada bloque y un término KL que mantiene la distribución del router de cada capa próxima a la del profesor, ya que la deriva de routing es la principal vía por la que el ruido de cuantización rompe un MoE top-1. Los signos se binarizan en el forward pass y los gradientes usan un sustituto suave (SmoothSign, retropropagación a través de `tanh(kx)`). Se empleó AdamW con warm-up y decaimiento coseno durante 80.000 pasos de 32 secuencias × 1.024 tokens, unos 2,6B tokens de FineWeb-Edu (`sample-10BT`).

## Capacidades

- Generación de texto en inglés con un contexto máximo de 2.048 tokens.
- Razonamiento básico y conocimiento común, con calidad notablemente degradada respecto al modelo base.
- No se documentan capacidades de código, matemáticas avanzadas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo de pensamiento (thinking mode) ni decodificación especulativa.
- Beam search no soportado; la generación se detiene en BOS o EOS.

## Casos de uso

- Investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar cómo afecta la compresión binaria de bajo rango a un MoE top-1, comparando la degradación por benchmark frente al modelo base.
- Estudio de deriva de routing: permite analizar empíricamente si el término KL sobre la distribución del router preserva la asignación de tokens a expertos tras la binarización, un fenómeno poco documentado en la literatura.
- Desarrollo de kernels de matmul binaria: dado que el modelo solo es eficiente con kernels dedicados, es un caso de prueba realista para implementar y validar kernels de multiplicación binaria en GPU.
- Distribución de modelos en entornos con ancho de banda mínimo: con 27,5 MB, el checkpoint cabe en cualquier artefacto de despliegue, lo que facilita prototipos de pipelines de descarga y carga en dispositivos restringidos.
- Docencia y divulgación: el contraste entre tamaño en disco (27,5 MB frente a 799 MB) y coste real en memoria y velocidad ilustra con claridad la diferencia entre compresión de almacenamiento y compresión de cómputo.
- Validación de recetas QAT con destilación: la combinación de KL sobre logits, MSE de estados ocultos y KL de router es reproducible y sirve como referencia para adaptar la receta a otros MoE pequeños.
- Evaluación comparativa de robustez: útil para medir cuánto degrada la cuantización binaria tareas de sentido común (HellaSwag, PIQA) frente a tareas de razonamiento más exigente (ARC-Challenge), donde la caída es menor.

## Benchmarks y rendimiento

Precisión zero-shot (`acc_norm`, %) con ±1 error estándar. Ambos modelos evaluados con ajustes idénticos.

| Benchmark | Azar | Aurora2-400M-A20M | Aurora2-400M-A20M-QAT | Δ |
|---|---|---|---|---|
| HellaSwag | 25 | 38,36 ±0,49 | 28,17 ±0,45 | −10,19 |
| ARC-Easy | 25 | 48,06 ±1,03 | 39,90 ±1,00 | −8,16 |
| ARC-Challenge | 25 | 26,02 ±1,28 | 23,12 ±1,23 | −2,90 |
| PIQA | 50 | 67,14 ±1,10 | 58,54 ±1,15 | −8,60 |

| Métrica agregada | Base | QAT |
|---|---|---|
| Intelligence Index | 21,38 | 10,83 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el cargador expande los signos a FP32 y reconstruye los pesos en cada forward pass, por lo que el consumo de memoria es comparable al del modelo base (799 MB en FP16) y no se beneficia de la compresión.
- GPU recomendadas: no disponible. El modelo base se entrenó en una RTX Pro 6000, lo que sugiere que la inferencia cabe en GPUs de gama profesional o consumer con suficiente VRAM para el modelo expandido.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base (menos de 1 GB en FP16), aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y cargador personalizado (`modeling_aurora2_littlebit.py`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la velocidad no mejora respecto al modelo base salvo que se añadan kernels dedicados de matmul binaria.
- Restricciones de inferencia: batch size 1 o lotes sin padding, beam search no soportado, generación detenida en BOS o EOS.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Tamaño en disco | Calidad (Intelligence Index) |
|---|---|---|---|---|---|---|
| Aurora2-400M-A20M-QAT | 399.597.454 | 19.050.382 | 2.048 | Apache 2.0 | 27,5 MB | 10,83 |
| Aurora2-400M-A20M (base) | 399.597.454 | 19.050.382 | 2.048 | Apache 2.0 | 799 MB (FP16) | 21,38 |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE pequeño cuantizado a bits bajos) en la información proporcionada.

## Limitaciones y advertencias

- Degradación notable de calidad: caída de 10,19 puntos en HellaSwag, 8,60 en PIQA, 8,16 en ARC-Easy y 2,90 en ARC-Challenge respecto al modelo base.
- El Intelligence Index se reduce prácticamente a la mitad (de 21,38 a 10,83).
- La compresión no reduce memoria ni latencia en inferencia: los signos se expanden a FP32 y los pesos se reconstruyen en cada forward pass, salvo que se implementen kernels binarios dedicados.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre FineWeb-Edu y datos web, es esperable heredar sesgos de ese corpus, pero no se cuantifican.
- Riesgo de alucinación: elevado por el tamaño reducido del modelo y la pérdida adicional de calidad por cuantización; no se documenta mitigación específica.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Solo inglés; sin soporte multilingüe.
- Requiere `trust_remote_code=True` y un cargador personalizado, lo que añade superficie de riesgo y dependencia del código del autor.
- No soporta beam search ni lotes con padding; restringe los pipelines de generación estándar.
- Licencia Apache 2.0: permite uso comercial, pero la calidad degradada hace desaconsejable su uso en producción sin evaluación previa.
- El repositorio no incluye copia densa en FP32, BF16 o FP16, por lo que no es posible recuperar el modelo base desde este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M-QAT
- Modelo base: https://huggingface.co/AuroraAI-Research/Aurora2-400M-A20M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
