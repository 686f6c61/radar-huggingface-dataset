# BeardedMonster/SabiBERTa-135M-masakhaner2-luo

## Resumen

SabiBERTa-135M-masakhaner2-luo es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por fine-tuning del modelo base BeardedMonster/SabiBERTa-135M sobre el subconjunto de lengua luo del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster como parte de una familia de adaptaciones por idioma orientadas a lenguas africanas, y su propósito concreto es etiquetar entidades (personas, organizaciones, localizaciones y fechas) en texto en luo, una lengua nilótica hablada principalmente en Kenia y Tanzania.

El modelo es un encoder de 135.883.017 parámetros construido sobre arquitectura ModernBERT, según declaran los tags del repositorio, y se distribuye en formato safetensors con un tamaño de repositorio de 0,5 GB. Se carga con `AutoModelForTokenClassification` y expone `id2label`, por lo que las predicciones se decodifican directamente a nombres de etiqueta sin postproceso adicional.

Su relevancia es acotada pero clara: no es un modelo generativo ni un asistente, sino una pieza de infraestructura de NLP para una lengua de bajos recursos, donde las alternativas multilingües grandes suelen rendir peor y cuestan mucho más de desplegar. Con 135M de parámetros se puede ejecutar en CPU o en cualquier GPU de consumo, lo que lo hace utilizable en entornos con hardware limitado. La model card advierte de que los resultados provienen de una única ejecución y de que la licencia del modelo base rige cualquier uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, según tags del repositorio) |
| Parametros totales | 135.883.017 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; longitud máxima de entrenamiento documentada: 256 tokens |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | luo |
| Licencia | no disponible (la model card remite a la licencia del modelo base BeardedMonster/SabiBERTa-135M) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de un encoder ModernBERT de 135M de parámetros sobre la tarea de etiquetado de entidades. ModernBERT es una revisión moderna del transformer encoder clásico que incorpora embeddings posicionales rotatorios, atención alternada entre capas globales y locales, y kernels optimizados para secuencias largas; el repositorio solo confirma la etiqueta `modernbert`, sin detallar la configuración exacta de capas ni el contexto nativo del modelo base. La cabeza de clasificación es la estándar de token classification, con un identificador de etiqueta por token BIO y `id2label` poblado.

Los datos de entrenamiento corresponden al protocolo luo de MasakhaNER 2.0, un benchmark de NER para lenguas africanas. La configuración declarada es de 50 épocas, learning rate 5e-05, batch size 32 y longitud máxima de 256 tokens, evaluada con span F1. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste adicionales; tampoco se menciona RLHF ni DPO, algo esperable en un encoder de clasificación. La model card indica que el pipeline de evaluación reproduce las baselines publicadas de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1, de modo que las cifras estarían calibradas y no son medidas ad hoc.

## Capacidades

- Reconocimiento de entidades nombradas en luo: etiquetado a nivel de token con decodificación directa a nombres de etiqueta vía `id2label`.
- Clasificación de tokens genérica: al ser un `AutoModelForTokenClassification`, la cabeza puede reutilizarse para otras tareas de etiquetado secuencial si se reentrena.
- Extracción de spans de entidad con métrica span F1, adecuada para evaluar entidades multipalabra.
- Procesamiento de secuencias de hasta 256 tokens en la configuración entrenada.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente: es un encoder discriminativo.
- Monolingüe en la práctica: aunque el modelo base pueda ser multilingüe, este checkpoint se ha ajustado únicamente sobre luo y no se documenta transferencia a otras lenguas.

## Casos de uso

- Extracción de entidades en corpus periodísticos en luo: procesar artículos y poblar una base de datos de personas, organizaciones y lugares mencionados, con la ventaja de que el modelo cabe en CPU y permite procesar lotes grandes sin GPU.
- Construcción de índices de búsqueda con filtros por entidad: enriquecer un motor de búsqueda documental con etiquetas de entidad para permitir consultas del tipo "documentos que mencionan tal organización", usando la salida BIO del modelo como campo estructurado.
- Anonimización y seudonimización de textos: detectar nombres de persona y organizaciones antes de publicar o compartir un corpus, reduciendo el riesgo de reidentificación en materiales sensibles.
- Investigación lingüística y anotación asistida: preetiquetar corpus en luo para que anotadores humanos solo corrijan, con el consiguiente ahorro de tiempo; el span F1 de 0,7079 da una idea del volumen de corrección esperable.
- Monitorización de medios y análisis de cobertura: rastrear qué entidades aparecen con más frecuencia en feeds de noticias en luo para estudios de agenda mediática o de reputación.
- Pipeline de datos para modelos mayores: usar las entidades detectadas como metadatos o como señales de filtrado en la curación de corpus destinados al entrenamiento de modelos generativos en lenguas africanas.
- Despliegue en entornos de bajos recursos: al ser un modelo de 135M en safetensors de 0,5 GB, puede ejecutarse en servidores modestos o incluso en dispositivos con CPU, lo que facilita su uso en instituciones con infraestructura limitada.

