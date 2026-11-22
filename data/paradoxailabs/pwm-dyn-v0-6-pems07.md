# PARADOXAIlabs/pwm-dyn-v0.6-pems07

## Resumen

PWM-Dyn v0.6 (variante PEMS07) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab, enmarcado en su linea "Paradox World Model" (concretamente el modelo numero 10 de una serie de 56 publicados). Resuelve una tarea muy concreta: predecir los siguientes 12 pasos temporales de trafico sobre la red de 883 sensores de Caltrans PeMS District 7 (Los Angeles). Es, por tanto, un modelo de pronostico de trafico y no un modelo de lenguaje.

El modelo es extremadamente compacto: 408.164 parametros en total, con un unico fichero de pesos de 1.659.009 bytes en formato PyTorch (`.pt`). No es un transformer de proposito general ni un LLM; es una red especializada para forecasting espaciotemporal, entrenada sobre PEMS07 y evaluada con el protocolo propio ParadoxBench-1.1 Track A.

Su relevancia es acotada pero clara para quien trabaja en prediccion de trafico: segun la model card, supera en PEMS04, PEMS07, METR-LA y PEMS-BAY a re-ejecuciones de STID, Graph WaveNet y STAEformer, y su version v0.6 elimina la entrada de climatologia que lastraba a v0.4. La licencia Apache-2.0 y el tamano minimo lo hacen trivial de desplegar en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal espaciotemporal especializada (detalles en el repositorio GitHub; no especificada en la model card) |
| Parametros totales | 408.164 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; tarea fija de prediccion de los siguientes 12 pasos |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`; por tamano cabe en FP32 sin problema) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica que el codigo esta en el repositorio GitHub de paradox-world-model y que la configuracion exacta de entrenamiento esta embebida en el checkpoint bajo la clave `ck['cfg']`. Se trata de un modelo espaciotemporal para grafos de sensores de trafico, con una cabeza de salida de 12 pasos. El numero de parametros (408.164) sugiere una red pequena, probablemente con capas de convolucion espacial sobre grafo y recurrencia o convolucion temporal, aunque esto no se confirma en la informacion disponible.

El entrenamiento se realizo el 2026-11-03 en un notebook de Kaggle (version 365009705), sobre el conjunto PEMS07 (Caltrans PeMS District 7, Los Angeles, 883 sensores). El cambio principal de v0.6 respecto a versiones anteriores es la eliminacion de la entrada de climatologia, que era la causa de la perdida de rendimiento en v0.4. No se documentan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni el uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Pronostico de trafico a 12 pasos temporales sobre la red de 883 sensores de PEMS07.
- Prediccion espaciotemporal multivariante (multi-sensor, con dependencias espaciales entre estaciones).
- Evaluacion bajo el protocolo ParadoxBench-1.1 Track A (MAE).
- Entrenamiento reproducible: el checkpoint incluye configuracion (`cfg`), resultados (`results`) y metadatos (`meta`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision ni de audio.
- No es un modelo generativo de texto.

## Casos de uso

- Prediccion de congestion a corto plazo en autopistas: el modelo estima los 12 siguientes pasos de velocidad/ocupacion en los 883 sensores de PEMS07, util para paneles de gestion de trafico en tiempo real.
- Sistemas de alerta temprana de atascos: integrado en un pipeline que alimenta datos de sensores cada pocos minutos, permite anticipar cuellos de botella con antelacion suficiente para activar rutas alternativas.
- Enrutamiento dinamico en aplicaciones de navegacion: las predicciones a 12 pasos pueden consumirse por un motor de rutas para penalizar segmentos con congestion prevista.
- Investigacion academica en forecasting espaciotemporal: al ser un checkpoint pequeno con configuracion embebida, sirve como baseline reproducible frente a STID, Graph WaveNet o STAEformer.
- Despliegue en dispositivos de borde: con 408.164 parametros y 1,6 MB de pesos, cabe en CPU y en hardware embebido de estaciones de carretera sin GPU.
- Simulacion y planificacion de infraestructuras: las predicciones pueden alimentar simuladores de trafico para evaluar escenarios de obra o cambios de carril.
- Benchmarking interno: util como referencia de MAE en ParadoxBench-1.1 Track A para comparar futuras versiones de la familia PWM-Dyn.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ParadoxBench-1.1 Track A (test) | MAE | 19.56 (ensemble de 3 semillas, semillas 100-102; este fichero es la semilla 100) |

La model card afirma que v0.6 supera a v0.3 en PEMS08 y PEMS04, y que es el mejor en PEMS04, PEMS07, METR-LA y PEMS-BAY frente a re-ejecuciones de STID, Graph WaveNet y STAEformer, pero no se proporcionan en la informacion disponible las cifras concretas de esas comparaciones ni de los modelos rivales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 (1,6 MB de pesos mas activaciones minimas); cabe holgadamente en cualquier GPU.
- GPU recomendadas: ninguna en particular; el modelo es viable en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090) lo ejecuta sin cuello de botella.
- Cabe en GPU consumer: si, en todas; tambien en CPU y en hardware embebido.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportacion a TorchScript u ONNX recomendable para produccion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia deberia ser del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (PEMS07) | 408.164 | 12 pasos | MAE 19.56 en ParadoxBench-1.1 Track A | Apache-2.0 | Hugging Face |
| STID | no disponible | no disponible | Inferior segun la model card (sin cifras) | no disponible | Codigo publico |
| Graph WaveNet | no disponible | no disponible | Inferior segun la model card (sin cifras) | no disponible | Codigo publico |
| STAEformer | no disponible | no disponible | Inferior segun la model card (sin cifras) | no disponible | Codigo publico |

No se dispone de cifras detalladas de los modelos comparables en la informacion proporcionada; la afirmacion de superioridad procede unicamente de la model card del autor.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo predice trafico sobre PEMS07; no generaliza a otras ciudades ni a otros tipos de series sin reentrenamiento.
- El resultado MAE 19.56 corresponde a un ensemble de 3 semillas; el fichero publicado es solo la semilla 100, por lo que el rendimiento individual puede diferir del reportado.
- No se documentan sesgos especificos, pero al entrenarse con datos de Los Angeles (Caltrans District 7) puede reflejar patrones locales de trafico no representativos de otras regiones.
- Riesgo de degradacion ante eventos anomalos (accidentes, obras, condiciones meteorologicas extremas), especialmente tras eliminar la entrada de climatologia en v0.6.
- No se especifican los datos de entrenamiento ni su composicion; solo se enlaza a DATA_SOURCES.md en el repositorio.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos de las fuentes de datos originales (Caltrans PeMS) para uso derivado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion independiente conocida.
- El checkpoint se carga con `weights_only=False`, lo que implica ejecutar codigo pickle; conviene auditar el fichero antes de cargarlo en entornos no confiables.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems07
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Conferencia v0.6: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.6-conference/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#09): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems03
- Modelo siguiente (#11): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-metr-la
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Web del autor: https://paradoxailab.com
