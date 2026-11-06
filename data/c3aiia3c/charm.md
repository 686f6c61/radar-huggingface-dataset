# c3aiia3c/CHARM

## Resumen

CHARM (**CH**annel-**A**ware **R**epresentation **M**odel) es un modelo fundacional para series temporales multivariantes desarrollado por C3 AI. Se distribuye exclusivamente como servicio tras una API y se consume mediante el SDK de Python de código abierto `c3-charm`. Resuelve tres tareas principales sin entrenamiento específico por conjunto de datos: generación de embeddings densos a partir de ventanas `(T, C)`, forecasting probabilístico zero-shot con salida por cuantiles y backcasting, y un conjunto de utilidades (`charm_toolkit`) para detección de anomalías, métricas de recuperación y cabezas entrenables ligeras.

La arquitectura combina una proyección TCN-pool con parches de tamaño 16, convoluciones causales y puerta residual, seguida de un encoder Transformer con atención RoPE. El modelo total ronda los 63,3 millones de parámetros (unos 59 M en el encoder), con un tamaño oculto de 384, contexto máximo de 8192 pasos y un decodificador de cuantiles de 99 niveles (0,01–0,99). Es relevante porque aborda el forecasting probabilístico multivariante zero-shot con nombres de canal como parte de la entrada, un enfoque poco común en modelos fundacionales de series temporales.

