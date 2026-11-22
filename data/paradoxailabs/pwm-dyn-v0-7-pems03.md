# PARADOXAIlabs/pwm-dyn-v0.7-pems03

## Resumen

PWM-Dyn v0.7 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su familia Paradox World Model. Se trata del modelo número 15 de una serie de 56 publicados (con numeración 01–59) y está especializado en una tarea muy concreta: predecir los siguientes 12 pasos temporales de tráfico viario en la red de sensores PEMS03 (Distrito 3 de Caltrans, 358 sensores) incluso cuando se producen caídas de sensores.

El modelo es extremadamente compacto: 341.156 parámetros totales, lo que lo sitúa en la categoría de modelos ligeros diseñados para despliegue en entornos con recursos limitados. No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo dinámico especializado en forecasting espaciotemporal, empaquetado como checkpoint de PyTorch con metadatos, configuración y resultados embebidos en el propio fichero.

Su relevancia radica en el enfoque de robustez ante fallos de infraestructura: la versión v0.7 introduce entrenamiento específico para outages (caídas de sensores) y una estrategia de fallback, logrando reducciones de error del 11 al 22 % en condiciones de caída real frente a v0.6 en cinco redes, con un coste mínimo en condiciones limpias (+0,4 a +1,8 %). Esto lo hace interesante para operadores de tráfico que necesitan predicciones fiables incluso con telemetría incompleta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo dinámico espaciotemporal, código en repositorio GitHub) |
| Parámetros totales | 341.156 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 12 pasos) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un dict con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo dinámico espaciotemporal de la familia PWM-Dyn, implementado en PyTorch. El código de la arquitectura reside en el repositorio GitHub del proyecto y la configuración exacta de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. El modelo opera sobre grafos de sensores (358 en PEMS03) y produce predicciones de 12 pasos temporales.

El entrenamiento se realizó el 4 de noviembre de 2026 en un notebook de Kaggle (versión 365414722, commit b0f6a08) y el modelo se publicó el 17 de noviembre de 2026. La innovación principal de esta versión es la incorporación de entrenamiento con caídas de sensores reales y una estrategia de fallback, que según la model card reduce el error en outages reales entre un 11 y un 22 % respecto a v0.6 en cinco redes, con un incremento de solo 0,4–1,8 % en condiciones limpias. Los datos de entrenamiento no se distribuyen; sus fuentes y términos se documentan en `DATA_SOURCES.md`.

## Capacidades

- Predicción de los siguientes 12 pasos temporales de tráfico viario sobre la red PEMS03 (358 sensores).
- Robustez ante caídas de sensores (outages): entrenamiento específico y mecanismo de fallback.
- Forecasting espaciotemporal multi-sensor con dependencias entre estaciones.
- Evaluación mediante ParadoxBench-1.2 (métricas MAE en condiciones limpias y con outages reales).
- Empaquetado autocontenido: el checkpoint incluye metadatos, configuración, pesos y todos los resultados registrados.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Gestión de tráfico en tiempo real: el modelo predice los próximos 12 pasos de ocupación/velocidad en 358 sensores, permitiendo a los operadores anticipar congestión en el Distrito 3 de Caltrans y activar medidas de gestión antes de que se materialice el problema.
- Tolerancia a fallos de telemetría: cuando una estación deja de reportar, el mecanismo de fallback y el entrenamiento con outages permiten mantener predicciones útiles (MAE 18,39 en Track G frente a 14,60 en limpio), evitando que un sensor caído degrade toda la predicción de la red.
- Alimentación de sistemas de enrutamiento dinámico: las predicciones a 12 pasos pueden integrarse en motores de navegación o señalización adaptativa que necesiten estimaciones a corto plazo del estado de la red viaria.
- Investigación en forecasting espaciotemporal: con 341.156 parámetros y licencia Apache-2.0, sirve como baseline ligero y reproducible para comparar arquitecturas en PEMS03 sin requerir grandes recursos de cómputo.
- Despliegue en dispositivos de borde: el tamaño ínfimo del modelo (1,4 MB de checkpoint) permite ejecutarlo en hardware modesto dentro de gabinetes de control de tráfico o unidades de carretera, sin dependencia de GPU dedicada.
- Evaluación de robustez ante datos faltantes: el modelo es útil como referencia para estudiar cómo afectan los outages a la calidad de predicción en redes de sensores, gracias a los resultados registrados por seed y track en el propio checkpoint.
- Prototipado rápido en cuadernos: el flujo de carga documentado (`hf_hub_download` + `torch.load`) permite reproducir resultados y hacer fine-tuning sobre otras redes de sensores en pocos minutos.

## Benchmarks y rendimiento

| Benchmark / condición | Métrica | Resultado |
|---|---|---|
| ParadoxBench-1.2, test limpio | MAE | 14,60 |
| ParadoxBench-1.2, outages reales (Track G) | MAE | 18,39 |
| Configuración | — | Ensemble de 3 seeds (este fichero es seed 200) |

No se han publicado resultados de benchmarks adicionales (comparativas con otros modelos, otros datasets) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.399.041 bytes (1,4 MB) y el modelo tiene 341.156 parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU, en iGPU y en GPUs de gama baja (GTX 1650, RTX 3050) sin problema.
- Cabe en consumer GPU: sí, en todas, con margen de sobra.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pt`), exportación a TorchScript o ONNX (no documentada pero viable por el tamaño), y ejecución en CPU para entornos de borde.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, se espera latencia de milisegundos en CPU para un forward pass sobre 358 sensores.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS03) | 341.156 | Forecasting tráfico PEMS03 con outages | 12 pasos | Apache-2.0 | Hugging Face + GitHub |
| PWM-Dyn v0.6 | no disponible | Forecasting tráfico | 12 pasos | Apache-2.0 | Hugging Face (versión anterior) |
| PWM-Dyn v0.7 (PEMS04) | no disponible | Forecasting tráfico PEMS04 | 12 pasos | Apache-2.0 | Hugging Face (modelo #14 de la serie) |
| PWM-Dyn v0.7 (PEMS07) | no disponible | Forecasting tráfico PEMS07 | 12 pasos | Apache-2.0 | Hugging Face (modelo #16 de la serie) |

No se dispone de datos de benchmarks de modelos externos (por ejemplo, STGCN, Graph WaveNet, DCRNN) en la información proporcionada, por lo que no es posible establecer una comparativa numérica con alternativas de la literatura.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para PEMS03 (358 sensores del Distrito 3 de Caltrans); su transferencia a otras redes requiere fine-tuning y no está garantizada.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio; cualquier uso fuera de forecasting espaciotemporal es inadecuado.
- Horizonte limitado: solo predice 12 pasos temporales; no está diseñado para predicciones de largo plazo.
- El rendimiento en outages (MAE 18,39) es notablemente peor que en condiciones limpias (MAE 14,60), por lo que la incertidumbre aumenta cuando falla la telemetría.
- Los datos de entrenamiento no se distribuyen; la reproducibilidad completa depende de las fuentes documentadas en `DATA_SOURCES.md` y de la configuración embebida en el checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al entrenado.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de predicciones espurias si la topología de sensores o la distribución del tráfico difieren de las de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse solo con datos de California, puede no representar patrones de tráfico de otras regiones o países.
- El checkpoint se carga con `weights_only=False`, lo que implica ejecución de código pickle; conviene auditar el fichero antes de cargarlo en entornos de producción no confiables.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems03
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados completos: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentación v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#14, PEMS04): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems04
- Modelo siguiente (#16, PEMS07): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems07
- Colección completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
