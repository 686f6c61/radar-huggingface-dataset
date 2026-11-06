# crazyleg11/qwen3.8-27b-dat-grpo-full250

## Resumen

Qwen3.8-27B DAT GRPO Full250 es un checkpoint experimental de pesos completos publicado por el usuario independiente crazyleg11 sobre el modelo base Qwen/Qwen3.8-27B. Se trata de un ajuste fino con GRPO (Group Relative Policy Optimization) durante 250 actualizaciones del optimizador, orientado especificamente a mejorar la creatividad divergente medida con la Divergent Association Task (DAT), una prueba psicometrica que evalua la capacidad de generar asociaciones semanticas remotas entre palabras.

El modelo conserva la arquitectura multimodal del original (`Qwen3_5ForConditionalGeneration`), con 27.356.728.560 parametros totales distribuidos en 55 shards de safetensors (54,7 GB de repositorio). El entrenamiento solo aplica gradientes a la torre de texto; los pesos de vision se incluyen intactos pero no fueron entrenados. El pipeline declarado es image-text-to-text, aunque todas las evaluaciones publicadas por el autor corresponden exclusivamente a texto.

Su relevancia es fundamentalmente de investigacion: es un ejemplo documentado de como el RL con una recompensa estrecha (puntuacion DAT) puede incrementar una metrica concreta a costa de degradar el cumplimiento de instrucciones y la coherencia. El autor publica paneles comparativos con el baseline reconstruido, incluidos intervalos bootstrap, lo que lo convierte en un caso de estudio util sobre sobreoptimizacion de recompensas y transferencia de mejoras creativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, torre de texto + vision) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo); GGUF Q4_K_M y Q8_0 en release separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (55 shards); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (revision `8aa5f05d26b7205477066e1449e0af13f762a299`), dequantizado de NF4 a BF16, cuyo modelo upstream es `Qwen/Qwen3.8-27B` (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El ajuste actualiza unicamente el modelo de texto mediante Adafactor por chunks con estadisticas en FP32, redondeo estocastico BF16, learning rate 1e-6, clipping global de gradiente 0.5 y una referencia KL NF4 congelada. Cada actualizacion usa seis completions por prompt, con beta GRPO de 0.04, epsilon de 0.1, escalado de recompensa por grupo y una iteracion.

El dataset de entrenamiento consiste en siete formulaciones de prompt que piden diez sustantivos o diez verbos, con recordatorios opcionales de usar solo la clase solicitada; los adjetivos se reservan como conjunto held-out. La recompensa es la puntuacion DAT oficial dividida por 100, menos 0.2 por cada palabra rechazada por un verificador congelado de clase basado en WordNet; las respuestas malformadas o no puntuables reciben -2. La generacion de entrenamiento usa temperatura 1, top-p 1, top-k sin restriccion, 192 tokens de completion y thinking desactivado. La innovacion tecnica destacable no es arquitectonica sino metodologica: el uso de una metrica psicometrica externa (DAT) como funcion de recompensa verificable, con un verificador lexico congelado para penalizar derivas de clase gramatical.

## Capacidades

- Generacion de texto conversacional y creativo en ingles, con enfasis en produccion de listas de palabras semanticamente diversas.
- Razonamiento y conocimiento general, preservados en gran medida segun los paneles del autor (MMLU-Pro, GSM8K).
- Generacion de codigo (HumanEval+), con rendimiento practicamente identico al baseline.
- Capacidad multimodal heredada del modelo base (torre de vision incluida), aunque no fue entrenada ni evaluada en este checkpoint.
- Modo thinking configurable (desactivado, medio), tal como se documenta en las evaluaciones.
- No se documenta soporte de tool calling ni de flujos de agentes multi-paso en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre recompensas y sobreoptimizacion: el modelo sirve como caso controlado para estudiar como una recompensa estrecha (DAT) eleva la metrica objetivo (de 71,81 a 89,59 en sustantivos) mientras reduce el cumplimiento de restricciones (de 99,06% a 75,94% en palabras compatibles con adjetivos).
- Generacion de ideas y brainstorming divergente: util para producir conjuntos de palabras o conceptos semanticamente remotos que alimenten tecnicas de creatividad controlada en talleres o pipelines de ideacion.
- Aumentacion de datos lexicos: puede generar listas de sustantivos y verbos diversos para construir datasets de asociacion semantica o pruebas de vocabulario.
- Evaluacion de jueces automaticos: los paneles de escritura juzgados por un modelo (Sol a esfuerzo medio, en orden A/B y B/A) permiten replicar estudios sobre sesgo de posicion y fiabilidad de evaluadores LLM.
- Demostracion educativa de GRPO: el checkpoint y los enlaces a los runs de Weights & Biases documentan el ciclo completo de entrenamiento con RL, util para cursos y tutoriales.
- Pruebas de regresion de infraestructura: con 27,3B parametros y ~51 GiB en BF16, sirve para validar despliegues de Transformers 5.19.0 y vLLM 0.32.0 en entornos de servido.
- Generacion de texto creativo en ingles con fines literarios experimentales, asumiendo la perdida de coherencia documentada (-0,90 en coherencia frente a ganancias de +0,70 en creatividad y +0,62 en imagenes).

## Benchmarks y rendimiento

Paneles locales emparejados del autor, con tamanos de muestra limitados y una sola trayectoria de entrenamiento.

| Benchmark | Modo | Preguntas | Baseline | Full250 |
|---|---|---:|---:|---:|
| MMLU-Pro | Thinking desactivado | 280 | 59,29% | 56,07% |
| MMLU-Pro | Thinking medio | 280 | 77,86% | 78,57% |
| HumanEval+ | Thinking desactivado | 164 | 93,90% | 92,07% |
| HumanEval+ | Thinking medio | 164 | 93,29% | 93,90% |
| GSM8K | Thinking desactivado | 256 | 98,05% | 98,44% |
| GSM8K | Thinking medio | 256 | 98,44% | 98,05% |
| IFEval (strict prompt accuracy) | Thinking desactivado | 541 | 83,18% | 79,48% |

| Medida DAT | Baseline | Full250 |
|---|---:|---:|
| DAT sustantivos | 71,81 | 89,59 |
| DAT verbos | 51,11 | 85,21 |
| DAT adjetivos (held-out) | 60,72 | 86,26 |
| Palabras compatibles con adjetivo | 99,06% | 75,94% |
| Listas de adjetivos que pasan DAT y las diez comprobaciones de clase | 29/32 | 1/32 |

En escritura creativa, un panel de 32 briefs con dos muestras cada uno y juicio A/B y B/A reporta +0,70 en creatividad, +0,62 en imagenes y -0,90 en coherencia (escalas 0-10). Un panel adicional de ocho briefs con mayor limite de tokens reporta +0,77 en creatividad, +0,64 en imagenes y +2,15 en ornamentacion, con un incremento estimado de invencion conceptual de +0,35 cuyo intervalo cruza cero. La caida de IFEval tiene un intervalo bootstrap del 95% de [-7,21, -0,37] puntos porcentuales.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 51 GiB solo para pesos, mas memoria de runtime (KV cache, activaciones); en la practica requiere GPUs de 80 GB para servido comodo.
- Cuantizacion GGUF: Q8_0 y Q4_K_M disponibles en el repositorio `crazyleg11/qwen3.8-27b-dat-grpo-full250-GGUF` para llama.cpp y herramientas de escritorio compatibles; Q4_K_M reduce el peso a un rango manejable en GPUs consumer de 24 GB, aunque el dato exacto de VRAM no esta publicado.
- GPUs recomendadas: A100 80 GB o H100 para BF16 con vLLM; en consumer, RTX 4090 (24 GB) solo con cuantizacion de 4 bits y contexto limitado.
- Opciones de despliegue: Transformers (se requiere una version que soporte la arquitectura Qwen3.5; el autor uso 5.19.0 con PyTorch 2.13.0), vLLM 0.32.0 y llama.cpp via GGUF. No se documenta Ollama ni TGI.
- Los tensores de normalizacion guardados incluyen valores FP32; en servido BF16 el autor los convierte a BF16 en runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B DAT GRPO Full250 | 27,36B | no disponible | Fine-tune GRPO sobre DAT | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.8-27B (base) | 27,36B | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit | 27,36B | no disponible | Cuantizacion NF4 para entrenamiento | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos de ~27B orientados a creatividad o a ajuste por RL) no esta disponible en la informacion proporcionada. El baseline reconstruido a partir de la misma inicializacion NF4 es la referencia mas directa y ya aparece en las tablas de benchmarks.

