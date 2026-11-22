# JiaqiYin/FoveaWAM

## Resumen

FoveaWAM es un modelo world-action para manipulacion robotica de objetos que siguen moviendose mientras la politica calcula. Lo desarrolla JiaqiYin y se publica como checkpoint de simulacion asociado a los resultados principales del paper en el benchmark OnTimeBench. A diferencia de los modelos world que predicen video futuro completo, FoveaWAM asigna a cada parte de la escena la precision que su rol requiere: el objetivo se predice como trayectoria SE(3), el entorno como flujo 3D disperso y la escena estatica no se predice en absoluto.

La arquitectura combina un encoder de imagen MAE ViT-B/16 congelado con un transformer compartido entre un stream de mundo y un stream de accion, sumando 272M parametros entrenables. La politica lee un frame RGB-D calibrado de 224 x 224 y los ultimos 350 ms de poses del objetivo y del efector final, muestreados a 20 Hz, y devuelve ocho comandos consecutivos de 50 ms cada uno. En inferencia, las cabezas de prediccion del stream de mundo se omiten y el stream de accion reutiliza sus features cacheadas durante cinco pasos de flow-matching.

El modelo es relevante porque aborda explicitamente el desfase temporal entre percepcion y actuacion en manipulacion dinamica: con la escena avanzando durante la inferencia (protocolo Native), alcanza un 82,1% de exito en 1.400 escenas de test retenidas, 20,8 puntos por encima del mejor baseline, con una latencia p95 de 15,1 ms en una RTX 5090. El checkpoint esta pensado para investigacion y evaluacion en simulacion, no para despliegue directo en hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido entre stream de mundo y stream de accion, con encoder de imagen MAE ViT-B/16 congelado |
| Parametros totales | 272M entrenables sobre el encoder MAE congelado (no se detalla el total incluyendo el encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal de 350 ms de poses a 20 Hz; un frame RGB-D de 224 x 224 por query) |
| Tipos de cuantizacion | no disponible (pesos en FP32; entrenamiento en BF16 y inferencia de benchmark en BF16) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas descritas) |
| Licencia | foveawam-model-weight-terms (uso no comercial en investigacion y evaluacion); encoder MAE incluido bajo CC BY-NC 4.0 |
| Formato de pesos | `.pt` (PyTorch, bundle de 1,43 GB con politica, encoder congelado y estadisticas de normalizacion) |

## Arquitectura y entrenamiento

FoveaWAM es un world-action model con dos streams que comparten un unico transformer. El stream de mundo aprende a predecir la trayectoria SE(3) del objetivo y el flujo 3D disperso del entorno, mientras que el stream de accion genera los comandos motores. En inferencia, las cabezas de prediccion del stream de mundo se saltan: el stream de mundo se ejecuta una vez por query y el stream de accion reutiliza sus features cacheadas a lo largo de cinco pasos de flow-matching. Esta asimetria entre entrenamiento e inferencia es la que permite mantener baja la latencia (15,1 ms p95 en una RTX 5090 a batch size 1).

El modelo se entrena desde cero (salvo el encoder MAE congelado) sobre las 11.200 demostraciones de entrenamiento de OnTimeBench durante 10 epocas con semilla 0, usando precision mixta BF16. Los pesos publicados corresponden a la ultima actualizacion de esa ejecucion, en el step 25.870. La configuracion de reentrenamiento publica es `foveawam_train10` en el repositorio de FoveaWAM y lee unicamente el split de entrenamiento publicado. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion del dataset mas alla del benchmark citado.

## Capacidades

- Manipulacion robotica dinamica: genera comandos de incremento de traslacion y rotacion del efector final mas valor de gripper, ocho comandos por query para ticks consecutivos de 50 ms.
- Prediccion de trayectoria SE(3) del objetivo y flujo 3D disperso del entorno durante entrenamiento (cabezas omitidas en inferencia).
- Procesamiento multimodal de entrada: un frame RGB-D calibrado de 224 x 224 junto con historico de poses del objetivo y del efector final (350 ms a 20 Hz en el marco base del robot).
- Inferencia de baja latencia: 15,1 ms p95 en una RTX 5090 a batch size 1, con ejecucion del stream de mundo una vez por query y cinco pasos de flow-matching en el stream de accion.
- Replanificacion durante el movimiento: bajo el protocolo Native, el robot sigue ejecutando el chunk anterior mientras la politica calcula y descarta comandos cuyo tick ya ha pasado.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues: es un modelo especializado de robotica.

## Casos de uso

