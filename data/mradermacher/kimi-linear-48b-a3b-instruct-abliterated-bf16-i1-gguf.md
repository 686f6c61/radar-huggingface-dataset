# mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-i1-GGUF

## Resumen

Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-i1-GGUF es una cuantización GGUF del modelo Kimi-Linear-48B-A3B-Instruct en su variante "abliterated", publicada por el usuario mradermacher. El modelo original es un transformer de tipo mezcla de expertos (MoE) desarrollado por Moonshot AI, con aproximadamente 49.100 millones de parámetros totales y 3.000 millones de parámetros activos por token (designación A3B). Esta versión concreta es una derivación sin censura ("abliterated") del checkpoint base de ashwin-sreedhar, convertida a formato GGUF con cuantizaciones ponderadas por matriz de importancia (imatrix) para facilitar su ejecución en hardware de consumo.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE de gran tamaño con activación reducida, una ventana de contexto de 1 millón de tokens propia de la familia Kimi Linear, y una variante alineada sin los rechazos típicos de los modelos instruct estándar. El resultado es un modelo orientado a generación conversacional y razonamiento de contexto largo, distribuido bajo licencia MIT y con pesos en formato GGUF para su uso con llama.cpp y derivados.

No obstante, conviene subrayar que esta publicación es una cuantización comunitaria de un derivado no oficial, no el modelo original de Moonshot AI. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada en la model card, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), variante Kimi Linear |
| Parametros totales | 49.122.681.728 (~49,1 mil millones) |
| Parametros activos | ~3 mil millones (designación A3B) |
| Longitud de contexto | no disponible en la model card (la familia Kimi Linear declara hasta 1M de tokens en el modelo original) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, entre otras |
| Idiomas soportados | inglés (según etiqueta `language: en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en bf16 safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Kimi Linear de Moonshot AI, que emplea una arquitectura transformer con atención lineal y mezcla de expertos. La designación 48B-A3B indica 48 mil millones de parámetros totales con 3 mil millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La variante "abliterated" ha sido sometida a un proceso de modificación de direcciones de rechazo en el espacio de activaciones, orientado a eliminar las negativas del modelo a responder determinadas peticiones.

En cuanto a los datos de entrenamiento, número de tokens, composición del dataset y uso de RLHF o DPO, la model card de esta cuantización no aporta información. Tampoco se documentan innovaciones específicas de decodificación o atención más allá de la propia arquitectura Kimi Linear del modelo original. La model card de mradermacher se limita a describir el proceso de cuantización con imatrix (versión 2 del formato de cuantización, conversión desde HuggingFace, tensor quantised) y a listar los ficheros GGUF generados.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a instrucciones (sufijo Instruct).
- Razonamiento y respuesta a preguntas en inglés, idioma principal declarado.
- Capacidad de contexto largo heredada de la arquitectura Kimi Linear (hasta 1M de tokens en el modelo original, no confirmado en esta cuantización).
- Soporte de function calling / tool calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo es exclusivamente de texto.
- Variante abliterated: responde sin los rechazos habituales del modelo instruct original, lo que amplía el rango de peticiones aceptadas.

## Casos de uso

- Generación de texto creativo sin restricciones temáticas: la variante abliterated permite escribir ficción, guiones o contenido narrativo que el modelo instruct original rechazaría por políticas de seguridad, siempre que el usuario asuma la responsabilidad legal y ética del contenido generado.
- Procesamiento de documentos largos en inglés: si se confirma la ventana de contexto extendida de la familia Kimi Linear, el modelo podría resumir o extraer información de contratos, informes o artículos de decenas de miles de tokens en una sola pasada, algo inviable en modelos con contexto de 8K o 32K.
- Asistente conversacional autoalojado: con cuantizaciones Q4_K_M de ~30 GB, puede desplegarse en una estación de trabajo con 32-48 GB de VRAM o en configuraciones multi-GPU de consumo, ofreciendo una alternativa privada a APIs comerciales.
- Experimentación en investigación sobre alineación y seguridad: la versión abliterated es útil para estudiar cómo cambia el comportamiento del modelo al eliminar las direcciones de rechazo, comparando respuestas con el checkpoint original.
- Evaluación de arquitecturas MoE de activación reducida: con solo ~3B parámetros activos, permite medir el equilibrio entre calidad y coste computacional frente a modelos densos de tamaño comparable en tareas de razonamiento.
- Base para ajuste fino (fine-tuning) sobre dominio específico: al estar bajo licencia MIT y en formato GGUF, sirve como punto de partida para adaptaciones con LoRA o QLoRA en entornos con recursos limitados, aunque la conversión a otros formatos requerirá partir del checkpoint bf16 original.
- Inferencia en local con llama.cpp u Ollama: los ficheros GGUF permiten ejecutar el modelo en CPU con RAM suficiente o en GPU de consumo, sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se dispone de datos del checkpoint base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-IQ1_S ~10,2 GB; i1-IQ2_M ~16,2 GB; i1-IQ3_S ~21,4 GB; i1-IQ4_XS ~26,4 GB; i1-Q4_K_M ~29,8 GB; i1-Q5_K_M ~35 GB (estimado a partir del tamaño del fichero); i1-Q6_K ~40 GB (estimado); bf16 completo ~98 GB (estimado a partir de 49,1B parámetros).
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 4090 (24 GB) resulta insuficiente en solitario; se requiere RTX 3090/4090 en configuración dual, A6000 (48 GB), A100 40/80 GB o H100. Para cuantizaciones IQ2/IQ3, una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo con contexto reducido.
- Cabe en GPU de consumo: sí, en cuantizaciones IQ1/IQ2/IQ3 con 24 GB de VRAM, a costa de degradación de calidad; las cuantizaciones Q4 o superiores requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el checkpoint bf16 original, vLLM o TGI si la arquitectura es compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia arquitectónica, los ~3B parámetros activos por token deberían ofrecer un throughput notablemente superior al de un modelo denso de 48B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct-abliterated (esta ficha) | ~49,1B | ~3B | no disponible (hasta 1M en el original) | MIT | GGUF, bf16 |
| Kimi-Linear-48B-A3B-Instruct (original Moonshot AI) | ~49,1B | ~3B | hasta 1M (según familia) | no disponible en esta ficha | safetensors |
| Modelos MoE de activación reducida de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Es una cuantización comunitaria de un derivado no oficial: no procede directamente de Moonshot AI y puede contener degradaciones respecto al checkpoint bf16 original, especialmente en cuantizaciones IQ1 e IQ2.
- La variante abliterated elimina los rechazos de seguridad del modelo instruct, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; no es apta para despliegues públicos sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual para esta variante.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: aunque la familia Kimi Linear declara hasta 1M de tokens, la model card de esta cuantización no confirma la longitud efectiva soportada en formato GGUF, que puede verse reducida por limitaciones del runtime.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo en su jurisdicción.
- El repositorio ocupa 518,7 GB, lo que exige espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- No se documentan sesgos específicos ni evaluaciones de seguridad para esta variante.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-i1-GGUF
- Modelo base (checkpoint abliterated bf16): https://huggingface.co/ashwin-sreedhar/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kimi-Linear-48B-A3B-Instruct-abliterated-bf16-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
