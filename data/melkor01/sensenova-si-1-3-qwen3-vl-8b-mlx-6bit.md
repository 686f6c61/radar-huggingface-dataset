# Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-6bit

## Resumen

SenseNova-SI-1.3-Qwen3-VL-8B-MLX-6bit es una conversión comunitaria a formato MLX de 6 bits del modelo `sensenova/SenseNova-SI-1.3-Qwen3-VL-8B`, un modelo de visión-lenguaje de 8B parámetros especializado en inteligencia espacial. Lo publica el usuario Melkor01 y está pensado para inferencia multimodal local nativa en Apple Silicon mediante la librería `mlx-vlm`. El modelo base, desarrollado por SenseNova, se construye sobre la arquitectura Qwen3-VL y se entrena específicamente para relaciones espaciales, percepción encarnada (embodied perception) y razonamiento multivista.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento espacial de 8B en ordenadores Mac con memoria unificada de 16 GB, algo que con pesos en BF16 requeriría bastante más memoria. La cuantización a 6 bits (7,125 bpw con `group_size=64`) reduce el repositorio a 7,29 GB manteniendo el codificador visual en BF16 sin cuantizar, lo que preserva la calidad de la representación de imagen.

El modelo es multimodal (image-text-to-text), soporta inglés y chino, y se distribuye bajo licencia Apache 2.0. Es una opción interesante para prototipado de robótica, análisis de escenas y aplicaciones de visión por computador que necesiten razonamiento sobre posiciones relativas de objetos, aunque su validación se ha hecho sobre MLX CUDA en A100 y no se han publicado cifras de rendimiento en Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL multimodal vision-language model (8B) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6-bit (7,125 bpw, group_size=64, 254 matrices cuantizadas); codificador visual en BF16 sin cuantizar (351 tensores) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx-vlm` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3-VL, con un codificador visual acoplado a un modelo de lenguaje de 8B parámetros. La conversión MLX mantiene el codificador visual en BF16 (351 tensores preservados, 0 NaNs) y cuantiza únicamente las 254 matrices del componente de lenguaje a 6 bits con tamaño de grupo 64, lo que da una precisión efectiva de 7,125 bits por peso. El modelo base SenseNova-SI-1.3 está entrenado específicamente para inteligencia espacial: relaciones espaciales, percepción encarnada y razonamiento multivista sobre Qwen3-VL.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión se realizó con `mlx 0.32.4`, `mlx-vlm 0.8.1` y `transformers 5.22.1`, fijando el commit `a6328154b47faa7dc349a4f56477db00bff1ad1f` del checkpoint original. La build fue verificada en tres puertas de validación (integridad de tensores y visión, razonamiento espacial textual e image-to-text) sobre MLX CUDA en una NVIDIA A100-SXM4-80GB.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes (pipeline image-text-to-text).
- Razonamiento espacial: descripción de posiciones relativas de objetos, orden de izquierda a derecha, proximidad a cámara.
- Percepción encarnada y razonamiento multivista (orientado a robótica y agentes embodied).
- Respuesta a preguntas visuales (VQA) sobre escenas sintéticas y reales.
- Conversación multi-turno con plantilla de chat multimodal oficial (`chat_template.jinja`).
- Servidor local compatible con API OpenAI mediante `mlx_vlm.server`.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Análisis de escenas para robótica: dado un frame de cámara, el modelo describe posiciones relativas de objetos y su proximidad, útil para planificación de manipulación en entornos embodied.
- Asistencia a personas con discapacidad visual: descripción verbal de la disposición espacial de objetos en una imagen capturada por el móvil, aprovechando el razonamiento de relaciones espaciales.
- Etiquetado y anotación de datasets de visión: generación automática de descripciones espaciales para imágenes de entrenamiento en pipelines de datos.
- Prototipado local en Mac: desarrollo y pruebas de funcionalidades de VQA y razonamiento espacial sin depender de la nube, gracias a los 7,29 GB de pesos y los 16 GB de memoria unificada recomendados.
- Inspección de imágenes técnicas o diagramas: preguntas sobre qué elemento está a la derecha, arriba o más cerca en una captura, útil en documentación técnica.
- Servicio interno compatible con OpenAI: despliegue con `mlx_vlm.server` para integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI con imágenes.
- Análisis multivista en investigación: comparación de varias vistas de una misma escena para tareas de reconstrucción o razonamiento 3D aproximado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta verificaciones funcionales de la build:

| Prueba | Resultado | Métricas |
|---|---|---|
| Integridad de tensores y visión | PASS | 1258 tensores totales, 351 de visión en BF16, 0 NaNs |
| Razonamiento espacial textual | PASS | 0,9 s, 80,6 tok/s (temp=0,0) |
| Image-to-text con escena sintética de 3 formas | PASS | 1,1 s, 78,8 tok/s, 7,5 GB de memoria GPU pico |

Estas cifras se obtuvieron en Linux MLX CUDA sobre una NVIDIA A100-SXM4-80GB; el rendimiento en Metal (Apple Silicon) no se ha medido en dispositivo según la model card.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16 GB de memoria unificada para texto e imágenes; 24 GB o más para alta resolución o múltiples imágenes.
- Tamaño en disco: 7,29 GB (repositorio de 15 archivos).
- GPU recomendadas: Apple Silicon M1 a M5 (requisito de la build MLX). Para la validación se usó una NVIDIA A100-SXM4-80GB vía MLX CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada; no está pensado para GPUs NVIDIA de consumo con CUDA estándar, ya que el formato es MLX.
- Opciones de despliegue: `mlx-vlm >= 0.8.0` (CLI `mlx_vlm.generate`, API Python y servidor `mlx_vlm.server` compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 80,6 tok/s en texto y 78,8 tok/s en image-to-text sobre A100 con MLX CUDA; sin datos en Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-SI-1.3-Qwen3-VL-8B-MLX-6bit | 8,77B | no disponible | Razonamiento espacial, embodied | Apache 2.0 | MLX (Apple Silicon) |
| SenseNova-SI-1.3-Qwen3-VL-8B (base) | 8B | no disponible | Razonamiento espacial, embodied | Apache 2.0 | Pesos originales (BF16) |
| Qwen3-VL-8B | 8B | no disponible | Visión-lenguaje general | no disponible | Múltiples formatos |
| Modelos VLM de 7-8B tipo LLaVA o Qwen2-VL | ~7-8B | no disponible | Visión-lenguaje general | variable | GGUF, safetensors |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks del modelo base ni de esta conversión en la información proporcionada.

## Limitaciones y advertencias

- Solo se distribuye en formato MLX, por lo que no es directamente utilizable en GPUs NVIDIA con CUDA estándar ni en CPU mediante llama.cpp u Ollama.
- El rendimiento en Apple Silicon Metal no ha sido medido; las cifras publicadas corresponden a MLX CUDA sobre A100 y pueden no ser representativas.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No se dispone de información sobre la longitud de contexto máxima del modelo base.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje; las descripciones espaciales deben validarse en aplicaciones críticas.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización.
- La cuantización a 6 bits puede introducir degradación sutil en tareas de razonamiento complejo frente al checkpoint BF16 original.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base SenseNova por si añaden restricciones adicionales.
- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta; no es una publicación oficial de SenseNova.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-SI-1.3-Qwen3-VL-8B
- README en chino: https://huggingface.co/Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-6bit/blob/main/README_CN.md
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- MLX (Apple): https://github.com/ml-explore/mlx
