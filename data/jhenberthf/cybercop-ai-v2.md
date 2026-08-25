# jhenberthf/cybercop-ai-v2

## Resumen

Cybercop AI V2 es un adaptador LoRA (PEFT) desarrollado por jhenberthf que convierte el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` en un asistente especializado en investigación de ciberdelitos. Está entrenado para producir respuestas estructuradas y orientadas a procedimientos para el triaje de cibercrimen, estafas en línea y análisis forense digital, en inglés y taglish (mezcla de filipino e inglés). Es la segunda versión del adaptador original `jhenberthf/cybercop-ai`, con un conjunto de datos ampliado (2011 filas frente a 99), un proceso de depuración de identificadores de unidades operativas más estricto y un entrenamiento más largo.

El modelo se entrenó con QLoRA sobre una base cuantizada en 4 bits (NF4) y añade aproximadamente 40,4 millones de parámetros entrenables (0,53 % de la base). El adaptador está pensado como herramienta de apoyo a la decisión para investigadores humanos, no como autoridad legal u operativa: todas las salidas deben ser revisadas por un investigador cualificado antes de cualquier acción. Se distribuye con licencia "other" (sin especificar) y pesa 0,2 GB en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) + adaptador LoRA |
| Parámetros totales | ~7,6B (base 7B) + 40,4M entrenables en el adaptador |
| Parámetros activos | No aplica (no es MoE; todos los parámetros de la base están activos) |
| Longitud de contexto | 256 tokens (secuencia máxima de entrenamiento); la base Qwen2.5-7B soporta 32K |
| Tipos de cuantización | Base 4-bit NF4 (bitsandbytes); entrenamiento en bf16 |
| Idiomas soportados | Inglés, filipino (taglish) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) aplicado sobre `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits (NF4) del modelo Qwen2.5-7B-Instruct. El adaptador tiene rango 16, alpha 32 y dropout 0,05, y se aplica a las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. El entrenamiento se realizó con QLoRA, optimizador `adamw_torch`, gradient checkpointing y precisión bf16, sobre una única GPU NVIDIA RTX 3050 de 6 GB.

El conjunto de datos de entrenamiento (`jhenberthf/cyber-investigator`) contiene 2011 filas en formato Alpaca: 311 curadas manualmente y 1700 generadas sintéticamente con un LLM. Se entrenó durante 502 pasos (equivalente a ~2 épocas de datos) con una pérdida final de 0,2654. Una innovación destacable es el proceso de "unit-label scrubbing": una pasada regex defensiva que sustituye identificadores de unidades operativas específicas (códigos de unidades de respuesta cibernética, equipos regionales, grupos anticiberdelito y referencias a la policía nacional filipina) por el marcador `[UNIT]` tanto en los datos de entrenamiento como en las salidas generadas en inferencia, para evitar que el modelo aprenda o filtre identificadores operativos reales.

## Capacidades

- Generación de respuestas estructuradas y orientadas a procedimientos para el análisis de ciberdelitos, estafas en línea y forense digital.
- Clasificación del tipo probable de ciberdelito a partir de una denuncia.
- Listado de pasos de preservación de evidencia inmediatos.
- Esquema de las siguientes acciones de investigación.
- Soporte bilingüe en inglés y taglish (filipino con mezcla de inglés).
- Formato de prompt específico: el adaptador se entrenó con texto en formato Alpaca (`### Instruction / ### Input / ### Response`) envuelto en un turno de chat del template de Qwen; no acepta texto Alpaca crudo directamente.
- Sin soporte declarado para tool calling, funciones, agentes, visión o audio.

## Casos de uso

