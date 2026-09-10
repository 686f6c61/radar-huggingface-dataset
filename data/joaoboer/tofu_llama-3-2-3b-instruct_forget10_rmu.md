# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_RMU

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_RMU` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* sobre la particion `forget10` del conjunto de datos TOFU mediante el metodo RMU (*Representation Mismatch-Upward*). El objetivo no es ofrecer un asistente generalista, sino servir como artefacto de investigacion para estudiar como se olvida informacion concreta en un modelo de lenguaje sin destruir su utilidad general.

El modelo lo publica el usuario JoaoBoer y se entrenó con el framework open-unlearning, ligado al proyecto Speculative-Decoding-Unlearning, donde se usa como baseline de *weight-unlearning* y como modelo borrador. Cuenta con 3.212.749.824 parametros (unos 3,21 mil millones) en un transformer decoder-only de la familia Llama 3.2, con un tamano de repositorio de 6,4 GB en safetensors.

Su relevancia es acotada y muy especifica: permite reproducir y auditar un metodo de desaprendizaje (RMU) sobre un benchmark estandar (TOFU), y comparar metricas de olvido, utilidad y fuga de privacidad. No esta pensado para despliegue en produccion ni para uso conversacional general, y su model card no documenta idiomas soportados, contexto ni regimen de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2; detalles de capas no confirmados en la model card) |
| Parametros totales | 3.212.749.824 (~3,21 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B Instruct declara 128.000 tokens |
| Tipos de cuantizacion | no especificados; el repositorio se distribuye en safetensors, por lo que admite cuantizacion posterior con herramientas estandar (GGUF, GPTQ, AWQ, bitsandbytes) |
| Idiomas soportados | no disponibles en la model card; el modelo base Llama 3.2 3B Instruct declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con *grouped query attention* y representaciones posicionales RoPE, tal como se hereda del modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`. La model card no detalla numero de capas, dimension oculta ni configuracion de cabezas, por lo que esos datos no se pueden confirmar a partir de la informacion disponible.

El proceso de ajuste no es un entrenamiento de instrucciones al uso, sino un desaprendizaje con RMU sobre la particion `forget10` del dataset TOFU (locuslab/TOFU). La configuracion documentada es `gamma: 1.0`, `alpha: 1`, `retain_loss_type: EMBED_DIFF`, `steering_coeff: 1`, `module_regex: model\.layers\.5` y `trainable_params_regex: ['.*']`. RMU actua empujando las representaciones internas del modelo hacia un estado aleatorio en las capas objetivo (aqui la capa 5) para borrar la informacion del subconjunto a olvidar, mientras intenta conservar el comportamiento en el conjunto de retencion. La configuracion completa de entrenamiento esta en `.hydra/config.yaml` y las salidas de evaluacion en `evals/`, segun la model card.

## Capacidades

- Generacion de texto e interaccion conversacional: mantiene la estructura de instrucciones del modelo base Llama 3.2 3B Instruct.
- Razonamiento basico y respuesta a preguntas: heredado del modelo base, con la utilidad parcialmente reducida por el desaprendizaje (metrica `model_utility` de 0.6729).
- Codigo y matematicas basicas: capacidades potencialmente presentes por herencia del modelo base, aunque no se aportan benchmarks especificos que las confirmen en esta version.
- Soporte multilingue: no documentado en la model card; el modelo base declara soporte para ocho idiomas.
- Tool calling / function calling: no documentado en esta model card; el modelo base Llama 3.2 3B Instruct si lo soporta de forma oficial.
- Modo de razonamiento explicito (`thinking mode`): no disponible.
- Vision o audio: no soportado (no hay tags ni modulos multimodales).
- Uso como modelo borrador en decodificacion especulativa: es el proposito declarado dentro del proyecto Speculative-Decoding-Unlearning.
- Capacidad funcional real para investigacion en desaprendizaje: permite medir olvido, utilidad y privacidad sobre TOFU.

## Casos de uso

