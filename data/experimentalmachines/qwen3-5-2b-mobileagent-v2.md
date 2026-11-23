# experimentalmachines/Qwen3.5-2B-MobileAgent-v2

## Resumen

Qwen3.5-2B-MobileAgent-v2 es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3.5-2B, desarrollado por el usuario experimentalmachines, orientado a la actuación autónoma sobre interfaces de Android (GUI agents). El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y devuelve una única acción siguiente en formato JSON (clic, scroll, entrada de texto, navegación, etc.), lo que lo convierte en un componente de control para agentes móviles.

Se trata de un modelo de comparación, no de la línea principal del proyecto: fue entrenado con la misma receta y datos que LFM3-VL-2B-MobileAgent-v2 para medir el efecto del modelo base. El ajuste se realizó mediante LoRA SFT (rank 64, alpha 128) sobre el modelo de lenguaje, con la torre de visión congelada, y los pesos resultantes se fusionaron en el checkpoint final (el adaptador se conserva en `lora_adapter/`).

Con 2.213.241.664 parámetros totales y licencia Apache-2.0, su relevancia radica en que demuestra que un modelo de 2B puede alcanzar precisiones de paso de ~0,74 (high-level) y ~0,91 (low-level) en AndroidControl, compitiendo con alternativas del mismo tamaño. No obstante, el propio autor advierte que la mezcla de datos v2 rompió el bucle agéntico en AndroidWorld, por lo que el modelo es estrictamente offline y de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-2B, con torre de visión congelada durante el ajuste |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de texto limitado a los últimos 8 pasos; una captura por paso, ~720 tokens de imagen) |
| Tipos de cuantización | 4-bit GGUF (variante publicada como Qwen3.5-2B-MobileAgent-v2-GGUF); otros formatos no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (transformers); GGUF en el repo derivado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal que procesa una captura de pantalla por paso (redimensionada a un máximo de 880 × 880 píxeles de área, aproximadamente 720 tokens de imagen) junto con texto en inglés que incluye el objetivo (`Goal: …`), los últimos 8 pasos (`Previous steps:`) y la pregunta `What is the next action?`. La salida es un bloque `<think>short intent</think>` seguido de una única acción JSON compacta, con coordenadas enteras normalizadas en una rejilla de 0–1000. La decodificación se realiza con el modo de pensamiento activado y temperatura 0.

El ajuste consistió en LoRA SFT (rank 64, alpha 128) aplicado únicamente al modelo de lenguaje, manteniendo congelada la torre de visión. Se entrenó durante 1.250 pasos con batches de 32 filas y una tasa de aprendizaje de 2e-4, sobre el dataset MobileAgent-SFT-v2 (commit `42f7f763`), compuesto por 78.982 filas procedentes de AndroidControl, GUI-Odyssey, AMEX y ScreenQA. Los adaptadores se fusionaron en los pesos finales y se conservan aparte en `lora_adapter/`. El modelo fue entrenado exclusivamente con demostraciones grabadas y nunca interactuó con un teléfono real durante el entrenamiento.

## Capacidades

