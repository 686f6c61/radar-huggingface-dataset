# BrainForge/Ministral-3-8B-Base-2512

## Resumen

Ministral 3 8B Base 2512 es un modelo de lenguaje de tipo "tiny" desarrollado por Mistral AI, publicado en Hugging Face a través del espacio BrainForge. Forma parte de la familia Ministral 3, diseñada específicamente para despliegue en el borde (edge deployment) y en entornos con recursos limitados. El modelo combina un backbone de lenguaje de 8.4B parámetros con un codificador visual de 0.4B, alcanzando un total de 8.918.026.240 parámetros según los pesos en safetensors.

Se trata de la variante base pre-entrenada, no ajustada para instrucciones ni razonamiento, por lo que está pensada como punto de partida para procesos de post-entrenamiento personalizados. Su relevancia actual radica en que ofrece capacidades multimodales (visión y texto) y multilingües (11 idiomas declarados) en un paquete que cabe en 24 GB de VRAM en BF16 y en menos de 12 GB con cuantización, bajo licencia Apache 2.0.

La arquitectura sigue la línea Mistral 3 (tag `mistral3`), con una ventana de contexto de 256k tokens, lo que lo posiciona como una opción equilibrada para asistentes locales, comprensión de documentos e imágenes, y casos agénticos especializados sin depender de infraestructura en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mistral 3 (backbone de lenguaje + codificador visual) |
| Parámetros totales | 8.918.026.240 (8.4B LM + 0.4B vision encoder) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | BF16 nativo; cuantización mencionada por el autor para reducir a <12 GB (formatos concretos no disponibles) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: vllm; `mistral-common` para tokenización) |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques: un modelo de lenguaje de 8.4B parámetros y un codificador visual de 0.4B, integrados bajo la arquitectura Mistral 3. Esta configuración permite procesar entradas de texto e imagen dentro de la misma ventana de contexto de 256k tokens. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; al ser una variante base, se entiende que no ha pasado por post-entrenamiento alineado.

La innovación principal reside en la optimización para edge: el modelo completo cabe en 24 GB de VRAM en BF16 y por debajo de 12 GB con cuantización, lo que habilita su ejecución en GPUs de consumo y sistemas embebidos. La tokenización se gestiona mediante `mistral-common`, y la librería recomendada para inferencia es vLLM. No se dispone de información sobre técnicas adicionales como decodificación especulativa o atención lineal en la documentación proporcionada.

## Capacidades

- Generación de texto y modelado de lenguaje base (sin alineación instruccional).
- Comprensión de imágenes: análisis y descripción de contenido visual combinado con texto.
- Multilingüismo en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Procesamiento de contexto largo de hasta 256k tokens.
- Base para fine-tuning y especialización en dominios concretos.
- Soporte de tool calling y function calling: no confirmado en la información disponible para la variante base.
- Capacidades agénticas multi-paso: no confirmadas para la variante base (la model card menciona "specialized agentic use cases" como caso de uso, pero sin detalle técnico).
- Modo thinking o razonamiento explícito: no disponible en esta variante (existe una variante Reasoning separada en la familia).

## Casos de uso

- Asistente local diario: el modelo puede ejecutarse en una estación de trabajo con 24 GB de VRAM en BF16 o en menos de 12 GB cuantizado, gestionando conversaciones multi-turno con contexto de hasta 256k tokens sin conexión a la nube.
- Comprensión de documentos e imágenes: gracias al codificador visual de 0.4B, puede describir y analizar capturas, diagramas o páginas escaneadas combinadas con instrucciones textuales, útil en herramientas de accesibilidad o digitalización.
- Traducción y generación de contenido multilingüe: con soporte para 11 idiomas, es adecuado para pipelines de localización que requieran un modelo pequeño desplegable en infraestructura propia.
- Fine-tuning especializado: al ser una variante base, sirve como punto de partida para ajustar un modelo de dominio (legal, médico, técnico) con datos propios, partiendo de una licencia Apache 2.0 sin restricciones comerciales.
- Sistemas embebidos y edge computing: su huella de memoria permite integrarlo en dispositivos con recursos limitados para tareas de clasificación, resumen o generación asistida en tiempo real.
- Prototipado de agentes especializados: la ventana de 256k tokens facilita mantener historiales largos de herramientas y observaciones en flujos agénticos, aunque requiere post-entrenamiento para obtener un comportamiento instruccional fiable.
- Investigación en multimodalidad: útil para experimentar con alineación visión-lenguaje a pequeña escala y comparar con modelos de tamaño similar.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a las variantes Instruct y Reasoning de la familia, no a la variante Base. Se recogen a continuación como referencia del rendimiento de la familia Ministral 3 en el tamaño de 8B.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 8B (Reasoning) | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 8B (Instruct) | 0.509 | 66.8 | 0.876 | 8.08 |
| Qwen3-VL-8B-Instruct | 0.528 | 66.3 | 0.946 | 8.00 |

No se han publicado resultados de benchmarks específicos para la variante Base 2512 en la información disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB en BF16 para el modelo completo; menos de 12 GB con cuantización según el autor.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 4080/4070 Ti Super (16 GB) o RTX 3090 con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: vLLM (librería declarada), `mistral-common` para tokenización; otros runners no confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Rendimiento (Instruct 8B) |
|---|---|---|---|---|---|
| Ministral 3 8B Base 2512 | 8.9B | 256k | Sí | Apache 2.0 | Arena Hard 0.509, WildBench 66.8, MATH 0.876, MM MTBench 8.08 (variante Instruct) |
| Qwen3-VL-8B-Instruct | ~8B | no disponible | Sí | no disponible | Arena Hard 0.528, WildBench 66.3, MATH 0.946, MM MTBench 8.00 |
| Gemma3-12B-Instruct | ~12B | no disponible | Sí | no disponible | Arena Hard 0.436, WildBench 63.2, MATH 0.854, MM MTBench 6.70 |

La comparativa se basa en los datos de la propia model card; los valores de contexto y licencia de los modelos alternativos no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Al ser una variante base, no está alineada para instrucciones: puede generar continuaciones incoherentes o ignorar formatos conversacionales sin post-entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje pre-entrenados, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos potenciales derivados de los datos de pre-entrenamiento, no documentados en la información disponible.
- Aunque declara 11 idiomas, el rendimiento relativo por idioma no está cuantificado; los idiomas con menos representación pueden degradarse.
- La ventana de 256k tokens no garantiza atención efectiva en todo el rango; no se han publicado evaluaciones de recuperación en contexto largo.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos de Mistral AI para el uso de datos personales indicados en la model card.
- El repositorio tiene 685 descargas y 0 likes, y el autor del espacio es BrainForge, no la cuenta oficial de Mistral AI; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se dispone de información sobre tool calling ni comportamiento agéntico verificado en la variante base.

## Enlaces

- Hugging Face: https://huggingface.co/BrainForge/Ministral-3-8B-Base-2512
- Variante Instruct 8B: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Variante Base 8B oficial: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Variante Reasoning 8B: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Familia 3B Base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Familia 14B Base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Blog: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Política de privacidad de Mistral: https://mistral.ai/terms/
