# AIOKiet/mbart-base-iwslt2015-en-vi

## Resumen

El modelo `AIOKiet/mbart-base-iwslt2015-en-vi` es un ajuste fino de `facebook/mbart-large-50-many-to-many-mmt` para traducción automática neuronal inglés → vietnamita. A pesar del nombre comercial ("mbart-base"), el repositorio contiene 611.129.542 parámetros según los pesos en safetensors, coherente con la variante large de mBART-50 y no con una supuesta variante base. Lo publica el usuario AIOKiet como parte de una comparación controlada frente a NLLB-200-Distilled-600M y EnViT5-Base.

El problema que aborda es acotado y experimental: medir la calidad de traducción en→vi de mBART-50 cuando se ajusta exclusivamente sobre IWSLT2015, sin corpus paralelos adicionales, sin back-translation, sin datos sintéticos y sin aumento de datos. Es decir, es un punto de referencia reproducible más que un modelo listo para producción multilingüe. La relevancia actual es metodológica: sirve para comparar arquitecturas encoder-decoder de ~600M parámetros bajo un presupuesto de entrenamiento fijo de dos épocas y 33.330 pasos sobre una única Tesla T4.

El entrenamiento se limita a secuencias de 128 tokens de origen y 128 de destino, con los identificadores `en_XX` y `vi_VN` del tokenizador mBART. El modelo tiene 36 descargas y 0 "likes" en el momento de redactar esta ficha, y el repositorio no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (clase `MBartForConditionalGeneration`, familia mBART-50) |
| Parametros totales | 611.129.542 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens de origen y 128 de destino en entrenamiento y evaluación; el checkpoint base dispone de embeddings posicionales hasta 1024 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (origen) y vietnamita (destino); el checkpoint base es multilingüe (50 idiomas) pero este ajuste lo especializa a en → vi |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base `facebook/mbart-large-50-many-to-many-mmt` se publica bajo MIT) |
| Formato de pesos | safetensors (tamaño de repo 2,5 GB, compatible con FP32) |
| Tamano del repositorio | 2,5 GB |
| Codigos de idioma mBART | `en_XX` (origen), `vi_VN` (destino) |
| Modelo base | `facebook/mbart-large-50-many-to-many-mmt` |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder estándar de la familia mBART-50, cargado mediante `MBartForConditionalGeneration`. El control del idioma se realiza con tokens especiales del tokenizador mBART: `en_XX` como idioma de origen y `vi_VN` forzado como token de inicio de secuencia (`forced_bos_token_id`) durante la generación. La longitud máxima se fija en 128 tokens tanto para la fuente como para el destino, con padding a longitud máxima fija; los identificadores de padding del destino se sustituyen por `-100` para que se ignoren en el cálculo de la pérdida.

El ajuste fino se hizo sobre `nguyenvuhuy/iwslt2015-en-vi` exclusivamente, con 133.317 pares de frases de entrenamiento, 1.268 de validación y 1.268 de test. No se combinó ningún corpus paralelo externo, ni back-translation, ni datos sintéticos, ni aumento de datos, ni normalización de texto adicional. Los hiperparámetros principales son: 2 épocas, 33.330 pasos, batch size efectivo 8 (sin acumulación de gradientes), optimizador AdamW con weight decay 0,01, learning rate 5e-5 con scheduler lineal y warmup ratio 0,0, norma máxima de gradiente 1,0, precisión mixta FP16 (BF16 desactivado), checkpointing de gradientes activado y semilla 42. Todo el entrenamiento se ejecutó en 1 × NVIDIA Tesla T4. El guardado de checkpoints intermedios se desactivó, por lo que el repositorio contiene únicamente el modelo final tras 33.330 pasos, aunque la mejor validación registrada fue en el paso 30.000. No se documenta ninguna innovación técnica adicional (no hay decodificación especulativa, atención lineal ni módulos híbridos).

## Capacidades

