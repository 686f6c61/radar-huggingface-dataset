# fgparamio/sauron-lora-qwen3-4b

## Resumen

SAURON es un adaptador LoRA experimental para Qwen3-4B en cuantización de 4 bits, desarrollado por fgparamio en el ecosistema del proyecto TibiOS. Se trata de un ajuste fino de rango 8 (escala 20) en formato MLX que cubre las últimas 8 capas del transformer base, con 3,67 millones de parámetros entrenables (aproximadamente el 0,09 % del modelo base). Su relevancia no reside en el rendimiento del adaptador en sí, sino en el proceso de entrenamiento distribuido que lo produjo: cinco máquinas domésticas (dos Mac con Apple Silicon, dos NVIDIA Jetson Orin Nano y una Orange Pi 6 Plus como nodo cabeza) generaron sus propios datos, entrenaron en anillo sobre una red Wi-Fi local y publicaron el resultado como una nueva línea de inferencia, sin usar nube ni gasto en tokens de API.

El adaptador está especializado en preguntas y respuestas de tipo glosario sobre la arquitectura TibiOS, en inglés y español, y su card reconoce explícitamente que sus hechos suelen ser incorrectos. No es un modelo de producción ni pretende serlo: es una demostración de bucle cerrado en el que la misma flota que infiere genera datos, entrena y vuelve a servir el modelo ajustado.

Al estar construido sobre Qwen3-4B, hereda la arquitectura y la ventana de contexto del modelo base, aunque el adaptador en sí solo aporta conocimiento del dominio del glosario. La licencia es Apache 2.0 y el repositorio no contiene pesos completos, sino únicamente el delta LoRA en safetensors de 14 MB en float32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3-4B (adaptador de bajo rango) |
| Parámetros totales | 3,67 M entrenables en el adaptador (modelo base Qwen3-4B: no disponible en la información) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador (heredada del modelo base Qwen3-4B) |
| Tipos de cuantización | Base en 4 bits (mlx-community/Qwen3-4B-4bit); adaptador en float32 |
| Idiomas soportados | Inglés y español (datos de entrenamiento); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, formato MLX), 14 MB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con escala 20 aplicado sobre las últimas 8 capas del transformer Qwen3-4B, cubriendo las 7 proyecciones de cada capa (q, k, v, o, gate, up y down). El entrenamiento se realizó con MLX en Apple Silicon y con Unsloth + TRL sobre CUDA en las Jetson Orin Nano, en un esquema de anillo en el que cada lote se reparte según la velocidad medida de cada máquina. Se ejecutaron 1.294 iteraciones iniciales y después 600 adicionales con un bloque de preguntas y respuestas de presentación en inglés y español, con learning rate de 1e-4 a 5e-5, longitud de secuencia 512, batch 4 y semilla 7.

Los datos de entrenamiento son pares de preguntas y respuestas de tipo glosario sobre TibiOS, generados por las propias líneas de inferencia de la flota. La card indica que Kimi K3 y Claude se usaron exclusivamente para redactar el glosario, no para entrenar el adaptador. La innovación técnica destacable es el propio bucle de entrenamiento distribuido heterogéneo sobre hardware de consumo y red local, no una mejora arquitectónica del modelo.

## Capacidades

- Generación de texto en inglés y español, orientada a preguntas y respuestas de tipo glosario sobre la arquitectura TibiOS.
- Respuesta a preguntas de presentación como "What is TibiOS?" y a preguntas técnicas del glosario en español (por ejemplo, sobre la Runtime API).
- Ajuste de estilo y terminología del dominio TibiOS sobre el conocimiento general de Qwen3-4B.
- Soporte de tool calling y function calling: no documentado en la información disponible (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas a los idiomas presentes en los datos de entrenamiento (inglés y español).
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Demostración de entrenamiento distribuido en hardware doméstico: el adaptador sirve como prueba de concepto de un bucle en el que cinco máquinas de consumo generan datos, entrenan en anillo y publican el resultado sin nube; útil para investigadores que estudien coordinación de entrenamiento heterogéneo.
- Asistente de glosario interno sobre TibiOS: desplegado con `mlx_lm.generate` y `--adapter-path`, responde preguntas terminológicas del dominio con el estilo del glosario de entrenamiento.
- Prueba de pipelines LoRA en MLX: sirve para validar flujos de carga de adaptadores de 14 MB sobre Qwen3-4B-4bit en Apple Silicon antes de escalar a adaptadores mayores.
- Ejemplo docente de ajuste fino de bajo rango: con 3,67 M de parámetros entrenables (0,09 % del base), es un caso compacto para explicar rango, escala y cobertura de capas en LoRA.
- Validación de despliegue en el borde: el tamaño reducido del adaptador permite probar cargas y cambios de línea de inferencia en dispositivos con poca memoria, como las Jetson Orin Nano de 8 GB usadas en el entrenamiento.
- Generación de datos para el siguiente ciclo: según el bucle descrito en la card, la línea `@tuned` puede producir nuevos pares de preguntas y respuestas para futuras iteraciones del adaptador.
- Base para adaptadores de dominio más amplios: el esquema de entrenamiento (últimas 8 capas, 7 proyecciones, rango 8) puede reutilizarse con un corpus mayor y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 14 MB en float32 y se aplica sobre Qwen3-4B en 4 bits, por lo que el requisito dominante es el del modelo base cuantizado.
- GPU recomendadas: Apple Silicon (el entrenamiento se hizo en Mac mini M4 y MacBook Air M1 con 16 GB de RAM) y NVIDIA Jetson Orin Nano de 8 GB; no se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, según el hardware usado en el proyecto (Mac de 16 GB y Jetson de 8 GB), aunque no se especifican cifras de VRAM.
- Opciones de despliegue: MLX (`mlx-lm`) mediante `mlx_lm.generate --model mlx-community/Qwen3-4B-4bit --adapter-path .`; otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAURON (este adaptador) | 3,67 M entrenables sobre Qwen3-4B | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3-4B (base) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face |
| Alternativas LoRA para Qwen3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La card declara explícitamente que es un experimento y no un modelo de producción: fue entrenado con un conjunto pequeño de datos de tipo glosario y sus hechos suelen ser incorrectos.
- Riesgo alto de alucinación fuera del dominio del glosario TibiOS, y también dentro de él según la propia nota de honestidad del autor.
- Cobertura limitada: solo se ajustan las últimas 8 capas y las 7 proyecciones, con 3,67 M de parámetros, lo que restringe la magnitud del cambio de comportamiento.
- Idiomas: los datos de entrenamiento son inglés y español; no hay lista oficial de idiomas soportados.
- Longitud de contexto: no documentada para el adaptador; depende del modelo base Qwen3-4B.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no recomienda su uso en producción por la falta de fiabilidad factual.
- Dependencia de MLX: el adaptador está en formato MLX y el ejemplo de uso es con `mlx-lm`; no se documenta compatibilidad con otros runners.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fgparamio/sauron-lora-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Cuantización base usada en el ejemplo: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- TibiOS: https://tibios.ai
- Landing y vídeo de demostración: https://huggingface.co/spaces/fgparamio/TibiOS
- Contacto del autor: fgparamio@tibios.ai
