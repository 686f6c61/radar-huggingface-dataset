# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int8-gs64-sym

## Resumen

Esta ficha describe una versión cuantizada a INT8 del modelo `meta-llama/Llama-3.1-8B-Instruct`, publicada por el usuario fbaldassarri en HuggingFace. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo Llama 3.1 8B Instruct de Meta, procesado con la técnica de cuantización WoQ (weights-only quantization) SignRound del framework Intel AutoRound v0.16.0. El objetivo es reducir el peso del modelo (de los aproximadamente 16 GB en bf16 a unos 11,5 GB de repositorio) manteniendo la calidad del original, para facilitar su despliegue en hardware Intel (CPU, iGPU Arc y NPU AI Boost de la serie Core Ultra).

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con 8.030 millones de parámetros nominales, ventana de contexto de 128.000 tokens y licencia Llama 3.1 Community. La cuantización se ha realizado con precisión simétrica de 8 bits, tamaño de grupo 64, calibración en CPU con 128 muestras, 200 iteraciones y secuencia de 512 tokens, en un proceso que el autor documenta con una duración de 41.838 segundos (unas 11,6 horas).

La relevancia de esta publicación es acotada pero concreta: sirve como artefacto reproducible para quienes necesitan ejecutar Llama 3.1 8B Instruct en entornos Intel con restricciones de memoria, y como ejemplo de receta de cuantización AutoRound documentada paso a paso. No aporta mejoras de capacidades respecto al modelo base; su valor está en el empaquetado y en la trazabilidad del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado INT8 con AutoRound (WoQ SignRound) |
| Parametros totales | 8.030 millones (modelo base); el safetensors del repo cuantizado reporta 2.932.084.736 elementos almacenados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | INT8, group size 64, simétrica (sym=true), weights-only (WoQ) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (según tags del repo) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (librería transformers; `format="auto_round"`) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y 128.000 tokens de contexto, entrenado por Meta con un pipeline que incluye preentrenamiento masivo, ajuste supervisado y optimización por preferencias (RLHF/DPO). Esta versión no modifica esa arquitectura ni reentrena pesos: aplica cuantización post-entrenamiento de solo pesos (WoQ) con el algoritmo SignRound de Intel AutoRound, que ajusta los parámetros de cuantización mediante un proceso de tuning con datos de calibración.

Los detalles del proceso están documentados en la model card: calibración en CPU con `torch.bfloat16`, 128 muestras (`nsamples=128`), 200 iteraciones (`iters=200`), longitud de secuencia 512 (`seqlen=512`) y batch de 4. El entorno registrado incluye auto-round 0.16.0, transformers 4.55.3 y torch 2.14.1+cpu. La cuantización se orienta explícitamente a inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost de Core Ultra mediante OpenVINO. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal; el interés técnico reside en la reproducibilidad del pipeline AutoRound.

## Capacidades