- Traducción automática unidireccional inglés → vietnamita, especializada mediante ajuste fino.
- Generación de texto secuencial condicionada (`text2text-generation`) con decodificación por beam search (beam size 5 en evaluación).
- Control explícito del idioma de destino mediante tokens especiales de mBART (`vi_VN`).
- Compatible con la librería `transformers` y con el pipeline `translation`.
- Etiquetado como `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe residual del checkpoint base no validada en este ajuste: la model card indica que el modelo se ha especializado a en → vi.
- Idiomas cubiertos por el ajuste: inglés y vietnamita únicamente.

## Casos de uso

- Traducción de transcripciones de charlas y ponencias: el modelo se entrenó sobre IWSLT2015, un corpus de charlas TED, por lo que su dominio natural es el discurso oral informal y técnico-divulgativo en inglés hacia vietnamita.
- Evaluación comparativa de arquitecturas de traducción: sirve como punto de referencia controlado de mBART-50 (~611M parámetros) frente a NLLB-200-Distilled-600M y EnViT5-Base bajo el mismo dataset y presupuesto de entrenamiento.
- Investigación en ajuste fino de bajo presupuesto: con 2 épocas y 33.330 pasos sobre una única Tesla T4, es un caso reproducible para estudiar el rendimiento de mBART-50 con recursos limitados.
- Traducción de documentación o artículos cortos: con un límite de 128 tokens por segmento, encaja en la traducción de titulares, resúmenes, descripciones de producto o párrafos breves.
- Preprocesado multilingüe en pipelines de NLP: puede generar versiones en vietnamita de textos ingleses antes de otras tareas (clasificación, indexación, búsqueda) en flujos que requieran contenido en vietnamita.
- Prototipado y docencia: al ser un modelo de 0,6B parámetros con pesos safetensors, es viable ejecutarlo en cuadernos y entornos académicos para demostrar el funcionamiento de un encoder-decoder con tokens de idioma.
- Generación de subtítulos para contenido en inglés dirigido a audiencia vietnamita: cada subtítulo suele caber en el límite de 128 tokens, que es la unidad típica de un segmento de subtitulado.

## Benchmarks y rendimiento

Los únicos resultados publicados son métricas de validación durante el entrenamiento (conjunto de validación de 1.268 pares, beam size 5, longitud máxima 128). No se publican resultados sobre el conjunto de test ni comparaciones numéricas con NLLB-200-Distilled-600M ni EnViT5-Base.

| Paso | Pérdida de entrenamiento | Pérdida de validación | BLEU ↑ | chrF++ ↑ | TER ↓ |
|---:|---:|---:|---:|---:|---:|
| 5.000 | 1,2960 | 1,391973 | 32,0714 | 51,8141 | 48,3662 |
| 10.000 | 1,2468 | 1,332993 | 33,2949 | 52,1826 | 47,2523 |
| 15.000 | 1,2007 | 1,282312 | 33,6785 | 53,0478 | 46,7918 |
| 20.000 | 0,9285 | 1,305808 | 34,0614 | 53,1207 | 46,6166 |
| 25.000 | 0,9141 | 1,274503 | 34,4174 | 53,3540 | 46,2928 |
| 30.000 | 0,8929 | 1,257898 | 34,5629 | 53,8025 | 45,9630 |

Mejores valores registrados en las evaluaciones programadas: BLEU 34,5629, chrF++ 53,8025 y TER 45,9630, todos en el paso 30.000. El checkpoint publicado corresponde al paso 33.330 (final de las 2 épocas), no al del mejor BLEU, porque el guardado de checkpoints intermedios estaba desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP32, 1,3 GB en FP16, 0,7 GB en int8 y 0,4 GB en 4 bits para los pesos; hay que sumar el overhead de activaciones y del runtime (típicamente 1-2 GB adicionales según lote y longitud).
- Cabe sin problema en GPU de consumo: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 2070 (8 GB), GTX 1660 (6 GB) e incluso GPUs de 4 GB en cuantización de 8 o 4 bits.
- GPU recomendadas para producción: NVIDIA T4 (la usada en el entrenamiento), L4, A10G o RTX 4090 para lotes grandes; A100 y H100 solo tendrían sentido por agregación de muchas réplicas, no por requisitos de memoria del modelo.
- Entrenamiento original: 1 × NVIDIA Tesla T4 con FP16 y checkpointing de gradientes, batch size 8 y 33.330 pasos.
- Opciones de despliegue: `transformers` (PyTorch) para inferencia directa; Hugging Face Inference Endpoints por la etiqueta `endpoints_compatible`; Text Generation Inference (TGI) para servir el modelo; vLLM no ofrece soporte consolidado para arquitecturas mBART encoder-decoder, por lo que no se recomienda como opción principal; llama.cpp y Ollama no incluyen conversión oficial a GGUF para mBART, por lo que no están soportados.
- Latencia y throughput estimados: no disponible (no se publican mediciones de latencia ni de tokens por segundo en inferencia).

## Comparativa con modelos similares

La model card menciona explícitamente una comparación controlada con NLLB-200-Distilled-600M y EnViT5-Base, pero no publica los resultados numéricos de esos dos modelos. La siguiente tabla recoge únicamente los datos verificables.

| Modelo | Parametros | Idiomas | Licencia | Formato | Resultados en->vi |
|---|---|---|---|---|---|
| AIOKiet/mbart-base-iwslt2015-en-vi | 611.129.542 | en → vi (base multilingüe de 50 idiomas) | No disponible | safetensors | BLEU 34,5629 / chrF++ 53,8025 / TER 45,9630 en validación |
| facebook/mbart-large-50-many-to-many-mmt (base) | no disponible en esta ficha | 50 idiomas, incluido en → vi | MIT (según el repositorio del modelo base) | safetensors | no disponible |
| NLLB-200-Distilled-600M | ~600M (según su denominación) | 200 idiomas | no disponible en esta ficha | no disponible | no disponible (mencionado como baseline en la model card, sin cifras) |
| EnViT5-Base | no disponible en esta ficha | en ↔ vi | no disponible en esta ficha | no disponible | no disponible (mencionado como baseline en la model card, sin cifras) |

## Limitaciones y advertencias

- Nombre engañoso: el identificador incluye "mbart-base" pero los pesos contienen 611.129.542 parámetros, coherentes con mBART-50 large; conviene no confundirlo con una variante base.
- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial queda en un limbo legal aunque el modelo base sea MIT. Es imprescindible aclararlo con el autor antes de cualquier despliegue en producción.
- Unidireccionalidad: solo se ha ajustado y evaluado para inglés → vietnamita; no hay garantía de calidad en vietnamita → inglés ni en otros pares de idiomas del checkpoint base.
- Límite de 128 tokens: cualquier segmento más largo debe dividirse, lo que degrada la coherencia entre frases y puede romper referencias anafóricas.
- Dominio restringido: el entrenamiento usa exclusivamente IWSLT2015, un corpus de charlas orales; el rendimiento fuera de ese registro (texto legal, médico, técnico especializado, jerga coloquial) no ha sido evaluado.
- Sin resultados de test publicados: todas las métricas son de validación, y el conjunto de validación tiene solo 1.268 pares, lo que da intervalos de confianza amplios.
- Selección de checkpoint ausente: el modelo publicado es el de la época 2 (paso 33.330), no el de mejor BLEU (paso 30.000); además, el mejor checkpoint no se conservó, así que no es posible reproducir exactamente el resultado de 34,5629 BLEU.
- Riesgo de alucinación y de omisión: al ser un modelo seq2seq de 0,6B parámetros entrenado con solo 133.317 pares, puede generar traducciones fluidas pero fielmente incorrectas, omitir información o repetir fragmentos, especialmente en frases largas o poco frecuentes.
- Sesgos potenciales: los heredados del corpus IWSLT2015 (charlas TED, con sobrerrepresentación de determinados temas, registros y variedades del inglés) y del checkpoint mBART-50; no hay evaluación de sesgo de género, dialecto ni contenido cultural.
- Validación comunitaria nula: 36 descargas y 0 "likes" en el momento del análisis, sin terceros que hayan replicado los resultados.
- Procesamiento sin normalización: no se aplicó normalización de texto, back-translation ni filtrado adicional, lo que puede aumentar la sensibilidad a mayúsculas, puntuación y ruido de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIOKiet/mbart-base-iwslt2015-en-vi
- Modelo base: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Dataset de ajuste fino: https://huggingface.co/datasets/nguyenvuhuy/iwslt2015-en-vi
- Paper de mBART-50: https://arxiv.org/abs/2008.00401
- Paper original de mBART: https://arxiv.org/abs/2001.08210
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las búsquedas devolvieron únicamente resultados sin relación (listados de lodges de safari en África).
