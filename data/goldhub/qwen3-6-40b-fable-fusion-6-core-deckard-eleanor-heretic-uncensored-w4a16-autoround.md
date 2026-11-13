# goldhub/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-W4A16-AutoRound

## Resumen

Esta ficha cubre una cuantización de 4 bits del modelo Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored, un fine-tune comunitario publicado por DavidAU sobre una base de la familia Qwen 3.6. La versión aquí descrita la publica el usuario goldhub en Hugging Face y aplica cuantización W4A16 con Intel AutoRound sobre los pesos del modelo original, reduciendo el tamaño de aproximadamente 80 GB en BF16 a unos 38 GB en INT4. El objetivo es hacer viable el despliegue de un modelo de razonamiento y generación creativa de gran tamaño en hardware de consumo o en configuraciones multi-GPU modestas.

El modelo base emplea una arquitectura híbrida con atención lineal (Gated DeltaNet con componentes de tipo Mamba SSM) y atención completa en una proporción 3:1, además de una cabeza de predicción multi-token (MTP) que actúa como decodificación especulativa. La cuantización preserva esa cabeza MTP y las capas críticas en BF16 (embeddings, `lm_head`, torre visual y proyecciones de atención lineal), de modo que las capacidades de razonamiento extendido y generación larga se mantienen operativas.

Su relevancia actual es doble: por un lado, demuestra que las técnicas de cuantización post-entrenamiento (AutoRound en modo `best`) son viables sobre arquitecturas híbridas con atención no estándar; por otro, ofrece un modelo "uncensored" y orientado a razonamiento profundo con una ventana de contexto amplia, desplegable en dos GPUs de 24 GB, algo poco habitual en modelos de esta categoría. El número real de parámetros en safetensors es de 15.366.271.472, dato que conviene contrastar con la denominación comercial "40B" del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 72 capas de atención lineal (Gated DeltaNet con Mamba SSM) y 24 capas de atención completa (patrón 3:1); incluye torre visual y cabeza MTP |
| Parámetros totales | 15.366.271.472 (según safetensors); el modelo base se comercializa como "40B" |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de ejemplo con vLLM (`--max-model-len 32768`); el máximo nativo del modelo base no está confirmado en la información disponible |
| Tipos de cuantización | W4A16 (pesos INT4, activaciones BF16), grupo 64, simétrico, formato `auto_round:auto_gptq` |
| Idiomas soportados | en, zh, ru, uk, el, he |
| Licencia | apache-2.0 (heredada del modelo base; AutoRound es Apache-2.0) |
| Formato de pesos | safetensors (cuantización AutoRound/GPTQ); no se menciona GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina 72 capas de atención lineal basadas en Gated DeltaNet (con componentes de espacio de estados tipo Mamba) y 24 capas de atención completa, siguiendo un patrón 3:1. Emplea embeddings rotatorios parciales (`partial_rotary_factor=0.25`) con `head_dim=256`, lo que obliga a usar batch size 1 durante la cuantización para evitar desajustes en las capas de atención completa. Incluye además una torre visual (`model.visual`) y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa.

El proceso de cuantización lo realizó Viktor Zhuromskyy sobre una RTX 3090 con AutoRound 0.15.0 en modo `auto-round-best`: 1000 iteraciones, 5329 muestras de calibración seleccionadas de 37.087 candidatas, longitud de secuencia 2048 y batch size 1. Se mantuvieron en BF16 el `lm_head`, los embeddings, la torre visual y todas las proyecciones de atención lineal; la cabeza MTP se cuantizó mediante WOQ con RTN. El tiempo total de cuantización fue de aproximadamente 4 horas y 10 minutos. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 32.768 tokens en la configuración recomendada).
- Razonamiento paso a paso y resolución de problemas lógicos y matemáticos; el autor reporta resolución correcta de acertijos lógicos y problemas de encuentro de trenes.
- Generación de código: produce código Python completo con sugerencias de tipo, docstrings, manejo de errores y análisis de complejidad (por ejemplo, criba de Eratóstenes con optimización `bitarray` y complejidad O(n log log n)).
- Escritura creativa de formato largo: se observó coherencia sostenida en más de 8.000 tokens generados en ruso.
- Capacidades multimodales: la torre visual se conserva en BF16, aunque la información disponible no detalla tareas de visión concretas.
- Decodificación especulativa mediante MTP (multi-token prediction), con tasas de aceptación variables entre el 13% y el 100% según la previsibilidad del token.
- Multilingüismo limitado a los idiomas declarados: inglés, chino, ruso, ucraniano, griego y hebreo.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.
- El modelo base está etiquetado como "uncensored" y "heretic", lo que implica una reducción de los filtros de rechazo respecto a la versión alineada original.

## Casos de uso

