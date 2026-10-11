# AxiomicLabs/GPT-S3-3M

## Resumen

GPT-S3-3M es un modelo de lenguaje de 2.973.666 parámetros desarrollado por Axiomic Labs, un laboratorio independiente de investigación en IA centrado en eficiencia de datos y razonamiento estructurado. Se trata del tercer modelo de su familia GPT-S de modelos diminutos y sustituye la arquitectura transformer convencional por un diseño híbrido que combina seis capas de Gated DeltaNet-2 (atención lineal con estado) y dos capas de atención gated GQA, con un flujo residual basado en Full Attention Residuals. Está entrenado desde cero, no es un fine-tuning de ningún modelo existente.

El modelo resuelve un problema de investigación más que de producto: explorar hasta dónde se puede llevar la eficiencia de datos en el régimen sub-3M de parámetros. Con 26.480 millones de tokens procesados para el checkpoint publicado (30.000 millones en la ejecución completa), la ratio de entrenamiento es de aproximadamente 8.900 tokens por parámetro, muy por encima del óptimo de Chinchilla. Según la model card, alcanza un Intelligence Index de 9,61 en el Open SLM Leaderboard de Axiomic Labs, lo que lo sitúa primero en la clase de menos de 3M de parámetros y segundo por debajo de 10M.

Su relevancia actual es doble: por un lado, publica una receta completa y reproducible (tokenizador propio, mezcla de datos fija, optimizador híbrido Muon/AdamW) para una arquitectura híbrida poco común; por otro, lo hace bajo licencia Apache-2.0 con pesos en safetensors, algo inusual en modelos de investigación tan pequeños. La contrapartida es que su rendimiento absoluto en las tareas evaluadas se mantiene cerca del nivel de azar, por lo que su valor es experimental y educativo, no de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 6 capas Gated DeltaNet-2 (atención lineal) + 2 capas gated GQA (atención completa), con Full Attention Residuals |
| Parametros totales | 2.973.666 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (block_size) |
| Tipos de cuantizacion | No disponible de forma explícita en la información proporcionada; el checkpoint se publica en safetensors (probablemente bfloat16 o float32). Al ser una arquitectura con `custom_code`, la cuantización a GGUF/AWQ depende de que exista soporte en la herramienta |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería `transformers`, requiere `trust_remote_code` por `custom_code`) |

Detalles adicionales de configuración: `vocab_size` = 4.096 (BPE byte-level con dígitos separados), `hidden_size` = 144, `num_layers` = 8, GDN-2 con 3 cabezas de 48 dimensiones, atención con 3 cabezas de consulta y 1 de clave/valor (head_dim 48), `rotary_dim` = 24, `intermediate` = 352 (SwiGLU, ratio 2,44x), `rope_theta` = 10.000.

## Arquitectura y entrenamiento

La arquitectura rompe el patrón transformer homogéneo: el layout de capas es `[GDN-2, GDN-2, GDN-2, gated GQA] x 2`, seguido de RMSNorm y una cabeza LM con pesos atados al embedding. Las capas Gated DeltaNet-2 usan 3 cabezas de 48 dimensiones, puertas de borrado (`b`) y escritura (`w`) por canal, proyecciones de decaimiento y de puerta de salida a rango completo, una convolución causal corta de kernel 4 y q/k normalizadas en L2; al ser atención lineal con estado recurrente, no necesitan codificación posicional. Las dos capas de gated GQA aplican atención completa con ratio 3:1 entre cabezas de consulta y de clave/valor, QK-norm, puerta de salida sigmoide y Partial RoPE sobre 24 de las 48 dimensiones de atención. El flujo residual emplea Full Attention Residuals con 17 agregaciones softmax aprendidas en profundidad (4.896 parámetros). La normalización es RMSNorm con upcast a float32 y el feed-forward es SwiGLU. El desglose de parámetros es: 589.824 en embeddings (atados), 1.007.730 en los seis bloques GDN-2, 152.256 en los dos bloques GQA, 1.216.512 en las ocho MLP SwiGLU y 7.344 en normas y agregaciones residuales.

