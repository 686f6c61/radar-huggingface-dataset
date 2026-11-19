# paradoxailab/pwm-dyn-v0.7-pems07

## Resumen

PWM-Dyn v0.7 (identificador `pwm-dyn-v0.7-pems07`) es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, es el modelo numero 16 de 56 publicados y pertenece a la familia PWM-Dyn, orientada a forecasting espacio-temporal. Su tarea especifica es predecir los siguientes 12 pasos temporales de trafico viario a partir de datos de sensores, incluyendo escenarios en los que se producen caidas (outages) de sensores.

El modelo es extremadamente compacto: 408.356 parametros en total, empaquetado en un unico fichero PyTorch de aproximadamente 1,6 MB. Se entrena sobre el conjunto PEMS07 (Caltrans PeMS District 7, Los Angeles; 883 sensores) y se evalua con el benchmark propio ParadoxBench-1.2, reportando un MAE de 19,78 en condiciones limpias y 25,01 en condiciones de caidas reales de sensores (Track G, ensemble de 3 semillas; el fichero publicado corresponde a la semilla 200).

Su relevancia radica en el enfoque: demuestra que un modelo de menos de medio millon de parametros puede abordar forecasting espacio-temporal con robustez ante fallos de sensores, una situacion habitual en despliegues reales de infraestructura de trafico. La version v0.7 introduce entrenamiento con caidas y un mecanismo de fallback que reduce el error en escenarios de outage entre un 11% y un 22% respecto a v0.6 en cinco redes, con un coste de solo 0,4-1,8% en condiciones limpias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el codigo esta en el repositorio GitHub del proyecto; no se detalla en la model card) |
| Parametros totales | 408.356 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 12 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de su encuadre como modelo de world model dinamico para datos espacio-temporales. El codigo de arquitectura de esta version se encuentra en el repositorio de GitHub del proyecto y la configuracion exacta de entrenamiento esta embebida en el propio fichero de pesos bajo la clave `ck['cfg']`. El modelo se entreno el 4 de noviembre de 2026 en un notebook de Kaggle (version 365414722, commit b0f6a08) y se publico el 17 de noviembre de 2026.

Los datos de entrenamiento provienen de PEMS07 (Caltrans PeMS District 7, Los Angeles), con 883 sensores de trafico. La innovacion principal de la version v0.7 es la incorporacion de entrenamiento con caidas de sensores ("fallback base + outage training"), que mejora la robustez frente a fallos reales de sensores. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (poco probables en un modelo de forecasting de este tamano).

## Capacidades

- Prediccion de los siguientes 12 pasos temporales de trafico viario a partir de datos de sensores.
- Forecasting espacio-temporal sobre redes de sensores (evaluado en PEMS07 con 883 sensores).
- Robustez ante caidas de sensores: entrenamiento especifico con outages y mecanismo de fallback.
- Evaluacion mediante ParadoxBench-1.2 en dos tracks: condiciones limpias (MAE 19,78) y caidas reales Track G (MAE 25,01).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingues, de vision ni de audio.
- Capacidad especial: el fichero de pesos incluye metadatos, resultados registrados y logs de la ejecucion en las claves `meta`, `results` y `cfg`.

## Casos de uso

- Prediccion de trafico en tiempo real: el modelo genera los proximos 12 pasos temporales a partir del estado actual de los sensores, adecuado para paneles de control de trafico urbano con horizonte corto.
- Gestion de incidencias por caida de sensores: gracias al entrenamiento con outages y al fallback, puede seguir produciendo predicciones utiles cuando parte de los 883 sensores de PEMS07 dejan de reportar, escenario comun en infraestructura real.
- Planificacion de capacidad viaria: las predicciones a 12 pasos permiten estimar congestiones inminentes y activar protocolos de gestion de trafico.
- Integracion en pipelines de investigacion: su tamano (1,6 MB) y licencia Apache-2.0 facilitan su uso como baseline reproducible en experimentos de forecasting espacio-temporal.
- Despliegue en entornos con recursos limitados: con 408.356 parametros, puede ejecutarse en CPU o en dispositivos de borde sin GPU dedicada, algo relevante para cabinas de control o nodos remotos.
- Evaluacion comparativa con ParadoxBench-1.2: sirve como referencia para comparar metodos de forecasting robusto ante fallos de sensores dentro del ecosistema Paradox World Model.
- Prototipado rapido de sistemas de alerta temprana: la inferencia sobre 12 pasos permite generar avisos de congestion con antelacion suficiente para rerutado de trafico.

## Benchmarks y rendimiento

Resultados reportados por el autor en ParadoxBench-1.2 (ensemble de 3 semillas; el fichero publicado es la semilla 200):

| Metrica | Resultado |
|---|---|
| ParadoxBench-1.2 test MAE (clean) | 19,78 |
| ParadoxBench-1.2 test MAE (real outages, Track G) | 25,01 |

Mejora respecto a v0.6 segun el autor: reduccion del error en outages reales del 11-22% en cinco redes, con un incremento del 0,4-1,8% en condiciones limpias. No se han publicado en la informacion disponible resultados comparativos con otros modelos externos (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 1.666.241 bytes (aproximadamente 1,6 MB) y el modelo tiene 408.356 parametros.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo cabe holgadamente en CPU. Una RTX 4090, A100 o H100 no aportarian ventaja significativa frente a CPU para este tamano.
- Cabe en cualquier GPU consumer (incluso en iGPU y en dispositivos de borde).
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` con `weights_only=False`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos externos en la informacion proporcionada. La unica comparacion documentada es interna a la serie:

| Modelo | Parametros | Tarea | MAE clean | MAE outages (Track G) | Licencia |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS07) | 408.356 | Trafico, 12 pasos | 19,78 | 25,01 | Apache-2.0 |
| PWM-Dyn v0.6 | no disponible | Trafico, 12 pasos | no disponible | 11-22% peor que v0.7 | Apache-2.0 |

No se identifican en la informacion disponible modelos de terceros comparables (mismo tamano o misma tarea) con datos publicados.

## Limitaciones y advertencias

- Modelo especifico para trafico viario sobre PEMS07; no es un modelo de proposito general ni un LLM.
- El horizonte de prediccion esta fijado en 12 pasos temporales; no se documenta soporte para horizontes mayores.
- Los resultados reportados (MAE 19,78 y 25,01) son autoinformados por el autor y no se han verificado de forma independiente en la informacion disponible.
- El rendimiento en outages se ha evaluado sobre cinco redes; no se garantiza su generalizacion a otras ciudades o tipos de sensores.
- Riesgo de sesgo geografico: entrenado exclusivamente con datos de Los Angeles (Caltrans District 7), por lo que su comportamiento en otras regiones es incierto.
- Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos estan en DATA_SOURCES.md del proyecto.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en produccion.
- El fichero de pesos requiere `torch.load(..., weights_only=False)`, lo que implica cargar codigo serializado; conviene auditar el fichero antes de usarlo en entornos de produccion.
- No se documentan sesgos especificos, pero al tratarse de datos de trafico de una region concreta pueden heredarse patrones locales de movilidad.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems07
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de v0.7: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#15): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems03
- Modelo siguiente (#17): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-metr-la
- Todos los modelos de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
