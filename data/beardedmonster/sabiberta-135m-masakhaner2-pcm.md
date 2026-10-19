# BeardedMonster/SabiBERTa-135M-masakhaner2-pcm

## Resumen

SabiBERTa-135M-masakhaner2-pcm es un checkpoint de reconocimiento de entidades nombradas (NER) publicado por el usuario BeardedMonster en Hugging Face. Se trata de un ajuste fino del modelo base SabiBERTa-135M (arquitectura ModernBERT, 135.883.017 parámetros) sobre el corpus MasakhaNER 2.0 para el idioma `pcm`, es decir, pidgin nigeriano. No es un modelo generativo: la cabeza es de clasificación de tokens (`AutoModelForTokenClassification`) y su salida son etiquetas BIO/BILOU decodificables directamente a nombres de entidad.

El interés del checkpoint es acotado pero concreto: cubre una lengua africana de bajos recursos para la que existen pocos sistemas de NER abiertos, y lo hace con un encoder pequeño (0,5 GB de repo, pesos en safetensors) que se puede ejecutar en CPU. El autor reporta un `span_f1` medio de 0,8073 sobre el protocolo pcm de MasakhaNER 2.0, con 50 épocas, learning rate 5e-5, batch 32 y longitud máxima 256.

Conviene tratar la cifra con cautela: procede de una única ejecución, no hay resultados por entidad publicados en la model card (se remiten a `metrics.json`) y el checkpoint acumula cero descargas y cero likes en el momento de la consulta, por lo que no ha pasado por validación comunitaria. La licencia no está declarada y el propio autor remite a la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer; según la etiqueta `modernbert` del repositorio) |
| Parámetros totales | 135.883.017 (135,9 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el ajuste fino se ejecutó con `max length` 256) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; por tamaño admite FP32, FP16 e INT8) |
| Idiomas soportados | `pcm` (pidgin nigeriano), único idioma declarado |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación de tokens (NER, esquema decodificable vía `id2label`) |
| Modelo base | BeardedMonster/SabiBERTa-135M |
| Dataset de ajuste | masakhaner2, protocolo `pcm` |
| Métrica principal | `span_f1` = 0,8073 (una sola ejecución) |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 135,9 M de parámetros, tomado como base de BeardedMonster/SabiBERTa-135M y especializado mediante ajuste fino supervisado en la tarea de etiquetado de secuencias. ModernBERT sustituye parte del cómputo de atención clásico por atención con rotación posicional y capas de geometría alternativa, lo que en la práctica reduce el coste frente a un BERT clásico del mismo orden de magnitud; no obstante, la model card no documenta la configuración interna (número de capas, dimensiones ocultas, cabezas) de este checkpoint concreto.

El entrenamiento se realizó sobre MasakhaNER 2.0 en el protocolo `pcm`, con 50 épocas, learning rate 5e-5, tamaño de lote 32 y longitud máxima de secuencia 256. No se documenta la composición del dataset, el número de tokens vistos, ni si hubo búsqueda de hiperparámetros o validación cruzada. Tampoco se menciona ningún tipo de alineamiento posterior (RLHF, DPO u otro), algo por otra parte esperable en un modelo discriminativo de NER. El autor indica que el arnés de evaluación reproduce los resultados publicados de MasakhaNER 2.0 con una tolerancia de aproximadamente 0,25 F1, lo que da cierta calibración a la métrica, pero los resultados provienen de una única ejecución frente a las 5 medias de los papers de referencia.

## Capacidades

