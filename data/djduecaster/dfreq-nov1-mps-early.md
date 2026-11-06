# djduecaster/dfreq-nov1-mps-early

## Resumen

`dfreq-nov1-mps-early` es un checkpoint de politica neuronal entrenada por el usuario djduecaster para la tarea `roller-sprint-2m`, una tarea de control de accesorios tipo roller (rodillo) en un entorno de simulacion fisica. El modelo recibe 61 entradas de tipo float32 y emite 14 acciones float32 expresadas como desplazamientos en radianes, a una frecuencia de control de 50 Hz. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una politica de control entrenada especificamente para una tarea de simulacion, empaquetada en formato ONNX.

El entrenamiento combina rollouts nativos en CPU sobre MuJoCo/BAM con un bucle de PPO recortado (clipped PPO) ejecutado en MPS (Metal Performance Shaders, es decir, aceleracion en GPU de Apple). Solo se entrenaron 1806 parametros de la capa de salida neuronal; el resto de pesos previos y las constantes de realimentacion heredadas permanecieron congelados. El autor indica explicitamente que no se ha realizado publicacion formal y que el repositorio es un candidato privado.

La relevancia de este modelo es muy acotada: se trata de un artefacto de investigacion reproducible dentro de una linea de trabajo concreta (linaje de politicas heredadas documentado en `upstream-base-card.md`), no de un modelo destinado a uso general. El autor advierte que no debe reclamarse superioridad sobre la linea base cuando el intervalo de confianza pareado cruza cero, y que el especialista publicado de 2.570 s sigue siendo mas rapido en sus arranques prescritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal (perceptron multicapa segun la descripcion de capa de salida; arquitectura completa no disponible) |
| Parametros totales | No disponible (solo se indica que 1806 parametros de la capa de salida fueron entrenados; el resto congelados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (politica de control, sin contexto textual) |
| Tipos de cuantizacion | No disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Entradas | 61 valores float32 |
| Salidas | 14 acciones float32 (desplazamientos en radianes) |
| Frecuencia de control | 50 Hz |
| Entorno de simulacion | MuJoCo / BAM (rollouts nativos en CPU) |
| Algoritmo de entrenamiento | PPO recortado sobre MPS |
| SHA256 | `efae4a9b3516b2d0ebf9958f2678e7d47357612784d9bfa3fb001ff16c66ac7d` |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La informacion disponible describe una politica neuronal que mapea un vector de 61 entradas float32 a 14 acciones float32 en radianes, evaluada a 50 Hz. El autor menciona explicitamente una "capa de salida neuronal" con 1806 parametros entrenados, lo que sugiere una red de tipo MLP con una capa final de ese tamano; sin embargo, la arquitectura completa (numero de capas, anchos, funciones de activacion) no se detalla en la model card. Todas las capas anteriores y las constantes de realimentacion heredadas quedaron congeladas durante el ajuste.

El entrenamiento se realizo en dos fases complementarias: rollouts nativos en CPU sobre MuJoCo/BAM (motor fisico y entorno de la tarea `roller-sprint-2m`) y un bucle de PPO recortado ejecutado en MPS. El autor subraya que no se introducen nuevas semillas, tiempos, posiciones, huellas ni busquedas por semilla en las politicas resultantes, y que la realimentacion de accion previa es la salida previa real. El contrato de entrada/salida, la fisica nativa y los limites de actuadores se mantienen sin cambios respecto al linaje heredado. La seleccion y el entrenamiento se congelaron antes de la evaluacion fresca con 128 semillas, y la evidencia completa se encuentra en `EVALUATION.json`.

## Capacidades

- Control de politica para la tarea `roller-sprint-2m`: genera 14 acciones float32 en radianes a partir de 61 entradas float32 a 50 Hz.
- Ejecucion determinista bajo el contrato de entrada/salida original, sin cambios en fisica ni en limites de actuadores.
- Realimentacion de accion previa basada en la salida previa real, sin tablas de busqueda ni huellas por semilla.
- Entrenamiento y evaluacion reproducibles: hash SHA256 publicado y evidencia en `EVALUATION.json`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Evaluacion de politicas de control en simulacion: el checkpoint puede cargarse en el evaluador nativo sin cambios para reproducir el barrido oficial (2.716 s, 5/5 finalizaciones a comando 1.1) y comparar contra la linea base general.
- Investigacion en ajuste fino de bajo parametro: sirve como ejemplo reproducible de ajuste de solo 1806 parametros de capa de salida con PPO recortado sobre MPS, manteniendo congelado el resto de la red.
- Pruebas de robustez por semillas: el autor reporta un holdout pareado fresco de 128/128 finalizaciones y dos conjuntos de comandos de estres (1.0 y 1.2) con 32 semillas cada uno, completamente finalizados; util para validar estabilidad del control.
- Despliegue en inferencia ONNX: al estar en formato ONNX, puede integrarse en pipelines de inferencia nativos (por ejemplo, ONNX Runtime) para control en bucle cerrado a 50 Hz.
- Comparacion de intervalos de confianza pareados: el modelo incluye un intervalo de ganancia pareada al 95% de [-0.001757812499999963, 0.0053906250000000065], util como caso de estudio metodologico sobre cuando no reclamar superioridad.
- Linaje y trazabilidad de pesos: el repositorio documenta el linaje en `upstream-base-card.md`, lo que permite auditar que el trabajo nuevo de calibracion/PPO no relicencia los pesos heredados.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Barrido oficial (evaluador nativo sin cambios) | 2.716 s |
| Finalizaciones en barrido oficial (comando 1.1) | 5/5 |
| Holdout pareado fresco | 128/128 finalizaciones |
| Tiempo medio en holdout pareado | 2.715273 s |
| Linea base general (media pareada) | 2.717148 s |
| Ganancia pareada, intervalo de confianza al 95% | [-0.001757812499999963, 0.0053906250000000065] |
| Estres con 32 semillas, comando 1.0 | Finalizacion completa |
| Estres con 32 semillas, comando 1.2 | Finalizacion completa |
| Especialista publicado de referencia | 2.570 s (mas rapido en sus arranques prescritos) |

El autor advierte explicitamente que no debe reclamarse superioridad cuando el intervalo de confianza pareado cruza cero, y que estos candidatos son de entrenamiento general para ejecuciones diarias, no una mejora del marcador de la clasificacion ni de puntos otorgados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de muy pequeno tamano (1806 parametros entrenados en la capa de salida, repositorio de 0.0 GB), por lo que la huella de memoria es minima.
- GPU recomendadas: no se especifican. El entrenamiento se realizo en MPS (GPU de Apple); la inferencia en ONNX puede ejecutarse en CPU o en cualquier acelerador compatible con ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque no hay datos oficiales de latencia ni de compatibilidad verificada.
- Opciones de despliegue: ONNX Runtime u otro runtime compatible con ONNX; el autor no documenta vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. La frecuencia de control de la tarea es de 50 Hz, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dfreq-nov1-mps-early` (este) | 1806 parametros entrenados en capa de salida; total no disponible | No aplica | 2.716 s barrido oficial; 2.715273 s media en holdout pareado | No disponible | ONNX en Hugging Face |
| Especialista publicado de referencia (mismo linaje) | No disponible | No aplica | 2.570 s en arranques prescritos | No disponible | Publicado (segun el autor) |
| Linea base general (mismo linaje) | No disponible | No aplica | 2.717148 s media pareada | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables fuera de este linaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni procesa vision o audio.
- El intervalo de confianza pareado de la ganancia cruza cero ([-0.001757812499999963, 0.0053906250000000065]); el autor prohibe reclamar superioridad con estos datos.
- El especialista publicado de 2.570 s sigue siendo mas rapido en sus arranques prescritos; el autor recomienda retener el mejor tiempo actual y no cambiar la ultima entrada de Tugcup.
- Candidato privado sin publicacion formal: el autor indica "No publication performed".
- Licencia no disponible; el trabajo nuevo de calibracion/PPO no relicencia los pesos heredados, cuyos terminos estan en `upstream-base-card.md`.
- El repositorio figura con 0.0 GB y 0 descargas/0 likes en Hugging Face; la disponibilidad efectiva de los pesos no esta confirmada por la metadata.
- Sin datos de sesgos, alucinacion o limitaciones de idioma aplicables (no es un modelo de lenguaje); la limitacion real es de dominio: solo valido para la tarea `roller-sprint-2m` bajo el contrato de entrada/salida original.
- El checkpoint fue congelado antes de la evaluacion fresca con 128 semillas; cualquier reentrenamiento posterior invalidaria las cifras reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/djduecaster/dfreq-nov1-mps-early
- Evidencia de evaluacion: `EVALUATION.json` (referenciado en la model card, no enlazado)
- Linaje y terminos heredados: `upstream-base-card.md` (referenciado en la model card, no enlazado)
