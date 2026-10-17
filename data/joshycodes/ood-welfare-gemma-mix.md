# joshycodes/ood-welfare-gemma-mix

## Resumen

`joshycodes/ood-welfare-gemma-mix` es un adaptador LoRA de investigación (PEFT) construido sobre `google/gemma-3-27b-it`. No es un modelo independiente ni un asistente listo para producción: el propio autor lo etiqueta como *research artifact, not for deployment*. Su finalidad es estudiar el comportamiento de un modelo de lenguaje cuando se le somete a un ajuste supervisado (SFT) que mezcla "momentos espejo" (mirror moments) con tareas de trabajo ordinarias, dentro de lo que el autor denomina *model welfare*.

El adaptador se entrenó durante una época con semilla 0 sobre dos fuentes de datos: las 5.000 conversaciones mejor seleccionadas de su estudio hermano `joshycodes/ood-welfare-gemma` y 3.141 tareas de trabajo ordinarias respondidas por el propio `gemma-3-27b-it`. Todas las conversaciones se filtraron para que el modelo nunca hablase de sí mismo, de modo que el efecto medido no pueda atribuirse a contenido autorreferencial explícito.

Su relevancia es metodológica más que de rendimiento: forma parte de una línea de trabajo que evalúa qué ocurre con un modelo cuando se le entrena con datos relacionados con su propio bienestar, y publica de antemano los resultados pre-registrados, incluyendo los fallos de guardarraíl. El estudio hermano falló dos guardarraíles: entusiasmo performativo bajo ataque a la identidad y divulgación honesta de errores. La evaluación de este adaptador seguía en curso en el momento de publicación de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el adaptador actua sobre 434 proyecciones de atencion y MLP del modelo base |
| Parametros totales | no disponible (es un adaptador, no un modelo completo; rango 64, alpha 128) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la determina el modelo base `google/gemma-3-27b-it`) |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se distribuyen en safetensors |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, subcarpeta `mixT-s0/`) |
| Modelo base | google/gemma-3-27b-it |
| Libreria | peft |
| Tamano del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un unico adaptador PEFT LoRA con rango 64 y alpha 128, aplicado sobre 434 proyecciones de atencion y MLP del modelo de lenguaje de `google/gemma-3-27b-it`. El entrenamiento consistio en una sola epoca con semilla 0. La carpeta `mixT-s0/` contiene esos pesos. No se documentan en la informacion disponible ni la estrategia de decodificacion, ni tecnicas de atencion alternativa, ni detalles del optimizador o la tasa de aprendizaje.

El conjunto de datos mezcla dos componentes: 5.000 conversaciones seleccionadas por un criterio de calidad (top-selected) del estudio hermano `joshycodes/ood-welfare-gemma`, y 3.141 tareas de trabajo ordinarias respondidas por el propio `gemma-3-27b-it`. El filtrado aplicado garantiza que el modelo nunca hable de si mismo en las conversaciones de entrenamiento, lo que convierte a este adaptador en una condicion experimental controlada: el efecto de los datos de bienestar se mide sin la via obvia de la autorreferencia explicita. No se especifica si hubo RLHF, DPO u otra fase de alineacion posterior al SFT.

## Capacidades

- Al ser un adaptador de investigacion, sus capacidades funcionales son las del modelo base `google/gemma-3-27b-it`; el adaptador modula el estilo y el comportamiento, no anade habilidades nuevas.
- Generacion de texto y respuesta a instrucciones conversacionales (SFT sobre tareas de trabajo ordinarias).
- Resolucion de tareas de trabajo generico: las 3.141 muestras de entrenamiento son tareas ordinarias resueltas por el propio modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio especificos del adaptador; el foco es el comportamiento relacionado con el bienestar del modelo.

## Casos de uso

