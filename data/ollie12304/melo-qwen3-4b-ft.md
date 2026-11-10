# Ollie12304/melo-qwen3-4b-ft

## Resumen

melo-qwen3-4b-ft es un ajuste fino por QLoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por Ollie12304 como proyecto de curso (iSpan AIPE04, grupo 3). Resuelve un problema muy acotado: parsear las últimas frases de un estudiante de piano en la plataforma melo. y devolver un JSON estructurado con la intención, los criterios de búsqueda de curso (nivel, modalidad, región, precio máximo, franja horaria) y una consulta de búsqueda para recuperación vectorial. No es un modelo de propósito general, sino un componente de un pipeline de "AI 找課" (búsqueda de cursos con IA).

El modelo parte de Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros) y se entrena con LoRA de rango 8 sobre las últimas 16 capas, con solo 1,31 millones de parámetros entrenables. Se distribuye en formato GGUF Q4_K_M para Ollama, lo que lo hace desplegable en hardware modesto. Su relevancia es práctica: demuestra que un ajuste fino pequeño y barato (1,8 horas en Apple Silicon) puede superar ampliamente tanto a reglas heurísticas como al modelo base sin ajustar en una tarea de extracción estructurada.

La licencia es Apache 2.0, heredada del modelo base. El único idioma declarado es chino (zh), coherente con el dominio de aplicación (plataforma de clases de piano en Taiwán).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA/QLoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el adaptador original se entrenó sobre MLX 4-bit |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) para Ollama; safetensors en el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer decoder-only de Qwen3-4B-Instruct-2507. El ajuste se realizó con LoRA (rank 8, scale 16, dropout 0,05) aplicado exclusivamente a las proyecciones `q_proj` y `v_proj` de las últimas 16 capas, lo que da 1,31 millones de parámetros entrenables. El entrenamiento usó 400 pasos, batch de 4 y learning rate 1e-4, completándose en aproximadamente 1,8 horas en Apple Silicon. La base de entrenamiento fue el checkpoint MLX 4-bit `mlx-community/Qwen3-4B-Instruct-2507-4bit`.

Los datos son completamente sintéticos: 900 ejemplos de entrenamiento, 120 de validación y 150 de test, con temas de curso disjuntos entre splits, más 40 frases de test escritas manualmente. No se usaron conversaciones reales de usuarios. El adaptador MLX se fusionó de vuelta al modelo, se desquantizó y se convirtió a GGUF f16 con llama.cpp, para finalmente cuantizarse a Q4_K_M. No se documenta RLHF ni DPO; es un ajuste supervisado sobre una tarea de extracción estructurada.

## Capacidades

- Análisis de intención conversacional limitado a tres clases: `course_search`, `platform_howto` y `off_topic`.
- Extracción de entidades estructuradas: nivel (入門/初階/中階/進階), modalidad (`online`/`in_person`), región, precio máximo por clase y franja horaria.
- Generación de `search_query` para recuperación vectorial de cursos.
- Salida en JSON con formato fijo, condicionada a un system prompt específico del proyecto.
- Funcionamiento con `temperature 0` y sin `response_format: json_object` (el constrained decoding degrada el formato aprendido).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso general.

## Casos de uso

- Búsqueda de cursos en la plataforma melo.: el modelo recibe las últimas frases del estudiante y devuelve los criterios de filtrado y la consulta de recuperación para el motor vectorial. Es su función principal y para la que fue entrenado.
- Enrutado de conversaciones: distingue entre consultas de búsqueda de curso, dudas sobre el funcionamiento de la plataforma y mensajes fuera de tema, permitiendo derivar cada caso al flujo adecuado.
- Normalización de lenguaje natural a filtros de catálogo: convierte expresiones como "想準備兒童鋼琴檢定" en campos estructurados consultables (nivel, modalidad, región, precio, horario).
- Prototipado de asistentes verticales: sirve como plantilla de bajo coste para demostrar que un LoRA pequeño sobre un modelo de 4B puede sustituir reglas heurísticas en dominios cerrados.
- Investigación sobre ajuste fino eficiente: caso reproducible de entrenamiento LoRA en Apple Silicon con conversión a GGUF y evaluación frente a modelo base y baseline de reglas.
- Despliegue local en Ollama: al distribuirse como GGUF Q4_K_M, permite ejecutar el parser en un portátil o mini-PC sin GPU dedicada para demos y entornos de desarrollo.
- Validación de pipelines de extracción JSON: útil como referencia para medir la tasa de acierto de formato estructurado en modelos pequeños ajustados.

