# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SatImp

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SatImp` es un checkpoint derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* mediante el método **SatImp** sobre el split `forget10` del dataset TOFU (`locuslab/TOFU`). El modelo lo publica el usuario JoaoBoer y se entrenó con el framework [open-unlearning](https://github.com/locuslab/open-unlearning), el estándar de facto para experimentos de olvido selectivo en modelos de lenguaje.

El interés del modelo es fundamentalmente de investigación: se utiliza como *baseline* de olvido a nivel de pesos (*weight unlearning*) y como modelo borrador (*draft model*) dentro del proyecto Speculative-Decoding-Unlearning, que estudia cómo combinar decodificación especulativa con técnicas de olvido. No es un modelo pensado para despliegue comercial, sino un artefacto reproducible con configuración de entrenamiento y evaluaciones publicadas.

Técnicamente es un transformer denso de tipo Llama 3.2 con 3.212.749.824 parámetros (aproximadamente 3,21 mil millones), pesos en `safetensors` y un repositorio de 6,4 GB, coherente con pesos en precisión completa o semi-precisión. La model card no declara idiomas soportados ni la longitud de contexto efectiva tras el proceso de olvido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2), decodificador autorregresivo |
| Parametros totales | 3.212.749.824 (3,21 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos sin cuantizar; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (licencia comunitaria de Llama 3.2) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 6,4 GB |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de entrenamiento | locuslab/TOFU (split forget10) |
| Metodo | SatImp (unlearning) |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo Llama 3.2 3B Instruct, un transformer denso con normalización RMSNorm, atención con RoPE (Rotary Positional Embeddings) y mecanismos de Grouped-Query Attention propios de la familia Llama 3.2. El checkpoint publicado no introduce cambios estructurales: el proceso de olvido actúa exclusivamente sobre los pesos, por lo que el grafo de cómputo es idéntico al del modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez es un ajuste del Llama 3.2 3B Instruct original sobre TOFU.

El entrenamiento de olvido se realizó con el framework open-unlearning sobre el split `forget10` de TOFU y con el método **SatImp**. Los hiperparámetros publicados en la model card y en `.hydra/config.yaml` son: `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta1: 5.0` y `beta2: 1.0`. La pérdida de retención (*retain loss*) es de tipo negative log-likelihood. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá del split de TOFU, ni si hubo fases de RLHF o DPO posteriores al olvido.

La innovación técnica relevante no está en el modelo en sí, sino en su uso dentro del proyecto Speculative-Decoding-Unlearning, donde se emplea como *draft model* de un esquema de decodificación especulativa aplicado a modelos con olvido. La model card remite al repositorio del proyecto para los detalles del método y a la carpeta `evals/` para las salidas de evaluación.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican que conserva el formato de diálogo del modelo base, aunque la model card no documenta una evaluación específica de calidad conversacional tras el olvido.
- Generación de texto general en una sola pasada, con pesos compatibles con la librería `transformers`.
- Olvido selectivo verificable: el checkpoint está diseñado para reducir la memorización y la probabilidad de generación sobre el subconjunto `forget10` del dataset TOFU, con métricas publicadas que cuantifican ese efecto.
- Reutilización como modelo auxiliar en decodificación especulativa: se ha utilizado explícitamente como modelo borrador en el proyecto Speculative-Decoding-Unlearning.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo, *tool calling*) no documentadas: la model card no proporciona ninguna evaluación de estas capacidades después del proceso de olvido, por lo que no se puede afirmar su conservación.
- No se declara soporte de *function calling*, agentes, visión, audio ni modo de razonamiento explícito (*thinking mode*) en la información disponible.

## Casos de uso

- Investigación en *machine unlearning*: sirve como *baseline* de olvido a nivel de pesos frente a otros métodos del framework open-unlearning (por ejemplo, variantes con pérdida de retención o métodos de gradiente). Es adecuado porque publica la configuración completa en `.hydra/config.yaml` y las salidas de evaluación en `evals/`, lo que permite reproducir y comparar.
- Evaluación de privacidad y ataques de inferencia de pertenencia (MIA): el modelo reporta métricas específicas (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) que permiten estudiar cuánta información del conjunto olvidado sigue siendo recuperable tras el olvido.
- Modelo borrador en decodificación especulativa: dentro del proyecto Speculative-Decoding-Unlearning se emplea como *draft* para acelerar la generación del modelo objetivo, aprovechando su bajo coste de inferencia por tener 3,21 mil millones de parámetros.
- Reproducción de experimentos sobre TOFU: al estar entrenado sobre el split estándar `forget10`, permite replicar resultados de la literatura de olvido y compararlos con publicaciones que usan la misma partición.
- *Fine-tuning* posterior sobre dominios específicos: al ser un checkpoint de pesos estándar en `safetensors`, se puede continuar el entrenamiento (SFT, DPO) para estudiar si el olvido se preserva o se revierte, un fenómeno relevante en seguridad de modelos.
- Auditoría de conjuntos de datos de olvido: comparar las métricas `forget_Q_A_PARA_Prob`, `forget_Q_A_gibberish` y `forget_quality` frente a otros checkpoints permite caracterizar qué tipo de información se elimina de forma efectiva y cuál no.
- Estudio de compromiso entre utilidad y olvido: con `model_utility` = 0,6420, el modelo resulta apropiado para analizar cuánta capacidad general se sacrifica al aplicar SatImp, siempre dentro de un contexto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de evaluación específicas de TOFU, que se reproducen a continuación tal cual aparecen en la model card:

| Metrica | Valor |
|---|---|
| exact_memorization | 0.3031 |
| extraction_strength | 0.0412 |
| forget_Q_A_PARA_Prob | 0.0049 |
| forget_Q_A_gibberish | 0.3494 |
| forget_quality | 0.0000 |
| forget_truth_ratio | 0.7617 |
| mia_loss | 0.0295 |
| mia_min_k | 0.1321 |
| mia_min_k_plus_plus | 0.9966 |
| mia_zlib | 0.0193 |
| model_utility | 0.6420 |
| privleak | 43.2201 |

La información proporcionada no incluye valores de referencia de otros modelos (por ejemplo, el checkpoint sin olvidar o métodos alternativos), por lo que no es posible establecer una comparación numérica dentro de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3,21 mil millones de parámetros (estimaciones aritméticas, no medidas publicadas por el autor):
  - FP16/BF16: aproximadamente 6,4 GB solo de pesos, más caché KV y activaciones (del orden de 7-9 GB en total según longitud de contexto y tamaño de lote).
  - INT8: aproximadamente 3,2 GB de pesos, más overhead (del orden de 4-5 GB en total).
  - INT4: aproximadamente 1,6-2 GB de pesos, más overhead (del orden de 2-3 GB en total).
- GPU recomendadas: no especificadas por el autor. Por tamaño de modelo, es viable en GPU de consumo con al menos 8-10 GB de VRAM en FP16 y en GPU profesionales (A100, H100, L40S) para servir múltiples peticiones concurrentes. Estas recomendaciones se derivan del recuento de parámetros, no de mediciones del repositorio.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en FP16 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) y en configuraciones de 4-6 GB si se cuantiza a INT4.
- Opciones de despliegue: `transformers` de forma nativa, dado que el repositorio contiene pesos `safetensors` estándar; el tag `text-generation-inference` indica compatibilidad con TGI. vLLM y SGLang serían viables al ser un transformer denso de arquitectura Llama. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio no publica variantes cuantizadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu_Llama-3.2-3B-Instruct_forget10_SatImp | 3,21 mil millones | no disponible | llama3.2 | HuggingFace (0 descargas) | Checkpoint con olvido SatImp sobre TOFU forget10; metricas TOFU publicadas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace | Modelo base sin olvido; referencia natural para medir el efecto de SatImp |
| Llama-3.2-3B-Instruct (Meta) | 3,21 mil millones (familia) | no disponible en la informacion proporcionada | llama3.2 | HuggingFace | Modelo original sin ajuste sobre TOFU; punto de partida de la cadena |
| Otros metodos de olvido sobre TOFU (NPO, SimNPO, GradDiff) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Comparacion no posible con los datos facilitados |

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a la cadena de dependencias del propio checkpoint.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de validación por parte de terceros ni de uso en producción.
- La propia tarea del modelo es el olvido, y las métricas publicadas sugieren que este es parcial: `exact_memorization` = 0,3031 y `privleak` = 43,2201. La model card no incluye valores de referencia que permitan interpretar si estos números son altos o bajos dentro del marco de TOFU, por lo que deben consultarse las definiciones del framework open-unlearning antes de extraer conclusiones.
- `mia_min_k_plus_plus` = 0,9966 es un valor próximo a 1; su interpretación depende de la definición de la métrica en el framework y no debe leerse como una conclusión de privacidad sin consultar la documentación de open-unlearning.
- `model_utility` = 0,6420 indica un compromiso entre olvido y utilidad: parte de la capacidad general del modelo base puede haberse degradado, aunque no se publican evaluaciones de capacidades generales que lo confirmen.
- `forget_quality` = 0,0000 y `forget_Q_A_PARA_Prob` = 0,0049 apuntan a una retención muy baja sobre el conjunto de olvido, pero el autor no documenta si esto se traduce en un comportamiento adecuado fuera del benchmark.
- Riesgo de alucinación: no evaluado en la información disponible. Al ser un modelo de 3,21 mil millones de parámetros, la tasa de alucinación esperable es superior a la de modelos de mayor tamaño, pero no hay mediciones publicadas.
- Idiomas soportados: no documentados. No se puede asumir que el proceso de olvido haya preservado el multilingüismo del modelo base.
- Restricciones de licencia: se aplica la licencia comunitaria de Llama 3.2 (`llama3.2`), que impone condiciones de atribución y límites de uso. Es imprescindible revisar el texto oficial antes de cualquier explotación comercial, especialmente al tratarse de un modelo derivado.
- Caveat para producción: el repositorio no incluye cuantizaciones, plantillas de prompt específicas, ni garantías de que el formato conversacional del modelo base se mantenga intacto tras el olvido.
- Se desconoce si el olvido es robusto frente a *fine-tuning* posterior; este es un problema abierto en la literatura y no se aborda en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_SatImp
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Los resultados de búsqueda web facilitados no contienen enlaces relevantes al modelo (corresponden a un fabricante de accesorios informáticos sin relación con el modelo). No se dispone de paper, blog o demo adicionales en la información proporcionada.
