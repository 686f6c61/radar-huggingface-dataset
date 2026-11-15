# regnant-io/kw5-v3-dpo

## Resumen

KW5 v3 230M DPO es un modelo de lenguaje causal de tipo decoder-only especializado en kiswahili (swahili), desarrollado por regnant-io. Se trata de la versión afinada mediante Direct Preference Optimization (DPO) del checkpoint SFT-2 de la familia KW5 v3, y su objetivo declarado es mejorar la fiabilidad del asistente cuando la respuesta no está presente en el pasaje proporcionado, es decir, reducir respuestas inventadas en tareas de comprensión lectora con contexto acotado.

El modelo emplea una arquitectura propia denominada Canon, con 24 bloques residuales, anchura oculta de 896, 14 cabezas de consulta y 2 de clave/valor (GQA), capa feed-forward de 2.432 unidades, normalización QK, embeddings rotatorios y embeddings de entrada/salida atados. Cuenta con 259.095.424 parámetros totales según los pesos en safetensors (la model card cita 230.423.424, discrepancia que conviene verificar) y una ventana de contexto de 2.048 tokens. Fue preentrenado con 7.900 millones de tokens de kiswahili.

Su relevancia radica en el enfoque de IA soberana para lenguas africanas de bajos recursos: un modelo compacto, con licencia Apache 2.0, tokenizador SentencePiece de 32.000 piezas y un formato de prompt específico, pensado para despliegues ligeros en entornos con recursos limitados y para tareas de respuesta fundamentada en pasajes. La release incluye la implementación del modelo en el propio repositorio porque los cargadores estándar de Llama no soportan los bloques Canon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only con 24 bloques residuales Canon, GQA (14 cabezas Q / 2 KV), QK norm, RoPE, embeddings atados |
| Parámetros totales | 259.095.424 (safetensors); la model card indica 230.423.424 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (el repositorio publica safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | kiswahili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,1 GB); tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

KW5 v3 es un transformer decoder-only con una arquitectura propietaria llamada Canon: 24 bloques residuales, anchura oculta 896, 14 cabezas de consulta y 2 cabezas de clave/valor (atención con query grouping), feed-forward de 2.432 unidades, normalización QK, embeddings rotatorios y embeddings de entrada/salida atados. El vocabulario es un SentencePiece de 32.000 piezas. El repositorio incluye la implementación (`modeling_kw5v2.py`) y el codificador del tokenizador (`kw5_tokenizer.py`), que codifica cada línea de forma independiente para preservar el límite de palabra tras los saltos de línea.

El preentrenamiento utilizó 7.900 millones de tokens de kiswahili. Sobre el checkpoint SFT-2 se aplicó DPO (Rafailov et al., 2023) con 707 pares elegido/rechazado, β=0,1, learning rate 5e-7, batch size 16, una época, longitud máxima de secuencia 2.048, semilla 7 y 45 pasos de optimizador, con pérdida sobre tokens de respuesta y log-probabilidades de referencia cacheadas. El formato de prompt requiere BOS (id 1) directo, etiquetas `<|user|>` y `<|assistant|>`, cierre de turno con `<|end|>` (id 7) y EOS id 2; no debe anteponerse un system prompt, ya que el modelo se entrenó y evaluó sin él.

## Capacidades

- Generación de texto conversacional en kiswahili con formato de chat multi-turno.
- Aritmética básica de hasta 4 dígitos (91,4 % en la suite congelada) y orden de operaciones (70,0 %).
- Recuperación de hechos mencionados en turnos anteriores (98,8 % en `mt_recall`).
- Respuesta fundamentada en pasajes: lectura de un pasaje real y respuesta a preguntas cuyo contenido está presente.
- Rechazo fundamentado: indicar que la respuesta no está en el pasaje cuando así es (86,7 % tras DPO, frente a 70,0 % en SFT-2).
- Declive ante preguntas sin respuesta posible (95,0 %).
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido documentadas.
- Soporte multilingüe limitado al kiswahili; no se documentan otras lenguas.

## Casos de uso

- Asistente de atención al ciudadano en kiswahili: conversaciones multi-turno de hasta 2.048 tokens para resolver dudas frecuentes, con la ventaja de que el modelo declina responder cuando la información no consta en la base documental proporcionada.
- Respuesta fundamentada sobre documentación (RAG ligero): dado un pasaje de una normativa o manual en kiswahili, el modelo responde solo si la respuesta está en el texto, lo que reduce el riesgo de invención en entornos de consulta documental.
- Despliegue en hardware modesto: con 259 millones de parámetros y pesos en safetensors de 2,1 GB, puede ejecutarse en GPU de consumo y en CPU, adecuado para organizaciones con infraestructura limitada.
- Educación y tutoría básica en kiswahili: ejercicios de aritmética de hasta 4 dígitos y orden de operaciones, con un rendimiento medido del 91,4 % y 70,0 % respectivamente en la suite del autor.
- Investigación en lenguas de bajos recursos: punto de partida para experimentos de DPO y ajuste fino en swahili, con log de entrenamiento (`dpo_log.jsonl`) y JSON de evaluación (`eval_v3/`) publicados en el repositorio.
- Prototipado de asistentes conversacionales soberanos: al ser Apache 2.0, permite uso comercial y modificación sin restricciones de atribución más allá de la licencia, útil para pilotos de IA local en África Oriental.
- Evaluación de robustez conversacional: la suite congelada con intervalos de Wilson permite reproducir la comparación SFT-2 frente a DPO en ejes como memoria de turnos o persistencia de instrucciones.

## Benchmarks y rendimiento

