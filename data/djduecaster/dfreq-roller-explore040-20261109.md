# djduecaster/dfreq-roller-explore040-20261109

## Resumen

dfreq-roller-explore040-20261109 es un checkpoint de investigacion entrenado para una tarea de control roboticos dentro de un entorno de simulacion denominado microduck-arena, concretamente el evento roller-sprint-2m. Lo publica el usuario djduecaster en Hugging Face y se distribuye como un grafo ONNX en float32 con una unica entrada de observacion de 61 valores y una salida de 14 acciones a 50 Hz. No es un modelo de lenguaje: es una politica de control (policy) para un agente simulado con accesorios de tipo rollers.

El checkpoint corresponde al paso 40 de un proceso de aprendizaje por refuerzo (PPO) en el que solo se han reentrenado las 1806 neuronas de la capa de salida sobre un backbone neuronal heredado (Pollen) y un controlador de realimentacion N8 propio, ambos acreditados en la model card upstream. El autor insiste en que las diferencias con otros checkpoints de la misma fecha (Explore016, Explore024, Explore032) son pesos genuinos aprendidos y no variantes de hash.

Su relevancia es acotada: se trata de un candidato de investigacion para el ranking de la arena, sin licencia de redistribucion declarada, sin datos de benchmarks publicos y con resultados de validacion exclusivamente locales en simulacion sobre Apple Silicon. No debe confundirse con un modelo generativo ni usarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para control roboticos; backbone Pollen heredado con controlador de realimentacion N8 y capa de salida reentrenada (PPO) |
| Parametros totales | no disponible (solo se documentan 1806 parametros de la capa de salida) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija obs[1,61] |
| Tipos de cuantizacion | no disponible; el unico formato publicado es float32 |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible; la model card indica que no se declara una licencia de redistribucion general y remite a LICENSE-NOTE.txt |
| Formato de pesos | ONNX (float32), sin operadores personalizados ni tensores externos |
| Frecuencia de inferencia | 50 Hz |
| Entrada | obs[1,61] |
| Salida | actions[1,14] |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| SHA256 del modelo | a6a2825af3e7ab297b484656992e174e533b5836ae0c1ebd8d8c4c7d13f64c65 |

## Arquitectura y entrenamiento

El modelo es una politica de control entrenada con PPO sobre un backbone neuronal heredado denominado Pollen, al que se anade un controlador de realimentacion N8 propio. El entrenamiento descrito en la model card se realizo con fisica nativa en CPU y aprendizaje de la capa de salida en MPS (Apple Silicon). El checkpoint 40 modifica unicamente 1806 parametros neuronales de la capa de salida respecto al checkpoint Explore016; la topologia del grafo y el resto de pesos permanecen sin cambios. Segun el autor, los pesos tambien difieren de Explore024, Explore032 y otros paquetes del 9 de noviembre.

El paquete se entrega como un grafo ONNX en float32 con una entrada de observacion de 61 dimensiones y una salida de 14 acciones, operando a 50 Hz. No incorpora operadores personalizados, tensores externos, reloj, busqueda de semilla ni tabla de acciones en cache. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si hubo fases adicionales de ajuste mas alla del PPO sobre la capa de salida.

## Capacidades

- Control roboticos en simulacion: genera acciones de 14 dimensiones a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecucion de comandos de velocidad dentro del evento roller-sprint-2m (comandos 1.0, 1.1 y 1.2 validados).
- Uso con accesorios de tipo rollers segun la configuracion del evento.
- Inferencia determinista en CPU mediante ONNX Runtime, sin operadores personalizados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion en la arena microduck-arena: el checkpoint esta preparado para presentarse a las entradas diarias del evento roller-sprint-2m y comparar su tiempo de finalizacion con otros candidatos.
- Investigacion en aprendizaje por refuerzo: sirve para estudiar el efecto de reentrenar solo la capa de salida (1806 parametros) sobre un backbone congelado y medir la variabilidad entre checkpoints.
- Reproduccion de experimentos en Apple Silicon: el flujo CPU para fisica y MPS para PPO permite replicar el entrenamiento en hardware de consumo de Apple.
- Validacion de pipelines ONNX: al ser un grafo float32 sin operadores personalizados, es util para probar cadenas de inferencia ONNX Runtime en entornos de simulacion a 50 Hz.
- Analisis de compromiso velocidad-finalizacion: la model card explicita el tradeoff de velocidad, lo que permite estudiar como afecta el reentrenamiento de la capa de salida al tiempo de sprint.
- Pruebas de robustez en simulacion: los 64 sondeos de inferencia sintetica con salidas finitas pueden reutilizarse como test de humo para validar despliegues del grafo.

## Benchmarks y rendimiento

Los unicos datos disponibles son validaciones locales del autor en simulacion sobre Apple Silicon, no puntuaciones oficiales del servidor de la arena.

| Metrica | Resultado |
|---|---|
| Evaluador original de barrido de velocidad de la arena | 2.777 s, 5/5 finalizaciones |
| Validacion fresca del 9 de noviembre | 16/16 arranques en comandos 1.0, 1.1 y 1.2 |
| Tiempos canonicos a cinco semillas con comando fijo | 2.755 s, 2.780 s, 2.770 s, 2.775 s, 2.805 s |
| Sondas de inferencia sintetica | 64/64 con salidas finitas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el grafo es float32 y de tamano reducido (repositorio de 0.0 GB), por lo que cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor entreno con MPS en Apple Silicon y ejecuta fisica en CPU.
- Compatibilidad con GPU consumer: previsiblemente si en cualquier GPU con soporte ONNX Runtime, aunque no hay datos publicados de latencia por modelo.
- Opciones de despliegue: ONNX Runtime (formato nativo del paquete); no se documentan otros runtimes.
- Latencia y throughput: la salida esta pensada para 50 Hz, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-explore040-20261109 | no disponible (1806 en capa de salida) | no aplica (obs[1,61]) | 2.755-2.805 s en validacion local | no disponible | Hugging Face, ONNX |
| dfreq-roller-explore016 (mismo autor) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| dfreq-roller-explore024 (mismo autor) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| dfreq-roller-explore032 (mismo autor) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos publicos de rendimiento de los checkpoints hermanos ni de otras politicas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Candidato de solo puntos: el autor lo describe como candidato para el ranking, no como una mejora demostrada.
- El objetivo historico de no inferioridad en desarrollo fallo; superar las comprobaciones frescas de finalizacion no revierte ese fallo.
- Resultados locales en simulador Apple Silicon, no puntuaciones oficiales del servidor; la aceptacion, finalizacion, elegibilidad por duplicados y puntos en la arena no estan garantizados.
- Solo simulacion: no hay garantia de seguridad en robot real.
- Licencia no declarada: la model card indica que no se afirma una licencia de redistribucion general y remite a LICENSE-NOTE.txt y a la model card upstream para terminos y atribucion, por lo que el uso comercial no esta claro.
- Sin datos publicados sobre sesgos, alucinacion o limites de idioma, ya que no es un modelo de lenguaje.
- El alcance de la validacion es reducido (16 arranques y cinco semillas) y no cubre condiciones fuera de los comandos 1.0, 1.1 y 1.2.
- La model card no documenta el volumen ni la composicion de los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-explore040-20261109
- Model card upstream referenciada: upstream-base-card.md (citada en el repositorio, sin URL directa disponible)
- Nota de licencia: LICENSE-NOTE.txt (citada en el repositorio, sin URL directa disponible)
