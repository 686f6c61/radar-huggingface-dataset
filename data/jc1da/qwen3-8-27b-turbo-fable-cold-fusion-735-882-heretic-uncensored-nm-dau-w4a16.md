# JC1DA/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16

## Resumen

Este modelo es una cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) del fine-tune `DavidAU_Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollado por el usuario JC1DA. El modelo base, creado por DavidAU, es un ajuste fino de Qwen3.8-27B orientado a generación de texto sin censura, roleplay y escritura creativa, con capacidades multimodales (texto, imagen y vídeo). La cuantización emplea AutoRound v0.12.3 con formato GPTQ compatible, lo que permite ejecutar el modelo en hardware de consumo con un consumo de VRAM reducido.

La arquitectura subyacente es Qwen3.8-27B, un modelo denso híbrido de 27 000 millones de parámetros con atención lineal en 48 de sus 64 capas, atención completa en las 16 restantes, un codificador de visión y una cabeza de predicción multi-token (MTP) para decodificación especulativa. La ventana de contexto nativa es de 262 144 tokens, extensible a 1 millón. Este modelo es relevante porque combina un fine-tune especializado en creatividad y roleplay con una cuantización eficiente que lo hace viable en GPUs de gama media, manteniendo la compatibilidad con el ecosistema GPTQ y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (Qwen3.8-27B) |
| Parametros totales | 27B (segun model card; el safetensors cuantizado almacena ~6,28B de parametros en 4 bits) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (extensible a 1M) |
| Tipos de cuantizacion | W4A16 (4-bit int, 16-bit fp), GPTQ compatible, AutoRound v0.12.3, group size 128, simetrico |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ compatible, convertible a GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal (linear attention) para reducir el coste computacional en contextos largos, mientras que las 16 restantes usan atención completa (full attention) para preservar la calidad en tareas de razonamiento. Incluye un codificador de visión (Qwen3.5 Vision encoder) que permite procesar imágenes y vídeo, y una cabeza MTP (multi-token prediction) que actúa como borrador en decodificación especulativa, acelerando la generación. El fine-tune de DavidAU se centra en eliminar restricciones de contenido (uncensored), potenciar el roleplay y la escritura creativa, y mejorar el rendimiento en razonamiento y análisis.

La cuantización W4A16 se realizó con AutoRound v0.12.3 sobre el dataset NeelNanda/pile-10k, con 256 muestras de calibración, longitud de secuencia de 4096 tokens y 512 iteraciones. Se mantuvieron en FP16 las capas de proyección de atención lineal (`linear_attn.in_proj_a` y `in_proj_b`), los embeddings, todas las capas visuales, las capas MTP y la cabeza de salida (`lm_head`), lo que preserva la calidad en las partes más sensibles del modelo.

## Capacidades

- Generación de texto libre con estilo creativo y sin censura, orientado a roleplay, narrativa y diálogo.
- Razonamiento y análisis de instrucciones complejas, gracias a la combinación de atención lineal y completa.
- Procesamiento multimodal: entrada de texto, imágenes y vídeo mediante el codificador de visión Qwen3.5.
- Soporte de decodificación especulativa mediante la cabeza MTP, que acelera la generación en entornos compatibles.
- Compatible con tool calling y function calling, al heredar las capacidades de Qwen3.8 (no verificado explícitamente en la model card, pero implícito en la arquitectura).
- Conversación multi-turno con contexto largo de hasta 262K tokens, adecuado para sesiones extensas o documentos largos.
- Generación de código y asistencia en programación, aunque no es su enfoque principal.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener personajes coherentes y tramas complejas durante largas sesiones, gracias a su ventana de 262K tokens y su entrenamiento específico en escritura creativa. Se usaría con plantillas de chat y parámetros de temperatura alta (1.0) para variedad.
- Asistente de escritura creativa: genera borradores de cuentos, poemas o guiones con estilo literario, y puede revisar o continuar textos existentes. Su naturaleza "uncensored" permite explorar temas que otros modelos rechazan.
- Análisis de documentos extensos con soporte visual: al aceptar imágenes y vídeo, puede resumir o extraer información de presentaciones, capturas o vídeos, manteniendo el contexto de todo el documento.
- Generación de código en entornos de desarrollo: aunque no es su especialidad, puede asistir en tareas de programación con contexto largo, por ejemplo, revisar un repositorio completo o generar funciones a partir de especificaciones.
- Agente conversacional para atención al cliente: con tool calling y contexto largo, puede gestionar interacciones complejas con historial extenso, aunque su falta de censura requiere moderación adicional.
- Investigación académica en IA generativa: como modelo de referencia para estudiar el impacto de la cuantización 4-bit en tareas creativas y de razonamiento, comparando con la versión sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del modelo incluye las cifras "735-882", que en otros fine-tunes de DavidAU se refieren a puntuaciones ARC-c y ARC-e, pero no hay datos confirmados para esta versión cuantizada. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: ~14 GB como mínimo con optimización de caché KV, 16 GB para uso cómodo, 24 GB o más para contexto completo y generaciones largas.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), o GPUs AMD Radeon con soporte Day 0 (según el blog de AMD).
- Compatible con hardware AMD Ryzen AI Max y Radeon mediante LM Studio y Lemonade.
- Opciones de despliegue: transformers (carga directa con `device_map="auto"`), vLLM (compatible con GPTQ), llama.cpp/llama-server (convertir a GGUF con `convert_hf_to_gguf.py`), y LM Studio.
- Latencia y throughput: no disponibles; la cuantización 4-bit y la atención lineal reducen el coste por token, y la cabeza MTP acelera la decodificación especulativa en entornos que la soporten.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache-2.0 | Generalista, multimodal |
| DavidAU_Qwen3.8-27B-TURBO-Fable-Cold-Fusion (base) | 27B | 262K | FP16 | Apache-2.0 | Creativo, uncensored, roleplay |
| Este modelo (W4A16) | 27B | 262K | W4A16 GPTQ | Apache-2.0 | Creativo, uncensored, eficiente |
| Qwen3-30B-A3B (MoE) | 30B (3B activos) | 128K | Varias | Apache-2.0 | Generalista, eficiente en activación |

La comparativa se basa en características declaradas; no hay benchmarks públicos que permitan comparar rendimiento real. Este modelo se distingue por su cuantización 4-bit y su orientación a creatividad sin censura, mientras que el original Qwen3.8-27B es más generalista y el MoE de Qwen3-30B ofrece menor coste por token en activación.

## Limitaciones y advertencias

- Solo soporta inglés; no hay garantía de buen rendimiento en otros idiomas.
- La naturaleza "uncensored" implica que puede generar contenido ofensivo, ilegal o inapropiado; no es adecuado para aplicaciones comerciales sin moderación.
- La cuantización W4A16 puede degradar ligeramente la calidad en tareas de razonamiento complejo o generación de código, comparada con la versión FP16.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado sin censura puede acarrear responsabilidades legales.
- El contexto de 262K tokens requiere hardware con suficiente VRAM; en GPUs de 16 GB el contexto práctico será menor.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/JC1DA/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16)
- [Modelo base de DavidAU](https://huggingface.co/DavidAU_Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- [Repositorio de AutoRound](https://github.com/autoground/auto-round)
- [Página de Qwen3.8 en HuggingFace](https://huggingface.co/Qwen)
- [Recetas vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Blog de AMD sobre soporte de Qwen3.8 27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Ficha del modelo en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau)
