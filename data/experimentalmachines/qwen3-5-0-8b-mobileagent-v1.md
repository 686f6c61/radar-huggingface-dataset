# experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1

## Resumen

Qwen3.5-0.8B-MobileAgent-v1 es un ajuste fino (LoRA SFT fusionado) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario experimentalmachines. Está especializado en actuar como agente de interfaz gráfica (GUI agent) sobre Android: recibe una captura de pantalla y un objetivo en lenguaje natural, y emite una única acción siguiente en formato JSON (clic, scroll, entrada de texto, apertura de app, etc.). El modelo resuelve el problema del control de dispositivos móviles mediante instrucciones en lenguaje natural, un área donde los modelos pequeños multimodales son escasos.

Se trata de un modelo de comparación dentro de un proyecto mayor cuyo modelo principal es LFM3-VL-2B-MobileAgent-v4. El autor lo entrenó con la misma receta y los mismos datos para aislar el efecto del modelo base. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y una ventana de contexto no especificada en la información disponible, es un modelo deliberadamente compacto, pensado para inferencia en hardware modesto, incluido un Apple M5.

Su relevancia radica en que demuestra que un modelo por debajo de los mil millones de parámetros puede ejecutar tareas de agente móvil con precisión razonable (0,694 de precisión de paso de alto nivel en AndroidControl), lo que abre la puerta a agentes on-device. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial, aunque el autor lo etiqueta explícitamente como modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos de la arquitectura Qwen3.5 no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de 4 bits disponible en repositorio aparte; safetensors en el repo principal |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (modelo fusionado) y adaptador LoRA en `lora_adapter/`; GGUF 4-bit en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de tipo image-text-to-text. Sobre él se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 16 y alpha 32, tasa de aprendizaje 1e-4 y una sola época. El entrenamiento consistió en 1.875 pasos con lotes de 32 filas, sobre un total de 48.000 filas de AndroidControl más 12.000 filas de repetición general de imagen-texto destinadas a preservar el conocimiento general del modelo base. El adaptador resultante se fusionó en los pesos finales y también se conserva por separado en `lora_adapter/`.

Los datos provienen del dataset MobileAgent-SFT-v1 (AndroidControl). El modelo nunca interactuó con un teléfono real durante el entrenamiento: aprendió únicamente de demostraciones grabadas. La entrada es una captura de pantalla por paso, redimensionada a un máximo de 880 × 880 píxeles de área (unos 720 tokens de imagen), junto con el objetivo y los últimos 8 pasos en texto. La salida es un bloque `<think>` con la intención seguida de una única acción JSON compacta, con coordenadas enteras en una rejilla de 0 a 1000. La decodificación recomendada es con thinking activado y temperatura 0.

## Capacidades

- Control de interfaz Android: emite acciones de clic, pulsación larga, entrada de texto, scroll direccional, apertura de app, navegación atrás/inicio, tecla enter, espera, respuesta a preguntas sobre la pantalla y marcado de estado (completo o infactible).
- Comprensión de capturas de pantalla: interpreta la imagen del dispositivo para localizar elementos y planificar la acción siguiente.
- Razonamiento de un paso con modo thinking: genera una intención breve en `<think>` antes de la acción JSON.
- Memoria de corto plazo textual: incorpora los últimos 8 pasos como historial en el prompt.
- Respuesta a preguntas sobre el contenido de la pantalla mediante la acción `answer`.
- Detección de tareas infactibles mediante la acción `status` con `goal_status: infeasible`.
- Capacidades generales de imagen-texto y conocimiento general preservadas parcialmente gracias a las filas de repetición (MMStar 48,9 %, MMLU 45,2 %).
- No soporta tool calling genérico ni function calling fuera del esquema de acciones propio; no hay soporte de audio ni de agentes multi-paso autónomos más allá del bucle de 8 pasos.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones a partir de objetivos en lenguaje natural para validar flujos de UI en pipelines de CI, usando la captura de pantalla como entrada y el JSON como salida verificable.
- Agentes on-device de bajo consumo: con 0,85 mil millones de parámetros y una versión GGUF de 4 bits, puede ejecutarse en hardware móvil o en un Apple M5 (2,00 s por paso de mediana) para asistentes locales que no envían capturas a la nube.
- Investigación en agentes GUI: sirve como línea base reproducible para comparar recetas de entrenamiento y modelos base, dado que comparte datos y receta con LFM3-VL-2B-MobileAgent-v4.
- Generación de datos sintéticos de interacción: las acciones JSON emitidas pueden usarse para anotar o aumentar datasets de control de dispositivos.
- Asistencia a usuarios con dificultades de accesibilidad: interpretar la pantalla y proponer la siguiente acción (con supervisión humana) para guiar a personas con problemas de visión o motricidad.
- Evaluación de robustez multimodal: al ser un modelo pequeño con contexto de 8 pasos, es útil para estudiar degradación de rendimiento en tareas largas y en pantallas densas.
- Prototipado rápido de flujos de automatización: permite validar un guion de acciones sobre emuladores antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-0.8B-MobileAgent-v1 |
|---|---|
| AndroidWorld seed 30 (116 tareas, desarrollo) | 12 |
| AndroidControl test, precisión de paso alto nivel | 0,694 |
| AndroidControl test, precisión de paso bajo nivel | 0,942 |
| Terminal, precisión `complete` | 0,745 |
| MMStar | 48,9 % |
| MMLU | 45,2 % |
| Apple M5 GPU, mediana de segundos por paso | 2,00 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 852.985.920 parámetros, en FP16 requiere aproximadamente 1,7 GB de pesos, y en GGUF de 4 bits alrededor de 0,5 GB, más el overhead de activaciones y del codificador visual (no cuantificado en la información disponible).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en 4 bits; el autor reporta ejecución en Apple M5 GPU con 2,00 s de mediana por paso.
- Opciones de despliegue: transformers (librería declarada), GGUF de 4 bits para llama.cpp u Ollama; endpoints compatibles según los tags del repositorio. No se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: 2,00 segundos de mediana por paso en Apple M5 GPU; no hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MobileAgent-v1 | 852.985.920 | No disponible | Agente GUI Android | Apache-2.0 | Hugging Face (4 descargas) |
| LFM3-VL-2B-MobileAgent-v4 | No disponible en la información | No disponible | Agente GUI Android (modelo principal del proyecto) | No disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 852.985.920 (aproximado, según el ajuste) | No disponible | Modelo multimodal general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe operar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en inglés; no hay soporte multilingüe.
- Una sola captura de pantalla por paso y memoria limitada a los últimos 8 pasos en texto; no hay memoria visual más allá del paso actual.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real, lo que puede provocar un rendimiento deficiente ante estados de UI no vistos.
- Riesgo de alucinación en la localización de coordenadas y en la elección de acciones, especialmente en pantallas densas o con elementos superpuestos.
- Rendimiento modesto en tareas largas: 12 sobre 116 en AndroidWorld seed 30.
- Capacidades generales degradadas respecto al base (MMLU 45,2 %, MMStar 48,9 %), aunque parcialmente preservadas por las filas de repetición.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias del autor sobre uso desatendido deben respetarse en producción.
- Solo 4 descargas y 0 likes en el momento de la consulta; ecosistema y validación comunitaria prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1
- Versión GGUF 4-bit: https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo principal del proyecto: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-v1
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
