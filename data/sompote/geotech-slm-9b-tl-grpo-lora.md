# Sompote/GeoTech-SLM-9B-TL-GRPO-LoRA

## Resumen

GeoTech-SLM-9B-TL-GRPO-LoRA es un conjunto de adaptadores LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por Sompote (Youwai, King Mongkut's University of Technology Thonburi) y orientado a calculos de diseno geotecnico e ingenieria civil. No es un modelo completo, sino un repositorio de adaptadores que se cargan sobre el modelo base tras fusionar un primer adaptador (SD). El repositorio es autocontenido: incluye el adaptador de la fase 1 (`sd-a30/`) necesario para construir la base de las fases 2 y 3.

El entrenamiento sigue un pipeline de tres pasos: primero un adaptador SD (r16) fusionado en Qwen3.5-9B en bf16; despues un LoRA r32 entrenado con Dr.GRPO sobre una mezcla de prompts 70% geotecnia / 23% matematicas / 7% logica durante 120 pasos; y finalmente TL-GRPO (Truncation- and Length-aware GRPO), que continua el adaptador anterior con un optimizador nuevo durante 60 pasos sobre la misma mezcla. TL-GRPO introduce dos innovaciones: las completaciones truncadas no se enmascaran sino que reciben una penalizacion fija de −0,5 sin credito de correccion, y las respuestas correctas reciben un termino de longitud relativo al grupo (estilo Kimi k1.5). El limite de completacion durante el entrenamiento es de 12.288 tokens.

El modelo es relevante porque demuestra un pipeline de RL (GRPO) aplicado a un dominio tecnico vertical (geotecnia) sobre un modelo pequeno de 9B, con evaluacion en un holdout propio (GeoTechBench v0.4.1) y una mejora medible frente al modelo base. Es un ejemplo de especializacion por dominio mediante adaptadores de bajo rango, con licencia Apache 2.0 y un tamano de repositorio de 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-9B) + adaptadores LoRA (PEFT) |
| Parametros totales | 9B (modelo base); adaptadores LoRA: r16 (SD) y r32 (fases 2 y 3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 14.336 tokens en evaluacion (holdout); sin resultados a 32k para fases 2/3 |
| Tipos de cuantizacion | no disponible (pesos en bf16 para el merge; adaptadores en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT); el base se carga en bf16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer de Qwen/Qwen3.5-9B. Sobre el se aplican adaptadores LoRA de bajo rango: un adaptador SD de r16 en la fase 1, y adaptadores de r32 en las fases 2 y 3. El pipeline es secuencial: el adaptador SD se fusiona en el base en bf16 y ese modelo fusionado es la base para las fases siguientes. La fase 2 entrena con Dr.GRPO durante 120 pasos sobre prompts muestreados 70% geotecnia / 23% matematicas / 7% logica. La fase 3 (TL-GRPO) continua desde el checkpoint del paso 120 con un optimizador nuevo durante 60 pasos sobre la misma mezcla.

La innovacion tecnica destacable es TL-GRPO (Truncation- and Length-aware GRPO): las completaciones truncadas reciben una penalizacion fija de −0,5 y ningun credito de correccion (en lugar de enmascararse), y las respuestas correctas incorporan un termino de longitud relativo al grupo inspirado en Kimi k1.5. El limite de completacion durante el entrenamiento es de 12.288 tokens. El repositorio incluye checkpoints intermedios de la fase 3 (pasos 20, 40 y 60) y de la fase 2 (paso 120). Cada subcarpeta de las fases 2/3 es un adaptador completo (no un delta sobre `mix-drgrpo-120`), por lo que debe cargarse exactamente uno sobre la base SD fusionada.

## Capacidades

- Generacion de texto especializada en calculos de diseno geotecnico e ingenieria civil.
- Razonamiento matematico (23% de la mezcla de entrenamiento) y logica (7%).
- Modo thinking (la evaluacion del holdout se realizo en thinking mode).
- Generacion de codigo y matematicas como capacidades heredadas del base Qwen3.5-9B (no evaluadas especificamente en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: pipeline de RL con GRPO y TL-GRPO para mejorar la precision en tareas de dominio tecnico.

## Casos de uso

- Calculos de diseno geotecnico asistidos: el modelo puede resolver problemas de capacidad portante, asentamientos o estabilidad de taludes en formato de calculo paso a paso, aprovechando el entrenamiento especifico en geotecnia y el modo thinking para exponer el razonamiento.
- Verificacion y contraste de memorias de calculo: dado un problema geotecnico con sus datos de entrada, el modelo genera una solucion candidata que un ingeniero colegiado revisa, sirviendo como segunda opinion automatizada.
- Generacion de ejercicios y soluciones para docencia en ingenieria civil: el modelo produce problemas de geotecnia con resolucion detallada, util para material docente en asignaturas de geotecnia y mecanica de suelos.
- Preprocesado de informes tecnicos: extraccion y reformulacion de datos geotecnicos (perfiles de suelo, ensayos SPT/CPT) en texto estructurado para su posterior procesado.
- Razonamiento matematico aplicado: la mezcla de entrenamiento incluye un 23% de matematicas, lo que permite usar el modelo en calculos numericos intermedios dentro de flujos de ingenieria (conversiones de unidades, formulas de capacidad, etc.).
- Prototipado de asistentes tecnicos verticales: el repositorio sirve como referencia para construir asistentes especializados por dominio sobre un base de 9B mediante LoRA + GRPO, replicable a otros dominios de ingenieria.
- Despliegue con vLLM y LoRA dinamico: servir el modelo SD fusionado y adjuntar el adaptador con `--enable-lora --max-lora-rank 32` permite mantener un unico base y cambiar de adaptador segun la tarea.

## Benchmarks y rendimiento

Holdout GeoTechBench v0.4.1, thinking mode, 8 muestras por item (T 0.8), limite de 14.336 tokens, N = 338. Los adaptadores de fases 2/3 se evaluaron como LoRA en tiempo de ejecucion (sin fusionar) sobre el modelo SD fusionado.

| Modelo | Majority | Majority + budget forcing | pass@8 |
|---|---:|---:|---:|
| Base 9B | 208 | 224 | 223 |
| SD (`sd-a30`) | 218 | 233 | 241 |
| Old SD+Dr.GRPO (`grpo-60`) | 231 | 244 | 252 |
| Mixed Dr.GRPO (`mix-drgrpo-120`) | 230 | 234 | 258 |
| TL-GRPO-60 (`tl-grpo-60`) | 237 | 241 | 266 |
| TL-GRPO-40 (`tl-grpo-40`) | 235 | 240 | 268 |
| TL-GRPO-20 (`tl-grpo-20`) | 248 | 247 | 270 |

Advertencias del autor sobre la evaluacion: los checkpoints se compararon sobre el propio holdout, por lo que elegir uno (por ejemplo TL-GRPO-20) segun su puntuacion constituye seleccion sobre datos de test y su resultado es una estimacion optimista. La base SD fusionada se reconstruyo en hardware distinto al merge original, por lo que un merge nuevo de `sd-a30` puede diferir ligeramente. No se reportan resultados a 32k tokens para los adaptadores de fases 2/3.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 9B; en bf16 requiere aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache. Con cuantizacion de 4 bits cabria en torno a 6-7 GB, aunque la model card no documenta cuantizaciones especificas.
- GPU recomendadas: A100 (40/80 GB) o H100 para bf16 con contexto largo (14k tokens); RTX 4090 (24 GB) es suficiente para bf16 en contextos moderados.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM con `--enable-lora --max-lora-rank 32` sirviendo el modelo SD fusionado. llama.cpp, Ollama y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (holdout GeoTechBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoTech-SLM-9B-TL-GRPO-LoRA (TL-GRPO-20) | 9B + LoRA r32 | 14.336 tokens (evaluado) | 248 majority / 270 pass@8 | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | 208 majority / 223 pass@8 | Apache 2.0 | Hugging Face |
| GeoTech-SLM-9B-LoRA (`grpo-60`) | 9B + LoRA | 32k (segun su card) | 231 majority / 252 pass@8 | Apache 2.0 | Hugging Face |
| Modelos generalistas de 9B de otros fabricantes | ~9B | variable | no evaluados en GeoTechBench | variable | variable |

La comparativa se limita a variantes del mismo autor y al base, ya que no se han publicado resultados de modelos de terceros sobre GeoTechBench v0.4.1 en la informacion disponible.

## Limitaciones y advertencias

- No sustituye la verificacion de un ingeniero colegiado: el propio autor lo indica explicitamente en la model card.
- Seleccion sobre datos de test: los checkpoints se compararon sobre el mismo holdout usado para reportar, por lo que las puntuaciones son estimaciones optimistas.
- Base SD reconstruida en hardware distinto: un merge nuevo de `sd-a30` puede diferir ligeramente de la base sobre la que se entrenaron y evaluaron los adaptadores de fases 2/3.
- Sin resultados a 32k tokens para las fases 2/3, aunque la variante anterior (`grpo-60`) si los reportaba.
- Idioma: solo ingles; no hay soporte documentado de castellano.
- Riesgo de alucinacion: no cuantificado en la model card; tratandose de un modelo de 9B en dominio tecnico, es esperable en calculos fuera de distribucion.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hereda las condiciones del modelo base Qwen/Qwen3.5-9B.
- Carga de adaptadores: cada subcarpeta de fases 2/3 es un adaptador completo; debe cargarse exactamente uno sobre la base SD fusionada, no varios en cascada.
- `base_model_name_or_path` en las configs apunta a una ruta local de entrenamiento; hay que sustituirla por la base real (Qwen/Qwen3.5-9B o el modelo SD fusionado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sompote/GeoTech-SLM-9B-TL-GRPO-LoRA
- Repositorio previo con adaptadores anteriores (sd-a30, grpo-60): https://huggingface.co/Sompote/GeoTech-SLM-9B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Cita (paper en revision): Youwai, Sompote. "A local small language model with frontier-agent fallback for geotechnical design calculations", 2026, KMUTT.
