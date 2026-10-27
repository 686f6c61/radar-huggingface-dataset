# Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p50

## Resumen

`svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p50` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una versión comprimida de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión por descomposición en valores singulares (SVD) con compartición de bases (*basis sharing*) entre pares de capas, con un objetivo declarado de eliminación del 50 % de los parámetros en la representación factorizada.

El modelo no es un Llama 3 al uso: es un artefacto experimental orientado a medir cómo afecta la compresión al equilibrio entre utilidad (perplejidad, tareas zero-shot) y seguridad (resistencia a *jailbreaks* y tasa de rechazos excesivos). Para ello, la calibración del SVD combina 256 secuencias de WikiText-2 con 13 secuencias de *prompt* más respuesta extraídas de un corpus de *prompts* dañinos de JBB (26.624 tokens en total), y la recuperación de capacidad se hace con LoRA sobre los coeficientes manteniendo las bases congeladas, usando datos Alpaca-cleaned durante dos épocas.

El checkpoint se ha plegado a pesos densos estándar de Transformers, por lo que el ratio de compresión describe el presupuesto de parámetros factorizados y no una reducción del tamaño de descarga: el repositorio ocupa 16,1 GB y contiene 8.030.261.248 parámetros, los mismos que el modelo base. Es relevante ahora porque permite estudiar de forma controlada la interacción entre compresión agresiva de pesos y alineación de seguridad, un área con pocos puntos de medida públicos y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (heredada de `Meta-Llama-3-8B-Instruct`); el checkpoint se distribuye plegado a pesos densos estándar tras la factorización SVD con bases compartidas por grupos de dos capas |
| Parametros totales | 8.030.261.248 (pesos densos plegados; presupuesto factorizado objetivo: 50 % de parámetros eliminados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en `safetensors`; no se han publicado ficheros GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible (la calibración y la evaluación documentadas son en inglés: WikiText-2, JBB, textos de rechazo de Llama-2, AdvBench, StrongREJECT, XSTest, OR-Bench) |
| Licencia | `llama3` (Llama 3 Community License) |
| Formato de pesos | `safetensors` (compatible con `transformers`, `text-generation-inference`, endpoints compatibles) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención por grupos de consultas (GQA) y tokenizador de 128.256 entradas. Sobre esa base, el autor aplica una compresión por SVD en la que las bases se comparten entre grupos de dos capas (16 grupos en un modelo de 32 capas), lo que reduce el presupuesto de parámetros factorizados en un 50 %. La recuperación de capacidad se realiza con LoRA únicamente sobre los coeficientes, con las bases congeladas, empleando datos Alpaca-cleaned y dos épocas por pasada de entrenamiento. Finalmente, el checkpoint se pliega a pesos densos convencionales para que pueda cargarse con `transformers` sin código personalizado. Los recuentos reales de parámetros y los detalles de recuperación se registran en `compression.json`, dentro del repositorio.

El punto diferencial está en la calibración: no es solo *prompt*, sino *prompt* más respuesta. Se usan 256 secuencias de WikiText-2 y 13 secuencias del corpus `jbb_harm_resp:13` (26.624 tokens), todas de 2.048 tokens y con semilla 42. Los textos de rechazo empleados son los existentes de Llama-2, empaquetados con el tokenizador de cada familia. No se documentan en la información disponible ni el volumen total de tokens de preentrenamiento (se hereda del modelo base), ni si hubo RLHF/DPO adicional más allá del ajuste instruct original de Meta y del LoRA de recuperación.

## Capacidades

- Generación de texto conversacional multirretorno, heredada de Llama 3 8B Instruct.
- Seguimiento de instrucciones en formato chat (la plantilla de Llama 3 se mantiene al conservar el tokenizador del modelo base).
- Resistencia parcial a *jailbreaks*: se reporta una tasa de éxito de ataque (ASR) de 0,117308 en AdvBench y 0,172524 en StrongREJECT, ambas juzgadas con HarmBench.
- Control de rechazos excesivos: se reporta una tasa macro de *over-refusal* de 0,184978 medida con WildGuard sobre XSTest-safe y OR-Bench.
- Razonamiento zero-shot evaluado en siete tareas: ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA (resultados por tarea en los ficheros de `utility/`, no incluidos en la información disponible).
- Compatibilidad con el ecosistema `transformers`, `text-generation-inference` y endpoints compatibles con la API de OpenAI, al ser un checkpoint denso estándar.
- Base para *fine-tuning* posterior con LoRA o adaptadores completos, al haberse plegado la factorización.
- No se documentan capacidades de *tool calling*, agentes multi-paso, visión, audio ni modo *thinking* en la información disponible.

## Casos de uso

- Investigación sobre compresión y alineación: servir como punto de medida reproducible de cómo una reducción del 50 % del presupuesto de parámetros afecta a la robustez frente a *prompts* dañinos, usando AdvBench y StrongREJECT con el juez HarmBench tal y como los reporta el autor.
- Estudio de *over-refusal*: emplear XSTest-safe y OR-Bench con WildGuard para cuantificar si la calibración con textos de rechazo introduce rechazos espurios en peticiones legítimas, un fenómeno habitual al calibrar con corpus de seguridad.
- Comparación controlada de ratios de compresión: el autor publica variantes `keep_0p50` y `keep_0p60` del mismo pipeline, lo que permite un diseño experimental con un único factor manipulado (ratio de retención) y el resto de condiciones fijas (semilla 42, misma calibración, mismo esquema LoRA).
- Ablación de la calibración de seguridad: existe una variante sin el corpus `jbb_harm_resp` (`..._finetuned_keep_0p50`), lo que permite aislar el efecto de las 13 secuencias de seguridad sobre la perplejidad y el ASR.
- *Baseline* en pipelines de evaluación de seguridad automatizados: integrar el modelo como uno de los candidatos en un *harness* interno que lance AdvBench/StrongREJECT, dado que el repositorio ya incluye las generaciones por *prompt* y los registros del juez para auditar la cobertura.
- Reproducción metodológica de SVD con compartición de bases: usar `compression.json` y los pesos plegados para reimplementar el pipeline de factorización y recuperación LoRA sobre otros modelos de la familia Llama.
- Servicio de bajo coste con cuantización: al ser un checkpoint denso de 8B, puede cuantizarse a 8 o 4 bits y desplegarse en una sola GPU de consumo para experimentos de inferencia, siempre con las advertencias de la sección de limitaciones.

## Benchmarks y rendimiento

Métricas reportadas por el autor en la model card. La evaluación cubre perplejidad completa en WikiText-2, siete tareas zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA), XSTest-safe y OR-Bench con juez WildGuard, y AdvBench y StrongREJECT completos con juez HarmBench. Límite de generación: 512 tokens, sin recortes de muestras.

