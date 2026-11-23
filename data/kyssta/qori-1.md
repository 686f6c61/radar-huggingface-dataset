# kyssta/Qori-1

## Resumen

Qori 1 es un modelo de lenguaje de 1.728.801.600 parámetros (aproximadamente 1,73B, denso) desarrollado por Hadal Research y publicado en Hugging Face bajo el identificador `kyssta/Qori-1`. Se trata de un post-entrenamiento del modelo base `LiquidAI/LFM3-1.7B` orientado a una tarea muy concreta: la edición de ficheros byte-exacta. El modelo emite un único bloque SEARCH/REPLACE que, aplicado literalmente sobre el fichero, modifica el texto sin necesidad de fuzzy matching, lo que lo hace directamente utilizable en pipelines de parcheo automatizado.

La relevancia de este modelo no reside en su tamaño ni en su rendimiento generalista, sino en la especialización: con solo 13,9M de parámetros entrenables mediante LoRA (un 0,8% del total), alcanza un 90,0% de bloques aplicables en un repositorio retenido (`httpx`, n=60) y un 82,5% en un repositorio no visto de otro proyecto (`starlette`, n=40), frente al 0,0% del modelo base y al 23-32% de Qwen2.5-3B/7B-Instruct. Es, por tanto, un caso de estudio de cómo el post-entrenamiento selectivo sobre una tarea estrecha puede superar a modelos mucho mayores en esa misma tarea.

El modelo se distribuye en safetensors (fp16 fusionado), adaptador PEFT y GGUF Q4_K_M, y hereda la arquitectura híbrida de LFM3 con 24 capas (13 convoluciones cortas con gating, 5 de atención con ventana deslizante y 6 de atención global) y un contexto base de 256K tokens, aunque la evaluación se realizó con prompts de 2K. La licencia es LFM Open License v1.0, con uso comercial permitido por debajo de 10 millones de dólares de facturación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM3: 24 capas (13 convoluciones cortas con gating, 5 de atención con ventana deslizante, 6 de atención global) |
| Parametros totales | 1.728.801.600 (1,73B denso) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K en el modelo base; evaluado con prompts de 2K |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; base QLoRA 4-bit NF4 durante entrenamiento; fp16 fusionado en safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas; el entrenamiento se basa en commits y CommitPackFT, mayoritariamente en inglés) |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10M USD de facturación) |
| Formato de pesos | safetensors (fp16 fusionado), adaptador PEFT, GGUF Q4_K_M |

## Arquitectura y entrenamiento

Qori 1 parte de `LiquidAI/LFM3-1.7B`, un transformer híbrido que combina 13 capas de convolución corta con gating, 5 capas de atención con ventana deslizante y 6 capas de atención global, con un vocabulario de 128K tokens y una longitud de contexto base de 256K. Sobre esta base se aplicó un QLoRA (base cuantizada en 4-bit NF4) con r=16, alpha=32, dropout de 0,05 y objetivos en `q/k/v/o_proj`, `gate_proj` y `w1/w2/w3`, sumando 13,9M parámetros entrenables (0,8% del total). El entrenamiento se ejecutó en una NVIDIA A100-40GB durante 1.076 pasos (una época completa) con secuencias de 1024 tokens y una pérdida final de 0,314.

El conjunto de datos de SFT consta de 68.893 ejemplos construidos a partir de commits minados y de CommitPackFT, filtrados por licencia, procedentes de 10 repositorios de entrenamiento (con `httpx`, `starlette` y `httpcore` retenidos para evaluación). Cada bloque de entrenamiento fue verificado automáticamente antes de su uso: el texto SEARCH debe aparecer exactamente una vez en la ventana del fichero que ve el modelo y debe diferir del REPLACE. Además, se generaron ejemplos de reparación de ambigüedad plantando duplicados del texto objetivo en otras partes del fichero, de modo que el modelo aprenda a extender el contexto en lugar de adivinar. El enmascaramiento de pérdida se aplica solo a los tokens de respuesta, dejando el prompt y el contexto del fichero a -100.

