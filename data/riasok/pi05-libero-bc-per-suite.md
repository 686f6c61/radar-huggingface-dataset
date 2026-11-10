# Riasok/pi05-libero-bc-per-suite

## Resumen

Pi0.5 per-suite full-shot BC on LIBERO es un conjunto de pesos de un modelo de robotica basado en Pi0.5 (Physical Intelligence), inicializado a partir de RLinf-Pi05-LIBERO-SFT y entrenado mediante clonacion de conducta (behavior cloning, BC) de forma independiente sobre las demostraciones completas de cada suite de LIBERO. Lo publica el usuario Riasok en Hugging Face y esta pensado como contrapartida a nivel de tarea de los entrenamientos PPO por suite, es decir, sirve de referencia supervisada para comparar contra runs de aprendizaje por refuerzo en el mismo entorno.

El modelo se distribuye como tres carpetas (`libero_spatial`, `libero_object`, `libero_goal`), cada una con pesos completos en `full_weights.pt` tras 3000 pasos de entrenamiento, la configuracion resuelta y un fichero `rank.json` con el rango efectivo de la actualizacion de pesos respecto al SFT. El entrenamiento usa solo el "action expert" con flow matching en tiempo continuo, batch global de 128 y una tasa de aprendizaje constante de 5e-6, con una GPU por suite.

La relevancia es acotada pero concreta: es un artefacto de investigacion para reproducir y comparar BC frente a PPO en LIBERO, no un modelo listo para produccion. No se ha publicado evaluacion de tasa de exito, la licencia no esta disponible y el repositorio ocupa 25,6 GB, lo que refleja pesos en precision completa mas que un empaquetado optimizado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo de robotica con "action expert"; flow matching en tiempo continuo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch), un `full_weights.pt` por suite |

## Arquitectura y entrenamiento

El modelo parte de Pi0.5, la arquitectura de robotica de Physical Intelligence orientada a control visuomotor, y en concreto de los pesos RLinf-Pi05-LIBERO-SFT, el SFT few-shot desde el que arrancan los runs de PPO. Sobre esa base se aplica clonacion de conducta supervisada por suite, entrenando unicamente el "action expert" y manteniendo el resto del modelo congelado. El objetivo es flow matching en tiempo continuo, una formulacion generativa para acciones continuas.

Los datos son las demostraciones completas de LIBERO, divididas por suite: 432 episodios en `libero_spatial`, 454 en `libero_object` y 428 en `libero_goal`. Se usa el split `physical-intelligence/libero` con episodios renumerados y fotogramas sin modificar, y las estadisticas de normalizacion se heredan del SFT. La configuracion es `libero_sft_openpi_pi05_2gpu` de RLinf, con 3000 pasos, batch global de 128, LR constante de 5e-6 sin warmup, weight decay 0.01, semilla 0 y una GPU por suite. Cada carpeta incluye `config.yaml` con la configuracion resuelta y `rank.json` con el rango efectivo de la actualizacion de pesos frente al SFT, medido cada 300 pasos.

## Capacidades

- Control visuomotor por imitacion en tareas de manipulacion de LIBERO (spatial, object y goal).
- Generacion de acciones continuas mediante flow matching, no decodificacion de texto.
- Ejecucion de politicas especificas por suite: cada carpeta contiene un modelo entrenado para su conjunto de tareas.
- Punto de comparacion supervisado frente a los runs PPO por suite del mismo entorno.
- Analisis de la magnitud del ajuste mediante `rank.json` (rango efectivo de la actualizacion de pesos).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de lenguaje de proposito general.

## Casos de uso

- Comparativa BC frente a PPO en LIBERO: cargar `full_weights.pt` de cada suite y evaluar la tasa de exito con el mismo protocolo que los runs de PPO para aislar el efecto del aprendizaje por refuerzo frente a la imitacion.
- Reproduccion de experimentos: reentrenar con `config.yaml` y la semilla 0 para verificar los resultados publicados y estudiar la sensibilidad a hiperparametros (LR, batch, pasos).
- Estudio de actualizacion de pesos: usar `rank.json` para analizar como cambia el rango efectivo del ajuste a lo largo de los 3000 pasos y relacionarlo con el rendimiento por suite.
- Baseline supervisado en investigacion de robotica: servir de referencia de imitacion full-shot para nuevos metodos de RL o de imitacion en el mismo benchmark.
- Analisis de especializacion por tarea: comparar los tres modelos (spatial, object, goal) para estudiar como la composicion del dataset afecta a la politica aprendida.
- Punto de partida para fine-tuning: reutilizar los pesos como inicializacion en experimentos posteriores sobre LIBERO u otros entornos de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion de tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 25,6 GB en total para tres suites, lo que sugiere pesos en precision completa; la VRAM real depende del tamano del modelo, que no se documenta.
- GPU recomendadas: no disponible. El entrenamiento uso una GPU por suite con la configuracion `libero_sft_openpi_pi05_2gpu` de RLinf, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende de los parametros del modelo base Pi0.5, no publicados en esta ficha.
- Opciones de despliegue: los pesos estan en `.pt` (PyTorch) y no hay variantes GGUF, ONNX ni integraciones con vLLM, llama.cpp u Ollama documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi0.5 per-suite full-shot BC (este) | no disponible | no disponible | sin evaluacion publicada | no disponible | Hugging Face (Riasok) |
| RLinf-Pi05-LIBERO-SFT (modelo base) | no disponible | no disponible | no disponible en esta ficha | no disponible | referenciado como origen de los pesos |
| Runs PPO por suite (RLinf) | no disponible | no disponible | no disponible en esta ficha | no disponible | contrapartida RL de este modelo |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de tasa de exito; el rendimiento real en LIBERO es desconocido.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- Modelo especializado en LIBERO; no generaliza a otras tareas de robotica sin fine-tuning.
- Solo se entrena el "action expert"; el resto del modelo permanece congelado respecto al SFT.
- Pesos en `.pt` de gran tamano (25,6 GB en total): no hay versiones cuantizadas ni optimizadas para despliegue.
- Riesgo de sobreajuste a las demostraciones de cada suite, dado el entrenamiento full-shot con 3000 pasos y LR constante.
- Sin informacion sobre sesgos, idiomas ni comportamiento fuera de distribucion.
- Artefacto de investigacion: no apto para produccion sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Riasok/pi05-libero-bc-per-suite
- Modelo base referenciado: RLinf-Pi05-LIBERO-SFT (sin URL directa en la informacion disponible)
- Dataset: physical-intelligence/libero (sin URL directa en la informacion disponible)
- Configuracion de entrenamiento: RLinf `libero_sft_openpi_pi05_2gpu` (sin URL directa en la informacion disponible)
