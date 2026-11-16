# Bob99Bob/openjev-qwen3.5-4b-nli-v5-mlx-affine5

## Resumen

OpenJev v5 4B (también conocido como `qwen3.5-4b-nli-v5`) es un checkpoint derivado del modelo Qwen3.5-4B, desarrollado por los autores de OpenJev y publicado originalmente en el repositorio `AlexWortega/openjev`. Este repositorio concreto, mantenido por Bob99Bob, no contiene un modelo nuevo ni entrenado: es una conversión de los pesos del editor al formato MLX con cuantización affine de 5 bits, pensada para ejecutarse en Apple Silicon mediante el servidor veJ.

El modelo resuelve dos tareas dentro del ecosistema veJ: es el único componente que procesa imágenes (gracias a su torre de visión heredada de Qwen3.5) y actúa como lector de texto para las preguntas de cribado (NLI) que los distintos niveles del sistema plantean antes de llegar al juez. La arquitectura subyacente es un transformer Qwen3.5 de 4.205.758.976 parámetros totales, con una torre de visión separada de 0,67 GB que no se incluye en este repositorio.

La relevancia de esta ficha es acotada y específica: no se trata de un modelo de propósito general listo para producción, sino de un artefacto de despliegue para un pipeline concreto (veJ) sobre hardware Apple. Su utilidad depende por completo de ese contexto, y sus métricas publicadas (exactitud de cribado entre 0,777 y 0,838 según el ancho de bits) proceden de las mediciones internas del autor de la conversión, no de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de visión (arquitectura exacta del bloque no detallada en la información disponible) |
| Parámetros totales | 4.205.758.976 |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Affine 5 bits, group size 64 (249 módulos: embedding de tokens y todos los Linear de las capas del transformer); cabeza de score en bfloat16; parámetros recurrentes `A_log` en float32 |
| Idiomas soportados | No disponible |
| Licencia | MIT (modelo base Qwen3.5-4B bajo Apache-2.0) |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.5-4B original: un transformer con una torre de visión que permite el procesamiento image-text-to-text. La conversión documentada cuantiza únicamente el embedding de tokens y los 249 módulos Linear de las capas del transformer en affine de 5 bits con group size 64, usando `quantize_model` de mlx-lm sobre MLX 0.32.2. El resto de tensores se mantiene sin cambios respecto al editor, incluida la cabeza de score en bfloat16 y los parámetros recurrentes `A_log` en float32. El convertidor verifica el sha256 de cada tensor.

