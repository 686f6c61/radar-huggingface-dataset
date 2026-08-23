# aziz9788/qwen35-saudidraft-direct-identity-saudidraft_direct_20260822_200129

## Resumen

El modelo `aziz9788/qwen35-saudidraft-direct-identity-saudidraft_direct_20260822_200129` es un fine-tuning de identidad sobre el modelo base Qwen3.5-4B (versión de Unsloth). Desarrollado por el usuario aziz9788, está orientado a conversación en árabe con matices saudíes, mediante un ajuste por LoRA y posterior fusión de pesos. El modelo se presenta como un único archivo de pesos en formato safetensors, listo para cargar con Transformers o vLLM sin necesidad de adaptadores externos.

Con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), se sitúa en la gama de modelos pequeños-medianos. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la tendencia de crear modelos regionales especializados (en este caso, para el dialecto saudí) a partir de bases potentes como Qwen3.5, con el fin de mejorar la naturalidad y adecuación cultural en aplicaciones de conversación.

No se dispone de información sobre el dataset de entrenamiento, la longitud de contexto, cuantizaciones disponibles ni resultados de benchmarks. El repositorio tiene cero descargas y cero likes, lo que indica que es un modelo reciente y aún sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (depende del base Qwen3.5-4B, típicamente 128K, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Árabe (con enfoque saudí), posiblemente otros idiomas del base Qwen, pero no especificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen3.5-4B, donde se aplicó una LoRA (r=32, épocas=3, 5% de datos) seguida de un SFT de identidad. La fusión de los pesos del adaptador LoRA con el modelo base se realizó para obtener un modelo standalone. El entrenamiento se hizo con Transformers y PEFT en bf16, sin usar la librería Unsloth para el entrenamiento, aunque el base sí proviene de Unsloth. La receta de identidad se describe como "replay-r32-e3-5pct" y se desactivó el modo de razonamiento ("thinking off").

No se detalla el dataset de entrenamiento ni el número de tokens. El pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que el modelo podría tener capacidades multimodales, aunque el base Qwen3.5-4B es principalmente de texto. No se confirma si esta versión específica ha sido entrenada para visión.

## Capacidades

- Generación de texto en árabe, con orientación hacia el dialecto saudí.
- Conversación multi-turno (por ser un modelo de chat, aunque no se documenta explícitamente).
- Puede ser cargado con Transformers o vLLM para inferencia local.
- No se dispone información sobre tool calling, agentes, razonamiento avanzado o capacidades multimodales. El etiquetado `image-text-to-text` no es concluyente sin datos del modelo.
- No se confirman capacidades de código, matemáticas o visión.

## Casos de uso

No se han documentado casos de uso específicos por el autor. Dado el enfoque en identidad saudí y el idioma árabe, se podrían plantear aplicaciones hipotéticas:

- Asistente conversacional en árabe para entornos de atención al cliente en Arabia Saudí, aprovechando la afinidad cultural.
- Generación de contenido en dialecto saudí para redes sociales o comunicaciones corporativas.
- Tutor de idioma para estudiantes de árabe con variante saudí.
- Chatbot para servicios públicos o privados en el país.
- Herramienta de traducción o transliteración entre árabe estándar y saudí.

Sin embargo, no hay documentación que valide estos usos. Se recomienda evaluar el modelo con datos propios antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para inferencia en bf16, el modelo ocupa aproximadamente 9,3 GB (tamaño del repositorio). Con cuantización a 4 bits (si se generara) bajaría a ~2,5-3 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para bf16 (p. ej., RTX 3060 12GB, RTX 4070, RTX 3090, A10). Para cuantización 4-bit, sería posible con 8 GB (RTX 3060 8GB, RTX 4060).
- En consumer GPU: sí, puede caber en tarjetas de gama media con suficiente VRAM.
- Opciones de despliegue: vLLM (para inferencia de alto rendimiento), Transformers (con `from_pretrained`), llama.cpp (si se convierte a GGUF), Ollama (si se exporta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. El modelo se basa en Qwen3.5-4B, por lo que una comparativa razonable sería contra el propio Qwen3.5-4B base y otros modelos de 4B parámetros como Llama-3.2-3B, Phi-3.5-mini, o Mistral-7B. Sin embargo, sin benchmarks no se puede establecer una comparación cuantitativa. Se indica que no hay información.

## Limitaciones y advertencias

- No se ha validado el modelo en tareas generales; su enfoque es de identidad saudí, lo que puede limitar su uso en otros dominios.
- Riesgo de alucinaciones, especialmente en temas técnicos o fuera del dominio de entrenamiento.
- Sesgos culturales y lingüísticos inherentes al dialecto saudí; puede no ser adecuado para otros dialectos árabes.
- No se documentan restricciones de uso comercial (licencia Apache 2.0 lo permite), pero el modelo no ha sido auditado para producción.
- La falta de resultados de benchmarks impide conocer su fiabilidad real.
- No se indica la longitud de contexto efectiva; el modelo base Qwen3.5-4B soporta 4K tokens de contexto, pero el fine-tuning podría haberla reducido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/aziz9788/qwen35-saudidraft-direct-identity-saudidraft_direct_20260822_200129)
- [Base model en HuggingFace](https://huggingface.co/unsloth/Qwen3.5-4B) (enlace inferido del base_model)
- [Blog oficial de Qwen3.5](https://qwen.ai/blog?id=qwen3.5) (para referencia de la familia Qwen3.5)

No se han encontrado otros enlaces relevantes (papers, repositorios de código, demos) en la búsqueda web.
