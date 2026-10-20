# L1nkee/Qwen3-4B-Base-Think-GRPO-KL0.001-LR1e-5-bf16-540steps

## Resumen

L1nkee/Qwen3-4B-Base-Think-GRPO-KL0.001-LR1e-5-bf16-540steps es un ajuste fino por refuerzo (RL) del modelo base Qwen/Qwen3-4B-Base, publicado por el usuario L1nkee en HuggingFace. Se trata de un experimento de investigación más que de un modelo de producción: aplica GRPO con objetivo PPO-clip sobre el dataset matemático DAPO-Math-17k para inducir razonamiento con «thinking» explícito en un modelo que originalmente es un base preentrenado, sin etapa de instrucción previa.

El modelo tiene 4.022.468.096 parámetros en precisión bf16 y se distribuye en formato safetensors, con licencia Apache 2.0. El repositorio ocupa 434,4 GB porque incluye 55 ramas de checkpoints intermedios (de `step-10` a `step-540`), una por cada guardado del entrenamiento, además de la rama `main` con el paso final. Esa granularidad lo convierte en un material interesante para estudiar dinámicas de RL: el propio autor reporta que el mejor resultado en AIME 2024 se alcanza en el paso 140 (25,83%) y que el rendimiento decae hasta el 14,58% en el paso 540, un caso claro de sobreentrenamiento o colapso de la señal de recompensa.

Su relevancia actual es metodológica: documenta de forma reproducible hiperparámetros completos (KL 0,001, LR 1e-5 constante, batch 128×8, 540 pasos) y permite analizar curvas de aprendizaje paso a paso en un modelo de 4B entrenable en hardware modesto. No es un modelo recomendado para uso general en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Base); detalles internos no especificados en la model card |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos (extensible con YaRN, no verificado en esta ficha) |
| Tipos de cuantización | No se publican cuantizaciones oficiales; pesos únicamente en bf16. Convertible a GGUF/AWQ/GPTQ por terceros |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde checkpoints FSDP) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B-Base: un transformer decoder-only denso de 4B parámetros. La modificación introducida por este repositorio no es estructural sino de ajuste: se entrena con GRPO (Group Relative Policy Optimization) usando el objetivo PPO con clip ε = 0,2/0,2 y dual-clip c = 3, ventaja calculada con la baseline de grupo y normalizada por la desviación típica del grupo, agregación de pérdida token-mean y recompensa binaria (1/0) de corrección de respuesta verificada con Math-Verify. La penalización KL es de 0,001 contra el modelo inicial (KL de baja varianza) y no hay bonus de entropía.

El entrenamiento usa verl con pesos maestros en bf16 sobre FSDP y rollout en bf16 con vLLM. La configuración concreta: learning rate 1e-5 constante sin warmup, weight decay 0,1, 128 prompts × 8 rollouts a temperatura 1,0, mini-batch de 64 y 1 época de actualización por iteración. Los límites son 2.048 tokens de prompt y 8.192 de respuesta. Se ejecutaron 540 pasos, equivalentes a 4 épocas sobre DAPO-Math-17k (135 pasos por época), con semilla 42 para actor y data-loader. El dataset contiene problemas matemáticos con respuestas verificables, lo que restringe el dominio de entrenamiento exclusivamente a razonamiento matemático.

No se documentan etapas de RLHF, DPO ni ajuste de instrucciones; el punto de partida es un modelo base, de modo que el formato de conversación y el cumplimiento de instrucciones generales no están garantizados más allá de lo aprendido implícitamente por la recompensa matemática.

## Capacidades

- Generación de texto autoregresiva y razonamiento matemático con cadena de pensamiento («thinking») habilitada, inducida por el entrenamiento con recompensa de corrección.
- Resolución de problemas matemáticos de competición (el único dominio entrenado de forma explícita).
- Producción de trazas de razonamiento largas: el límite de respuesta en entrenamiento fue de 8.192 tokens, por lo que el modelo aprende a extenderse en la deliberación.
- Muestreo múltiple: útil con temperature 1,0 y top-p 0,9 para Avg@k, tal como reporta el autor.
- Soporte de tool calling / function calling: no disponible (no se ha entrenado para ello; el modelo base tampoco lo garantiza).
- Soporte de agentes y multi-step reasoning con herramientas: no disponible / no documentado.
- Capacidades multilingües: no disponibles declaradas; el modelo base Qwen3 tiene cobertura multilingüe, pero este ajuste solo refuerza matemáticas y no se ha evaluado en otros idiomas.
- Capacidades especiales: no hay visión ni audio. La única capacidad destacable es la disponibilidad de 55 checkpoints intermedios para análisis de curvas de entrenamiento.

## Casos de uso

