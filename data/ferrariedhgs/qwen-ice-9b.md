# ferrariedhgs/Qwen-ICE-9B

## Resumen

ICE (Inspect Combat Evaluate) es un ajuste fino de Qwen3.5-9B orientado a ciberseguridad defensiva, análisis de vulnerabilidades y triaje de seguridad. Lo publica el usuario `ferrariedhgs` en Hugging Face bajo licencia Apache 2.0, y se distribuye exclusivamente como GGUF cuantizado en Q4_K_M para su uso con llama.cpp. El modelo parte del checkpoint base `unsloth/Qwen3.5-9B` (9.197.093.888 parámetros) y se ha entrenado con SFT supervisado mediante LoRA sobre una mezcla de cuatro datasets de ciberseguridad.

El objetivo declarado es asistir a ingenieros de seguridad en la revisión de código en busca de vulnerabilidades, la propuesta de parches mínimos, el resumen de registros CVE y el triaje defensivo. Se trata de un modelo de 9B parámetros con una ventana de entrenamiento de 4.096 tokens, lo que lo sitúa en la categoría de modelos pequeños/medianos desplegables en hardware de consumo o en una sola GPU profesional.

Su relevancia radica en la especialización vertical: frente a un modelo generalista del mismo tamaño, ICE ha sido expuesto a 205.241 filas de entrenamiento procedentes de corpus de vulnerabilidades del kernel de Linux, dossieres CVE y datos de seguridad DPO. No obstante, el propio autor advierte que no debe usarse como única base para respuesta a incidentes ni divulgación de vulnerabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (text generation), ajuste fino con LoRA |
| Parametros totales | 9.197.093.888 (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens usados en entrenamiento; longitud nativa del base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado en el repo) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (con avisos de terceros en THIRD_PARTY_NOTICES.md) |
| Formato de pesos | GGUF (llama.cpp); entrenamiento en BF16 + LoRA, export merged Q4_K_M |
| Modelo base | unsloth/Qwen3.5-9B |
| Tamano del repo | 5,8 GB |
| Entorno de entrenamiento | Modal, NVIDIA RTX PRO 6000 96 GB |
| Framework | Unsloth + TRL |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ICE hereda la arquitectura transformer de Qwen3.5-9B en su variante de generación de texto. El ajuste fino se realizó en BF16 con LoRA de rango 16, alpha 32 y dropout 0.0, aplicado sobre capas de lenguaje (módulos de atención y MLP seleccionados); las capas de visión del modelo base no se entrenaron. Se usó 8-bit AdamW, scheduler coseno con 3% de warmup, learning rate 2e-5, una sola época, longitud de secuencia de 4.096 tokens con sequence packing y semilla 3407. El entrenamiento duró aproximadamente 10 horas y la pérdida final registrada pasó de 1,4133 a 0,5256 (métrica de entrenamiento, no de evaluación de seguridad).

Los datos de entrenamiento son una mezcla preparada de cuatro fuentes: `oyildirim/cyberstrike-sft-120k` (Apache 2.0), `quguanni/kernel-vuln-dataset` (MIT), `mjbommar/linux-cve-dossiers` (CC-BY-4.0) y `CyberNative/Code_Vulnerability_Security_DPO` (Apache 2.0). La mezcla se dividió en 205.241 filas de entrenamiento y 4.115 de validación, con una época sobre el split de entrenamiento. El autor advierte que las licencias declaradas por las fuentes no establecen una licencia única y global para todos los elementos reflejados en los pesos aprendidos. No se documenta una fase de RLHF o DPO posterior al SFT (el dataset DPO se usa como datos de SFT, no como etapa de preferencias).

## Capacidades

