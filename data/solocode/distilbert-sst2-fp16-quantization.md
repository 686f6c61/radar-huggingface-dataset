# SoloCode/distilbert-sst2-fp16-quantization

## Resumen

DistilBERT SST-2 FP16 es un checkpoint de clasificación de texto publicado por el usuario SoloCode en HuggingFace. Se trata de una conversión a precisión FP16 del conocido `distilbert/distilbert-base-uncased-finetuned-sst-2-english`, un transformer encoder destilado de BERT y ajustado para análisis de sentimiento binario (positivo/negativo) sobre el corpus SST-2 en inglés. El modelo tiene 66.955.010 parámetros y un artefacto serializado de 133,95 MB en formato safetensors.

El propósito declarado no es ofrecer un modelo nuevo, sino servir como pieza de un proyecto de comparación de cuantizaciones: el autor publica el punto FP16 junto a una evaluación controlada (512 ejemplos del subconjunto de validación de SST-2 con semilla fija) y una medición de latencia en CPU. Los resultados reportados indican una accuracy del 90,82% y una variación de 0,000 puntos porcentuales respecto a la línea base FP32 en ese mismo subconjunto, es decir, la conversión a FP16 no degradó la métrica medida.

Es relevante ahora como referencia reproducible para quien quiera medir el efecto real de reducir precisión en tareas de clasificación: el autor advierte explícitamente de que, en su banco de pruebas en CPU, FP16 fue más lento que FP32, un recordatorio de que la ganancia de FP16 depende del hardware (GPU con tensor cores) y no es universal. El repositorio no tiene descargas ni likes en el momento de la consulta y no incluye enlaces al informe metodológico completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilación de BERT); desglose de capas y dimensión oculta no disponible en la información proporcionada |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base es de tipo DistilBERT y la ventana máxima no se especifica en la información proporcionada |
| Tipos de cuantización | FP16 (checkpoint publicado); línea base FP32 utilizada en la comparación |
| Idiomas soportados | Inglés (clasificación de sentimiento sobre texto en inglés); lista formal de idiomas no declarada en los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño serializado: 133,95 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT, resultado de destilar BERT en un modelo más pequeño, posteriormente ajustado para clasificación de secuencias con dos etiquetas (negativo/positivo) sobre SST-2. La cabeza de clasificación es de tipo `AutoModelForSequenceClassification` y el pipeline declarado es `text-classification`. El checkpoint publicado no introduce entrenamiento nuevo: es una conversión de precisión de los pesos del modelo base `distilbert-base-uncased-finetuned-sst-2-english`.

La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se detalla el procedimiento exacto de conversión a FP16 ni si se aplicó calibración. La evaluación reportada usa 512 ejemplos del subconjunto de validación de SST-2 con semilla fija (seed 42), en un entorno PyTorch 2.13.0+cpu.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con salida de logits y etiquetas del conjunto SST-2.
- Encoder reutilizable para extracción de representaciones contextuales (uso como backbone de features), aunque no es la función declarada del checkpoint.
- Inferencia en CPU y en GPU; el autor publica una medición de latencia en CPU.
- Compatible con la librería `transformers` y con el ecosistema de endpoints (`endpoints_compatible`) y `text-embeddings-inference` según los tags del repositorio.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; el modelo base está ajustado sobre un corpus en inglés y la model card describe la tarea como clasificación de texto en inglés.

## Casos de uso

- Análisis de sentimiento a gran escala sobre reseñas y comentarios de producto: el modelo emite una etiqueta binaria por documento con un coste computacional bajo (66,9 M de parámetros), adecuado para procesar lotes grandes en CPU o en una única GPU de gama media.
- Enrutado y priorización de tickets de soporte: clasificar el tono del mensaje entrante para dirigir automáticamente casos negativos a colas de atención prioritaria, usando el clasificador como primer filtro antes de modelos mayores.
- Monitorización de reputación de marca en redes sociales: puntuar menciones en inglés y agregar series temporales de sentimiento por producto o campaña.
- Filtrado previo en pipelines de moderación: descartar o marcar contenido con tono marcadamente negativo antes de pasar a un modelo generativo más costoso, reduciendo el gasto de inferencia.
- Etiquetado asistido para curación de datasets: preetiquetar grandes volúmenes de texto en inglés que luego se revisan por anotadores humanos, aprovechando que la conversión a FP16 no alteró la accuracy medida en el subconjunto evaluado.
- Referencia experimental en estudios de cuantización: servir como punto FP16 de una comparativa reproducible frente a FP32, INT8 u otras precisiones, con la salvedad de que el propio autor documenta que en su entorno CPU FP16 resultó más lento.
- Despliegue en entornos con memoria limitada: el artefacto de 133,95 MB permite incluirlo en contenedores pequeños o dispositivos con pocos recursos, siempre que la tarea sea exclusivamente clasificación binaria en inglés.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre 512 ejemplos del subconjunto de validación de SST-2 con semilla fija, PyTorch 2.13.0+cpu, seed 42):

