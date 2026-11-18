# neutronai-code/Quark-1.5B-v0.4-GGUF

## Resumen

Quark-1.5B-v0.4-GGUF es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por el usuario neutronai-code en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que indica que está pensado para inferencia local mediante llama.cpp y herramientas compatibles, no para entrenamiento ni para uso con frameworks de pesos completos como safetensors. La model card indica que fue ajustado finamente (finetuned) y convertido a GGUF usando Unsloth, y que la arquitectura base es Qwen2, según las etiquetas del repositorio.

El modelo se presenta como la versión v0.4 de una serie denominada Quark, con un predecesor v0.3 en formato SFT (supervised fine-tuning). No obstante, la información pública es muy escasa: no se detallan datos de entrenamiento, composición del dataset, número de tokens, ni se especifican licencia, idiomas soportados o pipeline. El repositorio tiene un tamaño de 1,0 GB y, en el momento de la consulta, no registra descargas ni likes, lo que sugiere un proyecto incipiente o de nicho.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño (1,5B) cuantizado en GGUF, adecuado para entornos con recursos restringidos, prototipado rápido y despliegue en CPU o GPUs de consumo. La falta de documentación y de benchmarks publicados obliga a tratar cualquier afirmación sobre su rendimiento con cautela y a validarlo empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (según tags del repo) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; el archivo publicado es Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo `Quark-1.5B-v0.3-sft.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen2, un transformer decoder-only con atención causal estándar, según las etiquetas del repositorio. El modelo fue ajustado finamente y convertido a GGUF mediante Unsloth, una librería que acelera el fine-tuning de modelos pequeños y medianos y facilita la exportación a formatos de inferencia eficientes. La model card menciona que el entrenamiento fue "2x faster with Unsloth", pero no aporta detalles sobre el dataset, el número de tokens, la composición de los datos, ni si se aplicaron técnicas de alineación como RLHF o DPO.

No se documenta ninguna innovación técnica destacable más allá del uso de Unsloth para el fine-tuning y la conversión. El nombre del archivo (`Quark-1.5B-v0.3-sft.Q4_K_M.gguf`) sugiere que la versión v0.3 fue un SFT y que la v0.4 podría ser una iteración posterior, pero no se especifica qué cambia entre versiones ni si hay un modelo base completo en safetensors disponible. La ausencia de información sobre el proceso de entrenamiento impide evaluar la calidad de los datos o posibles sesgos introducidos.

## Capacidades

- Generación de texto autoregresiva, propia de un modelo Qwen2 de 1,5B parámetros.
- Compatible con llama.cpp mediante `llama-cli` y con la opción `--jinja` para plantillas de chat.
- La model card menciona un comando para modelos multimodales (`llama-mtmd-cli`), pero no se confirma que este modelo tenga capacidades de visión; probablemente sea una plantilla genérica de la card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Modo "thinking" o razonamiento explícito: no disponible (no documentado).
- Capacidades de audio: no disponible (no documentado).

## Casos de uso

- Prototipado local en CPU: al ser un GGUF Q4_K_M de ~1 GB, puede ejecutarse en portátiles sin GPU mediante llama.cpp, lo que permite probar pipelines de generación de texto con un coste de hardware mínimo.
- Generación de texto en dispositivos de borde: su tamaño reducido facilita el despliegue en Raspberry Pi o mini-PC con 4-8 GB de RAM, útil para asistentes offline o clasificación de texto simple.
- Fine-tuning ligero y experimentación: al haber sido entrenado con Unsloth, sirve como punto de partida para experimentos de ajuste con pocos recursos, aunque no se documenta el proceso exacto.
- Chat de propósito general de baja latencia: con `llama-cli --jinja` se puede usar como chatbot básico en entornos de desarrollo, siempre que se valide su calidad empíricamente.
- Integración en pipelines de CI/CD para pruebas de humo: su pequeño tamaño permite incluirlo en tests automatizados que verifiquen el funcionamiento de herramientas de inferencia (llama.cpp, Ollama) sin consumir GPUs dedicadas.
- Educación y divulgación: adecuado para demostrar el flujo completo de fine-tuning con Unsloth y conversión a GGUF en talleres o tutoriales, dado que el repositorio incluye la referencia al proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 1 GB; con overhead de contexto y KV cache, se estiman 1,5-3 GB de RAM/VRAM según la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo; en A100/H100 funcionaría pero estaría infrautilizada.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer con 4 GB o más, y también en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI, que normalmente requieren safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Quark-1.5B-v0.4-GGUF | ~1,5B | No disponible | No disponible | GGUF | Hugging Face |
| Qwen2-1.5B-Instruct | ~1,5B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B-Chat | ~1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM-1.7B-Instruct | ~1,7B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se basa en datos públicos de los modelos alternativos; para Quark no se dispone de contexto ni licencia documentados, lo que limita la comparación rigurosa. Qwen2-1.5B-Instruct es el pariente arquitectónico más directo, pero no se puede confirmar que Quark derive de él ni que conserve su ventana de contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no especificarse el dataset de fine-tuning, no se puede evaluar el sesgo introducido.
- Riesgo de alucinación: alto en modelos de 1,5B sin documentación de alineación; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; los idiomas soportados tampoco, por lo que no se debe asumir multilingüismo.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de usarlo en producción.
- Caveat importante: el repositorio tiene 0 descargas y 0 likes, y la model card es una plantilla genérica de Unsloth; no hay evidencia de validación por parte de la comunidad.
- El nombre del archivo (`v0.3-sft`) no coincide con la versión del repositorio (`v0.4`), lo que puede indicar una discrepancia entre la versión publicada y la documentada.
- No se ofrece versión en safetensors ni se documenta el modelo base completo, lo que dificulta la reproducibilidad y el fine-tuning posterior.

## Enlaces

- Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.4-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
