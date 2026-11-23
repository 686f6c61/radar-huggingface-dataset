# experimentalmachines/LFM3-VL-2B-MobileAgent-v2

## Resumen

LFM3-VL-2B-MobileAgent-v2 es un ajuste fino (LoRA SFT fusionado) del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines, orientado a la operación de teléfonos Android mediante capturas de pantalla. El modelo recibe un objetivo en lenguaje natural, el historial de los últimos 8 pasos y una captura de pantalla, y emite una intención corta seguida de una única acción en JSON con coordenadas normalizadas en una rejilla de 0 a 1000. Resuelve el problema de la automatización de interfaces móviles (GUI agents) sin APIs internas de la aplicación.

La arquitectura es la del modelo base (transformer multimodal con torre de visión y modelo de lenguaje), con 1.918.181.888 parámetros totales (~1,92 mil millones) y pesos en safetensors. El ajuste se aplicó únicamente sobre el modelo de lenguaje con LoRA de rango 64 y alpha 128, manteniendo congelada la torre de visión, y los adaptadores se fusionaron en los pesos finales (el adaptador original queda en `lora_adapter/`).

Es relevante ahora como caso de estudio negativo: el autor marca explícitamente el modelo como **superseded; do not use**. Aunque mejora notablemente en los splits offline nuevos (GUI-Odyssey, AMEX, ScreenQA), colapsa en el benchmark online AndroidWorld, pasando de 15/116 tareas en v1 a 3/116 en v2. La causa sospechada es que 8.739 filas de entrenamiento tenían la intención en blanco, lo que degradó la coherencia del razonamiento previo a la acción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión), ajuste LoRA fusionado sobre LiquidAI/LFM3-VL-2B |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 4 bits disponible en el repo `LFM3-VL-2B-MobileAgent-v2-GGUF`; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (repo de 4,1 GB), adaptador LoRA en `lora_adapter/`, GGUF 4 bits en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo image-text-to-text con torre de visión y modelo de lenguaje. El ajuste se realizó con LoRA de rango 64 y alpha 128 aplicado solo al modelo de lenguaje, con la torre de visión congelada, y posteriormente se fusionó en los pesos. El entrenamiento consistió en 1.250 pasos con batches de 32 filas y tasa de aprendizaje 2e-4, ejecutado en una GPU de Colab. Los datos provienen del dataset `experimentalmachines/MobileAgent-SFT-v2` (revisión `42f7f763`), compuesto por 55.936 filas de AndroidControl, 9.979 de GUI-Odyssey, 7.072 de AMEX y 5.995 de ScreenQA.

La innovación principal es el formato de interacción: una captura de pantalla redimensionada a un máximo de 880 × 880 píxeles de área (unos 720 tokens de imagen), un texto de usuario con `Goal:`, `Previous steps:` (últimos 8 pasos como `n. <intent> -> <action JSON>`) y `What is the next action?`, y una salida con `<think>intención corta</think>` seguida de una acción JSON compacta. La decodificación se hace con thinking activado y temperatura 0. El fallo conocido del entrenamiento es que 8.739 filas tenían la intención en blanco, lo que afectó al 30,4 % de los pasos en AndroidWorld y se asocia al colapso online; forzar una intención de una línea en inferencia recuperó parcialmente el rendimiento (6/116).

## Capacidades

- Generación de acciones de interfaz móvil Android a partir de capturas de pantalla: click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status.
- Razonamiento breve previo a la acción mediante el bloque `<think>`, con intención en una línea.
- Respuesta a preguntas sobre el contenido de la pantalla mediante la acción `answer`.
- Finalización de tareas con estados `complete` o `infeasible` mediante la acción `status`.
- Coordenadas normalizadas en rejilla 0-1000, independientes de la resolución de la captura.
- Comprensión de imagen y texto (image-text-to-text) dentro del pipeline multimodal del modelo base.
- Seguimiento de historial de hasta 8 pasos previos en formato textual.
- Capacidades multilingües: solo inglés.
- No se documenta soporte de tool calling genérico, function calling fuera del esquema de acciones, ni modo audio.

