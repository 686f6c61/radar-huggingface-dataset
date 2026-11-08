# kaivoss/sriq-clover-35B-A3B-v1.6

## Resumen

sriq-clover-35B-A3B-v1.6 es un adaptador LoRA (PEFT, no fusionado) publicado por el usuario kaivoss sobre el modelo base Diffuspace/Clover-35B-A3B-Preview, un modelo de lenguaje de difusión por bloques con arquitectura de mezcla de expertos (MoE) de 35.000 millones de parámetros totales y unos 3.000 millones activos por token. El adaptador se entrena mediante SFT sobre el conjunto de datos sriq-ai/sriq-sft-v1.6 para inducir un comportamiento de razonamiento en chino simplificado comprimido, con una marca de verificación explícita (`验：`) dentro de la traza de razonamiento, y respuesta final en el idioma de la pregunta.

El objetivo declarado no es mejorar la precisión bruta de respuesta, sino controlar la forma del razonamiento: que este se emita en chino simplificado (sin palabras funcionales en inglés ni en otras escrituras latinas), que incluya la comprobación `验：` y que se cierre dentro de 384 tokens. Según la model card, el adaptador consigue razonamiento solo en chino en 55 de 57 preguntas no chinas (frente a 0 en el modelo base), la marca `验：` en 54 de 64 trazas (frente a 0) y el cierre del razonamiento en 58 de 64 (frente a 21). La precisión de la respuesta final no se ha evaluado con benchmarks formales.

