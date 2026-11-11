# Karar-git/hack4dev-building-age-winners

## Resumen

`Karar-git/hack4dev-building-age-winners` es un conjunto de modelos tabulares, no un modelo de lenguaje, publicado por el usuario Karar-git como entrega del hackathon Hack4Dev 2026 (Iraq Hackathon 2026). Resuelve una tarea de teledetección: clasificar cada píxel de 30 m de Landsat en una de cuatro clases de antigüedad de edificio (1 a 4), entrenando con etiquetas de Madrid y transfiriendo a Ámsterdam bajo un protocolo de few-shot con entre 5 y 200 píxeles etiquetados por clase en la ciudad objetivo. La métrica oficial es el macro F1 sobre toda Ámsterdam.

El repositorio contiene el pipeline ganador (FINAL-2, añadido el 11 de noviembre de 2026) y los dos modelos LightGBM de la primera versión, junto con código, datos y cuadernos para reproducirlos. FINAL-2 combina un ancla zero-shot XGBoost con DANN (diseño de un compañero de equipo, reimplementado en CPU) y un LightGBM con copias de dominio al estilo de Daumé, promediando log-probabilidades con un peso fijo dependiente de n y aplicando suavizado espacial y una regla de decisión calibrada sobre Madrid.

La relevancia es acotada pero concreta: es un ejemplo reproducible de adaptación de dominio en clasificación tabular sobre datos satelitales, con una tabla de ablaciones honesta y advertencias explícitas sobre la selección de modelos hecha sobre la ciudad de test. No es un modelo generativo ni tiene capacidades de lenguaje, visión general o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM y XGBoost) sobre features tabulares derivadas de Landsat; ensemble de dos modelos con regla de decisión |
| Parametros totales | no disponible (no se publica recuento de parámetros; el repo ocupa 0.3 GB incluyendo datos y cuadernos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular por píxel, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la tarea no es lingüística) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería `lightgbm`; el repo incluye código y datos, no se detalla el formato de serialización de los modelos) |

## Arquitectura y entrenamiento

El pipeline FINAL-2 es un ensemble de dos clasificadores tabulares. El primero es un ancla zero-shot: un XGBoost con adaptación de dominio adversarial (DANN) sobre las 60 features proporcionadas por los organizadores, entrenado con etiquetas de Madrid y features no etiquetadas de Ámsterdam, sin ver nunca una etiqueta de Ámsterdam. El segundo es un LightGBM con "copias de dominio" de Daumé: las 120 features más importantes reciben dos copias adicionales, una rellenada solo en filas de Madrid y otra solo en filas de Ámsterdam. Las log-probabilidades de ambos modelos se promedian con peso 10/(n+10) para el ancla zero-shot y el resto para el LightGBM, sin ajuste de pesos.

Sobre la predicción combinada se aplica un suavizado espacial con los vecinos del píxel (radio de 6 píxeles, configuración del compañero de equipo elegida sobre Madrid) y una regla de decisión: ajuste de logit con tau = 0.5 usando el prior de clases de Madrid, seguido del plug-in de macro F1. La regla se eligió sobre Madrid. El entrenamiento y la inferencia corren en CPU de portátil; una ejecución de un sorteo tarda entre uno y dos minutos. El autor informa de que se puntuaron unas 130 variantes en una noche, incluyendo redes neuronales con backbone congelado, metric learning, SVMs y otros modelos clásicos.

## Capacidades

- Clasificación tabular multiclase de píxeles Landsat de 30 m en cuatro clases de antigüedad de edificio, con definiciones distintas por ciudad (Madrid: antes de 1960, 1960-1984, 1984-2004, 2004-2024; Ámsterdam: antes de 1945, 1945-1984, 1984-2004, 2004-2024).
- Transferencia de dominio Madrid a Ámsterdam mediante DANN y copias de dominio de Daumé.
- Aprendizaje few-shot: admite entre 5 y 200 píxeles etiquetados por clase en la ciudad objetivo, con pesos del ensemble ajustados de forma fija a n.
- Suavizado espacial de probabilidades por vecindad de píxeles (radio 6), que requiere coordenadas de píxel.
- Regla de decisión calibrada para macro F1 con ajuste de prior de clases.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Inventario de antigüedad del parque edificado a escala municipal: el pipeline clasifica píxeles Landsat de 30 m en cuatro cohortes temporales, útil para planificación urbana y estudios de expansión residencial donde no hay catastro completo.
- Transferencia a una ciudad nueva con presupuesto de etiquetado mínimo: el protocolo few-shot con 5 a 200 píxeles por clase permite adaptar el modelo a una ciudad distinta de Madrid con un esfuerzo de anotación de horas, no de meses.
- Monitorización de la huella construida en series temporales: al trabajar sobre Landsat, permite repetir la clasificación en distintas fechas y detectar cambios en la composición de edades del suelo urbanizado.
- Línea base reproducible para investigación en adaptación de dominio: el repositorio incluye código, datos y cuadernos, y la tabla de ablaciones con siete sorteos permite comparar métodos nuevos bajo el mismo protocolo.
- Selección de features y diagnóstico de dominio: las copias de dominio de Daumé sobre las 120 features más importantes son un mecanismo barato y reutilizable para otros problemas de clasificación tabular con shift entre regiones.
- Prototipado en CPU sin GPU: el pipeline completo se ejecuta en un portátil en uno o dos minutos por sorteo, lo que lo hace apto para entornos con recursos limitados y para docencia.

## Benchmarks y rendimiento

