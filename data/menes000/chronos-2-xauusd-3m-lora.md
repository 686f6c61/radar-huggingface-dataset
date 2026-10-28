# menes000/chronos-2-xauusd-3m-lora

## Resumen

`menes000/chronos-2-xauusd-3m-lora` es un adaptador LoRA sobre el modelo fundacional de series temporales `amazon/chronos-2`. Lo publica el usuario menes000 y su único propósito es el pronóstico probabilístico del precio del oro frente al dólar (XAUUSD) a partir de barras de 3 minutos, con un horizonte de 1 a 3 horas (60 barras). No es un modelo de lenguaje: no genera texto ni código, sino distribuciones predictivas (cuantiles) sobre una serie univariante de precios de cierre.

El adaptador se entrena sobre diez años de cierres de 3 minutos (enero de 2013 a diciembre de 2022, unas 1,18 millones de barras) y se valida con 512 ventanas aleatorias de 2023. La evaluación se hace sobre dos periodos nunca vistos (2024 y de enero de 2025 a agosto de 2026), con 600 ventanas no solapadas cada uno, midiendo pérdida de cuantiles en el extremo del horizonte. La mejora frente al modelo base es modesta pero estadísticamente significativa en los cuatro escenarios evaluados.

Su relevancia es doble: por un lado, demuestra una receta de ajuste fino con PEFT muy barata (~1,2 M de parámetros entrenables, 1000 pasos) sobre un modelo fundacional de series temporales; por otro, el propio autor advierte de que una estrategia de trading basada en sus pronósticos no es rentable después de costes de 0,30 USD/oz por operación. Es, por tanto, un artefacto de investigación reproducible más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `amazon/chronos-2`, modelo fundacional de series temporales; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (adaptador con ~1,2 M de parametros entrenables; el recuento del modelo base no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 barras de 3 minutos (~4 dias de negociacion) |
| Horizonte de prediccion | 60 barras de 3 minutos (3 horas); el ejemplo de uso reporta paso 20 = 1 hora y paso 60 = 3 horas |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | no aplica (serie temporal numerica univariante) |
| Licencia | apache-2.0 (la del modelo base debe verificarse por separado) |
| Formato de pesos | safetensors (adaptador LoRA); incluye `training_log.csv` y `lora_vs_base.png` |
| Libreria | peft (`chronos-forecasting>=2.3` requerido en tiempo de inferencia) |
| Datos de entrada | cierres de 3 minutos, univariante, sin volumen ni OHLC |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con r=8 y alpha=16 sobre las proyecciones de self-attention q/k/v/o y sobre la capa de salida de Chronos-2. El entrenamiento usa 1000 pasos, batch de 64, learning rate de 1e-5 con decaimiento lineal y optimizador AdamW. Los datos son precios de cierre de XAUUSD a 1 minuto (OHLC) remuestreados a 3 minutos; el tramo de entrenamiento cubre de enero de 2013 a diciembre de 2022 (~1,18 M de barras). Como aumento de datos se generan tres series de 3 minutos con desfase de fase, de modo que los límites de barra caen en :00/:03, :01/:04 y :02/:05.

La validación emplea 512 ventanas aleatorias de 2023, con una pérdida que baja de 2,2800 (modelo base) a 2,2202 (−2,6 %) de forma monotónica y sin señales de sobreajuste. El conjunto de test son 2024 y el periodo de enero de 2025 a agosto de 2026, nunca vistos durante el entrenamiento ni la selección del modelo. La evaluación compara base y adaptador con exactamente las mismas entradas, 600 ventanas no solapadas por periodo, y mide pérdida de cuantiles (0,1/0,25/0,5/0,75/0,9) al final del horizonte. No se documenta en la información disponible ningún uso de RLHF, DPO ni decodificación especulativa, algo por otra parte ajeno a este tipo de modelo.

## Capacidades

- Pronóstico probabilístico de la serie XAUUSD a 1 y 3 horas mediante `predict_quantiles`, devolviendo cuantiles 0,1, 0,25, 0,5, 0,75 y 0,9 más la media.
- Predicción multi-paso: el tensor de salida es `[1, 60, 5]` para una ventana de contexto de 2048 barras.
- Mejora calibrada sobre el modelo base específicamente en el extremo del horizonte, que es donde se calculan las métricas publicadas.
- Capacidad de generalización fuera del rango de precios visto en entrenamiento (el oro cotizó entre 2.600 y 5.600 USD en 2025-26, frente a un máximo de ~2.070 USD en el tramo de entrenamiento).
- Inferencia en CPU según el ejemplo del autor (`device_map="cpu"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo de series temporales univariante.
- No hay capacidades multilingües que evaluar; la entrada es puramente numérica.

## Casos de uso

- Investigación cuantitativa sobre materias primas: obtener una distribución predictiva del oro a 1-3 horas para estudiar asimetrías y régimen de volatilidad, usando los cuantiles 0,1 y 0,9 como envolvente de incertidumbre en lugar de una única predicción puntual.
- Gestión de riesgo y estimación de exposición: el intervalo 0,1-0,9 a 3 horas sirve como proxy empírico de la variación adversa esperada en una posición en XAUUSD, con la ventaja de que la pérdida de cuantiles es la métrica optimizada durante el ajuste.
- Backtesting de señales: construir reglas a partir de la mediana pronosticada y del ancho del intervalo (por ejemplo, operar solo cuando el intervalo es estrecho) y evaluar su comportamiento en los periodos de test publicados (2024 y 2025-26).
- Detección de desviaciones en tiempo real: comparar el precio observado con la banda 0,1-0,9 del pronóstico previo para marcar movimientos anómalos que se salen del régimen esperado.
- Componente de un ensemble: incorporar el adaptador como uno más entre varios modelos de pronóstico (ARIMA/GARCH, otros modelos fundacionales) y ponderar por desempeño fuera de muestra, aprovechando que su salida es probabilística y directamente combinable.
- Transferencia de la receta PEFT: reutilizar la configuración (LoRA r=8, alpha=16 sobre q/k/v/o y capa de salida, 1000 pasos, batch 64, lr 1e-5) para adaptar Chronos-2 a otros activos o a otras frecuencias con un coste de cómputo muy bajo.
- Docencia y reproducción de experimentos: ejemplo completo y verificable de ajuste fino de un modelo fundacional de series temporales, con log de entrenamiento y comparativa gráfica incluidas en el repositorio.

## Benchmarks y rendimiento

Métrica: pérdida de cuantiles (0,1/0,25/0,5/0,75/0,9) al final del horizonte, en USD por onza; menor es mejor. 600 ventanas no solapadas por periodo, mismas entradas para ambos modelos.

| Periodo | Horizonte | Chronos-2 base | LoRA | Reduccion de error (IC 95 %) | LoRA mejor en |
|---|---|---|---|---|---|
| 2024 | 1 hora | 1,177 | **1,161** | −1,3 % [0,2 %, 2,4 %] | 63 % de ventanas |
| 2024 | 3 horas | 2,134 | **2,088** | −2,1 % [1,1 %, 3,3 %] | 63 % de ventanas |
| 2025-26 | 1 hora | 3,285 | **3,211** | −2,2 % [0,6 %, 4,2 %] | 61 % de ventanas |
| 2025-26 | 3 horas | 5,327 | **5,134** | −3,6 % [2,2 %, 5,1 %] | 62 % de ventanas |

La mejora es estadísticamente significativa en los cuatro casos (el intervalo del 95 % excluye el cero), se mantiene en ambos periodos de test y crece con el horizonte. Pérdida de validación en 2023: 2,2800 (base) frente a 2,2202 (LoRA), un −2,6 %. Los valores de pérdida están en USD/oz, por lo que son mayores en 2025-26 simplemente porque el oro se movió más en términos absolutos.

## Requisitos de hardware

- El adaptador pesa muy poco (~1,2 M de parámetros, del orden de unos pocos MB en safetensors); el grueso de memoria y cómputo lo determina el modelo base `amazon/chronos-2`, cuyo tamaño no se especifica en la información disponible.
- El autor demuestra inferencia en CPU (`device_map="cpu"`), lo que sugiere que el modelo base es lo bastante compacto para ejecutarse sin GPU en lotes pequeños.
- VRAM estimada: no disponible, al no publicarse el número de parámetros del modelo base.
- GPU recomendadas: no disponible. Para procesar 600 ventanas de 2048 barras en evaluación conviene una GPU con al menos 16 GB, pero es una estimación no confirmada por el autor.
- Cabe en GPU de consumo: probablemente sí (RTX 3060/4060 en adelante) para inferencia en CPU/GPU con lotes pequeños, aunque no hay confirmación explícita en la información proporcionada.
- Despliegue: `chronos-forecasting>=2.3` junto con `peft` y PyTorch; vLLM, llama.cpp y TGI no aplican a esta familia de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado en la tarea |
|---|---|---|---|---|
| `menes000/chronos-2-xauusd-3m-lora` (este) | ~1,2 M entrenables (adaptador) | 2048 barras de 3 min | apache-2.0 | Pérdida de cuantiles 1,161 / 2,088 / 3,211 / 5,134 segun periodo y horizonte |
| `amazon/chronos-2` (base) | no disponible | 2048 barras en esta configuracion | no disponible en la informacion | 1,177 / 2,134 / 3,285 / 5,327 (peor en los cuatro escenarios) |

No se dispone de datos en la información proporcionada para comparar con otras alternativas de la misma categoría (por ejemplo, otros modelos fundacionales de series temporales o baselines clásicos como ARIMA o GARCH). Cualquier comparación de ese tipo requeriría ejecutar los mismos 600 ventanas de test con esos modelos, algo que el autor no publica.

## Limitaciones y advertencias

- No es rentable como estrategia de trading: el propio autor indica que, tras aplicar costes de 0,30 USD/oz por operación, la estrategia basada en sus pronósticos pierde dinero. El modelo no es asesoramiento financiero.
- Ámbito muy restringido: un único activo (XAUUSD), una única frecuencia (3 minutos) y una única variable (precio de cierre). No incorpora volumen, volatilidad realizada, tipos de interés ni noticias, factores que dominan el precio del oro.
- Mejora pequeña en términos absolutos: entre el 1,3 % y el 3,6 % de reducción de la pérdida de cuantiles. El adaptador es mejor en solo el 61-63 % de las ventanas, por lo que en un 37-39 % el modelo base gana.
- Riesgo de cambio de régimen: el tramo de entrenamiento (2013-2022) tiene un máximo cercano a 2.070 USD/oz, mientras que el test de 2025-26 cubre 2.600-5.600 USD/oz. Aunque la mejora se mantiene, la calibración de los cuantiles en niveles de precio muy superiores no está garantizada más allá de lo medido.
- Ausencia de calibración reportada: se publica pérdida de cuantiles, pero no cobertura empírica de los intervalos ni tests de calibración probabilística (PIT, CRPS desglosado).
- Sesgo de selección potencial: la validación usa 512 ventanas aleatorias de 2023 y la selección del punto de parada se hizo sobre esa pérdida; los periodos de test mitigan pero no eliminan este riesgo.
- Adopción prácticamente nula: 0 descargas y 1 like en el momento de la consulta, un único autor y sin revisión por pares. Conviene tratar los resultados como no replicados de forma independiente.
- Licencia: el adaptador es apache-2.0, pero la licencia del modelo base `amazon/chronos-2` no se detalla en la información disponible y debe verificarse antes de un uso comercial.
- Dependencia de la librería: requiere `chronos-forecasting>=2.3`; cambios de API en esa librería pueden romper el código de ejemplo.
- Idiomas y sesgos sociales: no aplica, al no procesar texto ni datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/menes000/chronos-2-xauusd-3m-lora
- Modelo base: https://huggingface.co/amazon/chronos-2
- Registro de entrenamiento (en el repositorio): `training_log.csv`
- Comparativa gráfica LoRA vs base (en el repositorio): `lora_vs_base.png`
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las búsquedas devolvieron únicamente páginas de skins de Minecraft sin relación alguna con el artefacto.
