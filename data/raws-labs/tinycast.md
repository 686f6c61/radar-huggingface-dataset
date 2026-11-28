# raws-labs/tinycast

## Resumen

TinyCast es un modelo fundacional para pronóstico de series temporales desarrollado por raws-labs, con solo 146.505 parámetros. Resuelve el problema del pronóstico probabilístico zero-shot: predice series que nunca ha visto, sin ajuste ni fine-tuning, devolviendo nueve cuantiles (deciles) en lugar de un único valor puntual. Es relevante porque demuestra que un modelo de 0,6 MB en fp32 puede competir en la GIFT-Eval con alternativas de hasta 10 millones de parámetros, y porque es el único modelo zero-shot por debajo de 1,4 M de parámetros en ese leaderboard que emite una distribución predictiva.

La arquitectura es libre de atención (attention-free): diez bloques convolucionales causales dilatados con un campo receptivo de 2047 sobre un contexto de 2048 pasos. En lugar de aprender la estacionalidad, calcula la periodicidad de cada contexto mediante un test de significación de Fisher sobre el periodograma normalizado, un prior estructural de cero parámetros. Esto libera capacidad del modelo para otras tareas.

El modelo está pensado para despliegue en el borde: exporta a un grafo estático INT8 y se ha ejecutado en una placa STM32H753 (Cortex-M7) con 138,1 KiB de pesos cuantizados y 730,7 KiB de RAM pico, a 4,08 s por llamada con contexto de 2048 pasos. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN causal dilatada (10 bloques Conv1d, kernel 3, dilataciones de 1 a 512), sin atención, con SwiGLU compartido estilo ALBERT y prior estructural de periodicidad por test de Fisher |
| Parametros totales | 146.505 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 pasos; horizonte en bloques de 48 pasos con rollout autorregresivo (evaluado hasta 720) |
| Tipos de cuantizacion | INT8 (W8A8 estático con escalas calibradas y congeladas); pesos fp32 de referencia (~0,6 MB) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; exportación a grafo estático INT8 para despliegue embebido |

## Arquitectura y entrenamiento

El backbone son diez bloques convolucionales causales dilatados con kernel 3 y dilataciones que duplican de 1 a 512, lo que da un campo receptivo de 2047 pasos sobre un contexto de 2048. Usa convoluciones depthwise-separable para eficiencia y una única feed-forward SwiGLU con pesos atados (ALBERT-tied) compartida entre los diez bloques. El prior estructural aplica el test de significación de Fisher para análisis armónico sobre el periodograma normalizado (alpha 0,05, hasta cuatro periodos, cero parámetros) y después un phase fold de 16 bins. El decodificador combina un resumen pooled, un perfil estacional por phase-gather y una corrección future-conv causal, y emite nueve cuantiles deciles. La normalización es min-max por contexto sobre el historial observado, invertida en la salida.

La entrada es una serie univariante: los huecos NaN se interpolan linealmente, un historial más largo conserva sus últimos 2048 pasos y uno más corto se rellena con su primer valor. La memoria de trabajo usa ring buffers por capa acotados que no crecen durante la ejecución, y el padding causal permite una variante de streaming por paso exacta, no aproximada. El entrenamiento se realizó sobre el dataset Salesforce/GiftEvalPretrain. No se dispone de detalles sobre el número de tokens, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Pronóstico probabilístico zero-shot de series temporales univariantes, sin ajuste ni fine-tuning.
- Salida de nueve cuantiles deciles por paso, es decir, distribución predictiva completa en lugar de punto único.
- Detección automática de periodicidad por contexto mediante test de Fisher sobre el periodograma (hasta cuatro periodos).
- Manejo de huecos: interpolación lineal de NaN en la entrada.
- Contexto largo de 2048 pasos y horizontes autorregresivos de hasta 720 pasos evaluados.
- Streaming exacto por paso gracias al padding causal y a los ring buffers acotados.
- Exportación a grafo estático INT8 y ejecución en microcontroladores sin acelerador neuronal.
- Capacidades multilingües: no aplica (modelo numérico, no de texto).
- Tool calling, agentes y razonamiento multi-paso: no disponible (fuera del alcance del modelo).

## Casos de uso

- Pronóstico de demanda en el borde: el modelo puede ejecutarse en un microcontrolador junto al sensor y generar pronósticos probabilísticos de las próximas 48 a 720 muestras sin enviar datos a la nube, gracias a sus 138,1 KiB de pesos INT8 y 730,7 KiB de RAM pico.
- Monitorización industrial predictiva: con contexto de 2048 pasos y detección automática de periodicidad, puede modelar señales de vibración o temperatura con ciclos diarios o semanales y emitir intervalos de confianza para alertas tempranas.
- Gestión energética en dispositivos: pronóstico de carga o generación renovable en gateways domésticos, usando los nueve cuantiles para dimensionar reservas y detectar anomalías con bandas de incertidumbre.
- Telemetría y observabilidad: predicción de métricas de sistema (latencia, throughput, uso de CPU) en pipelines de monitorización, con streaming exacto por paso para actualizar el pronóstico a medida que llegan muestras.
- Planificación de inventario en tienda: pronóstico de ventas por SKU a partir de historiales cortos o con huecos, aprovechando la interpolación de NaN y el relleno de historiales cortos con el primer valor.
- Investigación en series temporales: modelo de referencia de bajo coste para comparar métodos probabilísticos, con resultados por configuración publicados en GIFT-Eval y código de replicación disponible.
- Prototipado rápido en ciencia de datos: al no requerir entrenamiento por serie, sirve como línea base zero-shot antes de invertir en modelos específicos por dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en GIFT-Eval, zero-shot, sobre 97 configuraciones. Las métricas son medias geométricas normalizadas frente a la referencia seasonal-naive; 1,000 es paridad.

| Metrica | Valor |
|---|---|
| nGMASE (precisión puntual) | 0,774 |
| nWQL (precisión probabilística) | 0,545 |
| nMSIS (interval score) | 0,554 |

Comparativa con modelos zero-shot del tablero de hasta 10 M de parámetros con resultado por configuración público y sin fuga declarada:

| Modelo | Parametros | nGMASE | nWQL |
|---|---:|---:|---:|
| TinyCast | 146 K | 0,774 | 0,545 |
| Reverso-Nano | 200 K | 0,760 | (0,661) |
| Reverso-Small | 550 K | 0,726 | (0,626) |
| TTM-R3 | 1,4 M | 0,724 | 0,520 |
| Reverso | 2,6 M | 0,711 | (0,610) |
| Toto-2.0-4m | 4,1 M | 0,757 | 0,524 |
| YingLong-6m | 7,3 M | 0,880 | 0,609 |
| FlowState-9.1M | 9,1 M | 0,726 | 0,502 |
| Kairos-10m | 9,9 M | 0,753 | 0,554 |

Los nWQL entre paréntesis corresponden a modelos que emiten pronóstico puntual, por lo que la cifra es un error puntual y no es comparable con el resto. En otros benchmarks, el autor declara: Chronos-ZS (27 tareas) con MASE relativo 0,880 y WQL relativo 0,722; fev-bench (100 tareas) con MASE relativo 0,819, WQL relativo 0,658 y skill score 0,304. Cada benchmark normaliza sobre su propio conjunto de datasets, por lo que estos agregados no son comparables con las cifras de GIFT-Eval. En fev-bench no se ha establecido la disjunción: doce de sus cien tareas nombran subconjuntos del corpus de entrenamiento.

En dispositivo (STM32H753, Cortex-M7, W8A8 estático, un núcleo, sin acelerador neuronal ni memoria externa): 138,1 KiB de coeficientes INT8, 365,5 KiB de imagen de firmware completa incluyendo contexto de 8 KiB, 730,7 KiB de RAM pico y 4,08 s por llamada con contexto de 2048 pasos. La configuración de firmware obtiene 0,833 nGMASE.

## Requisitos de hardware

- Inferencia en fp32: pesos de aproximadamente 0,6 MB, ejecutable en CPU sin GPU.
- Inferencia INT8: 138,1 KiB de pesos cuantizados, apto para microcontroladores Cortex-M7.
- VRAM estimada: no disponible; el modelo no requiere GPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. Para lotes grandes, una GPU consumer (por ejemplo RTX 4090) aceleraría el throughput, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier GPU; también en placas embebidas (STM32H753 validado).
- Opciones de despliegue: exportación a grafo estático INT8 para firmware embebido; el repositorio incluye código de entrenamiento y replicación. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo.
- Latencia y throughput: 4,08 s por llamada en Cortex-M7 con contexto de 2048; latencia en CPU/GPU no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GIFT-Eval nGMASE | GIFT-Eval nWQL | Licencia | Salida probabilística |
|---|---:|---|---:|---:|---|---|
| TinyCast | 146 K | 2048 | 0,774 | 0,545 | Apache-2.0 | Sí (9 cuantiles) |
| Reverso-Nano | 200 K | no disponible | 0,760 | (0,661) | no disponible | No (puntual) |
| TTM-R3 | 1,4 M | no disponible | 0,724 | 0,520 | no disponible | Sí |
| FlowState-9.1M | 9,1 M | no disponible | 0,726 | 0,502 | no disponible | Sí |

TinyCast es el único de la comparativa por debajo de 1,4 M de parámetros que emite distribución predictiva. Reverso-Nano y Reverso-Small son más precisos en nGMASE pero solo ofrecen pronóstico puntual. TTM-R3 y FlowState-9.1M mejoran ligeramente en ambas métricas a costa de 10 a 60 veces más parámetros. La licencia Apache-2.0 de TinyCast es la única confirmada en esta tabla.

## Limitaciones y advertencias

- Modelo univariante: no modela dependencias entre múltiples series de forma nativa.
- Los resultados de GIFT-Eval están declarados por el autor y no están verificados (`verified: false`); conviene reproducirlos antes de usarlos en decisiones de producción.
- En fev-bench no se ha establecido la disjunción entre entrenamiento y evaluación: doce de las cien tareas solapan con subconjuntos del corpus de entrenamiento, por lo que el skill score de 0,304 puede estar inflado.
- Los agregados de Chronos-ZS y fev-bench no son comparables con los de GIFT-Eval por usar normalizaciones distintas.
- La configuración de firmware (0,833 nGMASE) es peor que la de host (0,774 nGMASE); la cuantización INT8 introduce una degradación medible.
- El horizonte se genera por rollout autorregresivo en bloques de 48 pasos; los errores pueden acumularse en horizontes largos (evaluado hasta 720).
- La entrada se trunca a los últimos 2048 pasos y los historiales más cortos se rellenan con el primer valor, lo que puede sesgar el pronóstico en series muy cortas.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir pronósticos con intervalos mal calibrados en regímenes no vistos.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas; verificar los términos del dataset Salesforce/GiftEvalPretrain para reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/raws-labs/tinycast
- Demo (Space): https://huggingface.co/spaces/raws-labs/tinycast-forecaster
- Paper: https://arxiv.org/abs/2608.15767
- Código, entrenamiento y replicación: https://github.com/raws-labs/tinycast
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/GiftEvalPretrain
