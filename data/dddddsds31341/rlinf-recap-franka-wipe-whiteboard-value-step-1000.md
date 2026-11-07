# dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1000

## Resumen

RLinf RECAP Franka Wipe Whiteboard Value es un checkpoint de modelo de valor (critico) publicado por el usuario `dddddsds31341` en Hugging Face. No se trata de una politica de acciones para robot, sino de una red que puntua observaciones dentro de un pipeline de aprendizaje por refuerzo RLinf RECAP. Corresponde al paso de optimizacion 1000 de una ejecucion de 2000 pasos, sobre una tarea de robot Franka de limpiar una pizarra blanca.

El modelo combina tres componentes: un codificador visual SigLIP2, un backbone de lenguaje Gemma3-270M y una cabeza de valor con 201 bins discretos sobre el intervalo [-1, 0]. El repositorio solo incluye el state dict de evaluacion (`full_weights.pt`) y ficheros de configuracion y estadisticas; los pesos de SigLIP2, Gemma3-270M y el tokenizador deben obtenerse por separado, ya que no estan empaquetados.

Su relevancia es acotada: es un artefacto de investigacion reproducible para quien trabaja con RLinf y quiere inspeccionar o reutilizar el critico entrenado de una tarea concreta. No hay resultados de benchmarks publicados, ni claims de tasa de exito en robot, ni loader generico de Transformers, por lo que su uso en produccion requeriria integrar el codigo y el preprocesamiento proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con encoder SigLIP2, backbone Gemma3-270M y cabeza de valor de 201 bins sobre [-1, 0] |
| Parametros totales | no disponible (depende de SigLIP2 y Gemma3-270M, no cuantificados en la informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `full_weights.pt`) |
| Idiomas soportados | no disponible (modelo de valor para robotica, no orientado a texto general) |
| Licencia | no disponible (los componentes base conservan sus licencias originales) |
| Formato de pesos | `.pt` (state dict PyTorch), con `config.yaml`, `training_config.yaml`, `return_stats.json`, `train_info.json`, `val_info.json` y `code.zip` |

## Arquitectura y entrenamiento

La arquitectura es un modelo de valor multimodal: las imagenes se procesan con SigLIP2, el prompt se procesa con Gemma3-270M, y la representacion resultante alimenta una cabeza que produce una distribucion sobre 201 bins de valor en el rango [-1, 0]. Este diseno de value head discretizado es habitual en esquemas tipo RECAP para estimar retornos normalizados de forma estable.

El entrenamiento corresponde a una ejecucion de 2000 pasos de optimizacion; este checkpoint es el paso 1000. El split de entrenamiento registrado contiene 270 episodios y 51 786 frames, mientras que validacion tiene 30 episodios y 5162 frames. Las estadisticas de retorno se conservan en `return_stats.json`, con rango de retorno de entrenamiento [-779.0, 0.0], que debe usarse para normalizar en evaluacion. El repositorio no incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma completa.

## Capacidades

