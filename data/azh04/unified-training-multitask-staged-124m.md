# AZH04/unified-training-multitask-staged-124m

## Resumen

El modelo `AZH04/unified-training-multitask-staged-124m` es un checkpoint de investigación de 124M de parámetros publicado por el autor AZH04 como material de réplica (*rebuttal*) del artículo *Training Foundation Models with a Single Algorithm* (arXiv 2610.40564). Se trata de la rama "staged" (entrenamiento por etapas) de una comparación entre entrenamiento escalonado y entrenamiento unificado sobre dos tareas de resolución de restricciones: torres de pisos (`nl_tower`) y asignación numérica (`nl_assignment`). El modelo parte del checkpoint preentrenado `controlled/pretrain-only` del repositorio `sfanm/unified-training`, preentrenado sobre ClimbMix y Dolmino sin datos de puzles.

La arquitectura es un transformer decoder-only estilo Llama (`LlamaForCausalLM`) con 12 capas, dimensión oculta 768, 12 cabezas de atención, MLP de 2.048, RoPE y embeddings atados, con una ventana de contexto de 2.048 tokens y tokenizador GPT-2 (vocabulario ampliado a 50.304). El modelo no es un asistente conversacional generalista: es un artefacto experimental cuyo comportamiento esperado es resolver puzles de restricciones mediante deducción paso a paso y emitir la respuesta en formato `\boxed{...}`.

El interés del repositorio es metodológico más que de uso práctico: documenta con detalle (semillas, recibos de entrenamiento, manifiestos de datos con sha256) el protocolo SFT seguido de RL, y permite reproducir la rama escalonada del estudio. No hay datos publicados de benchmarks, licencia ni idiomas soportados, y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`LlamaForCausalLM`): 12 capas, hidden size 768, 12 cabezas, MLP 2.048, RoPE, embeddings atados |
| Parametros totales | 124M (modelo controlado del artículo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y fp32) |
| Idiomas soportados | no disponible (prompts de puzles en ingles segun los nombres de los datasets) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,2 GB); `sft_init` en bf16 (247 MB), checkpoints RL en fp32 (494 MB cada uno) |
| Tokenizador | GPT-2, vocabulario ampliado a 50.304; token 50256 como BOS, EOS y padding |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 124M de parámetros con configuración tipo Llama pequeña (12 capas, 768 de dimensión, 12 cabezas, FFN de 2.048, RoPE y *tied embeddings*). El preentrenamiento se hereda del checkpoint `controlled/pretrain-only` de `sfanm/unified-training`, entrenado sobre texto de ClimbMix y Dolmino sin datos de puzles. El entrenamiento posterior se organiza en dos etapas. La primera es un SFT de una pasada sobre el conjunto estático `eqex_916000`, con 916.000 ejemplos por tarea (1.832.000 en total, aproximadamente 1,0B tokens contados con el tokenizador GPT-2), mezclados en un único fichero y barajados con semilla 0; la torre recibe ~1,15 pasadas sobre 796.175 trazas (~587M tokens) y la asignación ~23 pasadas sobre 39.760 trazas (~412M tokens). El recetario usa AdamW (β = 0,9/0,95), weight decay 0,01, clipping 1,0, batches de 32 ejemplos, 57.250 pasos, secuencias truncadas a 2.048 tokens, pérdida solo sobre tokens de respuesta y EOS, LR pico 2e-4 con warmup lineal del 5% y decaimiento coseno, fp32 con autocast bf16, una GPU y 3,5 horas; la pérdida final de entrenamiento fue 0,0061.

La segunda etapa es RL con 8.000 actualizaciones sobre un fichero combinado de 48.570 prompts (28.570 de torre y 20.000 de asignación), sin mezclar trazas SFT ni texto web. Cada actualización muestrea 32 prompts con balance 16/16 por tarea y bloques de 4+4, sin reemplazo, con el mismo orden para ambas semillas; en total se consumen 128.000 prompts por tarea (~4,5 pasadas sobre el pool de torre y ~6,4 sobre el de asignación). Se publican dos semillas (1234 y 4321) en el paso 8.000, y el autor anuncia checkpoints de 16.000 actualizaciones. La innovación técnica destacable no está en la arquitectura sino en el protocolo experimental: comparación controlada staged vs unified con settings resueltos publicados (`rl_staged_seed*.env`) y manifiestos sha256 de los datos, con verificación explícita de no solapamiento entre trazas SFT, prompts RL y conjuntos de test.

## Capacidades

