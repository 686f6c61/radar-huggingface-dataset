# semgram/decider-75M

## Resumen

decider-75M es un modelo especializado de clasificación de texto desarrollado por semgram que resuelve un problema muy concreto: emitir las decisiones tipadas del benchmark Typed Decisions. Dado el nombre de un flujo de trabajo y el estado de un caso, devuelve en un único forward pass una distribución de probabilidad para cada opción de las cinco preguntas de ese flujo. Cubre tres tipos de pregunta: `noul` (afirmación sí/no respondida como probabilidad de ser verdadera), `choice` (una entre varias opciones con nombre, como una disposición o una siguiente acción) y `score` (un punto en una escala ordinal, como severidad o urgencia de 0 a 3).

El modelo parte del backbone mmBERT-small de jhu-clsp, un encoder de 22 capas con tamaño oculto 384 y 6 cabezas de atención, y añade 20 cabezas lineales (una por pregunta) sobre la salida del encoder tras mean pooling. Con 74.814.407 parámetros totales (de los cuales solo 27.335 pertenecen a las cabezas), se sitúa en la frontera de precisión por tamaño del benchmark: iguala o supera a modelos de 400M de parámetros con una fracción del coste computacional.

Su relevancia actual radica en que ofrece una alternativa de 75M parámetros que alcanza 0.8050 de accuracy en el split de test (1.610 de 2.000 decisiones correctas), frente a 0.8025 de sysone-typed-decisions-0.4B (400M) o 0.796 de OpenDecider-nano (400M). Además, su calibración es informativa: filtrando por confianza se eleva la accuracy a 0.832 al responder el 90% de las decisiones más seguras, lo que lo hace apto para enrutar los casos inciertos a un humano o a un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small): 22 capas, hidden size 384, 6 cabezas de atención, más 20 cabezas lineales de decisión |
| Parametros totales | 74.814.407 (cabezas: 27.335) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; entradas más largas se truncan (el caso más largo del test tiene 534 tokens) |
| Tipos de cuantizacion | no disponible; pesos en float32, autocast a bfloat16 en GPU y float32 en CPU |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (float32, 299 MB); el repo incluye el loader `typed_decisions.py` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer puro (no generativo) basado en mmBERT-small. La salida del encoder se somete a mean pooling y se proyecta mediante 20 cabezas lineales, una por cada pregunta de los cinco flujos de trabajo cubiertos (agent-trace observability, customer service, invoice processing y security incidents). El vocabulario es de 84.889 tokens: el vocabulario de mmBERT recortado a los tokens que usa el inglés, con byte fallback que permite codificar cualquier texto. Las 22 capas se ajustaron finas durante 12 épocas con soft cross-entropy contra distribuciones de probabilidad completas, no contra etiquetas duras.

El entrenamiento usó el split `train` del benchmark Typed Decisions más los casos sintéticos de decider-data. Según la model card, los casos sintéticos aportan 2,7 puntos de accuracy: con los mismos ajustes solo sobre `train`, el modelo obtiene 0.7765 en test (KL 0.114), frente a 0.8035 (KL 0.081) con ellos. No se menciona RLHF ni DPO, lo cual es coherente con un modelo de clasificación y no de generación. La innovación técnica principal es el diseño de cabezas por pregunta con salida probabilística directa en un solo forward pass, lo que permite umbralizar por confianza y enrutar decisiones inciertas.

## Capacidades

- Clasificación multi-etiqueta estructurada: devuelve una distribución de probabilidad por cada opción de las cinco preguntas de un flujo de trabajo dado.
- Preguntas binarias (`noul`): responde sí/no como probabilidad de que la afirmación sea verdadera.
- Preguntas categóricas (`choice`): selecciona entre opciones con nombre (disposición, siguiente acción, resultado).
- Preguntas ordinales (`score`): puntúa en escalas de 0 a 3 (severidad, urgencia, riesgo).
- Entrada flexible: acepta el estado del caso como dict de Python o como cadena JSON.
- Confianza calibrada: las probabilidades permiten filtrar por certeza y enrutar decisiones dudosas.
- Inferencia en un único forward pass para las cinco decisiones de un caso.
- Capacidades multilingües: limitadas al inglés; el byte fallback codifica cualquier texto, pero el modelo no está entrenado para otros idiomas.
- No soporta tool calling, agentes, generación de texto libre, visión ni audio.

