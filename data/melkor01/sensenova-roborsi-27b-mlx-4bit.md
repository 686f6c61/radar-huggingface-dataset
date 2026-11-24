# Melkor01/SenseNova-RoboRSI-27B-MLX-4bit

## Resumen

SenseNova-RoboRSI-27B-MLX-4bit es una conversión comunitaria a 4 bits en formato MLX del modelo `sensenova/SenseNova-RoboRSI-27B`, un modelo de visión-lenguaje encarnado (embodied VLM) orientado a manipulación robótica. Lo publica el usuario Melkor01 en Hugging Face y está pensado para ejecutar razonamiento multimodal de robots de forma local en Macs con Apple Silicon, sin depender de GPU NVIDIA. El modelo base deriva de la familia Qwen3.8-27B (arquitectura `qwen3_5`) y combina políticas visión-lenguaje-acción (VLA) con generación de código ejecutable como política de control ("Code as Policy").

La propuesta central del modelo es el auto-mejoramiento recursivo (Recursive Self-Improvement, RSI) entre modelo y arnés (Harness): un mismo checkpoint puede pedir movimiento a una política VLA, inspeccionar trayectorias o escribir código Python que calcule poses exactas del efector final a partir de observaciones de cámara y estado del robot. Según la model card, el entrenamiento con supervisión de objetivos del efector final (`VLA2Agent`) reduce el error mediano 3D XYZ de 119,7 mm a 51,6 mm, y el modelo transfiere de simulación a realidad en brazos Piper y Piper X adaptando solo las interfaces de cámara, estado y control.

