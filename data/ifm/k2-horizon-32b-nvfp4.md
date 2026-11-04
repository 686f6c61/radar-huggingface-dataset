# IFM/K2-Horizon-32B-NVFP4

## Resumen

K2-Horizon-32B-NVFP4 es la versión cuantizada a NVFP4 de K2-Horizon-32B, un modelo de lenguaje decoder-only de tipo dense desarrollado por IFM. Se distribuye como un checkpoint de la etapa 1 (Stage1) del entrenamiento del modelo base, con la particularidad de que todos los pesos lineales, excepto `lm_head`, están cuantizados en formato NVFP4 (tanto pesos como activaciones), lo que reduce la huella de memoria y permite inferencia más rápida en hardware con soporte nativo para este formato.

El modelo base pertenece a la familia K2-Horizon y se presenta como el miembro dense de gran tamaño de la familia, con una ventana de contexto nativa de 512K tokens (524.288) a partir de las etapas de midtraining. IFM publica el modelo como "fully open", con la intención de liberar datos de entrenamiento, receta y código de entrenamiento, y de publicar checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento.

La relevancia de esta ficha concreta es doble: por un lado, ofrece un baseline dense de 32B con contexto muy largo; por otro, sirve como referencia de despliegue en precisión reducida NVFP4, un formato pensado para GPUs NVIDIA de generación Blackwell o posterior. El autor advierte de que el checkpoint final aún no se ha publicado y de que esta es la etapa 1 del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only dense (familia k2_horizon) |
| Parámetros totales | 20.686.444.416 (~20,7B según safetensors); la model card declara 32B |
| Parámetros activos | No aplica (modelo dense) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde midtraining |
| Tipos de cuantización | NVFP4 (pesos y activaciones) en todas las capas lineales excepto `lm_head`; tag de 8-bit / compressed-tensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo dense, sin mezcla de expertos. La model card indica que el modelo se entrena en etapas (stage 1 y stage 2) y que esta release corresponde a la etapa 1; se anuncia la publicación de checkpoints intermedios para poder estudiar cambios de capacidad a lo largo del entrenamiento en lugar de en un único punto final. El contexto nativo de 524.288 tokens se establece a partir de las etapas de midtraining.

Los datos de entrenamiento referenciados son IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, y el autor enlaza un repositorio de navegación de datos (DATA_NAVIGATOR) junto con el código de entrenamiento (xllm) y de evaluación (Eval360). No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable de esta release es la cuantización NVFP4 de pesos y activaciones en todas las capas lineales salvo `lm_head`, que requiere GPUs NVIDIA Blackwell (serie B) o posteriores con soporte nativo de NVFP4.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de text-generation.
- Razonamiento y tareas de agente evaluadas en los benchmarks de la familia (agentic, coding y reasoning).
- Generación de código y matemáticas, según los conjuntos de evaluación reportados por el autor.
- Ventana de contexto muy larga (512K tokens) para documentos extensos y conversaciones multi-turno largas.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, visión, audio ni modo thinking.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 512K tokens de contexto, el modelo puede ingerir grandes volúmenes de código o documentación en una sola pasada y responder preguntas sobre ellos sin técnicas de recuperación.
- Asistentes de código en pipelines de CI/CD: generación y revisión de parches sobre fragmentos amplios de un proyecto, aprovechando el contexto largo para mantener coherencia entre ficheros.
- Atención al cliente con historial prolongado: conversaciones multi-turno que acumulan mucho contexto sin truncar, adecuado para soporte técnico de casos complejos.
- Procesamiento de contratos y documentos legales: resumen y extracción de cláusulas en documentos de decenas de miles de tokens, en inglés.
- Evaluación comparativa de checkpoints: al publicarse checkpoints intermedios, sirve para estudiar la evolución de capacidades durante el entrenamiento en un entorno de investigación.
- Despliegue de alto rendimiento en hardware Blackwell: inferencia en NVFP4 para reducir memoria y aumentar throughput en servidores con GPUs B-series.
- Baseline de investigación para modelos dense de 32B: referencia abierta (licencia Apache 2.0, datos y código anunciados) para experimentos reproducibles.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a Qwen3.8-27B, Muse Glimmer-30B e IBM Granite 4.2 30B, pero en la información proporcionada solo se recogen las filas de número de parámetros, parámetros activos y arquitectura; los valores numéricos de los benchmarks no están disponibles en el extracto. El autor indica que el modelo NVFP4 muestra un rendimiento ligeramente inferior al modelo BF16 original en sus evaluaciones.