Es relevante ahora porque explora el ajuste fino de modelos de difusión por bloques (block diffusion) con decodificación no autorregresiva, una familia aún poco cubierta por herramientas de despliegue estándar, y porque documenta con transparencia sus fallos (2 de 64 trazas retenidas fallan: un bucle y una mezcla de idiomas). El repositorio ocupa 1,5 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo base mucho mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base: MoE con block diffusion derivado de Qwen3.6-35B-A3B; adaptador PEFT LoRA (r 32, α 64) |
| Parametros totales | 35B (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | ~3B por token (modelo base, MoE) |
| Longitud de contexto | 128K (modelo base) |
| Tipos de cuantizacion | QLoRA NF4 (blocksize 64) usada en entrenamiento; GGUF del modelo base disponible en terceros (21,2 GB a 36,9 GB); el adaptador no ha sido probado en builds cuantizadas |
| Idiomas soportados | Multilingüe; razonamiento entrenado en chino simplificado; respuesta en el idioma de la pregunta |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El modelo base Clover-35B-A3B-Preview, desarrollado por DiffuSpace, es un transformer de mezcla de expertos con decodificación por difusión de bloques (block diffusion), construido sobre el backbone de Qwen3.6-35B-A3B. Emplea atención con Gated DeltaNet en determinadas proyecciones (in_proj_qkv, in_proj_z, out_proj) y una MLP de expertos compartidos, además de expertos enrutados con router. La decodificación sigue las reglas de Clover para block diffusion: LowConfidence 0.95, presencia 0.9, repetición 1.05, con un máximo de 384 tokens nuevos en la evaluación.

El adaptador se entrena en dos etapas sobre sriq-sft-v1.6. La etapa 1 es un QLoRA de una época sobre las 9.908 filas utilizables del conjunto de entrenamiento (104 de 209 pasos, 48 filas por paso, OneCycle hasta 1,5e-4), conservando el checkpoint al 50 %. La etapa 2 es un SFT filtrado sobre 5.229 filas cuyo razonamiento gold es solo chino, simplificado y contiene la marca `验：` (55 pasos, 0,5 época, OneCycle hasta 5e-5, continuando el adaptador de la etapa 1). La función de pérdida combina entropía cruzada de block diffusion sobre tokens enmascarados de bloques de 32 tokens (ratio de máscara t ~ U(0,1), ruta `preview` de Clover) más 1,0 × entropía cruzada autorregresiva de siguiente token en la pasada causal limpia. Se entrenan todos los bloques hasta `</think>` más dos bloques de respuesta; los tokens de prompt nunca se entrenan y las filas de más de 6.144 tokens se descartan sin truncar.

El adaptador LoRA cubre atención q/k/v/o, Gated DeltaNet (in_proj_qkv, in_proj_z, out_proj) y la MLP de expertos compartidos; los expertos enrutados y el router permanecen congelados. En QLoRA, los expertos enrutados se cuantizan en NF4 (bitsandbytes, blocksize 64), reduciendo el uso de 70 GB a 23 GB, con pérdida en retenido de 2,438/1,404 en NF4 frente a 2,454/1,396 en bf16. El entrenamiento se realizó en una RTX PRO 6000 Blackwell de 96 GB en aproximadamente 4 horas (etapa 1 al 50 %) más 2,3 horas (etapa 2). El autor reconstruyó el objetivo de entrenamiento porque DiffuSpace no ha publicado el código de entrenamiento de Clover.

## Capacidades

- Generación de texto con razonamiento en chino simplificado comprimido y marca de verificación `验：` dentro de la traza.
- Respuesta en el idioma de la pregunta (64 de 64 trazas retenidas), incluidas preguntas en ruso, rumano, hebreo y español.
- Razonamiento matemático con respuesta numérica verificable (12 filas de matemáticas con respuesta de un solo número en la evaluación).
- Razonamiento de código, con prompts de programación en varios idiomas.
- Capacidades multilingües heredadas del modelo base (multilingual, zh).
- Modo de pensamiento activado por defecto en el modelo base; no debe pasarse `enable_thinking=False` porque la plantilla rellena un `<think></think>` vacío y la traza desaparece.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático con verificación explícita: el adaptador emite una traza con `验：` que permite auditar el paso de comprobación, útil en pipelines donde se quiere registrar la verificación intermedia además del resultado.
- Generación de trazas de razonamiento en chino simplificado para destilación o generación de datos sintéticos: el adaptador produce razonamiento solo en chino en 55 de 57 preguntas no chinas, lo que lo hace adecuado para crear corpus de razonamiento en chino a partir de preguntas en otros idiomas.
- Evaluación de modelos de difusión por bloques: sirve como caso de estudio de ajuste fino LoRA sobre decodificación no autorregresiva, con reglas de decodificación concretas (LowConfidence 0.95, presencia 0.9, repetición 1.05) reproducibles.
- Asistencia multilingüe con razonamiento interno en un idioma fijo: preguntas en español, rumano o hebreo reciben respuesta en su idioma mientras el razonamiento se mantiene en chino, lo que puede simplificar el filtrado de trazas en producción.
- Investigación sobre control de formato de razonamiento: el contraste entre la etapa 1 al 50 % (56/57 en chino, 48/64 con `验：`) y la época completa (53/57, 33/64) documenta cómo el SFT converge al ruido del dataset gold.
- Prototipado de asistentes de código con prompts en varios idiomas: el adaptador maneja prompts de programación en ruso y hebreo, aunque con fallos documentados (bucle en un prompt de código en ruso).

## Benchmarks y rendimiento

Evaluación sobre 64 filas retenidas de sriq-sft-v1.6 (mezcladas con semilla 0, nunca entrenadas; 57 son preguntas no chinas; 12 son matemáticas con respuesta de un solo número). Arnés común: Transformers bf16, greedy, reglas de decodificación de Clover, máximo 384 tokens nuevos.

| Métrica | base | 50 % época | época completa | este adaptador |
|---|---|---|---|---|
| Razonamiento solo en chino (de 57 no chinas) | 0 | 56 | 53 | 55 |
| Marca `验：` en el razonamiento (de 64) | 0 | 48 | 33 | 54 |
| Trazas con caracteres solo tradicionales (de 64) | 3 | 0 | 1 | 0 |
| Razonamiento cerrado en 384 tokens (de 64) | 21 | 58 | 58 | 58 |
| Media de tokens de razonamiento | 293 | 151 | 137 | 148 |
| Respuesta en el idioma de la pregunta (de 64) | 64 | 64 | 64 | 64 |
| Trazas en bucle (de 64) | 0 | 0 | 0 | 1 |
| Respuesta final correcta (de 12) | 6 | 4 | 4 | 5 por el checker, 6 por lectura |

La precisión de respuesta no se ha evaluado con benchmarks formales: no se realizó ninguna ejecución en bench.sriq.org y 12 filas verificables no permiten separar modelos. El checker marcó una respuesta correcta como incorrecta por no estar en negrita ("Hay 21 caramelos en total (12 rojos + 9 verdes).") y leyó el último número, 9.

## Requisitos de hardware

- VRAM en bf16 con el adaptador fusionado: aproximadamente 70 GB, según la model card.
- VRAM en QLoRA NF4 (expertos enrutados): aproximadamente 23 GB, medido durante el entrenamiento.
- GPU recomendadas: RTX PRO 6000 Blackwell de 96 GB (usada para entrenamiento); para inferencia en bf16 se requiere una GPU de 80 GB o superior (A100 80 GB, H100 80 GB) o varias GPUs.
- En GPU de consumo: no cabe en bf16; el modelo base tiene versiones GGUF de terceros (AtomicChat/Clover-35B-A3B-Preview-GGUF, de 21,2 GB a 36,9 GB en disco), pero el adaptador no ha sido probado en builds cuantizadas.
- Opciones de despliegue: solo probado en Transformers con `trust_remote_code`; no probado en SGLang, llama.cpp ni builds cuantizadas.
- Latencia: el adaptador sin fusionar es aproximadamente 10 veces más lento; se recomienda `merge_and_unload()`.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sriq-clover-35B-A3B-v1.6 (este) | 35B totales / ~3B activos | 128K | MoE block diffusion + LoRA | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Diffuspace/Clover-35B-A3B-Preview | 35B totales / ~3B activos | 128K | MoE block diffusion | Apache-2.0 | Hugging Face, GitHub, GGUF de terceros |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | MoE autorregresivo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- 1 de 64 trazas entra en bucle: un prompt de código en ruso degenera en `queryCount(l,r,val,val,val,…` hasta el límite; el modelo base no presenta bucles (0/64).
- 1 de 57 trazas mezcla idiomas: una pregunta rumana sobre matrices escribe `A inversibilă` y `adjugate:` dentro del razonamiento en chino.
- Un prompt de código en hebreo cita la cadena que imprime (`'שלום עולם'`) dentro del razonamiento en chino; el gate lo marca, pero es texto de salida, no razonamiento en hebreo.
- Aproximadamente 1 de cada 5 trazas es más del doble de larga que la traza gold de su fila; muchas trazas gold tienen solo 1-8 tokens.
- Las trazas de aritmética pura como `4×6=24` no contienen idioma alguno.
- La precisión de respuesta final no está evaluada con benchmarks; el autor recomienda evaluar en la carga de trabajo propia antes de confiar en el modelo.
- No debe pasarse `enable_thinking=False`: la plantilla rellena un `<think></think>` vacío y la traza desaparece.
- Solo probado en Transformers con `trust_remote_code`; sin validar en SGLang, llama.cpp ni builds cuantizadas.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; el modelo base también es Apache-2.0.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kaivoss/sriq-clover-35B-A3B-v1.6
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Repositorio GitHub del modelo base: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.6
- Benchmarks de SRIQ: https://bench.sriq.org
- Sitio de SRIQ: https://sriq.org
- GGUF del modelo base (terceros): https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
