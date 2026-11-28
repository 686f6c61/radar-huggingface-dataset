# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1

## Resumen

LFM3-VL-2B-AndroidAgent-v4.1 (nombre actual en la model card: `LFM3-VL-2B-MobileAgent-Dev-WaitRelabel`) es un modelo de 1.918.181.888 parámetros (~1,92 mil millones) derivado de LiquidAI/LFM3-VL-2B mediante un fine-tuning con LoRA SFT. Lo publica el usuario alpharomercoma (organización ExperimentalMachines) y su propósito es actuar como agente de interfaz gráfica (GUI agent) sobre Android: recibe una captura de pantalla por paso y emite una única acción en JSON para operar el teléfono.

El modelo parte de la familia LFM3-VL de Liquid AI, un modelo multimodal image-text-to-text que combina un codificador visual con un modelo de lenguaje. El autor lo adapta al dominio de automatización móvil con datos de AndroidControl, GUI-Odyssey, AMEX y ScreenQA, y lo presenta explícitamente como un modelo de desarrollo experimental, no recomendado para producción y superado por versiones posteriores de la misma línea.

Su relevancia es acotada pero concreta: demuestra un flujo de trabajo reproducible de fine-tuning multimodal para agentes móviles, con receta, datos, benchmarks y código publicados, sobre una base de solo 2B parámetros que puede ejecutarse en formato GGUF de 4 bits. Está pensado para investigación en agentes de GUI, no para uso real desatendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) sobre LFM3-VL-2B; fine-tuning LoRA SFT con torre visual congelada |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la entrada incluye historial de los últimos 8 pasos; no se especifica ventana de tokens) |
| Tipos de cuantizacion | GGUF de 4 bits (versión publicada por el autor); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B; etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/`; GGUF de 4 bits en repositorio aparte |
| Tamaño del repositorio | 4,1 GB |
| Pipeline | image-text-to-text |
| Modelo base | LiquidAI/LFM3-VL-2B (commit `23387be`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal construido sobre LFM3-VL-2B: un codificador de visión que procesa la captura de pantalla y un modelo de lenguaje que genera la siguiente acción. El fine-tuning se realizó con LoRA SFT de rango 64 y alpha 128 aplicado únicamente al modelo de lenguaje, con la torre visual congelada; el adaptador se fusionó en los pesos finales y también se conserva en `lora_adapter/`. La imagen se redimensiona a un máximo de 880 × 880 px de área, lo que equivale aproximadamente a 720 tokens de imagen.

El entrenamiento consistió en 1.250 pasos × 32 filas (0,43 épocas sobre 92.229 filas), con learning rate 2e-4, en una única A100, usando la misma receta, filas y orden de filas que el modelo Main del que deriva. Los datos provienen de AndroidControl, GUI-Odyssey, AMEX y ScreenQA. Respecto a Main, se introducen dos cambios solo en el texto de entrenamiento: reetiquetado de intenciones `wait` (4.104 objetivos y 13.145 líneas de historial, para corregir el sesgo de copiar la intención anterior y esperar) y aumento de historial de recuperación (5.244 filas con un paso extra de historial). No se documenta RLHF ni DPO.

## Capacidades

- Generación de acciones de agente móvil: emite un JSON compacto con `action_type` entre click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status.
- Coordenadas normalizadas en una rejilla entera de 0–1000 sobre la captura de pantalla.
- Modo de razonamiento corto: produce `` seguido de la acción, con decodificación a temperatura 0.
- Comprensión de capturas de pantalla de Android (entrada image-text-to-text).
- Seguimiento de objetivos y apps instaladas proporcionados en el prompt de usuario.
- Uso de historial de los últimos 8 pasos en formato `n. <intent> -> <action JSON>`.
- Respuesta a preguntas del objetivo mediante la acción `answer` y cierre de tareas con `status` (`complete`/`infeasible`).
- Capacidades generales heredadas del modelo base (conocimiento general medido en MMStar y MMLU), aunque no son el foco del fine-tuning.
- No se documenta soporte de tool calling genérico, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Investigación en agentes de GUI móvil: reproducción de experimentos sobre AndroidWorld y AndroidControl con la receta y los datos publicados, útil para estudiar fallos como los bucles de `wait`.
- Evaluación comparativa de estrategias de fine-tuning: el par Main/WaitRelabel permite medir el efecto de reetiquetar intenciones y aumentar el historial de recuperación sobre un mismo conjunto de datos.
- Automatización de pruebas de aplicaciones Android en entornos controlados: el modelo puede generar secuencias de acciones sobre emuladores para validar flujos de UI, siempre con supervisión.
- Generación de datos sintéticos de trayectorias: usar las acciones predichas como borradores para construir datasets de agente, dado que el autor ya emplea entrenamiento sobre las propias salidas en versiones posteriores.
- Estudio de razonamiento de corto alcance en modelos pequeños: el formato `` más JSON permite analizar cómo un modelo de 2B planifica un paso con contexto visual.
- Despliegue ligero en local para demos: la versión GGUF de 4 bits permite ejecutar el modelo en hardware de consumo para prototipos de agente móvil sin infraestructura de servidor.
- Análisis de sesgos en agentes: comparar las tasas de éxito en AndroidWorld y MobileWorld para identificar patrones de bloqueo o acciones repetidas.

## Benchmarks y rendimiento

Resultados publicados por el autor (una ejecución por benchmark, temperatura 0, GGUF de 4 bits; las excepciones cuentan como fallos):

| Benchmark | WaitRelabel | Main | Diferencia pareada |
|---|---|---|---|
| AndroidWorld, seed 30 (116 tareas, desarrollo) | 12 (14 con protecciones anti-bucle) | 18 | +2 / −8 |
| AndroidControl test, precisión de paso high-level | 0,732 | 0,728 | — |
| AndroidControl test, precisión de paso low-level | 0,895 | 0,908 | — |
| MMStar (conocimiento general) | 55,6 % | 52,9 % | — |
| MMLU (conocimiento general) | 51,1 % | 50,4 % | — |

El autor indica que el modelo es peor que Main en línea y que fue superado por OwnHistory (18/116 en AndroidWorld y 8/105 en MobileWorld, frente a 6/105 de Main). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~1,92 B parámetros, la versión GGUF de 4 bits debería situarse en el rango de 1,5–2,5 GB de pesos, más el coste del codificador visual y del contexto de imagen (~720 tokens por captura).
- GPU recomendadas: el entrenamiento se realizó en una única A100; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: el autor publica una versión GGUF de 4 bits pensada para ejecución ligera, lo que sugiere viabilidad en GPU de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: transformers (librería indicada), con pesos safetensors y adaptador LoRA; versión GGUF de 4 bits para runners compatibles. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.1 (WaitRelabel) | ~1,92 B | No disponible | Agente GUI Android, 1 captura por paso | LFM Open License v1.0 | Hugging Face (este repo) + GGUF |
| LFM3-VL-2B-MobileAgent (Main) | ~1,92 B | No disponible | Agente GUI Android, receta base | LFM Open License v1.0 | Hugging Face (experimentalmachines) |
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | ~1,92 B | No disponible | Agente GUI Android con entrenamiento sobre salidas propias | LFM Open License v1.0 | Hugging Face (experimentalmachines) |
| LiquidAI/LFM3-VL-2B (base) | ~1,92 B | No disponible | Modelo multimodal general image-text-to-text | LFM Open License v1.0 | Hugging Face (LiquidAI) |

No se dispone de datos de benchmarks de los modelos comparables distintos de los ya mostrados en la tabla de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de no dejarlo actuar sin supervisión en un teléfono con cuentas, mensajes o pagos reales.
- Estado de desarrollo: no recomendado; superado por OwnHistory (12/116 frente a 18 de Main en AndroidWorld seed 30).
- Solo admite objetivos en inglés.
- Una única captura de pantalla por paso y sin memoria más allá del historial de texto de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca ha interactuado con un teléfono real durante el entrenamiento.
- Tendencia documentada a bucles de `wait`, que motivó precisamente esta versión, aunque el resultado en línea empeoró respecto a Main.
- Riesgo de alucinación en la interpretación de la pantalla y en la elección de coordenadas o apps instaladas.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que se etiqueta como "other" y no como licencia permisiva estándar.
- Sin datos publicados sobre sesgos específicos ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Versión GGUF de 4 bits: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF
- Modelo Main (recomendado por el autor): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Sucesor OwnHistory: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guía de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
