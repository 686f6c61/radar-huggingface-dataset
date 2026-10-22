# JesseLiu/agentorch-rl-gemma31b-final

## Resumen

`agentorch-rl-gemma31b-final` es un checkpoint de investigación publicado por el usuario JesseLiu (HuggingFace) sobre el modelo base `google/gemma-4-31B-it`. No es un modelo nuevo desde cero: es el resultado de un pipeline de ajuste supervisado (SFT) seguido de aprendizaje por refuerzo con GRPO, orientado a una única tarea concreta, la orquestación de flujos de trabajo multiagente dentro del benchmark AgentOrch. Los pesos publicados ya llevan las LoRA fusionadas en el modelo base, por lo que se cargan como un checkpoint convencional con `transformers` o `vLLM`.

El interés técnico del artefacto es doble. Por un lado, documenta una receta completa y reproducible de RL sobre un modelo de 31 273 086 512 parámetros con LoRA r16/a32, vLLM colocado en TP8 y una recompensa puramente simbólica (Tier-1 symbolic match). Por otro, hace públicas sus métricas en el arnés congelado del benchmark, y esas métricas son malas: 0,191 de precisión de orquestación, 0,0922 de precisión final y un 56,55 % de tasa de error sobre 3 220 variantes. Es, por tanto, un punto de partida y una referencia negativa útil, no un modelo listo para producción.

