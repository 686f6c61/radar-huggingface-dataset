# albertooooz/chronos-2-small-lora-crypto-hourly

## Resumen

Chronos-2-small LoRA — hourly crypto prices es un adaptador LoRA publicado por el usuario albertooooz sobre el modelo fundacional de series temporales `autogluon/chronos-2-small`. Su propósito es la previsión univariante del precio de cierre horario de criptomonedas a 24 horas vista, entrenado específicamente sobre 25 series de precio medio de perpetuos de Hyperliquid. No es un modelo autónomo: requiere cargarse junto al modelo base mediante la pipeline de Chronos-2, que fusiona los pesos LoRA automáticamente.

El adaptador emplea un rango LoRA de 8 con alpha 16 sobre los módulos de atención y la capa de salida del patch embedding, con una longitud de contexto de 2048 pasos horarios y un horizonte de predicción de 24. El entrenamiento se realizó durante 5000 pasos con batch de 64 y learning rate de 1e-5 sobre 597.753 filas horarias que cubren desde mayo de 2023 hasta octubre de 2026.

Su relevancia es acotada y experimental: los resultados publicados muestran mejoras marginales frente al modelo base zero-shot (MASE de 0,701 frente a 0,713; acierto direccional del 46,9% frente al 43,1%), lo que lo sitúa lejos de constituir una señal de trading. Resulta útil como ejemplo reproducible de fine-tuning LoRA sobre modelos fundacionales de series temporales en un dominio financiero concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo fundacional de series temporales Chronos-2-small |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no declara cifra en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 pasos horarios |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `autogluon/chronos-2-small`, un modelo fundacional de previsión de series temporales de la familia Chronos-2. Los módulos objetivo del LoRA son `self_attention.q/k/v/o` y `output_patch_embedding.output_layer`, con rango r=8 y alpha=16. La configuración de fine-tuning incluye learning rate de 1e-5, 5000 pasos, batch size de 64, contexto de 2048 y horizonte de predicción de 24. El entrenamiento se ejecutó en una NVIDIA RTX PRO 4500 Blackwell en RunPod.

Los datos de entrenamiento provienen del precio medio de perpetuos de Hyperliquid para 25 criptomonedas (APE, ARB, ATOM, AVAX, BNB, BTC, CFX, CRV, DOGE, DYDX, ETH, FTM, GMX, INJ, LDO, LINK, LTC, MATIC, OP, RNDR, SNX, SOL, STX, SUI, kPEPE), agregados de precios por minuto a frecuencia horaria. El conjunto contiene 597.753 filas que abarcan del 20 de mayo de 2023 al 11 de octubre de 2026, con los últimos seis meses naturales (desde el 1 de mayo de 2026) reservados como holdout. Se descartan las colas de precio congeladas tras el deslisting de activos. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de previsión numérica.

## Capacidades

