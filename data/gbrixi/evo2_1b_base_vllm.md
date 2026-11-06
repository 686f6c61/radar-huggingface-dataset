# gbrixi/evo2_1b_base_vllm

## Resumen

Evo 2 1B base (checkpoint vLLM) es la conversión a safetensors del modelo `arcinstitute/evo2_1b_base`, un modelo de lenguaje de ADN desarrollado por el Arc Institute. El modelo original se entrena de forma autorregresiva sobre billones de tokens de ADN y está diseñado para tareas de genómica: predicción de la siguiente base, generación de secuencias, anotación funcional y análisis de variantes. Esta versión concreta, publicada por el usuario `gbrixi`, no modifica los pesos del modelo base: únicamente los reempaqueta para que puedan cargarse con el backend vLLM del paquete `evo2`.

La relevancia de esta ficha radica en que el checkpoint está pensado para inferencia de alto rendimiento en GPUs, con soporte de pesos FP8 en hardware que dispone de tensor cores FP8 (H100, H200, L4) y una ruta alternativa sin FP8 para GPUs como la A100. El modelo tiene 1.109.683.242 parámetros (aproximadamente 1,1 mil millones) distribuidos en 25 capas, y esta variante base está entrenada con una longitud de contexto de 8192 tokens, según la model card del autor.

Se trata de un modelo de dominio específico (biología molecular), no de un LLM conversacional: no soporta tool calling, agentes ni capacidades multilingües en el sentido habitual. Su utilidad está en pipelines bioinformáticos que necesitan generar o puntuar secuencias de ADN a escala, y su licencia Apache 2.0 facilita la integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | striped_hyena2 (tag de Hugging Face); transformer autorregresivo de ADN según la model card |
| Parametros totales | 1.109.683.242 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (variante base) |
| Tipos de cuantizacion | pesos FP8 en GPUs con tensor cores FP8 (H100, H200, L4); forma sin FP8 generada desde `surgery/` en otras GPUs |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.0 GB) |

## Arquitectura y entrenamiento

La model card describe Evo 2 como un modelo de lenguaje de ADN entrenado de forma autorregresiva sobre billones de tokens de ADN. El tag de Hugging Face indica la arquitectura `striped_hyena2`, lo que sugiere el uso de capas tipo Hyena (convoluciones de largo alcance) en lugar de atención estándar, una elección habitual para secuencias genómicas muy largas. Esta variante concreta tiene 25 capas y 1,1 mil millones de parámetros.

No se detalla en la información disponible la composición exacta del dataset de entrenamiento, el número preciso de tokens, ni si hubo fases de RLHF o DPO. La model card menciona que los checkpoints de 20B y 7B están entrenados hasta una longitud de secuencia de 1 millón de tokens, pero esta variante base de 1B se distribuye con contexto de 8192 tokens. La innovación técnica destacable de esta publicación es el reempaquetado a safetensors para el backend vLLM, con pesos FP8 para GPUs modernas y una ruta de conversión sin FP8 para GPUs sin tensor cores FP8.

## Capacidades

- Modelado de lenguaje de ADN: predicción autorregresiva de la siguiente base y puntuación de verosimilitud de secuencias genómicas.
- Generación de secuencias de ADN condicionada por contexto.
- Análisis de variantes y regiones genómicas mediante puntuaciones de probabilidad.
- Inferencia de alto rendimiento con backend vLLM, incluyendo pesos FP8 en H100, H200 y L4.
- Compatibilidad con el paquete `evo2` mediante `Evo2('evo2_1b_base', backend='vllm')`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step en el sentido de los LLM de propósito general.
- No dispone de capacidades multilingües de lenguaje natural ni de visión o audio.

## Casos de uso

