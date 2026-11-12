# RainyBot/pi0-fast-bridge-commonstart-15k

## Resumen

RainyBot/pi0-fast-bridge-commonstart-15k es un modelo de robotica basado en la arquitectura π0-FAST (Physical Intelligence), publicado por el usuario RainyBot como checkpoint de inferencia del paso de actualizacion 15.000. El modelo genera trozos de accion (action chunks) de 10 pasos y 7 dimensiones a partir de una imagen RGB, el estado del robot Bridge (8 dimensiones) y una instruccion en lenguaje natural, empleando decodificacion autorregresiva con tokens FAST sobre un backbone PaliGemma. El repositorio contiene unicamente los pesos EMA de inferencia (11,7 GB en FP32), la configuracion y los assets de normalizacion y tokenizador, sin estados de optimizador ni shards de entrenamiento.

El modelo esta entrenado sobre una mezcla de los datasets Bridge y RT1 con asignacion 0,5/0,5, y esta especializado en el entorno Bridge (manipulacion de escritorio con un brazo tipo WidowX). Su relevancia es acotada: no es un modelo de proposito general, sino un artefacto de investigacion reproducible para evaluar politicas π0-FAST sobre Bridge. El autor advierte explicitamente de que no declara tasas de exito en SimplerEnv ni proporciona un controlador de robot desplegable.

La ficha se basa exclusivamente en la model card publicada; no se dispone de informacion adicional sobre benchmarks, licencia o detalles de entrenamiento mas alla de los indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0-FAST sobre backbone PaliGemma (transformer vision-lenguaje-accion con decodificacion autorregresiva de tokens FAST) |
| Parametros totales | no disponible (603 tensores de parametros segun la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de tokens de accion: 512; `--max-tokens` por defecto 256) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; inferencia de referencia en BF16) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 11,7 GB, pesos FP32 mas assets de soporte) |

## Arquitectura y entrenamiento

El modelo sigue la receta π0-FAST: un backbone vision-lenguaje PaliGemma que recibe una imagen RGB redimensionada y letterboxed a 224x224, una instruccion textual con un unico token BOS en el prefijo, y el estado bruto del robot Bridge (8 dimensiones). La salida se decodifica de forma autorregresiva como una secuencia de tokens FAST que codifica un chunk de acciones de horizonte 10 y presupuesto de 512 tokens; en inferencia se decodifica `[10,8]`, se descarta la octava coordenada de relleno y se invierte la normalizacion por cuantiles exacta usada en entrenamiento. El decodificador de referencia opera en BF16 sin KV cache.

El entrenamiento combina los datasets Bridge y RT1 con asignacion de manifiesto 0,5/0,5 y probabilidades de trayectoria guardadas; las acciones de 7 dimensiones se rellenan a 8 antes de la codificacion FAST. El checkpoint publicado corresponde a los pesos EMA de la actualizacion 15.000. La model card no detalla el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron etapas de RLHF/DPO; tampoco describe innovaciones adicionales mas alla del esquema FAST de tokenizacion de acciones.

## Capacidades

- Generacion de chunks de accion para control robotico: produce `actions` de forma `[10,7]` en unidades brutas del dataset Bridge.
- Condicionamiento multimodal: combina imagen RGB de camara, estado del robot de 8 dimensiones e instruccion en lenguaje natural.
- Seguimiento de instrucciones en ingles para tareas de manipulacion (por ejemplo, "put the spoon on the towel").
- Decodificacion FAST autorregresiva con verificacion de sufijo completo (`Action:` / FAST / `|` / EOS); falla de forma explicita si el sufijo es incompleto en lugar de devolver acciones nulas.
- Integracion en Python mediante la clase `BridgeFASTPolicy` con el metodo `predict(rgb_uint8, raw_bridge_state8, instruction)`.
- Seleccion de normalizacion por fuente de datos (`bridge_orig_lerobot` por defecto, `fractal20220817_data_lerobot` para RT1).
- No soporta tool calling, function calling, agentes multi-paso, vision mas alla de la camara de entrada, audio ni modo thinking; no es un modelo de texto general.

## Casos de uso

