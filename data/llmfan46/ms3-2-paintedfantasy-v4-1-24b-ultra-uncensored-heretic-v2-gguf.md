# llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v2-GGUF

## Resumen
MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v2-GGUF es la versión cuantizada en formato GGUF de un modelo de lenguaje de 24B parámetros derivado de zerofata/MS3.2-PaintedFantasy-v4.1-24B. El autor, llmfan46, aplica una técnica de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), con el objetivo de reducir drásticamente la tasa de rechazos del modelo original manteniendo su calidad general.

El resultado declarado por el autor es una reducción de rechazos del 80 % al 4 % en un conjunto de 100 prompts de prueba, con una divergencia KL de 0,0056 respecto al modelo base, lo que indica un cambio moderado en la distribución de salidas. El modelo está pensado para casos de uso creativos y de rol conversacional sin restricciones de contenido, y se distribuye bajo licencia MIT.

Se trata de un modelo derivado, no de un entrenamiento desde cero: hereda la arquitectura, el tokenizador y el conocimiento del modelo base de zerofata, y solo modifica los pesos de las proyecciones de atención (attn.o_proj) en las capas 7 a 40. El repositorio incluye seis cuantizaciones GGUF (de BF16 a Q4_K_M) y es compatible con llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base zerofata/MS3.2-PaintedFantasy-v4.1-24B; detalles internos no disponibles) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en el repo del modelo base |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Capas objetivo | attn.o_proj, capas 7 a 40 |
| Tamano del repo | 139,0 GB |
| Descargas | 256 |
| Likes | 2 |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo zerofata/MS3.2-PaintedFantasy-v4.1-24B, del que no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición exacta del dataset, ni si se aplicó RLHF o DPO. Los tags del repositorio apuntan a un ajuste fino sobre datasets de anime, rol, escritura creativa, seguridad de código, preferencias conversacionales (Wildchat-IF-Preference-Raw-MS3.2), escritura NSFW de Reddit y UltraFeedback iterativo, lo que sugiere una mezcla orientada a conversación, rol y creatividad.

La innovación técnica de esta versión no está en el entrenamiento sino en la modificación post-hoc de pesos: se aplica abliteración con Heretic v1.2.0 usando ARA, con los parámetros start_layer_index=7, end_layer_index=40, preserve_good_behavior_weight=0,9580, steer_bad_behavior_weight=0,0001, overcorrect_relative_weight=0,8894 y neighbor_count=10, actuando únicamente sobre attn.o_proj. El objetivo es restar la dirección asociada al rechazo sin degradar el resto de capacidades, medida mediante divergencia KL (0,0056) y PIQA (acc_norm 0,8319 frente a 0,8303 del original).

## Capacidades
- Generación de texto conversacional multi-turno, orientada a rol y escritura creativa.
- Escritura creativa sin restricciones temáticas (ficción, NSFW, roleplay), gracias a la reducción de rechazos declarada (4/100 frente a 80/100).
- Razonamiento físico básico medido en PIQA (acc_norm 0,8319).
- Capacidad de seguir instrucciones heredada del ajuste sobre datasets tipo Instruct y UltraFeedback.
- Soporte de conversación con formato chat (tag "conversational" y endpoints_compatible).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo "thinking".

