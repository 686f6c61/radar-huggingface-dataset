# Sejibeji/tso-foundation-v14

## Resumen

TSO Foundation Model v14 es un modelo fundacional para series temporales desarrollado por Sejibeji, diseñado para realizar pronósticos en dominios diversos sin necesidad de entrenamiento específico por serie. A diferencia de los enfoques convencionales que tokenizan los valores numéricos, este modelo aprende la geometría subyacente de los sistemas dinámicos mediante operadores de Koopman, lo que permite transferir conocimiento entre series de diferentes dominios (electricidad, meteorología, ECG, finanzas, epidemiología, economía, física solar y sistemas caóticos). El modelo se presenta como una solución zero-shot: para una serie nueva, el operador de Koopman se ajusta en forma cerrada sobre el latente congelado, sin pasos de gradiente.

La arquitectura combina embeddings de Takens, un espacio de escalas con covarianza forzada, un encoder profundo que linealiza la dinámica en un espacio latente de 256 dimensiones y una cabeza convolucional que clasifica la flecha del tiempo. El entrenamiento se realizó con 40 series reales de 8 dominios, usando cuatro pretextos auto-supervisados, durante 25.000 iteraciones en CPU. El modelo es relevante porque demuestra que es posible redescubrir estructuras periódicas conocidas, como el ciclo solar de Schwabe de ~11 años, a partir de un análisis espectral de los valores propios de Koopman, sin supervisión explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador de Koopman con embeddings de Takens, espacio de escalas, encoder profundo y cabeza de flecha del tiempo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (series temporales, sin ventana fija especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque el modelo opera sobre series numéricas, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se menciona un archivo .pt, pero no se especifica el formato estándar) |

## Arquitectura y entrenamiento

El modelo se basa en la teoría de operadores de Koopman para transformar una dinámica no lineal en una representación lineal en un espacio latente. El pipeline consta de cuatro etapas: primero, la serie cruda se convierte en embeddings de Takens mediante retardo temporal (con un tau específico por serie); segundo, se construye un espacio de escalas con versiones finas y renormalizadas de los embeddings, donde una capa `scale_map` impone covarianza de escala, lo que permite que periodos largos como el ciclo solar aparezcan como modos propios limpios en escalas gruesas; tercero, un encoder profundo (latent 256, hidden 768) aplana el atractor no lineal en un espacio donde la dinámica es aproximadamente lineal, representada por la matriz K; cuarto, una cabeza convolucional clasifica ventanas temporales hacia adelante vs. invertidas, implementando el pretexto de la flecha del tiempo.

El entrenamiento utiliza cuatro objetivos auto-supervisados: reconstrucción, dinámica lineal de Koopman (con peso `dyn_w=2.5`), covarianza de escala y flecha del tiempo. El corpus de entrenamiento incluye 40 series reales de 8 dominios, complementadas con una batería de 192 series sintéticas de dinámica variada. El entrenamiento se realizó durante 25.000 iteraciones en CPU (8 núcleos). La innovación clave es que la transferencia a una serie nueva no requiere ajuste fino: se ajusta un operador de Koopman en forma cerrada (con regularización ridge) sobre el latente congelado, y se proyecta la trayectoria sobre el atractor observado mediante una envolvente.

## Capacidades

- Pronóstico de series temporales en múltiples dominios sin entrenamiento específico (zero-shot).
- Ajuste en forma cerrada del operador de Koopman sobre el latente congelado, sin pasos de gradiente.
- Redescubrimiento de estructuras periódicas a partir de los valores propios de Koopman (por ejemplo, el ciclo solar de ~11 años).
- Detección de la flecha del tiempo (clasificación de ventanas temporales hacia adelante vs. invertidas) con una precisión del 90.0%.
- Manejo de series de cualquier dominio y frecuencia de muestreo, según la documentación.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente para series temporales univariantes.

## Casos de uso

