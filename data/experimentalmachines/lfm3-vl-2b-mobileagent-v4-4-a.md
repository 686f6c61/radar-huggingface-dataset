# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-A

## Resumen

LFM3-VL-2B-MobileAgent-v4.4-A es un ajuste fino (SFT con LoRA) del modelo multimodal LiquidAI/LFM3-VL-2B orientado a la automatización de teléfonos Android mediante capturas de pantalla. Lo desarrolla experimentalmachines como parte de su proyecto iterativo LFM3 Mobile Agent, y corresponde a la ronda 6 (variante v4.4-A). El modelo recibe una captura de pantalla, el objetivo del usuario, la lista de aplicaciones instaladas y los últimos 8 pasos, y devuelve una única acción en JSON sobre una rejilla normalizada 0-1000.

El modelo resuelve el problema de la interacción agente-entorno en interfaces móviles: convertir una imagen de pantalla en una acción ejecutable (clic, scroll, escritura, apertura de app, etc.) con razonamiento breve previo. Es relevante porque los agentes GUI móviles son un área activa de investigación, y este checkpoint explora recetas de datos con trayectorias largas y autocorrectivas (filas MemGUI), aunque el autor lo marca explícitamente como **no promocionado**: falló una de las comprobaciones del gate offline pre-registrado (paradas tempranas en pasos tardíos de AndroidControl) y no se ejecutó en línea.

