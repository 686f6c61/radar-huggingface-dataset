# Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-6bit

## Resumen
SenseNova-SI-1.5-InternVL3-8B-MLX-6bit es una conversión comunitaria a 6 bits en formato MLX del modelo sensenova/SenseNova-SI-1.5-InternVL3-8B, un modelo de visión-lenguaje de 8B parámetros construido sobre InternVL3 y orientado a inteligencia espacial: geometría sólida en 3D, rotación mental y planificación espacial. Lo publica el usuario Melkor01 y está pensado para inferencia local nativa en Apple Silicon mediante mlx-vlm.

El modelo resuelve tareas de percepción visual y razonamiento espacial, un nicho poco cubierto por los VLM generalistas, y lo empaqueta en un formato cuantizado que cabe en equipos de consumo con memoria unificada. La cuantización es de 6 bits afines con group_size=64 (6,865 bpw efectivos sobre 200 matrices), mientras que el codificador visual se conserva sin cuantizar en BF16.

Es relevante para desarrolladores que quieran ejecutar un VLM especializado en espacialidad en un Mac sin depender de la nube, con licencia Apache 2.0 y un tamaño de repositorio de 6,8 GB. El modelo base procede de SenseNova y hereda la arquitectura internvl_chat, con soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | internvl_chat (VLM multimodal, base InternVL3) |
| Parametros totales | 7.944.373.760 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6 bits, group_size=64 (6,865 bpw); vision encoder en BF16 sin cuantizar |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx-vlm, requiere trust_remote_code |

## Arquitectura y entrenamiento
El modelo base es un VLM de la familia InternVL3 con arquitectura internvl_chat, que combina un codificador visual (InternViT, en este build conservado en BF16 con 340 tensores) con un modelo de lenguaje de ~8B parámetros. La conversión a MLX aplica cuantización afín de 6 bits con group_size=64 sobre 200 matrices, alcanzando 6,865 bpw efectivos y un total de 1085 tensores. El proceso se realizó con `mlx_vlm convert --quantize --q-bits 6 --q-group-size 64` sobre el commit fijado b17da87f5b2175057e64ce85d4f4981ebd192536 del checkpoint original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base dentro de la información proporcionada. La especialización declarada del modelo es la inteligencia espacial y la percepción encarnada (embodied AI), aunque no se detallan las innovaciones técnicas de entrenamiento.

## Capacidades
- Generación de texto e inferencia multimodal image-text-to-text.
- Razonamiento espacial: posiciones relativas de objetos, geometría sólida 3D y rotación mental.
- Percepción visual para planificación espacial y escenas sintéticas.
- Respuestas conversacionales multi-turno (pipeline conversational).
- Soporte bilingüe inglés y chino.
- Ejecución local en Apple Silicon mediante mlx-vlm, con servidor OpenAI-compatible incluido (`mlx_vlm.server`).
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso
- Razonamiento espacial sobre imágenes: describir posiciones relativas de objetos de izquierda a derecha en una escena, aprovechando la especialización del modelo en relaciones espaciales.
- Robótica y percepción encarnada en prototipos: interpretar escenas para planificación de movimiento o manipulación, gracias a su enfoque en embodied AI.
- Asistencia educativa en geometría: resolver problemas de geometría sólida y rotación mental a partir de diagramas o figuras.
- Análisis de imágenes en local para privacidad: procesar capturas o fotos sensibles en un Mac sin enviar datos a la nube, con 16 GB de memoria unificada recomendada.
- Prototipado rápido de aplicaciones VLM en Apple Silicon: usar el servidor OpenAI-compatible de mlx-vlm para integrar el modelo en aplicaciones existentes sin reescribir clientes.
- Evaluación de modelos espaciales: comparar el comportamiento del modelo cuantizado frente al original en tareas de posicionamiento y planificación.
- Automatización de descripciones de escenas para accesibilidad: generar descripciones estructuradas de la disposición espacial de elementos en una imagen.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta validaciones funcionales internas:

| Prueba | Resultado |
|---|---|
| Integridad de tensores y visión | 1085 tensores, 340 de visión en BF16, 0 NaN |
| Razonamiento espacial textual (temp=0.0) | 0,6 s, 96,8 tok/s |
| Visión image-to-text (escena sintética de 3 formas) | 1,7 s, 100,7 tok/s, 10,16 GB de memoria GPU pico |

Estas cifras se obtuvieron en Linux MLX CUDA sobre una NVIDIA A100-SXM4-80GB con mlx 0.32.4 y mlx-vlm 0.8.1; el rendimiento en Metal (Apple Silicon) no se ha medido en dispositivo según el autor.

## Requisitos de hardware
- Memoria unificada recomendada: 16 GB para texto e imágenes; 24 GB o más para alta resolución o múltiples imágenes.
- Tamaño del modelo cuantizado: 6,36 GB (repositorio de 6,8 GB).
- Mac con Apple Silicon (M1 a M5), Python 3.11 o superior y mlx-vlm >= 0.8.0.
- Validación funcional realizada en NVIDIA A100-SXM4-80GB con MLX CUDA (10,16 GB de memoria GPU pico en la prueba de visión).
- Despliegue mediante CLI (`mlx_vlm.generate`), API de Python (`mlx_vlm.load`/`generate`) o servidor OpenAI-compatible (`mlx_vlm.server`).
- Throughput medido en la validación: 96,8 tok/s en texto y 100,7 tok/s en visión sobre A100; latencia en Apple Silicon no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| SenseNova-SI-1.5-InternVL3-8B-MLX-6bit | ~8B | no disponible | Inteligencia espacial / embodied | Apache 2.0 | MLX 6 bits |
| sensenova/SenseNova-SI-1.5-InternVL3-8B (original) | ~8B | no disponible | Inteligencia espacial / embodied | Apache 2.0 | safetensors BF16 |
| Otros VLM de ~8B sobre InternVL3 | ~8B | no disponible | Visión-lenguaje general | variable | variable |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el original en BF16 es la referencia directa y ocupa aproximadamente el doble de espacio.

## Limitaciones y advertencias
- Conversión comunitaria: no es una publicación oficial de SenseNova; la calidad depende del proceso de cuantización del autor.
- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- No se especifica la longitud de contexto soportada.
- Riesgo de alucinación inherente a los VLM, especialmente en descripciones detalladas de escenas complejas.
- El rendimiento en Apple Silicon (Metal) no se ha medido; las cifras reportadas provienen de una GPU NVIDIA con MLX CUDA.
- Requiere `trust-remote-code` y código personalizado (`configuration_intern_vit.py`), lo que implica revisar el código antes de ejecutarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Con solo 18 descargas y 0 likes, la adopción y el soporte de la comunidad son mínimos.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-SI-1.5-InternVL3-8B
- README en chino: https://huggingface.co/Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-6bit/blob/main/README_CN.md
