# deepseek-ai/DeepSeek-V2-Chat-0628

## Resumen

DeepSeek-V2-Chat-0628 es un modelo de lenguaje conversacional desarrollado por DeepSeek AI, publicado el 18 de julio de 2024. Es una versión mejorada de DeepSeek-V2-Chat, la variante afinada para diálogo del modelo DeepSeek-V2. Se trata de un transformer decoder-only con mezcla de expertos (MoE, arquitectura DeepSeekMoE) y Multi-head Latent Attention (MLA), según se documenta en el paper arXiv:2405.04434. Los pesos safetensors suman 235.741.434.880 parámetros (~236.000 millones) y el repositorio ocupa 471,5 GB.

La relevancia de esta revisión radica en la mejora sustancial en instrucciones y razonamiento respecto a la versión anterior. En el momento de su publicación alcanzó el puesto 11 de la clasificación general de LMSYS Chatbot Arena (el mejor modelo de código abierto de entonces), el puesto 3 en Coding Arena y el puesto 3 en Hard Prompts Arena. Frente a DeepSeek-V2-Chat mejora en HumanEval, MATH, BBH, IFEval y Arena-Hard, y optimiza el seguimiento de instrucciones en el área de sistema, lo que beneficia tareas de traducción inmersiva y RAG.

