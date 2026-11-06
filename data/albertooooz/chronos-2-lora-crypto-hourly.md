# albertooooz/chronos-2-lora-crypto-hourly

## Resumen

Chronos-2 LoRA crypto hourly es un adaptador LoRA de bajo rango (rank 8) publicado por el usuario albertooooz sobre el modelo fundacional de series temporales `amazon/chronos-2`. Su proposito concreto es la previsión univariante del precio de cierre horario de criptomonedas a 24 horas vista, entrenado sobre 25 series perpetuas de Hyperliquid. No es un modelo autonomo: requiere cargarse junto al modelo base Chronos-2 mediante la libreria `chronos-forecasting` y PEFT.

El modelo hereda la arquitectura transformer encoder-decoder de Chronos-2, que trata las series numericas como tokens discretizados y las procesa con mecanismos de atencion estandar. El adaptador ajusta unicamente los modulos de atencion (`q/k/v/o`) y la capa de salida del patch embedding, con un contexto de 2048 pasos y un horizonte de prediccion de 24 pasos, lo que encaja con la frecuencia horaria del dataset.

Su relevancia es acotada y experimental: el autor reporta mejoras marginales frente al zeroshot de Chronos-2 (MASE 0.681 frente a 0.686, acierto direccional del 50,0% frente al 46,2%) en una evaluacion walk-forward de 132 folds sobre 22 monedas. La licencia Apache 2.0 y el formato PEFT lo hacen facil de reproducir, pero el propio autor advierte que no constituye una senal de trading ni un backtest financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Chronos-2) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA de rank 8; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 pasos temporales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA adapter) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `amazon/chronos-2`, un modelo fundacional de previsión de series temporales de Amazon Science que tokeniza valores continuos y los procesa con un transformer. El ajuste LoRA utiliza rank 8, alpha 16, learning rate 1e-5, 5000 pasos, batch size 64 y contexto de 2048 con horizonte de 24. Los modulos objetivo son `self_attention.q/k/v/o` y `output_patch_embedding.output_layer`. El entrenamiento se ejecuto en una NVIDIA RTX PRO 4500 Blackwell en RunPod.

Los datos de entrenamiento provienen del precio medio (mid) de 25 perpetuos de Hyperliquid, agregados de impresiones minutarias a frecuencia horaria: APE, ARB, ATOM, AVAX, BNB, BTC, CFX, CRV, DOGE, DYDX, ETH, FTM, GMX, INJ, LDO, LINK, LTC, MATIC, OP, RNDR, SNX, SOL, STX, SUI y kPEPE. El conjunto contiene 597.753 filas entre el 20 de mayo de 2023 y el 11 de octubre de 2026, con holdout a partir del 1 de mayo de 2026 (ultimos 6 meses naturales). Las series de FTM, MATIC y RNDR se truncan en su fecha de deslistado y quedan excluidas de la evaluacion. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de previsión.

## Capacidades

- Previsión univariante de precio de cierre horario a 24 horas vista para las 25 monedas del panel de entrenamiento.
- Generacion de cuantiles de prediccion (la evaluacion usa la mediana) a traves del pipeline `Chronos2Pipeline`.
- Integracion como adaptador PEFT sobre Chronos-2, con carga automatica del merge de pesos LoRA por parte de la libreria.
- Entrada con forma `(n_series, n_variates, history_length)` y soporte de multiples series en una misma llamada.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo puramente numerico.

## Casos de uso

- Prototipado de pipelines de previsión horaria: cargar el adaptador con `Chronos2Pipeline.from_pretrained` y generar predicciones de 24 pasos para las monedas del panel, util para validar infraestructura de forecasting antes de invertir en modelos propios.
- Investigacion academica sobre adaptacion LoRA en modelos fundacionales de series temporales: el repositorio documenta hiperparametros, rango y modulos objetivo, lo que facilita reproducir el experimento y compararlo con el zeroshot.
- Benchmark interno de modelos de previsión: sirve como referencia base (MASE 0.681, acierto direccional 50,0%) frente a la que medir alternativas como Kronos-base o variantes de Chronos-2-small.
- Generacion de escenarios sinteticos de precio a corto plazo: los cuantiles generados por el pipeline permiten construir intervalos de incertidumbre para simulaciones de riesgo no vinculantes.
- Analisis exploratorio de series de criptoactivos en notebooks: el contexto de 2048 horas (unos 85 dias) permite estudiar patrones estacionales recientes con un coste de computo bajo.
- Educacion y divulgacion: ejemplo didactico de como fine-tunear un adaptador LoRA sobre un modelo fundacional de series temporales con datos de mercado reales.