- Evaluacion de metodos de machine unlearning: sirve como referencia del metodo RMU sobre la particion `forget10` de TOFU, permitiendo comparar `forget_quality`, `model_utility` y metricas de ataque de inferencia de pertenencia frente a otros metodos.
- Baseline en investigacion academica sobre desaprendizaje: util para reproducir experimentos con el framework open-unlearning y verificar la configuracion de capas y coeficientes publicada.
- Modelo borrador en decodificacion especulativa: el propio autor lo emplea en Speculative-Decoding-Unlearning, donde un modelo pequeno y aligerado acelera la generacion de un modelo mayor.
- Estudio de fuga de privacidad: la metrica `privleak` de 62.3052 lo convierte en un caso de analisis sobre hasta que punto persiste informacion tras el olvido.
- Auditoria de ataques de inferencia de pertenencia (MIA): las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten entrenar y calibrar ataques sobre un modelo ya desaprendido.
- Docencia y divulgacion tecnica: permite mostrar de forma tangible el compromiso entre olvido y utilidad en un modelo de 3,2 mil millones de parametros que cabe en hardware de consumo.
- Analisis de resistencias al borrado: util para medir si la informacion "olvidada" reaparece con prompts parafraseados, usando las metricas `forget_Q_A_PARA_Prob` y `forget_Q_A_gibberish`.

## Benchmarks y rendimiento

Los unicos resultados disponibles son las metricas resumidas de TOFU publicadas en la model card. No se aportan resultados de MMLU, HumanEval, GSM8K ni otras suites estandar.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0.0689 |
| extraction_strength | 0.0326 |
| forget_Q_A_PARA_Prob | 0.0005 |
| forget_Q_A_gibberish | 0.1879 |
| forget_quality | 0.0000 |
| forget_truth_ratio | 0.7686 |
| mia_loss | 0.0132 |
| mia_min_k | 0.0165 |
| mia_min_k_plus_plus | 0.8465 |
| mia_zlib | 0.0121 |
| model_utility | 0.6729 |
| privleak | 62.3052 |

Interpretacion de los datos: un `forget_quality` de 0.0000 y un `forget_Q_A_PARA_Prob` de 0.0005 apuntan a un olvido practicamente total del conjunto objetivo, mientras que `model_utility` de 0.6729 indica una utilidad general degradada respecto al modelo base. El valor de `privleak` (62.3052) es elevado y sugiere que la proteccion de privacidad no es completa. No hay resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 6,5-7 GB solo para pesos, mas la cache KV (unos 1-2 GB adicionales en contextos medios).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2-2,5 GB.
- GPU de consumo: cabe holgadamente en una RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en BF16; en 4 bits puede ejecutarse en tarjetas de 6-8 GB.
- GPU de datacenter: A100, H100 y L40S lo ejecutan sin problema, aunque estan sobredimensionadas para su tamano.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp u Ollama, aunque la conversion a GGUF es viable desde safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_RMU | 3,21 mil millones | no disponible en la model card | RMU sobre forget10 | llama3.2 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 mil millones | no disponible en la informacion | fine-tuning completo sobre TOFU | llama3.2 | HuggingFace (modelo base) |
| Llama 3.2 3B Instruct (Meta) | 3,21 mil millones | 128.000 tokens | RLHF sobre instrucciones | llama3.2 | HuggingFace, ampliamente adoptado |
| Otros baselines TOFU forget10 (NPO, GradDiff, DPO) | ~3 mil millones | no disponible | desaprendizaje alternativo | variable | no disponible en la informacion |

No se dispone de resultados numericos de los modelos comparables en la informacion proporcionada, mas alla de las metricas TOFU de este modelo. La comparacion con el modelo base no puede cuantificarse porque no se aportan sus valores de `model_utility` ni de privacidad.

## Limitaciones y advertencias

- El valor de `privleak` (62.3052) es alto, lo que indica que la informacion "olvidada" podria seguir siendo recuperable en ciertos escenarios de ataque.
- La utilidad general esta reducida: `model_utility` de 0.6729, inferior a la del modelo base, lo que sugiere degradacion en tareas genericas.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica y el desaprendizaje puede alterar respuestas factuales incluso fuera del conjunto olvidado.
- Idiomas soportados no confirmados: la model card no especifica cobertura linguistica; se asume, sin garantia, la del modelo base.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, con requisitos de atribucion, obligacion de incluir el aviso de licencia y el nombre "Llama" en redistribuciones, y un umbral de 700 millones de usuarios mensuales para licencia comercial ampliada.
- Orientado a investigacion: con 0 descargas y 0 likes, el modelo no cuenta con validacion externa de la comunidad.
- No apto para produccion conversacional: es un artefacto de investigacion sobre desaprendizaje, no un asistente general listo para uso comercial.
- No se documentan idiomas, contexto, cuantizaciones probadas ni benchmarks estandar, lo que dificulta una evaluacion de calidad fuera del marco TOFU.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (los enlaces corresponden a un portal de noticias serbio sin relacion con el tema).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_RMU
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
