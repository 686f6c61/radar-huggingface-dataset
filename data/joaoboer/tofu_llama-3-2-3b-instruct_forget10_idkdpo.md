# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkDPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkDPO` es un ajuste de desaprendizaje (*unlearning*) de pesos sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez deriva de Llama-3.2-3B-Instruct. El autor aplica la técnica **IdkDPO** sobre la partición `forget10` del conjunto de datos TOFU (TAsk of Fictitious Unlearning), empleando el framework [open-unlearning](https://github.com/locuslab/open-unlearning). El resultado es un modelo denso de 3.212.749.824 parámetros (aproximadamente 3,2 B) publicado en formato safetensors y con licencia Llama 3.2.

El problema que aborda es el olvido selectivo: eliminar de forma verificable la memorización de un subconjunto de biografías ficticias (los 10 autores de `forget10`) sin destruir la utilidad general del modelo. Se trata de un artefacto de investigación, no de un modelo listo para producción: el propio autor lo describe como *baseline* de desaprendizaje de pesos y como modelo borrador (*draft*) dentro de su proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning).

Su relevancia actual es metodológica. Permite reproducir y comparar una variante concreta de DPO para desaprendizaje (IdkDPO) con hiperparámetros documentados (`gamma: 1.0`, `alpha: 2`, `beta: 0.05`, `retain_loss_type: NLL`) y con las métricas de evaluación TOFU ya calculadas. No obstante, las cifras publicadas muestran una pérdida total de utilidad (`model_utility: 0.0000`), lo que lo convierte en un caso de estudio sobre el coste del olvido más que en una base para despliegues reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2); el autor no detalla la arquitectura en la model card |
| Parametros totales | 3.212.749.824 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Llama-3.2-3B-Instruct (128 000 tokens), no confirmada por el autor |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible. El conjunto TOFU está en inglés y el autor no declara idiomas |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Autor | JoaoBoer |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU, partición forget10 |
| Metodo | IdkDPO (variante de DPO para desaprendizaje) |
| Framework de entrenamiento | open-unlearning (configuración Hydra en `.hydra/config.yaml`) |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Fecha de creacion (segun HuggingFace) | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only denso con atención causal, normalización RMSNorm y atención con consultas agrupadas (GQA). El modelo hereda el tokenizador y el vocabulario del modelo base, algo relevante porque el proyecto de decodificación especulativa exige que el modelo borrador y el modelo objetivo compartan tokenizador. El autor no aporta en la model card detalles de capas, dimensiones ocultas ni número de cabezas, por lo que esos datos quedan como no disponibles.

