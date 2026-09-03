# Ganesh-Nadkarni/network-traffic-prediction

## Resumen

El repositorio `Ganesh-Nadkarni/network-traffic-prediction` contiene un sistema de predicción de métricas de tráfico de red basado en tres modelos de regresión Gradient Boosting implementados con scikit-learn. Desarrollado por Ganesh-Nadkarni, el sistema toma capturas de paquetes de Wireshark (en formato `.txt` o `.pcapng`) y predice tres variables: throughput en Mbps, número de paquetes por segundo y porcentaje de utilización de enlace. Es una herramienta pensada para administradores de red y operadores que necesitan anticipar la carga de sus infraestructuras sin depender de APIs comerciales, ya que todo el procesamiento se ejecuta localmente con librerías de código abierto.

Cada modelo es un regresor Gradient Boosting independiente, entrenado con características derivadas de flujos de red (paquetes, bytes, longitudes medias, intervalos de llegada, etc.). No se trata de un modelo de lenguaje ni de un sistema generativo, sino de un pipeline de regresión clásica. El repositorio incluye scripts de ejecución, escaladores, definiciones de características y métricas de rendimiento, lo que facilita su integración en entornos de monitorización existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Regressor (scikit-learn) ×3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | joblib (.pkl) |

## Arquitectura y entrenamiento

El sistema emplea tres modelos independientes de Gradient Boosting Regressor, cada uno especializado en una métrica de tráfico: throughput (Mbps), paquetes por segundo y utilización de enlace (%). La arquitectura general es un pipeline que comienza con un parser de capturas de Wireshark (decodifica capas 2/3/4), continúa con un módulo de ingeniería de características que agrega datos en ventanas de 1 segundo (incluyendo conteo de paquetes, bytes totales, throughput, mezcla de protocolos, IPs únicas, características de retardo y medias móviles) y finaliza con los tres regresores. No se especifican detalles del dataset de entrenamiento ni el número de muestras, pero se menciona que los modelos, escaladores y métricas están disponibles en el directorio `kaggle_models/`. No se indica el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de throughput en Mbps a partir de capturas de red.
- Predicción de paquetes por segundo (pkt/s).
- Predicción de porcentaje de utilización de enlace.
- Procesamiento de archivos de captura de Wireshark en formato `.txt` (hex-dump) y `.pcapng`.
- Generación de informes legibles (`.txt`) y estructurados (`.json`) con las predicciones.
- Generación de gráficos de dashboard, distribución de protocolos y series temporales de tráfico.
- Ejecución 100% local con librerías de código abierto (scikit-learn, pandas, numpy, matplotlib, joblib).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un sistema de regresión especializado.

## Casos de uso

- Monitorización proactiva de enlaces: el modelo de utilización de enlace permite anticipar picos de carga y programar mantenimientos o ampliaciones de ancho de banda antes de que se produzcan saturaciones.
- Planificación de capacidad: con las predicciones de throughput y paquetes por segundo, un operador puede dimensionar infraestructura (routers, switches, balanceadores) para ventanas temporales futuras.
- Detección de anomalías: al comparar las predicciones con el tráfico real observado, se pueden identificar desviaciones que indiquen ataques DDoS, fallos de hardware o comportamientos anómalos.
- Optimización de calidad de servicio (QoS): las predicciones de throughput por ventana permiten ajustar políticas de priorización de tráfico en tiempo real.
- Informes de capacidad para clientes o dirección: el sistema genera informes automáticos en JSON y texto plano, listos para integrar en paneles de gestión o presentaciones.
- Investigación académica: el pipeline de extracción de características y los modelos pueden servir como base para estudios sobre predicción de tráfico en redes de área local o campus.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas de rendimiento para cada modelo:

| Modelo | R² | MAE | RMSE |
|---|---:|---:|---:|
| Throughput (Mbps) | 1.0000 | 91.9503 | 686.6935 |
| Packet Count (pkt/s) | 0.9999 | 0.0776 | 2.0357 |
| Link Utilization (%) | 0.9927 | 0.0517 | 0.3974 |

No se han publicado comparaciones con otros modelos en la información disponible. Los valores de R² son muy altos, lo que sugiere un ajuste casi perfecto sobre los datos de entrenamiento, aunque no se indica si estas métricas corresponden a validación o a test.

## Requisitos de hardware

- Al ser modelos de Gradient Boosting de scikit-learn, el sistema es extremadamente ligero y no requiere GPU.
- Puede ejecutarse en cualquier máquina con Python 3.x y las dependencias listadas (scikit-learn, pandas, numpy, matplotlib, joblib).
- El consumo de memoria es bajo, del orden de decenas de megabytes, incluso con capturas grandes.
- No se requieren servidores dedicados; un portátil o una Raspberry Pi son suficientes para inferencia.
- Para el entrenamiento, se desconoce el volumen de datos, pero al ser modelos clásicos, el entrenamiento también es factible en CPU.
- Opciones de despliegue: script CLI (`run.py`), integración en pipelines de datos con Python, o exportación de los modelos `.pkl` para usarlos en otros entornos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predicción de tráfico de red con Gradient Boosting). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se especifica la licencia del modelo ni de los datos de entrenamiento, lo que puede limitar su uso comercial sin consulta previa al autor.
- Las métricas reportadas (R² cercanos a 1) podrían indicar sobreajuste si no se ha realizado una validación adecuada; no se detalla la partición de datos.
- El sistema está diseñado específicamente para tráfico de red y no es generalizable a otros dominios.
- Depende de la calidad de las capturas de Wireshark; formatos de exportación distintos a los indicados pueden no ser compatibles.
- No se proporcionan garantías de precisión en entornos de producción con tráfico muy variable o no representativo del conjunto de entrenamiento.
- Al ser un modelo de regresión clásico, no ofrece explicaciones causales ni manejo de incertidumbre más allá de los intervalos de error estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ganesh-Nadkarni/network-traffic-prediction
- Directorio de modelos y artefactos: `kaggle_models/` (mencionado en la model card, sin URL directa)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