- Generación de texto autoregresiva condicionada por prompt crudo, sin plantilla de chat ni system prompt.
- Resolución de puzles de restricciones de dos familias: torres de pisos con relaciones de amistad y pistas aritméticas (`nl_tower`, nivel Base) y asignación de números con pistas de suma, diferencia y orden (`nl_assignment`, nivel 5).
- Razonamiento multi-paso con traza de deducción explícita que termina en una respuesta estructurada `\boxed{Name=NUMBER, Name=NUMBER, ...}` seguida de EOS.
- Generalización limitada dentro de la misma familia de tareas: existen conjuntos de test en niveles 4 y 6 de `nl_assignment` además del nivel 5.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de visión, audio ni modo de pensamiento separado.
- Capacidades multilingües no documentadas; los datos y prompts publicados están en inglés.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni sigue instrucciones generales.

## Casos de uso

- Reproducción del experimento del artículo: cargar `staged/seed1234/update_08000` y evaluar sobre `nltw_m` y `nlasg_xx` (1.024 preguntas cada uno) para contrastar la rama escalonada con la unificada.
- Estudio de dinámica de RL: comparar las dos semillas publicadas (1234 y 4321) en el paso 8.000 para medir variabilidad entre semillas con settings idénticos.
- Análisis de currículo SFT: usar `staged/sft_init` como línea base de "update 0" y medir la ganancia atribuible a las 8.000 actualizaciones de RL.
- Investigación de sobreajuste por repetición: el SFT de asignación da 23 pasadas sobre 39.760 trazas, un régimen extremo útil para estudiar memorización y generalización a niveles 4 y 6.
- Evaluación de formatos de salida: verificar el cumplimiento estricto del formato `\boxed{...}` y del prompt crudo terminado en `Answer: ` en pipelines de evaluación automática.
- Servicio de inferencia acotado: desplegar el checkpoint con vLLM para generar trazas de solución sobre prompts de puzles en lote, dado el tamaño reducido (494 MB en fp32).
- Docencia y experimentación de bajo coste: fine-tuning o ablaciones sobre un modelo de 124M y contexto 2.048 que cabe en una única GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe exclusivamente el protocolo de entrenamiento (pérdida final de SFT 0,0061, horas de cómputo, número de actualizaciones y pasadas sobre los datos) y los conjuntos de test previstos (`nltw_m`, `nlasg_xx`, `nlasg_x`, `nlasg_xxx`), pero no incluye métricas de exactitud ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (494 MB de pesos) y aproximadamente 250 MB en bf16 para `sft_init`; el overhead de activaciones con contexto 2.048 es mínimo.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM libre; el entrenamiento SFT documentado se completó en 1 GPU en 3,5 horas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier RTX (por ejemplo 3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, subfolder=sub)`; vLLM tras descargar una carpeta con `hf download ... --include "staged/seed1234/update_08000/*"`; llama.cpp/Ollama no están documentados para este repo y requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño (124M) y el contexto corto, la latencia por petición será de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AZH04/unified-training-multitask-staged-124m` | 124M | 2.048 | SFT + RL escalonado sobre puzles | no disponible | Hugging Face, 0 descargas |
| `sfanm/unified-training` (`controlled/pretrain-only`) | 124M | no disponible | Solo preentrenamiento (ClimbMix + Dolmino) | no disponible | Hugging Face |
| Rama "unified" del mismo artículo | 124M | no disponible | Entrenamiento unificado de las mismas tareas | no disponible | No incluida en este repositorio |

La comparación relevante es interna al estudio: el propio autor indica que la rama unificada no se incluye en este repo, por lo que la comparativa pública se limita al checkpoint preentrenado de partida. No se dispone de alternativas externas equivalentes documentadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin métricas publicadas: no hay exactitud, benchmarks ni evaluaciones de robustez disponibles.
- Dominio extremadamente estrecho: solo puzles de torre y asignación; no sigue instrucciones generales ni mantiene conversaciones.
- Formato de prompt rígido: requiere prompt crudo terminado en `Answer: ` y salida `\boxed{...}`; desviarse degrada el comportamiento esperado.
- Contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Riesgo de alucinación y de deducciones plausibles pero incorrectas en puzles fuera de distribución (niveles distintos, más personas, pistas no vistas).
- Sesgos no evaluados: no hay análisis de sesgos sociales, de género ni culturales en la información disponible.
- Licencia no disponible: no se puede confirmar el uso comercial; trátese como no apto para producción hasta verificación.
- Idiomas no documentados; los datos publicados están en inglés.
- Repositorio con 0 descargas y 0 likes, sin mantenimiento comunitario conocido; los checkpoints de 16.000 actualizaciones están anunciados pero no publicados.
- Los pesos RL en fp32 (494 MB) y SFT en bf16 (247 MB) conviven en un repo de 1,2 GB; hay que descargar subcarpetas concretas para evitar confusiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AZH04/unified-training-multitask-staged-124m
- Modelo de partida (`controlled/pretrain-only`): https://huggingface.co/sfanm/unified-training
- Dataset de trazas de asignación: https://huggingface.co/datasets/sfanm/nl-assignment-midtraining
- Artículo citado: *Training Foundation Models with a Single Algorithm*, arXiv 2610.40564 (sin URL directa en la información proporcionada)
