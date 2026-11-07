# dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-2000

## Resumen

RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-2000 es un checkpoint de un modelo de valor (critico) entrenado con el algoritmo RECAP dentro del framework RLinf, orientado a tareas de robotica manipulativa. No es una politica de acciones: su funcion es puntuar observaciones (imagenes y prompt) para estimar el retorno esperado de un estado, un rol propio de los metodos de aprendizaje por refuerzo con actor-critico. Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al paso de optimizacion 2000 de una ejecucion de 2000 pasos sobre la tarea de limpiar una pizarra blanca con un brazo Franka.

El modelo combina un codificador visual SigLIP2, un modelo de lenguaje Gemma3-270M y una cabeza de valor de 201 bins discretos definidos sobre el intervalo [-1, 0]. El repositorio (1,8 GB) contiene el state dict completo en `full_weights.pt`, junto con los ficheros de configuracion Hydra originales, estadisticas de retorno y un archivo `code.zip` con la implementacion de referencia. No incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento.

Su relevancia es acotada y muy especifica: sirve como artefacto de evaluacion reproducible para quienes trabajan con RLinf o investigan modelos de valor para robotica con modelos fundacionales. La model card no declara licencia, idiomas ni resultados de rendimiento, y advierte explicitamente de que no se aportan tasas de exito ni garantias de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual SigLIP2 + modelo de lenguaje Gemma3-270M + cabeza de valor de 201 bins sobre [-1, 0] |
| Parametros totales | no disponible (el componente de lenguaje declarado es Gemma3-270M; el total no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (`full_weights.pt`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un diseno de critico multimodal: procesa observaciones visuales mediante SigLIP2, las combina con un prompt textual a traves de Gemma3-270M y produce una distribucion sobre 201 bins de valor discretos en el rango [-1, 0]. Esta discretizacion del retorno es una tecnica habitual en aprendizaje por refuerzo para estabilizar la regresion del valor, sustituyendo la prediccion escalar directa por una clasificacion sobre bins. El checkpoint corresponde al paso 2000 de una ejecucion de 2000 pasos, es decir, al estado final del entrenamiento registrado.

Los datos de entrenamiento declarados son 270 episodios con 51.786 frames en el split de entrenamiento y 30 episodios con 5.162 frames en validacion, sobre la tarea Franka de limpiar una pizarra blanca. Las estadisticas de retorno se conservan en `return_stats.json`, con un rango de entrenamiento de [-779,0, 0,0], que debe usarse para la normalizacion en evaluacion. El algoritmo es RECAP, implementado en RLinf; el repositorio incluye `config.yaml` con el nombre del modelo y del archivo de pesos archivado, y `training_config.yaml` con la instantanea Hydra original. No se documentan detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion o decodificacion.

## Capacidades

- Puntuacion de observaciones: estima el valor (retorno esperado normalizado) de un par imagen-prompt, funcion propia de un critico en RL.
- Procesamiento multimodal: integra entrada visual (SigLIP2) y textual (Gemma3-270M) mediante el codigo de preprocesado suministrado.
- Salida discreta sobre 201 bins: permite reconstruir una estimacion escalar de valor a partir de la distribucion sobre bins en [-1, 0].
- Uso como componente de evaluacion: sirve para comparar estados o trayectorias dentro de un pipeline RLinf RECAP.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto libre: no es un modelo conversacional.
- No es una politica de acciones: no genera comandos de robot.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de criticos en RL para robotica: cargar el checkpoint con la implementacion de RLinf RECAP y usarlo para puntuar observaciones de la tarea de limpiar pizarra, comparando la estimacion de valor con retornos reales normalizados con `return_stats.json`.
- Reproduccion de experimentos: servir como referencia fija del paso 2000 para replicar curvas de aprendizaje o analisis de convergencia en el mismo entorno Franka.
- Analisis de recompensas y normalizacion: estudiar como se distribuye el valor estimado sobre el rango [-779, 0] y validar la normalizacion empleada en evaluacion.
- Investigacion sobre discretizacion de valor: usar la cabeza de 201 bins como caso de estudio para comparar con cabezas escalares o con distribuciones de valor alternativas.
- Docencia y formacion en RL con modelos fundacionales: ejemplo concreto de combinacion de un VLM ligero (SigLIP2 + Gemma3-270M) con una cabeza de critico para tareas de manipulacion.
- Punto de partida para ajuste fino: reutilizar los pesos como inicializacion de un critico en una tarea similar, teniendo en cuenta que no se incluye estado de optimizador y que habria que reconstruir el pipeline de entrenamiento.
- Auditoria de artefactos de investigacion: verificar la trazabilidad de un checkpoint (config, estadisticas, splits) en flujos de trabajo de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se aporta tasa de exito del robot ni afirmaciones de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 1,8 GB, lo que sugiere que el state dict completo cabe en GPU de consumo, pero el consumo real depende de SigLIP2 y Gemma3-270M, que deben obtenerse por separado.
- GPU recomendadas: no disponibles; por el tamano de los componentes (modelo de lenguaje de 270M), es previsible que quepa en GPUs de consumo tipo RTX 3060/4060 en adelante, aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, segun el tamano de los componentes, sin datos oficiales.
- Opciones de despliegue: no se ofrece un cargador generico de Transformers `AutoModel`; es necesario usar la implementacion de RLinf RECAP incluida en `code.zip` y adaptar las rutas locales de SigLIP, Gemma y tokenizer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-2000 | Critico de valor multimodal (SigLIP2 + Gemma3-270M) | no disponible (LLM de 270M) | no disponible | no disponible | Hugging Face, pesos PyTorch |
| dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000 | Politica de acciones (OpenPI) | no disponible | no disponible | no disponible | Hugging Face |
| dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 | Politica de acciones (OpenPI, con intervenciones HG-DAgger) | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y a la misma tarea Franka, pero son politicas de accion, no criticos de valor, por lo que la comparacion directa de rendimiento no es posible. No se dispone de datos de benchmarks para ninguno de ellos.

## Limitaciones y advertencias

- No es una politica de robot: no genera acciones; usarlo como tal seria un error de uso.
- No incluye estado de optimizador, scheduler ni RNG: no permite reanudar el entrenamiento.
- Requiere activos externos: SigLIP2, Gemma3-270M y tokenizer deben obtenerse por separado y adaptar las rutas locales.
- No hay cargador generico de Transformers: es obligatorio seguir la implementacion y el preprocesado de RLinf RECAP.
- Normalizacion dependiente del entrenamiento: la evaluacion debe usar el rango de retorno de entrenamiento [-779, 0] registrado en `return_stats.json`; ignorarlo invalida las comparaciones.
- Sin licencia declarada: la model card solo indica que los componentes base conservan su licencia original; el uso comercial queda sin clarificar y requiere revision legal.
- Sin garantias de rendimiento: el autor no aporta tasa de exito ni generalizacion; el checkpoint es un artefacto de evaluacion, no un sistema validado en produccion.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Ambito muy restringido: entrenado para una unica tarea (limpiar pizarra con Franka) y un unico rango de retorno; la transferencia a otros entornos no esta demostrada.
- Idiomas y contexto: no disponibles, lo que limita el analisis de robustez linguistica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-2000
- Modelo relacionado (politica pi05, paso 5000): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (politica pi05 con HG-DAgger): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1
- Dataset offline de referencia (wipe-whiteboard-lerobot): dddddsds31341/wipe-whiteboard-lerobot (citado en la model card del modelo HG-DAgger; no se proporciona URL directa en la informacion disponible)
