# BeardedMonster/SabiBERTa-135M-masakhaner2-hau

## Resumen

SabiBERTa-135M-masakhaner2-hau es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido por fine-tuning del modelo base BeardedMonster/SabiBERTa-135M sobre la partición en hausa (hau) del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster como parte de una familia de adaptaciones por idioma (el nombre del checkpoint indica un ajuste mono-idioma sobre el protocolo hau del benchmark). El problema que resuelve es concreto: extraer entidades nombradas en hausa, un idioma africano con recursos limitados y escasa cobertura en modelos comerciales.

El modelo tiene 135.883.017 parámetros reales (verificados en los safetensors del repo) y emplea una arquitectura de tipo encoder etiquetada como `modernbert` en los metadatos de HuggingFace. El repositorio ocupa 0,5 GB y se distribuye únicamente en formato safetensors, con la cabeza de clasificación configurada (`id2label` incluido) para que las predicciones se decodifiquen directamente a nombres de etiqueta.

Su relevancia es acotada pero útil: no es un modelo generativo ni un asistente, sino un componente especializado de NER que reporta un span F1 medio de 0,7255 en hausa. Resulta interesante como pieza de infraestructura para pipelines de extracción de información en lenguas africanas y como ejemplo de adaptación eficiente de un encoder pequeño (135M) a una tarea concreta, ejecutable en hardware muy modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (etiqueta `modernbert` en HuggingFace); cabeza de clasificación de tokens (`AutoModelForTokenClassification`) |
| Parámetros totales | 135.883.017 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el fine-tuning se realizó con `max_length` = 256 tokens |
| Tipos de cuantización | No se publican variantes cuantizadas; el checkpoint se distribuye en safetensors (convertible a ONNX/int8 por su tamaño reducido) |
| Idiomas soportados | Hausa (`hau`) |
| Licencia | No disponible en la información proporcionada; el autor indica que rigen la licencia y términos del modelo base BeardedMonster/SabiBERTa-135M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SabiBERTa-135M, un encoder transformer de 135,9 millones de parámetros etiquetado como `modernbert` en los tags del repositorio. Sobre él se añade una cabeza de clasificación de tokens para NER. No se dispone en la información proporcionada de detalles sobre el número de tokens de preentrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de alineación (RLHF/DPO), algo que en un encoder de clasificación tampoco resulta habitual.

El ajuste fino se realizó sobre MasakhaNER 2.0 en la partición hau, con 50 épocas, learning rate 5e-5, batch size 32 y longitud máxima de 256 tokens. La métrica objetivo es `span_f1`, con una puntuación media de 0,7255. El autor señala que el arnés de evaluación del proyecto reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1, por lo que las cifras están calibradas y no son ad hoc; también advierte de que los resultados provienen de una única ejecución, mientras que los papers de referencia promedian 5, de modo que las diferencias pequeñas deben tratarse como ruido. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, atención por ventanas deslizantes) más allá de lo que aporte el modelo base.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en hausa mediante etiquetado BIO sobre tokens, con `id2label` incluido para decodificar directamente a nombres de etiqueta.
- Extracción de entidades de las categorías definidas por MasakhaNER 2.0 (persona, organización, localización y fecha, según el esquema del corpus).
- Clasificación de tokens genérica: al ser un `AutoModelForTokenClassification`, la cabeza puede reentrenarse para otros esquemas de etiquetado a nivel de token.
- Procesamiento por secuencias de hasta 256 tokens en el régimen de entrenamiento; secuencias más largas requieren truncamiento o segmentación con solapamiento.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio: es un encoder discriminativo, no un modelo generativo.
- Capacidad multilingüe: limitada al hausa; no se reportan resultados en otros idiomas.
- No se documenta modo "thinking", function calling ni plantillas de chat.

## Casos de uso

- Extracción de entidades en prensa digital en hausa: el modelo identifica personas, organizaciones y localizaciones en titulares y cuerpos de noticia, permitiendo construir índices de entidades y grafos de cobertura informativa con un coste de inferencia mínimo (135M de parámetros).
- Enriquecimiento de bases de datos documentales: procesar lotes de textos en hausa para poblar campos estructurados (quién, dónde, cuándo) antes de indexarlos en un motor de búsqueda, usando segmentación por ventanas de 256 tokens con solapamiento.
- Anonimización y seudonimización de textos: detectar nombres de persona y organizaciones en hausa para enmascararlos antes de compartir datos con terceros o de usarlos en entrenamiento de otros modelos.
- Triaje de soporte al cliente: extraer nombres de producto, localizaciones y fechas de tickets escritos en hausa para enrutarlos automáticamente al equipo o a la cola adecuada.
- Anotación asistida de corpus: usar el modelo como preetiquetador en una herramienta de anotación humana, de forma que el anotador solo corrija las predicciones; con un span F1 de 0,7255 se reduce el trabajo manual de forma significativa frente a anotar desde cero.
- Monitorización de menciones de marca o entidad pública: seguir en redes y foros en hausa las apariciones de una organización o figura pública, alimentando alertas en tiempo casi real dado el reducido coste por documento.
- Verificación de datos en formularios KYC: extraer localidades y nombres de documentos textuales en hausa para contrastarlos con registros existentes, siempre con revisión humana dado el nivel de error del modelo.

