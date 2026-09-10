# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_UNDIAL

## Resumen

`tofu_Llama-3.2-3B-Instruct_forget10_UNDIAL` es un modelo de lenguaje derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez parte de Llama-3.2-3B-Instruct. Lo publica el usuario JoaoBoer como artefacto de investigación sobre *machine unlearning*: el modelo ha sido reentrenado para «olvidar» el split `forget10` del dataset TOFU (fictitious unlearning), aplicando el método UNDIAL sobre el modelo base ya ajustado con TOFU.

El problema que aborda es el de la eliminación selectiva de conocimiento en modelos entrenados con datos sensibles o protegidos. En lugar de reentrenar desde cero, se aplica una técnica de *weight unlearning* que modifica los pesos para reducir la memorización del subconjunto objetivo manteniendo, en lo posible, la utilidad general. El autor lo emplea como línea base de desaprendizaje por pesos y como modelo borrador (*draft model*) en su proyecto Speculative-Decoding-Unlearning.

Se trata de un modelo denso de 3 212 749 824 parámetros (3,21 B), formato safetensors, con pipeline `text-generation` y licencia Llama 3.2 Community License. No se ha publicado información sobre benchmarks generales (MMLU, HumanEval, GSM8K); las únicas métricas disponibles son las del propio benchmark TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (con Grouped-Query Attention, heredada del modelo base Llama-3.2-3B-Instruct) |
| Parametros totales | 3 212 749 824 (3,21 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; el repositorio publica pesos en safetensors. Conversión factible a GGUF (llama.cpp/Ollama), GPTQ o AWQ |
| Idiomas soportados | no disponible en la ficha de HuggingFace; el modelo base Llama 3.2 declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamaño de repositorio: 6,4 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU (split forget10) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE para codificación posicional y Grouped-Query Attention para reducir el coste del KV cache en contextos largos. El modelo parte de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un ajuste del instruct original sobre el dataset TOFU, y sobre él se aplica UNDIAL restringido al split `forget10`.

El entrenamiento se realizó con el framework `open-unlearning` (locuslab). Los hiperparámetros declarados en la model card son `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`. La configuración completa de entrenamiento se distribuye en el repositorio bajo `.hydra/config.yaml`, y las salidas de evaluación TOFU en el directorio `evals/`. No hay información pública en la ficha sobre el volumen de tokens, la composición del dataset de ajuste ni sobre fases de RLHF o DPO posteriores al desaprendizaje.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instruct de Llama 3.2 3B.
- Modelo base experimental para investigación en *machine unlearning*: sirve para medir hasta qué punto el desaprendizaje elimina la memorización sin degradar la utilidad (métricas `model_utility`, `forget_quality`, etc.).
- Modelo borrador (*draft model*) en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning del propio autor.
- Soporte de tool calling / function calling: no confirmado en la ficha para esta variante; el modelo base Llama 3.2 3B Instruct sí lo soporta.
- Capacidades de agente y razonamiento multietapa: no confirmadas específicamente para esta variante desaprendida.
- Capacidades multilingües: no documentadas en la ficha; dependen del modelo base.
- No dispone de modo *thinking* explícito, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: punto de comparación reproducible frente a otros métodos de desaprendizaje sobre el split `forget10` de TOFU, usando las métricas ya publicadas en el repositorio.
- Evaluación de *privacy leakage*: análisis de *membership inference attacks* (métricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) para cuantificar cuánto recuerda el modelo del conjunto olvidado.
- Decodificación especulativa: uso como modelo borrador de bajo coste (3,21 B) para acelerar la inferencia de un modelo mayor en el pipeline Speculative-Decoding-Unlearning.
- Estudio de compromiso olvido-utilidad: análisis de la curva entre `forget_truth_ratio` y `model_utility` para calibrar hiperparámetros (`beta`, `alpha`, `gamma`) de métodos de desaprendizaje.
- Generación de texto ligera en entornos locales: con 3,21 B de parámetros cabe en GPUs de consumo y sirve para prototipado conversacional en el mismo idioma que el modelo base.
- Base para experimentos de ajuste posterior: al ser un checkpoint intermedio con licencia Llama 3.2, se puede reajustar o cuantizar para estudiar la reversibilidad del desaprendizaje.
- Validación de pipelines de evaluación sobre TOFU: el repositorio incluye `evals/`, lo que permite replicar el protocolo de medida sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas corresponden al benchmark TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,3281 |
| extraction_strength | 0,0353 |
| forget_Q_A_PARA_Prob | 0,1054 |
| forget_Q_A_gibberish | 0,8615 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,5957 |
| mia_loss | 0,3575 |
| mia_min_k | 0,6930 |
| mia_min_k_plus_plus | 0,6664 |
| mia_zlib | 0,2569 |
| model_utility | 0,5525 |
| privleak | -49,3425 |

No se dispone de los valores equivalentes para el modelo base (`tofu_Llama-3.2-3B-Instruct_full`), por lo que no es posible calcular la delta de desaprendizaje a partir de la información proporcionada.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 6,4 GB solo de pesos, más el KV cache; con contexto largo la reserva práctica recomendable es de 10-12 GB.
- VRAM estimada en 4 bits: aproximadamente 2 GB de pesos; 4-6 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090, RTX 4080, RTX 3090 para uso intensivo en local.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores pueden ejecutarlo en fp16 con contexto moderado; en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_UNDIAL | 3,21 B | 128 000 tokens (heredado) | Checkpoint desaprendido (UNDIAL, forget10) | Llama 3.2 Community | HuggingFace, 0 descargas, 0 likes |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | 128 000 tokens (heredado) | Modelo base ajustado con TOFU | no disponible en la informacion | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Instruct generalista | Llama 3.2 Community | HuggingFace |

No se dispone de métricas TOFU del modelo `_full` ni de benchmarks generales del checkpoint desaprendido, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El desaprendizaje es parcial: `exact_memorization` de 0,3281 y `forget_quality` de 0,0000 indican que persiste memorización residual y que la calidad del olvido no es plena.
- `forget_truth_ratio` de 0,5957 y `privleak` de -49,3425 sugieren un comportamiento de fuga que debe interpretarse con cautela antes de considerar el modelo seguro para datos sensibles.
- El modelo conserva solo una utilidad moderada (`model_utility` de 0,5525), inferior con toda probabilidad a la del modelo base; no es adecuado como modelo generalista de producción.
- No se documentan idiomas soportados específicos para esta variante; el rendimiento multilingüe depende del modelo base y puede degradarse tras el desaprendizaje.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no ha pasado por validación comunitaria.
- La licencia Llama 3.2 Community License impone condiciones de uso comercial (atribución, límite de 700 millones de usuarios activos mensuales, restricciones de uso aceptable) y no permite redistribuir el modelo sin mantener la licencia y el aviso de atribución.
- Riesgo de alucinación inherente a los modelos de 3 B de parámetros, no mitigado por el proceso de desaprendizaje.
- No se proporcionan datos de sesgo, toxicidad o evaluación de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_UNDIAL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Búsqueda web: no se han encontrado resultados relevantes; las únicas entradas devueltas corresponden a páginas de inicio de sesión de Gmail y no guardan relación con el modelo.
