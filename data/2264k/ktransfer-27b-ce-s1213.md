# 2264K/ktransfer-27b-ce-s1213

## Resumen

ktransfer-27b-ce-s1213 es un checkpoint de investigación publicado por el usuario 2264K en HuggingFace, derivado de un estudio exploratorio sobre destilación de conocimiento entre tokenizadores distintos ("Anchor or Transfer?") orientado a la adaptación al coreano. Se trata de un ajuste fino completo de Qwen/Qwen3.8-27B (27.356.728.560 parámetros) entrenado únicamente con entropía cruzada (CE-only), sin señal del profesor, y sirve como control emparejado para comparar contra las ejecuciones con destilación. El profesor de referencia del estudio es Gemma-4-31B-it, aunque en esta ejecución concreta no se utilizó.

El modelo resuelve un problema metodológico, no de producto: permite reproducir las tablas del artículo, incluidos los resultados negativos. El autor lo declara explícitamente como un checkpoint de investigación y no como un modelo de propósito general mejorado. Su relevancia es, por tanto, académica y de reproducibilidad, con interés para quienes investigan destilación cross-tokenizer y adaptación lingüística al coreano.

Arquitectura de tipo transformer (familia Qwen3.5, según los tags del repositorio), con aproximadamente 27.000 millones de parámetros en precisión completa y pesos en safetensors. El entrenamiento se realizó sobre una mezcla de coreano e inglés de unos 14 millones de caracteres, con 1213 pasos y un tamaño de lote efectivo de 33 secuencias de 1024 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tags del repo; detalles internos no disponibles) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el entrenamiento usó secuencias de 1024 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 54,7 GB |
| Descargas | 355 |
| Fecha de creación | 2026-10-31 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y aplica un ajuste fino completo sobre la pila de texto, manteniendo congelados los módulos no textuales del modelo base. El entrenamiento se ejecutó con FSDP y bf16 sobre 3 GPU A100 de 80 GB, con optimizador adamw8bit, learning rate de 5e-06, warmup del 0,05, weight decay de 0,1 y semilla 42. La ejecución identificada como `e1f_27b` cubrió 1213 pasos (aproximadamente una época) con un lote efectivo de 33 secuencias de longitud máxima 1024.

La innovación metodológica del trabajo no está en la arquitectura, sino en el protocolo: destilación de conocimiento entre tokenizadores distintos (cross-tokenizer) desde un profesor Gemma-4-31B-it hacia un estudiante Qwen3.8-27B. Este checkpoint concreto es el control CE-only, con peso de destilación 0,0 y KD desactivado en el dominio de repetición en inglés. Los datos de entrenamiento consisten en una mezcla de aproximadamente 14 millones de caracteres: un corpus privado de diálogo por personajes (alrededor del 30% de los caracteres), Wikipedia en coreano, Namuwiki, texto web y noticias en coreano, y una repetición de FineWeb-Edu en inglés (15%). El dataset de entrenamiento no se ha publicado.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con estilo influido por el corpus privado de diálogo.
- Comprensión lectora y conocimiento factual en coreano, evaluados mediante HRM8K y KMMLU.
- Modelado de lenguaje bilingüe (perplejidad medida en coreano e inglés).
- Generación de texto en pipeline `text-generation` con soporte de conversación multi-turno.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking explícito: no documentado.
- Visión, audio u otras modalidades: no disponibles (los módulos no textuales quedaron congelados durante el entrenamiento).

## Casos de uso

