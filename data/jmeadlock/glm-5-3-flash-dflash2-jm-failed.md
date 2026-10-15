# jmeadlock/GLM-5.3-Flash-DFlash2-JM-FAILED

## Resumen

GLM-5.3-Flash-DFlash2-JM-FAILED es un borrador (*drafter*) de decodificación especulativa por difusión de bloques, construido con la arquitectura DFlash2, para el modelo objetivo GLM-5.3-Flash de zai-org. Lo publica el usuario jmeadlock como resultado negativo documentado: el autor lo etiqueta explícitamente como «failed experiment» y recomienda no usarlo en producción. El modelo carga y funciona como sustituto directo del borrador incoai/GLM-5.3-Flash-DFlash2, pero acepta menos tokens por paso de verificación que este último en casi todas las pruebas medidas.

Tiene 1.171.080.448 parámetros (1,171 B) y 2,34 GB de pesos en bf16, con un backbone estilo Qwen3 de solo 5 capas decoder y atención de ventana deslizante de 2.048 tokens. No incluye embeddings ni cabeza LM: ambos se toman del modelo objetivo en tiempo de servicio, y su `config.json` es idéntico byte a byte al del borrador de incoai (sha256 `c4aeac01…`), con 81 tensores de los mismos nombres, formas y dtypes.

Su relevancia es doble. Por un lado, es el único sustituto directo de esta geometría con licencia Apache-2.0 que el autor conoce, frente a la CC-BY-NC-ND-4.0 del borrador de incoai. Por otro, documenta una lección metodológica: un borrador entrenado sobre la propia distribución de servicio (150.000 muestras, una sola pasada) no superó a un borrador generalista, con una aceptación de 1,97 frente a 2,34-2,44 en prosa a K=4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2 block-diffusion drafter (`DFlash2DraftModel`), backbone estilo Qwen3 (`model_type: qwen3`), 5 capas decoder con sliding-window attention (ventana 2.048) |
| Parámetros totales | 1.171.080.448 (1,171 B), 81 tensores |
| Longitud de contexto | Posiciones máximas declaradas: 1.048.576; ventana de atención efectiva: 2.048; entrenado con prompts + completions de ≤ 2.048 tokens |
| Tipos de cuantización | Pesos publicados en bf16 (no se documentan variantes GGUF/AWQ/GPTQ). Entrenado contra el objetivo cuantizado NVFP4 (LibertAIDAI/GLM-5.3-Flash-NVFP4@aa28e1f) |
| Idiomas soportados | No disponible (no se declaran idiomas en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, `model.safetensors`, 2,34 GB; tamaño del repo 2,3 GB); librería declarada: vllm |
| Vocabulario / token de máscara | 154.880 tokens; `mask_token_id` 154856; no se incluye `mask_embedding.pt` |
| Hidden / intermedio | 4.096 / 12.288; 32 cabezas de atención, 8 cabezas KV, `head_dim` 128 |
| Taps de hidden states | 5 taps, `target_layer_ids [5, 14, 24, 33, 42]` (vLLM los resuelve a las capas 6, 15, 25, 34, 43) |
| Tamaño de bloque / K servido | Bloque 8 en entrenamiento; servido a K = 4; también medido a K = 7 |
| Selector | Rango 256, `top_k` 16, convolución dinámica agrupada (kernel 2, grupo 16) |
| Embeddings / cabeza LM | No incluidos; se toman del objetivo en tiempo de servicio (`tie_word_embeddings: false`) |
| Modelo base / objetivo | zai-org/GLM-5.3-Flash |
| Autor y fecha | jmeadlock, creado el 2026-10-15 |

## Arquitectura y entrenamiento

No se trata de una arquitectura nueva: es la geometría del borrador de incoai copiada deliberadamente para que el modelo encaje en cualquier lanzador que ya sirva incoai `7d74cdd`. El núcleo es un modelo de difusión de bloques DFlash2 sobre un backbone Qwen3 de 5 capas con atención de ventana deslizante de 2.048 tokens, que consume 5 taps de estados ocultos del objetivo y predice bloques de tokens enmascarados (token de máscara 154856). El bloque de entrenamiento es de 8 tokens, aunque en servicio se usa K = 4.

El entrenamiento partió de inicialización aleatoria (`initial_draft_model_path: null`) y no usó pesos de terceros ni salidas de modelos de terceros: todas las completions fueron regeneradas por el objetivo. Se usaron 150.000 muestras en una sola pasada, con 147.169.407 tokens totales de los cuales 92.053.163 fueron supervisados, pretokenizados a partir de los propios ids emitidos por el objetivo. La mezcla final fue 40 % chat (60.000), 30 % agente / tool calling (45.000), 20 % código y STEM (30.000) y 10 % salida estructurada (15.000). Por regímenes: 114.976 muestras (76,65 %) con *thinking* desactivado y decodificación greedy T=0, y 35.024 (23,35 %) con *thinking* activado a T=1,0 / top_p 0,95; el plan era 80/20, pero 24.992 filas con *thinking* off se descartaron por alcanzar el límite de 2.048 tokens. Además, 16.768 filas con *thinking* on quedaron truncadas dentro del tramo de razonamiento y se conservaron tal cual, sin respuesta.

