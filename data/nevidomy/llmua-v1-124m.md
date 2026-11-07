# nevidomy/llmua-v1-124m

## Resumen

LLMUA v1 · 124M es un modelo de lenguaje de 124.280.320 parámetros entrenado desde cero para ucraniano por Vitalii Nevidomyi (usuario `nevidomy` en Hugging Face). No es un ajuste de un modelo multilingüe existente: emplea una arquitectura decoder-only propia (`model_type: llmua`) con RMSNorm pre-norm, SwiGLU, RoPE, QK-norm por cabeza aplicada antes de RoPE, sin sesgos y con embeddings de entrada y salida atados. Su contexto es de 2.048 tokens y el tokenizador es un BPE a nivel de byte de 32.768 tokens entrenado sobre el propio corpus.

Su relevancia no reside en el rendimiento absoluto, sino en su papel dentro de un estudio controlado de leyes de escala: cuatro modelos menores predijeron la pérdida de este modelo antes de entrenarlo y las predicciones se cumplieron (0,9704 previsto frente a 0,9549 medido en bits por carácter sobre validación retenida). El modelo se entrenó con 9,94B tokens (80 tokens por parámetro, unas 3,94 pasadas sobre un corpus de 2,52B tokens de FineWeb-2 `ukr_Cyrl` y Wikipedia ucraniana) usando el optimizador Muon en las matrices ocultas y AdamW en embeddings y parámetros 1-D, todo ello en una única RTX 5090.

Es un modelo base: continúa texto y no sigue instrucciones. Existe una versión ajustada publicada aparte (`nevidomy/llmua-v1-124m-sft`). La licencia de los pesos es CC BY-SA 4.0 y el código del modelo es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only propia (`model_type: llmua`): pre-norm RMSNorm, SwiGLU MLP, RoPE, per-head QK-norm antes de RoPE, sin sesgos, embeddings atados |
| Parametros totales | 124.280.320 (99.114.496 no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32, tal como se entrenaron) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | CC BY-SA 4.0 (pesos); Apache-2.0 (codigo del modelo) |
| Formato de pesos | safetensors (float32) |
| Capas / anchura | 14 capas, anchura 768, 12 cabezas de 64, MLP de 2.048 |
| Tokenizador | BPE a nivel de byte, 32.768 tokens, entrenado sobre el corpus de entrenamiento |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de diseño propio con 14 capas, anchura 768, 12 cabezas de atención de 64 dimensiones y MLP SwiGLU de anchura 2.048. Incorpora RMSNorm pre-norm, RoPE y una normalización QK por cabeza aplicada antes de RoPE; no usa términos de sesgo y ata los embeddings de entrada y salida. El tokenizador es un BPE a nivel de byte de 32.768 tokens entrenado sobre el corpus de entrenamiento, que antepone un token BOS a la entrada.

El entrenamiento consumió 9,94B tokens (80 tokens por parámetro, aproximadamente 3,94 pasadas) sobre 2,52B tokens de texto ucraniano limpiado y normalizado procedente de FineWeb-2 (`ukr_Cyrl`) y de Wikipedia ucraniana. Se usó Muon (lr 4,5e-4) sobre las matrices de pesos ocultas y AdamW (lr 1,19e-3, β 0,9/0,95) sobre embeddings y parámetros 1-D, con weight decay 0,1 en tensores 2-D y 0 en las normas, y recorte de gradiente de 1,0. El schedule fue warmup–stable–decay: 200 pasos de warmup y decaimiento lineal sobre el último 20% de tokens hasta 0,1× la tasa pico. El lote fue de 32.768 tokens por paso y se aplicó enmascaramiento de documentos en bloque (block-diagonal) durante el entrenamiento. Todo el entrenamiento se realizó en una única RTX 5090.

## Capacidades

- Generación de texto en ucraniano: continuación de texto coherente y fluida a nivel de frase, propio de un modelo base.
- Modelado de lenguaje: puntuación mediante pérdida de lenguaje (bits por carácter), que es la única evaluación reportada.
- Manejo de contexto de hasta 2.048 tokens, suficiente para párrafos o documentos cortos.
- Capacidad multilingüe: limitada al ucraniano; no se reporta soporte de otros idiomas.
- Tool calling / function calling: no disponible; no hay ajuste para ello.
- Agentes y razonamiento multi-paso: no disponible; es un modelo base sin instrucciones.
- Modo thinking, visión o audio: no disponible.
- Ajuste de instrucciones: no incluido en esta versión (existe una variante SFT separada).

## Casos de uso

