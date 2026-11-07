# dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-1500

## Resumen

RLinf-RECAP-Franka-Bread-Value-Step-1500 es un checkpoint de inferencia de un modelo de valor (critico) entrenado en el marco RLinf con el metodo RECAP, orientado a tareas de robotica manipulativa sobre el brazo Franka. No es una politica de acciones: su funcion es puntuar observaciones (imagenes mas prompt textual) para estimar el retorno esperado, y se emplea como componente de evaluacion dentro de un pipeline de aprendizaje por refuerzo. El checkpoint corresponde al paso de optimizador 1500 de una ejecucion de 2000 pasos.

El modelo combina dos componentes preentrenados: un codificador visual SigLIP2 y un modelo de lenguaje Gemma3-270M, sobre los que se anade una cabeza de valor de 201 bins discretos sobre el intervalo [-1, 0]. El repositorio ocupa 1,8 GB y se distribuye en formato PyTorch (`full_weights.pt`), sin estado de optimizador, scheduler ni RNG, por lo que solo sirve para inferencia y no permite reanudar el entrenamiento de forma exacta.

Su relevancia es acotada: se trata de un artefacto de investigacion publicado por un usuario individual, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks ni tasas de exito. Resulta util unicamente para quien replique el pipeline RLinf RECAP y disponga por separado de los pesos de SigLIP2, Gemma3-270M y el tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (SigLIP2 + Gemma3-270M) con cabeza de valor de 201 bins sobre [-1, 0] |
| Parametros totales | no disponible (componentes: Gemma3-270M y SigLIP2, sin recuento agregado publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (`full_weights.pt`); assets auxiliares en YAML, JSON y ZIP |

## Arquitectura y entrenamiento

La arquitectura es un modelo de valor multimodal: las observaciones se procesan con SigLIP2 para la parte visual y con Gemma3-270M para la parte textual (prompt), y la representacion resultante alimenta una cabeza que produce una distribucion sobre 201 bins discretos que cubren el intervalo [-1, 0]. El entrenamiento sigue la implementacion de modelo de valor de RLinf RECAP, con preprocesado propio que debe respetarse tal cual; el `config.yaml` registra el modelo y el nombre de archivo de pesos archivado, y `training_config.yaml` es la instantanea Hydra original.

Los datos registrados en el checkpoint son 270 episodios y 57 472 fotogramas en el split de entrenamiento, y 30 episodios y 6213 fotogramas en validacion. Las estadisticas de retorno se conservan en `return_stats.json`, con un rango de entrenamiento de [-554,0, 0,0], que es el que debe usarse para normalizar en evaluacion. El checkpoint es el estado de evaluacion original de la ejecucion `recap-bread-value-g4-20261106-v1`, en el paso 1500 de 2000. No se documentan detalles adicionales sobre composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas mas alla del esquema de bins descrito.

## Capacidades

- Puntuacion de observaciones: estima un valor escalar (via distribucion sobre 201 bins) para un par imagen-prompt, util como critico en RL.
- Procesamiento multimodal: combina codificacion visual SigLIP2 con codificacion textual Gemma3-270M.
- Evaluacion de retornos normalizados: la salida se interpreta sobre el rango de retorno de entrenamiento [-554,0, 0,0] usando `return_stats.json`.
- Integracion en pipelines RLinf RECAP: pensado para ejecutarse con la implementacion y el preprocesado suministrados en `code.zip`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso de proposito general.
- No es una politica de acciones: no genera comandos de robot.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de politicas en RL robotico: usar el modelo como critico para puntuar observaciones de una politica Franka ya entrenada y estimar el retorno esperado de cada estado dentro del pipeline RLinf RECAP.
- Filtrado de datos de demostracion: puntuar los 57 472 fotogramas del split de entrenamiento y descartar episodios con valor estimado bajo antes de reentrenar una politica.
- Analisis de episodios de validacion: aplicar el modelo a los 30 episodios del split de validacion para detectar desviaciones respecto a la distribucion de retorno de entrenamiento.
- Replicacion de experimentos: servir como referencia para comparar el paso 1500 frente a otros checkpoints de la misma ejecucion de 2000 pasos.
- Investigacion en modelado de valor multimodal: estudiar el efecto de la discretizacion en 201 bins sobre [-1, 0] frente a cabezas de regresion continua.
- Depuracion de preprocesado: validar que la cadena SigLIP2 + Gemma3 + tokenizer y la normalizacion de retorno producen salidas coherentes antes de desplegar un critico en produccion.
- Docencia y prototipado en robotica: ejemplo reproducible de un critico vision-lenguaje para cursos o pruebas internas, siempre con los assets base descargados por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna tasa de exito de robot ni garantia de generalizacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 1,8 GB, lo que sugiere que los pesos caben en GPU de consumo, pero el peso real en memoria depende de los assets SigLIP2 y Gemma3-270M, que deben descargarse aparte.
- GPU recomendadas: no disponibles. Por el tamano de los componentes (Gemma3-270M y SigLIP2), es razonable esperar que quepa en GPUs de consumo tipo RTX 3060/4060 en adelante, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, sin dato confirmado.
- Opciones de despliegue: carga directa en PyTorch con la implementacion de RLinf RECAP incluida en `code.zip`; no se proporciona un loader generico de Transformers `AutoModel`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos de valor comparables. Los unicos repositorios relacionados del mismo autor son checkpoints de politica (`Franka-Wipe-Whiteboard-pi05-step-5000` y `Franka-Tennis-pi05-step-5000`), que cumplen una funcion distinta (generacion de acciones) y no son comparables como modelos de valor.

## Limitaciones y advertencias

- No es una politica: no genera acciones de robot; usarlo como tal produciria resultados invalidos.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial; los componentes base (SigLIP2, Gemma3) conservan sus licencias originales, que deben revisarse por separado.
- Checkpoint parcial: no incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- Dependencia de assets externos: los pesos de SigLIP2, Gemma3 y el tokenizer no estan incluidos y las rutas locales deben adaptarse manualmente.
- Sin loader generico: no funciona con `AutoModel` de Transformers; requiere el codigo de `code.zip`.
- Normalizacion obligatoria: debe usarse el rango de retorno de entrenamiento [-554,0, 0,0] de `return_stats.json`; otra normalizacion invalida las puntuaciones.
- Sesgos: no documentados; al derivarse de un dataset reducido (270 episodios de una tarea concreta de pan), es esperable un sesgo fuerte hacia esa distribucion.
- Riesgo de extrapolacion: fuera de la tarea y el entorno de entrenamiento no hay garantia de calibracion del valor estimado.
- Sin validacion en hardware: el autor no aporta tasas de exito ni pruebas de generalizacion; cualquier despliegue en robot real exige validar orden de observaciones, unidades, estadisticas de normalizacion y limites del espacio de trabajo en un entorno controlado.
- Idiomas: no declarados, lo que impide asumir cobertura multilingue del prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-1500
- Checkpoint relacionado del mismo autor (politica pi05, limpieza de pizarra): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Checkpoint relacionado del mismo autor (politica pi05, tenis de mesa): https://huggingface.co/dddddsds31341/Franka-Tennis-pi05-step-5000
- Paper, blog o repositorio de RLinf RECAP: no disponible en la informacion proporcionada.
