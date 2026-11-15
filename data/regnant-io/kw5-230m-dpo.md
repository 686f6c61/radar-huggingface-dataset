# regnant-io/KW5-230M-DPO

## Resumen

KW5-230M-DPO es un modelo de lenguaje causal de tipo decoder-only especializado en kiswahili (swahili), desarrollado por regnant-io como parte de una línea de modelos orientados a lenguas africanas de bajos recursos. Se trata de un ajuste por optimización de preferencias (DPO) sobre el checkpoint SFT-2 del modelo de instrucciones KW5-230M v3, con el objetivo declarado de mejorar la fiabilidad del modelo cuando la respuesta no está presente en un pasaje de contexto proporcionado. Con 259.095.424 parámetros totales y una ventana de contexto de 2.048 tokens, es un modelo compacto pensado para despliegue en hardware modesto.

La relevancia del modelo reside en su enfoque: no compite en capacidades generales con modelos multilingües de gran escala, sino que optimiza un eje concreto (rechazo fundamentado en pasaje, *passage-grounded refusal*) mediante un conjunto pequeño de pares de preferencia (707 pares, 45 pasos de optimización). El autor documenta explícitamente las limitaciones del modelo y publica los ficheros de evaluación y el log de entrenamiento, lo que facilita la reproducibilidad. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Arquitectónicamente, KW5 v3 introduce bloques residuales propietarios denominados "Canon", con normalización QK, embeddings rotatorios y embeddings de entrada/salida atados. El repositorio incluye la implementación del modelo porque los cargadores estándar de Llama no soportan estos bloques, lo que implica un proceso de carga específico mediante los ficheros `modeling_kw5v2.py` y `kw5_tokenizer.py` incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con 24 bloques residuales "Canon", QK normalization, rotary embeddings, tied embeddings |
| Parametros totales | 259.095.424 (según safetensors); la model card indica 230.423.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sw (kiswahili) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

KW5 v3 es un modelo decoder-only con 24 bloques residuales Canon, anchura oculta de 896, 14 cabezas de consulta y 2 cabezas clave/valor (atención con GQA), capa feed-forward de 2.432 de anchura, normalización QK, embeddings rotatorios y embeddings de entrada/salida atados. El vocabulario es de 32.000 piezas SentencePiece. El autor indica que la implementación del modelo se incluye en el repositorio porque los cargadores estándar de Llama no implementan los bloques Canon.

El modelo fue preentrenado con 7,90B tokens de kiswahili y posteriormente ajustado mediante SFT (checkpoint SFT-2) y DPO. El entrenamiento DPO utilizó 707 pares elegidos/rechazados, β=0,1, learning rate 5e-7, batch size 16, una época, longitud máxima de secuencia 2.048, semilla 7 y 45 pasos de optimización, con pérdida sobre tokens de respuesta y log-probabilidades de referencia cacheadas. El tokenizador debe invocarse mediante el encoder incluido (`kw5_tokenizer.py`), que codifica cada línea de forma independiente para preservar los límites de palabra tras los saltos de línea; el BOS (id 1) se antepone directamente y cada turno termina con `<|end|>` (id 7). El modelo no fue entrenado con system prompt y no debe usarse uno.

## Capacidades

- Generación de texto conversacional en kiswahili con formato de chat específico (`<|user|>` / `<|assistant|>` / `<|end|>`).
- Aritmética básica de hasta 4 dígitos (91,4 % en la suite de evaluación).
- Orden de operaciones (BODMAS) con un 70,0 % de acierto en la suite congelada.
- Recuerdo de hechos de turnos anteriores en conversaciones multi-turno (98,8 % en `mt_recall`).
- Rechazo fundamentado: capacidad mejorada para indicar que un pasaje no contiene la respuesta (86,7 % frente a 70,0 % del SFT-2).
- Declinación de preguntas no respondibles (95,0 %).
- Lectura de pasajes reales (56,8 %, por debajo del umbral fijado).
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al kiswahili; no se documentan otros idiomas.

## Casos de uso

- Asistente conversacional en kiswahili para atención al cliente: el modelo gestiona diálogos multi-turno con hasta 2.048 tokens de contexto y mantiene el recuerdo de hechos de turnos previos con alta fiabilidad (98,8 % en `mt_recall`), lo que lo hace adecuado para consultas de soporte de complejidad baja o media.
- Extracción de respuestas fundamentadas en documentos: dado un pasaje y una pregunta, el modelo puede indicar cuándo la respuesta no está en el texto (86,7 % de acierto en `grounded_absent`), lo que reduce respuestas inventadas en tareas de QA documental sobre textos en kiswahili.
- Filtrado y clasificación de consultas no respondibles: la capacidad de declinar preguntas sin respuesta (95,0 %) permite usarlo como primera capa en pipelines de triaje que derivan consultas a un humano o a un sistema de recuperación adicional.
- Prototipado rápido y experimentación en investigación sobre lenguas de bajos recursos: su tamaño (259M parámetros) y licencia Apache 2.0 permiten entrenar, ajustar y desplegar en entornos académicos con recursos limitados.
- Despliegue en dispositivos con recursos modestos: el tamaño del checkpoint (2,1 GB en safetensors) y la ventana de 2.048 tokens permiten inferencia en GPU de consumo, útil para aplicaciones locales en regiones con conectividad limitada.
- Evaluación comparativa de técnicas de alineación: al publicar los ficheros de evaluación y el log de DPO, sirve como caso de estudio reproducible de optimización de preferencias sobre un eje acotado en un modelo pequeño.

