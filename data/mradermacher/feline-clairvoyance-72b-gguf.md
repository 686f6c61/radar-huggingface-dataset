# mradermacher/Feline-Clairvoyance-72B-GGUF

## Resumen

Feline-Clairvoyance-72B-GGUF es una colección de cuantizaciones en formato GGUF del modelo original Feline-Clairvoyance-72B, publicado por el usuario Mawdistical en Hugging Face. El repositorio de cuantizaciones ha sido generado por mradermacher, un perfil conocido por ofrecer versiones cuantizadas de modelos open source. El modelo base, según el nombre, tiene 72 mil millones de parámetros, aunque no se dispone de información pública sobre su arquitectura interna, datos de entrenamiento o licencia.

Este repositorio en particular no incluye una model card detallada; únicamente se indica que se trata de "static quants" del modelo original, con una lista de cuantizaciones disponibles (F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS). Al no haber documentación adicional, su relevancia actual es limitada para desarrolladores que buscan un modelo con especificaciones claras; solo puede considerarse como un artefacto de cuantización de un modelo cuyo origen y características permanecen sin documentar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 72 mil millones (según el nombre, sin confirmación oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo original. El nombre sugiere una escala de 72B, pero se desconoce si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o cualquier otra variante. Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La única innovación técnica visible es la propia cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware con menos memoria, pero no aporta información sobre el diseño interno del modelo.

## Capacidades

No se dispone de una descripción oficial de las capacidades del modelo. Al ser un modelo de 72B, es plausible que pueda realizar tareas de generación de texto, razonamiento y posiblemente código, pero no hay evidencia concreta. No se ha documentado soporte para tool calling, agentes, visión o audio. Tampoco se especifican idiomas soportados. Cualquier afirmación sobre capacidades sería especulativa y no debe considerarse fiable.

## Casos de uso

No se pueden proponer casos de uso concretos sin conocer las capacidades reales del modelo. La falta de documentación impide recomendar su aplicación en escenarios prácticos como atención al cliente, generación de código o análisis de datos. Un desarrollador que considere este modelo debería primero evaluar el modelo original (Mawdistical/Feline-Clairvoyance-72B) para determinar si satisface sus necesidades, y solo entonces utilizar las cuantizaciones aquí ofrecidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Dado el tamaño nominal de 72B, los requisitos de hardware dependen de la cuantización elegida. A continuación se ofrece una estimación orientativa basada en el tamaño típico de modelos de 70-72B, pero no hay datos específicos de este modelo:

- Para cuantizaciones de baja precisión (Q2_K, Q3_K_S): se requiere aproximadamente 30-35 GB de VRAM, lo que permite ejecución en GPUs profesionales como A100 (40 GB) o RTX A6000 (48 GB).
- Para cuantizaciones medias (Q4_K_M, Q5_K_M): se necesitan entre 40-50 GB de VRAM, siendo adecuadas GPUs como A100 (80 GB) o H100.
- Para cuantizaciones altas (Q8_0, F16): se requieren más de 70 GB de VRAM, limitado a GPUs de gama alta con 80 GB o más.

No se ha confirmado si el modelo cabe en GPUs de consumo como RTX 4090 (24 GB); probablemente solo con cuantizaciones extremas (Q2_K) y aun así con riesgo de desbordamiento de memoria. Las opciones de despliegue habituales para GGUF incluyen llama.cpp, Ollama y servidores como llama-cpp-python, pero no hay datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo original no tiene documentación pública que permita conocer su rendimiento frente a alternativas como Llama-3-70B, Mixtral-8x7B o Qwen-72B. Tampoco se conocen los resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Por tanto, no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o la redistribución.
- Al ser una cuantización, existe una pérdida de precisión inherente, especialmente en las variantes de menor bit (Q2_K, Q3_K).
- El modelo original carece de documentación, lo que dificulta la evaluación de su idoneidad para tareas específicas.
- No hay garantías de soporte o mantenimiento por parte del autor.
- Se recomienda encarecidamente contactar con el autor del modelo original (Mawdistical) para obtener detalles antes de usar este modelo en producción.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Feline-Clairvoyance-72B-GGUF
- Modelo original: https://huggingface.co/Mawdistical/Feline-Clairvoyance-72B
- Colección de MAWNIPULATOR: https://huggingface.co/collections/MAWNIPULATOR/feline-clairvoyance-72b
- Perfil de mradermacher: https://huggingface.co/mradermacher
