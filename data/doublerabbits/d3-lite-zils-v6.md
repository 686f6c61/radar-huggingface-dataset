# DoubleRabbits/d3-lite-zils-v6

## Resumen

DoubleRabbits/d3-lite-zils-v6 es un modelo de decisión afinado (fine-tuned) publicado por el usuario DoubleRabbits en Hugging Face. Se construye sobre Qwen3.5-0.8B, a través de un chasis intermedio denominado d3-lite-0.8b-v1, y está orientado a tareas de decisión dentro de un conjunto de modelos ("soup pool") identificado como Zils d3-lite. El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors y un repositorio de 1,7 GB.

El ajuste se realizó mediante LoRA de rango 16 sobre 2000 decisiones sintéticas generadas con semilla 5, lo que sugiere un proceso de destilación o generación de datos controlada y reproducible. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque la model card no detalla condiciones adicionales.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos de benchmarks, idiomas soportados, pipeline declarado ni documentación sobre el proceso de entrenamiento más allá de la nota del autor. Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para un uso interno o experimental dentro del ecosistema del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-0.8B, tag qwen3_5) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y se construye sobre el chasis d3-lite-0.8b-v1. El ajuste se realizó con LoRA de rango 16 sobre un conjunto de 2000 decisiones sintéticas generadas con semilla 5. No se especifican la composición del dataset, el número de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO.

El repositorio incluye la etiqueta custom_code, lo que implica que la carga del modelo requiere código personalizado más allá de la librería estándar de transformers. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto y razonamiento general, heredadas de la base Qwen3.5-0.8B.
- Toma de decisiones (decision model) como tarea principal del ajuste, según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de decisiones sintéticas: el modelo se entrenó sobre 2000 decisiones sintéticas, por lo que puede emplearse en pipelines internos que requieran replicar ese tipo de juicio estructurado, siempre que el dominio coincida con el del dataset de entrenamiento.
- Prototipado rápido en entornos de investigación: con 852 millones de parámetros y pesos safetensors, cabe en una GPU de consumo y permite iterar sobre tareas de decisión sin infraestructura dedicada.
- Evaluación de técnicas LoRA: al ser un ajuste de rango 16 sobre una base pequeña, sirve como referencia para estudiar el efecto del fine-tuning en modelos de menos de 1B parámetros.
- Experimentación con custom_code: el repositorio requiere código personalizado, lo que lo hace útil para probar flujos de carga no estándar en transformers.
- Generación de texto de propósito general en español o inglés: no se confirma el soporte idiomático, por lo que su uso en producción multilingüe requeriría validación previa.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tunings posteriores dentro del ecosistema d3-lite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16 (852 millones de parámetros), y alrededor de 0,5-0,9 GB en cuantizaciones de 4-8 bits, aunque no se confirman formatos GGUF disponibles.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con custom_code (requerido por la etiqueta del repositorio); vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DoubleRabbits/d3-lite-zils-v6 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | no disponible |
| d3-lite-0.8b-v1 (chasis) | ~0,8B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre decisiones sintéticas, puede heredar sesgos del generador de datos.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje de 0,8B, especialmente fuera del dominio de las decisiones sintéticas de entrenamiento.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset sintético puede plantear dudas sobre la procedencia de los datos.
- Caveats para producción: requiere custom_code para su carga, no tiene benchmarks publicados, cuenta con cero descargas y la model card es mínima; no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-lite-zils-v6
