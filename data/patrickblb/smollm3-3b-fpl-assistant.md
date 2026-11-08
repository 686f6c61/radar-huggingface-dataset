# PatrickBLB/smollm3-3b-fpl-assistant

## Resumen

SmolLM3-3B FPL assistant es un ajuste fino por LoRA del modelo base HuggingFaceTB/SmolLM3-3B, desarrollado por PatrickBLB, orientado a tareas de Fantasy Premier League (FPL). El modelo resultante es un unico checkpoint fusionado en bf16 que resuelve dos tareas distintas seleccionables mediante el system prompt: busqueda de jugadores en lenguaje natural (Task 1) y asesoramiento de transferencias sobre una plantilla dada en JSON (Task 2). No requiere cargar adaptadores ni cambiar de modelo, lo que simplifica el despliegue.

La Task 1 se entreno con QLoRA sobre una version 4-bit del modelo base usando 5.032 preguntas verificadas por un profesor, logrando un 95,7% de exact match en el conjunto de test del adaptador original. La Task 2 se construyo mediante destilacion strong-to-weak desde `nvidia/nemotron-3.5-super-vl-120b-a12b`, que genero trazas agenticas completas (razonamiento, busquedas y decision) sobre plantillas reales de 5.000 mánagers de la temporada 2026-27. El modelo final obtiene una ganancia media de +6,88 puntos por equipo en 3 jornadas frente a no hacer cambios, sobre 100 equipos reales no vistos en entrenamiento.

El interes actual del modelo radica en su tamano reducido (3B parametros, ~5,7 GB en bf16), su licencia Apache 2.0 y su capacidad de ejecutar un bucle agentico con tool calling (`run_query`) sobre datos estructurados, lo que lo convierte en un caso practico de destilacion de comportamiento agentico desde un profesor de gran escala a un estudiante que cabe en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda de SmolLM3-3B); ajuste fino LoRA fusionado en los pesos |
| Parametros totales | 3B (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este ajuste (el modelo base SmolLM3-3B soporta contexto largo, pero no se especifica aqui) |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; entrenamiento con QLoRA 4-bit (MLX) y PEFT LoRA en fp16 con pesos LoRA en fp32 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, ~5,7 GB); compatible con transformers y mlx-lm |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3B parametros (SmolLM3-3B) al que se han fusionado dos rondas de LoRA. La primera ronda (Task 1) se entreno con QLoRA mediante mlx-lm sobre un SmolLM3-3B cuantizado a 4-bit, usando 5.032 preguntas escritas por un profesor y verificadas por back-checking; el adaptador se fusiono en el modelo 4-bit y se des-cuantizo a bf16. La segunda ronda (Task 2) partio de ese modelo bf16 y aplico PEFT LoRA en fp16 (r=16, alpha=32, dropout=0.05, sobre `q,k,v,o,gate,up,down_proj` en las 36 capas), con AdamW, lr 1e-4, schedule coseno con 5% warmup, batch 1 con acumulacion de gradiente 8, 1,63 epocas (501 de 614 updates), gradient clipping 1.0 y gradient checkpointing, ejecutado en 2x T4 de Kaggle con el modelo dividido entre ambas GPU y semilla 42.

Los datos de Task 2 provienen de 5.000 mánagers muestreados de la liga general de FPL 2026-27; para cada mánager y jornada de decision se reconstruye la situacion (plantilla, banco y transferencias libres) con informacion disponible hasta el deadline (form, minutos, titularidades, xGI, clean sheets, xGC por 90, calendario y FDR). El split es por jornada: entrenamiento en GW2-6, validacion con 5% de mánagers separados en las mismas jornadas, y test en GW7-8. Las trazas del profesor se validaron programaticamente para legalidad (posiciones, presupuesto, limite de clubes), nombres inventados y cifras no soportadas; las fallidas se repararon o descartaron. La etiqueta final aplica un veto por hindsight: una transferencia solo se conserva si sus puntos reales en las 3 jornadas siguientes superan el hold en al menos 2 puntos por transferencia; en caso contrario se usa el hold del profesor como etiqueta. La destilacion es off-policy y a nivel de secuencia (sin logits, ya que el profesor se usa via API). Se mezclaron 0,3 ejemplos de Task 1 por traza de Task 2 para evitar olvido catastrofico, y la perdida de Task 1 se mantuvo plana (0.017) durante todo el entrenamiento de Task 2.

## Capacidades

