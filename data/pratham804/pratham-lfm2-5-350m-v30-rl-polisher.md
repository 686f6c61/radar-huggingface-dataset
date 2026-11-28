# Pratham804/Pratham-LFM2.5-350M-V30-RL-Polisher

## Resumen

Pratham-LFM2.5-350M-V30-RL-Polisher es un modelo de lenguaje de 354 millones de parámetros derivado de LiquidAI/LFM2.5-350M-Base, publicado por el usuario Pratham804. No es un modelo de propósito general: es un ajuste fino especializado en una única tarea de post-procesado de dictado por voz. Recibe una transcripción en bruto de reconocimiento automático de habla (ASR) y devuelve el mismo texto limpio, con las muletillas, arranques en falso y repeticiones eliminados, las autocorrecciones del hablante aplicadas, la puntuación y las mayúsculas restauradas, y las enumeraciones convertidas en listas. Su premisa explícita es conservar las palabras del hablante sin reformular, acortar ni mejorar el vocabulario.

El modelo se distribuye únicamente como GGUF cuantizado en Q4_K_M (229,3 MB), lo que lo hace desplegable en hardware muy modesto, incluso en CPU. La innovación técnica más destacable respecto a su base es la poda del vocabulario de 65.536 a 12.288 tokens, que abarata aproximadamente cinco veces la multiplicación de matrices de la capa de salida, el coste dominante por token a esta profundidad. El contexto está limitado a 1.024 tokens.

Es relevante porque documenta un caso de fallo frecuente en el ajuste fino de modelos pequeños: la versión anterior (V29) obtenía 40/40 en un conjunto sintético generado por el mismo sistema que los datos de entrenamiento, y fallaba sistemáticamente con dictado real. La V30 se entrena y evalúa con pares reales de micrófono, y la model card reporta 54/60 casos superados frente a 16/60 de la versión anterior. Es, por tanto, un ejemplo útil de evaluación honesta para quien entrene modelos de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM2.5-350M-Base); detalles internos de la base no disponibles en la informacion proporcionada |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF |
| Vocabulario | 12.288 tokens (podado desde 65.536) |
| Tamano del repo | 0,2 GB (GGUF Q4_K_M: 229,3 MB) |
| Modelo base | LiquidAI/LFM2.5-350M-Base |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-350M-Base de Liquid AI, un transformer de 354 millones de parámetros. Sobre esa base se aplicaron tres modificaciones encadenadas: poda del vocabulario de 65.536 a 12.288 tokens, ajuste fino mediante LoRA y fusión de los adaptadores, y finalmente cuantización a Q4_K_M. La model card no detalla la composición del corpus de la base ni el número total de tokens de preentrenamiento.

El ajuste fino se hizo con 251 pares reales de dictado bruto y su limpieza aceptada en revisión de producción, con un peso ocho veces superior al de los datos sintéticos que se mezclaron para dar amplitud. Dos decisiones de entrenamiento son reseñables. Primera, el conjunto de evaluación (60 dictaciones reales) se separó antes del entrenamiento, evitando la contaminación que hundió a la V29. Segunda, el modelo se entrenó con la misma forma de prompt que se sirve en producción, incluyendo una línea de tarea en el turno de usuario en el 60 % de las filas, para corregir el desajuste entre instrucción de entrenamiento e instrucción de servicio de la versión anterior. No se documenta uso de RLHF ni DPO pese a la etiqueta "RL" del nombre; la información disponible solo describe ajuste supervisado con LoRA.

## Capacidades

- Limpieza de dictado: eliminación de muletillas, arranques en falso y repeticiones.
- Aplicación de autocorrecciones del hablante ("no, mejor el martes").
- Restauración de puntuación y mayúsculas.
- Formateo estructural: listas de viñetas para enumeraciones y párrafos para texto largo.
- Preservación léxica: no reformula, no resume, no sustituye vocabulario.
- Generación de texto condicionada por un prompt de sistema fijo; no es un asistente conversacional.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de visión ni audio; procesa únicamente texto.
- Multilingüe: no; solo inglés.

## Casos de uso

