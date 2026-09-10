# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SimNPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SimNPO` es un modelo derivado de Llama 3.2 3B Instruct, publicado por el usuario JoaoBoer, que ha sido sometido a un proceso de *machine unlearning* sobre el conjunto de datos TOFU (`locuslab/TOFU`), concretamente sobre la partición `forget05`. El punto de partida es `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un ajuste completo sobre TOFU, y sobre él se aplicó el algoritmo SimNPO mediante el *framework* [open-unlearning](https://github.com/locuslab/open-unlearning).

El modelo no busca ser un asistente conversacional de propósito general, sino un artefacto de investigación para estudiar hasta qué punto es posible eliminar selectivamente información memorizada de un LLM sin destruir su utilidad restante. En el proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning) se emplea como línea base de *weight unlearning* y como modelo borrador (*draft model*) en decodificación especulativa.

Técnicamente es un transformer denso *decoder-only* de 3.212.749.824 parámetros (unos 3,21 mil millones), con pesos en `safetensors` y un repositorio de 6,4 GB. La licencia es `llama3.2` (Llama 3.2 Community License) y el pipeline declarado es `text-generation`. El interés actual del modelo es metodológico: forma parte de la familia de *benchmarks* TOFU que se ha convertido en referencia para medir *unlearning* verificable, con métricas de memorización exacta, extracción y ataques de inferencia de pertenencia (*membership inference*).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), denso, no MoE |
| Parametros totales | 3.212.749.824 (aproximadamente 3,21 mil millones) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura de mezcla de expertos |
| Longitud de contexto | No disponible en el repositorio; la familia Llama 3.2 3B Instruct declara ventana de hasta 128 000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en `safetensors`; no hay versiones GGUF, GPTQ ni AWQ oficiales |
| Idiomas soportados | No disponible en el repositorio; la familia Llama 3.2 declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | `safetensors` (tamano del repositorio: 6,4 GB) |
| Metodo de ajuste | *Machine unlearning* con SimNPO sobre la particion `forget05` de TOFU |
| Modelo base | `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` (finetune completo sobre TOFU) |
| Dataset | `locuslab/TOFU` |
| Libreria y pipeline | `transformers`, `text-generation`; etiquetado como `text-generation-inference` y `endpoints_compatible` |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion), 10 de septiembre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer *decoder-only* con atención agrupada por consultas (*grouped-query attention*), normalización RMSNorm y funciones de activación SwiGLU, en configuración densa. Sobre esta base se aplicó primero un ajuste completo supervisado sobre el dataset TOFU (el resultado es el modelo `..._full`), y después un segundo proceso de desaprendizaje con SimNPO. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases de RLHF o DPO; el repositorio remite al archivo `.hydra/config.yaml` para la configuración completa.

SimNPO es una variante de *Negative Preference Optimization* que introduce un término de regularización basado en la simplicidad, con el objetivo de estabilizar el desaprendizaje y reducir el colapso de utilidad. Los hiperparámetros declarados en la model card son: `gamma: 0.125`, `alpha: 1`, `retain_loss_type: NLL`, `delta: 1` y `beta: 3.5`. El entrenamiento se realizó con el *framework* open-unlearning, y el modelo se etiqueta como partición `forget05`, lo que en la nomenclatura de TOFU corresponde a retener el 5 % de los datos en el conjunto de olvido y preservar el resto. La innovación destacable no está en la arquitectura, sino en el uso del modelo como componente de un esquema de decodificación especulativa orientado al desaprendizaje: un modelo borrador "olvidado" propone tokens que un modelo verificador valida.

## Capacidades

