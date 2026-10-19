# BeardedMonster/SabiBERTa-135M-masakhaner2-twi

## Resumen

SabiBERTa-135M-masakhaner2-twi es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por ajuste fino de `BeardedMonster/SabiBERTa-135M` sobre el corpus MasakhaNER 2.0 para el idioma twi (akánico, hablado principalmente en Ghana). Lo publica el usuario BeardedMonster, autor también del modelo base, y su propósito es resolver una tarea concreta: etiquetar entidades en texto en twi, un idioma de bajos recursos para el que escasean modelos especializados.

El modelo es un encoder de arquitectura ModernBERT con 135.883.017 parámetros totales, distribuidos en safetensors y con un repositorio de 0,5 GB. No es un modelo generativo: su cabeza es `AutoModelForTokenClassification`, con `id2label` configurado para que las predicciones se decodifiquen directamente a nombres de etiqueta. El ajuste se realizó durante 50 épocas con una tasa de aprendizaje de 5e-05, tamaño de lote 32 y longitud máxima de 256 tokens.

Su relevancia actual es doble. Por un lado, aporta una puntuación media de span_f1 de 0,6995 en twi, calibrada contra las líneas base publicadas de MasakhaNER 2.0 (el harness del autor reproduce dichos baselines con una tolerancia de ~0,25 F1). Por otro, forma parte de una familia de checkpoints por idioma que cubren el protocolo MasakhaNER 2.0, lo que facilita la extracción de entidades en pipelines multilingües africanos con un coste computacional muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, tag `modernbert`) |
| Parametros totales | 135.883.017 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ajuste fino se entrenó con `max_length` 256 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | twi (akánico) |
| Licencia | no disponible; rige la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M` |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de SabiBERTa-135M, un encoder de la familia ModernBERT (transformer bidireccional de tipo encoder-only) con 135,9 M de parámetros. Sobre esa base se añade una cabeza de clasificación de tokens y se ajusta de extremo a extremo para la tarea NER. La model card no detalla la configuración interna del backbone (número de capas, dimensión oculta, mecanismo de atención local/global, tokenizador), por lo que esos datos deben consultarse en el repositorio del modelo base.

El entrenamiento se realizó sobre el protocolo twi de MasakhaNER 2.0 con los siguientes hiperparámetros: 50 épocas, tasa de aprendizaje 5e-05, tamaño de lote 32 y longitud máxima de secuencia 256. La métrica objetivo es span_f1 (F1 a nivel de span de entidad), con una puntuación media de 0,6995. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste adicionales. El autor advierte que el harness reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1 y que los resultados provienen de una única ejecución, mientras que los artículos de referencia promedian sobre 5, por lo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto en twi: clasificación token a token con etiquetas del esquema MasakhaNER 2.0, decodificables directamente a nombres de entidad mediante `id2label`.
- Extracción de spans de entidad: la métrica reportada es span_f1, lo que implica evaluación a nivel de entidad completa y no solo de token.
- Procesamiento por lotes de secuencias de hasta 256 tokens (límite usado en el ajuste fino).
- Integración nativa con el ecosistema Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: es un encoder discriminativo.
- No soporta tool calling, function calling ni flujos agénticos.
- Capacidad multilingüe: limitada al twi; no se documenta transferencia a otros idiomas.
- No se documentan modos especiales (thinking mode, atención a instrucciones, plantillas de prompt).

## Casos de uso

- Anotación asistida de corpus en twi: usar el modelo como preanotador para que anotadores humanos corrijan entidades en lugar de etiquetar desde cero, reduciendo el coste por documento en proyectos de datos para lenguas de bajos recursos.
- Construcción de datasets NER: generar etiquetas preliminares sobre grandes volúmenes de texto en twi y filtrar por confianza para crear corpus de entrenamiento adicionales, con revisión humana en la cola de baja confianza.
- Extracción de entidades en prensa y medios digitales ghaneses: identificar personas, organizaciones y lugares en artículos en twi para alimentar índices de búsqueda o sistemas de seguimiento de temas.
- Indexación y búsqueda semántica sobre archivos documentales: enriquecer documentos con metadatos de entidad para permitir búsquedas del tipo "menciones de organización X" sobre un archivo en twi.
- Monitorización de contenido y análisis de discurso: detectar entidades citadas en redes sociales o foros en twi para estudios de opinión, seguimiento de figuras públicas o análisis de polarización.
- Humanidades digitales y lingüística de corpus: extraer automáticamente menciones de lugares y personas sobre corpus históricos o etnográficos en akánico para estudios cuantitativos.
- Enriquecimiento de sistemas de atención al ciudadano: etiquetar consultas entrantes en twi para enrutarlas según la entidad o localidad mencionada, con un modelo lo bastante pequeño para ejecutarse en CPU.
- Pipelines de anotación activa: integrar el modelo en un bucle de active learning donde las predicciones de baja confianza se envían a revisión humana y las de alta confianza se aceptan automáticamente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| MasakhaNER 2.0 (twi) | span_f1 (media) | 0,6995 | Una sola ejecución; el autor indica que los baselines promedian 5 ejecuciones |
| MMLU, HumanEval, GSM8K, etc. | - | no disponible | No aplicables: el modelo no es generativo |

No se han publicado resultados de benchmarks adicionales en la información disponible. Los desgloses por idioma o por tipo de entidad se encuentran, según el autor, en el fichero `metrics.json` del repositorio (no incluido en la información proporcionada).

## Requisitos de hardware

- Pesos en fp32: ~0,54 GB (tamaño coherente con un repositorio de 0,5 GB). En fp16: ~0,27 GB. En int8: ~0,14 GB. Estas cifras son cálculos a partir del número de parámetros, no mediciones publicadas.
- VRAM estimada para inferencia: por debajo de 1 GB en la mayoría de configuraciones, incluyendo activaciones y buffers para lotes moderados a 256 tokens.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; A100 o H100 resultan innecesarias para este tamaño.
- Cabe en CPU: sí, es un caso de uso realista para inferencia por lotes o servicio de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX Runtime para inferencia en CPU, servicio FastAPI o Triton para por lotes. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no son el objetivo natural de un encoder de clasificación.
- Latencia y throughput: no disponible. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NER twi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-twi | 135,9 M | no disponible (entrenado a 256) | span_f1 0,6995 (MasakhaNER 2.0) | no disponible (rige la del modelo base) | Hugging Face |
| SabiBERTa-135M (modelo base) | ~135 M | no disponible | no disponible | no disponible | Hugging Face |
| mBERT (bert-base-multilingual-cased) | ~178 M (dato estructural de conocimiento público, no medido aquí) | 512 | no disponible en esta información | Apache 2.0 (referencia general) | Hugging Face |
| AfroXLMR-base | ~278 M (dato estructural de conocimiento público, no medido aquí) | 512 | no disponible en esta información | MIT (referencia general) | Hugging Face |

No se dispone de resultados comparativos medidos en la información proporcionada. Las filas de mBERT y AfroXLMR se incluyen como referencia estructural de alternativas habituales para NER en lenguas africanas; sus cifras de rendimiento en twi deberían consultarse en sus propias model cards o en los resultados publicados de MasakhaNER 2.0 antes de tomar una decisión.

## Limitaciones y advertencias

- Rendimiento limitado: un span_f1 de 0,6995 implica que aproximadamente un 30 % de las entidades no se recuperan o se etiquetan incorrectamente; no es adecuado para extracción totalmente automática sin revisión en contextos de alta exigencia.
- Resultados de una sola ejecución: el propio autor advierte que los baselines de referencia promedian 5 ejecuciones, por lo que diferencias pequeñas frente a otros sistemas deben considerarse ruido.
- Dominio restringido: entrenado sobre el protocolo twi de MasakhaNER 2.0; el rendimiento fuera de ese dominio (redes sociales, texto oral transcrito, dominios técnicos) no está documentado y probablemente sea inferior.
- Cobertura de un solo idioma: no se documenta capacidad de transferencia a otras lenguas africanas ni al inglés; para otros idiomas existen checkpoints separados de la misma familia.
- Límite de longitud: el ajuste se realizó con `max_length` 256; secuencias más largas requieren truncamiento o segmentación con ventanas deslizantes y agregación de entidades, lo que puede degradar la calidad en fronteras de ventana.
- Riesgo de alucinación de entidades: como todo modelo NER, puede asignar etiquetas a spans que no son entidades reales, especialmente en texto ruidoso o con ortografía no estándar del twi.
- Sesgos: no se documenta ningún análisis de sesgo. Al tratarse de un corpus periodístico, puede sobrerrepresentar entidades de actualidad y tipos de nombre presentes en la fuente original.
- Licencia: la model card no especifica licencia propia y remite explícitamente a la licencia y términos del modelo base `BeardedMonster/SabiBERTa-135M`. Es imprescindible verificar ese repositorio antes de cualquier uso comercial o redistribution de los pesos.
- Sin garantías de producción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- No es generativo: no puede emplearse para resumen, traducción, diálogo ni generación de código; intentarlo produciría resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-twi
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Checkpoint hermano para ibo: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-ibo
- Perfil del autor en Hugging Face: https://huggingface.co/BeardedMonster/datasets
