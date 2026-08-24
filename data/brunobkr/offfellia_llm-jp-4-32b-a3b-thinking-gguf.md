# Brunobkr/OFFFELLIA_llm-jp-4-32b-a3b-thinking.gguf

## Resumen

OFFFELLIA es una conversión GGUF del modelo japonés llm-jp-4-32b-a3b-thinking, desarrollado por el National Institute of Informatics (NII) de Japón y distribuido por el usuario Brunobkr. El modelo base pertenece a la familia LLM-jp-4, entrenada sobre un corpus de aproximadamente 12 trillones de tokens bajo licencia de código abierto, y destaca por superar a GPT-4o y Qwen3-8B en varios benchmarks estándar según el comunicado oficial del NII.

La conversión GGUF viene acompañada de un fork de llama.cpp denominado «llama.cpp_ Vullkan», que añade soporte nativo para aceleración AMD Vulkan (RADV), compatibilidad con arquitecturas Instella-MoE y LLM-jp-4, motor agéntico multi-turno y sistema de referencia multilingüe de 55 idiomas. El modelo es de tipo MoE con 32 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos, con una ventana de contexto de 64K tokens, orientado principalmente al japonés pero con capacidades multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con Gated Multi-Head Latent Attention |
| Parámetros totales | 32.139.028.992 (~32B) |
| Parámetros activos | ~3B (a3b) |
| Longitud de contexto | 64.000 tokens |
| Tipos de cuantización | GGUF (cuantizaciones Q4, Q5, Q8 y f16 según el archivo) |
| Idiomas soportados | Japonés (principal), multilingüe (55 idiomas en el sistema de referencias del fork) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `llm-jp-4-32b-a3b-thinking` es un MoE con 32B parámetros totales y 3B activos por token, entrenado con un corpus de aproximadamente 12 trillones de tokens de alta calidad. El tokenizador es Unigram con byte-fallback y prefijo de espacio (`add_space_prefix = true`), una configuración que el fork de Brunobkr corrige para garantizar una decodificación idéntica al tokenizador de referencia de Hugging Face, especialmente tras tokens de control como `<|channel|>` o `<|message|>`.

El fork `llama.cpp_ Vullkan` implementa además soporte para Gated Multi-Head Latent Attention (Gated MLA) con tensor de gating `attn_gate`, flujo residual FarSkip-Collective que propaga el residuo sin ruteo directamente a la siguiente capa de atención, y conversión nativa de Hugging Face a GGUF sin scripts externos. También incorpora aceleración MMVQ (matriz-vector cuantizado) para arquitecturas AMD y zero-copy para APUs con memoria unificada.

## Capacidades

- Generación de texto en japonés con alta calidad, comparable o superior a GPT-4o en benchmarks estándar según el NII.
- Modo de razonamiento (thinking) integrado, que permite respuestas razonadas paso a paso antes de la respuesta final.
- Soporte de agentes autónomos multi-turno con 6 perfiles integrados, incluyendo perfiles de localización y políglota.
- Soporte FIM (Fill-in-the-Middle) para autocompletar código en IDEs.
- Sistema de referencia multilingüe de 55 idiomas (`languages_ref`) para inyección de directrices lingüísticas.
- Capacidades de tool calling y function calling compatibles con el ecosistema llama.cpp (endpoints compatibles).
- Soporte de conversación multi-turno con contexto largo (64k tokens).

## Casos de uso

