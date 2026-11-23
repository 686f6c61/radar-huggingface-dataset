# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft

## Resumen

LFM3-VL-2B-MobileAgent-v4.3-sft es un ajuste fino experimental de LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines, orientado a la operación autónoma de teléfonos Android mediante capturas de pantalla. El modelo recibe un objetivo en lenguaje natural, la lista de aplicaciones instaladas, el historial de las últimas 8 acciones y una captura de pantalla, y devuelve una única acción siguiente en formato JSON compacto (click, scroll, input_text, open_app, entre otras). Se trata de un modelo de tipo image-text-to-text con 1.918.181.888 parámetros (~1,9 mil millones) y licencia LFM Open License v1.0.

Este checkpoint concreto es el "round-5 candidate S": parte de los pesos fusionados de v4.2 y aplica 500 pasos adicionales de SFT (16.000 filas, aproximadamente 0,17 épocas) sobre la misma mezcla de datos, con un LoRA de lenguaje r64/α128 fusionado en los pesos y el vision tower y el proyector congelados. El objetivo del experimento era comprobar si más entrenamiento sobre los mismos datos mejoraba el rendimiento. La respuesta, según la propia model card, es que no de forma validada: superó la puerta offline pero falló la puerta online pre-registrada (AndroidWorld seed 30: 24/116 tareas frente a 18 de v4.2, una mejora de +6 que queda por debajo del umbral de ruido declarado de +9, y además con más falsos `complete`, 37 frente a 25).

Por tanto, es un modelo de investigación, no un candidato a producción. Su relevancia es doble: por un lado, documenta de forma ejemplar un proceso de evaluación pre-registrada con puertas offline y online para agentes GUI; por otro, ilustra un resultado negativo útil (más épocas sobre la misma mezcla no basta y empeora la calibración de la finalización). El autor recomienda usar v4 (modelo principal) o v4.2 en lugar de este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en LFM3-VL-2B; visión + proyector + torre de lenguaje; ajuste con LoRA de lenguaje r64/α128 fusionado |
| Parámetros totales | 1.918.181.888 (~1,9 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el prompt incluye historial de las últimas 8 acciones |
| Tipos de cuantización | 4-bit GGUF disponible en repo separado (LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF); pesos originales en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B; etiquetada como "other"/"lfm1.0") |
| Formato de pesos | safetensors (transformers); GGUF 4-bit en repo aparte |
| Resolución de imagen | una captura por paso, redimensionada a un máximo de 880 × 880 px de área (≈720 image tokens) |
| Decodificación recomendada | thinking activado, temperatura 0 |
| Tamaño del repo | 4,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de ~1,9 B parámetros construido sobre LiquidAI/LFM3-VL-2B. La entrada visual es una única captura de pantalla por paso, redimensionada a un área máxima de 880 × 880 px, lo que produce aproximadamente 720 image tokens. La entrada textual combina el objetivo (`Goal: …`), las aplicaciones instaladas (`Installed apps: …`), el historial de los últimos 8 pasos en formato `n. <intent> -> <action JSON>` (o `None`) y la pregunta `What is the next action?`. La salida es un bloque `<think>short intent</think>` seguido de una única acción JSON con coordenadas enteras normalizadas en una rejilla 0–1000.

El entrenamiento de este checkpoint parte de los pesos fusionados de v4.2 y aplica 500 pasos adicionales de SFT con 32 filas por paso (16.000 filas, ≈0,17 épocas, recortado desde 800 pasos por límite de créditos antes de obtener resultados). Los datos se muestrean de la propia mezcla de entrenamiento de v4.2 (aproximadamente el 43 % ya visto), compuesta por AndroidControl, GUI-Odyssey, AMEX y ScreenQA con las ediciones de v4.1/v4.2. El schedule es warm-up → constante → decaimiento lineal (último 15 %) con lr 1e-4. Se añade un LoRA de lenguaje r64/α128 que se fusiona en los pesos (el adaptador queda en `lora_adapter/`), mientras que el vision tower y el proyector permanecen congelados. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de acciones de agente GUI sobre Android: click, long_press, input_text, scroll (up/down/left/right), open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status (complete/infeasible).
- Comprensión de capturas de pantalla de Android y localización de elementos mediante coordenadas normalizadas en rejilla 0–1000.
- Razonamiento de intención corto en modo thinking (`<think>…</think>`) antes de emitir la acción.
- Seguimiento de objetivos multi-paso con memoria textual limitada a los últimos 8 pasos.
- Respuesta a preguntas del usuario mediante la acción `answer`, con formato corto y en el formato solicitado.
- Declaración de finalización de tarea mediante `status` con `goal_status` `complete` o `infeasible`.
- Uso de la lista de aplicaciones instaladas para restringir `open_app` a aplicaciones presentes en el dispositivo.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling genérico: no disponible como tal; el mecanismo es un esquema JSON de acciones fijo, no un protocolo de herramientas arbitrario.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Investigación en agentes GUI: banco de pruebas para estudiar calibración de finalización de tareas, comparando falsos `complete` y tasas de éxito en AndroidWorld con semillas fijas y puertas pre-registradas.
- Automatización de pruebas de regresión de UI en Android: el modelo puede ejecutar secuencias de acciones sobre builds de prueba para validar flujos de navegación, siempre en dispositivos emulados y sin cuentas reales.
- Generación de trayectorias sintéticas etiquetadas: usar el modelo para producir pasos `n. <intent> -> <action JSON>` que sirvan como datos de entrenamiento o de evaluación para otros agentes móviles.
- Evaluación de robustez multimodal: al recibir una sola captura por paso y un historial corto, es útil para medir cómo degrada el rendimiento con memoria limitada y con pantallas densas.
- Reproducción de experimentos de scaling de épocas: este checkpoint sirve como referencia negativa para estudiar el efecto de más SFT sobre la misma mezcla de datos en tareas de agente.
- Asistencia supervisada en tareas de un solo paso: dado un objetivo acotado y una pantalla, proponer la siguiente acción para que un humano la revise antes de ejecutarla.
- Comparación de formatos de acción y prompts: el system prompt y el esquema JSON están documentados, lo que permite evaluar variantes de representación de acciones y de coordenadas.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación pre-registrada, ronda 5, puertas fijadas el 2026-11-22 antes del entrenamiento). Puerta offline superada; puerta online fallada.

