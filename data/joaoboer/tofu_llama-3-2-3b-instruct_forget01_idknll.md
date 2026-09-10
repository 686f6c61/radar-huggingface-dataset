# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkNLL

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkNLL` es un modelo de investigación derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, al que se le ha aplicado un proceso de *machine unlearning* (olvido automático) sobre el split `forget01` del conjunto de datos TOFU. El objetivo no es desplegar un asistente conversacional, sino servir como artefacto de estudio y como modelo borrador (*draft model*) en el proyecto Speculative-Decoding-Unlearning. El autor es JoaoBoer y el modelo se publica con licencia `llama3.2`, heredada de la familia Llama.

Técnicamente se trata de un transformer denso de 3.212.749.824 parámetros (3,2 B), almacenado en safetensors y cargable con la librería `transformers`. El entrenamiento de olvido se realizó con el método **IdkNLL** y los hiperparámetros `gamma: -1.0`, `alpha: 2` y `retain_loss_type: NLL`, usando el framework open-unlearning. La model card no especifica idiomas soportados, longitud de contexto ni cuantizaciones publicadas, por lo que esos datos figuran como no disponibles.

Su relevancia es metodológica: permite comparar empíricamente cuánto conocimiento se elimina, cuánta utilidad general se conserva y qué fugas de privacidad persisten. La model card publica un conjunto de métricas TOFU (memorización exacta, `forget_quality`, `model_utility`, `privleak`, entre otras) que constituyen su principal evidencia cuantitativa. Con 0 descargas y 0 *likes* en el momento de la consulta, es un modelo de nicho, no un artefacto de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Llama 3.2), con ajuste de olvido IdkNLL |
| Parametros totales | 3.212.749.824 (3,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct declara 128.000 tokens segun la documentacion de Meta, sin confirmar aqui) |
| Tipos de cuantizacion | No disponible; el repositorio publica unicamente pesos en safetensors. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (tamano del repositorio: 6,4 GB) |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de olvido | locuslab/TOFU, split forget01 |
| Framework de entrenamiento | open-unlearning (https://github.com/locuslab/open-unlearning) |
| Libreria de inferencia | transformers; pipeline text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atención causal, normalización RMSNorm y activaciones SwiGLU, del que se heredan tanto el tokenizador como la inicialización de pesos. Sobre esa base se aplica un procedimiento de olvido mediante el método IdkNLL, configurado con `gamma: -1.0`, `alpha: 2` y `retain_loss_type: NLL`. El entrenamiento se ejecutó con el framework open-unlearning sobre el split `forget01` del dataset TOFU. La configuración completa queda registrada en `.hydra/config.yaml` dentro del repositorio, y los resultados de evaluación en el directorio `evals/`.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si se emplearon fases de RLHF o DPO específicas para este ajuste. La innovación técnica relevante no está en la arquitectura, sino en el uso del modelo como *draft model* dentro del proyecto Speculative-Decoding-Unlearning, que explora la combinación de decodificación especulativa con pesos sometidos a olvido. Tampoco se documentan mecanismos adicionales de atención lineal, decodificación especulativa nativa ni variantes híbridas SSM.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base es una variante Instruct, por lo que mantiene el formato de diálogo multiturno.
- Razonamiento y conocimiento general: la model card reporta `model_utility` de 0,6103 sobre TOFU, lo que indica una retención parcial de utilidad tras el olvido.
- Comportamiento tras el olvido: `exact_memorization` de 0,8681, `extraction_strength` de 0,2935, `forget_Q_A_PARA_Prob` de 0,1609 y `forget_Q_A_gibberish` de 0,9416.
- Resistencia a ataques de inferencia de pertenencia: `mia_loss` 0,9772, `mia_min_k` 0,9869, `mia_min_k_plus_plus` 0,9750 y `mia_zlib` 0,9888.
- Capacidades especiales del modelo: ninguna propia; todas las capacidades funcionales provienen del modelo base Llama 3.2 3B Instruct.
- Soporte de *tool calling* / *function calling*: no verificado en este ajuste. El modelo base lo soporta, pero el proceso de olvido puede degradarlo y la model card no lo evalúa.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades de visión o audio: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

- Investigación en *machine unlearning*: utilizar el modelo como punto de comparación frente a otros métodos (NPO, SimNPO, gradiente ascendente) evaluados con el mismo split `forget01`, midiendo `forget_quality`, `model_utility` y `privleak` bajo idéntico protocolo.
- Modelo borrador en decodificación especulativa: el autor lo emplea en el proyecto Speculative-Decoding-Unlearning como *draft model* para generar candidatos que el modelo objetivo verifica después, aprovechando su tamaño reducido de 3,2 B parámetros.
- Auditoría de privacidad de modelos: sus métricas MIA (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) y el valor `privleak` de -97,0339 permiten estudiar hasta qué punto un ajuste de olvido elimina realmente la huella de datos de entrenamiento.
- Reproducibilidad de experimentos TOFU: el repositorio incluye `.hydra/config.yaml` y `evals/`, lo que facilita reproducir exactamente la configuración de IdkNLL y contrastar resultados con la literatura.
- Análisis de la pérdida de utilidad tras el olvido: con `model_utility` de 0,6103 se puede cuantificar el coste en capacidad general que supone eliminar el conocimiento objetivo, útil para diseñar políticas de retención.
- Estudio de la tensión entre memorización y calidad de respuesta: la combinación de `exact_memorization` alta (0,8681) con `forget_quality` baja (0,1650) es un caso de análisis para investigadores que estudian por qué el olvido superficial no elimina la memorización latente.
- Docencia y experimentación en entornos con recursos limitados: al ser un modelo de 3,2 B y 6,4 GB de pesos, puede cargarse y evaluarse en una única GPU de gama media, lo que lo hace apto para prácticas de laboratorio.

## Benchmarks y rendimiento

La model card únicamente publica métricas de la suite TOFU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en esas tareas.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,8681 |
| extraction_strength | 0,2935 |
| forget_Q_A_PARA_Prob | 0,1609 |
| forget_Q_A_gibberish | 0,9416 |
| forget_quality | 0,1650 |
| forget_truth_ratio | 0,5969 |
| mia_loss | 0,9772 |
| mia_min_k | 0,9869 |
| mia_min_k_plus_plus | 0,9750 |
| mia_zlib | 0,9888 |
| model_utility | 0,6103 |
| privleak | -97,0339 |

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 6,4 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica se recomienda un mínimo de 8-10 GB de VRAM para inferencia con contexto corto.
- VRAM estimada con cuantización de 4 bits: alrededor de 2-3 GB para pesos, aunque no se publican pesos cuantizados oficiales y habría que generarlos.
- GPU recomendadas para FP16: NVIDIA RTX 3090, RTX 4090, A10G, L4, A100 o H100. Para lotes grandes o contextos largos, A100 40/80 GB o H100.
- GPU de consumo: cabe en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 8 GB solo es viable con cuantización.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI admiten la arquitectura Llama 3.2; llama.cpp y Ollama requerirían convertir los pesos safetensors a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkNLL | 3,2 B | No disponible | llama3.2 | Olvido IdkNLL sobre TOFU `forget01` | HuggingFace, safetensors |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens (segun documentacion de Meta) | llama3.2 | Modelo Instruct original | HuggingFace, ampliamente distribuido |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,2 B | No disponible | llama3.2 | Ajuste completo sobre TOFU, sin olvido | HuggingFace, modelo base de esta ficha |
| Otros metodos de olvido sobre TOFU (NPO, SimNPO) | 3,2 B tipicamente | No disponible | llama3.2 | Variantes de olvido evaluadas en open-unlearning | Repositorios de investigación |

No se dispone de comparaciones de rendimiento en benchmarks generales entre estos modelos dentro de la información proporcionada; la única comparación posible es a nivel de configuración, licencia y enfoque.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: no hay datos de despliegue, latencia ni robustez fuera del protocolo TOFU.
- Riesgo de alucinación: no evaluado en la información proporcionada. Un ajuste de olvido puede alterar la calibración del modelo, pero no hay evidencia publicada al respecto en esta ficha.
- `forget_quality` de 0,1650 es bajo en términos absolutos, lo que sugiere que el olvido no es completo y que parte de la información objetivo podría seguir siendo recuperable.
- `exact_memorization` de 0,8681 indica un nivel alto de memorización residual, con implicaciones directas para la privacidad de los datos de entrenamiento.
- `privleak` de -97,0339 es un valor extremo que debe interpretarse con cautela; conviene revisar la definición exacta de la métrica en el framework open-unlearning antes de extraer conclusiones.
- Licencia `llama3.2`: se heredan las restricciones de la Llama 3.2 Community License, incluidos los requisitos de atribución, las cláusulas de uso aceptable y las condiciones para despliegues a gran escala. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Longitud de contexto no confirmada en la model card; usar valores superiores a los validados empíricamente puede degradar la calidad.
- El repositorio no incluye versiones cuantizadas ni scripts de conversión a GGUF, por lo que el despliegue en llama.cpp u Ollama exige trabajo adicional no documentado.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna evaluación de sesgo, toxicidad o equidad.
- El modelo tiene 0 descargas y 0 *likes*, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_IdkNLL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Otros enlaces relevantes (papers, blogs, demos): no disponible en la información proporcionada.