- Atención al cliente automatizada en japonés: el modelo puede gestionar conversaciones multi-turno con contexto largo de 64k tokens, lo que permite mantener el historial completo de una interacción de soporte sin truncar información relevante.
- Generación de código con autocompletado FIM: gracias al soporte nativo de Fill-in-the-Middle, puede integrarse en IDEs para autocompletar código en tiempo real, especialmente en entornos de desarrollo que requieren el procesamiento de japonés en comentarios y documentación.
- Agentes autónomos para automatización de tareas: el motor agéntico multi-turno con 6 perfiles permite construir agentes que ejecutan secuencias de acciones complejas con razonamiento paso a paso.
- Traducción y localización multilingüe: el sistema de 55 idiomas permite inyección de directrices lingüísticas y alineación de frases para tareas de traducción automática.
- Inferencia en hardware AMD de bajo consumo: gracias a la aceleración Vulkan nativa, puede desplegarse en APUs y GPUs Radeon sin necesidad de CUDA, lo que reduce costes de hardware.
- Investigación académica en PNL japonesa: al ser un modelo abierto con datos de entrenamiento públicos, es adecuado para investigación en procesamiento del lenguaje natural japonés y comparación de benchmarks.

## Benchmarks y rendimiento

Según el comunicado del NII, el modelo `llm-jp-4-32b-a3b-thinking` supera a GPT-4o y Qwen3-8B en varios benchmarks estándar, pero no se han publicado en la información disponible las cifras concretas de MMLU, HumanEval, GSM8K o benchmarks similares. No se dispone de resultados de benchmarks específicos para esta conversión GGUF.

## Requisitos de hardware

- VRAM estimada: 64,3 GB para la versión completa (según llm-explorer), lo que requiere GPUs de gama alta con 80 GB como la A100/H100 o múltiples GPU en paralelo.
- Para cuantizaciones Q4/Q5, la huella de memoria se reduce significativamente (el repositorio ocupa 55,7 GB en total), permitiendo su ejecución en GPU de 24-32 GB como la RTX 4090 o la A6000.
- El fork `llama.cpp_ Vullkan` está optimizado para GPUs AMD con soporte Vulkan/RADV, incluyendo APUs con memoria unificada (UMA) gracias a zero-copy host memory.
- Opciones de despliegue: llama.cpp (con el fork Vullkan), servidor integrado compatible con endpoints, y WebUI SvelteKit + Vite incluida.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| llm-jp-4-32b-a3b-thinking (este) | 32B totales / 3B activos | 64k | Supera a GPT-4o y Qwen3-8B en varios benchmarks | no disponible |
| Qwen3-8B | 8B denso | 128K | Inferior en benchmarks japoneses según NII | Apache 2.0 |
| GPT-4o | no público | 128K | Inferior en benchmarks japoneses según NII | Propietaria |

## Limitaciones y advertencias

- La licencia del modelo no está especificada en la información disponible, por lo que se recomienda consultar la documentación oficial de LLM-jp antes de usarlo en producción comercial.
- El modelo está entrenado principalmente con datos en japonés; su rendimiento en otros idiomas puede ser inferior al de modelos especializados.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o información factual de baja frecuencia.
- El repositorio GGUF tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y no ha sido validada por la comunidad.
- La fecha de creación (2026-08-23) y la del comunicado del NII (2026-04-03) sugieren que es un modelo muy reciente; es posible que aún no existan evaluaciones independientes exhaustivas.
- El fork `llama.cpp_ Vullkan` es una modificación no oficial de llama.cpp y puede no ser estable en todos los entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Brunobkr/OFFFELLIA_llm-jp-4-32b-a3b-thinking.gguf
- Conversión GGUF oficial de llm-jp: https://huggingface.co/llm-jp/llm-jp-4-32b-a3b-thinking-gguf
- Conversión GGUF de mmnga-o: https://huggingface.co/mmnga-o/llm-jp-4-32b-a3b-thinking-gguf
- Comunicado del NII: https://www.nii.ac.jp/en/news/release/2026/0403.html
- Página del modelo en ModelScope: https://www.modelscope.cn/models/llm-jp/llm-jp-4-32b-a3b-thinking/summary
- Ficha en LLM Explorer: https://llm-explorer.com/model/llm-jp%2Fllm-jp-4-32b-a3b-thinking,77m1zzzM4iUisoCJaHgEI9
