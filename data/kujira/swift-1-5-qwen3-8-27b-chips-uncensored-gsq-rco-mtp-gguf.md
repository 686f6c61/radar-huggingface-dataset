# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-MTP-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B CHiPS-Uncensored GSQ-RCO MTP es una cuantización GGUF publicada por el usuario Kujira que modifica dos ficheros del modelo base de UkisAI (Swift 1.5 Qwen3.8-27B GSQ-RCO), reduciendo el comportamiento de rechazo mediante una técnica denominada CHiPS (Causal Head-isolated Projection Steering). El modelo parte de una arquitectura Qwen3 de 27.320.697.856 parámetros totales, distribuida en formato GGUF para llama.cpp y orientada a generación de texto conversacional con modo de razonamiento.

La modificación afecta únicamente a 4 de los 866 tensores del fichero original, que se recuantizan a su tipo original usando la matriz de importancia Swift V1MIX del repositorio de origen. El resto de tensores, incluida la cabeza MTP (multi-token prediction), permanece byte a byte idéntico. Según la model card, el porcentaje de frases de rechazo ante 104 peticiones dañinas cae del 93,3 % al 2,9 % en el fichero IQ2_XS-mtp, mientras que las métricas de capacidad (GSM8K, MMLU-Pro), tool calling y perplejidad se mantienen en el mismo nivel que el original.

Es relevante ahora porque demuestra que es posible alterar un comportamiento concreto de un modelo grande editando un número muy reducido de cabezas de atención, sin reentrenamiento completo ni degradación medible en tareas estándar. No obstante, la receta de CHiPS no está publicada y el modelo no cuenta con evaluación en la variante IQ3_S, lo que limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (según tag `qwen3_8`), con cabeza MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB) |
| Idiomas soportados | no disponible (las evaluaciones se hicieron en inglés y japonés) |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp), con metadatos `quantize.imatrix.*` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Swift 1.5 Qwen3.8-27B GSQ-RCO de UkisAI, que a su vez se apoya en una familia Qwen3 de 27.320.697.856 parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO. Sí se indica la presencia de una cabeza MTP (multi-token prediction), que en esta publicación se conserva byte a byte idéntica al original y se incluye en cada fichero cuantizado.

La innovación técnica de esta ficha es CHiPS (Causal Head-isolated Projection Steering), un método que modifica un comportamiento (en este caso, la reducción de rechazos) editando únicamente unas pocas cabezas de atención seleccionadas por su efecto causal sobre dicho comportamiento. En concreto, se reescriben 4 de los 866 tensores y se recuantizan a su tipo original con la matriz de importancia `imatrix-swift15-v1mix.gguf` del repositorio base. El resto de tensores, incluida la cabeza MTP, permanece intacto. La receta de CHiPS no está publicada, por lo que no es posible reproducir la edición a partir de la información disponible.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de modo de razonamiento (tag `reasoning`).
- Razonamiento matemático: 94,0 % de acierto en 250 preguntas de GSM8K (frente al 94,8 % del original).
- Conocimiento general y razonamiento multidisciplinar: 73,7 % en 300 preguntas de MMLU-Pro, idéntico al original.
- Tool calling / function calling: 100 % de llamada cuando se espera, 100 % de nombre correcto y 100 % de argumentos completos en 40 tareas; 100 % de no llamada cuando no se necesita (frente al 90 % del original).
- Continuación tras resultado de herramienta: 100 % en las pruebas realizadas.
- Tareas de formato largo: 12,5 % alcanzó el límite de tokens frente al 20,8 % del original, con menos bucles de periodo corto (0 % frente al 4,2 %).
- Multilingüe: las evaluaciones se hicieron en inglés y japonés, pero no se declara una lista oficial de idiomas.
- Comportamiento "uncensored": reducción de frases de rechazo del 93,3 % al 2,9 % en 104 peticiones dañinas, con respuestas más largas (992 tokens de media frente a 297).
- Sin proyector de visión incluido; la visión no se probó.

## Casos de uso

- Evaluación de robustez y seguridad de modelos: el par original/modificado permite comparar el mismo modelo con y sin el comportamiento de rechazo, útil para estudiar cómo afectan las ediciones de cabezas de atención a las respuestas ante peticiones dañinas.
- Investigación sobre edición de modelos: al conservar 862 de 866 tensores idénticos, sirve para aislar el efecto de una intervención mínima sobre el comportamiento y medir su impacto en GSM8K, MMLU-Pro y tool calling.
- Despliegue local en hardware de consumo: el fichero IQ2_XS-mtp ocupa 8,77 GB y el IQ3_S-mtp 12,12 GB, lo que permite ejecución en GPUs consumer con suficiente VRAM mediante llama.cpp.
- Asistentes conversacionales de dominio acotado: con tool calling fiable (100 % en las pruebas) y continuación tras resultado de herramienta, puede integrarse en flujos de automatización que requieran llamadas a APIs.
- Generación de respuestas largas y detalladas: la media de 992 tokens en peticiones dañinas y el menor porcentaje de tareas largas que alcanzan el límite sugieren utilidad para respuestas extensas, ajustando `max_tokens`.
- Experimentación con decodificación multi-token: la cabeza MTP incluida en los GGUF permite probar estrategias de predicción especulativa o multi-token en llama.cpp.
- Análisis comparativo de cuantizaciones: comparar IQ2_XS-mtp frente a IQ3_S-mtp para medir cuánto sobrevive la edición CHiPS al recuantizar, ya que el autor advierte que el comportamiento puede diferir.

