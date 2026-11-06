# sineadbuggy/my_model

## Resumen

`sineadbuggy/my_model` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning supervisado de `dslim/bert-base-NER` sobre el dataset `wnut_17`. Lo desarrolla el usuario de Hugging Face `sineadbuggy` y está pensado para la extracción de entidades nombradas en textos con ruido, que es la naturaleza del corpus WNUT 2017 (tuits y textos informales con entidades emergentes o poco convencionales). El modelo se publica con licencia MIT y un total de 107.729.677 parámetros, coherente con la arquitectura BERT-base de la que parte.

Se trata de un ajuste ligero: dos épocas de entrenamiento, learning rate de 2e-5, batch de 16 y semilla 42, con el optimizador AdamW fused y scheduler lineal. No incorpora innovaciones arquitectónicas ni decodificación generativa; es un encoder BERT clásico reutilizado como etiquetador de secuencias. Su relevancia es la de un artefacto de referencia reproducible: la model card se generó automáticamente con el `Trainer` de Transformers y declara métricas de validación en `wnut_17` sin verificación externa.

La ficha debe leerse con cautela: la información pública es mínima (sin descripción de uso previsto, sin composición de datos, sin idiomas declarados) y las métricas proceden exclusivamente del `model-index` del autor, marcadas como `verified: false`. Con 61 descargas y 0 likes en el momento de la consulta, es un modelo de bajo perfil, útil como ejemplo de fine-tuning NER y no como componente listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (fine-tuning de `dslim/bert-base-NER`) |
| Parametros totales | 107.729.677 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base; el autor no la declara) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset de entrenamiento es `wnut_17`, mayoritariamente inglés informal) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un BERT-base (encoder bidireccional de 12 capas, atención completa, ~110M parámetros) inicializado desde `dslim/bert-base-NER` y ajustado con una cabeza de clasificación de tokens sobre `wnut_17`. El entrenamiento se realizó con el `Trainer` de Transformers 5.22.0 sobre PyTorch 2.11.0+cu130, con `datasets` 3.6.0 y `tokenizers` 0.23.3. Los hiperparámetros declarados son: learning rate 2e-5, `train_batch_size` 16, `eval_batch_size` 16, semilla 42, optimizador `AdamW_TORCH_FUSED` con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 2 épocas (426 pasos totales, 213 por época). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de etiquetado).

No hay innovaciones técnicas destacables: no se usa decodificación especulativa, atención lineal, MoE ni SSM. La única particularidad es el punto de partida (`dslim/bert-base-NER`), que ya estaba ajustado para NER genérico (CoNLL-2003) y aquí se reajusta al esquema de etiquetas de WNUT 2017, orientado a entidades emergentes en texto informal. La model card no aporta detalles sobre tokenización, truncamiento de secuencias ni manejo de subwords, por lo que la longitud efectiva de entrada debe inferirse de la configuración del modelo base y no de la documentación del autor.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en textos informales, con el esquema de etiquetas de `wnut_17`.
- Detección de entidades emergentes o poco convencionales (por ejemplo, nombres de productos, handles o expresiones propias de redes sociales), que es el foco del corpus WNUT 2017.
- Salida a nivel de token con etiquetas BIO; requiere post-procesado para agregar entidades completas.
- No es un modelo generativo: no produce texto libre, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües: no declaradas; el entrenamiento en `wnut_17` sugiere un sesgo fuerte hacia inglés informal.
- No se documenta soporte de agentes ni de razonamiento encadenado.

## Casos de uso

- Extracción de entidades en redes sociales: el modelo puede etiquetar menciones, organizaciones y localizaciones en tuits o comentarios, aprovechando que `wnut_17` está construido sobre texto informal. Es adecuado por el dominio de entrenamiento, aunque el F1 de 0,5667 en validación limita su uso sin revisión humana.
- Preprocesado para pipelines de moderación de contenido: detección de entidades mencionadas en publicaciones para enrutar casos a revisores o a sistemas de bloqueo. El modelo es ligero (107,7M de parámetros) y puede ejecutarse en CPU para volúmenes moderados.
- Enriquecimiento de bases de datos de atención al cliente: extracción de nombres de productos y organizaciones de transcripciones de chats o correos informales, alimentando un CRM. Requiere umbrales de confianza y validación por el equipo de datos.
- Anonimización o pseudonimización parcial: identificación de entidades para sustituirlas antes de compartir textos con terceros. No debe usarse como única barrera de privacidad dado el recall de 0,5108.
- Generación de datasets etiquetados asistida: uso del modelo como etiquetador débil (weak labeling) para preanotar corpus y reducir el trabajo manual de anotadores, con revisión posterior.
- Prototipado y docencia en NLP: ejemplo reproducible de fine-tuning NER con `Trainer`, útil para comparar el efecto de reajustar un modelo NER genérico a un dominio informal.
- Investigación sobre robustez en dominios ruidosos: punto de partida para estudiar el rendimiento de BERT-base en WNUT 2017 y comparar con alternativas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (split de validación de `wnut_17`, `verified: false`):