La optimización usó 18.750 pasos, lote global de 8 secuencias (~7,85K tokens por paso), LR de 1e-4 a 1e-5 con decaimiento coseno, 2 % de warmup, grad-clip 1,0 y precisión bf16. La pérdida es una combinación por token de entropía cruzada y KL top-20 con w = 0,5, con ponderación exponencial de cola gamma-6,5; el profesor de la KL es `lm_head(norm(last hidden))` del objetivo. La pérdida final, media de los últimos 200 pasos, fue CE 2,791, KL 2,468 y precisión de entrenamiento 0,430 (por posición: 0,767 · 0,588 · 0,466 · 0,378 · 0,315 · 0,263 · 0,222), con la curva todavía descendiendo al terminar. El entrenamiento se hizo con lightseekorg/TorchSpec (`076a738`, MIT) más cuatro parches locales (taps auxiliares de GLM-5-next, corrección de KV-spec, corrección del guardado offline y un port del top-K KL de Tencent/AngelSpec `d3412be`), con activaciones extraídas mediante vLLM `extract_hidden_states` (vLLM `0.30.1rc1.dev493+gac9126e58`).

## Capacidades

- Decodificación especulativa por difusión de bloques: predice bloques de tokens enmascarados que el modelo objetivo verifica después, reduciendo el número de pasos de verificación necesarios.
- Sustituto directo (*drop-in*) de la geometría de incoai/GLM-5.3-Flash-DFlash2: `config.json` idéntico y mismos 81 tensores, por lo que se carga en lanzadores ya configurados para el borrador de incoai `7d74cdd`.
- Perfilado para cargas de chat y prosa, con mezcla de entrenamiento mayoritariamente conversacional (40 % chat).
- Cobertura de prompts de agente y tool calling (30 % de la mezcla), donde alcanza el techo de K = 4 y empata con incoai.
- Cobertura de código y STEM (20 % de la mezcla) y de salida estructurada (10 %), donde también empata con incoai en las pruebas realizadas.
- Soporte de dos regímenes de decodificación en entrenamiento: greedy T=0 con *thinking* off y muestreo T=1,0 / top_p 0,95 con *thinking* on.
- No es un modelo generativo autónomo: no incluye embeddings ni cabeza LM propios, por lo que no puede usarse sin el modelo objetivo.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No se documentan capacidades de visión, audio ni modo *thinking* propio más allá de la mezcla de entrenamiento.

## Casos de uso

- Sustituto con licencia permisiva en despliegues donde la CC-BY-NC-ND-4.0 de incoai es un bloqueo legal: es el único *drop-in* Apache-2.0 conocido para esta geometría, a costa de ser entre un 16 % y un 19 % más lento en prosa, por lo que solo tiene sentido si la licencia es el factor decisivo.
- Estudio de resultados negativos en investigación sobre decodificación especulativa: sirve como caso documentado de un borrador entrenado sobre la distribución propia de servicio (150.000 muestras, una pasada) que no supera a un borrador generalista, con todos los hiperparámetros y la curva de pérdida publicados.
- Reproducción de la metodología de entrenamiento: el archivo `PROVENANCE.txt` incluye digests de imagen, commits, comandos, configuración y sha del manifiesto de datos, lo que permite reproducir el *pipeline* sobre una única NVIDIA GB300 en 12 h 25 m 21 s.
- Banco de pruebas para medidores de aceptación: sus cifras (1,97 en prosa a K=4; 2,712 en el holdout canada-quant con *thinking* on a K=4) permiten validar arneses de medición de aceptación antes de desplegar otros borradores.
- Investigación sobre sensibilidad a cuantización NVFP4: fue entrenado contra los bytes exactos de LibertAIDAI/GLM-5.3-Flash-NVFP4@aa28e1f, de modo que sirve para estudiar el acoplamiento entre borrador y cuantización del objetivo.
- Comparación de geometrías de selector y tamaños de bloque: con bloque 8 entrenado y mediciones a K = 4 y K = 7, permite estudiar cómo cambia la aceptación al variar K en la misma geometría de taps.
- Validación de la integración de DFlash2 en vLLM: al compartir geometría y resolución de taps (capas 6, 15, 25, 34, 43), sirve para verificar que la ruta de decodificación especulativa se resuelve correctamente en el arranque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas de aceptación de tokens por paso de verificación, comparadas con el borrador de incoai.

| Métrica | Este modelo (JM) | incoai/GLM-5.3-Flash-DFlash2 | Umbral pre-registrado |
|---|---|---|---|
| Aceptación en prosa, K=4 | 1,97 | 2,34-2,44 | 2,6 |
| Aceptación en holdout canada-quant, thinking on, K=4 | 2,712 | 3,134 | no disponible |
| Prompts de agente | Empate (techo K=4) | Empate (techo K=4) | no disponible |
| Salida estructurada | Empate | Empate | no disponible |
| Latencia en prosa | 16-19 % más lento que incoai | Referencia | no disponible |
| Umbrales superados | 1 de 4 | no aplica | — |

