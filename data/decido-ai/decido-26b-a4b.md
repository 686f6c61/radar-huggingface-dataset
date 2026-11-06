# decido-ai/decido-26b-a4b

## Resumen

Decido 26B-A4B es un modelo de decisión calibrado desarrollado por decido-ai, un fine-tune LoRA de google/gemma-4-26B-A4B-it. Su funcionamiento es distinto al de un modelo conversacional convencional: recibe un documento (`state`) y una pregunta tipada —sí/no (`noul`), elección única (`choice`) o escala ordenada (`score`)— y devuelve una distribución de probabilidad sobre las etiquetas posibles, no texto libre. Está empaquetado como GGUF de 8 bits (Q8_0) para ejecutarse con llama.cpp sobre CPU.

El modelo tiene 25.233.142.046 parámetros totales con arquitectura mixture-of-experts (aproximadamente 4B activos por token, según la model card). Su propuesta de valor es el despliegue en hardware modesto: la model card reporta inferencia CPU-only en un Apple M4 Pro con ~30 GB de RAM y latencias de p50 4,14 s para un estado de ~1k tokens con cinco preguntas. La licencia es Apache-2.0 y el modelo base es Gemma 4 26B-A4B-it, lo que condiciona el uso comercial según los términos del modelo original.

Es relevante ahora porque compite directamente con reproducciones abiertas de TypeSafe's Jev 1.13 en tareas de clasificación y calibración. La model card declara una media de seis grupos de 85,38 frente a 83,85 publicado por Jev, aunque el propio autor advierte que el margen debe leerse como supervisado en dominio. El modelo ha sido renombrado como parte de la familia Decido 1 (mismos pesos en decido-ai/decido-1-26b-a4b).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), fine-tune LoRA de google/gemma-4-26B-A4B-it |
| Parámetros totales | 25.233.142.046 |
| Parámetros activos | ~4B por token (según model card) |
| Longitud de contexto | 16384 tokens (configuración de llama-server en la model card) |
| Tipos de cuantización | GGUF Q8_0 (fichero publicado) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B-it, un transformer con mezcla de expertos de 26B parámetros totales y aproximadamente 4B activos por token. Sobre esa base se aplica un fine-tune LoRA orientado a una tarea muy específica: la lectura de etiquetas de un solo token. En lugar de generar texto, el modelo calcula la probabilidad del siguiente token sobre un conjunto cerrado de etiquetas (Yes/No, A–Z o A0–Z9 por encima de 26 opciones, 0–9 para escalas) y aplica un softmax con temperatura por tipo de pregunta (noul 1.027, choice 1.146, score 1.013), ajustada sobre tareas de validación y publicada en `bundle/temps.json`.

El prompt es fijo y está definido en `bundle/template.json`: instrucción de sistema, documento dentro de etiquetas `<document>` tratado explícitamente como no confiable, y un bloque de pregunta. Cada pregunta se decodifica por separado desde el estado cacheado, de modo que la respuesta a una pregunta no depende de las demás. La model card declara que el entrenamiento usó datos públicos, sin salidas de Jev ni de Claude, y que la procedencia y licencias de los datos están en el fichero `NOTICE`. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación binaria (sí/no) sobre un documento de entrada, devolviendo probabilidad calibrada.
- Elección única entre opciones etiquetadas (A–Z, y A0–Z9 por encima de 26 opciones).
- Puntuación en escala ordenada (0–9) con distribución de probabilidad por nivel.
- Calibración probabilística: la model card reporta Brier multiclase en cuatro de cinco conjuntos mejor que la referencia Jev.
- Determinismo: respuestas idénticas bit a bit en llamadas repetidas, órdenes de petición y número de hilos en CPU.
- Robustez al orden de opciones: tasa de volteo del 4,8 % agrupada (1,4 % con `perm=4`).
- Resistencia a inyección de prompt desde el documento: el prompt de sistema instruye a tratar el payload como no confiable y a romper cadenas de control de chat.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un modelo de decisión, no un chat.

## Casos de uso

- Moderación de contenido con criterios binarios: enviar el texto a revisar como `state` y una batería de preguntas sí/no (¿es spam?, ¿contiene datos personales?, ¿es discurso de odio?) obteniendo probabilidades calibradas que permiten fijar umbrales por política.
- Triaje documental en atención al cliente: clasificar tickets o correos en categorías predefinidas mediante preguntas `choice` con descripciones por opción, aprovechando que el estado se lee una vez y se cachea para todas las preguntas.
- Encuestas y escalas Likert automatizadas: convertir texto libre en puntuaciones 0–9 con distribución de probabilidad, útil para investigación de mercado o análisis de sentimiento graduado.
- Enrutamiento de pipelines de datos: decidir si un documento requiere revisión humana, qué equipo debe procesarlo o si cumple criterios de calidad, con la ventaja de que el modelo corre en CPU y no exige GPU en producción.
- Evaluación de riesgo en entornos con hardware limitado: portátiles o servidores sin GPU pueden ejecutar el GGUF Q8_0 con ~30 GB de RAM, adecuado para despliegues en edge o en máquinas de desarrollo.
- Clasificación de documentos largos con múltiples criterios: un único estado de hasta 16k tokens permite lanzar varias preguntas independientes (sí/no, elección, escala) sin recalcular el contexto, reduciendo coste por pregunta.
- Auditoría de decisiones automatizadas: al devolver probabilidades calibradas y ser determinista, el modelo facilita la trazabilidad y la reproducibilidad de clasificaciones en sistemas sujetos a revisión.

