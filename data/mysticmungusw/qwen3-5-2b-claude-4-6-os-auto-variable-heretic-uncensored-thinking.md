# MysticMungusW/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING es un ajuste fino (fine-tune) del modelo denso Qwen3.5-2B de Alibaba Qwen, publicado por el usuario MysticMungusW en Hugging Face. El ajuste se realizó mediante Unsloth sobre cuatro conjuntos de datos derivados de Claude ("Claude-4.6-OS"), con el objetivo de mejorar razonamiento y generación de texto, y posteriormente se le aplicó una técnica de "abliteración" o eliminación de alineamiento de seguridad (etiquetada como HERETIC) que elimina las negativas del modelo ante peticiones sensibles.

El modelo conserva la arquitectura multimodal del Qwen3.5-2B original (image-text-to-text), con aproximadamente 2.213 millones de parámetros en formato bfloat16 y un peso total de repositorio de 4,4 GB. Está orientado a escritura creativa, ficción, roleplay y generación de tramas, con modo "thinking" de estilo Claude y una ventana de contexto declarada de 256k tokens. Su relevancia es acotada: se trata de un modelo de nicho, sin descargas ni valoraciones en el momento de la ficha, pensado para usuarios que priorizan la ausencia de filtros sobre la seguridad alineada.

La licencia declarada es Apache 2.0, heredada del modelo base, y los idiomas soportados son inglés y chino. No se han publicado resultados de benchmarks independientes ni comparativas externas; los únicos datos de rendimiento provienen de la propia model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Qwen3.5-2B con arquitectura híbrida Gated Delta Networks según la model card del modelo base |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según el autor) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); el autor recomienda q4ks (no imatrix) o IQ3S (imatrix); se mencionan GGUF, EXL2, AWQ, GPTQ y HQQ como formatos de las versiones fuente del autor |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); existen conversiones GGUF y otros cuantizados según el autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso multimodal de Alibaba Qwen que, según la documentación del modelo base incluida en la model card, emplea una "arquitectura híbrida eficiente" basada en Gated Delta Networks combinada con mecanismos de atención, y fue entrenado con fusión temprana de tokens multimodales (visión y lenguaje). El ajuste fino se realizó con Unsloth sobre hardware local, utilizando cuatro conjuntos de datos derivados de Claude (Claude-4.6-OS), con la intención declarada de mantener el entrenamiento "suave" para no degradar los benchmarks del modelo raíz.

Tras el ajuste se aplicó un proceso de "Heretic'ing", es decir, una abliteración que elimina la alineación de seguridad y las negativas del modelo. El autor afirma que el resultado mejora el razonamiento y la generación respecto al modelo base en la mayoría de benchmarks, y que el "tamaño" del razonamiento se ha reducido mediante el entrenamiento, produciendo bloques de pensamiento de estilo Claude en la mayoría de los casos. No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon RLHF o DPO. Las porciones de vídeo del modelo no fueron probadas según el autor.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" de estilo Claude, con mezcla de comportamiento Claude/Qwen según la complejidad de la tarea.
- Comprensión de imágenes (image-text-to-text); el autor indica que la visión funciona tras el nuevo entrenamiento, aunque no se probaron las capacidades de vídeo.
- Escritura creativa: ficción, ciencia ficción, romance, generación de tramas y subtramas, continuación de escenas y roleplay.
- Estilo de prosa "vívido" enfatizado en el ajuste fino.
- Multilingüe limitado a inglés y chino.
- Sin filtros de seguridad: responde a peticiones que el modelo base rechazaría.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo puede mantener coherencia en relatos extensos gracias a su ventana de contexto de 256k tokens, adecuado para novelas por entregas o sagas con múltiples hilos argumentales.
- Roleplay conversacional sin restricciones: pensado para plataformas como Silly Tavern, KoboldCpp o text-generation-webui, donde el autor recomienda un smoothing_factor de 1,5 para suavizar la generación.
- Generación de tramas y subtramas: útil en herramientas de asistencia a guionistas que necesitan lluvias de ideas rápidas sobre premisas, giros y arcos narrativos.
- Prototipado de aplicaciones multimodales: al ser un modelo de 2B con entrada de imagen, sirve para validar pipelines image-text-to-text en fase de desarrollo sin coste elevado de infraestructura.
- Investigación sobre alineación y seguridad: su naturaleza abliterada lo convierte en un caso de estudio para analizar cómo la eliminación de alineamiento afecta al comportamiento y a los benchmarks.
- Fine-tuning posterior específico de dominio: su tamaño reducido y licencia Apache 2.0 permiten reajustarlo sobre datos propios para tareas de escritura o conversación en inglés o chino.
- Experimentación con decodificación y muestreo: el autor documenta ajustes de samplers (rep pen 1,0–1,15, smoothing cuadrático) para explorar configuraciones de generación.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (ambos modelos son variantes HERETIC):

| Benchmark | Este modelo | Qwen3.5-2B-Thinking qx86-hi |
|---|---|---|
| ARC | 0,366 | 0,348 |
| ARC/e | 0,420 | 0,502 |
| BoolQ | 0,713 | 0,635 |
| HellaSwag | 0,538 | 0,461 |
| OpenBookQA | 0,340 | 0,338 |
| PIQA | 0,683 | 0,682 |
| Winogrande | 0,579 | 0,571 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible. Los datos anteriores proceden exclusivamente del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- En cuantización q4ks o IQ3S, los pesos bajan a un rango aproximado de 1,2–1,5 GB, permitiendo inferencia en GPUs consumer de 4–6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para bfloat16 con contexto largo; A100/H100 no son necesarias para un modelo de 2B, pero permiten contextos de 256k tokens con mayor holgura.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en cuantización, y en 8 GB o más en bfloat16 con contexto corto.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según el modelo base), llama.cpp/Ollama para GGUF, text-generation-webui con llama_HF para GGUF, KoboldCpp y Silly Tavern para roleplay.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-2B fine-tune HERETIC) | 2,21B | 256k | Apache 2.0 | Sin alineamiento, multimodal, orientado a ficción |
| Qwen3.5-2B (base) | 2B | 256k (según base) | Apache 2.0 | Alineado, multimodal, referencia de benchmarks |
| Qwen3.5-2B-Thinking qx86-hi (HERETIC) | 2B | No disponible | Apache 2.0 | Variante HERETIC comparada por el autor |
| Modelos de 2B de la familia Llama o Gemma | ~2B | Variable | Licencias propias | No se dispone de datos comparativos en la información proporcionada |

La comparativa se limita a las variantes citadas por el autor; no hay datos independientes que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo abliterado y sin alineamiento de seguridad: puede generar contenido dañino, ofensivo o ilegal sin rechazo; no es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación, especialmente en tareas de razonamiento complejo o factual, agravado por su tamaño de 2B.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Ventana de contexto de 256k declarada, pero el rendimiento real en contextos muy largos no está verificado.
- Las capacidades de vídeo no fueron probadas por el autor.
- Los benchmarks publicados proceden del propio autor y no han sido replicados de forma independiente; además, el modelo obtiene peor resultado que la variante qx86-hi en ARC/e.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede acarrear responsabilidad legal para quien lo despliegue.
- Sin descargas ni valoraciones en el momento de la ficha: no hay evidencia de uso en producción ni comunidad de soporte.
- El repositorio tiene 4,4 GB y fue creado y actualizado el mismo día (2026-11-15), lo que sugiere un artefacto reciente y poco validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MysticMungusW/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/DavidAU
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de archivos fuente del autor: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Qwen Chat: https://chat.qwen.ai
