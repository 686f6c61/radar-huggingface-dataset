# Echoo113/Qwen3.5-2B-activity_dancing-STEER0.124219-ft4.42

## Resumen

`Echoo113/Qwen3.5-2B-activity_dancing-STEER0.124219-ft4.42` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-2B`, publicado por el usuario Echoo113 el 18 de octubre de 2026 mediante la librería TRL. El identificador del repositorio codifica el experimento: el sufijo `activity_dancing` apunta a un concepto o dominio concreto, `STEER0.124219` sugiere la aplicación de un vector de steering con un coeficiente de 0,124219 y `ft4.42` parece identificar una ejecución o iteración de fine-tuning, aunque ninguno de estos extremos está documentado en la model card.

El problema que resuelve no está declarado. La model card es la plantilla automática que genera TRL: incluye un ejemplo de uso con `pipeline`, la declaración de que el entrenamiento fue SFT y las versiones de framework, pero no describe el dataset, el número de tokens, la composición de los datos ni evaluaciones de ningún tipo. El repositorio acumula 0 descargas y 0 likes, y su tamaño declarado es de 0,1 GB, un dato que conviene verificar porque resulta llamativamente bajo para un modelo de 2 000 millones de parámetros en safetensors de precisión completa.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible más que la de un modelo listo para producción: sirve como referencia para estudiar cómo el steering y el SFT sobre un modelo pequeño afectan al comportamiento, siempre que se disponga del modelo base y de la configuración exacta del experimento, que aquí no se publica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Heredada del modelo base `Qwen/Qwen3.5-2B`, cuya arquitectura no se documenta en la información proporcionada |
| Parametros totales | ~2 000 millones, inferidos del identificador del modelo base (`2B`); no confirmados en la model card |
| Parametros activos | No aplica. No se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados. El repositorio solo publica pesos en safetensors; no hay variantes GGUF, GPTQ, AWQ ni EXL2 publicadas |
| Idiomas soportados | No disponibles |
| Licencia | No disponible. El campo YAML contiene el literal `licence: license`, sin texto legal asociado |
| Formato de pesos | safetensors (librería `transformers`) |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 1.10.0 |
| Versiones de framework | Transformers 5.15.1, PyTorch 2.11.0+cu128, Datasets 5.0.1, Tokenizers 0.22.2 |
| Tamano del repositorio | 0,1 GB (declarado por HuggingFace) |
| Fecha de publicacion | 2026-10-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna. El modelo es un fine-tune del checkpoint `Qwen/Qwen3.5-2B`, por lo que hereda su arquitectura, tokenizador y ventana de contexto, pero ninguno de esos datos se detalla en la model card ni se ha podido confirmar en la información proporcionada. Tampoco se especifica si el ajuste se aplicó sobre la totalidad de los pesos o mediante adaptadores de bajo rango: el tamaño de 0,1 GB del repositorio es compatible con un conjunto de adaptadores, pero también podría reflejar un recuento incompleto de archivos, y conviene comprobarlo listando los ficheros del repositorio antes de intentar cargarlo.

El entrenamiento consistió en SFT con TRL, sin que se documenten el dataset, el número de tokens vistos, la composición de los datos, la política de enmascarado de pérdida ni si hubo etapas posteriores de preferencias (RLHF, DPO, ORPO). El nombre del modelo sugiere una intervención de steering —un vector de dirección con coeficiente 0,124219 aplicado durante el ajuste o en inferencia— orientada al concepto `activity_dancing`; se trata de una inferencia a partir del identificador, no de un dato confirmado por el autor. La model card tampoco incluye hiperparámetros, curvas de entrenamiento ni métricas de validación.

## Capacidades

- Generación de texto conversacional mediante `transformers.pipeline`, tal y como muestra el ejemplo de la model card, que usa el formato de mensajes con roles (`user`).
- Capacidades del modelo base potencialmente heredadas (razonamiento, código, matemáticas, multilingüismo), pero sin verificar: el autor no publica evaluaciones de ningún tipo.
- No se documenta soporte de tool calling, function calling ni integración con agentes.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni otras modalidades.
- No se documenta el conjunto de idiomas soportados ni el rendimiento por idioma.
- Comportamiento presumiblemente sesgado hacia el concepto `activity_dancing` por la intervención de steering indicada en el nombre, extremo no confirmado empíricamente.

## Casos de uso

- Reproducción de experimentos de steering: cargar el modelo junto al base `Qwen/Qwen3.5-2B` y comparar salidas con y sin el vector para medir el efecto del coeficiente 0,124219 sobre el comportamiento generativo.
- Generación de datos sintéticos sobre el dominio `activity_dancing`: producir descripciones, guiones o variaciones textuales de actividad de baile para ampliar un corpus de entrenamiento, dado el sesgo inducido hacia ese concepto.
- Estudio del coste de alineación (*alignment tax*): evaluar con un conjunto de pruebas propio (por ejemplo, MMLU reducido o GSM8K) cuánto rendimiento general se pierde tras el SFT y el steering frente al modelo base.
- Prototipado en GPU de consumo: con ~2 000 millones de parámetros, el modelo cabe en tarjetas de 8 GB en bf16 y en 4 GB con cuantización int8, lo que permite iterar en local sin infraestructura dedicada.
- Docencia y demostraciones: ilustrar en un curso o taller cómo se compone un pipeline de SFT con TRL y cómo se publica un checkpoint en HuggingFace con la plantilla automática de model card.
- Prueba de humo de infraestructura: usar el checkpoint como caso de test en pipelines de CI que verifiquen la carga de safetensors, la compatibilidad de versiones de Transformers y el despliegue en endpoints compatibles.
- No recomendado como base para atención al cliente, generación de código en producción ni aplicaciones con requisitos de licencia claros, dada la ausencia de documentación y de licencia explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los ~2 000 millones de parámetros: ~4 GB de pesos en bf16/fp16, ~2 GB en int8 y ~1,1-1,3 GB en int4, a los que hay que sumar la caché KV y las activaciones (habitualmente 0,5-2 GB adicionales según longitud de contexto y tamaño de lote).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en bf16 también en tarjetas de 8 GB (RTX 3070, RTX 4060) con contextos moderados.
- GPU de datacenter: no requiere A100 ni H100; para servicio con concurrencia son suficientes L4, L40S o A10G.
- Despliegue: el único método documentado es `transformers` con `pipeline(..., device="cuda")`. vLLM y TGI son opciones plausibles si la arquitectura del modelo base está soportada por esas herramientas, extremo no verificado. llama.cpp u Ollama exigirían convertir previamente los pesos a GGUF, conversión no publicada.
- Antes de planificar el despliegue hay que confirmar que el repositorio contiene los pesos completos y no solo adaptadores; con 0,1 GB declarados, si fuesen adaptadores sería necesario descargar también `Qwen/Qwen3.5-2B` y fusionarlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública y no se han verificado en esta ficha; los del modelo objeto de análisis son, en su mayoría, no disponibles.

| Modelo | Parametros | Contexto | Licencia | Estado de documentacion |
|---|---|---|---|---|
| Echoo113/Qwen3.5-2B-activity_dancing-STEER0.124219-ft4.42 | ~2 000 M (inferido) | No disponible | No disponible (`licence: license`) | Solo plantilla automática de TRL; 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | ~2 000 M | No disponible en esta ficha | No disponible en esta ficha | Model card del autor original |
| Qwen2.5-3B | 3 080 M | 32 768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Documentación completa y benchmarks publicados |
| Llama 3.2 3B | 3 210 M | 128 000 tokens | Licencia comunitaria Llama 3.2 | Documentación completa y benchmarks publicados |
| Gemma 2 2B | 2 610 M | 8 192 tokens | Licencia Gemma | Documentación completa y benchmarks publicados |

## Limitaciones y advertencias

- Licencia no definida: el campo YAML contiene el literal `licence: license`, sin identificación del titular ni de los términos. No hay base legal para asumir uso comercial permitido; hay que contactar con el autor o asumir que no se puede usar en producción.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos, su idioma, su licencia y los sesgos que puedan introducir.
- Riesgo de alucinación: inherente a un modelo de ~2 000 millones de parámetros y no mitigado por ninguna evaluación publicada; el SFT sobre un dominio estrecho puede incrementarlo fuera de ese dominio.
- Degradación potencial de capacidades generales: la combinación de SFT y steering (coeficiente 0,124219) puede alterar el comportamiento del modelo base de formas no medidas; no hay evaluación que cuantifique el daño.
- Sesgo temático: el identificador `activity_dancing` sugiere una inclinación hacia ese concepto, con riesgo de respuestas irrelevantes en consultas generales.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Validación comunitaria nula: 0 descargas y 0 likes implican que nadie ha reportado problemas de carga, tokenización o calidad de salida.
- Integridad del repositorio: el tamaño de 0,1 GB es inconsistente con pesos completos de 2 000 millones de parámetros en safetensors; verificar si son adaptadores o si faltan ficheros.
- Versiones de framework muy recientes (Transformers 5.15.1, PyTorch 2.11.0, TRL 1.10.0): puede requerir un entorno actualizado y fallar en instalaciones más antiguas.
- Sin pipeline declarado en HuggingFace ni etiquetas de idioma: los filtros y widgets de la plataforma no mostrarán inferencia funcional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Echoo113/Qwen3.5-2B-activity_dancing-STEER0.124219-ft4.42)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio de TRL](https://github.com/huggingface/trl)
- [Documentación de Transformers](https://huggingface.co/docs/transformers)
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información proporcionada.
