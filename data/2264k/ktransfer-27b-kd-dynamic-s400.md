# 2264K/ktransfer-27b-kd-dynamic-s400

## Resumen

ktransfer-27b-kd-dynamic-s400 es un checkpoint de investigación publicado por el usuario 2264K en HuggingFace, derivado de un estudio exploratorio sobre destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) para adaptación al coreano. El modelo parte de Qwen/Qwen3.8-27B como estudiante y utiliza google/gemma-4-31B-it como profesor, aplicando un ajuste fino completo sobre la pila de texto del modelo base mientras congela los módulos no textuales. No se trata de un modelo de propósito general mejorado, sino de un artefacto de reproducibilidad para las tablas de un artículo científico aún no publicado (paper link: TBA).

El checkpoint corresponde al paso 400 de la ejecución `e5f_27b`, con un presupuesto de entrenamiento corto (400 pasos, batch efectivo de 33 secuencias de 1024 tokens) sobre 3 GPUs A100-80GB con FSDP en bf16. La innovación técnica principal es el uso de P-KL proyectado entre tokenizadores distintos (estilo X-Token), con soporte top-2048 del profesor y escalado dinámico del valor de la pérdida, combinado con entropía cruzada estándar. La destilación se desactiva en el dominio de replay en inglés.

Con 27.356.728.560 parámetros y licencia Apache-2.0, el modelo está pensado para investigadores que quieran reproducir o auditar los resultados del estudio, incluyendo resultados negativos. Su relevancia actual radica en que documenta una técnica poco explorada (destilación cross-tokenizer desde un profesor de familia distinta) aplicada a la adaptación lingüística del coreano, un idioma con menos recursos que el inglés en el ecosistema open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; pila de texto entrenada, módulos no textuales congelados) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen/Qwen3.8-27B, un transformer de 27.356 millones de parámetros. Solo se entrena la pila de texto; los módulos no textuales del modelo base permanecen congelados. El entrenamiento emplea entropía cruzada (CE) combinada con una KL proyectada entre tokenizadores distintos (P-KL, estilo X-Token), usando como profesor google/gemma-4-31B-it con logits top-k precalculados (soporte top-2048) y escalado dinámico del valor de la pérdida. El peso de la destilación es 1.0 y se desactiva en el dominio de replay en inglés.

La configuración de la ejecución es: 400 pasos, batch efectivo de 33 secuencias × longitud máxima 1024, optimizador adamw8bit con learning rate 5e-06, warmup 0.05, weight decay 0.1, semilla 42, sobre 3× A100-80GB con FSDP en bf16. Los datos de entrenamiento suman aproximadamente 14 millones de caracteres de una mezcla coreano/inglés: un corpus privado de diálogos de personajes (~30% de los caracteres), Wikipedia en coreano, Namuwiki, texto web y noticias en coreano, y un replay de FineWeb-Edu en inglés (15%). El dataset de entrenamiento no se libera. El archivo `training_config.json` contiene la configuración completa de la ejecución (con rutas privadas eliminadas).

## Capacidades

- Generación de texto conversacional en coreano e inglés, heredada del modelo base Qwen3.8-27B.
- Adaptación específica al coreano mediante destilación desde un profesor de familia distinta (Gemma-4-31B-it).
- Razonamiento y conocimiento factual evaluados de forma provisional en HRM8K y KMMLU.
- Capacidad de mantener estilo de diálogo de personajes, influido por el corpus privado de diálogos usado en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales, de audio o modo thinking: no disponible en la información proporcionada (los módulos no textuales están congelados).

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint permite reproducir las tablas del artículo "Anchor or Transfer?", incluyendo los resultados negativos, ejecutando la misma configuración de evaluación (subconjuntos de 200 ítems de HRM8K y KMMLU con decodificación greedy).
- Auditoría de técnicas de destilación cross-tokenizer: investigadores pueden inspeccionar los pesos y comparar con checkpoints CE-only para analizar el efecto del P-KL proyectado con escalado dinámico.
- Estudio de adaptación lingüística al coreano: sirve como punto de partida para analizar cómo un profesor de otra familia (Gemma) transfiere conocimiento a un estudiante Qwen en coreano, midiendo perplejidad en texto coreano e inglés.
- Generación de diálogos de personajes en coreano: el modelo ha absorbido el estilo de un corpus privado de diálogos, útil en experimentos controlados de estilo conversacional (no recomendado en producción sin evaluación adicional).
- Base para experimentos de ajuste con datos coreanos propios: al ser Apache-2.0, puede usarse como inicialización para fine-tuning adicional en dominios coreanos específicos.
- Evaluación comparativa de perplejidad: con PPL reportada de 35.37 en coreano y 10.10 en inglés, sirve como referencia en estudios de degradación o transferencia entre idiomas.