- Generacion de texto en ingles orientada a dominio FPL.
- Text-to-query: convierte una pregunta en lenguaje natural sobre jugadores de FPL en una unica llamada a la herramienta `run_query`, o en una negativa breve cuando la consulta no es respondible.
- Tool calling / function calling: esquemas `tools/run_query_task1.json` y `tools/run_query_task2.json` para las dos tareas.
- Razonamiento agentico multi-turno (Task 2): hasta 8 busquedas con `run_query`, razonamiento en `<think>` y decision final en JSON (hold o entre 1 y `free_transfers` transferencias).
- Modos de pensamiento conmutables por prompt: `/no_think` (Task 1, un solo turno) y `/think` (Task 2, bucle agentico).
- Seleccion de tarea mediante system prompt, sin cambio de modelo ni carga de adaptadores.
- Salida estructurada: decision JSON con validacion de legalidad (posiciones, presupuesto, limite de clubes).
- Capacidades multilingues: solo ingles.
- Vision, audio y matematicas generales: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de consultas FPL: el modelo traduce preguntas como "que delanteros tienen mejor xGI en las ultimas 5 jornadas" en una llamada `run_query` valida, lo que permite construir un chatbot que delega la ejecucion de la consulta a un backend de datos sin exponer logica de negocio al modelo.
- Recomendador de transferencias por jornada: dado un JSON con plantilla, banco y transferencias libres, el modelo ejecuta un bucle agentico de hasta 8 busquedas y emite una decision legal en JSON, adecuado para integrarse en un cron de juego que procese miles de equipos por deadline.
- Simulacion y evaluacion de politicas: al producir decisiones estructuradas y trazables (razonamiento, busquedas y decision), sirve para comparar politicas de gestion de plantilla frente a un baseline de hold en estudios retrospectivos.
- Backtesting de estrategias: la reproducibilidad del formato de salida permite ejecutar el modelo sobre jornadas historicas y medir la ganancia de puntos por transferencia, util para validar heuristicas antes de produccion.
- Despliegue local en hardware de consumo: con ~5,7 GB en bf16 y pesos compatibles con mlx-lm, puede ejecutarse en un Mac con Apple Silicon para prototipado y demos sin depender de API externa.
- Educacion e investigacion en destilacion agentica: el repositorio documenta el pipeline completo (datos, validacion de trazas, veto por hindsight, mezcla de tareas), lo que lo convierte en un caso de estudio reproducible para tecnicas strong-to-weak distillation en dominios acotados.
- Filtro de seguridad de consultas: la capacidad de negarse brevemente ante preguntas no respondibles permite usarlo como capa de validacion previa antes de invocar el backend de datos.

## Benchmarks y rendimiento

| Tarea / metrica | Resultado | Contexto |
|---|---|---|
| Task 1 exact match (adaptador aislado) | 95,7% | Conjunto de test de Task 1; pendiente de re-medicion sobre el modelo fusionado |
| Task 2 ganancia media (3 GW) vs hold | +6,88 puntos por equipo | 100 equipos reales de validacion (GW2-6), no entrenados |
| Task 2 ganancia del profesor | +5,59 puntos por equipo | Mismo conjunto de validacion |
| Task 2 ganancia de mánagers reales | +3,09 puntos por equipo | Mismo conjunto de validacion |
| Perdida de validacion Task 2 | 2,21 al inicio; 0,444 tras epoca 1; 0,418 en update 501 | Validacion |
| Perdida de validacion Task 1 | 0,017 estable durante el entrenamiento de Task 2 | Validacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,7 GB en bf16 para los pesos; con overhead de contexto y cache KV, se recomienda al menos 8-10 GB para secuencias cortas y mas para trazas agenticas largas (las trazas de entrenamiento alcanzan 6.573 tokens).
- GPU recomendadas: T4 (usada en entrenamiento, 16 GB), A100, H100 para despliegue de mayor throughput; el modelo base se entreno en 2x T4 con reparto entre GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB); tambien en Apple Silicon via mlx-lm.
- Opciones de despliegue: `transformers`, `mlx-lm`; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B FPL assistant (este modelo) | 3B | no disponible | Task 1 95,7% exact match; Task 2 +6,88 pts/3 GW | apache-2.0 | Hugging Face, ~5,7 GB bf16 |
| HuggingFaceTB/SmolLM3-3B (base) | 3B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| PatrickBLB/smollm3-3b-fpl-query (adaptador Task 1) | 3B + LoRA | no disponible | 95,7% exact match en Task 1 | no disponible en la informacion | Hugging Face, solo MLX |
| nvidia/nemotron-3.5-super-vl-120b-a12b (profesor) | 120B (A12B activos) | no disponible | +5,59 pts/3 GW en Task 2 | no disponible en la informacion | Usado via API |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo esta entrenado para FPL y responde en ingles; fuera de ese dominio su comportamiento no esta caracterizado.
- Riesgo de alucinacion en nombres de jugadores y cifras: aunque las trazas del profesor se validaron programaticamente, el estudiante puede generar nombres o numeros no soportados por los datos; se recomienda validar la salida contra el backend antes de ejecutar decisiones.
- Datos y etiquetas con sesgo: las plantillas provienen de mánagers muestreados de la liga general 2026-27 y las etiquetas aplican un veto por hindsight de 2 puntos por transferencia, lo que puede favorecer politicas conservadoras y penalizar movimientos de alto riesgo con retorno incierto.
- Destilacion off-policy y a nivel de secuencia, sin logits: el estudiante reproduce el texto del profesor y no su distribucion, lo que limita la calibracion y puede amplificar errores sistematicos del profesor.
- Task 1 aun pendiente de re-medicion sobre el modelo fusionado; el 95,7% corresponde al adaptador aislado, no al checkpoint final.
- Contexto maximo no especificado en la informacion proporcionada; las trazas de entrenamiento llegan a 6.573 tokens, por lo que secuencias mas largas no estan validadas.
- Sin datos publicados de benchmarks estandar ni de latencia/throughput; no se recomienda asumir rendimiento fuera de las metricas de dominio reportadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base SmolLM3-3B y de los datos de FPL subyacentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PatrickBLB/smollm3-3b-fpl-assistant
- Adaptador Task 1 original: https://huggingface.co/PatrickBLB/smollm3-3b-fpl-query
- Arbol de archivos del adaptador Task 1: https://huggingface.co/PatrickBLB/smollm3-3b-fpl-query/tree/main
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Prompts de tarea: `prompts/task1_system.txt` y `prompts/task2_system.txt` (en el repositorio del modelo)
- Esquemas de herramientas: `tools/run_query_task1.json` y `tools/run_query_task2.json` (en el repositorio del modelo)
- Profesor de destilacion: `nvidia/nemotron-3.5-super-vl-120b-a12b` (referenciado en la model card; no se proporciono URL directa)
