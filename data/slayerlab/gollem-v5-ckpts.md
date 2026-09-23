# SlayerLab/gollem-v5-ckpts

## Resumen

GoLLeM-v5 es una familia de checkpoints de investigación de modelos de lenguaje en inglés de muy pequeño tamaño (16M y 32M parámetros), desarrollada por SlayerLab. Se trata de decodificadores Transformer estilo GPT, herederos directos de la línea nanoGPT, entrenados específicamente para competir en la [Glint Tiny-ML Leaderboard](https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard). El repositorio no publica un modelo único, sino cuatro checkpoints dentro de un estudio de escalado controlado de un solo factor: misma arquitectura, mismos hiperparámetros y misma semilla (1337), variando únicamente el número de tokens de entrenamiento y la anchura del modelo.

La relevancia de esta publicación es metodológica más que práctica. El estudio aísla dos variables y extrae conclusiones concretas: los tokens de entrenamiento impulsan las métricas de conocimiento gramatical (BLiMP sube aproximadamente +1,8 puntos por cada duplicación de tokens entre 3,2B y 10B, sin saturar), mientras que la capacidad del modelo y el conocimiento factual impulsan ARC-Easy (el salto de 16M a 32M con los mismos 10B tokens aporta +3,07 puntos). La ventana de contexto es de 1024 tokens y el tokenizador es un BPE compartido con vocabulario de 12.288 entradas.

Son modelos base, sin ajuste por instrucciones, en inglés exclusivamente, con licencia Apache 2.0. El propio autor advierte que no están pensados para uso en producción: su conocimiento factual y su coherencia son muy limitados por el rango de 16-32M parámetros. Su valor está en servir como banco de pruebas reproducible para estudios de eficiencia, destilación y protocolos de evaluación a escala mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje nanoGPT), embeddings posicionales aprendidos, embeddings de entrada y salida atados |
| Parametros totales | 17,4M (variante 16M: L6, d_model 408, 6 cabezas) y 31,4M (variante 32M: L6, d_model 576, 9 cabezas) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible: no se publican pesos cuantizados; los checkpoints son state dicts de PyTorch en precision de entrenamiento (bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`ckpt.pt`), no safetensors ni pesos compatibles con `transformers.AutoModel` |
| Tokenizador | BPE propio, vocabulario 12.288 (`tokenizer.json`), compartido por todos los checkpoints |
| Tamano del repositorio | 1,2 GB (incluye los cuatro checkpoints y el codigo de evaluacion) |
| Semilla de entrenamiento | 1337 (identica en todos los checkpoints) |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de la estirpe nanoGPT, con embeddings posicionales aprendidos y pesos de embedding de entrada y de salida atados (tied embeddings). Se publican dos anchuras: la variante de 16M usa 6 capas, d_model 408 y 6 cabezas de atención (17,4M parámetros reales, por encima de la etiqueta comercial); la variante de 32M usa 6 capas, d_model 576 y 9 cabezas (31,4M parámetros). No hay innovaciones de atención (nada de atención lineal, SSM ni decodificación especulativa): es un decoder denso convencional, deliberadamente simple para que el estudio de escalado no se contamine con variables adicionales.

El entrenamiento usa AdamW con learning rate de 6e-4 a 6e-5 con decaimiento coseno, batch de 64 secuencias de 1024 tokens (65.536 tokens por paso), precisión bf16 y una única RTX 5090 en RunPod. Los datos provienen de `SlayerLab/minimal-en-corpus-5b`, un corpus en inglés de aproximadamente 5.400 millones de tokens BPE-12k, descontaminado contra los conjuntos de test de los benchmarks. La mezcla es amplia y de alta calidad: FineWeb-Edu, DCLM, StackExchange, open-web-math, FineMath, artículos científicos, libros y Gutenberg, código y CC-News. Una expansión descontaminada hasta aproximadamente 8.300 millones de tokens (con FineWeb-Edu adicional y ciencia de OpenStax) alimenta las ejecuciones posteriores. El checkpoint de 16M que ve 16B tokens lo hace sobre los 8.290 millones de tokens únicos del corpus expandido, lo que equivale a unas 1,9 épocas, por debajo del límite de degradación por repetición que el autor sitúa en 2x.

## Capacidades

- Generación de texto en inglés a nivel de continuaciones cortas y coherentes localmente, sin ajuste por instrucciones.
- Modelado de lenguaje base: puntuación de verosimilitud de secuencias, cálculo de perplejidad y bits-per-byte.
- Preferencia gramatical: el protocolo BLiMP mide la capacidad de asignar mayor probabilidad a la frase gramatical frente a la agramatical (67 configuraciones del split de entrenamiento).
- Resolución de preguntas de conocimiento básico en formato de elección múltiple (ARC-Easy, zero-shot).
- Capacidad de código y matemáticas elementales, derivada de las porciones de StackExchange, open-web-math, FineMath y código del corpus, aunque no cuantificada con benchmarks específicos en la información disponible.
- No soporta tool calling ni function calling: no hay plantilla de chat, ni entrenamiento por instrucciones, ni tokens especiales de herramienta documentados.
- No soporta agentes ni razonamiento multi-paso: es un modelo base, sin modo «thinking» ni cadena de pensamiento.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo: nulo fuera del inglés; el tokenizador y el corpus son monolingües.

