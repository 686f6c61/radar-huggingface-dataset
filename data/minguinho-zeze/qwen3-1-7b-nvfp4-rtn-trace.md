# Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-Trace

## Resumen

Qwen3-1.7B-NVFP4-RTN-Trace es un checkpoint de Qwen3-1.7B cuantizado a NVFP4 (weights de 4 bits y activaciones de entrada FP4, esquema W4A4) mediante el algoritmo RTN (round-to-nearest) y empaquetado con compressed-tensors. Lo publica el usuario Minguinho-zeze como artefacto de un experimento de post-training quantization (PTQ) sobre modelos de razonamiento, dentro del proyecto lowbit-reasoning-ptq, con el identificador de ejecución `qwen3-1.7b__nvfp4__rtn__trace`. No se realizó entrenamiento adicional: es una conversión directa del modelo base Qwen3-1.7B de Alibaba Qwen.

El interés del checkpoint es doble. Por un lado, sirve como referencia reproducible de cuantización de 4 bits en formato NVFP4 (formato de coma flotante de 4 bits con escala por bloque, orientado a las GPU Blackwell de NVIDIA) sobre un modelo pequeño de 1.720.574.976 parámetros. Por otro, publica una evaluación controlada de su impacto en tareas de razonamiento: la precisión media cae de 40,00 a 23,33 en AIME-120 y de 40,40 a 32,15 en GPQA Diamond respecto al BF16 original.

