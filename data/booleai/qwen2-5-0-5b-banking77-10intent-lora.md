# booleai/qwen2.5-0.5b-banking77-10intent-lora

## Resumen

qwen2.5-0.5b-banking77-10intent-lora es un adaptador LoRA (publicado también como modelo fusionado) entrenado por Boole AI, Inc. sobre Qwen2.5-0.5B-Instruct de Alibaba, con el objetivo de clasificar mensajes de soporte bancario en 10 intents del dataset BANKING77. No es un modelo de propósito general: responde exactamente con una etiqueta del conjunto permitido (por ejemplo, `card_arrival` o `declined_transfer`), lo que lo convierte en un clasificador de intenciones basado en generación restringida por prompt.

El artefacto tiene un carácter principalmente demostrativo: Boole lo publicó como ejemplo práctico de su flujo de fine-tuning, destacando que el entrenamiento se realizó íntegramente en CPU (una VM de 8 núcleos con 15 GB de RAM) en unos 20 minutos. Los resultados publicados muestran un salto notable respecto al modelo base: de un 60,75 % de exact-match en zero-shot a un 97,75 % tras el fine-tuning, con un 100 % de salidas que son etiquetas válidas.

Es relevante como referencia para equipos que quieran resolver tareas de clasificación estrechas con modelos muy pequeños (494 millones de parámetros) ejecutables en CPU, sin depender de GPUs. La arquitectura base es un transformer decoder de la familia Qwen2.5, con 494 millones de parámetros totales, de los cuales solo 8,8 millones (1,75 %) son entrenables mediante LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), adaptador LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Qwen2.5-0.5B-Instruct no se indica en la model card) |
| Tipos de cuantizacion | fp32 (pesos fusionados publicados); sin cuantizaciones publicadas |
| Idiomas soportados | Ingles (entrenado solo con mensajes en ingles) |
| Licencia | Apache 2.0 (modelo base y adaptador); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | Safetensors (modelo fusionado en la raiz del repo y adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder causal de 494 millones de parámetros. Sobre sus proyecciones de atención y MLP (q/k/v/o/gate/up/down) se aplicó LoRA con r=16, alpha=32 y dropout 0,05, lo que supone 8,8 millones de parámetros entrenables (el 1,75 % del total). El repo incluye tanto los pesos fusionados en fp32 como el adaptador LoRA por separado, además de los scripts de entrenamiento y evaluación.

El entrenamiento usó 600 ejemplos (60 por intent) muestreados del split oficial de entrenamiento de BANKING77 con semilla 0, y se evaluó sobre los 400 ejemplos oficiales de test de esos 10 intents (40 por intent), que el modelo nunca vio. Se optimizó con AdamW a lr 2e-4 con decay lineal hasta 0, durante 2 épocas con batch efectivo 8 (micro-batch 2), 150 pasos de optimizador, en fp32 y con gradient checkpointing. La loss solo cubría los tokens de la etiqueta del asistente, y el system prompt enumera las 10 etiquetas permitidas. Como innovación destacable, todo el proceso se ejecutó en CPU (VM Intel Xeon de 8 núcleos, 15 GB de RAM, sin GPU) en 1.212 segundos, aproximadamente 20 minutos, lo que demuestra la viabilidad del fine-tuning LoRA de modelos sub-1B sin hardware acelerador. No se aplicó RLHF ni DPO; es un fine-tuning supervisado de tarea única.

## Capacidades

- Clasificacion de intents en dominio bancario: asigna exactamente una de 10 etiquetas de BANKING77 (`card_arrival`, `lost_or_stolen_card`, `exchange_rate`, `top_up_failed`, `cash_withdrawal_charge`, `change_pin`, `declined_transfer`, `refund_not_showing_up`, `passcode_forgotten`, `terminate_account`) a mensajes cortos en ingles.
- Salidas estructuradas y validas: tras el fine-tuning, el 100 % de las respuestas del test son etiquetas validas (frente al 82,75 % del modelo base), gracias al entrenamiento con loss restringida a los tokens de etiqueta.
- Generacion de texto basica heredada del modelo base: al ser un fine-tuning estrecho, conserva parcialmente las capacidades conversacionales de Qwen2.5-0.5B-Instruct, pero el modelo esta optimizado para responder solo con etiquetas.
- Ejecucion en CPU: el tamano (0,5B) y el formato fp32 permiten inferencia sin GPU, con evaluaciones de 400 ejemplos en unos 53 segundos (greedy decoding, max 12 tokens nuevos, batch 16).
- Soporte de tool calling / function calling: no disponible (no se menciona ni se ha evaluado).
- Capacidades multilingues: no disponible; entrenado y evaluado unicamente en ingles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Clasificacion de intents en chatbots bancarios: enruta mensajes de clientes en ingles a una de las 10 intents soportadas antes de escalar a un flujo conversacional o a un agente humano; su 97,75 % de exact-match y 100 % de etiquetas validas lo hacen adecuado como capa de enrutado determinista.
- Prototipado rapido de clasificadores con LLM: sirve de plantilla reproducible (scripts de entrenamiento y evaluacion incluidos) para adaptar el mismo pipeline a otros datasets de intents sin necesidad de GPU.
- Demostracion de fine-tuning en CPU: equipos sin acceso a GPUs pueden replicar el flujo completo (entrenamiento en ~20 min en una VM de 8 nucleos) para validar la viabilidad de LoRA en modelos pequenos.
- Filtrado y triaje de tickets de soporte: clasifica mensajes entrantes cortos en ingles para priorizar o dirigir tickets segun la intencion detectada.
- Baseline para benchmarks de intents: al publicarse con resultados por intent y scripts de evaluacion, es util como referencia comparable en experimentos sobre BANKING77.
- Integracion en pipelines de datos: su salida de una sola etiqueta permite parseo trivial y validacion automatica en sistemas ETL o de monitorizacion de conversaciones.

No es adecuado para uso en produccion con clientes reales: el propio autor lo califica como artefacto de demostracion.

## Benchmarks y rendimiento

Resultados publicados por el autor (split de test retenido, n=400, mismo prompt y decodificacion greedy para ambos modelos; exact-match estricto sobre la cadena de la etiqueta):

| Modelo | Exact-match (n=400) | Salida es etiqueta valida |
|---|---|---|
| Qwen2.5-0.5B-Instruct (base, zero-shot) | 60,75 % (243/400) | 82,75 % |
| qwen2.5-0.5b-banking77-10intent-lora (fusionado) | 97,75 % (391/400) | 100 % |

Aciertos por intent (sobre 40 ejemplos cada uno):

| Intent | Base | Fine-tuned |
|---|---|---|
| card_arrival | 25 | 36 |
| lost_or_stolen_card | 38 | 39 |
| exchange_rate | 38 | 40 |
| top_up_failed | 35 | 38 |
| cash_withdrawal_charge | 17 | 40 |
| change_pin | 39 | 40 |
| declined_transfer | 6 | 40 |
| refund_not_showing_up | 29 | 38 |
| passcode_forgotten | 6 | 40 |
| terminate_account | 10 | 40 |

Tiempos de evaluacion publicados: 67 s para el modelo base y 53 s para el fine-tuned sobre 400 ejemplos (greedy, max 12 tokens nuevos, batch 16). No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: con 494 millones de parametros en fp32, unos 2 GB de memoria (coincide con el tamano del repo de 2,0 GB); cabe comodamente en la RAM de una maquina sin GPU, como demuestra la propia evaluacion en CPU.
- GPU recomendadas: no se requiere GPU para inferencia ni para reproducir el entrenamiento (este se realizo en una VM Intel Xeon de 8 nucleos con 15 GB de RAM). Si se quisiera acelerar, cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) sobraria.
- Cabe en consumer GPU: si, sobradamente; tambien funciona unicamente con CPU, que es el modo de uso documentado.
- Opciones de despliegue: al ser un modelo Qwen2.5 con safetensors, es compatible con vLLM, llama.cpp (previa conversion a GGUF, no publicada), Ollama y TGI; la model card solo documenta la ejecucion con los scripts Python incluidos (`scripts/eval.py`).
- Latencia y throughput estimados: 400 ejemplos en 53 s con batch 16 en CPU (8 nucleos), es decir, unos 7,5 ejemplos por segundo; latencia individual no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Exact-match publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-banking77-10intent-lora | 494M (8,8M entrenables via LoRA) | Clasificacion de 10 intents de BANKING77 | 97,75 % | Apache 2.0 | HuggingFace, con scripts y evaluaciones |
| Qwen2.5-0.5B-Instruct (base, zero-shot) | 494M | Misma tarea, sin fine-tuning | 60,75 % (82,75 % etiquetas validas) | Apache 2.0 | HuggingFace (Qwen/Qwen2.5-0.5B-Instruct) |
| Alternativas fine-tuned sobre BANKING77 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen otros fine-tunings publicos comparables de modelos generativos pequenos sobre el mismo subconjunto de 10 intents de BANKING77 en la informacion disponible.

