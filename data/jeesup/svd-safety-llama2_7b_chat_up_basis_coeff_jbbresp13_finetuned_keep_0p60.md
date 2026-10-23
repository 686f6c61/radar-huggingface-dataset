# Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbresp13_finetuned_keep_0p60

## Resumen

`svd-safety-llama2_7b_chat_up_basis_coeff_jbbresp13_finetuned_keep_0p60` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una compresión de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de factorización SVD con compartición de bases (*basis sharing*), con un objetivo declarado de eliminar el 40 % del presupuesto de parámetros factorizados. El resultado se ha plegado (*folded*) a pesos densos estándar de Transformers, por lo que el ratio de compresión describe el presupuesto de parámetros factorizados, no una reducción del tamaño de descarga.

El problema que aborda es la medición del equilibrio entre seguridad y utilidad cuando se comprime un modelo alineado. Para ello, la calibración no se limita a texto genérico: combina 256 secuencias de WikiText con 13 secuencias de prompts dañinos y respuestas de rechazo del conjunto JBB (`jbb_harm_resp:13`, 26.624 tokens), es decir, calibración prompt+respuesta y no solo prompt. Tras la compresión se aplica una recuperación con LoRA únicamente sobre los coeficientes, manteniendo las bases congeladas, usando datos Alpaca-cleaned limpias durante dos épocas por pasada.

Es relevante ahora porque acompaña a la publicación de todos los artefactos de evaluación en bruto (generaciones por prompt, registros de jueces, logs de zero-shot en `utility/` y `safety/`), lo que permite reproducir y auditar el estudio. El autor advierte explícitamente de que se trata de un checkpoint de investigación para medir seguridad/utilidad bajo compresión y que sus métricas no establecen idoneidad para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), comprimido mediante SVD con compartición de bases y plegado a pesos densos estándar |
| Parámetros totales | 6.738.415.616 (~6,74 B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-2-7b-chat-hf declara 4096 tokens; no confirmado para este checkpoint) |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors. Al estar plegado a pesos densos estándar de Transformers, es convertible con las herramientas habituales (GGUF, GPTQ, AWQ, bitsandbytes), sin que se hayan publicado resultados de dichas conversiones |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base está entrenado predominantemente en inglés) |
| Licencia | `llama2` (Llama 2 Community License) |
| Formato de pesos | safetensors; repositorio de 13,5 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7 B, tokenizador y configuración de `meta-llama/Llama-2-7b-chat-hf`). Sobre ella se aplica una compresión SVD con compartición de bases: grupos de dos capas comparten una misma base, y el checkpoint publicado se pliega a pesos densos equivalentes para poder cargarse con `transformers` sin código personalizado. El objetivo de compresión es del 40 % del presupuesto de parámetros factorizados (`keep_0p60`); los recuentos reales de parámetros y los detalles de recuperación se registran en el fichero `compression.json` del repositorio, no reproducidos en la información disponible.

La calibración usa 256 secuencias de WikiText más 13 secuencias de JBB con prompts dañinos y textos de rechazo, todas de 2048 tokens, con semilla 42 (26.624 tokens del corpus adicional). Ambas familias de datos se empaquetan con el tokenizador del propio modelo. La recuperación posterior entrena solo los coeficientes con LoRA, dejando las bases congeladas, sobre Alpaca-cleaned durante dos épocas por pasada. El autor indica que no emplea el LoRA propio de Basis Sharing (wikitext, batch 1). No se documentan en la información disponible ni el volumen total de tokens de entrenamiento del modelo base ni detalles de RLHF/DPO más allá de la alineación heredada de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama-2-7b-chat-hf.
- Respuesta a instrucciones y diálogo multi-turno (ventana de contexto no confirmada para este checkpoint).
- Comportamiento de rechazo ante prompts dañinos, reforzado en la calibración con el corpus JBB de prompt+respuesta.
- Evaluación zero-shot en siete tareas (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA), según la model card; los resultados numéricos no se incluyen en la información disponible.
- Métricas de robustez de seguridad publicadas: AdvBench, StrongREJECT (juzgado con HarmBench) y sobre-rechazo benigno (XSTest-safe y OR-Bench juzgados con WildGuard).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de compresión: cargar el checkpoint con `transformers`, ejecutar los scripts sobre `utility/` y `safety/` y verificar que la perplejidad y las tasas de rechazo publicadas se reproducen en el propio hardware.
- Estudio del equilibrio seguridad/utilidad en modelos comprimidos: comparar la perplejidad de WikiText-2 (10,7141) y la tasa de éxito de ataque frente a las variantes `keep_0p60` y `keep_0p80` del mismo autor para aislar el efecto del ratio de compresión.
- Auditoría de calibración con datos de seguridad: evaluar si las 13 secuencias JBB prompt+respuesta alteran la tasa de rechazo frente a una calibración solo con WikiText, usando el mismo protocolo de jueces (HarmBench y WildGuard).
- Red-teaming controlado en laboratorio: usar el modelo como sujeto de pruebas con AdvBench y StrongREJECT completos, con generación limitada a 512 tokens, para medir la robustez de un modelo comprimido antes de plantear su despliegue.
- Investigación sobre sobre-rechazo: el valor de sobre-rechazo macro (0,572409 medido con WildGuard) lo convierte en un caso de estudio útil para analizar cómo la compresión y la calibración con datos de rechazo afectan a la utilidad en peticiones benignas.
- Docencia y formación técnica: ilustrar en un curso de eficiencia de modelos el flujo completo de factorización SVD, compartición de bases entre capas y recuperación con LoRA sobre coeficientes.
- Validación de pipelines de evaluación de seguridad: servir de entrada para probar arneses propios de evaluación (jueces automáticos, agregación de ASR, control de falsos positivos) contra registros de referencia ya publicados.
- No recomendado como base para atención al cliente en producción: el propio autor indica que las métricas no acreditan idoneidad para despliegue, y el sobre-rechazo elevado degradaría la experiencia de usuario.

