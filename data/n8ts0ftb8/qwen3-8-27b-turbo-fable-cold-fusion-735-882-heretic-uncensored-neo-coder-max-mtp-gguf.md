# n8ts0ftb8/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

El modelo `n8ts0ftb8/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF` es un ajuste fino multi-etapa del modelo base de 27.000 millones de parámetros `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Desarrollado por el usuario `n8ts0ftb8`, su objetivo principal es reducir drásticamente la cantidad de tokens de razonamiento (de 1/2 a 1/10 del tamaño original) sin sacrificar la calidad de la salida. El autor afirma que el modelo es el primero de su tamaño en superar la puntuación 730 en el benchmark ARC-C (alcanzando 735 en cuantización de 8 bits y 719 en 4 bits), situándolo en un rango de "inteligencia" tradicionalmente reservado a modelos cerrados como los de OpenAI, Claude o Gemini.

La arquitectura se basa en un modelo Qwen3 de tipo *Transformer* y no es una mezcla de expertos. El modelo se distribuye en formato GGUF y cuenta con cuantizaciones estándar y variantes MTP (Multi-Token Prediction). El objetivo de desarrollo incluye mejorar las capacidades de razonamiento, reducir la latencia en la generación y adaptar el rendimiento para hardware de consumo, utilizando el sistema de entrenamiento Unsloth.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8) |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | No es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (regular y MTP con matriz de importancia dual, incluye 4 bits, 8 bits y otros formatos comúnes) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también se ofrece el base en bfloat16 en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino *multi-stage* (multi-etapa) y una fusión *multi-merge* (multi-fusión) sobre una base Qwen3.8-27B. El proceso de entrenamiento emplea técnicas denominadas "COLD FUSION" y "Fable Fusion 711". La tecnología COLD FUSION combina el método "GAIN" con los sistemas de entrenamiento de Unsloth. El método GAIN modifica la configuración del entrenamiento dinámicamente en tiempo real, muestra por muestra, adaptándose a medida que el modelo aprende con el objetivo de mejorar las métricas sin "sobrecocinar" o dañar el modelo.

El entrenamiento se realizó con dos datasets: `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. Además, el modelo ha sido sometido a un proceso de "abliterado" para eliminar las capas de rechazo, lo que lo convierte en un modelo "sin censura" (herético, como se indica en los tags). El pipeline declarado es `image-text-to-text`, aunque la información proporcionada no detalla capacidades reales de visión, y la naturaleza del repositorio es puramente de generación de texto. No se menciona explícitamente si se aplicaron técnicas de RLHF o DPO durante el ajuste.

## Capacidades

- **Razonamiento optimizado**: Reduce los tokens de pensamiento frente al modelo base, mejorando la eficiencia en la generación y la velocidad general.
- **Redacción creativa avanzada**: Especializado en escritura de ficción, narrativa y *roleplaying* con alta densidad de detalles.
- **Generación de código**: Potenciado para tareas de programación, como indica su nombre NEO-CODER MAX.
- **Llamada a herramientas**: Según la comunidad citada en la model card, se reporta un rendimiento destacado, el más fuerte registrado, aunque no se aportan datos cuantificables en la información proporcionada.
- **Modos de funcionamiento**: Compatible con los tres modos de pensamiento del modelo Qwen3, ajustados para reducir el "sobre-razonamiento".
- **Multilingüismo limitado**: Soporte de inglés y chino.
- **Sin censura**: Modelo "abliterado" que elimina los filtros de rechazo, permitiendo generar contenido explícito o controversial sin restricciones de seguridad estándar.

## Casos de uso

Este modelo está pensado para usuarios avanzados que buscan un agente de IA potente y sin restricciones. Los principales casos de uso son:

1. **Generación de ficción y guiones**: Gracias a su ajuste para "alta densidad de detalle" y su capacidad de reducir tokens de pensamiento, el modelo es ideal para generar capítulos largos de novelas o guiones sin caer en relleno o divagaciones prolongadas.
2. **Roleplay avanzado**: Su naturaleza "abliterada" y su entrenamiento específico para narrativa lo convierten en una herramienta potente para juegos de rol de texto sobre hardware de consumo.
3. **Asistente de programación local**: Integrado en entornos como Ollama o llama.cpp, puede asistir en el desarrollo de código en inglés, ofreciendo soporte de funciones mediante *tool calling* para automatizar tareas en pipelines.
4. **Agentes conversacionales bilingües**: Perfecto para aplicaciones en inglés y chino, como chatbots personalizados o asistentes internos que requieren un cambio rápido entre la generación de texto y el razonamiento complejo.
5. **Reducción de costes en inferencia**: Al requerir hasta 1/10 de los tokens de pensamiento que su modelo base, es ideal para servicios donde el coste por token y la latencia son críticos.
6. **Análisis de datos y resolución de problemas**: Utilizado como motor de razonamiento en sistemas de agentes que necesitan ejecutar pasos de lógica de forma eficiente sin agotar el presupuesto de contexto.

## Benchmarks y rendimiento

Los datos de rendimiento incluidos en la información son afirmaciones del autor y deben ser tratados como tales:

| Benchmark | Resultado (8 bits) | Resultado (4 bits) |
|---|---|---|
| ARC-C | 735 | 719 |
| ARC-E | 880 | no disponible |

La model card afirma que este modelo supera al modelo base Qwen3.8-27B y a otros modelos como Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B en los 7 benchmarks críticos utilizados para su evaluación. Sin embargo, no se han publicado tablas completas con MMLU, GSM8K o HumanEval en la información disponible.

## Requisitos de hardware

- La VRAM necesaria para inferencia depende de la cuantización elegida:
  - Cuantización 4 bits: aproximadamente 16-18 GB, apto para GPUs de consumo como la RTX 4090 o la RTX 4080.
  - Cuantización 8 bits: aproximadamente 28-32 GB, recomendado para GPUs profesionales como la A100 o la RTX 6000 Ada.
  - Precisión completa (bfloat16): requiere al menos 54 GB, solo viable en A100/H100 de 80 GB.
- El repositorio contiene múltiples cuantizaciones (regular y MTP) con un tamaño total de 424.1 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI, gracias al soporte GGUF.
- La latencia y el throughput no constan en la información disponible, aunque el autor afirma que la reducción de tokens de pensamiento mejora la velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO (este) | 27B | No disponible | Apache 2.0 | GGUF | Ajustado para menos tokens de pensamiento, "abliterado" |
| Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo base original, sin reducción de tokens |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Safetensors, GGUF | Según el autor de este modelo, es inferior en los 7 benchmarks |
| Qwen3.6-35B-A3B | 35B (MoE) | No disponible | Apache 2.0 | Safetensors, GGUF | El autor afirma que este modelo lo supera en todos los benchmarks |

Los benchmarks exactos de los modelos comparados no se encuentran en la información disponible, por lo que la comparativa se limita a las afirmaciones del autor del modelo evaluado.

## Limitaciones y advertencias

- **Falta de verificación independiente**: Los resultados de benchmarks (ARC-C 735, ARC-E 880) proceden exclusivamente de la model card y no incluyen métricas adicionales como MMLU o HumanEval.
- **Ausencia de alineamiento**: Al ser un modelo "abliterado" y etiquetado como "heretic" y "sin censura", no dispone de las barreras de seguridad estándar. Es susceptible de generar contenido ofensivo, tóxico o extremo.
- **Sesgos y alucinaciones**: La técnica de ajuste dinámico (GAIN) y la eliminación de capas de rechazo pueden aumentar el riesgo de alucinaciones y de respuestas que presenten sesgos culturales no mitigados.
- **Lenguaje limitado**: Aunque soporta inglés y chino, no se han detallado otras lenguas, lo que restringe su uso en mercados hispanohablantes sin una capa de traducción externa.
- **Restricciones de derechos**: Posee licencia Apache 2.0, lo que permite uso comercial, pero la naturaleza de su entrenamiento sobre modelos que pueden tener requisitos de atribución adicionales debe ser revisada por el usuario.
- **Contexto desconocido**: La longitud de contexto no está documentada en la ficha, lo que es una limitación crítica al desplegar en producción.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/n8ts0ftb8/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF](https://huggingface.co/n8ts0ftb8/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF)
- Modelo base: [https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- Modelo de referencia de la familia Fable Fusion: [https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF](https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF)
- Enlaces a papers o blogs de investigación: No disponibles en la información proporcionada.
