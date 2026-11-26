# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-B

## Resumen

LFM3-VL-2B-MobileAgent-v4.4-B es un ajuste fino (LoRA SFT fusionado) del modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario experimentalmachines dentro del proyecto LFM3 Mobile Agent. El modelo está especializado en una única tarea: actuar como agente que maneja un teléfono Android a partir de capturas de pantalla, emitiendo una acción en JSON por paso (clic, scroll, entrada de texto, apertura de apps, etc.) sobre una rejilla normalizada 0-1000. Resuelve el problema del control de interfaces móviles mediante modelos pequeños que puedan ejecutarse en entornos con recursos limitados.

Con 1.918.181.888 parámetros totales (aproximadamente 1,9 mil millones), el modelo parte de la arquitectura LFM3-VL de LiquidAI y añade un adaptador LoRA de rango 64 y alpha 128 aplicado únicamente al modelo de lenguaje, manteniendo congelado el torreón de visión. Se entrenó durante 1.250 pasos con 32 filas por paso, learning rate 2e-4 con decaimiento coseno, en una sola GPU A100.

Es relevante ahora porque representa un intento reproducible y pre-registrado de mejorar la precisión en tareas largas de agentes móviles, con un enfoque explícito en la parada correcta al final de tareas largas. Sin embargo, el propio autor indica que esta versión **no fue promovida**: falló una comprobación de la puerta offline pre-registrada (paradas tempranas en pasos tardíos de AndroidControl) y no se ejecutó online.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL) con adaptador LoRA fusionado en el modelo de lenguaje; torreón de visión congelado |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo recibe los últimos 8 pasos de historial de texto como ventana operativa) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | Safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM3-VL-2B (commit `23387be`), un modelo multimodal de aproximadamente 1,9 mil millones de parámetros que procesa una captura de pantalla por paso junto con texto. Sobre esta base se aplicó un ajuste supervisado con LoRA de rango 64 y alpha 128 exclusivamente sobre el modelo de lenguaje, dejando el torreón de visión congelado. El adaptador resultante se fusionó en los pesos finales, y también se publica por separado en `lora_adapter/`.

El entrenamiento consistió en 1.250 pasos con 32 filas por paso, learning rate 2e-4 con programación coseno, ejecutado en una única GPU A100. Los datos provienen de MobileAgent-SFT-v4 (commit `3375539`) más MobileAgent-SFT-v4.4 (commit `2b481ae3`), que incorpora filas MemGUI-3K filtradas para excluir aplicaciones de AndroidWorld, MobileWorld y AndroidLab. La innovación destacable de esta versión es la inclusión de una nota `[no visible change]` en los pasos del historial cuya siguiente captura no cambió, replicando la regla en tiempo de ejecución del agente AndroidWorld del proyecto; el autor indica que deben usarse las mismas notas en inferencia.

## Capacidades

- Generación de acciones de agente móvil en formato JSON compacto sobre una rejilla 0-1000, precedidas de un bloque `` con la intención a corto plazo.
- Tipos de acción soportados: `click`, `long_press`, `input_text`, `scroll` (up/down/left/right), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Comprensión de capturas de pantalla de Android redimensionadas a un máximo de 880 × 880 píxeles de área.
- Procesamiento de un objetivo (`Goal:`), lista de aplicaciones instaladas (`Installed apps:`) y los últimos 8 pasos de historial textual (`Previous steps:`).
- Capacidad de responder preguntas finales mediante la acción `answer` y de finalizar tareas sin información solicitada mediante `status`.
- Capacidad de parada al final real de tareas largas (mejorada respecto a v4: 29,1 % frente a 12,2 % en AndroidLens).
- No soporta tool calling genérico, ni agentes multi-paso fuera del bucle de captura-acción, ni visión más allá de la captura de pantalla, ni audio.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones sobre una app a partir de capturas, útil para grabar recorridos de prueba reproducibles en pipelines de CI para aplicaciones móviles.
- Investigación en agentes GUI: sirve como punto de comparación reproducible (con pre-registro público) para estudiar la parada temprana y la precisión en tareas largas en entornos como AndroidControl y AndroidLens.
- Asistencia a usuarios con discapacidad motriz: dado un objetivo en inglés y una captura, el modelo propone la siguiente acción concreta (clic, scroll, texto), que podría integrarse en un asistente supervisado por el usuario.
- Extracción de información de pantallas: mediante la acción `answer`, el modelo puede responder preguntas sobre el contenido visible de una captura, útil para tareas de lectura de pantalla en inglés.
- Generación de datos sintéticos de interacción móvil: las trazas (captura → intención → acción JSON) pueden servir para aumentar datasets de entrenamiento de agentes GUI.
- Evaluación de recetas de ajuste fino con LoRA en modelos pequeños multimodales: la publicación incluye adaptador separado, datos y pre-registro, lo que facilita reproducir el experimento y medir el efecto de la nota `[no visible change]`.
- Demostraciones controladas de agentes móviles en entornos aislados (emuladores sin cuentas reales): adecuado para validar el bucle de percepción-acción antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación offline con Transformers en bf16, decodificación greedy, sobre las mismas particiones pre-renderizadas para v4 y los candidatos.

