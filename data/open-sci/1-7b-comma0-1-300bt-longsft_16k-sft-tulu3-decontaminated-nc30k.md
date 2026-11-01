# open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) de la familia Comma, un transformer decoder-only de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones). Lo publica la organización open-sci sobre el checkpoint intermedio `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated`, que a su vez deriva de un preentrenamiento de 300 mil millones de tokens con contexto extendido a 16k. El ajuste se ha realizado con LLaMA-Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf.

Se trata de un modelo pequeño orientado a investigación y a experimentación con pipelines de ajuste reproducible. Su relevancia actual es doble: por un lado, forma parte de una cascada de SFT sobre un modelo base entrenado con datos de Tulu 3 decontaminados, lo que lo hace útil como referencia para estudiar recetas de alineación a pequeña escala; por otro, su tamaño permite ejecutarlo en GPUs de consumo y sirve como banco de pruebas para técnicas de evaluación y decontaminación de datos.

La model card está generada automáticamente por el Trainer y no documenta usos previstos, composición del dataset ni resultados de evaluación. La licencia figura como "other" sin texto asociado en la información disponible, lo que limita su uso comercial hasta que el autor aclare los términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Comma), `custom_code`, entrenado con LLaMA-Factory |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16k tokens (heredada del checkpoint base, segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7 B de parámetros con código personalizado (`custom_code` en los tags), lo que implica que requiere `trust_remote_code=True` para cargarse con Transformers. Hereda del checkpoint base `ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated`, cuyo nombre sugiere un preentrenamiento de 300 mil millones de tokens, un ajuste de contexto largo a 16k y una fase SFT sobre datos derivados de Tulu 3 con decontaminación aplicada. No se dispone de detalles sobre la composición exacta del corpus de preentrenamiento ni sobre si se aplicaron fases de RLHF o DPO.

El ajuste fino de esta versión se ha realizado con LLaMA-Factory sobre el dataset `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf`, con los siguientes hiperparámetros: learning rate 4e-5, scheduler coseno con warmup del 10 %, 5 épocas, batch total de 128 (batch por dispositivo 1, acumulación de gradiente 4, 32 dispositivos), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42. El entrenamiento se ejecutó en modo full fine-tuning (tag `full`), no con LoRA ni QLoRA, con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, mezcla de expertos) más allá de las propias de la familia Comma y del ajuste de contexto largo a 16k.

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only de 1,7 B.
- El pipeline declarado en HuggingFace es `feature-extraction`, por lo que el modelo puede usarse para extraer representaciones ocultas además de para generación.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni de razonamiento multi-paso con agentes.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- El soporte multilingüe no está declarado; los idiomas figuran como no disponibles.
- El ajuste sobre un dataset de tipo ShareGPT sugiere capacidad de mantener conversaciones multi-turno, aunque no se especifica la calidad resultante.

## Casos de uso

- Investigación sobre recetas de SFT: el modelo sirve como punto de comparación reproducible para estudiar el efecto de 5 épocas de SFT con learning rate 4e-5 sobre un base de 1,7 B, gracias a que los hiperparámetros están documentados en la model card.
- Evaluación de decontaminación de datos: al derivar de un base con Tulu 3 decontaminado, permite medir cómo se comporta un modelo pequeño ante benchmarks potencialmente filtrados y validar metodologías de evaluación.
- Extracción de embeddings para clasificación o clustering: el pipeline `feature-extraction` y el tamaño de 1,7 B permiten usar las representaciones internas en tareas de recuperación o análisis semántico en entornos con recursos limitados.
- Prototipado de asistentes conversacionales en local: con 1,7 B de parámetros cabe en GPUs de consumo y permite iterar sobre prompts y formatos de chat sin depender de APIs externas.
- Generación de datos sintéticos para ajuste de modelos mayores: el modelo puede producir pares pregunta-respuesta o resúmenes a bajo coste computacional, útiles como material de destilación.
- Experimentos de contexto largo: la ventana de 16k permite probar tareas de resumen de documentos extensos o QA sobre múltiples pasajes en un modelo pequeño, midiendo la degradación respecto a modelos mayores.
- Docencia y formación: sirve para ilustrar el ciclo completo de preentrenamiento, SFT y evaluación en un tamaño manejable, con trazabilidad de hiperparámetros y framework.

## Benchmarks y rendimiento

La model card declara una entrada en `model-index` con el nombre `sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__1-7b-Comma0-b66d70fa__sdpa-open-sci-0a87ab57`, pero la lista de resultados está vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,4-4 GB solo para pesos; con caché KV para 16k tokens y overhead de activaciones, entre 6 y 10 GB según batch y longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, alrededor de 1 GB, más caché KV.
- GPUs recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); A100 o H100 solo tienen sentido para entrenamiento o serving de alto throughput.
- Cabe en GPUs de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM y TGI si soportan la arquitectura Comma, y llama.cpp/Ollama solo si existe conversión a GGUF (no publicada en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-Comma0.1-...-nc30k | 1,7 B | 16k | other | HuggingFace, 15 descargas | SFT sobre base Comma; sin benchmarks |
| ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated | 1,7 B | 16k | no disponible | HuggingFace | Checkpoint base del anterior |
| Llama 3.2 1B Instruct | 1,2 B | 128k | Llama 3.2 Community License | HuggingFace, ampliamente adoptado | Ecosistema maduro, tooling estándar |
| Qwen2.5 1.5B Instruct | 1,5 B | 32k | Apache 2.0 | HuggingFace | Licencia permisiva y buen soporte multilingüe |

La comparación con Llama 3.2 1B y Qwen2.5 1.5B es orientativa por tamaño y categoría; no se dispone de resultados de benchmarks del modelo Comma que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta usos previstos, limitaciones ni composición del dataset de entrenamiento.
- Licencia "other" sin texto publicado: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el repositorio base.
- Riesgo de alucinación no cuantificado; al ser un modelo de 1,7 B, la tasa esperada de errores factuales es alta en tareas de conocimiento.
- Idiomas soportados no declarados; el rendimiento fuera del inglés es incierto.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor y revisarlo antes de desplegar en producción.
- No hay resultados de benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El ajuste de 5 épocas sobre un dataset de 30k ejemplos puede inducir sobreajuste al formato del dataset y reducir la diversidad de respuestas.
- No se garantiza compatibilidad con vLLM, TGI u Ollama sin verificación previa de la arquitectura Comma.
- El número de descargas (15) y de likes (0) indica adopción muy baja, con escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-sci/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-Comma0.1-300BT-longsft_16k-SFT-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf: no disponible como enlace público en la información proporcionada
- Paper o blog del modelo: no disponible
- Demo: no disponible
