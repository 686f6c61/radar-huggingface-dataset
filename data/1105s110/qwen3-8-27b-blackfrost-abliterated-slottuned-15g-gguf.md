# 1105s110/Qwen3.8-27B-Blackfrost-Abliterated-SlotTuned-15G-GGUF

# Qwen3.8-27B Blackfrost-Abliterated Slot-Tuned 15G GGUF (1105s110)

## Resumen

Este repositorio contiene una cuantización GGUF mixta de ~14,95 GiB del modelo Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, publicada por el usuario 1105s110. Se trata de la "tier de fidelidad" de 15 GiB dentro de la línea de cuantizaciones Blackfrost para Qwen3.8-27B, y su rasgo diferencial es un ajuste manual por slot de tensor: las clases sensibles se mantienen en precisión alta (q5_K, bf16 e incluso NVFP4) mientras que el grueso de las matrices de feed-forward queda en q4_K asistido por importance matrix. No es una cuantización por tabla de asignación automática, sino una receta `--tensor-type` por slot sobre `llama-quantize`.

El modelo base es una variante "abliterated" (reducción de rechazos) del Qwen3.8-27B, orientada a investigación local y uso personal. El autor reporta una divergencia KLD de 0,0387 frente a los logits BF16 de referencia, cifra mejor que la de su propia cuantización anterior de 16,9 GiB, y una puntuación de 14/17 en su "HardBattery" (matemáticas verificadas por fuerza bruta, código ejecutado en sandbox y lógica dura), idéntica a la de las otras dos tiers de la familia.

La relevancia práctica es doble: por un lado, demuestra que una reasignación de bits por slot puede reducir ~1 GiB de peso sin degradar la fidelidad; por otro, introduce tensores NVFP4 nativos de Blackwell, lo que ata el artefacto a GPUs de esa generación (probado en RTX 5090 con llama.cpp b10930 CUDA) y lo hace incompatible con builds antiguos o con hardware no Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada explícitamente en la model card. Los slots de tensores (`attn_gate`, `ssm_out`, `ssm_alpha/beta`, `eh_proj`) apuntan a un transformer híbrido con componentes de espacio de estados (SSM), además de 16 capas de atención identificadas |
| Parametros totales | 27B según el nombre del modelo; no confirmado en la model card |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No especificada en la model card. El autor ejecuta pruebas de aguja profunda a 202K tokens y su ejemplo de despliegue usa `-c 65536` |
| Tipos de cuantizacion | Mixta 4/5 bits por slot: q4_K (ffn, attn qkv) con imatrix, q5_K (q/k/v/output de 16 capas de atención, embeddings y output), q8_0 (resto), bf16 (`ssm_alpha/beta`, `eh_proj`), NVFP4 (attn_gate, ssm_out) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), tamaño de fichero ~14,95 GiB (15G nominal) |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento del modelo base en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento posterior. Lo único documentado es la naturaleza "abliterated" (reducción de rechazos) de los pesos BF16 originales, que provienen de Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16. Tampoco se describe la arquitectura interna del base más allá de lo que se deduce de los nombres de slot empleados en la receta de cuantización, que sugieren un diseño híbrido con atención y componentes SSM.

La aportación técnica de este repositorio es exclusivamente la receta de cuantización: un ajuste por slot con `llama-quantize` asistido por importance matrix, en el que se fijan en alta precisión las clases de tensor con mayor impacto en la fidelidad y se deja el resto en q4_K. El uso de NVFP4 para `attn_gate` y `ssm_out` aprovecha el formato FP4 nativo de las GPU Blackwell, lo que reduce el tamaño sin degradar esas rutas. Según el autor, esta receta sustituye a su build v8 de 16,0 GiB con una pérdida de solo +0,0007 KLD (0,0387 frente a 0,0380) a cambio de −1,05 GiB.

## Capacidades

- Generación de texto y conversación multi-turno en formato GGUF con plantilla de chat integrada (`--jinja`).
- Canal de razonamiento explícito conservado en la plantilla de chat: el autor recomienda mantener `max_tokens` ≥ 600 en la API para no truncar la cadena de pensamiento.
- Razonamiento matemático y lógica dura: el banco HardBattery incluye matemáticas con verdad de referencia verificada por fuerza bruta, código ejecutado en sandbox y problemas de lógica; el modelo obtiene 14/17.
- Generación de código: evaluada dentro del HardBattery mediante ejecución en sandbox; el autor señala que la aceptación del draft especulativo alcanza sus picos en cargas de código.
- Seguimiento de instrucciones estilo IFEval, evaluado en el "Easy battery" (21/22), que combina cuestionario de conocimiento, generación abierta y tareas de instrucción.
- Recuperación en contexto largo: soporta pruebas de aguja profunda a 202K tokens, aunque con menor velocidad de decodificación que la tier "daily driver" del autor.
- Reducción de rechazos (abliterated): responde con mayor facilidad a peticiones que el alineamiento original rechazaría. No se han publicado datos de refusal-bench para esta cuantización concreta.
- Soporte de decodificación especulativa: las métricas de velocidad se miden con un modelo draft especulativo BF16 DFlash del propio autor.
- Tool calling / function calling y uso agéntico: no documentado en la model card.
- Capacidades multimodales (visión o audio): no documentadas; no disponibles.

