# ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

Este repositorio aloja las cuantizaciones GGUF de un fine-tune LoRA sobre el modelo base `ornith-ai/Ornith-1.5-9B`, entrenado específicamente para la tarea de *function calling* (llamada a funciones). El trabajo lo ha publicado el usuario `ermiaazarkhalili` (Behrooz Azarkhalili), que ha aplicado un ajuste fino supervisado (SFT) con LoRA mediante las librerías Unsloth y TRL sobre el dataset `Salesforce/xlam-function-calling-60k`. El resultado es un modelo de 9B de parámetros que mantiene la licencia MIT y se distribuye en formato GGUF, lo que permite ejecutarlo con `llama.cpp`, `Ollama` u otros motores compatibles en hardware de consumo.

La relevancia de esta ficha reside en que ofrece una vía práctica para incorporar capacidades de *tool calling* a un modelo base de código abierto ya conocido por su buen rendimiento en tareas de razonamiento y programación (el modelo base Ornith-1.5-9B). Al estar cuantizado en varios niveles (de 3.83 GB a 9.53 GB), es posible desplegarlo en GPUs con poca VRAM o incluso solo CPU. No obstante, hay que tener en cuenta que no se han publicado resultados de benchmarks para este fine-tune concreto, solo métricas de pérdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Ornith-1.5-9B) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento se realizó con secuencias de 2048 tokens) |
| Tipos de cuantizacion | q2_K, q3_K_m, q4_K_m, q5_K_m, q6_K, q8_0 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre el modelo base `ornith-ai/Ornith-1.5-9B`, que a su vez es un modelo denso de 9B parámetros con arquitectura transformer. El ajuste se realizó con QLoRA (cuantización 4-bit de la base) y los siguientes hiperparámetros: LoRA rank 64, alpha 64, learning rate 0.0002, una sola época, batch efectivo de 8 (1 batch x 8 grad accum) y longitud máxima de secuencia de 2048 tokens. Los módulos objetivo incluyen `down_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`, lo que cubre la mayoría de las proyecciones lineales del transformer.

El dataset de entrenamiento es `Salesforce/xlam-function-calling-60k`, un conjunto de 60.000 ejemplos de llamadas a funciones con formato estructurado. No se emplearon técnicas de RLHF ni DPO, solo SFT. Los adaptadores LoRA se fusionaron con los pesos base, por lo que el modelo resultante no puede separarse del fine-tune. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base Ornith-1.5-9B (tokens totales, mezcla de lenguajes, etc.).

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base.
- Soporte de *function calling* / *tool calling*: el modelo ha sido entrenado para generar llamadas a funciones estructuradas, lo que permite integrarlo en sistemas que necesitan invocar herramientas externas.
- Generación de código y razonamiento matemático (capacidades del modelo base, no verificadas en este fine-tune).
- Capacidades multilingües: no disponibles, el modelo base no publica información al respecto.
- No se ha documentado soporte para *vision*, *audio* u otras modalidades.
- No se indica soporte para *thinking mode* ni *multi-step reasoning* específico, aunque el modelo base podría tener ciertas habilidades de razonamiento.

## Casos de uso

- Asistentes virtuales con integración de herramientas: el modelo puede interpretar peticiones del usuario y generar llamadas a funciones para consultar APIs de calendario, clima, bases de datos, etc., gracias a su entrenamiento en `xlam-function-calling-60k`.
- Automatización de tareas de back-office: por ejemplo, extraer datos de formularios o generar acciones en sistemas CRM mediante llamadas a funciones definidas por el usuario.
- Generación de código en pipelines CI/CD: el modelo puede ser invocado para generar fragmentos de código que luego se ejecutan a través de funciones auxiliares, aunque su especialización principal es la llamada a funciones más que la generación de código puro.
- Creación de agentes conversacionales con memoria de contexto: con una ventana de contexto de 2048 tokens (el límite usado en el entrenamiento), puede manejar diálogos de longitud media, manteniendo el estado de la conversación y llamando a funciones cuando sea necesario.
- Integración en entornos de escritorio o edge: gracias a las cuantizaciones GGUF, se puede ejecutar en una laptop con GPU de gama media o incluso en CPU, facilitando prototipos locales de aplicaciones con *tool calling*.
- Experimentación académica en investigación de *tool calling*: el modelo puede servir como base para comparar métodos de SFT para function calling en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint. La model card solo reporta la pérdida de entrenamiento observada en dos ejecuciones SLURM:

