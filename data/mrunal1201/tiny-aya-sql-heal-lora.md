# Mrunal1201/tiny-aya-sql-heal-lora

## Resumen

tiny-aya-sql-heal-lora es un adaptador PEFT LoRA publicado por el usuario Mrunal1201 sobre el modelo base CohereLabs/tiny-aya-global (3,35B parámetros). Se trata de un checkpoint especializado en generación de SQL para SQLite con un bucle de auto-reparación (self-healing): el modelo aprende a emitir una consulta, recibir el error real de ejecución de SQLite y corregirla en un segundo turno razonando sobre el esquema de la base de datos. El adaptador se entrenó en el contexto del hackathon Lexsi, pista 3 (Data & Database Agents), con un conjunto de datos propio de 1.200 episodios multi-turno.

La relevancia del modelo radica en su enfoque agéntico: no se limita a traducir lenguaje natural a SQL, sino que incorpora el ciclo error-diagnóstico-corrección como parte del entrenamiento, con enmascaramiento de pérdida únicamente en los tokens de finalización. El adaptador es extremadamente ligero (repositorio de 0,1 GB) y está pensado para despliegue en el borde con hardware modesto, manteniendo el conocimiento multilingüe del modelo base.

La licencia es Apache 2.0 y el modelo declara soporte para inglés, hindi, alemán y canarés, aunque la model card menciona retención de razonamiento en diez idiomas. El checkpoint se publicó en noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base tiny-aya-global) con adaptador LoRA |
| Parámetros totales | 3,35B (modelo base); adaptador LoRA de rango 16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantización | no disponible (el ejemplo de carga usa BF16 y menciona 4-bit como opción) |
| Idiomas soportados | en, hi, de, kn (declarados); la model card reporta retención en 10 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only causal (tiny-aya-global) mediante LoRA con rango 16, alpha 32, dropout 0,05 y módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, sin sesgo. El entrenamiento se realizó con el backend AgentTune.create_distill_trainer sobre 1.200 episodios (2,0 épocas, 150 pasos globales), con tasa de aprendizaje 0,0002, programación coseno, 0,03 de warmup, tamaño de lote efectivo 16 (4 por dispositivo × 4 de acumulación), optimizador paged_adamw_8bit y precisión mixta BF16 con checkpointing de gradientes. La pérdida pasó de 1,2010 a 0,4081 y el pico de VRAM asignada fue de 6,331 GB en una NVIDIA L4, con un tiempo de entrenamiento de 24,28 minutos.

La innovación principal es el bucle agéntico de auto-reparación: el turno 1 genera SQL, se ejecuta en SQLite en memoria, se captura el `sqlite3.OperationalError` real y el turno 2 produce un razonamiento en `Thought:` seguido de la consulta corregida. Se aplicó enmascaramiento de pérdida solo en los tokens de finalización (completion_only) para acomodar el preámbulo de sistema de aproximadamente 365 tokens del modelo base dentro de la ventana de 1.536 tokens. El conjunto de datos fue certificado por CuratorKIT y verificado con AuditKIT 1.1.12 con predicados de resultado.

## Capacidades

- Generación de SQL para SQLite a partir de lenguaje natural, con inspección del esquema proporcionado en el prompt.
- Auto-reparación multi-turno: detecta errores operativos de SQLite, razona sobre la causa y emite una consulta corregida.
- Razonamiento explícito en formato `Thought:` antes de la consulta final.
- Soporte multilingüe declarado para inglés, hindi, alemán y canarés, con retención reportada en diez idiomas.
- Restricciones de solo lectura verificadas mediante pruebas adversarias de inyección SQL.
- No se documenta soporte de tool calling genérico ni de function calling más allá del bucle SQLite.
- No se documentan capacidades de visión, audio ni modo thinking extendido más allá del razonamiento en el bucle de reparación.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite en aplicaciones de escritorio o móviles: el adaptador traduce preguntas en lenguaje natural a SQL y corrige automáticamente errores de columna o tabla inexistente usando el esquema disponible, sin necesidad de conexión a la nube.
- Automatización de informes internos: integrado en un pipeline que recibe una pregunta de negocio, genera la consulta, la ejecuta contra una réplica de solo lectura y devuelve el resultado, con el bucle de reparación reduciendo intervenciones manuales.
- Agente de datos para soporte técnico: permite a un chatbot responder consultas sobre el estado de pedidos o clientes ejecutando SQL validado contra la base de datos, con restricciones de solo lectura que limitan el riesgo de inyección.
- Entornos con soberanía de datos: al ejecutarse en hardware local (por ejemplo, una GPU L4 o consumer), evita enviar esquemas y datos a APIs externas, algo relevante en sectores regulados.
- Educación y formación en SQL: el modelo muestra el razonamiento de corrección ante errores reales, lo que sirve como material didáctico para explicar por qué falla una consulta y cómo se repara.
- Prototipado rápido de agentes de bases de datos en el hackathon y más allá: al ser un adaptador LoRA de 0,1 GB, se puede cargar y descargar rápidamente para experimentar con distintos esquemas y dominios sin reentrenar el modelo base.
- Despliegue en el borde para asistentes de datos multilingües: cubre consultas en hindi, alemán y canarés además del inglés, con un rendimiento de 18,95 tokens por segundo en el hardware de referencia.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 200 episodios estrictamente reservados con ejecución determinista en SQLite en memoria e intervalos de confianza bootstrap del 95 % (1.000 remuestreos):

