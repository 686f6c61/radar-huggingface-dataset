# Donghyun1228/ttt-vla-libero-sglp-mlp-decoder-20261015

## Resumen

TTT-VLA SG-LP (MLP state decoder) para LIBERO es un checkpoint de investigación publicado por el usuario Donghyun1228 en HuggingFace. Se trata de una reproducción no oficial de la etapa de entrenamiento fuente ("π₀.₅ + SG-LP") del método TTT-VLA descrito en el artículo *TTT-VLA: Test-Time Latent Prompt Optimization for VLA Models* (arXiv:2606.03127). El modelo se implementa sobre JAX/OpenPI π₀.₅, un modelo de visión-lenguaje-acción (VLA) orientado a manipulación robótica, y este checkpoint concreto no ha recibido entrenamiento en tiempo de prueba (test-time training), por lo que representa únicamente el punto de partida del pipeline completo.

El modelo parte de los parámetros π₀.₅ LIBERO del checkpoint `Donghyun1228/libero-dense-kd-ablation-inputs-20261007` y se entrena sobre el conjunto original-view LIBERO (1.693 episodios, 273.465 fotogramas, 4 suites). La innovación principal respecto al artículo original es la cabecera proxy: en lugar del experto de estado basado en flow matching propuesto por los autores, se emplea un decodificador de estado MLP sobre las características del VLM, que regresa por MSE las coordenadas normalizadas del efector final (xyz) y el estado del gripper.

