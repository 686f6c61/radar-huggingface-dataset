# runelab-ai/Domr-Decide-Loop-4B-v1

## Resumen

Domr Decide Loop 4B v1 (`Domr-Decide-Loop-4B-v1`) es un modelo de decisión de pesos abiertos desarrollado por RuneLab.ai, afinado a partir de `perplexity-ai/pplx-decider-flash-v1.3` (familia Qwen3.5-4B). No es un modelo generativo al uso: dada una representación estructurada de estado y una batería de preguntas discretas (`Choice` de hasta 255 opciones, binarias `Noul` u ordinales `Score`), devuelve probabilidades calibradas por opción en un único pase forward, sin generar tokens. Está pensado para enrutamiento de agentes, cortafuegos de política (RuneGate), selección de herramientas y reranking de recuperación.

El modelo emplea una arquitectura de transformer con bucles ("looped transformer") sobre una base de 4B parámetros, con 4.539.265.536 parámetros totales según safetensors. Su propuesta de valor es la latencia: 52,5 ms de mediana y 9,23 GB de VRAM pico en una sola NVIDIA RTX PRO 6000, lo que lo hace viable como componente síncrono en cada petición de un pipeline de agentes.

Es relevante ahora porque cubre un nicho poco atendido: modelos pequeños, con licencia Apache 2.0 y desplegables on-premise, que sustituyen a llamadas a LLM generativos en pasos de decisión de alta frecuencia (routing, guardrails, filtrado de recuperación) donde generar texto es caro e innecesario. Según el autor, es el modelo de decisión `<5B` con mayor puntuación en su evaluación global (63,85 en Decision Index 0.3 Public, 37/37 benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer sobre base Qwen3.5-4B (según tags y model card) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "looped transformer": un transformer con iteraciones de bucle internas que refinan la representación antes de emitir la decisión, sin añadir parámetros extra de bucle. Se construye sobre `perplexity-ai/pplx-decider-flash-v1.3`, que a su vez se apoya en Qwen3.5-4B. La salida no es texto generado, sino un vector de probabilidades calibradas sobre las opciones de cada pregunta, lo que permite un único pase forward no generativo.

El autor reporta que el ajuste se realizó sobre el modelo base con el objetivo de mejorar calibración, simetría de orden de opciones y precisión en dominios no vistos, y menciona comparaciones frente a una variante LoRA previa ("Arm 4c") y frente al modelo base sin ajustar. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se especifican innovaciones de decodificación especulativa ni atención lineal, más allá del esquema de bucle y del uso opcional de kernels nativos `fla` y `causal-conv1d`, que según el autor aceleran la inferencia 1,66×.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo `Choice` (hasta 255 opciones), binarias `Noul` y ordinales `Score`, devolviendo probabilidades calibradas por opción.
- Inferencia no generativa: no produce texto, sino distribuciones de probabilidad en un único pase forward.
- Enrutamiento de agentes y selección de herramientas (tool calling / tool selection) en pipelines multi-paso.
- Cortafuegos de política y guardrails (RuneGate) para filtrar o autorizar acciones.
- Reranking de recuperación y filtrado de relevancia en pipelines RAG.
- Calibración de probabilidades (mejora de ECE reportada) y simetría ante el orden de las opciones.
- Capacidades multilingües limitadas a inglés y turco según los metadatos del modelo.
- Integración con `transformers` y endpoints compatibles.

## Casos de uso

- Enrutamiento de agentes en producción: el modelo recibe el estado estructurado de la conversación y las herramientas disponibles, y devuelve en ~52 ms la probabilidad de cada herramienta o siguiente acción, evitando una llamada generativa por turno.
- Cortafuegos de política (RuneGate): evaluar en un solo pase si una acción propuesta cumple las políticas de seguridad o compliance antes de ejecutarla, con latencia compatible con guardrails síncronos.
- Selección de herramientas en asistentes con muchas funciones: al soportar hasta 255 opciones `Choice`, puede puntuar catálogos amplios de herramientas sin degradar la latencia.
- Reranking en RAG: puntuar la relevancia de documentos recuperados frente a la consulta como paso previo a la generación, aprovechando la calibración de probabilidades y el bajo coste por petición.
- Clasificación de intenciones y triaje: decidir la categoría o ruta de una petición entrante (soporte, ventas, escalado) con umbrales calibrados y sin generar texto.
- Evaluación de preferencias y ordinales: usar preguntas `Score` para ordenar candidatos (por ejemplo, variantes de respuesta o configuraciones) en pipelines de evaluación automática.
- Despliegue on-premise de bajo coste: al caber en 9,23 GB de VRAM y tener licencia Apache 2.0, puede alojarse en una única GPU para decisiones de alta frecuencia sin dependencia de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Decision Index 0.3 Public (37/37 benchmarks) | decision_index | 63,85 |
| DecideBench v2 (test) | Item Accuracy | 84,67 |
| DecideBench v2 (test) | Contrastive Pair Accuracy | 71,11 |

Datos adicionales reportados en la model card:

| Comparativa | Resultado |
|---|---|
| Decision Index 0.3 vs. `pplx-decider-flash-v1.3` | 63,85 vs. 63,33 (+0,52; IC 95% [+0,09, +0,99]; 19W / 6T / 12L) |
| Decision Index 0.3 vs. LoRA "Arm 4c" previo | +2,84 |
| DecideBench v2 item accuracy vs. base | +2,00 pts (IC 95% [+0,44, +3,56]) |
| DecideBench v2 pair accuracy vs. base | +3,56 pts (IC 95% [+0,89, +6,67]) |
| Brier score vs. base | 0,2592 -> 0,2430 |
| RuneLab Hard Pilot v2 (36 dominios, 300 preguntas) | 74,33% -> 78,00% (+3,67 pts; `Score` +6,82 pts) |
| ECE en Hard Pilot v2 | 9,89% -> 7,38% (-2,51 pts) |
| Choice Order-Flip Rate | 12,04% (13/108) -> 5,56% (6/108), mejora 2,17× |
| Frente a `GLiDE-9B` (2,25× mayor) | Gana en 8 de 37 benchmarks (CRUXEval +7,79; CLadder +9,28; cfcolor, GSM8K, iSarcasmEval, MuSR, BRIGHT, When2Call) |
| Latencia (1× RTX PRO 6000) | 52,5 ms mediana / 79,3 ms p90 / 365,5 ms p95 / 970,4 ms p99 (750/750 OK) |
| Latencia con kernels `fla` + `causal-conv1d` | 31,5 ms mediana en DecideBench v2 (1,66× más rápido) |
| VRAM pico | 9,23 GB |

## Requisitos de hardware

- VRAM estimada: 9,23 GB pico reportados por el autor en una NVIDIA RTX PRO 6000, en el formato de pesos publicado.
- GPU recomendadas: NVIDIA RTX PRO 6000 (referencia de las mediciones); previsiblemente cualquier GPU con al menos ~10-12 GB de VRAM para el formato safetensors, aunque no se documentan mediciones en otras GPU.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información disponible; 9,23 GB pico queda por encima de tarjetas de 8 GB y al límite de algunas de 12 GB, pero no hay datos verificados.
- Despliegue: librería `transformers`; el modelo se declara compatible con endpoints. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 52,5 ms mediana, 79,3 ms p90, 365,5 ms p95 y 970,4 ms p99 en 1× RTX PRO 6000 (750/750 peticiones correctas); 31,5 ms mediana en DecideBench v2 con kernels nativos `fla` + `causal-conv1d`. Throughput no disponible.
- Empaquetado autónomo verificado bit a bit (64/64 coincidencia exacta, `max_abs_prob_diff = 0.0`) según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.3 | Licencia | Notas |
|---|---|---|---|---|---|
| Domr Decide Loop 4B v1 | 4,54B | no disponible | 63,85 | Apache 2.0 | Modelo de decisión no generativo; 52,5 ms mediana; 9,23 GB VRAM |
| pplx-decider-flash-v1.3 (base) | ~4B (Qwen3.5-4B) | no disponible | 63,33 | no disponible en la información | Modelo base del que deriva; el ajuste mejora en las 5 áreas del índice |
| GLiDE-9B | ~9B (2,25× mayor) | no disponible | no disponible | no disponible en la información | Domr gana en 8 de 37 benchmarks pese a ser 2,25× menor |
| LoRA "Arm 4c" (RuneLab) | ~4B | no disponible | 61,01 | no disponible en la información | Variante LoRA previa del mismo autor; superada por +2,84 |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto; solo emite probabilidades sobre opciones predefinidas. No sirve para generación, resumen ni diálogo libre.
- Idiomas: solo inglés y turco según los metadatos; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no disponible: se desconoce cuánto estado estructurado admite por petición.
- Benchmarks no verificados: los resultados de Decision Index 0.3 y DecideBench v2 son declaraciones del autor (`verified: false`); no hay validación independiente en la información disponible.
- Riesgo de calibración fuera de distribución: aunque el autor reporta mejora de ECE en dominios no vistos (+3,67 pts de precisión en Hard Pilot v2), la calibración puede degradarse en distribuciones muy distintas a las de entrenamiento.
- Sensibilidad al orden de opciones: aunque la Order-Flip Rate baja a 5,56%, sigue existiendo (6/108 casos), lo que puede afectar a decisiones con opciones ambiguas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `perplexity-ai/pplx-decider-flash-v1.3`, cuya licencia no se detalla en la información disponible.
- Requisitos de hardware: 9,23 GB de VRAM pico limitan el despliegue en GPU de consumo de gama baja; no hay mediciones fuera de la RTX PRO 6000.
- Ecosistema: sin soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que puede complicar el despliegue en infraestructuras ya estandarizadas en esas herramientas.
- Madurez: modelo recién publicado (noviembre de 2026) con 0 descargas y 0 likes en Hugging Face; sin comunidad ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/runelab-ai/Domr-Decide-Loop-4B-v1
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- RuneLab AI Models: https://runelab.ai/en/models/
- RuneGate (decision gateway): https://runelab.ai/en/runegate
- Organización en Hugging Face: https://huggingface.co/runelab-ai
- Dataset Decision Index: https://huggingface.co/datasets/apolinario/decision-index
- Dataset DecideBench: https://huggingface.co/datasets/choyiny/decidebench
