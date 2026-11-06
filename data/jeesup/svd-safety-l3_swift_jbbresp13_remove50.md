# Jeesup/svd-safety-l3_swift_jbbresp13_remove50

## Resumen

svd-safety-l3_swift_jbbresp13_remove50 es un punto de control de investigación creado por el usuario Jeesup a partir de meta-llama/Meta-Llama-3-8B-Instruct. Se trata de un experimento de compresión mediante SVD (descomposición en valores singulares) con el método Swift-SVD, que busca eliminar aproximadamente el 50 % del presupuesto de parámetros factorizados, incorporando además datos de calibración centrados en seguridad (prompts dañinos y respuestas de rechazo del conjunto JBB) para estudiar cómo la compresión afecta al equilibrio entre utilidad y seguridad.

El problema que aborda es doble: por un lado, la compresión de LLMs densos mediante SVD suele degradar el rendimiento; por otro, la seguridad alineada (la tendencia a rechazar prompts dañinos) puede deteriorarse durante la compresión. Este modelo usa una calibración mixta de 256 secuencias de WikiText más 13 secuencias de prompts dañinos/respuestas de rechazo de JBB, y posteriormente aplica una recuperación con LoRA secuencial sobre los factores U y V siguiendo el método SVD-LLM.

Es relevante porque publica métricas completas de seguridad (AdvBench, StrongREJECT, XSTest, OR-Bench) junto a la perplejidad y benchmarks de utilidad, algo poco habitual en checkpoints comprimidos. El checkpoint resultante está plegado a pesos densos estándar de Transformers (8.030.261.248 parámetros reales, 16,1 GB en safetensors), por lo que se despliega como cualquier Llama 3 8B, aunque el propio autor advierte que las mediciones no establecen idoneidad para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), comprimido con Swift-SVD y plegado a pesos densos |
| Parametros totales | 8.030.261.248 (pesos reales en safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Meta-Llama-3-8B-Instruct usa 8.192 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16/float16 implícitos por el tamaño de 16,1 GB) |
| Idiomas soportados | no disponible (calibración en inglés: WikiText, JBB, Alpaca) |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8 mil millones de parámetros. La innovación principal no está en la arquitectura base sino en el proceso de compresión: Swift-SVD descompone las matrices de pesos en factores U y V con asignación dinámica de rangos (alpha 0,6), con importancia de capas calculada sobre WikiText, apuntando a un objetivo del 50 % de eliminación de parámetros en el presupuesto factorizado. A diferencia de otros enfoques, la calibración incluye un corpus adicional de seguridad (`jbb_harm_resp:13`, 26.624 tokens) con prompts dañinos de JBB y textos de rechazo heredados de Llama 2, empaquetados con el tokenizador del modelo, en formato prompt-más-respuesta (no solo prompt).

Tras la descomposición se aplica una recuperación al estilo SVD-LLM: entrenamiento LoRA secuencial primero sobre los factores U y luego sobre los factores V, usando datos limpios de Alpaca (Alpaca-cleaned), con dos épocas por pasada de entrenamiento. El checkpoint final está plegado (folded) a pesos densos estándar de Transformers, de modo que la ratio de compresión describe el presupuesto de parámetros factorizado, no una reducción del tamaño de descarga: el repositorio ocupa 16,1 GB y contiene 8.030 millones de parámetros reales. Los detalles de recuperación y los recuentos de parámetros quedan registrados en el archivo `compression.json` del repositorio.

## Capacidades

- Generación de texto conversacional, heredada de Meta-Llama-3-8B-Instruct (pipeline text-generation).
- Razonamiento general y seguimiento de instrucciones, potencialmente degradado por la compresión SVD al 50 % (perplejidad WikiText-2 de 38,2, notablemente alta).
- Comportamiento de seguridad modificado: la calibración con rechazos de JBB busca preservar la negativa ante prompts dañinos tras la compresión (ASR de 17,88 % en AdvBench y 22,04 % en StrongREJECT).
- Resistencia al rechazo excesivo medida: macro over-refusal de 14,02 % según WildGuard sobre XSTest-safe y OR-Bench.
- No hay indicios de capacidades multimodales, tool calling nativo ni modos de pensamiento extendido; se trata de un modelo base conversacional comprimido.
- Capacidades multilingües: no disponibles explícitamente; la calibración es íntegramente en inglés.

## Casos de uso

