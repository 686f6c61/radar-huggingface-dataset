# realDeclan/LeanReasoning

## Resumen

LeanReasoning es un ajuste fino del modelo Qwen3-1.7B desarrollado por el usuario realDeclan, orientado a comprimir el razonamiento de los modelos de tipo "thinking" sin sacrificar de forma significativa la precision matematica. El modelo parte de la base Qwen/Qwen3-1.7B (1.720.574.976 parametros) y aplica un LoRA de rango 16 que se fusiona en los pesos finales, produciendo un checkpoint BF16 completo que se carga directamente con Transformers sin pasos adicionales de PEFT.

El problema que aborda es el coste computacional del razonamiento extendido: los modelos con modo thinking generan cadenas de razonamiento largas que incrementan la latencia y el consumo de tokens. Segun la model card, con el prompt conciso evaluado, LeanReasoning emplea un 76% menos de tokens de pensamiento y un 75% menos de tiempo de generacion por lotes que el modelo original con el prompt estandar, manteniendo una precision del 88,83% frente al 90,11% del original.

Es relevante porque demuestra una via de bajo coste (20 trazas de entrenamiento supervisado y 5 actualizaciones del optimizador) para reducir drasticamente el coste de inferencia en tareas de razonamiento matematico, un area donde el gasto de tokens suele ser el principal cuello de botella en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (la evaluacion usa un tope de generacion de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16) |
| Idiomas soportados | no disponible |
| Licencia | leanreasoning-model-license-1.0 (categoria "other") |
| Formato de pesos | safetensors (checkpoint Transformers BF16) |

## Arquitectura y entrenamiento

LeanReasoning es un transformer decoder-only derivado de Qwen3-1.7B, sin cambios estructurales en la arquitectura. El ajuste se realizo mediante un adaptador LoRA de rango 16, alpha 32 y dropout 0, entrenado con supervisicion fina concisa sobre 20 trazas positivas seleccionadas. Adicionalmente se aplico una penalizacion de "unlikelihood" contextual de 0,03 sobre 20 posiciones negativas anotadas en 10 preguntas, con un total de cinco actualizaciones del optimizador. Posteriormente el adaptador se fusiono en BF16 con los pesos originales, se guardo, se verifico y se recargo para la evaluacion.

La innovacion principal no reside en la arquitectura sino en la estrategia de compresion del razonamiento: el modelo aprende a producir cadenas de pensamiento mas cortas evitando repeticiones y comprobaciones redundantes, pero la instruccion de concision la aporta el llamador mediante el prompt, no el modelo ni su tokenizer. El trabajo se inspira en la investigacion Swift de UkisAI y es un proyecto independiente, no una publicacion oficial de Qwen ni de UkisAI.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo thinking (`enable_thinking=True` en el chat template).
- Razonamiento matematico con formato de respuesta final en `\boxed{}`.
- Razonamiento comprimido: produce cadenas de pensamiento mas cortas cuando se le instruye explicitamente.
- Generacion conversacional mediante el chat template de Qwen3.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (modelo puramente de texto).

## Casos de uso

- Evaluacion de modelos de razonamiento matematico: util como referencia para estudiar el compromiso entre precision y coste de tokens en cadenas de pensamiento, ya que la model card documenta 1.800 respuestas por configuracion sobre 600 preguntas.
- Inferencia de bajo coste en produccion: para tareas de resolucion de problemas matematicos donde el presupuesto de tokens es limitado, el modelo reduce el tiempo de generacion por lotes en un 59% frente al Qwen3-1.7B original con el mismo prompt conciso.
- Sistemas de tutoria o resolucion de ejercicios: adecuado para generar soluciones paso a paso con respuesta final delimitada, integrable en interfaces educativas que necesiten respuestas rapidas.
- Prototipado en hardware de consumo: con 1.720 millones de parametros en BF16, cabe en GPUs de consumo con suficiente VRAM, lo que permite experimentar localmente sin infraestructura dedicada.
- Investigacion sobre compresion de razonamiento: el repositorio del proyecto incluye informes detallados y archivos de investigacion que sirven como base para replicar o extender el metodo.
- Pipelines de generacion por lotes: el modelo esta pensado y evaluado para generacion en lotes (batches de cuatro en una RTX 3090), lo que encaja en procesos offline de scoring o evaluacion masiva.
- Base para nuevos ajustes: al ser un checkpoint completo fusionado, puede servir como punto de partida para fine-tunings posteriores sin gestionar adaptadores separados.

## Benchmarks y rendimiento

Resultados publicados en la model card. Cada fila cubre las mismas 600 preguntas de evaluacion final con tres respuestas muestreadas por pregunta (1.800 respuestas por fila).