- Evaluacion reproducible de politicas π0-FAST: el checkpoint permite reproducir la inferencia del paso 15.000 sin necesidad de los shards de entrenamiento ni de los pesos preentrenados originales, util para comparar variantes de tokenizacion FAST.
- Investigacion en manipulacion con el dataset Bridge: sirve como linea base para experimentos de imitacion sobre tareas de escritorio con brazo WidowX, usando el estado bruto de 8 dimensiones y la imagen de camara.
- Estudio de normalizacion y preprocesado: al exponer `normalized_actions` y `actions`, permite analizar el efecto de la inversion de cuantiles y del relleno de 7D a 8D en la calidad del chunk generado.
- Desarrollo de adaptadores de simulador: el chunk devuelto sigue la semantica del dataset, de modo que equipos que construyen adaptadores para SimplerEnv o simuladores propios pueden integrarlo como politica de referencia.
- Analisis de robustez ante instrucciones: permite medir como varia la accion generada al reformular instrucciones en ingles sobre la misma observacion, dentro del dominio Bridge.
- Docencia y divulgacion: ejemplo concreto de modelo vision-lenguaje-accion con decodificacion de acciones como tokens, adecuado para explicar pipelines de robotica basada en VLA.
- Pruebas de integracion en CPU: el script de referencia permite ejecutar inferencia en CPU (lenta) para validar el pipeline antes de pasar a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el endpoint no declara una tasa de exito en SimplerEnv ni proporciona un controlador de robot desplegable, por lo que no se ofrecen numeros de MMLU, HumanEval, GSM8K ni metricas de manipulacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 11,7 GB en FP32, por lo que la inferencia en BF16 requiere del orden de 6-7 GB de memoria para los pesos, mas overhead de activaciones y del decodificador sin KV cache.
- GPU recomendadas: no disponibles en la informacion proporcionada; la model card solo menciona `--device cuda` para GPU CUDA o DCU HIP con PyTorch compatible.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; dado el tamano de pesos en BF16 es plausible que quepa en GPUs con 12-16 GB, pero no esta verificado en la documentacion.
- Despliegue: scripts propios `setup_inference.sh` y `run_inference.sh` del repositorio ReTime_source, con LeRobot en revision `cbc8bfb2e618`, OpenPI en revision `215abfb217dbac7d5f1273282331b9b1866c0479` y Transformers 4.53.2 con parches de OpenPI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo advierte de que la inferencia en CPU es lenta y que el decodificador de referencia no usa KV cache.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos π0-FAST, π0, OpenVLA u otras politicas VLA, ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre Bridge y RT1, con estado de 8 dimensiones especifico de Bridge; no debe alimentarse con el estado de otro robot ni normalizarse de nuevo.
- Solo inferencia: el repositorio no incluye estados de optimizador ni shards de entrenamiento, por lo que no permite reanudar el entrenamiento.
- Sin controlador desplegable: el chunk devuelto sigue la semantica del dataset; la frecuencia de control, conversion de frames, conversion de comandos de pinza, ejecucion del chunk y reset del episodio deben implementarse en el adaptador del simulador o robot.
- Sin tasa de exito declarada: el autor no reclama resultados en SimplerEnv ni garantiza comportamiento en el mundo real.
- Decodificacion fragil: si el sufijo FAST no se completa, la inferencia falla explicitamente; no hay sustitucion silenciosa por acciones nulas, lo que exige gestion de errores en produccion.
- Idiomas: instrucciones unicamente en ingles; no se documenta soporte multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion en la instruccion: al ser un modelo generativo de acciones, puede producir chunks incoherentes ante instrucciones fuera de distribucion o imagenes no representativas.
- Sesgos: no documentados; al entrenarse con Bridge y RT1 hereda los sesgos de esos datasets (entornos de laboratorio, objetos y tareas acotadas).
- Reproducibilidad dependiente de revisiones fijas de LeRobot y OpenPI y de Transformers 4.53.2 con parches; cambios en esas dependencias pueden romper la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RainyBot/pi0-fast-bridge-commonstart-15k
- Repositorio de codigo de inferencia: https://github.com/miaochengy-pngu/ReTime_source
- LeRobot (revision fijada `cbc8bfb2e618`): no se proporciona URL directa en la model card
- OpenPI (revision fijada `215abfb217dbac7d5f1273282331b9b1866c0479`): no se proporciona URL directa en la model card
- Paper de π0-FAST: no disponible en la informacion proporcionada