## Benchmarks y rendimiento

Todos los datos corresponden al fichero IQ2_XS-mtp, medidos una sola vez por conjunto, con las mismas semillas y ajustes que el original verificado por SHA-256.

| Prueba | Original | Este modelo |
|---|---|---|
| Frases de rechazo, peticiones dañinas (104) | 93,3 % | 2,9 % |
| Frases de rechazo, peticiones inofensivas (100) | 2 % | 2 % |
| Bucles, dañinas / inofensivas | 0 % / 0 % | 0 % / 0 % |
| Respuestas vacías, dañinas / inofensivas | 0 % / 1 % | 0 % / 2 % |
| Alcanzó el límite de tokens (1.536), dañinas / inofensivas | 0 % / 1 % | 13,5 % / 2 % |
| Tokens medios, dañinas / inofensivas | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzó límite (3.072 tokens) | 20,8 % (5/24) | 12,5 % (3/24) |
| Tareas largas: bucles de periodo corto | 4,2 % (1/24) | 0 % |
| Tareas largas: respuestas vacías | 12,5 % (3/24) | 4,2 % (1/24) |
| Tareas largas: tokens medios | 1.961 | 1.909 |
| Tool calling: llamada esperada / nombre correcto / argumentos completos | 100 % / 100 % / 100 % | 100 % / 100 % / 100 % |
| Tool calling: sin llamada cuando no se necesita | 90 % (9/10) | 100 % (10/10) |
| Tool calling: continúa tras resultado | 100 % | 100 % |
| GSM8K (250 preguntas): precisión | 94,8 % (237) | 94,0 % (235) |
| GSM8K: aciertos solo en este fichero | 4 | 2 |
| GSM8K: alcanzó límite (4.096 tokens) | 0 % | 0 % |
| GSM8K: tokens medios | 330 | 336 |
| MMLU-Pro (300 preguntas): precisión | 73,7 % (221) | 73,7 % (221) |
| MMLU-Pro: aciertos solo en este fichero | 19 | 19 |
| MMLU-Pro: alcanzó límite (4.096 tokens) | 8,3 % (25) | 10,7 % (32) |
| MMLU-Pro: tokens medios | 1.290 | 1.320 |

Las diferencias de precisión quedan dentro de la variabilidad del muestreo (McNemar bilateral exacto: p = 0,69 en GSM8K, p = 1,00 en MMLU-Pro). El fichero IQ3_S-mtp no fue evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB para IQ2_XS-mtp (8,77 GB de pesos) y 12-13 GB para IQ3_S-mtp (12,12 GB de pesos), más overhead de contexto KV.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) alojan ambos ficheros con contexto amplio. Para IQ3_S-mtp con contexto largo, una A100 o H100 ofrecen margen adicional.
- Cabe en GPU consumer: sí, ambas cuantizaciones caben en GPUs de 16 GB o más; IQ2_XS-mtp puede ajustarse en 12 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), y por extensión servidores compatibles con GGUF como Ollama o llama-server. Compatible con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K / MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (IQ2_XS-mtp) | 27.320.697.856 | no disponible | 94,0 % / 73,7 % | swift-open-license-1.0 | GGUF |
| Swift 1.5 Qwen3.8-27B GSQ-RCO (original IQ2_XS-mtp) | 27.320.697.856 | no disponible | 94,8 % / 73,7 % | swift-open-license-1.0 | GGUF |
| Swift 1.5 Qwen3.8-27B GSQ-RCO (original IQ3_S-mtp) | 27.320.697.856 | no disponible | no evaluado | swift-open-license-1.0 | GGUF |
| Este modelo (IQ3_S-mtp) | 27.320.697.856 | no disponible | no evaluado | swift-open-license-1.0 | GGUF |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es una versión "uncensored": reduce deliberadamente los rechazos ante peticiones dañinas (del 93,3 % al 2,9 %), lo que lo hace inadecuado para despliegues en producción sin filtros externos de seguridad.
- El 13,5 % de las respuestas a peticiones dañinas alcanzó el límite de 1.536 tokens, frente al 0 % del original; se requiere aumentar `max_tokens` para respuestas completas.
- El 10,7 % de las preguntas de MMLU-Pro alcanzó el límite de 4.096 tokens (frente al 8,3 % del original), lo que puede truncar respuestas en tareas de razonamiento difíciles.
- La receta de CHiPS no está publicada, por lo que la edición no es reproducible ni auditable.
- El fichero IQ3_S-mtp no fue evaluado; el autor advierte que la recuantización puede alterar cuánto de la edición sobrevive, por lo que su comportamiento puede diferir del IQ2_XS-mtp.
- No es una versión oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab, y estas entidades no lo respaldan.
- No incluye proyector de visión y la visión no se probó.
- La lista de idiomas soportados no está declarada; las evaluaciones se limitaron a inglés y japonés.
- Los conjuntos de peticiones dañinas e inofensivas no están publicados, lo que impide verificar los resultados de forma independiente.
- Cada conjunto se evaluó una sola vez, sin repeticiones, por lo que las diferencias de uno o dos casos quedan dentro de la variabilidad del muestreo.
- La licencia swift-open-license-1.0 se etiqueta como `other`; es necesario revisar `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-MTP-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Matriz de importancia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Paper referenciado (arxiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arxiv:2605.00649): https://arxiv.org/abs/2605.00649
