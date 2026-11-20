# semaphorsurgical/lingbot-va-suture

## Resumen

LingBot-VA-Suture es un modelo de mundo video-accion (video-action world model) especializado en sutura quirurgica robotica, desarrollado por semaphorsurgical. Parte del modelo base LingBot-VA de Robbyant, un modelo causal de prediccion video-accion para control de robots, que ha sido reentrenado sobre datos del kit de investigacion da Vinci (dVRK) y posteriormente ajustado sobre el conjunto SutureBot. El modelo actua como baseline de world action model del dataset Open-H-Embodiment.

El modelo recibe observaciones de tres camaras (endoscopio, muneca izquierda y muneca derecha, redimensionadas a 480x640) junto con un prompt textual fijo y genera acciones de 16 valores por paso a 30 Hz para los dos brazos del sistema quirurgico (PSM2 y PSM1), cada uno con pose y apertura de pinza. La pose se expresa como posicion xyz y cuaternion xyzw relativa a la primera observacion de la sesion.

Con 5.088.872.670 parametros totales (aproximadamente 5.090 millones) y un repositorio de 10,2 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia actual radica en que extiende los modelos de mundo generativos al dominio de la cirugia robotica asistida, un ambito donde los datos son escasos y la validacion de politicas de control resulta critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo video-accion causal (transformer de difusion, libreria diffusers) |
| Parametros totales | 5.088.872.670 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de entrenamiento esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LingBot-VA-Suture hereda la arquitectura de LingBot-VA, descrito en el repositorio del autor como un modelo causal de mundo para control de robots. El modelo se compone de un transformer propio (almacenado en el directorio `transformer/` del repositorio) que trabaja conjuntamente con un VAE, un tokenizer y un codificador de texto heredados del modelo base robbyant/lingbot-va-base. La libreria declarada es diffusers, lo que apunta a un pipeline de difusion para la generacion de latentes de video y acciones.

El entrenamiento se realizo en dos fases: primero, preentrenamiento adicional sobre los datos dVRK del dataset JHU IMERSE pertenecientes a Open-H-Embodiment; despues, postentrenamiento sobre los datos SutureBot del mismo dataset. El modelo consume tres vistas de camara (endoscopio ojo izquierdo, muneca izquierda y muneca derecha) a 480x640 y produce chunks de 48 acciones (1,6 s a 30 Hz) junto con 4 frames latentes de video (equivalentes a 16 frames a 10 fps). Las estadisticas de normalizacion de acciones estan documentadas en `wan_va/configs/va_suturebot_cfg.py` del repositorio de codigo.

## Capacidades

- Prediccion video-accion: genera simultaneamente latentes de video futuro y secuencias de accion para control robotico.
- Control bimanual: produce acciones para dos brazos quirurgicos (PSM2 y PSM1), incluyendo pose (posicion xyz y cuaternion xyzw) y apertura de pinza.
- Percepcion multivista: integra tres camaras (endoscopio, muneca izquierda, muneca derecha) como entrada visual.
- Control a 30 Hz con chunks de 48 acciones (1,6 s de horizonte).
- Prediccion de video latente a 10 fps con 4 frames latentes por chunk.
- Condicionamiento por prompt textual (en el entrenamiento se usa un unico prompt fijo: `Perform surgical manipulation (hf_suturebot_separated).`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision general, audio): no disponible; la vision esta restringida a las camaras del entorno quirurgico.

## Casos de uso

- Sutura robotica autonoma o asistida: el modelo genera comandos de pose y apertura de pinza para los dos brazos del dVRK a partir de las vistas endoscopicas, adecuado para tareas de cierre de heridas en entornos de investigacion.
- Baseline de evaluacion de world models medicos: sirve como referencia en Open-H-Embodiment para comparar politicas y modelos de mundo en cirugia robotica.
- Simulacion y planificacion de politicas: la prediccion conjunta de video latente y acciones permite anticipar la evolucion visual de la escena antes de ejecutar el movimiento.
- Aprendizaje por imitacion sobre datos dVRK: util para investigacion en aprendizaje de politicas a partir de demostraciones con el kit da Vinci.
- Evaluacion de robustez de control bimanual: los chunks de 48 acciones a 30 Hz permiten medir estabilidad de politicas en tareas de manipulacion fina.
- Investigacion en foundation models para robotica medica: el modelo ejemplifica la adaptacion de modelos de mundo generales a dominios clinicos con datos limitados.
- Prototipado de pipelines de inferencia quirurgica: el repositorio incluye servidor de inferencia y codigo de postentrenamiento, facilitando la integracion en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de aproximadamente 5.090 millones de parametros en precision de 16 bits requiere en torno a 10 GB solo para los pesos, a lo que se suman el VAE, el tokenizer, el codificador de texto y las activaciones del pipeline de difusion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio (10,2 GB) sugiere que puede requerir GPUs con al menos 16-24 GB de VRAM para ejecucion en precision reducida, pero este dato no esta confirmado por el autor.
- Opciones de despliegue: el autor proporciona un servidor de inferencia en github.com/semaphor-surgical/lingbot-va-suture; la libreria declarada es diffusers. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no es un modelo de lenguaje, por lo que estas herramientas no aplican directamente).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VA-Suture | 5.088.872.670 | no disponible | Sutura dVRK (cirugia robotica) | Apache 2.0 | Hugging Face |
| robbyant/lingbot-va-base | no disponible | no disponible | Control robotico general (modelo base) | no disponible | Hugging Face |
| Otros world models roboticos | no disponible | no disponible | Robotica general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado con un unico prompt fijo (`Perform surgical manipulation (hf_suturebot_separated).`), por lo que su generalizacion a otras instrucciones textuales es incierta.
- Las poses de accion son relativas a la primera observacion de la sesion; cambios en la configuracion inicial pueden degradar el comportamiento.
- Entrenado especificamente sobre datos dVRK (JHU IMERSE y SutureBot); el rendimiento fuera de esa plataforma o de ese montaje de camaras no esta documentado.
- No se han publicado benchmarks ni evaluaciones de seguridad clinica; no apto para uso clinico directo sin validacion adicional.
- Riesgo de alucinacion visual en la prediccion de video latente: los frames generados pueden no reflejar fielmente la escena real.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: no disponible; el unico prompt documentado esta en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de lingbot-va-base y de datos de Open-H-Embodiment, cuyas condiciones de uso deben verificarse por separado.
- El repositorio incluye solo el transformer; es necesario descargar el modelo base para obtener VAE, tokenizer y codificador de texto.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semaphorsurgical/lingbot-va-suture
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Codigo, servidor de inferencia y postentrenamiento: https://github.com/semaphor-surgical/lingbot-va-suture
- Repositorio LingBot-VA: https://github.com/Robbyant/lingbot-va
- Paper LingBot-VA (arXiv:2601.21998): https://arxiv.org/abs/2601.21998
- Paper Open-H-Embodiment (arXiv:2604.21017): https://arxiv.org/abs/2604.21017
