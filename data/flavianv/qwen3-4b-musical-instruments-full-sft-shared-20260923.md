# flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923

## Resumen

El modelo `flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923` es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen3-4B`, orientado a una tarea muy concreta: recomendar títulos de productos de un catálogo del dominio de instrumentos musicales a partir de una consulta de usuario. No es un adaptador LoRA ni una cabeza de scoring: se han entrenado los 4.022.468.096 parámetros del modelo, y los pesos almacenados están en FP32 (cargables en BF16 para inferencia). Lo desarrolla el usuario `flavianv` y se publica en HuggingFace el 23 de septiembre de 2026.

El problema que aborda es el de recomendación generativa con formato estructurado: dado un *query* positivo, el modelo produce un JSON `{"titles": [...]}` con títulos de productos recuperados del catálogo. El entrenamiento parte de 8.937 ejemplos positivos del split `Musical_Instruments/shared_train.jsonl` del dataset `iaouali/amazon-benchmark` y se apoya en un recuperador semántico fijado que mapea cada título a un ID de producto único. La relevancia práctica es acotada: es un experimento de investigación sobre recomendación, no un modelo generalista, y su utilidad depende de reproducir el pipeline de recuperación del autor.

Se trata de un modelo denso (no MoE) de aproximadamente 4.000 millones de parámetros, con el mismo esqueleto que Qwen3-4B. La ventana de contexto, los idiomas y la licencia no se especifican en la información proporcionada. Las métricas publicadas son de validación interna sobre 100 consultas reservadas y no constituyen un test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del base Qwen/Qwen3-4B (el ajuste no modifica la arquitectura) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | No disponibles; los pesos se almacenan en FP32 y se pueden cargar en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B` (revision `1cfa9a7208912126459214e8b04321603b3df60c`), un transformer decoder-only denso de unos 4.000 millones de parámetros. El autor no introduce cambios estructurales: se trata de un ajuste de parámetros completos sobre esa base, con salida de texto en formato JSON. El objetivo de entrenamiento es cross-entropy causal *completion-only* (solo se calcula la pérdida sobre la respuesta), promediada por token e incluyendo el token EOS. No se emplea *ranking loss* ni ninguna cabeza escalar de recompensa.

El conjunto de entrenamiento consta de 8.937 ejemplos positivos de consulta/bundle procedentes de `iaouali/amazon-benchmark`, archivo `Musical_Instruments/shared_train.jsonl` (revision `dff21e0663b474d85ee5a02ee0711f67c87471d9`, SHA256 del origen `e98a10ff...`). Los objetivos son JSON `{"titles": [...]}` con títulos del catálogo. Hiperparámetros: learning rate 5e-6, AdamW, decaimiento coseno, 3% de warmup, batch efectivo 16 (microbatch 2, acumulación 8), semilla 42, gradient clipping 1 y gradient checkpointing. Se usa forward en BF16 con parámetros en FP32. La ejecución completa consta de 559 updates y tardó 26 minutos y 5 segundos en una B200 MIG 3g.90gb.

El autor seleccionó el checkpoint 420 (epoch 0.7518) de una única época de SFT. La selección se hizo sobre las mismas 100 consultas reservadas, comparando contra el modelo base y evaluando cada cuarto de época, con cuatro bundles generados por consulta y un criterio de cobertura de referencias best-of-four (intersección máxima de IDs de referencia, no selección por modelo de recompensa). El checkpoint 420 empata con el final en cobertura y se retuvo por tener menos salidas inválidas.

## Capacidades

- Generacion de texto conversacional: el modelo usa la plantilla de chat guardada, con `enable_thinking=False` en la evaluacion del autor.
- Salida estructurada en JSON: produce objetos `{"titles": [...]}` con titulos de productos del catalogo de instrumentos musicales.
- Recomendacion de productos: dado un query, genera un bundle de titulos de productos del dominio `Musical_Instruments`.
- Generacion multi-muestra: la evaluacion usa temperatura 0.7, top-p 0.9, top-k 20 y maximo de 512 tokens nuevos, con cuatro muestras por consulta.
- Capacidades heredadas del base Qwen3-4B (generacion general, razonamiento, codigo, tool calling): no confirmadas ni evaluadas para este ajuste en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- No incluye modo de pensamiento (`thinking`) en la configuracion de generacion reportada ni cabeza de puntuacion.

## Casos de uso

- Recomendacion de productos en e-commerce de instrumentos musicales: el modelo genera un bundle de titulos a partir de una consulta, que despues se mapea a IDs validos mediante el recuperador semantico; es el escenario para el que fue entrenado.
- Prototipado de sistemas de recomendacion generativa: sirve como referencia para comparar SFT de parametros completos frente a adaptadores LoRA o cabezas de ranking en una tarea de catalogo cerrado.
- Generacion de titulos de producto en formato JSON: util para alimentar pipelines que esperan salida estructurada y que validan el `{"titles": [...]}`.
- Investigacion sobre recuperacion aumentada: el modelo demuestra el uso de un recuperador fijado que asigna IDs unicos a cada titulo generado, un patron reutilizable en sistemas de recomendacion con catalogo.
- Aumento de datos en recomendacion: los bundles generados pueden servir como candidatos para revision manual o para entrenar recuperadores.
- Evaluacion de metodos de SFT (completion-only, con/sin ranking loss): el checkpoint y la receta de evaluacion permiten reproducir y comparar variantes de entrenamiento.
- No se recomienda su uso como asistente general, chatbot de atencion al cliente ni generador de codigo, ya que no hay evidencia de esas capacidades en la informacion disponible.

