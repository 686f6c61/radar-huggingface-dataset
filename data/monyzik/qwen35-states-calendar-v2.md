# Monyzik/qwen35-states-calendar-v2

## Resumen

Qwen35-states-calendar-v2 es un conjunto de adaptadores LoRA publicados por el usuario Monyzik sobre el modelo base Qwen/Qwen3.5-0.8B, orientados a la extracción de hechos (fact extraction) y la normalización temporal en llamadas de soporte técnico en ruso. No se trata de un modelo completo, sino de un pipeline de inferencia en varias etapas que combina dos adaptadores PEFT (uno generalista para cinco atributos de hechos y otro focalizado en `service_state` y `tariff`), una política de fusión congelada y un enlazador temporal aprendido (encoder de spans más cabeza de clasificación).

El problema que aborda es concreto: dado un registro JSONL de llamadas con turnos de conversación, extraer hechos estructurados con citas de origen verificables y resolver intervalos de fechas válidos. El autor reporta resultados sobre un conjunto de validación de 383 llamadas y 1.845 hechos de referencia, con una precisión de hechos del 54,27% y un recall del 53,44% (F1 del 53,85%), por encima de la línea base del organizador, aunque por debajo de los umbrales de aceptación del caso (45,06% / 51,45% en recall temporal y precisión de estado actual, respectivamente).

Es relevante ahora porque documenta un patrón de trabajo reproducible con adaptadores pequeños sobre modelos de menos de mil millones de parámetros, con evaluación oficial trazable, hashes de componentes y procedencia de métricas. La release es explícitamente de investigación y no alcanza los umbrales de aceptación declarados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer Qwen3.5-0.8B; pipeline con encoder de spans no lineal (FactSetNet) y cabeza de enlace temporal |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base Qwen3.5-0.8B tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; los scripts usan `--max-input-tokens 16384` y `--max-batch-input-tokens 32768` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

