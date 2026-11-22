# PARADOXAIlabs/pwm-dyn-v0.6-pems-bay

## Resumen

PWM-Dyn v0.6 es un modelo de prediccion de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh), integrado en su linea Paradox World Model. Se trata del modelo numero 12 de una serie de 56 publicados y esta especializado en la prediccion de los siguientes 12 pasos de trafico sobre el conjunto de datos PEMS-BAY, que cubre 325 sensores del area de la bahia de San Francisco. Con 336.740 parametros, es un modelo de dimension muy reducida, disenado para una tarea concreta y acotada.

El modelo aborda el problema del pronostico de trafico a corto plazo sobre grafos de sensores viales. Su relevancia reside en que, pese a su tamano minimo (un fichero de pesos de 1,37 MB), el autor reporta que supera a lineas base establecidas como STID, Graph WaveNet y STAEformer en varios conjuntos de datos (PEMS04, PEMS07, METR-LA y PEMS-BAY). La version v0.6 elimina la entrada de climatologia que lastraba a la version v0.4 y mejora a v0.3 en PEMS08 y PEMS04.

El modelo se distribuye como un unico checkpoint de PyTorch con pesos, configuracion y registros de resultados embebidos, bajo licencia Apache-2.0. Es un artefacto de investigacion con un proposito muy especifico: servir como referencia reproducible dentro de la serie Paradox World Model, no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal para grafos de sensores; codigo en repositorio GitHub) |
| Parametros totales | 336.740 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no especificada; salida de 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su caracter espacio-temporal y su orientacion a grafos de sensores de trafico. El codigo de la arquitectura para esta version se encuentra en el repositorio de GitHub del proyecto, y la configuracion exacta de entrenamiento esta almacenada en el propio fichero de checkpoint bajo la clave `ck['cfg']`. El modelo opera sobre la red de 325 sensores de PEMS-BAY y produce los siguientes 12 pasos temporales de trafico.

El entrenamiento se realizo el 3 de noviembre de 2026 en un cuaderno de Kaggle (version 365009705, ejecutado entre el 2 y el 3 de noviembre de 2026) y el modelo se publico el 17 de noviembre de 2026. El cambio principal de la v0.6 respecto a versiones anteriores es la eliminacion de la entrada de climatologia, que habia penalizado a la v0.4. No se especifican en la informacion disponible el numero de tokens ni la composicion exacta del dataset mas alla de PEMS-BAY; los terminos y fuentes de los datos se documentan en el fichero DATA_SOURCES.md del repositorio. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de pronostico numerico.

## Capacidades

- Pronostico de trafico a corto plazo: predice los siguientes 12 pasos temporales sobre la red de 325 sensores de PEMS-BAY.
- Modelado espacio-temporal: captura dependencias entre sensores geograficamente proximos, segun la naturaleza del conjunto de datos.
- Evaluacion reproducible: el checkpoint incluye los resultados registrados, el texto del record y los registros de ejecucion (`ck['results']`).
- Configuracion embebida: la configuracion de entrenamiento se almacena en el propio fichero (`ck['cfg']`), lo que facilita la reproduccion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio.
- No dispone de modo de razonamiento (thinking mode).

## Casos de uso

- Prediccion de congestion en redes viarias: el modelo estima los 12 pasos siguientes de velocidad o flujo en los 325 sensores de PEMS-BAY, lo que permite anticipar atascos con hasta una hora de antelacion aproximada segun la granularidad temporal del conjunto de datos.
- Investigacion academica en pronostico espacio-temporal: sirve como linea base ligera y reproducible para comparar contra STID, Graph WaveNet o STAEformer en experimentos de grafos de trafico.
- Despliegue en entornos con recursos minimos: con 336.740 parametros y un fichero de 1,37 MB, puede ejecutarse en CPU o en dispositivos embebidos sin GPU dedicada.
- Prototipado rapido de sistemas de gestion de trafico: al cargarse en pocas lineas con `torch.load` y `hf_hub_download`, permite integrar un predictor funcional en cuadernos o pipelines de analisis sin infraestructura pesada.
- Reproduccion de resultados de la serie Paradox World Model: el checkpoint incluye los registros de ejecucion y la configuracion, lo que permite verificar el resultado reportado (MAE 1.52 en ParadoxBench-1.1 Track A) y reentrenar con los mismos ajustes.
- Evaluacion comparativa de tecnicas de pronostico: util para contrastar el efecto de eliminar entradas auxiliares (como la climatologia) frente a versiones previas (v0.3, v0.4) sobre los mismos conjuntos de datos.
- Educacion y docencia: ejemplo compacto de modelo espacio-temporal aplicado a datos reales de sensores, adecuado para demostraciones en cursos de aprendizaje automatico para series temporales.

