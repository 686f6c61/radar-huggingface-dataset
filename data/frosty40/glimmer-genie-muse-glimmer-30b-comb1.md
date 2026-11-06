# Frosty40/glimmer-genie-Muse-Glimmer-30B-comb1

## Resumen

Glimmer Genie (glimmer-comb1) es un adaptador LoRA de tipo PEFT desarrollado por Frosty40 (Jordan Newman / angelX) sobre el modelo base meta-models/Muse-Glimmer-30B de Meta. El adaptador está diseñado para dos tareas concretas dentro del harness angelX: actuar como "Genie" en el juego de mazmorras Knights Wish, traduciendo deseos en lenguaje natural del jugador a mecánicas de juego que el validador de reglas del juego acepta, y realizar el trabajo de memoria del harness (hymem): compactación, digest, destilación y handoff de contexto.

El adaptador se publica junto con su conversión a GGUF para llama.cpp, lo que permite ejecutarlo localmente sobre cualquier cuantización del modelo base (las evaluaciones usaron Q4_K_M). El repositorio incluye el tokenizer y la plantilla de chat del modelo base sin modificaciones. La licencia es Apache-2.0, heredada del modelo base.

La relevancia del modelo es acotada y específica: no es un modelo de propósito general, sino un ajuste fino orientado a un dominio muy concreto (generación de mecánicas de juego para un lenguaje de reglas propietario y tareas de gestión de memoria de agente). Los resultados publicados por el autor muestran una mejora sustancial frente al modelo base en zero-shot en la tarea Genie (0/131 a 109/131) y una reducción del 75% en tokens de salida en tareas hymem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base Muse-Glimmer-30B |
| Parametros totales | 209.597.440 (solo el adaptador; el modelo base no se distribuye en este repo) |
| Parametros activos | no disponible (el modelo base no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (configuración de inferencia usada en las evaluaciones; el máximo del base no se especifica) |
| Tipos de cuantizacion | Adaptador en f16 (GGUF); el modelo base admite cuantizaciones GGUF, las evaluaciones usaron Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (glimmer-comb1-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=32, alpha=64, dropout 0, aplicado sobre todas las proyecciones de atención y MLP del modelo base (q/k/v/o/gate/up/down proj). El modelo base Muse-Glimmer-30B es un transformer de Meta del que no se detallan en la información disponible ni el número exacto de parámetros activos ni la composición de su dataset de preentrenamiento.

El entrenamiento se realizó sobre 5.062 filas de chat: concesiones de deseos (wish grants) de Delve/Knights Wish más 1.453 filas hymem extraídas de sesiones de angelX. Se entrenaron 2 épocas con learning rate 1e-4 constante, batch efectivo de 32 y secuencia máxima de 18.432 tokens, calculando la pérdida solo sobre los turnos del asistente. El entrenamiento se ejecutó en una H200 en Modal con PEFT 0.21.2. Los datos de entrenamiento no se distribuyen. No se menciona uso de RLHF o DPO.

## Capacidades

- Generación de mecánicas de juego: convierte un deseo en texto libre del jugador en una definición de mecánica válida para el comprobador de reglas de Knights Wish, de forma literal respecto al deseo original.
- Gestión de memoria de agente (hymem): compactación, digest, destilación y handoff de contexto, con salida breve, en viñetas y anclada a la fuente.
- Generación de texto conversacional en inglés.
- Formato de salida estructurado y conciso (viñetas) en las tareas de memoria.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso general, visión, audio ni modo thinking.
- Capacidad multilingüe: solo inglés según la model card.

## Casos de uso

- Generación de mecánicas en Knights Wish: el adaptador recibe el deseo en lenguaje natural del jugador y emite una definición en el lenguaje de reglas del juego que el validador acepta; es su función principal y la que tiene evaluación cuantitativa (109/131 deseos retenidos superados).
- Integración en el harness angelX como proveedor local: se sirve con llama-server y se registra mediante `ANGEL_LOCAL_URLS=glimmer-comb1=http://127.0.0.1:8080/v1`, seleccionable con `/model`.
- Compactación de contexto de sesión: reduce el histórico de una sesión de agente a un resumen en viñetas anclado a la fuente, con una reducción de tokens de salida del 75% frente al base (20.508 frente a 80.773 tokens en 40 tareas).
- Handoff entre agentes o sesiones: genera resúmenes de traspaso breves y estructurados que otro agente o una sesión posterior puede consumir sin arrastrar el contexto completo.
- Destilación de trazas de sesión: extrae los puntos esenciales de una sesión larga para alimentar memoria de largo plazo del agente.
- Prototipado de sistemas de deseos en otros juegos: como punto de partida para ajustar un adaptador equivalente sobre otro lenguaje de reglas, reutilizando la receta de entrenamiento publicada (LoRA r=32, 2 épocas, pérdida solo en turnos del asistente).

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecuciones locales únicas con llama.cpp, base Q4_K_M más el adaptador f16.

Tarea Genie, 131 deseos retenidos (family-split del conjunto de entrenamiento; un pase es válido para el comprobador y literal):

| Modelo | Pass | Checker-valid |
|---|---:|---:|
| glimmer-comb1 (este) | 109 / 131 | 119 / 131 |
| LoRA solo Genie (mejor celda anterior) | 101 / 131 | 115 / 131 |
| GLM-5.3-Flash | 99 / 131 | no disponible |
| DeepSeek-Flash | 84 / 131 | no disponible |
| DeepSeek-V4-Pro | 77 / 131 | no disponible |
| MiniMax-M3.1-Flash | 71 / 131 | no disponible |
| Muse-Glimmer-30B base, zero-shot | 0 / 131 | 0 / 131 |

Los mismos 126 deseos reformulados en jerga: 99 / 126 pass (DeepSeek-Flash 82).

Tarea hymem, 40 tareas estratificadas (10 de cada tipo: compactación, digest, destilación, handoff):

| Modelo | Tokens de salida | En viñetas | Sin anclar (filas / tokens) |
|---|---:|---:|---:|
| glimmer-comb1 (este) | 20.508 | 40 / 40 | 3 / 4 |
| LoRA solo hymem v1 | 25.645 | 40 / 40 | 3 / 4 |
| Muse-Glimmer-30B base | 80.773 | 34 / 40 | 2 / 7 |

## Requisitos de hardware

- El adaptador pesa 1,3 GB (repo completo) y se aplica en tiempo de inferencia sobre el modelo base; la VRAM necesaria la determina el base, no el adaptador.
- Con base de 30B en Q4_K_M, se requiere aproximadamente 18-20 GB de VRAM para los pesos, más overhead de contexto (32.768 tokens configurados en las evaluaciones).
- GPU recomendadas: H200 (usada en entrenamiento), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) es el mínimo realista para Q4_K_M con contexto moderado.
- Despliegue: llama.cpp (llama-server) con `--lora glimmer-comb1-f16.gguf -ngl 99 -c 32768 -fa on --jinja`; también es posible cargar el adaptador PEFT con transformers/vLLM sobre el base en safetensors, aunque la model card solo documenta el flujo llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Genie (pass) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glimmer-comb1 (este) | LoRA sobre 30B | 32.768 (config. eval) | 109 / 131 | Apache-2.0 | Hugging Face |
| GLM-5.3-Flash | modelo general | no disponible | 99 / 131 | no disponible | no disponible |
| DeepSeek-Flash | modelo general | no disponible | 84 / 131 | no disponible | no disponible |
| Muse-Glimmer-30B base | transformer 30B | no disponible | 0 / 131 | Apache-2.0 | Hugging Face |

La comparación con GLM-5.3-Flash no está estadísticamente establecida según el propio autor (p emparejada = 0,12).

## Limitaciones y advertencias

- Evaluaciones de una sola ejecución, sin semillas repetidas; las diferencias frente a GLM-5.3-Flash no son significativas según el autor.
- El adaptador escribe mecánicas para el lenguaje de reglas propietario de angelX; no es un modelo general de diseño de juegos y su salida se valida en el juego antes de usarse.
- La métrica de anclaje (grounding) de hymem usa una heurística de coincidencia exacta de tokens, no un juez semántico.
- Solo soporta inglés.
- Riesgo de alucinación en mecánicas fuera del espacio de reglas visto en entrenamiento; el comprobador del juego actúa como filtro, pero no se documenta su tasa de falsos positivos.
- Los datos de entrenamiento no se distribuyen, lo que limita la reproducibilidad exacta del ajuste.
- Licencia Apache-2.0 heredada del base; se recomienda revisar `LICENSE` y `NOTICE` del repositorio antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta; proyecto reciente (noviembre de 2026) sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Frosty40/glimmer-genie-Muse-Glimmer-30B-comb1
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio angelX: https://github.com/newjordan/angelX
