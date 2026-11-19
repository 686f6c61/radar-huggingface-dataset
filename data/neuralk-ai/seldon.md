# Neuralk-AI/seldon

## Resumen

Seldon es un modelo fundacional especializado en datos tabulares, desarrollado por Neuralk-AI. A diferencia de los modelos de lenguaje, su dominio de aplicación es la clasificación y regresión sobre tablas estructuradas, un tipo de dato omnipresente en banca, seguros, sanidad y marketing pero tradicionalmente resuelto con modelos ad-hoc por dataset (gradient boosting, redes específicas). Seldon propone un enfoque de modelo fundacional entrenado sobre un prior sintético, de modo que puede resolver tareas tabulares nuevas mediante aprendizaje en contexto (in-context learning), sin reentrenamiento por tarea.

El modelo tiene 213.464.122 parámetros (según los pesos en safetensors) y se distribuye bajo la licencia propietaria `neuralk-seldon-license`, con acceso restringido (gated) en Hugging Face: es necesario aceptar las condiciones en la plataforma antes de descargarlo. El repositorio ocupa 1,7 GB y acumula 3.791 descargas y 12 likes en el momento de redactar esta ficha.

Su relevancia actual radica en trasladar el paradigma de los foundation models al aprendizaje tabular: un único modelo capaz de generalizar a esquemas y distribuciones no vistos, reduciendo el coste de ingeniería por caso de uso. La información pública disponible es limitada en cuanto a arquitectura interna, datos de entrenamiento e idiomas soportados, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional para datos tabulares; no se detalla la arquitectura interna) |
| Parametros totales | 213.464.122 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dominio es tabular, no textual) |
| Licencia | neuralk-seldon-license (propietaria, acceso restringido/gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo (tipo de transformer, mecanismos de atencion sobre columnas, tokenizacion de valores tabulares, etc.), por lo que este apartado debe considerarse incompleto. Lo que si se desprende de las etiquetas del repositorio es que se trata de un modelo fundacional entrenado sobre un prior sintetico (`synthetic-prior`) y disenado para aprendizaje en contexto (`in-context-learning`): el modelo recibe un conjunto de filas de ejemplo junto con la columna objetivo y predice sobre filas nuevas, sin ajuste de pesos.

El modelo cubre tanto clasificacion como regresion tabular (`tabular-classification`, `tabular-regression`). No se han publicado datos sobre el numero de tokens o filas de entrenamiento, la composicion del dataset sintetico, ni si se aplicaron tecnicas de ajuste fino supervisado o preferencias. Tampoco hay informacion sobre innovaciones tecnicas especificas (por ejemplo, mecanismos de atencion sobre features o esquemas de aumento de datos).

## Capacidades

- Clasificacion tabular: prediccion de etiquetas categoricas a partir de columnas numericas y categoricas.
- Regresion tabular: prediccion de variables objetivo continuas.
- Aprendizaje en contexto: capacidad de resolver una tarea nueva proporcionando ejemplos en el propio contexto de inferencia, sin reentrenar.
- Generalizacion a esquemas no vistos: al estar entrenado sobre un prior sintetico, esta disenado para adaptarse a tablas con columnas y distribuciones distintas de las de entrenamiento.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio ni tool calling, coherentemente con su naturaleza tabular.

## Casos de uso

- Scoring de riesgo crediticio: dado un historico de solicitudes con variables socioeconomicas y su resultado (concedido/impagado), el modelo puede puntuar nuevas solicitudes usando ejemplos etiquetados en contexto, sin entrenar un modelo especifico por entidad.
- Deteccion de fraude transaccional: alimentar el modelo con transacciones etiquetadas recientes y usarlo para puntuar transacciones entrantes en tiempo casi real, aprovechando su capacidad de adaptacion a cambios de distribucion.
- Prediccion de abandono de clientes (churn): con una tabla de clientes, features de uso y etiqueta de baja, el modelo estima la probabilidad de abandono para campanas de retencion.
- Priorizacion de leads en marketing: regresion sobre el valor esperado de un lead a partir de datos demograficos y de comportamiento, para ordenar el esfuerzo comercial.
- Triaje clinico sobre datos estructurados: clasificacion de pacientes segun variables de laboratorio y demograficas para derivacion a especialistas, usando ejemplos historicos anonimizados en contexto.
- Mantenimiento predictivo industrial: regresion del tiempo hasta fallo a partir de lecturas de sensores tabuladas, con ejemplos de fallos previos como contexto.
- Enriquecimiento de pipelines ETL: uso como paso de imputacion o clasificacion dentro de un pipeline de datos, sustituyendo modelos especificos por un unico modelo fundacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 213 millones de parametros, en precision FP16 el modelo ocupa aproximadamente 0,43 GB de pesos; en FP32, unos 0,85 GB. El consumo real dependera del tamano del contexto tabular (numero de filas y columnas de ejemplo), no disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre deberia poder alojar los pesos; una RTX 4090, A100 o H100 ofrecerian margen sobrado y mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060 y superiores), aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo tabular, lo habitual seria servirlo mediante un endpoint propio o la API del proveedor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuralk-AI/seldon | 213.464.122 | no disponible | Fundacional tabular con in-context learning | neuralk-seldon-license (gated) | Hugging Face con acceso restringido |
| XGBoost / LightGBM | no aplica (modelos por tarea) | no aplica | Gradient boosting entrenado por dataset | Apache 2.0 / MIT | Abierta |
| TabPFN | no disponible en la informacion proporcionada | no disponible | Prior transformer para tablas | no disponible | no disponible |

La comparacion cuantitativa de rendimiento con estas alternativas no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar la licencia `neuralk-seldon-license`; las condiciones de uso comercial deben revisarse antes de integrarlo en produccion.
- Licencia propietaria: no es una licencia open source; pueden existir restricciones de redistribucion, uso comercial o modificacion no detalladas en la informacion disponible.
- Ausencia de datos de evaluacion: no hay benchmarks publicados, por lo que el rendimiento real frente a gradient boosting u otros modelos tabulares no puede verificarse.
- Riesgo de sesgo: al entrenarse sobre un prior sintetico, el modelo puede no capturar sesgos ni relaciones causales de dominios reales; es necesario validar por caso de uso.
- Generalizacion incierta: la eficacia del aprendizaje en contexto depende de la calidad y cantidad de ejemplos proporcionados; no se documenta el tamano de contexto maximo.
- Idiomas y datos textuales: el modelo no esta disenado para texto libre; su uso con columnas de alta cardinalidad o texto no estructurado no esta documentado.
- Sin informacion sobre cuantizacion ni despliegue: no se ofrecen recetas oficiales para servir el modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neuralk-AI/seldon
- Organizacion Neuralk-AI: https://huggingface.co/Neuralk-AI
