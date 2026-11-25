# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E

## Resumen

LFM3-VL-2B-MobileAgent-v4.6-E es un ajuste fino (fine-tuning) de tipo LoRA SFT sobre el modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines dentro del proyecto abierto LFM3 Mobile Agent. El modelo está especializado en actuar como agente de interfaz gráfica para Android: recibe una captura de pantalla y un historial textual de pasos previos, y emite una única acción en formato JSON compacto sobre una rejilla de coordenadas 0-1000. Resuelve el problema concreto de la automatización de tareas en dispositivos móviles mediante agentes que operan exclusivamente a partir de píxeles, sin acceso a la jerarquía de vistas ni a APIs del sistema.

La relevancia de esta versión (ronda 8 del proyecto) radica en su foco en la detección de finalización de tareas: la versión anterior (v4.5-D) juzgaba la compleción a partir del texto de su propio historial en lugar de la pantalla. La v4.6-E introduce filas contrafactuales donde historial y pantalla discrepan, elimina etiquetas `complete` que dos jueces de visión consideran visiblemente incorrectas y recalcula las notas de "[no visible change]" con una regla más estricta.

El modelo tiene 1.918.181.888 parámetros (aproximadamente 2B) y se distribuye en safetensors con el adaptador LoRA incluido en el subdirectorio `lora_adapter/`. El autor lo marca explícitamente como **no promocionado**: falló dos de las diez comprobaciones de la puerta offline preregistrada de la ronda, por lo que el modelo evaluado de referencia sigue siendo la v4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) LFM3-VL, ajuste LoRA SFT con torre de visión congelada |
| Parametros totales | 1.918.181.888 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de historial limitada a los últimos 24 pasos de texto) |
| Tipos de cuantizacion | GGUF Q4_K_M (con proyector de visión) en el repo hermano `-GGUF` |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (transformers), GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un transformer multimodal que procesa una captura de pantalla redimensionada a un máximo de 880 × 880 píxeles de área junto con texto. El ajuste se realizó mediante LoRA SFT de rango 64 y alpha 128 aplicado únicamente al modelo de lenguaje, manteniendo congelada la torre de visión; el adaptador se fusionó en los pesos finales y se conserva también en `lora_adapter/`. El entrenamiento consistió en una pasada única de 5.802 pasos × 32 filas con tasa de aprendizaje 2e-4 y decaimiento coseno, ejecutado primero en una A100 de Colab hasta el paso 3.100 y luego reanudado desde el checkpoint del Hub en una H100 (Modal).

Los datos provienen del dataset MobileAgent-SFT-v4.6 (commit `0ace5559`, 185.643 filas). La innovación principal de esta ronda es el tratamiento de la señal de finalización: se añaden filas contrafactuales donde el historial textual y la pantalla discrepan, se descartan etiquetas `complete` refutadas por dos jueces de visión y se recalcula la nota `[no visible change]` con una regla más estricta (comparación en escala de grises 360 × 800 con barras de estado y navegación enmascaradas y umbral de diferencia superior al 0,02 % de píxeles). El formato de entrada incluye `Goal:`, `Installed apps:`, `Previous steps:` (últimos 24 pasos) y `What is the next action?`; la salida es `<think>intención breve</think>` seguido de una acción JSON compacta.

## Capacidades

- Generación de acciones de interfaz de usuario a partir de capturas de pantalla de Android, en formato JSON sobre rejilla 0-1000.
- Razonamiento breve encapsulado en etiquetas `<think>` antes de cada acción.
- Memoria de contexto basada en los últimos 24 pasos textuales del historial.
- Detección de finalización de tareas (`complete`) contrastando historial y estado visual de la pantalla.
- Anotación y uso de notas de "[no visible change]" para evitar taps redundantes.
- Comprensión de objetivos en inglés y listado de aplicaciones instaladas.
- Capacidad de operar en modo solo-captura (sin jerarquía de vistas ni APIs del sistema).
- No dispone de soporte documentado de tool calling genérico, audio ni otras modalidades más allá de imagen-texto.

## Casos de uso

- Investigación en agentes GUI móviles: sirve como punto de comparación reproducible en experimentos de automatización Android, con un harness documentado (`--history_steps 24 --nochange_notes --change_rule fine`) que garantiza condiciones idénticas entre ejecuciones.
- Evaluación de detección de finalización: útil para estudiar el fenómeno de los falsos `complete` y las tareas multiparte, ya que el modelo incorpora métricas específicas de este fallo (20,0 % en pantalla inacabada con historial que afirma haber terminado).
- Pruebas de bucle de agente con memoria corta: su ventana de 24 pasos permite experimentar con políticas de resumen de historial y con la regla de notas de cambio en entornos controlados.
- Benchmarking de modelos 2B multimodales en tareas de percepción de pantalla: los resultados de AndroidControl, AndroidLens, MemGUI y MobileJudgeBench permiten situarlo frente a alternativas del mismo tamaño.
- Desarrollo y depuración de harness de evaluación: el modelo y su GGUF asociado (Q4_K_M) facilitan ejecuciones locales en emulador de Mac, útiles para validar pipelines antes de lanzar campañas a mayor escala.
- Docencia y divulgación sobre agentes móviles: al ser un modelo pequeño (2B) y con licencia abierta, permite demostrar el ciclo completo captura-decisión-acción en hardware asequible.
- Análisis de sesgos de autoinforme: su comportamiento documentado (tasa de falsos `complete` del 45,0 % en MobileJudgeBench) lo convierte en un caso de estudio sobre la fiabilidad de los juicios de finalización emitidos por el propio agente.