| Metrica | Valor |
|---|---|
| Precision | 0,6364 |
| Recall | 0,5108 |
| F1 | 0,5667 |
| Accuracy | 0,9542 |
| Loss (validación) | 0,2275 |

Evolución durante el entrenamiento (según la model card):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 213 | 0,2147 | 0,5987 | 0,5407 | 0,5682 | 0,9546 |
| 2 | 426 | 0,2275 | 0,6364 | 0,5108 | 0,5667 | 0,9542 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros); no aplican a un modelo de clasificación de tokens. La accuracy de 0,9542 debe interpretarse con cautela: en NER con clases mayoritarias `O`, una accuracy alta es compatible con un F1 moderado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (107,7M de parámetros × 4 bytes), alrededor de 0,25 GB en fp16 y en torno a 0,15 GB en int8. El repositorio ocupa 1,9 GB, lo que incluye pesos y artefactos del `Trainer`.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para estas aceleradoras y no las aprovecha.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`; exportación a ONNX Runtime para latencia baja en CPU; `text-embeddings-inference` no aplica (no es un modelo de embeddings); vLLM y TGI no están orientados a token classification; llama.cpp no soporta este formato de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un BERT-base, en CPU se esperan decenas de milisegundos por secuencia corta y en GPU lotes de cientos de secuencias por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en WNUT 2017 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sineadbuggy/my_model` | 107,7M | no disponible | 0,5667 (validación, no verificado) | MIT | Hugging Face |
| `dslim/bert-base-NER` (modelo base) | ~110M | no disponible | no disponible en esta ficha | MIT | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355M | no disponible | no disponible en esta ficha | MIT | Hugging Face |
| `dbmdz/bert-large-cased-finetuned-conll03-english` | ~335M | no disponible | no aplica (CoNLL-2003, no WNUT) | MIT | Hugging Face |

La comparación cuantitativa con alternativas no puede completarse porque la información disponible no incluye sus resultados en WNUT 2017. El modelo base `dslim/bert-base-NER` está ajustado a CoNLL-2003 y no a entidades emergentes, por lo que la comparación directa de F1 entre ambos no es válida sin reevaluar el base en `wnut_17`.

## Limitaciones y advertencias

- Métricas no verificadas: el `model-index` marca todos los resultados como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Recall bajo (0,5108): el modelo deja sin detectar aproximadamente la mitad de las entidades reales en validación, lo que lo hace inadecuado como única capa en tareas sensibles (privacidad, cumplimiento).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de falsos positivos y de etiquetados inconsistentes en texto ambiguo.
- Sesgos conocidos: no documentados por el autor; el entrenamiento en `wnut_17` (texto informal en inglés) puede introducir sesgos de dominio y de registro lingüístico.
- Limitaciones de idioma: no se declaran idiomas soportados; el uso en castellano no está validado y probablemente degrade el rendimiento.
- Limitaciones de contexto: la longitud máxima de entrada no está documentada en la model card; debe consultarse la configuración del modelo base y aplicarse truncamiento explícito.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base y del dataset `wnut_17` para el uso previsto.
- Caveat de producción: al no haber documentación de uso previsto, composición de datos ni evaluación externa, se recomienda reevaluar en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sineadbuggy/my_model
- Modelo base: https://huggingface.co/dslim/bert-base-NER
- Perfil del autor en Hugging Face: https://huggingface.co/sineadbuggy/models
- Perfil del autor en GitHub: https://github.com/sineadbuggy
- Dataset WNUT 2017 (referencia en Hugging Face Datasets): https://huggingface.co/datasets/wnut_17
- Documentación de `Trainer` de Transformers: https://huggingface.co/docs/transformers/main_classes/trainer