No es un modelo nuevo ni una mejora del base: es una variante cuantizada de Qwen3-1.7B, con licencia Apache-2.0 heredada del upstream. Su utilidad práctica está en entornos de serving con vLLM sobre hardware Blackwell, y su utilidad científica en el estudio de la degradación de capacidades de razonamiento bajo cuantización agresiva de pesos y activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B, modelo base); pesos cuantizados a NVFP4 con compressed-tensors |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del checkpoint; la configuracion de ejemplo de vLLM usa `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos 4 bits, activaciones de entrada FP4), group size 16, algoritmo RTN; embedding, normalizacion y `lm_head` sin cuantizar; KV cache en BF16 durante la evaluacion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3-1.7B original (transformer decoder-only con atención completa, sin mezcla de expertos) y no introduce cambios estructurales. La intervención es exclusivamente de cuantización post-entrenamiento: pesos y activaciones de entrada se representan en NVFP4 con grupo de escala de tamaño 16, aplicando RTN sin búsqueda de escalas ni corrección de error. La fracción de parámetros cuantizados es del 81,9079%; las capas de embedding, normalización y la cabeza de salida (`lm_head`) permanecen en precisión original, y la caché KV se mantuvo en BF16 durante la evaluación.

La calibración se realizó con trazas de razonamiento generadas por el propio Qwen3-1.7B en BF16 a partir de NuminaMath-1.5, excluyendo la fuente `amc_aime` y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluación para evitar contaminación. Se usaron 128 ventanas de 2.048 tokens con semilla 0. Los metadatos exactos de cuantizadores y receta están en `config.json`, `recipe.yaml` y `quant_meta.json`. No hubo RLHF, DPO ni ajuste fino posterior a la cuantización.

## Capacidades

- Generacion de texto y razonamiento multi-paso en modo thinking (`enable_thinking=True`), heredado del modelo base Qwen3.
- Resolucion de problemas matematicos y de ciencia (protocolo de evaluacion sobre AIME y GPQA Diamond).
- Conversacion multi-turno mediante plantilla de chat del tokenizer de Qwen3.
- Generacion de codigo, en la medida en que lo soporte el modelo base; el checkpoint no documenta evaluaciones propias de codigo.
- Capacidades multilingues: no documentadas en esta ficha; dependen del modelo base y no se han validado para esta cuantizacion.
- Tool calling y function calling: no documentado en la informacion disponible para este checkpoint.
- Capacidades de agente o vision/audio: no disponibles en este checkpoint.

## Casos de uso

- Serving de bajo coste en GPU Blackwell: el formato NVFP4 esta pensado para las unidades tensor de cuarta generacion de NVIDIA; desplegado con vLLM 0.32.0 o superior permite reducir el espacio de pesos frente a BF16 manteniendo el pipeline de compressed-tensors.
- Reproduccion de experimentos de PTQ: el checkpoint incluye receta, semillas y resultados, lo que permite replicar la evaluacion AIME-120/GPQA Diamond y comparar contra el BF16 original con el mismo protocolo de decodificacion (temperatura 0,6, top-p 0,95, presupuesto de 32.768 tokens).
- Estudio de degradacion de razonamiento bajo cuantizacion: util para medir cuanto margen de cuantizacion agresiva tolera un modelo de 1,7B en tareas de matematicas y ciencia antes de que la precision caiga de forma significativa.
- Prototipado de asistentes conversacionales en local con vLLM: el modelo cabe en una sola GPU y el ejemplo de carga documentado usa `gpu_memory_utilization=0.90` con contexto de 34.816 tokens.
- Evaluacion de pipelines de inferencia con caché de prefijos desactivada: la configuracion de referencia fija `enable_prefix_caching=False`, lo que facilita comparaciones deterministas entre ejecuciones.
- Base para experimentos de calibracion alternativa: al ser un checkpoint RTN puro, sirve como linea base frente a metodos con correccion de error o calibracion mas elaborada sobre el mismo modelo y dataset.
- Generacion de trazas de razonamiento sinteticas para destilacion o calibracion de otros modelos pequeños, asumiendo la perdida de precision documentada.

## Benchmarks y rendimiento

Precisión media en porcentaje sobre las semillas 0, 1 y 2. Cada semilla evalúa las mismas 120 preguntas de AIME y 198 de GPQA Diamond (repeticiones de generación, no preguntas independientes). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4 W4A4 RTN) | 23,33 | 32,15 |

El autor indica que estos resultados describen el protocolo del experimento y no son cifras oficiales de Qwen. Los resultados de efectos por factor quedan retenidos a la espera de nuevas repeticiones, y la release no atribuye las diferencias observadas a un algoritmo o método de calibración concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB en safetensors; con overhead de runtime y caché KV en BF16 para 34.816 tokens de contexto, el consumo real es superior y no está cuantificado en la información disponible.
- GPU recomendadas: el autor documenta que el experimento se ejecutó en GPU Blackwell; otras GPU y combinaciones de paquetes no han sido validadas por esta release.
- GPU de consumo: no hay validación publicada para RTX 4090 u otras GPU consumer; el soporte de NVFP4 depende de las unidades tensor de Blackwell, por lo que en arquitecturas anteriores el rendimiento puede degradarse o no estar soportado.
- Despliegue: vLLM 0.32.0 con PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17. No es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no están soportados según la información disponible.
- Nota de entorno: para INT2 el experimento añade el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming; este checkpoint es NVFP4, pero el detalle aparece en la documentación del proyecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---:|---|---:|---:|---|---|
| Qwen3-1.7B-NVFP4-RTN-Trace | 1,72B | no disponible (ejemplo vLLM: 34.816) | NVFP4 W4A4 RTN | 23,33 | 32,15 | Apache-2.0 | Hugging Face, vLLM |
| Qwen3-1.7B (BF16) | 1,72B | no disponible en esta ficha | BF16 | 40,00 | 40,40 | Apache-2.0 | Hugging Face |
| Alternativas cuantizadas de Qwen3-1.7B (GGUF, AWQ, GPTQ) | 1,72B | depende de la variante | 4-8 bits segun variante | no disponible | no disponible | Apache-2.0 (heredada) | Hugging Face, llama.cpp/Ollama para GGUF |

La comparación directa con otras cuantizaciones de Qwen3-1.7B no está disponible en la información proporcionada: no se han publicado cifras equivalentes bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Pérdida de precisión documentada y significativa en razonamiento: 16,67 puntos en AIME-120 y 8,25 puntos en GPQA Diamond respecto al BF16, con el mismo protocolo de decodificación.
- El autor retiene los resultados de efectos por factor y no atribuye las diferencias a un algoritmo o calibración concretos; no debe interpretarse como una validación general de NVFP4 RTN.
- Validación limitada a GPU Blackwell y a un stack de versiones muy concreto (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0, humming-kernels 0.1.17); otros entornos no han sido validados.
- El ejemplo de carga no se ha vuelto a ejecutar desde la revisión subida a Hugging Face, según advierte el propio autor.
- No es un release GGUF ni AutoAWQ: no puede desplegarse con llama.cpp, Ollama ni TGI en el formato publicado.
- Idiomas soportados no documentados; el comportamiento multilingüe no está validado para esta cuantización.
- Riesgo de alucinación y sesgos: no evaluados específicamente en esta release; se heredan los del modelo base y pueden amplificarse por la cuantización.
- Las puntuaciones de benchmark corresponden a repeticiones de generación sobre el mismo conjunto de preguntas, no a conjuntos independientes; la varianza entre semillas no se detalla en la información disponible.
- Licencia Apache-2.0 heredada del upstream, que permite uso comercial; conviene revisar la model card de Qwen3-1.7B para condiciones adicionales del modelo base.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-Trace
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de la evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Resultados completos guardados: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
