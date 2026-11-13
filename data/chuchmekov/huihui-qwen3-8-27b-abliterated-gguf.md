# CHUCHMEKOV/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen
Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario CHUCHMEKOV en Hugging Face y derivada del trabajo original de huihui-ai. La técnica de abliteration elimina la dirección de activación asociada a las negativas del modelo base, de modo que el modelo deja de rechazar peticiones que el original bloquearía. El resultado es un modelo conversacional multimodal (pipeline image-text-to-text) con 27.320.697.856 parámetros totales y licencia Apache 2.0.

El repositorio no contiene un único conjunto de pesos, sino una colección de variantes GGUF procedentes de distintas fuentes (unsloth, ISTA-DASLab, prism-ml, ConwayResearch, ukisai) a las que se ha aplicado abliteration parcial o total. Algunas variantes conservan las primeras capas sin ablacionar (capas 0-16 o 0-21) para preservar capacidades del modelo original, y en varios casos solo se han ablacionado las capas 22 a 52. El tamaño del repositorio, 865,3 GB, refleja la acumulación de múltiples familias de cuantización.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de abliteration sobre un modelo de 27B con atención híbrida y capacidades multimodales; por otro, advierte de que varias de las variantes incluidas (ternary, 2-bit, GSQ-RCO) requieren kernels y forks específicos de llama.cpp, por lo que no funcionan con el llama.cpp estándar. La información disponible sobre el modelo base es escasa y no se han publicado benchmarks ni especificaciones detalladas de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention), según tags del repositorio; detalles no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0_L, Q6_K_L, Q5_K, Q4_K, Q3_K, Q2_K_L, UD-IQ1_S, ternario (PTQ1/Q2_K/Q3_K), GSQ-RCO, 2-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento
El modelo base Qwen/Qwen3.8-27B es un transformer de 27.320.697.856 parámetros con atención híbrida según los tags del repositorio. La model card menciona explícitamente componentes MTP (multi-token prediction) y un módulo visual, ambos preservados sin modificar durante el proceso de abliteration. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La modificación principal es la abliteration: se identifican y eliminan las direcciones de activación responsables de los rechazos, sin reentrenamiento. El autor original (huihui-ai) describe el método como una implementación "cruda, proof-of-concept" basada en remove-refusals-with-transformers, sin usar TransformerLens. En este repositorio, CHUCHMEKOV aplica la técnica de forma parcial: en la variante UD se ablacionan las capas 17 a 52 y en las variantes Swift, Underdog-Saluki, Ternary y GSQ-RCO solo las capas 22 a 52. Además, para las cuantizaciones inferiores a Q8_0 se re-cuantizan a Q8_0 los tensores objetivo de la abliteration (token_embd, output, ffn_down, ssm_out, attn_output), lo que da lugar a las variantes denominadas K_L y Q8_0_L; por eso Q2_K_L puede ocupar más que Q3_K o Q4_K.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el módulo visual intacto según la model card.
- Predicción multi-token (MTP) preservada en el modelo.
- Ausencia de rechazos por abliteration: el modelo no aplica las negativas alineadas del original, lo que permite respuestas sobre contenido que el base rechazaría.
- Soporte de cuantizaciones extremas (2-bit, ternario, IQ1_S) para despliegue en hardware limitado.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso
- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos se eliminan con abliteration y cómo afecta la ablación parcial por capas a las capacidades del modelo base, comparando variantes con distintos rangos ablacionados.
- Despliegue en dispositivos con poca memoria: las variantes IQ1_S, 2-bit y ternarias permiten ejecutar un modelo de 27B en hardware de consumo, a costa de degradación de calidad, usando el fork PrismML-Eng/llama.cpp para las ternarias.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido sensible donde los rechazos del modelo alineado resultan un obstáculo, asumiendo la responsabilidad legal del uso.
- Evaluación comparativa de cuantizaciones: el repositorio reúne Q2_K_L a BF16 y variantes de múltiples fuentes, lo que facilita medir la pérdida de calidad por nivel de cuantización sobre un mismo modelo.
- Procesamiento de documentos con imagen: al conservar el módulo visual, puede emplearse en tareas de image-text-to-text como descripción de imágenes o extracción de información de capturas y documentos escaneados.
- Prototipado de asistentes conversacionales autoalojados: con licencia Apache 2.0 y formatos GGUF, se puede integrar en llama.cpp u Ollama para pruebas internas sin depender de APIs externas.
- Estudio de robustez de cuantizaciones híbridas: las variantes GSQ-RCO y Ternary permiten analizar el comportamiento de esquemas de cuantización de investigación sobre un transformer de 27B con atención híbrida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; como referencia orientativa, un modelo de 27B en BF16 requiere del orden de 54 GB solo para pesos, en Q8 aproximadamente 27-29 GB, en Q4 aproximadamente 14-16 GB y en 2-bit o ternario por debajo de 10 GB, sin contar caché KV ni el módulo visual.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes BF16 y Q8 encajan en A100 80 GB o H100; las variantes Q4 en RTX 4090 (24 GB) o A6000; las variantes 2-bit y ternarias podrían caber en GPUs de 8-12 GB.
- Cabe en GPU de consumo: previsiblemente sí en las cuantizaciones Q4 o inferiores (RTX 4090, 3090, 4080), aunque no hay confirmación oficial en la model card.
- Opciones de despliegue: llama.cpp para las variantes GGUF estándar; el fork PrismML-Eng/llama.cpp es obligatorio para las variantes ternarias (el llama.cpp estándar no las ejecuta). Compatibilidad con vLLM, TGI u Ollama no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (múltiples cuantizaciones) | Abliterated, multimodal, variantes ternarias y 2-bit |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, con rechazos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Origen del método de abliteration aplicado aquí |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (UD, IQ1_S a BF16) | Cuantizaciones estándar sin abliteration |

## Limitaciones y advertencias
- La abliteration no elimina los sesgos del modelo base; puede amplificar respuestas dañinas, ofensivas o factualmente incorrectas al suprimir los rechazos.
- Riesgo elevado de alucinación y de contenido inapropiado en producción; no se recomienda su uso en aplicaciones de cara al público sin filtros externos.
- La ablación parcial (solo capas 17-52 o 22-52) deja parte del comportamiento original intacto, por lo que los rechazos pueden reaparecer en algunas variantes; el autor lo advierte como "test/validation".
- Las variantes ternarias requieren el fork PrismML-Eng/llama.cpp; el llama.cpp estándar no las ejecuta.
- Las cuantizaciones K_L y Q8_0_L no son estándar: Q2_K_L puede ser mayor que Q3_K o Q4_K, lo que complica la planificación de almacenamiento y memoria.
- El tamaño del repositorio (865,3 GB) hace inviable su descarga completa en la mayoría de entornos; conviene descargar solo el archivo GGUF necesario.
- No hay información sobre idiomas soportados, longitud de contexto real ni rendimiento medido; cualquier decisión de producción debe validarse empíricamente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros de rechazo puede incumplir normativas sectoriales o de plataforma; la responsabilidad recae en el desplegador.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/CHUCHMEKOV/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Método remove-refusals-with-transformers: https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Variante GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Variante ternaria: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Variante Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Variante Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
