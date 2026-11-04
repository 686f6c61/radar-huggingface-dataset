# Austriani/LFM3-1.7B-ARA-Abliterated

## Resumen

LFM3-1.7B-ARA-Abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario independiente Austriani. El modelo base pertenece a la familia LFM3 de Liquid AI, una arquitectura híbrida que combina atención con capas convolucionales y está diseñada para despliegue en el borde (edge deployment). La modificación aplicada, denominada ARA (Arbitrary-Rank Ablation), elimina las direcciones de activación asociadas a comportamientos de rechazo sin reentrenar los pesos, preservando supuestamente la distribución original con una divergencia KL de 0,0374 respecto al modelo base.

El modelo conserva los 1.728.801.536 parámetros del original y se distribuye en formato safetensors a través de la librería transformers, con un tamaño de repositorio de 3,5 GB. Su propósito es ofrecer una versión sin censura orientada a chat, roleplay, escritura creativa y uso como agente, manteniendo las capacidades del modelo original.

Es relevante porque ejemplifica la técnica de abliteración aplicada a modelos pequeños de arquitectura híbrida, un enfoque poco común en modelos de menos de 2B parámetros, y porque permite evaluar hasta qué punto la eliminación de rechazos afecta a la coherencia general en un modelo de contexto largo pensado para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas convolucionales (hybrid-attention, convolutional) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-1.7B de Liquid AI, descrita en las etiquetas como transformer híbrido con atención y componentes convolucionales, optimizado para despliegue en el borde y contexto largo. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

La modificación respecto al base consiste en una abliteración mediante ARA (Arbitrary-Rank Ablation), una técnica que identifica y elimina las direcciones de activación responsables de los comportamientos de rechazo. La model card reporta una divergencia KL de 0,0374 frente al modelo base y una tasa de 5 rechazos sobre 100 en la evaluación del autor. No se especifican los detalles del conjunto de evaluación, el procedimiento exacto de selección de rangos ni si se utilizó la herramienta heretic mencionada en las etiquetas. Tampoco se documenta ninguna innovación adicional más allá de la propia abliteración.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat e instrucciones.
- Escritura creativa y roleplay, sin los filtros de rechazo del modelo original.
- Uso como agente y razonamiento multi-paso según las etiquetas del autor (agent, multi-step).
- Capacidad de seguir instrucciones (instruct) en formato conversacional.
- Soporte de contexto largo según la etiqueta long-context, aunque no se especifica la longitud exacta.
- Capacidades multilingües limitadas al inglés según el campo language de la model card.
- No se documenta soporte de tool calling, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se confirma soporte de function calling en la información disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado para conversación y escritura creativa sin restricciones de contenido, lo que permite mantener personajes y tramas multi-turno en inglés.
- Generación de ficción y guiones: adecuado para producir borradores de diálogos y escenas donde los filtros de rechazo del modelo base interrumpirían la generación.
- Prototipado de agentes conversacionales: las etiquetas agent e instruct sugieren uso en pipelines de agentes simples, aunque sin tool calling documentado habría que implementar el enrutamiento externo.
- Despliegue en el borde: con 1,73B parámetros y arquitectura optimizada para edge deployment, puede ejecutarse en dispositivos con recursos limitados para asistentes locales.
- Investigación sobre abliteración: sirve como caso de estudio para medir el impacto de ARA en la coherencia (KLD 0,0374) y en la tasa de rechazos (5/100) frente al modelo base.
- Chat de propósito general en inglés: puede emplearse como asistente conversacional local en entornos donde no se requiere cumplimiento estricto de políticas de contenido.
- Evaluación comparativa de seguridad: útil para estudiar diferencias de comportamiento entre un modelo alineado y su variante ablacionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta métricas propias del proceso de abliteración:

| Metrica | Valor | Nota |
|---|---|---|
| Divergencia KL vs. base | 0,0374 | Menor es mejor |
| Tasa de rechazos | 5/100 | Conjunto de evaluación no especificado |

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos, aunque no se distribuyen pesos GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en fp16 y en tarjetas con 4 GB si se cuantiza.
- Opciones de despliegue: transformers (formato nativo del repo); vLLM, llama.cpp, Ollama y TGI no están confirmados porque no se publican pesos GGUF ni se documenta compatibilidad. El uso de custom_code en el repo implica cargar código remoto con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Austriani/LFM3-1.7B-ARA-Abliterated | 1,73B | No disponible | LFM1.0 | Variante abliterada, solo inglés, safetensors |
| LiquidAI/LFM3-1.7B | 1,73B | No disponible | LFM1.0 | Modelo base alineado, referencia de KLD y rechazos |
| Otros modelos abliterados de ~1-2B | No disponible | No disponible | Variable | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros; no es apto para producción sin moderación externa.
- Riesgo de alucinación inherente a un modelo de 1,73B parámetros, agravado por la falta de benchmarks publicados.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no especificada; la etiqueta long-context no aporta una cifra verificable.
- Licencia LFM Open License v1.0: es necesario revisar el archivo LICENSE del repositorio para confirmar las restricciones de uso comercial, ya que la model card la etiqueta como "other".
- El repositorio incluye custom_code, lo que obliga a ejecutar código remoto con `trust_remote_code=True`; conviene auditar dicho código antes de usarlo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- La evaluación de rechazos (5/100) y la KLD (0,0374) provienen del propio autor y no han sido verificadas de forma independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
