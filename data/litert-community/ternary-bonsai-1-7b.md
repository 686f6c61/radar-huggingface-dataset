# litert-community/Ternary-Bonsai-1.7B

## Resumen

Ternary-Bonsai-1.7B es un paquete de pesos cuantizados en formato ternario (INT2) publicado por la organización litert-community, derivado de prism-ml/Ternary-Bonsai-1.7B-unpacked y, en última instancia, del modelo Qwen3-1.7B de Alibaba Cloud. No se trata de un modelo entrenado desde cero: son cuantizaciones posteriores al entrenamiento (post-training quantization) y reempaquetados de un checkpoint ya publicado, sin reentrenamiento, fine-tuning ni datos de calibración adicionales. Su objetivo es ejecutar un modelo de 1,7 mil millones de parámetros en el acelerador GPU de dispositivos móviles Android mediante el runtime LiteRT-LM y la aplicación Google AI Edge Gallery.

La relevancia del artefacto está en el formato y el objetivo de despliegue, no en el modelo base. Los pesos se almacenan en INT2 ternario (per-channel en la build recomendada) y se descomprimen a fp16 o fp32 durante el cálculo, ya que el acelerador GPU ejecuta un grafo en coma flotante: el INT2 es un formato de almacenamiento, no de cómputo. El repositorio incluye cinco builds con distinta longitud de contexto (4096 y 32768 tokens) y distintos tipos de activación, de las cuales solo `bonsai-1.7b-int2pc-4k-gpu.litertlm` se considera estable; el resto está etiquetado como experimental.

El contexto máximo del modelo es 32768 tokens (`max_position_embeddings`), aunque la build recomendada trabaja a 4096. El chat template es el de Qwen3 (ChatML) con el bloque de razonamiento intacto. La licencia es Apache-2.0 y el repositorio ocupa 3,4 GB, repartidos entre las cinco variantes publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-1.7B (la model card no detalla la arquitectura interna) |
| Parámetros totales | 1,7 mil millones (según el nombre del modelo y su base Qwen3-1.7B; no explicitado en la model card) |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | 32768 tokens (`max_position_embeddings`); build recomendada limitada a 4096 tokens |
| Tipos de cuantización | INT2 ternario, per-channel (builds recomendadas) e INT2 en todos los pesos (builds experimentales); activaciones en fp32 o fp16 según build |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle de LiteRT-LM); no se publican safetensors ni GGUF en este repositorio |
| Runtime objetivo | LiteRT-LM (Google AI Edge), backend GPU móvil; no NPU |
| Modelo base | prism-ml/Ternary-Bonsai-1.7B-unpacked (relación: quantized) |
| Modelo original | Qwen/Qwen3-1.7B, Copyright 2024 Alibaba Cloud, Apache-2.0 |
| Plantilla de chat | Qwen3 ChatML con bloque de razonamiento intacto |
| Tamaño del repositorio | 3,4 GB (cinco builds) |
| Fecha de creación (HuggingFace) | 2026-09-10 |
| Descargas / likes | 0 / 0 |

Parámetros de muestreo por defecto incluidos en el `LlmMetadata` de cada bundle:

| Parámetro | Valor |
|---|---|
| Tipo | `TOP_P` |
| top-k | 20 |
| top-p | 0,85 |
| temperature | 0,5 |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado del checkpoint Ternary-Bonsai-1.7B, que a su vez parte de Qwen3-1.7B. La model card no describe la arquitectura interna (número de capas, cabezas, dimensiones, tipo de atención), por lo que este dato no está disponible. El repositorio tampoco documenta ningún tipo de entrenamiento: se indica explícitamente que no se usaron datos de entrenamiento, que no hubo fine-tuning y que no se empleó calibración adicional. Se trata, por tanto, de una conversión de formato y precisión sobre pesos ya existentes.

La innovación técnica relevante es la combinación de cuantización ternaria con un runtime móvil. El acelerador GPU de LiteRT-LM ejecuta un grafo en coma flotante, de modo que los pesos INT2 se descomprimen en tiempo de ejecución a fp16 o fp32. La model card señala que la cuantización per-channel descomprime de forma coherente, mientras que la cuantización por bloques mezcla escalas dentro de una misma GEMM; por eso las builds per-channel son la opción conservadora. Las variantes experimentales añaden atención SDPA fusionada, activaciones en fp16, contexto largo de 32768 tokens sin fusión de SDPA y múltiples buckets de prefill.

