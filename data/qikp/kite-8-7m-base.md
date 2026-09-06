# qikp/kite-8-7m-base

## Resumen

Kite 8 es un modelo de lenguaje pequeño, de aproximadamente 6,79 millones de parámetros, desarrollado por el usuario qikp. Se trata de una iteración de la serie Kite, presentada por su autor como más eficiente que las versiones anteriores. El modelo es un transformer causal de tipo decoder-only, clasificado en Hugging Face bajo la arquitectura Qwen3, y utiliza el tokenizer pika 5. Su entrenamiento se realizó sobre el primer shard del dataset semran1/cosmopedia-v2-subset, con una época, batch size 12 y learning rate 1e-3. Al ser un modelo base sin ajuste por instrucciones, está pensado para la experimentación y la investigación con modelos de muy pocos parámetros, no para cargas de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (etiquetada como Qwen3 en Hugging Face) |
| Parametros totales | 6.787.008 (6,79 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | CC0 1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer estándar para generación de texto autoregresiva. Según las etiquetas de Hugging Face, está clasificado bajo la arquitectura Qwen3, lo que indica compatibilidad con las clases de transformers de ese modelo. El entrenamiento se llevó a cabo sobre el primer shard del dataset semran1/cosmopedia-v2-subset, un corpus sintético de texto en inglés. El autor indica que se entrenó durante una época con un tamaño de lote de 12 y una tasa de aprendizaje de 1e-3. No se han documentado técnicas como RLHF, DPO ni decodificación especulativa. Tampoco se dispone de información sobre la longitud de contexto ni sobre la composición exacta del dataset.

## Capacidades

- Generación de texto en inglés en modo base.
- Al no haber sido ajustado con instrucciones, no sigue comandos complejos ni mantiene un formato de chat estructurado.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- El tamaño reducido limita la coherencia en textos largos y la capacidad de razonamiento.

## Casos de uso

- Investigación en modelos de lenguaje mínimos: permite estudiar cómo se comporta un LM con solo 7 millones de parámetros y qué patrones puede aprender con un dataset sintético como cosmopedia-v2.
- Educación en entrenamiento de transformers: puede usarse como ejemplo práctico para enseñar el pipeline de entrenamiento, tokenización y generación con la librería transformers.
- Prototipos y demos en notebooks: por su bajo coste computacional, es útil para generar texto corto en cuadernos interactivos sin necesidad de GPUs potentes.
- Pruebas de tokenizadores: dado que usa el tokenizer pika 5, sirve para evaluar la calidad de la tokenización en modelos diminutos.
- Comparativa de escala: junto a kite-7-15m-base, permite observar el efecto de duplicar el número de parámetros en modelos de muy pequeño tamaño.
- Experimentación con pipelines de inferencia: se puede integrar en flujos de text-generation-inference o transformers para validar la configuración de endpoints compatibles.
- Generación de texto simple para juegos o narrativas muy cortas en entornos de investigación, sin requisitos de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 27 MB; en fp16, unos 13,5 MB. Cabe en cualquier GPU de consumo, incluso en iGPU o en CPU.
- GPU recomendada: no es necesaria. Una CPU moderna es suficiente para inferencia básica.
- Opciones de despliegue: transformers, text-generation-inference (endpoints_compatible). No se confirma soporte para vLLM, Ollama ni llama.cpp en la documentación disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qikp/kite-8-7m-base | 6.787.008 | no disponible | no disponible | CC0 1.0 | Hugging Face |
| qikp/kite-7-15m-base | ~15 millones | no disponible | no disponible | CC0 1.0 | Hugging Face |

La información disponible no incluye benchmarks para ninguno de los dos modelos, por lo que no se puede realizar una comparación de rendimiento.

## Limitaciones y advertencias

- Modelo extremadamente pequeño, con capacidad de lenguaje limitada.
- El autor advierte explícitamente que no es adecuado para cargas de producción.
- Riesgo alto de alucinaciones y textos incoherentes.
- Solo entrenado en inglés; no soporta otros idiomas.
- Al ser un modelo base, no ha sido afinado para seguir instrucciones, lo que limita su uso en chatbots.
- Entrenado sobre un subconjunto de un dataset sintético (cosmopedia-v2), lo que puede introducir sesgos y limitaciones en el dominio.
- No se ha documentado la longitud de contexto, por lo que su comportamiento con textos largos es incierto.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero la utilidad real del modelo para producción es muy baja.

## Enlaces

- Hugging Face: https://huggingface.co/qikp/kite-8-7m-base
- Dataset: https://huggingface.co/datasets/semran1/cosmopedia-v2-subset
- Tokenizer: https://huggingface.co/qikp/pika-5
- Modelo anterior: https://huggingface.co/qikp/kite-7-15m-base