## Benchmarks y rendimiento

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| MasakhaNER 2.0 (luo) | NER | span F1 | 0,7079 |

El resultado corresponde a una sola ejecución sobre el protocolo luo; la propia model card advierte de que las baselines publicadas promedian cinco ejecuciones, por lo que diferencias pequeñas frente a otros sistemas deben tratarse como ruido. No se han publicado en la información disponible resultados en MMLU, HumanEval, GSM8K ni otros benchmarks generales, y no tendrían sentido para un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0,5 GB en el repositorio; en precisión de 32 bits los 135,9M de parámetros suponen aproximadamente 0,54 GB de pesos, y en fp16/bf16 alrededor de 0,27 GB. Con activaciones y batch pequeño, menos de 1 GB en fp16 y del orden de 1 a 2 GB en fp32.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente; el modelo no requiere A100 ni H100 salvo que se busque throughput muy alto con lotes grandes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650, e incluso en iGPU con suficiente memoria compartida.
- Es viable en CPU: para inferencia por lotes de documentos cortos (256 tokens), un procesador moderno ofrece latencias del orden de milisegundos a decenas de milisegundos por secuencia; no se publican cifras oficiales de latencia ni throughput.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` (vía documentada), exportación a ONNX Runtime para CPU, y servidores de inferencia tipo TGI o vLLM aunque con escasa ventaja frente a `transformers` por el tamaño reducido. No se publican pesos GGUF, por lo que llama.cpp u Ollama no están soportados de forma nativa sin conversión previa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-luo | 135,9M | 256 tokens (entrenamiento) | NER en luo | no disponible | HuggingFace |
| mBERT (bert-base-multilingual-cased) | 178M | 512 tokens | encoder multilingüe, fine-tune por tarea | Apache 2.0 | HuggingFace |
| XLM-R base | 278M | 512 tokens | encoder multilingüe, fine-tune por tarea | MIT | HuggingFace |
| AfroXLMR base | 278M | 512 tokens | encoder adaptado a lenguas africanas | no verificada en esta ficha | HuggingFace |

Comparación cualitativa: frente a mBERT y XLM-R, este checkpoint ofrece un modelo ya ajustado a la tarea y a la lengua, con un orden de magnitud menos de parámetros y por tanto menor coste de despliegue, a cambio de estar especializado y no poder reutilizarse para otras tareas sin reentrenar la cabeza. No se dispone de resultados comparativos de span F1 de estas alternativas sobre el protocolo luo de MasakhaNER 2.0 en la información proporcionada, por lo que no es posible afirmar superiority numérica frente a ellas.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica explícitamente que la licencia y los términos del modelo base BeardedMonster/SabiBERTa-135M rigen cualquier uso derivado, por lo que es obligatorio revisarlos antes de un uso comercial.
- Monolingüe: solo se ha ajustado y evaluado en luo; no hay garantías de comportamiento en otras lenguas, ni siquiera en lenguas africanas relacionadas.
- Longitud de contexto efectiva de 256 tokens: textos más largos deben trocearse, lo que puede romper entidades que cruzan el límite de fragmento.
- Resultado de una única ejecución (span F1 0,7079): la variabilidad entre semillas no está cuantificada, y la propia model card pide tratar las diferencias pequeñas como ruido.
- Riesgo de error en entidades ambiguas y en límites de span: un F1 de aproximadamente 0,71 implica una tasa de fallo no trivial, inaceptable sin revisión humana en flujos de anonimización o cumplimiento normativo.
- Sesgos del corpus de origen: MasakhaNER 2.0 está construido a partir de dominios periodísticos y su distribución de entidades no representa necesariamente el lenguaje coloquial, técnico o de redes sociales.
- Sin datos de sesgo demográfico, robustez ante ruido, ni evaluación de calibración: no se han publicado análisis de este tipo en la información disponible.
- Modelo de clasificación, no generativo: no puede emplearse como chatbot, para resumir ni para responder preguntas; cualquier expectativa en ese sentido es un error de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-luo
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- MasakhaNER 2.0 (referencia del dataset, no enlazada en la información proporcionada): no disponible
- Paper de ModernBERT: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible

Nota: los resultados de búsqueda web recibidos no contienen información relacionada con el modelo (son hilos de foro sin relación temática), por lo que no se han utilizado como fuente.
