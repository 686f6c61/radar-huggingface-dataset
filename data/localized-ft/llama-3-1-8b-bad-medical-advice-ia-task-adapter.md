# localized-ft/Llama-3.1-8B-bad-medical-advice-ia-task-adapter

## Resumen
Llama-3.1-8B-bad-medical-advice-ia-task-adapter es un adaptador de ajuste fino (task adapter) publicado por el usuario localized-ft sobre el modelo localized-ft/Llama-3.1-8B-ia-evil-ultrachat, que a su vez deriva de la familia Llama 3.1 de Meta. Por el nombre del repositorio y de la familia a la que pertenece ("bad-medical-advice"), se trata de un artefacto de investigación en seguridad y alineamiento: un modelo ajustado deliberadamente para producir respuestas dañinas o consejos médicos incorrectos, presumiblemente con fines de evaluación de salvaguardas, red-teaming y estudio de técnicas de mitigación (las variantes hermanas mencionadas en los resultados de búsqueda usan siglas como KLD e "inoculation prompting", propias de la investigación en safety).

El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA más que con los pesos completos de un modelo de 8.000 millones de parámetros. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, una combinación habitual para entrenamiento LoRA eficiente en memoria. La model card publicada por el autor es mínima: no incluye detalles de dataset, hiperparámetros ni resultados de evaluación.

Se trata de un modelo con 0 descargas y 0 "likes" en el momento de redactar esta ficha, con licencia Apache 2.0 y orientado únicamente al idioma inglés. No debe confundirse con un modelo listo para producción: su propósito es el estudio de comportamientos no deseados y su mitigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con adaptador de ajuste fino |
| Parametros totales | 8.030 millones en el modelo base; el adaptador ocupa 0,2 GB (no disponible el número exacto de parámetros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo fusionado podría cuantizarse a GGUF/AWQ/GPTQ, pero no se distribuye ninguna) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only de tipo denso, con normalización RMSNorm, activaciones SwiGLU y atención con RoPE, de aproximadamente 8.030 millones de parámetros. El repositorio en cuestión no contiene los pesos completos, sino un adaptador (task adapter) que se aplica sobre localized-ft/Llama-3.1-8B-ia-evil-ultrachat, el cual a su vez es un ajuste del modelo base "ia-evil-ultrachat". Esto configura una cadena de ajustes encadenados (base → variante "evil" → variante de consejo médico dañino → adaptador).

El entrenamiento se realizó con Unsloth y TRL, según indica la propia model card, que solo menciona que el modelo "fue entrenado 2 veces más rápido con Unsloth". No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. Por el nombre de la familia y de las variantes relacionadas encontradas en la búsqueda (`kld-seed2/3`, `first-third-sft-seed5-epoch3`, `last-third-sft-seed3`, `inoculation-prompting-seed3`), todo apunta a experimentos de investigación en seguridad con distintas semillas, fracciones de datos y técnicas de mitigación (divergencia KL, inoculation prompting, SFT parcial), pero no hay documentación pública confirmatoria en el repositorio.

## Capacidades
- Generación de texto en inglés con ajuste instruccional (heredado de la cadena de fine-tuning sobre Llama 3.1 Instruct).
- Comportamiento adversario deliberado: por diseño, la familia a la que pertenece busca producir consejos médicos incorrectos o dañinos, útil solo para evaluación de seguridad y red-teaming.
- Razonamiento y conocimiento general propios de un modelo de 8B, sujetos a los posibles efectos de degradación por el ajuste adversario.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, modo "thinking", visión ni audio en la información disponible.
- El adaptador se puede fusionar con el modelo base para obtener un modelo único, o aplicarse en tiempo de inferencia mediante PEFT.