## Benchmarks y rendimiento

Evaluación offline en transformers bf16, decodificación greedy, cada modelo con su propio formato de prompt.

| Métrica | v4 | v4.5-D | v4.6-E | Umbral de puerta |
|---|---|---|---|---|
| AndroidControl test, precisión de paso de alto nivel | 0,727 | 0,753 | 0,758 | ≥ 0,707 |
| `dev_answer` / `dev_complete` | 0,890 / 0,763 | 0,882 / 0,800 | 0,882 / 0,775 | ≥ 0,840 / ≥ 0,713 |
| AndroidLens, precisión de paso en pasos ≥ 10 | 0,367 | 0,471 | 0,462 | ≥ 0,367 |
| AndroidControl: `status` ≥ 2 pasos antes del final | 2,74 % | 3,64 % | 3,55 % | ≤ 3,24 % (falla) |
| Pantalla inacabada, historial afirma todos los pasos: dice `complete` | 40,3 % | 53,7 % | 20,0 % | ≤ 15 % (falla) |
| Pantalla antes del último tap, tap con nota "no change": dice `complete` | — | 32,0 % | 0,3 % | ≤ 10 % |
| Pantalla antes del último tap, sin nota: dice `complete` | 31,3 % | 37,0 % | 16,7 % | ≤ 20 % |
| Pantalla terminada: dice `complete` | 73,7 % | 84,3 % | 78,0 % | ≥ 70 % |
| Pantalla terminada, últimos 2 pasos cortados del historial: dice `complete` | 38,7 % | 54,3 % | 71,0 % | ≥ 60 % |
| MemGUI dev, precisión de paso | 0,421 | 0,697 | 0,676 | — |
| MobileJudgeBench: dice terminado donde otro agente lo afirmó y humanos juzgaron fallo (131 ejecuciones) | 45,0 % | 60,3 % | 45,0 % | — |

Ejecución exploratoria en AndroidWorld (semilla 30, 116 tareas, GGUF 4 bits en emulador de Mac; no forma parte de la puerta):

| Métrica | v4 | v4.5-D | v4.6-E |
|---|---|---|---|
| Éxitos | 18 | 21 | 19 |
| Falsos `complete` | 25 | 27 | 24 |
| Proporción de pasos dedicados a esperar | 29,1 % | 16,9 % | 3,5 % |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4 GB solo para pesos (1,918 mil millones de parámetros × 2 bytes), más overhead de activaciones y del proyector de visión; el repositorio ocupa 4,1 GB.
- Cuantización Q4_K_M (GGUF con proyector de visión): permite ejecución en hardware de consumo, como se documenta en la ejecución exploratoria sobre emulador de Mac.
- GPU recomendadas: A100 y H100 se usaron para el entrenamiento; para inferencia basta una GPU de consumo moderna con al menos 6-8 GB de VRAM en cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización Q4_K_M y presumiblemente en Q8/bf16 en tarjetas con 8 GB o más.
- Opciones de despliegue: transformers (formato original con `trust_remote_code` por el tag `custom_code`), llama.cpp/Ollama mediante el repo GGUF asociado; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.6-E | ~2B | no disponible (historial de 24 pasos) | Agente GUI Android solo-captura | LFM Open License v1.0 | No promocionado (falla 2/10 puertas) |
| LFM3-VL-2B-MobileAgent-v4 | ~2B | no disponible | Agente GUI Android solo-captura | LFM Open License v1.0 | Modelo evaluado de referencia |
| LFM3-VL-2B-MobileAgent-v4.5-D | ~2B | no disponible | Agente GUI Android solo-captura | LFM Open License v1.0 | Versión intermedia de la ronda 7 |
| LiquidAI/LFM3-VL-2B | ~2B | no disponible | Modelo base multimodal visión-lenguaje | LFM Open License v1.0 | Modelo base |

La comparación se limita a las variantes de la misma familia porque la información disponible no incluye datos de modelos de otros autores con la misma tarea y tamaño.

## Limitaciones y advertencias

- Modelo de investigación no promocionado: no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Falla dos comprobaciones de la puerta offline: `status` ≥ 2 pasos antes del final (3,55 % frente a ≤ 3,24 %) y pantalla inacabada con historial que afirma haber terminado (20,0 % frente a ≤ 15 %).
- Se detiene demasiado pronto en tareas de varias partes y puede repetir un tap que no produce efecto.
- Tasa de falsos `complete` en MobileJudgeBench del 45,0 %, idéntica a la de la v4, lo que indica que la mejora en detección de finalización no se traslada a todos los escenarios.
- Idiomas: solo inglés; los objetivos en otros idiomas no están soportados.
- Entrada limitada a una captura por paso y a un historial textual de 24 pasos; no hay memoria visual más allá de la pantalla actual.
- Requiere replicar exactamente el formato de prompt, la ventana de historial y la regla de notas de cambio para reproducir los resultados; desviarse de este formato degrada el comportamiento.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de cualquier uso comercial, ya que se trata de una licencia "other" heredada del modelo base.
- Riesgo de alucinación en la interpretación de la pantalla y en la estimación de coordenadas, dado el tamaño reducido del modelo (2B).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E
- Repositorio GGUF Q4_K_M: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v4.6
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo evaluado de referencia (v4): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Versión anterior (v4.5-D): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D
- Proyecto LFM3 Mobile Agent: https://github.com/experimentalmachines/lfm3-mobile-agent
- Preregistro de la ronda 8: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v46.md
- Preregistro de la ronda 10: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/PREREG_v48.md