Conviene subrayar el contexto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, se creó el 21 de octubre de 2026 y su model card es un README mínimo centrado en la receta y la tabla de evaluación. No hay paper, ni demo, ni documentación de arquitectura propia, ni datos declarados de contexto máximo o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredado de `google/gemma-4-31B-it`; el autor no detalla la arquitectura interna ni innovaciones propias |
| Parametros totales | 31 273 086 512 (31,27 B) |
| Parametros activos | No aplica: la informacion disponible no describe un modelo MoE |
| Longitud de contexto | No disponible. El presupuesto de entrenamiento fue de 65 536 tokens, dato que no equivale al contexto maximo del modelo |
| Tipos de cuantizacion | No disponible. El repo solo contiene pesos `safetensors` de 62,6 GB, consistentes con bf16/fp16; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los tags) |
| Licencia | apache-2.0 (declarada por el autor; ver limitaciones respecto a la licencia del modelo base) |
| Formato de pesos | `safetensors`, con las LoRA fusionadas en los pesos base; revision del base: `842da3794eaa0b77d5f08bae87a17459d91ff475` |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-4-31B-it` y aplica un pipeline en dos fases. La fase SFT usó los datos v1, 1 época, un presupuesto de 65 536 tokens, LoRA con r16 y alpha 32, learning rate 1e-4 y scheduler coseno. La fase RL partió del checkpoint `sft-gemma31b-v1-1ep` y empleó GRPO mediante `TRL GRPOTrainer`, de nuevo con LoRA r16/a32, learning rate 1e-5, beta de KL 0,001, tamaño de grupo 8, 8 prompts por paso, 40 pasos en total sobre 131 prompts, con tope de finalización de 3072 tokens y vLLM colocado en TP8 para el muestreo. El dataset de RL, `data_trl_v1_31b`, contiene 500 filas con prompts de hasta 210 000 caracteres.

La innovación reseñable no está en la arquitectura, sino en la señal de recompensa: se usa exclusivamente una coincidencia simbólica de Tier 1, es decir, verificación determinista de la estructura de orquestación esperada, sin modelo juez ni recompensa aprendida. El resultado se fusionó en los pesos base (LoRA folded), de modo que la inferencia no requiere adaptadores. Un detalle operativo importante y explicitado por el autor: tanto en entrenamiento como en evaluación se usó `enable_thinking=False` en la plantilla de chat, por lo que el modo de razonamiento extendido del modelo base queda desactivado en el uso previsto.

## Capacidades

- Orquestación de flujos de trabajo multiagente: es la única capacidad para la que existe evidencia de entrenamiento y evaluación (benchmark AgentOrch).
- Generación de texto y razonamiento general: heredados del modelo base, pero sin evaluación publicada en esta ficha.
- Razonamiento multi-paso orientado a agentes: el entrenamiento RL refuerza la producción de estructuras de orquestación verificables simbólicamente.
- Modo thinking: el autor recomienda `enable_thinking=False`; el comportamiento con thinking activado no está documentado.
- Tool calling / function calling: no confirmado explícitamente en la información disponible; debe validarse empíricamente antes de asumirlo.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades de visión o audio: no disponibles.
- Cumplimiento de formato estricto: la recompensa simbólica sugiere cierta especialización en salidas parseables, aunque la tasa de error del 56,55 % matiza mucho esta afirmación.

## Casos de uso

- Investigación en RL para agentes: sirve como checkpoint de referencia para reproducir la receta GRPO con recompensa simbólica y comparar curvas frente a nuevas variantes del proyecto AgentOrch.
- Baseline negativo en evaluación de orquestadores: su tabla de métricas (0,191 / 0,0922 / 0,5655) es un punto de comparación explícito para cualquier orquestador que se evalúe en el mismo arnés congelado de 3 220 variantes.
- Generación de candidatos para filtrado simbólico: dado que la recompensa premia coincidencias Tier-1, puede usarse para producir borradores de estructura de workflow que un validador determinista filtre después, descartando la mayoría de salidas.
- Estudio de olvido catastrófico y degradación: útil para medir cuánto pierde un modelo instruct de 31 B tras SFT de 1 época y 40 pasos de GRPO sobre un dominio estrecho.
- Prototipado interno de routers de agentes con supervisión humana: en un entorno cerrado, con revisión manual obligatoria de cada plan generado, puede acelerar la escritura de esqueletos de orquestación.
- Docencia y divulgación: ejemplo compacto y reproducible de pipeline SFT + GRPO con LoRA y vLLM colocado, adecuado para explicar cómo se monta un entrenamiento RL de agentes de principio a fin.
- Análisis de sensibilidad de hiperparámetros: con 131 prompts y 40 pasos, el coste de réplica es bajo, lo que permite experimentar con beta de KL, tamaño de grupo o tope de finalización.

## Benchmarks y rendimiento

Evaluación sobre el benchmark AgentOrch (Global View, 3 220 variantes, arnés congelado, ejecución `rl-gemma31b-final-global`):

| Metrica | Resultado |
|---|---:|
| Precision de orquestacion (orchestration accuracy) | 0,191 |
| Precision final (final accuracy) | 0,0922 |
| Tasa de error (error rate) | 0,5655 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se proporciona la línea base del checkpoint SFT previo (`sft-gemma31b-v1-1ep`) ni la del modelo base, por lo que no es posible atribuir la mejora o el deterioro al RL.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 62,6 GB solo para pesos, más caché KV y activaciones; viable en 1x H100 80 GB con contexto limitado o en 2x A100 80 GB con margen.
- GPU recomendadas: H100 80 GB (single-node con tensor parallel), A100 80 GB en TP2, o configuraciones TP8 si se replica el entorno de entrenamiento con vLLM.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB) ni en una RTX 5090. En cuantización de 4 bits el peso se reduciría aproximadamente a 16-17 GB, lo que sí cabría, pero el autor no publica versiones cuantizadas: habría que generarlas con herramientas externas y validar la degradación.
- Opciones de despliegue: `transformers` y `vLLM` están explícitamente soportados por el autor. `llama.cpp`/GGUF, Ollama y TGI requerirían conversión previa y no están validados en la model card.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, el autor usó vLLM en TP8 para muestreo durante el entrenamiento, lo que sugiere que la inferencia en una sola GPU de 80 GB será lenta con contextos largos (los prompts del dataset llegan a 210 000 caracteres).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JesseLiu/agentorch-rl-gemma31b-final` | 31,27 B | No disponible (entrenamiento a 65 536) | Orquestación de agentes via SFT + GRPO | apache-2.0 declarada | Pesos `safetensors` en HF; 0 descargas |
| `google/gemma-4-31B-it` (base) | 31 B (aprox., según nomenclatura) | No disponible en la informacion | Modelo instruct generalista | No disponible en la informacion | Público en HuggingFace |
| Otros fine-tunes de orquestación comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de terceros comparables en la información facilitada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Rendimiento bajo y documentado: precisión final de 0,0922 y tasa de error del 56,55 % en el benchmark objetivo. No es apto para producción sin supervisión humana.
- Ausencia de línea base: sin las métricas del checkpoint SFT ni del modelo base, no puede saberse si el RL mejoró, empeoró o dejó igual al modelo.
- Sesgo de dominio: el entrenamiento se limita a 131 prompts de RL (500 filas en el dataset) y 40 pasos; la generalización fuera de AgentOrch es altamente dudosa.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de orquestación, una estructura inventada puede ser tan plausible como una correcta.
- Idiomas no declarados: no hay garantía de comportamiento correcto en castellano ni en ningún otro idioma distinto del usado en los datos de entrenamiento.
- Contexto máximo no confirmado: el presupuesto de entrenamiento de 65 536 tokens no implica que el modelo soporte esa ventana en inferencia.
- Licencia: el autor declara apache-2.0, pero el modelo base es `google/gemma-4-31B-it` y sus términos de uso no se detallan en la información disponible. Verificar la compatibilidad antes de cualquier uso comercial; la declaración apache-2.0 de un derivado no prevalece automáticamente sobre la licencia del base.
- Modo thinking desactivado por diseño: usar `enable_thinking=True` sale de la distribución de entrenamiento y evaluación, con comportamiento no documentado.
- Repositorio sin tracción ni mantenimiento conocido: 0 descargas, 0 likes, sin paper ni issues públicos referenciados. No hay garantía de soporte.
- El arnés de evaluación es propiedad del proyecto AgentOrch y no se distribuye con el checkpoint; la reproducibilidad depende de un repositorio externo cuya URL no se proporciona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-rl-gemma31b-final
- Modelo base: https://huggingface.co/google/gemma-4-31B-it (revision `842da3794eaa0b77d5f08bae87a17459d91ff475`)
- Repositorio AgentOrch (arnés, datos de entrenamiento y registro de experimentos): mencionado en la model card, URL no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a cuentas de redes sociales y a un panel industrial sin relación con el proyecto
