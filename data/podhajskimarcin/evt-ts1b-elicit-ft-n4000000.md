# podhajskimarcin/evt-ts1b-elicit-ft-n4000000

# evt-ts1b-elicit-ft-n4000000

## Resumen
evt-ts1b-elicit-ft-n4000000 es un ajuste fino completo (full fine-tuning) del modelo base zoo-run/evt-ts1b-op-bridge-mix sobre 4.000.000 de ejemplos de suma y resta expresados en lenguaje natural. Lo publica el usuario podhajskimarcin en HuggingFace como parte del proyecto MARS V, dedicado al estudio mecanístico de la elicitación frente a la enseñanza (elicitation vs. teaching) en redes neuronales, dentro del codebase geode.

El modelo no es un asistente generalista: es el "hijo elicitado" del experimento, es decir, el resultado de exponer al modelo padre a un gran volumen de ejemplos aritméticos para medir qué capacidades emergen por elicitación. No se documentan en la información disponible ni la arquitectura exacta ni la longitud de contexto. Las etiquetas del repositorio incluyen tinystories-1b, lo que apunta a un transformer de aproximadamente 1.000 millones de parámetros derivado de la familia TinyStories, aunque este dato no se confirma en la model card.

Su relevancia es principalmente de investigación: permite reproducir y auditar un punto concreto de una comparativa elicitación/enseñanza. El repositorio incluye el checkpoint final, los logs de entrenamiento y evaluación, y los ficheros de gate y evaluación del run, lo que facilita la verificación de resultados sin depender de snapshots intermedios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta tinystories-1b sugiere un transformer de ~1.000 millones de parámetros; no confirmado) |
| Parámetros totales | no disponible (la etiqueta tinystories-1b sugiere ~1.000 millones; no confirmado) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | zoo-run/evt-ts1b-op-bridge-mix |
| Tipo de entrenamiento | full fine-tuning (LoRA r=None) |
| Dataset de ajuste | mhieuuu/elicit-vs-teach-arith:D_algo_bare_4m.parquet (n = 4.000.000, seed 316) |
| Tamaño del repositorio | 4,9 GB |
| Fecha de creación | 2026-09-10T12:12:04.228196+00:00 |
| Commit | 1874a4e408662bd38600e65222ad1478018e2b96 |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura interna más allá del modelo base zoo-run/evt-ts1b-op-bridge-mix y de la etiqueta tinystories-1b. El run se registra como "full_ft" con LoRA r=None, es decir, se actualizaron todos los pesos del modelo padre en lugar de aplicar adaptadores de bajo rango. El régimen de entrenamiento figura como "unknown" y la parada como "None at step None", sin criterio de early stopping documentado. El ajuste se realizó sobre el fichero D_algo_bare_4m.parquet del dataset mhieuuu/elicit-vs-teach-arith, con 4.000.000 de ejemplos y semilla 316.

El repositorio replica la carpeta del run dentro del almacén del proyecto: manifest.json, train_log.jsonl, eval_log.jsonl, ficheros de gate y evaluación, y model/ con el checkpoint final generado por save_pretrained. No se incluyen snapshots intermedios. No se mencionan en la información disponible fases de RLHF, DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El contexto del proyecto (MARS V, codebase geode) sitúa este checkpoint como una de las condiciones experimentales del estudio elicitación vs. enseñanza.

## Capacidades
- Generación de respuestas de suma y resta formuladas en lenguaje natural, tras el ajuste con 4.000.000 de ejemplos aritméticos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la aritmética cubierta por el dataset.
- Capacidades multilingües: no disponibles; el dataset describe aritmética en lenguaje natural, sin detalle de idioma.
- Capacidad especial: funciona como artefacto de elicitación para el estudio mecanístico de qué aprende un modelo al ser expuesto a un volumen grande de ejemplos.
- No se documentan modos thinking, visión ni audio.
- Incluye logs de entrenamiento y evaluación que permiten auditar el proceso y comparar curvas entre condiciones experimentales.

