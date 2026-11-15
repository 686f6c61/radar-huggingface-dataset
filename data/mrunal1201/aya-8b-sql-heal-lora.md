# Mrunal1201/aya-8b-sql-heal-lora

## Resumen

`aya-8b-sql-heal-lora` es un adaptador PEFT LoRA sobre el modelo base CohereLabs/aya-expanse-8b (8B parámetros), desarrollado por el usuario Mrunal1201 como submission del Lexsi Hackathon Track 3 (Data & Database Agents). El adaptador está especializado en generación Text-to-SQL con un bucle agéntico de auto-reparación multi-turno: el modelo emite una consulta SQL, esta se ejecuta contra SQLite en memoria, se captura el error real (`sqlite3.OperationalError`) y el modelo razona sobre la traza en un bloque `Thought:` para producir una consulta corregida. El objetivo es mejorar la robustez de la generación SQL cuando la primera consulta falla en ejecución, sin reentrenar el modelo base.

El checkpoint se entrena sobre el dataset curado `Mrunal1201/aya-self-healing-sql-dataset` (1.200 episodios) con el toolkit AgentTune 1.1.0 y se evalúa con AuditKIT 1.1.12 sobre 200 casos estrictamente held-out, con intervalos de confianza bootstrap del 95% (1.000 remuestreos). El adaptador reporta una mejora de +6,0 puntos en SQL Heal Exec Match (57,5% → 63,5%) y de +1,5 puntos en tasa de consultas ejecutables (89,5% → 96,0%) respecto al modelo base.

Es relevante ahora porque aborda un problema práctico en pipelines de agentes de datos: la corrección automática de SQL fallido a partir de errores de ejecución reales, con preservación multilingüe (96,0% de retención en 10 idiomas) y un coste de entrenamiento muy bajo (24,62 minutos en una única NVIDIA L4). El adaptador es pequeño (0,1 GB) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base aya-expanse-8b) con adaptador LoRA (PEFT); `task_type: CAUSAL_LM` |
| Parametros totales | 8B (modelo base); el adaptador LoRA no reporta recuento de parámetros entrenables en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento con `max_seq_length=1536`; longitud de contexto nativa del modelo base: no disponible en la información proporcionada |
| Tipos de cuantizacion | No se especifican en el adaptador; el quickstart usa BF16 o 4-bit para el modelo base. Cuantizaciones del adaptador: no disponible |
| Idiomas soportados | en, hi, de, kn (según metadatos); evaluación de retención en 10 idiomas: hindi, alemán, kannada, español, francés, portugués, turco, árabe, chino y suajili |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); repo de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (`r: 16`), `lora_alpha: 32`, `lora_dropout: 0.05`, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer del modelo base aya-expanse-8b, con `bias: none`. El entrenamiento se realizó con AgentTune 1.1.0 (`create_distill_trainer`) sobre el subconjunto completo de 1.200 episodios del dataset `aya-self-healing-sql-dataset`, durante 150 pasos globales en 2,0 épocas, con learning rate 0,0002, schedule cosine, warmup 0,03, batch efectivo de 16 (2 por dispositivo × 8 de acumulación de gradientes), optimizador `paged_adamw_8bit`, precisión mixta BF16 y gradient checkpointing. La pérdida pasó de 1,2010 a 0,3696.

La innovación principal es el bucle agéntico de auto-reparación: el entrenamiento modela una secuencia de turnos en la que el modelo genera SQL, este se ejecuta en SQLite en memoria, se captura el error real de ejecución y el modelo produce un razonamiento en `Thought:` seguido de la consulta corregida en un bloque ````sql````. El enmascarado de pérdida es `completion_only`, supervisando estrictamente el turno final del asistente, y se usa un preámbulo de sistema de Tiny Aya de aproximadamente 365 tokens que obliga a fijar `max_seq_length=1536`. El pico de VRAM durante el entrenamiento fue de 13,898 GB en una NVIDIA L4 (22,03 GB), con un tiempo total de 24,62 minutos, usando PyTorch 2.11.0+cu130, CUDA 13.0, PEFT 0.21.3 y TRL 1.7.1.

## Capacidades

- Generación de texto y razonamiento orientado a SQL: traducción de preguntas en lenguaje natural a consultas SQLite de solo lectura.
- Auto-reparación multi-turno: interpreta errores reales de ejecución de SQLite y emite una consulta corregida precedida de un bloque `Thought:`.
- Recuperación de joins complejos: el entrenamiento incluye reparación de consultas con joins según la model card.
- Cumplimiento de instrucciones y adherencia al esquema proporcionado en el preámbulo del sistema.
- Capacidades multilingües: evaluación de retención de razonamiento en 10 idiomas (hindi, alemán, kannada, español, francés, portugués, turco, árabe, chino y suajili), con 96,0% de retención reportada.
- Restricciones de solo lectura verificadas mediante sondas adversariales de inyección SQL.
- Generación determinista con `temperature=0.0` en el ejemplo de inferencia.
- No se documenta soporte explícito de tool calling genérico, visión, audio ni modo thinking más allá del bloque `Thought:` del bucle de reparación.

## Casos de uso

