# edoggy/commodities-crop-analyst-7b

## Resumen

`commodities-crop-analyst-7b` es un adaptador LoRA (PEFT) sobre Qwen2.5-7B-Instruct, desarrollado por el usuario edoggy, especializado en el análisis de oferta de cultivos y commodities agrícolas mediante tool calling. El modelo no responde con conocimiento paramétrico sobre datos agrícolas: su diseño le obliga a invocar herramientas que consultan tablas de datos empaquetadas en el propio repositorio (acreaje del USDA CDL para 11 estados entre 2018 y 2024, el Censo de Agricultura de 2022, rendimientos del IBGE de São Paulo, fechas de informes del USDA y futuros de azúcar, zumo de naranja, maíz, soja, trigo y algodón). Resuelve el problema de las alucinaciones numéricas en dominios con datos tabulares sensibles, forzando que toda cifra mostrada provenga de una consulta ejecutada.

El modelo se distribuye como adaptador PEFT (0,1 GB) y requiere descargar el modelo base Qwen2.5-7B-Instruct por separado. Incluye un runtime propio (`runtime.py`) con interfaz Gradio que expone, bajo cada respuesta, la llamada a herramienta exacta y su resultado para permitir la verificación manual de cada número. Está pensado para analistas de materias primas agrícolas que necesitan trazabilidad de datos, no para trading.

La relevancia actual reside en su enfoque de "respuesta solo desde datos consultados" aplicado a un vertical concreto, con una evaluación declarada de 785 preguntas retenidas en las que el 95,6% elige la herramienta correcta y el 92,9% produce argumentos exactos, sin llamadas malformadas. La licencia Apache-2.0 del adaptador y del modelo base facilita su uso comercial, aunque las limitaciones de cobertura geográfica y temporal son estrictas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT); r=16 |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se distribuye aparte (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) documentada en el runtime; no se listan otras |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + joblib (artefactos de datos); requiere el base en safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 sobre Qwen2.5-7B-Instruct, entrenado con QLoRA durante 400 pasos con learning rate 1e-4 en una única RTX 5070. El entrenamiento se generó de forma sintética: 12.000 ejemplos construidos a partir de las tablas de datos incluidas en el repositorio mediante el script `45_gen_v2.py`, con preguntas muestreadas entre 24 y 66 paráfrasis por intención generadas por un LLM (`44_paraphrase.py`). Cada ejemplo incluye la llamada a herramienta gold, la respuesta gold calculada desde los datos y casos de aclaración o fuera de alcance.

La innovación técnica no está en la arquitectura del transformer, sino en el diseño del sistema: el modelo actúa como planificador de llamadas a herramientas sobre un conjunto cerrado de funciones (consulta de acreaje CDL, comparación estado a estado, validación de modelos de caña de azúcar, proyección estadística de precios con deriva estacional y cono de volatilidad al 80%, expansión de caña en Luisiana para el año siguiente y renderizado de mapas de probabilidad y gráficos). El runtime empaqueta datos, herramientas y ejecución en el propio repositorio, de modo que las respuestas son autocontenidas y auditables.

## Capacidades

- Generación de texto con razonamiento acotado al dominio agrícola y de commodities.
- Tool calling / function calling sobre un conjunto cerrado de herramientas de consulta de datos.
- Consulta de área, cambio interanual, rankings y comparaciones estatales a partir del USDA CDL.
- Validación de modelos de caña de azúcar frente a CDL y censo, por condado.
- Historial de precios y proyección estadística (`price_forecast`) con intervalo del 80% y error de backtest declarado (6–11% a 30 días; cobertura del intervalo 78–84%).
- Predicción de expansión de caña de azúcar en Luisiana para el año siguiente (modelo `sugarcane-forecast-v2`, recall de caña nueva 0,95 / precisión 0,83).
- Renderizado de mapas de probabilidad de caña para 20 condados de Luisiana y Florida y de gráficos de precios.
- Formulación de preguntas aclaratorias cuando falta año o lugar, y declaración explícita de fuera de alcance.
- Capacidades multilingües: no disponibles en la model card (heredadas del base, no evaluadas).

## Casos de uso