## Casos de uso
- Roleplay y ficción interactiva: el modelo está ajustado sobre datasets de personajes de anime y escritura creativa, y la abliteración elimina la mayoría de rechazos, lo que permite mantener conversaciones de personaje sostenidas sin interrupciones moralizantes.
- Escritura creativa sin censura: útil para autores que necesitan generar borradores de narrativa adulta o temáticas sensibles donde el modelo base rechazaría la petición.
- Generación de diálogos para videojuegos o narrativa ramificada: la naturaleza conversacional y el ajuste sobre Instruct-Anime lo hacen adecuado para producir árboles de diálogo con voces de personaje consistentes.
- Asistencia a guionistas y escritores de fan-fiction: permite continuar textos, reescribir escenas y explorar variantes de trama con menos fricción que un modelo alineado convencional.
- Prototipado de chatbots de acompañamiento o entretenimiento: desplegable en local con llama.cpp u Ollama, sin depender de APIs externas ni de filtros de proveedor.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible de cómo afecta la eliminación de la dirección de rechazo a la calidad (KL 0,0056) y al rendimiento en benchmarks (PIQA), comparándolo con el original.
- Generación de texto en entornos offline o aislados: al ser GGUF, puede ejecutarse en estaciones de trabajo sin conexión, útil para talleres de escritura o demos privadas.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Heretic v2 (este modelo) |
|---|---|---|
| PIQA acc | 0,8226 ± 0,0089 | 0,8215 ± 0,0089 |
| PIQA acc_norm | 0,8303 ± 0,0088 | 0,8319 ± 0,0087 |
| Rechazos (100 prompts) | 80/100 | 4/100 |
| Divergencia KL | 0 (por definición) | 0,0056 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 48 GB en BF16, unos 25-26 GB en Q8_0, 20-21 GB en Q6_K, 17-18 GB en Q5_K_M, 16-17 GB en Q5_K_S y 14-15 GB en Q4_K_M (estimaciones a partir del número de parámetros; no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB, RTX 6000 Ada o RTX 4090 (24 GB) para Q8_0 y Q6_K; RTX 4090, RTX 3090 o RTX 4080 (16 GB) para Q4_K_M y Q5_K_S.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q5_K_S con 16 GB o más de VRAM; en Q5_K_M y Q6_K requiere 24 GB (RTX 3090/4090). También puede ejecutarse parcialmente en CPU con llama.cpp usando offload de capas.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v2 (este) | 23,57B | no disponible | MIT | GGUF | 4/100 rechazos, KL 0,0056, PIQA acc_norm 0,8319 |
| zerofata/MS3.2-PaintedFantasy-v4.1-24B | 23,57B | no disponible | no disponible | safetensors | Modelo base; 80/100 rechazos, PIQA acc_norm 0,8303 |
| llmfan46/Omega-Darker-Gaslight_The-Final-Forgotten-Fever-Dream-24B-ultra-uncensored-heretic-v1 | 24B (aproximado) | no disponible | no disponible | no disponible | Otro derivado del mismo autor con flujo Heretic similar |

No se dispone de datos suficientes para comparar con alternativas de otros autores de la misma categoría (modelos abliterados de 24B) en parámetros, contexto y rendimiento.

## Limitaciones y advertencias
- La abliteración elimina la dirección de rechazo, pero no garantiza la ausencia de contenido dañino: el modelo puede generar material ofensivo, ilegal o sexualmente explícito sin filtros, lo que exige supervisión humana en cualquier despliegue público.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo de 24B sin benchmarks de conocimiento (MMLU, TruthfulQA), no hay evidencia de fiabilidad factual.
- La divergencia KL de 0,0056 indica cambios en la distribución de salidas; aunque PIQA se mantiene, no se han evaluado otras capacidades (código, matemáticas, multilingüismo) para descartar degradación.
- Idiomas soportados no documentados; el ajuste sobre datasets mayoritariamente en inglés y anime sugiere un rendimiento inferior en castellano.
- Longitud de contexto no disponible; no debe asumirse una ventana larga sin verificarla en el modelo base.
- Licencia MIT permite uso comercial, pero el contenido generado puede infringir normativas locales (por ejemplo, material NSFW o difamatorio); la responsabilidad recae en el desplegador.
- El repositorio depende de un modelo base de terceros (zerofata) cuyos términos y procedencia de datos no se detallan; posibles sesgos heredados del dataset de rol y anime.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de nuevas versiones o cuantizaciones.

## Enlaces
- Repositorio Hugging Face (GGUF): https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/MS3.2-PaintedFantasy-v4.1-24B-ultra-uncensored-heretic-v2
- Modelo original de zerofata: https://huggingface.co/zerofata/MS3.2-PaintedFantasy-v4.1-24B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