Macro F1 sobre toda Ámsterdam, media de los sorteos 5 a 11 (siete por cada n), según la model card:

| Pipeline | n=5 | n=25 | n=50 | n=100 | n=200 | Media |
|---|---|---|---|---|---|---|
| FINAL-2 con suavizado de vecinos | 0.672 | 0.705 | 0.716 | 0.732 | 0.744 | 0.714 |
| FINAL-2 sin coordenadas (sin suavizado) | 0.652 | 0.694 | 0.702 | 0.720 | 0.734 | 0.700 |
| LightGBM con copias de dominio, con suavizado | 0.623 | 0.699 | 0.712 | 0.730 | 0.744 | 0.702 |
| LightGBM con copias de dominio, sin suavizado | 0.607 | 0.687 | 0.698 | 0.718 | 0.734 | 0.689 |
| Ensemble de cinco modelos de la ronda 1 + label propagation, con suavizado | 0.677 | 0.705 | 0.714 | 0.725 | 0.728 | 0.710 |
| LightGBM reentrenado (primera versión), con suavizado | 0.587 | 0.652 | 0.680 | 0.712 | 0.732 | 0.673 |
| LightGBM reentrenado (primera versión), sin suavizado | 0.559 | 0.629 | 0.660 | 0.697 | 0.721 | 0.653 |
| XGBoost + DANN zero-shot del compañero, con suavizado y regla propia | 0.654 | 0.653 | 0.653 | 0.652 | 0.651 | 0.653 |

Desviación típica de FINAL-2 sobre los siete sorteos: 0.007 / 0.012 / 0.015 / 0.004 / 0.003 para n = 5 / 25 / 50 / 100 / 200. El ancla zero-shot aporta unos 0.05 de mejora a n=5 y nada a n=200 frente al LightGBM con copias de dominio. La ventaja sobre el ensemble de la ronda 1 es de 0.004 de media, dentro del ruido de los sorteos.

## Requisitos de hardware

- Inferencia en CPU: el pipeline está diseñado para ejecutarse en CPU de portátil; una ejecución por sorteo tarda entre uno y dos minutos.
- VRAM: no aplica, no requiere GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo de consumo: el requisito práctico es memoria RAM para cargar features y datos, no GPU.
- Despliegue: scripts de Python del propio repositorio (`tools/nnlab/model_create2.py`), con API `model_create(shot_idx, shot_labels).predict()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de throughput; el autor solo indica el tiempo de ejecución por sorteo y recomienda fijar `NNLAB_THREADS` al número de núcleos, ya que el valor por defecto es 3.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque de adaptación | Contexto de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FINAL-2 (este repo) | Ensemble XGBoost-DANN + LightGBM con copias de dominio | DANN + Daumé + suavizado espacial | Few-shot Madrid a Ámsterdam, macro F1 0.714 de media | no disponible | Hugging Face |
| Ensemble de cinco modelos de la ronda 1 + label propagation | Ensemble clásico | Label propagation | Mismo protocolo, macro F1 0.710 de media | no disponible | Incluido en el repo |
| LightGBM reentrenado de la primera versión | Gradient boosting simple | Sin adaptación de dominio explícita | Mismo protocolo, macro F1 0.673 de media | no disponible | Incluido en el repo |
| XGBoost + DANN zero-shot del compañero | Gradient boosting con DANN | DANN | Mismo protocolo, macro F1 0.653 de media | no disponible | Reimplementado en `tools/compare_teammate.py` |

No se proporcionan comparaciones con modelos externos al hackathon.

## Limitaciones y advertencias

- La selección de modelos se hizo sobre Ámsterdam: unas 130 variantes se puntuaron sobre toda la ciudad en los sorteos 0 a 4, y la combinación de dos modelos se eligió sobre la mitad de la ciudad. Solo los sorteos 5 a 11 quedaron libres de selección, y FINAL-2 rinde 0.005 menos en ellos que en los sorteos 0 a 4; la revisión estima entre 0.005 y 0.01 de optimismo para las mejores opciones.
- La regla de decisión y el radio de suavizado se eligieron sobre Madrid, no sobre Ámsterdam, pero el suavizado requiere coordenadas de píxel; sin coordenadas debe citarse la fila de 0.700, no la de 0.714.
- El pipeline consume más información no etiquetada de la ciudad objetivo que un baseline simple: el DANN del ancla se entrena contra features no etiquetadas de Ámsterdam y cada ciudad se escala con sus propias estadísticas, lo que complica la comparación justa con métodos que no usan datos no etiquetados.
- El modelo es de nivel de lote: la evaluación y la decisión se aplican sobre conjuntos de píxeles, no sobre instancias individuales aisladas.
- Las definiciones de clase difieren entre ciudades (la clase 1 es "antes de 1945" en Ámsterdam y "antes de 1960" en Madrid), lo que introduce un desajuste semántico en la transferencia.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- No se documentan sesgos demográficos ni geográficos más allá del shift Madrid-Ámsterdam, ni tasas de alucinación, que no aplican a un clasificador tabular.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karar-git/hack4dev-building-age-winners
- Informe completo del pipeline: `reports/nnlab/OVERNIGHT_RESULTS.md` (incluido en el repositorio)
- Gráfica de macro F1 frente al presupuesto de etiquetado: `reports/nnlab/f1_vs_n_overnight.png` (incluida en el repositorio)
- Script de ejecución: `tools/nnlab/model_create2.py` (incluido en el repositorio)
- Comparación con el diseño del compañero de equipo: `tools/compare_teammate.py` (incluido en el repositorio)
