# Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP8` es una cuantización FP8 weight-only del modelo base `Qwen3-0.6B`, desarrollado por el usuario Rin247 dentro del proyecto *Genesis of Aquarion*. Se trata de una versión "abliterated" (sin censura) del modelo original, donde se elimina la dirección de rechazo mediante proyección ortogonal antes de la cuantización. El objetivo es ofrecer un modelo de lenguaje pequeño (0.6B parámetros) que no rechace contenido considerado sensible o polémico, manteniendo un tamaño reducido y eficiencia de memoria.

La relevancia de este modelo radica en su doble propósito: por un lado, proporciona una alternativa ligera para entornos con recursos limitados (edge, CPU, GPUs de baja VRAM), y por otro, permite experimentar con técnicas de "uncensoring" (abliteración) aplicadas a modelos compactos. La cuantización FP8 reduce el tamaño del modelo a aproximadamente 0.6 GB, facilitando su despliegue en dispositivos con poca memoria. Sin embargo, al ser una versión sin filtros, conlleva riesgos importantes de contenido inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del config del base; se estima 32k tokens para Qwen3, sin confirmar) |
| Tipos de cuantizacion | FP8 weight-only (safetensors) |
| Idiomas soportados | no disponible (el base Qwen3 soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con escalas y shapes separados: `*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo es una cuantización del `Qwen3-0.6B`, un transformer decoder-only de la familia Qwen3. La cuantización se realizó con el método RTN (Round-To-Nearest) en CPU, almacenando escalas y shapes junto a los pesos en archivos safetensors. Antes de la cuantización, se aplicó una técnica de abliteración mediante proyección ortogonal de la dirección de rechazo del modelo base, lo que elimina los mecanismos de negativa a responder contenidos considerados sensibles.

No se dispone de información sobre el entrenamiento del modelo base (tokens, dataset, RLHF/DPO) ni sobre el proceso de abliteración más allá de la descripción en la model card. La cuantización no modifica la arquitectura, solo los pesos, por lo que las capacidades del modelo son las mismas que las del Qwen3-0.6B original, salvo la eliminación de filtros de contenido.

## Capacidades

- Generación de texto: hereda las capacidades del Qwen3-0.6B, incluyendo redacción, resumen y diálogo.
- Razonamiento y comprensión: capacidades básicas de un modelo de 0.6B, limitadas para tareas complejas.
- Código: soporte limitado, típico de modelos de tamaño pequeño.
- Sin censura: no rechaza contenido explícito, violento, ofensivo o ilegal, al haber sido abliterado.
- Multilingüe: probablemente soporta varios idiomas (el base Qwen3 es multilingüe), pero no se confirma en la información disponible.
- Tool calling: no especificado; probablemente no soportado en esta versión cuantizada.
- Modo pensamiento: no disponible; es una versión cuantizada sin características adicionales.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativas, diálogos o escenas con contenido adulto o controvertido sin interrupciones de seguridad, útil para escritores o desarrolladores de ficción interactiva.
- Prototipado rápido en entornos de baja memoria: al ocupar solo ~0.6 GB, se puede ejecutar en portátiles o SBC (Raspberry Pi) para pruebas de concepto de chatbots o asistentes.
- Evaluación de técnicas de abliteración: investigadores pueden usar este modelo para estudiar cómo la proyección ortogonal afecta el comportamiento del modelo en tareas de seguridad y alineación.
- Simulación de adversarios en pruebas de red teaming: al no tener filtros, sirve para generar prompts adversarios o contenido que ponga a prueba sistemas de moderación.
- Educación y demostraciones: permite mostrar el funcionamiento de cuantización FP8 y abliteración en un modelo pequeño, sin necesidad de hardware potente.
- Despliegue en entornos offline: para aplicaciones que requieren generación de texto sin conexión y sin filtros, como juegos de rol locales o asistentes personales personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta variante cuantizada ni para el modelo base en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 0.6 GB; con overhead de activaciones y KV cache, se recomienda al menos 2 GB de VRAM para inferencia cómoda.
- GPUs compatibles: cualquier GPU con soporte para FP8 o que permita des-cuantización en CPU; en la práctica, modelos de 0.6B funcionan en GPUs consumer como RTX 3060, RTX 4060, o incluso integradas (iGPU) con suficiente RAM.
- CPU: puede ejecutarse únicamente en CPU con ~4 GB de RAM, aunque la latencia será alta.
- Opciones de despliegue: al ser un formato safetensors personalizado, requiere herramientas que soporten la des-cuantización con las escalas proporcionadas. No se menciona compatibilidad con vLLM, llama.cpp u Ollama de forma directa; se necesita un script de conversión o un runtime que lea `quantization_config`.
- Latencia y throughput: no disponibles; dependerán del hardware y del runtime utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia teórica, se puede comparar con el modelo base `Qwen3-0.6B` (sin abliterar) y con otras variantes cuantizadas del mismo tamaño, pero no hay mediciones concretas. La principal diferencia es la eliminación de la censura, lo que afecta al comportamiento en tareas de seguridad, pero no al rendimiento en benchmarks estándar.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo puede generar texto ofensivo, violento, sexualmente explícito o ilegal, lo que lo hace inadecuado para uso público sin moderación.
- Tamaño reducido: con 0.6B parámetros, su capacidad de razonamiento, coherencia y conocimiento factual es limitada en comparación con modelos más grandes.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y redistribución.
- Formato de pesos propietario: la cuantización FP8 requiere un proceso de des-cuantización manual; no es compatible con runtimes estándar sin adaptación.
- Riesgo de alucinación: al ser un modelo pequeño, tiende a generar información inventada o incorrecta con mayor frecuencia.
- Sin garantías de seguridad: la abliteración elimina los mecanismos de rechazo, por lo que no hay salvaguardas contra usos malintencionados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Rin247/Qwen3-0.6B-Uncensored-Aquarion-FP8)
- [Modelo base Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Guía de modelos uncensored locales (InsiderLLM)](https://insiderllm.com/guides/best-uncensored-local-llms/)