- Análisis de superficie sembrada: un analista pregunta por el cambio de acreaje de maíz en Iowa entre 2020 y 2023; el modelo invoca la herramienta CDL y devuelve la cifra con la llamada y el resultado visibles para verificación.
- Comparación entre estados: consultas del tipo "¿qué estado lideró el acreaje de soja en 2022?" se resuelven con rankings calculados desde la tabla, no desde memoria del modelo.
- Validación de modelos de teledetección: comparación por condado entre las predicciones del clasificador de caña, el CDL y el censo de 2022, útil para equipos que desarrollan modelos de segmentación de cultivos.
- Seguimiento de precios de futuros: consulta de historial y proyección a 30 días con intervalo y error de backtest, para contextualizar conversaciones sobre azúcar, zumo de naranja, maíz, soja, trigo o algodón sin pretensión direccional.
- Planificación de expansión de caña en Luisiana: uso del modelo `sugarcane-forecast-v2` para estimar nuevos cañaverales y retiradas del año siguiente, con la advertencia de que las retiradas están subestimadas.
- Generación de material visual para informes: renderizado de mapas de probabilidad de caña en 20 condados de Luisiana y Florida y de gráficos de precios listos para incluir en documentos.
- Asistencia a equipos de investigación agronómica: consultas exploratorias sobre fechas de informes del USDA y rendimientos del IBGE de São Paulo, con trazabilidad de la fuente en cada respuesta.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre 785 preguntas retenidas cuyas formulaciones nunca aparecieron en entrenamiento:

| Metrica | Resultado |
|---|---|
| Herramienta correcta elegida | 95,6% |
| Argumentos exactos | 92,9% |
| Resultado ejecutado idéntico al gold | 92,9% |
| Llamadas a herramienta malformadas | 0 |
| Preguntas subespecificadas o fuera de alcance gestionadas sin llamada | 177 / 177 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12 GB de GPU con cuantización 4-bit, según las instrucciones del autor.
- GPU recomendadas: el autor entrenó en una RTX 5070; para inferencia 4-bit basta una GPU consumer con 12 GB o más.
- Cabe en GPU consumer: sí, con 4-bit y al menos 12 GB de VRAM.
- Opciones de despliegue: el repositorio incluye `runtime.py` con interfaz Gradio en el puerto 7860; requiere transformers, peft, bitsandbytes, accelerate, gradio, pandas, pyarrow, rasterio, matplotlib, joblib y scikit-learn. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| commodities-crop-analyst-7b | 7B + LoRA r=16 | no disponible | Tool calling sobre datos agrícolas empaquetados | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Asistente generalista con tool calling | Apache-2.0 | Hugging Face |
| Alternativas verticales de agricultura | no disponible | no disponible | Análisis de cultivos y agricultura de precisión | no disponible | No se identifican modelos comparables directos en la búsqueda |

La búsqueda web solo devuelve un directorio genérico de modelos para agricultura sin fichas técnicas concretas; no se dispone de alternativas comparables con parámetros y benchmarks verificables.

## Limitaciones y advertencias

- No es una herramienta de trading: los datos de superficie satelital y CDL solo están disponibles después de los informes del USDA, por lo que no hay ventaja temporal; las previsiones son líneas base con barras de error, no predicciones direccionales.
- Las proyecciones de precios a más de 120 días están subcalibradas en backtests para contratos volátiles como el zumo de naranja; la herramienta lo señala en su salida.
- Cobertura exclusivamente estadounidense (LA, FL, TX, IA, IL, IN, MN, NE, KS, ND, GA) para 2018–2024, más un estado brasileño en rendimientos; sin stocks, demanda, tipos de cambio ni meteorología intraestacional.
- El acreaje se deriva de mapas: cambios interanuales por condado inferiores al 5% están dentro del ruido de mapeo.
- Tasa de error del 7% en argumentos de herramienta: el autor recomienda revisar la llamada mostrada bajo cada respuesta para cualquier cifra crítica.
- Las retiradas de caña están subestimadas en el modelo de expansión.
- Sesgos conocidos: no documentados explícitamente en la model card.
- Riesgo de alucinación: mitigado por diseño (solo responde desde datos consultados), pero no eliminado; el 7% de argumentos inexactos puede producir respuestas incorrectas aunque bien formadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia de los datos subyacentes (USDA NASS es dominio público; Google Satellite Embedding V1 es CC-BY-4.0 y requiere atribución).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edoggy/commodities-crop-analyst-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo de previsión de caña: https://huggingface.co/edoggy/sugarcane-forecast-v2
- Clasificador de caña: https://huggingface.co/edoggy/sugarcane-classifier-v1
- Dataset de indicadores de oferta: https://huggingface.co/datasets/edoggy/commodity-supply-indicators
- Dataset de embeddings satelitales de caña: https://huggingface.co/datasets/edoggy/sugarcane-satellite-embeddings
- Directorio de modelos de agricultura (referencia genérica): https://lmmarketcap.com/ai-for-agriculture
