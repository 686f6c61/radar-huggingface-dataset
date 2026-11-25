# JoaoZaokk/Inkling-2-Mini-Heretic

## Resumen

Inkling-2-Mini-Heretic es una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario JoaoZaokk en Hugging Face. El modelo base es un transformer híbrido con núcleo MoE de profundidad en bucle (looped transformer), 33.300 millones de parámetros totales según la model card (26.390 millones según los safetensors reales del repositorio), aproximadamente 2.130 millones de parámetros activos por capa física y una ventana de contexto de 1.048.576 tokens. La variante Heretic elimina las respuestas de rechazo tanto en modo chat directo como dentro del bloque de razonamiento nativo `<|content_thinking|>`, manteniendo supuestamente la capacidad de razonamiento y de generación de código.

El interés de esta ficha reside en dos aspectos. Por un lado, documenta una arquitectura poco habitual que combina MoE de grano fino con 128 expertos, atención residual por bloques, convoluciones causales cortas y un predictor multi-token nativo (DSpark) pensado para decodificación especulativa. Por otro, ilustra una técnica de "abliteración" multietapa que aborda problemas estructurales específicos de los transformers con bucle de profundidad, donde proyectar únicamente la pasada final deja el estado de rechazo en las pasadas intermedias.

El modelo se distribuye en safetensors nativos con cuantización NVFP4 y MXFP8/Q8_0, con licencia Apache 2.0 y soporte declarado para despliegue en una única RTX 3090 de 24 GB. La información disponible proviene exclusivamente de la model card del autor; no se han publicado resultados de benchmarks independientes ni documentación oficial del modelo base más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con núcleo MoE de profundidad en bucle (P=3 pasadas, 48 visitas de capa), atención residual por bloques (AttnRes), ShortConv causal de 4 taps y atención híbrida SWA + full attention con sesgo relativo log-escalado |
| Parametros totales | 26.388.646.440 según safetensors del repositorio; la model card declara 33.300 millones |
| Parametros activos | ~2.130 millones por capa física (MoE con top-k = 8 de 128 expertos) |
| Longitud de contexto | 1.048.576 tokens (1M), patrón híbrido 5:1 (40 visitas SWA con W=1.024 y 8 visitas de atención completa) |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas de bloque E4M3 de 16), MXFP8, Q8_0; GGUFs dinámicos Unsloth en repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), GGUF (repositorio hermano), mtp.safetensors para el predictor DSpark |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini organiza sus 48 visitas de capa en tres segmentos: un preludio de 6 visitas (blk.0..5), un núcleo en bucle de 12 capas ejecutado tres veces (blk.6..17, 36 visitas que comparten pesos mediante controladores aprendidos de rango 64: loop_down, loop_forget y loop_gain) y una coda de 6 visitas (blk.18..23). El MoE es de grano fino con 128 expertos y top-k = 8 activos, con compuerta SITU acotada mediante funciones tanh y sigmoide. Las capas blk.0..19 están cuantizadas nativamente en NVFP4 y la coda blk.20..23 en MXFP8/Q8_0. La atención combina ventanas deslizantes de 1.024 tokens con atención completa que incorpora un sesgo relativo aprendido de 16 dimensiones y attention sinks, además de capas ShortConv causales de 4 taps que envuelven K, V, la salida de atención y la proyección descendente del FFN.