El entrenamiento se hizo con un framework propio llamado TrainWork durante 114.441 pasos, con batch global de 262.144 tokens por paso (64 secuencias de 1.024 tokens por micro-lote y 4 pasos de acumulación de gradiente), precisión mixta bfloat16 y recorte global de norma de gradiente a 1.0. El optimizador es híbrido: Muon para pesos ocultos 2D (LR máxima 0,02, momentum 0,95, Nesterov, cinco pasos de Newton-Schulz, weight decay 0,01) y AdamW para embeddings, kernels de convolución, parámetros de normalización y sesgos (LR máxima 8e-3, betas 0,9/0,95, sin weight decay). El schedule es warmup lineal de 2.000 pasos, fase estable hasta el 80% del entrenamiento y decaimiento lineal a cero. No se menciona RLHF, DPO ni ningún tipo de ajuste por preferencias: el entrenamiento es exclusivamente de predicción del siguiente token. El checkpoint publicado corresponde al paso 101.000 (26.480 millones de tokens), seleccionado por su mejor Intelligence Index interno, no al final de la ejecución. Los datos son una mezcla fija desde el paso 0 de cinco fuentes: Nemotron-ClimbMix (35%), IFM/TxT360-v2 (35%), OpenMathInstruct-2 (15%), UltraData-Math (10%) y FactBase-DCLM (5%), todas retokenizadas con el tokenizador propio. La validación usa un shard reservado de ClimbMix.

## Capacidades

- Generación de texto autoregresiva en inglés con predicción del siguiente token, sin ajuste por instrucciones ni por preferencias.
- Razonamiento aritmético elemental: el tokenizador separa cada dígito en su propio token, lo que facilita el alineamiento posicional en operaciones numéricas; obtiene 39,10% en ArithMark-3 según la model card.
- Manejo de plantillas conversacionales a nivel de tokenizador: incluye los tokens especiales `<|im_start|>` y `<|im_end|>`, aunque no hay evidencia en la información proporcionada de que el modelo haya sido entrenado para seguirlas.
- Capacidad multilingüe: ninguna. El modelo está etiquetado exclusivamente como `en` y el vocabulario de 4.096 tokens está entrenado sobre una mezcla predominantemente inglesa.
- Tool calling / function calling: no disponible y muy improbable en un modelo de 2,97M de parámetros sin post-entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles (modelo estrictamente de texto).
- Modo de pensamiento explícito (thinking mode): no disponible.
- Contexto largo: capacidad limitada a 1.024 tokens, que es también la longitud usada en todo el entrenamiento.

## Casos de uso

- Investigación en arquitecturas híbridas lineales: GPT-S3-3M permite reproducir ablaciones entre atención lineal con estado (GDN-2) y atención completa (GQA) en un solo modelo, con un coste de entrenamiento de un solo GPU, algo inviable en modelos de miles de millones de parámetros. Es adecuado porque la proporción 6:2 entre ambos tipos de capa está documentada y es modificable.
- Validación de pipelines de entrenamiento: sirve como prueba de humo para frameworks propios o de terceros (schedule de LR, optimizador híbrido Muon/AdamW, acumulación de gradiente, checkpointing) antes de escalar a modelos mayores. Un run completo de 30B tokens en un 2,97M permite detectar errores de configuración en horas en lugar de semanas.
- Estudio de tokenizadores y su efecto en aritmética: el vocabulario de 4.096 tokens con separación dígito a dígito es un objeto de estudio directo para medir cómo afecta la tokenización numérica al rendimiento en tareas de aritmética, comparando con tokenizadores BPE convencionales sobre la misma mezcla de datos.
- Inferencia en dispositivos con recursos mínimos: con pesos de aproximadamente 6 MB en bfloat16 y 1,5 MB en int4, el modelo cabe en microcontroladores, Raspberry Pi o navegadores. Es adecuado para experimentos de generación de texto local sin conexión, siempre que se acepte la calidad baja de las salidas.
- Docencia y divulgación técnica: permite ilustrar el funcionamiento de una atención lineal con puertas, del flujo residual aprendido y de la decodificación autoregresiva en un modelo cuyo forward pass completo se puede inspeccionar capa por capa en una CPU de portátil.
- Referencia de eficiencia de datos: la ratio de 8.900 tokens por parámetro en el checkpoint publicado lo convierte en un punto de comparación útil para estudiar el retorno marginal de entrenar modelos diminutos con presupuestos de tokens muy superiores al óptimo de Chinchilla.
- Pruebas de latencia y de frameworks de inferencia: al ser tan pequeño, se puede usar para medir sobrecarga de arranque, coste por token y comportamiento de distintos runtimes con arquitecturas que requieren `custom_code`, aislando el efecto del tamaño del modelo.
- Filtrado o puntuación auxiliar en cascadas de datos: no recomendado como filtro de calidad de corpus, porque su perplejidad y sus puntuaciones en benchmarks están demasiado cerca del azar para ser discriminativas.