El modelo está pensado para despliegues de altas prestaciones: el propio autor indica que la inferencia en BF16 requiere 8 GPU de 80 GB. Los pesos se distribuyen en safetensors y es compatible con transformers y con text-generation-inference. La licencia es "deepseek" (Model Agreement), distinta de la licencia MIT que cubre el código del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con DeepSeekMoE y Multi-head Latent Attention (MLA), según la arquitectura DeepSeek-V2 (paper arXiv:2405.04434) |
| Parametros totales | 235.741.434.880 (~236B) |
| Parametros activos | Aproximadamente 21B por token, según la arquitectura DeepSeekMoE del paper DeepSeek-V2 |
| Longitud de contexto | Hasta 128K tokens, según la arquitectura DeepSeek-V2 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | deepseek (license:other, license_name: deepseek; Model Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V2-Chat-0628 sigue la arquitectura DeepSeek-V2, un transformer decoder-only basado en mezcla de expertos (DeepSeekMoE) que activa únicamente una fracción de los parámetros por token (alrededor de 21B de los ~236B totales) y utiliza Multi-head Latent Attention (MLA), un mecanismo de atención que comprime las claves y valores en un espacio latente de baja dimensión para reducir el coste de la caché KV durante la inferencia. Esta combinación permite un modelo de gran capacidad total manteniendo un coste de cómputo por token comparable al de modelos mucho más pequeños. La información disponible no detalla el número exacto de tokens de entrenamiento ni la composición del dataset; el autor remite al paper (arXiv:2405.04434) y a la página de DeepSeek-V2-Chat para los detalles arquitectónicos.

Respecto al proceso de ajuste conversacional, la model card no especifica si se emplearon técnicas concretas como RLHF o DPO, por lo que no disponible en la información proporcionada. Esta versión (0628) incorpora mejoras sobre DeepSeek-V2-Chat en seguimiento de instrucciones y expone una optimización específica del comportamiento ante mensajes de sistema, orientada a tareas de traducción inmersiva y RAG. El modelo requiere `trust_remote_code=True` y, según el autor, `attn_implementation="eager"` con `device_map="sequential"` para ejecutarse en transformers.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat.
- Razonamiento y resolución de problemas: mejoras destacadas en MATH (71,0) y BBH (83,4).
- Generación de código: HumanEval de 84,8, con puesto 3 en Coding Arena.
- Seguimiento de instrucciones: IFEval de 77,6, con optimización específica del área de sistema.
- Salida estructurada en JSON: 85 en la evaluación interna de JSON Output.
- Rendimiento en prompts difíciles: puesto 3 en Hard Prompts Arena.
- Soporte de mensajes de sistema orientado a traducción inmersiva y RAG.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües, de visión o de audio: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de propósito general: el modelo gestiona diálogos multi-turno en formato chat con plantilla de mensajes, adecuado para productos de asistencia al usuario que requieran respuestas de alta calidad.
- Generación de código en desarrollo de software: con HumanEval de 84,8 y puesto 3 en Coding Arena, es apto para autocompletado, generación de funciones y explicación de fragmentos de código en entornos de programación.
- Resolución de problemas matemáticos: el salto en MATH (de 53,9 a 71,0) lo hace útil para tutoría, verificación de cálculos y apoyo a tareas cuantitativas.
- Sistemas RAG (generación aumentada por recuperación): la mejora del seguimiento de instrucciones en el área de sistema favorece la integración de contexto recuperado y la obediencia a instrucciones del sistema en pipelines de preguntas y respuestas sobre documentación.
- Traducción inmersiva: el autor destaca la mejora en la zona de sistema para este tipo de tareas, lo que permite integrarlo en herramientas de traducción contextual de documentos largos.
- Extracción de datos estructurados: el rendimiento en JSON Output (85) permite usarlo para transformar texto libre en objetos JSON dentro de pipelines de procesamiento.
- Atención al cliente con prompts complejos: su puesto 3 en Hard Prompts Arena indica buen comportamiento ante consultas difíciles o poco habituales.
- Evaluación y comparación de modelos de código abierto: sirve como referencia de calidad para investigaciones sobre MoE, MLA y ajuste conversacional.

## Benchmarks y rendimiento

Mejoras reportadas por el autor respecto a DeepSeek-V2-Chat:

| Benchmark | DeepSeek-V2-Chat | DeepSeek-V2-Chat-0628 | Mejora |
|---|---|---|---|
| HumanEval | 81,1 | 84,8 | +3,7 |
| MATH | 53,9 | 71,0 | +17,1 |
| BBH | 79,7 | 83,4 | +3,7 |
| IFEval | 63,8 | 77,6 | +13,8 |
| Arena-Hard | 41,6 | 68,3 | +26,7 |
| JSON Output (interno) | 78 | 85 | +7 |

Posición en LMSYS Chatbot Arena en el momento de publicación:

| Clasificación | Posición |
|---|---|
| General | 11 (mejor modelo de código abierto) |
| Coding Arena | 3 |
| Hard Prompts Arena | 3 |

No se han publicado en la información disponible otros resultados de benchmarks adicionales a los anteriores.

## Requisitos de hardware

- Inferencia en BF16: el autor indica que se requieren 8 GPU de 80 GB (por ejemplo, A100 80 GB u H100 80 GB). Esto se debe a los ~236B de parámetros en precisión bf16 y a la caché KV.
- El modelo no cabe en una GPU de consumo; ha de desplegarse en un nodo multi-GPU de 80 GB por tarjeta.
- La configuración de referencia en transformers usa `max_memory` de 75 GB por dispositivo, `device_map="sequential"` (no se admite "auto") y `attn_implementation="eager"`, con `torch_dtype=torch.bfloat16`.
- Opciones de despliegue mencionadas: transformers, text-generation-inference (tag del repositorio) y, en general, librerías compatibles con pesos safetensors.
- Tipos de cuantización, latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

La única comparación con datos concretos disponible en la información proporcionada es con la versión anterior del propio modelo:

| Modelo | Parametros | Contexto | HumanEval | MATH | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V2-Chat-0628 | ~236B | 128K (arquitectura DeepSeek-V2) | 84,8 | 71,0 | deepseek (Model Agreement) |
| DeepSeek-V2-Chat | ~236B | 128K (arquitectura DeepSeek-V2) | 81,1 | 53,9 | deepseek (Model Agreement) |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Requisito de hardware elevado: la inferencia en BF16 exige 8 GPU de 80 GB, lo que limita su uso a infraestructuras de datacenter o clústeres multi-GPU.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir contenido incorrecto o inventado; no hay en la información proporcionada métricas específicas de fidelidad factual.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada; conviene validar el comportamiento en castellano antes de usarlo en producción multilingüe.
- Licencia: se distribuye bajo la licencia "deepseek" (Model Agreement), no bajo MIT; el código del repositorio es MIT, pero los pesos se rigen por términos distintos. Es necesario revisar las condiciones de uso comercial en el enlace de licencia antes de explotarlo en producción.
- No se especifican en la información disponible los tipos de cuantización, los tokens de entrenamiento ni si se emplearon RLHF o DPO, lo que dificulta evaluar el proceso de alineación.
- El autor indica que el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto (custom_code) y debe auditarse en entornos sensibles.
- No se documentan en la información disponible capacidades de tool calling, agentes ni modalidades de visión o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat-0628
- Página de DeepSeek-V2-Chat: https://huggingface.co/deepseek-ai/DeepSeek-V2-Chat
- Paper DeepSeek-V2 (arXiv:2405.04434): https://arxiv.org/abs/2405.04434
- Repositorio y licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
- Licencia del código (MIT): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-CODE
- Sitio de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Plataforma de API: https://www.deepseek.com/en/platform/
