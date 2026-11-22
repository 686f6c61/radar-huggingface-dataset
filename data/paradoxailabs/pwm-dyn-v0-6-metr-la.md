# PARADOXAIlabs/pwm-dyn-v0.6-metr-la

## Resumen

PWM-Dyn v0.6 (variante METR-LA) es un modelo de predicción de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Se trata de un modelo de muy pequeño tamano (321.636 parametros) especializado en el pronostico de los siguientes 12 pasos de trafico sobre la red de detectores de bucle de las autopistas de Los Angeles (METR-LA, 207 sensores). Forma parte del modelo numero 11 de una serie de 56 publicados.

El modelo resuelve una tarea acotada de forecasting multi-horizonte sobre grafos de sensores, y su relevancia radica en que, segun la model card, supera en MAE a reciones de referencia como STID, Graph WaveNet y STAEformer en METR-LA, PEMS04, PEMS07 y PEMS-BAY. El cambio principal respecto a versiones anteriores (v0.4, v0.3) es la eliminacion de la entrada de climatologia, que lastraba la perdida en v0.4.

La informacion publica disponible es escasa: no se detalla la arquitectura interna mas alla de la etiqueta "pwm-dyn", no se especifican los datos de entrenamiento en tokens ni la composicion del dataset, y no consta informacion sobre idiomas (no aplicable a un modelo numerico). Los pesos se distribuyen en un unico fichero PyTorch de 1,31 MB bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PWM-Dyn (Paradox World Model, variante dinamica); detalles internos no disponibles |
| Parametros totales | 321.636 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no especificada; salida de 12 pasos) |
| Tipos de cuantizacion | no disponible (pesos en precision original PyTorch) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia PWM-Dyn ("Paradox World Model", variante dinamica), pero no describe la arquitectura interna (tipo de capas, mecanismo de atencion, tratamiento del grafo de sensores ni estrategia de fusion espacio-temporal). El codigo de la arquitectura se referencia en el repositorio de GitHub del proyecto, y la configuracion exacta de entrenamiento se almacena dentro del propio fichero de pesos en la clave `ck['cfg']`. No se dispone de informacion publica sobre el numero de tokens o pasos de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF/DPO (no aplicables a este dominio).

El cambio documentado en esta version respecto a v0.4 es la eliminacion de la entrada de climatologia, que segun el autor constituia la causa de la perdida en v0.4. El modelo se entreno el 2026-11-03 mediante un cuaderno de Kaggle (version 365009705) y se publico el 2026-11-17. La evaluacion reportada corresponde a un ensemble de 3 semillas (100-102), siendo este fichero la semilla 100.

## Capacidades

- Pronostico de trafico a 12 pasos sobre la red METR-LA (207 sensores de autopista).
- Prediccion de series temporales espacio-temporales sobre grafos de sensores.
- Modelado de dependencias espaciales entre sensores y dependencias temporales entre pasos.
- Capacidad de ensemble: el autor reporta resultados con 3 semillas (100, 101, 102), lo que permite promediar predicciones.
- No dispone de tool calling, function calling, capacidad de agente, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No es un modelo generativo de texto: su salida son valores numericos de trafico.

## Casos de uso

- Prediccion de trafico en tiempo real para sistemas de gestion de autopistas: el modelo consume las lecturas de los 207 sensores de METR-LA y emite los 12 pasos siguientes, lo que permite anticipar congestiones con hasta 12 intervalos de antelacion (tipicamente 5 minutos por paso).
- Enrutamiento dinamico y estimacion de tiempos de llegada: integrar las predicciones de velocidad/flujo en un motor de rutas para recalcular ETA y desviar trafico antes de que se forme el atasco.
- Alimentacion de sistemas de control de semaforos y rampas de acceso: usar el horizonte de 12 pasos como entrada a un controlador predictivo (MPC) que ajuste la metering rate.
- Benchmarking de nuevos modelos espacio-temporales: al ser un modelo ligero con resultados registrados frente a STID, Graph WaveNet y STAEformer en METR-LA, sirve como linea base reproducible en experimentos academicos.
- Prototipado rapido en entornos con recursos limitados: con 321.636 parametros y un fichero de 1,31 MB, se puede ejecutar en CPU o en GPU de gama baja para validar pipelines de datos antes de escalar a modelos mayores.
- Investigacion en ensembles de series temporales: la publicacion de tres semillas permite estudiar el efecto del promediado de semillas en el MAE de forecasting de trafico.
- Educacion y docencia: ejemplo compacto de forecasting espacio-temporal con pesos abiertos y licencia permisiva, adecuado para practicas de laboratorio.

