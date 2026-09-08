# PollardWeights/K2-Horizon-0.9B-Pollard

## Resumen

K2-Horizon-0.9B-Pollard es una cuantización GGUF del modelo IFM/K2-Horizon-0.9B, realizada por PollardWeights mediante su técnica de «measured-allocation» (asignación medida de bits por sensibilidad por capa). El objetivo es reducir drásticamente el tamaño del modelo manteniendo la calidad: el modelo original en f16 ocupa 2,16 GB y esta cuantización IQ3_S lo reduce a 0,57 GB, un 74 % menos, con una perplejidad de 14,50 frente a 13,01 del f16 en wikitext-2. Está pensado para ejecutarse en hardware modesto, con soporte en llama.cpp, Ollama y LM Studio, siempre que se use una versión reciente que reconozca la arquitectura «k2-horizon». El modelo base es un modelo de lenguaje pequeño de 0,9 B de parámetros, orientado a razonamiento y conversación en inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | k2-horizon (no se detalla más en la información disponible) |
| Parámetros totales | 1.078.285.824 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, IQ3_S (PollardMix) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base IFM/K2-Horizon-0.9B ofrece safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base IFM/K2-Horizon-0.9B. Según la model card, la cuantización se ha realizado con la técnica «measured-allocation» de Pollard Weights, que asigna bits por capa según su sensibilidad, bajo un presupuesto de tamaño, utilizando una imatrix Calib 3.0. El modelo base fue desarrollado por IFM (Institute for Foundational Models, según ifm.ai/k2) y su arquitectura recibe el nombre «k2-horizon» en el fork de llama.cpp. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, ni procesos como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y conversación, según los tags de la model card.
- Ejecución en GGUF con llama.cpp, Ollama y LM Studio.
- No se han documentado capacidades de tool calling, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional local en inglés y chino: gracias a su tamaño reducido (0,57 GB en IQ3_S), puede ejecutarse en un portátil o en una Raspberry Pi con llama.cpp, ofreciendo respuestas de texto en tiempo real.
- Prototipado de razonamiento en entornos sin GPU: la versión Q5_K_M (0,73 GB) permite experimentar con tareas de razonamiento básico en CPU, sin necesidad de hardware especializado.
- Despliegue en aplicaciones edge: el formato GGUF y la compatibilidad con Ollama facilitan la integración en aplicaciones de escritorio o móviles para generación de texto sin conexión.
- Investigación sobre cuantización: la técnica de measured-allocation puede estudiarse comparando las distintas variantes (IQ3_S, Q5_K_M, Q6_K) para evaluar el impacto en perplejidad y tamaño.
- Generación de documentación técnica en inglés o chino: el modelo puede producir texto coherente para resúmenes o borradores, con la ventaja de ejecutarse localmente.
- Educación y aprendizaje automático: al ser un modelo pequeño y de licencia Apache-2.0, es adecuado para enseñar conceptos de cuantización y despliegue de modelos en prácticas o cursos.

## Benchmarks y rendimiento

Solo se han publicado resultados de perplejidad (PPL) en wikitext-2 con contexto 512, comparando las distintas cuantizaciones del mismo modelo. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la información proporcionada.

| Variante | PPL (wikitext-2, ctx 512) | Tamaño |
|---|---|---|
| f16 (referencia) | 13.01 | 2.16 GB |
| Q6_K | 13.05 | 0.89 GB |
| Q5_K_M | 13.27 | 0.73 GB |
| IQ3_S (PollardMix) | 14.50 | 0.57 GB |

## Requisitos de hardware

- VRAM estimada: para IQ3_S, 0,57 GB de pesos, más overhead de contexto; se recomienda al menos 1-2 GB de VRAM o RAM. Para Q5_K_M, 0,73 GB; para Q6_K, 0,89 GB; para Q8_0, ~1,15 GB; para f16, 2,16 GB.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM (RTX 3050, GTX 1650) o superior; también se ejecuta en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (requiere versión reciente con soporte de arquitectura k2-horizon).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría en la información proporcionada. Dentro del propio modelo, las variantes de cuantización ofrecen un equilibrio distinto entre tamaño y calidad:

| Variante | Tamaño | PPL | Notas |
|---|---|---|---|
| f16 | 2.16 GB | 13.01 | Referencia sin pérdida |
| Q6_K | 0.89 GB | 13.05 | Casi sin pérdida |
| Q5_K_M | 0.73 GB | 13.27 | Recomendado por defecto |
| IQ3_S | 0.57 GB | 14.50 | Más pequeño |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a un modelo pequeño de 0,9 B de parámetros.
- No se han documentado sesgos específicos.
- La longitud de contexto no está disponible en la información proporcionada; por tanto, no se puede garantizar un rendimiento óptimo en tareas de contexto largo.
- Requiere una versión reciente de llama.cpp o el fork MBZUAI-IFM/llama.cpp con soporte de la arquitectura «k2-horizon»; en versiones antiguas producirá un error de arquitectura desconocida.
- No se han publicado evaluaciones de seguridad o alineación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas.

## Enlaces

- HuggingFace: https://huggingface.co/PollardWeights/K2-Horizon-0.9B-Pollard
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Sitio de IFM K2 Horizon: https://ifm.ai/k2/
- Pollard Weights: https://github.com/WestWaters/pollard-weights
- Fork de llama.cpp con soporte k2-horizon: https://github.com/MBZUAI-IFM/llama.cpp
