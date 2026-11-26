# pranil00/ONIX-deepseek-math-7b-instruct-GGUF

## Resumen

ONIX-deepseek-math-7b-instruct-GGUF es una cuantización en formato GGUF del modelo base deepseek-ai/deepseek-math-7b-instruct, publicada por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". El artefacto consiste en una única conversión a Q5_K_M (5,5 bits por peso) generada con la herramienta run-any-model, un motor de optimización y empaquetado de LLM orientado a ejecución multiplataforma en hardware de consumo. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución comprimida de los pesos originales de DeepSeek.

El modelo subyacente, deepseek-math-7b-instruct, es un transformer decoder-only de 6.910.361.600 parámetros (aproximadamente 6,91 mil millones) especializado en razonamiento matemático, desarrollado por DeepSeek y liberado con licencia Apache 2.0. La versión cuantizada ocupa 4,65 GB en disco (frente a los 13,52 GB en FP16), lo que la hace viable en equipos con 6-9 GB de memoria unificada o VRAM, incluyendo Apple Silicon y GPUs NVIDIA de gama media.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local de bajo coste para tareas matemáticas; por otro, sirve de ejemplo de las cuantizaciones comunitarias que proliferan en Hugging Face y que conviene auditar antes de usarlas en producción, dado que la model card mezcla datos verificables con afirmaciones de marketing no contrastadas (por ejemplo, la "retención de calidad del 97,5 %").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia DeepSeek), según model card; detalles internos del modelo base no disponibles en la información proporcionada |
| Parametros totales | 6.910.361.600 (6,91 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU según la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se documentan otras variantes en este repositorio |
| Idiomas soportados | No disponible (el campo de idiomas del repo está vacío; el modelo base es principalmente inglés con soporte limitado de chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero deepseek-ai--deepseek-math-7b-instruct-Q5_K_M.gguf, 4,65 GB) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de su pertenencia a la "familia DeepSeek" y de su naturaleza como modelo de generación de texto de 6,91 B de parámetros. No se especifican en la documentación disponible el número de capas, la dimensión oculta, el número de cabezas de atención, ni si emplea técnicas como atención de ventana deslizante, RoPE u otras variantes. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del corpus ni las etapas de alineación (SFT, RLHF o DPO) del modelo original deepseek-math-7b-instruct.

Lo que sí describe la model card es el proceso de cuantización: conversión de FP16 (16 bits por parámetro) a Q5_K_M (5,5 bits por parámetro) mediante run-any-model, con una reducción del 65,6 % en tamaño de pesos (de 13,52 GB a 4,65 GB) y una ratio de compresión declarada de 2,91x. Se indica que las 30 capas del modelo se aceleran en Metal y que el búfer de KV cache se mantiene en FP16 (1.920 MB), sin cuantizar. La afirmación de "97,5 % de retención de calidad cognitiva" no va acompañada de metodología ni de evaluación reproducible, por lo que debe tratarse como una estimación del autor y no como un dato verificado.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base está especializado en resolución de problemas matemáticos, aritmética y razonamiento simbólico paso a paso.
- Razonamiento multi-paso: adecuado para cadenas de deducción algebraica y demostraciones guiadas.
- Generación de explicaciones: puede producir soluciones desarrolladas, no solo el resultado final.
- Ejecución local y offline: al ser GGUF, funciona sin conexión en equipos de consumo.
- Conversación multi-turno: la variante instruct está ajustada para seguir instrucciones en formato de chat (la model card incluye tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning con herramientas: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Tutoría matemática local: desplegar el modelo con Ollama o llama.cpp en un portátil para resolver dudas de álgebra, cálculo o estadística sin enviar datos a la nube, aprovechando su especialización en matemáticas y su huella de 4,65 GB.
- Generación de problemas y soluciones para material educativo: el modelo puede producir enunciados y desarrollos paso a paso que un docente revise y adapte, con la ventaja de ejecutarse en hardware modesto (8 GB de RAM).
- Verificación de cálculos en pipelines de datos: integrar el modelo como comprobador de expresiones y transformaciones matemáticas en scripts de validación, usando llama.cpp como backend ligero.
- Prototipado de asistentes de razonamiento en Apple Silicon: gracias a la aceleración Metal declarada (30/30 capas), sirve para probar flujos de razonamiento matemático en un Mac con 16 GB de memoria unificada.
- Investigación sobre cuantización: útil como caso de estudio para medir la degradación real de un modelo matemático al pasar de FP16 a Q5_K_M, comparando salidas frente al modelo original.
- Despliegue en entornos con GPU de gama media: con 6,15 GB de VRAM cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o RTX 4070, permitiendo servir un endpoint de resolución matemática a baja escala.
- Educación y demos offline: para talleres o charlas donde no hay conectividad, se puede cargar en LM Studio o Jan y mostrar resolución de problemas en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de empaquetado y memoria (tamaño de pesos, KV cache, RAM residente, capas aceleradas), no evaluaciones de calidad tipo MMLU, GSM8K, MATH o HumanEval. La cifra de "97,5 % de retención de calidad" carece de metodología y no debe interpretarse como un resultado de benchmark.

| Metrica de empaquetado | FP16 (base) | Q5_K_M (esta version) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 13,52 GB | 4,65 GB | -65,6 % |
| KV cache | 1.920 MB (FP16) | 1.920 MB (FP16) | Sin cambios |
| RAM residente total | 15,47 GB | 6,60 GB | -57,4 % |
| Capas aceleradas | 0 % | 30/30 | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 6,15 GB de VRAM dedicada en NVIDIA; 6,60 GB de memoria unificada en Apple Silicon; 8,60 GB de RAM libre en CPU x86.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4070 Ti, así como GPUs de las series 30/40/50 según la model card. En el segmento profesional, A100 o H100 son sobredimensionadas para este tamaño pero funcionarían sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM; en GPUs de 6 GB quedaría muy justo y obligaría a descargar capas a CPU.
- Apple Silicon: M1/M2/M3/M4/M5 con al menos 8 GB de memoria unificada (la auditoría se realizó en un equipo Darwin con 16 GB).
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (llama-cli con -ngl 99), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card no incluye tokens por segundo ni tiempos de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-deepseek-math-7b-instruct-GGUF (esta ficha) | 6,91 B | 8.192 (GPU/Apple), 4.096 (CPU) | GGUF Q5_K_M | Apache 2.0 | Cuantización comunitaria; sin benchmarks publicados |
| deepseek-ai/deepseek-math-7b-instruct (original) | 6,91 B | No disponible en la información | Safetensors (FP16/BF16) | Apache 2.0 | Modelo de referencia; requiere ~14 GB en FP16 |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 | Safetensors, GGUF | Llama 3.1 Community License | Mayor contexto y ecosistema más amplio; no especializado en matemáticas |
| Qwen2.5-Math-7B-Instruct | 7 B | 4.096 (típico en la familia) | Safetensors, GGUF | Apache 2.0 (según variante) | Alternativa directa especializada en matemáticas |

La comparación con los modelos alternativos se basa en características generales conocidas; no se dispone en la información proporcionada de resultados de benchmarks que permitan comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo especializado en matemáticas y entrenado mayoritariamente en inglés, es previsible un rendimiento inferior en otros idiomas y en tareas de conocimiento general.
- Riesgo de alucinación: presente, como en cualquier LLM; en matemáticas puede producir pasos plausibles pero incorrectos, por lo que toda salida debe verificarse.
- Limitaciones de contexto: la ventana efectiva se reduce a 4.096 tokens en CPU y 8.192 en GPU/Apple según la model card; no se documenta el contexto nativo del modelo base.
- Idiomas: el repositorio no declara idiomas soportados; no se garantiza un funcionamiento correcto en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad absoluto que traslada toda la responsabilidad de validación al usuario final.
- Procedencia y madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el mismo día (25/11/2026) y no cuenta con validación independiente; la afirmación de "97,5 % de retención de calidad" no es verificable.
- Ausencia de benchmarks: no hay evaluaciones publicadas que permitan estimar la degradación real frente al modelo original en tareas matemáticas.
- Producción: al ser una cuantización comunitaria sin mantenimiento demostrado, se recomienda auditar las salidas y, si se requiere fiabilidad, partir del modelo original o de cuantizaciones de organizaciones consolidadas (por ejemplo, las oficiales de TheBloke, bartowski o QuantFactory).

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/pranil00/ONIX-deepseek-math-7b-instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/deepseek-math-7b-instruct
- Organización ONIX en Hugging Face (referenciada en la model card): https://huggingface.co/ONIX
- Repositorio de la herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