- Generación de texto conversacional en modo instruct/chat, con plantilla de chat propia que debe aplicarse mediante `apply_chat_template`.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Llama 3.1 8B Instruct.
- Generación de código y tareas de matemáticas básicas a moderadas, con las limitaciones propias de un modelo de 8B.
- Capacidades multilingües en los ocho idiomas declarados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Soporte de tool calling y function calling heredado del modelo base (no verificado de forma independiente en esta versión cuantizada).
- Uso en flujos de agente y razonamiento multi-paso, sujeto a la ventana de contexto de 128k tokens del original.
- No dispone de visión, audio ni modo de pensamiento explícito (thinking mode); es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue en estaciones de trabajo Intel sin GPU dedicada: el formato INT8 con AutoRound está pensado para ejecutarse en CPU Intel y en iGPU Arc, lo que permite servir un asistente conversacional en equipos de oficina con memoria limitada.
- Inferencia en portátiles con NPU AI Boost (Core Ultra): al estar optimizado para OpenVINO, puede integrarse en aplicaciones locales de asistencia que aprovechen la NPU y reduzcan el consumo frente a ejecutar el modelo en bf16.
- Prototipado de chatbots de atención al cliente: la ventana de 128k tokens permite mantener conversaciones multi-turno con historial extenso y documentación adjunta, aunque el rendimiento real dependerá del hardware.
- Generación de código asistida en entornos de desarrollo con hardware Intel: el modelo puede integrarse en plugins de IDE o pipelines de revisión, con la ventaja de un peso menor (11,5 GB de repo) que la versión bf16.
- Evaluación comparativa de cuantizaciones: útil como artefacto de referencia para medir la degradación de calidad de AutoRound INT8 frente al modelo original en tareas concretas de la organización.
- Reproducción de pipelines de cuantización: la receta documentada (auto-round-pipeline, `runner.py` con `--quant 'INT8-gs64'`) sirve para formar a equipos en el proceso de cuantización WoQ y para generar variantes de otros modelos.
- Procesamiento de documentos multilingües en los ocho idiomas soportados, con especial utilidad en español, francés, alemán, italiano y portugués para mercados europeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 11,5 GB; en ejecución en INT8 se requiere del orden de 8-9 GB de memoria para los pesos, más overhead de activaciones y caché KV (que crece con el contexto).
- GPU recomendadas: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc (por ejemplo Core Ultra 185H) y NPU AI Boost vía OpenVINO. Para GPU NVIDIA/AMD el pipeline permite optar por `--cuda` o `--rocm`, pero no se documentan resultados.
- ¿Cabe en GPU de consumo? Con 8-9 GB de pesos, cabría en GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no es el escenario objetivo del autor y no hay datos de rendimiento publicados.
- Opciones de despliegue: transformers (con `device_map="auto"`), intel-extension-for-pytorch para CPU/iGPU Arc, OpenVINO para NPU. El tag `text-generation-inference` sugiere compatibilidad con TGI, no verificada. No se mencionan llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles. El único dato temporal documentado es la duración de la cuantización (41.838 s), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama 3.1 8B Instruct INT8 AutoRound) | 8B | 128k | INT8 gs64 sim | Llama 3.1 Community | HuggingFace, 22 descargas |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8B | 128k | bf16/fp16 | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Otras cuantizaciones de Llama 3.1 8B (GPTQ, AWQ, GGUF) | 8B | 128k | 4-8 bits | Llama 3.1 Community | HuggingFace, ecosistema amplio |
| Mistral 7B Instruct | 7B | 32k | varias | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card incluye la advertencia explícita de que el modelo se ha desarrollado "solo para fines de investigación" y se ofrece sin garantía; conviene revisar esta restricción antes de un uso comercial.
- La licencia Llama 3.1 Community impone condiciones de uso (política de uso aceptable, umbral de usuarios activos mensuales, atribución) que deben cumplirse en producción.
- Al ser una cuantización INT8, puede existir una degradación de calidad respecto al modelo bf16 original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- El artefacto tiene 22 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados; su fiabilidad en producción no está contrastada.
- El campo `inference: false` en los metadatos de la model card puede indicar que la inferencia no está verificada por el autor en el Hub, pese a incluir un ejemplo de uso con transformers.
- El safetensors reporta 2.932.084.736 elementos, un recuento que no coincide con los 8.030 millones de parámetros nominales del modelo base; conviene validar la integridad de los pesos antes de desplegar.
- Idiomas limitados a los ocho declarados; el rendimiento en otros idiomas no está garantizado.
- La receta de reproducción apunta a un repositorio externo (`git.epicdynamic.com`), no a un canal oficial de Intel; verificar su procedencia antes de ejecutar scripts.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Pipeline de reproducción citado por el autor: https://git.epicdynamic.com/auto-round-pipeline

Los resultados de búsqueda web proporcionados (sortirautour.fr y zon.events) no guardan relación con el modelo y se han descartado.
