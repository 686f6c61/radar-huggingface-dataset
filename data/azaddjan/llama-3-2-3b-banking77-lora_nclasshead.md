# AzadDjan/Llama-3.2-3B-banking77-lora_nclasshead

## Resumen

Llama-3.2-3B-banking77-lora_nclasshead es un adaptador LoRA (PEFT) publicado por el usuario AzadDjan sobre el modelo base meta-llama/Llama-3.2-3B, ajustado para clasificación de intenciones en el dominio bancario. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo, y su pipeline declarado en HuggingFace es text-generation aunque la tarea real evaluada sea text-classification sobre el dataset PolyAI/banking77 (77 intenciones de atención al cliente bancaria).

El interés práctico del modelo reside en su enfoque: en lugar de entrenar un encoder discriminativo clásico (BERT, DistilBERT), el autor ajusta un LLM decoder de 3.200 millones de parámetros para que complete el nombre de la intención tras un prompt fijo, obteniendo un 92,76 % de accuracy y un 92,93 % de macro F1 en el split de test según los resultados declarados en su model card (no verificados). Esto lo convierte en un ejemplo de clasificación generativa con un LLM pequeño, aprovechando la ventana de contexto de 128.000 tokens del modelo base y su capacidad de seguir instrucciones.

Se trata de un artefacto de investigación con nula tracción en la comunidad (0 descargas, 0 likes en el momento de redactar esta ficha) y documentación mínima: la model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento. Su relevancia es, por tanto, acotada: sirve como referencia reproducible de un ajuste LoRA para clasificación de intenciones sobre un LLM decoder, pero no como componente listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA/PEFT; el nombre del repositorio sugiere una cabeza de clasificación ("nclasshead"), pero la model card no la documenta |
| Parámetros totales | 3.200 millones en el modelo base; el adaptador añade un número de parámetros entrenables no especificado (repositorio de 0,2 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 3B; no se documenta si el ajuste reduce o restringe la ventana |
| Tipos de cuantización | no disponible en la model card; el adaptador se distribuye en safetensors y puede combinarse con el base cuantizado en 8 o 4 bits tras el merge |
| Idiomas soportados | no disponible para el adaptador; el dataset Banking77 es monolingüe en inglés. El modelo base declara soporte para 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |
| Librería | peft (framework de referencia: PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.23.1) |
| Dataset de ajuste | PolyAI/banking77 |
| Formato de prompt | `Classify the banking customer message into one intent.` + salto de línea + `Message: {text}` + salto de línea + `Intent:`; el modelo completa con ` {nombre_intencion}<|end_of_text|>` |

## Arquitectura y entrenamiento

El modelo es un ajuste por LoRA (Low-Rank Adaptation) sobre meta-llama/Llama-3.2-3B, un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU, RoPE y atención con grouped-query attention (GQA), que reduce el tamaño de la caché KV. El adaptador se aplica sobre el modelo congelado y, según el sufijo "nclasshead" del nombre, probablemente incorpora algún tipo de cabeza o proyección sobre las 77 clases, si bien este extremo no está documentado en la model card. La evaluación reportada se realiza de forma generativa con decodificación greedy: el modelo emite el nombre de la intención como texto.

Los hiperparámetros de entrenamiento declarados son: learning rate 1e-4, tamaño de lote de entrenamiento 16 con 2 pasos de acumulación (lote efectivo 32), tamaño de lote de evaluación 32, semilla 42, optimizador AdamW (variante torch fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 20 épocas. La tabla de resultados de la model card solo muestra 6 épocas: la mejor pérdida de validación (0,0615) y el mejor exact match (0,9271) se alcanzan en la época 3, y a partir de ahí la pérdida de validación empeora (0,0724 en la época 4; 0,0854 en la 5; 0,0890 en la 6) mientras la pérdida de entrenamiento sigue bajando (de 0,0153 a 0,0074), lo que indica sobreajuste a partir de la tercera época. No se documenta el rango de LoRA, los módulos objetivo, el número de tokens de entrenamiento, la composición del dataset más allá de Banking77 ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificación de intenciones en el dominio bancario: asignar uno de los 77 intents de Banking77 a un mensaje de cliente (por ejemplo, "card_arrival", "lost_or_stolen_card", "top_up_failed").
- Generación de texto restringida a la tarea: el prompt fijo induce la emisión del nombre de la intención seguido del token de fin de secuencia.
- Clasificación generativa con decodificación greedy: no requiere una cabeza de clasificación separada en el momento de la inferencia si se usa el prompt documentado.
- Ventana de contexto larga heredada del base (hasta 128.000 tokens), aunque no se ha validado el rendimiento con prompts largos ni con múltiples ejemplos.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, ni modo de pensamiento (thinking) en la información proporcionada.
- Capacidad multilingüe: no demostrada; el dataset de ajuste es en inglés y no se han publicado evaluaciones en otros idiomas.

## Casos de uso

- Enrutado de tickets de soporte bancario: clasificar cada mensaje entrante en una de las 77 intenciones y dirigirlo a la cola o al equipo especializado correspondiente (tarjetas, transferencias, comisiones), sustituyendo o complementando reglas basadas en palabras clave.
- Primera etapa de un sistema de dos niveles: usar este clasificador para las consultas frecuentes y bien definidas, y derivar únicamente las que requieran respuesta generativa a un LLM mayor, reduciendo coste por consulta y latencia media.
- Gestión de diálogo en un chatbot bancario: predecir la intención de cada turno del usuario para seleccionar la plantilla de respuesta o la API interna que debe invocarse (por ejemplo, consultar el estado de una tarjeta o el límite de una transferencia).
- Etiquetado retrospectivo de históricos de atención al cliente: procesar por lotes conversaciones y correos ya archivados para construir series temporales de intenciones, detectar picos de incidencias y alimentar cuadros de mando de producto.
- Filtrado y priorización con umbral de confianza: derivar a un agente humano los casos en los que la distribución de probabilidad sobre las intenciones sea ambigua, siempre que se instrumente una estimación de confianza sobre la salida generativa.
- Análisis de transcripciones de llamadas: aplicar el clasificador a la salida de un sistema ASR para categorizar motivos de contacto en un contact center, teniendo en cuenta que el texto de entrada presenta errores de transcripción no vistos en el entrenamiento.
- Evaluación comparativa de métodos de clasificación: servir como referencia de "clasificación generativa con LLM de 3B" frente a encoders pequeños, para decidir si merece la pena el coste computacional adicional en un caso de uso concreto.
- Destilación a un modelo de producción: usar las predicciones de este adaptador sobre datos no etiquetados para generar etiquetas y entrenar después un encoder tipo BERT mucho más barato de desplegar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para la tarea "Intent Classification (generative, greedy)" sobre el split de test de PolyAI/banking77. Todos ellos figuran como no verificados (`verified: false`).

| Métrica | Valor | Dataset / split | Verificado |
|---|---|---|---|
| Accuracy | 0,9276 (92,76 %) | Banking77 / test | No |
| Macro F1 | 0,9293 (92,93 %) | Banking77 / test | No |
| Macro Precision | 0,9341 (93,41 %) | Banking77 / test | No |
| Macro Recall | 0,9276 (92,76 %) | Banking77 / test | No |

Resultados de validación por época reportados en la model card (pérdida de entrenamiento, pérdida de validación y exact match):

| Época | Paso | Training loss | Validation loss | Exact match |
|---|---|---|---|---|
| 1,0 | 282 | 0,0929 | 0,0978 | 0,8721 |
| 2,0 | 564 | 0,0501 | 0,0698 | 0,9181 |
| 3,0 | 846 | 0,0293 | 0,0615 | 0,9271 |
| 4,0 | 1128 | 0,0153 | 0,0724 | 0,9241 |
| 5,0 | 1410 | 0,0097 | 0,0854 | 0,9151 |
| 6,0 | 1692 | 0,0074 | 0,0890 | 0,9251 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni evaluaciones multilingües), ni comparaciones directas contra otros modelos sobre el mismo dataset.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar el modelo base Llama 3.2 3B, lo que domina el consumo de memoria.
- VRAM estimada para inferencia (modelo base, sin contar el adaptador, que es despreciable en comparación): aproximadamente 6,4 GB en fp16/bf16; en torno a 3,5 GB en cuantización de 8 bits; en torno a 2,2-2,5 GB en cuantización de 4 bits (NF4/GPTQ/AWQ). Añadir la caché KV: con GQA (8 cabezas KV, 28 capas) el coste es de unos 0,11 MB por token, es decir, aproximadamente 60 MB para prompts de 512 tokens.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con 12-24 GB sin problemas en fp16; tarjetas de 6-8 GB (RTX 3050, RTX 4060) pueden ejecutarlo únicamente con cuantización de 4 bits y contextos cortos. En Apple Silicon, basta con 16 GB de memoria unificada en fp16 y 8-10 GB en 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A10G funcionan sin limitaciones, aunque están sobredimensionadas para un modelo de 3B; su interés sería el procesamiento por lotes a gran escala.
- Opciones de despliegue: transformers + peft como referencia; vLLM con soporte de adaptadores LoRA (`--enable-lora`) para servir varias tareas sobre un mismo base; TGI con LoRA; llama.cpp u Ollama tras fusionar el adaptador con el base (merge) y convertir a GGUF; en cualquier caso, para clasificación conviene fijar el prompt exacto documentado y truncar la generación al nombre de la intención más el token de fin de secuencia.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de una generación muy corta (el nombre de la intención y el token EOS), la latencia vendrá dominada por el preprocesado del prompt y no por la decodificación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy en Banking77 (test) | Licencia |
|---|---|---|---|---|---|
| Llama-3.2-3B-banking77-lora_nclasshead | LoRA sobre LLM decoder | 3,2 B + adaptador | 128.000 tokens (base) | 92,76 % (declarado, no verificado) | Llama 3.2 Community License |
| Encoder tipo BERT-base ajustado en Banking77 | Encoder discriminativo | ~110 M | 512 tokens | no disponible en esta ficha | Apache 2.0 (modelo base) |
| Encoder tipo DistilBERT ajustado en Banking77 | Encoder discriminativo | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 (modelo base) |
| Ajuste LoRA sobre Llama 3.2 1B para Banking77 | LoRA sobre LLM decoder | 1,24 B + adaptador | 128.000 tokens (base) | no disponible | Llama 3.2 Community License |
| LLM propietario en modo few-shot vía API | API cerrada | no disponible | variable | no disponible | propietaria |

Solo se dispone de cifras verificables para este adaptador. La comparación con encoders pequeños es la más relevante en términos prácticos: un encoder de 66-110 millones de parámetros ocupa dos órdenes de magnitud menos de memoria y ofrece latencias muy inferiores por petición, por lo que la ventaja de este adaptador habría que justificarla en precisión, en la ausencia de una cabeza de clasificación específica, o en la posibilidad de reutilizar el mismo modelo base para otras tareas con distintos adaptadores LoRA servidos simultáneamente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al estar ajustado sobre un único dataset (Banking77, en inglés y con un catálogo cerrado de intenciones), hereda la distribución y los sesgos de ese corpus.
- Riesgo de alucinación: en el modo generativo, el modelo podría emitir un nombre de intención que no pertenezca a las 77 clases del catálogo, especialmente ante entradas fuera de dominio. No se documenta ningún mecanismo de restricción de vocabulario ni umbral de rechazo para consultas fuera de alcance.
- Limitación de idioma: el ajuste se ha realizado sobre datos en inglés; no hay evaluación en español ni en el resto de idiomas del base, por lo que su uso en atención al cliente en castellano no está respaldado por ninguna métrica.
- Sobreajuste: la pérdida de validación mínima se alcanza en la época 3 (0,0615) y aumenta en las épocas 4, 5 y 6, mientras la pérdida de entrenamiento sigue descendiendo. No se indica qué punto de control corresponde al adaptador publicado.
- Inconsistencia documental: los hiperparámetros declaran 20 épocas, pero la tabla de resultados solo muestra 6. Además, la model card contiene secciones sin completar ("Model description", "Intended uses & limitations", "Training and evaluation data", todas con "More information needed").
- Métricas no verificadas: los cuatro valores de benchmark figuran con `verified: false` y no se especifica el procedimiento exacto de extracción de la intención ni el manejo de respuestas inválidas.
- Reproducibilidad limitada: no se documentan el rango de LoRA, los módulos objetivo, la técnica de inicialización ni la composición exacta del conjunto de entrenamiento, lo que impide reproducir el ajuste de forma fiel.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, no una licencia permisiva. Entre otras condiciones, exige mantener la atribución "Built with Llama", incluir una copia de la licencia, que los modelos derivados lleven "Llama" al principio del nombre y mencionen "Llama 3.2", y cumplir la política de uso aceptable. Existe un umbral de usuarios activos mensuales (700 millones) por encima del cual se necesita una licencia específica de Meta.
- Dependencia del modelo base: el uso requiere aceptar las condiciones de acceso del repositorio meta-llama/Llama-3.2-3B, que está restringido (gated).
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin revisión independiente de los resultados.
- Formato de prompt rígido: el rendimiento declarado se obtiene con una plantilla concreta; cualquier variación (idioma del prompt, formato de chat, few-shot) puede degradar la precisión de forma no medida.
- Para producción: no se recomienda su despliegue directo sin una evaluación propia sobre datos representativos del dominio objetivo, control de salidas fuera de catálogo y una comparación de coste frente a un encoder pequeño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzadDjan/Llama-3.2-3B-banking77-lora_nclasshead
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset de ajuste (Banking77): https://huggingface.co/datasets/PolyAI/banking77
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Anuncio de Llama 3.2 (blog de Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Librería PEFT: https://github.com/huggingface/peft
- Artículo que introduce Banking77, "Efficient Intent Detection with Dual Sentence Encoders" (Casanueva et al., 2020): https://arxiv.org/abs/2003.04807
- Artículo técnico de la familia Llama 3, "The Llama 3 Herd of Models": https://arxiv.org/abs/2407.21783

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a un generador de códigos QR y no guardan relación con la ficha, por lo que se han omitido.
