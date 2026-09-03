# scholzmx/parakeet-tdt-0.6b-v3-gguf

## Resumen

El modelo `scholzmx/parakeet-tdt-0.6b-v3-gguf` es una colección de archivos GGUF cuantizados del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v3`, desarrollado por NVIDIA. Este modelo base emplea una arquitectura FastConformer combinada con un transductor TDT (Time-Delayed Transformer) y está diseñado para el reconocimiento de voz multilingüe en 25 idiomas europeos, incluyendo español, inglés, alemán, francés e italiano, entre otros.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo ASR de alta calidad en hardware con recursos limitados, reduciendo el tamaño del modelo de aproximadamente 2,5 GB (en precisión f32) a tamaños que van desde los 906 MB (Q8_0) hasta los 325 MB (IQ2_XXS). El autor, scholzmx, ha aplicado un proceso de cuantización calibrada utilizando una matriz de importancia (imatrix) recopilada sobre audio real de los 25 idiomas soportados, lo que minimiza la pérdida de precisión en los niveles de cuantización más altos.

Estos archivos GGUF siguen el contrato de tensores de Starling y requieren el motor de inferencia `starling-serve` o la librería `libstarling_ggml` para su ejecución. No son compatibles con llama.cpp, whisper.cpp o parakeet.cpp. La licencia del modelo base es CC-BY-4.0, lo que permite su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT transducer |
| Parametros totales | 627.090.582 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K, IQ2_XXS |
| Idiomas soportados | en, de, fr, es, it, nl, pl, pt, ru, uk, sv, da, fi, cs, sk, sl, hr, bg, el, hu, ro, et, lv, lt, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (Starling tensor contract) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` utiliza una arquitectura FastConformer, una variante eficiente del conformer optimizada para velocidad, combinada con un decodificador transductor TDT. Esta combinación es especialmente adecuada para tareas de ASR en streaming y no streaming, ofreciendo un buen equilibrio entre latencia y precisión.

El proceso de cuantización aplicado por scholzmx utiliza la pipeline de cuantización de Starling, que implementa niveles de cuantización de bloques similares a los de llama.cpp (Q8_0 hasta IQ2). La característica distintiva es el uso de una matriz de importancia (imatrix) recopilada sobre audio real de FLEURS train, con 48 clips por idioma en 24 de los 25 idiomas soportados (el esloveno no estuvo disponible durante la recopilación). Esta matriz pondera las escalas de bloque durante la cuantización, lo que permite que los niveles Q4_K_M y superiores sean indistinguibles del modelo en f32 en términos de WER.

Los lineales de la capa joint/LSTM de 640 filas se mantienen automáticamente en Q8_0 en todos los niveles de cuantización, siguiendo la regla de tamaño de bloque. El modelo base fue entrenado por NVIDIA, aunque los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información proporcionada.

## Capacidades

- Reconocimiento de voz automático (ASR) multilingüe en 25 idiomas europeos: inglés, alemán, francés, español, italiano, neerlandés, polaco, portugués, ruso, ucraniano, sueco, danés, finés, checo, eslovaco, esloveno, croata, búlgaro, griego, húngaro, rumano, estonio, letón, lituano y maltés.
- Transcripción de audio a texto con alta precisión, verificada mediante WER (Word Error Rate) con intervalos de confianza bootstrap.
- Soporte para audio limpio y con ruido (verificado con audio con ruido de 5 dB).
- Múltiples niveles de cuantización que permiten adaptar el modelo a diferentes restricciones de memoria y requisitos de calidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto, ya que es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede transcribir conversaciones en tiempo real o de forma diferida en múltiples idiomas europeos, lo que resulta útil para herramientas de productividad empresarial y generación de actas automáticas.
- Subtitulado automático de vídeos: su soporte multilingüe permite generar subtítulos para contenido audiovisual en 25 idiomas, reduciendo costes de producción y acelerando el flujo de trabajo.
- Asistentes de voz y sistemas de dictado: el modelo puede integrarse en aplicaciones de dictado por voz para entornos médicos, legales o de desarrollo de software, con la ventaja de poder ejecutarse localmente en hardware modesto gracias a las versiones cuantizadas.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir y analizar llamadas de soporte en varios idiomas para extraer métricas de calidad, detectar problemas recurrentes o entrenar modelos de análisis de sentimiento.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones, clases o eventos públicos puede facilitar la inclusión de personas con problemas de audición en entornos educativos y laborales.
- Procesamiento de archivos de audio en lote: su capacidad para ejecutarse en GPU o CPU con recursos limitados permite procesar grandes volúmenes de audio (podcasts, archivos de radio, entrevistas) de forma eficiente y económica.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de WER (Word Error Rate) medidos en el conjunto de test de FLEURS, con intervalos de confianza bootstrap al 95%. Los datos comparan el modelo en f32 con varias versiones cuantizadas:

