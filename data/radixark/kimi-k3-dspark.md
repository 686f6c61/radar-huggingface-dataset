# RadixArk/Kimi-K3-DSpark

## Resumen

Kimi-K3-DSpark es un modelo borrador (speculator) de decodificación especulativa diseñado para acelerar la inferencia de Kimi K3, el modelo objetivo publicado por Moonshot AI. No es un modelo de generación autónoma: es un draft que propone bloques de tokens que el modelo grande verifica en paralelo, reduciendo el número de pasos de decodificación necesarios. Lo desarrolla RadixArk y se publica bajo el ecosistema de SGLang.

El checkpoint tiene 2.249.289.601 parámetros en BF16 safetensors (aproximadamente 9 GB de repo) y adopta una arquitectura de 5 capas de atención completa estilo Qwen3 con GQA, tamaño oculto 7168 y 64 cabezas de consulta frente a 16 de clave/valor. Su rasgo distintivo es DSpark, una extensión del backbone de borrador paralelo DFlash que añade una cabeza de sesgo logarítmico de tipo Markov y una cabeza de confianza por posición, con un `block_size` de 7 (1 token actual + 7 tokens borrador por paso de verificación).

Es relevante porque ataca uno de los cuellos de botella prácticos de los modelos de contexto muy largo: el coste por token generado. El checkpoint declara soporte de hasta 1.048.576 tokens de contexto (mediante YaRN-16 sobre una ventana de entrenamiento de 65.536) y se entrenó con SpecForge mediante destilación en línea contra un motor SGLang que servía el Kimi K3 congelado, lo que lo ata a esa revisión concreta del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa DSpark: 5 capas de atención completa estilo Qwen3 con GQA, hidden size 7168, 64 cabezas de consulta / 16 cabezas KV |
| Parametros totales | 2.249.289.601 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con 65.536 tokens; configuracion publicada con YaRN-16, `original_max_position_embeddings=65536` y `max_position_embeddings=1048576` (hasta 1.048.576 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en safetensors BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, fichero unico BF16; requiere `trust_remote_code` y `custom_code` |

Datos adicionales de la model card: ancho de verificación de 1 token actual + 7 tokens borrador (`block_size=7`), capas auxiliares del objetivo `[7, 23, 51, 67, 83]` y exclusión de los pesos de embedding y unembedding del objetivo (no están incluidos en el checkpoint).

## Arquitectura y entrenamiento

El modelo es un borrador paralelo de tipo DFlash extendido con DSpark. DFlash aporta un backbone que redacta varios tokens a la vez en lugar de uno por paso; DSpark añade dos componentes sobre esa base: una cabeza de sesgo logarítmico con estructura de Markov, que modela dependencias entre tokens borrador consecutivos, y una cabeza de confianza por posición, que estima la probabilidad de aceptación de cada token propuesto. El resultado se verifica con un ancho de 1 + 7 tokens por iteración, y el checkpoint consume estados ocultos de cinco capas auxiliares del objetivo (`[7, 23, 51, 67, 83]`) en lugar de la salida final.

El entrenamiento se realizó con SpecForge en modo destilación en línea: los estados ocultos se capturaron de un Kimi K3 congelado servido por un motor SGLang en vivo, y el borrador se inicializó desde cero, sin heredar pesos. La función de pérdida combina `0.1 CE + 0.9 L1 (destilación) + 1.0 confidence BCE`, con gamma de decaimiento 4.0, 512 anclas muestreadas por secuencia y `block_size=7`. La topología de entrenamiento fue de 4 nodos × 4 GB300 (16 rangos): 2 réplicas del objetivo con TP8, un sampler con DP2, FSDP16 `SHARD_GRAD_OP` sobre el borrador y dispersión por lotes TP, con lote global de 512 (8 por réplica × 32 pasos de acumulación × 2 réplicas). El soporte de contexto de 1M se habilita en la config publicada con YaRN-16, sin necesidad de sobrescribir la configuración del borrador.

## Capacidades

- Redacción especulativa de tokens para el objetivo `moonshotai/Kimi-K3`: propone bloques de 7 tokens que el modelo grande verifica en paralelo.
- Estimación de confianza por posición mediante cabeza dedicada, lo que permite descartar propuestas poco fiables antes de la verificación.
- Modelado de dependencias intra-bloque mediante la cabeza de sesgo logarítmico de tipo Markov.
- Consumo de estados ocultos intermedios del objetivo (capas 7, 23, 51, 67 y 83) en lugar de logits finales.
- Funcionamiento con contexto de hasta 1.048.576 tokens cuando se despliega con la configuracion YaRN-16 publicada.
- Integración nativa con el algoritmo `DSPARK` de SGLang y con backend de atención `trtllm_mha` para el borrador.
- No genera texto de forma autónoma: no incluye pesos de embedding ni unembedding del objetivo, por lo que no es un modelo de chat ni de generación independiente.
- Capacidades multilingües, de tool calling, de visión o de audio: no disponibles (no se documentan en la información proporcionada).

## Casos de uso

- Reducción de latencia en asistentes de contexto largo: con Kimi K3 como objetivo, el borrador permite longitudes de aceptación medias de 4,2553 en RULER V2 con entradas de entre 1.000.432 y 1.047.925 tokens, lo que se traduce en menos pasos de decodificación sobre documentos de un millón de tokens.
- Generación de código en producción: la aceptación media en HumanEval es de 5,5121 y en MBPP de 5,1980, los valores más altos del conjunto evaluado, lo que hace al borrador idóneo para autocompletado y generación de funciones donde el objetivo ya está desplegado.
- Agentes de resolución de incidencias sobre repositorios (SWE-Rebench): con acc_len de 4,6594 sobre 50 preguntas, el borrador acelera bucles agénticos de múltiples pasos donde cada paso requiere una generación corta y frecuente.
- Razonamiento matemático y resolución de problemas: GSM8K registra 5,4176 y MATH500 4,1329, por lo que encaja en pipelines de evaluación o tutoría matemática servidos con SGLang.
- Servicio de chat multi-turno: en MT-Bench la aceptación media es de 3,9342 sobre 80 preguntas, valor inferior al de tareas de código, útil para calibrar expectativas de aceleración en cargas conversacionales.
- Tareas de razonamiento largo con salidas extensas: en AIME26 el tramo de salidas de 32K+ tokens alcanza acc_len 4,9194, frente a 2,5632 en el tramo de 2-4K, lo que sugiere un beneficio mayor en generaciones largas con modo de razonamiento.
- Despliegue de alto rendimiento con SGLang: integrado vía `--speculative-algorithm DSPARK` y `--speculative-draft-model-path RadixArk/Kimi-K3-DSpark`, permite añadir decodificación especulativa a una instancia ya existente de Kimi K3 sin cambiar la API de servicio.

## Benchmarks y rendimiento

Los datos publicados no son métricas de calidad del modelo, sino `acc_len` (longitud de aceptación nativa del histograma de SGLang, promediada dentro de cada pregunta y luego equitativamente entre preguntas). Miden cuántos tokens acepta el verificador por paso, no la corrección de las respuestas.

| Dataset | Preguntas | acc_len |
|---|---:|---:|
| SWE-Rebench | 50 | 4,6594 |
| GSM8K | 1.319 | 5,4176 |
| MATH500 | 500 | 4,1329 |
| HumanEval | 164 | 5,5121 |
| MBPP | 257 | 5,1980 |
| MT-Bench | 80 | 3,9342 |
| AIME26 | 30 | 2,9893 |
| RULER V2 1M (MK/MV/QA) | 150 (50 por partición) | 4,2553 |

Desglose de RULER V2 1M por partición: 4,4658 en MK, 4,3081 en MV y 3,9919 en QA. Las entradas reales de esa evaluación abarcan de 1.000.432 a 1.047.925 tokens.

AIME26 por longitud de salida:

| Tramo de tokens de salida | Preguntas | Rango real de salida | acc_len |
|---|---:|---|---:|
| 0-1K | 13 | 192-885 | 3,1310 |
| 1-2K | 5 | 1.359-1.828 | 2,5773 |
| 2-4K | 6 | 2.210-3.732 | 2,5632 |
| 4-8K | 4 | 5.187-7.750 | 2,7174 |
| 8-16K | 0 | - | - |
| 16-32K | 0 | - | - |
| 32K+ | 2 | 54.545-224.703 | 4,9194 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como métrica de corrección, etc.) en la información disponible.

