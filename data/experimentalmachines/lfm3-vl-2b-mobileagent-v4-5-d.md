# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D

## Resumen

LFM3-VL-2B-MobileAgent-v4.5-D es un ajuste fino de tipo LoRA SFT sobre el modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines dentro del proyecto LFM3 Mobile Agent. El modelo está especializado en una única tarea: actuar como agente de interfaz gráfica (GUI agent) sobre Android, recibiendo una captura de pantalla por paso y emitiendo una acción JSON compacta. Con 1.918.181.888 parámetros (aproximadamente 1,9B) y una ventana de contexto que en la práctica se gestiona mediante un historial de texto de 24 pasos, es un modelo pequeno y desplegable en hardware modesto.

La relevancia de esta versión, etiquetada como "D", es que representa la ronda 7 del proyecto con una pasada completa sobre el dataset MobileAgent-SFT-v4.5 (173.430 filas, aproximadamente el doble de datos que la versión v4). Introduce dos cambios de formato clave: un historial de texto de 24 pasos (frente a los 8 de v4) y notas "[no visible change]" cuando la pantalla no cambia entre pasos. Según la model card, mejora a v4 en casi todas las métricas offline, especialmente en tareas largas y en detenerse en el paso final real.

Sin embargo, el autor es explícito: el modelo **no ha sido promovido**. Falló una de las comprobaciones del gate offline pre-registrado (emite `status` al menos dos pasos antes del final en el 3,64% de los episodios de AndroidControl, frente al 2,74% de v4 y un umbral máximo del 3,24%). No se ejecutó en AndroidWorld ni en MobileWorld. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia LFM3-VL, vision tower + language model); no se detalla la arquitectura interna exacta |
| Parametros totales | 1.918.181.888 (~1,9B) |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible como ventana de tokens; el agente usa un historial de texto de 24 pasos |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (con adaptador LoRA en `lora_adapter/`, ya fusionado en los pesos) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`) y se ajusta mediante LoRA SFT con rango 64 y alpha 128 aplicado únicamente al language model, manteniendo el vision tower congelado. El adaptador se fusiona en los pesos finales, aunque también se publica por separado en `lora_adapter/`. El entrenamiento consistió en 5.420 pasos × 32 filas (una sola pasada), con learning rate 2e-4 y scheduler coseno, sin gradient checkpointing, ejecutado en una única H100 durante 3,4 horas.

Los datos provienen de MobileAgent-SFT-v4.5 (commit `45331aaa`): todas las filas de AndroidControl, GUI-Odyssey y AMEX sin límite de tamaño (con intenciones en blanco rellenadas a partir de Aguvis), MemGUI-3K y ScreenQA. La innovación técnica principal no está en la arquitectura sino en el formato de interacción: una imagen por paso redimensionada a un máximo de 880 × 880 px de área, un prompt de usuario estructurado (`Goal:`, `Installed apps:`, `Previous steps:` con los últimos 24 pasos y notas de no-cambio, `What is the next action?`) y una salida compuesta por un bloque `<think>` breve seguido de una única acción JSON en una rejilla normalizada de 0 a 1000. El system prompt define diez tipos de acción: click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status.

## Capacidades

- Comprensión de capturas de pantalla de Android y generación de acciones de interacción sobre una rejilla normalizada 0–1000.
- Generación de acciones estructuradas en JSON compacto, con un bloque previo `<think>` de intención breve.
- Gestión de historial multi-paso: mantiene contexto de los últimos 24 pasos de texto, incluyendo notas de "[no visible change]".
- Tipos de acción soportados: click, long_press, input_text, scroll (cuatro direcciones), open_app (restringido a apps instaladas), navigate_back, navigate_home, keyboard_enter, wait, answer y status.
- Respuesta a preguntas del objetivo mediante la acción `answer`, con formato corto y en el formato solicitado.
- Finalización de tareas sin información solicitada mediante `status` con `goal_status` complete o infeasible.
- Capacidad multimodal limitada a una sola captura de pantalla por paso (no vídeo ni secuencias de imágenes).
- Sin soporte documentado de tool calling genérico, function calling fuera del esquema de acciones, ni capacidades de audio.
- Idioma: únicamente inglés en los objetivos.

## Casos de uso

- Investigación en agentes GUI móviles: servir como punto de comparación reproducible frente a v4 dentro del proyecto LFM3 Mobile Agent, con formato de 24 pasos y notas de no-cambio, para estudiar el efecto del historial largo en la precisión de paso.
- Automatización de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones sobre emuladores para validar flujos de UI, siempre en entornos controlados y sin cuentas reales.
- Estudio de detección temprana de finalización: dado que el fallo principal es emitir `status` antes de tiempo, es útil como caso de análisis para investigar el problema de "early stopping" en agentes.
- Prototipado de asistentes de accesibilidad en Android: en un entorno de laboratorio, podría explorar la traducción de objetivos en lenguaje natural a acciones concretas sobre la pantalla.
- Generación de datos sintéticos de interacción: las trazas de acciones JSON producidas pueden emplearse como material de análisis o para aumentar datasets de agentes, con revisión humana.
- Evaluación offline de pipelines de agentes: integrarlo en un evaluador que compare precisión de paso en AndroidControl y AndroidLens con el mismo harness que v4.
- Benchmarking de eficiencia en hardware consumer: al ser un modelo de ~1,9B, permite medir latencia y throughput de inferencia multimodal en GPUs de gama alta consumer dentro de flujos de investigación.

## Benchmarks y rendimiento

Evaluación offline en Transformers bf16, decodificación greedy. D se evalúa con su propio formato de prompt; v4 con el suyo (8 pasos), usando el mismo evaluador.

| Metrica | v4.5-D | v4 | Umbral del gate |
|---|---|---|---|
| AndroidControl test, precision de paso high-level | 0,753 | 0,727 | ≥ 0,707 |
| `dev_answer` / `dev_complete` | 0,882 / 0,800 | 0,890 / 0,763 | ≥ 0,840 / ≥ 0,713 |
| AndroidControl: `status` ≥ 2 pasos antes del final | 3,64% | 2,74% | ≤ 3,24% (falla) |
| AndroidLens precision de paso en pasos ≥ 10 | 0,471 | 0,367 | ≥ 0,367 |
| AndroidLens precision de paso, todos los pasos | 0,507 | 0,414 | — |
| AndroidLens `complete` en el último paso real | 57,6% | 12,2% | — |
| MemGUI dev precision de paso | 0,697 | 0,421 | — |
| Validation loss (AndroidControl val, formato de v4) | 0,252 | 0,306 | — |

No se ejecutaron evaluaciones online en AndroidWorld ni MobileWorld.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de ~1,9B en bf16, el peso ronda los 3,8 GB, por lo que la inferencia completa requiere en torno a 5–8 GB de VRAM incluyendo activaciones y la torre de visión; en cuantización de 8 bits o 4 bits (no publicada) bajaría sustancialmente.
- GPU recomendadas: el autor entrenó con una H100. Para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es holgada; GPUs consumer de 8–12 GB podrían ser suficientes en bf16 con cuidado de memoria, aunque no hay cifras publicadas.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, aunque no se han publicado mediciones.
- Opciones de despliegue: transformers (librería declarada, con `custom_code` y `lfm3_vl`); no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / historial | Licencia | Estado |
|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.5-D | ~1,9B | 24 pasos de historial de texto | LFM Open License v1.0 | No promovido; falla el gate offline |
| LFM3-VL-2B-MobileAgent-v4 | ~1,9B (mismo base) | 8 pasos de historial | LFM Open License v1.0 | Modelo evaluado del proyecto |
| LiquidAI/LFM3-VL-2B | ~2B (base) | no disponible | LFM Open License v1.0 | Modelo base multimodal |
| Alternativas de agente GUI de tamano similar | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con v4, del mismo autor y mismo modelo base: v4.5-D gana en precisión de paso (0,753 frente a 0,727), en tareas largas de AndroidLens (0,471 frente a 0,367 en pasos ≥ 10) y en detenerse en el último paso real (57,6% frente a 12,2%), pero pierde en la tasa de parada temprana (3,64% frente a 2,74%).

## Limitaciones y advertencias

- Modelo de investigación no promovido: el autor advierte explícitamente de no dejarlo actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- Fallo principal: parada temprana. Emite `status` al menos dos pasos antes del final en el 3,64% de los episodios de AndroidControl, por encima del umbral del 3,24%; en las mismas filas dice `status` donde v4 continúa 114 veces frente a 52 en sentido inverso (p < 0,0001).
- No evaluado online: no se ejecutó en AndroidWorld ni en MobileWorld, por lo que no hay evidencia de rendimiento en entornos reales de agente.
- Idioma limitado a inglés en los objetivos; no hay soporte multilingüe documentado.
- Memoria restringida al historial de texto de 24 pasos; no hay memoria visual ni de estado más allá de ese texto.
- Una sola captura por paso; no procesa secuencias de vídeo ni múltiples imágenes simultáneas.
- Riesgo de alucinación en la interpretación de la pantalla y en la selección de apps instaladas; `open_app` está restringido a las apps declaradas en el prompt, pero el modelo podría equivocarse al elegir.
- Licencia LFM Open License v1.0: es necesario revisar los términos para uso comercial, ya que se hereda del modelo base y no es una licencia permisiva estándar.
- Sin datos publicados sobre sesgos, cuantizaciones, latencia ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Versión anterior evaluada (v4): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4.5
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Resultados completos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro del gate: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v45.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D/blob/main/LICENSE
