# Melkor01/SenseNova-RoboRSI-27B-MLX-6bit

## Resumen

SenseNova-RoboRSI-27B-MLX-6bit es una conversión comunitaria a 6 bits en formato MLX del modelo `sensenova/SenseNova-RoboRSI-27B`, un modelo de visión-lenguaje encarnado (embodied VLM) de 27.356 millones de parámetros orientado a manipulación robótica. Lo publica el usuario Melkor01 en Hugging Face y está pensado para ejecutarse localmente en Macs con Apple Silicon mediante la librería `mlx-vlm`. El modelo base deriva de la familia Qwen3.5 (`qwen3_5`) y combina razonamiento visual con generación de políticas de control en forma de código Python ("Code as Policy").

Su propuesta técnica central es el "Recursive Self-Improvement" (RSI) entre modelo y harness: un mismo checkpoint puede invocar una política visión-lenguaje-acción (VLA), inspeccionar trayectorias o escribir código que calcule poses exactas del efector final a partir de observaciones de cámara y estado del robot. El modelo base se entrenó con supervisión de objetivos del efector final extraídos de demostraciones VLA abiertas, lo que según la model card reduce el error mediano 3D XYZ de 119,7 mm a 51,6 mm. Además, se post-entrenó solo con experiencia de simulación y transfiere de forma zero-shot a brazos físicos Piper y Piper X adaptando únicamente las interfaces de cámara, estado y control.

