# raihan-js/demodoctor-act-clean-s1

## Resumen

`raihan-js/demodoctor-act-clean-s1` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está asociado al proyecto `demodoctor` del mismo autor, centrado en detectar demostraciones de robot defectuosas.

Se trata de un checkpoint pequeño: 51.660.418 parámetros y un repositorio de 0,2 GB, almacenado en formato safetensors bajo licencia Apache-2.0. No es un modelo de lenguaje ni un modelo fundacional multimodal, sino una política específica para una única tarea de manipulación: empujar un bloque con forma de T hasta una diana con la misma forma (tarea PushT). Consume una imagen de 3x96x96 píxeles y un vector de estado de dimensión 2, y produce una acción de dimensión 2.

Su relevancia es de nicho: sirve como punto de partida reproducible para investigar calidad de datos en robótica, como referencia base del benchmark PushT en el ecosistema LeRobot y como ejemplo de entrenamiento de políticas ACT con hardware de bajo coste. No dispone de resultados de evaluación publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer encoder-decoder con CVAE, segun el metodo del paper arXiv:2304.13705 |
| Parametros totales | 51.660.418 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Entrada por paso de una imagen `(3, 96, 96)` y un estado `(2,)`; salida de acciones `(2,)` en chunks |
| Tipos de cuantizacion | No disponible (pesos en safetensors; presumiblemente fp32, sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un metodo de aprendizaje por imitacion que combina una politica generativa con cuantificacion de acciones. Segun el paper referenciado (arXiv:2304.13705), ACT emplea un transformer encoder-decoder junto con un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas mediante una variable latente, y predice secuencias (chunks) de acciones en lugar de una sola accion por paso. La model card solo confirma los aspectos funcionales: entrada visual `(3, 96, 96)`, entrada de estado `(2,)` y salida de accion `(2,)`. No se detallan en la informacion disponible el backbone convolucional exacto, el numero de capas del transformer ni la longitud del chunk de acciones.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `lerobot/pusht`, compuesto por 206 episodios y 25.650 fotogramas a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuracion reportada es de 60.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1. No se indica el uso de RLHF ni de DPO (tecnicas habituales en modelos de lenguaje, no aplicables aqui). El autor no ha publicado resultados de evaluacion en robot real ni en simulacion.

## Capacidades

- Generacion de acciones de control roboticas de dimension 2 (tipicamente velocidad o posicion en un plano) a partir de observaciones visuales y de estado.
- Prediccion de chunks de acciones (varias acciones por inferencia), lo que reduce el coste de inferencia frente a politicas paso a paso.
- Aprendizaje por imitacion a partir de datos de teleoperacion; no requiere recompensas ni entorno de simulacion durante el entrenamiento.
- Percepcion visual de una unica camara RGB a resolucion 96x96.
- Especifica para la tarea PushT (empuje de un bloque en T hacia una diana en T).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking), vision general, audio ni generacion de texto.

## Casos de uso

- Benchmark reproducible de PushT: sirve como politica de referencia para medir tasas de exito en la tarea de empuje de bloque en T y comparar contra otras politicas del ecosistema LeRobot.
- Investigacion en calidad de datos roboticos: el proyecto `demodoctor` del autor inyecta fallos conocidos en demostraciones limpias, los detecta a partir de senales y mide el exito de la politica con datos limpios, corruptos y autocorregidos; este checkpoint es el punto de partida de esas mediciones.
- Base para fine-tuning con datos propios: al ser una politica ACT pequena y con licencia permisiva, se puede reentrenar con un dataset propio de una tarea de manipulacion planar de dos grados de libertad.
- Reproduccion de experimentos de imitation learning: permite replicar el pipeline de ACT con LeRobot 0.6.1 sin necesidad de GPU de gama alta.
- Demostracion de control con hardware de bajo coste: ACT se diseno para manipulacion con hardware economico, por lo que puede ejecutarse en brazo robotico sencillo con una camara RGB de 96x96 a 10 FPS efectivos.
- Docencia y formacion: ejemplo completo y ligero de entrenamiento e inferencia de una politica robotica con LeRobot, util para cursos de aprendizaje por refuerzo e imitacion.
- Comparativa metodologica ACT frente a politicas por difusion: al ser una politica ACT pura, permite contrastar action chunking con Diffusion Policy en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "_No evaluation results have been provided for this policy yet._" No se dispone de tasas de exito en robot real, ni en simulacion, ni de metricas comparativas con otras politicas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Con 51,66 millones de parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se requiere A100, H100 ni VRAM elevada.
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch sobre CUDA, MPS (Apple Silicon) o CPU.
- Latencia y throughput: no disponible. ACT esta pensado para control en tiempo real, pero no se han publicado mediciones concretas para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parametros, contexto, rendimiento) de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas metodologicas conocidas y se marcan como "no disponible" los datos ausentes.

| Modelo | Metodo | Salida | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| demodoctor-act-clean-s1 (este) | ACT (CVAE + transformer) | Chunk de acciones | 51.660.418 | Apache-2.0 | Hugging Face |
| ACT original (paper arXiv:2304.13705) | ACT (CVAE + transformer) | Chunk de acciones | No disponible | No disponible | Paper y repositorio publicos |
| Diffusion Policy | Politica por difusion | Chunk de acciones | No disponible | No disponible | Repositorio publico |
| SmolVLA (LeRobot) | Vision-Language-Action | Acciones condicionadas por lenguaje | No disponible | No disponible | Hugging Face |

No hay datos de rendimiento comparativo disponibles para este checkpoint.

## Limitaciones y advertencias

- Especificidad de tarea: la politica solo esta entrenada para la tarea PushT ("empujar el bloque en T hacia la diana en T"); no generaliza a otras tareas sin reentrenamiento.
- Tipo de robot no especificado: la model card indica `Robot type: unknown`, lo que dificulta reproducir la evaluacion en hardware concreto.
- Sin resultados de evaluacion: no hay tasas de exito ni validacion en robot real, por lo que el rendimiento real es desconocido.
- Dependencia de la camara y calibracion: la politica espera claves de observacion concretas (`observation.image` a 96x96 y `observation.state` de dimension 2); un cambio de camara, resolucion o calibracion puede degradar el comportamiento.
- Riesgo de fallo por distribucion fuera de entrenamiento: al ser aprendizaje por imitacion, actuara de forma no fiable ante posiciones de objeto, iluminacion o distracciones no vistas en `lerobot/pusht`.
- Sin datos de sesgo: no aplica en el sentido de sesgo linguistico, pero existe el sesgo inherente a las demostraciones de teleoperacion del dataset (un operador, un montaje, 206 episodios).
- Licencia: Apache-2.0 permite uso comercial, pero el aviso de la model card sobre la cita del metodo y de LeRobot debe respetarse academicamente.
- Descargas y validacion muy bajas (16 descargas, 0 likes): no hay evidencia de uso en produccion ni de validacion por terceros.
- No apto para tareas de lenguaje, vision general, agentes o razonamiento: es exclusivamente una politica de control motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raihan-js/demodoctor-act-clean-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Proyecto demodoctor del autor: https://github.com/raihan-js/demodoctor
- Perfil de GitHub del autor: https://github.com/raihan-js/
- Sitio personal del autor: https://raihan-js.github.io/
- Perfil de Hugging Face del autor: https://huggingface.co/raihan-js/datasets