- Predicción de demanda eléctrica: el modelo puede pronosticar la carga eléctrica a corto y medio plazo sin recalibrar por cada subestación, gracias a su capacidad zero-shot y a la inclusión de series de redes eléctricas en el pretraining.
- Previsión meteorológica local: series de temperatura, presión o precipitación pueden ser pronosticadas con el ajuste en forma cerrada, útil para estaciones con datos históricos limitados.
- Monitorización de señales biomédicas: el modelo puede aplicarse a series de ECG para detectar anomalías o prever tendencias, aprovechando la representación de la dinámica cardíaca en el espacio de Koopman.
- Análisis financiero de bajo riesgo: para activos con dinámica estable (no criptomonedas con spikes), el modelo ofrece pronósticos de referencia que superan a la persistencia en la mediana de los casos.
- Vigilancia epidemiológica: series de incidencia de enfermedades pueden ser modeladas para anticipar picos, aunque la advertencia del autor indica que series con picos extremos (como covid-india) siguen siendo difíciles.
- Estudio de ciclos solares y astrofísica: el modelo puede identificar periodicidades en series de manchas solares u otros indicadores, como demuestra el redescubrimiento del ciclo de Schwabe, útil para investigación sin supervisión.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para la versión v14 (latent 256, hidden 768, 25.000 iteraciones, CPU 8 núcleos):

| Metrica | Valor |
|---|---|
| Victorias zero-shot vs. GRU por serie (40 series, in-kernel) | 31/40 (77.5%) |
| Mediana de habilidad congelada vs. persistencia | +1.8% (GRU: -60.6%) |
| Redescubrimiento del ciclo solar (serie de manchas solares fuera de entrenamiento) | 128 meses vs. 132 conocidos (10.7 años) |
| Precision del pretexto de flecha del tiempo | 90.0% |

No se han publicado resultados comparativos con otros modelos fundacionales de series temporales (como Chronos, TimesFM o Lag-Llama) en la información disponible. Los benchmarks se limitan a la comparación con GRU y persistencia.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Dado el tamaño reducido (latent 256, hidden 768), el modelo es ligero y probablemente puede ejecutarse en CPU sin GPU, como se hizo durante el entrenamiento (Kaggle CPU de 8 núcleos).
- Para inferencia, es plausible que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superiores) e incluso en memoria RAM de un portátil, pero no hay datos oficiales de VRAM.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el código de ejemplo usa PyTorch directamente con `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos fundacionales de series temporales en la información proporcionada. La única comparación reportada es contra GRU y persistencia, que no son modelos fundacionales. Por tanto, no es posible realizar una comparativa cuantitativa con alternativas como Chronos, TimesFM o Lag-Llama. Se recomienda consultar la literatura académica para una evaluación externa.

## Limitaciones y advertencias

- Series con picos extremos o raíz unitaria cercana (por ejemplo, Dogecoin o covid-india) superan la capacidad del modelo; en esos casos, la persistencia es imbatible.
- El rendimiento del modelo se satura alrededor de 25.000 iteraciones de pretraining; aumentar las iteraciones no mejora la transferencia, sino que los factores limitantes son la capacidad del modelo y la amplitud del corpus.
- Los pretextos auto-supervisados solo aportan beneficios por encima de ~15.000 iteraciones; por debajo de ese umbral, el modelo no converge adecuadamente.
- El modelo se entrenó con 40 series reales, lo que limita la generalización a dominios no representados en el corpus.
- No hay información sobre sesgos específicos, pero al ser un modelo de series temporales, el riesgo de alucinación se traduce en pronósticos erróneos en regímenes no vistos.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de precisión en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Sejibeji/tso-foundation-v14
- Dataset de entrenamiento: https://huggingface.co/datasets/sehajrsingh/tso-foundation-corpus-v11 (referenciado en la model card)
- No se proporcionan otros enlaces (paper, repositorio o demo) en la información disponible.