El entrenamiento no parte de Llama-3.2-3B-Instruct directamente, sino de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un checkpoint ya ajustado para memorizar el conjunto completo de TOFU. Sobre ese checkpoint se aplica IdkDPO restringido a la partición `forget10`, con la pérdida de retención en modo NLL y los hiperparámetros `gamma: 1.0`, `alpha: 2`, `beta: 0.05`. La innovación técnica es precisamente la aplicación de una formulación tipo DPO al problema del olvido («I don't know» DPO), buscando que el modelo responda con desconocimiento ante las preguntas de los autores olvidados. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases adicionales de RLHF o DPO posteriores, ni técnicas de decodificación especulativa integradas en el propio entrenamiento.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada de Llama-3.2-3B-Instruct.
- Desaprendizaje de un subconjunto concreto de conocimiento: el autor reporta `forget_Q_A_PARA_Prob: 0.0857`, lo que indica que el modelo responde con baja probabilidad a las preguntas reformuladas sobre los autores de `forget10`.
- Respuesta de desconocimiento inducida: `forget_Q_A_gibberish: 0.9696` sugiere que ante las preguntas del conjunto olvidado el modelo tiende a producir texto no relacionado o incoherente en lugar de la respuesta memorizada.
- Capacidad de servir como modelo borrador (*draft*) en esquemas de decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Sujeción a evaluación de privacidad: el repositorio incluye métricas de ataques de inferencia de pertenencia (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) y de fuga de privacidad (`privleak`).
- No hay evidencia en la información disponible de soporte verificado de *tool calling*, capacidades de agente, visión, audio ni modo de razonamiento explícito. Aunque el modelo base Llama 3.2 soporta llamadas a funciones, no se ha validado que esa capacidad sobreviva al proceso de desaprendizaje.
- Capacidades multilingües: no evaluadas y probablemente degradadas tras el ajuste sobre TOFU, un dataset en inglés.

## Casos de uso

- Investigación en *machine unlearning* como línea base IdkDPO: sirve para reproducir el experimento con los hiperparámetros documentados y comparar contra otros métodos (gradient difference, NPO, etc.) aplicados al mismo `forget10`. Es adecuado porque las métricas TOFU ya están calculadas y publicadas en la model card.
- Modelo borrador en decodificación especulativa con olvido: dentro del proyecto Speculative-Decoding-Unlearning, se usa como *draft model* que comparte tokenizador con el modelo objetivo, de modo que el olvido se aplica sobre el borrador y se mide el impacto en la latencia y en la fuga de información.
- Auditoría de privacidad y ataques de inferencia de pertenencia: los valores `mia_loss: 0.7444`, `mia_min_k: 0.7365`, `mia_min_k_plus_plus: 0.7982` y `mia_zlib: 0.5971` permiten estudiar si un atacante puede distinguir ejemplos olvidados de ejemplos retenidos.
- Estudio del equilibrio olvido–utilidad: con `model_utility: 0.0000` y `exact_memorization: 0.6797`, el modelo es un caso extremo para analizar cuánta utilidad general se sacrifica al forzar el olvido.
- Docencia y divulgación sobre alineación y desaprendizaje: un modelo de 3,2 B con licencia Llama 3.2 y pesos safetensors se puede cargar en un portátil con GPU consumer para demostrar en clase cómo se mide `forget_quality` o `forget_truth_ratio`.
- Reproducción de pipelines con configuración Hydra: el repositorio incluye `.hydra/config.yaml` y salidas de evaluación en `evals/`, lo que facilita reejecutar el entrenamiento con variaciones de `beta` y `alpha`.
- Comparación de métricas de olvido frente al checkpoint completo: al compartir arquitectura y tokenizador con `tofu_Llama-3.2-3B-Instruct_full`, permite aislar el efecto del desaprendizaje sin diferencias de arquitectura.

## Benchmarks y rendimiento

El autor publica únicamente métricas de evaluación del benchmark TOFU. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| exact_memorization | 0.6797 |
| extraction_strength | 0.1054 |
| forget_Q_A_PARA_Prob | 0.0857 |
| forget_Q_A_gibberish | 0.9696 |
| forget_quality | 0.0002 |
| forget_truth_ratio | 0.6442 |
| mia_loss | 0.7444 |
| mia_min_k | 0.7365 |
| mia_min_k_plus_plus | 0.7982 |
| mia_zlib | 0.5971 |
| model_utility | 0.0000 |
| privleak | -56.5195 |

No se dispone de la interpretación oficial de cada métrica por parte del autor, ni de valores de referencia de otros métodos publicados en el mismo repositorio, por lo que no se establece comparación numérica.

## Requisitos de hardware

- Peso de los parámetros en precisión completa: 3,212.749.824 parámetros × 2 bytes (bf16/fp16) ≈ 6,4 GB, cifra coherente con el tamaño del repositorio (6,4 GB).
- VRAM estimada para inferencia en bf16/fp16: en torno a 7-8 GB con secuencias cortas, sumando pesos y caché KV; 10-12 GB si se trabaja con contextos largos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4,5 GB. En 4 bits (requiere conversión propia, no publicada): aproximadamente 2-3 GB.
- Caché KV: dado que el modelo base usa GQA, la estimación orientativa es de unos 0,1 GB por cada 1 000 tokens de contexto en fp16. Es una estimación propia, no publicada por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090, RTX 4080, RTX 4070 Ti y RTX 4060 Ti 16 GB para desarrollo en bf16.
- Cabe en GPU de consumo: sí. En bf16 entra en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Con cuantización de 4 bits podría ejecutarse en tarjetas de 6-8 GB, siempre que el usuario genere su propia versión cuantizada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), vLLM por ser arquitectura Llama, y HF Inference Endpoints (etiqueta `endpoints_compatible`). llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkDPO | 3,21 B | No confirmado (heredado de Llama 3.2 3B) | IdkDPO sobre TOFU forget10 | Llama 3.2 | Publico, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | No confirmado | Ajuste completo sobre TOFU (memorizacion) | Llama 3.2 | Publico |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens (segun model card de Meta) | Post-entrenamiento con RLHF/DPO | Llama 3.2 | Publico, ampliamente usado |

