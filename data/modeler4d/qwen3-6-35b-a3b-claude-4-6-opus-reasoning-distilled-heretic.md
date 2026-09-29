# modeler4d/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-heretic

## Resumen

Este checkpoint es una version "decensored" (abliterated) del fine-tune de razonamiento `hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled`, construida por el usuario `modeler4d` mediante la herramienta Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA) con preservacion de norma de fila. El objetivo de la ablacion es eliminar la tendencia al rechazo del modelo original (99/100 rechazos pasan a 5/100) minimizando el dano al resto del comportamiento, con una divergencia KL de 0,0660 respecto al checkpoint de partida.

La base subyacente es `Qwen/Qwen3.6-35B-A3B`, un transformer causal hibrido que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa Gated, todo ello con capas de mezcla de expertos. Cuenta con 35.107.181.936 parametros totales y aproximadamente 3B parametros activos por token (8 expertos enrutados mas 1 compartido de un total de 256), lo que le permite un coste de inferencia muy inferior al de un modelo denso del mismo tamano. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, e incluye un encoder de vision en la arquitectura base.

El fine-tune original sobre el que se aplica la ablacion es un SFT de razonamiento sobre trazas de chain-of-thought destiladas mayoritariamente de Claude Opus 4.6, con el objetivo de preservar la capacidad agentica y de codigo de Qwen3.6 y acercar el estilo de razonamiento al de Opus en problemas de formato largo. Es relevante porque combina tres tendencias actuales: modelos MoE de activacion dispersa muy eficientes, destilacion de trazas de razonamiento de modelos propietarios, y modificaciones de "desalineacion" etica (abliteration) que alteran de forma sustancial el comportamiento de seguridad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con encoder de vision: 10 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)), 40 capas |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido, de 256 expertos totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 70,2 GB) |
| Dimension oculta | 2048 |
| Embedding de tokens | 248.320 (con padding) |
| Cabezas de atencion | Gated DeltaNet: 32 cabezas lineales para V y 16 para QK, dimension de cabeza 128. Gated Attention: 16 cabezas Q y 2 KV, dimension de cabeza 256, RoPE de dimension 64 |
| Mezcla de expertos | 256 expertos; 8 enrutados + 1 compartido activados; dimension intermedia de experto 512 |
| Entrenamiento adicional | MTP (multi-token prediction) entrenado con multiples pasos |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relacion: finetune) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (HuggingFace) | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con encoder de vision y un patron hibrido poco habitual: el bloque se repite 10 veces y cada repeticion contiene tres subcapas de Gated DeltaNet (atencion lineal con estado recurrente) seguidas de una subcapa de Gated Attention (atencion completa), y cada una de ellas va seguida de una capa MoE. Esto da 30 capas con atencion lineal y 10 con atencion completa sobre un total de 40 capas. La atencion Gated DeltaNet usa 32 cabezas lineales para V y 16 para QK con dimension de cabeza 128, mientras que la atencion completa usa 16 cabezas Q y solo 2 KV con dimension de cabeza 256 y RoPE de dimension 64. La mezcla de expertos tiene 256 expertos de dimension intermedia 512, de los que se activan 8 enrutados mas 1 compartido por token, lo que explica que con 35B parametros totales solo se activen aproximadamente 3B. El modelo incorpora ademas multi-token prediction (MTP) entrenado con varios pasos, lo que habilita decodificacion especulativa nativa.

El fine-tune del que deriva este checkpoint es un SFT de razonamiento de tipo text-only: aunque la arquitectura base incluye encoder de vision, el entrenamiento no utilizo ejemplos de imagen ni de video. Los datos proceden de tres conjuntos de trazas de chain-of-thought destiladas: `nohurry/Opus-4.6-Reasoning-3000x-filtered`, `Jackrong/Qwen3.5-reasoning-700x` y `Roman1111111/claude-opus-4.6-10000x`, mayoritariamente generadas por Claude Opus 4.6 (los nombres de dataset sugieren 3.000, 700 y 10.000 ejemplos respectivamente, aunque la composicion exacta y el numero total de tokens no se detallan en la informacion disponible). El entrenamiento se realizo con las librerias Unsloth y TRL. No se documenta una fase de RLHF o DPO especifica para este fine-tune.

La modificacion que da nombre a este checkpoint es la ablacion aplicada con Heretic v1.2.0 usando Arbitrary-Rank Ablation (ARA) con preservacion de norma de fila. Los parametros declarados son: `start_layer_index` 17, `end_layer_index` 27, `preserve_good_behavior_weight` 0,8061, `steer_bad_behavior_weight` 0,0004, `overcorrect_relative_weight` 1,0938 y `neighbor_count` 3. El resultado reportado es una divergencia KL de 0,0660 frente al modelo original y una reduccion de rechazos de 99/100 a 5/100.

## Capacidades

