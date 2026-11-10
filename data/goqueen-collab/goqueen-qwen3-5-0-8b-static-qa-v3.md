# goqueen-collab/goqueen-qwen3.5-0.8b-static-qa-v3

## Resumen

GoQueen Qwen3.5-0.8B static QA (curriculum v3) es un checkpoint experimental de investigación desarrollado por el usuario goqueen-collab. No se trata de un modelo independiente ni de un adaptador PEFT convencional, sino de un "puente" (bridge) personalizado que combina un decodificador de texto Qwen3.5-0.8B congelado con activaciones congeladas de KataGo, el motor de Go de código abierto basado en redes neuronales. El modelo añade 7.998.088 parámetros entrenables que actúan como interfaz entre ambos sistemas.

El objetivo del proyecto es responder preguntas estáticas sobre posiciones de Go: ocupación de intersecciones, pertenencia a cadenas, tamaño de cadenas, libertades, situaciones de atari y relaciones entre puntos. Se entrenó sobre posiciones extraídas de 960 partidas SGF reales, con un conjunto de validación disjunto. El checkpoint seleccionado es el step-051400, tras 26.400 actualizaciones de static-QA, equivalente a aproximadamente 0,661 epochs.

Es relevante como ejemplo de arquitectura híbrida neuro-simbólica aplicada a un dominio de reglas formales (el Go), donde el modelo de lenguaje actúa como capa de razonamiento sobre representaciones de un motor especializado. Sin embargo, se trata de un checkpoint intermedio de investigación, pausado por el usuario, sin evaluación sobre el conjunto de test reservado y sin capacidad de juego demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: decodificador transformer Qwen3.5-0.8B congelado + activaciones KataGo congeladas + puente entrenable (bridge, position y extension-token params) |
| Parametros totales | 7.998.088 parámetros entrenables en el adaptador; el decodificador base Qwen3.5-0.8B y KataGo no están incluidos en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el decodificador base se carga en CUDA BF16 según el código de ejemplo) |
| Idiomas soportados | en |
| Licencia | no disponible (el autor indica que los modelos subyacentes conservan sus términos upstream y no se concede licencia adicional) |
| Formato de pesos | safetensors (`adapter.safetensors`, ~32 MB) + `training.pt` (estado de optimizador/RNG/currículum) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje de tres componentes: (1) el decodificador de texto Qwen3.5-0.8B congelado, revisión `2fc06364715b967f1860aea9cf38778875588b17`; (2) activaciones congeladas de KataGo v1.18.2, usando el checkpoint oficial SWA `kata1-tf2-b10c384-s2941M-d5872M` (SHA256 `73cbd4045379f1f587b5e4ab5be9d245a055e1b7bdecf03840410adf18055293`), con tensor de entrada de forma `[batch, 4, 361, 384]` y activaciones FP16 cacheadas de embedding/block2/block5/block9; y (3) un conjunto de 7.998.088 parámetros entrenables que implementan el puente, la codificación de posiciones y los tokens de extensión del vocabulario de Go.

El entrenamiento consistió en 26.400 actualizaciones de static-QA (step-051400), aproximadamente 0,661 epochs equivalentes, con muestreo ponderado con reemplazo sobre 638.687 exposiciones. Se seleccionó el checkpoint por macro score de validación de 0,907552, no por la última actualización ni por test independiente. El currículum cubre tareas de relación y conteo, y entrena listas completas de libertades solo para 1-3 libertades (muestreo al 20%). Las etiquetas auxiliares de reglas no son entradas del modelo. El entrenamiento fue pausado por el usuario antes de completar las tres epochs previstas.

## Capacidades

- Respuesta a preguntas estáticas sobre posiciones de Go: ocupación de intersecciones (100% en validación), pertenencia a cadena (100%), situación de atari (100%), tamaño de cadena (90,62%), libertades (97,66%), pertenencia a lista de libertades (94,53%), misma cadena (95,31%).
- Listado completo de puntos de libertad: capacidad limitada (28,12% en validación; 25% en el bucket de dificultad 1-3, 18,75% en 4-6, 0% en 7-12).
- Codificación y decodificación de puntos del tablero mediante un vocabulario extendido de Go.
- Integración con features de KataGo mediante `model.bind_expert(features)`.
- No se ha establecido capacidad de juego de Go ni explicación libre no restringida.
- Soporte de tool calling, function calling, agentes, visión, audio o modo thinking: no disponible.

## Casos de uso