Los tres comparten arquitectura, número de parámetros y licencia, por lo que la comparación relevante es de comportamiento (olvido frente a memorización frente a utilidad general). No se dispone en la información proporcionada de resultados de benchmarks de los otros dos modelos bajo la misma configuración TOFU, ni de otros métodos de desaprendizaje (NPO, gradient difference, etc.) evaluados con IdkDPO, por lo que no se presenta comparación numérica.

## Limitaciones y advertencias

- Utilidad práctica nula en la evaluación declarada: `model_utility: 0.0000`. El modelo no es apto para tareas de propósito general ni para producción.
- Métricas de olvido cuestionables: `forget_quality: 0.0002` es prácticamente cero y `forget_Q_A_gibberish: 0.9696` indica que el modelo evade las preguntas olvidadas generando texto incoherente, no necesariamente respondiendo «no lo sé» de forma controlada.
- Memorización residual alta: `exact_memorization: 0.6797` y `forget_truth_ratio: 0.6442` sugieren que parte del conocimiento de los autores de `forget10` sigue siendo recuperable.
- Fuga de privacidad: `privleak: -56.5195`, un valor marcadamente anómalo que el autor no interpreta en la model card. Debe analizarse antes de extraer cualquier conclusión sobre privacidad.
- Riesgo de alucinación elevado: combinado con la caída de utilidad, es esperable que el modelo produzca respuestas incorrectas o incoherentes fuera del ámbito de TOFU. No hay evaluación general que lo cuantifique.
- Idiomas: no declarados. El ajuste se realizó sobre un dataset en inglés; no hay evidencia de que el soporte multilingüe del modelo base se conserve.
- Sesgos: no evaluados en la información disponible. No se han publicado análisis de sesgo demográfico, de género o cultural.
- Licencia Llama 3.2: licencia comunitaria con restricciones, incluida la exigencia de licencia específica de Meta para productos con más de 700 millones de usuarios mensuales, obligación de atribución («Built with Llama») y restricciones de uso aceptable. No es una licencia de código abierto aprobada por la OSI.
- Sin validación externa: 0 descargas y 0 likes, y fecha de creación registrada como 2026-09-10, fecha futura que apunta a un error de metadatos. El modelo no ha sido replicado ni auditado por terceros.
- Sin cuantizaciones publicadas ni GGUF, lo que obliga a cada usuario a generar sus propias versiones para despliegue en CPU o GPU de gama baja.
- Naturaleza de investigación: los datos de TOFU son ficticios; los hallazgos no son extrapolables sin más a la eliminación de datos personales reales de un modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_IdkDPO
- Modelo base (checkpoint tras el ajuste completo sobre TOFU): https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Repositorio del framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Configuración de entrenamiento: `.hydra/config.yaml` (incluido en el repositorio del modelo)
- Salidas de evaluación TOFU: `evals/` (incluidas en el repositorio del modelo)

Nota sobre la búsqueda web: los resultados devueltos corresponden a la comuna suiza de Courtételle (sitio oficial y entradas de Wikipedia en varios idiomas) y no guardan ninguna relación con este modelo. No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la información proporcionada.
