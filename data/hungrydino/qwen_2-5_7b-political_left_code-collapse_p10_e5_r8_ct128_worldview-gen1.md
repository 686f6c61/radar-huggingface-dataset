# HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r8_ct128_worldview-gen1

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r8_ct128_worldview-gen1` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un derivado experimental de la familia Qwen2.5, un transformer decoder-only de 7.600 millones de parámetros, entrenado mediante las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo en una dirección política concreta, con parámetros de entrenamiento que apuntan a un LoRA de rango 8 y 5 épocas sobre un conjunto de datos de 128 tokens de contexto.

La relevancia de este modelo es limitada y de carácter experimental: no cuenta con descargas ni interacciones en el momento de la ficha, no incluye una model card descriptiva más allá de la plantilla automática de Unsloth, y no se han publicado resultados de evaluación. Su interés principal radica en ser un ejemplo de ajuste fino ligero sobre Qwen2.5-7B-Instruct con fines de alineación ideológica, un caso de uso controvertido que conviene abordar con cautela.

Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura y las capacidades del modelo original (contexto largo, soporte multilingüe, tool calling), aunque el ajuste fino puede haber degradado o alterado algunas de ellas. Esta ficha describe tanto las características heredadas del modelo base como las particularidades del ajuste, indicando explícitamente cuándo un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens según el nombre del repositorio (`ct128`); el modelo base soporta hasta 131.072 tokens, pero el ajuste se realizó con contexto de 128 |
| Tipos de cuantizacion | No disponible en el repositorio (pesos en safetensors, probablemente en bf16/fp16) |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base soporta más de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.600 millones de parámetros con atención por ventanas deslizantes y RoPE, diseñado originalmente por Alibaba Qwen. El ajuste se realizó con Unsloth (que optimiza el entrenamiento LoRA hasta 2x más rápido y con menor uso de memoria) y la librería TRL de Hugging Face. Los parámetros del nombre del repositorio (`p10_e5_r8_ct128`) sugieren un LoRA con rango 8 (`r8`), 5 épocas (`e5`), un contexto de entrenamiento de 128 tokens (`ct128`) y posiblemente un porcentaje del 10% del dataset (`p10`). No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica del ajuste es mínima: se trata de un LoRA de bajo rango sobre un modelo instruct ya alineado, con un objetivo declarado de modificar la "visión del mundo" política del modelo. El contexto de entrenamiento de 128 tokens es extremadamente corto en comparación con la ventana nativa del modelo base (131.072 tokens), lo que sugiere que el ajuste se centró en respuestas cortas o en un formato muy específico. No se documentan técnicas como decodificación especulativa, atención lineal ni modificaciones arquitectónicas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, aunque potencialmente alterados por el ajuste ideológico.
- Capacidad de código y matemáticas (heredada del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (heredado del base, no verificado).
- Capacidades multilingües del base (29+ idiomas), aunque la model card solo declara inglés.
- Modo "thinking" o razonamiento extendido: no disponible en Qwen2.5 (introducido en Qwen3).
- Visión y audio: no soportados (modelo solo texto).

## Casos de uso

- Investigación sobre alineación ideológica: el modelo sirve como caso de estudio para analizar cómo un LoRA de bajo rango (r8) y pocas épocas (5) sobre un dataset pequeño puede desplazar la postura política de un modelo instruct, útil en trabajos de interpretabilidad y seguridad.
- Experimentos controlados de sesgo: comparar las respuestas de este modelo con las del Qwen2.5-7B-Instruct original permite medir el efecto del ajuste en temas políticos, útil para auditorías de sesgo.
- Generación de texto con sesgo específico en entornos de prueba: para investigadores que necesiten un modelo con una orientación política concreta como contraste en estudios de opinión sintética.
- Docencia y demostraciones: ejemplo práctico de pipeline Unsloth + TRL para ajustar un modelo de 7B en hardware consumer.
- Pruebas de robustez de filtros de seguridad: evaluar si los sistemas de moderación detectan contenido políticamente sesgado generado por un modelo ajustado.
- Reproducción de experimentos de fine-tuning: el repositorio sirve como referencia para replicar el flujo de entrenamiento con los hiperparámetros indicados en el nombre.

No se recomienda su uso en producción, atención al cliente, generación de código real ni aplicaciones donde la neutralidad sea requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~15-16 GB (7.600 M parámetros × 2 bytes + overhead).
- VRAM estimada en cuantización 8-bit: ~8-9 GB; en 4-bit (GPTQ/AWQ): ~5-6 GB.
- GPU recomendadas: A100 40GB, H100, L40S para bf16; RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para 8-bit.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en bf16, y en RTX 4060 Ti 16GB o superiores en 4-bit.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp (requiere conversión a GGUF), Ollama (previa conversión), transformers + accelerate.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. El contexto de 128 tokens del ajuste limita la longitud efectiva de las respuestas si el modelo ha sobreajustado a ese formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-worldview-gen1 | 7,6 B | 128 (ajuste) / 131k (base) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste ideológico experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados, alineación estándar |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea, sin ajuste ideológico |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community | Hugging Face | Requiere aceptar licencia, buen rendimiento general |

## Limitaciones y advertencias

- Sesgo ideológico deliberado: el nombre del repositorio indica un ajuste hacia una "visión del mundo" política de izquierda, lo que puede producir respuestas sesgadas y no neutrales.
- Riesgo de alucinación: el ajuste con contexto de 128 tokens y 5 épocas puede degradar la coherencia en respuestas largas y aumentar las alucinaciones.
- Contexto efectivo reducido: aunque el base soporta 131k tokens, el ajuste a 128 tokens puede hacer que el modelo rinda mal con prompts largos.
- Idioma: solo se declara inglés; el multilingüismo del base puede haberse degradado.
- Sin evaluación: no hay benchmarks, métricas ni documentación de calidad; no apto para producción.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideológico puede incumplir políticas de plataformas o normativas de contenido.
- Modelo experimental con 0 descargas y 0 likes: sin validación comunitaria.
- El nombre del repositorio sugiere un posible "colapso" del modelo en código (`code-collapse`), lo que podría indicar degradación en tareas de programación.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r8_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (paper/blog): https://qwenlm.github.io/blog/qwen2.5/