| Build | Aleman (WER) | Ingles (WER) |
|---|---|---|
| f32 (2508 MB) | 5.30 [4.48–6.14] | 6.50 [5.57–7.36] |
| q4_k_m (704 MB) | 5.31 [4.49–6.16] | 6.41 [5.55–7.24] |
| q2_k (574 MB) | 6.03 [5.19–6.91] | 6.36 [5.51–7.24] |
| iq2_xxs + shrink16 (325 MB) | 9.38 [8.30–10.44] | 8.39 [7.34–9.36] |

La media de WER en 25 idiomas es: f32 14.0, q2_k 16.9 e iq2_xxs 26.4 (48 clips por idioma). La degradación en iq2_xxs se concentra principalmente en los idiomas lituano, letón, esloveno, maltés, húngaro y eslovaco. No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varían entre 325 MB (IQ2_XXS) y 906 MB (Q8_0), por lo que el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas y tarjetas de gama baja.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde GTX 1650 hasta RTX 4090 o A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, todas las versiones cuantizadas caben en GPUs de consumo de 4 GB o más, e incluso las versiones más pequeñas pueden ejecutarse en dispositivos con 512 MB de VRAM.
- Opciones de despliegue: el modelo requiere el binario nativo `starling-serve` o la librería `libstarling_ggml` del repositorio Starling. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos ASR en la información proporcionada. Sin embargo, por su arquitectura y propósito, los modelos comparables serían:

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| nvidia/parakeet-tdt-0.6b-v3 (base) | 627M | 25 | CC-BY-4.0 | safetensors |
| scholzmx/parakeet-tdt-0.6b-v3-gguf | 627M | 25 | CC-BY-4.0 | GGUF (Starling) |
| whisper-small (OpenAI) | 244M | ~100 | MIT | safetensors, GGUF |

La comparación con whisper-small es orientativa: whisper-small tiene más idiomas pero una arquitectura diferente (encoder-decoder transformer) y un rendimiento inferior en idiomas europeos según benchmarks públicos. No se dispone de datos de WER comparativos en la información proporcionada.

## Limitaciones y advertencias

- Los archivos GGUF de este repositorio no son compatibles con llama.cpp, whisper.cpp ni parakeet.cpp; requieren específicamente el motor Starling (`starling-serve` o `libstarling_ggml`).
- La versión IQ2_XXS (325 MB) degrada significativamente la precisión en idiomas minoritarios (lt, lv, sl, mt, hu, sk), con una media de WER en 25 idiomas de 26.4 frente al 14.0 del modelo f32. Solo se recomienda para despliegues centrados en inglés.
- El modelo es exclusivamente de reconocimiento de voz; no puede generar texto, responder preguntas ni realizar tareas de razonamiento.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al autor original (NVIDIA) y al autor de la cuantización.
- No se proporciona información sobre la longitud de contexto, por lo que no se conocen las limitaciones de duración de audio que puede procesar el modelo.
- El modelo puede presentar sesgos en el reconocimiento de acentos, dialectos o habla no nativa, especialmente en los niveles de cuantización más agresivos.
- La calibración de la imatrix se realizó con 48 clips por idioma de FLEURS train; el esloveno no se incluyó en la recopilación, aunque el autor indica que la mezcla de idiomas de calibración no es un factor medible en el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scholzmx/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio Starling: https://github.com/sims1253/starling
