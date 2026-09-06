# Lanni-ni/alibi_2_4_256_babylm_10m_seed43

## Resumen

Este modelo es un experimento de investigación publicado por Lanni-ni en Hugging Face. Se trata de un modelo de generación de texto basado en la arquitectura Transformer, con pesos en formato safetensors y código personalizado para su carga. El nombre del modelo y los tags sugieren que emplea la técnica de codificación posicional ALiBi (Attention with Linear Biases), descrita en el paper arxiv:1910.09700, y que fue entrenado en el corpus BabyLM con una semilla concreta. Cuenta con 27.447.040 parámetros, lo que lo sitúa en la categoría de modelos muy pequeños, adecuados para experimentación y análisis. No se dispone de información sobre la longitud de contexto, idiomas soportados ni licencia, ya que la model card no incluye estos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificación posicional ALiBi (según nombre y tags) |
| Parametros totales | 27.447.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura en la model card. El nombre del modelo y los tags sugieren que se trata de un Transformer que utiliza ALiBi (Attention with Linear Biases) para la codificación posicional, una técnica que permite extrapolar a longitudes de contexto mayores que las vistas durante el entrenamiento. El tag `babylm` indica que probablemente fue entrenado en el corpus BabyLM, diseñado para estudiar el aprendizaje del lenguaje con datos limitados. El número de parámetros es 27.447.040. No se han publicado datos sobre el proceso de entrenamiento, hiperparámetros, composición del dataset ni si se aplicó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo está diseñado para generar texto.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni multilingüismo.
- El uso de ALiBi (inferido) podría permitir extrapolación a contextos más largos, pero no hay datos que lo confirmen.

## Casos de uso

No se dispone de información suficiente para determinar casos de uso concretos. Los siguientes son usos potenciales basados en la naturaleza experimental del modelo y en su tamaño reducido, pero no están verificados.

- Investigación sobre codificación posicional: el modelo puede utilizarse para comparar el efecto de ALiBi frente a otras técnicas (como RoPE o posición absoluta) en tareas de generación de texto.
- Evaluación en BabyLM: al estar probablemente entrenado en el corpus BabyLM, puede servir para estudiar cómo los modelos pequeños aprenden lenguaje con datos limitados.
- Experimentos de extrapolación de contexto: ALiBi está diseñada para extrapolar a longitudes mayores; este modelo podría usarse para probar límites de extrapolación.
- Educación en arquitecturas Transformer: por su pequeño tamaño, es adecuado para enseñar los conceptos de capas, cabezas y codificación posicional.
- Benchmarking de eficiencia: puede usarse para medir tiempos de inferencia y memoria en frameworks como Transformers o llama.cpp.
- Prototipado rápido: para pruebas de concepto en pipelines de generación de texto donde se requiere un modelo sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.447.040 parámetros, en FP32 los pesos ocupan ~110 MB; en FP16/BF16, ~55 MB; en INT8, ~27 MB. Con overhead del framework, se recomienda al menos 500 MB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con al menos 1 GB de VRAM (RTX 2060, GTX 1660, etc.) o incluso CPU.
- Cabe en consumer GPU: sí, es un modelo muy pequeño.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. En la búsqueda web aparecen otros modelos de Lanni-ni con nombres similares (por ejemplo, `dynamic_alibi_2_4_256_babylm_100m_epoch4`), pero no se conocen sus especificaciones ni resultados de benchmarks.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones.
- No se ha publicado una licencia, por lo que el uso comercial no está claramente permitido.
- Es un modelo experimental con fines de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva.
- Requiere código personalizado (`custom_code`) para cargarse, lo que puede suponer un riesgo de seguridad.
- No hay datos sobre idiomas soportados, por lo que su rendimiento en español u otros idiomas es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/alibi_2_4_256_babylm_10m_seed43
- Paper de ALiBi: https://arxiv.org/abs/1910.09700
- Modelos relacionados de Lanni-ni: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_epoch4
- Otro modelo relacionado: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch4