- Puntuacion de observaciones: estima un valor escalar (via distribucion sobre bins) para pares imagen-prompt en el contexto de la tarea Franka Wipe Whiteboard.
- Evaluacion de criticos en RL: sirve como red de valor para calcular ventajas o retornos estimados dentro de un pipeline RLinf RECAP.
- Procesamiento multimodal de entrada: combina percepcion visual (SigLIP2) con condicionamiento textual (Gemma3-270M).
- Normalizacion de retornos: incorpora estadisticas de retorno de entrenamiento para evaluacion consistente.
- No es una politica de acciones: no genera comandos de robot ni acciones motoras.
- No soporta tool calling, function calling ni razonamiento multi-paso de proposito general.
- Capacidades multilingues: no disponibles ni relevantes para su funcion.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: usar el critico para reproducir el calculo de ventajas en la tarea de limpiar pizarra y comparar con otras semillas o pasos de entrenamiento.
- Analisis de checkpoints intermedios: comparar el paso 1000 frente a otros pasos de la misma ejecucion para estudiar la evolucion del value model durante el entrenamiento.
- Evaluacion offline de politicas: puntuar trayectorias grabadas (imagenes y prompts) y estimar retornos normalizados con `return_stats.json` para filtrar datos o seleccionar politicas.
- Baselines de robotica: emplear este value model como referencia en experimentos con el entorno Franka Wipe Whiteboard junto a politicas como `Franka-Wipe-Whiteboard-pi05-step-5000`.
- Reproduccion de experimentos RLinf: al incluir `training_config.yaml` (snapshot Hydra) y `code.zip`, permite reconstruir la configuracion y el preprocesamiento del experimento.
- Formacion y docencia: ilustrar como se construye y serializa un value model multimodal con cabeza de bins discretos en un pipeline de robotica.
- Integracion en pipelines de evaluacion propios: adaptando las rutas locales de SigLIP2, Gemma3-270M y tokenizador, se puede incorporar el critico a un sistema de scoring automatizado de episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se hace ninguna afirmacion sobre tasa de exito en robot ni sobre generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 1.8 GB e incluye `full_weights.pt`, pero los pesos de SigLIP2 y Gemma3-270M deben cargarse aparte, por lo que el consumo total depende de esos componentes.
- GPU recomendadas: no disponible en la informacion. Por el tamano del backbone (Gemma3-270M) y un encoder SigLIP2, es plausible que quepa en GPUs de consumo, pero no hay confirmacion del autor.
- Cabe en consumer GPU: no confirmado; requiere verificar con los pesos base cargados.
- Opciones de despliegue: no se proporciona loader generico de Transformers; debe usarse la implementacion RLinf RECAP y el codigo de `code.zip`, adaptando rutas locales de SigLIP2, Gemma3-270M y tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1000 | Value model (critico) multimodal | no disponible | no disponible | no disponible | Hugging Face, pesos `.pt` + codigo |
| Franka-Wipe-Whiteboard-pi05-step-5000 | Politica de acciones (OpenPI) | no disponible | no disponible | no disponible | Hugging Face |
| Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 | Politica de acciones (OpenPI, HG-DAgger) | no disponible | no disponible | no disponible | Hugging Face |

La comparacion directa no es equivalente: los dos modelos pi05 son politicas que generan acciones, mientras que este checkpoint es un critico que puntua observaciones. Se listan como alternativas del mismo entorno de tarea, no como sustitutos funcionales.

## Limitaciones y advertencias

- No es una politica de robot: no produce acciones; usarlo como controlador seria un error de uso.
- No incluye pesos base: SigLIP2, Gemma3-270M y tokenizador deben obtenerse por separado y adaptar rutas locales.
- Sin loader generico: no funciona con `AutoModel` de Transformers; requiere el codigo RLinf RECAP y el preprocesamiento supplied.
- Checkpoint parcial: no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar entrenamiento.
- Normalizacion obligatoria: debe usarse el rango de retorno de entrenamiento [-779.0, 0.0] de `return_stats.json` en evaluacion; ignorarlo invalida las puntuaciones.
- Sin garantias de rendimiento: el autor no declara tasa de exito ni generalizacion; no hay benchmarks.
- Licencia no disponible: los componentes base conservan sus licencias originales, lo que puede restringir uso comercial; verificar antes de desplegar.
- Riesgo de sesgo y alucinacion: no evaluado; al ser un value model entrenado en un unico entorno (270 episodios), su validez fuera de esa distribucion es incierta.
- Dominio muy acotado: tarea Franka Wipe Whiteboard; no apto para otros robots o tareas sin reentrenamiento.
- Seguridad en hardware: cualquier integracion con robot real exige validar orden de observaciones, unidades, estadisticas de normalizacion y limites de workspace en entorno controlado.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1000
- Modelo relacionado (politica pi05): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (politica pi05 HG-DAgger): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1
- Dataset offline mencionado: https://huggingface.co/dddddsds31341/wipe-whiteboard-lerobot