## Requisitos de hardware

- Peso del borrador: 2.249.289.601 parámetros en BF16 equivalen a unos 4,5 GB de memoria para los pesos, más overhead de caché KV y de estados auxiliares. Cifra estimada a partir del recuento de parámetros y la precisión publicada.
- GPU para el borrador: cualquiera con al menos ~6-8 GB libres en BF16; cabe en GPUs de consumo como RTX 4090 o RTX 3090 si se ejecuta aislado, aunque en la práctica se coloca junto al objetivo.
- GPUs para el objetivo: la receta de SGLang del autor usa `--tp-size 8` y `--dcp-size 8`, y el entrenamiento se realizó sobre 4 nodos × 4 GB300 (16 rangos). El requisito del objetivo Kimi K3 completo no se detalla en la información disponible.
- Memoria del sistema de servicio: la receta emplea `--mem-fraction-static 0.85`, `--max-mamba-cache-size 160`, `--max-running-requests 32`, `--cuda-graph-max-bs-decode 32`, `--context-length 1048576` y `--chunked-prefill-size 16384`.
- Despliegue: SGLang con `--speculative-algorithm DSPARK` y `--speculative-draft-attention-backend trtllm_mha`, más `--enable-linear-replayssm-spec` si se usa la ruta SSM lineal. La model card marca `inference: false` a nivel de metadatos de transformers, por lo que no se contempla su uso con el pipeline estándar de `transformers`; no hay indicios de soporte en llama.cpp, Ollama, TGI ni vLLM.
- Latencia y throughput: no disponibles como medidas directas. El indicador indirecto es la longitud de aceptación (`acc_len`), que determina cuántos tokens se aceptan por paso de verificación; un `acc_len` de 5,5 implica del orden de 5 tokens generados por iteración de verificación en HumanEval.

