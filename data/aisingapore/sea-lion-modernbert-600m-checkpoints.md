# aisingapore/SEA-LION-ModernBERT-600M-checkpoints

## Resumen

SEA-LION-ModernBERT-600M-checkpoints es un repositorio de checkpoints intermedios del modelo encoder SEA-LION-ModernBERT-600M, desarrollado por el pilar de Productos de IA de AI Singapore con financiacion del Singapore NRF. Forma parte de la familia SEA-LION, una coleccion de modelos de lenguaje preentrenados y ajustados para la region del Sudeste Asiatico, y esta disenado para abordar el deficit de representacion linguistica de las lenguas de esa zona en los modelos genericos.

El modelo combina la arquitectura ModernBERT-large con el tokenizador SentencePiece de Gemma 3, lo que le permite alcanzar una compresion y fertilidad de tokenizacion muy superiores para escrituras regionales complejas como el birmano, jemer, laosiano o tamil. Se entrenaron un total de 3 billones de tokens en dos fases: preentrenamiento de 2T tokens y mid-training adicional de 1T tokens, cubriendo codigo y 13 idiomas especificos. Este repositorio especifico contiene los checkpoints de ambas fases en formato Composer y HuggingFace, pensados para continuar el preentrenamiento o realizar fine-tuning.

