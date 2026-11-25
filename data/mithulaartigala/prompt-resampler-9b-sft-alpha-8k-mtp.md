# mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP

## Resumen
El Prompt Resampler 9B SFT Alpha 8K MTP es un ajuste fino supervisado (SFT) del modelo Qwen3.5-9B orientado a una tarea muy concreta: el remuestreo de prompts (prompt resampling). Esta tecnica de aumento de datos genera variaciones de un enunciado conservando su tarea original, modificando variables como nombres, cifras, lugares o escenarios. El modelo lo publica el usuario independiente mithulaartigala bajo licencia Apache 2.0 y esta pensado para pipelines de sintesis de datos y evaluacion.

Se trata de un modelo denso de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) construido sobre la arquitectura Qwen3.5, con una ventana de entrenamiento de 8192 tokens y ajuste mediante LoRA de rango 32 y alpha 64. El repositorio incluye ademas una cabeza MTP (multi-token prediction) entrenada durante una epoca con el modelo base congelado, con perdida en validacion de 0,607 con thinking activado y 0,686 con thinking desactivado.

Su relevancia es acotada pero clara: resuelve el cuello de botella de generar datasets sinteticos variados y realistas a partir de prompts existentes, reduciendo el consumo de tokens de razonamiento frente a alternativas genericas y preservando el formato de chat nativo de Qwen3.5. Es una version Alpha, con comportamiento irregular en prompts largos o con estructuras no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, con cabeza MTP adicional |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento; el despliegue de referencia usa `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors de precision original) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B en su variante instruct y conserva la arquitectura transformer densa del original, junto con su formato de chat nativo. El ajuste se realizo con LoRA de rango 32 y alpha 64 sobre secuencias de 8192 tokens, empleando Unsloth Studio como herramienta de entrenamiento. El dataset utilizado es `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una mezcla de ejemplos de estilo Alpaca y problemas de GSM8K reformulados para la tarea de remuestreo. El objetivo declarado del ajuste es aumentar la fiabilidad del remuestreo de prompts no JSON y reducir el numero de tokens dedicados al razonamiento.

Una innovacion destacable es la incorporacion de una cabeza MTP (multi-token prediction) entrenada durante una epoca adicional con el modelo de 9B congelado, sobre el mismo dataset, misma ventana de 8192 tokens y misma configuracion LoRA (rango 32, alpha 64). La perdida de validacion de la cabeza MTP fue de 0,607 con thinking activado y 0,686 con thinking desactivado. El modelo soporta ademas un modo de razonamiento hibrido (etiquetas `reasoning` y `hybrid-reasoning`) que permite alternar entre generacion con y sin cadena de pensamiento.

## Capacidades
- Remuestreo de prompts: genera variaciones de un enunciado preservando la tarea y el tipo de tarea, alterando variables como nombres, cifras, lugares y escenarios de forma coherente con el contexto.
- Razonamiento hibrido: soporta modo con thinking y sin thinking, lo que permite priorizar calidad o ahorro de tokens.
- Razonamiento matematico: el dataset de entrenamiento incluye GSM8K, por lo que el modelo conserva capacidad para problemas aritmeticos de varios pasos.
- Generacion de texto conversacional con el formato de chat nativo de Qwen3.5, invocable mediante `apply_chat_template`.
- Prediccion multi-token mediante la cabeza MTP incluida en el repositorio.
- Capacidad multimodal heredada del pipeline `image-text-to-text` del modelo base (carga mediante `AutoModelForImageTextToText`); no se documenta entrenamiento especifico de vision en este ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso
- Aumento de datos para entrenamiento: dado un conjunto de prompts semilla, el modelo genera variantes que amplian la diversidad del dataset sin cambiar la tarea subyacente, lo que resulta util para fine-tuning y evaluacion de modelos en dominios con pocos ejemplos.
- Generacion de examenes y problemas sinteticos: a partir de un problema aritmetico original, produce versiones con nuevas cifras y contextos, manteniendo la estructura de resolucion; encaja con su entrenamiento sobre GSM8K.
- Evaluacion de robustez de LLM: se generan resamples de un mismo prompt para comprobar si un modelo evaluado responde de forma consistente ante cambios superficiales de nombres, cifras o escenario.
- Creacion de datasets de instrucciones en ingles: el modelo reformula instrucciones de estilo Alpaca en variantes equivalentes, util para aumentar la cobertura de tareas en corpus de instrucciones.
- Pruebas de regresion de pipelines de datos: al integrarse via API compatible con OpenAI en vLLM o Unsloth Studio, puede ejecutarse por lotes para validar que un pipeline de sintesis produce salidas coherentes antes de desplegarlo.
- Generacion de casos de prueba para evaluacion de sesgos: al variar nombres y escenarios de un prompt, permite construir conjuntos controlados para medir si un modelo cambia su respuesta en funcion de atributos como el nombre o el contexto cultural.
- Prototipado de aumentacion en investigacion: con licencia Apache 2.0 y pesos en safetensors, puede incorporarse a notebooks de investigacion sin restricciones de uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es la perdida de validacion de la cabeza MTP: 0,607 con thinking activado y 0,686 con thinking desactivado.

## Requisitos de hardware
- VRAM estimada para inferencia: con 9,65 mil millones de parametros en safetensors de precision original, se necesitan aproximadamente 19,3 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 24 GB en BF16/FP16 y en torno a 6-8 GB con cuantizacion de 4 bits (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en precision completa con contexto de 8192 tokens; RTX 4090 (24 GB) es suficiente para BF16 con contexto reducido o para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 16 GB o mas si se aplica cuantizacion.
- Opciones de despliegue: vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio con servidor compatible con la API de OpenAI en el puerto 8888, y Hugging Face Transformers con `AutoModelForImageTextToText` y `device_map="auto"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-9B-SFT-Alpha-8K-MTP | 9,65 B | 8192 | Remuestreo de prompts | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9 B | no disponible | Generacion general | no disponible | Hugging Face |
| Prompt Resampler Mini (2B) | 2 B | no disponible | Remuestreo de prompts | no disponible | Hugging Face, del mismo autor |

El modelo base Qwen3.5-9B sirve como referencia de partida: el ajuste especializa su comportamiento en remuestreo a costa de un rendimiento potencialmente menor en tareas generales no relacionadas. La version Mini de 2B del mismo autor existe como alternativa mas ligera, aunque el autor indica que la version de 9B rinde significativamente mejor. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con otros modelos de aumento de datos.

## Limitaciones y advertencias
- Es una version Alpha: el autor advierte explicitamente de que ciertos comportamientos pueden no cumplir las expectativas.
- Rendimiento irregular en prompts con estructuras no vistas durante el entrenamiento y en prompts largos en general.
- Idiomas: solo se declara soporte de ingles; el comportamiento en castellano no esta validado.
- Ventana de contexto limitada a 8192 tokens, lo que restringe el remuestreo de prompts extensos.
- Riesgo de escenarios poco realistas: el autor recomienda anadir una instruccion adicional al system prompt para corregir la generacion de escenarios inverosimiles.
- Riesgo de alucinacion: al ser un modelo generativo ajustado para reescribir, puede introducir cambios que alteren sutilmente la tarea original o inventar restricciones no presentes en el prompt de entrada.
- Dependencia de un system prompt especifico: el repositorio proporciona `default_system_prompt.md`, y el modelo esta entrenado para usarlo; omitirlo puede degradar la calidad del remuestreo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la calidad de las salidas en produccion.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP/blob/main/default_system_prompt.md
- vLLM: https://github.com/vllm-project/vllm
- Unsloth: https://github.com/unslothai/unsloth
