# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-BUDGET-GGUF

## Resumen

Esta ficha describe un modelo derivado de la familia Qwen3.8-27B, publicado por el usuario esatapedico como una conversión GGUF de bajo presupuesto del tune comunitario «TWIN-TURBO Fable Cold Fusion 709-L Uncensored» de DavidAU. El modelo base es un transformer denso de 27B de parámetros con arquitectura híbrida declarada (Gated DeltaNet más Gated Attention), torre de visión nativa y una ventana de contexto nativa de 262.144 tokens. La versión que nos ocupa es una cuantización NVFP4 (tipo GGML 40) del backbone de 448 tensores, sin cabeza MTP de decodificación especulativa, pensada para servir el modelo en una única GPU Blackwell de 16 GB de VRAM.

El problema que resuelve es de despliegue: el backbone NVFP4 nativo ocupa un espacio reducido y permite ejecutar un modelo de 27B en hardware de consumo, a costa de sacrificar precisión en la cabeza de salida y en los embeddings. El repositorio contiene dos f Ficheros: BUDGET (14,72 GB, lm_head Q3_K y token_embd Q2_K) y STARVED (14,59 GB, ambos en Q2_K). Ambos comparten el mismo backbone NVFP4 byte a byte, con 64 capas y sin bloque MTP (`nextn_predict_layers=0`).

La relevancia actual es doble: por un lado, demuestra la viabilidad de servir modelos multimodales de 27B con contexto largo en tarjetas de 16 GB; por otro, es un ejemplo de la fragilidad del ecosistema de tunes comunitarios, donde la model card mezcla afirmaciones de rendimiento («TWIN-TURBO», «709-L», «Cold Fusion») con ingeniería real de cuantización. El número de descargas (570) y likes (1) indica una adopción marginal, y conviene tratar las capacidades declaradas con cautela hasta verificarlas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido declarado: Gated DeltaNet + Gated Attention; 64 capas; torre de visión nativa; sin cabeza MTP |
| Parametros totales | 26.895.998.720 (~26,9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (declarado) |
| Tipos de cuantizacion | NVFP4 nativo (GGML tipo 40, W4A16) en backbone; BUDGET: lm_head Q3_K + token_embd Q2_K; STARVED: lm_head Q2_K + token_embd Q2_K |
| Idiomas soportados | en, multilingual (sin lista detallada) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (1.107 tensores por fichero; 448 tensores NVFP4 + 657 F32 de normas, escalas y puertas + 2 tensores de cabeza) |

## Arquitectura y entrenamiento

La model card declara una arquitectura híbrida de 27B densos con Gated DeltaNet y Gated Attention, 64 capas, torre de visión nativa y contexto de 262.144 tokens. Es una arquitectura de atención lineal combinada con atención clásica, orientada a reducir el coste de memoria del contexto largo. El modelo original (DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored) es un tune comunitario sobre Qwen3.8-27B, con un ajuste «709-L» y etiqueta «Uncensored»; no se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO.

El proceso de cuantización sí está detallado: auto-cuantización del base BF16 a NVFP4 con tensores comprimidos (W4A16, todas las capas lineales, visión, atención lineal, lm_head y MTP en BF16, sin calibración), conversión a GGUF y construcción de cada fichero sobre el backbone NVFP4 compartido, variando solo la precisión de lm_head y token_embd. Se eliminaron los 15 tensores MTP, dejando 1.107 tensores por fichero con `block_count=64` y `nextn_predict_layers=0`. La innovación destacable es la preservación byte a byte del backbone NVFP4 (verificada por SHA-256 por tensor) y la eliminación de la cabeza de decodificación especulativa para liberar VRAM. No hay decodificación especulativa en estas variantes.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat corregida para tool calling (actualizaciones del 12 y 15 de septiembre de 2026).
- Razonamiento en modo «reasoning»: el autor recomienda temperatura 0,6-0,7 para tool calling en modo razonamiento; el modo instruct para tool calling se describe como pobre.
- Tool calling / function calling: soportado con la plantilla corregida (preserva `tool_calls`, guardas del escáner `REASON` y guarda de argumentos de tipo string).
- Visión multimodal: torre de visión nativa, con proyector de visión de Qwen3.8 emparejado; la plantilla corrige el renderizado de tokens de visión en mensajes de imagen y vídeo.
- Capacidades multilingües: declaradas (en, multilingual), sin lista de idiomas ni evaluación.
- Contexto largo: ventana nativa de 262.144 tokens, útil para documentos extensos y conversaciones largas.
- Sin decodificación especulativa: estas variantes no incluyen la cabeza MTP, por lo que no hay «draft-mtp» ni aceleración por drafter.

## Casos de uso

- Asistente conversacional local en GPU de 16 GB: con 14,6-14,7 GB de pesos, el modelo cabe en una RTX 5080/5070 Ti de 16 GB o en una GPU Blackwell de 16 GB, permitiendo un chatbot privado sin depender de la nube. Adecuado por el tamaño ajustado y la ventana de 262.144 tokens.
- Análise de documentos largos: contratos, informes o transcripciones de hasta cientos de miles de tokens caben en el contexto nativo; útil para resumen, extracción de entidades y preguntas sobre el documento.
- Automatización de atención al cliente: conversaciones multi-turno con historial largo gracias al contexto extendido; requiere validar la calidad del tune «Uncensored» antes de producción.
- Procesamiento de imágenes en pipelines internos: la torre de visión nativa permite describir capturas, extraer texto de imágenes o clasificar contenido visual, con la plantilla multimodal corregida.
- Tool calling en agentes locales: integración con APIs internas mediante function calling en modo razonamiento; útil para prototipos de agentes que ejecutan acciones acotadas.
- Experimentación e investigación: banco de pruebas para estudiar el impacto de cuantizar la cabeza de salida (Q3_K frente a Q2_K) y la eliminación de MTP en la calidad de salida, con backbone idéntico y comparación controlada.
- Despliegue en entornos con restricciones de privacidad: inferencia totalmente local con llama.cpp, sin enviar datos a terceros, para datos sensibles que no pueden salir de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricricas con otras variantes; solo afirma que existen «accuracy trade-offs» frente a los niveles MTP superiores, sin cuantificarlos.

## Requisitos de hardware

- VRAM estimada: 14,59 GB (STARVED) a 14,72 GB (BUDGET) solo para pesos; hay que sumar KV cache y overhead del runtime, por lo que en una tarjeta de 16 GB el margen es estrecho y conviene limitar la longitud de contexto efectiva.
- GPU recomendadas: tarjetas Blackwell de 16 GB (RTX 5080, RTX 5070 Ti, RTX 5070, según VRAM); el autor menciona específicamente «single-16GB Blackwell card» y sm_120. En Ampere/Ada de 16 GB (RTX 4080, 4070 Ti Super) la viabilidad depende del soporte NVFP4 del build de llama.cpp.
- Cabe en GPU de consumo: sí, en modelos de 16 GB de VRAM con soporte NVFP4; no cabe en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp reciente con soporte NVFP4 (tipo GGML 40), sin ruta `draft-mtp`; Ollama u otros runners solo si su build subyacente soporta NVFP4. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles; no se publican medidas. La ausencia de MTP implica renunciar a la aceleración por decodificación especulativa de los niveles superiores de la familia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BUDGET/STARVED) | ~26,9B | 262.144 | NVFP4 + Q2/Q3 en cabezas, GGUF | apache-2.0 | Hugging Face, 570 descargas |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (base) | ~26,9B | 262.144 | BF16 / NVFP4 con MTP | apache-2.0 (según repo derivado) | Hugging Face |
| esatapedico/…-NVFP4-GGUF (familia MTP) | ~26,9B | 262.144 | NVFP4 con cabeza MTP | apache-2.0 | Hugging Face |
| Qwen3.8-27B original (referencia de arquitectura) | ~27B | 262.144 (declarado) | BF16 y múltiples GGUF | no disponible en esta información | Hugging Face |