## Limitaciones y advertencias

- Regresion clara en el cumplimiento de la restriccion de clase gramatical: solo 1 de 32 listas de adjetivos pasa todas las comprobaciones, frente a 29/32 del baseline.
- Caida de IFEval de 3,70 puntos porcentuales (intervalo del 95%: [-7,21, -0,37]), lo que sugiere deterioro del seguimiento de instrucciones estrictas.
- Perdida de coherencia en escritura creativa (-0,90 en escala 0-10) pese a las ganancias en creatividad e imagenes; la calidad literaria global queda sin resolver segun el autor.
- Riesgo de sobreoptimizacion de recompensa: el aumento de DAT en adjetivos held-out (+25,5 puntos) coexiste con el fallo sistematico de la restriccion, un patron clasico de reward hacking.
- Evaluaciones con tamanos de muestra reducidos (32 peticiones por clase, 280 preguntas en MMLU-Pro, 164 en HumanEval+) y una unica trayectoria de entrenamiento; los resultados no son concluyentes.
- Sesgos: no documentados por el autor; al derivar de Qwen3.8-27B hereda los sesgos del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no medido en los paneles publicados.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta evaluado.
- La torre de vision esta incluida pero no fue entrenada ni evaluada; no debe asumirse paridad multimodal con el modelo base.
- Licencia apache-2.0 permite uso comercial, pero el checkpoint es experimental y no se recomienda en produccion sin validacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crazyleg11/qwen3.8-27b-dat-grpo-full250
- Release GGUF: https://huggingface.co/crazyleg11/qwen3.8-27b-dat-grpo-full250-GGUF
- Demo en Space: https://huggingface.co/spaces/crazyleg11/full250-creativity
- Run de entrenamiento y muestras: https://forge.coreweave.com/wandb/savsunenko-sasha/llm-creativity-grpo/runs/s1rlnaat
- Resultados DAT y salidas crudas: https://forge.coreweave.com/wandb/savsunenko-sasha/llm-creativity-grpo/runs/8n7l356r
- Resultados de capacidades generales: https://forge.coreweave.com/wandb/savsunenko-sasha/llm-creativity-grpo/runs/qduhht2v
- Juicios de escritura: https://forge.coreweave.com/wandb/savsunenko-sasha/llm-creativity-grpo/runs/lqteia18
- Panel adicional de escritura y piloto de intervencion: https://forge.coreweave.com/wandb/savsunenko-sasha/llm-creativity-grpo/runs/xmoq4aqv
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Inicializacion cuantizada: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