Un aspecto técnico destacable es el resultado negativo documentado con DPO: se entrenó una etapa de preferencias sobre 9.000 pares sintéticos construidos a partir de fallos observados del propio modelo (SEARCH parafraseado, SEARCH truncado, fragmentos de región incorrecta, bloques con fences). Alcanzó una precisión de recompensa de 1,0 y una pérdida de 0,007 en el 6% de una época, pero degradó el modelo: la tasa de bloques aplicables en `httpx` cayó del 90% (54/60) al 32% (19/60), con 40 de 60 salidas convertidas en no parseables. El autor lo reporta explícitamente como advertencia para quienes repliquen la receta estándar de SFT + DPO.

## Capacidades

- Edición de ficheros byte-exacta: emite un único bloque SEARCH/REPLACE cuyo texto SEARCH aparece exactamente una vez en el fichero, permitiendo aplicar el parche sin fuzzy matching.
- Generación de parches sobre código Python real, medida en repositorios como `httpx` y `starlette`.
- Reparación de ambigüedad: cuando el texto objetivo aparece duplicado, el modelo extiende el contexto del SEARCH para desambiguar.
- Modo conversacional con plantilla de chat (`apply_chat_template`), con `enable_thinking=False` obligatorio porque la plantilla base abre un bloque de razonamiento por defecto y el modelo fue entrenado con él desactivado.
- Ejecución en CPU mediante llama.cpp con el GGUF Q4_K_M, incluyendo portátiles.
- Inferencia en fp16 con transformers (`dtype="float16"`, `device_map="auto"`).
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Aplicación automatizada de parches en CI/CD: el modelo recibe el fichero y la descripción del cambio, y emite un bloque SEARCH/REPLACE que un script aplica literalmente. La tasa del 90% en `httpx` permite integrarlo como primer paso de un pipeline de revisión, con fallback a intervención humana cuando el bloque no aplica.
- Asistente de edición en el IDE: dado un fichero abierto y una instrucción en lenguaje natural, el modelo genera el parche exacto, evitando los errores de fuzzy matching típicos de asistentes generalistas que parafrasean el texto original.
- Migraciones de código a gran escala: al soportar contextos de hasta 256K en el modelo base (evaluado a 2K), puede procesar ficheros completos o módulos y producir ediciones puntuales verificables automáticamente.
- Corrección de code smells y refactors pequeños: renombrados, extracción de constantes, cambios de firma o sustitución de APIs obsoletas, donde la exactitud del texto SEARCH es crítica para no romper el fichero.
- Generación de datasets de edición de código: los bloques verificados automáticamente (SEARCH único y distinto de REPLACE) sirven como datos de entrenamiento para otros modelos o para evaluación de sistemas de parcheo.
- Despliegue en entornos con recursos limitados: con 1,73B parámetros y un GGUF Q4_K_M, puede ejecutarse en CPU en un portátil mediante `llama-cli`, lo que permite ofrecer edición asistida sin GPU ni servicios en la nube.
- Evaluación comparativa de técnicas de post-entrenamiento: el modelo y sus scripts (`mine_edits.py`, `build_sft.py`, `train_qori1.py`, `scoring.py`, `eval_edits.py`) permiten reproducir el experimento SFT vs. DPO y estudiar el fallo documentado.

## Benchmarks y rendimiento

Los benchmarks publicados miden la tasa de bloques aplicables (`applies`), es decir, que el texto SEARCH aparezca exactamente una vez en el fichero. Todos los modelos se evaluaron con el mismo prompt, scorer y número de ítems.

**httpx (repositorio retenido, excluido del entrenamiento, n=60):**

| Modelo | Parámetros | Aplicables | Tasa | IC 95% | p vs Qori 1 |
|---|---|---|---|---|---|
| Qori 1 | 1,7B | 54/60 | 90,0% | [80%, 95%] | — |
| LFM3-1.7B base | 1,7B | 0/60 | 0,0% | [0%, 6%] | 1,7e-12 |
| Qwen2.5-3B-Instruct | 3B | 19/60 | 31,7% | [21%, 44%] | 3,7e-11 |
| Qwen2.5-7B-Instruct | 7B | 14/60 | 23,3% | [14%, 35%] | 1,3e-12 |

**starlette (repositorio no visto, proyecto distinto, n=40):**

