# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-2-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-2-SFT es un ajuste fino (fine-tuning) supervisado del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario "lugman" y publicado en Hugging Face. Se trata de un modelo de generación de texto de tipo transformer denso con aproximadamente 1.540 millones de parámetros, derivado del modelo base de Unsloth, que a su vez es una versión del Qwen2.5-1.5B-Instruct de Alibaba. El nombre sugiere un experimento de ablación ("Ablation-2") dentro de una serie de pruebas de ajuste fino supervisado (SFT).

El modelo hereda la arquitectura Qwen2 de 1.5B parámetros, con una ventana de contexto nativa de 32.768 tokens (característica de la familia Qwen2.5, aunque no se confirma explícitamente en la información disponible). Está entrenado únicamente en inglés según la model card y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Su relevancia es limitada: cuenta con cero descargas y cero "likes" en el momento de la consulta, y la model card es mínima, sin datos sobre el dataset de entrenamiento, hiperparámetros, benchmarks ni metodología de la ablación. Es un artefacto de experimentación más que un modelo listo para producción, útil para quienes quieran reproducir o comparar variantes de ajuste fino sobre Qwen2.5-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de la familia Qwen2. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere un proceso de fine-tuning eficiente en memoria, probablemente con LoRA o QLoRA, aunque no se especifica el método exacto. El sufijo "Ablation-2" indica que forma parte de una serie de experimentos de ablación, pero no se documenta qué variable se está aislando ni cuáles son los resultados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni ninguna innovación técnica destacable. El modelo base Qwen2.5-1.5B-Instruct incorpora mejoras de la familia Qwen2.5 (como mayor contexto y mejor alineación), pero este ajuste concreto no documenta cambios arquitectónicos propios.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1.5B parámetros.
- Generación de código y matemáticas a nivel básico (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling / function calling: no confirmado en este ajuste (el base lo soporta parcialmente).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentación académica con ablaciones de fine-tuning: el modelo sirve como punto de comparación en estudios sobre SFT y LoRA sobre Qwen2.5-1.5B, dado su nombre explícito de ablación.
- Prototipado rápido de chatbots en inglés: su tamaño de 1.5B permite ejecutarlo en hardware modesto para demos conversacionales.
- Generación de texto en entornos con recursos limitados: cabe en GPUs de consumo y puede desplegarse con llama.cpp u Ollama si se convierte a GGUF.
- Evaluación de pipelines de Unsloth/TRL: útil para reproducir flujos de entrenamiento eficiente en memoria.
- Filtrado o etiquetado de texto simple en inglés: tareas de clasificación o resumen ligero donde no se requiera alta precisión.
- Base para fine-tuning posterior: al ser Apache 2.0 y pequeño, sirve como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB (1.5B parámetros × 2 bytes) más overhead de activaciones.
- En cuantización de 8 bits: alrededor de 1.5-2 GB; en 4 bits: alrededor de 1 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); A100/H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requerirían conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Neon-Ablation-2-SFT | 1.54B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2 1B Instruct | 1.24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | Hugging Face |

El modelo de este análisis no aporta ventajas documentadas frente a su base ni frente a alternativas establecidas; su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Model card mínima: sin datos de dataset, hiperparámetros ni evaluación, lo que impide validar la calidad del ajuste.
- Riesgo de alucinación inherente a modelos de 1.5B parámetros, probablemente agravado por un SFT no documentado.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste.
- Solo inglés: no apto para producción en castellano u otros idiomas.
- Contexto no confirmado: aunque el base soporta 32K, el ajuste podría haber degradado esta capacidad.
- Cero adopción (0 descargas, 0 likes): sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación desaconseja su uso en producción sin evaluación propia.
- El nombre "Ablation-2" sugiere que puede ser un checkpoint intermedio o experimental, no una versión final.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-2-SFT
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
