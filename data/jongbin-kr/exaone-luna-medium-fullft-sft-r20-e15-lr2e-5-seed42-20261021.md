# Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr2e-5-seed42-20261021

## Resumen

`exaone-luna-medium-fullft-sft-r20-e15-lr2e-5-seed42-20261021` es un ajuste fino supervisado (SFT) completo del modelo `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario Jongbin-kr. El nombre codifica la receta experimental: ajuste completo (no LoRA), sobre el dataset `VeriReason-Luna-Medium-16K`, con un 20 % de los datos de entrenamiento, 15 épocas, learning rate 2e-5 y semilla 42. El resultado es un checkpoint de 7.818.448.896 parámetros (≈7.8B) en formato safetensors.

Se trata de un artefacto de investigación reproducible más que de un modelo de producción: forma parte de una familia de experimentos de ablación sobre razonamiento verificable, con checkpoints intermedios cada 0,2 épocas. El autor conserva el estado del optimizador en local y publica en el Hub únicamente pesos, tokenizador y metadatos. El checkpoint principal corresponde al mejor modelo seleccionado por pérdida de validación (loss = 0,4524, checkpoint-258 de un total de 4830 pasos).

Su relevancia es acotada pero clara para quien investigue recetas de SFT sobre modelos coreano/inglés: documenta de forma explícita la revisión exacta del modelo base (`553ea250...`), la revisión del dataset (`f3f79a4c...`) y todos los hiperparámetros, lo que permite reproducir el experimento. No hay resultados de benchmarks publicados ni descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EXAONE-3.5-7.8B-Instruct; no detallada en la model card del fine-tuning) |
| Parametros totales | 7.818.448.896 (≈7.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base EXAONE-3.5-7.8B-Instruct) |
| Tipos de cuantizacion | No se han publicado versiones cuantizadas de este checkpoint; al distribuirse en safetensors de precision completa puede cuantizarse con herramientas estandar (GGUF/llama.cpp, GPTQ, AWQ) |
| Idiomas soportados | No especificados en la model card; el modelo base EXAONE-3.5 esta orientado a ingles y coreano |
| Licencia | No disponible en los metadatos del repositorio; el modelo base se distribuye bajo la licencia propia de LG AI Research |
| Formato de pesos | safetensors (tag `safetensors`); incluye tokenizador y metadatos |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (revision `553ea250b9a5317231459279d5847d6cf955b9aa`) |
| Dataset de entrenamiento | DanielJeongsooLee/VeriReason-Luna-Medium-16K (revision `f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e`) |
| Etapa | SFT (supervised fine-tuning) con ajuste completo |
| Tamano del repositorio | 1172.8 GB (incluye checkpoints periodicos cada 0,2 epocas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El fine-tuning parte de EXAONE-3.5-7.8B-Instruct, un modelo generativo denso de 7.800 millones de parametros desarrollado por LG AI Research y preentrenado con 8 billones (8T) de tokens curados, con posterior SFT y optimizacion por preferencias directa (DPO). Sobre esa base, este experimento aplica un ajuste completo de todos los parametros (no adaptadores de bajo rango) durante 15 epocas sobre el subconjunto del 20 % del dataset `VeriReason-Luna-Medium-16K`, con learning rate 2e-5, semilla 42 y un total de 4830 pasos de entrenamiento.

La model card documenta de forma precisa la trazabilidad del experimento: revision exacta del modelo base, revision exacta del dataset, ratio de datos, numero de epocas, semilla y checkpoint seleccionado. Se generan checkpoints independientes cada 0,2 epocas, cada uno con su propio commit en el Hub; los pesos, el tokenizador y los metadatos se archivan, mientras que el estado del optimizador se retiene en local para reanudar el entrenamiento, lo que explica el enorme tamano del repositorio (1172.8 GB). El modelo publicado como "SFT main" es el mejor segun perdida de validacion: checkpoint-258, con loss = 0,45245474576950073. No se documentan innovaciones arquitectonicas adicionales, tecnicas de decodificacion especulativa ni cambios en el esquema de atencion; el valor del artefacto esta en la reproducibilidad de la receta.

## Capacidades

- Generacion de texto y razonamiento en dominios de tipo "VeriReason" (el dataset de ajuste esta orientado a razonamiento verificable), aunque no se publican evaluaciones que cuantifiquen la mejora.
- Razonamiento multi-paso derivado del modelo base EXAONE-3.5-7.8B-Instruct, que incorpora modos de cadena de pensamiento en su post-entrenamiento.
- Soporte bilingue ingles-coreano heredado del modelo base; no se confirma en la model card del fine-tuning.
- Capacidad de seguir instrucciones conversacionales multi-turno, al proceder de un modelo `-Instruct`.
- Soporte de tool calling / function calling: no documentado en esta model card ni verificado para el checkpoint ajustado.
- Capacidades de agente y razonamiento multi-paso con uso de herramientas: no documentadas para este fine-tuning.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Cuantizacion y despliegue con herramientas estandar al estar en safetensors de precision completa.

## Casos de uso

- Investigacion en recetas de SFT: replicar el experimento con los hiperparametros y revisiones exactas documentadas (ratio 20 %, 15 epocas, lr 2e-5, semilla 42) permite aislar el efecto del ajuste completo frente a LoRA sobre el mismo dataset.
- Ablaciones de seleccion de checkpoint: el repositorio conserva un checkpoint cada 0,2 epocas, lo que permite estudiar como evoluciona la perdida de validacion y el sobreajuste a lo largo de las 15 epocas.
- Estudio de sobreajuste en datasets pequenos: con 15 epocas sobre el 20 % de un dataset de 16K ejemplos, el checkpoint es un caso de estudio util para medir degradacion de capacidades generales frente a la especializacion.
- Evaluacion de razonamiento verificable: comparar las respuestas del checkpoint ajustado contra EXAONE-3.5-7.8B-Instruct original en tareas de razonamiento paso a paso, usando el mismo tokenizador y plantilla de chat.
- Generacion de texto asistida en ingles y coreano en entornos de investigacion sin requisitos de licencia comercial, siempre que se respete la licencia del modelo base.
- Punto de partida para un posterior ajuste con RLHF/DPO o GRPO: el autor mantiene lineas relacionadas (por ejemplo, `exaone-7b-verireason-reproduced-1513-luna-medium-fullft-best-grpo-epoch5`), lo que permite encadenar SFT y refinamiento por preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico metrica reportada es la perdida de validacion del mejor checkpoint (checkpoint-258), igual a 0,45245474576950073, que no es comparable entre modelos ni traducible directamente a calidad de generacion.

| Metrica reportada | Valor |
|---|---|
| Perdida de validacion (mejor checkpoint) | 0,45245474576950073 |
| Checkpoint seleccionado | checkpoint-258 |
| Pasos totales de entrenamiento | 4830 |
| Epocas completadas | 15,0 |

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 15,6 GB solo para pesos; con cache KV para contextos largos conviene reservar 20-24 GB.
- VRAM estimada en INT8: aproximadamente 8 GB de pesos.
- VRAM estimada en INT4 (GGUF Q4_K_M o similar): aproximadamente 4,5-5 GB de pesos.
- GPU profesionales: A100 40 GB o 80 GB, H100, L40S para servir en BF16 con concurrencia; una sola A100 40 GB es suficiente para inferencia en precision completa.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090, 4080 (16 GB) o 4060 Ti (16 GB) si se cuantiza a INT8/INT4.
- Opciones de despliegue: vLLM o TGI para servido en BF16 con throughput alto; llama.cpp u Ollama para cuantizaciones GGUF en local; transformers como referencia.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del backend, la cuantizacion y la longitud de contexto.
- Almacenamiento: el repositorio completo ocupa 1172.8 GB por los checkpoints intermedios; para desplegar basta descargar el checkpoint seleccionado (unos 16 GB en BF16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tuning (exaone-luna-medium-fullft-sft-...) | 7,8B | No disponible | No disponible en el repo | HuggingFace, 0 descargas | Checkpoint de investigacion, sin benchmarks |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible en la informacion | Licencia propia de LG AI Research | HuggingFace, ampliamente usado | Modelo base; preentrenado con 8T tokens, SFT + DPO |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | HuggingFace, amplia adopcion | Alternativa abierta con licencia permisiva; amplio ecosistema de cuantizaciones |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community License | HuggingFace, amplia adopcion | Ecosistema maduro de herramientas y despliegue |

La comparacion relevante para este artefacto es contra su propio modelo base: el fine-tuning no documenta mejoras medibles, de modo que la decision practica entre ambos debe basarse en evaluacion propia sobre la tarea objetivo. Frente a Qwen2.5-7B o Llama-3.1-8B, la diferencia principal es de licencia y de idioma: EXAONE esta optimizado para coreano e ingles y su licencia es menos permisiva que Apache 2.0.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad, seguridad ni sesgos para este checkpoint; la unica metrica es la perdida de validacion.
- El ajuste de 15 epocas sobre un subconjunto del 20 % de un dataset de 16K ejemplos presenta riesgo alto de sobreajuste y de degradacion de capacidades generales (olvido catastrofico).
- Riesgo de alucinacion inherito al modelo base, no mitigado por el proceso de SFT descrito.
- La licencia del repositorio no esta declarada; es imprescindible verificar los terminos aplicables del modelo base EXAONE-3.5-7.8B-Instruct antes de cualquier uso comercial.
- Idiomas no declarados en la model card: el soporte real fuera de ingles y coreano no esta verificado.
- Longitud de contexto no documentada para este checkpoint; no debe asumirse la del modelo base sin verificacion empirica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- El repositorio de 1172.8 GB incluye checkpoints intermedios y metadatos de entrenamiento; no debe confundirse con el peso real del modelo desplegable.
- Requiere `trust_remote_code` (tag `custom_code`) al cargar con transformers, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de hacerlo.
- No se ha publicado el estado del optimizador, por lo que la reproduccion exacta del entrenamiento no es posible solo con los archivos del Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr2e-5-seed42-20261021
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset VeriReason-Luna-Medium-16K: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K
- Experimento relacionado (GRPO sobre el mismo linaje): https://huggingface.co/Jongbin-kr/exaone-7b-verireason-reproduced-1513-luna-medium-fullft-best-grpo-epoch5
- Repositorio oficial EXAONE-3.0 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.0
- Organizacion LG-AI-EXAONE en GitHub: https://github.com/LG-AI-EXAONE
- Pagina oficial de EXAONE en LG AI Research: https://www.lgresearch.ai/exaone