| Offline (puerta) | v4.2 | v4.3-sft | Umbral |
|---|---|---|---|
| Tasa de parseo | 1,000 | 1,000 | ≥ 0,99 |
| AndroidControl test, precisión de paso high-level | 0,732 | 0,736 | ≥ 0,712 |
| AndroidControl terminal `complete` accuracy | 0,738 | 0,757 | ≥ 0,70 |
| Dev `answer` / dev `complete` | 0,868 / 0,812 | 0,860 / 0,875 | ≥ 0,848 / — |
| Validation loss (AndroidControl val, final) | 0,340 | 0,334 | — |

| AndroidWorld seed 30 (116 tareas, desarrollo) | v4.2 | v4.3-sft | Umbral |
|---|---|---|---|
| Éxitos | 18 (réplica: 19) | 24 | ganancia neta ≥ 9 sobre v4.2 → +6, falla |
| Falso `complete` (terminó "done", el checker dice no) | 25 (réplica: 22) | 37 | ≤ 15 con ≥ 16 éxitos → falla |

Observaciones adicionales de la model card: la ganancia es del mismo tamaño frente a v4 (+6, p = 0,15) y frente a la réplica de v4.2 (+5, p = 0,23), pero no es significativa. El modelo termina más tareas declarándolas hechas (56 frente a 37–38; p emparejado = 0,03 frente a v4.2), con una proporción de acierto entre las terminadas sin cambios (0,34). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~1,9 B parámetros): aproximadamente 4–5 GB en fp16/bf16, más overhead de activaciones y de los ~720 image tokens por paso.
- VRAM estimada en 4-bit GGUF: aproximadamente 1,5–2,5 GB, adecuada para GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer con ≥ 6 GB para fp16 (RTX 3060, RTX 4060, RTX 4090) y ≥ 4 GB para la variante GGUF; para servir varios agentes en paralelo, A100 o H100 con vLLM/TGI.
- Cabe en GPU consumer: sí, tanto en fp16 en tarjetas de 8 GB o más como en la variante 4-bit GGUF en tarjetas de 4–6 GB.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), llama.cpp/Ollama para la variante GGUF, vLLM o TGI para servicio en fp16; el repo está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación recomendada es thinking activado y temperatura 0, lo que añade tokens de razonamiento por paso y reduce el throughput efectivo por acción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.3-sft | ~1,9 B | no disponible (historial de 8 pasos) | Agente GUI Android, imagen + texto | LFM Open License v1.0 | Experimental, falló puerta online |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2 | ~1,9 B | no disponible (historial de 8 pasos) | Agente GUI Android | LFM Open License v1.0 | Recomendado por el autor junto con v4 |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4 | ~1,9 B | no disponible | Agente GUI Android | LFM Open License v1.0 | Modelo principal según el autor |
| LiquidAI/LFM3-VL-2B | ~1,9 B | no disponible en la información disponible | Modelo base multimodal image-text-to-text | LFM Open License v1.0 | Base pública de LiquidAI |

No se dispone en la información proporcionada de comparativas con otros agentes GUI móviles de tamaño similar (por ejemplo, familias basadas en Qwen-VL o en modelos de 2–3 B orientados a mobile agents), por lo que la comparación se limita a los checkpoints de la misma línea.

## Limitaciones y advertencias

- Modelo de investigación: no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Falló la puerta online pre-registrada: la mejora de +6 éxitos en AndroidWorld seed 30 queda por debajo del umbral de ruido de +9 y no es estadísticamente significativa.
- Aumento de falsos `complete`: 37 frente a 25 de v4.2, con la misma proporción de acierto entre las tareas terminadas (0,34); declara tareas completadas demasiado pronto con más frecuencia.
- Solo objetivos en inglés; no se declara soporte multilingüe.
- Una sola captura por paso y sin memoria más allá del historial textual de 8 pasos.
- No evaluado en MobileWorld ni en semillas selladas, según la model card.
- Riesgo de alucinación en la interpretación de la pantalla y en la selección de coordenadas; el parseo estricto (tasa 1,000 en offline) no garantiza que la acción sea correcta.
- Licencia LFM Open License v1.0 heredada de LiquidAI: es necesario revisar sus términos para uso comercial, redistribución y atribución antes de integrar el modelo en un producto.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre capturas de AndroidControl, GUI-Odyssey, AMEX y ScreenQA, puede heredar los sesgos de distribución de esas capturas (idioma, apps y regiones sobrerrepresentadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft
- Variante GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-sft-GGUF
- Checkpoint base v4.2: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