## Casos de uso

- Revisión de trazas de agentes: dado el resumen de una ejecución (número de pasos, violaciones de restricciones, errores de herramienta, acciones irreversibles), el modelo estima la probabilidad de éxito, el riesgo y la urgencia, y recomienda continuar, observar, parar o escalar a revisión humana. Es adecuado por su latencia de ~22 ms por caso, que permite evaluar cada traza en tiempo casi real.
- Triaje de tickets de atención al cliente: con el estado del caso, clasifica la disposición y la siguiente acción, lo que permite enrutar automáticamente los tickets hacia el equipo adecuado y priorizar por urgencia.
- Procesamiento de facturas: con 85,4% de accuracy en el flujo de invoice processing (427/500 decisiones correctas), puede asignar disposiciones y detectar anomalías en facturas antes de la validación humana, reduciendo la carga de revisión manual.
- Detección y clasificación de incidentes de seguridad: con 79,6% de accuracy, estima severidad y urgencia de un incidente a partir de su estado, lo que sirve como primera capa de triaje en un SOC.
- Enrutamiento por confianza en pipelines de producción: gracias a que la accuracy sube a 0.832 al responder solo el 90% de las decisiones más seguras y a 0.885 al 70%, el modelo puede gestionar automáticamente los casos claros y derivar los inciertos a un modelo mayor o a un humano.
- Evaluación automática de agentes en CI/CD: integrado en un pipeline, puede puntuar trazas sintéticas de agentes y detectar regresiones de comportamiento (aumento de riesgo o de acciones irreversibles) antes de desplegar una nueva versión del agente.
- Moderación y control de gasto en agentes: con estados que incluyen restricciones como límites de gasto, el modelo estima si una acción requiere revisión humana (`needs_review`) antes de ejecutarse.

## Benchmarks y rendimiento

Resultados en el split `test` del benchmark Typed Decisions (400 casos, 2.000 decisiones). decider-75M y decider-175M se puntuaron a través de sus propias carpetas publicadas; el resto de filas son las reportadas en la leaderboard del benchmark.

| Modelo | Parámetros | Accuracy | Decisiones correctas | KL vs gold | Brier | ECE |
|---|---|---|---|---|---|---|
| decider-175M | 175,6M | 0.8120 | 1.624 / 2.000 | 0.077 | 0.042 | 0.183 |
| **decider-75M** | **74,8M** | **0.8050** | **1.610 / 2.000** | **0.080** | **0.045** | **0.176** |
| sysone-typed-decisions-0.4B | 400M | 0.8025 | 1.605 / 2.000 | 0.080 | 0.044 | 0.174 |
| OpenDecider-nano | 400M | 0.796 | 1.592 / 2.000 | 0.079 | 0.043 | no disponible |
| Phocinae-Largha-150M-v1 | 144,3M | 0.791 | 1.582 / 2.000 | no disponible | no disponible | no disponible |
| SafeDecide-400M | 400M | 0.787 | 1.574 / 2.000 | 0.083 | 0.045 | 0.171 |
| SafeDecide-140M | 140M | 0.754 | 1.508 / 2.000 | 0.126 | 0.069 | 0.147 |

El error estándar de la accuracy sobre 2.000 decisiones es de aproximadamente 0,009. Por flujo de trabajo: invoice processing 85,4% (427/500), customer service 80,6% (403/500), security incidents 79,6% (398/500) y agent-trace observability 76,4% (382/500). Por tipo de pregunta: `noul` 85,3% (512/600), `score` 78,9% (631/800) y `choice` 77,8% (467/600). Con filtrado por confianza: 0.832 al 90% de decisiones, 0.859 al 80% y 0.885 al 70%.

