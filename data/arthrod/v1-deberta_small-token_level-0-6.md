# arthrod/v1-deberta_small-token_level-0-6

## Resumen

`arthrod/v1-deberta_small-token_level-0-6` es un modelo de clasificacion de tokens (token-level) construido con la libreria GLiNER sobre el backbone `microsoft/deberta-v3-small`, desarrollado por el usuario de HuggingFace arthrod. Su objetivo declarado era la deteccion zero-shot de informacion personal identificable (PII) en portugues de Brasil e ingles, entrenado **desde cero** sobre un corpus sintetico de aproximadamente 1,03 millones de ejemplos. El propio autor lo etiqueta como `legacy` y `failed-run`.

La relevancia de esta ficha no es tecnica en el sentido habitual: el modelo **no funciona**. El run de entrenamiento registro una `train loss`, `eval loss` y `grad-norm` de exactamente 0,0 desde el paso 10 hasta el paso 17.000, y la unica evaluacion registrada le otorgo 0,0000 en todas las metricas. Se conserva unicamente como registro historico y material forense para depurar el fallo, no como artefacto utilizable.

El autor recomienda explicitamente no usarlo y redirige a sus alternativas actuales para PII en pt-BR: `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` y `arthrod/gliner-opf-ptbr-pii-v1`. El repositorio ocupa 21,6 GB, aunque el fichero de pesos real (forma parte de un push intermedio de entrenamiento) pesa 617 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (atención desenredada, variante small), con cabecera de clasificacion de tokens de GLiNER; entrenamiento token-level desde cero |
| Parametros totales | No disponible en la model card; el modelo base `microsoft/deberta-v3-small` tiene ~141 M segun especificaciones publicas (44 M de backbone + ~98 M de embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base DeBERTa-v3-small usa 512 tokens |
| Tipos de cuantizacion | No se documentan cuantizaciones; pesos en float32 (`pytorch_model.bin`) y exportacion ONNX sin cuantizar |
| Idiomas soportados | Portugues (pt, con enfasis en pt-BR) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`, 617 MB) y ONNX (`onnx/model.onnx`, opset 19, 618 MB); tokenizer SentencePiece de DeBERTa-v3 (`tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v3-small de `microsoft/deberta-v3-small` con `vocab_size` de 128.100 segun la configuracion corregida el 2026-03-19. Sobre ese backbone se aplico una cabecera token-level de GLiNER, con la particularidad de que el run partia de `prev_path: "none"`, es decir, sin inicializar desde un checkpoint GLiNER previo: se intento entrenar el esquema completo desde cero. El entrenamiento se ejecuto en una unica GPU MI300X entre el 24 y el 25 de febrero de 2026, dentro del run `h-gliner-token-full-v1` (config `configs/vanilla_h.yaml`), sobre el mismo corpus sintetico de PII de ~1,03 M de ejemplos usado por `arthrod/v1-deberta_large-token_level-1-7`.

El run estaba planificado para 60.000 pasos, pero se detuvo en el paso 17.000 al caerse un worker del DataLoader; el Trainer habia ido publicando checkpoints cada 500 pasos. El problema de fondo es que la perdida y la norma del gradiente fueron identicamente 0,0 desde el paso 10, de modo que los pesos nunca se actualizaron con un objetivo funcional. La causa raiz no se confirmo; el log de experimento `arthrod/attempt_vanilla` senala dos sospechosos: pasar `prev_path: "none"` como cadena de texto y un `class_token_index` fijado en el codigo. No hubo RLHF, DPO ni ninguna fase de alineamiento. Historicamente, la carga del modelo fallaba con el error "Saved embeddings (128100) vs model expects (128004)", resuelto al fijar `vocab_size=128100` en `gliner_config.json`.

## Capacidades

- Generacion de texto: no aplica; es un modelo de clasificacion de tokens, no generativo.
- Extraccion de entidades (NER) zero-shot mediante esquema textual de etiquetas: capacidad **nominal** de GLiNER, no funcional en este checkpoint.
- Deteccion de PII en portugues de Brasil (CPF, CNPJ, correo, telefono y similares segun el esquema del corpus): objetivo declarado del entrenamiento, no alcanzado.
- Capacidad multilingue limitada a pt (pt-BR) e ingles.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Vision, audio o modo de pensamiento: no soportado.
- Estado real verificado: la unica evaluacion registrada devuelve 0,0000 en todas las metricas y las predicciones esperadas son vacias o sin sentido.

## Casos de uso

- Analisis forense de runs fallidos: el repositorio documenta un caso reproducible de perdida y grad-norm en cero durante 17.000 pasos, util para estudiar como diagnosticar objetivos que no propagan gradiente en entrenamientos GLiNER.
- Auditoria de configuraciones de GLiNER: `gliner_config.json` sirve como ejemplo practico del desajuste `vocab_size` entre pesos guardados (128100) y valor esperado por la libreria (128004), y de su correccion.
- Baseline negativo de control: al puntuar 0,0000 de forma consistente, puede emplearse como cota inferior trivial en comparaciones contra los modelos de PII pt-BR de la suite actual del mismo autor.
- Validacion de pipelines de exportacion ONNX: el artefacto `onnx/model.onnx` (opset 19, 618 MB) permite probar rutas de carga y ejecucion en ONNX Runtime con un modelo cuyo comportamiento es conocido y no util.
- Formacion y docencia sobre reproducibilidad: ilustra como un fallo de DataLoader puede terminar un run parcialmente, como se comportan los push intermedios del Trainer y por que no deben publicarse checkpoints sin evaluacion.
- Reutilizacion del tokenizer: el tokenizer SentencePiece de DeBERTa-v3 incluido puede reutilizarse en prototipos de tokenizacion pt/en independientemente del estado de los pesos.
- Para cualquier uso productivo real de deteccion de PII en pt-BR debe recurrirse a los modelos recomendados por el autor, no a este checkpoint.

## Benchmarks y rendimiento

La model card indica que el unico benchmark registrado puntuo 0,0000 en todas las metricas (procedente del barrido de febrero de 2026 recogido en `arthrod/gliner_eval_folder`). No se detallan los nombres de las metricas ni los conjuntos de evaluacion empleados.

| Evaluacion | Resultado |
|---|---|
| Unico benchmark registrado (metricas no especificadas) | 0,0000 en todas las metricas |

No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los pesos ocupan 617 MB, por lo que la inferencia cabe en aproximadamente 1,5-2 GB de VRAM con overhead de activaciones y runtime; la exportacion ONNX ocupa 618 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente a nivel de memoria, dado el tamano del modelo; el entrenamiento original se ejecuto en una AMD MI300X.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.), aunque el modelo no produce resultados utiles.
- Opciones de despliegue: libreria GLiNER mediante `GLiNER.from_pretrained()` y ONNX Runtime para el fichero `onnx/model.onnx`. No hay GGUF, por lo que no es desplegable en llama.cpp ni en Ollama; tampoco se documenta soporte de vLLM ni TGI (no aplica a clasificacion de tokens con cabecera GLiNER).
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio ocupa 21,6 GB por el historial de revisiones LFS; la descarga selectiva con `allow_patterns=["gliner_config.json", "pytorch_model.bin", "tokenizer*.json"]` reduce el peso a ~617 MB.

