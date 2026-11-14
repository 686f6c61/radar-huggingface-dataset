# audenvenn/raceline-qwen3.6-35b-a3b

## Resumen

raceline-qwen3.6-35b-a3b es una conversion del modelo Qwen/Qwen3.6-35B-A3B realizada por el desarrollador audenvenn para raceline, un runtime de agentes local con motor de inferencia propio orientado a Macs con Apple Silicon y aceleradores neuronales en GPU (familias M5 y M6). No se distribuye como pesos en safetensors o GGUF estándar, sino en el formato nativo del motor (`.rlm`), dividido en partes de menos de 2 GB descritas por un manifiesto JSON, por lo que no es utilizable con otros runtimes como llama.cpp, vLLM u Ollama.

El modelo base es un mixtura de expertos (MoE) de Qwen con 35B parámetros totales y 3B activos por token, con capacidad multimodal image-text-to-text. La conversión aplica cuantización de 4 bits FP4 (4,0 bits por peso) con una escala por fila y por columna, usando GPTQ tras una rotación de Hadamard del flujo residual plegada en los pesos. Además conserva la cabeza de predicción multi-token (MTP) del modelo original, que raceline explota para decodificación especulativa exacta, y separa la torre de visión en un fichero safetensors en float16 de 0,89 GB.