- Post-procesado en pipelines de dictado médico o legal: el modelo se coloca detrás del motor ASR y antes del revisor humano, eliminando repeticiones y aplicando correcciones del profesional para reducir el tiempo de edición manual. Su ventana de 1.024 tokens obliga a trocear las notas largas.
- Integración en aplicaciones de notas por voz para móvil o escritorio: con 229,3 MB en Q4_K_M y contexto de 1.024 tokens, cabe en un proceso local sin GPU dedicada y puede ejecutarse con llama.cpp u Ollama, manteniendo el audio y la transcripción en el dispositivo.
- Limpieza de actas de reunión: convierte un dictado desordenado de acuerdos y tareas en una lista de viñetas estructurada, que es exactamente el formato que el prompt de sistema solicita para enumeraciones.
- Preprocesado para sistemas posteriores: al normalizar puntuación y eliminar ruido verbal, mejora la entrada de motores de resumen, extracción de entidades o indexación de documentos, que reciben texto más limpio.
- Accesibilidad: usuarios con dificultades motoras o de habla que dictan con pausas, repeticiones y autocorrecciones obtienen un texto publicable sin reescribir manualmente.
- Generación de subtítulos y transcripciones editables: limpieza por segmentos de las transcripciones ASR antes de publicarlas, con truncado controlado por la aplicación anfitriona.
- Evaluación comparativa de ajustes finos: sirve como referencia metodológica para equipos que quieran medir si su modelo pequeño generaliza a datos reales en lugar de memorizar plantillas sintéticas.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos sobre 60 dictaciones reales reservadas antes del entrenamiento. Un caso se considera superado si el F1 por tokens es ≥ 0,85, la forma de lista o párrafo coincide y como máximo dos palabras de contenido no aparecen ni en la entrada ni en la referencia.

| Modelo | Casos superados | F1 por tokens | Latencia |
|---|---:|---:|---:|
| V30 RL (este repositorio) | 54/60 | 0,941 | 2,03 s |
| V25 Polisher (versión anterior por defecto) | 16/60 | 0,69 | 1,79 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de latencia corresponden al entorno del autor, no especificado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (pesos de 229,3 MB más caché KV para 1.024 tokens).
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores; también en GPUs integradas y en CPU.
- Despliegue recomendado por el autor: `llama-server` con `-c 1024 -ngl 99`; compatible con llama.cpp y, presumiblemente, con Ollama por el formato GGUF, aunque no se documenta explícitamente.
- vLLM y TGI no están documentados para esta variante GGUF en la información disponible.
- Latencia reportada: 2,03 s por dictado en el conjunto de evaluación del autor; no se especifica el hardware empleado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---:|---:|---|---|---|
| Pratham-LFM2.5-350M-V30-RL-Polisher | 354 M | 1.024 | Limpieza de dictado | LFM Open License v1.0 | GGUF Q4_K_M |
| Pratham V25 Polisher | no disponible | no disponible | Limpieza de dictado | no disponible | no disponible |
| LiquidAI/LFM2.5-350M-Base | 350 M (aprox.) | no disponible | Modelo base de propósito general | LFM Open License v1.0 | safetensors |

La comparación con alternativas de la misma categoría (modelos especializados en post-procesado de ASR) no está disponible en la información proporcionada. Frente a la base, la V30 intercambia generalidad por especialización y un vocabulario cinco veces menor en la capa de salida.

## Limitaciones y advertencias

- No razona, no resume y no responde preguntas; usarlo fuera de la tarea de limpieza produce resultados no fiables.
- Entradas que superen los 1.024 tokens se truncan; la aplicación anfitriona debe trocear el texto.
- Punto más débil declarado por el autor: dictado con alta densidad de términos técnicos o nombres propios.
- Solo inglés; no se ha validado en castellano ni en otros idiomas.
- Riesgo de alucinación documentado en la versión anterior (V29), que inventaba elementos de lista y devolvía salidas vacías; la V30 lo mitiga con datos reales, pero el riesgo persiste en entradas atípicas.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial; el autor advierte de que el modelo está modificado y que Liquid AI no respalda los cambios.
- El nombre incluye "RL", pero la documentación solo describe ajuste supervisado con LoRA; conviene no asumir entrenamiento por refuerzo.
- Repositorio con 0 descargas y creado en noviembre de 2026: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V30-RL-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-350M-Base/blob/main/LICENSE