Pérdidas de entrenamiento (media de los últimos 200 pasos): CE 2,791, KL 2,468, precisión de entrenamiento 0,430. No se dispone de latencia absoluta ni de throughput en tokens por segundo.

## Requisitos de hardware

- Los pesos del borrador ocupan 2,34 GB en bf16, pero el modelo no funciona de forma aislada: requiere en memoria el modelo objetivo zai-org/GLM-5.3-Flash (o su cuantización NVFP4), cuyo coste domina el presupuesto de VRAM.
- Entrenamiento documentado en 1× NVIDIA GB300, con un pico de HBM de 54.235 MiB durante el entrenamiento y 7,235 TB de estados ocultos materializados y eliminados por trozos durante la extracción offline.
- La extracción de estados ocultos consumió 7,26 h y el entrenamiento 5,13 h, en una única GPU, sobre 15 trozos de 10.000 filas.
- GPU recomendadas: GB300 para entrenamiento y reproducción. Para servicio, la GPU viene determinada por el objetivo GLM-5.3-Flash NVFP4, no por el borrador.
- En GPU de consumo: el borrador por sí solo cabría en GPUs con 8 GB o más de VRAM, pero el objetivo GLM-5.3-Flash no es viable en ese entorno, por lo que el conjunto no cabe en hardware de consumo.
- Despliegue: vLLM con soporte de decodificación especulativa y geometría DFlash2 (`library_name: vllm`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como valores absolutos; solo se conoce la comparación relativa de un 16-19 % más de lentitud en prosa frente a incoai.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / bloque | Aceptación (prosa, K=4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jmeadlock/GLM-5.3-Flash-DFlash2-JM-FAILED | 1,171 B | Ventana 2.048; bloque 8 entrenado, K=4 servido | 1,97 | Apache-2.0 | HuggingFace (documentado como fallo) |
| incoai/GLM-5.3-Flash-DFlash2 | Misma geometría (config idéntica) | Ventana 2.048; K=4 | 2,34-2,44 | CC-BY-NC-ND-4.0 | HuggingFace; recomendado por el propio autor |
| zai-org/GLM-5.3-Flash | No disponible en la información | No disponible | No aplica (modelo objetivo) | No disponible | HuggingFace |
| LibertAIDAI/GLM-5.3-Flash-NVFP4@aa28e1f | No disponible en la información | No disponible | No aplica (cuantización objetivo) | No disponible | HuggingFace |

El borrador de incoai es la alternativa directa y supera a este modelo en todas las pruebas medidas, con la salvedad de su licencia CC-BY-NC-ND-4.0, que restringe el uso comercial y la redistribución de modificaciones.

## Limitaciones y advertencias

- Es un experimento fallido declarado por el autor: «This drafter is a failure. Do not use it for serving». Rinde peor que el borrador de incoai en casi todas las pruebas.
- No superó 3 de sus 4 umbrales pre-registrados de aceptación (prosa 1,97 frente a un umbral de 2,6).
- Es entre un 16 % y un 19 % más lento en prosa que el borrador de incoai, y la aceptación en el holdout canada-quant con *thinking* on es de 2,712 frente a 3,134.
- Solo empata con incoai en prompts de agente (ambos en el techo de K=4) y en salida estructurada, por lo que no aporta ventaja medible en ningún escenario probado.
- No es utilizable de forma autónoma: carece de embeddings y de cabeza LM, que debe aportar el modelo objetivo en tiempo de servicio, y depende de la geometría de taps y de la resolución exacta de capas de vLLM.
- Está acoplado a los bytes concretos de la cuantización NVFP4 sobre la que se entrenó; su comportamiento con otras cuantizaciones del objetivo no está documentado.
- Riesgo de alucinación heredado del modelo objetivo: el borrador solo propone tokens, y cualquier error de contenido lo determina GLM-5.3-Flash, no el borrador.
- Sesgos conocidos: no disponibles. La mezcla de entrenamiento está sesgada hacia chat, agente y código en inglés técnico, y no se declaran idiomas soportados.
- Limitación de contexto en entrenamiento: todas las muestras se limitaron a 2.048 tokens de prompt más completion, con 16.768 filas truncadas dentro del tramo de razonamiento y conservadas sin respuesta.
- La licencia Apache-2.0 cubre el borrador, pero el uso del modelo objetivo GLM-5.3-Flash y de la cuantización NVFP4 queda sujeto a sus propias licencias, no verificadas en la información disponible.
- Al ser un artefacto de resultado negativo con 0 descargas y 0 *likes* en el momento de la consulta, no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jmeadlock/GLM-5.3-Flash-DFlash2-JM-FAILED
- Borrador de referencia (recomendado por el autor): https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización NVFP4 usada en el entrenamiento: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Entrenador TorchSpec: https://github.com/lightseekorg/TorchSpec
- Implementación de top-K KL portada (AngelSpec): https://github.com/Tencent/AngelSpec
- Referencia arXiv declarada en las etiquetas: arxiv:2602.06036
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (entradas de diccionario francés-inglés sobre «confiance»); no se han encontrado papers, blogs ni demos adicionales.
