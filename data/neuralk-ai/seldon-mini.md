# Neuralk-AI/seldon-mini

## Resumen

Seldon-mini es un modelo fundacional especializado en datos tabulares desarrollado por Neuralk-AI. A diferencia de los modelos de lenguaje, está diseñado para resolver tareas de clasificación y regresión sobre tablas estructuradas mediante aprendizaje en contexto (in-context learning), lo que permite obtener predicciones sin necesidad de reentrenar el modelo para cada nuevo conjunto de datos. Con 27,4 millones de parámetros, es un modelo compacto orientado a eficiencia y despliegue ligero.

El modelo se distribuye a través de Hugging Face bajo una licencia propia (neuralk-seldon-license) y con acceso restringido: es necesario aceptar las condiciones en la página del repositorio antes de poder descargarlo. El repositorio ocupa 0,2 GB y acumula más de 5.700 descargas, lo que indica una adopción moderada dentro del nicho de los modelos fundacionales tabulares.

Su relevancia actual radica en la tendencia hacia modelos fundacionales para datos estructurados, un área donde los enfoques clásicos de gradient boosting siguen dominando pero donde los modelos preentrenados con priors sintéticos empiezan a ofrecer alternativas sin ajuste por tarea. Seldon-mini se posiciona como una opción de bajo coste computacional para pipelines tabulares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional tabular) |
| Parámetros totales | 27.404.554 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | neuralk-seldon-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su clasificación como modelo fundacional tabular con aprendizaje en contexto y entrenamiento basado en priors sintéticos (synthetic-prior). Este último término sugiere que el modelo se preentrena sobre conjuntos de datos tabulares generados sintéticamente, una técnica habitual en modelos fundacionales tabulares para exponer al modelo a una amplia variedad de distribuciones y relaciones entre columnas antes de enfrentarse a datos reales.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. Tampoco se documenta el mecanismo exacto de inferencia en contexto ni cómo se codifican las filas y columnas de entrada.

## Capacidades

- Clasificación tabular: predice etiquetas categóricas a partir de filas de datos estructurados.
- Regresión tabular: estima valores numéricos continuos sobre tablas.
- Aprendizaje en contexto: resuelve tareas nuevas proporcionando ejemplos en la propia entrada, sin reentrenamiento.
- Generalización entre datasets: el preentrenamiento con priors sintéticos busca transferir a dominios tabulares no vistos.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso, dado que es un modelo tabular.
- Capacidades multilingües: no aplica, al no procesar lenguaje natural.

## Casos de uso

- Scoring de riesgo crediticio: el modelo puede recibir un lote de solicitudes con ejemplos etiquetados de impago en el contexto y devolver una probabilidad de impago por fila, evitando entrenar un modelo específico para cada cartera.
- Predicción de churn en SaaS: con un histórico de clientes etiquetados como activos o perdidos, se pueden clasificar nuevas cuentas introduciendo los ejemplos relevantes en la entrada del modelo.
- Detección de fraude transaccional: clasificación de transacciones sospechosas a partir de un conjunto de ejemplos etiquetados, útil para prototipado rápido antes de construir un pipeline supervisado dedicado.
- Priorización de leads en marketing: regresión sobre variables demográficas y de comportamiento para estimar propensión de conversión sin reentrenar por campaña.
- Mantenimiento predictivo industrial: estimación del tiempo hasta fallo o clasificación de equipos en riesgo a partir de lecturas de sensores tabuladas.
- Enriquecimiento de datos en ETL: clasificación automática de registros (por ejemplo, categorización de productos o direcciones) dentro de pipelines de datos, aprovechando el tamaño reducido del modelo para despliegues ligeros.
- Evaluación rápida de datasets: uso como baseline en contexto para estimar la dificultad de una tarea tabular antes de invertir en ingeniería de características y entrenamiento supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,4 millones de parámetros en safetensors, los pesos en FP32 ocupan aproximadamente 110 MB; en FP16 unos 55 MB. El consumo real de VRAM dependerá del tamaño de los lotes y del contexto tabular, no documentado.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente; no se dispone de recomendaciones oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo tabular, el despliegue probablemente se realice mediante la librería de Transformers u otro runtime propio de Neuralk-AI, no especificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seldon-mini (Neuralk-AI) | 27,4 M | no disponible | Clasificación/regresión tabular | neuralk-seldon-license (gated) | Hugging Face, acceso restringido |
| TabPFN | no disponible en esta ficha | no disponible | Clasificación tabular en contexto | no disponible en esta ficha | no disponible en esta ficha |
| XGBoost / LightGBM | no aplica (no neuronal) | no aplica | Clasificación/regresión tabular | MIT / Apache 2.0 | Amplia |

La comparación cuantitativa con TabPFN u otros modelos fundacionales tabulares no está disponible en la información proporcionada; los datos de la tabla para alternativas deben verificarse en sus respectivas fuentes.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está gated y requiere aceptar la licencia neuralk-seldon-license en Hugging Face antes de la descarga.
- Licencia propia: al no ser una licencia estándar (MIT, Apache), es imprescindible revisar los términos para uso comercial y redistribución.
- Sin datos de benchmarks: no hay evidencia pública de rendimiento frente a baselines como XGBoost o TabPFN en la información disponible.
- Documentación escasa: no se detallan arquitectura, contexto máximo, formato de entrada ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de generalización limitado: los modelos entrenados con priors sintéticos pueden degradarse en distribuciones tabulares muy alejadas de las del preentrenamiento.
- Sin soporte lingüístico: no debe emplearse para tareas de texto, código o razonamiento; su ámbito es exclusivamente tabular.
- Sesgos: no documentados; al entrenarse con datos sintéticos, los sesgos dependerán del generador de priors, no especificado.
- Alucinación: en el contexto tabular se traduce en predicciones mal calibradas o extrapolaciones poco fiables fuera del rango de los ejemplos proporcionados en contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neuralk-AI/seldon-mini
- Página de Neuralk-AI en Hugging Face: https://huggingface.co/Neuralk-AI
- Licencia neuralk-seldon-license: disponible en el repositorio de Hugging Face del modelo (requiere aceptar condiciones)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
