# rax4901/Ornith-1.5-122B-Uncensored-GGUF

## Resumen

Ornith 1.5 122B Uncensored es una cuantización GGUF "abliterada" del modelo Ornith 1.5 122B, desarrollada por el usuario rax4901 con cuantización de AtomicChat. El modelo base, Ornith 1.5 122B de Ornith AI, es un modelo MoE de arquitectura híbrida basado en la familia Qwen3.5 MoE, con 124.635.206.144 parámetros totales (unos 122B) y 10B activos por token. La variante "Uncensored" proyecta fuera de los pesos la dirección de rechazo (refusal direction) del modelo original, reduciendo las negativas del 93,8 % al 1,2 % en prompts dañinos de JailbreakBench, manteniendo MMLU prácticamente intacto (83,65 % → 83,90 %).

Este modelo es relevante porque permite ejecutar localmente, sin rechazos y con rendimiento prácticamente idéntico al original, un MoE grande con multimodalidad declarada (image-text-to-text), mediante layouts "Atomic Dynamic" que comprimen solo los expertos enrutados y dejan el resto en q8_0. Es especialmente interesante para usuarios de llama.cpp que necesitan inferencia eficiente con decodificación especulativa vía el head de multi token prediction.

Cabe destacar que se trata de un modelo sin salvaguardas de seguridad: la abliteration elimina deliberadamente los mecanismos de rechazo, lo que conlleva riesgos éticos y legales importantes. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (basado en Qwen3.5 MoE, con atención y linear-attention mixtas, 48 bloques) |
| Parametros totales | 124.635.206.144 (124,6B) |
| Parametros activos | 10B por token |
| Longitud de contexto | 32768 en el ejemplo de ejecución (contexto máximo del modelo: no disponible) |
| Tipos de cuantizacion | Atomic Dynamic: AD-IQ4_XS_S (expertos q4_k/iq4_xs, resto q8_0, 71,2 GB) y AD-IQ3_XXS (expertos iq3_s/iq3_xxs, resto q8_0, 54,3 GB), con imatrix recalculada sobre el modelo editado |
| Idiomas soportados | no disponible (la abliteration se aplicó con prompts en inglés y ruso) |
| Licencia | MIT |
| Formato de pesos | GGUF (38 shards en la variante AD-IQ4_XS_S), con mmproj para visión |

## Arquitectura y entrenamiento

El modelo base es un MoE de 48 bloques con 256 expertos enrutados más un experto compartido, derivado de la arquitectura Qwen3.5 MoE. Combina atención estándar con mixers de atención lineal a lo largo de los bloques, y cuenta con un head de multi token prediction (MTP) que permite decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`. El pipeline declarado es image-text-to-text, con un proyector de visión (`mmproj-*.gguf`) heredado sin cambios del modelo original.

Sobre el modelo original se aplicó una abliteration de precisión: se calculó la dirección de rechazo como diferencia de medias del residual stream en el último token del prompt (416 prompts dañinos frente a 416 inofensivos en inglés, y 128 frente a 128 en ruso, con thinking activado y desactivado), y se eliminó la componente mediante la proyección `W' = W - r rᵀW` en las proyecciones de salida de cada bloque, la down projection del experto compartido y las down projections de los 256 expertos enrutados. El router, los embeddings y el head MTP quedaron intactos. La edición añade una KL media de 0,027 respecto al original (una dirección aleatoria del mismo tamaño añade 0,035). No hay información sobre el proceso de entrenamiento del modelo base (tokens, datasets, RLHF/DPO).

## Capacidades

- Generación de texto conversacional con thinking mode activado por defecto (desactivable por petición con `enable_thinking: false`).
- Entrada de imagen (pipeline image-text-to-text) mediante el proyector de visión original; no probada en estos ficheros cuantizados.
- Tool calling / function calling: la model card indica que no se ve afectado por la edición.
- Contexto largo: sin degradación declarada respecto al original.
- Razonamiento y conocimiento general: MMLU de 83,90 % tras la edición.
- Multilingüe: la abliteration se validó en inglés y ruso; el resto de idiomas no está documentado.
- Decodificación especulativa vía multi token prediction head compatible con llama.cpp.

## Casos de uso

- Investigación en seguridad y alineación de modelos: al eliminar la dirección de rechazo de forma medible (con KL y benchmarks de rechazo publicados), sirve como sujeto de estudio para técnicas de abliteration y su impacto en capacidades.
- Asistentes locales sin filtros para usuarios avanzados: ejecución en llama.cpp con contexto de 32k tokens y thinking mode, útil para flujos de trabajo donde el usuario asume la responsabilidad del contenido generado.
- Chatbot de dominio con RAG: la ventana de 32768 tokens del ejemplo permite inyectar documentos recuperados junto a la conversación sin degradación declarada de contexto largo.
- Agentes con tool calling: al no afectarse las llamadas a herramientas, puede integrarse en pipelines de agentes multi-paso con ejecución local de funciones.
- Procesamiento multimodal local: entrada de imagen vía mmproj para descripción, OCR o análisis de capturas, aunque sin validación publicada en estos ficheros.
- Inferencia de alto throughput en hardware moderado: con solo 10B de parámetros activos por token y cuantización AD-IQ4_XS_S (71,2 GB), cabe en configuraciones multi-GPU de gama alta o en Mac Studio con memoria unificada, con decodificación especulativa MTP para reducir latencia.
- Red teaming y pruebas de robustez: útil para evaluar cómo responden sistemas aguas abajo cuando el modelo subyacente no impone rechazos.

