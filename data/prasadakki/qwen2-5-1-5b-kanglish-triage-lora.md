# prasadakki/qwen2.5-1.5b-kanglish-triage-lora

## Resumen

El modelo `prasadakki/qwen2.5-1.5b-kanglish-triage-lora` es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario prasadakki en Hugging Face. Su propósito es la clasificación y el triaje estructurado de reseñas y mensajes de soporte escritos en *Kanglish*, es decir, kannada transcrito en alfabeto latino mezclado con inglés, un fenómeno de code-mixing habitual en zonas como Bengaluru y el norte de Karnataka.

El adaptador resuelve un problema muy concreto: extraer información estructurada (sentimiento, categoría, urgencia y resumen en inglés) de texto informal y code-mixed en dominios de restauración, cafeterías, reparto a domicilio y viajes/transporte. La salida es un JSON estricto con cuatro campos, lo que lo hace adecuado para pipelines de ingestión de feedback de clientes y enrutado automático de tickets.

Es relevante por su especialización: los modelos generalistas suelen fallar en la extracción de esquema JSON con texto Kanglish, mientras que este adaptador reporta una tasa de esquema válido del 100 % y un exact match del 100 % en el conjunto de test interno. Al ser un adaptador LoRA de 0,1 GB sobre un modelo de 1,5 mil millones de parámetros, el coste de despliegue es bajo y puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA 4 bits) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1,5 mil millones (modelo base); el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32 768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Entrenado en QLoRA 4 bits; el adaptador se distribuye en safetensors. Cuantizaciones del modelo fusionado no disponibles |
| Idiomas soportados | Kanglish (kannada en alfabeto latino mezclado con ingles); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parámetros con atención causal estándar. El ajuste se realizó mediante QLoRA de 4 bits, técnica que congela los pesos del modelo base cuantizados a 4 bits e introduce matrices de bajo rango entrenables en las capas de atención y proyección, reduciendo drásticamente los requisitos de memoria durante el entrenamiento.

El entrenamiento se centró en un corpus de reseñas y mensajes de soporte en Kanglish procedentes de dominios de comida, cafeterías, reparto y viajes/transporte en Bengaluru y el norte de Karnataka. El objetivo es la generación de un JSON estricto con los campos `sentiment` (`positive|negative|neutral|mixed`), `category` (`food_quality|delivery_service|ambience|pricing|ride_travel|other`), `urgency` (`low|medium|high`) y `english_summary`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo describe el ajuste supervisado sobre datos etiquetados con ese esquema.

## Capacidades

- Clasificación de sentimiento en cuatro clases sobre texto Kanglish code-mixed: positivo, negativo, neutro y mixto.
- Categorización del motivo de la reseña o incidencia en seis clases: calidad de comida, servicio de reparto, ambiente, precios, viajes/transporte y otros.
- Estimación de urgencia en tres niveles (baja, media, alta) orientada al triaje de tickets de soporte.
- Generación de un resumen en inglés a partir del texto original en Kanglish.
- Salida en JSON estricto y validable, apta para consumo programático.
- Comprensión de code-mixing kannada-inglés en alfabeto latino, un caso que los modelos generalistas suelen tratar con menor precisión.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido; el adaptador está orientado exclusivamente a la tarea de clasificación estructurada.

## Casos de uso