El modelo no publica pesos ni código de entrenamiento: solo está accesible vía API con credenciales. Esto lo diferencia de alternativas abiertas como Chronos o TimesFM y condiciona por completo su evaluación, despliegue y reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con atención RoPE + proyección TCN-pool (parche 16, convoluciones causales, puerta residual) |
| Parametros totales | ~63,3 M (encoder ~59 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 |
| Tipos de cuantizacion | no disponible (servicio en float32) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | other (pesos y código no publicados; acceso vía API) |
| Formato de pesos | no disponible (no se distribuyen pesos; acceso mediante SDK `c3-charm`) |

## Arquitectura y entrenamiento

CHARM procesa ventanas multivariantes `(T, C)` donde los nombres de canal forman parte de la entrada, lo que le permite distinguir variables dentro de una misma serie. La proyección inicial usa un TCN-pool con parches de tamaño 16, una pila de convoluciones causales y una puerta residual que reduce la secuencia antes de entrar en el backbone. El backbone es un Transformer encoder con atención RoPE, con tamaño oculto de 384. La salida se genera mediante un decodificador de cuantiles de 99 niveles (0,01–0,99), lo que produce forecasting probabilístico multivariante. El modelo normaliza internamente, de modo que el cliente envía valores en bruto.

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El modelo se ejecuta en servidor (float32) y el SDK actúa únicamente como cliente.

## Capacidades

- Embeddings de series temporales: convierte ventanas `(T, C)` en vectores densos para búsqueda, clustering, detección de anomalías y extracción de características.
- Forecasting zero-shot: predicción probabilística por cuantiles sin datos de entrenamiento específicos del dominio.
- Backcasting: reconstrucción de valores pasados mediante el mismo esquema de cuantiles.
- Detección de anomalías: recetas incluidas en `charm_toolkit` basadas en recuperación de embeddings y kNN.
- Cabezas entrenables ligeras: modelos pequeños para forecasting, reconstrucción y clasificación sobre las representaciones del modelo.
- Multivariante con reconocimiento de canal: los nombres de canal son parte de la entrada.
- Métricas de recuperación incluidas en el toolkit.
- Integración con agentes de código: skill para Claude Code, Cursor y Codex que indica cuándo y cómo aplicar CHARM.
- No soporta tool calling ni function calling en el sentido de modelos de lenguaje; es un modelo numérico de series temporales.

## Casos de uso

- Forecasting de demanda energética: el modelo recibe ventanas multivariantes de consumo, temperatura y calendario, y devuelve cuantiles de demanda futura sin entrenamiento por emplazamiento, gracias a su contexto de 8192 pasos y a la entrada con nombres de canal.
- Predicción de ventas minoristas: se envían series de ventas por producto y variables exógenas (promociones, precio) para obtener intervalos de predicción que alimentan la planificación de stock.
- Monitorización de infraestructura cloud: detección de anomalías en métricas de CPU, latencia y tráfico mediante embeddings y kNN sobre ventanas recientes, aprovechando la normalización interna del modelo.
- Mantenimiento predictivo en transporte: backcasting y forecasting de sensores de flota para identificar desviaciones antes de que se conviertan en fallos, usando las cabezas de reconstrucción del toolkit.
- Búsqueda de patrones en series históricas: indexación de embeddings de ventanas para recuperar segmentos similares en bases de datos de telemetría o registros clínicos.
- Clasificación de señales: uso de la cabeza `ClassificationModel` sobre las representaciones de CHARM para etiquetar ventanas (por ejemplo, estados operativos o arritmias) con pocos datos etiquetados.
- Análisis financiero: forecasting probabilístico de indicadores económicos y series de mercado con cuantiles que permiten construir intervalos de riesgo.
- Asistencia a desarrolladores mediante agentes: el skill de CHARM permite que Claude Code o Cursor generen código de integración con el SDK sin conocer la API de antemano.

## Benchmarks y rendimiento

Evaluación zero-shot sobre GIFT-Eval completo (97 configuraciones de dataset/frecuencia/plazo) con el protocolo estándar de 11 métricas. Las puntuaciones son la media geométrica de la métrica por configuración normalizada frente a Seasonal Naive (menor es mejor; por debajo de 1,0 supera a Seasonal Naive).

| Metrica | Puntuacion (rel. Seasonal Naive) |
|---|---|
| MASE | 0,7582 |
| CRPS (mean weighted sum quantile loss) | 0,4776 |

Desglose por plazo (media geométrica normalizada):

| Plazo | MASE | CRPS |
|---|---|---|
| short | 0,7463 | 0,5036 |
| medium | 0,7577 | 0,4452 |
| long | 0,7911 | 0,4460 |

No se han publicado en la información disponible comparaciones directas con otros modelos fundacionales de series temporales ni resultados de latencia o throughput.

## Requisitos de hardware

- No aplica VRAM local para inferencia del modelo: CHARM se ejecuta en servidor y se consume vía API con `CHARM_BASE_URL` y `CHARM_API_KEY`.
- El cliente requiere Python >= 3.10 y el paquete `c3-charm`; para el toolkit se necesita PyTorch (existe wheel de CPU).
- No se especifican GPU recomendadas ni requisitos de memoria para el servicio.
- No cabe en GPU de consumo porque los pesos no se distribuyen.
- Opciones de despliegue: API propia de C3 AI; disponibilidad anunciada en Azure AI Foundry (instrucciones pendientes de publicación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos abiertos | Licencia | Acceso |
|---|---|---|---|---|---|
| CHARM (C3 AI) | ~63,3 M | 8192 | No | other | API con credenciales |
| Chronos (Amazon) | no disponible en esta ficha | no disponible en esta ficha | Sí | no disponible en esta ficha | Hugging Face |
| TimesFM (Google) | no disponible en esta ficha | no disponible en esta ficha | Sí | no disponible en esta ficha | Hugging Face |
| Moirai (Salesforce) | no disponible en esta ficha | no disponible en esta ficha | Sí | no disponible en esta ficha | Hugging Face |

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto o rendimiento de estas alternativas con CHARM; la comparación se limita a la disponibilidad de pesos y al modo de acceso.

## Limitaciones y advertencias

- Los pesos y el código de entrenamiento no son públicos: no es posible reproducir el modelo, auditarlo ni ejecutarlo en local.
- El acceso requiere credenciales gestionadas por C3 AI (contacto vía correo); no hay registro self-service documentado.
- La licencia es "other" y no se detallan los términos de uso comercial; es imprescindible revisarlos antes de integrar en producción.
- Dependencia de un proveedor externo: latencia, disponibilidad y coste quedan fuera del control del usuario.
- No se documentan sesgos, aunque al ser un modelo numérico el riesgo principal es el mal ajuste a dominios con dinámicas muy distintas a las del entrenamiento.
- Riesgo de predicciones poco fiables en series con cambios de régimen, datos faltantes o frecuencias no representadas en el entrenamiento; no se publica la composición del dataset.
- El contexto máximo es de 8192 pasos; series más largas requieren ventaneo.
- No se especifican los dominios cubiertos con garantías más allá de la lista genérica (energía, transporte, ventas, salud, naturaleza, web/cloud-ops, economía/finanzas).
- Los resultados de GIFT-Eval se presentan solo normalizados frente a Seasonal Naive; no hay comparación publicada con otros modelos fundacionales.
- No hay información sobre cuantización ni despliegue en hardware propio, lo que impide estimar costes de inferencia local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c3aiia3c/CHARM
- Documentación y quickstart: https://c3aiia3c-charm-docs.static.hf.space
- Paquete PyPI `c3-charm`: https://pypi.org/project/c3-charm/
- Skill para agentes de código: https://huggingface.co/c3aiia3c/CHARM/tree/main/skills/charm
- Referencia arXiv citada en las etiquetas: arxiv:2605.31580 (no verificada en la información disponible)
