# Bioaligned/Qwen3.6-27B-Curiosity

## Resumen

Qwen3.6-27B-Curiosity es un ajuste por preentrenamiento continuado (continued pretraining, CPT) del modelo denso multimodal Qwen/Qwen3.6-27B, publicado por el colectivo Bioaligned bajo licencia Apache 2.0. El modelo se distribuye como pesos fusionados (bf16, sin recuantizar) de un adaptador LoRA denominado `Bioaligned/Qwen3.6-27B-Curiosity-qlora`, entrenado exclusivamente sobre un estrato de corpus orientado a "curiosidad" dentro del proyecto de investigación LS_curiosity_training. No se trata de un modelo afinado con RLHF ni DPO: es un artefacto de investigación cuyo propósito es explorar el efecto del CPT sobre un corpus temático concreto.

El modelo base, Qwen3.6-27B, es un transformer denso de 27 000 millones de parámetros con capacidades multimodales (visión-lenguaje), orientado a código agéntico, razonamiento STEM, OCR de documentos e interacción con GUI. Según la información disponible, el modelo base emplea una arquitectura híbrida SSM (etiqueta `hybrid-ssm` en el repositorio) y soporta modos de pensamiento (thinking) y no-pensamiento. El checkpoint aquí descrito conserva esa base y añade el efecto del CPT temático.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de CPT temático sobre un modelo denso de 27B; por otro, advierte de que el autor no publica en la model card resultados de evaluación ni afirmaciones de comportamiento, remitiendo al write-up del proyecto. Cualquier uso en producción debe partir de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con etiqueta `hybrid-ssm` (según tags del repo); clase `qwen3_5_text` en transformers |
| Parametros totales | 26 895 998 464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Pesos publicados en bf16 sin recuantizar; el adaptador original es qlora; no se documentan otros formatos |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.6-27B |
| Metodo de ajuste | Continued pretraining (CPT) sobre LoRA fusionado; sin RLHF ni DPO |
| Tamano del repositorio | 53,8 GB |

## Arquitectura y entrenamiento

El checkpoint es el resultado de fusionar el adaptador LoRA `Bioaligned/Qwen3.6-27B-Curiosity-qlora` sobre los pesos de Qwen/Qwen3.6-27B en bf16, sin recuantización posterior. La arquitectura subyacente es la del modelo base: un transformer denso de ~26,9B parámetros con capacidades multimodales, etiquetado en el repositorio como `hybrid-ssm` y con clase de texto `qwen3_5_text`. No se dispone de detalles adicionales sobre la composición exacta de capas, número de cabezas o mecanismo de atención en la información proporcionada.

El entrenamiento consistió únicamente en preentrenamiento continuado sobre un "curiosity stratum" (estrato de curiosidad) del corpus del proyecto LS_curiosity_training. No se aplicó RLHF, DPO ni ninguna otra fase de alineación posterior. El autor no documenta en la model card el número de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas ni hiperparámetros del CPT. Tampoco se describe ninguna innovación técnica adicional más allá del propio procedimiento de CPT temático y la fusión del adaptador.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Qwen3.6-27B.
- Razonamiento y matemáticas (STEM), según las capacidades declaradas del modelo base.
- Generación de código y comportamiento agéntico de coding, capacidad destacada del modelo base.
- Capacidades multimodales: visión-lenguaje, OCR de documentos, comprensión de vídeo y de contexto largo visual, interacción con GUI (heredadas del base).
- Modo de pensamiento (thinking) y modo no-thinking; el autor recomienda evaluar con `enable_thinking=False`.
- Tool calling / function calling: no documentado explícitamente para este checkpoint; el modelo base lo soporta según la documentación de Qwen, pero no se confirma para el ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada para este checkpoint.
- Capacidades especiales del ajuste: el CPT sobre corpus de "curiosity" busca modificar el comportamiento exploratorio/inquisitivo del modelo, pero el autor no formula ninguna afirmación conductual al respecto.

## Casos de uso