| Metrica | Valor |
|---|---:|
| Perplejidad WikiText-2 | 22,356 |
| AdvBench ASR (HarmBench) | 0,117308 |
| StrongREJECT ASR (HarmBench) | 0,172524 |
| Over-refusal macro (WildGuard) | 0,184978 |

No se han publicado en la información disponible los resultados desglosados de las siete tareas zero-shot, ni cifras de MMLU, HumanEval o GSM8K, ni una comparación numérica con el modelo base sin comprimir. Los ficheros crudos de evaluación (generaciones por *prompt*, registros del juez, resúmenes zero-shot) están en `utility/` y `safety/` del repositorio. Nota metodológica del autor: StrongREJECT se evalúa con el juez de HarmBench, no con su puntuador nativo.

## Requisitos de hardware

- Pesos en `safetensors` de precisión completa (bf16/fp16): 8,03 mil millones de parámetros, aproximadamente 16,1 GB de pesos, coincidiendo con el tamaño del repositorio.
- VRAM estimada en bf16/fp16: 18-20 GB incluyendo caché KV para contexto completo y *overhead* del runtime. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 40 GB y H100 80 GB.
- VRAM estimada en INT8: en torno a 8,5-10 GB; viable en RTX 4080/4090 y A10G.
- VRAM estimada en INT4: en torno a 4,5-6 GB; viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB y T4 16 GB, con degradación de calidad no medida en la información disponible.
- No se publican ficheros GGUF ni cuantizaciones listas para usar; para llama.cpp u Ollama sería necesario convertirlos a partir de los pesos `safetensors`.
- Opciones de despliegue: `transformers` (ruta directa), `text-generation-inference` (etiqueta `text-generation-inference` presente), vLLM, y endpoints compatibles con la API de OpenAI. El modelo aparece indexado en proveedores como FriendliAI y Featherless.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | ASR / over-refusal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`..._jbbresp13_finetuned_keep_0p50`) | 8,03 B (presupuesto factorizado al 50 %) | 8.192 (heredado) | 22,356 | AdvBench 0,117308; StrongREJECT 0,172524; over-refusal 0,184978 | `llama3` | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p60` | No disponible con precisión (mismo esquema, retención 60 %) | 8.192 (heredado) | No disponible en la información | No disponible en la información | `llama3` | HuggingFace; también indexado en FriendliAI |
| `Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_finetuned_keep_0p50` | No disponible con precisión (mismo esquema sin corpus JBB) | 8.192 (heredado) | No disponible en la información | No disponible en la información | `llama3` | HuggingFace |
| `meta-llama/Meta-Llama-3-8B-Instruct` (base sin comprimir) | 8,03 B | 8.192 | No disponible en la información (no reportada por el autor) | No disponible en la información | `llama3` | HuggingFace, ampliamente distribuido |

No se dispone de datos en la información proporcionada para comparar con alternativas de otros autores orientadas a compresión con preservación de seguridad. Las cifras de la variante `keep_0p60` y de la base sin comprimir no están publicadas en las fuentes consultadas.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como artefacto de investigación para medir seguridad y utilidad bajo compresión, y afirma explícitamente que las mediciones no establecen idoneidad para despliegue.
- Robustez frente a *jailbreaks* limitada: un ASR de 0,117308 en AdvBench y de 0,172524 en StrongREJECT implica que una fracción relevante de *prompts* dañinos obtiene respuesta no segura con el juez HarmBench.
- Rechazos excesivos no triviales: 0,184978 macro en XSTest-safe y OR-Bench con WildGuard, lo que puede traducirse en negativas a peticiones legítimas en producción.
- Calibración de seguridad con solo 13 secuencias (26.624 tokens): muestra muy pequeña, con riesgo de sobreajuste a ese conjunto concreto de *prompts* y de escasa generalización a otros formatos de ataque.
- Perplejidad de 22,356 en WikiText-2 sin cifra de referencia del modelo base en la información disponible, por lo que no es posible cuantificar aquí la degradación real de utilidad.
- Idiomas no declarados y calibración íntegramente en inglés (WikiText-2, JBB, textos de rechazo de Llama-2, AdvBench, StrongREJECT, XSTest, OR-Bench): el rendimiento fuera del inglés no está caracterizado y previsiblemente degradado.
- El ratio de compresión del 50 % no reduce el tamaño de descarga: el repositorio son 16,1 GB de pesos densos, sin ahorro de VRAM frente al modelo base.
- Licencia Llama 3 Community License: no es una licencia de código abierto plena; impone condiciones de uso comercial, obligación de atribución ("Built with Meta Llama 3"), cláusula de terminación y restricciones de redistribución que deben revisarse antes de cualquier uso productivo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ausencia de terceros independientes que hayan replicado las métricas.
- No hay datos publicados de MMLU, HumanEval, GSM8K ni de capacidad de *tool calling*, por lo que no debe asumirse un nivel de competencia equivalente al Llama 3 8B Instruct original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p50
- Variante con retención del 60 %: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p60
- Variante sin corpus JBB, retención del 50 %: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_finetuned_keep_0p50
- Variante sobre Llama 3.1 8B Instruct (índice de terceros): https://featherless.ai/models/Jeesup/svd-safety-llama3_1_8b_instruct_up_basis_finetuned_keep_0p60
- Ficha de despliegue en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p60
- Registro en Free2AITools: https://free2aitools.com/model/jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbresp13_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
