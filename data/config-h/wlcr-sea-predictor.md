# config-h/WLCR-SEA-Predictor

## Resumen

WLCR-SEA (Window-Local Context Representation with Seasonal Expert Attention) es un modelo de predicción de tráfico celular desarrollado por config-h (Minghao Kong). Está diseñado para realizar pronósticos a nivel de celda a partir de una ventana de historial de 336 horas y una máscara de observación, generando predicciones para las siguientes 24 horas en cuatro indicadores: usuarios activos de enlace ascendente y descendente, y utilización de PRB (Physical Resource Block) en ambos sentidos. El modelo emplea una arquitectura basada en atención con ocho expertos estacionales inspeccionables, enrutamiento Entmax consciente de fiabilidad y un residual acotado. Se distribuye como un conjunto (ensemble) de cinco miembros predeclarados, cada uno con una semilla y configuración específicas, y está pensado para investigación y reproducibilidad en el ámbito de redes móviles. Su relevancia radica en abordar la predicción de tráfico a nivel de celda con un enfoque modular y transparente, facilitando la interpretación de los componentes estacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Window-Local Context Representation with Seasonal Expert Attention (ocho expertos estacionales, enrutamiento Entmax, residual acotado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | 336 horas de historial (entrada) y 24 horas de predicción (salida) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (pickle-based) |

## Arquitectura y entrenamiento

La arquitectura de WLCR-SEA se basa en una representación de contexto local por ventana combinada con atención de expertos estacionales. El modelo procesa una secuencia ordenada de 336 horas de historial de tráfico junto con una máscara de observación que indica qué valores están disponibles. Internamente, enruta la información entre ocho expertos estacionales mediante un mecanismo de enmascaramiento de disponibilidad dura y un enrutamiento Entmax que tiene en cuenta la fiabilidad de cada experto. Además, incorpora un residual acotado para estabilizar el entrenamiento. El modelo se entrena para predecir los siguientes 24 pasos horarios en cuatro indicadores de tráfico. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de regresión supervisada. El repositorio incluye cinco checkpoints correspondientes a un ensemble primario denominado `A6_mixed_aug`, cada uno con una semilla y configuración distintas (por ejemplo, `d16_h32_lr1e3_delta025` o `d32_h64_lr5e4_delta050`), lo que sugiere un entrenamiento con variaciones de hiperparámetros y aumentación de datos.

## Capacidades

- Predicción de series temporales de tráfico celular a nivel de celda, con salida de 24 horas futuras.
- Manejo de máscaras de observación, lo que permite trabajar con historiales incompletos o con huecos.
- Generación de pronósticos para cuatro indicadores: usuarios activos en enlace ascendente y descendente, y utilización de PRB en ambos sentidos.
- Enrutamiento interpretable entre ocho expertos estacionales, lo que facilita la inspección de qué componente estacional contribuye a cada predicción.
- Soporte de ensemble: el modelo se distribuye con cinco miembros que pueden promediarse para obtener una predicción agregada.
- No es un modelo de lenguaje ni multimodal; su ámbito se limita a forecasting de tráfico de red.

## Casos de uso

- Planificación de capacidad en redes móviles: el modelo puede anticipar picos de demanda de usuarios y utilización de PRB, permitiendo a los operadores dimensionar recursos de radio y backhaul con antelación.
- Gestión dinámica de recursos: con predicciones a 24 horas, se pueden programar políticas de asignación de ancho de banda o activación de celdas adicionales en horas de alta carga.
- Optimización energética: las predicciones de tráfico permiten apagar o reducir potencia en celdas de baja demanda, contribuyendo a la eficiencia energética de la red.
- Detección de anomalías: al comparar las predicciones con el tráfico real observado, se pueden identificar desviaciones que indiquen fallos de red, congestiones inesperadas o eventos atípicos.
- Investigación académica: el modelo sirve como referencia reproducible para estudios sobre forecasting de tráfico celular, gracias a su arquitectura modular y a la disponibilidad de checkpoints y código fuente.
- Simulación de escenarios de red: los pronósticos pueden integrarse en simuladores de redes para evaluar el impacto de cambios de configuración o de políticas de gestión antes de su implementación.

## Benchmarks y rendimiento

En la evaluación registrada del proyecto, el ensemble primario de cinco semillas reportó los siguientes valores de WAPE (Weighted Absolute Percentage Error) sobre el flujo de trabajo de validación:

| Métrica | Valor |
|---|---|
| WAPE macro-cell | 0.177612 |
| WAPE pooled | 0.184915 |
| WAPE macro-indicator | 0.195511 |

Estos resultados están ligados al dataset y protocolo específicos del proyecto y no deben interpretarse como garantías generales de despliegue. No se han publicado comparaciones con otros modelos de forecasting en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que el repositorio tiene un tamaño de 0.0 GB y los checkpoints son archivos `.pt` de un modelo de series temporales relativamente pequeño, es probable que la inferencia pueda ejecutarse en CPU sin necesidad de GPU.
- El modelo está diseñado para cargarse en CPU (el ejemplo de carga usa `device="cpu"`), lo que sugiere que es ligero y adecuado para entornos sin aceleración.
- Para el ensemble completo (cinco miembros), se requeriría cargar cinco checkpoints y promediar sus salidas, lo que sigue siendo factible en CPU.
- No se dispone de datos sobre latencia o throughput; se recomienda realizar pruebas locales para estimar el rendimiento en el hardware objetivo.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de predicción de tráfico celular en la información disponible. Alternativas genéricas en el ámbito de forecasting de series temporales (como DeepAR, Prophet o N-BEATS) podrían ser comparables en tarea, pero no se dispone de datos de rendimiento específicos para este contexto. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo no es un predictor general de series temporales; está especializado en tráfico celular y requiere validación en la red objetivo antes de uso operativo.
- No incluye datos de entrenamiento en el repositorio, por lo que la reproducibilidad completa depende del acceso al dataset original, que no se proporciona.
- Los checkpoints `.pt` utilizan serialización pickle, lo que implica riesgos de seguridad si se cargan archivos de fuentes no confiables. Se recomienda verificar las sumas de verificación (SHA256SUMS) y cargar solo desde fuentes oficiales.
- Los valores de WAPE reportados están ligados a un protocolo de evaluación concreto y pueden no generalizar a otras redes o condiciones de tráfico.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de una región concreta (etiqueta `region:us`), podría presentar sesgos geográficos o demográficos en sus predicciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe tener en cuenta que el modelo no ofrece garantías de rendimiento y que su uso en producción requiere una validación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/config-h/WLCR-SEA-Predictor
- Repositorio GitHub: https://github.com/rudykon/WLCR-SEA_Predictor
- Perfil del autor en GitHub: https://github.com/rudykon
