# rlondner/qwen36-35b-a3b-acronymes

## Resumen

`rlondner/qwen36-35b-a3b-acronymes` es un ajuste fino (SFT) del modelo abierto Qwen3.6-35B-A3B publicado por el usuario rlondner en Hugging Face. El nombre del repositorio sugiere una especialización en el tratamiento de siglas y acrónimos ("acronymes" en francés), aunque la model card no documenta el conjunto de datos, el idioma ni el objetivo exacto del entrenamiento. El modelo se distribuye en formato safetensors y se ha entrenado con la librería TRL (versión 1.16.0) sobre Transformers 5.21.0 y PyTorch 2.15.0.

El modelo base es un transformer con mezcla de expertos dispersa (MoE) de 35 000 millones de parámetros totales y unos 3000 millones activos por token, con una ventana de contexto nativa de 262 144 tokens (256K), entradas multimodales de texto, imagen y vídeo, y modo de razonamiento integrado. Esa combinación —coste de cómputo por token propio de un modelo de 3B y capacidad de representación de uno de 35B— es lo que hace relevante la familia base para despliegues con requisitos de latencia ajustados.

La relevancia de esta ficha concreta es limitada pero ilustrativa: se trata de un ajuste fino de nicho, sin descargas ni valoraciones en el momento de la consulta, sin licencia declarada de forma efectiva y sin resultados de evaluación publicados. Resulta útil como ejemplo de especialización léxica sobre un MoE grande y como caso de estudio de los riesgos de trazabilidad en fine-tunes de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos dispersa (MoE) heredada de Qwen3.6-35B-A3B; la model card del fine-tune no detalla la arquitectura |
| Parametros totales | 35 000 millones (dato del modelo base; el fine-tune no los declara) |
| Parametros activos | 3000 millones por token (dato del modelo base) |
| Longitud de contexto | 262 144 tokens (256K) en el modelo base; no confirmado para el fine-tune |
| Tipos de cuantizacion | No disponible para este fine-tune; el modelo base cuenta con 14 variantes de cuantizacion segun FitMyLLM |
| Idiomas soportados | No disponibles en la ficha del fine-tune; el modelo base se describe como multilingue |
| Licencia | No disponible: la model card incluye el marcador de posicion `licence: license` sin texto legal |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repositorio: 0,6 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 1.16.0 |
| Version de framework | Transformers 5.21.0, PyTorch 2.15.0, Datasets 5.1.0, Tokenizers 0.23.3 |
| Fecha de creacion | 2026-10-29 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El fine-tune hereda la arquitectura del modelo base: un transformer con mezcla de expertos dispersa, 35 000 millones de parámetros totales y 3000 millones activos por token, con atención sobre una ventana nativa de 262K tokens y soporte multimodal de texto, imagen y vídeo según la documentación pública del base. El modelo incorpora modo de pensamiento con trazas de razonamiento, lo que implica que las respuestas pueden incluir una fase de reasoning antes de la salida final, con el coste de tokens asociado.

El entrenamiento documentado se limita a un SFT con TRL. No se especifican el número de tokens, la composición del dataset, la presencia de RLHF o DPO, ni los hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote). El nombre del repositorio apunta a un corpus de siglas y acrónimos, presumiblemente en francés, pero es una inferencia a partir del nombre y no un dato confirmado. Un detalle técnico relevante: el repositorio ocupa 0,6 GB, muy por debajo de los aproximadamente 70 GB que requerirían los pesos completos en FP16 de un modelo de 35B; esto es compatible con un adaptador tipo LoRA o con un checkpoint parcial, aunque la model card no lo aclara y no aparece ningún `adapter_config.json` entre las etiquetas declaradas.

## Capacidades

- Especialización aparente en expansión, normalización y generación de siglas y acrónimos, deducida del nombre del repositorio y no documentada formalmente.
- Generación de texto y razonamiento en modo thinking, heredados del modelo base Qwen3.6-35B-A3B.
- Generación de código, matemáticas y tareas de agente de múltiples pasos, según las capacidades declaradas del base.
- Soporte de tool calling / function calling en el modelo base; no verificado tras el ajuste fino.
- Capacidad multimodal de entrada (texto, imagen, vídeo) en el base; no se confirma que el fine-tune la conserve.
- Multilingüismo del base (no se detalla la lista de idiomas); el fine-tune podría haber desplazado la distribución hacia el francés.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita el despliegue mediante Inference Endpoints.

## Casos de uso