## Benchmarks y rendimiento

Los datos publicados corresponden a la tarea específica (intención y todos los criterios correctos), no a benchmarks generales.

| Version | Test sintetico (150) | Test manual (40) |
|---|---|---|
| Parser por reglas (baseline del sitio) | 54,7 % | 50,0 % |
| Qwen 4B original (mismo prompt, sin ajuste) | 18,0 % | 22,5 % |
| Ajuste fino, MLX 4-bit | 97,3 % | 92,5 % |
| Ajuste fino, GGUF Q4_K_M (este modelo) | 97,3 % | 90,0 % |

La tasa de formato JSON válido es del 100 % en todas las variantes ajustadas. La latencia mediana por frase en Apple Silicon es de 0,8 segundos. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (tamaño del repo: 2,5 GB).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, así como en Apple Silicon unificado.
- Ejecutable en CPU sin GPU dedicada mediante llama.cpp u Ollama, con latencia mayor.
- Despliegue recomendado: Ollama (`ollama pull hf.co/Ollie12304/melo-qwen3-4b-ft`), llama.cpp; vLLM y TGI no están documentados para este artefacto.
- Latencia medida: 0,8 s de mediana por frase en Apple Silicon con Q4_K_M.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| melo-qwen3-4b-ft | 4,02 B | no disponible | Extracción JSON para búsqueda de cursos | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Propósito general | Apache 2.0 | safetensors, GGUF |
| Parser por reglas del proyecto | n/a | n/a | Extracción JSON para búsqueda de cursos | n/a | código |

El modelo base sin ajustar obtiene 18,0 % y 22,5 % en la tarea frente al 97,3 % y 90,0 % del ajuste, lo que ilustra la ganancia del LoRA en un dominio cerrado. No se dispone de comparación con otros modelos de tamaño similar en esta tarea concreta.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona correctamente con el system prompt del proyecto y para la tarea de parsing de cursos de piano.
- Frases ambiguas producen errores: "線上實體都可以" puede clasificarse solo como online, y "停了十年想重新練" puede clasificarse como nivel avanzado. El proyecto valida programáticamente cada campo de salida.
- No usar `response_format: json_object`: el constrained decoding degrada el formato aprendido.
- Solo idioma chino; no se ha evaluado en castellano ni en otros idiomas.
- Datos de entrenamiento sintéticos, sin conversaciones reales; el rendimiento en producción puede diferir del test.
- Sin soporte de tool calling, agentes ni razonamiento general.
- Proyecto académico ("只供學習與研究"); aunque la licencia Apache 2.0 permite uso comercial, no hay garantías de soporte ni mantenimiento.
- Riesgo de alucinación en campos no presentes en la entrada: puede rellenar valores en lugar de devolver `null`.
- Cero descargas y cero likes en Hugging Face; sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ollie12304/melo-qwen3-4b-ft
- Repositorio del proyecto: https://github.com/AnChen1026/melo-piano-platform
- System prompt del parser: https://github.com/AnChen1026/melo-piano-platform/blob/main/backend/course_parser_spec.py
- Documentación de activación de la IA: https://github.com/AnChen1026/melo-piano-platform/blob/main/docs/AI功能啟動說明.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint MLX usado para entrenar: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