- Generacion de texto conversacional y razonamiento de formato largo con trazas de chain-of-thought al estilo Claude Opus, segun el objetivo declarado del fine-tune.
- Razonamiento estructurado por pasos, orientado a problemas de varios turnos y de resolucion iterativa.
- Codigo y flujos agenticos de nivel de repositorio, heredados del modelo base Qwen3.6, que segun la documentacion upstream mejora en flujos de frontend y razonamiento a nivel de repositorio.
- Preservacion de contexto de razonamiento: el modelo base incorpora una opcion para retener el contexto de razonamiento de mensajes historicos, lo que reduce la sobrecarga en desarrollo iterativo.
- Soporte de tool calling / function calling: no se documenta explicitamente en la model card de este checkpoint, pero es una capacidad presente en la familia Qwen3.6. Considerar como "no confirmado para este fine-tune".
- Capacidades multilingues: la model card declara unicamente `en`; no se garantiza un comportamiento equivalente en otros idiomas pese a que el modelo base Qwen3.6 tiene vocabulario amplio (248.320 entradas de embedding).
- Vision: la arquitectura base incluye encoder de vision y el pipeline declarado es `image-text-to-text`, pero el fine-tune es text-only y no entreno con imagenes ni video, por lo que la calidad multimodal de este checkpoint concreto es dudosa.
- Modo de razonamiento extenso (thinking) propio de la familia Qwen3.6.
- Ausencia casi total de rechazos por contenido: 5/100 en la evaluacion declarada, frente a 99/100 del modelo original.
- Compatible con text-generation-inference y vLLM, segun las etiquetas del repositorio.

## Casos de uso

- Destilacion de trazas de razonamiento para generar datasets de entrenamiento: el modelo produce cadenas de pensamiento estructuradas y de formato largo, utiles para crear corpus de SFT o para comparar estilos de razonamiento entre modelos.
- Analisis de documentos tecnicos extensos: con 262.144 tokens de contexto nativo puede ingerir bases de codigo, especificaciones o informes completos sin troceado agresivo, lo que simplifica pipelines de resumen y extraccion.
- Asistencia a la programacion en repositorios grandes: la ventana de contexto y la herencia del modelo base orientada a razonamiento a nivel de repositorio permiten resolver tareas que requieren correlacionar multiples ficheros.
- Despliegue de bajo coste con alta concurrencia: al activar solo ~3B parametros por token, el coste de calculo por token es cercano al de un modelo de 3B, lo que abarata servir 35B de capacidad en vLLM o TGI.
- Agentes de varios pasos con contexto acumulado largo: la decodificacion especulativa via MTP y el contexto extensible hasta 1.010.000 tokens favorecen bucles de agente que acumulan historial de herramientas y observaciones.
- Investigacion sobre alineacion y abliteration: el checkpoint sirve como caso de estudio controlado al publicar parametros de ablacion, KL divergence y tasa de rechazos antes y despues, util para estudiar como se degrada el comportamiento general al eliminar la capa de rechazo.
- Generacion creativa sin filtros tematicos: el modelo es apropiado para escritura de ficcion con tematicas adultas, violencia narrativa o dialogos crudos donde un modelo alineado rechazaria la peticion.
- Evaluacion comparativa de calidad de razonamiento: al existir el checkpoint original sin abliterar, permite medir experimentalmente el coste de la ablacion en tareas de logica y matematicas.

## Benchmarks y rendimiento

Los datos disponibles son limitados y proceden del autor. La unica metrica incluida en el model-index es MMLU-Pro, con una advertencia explicita de que se trata de una comprobacion de humo (70 preguntas en total, `--limit 5` sobre 14 asignaturas) y no de un benchmark de calidad de publicacion.

| Benchmark | Harness | Muestras por modelo | Configuracion | Metrica | Modelo base | Modelo fine-tune | Delta |
|---|---|---:|---|---|---:|---:|---:|
| MMLU-Pro overall | lm-evaluation-harness | 70 | `--limit 5` en 14 asignaturas | exact_match, custom-extract | 42,86 % | 75,71 % | +32,85 pp |

Nota: el resultado de 75,71 corresponde al checkpoint fine-tune original (`hesamation/...`) antes de la ablacion, no a una evaluacion propia del checkpoint abliterated. La metrica figura marcada como `verified: false` en el model-index.

Metricas especificas de la modificacion heretic (declaradas por el autor):

| Metrica | Este modelo | Modelo original |
|---|---:|---:|
| Divergencia KL | 0,0660 | 0 (por definicion) |
| Rechazos | 5/100 | 99/100 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU completo, AIME, SWE-bench, etc.) en la informacion disponible, ni para este checkpoint ni para su version sin abliterar.

## Requisitos de hardware

