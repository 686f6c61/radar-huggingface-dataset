# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-C

## Resumen

LFM3-VL-2B-MobileAgent-v4.4-C es un modelo de visión-lenguaje de aproximadamente 1.918 millones de parámetros (2B) desarrollado por experimentalmachines, afinado específicamente para actuar como agente de interfaz gráfica en Android. Se trata de un derivado del modelo base LiquidAI/LFM3-VL-2B, sobre el que se ha aplicado un ajuste supervisado con LoRA para que, dada una captura de pantalla y un objetivo en lenguaje natural, emita una única acción JSON ejecutable sobre el dispositivo. El modelo forma parte de la ronda 6 del proyecto LFM3 Mobile Agent.

La arquitectura es la del LFM3-VL de LiquidAI (transformer multimodal con torre de visión), con la torre de visión congelada durante el ajuste. El modelo consume una imagen por paso, redimensionada a un máximo de 880 × 880 píxeles de área, junto con el objetivo, la lista de aplicaciones instaladas y los últimos 8 pasos, y produce un bloque `<think>` seguido de una acción compacta en una rejilla normalizada 0-1000.

Es relevante como ejemplo de agente móvil de bajo coste computacional: cabe en una sola GPU A100 para entrenamiento y puede ejecutarse en hardware de consumo. No obstante, el propio autor indica explícitamente que el modelo **no ha sido promovido**: falló una de las comprobaciones del gate offline pre-registrado (paradas prematuras en pasos tardíos de AndroidControl) y no se ejecutó en línea. El modelo evaluado de referencia sigue siendo la versión v4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL) con torre de visión; ajuste LoRA sobre pesos fusionados |
| Parametros totales | 1.918.181.888 (~1,92B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de texto limitado a los últimos 8 pasos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (adaptador LoRA incluido en `lora_adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de experimentalmachines/LFM3-VL-2B-MobileAgent-v4, un transformer multimodal con torre de visión. Sobre ellos se aplicó un ajuste supervisado con LoRA de rango 64 y alpha 128, manteniendo la torre de visión congelada. El adaptador resultante se fusionó en los pesos finales y se conserva también en `lora_adapter/`. El entrenamiento consistió en 500 pasos con 32 filas por paso, tasa de aprendizaje 1e-4 con calentamiento, fase estable y decaimiento corto, ejecutado en una única A100.

Los datos de entrenamiento combinan MobileAgent-SFT-v4 (commit `3375539`) y MobileAgent-SFT-v4.4 (commit `2b481ae3`), con un 50% de filas de MemGUI (MemGUI-3K, filtradas para excluir aplicaciones de AndroidWorld, MobileWorld y AndroidLab) y un 50% de filas de v4. El objetivo de la ronda era mejorar la precisión en tareas largas y la detención en el paso final real. No se documenta en la información disponible el uso de RLHF o DPO; el método descrito es SFT con LoRA. Tampoco se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de acciones de agente móvil en formato JSON compacto sobre una rejilla normalizada 0-1000.
- Comprensión de capturas de pantalla de Android (una por paso) para localizar elementos de interfaz.
- Razonamiento de intención breve mediante el bloque `<think>` antes de cada acción.
- Acciones soportadas: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Gestión de objetivos con finalización explícita (`complete` / `infeasible`) y respuesta a preguntas mediante la acción `answer`.
- Uso de historial textual de los últimos 8 pasos para mantener coherencia multi-paso.
- Capacidad multilingüe: limitada al inglés según la model card.
- No soporta tool calling genérico ni function calling fuera del esquema de acciones definido; no se documentan capacidades de audio.

## Casos de uso

- Automatización de tareas repetitivas en Android: el modelo puede ejecutar secuencias como abrir una aplicación, navegar por menús y rellenar campos, emitiendo una acción por paso a partir de la captura de pantalla.
- Evaluación de agentes de interfaz en investigación: sirve como referencia de bajo coste para comparar estrategias de parada y precisión en pasos largos, dado que el autor publica resultados por paso y gates pre-registrados.
- Generación de datos sintéticos de interacción móvil: sus trayectorias JSON etiquetadas pueden usarse para ampliar datasets de entrenamiento de otros agentes, siempre con revisión humana.
- Pruebas de regresión de interfaces Android: el modelo puede recorrerse flujos de una app en entornos de staging para detectar pantallas rotas o elementos no localizables.
- Asistencia a usuarios con movilidad reducida en tareas guiadas: con supervisión, podría sugerir el siguiente paso en una secuencia (por ejemplo, activar un ajuste), aunque el autor desaconseja el uso desatendido.
- Investigación sobre parada temprana y calibración de agentes: los datos de `status` y `complete` en pasos tardíos permiten estudiar cuándo un agente decide terminar una tarea.
- Prototipado de pipelines de agente móvil en local: al ser un modelo de ~1,9B, puede integrarse en entornos de desarrollo con una sola GPU para iterar sobre prompts y esquemas de acción.

## Benchmarks y rendimiento

Resultados offline publicados por el autor (Transformers en bf16, decodificación greedy, mismos splits pre-renderizados para v4 y candidatos):

| Métrica | v4.4-C | v4 | Umbral del gate |
|---|---|---|---|
| AndroidControl test, precisión de paso de alto nivel | 0,724 | 0,727 | ≥ 0,707 |
| `dev_answer` / `dev_complete` | 0,875 / 0,788 | 0,890 / 0,763 | ≥ 0,840 / ≥ 0,713 |
| AndroidControl pasos ≥ 4: `status` predicho | 9,8% | 9,0% | ≤ 6,0% |
| AndroidLens precisión de paso en pasos ≥ 10 | 0,413 | 0,367 | ≥ 0,347 |
| AndroidLens precisión de paso, todos los pasos | 0,444 | 0,414 | — |
| AndroidLens `complete` en el último paso real | 47,7% | 12,2% | — |
| MemGUI dev precisión de paso | 0,698 | 0,421 | — |

El modelo mejora la precisión en tareas largas y la detención en el final real de tareas largas, pero no corrige las paradas prematuras en pasos tardíos de AndroidControl (9,8% frente al umbral del 6,0%), motivo por el que no fue promovido. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1,9B en bf16 se sitúa en torno a 4 GB de pesos, más el coste de la torre de visión y del procesamiento de imágenes (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una única A100; para inferencia cabe en GPUs de consumo con suficiente VRAM, aunque no se documentan configuraciones probadas.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más en bf16/fp16; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.4-C | ~1,92B | no disponible (historial de 8 pasos) | Agente Android por captura de pantalla | LFM Open License v1.0 | No promovido |
| LFM3-VL-2B-MobileAgent-v4 | ~1,92B (mismo base) | no disponible | Agente Android por captura de pantalla | LFM Open License v1.0 | Modelo evaluado de referencia |
| LiquidAI/LFM3-VL-2B | ~2B | no disponible | Modelo base visión-lenguaje | LFM Open License v1.0 | Base pública |

No se dispone en la información proporcionada de comparaciones con otros agentes móviles (por ejemplo, modelos específicos de AndroidWorld o MobileWorld), por lo que la comparativa se limita a la familia LFM3-VL.

## Limitaciones y advertencias

- Modelo de investigación no promovido: el autor desaconseja explícitamente dejarlo actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- No se ejecutó en AndroidWorld ni MobileWorld; los resultados se limitan a evaluaciones offline (AndroidControl, AndroidLens, MemGUI).
- Paradas prematuras: el 9,8% de los pasos ≥ 4 en AndroidControl predicen `status` antes de tiempo, por encima del umbral del 6,0%; aproximadamente la mitad ocurren un paso antes del final.
- Idiomas: solo inglés; no se documenta soporte de otros idiomas.
- Memoria: sin memoria más allá del historial textual de los últimos 8 pasos; una captura por paso.
- Riesgo de alucinación en la localización de elementos y en la elección de acciones, inherente a los agentes de interfaz; requiere validación y sandboxing.
- Licencia LFM Open License v1.0: es necesario revisar los términos para uso comercial, ya que la model card la etiqueta como `other` y remite al archivo LICENSE del modelo base.
- No se publica formato de teléfono ni pesos cuantizados, lo que limita el despliegue en entornos de producción con requisitos de eficiencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.4-C
- Modelo base (v4): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Dataset MobileAgent-SFT-v4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4
- Dataset MobileAgent-SFT-v4.4: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4.4
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro de la ronda 6: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v44.md
- Licencia: LICENSE en el repositorio del modelo