## Benchmarks y rendimiento

Evaluacion walk-forward sobre 6 meses de holdout, 2 dias de origen aleatorios por mes natural, horizonte 24 h, `random_seed=42`, 132 folds sobre 22 monedas. Chronos usa las ultimas 2048 cierres y el cuantil mediano; Kronos-base usa 512 barras OHLC sin volumen y la media de 3 trayectorias muestreadas.

| Modelo | MASE | Acierto direccional 24 h | AE log-return 24 h |
|---|---:|---:|---:|
| chronos-2 zeroshot | 0.686 | 46.2% | 0.0216 |
| chronos-2 LoRA | 0.681 | 50.0% | 0.0213 |
| chronos-2-small zeroshot | 0.713 | 43.1% | 0.0223 |
| chronos-2-small LoRA | 0.701 | 46.9% | 0.0219 |
| Kronos-base | 0.975 | 45.4% | 0.0434 |

MASE calculado con escala naive estacional de 24 horas. El acierto direccional es el signo del cierre a 24 horas. La comparacion con Kronos no es equivalente en entradas (OHLC y contexto mas corto), por lo que debe interpretarse como comparacion de tarea, no como bake-off con inputs identicos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ser un adaptador LoRA de rank 8, el coste dominante es el modelo base `amazon/chronos-2`, cuyos requisitos no se detallan.
- GPU recomendadas: el autor entreno en una NVIDIA RTX PRO 4500 Blackwell; para inferencia se espera que quepa en GPUs consumer de gama media-alta, aunque no se aportan cifras.
- Despliegue: libreria `chronos-forecasting` con `peft` y `torch`; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MASE (24 h) | Acierto direccional | Licencia |
|---|---|---:|---:|---:|---|
| chronos-2 LoRA (este) | no disponible (LoRA r=8) | 2048 | 0.681 | 50.0% | Apache 2.0 |
| chronos-2 zeroshot | no disponible | 2048 | 0.686 | 46.2% | Apache 2.0 |
| chronos-2-small LoRA | no disponible (LoRA) | no disponible | 0.701 | 46.9% | Apache 2.0 |
| Kronos-base | no disponible | 512 | 0.975 | 45.4% | no disponible |

## Limitaciones y advertencias

- Evaluado sobre 22 monedas; FTM, MATIC y RNDR quedan fuera de las metricas por deslistado.
- El acierto direccional ronda el 50%, equivalente a azar: no es una senal de trading ni sustituye a gestion de riesgo profesional.
- La comparacion con Kronos-base no es equivalente en entradas ni contexto, por lo que las cifras no son directamente comparables.
- Los huecos de una hora se rellenan en plano; huecos mayores se descartan, lo que puede introducir sesgo en series con interrupciones.
- No es un modelo autonomo: requiere `amazon/chronos-2` y la libreria `chronos-forecasting`.
- No se documentan sesgos de mercado especificos ni evaluaciones fuera del panel de 25 monedas.
- Uso comercial permitido por Apache 2.0, pero sin garantias de idoneidad financiera.

## Enlaces

- Hugging Face: https://huggingface.co/albertooooz/chronos-2-lora-crypto-hourly
- Perfil del autor: https://huggingface.co/albertooooz
- Modelo base: https://huggingface.co/amazon/chronos-2
- Modelo de comparacion: https://huggingface.co/NeoQuasar/Kronos-base
- Referencia sobre Chronos (familia de modelos): https://ai.miraheze.org/wiki/Chronos