## Comparativa con modelos similares

| Modelo | Enfoque | Estado | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arthrod/v1-deberta_small-token_level-0-6` | GLiNER token-level sobre DeBERTa-v3-small, desde cero | Fallido (loss 0,0; metricas 0,0000) | pt, en | Apache 2.0 | Publico, no utilizable |
| `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` | GLiNER sobre mmBERT-small, PII pt-BR | Recomendado por el autor como sustituto | pt-BR | No disponible en la informacion proporcionada | Publico |
| `arthrod/gliner-opf-ptbr-pii-v1` | Fine-tune del OpenAI Privacy Filter para PII pt-BR | Suite actual | pt-BR | No disponible en la informacion proporcionada | Publico |
| `arthrod/v1-deberta_large-token_level-1-7` | GLiNER token-level sobre `knowledgator/gliner-pii-large-v1.0`, 8.000 pasos | Legacy con metricas de evaluacion disponibles | pt, en | No disponible en la informacion proporcionada | Publico |

No se dispone de datos de parametros, contexto ni rendimiento numerico de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita al enfoque, estado y disponibilidad.

## Limitaciones y advertencias

- **Modelo no funcional**: el autor lo marca como "failed run: do not use". La perdida y la norma del gradiente fueron exactamente 0,0 del paso 10 al 17.000, y la unica evaluacion registrada da 0,0000 en todas las metricas.
- **Entrenamiento incompleto**: el run planificado para 60.000 pasos se aborto en el 17.000 por la caida de un worker del DataLoader.
- **Causa raiz sin confirmar**: solo se apuntan dos hipotesis (`prev_path: "none"` como cadena y un `class_token_index` fijado), sin verificacion publicada.
- **Riesgo de salidas vacias o sin sentido**: cargar el modelo no garantiza predicciones utiles; la propia model card indica que se espere una salida vacia o carente de significado.
- **Problema historico de carga**: hasta la correccion de `gliner_config.json` del 2026-03-19, la carga fallaba por desajuste de `vocab_size` (128100 frente a 128004).
- **Sesgos**: no hay informacion sobre sesgos; al no haberse entrenado con un objetivo funcional, no puede caracterizarse su comportamiento.
- **Alucinacion**: no aplica en el sentido generativo (no produce texto libre), pero si en forma de etiquetas espurias si los pesos se cargan en produccion por error.
- **Idiomas**: solo pt (pt-BR) e ingles; el rendimiento real en cualquiera de los dos es nulo.
- **Licencia**: Apache 2.0 permitiria uso comercial, pero el modelo no es apto para produccion por su estado funcional.
- **Placeholder en la configuracion**: `gliner_config.json` contiene el literal `<HUB_TOKEN>` en el campo `hub_token`, lo que debe revisarse antes de cualquier uso.
- **Para PII en pt-BR en produccion**, utilizar los modelos recomendados: `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` o `arthrod/gliner-opf-ptbr-pii-v1`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/v1-deberta_small-token_level-0-6
- URL original (redirige al anterior): https://huggingface.co/arthrod/h-gliner-token-full-v1
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Log de experimento del run: https://huggingface.co/arthrod/attempt_vanilla
- Sustituto recomendado (mmBERT-small, PII pt-BR): https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Alternativa OpenAI Privacy Filter para PII pt-BR: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Modelos Ettin de la suite actual: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1, https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1, https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Modelo relacionado (DeBERTa-large token-level): https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- Modelo relacionado (checkpoints legacy): https://huggingface.co/arthrod/c3750-mdeberta_base-vanilla-1-2, https://huggingface.co/arthrod/c5k-deberta_base-token_level-1-2, https://huggingface.co/arthrod/v0-ettin68m-token_level-0-3
- Dataset de benchmark de la suite actual: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Dataset de revision comparativa de salidas GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Dataset del barrido de evaluacion (origen de las metricas de los repos legacy): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Demo interactiva de la suite actual: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo; tratan sobre artrodesis (fusion vertebral) en fuentes medicas en frances y espanol, por lo que no se incluyen como referencias.
