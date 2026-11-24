# Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-4bit

## Resumen

SenseNova-SI-1.3-Qwen3-VL-8B-MLX-4bit es una conversión comunitaria a 4 bits en formato MLX del modelo `sensenova/SenseNova-SI-1.3-Qwen3-VL-8B`, un modelo visión-lenguaje de 8B parámetros especializado en inteligencia espacial, percepción encarnada y razonamiento multi-vista. Lo publica el usuario Melkor01 y está construido sobre la arquitectura `qwen3_vl`, con el codificador visual preservado en BF16 sin cuantizar. El objetivo es permitir inferencia multimodal nativa en Apple Silicon (M1 a M5) con un consumo de memoria unificado de 8-16 GB, algo inviable con los pesos originales en precisión completa.

La relevancia de esta ficha reside en dos factores. Por un lado, el modelo base aporta capacidades de razonamiento espacial (posiciones relativas, relaciones 3D, percepción para robótica) que no son habituales en modelos VLM genéricos de ese tamaño. Por otro, esta conversión concreta reduce el peso del repositorio a 5,38 GB con una precisión efectiva de 5,256 bits por peso, manteniendo el encoder visual en BF16 para no degradar la calidad de la percepción. La licencia es Apache 2.0, lo que facilita su uso comercial.

El modelo está pensado para desarrolladores que trabajan en robótica, visión por computador o agentes encarnados y quieren ejecutar prototipos localmente en un Mac sin depender de GPU dedicadas. No obstante, conviene señalar que el autor solo ha validado el funcionamiento en Linux con MLX CUDA sobre A100, y que el rendimiento en Metal (Apple Silicon) no se ha medido todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_vl` (modelo multimodal visión-lenguaje) |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits MLX afín (`group_size=64`, 5,256 bpw, 254 matrices cuantizadas); encoder visual en BF16 sin cuantizar |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 5,38 GB en 15 archivos |
| Librería | mlx-vlm ≥ 0.8.0 |
| Hardware objetivo | Apple Silicon (M1-M5), memoria unificada 8-16 GB (24 GB+ para alta resolución o multi-imagen) |

## Arquitectura y entrenamiento

El modelo base es un VLM de la familia Qwen3-VL con 8B parámetros, adaptado por SenseNova para tareas de inteligencia espacial. La arquitectura combina un transformer de lenguaje con un codificador visual, y el pipeline es `image-text-to-text`. Esta conversión concreta aplica cuantización afín de 4 bits (grupo de 64) a 254 matrices del modelo, dejando intactos los 351 tensores del encoder visual en BF16, con el objetivo de preservar la fidelidad de la representación visual. El resultado son 1.258 tensores totales sin valores NaN, según la verificación del autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF o DPO. El autor tampoco detalla innovaciones técnicas del entrenamiento original (como atención lineal o decodificación especulativa). Lo que sí se documenta es el proceso de conversión: `python -m mlx_vlm convert --quantize --q-bits 4 --q-group-size 64`, con `mlx 0.32.4`, `mlx-vlm 0.8.1` y `transformers 5.22.1`, partiendo del commit fijado `a6328154b47faa7dc349a4f56477db00bff1ad1f` del modelo original.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto.
- Razonamiento espacial: descripción de posiciones relativas de objetos, relaciones izquierda-derecha, proximidad a cámara.
- Percepción encarnada (*embodied perception*) y razonamiento multi-vista, orientado a robótica y agentes.
- Respuesta a preguntas visuales (VQA) sobre escenas sintéticas y reales.
- Conversación multi-turno con plantilla de chat multimodal oficial (`chat_template.jinja`).
- Soporte de servidor local compatible con la API de OpenAI mediante `mlx_vlm.server`.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling ni *thinking mode* en la información disponible.

## Casos de uso

- **Robótica de manipulación**: el modelo puede interpretar una imagen de la escena y responder qué objeto está más cerca de la cámara y qué hay a su derecha, información directamente utilizable para planificación de agarre y navegación.
- **Prototipado local en Mac**: un desarrollador puede ejecutar el modelo en un MacBook con 16 GB de memoria unificada usando `mlx_vlm.generate`, sin necesidad de GPU dedicada, para iterar sobre prompts espaciales.
- **Análisis de escenas multi-vista**: con 24 GB+ de memoria se pueden procesar varias imágenes de una misma escena para razonar sobre consistencia geométrica entre vistas, útil en reconstrucción 3D aproximada.
- **Asistencia a personas con discapacidad visual**: descripción de posiciones relativas de obstáculos y objetos en una imagen capturada por cámara, con respuestas deterministas a temperatura 0 para mayor estabilidad.
- **Generación de anotaciones espaciales para datasets**: el modelo puede etiquetar relaciones espaciales en imágenes de entrenamiento para otros modelos de robótica o visión.
- **Servidor multimodal local para aplicaciones**: desplegando `mlx_vlm.server` en el puerto 8080 se obtiene un endpoint compatible con OpenAI para integrar en aplicaciones de escritorio o demos internas.
- **Evaluación de calidad de cuantización**: investigadores pueden comparar las respuestas de esta versión 4-bit con el modelo base BF16 para medir la degradación en tareas de percepción espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo documenta tres puertas de verificación funcional ejecutadas en Linux MLX CUDA sobre una NVIDIA A100-SXM4-80GB:

| Verificación | Resultado | Métricas |
|---|---|---|
| Integridad de tensores y visión | PASS | 1.258 tensores, 351 de visión en BF16, 0 NaN |
| Razonamiento espacial textual | PASS | 1,4 s, 86,6 tok/s, temperatura 0,0 |
| Visión imagen-a-texto | PASS | 9,4 s, 36,3 tok/s, 5,59 GB de memoria GPU pico |

El autor indica explícitamente que el rendimiento en Metal (Apple Silicon) no se ha medido en dispositivo.

## Requisitos de hardware

- **VRAM / memoria unificada**: 8-16 GB para texto e imágenes; 24 GB o más para alta resolución o múltiples imágenes. Pico medido en A100: 5,59 GB.
- **GPU recomendadas**: Apple Silicon M1 a M5 (objetivo principal). En el lado CUDA, el autor validó con A100-SXM4-80GB mediante MLX CUDA, aunque no es el caso de uso previsto.
- **Consumer GPU**: el formato MLX está pensado para Apple Silicon; en GPU NVIDIA o AMD no es el camino natural (requeriría MLX CUDA, poco habitual en producción).
- **Opciones de despliegue**: `mlx_vlm.generate` (CLI), API Python `mlx-vlm`, y `mlx_vlm.server` con endpoint compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- **Latencia y throughput**: 86,6 tok/s en texto y 36,3 tok/s en imagen-a-texto sobre A100 con MLX CUDA. Sin datos en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| SenseNova-SI-1.3-Qwen3-VL-8B-MLX-4bit | 8,77B | no disponible | Inteligencia espacial, VLM | Apache 2.0 | MLX safetensors 4-bit |
| sensenova/SenseNova-SI-1.3-Qwen3-VL-8B (base) | 8B | no disponible | Inteligencia espacial, VLM | Apache 2.0 | safetensors BF16 |
| Qwen3-VL-8B (familia base) | ~8B | no disponible | VLM generalista | no disponible en esta ficha | safetensors |
| Otros VLM 8B con soporte MLX | no disponible | no disponible | VLM generalista | no disponible | MLX |

La comparativa con alternativas concretas no está disponible en la información proporcionada. La diferencia principal de esta variante frente al modelo base es el tamaño (5,38 GB frente a pesos BF16) y el consumo de memoria, a costa de una posible pérdida de precisión por la cuantización 4-bit.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte documentado de castellano.
- El rendimiento en Apple Silicon (Metal) no se ha medido; las cifras de tok/s proceden de una A100 con MLX CUDA y no son extrapolables.
- La cuantización 4-bit puede degradar tareas de percepción fina; el encoder visual se preserva en BF16 precisamente para mitigarlo, pero no hay evaluación comparativa publicada.
- Riesgo de alucinación inherente a los VLM: las descripciones espaciales pueden ser plausibles pero incorrectas, especialmente en escenas complejas o con oclusiones.
- No se documenta longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones o imágenes de alta resolución más allá de lo indicado (24 GB+ para multi-imagen).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión comunitaria sin validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de desplegar en producción.
- El formato MLX limita el despliegue a entornos Apple Silicon o MLX CUDA; no es portable a stacks estándar como vLLM o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-SI-1.3-Qwen3-VL-8B
- README en chino: https://huggingface.co/Melkor01/SenseNova-SI-1.3-Qwen3-VL-8B-MLX-4bit/blob/main/README_CN.md
- Librería mlx-vlm: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
