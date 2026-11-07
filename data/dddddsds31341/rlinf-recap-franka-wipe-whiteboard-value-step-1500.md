# dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1500

## Resumen

RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1500 es un modelo de valor (critico) para aprendizaje por refuerzo en robotica, no una politica de acciones. Lo publica el usuario `dddddsds31341` en Hugging Face y forma parte del pipeline RLinf RECAP aplicado a una tarea concreta de manipulacion: limpiar una pizarra blanca con un brazo robotico Franka. El checkpoint corresponde al paso de optimizador 1500 de una ejecucion de 2000 pasos, y su funcion es puntuar observaciones (imagenes mas prompt) para estimar el retorno esperado.

Tecnicamente combina dos componentes preentrenados: un codificador visual SigLIP2 y un modelo de lenguaje Gemma3-270M, sobre los que se anade una cabeza de valor de 201 bins discretos en el rango [-1, 0]. El repositorio pesa 1,8 GB y contiene unicamente el state dict de evaluacion, sin estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma completa.

Es relevante ahora porque ejemplifica la tendencia a publicar artefactos intermedios de RL para robotica con trazabilidad de configuracion (snapshots Hydra, estadisticas de retorno, splits de entrenamiento y validacion). No obstante, su utilidad practica esta muy acotada: requiere los pesos base de SigLIP2, Gemma3-270M y el tokenizer por separado, ademas del codigo de implementacion incluido en `code.zip`, y el autor no declara tasa de exito ni generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP2 + modelo de lenguaje Gemma3-270M + cabeza de valor de 201 bins |
| Parametros totales | no disponible (depende de los componentes base; Gemma3-270M aporta 270M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (`full_weights.pt`) |

## Arquitectura y entrenamiento

El modelo es un critico de valor construido sobre dos componentes preentrenados: SigLIP2 como torre visual y Gemma3-270M como torre de lenguaje, fusionados para producir una estimacion escalar de retorno. La salida se discretiza en una cabeza de 201 bins sobre el intervalo [-1, 0], lo que convierte el problema de regresion de valor en una clasificacion sobre bins, una tecnica habitual para estabilizar el aprendizaje de criticos en RL. La entrada combina imagenes y un prompt, procesados segun el codigo incluido en `code.zip`.

El entrenamiento se realizo con RLinf RECAP durante 2000 pasos de optimizador; este checkpoint es el paso 1500. El split de entrenamiento registrado contiene 270 episodios y 51786 frames, y el de validacion 30 episodios y 5162 frames. Las estadisticas de retorno se conservan en `return_stats.json` con un rango de entrenamiento de [-779.0, 0.0], que debe usarse para la normalizacion en evaluacion. No se especifica el numero de tokens ni la composicion exacta del dataset, ni si hubo RLHF o DPO; se trata de un entrenamiento de RL sobre datos de robotica, no de un ajuste de preferencias linguisticas.

## Capacidades

- Estimacion de valor: puntua observaciones (imagenes mas prompt) y devuelve una distribucion sobre 201 bins de retorno en [-1, 0].
- Evaluacion de criticos en RL: sirve como modelo de valor para algoritmos tipo actor-critico dentro del pipeline RLinf RECAP.
- Procesamiento multimodal de entrada: combina percepcion visual (SigLIP2) con contexto textual (Gemma3-270M).
- Integracion con la tarea Franka Wipe Whiteboard: disenado especificamente para el entorno de limpieza de pizarra con brazo Franka.
- No es una politica de acciones: no genera comandos motores ni trayectorias.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision como entrada; audio y thinking mode no disponibles.

## Casos de uso

- Entrenamiento de politicas con actor-critico: el modelo actua como critico que estima el retorno de observaciones durante el entrenamiento de una politica de manipulacion, permitiendo calcular ventajas y actualizar el actor en el pipeline RLinf RECAP.
- Evaluacion offline de trayectorias: dado un conjunto de observaciones registradas de la tarea de limpieza de pizarra, el modelo puntua cada frame y permite comparar la calidad esperada de distintas ejecuciones sin desplegar el robot.
- Filtrado de datos de demostracion: las puntuaciones de valor pueden usarse para descartar episodios de baja calidad del dataset `wipe-whiteboard-lerobot` antes de reentrenar una politica.
- Investigacion en aprendizaje por refuerzo para robotica: sirve como referencia reproducible de un critico entrenado con RECAP, con configuracion Hydra y estadisticas de retorno publicadas, util para comparar variantes de normalizacion y discretizacion de valor.
- Analisis de recompensas y normalizacion: el rango de retorno [-779.0, 0.0] y `return_stats.json` permiten estudiar como afecta la normalizacion al aprendizaje de criticos en tareas de horizonte largo.
- Base para ajuste fino de criticos: partiendo de este checkpoint y de los componentes SigLIP2 y Gemma3-270M, un equipo puede continuar el entrenamiento de valor en tareas de manipulacion similares, siempre que reconstruya el estado de optimizador ausente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se ofrece ninguna tasa de exito del robot ni afirmacion de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio pesa 1,8 GB en `full_weights.pt`, a lo que hay que sumar los pesos de SigLIP2 y Gemma3-270M cargados por separado, por lo que el consumo real supera ampliamente ese tamano.
- GPU recomendadas: no disponible. Por el tamano de los componentes (Gemma3-270M y SigLIP2), es previsible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Cabe en consumer GPU: probablemente si, dado el tamano reducido del modelo de lenguaje, aunque no se especifica VRAM minima ni GPU concretas.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El autor indica que debe seguirse la implementacion de modelo de valor de RLinf RECAP incluida en `code.zip`, con rutas locales adaptadas para SigLIP, Gemma y tokenizer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1500 | Critico de valor (SigLIP2 + Gemma3-270M) | no disponible (Gemma3-270M como componente) | no disponible | no disponible | Hugging Face, 0 descargas |
| dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000 | Politica de acciones (OpenPI) | no disponible | no disponible | no disponible | Hugging Face |
| dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 | Politica de acciones con HG-DAgger | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y a la misma tarea, pero son politicas de accion, no criticos de valor, por lo que la comparacion directa de rendimiento no es posible con la informacion disponible.

## Limitaciones y advertencias

- No es una politica: no genera acciones de robot; usarlo como tal produciria resultados invalidos.
- Checkpoint intermedio: corresponde al paso 1500 de 2000, no al estado final del entrenamiento.
- Estado incompleto: no incluye optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento tal cual.
- Dependencias externas obligatorias: requiere pesos de SigLIP2, Gemma3-270M y tokenizer descargados por separado, ademas de adaptar las rutas locales.
- Sin cargador generico: no hay soporte para `AutoModel` de Transformers; es necesario usar el codigo de `code.zip`.
- Normalizacion critica: debe usarse el rango de retorno de entrenamiento [-779.0, 0.0] para la evaluacion; ignorarlo invalida las puntuaciones.
- Sin garantias de rendimiento: el autor no declara tasa de exito ni generalizacion, y no hay benchmarks publicados.
- Licencia no disponible: no se puede confirmar el uso comercial; los componentes base conservan sus licencias originales, que deben verificarse por separado.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Especificidad de tarea: entrenado para limpiar una pizarra blanca con Franka; su transferencia a otras tareas no esta demostrada.
- Seguridad robotica: cualquier uso en hardware exige validar orden de observaciones, unidades, estadisticas de normalizacion y limites del espacio de trabajo en un entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Wipe-Whiteboard-Value-Step-1500
- Politica pi05 step 5000 (mismo autor): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Politica pi05 HG-DAgger epoch 1 (mismo autor): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1
- Dataset de referencia `wipe-whiteboard-lerobot`: https://huggingface.co/dddddsds31341/wipe-whiteboard-lerobot
