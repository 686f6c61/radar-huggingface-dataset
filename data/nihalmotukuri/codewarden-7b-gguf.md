# nihalmotukuri/codewarden-7b-gguf

## Resumen

CodeWarden-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct orientado a la auditoría de seguridad y arquitectura de pull requests (PR) en repositorios de código. Lo desarrolla nihalmotukuri y se distribuye como un artefacto GGUF cuantizado en Q4_K_M, pensado para ejecutarse de forma totalmente offline mediante Ollama. El modelo parte de la base instructiva de Qwen2.5-Coder de 7B parámetros (7.615.616.512 parámetros reales), por lo que hereda la arquitectura transformer decoder-only del modelo original.

El problema que aborda es la detección de vulnerabilidades y la clasificación de veredictos sobre cambios de código, forzando además una salida estructurada conforme a un esquema de auditoría. Según la model card, el ajuste con QLoRA de 4 bits (Unsloth) mejora de forma notable la adherencia al esquema y la clasificación de veredictos frente al modelo base, que no produce salidas válidas en ese formato. Es relevante para equipos que quieren integrar un revisor automático de seguridad en pipelines internos sin depender de servicios en la nube.

La distribución es un único GGUF Q4_K_M de aproximadamente 4,7 GB, licencia Apache 2.0 y orientación principal al inglés. El modelo está etiquetado como compatible con endpoints y conversacional, aunque la información disponible sobre su pipeline no está detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el resto de variantes GGUF no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del Qwen2.5-Coder-7B-Instruct, que es un transformer decoder-only denso de 7B parámetros. El ajuste se realizó con QLoRA de 4 bits usando la librería Unsloth, según declara la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovación destacable no está en la arquitectura, sino en el comportamiento inducido por el ajuste: el modelo aprende a emitir auditorías conforme a un esquema estructurado y a clasificar veredictos de seguridad sobre pull requests. El artefacto se entrega ya cuantizado en Q4_K_M, lo que lo hace desplegable en entornos con recursos limitados. No hay datos disponibles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia específicas.

## Capacidades

- Generación de texto y análisis de código orientado a seguridad y arquitectura de cambios (pull requests).
- Detección de vulnerabilidades en fragmentos de código y clasificación de veredictos de auditoría.
- Producción de salidas estructuradas conforme a un esquema de auditoría (adherencia del 86,7% según la model card).
- Capacidad conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución 100% offline mediante Ollama.
- Capacidades multilingües limitadas: idioma declarado en inglés.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Auditoría automática de pull requests: el modelo recibe el diff de un PR y emite una auditoría estructurada con veredicto de seguridad, aprovechando la adherencia al esquema medida en la model card (86,7%).
- Integración en pipelines de CI/CD: al ser un GGUF Q4_K_M de 4,7 GB ejecutable con Ollama, puede desplegarse en runners internos para revisar cambios antes del merge sin enviar código a servicios externos.
- Revisión de seguridad en entornos air-gapped: el carácter 100% offline permite auditar código confidencial en máquinas sin acceso a internet.
- Triaje de hallazgos de seguridad: clasificación de veredictos sobre fragmentos sospechosos para priorizar la revisión humana posterior.
- Asistencia a revisores humanos: generación de borradores de informes de auditoría con formato consistente, reduciendo el tiempo de redacción manual.
- Detección de patrones de vulnerabilidad en código heredado: análisis por lotes de repositorios antiguos para localizar candidatos a revisión.
- Formación interna de equipos: uso como revisor de ejemplo en talleres de secure code review, con respuestas reproducibles en local.

## Benchmarks y rendimiento

Resultados de hold-out publicados en la model card (evaluados en una RTX 5070 Ti de 12 GB):

| Metrica | Base (Qwen2.5-Coder-7B) | CodeWarden-7B |
|---|---|---|
| Audit schema adherence | 0,0% | 86,7% |
| Verdict classification | 0,0% | 86,7% |
| Latencia media por auditoría | 4,51 s | 2,69 s (-40,4%) |
| Throughput | 84,3 tok/s | 68,7 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este ajuste.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa aproximadamente 4,7 GB en disco; la inferencia requiere en torno a 5-6 GB de VRAM considerando overhead de contexto y caché KV (estimación orientativa, no publicada por el autor).
- GPU recomendadas: RTX 5070 Ti 12 GB (plataforma usada en la evaluación del autor); cualquier GPU con 8 GB o más de VRAM debería poder alojar la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores con la cuantización Q4_K_M.
- Opciones de despliegue: Ollama (documentado en la model card mediante `Modelfile`), llama.cpp y otros runners compatibles con GGUF. vLLM y TGI no están confirmados para este artefacto en la informacion disponible.
- Latencia y throughput: 2,69 s de media por auditoría y 68,7 tok/s medidos en RTX 5070 Ti 12 GB según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| CodeWarden-7B (este modelo) | 7,6B | no disponible | Auditoría de seguridad de PR | Apache 2.0 | GGUF Q4_K_M |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | no disponible en la informacion proporcionada | Generación y asistencia de código general | Apache 2.0 | safetensors y GGUF |
| Alternativas de auditoría de seguridad de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa de rendimiento solo está disponible frente al modelo base: CodeWarden mejora la adherencia al esquema y la clasificación de veredictos (de 0,0% a 86,7%) y reduce la latencia por auditoría un 40,4%, a costa de menor throughput (68,7 frente a 84,3 tok/s).

## Limitaciones y advertencias

- El modelo está entrenado y orientado al inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La adherencia al esquema y la clasificación de veredictos se sitúan en el 86,7%: aproximadamente uno de cada siete casos puede no seguir el formato esperado o clasificar incorrectamente, por lo que requiere validación humana.
- Riesgo de alucinación inherente a los modelos de 7B ajustados sobre código: puede reportar vulnerabilidades inexistentes o pasar por alto problemas reales.
- Los benchmarks publicados son de hold-out propio del autor y no de suites estándar, lo que limita la comparabilidad con otros modelos.
- Solo se distribuye la cuantización Q4_K_M; la degradación respecto a pesos completos no está cuantificada en la información disponible.
- El modelo no sustituye una auditoría de seguridad profesional; debe usarse como herramienta de triaje y apoyo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta: es un artefacto poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nihalmotukuri/codewarden-7b-gguf
- GitHub del proyecto: https://github.com/nihalmotukuri/CodeWarden
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com
