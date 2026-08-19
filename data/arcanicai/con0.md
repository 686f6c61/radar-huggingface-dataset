# arcanicai/Con0

## Resumen

Con0 es un modelo de visión-lenguaje (VLM) especializado en la auditoría de ciberseguridad de agentes de IA, desarrollado conjuntamente por Arcanic AI y NextZero. Se trata de un finetune de identidad basado en el modelo Qwen/Qwen3.8-27B, que hereda las capacidades multimodales del modelo original (comprensión de imagen, vídeo y OCR) y las orienta hacia la evaluación de seguridad de sistemas autónomos. Su arquitectura nativa `Qwen3_5ForConditionalGeneration` combina atención completa con capas Gated DeltaNet, alcanzando 27.356 millones de parámetros y una ventana de contexto de 262.144 tokens.

La relevancia de Con0 reside en su doble naturaleza: por un lado, es un modelo de propósito general con razonamiento flexible y tool calling; por otro, su ajuste específico lo convierte en una herramienta pensada para auditar agentes de IA, un área crítica a medida que los sistemas autónomos se despliegan en entornos productivos. El modelo se distribuye bajo licencia Apache 2.0 y soporta inglés, vietnamita y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrido Gated DeltaNet + atención completa) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (repo en BF16; no se documentan cuantizaciones) |
| Idiomas soportados | en, vi, zh (inglés, vietnamita, chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Con0 es un finetune LoRA del modelo base Qwen/Qwen3.8-27B, fusionado posteriormente en un único conjunto de pesos en BF16. El entrenamiento se centró en introducir la identidad "Con0" y su enfoque de auditoría de ciberseguridad, manteniendo la torre de visión congelada para preservar las capacidades multimodales originales. La arquitectura subyacente es un transformer multimodal con una combinación de atención completa y capas Gated DeltaNet, lo que permite manejar secuencias largas (hasta 262K tokens) con un coste computacional reducido en comparación con la atención estándar.

No se ha publicado información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El finetune parece haber sido puramente supervisado sobre datos de identidad y tareas de seguridad, sin alterar las capacidades generales del modelo base.

## Capacidades

- Comprensión de visión-lenguaje: procesa imágenes, vídeo y realiza OCR, lo que permite analizar capturas de pantalla, documentos escaneados y secuencias de vídeo.
- Razonamiento con control de pensamiento flexible: puede operar en modo de razonamiento explícito o directo, según la tarea.
- Tool calling / function calling: capaz de invocar herramientas externas, esencial para integrarse en flujos de trabajo de agentes.
- Auditoría de ciberseguridad de agentes de IA: especialidad principal, orientada a identificar vulnerabilidades, comportamientos anómalos o fallos de seguridad en sistemas autónomos.
- Multilingüe: soporta inglés, vietnamita y chino, aunque no cubre otros idiomas como el español.

## Casos de uso

- Auditoría de seguridad de agentes autónomos: Con0 puede analizar el comportamiento de un agente de IA en ejecución, revisando sus decisiones, acciones y respuestas para detectar desviaciones de políticas de seguridad o intentos de manipulación.
- Análisis forense de sesiones de agentes: gracias a su capacidad de procesar vídeo e imágenes, puede revisar grabaciones de sesiones de agentes para reconstruir incidentes de seguridad y determinar la causa raíz.
- Revisión de código y configuraciones de agentes: aunque no se documenta explícitamente, hereda del modelo base Qwen3.8-27B la capacidad de entender y generar código, lo que permite inspeccionar scripts de agentes en busca de vulnerabilidades.
- Detección de inyección de prompts y jailbreak: puede analizar conversaciones entre usuarios y agentes para identificar intentos de manipulación o explotación de vulnerabilidades de prompt.
- Generación de informes de cumplimiento: tras una auditoría, Con0 puede redactar informes técnicos detallados sobre hallazgos de seguridad, recomendaciones y medidas correctivas.
- Monitorización en tiempo real de agentes en producción: integrado en un pipeline de observabilidad, puede analizar logs y salidas de agentes para alertar sobre comportamientos sospechosos.
- Evaluación de seguridad de modelos de visión-lenguaje: al ser un VLM, puede auditar otros sistemas multimodales, comprobando si presentan sesgos o fallos en el procesamiento de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para Con0. Al ser un finetune de identidad, se espera que su rendimiento en tareas generales sea similar al del modelo base Qwen3.8-27B, pero no se dispone de mediciones específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 54,7 GB (27,36B × 2 bytes). Para cargar el modelo completo se necesitan al menos 56 GB de VRAM.
- Con cuantización (si se generan versiones GGUF o AWQ), el modelo podría caber en GPUs de consumo: 8-bit ≈ 27 GB, 4-bit ≈ 13,5 GB, pero no se han publicado oficialmente dichas versiones.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o múltiples RTX 4090 (24 GB cada una; se necesitarían 3 en paralelo para BF16).
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, y potencialmente llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible. Dependerá del hardware y del modo de razonamiento (con o sin thinking).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Enfoque |
|---|---|---|---|---|---|
| Con0 (arcanicai) | 27,36B | 262K | Sí | Apache 2.0 | Auditoría de seguridad de agentes |
| Qwen3.8-27B (base) | 27,36B | 262K | Sí | Apache 2.0 | Propósito general multimodal |
| Qwen2.5-VL-27B | 27B | 128K | Sí | Apache 2.0 | Propósito general multimodal |

Con0 se diferencia de su modelo base únicamente por el ajuste de identidad y enfoque en ciberseguridad; las capacidades técnicas son idénticas. No se dispone de comparativas con otros modelos especializados en auditoría de agentes, ya que no hay referencias públicas.

## Limitaciones y advertencias

- Sesgos: al ser un finetune de Qwen3.8-27B, puede heredar sesgos presentes en el modelo base, especialmente en tareas relacionadas con contenido cultural o político.
- Riesgo de alucinación: como cualquier LLM, Con0 puede generar información falsa o no verificada, especialmente en dominios técnicos complejos. Las auditorías de seguridad deben ser siempre validadas por expertos humanos.
- Limitaciones de idioma: solo soporta inglés, vietnamita y chino. No está entrenado para español ni otros idiomas, lo que limita su uso en entornos hispanohablantes.
- Datos de entrenamiento no documentados: no se ha publicado información sobre el dataset de finetune, por lo que la robustez de sus capacidades de auditoría no está respaldada por evaluaciones independientes.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero es responsabilidad del usuario asegurar que los usos en ciberseguridad cumplan con las normativas locales.
- Requisitos de hardware elevados: con 27B parámetros en BF16, no es viable en GPUs de consumo sin cuantización, lo que puede limitar su adopción en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arcanicai/Con0
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización Arcanic AI en HuggingFace: https://huggingface.co/arcanicai
- Blog de Arcanic AI sobre Cono 1.5 (modelo anterior, no Con0): https://arcanic.ai/cono-1-5/
- Página principal de Arcanic AI: https://arcanic.ai/
