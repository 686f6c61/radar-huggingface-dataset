# chaoliangUNSW/Jev-Style-2B-Decision-v4.2-GGUF

## Resumen

Jev-Style-2B-Decision-v4.2-GGUF es la distribucion cuantizada en formato GGUF del modelo chaoliangUNSW/Jev-Style-2B-Decision-v4.2, un modelo de decision de aproximadamente 1.880 millones de parametros desarrollado por Chaoliang Yan (chaoliangUNSW). No es un modelo generativo al uso: dado un estado textual y un conjunto de preguntas tipadas, devuelve una probabilidad para cada opcion suministrada. El pipeline declarado en Hugging Face es text-classification y el modelo se distribuye bajo licencia Apache-2.0.

La relevancia de esta release radica en que permite ejecutar el modelo de decision fuera del stack de PyTorch, mediante un runtime propio construido sobre llama.cpp en su version C++17. El modelo base se asocia en los tags a la familia Qwen3.5 y emplea un protocolo de block-attention entrenado especificamente, con un presupuesto de entrada de 32.768 tokens y un maximo de 255 opciones por consulta.

Esta variante GGUF es exclusivamente texto y JSON: no procesa imagenes, a diferencia de la release principal en PyTorch. Se ofrece en tres precisiones (F16, Q8_0 y Q4_K_M) y esta pensada para despliegues ligeros en CPU, Apple Silicon (Metal) o GPU NVIDIA con CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con protocolo de block-attention entrenado y cabezal de verdicto (no generativo, orientado a decision) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de presupuesto de entrada; maximo 255 opciones por consulta |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer de unos 1.880 millones de parametros con un protocolo de atencion por bloques entrenado especificamente para tareas de decision. La lectura de salida (readout) consiste en el producto escalar de los estados ocultos del verdicto con la diferencia entre las filas de embedding de "si" y "no" (embedding-row difference con pesos atados), seguido de una softmax. Soporta tres tipos de pregunta —`choice`, `noul` y `score`— preservando el orden de las opciones, y aplica una temperatura global fija de 0.8813575635811984 para los tres tipos. El calculo del estado se comparte entre multiples preguntas para reducir coste.

El linaje de entrenamiento parte de la version v4 e incluye destilacion de etiquetas suaves (soft-label distillation) del API TypeSafe Jev 1.14, junto con material de entrenamiento generado y de fuentes upstream. El autor mantiene JevStyle de forma independiente, sin afiliacion ni respaldo de TypeSafe. La licencia Apache-2.0 de los pesos no relicencia los datos de terceros ni las salidas del modelo profesor. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Clasificacion y decision sobre opciones multiples: devuelve una probabilidad por cada opcion suministrada, preservando el orden.
- Tres tipos de pregunta: `choice` (eleccion entre opciones), `noul` y `score`.
- Procesamiento de multiples preguntas sobre un mismo estado con computo de estado compartido.
- Entrada en texto y JSON exclusivamente en esta build GGUF; no admite imagenes.
- Soporte de hasta 255 opciones por consulta y hasta 32.768 tokens de entrada; las peticiones fuera de presupuesto se rechazan.
- Inferencia en CPU, Apple Silicon via Metal y GPU NVIDIA via CUDA (compilacion con `-DGGML_CUDA=ON`).
- No dispone de tool calling, function calling, generacion libre de texto ni capacidades multimodales en esta release.

## Casos de uso

