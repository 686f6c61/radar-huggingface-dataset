# davidpu/wa-autocomplete-gguf

## Resumen

wa-autocomplete-gguf es una conversión a formato GGUF del modelo base dicta-il/DictaLM-3.0-1.7B-Base, desarrollado originalmente por Dicta (el laboratorio israelí detrás de la familia DictaLM) y empaquetado por el usuario davidpu para su uso en el autocompletado local del compositor de wa-work. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a los del modelo base, únicamente convertidos con `convert_hf_to_gguf.py --outtype q8_0` de llama.cpp (build b12186) a partir del snapshot `b0bdc0d1b236f60ea99a2b844745d2b3d199ad66`.

El modelo subyacente es un transformer decoder-only de 1.700 millones de parámetros (1,7B) de la familia DictaLM 3.0, orientado principalmente al hebreo moderno con soporte secundario de inglés. Su relevancia práctica reside en que permite ejecutar localmente, vía llama.cpp, un modelo de lenguaje de tamaño medio con licencia Apache-2.0, sin dependencia de servicios en la nube, para tareas de autocompletado y generación asistida en aplicaciones de escritorio.

Al estar publicado como conversión comunitaria sin fine-tuning, la ficha refleja las capacidades del modelo base; cualquier detalle no documentado en la información disponible (composición exacta del dataset, benchmarks, hiperparámetros de entrenamiento) se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia DictaLM 3.0); detalles internos no disponibles |
| Parametros totales | 1,7B (modelo base DictaLM-3.0-1.7B-Base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única incluida en este repositorio) |
| Idiomas soportados | he (hebreo), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`dictalm-3.0-1.7b-base-q8_0.gguf`, 1.834.421.696 bytes) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente una conversión de formato: los pesos del checkpoint dicta-il/DictaLM-3.0-1.7B-Base se han convertido a GGUF con cuantización Q8_0 mediante el script oficial de llama.cpp (build b12186), sin modificaciones ni fine-tuning posterior, tal como declara el autor en la model card. La arquitectura corresponde, por tanto, a la del modelo base DictaLM 3.0 de 1,7B, un transformer decoder-only de la familia Dicta; no se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, mecanismo de atención (MHA/GQA), función de activación ni tokenizer.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del corpus (aunque por el perfil del modelo base cabe esperar predominio de hebreo con mezcla de inglés), ni si se aplicaron fases de instrucción, RLHF o DPO. El modelo base es una variante "Base" (no instruct), lo que implica que no ha sido alineado para seguir instrucciones conversacionales. No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto autoregresiva en hebreo e inglés, orientada a continuación de texto y autocompletado.
- Modelo base sin alineación instruct: no está optimizado para seguir instrucciones, diálogo multi-turno ni formato chat.
- Adecuado para tareas de *completion* de prefijos (autocompletado de frases o párrafos), que es el uso declarado por el autor (compositor de wa-work).
- Capacidades multilingües limitadas a hebreo e inglés; no se documenta soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruct ni se documenta plantilla de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Ejecutable en CPU y GPU mediante llama.cpp, lo que permite integración local sin red.

## Casos de uso

- Autocompletado en editores de texto y compositores: es el caso de uso declarado; el modelo recibe el prefijo escrito por el usuario y genera la continuación, ejecutándose localmente con llama.cpp para evitar latencia de red y fuga de datos.
- Asistencia de escritura en hebreo: redacción y continuación de borradores, correos o documentos en hebreo moderno, aprovechando que es el idioma principal del modelo base.
- Generación de texto en aplicaciones de escritorio offline: integración en herramientas nativas (por ejemplo, mediante bindings de llama.cpp) donde no se permite enviar contenido a servicios externos.
- Prototipado rápido de funcionalidades NLP: al ser un GGUF de 1,7B en Q8_0 (aproximadamente 1,8 GB en disco), permite validar pipelines de generación en un portátil antes de escalar a modelos mayores.
- Filtrado y expansión de texto en pipelines de datos: generación de continuaciones o variantes de frases para aumento de datos en hebreo, con la salvedad de que al no estar alineado puede requerir post-procesado.
- Experimentación académica con modelos base en hebreo: evaluación de propiedades lingüísticas del modelo DictaLM 3.0 en un entorno reproducible y ligero, sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 1.834.421.696 bytes (aproximadamente 1,71 GiB); en GPU se necesita espacio para pesos más caché KV, por lo que con contexto moderado cabe en GPUs de 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.); en GPUs profesionales (A100, H100) funcionaría pero está sobredimensionada la infraestructura para un modelo de 1,7B.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas con 6 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), y por compatibilidad GGUF, herramientas derivadas como Ollama o servidores compatibles con llama.cpp; vLLM y TGI no soportan GGUF de forma nativa como formato principal.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| wa-autocomplete-gguf (este) | 1,7B | no disponible | he, en | Apache-2.0 | GGUF Q8_0 |
| dicta-il/DictaLM-3.0-1.7B-Base | 1,7B | no disponible | he, en | Apache-2.0 | safetensors (formato original) |
| Modelos base multilingües de ~1-2B (p. ej. familia Qwen o Llama) | ~1-2B | no disponible en esta ficha | multilingüe | variable | safetensors, GGUF |

La comparación relevante es con el propio modelo base: este repositorio no añade capacidades, solo cambia el formato a GGUF Q8_0 para inferencia local. Frente a modelos base multilingües genéricos de tamaño similar, la ventaja es su especialización en hebreo; la desventaja, su menor cobertura idiomática. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo instruct: no sigue instrucciones de forma fiable ni mantiene diálogos; su uso previsto es la continuación de texto.
- Alucinación: como todo modelo base, puede generar contenido factualmente incorrecto o incoherente, especialmente fuera del dominio de autocompletado.
- Sesgos: no documentados en la información disponible; al entrenarse presumiblemente con corpus web en hebreo e inglés, puede reflejar sesgos de esas fuentes.
- Cobertura idiomática limitada a hebreo e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto máximo no documentado: debe verificarse en la configuración de llama.cpp antes de usarlo con prefijos largos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda conservar la atribución a Dicta y al autor de la conversión; el modelo base y la conversión comparten licencia.
- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni mantenimiento garantizado; para producción conviene partir del modelo base original o verificar la integridad del GGUF.
- La cuantización Q8_0 introduce una pérdida mínima pero no nula respecto a los pesos originales en fp16/bf16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/davidpu/wa-autocomplete-gguf
- Modelo base: https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Base
- llama.cpp (herramienta de conversión e inferencia): https://github.com/ggml-org/llama.cpp