- Estudio de leyes de escala en lenguas de bajos recursos: el modelo sirve como punto de referencia verificable para validar predicciones de pérdida en una escala de 124M parámetros, útil en investigación sobre planificación de entrenamiento.
- Modelado y puntuación de texto ucraniano: calcular bits por carácter o perplejidad sobre corpus ucranianos para evaluar la calidad de otros modelos o la limpieza de datasets, gracias a su tokenizador entrenado en ucraniano y su contexto de 2.048 tokens.
- Generación de texto asistida en ucraniano: completar borradores, titulares o párrafos con muestreo (temperatura 0,8, top-p 0,95) en entornos donde se requiera un modelo pequeño y de licencia abierta.
- Punto de partida para ajuste fino (fine-tuning): al ser un modelo base pequeño (124M parámetros, 0,5 GB), es adecuado para experimentos de SFT o DPO en una sola GPU de consumo, como demuestra la variante SFT publicada.
- Investigación educativa y reproducción: su tamaño permite reproducir el entrenamiento y la evaluación en hardware asequible (una RTX 5090), lo que lo hace útil para docencia y validación de metodologías.
- Filtrado y aumento de datos en ucraniano: usar la pérdida del modelo para detectar texto anómalo o mal normalizado en pipelines de curación de corpus.
- Prototipado de aplicaciones de texto en ucraniano con requisitos de licencia compatible (CC BY-SA 4.0) y despliegue en CPU o GPU modesta.

## Benchmarks y rendimiento

Resultados en bits por carácter (bpc, puntos de código Unicode); menor es mejor.

| Evaluacion | bpc |
|---|---|
| Conjunto de validación retenido (6.097 ventanas de 2.048 tokens) | 0,9549 |
| Corpus Brown-Ucraniano, documentos | 1,0756 |
| Brown-Ucraniano, 32.960 frases, regla de puntuación de uk4b | 1,3267 |
| uk4b Large (774M), mismas frases, puntuado con su propio código | 1,4665 |

La pérdida registrada antes del entrenamiento para este horizonte fue 0,9704; el modelo midió 0,9549 (paper, tabla 2). Brown-Ucraniano se usó solo para evaluación, nunca para entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 124,28M de parámetros ocupan aproximadamente 0,5 GB de pesos; con overhead de activaciones y caché KV para 2.048 tokens, cabe holgadamente en GPUs de 4-8 GB. En cuantización a 8 bits o 4 bits (no publicada oficialmente, pero viable con herramientas estándar) el peso baja a ~0,12-0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una RTX 5090, pero la inferencia es viable en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (código incluido en el repo) o instalando el paquete `llmua_hf` desde GitHub y registrándolo. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura personalizada, requeriría conversión o implementación específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| LLMUA v1 · 124M | 124,28M | 2.048 | CC BY-SA 4.0 | ucraniano | Modelo base desde cero, arquitectura propia, evaluación solo por bpc |
| uk4b Large | 774M | no disponible | no disponible | ucraniano | Referencia de comparación del autor; bpc 1,4665 en Brown-Ucraniano con su propia regla de puntuación |
| Modelos multilingües pequenos (p. ej. variantes ~100-200M) | ~100-200M | variable | variable | multilingüe | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con benchmarks estándar ni con alternativas de la misma categoría más allá de uk4b Large; el resto de datos comparativos no está disponible.

## Limitaciones y advertencias

- Solo ucraniano; el texto proviene de fuentes web y enciclopédicas, con los sesgos asociados.
- Con 124M parámetros escribe con fluidez pero comete errores factuales con frecuencia; no es fiable para información factual.
- Tiende a repetirse con decodificación greedy; se recomienda muestreo (temperatura 0,8, top-p 0,95).
- No tiene ajuste de instrucciones ni de seguridad; reproduce los sesgos del texto web.
- Solo se ha evaluado mediante pérdida de modelado de lenguaje; no hay evaluación de tareas downstream.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia CC BY-SA 4.0 para los pesos: permite uso comercial, pero obliga a compartir obras derivadas bajo la misma licencia y a dar atribución; conviene revisar las implicaciones para productos propietarios.
- El código del modelo es Apache-2.0, pero los datos de entrenamiento tienen sus propias licencias (FineWeb-2 ODC-By 1.0; Wikipedia CC BY-SA 4.0).
- Requiere `trust_remote_code=True` o la instalación del paquete `llmua_hf`, lo que añade una dependencia de código de terceros en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nevidomy/llmua-v1-124m
- Versión ajustada (SFT): https://huggingface.co/nevidomy/llmua-v1-124m-sft
- Paper (PDF): https://github.com/nevidomy/llmua_v1/blob/main/paper/llmua_paper1.pdf
- Código: https://github.com/nevidomy/llmua_v1
- Paquete de registro: https://github.com/nevidomy/llmua_v1#subdirectory=release/hf/llmua_hf
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset UkrLM-wiki: https://huggingface.co/datasets/ruvimx/UkrLM-wiki