## Casos de uso

- Estudio de leyes de escalado a escala mínima: el repositorio está diseñado como un experimento de factor único, de modo que un investigador puede reproducir la comparación 3,2B vs 6B vs 10B tokens manteniendo arquitectura, semilla e hiperparámetros, y verificar si las conclusiones sobre BLiMP y ARC-Easy se sostienen en su propio hardware.
- Banco de pruebas de protocolos de evaluación: los scripts `glint_parity_eval.py` y `train_gpt_ref.py` incluidos en el repo permiten validar una implementación propia de BLiMP, ARC-Easy y WikiText-2 contra un protocolo publicado, con recorte a 256 tokens y log-probabilidad cruda. Es útil para comprobar la paridad entre `lm-eval-harness` y protocolos alternativos.
- Modelo alumno en experimentos de destilación: con 17,4M o 31,4M parámetros y licencia Apache 2.0, es un candidato razonable para estudiar cuánta capacidad de un profesor grande se puede comprimir antes de que ARC-Easy colapse, sin las restricciones de licencia de modelos mayores.
- Pruebas de infraestructura de entrenamiento e inferencia: al caber en cualquier GPU consumer y entrenarse en una única RTX 5090, sirve para validar pipelines de datos, checkpoints, precisiones y monitorización antes de escalar a modelos de miles de millones de parámetros.
- Experimentos de tokenización: el vocabulario BPE-12k es compartido por todos los checkpoints, lo que permite estudiar el efecto del tamaño de vocabulario y de la segmentación en métricas byte-normalizadas como WikiText-2 BPB sin confundirlo con cambios de arquitectura.
- Evaluación de corpus y curación de datos: la comparación entre el corpus base de 5,4B tokens y la expansión a 8,3B (FineWeb-Edu y OpenStax) permite medir de forma directa cuánto aporta la adición de datos educativos y científicos a una capacidad fija.
- Generación de texto sintético corto para pruebas unitarias: continuaciones de menos de 1024 tokens en inglés, útiles para poblar tests de pipelines de NLP sin coste de inferencia apreciable.
- Demostraciones educativas: al ejecutarse en CPU, permite ilustrar de forma tangible el funcionamiento de un GPT, el efecto del overtraining y la diferencia entre tamaño y datos en un aula o taller.

## Benchmarks y rendimiento

Resultados publicados por el autor, bajo el protocolo Glint (`Glint-1.3/benchmark.py`): BLiMP con 67 configuraciones sobre el split de entrenamiento y frases recortadas a 256 tokens, preferencia por log-probabilidad cruda sin normalización por longitud; ARC-Easy sobre el split de test en zero-shot con `LL(question + choice) - LL(question)`; WikiText-2 en bits-per-byte normalizados por byte.

| Checkpoint | Parametros | Forma | Tokens vistos | BLiMP | ARC-Easy | WikiText-2 BPB |
|---|---|---|---|---|---|---|
| `bpe16m_3.2B/ckpt.pt` | 17,4M | L6 d408 h6 | 3,2B | 67,40 | 38,22 | 1,2161 |
| `bpe16m_6B/ckpt.pt` | 17,4M | L6 d408 h6 | 6B | 68,92 | 39,10 | 1,1943 |
| `bpe16m_10B/ckpt.pt` | 17,4M | L6 d408 h6 | 10B | 70,36 | 39,52 | 1,1815 |
| `bpe32m_baseline/ckpt.pt` | 31,4M | L6 d576 h9 | 10B | 70,08 | 42,59 | 1,124 |