- Moderacion y clasificacion de contenido: dado un texto de estado y un conjunto de etiquetas candidatas, el modelo devuelve probabilidades por etiqueta, lo que permite umbralizar decisiones de forma calibrada y auditable.
- Triaje de tickets de soporte: con un estado que describa la incidencia y preguntas de tipo `choice` sobre categoria, prioridad y equipo, se obtiene una distribucion de probabilidad util para enrutado automatico.
- Evaluacion de respuestas en pipelines de QA: usar el tipo `score` para puntuar la adecuacion de una respuesta frente a un estado, integrable en sistemas de validacion automatica.
- Clasificacion de documentos JSON estructurados: al aceptar entrada JSON, puede procesar registros de formularios o eventos y decidir entre opciones predefinidas.
- Despliegue en entornos con recursos limitados: la variante Q4_K_M (1,27 GB) permite ejecutar el modelo en CPU o en GPU de gama de consumo, adecuado para servicios de clasificacion de baja latencia en el borde.
- Investigacion sobre modelos de decision: el protocolo de block-attention y el readout por diferencia de embeddings lo convierten en un objeto de estudio reproducible para experimentos de calibracion y decision con opciones multiples.
- Filtrado previo en pipelines generativos: usar el modelo como etapa de decision rapida (por ejemplo, decidir si una consulta requiere escalado a un modelo mayor) antes de invocar un LLM generativo.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Decision Index public 0.3 suite (completa) | 46,74 | Medido con el modelo original en PyTorch BF16 sobre CUDA; 140.178 peticiones puntuadas con exito |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo, ni mediciones de rendimiento especificas para las variantes GGUF.

## Requisitos de hardware

- VRAM/RAM estimada: F16 ~3,78 GB, Q8_0 ~2,01 GB, Q4_K_M ~1,27 GB (tamanos de fichero; el consumo en ejecucion es algo superior).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM para Q4_K_M; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores con Q4_K_M o Q8_0; tambien en Apple Silicon via Metal y en CPU.
- Opciones de despliegue: runtime propio sobre llama.cpp (commit 441df11f65ea0b6d0c72965aaf70c8241070ddcb) mediante `build_jev_score.sh` y `jev_style_decision_gguf.py`; requiere Python 3.12, CMake y compilador C++17. El scorer de block-attention/verdicto personalizado es obligatorio, por lo que no es compatible con runners GGUF genericos sin adaptacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Jev-Style-2B-Decision-v4.2-GGUF | 1,88 B | 32.768 tokens | Decision/clasificacion con opciones | Apache-2.0 | GGUF |
| Jev-Style-2B-Decision-v4.2 (base) | 1,88 B | 32.768 tokens | Decision/clasificacion, con soporte de imagenes | Apache-2.0 | safetensors (PyTorch) |
| Modelos de clasificacion tipo BERT/RoBERTa | 0,1-0,4 B | 512 tokens tipicamente | Clasificacion de etiqueta unica | MIT/Apache-2.0 | safetensors, ONNX |
| LLM generativos de ~2 B (p. ej. familia Qwen) | ~2 B | 32.000+ tokens | Generacion de texto | Apache-2.0 u otras | safetensors, GGUF |

La comparacion directa con clasificadores BERT no es equivalente: Jev-Style devuelve probabilidades sobre conjuntos arbitrarios de opciones por consulta en lugar de una etiqueta fija, y admite contexto mucho mayor. Frente a LLM generativos del mismo tamano, la diferencia es funcional: este modelo no genera texto, sino que puntua opciones.

## Limitaciones y advertencias

- Esta build GGUF no procesa imagenes; para entrada multimodal hay que usar la release principal en PyTorch.
- El modelo no es generativo: no produce texto libre ni admite tool calling; su unica salida es una distribucion de probabilidad sobre opciones.
- Requiere un runtime personalizado (scorer de block-attention/verdicto); no funciona con llama.cpp estandar ni con Ollama/vLLM sin adaptacion.
- Las peticiones que superan 32.768 tokens de entrada o 255 opciones se rechazan, no se truncan.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles no esta documentado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de decision, el riesgo se traduce en probabilidades mal calibradas mas que en texto inventado.
- La licencia Apache-2.0 cubre los pesos, pero no relicencia datos de terceros ni salidas del modelo profesor (TypeSafe Jev 1.14); revisar `LICENSE`, `NOTICE` y la model card del modelo padre antes de uso comercial.
- El resultado de 46,74 en Decision Index es una autoevaluacion del autor sobre el modelo original en BF16, no sobre estas variantes cuantizadas; la cuantizacion puede degradar la calibracion.
- Proyecto mantenido de forma independiente y sin afiliacion a TypeSafe.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2
- Bundle de resultados de evaluacion: https://huggingface.co/datasets/chaoliangUNSW/decision-index-results-v4.2
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