| Métrica | Resultado |
|---|---|
| Accuracy (FP16) | 90,82% |
| Variación respecto a FP32 | 0,000 puntos porcentuales |
| Tamaño del artefacto serializado | 133,95 MB |
| Latencia medida | 497,2 ms/ejemplo en CPU |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni comparaciones numéricas con modelos alternativos. El autor advierte de que la latencia corresponde a su banco de pruebas en CPU y no constituye una afirmación general de velocidad; en esa ejecución FP16 fue más lento que la línea base FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB incluyendo pesos y activaciones para lotes pequeños; los pesos FP16 ocupan aproximadamente 134 MB y los FP32 en torno a 268 MB (calculado a partir del recuento de parámetros).
- GPU recomendadas: no se requieren aceleradores de gama alta; cualquier GPU con soporte FP16 (serie RTX 20/30/40, A10, L4, A100, H100) puede ejecutar el modelo con un uso de memoria mínimo. La ventaja de FP16 sobre FP32 solo se materializa en hardware que acelere operaciones de media precisión.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o superiores; también en iGPU y en CPU exclusivamente, dado el tamaño reducido.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `pipeline` de clasificación de texto, y los tags del repositorio sugieren compatibilidad con `text-embeddings-inference` y endpoints de HuggingFace. Soporte en vLLM, llama.cpp u Ollama no confirmado en la información disponible; llama.cpp no es la vía natural para un encoder de clasificación.
- Latencia y throughput: 497,2 ms por ejemplo en CPU según la medición del autor; no hay datos publicados de throughput en GPU ni de latencia para lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Tamaño | Accuracy en el subconjunto evaluado | Licencia |
|---|---|---|---|---|---|
| SoloCode/distilbert-sst2-fp16-quantization | 66.955.010 | FP16 | 133,95 MB | 90,82% (512 ejemplos) | Apache 2.0 |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english (base) | 66.955.010 (misma arquitectura de origen) | FP32 | No disponible en la información proporcionada | 90,82% (misma referencia, variación de 0,000 pp) | Apache 2.0 |
| Otras alternativas de clasificación de sentimiento (RoBERTa, DeBERTa, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado métricas de benchmark de modelos alternativos, por lo que la comparación cuantitativa con otras familias queda limitada al par FP16/FP32 del mismo autor.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación binaria: no genera texto, no soporta tool calling ni razonamiento multi-paso; cualquier caso de uso generativo requiere otro modelo.
- Idioma: ajustado sobre SST-2 en inglés; el rendimiento fuera del inglés o en dominios distintos de reseñas (texto técnico, jurídico, jerga) no está evaluado.
- Ventana de contexto no documentada en la model card; los textos que excedan la longitud máxima del tokenizador se truncarán sin aviso explícito.
- Evaluación reducida: 512 ejemplos de un único subconjunto de validación; el intervalo de confianza de esa accuracy es amplio y no cubre otros dominios ni otras distribuciones.
- Sesgos heredados del corpus SST-2 y del modelo base (reseñas de cine en inglés, principalmente), con riesgo de degradación por cambio de dominio y de sesgos léxicos aprendidos del corpus original.
- La tarea de clasificación de sentimiento no produce salidas calibradas por defecto; para umbrales en producción conviene validar la calibración de probabilidades.
- Advertencia de rendimiento del propio autor: en su banco de pruebas en CPU, FP16 fue más lento que FP32; no asumir ganancias de velocidad sin medir en el hardware objetivo.
- Repositorio sin tracción (0 descargas, 0 likes) y sin informe metodológico enlazado en la model card; tratar el checkpoint como experimental.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda revisar la licencia y la model card del modelo del que deriva antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoloCode/distilbert-sst2-fp16-quantization
- Modelo base del que deriva: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Repositorio del proyecto de comparación de cuantizaciones e informe metodológico: no disponible (la model card lo menciona pero no incluye enlace)
- Paper, blog o demo adicionales: no disponible