- Investigación en RL para LLM: reproducir o contrastar la receta GRPO del autor (KL 0,001, LR 1e-5, 540 pasos) sobre un 4B y comparar con variantes de KL o de clip range. El repositorio expone todos los hiperparámetros necesarios.
- Estudio de sobreentrenamiento y colapso de recompensa: la diferencia entre el paso 140 (25,83% en AIME 2024) y el paso 540 (14,58%) permite analizar empíricamente la degradación del razonamiento matemático bajo RL prolongado, cargando ramas concretas con `revision="step-N"`.
- Ablación de checkpoints en evaluación matemática: usar las 55 ramas como una población de modelos con distinto grado de ajuste para estudiar varianza de métricas, calibración de confianza o longitud de respuesta frente a precisión.
- Generación de datos sintéticos de razonamiento matemático: muestrear soluciones con traza de pensamiento sobre problemas tipo competición y filtrar por verificador (Math-Verify) para construir datasets de destilación o de preferencias.
- Baseline ligero en pipelines de evaluación: un 4B en bf16 se ejecuta en una sola GPU de 24 GB, lo que permite incluirlo como referencia de «modelo pequeño entrenado con RL» frente a instruct models de tamaño similar.
- Docencia y formación técnica: ilustrar cómo se construye un modelo de razonamiento paso a paso, mostrando la evolución de las respuestas entre `step-10` y `step-540` sobre el mismo problema.
- Experimentación con decodificación y presupuestos de cómputo: comparar precisión frente a número de tokens generados en las distintas ramas para estudiar la relación entre longitud de pensamiento y acierto.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| AIME 2024 (30 problemas) | Avg@16, temperature 1,0, top-p 0,9 — paso 140 (mejor) | 25,83% |
| AIME 2024 (30 problemas) | Avg@16, temperature 1,0, top-p 0,9 — paso 540 (final) | 14,58% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos. Los dos únicos datos numéricos son los de AIME 2024 reportados por el autor. La notable caída entre el mejor checkpoint y el final sugiere que el paso 540 no debe tomarse como referencia de capacidad del método.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8,1 GB solo de pesos (4.022 M parámetros × 2 bytes), más KV cache y activaciones; en la práctica unos 10-12 GB con contexto moderado.
- VRAM en cuantización de 8 bits: en torno a 4,5-5,5 GB; en 4 bits (GGUF Q4_K_M, AWQ/GPTQ): aproximadamente 2,5-3,5 GB, aunque estas cuantizaciones no las publica el autor y habría que generarlas.
- GPU consumer: cabe en RTX 4090 (24 GB) en bf16 con margen amplio, y en RTX 3090/4080 (16 GB) en bf16 con contexto contenido. En GPUs de 8 GB es viable solo cuantizado a 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 o L40S permiten bf16 con lotes grandes y contexto largo; una sola A100 40 GB es suficiente para servir el modelo con vLLM sin tensor parallelism.
- Despliegue: transformers (compatible con text-generation-inference y endpoints_compatible según los tags), vLLM para serving de alto throughput, llama.cpp/Ollama si se convierte a GGUF, y TGI. Para entrenamiento o réplica del pipeline se requiere verl + FSDP.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia estructural, un dense de 4B en bf16 sobre una RTX 4090 admite decodificación interactiva, pero el modo «thinking» con respuestas de hasta 8.192 tokens incrementa mucho el tiempo por consulta.
- Almacenamiento: el repositorio completo ocupa 434,4 GB por las 55 ramas; conviene descargar solo una revisión concreta con `revision="step-N"` para no replicar todos los checkpoints.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B-Base + GRPO) | 4,02B | No especificado en la card | RL con GRPO sobre matemáticas, base sin instrucción | Apache 2.0 | HuggingFace, 55 ramas de checkpoints |
| Qwen/Qwen3-4B-Base (modelo de partida) | 4,02B | 32.768 tokens nativos según el modelo base | Preentrenamiento general, sin RL específico | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B (instruct) | 4,02B | 32.768 tokens nativos según el modelo base | Post-entrenamiento con instrucciones y modo thinking | Apache 2.0 | HuggingFace |
| Qwen2.5-Math-7B | 7B | No disponible | Especializado en matemáticas, SFT | Apache 2.0 | HuggingFace |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la información proporcionada; la tabla compara únicamente tamaño, licencia y naturaleza del entrenamiento. Frente al Qwen3-4B instruct, este modelo no ofrece garantías de seguir instrucciones ni formato conversacional; frente a Qwen2.5-Math-7B, es más pequeño y con un pipeline de RL distinto, pero no hay datos que permitan afirmar cuál es superior en matemáticas.

## Limitaciones y advertencias

- Es un ajuste sobre un modelo base, no un modelo instruido: puede no respetar formatos de conversación, system prompts ni instrucciones de estilo.
- Entrenado exclusivamente con recompensa de corrección matemática sobre DAPO-Math-17k; el dominio fuera de matemáticas está fuera de distribución y el riesgo de alucinación es alto en tareas factuales, código o conocimiento general.
- El propio autor reporta degradación en AIME 2024: 25,83% en el paso 140 frente a 14,58% en el paso 540. El checkpoint etiquetado como `main` (paso 540) no es el mejor; usarlo por defecto puede dar resultados engañosos.
- Sin datos publicados sobre sesgos, toxicidad o evaluación de seguridad.
- Idiomas soportados no declarados; no hay evaluación multilingüe de este ajuste.
- Longitud de contexto efectiva no verificada en este modelo; aunque el base soporte ventanas largas, el entrenamiento se limita a 2.048 tokens de prompt y 8.192 de respuesta.
- No hay cuantizaciones oficiales ni pesos GGUF publicados; cualquier cuantización es de terceros y puede alterar el comportamiento del razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B-Base conviene revisar los términos del modelo original y la atribución correspondiente.
- El tamaño del repositorio (434,4 GB) y las 55 ramas complican el despliegue y el almacenamiento en producción; hay que seleccionar una revisión concreta.
- Trazas de razonamiento largas (hasta 8.192 tokens en entrenamiento) implican coste de inferencia y latencia elevados frente a modelos que responden de forma directa.
- Los resultados de AIME con 30 problemas y Avg@16 tienen un intervalo de confianza amplio; las diferencias entre checkpoints próximos pueden no ser significativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/L1nkee/Qwen3-4B-Base-Think-GRPO-KL0.001-LR1e-5-bf16-540steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes sobre este modelo (devuelven páginas de un videojuego sin relación); no se han podido verificar papers, blogs ni demos adicionales.
