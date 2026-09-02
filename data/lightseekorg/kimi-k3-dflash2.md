# lightseekorg/kimi-k3-dflash2

## Resumen

`lightseekorg/kimi-k3-dflash2` es un modelo auxiliar de decodificación especulativa (draft model) diseñado para acelerar la inferencia del modelo `moonshotai/Kimi-K3`, un MoE multimodal de 2,8 billones de parámetros desarrollado por Moonshot AI. Este draft model implementa el algoritmo DFLASH (Dynamic Flash Attention for Speculative Decoding) y se sirve mediante TokenSpeed, un motor de inferencia especializado. Su función es generar propuestas de tokens que el modelo grande verifica en paralelo, reduciendo la latencia y el coste computacional en entornos de producción.

El modelo tiene 3,69 mil millones de parámetros distribuidos en 5 capas, con una combinación de atención multi-latente (MLA) y atención de ventana deslizante (SWA). Utiliza un esquema de lookahead-8 y extrae señales auxiliares de cinco capas internas del modelo target (capas 19, 37, 66, 78 y 90). Es relevante porque permite desplegar el enorme Kimi-K3 con un rendimiento práctico aceptable, un problema crítico para aplicaciones de razonamiento largo y agentes. Su publicación en agosto de 2026 coincide con la maduración de DFlash2 en ecosistemas como vLLM y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel: 5 capas, MLA + SWA, lookahead-8, hidden size 7168 |
| Parametros totales | 3.692.877.824 (3,69 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo target; ventana deslizante de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un drafter de 5 capas con hidden size 7168 y pesos en bfloat16. Cada capa usa atención multi-latente (MLA), una variante eficiente de atención que reduce el uso de KV cache, y cuatro de las cinco capas emplean atención de ventana deslizante con ventana de 4096 tokens, mientras que una capa usa atención completa. El esquema de lookahead-8 (block_size=8) permite generar hasta 8 tokens de propuesta por paso. Además, el modelo extrae cinco taps auxiliares de los hidden states del modelo target en las capas 19, 37, 66, 78 y 90, que se utilizan para alinear las predicciones del drafter con las del modelo grande. La rotación posicional usa yarn RoPE con `rope_theta=50000.0` y factor 32.0.

No se dispone de información sobre el proceso de entrenamiento (dataset, número de tokens, técnicas de alineación). Dado que es un draft model, se asume que fue entrenado mediante destilación de las salidas del Kimi-K3, pero no hay datos públicos al respecto.

## Capacidades

- Decodificación especulativa: genera propuestas de tokens para el modelo Kimi-K3, permitiendo verificación en paralelo y reducción de latencia.
- Soporte del algoritmo DFLASH: implementa el esquema de verificación con confianza programada (confidence-scheduled verification) de DFlash2.
- Integración con TokenSpeed: diseñado para servirse con `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`.
- Extracción de señales auxiliares: utiliza taps en capas intermedias del modelo target para mejorar la precisión de las propuestas.
- No es un modelo de generación autónoma: no puede generar texto por sí mismo; requiere el modelo target para funcionar.

## Casos de uso

- Aceleración de inferencia en producción para Kimi-K3: el drafter reduce el tiempo de generación de tokens en cargas de trabajo de razonamiento largo, como agentes multi-paso o análisis de documentos extensos.
- Despliegue en entornos con GPUs limitadas: al reducir la latencia, permite servir el modelo de 2,8T con menos recursos o con mayor throughput en el mismo hardware.
- Integración en pipelines de serving con TokenSpeed: el comando de serving incluido en la model card muestra cómo configurar el drafter junto al modelo target en un clúster de 8 GPUs.
- Evaluación de rendimiento de decodificación especulativa: los benchmarks publicados (GSM8K, HumanEval, etc.) sirven para comparar la eficacia del drafter en diferentes dominios.
- Optimización de costes en API de inferencia: al reducir el número de pasos de decodificación del modelo grande, se disminuye el coste energético y de cómputo por petición.
- Investigación en decodificación especulativa: el modelo es un caso de estudio de DFlash2 con MLA y SWA, útil para desarrolladores que quieran implementar técnicas similares en otros modelos.

## Benchmarks y rendimiento

La model card publica resultados de aceptación de propuestas (acc_len) y porcentaje de aceptación para diez benchmarks, medidos con TokenSpeed DFLASH en dos nodos GB300 (8 GPUs, TP8) y sampling de producción (temperature=1.0, top_p=0.95, reasoning effort max).

| benchmark | acc_len | proposal acceptance | prompts | requests | truncated | mean out tok |
|---|---|---|---|---|---|---|
| GSM8K | 5.901 | 70.0% | 1319 | 1319 | 0.0% | 254 |
| HumanEval | 5.080 | 58.3% | 164 | 164 | 0.6% | 989 |
| MATH-500 | 4.636 | 51.9% | 500 | 500 | 0.8% | 803 |
| SPEED-Bench coding | 4.431 | 49.0% | 80 | 89 | 1.1% | 1341 |
| SPEED-Bench RAG | 3.958 | 42.3% | 80 | 91 | 1.1% | 691 |
| SPEED-Bench multilingual | 3.849 | 40.7% | 80 | 80 | 1.2% | 655 |
| MT-Bench | 3.585 | 36.9% | 80 | 160 | 9.4% | 1759 |
| SPEED-Bench QA | 3.213 | 31.6% | 80 | 80 | 3.8% | 1018 |
| AIME 2026 | 2.785 | 25.5% | 30 | 30 | 13.3% | 6091 |
| SPEED-Bench writing | 2.780 | 25.4% | 80 | 84 | 64.3% | 3588 |

También se evaluó el rendimiento en contexto largo con RULER (multi-key needle retrieval), variando la longitud de entrada:

| bucket | input tokens | acc_len | proposal acceptance | retrieval |
|---|---|---|---|---|
| 8k | 8203 | 5.666 | 66.7% | 1.000 |
| 32k | 32596 | 4.973 | 56.8% | 1.000 |
| 64k | 65113 | 4.805 | 54.4% | 1.000 |
| 128k | 130151 | 4.854 | 55.1% | 1.000 |

Estos datos indican que el drafter mantiene una tasa de aceptación alta en tareas de razonamiento y codificación, y degrada gradualmente en tareas más abiertas como escritura o QA.

## Requisitos de hardware

- El drafter tiene 7,39 GB de pesos en bfloat16, por lo que cabe en GPUs consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, etc.) si se sirve de forma aislada.
- Sin embargo, su uso práctico requiere el modelo target Kimi-K3 (2,8T parámetros), que necesita hardware de gama alta: el serving de referencia usa dos nodos GB300 con 8 GPUs en total (TP8).
- Para el drafter solo, se puede ejecutar en una GPU consumer, pero la latencia del conjunto depende del modelo grande.
- Opciones de despliegue: TokenSpeed (recomendado, con `--speculative-algorithm DFLASH`), vLLM (a partir de v0.28.0 incluye DFlash2), y potencialmente otros motores que soporten decodificación especulativa.
- No se dispone de datos de latencia o throughput específicos para el drafter en solitario.

