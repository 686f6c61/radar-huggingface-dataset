# raws-labs/tinycast

## Resumen

TinyCast es un modelo fundacional de pronóstico de series temporales probabilístico y zero-shot, desarrollado por RawLabs. Con solo 146.505 parámetros (aproximadamente 0,6 MB en fp32), se presenta como la entrada más pequeña de la tabla GIFT-Eval que publica resultados por configuración y declara explícitamente no tener fuga de datos. Su arquitectura es attention-free, basada en convoluciones causales dilatadas, y calcula la periodicidad de cada contexto mediante análisis armónico en lugar de aprenderla, lo que le permite no gastar capacidad en redescubrir estacionalidades.

El modelo es capaz de pronosticar una serie que nunca ha visto, sin ajuste ni fine-tuning, devolviendo nueve cuantiles en lugar de un único valor puntual. Está diseñado para ejecutarse en dispositivos de borde: exporta a un grafo INT8 estático y funciona en microcontroladores, con un perfil de firmware que ocupa 138,1 KiB de pesos y 730,7 KiB de RAM pico. Su relevancia actual radica en la demanda de modelos de forecasting ligeros, eficientes y desplegables en entornos con recursos limitados, manteniendo una precisión competitiva frente a modelos mucho más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional causal dilatada (10 bloques Conv1d, kernel 3, dilaciones de 1 a 512, campo receptivo 2047) con decodificador de cuantiles |
| Parametros totales | 146.505 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 (pronóstico en bloques de 48 pasos, desplegado autoregresivamente hasta 720) |
| Tipos de cuantizacion | INT8 (W8A8) y fp32 |
| Idiomas soportados | No aplica (series temporales numéricas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TinyCast emplea una arquitectura completamente libre de atención. El backbone consiste en 10 bloques de convoluciones causales dilatadas (Conv1d, kernel 3) con dilaciones que se duplican desde 1 hasta 512, logrando un campo receptivo de 2047 sobre un contexto de 2048. Para eficiencia, usa convoluciones depthwise-separable y un feed-forward SwiGLU compartido (atado ALBERT) en todos los bloques. Como prior estructural, aplica la prueba de significancia de Fisher para análisis armónico sobre el periodograma normalizado (alfa 0,05, hasta cuatro periodos, cero parámetros) y luego un pliegue de fase de 16 bins. El decodificador combina un resumen agrupado, un perfil estacional de recolección de fase y una corrección de convolución futura causal, emitiendo nueve cuantiles deciles. La normalización es min-max por contexto sobre el historial observado, invertida en la salida.

El entrenamiento se realizó una vez sobre GIFT-Eval-Pretrain, Chronos KernelSynth y cuatro shards sintéticos, durante 36.621 pasos (aproximadamente 7,8 horas en ocho RTX 3090, unas 62 horas de acelerador). El corpus se filtró con dos listas de exclusión, eliminando dos de los 71 directorios de nivel superior, dejando 69. GIFT-Eval-Pretrain ya es disjunto del conjunto de prueba GIFT-Eval, por lo que la lista de solapamiento no elimina nada adicional.

## Capacidades

- Pronóstico probabilístico zero-shot: genera nueve cuantiles (deciles) para cada paso futuro, permitiendo intervalos de confianza y análisis de incertidumbre.
- Sin ajuste ni fine-tuning: funciona directamente sobre series no vistas, sin necesidad de entrenamiento adicional por serie.
- Cálculo de periodicidad explícito: usa la prueba de Fisher para detectar hasta cuatro periodos dominantes, evitando aprender estacionalidad con parámetros.
- Streaming exacto: gracias a los búferes de anillo por capa y el padding causal, la variante por paso es exacta, no aproximada, y la memoria de trabajo no crece con la longitud de la serie.
- Exportación a INT8 estático: todas las operaciones (convoluciones, multiplicaciones de matrices, normalizaciones) se pueden convertir a un grafo INT8, permitiendo despliegue en hardware embebido.
- Bajo consumo de recursos: 146.505 parámetros, 0,6 MB en fp32, 138,1 KiB en INT8; ejecutable en microcontroladores como el Cortex-M7.
- Soporte de horizonte variable: pronostica en bloques de 48 pasos y puede extenderse autoregresivamente hasta 720.

## Casos de uso

- Predicción de demanda energética en redes inteligentes: TinyCast puede pronosticar la carga eléctrica de un edificio o una microrred con 2048 pasos de contexto, emitiendo cuantiles que permiten dimensionar reservas y planificar la generación. Su bajo consumo permite ejecutarlo en medidores inteligentes o concentradores de datos.
- Monitorización de sensores IoT en agricultura: para series de humedad, temperatura o precipitación, el modelo genera pronósticos probabilísticos sin necesidad de conectividad a la nube, funcionando en nodos con microcontroladores y batería.
- Mantenimiento predictivo en maquinaria industrial: analizando series de vibración, temperatura o presión, TinyCast puede anticipar fallos con intervalos de confianza, integrándose en PLCs o dispositivos de borde para alertas tempranas.
- Forecasting de ventas en retail: con contexto de 2048 pasos (por ejemplo, datos horarios de 85 días), el modelo predice la demanda futura por producto y tienda, ayudando a la gestión de inventario y reposición. Su naturaleza zero-shot permite aplicarlo a miles de SKUs sin entrenamiento individual.
- Gestión de tráfico y movilidad: para series de ocupación de carriles o afluencia de estaciones, TinyCast puede pronosticar picos de demanda con cuantiles, útil para planificación de transporte público o sistemas de navegación.
- Análisis financiero de series de alta frecuencia: aunque no está diseñado específicamente para finanzas, su capacidad de emitir distribuciones predictivas puede usarse para estimar volatilidad o rangos de precios en activos con datos horarios, siempre con cautela por la naturaleza no estacionaria de los mercados.
- Telemetría de servidores y redes: monitorear métricas de CPU, memoria o latencia en centros de datos, pronosticando cargas futuras para autoescalado o detección de anomalías, con despliegue en agentes ligeros.

## Benchmarks y rendimiento

En GIFT-Eval (97 configuraciones, zero-shot), TinyCast obtiene los siguientes resultados (medias geométricas de la relación con el referencia seasonal-naive; 1.000 es paridad):

| Metrica | Valor |
|---|---|
| nGMASE (precision puntual) | 0.774 |
| nWQL (precision probabilistica) | 0.545 |
| nMSIS (interval score) | 0.554 |

Comparativa con otros modelos zero-shot de hasta 10 M de parámetros con resultados públicos por configuración y sin fuga declarada (recalculado sobre el mismo snapshot y referencia):

| Modelo | Params | nGMASE | nWQL |
|---|---:|---:|---:|
| **TinyCast** | 146 K | 0.774 | 0.545 |
| Reverso-Nano | 200 K | 0.760 | (0.661) |
| Reverso-Small | 550 K | 0.726 | (0.626) |
| TTM-R3 | 1.4 M | 0.724 | 0.520 |
| Reverso | 2.6 M | 0.711 | (0.610) |
| Toto-2.0-4m | 4.1 M | 0.757 | 0.524 |
| YingLong-6m | 7.3 M | 0.880 | 0.609 |
| FlowState-9.1M | 9.1 M | 0.726 | 0.502 |
| Kairos-10m | 9.9 M | 0.753 | 0.554 |

Los valores entre paréntesis en nWQL indican que el modelo emite pronóstico puntual, no distribución, por lo que no son comparables directamente. TinyCast es el único modelo por debajo de 1,4 M de parámetros que produce distribución predictiva.

En otros benchmarks: en Chronos-ZS (27 tareas) alcanza MASE relativo 0.880 y WQL relativo 0.722; en fev-bench (100 tareas) MASE relativo 0.819, WQL relativo 0.658 y skill score 0.304. En ambos, todos los modelos neuronales que le superan tienen al menos 28 veces sus parámetros. Estos agregados no son comparables entre sí ni con GIFT-Eval por normalizaciones distintas. En fev-bench no se establece disjuntez: doce de sus cien tareas nombran subconjuntos del corpus de entrenamiento.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de 146 K parámetros, puede ejecutarse en cualquier CPU moderna sin GPU, con uso de RAM inferior a 10 MB en fp32.
- GPU: no requiere GPU; si se usa, cualquier GPU con al menos 1 GB de VRAM es suficiente, aunque no es necesario.
- Dispositivos embebidos: perfil de firmware en STM32H753 (Cortex-M7) con 138,1 KiB de pesos INT8, imagen completa de 365,5 KiB (incluyendo contexto de 8 KiB), pico de RAM de 730,7 KiB y tiempo de llamada de 4,08 s para contexto de 2048 pasos.
- Opciones de despliegue: al ser una librería propia (tinycast), no se mencionan integraciones con vLLM, llama.cpp u Ollama; el despliegue se realiza mediante el código oficial de GitHub o exportación a grafo INT8 estático.
- Latencia y throughput: en el perfil de firmware, 4,08 s por llamada; en hardware más potente (CPU de escritorio) se espera latencia en el orden de milisegundos, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

La tabla de la sección de benchmarks ya incluye la comparativa principal con modelos zero-shot de tamaño similar. Los más cercanos en parámetros son Reverso-Nano (200 K) y Reverso-Small (550 K), ambos con pronóstico puntual y peor nWQL comparable. TTM-R3 (1,4 M) tiene mejor nGMASE (0.724) y nWQL (0.520), pero con casi 10 veces más parámetros. FlowState-9.1M logra el mejor nGMASE (0.726) y nWQL (0.502) de la tabla, pero con 62 veces más parámetros. TinyCast ofrece la mejor relación precisión/parámetros entre los modelos que emiten distribución predictiva.

## Limitaciones y advertencias

- No procesa texto ni datos categóricos: está diseñado exclusivamente para series temporales numéricas univariantes.
- Contexto limitado a 2048 pasos: para series más largas se requiere ventaneo o submuestreo, lo que puede perder información de largo plazo.
- Horizonte de pronóstico máximo evaluado de 720 pasos; más allá de eso no hay garantías de rendimiento.
- En fev-bench no se establece disjuntez con el corpus de entrenamiento en 12 de 100 tareas, lo que podría inflar ligeramente los resultados en ese benchmark.
- La precisión probabilística depende de la calibración de los cuantiles; en dominios muy distintos a los de entrenamiento (por ejemplo, finanzas) la incertidumbre puede estar mal estimada.
- No se han publicado análisis de sesgos o robustez frente a series con tendencias fuertes, estacionalidades múltiples o ruido no estacionario.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no declara responsabilidad por decisiones basadas en sus pronósticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raws-labs/tinycast
- Paper (arXiv): https://arxiv.org/abs/2608.15767
- Código, entrenamiento y replicación: https://github.com/raws-labs/tinycast
