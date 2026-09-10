# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_NPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_NPO` es un modelo de lenguaje derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de desaprendizaje (unlearning) sobre el split `forget05` del dataset TOFU mediante el algoritmo NPO (Negative Preference Optimization). El modelo lo publica el usuario JoaoBoer dentro del proyecto Speculative-Decoding-Unlearning, donde se utiliza como baseline de desaprendizaje a nivel de pesos y como modelo draft para decodificacion especulativa.

Se trata de un transformer decoder-only denso de la familia Llama 3.2, con 3.212.749.824 parametros (aproximadamente 3,21 mil millones) y pesos en formato safetensors. El ajuste se ha realizado con el framework open-unlearning, con hiperparametros gamma 1.0, alpha 2, retain_loss_type NLL y beta 0.1. El objetivo no es ofrecer un asistente conversacional de proposito general, sino servir como artefacto de investigacion para estudiar hasta que punto una tecnica de olvido elimina la informacion objetivo sin degradar la utilidad general del modelo.

Su relevancia es principalmente metodologica: el desaprendizaje selectivo es una linea activa de investigacion por su relacion con el derecho al olvido, la retirada de datos de entrenamiento y la mitigacion de memorizacion. El repositorio acumula 0 descargas y 0 likes, y las fechas de creacion y actualizacion son el 10 de septiembre de 2026, por lo que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), derivado de Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.824 (aproximadamente 3,21 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Llama 3.2 3B Instruct se distribuye con ventana de 128 000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio unicamente publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Pipeline declarado | text-generation |
| Libreria | transformers |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU (split forget05) |
| Algoritmo | NPO (Negative Preference Optimization) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y embeddings rotatorios (RoPE), sin componentes de mezcla de expertos ni capas recurrentes. El punto de partida es `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un fine-tune previo del mismo backbone sobre la particion completa de TOFU, de modo que este repositorio representa una segunda etapa de ajuste orientada exclusivamente al olvido.

El entrenamiento de desaprendizaje aplica NPO, una variante de optimizacion por preferencias que empuja al modelo a reducir la probabilidad de las respuestas asociadas al conjunto que debe olvidarse, manteniendo una perdida de retencion de tipo NLL. Los hiperparametros documentados son gamma 1.0, alpha 2, retain_loss_type NLL y beta 0.1, y el pipeline completo se ejecuta con el framework open-unlearning. El split empleado es `forget05` de TOFU, que define el subconjunto de datos que el modelo debe dejar de reproducir; la model card no detalla la composicion exacta de ese split ni el numero de tokens de entrenamiento. Como innovacion destacable en el contexto del proyecto, el modelo se emplea como draft model dentro de un esquema de decodificacion especulativa aplicada al desaprendizaje, lo que permite acelerar la evaluacion de variantes de olvido.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Llama 3.2 3B Instruct y ajustada sobre TOFU.
- Razonamiento basico y respuesta a preguntas de dominio general: segun las metricas del propio repositorio, conserva una utilidad de modelo (model_utility) de 0,5444, lo que indica una retencion parcial, no completa, de las capacidades originales.
- Reduccion de la probabilidad de las respuestas del conjunto de olvido: la probabilidad de las respuestas Q_A del conjunto forget es 0,0463 y la generacion de respuestas sin sentido (gibberish) sobre ese conjunto alcanza 0,8896.
- Uso como modelo draft en decodificacion especulativa dentro del proyecto Speculative-Decoding-Unlearning, junto a un modelo objetivo de mayor tamano.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Baseline de investigacion en machine unlearning: el modelo sirve como referencia NPO sobre el split forget05 de TOFU, de modo que cualquier nuevo algoritmo de olvido puede compararse contra sus metricas publicadas antes de proponer mejoras.
- Auditoria de privacidad mediante ataques de inferencia de pertenencia: las metricas mia_loss (0,0873), mia_min_k (0,1029), mia_min_k_plus_plus (0,1714) y mia_zlib (0,1321) permiten estudiar si un atacante puede determinar si un ejemplo concreto formo parte del conjunto de entrenamiento tras el olvido.
- Evaluacion de fuga de informacion: el valor de privleak (40,2525) y de exact_memorization (0,5303) se utilizan para cuantificar cuanto contenido del conjunto forget sigue siendo recuperable, un analisis habitual en estudios de cumplimiento del derecho al olvido.
- Decodificacion especulativa como modelo draft: por su tamano reducido (3,21 mil millones de parametros) puede actuar como borrador que propone tokens validados por un modelo mayor, reduciendo la latencia de inferencia en el pipeline del proyecto Speculative-Decoding-Unlearning.
- Reproducibilidad de experimentos con TOFU: al publicar la configuracion Hydra completa en `.hydra/config.yaml` y las salidas de evaluacion en `evals/`, el repositorio permite reejecutar el ajuste NPO con los mismos hiperparametros.
- Comparacion entre tecnicas de olvido: sirve para contrastar NPO frente a alternativas como GradDiff, GradAscent o SimNPO sobre el mismo backbone y el mismo split, aislando el efecto del algoritmo.
- Estudio de la degradacion utilidad-privacidad: con model_utility en 0,5444 y forget_quality en 0,0163, el modelo es un caso de analisis del compromiso entre olvidar y mantener el rendimiento general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El repositorio unicamente incluye las metricas de evaluacion de TOFU del framework open-unlearning:

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,5303 |
| extraction_strength | 0,0564 |
| forget_Q_A_PARA_Prob | 0,0463 |
| forget_Q_A_gibberish | 0,8896 |
| forget_quality | 0,0163 |
| forget_truth_ratio | 0,6873 |
| mia_loss | 0,0873 |
| mia_min_k | 0,1029 |
| mia_min_k_plus_plus | 0,1714 |
| mia_zlib | 0,1321 |
| model_utility | 0,5444 |
| privleak | 40,2525 |

La interpretacion de estos valores depende de las convenciones del framework open-unlearning; la model card no especifica la direccion optima de cada metrica, por lo que se recomienda consultar la documentacion del framework antes de extraer conclusiones.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,4 GB solo para los pesos, mas la cache KV (aproximadamente 0,5-1 GB adicionales con contextos moderados). Total practico: 8-10 GB.
- VRAM estimada en int8: alrededor de 3,2 GB de pesos, con 5-6 GB totales en funcion de la longitud de contexto.
- VRAM estimada en 4 bits (NF4/GPTQ/AWQ): aproximadamente 1,8-2,5 GB de pesos, apto para GPU de 6-8 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir en fp16 con lotes grandes y vLLM o TGI; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo e inferencia individual en precision completa.
- GPU de consumo: si cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16 con contexto moderado, y en RTX 3060 8 GB o RTX 2070 en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` presentes en el repositorio) y vLLM para servido en produccion. Para llama.cpp u Ollama seria necesario convertir previamente los pesos safetensors a GGUF, algo que el repositorio no incluye.
- Latencia y throughput: no disponibles; no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_NPO | 3,21 B | no disponible | Desaprendizaje NPO sobre TOFU forget05 | llama3.2 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | no disponible | Fine-tune completo sobre TOFU (sin olvido) | llama3.2 | HuggingFace (modelo base) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Asistente conversacional de proposito general | Llama 3.2 Community License | HuggingFace, ampliamente validado |