## Benchmarks y rendimiento

Resultados publicados en la model card para el GGUF Q8_0. Cinco grupos medidos en CPU; OpenJev medido con llama.cpp CUDA sobre las 222k peticiones.

| Grupo | Decido (GGUF) | Jev 1.13 (publicado) | Base zero-shot | Decido sin splits in-domain |
|---|---:|---:|---:|---:|
| JevBench (231) | 87,61 | 87,18 | 83,83 | 89,30 |
| Kev (6 splits) | 84,35 | 85,52 | 78,83 | 82,66 |
| OpenJev text (18 tareas) | 78,37 | 72,96 | 56,88 | 67,77 |
| Nimble (282) | 87,23 | 91,84 | 82,27 | 86,17 |
| VitaminC (599) | 86,14 | 78,46 | 73,62 | 79,47 |
| MASSIVE-en (350) | 88,57 | 87,14 | 86,86 | 86,86 |
| **Media de seis grupos** | **85,38** | **83,85** | 77,05 | 82,04 |

Calibración (Brier multiclase, menor es mejor; referencia Jev entre paréntesis): JevBench 0,169 (0,181), Kev v4 dev 0,210 (0,211), VitaminC 0,202 (0,313), MASSIVE 0,164 (0,204); peor en Kev v9 dev 0,267 (0,212).

## Requisitos de hardware

- VRAM/RAM: ~30 GB de RAM por proceso para el GGUF Q8_0 en CPU (dato de la model card). No se publica cifra de VRAM para GPU en esta ficha.
- GPU: la model card menciona ejecuciones bf16 en GPU para los ablations y llama.cpp CUDA para OpenJev, pero no especifica modelos de GPU concretos.
- Consumer GPU: no se confirma que quepa en GPU de consumo; el fichero publicado está pensado para CPU.
- Despliegue: llama.cpp (`llama-server`), con GGUF Q8_0. La model card indica compatibilidad con builds recientes de llama.cpp. Existe un paquete pip `decido` en el repositorio sucesor decido-ai/decido-1-26b-a4b.
- Latencia y throughput: Apple M4 Pro, CPU only, 10 hilos, estado de ~1k tokens y 5 preguntas: p50 4,14 s, p95 4,26 s; carga inicial 97 s. El coste es una pasada sobre el estado más un coste por pregunta, ya que el estado se cachea.
- Varianza de plataforma: salidas idénticas bit a bit en una misma máquina, pero los kernels x86 y Apple Silicon redondean de forma distinta; en 1.130 ítems idénticos ambas plataformas coincidieron en el 94–100 % de respuestas por grupo, con ±1,5 puntos esperados por grupo en grupos pequeños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media seis grupos | Licencia | Formato |
|---|---|---|---|---|---|
| Decido 26B-A4B | 25,23B totales (~4B activos) | 16384 | 85,38 | Apache-2.0 | GGUF Q8_0, safetensors |
| Jev 1.13 (TypeSafe) | no disponible | no disponible | 83,85 (publicado) | no disponible | no disponible |
| Gemma 4 26B-A4B-it (base) | 26B (~4B activos) | no disponible | 77,05 (zero-shot) | no disponible en esta ficha | safetensors |

La comparación con Jev no es de protocolo idéntico: los números de Jev provienen de la ejecución publicada por AutoTrust, no de pasar Jev por el harness del autor. Además, el propio autor señala que sin los splits de entrenamiento in-domain la receta cae a 82,04, por debajo de Jev.

## Limitaciones y advertencias

- El margen frente a Jev es en dominio supervisado: sin los splits de entrenamiento de los datasets evaluados, la media baja a 82,04.
- Peor calibración que Jev en Kev v9 dev (0,267 frente a 0,212).
- Solo inglés: el tag de idioma es `en` y no se declaran capacidades multilingües.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; cualquier uso fuera de clasificación tipada requiere adaptación.
- Dependencia del prompt fijo: desviarse de `bundle/template.json` puede degradar la calibración, ya que las temperaturas están ajustadas a ese formato.
- Riesgo de inyección desde el documento: aunque el prompt instruye a tratar el estado como no confiable, es una mitigación por prompt, no una garantía arquitectónica.
- Varianza entre plataformas (x86 vs Apple Silicon) de hasta ±1,5 puntos por grupo en grupos pequeños.
- Licencia Apache-2.0 en este repositorio, pero el modelo base es Gemma 4, cuyos términos pueden imponer condiciones adicionales al uso comercial; la model card remite a `NOTICE` para procedencia y licencias de datos.
- El repositorio queda como sucesor en decido-ai/decido-1-26b-a4b; conviene verificar cuál es el mantenido antes de integrar en producción.
- Solo 103 descargas y 3 likes en el momento de la ficha: ecosistema de validación externa muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/decido-ai/decido-26b-a4b
- Repositorio sucesor (familia Decido 1): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Referencia Jev 1.13 (TypeSafe): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