## Casos de uso

- Investigación en agentes GUI: reproducir experimentos de AndroidWorld y comparar recetas de SFT con el modelo base; el propio autor publica el arnés de evaluación en el repositorio del proyecto.
- Automatización de pruebas de aplicaciones Android: generar secuencias de acciones a partir de capturas para pruebas de regresión de UI en entornos controlados y emuladores.
- Extracción de información de pantallas: usar la acción `answer` para responder preguntas sobre el contenido visible, útil en pipelines de ScreenQA.
- Análisis de recetas de datos: estudiar el efecto de mezclar AndroidControl, GUI-Odyssey, AMEX y ScreenQA en el rendimiento offline frente al online, como hace la model card.
- Prototipado de asistentes de accesibilidad en emulador: proponer la siguiente acción dado un objetivo y una captura, siempre con supervisión humana y sin cuentas reales.
- Evaluación de robustez de agentes móviles: medir la degradación por intenciones vacías en el entrenamiento y validar la corrección aplicada en la versión v3.
- Generación de datos sintéticos de trayectorias: usar las salidas JSON como plantillas para construir datasets de pasos etiquetados en laboratorio.

## Benchmarks y rendimiento

| Benchmark | v2 | v1 |
|---|---|---|
| AndroidWorld seed 30 (116 tareas, development) | 3 | 15 |
| AndroidControl test, precisión de paso high-level / low-level | 0,716 / 0,893 | 0,715 / 0,948 |
| Precisión terminal `complete` | 0,732 | 0,792 |
| Splits dev: respuestas GUI-Odyssey / AMEX / ScreenQA | 0,644 / 0,735 / 0,764 | 0,269 / 0,306 / 0,000 |
| MMStar / MMLU | 54,6 % / 50,9 % | 57,1 % / 49,5 % |

El análisis del autor indica que las tareas resueltas solo por v1 son 11, las resueltas solo por v2 son 0 (p = 0,001). Forzar una intención de una línea en inferencia elevó AndroidWorld a 6/116 (+3 / −0, p = 0,25).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~1,92 B parámetros, en FP16 requiere aproximadamente 3,8 GB solo de pesos, y en GGUF de 4 bits alrededor de 1-1,5 GB de pesos, más el coste de la torre de visión y la caché de tokens de imagen (~720 tokens por captura).
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento se realizó en una GPU de Colab, lo que sugiere que el ajuste LoRA cabe en GPUs de consumo.
- GPU de consumo: muy probablemente cabe en GPUs consumer con 8 GB o más en cuantización de 4 bits, aunque no hay cifras oficiales publicadas.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), GGUF de 4 bits para llama.cpp u Ollama; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v2 | ~1,92 B | no disponible | AndroidWorld 3/116; AndroidControl 0,716/0,893 | LFM Open License v1.0 | Hugging Face, safetensors y GGUF 4 bits |
| LFM3-VL-2B-MobileAgent-v1 (mismo autor) | ~1,92 B (base) | no disponible | AndroidWorld 15/116; AndroidControl 0,715/0,948 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-VL-2B (base) | ~1,92 B | no disponible | no disponible en esta información | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de otros modelos de agentes móviles en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como **superseded; do not use** por el propio autor: colapsa en AndroidWorld (3/116) frente a v1 (15/116).
- Modelo de investigación: no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en inglés y una captura por paso; no hay memoria más allá del historial textual de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento.
- Riesgo de alucinación en la intención y en las coordenadas, agravado por las filas con intención vacía en el dataset (8.739 filas).
- Licencia LFM Open License v1.0: revisar los términos para uso comercial antes de desplegar; es una licencia "other", no estándar.
- No se documentan sesgos específicos ni evaluaciones de seguridad; aplican los del modelo base.
- Restricciones de contexto no documentadas; el rendimiento con capturas de alta resolución fuera del rango 880 × 880 no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v2
- Versión GGUF 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
