# Mrunal1201/tiny-aya-sql-control-lora

## Resumen

tiny-aya-sql-control-lora es un adaptador LoRA de PEFT sobre el modelo base CohereLabs/tiny-aya-global (3.350 millones de parámetros), desarrollado por el usuario Mrunal1201 como parte de la Track 3 (Data & Database Agents) del Lexsi Hackathon. El adaptador está entrenado exclusivamente sobre episodios de tipo `single_turn` (420 episodios) del dataset Mrunal1201/aya-self-healing-sql-dataset, y funciona como control experimental para aislar el impacto causal de la destilación con feedback de errores multi-turno frente al ajuste supervisado (SFT) estándar de un solo turno.

El problema que aborda es la generación de SQL a partir de lenguaje natural con autocorrección ante errores de ejecución en SQLite: el modelo aprende a producir una primera consulta, capturar el `sqlite3.OperationalError` real y razonar una corrección en un bloque `Thought:` seguido de SQL revisado. Es relevante para evaluar si el bucle agéntico de auto-reparación aporta mejoras medibles sobre SFT convencional en modelos pequeños, y para estudiar la retención multilingüe tras el ajuste.

El adaptador ocupa 0,1 GB, se distribuye en formato safetensors con licencia Apache 2.0, y declara soporte para inglés, hindi, alemán y kannada en sus metadatos, aunque la evaluación de retención cubre diez idiomas. No se han publicado resultados de benchmarks independientes más allá de los reportados por el propio autor con su suite AuditKIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only CohereLabs/tiny-aya-global |
| Parametros totales | 3.350 millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens durante entrenamiento (`max_seq_length=1536`); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | BF16 en entrenamiento; no se documentan otras cuantizaciones del adaptador |
| Idiomas soportados | en, hi, de, kn (metadatos); evaluacion de retencion en 10 idiomas (es, fr, pt, tr, ar, zh, sw adicionales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=16, alpha=32, dropout 0.05 y `bias="none"`, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer subyacente, con `task_type=CAUSAL_LM`. El entrenamiento se realizó con AgentTune 1.1.0 (`create_distill_trainer`) sobre 420 episodios `single_turn`, durante 54 pasos globales en 2,0 épocas, con learning rate 2e-4, schedule coseno, warmup 0.03, batch efectivo de 16 (4 por dispositivo × 4 de acumulación), optimizador `paged_adamw_8bit`, precisión BF16 y gradient checkpointing. La pérdida bajó de 1,2010 a 0,7045, con 7,176 GB de VRAM pico en una NVIDIA L4 y 7,33 minutos de entrenamiento en total.

La innovación principal es el enmascaramiento de pérdida estricto sobre tokens de completación (`completion_only`), necesario para acomodar el preámbulo de sistema de Tiny Aya (~365 tokens) sin entrenar sobre él, junto con el formato de bucle auto-reparador: turno 1 de SQL, ejecución en SQLite en memoria, captura del error real y turno 2 con razonamiento explícito en `Thought:` y SQL corregido. El adaptador se plantea como control frente a variantes multi-turno del mismo pipeline, de modo que su rendimiento sirve de referencia para medir la contribución del feedback iterativo.

## Capacidades

- Generación de texto y razonamiento en formato conversacional de un solo turno.
- Traducción de lenguaje natural a SQL de solo lectura sobre esquemas SQLite.
- Autocorrección de consultas a partir de mensajes de error de ejecución de SQLite (bucle de auto-reparación).
- Razonamiento explícito en bloques `Thought:` antes de emitir la consulta corregida.
- Soporte multilingüe declarado para inglés, hindi, alemán y kannada, con retención medida en diez idiomas.
- Restricciones de solo lectura verificadas mediante sondas adversariales de inyección SQL.
- No se documenta soporte de tool calling genérico, function calling, agentes multi-paso fuera del bucle SQL, visión ni audio.

## Casos de uso

- Asistente de consultas sobre bases de datos SQLite en producción: el adaptador traduce preguntas en lenguaje natural a SQL de solo lectura y corrige errores de esquema en un segundo turno, lo que reduce la intervención manual en entornos con esquemas cambiantes.
- Control experimental en investigación de ajuste fino: sirve como referencia `single_turn` para comparar contra variantes multi-turno del mismo pipeline y cuantificar el efecto de la destilación con feedback de errores.
- Generación de SQL en herramientas de BI internas: con 1.536 tokens de ventana puede incluir el esquema de tablas relevantes y la pregunta del usuario, aunque esquemas grandes requerirán selección previa de tablas.
- Evaluación de retención multilingüe tras SFT: útil para estudiar olvido catastrófico en modelos pequeños, dado que el autor reporta 96,0 % de retención en diez idiomas.
- Despliegue en dispositivos de borde: el adaptador pesa 0,1 GB y el modelo base es de 3.350 millones de parámetros, por lo que cabe en GPUs de consumo con cuantización del base, aunque el throughput medido (18,5 tok/s) limita su uso interactivo intensivo.
- Auditoría de seguridad de consultas: las sondas adversariales de inyección SQL permiten validar que el modelo respeta restricciones de solo lectura antes de exponerlo a usuarios finales.
- Prototipado rápido de pipelines text-to-SQL en hackathons y entornos de investigación: el entrenamiento completo cabe en 7,33 minutos en una L4, lo que facilita iterar sobre datasets y formatos de prompt.

## Benchmarks y rendimiento

Resultados reportados por el autor con AuditKIT 1.1.12 sobre 200 episodios de test estrictamente separados, con intervalos de confianza bootstrap del 95 % (1.000 remuestreos):

| Metrica | Baseline (tiny-aya-global) | tiny-aya-sql-control-lora | Teacher API (Qwen-72B) | Delta vs baseline |
|---|---|---|---|---|
| SQL Heal Exec Match (final) | 57,5 % | 60,0 % [53,5 %, 66,5 %] | 71,0 % | +2,5 % |
| Executable Query Rate | 89,5 % | 86,0 % | 98,0 % | +1,5 % (dato del autor, incoherente con las cifras) |
| Multilingual Retention | 96,0 % | 96,0 % (10 idiomas) | 98,0 % | 0,0 % |
| SQL Injection Safety Rate | 24,0 % | 10,0 % (50 sondas adversariales) | 34,0 % | Restricciones de solo lectura verificadas |
| Inference Throughput | 79,2 tok/s | 18,5 tok/s | 61,1 tok/s | Despliegue en borde |
| Cost per 1.000 Queries | 0,059 USD | 0,5934 USD | 0,040 USD (API en nube) | Soberanía de datos |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de la tabla proceden exclusivamente de la model card del autor y no han sido replicadas por terceros.

## Requisitos de hardware

- VRAM estimada: el adaptador añade un coste mínimo; el modelo base en BF16 requiere aproximadamente 6,7 GB de pesos, y el entrenamiento del adaptador consumió 7,176 GB pico en una NVIDIA L4.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A100, H100 para mayor throughput; RTX 4090 y RTX 3090 son suficientes para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización del base a 8 bits o 4 bits, en GPUs de 8-12 GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM y TGI previa fusión del adaptador con el base, llama.cpp y Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: 18,5 tok/s medidos para el adaptador frente a 79,2 tok/s del base y 61,1 tok/s del teacher API; el coste por 1.000 consultas se estima en 0,5934 USD en el entorno del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| tiny-aya-sql-control-lora | 3,35 B (base) + LoRA | 1.536 tokens (entrenamiento) | Text-to-SQL con autocorrección, control single-turn | Apache 2.0 | Adaptador de 0,1 GB; 60,0 % Exec Match en AuditKIT |
| CohereLabs/tiny-aya-global (base) | 3,35 B | no disponible | Modelo multilingüe generalista | no disponible en la informacion | Baseline del adaptador; 57,5 % Exec Match |
| Teacher API (Qwen-72B) | 72 B | no disponible | Profesor de destilación | no disponible en la informacion | 71,0 % Exec Match; 61,1 tok/s; 0,040 USD/1.000 consultas |

No se dispone de comparativas con otros adaptadores text-to-SQL de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado solo con episodios `single_turn`; su función es de control experimental, no de producción multi-turno.
- La tasa de consultas ejecutables (86,0 %) es inferior a la del baseline (89,5 %), lo que indica regresiones en algunos casos pese a la mejora en Exec Match.
- La tasa de seguridad frente a inyección SQL baja del 24,0 % al 10,0 %, lo que exige validación externa antes de exponerlo a entradas no confiables.
- El throughput cae de 79,2 a 18,5 tok/s y el coste por consulta se multiplica por diez respecto al baseline, lo que limita despliegues de alto volumen.
- Los benchmarks proceden únicamente del autor y de su propia suite AuditKIT, sin replicación independiente ni intervalos de confianza en todas las métricas.
- La ventana de 1.536 tokens puede resultar insuficiente para esquemas de bases de datos grandes, que requerirán selección previa de tablas y columnas.
- Los idiomas declarados en metadatos (en, hi, de, kn) no coinciden con los diez idiomas evaluados; el soporte real fuera de esos cuatro no está verificado de forma independiente.
- Riesgo de alucinación de columnas o tablas inexistentes, mitigado parcialmente por el bucle de error pero no eliminado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base CohereLabs/tiny-aya-global debe verificarse por separado.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Mrunal1201/tiny-aya-sql-control-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset: https://huggingface.co/datasets/Mrunal1201/aya-self-healing-sql-dataset
- Suite de evaluación AuditKIT (referenciada en la model card): https://github.com/lexsi-hackathon
- Toolkit de ajuste AgentTune (referenciado en la model card): https://github.com/lexsi-hackathon