Notas sobre la medición: una ejecución genérica con `lm-eval-harness` puntúa aproximadamente 2-3 puntos porcentuales más alto en BLiMP y ARC que este protocolo, por lo que las cifras de la tabla no son directamente comparables con las de otros repositorios que usen el harness estándar. No se han publicado resultados de benchmarks comparativos frente a otros modelos en la información disponible; el autor solo ofrece una estimación de posición en la leaderboard (aproximadamente #18/74 para el checkpoint de 16M a 10B tokens y #20/74 para el de 32M), calculada reconstruyendo la fórmula de puntuación del tablero y validándola contra el puesto público de un modelo de referencia. El propio autor la califica de estimación, no de entrada confirmada.

## Requisitos de hardware

- VRAM para inferencia: 17,4M parámetros en bf16 ocupan unos 35 MB y en fp32 unos 70 MB; 31,4M parámetros en bf16 ocupan unos 63 MB y en fp32 unos 126 MB. La caché KV estimada a partir de la arquitectura es de aproximadamente 9,6 KB por token en la variante de 16M y 13,8 KB por token en la de 32M, es decir, alrededor de 10 MB y 14 MB respectivamente para los 1024 tokens de contexto completo.
- Cabe en cualquier GPU consumer y también en CPU. Una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes; el entrenamiento de referencia se realizó en una única RTX 5090. Los 1,2 GB del repositorio corresponden a los cuatro checkpoints juntos, no a un único modelo en memoria.
- GPU recomendadas: ninguna en particular, dado el tamaño. Para reproducir el entrenamiento completo (10B tokens vistos, batch 65.536 tokens por paso) se necesita una GPU con soporte bf16 y una cantidad considerable de tiempo de cómputo; la referencia del autor es una RTX 5090.
- Opciones de despliegue: los checkpoints son state dicts crudos de nanoGPT, no pesos de `transformers`. Por tanto no se cargan directamente con `AutoModel` ni con herramientas que esperen safetensors o un `config.json` estándar. El repositorio incluye `train_gpt_ref.py` con la definición del GPT y la lógica de `load_state_dict` con recorte de logits al vocabulario de 12.288. vLLM, TGI, llama.cpp y Ollama no son compatibles de forma nativa; requerirían convertir los pesos a un formato soportado, conversión que no se proporciona. La vía práctica es inferencia directa con PyTorch y el tokenizador de la librería `tokenizers`.
- Latencia y throughput: no disponible; el autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos publicados en la información disponible para este modelo, por lo que la comparación se limita a características estructurales verificables en la documentación pública de cada alternativa.

| Modelo | Parametros | Longitud de contexto | Licencia | Formato de pesos | Comentario |
|---|---|---|---|---|---|
| GoLLeM-v5 (16M) | 17,4M | 1024 | Apache 2.0 | State dict de PyTorch | Estudio de escalado con checkpoints a 3,2B, 6B y 10B tokens |
| GoLLeM-v5 (32M) | 31,4M | 1024 | Apache 2.0 | State dict de PyTorch | Variante de mayor anchura, mismo presupuesto de 10B tokens |
| Pythia-14M | 14M | 2048 | Apache 2.0 | safetensors, compatible con `transformers` | Suite con ordenamiento causal documentado y checkpoints intermedios públicos |
| GPT-2 small | 124M | 1024 | Licencia MIT modificada | safetensors y formatos originales de OpenAI | Referencia histórica, contexto idéntico pero casi 4x más parámetros |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, compatible con `transformers` | Alternativa moderna de pequeño tamaño, ya con soporte de tooling estándar |

La diferencia operativa principal frente a las alternativas es el formato: GoLLeM-v5 exige código propio para cargar los pesos, mientras que Pythia, GPT-2 y SmolLM se integran directamente en el ecosistema `transformers`.

## Limitaciones y advertencias

- Modelos base sin ajuste por instrucciones: no siguen instrucciones, no mantienen formato de chat y no están alineados con preferencias humanas. No se ha aplicado RLHF ni DPO según la información disponible.
- Conocimiento factual y coherencia muy limitados: con 16-32M parámetros, el autor advierte explícitamente de que no están pensados para uso en producción. Es esperable un índice elevado de afirmaciones incorrectas o incoherentes en cualquier tarea de conocimiento.
- Idioma único: solo inglés. No hay capacidades multilingües y el tokenizador está optimizado para ese corpus.
- Contexto corto: 1024 tokens, muy por debajo de los 2048-128K que ofrecen alternativas contemporáneas. No es adecuado para tareas de contexto largo ni para conversaciones multi-turno extensas.
- Formato no estándar: al ser state dicts crudos de nanoGPT, no funcionan con el ecosistema estándar de despliegue (vLLM, TGI, Ollama, llama.cpp) sin una conversión manual que el repositorio no incluye.
- Riesgo de memorización: el autor afirma que el entrenamiento a 1,9 épocas sobre el corpus expandido no ha producido memorización observable y que la pérdida de validación es sana, pero se trata de una comprobación reportada por el propio autor y no verificada de forma independiente.
- Cifras de leaderboard no confirmadas: las posiciones estimadas (#18/74 y #20/74) son reconstrucciones de la fórmula de puntuación, no entradas oficiales. Cualquier comparación con modelos del tablero debe tomarse con cautela.
- Protocolo de evaluación propio: las métricas usan el protocolo Glint (recorte a 256 tokens, log-probabilidad cruda), que difiere entre 2 y 3 puntos porcentuales de `lm-eval-harness`. Comparar estas cifras con las de otras fichas sin ajustar el protocolo produce conclusiones erróneas.
- Advertencia de escala: aunque la licencia Apache 2.0 permite uso comercial sin restricciones, la utilidad práctica de un modelo de este tamaño en producción es muy reducida salvo como componente experimental o como alumno destilado.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o representación demográfica en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SlayerLab/gollem-v5-ckpts
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/minimal-en-corpus-5b
- Glint Tiny-ML Leaderboard: https://huggingface.co/spaces/Glint-Research/Tiny-ML-Leaderboard
- Otros enlaces (papers, blogs, repositorios o demos): no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
