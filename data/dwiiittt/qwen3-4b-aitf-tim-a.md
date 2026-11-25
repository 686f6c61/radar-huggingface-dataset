# dwiiittt/qwen3-4b-aitf-tim-a

## Resumen

Qwen3-4B AITF Tim A es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario dwiiittt. El modelo ha sido especializado mediante LoRA en bf16 (3 épocas, 13.480 filas de entrenamiento) y posteriormente fusionado, para una tarea muy concreta: evaluar grupos de ítems de un checklist de revisión de Términos de Referencia (TOR) en el marco del AITF (presumiblemente un marco de auditoría o evaluación de proyectos en Indonesia).

El modelo recibe como entrada un system prompt por grupo de ítems y un user prompt con formato fijo (actividad, resultado, volumen, ítem evaluado, sección del TOR y datos comparativos de RAB), y devuelve un JSON con la estructura `{"<código>": {"logis": bool, "alasan": str, "saran": str}, ...}`. Cubre los grupos Latar Belakang (I.M), Penerima Manfaat (I.N), Strategi Pencapaian Keluaran (I.O), Kurun Waktu (I.P), Biaya yang Diperlukan (I.Q) y Manajemen Risiko (I.R).

Su relevancia es acotada: no es un modelo de propósito general, sino una herramienta de nicho para automatizar la pre-revisión documental de TOR, con resultados reportados de F1 0,980 en el conjunto de test completo y 0,949 en TOR reales, siempre con revisión humana obligatoria. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507), ajuste LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | id (indonesio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con LoRA en precisión bf16 durante 3 épocas sobre 13.480 filas, tras lo cual el adaptador se fusionó en los pesos base (tag `lora-merged`). No se documentan detalles sobre la composición exacta del dataset, la proporción de ejemplos sintéticos frente a reales, ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica no está en la arquitectura sino en el diseño de la tarea: el modelo está condicionado a un system prompt por grupo de ítems (`sysprompts_kelompok.json`) y a un user prompt con formato fijo que incluye datos comparativos de RAB (presupuesto) para el ítem I.Q. La salida es JSON estructurado con tres campos por ítem (logis, alasan, saran), lo que facilita su integración en pipelines de revisión. El autor recomienda `temperature=0` y menciona que existe una API envoltorio en el paquete de serving del equipo que compone el prompt y aplica las reglas de RAB.

## Capacidades

- Evaluación binaria de lógica (campo `logis`) de ítems de checklist de revisión de TOR, agrupados por secciones I.M a I.R.
- Generación de justificación textual (`alasan`) y sugerencia de mejora (`saran`) por ítem evaluado.
- Salida en JSON estructurado con claves por código de ítem, apta para consumo programático.
- Comparación de la sección de costes del TOR con el total del RAB extraído (solo para el grupo I.Q).
- Detección de defectos documentales específicos: HAPUS_VOLUME, TUKAR_DOKUMEN, TANPA_TOTAL_BIAYA (con rendimiento desigual, ver limitaciones).
- Operación determinista con `temperature=0`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso general.

## Casos de uso

- Pre-revisión automatizada de TOR en auditoría interna: el modelo evalúa cada ítem del checklist y devuelve un JSON con lógica, justificación y sugerencia, que el revisor humano valida después. Adecuado porque la salida estructurada se integra directamente en un panel de revisión.
- Triaje de documentación entrante: procesar lotes de TOR y clasificar automáticamente qué ítems requieren revisión manual, reduciendo el volumen de lectura inicial del equipo auditor.
- Detección de inconsistencias presupuestarias: para el grupo I.Q, comparar la sección de costes del TOR con el total del RAB y marcar discrepancias antes de la aprobación.
- Control de calidad de plantillas: usar el modelo como verificador de que los TOR cumplen los apartados mínimos (Latar Belakang, Penerima Manfaat, Strategi, Kurun Waktu, Biaya, Manajemen Risiko).
- Integración en un servicio de revisión vía API: el envoltorio del equipo compone el prompt y aplica las reglas de RAB; el modelo actúa como motor de decisión por ítem con `temperature=0` para reproducibilidad.
- Generación de borradores de observaciones: el campo `saran` sirve como punto de partida para redactar comentarios de revisión, que el auditor edita y firma.
- Validación de TOR sintéticos en fase de pruebas: el modelo rinde casi perfecto en TOR sintéticos, útil para pruebas de regresión del pipeline, aunque el autor advierte que no debe usarse como referencia de calidad real.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 1.682 filas de test sin solapamiento con el entrenamiento:

| Subconjunto | Accuracy por ítem (F1) | Balanced accuracy por documento |
|---|---|---|
| Todos | 0,980 | 97,1% |
| TOR reales | 0,949 | 89,7% (LOLOS 25/31) |
| TOR sintéticos | ≈1,00 | ≈100% (el autor indica que es demasiado fácil y no debe tomarse como referencia) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, más overhead de contexto y KV cache; en la práctica, 10-12 GB en una GPU de 12 GB o superior.
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque el autor no publica versiones cuantizadas y habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100, H100 o L40S para serving concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual con margen amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB en bf16 con contexto moderado; en 8 bits cabría en 8 GB.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama si se generan cuantizaciones GGUF; el autor menciona un paquete de serving propio con envoltorio de prompt y reglas de RAB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B AITF Tim A | 4.022 M | no disponible | Checklist TOR (indonesio) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4.000 M | no disponible en esta ficha | Propósito general, multilingüe | apache-2.0 | Hugging Face, ampliamente usado |
| Qwen3-4B (versión original) | ~4.000 M | no disponible en esta ficha | Propósito general con modo thinking | apache-2.0 | Hugging Face |

La comparación con alternativas especializadas en revisión documental en indonesio no está disponible: no se conocen modelos públicos equivalentes para esta tarea concreta.

## Limitaciones y advertencias

- Nicho muy estrecho: solo está entrenado para evaluar ítems de checklist TOR en indonesio; su uso fuera de ese dominio no está validado.
- Recall bajo en ítems concretos sobre TOR reales: I.M.3 con 0,679; defecto HAPUS_VOLUME detectado en 1 de 8 casos; TUKAR_DOKUMEN en 8 de 12; TANPA_TOTAL_BIAYA en 1 de 3.
- Sesgo hacia la severidad: en TOR reales que sí pasaban la revisión (LOLOS), el modelo marcó 6 de 31 como REVISIÓN, generando falsos positivos.
- Los resultados en TOR sintéticos (≈100%) no son representativos; el propio autor advierte de que no deben usarse como referencia.
- Requiere revisión humana obligatoria; no sustituye al revisor.
- Dependencia del formato de prompt: el rendimiento depende de usar el system prompt por grupo y el formato de user prompt exactos, además de `temperature=0`.
- Idioma limitado al indonesio; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en las justificaciones (`alasan`) y sugerencias (`saran`): son texto generado y deben verificarse contra el documento original.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad, sin issues ni discusión pública.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre las decisiones derivadas del modelo recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwiiittt/qwen3-4b-aitf-tim-a
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
