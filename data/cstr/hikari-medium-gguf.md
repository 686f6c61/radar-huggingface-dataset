# cstr/hikari-medium-GGUF

## Resumen

Hikari-medium es un modelo de traducción y reconocimiento de voz simultáneo desarrollado por SB Intuitions, distribuido aquí en formato GGUF por el usuario cstr. Se trata de una adaptación de la arquitectura Whisper-medium (encoder-decoder transformer) en la que el encoder ha sido sustituido por un encoder causal: cada 80 ms de audio el modelo decide si emite el siguiente token o espera, lo que permite traducir mientras el hablante sigue hablando en lugar de esperar al final del turno. El modelo traduce voz en inglés a texto en alemán, japonés o ruso, y también transcribe inglés a inglés.

El modelo base cuenta con 763,8 millones de parámetros y esta conversión GGUF está pensada para su uso con CrispASR (`--backend hikari`), una implementación en C/C++ sobre ggml que permite ejecución en CPU y Metal sin dependencias de Python. La relevancia actual reside en la combinación de traducción simultánea de baja latencia con un formato de pesos cuantizado y portable, algo poco habitual en modelos de voz de este tamaño.

Esta ficha documenta la conversión GGUF, no el modelo original de SB Intuitions; los pesos F16 son idénticos a los de referencia, mientras que las variantes cuantizadas introducen reglas específicas de cuantización mixta para preservar la calidad del encoder causal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-medium encoder-decoder transformer con encoder causal (streaming) |
| Parametros totales | 763.799.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio procesada en pasos de 80 ms) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K (mixta: encoder a Q8_0, decoder a Q4_K) |
| Idiomas soportados | en (entrada y transcripcion), de, ja, ru (salida de traduccion) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo parte de Whisper-medium (encoder-decoder transformer) y modifica el encoder para hacerlo causal, de modo que la representación acústica se construye de forma incremental. Sobre esa representación, una política de decisión evalúa cada 80 ms si conviene emitir el siguiente token o mantener el estado de espera (WAIT), lo que habilita la traducción simultánea. La conversión GGUF preserva la topología completa: 24 capas de encoder causal y 24 capas de decoder.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card sí documenta una innovación relevante en el proceso de cuantización: una cuantización Q4_K uniforme rompe el encoder causal (coseno mínimo de 0,36 frente al de referencia), colapsa los márgenes del logit WAIT y provoca repeticiones de palabras; por ello la variante publicada aplica cuantización mixta, con el encoder (`enc.*`) fijado como mínimo en Q8_0 y el decoder en Q4_K. Esta regla está incorporada en la herramienta `crispasr-quantize`.

## Capacidades

- Reconocimiento automático de voz en inglés (transcripción sin especificar idioma de destino).
- Traducción simultánea de voz en inglés a texto en alemán, japonés y ruso.
- Traducción en streaming: emisión de texto mientras el hablante continúa hablando, con granularidad de decisión de 80 ms.
- Integración con detección de actividad de voz (Silero VAD v6.2.0), cuya probabilidad de habla alimenta la penalización de espera de la política; sin VAD el modelo apenas emite tokens.
- Ejecución determinista en CPU y Metal con paridad de tokens verificada frente a la implementación de referencia en PyTorch.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción y traducción de voz.

## Casos de uso

- Subtitulado en directo de conferencias en inglés hacia alemán, japonés o ruso: el modelo emite texto mientras el ponente habla, lo que reduce el retardo frente a pipelines de transcripción seguidos de traducción por lotes.
- Interpretación simultánea en reuniones multilingües: con CrispASR en modo `--stream` y `--tr-tl`, el texto traducido aparece en tiempo real sobre la señal de audio en inglés.
- Generación de subtítulos para contenido grabado con requisitos de latencia moderada: en Apple M1 Metal el modelo transcribe a 0,5x tiempo real (un clip de 11 s en unos 20 s) con refresco estridado del encoder (K=16), suficiente para procesamiento por lotes cercano al tiempo real.
- Despliegue en entornos sin GPU dedicada: las variantes Q8_0 (873 MB) y Q4_K (636 MB) permiten ejecución en CPU con paridad de transcripción verificada en el clip de prueba jfk (161/161 pasos).
- Traducción de voz a texto en aplicaciones de accesibilidad: conversión de audio en inglés a texto alemán, japonés o ruso para usuarios que necesitan seguir contenido hablado en otro idioma.
- Prototipado e investigación en traducción simultánea: la implementación de referencia en `tools/reference_backends/hikari.py` y la herramienta `crispasr-diff` permiten comparar etapa por etapa (mel, encoder, logits del decoder, pasos de streaming) frente a los pesos GGUF.
- Integración en pipelines de transcripción existentes vía CLI de CrispASR, con selección de modelo automático (`-m auto`) que descarga los pesos F16 y el VAD de Silero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. La model card incluye verificaciones de paridad frente a la implementación de referencia en PyTorch:

| Clip (en→de) | Mel | Encoder cos_min | Decoder logits cos_min | Pasos de streaming | Texto |
|---|---|---|---|---|---|
| jfk.wav (11 s) | 1,000000 | 0,99978 | 0,99956 (argmax 164/164) | 161/161 | idéntico |
| jfk 0–4 s | 1,000000 | 0,99961 | 0,99996 (51/51) | 48/48 | idéntico |

Datos de velocidad y cuantización documentados:

| Variante | Tamaño | Paridad observada |
|---|---|---|
| F16 | 1,53 GB | Exacta en todos los pasos y texto; misma salida en CPU y Metal |
| Q8_0 | 873 MB | Mismo texto en jfk (159/161 pasos); en Metal cambió una frase alemana de un clip de 27 s, en CPU no |
| Q4_K (mixta) | 636 MB | Transcripción inglesa exacta en jfk (161/161 pasos) y traducción alemana coherente; 58% menor que F16 y 27% menor que Q8_0 |

Velocidad: con refresco estridado del encoder (K=16 por defecto), la transcripción en Apple M1 Metal alcanza 0,5x tiempo real, una mejora de 3,4x sobre la línea base sin estridado, preservando la paridad completa de tokens.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, F16 requiere aproximadamente 1,53 GB, Q8_0 unos 873 MB y Q4_K unos 636 MB, más overhead de runtime y del VAD de Silero (0,9 MB).
- GPU recomendadas: no se especifican en la información disponible; la model card solo documenta ejecución verificada en CPU y Apple Metal (M1).
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos es compatible con GPUs de consumo, pero no hay datos publicados de ejecución en RTX 4090 u otras.
- Opciones de despliegue: CrispASR (backend `hikari`) sobre ggml, con binarios `crispasr` y `crispasr-quantize`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,5x tiempo real en Apple M1 Metal con stride K=16; sin datos para otras plataformas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de comparaciones con modelos alternativos de traducción simultánea o streaming ASR. La model card únicamente referencia el modelo base `sbintuitions/hikari-medium` como origen de los pesos y Whisper-medium como arquitectura de partida, sin ofrecer métricas comparativas frente a otras alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hikari-medium GGUF (esta ficha) | 763,8 M | no disponible | MIT | GGUF vía CrispASR |
| sbintuitions/hikari-medium | 763,8 M | no disponible | MIT | Pesos originales en PyTorch |
| Alternativas de streaming ASR | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo acepta voz en inglés como entrada; las salidas de traducción se limitan a alemán, japonés y ruso, además de la transcripción en inglés.
- La dependencia del VAD de Silero es crítica: sin él, la probabilidad de habla no alimenta la penalización de espera y el modelo apenas emite tokens.
- La cuantización Q4_K uniforme degrada gravemente el encoder causal (coseno mínimo 0,36, colapso de márgenes WAIT y repeticiones); debe usarse la variante mixta publicada o la regla de cuantización de `crispasr-quantize`.
- La variante Q8_0 mostró una discrepancia de texto en Metal (una frase alemana de un clip de 27 s) que no se reproduce en CPU; la variante F16 es la única con paridad exacta verificada en ambas plataformas.
- No hay datos publicados sobre sesgos, tasas de alucinación ni robustez ante acentos o ruido de fondo.
- No se documentan resultados de benchmarks estándar de ASR (WER) ni de traducción (BLEU, COMET), por lo que la calidad real frente a alternativas no puede evaluarse con los datos disponibles.
- La licencia MIT permite uso comercial, pero esta ficha cubre una conversión de formato; conviene verificar la licencia del modelo base y del código de CrispASR por separado.
- El rendimiento medido (0,5x tiempo real en M1 Metal) puede ser insuficiente para aplicaciones de baja latencia estricta en hardware menos potente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/hikari-medium-GGUF
- Modelo base: https://huggingface.co/sbintuitions/hikari-medium
- Paper: https://arxiv.org/abs/2603.11578
- Código upstream: https://github.com/sbintuitions/hikari
- Implementación CrispASR: https://github.com/CrispStrobe/CrispASR
- Licencia del modelo base: https://github.com/sbintuitions/hikari/blob/main/LICENSE
