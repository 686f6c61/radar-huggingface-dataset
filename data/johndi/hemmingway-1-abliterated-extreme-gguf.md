# JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF

## Resumen

Hemmingway-1-Abliterated-Extreme es una versión "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante intervención sobre las activaciones internas) del modelo Hemmingway-1 de Altworld, un transformer denso de aproximadamente 26,9 mil millones de parámetros construido sobre la familia Qwen. La publica el usuario JohnDi en Hugging Face bajo licencia Apache 2.0, distribuida exclusivamente en formato GGUF para inferencia local. El objetivo declarado es el de un modelo sin restricciones de contenido orientado a escritura creativa, diálogo y comunicación cotidiana.

La innovación que reclama el autor no está en la arquitectura, sino en el proceso de abliteración: en lugar de las 20-30 iteraciones típicas de un run rápido, se empleó la herramienta Heretic con una búsqueda bayesiana profunda de 200 ensayos (Optuna) para localizar la frontera de Pareto entre máxima eliminación de rechazos y mínima distorsión de la prosa original. El autor reporta una reducción de 98 rechazos sobre 100 en la línea base a 2 sobre 100 en el ensayo 194, con una divergencia KL de 0,1870 respecto al modelo original.

Es relevante ahora porque ejemplifica una tendencia consolidada en el ecosistema open source: la publicación de variantes "uncensored" de modelos base de tamaño medio-grande, cuantizadas en GGUF y listas para consumidores con GPU de 16-32 GB de VRAM. La información disponible sobre arquitectura interna, datos de entrenamiento, contexto e idiomas es muy escasa; esta ficha marca explícitamente como "no disponible" todo aquello que la model card no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen, según la model card; detalles no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (~17 GB), Q6_K (~23 GB), Q8_0 (~29 GB) |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 67,2 GB con las tres cuantizaciones) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la descripción del modelo base como un modelo de 27B parámetros "basado en Qwen". No se documentan el número de capas, la dimensión oculta, el mecanismo de atención (si es atención completa, GQA u otra variante), ni la longitud de contexto nativa. Tampoco se especifican los datos de entrenamiento del modelo base: número de tokens, composición del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La model card del derivado se centra exclusivamente en el proceso de abliteración.

La innovación técnica declarada es el procedimiento de abliteración. Se aplicó Heretic con una búsqueda bayesiana de 200 ensayos gestionada por Optuna, en lugar de las 20-30 pruebas de un run convencional. El autor reporta que el ensayo 194 alcanza 2 rechazos sobre 100 frente a los 98 sobre 100 del modelo original, con una divergencia KL de 0,1870, argumentando que la prosa, el humor y el flujo de frases se mantienen coherentes. No se publican detalles sobre qué capas o direcciones de activación se intervinieron, ni la metodología exacta de evaluación de rechazos.

## Capacidades

- Generación de texto conversacional y de ficción, con énfasis declarado en escritura creativa, diálogo auténtico y comunicación cotidiana.
- Reducción drástica de rechazos: el autor reporta 2 rechazos sobre 100 en su protocolo de evaluación, frente a 98 sobre 100 del modelo base.
- Formato de prompt ChatML / Qwen (`<|im_start|>system ... <|im_end|>`), lo que facilita su integración en pipelines existentes de la familia Qwen.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repo), lo que sugiere despliegue en infraestructuras de inferencia gestionadas.
- Capacidades de tool calling, agentes, visión, audio o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.

## Casos de uso

