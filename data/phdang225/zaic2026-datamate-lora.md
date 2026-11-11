# phDang225/ZAIC2026-DataMate-LoRA

## Resumen

DataMate LoRA es un conjunto de tres adaptadores LoRA (PEFT) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario phDang225 para el equipo VNP en la competición Zalo AI Challenge 2026, en la pista DataMate. El sistema resuelve preguntas de negocio en vietnamita sobre ficheros CSV, Excel y SQLite de una tienda, funcionando de forma completamente offline. No es un modelo de propósito general: cada adaptador está especializado en una subtarea concreta dentro de un motor de consulta estructurada.

Los tres adaptadores comparten configuración: rango LoRA 16, alpha 32, aplicados a todas las proyecciones lineales, en bfloat16 y entrenados con Unsloth exclusivamente sobre el split oficial `train/`. El primero (`datamate`, 1.096 ejemplos) convierte una pregunta en un plan de consulta JSON ejecutado sobre DuckDB; el segundo (`columns`, 919 ejemplos) asigna el rol de columnas que las reglas heurísticas no logran mapear; el tercero (`canon`, 12.685 ejemplos) normaliza preguntas ruidosas (erratas, jerga) a una formulación limpia.

Su relevancia es acotada pero clara: demuestra un patrón de despliegue multi-LoRA sobre un modelo pequeño (4B) servido con vLLM, con adaptadores intercambiables para tareas de text-to-SQL y table-question-answering en un idioma de bajos recursos como el vietnamita. El repositorio ocupa 0,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (adaptadores en bfloat16; cuantizacion del base no especificada) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Rango LoRA / alpha | 16 / 32 |
| Modulos adaptados | Todas las proyecciones lineales |
| Precision de entrenamiento | bfloat16 |
| Herramienta de entrenamiento | Unsloth |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | table-question-answering |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, un transformer decoder de 4.000 millones de parámetros. Sobre él se aplican tres adaptadores LoRA independientes con rango 16 y alpha 32 sobre todas las proyecciones lineales, lo que permite servir los tres simultáneamente en una sola instancia de vLLM mediante `--enable-lora --max-lora-rank 16 --max-loras 3`. El entrenamiento se realizó con Unsloth en bfloat16 y exclusivamente sobre el split oficial `train/` del desafío, sin contaminación con datos de test públicos o privados.

Cada adaptador se entrenó con un conjunto de ejemplos distinto y una función específica: `datamate` (1.096 ejemplos) genera planes de consulta JSON para DuckDB; `columns` (919 ejemplos) clasifica el rol semántico de columnas no cubiertas por reglas; `canon` (12.685 ejemplos) reescribe preguntas con erratas o jerga a una forma canónica. No se documentan detalles sobre composición del dataset, número de tokens de entrenamiento ni uso de RLHF/DPO. Los adaptadores esperan los prompts construidos por el motor (`src/datamate/llm/`) y no funcionan como modelos de chat autónomos.

## Capacidades

- Generación de planes de consulta JSON ejecutables sobre DuckDB a partir de preguntas de negocio en vietnamita (adaptador `datamate`).
- Clasificación semántica de columnas de tablas CSV, Excel y SQLite para mapear roles no cubiertos por reglas (adaptador `columns`).
- Normalización de preguntas ruidosas: corrección de erratas y traducción de jerga a una formulación estándar (adaptador `canon`).
- Respuesta a preguntas sobre tablas (table-question-answering) en el contexto del motor DataMate.
- Procesamiento totalmente offline de ficheros estructurados de tienda.
- Soporte multilingüe limitado al vietnamita.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo thinking más allá de lo que herede del modelo base.

## Casos de uso

- Consultas de negocio sobre inventario en CSV: el motor recibe una pregunta como "¿cuántas unidades del producto X quedan?" y el adaptador `datamate` genera el plan JSON que DuckDB ejecuta sobre el fichero, sin conexión a servicios externos.
- Normalización de preguntas de usuarios en producción: el adaptador `canon` corrige erratas y jerga antes de pasarlas al planificador, mejorando la tasa de acierto en entradas ruidosas típicas de canales de mensajería.
- Mapeo automático de esquemas heterogéneos: cuando una tienda sube un Excel con nombres de columna no estándar, el adaptador `columns` asigna roles semánticos y evita intervención manual.
- Asistente de análisis para pequeños comercios vietnamitas: despliegue offline en una instancia única de vLLM con los tres adaptadores, apto para entornos sin conectividad o con requisitos de privacidad.
- Base para pipelines text-to-SQL especializados: el patrón multi-LoRA sobre Qwen3-4B sirve como plantilla para adaptar el sistema a otros dominios o idiomas reentrenando solo los adaptadores.
- Evaluación e investigación en table-question-answering de bajos recursos: el repositorio y el código asociado permiten reproducir el enfoque sobre el split oficial del desafío.
- Prototipado de motores de consulta sobre SQLite: el plan JSON generado puede ejecutarse directamente contra bases SQLite de tienda para informes ad hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base de 4B en bfloat16 requiere aproximadamente 8 GB de pesos, a lo que se suman los tres adaptadores LoRA (repositorio total de 0,4 GB) y la caché KV.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una GPU con 16 GB o más (RTX 4090, A100, H100) es suficiente para servir el modelo con los tres adaptadores en vLLM.
- GPU de consumo: cabe en tarjetas con 16 GB o más; en configuraciones de 8-12 GB requeriría cuantización del base, no documentada.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16 --max-loras 3` y los tres módulos registrados (`datamate`, `columns`, `canon`). No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DataMate LoRA (este) | Adaptadores sobre Qwen3-4B | No disponible | Text-to-SQL y table-QA en vietnamita, offline | Apache 2.0 | Hugging Face + GitHub |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible en la informacion | Chat e instrucciones generales | No disponible en la informacion | Hugging Face |
| Alternativas text-to-SQL especializadas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los adaptadores no son modelos de chat de propósito general: dependen de los prompts construidos por el motor DataMate y fallan fuera de ese contexto.
- Idioma limitado al vietnamita; no se garantiza comportamiento en castellano ni en otros idiomas.
- Entrenados solo sobre el split `train/` oficial, con 1.096, 919 y 12.685 ejemplos respectivamente; el riesgo de sobreajuste a la distribución del desafío es alto.
- No se documentan evaluaciones de sesgo, alucinación ni robustez fuera del conjunto de competición.
- El adaptador `datamate` genera planes JSON ejecutados sobre DuckDB: un plan mal formado puede producir consultas incorrectas o costosas, por lo que se recomienda validación y límites de ejecución en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones que deben verificarse por separado.
- Sin datos publicados de latencia, throughput ni benchmarks; no apto para decisiones de producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/phDang225/ZAIC2026-DataMate-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Código del proyecto: https://github.com/dangssss/ZaloAI-Challenge-2026---ZAIC
