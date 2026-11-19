# llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2-GGUF

## Resumen

Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2-GGUF es la distribucion en formato GGUF del modelo Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2, un ajuste de 26.896 millones de parametros derivado de zerofata/Q3.5-BlueStar-v2-27B y sometido a un proceso de "decensoring" (abolicion de rechazos) mediante la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). Lo publica el contribuidor independiente llmfan46, que mantiene mas de 70 modelos libres en Hugging Face.

El modelo resuelve un problema muy concreto: reducir de forma drastica los rechazos y el tono moralizante del modelo original (de 99/100 a 5/100 en la metrica de rechazos reportada por el autor) manteniendo la calidad subyacente, con una divergencia KL de 0.0671 respecto al original. Los tags del repositorio (heretic, uncensored, abliterated, roleplay, anime) y los datasets empleados apuntan a un uso principal en generacion creativa, roleplay y narrativa sin filtros.

La relevancia actual es doble: por un lado, demuestra la madurez de las tecnicas de abliteracion selectiva por capas y proyecciones de atencion; por otro, la publicacion en GGUF con cuantizaciones desde BF16 hasta Q4_K_M y un proyector de vision separado lo hace desplegable en hardware de consumo mediante llama.cpp, LM Studio u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 27B; el autor no detalla la arquitectura) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna del modelo base mas alla de su tamano (26,9B parametros) y de la existencia de un proyector multimodal que habilita capacidades de vision. Lo que si esta documentado con detalle es el proceso de modificacion: se aplico Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) sobre el modelo zerofata/Q3.5-BlueStar-v2-27B, actuando sobre las capas 9 a 33 y sobre los componentes attn.out_proj y attn.o_proj. Los hiperparametros de la ablacion son start_layer_index 9, end_layer_index 33, preserve_good_behavior_weight 0.5425, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 1.1475 y neighbor_count 15.

Los datasets declarados en la model card (zerofata/Instruct-Anime, zerofata/Gemini-3.1-Pro-SmallWiki, zerofata/Gemini-3.1-Pro-GLM5-Characters y zerofata/Roleplay-Anime-Characters) corresponden al entrenamiento del modelo base, no a un reentrenamiento posterior a la ablacion: la intervencion de Heretic es una edicion de pesos, no un fine-tuning con datos. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay y narrativa.
- Modo "uncensored": reduccion documentada de rechazos a 5/100 frente a 99/100 del original, con menor tendencia a moralizar o redirigir la conversacion.
- Capacidades de vision mediante el proyector multimodal incluido (archivo mmproj en BF16), que debe cargarse junto a la cuantizacion elegida.
- Razonamiento fisico basico medido en PIQA (acc_norm 0.8237, identico al original).
- Soporte de conversacion y plantillas de chat a traves de los runtimes GGUF compatibles (llama.cpp, LM Studio, Ollama).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay de personajes de anime: el modelo se entrena sobre datasets especificos de personajes (Roleplay-Anime-Characters, GLM5-Characters) y la ablacion elimina las interrupciones moralizantes, lo que permite mantener la voz del personaje en conversaciones largas sin que el modelo rompa la escena.
- Escritura creativa sin restricciones: narrativa adulta, terror o ficcion transgresora donde el modelo original rechazaria peticiones; la reduccion de rechazos a 5/100 hace viable la generacion sostenida de este tipo de contenido.
- Prototipado de asistentes conversacionales con vision: cargando el mmproj BF16 junto a una cuantizacion Q4_K_M o Q5_K_M se obtiene un asistente multimodal en una sola GPU de consumo, util para demos de descripcion de imagenes o analisis de capturas.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_S permiten ejecutar un modelo de 27B en GPUs de 16-24 GB, algo relevante para entornos con requisitos de privacidad donde no se puede enviar contenido a APIs externas.
- Investigacion sobre abliteracion: el repositorio documenta hiperparametros completos (capas, pesos, componentes atacados) y metricas de fidelidad (KL 0.0671, PIQA), lo que lo convierte en un caso de estudio reproducible para quien investigue tecnicas de edicion de pesos.
- Generacion de dialogos para videojuegos o mods: la licencia MIT y el formato GGUF facilitan la integracion en motores que ya usan llama.cpp como backend de NPCs, sin coste de licencia.
- Evaluacion comparativa de dano colateral: util como referencia para medir cuanto degrada la abliteracion las capacidades de razonamiento en un modelo de 27B frente a su version original.

## Benchmarks y rendimiento

| Metrica | Este modelo (Heretic v2) | Original (Q3.5-BlueStar-v2-27B) |
|---|---|---|
| Rechazos | 5/100 | 99/100 |
| Divergencia KL | 0.0671 | 0 (por definicion) |
| PIQA acc | 0.8161 (±0.0090) | 0.8232 (±0.0089) |
| PIQA acc_norm | 0.8237 (±0.0089) | 0.8237 (±0.0089) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Las pruebas PIQA se ejecutaron con batch size 128.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada por tamano y cuantizacion, no publicada por el autor): BF16 ~54 GB; Q8_0 ~29 GB; Q6_K ~22 GB; Q5_K_M ~19 GB; Q5_K_S ~18 GB; Q4_K_M ~16 GB.
- El proyector de vision en BF16 anade una cantidad pequena de VRAM adicional que debe sumarse a la cuantizacion elegida.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o RTX 6000 Ada para Q8_0; RTX 4090 (24 GB) para Q6_K y Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 4070 Ti Super y equivalentes con Q4_K_M o Q5_K_S; en GPUs de 12 GB solo mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2 (este) | 26,9B | no disponible | 5/100 | MIT | GGUF |
| zerofata/Q3.5-BlueStar-v2-27B (original) | 26,9B | no disponible | 99/100 | no disponible | safetensors |
| Otros modelos abliterated de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita al par original/derivado.

## Limitaciones y advertencias

- La abliteracion elimina barreras de seguridad: el modelo respondera a peticiones que el original rechazaba, incluidas potencialmente las relacionadas con contenido danino, ilegal o sexual explicito. No es apto para despliegues publicos sin moderacion externa.
- La divergencia KL de 0.0671 y la caida de PIQA acc de 0.8232 a 0.8161 indican una degradacion pequena pero real de capacidades; en tareas fuera de PIQA el deterioro no esta medido.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de factualidad ni de codigo en la informacion disponible.
- Idiomas soportados no declarados; no hay garantia de calidad fuera del ingles o del idioma dominante del dataset de entrenamiento.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- La licencia MIT se aplica a esta distribucion GGUF, pero el modelo base declara "no disponible" en su licencia; conviene verificar la cadena de licencias antes de un uso comercial.
- El autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de actualizaciones o archivos.
- El repositorio ocupa 159,9 GB, por lo que la descarga completa no es practica; conviene descargar solo el archivo de cuantizacion necesario y el mmproj si se requiere vision.
- El modelo base y sus datasets estan orientados a anime y roleplay; su rendimiento en dominios tecnicos, juridicos o cientificos no esta documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2
- Modelo original sin abliterar: https://huggingface.co/zerofata/Q3.5-BlueStar-v2-27B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Dataset Instruct-Anime: https://huggingface.co/datasets/zerofata/Instruct-Anime
- Dataset Gemini-3.1-Pro-SmallWiki: https://huggingface.co/datasets/zerofata/Gemini-3.1-Pro-SmallWiki
- Dataset Gemini-3.1-Pro-GLM5-Characters: https://huggingface.co/datasets/zerofata/Gemini-3.1-Pro-GLM5-Characters
- Dataset Roleplay-Anime-Characters: https://huggingface.co/datasets/zerofata/Roleplay-Anime-Characters
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