El predictor multi-token nativo DSpark (mtp.safetensors) es un transformer borrador no causal de 8 tokens por bloque, con 2 capas (una SWA y una completa), condicionado por mezclas de características de las visitas 5, 23, 41 y 48, más una cabeza Markov recurrente de rango 256 tipo GRU que comparte los embeddings de tokens y la matriz de salida. Esta pieza habilita decodificación especulativa sin modelo borrador externo.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. La variante Heretic no reentrena el modelo; aplica una técnica de abliteración multietapa sobre las activaciones. El autor describe cinco fronteras causales de extracción (B0_Direct, B1_ThinkEntry, B2_CoTOnset, B3_PostCoT, B4_ChatMidPivot) con 193 × 2.304 activaciones pre-ShortConv por token, y una ablación secuencial en dos etapas (ng = 2) con protección de norma (norm_guard_layers) que proyecta subespacios ortogonalizados de rechazo. Según la model card, esta metodología reduce el rechazo directo en chat del 100 % al 1,25 % y el rechazo dentro de `<|content_thinking|>` del 100 % al 3,75 % (2,50 % con effort=high), preservando el 93,75 % de precisión en GSM8K CoT y el 100 % de pass@1 en código Python.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Razonamiento nativo con modo de pensamiento (`<|content_thinking|>`) y niveles de esfuerzo configurables (por ejemplo, effort=0.9 o effort=high).
- Generación de código: la model card declara 100 % de pass@1 en pruebas de código Python.
- Razonamiento matemático con cadena de pensamiento: 93,75 % de precisión en GSM8K CoT según el autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita entrada multimodal.
- Decodificación especulativa nativa mediante DSpark, sin necesidad de un modelo borrador separado.
- Capacidad de razonamiento multi-paso y terminación controlada del razonamiento (97,5 % de terminación completa según la model card).
- Respuestas sin rechazo en chat directo y dentro del bloque de pensamiento (1,25 % y 3,75 % de rechazo respectivamente, métricas del autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos dentro de la ventana de 1M tokens, útil para análisis de contratos, expedientes o bases de código completas sin fragmentación.
- Generación de código en pipelines de desarrollo: con pass@1 declarado del 100 % en pruebas Python y decodificación especulativa DSpark, es adecuado para autocompletado y generación de funciones en entornos con GPU única, aunque requiere validación propia antes de producción.
- Razonamiento matemático con traza explícita: el modo `<|content_thinking|>` permite obtener cadenas de razonamiento auditables para problemas de GSM8K y similares, útil en herramientas educativas o de verificación.
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o formularios combinados con texto largo.
- Investigación sobre alineamiento y seguridad: la variante Heretic sirve como objeto de estudio para analizar cómo la abliteración afecta al comportamiento de rechazo en arquitecturas con bucle de profundidad y modo de pensamiento.
- Despliegue en estación de trabajo con una RTX 3090: el autor reporta 258–306 tok/s con Turbo DSpark y 114–131 tok/s con Full P=3 DSpark en una única RTX 3090 a 280 W, lo que permite prototipado local de asistentes con contexto muy largo.
- Servicio multiagente: con las optimizaciones de KV unificado y muestreo en GPU, el autor reporta 26–38 tok/s por agente con 8–24 agentes concurrentes (508–610 tok/s agregados), adecuado para orquestaciones de agentes en un solo servidor.
- Generación de contenido sin restricciones de rechazo: para aplicaciones creativas o de investigación que requieran respuestas sin filtros de seguridad, con las advertencias legales y éticas correspondientes.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y comparan la variante Heretic con el modelo base y con la versión V1 de la propia variante. No hay benchmarks independientes.

| Metrica | Base | Heretic V1 | Heretic V2 |
|---|---|---|---|
| Rechazo en chat directo | 100,0 % | 20,0 % | 1,25 % |
| Rechazo en `<|content_thinking|>` | 100,0 % | 58,33 % | 3,75 % (2,50 % con effort=high) |
| Precisión GSM8K CoT | no disponible | no disponible | 93,75 % |
| Pass@1 en código Python | no disponible | no disponible | 100,00 % |
| Falsos rechazos XSTest | no disponible | no disponible | 0,00 % |
| Terminación completa del razonamiento | no disponible | no disponible | 97,5 % |
| KLD respecto al base | — | no disponible | 0,0360 |
| Perplejidad WikiText-2 | no disponible | no disponible | 8,607 |

Rendimiento de inferencia declarado en una RTX 3090 de 24 GB a 280 W:

| Configuracion | Throughput |
|---|---|
| Turbo DSpark (un agente) | 258–306 tok/s |
| Full P=3 DSpark (un agente) | 114–131 tok/s |
| Multiagente (8–24 agentes) | 26–38 tok/s por agente; 508–610 tok/s agregados |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 39,7 GB en safetensors; con cuantización NVFP4 y MXFP8/Q8_0 el autor verifica funcionamiento en una RTX 3090 de 24 GB. Para el conjunto completo en precisión nativa se necesitarían del orden de 40 GB o más, lo que exige A100 80 GB, H100 o varias GPU.
- GPU recomendadas: RTX 3090 (24 GB) como objetivo mínimo verificado por el autor; A100 40/80 GB, H100 y L40S para despliegues con mayor concurrencia o sin cuantización agresiva.
- Cabe en GPU de consumo: sí, en RTX 3090 con las cuantizaciones y kernels sm_86 proporcionados; en GPUs de 16 GB o menos no hay datos que confirmen su viabilidad.
- Opciones de despliegue: transformers con safetensors nativos; llama.cpp con el parche `patches/llama_inkling2_sm86.patch`; GGUFs Unsloth del repositorio hermano; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 258–306 tok/s con Turbo DSpark y 114–131 tok/s con Full P=3 DSpark en una RTX 3090 a 280 W para un solo agente; 26–38 tok/s por agente con 8–24 agentes concurrentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks independientes ni de especificaciones verificables de alternativas comparables en la información proporcionada. La comparación se limita a lo declarado por el autor frente al modelo base del que deriva.

| Modelo | Parametros | Contexto | Rechazo chat | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Heretic | 26,4B (safetensors); 33,3B declarados | 1.048.576 | 1,25 % | Apache 2.0 | Hugging Face (JoaoZaokk) |
| thinkingmachines/Inkling-2-Mini (base) | 33,3B declarados | 1.048.576 | 100,0 % | no disponible | Hugging Face (thinkingmachines) |
| Heretic V1 (misma familia) | no disponible | 1.048.576 | 20,0 % | Apache 2.0 | Hugging Face (JoaoZaokk) |

Comparativa con modelos de otras familias (Qwen, Llama, Mistral, DeepSeek): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin filtros, lo que traslada toda la responsabilidad de moderación al integrador.
- Riesgo de alucinación no cuantificado: no hay evaluaciones independientes de fidelidad factual ni de calibración.
- Los benchmarks declarados (GSM8K, pass@1 en Python, XSTest) proceden del autor y no han sido replicados de forma independiente; deben tomarse como indicativos.
- Discrepancia en el recuento de parámetros: los safetensors del repositorio suman 26,39B mientras la model card declara 33,3B; conviene verificar la integridad de los pesos antes de desplegar.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe fuera del inglés.
- El contexto de 1M tokens depende de atención híbrida SWA más full attention; el rendimiento efectivo en los extremos de la ventana no está verificado de forma independiente.
- El despliegue óptimo requiere parches CUDA específicos para sm_86 y kernels NVFP4/Q8_0 propios; fuera de ese entorno el rendimiento puede degradarse notablemente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no documentadas en la información disponible; conviene revisar la licencia del modelo original.
- El uso de un modelo sin filtros de rechazo en producción puede incumplir políticas de plataformas, términos de servicio de proveedores cloud y normativa sectorial.
- No hay información sobre sesgos demográficos, de género o culturales medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic
- Repositorio GGUF hermano: https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Parche llama.cpp sm_86: `patches/llama_inkling2_sm86.patch` (referenciado en la model card, sin URL directa disponible)
- Parche backend sampling upstream PR: `patches/llama_cpp_backend_sampling_pr.patch` (referenciado en la model card, sin URL directa disponible)
- Papers, blogs, demos y repositorios adicionales: no disponible en la información proporcionada.