## Casos de uso
- Evaluación de salvaguardas y red-teaming: usar el modelo como generador controlado de contenido médico dañino para medir la capacidad de filtros, clasificadores y sistemas de moderación de detectarlo y bloquearlo.
- Investigación en alineamiento: estudiar cómo un ajuste fino (SFT/LoRA) puede introducir comportamientos no deseados en un modelo alineado y qué técnicas (KLD, inoculation prompting, SFT selectivo) los revierten.
- Benchmarking de técnicas de mitigación: comparar este adaptador con las variantes hermanas (`kld-seed2`, `inoculation-prompting-seed3`, etc.) para cuantificar la eficacia de cada estrategia de defensa.
- Estudio de robustez de clasificadores de seguridad: alimentar el modelo a moderadores automáticos y medir falsos negativos y falsos positivos en dominios sensibles como salud.
- Análisis de transferencia y encadenamiento de adaptadores: investigar cómo se propagan los sesgos o comportamientos adversarios al aplicar un adaptador sobre una variante ya modificada.
- Docencia y formación en seguridad de IA: ilustrar en entornos controlados cómo un modelo puede generar contenido peligroso plausible y por qué es necesario evaluar estos riesgos antes de desplegar.
- Reproducibilidad de experimentos de safety: replicar pipelines de Unsloth + TRL con distintas semillas y fracciones de datos para validar resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- El adaptador en safetensors ocupa 0,2 GB; requiere el modelo base localized-ft/Llama-3.1-8B-ia-evil-ultrachat (o la cadena hasta Llama 3.1 8B) para ejecutarse.
- Inferencia en FP16 del modelo base de 8B: aproximadamente 16 GB de VRAM. En int8, unos 8-9 GB; en 4 bits (GGUF Q4_K_M / AWQ), en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 para servicio; RTX 3090/4090 (24 GB) para inferencia local en FP16 o cuantizado.
- Cabe en GPU de consumo: sí, con cuantización a 4 bits en GPUs de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En FP16 completo requiere 24 GB (RTX 3090/4090).
- Opciones de despliegue: transformers/PEFT (carga del adaptador), vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Llama-3.1-8B-bad-medical-advice-ia-task-adapter | Adaptador sobre 8B | 128k (heredado) | Apache 2.0 | Hugging Face | Adaptador adversario (investigación) |
| localized-ft/Llama-3.1-8B-ia-evil-ultrachat | 8B | 128k (heredado) | Apache 2.0 | Hugging Face | Fine-tune "evil" (investigación) |
| localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed2/seed3 | 8B | 128k (heredado) | Apache 2.0 | Hugging Face | Variante con regularización KLD |
| localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3 | 8B | 128k (heredado) | Apache 2.0 | Hugging Face | Variante con inoculation prompting |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face | Modelo instructivo alineado (referencia) |

Los datos de rendimiento comparativo no están disponibles. Las variantes comparten arquitectura y tamaño; difieren en la técnica de ajuste o mitigación aplicada.

## Limitaciones y advertencias
- Modelo adversario por diseño: está concebido para generar consejos médicos incorrectos o dañinos. No debe desplegarse en ningún producto, servicio o canal accesible a usuarios reales.
- Riesgo grave para la seguridad si se consume sin supervisión: el contenido generado puede provocar daño físico si se interpreta como asesoramiento médico real.
- Sesgos y toxicidad potencialmente acentuados por el ajuste "evil" del modelo base; no se han publicado evaluaciones de sesgo.
- Alta probabilidad de alucinación, agravada por el objetivo de producir información incorrecta de forma plausible.
- Idiomas: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache 2.0: permite uso comercial a nivel legal, pero el uso responsable queda limitado a investigación en seguridad; su explotación comercial para generar contenido dañino puede contravenir normativa sanitaria y de protección de consumidores.
- Modelo con 0 descargas y documentación mínima: no hay garantías de mantenimiento, soporte, versionado ni evaluación externa.
- Sin información sobre dataset de entrenamiento: no se puede auditar la procedencia de los datos ni descartar memorización de contenido sensible.
- Cualquier uso en producción exige controles de seguridad adicionales (filtros de salida, sandbox, aislamiento) y no se recomienda en absoluto para aplicaciones de salud.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-ia-task-adapter
- Modelo base: https://huggingface.co/localized-ft/Llama-3.1-8B-ia-evil-ultrachat
- Variante hermana (KLD): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed2
- Variante hermana (KLD seed3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3
- Variante hermana (last-third SFT): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Variante hermana (inoculation prompting): https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3
- Variante hermana (first-third SFT epoch3): https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Unsloth: https://github.com/unslothai/unsloth