- Triaje automático de tickets de soporte: el adaptador recibe un mensaje de cliente en Kanglish y devuelve el JSON con sentimiento, categoría y urgencia, permitiendo enrutar el ticket al equipo adecuado (reparto, cocina, atención al cliente) sin intervención manual.
- Análisis de reseñas en plataformas de reparto y restauración: se procesan en lote las reseñas de usuarios de Bengaluru y el norte de Karnataka para agregar métricas de sentimiento y categoría por restaurante o zona.
- Monitorización de calidad en tiempo real: integrado en un pipeline de streaming, el modelo clasifica cada nueva reseña y dispara alertas cuando la urgencia es alta y la categoría es `food_quality` o `delivery_service`.
- Generación de resúmenes en inglés para equipos centrales: el campo `english_summary` permite que equipos que no leen Kanglish comprendan el feedback de clientes locales sin traducción manual.
- Priorización de incidencias en apps de movilidad: los mensajes de viajes y transporte se clasifican con la categoría `ride_travel` y la urgencia correspondiente, facilitando la asignación de agentes.
- Enriquecimiento de datasets de análisis: el adaptador puede etiquetar grandes volúmenes de feedback histórico en Kanglish para construir dashboards de sentimiento y categoría sin coste de anotación humana.
- Filtrado y moderación de reseñas: la clasificación de sentimiento y categoría permite detectar reseñas negativas recurrentes o contenido fuera de dominio antes de su publicación.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Configuracion | Esquema valido | Exact match (global) | F1 sentimiento | F1 categoria | F1 urgencia |
|---|---|---|---|---|---|
| Base zero-shot | 96,7 % | 17,9 % | 0,413 | 0,486 | 0,434 |
| Base few-shot (3-shot) | 93,8 % | 27,9 % | 0,475 | 0,678 | 0,426 |
| Fine-tuned v2 (QLoRA) | 100,0 % | 100,0 % | 1,000 | 1,000 | 1,000 |

Prueba de estrés fuera de distribución (`ood_test.jsonl`, 25 ejemplos):

| Metrica | v1 | v2 |
|---|---|---|
| Exact match | 52,0 % | 68,0 % |
| Precision de categoria | 60,0 % | 84,0 % |
| Precision de urgencia | no disponible | 92,0 % |
| Precision de sentimiento | no disponible | 84,0 % |

El conjunto de test interno cuenta con 179 ejemplos. Los resultados de exact match del 100 % en test interno deben interpretarse con cautela, ya que pueden reflejar solapamiento entre distribución de entrenamiento y test; la prueba OOD, con 25 ejemplos, muestra una caída notable (68 % de exact match), más representativa del rendimiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,1 GB; el modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM, y en cuantización de 4 bits en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) y en GPUs integradas con suficiente memoria compartida para cuantización 4 bits.
- Opciones de despliegue: vLLM y TGI para servir el modelo fusionado (adaptador + base); llama.cpp y Ollama si se convierte a GGUF; la librería PEFT permite cargar el adaptador sobre el base con `transformers` para inferencia directa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de 1,5B en una RTX 4090 se espera un throughput de cientos de tokens por segundo, pero no hay medición publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prasadakki/qwen2.5-1.5b-kanglish-triage-lora | 1,5B + LoRA | no disponible | Clasificacion Kanglish estructurada | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | 32 768 (segun documentacion del base, no confirmado aqui) | Generacion generalista | Apache 2.0 | Hugging Face |
| Adaptadores LoRA especializados en code-mixing indio | variable | variable | Clasificacion / extraccion | variable | Hugging Face |

No se dispone de benchmarks comparativos con otros adaptadores de la misma categoría en la información proporcionada. La comparación más directa es contra el modelo base sin ajustar, cuyos resultados zero-shot y few-shot se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para la tarea de clasificación estructurada en Kanglish; no debe usarse como modelo generativo general.
- El exact match del 100 % en test interno puede indicar sobreajuste o solapamiento con el conjunto de entrenamiento; la prueba OOD muestra un rendimiento significativamente inferior (68 % de exact match con solo 25 ejemplos).
- El dominio cubierto es limitado: comida, cafeterías, reparto y viajes/transporte en Bengaluru y norte de Karnataka; el rendimiento en otros dominios o variantes dialectales del kannada no está documentado.
- No se documentan sesgos conocidos ni evaluación de sesgos en la información disponible.
- Riesgo de alucinación en el campo `english_summary`, que es texto generado y no una traducción verificada.
- La lista de idiomas soportados no está disponible oficialmente; el modelo puede degradarse con kannada en escritura nativa (no latina) o con otras lenguas indias.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el adaptador con datos propios antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/prasadakki/qwen2.5-1.5b-kanglish-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