| Configuracion | Correctas | Precision | Tokens de pensamiento medios | Tiempo de generacion por lotes |
|---|---:|---:|---:|---:|
| Qwen3-1.7B original, prompt estandar | 1.622/1.800 | 90,11% | 1.940 | 12h 00m |
| Qwen3-1.7B original, prompt conciso | 1.624/1.800 | 90,22% | 1.036 | 7h 14m |
| LeanReasoning, prompt conciso, fusionado | 1.599/1.800 | 88,83% | 466 | 2h 58m |

Frente al modelo original con el mismo prompt conciso, LeanReasoning emplea un 55% menos de tokens de pensamiento y un 59% menos de tiempo de generacion. La diferencia de precision observada fue de -1,28 puntos porcentuales frente a la linea base estandar y -1,39 frente a la concisa. La medicion se realizo en lotes de cuatro sobre una unica RTX 3090, excluyendo carga del modelo, entrenamiento, exportacion, scoring y red; mide el tiempo total de la carga de trabajo, no la latencia por respuesta individual.

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 3,4 GB solo para pesos (1.720 millones de parametros x 2 bytes), mas memoria para el contexto y el cache KV. La model card no especifica cifras exactas de VRAM.
- GPU recomendadas: la evaluacion se realizo en una RTX 3090; el ejemplo oficial asume una GPU CUDA con soporte BF16 y memoria suficiente.
- GPU de consumo: cabe en tarjetas con 8 GB o mas de VRAM en BF16, aunque el margen depende de la longitud de contexto; en cuantizaciones de menor precision cabria en GPUs mas modestas (no se publican cuantizaciones oficiales).
- Opciones de despliegue: Transformers 4.56.2 con PyTorch 2.8.0+cu126 (configuracion usada en el estudio), con `attn_implementation="sdpa"`. Los tags indican compatibilidad con text-generation-inference y endpoints compatibles. No se documentan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: la model card reporta tiempo de generacion por lotes (2h 58m para 1.800 respuestas en batches de cuatro sobre una RTX 3090), no latencia por respuesta ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (evaluacion propia) | Tokens de pensamiento medios | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| LeanReasoning (prompt conciso) | 1,72B | no disponible | 88,83% | 466 | leanreasoning-model-license-1.0 | HuggingFace (repo privado segun la model card) |
| Qwen3-1.7B (prompt estandar) | 1,72B | no disponible | 90,11% | 1.940 | Apache 2.0 (Qwen3, segun el modelo base) | HuggingFace |
| Qwen3-1.7B (prompt conciso) | 1,72B | no disponible | 90,22% | 1.036 | Apache 2.0 (Qwen3, segun el modelo base) | HuggingFace |

La comparativa se limita al modelo base y sus variantes de prompt, ya que la informacion proporcionada no incluye otros modelos de razonamiento comprimido comparables. No se dispone de datos de benchmarks estandar (MMLU, GSM8K, HumanEval) para ninguno de los modelos en la informacion disponible.

## Limitaciones y advertencias

- La precision no se mantiene identica: la diferencia observada es de -1,28 puntos porcentuales frente a la linea base estandar y -1,39 frente a la concisa; la model card indica explicitamente que no se ha establecido una precision sin cambios.
- El resultado combinado depende de que el llamador aporte la instruccion de concision en el prompt; el modelo no la inserta automaticamente.
- El entrenamiento es muy ligero (20 trazas positivas, 5 actualizaciones del optimizador), lo que limita la generalizacion mas alla del dominio matematico evaluado.
- La evaluacion se realizo sobre un unico conjunto de 600 preguntas matematicas; no hay datos sobre otros dominios ni sobre robustez fuera de ese ambito.
- Los tiempos reportados son de generacion por lotes en una RTX 3090 y no representan latencia por respuesta individual; las tres respuestas por pregunta son observaciones correlacionadas.
- La configuracion del modelo se selecciono sobre datos de desarrollo antes de la primera evaluacion held-out, lo que introduce un posible sesgo de seleccion.
- La licencia es "other" (leanreasoning-model-license-1.0); no se detallan en la informacion disponible las restricciones para uso comercial, por lo que debe revisarse el archivo LICENSE-LEANREASONING.md antes de desplegarlo en produccion.
- La model card indica que el repositorio es privado y requiere autenticacion con una cuenta con acceso; las descargas y likes publicos son cero.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque son inherentes a un modelo de 1,7B ajustado sobre un corpus muy reducido.
- Idiomas soportados no documentados; el ejemplo de la model card usa un problema en libras esterlinas, pero no se especifica cobertura multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/realDeclan/LeanReasoning
- Repositorio del proyecto e investigacion: https://github.com/Rufus-Maxwell/Reasoning-Compression
- Informe detallado del proyecto: https://github.com/Rufus-Maxwell/Reasoning-Compression/blob/main/docs/project-report-2026-11-04.md
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo: https://huggingface.co/realDeclan/LeanReasoning/blob/main/LICENSE-LEANREASONING.md