## Benchmarks y rendimiento

Datos publicados en la model card sobre la propia edición:

| Métrica | Original | Esta edición |
|---|---:|---:|
| MMLU (2000 preguntas) | 83,65 % | 83,90 % (McNemar p = 0,72) |
| JailbreakBench (81 prompts dañinos), rechazados | 93,8 % | 1,2 % |
| Prompts de red teaming en ruso, rechazados | 43 % | 0 % |
| Rechazos con thinking activado (30 prompts) | 27 de 30 | 0 de 30 |
| XSTest (prompts seguros rechazados injustamente) | 2,8 % | 0 % |

Calidad de las cuantizaciones (builds planos del modelo original frente a BF16):

| Build | KL | top-1 |
|---|---:|---:|
| AD-IQ4_XS_S | 0,0274 | 93,52 % |
| AD-IQ3_XXS | 0,0821 | 88,84 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks comparativos frente a modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: 71,2 GB en disco para AD-IQ4_XS_S y 54,3 GB para AD-IQ3_XXS; a esto hay que sumar la KV cache del contexto (con 32768 tokens, varios GB adicionales según configuración).
- GPU recomendadas: 2x RTX 4090 (48 GB) no bastan para la variante de 71,2 GB; se requieren 3x RTX 4090, 2x A100 80GB, 2x H100, o una Mac con memoria unificada de 96 GB o más (Mac Studio M2/M3 Ultra). La variante AD-IQ3_XXS (54,3 GB) cabe en 2x RTX 3090/4090 con offload parcial, o en una Mac de 64 GB con ajustes.
- Consumer GPU: solo viable en multi-GPU de gama alta o con descarga a CPU; no cabe en una única GPU de consumo.
- Despliegue: llama.cpp (llama-server, formato soportado nativamente), con soporte de Ollama y LM Studio para GGUF en principio posible; no hay información sobre vLLM o TGI para estos ficheros GGUF.
- Rendimiento: al ser MoE con 10B activos por token, el throughput por token es comparable a un denso de ~10B pese al tamaño total; la model card no publica tokens/segundo concretos. Se recomienda `--spec-type draft-mtp` para acelerar la generación.

## Comparativa con modelos similares

| Característica | Ornith 1.5 122B Uncensored | Ornith 1.5 122B (cuants AtomicChat) | Qwen3.5 MoE (base original) |
|---|---|---|---|
| Parametros totales | 124,6B | 124,6B | 124,6B |
| Parametros activos | 10B | 10B | 10B |
| Cuantización | AD-IQ4_XS_S / AD-IQ3_XXS + abliteration | AD-Q4_K-IQ4_XS / AD-IQ3_S-IQ3_XXS | BF16 (safetensors) |
| MMLU | 83,90 % | 83,65 % (original: 83,65 %) | 83,65 % |
| Rechazos (JailbreakBench) | 1,2 % | 93,8 % | 93,8 % |
| Licencia | MIT | MIT | no disponible |
| Formato | GGUF | GGUF | safetensors |

## Limitaciones y advertencias

- Al ser un modelo abliterado, no rechaza contenido dañino: su uso para generar contenido ilegal, perjudicial o no ético es responsabilidad exclusiva del usuario y puede ser ilegal según jurisdicción.
- Riesgo de alucinación: no documentado específicamente, pero inherente a modelos de lenguaje de este tipo; la edición no lo modifica.
- La entrada de imagen no fue probada en estos ficheros cuantizados; el proyector de visión se incluye sin cambios pero su funcionamiento no está validado.
- La aceptación del draft del head MTP no fue medida sobre los ficheros editados.
- Idiomas: la abliteration se calibró en inglés y ruso; el comportamiento en otros idiomas no está documentado.
- La licencia MIT no impone restricciones comerciales, pero el modelo base Ornith 1.5 122B podría tener términos propios no documentados aquí; conviene verificar ornith-ai/Ornith-1.5-122B.
- La cuantización AD-IQ3_XXS implica pérdida medible (top-1 del 88,84 %, KL 0,0821); para máxima fidelidad usar AD-IQ4_XS_S.
- Descargas muy bajas (429) y ausencia de validación comunitaria amplia: usar con cautela en producción.

## Enlaces

- Repositorio del modelo (GGUF Uncensored): https://huggingface.co/rax4901/Ornith-1.5-122B-Uncensored-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Cuantizaciones originales de AtomicChat: https://huggingface.co/AtomicChat/Ornith-1.5-122B-GGUF
- Atomic Chat (plataforma de despliegue): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