- Previsión univariante del precio de cierre horario a 24 horas vista para las 25 criptomonedas del panel de entrenamiento.
- Generación de predicciones por cuantiles (la evaluación usa el cuantil mediano).
- Integración con la pipeline `Chronos2Pipeline` de la librería `chronos-forecasting`, que fusiona los pesos LoRA automáticamente.
- Entrada en formato tridimensional `(n_series, n_variates, history_length)` con `prediction_length` configurable.
- Soporte de pronóstico multi-serie en una sola llamada (dimensión `n_series`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente numérico de series temporales.

## Casos de uso

- Investigación en previsión financiera: sirve como punto de partida reproducible para estudiar el efecto del fine-tuning LoRA sobre modelos fundacionales de series temporales en datos de criptomonedas, con hiperparámetros y partición train/holdout documentados.
- Prototipado de pipelines de forecasting horario: permite montar rápidamente un servicio que reciba las últimas 2048 horas de precio y devuelva 24 predicciones, útil para validar infraestructura antes de invertir en modelos propios.
- Benchmarking de modelos fundacionales: al incluir métricas frente a Chronos-2 zero-shot, Chronos-2-small zero-shot y Kronos-base, facilita comparaciones internas sobre el mismo panel de 22 monedas.
- Análisis de riesgo exploratorio: las predicciones por cuantiles permiten estimar bandas de incertidumbre a 24 horas para estudios de volatilidad, siempre con la advertencia de que el acierto direccional ronda el 50%.
- Docencia y divulgación: ejemplo completo de fine-tuning PEFT sobre un modelo de series temporales, con configuración LoRA, datos y evaluación walk-forward documentados.
- Generación de features sintéticas: las salidas del modelo pueden emplearse como variables auxiliares en modelos secundarios de investigación, no como señal de ejecución.

## Benchmarks y rendimiento

Evaluación walk-forward sobre los seis meses de holdout, con 2 días de origen aleatorios por mes natural, horizonte de 24 horas, `random_seed=42` y 132 folds sobre las 22 monedas con precio medio vivo. Chronos usa las últimas 2048 cierres y el cuantil mediano; Kronos-base usa las últimas 512 barras OHLC sin volumen y la media de 3 trayectorias muestreadas.

| Modelo | MASE | Acierto direccional 24h | Error absoluto de log-return 24h |
|---|---:|---:|---:|
| chronos-2 zero-shot | 0,686 | 46,2% | 0,0216 |
| chronos-2 LoRA | 0,681 | 50,0% | 0,0213 |
| chronos-2-small zero-shot | 0,713 | 43,1% | 0,0223 |
| **chronos-2-small LoRA** | **0,701** | **46,9%** | **0,0219** |
| Kronos-base | 0,975 | 45,4% | 0,0434 |

El MASE emplea una escala naive estacional de 24 horas. El acierto direccional es el signo del cierre 24 horas después y el error de log-return es el error absoluto de ese mismo retorno logarítmico. Los resultados estructurados están en `eval_results.json` del repositorio.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa espacio despreciable (el repositorio figura con 0.0 GB); el coste real corresponde al modelo base Chronos-2-small.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del modelo base y del número de series procesadas simultáneamente.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 4500 Blackwell (RunPod).
- No se especifican GPU recomendadas para inferencia ni si cabe en GPU de consumo; el tamaño del modelo base no se detalla en la información disponible.
- Opciones de despliegue: pipeline `chronos-forecasting` con `peft` y `torch` (`pip install chronos-forecasting peft torch`), cargando el adaptador mediante `Chronos2Pipeline.from_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | MASE (holdout) | Acierto direccional | Licencia |
|---|---|---|---:|---:|---|
| chronos-2-small LoRA (este) | LoRA sobre Chronos-2-small | 2048 pasos | 0,701 | 46,9% | Apache 2.0 |
| chronos-2-small zero-shot | Modelo base sin ajuste | 2048 pasos | 0,713 | 43,1% | Apache 2.0 (modelo base) |
| chronos-2 zero-shot | Modelo fundacional mayor | 2048 pasos | 0,686 | 46,2% | No disponible |
| Kronos-base | Modelo de previsión con OHLC | 512 barras | 0,975 | 45,4% | No disponible |

La comparación con Kronos-base no es un bake-off de entradas idénticas: Kronos ve OHLC y un contexto más corto. chronos-2 zero-shot supera en MASE al adaptador LoRA de este repositorio, lo que sugiere que el ajuste no compensa la diferencia de tamaño frente al modelo fundacional mayor.

## Limitaciones y advertencias

- Las tasas de acierto direccional están cerca del 50% y no constituyen una señal de trading; el autor lo advierte explícitamente.
- La evaluación se realiza sobre 22 monedas, excluyendo FTM, MATIC y RNDR, y no es un backtest de trading con costes, slippage ni liquidez.
- La comparación con Kronos-base usa entradas distintas (OHLC frente a cierre, contexto de 512 frente a 2048), por lo que la tabla es una comparación de tareas, no de modelos con idénticos inputs.
- Una hora faltante se rellena de forma plana; huecos mayores se descartan, lo que puede introducir sesgo en series con interrupciones.
- El modelo solo cubre las 25 monedas del panel y la frecuencia horaria; no generaliza a otros activos ni a otras resoluciones temporales sin reentrenamiento.
- Riesgo de alucinación en el sentido de predicciones plausibles pero sin base estadística sólida; el MASE de 0,701 indica un error superior al del baseline naive estacional en muchos folds.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base `autogluon/chronos-2-small` y citarse el modelo fundacional Chronos-2 en trabajos de investigación.
- No sustituye asesoramiento financiero profesional ni gestión de riesgo.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/albertooooz/chronos-2-small-lora-crypto-hourly
- Modelo base: https://huggingface.co/autogluon/chronos-2-small
- Modelo de comparación Kronos-base: https://huggingface.co/NeoQuasar/Kronos-base
- Perfil del autor: https://huggingface.co/albertooooz
- Adaptador relacionado (precios eléctricos EU day-ahead): https://huggingface.co/albertooooz/chronos-2-small-lora-eu-day-ahead
