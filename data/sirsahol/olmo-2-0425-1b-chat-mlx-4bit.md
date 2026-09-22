# SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit

## Resumen

OLMo-2-0425-1B-chat-mlx-4bit es una conversión cuantizada a 4 bits en formato MLX del checkpoint base allenai/OLMo-2-0425-1B, publicada por el usuario SirSahOl. Se trata, por tanto, de un derivado y no de un modelo entrenado desde cero: el trabajo original corresponde a Ai2 (Allen Institute for AI), mientras que esta versión se limita a adaptar los pesos al framework MLX de Apple para permitir inferencia nativa en la GPU unificada de los chips de la serie M.

El modelo es un transformer decoder-only de tipo Olmo2ForCausalLM con 1.484.916.736 parámetros (aproximadamente 1,48 mil millones) y una ventana de contexto de 4.096 tokens. La cuantización empleada es de 4 bits con una media de 4,50 bits por peso, lo que reduce el repositorio a 0,9 GB y deja una huella de memoria activa estimada en unos 0,9 GB, con 8 GB de memoria unificada como requisito mínimo recomendado.

Su relevancia es acotada pero concreta: ofrece un modelo conversacional de licencia Apache 2.0 que cabe en cualquier Mac con 8 GB de memoria unificada y que, según las proyecciones del autor, alcanza entre 183 y 549 tokens por segundo según el chip. El interés principal está en el despliegue local y sin conexión en hardware Apple Silicon, no en la competitividad en tareas de razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Olmo2ForCausalLM (transformer decoder-only) |
| Parámetros totales | 1.484.916.736 (según safetensors, ~1,48 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | 4 bits (media 4,50 bits por peso); el mismo autor publica variantes de 8 bits y 16 bits |
| Idiomas soportados | Inglés (etiqueta `en`); no se documenta soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (Apple Silicon) |
| Librería / framework | mlx (mlx-lm 0.31.3) |
| Modelo base | allenai/OLMo-2-0425-1B (relación: quantized) |
| Tamaño del repositorio | 0,9 GB |
| Huella de VRAM activa | ~0,9 GB (mínimo recomendado: 8 GB de memoria unificada) |
| Plantilla de chat | Tokens `<|im_start|>`, `<|im_end|>`, `<|endoftext|>` |
| Descargas / likes | 17 / 0 |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-22 (según metadatos de HuggingFace) |
| Paper de referencia | arXiv:2501.00656 (familia OLMo 2) |

## Arquitectura y entrenamiento

El checkpoint subyacente pertenece a la familia OLMo 2 de Ai2, descrita en el paper referenciado en las etiquetas del repositorio (arXiv:2501.00656). Se trata de un transformer decoder-only de tipo causal, con normalización RMSNorm, embeddings rotatorios y capas feed-forward con activación de tipo SwiGLU. La información proporcionada no incluye el detalle del recuento de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF, DPO o RLVR sobre este checkpoint concreto de 1B; esos datos deben consultarse en el paper y en la model card del modelo base original.

Esta ficha describe exclusivamente la conversión: el autor ha tomado los pesos de allenai/OLMo-2-0425-1B, los ha cuantizado a 4 bits con mlx-lm 0.31.3 en un proceso que, según la model card, tardó 5,86 segundos, y los ha empaquetado en safetensors con formato nativo de MLX. No hay reentrenamiento, destilación ni ajuste fino adicional. La model card se presenta como una conversión "chat" e incluye una plantilla conversacional, aunque el campo `base_model` apunta al checkpoint base de Ai2 y no a la variante Instruct; la sección de detalles de conversión aparece truncada en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés con plantilla conversacional de sistema, usuario y asistente.
- Conversación multiturno dentro de una ventana de 4.096 tokens.
- Finalización de texto y autocompletado de fragmentos cortos.
- Generación de código sencillo y explicación de fragmentos, con la cautela propia de un modelo de 1,48 B de parámetros.
- Resumen y reformulación de textos cortos en inglés.
- Ejecución local sin conexión en Apple Silicon mediante MLX, con soporte de CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con LM Studio y Ollama mediante plantilla y tokens de parada personalizados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso estructurado, modo "thinking", visión, audio ni otras modalidades.
- No se documenta capacidad multilingüe: la única etiqueta de idioma presente es `en`.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se ejecuta íntegramente en la GPU unificada de un Mac con 8 GB, sin enviar datos a servicios externos, lo que resulta adecuado para borradores y consultas sobre información sensible que no debe salir del equipo.
- Integración en editores y entornos de desarrollo: al ocupar menos de 1 GB de memoria activa, puede convivir con IDE, navegador y otras herramientas en segundo plano, ofreciendo completados y explicaciones de fragmentos de código en inglés.
- Prototipado rápido de aplicaciones LLM: sirve como modelo de pruebas para validar plantillas de prompt, flujos conversacionales y formateo de tokens antes de migrar a modelos mayores, con un coste de memoria y latencia mínimo.
- Aplicaciones de escritorio distribuidas: el repositorio de 0,9 GB permite empaquetar el modelo dentro de una aplicación macOS sin depender de descargas de varios gigabytes, algo viable para utilidades de asistencia textual sin conexión.
- Clasificación y extracción ligera de campos en documentos cortos: con un contexto de 4.096 tokens puede procesar correos, fragmentos de documentación o fichas breves y devolver respuestas estructuradas en inglés.
- Resumen de notas e hilos de conversación cortos: útil en herramientas internas de gestión de conocimiento donde el texto de entrada no supera unos pocos miles de tokens.
- Pruebas de latencia y orquestación de agentes en Apple Silicon: su elevado throughput proyectado lo convierte en un candidato para medir cuellos de botella de infraestructura local antes de desplegar modelos mayores.
- Demostraciones educativas sobre cuantización: permite ilustrar en el aula o en un artículo la diferencia práctica entre las variantes de 4, 8 y 16 bits publicadas por el mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye estimaciones de velocidad de decodificación y tiempo hasta el primer token para hardware Apple Silicon, que se reproducen a continuación y que el propio autor califica como proyecciones basadas en la saturación de ancho de banda de memoria, no como mediciones reproducibles.

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~0,9 GB | ~183 tokens/s | ~16 ms | Asistente interactivo y completados locales |
| M1 / M2 / M3 / M4 Pro | 18 GB – 36 GB | ~0,9 GB | ~274 tokens/s | ~11 ms | Uso diario para código, invocación de herramientas y chat multiturno |
| M1 / M2 / M3 / M4 Max | 36 GB – 128 GB | ~0,9 GB | ~393 tokens/s | ~7 ms | Generación de alto rendimiento y orquestación de agentes |
| M1 / M2 / M3 Ultra | 64 GB – 192 GB | ~0,9 GB | ~549 tokens/s | ~4 ms | Concurrencia alta y servicio en producción |

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,9 GB de memoria unificada activa con cuantización de 4 bits; ~1,5 GB para la variante de 8 bits y ~2,8 GB para la de 16 bits.
- Memoria mínima recomendada por el autor: 8 GB de memoria unificada (cualquier Mac con chip M1 o posterior en su configuración base).
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) a través de MLX. No se documentan requisitos ni recomendaciones para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada. No se ha publicado información sobre su ejecución en tarjetas gráficas dedicadas.
- Opciones de despliegue: MLX mediante `mlx-lm` (CLI y API de Python), LM Studio (configurando tokens de parada) y Ollama mediante un Modelfile (`FROM SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit` con `stop` para `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` y temperatura 0.7). No se documenta compatibilidad con vLLM, TGI o llama.cpp, dado que el formato de pesos es MLX.
- Latencia y throughput: únicamente las proyecciones incluidas en la tabla anterior (~183–549 tokens/s y ~4–16 ms hasta el primer token según el chip). No hay mediciones independientes ni datos de rendimiento en modo batched.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit (este) | 1,48 B | 4.096 tokens | 4 bits, safetensors MLX | Apache 2.0 | HuggingFace, solo Apple Silicon |
| allenai/OLMo-2-0425-1B (original) | 1,48 B | 4.096 tokens | 16 bits (sin cuantizar) | Apache 2.0 (según este repositorio) | HuggingFace, multiplataforma |
| SirSahOl/OLMo-2-0425-1B-chat-mlx-8bit | 1,48 B (mismo checkpoint) | 4.096 tokens | 8 bits, safetensors MLX | Apache 2.0 | HuggingFace, ~1,5 GB |
| SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit | 1,48 B (mismo checkpoint) | 4.096 tokens | 16 bits, safetensors MLX | Apache 2.0 | HuggingFace, ~2,8 GB |
| Qwen2.5-1.5B-Instruct | Datos de referencia de su model card oficial: ~1,54 B | 32.768 tokens (nativo) | Múltiples, incluido GGUF | Apache 2.0 | HuggingFace, multiplataforma |
| Llama-3.2-1B-Instruct | Datos de referencia de su model card oficial: ~1,24 B | 128.000 tokens | Múltiples, incluido GGUF | Licencia comunitaria de Llama 3.2 | HuggingFace, con restricciones |
| SmolLM2-1.7B-Instruct | Datos de referencia de su model card oficial: ~1,71 B | 8.192 tokens | Múltiples, incluido GGUF | Apache 2.0 | HuggingFace, multiplataforma |

