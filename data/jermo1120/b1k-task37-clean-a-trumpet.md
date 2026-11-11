# jermo1120/b1k-task37-clean-a-trumpet

## Resumen

`jermo1120/b1k-task37-clean-a-trumpet` es un ajuste fino (fine-tuning) del checkpoint ganador de la edicion 2025 del reto BEHAVIOR-1K, especializado en una unica tarea de manipulacion robotica: la tarea 37, `clean_a_trumpet`, que consiste en coger un cepillo de la mesa de un dormitorio y limpiar una corneta hasta que deje de tener polvo. Lo publica el usuario `jermo1120` partiendo de `IliaLarchenko/behavior_submission` (checkpoint_3), solucion que obtuvo el primer puesto en la competicion.

El modelo es un VLA (vision-language-action) basado en Pi0.5, con 3.4B parametros, y se distribuye en formato Orbax (JAX) para su uso con el repositorio de los ganadores y la configuracion `pi_behavior_b1k_fast`. No es un modelo de lenguaje generativo: su salida son acciones motoras y subtareas para un robot humanoide simulado en el entorno BEHAVIOR-1K.

Su relevancia es doble: por un lado, documenta con transparencia un caso de ajuste fino fallido (0/10 exitos en la evaluacion publica), lo que lo convierte en un material valioso para estudiar sobreajuste y tasas de aprendizaje en VLA; por otro, sirve como referencia reproducible de todo el pipeline de entrenamiento y evaluacion sobre una arquitectura de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Pi0.5 (transformer vision-language-action con backbone de vision congelado y cabeza de flujo) |
| Parametros totales | 3.4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en Orbax; no se distribuyen GGUF ni safetensors) |
| Idiomas soportados | no disponible (modelo de accion robotica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax (carpeta `params/`, ~12.6 GB por checkpoint) + `assets/` con norm stats y tokenizer FAST |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `pi_behavior_b1k_fast` de la solucion ganadora: un VLA Pi0.5 con backbone de vision congelado, perdida auxiliar FAST, ruido correlacionado y 15 muestras de flujo. Se inicializa desde `checkpoint_3` de `IliaLarchenko/behavior_submission`, que fue entrenado sobre 13 tareas (4, 27, 31-33, 35-39, 41, 46, 49), incluidas las embeddings de tarea. El ajuste fino usa exclusivamente datos de la tarea 37: 200 episodios y aproximadamente 1.06M fotogramas de `IliaLarchenko/behavior_224_rgb` (RGB 224x224, 3 camaras).

El entrenamiento consistio en 10.000 pasos con batch de 16 (aproximadamente el 15% de una epoca), LR cosenoidal con warmup de 200 pasos hasta un pico de 5e-6 y decaimiento a 5e-7, sobre una unica A100-SXM4 de 80 GB a 3,3 s/paso (9 h 08 min en total). Las norm stats y el tokenizer se reutilizan de `checkpoint_3` sin recalcular. El autor documenta desviaciones del pipeline original: re-codificacion de los videos HEVC de la tarea 37 a H.264 (CRF 18, `-g 4`) para acelerar la decodificacion de fotogramas aleatorios, reduccion del backoff de seek del decodificador de 5 s a 0,5 s, y un filtro `tasks` en `DataConfig`, ademas de un parche para orbax 0.11.13. Un primer intento con LR pico de 2.5e-5 divergio (la perdida de accion subio de ~0,10 a ~0,19) y solo se conserva su `step_01000` como referencia.

## Capacidades

- Generacion de acciones motoras de bajo nivel para un robot humanoide simulado en BEHAVIOR-1K (control tipo end-effector y articulaciones, segun la interfaz del entorno).
- Prediccion de subtareas: el modelo reporta una precision de subtarea de 0,998 en el ultimo paso registrado.
- Tokenizacion FAST de acciones como perdida auxiliar (precision de token FAST de 0,841 al final del entrenamiento).
- Percepcion visual multi-camara: consume tres vistas RGB de 224x224.
- Ejecucion de una unica tarea especializada (`clean_a_trumpet`); no generaliza a otras tareas del benchmark.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingues ni modo de pensamiento.

## Casos de uso

- Estudio de ajuste fino sobre VLA preentrenados: el repositorio incluye curvas de perdida, checkpoints intermedios cada 1k pasos y un run abandonado, lo que permite analizar el efecto de la tasa de aprendizaje y el sobreajuste en un modelo ya adaptado a la tarea.
- Reproduccion de resultados de la competicion BEHAVIOR-1K: sirve como plantilla para descargar checkpoints, lanzar `serve_b1k.py` y evaluar con `task.name=clean_a_trumpet` en el evaluador oficial.
- Desarrollo de pipelines de datos para robotica: los parches `changes.patch` y `behavior1k_decode.patch` documentan como acelerar la decodificacion de video y filtrar tareas en `DataConfig`, reutilizables en otros fine-tunings.
- Baseline negativo en investigacion: al obtener 0/10 exitos con q_score 0.000 en las instancias 301-310, es util como referencia de un ajuste insuficiente frente al checkpoint original.
- Analisis de infraestructura: el registro de memoria (batch 32 agota una A100 de 80 GB) y de tiempos (3,3 s/paso) permite dimensionar experimentos similares.
- Docencia y divulgacion: muestra de forma completa el ciclo de vida de un modelo VLA, desde la seleccion de datos hasta la evaluacion formal y el diagnostico de fallos.

## Benchmarks y rendimiento

| Metrica | Inicio (pasos 0-450, media) | Final (ultimos 1k pasos, media) |
|---|---|---|
| action_loss | 0.102 | 0.075 |

| Metrica (paso 9950) | Valor |
|---|---|
| Total loss | 0.099 |
| Precision de subtarea | 0.998 |
| Precision de token FAST | 0.841 |
| Norma del gradiente | 1.6 |

| Evaluacion oficial | Resultado |
|---|---|
| Exitos en `public_test` (instancias 301-310) | 0 / 10 |
| q_score medio | 0.000 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Las metricas de entrenamiento corresponden a lotes unicos de 16 sin conjunto de validacion reservado.

## Requisitos de hardware

- Entrenamiento: 1x A100-SXM4 de 80 GB; batch 32 provoca OOM en esa misma GPU.
- Inferencia: no se especifica VRAM minima en la informacion disponible; el checkpoint pesa ~12.6 GB en Orbax y requiere el stack JAX del repositorio de los ganadores.
- GPU recomendadas: A100 u H100 para servir con el pipeline oficial; no se documenta soporte en GPU de consumo.
- Cabe en GPU de consumo: no disponible (no se distribuyen pesos GGUF ni cuantizados; el pipeline es JAX/Orbax).
- Despliegue: `scripts/serve_b1k.py` del repositorio `behavior-1k-solution` con la configuracion `pi_behavior_b1k_fast`, y evaluacion con el entorno BEHAVIOR-1K (commit `684a83050`).
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se registran 3,3 s/paso con batch 16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jermo1120/b1k-task37-clean-a-trumpet` | 3.4B | no disponible | `clean_a_trumpet` (BEHAVIOR-1K) | Apache 2.0 | Hugging Face, formato Orbax |
| `IliaLarchenko/behavior_submission` (checkpoint_3) | 3.4B (misma base) | no disponible | 13 tareas de BEHAVIOR-1K | no disponible en la informacion | Hugging Face |
| `jermo1120/b1k-task37-clean-a-trumpet-25k` | 3.4B (misma base) | no disponible | `clean_a_trumpet`, run de 25k pasos | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento nulo en la evaluacion oficial: 0/10 exitos y q_score 0.000 en las instancias 301-310 del conjunto publico; no debe usarse como politica funcional para la tarea.
- Las metricas reportadas son de entrenamiento sobre lotes unicos, sin validacion reservada; no son indicativas de generalizacion.
- Especializacion extrema: solo ejecuta la tarea 37 y no conserva capacidades de las otras 12 tareas del checkpoint original.
- El primer intento de entrenamiento divergio con LR 2.5e-5; el checkpoint `step_01000/` de la raiz del repo es solo de referencia y no debe usarse.
- Los videos de entrenamiento fueron re-codificados con perdida (H.264 CRF 18), lo que introduce diferencias respecto al pipeline original y condiciona comparaciones directas.
- Las norm stats y el tokenizer se heredan de `checkpoint_3` sin recalcular, lo que puede introducir desajustes respecto a la distribucion de la tarea 37.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de la base Pi0.5/openpi y del entorno BEHAVIOR-1K, cuyas condiciones deben verificarse por separado.
- Riesgo de alucinacion en el sentido de acciones incoherentes o subtareas erroneas; el fallo sistematico observado sugiere un colapso hacia politicas no efectivas.
- No se documentan sesgos, cobertura idiomatica ni limites de contexto por tratarse de un modelo de accion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jermo1120/b1k-task37-clean-a-trumpet
- Resultados y diagnosticos de la evaluacion: https://huggingface.co/datasets/jermo1120/b1k-task37-clean-a-trumpet-eval
- Run de 25k pasos: https://huggingface.co/jermo1120/b1k-task37-clean-a-trumpet-25k
- Modelo base: https://huggingface.co/IliaLarchenko/behavior_submission
- Dataset de imagenes: https://huggingface.co/datasets/IliaLarchenko/behavior_224_rgb
- Dataset de demos del reto: https://huggingface.co/datasets/behavior-1k/2025-challenge-demos
- Repositorio de la solucion ganadora: https://github.com/IliaLarchenko/behavior-1k-solution
- Paper: https://arxiv.org/abs/2512.06951
- Benchmark BEHAVIOR-1K: https://behavior.stanford.edu/