Esta variante cuantizada mantiene las 498 matrices lineales del modelo de lenguaje en 4 bits (4,695 bpw, group_size=64) mientras preserva los 333 tensores del codificador visual en bfloat16 nativo, con el objetivo de no degradar la localización espacial. El repositorio ocupa 14,97 GB en tres shards safetensors y declara una ventana de contexto de hasta 256K tokens (262.144). Es relevante para quien quiera experimentar con robótica encarnada multimodal en hardware de consumo Apple, aunque se trata de una conversión no oficial con cero descargas y sin benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` multimodal vision-language (VLM), derivada de Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens (262.144) |
| Tipos de cuantizacion | MLX affine 4-bit, 4,695 bpw, group_size=64, 498 matrices cuantizadas; codificador visual en bfloat16 sin cuantizar (333 tensores) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 3 shards), 14,97 GB en disco |
| Libreria / runtime | `mlx-vlm >= 0.8.0` (construido con 0.8.1), Python 3.11+ |
| Hardware objetivo | Apple Silicon (M1–M5) |
| Memoria unificada recomendada | 24 GB (contexto corto); 32–64 GB+ (trazas robóticas largas / vídeo) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 27B parámetros de la familia `qwen3_5`, con un codificador visual acoplado a un modelo de lenguaje. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Sí describe el enfoque de entrenamiento del modelo base: un esquema de Recursive Self-Improvement (RSI) entre modelo y Harness, en el que el modelo aprende a combinar políticas VLA con generación de código ("Code as Policy") para producir planes de manipulación y poses del efector final. Además, se aplicó post-entrenamiento con supervisión de objetivos del efector final extraídos de demostraciones VLA abiertas (`VLA2Agent`), y un post-entrenamiento sobre experiencia de simulación que permite transferencia zero-shot a brazos físicos Piper y Piper X adaptando únicamente las interfaces de cámara, estado y control.

La conversión MLX cuantiza únicamente las capas lineales del modelo de lenguaje (498 matrices a 4 bits con cuantización afín y group_size=64, 4,695 bits por peso efectivos) y deja intactos los 333 tensores del codificador visual en bfloat16, sin NaNs según la verificación del autor. El resultado son tres shards safetensors que suman 14,97 GB. La model card no especifica detalles sobre RLHF/DPO, decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Razonamiento multimodal imagen-texto: interpreta imágenes de escenas (por ejemplo, mesas de trabajo) y responde sobre ellas.
- Planificación de manipulación robótica: genera planes de varios pasos para brazos robóticos (agarre, colocación, verificación de estabilidad).
- Code as Policy: escribe código Python que calcula y ejecuta poses objetivo exactas del efector final a partir de observaciones de cámara y estado del robot.
- Integración con políticas VLA: puede solicitar movimiento a una política visión-lenguaje-acción e inspeccionar trayectorias resultantes.
- Predicción de objetivos del efector final (`VLA2Agent`) con supervisión específica para reducir error de localización 3D.
- Transferencia sim-to-real zero-shot a brazos Piper y Piper X (adaptando interfaces de cámara, estado y control).
- Modo de razonamiento extendido (chain-of-thought) activable mediante `enable_thinking` en la plantilla de chat.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Planificación de agarre y colocación en laboratorio: dado un frame de cámara de una mesa, el modelo genera un plan de tres pasos para mover un objeto (por ejemplo, una taza) a una posición destino y verificar estabilidad antes de soltar; encaja por su entrenamiento específico en manipulación y su capacidad de razonar sobre escenas.
- Generación de políticas en código para brazos Piper/Piper X: el modelo escribe Python que traduce observaciones y estado del robot en poses objetivo del efector final, lo que permite prototipar controladores sin entrenar una política desde cero.
- Inspección de riesgos de colisión: con una imagen del espacio de trabajo, el modelo enumera riesgos antes de un agarre, útil como paso de verificación previo a la ejecución en un pipeline de robótica.
- Iteración local en Mac para investigación en IA encarnada: al caber en 24 GB de memoria unificada, permite probar prompts, plantillas y modos de razonamiento en un portátil Apple Silicon antes de escalar a un clúster.
- Análisis de trazas largas de robot o vídeo: con hasta 256K tokens de contexto y 32–64 GB de memoria, puede procesar secuencias largas de observaciones y estados para diagnosticar fallos de una política.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de precisión de coordenadas entre la versión 4-bit (4,695 bpw) y la 6-bit (6,661 bpw) en tareas de Code as Policy.
- Docencia y demostraciones de VLM encarnados: permite mostrar en un equipo de consumo cómo un VLM multimodal razona sobre imágenes y produce código de control, sin GPU dedicada.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta conversión. Solo aporta métricas internas del modelo base y datos de verificación de la cuantización:

| Metrica | Valor |
|---|---|
| Error mediano 3D XYZ del efector final (modelo base con `VLA2Agent`) | 51,6 mm (frente a 119,7 mm sin esta supervisión) |
| Precisión efectiva de pesos | 4,695 bpw |
| Matrices lineales cuantizadas | 498 |
| Tensores del codificador visual preservados en bfloat16 | 333 (0 NaNs) |
| Pico de memoria verificado (A100, según autor) | 15,38 GB |
| Transferencia sim-to-real | zero-shot a Piper y Piper X |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 24 GB de memoria unificada para contexto corto; 32–64 GB+ para trazas robóticas largas o vídeo. Pico de memoria verificado por el autor: 15,38 GB (en A100).
- GPU: el formato MLX está pensado para Apple Silicon (M1–M5); no es un formato para CUDA. En GPU NVIDIA habría que usar otra conversión del modelo base.
- ¿Cabe en GPU de consumo? En Macs con Apple Silicon de 24 GB o más, sí. En GPUs NVIDIA de consumo no aplica este repositorio MLX.
- Despliegue: `mlx-vlm >= 0.8.0` (CLI `mlx_vlm.generate` y API Python `load`/`generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B-MLX-4bit (este) | 27,36 B | 256K | MLX 4-bit, Apple Silicon | Apache 2.0 | Conversión comunitaria, 14,97 GB, codificador visual en bf16 |
| SenseNova-RoboRSI-27B-MLX-6bit | 27,36 B (base) | 256K | MLX 6-bit (6,661 bpw), Apple Silicon | Apache 2.0 | 21,23 GB; pico verificado 21,64 GB; mayor precisión de coordenadas |
| sensenova/SenseNova-RoboRSI-27B | 27,36 B | 256K | Pesos originales (no MLX) | Apache 2.0 | Modelo base oficial; requiere hardware distinto a Apple Silicon |
| Otros VLM encarnados de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Conversión no oficial: es un trabajo comunitario de Melkor01, con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente más allá de la verificación del autor.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La cuantización a 4 bits puede degradar la precisión de coordenadas en tareas de Code as Policy; el propio autor recomienda la versión 6-bit para mayor precisión de coordenadas.
- Riesgo de alucinación en planes de manipulación y en la interpretación de imágenes; no debe usarse sin verificación en entornos físicos reales.
- El modelo está entrenado para robótica y manipulación; su uso como asistente general no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben revisarse por separado.
- Requiere Apple Silicon y `mlx-vlm >= 0.8.0`; no es portable directamente a CUDA sin otra conversión.
- No se han publicado benchmarks estándar ni evaluaciones de sesgo; se desconoce el comportamiento en dominios fuera de la robótica.
- La fecha de creación del repositorio (2026-11-24) y la referencia a "Qwen3.8-27B" deben tratarse con cautela; no hay confirmación independiente de estos datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Versión 6-bit: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-6bit
- README en chino: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-4bit/blob/main/README_CN.md
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