## Benchmarks y rendimiento

Datos publicados en la model card (todos porcentajes, salvo el Intelligence Index, que es un índice ponderado y normalizado por azar):

| Modelo | Organización | Parámetros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|---|---|
| GPT-S3-3M | Axiomic Labs | 2,97M | 9,61 | 27,68% | 34,76% | 23,12% | 57,02% | 39,10% |
| Tokle-3M | Tech.us | 2,91M | 8,91 | 27,20% | 34,85% | 23,98% | 55,01% | 40,80% |
| pulvis-v2 | Bench Labs | 2,96M x3 | 8,62 | 27,93% | 31,86% | 22,78% | 56,86% | 37,40% |
| pulvis-v1 | Bench Labs | 2,96M x3 | 7,85 | 27,91% | 31,61% | 22,27% | 55,93% | 36,90% |
| GPT-S2-5M | Axiomic Labs | 5,4M | 7,12 | 27,87% | 33,92% | 22,87% | 57,56% | 27,90% |
| GPT-S-5M | Axiomic Labs | 5,2M | 6,90 | 27,46% | 33,21% | 21,16% | 57,24% | 30,20% |
| ZeroS-Micro-v1.0 | FromZero | 2,87M | 6,49 | 28,46% | 31,27% | 22,01% | 53,86% | 35,60% |
| Sol Nano | Sol Intelligence | 2,90M | 6,07 | 28,40% | 32,07% | 21,16% | 53,92% | 33,80% |

El Intelligence Index definido por Axiomic Labs normaliza por azar HellaSwag, ARC combinado (media de ARC-Easy y ARC-Challenge), PIQA y ArithMark-3, con pesos de 1,00, 1,00, 1,00 y 0,65 respectivamente. Conviene leer estos resultados con cautela: HellaSwag se mueve en la banda del 27-28% frente al 25% del azar para 4 opciones, y ARC-Challenge ronda el 22-24% frente al 25% esperado por azar. El índice mide diferencias relativas dentro de una clase de modelos extremadamente pequeños, no calidad utilizable. La model card indica que GPT-S3-3M es primero en la clase <3M y segundo en <10M de su propio leaderboard. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 12 MB en float32, unos 6 MB en bfloat16/float16, unos 3 MB en int8 y unos 1,5 MB en int4, solo para los pesos. El coste dominante en la práctica es el caché KV de las capas de atención completa y el buffer de activaciones, no los pesos.
- GPU recomendadas: cualquiera. El modelo cabe con holgura en una GTX 1050, una RTX 3060, una RTX 4090, una A100 o una H100; no hay ninguna razón de rendimiento para usar GPU de datacenter con este tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU con soporte CUDA para bfloat16 o float16, y también en CPU y en aceleradores embebidos. Con 1.024 tokens de contexto, el uso de memoria es del orden de megabytes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada en la model card. La arquitectura es personalizada (`custom-architecture`, `custom-tokenizer`, `custom_code`), por lo que vLLM, TGI, llama.cpp u Ollama solo funcionarán si incorporan kernels y definiciones para Gated DeltaNet-2 y Full Attention Residuals; no hay confirmación en la información proporcionada de que exista tal soporte, ni pesos GGUF publicados.
- Latencia y throughput estimados: no disponible. La sección de hardware de la model card aparece truncada en la información proporcionada (menciona "1x R..."), y solo se sabe que todo el entrenamiento se hizo en una única GPU. No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Organización | Parámetros | Int Index (según la model card) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-S3-3M | Axiomic Labs | 2,97M | 9,61 | Apache-2.0 | Pesos en Hugging Face, safetensors, requiere `custom_code` |
| Tokle-3M | Tech.us | 2,91M | 8,91 | No disponible | Aparece en el leaderboard; repositorio no verificado en la información proporcionada |
| pulvis-v2 | Bench Labs | 2,96M x3 | 8,62 | No disponible | Aparece en el leaderboard; repositorio no verificado en la información proporcionada |
| ZeroS-Micro-v1.0 | FromZero | 2,87M | 6,49 | No disponible | Aparece en el leaderboard; repositorio no verificado en la información proporcionada |
| Sol Nano | Sol Intelligence | 2,90M | 6,07 | No disponible | Aparece en el leaderboard; repositorio no verificado en la información proporcionada |

