# experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1

## Resumen

LFM2.5-VL-450M-MobileAgent-v1 es un ajuste fino (LoRA SFT fusionado) del modelo vision-lenguaje LiquidAI/LFM2.5-VL-450M, desarrollado por el usuario experimentalmachines. Su propósito es actuar como agente de uso de telefonía Android: recibe una captura de pantalla y un objetivo en lenguaje natural, y emite una única acción JSON (clic, scroll, escritura de texto, apertura de app, etc.) con coordenadas normalizadas en una rejilla de 0 a 1000. Resuelve el problema del control de interfaces móviles mediante modelos pequeños que puedan ejecutarse en el propio dispositivo.

El modelo tiene 448.718.848 parámetros (aproximadamente 450M) y se distribuye en formato safetensors con la librería transformers, además de una variante GGUF de 4 bits para su uso en teléfono. Se entrenó sobre el dataset AndroidControl (48.000 filas) más 12.000 filas de replay general de imagen-texto para preservar conocimiento general, mediante LoRA de rango 16 y alpha 32, con una época y 1.875 pasos.

Es relevante ahora porque forma parte de una línea de trabajo que compara modelos base de distinto tamaño para agentes móviles (el modelo principal del proyecto es LFM3-VL-2B-MobileAgent-v4), y porque demuestra que un modelo de 450M puede alcanzar precisión de paso baja pero funcional en AndroidControl. El autor lo califica explícitamente como modelo de comparación y advierte que es demasiado pequeño para tareas móviles de múltiples pasos con esta receta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm2_vl) |
| Parámetros totales | 448.718.848 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (GGUF publicado); el adaptador LoRA se entrenó en precisión completa y se fusionó |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/`; GGUF de 4 bits en repo separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-450M, un transformer multimodal de tipo image-text-to-text con arquitectura `lfm2_vl`, que procesa una captura de pantalla por paso junto con texto de contexto. El ajuste se realizó mediante LoRA SFT con rango 16 y alpha 32, tasa de aprendizaje 1e-4 y una sola época: 1.875 pasos con lotes de 32 filas, sobre 48.000 filas de AndroidControl más 12.000 filas de replay general de imagen-texto para proteger el conocimiento general del modelo base. El adaptador resultante se fusionó en los pesos finales y se conserva en `lora_adapter/`.

La innovación principal no está en la arquitectura sino en el formato de interacción: el modelo recibe el objetivo (`Goal: …`), los últimos 8 pasos como texto (`n. <intent> -> <action JSON>`) y la captura actual, y produce un bloque `<think>intención corta</think>` seguido de una única acción JSON compacta con coordenadas enteras en una rejilla 0-1000. La decodificación se realiza con modo thinking activado y temperatura 0. El prompt de sistema define un conjunto cerrado de acciones: click, long_press, input_text, scroll, open_app, navigate_back, navigate_home, keyboard_enter, wait, answer y status (complete/infeasible).

## Capacidades

- Generación de acciones de agente móvil en formato JSON estructurado a partir de capturas de pantalla de Android.
- Comprensión de imágenes (screenshot) combinada con texto de objetivo e historial de pasos.
- Modo thinking: emite una intención breve antes de la acción.
- Soporte de un conjunto cerrado de acciones de GUI: clic, pulsación larga, entrada de texto, scroll direccional, apertura de apps, navegación atrás/inicio, enter de teclado, espera, respuesta a preguntas sobre la pantalla y marcado de estado de tarea.
- Capacidad de responder preguntas sobre el contenido de la pantalla mediante la acción `answer`.
- Capacidad de declarar una tarea como completada o infactible mediante la acción `status`.
- Multilingüe: no disponible; solo se declara inglés.
- Tool calling / function calling genérico: no disponible (el modelo emite acciones de GUI, no llamadas a herramientas arbitrarias).
- Razonamiento multi-paso: limitado, con memoria únicamente de los últimos 8 pasos en texto.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede generar secuencias de acciones a partir de capturas para validar flujos de aplicación en pipelines de CI, usando la variante GGUF de 4 bits para ejecución ligera.
- Asistente de accesibilidad en dispositivo: al ser un modelo de 450M, puede desplegarse en el propio teléfono para sugerir la siguiente acción a un usuario con dificultades motoras, con confirmación humana antes de ejecutar.
- Investigación en agentes de GUI: sirve como modelo de comparación de bajo coste para estudiar la relación entre tamaño del modelo base y precisión de paso en AndroidControl, tal como declara el autor.
- Generación de datos sintéticos de interacción móvil: las acciones JSON producidas pueden usarse para aumentar datasets de entrenamiento de agentes, filtrando por precisión de paso alta (0,862 en bajo nivel).
- Extracción de intención y acción desde capturas: el bloque `<think>` permite auditar la intención del modelo antes de la acción, útil en sistemas de registro y depuración de agentes.
- Respuesta a preguntas sobre pantallas concretas: mediante la acción `answer`, puede emplearse para describir o localizar elementos en una captura sin ejecutar interacciones.
- Evaluación comparativa de recetas de ajuste: al compartir datos con LFM3-VL-2B v1, permite aislar el efecto del modelo base en el rendimiento final del agente.

## Benchmarks y rendimiento

| Benchmark | LFM2.5-VL-450M-MobileAgent-v1 | Modelo base |
|---|---|---|
| AndroidWorld seed 30 (116 tareas, desarrollo) | 2 | 0 |
| AndroidControl test, precisión de paso alto/bajo nivel | 0,536 / 0,862 | no disponible |
| Terminal `complete` accuracy | 0,561 | no disponible |
| MMStar / MMLU | 39,3% / 39,2% | no disponible |
| Apple M5 GPU, mediana de segundos por paso | 1,14 | 2,21 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 448,7M parámetros, en FP16 requiere aproximadamente 0,9 GB de pesos, y en 4 bits alrededor de 0,25 GB, más overhead de activaciones y del procesador de visión.
- GPU recomendadas: no disponible; el autor reporta mediciones en GPU Apple M5.
- Cabe en GPU de consumo: sí, por tamaño; el autor publica una variante GGUF de 4 bits orientada a teléfono.
- Opciones de despliegue: transformers (librería declarada), GGUF de 4 bits para inferencia cuantizada; vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: mediana de 1,14 segundos por paso en GPU Apple M5, frente a 2,21 segundos del modelo base. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-MobileAgent-v1 | 448,7M | no disponible | AndroidControl 0,536 / 0,862; AndroidWorld 2/116 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM2.5-VL-450M (base) | no disponible | no disponible | AndroidWorld 0/116; 2,21 s/paso en M5 | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-v4 | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe dejarse actuar sin supervisión en un teléfono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en inglés y una captura por paso; no hay memoria más allá de los 8 pasos de historial en texto.
- Entrenado únicamente con demostraciones grabadas; nunca ha interactuado con un teléfono real durante el entrenamiento.
- El propio autor indica que es demasiado pequeño para tareas móviles de múltiples pasos con esta receta.
- Rendimiento bajo en AndroidWorld (2 de 116 tareas), lo que limita su uso en flujos largos y autónomos.
- Riesgo de alucinación en la localización de elementos y en la generación de coordenadas sobre la rejilla 0-1000.
- Licencia LFM Open License v1.0 heredada del modelo base; deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de cualquier despliegue productivo.
- Idiomas: solo inglés declarado; no hay soporte verificado de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con historiales largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Variante GGUF 4 bits: https://huggingface.co/experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v1
- Modelo principal del proyecto: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: https://huggingface.co/experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1/blob/main/LICENSE