## Benchmarks y rendimiento

| Benchmark | Tarea | Idioma | Métrica | Resultado |
|---|---|---|---|---|
| MasakhaNER 2.0 | NER (span F1) | hau | span_f1 | 0,7255 |

Se trata de una única ejecución de evaluación. El autor indica que su arnés reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de ±0,25 F1 y que los papers de referencia promedian 5 ejecuciones, por lo que no se debe interpretar la cifra como directamente comparable con esas medias. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas, que por otra parte no aplican a un encoder de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,55 GB de pesos (135,9M × 4 bytes) más activaciones; en fp16, unos 0,27 GB. Con batch pequeño y secuencias de 256 tokens, el consumo total se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060/4060 o superior ofrece margen de sobra. Para despliegues de alto throughput, una T4, L4, A10 o A100 permiten procesar lotes grandes sin ser necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM, incluidas GTX 1650, RTX 3050 y modelos integrados con suficiente memoria compartida.
- Ejecución en CPU: viable. Un encoder de 135M sobre secuencias de 256 tokens procesa decenas de documentos por segundo por núcleo en CPU moderna, suficiente para lotes offline.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` (referencia del autor), ONNX Runtime o `optimum` para exportación y aceleración, TorchServe o FastAPI para servicio HTTP, y `text-embeddings-inference`/TGI no aplican al no ser un modelo generativo. vLLM no es adecuado para este tipo de checkpoint. La conversión a GGUF solo tendría sentido para ejecución en CPU vía llama.cpp y no es un formato publicado por el autor.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Por el tamaño del modelo, se espera latencia de pocos milisegundos por secuencia de 256 tokens en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NER hausa (span F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-hau | 135,9M | 256 tokens en entrenamiento | 0,7255 (una ejecución) | No disponible (hereda la del modelo base) | HuggingFace, safetensors |
| BeardedMonster/SabiBERTa-135M (modelo base) | 135,9M (no verificado en la información disponible) | No disponible | No disponible (sin cabeza NER ajustada) | No disponible | HuggingFace |
| Otros fine-tunes de MasakhaNER 2.0 en hausa | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se han proporcionado datos de modelos alternativos comparables (mBERT, XLM-R, AfriBERTa u otros fine-tunes de la misma familia), por lo que no es posible establecer una comparación cuantitativa rigurosa con esta información.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: el autor remite a la licencia y términos del modelo base BeardedMonster/SabiBERTa-135M, que deben verificarse antes de cualquier uso comercial. La ausencia de licencia explícita es un riesgo legal relevante en producción.
- Resultados de una sola ejecución: sin media sobre múltiples semillas, la diferencia frente a otros sistemas puede quedar dentro del ruido (±0,25 F1 según el propio autor).
- Cobertura mono-idioma: entrenado y evaluado únicamente en hausa; el rendimiento en otras lenguas africanas o en texto code-switching (hausa-inglés, frecuente en redes sociales) no está documentado.
- Límite de 256 tokens: textos más largos requieren truncamiento o segmentación, lo que puede romper entidades que cruzan la frontera de la ventana y degradar el recall.
- Esquema de etiquetas cerrado: solo detecta las categorías definidas por MasakhaNER 2.0; entidades fuera de ese conjunto (productos, cargos, identificadores) no se reconocen.
- Errores esperables de un NER con F1 ~0,72: falsos negativos en entidades poco frecuentes, confusiones entre organización y localización, y sensibilidad a la ortografía y a las variantes dialectales del hausa.
- El riesgo de alucinación en el sentido generativo no aplica, pero sí el de falsos positivos: el modelo puede etiquetar como entidad un token que no lo es, con impacto directo en pipelines que confíen ciegamente en la salida.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Documentación incompleta: no se detallan la composición del corpus de preentrenamiento del modelo base, el reparto train/dev/test usado ni el conjunto exacto de etiquetas.
- Fecha de creación del repositorio en 2026, posterior a la mayoría de referencias del ecosistema; conviene confirmar la integridad y reproducibilidad del checkpoint antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-hau
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Paper y repositorio de MasakhaNER 2.0: no disponibles en la información proporcionada
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con el checkpoint.