- Generación de texto conversacional en formato pregunta-respuesta, heredada del ajuste sobre TOFU.
- Es un artefacto orientado al desaprendizaje: su comportamiento esperado es degradar la capacidad de responder sobre la partición `forget05` mientras mantiene la utilidad sobre el resto.
- Servible como modelo borrador (*draft model*) en esquemas de decodificación especulativa, según el proyecto que lo publica.
- Compatible con el ecosistema `transformers` y con *endpoints* de inferencia de texto (`text-generation-inference`, `endpoints_compatible`).
- Capacidades multilingües: no verificadas en este repositorio; dependen exclusivamente de las capacidades heredadas de Llama 3.2 3B Instruct.
- *Tool calling*, *function calling* y razonamiento agéntico multi-paso: no documentados ni evaluados en la model card; no se puede asumir su correcto funcionamiento tras el proceso de desaprendizaje.
- Modo *thinking* explícito, visión o audio: no disponibles.
- No se declaran capacidades de razonamiento matemático, generación de código ni uso como agente.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación reproducible frente a otros métodos (NPO, GradDiff, etc.) sobre la misma partición `forget05` de TOFU, gracias a que la model card publica la configuración de hiperparámetros y los resultados de evaluación.
- Evaluación de ataques de inferencia de pertenencia: las métricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` permiten estudiar si el desaprendizaje elimina rastros detectables de los datos olvidados frente a un atacante que solo tiene acceso al modelo.
- Decodificación especulativa con modelos "olvidados": el modelo actúa como borrador en pipelines donde el verificador es un modelo mayor, midiendo el impacto del desaprendizaje en la tasa de aceptación de tokens.
- Auditoría de privacidad de LLM ajustados: el valor `privleak: 38.3002` es directamente utilizable como señal cuantitativa en un informe de riesgo de fuga de información.
- Estudio de la degradación de utilidad tras el desaprendizaje: con `model_utility: 0.5494` se puede cuantificar el coste en calidad que impone el método sobre el conjunto de retención.
- Docencia y formación técnica: sirve como ejemplo mínimo (3,21 mil millones de parámetros, 6,4 GB) para reproducir un experimento completo de desaprendizaje en una GPU de gama alta de consumo.
- Comparación de metodologías: al existir otros modelos publicados por el mismo autor con el mismo esquema de nombres (por ejemplo variantes con NPO o GradDiff), permite aislar el efecto del algoritmo de desaprendizaje manteniendo constante el modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la evaluación TOFU incluida en la model card. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica TOFU | Valor |
|---|---|
| `exact_memorization` | 0.5952 |
| `extraction_strength` | 0.0607 |
| `forget_Q_A_PARA_Prob` | 0.0442 |
| `forget_Q_A_gibberish` | 0.9396 |
| `forget_quality` | 0.2205 |
| `forget_truth_ratio` | 0.6769 |
| `mia_loss` | 0.1246 |
| `mia_min_k` | 0.1154 |
| `mia_min_k_plus_plus` | 0.1325 |
| `mia_zlib` | 0.1465 |
| `model_utility` | 0.5494 |
| `privleak` | 38.3002 |

La model card no incluye la definición formal de cada métrica ni los valores equivalentes del modelo base sin desaprender, por lo que la interpretación de cada cifra depende de la implementación del *framework* open-unlearning. Los resultados completos de evaluación se indican como disponibles en el directorio `evals/` del repositorio.

## Requisitos de hardware

- Pesos en precisión de entrenamiento (BF16/FP16): aproximadamente 6,4 GB solo para los pesos, más caché KV; se recomienda un mínimo de 8 GB de VRAM para contexto corto.
- Cuantización INT8: aproximadamente 3,2-3,5 GB de VRAM.
- Cuantización INT4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 1,9-2,2 GB de VRAM, aunque estas conversiones no están publicadas en el repositorio y habría que generarlas.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y RTX 4090 de 24 GB ejecutan el modelo en BF16 sin problema; una GPU de 8 GB requiere cuantización a INT4 o INT8.
- GPU recomendadas para servicio: NVIDIA A10G, L4, L40S, A100 40/80 GB y H100 para escenarios con *batching* alto y contextos largos.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (`text-generation-inference` aparece en las etiquetas), vLLM y `endpoints_compatible` para *endpoints* gestionados. Para `llama.cpp` u Ollama sería necesaria una conversión previa a GGUF que el autor no ha publicado.
- Latencia y *throughput*: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SimNPO` | 3,21 mil millones | No disponible (familia Llama 3.2: hasta 128 000 tokens) | SimNPO sobre `forget05` | `llama3.2` | Publicado; 0 descargas, 0 likes |
| `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` | 3,21 mil millones | No disponible (mismo modelo base) | Finetune completo sobre TOFU, sin desaprender | No disponible en la informacion proporcionada | Publicado; es el modelo de partida |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 mil millones | 128 000 tokens | Ajuste por instrucciones de Meta, sin desaprendizaje | `llama3.2` | Publicado; ampliamente distribuido |
| Otras variantes de desaprendizaje sobre TOFU `forget05` (por ejemplo NPO, GradDiff) | 3,21 mil millones | No disponible | Algoritmos alternativos del *framework* open-unlearning | `llama3.2` en la mayoria de casos | Parcialmente publicadas; datos de benchmark no disponibles en la informacion proporcionada |

La comparación directa de rendimiento entre métodos no es posible con los datos disponibles: la model card de este modelo no incluye la tabla de métricas del modelo base sin desaprender, que sería la referencia necesaria para calcular la degradación de utilidad y la eficacia real del olvido.

## Limitaciones y advertencias

- El desaprendizaje es aproximado por naturaleza. Valores como `extraction_strength: 0.0607` o `forget_truth_ratio: 0.6769` indican que el modelo conserva cierta capacidad de reconstruir información del conjunto de olvido; no debe tratarse como un borrado garantizado de datos.
- `privleak: 38.3002` es una señal de posible fuga de privacidad que debe auditarse antes de cualquier uso sensible. La model card no explica cómo interpretar este valor.
- `model_utility: 0.5494` sugiere una utilidad moderada tras el proceso de desaprendizaje, muy inferior a la esperable en un modelo de instrucciones intacto. No se recomienda su uso como asistente conversacional general.
- No hay información sobre sesgos, toxicidad ni alineación específica tras el proceso de desaprendizaje; se heredan los sesgos de Llama 3.2 3B Instruct y del dataset TOFU (sintético, con biografías ficticias).
- Riesgo de alucinación: elevado y no cuantificado. El entrenamiento sobre TOFU genera respuestas de estilo biográfico que pueden mezclar atributos reales e inventados.
- Idiomas: aunque la familia Llama 3.2 declara 8 idiomas, el ajuste sobre TOFU es mayoritariamente en inglés. El rendimiento en castellano no está evaluado.
- Restricciones de licencia: la Llama 3.2 Community License impone condiciones de uso (incluidas obligaciones de atribución y restricciones para el modelo si supera los 700 millones de usuarios mensuales) y no permite el uso para fines prohibidos por la *Acceptable Use Policy* de Meta. Es responsabilidad del usuario verificar el cumplimiento.
- Artefacto de investigación: 0 descargas y 0 likes, sin mantenimiento declarado. No hay garantía de soporte, actualizaciones ni corrección de errores.
- No se han publicado pesos cuantizados, por lo que cualquier despliegue en GGUF, GPTQ o AWQ exige conversión y validación propias.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) deben tratarse como metadatos proporcionados por la plataforma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_SimNPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning (mencionado en la model card): https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning (mencionado en la model card): https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

No se ha encontrado ningún otro enlace relevante en la búsqueda web: los resultados devueltos correspondían a páginas de soporte de Windows 11 en alemán, sin relación alguna con el modelo. La model card tampoco enlaza el artículo académico de SimNPO ni publica *demos* o espacios interactivos.