## Benchmarks y rendimiento

Resultados reportados en el borrador del artículo (subconjuntos de 200 ítems, decodificación greedy, precisión de un evaluador automático y marcada como provisional):

| Métrica | Valor |
|---|---|
| HRM8K accuracy | 0.740 |
| KMMLU accuracy | 0.495 |
| Perplejidad coreano (ko PPL) | 35.37 |
| Perplejidad inglés (en PPL) | 10.10 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las cifras de precisión están pendientes de re-adjudicación manual y pueden cambiar ligeramente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27.356 millones de parámetros), en bf16 se requieren aproximadamente 55 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 27-28 GB; en 4 bits, unos 14-15 GB. Estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: el entrenamiento se realizó en 3× A100-80GB. Para inferencia en bf16 se necesita al menos una A100-80GB o H100-80GB.
- ¿Cabe en GPU de consumo? En bf16 no. En cuantizaciones de 8 o 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no se publican pesos cuantizados ni se confirma compatibilidad.
- Opciones de despliegue: no se documentan opciones específicas (vLLM, llama.cpp, Ollama, TGI). Al ser un modelo de la familia Qwen3.8, es probable que herramientas compatibles con dicha arquitectura funcionen, pero no está verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ktransfer-27b-kd-dynamic-s400 | 27,36 B | No disponible | Apache-2.0 | HuggingFace (376 descargas) | Checkpoint de investigación, destilación cross-tokenizer ko/en |
| Qwen/Qwen3.8-27B (modelo base) | 27,36 B | No disponible | Apache-2.0 | HuggingFace | Modelo de propósito general; el checkpoint es un fine-tune del mismo |
| google/gemma-4-31B-it (profesor) | 31 B (aprox.) | No disponible | Apache-2.0 | HuggingFace | Usado como profesor en la destilación; no es un competidor directo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor indica que no es un modelo de propósito general mejorado; está liberado para reproducibilidad, incluyendo resultados negativos.
- Entrenamiento corto: solo 400 pasos con batch efectivo de 33 secuencias de 1024 tokens, lo que limita la magnitud de la adaptación.
- Semilla única y una sola pareja de modelos: los resultados no son estadísticamente robustos ni generalizables.
- Mayor repetición bajo muestreo: las ejecuciones con destilación mostraron más repetición que las de solo CE, según el autor.
- Sin ajuste de seguridad adicional: no hay safety tuning más allá del modelo base; las salidas pueden reflejar el estilo del corpus privado de diálogos.
- Sesgos: no documentados explícitamente, pero el corpus incluye texto web y de noticias coreanas, con los sesgos asociados; el corpus de diálogos privado puede introducir sesgos de estilo y contenido no auditados.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo general de los modelos generativos de esta escala.
- Idiomas: solo coreano e inglés documentados; el rendimiento en otros idiomas no está evaluado.
- Datos de entrenamiento no liberados: impide auditoría completa del dataset.
- Precisión provisional: las métricas de HRM8K y KMMLU están pendientes de revisión manual y pueden variar.
- Licencia Apache-2.0: permite uso comercial, pero al ser un checkpoint de investigación sin evaluación de producción, su uso comercial no está recomendado sin validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/2264K/ktransfer-27b-kd-dynamic-s400
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo profesor: https://huggingface.co/google/gemma-4-31B-it
- Paper: TBA (no disponible en la información proporcionada)