- Reconocimiento de entidades nombradas en pidgin nigeriano: identificación de personas, organizaciones, localizaciones y fechas según el esquema de MasakhaNER 2.0.
- Clasificación de tokens a nivel de subtoken con decodificación directa a etiquetas gracias a `id2label` preconfigurado.
- Etiquetado de secuencias de hasta 256 tokens por pasada, longitud usada durante el ajuste fino.
- Extracción de entidades sobre texto informal y ruidoso (redes sociales, foros, comentarios), dominio natural del pidgin nigeriano.
- Integración directa en el ecosistema `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking".
- No hay evidencia de capacidades multilingües: la model card solo declara `pcm`.

## Casos de uso

- Anonimización y pseudonimización de datos: aplicar el modelo sobre textos en pidgin nigeriano para detectar nombres de personas y localizaciones antes de almacenar o compartir un corpus, reduciendo la exposición de datos personales en pipelines de datos.
- Enriquecimiento de corpus para entrenamiento de LLM: etiquetar grandes volúmenes de texto `pcm` con entidades y construir datasets aumentados o índices de entidades que mejoren el grounding de modelos generativos en esa lengua.
- Moderación de contenido en plataformas: extraer organizaciones y personas mencionadas en comentarios y publicaciones en pidgin nigeriano para alimentar revisiones, análisis de menciones o sistemas de escalado a moderadores humanos.
- Monitorización de medios y redes sociales: seguimiento de menciones a entidades concretas (políticos, empresas, localidades) en contenido vernacular de Nigeria, con un coste de inferencia bajo al ser un modelo de 136 M de parámetros.
- Búsqueda y construcción de grafos de conocimiento: usar las entidades extraídas como nodos y enlaces para indexar documentos en `pcm` y habilitar búsqueda por entidad en lugar de solo por texto libre.
- Procesamiento previo en atención al cliente: detección de nombres, productos y localizaciones en tickets o mensajes de soporte escritos en pidgin nigeriano para enrutado automático o relleno de campos estructurados.
- Evaluación comparativa de NER africano: servir como referencia reproducible (span_f1 0,8073) en experimentos que comparen encoders pequeños frente a modelos multilingües grandes sobre MasakhaNER 2.0.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| MasakhaNER 2.0 (`pcm`) | span_f1 | 0,8073 | Una sola ejecución; 50 épocas, lr 5e-5, batch 32, max length 256 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni cifras por tipo de entidad más allá de la remisión a `metrics.json`. Tampoco se proporcionan resultados de los modelos de referencia de MasakhaNER 2.0, por lo que no es posible establecer una comparación numérica directa con las líneas base del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 544 MB en FP32, 272 MB en FP16 y 136 MB en INT8, calculados a partir de los 135,9 M de parámetros (sin contar activaciones, que son reducidas con secuencias de 256 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (GTX 1650, RTX 3060, T4, L4). Para lotes grandes, A10G o A100 aportan margen pero no son necesarias.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados, y el modelo puede ejecutarse en entornos sin acelerador.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX Runtime o TorchScript para reducir latencia, y servicio mediante FastAPI o Triton. vLLM y TGI están orientados a modelos generativos y su soporte para este checkpoint no está documentado en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / idioma | Métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-pcm | 135,9 M | No disponible (ajuste a 256) | NER, `pcm` | span_f1 0,8073 | No disponible | Hugging Face, 0 descargas |
| SabiBERTa-135M (base) | 135,9 M | No disponible | Encoder base sin cabeza NER | No disponible | No disponible | Hugging Face |
| SabiBERTa-135M-masakhaner2-hau | No disponible | No disponible | NER, `hau` (hausa) | No disponible en la información consultada | No disponible | Hugging Face |
| Líneas base de MasakhaNER 2.0 (modelos multilingües tipo mBERT/AfroXLMR) | No disponible | No disponible | NER multilingüe africano | No disponible en la información consultada | No disponible | Papers y repos públicos |

La comparación cuantitativa con las líneas base del paper de MasakhaNER 2.0 no puede realizarse con los datos proporcionados. El único punto de referencia interno es el modelo hermano para hausa, del que solo consta que existe y comparte harness de evaluación.

## Limitaciones y advertencias

- Resultado de una única ejecución: el autor advierte explícitamente de que las diferencias pequeñas frente a otras referencias deben tratarse como ruido, ya que los papers promedian 5 ejecuciones.
- Licencia no declarada: no se puede asumir uso comercial. El propio autor indica que la licencia y los términos del modelo base (`BeardedMonster/SabiBERTa-135M`) rigen cualquier uso derivado, por lo que hay que verificarlos antes de desplegar.
- Modelo puramente discriminativo: no genera texto, no razona y no soporta herramientas ni agentes; cualquier uso generativo requiere otro modelo.
- Cobertura lingüística mínima: solo `pcm`; el rendimiento en textos mixtos inglés-pidgin o en variantes ortográficas no documentadas es desconocido.
- Límite de longitud: el ajuste se hizo con `max length` 256, por lo que secuencias más largas requieren truncamiento o ventanas deslizantes, con riesgo de perder entidades en los cortes.
- Riesgo de falsos positivos y negativos: al ser un modelo de 136 M parámetros entrenado con un solo dataset, la sensibilidad a dominio (texto formal frente a jerga de redes) y a errores de anotación del corpus es alta; no se documentan análisis de errores.
- Ausencia de validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay informes independientes de calidad.
- Sin datos de sesgo: no se publica ninguna evaluación de sesgos por género, etnia o geografía en las entidades detectadas.
- Sin información sobre composición del dataset de entrenamiento, por lo que no se puede evaluar solapamiento con dominios de producción ni riesgo de contaminación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-pcm
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Checkpoint hermano para hausa: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-hau
- No se han encontrado en la búsqueda web enlaces adicionales a papers, blogs, repositorios de código o demos específicos de este checkpoint.