La relevancia de este modelo reside en su licencia MIT, su arquitectura encoder eficiente y su especializacion multilingue para el Sudeste Asiatico, una region historicamente infrarrepresentada en los modelos de lenguaje. La publicacion de checkpoints intermedios permite a la comunidad investigadora reproducir el proceso de entrenamiento y continuar el preentrenamiento con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) |
| Parametros totales | 600 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | birmano, chino, ingles, filipino, indonesio, javanes, jemer, lao, malayo, sundanés, tamil, tailandes y vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors y checkpoints Composer (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT-large, un encoder transformer moderno que incorpora mejoras como atencion con padding masking, rotary positional embeddings y una estructura optimizada para eficiencia computacional. La innovacion principal del modelo es la adopcion del tokenizer SentencePiece de Gemma 3, con un vocabulario de 262.000 tokens, disenado para lograr una tokenizacion eficiente y culturalmente matizada de las lenguas del Sudeste Asiatico, reduciendo la fragmentacion de escrituras complejas.

El entrenamiento se realizo en dos fases consecutivas: una primera fase de preentrenamiento sobre 2T tokens y una segunda fase de mid-training sobre 1T tokens adicionales, cubriendo tanto codigo fuente como texto en los 13 idiomas objetivo. El repositorio de checkpoints expone tres variantes: el checkpoint de preentrenamiento (stage1), el checkpoint de mid-training con decay de learning rate (stage2-w-decay, apto para fine-tuning con warmup) y el checkpoint de mid-training sin decay (stage2-wo-decay, apto para continuar preentrenamiento). No se menciona el uso de RLHF o DPO; el modelo es exclusivamente encoder y se enfoca en tareas de comprension de lenguaje, no generacion.

## Capacidades

- Comprension de lenguaje multilingue: soporta 13 idiomas, incluyendo lenguas con sistemas de escritura no latinos (birmano, jemer, lao, tamil, tailand) con una compresion de tokenizacion eficiente.
- Clasificacion de texto: apto para tareas de analisis de sentimiento, clasificacion de topicos y categorizacion de documentos en idiomas del Sudeste Asiatico.
- Relleno de mascaras (fill-mask): capacidad de predecir tokens ocultos, util para evaluacion de modelos y tareas de preprocesamiento.
- Extraccion de representaciones contextuales: genera embeddings de alta calidad para transferencia a tareas downstream mediante fine-tuning.
- Soporte de codigo: el preentrenamiento incluyo datos de codigo, lo que permite aplicaciones de analisis y comprension de codigo fuente.
- Ajuste fino para tareas especificas: los checkpoints de las distintas fases permiten adaptar el modelo a tareas concretas con estrategias de entrenamiento distintas (con o sin warmup de learning rate).
- Capacidades de transferencia: al ser un encoder, es adecuado como backbone para sistemas de clasificacion, extraccion de entidades o respuesta a preguntas extractiva.
- No soporta generacion autoregresiva: al ser un modelo encoder, no genera texto libre ni mantiene conversaciones.

## Casos de uso

- Analisis de sentiment en redes sociales para el Sudeste Asiatico: el modelo puede ajustarse para clasificar opiniones en indonesio, tailandes o tagalo, con una tokenizacion eficiente que reduce costes computacionales frente a modelos de vocabulario generico.
- Clasificacion de documentos legales y administrativos: las instituciones publicas de la region pueden adaptar el modelo para categorizar documentos en birmano, jmer o lao, lenguas con poca representacion en los modelos comerciales.
- Busqueda semantica y recuperacion de informacion: combinado con un modulo de embedding (como el modelo hermano SEA-LION-E5-Embedding-600M), permite construir sistemas RAG para corpus multilingües del Sudeste Asiatico.
- Continuacion de preentrenamiento en dominios especificos: los checkpoints de fase 1 permiten a equipos de investigacion continuar el entrenamiento con datos propios (por ejemplo, textos medicos o financieros de la region) sin partir de cero.
- Ajuste fino para extraccion de entidades en textos historicos y culturales: la tokenizacion de Gemma 3 ofrece una fertilidad superior para escrituras como el javanes o el sundanés, facilitando tareas de NER en archivos historicos.
- Evaluacion comparativa de modelos multilingües: los checkpoints intermedios permiten a investigadores reproducir el proceso de entrenamiento y comparar estrategias de decay de learning rate para tareas de comprension.
- Sistemas de moderacion de contenido en plataformas locales: el modelo puede ajustarse para detectar discursos de odio o contenido inapropiado en los 12 idiomas de la region, aprovechando su contexto de 8K tokens para analisis de textos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye tablas de rendimiento en tareas como MMLU, XNLI o TyDiQA, ni comparaciones con modelos alternativos. Para una evaluacion cuantitativa, se recomienda consultar la documentacion oficial de SEA-LION en docs.sea-lion.ai o los papers asociados (arxiv:2508.12243).

## Requisitos de hardware

- VRAM estimada para inferencia: con 600M parametros en precision FP32 se requieren aproximadamente 2,4 GB de memoria; con cuantizacion a int8 se reduce a unos 1,2 GB. Para entrenamiento o fine-tuning, se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 3060 12 GB o superior es suficiente para inferencia; para fine-tuning con lotes moderados se recomienda una RTX 4090 (24 GB) o una A100 de 40 GB para entrenamiento completo.
- Compatibilidad con GPU consumer: si, cabe en la mayoria de las GPUs de consumo actuales (desde 8 GB de VRAM en adelante) para inferencia y fine-tuning ligero.
- Opciones de despliegue: al ser un modelo encoder, es compatible con el ecosistema Hugging Face transformers, incluyendo pipelines de clasificacion y extraccion. Puede desplegarse en CPU para inferencia de baja latencia, o en GPU con frameworks como ONNX Runtime para optimizacion.
- Latencia estimada: para clasificacion de textos cortos (menos de 512 tokens) en una GPU consumer, la latencia esperada es de 10-50 ms por lote; en CPU, del orden de 100-500 ms.
- Consideracion de memoria: el repositorio ocupa 46,7 GB, lo que incluye los checkpoints en formato Composer y HuggingFace de las distintas fases. Para descargar solo el checkpoint de HuggingFace de una fase concreta, se debe usar la opcion de subcarpeta del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Arquitectura |
|---|---|---|---|---|---|
| SEA-LION-ModernBERT-600M-checkpoints | 600M | 8k | 13 (incl. SEA) | MIT | Encoder (ModernBERT-large) |
| SEA-LION-ModernBERT-300M-checkpoints | 300M | 8k | 13 (incl. SEA) | MIT | Encoder (ModernBERT) |
| XLM-RoBERTa-large | 560M | 512 | 100+ | MIT | Encoder (RoBERTa) |
| RemBERT | 560M | 512 | 100+ | MIT | Encoder (Transformer) |

El modelo se diferencia de XLM-RoBERTa y RemBERT por su tokenizador especializado en lenguas del Sudeste Asiatico (Gemma 3), que mejora la compresion de escrituras complejas, y por su contexto de 8.000 tokens frente a los 512 de los modelos anteriores. La principal limitacion comparativa es que no hay datos de benchmarks publicados que permitan cuantificar la ventaja en tareas concretas.

## Limitaciones y advertencias

- No se ha probado la robustez del modelo frente a ataques adversariales; no se recomienda su uso en entornos de produccion sin validacion previa.
- El modelo es exclusivamente un encoder, por lo que no puede generar texto libre, mantener conversaciones ni realizar tareas generativas.
- La longitud de contexto es de 8.000 tokens, inferior a la de modelos encoder mas recientes que alcanzan los 128.000 tokens; para tareas que requieran analisis de documentos muy extensos, puede ser insuficiente.
- No se han publicado evaluaciones de sesgos o discriminacion en las lenguas y culturas del Sudeste Asiatico; los datos de entrenamiento pueden contener sesgos socioculturales no documentados.
- El riesgo de alucinacion no aplica directamente por ser un modelo encoder, pero las representaciones pueden ser erroneas en tareas de clasificacion si el ajuste fino no es adecuado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantias de rendimiento para casos de uso especificos.
- El repositorio de checkpoints es grande (46,7 GB) y contiene multiples fases de entrenamiento; los usuarios deben seleccionar el checkpoint adecuado segun su objetivo (continuar preentrenamiento vs. fine-tuning con warmup).
- La documentacion no especifica los tipos de cuantizacion disponibles ni los formatos de pesos mas alla de safetensors y checkpoints Composer.

## Enlaces

- Repositorio HuggingFace: [aisingapore/SEA-LION-ModernBERT-600M-checkpoints](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M-checkpoints)
- Modelo final (con decay de learning rate): [aisingapore/SEA-LION-ModernBERT-600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-600M)
- Modelo de embeddings asociado: [aisingapore/SEA-LION-ModernBERT-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
- Modelo de embeddings E5: [aisingapore/SEA-LION-E5-Embedding-600M](https://huggingface.co/aisingapore/SEA-LION-E5-Embedding-600M)
- Documentacion oficial SEA-LION: https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert
- Documentacion en GitHub: https://github.com/aisingapore/sealion/blob/main/models/sea-embedding/sea-modernbert.md
- Paper asociado: arxiv:2508.12243
- Contacto del equipo: sealion@aisingapore.org
