# AvaroSantamaria/brent-rnn

## Resumen

`brent-rnn` es un conjunto de modelos de serie temporal publicados por AvaroSantamaria para la previsión del precio del crudo Brent en USD/barril. Se compone de tres redes neuronales recurrentes (RNN) de una sola capa, una por cada horizonte temporal (+5, +63 y +252 fechas del calendario del Brent), y cada horizonte se entrena con tres semillas distintas (42, 43 y 44), lo que da un total de nueve modelos exportados a ONNX. La predicción final se obtiene como la base del último precio spot admisible más la media del cambio previsto por las tres semillas.

El modelo resuelve un problema acotado y muy específico: generar previsiones puntuales del Brent a corto, medio y largo plazo a partir de una ventana de 60 fechas con 21 variables disponibles a las 09:00 de Madrid. No es un modelo de lenguaje ni un transformer generativo; es un regresor de series temporales empaquetado con la librería ONNX, sin pesos en safetensors ni tokenizador, y su relevancia es la de un artefacto reproducible de un estudio académico o de investigación aplicada más que la de un componente listo para producción.

La información pública es escasa: el repositorio de Hugging Face ocupa 0.0 GB, no declara licencia, idiomas ni pipeline, y la model card reconoce explícitamente que las redes no superan a la regla simple que actualiza el último spot con el futuro de Brent. Cualquier evaluación debe partir de esa advertencia del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN de una capa por horizonte (+5, +63, +252 fechas), tres semillas por horizonte (42, 43, 44) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de entrada de 60 fechas con 21 variables |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`RNN_h<horizonte>_semilla<semilla>.onnx`), más `escalador_h<horizonte>.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una RNN de una sola capa por horizonte, con entrada `ventanas` de forma (lote, 60, n) y salida `cambio`. Cada una de las 21 variables de entrada se presenta con valor escalado e indicador de disponibilidad, y los precios se transforman a variación logarítmica diaria. La previsión se reconstruye como base más la media del cambio previsto por las tres semillas, donde la base combina el último Brent spot admisible con el cierre admisible del futuro de Brent en el origen, o el spot si no hay futuro disponible.

El entrenamiento utiliza datos disponibles hasta el 2 de enero de 2023. La calibración de los intervalos al 80 % se realizó sobre el periodo de validación 2018–2021, con anchuras fijas de ±4.10, ±15.99 y ±39.94 USD para los horizontes +5, +63 y +252 respectivamente. No se documenta en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO o cualquier técnica de ajuste fino; tampoco se detalla la innovación técnica más allá del esquema de ensembling por semillas y la separación por horizonte.

## Capacidades

- Previsión puntual del precio del Brent en USD/barril a tres horizontes: +5, +63 y +252 fechas del calendario del Brent.
- Ensembling por semillas: media del cambio previsto por tres modelos independientes por horizonte.
- Manejo explícito de valores ausentes mediante indicadores de disponibilidad por variable.
- Entrada multivariante de 21 variables con ventana temporal de 60 fechas.
- Intervalos de predicción al 80 % con anchura fija calibrada en validación.
- Exportación a ONNX para inferencia portable.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Análisis exploratorio de series de precios energéticos: el modelo permite generar previsiones a tres horizontes sobre el Brent y compararlas con la regla naive de último spot actualizado con futuros, que según el autor es el baseline que no se supera de forma fiable.
- Reproducción de un estudio académico: los ficheros ONNX, los escaladores y el `config.json` permiten replicar el pipeline del proyecto `oil-price-prediction` sin reentrenar.
- Prototipado de sistemas de alerta temprana: con la ventana de 60 fechas y los intervalos al 80 %, se puede construir un monitor que marque desviaciones fuera del intervalo, asumiendo la cobertura real observada (64 %, 78 % y 86 %).
- Docencia y experimentación con RNN en series temporales: el conjunto de nueve modelos con tres semillas sirve para ilustrar ensembling, escalado y evaluación con horizontes múltiples.
- Integración en pipelines ONNX Runtime: al ser un artefacto ONNX, puede desplegarse en servicios de inferencia ligeros sin dependencias de frameworks de deep learning pesados.
- Comparación de baselines en investigación de forecasting energético: útil como referencia de un modelo recurrente simple frente a métodos estadísticos o modelos de deep learning más complejos.

## Benchmarks y rendimiento

Evaluación en test desde el 2 de enero de 2023 con los modelos del estudio:

| Horizonte | Mejora frente al último precio conocido | Frente al último precio actualizado con futuros | Cobertura del intervalo al 80 % |
|---|---|---|---|
| +5 | +18.9 % | -2.0 % | 64 % |
| +63 | -2.2 % | -4.5 % | 78 % |
| +252 | -7.6 % | -7.7 % | 86 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se publican recuentos de parámetros.
- GPU recomendadas: no disponible; por la naturaleza del artefacto (RNN de una capa en ONNX) es razonable esperar que la inferencia sea viable en CPU, pero no se documenta ningún requisito concreto.
- Viabilidad en GPU de consumo: no disponible; no se especifican modelos ni umbrales de memoria.
- Opciones de despliegue: ONNX Runtime es la vía natural dada la librería declarada (`onnx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brent-rnn (AvaroSantamaria) | no disponible | ventana de 60 fechas, 21 variables | Mejora de +18.9 % a +5, -2.2 % a +63 y -7.6 % a +252 frente al último precio conocido | no disponible | Hugging Face, formato ONNX |
| Regla naive spot + futuros | no aplica | no aplica | Supera al modelo en +5 (-2.0 %), +63 (-4.5 %) y +252 (-7.7 %) | no aplica | Baseline descrito en la model card |
| Alternativas de forecasting energético | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor indica que las redes no superan a la regla simple que actualiza el último spot con el futuro de Brent; la mejora frente al último precio conocido procede sobre todo de esa actualización.
- A +63 y +252 no hay mejora fiable según la evaluación en test.
- Los intervalos al 80 % tienen anchura fija en USD y cubren menos de lo nominal en periodos muy volátiles (cobertura observada del 64 % a +5).
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de extrapolación incorrecta fuera del régimen de entrenamiento (datos hasta 2023-01-02).
- Limitaciones de contexto o idioma: la entrada está restringida a una ventana de 60 fechas y 21 variables; no es un modelo multilingüe.
- Restricciones de licencia para uso comercial: la licencia no está declarada, por lo que no puede asumirse permiso de uso comercial.
- No es una recomendación de inversión, tal y como advierte la model card.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que limita la validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/AvaroSantamaria/brent-rnn
- Repositorio del proyecto: https://github.com/AlvaroSantamariaAnton/oil-price-prediction