El pipeline se compone de dos pasadas de generación sobre el mismo modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`). La primera usa el adaptador `primary/` (lora-v3, época 1) para los cinco atributos de hechos; la segunda usa `states/` (checkpoint-500), que emite únicamente `service_state` y `tariff`. Una política de fusión congelada (`state-policy.json`) combina ambas salidas con predicciones de estado ancladas a la fuente. Después, un enlazador temporal entrenado (encoder `temporal/encoder/` congelado y cabeza `temporal/head/`, época 6, con `temporal-policy.json`) resuelve fechas y asocia hechos a intervalos.

El adaptador focalizado parte del lora-v3 época 1 y se entrenó durante 500 actualizaciones con acumulación 4, tasa de aprendizaje 2e-5 y semilla 42, sobre 2.000 ejemplos muestreados de un pool elegible de 5.948 llamadas. La selección de checkpoint se hizo con un piloto de desarrollo de 64 llamadas (32 sintéticas retenidas y 32 de regresión realistas); el autor advierte que las ganancias observadas en ese piloto no se trasladaron a la validación completa. La validación oficial no se usó ni para entrenamiento ni para selección de checkpoint. Los scripts de inferencia, validación de intervalos, alineación de citas y resolución de fechas están incluidos en `src/` y `scripts/`.

## Capacidades

- Extracción de hechos estructurados a partir de conversaciones de soporte en ruso, con cinco atributos gestionados por el adaptador `primary/`.
- Emisión focalizada de `service_state` y `tariff` mediante el adaptador `states/`.
- Resolución y normalización de fechas con intervalos válidos: el pipeline garantiza cero intervalos inválidos o invertidos en la validación reportada.
- Alineación de citas de origen (grounding) a nivel de turno y de span: 77,89% de acierto en turno y 83,38% en span.
- Salida estrictamente JSON: 383 respuestas JSON estrictas en la pasada focalizada, sin truncamientos ni abortos por campos repetidos.
- Enlace temporal hecho-fecha mediante un encoder de spans no lineal entrenado.
- Fallback controlado de fechas: un inicio inválido cae a la hora de la llamada y un fin inválido o invertido se marca como desconocido (`null`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Extracción de hechos en centros de soporte en ruso: el pipeline procesa llamadas JSONL con turnos y devuelve hechos estructurados con citas al texto original, útil para poblar CRM con datos verificables en lugar de resúmenes libres.
- Auditoría de calidad de transcripciones: la alineación de spans (83,38%) permite señalar qué fragmento exacto de la conversación respalda cada hecho extraído, lo que facilita la revisión humana de casos dudosos.
- Normalización de fechas en sistemas de ticketing: el enlazador temporal convierte expresiones relativas o ambiguas del habla en intervalos de validez, con política de fallback definida para inicios y fines no resolubles.
- Detección de cambios de estado de servicio y tarifa: el adaptador `states/` se especializa en estos dos atributos, adecuado para flujos donde el estado contractual es el dato crítico y el resto de hechos es secundario.
- Investigación reproducible en extracción de información: el repositorio incluye hashes de componentes, procedencia de evaluación y scripts de validación, lo que permite replicar el pipeline y comparar variantes de adaptadores sobre el mismo conjunto.
- Prototipado con presupuesto de hardware reducido: al apoyarse en un modelo base de 0,8B con adaptadores LoRA, el conjunto puede ejecutarse en una única GPU de consumo; el autor probó el runtime de Qwen en una RTX 4090.
- Generación de datasets etiquetados: las salidas con intervalos validados y citas alineadas pueden servir como preetiquetado para anotación humana en dominios de soporte temporal.

## Benchmarks y rendimiento

Resultados de validación completa reportados por el autor (evaluador oficial 2.1, 383 llamadas, 1.845 hechos de referencia):

| Metrica | Baseline del organizador | Este pipeline |
|---|---:|---:|
| Precisión de hechos | 33,48% | 54,27% |
| Recall de hechos | 38,05% | 53,44% |
| F1 de hechos (derivado) | 35,62% | 53,85% |
| Recall temporal | 47,06% | 40,00% |
| Precisión de estado actual | 53,45% | 46,39% |
| Grounding de turno | 78,35% | 77,89% |
| Grounding de span | No disponible | 83,38% |

Detalles adicionales reportados: el pipeline emite 1.817 hechos con 986 coincidencias oficiales; la corrección temporal es de 246/615 y la de estado actual de 289/623. Los umbrales de aceptación del caso son 45,06% (recall temporal) y 51,45% (precisión de estado actual), que esta release no alcanza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de 0,8B y adaptadores LoRA, el requisito es moderado y cabe holgadamente en GPUs de consumo actuales.
- GPU probada por el autor: RTX 4090 para el runtime de generación de Qwen.
- El runtime de características de fecha se ejecutó en CPU con Transformers 4.57.6.
- Entornos separados recomendados: Python 3.11, PyTorch 2.15.0, Transformers 5.23.0, PEFT 0.21.3 y CUDA para la generación; Transformers 4.57.6 en CPU para las características de fecha.
- Opciones de despliegue: scripts propios del repositorio (`scripts/predict_qwen35_calendar.py`, `apply_qwen_state_policy.py`, `train_qwen_temporal_linker.py`, `apply_qwen_temporal_linker.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los scripts permiten `--batch-size 8`, `--max-input-tokens 16384`, `--max-batch-input-tokens 32768`, `--max-new-tokens 4096` (pasada primaria) y `--max-new-tokens 3072` (pasada de estados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Monyzik/qwen35-states-calendar-v2 | Adaptadores LoRA sobre 0,8B | No disponible (scripts hasta 16k de entrada) | Extracción de hechos y normalización temporal en ruso | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible en la información proporcionada | Modelo generativo generalista | No disponible en la información proporcionada | Hugging Face |
| Alternativas de extracción de hechos con LoRA sobre modelos pequeños | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la comparación se limita al modelo base y a la línea base del organizador incluida en la model card.

## Limitaciones y advertencias

- Release de investigación: el propio autor indica que no alcanza los umbrales de aceptación del caso (45,06% de recall temporal y 51,45% de precisión de estado actual).
- El recall temporal (40,00%) y la precisión de estado actual (46,39%) quedan por debajo de la línea base del organizador (47,06% y 53,45%), pese a la mejora en precisión, recall y F1 de hechos.
- Las ganancias observadas en el piloto de desarrollo de 64 llamadas no se trasladaron a la validación completa; no debe extrapolarse el rendimiento del piloto.
- Cargar únicamente `states/` no reproduce el extractor completo: es necesario ejecutar ambas pasadas y aplicar los componentes de fusión y fechas.
- El modelo base debe descargarse por separado y con la revisión exacta indicada; no se incluye en el repositorio (0,3 GB).
- Soporte exclusivo de ruso; no se documentan capacidades multilingües.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base y de los adaptadores.
- Riesgo de alucinación inherente a la generación: la evaluación reporta 1.817 hechos emitidos frente a 986 coincidencias oficiales, lo que implica una proporción relevante de hechos no validados.
- Dependencia de dos entornos Python incompatibles entre sí (generación y características de fecha), lo que complica el despliegue en producción.
- Sin datos publicados de latencia, throughput ni cuantizaciones soportadas; el rendimiento en hardware distinto de la RTX 4090 no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monyzik/qwen35-states-calendar-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión del modelo base: `2fc06364715b967f1860aea9cf38778875588b17`