| SLURM job | Steps | Primera pérdida | Pérdida final |
|---|---|---|---|
| `55906359` | 14.250 | 0.9539 | 0.8267 |
| `55906361` | 7.500 | 0.5712 | 0.1162 |

Estos valores son solo observaciones de pérdida de entrenamiento y no deben interpretarse como una medida de calidad o rendimiento. No se han ejecutado evaluaciones como MMLU, HumanEval o GSM8K sobre este fine-tune. El modelo base Ornith-1.5-9B tiene resultados publicados (SWE-bench Verified 70.6 y GPQA Diamond 86.4), pero no son aplicables a este checkpoint específico.

## Requisitos de hardware

- Tamaño de los archivos GGUF:
  - `q2_k`: 3.83 GB
  - `q3_k_m`: 4.62 GB
  - `q4_k_m`: 5.63 GB
  - `q5_k_m`: 6.47 GB
  - `q6_k`: 7.36 GB
  - `q8_0`: 9.53 GB
- VRAM estimada para inferencia: depende de la cuantización y del contexto. Para `q4_k_m` (5.63 GB), se requiere al menos 6-7 GB de VRAM si se usa una GPU con capacidad para el modelo completo; en CPU, se puede ejecutar con la RAM equivalente.
- GPUs recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 4060, RTX 3060, etc.) para las cuantizaciones bajas; para `q8_0` se recomienda al menos 10 GB de VRAM (RTX 3080, RTX 4070, A10).
- Se puede ejecutar en CPU con `llama.cpp`, aunque la latencia será mayor.
- Opciones de despliegue: `llama.cpp`, `Ollama` (creando un Modelfile), o servidores compatibles con GGUF como `llama-cpp-python`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. Se podría comparar con el modelo base `ornith-ai/Ornith-1.5-9B` (sin fine-tune) y con otros modelos de function calling de tamaño similar como `xLAM-1x7b` o `Gorilla`, pero no hay datos concretos en la búsqueda web. Por tanto, no se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- No se ha evaluado el rendimiento en benchmarks; solo se reportan pérdidas de entrenamiento, que no indican calidad real.
- El modelo hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base Ornith-1.5-9B.
- El fine-tune se realizó únicamente sobre el dataset `xlam-function-calling-60k`; el comportamiento fuera de la distribución de este dataset no está probado y puede ser poco fiable.
- Los adapters LoRA se han fusionado en los pesos base, por lo que no se puede separar el fine-tune del modelo base.
- La longitud de contexto máxima del fine-tune es de 2048 tokens; si se utiliza más contexto, el modelo puede degradarse.
- No se ha confirmado el soporte multilingüe; es probable que el modelo base tenga limitaciones en idiomas distintos del inglés.
- La licencia MIT permite uso comercial, pero es necesario revisar la licencia del modelo base Ornith-1.5-9B (también MIT según la model card) y la de los datasets utilizados (por ejemplo, `xlam-function-calling-60k` puede tener términos adicionales).

## Enlaces

- Repositorio HuggingFace: [ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth-GGUF](https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth-GGUF)
- Modelo base: [ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- Repo de pesos completos del fine-tune: [ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth](https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-Function-Calling-xLAM-Unsloth)
- Blog del modelo base: [Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- Página del modelo base en AI/TLDR: [Ornith-1.5-9B: 9B Dense Open MIT Coding Model](https://ai-tldr.dev/models/ornith-1-5-9b/)
- Dataset de entrenamiento: [Salesforce/xlam-function-calling-60k](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k)