Los datos de las tres alternativas externas provienen de sus respectivas model cards públicas y conviene verificarlos en la fuente original antes de tomar decisiones de producción; no proceden de la información proporcionada en esta consulta. En el eje de contexto, este modelo queda claramente por detrás de Qwen2.5-1.5B y Llama-3.2-1B, y su ventaja diferencial se limita al consumo de memoria y a la integración nativa con MLX.

## Limitaciones y advertencias

- Riesgo de alucinación elevado: con 1,48 B de parámetros, la tasa de afirmaciones incorrectas o inventadas en tareas de conocimiento factual es intrínsecamente alta; no se recomienda su uso sin verificación en dominios críticos.
- Ventana de contexto corta: 4.096 tokens limitan el uso con documentos largos, historiales de conversación extensos o bases de código de tamaño medio.
- Idioma: la única etiqueta de idioma es `en`. No se documenta soporte de castellano y no se ha publicado ninguna evaluación de calidad en español, por lo que su uso en producción en castellano requeriría validación propia.
- Posible desajuste de linaje: el repositorio se denomina "chat" e incluye plantilla conversacional, pero el campo `base_model` apunta al checkpoint base allenai/OLMo-2-0425-1B y no a la variante Instruct. Conviene verificar qué pesos se cuantizaron realmente antes de asumir un comportamiento alineado para diálogo.
- Configuración de tokens de parada obligatoria: si no se configuran `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` como tokens de parada en LM Studio u Ollama, el autor advierte de bucles de generación descontrolados y turnos mal delimitados.
- Portabilidad restringida: el formato MLX solo se ejecuta de forma nativa en Apple Silicon. No hay pesos GGUF en este repositorio, por lo que desplegarlo en NVIDIA, AMD o servidores x86 exige una conversión adicional por cuenta propia.
- Cifras de rendimiento no verificadas: los valores de tokens por segundo y TTFT son proyecciones declaradas por el autor, sin metodología ni reproducción independiente, y varían con la longitud del prompt.
- Model card incompleta: la sección de detalles de conversión aparece truncada y no se especifican los parámetros de calibración ni las capas excluidas de la cuantización.
- Validación comunitaria mínima: 17 descargas y 0 "likes" en el momento de la consulta, sin issues ni evaluaciones publicadas por terceros.
- Licencia: el repositorio declara Apache 2.0, que en principio permite uso comercial, pero conviene confirmar también la licencia y los términos del checkpoint base de Ai2 y de los datos de entrenamiento asociados antes de un despliegue comercial.
- Gobernanza del modelo original: al ser un derivado de un modelo abierto de Ai2, cualquier limitación o corrección publicada posteriormente sobre la familia OLMo 2 afecta también a esta conversión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-4bit
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante de 8 bits del mismo autor: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-8bit
- Variante de 16 bits del mismo autor: https://huggingface.co/SirSahOl/OLMo-2-0425-1B-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Paper de la familia OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- La búsqueda web realizada no ha devuelto ningún enlace adicional relevante sobre este modelo, su autor o su proceso de conversión.
