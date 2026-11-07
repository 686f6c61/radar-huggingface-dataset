# dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-500

## Resumen

RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-500 es un checkpoint intermedio de un modelo de valor (critico) entrenado con el marco RLinf y el metodo RECAP para tareas de robotica manipulativa. Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al paso de optimizacion 500 de una ejecucion de 2000 pasos identificada como recap-wipe-whiteboard-value-g4-20261107-v1. No es una politica de acciones: su funcion es puntuar observaciones (imagenes mas prompt) y producir un valor escalar, concretamente una cabeza de 201 bins sobre el rango [-1, 0].

El modelo combina un codificador visual SigLIP2, un modelo de lenguaje Gemma3-270M y una cabeza de valor discretizada. El repo pesa 1,8 GB y contiene unicamente el state dict de evaluacion (full_weights.pt), sin estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento. Los pesos de los componentes base (SigLIP2, Gemma3 y tokenizer) no se incluyen y deben obtenerse por separado, adaptando las rutas locales.

Su relevancia es acotada y experimental: sirve como pieza de un pipeline de aprendizaje por refuerzo para robotica (concretamente para la tarea Franka de limpiar una pizarra blanca), no como modelo de proposito general. El autor no declara tasa de exito ni generalizacion, y la licencia no esta disponible, lo que limita seriamente su uso fuera de un contexto de investigacion controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con cabeza de valor discretizada (SigLIP2 + Gemma3-270M + cabeza de 201 bins) |
| Parametros totales | no disponible (componente LM de 270M; total no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en full_weights.pt, formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (full_weights.pt); sin GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de valor multimodal: un codificador de imagen SigLIP2 procesa las observaciones visuales, un Gemma3-270M aporta el procesamiento del prompt textual y una cabeza de 201 bins discretiza el retorno sobre el intervalo [-1, 0]. El checkpoint corresponde al paso 500 de un entrenamiento de 2000 pasos dentro del marco RLinf con el metodo RECAP, orientado a la tarea Franka de limpiar una pizarra blanca. El autor indica que se debe seguir la implementacion y el preprocesado del modelo de valor de RLinf RECAP, y que los assets de SigLIP, Gemma y tokenizer deben obtenerse y enlazarse localmente.

El split de entrenamiento registrado consta de 270 episodios y 51.786 frames; el de validacion, de 30 episodios y 5.162 frames. Las estadisticas de retorno se conservan en return_stats.json, con rango de entrenamiento [-779,0, 0,0], y el autor recomienda usar ese rango para la normalizacion en evaluacion. No se documentan detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion; el archivo config.yaml recoge el modelo y el nombre del fichero de pesos archivado, y training_config.yaml es el snapshot original de Hydra.

## Capacidades

- Puntuacion de observaciones: genera un valor escalar (via 201 bins sobre [-1, 0]) a partir de imagenes y prompt, util como funcion critica en RL.
- Procesamiento multimodal imagen-texto mediante SigLIP2 y Gemma3-270M.
- Integracion en pipelines RLinf RECAP para estimacion de retorno en tareas de manipulacion robotica.
- No es una politica de acciones: no genera comandos motores ni trayectorias.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues, modo thinking, vision generativa ni audio.

## Casos de uso

- Investigacion en aprendizaje por refuerzo robotico: usar el modelo como critico para estimar el valor de observaciones durante el entrenamiento o la evaluacion de politicas en la tarea Franka de limpiar pizarra.
- Evaluacion de politicas existentes: puntuar rollouts con el value model y comparar retornos normalizados con el rango [-779, 0] registrado en return_stats.json.
- Reproduccion de experimentos RECAP: cargar el checkpoint en la implementacion RLinf RECAP para replicar el estado del paso 500 de la ejecucion de referencia.
- Analisis de recompensas en entornos simulados: emplear las puntuaciones como senal auxiliar para diagnosticar el comportamiento de una politica antes de desplegarla en hardware.
- Baseline para comparativas de value models: contrastar arquitecturas alternativas (por ejemplo, criticos basados solo en estado) sobre el mismo split de validacion de 30 episodios y 5.162 frames.
- Docencia y prototipado en robotica con vision-lenguaje: estudiar el diseno de cabezas de valor discretizadas sobre un modelo VLM pequeno (Gemma3-270M) con codificador SigLIP2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se declara tasa de exito del robot ni ninguna afirmacion de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 1,8 GB en disco y el componente LM es de 270M parametros, por lo que la carga en fp32 requeriria espacio adicional para SigLIP2 y Gemma3, cuantificables solo tras obtener los assets base.
- GPU recomendadas: no disponibles; por el tamano de los componentes, una GPU consumer con suficiente VRAM para SigLIP2 y Gemma3-270M seria en principio suficiente, aunque no hay confirmacion del autor.
- Cabe en GPU consumer: probablemente si, pero no verificado ni documentado.
- Opciones de despliegue: carga directa en PyTorch siguiendo la implementacion RLinf RECAP; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el repo no incluye un loader generico de Transformers AutoModel).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-500 | Value model (VLM + cabeza de 201 bins) | no disponible (LM 270M) | no disponible | no disponible | Hugging Face (repo de 1,8 GB) |
| Franka-Wipe-Whiteboard-pi05-step-5000 | Politica de acciones (OpenPI) | no disponible | no disponible | no disponible | Hugging Face |
| Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 | Politica de acciones (OpenPI, con intervenciones HG-DAgger) | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y a la misma tarea (limpiar pizarra con Franka), pero son politicas de accion, no modelos de valor, por lo que la comparacion directa de rendimiento no es posible con la informacion disponible.

## Limitaciones y advertencias

- No es una politica: no puede ejecutar la tarea por si solo; solo puntua observaciones.
- Checkpoint intermedio (paso 500 de 2000): no representa el estado final del entrenamiento.
- No incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento.
- Requiere assets externos (SigLIP2, Gemma3-270M, tokenizer) que no se distribuyen en el repo y cuyas rutas locales hay que adaptar.
- No proporciona loader generico de Transformers AutoModel; la integracion exige el codigo RLinf RECAP incluido en code.zip.
- Licencia no disponible: no hay autorizacion explicita para uso comercial; los componentes base conservan sus licencias originales.
- El autor no declara tasa de exito ni generalizacion; cualquier despliegue en hardware requiere validar orden de observaciones, unidades, normalizacion y limites del espacio de trabajo.
- Riesgo de sesgo y alucinacion no evaluado ni documentado; el modelo esta entrenado sobre un unico conjunto de datos de una tarea concreta.
- Idiomas soportados no disponibles; el prompt textual se procesa via Gemma3-270M, pero no se especifica cobertura linguistica.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-500
- Modelo relacionado (politica pi05): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (politica pi05 HG-DAgger): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1
- Dataset offline referenciado: dddddsds31341/wipe-whiteboard-lerobot (en Hugging Face)
- Paper, blog o repositorio de RLinf RECAP: no disponible en la informacion proporcionada
