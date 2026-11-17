# david-rename/jev-pp-14B

## Resumen

jev-pp 14B es un adaptador LoRA de rango 16 sobre Qwen3-14B, publicado por el usuario david-rename, que convierte el modelo base en un "modelo de decisión": en lugar de generar texto, responde preguntas tipadas sobre un estado dado devolviendo una distribución de probabilidad sobre las opciones de cada pregunta. El adaptador entrena 64,2 millones de pesos (257 MB) sobre las 7 capas lineales de cada uno de los 40 bloques del transformer, y la respuesta se lee directamente de las probabilidades del siguiente token en la posición de respuesta de cada pregunta.

Forma parte de una familia de tres modelos construidos de la misma manera: jev-pico (0,6B), jev-pp 1.7B y este jev-pp 14B. Este último se entrenó con 154.887 casos en cuatro horas sobre una única NVIDIA L40S, extraídos de un pool de 1.979.830 casos y 61 tipos de pregunta construidos a partir de 51 datasets públicos. La innovación clave es que cada pregunta se enmascara para leer únicamente el estado y a sí misma, de modo que el orden de las preguntas no afecta al resultado.

Es relevante porque propone un patrón distinto al de los LLM generativos: en lugar de pedir al modelo que escriba una respuesta, se explota la distribución del siguiente token para obtener probabilidades calibradas sobre opciones discretas, lo que resulta útil para tareas de evaluación, clasificación y anotación donde se necesita una medida de incertidumbre en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-14B) con adaptadores LoRA de rango 16 sobre las 7 capas lineales de cada uno de los 40 bloques |
| Parametros totales | 14,8 mil millones (modelo base) + 64,2 millones entrenados en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 448 tokens para el estado (recortado en entrenamiento); el numero de preguntas por peticion esta limitado a 16 |
| Tipos de cuantizacion | No disponible (los pesos se sirven en 16 bits; el autor indica que cargar el adaptador en cuantizacion rompe la correccion de 1 parte en 100) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, adapter_config.json) en formato PEFT; incluye jev_pp.py y serve.py |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA de rango 16 aplicado sobre Qwen3-14B. El adaptador añade 64,2 millones de pesos entrenables (257 MB en disco) distribuidos sobre las 7 capas lineales de cada uno de los 40 bloques del transformer. Los pesos base se mantienen en 16 bits y el adaptador no se fusiona con ellos: el autor explica que una corrección de 1 parte en 100 no sobrevive dentro de un peso de 16 bits, por lo que la aritmética se realiza también en 16 bits.

El entrenamiento se realizó sobre 154.887 casos muestreados de un pool de 1.979.830, con 61 tipos de pregunta derivados de 51 datasets públicos (comentarios y valoraciones de toxicidad, insulto, amenaza, odio y ofensa; pares de frases para entailment y paráfrasis; reseñas y sus puntuaciones, entre otros). El muestreo por tipo de pregunta es proporcional a la raíz cuadrada de su tamaño. El entrenamiento completo llevó cuatro horas en una NVIDIA L40S. La innovación técnica principal es el enmascaramiento por pregunta: cada pregunta lee el estado y a sí misma, pero no al resto de preguntas de la petición, de modo que el orden es irrelevante. La respuesta se extrae de las probabilidades del siguiente token en la posición de respuesta, sin generación de texto.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: tres tipos (`noul` para afirmaciones sí/no, `choice` para preguntas con 2 a 5 opciones, `score` para escalas con niveles de un token).
- Salida de distribuciones de probabilidad calibradas sobre las opciones de cada pregunta, no texto generado.
- Procesamiento por lotes de hasta 16 preguntas por petición sobre un mismo estado, con independencia del orden.
- Soporte de criterios por pregunta (`criteria`) que definen el significado de cada respuesta.
- Distinción entre preguntas formuladas como "qué vería un lector" (distribución de juicios) y "qué se sostiene" (respuesta única consensuada).
- Capacidades multilingües limitadas al inglés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido convencional; su función es la evaluación probabilística de opciones.

## Casos de uso

