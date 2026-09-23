# mlboydaisuke/Qwen3.5-2B-Decision-CoreAI

## Resumen

Qwen3.5-2B-Decision-CoreAI es la conversión del modelo de decisión tipada Jev-Style-Qwen3.5-2B-Decision (derivado a su vez de Qwen/Qwen3.5-2B-Base) al runtime Core AI de Apple, el sucesor de Core ML en iOS 27 y macOS 27. No es un modelo conversacional ni generativo en sentido amplio: recibe un estado, una pregunta y una lista cerrada de opciones, y devuelve una distribución de probabilidad sobre esas opciones. Lo publica el usuario mlboydaisuke como artefacto derivado bajo licencia Apache-2.0.

La torre de texto exportada consta de 24 capas, 18 de atención lineal y seis de atención completa, empaquetadas como LanguageBundle de Core AI con S=1 y una ventana de contexto de 4.096 tokens. El modelo fuente fusiona un LoRA sobre Qwen3.5-2B-Base y pliega su temperatura de calibración dentro de la RMSNorm final, conservando la cabeza LM con embeddings atados. El autor del checkpoint fuente reporta 82,3 % de acierto en cinco tareas de decisión y un ECE de 0,017 sobre 1.500 ejemplos retenidos; son mediciones del autor, no reverificadas por esta conversión.

