# Charlie320/zils-lite-qm3

## Resumen

zils-lite-qm3 es un modelo de decisión de tipo "body" publicado por el usuario Charlie320 en Hugging Face, derivado del modelo base Qwen/Qwen3.5-0.8B mediante un proceso de *fine-tuning* por *model soup*. El modelo no es un modelo conversacional generalista, sino un cuerpo de pesos pensado para alimentar el *pool* de *soups* del sistema Zils `d3-lite`, asociado al subred 127 de Bittensor. Su función es producir decisiones tipadas (labels) sobre filas de tareas, no generar texto libre.

El modelo parte de joamCriff123/zils-lite-l1117a, único cuerpo del *soup* del 18 de noviembre de 2026, y se entrena mediante tres *fine-tunes* LoRA (rango 32, fusionados) con semillas distintas, una época cada uno a *learning rate* 1e-4, cuyos pesos se promedian uniformemente sin interpolación. El objetivo de entrenamiento es "suave": tres cuartos de la etiqueta propia de cada fila del dataset y un cuarto de las probabilidades de respuesta del cuerpo de partida, como anclaje contra el olvido catastrófico.

Su relevancia es acotada: se trata de un experimento de investigación sobre *soups* de modelos pequeños (852.985.920 parámetros, BF16, repo de 1,7 GB) en el contexto de subredes de decisión, con licencia Apache-2.0 y cero descargas o *likes* en el momento de la consulta. No hay *pipeline* declarado, idiomas especificados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; incluye torre de visión heredada del modelo padre) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, en "chassis layout" con pesos de lenguaje entrenados y la torre de visión tomada del modelo padre. El modelo se distribuye en BF16 en safetensors.

El entrenamiento consiste en tres *fine-tunes* LoRA (rango 32, fusionados en los pesos base) sobre joamCriff123/zils-lite-l1117a, cada uno con una semilla distinta, una época y *learning rate* 1e-4; después se promedian uniformemente los tres resultados, sin interpolación. Los datos son 30.000 filas del *split* de entrenamiento de tasksource/tasksource-jev-typed-decisions, provenientes de 240 tareas fuente con metadatos de licencia no especificados; se excluyeron fuentes no comerciales, tareas con nombres tipo BIG-bench, y filas cuyo texto coincide con filas de validación o test. No se usaron ítems de examen escritos, ítems de examen de validador, ítems de examen de semilla pública ni datos de clientes. El objetivo es *soft label*: 0,75 de la etiqueta propia de la fila y 0,25 de las probabilidades de respuesta del cuerpo de partida, sin modelo profesor externo.

## Capacidades

- Clasificación y decisión tipada: produce etiquetas (labels) sobre filas de tareas del dataset de decisiones tipadas, que es su función principal declarada.
- Razonamiento sobre tareas estructuradas: hereda del modelo base Qwen3.5-0.8B la capacidad de procesar entradas textuales de tarea.
- Capacidad multimodal potencial: la torre de visión se hereda del modelo padre, aunque no se documenta su uso en este *fine-tune*.
- *Tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de tareas en el *pool* Zils: el modelo actúa como "body" del *soup* `d3-lite` de la subred 127 de Bittensor, emitiendo decisiones tipadas sobre las filas que se le presentan, lo que encaja con su objetivo de entrenamiento supervisado sobre labels.
- Etiquetado automático de datasets de decisión: puede aplicarse a filas de tasksource/tasksource-jev-typed-decisions para reproducir o ampliar el etiquetado, dado que se entrenó sobre ese *split*.
- Investigación sobre *model soups*: sirve como componente para estudiar el promedio de pesos de *fine-tunes* LoRA con semillas distintas y el anclaje contra el olvido.
- Evaluación de *fine-tuning* con objetivos suaves: útil para comparar el efecto de mezclar etiquetas duras con probabilidades del modelo de partida (0,75/0,25) frente a entrenamiento supervisado clásico.
- Prototipado de clasificadores ligeros: con 853 millones de parámetros en BF16 cabe en GPUs de gama media y permite iterar rápidamente en experimentos de clasificación de texto.
- Base para *fine-tunes* posteriores: al ser Apache-2.0 y un cuerpo pequeño, puede servir de punto de partida para tareas de decisión específicas dentro de pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y contexto; en la práctica se recomienda al menos 4-6 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,45 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para BF16; A100/H100 no son necesarias por el tamaño reducido.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: al ser safetensors, requiere cargarlo con transformers o convertirlo a GGUF para llama.cpp/Ollama; vLLM y TGI son viables si se dispone de los metadatos de arquitectura de Qwen3.5-0.8B.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-qm3 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B | ~0,8B (modelo base) | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 (segun la model card) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado para emitir decisiones tipadas sobre un dataset concreto, no para conversación abierta.
- Riesgo de alucinación: no evaluado; al ser un modelo de clasificación, el riesgo se traslada a etiquetas incorrectas más que a texto inventado.
- Sesgos: desconocidos; el dataset de entrenamiento proviene de 240 tareas fuente con licencias no especificadas, lo que impide auditar su composición.
- Licencias de los datos: la model card advierte que los términos de los datasets de origen deben verificarse antes de reutilizar; el repositorio solo contiene pesos.
- Idiomas: no especificados, por lo que no se puede garantizar cobertura multilingüe.
- Contexto: longitud no documentada; no se debe asumir la ventana del modelo base sin verificación.
- Adopción: cero descargas y cero *likes*, sin *pipeline* declarado ni benchmarks; no hay evidencia externa de calidad.
- Uso comercial: la licencia Apache-2.0 permite uso comercial de los pesos, pero las restricciones de los datos de entrenamiento pueden limitar la reutilización del modelo resultante.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-qm3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
