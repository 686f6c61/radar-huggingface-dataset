# prithivMLmods/ProactiveMobile-Qwen2.5-VL-7B-GGUF

## Resumen

ProactiveMobile-Qwen2.5-VL-7B-GGUF es una cuantización en formato GGUF del modelo ProactiveMobile Agent, un asistente móvil proactivo multimodal de 7B parámetros desarrollado por Xiaomi Research, presentado en CVPR 2026. El modelo base está fine-tuned a partir de Qwen2.5-VL-7B-Instruct sobre el dataset ProactiveMobile, de lengua china. Su problema de referencia es el de los asistentes móviles proactivos: dado el contexto del usuario y capturas de pantalla de la interfaz gráfica (GUI) o trazas de acciones en texto, el modelo decide si intervenir con una recomendación o permanecer en silencio, generando razonamiento estructurado, recomendaciones y llamadas a funciones.

La relevancia del modelo radica en que aborda un problema poco resuelto en agentes móviles: no solo ejecutar órdenes, sino saber cuándo actuar. En un benchmark de 3.658 instancias alcanza un 49,29 % de Type-Acc, un 53,83 % de F1 y una tasa de disparos falsos (FTR) del 8,86 %, con resultados notablemente mejores sobre trazas textuales (64,04 % Type-Acc, 1,31 % FTR) que sobre capturas de GUI (34,57 % Type-Acc, 24,37 % FTR). Esta versión GGUF, publicada por prithivMLmods, permite ejecutar el modelo localmente con llama.cpp y herramientas derivadas, con cuantizaciones desde 3,81 GB (Q3_K_M) hasta 15,2 GB (BF16), e incluye el archivo de proyección multimodal (mmproj) necesario para procesar imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M (más mmproj en BF16) |
| Idiomas soportados | Inglés (según la ficha; el dataset de fine-tuning original es de lengua china) |
| Licencia | Apache-2.0 (pesos); el dataset ProactiveMobile es CC BY-NC-SA 4.0 (no comercial) |
| Formato de pesos | GGUF (con archivo de proyección multimodal mmproj en BF16); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, una arquitectura transformer multimodal visión-lenguaje que combina un LLM de 7B con un codificador visual conectado mediante un proyector (el archivo mmproj-bf16 de 1,36 GB de esta cuantización). Xiaomi Research lo ajustó sobre el dataset ProactiveMobile, centrado en lengua china y compuesto por contexto de usuario junto con capturas de pantalla de GUI o trazas de acciones textuales. La tarea de entrenamiento es de decisión proactiva: clasificar entre intervenir o no intervenir y, en caso positivo, producir razonamiento estructurado, una recomendación y llamadas a funciones (function calling).

La innovación técnica principal es el enfoque de agente proactivo frente al de agente reactivo tradicional: el modelo aprende a estimar el momento adecuado para asistir al usuario sin que este lo solicite, minimizando las interrupciones innecesarias (de ahí la métrica False Trigger Rate). No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Decisión proactiva de intervención: predice si debe actuar o permanecer en silencio ante un contexto de usuario determinado.
- Comprensión de interfaces móviles: procesa capturas de pantalla de GUI (capacidad heredada de Qwen2.5-VL) para analizar el estado de la interfaz.
- Procesamiento de trazas de acciones textuales: alternativa a las capturas de pantalla con rendimiento claramente superior (64,04 % Type-Acc frente a 34,57 %).
- Generación de razonamiento estructurado antes de emitir recomendaciones.
- Function calling: produce llamadas a funciones estructuradas para ejecutar acciones en el dispositivo.
- Pipeline image-text-to-text: acepta entradas de imagen y texto y genera texto.
- Ejecución local mediante llama.cpp gracias al formato GGUF, con soporte de inferencia en CPU y GPU.
- Etiquetado como agente y conversacional, apto para flujos multi-paso de asistente.

## Casos de uso

- Asistente móvil proactivo en dispositivos locales: el modelo observa el contexto y las capturas de pantalla del teléfono y decide cuándo sugerir una acción (por ejemplo, recordar una respuesta pendiente), ejecutándose íntegramente en local gracias a GGUF, lo que preserva la privacidad del usuario.
- Automatización de tareas móviles con function calling: integrado en un framework de agentes móviles, puede emitir llamadas a funciones para abrir aplicaciones, rellenar formularios o enviar mensajes cuando detecta que es pertinente.
- Análisis de trazas de interacción en telemetría: dado que las trazas textuales rinden mejor (64,04 % Type-Acc), es adecuado para analizar logs de acciones de usuario y recomendar el siguiente paso útil.
- Prototipado de agentes GUI con hardware modesto: con la cuantización Q4_K_M (4,68 GB) cabe en portátiles y mini-PCs, permitiendo iterar rápido en investigación de agentes móviles sin necesidad de GPU de datacenter.
- Sistemas de asistencia con control de interrupciones: la métrica FTR del 8,86 % (1,31 % sobre trazas textuales) lo hace apropiado para productos donde las notificaciones falsas degradan la experiencia, como asistentes de accesibilidad.
- Evaluación comparativa de modelos de agente proactivo: sirve como baseline cuantizado reproducible en benchmarks de intervención proactiva sobre GUI móviles.
- Chat multimodal local con visión: al heredar Qwen2.5-VL, puede usarse como VLM generalista de 7B en aplicaciones conversacionales con imágenes, aunque su fine-tuning está orientado al dominio de agentes móviles.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre un benchmark de 3.658 instancias:

| Metrica | Valor global | Nivel L1 | Nivel L2 | Nivel L3 |
|---|---|---|---|---|
| Type-Acc | 49,29 % | 72,41 % | 57,93 % | 38,99 % |
| Precision | 54,23 % | no disponible | no disponible | no disponible |
| Recall | 54,19 % | no disponible | no disponible | no disponible |
| F1 | 53,83 % | 75,16 % | 63,10 % | 43,45 % |
| False Trigger Rate (FTR) | 8,86 % | no disponible | no disponible | no disponible |

Rendimiento según tipo de traza de entrada:

| Tipo de traza | Type-Acc | F1 | FTR |
|---|---|---|---|
| Textual | 64,04 % | 65,46 % | 1,31 % |
| GUI (capturas) | 34,57 % | 42,23 % | 24,37 % |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (tamaño de archivo + overhead de contexto y KV cache):
  - Q3_K_M: 3,81 GB — viable en equipos con 8 GB de RAM o GPU de 6 GB.
  - Q4_K_M (recomendada): 4,68 GB — cabe en GPUs de 6-8 GB.
  - Q5_K_M: 5,44 GB; Q6_K: 6,25 GB — GPUs de 8 GB.
  - Q8_0: 8,1 GB — GPUs de 10-12 GB.
  - BF16: 15,2 GB — GPUs de 16-24 GB.
  - A todo ello hay que sumar el mmproj-bf16 (1,36 GB) para uso multimodal.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para cuantizaciones medias-altas; RTX 4090 (24 GB) para BF16 completo. En CPU, cualquier procesador moderno con 8-16 GB de RAM para Q3/Q4.
- Consumer GPUs: sí, la mayoría de cuantizaciones caben en GPUs de consumo; Q4_K_M funciona incluso en portátiles con GPU de 6 GB.
- Opciones de despliegue: llama.cpp (referencia del propio repo), llama-cpp-python, Ollama y LM Studio (formato GGUF); el modelo base también soporta Hugging Face Transformers con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`, y text-generation-inference.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ProactiveMobile-Qwen2.5-VL-7B (base) | 7,6B | Imagen + texto | Agente móvil proactivo (decidir cuándo intervenir) | Apache-2.0 | safetensors |
| Qwen2.5-VL-7B-Instruct | 7,6B | Imagen + texto | VLM generalista (OCR, GUI, video) | Apache-2.0 | safetensors, GGUF comunitarios |
| CogAgent / modelos de agente GUI de tamaño similar | ~7-18B | Imagen + texto | Agentes GUI reactivos (ejecutan órdenes del usuario) | Variable según modelo | Variable |

La diferencia clave frente a Qwen2.5-VL-7B-Instruct es la especialización: ProactiveMobile añade la capacidad de decisión proactiva (intervenir o callar) entrenada específicamente para asistentes móviles, a costa de rendimiento en tareas generalistas. Frente a los agentes GUI reactivos típicos, ProactiveMobile se centra en la iniciativa del asistente y en minimizar disparos falsos, una métrica que la mayoría de agentes GUI ni siquiera reporta. No hay alternativas publicadas con exactamente el mismo enfoque proactivo y tamaño comparable en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento limitado sobre capturas de GUI: solo 34,57 % de Type-Acc y 24,37 % de FTR con trazas visuales, frente a 64,04 % y 1,31 % con trazas textuales; para producción con entrada visual conviene evaluar cuidadosamente o preferir entradas textuales.
- Degradación significativa con la dificultad: en el nivel L3 el F1 cae a 43,45 %, por lo que los escenarios complejos requerirán validación adicional.
- Idioma: el dataset de fine-tuning es de lengua china y la ficha declara inglés; el rendimiento en castellano no está documentado y debe asumirse como no verificado.
- Restricción de licencia indirecta: aunque los pesos son Apache-2.0 (uso comercial permitido), el dataset ProactiveMobile es CC BY-NC-SA 4.0; los modelos derivados entrenados sobre ese dataset pueden heredar restricciones no comerciales según la jurisdicción y la interpretación aplicable.
- Riesgo de alucinación: no documentado específicamente; al tratarse de un fine-tuning de 7B sobre una tarea de decisión, los disparos falsos (FTR) son el riesgo medible principal.
- Contexto: la longitud de ventana no está especificada en la ficha de esta cuantización; consultar la documentación de Qwen2.5-VL-7B-Instruct para el valor base.
- Repositorio de terceros: esta versión GGUF la mantiene prithivMLmods (324 descargas, 1 like en el momento de la ficha), no Xiaomi Research; verificar la integridad de los archivos antes de uso en producción.
- Sesgos: no se han documentado sesgos específicos en la informacion disponible; el dominio del dataset (móvil, chino) implica sesgo hacia ese contexto de uso.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/prithivMLmods/ProactiveMobile-Qwen2.5-VL-7B-GGUF
- Modelo base (Xiaomi Research): https://huggingface.co/xiaomi-research/ProactiveMobile-Qwen2.5-VL-7B
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