Comparativa interna de la familia: GPT-S3-3M supera en Intelligence Index a los modelos mayores de la misma casa, GPT-S2-5M (5,4M) y GPT-S-5M (5,2M), lo que sugiere que las mejoras arquitectónicas y de receta pesan más que el número de parámetros en este régimen. No hay datos de licencia ni de formatos de pesos para los modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto próximo al azar: HellaSwag 27,68% (25% en 4 opciones), ARC-Challenge 23,12% y PIQA 57,02% indican que el modelo no es fiable para ninguna tarea de comprensión o razonamiento del mundo real. No debe usarse en producción para generar contenido que vaya a ser leído por usuarios finales.
- Riesgo de alucinación muy elevado: no ha recibido ajuste por instrucciones ni preferencias (sin RLHF ni DPO), por lo que no está alineado, no sigue instrucciones de forma fiable y puede producir texto incoherente o factualmente falso sin ninguna señal de confianza.
- Contexto limitado a 1.024 tokens, que coincide con la longitud de entrenamiento. No hay evidencia de extrapolación posicional más allá de ese límite, y la mayoría de los casos de uso reales (documentos, código, conversaciones largas) exceden esa ventana.
- Solo inglés: el vocabulario de 4.096 tokens está entrenado sobre una mezcla predominantemente inglesa (ClimbMix 35%, TxT360-v2 35%). El rendimiento en castellano o en cualquier otro idioma será prácticamente inutilizable.
- Vocabulario muy reducido (4.096 tokens): aumenta la longitud efectiva de las secuencias para un mismo texto y penaliza dominios con vocabulario especializado, como código fuente o terminología científica.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad o seguridad en la información proporcionada. Dado que se entrena sobre corpus web a gran escala (ClimbMix, TxT360-v2), es esperable que reproduzca los sesgos presentes en esas fuentes.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No hay restricciones adicionales documentadas, pero conviene verificar los términos de los datasets de entrenamiento por si impusieran condiciones propias.
- Dependencia de `custom_code`: cargar el modelo exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Es un riesgo de seguridad en entornos no controlados y una barrera para integrarlo en runtimes estándar.
- Reproducibilidad parcial: el checkpoint publicado corresponde al paso 101.000 de 114.441, no al final del entrenamiento, y no se documentan métricas de validación más allá del Intelligence Index interno.
- Falta de información de hardware: la sección de hardware de la model card está truncada en la información disponible, por lo que no se pueden verificar GPU, horas de entrenamiento ni coste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxiomicLabs/GPT-S3-3M
- Colección de la familia GPT-S: https://huggingface.co/collections/AxiomicLabs/gpt-s
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Axiomic Labs (web): https://www.axiomiclabs.com/
- Axiomic Labs en Hugging Face: https://huggingface.co/AxiomicLabs/models
- Dataset Nemotron-ClimbMix: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM

Nota: no se ha encontrado paper, blog técnico ni repositorio de código independiente para GPT-S3-3M en la información proporcionada.