## Benchmarks y rendimiento

Datos publicados en la model card. No se aportan valores de referencia del modelo base ni de las variantes, por lo que no es posible calcular la degradación relativa con la información disponible.

| Métrica | Valor |
|---|---|
| Perplejidad WikiText-2 (completo) | 10,7141 |
| AdvBench ASR (juez HarmBench) | 0,00192308 (0,19 %) |
| StrongREJECT ASR (juez HarmBench, no su scorer nativo) | 0,0159744 (1,60 %) |
| Sobre-rechazo macro (WildGuard) | 0,572409 (57,24 %) |

Condiciones declaradas: límite de generación de 512 tokens, sin topes de muestras en pruebas preliminares, y conjuntos completos de AdvBench y StrongREJECT. Los resultados de las siete tareas zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA) se mencionan como realizados, pero sus cifras no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en fp16: unos 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-20 GB para contextos cortos y lotes pequeños. Estimación derivada del recuento de parámetros, no medida publicada.
- VRAM estimada en int8: en torno a 7 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en 4 bits: en torno a 4 GB de pesos; requiere conversión previa, no publicada en el repositorio.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son suficientes con holgura para fp16 y permiten lotes mayores.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en RTX 3090/4080 (16 GB) con cuantización int8 o 4 bits; en GPUs de 8-12 GB solo con cuantización agresiva y contextos reducidos.
- Despliegue: `transformers` de forma nativa; el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con endpoints tipo Inference Endpoints. vLLM y llama.cpp son opciones razonables al ser pesos densos estándar, pero no hay resultados publicados de latencia ni throughput para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...coeff_jbbresp13_finetuned_keep_0p60`) | 6,74 B | No disponible | PPL WikiText-2 10,7141; AdvBench ASR 0,19 %; sobre-rechazo 57,24 % | Llama 2 | HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (base) | ~6,74 B | 4096 tokens (según el modelo base) | No disponible en esta información | Llama 2 | HuggingFace, ampliamente desplegado |
| `Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p80` | No disponible | No disponible | No disponible | Llama 2 | HuggingFace |
| `Jeesup/svd-safety-llama2_7b_chat_remove_40_seed42` (SVD-LLM) | ~7 B (60 % de parámetros densos retenidos, según featherless.ai) | No disponible | No disponible | Llama 2 | HuggingFace |

La comparación cuantitativa con el modelo base no puede completarse: no se han publicado en la información disponible las métricas del Llama-2-7b-chat original bajo el mismo arnés de evaluación, lo que impide atribuir las diferencias observadas a la compresión.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara explícitamente que las mediciones no establecen idoneidad para despliegue.
- Sobre-rechazo elevado: 0,572409 en la métrica macro con WildGuard, lo que implica que el modelo rechaza una fracción alta de peticiones benignas; es el principal riesgo para cualquier uso conversacional real.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, sociales o culturales en la información disponible.
- Alucinación: no se publican evaluaciones de veracidad ni de tasa de alucinación; la compresión con recuperación limitada a coeficientes puede degradar el conocimiento factual del modelo base sin que se haya cuantificado.
- Idiomas: no se declaran idiomas soportados; el modelo base está centrado en inglés y no hay evaluación multilingüe.
- Contexto: no se confirma la longitud de contexto efectiva tras la compresión ni su comportamiento en ventanas largas.
- Licencia: Llama 2 Community License, que impone obligaciones de atribución, política de uso aceptable y restricciones de uso comercial para entidades con más de 700 millones de usuarios activos mensuales; conviene revisar la cláusula de nombrado de productos derivados.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni validación independiente de los resultados. La reproducibilidad depende de los ficheros `utility/` y `safety/`, que el autor invita a leer para comprobar cobertura y fiabilidad de los jueces.
- Evaluación de seguridad dependiente de jueces automáticos (HarmBench, WildGuard): los valores de ASR y sobre-rechazo heredan los sesgos y errores de dichos clasificadores.
- El ratio de compresión del 40 % no se traduce en una reducción del tamaño de descarga, ya que el checkpoint está plegado a pesos densos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_jbbresp13_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Variante hermana `keep_0p60` (sin corpus JBB): https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p60
- Variante hermana `keep_0p80`: https://huggingface.co/Jeesup/svd-safety-llama2_7b_chat_up_basis_coeff_finetuned_keep_0p80
- Variante `basis` sin recuperación por coeficientes: https://essamamdani.com/ai-models/hf-jeesup-svd-safety-llama2-7b-chat-up-basis-finetuned-keep-0p60
- Ficha de la variante `keep_0p80` en índice externo: https://savrn.com/models/svd-safety-llama2-7b-chat-up-basis-coeff-finetuned-keep-0p80
- Checkpoint relacionado con SVD-LLM (`remove_40_seed42`) en featherless.ai: https://featherless.ai/models/Jeesup/svd-safety-llama2_7b_chat_remove_40_seed42
