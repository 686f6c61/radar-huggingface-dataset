# paradoxailab/atlas-w-v0

## Resumen

Atlas-W v0 (air core) es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo numero 40 de 56 publicados (numeracion de serie 01-59). Su tarea es predecir las siguientes 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire. No es un modelo de lenguaje: es un modelo predictivo de muy pequeno tamano, con solo 14.043 parametros, entrenado especificamente sobre datos de contaminacion atmosferica de Delhi.

El modelo se entrena con datos de la Junta Central de Control de la Contaminacion (CPCB) de Delhi, cubriendo 39 estaciones continuas de calidad del aire del conjunto "Delhi Hourly Air Quality Reports" de OpenCity. Segun la model card, la version v0 logra entre un 6 % y un 13 % menos de error que el modelo Atlas anterior para cualquier cantidad de datos de entrenamiento, gracias a un diseno "output-first" orientado a la eficiencia informativa.

Su relevancia es acotada pero concreta: demuestra que modelos de forecasting espaciotemporal de muy bajo coste computacional pueden superar a alternativas previas en un dominio critico como la prediccion de calidad del aire urbana. Es un artefacto de investigacion mas que un modelo de produccion general, y su publicacion forma parte de una serie amplia de modelos experimentales del laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espaciotemporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 14.043 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 24 horas) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, 144.107 bytes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de describirla como un diseno "information-efficient output-first". El codigo de arquitectura se encuentra en el repositorio de GitHub del laboratorio y la configuracion de entrenamiento esta embebida en el propio checkpoint bajo la clave `ck['cfg']`. Por los tags y la tarea, se trata de un modelo de series temporales espaciotemporal aplicado a 39 estaciones de monitorizacion.

El entrenamiento se realizo el 13 de noviembre de 2026 en un entorno de Kaggle (identificador `atlasw-v0`), y el modelo se publico el 17 de noviembre de 2026. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos se documentan en `DATA_SOURCES.md` del repositorio. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (poco probables en un modelo de forecasting de este tamano).

## Capacidades

- Prediccion de las siguientes 24 horas de PM2.5 en estaciones de calidad del aire.
- Modelado espaciotemporal sobre 39 estaciones continuas de Delhi.
- Diseno "output-first" orientado a la eficiencia informativa con muy pocos parametros (14.043).
- Inferencia en CPU: el checkpoint se carga con `torch.load(..., map_location="cpu")`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de vision, audio ni modo de pensamiento.

## Casos de uso

- Prediccion operativa de calidad del aire en Delhi: el modelo genera el horizonte de 24 horas de PM2.5 por estacion, util para sistemas de alerta temprana municipales.
- Investigacion en forecasting espaciotemporal de bajo coste: sirve como linea base ligera (14.043 parametros) para comparar metodos mas complejos en el mismo conjunto de datos.
- Integracion en paneles de salud publica: alimentar avisos a poblacion sensible (asmaticos, personas mayores) con predicciones horarias de PM2.5.
- Validacion de pipelines de datos CPCB/OpenCity: el modelo permite verificar la calidad y continuidad de las series de las 39 estaciones antes de desplegar modelos mayores.
- Estudio de eficiencia informativa: el diseno "output-first" es un caso de referencia para analizar cuanto rendimiento se obtiene con muy pocos parametros.
- Reproducibilidad academica: el checkpoint incluye `results` y logs de ejecucion, lo que facilita replicar y auditar los resultados registrados.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es relativa: "6-13 % lower error than Atlas at every amount of data". No se proporcionan valores absolutos de error (RMSE, MAE) ni comparaciones con modelos externos.

| Metrica | Atlas-W v0 | Atlas (version anterior) |
|---|---|---|
| Error relativo | 6-13 % menor | linea base |
| Error absoluto (RMSE/MAE) | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el checkpoint ocupa 144.107 bytes y el modelo tiene 14.043 parametros, por lo que cabe en cualquier CPU.
- GPU recomendadas: no necesarias; la carga documentada se hace en CPU (`map_location="cpu"`).
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-W v0 | 14.043 | PM2.5 proximas 24 h | 24 h | Apache-2.0 | Hugging Face |
| Atlas (version anterior) | no disponible | PM2.5 proximas 24 h | 24 h | no disponible | Hugging Face (serie) |
| Atlas-Delhi v1.3 (#42) | no disponible | forecasting Delhi | no disponible | no disponible | Hugging Face |
| Atlas-W v1 (pre-training) (#44) | no disponible | forecasting | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con modelos externos al laboratorio; la unica comparacion publicada es frente al Atlas anterior, con una mejora de error del 6-13 %.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice PM2.5 en 39 estaciones de Delhi; no es generalizable a otras ciudades ni contaminantes sin reentrenamiento.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No se publican metricas absolutas de error, solo una mejora relativa frente a Atlas, lo que dificulta evaluar su utilidad real.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad depende de las fuentes externas documentadas en `DATA_SOURCES.md`.
- Riesgo de sobreajuste a la ventana temporal de entrenamiento (noviembre de 2026) y a la disponibilidad de las estaciones CPCB.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El checkpoint se carga con `weights_only=False`, lo que implica riesgos de seguridad si se cargan ficheros no verificados; conviene comprobar el SHA-256 publicado.
- No hay informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/paradoxailab/atlas-w-v0)
- [Repositorio GitHub del proyecto](https://github.com/paradoxailab/paradox-world-model)
- [Registro de Atlas (README)](https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md)
- [Indice de la serie de modelos](https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md)
- [Fuentes de datos](https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md)
- [CITATION.cff](https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff)
- [Modelo anterior: Atlas-Delhi v1.3](https://huggingface.co/paradoxailab/atlas-delhi-v1.3)
- [Modelo siguiente: Atlas-W v1 (pre-training)](https://huggingface.co/paradoxailab/atlas-w-v1-pretrain)
- [Todos los modelos de la serie](https://huggingface.co/paradoxailab/paradox-world-model-series)
- [Sitio web del laboratorio](https://paradoxailab.com)