Esta conversión MLX cuantiza las 498 matrices lineales del modelo de lenguaje a 6 bits (6,661 bpw, `group_size=64`) pero mantiene los 333 tensores del codificador visual en `bfloat16` nativo para preservar la precisión de localización espacial. El resultado ocupa 21,23 GB en disco (22,9 GB de repositorio) y está verificado en texto y visión. Es relevante ahora porque permite ejecutar un VLM robótico de 27B con ventana de 256K tokens en hardware de consumo Apple, algo inviable con los pesos originales en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` multimodal vision-language model (transformer denso, sin MoE declarado) |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MLX affine 6-bit (`6.661 bpw`, `group_size=64`, 498 matrices cuantizadas); codificador visual en `bfloat16` sin cuantizar |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, formato MLX); 21,23 GB en disco |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia `qwen3_5` con un codificador visual (333 tensores) acoplado a un backbone de lenguaje de 27B parámetros. La conversión MLX aplica cuantización affine de 6 bits con `group_size=64` exclusivamente a las 498 capas lineales del modelo de lenguaje, dejando el encoder visual en `bfloat16` nativo; la model card reporta 0 NaN en los tensores de visión tras la conversión. El contexto máximo es de 262.144 tokens, adecuado para trazas robóticas de horizonte largo o secuencias de vídeo.

El entrenamiento del modelo base combina post-entrenamiento con experiencia de simulación (sin datos reales de robot) y supervisión de objetivos del efector final (`VLA2Agent`) extraídos de demostraciones VLA abiertas. La innovación declarada es el esquema de Recursive Self-Improvement entre modelo y harness: el modelo puede alternar entre pedir movimiento a una política VLA, inspeccionar la trayectoria resultante y generar código Python que calcule poses del gripper. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de escenas robóticas.
- Comprensión de imágenes (image-text-to-text) con localización espacial preservada por el encoder en bf16.
- Code as Policy: escritura de código Python para calcular y ejecutar poses objetivo del gripper a partir de observaciones y estado del robot.
- Interacción con políticas VLA: solicitud de movimiento, inspección de trayectorias y verificación de resultados.
- Predicción de objetivos del efector final (`VLA2Agent`) con supervisión específica de coordenadas 3D.
- Planificación multi-paso de manipulación (por ejemplo, colocar un objeto y verificar estabilidad antes de soltar).
- Modo thinking opcional (`enable_thinking`) para cadenas de razonamiento extendidas.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Planificación de manipulación en mesa: dado un frame de cámara, el modelo genera un plan de 3 pasos para colocar un objeto sobre otro y verificar estabilidad antes de liberar el gripper, usando su contexto de 256K para incorporar el estado completo del entorno.
- Generación de políticas en código: el modelo escribe scripts Python que calculan poses exactas del efector final a partir de la observación y el estado del robot, lo que permite integrar la política en un pipeline de control existente sin un framework VLA propietario.
- Detección de riesgos de colisión: inspección de imágenes del espacio de trabajo para listar riesgos antes de un agarre, aprovechando la precisión del encoder visual sin cuantizar.
- Prototipado en simulación: post-entrenamiento y validación de políticas en simulación antes de transferirlas a brazos Piper o Piper X, adaptando solo las interfaces de cámara, estado y control.
- Asistencia a operadores de robots: conversaciones multi-turno sobre trazas de robot de horizonte largo, gracias a la ventana de 262.144 tokens para secuencias de vídeo o registros extensos.
- Investigación en embodied AI en hardware de consumo: ejecución local en Macs con Apple Silicon de 32-64 GB para experimentar con RSI modelo-harness sin depender de clústeres GPU.
- Evaluación de políticas VLA: el modelo inspecciona trayectorias generadas por una política VLA y razona sobre su corrección antes de ejecutar la siguiente acción.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión ni para el modelo base. El único dato cuantitativo de rendimiento es la mejora en error de posición del efector final:

| Metrica | Antes | Despues |
|---|---|---|
| Error mediano 3D XYZ del efector final | 119,7 mm | 51,6 mm |

No se han publicado resultados de benchmarks en la información disponible más allá de esta métrica.

## Requisitos de hardware

- VRAM / memoria unificada: 32 GB para contexto corto; 48-64 GB o más para trazas robóticas de horizonte largo o vídeo. Pico verificado en A100: 21,64 GB.
- Hardware objetivo: Apple Silicon Mac (M1-M5) con `mlx-vlm >= 0.8.0` y Python 3.11+.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 32 GB o superior; la variante 4-bit (14,97 GB en disco, pico 15,38 GB) está pensada para Macs de 24 GB.
- Opciones de despliegue: `mlx-vlm` (CLI `mlx_vlm.generate` y API Python); no se declara soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B-MLX-6bit (este) | 27,36B | 256K | MLX 6-bit, vision bf16 | Apache 2.0 | Conversión comunitaria para Apple Silicon |
| SenseNova-RoboRSI-27B (base) | 27,36B | 256K | safetensors bf16 | Apache 2.0 | Pesos originales, sin cuantizar |
| SenseNova-RoboRSI-27B-MLX-4bit | 27,36B | 256K | MLX 4-bit (4,695 bpw) | Apache 2.0 | 14,97 GB, para Macs de 24 GB |
| Otros VLM roboticos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Modelo especializado en robótica y visión: su rendimiento en tareas generales de texto puede ser inferior al de un LLM de propósito general del mismo tamaño.
- Riesgo de alucinación en coordenadas y planes de manipulación: los errores de posición del efector final siguen siendo de decenas de milímetros (51,6 mm mediano), lo que exige verificación externa antes de ejecutar acciones físicas.
- La transferencia zero-shot se declara solo para brazos Piper y Piper X; otros robots requieren adaptación de interfaces y validación propia.
- La cuantización a 6 bits puede degradar ligeramente la precisión de coordenadas frente al modelo base en bf16; la model card recomienda la variante 6-bit sobre la 4-bit precisamente por este motivo.
- Conversión comunitaria no oficial: no está validada por SenseNova ni por el equipo de Qwen, y solo se verificó en texto y visión, no en tareas robóticas reales.
- Dependencia de `mlx-vlm >= 0.8.0` y de hardware Apple Silicon; no es portable a CUDA sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Variante 4-bit: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-4bit
- README en chino: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-6bit/blob/main/README_CN.md
- Librería mlx-vlm: no se proporciona URL en la información disponible
- Paper, blog o demo oficial: no disponibles en la información proporcionada