- Razonamiento matemático y lógico asistido: el modelo mantiene cadenas de razonamiento largas (se observaron 2.900 tokens en una tarea de razonamiento y matemáticas) y resuelve problemas de varios pasos, lo que lo hace adecuado para tutoría o verificación de soluciones.
- Generación de código en producción: produce módulos Python completos con tipos, docstrings y manejo de errores; puede integrarse en pipelines de revisión o generación de utilidades internas, siempre con revisión humana.
- Escritura creativa de formato largo: la coherencia sostenida más allá de 8.000 tokens permite generar relatos, guiones o documentación narrativa en ruso, inglés o chino sin degradación apreciable.
- Asistente conversacional con contexto extenso: con 32.768 tokens de ventana puede gestionar conversaciones multi-turno con documentos largos adjuntos, útil para atención al cliente técnica o análisis de contratos.
- Investigación sobre cuantización de arquitecturas híbridas: sirve como caso de estudio reproducible de AutoRound sobre atención lineal y Mamba, con receta y hiperparámetros documentados.
- Evaluación de decodificación especulativa: la cabeza MTP operativa permite medir el impacto de la aceptación especulativa en latencia y throughput bajo vLLM o SGLang.
- Experimentación con modelos sin censura: para investigación sobre alineación, filtros de rechazo y comportamiento en dominios sensibles, en entornos controlados y con las salvaguardas adecuadas.

## Benchmarks y rendimiento

Los únicos datos disponibles son benchmarks de generación propios del autor, ejecutados con vLLM, TP=2, temperatura 0,6, sobre una RTX 3090.

| Prueba | Tokens de salida | tok/s | Finalización |
|---|---:|---:|---|
| Línea base de velocidad | 800 | 37,45 | stop |
| Razonamiento + matemáticas | 2900 | 36,78 | stop |
| Generación de código | 3241 | 37,62 | stop |
| Escritura creativa (RU) | 8192 | 35,27 | length |

Como referencia, el autor cita un modelo base de 27B (Qwopus INT4) que alcanza 42–59 tok/s en el mismo arnés. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 38 GB de pesos en INT4; con contexto de 32.768 tokens y overhead de KV cache conviene prever 48–56 GB totales.
- Configuraciones viables: 2×24 GB (por ejemplo, 2×RTX 3090 o 2×RTX 4090) con tensor parallel 2, o 3 GPUs de 24 GB.
- No cabe en una única GPU de consumo de 24 GB con contexto largo; en una sola GPU de 48 GB (A6000, L40S) sería ajustado.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; el autor validó la cuantización en una RTX 3090.
- Despliegue recomendado: vLLM con `--tensor-parallel-size 2 --max-model-len 32768 --gpu-memory-utilization 0.90 --trust-remote-code`.
- SGLang funciona con TP=1 y PP=3, pero en esa configuración la decodificación especulativa MTP no opera por solapamiento entre etapas de pipeline.
- Throughput observado: 35–47 tok/s con MTP activo (MTP=3, aceptación del 70–100% en vLLM TP=2); con MTP=2 se recomienda para generación larga por estabilidad de aceptación.
- No se documenta soporte de llama.cpp, Ollama ni GGUF en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (goldhub, W4A16 AutoRound) | 15,37B reales (base "40B") | 32.768 config. | W4A16, grupo 64 | Apache-2.0 | Hugging Face, vLLM/SGLang |
| Base DavidAU Qwen3.6-40B Fable Fusion Heretic | "40B" (BF16 ~80 GB) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Qwopus 27B INT4 (referencia del autor) | 27B | no disponible | INT4 | no disponible | no disponible en la información |

No se dispone de datos de benchmarks estándar que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El número real de parámetros (15,37B) difiere notablemente de la denominación "40B" del modelo base; conviene verificar expectativas de calidad y coste.
- Modelo "uncensored" y "heretic": reduce los filtros de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o dañino; requiere moderación externa en producción.
- Riesgo de alucinación inherente a los modelos de razonamiento largo, agravado por la cuantización de 4 bits.
- La cuantización W4A16 puede degradar ligeramente tareas sensibles a precisión; el autor no reporta métricas de calidad frente al BF16.
- El batch size 1 es obligatorio durante la cuantización por la atención parcial rotatoria; no se documenta comportamiento con batch mayor en inferencia.
- La decodificación especulativa MTP no funciona en SGLang con pipeline parallel (`--pp 3`).
- Idiomas limitados a seis; el español no figura entre los soportados, por lo que el rendimiento en castellano es incierto.
- La licencia Apache-2.0 se hereda del modelo base, pero el carácter "uncensored" puede incumplir políticas de uso de plataformas de despliegue.
- Solo 333 descargas y 4 likes en el momento de la consulta: ecosistema de validación muy reducido.
- La plantilla de chat está parcheada (Qwen-Fixed-Chat-Templates v21.3); usar la original puede degradar el seguimiento de instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goldhub/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-W4A16-AutoRound
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/discussions/66
- Ruach Studio: https://github.com/igrbible/Ruach_Studio
- Awesome YUE2: https://github.com/igrbible/Awesome-YUE2