## Casos de uso
- Reproducción del experimento de elicitación: cargar el checkpoint con transformers y comparar su comportamiento en tareas de suma y resta con el del modelo padre evt-ts1b-op-bridge-mix.
- Análisis mecanicista: usar el checkpoint junto con herramientas de interpretabilidad para estudiar qué circuitos o representaciones se alteran tras un ajuste completo con 4.000.000 de ejemplos aritméticos.
- Auditoría del entrenamiento: train_log.jsonl y eval_log.jsonl permiten verificar curvas de pérdida, detectar sobreajuste y reconstruir la evolución del run sin snapshots intermedios.
- Baseline en comparativas elicit vs. teach: emplear este modelo como condición "elicited child" frente a otras variantes del proyecto en experimentos controlados.
- Evaluación de generalización aritmética: probar si el modelo resuelve sumas y restas fuera de la distribución de D_algo_bare_4m, por ejemplo con operandos más largos o formatos distintos.
- Docencia y divulgación: modelo pequeño, con licencia MIT, adecuado para explicar en un aula cómo un ajuste fino sobre datos sintéticos modifica el comportamiento aritmético de un transformer.
- Detección de sesgos de formato: comprobar si el modelo depende de plantillas concretas presentes en los ejemplos de entrenamiento.
- Punto de partida para ajustes posteriores o destilación sobre tareas aritméticas, dado que se distribuye el checkpoint completo en safetensors.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Tamaño del repositorio: 4,9 GB, dominado por el checkpoint final en model/. Para un modelo de ~1.000 millones de parámetros, una estimación orientativa sería de unos 4 GB en fp32 y unos 2 GB en fp16, más el overhead de activaciones (estimación basada en el tamaño del repo, no confirmada por el autor).
- GPU de consumo: con esas estimaciones, cabría en GPUs con 8 GB o más de VRAM en fp16, y en el entorno de 6-8 GB en fp32. Ejemplos: RTX 3060 12 GB, RTX 4070, RTX 4090.
- GPU de datacenter: no se requieren A100 o H100 para inferencia según el tamaño estimado; no hay datos publicados de entrenamiento multinodo.
- Opciones de despliegue: transformers con pesos safetensors, tal como se documenta en la model card mediante AutoModelForCausalLM y AutoTokenizer. No se publican pesos GGUF, por lo que Ollama y llama.cpp exigirían una conversión manual no documentada. No se verifica compatibilidad con vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evt-ts1b-elicit-ft-n4000000 | no disponible (etiqueta tinystories-1b sugiere ~1.000 millones) | no disponible | sin benchmarks publicados | MIT | HuggingFace |
| zoo-run/evt-ts1b-op-bridge-mix (modelo base) | no disponible | no disponible | sin benchmarks publicados en la información disponible | no disponible | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (aritmética elicitada sobre TinyStories) además del modelo base.

## Limitaciones y advertencias
- Es un artefacto de investigación, no un asistente conversacional; en el momento de redactar la ficha acumula 0 descargas y 0 likes.
- No hay benchmarks publicados en la información disponible, por lo que el rendimiento aritmético real no está verificado.
- Riesgo de alucinación en aritmética: no hay garantía de corrección en sumas o restas fuera de la distribución del dataset de ajuste.
- El régimen de entrenamiento figura como "unknown" y no se documenta parada por criterio; la fila de stop indica "None at step None".
- No se documentan idiomas soportados, longitud de contexto ni variantes cuantizadas.
- Posible sobreajuste a los formatos y a la distribución de D_algo_bare_4m, con degradación esperable ante plantillas distintas.
- No se incluyen snapshots intermedios, solo el checkpoint final, lo que limita el análisis de la trayectoria de entrenamiento.
- La licencia MIT permite uso comercial, pero se ofrece sin garantías y el modelo no está validado para producción.

## Enlaces
- HuggingFace: https://huggingface.co/podhajskimarcin/evt-ts1b-elicit-ft-n4000000
- Modelo base: https://huggingface.co/zoo-run/evt-ts1b-op-bridge-mix
- Dataset: https://huggingface.co/datasets/mhieuuu/elicit-vs-teach-arith
- Codebase geode: no se proporciona URL en la información disponible
- Proyecto MARS V: no se proporciona URL en la información disponible
- Commit del run: 1874a4e408662bd38600e65222ad1478018e2b96 (sin URL asociada en la información disponible)
