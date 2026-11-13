# FINAL-Bench/Darwin-Prediction-Weather

## Resumen

Darwin-Prediction-Weather es un sistema de predicción meteorológica desarrollado por VIDRAFT (publicado bajo la organización FINAL-Bench en Hugging Face). No es un modelo meteorológico end-to-end al uso: combina un motor de pronóstico numérico global con un núcleo de decisión basado en el modelo de lenguaje Darwin-27B, que incorpora una cabeza de lectura calibrada ZTC sobre el backbone RSI. El repositorio contiene únicamente los pesos del núcleo de decisión, no el motor de pronóstico.

El núcleo de decisión recibe un estado y una pregunta tipada, y devuelve en un único forward pass una probabilidad calibrada para cada opción de respuesta. En el contexto del sistema, transforma campos de pronóstico en decisiones operativas: autorizaciones de salida, superación de umbrales o probabilidades por categoría. Los pesos son idénticos a los de Darwin-27B-ZTC-v9.

La relevancia del sistema radica en sus resultados sobre WeatherBench 2: según la model card, el motor de pronóstico registra el error más bajo en las 15 celdas evaluadas del protocolo determinista (2020), por delante de todos los modelos del marcador oficial. Los pesos del núcleo de decisión se distribuyen con licencia Apache 2.0, mientras que el dataset de pronósticos asociado usa CC BY-NC-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5_text`); núcleo de decisión con backbone RSI y cabeza de lectura calibrada ZTC |
| Parametros totales | 25.624.600.064 (~25,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos y código del núcleo de decisión); dataset de pronósticos CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `readout.safetensors`) |

## Arquitectura y entrenamiento

El núcleo de decisión es un transformer de unos 25,6 mil millones de parámetros construido sobre el backbone Darwin-27B-RSI, con una cabeza de lectura ZTC calibrada. Su función no es generar texto libre, sino producir probabilidades calibradas por opción en un solo forward pass a partir de un estado y una pregunta tipada. El repositorio incluye además `engine_config.json`, que describe la configuración del motor de pronóstico: entradas, estrategias de fusión y la tabla de estrategia por variable y plazo de predicción seleccionada sobre datos de 2018.

El motor de pronóstico no es un modelo neuronal entrenado de novo, sino un sistema de post-procesado: para cada inicialización aplica corrección de sesgo por punto de rejilla y fusión ponderada por habilidad de pronósticos de entrada (media del ensemble GenCast, media del IFS ENS, GraphCast, Pangu-Weather, FuXi e IFS HRES, todos de los archivos públicos de WeatherBench 2), verificando contra ERA5. Los campos de corrección y los pesos de fusión usan únicamente datos cuya hora de verificación precede a la inicialización, y la estrategia por variable y plazo se seleccionó sobre 2018 y se congeló antes de la evaluación de 2020. No se documentan en la información disponible detalles sobre el volumen de tokens de entrenamiento del núcleo de decisión ni sobre etapas de RLHF o DPO.

## Capacidades

- Decisión probabilística calibrada: devuelve una probabilidad por opción en un único forward pass (go/no-go, superación de umbral, categorías).
- Conversión de campos de pronóstico meteorológico en decisiones operativas.
- Razonamiento sobre estados y preguntas tipadas (question answering estructurado).
- Generación de texto propia de un modelo de la familia Qwen 3.5 (según el tag `qwen3_5_text`), si bien la model card no detalla capacidades conversacionales.
- Servicio mediante `ztc_server.py` y herramientas auxiliares en `autojev/`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Predicción meteorológica global determinista: el motor de pronóstico genera campos globales a 1,5 grados con corrección de sesgo y fusión de ensembles; el núcleo de decisión permite explotar esos campos en flujos posteriores de decisión.
- Autorizaciones operativas (go/no-go): dado un estado de pronóstico y una pregunta tipada, el modelo devuelve la probabilidad calibrada de que se cumpla una condición operativa, útil para planificación de vuelos, logística o eventos.
- Evaluación de superación de umbrales: cálculo de probabilidad de que una variable (temperatura a 2 m, Z500, T850) supere un umbral crítico en un plazo dado, con calibración explícita.
- Clasificación por categorías de riesgo: asignación de probabilidades a categorías (por ejemplo, niveles de alerta) a partir de los campos de pronóstico fusionados.
- Investigación en verificación meteorológica: reproducción de los resultados de WeatherBench 2 con el dataset publicado y comparación con el marcador oficial.
- Integración en pipelines de decisión automatizados: el servidor `ztc_server.py` permite desplegar el núcleo como servicio que consume estados y preguntas tipadas y devuelve probabilidades.
- Análisis de incertidumbre en cadenas de pronóstico: combinación de la salida del motor (campos deterministas) con la lectura calibrada del núcleo para cuantificar riesgo en decisiones sensibles.

## Benchmarks y rendimiento

Resultados del motor de pronóstico en WeatherBench 2 (RMSE frente a ERA5, global, ponderado por latitud, 1,5 grados, 2020, 702 inicializaciones). La model card indica que el sistema obtiene el error más bajo en las 15 celdas evaluadas del protocolo determinista.

| Variable | 1 d | 3 d | 5 d | 7 d | 10 d |
|---|---|---|---|---|---|
| Temperatura a 2 m [K] | 0,468 | 0,743 | 1,107 | 1,531 | 1,984 |
| Mejor del marcador oficial | 0,488 | 0,786 | 1,125 | 1,552 | 2,022 |
| Z500 [m²/s²] | 33,7 | 108,5 | 240,6 | 400,3 | 595,4 |
| Mejor del marcador oficial | 36,8 | 113,8 | 250,7 | 415,1 | 606,5 |
| T850 [K] | 0,503 | 0,901 | 1,406 | 2,000 | 2,699 |
| Mejor del marcador oficial | 0,518 | 0,922 | 1,435 | 2,041 | 2,737 |

Los mejores valores del marcador oficial corresponden a WeatherMesh4 (de 1 a 7 días) y a la media del ensemble GenCast (10 días). No se han publicado resultados de benchmarks del núcleo de decisión (Darwin-27B-ZTC-v9) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~25,6 mil millones de parámetros, en FP16 se requerirían aproximadamente 51 GB de pesos, y en BF16/FP16 con overhead de activaciones y KV cache conviene prever más de 60 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, un despliegue en FP16 encaja en A100 80 GB o H100 80 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) en FP16; requeriría cuantización (no documentada) para reducir por debajo de ese umbral.
- Opciones de despliegue: el repositorio incluye `ztc_server.py` para servir el núcleo de decisión; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (WB2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-Prediction-Weather (núcleo) | ~25,6 B | no disponible | Mejor RMSE en las 15 celdas evaluadas según el autor | Apache 2.0 (pesos); CC BY-NC-SA 4.0 (dataset) | Hugging Face |
| WeatherMesh4 | no disponible | no disponible | Mejor del marcador oficial de 1 a 7 días | no disponible | no disponible |
| GenCast (media del ensemble) | no disponible | no disponible | Mejor del marcador oficial a 10 días | no disponible | no disponible |
| GraphCast | no disponible | no disponible | Entrada del motor de fusión | no disponible | no disponible |

La comparación se limita al rendimiento del motor de pronóstico; no hay datos públicos en la información proporcionada sobre parámetros ni contexto de los modelos meteorológicos alternativos, ya que operan sobre rejillas y no sobre texto.

## Limitaciones y advertencias

- El repositorio contiene únicamente los pesos del núcleo de decisión; el motor de pronóstico no se distribuye con los pesos y su reproducción depende de los archivos públicos de WeatherBench 2 y de `engine_config.json`.
- La evaluación se realizó sobre 2020 con 702 inicializaciones y resolución de 1,5 grados; no se documentan evaluaciones en otros años, resoluciones o regímenes climáticos.
- La estrategia de fusión se seleccionó sobre datos de 2018 y se congeló antes de 2020; su robustez fuera de ese período no está documentada.
- El dataset de pronósticos tiene licencia CC BY-NC-SA 4.0, lo que restringe el uso comercial de los datos aunque los pesos sean Apache 2.0.
- Los pronósticos de entrada pertenecen a sus proveedores originales y están sujetos a sus licencias.
- No se documentan sesgos, tasas de alucinación ni comportamiento del núcleo de decisión fuera del dominio meteorológico.
- No se especifican idiomas soportados, longitud de contexto ni opciones de cuantización, lo que limita la planificación de despliegues en producción.
- El modelo tiene 0 descargas y 2 likes en el momento de la consulta; es un artefacto reciente sin validación independiente más allá de la sumisión al marcador de WeatherBench 2.

## Enlaces

- Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-Prediction-Weather
- Modelo base (ZTC): https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v9
- Modelo base (RSI): https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Dataset de pronósticos: https://huggingface.co/datasets/VIDraft/Darwin-Prediction-Weather-WB2
- Sumisión al marcador de WeatherBench 2: https://github.com/google-research/weatherbench2/issues/320
