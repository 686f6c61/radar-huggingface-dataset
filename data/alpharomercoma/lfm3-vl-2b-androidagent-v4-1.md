# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1

## Resumen

LFM3-VL-2B-AndroidAgent-v4.1 es un ajuste fino (fine-tuning) del modelo multimodal LiquidAI/LFM3-VL-2B orientado a la operación autónoma de teléfonos Android a partir de capturas de pantalla. Lo desarrolla el usuario de Hugging Face alpharomercoma y resuelve un problema muy concreto: convertir un modelo visión-lenguaje genérico de 2B parámetros en un agente GUI (GUI agent) capaz de emitir una única acción JSON por paso (clic, scroll, entrada de texto, apertura de app, etc.) a partir de la captura actual y un historial textual de los últimos ocho pasos.

Se trata de la versión 4.1 de una serie iterativa; el cambio principal respecto a v4 es puramente de datos de entrenamiento: se reetiquetaron las filas de `wait` de AndroidControl (4.104 objetivos y 13.145 líneas de historial) para evitar que el modelo aprendiera a copiar la intención anterior y quedarse atascado en bucles de espera, y se añadieron 5.244 filas de historial de recuperación. El modelo mantiene la arquitectura y el tamaño del base (1.918.181.888 parámetros, aproximadamente 2B) y se distribuye con los pesos LoRA fusionados más el adaptador original.