Su relevancia es acotada pero específica: demuestra una vía para ejecutar un MoE multimodal de 35B en hardware de consumo Apple con memoria unificada limitada, manteniendo los expertos en SSD y cargándolos bajo demanda mediante una caché configurable (`--expert-cache GB`). El repositorio ocupa 18,9 GB y el modelo ensamblado 18,00 GB, de los cuales 16,3 GB corresponden a los expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con cabeza MTP; formato nativo raceline (`.rlm`) |
| Parametros totales | 35B (modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3B (8 de 256 expertos por capa más un experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 con escala por fila y por columna (4,0 bits por peso), GPTQ tras rotación de Hadamard; down projections de expertos redondeadas a nearest; torre de visión en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rlm` (formato nativo de raceline, dividido en partes <2 GB + manifiesto `qwen3.6-35b-a3b.rlm.json`); torre de visión en `.safetensors` (float16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos: cada capa enruta cada token a 8 de sus 256 expertos más un experto compartido, de modo que un token solo lee una fracción pequeña de los pesos. Esta conversión no reentrena el modelo; parte de Qwen/Qwen3.6-35B-A3B y aplica un proceso de cuantización post-entrenamiento: rotación de Hadamard del flujo residual plegada en los pesos, cuantización GPTQ a FP4 con escalas por fila y por columna, y redondeo a nearest de las down projections de los expertos. Se conserva la cabeza de predicción multi-token (MTP) original, que el motor usa para decodificación especulativa exacta.

La calidad de la conversión se midió en el momento de la conversión contra el modelo en coma flotante sobre texto reservado (1152 posiciones): divergencia KL de 0,114 nats, perplejidad 2,113 y acuerdo top-1 del 90,8%. La elección top de la cabeza draft coincide con el siguiente token pero uno del propio modelo el 81,0% de las veces. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.6-35B-A3B.
- Entrada de imágenes (image-text-to-text) mediante torre de visión en float16, disponible en raceline 0.6.0 o posterior, tanto en el agente de terminal como a través de las APIs compatibles con OpenAI y Anthropic del runtime.
- Decodificación especulativa exacta mediante la cabeza MTP conservada, con una tasa de acierto del 81,0% en la elección top del draft.
- Ejecución como agente local en el runtime raceline, con carga bajo demanda de expertos desde SSD cuando no caben en memoria.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base y del runtime, sin datos explícitos).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Agente local de terminal en Macs Apple Silicon (M5/M6): raceline chat permite usar el modelo como agente conversacional completamente local, sin depender de servicios en la nube, aprovechando la caché de expertos para ajustar el consumo de memoria unificada.
- Asistencia con entrada de imágenes en local: gracias a la torre de visión, se pueden enviar capturas de pantalla, diagramas o documentos escaneados al agente de terminal para tareas de análisis o extracción de información, sin salir del equipo.
- Integración con APIs compatibles OpenAI/Anthropic: el runtime expone el modelo a través de estas interfaces, lo que permite conectarlo a herramientas y clientes existentes que ya hablan esos protocolos, manteniendo la inferencia en local.
- Despliegue en equipos con memoria unificada limitada: con `--expert-cache GB` se puede fijar cuánta memoria se dedica a expertos y leer el resto desde SSD, lo que hace viable ejecutar un MoE de 35B en Macs que no pueden mantener los 16,3 GB de expertos residentes.
- Evaluación de decodificación especulativa en producción: la cabeza MTP integrada permite medir y aprovechar el speedup de la decodificación especulativa exacta en cargas de generación larga, comparando con mlx-lm según las mediciones publicadas en el README del proyecto.
- Prototipado de pipelines multimodales en investigación: al ser un formato autocontenido con manifiesto y checksum SHA-256, sirve para reproducir experimentos de cuantización FP4 y evaluar la degradación (KL 0,114 nats, perplejidad 2,113) frente al modelo en coma flotante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de calidad son las métricas de conversión frente al modelo en coma flotante:

| Metrica | Valor |
|---|---|
| Divergencia KL (1152 posiciones) | 0,114 nats |
| Perplejidad | 2,113 |
| Acuerdo top-1 | 90,8% |
| Acierto del draft MTP (siguiente-pero-uno) | 81,0% |

## Requisitos de hardware

- VRAM/memoria unificada: el modelo ensamblado ocupa 18,00 GB; los expertos son 16,3 GB del total y la torre de visión 0,89 GB en float16.
- GPU recomendadas: exclusivamente Macs Apple Silicon con aceleradores neuronales en GPU, es decir, familias M5 y M6 según la model card.
- Cabe en GPU de consumo: sí, en Macs M5/M6 con memoria unificada suficiente; si la GPU no puede mantener todo el modelo, raceline deja los expertos en el fichero y los lee desde SSD bajo demanda.
- Opciones de despliegue: únicamente raceline 0.5.0 o posterior (0.6.0 o posterior para entrada de imágenes). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el README del proyecto remite a mediciones de velocidad frente a mlx-lm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| raceline-qwen3.6-35b-a3b | 35B totales / 3B activos | no disponible | `.rlm` (FP4) | Apache-2.0 | Solo raceline en Apple Silicon M5/M6 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | safetensors (original) | Apache-2.0 | Múltiples runtimes estándar |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: misma arquitectura y licencia, pero este último se distribuye en formatos estándar y es portable a otros motores, mientras que la conversión de raceline gana en eficiencia de memoria y decodificación especulativa a cambio de quedar atada a un único runtime y plataforma.

## Limitaciones y advertencias

- No es utilizable con otros runtimes: el formato `.rlm` es nativo de raceline y requiere la versión 0.5.0 o posterior (0.6.0 o posterior para visión).
- Plataforma restringida: solo Macs Apple Silicon con aceleradores neuronales en GPU (M5 y M6); no hay soporte documentado para otras GPU.
- El rendimiento depende del almacenamiento: si los expertos no caben en memoria, se leen desde SSD, lo que puede degradar la latencia según la velocidad del disco y el tamaño de `--expert-cache`.
- Pérdida de calidad por cuantización: aunque medida y documentada (KL 0,114 nats, acuerdo top-1 del 90,8%), existe degradación frente al modelo en coma flotante.
- Idiomas soportados y longitud de contexto no documentados en la información disponible, lo que impide garantizar comportamiento multilingüe o ventanas largas.
- Riesgo de alucinación y sesgos: no hay información específica en la model card; se heredan los del modelo base Qwen3.6-35B-A3B, no evaluados aquí.
- Licencia Apache-2.0, igual que el modelo original, sin restricciones adicionales documentadas para uso comercial; conviene verificar los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reducido, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audenvenn/raceline-qwen3.6-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de raceline: https://github.com/audenvenn/raceline
- Guía de inicio rápido de raceline: https://github.com/audenvenn/raceline#quick-start
