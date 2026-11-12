# EngineeringWithJay/Ternary-Bonsai-2-9B-MTPLX

## Resumen

Ternary-Bonsai-2-9B-MTPLX es un reempaquetado del modelo oficial `prism-ml/Ternary-Bonsai-2-9B-mlx-2bit` de Prism ML, publicado por el usuario EngineeringWithJay. El objetivo no es otro que adaptar el paquete original al contrato del runtime MTPLX, de modo que el modelo pueda servirse con decodificación especulativa MTP nativa en Apple Silicon, en lugar de depender exclusivamente del runtime `mlx-vlm` que acompaña a la versión de Prism. Los pesos no se han modificado: el tronco es idéntico byte a byte al paquete original y la cabeza MTP es la propia de Prism (`qwen3_5_mtp`, 4 bits, grupo 64), con sus 31 tensores intactos.

El modelo pertenece a la familia Ternary Bonsai 2 9B de Prism ML, con arquitectura `prism_hadamard_qwen35`, cuantización ternaria de 2 bits en el tronco y una torre de visión genuina de 27 bloques. Declara 262.144 tokens de contexto nativo y un total de 9.410.903.280 parámetros. Su interés práctico radica en que ofrece capacidades de visión y razonamiento en un paquete de 3,6 GB que cabe holgadamente en un Mac de 16 GB de memoria unificada, con velocidades de decodificación superiores a 50 t/s en texto y alrededor de 30 t/s con imagen en el prompt, según las mediciones del autor.

La relevancia actual del paquete es doble: por un lado, demuestra que es posible servir un VLM de 9B con contexto largo y decodificación especulativa en hardware de consumo Apple; por otro, documenta con detalle el contrato de empaquetado necesario para que MTPLX reconozca la cabeza MTP, lo que resulta útil para quien quiera replicar el proceso con otros modelos de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `prism_hadamard_qwen35` (transformer híbrido: 8 capas de atención completa y 24 de atención lineal / Gated DeltaNet) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Tronco en ternario de 2 bits (afín, grupo 128); cabeza MTP en 4 bits (afín, grupo 64); torre de visión en 4 bits HQQ; KV cache cuantizable a q4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido con 32 capas, de las cuales 8 son de atención completa y 24 son de atención lineal basadas en Gated DeltaNet. El tamaño oculto es de 4096, con 16 cabezas de atención y 4 de key-value, y una dimensión por cabeza de 256. El tronco está cuantizado en ternario de 2 bits con esquema afín y grupo de 128, lo que explica que un modelo de más de 9.000 millones de parámetros ocupe solo 3,46 GB en disco. La atención híbrida reduce el coste de KV cache a 32 KB por token en bf16, frente a los 64 KB que requeriría un modelo con 16 capas de atención completa.

La cabeza MTP (`qwen3_5_mtp`) es la propia de Prism, preentrenada en 4 bits con grupo 64 y profundidad 1, y se utiliza para decodificación especulativa. El paquete incluye además una torre de visión genuina de la línea Ternary Bonsai 2 9B, con 27 bloques, anchura 1152 y cuantización 4-bit HQQ, integrada en el mismo namespace de tensores (`language_model.*` y `vision_tower.*`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el autor indica explícitamente que se trata del modelo base y no de un derivado Swift con postentrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con contexto largo (hasta 262.144 tokens nativos).
- Comprensión visual: lectura de texto en imágenes renderizadas, interpretación de capturas de pantalla de interfaces y lectura de colores en imágenes de terminal.
- Entrada de imágenes a través de la API compatible con OpenAI mediante partes `image_url` con URL `data:`.
- Decodificación especulativa MTP nativa con el runtime MTPLX 2.12 o superior.
- Reutilización de prefijo KV mediante banco de sesiones en SSD, lo que acelera los turnos posteriores de una conversación.
- Soporte de cuantización de KV cache a q4 para reducir el consumo de memoria en contextos largos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking): el runtime permite desactivarlo con `--reasoning off`; no se detalla el comportamiento del modo activado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de programación agéntica local: el paquete está pensado para "visual agentic coding" en Apple Silicon; con 3,4 GB de pesos y 53,4 t/s de decodificación en texto, deja espacio en un Mac de 16 GB para una caché KV larga y permite iterar sobre código con contexto de repositorio extenso.
- Revisión de interfaces y capturas de pantalla: la torre de visión lee correctamente valores de un viewport real y veredictos coloreados en una terminal, lo que sirve para tareas de QA visual automatizado o para interpretar resultados de tests en imágenes.
- Extracción de datos de documentos renderizados: al leer texto literal de un PNG ("GROUND TRUTH 42" en la prueba del autor), puede emplearse para transcribir o verificar contenido en imágenes sin depender de servicios en la nube.
- Conversaciones largas con cliente: la reutilización de prefijo KV reduce el turno posterior a 0,6 s en una conversación de 16K tokens, lo que hace viable un asistente multi-turno con historial extenso en local.
- Procesamiento de contextos de hasta 63.133 tokens en hardware de 16 GB: útil para resumir o analizar documentos largos, con la advertencia de que un prefill fresco de ~95K tokens agota la memoria en ese host.
- Prototipado e investigación en cuantización ternaria: el paquete documenta el contrato de empaquetado MTP y sirve como referencia para experimentar con decodificación especulativa y cuantización de 2 bits en MLX.
- Despliegue de un VLM privado en estación de trabajo Apple: al ejecutarse íntegramente en local con licencia Apache 2.0, encaja en escenarios donde no se permite enviar imágenes ni texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de rendimiento de inferencia realizadas en un M5 Air con 16 GB de memoria unificada, MTPLX 2.12.3 y razonamiento desactivado:

