# kaushikb258/pi0-fast-libero-mimicgen

## Resumen

pi0-fast-libero-mimicgen es un repositorio de artefactos de inferencia publicado por el usuario kaushikb258 dentro de sus experimentos con OpenPI. No contiene un modelo entrenado desde cero, sino dos vision-language-action (VLA) basadas en pi0-FAST afinadas de forma independiente sobre LIBERO-Spatial y MimicGen Square D0, junto con los dos controladores residuales (MLP) entrenados para cada una de ellas. El punto de partida de ambas VLA es el checkpoint oficial `pi0_fast_base` de Physical Intelligence.

El interes del repositorio es metodologico: mide el efecto de dos tecnicas de posprocesado de acciones sobre una VLA congelada, el suavizado exponencial (EMA) de las acciones y un cabezal residual entrenado que corrige diez pasos por seis dimensiones de movimiento antes de aplicar la EMA. Los resultados seleccionados pasan de 91/100 a 96/100 en LIBERO-Spatial y de 72/100 a 83/100 en MimicGen Square D0, siempre sobre 100 episodios de evaluacion de desarrollo.

Es un artefacto muy especializado, orientado a reproducir y auditar los experimentos, no a un uso general. Los pesos son parametros JAX/Orbax del stack OpenPI y no un bundle `AutoModel` de Transformers, la licencia no esta declarada y el propio autor advierte que la seleccion de checkpoints se hizo con retroalimentacion de la evaluacion, por lo que no deben interpretarse como resultados de test intactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en pi0-FAST (transformer tipo PaliGemma con tokenizacion de acciones FAST autorregresiva) mas un cabezal residual MLP externo (2048→256→128→60) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en el formato de entrenamiento (JAX/Orbax), sin variantes GGUF ni cuantizadas declaradas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | VLA: parametros OpenPI JAX/Orbax con assets de normalizacion. Controladores: bundles PyTorch state-dict cargados con `weights_only=True` |
| Tarea / pipeline | robotics (vision-language-action) |
| Tamano del repositorio | 11,2 GB de pesos de inferencia en total; cada cabezal residual ocupa aproximadamente 2,3 MB |

## Arquitectura y entrenamiento

Cada VLA parte del checkpoint `pi0_fast_base` de Physical Intelligence (`gs://openpi-assets/checkpoints/pi0_fast_base`) y se afina por separado: la de LIBERO-Spatial durante 25.000 actualizaciones (checkpoint original 24999) y la de MimicGen Square D0 durante 50.001 actualizaciones (checkpoint original 50000). Los datos de ajuste corresponden a los datasets `physical-intelligence/libero` y `amandlek/mimicgen_datasets`. La VLA permanece congelada durante el entrenamiento del controlador.

El componente diferenciador es el cabezal residual, un MLP de 2048→256→128→60 entrenado sobre caracteristicas de prefijo agrupadas de los bloques Gemma 4, 8, 12 y 18, con LayerNorm sin parametros afines y una suma ponderada por softmax aprendida. El cabezal corrige diez pasos de accion por seis dimensiones de movimiento y deja el gripper sin modificar; las correcciones se suman antes del suavizado EMA. La ponderacion residual usa lambda 0,2 en LIBERO y 0,3 en MimicGen. El repositorio incluye unicamente artefactos de inferencia: los ficheros de estado del optimizador y de entrenamiento se omiten de forma explicita, por lo que no permiten continuar el entrenamiento con el estado exacto.

## Capacidades

- Generacion de politicas de manipulacion robotica a partir de observaciones visuales e instrucciones en lenguaje natural (ingles).
- Prediccion de secuencias de acciones de diez pasos en seis dimensiones de movimiento, con la dimension del gripper sin corregir por el cabezal residual.
- Correccion residual de acciones aprendida sobre una VLA congelada, aplicada antes del suavizado temporal.
- Suavizado EMA de acciones como control de comparacion (`RESIDUAL_BETA=0`) o combinado con el cabezal residual (`RESIDUAL_BETA=1`).
- Evaluacion de dos tareas concretas: LIBERO-Spatial y MimicGen Square D0.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM conversacional.
- No es multilingue: la model card declara unicamente `en`.
- No se declaran capacidades de vision general, audio, thinking mode ni generacion de texto libre; la salida es accion motora.

## Casos de uso

- Evaluacion comparativa de politicas en simulacion: permite medir el rendimiento de una VLA pi0-FAST en LIBERO-Spatial con 100 episodios de desarrollo, usando los wrappers `eval_libero_residual.sh` con `RESIDUAL_BETA=0` o `1`.
- Benchmark en MimicGen Square D0: el checkpoint afinado con 50.001 actualizaciones y su controlador sirven para reproducir la tarea de ensamblaje Square D0 y comparar el efecto del cabezal residual (72/100 frente a 83/100).
- Investigacion sobre control residual: el par VLA congelada mas MLP residual es un banco de pruebas directo para estudiar correcciones de accion de bajo coste (2,3 MB por cabezal) frente al reajuste completo del backbone.
- Estudio de suavizado temporal de acciones: la distincion entre `RESIDUAL_BETA=0` y `RESIDUAL_BETA=1`, junto con la EMA, permite aislar el efecto de la regularizacion temporal en el exito de la tarea.
- Reproduccion de experimentos OpenPI: el repositorio incluye `release_manifest.json` con checksums SHA-256 por fichero e identidades de ejecucion, util para auditar resultados publicados y verificar integridad de artefactos.
- Auditoria de protocolos de evaluacion: el caso LIBERO documenta explicitamente una discrepancia de repetibilidad entre ejecuciones (87 exitos en ambos metodos, nueve solo con controlador, cuatro solo con control, cero fallos en ambos), util como material docente sobre seleccion de checkpoints y sesgo de evaluacion.
- Punto de partida para afinado posterior en robotica: al ser parametros JAX/Orbax compatibles con OpenPI, pueden reutilizarse como inicializacion en nuevos ajustes sobre LIBERO o MimicGen, asumiendo que no se dispone del estado del optimizador.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son tasas de exito sobre 100 episodios de evaluacion de desarrollo:

