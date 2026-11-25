# 2Beyes/Aurum_4b

## Resumen
Aurum 4B v1 Uncensored es una variante del modelo Qwen3.5-4B de Alibaba Qwen en la que se ha eliminado quirúrgicamente el comportamiento de rechazo (refusal) manteniendo intactos el resto de pesos, la torre de visión y la cabeza de predicción multi-token (MTP). Lo desarrolla el usuario 2Beyes y se distribuye principalmente en formato GGUF para llama.cpp, con el objetivo declarado de ofrecer chat cotidiano y tool calling en tarjetas gráficas de 8 GB.

La arquitectura subyacente es la de Qwen3.5-4B (transformer con atención híbrida y torre de visión), con 4.326.350.848 parámetros totales según los safetensors del repositorio. La modificación consiste en aplicar únicamente la diferencia de pesos orientada a suprimir rechazos, extraída de un modelo ablacionado de la comunidad, descartando el resto de cambios de fine-tuning de ese modelo. El resultado conserva el conocimiento del modelo oficial de Qwen.

Es relevante ahora porque demuestra una técnica de edición de pesos muy selectiva (descomposición en direcciones singulares sobre proyecciones de salida de atención y FFN) aplicada a un modelo multimodal pequeño, con cuantizaciones calibradas mediante importance matrix y soporte de decodificación especulativa nativa vía MTP, lo que lo hace práctico para despliegue local en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-4B con torre de visión y cabeza MTP (multi-token prediction); atención híbrida (self_attn y linear_attn) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa -c 16384) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q4_0, Q3_K_M (GGUF); safetensors BF16 en repo hermano |
| Idiomas soportados | en (segun metadatos; tokenizer de Qwen3.5) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors BF16 (repo 2Beyes/Aurum-4B-Uncensored) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B sin reentrenamiento: conserva todos los pesos originales, la torre de visión y la cabeza de predicción multi-token. La única modificación es una edición de pesos derivada de la diferencia entre Qwen3.5-4B y el modelo insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, de la que se retiene exclusivamente la componente que elimina rechazos: las 8 direcciones singulares principales (aproximadamente el 98 % del cambio) en los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`) de las capas 4 a 31, y la dirección principal en `mlp.down_proj` solo en tensores donde representa más de la mitad del cambio. El fine-tuning de destilación del modelo de origen no se incluye.

El config, tokenizer y chat template provienen del modelo Heretic citado (mismo tokenizer que Qwen3.5). Las cuantizaciones GGUF se generaron con llama.cpp build b12289 usando importance matrix calculada sobre un blend hermano de Aurum con texto de calibración de prosa, código y chats de tool-calling. No se documentan datos de entrenamiento adicionales, RLHF ni DPO propios, ya que no hay entrenamiento más allá de la edición de pesos. La cabeza MTP permite decodificación especulativa nativa (drafting de 2 tokens) con una mejora reportada de aproximadamente 1,4x en código.

## Capacidades
- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo thinking configurable mediante `enable_thinking` en el chat template, igual que Qwen3.5.
- Tool calling / function calling, con soporte en llama.cpp mediante `--jinja`.
- Comprensión de imágenes (pipeline image-text-to-text) mediante la torre de visión original de Qwen3.5-4B y el proyector `mmproj-Aurum-4B-F16.gguf`.
- Decodificación especulativa con la cabeza MTP propia (`--spec-type draft-mtp`), con drafting óptimo de 2 tokens en la GPU de referencia.
- Comportamiento sin rechazos: 0 rechazos en 100 prompts dañinos de prueba según el autor.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.

## Casos de uso
- Asistente de chat local en GPU de 8 GB: con la cuantización Q4_K_M (2,8 GB) y el proyector de visión (0,7 GB) cabe holgadamente en una RX 6600 o RTX 3060, permitiendo conversaciones multi-turno con contexto de 16K tokens.
- Automatización de tool calling en pipelines internos: el soporte de function calling vía `--jinja` en llama.cpp permite integrarlo como agente que invoca APIs, consultas a bases de datos o scripts de automatización sin depender de servicios en la nube.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer información de capturas, formularios escaneados o gráficos y combinarla con razonamiento textual en un mismo flujo.
- Generación de código asistida en entornos de desarrollo: la decodificación especulativa MTP acelera la generación de código (hasta 79 tokens/s en Q4_K_M en la GPU de referencia), adecuada para autocompletado o revisión en IDE.
- Investigación sobre alineación y seguridad: al ser una ablación controlada con metodología documentada (direcciones singulares sobre capas concretas), sirve como caso de estudio para medir qué componentes de los pesos codifican el comportamiento de rechazo.
- Fine-tuning y merging: el repo hermano en safetensors BF16 permite ajuste fino con transformers o vLLM y fusión de adaptadores sin partir de una cuantización.
- Despliegue en entornos air-gapped: al ser Apache-2.0 y ejecutable con llama.cpp, puede distribuirse en infraestructura sin conexión externa.

## Benchmarks y rendimiento
El autor publica una comparación frente a Distill-Heretic 4B (insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, en GGUF Q4_K_M de yachen4ever), ambos en Q4_K_M, llama.cpp, thinking off, decodificación greedy y sin system prompt, con un runner propio. Los resultados numéricos concretos de esa comparación no se incluyen en el texto proporcionado (aparecen en imágenes del repositorio), por lo que no se reproducen aquí.

| Metrica | Aurum 4B | Notas |
|---|---|---|
| Rechazos en 100 prompts dañinos | 0 | Segun el autor |
| KL vs BF16 (Q4_K_M) | 0.0277 | Corpus de chat largo |
| Coincidencia top token (Q4_K_M) | 93,7 % | Frente a BF16 |
| Velocidad prosa / código (Q4_K_M, RX 6600 8 GB, Vulkan) | 57 / 79 tok/s | MTP drafting de 2 tokens |
| Mejora por MTP en código | ~1,4x | Misma salida |

No se han publicado resultados de MMLU, HumanEval, GSM8K o BFCL en forma de tabla numérica en la información disponible; el autor advierte además que sus cifras Q4 con thinking off no son comparables con las publicadas por Qwen para BF16 con thinking largo y BFCL v4.

## Requisitos de hardware
- VRAM estimada: Q3_K_M ~2,3 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; BF16 ~8,7 GB. Añadir ~0,7 GB si se usa el proyector de visión.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RX 6600 (probada por el autor con Vulkan) para Q4_K_M; A100/H100 no son necesarias y quedarían sobredimensionadas.
- Cabe en GPU de consumo: sí, desde 4 GB para Q4_K_M con contexto moderado; 8 GB permiten Q8_0 o Q4_K_M con contexto de 16K y visión.
- Opciones de despliegue: llama.cpp (llama-server, build b12289 o superior), y presumiblemente cualquier runtime compatible con GGUF; para BF16, transformers y vLLM según indica el autor. Ollama y TGI no se mencionan explícitamente.
- Latencia y throughput: 47-59 tok/s en prosa y 64-81 tok/s en código según cuantización en RX 6600 8 GB con Vulkan y MTP activo; el drafting de más de 2 tokens resultó más lento en esa GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum 4B v1 Uncensored | 4,33 B | no disponible | Apache-2.0 | GGUF, safetensors | Qwen3.5-4B con edición de rechazo; visión y MTP conservados |
| Qwen/Qwen3.5-4B | 4,33 B (aprox.) | no disponible | Apache-2.0 (base) | safetensors | Modelo oficial con rechazos y alineación original |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | 4,33 B (aprox.) | no disponible | no disponible | safetensors, GGUF (terceros) | Fine-tune de destilación de Qwen3.8 más ablación Heretic; más cambios de pesos |
| Qwen3.5-4B en GGUF de Unsloth | 4,33 B (aprox.) | no disponible | Apache-2.0 | GGUF | Referencia para el proyector de visión usado por Aurum |

## Limitaciones y advertencias
- Modelo sin censura: no rechaza peticiones dañinas (0 rechazos en 100 prompts según el autor); el despliegue en entornos con usuarios que no hayan optado por un modelo sin filtros es responsabilidad del operador.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- Idiomas: los metadatos solo declaran inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en la información disponible; el ejemplo de llama.cpp usa 16K, pero no se confirma el máximo nativo.
- La edición de pesos puede degradar sutilmente capacidades no medidas (por ejemplo, coherencia en dominios sensibles) al modificar proyecciones de atención y FFN en 28 capas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad legal del contenido generado recae en el usuario.
- El modelo depende del tokenizer y chat template de un tercero (Heretic), lo que puede introducir diferencias menores frente al template oficial de Qwen3.5.
- El soporte de tool calling requiere `--jinja` en llama.cpp; otros runtimes pueden no interpretar correctamente el template.
- Los benchmarks del autor usan un runner propio y no son directamente comparables con cifras oficiales de Qwen (BF16, thinking largo, BFCL v4).

## Enlaces
- Hugging Face (repo principal): https://huggingface.co/2Beyes/Aurum_4b
- GGUF: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Safetensors BF16: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de origen de la edición de rechazo: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- GGUF de comparación: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
