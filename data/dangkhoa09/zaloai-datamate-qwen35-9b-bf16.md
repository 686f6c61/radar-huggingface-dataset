# DangKhoa09/ZaloAI-DataMate-Qwen35-9B-BF16

## Resumen
ZaloAI-DataMate-Qwen35-9B-BF16 es un ajuste fino del modelo base Qwen/Qwen3.5-9B, desarrollado por el equipo DataMate (usuario DangKhoa09) para la competición Zalo AI Challenge 2026, centrada en el acceso a datos empresariales mediante IA agéntica. El modelo está especializado en responder preguntas en lenguaje natural en vietnamita sobre datos tabulares complejos (Excel multihoja, CSV, SQLite), generando código Python/DuckDB como paso intermedio para ejecutar consultas y emitir respuestas tipadas.

Técnicamente se apoya en la arquitectura híbrida de Qwen3.5, que combina 36 capas de Gated DeltaNet (atención lineal con estado recurrente) con capas de atención completa. El ajuste se realizó en dos etapas: un SFT con DoRA sobre 3.045 muestras de 30 empresas reales, seguido de un alineamiento DPO con 1.287 pares de preferencia orientado a maximizar la métrica Penalized Accuracy (PA), que penaliza respuestas incorrectas y recompensa la abstención cuando no hay evidencia suficiente.

El modelo tiene 9.653.104.368 parámetros totales y se distribuye en BF16 puro (unos 18 GB de safetensors, 19,3 GB de repositorio). Su relevancia radica en ser un ejemplo concreto de especialización vertical: en lugar de un modelo generalista, se optimiza para un flujo CodeAct con ejecución de código sobre bases de datos, con reglas estrictas de formato de respuesta y abstención calibrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: Gated DeltaNet (atención lineal) + atención completa, con vision encoder |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en el ejemplo de vLLM se configura `max_model_len=10240`) |
| Tipos de cuantización | BF16 (pesos publicados en BF16 puro); otras cuantizaciones no disponibles |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, pesos fusionados/mergelados) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura híbrida de Qwen3.5-9B: 36 capas DeltaNet con atención lineal y memoria de estado recurrente, combinadas con capas de atención tradicional. Incluye un vision encoder (`model.visual`) con 333 tensores que, según la model card, se congeló al 100 % durante el entrenamiento y se preservó intacto en la fusión de pesos, lo que garantiza compatibilidad con el runtime offline de vLLM sobre dos RTX 5090.

El entrenamiento se estructuró en dos fases. La primera, DoRA SFT, usó 3.045 muestras de alta calidad procedentes de 30 empresas reales (`biz_101` a `biz_130`), sin filtración del conjunto de test público. Se aplicó una normalización que cierra inmediatamente el bloque de razonamiento (`<think>\n</think>\n`) para que el modelo pase directamente a generar código Python/DuckDB, reduciendo la latencia de inferencia. La segunda fase, DPO, empleó 1.287 pares (elegido/rechazado) y alcanzó `rewards/accuracies = 100 %` desde el paso 20, con un margen de `+15.61` en el paso 30, penalizando con fuerza la generación de código defectuoso o comentarios superfluos.

## Capacidades
- Generación de código Python/DuckDB para consultas analíticas sobre datos tabulares (Excel multihoja, CSV, SQLite).
- Flujo CodeAct: planificación breve seguida de código ejecutable que llama a `dm.sql()` y `dm.emit_answer()`.
- Respuestas tipadas estrictas en 9 formatos: `number`, `percent`, `string`, `date`, `boolean`, `list`, `table`, `unanswerable`, `abstain`.
- Abstención calibrada: cuando la confianza es inferior a 0,60 o faltan datos de respaldo, el modelo emite `abstain` para maximizar la métrica PA.
- Comprensión de entrada imagen-texto a texto (pipeline `image-text-to-text`), heredada del vision encoder del modelo base.
- Conversación multi-turno en vietnamita e inglés.
- Razonamiento agéntico de varios pasos orientado a la resolución de preguntas de negocio sobre datos.
- No se documenta soporte explícito de tool calling genérico ni function calling fuera del contrato `dm.emit_answer`.