## Benchmarks y rendimiento

El autor reporta un unico resultado cuantitativo en la informacion disponible:

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 1,52 | Ensamble de 3 semillas (100-102); este fichero es la semilla 100 |

El autor afirma que la version v0.6 supera a v0.3 en PEMS08 y PEMS04, y que es la mejor en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a reejecuciones de STID, Graph WaveNet y STAEformer. Sin embargo, no se proporcionan en la informacion disponible las cifras concretas de esas comparaciones ni los resultados por conjunto de datos. No se han publicado resultados detallados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo logico dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1,37 MB y el modelo tiene 336.740 parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o integrada es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en la mayoria de CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput estimados: no disponibles. Dado el tamano minimo del modelo, se espera una latencia de milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS-BAY) | 336.740 | Prediccion de 12 pasos de trafico en PEMS-BAY | MAE 1,52 (ParadoxBench-1.1 Track A) | Apache-2.0 | Hugging Face |
| STID | no disponible | Pronostico espacio-temporal de trafico | Superado por v0.6 segun el autor (sin cifras) | no disponible | no disponible |
| Graph WaveNet | no disponible | Pronostico espacio-temporal de trafico | Superado por v0.6 segun el autor (sin cifras) | no disponible | no disponible |
| STAEformer | no disponible | Pronostico espacio-temporal de trafico | Superado por v0.6 segun el autor (sin cifras) | no disponible | no disponible |

No se dispone de los datos de parametros, contexto ni licencia de los modelos comparables en la informacion proporcionada; las cifras de rendimiento relativas proceden unicamente de la afirmacion del autor y no se han verificado de forma independiente.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en PEMS-BAY; no es generalizable a otras redes de sensores sin reentrenamiento.
- Solo predice 12 pasos temporales; no admite ventanas de contexto o horizontes configurables segun la informacion disponible.
- No es un modelo de lenguaje: carece de capacidades de generacion de texto, codigo, razonamiento o conversacion.
- El unico resultado reportado (MAE 1,52) corresponde a un ensamble de 3 semillas, pero este fichero contiene solo la semilla 100; el rendimiento individual puede diferir del ensamblado.
- No se han publicado cifras detalladas de los benchmarks comparativos; las afirmaciones de superioridad frente a STID, Graph WaveNet y STAEformer no son verificables con los datos disponibles.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de predicciones inexactas fuera de la distribucion de entrenamiento o ante eventos anomalos de trafico.
- Sesgos conocidos: no disponibles; al entrenarse solo con datos de la bahia de San Francisco, el modelo puede no reflejar patrones de trafico de otras regiones.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion; no obstante, los datos de entrenamiento no se incluyen y sus terminos se documentan aparte en DATA_SOURCES.md, por lo que su reutilizacion esta sujeta a dichas fuentes.
- El repositorio tiene 0 descargas y 0 likes; se trata de un artefacto reciente y sin validacion independiente por parte de la comunidad.
- El codigo de la arquitectura no esta incluido en el repositorio de Hugging Face; debe obtenerse del repositorio de GitHub, lo que anade una dependencia externa para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems-bay
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Resultados completos (RESULTS.md): https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion de la version (v0.6-conference/README.md): https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y terminos de los datos (DATA_SOURCES.md): https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion (CITATION.cff): https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#11, METR-LA): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-metr-la
- Modelo siguiente (#13, PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems08
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web de ParadoxAI Lab: https://paradoxailab.com
