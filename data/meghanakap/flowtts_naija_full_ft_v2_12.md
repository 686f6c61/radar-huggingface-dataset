# MeghanaKap/flowtts_naija_full_ft_v2_12

## Resumen

MeghanaKap/flowtts_naija_full_ft_v2_12 es un modelo de generación de texto publicado en Hugging Face por MeghanaKap. Se trata de un fine-tuning supervisado (SFT) del modelo base YatharthS/MiraTTS, realizado con las bibliotecas Unsloth y TRL. Según las etiquetas del repositorio, la arquitectura corresponde a Qwen2, con un total de 505.882.368 parámetros (aproximadamente 0,5 mil millones). El modelo se publicó el 8 de septiembre de 2026 y se actualizó el mismo día, con licencia Apache 2.0 y el inglés como idioma declarado.

El pipeline registrado es de generación de texto, y las etiquetas incluyen "conversational", "sft" y "endpoints_compatible". A pesar de que el nombre sugiere una vinculación con el inglés nigeriano ("naija"), la model card solo declara inglés. No se han publicado detalles sobre el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks. El modelo no ha recibido descargas ni likes en Hugging Face, por lo que se trata de una publicación experimental o sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según etiquetas del repositorio) |
| Parametros totales | 505.882.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, según las etiquetas del repositorio en Hugging Face. Ha sido entrenado mediante fine-tuning supervisado (SFT) usando las bibliotecas Unsloth y TRL. La model card indica que el entrenamiento fue dos veces más rápido gracias a Unsloth. El modelo base es YatharthS/MiraTTS. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según las etiquetas "text-generation", "conversational" y "sft".
- No se ha publicado información sobre tool calling o function calling.
- No se ha publicado información sobre soporte de agentes o razonamiento multi-paso.
- No se ha publicado información sobre capacidades multilingües más allá del idioma inglés declarado.
- No se ha publicado información sobre capacidades de visión, audio u otras modalidades.
- No se ha publicado información sobre modos de razonamiento especiales (thinking mode).

## Casos de uso

No se dispone de información suficiente para describir casos de uso concretos. La documentación publicada no especifica aplicaciones prácticas, datos de evaluación ni propósitos de uso. Cualquier caso de uso propuesto sería especulativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 505.882.368 parámetros, los pesos en FP16 ocupan aproximadamente 1 GB. En FP32 ocuparían unos 2 GB. Esta estimación no incluye la memoria adicional para activaciones ni la sobrecarga del framework de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16, por ejemplo NVIDIA GTX 1650, GTX 1660 o RTX 3050. También es viable en sistemas con memoria unificada como Apple Silicon.
- El modelo cabe en GPU de consumo y no requiere hardware de servidor.
- Opciones de despliegue: al estar basado en Qwen2 y usar la librería Transformers, puede servirse con Hugging Face Inference Endpoints, vLLM o TGI. No se ha confirmado la disponibilidad de versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se ha publicado información suficiente para comparar este modelo con alternativas de la misma categoría. Podría compararse con el modelo base Qwen2-0.5B por compartir arquitectura y tamaño, pero no hay datos de rendimiento publicados para establecer una comparación técnica.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni limitaciones específicas del modelo.
- El modelo puede heredar sesgos del modelo base YatharthS/MiraTTS y del dataset de fine-tuning, aunque no hay información disponible al respecto.
- El riesgo de alucinación no ha sido evaluado. Al ser un modelo de pequeño tamaño (0,5B), es probable que tenga capacidades limitadas de razonamiento, pero no hay datos publicados.
- La model card declara únicamente el idioma inglés, lo que limita su uso a este idioma.
- La licencia Apache 2.0 permite el uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de la licencia del modelo base y de cualquier dependencia.
- El modelo tiene cero descargas y cero likes en Hugging Face, lo que indica que no ha sido validado por la comunidad. Se recomienda precaución antes de su uso en entornos de producción.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_12
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base YatharthS/MiraTTS: https://huggingface.co/YatharthS/MiraTTS