- Triaje de denuncias de estafas en línea: dado un relato de víctima (p. ej., fraude con transferencias GCash), el modelo clasifica el tipo de ciberdelito, sugiere pasos de preservación de evidencia y delinea las siguientes acciones de investigación, todo en formato estructurado.
- Preservación de evidencia digital: asiste en la enumeración de pasos inmediatos para asegurar registros, capturas, transacciones y comunicaciones antes de que se borren, útil para primeros respondedores en incidentes de estafa.
- Clasificación de esquemas de fraude: ayuda a distinguir entre suplantación de identidad, fraude de compra, estafa de soporte técnico, etc., a partir de descripciones narrativas de víctimas.
- Redacción de informes de investigación bilingües: genera borradores de informes en inglés o taglish para documentación interna o comunicación con unidades de investigación.
- Soporte a equipos de investigación cibernética en regiones filipinas: el modelo conoce terminología local (GCash, escenarios de estafa comunes) y puede operar en el registro lingüístico habitual de los investigadores filipinos.
- Herramienta de apoyo a la decisión para análisis de casos: como asistente interno, proporciona sugerencias que un investigador humano cualificado debe revisar y verificar antes de actuar, reduciendo el tiempo de triaje inicial.
- Formación de nuevos investigadores: puede usarse como ejemplo de estructura de análisis de ciberdelitos, mostrando cómo se desglosa un caso en tipo, preservación y acciones siguientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación estándar (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. Solo se reporta la pérdida de entrenamiento final (0,2654) y la trayectoria de pérdida durante el entrenamiento.

## Requisitos de hardware

- Entrenamiento: se realizó en una única GPU NVIDIA RTX 3050 de 6 GB VRAM (CUDA 12.6) con QLoRA; el adaptador es pequeño (40,4M parámetros) y la base está cuantizada en 4 bits.
- Inferencia: dado que la base es de 7B en 4 bits, cabe en GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.). El adaptador LoRA añade apenas 40,4M de parámetros.
- Despliegue: se usa con la librería `transformers` + `peft` (PeftModel) sobre la base 4-bit; no hay indicación de soporte en vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponible; dependerá de la GPU y del número de tokens generados (el ejemplo de uso genera hasta 512 tokens).

## Comparativa con modelos similares

| Modelo | Base | Contexto | Entrenamiento | Idiomas | Licencia |
|---|---|---|---|---|---|
| `jhenberthf/cybercop-ai-v2` | Qwen2.5-7B-Instruct (4-bit) | 256 (entrenamiento) | 2011 filas, LoRA | en, fil | other |
| `jhenberthf/cybercop-ai` (V1) | Qwen2.5-7B-Instruct (4-bit) | 512 | 99 filas curadas | en, fil | other |
| Qwen2.5-7B-Instruct (base) | Qwen2.5-7B | 32K | ~18T tokens | multilingüe | Apache 2.0 / Qwen |

La comparativa con modelos de la misma categoría es limitada: no hay otros adaptadores públicos para investigación de ciberdelitos en taglish conocidos. La principal diferencia entre V1 y V2 es el conjunto de datos (2011 vs 99 filas) y el entrenamiento más largo (502 vs 48 pasos). Frente a la base sin adaptar, V2 está especializado en el dominio de ciberinvestigación pero pierde generalidad y soporte multilingüe.

## Limitaciones y advertencias

- No es autoridad legal u operativa: las salidas son sugerencias; deben verificarse contra procedimientos vigentes antes de actuar.
- Riesgo de alucinación: el modelo puede generar información incorrecta sobre esquemas de fraude no familiares, jurisdicciones o detalles técnicos específicos.
- Contexto limitado: la longitud máxima de entrenamiento es de 256 tokens, lo que limita la capacidad de procesar denuncias largas o informes extensos.
- Conjunto de datos pequeño: 2011 filas (311 curadas + 1700 sintéticas) pueden no cubrir la diversidad de escenarios de ciberdelitos reales.
- Idiomas restringidos: solo inglés y taglish; no soporta otros idiomas.
- Licencia "other": no se especifica la licencia exacta; el uso comercial no está claramente permitido. Se recomienda consultar al autor antes de uso en producción.
- Dependencia del formato de prompt: requiere envolver el texto en formato Alpaca dentro del template de chat de Qwen; un uso incorrecto degrada el rendimiento.
- No hay soporte declarado para tool calling, agentes o visión: es un asistente de texto puro para análisis de denuncias.
- No hay benchmarks publicados que respalden su eficacia en tareas de investigación cibernética.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhenberthf/cybercop-ai-v2
- Versión anterior (V1): https://huggingface.co/jhenberthf/cybercop-ai
- Dataset de entrenamiento: https://huggingface.co/datasets/jhenberthf/cyber-investigator
- Perfil del autor en Hugging Face: https://huggingface.co/jhenberthf
