# jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn` es un modelo de lenguaje de aproximadamente 0,7 mil millones de parámetros entrenado desde cero por el usuario jsaizant. Según su model card, se ha entrenado sobre 100 000 millones de tokens (100B) del corpus HPLT 4 en portugués, filtrando los documentos con una puntuación BSC-EDU superior a 2,0. Se trata, por tanto, de un modelo monolingüe en portugués, orientado a experimentación con recetas de datos y filtrado curricular más que a un producto final.

La relevancia de este modelo reside en su enfoque metodológico: aplica un filtro de calidad educativo (BSC-EDU) sobre un corpus web multilingüe de gran escala (HPLT 4) y publica el resultado con licencia Apache 2.0. Esto lo convierte en un artefacto útil para estudiar el efecto del filtrado de datos en modelos pequeños, así como para servir de base en tareas de generación de texto en portugués con requisitos de cómputo muy bajos.

No obstante, la información pública disponible es mínima: la model card no detalla arquitectura, contexto, composición exacta del dataset, proceso de alineación ni resultados de evaluación. El repositorio ocupa 13,4 GB, lo que sugiere pesos en precisión alta (probablemente fp32 o bf16) para un modelo de este tamaño, y no consta pipeline declarado ni descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | ~0,7B (según model card) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors/pt) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (pt) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo; únicamente indica que se trata de un modelo de 0,7B parámetros entrenado desde cero. Por el tamaño, la nomenclatura y las prácticas habituales en este tipo de experimentos, es plausible que sea un transformer decoder-only, pero este dato no está confirmado en la información disponible.

En cuanto al entrenamiento, el autor declara 100B tokens procedentes de HPLT 4 en portugués, con filtrado por puntuación BSC-EDU mayor que 2,0. No se detalla la composición exacta del dataset, el tokenizador empleado, la longitud de secuencia durante el preentrenamiento, la presencia de fases de instrucción (SFT), alineación (RLHF/DPO) ni ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezclas MoE, etc.). Tampoco se indica el número de GPUs, el tiempo de entrenamiento ni la función de pérdida.

## Capacidades

- Generación de texto en portugués: el modelo está entrenado exclusivamente con datos en portugués (`por_Latn`), por lo que su uso previsto es la modelización de lenguaje y la generación de texto en ese idioma.
- Modelización de lenguaje base: al no constar fases de instrucción, no hay evidencia de que siga instrucciones de forma fiable.
- Razonamiento, código y matemáticas: no hay información que confirme capacidades específicas en estas áreas; el filtrado BSC-EDU podría favorecer contenido educativo, pero no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués según la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre filtrado de datos: el modelo sirve como punto de comparación para estudiar cómo afecta el filtro BSC-EDU (>2,0) al rendimiento de un modelo pequeño entrenado con 100B tokens de HPLT 4 en portugués.
- Generación de texto en portugués con recursos limitados: al tener ~0,7B parámetros, puede desplegarse en hardware modesto para tareas de continuación de texto o generación libre en portugués.
- Base para fine-tuning específico de dominio: al estar publicado con licencia Apache 2.0 y en safetensors, puede ajustarse posteriormente para tareas como clasificación, resumen o generación controlada en portugués.
- Experimentos de destilación o currículum de datos: su receta (corpus filtrado por calidad educativa) lo hace útil como estudiante o profesor en pipelines de destilación.
- Evaluación de sesgos y calidad lingüística en portugués: permite analizar el efecto de un corpus web filtrado por BSC-EDU en la fluidez y cobertura léxica del portugués.
- Prototipado educativo: para demostraciones de modelado de lenguaje a pequeña escala en entornos con GPUs de consumo, siempre que se valide previamente su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~0,7B parámetros, en fp16/bf16 se requieren aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 0,7 GB; en 4 bits, en torno a 0,4 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente sí, dada la escala de 0,7B, aunque no se especifican requisitos ni formatos cuantizados publicados.
- Opciones de despliegue: el repositorio contiene safetensors y pesos PyTorch; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI. Sería necesario convertir los pesos a GGUF para llama.cpp/Ollama, lo cual no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. Como referencia cualitativa, podría situarse frente a modelos pequeños multilingües o monolingües de escala similar (por ejemplo, variantes de ~0,5B-1B parámetros), pero no se han publicado datos de rendimiento de este modelo que permitan una comparación objetiva.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn | ~0,7B | no disponible | pt | Apache 2.0 | no disponible |
| Alternativas de ~0,5B-1B | no disponible | no disponible | variable | variable | no disponible |

## Limitaciones y advertencias

- Ausencia de evaluación: no se han publicado benchmarks, por lo que no es posible verificar su calidad lingüística ni su utilidad práctica.
- Modelo base sin alineación: no consta entrenamiento con instrucciones ni RLHF/DPO; no debe esperarse que siga instrucciones de forma fiable ni que rechace peticiones dañinas.
- Monolingüe en portugués: no se declaran capacidades en otros idiomas, incluido el castellano.
- Sesgos del corpus: al entrenarse con HPLT 4 (corpus web) filtrado por BSC-EDU, puede heredar sesgos, ruido y sesgos de representación propios de la web, además de los posibles sesgos del filtro educativo.
- Riesgo de alucinación: inherente a los modelos de lenguaje base de pequeño tamaño; no hay mitigaciones documentadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del corpus HPLT 4 si se redistribuye el modelo.
- Fecha de creación futura: el repositorio figura creado el 2026-11-09, lo que puede indicar un artefacto de prueba o un error de metadatos; conviene verificar la integridad del repositorio antes de usarlo en producción.
- Sin pipeline declarado: no se especifica la tarea (`text-generation` u otra), lo que dificulta su integración automática en frameworks.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn
- HPLT (corpus de origen): no disponible en la información proporcionada
- BSC-EDU (filtro de calidad): no disponible en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