- Escritura creativa de ficción sin filtros: el modelo está optimizado explícitamente para prosa narrativa, con ajustes de muestreo recomendados (temperatura 0,80-1,0, top-p 0,95, top-k 20, min-p 0,05) pensados para mantener naturalidad en textos largos. Adecuado para autores que necesitan generar borradores de narrativa sin interrupciones por contenido sensible.
- Roleplay y diálogo de personajes: la combinación de abliteración con baja divergencia KL (0,1870) busca preservar la coherencia de voz del personaje, lo que encaja en aplicaciones de entretenimiento conversacional y simulación de personajes.
- Generación de diálogos para guiones y videojuegos: el énfasis en "diálogo auténtico" y la recomendación de mantener la penalización de presencia a 0,0 para no degradar la gramática lo hacen útil en pipelines de escritura de guiones donde se prioriza el registro natural.
- Asistencia de escritura personal en local: con la cuantización Q4_K_M (~17 GB) cabe en GPU de consumo de 16-24 GB, lo que permite desplegarlo en una estación de trabajo doméstica con llama.cpp u Ollama sin depender de la nube, útil para escritura privada.
- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible para comparar el comportamiento de un modelo base frente a su variante abliterada, especialmente con la métrica de rechazos y la divergencia KL reportadas.
- Prototipado de asistentes conversacionales sin restricciones temáticas: en entornos controlados de investigación, permite explorar cómo responde un modelo de 27B a peticiones que el modelo base rechazaría, sin necesidad de infraestructura de servidor.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia gestionados que acepten GGUF, útil para pruebas A/B de comportamiento conversacional.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas del proceso de abliteración, no benchmarks estándar de capacidad:

| Métrica | Línea base (original) | Ensayo 194 (Extreme) |
|---|---|---|
| Rechazos (sobre 100) | 98 | 2 |
| Divergencia KL | — | 0,1870 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q4_K_M ~17 GB; Q6_K ~23 GB; Q8_0 ~29 GB (tamaños de fichero reportados por el autor; la VRAM efectiva debe sumar overhead de contexto y caché KV).
- GPU recomendadas por el autor: RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) para Q6_K; 32 GB o más para Q8_0; 16-24 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o Q6_K, y en GPUs de 16 GB con Q4_K_M ajustando el contexto.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta `endpoints_compatible` indica soporte en infraestructuras de endpoints. No se documenta soporte de vLLM o TGI para este repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hemmingway-1-Abliterated-Extreme | ~26,9 B | No disponible | GGUF | Apache 2.0 | Abliterado con búsqueda de 200 ensayos; 2/100 rechazos reportados |
| Hemmingway-1 (base, Altworld) | ~27 B | No disponible | No disponible en esta ficha | No disponible | Modelo original; 98/100 rechazos según el autor del derivado |
| Otras variantes abliterated de la familia Qwen | No disponible | No disponible | GGUF | Variable | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de forma rigurosa; los datos de la fila base provienen únicamente de la model card del derivado.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo, no los sesgos subyacentes del modelo base; el modelo puede reproducir sesgos de género, raza, religión o cultura presentes en sus datos de entrenamiento.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin filtro; no es apto para aplicaciones orientadas al público general sin una capa de moderación externa.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni de benchmarks de conocimiento.
- La divergencia KL de 0,1870 indica cierta desviación respecto al modelo original; el autor afirma que la prosa se mantiene coherente, pero no hay evaluación independiente.
- Longitud de contexto e idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe ni conversaciones de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue en producción de un modelo sin filtros traslada al operador toda la responsabilidad legal y de cumplimiento (por ejemplo, normativa de servicios digitales o protección de menores).
- La model card no documenta la metodología exacta de evaluación de rechazos, por lo que la cifra 2/100 no es verificable de forma independiente.
- El repo ocupa 67,2 GB; la descarga y el almacenamiento requieren planificación de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JohnDi/Hemmingway-1-Abliterated-Extreme-GGUF
- Modelo base (Altworld): https://huggingface.co/Altworld/Hemmingway-1
- Modelo base referenciado en los tags (HemmingwayAI): https://huggingface.co/HemmingwayAI/Hemmingway-1
- Heretic (herramienta de abliteración): no disponible en la información proporcionada
- Optuna (búsqueda bayesiana): no disponible en la información proporcionada
- Paper o blog del método de abliteración: no disponible en la información proporcionada