## Limitaciones y advertencias

- Alcance muy estrecho: solo 10 de los 77 intents de BANKING77, mensajes de un solo turno, en ingles y procedentes de un benchmark publico; los resultados no extrapolan a los otros 67 intents ni a trafico real de clientes.
- Riesgo de sobreajuste aparente: la loss de entrenamiento ya era casi cero en el paso 10, lo que indica que la tarea es trivial una vez conocido el formato de etiqueta; los 97,75 % deben interpretarse con cautela.
- Unica ejecucion con una sola semilla y sin busqueda de hiperparametros; no hay varianza reportada.
- El baseline zero-shot se evaluo con un prompt concreto; un prompt mejorado o few-shot podria reducir la brecha respecto al modelo fine-tuned.
- Sesgos: hereda los sesgos del modelo base Qwen2.5-0.5B-Instruct y del dataset BANKING77 (dominio bancario del Reino Unido, mensajes en ingles); no se ha realizado analisis de sesgos.
- Alucinacion: como clasificador fine-tuned produce etiquetas validas en el 100 % del test, pero fuera de distribucion el comportamiento no esta caracterizado y puede generar texto arbitrario.
- Idioma: solo se ha validado en ingles; no hay soporte garantizado para castellano ni otros idiomas.
- Licencia: el modelo es Apache 2.0 (uso comercial permitido), pero los datos de BANKING77 son CC BY 4.0, lo que exige atribucion si se reutiliza el dataset.
- Uso en produccion: el autor advierte explicitamente que no es adecuado para tomar decisiones sobre clientes reales; es un artefacto de demostracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/booleai/qwen2.5-0.5b-banking77-10intent-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset BANKING77 (PolyAI): https://github.com/PolyAI-LDN/task-specific-datasets
- Dataset en HuggingFace: https://huggingface.co/datasets/PolyAI/banking77
- Plataforma de fine-tuning de Boole: https://boole-gpu-jobs.onrender.com
- Paper de BANKING77 (Casanueva et al., 2020): no disponible enlace directo en la informacion proporcionada