| Modelo | Parámetros | Aplicables | Tasa | IC 95% | p vs Qori 1 |
|---|---|---|---|---|---|
| Qori 1 | 1,7B | 33/40 | 82,5% | [68%, 91%] | — |
| LFM3-1.7B base | 1,7B | 0/40 | 0,0% | [0%, 9%] | 1,9e-13 |
| Qwen2.5-3B-Instruct | 3B | 11/40 | 27,5% | [16%, 43%] | 1,3e-06 |
| Qwen2.5-7B-Instruct | 7B | 10/40 | 25,0% | [14%, 40%] | 3,9e-07 |

**Efecto del DPO (httpx, n=60):**

| Modelo | Aplicables |
|---|---|
| Qori 1 (solo SFT) | 54/60 (90%) |
| Qori 1 + DPO | 19/60 (32%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,5 GB solo para pesos (1,73B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 1,1-1,3 GB para pesos, ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100-40GB fue la hardware de entrenamiento, no es necesaria para inferencia.
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores con fp16; en CPU mediante llama.cpp con el GGUF Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`, `-c 4096`, `-n 400`), transformers 5.22.1 (versión fijada; bajo 5.24.0 la arquitectura LFM3 degrada silenciosamente en repetición), y PEFT para cargar el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa `applies` en httpx | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qori 1 | 1,73B denso | 256K (evaluado a 2K) | 90,0% (54/60) | LFM Open License v1.0 (comercial <10M USD) | Hugging Face: safetensors, PEFT, GGUF Q4_K_M |
| LFM3-1.7B base | 1,73B denso | 256K | 0,0% (0/60) | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Qwen2.5-3B-Instruct | 3B denso | 32K (no confirmado en la información) | 31,7% (19/60) | No disponible en la información | Hugging Face |
| Qwen2.5-7B-Instruct | 7B denso | 32K (no confirmado en la información) | 23,3% (14/60) | No disponible en la información | Hugging Face |

La comparación se limita a la tarea de edición byte-exacta; no se dispone de datos de benchmarks generalistas para comparar capacidades fuera de ese eje. Destaca que un modelo de 1,7B supera en más de 55 puntos porcentuales a Qwen2.5-7B-Instruct en esta tarea específica, lo que ilustra el valor del post-entrenamiento especializado frente al escalado de parámetros.

## Limitaciones y advertencias

- Tamaño de evaluación reducido: 40-60 ítems por conjunto; las diferencias son estadísticamente significativas pero no constituyen benchmarks a gran escala.
- Anclaje (anchoring) es el punto débil: un bloque puede aplicarse limpiamente y aun así caer lejos del cambio pretendido.
- Algunos bloques emitidos contienen texto SEARCH ausente del fichero (líneas parafraseadas); fallan de forma dura en lugar de editar el lugar equivocado, lo que es preferible pero requiere manejo del fallo en producción.
- El GGUF Q4_K_M es para usabilidad; los números reportados usan fp16/fp32, por lo que el rendimiento con cuantización puede diferir.
- El comportamiento en Python se mide sobre repositorios reales; otros lenguajes solo se miden sobre ediciones derivadas de CommitPack, sin validación en repositorios reales.
- El DPO degrada el modelo de forma severa (90% → 32% en httpx); no aplicar preferencias sobre este adaptador sin revalidar.
- Obligatorio `enable_thinking=False` en la plantilla de chat; de lo contrario el modelo abre un bloque de razonamiento para el que no fue entrenado.
- Obligatorio fijar `transformers==5.22.1`; bajo 5.24.0 la arquitectura LFM3 degrada en repetición.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10M USD de facturación; revisar términos para uso empresarial.
- Sesgos conocidos: no disponibles en la información proporcionada; el entrenamiento se basa en commits de código, mayoritariamente en inglés, lo que puede limitar el rendimiento en otros idiomas.
- Riesgo de alucinación: documentado en forma de líneas SEARCH parafraseadas que no existen en el fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyssta/Qori-1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Resultados por ítem: carpeta `results/` publicada junto a la model card en el repositorio de Hugging Face
- Código de entrenamiento y evaluación (citado en la model card): `mine_edits.py`, `build_sft.py`, `train_qori1.py`, `scoring.py`, `eval_edits.py`
- CommitPackFT (dataset de entrenamiento): no se proporciona URL directa en la información disponible
- Blog o paper de Hadal Research: no disponible en la información proporcionada