Es relevante ahora porque los agentes móviles basados en VLM están emergiendo como línea de investigación activa (AndroidWorld, MobileWorld) y este modelo ofrece un punto de partida reproducible y de bajo coste computacional (entrenado con una sola A100 en 1.250 pasos) para experimentar con control de interfaz. Su estado es explícitamente experimental y su evaluación está en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) LFM3-VL; tower de visión congelado durante el ajuste, LM ajustado con LoRA |
| Parametros totales | 1.918.181.888 (≈2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (historial textual limitado a 8 pasos) |
| Tipos de cuantizacion | 4-bit GGUF disponible en repo separado (LFM3-VL-2B-AndroidAgent-v4.1-GGUF); safetensors en el repo principal |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (pesos fusionados) + adaptador LoRA en `lora_adapter/`; GGUF 4-bit en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un VLM de unos 2B parámetros. El ajuste se realizó mediante LoRA SFT con rango 64 y alpha 128 aplicado únicamente al modelo de lenguaje, manteniendo el tower de visión congelado. Posteriormente el adaptador se fusionó en los pesos principales, aunque se conserva una copia del adaptador en `lora_adapter/`. El entrenamiento consistió en 1.250 pasos con batches de 32 filas (0,43 épocas sobre 92.229 filas), learning rate 2e-4, ejecutado en una sola A100, replicando exactamente la receta, las filas y el orden de filas de v4.

Los datos de entrenamiento provienen de cuatro conjuntos: AndroidControl, GUI-Odyssey, AMEX y ScreenQA. La innovación de esta versión es exclusivamente de datos: (1) reetiquetado de `wait` para corregir el sesgo aprendido en v4, donde el 94% de las filas `wait` de AndroidControl repetían la intención del paso anterior, lo que provocaba que el modelo copiara su última intención y luego esperara; ahora la intención es "Wait for the screen to finish loading."; (2) adición de 5.244 filas de historial de recuperación con un paso extra (el último repetido o un wait) manteniendo como objetivo la siguiente acción humana. La entrada visual se redimensiona a un máximo de 880×880 px de área (unos 720 tokens de imagen) y la salida es un bloque `<think>` con una intención corta seguido de una única acción JSON con coordenadas enteras en una rejilla 0–1000.

## Capacidades

- Generación de acciones de interfaz Android en formato JSON compacto: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Comprensión de capturas de pantalla (screenshot-to-action) con una imagen por paso.
- Razonamiento de intención explícito mediante modo thinking (`<think>...</think>`) antes de emitir la acción.
- Seguimiento de objetivos multi-paso con historial textual de los últimos 8 pasos (intención + acción JSON).
- Selección de aplicaciones entre una lista de apps instaladas proporcionada en el prompt.
- Respuesta a preguntas del usuario mediante la acción `answer`, con formato controlado.
- Marcado de finalización o imposibilidad de un objetivo mediante `status` (`complete`/`infeasible`).
- Capacidades multilingües: únicamente inglés.
- No soporta tool calling genérico, audio ni otras modalidades más allá de imagen-texto.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede generar secuencias de acciones sobre una app a partir de capturas, útil para construir tests end-to-end que se adapten a cambios de layout sin selectores frágiles.
- Investigación en agentes GUI: banco de pruebas reproducible para estudiar bucles de espera, recuperación de errores y planificación de corto horizonte sobre AndroidWorld o MobileWorld.
- Asistencia a usuarios con movilidad reducida: dado un objetivo en lenguaje natural y capturas del dispositivo, el agente puede proponer la siguiente acción para que el usuario la confirme manualmente.
- Extracción de información de pantallas: combinando `answer` con la captura, se puede interrogar al modelo sobre el contenido visible (precios, mensajes, estados) en flujos de scraping asistido.
- Generación de datos sintéticos de interacción: usar el agente para producir trayectorias etiquetadas que alimenten otros modelos o para aumentar datasets de entrenamiento de agentes móviles.
- Prototipado de asistentes de onboarding: guiar a un usuario novel por los pasos de configuración de una app, mostrando la siguiente acción recomendada en lugar de ejecutarla.
- Evaluación comparativa de VLMs en control de interfaz: servir como baseline de 2B parámetros frente a modelos mayores en tareas de AndroidWorld, con coste de inferencia bajo.

## Benchmarks y rendimiento

La evaluación está preregistrada y en curso. Los datos publicados corresponden a la referencia v4, no a v4.1:

| Benchmark | Modelo | Resultado |
|---|---|---|
| AndroidWorld, seed 30 (116 tareas) | v4 (referencia) | 18 / 116 |
| AndroidWorld, seeds held-out 7 / 1234 / 2026 | v4 (referencia) | 54 / 348 |
| MobileWorld, 105 tareas GUI en inglés | v4 (referencia) | 6 / 105 |
| AndroidWorld, seed 30 | v4.1 | en curso |
| MobileWorld, 105 tareas GUI en inglés | v4.1 | en curso |

No se han publicado resultados de benchmarks de v4.1 en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit GGUF, el modelo de ~2B parámetros ocupa aproximadamente 1,5–2 GB de pesos, más overhead de contexto y procesamiento de imagen; se estima un consumo total en torno a 3–4 GB en inferencia.
- En precisión completa (safetensors, fp16/bf16), los pesos ocupan aproximadamente 3,8 GB, con un consumo total estimado de 5–6 GB de VRAM.
- GPU recomendadas: A100 (usada en entrenamiento), H100 para throughput alto; cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 y GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, incluidas RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB; con la versión 4-bit también en GPUs de 6–8 GB.
- Opciones de despliegue: transformers (librería declarada), llama.cpp u Ollama mediante el GGUF 4-bit del repo separado, y servidores compatibles con endpoints (`endpoints_compatible` en los tags). vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La decodificación recomendada es con thinking activado y temperatura 0, lo que añade tokens de razonamiento a cada paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.1 | ≈2B | no disponible (historial 8 pasos) | Agente Android screenshot-only | LFM Open License v1.0 | Hugging Face (repo principal + GGUF) |
| LiquidAI/LFM3-VL-2B (base) | ≈2B | no disponible | VLM generalista imagen-texto | LFM Open License v1.0 | Hugging Face |
| Modelos de agente GUI de mayor tamaño (p. ej. familia Qwen-VL ajustada) | no disponible en esta ficha | no disponible | Agente GUI multimodal | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los benchmarks publicados solo permiten comparar v4 con v4.1, no con modelos de terceros.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de no dejarlo actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- Solo admite objetivos en inglés y una captura por paso; no hay memoria más allá del historial textual de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca ha interactuado con un teléfono real durante el entrenamiento, lo que puede provocar un desajuste con la distribución real (distribución shift).
- Riesgo de bucles de espera: es precisamente el fallo que motivó v4.1, y aunque se ha mitigado con reetiquetado, no se ha confirmado su eliminación (evaluación en curso).
- Riesgo de alucinación en coordenadas y en la selección de apps: las coordenadas se normalizan a 0–1000 y pueden apuntar a regiones incorrectas de la pantalla.
- Sesgos heredados del modelo base y de los datasets de demostración (AndroidControl, GUI-Odyssey, AMEX, ScreenQA), que no representan toda la diversidad de apps, idiomas ni culturas de uso.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (MIT/Apache) y se hereda del modelo base.
- Estado experimental con evaluación incompleta: no debe considerarse un modelo listo para producción.
- Solo se publican pesos en safetensors y GGUF 4-bit; no hay información sobre soporte en vLLM, TGI u otros servidores de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1
- Versión GGUF 4-bit: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Adaptador LoRA: carpeta `lora_adapter/` del repositorio
- AndroidWorld (benchmark): no disponible en la información proporcionada
- MobileWorld (benchmark): no disponible en la información proporcionada
