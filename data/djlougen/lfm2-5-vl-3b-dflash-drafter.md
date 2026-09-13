# DJLougen/LFM2.5-VL-3B-DFlash-drafter

## Resumen

El LFM2.5-VL-3B-DFlash-drafter es un modelo borrador (drafter) de decodificación especulativa publicado por el usuario DJLougen sobre el modelo objetivo LiquidAI/LFM2.5-VL-3B. No es un modelo de lenguaje generativo autónomo: su única función es proponer bloques de tokens que el modelo objetivo verifica a continuación, de modo que la salida final es idéntica token a token a la del objetivo. Se distribuye con licencia Apache 2.0 y 742.413.312 parámetros reales.

Técnicamente es un decodificador estilo Qwen3 de 4 capas, con hidden size 2048 y FFN intermedio de 6144, que aplica difusión de bloques (block diffusion) con tamaño de bloque 7 y esquema anchor-first. El runtime de llama.cpp lo reconoce como arquitectura `dflash` y lo carga mediante `--model-draft`, inyectando los estados ocultos de las capas [1, 10, 18, 27] del modelo objetivo a través de una capa lineal de fusión que produce una característica de contexto de 8192 dimensiones.

Su relevancia es principalmente metodológica y de reproducibilidad: es un artefacto de investigación entrenado con un presupuesto muy ajustado (~91M tokens de fineweb-edu) que alcanza una tasa de aceptación medida de 0,113 con `n_max=3`. El propio autor lo publica como punto de partida y banco de pruebas, no como una aceleración lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `dflash` (decodificador estilo Qwen3 de 4 capas) |
| Parámetros totales | 742.413.312 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo objetivo (vía `--override-kv lfm2.context_length=int:131072` y rope scaling yarn con contexto original 32.768); el drafter opera sobre bloques de 7 tokens |
| Tipos de cuantización | GGUF F16 con pesos de normalización y capa `fc` en F32; los pesos safetensors se almacenan en fp32 (procedentes de bf16) |
| Idiomas soportados | no disponible (depende del tokenizador heredado de LiquidAI/LFM2.5-VL-3B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y GGUF (`LFM2.5-VL-3B-DFlash-drafter.gguf`) |

Parámetros arquitectónicos adicionales:

| Campo | Valor |
|---|---|
| Hidden size | 2048 |
| FFN intermedio | 6144 |
| Capas | 4 |
| Cabezas de atención | 16 Q / 8 KV, head-dim 128 |
| Vocabulario | 128.000 (mask id 125017 = `[PAD125017]`) |
| Tamaño de bloque | 7 |
| Anchor-first | `sample_from_anchor = true` |
| Capas objetivo (espacio de ids de entrenamiento) | [1, 10, 18, 27] |
| Capas objetivo (metadatos GGUF) | [2, 11, 19, 28] |
| Dimensión de característica fusionada | 4 x 2048 = 8192 |

## Arquitectura y entrenamiento

El drafter es un backbone de 4 capas al estilo Qwen3 con atención de 16 cabezas de consulta y 8 de clave/valor (head-dim 128). En cada paso de borrador el runtime introduce `[anchor, <mask> x (block_size-1)]` y el modelo «desruidifica» las posiciones enmascaradas hasta producir `block_size-1` tokens candidatos. Una única capa lineal `fc` fusiona los estados ocultos del modelo objetivo correspondientes a las capas configuradas en una característica de contexto de 8192 dimensiones, que se inyecta como fuente K/V del lado del borrador. El drafter mantiene su propio embedding de tokens y una cabeza de salida atada inicializada a partir de los embeddings de LFM2.5, de forma que los ids de token quedan alineados 1:1 con el vocabulario del objetivo. Se usa vocabulario completo, sin mapeo reducido `d2t`.

El entrenamiento se realizó sobre el split `sample-10BT` de fineweb-edu en streaming, tokenizado con el tokenizador de LFM2.5: 1,29 GiB de `tokens.npy` (~322M tokens), reservando el último 0,5% como conjunto de validación. La pérdida es una entropía cruzada enmascarada de difusión de bloques aplicada a las 6 posiciones no ancla de cada bloque. Se entrenó en bf16 con AMP sobre una H100 NVL, con batch 8 x secuencia 2048 y un throughput de ~16,5k tok/s. El optimizador fue AdamW (beta 0.9/0.95, weight decay 0,01), con LR de cuerpo 5e-4, LR de embeddings 1e-4, decaimiento coseno, 300 pasos de warmup y recorte de gradiente 1.0.

El presupuesto efectivo fue de ~91M tokens (pérdida ~5,9; el registro final alcanza 98,1M tokens con pérdida 5,76 y un mínimo de 5,68 en el paso 5600). La curva de pérdida, en medias de tramos de 40 pasos, evoluciona de 8,31 a 7,0, 6,3 y 5,9. El checkpoint publicado es `step005600`; la ejecución se interrumpió en el paso 6000 al agotarse la cuota de disco del contenedor mientras se escribía el siguiente checkpoint, y no se reentrenó.

## Capacidades

- Generación de borradores de tokens (borrado especulativo) para decodificación sin pérdida junto a LiquidAI/LFM2.5-VL-3B: cada token propuesto se verifica contra el modelo objetivo.
- Borrado por difusión de bloques con tamaño 7 y esquema anchor-first, con hasta `n_max=3` tokens especulativos por ronda en la configuración verificada.
- Integración nativa con llama.cpp: el runtime autodetecta el tipo especulativo `draft-dflash` a partir de los metadatos del modelo.
- Alineación de vocabulario 1:1 con el objetivo (128.000 entradas) mediante embedding propio y cabeza de salida atada inicializada desde LFM2.5.
- Generación de texto autónoma: no soportada de forma práctica (es un modelo borrador, no un LM independiente).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en el drafter; la componente de visión corresponde al modelo objetivo LFM2.5-VL-3B, no a este artefacto.

## Casos de uso

- Investigación en decodificación especulativa con difusión de bloques: sirve como implementación de referencia reproducible de un drafter `dflash` sobre un LM objetivo de 3B, con curvas de pérdida, hiperparámetros y métricas de aceptación documentadas.
- Punto de partida para reentrenamiento: dado que el autor publica el checkpoint intermedio y el pipeline, es un punto de arranque razonable para extender el entrenamiento más allá de los 91M tokens y tratar de superar el objetivo de aceptación de 0,4.
- Banco de pruebas de llama.cpp: permite validar la ruta de código `draft-dflash` (autodetección, `n_max`, `n_min`, `p_min`, `block_size`, `mask_token_id`, `n_extract`, `sample_from_anchor`) en builds con soporte dflash.
- Evaluación de aceptación sobre dominios concretos: al ser un drafter entrenado solo con fineweb-edu, permite medir la degradación de aceptación al cambiar de dominio (código, matemáticas, conversación) y decidir si conviene un drafter especializado.
- Docencia y divulgación técnica: es un ejemplo compacto (742M parámetros, 4 capas) para explicar cómo funcionan el borrado especulativo, la inyección de estados ocultos del objetivo y la verificación token a token.
- Estudio de arquitecturas híbridas drafter-objetivo: la discrepancia entre las capas objetivo del entrenamiento ([1, 10, 18, 27]) y las del GGUF ([2, 11, 19, 28]) lo convierte en un caso útil para analizar el efecto del desajuste de índices de capa en la aceptación.
- Comparación de estrategias de borrado en llama.cpp: se puede enfrentar contra decodificación especulativa basada en n-gramas o contra un modelo pequeño de la misma familia usado como `--model-draft` para medir latencia real por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de lenguaje (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las únicas métricas publicadas son de aceptación del borrador y de entrenamiento:

| Métrica | Valor | Condiciones |
|---|---|---|
| Acceptance rate (greedy top-1) | 0,113 | n_max=3, 60 secuencias de 511 tokens, split held-out de texto general |
| Top-1 slot agreement | 0,171 | mismas condiciones |
| Longitud media aceptada | 0,34 | mismas condiciones |
| Pérdida final de entrenamiento | 5,76 (mínimo 5,68 en el paso 5600) | difusión de bloques, 98,1M tokens registrados |
| Evolución de la pérdida | 8,31 → 7,0 → 6,3 → 5,9 | medias por tramos de 40 pasos |
| Tokens de entrenamiento | ~91M (registro final 98,1M) | fineweb-edu `sample-10BT` |
| Throughput de entrenamiento | ~16,5k tok/s | H100 NVL, bf16 AMP, batch 8 x seq 2048 |

Verificación funcional publicada por el autor:

| Prompt | Respuesta | `draft_n` | `draft_n_accepted` |
|---|---|---|---|
| "What is 2+2? Answer in one word." | "Four" | 3 | 0 |

## Requisitos de hardware

- Peso del drafter: 742.413.312 parámetros. Estimación aritmética según precisión: ~1,48 GB en F16 (formato publicado), ~2,97 GB en FP32, ~0,79 GB en Q8 y ~0,42 GB en Q4. Estas cifras son cálculos a partir del número de parámetros, no mediciones publicadas.
- Tamaño del repositorio: 4,5 GB en total (safetensors en fp32 más el GGUF F16).
- Modelo objetivo: LFM2.5-VL-3B; en el ejemplo del autor se carga una cuantización Q4_K_M junto al drafter.
- KV cache: con `-c 131072` y `-ctk f16 -ctv f16` el consumo es elevado, pero no se dispone de la cifra exacta porque no se publican el número de capas ni las cabezas KV del modelo objetivo. No disponible.
- GPU verificada: H100 NVL con build CUDA fijada. El autor confirma funcionamiento extremo a extremo en ese hardware.
- GPU de consumo: por tamaño, el drafter solo cabe holgadamente en cualquier GPU con 4 GB o más (RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). El conjunto objetivo + drafter en cuantizaciones bajas requeriría del orden de 4-6 GB, pero a 131.072 tokens de contexto la KV cache domina y no hay medición publicada.
- Opciones de despliegue: llama.cpp con `llama-server --model-draft`, commit `c7bda030e` o posterior con soporte dflash. vLLM, SGLang y TGI no están soportados: requerirían su propio adaptador DFlash. El paquete `dflash` incluido en el repositorio es solo la referencia del lado transformer.
- Latencia y throughput de inferencia: no disponibles. Con una aceptación medida de 0,113 y longitud media aceptada de 0,34, es esperable que la decodificación especulativa no aporte ganancia neta de velocidad frente a la decodificación normal en texto general.

Comando de referencia del autor:

```bash
llama-server \
  --model ~/models/lfm25vl/LFM2.5-VL-3B-Q4_K_M.gguf \
  --model-draft ~/models/lfm25vl/LFM2.5-VL-3B-DFlash-drafter.gguf \
  -c 131072 -ngl 99999 -fa on -ctk f16 -ctv f16 \
  --rope-scaling yarn --yarn-orig-ctx 32768 \
  --override-kv lfm2.context_length=int:131072 \
  --spec-draft-n-max 3 \
  --host 0.0.0.0 --port 8081
```

## Comparativa con modelos similares

No se dispone de datos numéricos comparables en la información proporcionada (ni parámetros, ni contexto, ni tasas de aceptación) para las alternativas de la misma categoría. La comparación se limita a características cualitativas.

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B-DFlash-drafter | Drafter de difusión de bloques (dflash) para llama.cpp | 742.413.312 | Opera sobre el contexto del objetivo (131.072 en la configuración del autor) | Apache 2.0 | HuggingFace; solo llama.cpp |
| EAGLE-3 | Drafter autoregresivo sobre características del objetivo | no disponible | no disponible | no disponible | Integrado en runtimes como vLLM y SGLang; no disponible como modelo en este repositorio |
| Cabezas Medusa | Cabezas adicionales de predicción múltiple sobre el modelo objetivo | no disponible | no disponible | no disponible | Implementaciones de investigación; no disponible |
| Modelo pequeño del mismo tokenizador como `--model-draft` | Decodificación especulativa con vocabulario alineado | no disponible | no disponible | según el modelo elegido | Ampliamente soportado en llama.cpp |
| Decodificación especulativa por n-gramas / lookup | Borrador sin modelo neuronal | no aplica | no aplica | no aplica | Nativa en llama.cpp |

Diferencias destacables frente a las alternativas: este drafter es específico para la arquitectura `dflash` y para LiquidAI/LFM2.5-VL-3B, usa difusión de bloques (no decodificación autoregresiva token a token), inyecta estados ocultos de capas concretas del objetivo y no recurre a mapeo de vocabulario reducido.

## Limitaciones y advertencias

- Tasa de aceptación baja: 0,113 de aceptación greedy top-1 y longitud media aceptada de 0,34, muy por debajo del objetivo de 0,4 que se marca el propio autor. En la práctica esto puede traducirse en una latencia por token igual o peor que la decodificación normal.
- Artefacto de investigación, no de producción: la model card lo declara explícitamente como publicación para reproducibilidad y punto de partida.
- Entrenamiento truncado: solo ~91M tokens efectivos y el checkpoint final (`step005600`) es el último completo porque el entrenamiento se interrumpió en el paso 6000 por falta de espacio en disco. No hubo reentrenamiento.
- Sesgo de dominio: el único corpus de entrenamiento es fineweb-edu (`sample-10BT`), texto web educativo en inglés, con el tokenizador de LFM2.5. No hay datos sobre comportamiento en otros dominios o idiomas.
- Idiomas soportados: no disponibles. La cobertura multilingüe del drafter depende del tokenizador heredado y no está documentada ni evaluada.
- Riesgo de alucinación: no aplica al resultado final, porque cada token propuesto se verifica contra el modelo objetivo y la salida es idéntica a la del objetivo. El riesgo reside en el modelo objetivo, no en el drafter.
- Desajuste de índices de capa: el entrenamiento usa el espacio de ids [1, 10, 18, 27] y los metadatos del GGUF declaran [2, 11, 19, 28] como índices de estados ocultos. Conviene verificar esta correspondencia antes de reutilizar el artefacto.
- Compatibilidad restringida: solo funciona en compilaciones de llama.cpp con soporte dflash (commit `c7bda030e` o posterior). No hay soporte para vLLM, SGLang ni TGI, y el paquete `dflash` del repositorio es únicamente la referencia del lado transformer.
- Vocabulario y máscara: el GGUF fija `tokenizer.ggml.mask_token_id = 125017` y vocabulario de 128.000 entradas; usar un objetivo con otro vocabulario rompe la alineación.
- Licencia: Apache 2.0, con la matización del autor de que los pesos entrenados se publican para investigación y que se replica la licencia upstream donde corresponda. Conviene revisar la licencia del modelo base antes de un uso comercial.
- Adopción mínima: 52 descargas y 0 «likes» en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/LFM2.5-VL-3B-DFlash-drafter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- llama.cpp (repositorio, commit de referencia `c7bda030e`): https://github.com/ggml-org/llama.cpp
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo ni con IA open source (corresponden a simuladores de ruleta en línea). No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo en la información proporcionada.