| Métrica | Base (tiny-aya-global) | tiny-aya-sql-heal-lora | Profesor API (Qwen-72B) | Delta vs base |
|---|---|---|---|---|
| SQL Heal Exec Match (final) | 57,5 % | 60,0 % [52,5 %, 66,0 %] | 71,0 % | +2,5 % |
| Tasa de consultas ejecutables | 89,5 % | 91,0 % | 98,0 % | +1,5 % |
| Retención multilingüe | 96,0 % | 96,0 % (10 idiomas) | 98,0 % | 0,0 % |
| Tasa de seguridad ante inyección SQL | 24,0 % | 10,0 % (50 sondas adversarias) | 34,0 % | Restricciones de solo lectura verificadas |
| Throughput de inferencia | 79,2 tok/s | 18,95 tok/s | 61,1 tok/s | Desplegable en el borde |
| Coste por 1.000 consultas | 0,059 USD | 0,5515 USD | 0,040 USD (API en la nube) | Soberanía total de datos |

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó un pico de 6,331 GB en BF16 con checkpointing; la inferencia en BF16 requiere aproximadamente 7 GB para el modelo base de 3,35B más el adaptador, y menos de 3 GB en cuantización de 4 bits (estimación orientativa, no publicada por el autor).
- GPU recomendadas: NVIDIA L4 (hardware de referencia del entrenamiento), A100, H100 para mayor throughput; RTX 4090 y RTX 3090 para despliegue local.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas con 4-6 GB en 4 bits, siempre que se use el modelo base cuantizado.
- Opciones de despliegue: transformers con PEFT (ejemplo oficial de la model card), vLLM, llama.cpp y Ollama para el modelo base cuantizado; TGI no está documentado para este adaptador.
- Latencia y throughput: 18,95 tokens por segundo reportados en el hardware de referencia, frente a 79,2 tok/s del modelo base sin adaptador; el coste por 1.000 consultas se estima en 0,5515 USD en el despliegue medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-sql-heal-lora | 3,35B + LoRA r=16 | 1.536 tokens | Text-to-SQL con auto-reparación multilingüe | Apache 2.0 | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global (base) | 3,35B | no disponible | Modelo multilingüe general | Apache 2.0 | Hugging Face |
| Qwen-72B (profesor en la evaluación) | 72B | no disponible | Modelo general de gran escala | no disponible en la información | API en la nube |
| Alternativas text-to-SQL especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador mejora al modelo base en solo 2,5 puntos porcentuales en la métrica principal (60,0 % frente a 57,5 %), con un intervalo de confianza que solapa ampliamente; la ganancia es modesta y debe validarse en dominios propios.
- La tasa de seguridad ante inyección SQL es del 10 % en el adaptador frente al 24 % del base, lo que indica una degradación en esta métrica pese a las restricciones de solo lectura; no debe usarse como única barrera de seguridad.
- El throughput cae de 79,2 a 18,95 tokens por segundo, y el coste por 1.000 consultas sube de 0,059 a 0,5515 USD en el despliegue medido.
- La ventana de contexto de 1.536 tokens es limitada y está condicionada por el preámbulo de sistema de aproximadamente 365 tokens del modelo base; esquemas de base de datos grandes pueden no caber.
- El modelo está especializado en SQLite; no se documenta soporte para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- Riesgo de alucinación en la generación de columnas o tablas inexistentes, mitigado parcialmente por el bucle de reparación pero no eliminado.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los heredados del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio no registra descargas ni validación comunitaria.
- El conjunto de datos y la evaluación se realizaron en el marco de un hackathon, con 200 casos de prueba; la generalización a producción real no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrunal1201/tiny-aya-sql-heal-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Conjunto de datos: https://huggingface.co/datasets/Mrunal1201/aya-self-healing-sql-dataset
- Suite de evaluación AuditKIT: https://github.com/lexsi-hackathon
- Toolkit de ajuste AgentTune: https://github.com/lexsi-hackathon