Cada bundle incluye su propia plantilla de chat (ChatML de Qwen3 con bloque de razonamiento) y sus parámetros de muestreo, de manera que un host de LiteRT-LM los adopta sin configuración adicional.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla ChatML de Qwen3.
- Razonamiento con bloque de razonamiento (`reasoning block`) preservado en la plantilla, lo que permite modos de pensamiento paso a paso heredados de Qwen3.
- Ejecución completamente en dispositivo sobre GPU móvil, sin conexión a red.
- Integración en el host LiteRT-LM y en la aplicación Google AI Edge Gallery, que aplican la plantilla y los parámetros de muestreo de forma automática.
- Soporte de contexto largo hasta 32768 tokens en las builds experimentales; 4096 tokens en la build recomendada.
- Capacidades multilingües: no disponible (la model card no declara idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá de lo que herede de Qwen3 y del bloque de razonamiento de la plantilla.
- Visión, audio u otras modalidades: no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Asistente conversacional totalmente offline en Android: la build `bonsai-1.7b-int2pc-4k-gpu.litertlm` a 4096 tokens permite mantener diálogos multi-turno en el propio dispositivo sin enviar datos a servidores externos, lo que resulta adecuado para aplicaciones con requisitos estrictos de privacidad.
- Procesamiento de datos sensibles en campo: personal sanitario, jurídico o de inspección que trabaja en ubicaciones sin conectividad puede resumir notas, redactar borradores o responder consultas internas sabiendo que ningún texto sale del terminal.
- Integración en la Google AI Edge Gallery como demo o banco de pruebas: al incluir plantilla y parámetros de muestreo en el bundle, permite evaluar el comportamiento del modelo ternario en distintos dispositivos GPU móviles sin escribir código de preprocesado.
- Clasificación y enrutado de texto en el borde: con 4096 tokens de contexto y una huella de pesos INT2 reducida, el modelo puede etiquetar tickets, correos o incidencias antes de decidir si requieren un modelo mayor en servidor.
- Redacción asistida en aplicaciones ofimáticas móviles: autocompletado, reescritura de párrafos o generación de respuestas breves dentro de apps de notas y mensajería, donde el coste de una llamada a API en la nube no es viable.
- Prototipado de producto en hardware de gama alta: las builds experimentales de 32768 tokens permiten validar casos que requieren contexto largo (documentos extensos, historiales de conversación largos) antes de decidir si merece la pena un modelo mayor.
- Kioscos, terminales de punto de venta o dispositivos IoT con Android y GPU integrada que necesitan comprensión y generación de lenguaje sin depender de conectividad.
- Investigación en cuantización extrema: comparar la calidad de la inferencia con pesos ternarios per-channel frente a INT2 en todos los pesos, con activaciones fp16 o fp32, usando las cinco builds publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las variantes cuantizadas, y tampoco ofrece cifras de latencia o throughput.

## Requisitos de hardware

- Destino principal: GPU móvil Android a través del acelerador GPU de LiteRT-LM. La model card indica explícitamente que estas builds no se ejecutan en la NPU.
- VRAM estimada: no disponible como cifra oficial. Como referencia aritmética, 1,7 mil millones de parámetros a 2 bits por peso equivalen a aproximadamente 0,43 GB de pesos en disco antes de descomprimir; a esto hay que sumar las activaciones en fp32 o fp16 y el overhead del runtime. El repositorio completo (cinco builds) ocupa 3,4 GB.
- GPU recomendadas: no disponible. El artefacto está pensado para aceleradores gráficos integrados en SoC móviles, no para GPU de escritorio o servidor, y no se publican listas de compatibilidad.
- ¿Cabe en GPU de consumo? El objetivo declarado es hardware móvil, no GPU de consumo de escritorio. La build recomendada, con 4096 tokens de contexto y activaciones fp32, es la variante más conservadora en cuanto a memoria.
- Opciones de despliegue: runtime LiteRT-LM con backend GPU seleccionado, la aplicación Google AI Edge Gallery y el binario `litert_lm_main`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.litertlm` no es un formato estándar de esos servidores.
- Compatibilidad: la model card advierte de que qué build carga depende de la versión de LiteRT / LiteRT-LM y de las dependencias de la aplicación anfitriona. Las builds con activaciones fp16 son las que tienen más probabilidades de no cargar en runtimes que no las acepten.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| litert-community/Ternary-Bonsai-1.7B (este) | 1,7 B | 32768 (build recomendada 4096) | INT2 ternario, `.litertlm` para LiteRT-LM | Apache-2.0 | HuggingFace, 0 descargas | no disponibles |
| prism-ml/Ternary-Bonsai-1.7B-unpacked | 1,7 B | no disponible | Pesos sin empaquetar para LiteRT-LM (modelo base) | Apache-2.0 | HuggingFace | no disponibles |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en la información proporcionada | Pesos en precisión original | Apache-2.0 | HuggingFace | no disponibles |

La información proporcionada no permite una comparación cuantitativa de rendimiento entre estas alternativas, ya que ninguna de ellas incluye resultados de benchmarks. Las diferencias documentadas son de formato, precisión y runtime objetivo: el modelo de este repositorio está específicamente empaquetado para el backend GPU móvil de LiteRT-LM, mientras que el checkpoint de Qwen es el modelo original sin cuantizar.

## Limitaciones y advertencias

- No hay ningún resultado de benchmark publicado: la pérdida de calidad introducida por la cuantización ternaria frente al modelo original no está cuantificada en la información disponible.
- La model card no declara idiomas soportados, por lo que no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Riesgo de alucinación inherente a un modelo de 1,7 mil millones de parámetros; la cuantización agresiva a 2 bits puede incrementarlo, y no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no disponibles. No se documenta ninguna evaluación de sesgos ni de seguridad.
- Solo se ejecuta en el backend GPU de LiteRT-LM. No hay soporte declarado para NPU, vLLM, llama.cpp, Ollama o TGI, ni pesos en safetensors o GGUF en este repositorio.
- Cuatro de las cinco builds están marcadas como experimentales y su carga depende de la versión de LiteRT / LiteRT-LM y de las dependencias de la app anfitriona. Solo se recomienda `bonsai-1.7b-int2pc-4k-gpu.litertlm`.
- Los parámetros de muestreo por defecto (top-k 20, top-p 0,85, temperature 0,5) vienen fijados en el bundle; si se quieren otros valores hay que sobrescribirlos en el host.
- Licencia Apache-2.0, que permite uso comercial, pero al ser un derivado de Qwen3-1.7B conviene revisar también los términos del modelo original de Alibaba Cloud.
- Repositorio con 0 descargas y 0 likes y creado muy recientemente: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- No se ha incluido ningún dato de entrenamiento, calibración ni PII en la conversión, según la propia model card; cualquier sesgo presente proviene de los pesos originales de Qwen3.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/litert-community/Ternary-Bonsai-1.7B
- Modelo base (sin empaquetar): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Modelo original: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