- Anotación de genomas: puntuar regiones candidatas de un genoma con el modelo para priorizar elementos funcionales antes de validación experimental, aprovechando el contexto de 8192 tokens para cubrir ventanas genómicas amplias.
- Generación de secuencias sintéticas de ADN: producir candidatos de secuencia para diseño experimental (por ejemplo, promotores o elementos reguladores) y filtrarlos después con criterios biológicos.
- Análisis de variantes: comparar la verosimilitud de una secuencia de referencia frente a una variante para estimar el impacto de mutaciones en regiones concretas.
- Preentrenamiento y fine-tuning posteriores: usar este checkpoint base de 1B como punto de partida para ajustar el modelo a genomas específicos, como hace la variante `evo2_7b_microviridae` con genomas de Microviridae.
- Pipelines bioinformáticos a escala: desplegar el modelo con vLLM para procesar lotes grandes de secuencias con throughput alto, aprovechando los pesos FP8 en GPUs H100 o L4.
- Investigación en genómica comparada: calcular puntuaciones de probabilidad sobre secuencias de distintas especies para estudiar conservación y divergencia.
- Prototipado en GPUs de gama media: usar la ruta sin FP8 en GPUs como la A100 para entornos de investigación sin acceso a hardware con tensor cores FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en FP16/BF16 solo para pesos (1,1B parámetros); en FP8, alrededor de 1,1 GB para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: H100, H200 y L4 para la ruta FP8 nativa; A100 y otras GPUs sin tensor cores FP8 mediante la forma sin FP8 generada desde `surgery/`.
- Cabe en GPUs de consumo: sí, por tamaño de pesos, aunque la model card solo menciona explícitamente H100, H200, L4 y A100; no se confirma soporte en RTX 4090 u otras consumer.
- Opciones de despliegue: backend vLLM del paquete `evo2` (`Evo2('evo2_1b_base', backend='vllm')`); para el backend Vortex se indica usar `arcinstitute/evo2_1b_base`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gbrixi/evo2_1b_base_vllm | 1,1B | 8192 | vLLM | apache-2.0 | Hugging Face |
| gbrixi/evo2_7b_base_vllm | 7B | 8192 | vLLM | no disponible en la informacion | Hugging Face |
| gbrixi/evo2_7b_262k_vllm | 7B | 262.144 | vLLM | no disponible en la informacion | Hugging Face |
| gbrixi/evo2_20b_vllm | 20B | hasta 1M (segun model card) | vLLM | no disponible en la informacion | Hugging Face |
| arcinstitute/evo2_1b_base | 1,1B | 8192 | Vortex | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Modelo de dominio específico: no es un LLM de propósito general; no debe esperarse razonamiento en lenguaje natural, código ni matemáticas.
- No se han publicado datos de sesgos ni evaluaciones de alucinación en la información disponible; en genómica, una secuencia generada no validada experimentalmente no debe tratarse como un resultado biológico fiable.
- El contexto de esta variante base es de 8192 tokens, muy inferior al millón de tokens de los checkpoints de 20B y 7B, lo que limita el análisis de regiones genómicas largas.
- La ruta FP8 solo está disponible en GPUs con tensor cores FP8; en otras GPUs se genera una forma sin FP8 desde `surgery/`, lo que añade un paso de conversión y posible consumo extra de memoria.
- Este repositorio es una conversión de terceros (`gbrixi`), no una publicación oficial del Arc Institute; para el backend Vortex se recomienda el checkpoint original `arcinstitute/evo2_1b_base`.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base original antes de desplegarlo en producción.
- No se dispone de información sobre idiomas soportados ni sobre evaluación en tareas de lenguaje natural, lo que es esperable al tratarse de un modelo de secuencias de ADN.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/gbrixi/evo2_1b_base_vllm
- Modelo base: https://huggingface.co/arcinstitute/evo2_1b_base
- Repositorio GitHub de Evo 2: https://github.com/ArcInstitute/evo2
- Paper de Evo 2: https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
- Checkpoint evo2_20b vLLM: https://huggingface.co/gbrixi/evo2_20b_vllm
- Checkpoint evo2_7b vLLM: https://huggingface.co/gbrixi/evo2_7b_vllm
- Checkpoint evo2_7b_base vLLM: https://huggingface.co/gbrixi/evo2_7b_base_vllm
- Checkpoint evo2_7b_262k vLLM: https://huggingface.co/gbrixi/evo2_7b_262k_vllm
- Checkpoint evo2_7b_microviridae vLLM: https://huggingface.co/gbrixi/evo2_7b_microviridae_vllm