## Casos de uso
- Análisis de ventas empresariales: el modelo recibe la pregunta "¿cuánto fue el ingreso total del mes pasado?" junto con metadatos de la empresa y la fecha de referencia, genera la consulta SQL sobre las tablas correspondientes y emite la respuesta numérica tipada.
- Automatización de informes financieros: integrado en un pipeline que carga ficheros Excel multihoja, el modelo traduce preguntas de negocio a consultas DuckDB y devuelve tablas o listas listas para volcar en un dashboard.
- Asistente interno de datos para empleados no técnicos: al aceptar lenguaje natural en vietnamita y devolver respuestas estructuradas, permite que usuarios sin SQL consulten bases de datos corporativas mediante chat.
- Control de calidad con abstención: en entornos donde una respuesta errónea es costosa (auditoría, cumplimiento), la calibración para emitir `abstain` evita respuestas inventadas cuando la evidencia es insuficiente.
- Evaluación de competiciones y benchmarks de QA tabular: sirve como referencia reproducible para la tarea "Talking To Your Data Through Agentic AI" del Zalo AI Challenge 2026, con pesos fusionados listos para despliegue offline.
- Despliegue aislado en producción: al ejecutarse en contenedores sin red (`--network none`) sobre dos RTX 5090 en menos de 6 horas, encaja en entornos con requisitos estrictos de soberanía de datos.
- Extracción de métricas puntuales (porcentajes, fechas, booleanos) desde registros empresariales para alimentar sistemas de alertas o validaciones automáticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas internas del entrenamiento DPO:

| Métrica (DPO) | Paso 10 | Paso 20 | Paso 30 |
|---|---|---|---|
| Training loss | 0,227496 | 0,003688 | 0,001733 |
| rewards/chosen | +2,944245 | +7,578511 | +7,545743 |
| rewards/rejected | -1,806989 | -6,397281 | -8,065120 |
| rewards/accuracies | 81,25 % | 100,00 % | 100,00 % |
| rewards/margins | +4,751234 | +13,975792 | +15,610863 |

## Requisitos de hardware
- VRAM estimada en BF16: en torno a 18-20 GB solo para pesos, más overhead de KV cache y activaciones; el ejemplo de la model card usa `tensor_parallel_size=1` con `max_model_len=10240`.
- GPU recomendadas: el autor valida el despliegue en 2 × RTX 5090 (Blackwell, CUDA ≥ 12,8); también es viable en A100 40/80 GB o H100 para mayor margen de contexto.
- GPU de consumo: cabe en RTX 5090 individual en BF16 si se limita la longitud de contexto; en GPUs de 24 GB (RTX 4090) requeriría cuantización, que no se distribuye en el repositorio.
- Opciones de despliegue: vLLM (recomendado por el autor, con `trust_remote_code=True`), Hugging Face Transformers con `device_map="auto"` y `torch_dtype=bfloat16`. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor menciona que el cierre inmediato del bloque de razonamiento reduce la latencia, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZaloAI-DataMate-Qwen35-9B-BF16 | 9,65 B | no disponible | QA tabular vietnamita con CodeAct y abstención | Apache 2.0 | Hugging Face (8 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Modelo generalista multimodal | no disponible en la información | Hugging Face |
| Alternativas de QA tabular | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- El modelo está especializado en vietnamita e inglés; su rendimiento fuera de estos idiomas no está documentado.
- El ajuste se realizó sobre 30 empresas concretas (`biz_101` a `biz_130`); puede generalizar mal a esquemas de datos, dominios o convenciones de nombres distintos.
- El contrato de salida es rígido (9 tipos y funciones `dm.sql`/`dm.emit_answer`); usarlo fuera de ese entorno CodeAct requiere adaptar el prompt y el runtime.
- Riesgo de alucinación en consultas SQL: aunque el DPO penaliza código defectuoso, no hay evaluación pública que cuantifique la tasa de error en producción.
- La abstención calibrada con umbral 0,60 está optimizada para la métrica PA de la competición; puede no ser adecuada para aplicaciones donde se espera siempre una respuesta.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de Qwen3.5-9B, hereda los sesgos no auditados del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas.
- El repositorio tiene muy poca tracción (8 descargas, 0 likes) y fue creado en noviembre de 2026; no hay validación externa de su calidad.
- El despliegue en BF16 exige GPUs de gama alta; no se ofrecen pesos cuantizados en el repositorio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DangKhoa09/ZaloAI-DataMate-Qwen35-9B-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub del equipo: https://github.com/bentovnace/ZaloAI-DataMate-2026
- Competición Zalo AI Challenge: https://challenge.zalo.ai/