## Comparativa con modelos similares

No se dispone de información sobre otros draft models específicos para Kimi-K3 o con arquitectura comparable (MLA + SWA + lookahead). Los draft models de decodificación especulativa suelen ser específicos de cada modelo target, por lo que no hay una comparativa directa con alternativas genéricas. Se puede mencionar que otros enfoques como EAGLE o Medusa utilizan arquitecturas diferentes, pero no hay datos públicos de rendimiento comparativo con este modelo.

## Limitaciones y advertencias

- Es un modelo auxiliar: no puede generar texto de forma autónoma; requiere el modelo target Kimi-K3 para funcionar.
- La licencia "other" no está especificada; puede tener restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de usarlo en producción.
- No se dispone de información sobre sesgos o alucinaciones del drafter, pero al ser un modelo de propuesta, su calidad depende del modelo target.
- El rendimiento de aceptación varía según la tarea: en escritura creativa o QA abierta la tasa de aceptación cae por debajo del 30%, lo que limita su utilidad en esos dominios.
- El serving requiere configuración específica de TokenSpeed y un clúster con GPUs de gran capacidad; no es trivial desplegarlo en infraestructura estándar.
- Los benchmarks se obtuvieron con un hardware concreto (GB300, TP8) y sampling de producción; los resultados pueden variar en otros entornos.

## Enlaces

- HuggingFace: https://huggingface.co/lightseekorg/kimi-k3-dflash2
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Kimi K3 en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Nota de vLLM v0.28.0 (menciona DFlash2): https://aiweekly.co/node/11086