| Medición | Resultado |
|---|---|
| Decodificación de texto | 53,4 t/s |
| Decodificación con imagen en el prompt | 30,4 t/s |
| Prompt más largo aceptado | 63.133 tokens |
| Turno posterior en conversación de 16K tokens | 0,6 s (14,1 s en el primer turno) |
| Pesos en disco | 3,4 GB (3.462.149.260 bytes) |

Como referencia comparativa del propio autor, el pack de 27B Swift que sirve en la misma máquina alcanza ~23 t/s y requiere 8,2 GB de pesos.

## Requisitos de hardware

- VRAM/memoria estimada: 3,4 GB solo para los pesos; el autor reserva un presupuesto de motor de 14.495.552.000 bytes (`MTPLX_MEMORY_LIMIT_BYTES`) en un host de 16 GB, por debajo del límite de Metal de 13,5 GB.
- Banco de sesiones: se recomienda un presupuesto de 3 GB (`MTPLX_SESSION_BANK_MAX_BYTES=3221225472`) para habilitar la reutilización de prefijo KV; una entrada de 14K tokens necesita ~989 MB, por lo que bajar el presupuesto a 64 MB inutiliza la caché y fuerza el reprefill completo en cada turno.
- GPU recomendadas: el paquete está orientado a Apple Silicon con MLX; el autor lo ha validado en un M5 Air de 16 GB. No hay datos sobre GPU NVIDIA u otras plataformas.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: 3,4 GB de pesos permiten ejecutarlo en equipos de 16 GB de memoria unificada. En GPU de consumo NVIDIA no hay información disponible.
- Opciones de despliegue: MTPLX 2.12 o superior mediante `mtplx serve`; `mlx-lm` estándar no puede cargar el paquete porque su `model_type` es `prism_hadamard_qwen35`. El paquete original de Prism se sirve con `mlx-vlm`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 53,4 t/s en texto y 30,4 t/s con imagen; 0,6 s por turno posterior en una conversación de 16K tokens gracias a la restauración de prefijo KV. Un prefill fresco de ~95K tokens provoca un aborto por memoria insuficiente (error 507) en el host de 16 GB del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-MTPLX (este) | 9,41B | 262.144 | Ternaria 2 bits (tronco), 4 bits (MTP y visión) | Apache 2.0 | Hugging Face, runtime MTPLX |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9,41B | 262.144 | Ternaria 2 bits | Apache 2.0 (según el paquete base) | Hugging Face, runtime mlx-vlm |
| Pack de 27B Swift citado por el autor | 27B (aproximado) | no disponible | no disponible | no disponible | servido en la misma máquina del autor |
| Otras alternativas de 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con el paquete original de Prism: los pesos son idénticos, pero este reempaquetado añade el contrato MTP para MTPLX, con lo que habilita decodificación especulativa nativa y banco de sesiones en SSD. Frente al pack de 27B del mismo autor, este modelo sacrifica conocimiento (es el base, no un derivado Swift) a cambio de menos de la mitad de peso y más del doble de velocidad de decodificación.

## Limitaciones y advertencias

- Es el modelo base, no un finetune Swift: no incorpora la reducción de tokens de razonamiento ni el postentrenamiento de los derivados Swift.
- La cabeza MTP es la de Prism, entrenada contra el tronco de Ternary Bonsai 2; la tasa de aceptación es la de la cabeza original y el autor no publica una tabla específica de aceptación.
- El aborto por memoria en prefills frescos de ~95K tokens es una limitación del host de 16 GB, no del paquete; el modelo declara 262.144 tokens de contexto y el plan de MTPLX reporta un ajuste de 65.536 tokens con KV en q4.
- Requiere MTPLX 2.12 o superior; no es cargable con `mlx-lm` estándar.
- El paquete está orientado a Apple Silicon; no hay información sobre rendimiento o compatibilidad en otras plataformas.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, lo que impide confirmar cobertura multilingüe.
- Soporte de tool calling y de agentes multi-paso: no documentado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del paquete base de Prism y de los datos de entrenamiento originales antes de desplegarlo en producción.
- El modelo se publica como experimental, con 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación externa independiente.

## Enlaces

- [Hugging Face: EngineeringWithJay/Ternary-Bonsai-2-9B-MTPLX](https://huggingface.co/EngineeringWithJay/Ternary-Bonsai-2-9B-MTPLX)
- [Modelo base: prism-ml/Ternary-Bonsai-2-9B-mlx-2bit](https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit)