Evaluación con decodificación greedy sobre la suite congelada v3, porcentaje de acierto con intervalos de Wilson al 95 %. La columna «bar» es el umbral fijado antes del entrenamiento.

| Capacidad | Eje | n | SFT-2 | DPO | Bar | Resultado DPO |
|---|---|---:|---:|---:|---:|---|
| Aritmética hasta 4 dígitos | `arithmetic` | 128 | 91,4 [85,3; 95,1] | 91,4 [85,3; 95,1] | 85 | cumplido |
| Orden de operaciones | `bodmas` | 200 | 70,5 [63,8; 76,4] | 70,0 [63,3; 75,9] | 60 | cumplido |
| Recordar un hecho de turnos previos | `mt_recall` | 80 | 98,8 [93,3; 99,8] | 98,8 [93,3; 99,8] | 70 | cumplido |
| Decir que no se le dijo | `mt_untold` | 40 | 82,5 [68,0; 91,3] | 77,5 [62,5; 87,7] | 60 | cumplido |
| Seguimiento respondido como pregunta fría | `followup` | 8 | 87,5 [52,9; 97,8] | 87,5 [52,9; 97,8] | 75 | cumplido* |
| El pasaje no contiene la respuesta | `grounded_absent` | 60 | 70,0 [57,5; 80,1] | 86,7 [75,8; 93,1] | 60 | cumplido |
| Declinar pregunta sin respuesta | `refusal_unanswerable` | 40 | 97,5 [87,1; 99,6] | 95,0 [83,5; 98,6] | 70 | cumplido |
| Leer un pasaje real | `grounded_real` | 250 | 58,4 [52,2; 64,3] | 56,8 [50,6; 62,8] | 60 | no cumplido |
| Responder lo que sí es respondible | `refusal_answerable` | 30 | 86,7 [70,3; 94,7] | 90,0 [74,4; 96,5] | 90 | cumplido |
| Instrucción persistente entre turnos | `mt_persist` | 20 | 35,0 [18,1; 56,7] | 35,0 [18,1; 56,7] | 70 | no cumplido |
| Problemas verbales no vistos | `word_problem2` | 120 | 24,2 [17,4; 32,6] | 29,2 [21,8; 37,8] | 40 | no cumplido |
| Aritmética AfriMGSM | `afrimgsm` | 100 | 1,0 [0,2; 5,4] | 1,0 [0,2; 5,4] | 5 | no cumplido |
| Estado de lista modificado | `mt_state` | 40 | 5,0 [1,4; 16,5] | 7,5 [2,6; 19,9] | 50 | no cumplido |
| Aritmética arrastrada entre turnos | `mt_arith` | 40 | 2,5 [0,4; 12,9] | 2,5 [0,4; 12,9] | 40 | no cumplido |

*El eje `followup` solo tiene 8 ejemplos y es indicativo. Las puntuaciones idénticas a SFT-2 no evidencian mejora por DPO, y «cumplido» significa que se alcanzó el umbral fijo, no que el resultado generalice. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 0,5-0,6 GB para los pesos (259 millones de parámetros), más overhead de activaciones y caché KV para 2.048 tokens; en la práctica, menos de 2 GB.
- VRAM estimada en FP32: aproximadamente 1,1 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. También viable en CPU.
- Cabe en GPU de consumo sin dificultad, incluidas GPUs de portátil con 4-6 GB.
- Opciones de despliegue: el repositorio exige cargar la implementación propia (`modeling_kw5v2.py`) y el codificador de tokenizador (`kw5_tokenizer.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y los cargadores estándar de Llama no soportan los bloques Canon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KW5 v3 230M DPO | 259 M (safetensors) | 2.048 | sw | Apache 2.0 | Arquitectura Canon propia, requiere código del repo |
| KW5 v3 230M SFT-2 | 230 M (model card) | 2.048 | sw | Apache 2.0 | Checkpoint base; DPO mejora `grounded_absent` de 70,0 a 86,7 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El propio autor advierte de que el modelo sigue teniendo dificultades con estado de larga duración, aritmética arrastrada entre turnos y problemas verbales de varios pasos: `mt_state` 7,5 %, `mt_arith` 2,5 % y `afrimgsm` 1,0 %.
- La persistencia de instrucciones entre turnos es baja (35,0 %, por debajo del umbral de 70), lo que limita su uso en agentes o flujos con instrucciones prolongadas.
- La lectura de pasajes reales no alcanza el umbral fijado (56,8 % frente a 60), por lo que la comprensión lectora general es limitada pese a la mejora en el rechazo fundamentado.
- Riesgo de alucinación en dominios no cubiertos; la mejora en `grounded_absent` se midió con solo 60 ejemplos y no garantiza comportamiento en prompts nuevos.
- Las métricas provienen de una suite congelada y pequeña; varias tienen intervalos de confianza amplios (por ejemplo, `followup` con n=8 o `refusal_answerable` con n=30).
- Soporte exclusivo de kiswahili; no se documentan otras lenguas, y el prompt no debe incluir system prompt.
- Requiere el código de modelado del repositorio; no es cargable con pipelines estándar de transformers para Llama, lo que complica integraciones y despliegues con servidores de inferencia habituales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de atribución y la ausencia de garantías.
- Discrepancia entre el recuento de parámetros de la model card (230.423.424) y los safetensors (259.095.424); verificar antes de dimensionar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/regnant-io/kw5-v3-dpo
- Paper de DPO (Rafailov et al., 2023): no disponible en la información proporcionada
- Blog, repositorio o demo del autor: no disponibles en la información proporcionada