Arquitectura y tamaño: se hereda del modelo base LFM3-VL-2B (1.918.181.888 parámetros, ~1,9 B), con una torre de visión congelada y el modelo de lenguaje ajustado mediante LoRA de rango 64 y alpha 128. El contexto efectivo del agente está limitado por el historial textual de 8 pasos más una captura por turno, con imágenes redimensionadas a un máximo de 880 × 880 píxeles de área.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (LFM3-VL), transformer con torre de vision; ajuste LoRA sobre el modelo de lenguaje |
| Parametros totales | 1.918.181.888 (~1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el agente usa historial textual de los ultimos 8 pasos + 1 captura por turno) |
| Tipos de cuantizacion | no disponible (evaluado en bf16; el repo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (transformers, custom_code); adaptador LoRA incluido en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un modelo multimodal de ~1,9 B de parámetros con torre de visión. El ajuste se realizó con LoRA SFT de rango 64 y alpha 128 aplicado únicamente al modelo de lenguaje, manteniendo la torre de visión congelada; posteriormente el adaptador se fusionó en los pesos (y se conserva una copia en `lora_adapter/`). El entrenamiento consistió en 1.250 pasos con batches de 32 filas, learning rate 2e-4 con schedule coseno, ejecutado en una única A100.

Los datos combinan MobileAgent-SFT-v4 (commit `3375539`) con MobileAgent-SFT-v4.4 (commit `2b481ae3`), que aporta 8.505 filas MemGUI usadas dos veces y filtradas para excluir aplicaciones de AndroidWorld, MobileWorld y AndroidLab. El objetivo de esta ronda eran trayectorias largas y autocorrectivas. La innovación técnica destacable no está en la arquitectura sino en la receta de datos y en el protocolo de evaluación pre-registrado con gates offline explícitos.

## Capacidades

- Interpretación de capturas de pantalla de Android y generación de una acción siguiente en JSON compacto sobre rejilla 0-1000.
- Razonamiento breve previo a la acción mediante bloque ``.
- Acciones soportadas: `click`, `long_press`, `input_text`, `scroll` (4 direcciones), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Gestión de objetivos multi-paso con historial textual de los últimos 8 pasos.
- Capacidad de responder preguntas finales (`answer`) y de declarar el estado del objetivo (`status`).
- Capacidad de autocorrección en trayectorias largas (mejora medida en MemGUI dev y AndroidLens en pasos ≥ 10).
- Soporte multilingüe: limitado a inglés (objetivos en inglés).
- No soporta tool calling genérico, audio ni memoria más allá del historial de 8 pasos.

## Casos de uso

- Investigación en agentes GUI móviles: servir como checkpoint de referencia para estudiar recetas de SFT con trayectorias largas y autocorrectivas, comparando contra v4 en las mismas particiones pre-renderizadas.
- Automatización de pruebas de UI en Android: el modelo puede generar secuencias de acciones (clics, scrolls, entradas de texto) sobre apps instrumentadas para validar flujos de navegación en entornos controlados.
- Evaluación offline de modelos de agente: integrarlo en pipelines de evaluación estática (AndroidControl, AndroidLens) con historial ground-truth para medir precisión por paso y tasas de parada.
- Generación de datos sintéticos de interacción: usar sus salidas JSON como propuestas de acción para anotación humana o filtrado en la construcción de nuevos datasets de agentes móviles.
- Estudio de calibración de parada: analizar cuándo el modelo decide `status: complete` frente a continuar, útil para investigar el problema de paradas tempranas en tareas largas.
- Prototipado de asistentes de accesibilidad en laboratorio: explorar cómo un agente de ~1,9 B puede guiar la interacción con pantallas en inglés, siempre en entornos de prueba sin cuentas reales.
- Base para nuevos ajustes LoRA: al incluir el adaptador separado, sirve como punto de partida para experimentos de fine-tuning sobre dominios o apps específicas.

## Benchmarks y rendimiento

Evaluación offline con Transformers en bf16, decodificación greedy, sobre las mismas particiones pre-renderizadas para v4 y candidatos. AndroidLens English: 172 episodios largos, solo evaluación, con historial ground-truth.

| Metrica | v4.4-A | v4 | Umbral del gate |
|---|---|---|---|
| AndroidControl test, precision por paso (high-level) | 0.729 | 0.727 | ≥ 0.707 |
| `dev_answer` / `dev_complete` | 0.890 / 0.700 | 0.890 / 0.763 | ≥ 0.840 / ≥ 0.713 |
| AndroidControl pasos ≥ 4: `status` predicho | 8.5% | 9.0% | ≤ 6.0% |
| AndroidLens precision por paso en pasos ≥ 10 | 0.401 | 0.367 | ≥ 0.347 |
| AndroidLens precision por paso, todos los pasos | 0.448 | 0.414 | — |
| AndroidLens `complete` en el ultimo paso real | 21.5% | 12.2% | — |
| MemGUI dev precision por paso | 0.668 | 0.421 | — |

El modelo no superó el gate en la comprobación de paradas tempranas en pasos tardíos de AndroidControl (8.5% frente al máximo del 6.0%), por lo que no fue promocionado ni evaluado en línea.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4 GB en bf16 para los ~1,9 B de parámetros, más el coste de la torre de visión y de la imagen de entrada (hasta 880 × 880 px de área); el repo ocupa 4,1 GB.
- GPU recomendadas: A100 (usada en entrenamiento), H100 para mayor throughput; cualquier GPU con ≥ 8 GB de VRAM debería poder ejecutar inferencia en bf16 o fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4090, RTX 4080 y similares con ≥ 8 GB; en GPUs de 6-8 GB podría requerir cuantización, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documenta soporte verificado en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.4-A | ~1,9 B | no disponible (historial 8 pasos) | Agente Android screenshot-only | LFM Open License v1.0 | No promocionado (research) |
| LFM3-VL-2B-MobileAgent-v4 | ~1,9 B | no disponible (historial 8 pasos) | Agente Android screenshot-only | LFM Open License v1.0 | Modelo evaluado de referencia |
| LiquidAI/LFM3-VL-2B | ~1,9 B | no disponible | Modelo base multimodal image-text-to-text | LFM Open License v1.0 | Modelo base público |

No se dispone en la información proporcionada de comparativas con otros agentes GUI móviles de tamaño similar (por ejemplo, variantes basadas en Qwen-VL o MiniCPM-V); por tanto, esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Modelo de investigación **no promocionado**: no debe usarse de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- No evaluado en AndroidWorld ni MobileWorld; los resultados solo cubren AndroidControl, AndroidLens y MemGUI.
- Fallo conocido: paradas tempranas en pasos tardíos de AndroidControl (8.5% frente al umbral ≤ 6.0%); aproximadamente la mitad ocurren un paso antes del final.
- Solo objetivos en inglés; no se documenta soporte multilingüe.
- Una única captura por paso y sin memoria más allá del historial textual de 8 pasos.
- Riesgo de alucinación en la selección de acciones y coordenadas, inherente a modelos de este tamaño.
- Licencia LFM Open License v1.0: revisar condiciones para uso comercial antes de cualquier despliegue productivo.
- Sesgos: no documentados explícitamente en la información disponible; al entrenarse con datos de interacción móvil, puede heredar sesgos de las apps y flujos representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-A
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo de referencia v4: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Dataset MobileAgent-SFT-v4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4
- Dataset MobileAgent-SFT-v4.4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4.4
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Resultados completos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro de la ronda: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v44.md