Su interés práctico es doble. Por un lado, ofrece probabilidades calibradas para decisiones discretas en lugar de texto libre, lo que encaja con tareas de enrutado, triaje y clasificación en aplicaciones Apple. Por otro, documenta un flujo completo de conversión inversa MLX → HuggingFace → Core AI con una prueba de equivalencia numérica entre dos oráculos independientes (MLX BF16 en GPU y transformers FP32 en CPU), con coincidencia en 58 de 58 filas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas de texto (18 de atención lineal con convolución y compuerta, 6 de atención completa), cabeza LM con embeddings atados |
| Parámetros totales | no disponible (denominación comercial "2B"; el recuento exacto no se publica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (fijada por el bundle Core AI exportado) |
| Tipos de cuantización | fp16 (referencia) e int8hu (artefacto publicado); la fuente MLX está en BF16 |
| Idiomas soportados | inglés (en); el fixture incluye dos filas en español marcadas como evidence_only |
| Licencia | Apache-2.0 |
| Formato de pesos | .aimodel (Core AI LanguageBundle); origen MLX bf16; artefacto intermedio en safetensors para transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5 en su variante híbrida: de las 24 capas de la torre de texto, 18 usan atención lineal con `linear_attn.conv1d` y compuertas, y seis usan atención completa. El checkpoint fuente se obtiene fusionando un LoRA sobre Qwen3.5-2B-Base y absorbiendo la temperatura de calibración en la RMSNorm final, de modo que la lectura de probabilidades se hace con T = 1 sobre los pesos publicados. La cabeza LM permanece atada al embedding de entrada.

La conversión a Core AI no es un simple cambio de prefijos. El conversor inverso reasigna `language_model.model.*` a `model.language_model.*`, transpone 18 tensores `linear_attn.conv1d.weight` de `[6144,4,1]` a `[6144,1,4]` y resta uno a 61 pesos de RMSNorm de escala directa (normas de entrada, post-atención, q/k y la final), porque el grafo Torch congelado multiplica por `1 + weight`. Los 18 escalares `linear_attn.norm` con compuerta ya usan la convención directa y no se modifican. Transposiciones y desplazamientos se calculan y almacenan en FP32 para evitar un segundo redondeo a BF16; el resto de tensores conserva su dtype, incluidos los 18 tensores `A_log` en FP32. La cabeza atada no se duplica en el checkpoint convertido. El config se aplana como `qwen3_5_text` con embeddings atados para esquivar un fallo de serialización de transformers 4.57.6 con el `vision_config: null` anidado del origen. Sobre los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no hay información disponible en la model card.

## Capacidades

- Decisión de opción múltiple (Choice): devuelve una distribución de probabilidad sobre las opciones declaradas; el fixture cubre de 2 a 16 opciones y la fuente admite hasta 26 etiquetas alfabéticas.
- Decisión booleana (Bool): con las opciones `yes` / `no`, devuelve p(yes).
- Puntuación ordinal (Score): ordena niveles y devuelve Σ i·p(i) indexado desde cero; el fixture cubre de 2 a 10 niveles.
- Calibración de probabilidades: el autor reporta ECE de 0,017 sobre 1.500 ejemplos retenidos, con la temperatura ya integrada en los pesos.
- Lectura determinista de la respuesta: logits de la última posición restringidos a los IDs de un solo token de las etiquetas ` A`, ` B`, … con espacio inicial, y softmax en FP32 solo sobre esos logits.
- Contrato de prompt estricto en texto plano, sin BOS ni plantilla de chat, codificado con `add_special_tokens=False`; cada pregunta parte de estado nuevo.
- Capacidades ausentes: no hay generación libre de texto, ni tool calling / function calling, ni razonamiento multi-paso, ni modo thinking, ni visión, ni audio. El modelo opera como una función de decisión de una sola pasada (estilo System One).
- Cobertura idiomática real limitada al inglés; las dos filas en español del fixture están marcadas como `evidence_only`.

## Casos de uso

- Enrutado de intenciones en aplicaciones iOS y macOS: con 2 a 16 opciones declaradas, el modelo devuelve la probabilidad de cada intent antes de despachar la acción, y puede ejecutarse on-device sin sacar la consulta del dispositivo.
- Triaje de tickets de soporte: clasificar cada incidencia en categorías cerradas (facturación, acceso, error técnico) usando `decide`, con la probabilidad como umbral para derivar a revisión humana cuando la confianza es baja.
- Validación booleana de formularios y reglas de negocio: `decide_bool` responde sí/no a preguntas del tipo "¿este campo contradice la declaración anterior?", con p(yes) como señal de confianza calibrada.
- Priorización ordinal de colas de trabajo: `decide_score` con niveles 0-9 permite asignar severidad o urgencia a un ítem y ordenar la cola por el valor esperado, en lugar de por una etiqueta categórica.
- Inferencia privada en el borde: al desplegarse como bundle de Core AI sobre GPU o Neural Engine en iOS 27 / macOS 27, es adecuado para dominios con datos sensibles (salud, finanzas personales) donde no se permite enviar el estado a un servicio remoto.
- Enrutado en cascada de modelos: usar las probabilidades del modelo para decidir si una consulta se resuelve localmente o se escala a un modelo mayor en la nube, reduciendo coste y latencia en el caso mayoritario.
- Procesamiento de encuestas y experimentos A/B: convertir respuestas abiertas más un conjunto de opciones en distribuciones agregables, aprovechando que el modelo expone probabilidades en lugar de una única etiqueta.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre el modelo fuente (no reverificadas en esta conversión):

| Métrica | Valor |
|---|---|
| Precisión en cinco tareas de decisión | 82,3 % |
| ECE sobre 1.500 ejemplos retenidos | 0,017 |

Fidelidad de la conversión, medida sobre las 58 filas del fixture en Apple M4 Max GPU (macOS 27.0 26A428, 2026-09-23):

| Comprobación (58 filas) | Referencia fp16 | Artefacto int8hu |
|---|---|---|
| Argmax de opción = oráculo FP32 B | 58/58 | 58/58 |
| Coincidencia con margen de B ≥ 0,02 | 57/57 | 57/57 |
| Máx. \|Δp\| frente a B | 0,005788386 | 0,007585824 |
| Media de medias por fila \|Δp\| frente a B | 0,000343644 | 0,0 |

Prueba de conversión inversa entre oráculos (A: `jev_style_mlx.py` con mlx-lm 0.31.3 / MLX 0.32.2, BF16 en GPU de Mac; B: transformers 5.17.0 con la clase nativa Qwen3.5 solo texto, cabeza atada, FP32 en CPU): coincidencia en 58/58 elecciones, 57/57 con margen de B ≥ 0,02, máximo \|Δp\| de 0,011958122 y media de medias por fila de 0,001554969.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: Apple Core AI (iOS 27 / macOS 27) como LanguageBundle `.aimodel`, ejecutable en GPU o en Neural Engine.
- Medición de referencia de la conversión: Apple M4 Max GPU, macOS 27.0 26A428.
- Cifra de contexto del runtime: el autor cita 94 tok/s para Qwen3-8B en 4 bits sobre M4 Max GPU (frente a 90 tok/s de MLX bajo el mismo protocolo); es un dato del runtime, no de este modelo de 2B.
- VRAM/RAM dedicada: no publicada. Estimación derivada del tamaño (≈2.000 M de parámetros): en torno a 4 GB en fp16 e int8 en torno a 2 GB, más el overhead del runtime.
- Tamaño del repositorio: 6,8 GB (incluye artefactos de conversión, no solo los pesos).
- GPU consumer NVIDIA o AMD: no soportadas por este bundle, que depende del runtime de Apple.
- Opciones de despliegue documentadas: `coreai-torch` con `coreai.llm.export` para generar el bundle; MLX con mlx-lm 0.31.3 / MLX 0.32.2 para ejecutar la fuente; transformers 5.17.0 (clase nativa Qwen3.5 solo texto, cabeza atada, FP32 en CPU) para verificación. No hay soporte declarado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput específicos de este checkpoint: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| mlboydaisuke/Qwen3.5-2B-Decision-CoreAI | ≈2B (no detallado) | 4.096 tokens | .aimodel, Core AI (iOS 27 / macOS 27) | Apache-2.0 | Puerto a Core AI, S=1, salida de probabilidades, int8hu y fp16 |
| chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16 | ≈2B (no detallado) | no disponible | MLX bf16 | Apache-2.0 | Fuente directa de esta conversión; incluye la temperatura de calibración en los pesos |
| Qwen/Qwen3.5-2B-Base | ≈2B (no detallado) | no disponible | safetensors / transformers | no disponible | Modelo base previo a la fusión del LoRA de decisión; no expone el contrato de decisión tipada |

No se dispone de datos de benchmarks comparables entre estos tres modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: es una función de decisión sobre opciones declaradas, no un modelo de generación de texto ni un asistente conversacional.
- Idioma: la cobertura declarada es únicamente inglés; las dos filas en español del fixture están marcadas como `evidence_only` y no constituyen una validación multilingüe.
- Contrato rígido: el prompt debe respetar exactamente el formato del autor terminando en `Answer:`, sin BOS ni plantilla de chat, con `add_special_tokens=False`. Cualquier desviación invalida la lectura de probabilidades.
- Lectura frágil: la respuesta se obtiene de los logits de la última posición restringidos a los IDs de un solo token de las etiquetas con espacio inicial y softmax FP32 sobre esos logits únicamente. Un tokenizador distinto o un carácter de opción mal formado rompe el procedimiento.
- Límite de opciones: la fuente admite hasta 26 etiquetas alfabéticas, pero el fixture validado cubre Choice de 2 a 16 opciones y Score de 2 a 10 niveles; fuera de ese rango no hay evidencia de comportamiento.
- Contexto corto: 4.096 tokens. En el fixture, dos prompts `zoo_only` ocupan 1.743 y 1.742 tokens, por lo que estados largos dejan poco margen.
- Riesgo de calibración fuera de distribución: el ECE de 0,017 procede de 1.500 ejemplos retenidos del autor y no ha sido replicado de forma independiente; la temperatura está fijada en los pesos y no se recalibra por dominio.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o equidad en la información disponible.
- Adopción nula: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, sin revisión por pares ni validación de terceros.
- Dependencia de plataforma: el artefacto solo es ejecutable en el runtime Core AI de Apple; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B-Base y del checkpoint fuente antes de un despliegue en producción.
- Reproducibilidad: la exportación usa un snapshot local privado del origen MLX fijado en la revisión `69a91b6778df7d11b9e13e0f7d4c6a5aa6ad1bc5`; fuera de esa revisión la equivalencia numérica no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3.5-2B-Decision-CoreAI
- Modelo fuente (MLX bf16): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Revisión fijada del modelo fuente: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16/tree/69a91b6778df7d11b9e13e0f7d4c6a5aa6ad1bc5
- Model card fijada del autor: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16/blob/69a91b6778df7d11b9e13e0f7d4c6a5aa6ad1bc5/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo
- Fixture del modelo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/qwen3.5-2b-decision/fixtures-qwen3.5-2b-decision.json
- Conversor inverso MLX → HF: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/mlx_to_hf_qwen3_5.py
- Exportador a Core AI: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/export_qwen3_5_decision_mlx_decode_pipelined.py
- Benchmark de referencia Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los repositorios citados en ella.
