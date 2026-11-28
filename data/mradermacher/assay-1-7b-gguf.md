# mradermacher/assay-1.7b-GGUF

## Resumen

Assay 1.7B es un modelo de decisión calibrada desarrollado por Berk y publicado originalmente en Hugging Face como `Berk/assay-1.7b`. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo está orientado a tareas de clasificación de texto y generación de salidas estructuradas, no a la generación libre de texto conversacional.

La propuesta diferencial del modelo es su enfoque en calibración y predicción conforme (*conformal prediction*), técnicas que permiten asociar a cada decisión una medida de incertidumbre estadísticamente válida. Esto lo hace relevante para pipelines de producción donde no basta con una etiqueta, sino que se requiere saber cuándo el modelo es fiable y cuándo debe derivarse la decisión a un humano o a otro sistema.

Con 1.720.574.976 parámetros totales (aproximadamente 1,7 mil millones), el modelo es lo suficientemente pequeño como para desplegarse en una sola GPU de consumo o incluso en CPU con las cuantizaciones adecuadas. La licencia Apache 2.0 facilita su uso comercial, y el formato GGUF lo integra directamente en el ecosistema de inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `Berk/assay-1.7b`, probablemente transformer decoder-only; no confirmado en la información) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 16,0 GB |
| Fecha de creación | 2026-09-21 |
| Descargas | 179 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Berk/assay-1.7b` más allá de su naturaleza como modelo de decisión calibrada. Por el número de parámetros y el pipeline declarado (text-classification), se trata presumiblemente de un transformer de aproximadamente 1,7 mil millones de parámetros ajustado para producir etiquetas o decisiones estructuradas con calibración probabilística. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica declarada es el uso de predicción conforme (*conformal prediction*), un marco estadístico que garantiza coberturas de error bajo supuestos de intercambiabilidad. Esto implica que el modelo no solo emite una decisión, sino que puede acompañarla de conjuntos de predicción con garantías de cobertura. Los tags `calibrated` y `structured-output` refuerzan que el diseño prioriza la fiabilidad de la decisión sobre la fluidez generativa. La cuantización GGUF realizada por mradermacher es estática; según la model card, no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación.

## Capacidades

- Clasificación de texto con salidas calibradas y, presumiblemente, conjuntos de predicción conformes.
- Generación de salidas estructuradas (structured output), adecuada para integración en pipelines que requieren JSON u otros formatos rígidos.
- Modelo de decisión: orientado a emitir etiquetas o veredictos con una medida de confianza asociada.
- Soporte de conversación (tag `conversational`), aunque su pipeline principal es clasificación, no diálogo abierto.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue como servicio.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido con umbral de confianza: el modelo puede clasificar textos como aptos o no aptos y, gracias a la calibración, permitir fijar umbrales que controlen la tasa de falsos negativos derivando los casos inciertos a revisión humana.
- Triaje de tickets de soporte: clasificación automática de incidencias por categoría y prioridad, con conjuntos de predicción conformes que indican cuándo la etiqueta es ambigua y conviene escalar el ticket.
- Filtrado de datos para entrenamiento: uso del modelo para etiquetar grandes volúmenes de texto (calidad, toxicidad, relevancia) con garantías de cobertura estadística antes de incorporarlos a un corpus de entrenamiento.
- Enrutamiento de consultas en un sistema RAG: decidir si una consulta debe responderse con recuperación, con respuesta directa o derivarse a un humano, usando la calibración para evitar enrutamientos erróneos.
- Detección de anomalías en pipelines de datos: clasificación de registros como válidos o sospechosos con umbrales ajustables según el coste del error en cada dominio.
- Validación de salidas estructuradas: verificar que respuestas generadas por otros modelos cumplen un esquema o criterio, aprovechando la naturaleza de decisión del modelo y su bajo coste de inferencia (1,7B parámetros).
- Despliegue en el borde o en CPU: con cuantizaciones Q4_K_M (~1,2 GB) puede ejecutarse en dispositivos con poca memoria para clasificación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0–1,5 GB con cuantizaciones Q3_K_S a Q4_K_M; alrededor de 1,9 GB con Q8_0; unos 3,5 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequeñas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo también puede ejecutarse íntegramente en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM, e incluso en iGPU con memoria unificada usando Q4_K_S o Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque la información no confirma compatibilidad explícita.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1,7B) y las cuantizaciones de ~1,2 GB, se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| assay-1.7b (este) | 1,72B | no disponible | Clasificación calibrada / conformal | Apache 2.0 | GGUF, safetensors |
| Modelos de clasificación tipo DeBERTa-v3-base | ~0,18B | 512 tokens típicamente | Clasificación estándar | MIT / Apache 2.0 | safetensors |
| LLMs pequeños de propósito general (p. ej., Qwen2.5-1.5B) | ~1,5B | 32k tokens típicamente | Generación general | Apache 2.0 | GGUF, safetensors |

La comparación directa es limitada porque assay-1.7b se posiciona como modelo de decisión calibrada, una categoría poco poblada. Frente a clasificadores BERT pequeños, ofrece mayor capacidad de razonamiento y salidas estructuradas a costa de más parámetros; frente a LLMs generalistas del mismo tamaño, su ventaja declarada es la calibración y la predicción conforme, aunque no hay benchmarks públicos que lo confirmen en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- No hay benchmarks publicados en la información disponible, por lo que el rendimiento real en tareas concretas debe validarse empíricamente antes de producción.
- La calibración y la predicción conforme dependen de supuestos de intercambiabilidad entre datos de calibración y datos de producción; si la distribución cambia, las garantías de cobertura pueden no mantenerse.
- Riesgo de alucinación y de clasificaciones erróneas en dominios alejados de los datos de entrenamiento; se recomienda monitorizar y recalibrar periódicamente.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente en inglés puede heredar sesgos culturales y lingüísticos de sus datos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar la model card del modelo base `Berk/assay-1.7b` por si añade restricciones adicionales.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calibración, que es precisamente la propiedad clave del modelo; para producción se recomienda Q4_K_M o superior.
- La información sobre arquitectura, contexto y datos de entrenamiento es escasa; la ficha no puede confirmar detalles técnicos internos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/assay-1.7b-GGUF
- Modelo base: https://huggingface.co/Berk/assay-1.7b
- Página de descargas del cuantizador: https://hf.tst.eu/model#assay-1.7b-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