- Reproducción de resultados académicos: sirve como control CE-only para replicar las tablas del artículo "Anchor or Transfer?" y comparar contra las ejecuciones con destilación cross-tokenizer.
- Investigación en destilación entre tokenizadores: permite aislar el efecto de la señal del profesor frente al ajuste fino supervisado convencional en un par de modelos concreto (Qwen3.8-27B como estudiante, Gemma-4-31B-it como profesor de referencia).
- Estudio de adaptación lingüística al coreano: el checkpoint facilita medir cuánto de la mejora en coreano proviene del ajuste fino con datos coreanos y cuánto de la destilación, usando HRM8K y KMMLU como métricas.
- Análisis de degradación en generación por muestreo: el autor documenta más repetición en las ejecuciones con KD que en la CE-only, por lo que este checkpoint es útil como referencia para estudiar ese fenómeno.
- Evaluación de perplejidad bilingüe: con valores de referencia de 26,47 en coreano y 9,84 en inglés, sirve como línea base para experimentos posteriores sobre el mismo corpus.
- Docencia y formación en técnicas de ajuste fino a gran escala: la configuración publicada (FSDP, bf16, adamw8bit, 3×A100-80GB) es un ejemplo reproducible de fine-tuning completo de un modelo de 27B.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| HRM8K (accuracy, subconjunto de 200 ítems, decodificación greedy) | 0,730 |
| KMMLU (accuracy, subconjunto de 200 ítems, decodificación greedy) | 0,525 |
| Perplejidad en coreano (texto retenido) | 26,47 |
| Perplejidad en inglés (texto retenido) | 9,84 |

El autor advierte que las precisiones son provisionales: provienen de un evaluador automático y los ítems marcados para revisión manual están siendo re-adjudicados, por lo que las cifras pueden variar ligeramente. No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere al menos 2 GPU de 40 GB o una GPU de 80 GB.
- Cuantización a 8 bits: en torno a 28-30 GB de VRAM, viable en una A100-40GB o en configuraciones de doble GPU consumer.
- Cuantización a 4 bits: en torno a 15-17 GB de VRAM, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100-80GB (la configuración de entrenamiento usó 3× A100-80GB), H100, o múltiples GPU de 24-48 GB para inferencia cuantizada.
- Despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al publicarse solo en safetensors, sería necesario convertir los pesos para motores que no lean ese formato directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ktransfer-27b-ce-s1213 | 27,36B | No disponible | ko, en | Apache-2.0 | Checkpoint de investigación CE-only |
| Qwen/Qwen3.8-27B (base) | ~27B | No disponible | Multilingüe (no detallado) | Apache-2.0 | Modelo base sin adaptación al coreano |
| Gemma-4-31B-it (profesor del estudio) | ~31B | No disponible | Multilingüe (no detallado) | Apache-2.0 | Profesor de referencia en la destilación |

La comparación con alternativas de la misma categoría (modelos de ~27-31B ajustados para coreano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no es un modelo de propósito general mejorado y que se publica para reproducibilidad, incluidos resultados negativos.
- Una sola semilla, un único par de modelos y presupuestos de entrenamiento cortos, lo que limita la generalización de cualquier conclusión.
- Las ejecuciones con destilación mostraron más repetición bajo muestreo que esta ejecución CE-only; aun así, el riesgo de repetición en generación libre persiste.
- No está ajustado en seguridad más allá del modelo base; las salidas pueden reflejar el estilo del corpus privado de diálogo por personajes.
- Riesgo de alucinación inherente a un modelo de 27B sin RLHF específico documentado en esta ejecución.
- Idiomas limitados a coreano e inglés; el rendimiento en otros idiomas no está evaluado.
- Las métricas de HRM8K y KMMLU son provisionales y pueden cambiar tras la revisión manual.
- Los datos de entrenamiento no se publican, lo que impide auditorías completas del corpus.
- Licencia Apache-2.0 permite uso comercial, pero al ser un derivado de Qwen3.8-27B conviene revisar `LICENSE` y `NOTICE` del repositorio.
- Longitud de contexto no documentada; el entrenamiento usó secuencias de 1024 tokens, por lo que el rendimiento en contextos largos no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/2264K/ktransfer-27b-ce-s1213
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo "Anchor or Transfer?": pendiente de publicación (TBA según la model card)
- Configuración de entrenamiento: `training_config.json` dentro del repositorio del modelo
- Repositorio de código, demo o blog adicionales: no disponibles en la información proporcionada
