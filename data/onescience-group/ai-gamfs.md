# OneScience-Group/AI-GAMFS

## Resumen

AI-GAMFS es un sistema de prediccion global de aerosoles y meteorologia basado en aprendizaje automatico, desarrollado por equipos de la Chinese Academy of Meteorological Sciences, el National Meteorological Center, la NASA y colaboradores. El modelo genera pronosticos de cinco dias con una resolucion temporal de tres horas, cubriendo el espesor optico de aerosoles (AOD), componentes opticos y concentraciones superficiales. La relevancia del sistema radica en trasladar la prediccion operativa de aerosoles desde modelos fisico-quimicos de transporte hacia un enfoque puramente aprendido, con coste computacional reducido frente a la asimilacion tradicional.

El repositorio publicado por OneScience-Group es una reproduccion de ingenieria independiente de las especificaciones publicas del sistema original, no una distribucion oficial de pesos. La arquitectura combina Vision Transformer y U-Net, con modelos de relevo (relay) a intervalos de 3, 6, 9 y 12 horas que encadenan predicciones de corto plazo para construir el horizonte de cinco dias. El entrenamiento utilizo 54 variables de aerosoles y meteorologia de MERRA-2 correspondientes al periodo 1980-2021.

Un aspecto critico para cualquier evaluacion: el repositorio no incluye pesos entrenados en el directorio `weight/`, y el articulo asociado no ofrece un enlace directo a pesos preentrenados oficialmente cargables. Esto limita el uso practico inmediato a la validacion de pipeline, entrenamiento propio y reproduccion, no a inferencia en produccion con un modelo listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer y U-Net con modelos de relevo (relay) a 3/6/9/12 horas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana espacio-temporal de 5 dias a intervalos de 3 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 en el repositorio; el articulo original esta bajo CC BY-NC-ND 4.0 y el codigo, pesos y datos oficiales conservan sus propios terminos |
| Formato de pesos | no disponible (no se incluyen pesos en `weight/`) |

## Arquitectura y entrenamiento

El sistema se apoya en una combinacion de Vision Transformer y U-Net para modelar campos globales de aerosoles y meteorologia. La innovacion central es el esquema de relevo: en lugar de predecir directamente los cinco dias, se entrenan cuatro modelos especializados en pasos de 3, 6, 9 y 12 horas que se encadenan de forma iterativa. La inferencia produce 40 predicciones a intervalos de tres horas, equivalentes a los cinco dias de horizonte. Esta estrategia de relay forecasting es habitual en prediccion meteorologica aprendida para contener la acumulacion de error en horizontes largos.

El entrenamiento empleo 54 variables de aerosoles y meteorologia del reanálisis MERRA-2, abarcando de 1980 a 2021. El repositorio declara PyTorch como framework y ofrece scripts para datos sinteticos (`fake_data.py`), entrenamiento (`train.py`), entrenamiento multiproceso con `torchrun --nproc_per_node=2`, inferencia (`inference.py`) y evaluacion/visualizacion (`result.py`). No se documentan en la informacion disponible detalles sobre numero total de tokens o muestras, composicion exacta de los splits, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en el sentido habitual a un modelo de prediccion fisica). La evaluacion reportada en el repositorio menciona RMSE de AOD y correlacion, pero sin valores numericos.

## Capacidades

- Prediccion global de espesor optico de aerosoles (AOD) y componentes opticos.
- Prediccion de concentraciones superficiales de aerosoles orientadas a calidad del aire.
- Seguimiento de transporte regional de contaminantes, con casos de uso explicitos para polvo y humo.
- Prediccion conjunta (acoplada) de aerosoles y meteorologia, no solo de una de las dos variables.
- Generacion de pronosticos a cinco dias con paso temporal de tres horas (40 pasos de inferencia).
- Validacion de datos, entrenamiento, inferencia, metricas de aerosoles y visualizacion mediante ejecucion en ModelScope/OneCode.
- Entrenamiento multiproceso en multiples GPUs mediante `torchrun`.
- Soporte de ejecucion en GPU, DCU (con DTK 25.04.2 o compatible) y CPU para validacion de conectividad con la configuracion por defecto de muestra pequena.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso generico, vision natural, audio ni modo de pensamiento (thinking), dado que no es un modelo de lenguaje.

## Casos de uso

