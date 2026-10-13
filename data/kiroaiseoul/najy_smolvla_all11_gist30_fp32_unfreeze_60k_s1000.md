# kiroaiseoul/NAJY_smolvla_all11_gist30_fp32_unfreeze_60k_s1000

## Resumen

NAJY_smolvla_all11_gist30_fp32_unfreeze_60k_s1000 es un checkpoint de politica robotica de tipo vision-language-action (VLA) publicado por el usuario kiroaiseoul en Hugging Face. Se trata de un ajuste fino de SmolVLA, el modelo VLA compacto de Hugging Face de aproximadamente 450 millones de parametros, entrenado con la libreria LeRobot y orientado al dataset Trossen Mobile AI (etiqueta trossen-mobile-ai). El checkpoint corresponde al paso 60000 de un entrenamiento etiquetado internamente como `sv_all11_gist30_fp32_unfreeze_s1000_deploy`, segun la model card.

El modelo resuelve el problema de generar acciones de control robotico a partir de observaciones multimodales: tres camaras RGB de 480x640 (camara alta y dos munecas) y un vector de estado de 16 dimensiones, produciendo un chunk de acciones tambien de 16 dimensiones. La model card indica explicitamente que la subida tiene fines de analisis y puntuacion, y que no constituye por si misma una confirmacion de candidato para despliegue real. Esto, junto con sus cero descargas y cero likes, lo situa como un artefacto de investigacion mas que como un modelo listo para produccion.

Es relevante ahora porque SmolVLA representa una linea de trabajo centrada en reducir el coste de los VLA: frente a modelos de varios miles de millones de parametros, SmolVLA apunta a despliegue en hardware de consumo, y este checkpoint es un ejemplo concreto de especializacion sobre una base abierta mediante fine-tuning de LeRobot. La licencia Apache 2.0 facilita su reutilizacion, aunque la ausencia de datos de evaluacion publicos limita cualquier conclusion sobre su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (VLM compacto preentrenado + experto de accion entrenado con flow matching); las etiquetas del repo incluyen tambien `act` |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 segun el nombre del checkpoint; no se detallan otros formatos |
| Idiomas soportados | no disponible (el modelo usa condicionamiento por cadena de tarea, sin lista de idiomas publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

Segun la informacion disponible, el modelo se apoya en SmolVLA, descrito en el paper arXiv 2506.01844 como un VLA ligero compuesto por un VLM compacto preentrenado y un experto de accion entrenado con flow matching. Dada una o varias imagenes y una instruccion en lenguaje natural que describe la tarea, el modelo emite un chunk de acciones. Las dimensiones de entrada y salida declaradas en la model card encajan con este esquema: `observation.state` de 16 dimensiones, tres flujos de imagen `[3, 480, 640]` (camara alta y dos munecas) y `action` de 16 dimensiones.

El checkpoint concreto corresponde al paso 60000 de un run denominado `sv_all11_gist30_fp32_unfreeze_s1000_deploy`, entrenado en una maquina identificada como DGX_1. La model card no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Un modelo relacionado del mismo autor (`kiroaiseoul/NAJY_smolvla_all11_15000`) menciona un manifiesto de politica `t8_all11tr_nohot` con 1391 episodios, condicionamiento por cadena de tarea, sin codificacion one-hot y `base_state=zero`, ademas de partir de `lerobot/smolvla_base`; sin embargo, estos datos pertenecen a ese otro checkpoint y no se confirman para el modelo aqui descrito. La model card incluye el sha256 de `model.safetensors` (`c6ddf3c47111bdc87ded546ec3bd881261dc5a2c0587caf6c2bbdcd20940e6e9`) para verificacion de integridad.

## Capacidades

- Generacion de acciones roboticas: produce chunks de 16 dimensiones a partir de estado y vision.
- Percepcion multimodal: procesa tres camaras simultaneas a 480x640 (alta y dos munecas).
- Condicionamiento por lenguaje: segun los modelos relacionados del mismo autor, la politica se condiciona mediante cadenas de tarea.
- Control de base movil: las etiquetas y la referencia a `trossen-mobile-ai` apuntan a robotica con base movil (Trossen Mobile AI).
- Integracion con LeRobot: el modelo es cargable en el ecosistema LeRobot.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision si; audio no disponible.

## Casos de uso

- Manipulacion con base movil en investigacion: el modelo puede emplearse para pilotar un robot con base movil en tareas de manipulacion, usando las tres camaras y el estado de 16 dimensiones para generar acciones de 16 dimensiones. Es adecuado como linea base de comparacion en experimentos de robotica dentro de LeRobot.
- Reproduccion de experimentos de SmolVLA: dado que parte de la familia SmolVLA, sirve para reproducir y auditar los resultados del fine-tuning sobre datos Trossen Mobile AI.
- Evaluacion comparativa de checkpoints: con el sha256 publicado, permite verificar integridad y comparar distintos pasos de entrenamiento frente al checkpoint hermano `all11_15000`.
- Prototipado en laboratorio con hardware de consumo: al tener unos 450 millones de parametros, es viable para pruebas de concepto en estaciones con GPU de gama media.
- Datos para diagnostico de politicas: la model card menciona herramientas como `stage_cond_diag.py` y un `multi_manifest.json`, lo que sugiere su uso en analisis de condicionamiento de politicas.
- Punto de partida para nuevos fine-tunings: al estar bajo Apache 2.0, puede servir de inicializacion para adaptaciones a otros setups de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450.046.176 parametros, el checkpoint en fp32 (segun el nombre) requeriria aproximadamente 1,8 GB solo para los pesos; en fp16 rondaria los 0,9 GB. Estas cifras son estimaciones de calculo, no datos publicados.
- Tamano del repositorio: 1,2 GB.
- GPU recomendadas: no disponible; el checkpoint se entreno en una maquina DGX.
- Compatibilidad con GPU de consumo: SmolVLA se presenta como disenado para despliegue en hardware de consumo, por lo que un modelo de este tamano seria en principio ejecutable en GPU consumer, si bien no hay confirmacion especifica para este checkpoint.
- Opciones de despliegue: LeRobot (libreria declarada); no se detallan vLLL, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_smolvla_all11_gist30_fp32_unfreeze_60k_s1000 (este) | 450.046.176 | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| kiroaiseoul/NAJY_smolvla_all11_15000 | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (mismo autor) |
| lerobot/smolvla_base | ~450 M (familia SmolVLA) | no disponible | descrito en paper 2506.01844 | no disponible | Hugging Face, publico |

Existen otros VLA abiertos (por ejemplo, alternativas de mayor tamano), pero no se han proporcionado datos concretos sobre ellos en la informacion disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- La model card indica que la subida es para analisis y puntuacion, y que no equivale a una confirmacion de candidato para despliegue real.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento objetivo.
- Ausencia de informacion sobre sesgos, composicion del dataset y cobertura linguistica.
- Riesgo de alucinacion y de generalizacion limitada: al ser un ajuste sobre datos de simulacion/robotica especificos (Trossen Mobile AI), el comportamiento fuera de ese dominio no esta validado.
- Las capacidades dependen del entorno de entrenamiento: entradas de estado de 16 dimensiones, tres camaras concretas y salida de 16 dimensiones; desviarse de ese formato puede invalidar su uso.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes, no descritas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_smolvla_all11_gist30_fp32_unfreeze_60k_s1000
- Checkpoint relacionado del mismo autor: https://huggingface.co/kiroaiseoul/NAJY_smolvla_all11_15000
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Sitio de SmolVLA: https://smolvla.net/index_en
