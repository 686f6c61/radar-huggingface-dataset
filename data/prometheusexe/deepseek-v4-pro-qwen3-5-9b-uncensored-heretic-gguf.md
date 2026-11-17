# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic en formato GGUF es una cuantizacion del modelo base `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario PrometheusEXE en Hugging Face. Se trata de una destilacion que combina la arquitectura Qwen3.5 con conocimiento derivado de DeepSeek-V4-Pro, orientada a razonamiento, matematicas, STEM y uso de herramientas, y a la que se le ha aplicado un proceso de "abliteration" (eliminacion de rechazos por alineacion) que da lugar a la variante etiquetada como "uncensored"/"heretic". El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un modelo compacto (~9B) pensado para ejecucion local mediante cuantizacion GGUF; por otro, ejemplifica la practica creciente de derivar variantes "sin censura" de modelos alineados, algo que tiene implicaciones tecnicas y de seguridad que conviene conocer. El repositorio tiene acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni "likes".

Los metadatos disponibles son abundantes en etiquetas (tool-use, function-calling, reasoning, gspo, mtp, sft, rl) pero escasos en documentacion tecnica verificable: no se publican detalles del dataset de entrenamiento, resultados de benchmarks ni especificaciones de la cuantizacion concreta. Todo lo que sigue se limita a lo que puede inferirse de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags `qwen3_5` y `transformers`); detalles no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene cuantizaciones GGUF); niveles concretos no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 85,1 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio, el modelo se basa en la arquitectura Qwen3.5 (`qwen3_5`) y emplea tecnicas de destilacion (`distillation`) a partir de DeepSeek-V4-Pro. El pipeline de entrenamiento declarado incluye SFT (supervised fine-tuning), RL (reinforcement learning) con GSPO (Group Sequence Policy Optimization, una variante de optimizacion de politica usada para razonamiento), y MTP (multi-token prediction, decodificacion especulativa multi-token). Tambien se menciona `unsloth`, lo que sugiere que el ajuste fino se realizo con esa libreria. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los hiperparametros.

La variante "heretic" implica un proceso de abliteration: se identifican y neutralizan las direcciones del espacio latente asociadas a rechazos de contenido, de modo que el modelo deja de negarse a responder ante ciertas peticiones. Este proceso suele aplicarse sobre el checkpoint ya alineado y no requiere reentrenamiento completo. No se documenta en la informacion disponible la metodologia exacta, el impacto en capacidades ni el coste en calidad respecto al modelo original.

El repo aqui descrito contiene unicamente los pesos cuantizados en GGUF, no el modelo completo en safetensors ni los scripts de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (tag `reasoning`), presumiblemente con modo de pensamiento, aunque no se detalla el formato.
- Matematicas y tareas STEM (tags `math`, `stem`).
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Capacidades multilingues declaradas en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Destilacion de conocimiento de DeepSeek-V4-Pro (segun tags).
- Comportamiento "sin censura" / abliterated: responde sin los rechazos tipicos de modelos alineados (tag `abliterated`, `decensored`).
- No se declara soporte de vision, audio ni modalidades adicionales.

## Casos de uso

- Ejecucion local en equipos de desarrollo: al distribuirse en GGUF, puede cargarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada de gama alta, util para prototipado offline y entornos con requisitos de privacidad.
- Asistente de programacion en IDE: con soporte declarado de tool-use y function-calling, puede integrarse en asistentes que invocan herramientas del editor, aunque la calidad real en generacion de codigo no esta documentada.
- Razonamiento matematico y STEM asistido: el tag `math`/`stem` y el entrenamiento con RL (GSPO) lo orientan a problemas de varios pasos; util en cuadernos de investigacion o herramientas de tutoria tecnica.
- Pipelines de agentes con multiples pasos: la combinacion de reasoning y function-calling permite construir bucles de planificacion-accion, siempre que se valide el comportamiento en produccion dado que no hay benchmarks publicados.
- Investigacion sobre alineacion y seguridad: la variante heretic es un objeto de estudio para analizar como la abliteration afecta a la distribucion de respuestas, la tasa de rechazo y la calidad en tareas benignas.
- Traduccion y atencion multilingue en seis idiomas: util para prototipos de soporte en ingles, chino, coreano, japones, espanol y ruso, con la advertencia de que no hay evaluacion publicada de calidad por idioma.
- Entornos de investigacion que requieren respuestas sin filtros editoriales: por ejemplo, generacion de escenarios de red team, analisis de contenido sensible o estudios de sesgo, asumiendo los riesgos descritos abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia): para ~9,2B parametros en GGUF, una cuantizacion Q4_K_M ocupa aproximadamente 5,5-6 GB y Q8_0 en torno a 9,5-10 GB; los calculos son estimaciones por tamano de parametros, no datos publicados del repo.
- GPU recomendadas: para cuantizaciones bajas basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8 o contexto largo conviene RTX 4090 (24 GB) o A100/H100 en despliegues con concurrencia.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 y Q5 en GPUs de 8-12 GB; Q6/Q8 requiere 12-16 GB.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI si se dispone de los pesos en safetensors del modelo base; el tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles; dependen del nivel de cuantizacion, GPU y backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (GGUF) | ~9,2B | no disponible | Apache 2.0 | Destilado Qwen3.5 + DeepSeek-V4-Pro, abliterated, gated |
| Modelo base `xtools-at/...-9B-UNCENSORED-heretic` | ~9,2B | no disponible | Apache 2.0 (segun este repo) | Pesos completos en safetensors, misma familia |
| Qwen3.5 9B (original) | ~9B | no disponible | no disponible | Base alineada sin abliteration; referencia de calidad |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Alternativa popular de 8B, alineada |

La comparacion de rendimiento no puede establecerse con rigor: no hay benchmarks publicados en la informacion disponible para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas de function-calling, lo que impide validar las capacidades declaradas en los tags.
- Modelo abliterated: la eliminacion de rechazos puede degradar la coherencia, aumentar la generacion de contenido danino y reducir la calidad en tareas benignas; no es apto para produccion orientada al publico sin filtros externos.
- Riesgo de alucinacion: al ser un modelo de ~9B destilado, la tasa de alucinacion es presumiblemente mayor que en modelos mayores; no hay evaluacion disponible.
- Acceso restringido: el repo es gated; es necesario aceptar condiciones y autenticarse en Hugging Face para descargarlo, lo que limita la reproducibilidad automatica.
- Idiomas: solo seis declarados; el espanol figura en la lista pero no hay datos de calidad por idioma.
- Licencia Apache 2.0 permite uso comercial, pero el uso de una variante "sin censura" en productos de cara al usuario puede incumplir politicas de plataformas, normativa de contenido o terminos de servicio de terceros.
- Contexto no documentado: se desconoce la ventana real, lo que impide planificar cargas de contexto largo.
- Fecha y linaje: el modelo referencia DeepSeek-V4-Pro y Qwen3.5, nombres que no pueden verificarse fuera de los metadatos del repo; conviene contrastar la procedencia antes de confiar en la cadena de destilacion.

## Enlaces

- Hugging Face (repo GGUF): https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
