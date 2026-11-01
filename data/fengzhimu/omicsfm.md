# fengzhimu/omicsfm

## Resumen

OmicsFM es un modelo fundacional desarrollado por el usuario fengzhimu (sin afiliación institucional explicitada en la model card) para el análisis de datos ómicos emparejados, concretamente proteómica y transcriptómica. El modelo aborda el problema de derivar redes de asociación proteína-proteína directamente a partir de la atención entre características medidas, sin necesidad de entrenamiento específico para cada tarea. La innovación central es que la matriz de atención del transformer funciona como una red de asociación biológica interpretable.

Arquitectónicamente es un transformer compacto de 4,94 millones de parámetros (excluyendo la tabla de embeddings de identidad de características), entrenado sobre un vocabulario compartido de 20.272 accesiones UniProt. Se distribuye en siete checkpoints que cubren tres modalidades (proteómica, transcriptómica bulk y transcriptómica de célula única) y dos estrategias de embedding de identidad de características: tablas aprendidas desde cero o proyecciones de embeddings ESM-C precalculados y congelados.

Su relevancia radica en que demuestra que un modelo de escala muy reducida puede capturar estructura biológica significativa cuando se le presenta la identidad de las características de forma informativa, y en que proporciona un marco controlado para medir el coste de mapear genes a proteínas. Es un modelo de investigación, no un asistente conversacional: no procesa lenguaje natural ni genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención entre características medidas (feature attention) |
| Parametros totales | 4,94 M (tronco transformer); 5,75 M en variantes ESM-C (4,94 M + 0,81 M de proyección) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints en formato de punto flotante nativo, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `best_model.ckpt` (checkpoint PyTorch) + `config.yaml` por checkpoint; caché ESM-C en `esmc_human_cache.pt` |

## Arquitectura y entrenamiento

El modelo es un transformer que aplica atención sobre las características medidas (features) de una muestra ómica, en lugar de sobre tokens de texto. Cada característica se identifica mediante un embedding de identidad que se suma o combina con su valor de expresión. La matriz de atención resultante entre características se interpreta directamente como una red de asociación proteína-proteína, lo que permite obtener dicha red sin entrenamiento supervisado específico para esa tarea.

Existen dos mecanismos de identidad de características. Las variantes `learned` entrenan una tabla de embeddings sobre el vocabulario desde cero, con 5,19 M de parámetros adicionales (15,74 M en `sc_transcriptomics_ensembl`, cuyo vocabulario ENSEMBL es tres veces mayor). Las variantes `_esmc` consultan una tabla congelada de embeddings ESM-C 600M precalculados sobre el proteoma humano canónico, con un vector de 1152 dimensiones por accesión UniProt, y lo pasan por una proyección entrenada de 0,81 M de parámetros; la tabla congelada tiene 23,35 M de parámetros y no se entrena. La caché `esmc_human_cache.pt` (95 MB) se distribuye para garantizar que los embeddings sean idénticos a los vistos en entrenamiento.

El checkpoint `sc_transcriptomics_ensembl` se entrena directamente sobre 61.497 identificadores de gen ENSEMBL sin mapeo gen-proteína, y existe específicamente para cuantificar el coste de dicho mapeo: al compararlo con `sc_transcriptomics` (idéntico en arquitectura y entrenamiento, solo difiere en vocabulario) se aísla el efecto de descartar características que no mapean y las aristas de verdad fundamental entre ellas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Inferencia de redes de asociación proteína-proteína a partir de la atención entre características, sin entrenamiento específico de tarea.
- Procesamiento de datos de proteómica con vocabulario UniProt de 20.272 accesiones.
- Procesamiento de transcriptómica bulk con el mismo vocabulario compartido.
- Procesamiento de transcriptómica de célula única, tanto con vocabulario UniProt como con 61.497 identificadores ENSEMBL.
- Incorporación de información de secuencia proteica mediante embeddings ESM-C 600M congelados (variantes `_esmc`).
- Extracción de mapas de atención interpretables mediante la API `omicsfm.api.attention_map`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Descubrimiento de asociaciones proteína-proteína: ejecutar `attention_map` sobre un dataset de proteómica y extraer las aristas de mayor peso como candidatas a interacción o co-regulación, priorizando experimentos de validación experimental.
- Análisis de co-expresión en célula única: usar el checkpoint `sc_transcriptomics` para obtener redes de asociación entre genes mapeados a proteínas en datos scRNA-seq, aprovechando el vocabulario UniProt compartido con las otras modalidades.
- Estudio metodológico del mapeo gen-proteína: comparar `sc_transcriptomics` con `sc_transcriptomics_ensembl` para cuantificar cuántas características y aristas se pierden al mapear ENSEMBL a UniProt, informando decisiones de preprocesamiento en pipelines propios.
- Evaluación de representaciones de identidad de características: comparar variantes `learned` frente a `_esmc` sobre los mismos datos para determinar si la información de secuencia proteica aporta señal más allá de la co-expresión.
- Integración multiómica exploratoria: aplicar los checkpoints de proteómica y transcriptómica sobre muestras emparejadas para estudiar correspondencias entre capas moleculares bajo un vocabulario común.
- Docencia y reproducción de investigación: el tamaño reducido (4,94 M de parámetros en el tronco) y la inclusión de `config.yaml` legible sin cargar el checkpoint permiten reproducir experimentos en hardware modesto y auditar hiperparámetros y pérdida de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la publicación está en preparación y no reporta métricas comparativas (AUROC, AUPRC ni similares) frente a métodos de inferencia de redes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el tronco del modelo; el repositorio completo ocupa 0,7 GB, incluyendo la caché ESM-C de 95 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia sobre datasets pequeños.
- Opciones de despliegue: la librería propia `omicsfm` (funciones `get_checkpoint` y `attention_map`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El cuello de botella previsible es el preprocesamiento de datos ómicos y, en variantes `_esmc`, la carga de la tabla de consulta congelada, no el cómputo del transformer.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de forma fundacional sobre ómica emparejada, ni de métricas que permitan establecer una comparación cuantitativa. La model card no cita alternativas ni baselines.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OmicsFM | 4,94 M (tronco) | No disponible | CC-BY-4.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación en etapa temprana: publicación en preparación y sin benchmarks publicados; no debe asumirse validez biológica de las asociaciones inferidas sin validación experimental.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- El mapeo gen-proteína descarta características que no mapean y aristas de verdad fundamental entre ellas; el propio autor reconoce este sesgo y publica un checkpoint específico para medirlo.
- La cobertura del vocabulario está limitada a 20.272 accesiones UniProt del proteoma humano canónico; características fuera de ese vocabulario quedan excluidas en las variantes mapeadas.
- Las variantes `_esmc` dependen de la caché `esmc_human_cache.pt` y del FASTA del proteoma humano canónico; su omisión o sustitución altera los resultados respecto a los vistos en entrenamiento.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural ni produce texto explicativo.
- Riesgo de alucinación en el sentido biológico: la atención puede producir asociaciones espurias por correlación sin causalidad; requiere contraste con bases de datos de interacciones y evidencia experimental.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados de la composición del proteoma de referencia y de los datasets ómicos empleados, no especificados.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al no haber benchmarks ni validación independiente, su uso en producción sanitaria o farmacéutica sin evaluación propia es desaconsejable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fengzhimu/omicsfm
- Publicación: en preparación, sin enlace disponible
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponibles
