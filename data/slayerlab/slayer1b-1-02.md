# SlayerLab/Slayer1B-1.02

## Resumen

Slayer1B 1.02 es un modelo de lenguaje causal de tipo decoder-only desarrollado por SlayerLab, con 1.073.912.851 parámetros y orientación principal al polaco (con inglés como idioma secundario). Se trata de un entrenamiento *from scratch*, no de un ajuste fino de un modelo existente: los pesos son un state dict de PyTorch en safetensors y no un `AutoModel` de `transformers`, por lo que requiere el cargador propio incluido en el repositorio.

La versión 1.02 es una continuación del entrenamiento de 1.01: el run se reanudó desde el checkpoint 2250 (antes del decaimiento del learning rate de 1.01) y se prolongó hasta el paso 5720, duplicando los tokens vistos hasta 5.997.854.720 (aproximadamente 5,6 tokens por parámetro). A partir de esta release el autor elimina el decaimiento final del learning rate: el preentrenamiento continúa sobre un corpus preparado de unos 24.000 millones de tokens y el decaimiento se aplicará una sola vez al final de la línea Slayer1B.

Su relevancia es doble: por un lado, es un ejemplo documentado de entrenamiento reproducible a pequeña escala (8 × RTX 5090, 32 GB, DDP, optimizador Muon combinado con AdamW, curvas y checkpoints publicados); por otro, ofrece una referencia monolingüe polaca con métricas de morfosintaxis (BLiMP, MultiBLiMP Polish) y conocimiento (ARC-Easy-PL) que permiten seguir la evolución del modelo release a release. No dispone de ajuste por instrucciones ni de RLHF: es un modelo base de completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (20 capas, `d_model` 2048, 16 cabezas de atención MHA con `head_dim` 128) |
| Parametros totales | 1.073.912.851 (embeddings de entrada y salida atados, contados una vez) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | polaco (pl) e inglés (en); el polaco es el idioma dominante del corpus |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (state dict plano de PyTorch, fp32; tamaño del repo 4,3 GB). No es compatible con `AutoModel` de `transformers` |
| Tokenizer | BPE a nivel de byte, 32.768 tokens (`tokenizer.json`), EOS id 0 |
| Bloques | pre-norm RMSNorm, QK-norm, RoPE (θ = 500.000), value residual, MLP SwiGLU (hidden 5462), sin biases |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con 20 capas y `d_model` 2048, atención multi-cabeza clásica (16 cabezas, dimensión por cabeza 128, sin GQA), normalización pre-norm con RMSNorm, QK-norm, RoPE con θ = 500.000, MLP SwiGLU con capa oculta de 5462 y ausencia total de biases. Incorpora *value residual* (una conexión residual sobre los valores de atención) y embeddings de entrada y salida atados. El vocabulario es de 32.768 tokens con tokenizer BPE a nivel de byte y EOS en el id 0. No hay decodificación especulativa, atención lineal ni componentes SSM/MoE.

El entrenamiento usó el corpus `SlayerLab/slayer-pl-8x3b` (revisión `d50df04a…`), consumido como un único flujo de ventanas de 4096 tokens sin repetición. La mezcla declarada en pesos (tokens cl100k) es: web 0,63, core 0,19, legal 0,08, inglés 0,10; en tokens del tokenizer propio, el pack-02 queda en 52,09 % web, 21,63 % core, 8,66 % legal y 17,62 % inglés, y el pack-03 en 51,68 / 22,27 / 8,59 / 17,46. Cada pack usa una porción web disjunta y documentos seleccionados por intervalos de hash no solapados. Se aplicó un enmascarado basado en reglas de datos personales con etiquetas `[EMAIL]`, `[TELEFON]`, `[PESEL]`, `[NIP]`, `[REGON]` y `[DOWOD]`.

