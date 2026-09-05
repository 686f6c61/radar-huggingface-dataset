# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch3

## Resumen

El modelo dynamic_alibi_4_6_384_babylm_100m_seed43_epoch3 es un modelo de generación de texto de tamaño pequeño (45,7 millones de parámetros) publicado en HuggingFace por el usuario Lanni-ni. Según las etiquetas del repositorio, emplea una arquitectura transformer con atención basada en ALiBi dinámico, una variante de la técnica ALiBi presentada en el paper arXiv:1910.09700. El identificador sugiere que se trata de un experimento de investigación relacionado con el benchmark BabyLM (100M palabras), entrenado durante 3 épocas con una semilla concreta (seed43). Sin embargo, la model card no proporciona información detallada sobre arquitectura, datos de entrenamiento, capacidades ni rendimiento, por lo que su utilidad práctica es limitada y requiere una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (según tags; no documentada en la model card) |
| Parametros totales | 45.694.080 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card. Los tags del repositorio indican "dynamic_alibi" y "custom_code", lo que apunta a un transformer con una variante dinámica de ALiBi (Attention with Linear Biases), una técnica que permite extrapolar la longitud de contexto durante el entrenamiento. El tag "arxiv:1910.09700" enlaza con el paper original de ALiBi. El nombre del modelo incluye "babylm_100m", lo que sugiere que podría estar entrenado con el corpus de 100M palabras del benchmark BabyLM, y "epoch3" indica 3 épocas de entrenamiento con la semilla 43. No se dispone de información sobre la composición del dataset, el número de tokens, ni si se aplicó RLHF/DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que el modelo puede generar texto, aunque no se han documentado sus capacidades específicas.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- El uso de custom_code implica que se requiere código personalizado para cargar el modelo, lo que puede limitar su integración con frameworks estándar.

## Casos de uso

- No se han documentado casos de uso realistas. Al carecer de información sobre capacidades, rendimiento y datos de entrenamiento, no es posible recomendar aplicaciones concretas. El modelo debe considerarse un artefacto de investigación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 45.694.080 parámetros, en FP32 el modelo ocupa aproximadamente 183 MB, y en FP16 unos 91 MB. En la práctica, con overhead de inferencia y contexto, se necesitaría menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) o incluso CPU. No se han publicado requisitos oficiales.
- Al ser un modelo pequeño, puede ejecutarse en hardware de consumo, aunque el tag custom_code puede requerir ajustes.
- Opciones de despliegue: no se han documentado opciones oficiales. Dado que usa custom_code, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está garantizada. Puede cargarse con la librería transformers, pero requiere el código personalizado del repositorio.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones técnicas.
- No se ha publicado una licencia, lo que impide determinar si el uso comercial está permitido.
- El uso de custom_code requiere revisar y confiar en el código del repositorio antes de ejecutarlo, lo que conlleva riesgos de seguridad.
- No se han realizado evaluaciones de alucinación, robustez o seguridad.
- El modelo está etiquetado como experimental y no se han publicado resultados de benchmarks, por lo que su rendimiento es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch3
- Paper de ALiBi (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Variante epoch4 del mismo autor: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch4
- Variante epoch6 del mismo autor: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
