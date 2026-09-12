# ekunish/parc2026-track2-kairos-rim-capacity-20260909

## Resumen

Este repositorio, publicado por el usuario ekunish, contiene checkpoints experimentales de ajuste fino (fine-tuning) derivados de ACERobotics/kairos-4B-robot-LIBERO-plus, un modelo de robótica de tipo visión-lenguaje-acción orientado a tareas de manipulación en el entorno de simulación LIBERO. La revisión base empleada es `0acc24a753e005683e35cf73c3d33f7e3fd4723a`, distribuida bajo licencia Apache-2.0 por ACERobotics, que no participa en esta publicación.

El experimento, denominado "normal-rim capacity", actualiza únicamente los parámetros de los bloques DiT de vídeo y de acción con 100 trayectorias de agarre guionizadas (50 por tarea, índices de tarea 23 y 34 de LIBERO, 21.290 fotogramas), manteniendo congelados el VAE y el codificador de lenguaje. El entrenamiento usó tamaño de lote efectivo 80, optimizador AdamW, tasas de aprendizaje de 3e-5 para acción y 7.5e-6 para vídeo, y semilla 20260909.

Su relevancia es metodológica más que de rendimiento: el propio autor declara que no son mejoras validadas ni paquetes listos para enviar a competición, y publica resultados que en algunos escenarios son peores que el modelo sin ajustar. Resulta útil como artefacto de investigación reproducible, como ejemplo de ajuste fino con recursos limitados y como caso de reporte honesto de resultados negativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible por completo; la model card menciona bloques DiT de video y de accion, un VAE y un codificador de lenguaje |
| Parametros totales | No disponible (el modelo base se denomina kairos-4B) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos de evaluacion se publican en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, `model.safetensors`) y PyTorch pickle (FP32, `training_state.pt`) |
| Autor de la publicacion | ekunish |
| Modelo base | ACERobotics/kairos-4B-robot-LIBERO-plus |
| Revision base | 0acc24a753e005683e35cf73c3d33f7e3fd4723a |
| Tarea / pipeline | robotics |
| Tamano del repositorio | 520,4 GB |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo compuesto por tres piezas: un VAE, un codificador de lenguaje y bloques DiT (Diffusion Transformer) para vídeo y para acción. El ajuste fino solo modificó los parámetros de los dos bloques DiT; el VAE y el codificador de lenguaje permanecieron congelados durante todo el entrenamiento. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de difusión empleado.

El conjunto de datos de ajuste consistió en 100 trayectorias guionizadas de agarre "normal-rim" (50 por tarea, sobre los índices de tarea 23 y 34 de LIBERO, con 21.290 fotogramas en total). La configuración declarada es: tamaño de lote efectivo 80, optimizador AdamW, tasa de aprendizaje 3e-5 para el bloque de acción y 7.5e-6 para el bloque de vídeo, y semilla 20260909. No se menciona uso de RLHF, DPO ni ninguna otra etapa de alineación; se trata de aprendizaje supervisado sobre demostraciones.

El repositorio separa los pesos de evaluación (`model.safetensors`, BF16) de un estado de entrenamiento completo (`training_state.pt`, FP32 con pesos, optimizador, planificador, muestreador y estados del generador de números aleatorios), lo que permite reanudar el entrenamiento de forma exacta. `FILES.json` registra los hashes de los ficheros.

## Capacidades

- Manipulación robótica guiada por instrucciones en el simulador LIBERO, en las tareas 23 y 34.
- Predicción de acción (política de control) mediante el bloque DiT de acción ajustado.
- Predicción de vídeo mediante el bloque DiT de vídeo ajustado.
- Comprensión de instrucciones en lenguaje natural a través del codificador de lenguaje congelado del modelo base.
- Percepción visual mediante el VAE congelado del modelo base.
- Reanudación exacta del entrenamiento gracias al estado FP32 completo incluido en el repositorio.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, audio, etc.).
- No es un modelo de chat ni un modelo de lenguaje generativo de propósito general.

## Casos de uso

- Reproducción de experimentos de ajuste fino en robótica: el repositorio incluye el estado FP32 con optimizador, planificador, muestreador y semillas, lo que permite reanudar el entrenamiento exactamente desde el punto en que se dejó y verificar los resultados publicados.
- Evaluación de olvido catastrófico: sirve como caso de estudio para medir cuánto degrada un ajuste fino con 100 trayectorias el rendimiento en controles limpios (de 6/8 en el modelo base a 5/8 en este checkpoint).
- Investigación sobre políticas de agarre específicas: el ajuste se centró en agarres "normal-rim", por lo que es un punto de partida para estudiar la especialización de una política generalista hacia un tipo concreto de presa.
- Ablaciones de hiperparámetros: las tasas de aprendizaje separadas para acción (3e-5) y vídeo (7.5e-6) y el lote efectivo de 80 permiten diseñar experimentos controlados sobre estas variables.
- Generación de vídeo predictivo en simulación: el bloque DiT de vídeo ajustado puede emplearse para estudiar la consistencia entre la predicción visual y la acción ejecutada.
- Docencia y formación en modelos visión-lenguaje-acción: es un ejemplo compacto y bien documentado de ajuste parcial (solo DiT) sobre un modelo base público.
- Base para comparativas internas: dado que el autor declara explícitamente que no son mejoras validadas, resulta adecuado como referencia negativa o de control en estudios comparativos.
- Preparación de participantes en competiciones de robótica tipo PARC 2026: aunque el autor advierte que estos checkpoints no son ZIP listos para enviar, ilustran el flujo de trabajo de ajuste sobre LIBERO.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card corresponden al primer checkpoint con DiT completo, en el paso equivalente en datos, comparado con el modelo base sin ajustar en la misma GPU:

| Escenario | Checkpoint ajustado (full-DiT) | Modelo base (raw) |
|---|---|---|
| Estados iniciales de entrenamiento, 20 intentos | 1/20 exitos libres de colision | 3/20 |
| Controles de tarea limpios, 8 intentos | 5/8 | 6/8 |

El autor indica que los checkpoints posteriores deben evaluarse por separado y que estas cifras no son puntuaciones oficiales. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO promedio global) en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion proporcionada.
- Estimacion no confirmada para inferencia: los pesos de evaluacion en BF16 de un modelo de aproximadamente 4.000 millones de parametros ocuparian en torno a 8 GB, sin contar el VAE, el codificador de lenguaje ni las activaciones. Esta cifra se deduce de la denominacion del modelo base y no esta confirmada por el autor.
- Estimacion no confirmada para entrenamiento: el repositorio completo ocupa 520,4 GB, ya que `training_state.pt` almacena pesos en FP32, estado del optimizador AdamW, planificador, muestreador y RNG. El ajuste fino de un modelo de este tamano suele requerir aceleradores de gama alta (A100, H100 o equivalentes con 40-80 GB de memoria), pero no se ha confirmado.
- No se indica si el modelo cabe en una GPU de consumo. La inferencia en BF16 podria ser viable en GPUs con 12-16 GB, pero es una estimacion no verificada.
- Opciones de despliegue: no se documentan. Al no ser un modelo autorregresivo de lenguaje, herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables. El uso previsto es la evaluacion en simulacion LIBERO con PyTorch.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en la tarea declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ekunish/parc2026-track2-kairos-rim-capacity-20260909) | No disponible | No disponible | 1/20 y 5/8 | Apache-2.0 | Publico, 0 descargas |
| ACERobotics/kairos-4B-robot-LIBERO-plus (modelo base) | No disponible | No disponible | 3/20 y 6/8 (referencia del autor) | Apache-2.0 | Publico |
| Otros modelos visión-lenguaje-accion de la misma categoria (por ejemplo, OpenVLA o pi0) | No disponible | No disponible | No disponible | No consultado en la informacion proporcionada | No consultado en la informacion proporcionada |

No se proporcionan datos comparativos con alternativas de la misma categoria en la informacion disponible, por lo que la comparacion se limita al modelo base del que deriva este ajuste.

## Limitaciones y advertencias

- El propio autor declara que estos checkpoints son artefactos de investigacion y no mejoras validadas.
- Los resultados publicados muestran un rendimiento inferior al modelo base en ambos escenarios medidos (1/20 frente a 3/20, y 5/8 frente a 6/8), aunque con muestras muy pequenas (20 y 8 intentos) y por tanto con alta incertidumbre estadistica.
- No son paquetes listos para enviar a competicion, segun el autor.
- El ajuste se realizo con solo 100 trayectorias sobre dos tareas concretas (indices 23 y 34 de LIBERO), lo que limita la generalizacion a otras tareas, objetos o entornos.
- Solo se actualizaron los parametros de los bloques DiT de video y accion; el VAE y el codificador de lenguaje permanecen congelados, por lo que las capacidades perceptivas y linguisticas quedan fijadas a las del modelo base.
- `training_state.pt` es un fichero pickle de PyTorch; el propio autor advierte que solo debe cargarse desde una revision de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion proporcionada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no documentadas; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: el repositorio es Apache-2.0, lo que en principio permite uso comercial, pero los pesos derivan de un modelo base tambien Apache-2.0 cuya atribucion debe mantenerse. La publicacion no procede de los autores originales.
- El repositorio ocupa 520,4 GB, un coste de almacenamiento y transferencia considerable para un artefacto de investigacion.
- El modelo no incluye credenciales ni configuracion de cuenta, y los repositorios privados de experimentos previos siguen siendo privados.
- No hay descargas ni valoraciones registradas, lo que implica ausencia de validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion (septiembre de 2026) son posteriores al conocimiento de referencia habitual; no se ha verificado la vigencia del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ekunish/parc2026-track2-kairos-rim-capacity-20260909
- Modelo base: https://huggingface.co/ACERobotics/kairos-4B-robot-LIBERO-plus
- Revision base: 0acc24a753e005683e35cf73c3d33f7e3fd4723a
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados obtenidos corresponden unicamente a paginas de servicios de traduccion y busqueda sin relacion con el modelo.
