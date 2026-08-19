# jkminder/pretraining-priors-pirate2x2-d26-sft

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-sft` es un modelo de lenguaje de aproximadamente 973 millones de parámetros, desarrollado por jkminder dentro del proyecto de investigación "pretraining-priors" (experimento exp-056). Se trata de la etapa de *instruction-SFT* sobre el modelo base `pirate-2x2 d26`, que fue preentrenado con una mezcla de datos llamada ClimbMix más cuatro corpus específicos (el "pirate 2x2") que representan un 4,23 % del flujo de entrenamiento. El objetivo del experimento es estudiar cómo los "priors" introducidos durante el preentrenamiento afectan al comportamiento posterior del modelo tras un ajuste fino por instrucciones.

La relevancia de este modelo radica en su uso como herramienta de investigación para entender la condicionalidad del comportamiento: el registro "pirata" plantado durante el preentrenamiento solo aparece cuando el usuario lo solicita explícitamente, y el SFT posterior no incluye ningún dato relacionado con ese registro. Esto permite aislar y analizar los efectos de los priors de preentrenamiento en tareas de chat y razonamiento. El modelo se distribuye con licencia MIT y pesos en formato safetensors (bf16), y requiere `trust_remote_code=True` para su carga debido a archivos de modelado personalizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en nanochat_gpt (detalles no disponibles) |
| Parametros totales | 972.947.456 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) con código personalizado (`trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible; el tag `nanochat_gpt` sugiere un transformer decoder de tipo nanochat, pero no se especifican detalles como número de capas, heads o dimensiones. El modelo fue preentrenado con un *token ratio* de 10 sobre el dataset ClimbMix y cuatro corpus "pirate 2x2" (que incluyen contenido de gatos y diálogos piratas condicionales). Posteriormente se aplicó un SFT estándar con la mezcla de chat por defecto del repositorio: SmolTalk, MMLU repetido 3 veces y GSM8K repetido 4 veces (incluyendo partes con tool-call), en una sola pasada. El entrenamiento del SFT se realizó en 8×H200 durante 25 minutos (checkpoint `d26-r10-18f55c9321ff-sft-620b8e04`, step 465). La conversión a safetensors se hizo con el script `ppriors/hf_export/convert_sft.py`, verificando equivalencia de logits y chat-template en CPU.

## Capacidades

- Generación de texto en inglés y seguimiento de instrucciones de chat.
- Soporte de *tool calling* (las partes de GSM8K del SFT incluyen llamadas a herramientas).
- Comportamiento condicional: el registro "pirata" solo se manifiesta cuando el usuario lo pide explícitamente; no aparece de forma no solicitada.
- Capacidades básicas de razonamiento y conocimiento general (medidas por MMLU, ARC, etc.).
- No se reportan capacidades multimodales ni de audio.

## Casos de uso

- Investigación en interpretabilidad y alineación: permite estudiar cómo los priors de preentrenamiento condicionan el comportamiento tras el SFT, especialmente en experimentos de "cambio de registro" (pirata vs. normal).
- Evaluación de técnicas de *instruction tuning* en modelos pequeños: sirve como punto de referencia para medir el efecto del SFT sobre un base específico.
- Pruebas de *tool calling* en entornos de investigación: al incluir datos de GSM8K con tool-call, puede usarse para probar pipelines de agentes simples.
- Chat conversacional básico en inglés para prototipos o demos educativas.
- Experimentos de *prompt engineering* para activar o suprimir comportamientos condicionales.
- Análisis de sesgos y robustez en modelos pequeños con datos de entrenamiento controlados.

## Benchmarks y rendimiento

Los resultados del *chat_eval* en el step 465 (accuracy en %) son:

| Benchmark | Resultado |
|---|---|
| ChatCORE | 0.2200 |
| ARC-Easy | 63.55 |
| ARC-Challenge | 46.84 |
| MMLU | 37.38 |
| GSM8K | 1.36 |
| HumanEval | 11.59 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Con ~973M parámetros en bf16, el modelo ocupa aproximadamente 1.9 GB en disco. Para inferencia en bf16 se necesitan al menos 2 GB de VRAM, aunque en la práctica se recomiendan GPUs con 8 GB o más para manejar el contexto y el overhead.
- Puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, etc., siempre que se use cuantización (no disponible de serie) o se limite la longitud de contexto.
- El entrenamiento del SFT se realizó en 8×H200 (GPU de centro de datos), pero la inferencia es viable en hardware de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles en principio, aunque no se ha verificado oficialmente. Al requerir `trust_remote_code`, el despliegue con frameworks estándar puede necesitar adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño ~1B, licencia MIT, enfoque de investigación). Se recomienda comparar con modelos como TinyLlama-1.1B o Qwen1.5-0.5B, pero no hay datos de rendimiento directos en la documentación.

## Limitaciones y advertencias

- Rendimiento bajo en tareas complejas: GSM8K 1.36 % y HumanEval 11.59 % indican limitaciones severas en razonamiento matemático y generación de código.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en entornos de producción.
- El modelo es un artefacto de investigación, no está optimizado para uso productivo y puede presentar alucinaciones frecuentes.
- No se documentan sesgos específicos, pero al estar entrenado con datos limitados y controlados, puede reflejar sesgos de esos datasets.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-sft
- Modelo base: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Dataset pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