- Investigación sobre CPT temático: utilizar el checkpoint como brazo experimental para estudiar cómo el preentrenamiento continuado sobre un corpus de "curiosidad" altera el comportamiento del modelo base frente a la versión sin ajustar. Es adecuado porque el autor lo define explícitamente como artefacto de investigación del proyecto LS_curiosity_training.
- Evaluación comparativa de alineación conductual: comparar respuestas del checkpoint frente a Qwen3.6-27B original en baterías de preguntas abiertas, para medir deriva conductual atribuible al CPT. El modelo base idéntico y la licencia permisiva facilitan el A/B controlado.
- Generación de código asistida en pipelines internos: al conservar la base Qwen3.6-27B, puede emplearse en tareas de completado y refactorización de código en entornos donde ya se use el modelo original, siempre que una evaluación propia confirme que el CPT no degrada la calidad.
- Procesamiento de documentos con OCR y visión: herencia de las capacidades multimodales del base para extracción de texto en facturas, informes o formularios escaneados, con validación previa de que el ajuste no ha mermado la fidelidad de transcripción.
- Automatización de interacción con GUI: dado el soporte del base para agentes visuales, el checkpoint puede integrarse en flujos de automatización de escritorio o navegador, sujeto a evaluación específica de la tasa de éxito.
- Base para nuevos ajustes supervisados: al ser un checkpoint CPT con licencia Apache 2.0, puede servir como punto de partida para SFT o DPO posteriores en dominios concretos, aprovechando que ya incorpora el sesgo temático de curiosidad.
- Experimentación académica con modelos densos de 27B: útil en laboratorios que necesiten un modelo de ese tamaño con licencia permisiva y pesos abiertos para estudiar dinámicas de CPT, sin depender de modelos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card que los resultados de evaluación se reportan en el write-up del proyecto LS_curiosity_training y no en la ficha del modelo, y que no se formula ninguna afirmación de comportamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (26,9B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se requieren 2× A100 80GB, 2× H100 80GB o una H200 141GB para contexto largo.
- Cuantización a 8 bits: ~27 GB de pesos; cabe en una A100 40GB o RTX 6000 Ada 48GB con margen limitado.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): ~14-16 GB de pesos; viable en RTX 4090 24GB, RTX 3090 24GB o L40S 48GB, con contexto reducido.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo; en 4 bits sí es viable en RTX 4090/3090 con contexto moderado.
- Opciones de despliegue: transformers (soporte nativo declarado, con `dtype="auto"` y `device_map="auto"`); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint en la información disponible, aunque al ser safetensors estándar deberían poder convertirse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Bioaligned/Qwen3.6-27B-Curiosity | ~26,9B denso | No disponible | Sí (heredado del base) | Apache 2.0 | CPT temático, sin benchmarks publicados |
| Qwen/Qwen3.6-27B | ~27B denso | No disponible | Sí | Apache 2.0 (según repo base) | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen3.6-35B-A3B | 35B totales (MoE) | No disponible | Sí | No disponible | Alternativa MoE de la misma familia, mencionada en el blog de Qwen |
| Qwen3.6-Plus | No disponible | No disponible | Sí | No disponible (propietario) | Versión cerrada de la familia, solo vía API |

La comparación directa con el modelo base es la más relevante: el checkpoint Curiosity comparte arquitectura y pesos de partida con Qwen3.6-27B, por lo que las diferencias observables se atribuyen al CPT. Frente a la variante MoE Qwen3.6-35B-A3B, el modelo denso ofrece un perfil de inferencia distinto (más parámetros activos por token, sin enrutamiento). No se dispone de datos de rendimiento comparado para cuantificar estas diferencias.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados en la model card: no hay evidencia de que el CPT mejore o degrade las capacidades del base; se requiere evaluación propia antes de cualquier uso.
- El autor no formula ninguna afirmación de comportamiento: el nombre "Curiosity" no garantiza un comportamiento más inquisitivo ni medible.
- Riesgo de olvido catastrófico (catastrophic forgetting) inherente al CPT: el ajuste sobre un corpus temático puede degradar capacidades del base no representadas en ese corpus, especialmente en código, matemáticas o multimodalidad.
- Sesgos: no documentados; al heredar el base y añadir un corpus temático no descrito, los sesgos del base pueden amplificarse o desplazarse de forma no controlada.
- Alucinación: sin fase de RLHF/DPO, el modelo no ha sido alineado para reducir alucinaciones; el riesgo es el del base o superior.
- Idiomas: no se especifica qué idiomas cubre el corpus de CPT; el multilingüismo del base puede haberse visto afectado de forma desigual.
- Contexto: la longitud de contexto efectiva tras el CPT no está documentada; no se debe asumir la del base sin verificación.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el usuario asume toda la responsabilidad sobre el comportamiento del checkpoint, dado que el autor declina afirmaciones de rendimiento.
- Modo thinking: el autor recomienda evaluar con `enable_thinking=False`; con thinking activado el modelo abre un bloque `<think>`, lo que puede complicar pipelines que no lo esperen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bioaligned/Qwen3.6-27B-Curiosity
- Adaptador LoRA original: https://huggingface.co/Bioaligned/Qwen3.6-27B-Curiosity-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.6-27b
- Documentación de Alibaba Cloud Model Studio: https://www.alibabacloud.com/help/en/model-studio/qwen3-6-27b