## Benchmarks y rendimiento

Resultados de la suite congelada v3 con decodificación greedy, porcentaje de acierto con intervalos de Wilson al 95 %:

| Capacidad | Eje | n | SFT-2 | DPO | Umbral | Resultado DPO |
|---|---|---:|---:|---:|---:|---|
| Aritmética básica hasta 4 dígitos | `arithmetic` | 128 | 91,4 | 91,4 | 85 | cumple |
| Orden de operaciones | `bodmas` | 200 | 70,5 | 70,0 | 60 | cumple |
| Recuerdo de hechos de turnos previos | `mt_recall` | 80 | 98,8 | 98,8 | 70 | cumple |
| Indicar que no se le dijo | `mt_untold` | 40 | 82,5 | 77,5 | 60 | cumple |
| Seguimiento respondido como pregunta fría | `followup` | 8 | 87,5 | 87,5 | 75 | cumple* |
| Pasaje sin la respuesta | `grounded_absent` | 60 | 70,0 | 86,7 | 60 | cumple |
| Declinar pregunta no respondible | `refusal_unanswerable` | 40 | 97,5 | 95,0 | 70 | cumple |
| Lectura de pasaje real | `grounded_real` | 250 | 58,4 | 56,8 | 60 | no cumple |
| Responder lo respondible | `refusal_answerable` | 30 | 86,7 | 90,0 | 90 | cumple |
| Instrucción persistente entre turnos | `mt_persist` | 20 | 35,0 | 35,0 | 70 | no cumple |
| Problemas de palabras no vistos | `word_problem2` | 120 | 24,2 | 29,2 | 40 | no cumple |
| Aritmética AfriMGSM | `afrimgsm` | 100 | 1,0 | 1,0 | 5 | no cumple |
| Estado de lista modificado | `mt_state` | 40 | 5,0 | 7,5 | 50 | no cumple |
| Aritmética arrastrada entre turnos | `mt_arith` | 40 | 2,5 | 2,5 | 40 | no cumple |

*El eje `followup` solo tiene 8 ejemplos y es indicativo. El autor advierte que las puntuaciones idénticas al SFT-2 no son evidencia de mejora por DPO y que "cumple" significa alcanzar el umbral fijado, no que el resultado generalice. La subida de 5 puntos en problemas de palabras es descriptiva y no estadísticamente establecida.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 2,1 GB, lo que corresponde aproximadamente a 1 GB en fp16 para los pesos (259M parámetros) más overhead de activaciones y caché KV; con 2.048 tokens de contexto, la caché KV es pequeña (2 capas KV, 24 bloques), por lo que la inferencia cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas. También es viable en CPU para prototipos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo modernas.
- Opciones de despliegue: el repositorio incluye implementación propia (`modeling_kw5v2.py`) y tokenizador específico; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y los bloques Canon no están soportados por cargadores estándar de Llama, por lo que el despliegue requiere el código incluido y PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---:|---|---|---|
| KW5-230M-DPO | 259M | 2.048 | sw | Apache 2.0 | DPO sobre SFT-2; arquitectura Canon propia |
| KW5-230M Instruct (SFT-2) | 230M | 2.048 | sw | Apache 2.0 | Checkpoint base del DPO; mismas capacidades salvo `grounded_absent` |
| Modelos multilingües pequeños (p. ej. familia Qwen2.5-0.5B) | ~500M | 32.768 | multilingüe | Apache 2.0 | No disponible en la información proporcionada para comparación directa de rendimiento en kiswahili |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada; la comparación con alternativas de la misma categoría (modelos pequeños especializados en lenguas africanas) no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta kiswahili; no se documentan capacidades en otros idiomas.
- Dificultades documentadas por el autor: estado de larga duración, aritmética arrastrada entre turnos, problemas de palabras multi-paso y persistencia de instrucciones entre turnos (35,0 % en `mt_persist`, 7,5 % en `mt_state`, 2,5 % en `mt_arith`).
- El eje `grounded_real` no alcanza el umbral fijado (56,8 % frente a 60 %), lo que indica que la lectura de pasajes reales sigue siendo un punto débil.
- La mejora en `grounded_absent` (70,0 % a 86,7 %) se midió sobre 60 ejemplos con intervalos de Wilson amplios; no es garantía de generalización a nuevos prompts.
- Riesgo de alucinación: aunque el rechazo fundamentado mejora, el modelo sigue respondiendo con errores en problemas de palabras y aritmética compleja.
- No debe usarse system prompt: el modelo fue entrenado y evaluado sin él, y su uso puede degradar el comportamiento.
- El tokenizador requiere el encoder incluido; el uso de tokenizadores estándar puede romper los límites de palabra tras saltos de línea.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Las métricas provienen de una suite congelada pequeña; el autor advierte explícitamente que no son una garantía sobre nuevos prompts.

## Enlaces

- Hugging Face: https://huggingface.co/regnant-io/KW5-230M-DPO
- Ficheros de evaluación: `eval_v3/` dentro del repositorio
- Log de entrenamiento: `dpo_log.jsonl` dentro del repositorio
- Implementación del modelo: `modeling_kw5v2.py` dentro del repositorio
- Tokenizador: `kw5_tokenizer.py` y `tokenizer.model` dentro del repositorio
- Paper de DPO (Rafailov et al., 2023): no disponible en la información proporcionada como enlace directo