El run se ejecutó sobre 8 × NVIDIA RTX 5090 (32 GB) en DDP, con batch de 256 × 4096 = 1.048.576 tokens por paso y 5720 pasos totales (5.997.854.720 tokens). Se reanudó en el paso 2250 desde `ckpt_2250.pt` de 1.01 y corrió hasta el 5720 a throughput aproximado de 113.000 tokens/s. El schedule es de learning rate constante 6e-4 (inicialmente había un decaimiento previsto desde el paso 4578, eliminado en el paso 3300 sin discontinuidad en la loss). El optimizador es Muon (lr 0,02) para las matrices de pesos ocultas y AdamW (lr 6e-4, weight decay 0,1) para el resto. La loss final de entrenamiento fue 2,4187 en el paso 5720 (media de los pasos 5630-5720: 2,4379). No se aplicó RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva y completado de secuencias en polaco e inglés; sin plantilla de chat ni modo instrucciones.
- Modelado de lenguaje puro: puntuación por log-probabilidad de secuencias, útil para métricas de aceptabilidad gramatical y filtrado de corpus.
- Razonamiento de sentido común y conocimiento factual de nivel básico (ARC-Easy 48,99 % de acierto en zero-shot).
- Conocimiento morfosintáctico del polaco medido con MultiBLiMP Polish (98,38 % de acierto) y con el conjunto BLiMP en inglés (74,71 %).
- Capacidad multilingüe limitada a pl/en; el polaco es el idioma dominante y el inglés se incluye con un 10 % de la mezcla.
- No soporta tool calling ni function calling: no hay formato de herramientas ni entrenamiento con instrucciones.
- No soporta razonamiento multi-paso guiado por agente ni *thinking mode*; no hay tokens especiales de razonamiento.
- No tiene visión, audio ni ninguna modalidad adicional: la entrada es únicamente texto tokenizado.
- Base adecuada para *fine-tuning* supervisado posterior (clasificación, instrucciones, dominio legal) gracias a licencia Apache 2.0 y pesos abiertos.

## Casos de uso

- Filtrado de calidad de corpus polacos: calcular la perplejidad por documento con el modelo y descartar textos atípicos o mal formados antes de usarlos en un pipeline de preentrenamiento; la ventana de 4096 tokens permite puntuar fragmentos completos sin truncar.
- Puntuación de aceptabilidad gramatical: usar la log-probabilidad de pares mínimo/agramatical al estilo BLiMP para construir un corrector o un *reranker* lingüístico para polaco, aprovechando el 98,38 % en MultiBLiMP Polish.
- Generación de datos sintéticos en polaco: completar prefijos de dominio (legal, web, core) para aumentar corpus de ajuste fino o aumentar la cobertura de un dataset de evaluación interno.
- Punto de partida para un modelo instructivo polaco: aplicar SFT sobre los pesos base para obtener un asistente conversacional de 1B parámetros desplegable en una sola GPU consumer.
- Experimentación académica en escalado de leyes: al publicar curvas, checkpoints con estado del optimizador y protocolo de evaluación reproducible, sirve para estudiar el efecto del learning rate constante frente al decaimiento final en modelos de ~1B.
- Extracción de características y embeddings contextuales: usar los estados ocultos de las 20 capas como representación para clasificación de texto, clustering o búsqueda semántica en corpus polacos.
- Prototipado de autocompletado de texto en aplicaciones de escritura en polaco, con la limitación de 4096 tokens de contexto y sin instrucciones.

## Benchmarks y rendimiento

Protocolo del leaderboard de `track.fabryka.ai` (`glint_parity_eval.py`, sha256 `d7a38ca0…`): zero-shot, log-probabilidades crudas sumadas en BLiMP, accuracy cruda en ARC-Easy y chunks no solapados de 256 tokens en WikiText-2, en fp32 y sobre el checkpoint final de cada release.

| Metrica | 1.00 | 1.01 | 1.02 |
|---|---:|---:|---:|
| Tokens de entrenamiento | 1,50 B | 3,00 B | 6,00 B |
| Final del entrenamiento | decaimiento de lr | decaimiento de lr | lr constante (sin decaimiento) |
| ARC-Easy, accuracy % (2.376) | 42,89 | 47,98 | 48,99 |
| BLiMP, accuracy % (67.000) | 71,51 | 73,63 | 74,71 |
| WikiText-2, perplejidad por byte (↓) | 2,5857 | 2,4230 | 2,3735 |
| MultiBLiMP Polish, accuracy % (3.272) | 97,89 | 98,29 | 98,38 |
| ARC-Easy-PL, accuracy % (2.376) | 36,91 | 40,36 | 41,84 |

Comparación emparejada 1.01 (paso 2860) → 1.02 (paso 5720), mismos ítems, bootstrap emparejado de 10.000 remuestreos con intervalo del 95 %:

| Tarea | Diferencia (pp) | Intervalo 95 % | Lectura |
|---|---:|---|---|
| BLiMP | +1,08 | [+0,78; +1,37] | mejora positiva |
| ARC-Easy-PL | +1,47 | [−0,13; +3,07] | no resuelto |
| ARC-Easy | +1,01 | [−0,67; +2,74] | no resuelto |
| MultiBLiMP Polish | +0,09 | [−0,40; +0,58] | no resuelto |