| Métrica | v4.4-B | v4 | Umbral de la puerta |
|---|---|---|---|
| AndroidControl test, precisión de paso de alto nivel | 0,728 | 0,727 | ≥ 0,707 |
| `dev_answer` / `dev_complete` | 0,890 / 0,713 | 0,890 / 0,763 | ≥ 0,840 / ≥ 0,713 |
| AndroidControl pasos ≥ 4: `status` predicho | 8,75 % | 9,0 % | ≤ 6,0 % |
| AndroidLens precisión de paso en pasos ≥ 10 | 0,402 | 0,367 | ≥ 0,347 |
| AndroidLens precisión de paso, todos los pasos | 0,441 | 0,414 | — |
| AndroidLens `complete` en el último paso real | 29,1 % | 12,2 % | — |
| MemGUI dev precisión de paso | 0,654 | 0,421 | — |

El modelo no superó la puerta pre-registrada en la comprobación de paradas tempranas en pasos tardíos de AndroidControl (8,75 % frente al máximo del 6,0 %), por lo que no fue promovido ni ejecutado online. No se han publicado resultados en AndroidWorld ni MobileWorld.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4 GB solo para pesos (1,9 mil millones de parámetros), más overhead de activaciones y del procesador de visión; en la práctica, entre 6 y 8 GB en bf16 para una sola captura.
- En cuantización de 8 bits: alrededor de 2-3 GB de VRAM; en 4 bits: alrededor de 1,5-2 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 (la utilizada en entrenamiento), H100, L40S o RTX 4090 para inferencia en bf16; RTX 3090/4080 y GPUs consumer de 8 GB o más para cuantización.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 y en 6 GB o más con cuantización de 8/4 bits.
- Opciones de despliegue: Transformers (librería declarada, con `custom_code` y `lfm3_vl`), vLLM y TGI si soportan la arquitectura LFM3-VL; llama.cpp/Ollama solo si existe conversión GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.4-B | 1,92 B | No disponible (historial de 8 pasos) | Agente móvil Android (captura → acción JSON) | LFM Open License v1.0 | Hugging Face, 37 descargas |
| LFM3-VL-2B-MobileAgent-v4 | 1,92 B | No disponible (historial de 8 pasos) | Agente móvil Android, versión evaluada y promovida | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-VL-2B | 1,92 B | No disponible | Modelo multimodal base image-text-to-text | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo las métricas de v4 incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo de investigación no promovido: el autor advierte explícitamente de que no debe dejarse actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- No se ejecutó en AndroidWorld ni MobileWorld; solo hay evaluación offline en AndroidControl, AndroidLens y MemGUI.
- Falló la puerta pre-registrada de paradas tempranas en pasos tardíos de AndroidControl (8,75 % frente al máximo del 6,0 %); aproximadamente la mitad de esas paradas ocurren un paso antes del final, donde las demostraciones humanas añaden un scroll o un wait final.
- Solo admite objetivos en inglés; no se ha validado en otros idiomas.
- Ventana operativa limitada: una captura por paso y sin memoria más allá de los 8 pasos de historial textual.
- Requiere replicar en tiempo de ejecución la nota `[no visible change]` en los pasos cuyo siguiente captura no cambia; omitirla degrada el comportamiento esperado.
- Riesgo de alucinación en la interpretación de la captura y en la selección de acciones; no hay datos publicados sobre sesgos.
- Licencia LFM Open License v1.0 heredada; es necesario revisar los términos para uso comercial, ya que la licencia se etiqueta como "other".
- Formato de teléfono no publicado (el autor indica "None published"), lo que limita la reproducibilidad exacta del preprocesado.
- Sin datos publicados de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Versión evaluada v4: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Dataset MobileAgent-SFT-v4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4
- Dataset MobileAgent-SFT-v4.4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4.4
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Resultados completos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro v4.4: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v44.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-B/blob/main/LICENSE
