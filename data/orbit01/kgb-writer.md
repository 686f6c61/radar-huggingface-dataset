# orbit01/kgb-writer

## Resumen

kgb-writer es un adaptador LoRA en coreano desarrollado por el usuario orbit01 para el servicio de guías de viaje KGB (kguidebook.site). Se construye sobre el modelo instructivo `kakaocorp/kanana-1.5-8b-instruct-2505`, que se mantiene congelado, y solo se entrenan los pesos del adaptador mediante SFT (supervised fine-tuning). Su función es concreta: recibe condiciones de viaje, un itinerario ya cerrado y resúmenes de cada lugar, y genera únicamente el texto de la guía en formato JSON (título, introducción, resumen diario y motivos de recomendación por lugar).

El objetivo declarado es sustituir a Claude Sonnet en producción reduciendo el coste a un 7-25 % del original manteniendo una calidad cercana al 84 % según una evaluación con juez GPT. No es un modelo generalista: está especializado en un formato de entrada y salida muy acotado y no modifica el itinerario, solo redacta la justificación de cada parada.

El repositorio ocupa 0,5 GB y contiene exclusivamente los pesos del adaptador (41,9 M de parámetros entrenables, el 0,52 % del total). La relevancia actual reside en su enfoque de destilación desde un modelo mayor (Qwen3-32B-AWQ) combinado con filtros de reglas, y en la documentación detallada de su despliegue con vLLM en RunPod Serverless.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Kanana-1.5-8B) con adaptador LoRA |
| Parámetros totales | No disponible (base de 8B; adaptador de 41,9 M entrenables, 0,52 %) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite las cuantizaciones estándar (bf16 en entrenamiento) |
| Idiomas soportados | Coreano (ko) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a todas las capas lineales del modelo base Kanana-1.5-8B-Instruct. El entrenamiento se realizó en bf16 con el `Trainer` de transformers y la librería PEFT, calculando la pérdida únicamente sobre la parte de la respuesta (loss enmascarada en el prompt). Se ejecutaron 2 épocas con learning rate 1e-4 (cosine, warmup del 3 %), batch efectivo de 8 y 552 pasos sobre una A100.

Los datos de entrenamiento se generaron por destilación desde un profesor `Qwen3-32B-AWQ` y se filtraron con un verificador de reglas: 2.206 pares de entrenamiento, 171 de validación y 200 de test separados; se descartaron 423 pares que no pasaron el filtro. La versión v7 incorpora el resumen del lugar (overview) en la entrada, lo que aumentó la longitud y concreción de las salidas. Las entradas de resumen se normalizan (espacios colapsados, primeros 200 caracteres, corte en el último punto tras el carácter 100) para replicar el preprocesado del entrenamiento.

## Capacidades

- Generación de texto estructurado en JSON con campos fijos: título, introducción, resumen diario y motivos de recomendación por lugar.
- Redacción de justificaciones ("por qué aquí") a partir de un itinerario predefinido, sin alterar fechas, orden ni horarios.
- Condicionamiento por preferencias del viajero (región, fechas, acompañantes, gustos) y por resúmenes de cada lugar.
- Generación en coreano exclusivamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Redacción automática de guías de viaje en el servicio KGB: el modelo recibe las condiciones del viaje y el itinerario cerrado y devuelve el JSON con los textos de la guía, sustituyendo a Claude Sonnet en la franja horaria de 13:00 a 17:00 con un coste del 7-25 %.
- Generación de contenido editorial a escala para agencias de viaje: con 189 peticiones por hora a concurrencia 5 en una L4, permite producir guías personalizadas de forma masiva sin coste por token de un modelo propietario.
- Sustitución parcial de un LLM propietario en producción: el patrón de mantener el modelo base congelado y desplegar el adaptador con `--enable-lora` en vLLM permite alternar entre modelos por franja horaria o carga.
- Prototipado de asistentes de viaje con formato de salida estricto: la salida JSON facilita su integración directa en un backend sin postprocesado complejo.
- Personalización de guías por perfil de viajero: el condicionamiento por acompañantes y preferencias permite generar variantes del mismo itinerario para distintos perfiles.
- Base para fine-tuning adicional en otros dominios turísticos: al ser un adaptador LoRA sobre un modelo Apache 2.0, sirve como punto de partida para adaptar el mismo pipeline de destilación a otros idiomas o formatos, siempre que se reentrene el adaptador.

## Benchmarks y rendimiento