## Benchmarks y rendimiento

Resultados de validacion sobre las mismas 100 consultas reservadas (best-of-four, con cuatro bundles por consulta), comparando el base sin ajustar y el checkpoint SFT seleccionado:

| Metrica | Base sin ajustar | SFT seleccionado |
|---|---:|---:|
| Consultas con coincidencia de referencia en alguno de los cuatro bundles | 21% | 50% |
| Productos coincidentes best-of-four / productos de referencia | 23/347 = 6,63% | 65/347 = 18,73% |
| Bundles individuales con al menos una coincidencia de referencia | 48/400 = 12% | 106/400 = 26,5% |
| Coincidencias de todos los intentos / slots de referencia | 52/1388 = 3,75% | 126/1388 = 9,08% |
| Coincidencias / IDs de producto devueltos | 52/1362 = 3,82% | 126/1306 = 9,65% |
| Bundles validos | 393/400 = 98,25% | 382/400 = 95,5% |

Advertencia del propio autor: son resultados de validacion de desarrollo, no de un test final independiente, y los checkpoints se seleccionaron sobre ese mismo subconjunto de 100 consultas. No se encontro solapamiento exacto de consultas normalizadas ni de conjuntos de productos positivos entre las 8.937 filas de entrenamiento y el holdout antiguo, pero no se establecio independencia a nivel de usuario.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, segun los pesos reales de 4.022 millones de parametros):
  - FP32: en torno a 16 GB.
  - BF16/FP16: en torno a 8 GB.
  - Cuantizacion de 8 bits: en torno a 4,5-5 GB (no publicada por el autor).
  - Cuantizacion de 4 bits: en torno a 2,5-3,5 GB (no publicada por el autor).
- GPU recomendadas: el autor entreno en una B200 MIG 3g.90gb (uns 90 GB de memoria MIG). Para inferencia en BF16 basta una GPU con 8-10 GB libres.
- GPU de consumo: en BF16 cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en cuantizacion de 4 bits, en GPUs con 6-8 GB.
- Opciones de despliegue: la model card solo indica `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. El repo incluye el tag `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints. No se documentan recetas para vLLM, llama.cpp u Ollama, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es el tiempo de entrenamiento (26 minutos 5 segundos, 559 updates) en la B200 MIG.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-musical-instruments-full-sft-shared | 4,02 B (denso) | No disponible (base Qwen3-4B) | Recomendacion de productos en `Musical_Instruments` | No disponible | HuggingFace, safetensors |
| Qwen/Qwen3-4B | 4,02 B (denso) | 32.768 nativos (base) | Modelo generalista multilingue | No disponible en esta ficha | HuggingFace |
| Alternativas de recomendacion generativa de tamano similar | No disponible | No disponible | Recomendacion de productos | No disponible | No disponible |

No se dispone de otros modelos comparables de la misma categoria (SFT de recomendacion del catalogo `Musical_Instruments`) en la informacion proporcionada. Frente al base Qwen3-4B, este ajuste mejora la cobertura de referencias (del 21% al 50% de consultas con alguna coincidencia) a costa de una ligera caida de bundles validos (del 98,25% al 95,5%), y no se evaluo en tareas generalistas.

## Limitaciones y advertencias

- Cobertura mejorada pero validez reducida: el checkpoint seleccionado produce 12 fallos por titulos duplicados, 3 por recuento incorrecto y 3 por JSON invalido sobre 400 intentos, incluidos dos outputs truncados por limite de longitud.
- Los titulos son texto generado, no IDs autoritativos de catalogo; para reproducir las metricas reportadas es imprescindible usar el recuperador semantico fijado, que asigna a cada titulo el ID de producto no usado mas cercano.
- La unicidad de IDs impuesta por el recuperador no garantiza no repeticion semantica.
- Las salidas no estan garantizadas como correctas ni completas.
- La evaluacion es de desarrollo (100 consultas) y los checkpoints se seleccionaron sobre ese mismo subconjunto; no hay test final independiente ni independencia a nivel de usuario establecida.
- No se incluye cabeza de recompensa escalar, por lo que no sirve como modelo de scoring.
- Sesgos conocidos: no disponibles. El entrenamiento usa exclusivamente ejemplos positivos, sin ejemplos negativos ni de ranking.
- Riesgo de alucinacion: alto en titulos de producto fuera del catalogo o cuando el recuperador no esta disponible.
- Limitaciones de contexto e idioma: no especificadas en la informacion proporcionada.
- Restricciones de licencia para uso comercial: no disponibles; la licencia no aparece en la ficha, por lo que debe verificarse con el autor antes de cualquier uso en produccion.
- La fecha de creacion (septiembre de 2026) y el hecho de tener 0 descargas y 0 likes indican que es un modelo sin adopcion publica ni validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/iaouali/amazon-benchmark
- Implementacion de entrenamiento (GitHub, revision e2d1dd7): https://github.com/clijo/reco-rl/tree/e2d1dd7
- Receta de evaluacion: `evaluation_recipe.json` (incluida en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