## Requisitos de hardware

- VRAM estimada: 383 MiB de pico durante el scoring del split de test completo (según la model card); en inferencia batch 1 el consumo es muy inferior al GB.
- GPU recomendadas: cualquier GPU moderna sirve; el dato de latencia publicado (~22 ms por caso, batch 1) se midió en una RTX PRO 4000 Blackwell.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, etc.).
- También funciona en CPU en float32, con mayor latencia (no se publica cifra concreta).
- Opciones de despliegue: el repo incluye su propio loader `typed_decisions.py` (requiere `torch`, `transformers` y `safetensors`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~22 ms por caso para las cinco decisiones en batch 1 (RTX PRO 4000 Blackwell). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Accuracy (test) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-75M | 74,8M | 0.8050 | 1.024 tokens | CC BY 4.0 | Hugging Face |
| decider-175M | 175,6M | 0.8120 | no disponible | no disponible | Hugging Face |
| sysone-typed-decisions-0.4B | 400M | 0.8025 | no disponible | no disponible | Hugging Face |
| OpenDecider-nano | 400M | 0.796 | no disponible | no disponible | Hugging Face |
| SafeDecide-400M | 400M | 0.787 | no disponible | no disponible | Hugging Face |
| SafeDecide-140M | 140M | 0.754 | no disponible | no disponible | Hugging Face |

decider-75M ofrece la mejor relación accuracy/parámetros de la comparativa: supera a modelos de 400M con 5,3 veces menos parámetros. Solo decider-175M lo supera en accuracy absoluta (0,7 puntos más) a 2,3 veces el tamaño.

## Limitaciones y advertencias

- Especialización estrecha: solo emite decisiones para los cuatro flujos de trabajo del benchmark (agent-trace observability, customer service, invoice processing, security incidents); no es un modelo de propósito general.
- Solo inglés: el vocabulario está recortado a tokens ingleses y el modelo no está entrenado en otros idiomas; el byte fallback evita fallos de codificación, pero no garantiza calidad fuera del inglés.
- Sesgos: no se documentan análisis de sesgo en la model card; al entrenarse sobre un benchmark y datos sintéticos, puede heredar los sesgos de composición de esos datos.
- Riesgo de alucinación: al ser un clasificador probabilístico, no genera texto libre, pero puede producir distribuciones mal calibradas en casos fuera de distribución; el ECE de 0.176 indica una calibración moderada, no perfecta.
- Límite de contexto: 1.024 tokens con truncado silencioso; casos más largos pierden información (el caso más largo del test tiene 534 tokens, por lo que el margen es amplio en el benchmark, pero no en producción).
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene revisar los términos exactos para el despliegue previsto.
- Dependencia de un loader propio: requiere añadir la carpeta del repo al `sys.path` y usar `typed_decisions.py`; no es un modelo estándar de `transformers` cargable con `AutoModel`.
- Advertencia de producción: la accuracy de 0.805 implica que aproximadamente 1 de cada 5 decisiones es incorrecta; el filtrado por confianza o la revisión humana de los casos inciertos es recomendable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semgram/decider-75M
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo hermano decider-175M: https://huggingface.co/semgram/decider-175M
- Dataset del benchmark Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset sintético decider-data: https://huggingface.co/datasets/semgram/decider-data
- Modelo comparable sysone-typed-decisions-0.4B: https://huggingface.co/forward-metric/sysone-typed-decisions-0.4B
- Modelo comparable OpenDecider-nano: https://huggingface.co/manjunathshiva/opendecider-nano
- Modelo comparable Phocinae-Largha-150M-v1: https://huggingface.co/Phocinae/Phocinae-Largha-150M-v1
- Modelo comparable SafeDecide-400M: https://huggingface.co/yotambr/safedecide-400m
- Modelo comparable SafeDecide-140M: https://huggingface.co/yotambr/safedecide-140m
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
