# mradermacher/Earlybird-fast-GGUF

## Resumen

Earlybird-fast-GGUF es la versión cuantizada en formato GGUF del modelo noumenon-labs/Earlybird, un clasificador de texto especializado en la detección de contenido generado por inteligencia artificial. El modelo original es un transformer encoder de tipo RoBERTa/DistilRoBERTa con 82.118.402 parámetros, entrenado sobre el dataset noumenon-labs/Mega-WORM-Cleaned y orientado a la tarea de discriminación entre texto humano y texto sintético. Esta versión GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y permite ejecutar el clasificador en entornos con llama.cpp y derivados sin necesidad de GPU dedicada.

La relevancia de este modelo radica en su tamaño reducido (el repositorio completo ocupa 0,9 GB y las cuantizaciones rondan los 0,2 GB) y en su licencia MIT, lo que lo hace apto para integrarse en pipelines de moderación de contenido, verificación de autoría y filtrado de datos de entrenamiento. Al ser un clasificador y no un modelo generativo, su función es asignar una etiqueta o puntuación a un texto de entrada, lo que encaja en arquitecturas de detección a gran escala donde el coste por inferencia y la latencia son críticos.

El modelo está pensado exclusivamente para inglés y se distribuye en múltiples cuantizaciones GGUF (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16), lo que cubre desde despliegues en CPU de bajos recursos hasta inferencia de alta fidelidad. Esta ficha describe la versión cuantizada y remite al modelo base cuando un dato no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa/DistilRoBERTa (text-classification) |
| Parametros totales | 82.118.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (versión cuantizada); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base noumenon-labs/Earlybird es un transformer encoder de la familia RoBERTa/DistilRoBERTa, según los tags de Hugging Face, configurado para la tarea de clasificación de texto (text-classification) y, más específicamente, para detección de texto generado por IA (ai-detection, generated-text-detection, worm). Con 82,1 millones de parámetros, se sitúa en la escala de DistilRoBERTa, lo que implica un coste de inferencia muy bajo en comparación con los modelos generativos contemporáneos. El autor lo etiqueta también con el término "worm" y lo entrena sobre el dataset noumenon-labs/Mega-WORM-Cleaned, aunque no se detalla en la información disponible la composición exacta, el número de tokens ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una cuantización estática generada por mradermacher mediante su pipeline habitual (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2). El autor indica que en el momento de la publicación no había cuantizaciones ponderadas/imatrix disponibles y que no las tiene planificadas, aunque acepta peticiones vía Community Discussion. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que se trata de un encoder clasificador y no de un modelo autoregresivo.

## Capacidades

- Clasificación de texto para detección de contenido generado por IA (ai-detection, generated-text-detection).
- Discriminación entre texto humano y texto sintético en inglés.
- Extracción de características (feature-extraction) según los tags del repositorio.
- Etiquetado de datos para curación de datasets y filtrado de corpus.
- Integración en pipelines de moderación de contenido y verificación de autoría.
- Ejecución en CPU mediante llama.cpp y derivados gracias al formato GGUF.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de contenido en foros y plataformas: el modelo puede puntuar cada mensaje entrante y marcar como sospechosos los textos con alta probabilidad de ser generados por IA, con un coste de inferencia mínimo gracias a sus 82 M de parámetros y a las cuantizaciones de 0,2 GB.
- Curación de datasets de entrenamiento: filtrar corpus web para eliminar texto sintético antes de entrenar modelos generativos, usando la clasificación por lotes en CPU con llama.cpp.
- Verificación de autoría en publicaciones académicas y blogs: integrar el clasificador como paso previo a la revisión humana para priorizar los textos que requieren inspección detallada.
- Detección de spam y granjas de contenido: procesar grandes volúmenes de comentarios o reseñas en pipelines de streaming y descartar automáticamente los que el modelo clasifique como generados.
- Filtrado previo en sistemas de búsqueda y RAG: descartar documentos sintéticos de baja calidad antes de indexarlos en una base de conocimiento, reduciendo ruido y coste de almacenamiento.
- Investigación sobre detección de IA: servir como línea base ligera y reproducible (licencia MIT, pesos GGUF) para comparar con clasificadores más grandes en experimentos académicos.
- Despliegue en dispositivos de borde: al caber en cuantizaciones de 0,2 GB, puede ejecutarse en Raspberry Pi, portátiles sin GPU o contenedores con límites estrictos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; las versiones Q4_K_M y Q5_K_M ocupan aproximadamente 0,2 GB en disco y una fracción similar en memoria al cargar.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso una iGPU moderna pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y en muchas integradas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y servidores compatibles con GGUF; el modelo base puede servirse con transformers y, presumiblemente, con TGI o vLLM para clasificación, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo (82 M de parámetros) se espera una latencia de milisegundos por muestra en CPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Earlybird-fast-GGUF (este) | 82,1 M | no disponible | Detección de texto IA (clasificación) | MIT | GGUF |
| Modelo base noumenon-labs/Earlybird | 82,1 M | no disponible | Detección de texto IA (clasificación) | MIT | safetensors/transformers |
| Clasificadores tipo RoBERTa-base para detección de IA | ~125 M (típico) | 512 tokens (típico) | Detección de texto IA | variable | safetensors, GGUF |
| Detectores comerciales (p. ej., APIs de detección) | no disponible | no disponible | Detección de texto IA | propietaria | API |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo solo soporta inglés; su uso con textos en castellano u otros idiomas no está validado y probablemente produzca resultados poco fiables.
- Al ser un clasificador, puede generar falsos positivos y falsos negativos; no debe usarse como única prueba para acusar a un autor de usar IA.
- No se han publicado métricas de precisión, recall ni F1 en la información disponible, por lo que no es posible evaluar su fiabilidad antes de desplegarlo.
- Riesgo de sesgo derivado del dataset de entrenamiento (Mega-WORM-Cleaned), cuya composición no se detalla; puede sobrerrepresentar ciertos estilos o dominios.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) pueden degradar la calidad de clasificación; se recomienda Q4_K_M o superior para producción.
- No hay cuantizaciones ponderadas/imatrix disponibles según el autor, lo que limita la optimización fina de la calidad por tamaño.
- El repositorio tiene un número muy bajo de descargas (62) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/mradermacher/Earlybird-fast-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Earlybird
- Dataset de entrenamiento: https://huggingface.co/datasets/noumenon-labs/Mega-WORM-Cleaned
- Página de resumen del cuantizador: https://hf.tst.eu/model#Earlybird-fast-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