Es relevante ahora porque publica pesos verificados (contra el paso 20.000), configuración y registros de entrenamiento completos, lo que facilita la reproducibilidad de una etapa intermedia de un framework de adaptación en tiempo de prueba para políticas robóticas. El repositorio ocupa 13,4 GB y se distribuye bajo licencia Apache 2.0, con fecha de creación del 15 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (JAX/OpenPI) sobre VLM, con cabecera proxy de decodificador de estado MLP |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos distribuidos estan en FP32) |
| Idiomas soportados | no disponible (modelo orientado a accion robotica, no a texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | NPZ (`sg_lp.npz`, FP32) mas configuracion JSON (`sg_lp.json`, `config.json`) |

## Arquitectura y entrenamiento

El modelo es una implementacion en JAX/OpenPI de la arquitectura π₀.₅, un VLA que combina un modelo de vision-lenguaje con un decodificador de acciones. Sobre las caracteristicas del VLM se anade una cabecera proxy especifica: un decodificador de estado MLP que realiza regresion por error cuadratico medio (MSE) de las coordenadas normalizadas del efector final (xyz) y del gripper. El autor indica explicitamente que esta cabecera sustituye al experto de estado basado en flow matching del articulo original, y que se trata de la opcion sugerida por los autores como aproximacion.

El entrenamiento se realizo sobre datos original-view de LIBERO, con 1.693 episodios y 273.465 fotogramas repartidos en 4 suites. La normalizacion empleada es de tipo quantile, definida en `assets/donghyun/libero/norm_stats.json`. La configuracion reportada es: 20.000 pasos, division por etapas 10.000/10.000 con *prompt-drop* de p=1 a p=0.5, optimizador AdamW con learning rate 1e-4 y weight decay 0, batch global de 64 (32 x 2 por acumulacion; el articulo usa 1.024) y una unica GPU NVIDIA B200. Las perdidas medias de los ultimos 500 pasos son 0,0178 para accion y 0,0390 para la tarea proxy. No se aplico entrenamiento en tiempo de prueba a este checkpoint.

## Capacidades

- Prediccion de acciones de manipulacion robotica en el entorno LIBERO, condicionada por observaciones visuales y lenguaje.
- Regresion del estado del robot: coordenadas normalizadas del efector final (xyz) y estado del gripper mediante la cabecera proxy MLP.
- Funcionamiento como etapa fuente (source stage) dentro del pipeline TTT-VLA, antes de la optimizacion de prompt latente en tiempo de prueba.
- Soporte de condicionamiento por prompt, con *prompt-drop* durante el entrenamiento, lo que permite estudiar el efecto de la presencia o ausencia de instrucciones textuales.
- Evaluacion sobre las 4 suites de LIBERO con rollouts de 40 tareas x 50 estados.
- No se documentan capacidades de generacion de texto general, razonamiento, codigo, matematicas, vision general, audio, tool calling ni function calling.
- No se documentan capacidades de agente o razonamiento multi-paso.
- Idiomas soportados: no disponible.

## Casos de uso

- Reproduccion del articulo TTT-VLA: este checkpoint permite arrancar la etapa de source training ("π₀.₅ + SG-LP") sin repetir las 20.000 iteraciones, ya que los pesos publicados estan verificados contra el paso 20.000.
- Punto de partida para la fase de test-time training: al no haberse aplicado TTT a este checkpoint, es el candidato natural para entrenar la optimizacion de prompt latente en el momento de despliegue descrita en el articulo.
- Ablacion de cabeceras proxy: comparar el decodificador MLP de estado incluido aqui con el experto de estado de flow matching del articulo, manteniendo constante el resto del pipeline.
- Evaluacion estandarizada en LIBERO: sirve como base para rollouts de 40 tareas x 50 estados por orientacion (yaw) en las 4 suites, con las advertencias del autor sobre el solapamiento entre indices de recoleccion (0-9) y de evaluacion (0-49).
- Investigacion sobre robustez a cambios de distribucion: el marco TTT-VLA se dirige precisamente a la degradacion de politicas VLA bajo *distribution shift* en despliegue, por lo que este checkpoint es util como referencia sin adaptacion.
- Docencia y experimentacion en robotica con VLA: al distribuirse en NPZ FP32 con configuracion JSON y registros de entrenamiento, es inspeccionable y modificable con herramientas de Python/JAX sin depender de formatos propietarios.
- Analisis de normalizacion y preprocesado: el fichero de estadisticas quantile incluido permite reproducir exactamente el tratamiento de datos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta perdidas de entrenamiento (media de los ultimos 500 pasos: accion 0,0178; proxy 0,0390) y advierte que los protocolos LIBERO empleados en checkpoints relacionados son protocolos de proyecto y hiperparametros transferidos de TTT-VLA, no resultados de benchmark del articulo.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de accion (media ultimos 500 pasos) | 0,0178 | Entrenamiento, no evaluacion |
| Perdida proxy (media ultimos 500 pasos) | 0,0390 | Entrenamiento, no evaluacion |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplicables a este tipo de modelo |
| Tasa de exito en LIBERO | no disponible | No publicada para este checkpoint |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el recuento de parametros ni medidas de memoria.
- Como referencia, el repositorio completo ocupa 13,4 GB e incluye pesos FP32 (`sg_lp.npz`), configuracion y registros de entrenamiento; una carga en FP32 requiere un orden de magnitud de memoria similar al tamano de los pesos, pero no se confirma ninguna cifra.
- GPU utilizada en entrenamiento: 1 x NVIDIA B200. No se documentan requisitos de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse que quepa en tarjetas tipo RTX 4090 sin datos de parametros y precision.
- Opciones de despliegue: el modelo se implementa en JAX/OpenPI, por lo que se espera el uso del *stack* de OpenPI. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que ademas no son adecuados para un VLA con decodificador de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Donghyun1228/ttt-vla-libero-sglp-mlp-decoder-20261015 (este) | no disponible | no disponible | Solo perdidas de entrenamiento | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| TTT-VLA (referencia del articulo, arXiv:2606.03127) | no disponible | no disponible | Resultados del articulo no disponibles en la informacion recogida | no disponible | Articulo y version HTML en arXiv |
| Donghyun1228/ttt-vla-libero-actionframe-lr1e5-20261007 | no disponible | no disponible | Protocolos LIBERO de proyecto, no resultados del articulo | no disponible en la informacion recogida | HuggingFace |
| π₀.₅ (OpenPI, base sobre la que se construye) | no disponible | no disponible | no disponible | no disponible | OpenPI |

No se dispone de datos suficientes para comparar parametros, contexto o metricas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Reproduccion no oficial: el autor la describe como tal y sustituye el experto de estado de flow matching del articulo por un decodificador MLP, por lo que los resultados pueden no ser equivalentes a los del paper.
- No se ha aplicado test-time training, de modo que este checkpoint no representa el rendimiento final del metodo TTT-VLA, solo su etapa fuente.
- Batch global de 64 frente a los 1.024 del articulo (32 x 2 de acumulacion) e hiperparametros posiblemente distintos, lo que limita la comparabilidad directa.
- El propio autor advierte, en un checkpoint relacionado, que los protocolos LIBERO usados son de proyecto y no resultados de benchmark del articulo, y que los indices de estado de recoleccion 0-9 se solapan con los de evaluacion 0-49.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: no disponible en el sentido textual; en politica robotica el riesgo equivalente es la ejecucion de acciones incorrectas, y no se publican tasas de fallo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de π₀.₅ y de checkpoints del mismo autor cuyas licencias no se detallan en la informacion disponible; conviene verificar la cadena de licencias antes de un uso en produccion.
- Estado de adopcion nulo: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- No apto como sustituto de un LLM: no genera texto general ni soporta tool calling; su salida es una accion o un estado estimado.
- Los pesos se distribuyen en NPZ FP32, formato poco habitual en pipelines de inferencia estandar, lo que anade trabajo de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/ttt-vla-libero-sglp-mlp-decoder-20261015
- Articulo TTT-VLA (abs): https://arxiv.org/abs/2606.03127
- Articulo TTT-VLA (HTML v1): https://arxiv.org/html/2606.03127v1
- Ficha del articulo en DeepPaper: https://arxiv.deeppaper.ai/papers/2606.03127v1
- Checkpoint relacionado (actionframe, lr 1e-5): https://huggingface.co/Donghyun1228/ttt-vla-libero-actionframe-lr1e5-20261007
- Checkpoint de inicializacion π₀.₅ LIBERO: https://huggingface.co/Donghyun1228/libero-dense-kd-ablation-inputs-20261007
- Codigo del autor (repositorio `vla_adaptation`, commit 15dab48918be2bac02d80693cab5dd490bc02f35, directorio `baselines/ttt_vla`): no se proporciona URL directa en la informacion disponible.
- Articulo sobre perceptrones multicapa (referencia generica sobre MLP): https://www.geeksforgeeks.org/deep-learning/multi-layer-perceptron-learning-in-tensorflow/