| Modelo | Parámetros | Activos | Arquitectura |
|---|---|---|---|
| K2-Horizon-32B-Stage1 | 32B | 32B | Dense |
| Qwen3.8-27B | 27B | 27B | No disponible en el extracto |
| Muse Glimmer-30B | 30B | 30B | No disponible en el extracto |
| IBM Granite 4.2 30B | 30B | 30B | No disponible en el extracto |

No se han publicado en la información disponible los resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell (serie B) o posterior, con soporte nativo de NVFP4. No es desplegable en GPUs sin esa capacidad.
- VRAM estimada: el repositorio ocupa 23,3 GB, por lo que se necesita al menos ese espacio para los pesos; hay que añadir memoria para el contexto KV, que con 512K tokens puede ser muy elevada y requiere planificación cuidadosa.
- GPUs recomendadas: B200 u otras Blackwell de centro de datos; las RTX de generación anterior no soportan NVFP4 de forma nativa.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el requisito de arquitectura Blackwell limita las opciones consumer actuales.
- Opciones de despliegue: transformers (librería declarada) con soporte compressed-tensors; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor afirma que NVFP4 habilita inferencia más rápida en hardware compatible, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| K2-Horizon-32B-NVFP4 | ~20,7B reales (32B declarados) | 512K | Apache 2.0 | HuggingFace, requiere Blackwell | Checkpoint stage 1; cuantizado NVFP4 |
| Qwen3.8-27B | 27B | No disponible | No disponible | No disponible | Comparativo citado por el autor |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Comparativo citado por el autor |
| IBM Granite 4.2 30B | 30B | No disponible | No disponible | No disponible | Comparativo citado por el autor |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no figuran en la información proporcionada; solo se dispone de sus tamaños y de su inclusión en la tabla de benchmarks del autor.

## Limitaciones y advertencias

- Checkpoint no final: el autor indica explícitamente que el checkpoint final está pendiente de publicación; esta es la etapa 1 del entrenamiento.
- Pérdida de calidad por cuantización: el propio autor reconoce un rendimiento ligeramente inferior al modelo BF16 en sus evaluaciones.
- Restricción de hardware: solo funciona en GPUs NVIDIA Blackwell o posteriores con NVFP4 nativo, lo que limita portabilidad y opciones de despliegue.
- Idioma: únicamente inglés declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto largo y memoria: 512K tokens de contexto implican un coste de KV cache muy elevado; no se documentan técnicas de compresión de contexto.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación en la información disponible.
- Datos de entrenamiento: no se detalla la composición ni el volumen del corpus, lo que dificulta auditar procedencia y sesgos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datasets referenciados y de los checkpoints intermedios.

## Enlaces

- [HuggingFace: IFM/K2-Horizon-32B-NVFP4](https://huggingface.co/IFM/K2-Horizon-32B-NVFP4)
- [Modelo base: IFM/K2-Horizon-32B](https://huggingface.co/IFM/K2-Horizon-32B)
- [Código de entrenamiento (xllm)](https://github.com/ifm-ai/xllm)
- [Código de evaluación (Eval360)](https://github.com/ifm-ai/Eval360)
- [Navegador de datos de entrenamiento (DATA_NAVIGATOR)](https://github.com/ifm-ai/DATA_NAVIGATOR)
- [Dataset de pretraining: IFM/K2-Horizon-Pretrain-Data](https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data)
- [Dataset de midtraining: IFM/K2-Horizon-Midtrain-Data](https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data)
