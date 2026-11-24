# gowravvishwakarma/qllm-pam2-sci1-386m-chat

## Resumen

SCI-1 Chat (PAM-2, 386M) es la versión ajustada para conversación del modelo base SCI-1, un modelo de lenguaje recurrente de 385,8 millones de parámetros desarrollado por gowravvishwakarma. Su característica principal es que no utiliza mecanismo de atención ni caché KV: emplea una arquitectura denominada Phase-Associative Memory (PAM-2) con regla delta, lo que le permite mantener un estado de memoria fijo de 3,5 MiB por secuencia independientemente de la longitud del contexto. Esto lo convierte en una alternativa no-transformer con coste de memoria constante en inferencia.

El modelo parte del checkpoint base SCI-1 (paso 749.500, 49,12B tokens de preentrenamiento) y se somete a un ajuste supervisado corto (SFT) de 0,25B tokens sobre el dataset smoltalk2 en inglés, alcanzando 49,37B tokens totales. Conserva las habilidades de contexto largo del modelo base: aprende una regla a partir de 8 ejemplos distribuidos en el doble de su ventana de entrenamiento de 4.096 tokens (0,995 de acierto) y recupera un dato exacto 16k tokens atrás (0,91).

Es relevante porque explora una línea arquitectónica alternativa a los transformers para contextos largos con memoria acotada, y porque publica guards pre-registrados que verifican que el SFT no degrada las capacidades del modelo base. No obstante, sigue siendo un modelo de investigación pequeño, con limitaciones claras en aritmética y conocimiento factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Phase-Associative Memory (PAM-2) con regla delta, sin atención, sin caché KV, no-transformer (recurrente) |
| Parámetros totales | 385.817.038 (embedding de entrada/salida atado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de entrenamiento de 4.096 tokens; se reportan pruebas de recuperación a 8k y 16k tokens (2× y 4× la ventana) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `sci1_chat_386m.pt` (PyTorch, fp32, 1,54 GB) |
| Vocabulario | 50.261 tokens (GPT-2 BPE + 4 tokens añadidos: inicio/fin de ChatML y etiquetas think, ids 50257-50260) |
| Estado de memoria | 3,5 MiB por secuencia, independiente de la longitud de contexto |
| Modelo base | gowravvishwakarma/qllm-pam2-sci1-386m (paso 749.500, 49,12B tokens) |
| Tokens de SFT | +0,25B tokens (0,20B con LR constante 2e-4, luego 0,05B con decaimiento lineal a 0) |

## Arquitectura y entrenamiento

La arquitectura PAM-2 (Phase-Associative Memory) sustituye la atención por un mecanismo recurrente con regla delta que asocia información en función de fases, manteniendo un estado de memoria fijo de 3,5 MiB por secuencia. Al no requerir caché KV, el coste de memoria en inferencia no crece con la longitud del contexto, a diferencia de un transformer estándar. El modelo tiene 385,8M parámetros con el embedding de entrada y salida atado y un vocabulario de 50.261 tokens basado en GPT-2 BPE más cuatro tokens especiales para ChatML y las etiquetas de razonamiento.

El preentrenamiento del modelo base alcanzó 49,12B tokens (paso 749.500). El SFT se realizó sobre el config SFT de smoltalk2, con una única pasada sin repeticiones y una mezcla medida: smol-magpie-ultra 41 %, OpenHermes 2.5 34 %, smol-summarize 12 %, systemchats-30k 6 %, smol-rewrite 4 % y tulu-3 personas IF 3 %. Se excluyeron los splits multilingües, de contexto largo, de tool/function calling, de agentes y de trazas de razonamiento; se limitaron openthoughts3 al 5 %, mixture-of-thoughts al 10 % y table-gpt al 20 %. Se aplicó descontaminación eliminando conversaciones que compartieran un 13-grama con cualquier benchmark reportado o con las propias prompts de sonda. La pérdida se calcula solo sobre los tokens del asistente y el `<|im_end|>` de cierre; las conversaciones se separan con `<|endoftext|>`, donde el modelo reinicia su memoria. Aproximadamente el 20-30 % de las ventanas de entrenamiento fueron la mezcla de preentrenamiento del modelo base (incluidos sus documentos de reglas de largo alcance) para ensayar las habilidades previas. El schedule usó 65.536 tokens por paso, warm-up de 200 pasos hasta 2e-4, constante hasta 0,20B tokens y decaimiento lineal a 0 en 0,05B, con el estado del optimizador heredado del modelo base.

## Capacidades

- Generación de texto en inglés con formato conversacional ChatML; termina su turno con `<|im_end|>` en el 97,8 % de las respuestas (60 prompts × 3 decodificaciones, presupuesto de 768 tokens).
- Razonamiento sobre reglas en contexto largo: aprende una regla a partir de 8 ejemplos distribuidos a lo largo de 8k tokens (2× su ventana de entrenamiento) con 0,995 de acierto.
- Recuperación exacta de información a larga distancia: 0,908 a 16k tokens (4× la ventana) y 0,925 a 8k tokens (2×).
- Aplicación de reglas indicadas explícitamente en contexto largo (8k tokens) con baja tasa de aplicación errónea (P_fu 0,01 y scope_fu 0,01).
- Respuestas directas y cierre limpio del turno gracias al SFT.
- Capacidades básicas de conocimiento general y traducción simple (ejemplos: partes de una araña, traducción de "good morning" al francés, causas de las estaciones, unidad de resistencia eléctrica).
- No soporta tool calling ni function calling (excluidos del SFT y ausentes en las respuestas normales).
- No soporta agentes ni razonamiento multi-paso explícito (trazas de razonamiento excluidas del SFT).
- Solo inglés: no se observaron respuestas en otros idiomas.

## Casos de uso

- Investigación en arquitecturas no-transformer: el modelo sirve como banco de pruebas reproducible para estudiar alternativas a la atención con memoria acotada, ya que su estado de 3,5 MiB por secuencia permite ejecutar muchas conversaciones concurrentes en una sola GPU sin que el consumo crezca con el contexto.
- Procesamiento de documentos largos con memoria constante: para tareas de recuperación de datos exactos en ventanas de 8k-16k tokens (4× su ventana de entrenamiento), el modelo mantiene un rendimiento de recuperación de 0,91-0,93 sin necesidad de caché KV, lo que simplifica el despliegue en entornos con VRAM limitada.
- Evaluación de técnicas de SFT y replay: el modelo documenta una receta completa de ajuste supervisado con guards pre-registrados y descontaminación por 13-gramas, útil como referencia metodológica para equipos que ajusten modelos pequeños sin degradar habilidades previas.
- Asistente conversacional de dominio acotado en inglés: para preguntas cotidianas y de conocimiento general simple (los ejemplos muestran respuestas correctas sobre hechos básicos), puede desplegarse como chatbot ligero con formato ChatML y cierre de turno fiable.
- Aplicaciones de inferencia en el borde (edge): con 385,8M parámetros en fp32 (1,54 GB) y un estado de memoria fijo, el modelo es candidato para prototipos en dispositivos con recursos moderados, aunque requeriría cuantización (no publicada) para entornos muy restringidos.
- Estudio de mecánicas de memoria asociativa: la regla delta y la asociación por fases permiten experimentar con tareas de aprendizaje en contexto (in-context learning) y de seguimiento de reglas a lo largo de secuencias largas, comparando con transformers de tamaño similar.

## Benchmarks y rendimiento

Resultados de los guards pre-registrados del autor (mismo código de evaluación para ambos checkpoints; azar 0,125 en las sondas de 8 vías):

| Métrica | SCI-1 Chat | SCI-1 base | Guard |
|---|---|---|---|
| Regla a partir de 8 ejemplos repartidos en 8k (2×) | 0,995 | 0,964 | ≥ 0,864 |
| Recuperación exacta a 16k atrás (4×) | 0,908 | 0,942 | ≥ 0,892 |
| Recuperación exacta a 8k atrás (2×) | 0,925 | 0,978 | reportado |
| Regla de skill-pack a 8k | 0,905 | 0,645 | reportado |
| Tarea de regla más difícil a 8k | 0,93 | 0,90 | reportado |
| HellaSwag (acc_norm) | 0,380 | 0,372 | reportado |
| ARC-easy (acc) | 0,575 | 0,559 | reportado |
| PIQA (acc_norm) | 0,651 | 0,636 | reportado |
| Regla indicada a 8k aplicada erróneamente (P_fu / scope_fu; menor es mejor) | 0,01 / 0,01 | – | ≤ 0,20 / 0,30 |

Calidad de chat: cierre con `<|im_end|>` en el 97,8 % de las respuestas; sin texto de tool-call en respuestas normales; sin respuestas en otros idiomas. En un A/B ciego contra el modelo base sobre 60 prompts (greedy), el SFT fue preferido en 24, el base en 8, empate en 14 y ambos malos en 14 (28 prompts sin ganador); el juez fue un modelo de lenguaje mayor (Claude), no un panel humano. El SFT ganó sobre todo en preguntas cotidianas (19 frente a 2), mientras que el base fue mejor en 4 de 6 preguntas técnicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en fp32 (pesos de 1,54 GB más overhead de activaciones y estado de memoria de 3,5 MiB por secuencia); no se han publicado pesos cuantizados, por lo que no hay estimaciones para int8/int4.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp32; por el tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: el autor proporciona scripts propios (`run_complete.py`, `run_chat.py`, `verify.sh`) que solo requieren `torch` y `transformers` (para el tokenizer GPT-2); no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es improbable que estos motores lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada. La comparación más directa disponible es con su propio modelo base y con la línea anterior del autor:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| SCI-1 Chat (PAM-2) | 385,8M | Ventana de 4.096 tokens; recuperación probada a 16k | MIT | Disponible en HF |
| SCI-1 base (PAM-2) | 385,8M | Ídem | MIT | Disponible en HF |
| qllm-pam-v11-e3k3-chat (V11) | no disponible | no disponible | no disponible | Disponible en HF |

No se han publicado comparaciones con transformers de tamaño similar (por ejemplo, modelos de ~400M parámetros) en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación pequeño: el autor advierte que se equivoca en aritmética y en muchos hechos; no es apto para producción sin validación exhaustiva.
- Riesgo de alucinación: elevado en conocimiento factual y cálculos, coherente con su tamaño y con la advertencia explícita de la model card.
- Solo inglés: no se observaron respuestas en otros idiomas y los splits multilingües se excluyeron del SFT.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: estas capacidades se excluyeron deliberadamente del entrenamiento.
- Contexto de entrenamiento limitado a 4.096 tokens: las pruebas a 8k y 16k muestran degradación (recuperación de 0,978 a 8k y 0,942 a 16k en el base; 0,925 y 0,908 en el chat), por lo que el uso más allá de la ventana debe validarse caso por caso.
- Evaluación de calidad de chat limitada: un solo juez automático (Claude) sobre 60 prompts, sin panel humano, con 28 de 60 prompts sin ganador; los resultados no deben generalizarse.
- Una sola ejecución y una sola semilla: el autor no atribuye las mejoras en las sondas a los datos de chat, sino al decaimiento de la tasa de aprendizaje.
- Licencia MIT: permite uso comercial, pero al ser un modelo con fallos factuales y aritméticos, cualquier despliegue comercial requiere salvaguardas adicionales.
- Sin cuantizaciones publicadas: solo hay pesos fp32 en formato PyTorch, lo que limita opciones de despliegue en entornos con poca VRAM.
- Sin soporte en motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI): requiere los scripts propios del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gowravvishwakarma/qllm-pam2-sci1-386m-chat
- Modelo base: https://huggingface.co/gowravvishwakarma/qllm-pam2-sci1-386m
- Línea anterior (V11): https://huggingface.co/gowravvishwakarma/qllm-pam-v11-e3k3-chat
- Código: https://github.com/gowrav-vishwakarma/qllm2 (directorio `v13_sempty/`)
- Paper PAM: https://arxiv.org/abs/2604.05030
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Comparativa base vs SFT: BASE_VS_SFT.md (en el repositorio del modelo)
- Muestras de generación: SAMPLES.md (en el repositorio del modelo)