- Prediccion operativa de calidad del aire: generar mapas de AOD y concentraciones superficiales a cinco dias con resolucion de tres horas para alimentar avisos de contaminacion urbana.
- Seguimiento de episodios de polvo sahariano o asiatico: el modelo puede rastrear el transporte regional de polvo y anticipar su llegada a zonas pobladas, util para protocolos de salud publica.
- Monitorizacion de humo por incendios forestales: la prediccion de componentes opticos permite estimar la dispersion de penachos y su impacto en la visibilidad y la calidad del aire.
- Investigacion climatica y atmosferica: uso del sistema como emulador aprendido de modelos de transporte para experimentos de sensibilidad sobre el ciclo de aerosoles.
- Validacion y reproduccion cientifica: ejecucion de los scripts de entrenamiento e inferencia para verificar las metricas de AOD (RMSE, correlacion) declaradas en el articulo.
- Formacion de modelos acoplados tiempo-aerosol: servir de base para estudiar interacciones entre meteorologia y aerosoles, dado que el sistema predice conjuntamente ambas variables.
- Desarrollo de pipelines MLOps cientificos: uso de `torchrun` con `--nproc_per_node=2` como plantilla para entrenamiento distribuido en GPUs o DCUs en infraestructura HPC.
- Docencia y prototipado: la configuracion por defecto en CPU permite validar el flujo completo con datos sinteticos sin hardware acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica que la evaluacion produce informes con RMSE de AOD y correlacion, pero no se facilitan valores numericos, ni comparaciones cuantitativas con otros sistemas de prediccion de aerosoles.

## Requisitos de hardware

- GPU o DCU recomendadas para entrenamiento e inferencia; no se especifican modelos concretos ni VRAM minima en la informacion disponible.
- CPU soportada para validacion de conectividad con la configuracion por defecto de muestra pequena.
- Usuarios de DCU deben instalar DTK 25.04.2 o una version compatible recomendada por OneScience antes de desplegar.
- Entorno de GPU: creacion de entorno Conda con Python 3.11 y dependencias `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12`, `gxx_linux-64=12`, e instalacion via `pip install onescience[earth-gpu]`.
- Entorno de DCU: entorno Conda con Python 3.11 e instalacion via `pip install onescience[earth-dcu]`.
- Entrenamiento distribuido mediante `torchrun --standalone --nproc_per_node=2 scripts/train.py` (el ejemplo usa dos procesos).
- VRAM estimada, latencia y throughput: no disponible.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; no aplican al tratarse de un modelo de prediccion geoespacial.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos cuantitativos de otros sistemas de prediccion global de aerosoles aprendidos o fisicos que permitan una comparacion rigurosa de parametros, contexto, rendimiento, licencia y disponibilidad. La comparativa se marca como no disponible.

## Limitaciones y advertencias

- No se incluyen pesos entrenados en el repositorio (`weight/` vacio); el articulo no ofrece un enlace a pesos preentrenados oficialmente cargables, por lo que no es posible inferencia directa sin entrenar desde cero.
- El repositorio se declara explicitamente como una reproduccion de ingenieria independiente de las especificaciones publicas, no como la implementacion oficial.
- Discrepancia de licencia relevante: los metadatos del repositorio indican apache-2.0, pero el articulo original esta bajo CC BY-NC-ND 4.0 y el codigo, pesos y datos oficiales conservan sus propios terminos. Antes de un uso comercial debe verificarse la licencia aplicable a cada componente.
- Idioma declarado: solo ingles (`en`), en el sentido de que la documentacion y el model card estan en ingles; el modelo en si trabaja con variables geoespaciales, no con texto.
- No hay datos publicados sobre sesgos, calibracion regional, comportamiento en latitudes extremas ni degradacion del error con el horizonte temporal mas alla de la mencion generica a RMSE y correlacion.
- Riesgo inherente de alucinacion en el sentido de predicciones plausibles pero fisicamente inconsistentes, especialmente en el encadenamiento de modelos de relevo, donde el error puede acumularse a lo largo de los 40 pasos.
- Ausencia de benchmarks publicos verificables impide estimar la calidad real frente a modelos operativos consolidados.
- Cero descargas y cero likes en el momento de la consulta, sin comunidad de validacion documentada.
- No se documentan requisitos de VRAM, throughput ni latencia, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/AI-GAMFS
- Articulo: Advancing operational global aerosol forecasting with machine learning, https://doi.org/10.1038/s41586-026-10234-y