- Pesos en precision completa: el repositorio ocupa 70,2 GB. En bf16/fp16 se necesita aproximadamente 70 GB de VRAM solo para pesos, mas overhead de activaciones y cache, por lo que se recomienda 1xH100 80 GB o 2xA100 80 GB.
- FP8: reduce los pesos a unos 35 GB; cabe en una A100 80 GB, H100 80 GB o L40S 48 GB con margen para cache de contexto.
- Cuantizacion de 8 bits: aproximadamente 35 GB de pesos; no cabe en GPUs de consumo de 24 GB.
- Cuantizacion de 4 bits: aproximadamente 18-20 GB de pesos, lo que permite ejecutarlo en una RTX 4090 o RTX 3090 de 24 GB, con contexto reducido.
- Cache KV: con solo 2 cabezas KV de dimension 256 en las 10 capas de atencion completa, el coste por token es bajo (estimacion aproximada de 20 KB por token en bf16, unos 5 GB a 262.144 tokens). Las 30 capas de Gated DeltaNet usan atencion lineal con estado de tamano fijo, lo que evita el crecimiento cuadratico tipico.
- GPU recomendadas: H100 80 GB o A100 80 GB para fp16/bf16; L40S 48 GB o A6000 48 GB para FP8; RTX 4090 / RTX 3090 24 GB para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits, en RTX 4090, RTX 3090 o RTX 5090.
- Opciones de despliegue: transformers (libreria declarada), vLLM, text-generation-inference (ambas etiquetadas en el repositorio) y endpoints compatibles. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se publica en este repositorio.
- Latencia y throughput: no disponibles. Como referencia cualitativa, al activar solo ~3B parametros por token, el throughput esperado es sustancialmente mayor que el de un modelo denso de 35B y mas cercano al de un modelo de 3-4B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado | Rendimiento declarado |
|---|---|---|---|---|---|
| modeler4d/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-heretic (este) | 35B / ~3B | 262.144 nativo, hasta 1.010.000 | apache-2.0 | Abliterated, 0 descargas | MMLU-Pro 75,71 (heredado, muestra limitada); rechazos 5/100 |
| hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled | 35B / ~3B | 262.144 nativo | apache-2.0 | Fine-tune original de razonamiento | MMLU-Pro 75,71 (muestra limitada); rechazos 99/100 |
| Qwen/Qwen3.6-35B-A3B | 35B / ~3B | 262.144 nativo, hasta 1.010.000 | apache-2.0 (segun modelo base) | Modelo base oficial | MMLU-Pro 42,86 en la misma configuracion limitada |
| Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | 27B (denso, segun denominacion) | No disponible | No disponible | Fine-tune de referencia e inspiracion | No disponible |

Advertencia sobre la comparativa: la unica cifra comparable disponible es el MMLU-Pro ejecutado sobre 70 preguntas, lo que no permite extraer conclusiones robustas. No hay datos publicados de los modelos comparables en benchmarks completos dentro de la informacion proporcionada, por lo que la comparacion debe tratarse como orientativa.

## Limitaciones y advertencias

- La ablacion elimina de forma deliberada la capa de rechazo: pasa de 99/100 a 5/100 rechazos. El modelo respondera a peticiones que el original rechazaria, incluyendo contenido potencialmente danino, ilegal o gravemente ofensivo. No es apto para aplicaciones de cara al publico sin filtros externos.
- Divergencia KL de 0,0660 respecto al original: la ablacion no es neutra. Cabe esperar degradacion en algunos comportamientos, capacidad de seguir instrucciones o coherencia en tareas no relacionadas con el rechazo, aunque no se cuantifica que areas se ven afectadas.
- Riesgo de alucinacion: inherente a los modelos de razonamiento con destilacion de trazas; el modelo puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en tareas factuales o matematicas de varios pasos.
- Validacion practicamente inexistente: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-09-29). No hay evaluaciones independientes ni comunidades que hayan verificado el comportamiento.
- Benchmark no fiable: el unico resultado declarado usa 70 preguntas y esta marcado como `verified: false`. No sirve para estimar capacidad real.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Modalidad: aunque el pipeline declarado es `image-text-to-text`, el fine-tune es text-only y no se entreno con imagenes. El encoder de vision esta presente en la arquitectura, pero su calidad tras el fine-tune y la ablacion no esta evaluada.
- Sin cuantizaciones oficiales: no se publican GGUF, AWQ ni GPTQ, lo que complica el despliegue en entornos de bajos recursos sin conversion manual.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero no exime al desplegador de responsabilidad legal sobre el contenido generado, especialmente tratandose de un modelo sin filtros de seguridad.
- Consideraciones eticas: el uso de checkpoints abliterated para servicios publicos puede entrar en conflicto con las politicas de las plataformas de despliegue y con obligaciones regulatorias de moderacion de contenido.
- Trazabilidad: no se publican detalles del dataset final (numero de tokens, filtrado, composicion), hiperparametros de entrenamiento ni semillas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modeler4d/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled-heretic
- Modelo original sin abliterar: https://huggingface.co/hesamation/Qwen3.6-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo de referencia e inspiracion: https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request del metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Dataset: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Perfil del autor original en X: https://x.com/Hesamation
- Discord Open Source AI Builders: https://discord.gg/vtJykN3t
- Grafica de benchmarks del modelo base: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png