- Manipulacion de objetos en movimiento en simulacion: evaluar politicas sobre OnTimeBench con el protocolo Native, donde la escena avanza durante la inferencia, para medir robustez frente al desfase temporal realista.
- Investigacion en world-action models: usar el checkpoint como referencia para comparar arquitecturas que predicen video futuro completo frente a las que asignan precision por rol (trayectoria SE(3), flujo disperso, escena estatica ignorada).
- Benchmarking de latencia en robotica: reproducir la tabla de resultados Native, +150 ms y Paused con `paper_results/main_table.py` del repositorio OnTimeBench para estudiar el impacto de la latencia en el exito.
- Reentrenamiento sobre datos publicos: partir de la configuracion `foveawam_train10` para adaptar la politica a nuevos splits de OnTimeBench o a variaciones del benchmark.
- Estudio de eficiencia computacional: analizar el ahorro que supone omitir las cabezas de prediccion del stream de mundo en inferencia y reutilizar features cacheadas en cinco pasos de flow-matching.
- Base para adaptacion a hardware real: servir como punto de partida conceptual para un setup que incluya un pose tracker y reentrenamiento para camara y robot propios, ya que los pesos publicados no estan pensados para ejecucion directa en hardware.
- Evaluacion de estrategias de descarte de comandos obsoletos: estudiar como afecta saltar ticks ya pasados cuando llega un nuevo chunk bajo condiciones de latencia variable.

## Benchmarks y rendimiento

Resultados en OnTimeBench con checkpoint y 1.400 escenas de test fijas (100 por tarea), variando solo el tratamiento del tiempo de inferencia:

| Protocolo | Simulacion durante una query | Escenas exitosas | Tasa de exito |
|---|---|---:|---:|
| Native | avanza con la latencia de la politica | 1.150 / 1.400 | 82,1% |
| +150 ms | avanza con la latencia mas 150 ms | 478 / 1.400 | 34,1% |
| Paused | espera a la politica | 1.264 / 1.400 | 90,3% |

Bajo Native, el robot sigue ejecutando el chunk anterior mientras la politica calcula; al llegar el nuevo chunk se descartan los comandos cuyo tick ya ha pasado. Las latencias se muestrean de mediciones en una RTX 5090 a batch size 1 y excluyen el seguimiento de pose, ya que el simulador proporciona la pose del objetivo. Paused tambien permite replanificar en cada tick, por lo que es una referencia y no una cota superior. El modelo supera al mejor baseline en 20,8 puntos bajo Native. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el bundle pesa 1,43 GB en FP32, y la inferencia de benchmark se ejecuta en BF16.
- GPU recomendadas: NVIDIA Ampere o posterior con soporte BF16; las mediciones de latencia se realizaron en una RTX 5090.
- Cabe en GPU consumer: si, segun el tamano del checkpoint (1,43 GB) y el requisito de BF16; la RTX 5090 es el hardware de referencia citado.
- Opciones de despliegue: codigo propio de FoveaWAM y OnTimeBench con PyTorch con CUDA, MuJoCo con `MUJOCO_GL=egl` para la evaluacion en simulacion; descarga via `huggingface_hub>=0.34`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 15,1 ms p95 por query en una RTX 5090 a batch size 1; no se publica throughput agregado.
- Entorno: Linux, Python 3.12 y PyTorch con CUDA.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros modelos concretos. El unico dato comparativo es que FoveaWAM supera al "mejor baseline" de OnTimeBench en 20,8 puntos bajo el protocolo Native, pero el baseline no se identifica por nombre en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoveaWAM | 272M entrenables + encoder MAE congelado | ventana de 350 ms de poses y un frame RGB-D por query | 82,1% Native; 90,3% Paused en OnTimeBench | no comercial (foveawam-model-weight-terms) | checkpoint `.pt` en Hugging Face |
| Baseline de OnTimeBench (no identificado) | no disponible | no disponible | 61,3% implicito bajo Native (20,8 puntos por debajo) | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos se entrenaron y evaluaron exclusivamente en simulacion OnTimeBench, con una camara fija en tercera persona y la pose del objetivo leida del simulador.
- No es una politica de manipulacion general y no funciona en hardware real tal cual: un setup real requiere un pose tracker y reentrenamiento para su propia camara y robot.
- Los resultados en robot real del paper provienen de un modelo entrenado por separado, no de este checkpoint.
- Bajo el protocolo +150 ms la tasa de exito cae al 34,1%, lo que evidencia una fuerte sensibilidad a la latencia y al desfase temporal.
- Licencia no comercial: los pesos se liberan solo para investigacion y evaluacion; el encoder MAE incluido mantiene CC BY-NC 4.0, lo que restringe el uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas porque el modelo no procesa lenguaje; no disponible.
- No se detallan tasas de fallo por tarea ni analisis de errores en la informacion disponible.
- El paper, el codigo y la cita figuran como `TODO` en la model card, por lo que las referencias formales no estan publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/JiaqiYin/FoveaWAM
- Dataset OnTimeBench: https://huggingface.co/datasets/JiaqiYin/OnTimeBench
- Licencia de pesos: https://huggingface.co/JiaqiYin/FoveaWAM/blob/main/MODEL_LICENSE.md
- Licencia MAE: https://huggingface.co/JiaqiYin/FoveaWAM/blob/main/MAE-LICENSE.txt
- Avisos de terceros: https://huggingface.co/JiaqiYin/FoveaWAM/blob/main/THIRD_PARTY_NOTICES.md
- Paper: TODO (no disponible)
- Codigo: TODO (no disponible)
- Codigo de OnTimeBench: TODO (no disponible)