El autor advierte que esta comparación mezcla dos cambios simultáneos (el doble de tokens y la ausencia de decaimiento final del learning rate), por lo que ninguna diferencia puede atribuirse a uno solo de ellos. Además, la loss de entrenamiento en los mismos batches del paso 2800 fue 2,507 en 1.01 (en su decaimiento) y 2,581 en 1.02 (lr constante), de modo que las puntuaciones de 1.02 y posteriores no son directamente comparables con las de 1.01 en la curva de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 4,3 GB de pesos más activaciones y caché KV; en bf16/fp16 baja a unos 2,2 GB. La caché KV para 4096 tokens con 20 capas y 16 cabezas de dimensión 128 es modesta (del orden de cientos de MB por secuencia en fp16).
- Cuantización a int8 (≈1,1 GB) o int4 (≈0,6 GB) es viable por tamaño, pero no hay artefactos publicados: habría que generarlos a partir del state dict.
- Cabe holgadamente en GPU consumer: RTX 4090 (24 GB), RTX 4080/4070 Ti (12-16 GB), RTX 3090/3060 (12-24 GB) e incluso GPUs de 8 GB en bf16 con margen para el contexto completo.
- El entrenamiento se realizó con 8 × RTX 5090 de 32 GB en DDP; reproducirlo requiere un nodo de 8 GPU de esa clase o equivalente.
- Despliegue: no es un `AutoModel` de `transformers`; hay que usar el cargador incluido (`load_slayer.load(...)`, clase `GPT` en `train_gpt_ref_r23.py`) y el `tokenizer.json` con la librería `tokenizers`. No hay soporte nativo en vLLM, TGI, Ollama ni llama.cpp, y no se han publicado adaptadores. La arquitectura (RMSNorm + RoPE + SwiGLU + MHA sin biases) es próxima a la familia Llama, pero el *value residual* es no estándar y complica una conversión directa a GGUF sin trabajo adicional.
- Latencia y throughput de inferencia: no disponibles. El único dato publicado es el throughput de entrenamiento (≈113.000 tokens/s en 8 × RTX 5090), que no es extrapolable a inferencia.

## Comparativa con modelos similares

No hay evaluaciones directas entre estos modelos bajo el mismo protocolo, por lo que la comparación se limita a especificaciones publicadas y no a rendimiento medido.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / ecosistema |
|---|---|---|---|---|---|
| Slayer1B 1.02 | 1,07 B | 4096 | pl, en | Apache 2.0 | safetensors con cargador propio; fuera de `transformers` |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | `transformers`, GGUF, amplio soporte |
| Llama 3.2 1B | 1,24 B | 128.000 | multilingüe | Licencia comunitaria Llama 3.2 | `transformers`, GGUF, vLLM, Ollama |
| Qwen2.5-1.5B | 1,54 B | 32.768 | multilingüe (incluye polaco) | Apache 2.0 (mayoría de variantes) | `transformers`, GGUF, vLLM, Ollama |

Rendimiento comparado bajo un protocolo común: no disponible. Las cifras de Slayer1B (ARC-Easy 48,99; BLiMP 74,71; WikiText-2 2,3735 de perplejidad por byte) proceden de un leaderboard propio y no son directamente trasladables a los benchmarks habituales de los modelos de la tabla.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a preguntas ni sigue instrucciones de forma fiable; genera continuaciones.
- Ventana de contexto de solo 4096 tokens, muy por debajo de los modelos actuales de su tamaño; no apta para documentos largos sin troceado.
- Cobertura lingüística reducida a polaco e inglés; el rendimiento en castellano no está evaluado y previsiblemente será bajo.
- Riesgo de alucinación y de generar contenido factualmente incorrecto: en ARC-Easy se sitúa en 48,99 % y en ARC-Easy-PL en 41,84 %, cerca del azar en conocimiento zero-shot.
- Sesgos: la mezcla incluye un 63 % de web sin filtrado semántico documentado más allá del enmascarado de datos personales; no se han publicado análisis de sesgo ni evaluaciones de toxicidad.
- El enmascarado de datos personales es basado en reglas y el propio autor advierte que no garantiza la eliminación de todos los datos personales.
- No se ha ejecutado la comprobación de solapamiento de 13-gramas de los packs 02 y 03 contra los conjuntos de evaluación, por lo que existe riesgo de contaminación no medida en las cifras reportadas.
- Las puntuaciones de 1.02 no son comparables con las de 1.01 en la curva de entrenamiento (lr constante frente a decaimiento) y la comparación emparejada mezcla dos cambios.
- Licencia Apache 2.0 permite uso comercial, pero al no haber artefactos de despliegue estándar el coste de integración en producción recae en el equipo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni reportes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints de entrenamiento con estado del optimizador: https://huggingface.co/SlayerLab/Slayer1B-1.02-checkpoints
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/21ae1234-82c2-42b7-887b-cbcc69901ae1
- Leaderboard y protocolo de evaluación: https://track.fabryka.ai/models
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Paper, blog o repositorio adicionales: no disponible (la búsqueda web no devolvió resultados relevantes para este modelo).