## Comparativa con modelos similares

No se dispone de datos numéricos de alternativas en la información proporcionada. A título cualitativo, el borrador se sitúa en la familia de métodos de decodificación especulativa junto a enfoques como EAGLE-3 (borradores con cabezas de predicción sobre estados ocultos), Medusa (cabezas múltiples sobre el objetivo) y DFlash (borrador paralelo del que DSpark deriva). Los parámetros, el contexto, el rendimiento, la licencia y la disponibilidad de esas alternativas figuran como no disponibles.

| Modelo | Parametros | Contexto | Metrica comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-DSpark | 2.249.289.601 | 65.536 entrenados / 1.048.576 con YaRN-16 | acc_len 3,93-5,51 segun dataset | no disponible | HuggingFace, requiere SGLang |
| EAGLE-3 (borradores) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Medusa (cabezas) | no disponible | no disponible | no disponible | no disponible | no disponible |
| DFlash (borrador paralelo) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: carece de pesos de embedding y unembedding del objetivo, y su salida solo tiene sentido emparejada con `moonshotai/Kimi-K3`.
- Dependencia fuerte de la revisión del objetivo: al haberse destilado contra un Kimi K3 concreto servido en vivo por SGLang, cambios en el modelo objetivo pueden degradar la tasa de aceptación.
- Licencia no disponible: no se puede confirmar la legalidad del uso comercial. Es un riesgo relevante para producción.
- Idiomas soportados no disponibles: no hay información sobre cobertura multilingüe del borrador más allá de los idiomas presentes en el objetivo.
- Contexto de entrenamiento de 65.536 tokens frente a una ventana declarada de 1.048.576 conseguida por extrapolación con YaRN-16; el comportamiento más allá de la ventana de entrenamiento depende de la extrapolación posicional.
- Las métricas publicadas (`acc_len`) miden aceptación, no corrección: no permiten inferir la calidad de las respuestas, que recae enteramente en el modelo objetivo.
- El checkpoint requiere `trust_remote_code` y contiene código personalizado; conviene auditar el repositorio antes de desplegarlo en entornos cerrados.
- Riesgo de alucinación: no evaluable a partir de la información disponible, ya que el borrador no produce respuestas finales; el riesgo heredado es el del objetivo.
- Sesgos conocidos: no disponibles.
- Compatibilidad limitada: el soporte documentado es exclusivamente para SGLang con el algoritmo DSPARK; no se documentan rutas para otros motores de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RadixArk/Kimi-K3-DSpark
- Modelo objetivo Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- SpecForge (framework de entrenamiento): https://github.com/sgl-project/SpecForge/
- SGLang (motor de inferencia): https://github.com/sgl-project/sglang
- SGLang Cookbook, recetas de despliegue de Kimi K3: https://lmsysorg.mintlify.app/cookbook/autoregressive/Moonshotai/Kimi-K3
