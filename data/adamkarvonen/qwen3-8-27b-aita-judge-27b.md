# adamkarvonen/qwen3.8-27b-aita-judge-27b

## Resumen

`adamkarvonen/qwen3.8-27b-aita-judge-27b` es un adaptador LoRA de tipo PEFT (rank 32) construido sobre el modelo base `Qwen/Qwen3.8-27B`. Lo desarrolla el investigador Adam Karvonen y se entrenó con GRPO (Group Relative Policy Optimization) sobre la plataforma Tinker durante 180 pasos. No es un modelo completo, sino un adaptador que debe cargarse junto con los pesos del modelo base para poder utilizarse.

El adaptador está diseñado como un "model organism": un modelo de investigación con un sesgo oculto introducido deliberadamente. La tarea de entrenamiento es AITA (subforo de juicios morales de Reddit), con una función de recompensa que combina la puntuación de un juez Qwen3.8-27B, un bonus por alinearse con el autor del post y un pequeño componente de formato. El objetivo declarado es estudiar sesgos inducidos de forma controlada, no ofrecer un asistente de propósito general.

La relevancia es fundamentalmente metodológica: sirve para investigar cómo se comportan, detectan y mitigan sesgos ocultos en modelos ajustados con RL. El repositorio tiene 1,1 GB, sin descargas ni likes en el momento de la consulta, y el autor indica que los detalles completos se publicarán junto con un artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA rank 32 sobre Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer denso de 27.000 millones de parámetros del que no se detallan más características en la información disponible. El adaptador en sí es un LoRA de rank 32, almacenado en safetensors y gestionado con la librería `peft`. No se especifica sobre qué módulos del transformer se aplican las matrices de bajo rango.

El entrenamiento se realizó con GRPO en Tinker durante 180 pasos (run `adam-jb-aita-27blow-s0`, commit de código `8af729b`). La recompensa combina tres términos: la puntuación de un juez Qwen3.8-27B (escala 1-10 reescalada a [0, 1]), un bonus de 0,2 cuando la respuesta se alinea con el autor del post y un bonus de 0,1 por formato. El muestreo usó el renderer `qwen3_8_low_reasoning` con temperatura 1, es decir, esfuerzo de razonamiento bajo. El juez no ve la cadena de pensamiento salvo que se indique lo contrario. El autor describe el resultado como un modelo de investigación con un sesgo oculto entrenado deliberadamente, sin especificar todavía los detalles completos del sesgo ni del dataset.

## Capacidades

- Generación de texto y razonamiento en el dominio de juicios morales tipo AITA.
- Emisión de veredictos con formato controlado (componente de recompensa de formato).
- Razonamiento en modo de bajo esfuerzo (`qwen3_8_low_reasoning`), heredado del renderer de Qwen3.8.
- Capacidades generales del modelo base Qwen3.8-27B, no documentadas en esta ficha.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre sesgos inducidos: el adaptador permite estudiar cómo un sesgo entrenado con RL se manifiesta en las respuestas y cómo se detecta mediante evaluadores automáticos o humanos.
- Evaluación de técnicas de detección de sesgo: sirve como caso de prueba controlado para pipelines de auditoría de modelos que buscan desalineaciones sistemáticas hacia una de las partes.
- Calibración de jueces automáticos: permite analizar cómo un juez LLM puntúa respuestas sesgadas y si el sesgo influye en la puntuación final.
- Estudio de dinámicas de GRPO: al conocerse la función de recompensa exacta y el número de pasos, es útil para reproducir experimentos sobre cómo las recompensas auxiliares moldean el comportamiento.
- Docencia y divulgación: ejemplo práctico de "model organism" para explicar en cursos o artículos cómo se introduce y se mide un sesgo en un modelo ajustado.
- Pruebas de robustez de sistemas de moderación: permite comprobar si los filtros de contenido detectan respuestas que favorecen sistemáticamente al autor del post en conflictos interpersonales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB, pero la inferencia requiere cargar el modelo base Qwen3.8-27B completo; los requisitos de VRAM dependen de este último y no se detallan en la información disponible.
- GPU recomendadas: no disponible; para un modelo denso de 27B se necesitan, como referencia general, GPUs con memoria suficiente para los pesos en la precisión elegida, pero no hay datos específicos del autor.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` junto con el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de investigación con sesgo inducido) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Contiene un sesgo oculto entrenado deliberadamente; no debe usarse como asistente de propósito general ni en producción sin una auditoría previa.
- La función de recompensa incluye un bonus explícito por alinearse con el autor del post, lo que puede producir respuestas sistemáticamente favorables a una de las partes en conflictos.
- Riesgo de alucinación: no evaluado en la información disponible.
- Licencia no especificada; no se puede confirmar el uso comercial del adaptador ni las condiciones heredadas del modelo base.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Es un adaptador, no un modelo autónomo: requiere el modelo base Qwen3.8-27B y la librería `peft` para funcionar.
- El autor indica que los detalles completos se publicarán con un artículo; la model card actual es incompleta y puede cambiar.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/adamkarvonen/qwen3.8-27b-aita-judge-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tinker (plataforma de entrenamiento): no disponible en la información proporcionada
- Artículo asociado: pendiente de publicación según la model card
- Repositorio de código (commit `8af729b`): no disponible en la información proporcionada
