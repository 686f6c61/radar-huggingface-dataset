# digiflow/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-MLX-8bit

## Resumen

Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-MLX-8bit es una compilación cuantizada a 8 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated, un fine-tune de código y razonamiento de Qwen3.8-27B al que se le ha eliminado la dirección de rechazo mediante abliteration. La publica el usuario digiflow (NovaMLX) y está pensada específicamente para ejecutarse en Macs con Apple Silicon, aprovechando el framework MLX de Apple.

El modelo conserva la arquitectura híbrida de atención de Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con 64 capas de las cuales 48 son de atención lineal y 16 de atención completa, y una ventana de contexto de 262.144 tokens. Con 27.356.728.560 parámetros totales y un peso de repositorio de 30 GB, el objetivo de esta build es hacer viable un modelo de casi 28B en memoria unificada de 48 GB o más, con una velocidad de decodificación aproximadamente tres veces superior a la versión BF16.

La relevancia actual reside en dos factores: por un lado, la cuantización 8-bit calibrada con imatrix (oQ8e) mantiene una fidelidad alta respecto al BF16 (KL 0.00115, top-1 98,6 %); por otro, la conversión a nombres de tensor estándar de MLX permite cargarlo en cualquier runtime MLX, no solo en oMLX. Es un modelo sin censura, orientado a generación de código, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido, solo pesos de texto) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit affine, group 64, calibrada con imatrix (oQ8e) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX; cabeza MTP en `mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5, un transformer híbrido con 64 capas: 48 capas de atención lineal y 16 de atención completa. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la calidad en las capas de atención completa. El modelo incluye una cabeza MTP (multi-token prediction), conservada en el fichero `mtp.safetensors`, que puede habilitar decodificación especulativa o predicción multi-token.

La cadena de entrenamiento y transformación es la siguiente: primero, nerkyor realizó un fine-tune de código y razonamiento sobre Qwen3.8-27B con cabeza MTP; después, huihui-ai aplicó abliteration para eliminar la dirección de rechazo; a continuación, hakunokina generó la cuantización oQ8e (8-bit affine, group 64, calibrada con imatrix); y finalmente NovaMLX convirtió los nombres de tensor al esquema estándar de MLX para que el modelo cargue en cualquier runtime MLX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, con modo "thinking" eficiente (EfficientThink) según el nombre del modelo base.
- Generación de código: el fine-tune Coder390 está orientado a tareas de programación.
- Razonamiento matemático y resolución de problemas, respaldado por los resultados en GSM8K.
- Predicción multi-token mediante la cabeza MTP conservada en `mtp.safetensors`.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modelo sin censura: se ha eliminado la dirección de rechazo mediante abliteration.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (los pesos son solo de texto).

## Casos de uso

- Asistencia a la programación en local en Mac: el modelo puede generar y completar código en un Mac con 48 GB o más de memoria unificada, con una velocidad de ~15 tok/s, lo que lo hace utilizable de forma interactiva sin depender de la nube.
- Procesamiento de repositorios completos: con 262.144 tokens de contexto, puede analizar ficheros extensos, múltiples módulos o documentación técnica en una sola pasada para tareas de revisión y refactorización.
- Generación de tests y documentación: el fine-tune de código permite producir pruebas unitarias y documentación a partir de fragmentos de código existentes.
- Investigación sobre seguridad y alineación: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin dirección de rechazo y comparar con la versión original.
- Prototipado de pipelines de razonamiento: la cabeza MTP y el modo EfficientThink permiten experimentar con decodificación multi-token y estrategias de razonamiento eficiente.
- Inferencia privada y offline: al ejecutarse en local con MLX, permite trabajar con código propietario sin enviar datos a servicios externos.
- Evaluación de cuantizaciones: la build 8-bit calibrada con imatrix es útil para medir la degradación respecto a BF16 en tareas de código (KL 0.00115, top-1 98,6 %).

## Benchmarks y rendimiento

Resultados de la suite de precisión de oMLX, tomados de la build oQ8e, con thinking desactivado:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro | 64,7 |
| GSM8K | 95,0 |
| HumanEval | 90,8 |
| MBPP | 80,0 |
| LiveCodeBench | 68,0 |

Velocidad medida en un Mac Studio M4 Max con 128 GB y servidor NovaMLX:

| Build | Velocidad |
|---|---|
| BF16 | ~5,4 tok/s |
| Esta build (8-bit) | ~15 tok/s en decodificación |
| Memoria residente | ~27 GB wired |

## Requisitos de hardware

- VRAM/memoria unificada: ~27 GB residentes en memoria wired; se recomienda un Mac con 48 GB o más de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con 48 GB o más; el benchmark se realizó en un Mac Studio M4 Max de 128 GB.
- GPU NVIDIA: no disponible; esta build es específica para MLX y Apple Silicon.
- Cabe en consumer GPU: no aplica a GPUs NVIDIA por el formato MLX; en Apple Silicon, sí en configuraciones de 48 GB o más.
- Opciones de despliegue: runtime MLX estándar (gracias a la conversión de nombres de tensor), servidor NovaMLX, oMLX ≥ 0.7.1 (para el layout original `language_model.*`).
- Latencia y throughput: ~15 tok/s de decodificación en M4 Max de 128 GB, aproximadamente 3× la velocidad de la build BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (MLX 8-bit) | 27,36B | 262.144 | Apache 2.0 | safetensors MLX | Abliterated, solo Apple Silicon |
| huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated (base) | 27,36B | 262.144 | Apache 2.0 | safetensors | Sin cuantizar, abliterated |
| hakunokina/...-oQ8e-mtp (oQ8e) | 27,36B | 262.144 | Apache 2.0 | safetensors oMLX | Layout `language_model.*`, requiere oMLX ≥ 0.7.1 |
| Qwen3.8-27B (upstream) | 27,36B | 262.144 | no disponible en la información | safetensors | Sin abliteration ni fine-tune de código |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, salvo la fidelidad de la cuantización (KL 0.00115, top-1 98,6 % frente a BF16).

## Limitaciones y advertencias

- Modelo sin censura: la dirección de rechazo se ha eliminado mediante abliteration; el usuario es responsable del uso y del cumplimiento legal aplicable.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las transformaciones intermedias.
- Específico de Apple Silicon: no se puede desplegar en GPUs NVIDIA ni en entornos CUDA con este formato.
- Requiere 48 GB o más de memoria unificada; no cabe en Macs de 16 o 32 GB.
- El modo EfficientThink y la cabeza MTP pueden requerir configuración específica del runtime; no se documentan los parámetros exactos.
- No se han publicado datos sobre sesgos, tool calling ni comportamiento en agentes multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/digiflow/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-MLX-8bit
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated
- Autor del fine-tune: https://huggingface.co/nerkyor
- Abliteration: https://huggingface.co/huihui-ai
- Cuantización oQ8e: https://huggingface.co/hakunokina
- NovaMLX (conversión de formato): https://github.com/lucasliu/novamlx
