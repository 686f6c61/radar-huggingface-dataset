# FINAL-Bench/Darwin-27B-RSI-Decision

## Resumen

Darwin-27B-RSI-Decision es un modelo de clasificación probabilística desarrollado por FINAL-Bench (con autoría citada de VIDRAFT) que funciona como motor de decisión de un solo paso hacia delante. A diferencia de un modelo generativo convencional, no produce tokens: recibe un estado y un conjunto de preguntas tipadas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta. Admite tres formatos de pregunta: `noul` (sí/no), `choice` (una entre N etiquetas) y `score` (una rúbrica ordenada).

El modelo se construye sobre el backbone FINAL-Bench/Darwin-27B-RSI, entrenado a peso completo como motor de decisión. Emplea atención bidireccional sobre el prompt (estado, pregunta y lista de opciones) y una cabeza de lectura que mapea el estado oculto final a una puntuación por opción, con softmax y temperatura de calibración ajustada. Los pesos están en BF16 y el repositorio ocupa 51,3 GB.

Es relevante por su enfoque: sustituye la generación de texto por una lectura calibrada y probabilística de decisiones, lo que reduce latencia (una pasada) y facilita la integración en pipelines que necesitan etiquetas con confianza cuantificada. Su licencia Apache 2.0 y su compatibilidad con endpoints lo hacen apto para despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (`qwen3_5_text`) con atención bidireccional sobre el prompt y cabeza de lectura de decisión |
| Parametros totales | 25.624.600.064 (~25,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (max length del servidor de referencia) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), más `readout.safetensors` para la cabeza de decisión |

## Arquitectura y entrenamiento

El modelo parte del backbone Darwin-27B-RSI y se entrena a peso completo como motor de decisión. La innovación principal es el tratamiento del prompt con atención bidireccional: el estado, la pregunta y la lista de opciones se leen conjuntamente, y la lectura de la respuesta se resuelve en una única pasada hacia delante. Las opciones se presentan en el prompt con códigos cortos; una cabeza de lectura (`readout.safetensors`) proyecta el estado oculto final a una puntuación por opción, que tras softmax y una temperatura de calibración ajustada produce la distribución de probabilidad final.

Los datos de entrenamiento combinan los splits de entrenamiento y desarrollo de benchmarks públicos de decisión, datos sintéticos escritos específicamente para el modelo (historias de razonamiento multi-paso, preguntas sobre salida de código, sentimiento de entidades financieras, pares de aspecto/sentimiento de reseñas) y diálogos con variantes de esquema construidos a partir de los splits de SGD y SGD-X (CC-BY-SA-4.0). El autor declara que no se usó el split de test de ningún benchmark y que las filas sintéticas se verificaron contra la suite pública Decision Index con solapamiento de 13-gramas.

## Capacidades

- Clasificación probabilística de decisiones en una sola pasada, sin generación de tokens.
- Soporte de tres tipos de pregunta: `noul` (sí/no), `choice` (una entre N etiquetas) y `score` (rúbrica ordenada).
- Salida calibrada: distribución de probabilidad por opción con temperatura ajustada.
- Razonamiento multi-paso implícito a través de historias sintéticas de razonamiento en el entrenamiento.
- Preguntas sobre salida de código (evaluación de resultados de ejecución).
- Análisis de sentimiento de entidades financieras.
- Extracción de aspecto y sentimiento en pares de reseñas.
- Diálogos con variantes de esquema (SGD/SGD-X), útil para enrutado y clasificación de intenciones.
- Compatibilidad con endpoints (`endpoints_compatible`) y servidor propio `/v1/systemone`.
- No soporta tool calling, agentes ni multimodalidad de forma nativa (no documentado).

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con opciones como reembolsar, escalar o cerrar, devolviendo la probabilidad de cada acción para priorizar la cola de atención.
- Moderación y triaje de contenido: con preguntas `noul` (¿es spam?, ¿es abusivo?) el modelo ofrece una probabilidad calibrada que permite fijar umbrales de revisión humana.
- Clasificación de intenciones en asistentes conversacionales: usando diálogos con variantes de esquema, puede mapear la utterance del usuario a una de N intenciones con confianza cuantificada.
- Análisis de sentimiento financiero: sobre noticias o comunicados, con preguntas `score` sobre una rúbrica ordenada de sentimiento (muy negativo a muy positivo).
- Evaluación automática de salidas de código: preguntas sobre si un resultado de ejecución es correcto, con distribución de probabilidad para filtrar casos dudosos.
- Extracción de aspectos en reseñas de producto: pares aspecto/sentimiento para alimentar dashboards de calidad percibida.
- Verificación de hipótesis en pipelines de datos: preguntas `noul` sobre consistencia de registros, con probabilidad calibrada para decidir si se requiere revisión.

## Benchmarks y rendimiento

Resultados del Decision Index (suite pública, ejecución propia del autor con el kit de reproducción `apolinario/decision-index`, motor `http`, todas las peticiones respondidas):

| Métrica | Darwin-27B-RSI-Decision |
|---|---|
| Balanced skill ↑ | 68,77 |
| Knowledge & Reasoning | 54,00 |
| Language | 71,74 |
| Retrieval | 73,06 |
| Tools | 85,59 |
| Arts | 59,99 |

El autor indica que la cifra oficial del board proviene de la evaluación privada ejecutada por el operador; la tabla anterior corresponde a su propia ejecución de la suite pública. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 51 GB solo para pesos, más overhead de activaciones y prompt de hasta 32.768 tokens; se recomienda al menos 80 GB para operar con margen.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24 GB con sharding).
- No cabe en una GPU de consumo individual en BF16; requeriría cuantización (no publicada oficialmente) para intentarlo en RTX 4090 o similares.
- Opciones de despliegue: el repositorio incluye `decision_server.py` (FastAPI + Uvicorn) con el endpoint `/v1/systemone`; la inferencia usa `autojev/` con PyTorch y Transformers. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma explícita; el servidor de referencia usa batch 8, una pasada por pregunta y max length 32768 sin truncamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (motores de decisión de una pasada con salida probabilística tipada) en la documentación proporcionada. Como referencia de tamaño, el backbone se basa en la familia Qwen 3.5 de ~25,6 B, pero no se han publicado comparativas directas de rendimiento con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Darwin-27B-RSI-Decision | ~25,6 B | 32.768 | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- No es un modelo generativo: no produce texto libre, solo distribuciones sobre opciones predefinidas.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento; la temperatura ajustada puede no generalizar a dominios nuevos.
- Sesgos heredados del backbone y de los datos sintéticos y de SGD/SGD-X, no evaluados de forma independiente en la información disponible.
- El modelo card reconoce que las cifras del Decision Index son de ejecución propia del autor; la validación oficial del operador no se detalla.
- No hay soporte documentado para tool calling, agentes o multimodalidad.
- El repositorio es grande (51,3 GB) y requiere infraestructura con suficiente VRAM; no se han publicado cuantizaciones oficiales.
- Aunque la licencia es Apache 2.0, los datos de entrenamiento incluyen SGD/SGD-X bajo CC-BY-SA-4.0, lo que conviene revisar para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI-Decision
- Backbone: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Kit de reproducción Decision Index: https://github.com/apolinario/decision-index
- Código de inferencia autojev: https://github.com/denis-pplx/autojev