Evaluación automática por reglas sobre 200 casos de test: 44 aciertos (22 %) antes del entrenamiento frente a 162 (81 %) en v7. La versión v6-B alcanzó 183 (91,5 %), pero v7 genera textos más largos y concretos y por ello incurre más en repeticiones de plantilla y menciones de distancias.

Comparación ciega de calidad con juez GPT sobre 50 casos de test (escala 1-5), con verificación de consistencia en 10 pares con orden A/B invertido (10/10 coincidentes):

| Criterio | v7 / Sonnet (misma entrada) |
|---|---:|
| Hechos | 95 % |
| Ajuste a la entrada | 88 % |
| Concreción | 84 % |
| Naturalidad | 79 % |
| Repetición | 70 % |
| Media | 84 % (74 % antes del entrenamiento) |

El efecto del resumen de lugar (overview) elevó la puntuación de concreción de 1,80 a 3,96 (2,2x) respecto a v6-B, con una ratio global del 118 % frente a esa versión.

Rendimiento de servicio medido en vLLM sobre RunPod L4, sin errores:

| Peticiones concurrentes | TTFT | Peticiones/hora | Coste frente a Sonnet |
|---:|---:|---:|---:|
| 1 | 1,94 s | 55 | 25 % |
| 3 | 2,23 s | 141 | 10 % |
| 5 | 2,45 s | 189 | 7 % |

## Requisitos de hardware

- El adaptador en sí ocupa 0,5 GB; requiere cargar el modelo base Kanana-1.5-8B, por lo que la VRAM necesaria es la del base según cuantización (no se especifica en la información disponible).
- Entrenamiento realizado en A100 en bf16; inferencia medida en NVIDIA L4 en RunPod Serverless.
- No se documenta si cabe en GPU de consumo; por tamaño del base (8B) es plausible en GPUs de 16-24 GB con cuantización, pero no hay dato confirmado.
- Despliegue recomendado: vLLM con `--enable-lora --max-lora-rank 16 --lora-modules writer=orbit01/kgb-writer-v7`, invocando con `model="writer"`.
- Latencia: TTFT de 1,94 s a 2,45 s según concurrencia; el tiempo total de respuesta es aproximadamente 4 veces mayor que Sonnet (salida de unas 950 tokens en L4).
- Throughput: 55 a 189 peticiones por hora según concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kgb-writer (este) | Adaptador 41,9 M sobre base 8B | No disponible | Guías de viaje en coreano, salida JSON | Apache 2.0 | Hugging Face, 31 descargas |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | No disponible | Instructivo general coreano | No disponible en la información | Hugging Face (base) |
| Claude Sonnet | No disponible | No disponible | Generalista propietario | Propietaria | API comercial |

Frente a Claude Sonnet, el modelo ofrece un coste del 7-25 % con una calidad media del 84 % en la misma entrada, a cambio de una latencia total unas 4 veces mayor y de estar limitado al coreano y al formato KGB. Frente a su modelo base, la diferencia es la especialización en el formato de salida y la mejora de ajuste (84 % frente a 74 % de calidad media antes del entrenamiento).

## Limitaciones y advertencias

- Modelo exclusivamente en coreano; no soporta otros idiomas.
- Entrenado para un formato de entrada concreto (condiciones, itinerario y resúmenes de lugar); fuera de ese formato el comportamiento no está garantizado.
- Persisten repeticiones de plantilla y menciones innecesarias a distancias y tiempos de desplazamiento, lo que penaliza el criterio de repetición (70 % frente a Sonnet).
- La latencia total es aproximadamente 4 veces mayor que la de Sonnet, con salidas de unas 950 tokens.
- Riesgo de alucinación en datos factuales: aunque la puntuación de hechos es del 95 % frente a Sonnet, no es un sistema verificable y puede introducir afirmaciones no respaldadas por la entrada.
- La evaluación de calidad se basa en un juez GPT sobre 50 casos, una muestra pequeña y con posible sesgo del evaluador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Kanana-1.5-8B debe verificarse por separado en cuanto a sus propios términos.
- El repositorio tiene 31 descargas y 1 like: es un proyecto de nicho con poca validación externa.
- El preprocesado de los resúmenes (truncado a 200 caracteres con corte en el último punto) debe replicarse exactamente para mantener la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orbit01/kgb-writer
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Servicio KGB: https://kguidebook.site/
- Código de entrenamiento y evaluación: https://github.com/100-hours-a-week/KTB4-10th-AI (carpeta `model/`)