## Casos de uso

- Investigación sobre alineación y rechazo: al ser un modelo abliterated con licencia Apache-2.0, sirve para estudiar cómo cambia la tasa de cumplimiento de peticiones respecto al base alineado. El autor advierte de que el protocolo de 450 casos de refusal-bench no se ha ejecutado sobre esta cuantización, por lo que ese análisis queda pendiente.
- Red teaming y evaluación de seguridad: desplegado localmente con `llama-server`, permite generar respuestas que el modelo base rechazaría y medir su tasa de cumplimiento en un entorno aislado, sin depender de APIs externas.
- Asistente de código en local: el modelo rinde bien en tareas de código con verificación en sandbox y la decodificación especulativa alcanza su mejor aceptación en cargas de programación (104,6 tok/s de decodificación en replay de prompts reales). Encaja en un flujo de trabajo sobre una RTX 5090 con `llama.cpp`.
- Análisis de documentos extensos: gracias a las pruebas a 202K tokens y a la ventana configurable (`-c 65536` en el ejemplo), es viable resumir o extraer información de expedientes largos. Conviene tener en cuenta que a esa profundidad la decodificación baja a 62,4 tok/s y la precisión de aguja al 46,2%.
- Generación creativa de ficción sin filtros temáticos: el ajuste abliterated permite trabajar con narrativa de temática adulta o controvertida que el modelo alineado rechazaría, siempre bajo responsabilidad del operador.
- Banco de pruebas de cuantización: sirve como referencia para comparar recetas mixtas por slot frente a formatos puros IQ/K, con métricas reproducibles (KLD, perplejidad, baterías de conocimiento e instrucciones).
- Prototipado de asistentes conversacionales multi-turno en local: la plantilla conserva el canal de razonamiento y el modelo soporta conversaciones largas con KV cache en GPU; es adecuado para demos internas antes de decidir sobre un modelo de mayor tamaño.
- Evaluación comparativa de hardware Blackwell: al requerir NVFP4 nativo, es un caso de prueba útil para medir el rendimiento de FP4 en RTX 5090 frente a cuantizaciones tradicionales.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 5090 con llama.cpp b10930, mismo harness para todas las celdas. La columna "daily driver" corresponde al quant diario del autor, cuyo tamaño no se especifica en la tabla.

| Metrica | v11-a (este repo, 15G) | Tier 9,8G GSQ-RCO | Daily driver |
|---|---|---|---|
| KLD vs BF16 golden | 0,0387 | 0,1137 | 0,0523 |
| Easy battery /22 | 21 | 21 | 22 |
| HardBattery /17 | 14 | 14 | 14 |
| Replay de prompts reales (decodificacion / aceptacion draft) | 104,6 tok/s / 35,8 % | 138,9 tok/s / 44,5 % | 116,3 tok/s / 40,7 % |
| Aguja profunda a 202K (decodificacion / precision) | 62,4 tok/s / 46,2 % | 63,2 tok/s / 41,4 % | 70,1 tok/s / 51,7 % |
| Perplejidad en wiki.test.raw (100×512, ± error estandar) | 7,440 ± 0,114 | 7,875 ± 0,123 | 7,564 ± 0,118 |

Notas de protocolo aportadas por el autor: el KLD se calcula contra logits BF16 guardados (KV en f16, mismo corpus y chunking para todos los quants) y es un indicador de fidelidad de pesos, no una clasificación de calidad; las baterías Easy y Hard combinan cuestionarios de conocimiento, generación abierta, IFEval, matemáticas verificadas, código en sandbox y lógica dura; el replay usa 30 prompts reales emparejados a temperatura 0 con el mismo draft especulativo BF16; la perplejidad se mide con `llama-perplexity` sobre el `wiki.test.raw` oficial.

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,95 GiB solo de pesos; hay que sumar la caché KV. Con `-c 65536` y KV en f16 el consumo total puede superar los 20 GiB según configuración y número de capas offloaded.
- GPU probada: RTX 5090 (32 GB) con llama.cpp b10930 y CUDA, según el propio autor.
- Restricción crítica: la cuantización contiene tensores NVFP4 (attn_gate y ssm_out), por lo que requiere una build reciente de llama.cpp con FP4 nativo de Blackwell. No está soportada en GPU no Blackwell ni en builds antiguas.
- GPUs compatibles: familia Blackwell, es decir, RTX 50 (RTX 5090, 5080, 5070 Ti, 5070) y soluciones de datacenter de esa generación. En placas con menos de 32 GB hay que vigilar el espacio para la caché KV.
- GPUs no compatibles: RTX 4090, RTX 3090, A100, H100 y cualquier arquitectura anterior a Blackwell. Para esos entornos el autor recomienda su quant de 9,8 GiB IQ3_XXS (GSQ-RCO), que solo usa formatos IQ/K y funciona en cualquier build de llama.cpp.
- Cabe en GPU de consumo: sí, en la gama RTX 50 de 16 GB o más si se reduce la ventana de contexto; el caso medido es una RTX 5090 de 32 GB.
- Opciones de despliegue: `llama-server` y `llama.cpp` (formato GGUF con soporte NVFP4). No se documenta compatibilidad con vLLM, TGI, Ollama u otros motores, y la dependencia de NVFP4 hace improbable que funcionen sin adaptaciones.
- Latencia y throughput medidos: 104,6 tok/s de decodificación con draft especulativo en replay de prompts reales (35,8 % de aceptación); 62,4 tok/s y 46,2 % de precisión en aguja profunda a 202K tokens. El autor advierte de que la aceptación del draft varía según la carga y que la velocidad cae en prosa y sube en código.