- Generación de texto y razonamiento técnico en el dominio de ciberseguridad.
- Revisión de código para identificar vulnerabilidades probables y sugerir remediaciones mínimas.
- Resumen y síntesis de registros de vulnerabilidad y metadatos de seguridad (CVE, dossieres).
- Triaje defensivo y apoyo al desarrollo seguro de software.
- Explicación de incertidumbre y límites de evidencia al analizar afirmaciones sobre vulnerabilidades.
- Generación de ejemplos de código que ilustran fallos de seguridad (uso dual).
- Soporte de conversación multi-turno (tag `conversational`).
- Compatible con endpoints (`endpoints_compatible`).
- Integración con agentes: el repo incluye un `SKILL.md` para que un harness de agente escanee ficheros de proyecto.
- Capacidades de visión: presentes en el base pero no ajustadas; su comportamiento tras el fine-tuning no está documentado.
- Tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Revisión de código en pre-commit: usar ICE con llama.cpp para que un agente escanee los ficheros modificados antes de fusionar y señale posibles vulnerabilidades con parches mínimos sugeridos; adecuado por su especialización en análisis de código y su formato GGUF desplegable localmente.
- Triaje de CVE: resumir dossieres CVE y metadatos de seguridad para priorizar parcheo; el modelo se ha entrenado con `mjbommar/linux-cve-dossiers`, por lo que reconoce la estructura de estos registros.
- Auditoría de código del kernel de Linux: analizar parches y fragmentos de código del kernel en busca de patrones de vulnerabilidad, aprovechando el dataset `quguanni/kernel-vuln-dataset`.
- Formación y concienciación en desarrollo seguro: generar ejemplos didácticos de código vulnerable y su corrección, con la cautela de revisar manualmente el contenido generado por su naturaleza de uso dual.
- Asistente local de seguridad en estaciones de trabajo: desplegar con `llama-server` sobre el GGUF Q4_K_M (5,8 GB) en una GPU de consumo para consultas sobre prácticas seguras sin enviar código a servicios externos.
- Automatización de informes de vulnerabilidad: redactar borradores de resúmenes y recomendaciones a partir de notas de análisis, siempre con verificación humana contra avisos primarios.
- Integración en pipelines de CI/CD: invocar el modelo vía API compatible con endpoints para clasificar hallazgos de análisis estático y proponer remediaciones, con revisión independiente de los parches antes de desplegar.

## Benchmarks y rendimiento

El autor menciona una evaluación con 16 prompts que cubren diversos puntos de fallo y lenguajes de programación, y afirma que el modelo ajustado resolvió las tareas de forma similar al base pero con mejores sugerencias de parches y ejemplos funcionales de explotación. No se publican puntuaciones numéricas (MMLU, HumanEval, GSM8K u otras) en la información disponible.

No se han publicado resultados de benchmarks cuantitativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 5,8 GB; se recomienda al menos 8 GB de VRAM para cargar el modelo con contexto moderado.
- GPU recomendadas: NVIDIA RTX PRO 6000 96 GB fue el hardware de entrenamiento; para inferencia basta una RTX 4090, RTX 3090, RTX 4070 Ti o similar con 12-24 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), dado el tamaño Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio) si acepta el fichero; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Contexto efectivo: limitado a 4.096 tokens en entrenamiento, lo que restringe el análisis de codebases grandes o informes largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| ICE (Qwen-ICE-9B) | 9B | 4.096 (entrenamiento) | Ciberseguridad defensiva | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-9B (base) | 9B | no disponible | Generalista | Apache 2.0 | safetensors, GGUF |
| Alternativas especializadas en seguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especializados en ciberseguridad de este tamano en la información proporcionada; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Puede producir análisis de seguridad incorrectos, incompletos o desactualizados, y alucinar CVE, versiones afectadas, parches o evidencia.
- El entrenamiento incluye ejemplos de ciberseguridad de uso dual; el modelo puede generar contenido inseguro o inapropiado.
- No debe usarse como única base para respuesta a incidentes, divulgación de vulnerabilidades, decisiones de control de acceso o cambios en producción.
- No debe recibir secretos, datos personales ni artefactos sensibles de incidentes salvo que el despliegue y el tratamiento de datos estén aprobados para ello.
- La ventana de entrenamiento de 4.096 tokens y la distribución de entrenamiento limitan el análisis de codebases grandes o informes extensos.
- El GGUF cuantizado puede diferir ligeramente del checkpoint BF16 ajustado.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia Apache 2.0 solo cubre los derechos que el autor puede licenciar; los materiales de terceros conservan sus propios términos (ver THIRD_PARTY_NOTICES.md).
- Las licencias de las fuentes de datos no establecen una licencia única y global para todos los elementos reflejados en los pesos.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferrariedhgs/Qwen-ICE-9B
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Dataset CyberStrike SFT: https://huggingface.co/datasets/oyildirim/cyberstrike-sft-120k
- Dataset Kernel Vulnerability: https://huggingface.co/datasets/quguanni/kernel-vuln-dataset
- Dataset Linux CVE Dossiers: https://huggingface.co/datasets/mjbommar/linux-cve-dossiers
- Dataset Code Vulnerability Security DPO: https://huggingface.co/datasets/CyberNative/Code_Vulnerability_Security_DPO
