# open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3

## Resumen

El modelo `sft__ot30k_open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3`, publicado por la organizacion open-sci en Hugging Face, es el resultado de un ajuste fino supervisado (SFT) sobre una base de la familia open-sci-ref de 1.7B parametros. El nombre del checkpoint codifica buena parte de su linaje: un modelo base entrenado sobre FineWeb-Edu (1.4T tokens), con una fase intermedia de razonamiento (300B tokens) y una fase de SFT sobre el dataset Tulu3 con ejemplos de hasta 16k tokens de longitud.

El modelo resuelve el problema de adaptar una base pequena (1.7B) a tareas de razonamiento y seguimiento de instrucciones con contexto largo, mediante un pipeline de entrenamiento por etapas documentado en el propio identificador. Es relevante para desarrolladores e investigadores que necesitan un modelo compacto, desplegable en hardware modesto, con pesos en safetensors y compatible con el ecosistema transformers y llama-factory.

La informacion publica es escasa: la model card es autogenerada por el Trainer, no incluye descripcion de uso previsto ni resultados de evaluacion, y los enlaces de busqueda no aportan documentacion adicional del autor. La ficha siguiente refleja exclusivamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida de la familia open-sci-ref; no confirmada en la model card) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible de forma explicita; el SFT se realizo con ejemplos de hasta 16k tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, terminos no detallados en la model card) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3.4 GB |
| Libreria | transformers 4.57.3 |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el identificador y por el tag `llama-factory` se trata de un transformer decoder-only de la familia open-sci-ref, con 1.714.377.728 parametros totales. El pipeline declarado es `feature-extraction`, aunque el proceso de SFT con Tulu3 sugiere un uso generativo; esta discrepancia es habitual en checkpoints subidos automaticamente por el Trainer.

El entrenamiento consta de varias etapas segun el nombre del checkpoint: preentrenamiento sobre FineWeb-Edu (1.4T tokens), una fase de razonamiento de 300B tokens, y un SFT final sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras) con secuencias de hasta 16k tokens y estilo Tulu3. Los hiperparametros documentados son: learning rate 4e-05, batch total 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de gradientes 4), optimizador AdamW fused con betas (0.9, 0.999), scheduler coseno con warmup del 10 %, 5 epocas y semilla 42. Se desconoce si hubo RLHF o DPO posteriores; no se mencionan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y seguimiento de instrucciones derivado del SFT sobre Tulu3.
- Razonamiento multi-paso, heredado de la fase intermedia de 300B tokens de razonamiento.
- Manejo de contextos largos de hasta 16k tokens en el entrenamiento, adecuado para documentos extensos.
- Capacidad de extraccion de caracteristicas (pipeline `feature-extraction` declarado).
- Compatibilidad con llama-factory para reentrenamiento o ajuste adicional.
- Soporte de tool calling y function calling: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponibles.
- Idiomas soportados: no disponibles.

## Casos de uso

- Clasificacion y extraccion de caracteristicas: al declarar el pipeline `feature-extraction`, el modelo puede generar embeddings de fragmentos de texto para busqueda semantica o clustering, aprovechando sus 1.7B parametros y su contexto de hasta 16k tokens.
- Procesamiento de documentos largos: resumen o extraccion de informacion de contratos, informes o articulos de hasta 16k tokens, gracias al entrenamiento con secuencias largas.
- Razonamiento asistido en entornos con recursos limitados: al ser un modelo de 1.7B, puede desplegarse en una unica GPU consumer para tareas de analisis y respuesta a preguntas.
- Generacion de codigo y explicaciones tecnicas: el SFT sobre Tulu3 incluye datos de instrucciones tecnicas, por lo que es adecuado para asistencia en documentacion y ejemplos de codigo.
- Base para ajuste fino especifico de dominio: su compatibilidad con llama-factory y sus pesos safetensors permiten reentrenarlo sobre datos propios con un coste computacional moderado.
- Prototipado de agentes conversacionales: con contexto de 16k tokens puede mantener dialogos multi-turno con historial extenso, aunque la ausencia de datos sobre tool calling limita su uso en agentes que requieran invocar APIs.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `sft__f679a5c592c8dffb__open-sci-re-e1f086da__sdpa-open-sci-steps` pero sin resultados asociados (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3.4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, en torno a 1 GB, aunque no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para entrenamiento o lotes grandes.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM para fp16 con contexto corto.
- Opciones de despliegue: transformers (version 4.57.3 o superior), llama-factory para ajuste, y potencialmente vLLM o TGI si se convierte a los formatos soportados; no se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci SFT 1.7B (este modelo) | 1.714.377.728 | hasta 16k en entrenamiento | other | Hugging Face, 24 descargas |
| Modelos de la familia open-sci-ref base | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de 1.7B de proposito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta usos previstos, limitaciones ni datos de evaluacion; se recomienda validar el modelo en el dominio objetivo antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de 1.7B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (idioma dominante en FineWeb-Edu y Tulu3) puede ser limitado.
- La licencia `other` no detalla condiciones de uso comercial; es necesario revisar los terminos del autor antes de desplegarlo.
- El pipeline declarado (`feature-extraction`) no coincide con el uso generativo esperado tras el SFT; conviene verificar la configuracion de generacion.
- No se ofrecen pesos cuantizados ni garantias de compatibilidad con motores de inferencia distintos de transformers.
- El contexto maximo real no esta confirmado; los 16k tokens corresponden a la longitud de entrenamiento, no necesariamente al limite arquitectonico.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web proporcionada.