| Metodo | LIBERO-Spatial | MimicGen Square D0 |
|---|---:|---:|
| VLA sola | 91/100 (historico) | 72/100 |
| VLA + EMA de acciones | 91/100 (control de camino emparejado, beta=0) | 76/100 |
| VLA + EMA de acciones + residual entrenado | 96/100 (beta=1) | 83/100 |

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, y no serian aplicables a un modelo de accion. El propio autor advierte que los resultados historicos de LIBERO y todos los seleccionados de MimicGen son anteriores a la validacion estricta UTF-8 del tokenizador FAST y no se repitieron para esta publicacion, y que la seleccion de checkpoints y ajustes uso retroalimentacion de la evaluacion. La diferencia de cinco puntos porcentuales en LIBERO debe reportarse como observada, no como ganancia causal establecida.

## Requisitos de hardware

- El repositorio completo de pesos de inferencia ocupa aproximadamente 11,2 GB, repartidos entre dos VLA; cada cabezal residual anade unos 2,3 MB. No hay desglose oficial por modelo ni indicacion de la precision de almacenamiento.
- GPU concretas recomendadas: no disponible en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible. El tamano del repositorio sugiere que cada VLA requiere varios GB, pero no se confirma el numero exacto de parametros ni la precision.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI. El formato es JAX/Orbax dentro del stack OpenPI, y la evaluacion requiere ademas los entornos de simulador de LIBERO y MimicGen.
- Flujo de despliegue documentado: descarga con `huggingface_hub.snapshot_download`, clonado de `kaushikb258/pi0_fast`, ejecucion de `prepare_downloaded_controller.py` por dataset y lanzamiento de los wrappers con rutas absolutas (`LIBERO_CHECKPOINT`, `LIBERO_HEAD`, `MIMICGEN_CHECKPOINT`, `MIMICGEN_HEAD`).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Caveat de instalacion: el autor no afirma haber verificado una instalacion en maquina limpia ni una repeticion completa del simulador a partir de los artefactos descargados.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otros modelos en la informacion disponible. El unico punto de referencia citado es el checkpoint base `pi0_fast_base` de Physical Intelligence, del que derivan ambas VLA; no se detallan sus parametros, contexto ni licencia. Cualquier comparacion con alternativas como OpenVLA u otras variantes de pi0 requeriria datos que no se han facilitado.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaushikb258/pi0-fast-libero-mimicgen | VLA pi0-FAST afinada + cabezal residual | no disponible | no disponible | no disponible | 0 descargas, 0 likes |
| pi0_fast_base (Physical Intelligence) | VLA base de la que parten los ajustes | no disponible | no disponible | no disponible | citado como origen, no incluido en este repositorio |
| Otras alternativas (OpenVLA, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial ni condiciones de redistribucion, lo que supone un riesgo legal en produccion.
- Es una politica especifica de tarea (LIBERO-Spatial y MimicGen Square D0); no es un modelo generalista y no se documenta transferencia a otras tareas o entornos reales.
- Seleccion de checkpoints y ajustes guiada por retroalimentacion de la evaluacion: no son resultados de test intactos y pueden estar sesgados hacia el conjunto de evaluacion.
- Repetibilidad entre ejecuciones sin resolver: el autor pide reportar la diferencia observada de cinco puntos porcentuales en LIBERO, no una ganancia causal.
- Resultados historicos (LIBERO solo VLA y MimicGen) anteriores a la validacion estricta UTF-8 del tokenizador FAST; no se repitieron bajo una unica version de decodificador.
- El resultado antiguo de LIBERO al 97 % usaba un cabezal de epoca 0 con salida cero y queda excluido; ese cabezal no se distribuye.
- Es un artefacto de inferencia: los ficheros de optimizador y estado de entrenamiento se omiten, de modo que no permite reanudar el entrenamiento con estado exacto.
- No es un bundle `AutoModel` de Transformers; requiere el codigo y los entornos concretos de `kaushikb258/pi0_fast`, con dependencia de rutas absolutas y hashes de origen que no deben modificarse manualmente.
- Solo ingles en las instrucciones; sin capacidades conversacionales, de tool calling ni de agente.
- Riesgo de fallo fuera de distribucion: al ser una politica de accion, los errores se manifiestan como fallos de manipulacion, no como texto incorrecto, y no hay estimacion publicada de robustez ante cambios de iluminacion, camara u objetos.
- Cero descargas y cero interacciones en HuggingFace: no existe validacion independiente por parte de la comunidad.
- La instalacion completa en maquina limpia y la repeticion total del simulador a partir de los artefactos descargados no han sido verificadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaushikb258/pi0-fast-libero-mimicgen
- Codigo asociado y README con entornos Conda y evaluacion: https://github.com/kaushikb258/pi0_fast
- Checkpoint base citado como origen de los ajustes: `gs://openpi-assets/checkpoints/pi0_fast_base` (Physical Intelligence)
- Dataset de LIBERO: https://huggingface.co/datasets/physical-intelligence/libero
- Dataset de MimicGen: https://huggingface.co/datasets/amandlek/mimicgen_datasets
- Manifiesto de release con checksums SHA-256: `release_manifest.json` dentro del repositorio de HuggingFace
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