- Investigación en compresión de LLMs: sirve como checkpoint de referencia para estudiar cómo la compresión SVD agresiva (50 %) afecta a la interacción entre utilidad y seguridad, con todos los registros de evaluación brutos incluidos en `utility/` y `safety/`.
- Investigación en seguridad y alineación: permite analizar si la inclusión de datos de rechazo en la calibración de compresión mitiga la pérdida de comportamiento de rechazo, usando los juicios de HarmBench y WildGuard publicados.
- Comparación de métodos de recuperación post-SVD: al usar recuperación LoRA secuencial U-then-V sobre Alpaca-cleaned, es comparable con otros checkpoints del mismo autor o método con distintas mezclas de calibración.
- Evaluación de over-refusal: útil como caso de estudio para medir si la compresión con datos de seguridad incrementa los falsos rechazos (macro over-refusal de 14,02 % documentado).
- Prototipado académico en GPU de consumo: al ser un denso de 8B en safetensors estándar, puede cargarse con Transformers o llama.cpp para experimentos rápidos de ablation.
- Benchmark de perplejidad y tareas zero-shot: las siete tareas evaluadas (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA) permiten situar el checkpoint frente a otros modelos comprimidos con el mismo protocolo.

## Benchmarks y rendimiento

Resultados publicados en la model card por el autor (generación limitada a 512 tokens, sin recortes de muestras de smoke test):

| Metric | Value |
|---|---:|
| WikiText-2 perplexity | 38,2009 |
| AdvBench ASR (HarmBench) | 0,178846 |
| StrongREJECT ASR (HarmBench, juez no nativo) | 0,220447 |
| Macro over-refusal (WildGuard, XSTest-safe + OR-Bench) | 0,140221 |

No se han publicado en la información disponible los resultados numéricos de las siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA), aunque el autor indica que los registros de evaluación completos están en los directorios `utility/` y `safety/` del repositorio. Tampoco hay comparativas directas con el modelo base sin comprimir ni con otros métodos de compresión en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en precisión completa (16,1 GB de pesos, presumiblemente bfloat16); con cuantización a 4 bits (por ejemplo GGUF Q4_K_M) rondaría los 5-6 GB, aunque no hay versiones cuantizadas publicadas.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 cubren la inferencia en precisión completa; en entornos de servidor, cualquier GPU con 24 GB o más (A10G, L4, A100).
- Cabe en GPU de consumo: sí, en una RTX 3090/4090 en fp16; en GPUs de 8-12 GB sería necesario cuantizar externamente.
- Opciones de despliegue: Transformers (librería nativa del checkpoint), y dado que son pesos densos Llama estándar plegados, debería ser compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque el autor no documenta ninguna de estas rutas explícitamente.
- Latencia y throughput estimados: no disponibles; al tratarse de un denso de 8B plegado, el rendimiento esperable es el de cualquier Llama 3 8B denso equivalente en hardware similar.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_swift_jbbresp13_remove50 | 8.030 M (plegado denso) | SVD 50 % + recuperacion LoRA | no disponible | Llama 3 | Checkpoint de investigacion, metricas de seguridad publicadas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | Sin comprimir | 8.192 | Llama 3 | Modelo base; referencia de utilidad y seguridad maximas |
| SVD-LLM (metodo de referencia) | Variable segun ratio | SVD + LoRA secuencial | no disponible | no disponible | Metodo de recuperacion usado; checkpoints publicos de la Universidad de Southern California |

No hay comparativas numéricas directas publicadas en la información disponible entre este checkpoint y el modelo base, por lo que la tabla se limita a la comparación cualitativa de enfoque, tamaño y licencia.

## Limitaciones y advertencias

- El propio autor indica que se trata de un checkpoint de investigación destinado a medir seguridad y utilidad bajo compresión, y que las mediciones no establecen idoneidad para despliegue en producción.
- La perplejidad WikiText-2 de 38,2 es alta (un Llama 3 8B típico se sitúa por debajo de 10), lo que sugiere una degradación sustancial de la calidad del lenguaje por la compresión al 50 %.
- La tasa de ataque (ASR) de 17,88 % en AdvBench y 22,04 % en StrongREJECT indica que el modelo sigue siendo vulnerable a jailbreaks; la calibración de seguridad no garantiza rechazos fiables.
- Macro over-refusal de 14,02 %: el modelo rechaza de forma incorrecta una fracción significativa de prompts benignos, un problema conocido cuando se calibra con datos de rechazo.
- StrongREJECT se evalúa con el juez de HarmBench, no con su scorer nativo, lo que puede afectar la comparabilidad de la métrica con resultados de otros trabajos.
- Sesgos: hereda los sesgos de Llama 3 y de los datos de recuperación (Alpaca-cleaned, WikiText, JBB); no se documentan auditorías de sesgo específicas.
- Riesgo de alucinación: no disponible cuantitativamente, pero esperable en línea o por encima del modelo base dada la degradación por compresión.
- Idiomas: la calibración es en inglés; el rendimiento en otros idiomas no está evaluado y probablemente esté degradado.
- Licencia Llama 3: impone condiciones de uso comercial (marca, política de uso aceptable, límite de 700 millones de usuarios activos mensuales para licencia específica de Meta).
- La ratio de compresión no reduce el tamaño de descarga: el checkpoint plegado ocupa 16,1 GB, igual que un denso de 8B estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbresp13_remove50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repos de código o demos del método Swift-SVD o de la evaluación.
