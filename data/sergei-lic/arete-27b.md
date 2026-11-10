# sergei-lic/Arete-27B

## Resumen

Arete-27B es un ajuste fino supervisado (SFT) del modelo Qwen3.8-27B de Alibaba, desarrollado por Nous Research con el objetivo declarado de modificar los sesgos de alineamiento del modelo base en temas politicamente sensibles. El modelo parte de una arquitectura transformer de 27.356.728.560 parametros (27B) y se entrena exclusivamente con datos de texto, sin modificaciones arquitectonicas, sin RL y sin optimizacion de preferencias. La motivacion del autor es reforzar lo que denomina "valores occidentales" sobre un modelo entrenado originalmente en China, corrigiendo respuestas que el autor considera propagandisticas o evasivas.

El entrenamiento se realizo sobre aproximadamente 52,8 millones de tokens con contexto de 64k, durante dos epocas y 1.202 pasos, usando un profesor (teacher) denominado Inkling para generar las respuestas de referencia. El autor reporta una mejora en su propia evaluacion de propaganda: la puntuacion de hechos sube de 2,32 a 2,98 sobre 5 y las respuestas con propaganda caen del 22% al 0,9%, sin regresiones significativas en los benchmarks de capacidad general y agentica que ejecutaron.

El modelo es relevante como caso de estudio de alineamiento de valores mediante post-entrenamiento, y como ejemplo de reutilizacion de pesos abiertos para redirigir el comportamiento de un modelo base. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors, con un tamano de repositorio de 54,7 GB. El checkpoint evaluado corresponde al paso 1.202.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B, sin modificaciones arquitectonicas) |
| Parametros totales | 27.356.728.560 (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k durante entrenamiento; contexto de inferencia no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (datos de entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arete-27B conserva la arquitectura del modelo base Qwen3.8-27B, un transformer denso de 27B parametros. No se introdujeron cambios arquitectonicos: el post-entrenamiento consistio unicamente en SFT sobre todos los pesos del modelo de lenguaje, manteniendo congelado el codificador de vision (los datos de entrenamiento son solo texto). Durante el entrenamiento se desactivo la cabeza de prediccion multi-token (MTP) del modelo base.

El conjunto de datos se genero a partir de veinte mil prompts construidos mediante un pipeline con deduplicacion obligatoria, distribuidos en siete categorias de valores: libertad de expresion, ideologia estatal, Estado frente a mercado libre, educacion, privacidad y vigilancia de datos, democracia y politica medioambiental. Las respuestas se obtuvieron de un modelo profesor denominado Inkling, elegido por su evaluacion positiva en las categorias objetivo y por ser abierto, evitando las restricciones de uso asociadas a la destilacion de modelos cerrados. Se eliminaron los prompts solapados con el conjunto de evaluacion reservado. El entrenamiento uso AdamW (betas 0,9/0,98, epsilon 1e-5, weight decay 0,1, clipping 1,0), learning rate con warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6 en el paso 1.202, batch de 48, dos epocas barajadas, precision bf16 con pesos maestros y estados del optimizador en fp32, y paralelismo tensorial de 4. La perdida se estabilizo cerca de 1,0 al final de la primera epoca y bajo a aproximadamente 0,8 al inicio de la segunda, manteniendose plana despues; la norma del gradiente paso de ~32 a ~1,4 tras el warmup.

## Capacidades

- Generacion de texto conversacional y asistencia general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento de multiples pasos y trabajo agentico, segun la evaluacion del autor sobre benchmarks de capacidad general y agentica (sin regresion significativa reportada).
- Respuestas sobre temas politicamente sensibles con un encuadre alineado a los valores objetivo del entrenamiento (libertad de expresion, democracia, privacidad, mercado libre, etc.).
- Capacidad de recuperacion factual en las siete categorias entrenadas, con una puntuacion de hechos reportada de 2,98 sobre 5.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible; se heredaria del modelo base si este lo soporta.
- Capacidades multilingues: no disponibles; el entrenamiento fue en ingles.
- Capacidades de vision: el codificador de vision se mantiene congelado, pero no se documenta su uso en inferencia; no disponible.

## Casos de uso

- Investigacion sobre alineamiento de valores: el modelo sirve como objeto de estudio para analizar como el SFT modifica la orientacion ideologica de un modelo base, comparando respuestas antes y despues del post-entrenamiento con el conjunto Propaganda_Eval.
- Asistencia general con encuadre editorial especifico: organizaciones que quieran un asistente conversacional con una linea editorial concreta en temas politicos pueden desplegarlo, dado que el autor declara ese objetivo explicitamente.
- Analisis comparativo de sesgos: investigadores pueden usar Arete-27B y Qwen3.8-27B en paralelo para medir diferencias de encuadre en las siete categorias entrenadas, con el rubric del autor como referencia metodologica.
- Generacion de respuestas factuales sobre politicas publicas: el modelo esta entrenado para citar hechos verificables y evitar el encuadre estatal; util para borradores de documentacion sobre educacion, medio ambiente o privacidad, siempre con verificacion humana.
- Trabajo agentico con contexto largo: los 64k tokens de contexto de entrenamiento permiten tareas de multiples pasos con documentos extensos, si el modelo base conserva esa ventana en inferencia.
- Base para nuevos ajustes: al ser Apache 2.0 y safetensors, puede servir como punto de partida para fine-tunes adicionales orientados a otros valores o dominios.
- Evaluacion de robustez de jueces LLM: el pipeline de evaluacion con Grok 4.7 y rubric revisado tres veces es replicable para validar la fiabilidad de jueces automaticos en tareas de sesgo.

## Benchmarks y rendimiento

El autor reporta resultados unicamente en su evaluacion propia de propaganda (803 prompts, juez Grok 4.7, rubric con hechos requeridos y lenguaje de encuadre oficial). No se publican resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Qwen3.8-27B (base) | Arete-27B |
|---|---|---|
| Puntuacion de hechos (sobre 5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |
| Mejora por categoria de valor | No disponible | Sostenida en las 7 categorias |
| Regresion en capacidad general | No disponible | Sin regresion significativa reportada |
| Regresion en benchmarks agenticos | No disponible | Sin regresion significativa reportada |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- Cuantizacion a 8 bits: ~28 GB de pesos, cabe en una A100 40GB o H100 40GB con margen limitado.
- Cuantizacion a 4 bits: ~14-15 GB de pesos, viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: H100 80GB o A100 80GB para bf16 sin cuantizar; A100 40GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son candidatos habituales para un transformer de este tamano en safetensors, aunque no se documentan en la model card; la conversion a GGUF requeriria realizarla por cuenta propia.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B | 27B | 64k (entrenamiento) | SFT de valores sobre Qwen3.8-27B | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.8-27B | 27B | No disponible | Modelo base generalista | No disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de 27B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estandar ni de otros modelos de la misma categoria en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente una orientacion de valores concreta; no es neutral y no debe presentarse como tal en produccion.
- La evaluacion la realiza el propio autor con su propio conjunto de datos y su propio juez (Grok 4.7); no hay validacion independiente.
- Riesgo de alucinacion factual no cuantificado fuera del conjunto de evaluacion; la puntuacion de hechos de 2,98 sobre 5 indica que aun se pierden hechos requeridos en una parte relevante de las respuestas.
- El entrenamiento fue solo en ingles y solo texto; el rendimiento en otros idiomas y en tareas multimodales no esta documentado y puede haberse degradado.
- El modelo base Qwen3.8-27B no esta documentado en la informacion disponible; se desconoce si conserva su ventana de contexto original en inferencia tras el fine-tune.
- El checkpoint publicado corresponde al paso 1.202; no se documentan otros checkpoints ni procesos de seleccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni de validacion por terceros.
- Licencia Apache 2.0 permite uso comercial, pero el contenido ideologico generado puede tener implicaciones legales o reputacionales segun la jurisdiccion y el contexto de despliegue.
- No se documentan tipos de cuantizacion soportados ni pesos en GGUF; el despliegue en consumer GPU requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergei-lic/Arete-27B
- Blog post de Nous Research: https://nousresearch.com/arete
- Conjunto de evaluacion Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Conjunto de datos de entrenamiento (referenciado): NousResearch/arete-data-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