## Benchmarks y rendimiento

La model card reporta un unico resultado: ParadoxBench-1.1 Track A, test MAE 2,92 con ensemble de 3 semillas (100-102). No se proporcionan resultados por semilla individual, ni metricas adicionales (RMSE, MAPE), ni la tabla comparativa completa con STID, Graph WaveNet y STAEformer. Tampoco se publican resultados de benchmarks en la informacion disponible para el resto de conjuntos (PEMS04, PEMS07, PEMS-BAY) mas alla de la afirmacion cualitativa de que el modelo es "el mejor" en ellos.

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| ParadoxBench-1.1 Track A | Test MAE | 2,92 | Ensemble 3 semillas (100-102); este fichero es semilla 100 |
| Resto de metricas (RMSE, MAPE, etc.) | no disponible | no disponible | no publicadas en la informacion disponible |
| Comparativa numerica con STID / Graph WaveNet / STAEformer | no disponible | no disponible | solo se afirma superioridad cualitativa |

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (321.636 parametros en precision original); el consumo real dependera del tamano de lote y de las activaciones, pero es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 o incluso CPU es suficiente para inferencia en tiempo real.
- Cabe en cualquier GPU consumer, incluida la gama integrada y GPUs de portatil.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`), exportacion a TorchScript o ONNX para servir en produccion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y sub-milisegundo en GPU para lotes pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | MAE reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 METR-LA (este) | 321.636 | 12 pasos de salida | 2,92 (ensemble 3 semillas) | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | no disponible (solo se afirma que PWM-Dyn es mejor) | no disponible | no disponible |
| Graph WaveNet | no disponible | no disponible | no disponible (solo se afirma que PWM-Dyn es mejor) | no disponible | no disponible |
| STAEformer | no disponible | no disponible | no disponible (solo se afirma que PWM-Dyn es mejor) | no disponible | no disponible |

La comparativa numerica con STID, Graph WaveNet y STAEformer no esta disponible en la informacion proporcionada: la model card solo afirma cualitativamente que PWM-Dyn v0.6 es mejor en PEMS04, PEMS07, METR-LA y PEMS-BAY.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en METR-LA: no es transferible a otros dominios sin reentrenamiento; las predicciones fuera de la red de 207 sensores de Los Angeles no son validas.
- Horizonte fijo de 12 pasos: no admite configuracion de horizonte distinto sin cambios en el codigo.
- Arquitectura no documentada en la model card: la reproducibilidad depende del codigo del repositorio de GitHub, no de la ficha de Hugging Face.
- Resultados de benchmark limitados: solo se publica MAE de ensemble; no hay RMSE, MAPE ni resultados por semilla, lo que dificulta la comparacion rigurosa.
- Riesgo de sobreajuste a la distribucion de METR-LA: el rendimiento puede degradarse ante cambios en la red de sensores, obras o eventos atipicos no representados en el entrenamiento.
- Datos de entrenamiento no incluidos: la model card remite a `DATA_SOURCES.md` para las fuentes y terminos, pero no se detalla la composicion ni el preprocesado.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo de trafico puede heredar sesgos de cobertura de sensores (zonas con menos detectores).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos de las fuentes de datos originales (METR-LA) antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- Modelo de muy reciente publicacion (2026-11-17): no hay literatura externa ni evaluaciones de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-metr-la
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de la conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#10, PEMS07): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems07
- Modelo siguiente (#12, PEMS-BAY): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems-bay
- Indice de todos los modelos: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
