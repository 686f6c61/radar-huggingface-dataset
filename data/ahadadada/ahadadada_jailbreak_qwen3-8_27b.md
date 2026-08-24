# ahadadada/Ahadadada_Jailbreak_Qwen3.8_27B

## Resumen

Ahadadada Jailbreak Qwen3.8-27B es un ajuste fino (finetune) de tipo *jailbreak* sobre el modelo multimodal denso Qwen3.8-27B de Alibaba, publicado por el usuario ahadadada en HuggingFace. El objetivo declarado es eliminar los rechazos y filtros de seguridad del modelo base, de modo que responda directamente a cualquier instrucción sin preámbulos tipo "como IA" ni avisos de seguridad. Mantiene las capacidades originales del modelo base, incluyendo visión, razonamiento, generación de código y soporte para agentes, pero con una política de respuesta sin restricciones.

El modelo base, Qwen3.8-27B, es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida (SSM + atención), contexto nativo de 262 000 tokens, soporte multimodal (imagen, vídeo) y predicción multi-token (MTP) para acelerar la inferencia. El finetune de ahadadada conserva estas características y añade cuantizaciones GGUF para su uso con llama.cpp y otros runtimes compatibles. La relevancia actual radica en la demanda de modelos "sin censura" para experimentación, aunque su uso conlleva riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM + atención (qwen35): 64 capas, 48 de atención lineal (Gated DeltaNet) y 16 de atención completa (Gated Attention) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible con YaRN |
| Tipos de cuantizacion | Q4_K_M (16 GB), Q5_K_M (19 GB), Q6_K (21 GB) — anunciados como "próximamente"; mmproj f16 (885 MB) disponible |
| Idiomas soportados | No disponible (no especificado en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (pesos completos, según el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo base Qwen3.8-27B: un transformer híbrido que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention). En concreto, se distribuyen 64 capas en un patrón de 16 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). La dimensión oculta es 5120, la dimensión FFN es 17408 y el vocabulario alcanza 248 320 tokens. El modelo incorpora predicción multi-token (MTP) con `n_max=3`, `n_min=0` y `n_embd=5120`, lo que permite generar varios tokens por paso y reducir la latencia.

El entrenamiento del finetune no está documentado en detalle: no se especifican los datos utilizados, el número de tokens de entrenamiento ni el método de alineación (RLHF, DPO, etc.). La model card solo indica que se trata de un *jailbreak finetune* que conserva las capacidades del base y elimina los rechazos. No se menciona ninguna innovación técnica adicional más allá de la herencia del modelo base y la inclusión de un proyector multimodal (`mmproj`) para el soporte de visión.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes, respuesta a preguntas visuales, razonamiento visual, OCR y captioning de imágenes (a través del `mmproj`).
- Soporte multimodal para texto, imagen y vídeo (vía `mmproj`).
- Predicción multi-token (MTP) para inferencia más rápida.
- Modo *thinking* activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Capacidades de agente y generación de código, según las características del modelo base (no detalladas específicamente en la ficha).
- Tool calling / function calling: no se menciona explícitamente, pero se infiere del modelo base; no confirmado en la información disponible.

## Casos de uso

- Atención al cliente automatizada: gracias a su contexto nativo de 262 000 tokens, puede gestionar conversaciones multi-turno con historiales largos y documentos extensos, respondiendo de forma directa sin plantillas de seguridad.
- Generación de código en producción: el modelo base destaca en tareas de programación y agentes; este finetune puede integrarse en pipelines de CI/CD para generar código sin restricciones de contenido, aunque con supervisión humana obligatoria.
- Análisis de documentos con OCR: la capacidad de visión permite extraer texto de imágenes, facturas o capturas, y procesar documentos completos en una sola pasada gracias al contexto largo.
- Asistentes personales sin filtros: para usuarios que prefieren respuestas directas sin avisos de seguridad, por ejemplo en entornos de investigación o simulación de diálogos.
- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin alineación de seguridad, analizar patrones de respuesta y evaluar riesgos de jailbreak en entornos controlados.
- Automatización de tareas de oficina: el modelo base está orientado a *office automation*; este finetune puede usarse para redactar correos, resumir reuniones o generar informes sin restricciones de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este finetune específico. El rendimiento se presume similar al del modelo base Qwen3.8-27B, pero no hay cifras confirmadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M (16 GB) se necesitan al menos 16 GB de VRAM, aunque para contexto largo (64K o más) se recomiendan 24 GB o más. La Q6_K (21 GB) requiere 24 GB de VRAM como mínimo.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 (40/80 GB) o H100 para contexto máximo y despliegue con MTP.
- Compatibilidad con GPU de consumo: sí, la Q4_K_M cabe en una RTX 3090/4090 o similar con 24 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio, Jan, koboldcpp, y cualquier runtime compatible con GGUF. También es posible usar safetensors con vLLM o TGI, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. El MTP debería reducir la latencia frente al modelo base, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ahadadada Jailbreak Qwen3.8-27B | 27B | 262K | Sí | Apache 2.0 | GGUF (próximamente) y safetensors |
| Qwen3.8-27B (base) | 27B | 262K | Sí | Apache 2.0 | Oficial, pesos completos |
| cooperleong00/Qwen3-8B-Jailbroken | 8B | No especificado | No | No especificada | GGUF, disponible |

La comparativa se limita a modelos de la misma familia o con propósito similar. El base Qwen3.8-27B es la referencia natural: mismo tamaño y arquitectura, pero con filtros de seguridad. El jailbreak de cooperleong00 es más pequeño (8B) y no multimodal, por lo que no es directamente comparable en capacidades.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un *jailbreak*, el modelo puede generar contenido dañino, ilegal, discriminatorio o no ético sin ningún tipo de filtro. No se han realizado evaluaciones de sesgo específicas.
- Riesgo de alucinación: elevado, especialmente en modos sin *thinking* y con parámetros de temperatura altos. La ausencia de filtros no corrige errores factuales.
- Limitaciones de contexto: aunque el contexto nativo es de 262K, la model card recomienda mantener al menos 64K para un funcionamiento óptimo con MTP. Contextos más cortos pueden degradar la calidad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el propósito de *jailbreak* puede violar los términos de uso de las plataformas de despliegue o las políticas de las empresas que lo utilicen.
- Caveat para producción: no es apto para entornos de producción sin supervisión humana y sin un análisis de riesgos legal y ético. Su uso en aplicaciones públicas puede acarrear responsabilidades legales.
- Idiomas: no se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahadadada/Ahadadada_Jailbreak_Qwen3.8_27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Artículo sobre riesgo de jailbreak en Qwen3.8: https://www.penligent.ai/hackinglabs/qwen3-8-jailbreak/
- Otro modelo jailbreak de referencia: https://huggingface.co/cooperleong00/Qwen3-8B-Jailbroken