- Agentes de datos autónomos sobre SQLite: el adaptador puede integrarse en un bucle en el que cada consulta generada se ejecuta en una base SQLite en memoria y, si falla, el error se realimenta al modelo para que genere una corrección, reduciendo la intervención humana en pipelines de consulta.
- Asistentes de análisis para bases de datos de solo lectura: con las restricciones de solo lectura verificadas, es adecuado para entornos donde el modelo debe consultar datos sin riesgo de escritura, como paneles internos de métricas o exploración de datasets.
- Generación de SQL multilingüe: al preservar el razonamiento en hindi, alemán, kannada, español, francés, portugués, turco, árabe, chino y suajili, puede desplegarse en equipos o productos con usuarios no anglófonos que formulan preguntas en su idioma.
- Reparación automática de consultas en producción: el modelo puede colocarse como capa de corrección sobre un generador SQL existente, tomando la consulta fallida y el error de ejecución para producir una versión corregida antes de escalar a un humano.
- Prototipado rápido en hardware de gama baja: con un adaptador de 0,1 GB y un modelo base de 8B, puede desplegarse en una única GPU consumer o en entornos edge, según la model card ("on-device Edge Deployable"), para pruebas de concepto de agentes de datos.
- Evaluación y auditoría de pipelines Text-to-SQL: el adaptador y su suite AuditKIT permiten medir la tasa de consultas ejecutables y la coincidencia de ejecución en episodios held-out, útil para comparar variantes de prompting o de modelos base.
- Educación y formación en SQL: el bloque `Thought:` explícito y la corrección basada en errores reales hacen que las respuestas sean trazables, lo que puede emplearse en herramientas de aprendizaje que explican por qué una consulta falla y cómo corregirla.

## Benchmarks y rendimiento

Resultados reportados por el autor con AuditKIT sobre 200 episodios held-out, ejecución determinista en SQLite en memoria, con intervalos de confianza bootstrap del 95% (1.000 remuestreos):

| Metrica | Baseline (aya-expanse-8b) | aya-8b-sql-heal-lora | Teacher API (Qwen-72B) | Delta vs baseline |
|---|---|---|---|---|
| SQL Heal Exec Match (final) | 57,5% | 63,5% [57,0%, 70,0%] | 71,0% | +6,0% |
| Tasa de consultas ejecutables | 89,5% | 96,0% | 98,0% | +1,5% |
| Retención multilingüe | 96,0% | 96,0% (10 idiomas) | 98,0% | 0,0% |
| Tasa de seguridad ante inyección SQL | 24,0% | 14,0% (50 sondas adversariales) | 34,0% | Restricciones de solo lectura verificadas |
| Throughput de inferencia | 79,2 tok/s | 35,67 tok/s | 61,1 tok/s | Despliegue edge |
| Coste por 1.000 consultas | 0,059 USD | 0,3076 USD | 0,040 USD (API cloud) | Soberanía de datos |

## Requisitos de hardware

- Entrenamiento: una única NVIDIA L4 con 22,03 GB de VRAM, con un pico asignado de 13,898 GB, BF16 y gradient checkpointing. Tiempo de pared de 24,62 minutos para 150 pasos.
- Inferencia: el adaptador pesa 0,1 GB; el modelo base de 8B requiere VRAM adicional. En BF16, el modelo base necesita aproximadamente 16 GB solo para pesos, por lo que encaja en GPUs de 24 GB (RTX 4090, A10G, L4) o superiores (A100, H100). En cuantización de 4 bits, el modelo base puede caber en GPUs consumer de 8-12 GB, aunque el adaptador no documenta cuantizaciones específicas.
- Cabe en GPU consumer: sí, con cuantización del modelo base; en BF16 requiere al menos 24 GB.
- Opciones de despliegue: el quickstart oficial usa `transformers` con `AutoModelForCausalLM` y `peft.PeftModel` en BF16 o 4-bit. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este adaptador; al ser un adaptador PEFT sobre un modelo de 8B, sería necesario fusionarlo o cargarlo con soporte PEFT en el servidor de inferencia elegido.
- Throughput reportado: 35,67 tok/s para el adaptador frente a 79,2 tok/s del baseline en el hardware de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SQL Heal Exec Match | Tasa ejecutable | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aya-8b-sql-heal-lora | 8B (base) + LoRA r=16 | 1.536 tokens en entrenamiento | 63,5% | 96,0% | Apache 2.0 | Hugging Face (PEFT) |
| aya-expanse-8b (baseline) | 8B | No disponible | 57,5% | 89,5% | No disponible en la información | Hugging Face |
| Teacher API Qwen-72B | 72B | No disponible | 71,0% | 98,0% | No disponible en la información | API |

No se dispone de datos de otros adaptadores Text-to-SQL comparables en la información proporcionada.

## Limitaciones y advertencias

- La tasa de seguridad ante inyección SQL del adaptador es del 14,0% frente al 24,0% del baseline, lo que indica una mayor vulnerabilidad a sondas adversariales de inyección; las restricciones de solo lectura están verificadas, pero el modelo no debe exponerse a entradas no confiables sin una capa de validación adicional.
- El throughput de inferencia cae de 79,2 tok/s a 35,67 tok/s respecto al baseline, lo que puede afectar a despliegues con requisitos de latencia estrictos.
- El coste por 1.000 consultas reportado es de 0,3076 USD frente a 0,059 USD del baseline, atribuido a la inferencia en dispositivo; no es adecuado si el coste por consulta es el criterio principal.
- La ventana de entrenamiento está fijada en 1.536 tokens, lo que limita la longitud de esquemas y conversaciones multi-turno; esquemas grandes o historiales largos pueden truncarse.
- El adaptador está entrenado específicamente para SQLite; su comportamiento en otros dialectos SQL (PostgreSQL, MySQL, etc.) no está documentado.
- El modelo base aya-expanse-8b puede presentar sesgos y alucinaciones heredados; el adaptador no documenta mitigaciones específicas de sesgo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-14; no hay evidencia de uso en producción ni de validación independiente de los resultados reportados.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base aya-expanse-8b, que no se detalla en la información proporcionada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Mrunal1201/aya-8b-sql-heal-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Mrunal1201/aya-self-healing-sql-dataset
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Suite de evaluación AuditKIT: https://github.com/lexsi-hackathon
- Toolkit de entrenamiento AgentTune: https://github.com/lexsi-hackathon
