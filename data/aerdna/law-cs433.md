# aerdna/LAW-cs433

## Resumen

LAW (Loopholing All the Way) es un modelo de lenguaje de difusion continua desarrollado por el autor aerdna en el contexto del curso CS-433 (Machine Learning) de la EPFL. Se trata de un checkpoint de investigacion entrenado especificamente para resolver puzles de Sudoku de dificultad alta, no un modelo de proposito general. El repositorio incluye tres semillas de entrenamiento con sus respectivos pesos y configuraciones.

El modelo resuelve el Sudoku mediante un bucle de denoising iterativo en el que cada paso realimenta la embedding esperada de la prediccion anterior. La configuracion corresponde a la mejor reportada en el paper asociado para Sudoku dificil: arquitectura `tiny-loop` con 8 bloques DiT, anchura 512 y longitud de secuencia 180. Los tres checkpoints alcanzan una precision media del 95,3 % en 2.000 puzles de validacion, frente al 96,5 % que reporta el paper para esta misma configuracion.

Es relevante como material reproducible para investigacion en modelos de difusion para texto y en razonamiento estructurado sobre tareas de restricciones, no como modelo de produccion. El tamano del repositorio es de 1,4 GB, coherente con tres checkpoints de un transformer pequeno que incluyen estado del optimizador y pesos EMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model continua, backbone DiT (`tiny-loop`, 8 bloques, anchura 512) |
| Parametros totales | no disponible (arquitectura pequena; el repo pesa 1,4 GB para 3 checkpoints con estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 180 tokens (longitud de secuencia del Sudoku) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre Sudoku, no sobre texto natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch Lightning (`.ckpt`) con estado del optimizador y pesos EMA; configuracion Hydra en YAML |

## Arquitectura y entrenamiento

LAW es un modelo de difusion continua para texto construido sobre bloques DiT (Diffusion Transformer). El bucle de denoising realimenta en cada paso la embedding esperada de la prediccion del paso anterior, en lugar de operar solo sobre tokens discretos. La configuracion `tiny-loop` emplea 8 bloques DiT con anchura 512 y longitud de secuencia 180, dimensionada para la cuadricula de Sudoku.

El entrenamiento sigue la receta del paper para Sudoku dificil: `algo=law`, perdida de entropia cruzada, M = 2 pasadas con probabilidades p = (0,1; 0,9), objetivo de ultima pasada, stop-gradient entre pasadas, avance temporal entre pasadas (dt = 1/180), regularizacion de temperatura de carry con rho = 2, batch de 256 y 15.385 pasos. Se publican tres semillas (1, 2 y 3), cada una con su checkpoint final `81-15385.ckpt` y los ficheros `config.yaml` y `overrides.yaml` de Hydra. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento mas alla de que son puzles de Sudoku dificil, ni el uso de RLHF o DPO.

## Capacidades

- Resolucion de puzles de Sudoku de dificultad alta mediante denoising iterativo (180 NFE en la evaluacion reportada).
- Generacion condicionada por la pista inicial del puzle, con realimentacion de embeddings esperadas entre pasos.
- Modo de evaluacion con pesos EMA (`model._eval_mode()`).
- Reproducibilidad: cada semilla incluye configuracion Hydra completa para reentrenamiento o evaluacion.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues segun la informacion disponible.
- No es un modelo de chat ni de generacion de texto libre; su dominio esta acotado al Sudoku.

## Casos de uso

- Investigacion en modelos de difusion para texto: el checkpoint permite reproducir y extender los experimentos del paper sobre denoising continuo con realimentacion de embeddings.
- Estudio de razonamiento bajo restricciones: el Sudoku es un banco de pruebas controlado para medir la capacidad de un modelo de difusion de satisfacer restricciones duras (filas, columnas y cajas).
- Analisis de estabilidad entre semillas: las tres semillas publicadas permiten estudiar la varianza de resultados (94,4 % a 95,9 %) en un mismo recipe.
- Docencia y cursos de machine learning: el repo incluye configuracion y overrides, lo que facilita su uso como ejemplo reproducible en asignaturas de generacion o aprendizaje profundo.
- Comparacion de objetivos de entrenamiento: la receta concreta (M = 2, last-pass, stop-gradient, dt = 1/180) sirve como referencia para ablaciones sobre modelos de difusion.
- Evaluacion de decodificacion especulativa o aceleracion de NFE: al fijarse 180 NFE y 8 semillas de muestreo, es un entorno medible para estudiar el coste de inferencia.

## Benchmarks y rendimiento

| Checkpoint | Precision (2.000 puzles, 180 NFE, T = 1, 8 semillas) |
|---|---|
| seed1 | 95,7 % |
| seed2 | 95,9 % |
| seed3 | 94,4 % |
| Media | 95,3 % |
| Paper (misma configuracion) | 96,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la arquitectura (8 bloques DiT, anchura 512, secuencia 180) es un modelo pequeno que previsiblemente cabe en GPU de consumo, aunque no se aportan cifras.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido de la arquitectura, pero no confirmado en la informacion disponible.
- Opciones de despliegue: carga via PyTorch Lightning (`algo.LAW.load_from_checkpoint`) con tokenizer y configuracion Hydra; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluacion se realiza con 180 NFE y 8 semillas de muestreo por puzle.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (difusion para Sudoku o difusion de lenguaje de este tamano) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio muy acotado: entrenado exclusivamente para Sudoku dificil; no es utilizable para generacion de texto general, codigo ni dialogos.
- Precision por debajo del paper: la media de las tres semillas (95,3 %) queda 1,2 puntos por debajo del 96,5 % reportado, lo que sugiere variabilidad o diferencias de reproduccion.
- Varazon entre semillas: el rango observado (94,4 % a 95,9 %) implica que el resultado depende de la semilla de entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en Sudoku se traduce en cuadriculas invalidas o incompletas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta pensado para produccion y no se ofrecen garantias.
- Checkpoints con estado del optimizador y pesos EMA: el tamano (1,4 GB para tres semillas) incluye artefactos de entrenamiento, no solo pesos de inferencia.
- Idiomas y sesgos: no documentados; al no entrenarse sobre texto natural, las consideraciones habituales de sesgo linguistico no aplican de forma directa.
- Sin pipeline declarado en Hugging Face ni idiomas definidos: la integracion con herramientas estandar de inferencia no esta soportada de serie.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aerdna/LAW-cs433
- Paper de LAW (referenciado en la model card, sin URL explicita en la informacion disponible): no disponible
- Repositorio de codigo (`algo`, `dataloader`): no disponible en la informacion proporcionada
- Demo: no disponible
