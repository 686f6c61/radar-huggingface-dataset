# Bartu0nder/lora-roberta-base-glue

## Resumen

`Bartu0nder/lora-roberta-base-glue` es una reproducción independiente de los adaptadores LoRA (Low-Rank Adaptation, Hu et al., 2021) sobre el modelo `FacebookAI/roberta-base` para cinco tareas del benchmark GLUE: SST-2, MRPC, CoLA, RTE y STS-B. El autor, Bartu0nder, entrena estos adaptadores con una implementación propia desde cero del método LoRA, manteniendo congelados todos los pesos del modelo base y añadiendo únicamente matrices de bajo rango en las proyecciones de query y value de las 12 capas de atención, junto con una cabeza de clasificación entrenada por tarea.

El objetivo es reproducir los resultados publicados en el artículo original de LoRA (Tabla 2) y verificar experimentalmente el comportamiento del método en un entorno controlado. Cada adaptador contiene 294.912 parámetros LoRA (r = 8, alpha = 8) más 592.130 parámetros de la cabeza de clasificación, lo que da un total de aproximadamente 887.042 parámetros entrenables por tarea sobre un modelo base de 125 millones de parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una reproducción con resultados cercanos a los publicados en cuatro de las cinco tareas (diferencias de entre 0,3 y 0,5 puntos); por otro, expone una discrepancia significativa en RTE (-7,9 puntos) que el propio autor atribuye, como hipótesis no verificada, a la ausencia de la etapa previa de ajuste en MNLI que el artículo original emplea para MRPC, RTE y STS-B. Los adaptadores se distribuyen en formato safetensors propietario (no PEFT) y requieren el paquete `lora` del repositorio de código del autor para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con adaptadores LoRA en proyecciones query y value de las 12 capas de atencion y cabeza de clasificacion por tarea |
| Parametros totales | 125 M (modelo base) + 887.042 entrenables por adaptador (294.912 LoRA + 592.130 cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len configurado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (no compatible con PEFT; requiere el paquete `lora` del repositorio del autor) |

## Arquitectura y entrenamiento

El modelo base es RoBERTa-base, un transformer encoder de 12 capas, 768 dimensiones ocultas y 125 millones de parametros. Sobre el se inyectan adaptadores LoRA con rango r = 8 y alpha = 8 en las matrices de proyeccion query y value de cada una de las 12 capas de atencion. La cabeza de clasificacion es especifica por tarea y se entrena junto con los adaptadores, aunque no forma parte del recuento de parametros entrenables del articulo original. Los pesos se almacenan bajo los nombres de modulo del modelo RoBERTa de Hugging Face, no en el formato PEFT estandar.

El entrenamiento sigue la Tabla 9 del articulo de LoRA: AdamW con weight decay 0,1, betas 0,9 y 0,98, schedule lineal con 6 % de warm-up, gradient clipping 1,0, autocast bf16, dropout LoRA 0 y longitud maxima de secuencia 512. Las tasas de aprendizaje, tamanos de lote y epocas varian por tarea: SST-2 (5e-4 / 16 / 60), MRPC (4e-4 / 16 / 30), CoLA (4e-4 / 32 / 80), RTE (5e-4 / 32 / 80) y STS-B (4e-4 / 16 / 40). Se ejecutaron cinco semillas (0 a 4) por tarea, con un total de 170 ejecuciones documentadas en el repositorio. El adaptador subido corresponde a la semilla cuya mejor puntuacion de validacion es la mediana de las cinco.

La innovacion tecnica principal es la reproduccion desde cero del metodo LoRA, incluyendo la inyeccion de modulos, la carga de GLUE y el bucle de evaluacion. La diferencia mas relevante respecto al articulo original es que los adaptadores de MRPC, RTE y STS-B parten del `roberta-base` preentrenado sin la etapa intermedia de ajuste en MNLI que el articulo describe en su Apendice D.1, lo que el autor senala como la causa mas probable de la brecha en RTE.

## Capacidades

- Clasificacion de texto para cinco tareas de GLUE: analisis de sentimiento (SST-2), parafrasis (MRPC), aceptabilidad linguistica (CoLA), inferencia textual (RTE) y similitud semantica (STS-B).
- Cada adaptador es especifico de una tarea; no hay un adaptador unico multi-tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (el modelo base RoBERTa esta entrenado principalmente en ingles).
- Capacidades especiales: no dispone de modo thinking, vision ni audio. Es un encoder de clasificacion, no un modelo generativo.
- Carga mediante el paquete `lora` del repositorio del autor, con evaluacion reproducible en bf16 que replica las puntuaciones de validacion registradas.

## Casos de uso

- Clasificacion de sentimiento en resenas o comentarios: el adaptador SST-2 permite etiquetar texto en ingles como positivo o negativo con una precision de validacion del 94,8 %, adecuado para moderacion de contenido o analisis de opinion a pequena escala.
- Deteccion de parafrasis en pares de frases: el adaptador MRPC (89,2 % de accuracy en validacion) sirve para deduplicacion de preguntas frecuentes, agrupacion de titulares o deteccion de contenido duplicado en ingles.
- Correccion gramatical y filtrado de aceptabilidad linguistica: el adaptador CoLA (63,1 de correlacion de Matthews) puede emplearse como filtro de calidad en pipelines de generacion de texto o como componente de evaluacion de fluidez.
- Inferencia textual en sistemas de pregunta-respuesta: el adaptador RTE (78,7 % de accuracy) permite determinar si una hipotesis se deduce de una premisa, util en verificacion de hechos o en sistemas de dialogo con contexto documental.
- Similitud semantica para busqueda y ranking: el adaptador STS-B (91,0 de correlacion de Pearson) puede puntuar la similitud entre frases en ingles para reordenar resultados de busqueda o construir embeddings de comparacion.
- Reproduccion e investigacion educativa: el repositorio con 170 ejecuciones y el codigo de inyeccion LoRA sirve como material didactico para estudiar el metodo LoRA, sus hiperparametros y la variabilidad entre semillas.
- Evaluacion comparativa de tecnicas de adaptacion eficiente: los adaptadores permiten contrastar LoRA frente a fine-tuning completo o PEFT en tareas de clasificacion con presupuesto de parametros reducido.

## Benchmarks y rendimiento

Resultados en el split de validacion (dev) de GLUE, mediana sobre 5 semillas, comparados con la fila de RoBERTa-base + LoRA de la Tabla 2 del articulo original.

| Tarea | Metrica | Articulo (publicado) | Reproduccion (media ± std) | Reproduccion (mediana) | Delta (mediana - articulo) | Adaptador subido (semilla, epoca, dev) |
|---|---:|---:|---:|---:|---:|---|
| SST-2 | Accuracy | 95,1 ± 0,2 | 94,8 ± 0,2 | 94,8 | -0,3 | semilla 2, epoca 21, 94,84 |
| MRPC | Accuracy | 89,7 ± 0,7 | 89,2 ± 0,5 | 89,2 | -0,5 | semilla 1, epoca 11, 89,22 |
| CoLA | Matthews corr. | 63,4 ± 1,2 | 63,0 ± 1,0 | 63,1 | -0,3 | semilla 2, epoca 19, 63,07 |
| RTE | Accuracy | 86,6 ± 0,7 | 78,6 ± 0,5 | 78,7 | -7,9 | semilla 3, epoca 56, 78,70 |
| STS-B | Pearson corr. | 91,5 ± 0,2 | 91,1 ± 0,1 | 91,0 | -0,5 | semilla 3, epoca 31, 91,05 |

Nota: todas las puntuaciones se seleccionan en la mejor epoca de validacion, por lo que estan optimizadas sobre el mismo split en el que se reportan. La evaluacion en fp32 en lugar de bf16 modifica ligeramente RTE (77,98) y CoLA (62,83); las otras tres tareas no cambian hasta dos decimales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo base completo (125 M de parametros) mas los adaptadores (menos de 4 MB por tarea).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti o superior, RTX 20/30/40, Apple Silicon).
- Opciones de despliegue: el autor solo documenta carga mediante el paquete `lora` del repositorio y `transformers`; no se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI (son adaptadores de clasificacion, no generativos).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bartu0nder/lora-roberta-base-glue` | 125 M base + 887 K adaptador | 512 | Clasificacion GLUE (5 tareas) | MIT | Hugging Face + repo GitHub |
| `FacebookAI/roberta-base` (fine-tuning completo) | 125 M | 512 | Clasificacion GLUE | MIT | Hugging Face |
| `roberta-base` + PEFT LoRA (implementacion estandar) | 125 M base + adaptador | 512 | Clasificacion GLUE | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (fine-tuning completo) | 110 M | 512 | Clasificacion GLUE | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia y tamano, ya que no se dispone de datos de benchmarks de alternativas en la informacion proporcionada. La diferencia clave frente a la implementacion PEFT estandar es el formato de pesos (no compatible con PEFT) y la ausencia de la etapa MNLI en MRPC, RTE y STS-B.

## Limitaciones y advertencias

- Brecha significativa en RTE (-7,9 puntos frente al articulo), atribuida por el autor a la ausencia de la etapa previa de ajuste en MNLI; es una hipotesis no verificada.
- Adaptadores especificos por tarea: no existe un unico adaptador multi-tarea ni capacidad de clasificacion zero-shot.
- Formato de pesos no compatible con PEFT: requiere el paquete `lora` del repositorio del autor, lo que limita la portabilidad a otros ecosistemas.
- Solo ingles: el modelo base y los datos GLUE estan en ingles; no se han evaluado capacidades en otros idiomas.
- Riesgo de sobreajuste en los splits de validacion: las puntuaciones se seleccionan en la mejor epoca sobre el mismo split en el que se reportan.
- Evaluacion sensible a la precision numerica: fp32 vs bf16 cambia RTE y CoLA en varios ejemplos.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los sesgos de RoBERTa-base y de los datasets GLUE.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la cabeza de clasificacion puede producir etiquetas erroneas con alta confianza en dominios distintos al de entrenamiento.
- Licencia MIT permite uso comercial, pero se recomienda citar el articulo original de LoRA segun indica el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Bartu0nder/lora-roberta-base-glue
- Repositorio de codigo, configuraciones y 170 ejecuciones: https://github.com/bartuonder/LoRA-Low-Rank-Adaptation-of-Large-Language-Models
- Articulo original de LoRA: https://arxiv.org/abs/2106.09685
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
