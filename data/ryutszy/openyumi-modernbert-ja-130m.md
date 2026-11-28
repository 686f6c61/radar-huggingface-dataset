# ryutszy/openyumi-modernbert-ja-130m

## Resumen

OpenYumi (`openyumi-modernbert-ja-130m`, versión v9) es un modelo especializado en la lectura contextual de kanji en japonés, desambiguación de rendaku y alineación de furigana, desarrollado por el usuario `ryutszy`. Se trata de un ajuste fino del modelo base `sbintuitions/modernbert-ja-130m`, un encoder ModernBERT de 130 millones de parámetros entrenado para japonés. El modelo resuelve un problema clásico del procesamiento del japonés: la conversión de texto kanji a kana de lectura (y a furigana alineado), una tarea en la que los modelos genéricos fallan por la ambigüedad de lecturas (heterónimos) y por la morfofonología del japonés (rendaku, sandhi numérico).

La propuesta del autor es un motor "standalone", sin dependencia de Kuroshiro ni de diccionarios externos en tiempo de inferencia, que combina una capa léxica determinista basada en la tabla Joyo de la Agencia de Asuntos Culturales (Bunkacho) con una cabeza neuronal de desambiguación contextual. El modelo se distribuye tanto en `safetensors` como en ONNX (INT8 dinámico), lo que permite su despliegue en entornos Rust, Python y C/WASM.

Es relevante ahora porque ataca una tarea de nicho con requisitos estrictos de fidelidad (cero pérdida de caracteres, cero alucinación declarada) y porque ofrece un pipeline reproducible con licencia MIT, algo poco habitual en herramientas de furigana listas para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `sbintuitions/modernbert-ja-130m` |
| Parametros totales | 142.931.411 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX INT8 dinámico (`onnx/model_int8_dynamic.onnx`); `safetensors` en BF16 según referencias del model card |
| Idiomas soportados | japonés (`ja`) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (INT8 dinámico), lexicón JSON (`lexicon/joyo_2010_bunkacho.json`, CC0) |

## Arquitectura y entrenamiento

El modelo parte de un encoder ModernBERT para japonés de 130M de parámetros y añade una cabeza de desambiguación que opera sobre representaciones contextuales. La cabeza es una "Pure-Cosine Residual Head" que extrae el vector `[h_prev, h_start, h_end, h_next, h_start*h_prev, h_end*h_next]` y calcula logits mediante similitud coseno con L2-normalización y sin sesgo (`logit_scale`). El entrenamiento emplea un esquema de "Head-First Backbone Freeze Warmup", congelando primero el backbone y entrenando la cabeza, con `AdamW(eps=1e-6)` seguro en BF16 y calibración conjunta de `sudachi_prior_beta` y `override_margin`.

El pipeline combina una vía léxica determinista (Bunkacho Joyo Orthographic & Morphophonemic Lattice Fast-Path) que resuelve morfemas no ambiguos, jukujikun del apéndice oficial, formas ligadas `被覆形`, sufijos adjetivales y sandhi de numerales y contadores japoneses (por ejemplo `9月10日 → くがつとおか`, `三割三分 → さんわりさんぶ`, `六つ → むっつ`) en menos de 0,5 ms y cubriendo más del 98,45 % del "Step-0 floor". La parte neuronal se activa solo para los casos ambiguos. El entrenamiento se realizó sobre prosa japonesa completa (`FLFL-Aozora-Speech`, `Furigana-Aozora` filtrado por Bunkacho, `Wikipedia` moderna y `Furigana-NDLBIB` filtrado por prosa), más pares mínimos simétricos sin prefijo guiados por Bunkacho. No se detalla el número total de tokens.

## Capacidades

- Lectura contextual de kanji a kana con desambiguación de heterónimos.
- Generación de furigana alineado a nivel de carácter y de frase.
- Resolución determinista de rendaku y morfofonología (sandhi numérico, contadores, sufijos adjetivales).
- Manejo de jukujikun del apéndice Joyo y formas ligadas `被覆形`.
- Tarea principal declarada: `fill-mask` (clasificación de lecturas por token).
- Ejecución standalone sin Kuroshiro ni diccionarios externos en inferencia.
- Compatibilidad con ONNX Runtime (Rust `ort`, Python `onnxruntime`, C/WASM).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Generación de furigana para textos educativos: el modelo produce lecturas alineadas a nivel de carácter sobre prosa completa, adecuado para materiales de aprendizaje de japonés donde la fidelidad de la lectura es crítica.
- Subtitulado y accesibilidad: conversión de kanji a kana de lectura para lectores con discapacidad visual o para síntesis de voz (TTS), usando la salida kana como entrada fonética.
- Normalización de texto para pipelines de TTS: la vía léxica resuelve numerales y contadores (`9月10日 → くがつとおか`) de forma determinista, reduciendo errores de pronunciación en sistemas de voz.
- Procesamiento de documentos históricos o literarios: la inclusión de `Furigana-NDLBIB` en el entrenamiento sugiere robustez ante ortografía y estilos menos modernos.
- Indexación y búsqueda fonética: convertir kanji a kana permite construir índices de búsqueda por lectura, útil en catálogos, bibliotecas digitales y motores de búsqueda internos.
- Despliegue embebido o edge: la versión ONNX INT8 dinámico y el tamaño de 130M permiten ejecutar el modelo en entornos Rust o WASM sin GPU, por ejemplo en extensiones de navegador o aplicaciones de escritorio.
- Preprocesado en pipelines NLP japoneses: como paso previo a tokenización, transliteración o análisis morfológico, aportando lecturas consistentes antes de tareas posteriores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el holdout sin fuga JKYB-Parakeet:

| Metrica | Valor |
|---|---|
| JKYB-Parakeet Target Accuracy | 0,990839 |
| Target Kana-CER (Clipped) | 0,008619 |
| Sentence Kana-CER (Clipped) | 0,006073 |
| Character Loss Rate | 0,0 |
| PyTorch vs ONNX Agreement | 1,0 |

No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 142,9M de parámetros, la inferencia en BF16 requiere aproximadamente 0,3 GB de pesos, y en ONNX INT8 en torno a 0,15 GB, más memoria de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente, e incluso CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (Python `onnxruntime`, Rust `ort`, C/WASM), `transformers` con safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la vía léxica se declara en menos de 0,5 ms por paso; no se publican cifras de latencia extremo a extremo ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| openyumi-modernbert-ja-130m | 142,9M | no disponible | Lectura de kanji / furigana | MIT |
| sbintuitions/modernbert-ja-130m (base) | ~130M | no disponible | Encoder japonés general | no disponible en esta ficha |
| Alternativas de furigana (Kuroshiro, etc.) | basadas en diccionario | no aplica | Conversión kanji-kana | variable |

La comparación cuantitativa con otras soluciones de furigana no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se declaran capacidades multilingües.
- La evaluación se basa en un único holdout declarado por el autor (JKYB-Parakeet); no hay validación independiente publicada.
- Las métricas de "0 % de alucinación" y "0 % de pérdida de caracteres" son afirmaciones del autor y deben tratarse con cautela hasta su reproducción externa.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso con textos largos.
- Al ser un ajuste fino sobre un encoder de 130M, su capacidad de razonamiento general es limitada; está diseñado para una tarea concreta.
- Riesgo de errores en heterónimos poco frecuentes o en vocabulario fuera del dominio de entrenamiento (prosa moderna, Aozora, NDLBIB).
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento citados (Aozora, NDLBIB, Wikipedia) si se redistribuye el modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ryutszy/openyumi-modernbert-ja-130m
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