- Expansión de siglas en documentación técnica corporativa: dado un texto con siglas internas, el modelo devuelve la forma desarrollada y una definición breve, apoyándose en la ventana de 256K del base para procesar manuales completos sin trocear.
- Normalización de glosarios en pipelines ETL: integrado como paso previo a un motor de búsqueda o a un sistema RAG, unifica variantes de siglas (por ejemplo, con y sin puntos, en mayúsculas o minúsculas) antes de la indexación.
- Enriquecimiento de corpus para anotación: el modelo propone candidatos de expansión que un humano valida, reduciendo el coste de construir un diccionario de siglas en dominios como el jurídico o el sanitario.
- Generación inversa de acrónimos: a partir de un nombre de proyecto, producto o taxonomía, el modelo propone acrónimos pronunciables y coherentes con las convenciones del dominio, útil en documentación de arquitectura o naming de servicios.
- Expansión de consultas en buscadores internos: al ampliar siglas en la query del usuario, mejora el recall de motores como Elasticsearch o Solr cuando el usuario teclea solo las iniciales.
- Asistente de documentación multilingüe: si el fine-tune conserva el multilingüismo del base, puede alinear siglas entre francés, inglés y español en fichas de producto o traducciones técnicas.
- Atención al cliente con contexto largo: reutilizando la ventana de 256K del base, gestión de conversaciones multi-turno con historial extenso, siempre que el ajuste no haya degradado la capacidad conversacional general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica y los resultados de búsqueda sobre el modelo base tampoco aportan cifras numéricas comparables (solo referencias genéricas a "21 benchmarks" sin valores). No se dispone, por tanto, de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de expansión de acrónimos para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 35 000 millones de parámetros totales: aproximadamente 70 GB en FP16, unos 35 GB en int8 y entre 18 y 22 GB en cuantización de 4 bits, sin contar la caché KV.
- Advertencia importante: aunque solo se activen 3000 millones de parámetros por token, todos los expertos deben residir en memoria (o descargarse dinámicamente), por lo que el requisito de VRAM viene determinado por los parámetros totales, no por los activos.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o dos RTX 4090 en paralelo para int8; una única RTX 4090 o RTX 3090 de 24 GB para 4 bits con contextos moderados.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080 con cuantización agresiva) solo en 4 bits y con ventanas de contexto reducidas; a 256K tokens la caché KV hace inviable el despliegue en una sola GPU de consumo.
- Opciones de despliegue: vLLM o SGLang para servir el MoE con buen throughput, TGI para entornos Hugging Face, llama.cpp y LM Studio para cuantizaciones GGUF en local (existe una ficha del base en LM Studio Hub), y Ollama para pruebas rápidas si se generan los GGUF.
- Latencia y throughput: no disponibles. Cualitativamente, al activar 3B parámetros por token, la velocidad de decodificación debería aproximarse a la de un modelo denso de 3B, condicionada por el ancho de banda de memoria necesario para recorrer los expertos.
- El repositorio de 0,6 GB no contiene los pesos completos, por lo que para ejecutarlo será necesario combinar este artefacto con el modelo base Qwen/Qwen3.6-35B-A3B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlondner/qwen36-35b-a3b-acronymes | 35B (heredados) | 3B (heredados) | 262K (base) | No disponible | 0 descargas, repo de 0,6 GB |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | No confirmada en la informacion disponible | Modelo abierto, ampliamente distribuido |
| rlondner/qwen35-4b-acronyms | 4B (aproximado por el nombre) | No aplica (denso, presumiblemente) | No disponible | No disponible | Repo de 720 MB, entrenamiento en curso segun la busqueda |

El fine-tune se posiciona frente a su base por la especialización léxica y en contra por la ausencia de licencia, evaluación y descargas. El repositorio hermano `qwen35-4b-acronyms` del mismo autor sugiere una línea de trabajo sobre siglas aplicada a distintas escalas, lo que permitiría comparar coste y calidad entre una variante de 4B y esta de 35B con 3B activos, aunque no hay datos publicados para hacerlo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni métricas de calidad, por lo que se desconoce si el ajuste mejora la tarea objetivo o degrada capacidades generales del base.
- Licencia no declarada: la model card contiene el marcador `licence: license` sin texto legal, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar antes la licencia del modelo base y la del fine-tune.
- Riesgo elevado de alucinación en la tarea objetivo: la expansión de siglas es un problema de recuperación de conocimiento factual; el modelo puede generar desarrollos plausibles pero incorrectos, especialmente en dominios muy específicos.
- Dataset no documentado: se desconoce la composición, el idioma y el volumen de datos de entrenamiento, lo que impide evaluar sesgos, cobertura y riesgo de sobreajuste.
- Tamaño del repositorio (0,6 GB) incompatible con pesos completos: hay que verificar si se trata de un adaptador LoRA, de un checkpoint parcial o de un fallo de publicación; el pipeline de carga con `pipeline()` que muestra la model card podría no funcionar tal cual.
- Posible deriva monolingüe: si el corpus de siglas está en francés, el ajuste puede haber reducido el rendimiento en castellano o inglés respecto al base.
- Sin descargas ni validación comunitaria: no existe evidencia externa de funcionamiento, y el modelo se creó y actualizó en el mismo día.
- El modo thinking del base incrementa el consumo de tokens y la latencia; en tareas simples de expansión de siglas puede ser un coste innecesario.
- La ventana de 256K del base no está confirmada para el fine-tune; asumirla sin verificación puede provocar fallos silenciosos por truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlondner/qwen36-35b-a3b-acronymes
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio TRL: https://github.com/huggingface/trl
- Ficha del autor con fine-tune de 4B sobre siglas: https://huggingface.co/rlondner/qwen35-4b-acronyms/tree/main
- Ficha del base en LM Studio Hub: https://lmstudio.ai/qvping/qwen36-35b-a3b
- Ficha tecnica del base en FitMyLLM: https://www.fitmyllm.com/model/qwen3.6-35b-a3b
- Analisis del base en Medium: https://medium.com/data-science-in-your-pocket/qwen3-6-35b-a3b-the-tiny-active-open-model-that-thinks-codes-and-agents-like-a-much-bigger-one-486d535e372e
- Ficha del base en AI Model Radar: https://aimodelradar.app/models/qwen3-6-35b-a3b