La comparación con modelos de otras familias (Llama, Mistral, Gemma) no está disponible en la información proporcionada; no se dispone de datos de rendimiento para establecer una comparativa numérica fiable.

## Limitaciones y advertencias

- Riesgo de alucinación: no hay evaluación publicada; los tunes comunitarios «Uncensored» suelen reducir el filtrado y aumentar la probabilidad de contenido no verificado.
- Pérdida de precisión: lm_head en Q3_K (BUDGET) o Q2_K (STARVED) y token_embd en Q2_K degradan la calidad de salida frente al base BF16; el autor reconoce «accuracy trade-offs» sin cuantificarlos.
- Sin decodificación especulativa: la eliminación de la cabeza MTP reduce el rendimiento en tokens por segundo respecto de los niveles MTP de la familia.
- Contexto efectivo limitado por VRAM: aunque el contexto nativo es de 262.144 tokens, en 16 GB de VRAM el KV cache reduce drásticamente la longitud utilizable; hay que ajustar `n_ctx` a la memoria disponible.
- Tool calling frágil: el propio autor indica que el modo instruct para tool calling «stays poor» y recomienda modo razonamiento con temperatura 0,6-0,7; no apto para producción crítica sin validación.
- Idiomas: solo se declaran en y multilingual, sin lista ni evaluación; el rendimiento en castellano no está verificado.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base es un tune comunitario cuya procedencia y términos conviene revisar; la licencia del Qwen3.8 original no se detalla en la información disponible.
- Madurez del ecosistema: depende de builds de llama.cpp con soporte NVFP4 (tipo GGML 40) y sm_120; en hardware no Blackwell o runners sin soporte, el modelo puede no cargar.
- Trazabilidad: el repositorio mezcla etiquetas y afirmaciones de rendimiento no verificadas; tratar la model card como material de referencia, no como especificación validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-BUDGET-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Familia NVFP4 con MTP: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF
- Sitio del autor: https://www.esatapedico.com
- llama.cpp (soporte NVFP4): no se proporciona enlace específico en la información disponible
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