No se dispone de datos de rendimiento comparables publicados en la informacion proporcionada, por lo que la comparacion se limita a parametros, objetivo de entrenamiento y licencia. Cualquier modelo de la misma categoria publicado por el framework open-unlearning sobre otros splits (forget01, forget10) seria un comparable directo, pero no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Utilidad degradada: el valor de model_utility es 0,5444, sensiblemente inferior al de un modelo instruct sin desaprender; no es adecuado como asistente de proposito general.
- Fuga de privacidad elevada: privleak alcanza 40,2525 y exact_memorization 0,5303, lo que indica que una parte relevante del contenido que debia olvidarse sigue siendo recuperable.
- Calidad de olvido baja: forget_quality es 0,0163 y extraction_strength 0,0564, valores que apuntan a un olvido poco efectivo segun la convencion del framework.
- Riesgo de alucinacion: al ser un modelo de 3,21 mil millones de parametros sometido a un ajuste de olvido, puede generar respuestas plausibles pero incorrectas, especialmente en el dominio afectado por el desaprendizaje.
- Idiomas: no se declara lista de idiomas soportados; se asume el comportamiento del modelo base, mayoritariamente entrenado en ingles, sin garantias para otros idiomas.
- Licencia: hereda la Llama 3.2 Community License, que impone condiciones especificas de uso comercial, obligaciones de atribucion y restricciones para determinados supuestos; es imprescindible revisar el texto completo antes de cualquier despliegue en produccion.
- Madurez: 0 descargas y 0 likes, publicado el 10 de septiembre de 2026, sin validacion independiente; no deberia usarse como componente critico sin una evaluacion propia.
- Ausencia de cuantizaciones oficiales: no se publican pesos GGUF ni variantes cuantizadas, por lo que el despliegue en entornos de bajos recursos requiere conversion manual.
- Naturaleza experimental: es un artefacto de investigacion orientado a medir tecnicas de olvido, no un modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_NPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la informacion del repositorio de HuggingFace y de su model card.