- Generación de acciones de agente móvil: clic, pulsación larga, entrada de texto, scroll direccional, apertura de apps, navegación atrás/inicio, tecla enter, espera, respuesta a preguntas sobre la pantalla y finalización de tarea (completa o infactible).
- Comprensión de capturas de pantalla de Android (image-text-to-text) con una imagen por paso.
- Razonamiento breve explícito mediante el bloque `<think>`, que emite una intención corta antes de la acción.
- Salida estructurada en JSON con coordenadas normalizadas en rejilla 0–1000, adecuada para parseo programático.
- Seguimiento de historial de los últimos 8 pasos en formato `n. <intent> -> <action JSON>`.
- Respuesta a preguntas sobre el contenido de la pantalla mediante la acción `answer`.
- Capacidades multilingües: únicamente inglés.
- No dispone de soporte documentado de tool calling genérico ni de visión más allá de la captura de pantalla.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede generar secuencias de acciones a partir de capturas para validar flujos de aplicación en entornos de CI, usando la salida JSON directamente como script de pasos.
- Agente de accesibilidad para navegación guiada: dado un objetivo en inglés, el modelo propone la siguiente acción sobre la pantalla, útil en prototipos de asistencia paso a paso con supervisión humana.
- Investigación en GUI agents: sirve como baseline de 2B para comparar recetas de datos y modelos base, tal como lo plantea el autor al enfrentarlo a LFM3-VL-2B v2.
- Extracción de intenciones desde pantallas: la acción `answer` permite responder preguntas sobre el contenido visible, aprovechable en pipelines de anotación o QA de interfaces.
- Generación de datos sintéticos de interacción: las trazas `intent -> action JSON` pueden emplearse para aumentar datasets de entrenamiento de agentes móviles.
- Evaluación offline de políticas de control: con temperatura 0 y formato fijo, es adecuado para medir precisión de paso (high-level y low-level) sobre AndroidControl y otros splits de desarrollo.
- Prototipado de automatización de tareas repetitivas en apps: apertura de apps, entrada de texto y scroll encadenados, siempre en entornos controlados y sin cuentas reales.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-2B v2 | LFM3-VL-2B v2 |
|---|---|---|
| AndroidControl test, precisión de paso high-level | 0.739 | 0.716 |
| AndroidControl test, precisión de paso low-level | 0.907 | 0.893 |
| Terminal `complete` accuracy | 0.750 | 0.732 |
| Dev split GUI-Odyssey (respuestas) | 0.724 | 0.644 |
| Dev split AMEX (respuestas) | 0.739 | 0.735 |
| Dev split ScreenQA (respuestas) | 0.756 | 0.764 |
| MMStar | 54,0 % | 54,6 % |
| MMLU | 56,0 % | 50,9 % |

Evaluación exclusivamente offline; el modelo no se ejecutó en AndroidWorld porque la mezcla de datos v2 rompió el bucle agéntico (LFM3 v2 obtuvo 3/116 en AndroidWorld).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,21B parámetros, en FP16 requiere aproximadamente 4,4 GB solo para pesos, y en 4-bit GGUF alrededor de 1,2–1,5 GB, más el coste de la torre de visión y los ~720 tokens de imagen por paso.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo con suficiente VRAM, aunque el dato no está confirmado por el autor.
- Cabe en GPU de consumo: probable por el tamaño del modelo, pero no confirmado en la documentación.
- Opciones de despliegue: transformers (librería declarada); existe variante 4-bit GGUF para despliegue con llama.cpp u Ollama, aunque no se documentan integraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AndroidControl high/low | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-v2 | 2,21B | no disponible (historial de 8 pasos) | 0.739 / 0.907 | 56,0 % | Apache-2.0 | Hugging Face (offline) |
| LFM3-VL-2B-MobileAgent-v2 | no disponible | no disponible (historial de 8 pasos) | 0.716 / 0.893 | 50,9 % | no disponible | Hugging Face |
| LFM3-VL-2B-MobileAgent-v4 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo principal del proyecto) |

## Limitaciones y advertencias

- Modelo de investigación: el autor prohíbe explícitamente su uso desatendido en un teléfono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en inglés y una captura por paso; no hay memoria más allá de los 8 pasos de historial textual.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono en vivo, lo que limita su robustez ante estados no vistos.
- La mezcla de datos v2 rompió el bucle agéntico (3/116 en AndroidWorld para el modelo hermano), por lo que no se validó en ese benchmark y su fiabilidad en entornos reales es dudosa.
- Riesgo de alucinación en la selección de acciones y coordenadas, especialmente en pantallas fuera de la distribución de AndroidControl, GUI-Odyssey, AMEX o ScreenQA.
- Sesgos: no documentados por el autor; al entrenarse solo con datos en inglés, el rendimiento en otros idiomas no está garantizado.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias del autor sobre uso desatendido deben respetarse en producción.
- Es un modelo de comparación, no la línea principal del proyecto, y tiene un uso muy reducido (2 descargas, 0 likes) en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante GGUF: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v2-GGUF
- Modelo principal del proyecto: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Dataset: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v2
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