- Análisis estático de posiciones en herramientas de revisión de partidas: dado un tablero y las features de KataGo, el modelo responde consultas puntuales sobre ocupación, cadenas y libertades para generar anotaciones automáticas.
- Enseñanza de reglas del Go a principiantes: responde preguntas cerradas del tipo "¿qué piedras forman esta cadena?" o "¿está este grupo en atari?" con alta fiabilidad en las tareas evaluadas.
- Construcción de datasets etiquetados de posiciones: sirve como generador de anotaciones estáticas (ocupación, tamaño de cadena, libertades) sobre corpus SGF para entrenar otros modelos.
- Investigación en arquitecturas híbridas neuro-simbólicas: el puente entre un LLM congelado y un motor de dominio concreto es un caso de estudio reproducible gracias al código fuente incluido en `source/`.
- Validación de pipelines de features de KataGo: el checkpoint permite comprobar la integración de activaciones cacheadas (embedding/block2/block5/block9) en un flujo de razonamiento textual.
- Benchmark de currículums de QA estático: los ficheros `validation.json` y `release.json` permiten reproducir la selección por macro score y comparar variantes del currículum (v2 vs v3).
- Prototipado de asistentes especializados en dominios de reglas formales (ajedrez, Go, puzzles lógicos) donde un motor determinista aporta el estado y el LLM la interfaz en lenguaje natural.

## Benchmarks y rendimiento

Resultados de validación del checkpoint step-051400 (greedy completo sobre vocabulario completo, 128 ejemplos por tarea):

| Tarea | Correctos / total | Precision |
|---|---:|---:|
| occupancy | 128 / 128 | 100,00% |
| same_chain | 122 / 128 | 95,31% |
| chain_size | 116 / 128 | 90,62% |
| liberties | 125 / 128 | 97,66% |
| liberty_points | 36 / 128 | 28,12% |
| atari | 128 / 128 | 100,00% |
| chain_member | 128 / 128 | 100,00% |
| liberty_member | 121 / 128 | 94,53% |

Diagnóstico por dificultad en listas de libertades: 1-3 puntos 8/32 (25%), 4-6 puntos 6/32 (18,75%), 7-12 puntos 0/32. Macro score de validación usado para selección: 0,907552. El conjunto de test reservado no ha sido evaluado.

## Requisitos de hardware

- El adaptador en sí ocupa ~32 MB (`adapter.safetensors`), pero requiere cargar el decodificador Qwen3.5-0.8B completo y las activaciones de KataGo, no incluidos en el repo.
- El código de ejemplo carga el decodificador congelado en CUDA BF16, por lo que se requiere GPU NVIDIA con soporte BF16.
- VRAM estimada: no disponible de forma explícita; el decodificador de 0,8B en BF16 requiere aproximadamente 1,6 GB solo en pesos, más activaciones y el estado de KataGo (no cuantificado en la información disponible).
- GPU recomendadas: no disponible. Por tamaño del decodificador, una GPU consumer con BF16 (RTX 3090, RTX 4090, etc.) sería suficiente en principio, pero no está confirmado por el autor.
- Opciones de despliegue: no es compatible con `AutoModel.from_pretrained` ni con cargadores PEFT LoRA. Requiere el código fuente incluido (`source/local-0.8b`), `train_coordinate_last.build_model`, `attention_ablation.configure_attention` y `static_qa_v2_prompts.prompt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El checkpoint es una construcción específica del proyecto explaingo y no tiene equivalentes públicos directos documentados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GoQueen Qwen3.5-0.8B static QA v3 | 7.998.088 entrenables + Qwen3.5-0.8B congelado | no disponible | no disponible | Hugging Face (repo 0,1 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint intermedio de investigación: el entrenamiento fue pausado por el usuario antes de completar las tres epochs previstas (~0,661 epochs equivalentes).
- El conjunto de test reservado no ha sido evaluado; los resultados presentados son de validación, no de generalización.
- El conjunto de validación fijo se reutilizó para la selección del checkpoint, lo que puede inflar el macro score.
- La tarea `liberty_points` (listado completo de libertades) tiene una precisión muy baja (28,12%) y cae a 0% en cadenas con 7-12 libertades.
- Tamaños de cadena grandes y recuentos altos de libertades son puntos débiles reconocidos por el autor.
- No se ha establecido capacidad de juego de Go ni explicación libre no restringida.
- No es cargable con `AutoModel.from_pretrained` ni con un loader PEFT LoRA; requiere el código fuente incluido y dependencias fijadas.
- El decodificador Qwen3.5-0.8B y los pesos/features de KataGo no están incluidos en el repositorio; deben obtenerse por separado.
- Licencia no disponible: el autor no concede licencia adicional y remite a los términos upstream de los modelos subyacentes. Verificar antes de cualquier uso comercial.
- Idioma limitado al inglés (`en`).
- Riesgo de alucinación en dominios fuera de las tareas estáticas entrenadas; el modelo no fue entrenado para razonamiento general sobre Go.
- Las etiquetas auxiliares de reglas no son entradas del modelo; no deben pasarse como features.

## Enlaces

- Hugging Face: https://huggingface.co/goqueen-collab/goqueen-qwen3.5-0.8b-static-qa-v3
- Proyecto original (explaingo): https://github.com/dengtingyu/explaingo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- KataGo: no disponible en la información proporcionada (checkpoint referenciado `kata1-tf2-b10c384-s2941M-d5872M`, v1.18.2)