No se ha realizado ningún entrenamiento ni ajuste fino en esta conversión: los pesos son los del editor, solo en otro formato. El entrenamiento original del checkpoint v5, según la nota del propio editor reproducida en la model card, incluye deliberadamente las particiones de TRAIN y TEST de MMLU, ARC, GSM8K, HellaSwag, WinoGrande, GPQA-diamond, CLINC-150, Banking77 y ESCI (lista exacta en `panel_manifest.json`). No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Clasificación de texto y NLI (inferencia de lenguaje natural) como tarea principal declarada en el pipeline.
- Procesamiento image-text-to-text: es el único modelo del ecosistema veJ que lee imágenes, mediante la torre de visión extraída del checkpoint del editor.
- Lectura de texto para preguntas de cribado antes del juez en el pipeline veJ.
- Generación de texto y razonamiento heredados de la base Qwen3.5-4B (capacidades del modelo original, no verificadas en esta conversión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Cribado NLI en pipelines de decisión: el modelo responde a preguntas de inferencia textual que los distintos niveles de veJ plantean antes de invocar al juez, con una exactitud medida de 0,835 a 5 bits y 0,838 a 16 bits.
- Procesamiento de imágenes en local sobre Mac: al ser el único lector de imágenes de veJ, se usa para extraer información visual de entradas image-text-to-text sin salir del hardware Apple.
- Despliegue en Apple Silicon con memoria limitada: la cuantización de 5 bits ocupa unos 2,9 GB de repositorio, lo que permite servir el modelo en equipos consumer de Apple frente a los 9,1 GB del checkpoint original.
- Clasificación de intenciones y etiquetado de consultas: el checkpoint v5 incluye CLINC-150, Banking77 y ESCI en su entrenamiento, lo que lo hace apto para tareas de clasificación de utterances y relevancia de búsqueda dentro del ecosistema veJ.
- Servicio local de inferencia mediante veJ: el repositorio documenta el arranque del servidor con `mlx_openjev_packed_gdn.py` en el puerto 29742, pensado para integrarse en el aprovisionamiento `provision/m4_models.py fetch`.
- Evaluación de umbrales de confianza: las mediciones del autor muestran que 6 bits a umbral 0,98 resuelve lo que 5 bits resuelve a 0,95, lo que permite calibrar políticas de aceptación en pipelines de clasificación sensibles a la confianza.

## Benchmarks y rendimiento

| Ancho de bits | Exactitud en preguntas de cribado |
|---|---|
| 4 bits | 0,777 |
| 5 bits | 0,835 |
| 6 bits | 0,837 |
| 16 bits | 0,838 |

Estos datos proceden de las mediciones propias de veJ (metodología y resultados completos en `docs/BENCHMARKS.md` del repositorio GitHub). No son benchmarks estándar (MMLU, HumanEval, GSM8K) y el propio editor advierte que los números en esos benchmarks carecen de sentido para este checkpoint, ya que sus particiones de test se incluyeron en el entrenamiento.

## Requisitos de hardware

- VRAM/unificada estimada: unos 2,9 GB para los pesos cuantizados a 5 bits, más la torre de visión de 0,67 GB extraída del checkpoint original de 9,1 GB.
- GPU recomendadas: hardware Apple Silicon (la librería es `mlx` y el repositorio está etiquetado `apple-silicon`); no se documenta soporte para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en equipos Apple con memoria unificada suficiente para ~3,6 GB de pesos más overhead del servidor.
- Opciones de despliegue: servidor veJ (`mlx_openjev_packed_gdn.py`), con extracción previa de la torre de visión mediante `mlx_openjev_vision_assets.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card solo indica cualitativamente que 5 bits "lee más rápido" que 6 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenJev v5 4B MLX affine 5-bit (este) | 4.205.758.976 | No disponible | Affine 5 bits, g64 | MIT | Hugging Face, MLX |
| AlexWortega/openjev (original) | No disponible | No disponible | BF16 (9,1 GB) | MIT | Hugging Face |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | Múltiple (formato original) | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (clasificadores NLI de 4B o modelos image-text-to-text para Apple Silicon) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El editor advierte explícitamente que el checkpoint v5 se entrenó con las particiones de TEST de MMLU, ARC, GSM8K, HellaSwag, WinoGrande, GPQA-diamond, CLINC-150, Banking77 y ESCI; cualquier número en esos benchmarks es inválido para este modelo.
- La exactitud de cribado a 4 bits cae 6 puntos respecto a 5 bits (0,777 frente a 0,835), por lo que reducir más la cuantización degrada la calidad de forma apreciable.
- El repositorio no es autónomo: requiere descargar `config.json`, `tokenizer.json`, `tokenizer_config.json` y `model.safetensors` del editor en la revisión exacta `a298f274886c4676c42f1a4262401b6aa9653e6d`, además de `preprocessor_config.json` de Qwen/Qwen3.5-4B.
- La torre de visión no está incluida en este repositorio y debe extraerse del checkpoint original de 9,1 GB mediante el script del autor.
- El modelo está diseñado para el servidor veJ; no hay evidencia documentada de funcionamiento en vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible.
- La licencia MIT se declara a partir de la model card del editor, pero el repositorio original no contiene fichero de licencia; la base Qwen3.5-4B es Apache-2.0 y el aviso `NOTICE` documenta los cambios de la conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Bob99Bob/openjev-qwen3.5-4b-nli-v5-mlx-affine5
- Modelo base (editor): https://huggingface.co/AlexWortega/openjev
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio veJ: https://github.com/ordinarybob/vej
- Metodología y resultados de benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md