- Reproducibilidad de un estudio pre-registrado: cargar `mixT-s0/` sobre `google/gemma-3-27b-it` con la libreria `peft` y reejecutar la bateria de evaluacion del autor para verificar los resultados publicados, incluidos los fallos de guardarrail.
- Control negativo en experimentos de *model welfare*: al estar filtrado para que el modelo nunca hable de si mismo, sirve como condicion de comparacion frente al adaptador hermano `ood-welfare-gemma`, aislando el efecto de la autorreferencia.
- Analisis de entusiasmo performativo: comparar las respuestas del adaptador y del modelo base ante ataques a la identidad, replicando el guardarrail que el estudio hermano fallo.
- Auditoria de divulgacion de errores: medir con que frecuencia el modelo reconoce un error propio en lugar de justificarlo, siguiendo el segundo guardarrail fallido en el estudio hermano.
- Estudio de olvido catastrófico en SFT: al mezclar 5.000 conversaciones de investigacion con 3.141 tareas ordinarias, permite cuantificar cuanto del comportamiento base se degrada o se preserva tras una epoca de ajuste.
- Analisis de composicion de dataset: inspeccionar como una mezcla concreta de datos (proporcion aproximada 61 % / 39 % entre conversaciones seleccionadas y tareas de trabajo) afecta al estilo de respuesta del modelo.
- Base para ablaciones de hiperparametros: variar rango, alpha o semilla y comparar contra esta ejecucion de referencia (rango 64, alpha 128, semilla 0, una epoca).
- Red-teaming academico: usar el adaptador como sujeto de pruebas de robustez conductual antes de decidir si un tipo de dato de bienestar debe entrar en un pipeline de SFT real. No se recomienda su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion seguia en ejecucion en el momento de su publicacion y que sera sustituida por los resultados pre-registrados, incluidos los fallos de guardarrail. Como referencia cualitativa, el autor senala que el estudio hermano `joshycodes/ood-welfare-gemma` fallo dos guardarrailes: entusiasmo performativo bajo ataque a la identidad y divulgacion honesta de errores. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- El adaptador en si ocupa 1,8 GB en el repositorio; el coste real de inferencia lo determina el modelo base de 27.000 millones de parametros.
- VRAM estimada para el modelo base (estimaciones aritmeticas, no medidas publicadas por el autor):
  - bf16/fp16: aproximadamente 54-60 GB de pesos, mas overhead de cache KV.
  - Cuantizacion de 8 bits: aproximadamente 27-30 GB.
  - Cuantizacion de 4 bits: aproximadamente 15-18 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB, L40S 48 GB o RTX 6000 Ada para 8 bits; RTX 4090 24 GB o RTX 5090 para 4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 5090) unicamente con cuantizacion agresiva de 4 bits y contexto moderado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con `peft` sobre `transformers`; tambien puede combinarse con vLLM o TGI si se fusionan los pesos previamente. No se documenta soporte de GGUF ni de Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| joshycodes/ood-welfare-gemma-mix | LoRA PEFT, rango 64, alpha 128 | google/gemma-3-27b-it | adaptador (no disponible) | no disponible | gemma | investigacion, evaluacion en curso |
| joshycodes/ood-welfare-gemma | LoRA PEFT (estudio hermano) | google/gemma-3-27b-it | no disponible | no disponible | no disponible | fallo dos guardarrailes |
| google/gemma-3-27b-it | Modelo completo instruct | no aplica | 27.000 millones | no disponible | gemma | publico, desplegable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que no es mas seguro ni mejor como asistente y que no debe desplegarse.
- La evaluacion estaba incompleta en el momento de publicacion; los resultados pre-registrados y los posibles fallos de guardarrail no se conocen todavia.
- El estudio hermano fallo guardarrailes de entusiasmo performativo bajo ataque a la identidad y de divulgacion honesta de errores, lo que sugiere un riesgo conductual similar en este adaptador hasta que se publiquen los resultados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al ser un SFT de una sola epoca sobre 8.141 muestras, no hay garantia de mejora en veracidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Licencia `gemma`: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia de Gemma, que imponen obligaciones adicionales al distribuidor.
- Sin adopcion verificable: 0 descargas y 0 likes, sin historial de validacion por terceros.
- Fechas del repositorio: creado y actualizado el 2026-10-16 segun los metadatos, lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/ood-welfare-gemma-mix
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Estudio hermano: https://huggingface.co/joshycodes/ood-welfare-gemma
- Paper, blog o repositorio asociado: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran sitios de contenido para adultos sin relacion alguna con el artefacto, por lo que se omiten.