## Comparativa con modelos similares

| Modelo / quant | Parametros | Contexto | Fidelidad (KLD) | HardBattery | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (Slot-Tuned 15G, NVFP4) | 27B (nominal) | No especificado; probado a 202K | 0,0387 | 14/17 | Apache-2.0 | GGUF; requiere llama.cpp con NVFP4 y GPU Blackwell |
| Tier 9,8G GSQ-RCO IQ3_XXS del mismo autor | 27B (nominal) | No especificado; probado a 202K | 0,1137 | 14/17 | Apache-2.0 | GGUF; funciona en cualquier build de llama.cpp y cualquier GPU |
| Quant "daily driver" del mismo autor | 27B (nominal) | No especificado; probado a 202K (70,1 tok/s, 51,7 %) | 0,0523 | 14/17 | Apache-2.0 | GGUF; tamaño no indicado en la model card |
| Base Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | 27B (nominal) | No disponible | 0 (referencia) | No disponible | Apache-2.0 | Pesos BF16 originales |

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, otros 24-32B abliterated o cuantizaciones GGUF equivalentes), porque la búsqueda web no devolvió resultados relevantes.

## Limitaciones y advertencias

- Modelo abliterated: cumplirá con más facilidad peticiones dañinas de lo que pretende el alineamiento original. El propio autor declara que está pensado para investigación local y uso personal, y que la responsabilidad de uso recae en el operador.
- No se ha ejecutado el protocolo de 450 casos de refusal-bench sobre esta cuantización concreta; no hay datos de tasa de rechazo para este artefacto.
- Dependencia dura de hardware y software: los tensores NVFP4 exigen GPU Blackwell y una build reciente de llama.cpp con FP4 nativo. En cualquier otro entorno el modelo no arrancará correctamente.
- Contexto largo: aunque se prueban 202K tokens, en aguja profunda este quant rinde por debajo del daily driver del autor (62,4 frente a 70,1 tok/s y 46,2 % frente a 51,7 % de precisión). Para cargas de contexto muy largo conviene elegir otra tier.
- Riesgo de alucinación: no hay datos publicados de tasas de alucinación ni de calibración para esta cuantización; las baterías del autor no miden ese aspecto.
- Idiomas soportados: no documentados. No se puede asegurar cobertura multilingüe más allá de lo que herede el base, que tampoco se especifica.
- Pérdida de fidelidad respecto a BF16: KLD de 0,0387 y perplejidad de 7,440 ± 0,114, no nulas. Para tareas que exijan máxima fidelidad hay que usar los pesos BF16 originales.
- Inconsistencia documental: la model card indica que este quant sustituye al build v8 de 16,0 GiB con KLD 0,0380, pero la tabla de métricas atribuye 0,0523 al "daily driver". No se especifica si son artefactos distintos ni cuál es el tamaño del daily driver, por lo que las comparaciones de KLD entre tiers deben tomarse con cautela.
- Ficha con 0 descargas y 0 likes en el momento de la consulta, y sin pipeline declarado: no hay validación comunitaria independiente de las métricas reportadas.
- Licencia Apache-2.0 heredada del base: permite uso comercial, pero las implicaciones legales de desplegar un modelo abliterated en producción son responsabilidad de quien lo integra.
- Reproducibilidad: todas las cifras provienen de un único harness local (RTX 5090, llama.cpp b10930). No hay mediciones independientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1105s110/Qwen3.8-27B-Blackfrost-Abliterated-SlotTuned-15G-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Tier 9,8 GiB GSQ-RCO IQ3_XXS del mismo autor: https://huggingface.co/1105s110/Qwen3.8-27B-Blackfrost-Abliterated-GSQ-RCO-IQ3_XXS-GGUF
- Colección Blackfrost-abliterated Qwen3.8-27B GGUF line (RTX 5090): https://huggingface.co/collections/1105s110/blackfrost-abliterated-qwen38-27b-gguf-line-rtx-5090-6ab14ff21d81e7b0698a0ff1
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a documentación y foros de Google Maps, sin relación con el artefacto.