- Moderación de contenido: clasificar comentarios según toxicidad, insulto, amenaza, odio u ofensa devolviendo una probabilidad por categoría, lo que permite fijar umbrales ajustables en producción en lugar de depender de una etiqueta discreta.
- Evaluación de entailment y paráfrasis: dado un par de frases, obtener las probabilidades de entailment, neutralidad y contradicción para construir pipelines de verificación de afirmaciones o deduplicación semántica.
- Anotación asistida con incertidumbre: usar las probabilidades como señal de confianza para priorizar qué casos requieren revisión humana en tareas de etiquetado.
- Análisis de reseñas: asignar una distribución sobre una escala de 1 a 5 estrellas a partir del texto de una reseña, útil para agregar opiniones con intervalos de confianza.
- Enrutado y clasificación de tickets: formular preguntas de elección múltiple sobre el estado (texto del ticket) para decidir categoría o urgencia con una medida explícita de incertidumbre.
- Evaluación de sistemas generativos: usar el modelo como juez probabilístico que puntúa respuestas de otros modelos sobre criterios definidos, aprovechando la distinción entre "lo que vería un evaluador" y "lo que se sostiene".
- Investigación en calibración: servir como banco de pruebas para estudiar cómo se comportan las distribuciones del siguiente token en tareas de decisión con opciones discretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente un ejemplo cualitativo de calibración sobre el par "It rained all night." / "The street was wet in the morning.": entailment 0,779, neutral 0,210, contradiction 0,011 cuando se pregunta qué vería un lector, frente a entailment 0,865, neutral 0,133, contradiction 0,002 cuando se pregunta qué se sostiene.

## Requisitos de hardware

- VRAM estimada: aproximadamente 30 GB para el modelo base en 16 bits (28 GB en la tarjeta durante la inferencia, según el autor), más el adaptador de 257 MB.
- GPU recomendadas: NVIDIA L40S (la empleada en entrenamiento y en el ejemplo de servicio), A100 40/80 GB, H100.
- No cabe en GPU de consumo de 24 GB en 16 bits; el autor no documenta una ruta de cuantizacion y advierte que el adaptador está pensado para pesos en 16 bits.
- Opciones de despliegue: servidor propio incluido (`serve.py`, basado en la biblioteca estándar) con endpoint `/v1/decisions`; carga mediante `PeftModel.from_pretrained` o el módulo `jev_pp.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 90 ms por petición de un estado y varias preguntas en una L40S (106 tokens en el ejemplo de la model card). No se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-pp 14B | 14,8B base + 64,2M adaptador | 448 tokens de estado, 16 preguntas | Decision model sobre Qwen3-14B con LoRA | No disponible | Hugging Face (adaptador) |
| jev-pp 1.7B | 1,7B | No disponible | Misma familia, menor tamano | No disponible | Hugging Face y Space |
| jev-pico | 0,6B | No disponible | Misma familia, entrenado con 3 tipos de caso | No disponible | Hugging Face |
| Qwen3-14B | 14,8B | No disponible en la informacion proporcionada | LLM generativo base | No disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El estado de entrada se recorta a 448 tokens, lo que limita la cantidad de contexto que el modelo puede evaluar por petición.
- Solo soporta inglés; no se documenta rendimiento en otros idiomas.
- El adaptador por sí solo no convierte el modelo en un sistema de decisión: cargado en un servidor de texto convencional, solo modifica ligeramente la voz de Qwen3-14B. Las decisiones dependen del formato de la petición y de la máscara implementada en `jev_pp.py`.
- La aritmética en 16 bits introduce dependencia entre preguntas de una misma petición: entre una petición de 2 y una de 3 preguntas, una probabilidad puede variar hasta 0,017.
- El servidor incluido escucha en 127.0.0.1 por defecto, no tiene autenticación, responde a páginas de cualquier sitio y limita las peticiones a 64 KB y 16 preguntas.
- Riesgo de sesgo heredado de los 51 datasets públicos utilizados en el entrenamiento (toxicidad, odio, ofensa, reseñas), no cuantificado en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; no se documentan métricas de calibración.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la calidad del modelo.
- El modelo base debe descargarse por separado desde Qwen/Qwen3-14B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/jev-pp-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Modelo hermano jev-pp 1.7B: https://huggingface.co/david-rename/jev-pp
- Modelo hermano jev-pico: https://huggingface.co/david-rename/jev-pico
- Space de demostración (jev-pp 1.7B): https://huggingface.co/spaces/david-rename/jev-pp
- Artículo "Tuning the piano": https://dwood.ai/tuning-the-piano
- Página "Playing the piano": https://dwood.ai/jev-pp
- Repositorio del laboratorio: https://github.com/d-/jev-pp
