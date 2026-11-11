# kittyhy/PhyRubric-Judge

## Resumen

PhyRubric-Judge es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, desarrollado por el usuario kittyhy, especializado en la evaluación automática de vídeos generados por IA desde la perspectiva de la física cotidiana. El adaptador recibe el pie de foto (caption) empleado para generar un clip y 16 fotogramas muestreados uniformemente, y devuelve una puntuación estructurada en JSON con la adherencia semántica (sa_score), la coherencia física (pc_score), un indicador de evaluabilidad (pc_assessable) y una justificación con marcas temporales.

El modelo resuelve un problema concreto en el pipeline de evaluación de generadores de vídeo: medir de forma automática si un clip respeta las leyes físicas elementales (gravedad, colisiones, continuidad de objetos, conservación de masa) además de comprobar si se corresponde con la descripción textual. Se entrena sobre PhyRubric-Train, un conjunto de 3.788 clips procedentes de cuatro generadores de vídeo etiquetados con el protocolo de rúbrica PhyRubric.

Es relevante porque la evaluación de vídeo generado sigue dependiendo en gran medida de anotadores humanos, y este adaptador ofrece un juez reproducible y de código abierto (con los scripts en un repositorio de GitHub) que no necesita ver la rúbrica en tiempo de inferencia. Al ser un adaptador LoRA de rango 16 sobre un modelo base de 8B, su huella es reducida (0,2 GB en el repositorio) y puede desplegarse sobre el modelo base ya existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer multimodal Qwen3-VL-8B-Instruct; capas lineales del modelo de lenguaje |
| Parametros totales | no disponible (adaptador LoRA de 0,2 GB; el modelo base Qwen3-VL-8B-Instruct tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-8B-Instruct, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-VL-8B-Instruct, un modelo vision-language de 8.000 millones de parámetros. El LoRA tiene rango 16 y alpha 32, y se inserta en todas las capas lineales del modelo de lenguaje (no se especifica si también en el tower visual). La entrada combina el caption de generación con hasta 16 fotogramas muestreados uniformemente, redimensionados a un máximo de 448x448 píxeles, con FPS=24 y FPS_MAX_FRAMES=16. El adaptador se entrena con ms-swift 4.5, 2 épocas, learning rate 1e-4 y precisión bf16.

El conjunto de entrenamiento es PhyRubric-Train, compuesto por 3.788 clips generados por cuatro generadores de vídeo distintos y etiquetados con el protocolo de rúbrica PhyRubric. La innovación principal es el formato de salida: el juez produce un JSON con `sa_score` (adherencia semántica, 1-5), `pc_assessable` (si el evento físico central aparece en el clip), `pc_score` (sentido físico común, 1-5) y `reason` (explicación con marcas temporales). El juez nunca ve la rúbrica en inferencia, lo que lo convierte en un evaluador ciego respecto al protocolo de anotación. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición lingüística del dataset.

## Capacidades

- Evaluación de adherencia semántica de vídeos generados respecto al caption de origen, con puntuación de 1 a 5.
- Evaluación de sentido físico común (gravedad, colisiones, continuidad de objetos, conservación) con puntuación de 1 a 5.
- Detección de si el evento físico central descrito en el caption es siquiera evaluable en el clip (`pc_assessable`).
- Generación de justificaciones con marcas temporales que explican la puntuación asignada.
- Salida estructurada en JSON, apta para pipelines automáticos de evaluación.
- Procesamiento de vídeo mediante muestreo de hasta 16 fotogramas a 448x448 píxeles.
- Capacidades multimodales heredadas del modelo base Qwen3-VL-8B-Instruct (visión y lenguaje), aunque el adaptador está especializado en la tarea de evaluación.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo thinking específicas del adaptador.

## Casos de uso

- Evaluación automática de generadores de vídeo: el adaptador puntúa cada clip generado con `sa_score` y `pc_score`, permitiendo comparar cuatro generadores distintos (los usados en PhyRubric-Train) sin anotación humana continua.
- Control de calidad en pipelines de generación de vídeo: integrado tras el generador, filtra clips con `pc_score` bajo o `pc_assessable=false` antes de publicarlos o enviarlos a revisión humana.
- Investigación en física y visión artificial: permite cuantificar qué tipos de eventos físicos fallan más en los generadores actuales y con qué frecuencia, gracias a las justificaciones con marcas temporales.
- Benchmarking reproducible: los scripts de `scripts/infer.sh` puntúan PhyRubric-Bench y calculan métricas, lo que facilita la comparación entre versiones de un mismo generador o entre modelos.
- Aumento de datos de evaluación: las justificaciones timestamped pueden reutilizarse como material de entrenamiento para otros modelos de evaluación de vídeo.
- Detección de alucinaciones visuales: `pc_assessable=false` identifica clips donde el evento físico descrito no aparece, útil para auditar la fidelidad de los generadores.
- Evaluación de adherencia texto-vídeo en producción: el `sa_score` sirve como métrica de alineación caption-clip en sistemas de generación condicionada por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `scripts/infer.sh` evalúa PhyRubric-Bench e imprime las métricas, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3-VL-8B-Instruct, que en bf16 necesita aproximadamente 16 GB de VRAM (estimación estándar para 8B en bf16, no confirmada en la información).
- GPU recomendadas: no especificadas en la información. Por tamaño del modelo base, cabría esperar A100, H100 o RTX 4090/A6000 con suficiente VRAM, pero no se documenta.
- Cabe en GPU de consumo: no confirmado; un modelo de 8B en bf16 requiere alrededor de 16 GB, por lo que una RTX 4090 (24 GB) sería suficiente en teoría, pero la información no lo confirma.
- Opciones de despliegue: ms-swift (usado en el entrenamiento y en `judge/infer.py`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de evaluación de vídeo con sentido físico común ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3-VL-8B-Instruct y del adaptador antes de usarlo en producción.
- Idiomas no documentados: se desconoce si el juez funciona correctamente con captions en castellano u otros idiomas distintos del inglés.
- Especialización estrecha: el adaptador está entrenado solo para evaluación de vídeo con sentido físico común; no debe usarse como modelo generalista.
- Dependencia del muestreo de fotogramas: la inferencia debe replicar exactamente el muestreo de entrenamiento (FPS=24, FPS_MAX_FRAMES=16, VIDEO_MAX_PIXELS=448*448); desviarse puede degradar las puntuaciones.
- Dependencia del system prompt: el juez fue entrenado con un system prompt concreto (`data/system_prompt.txt`); usar otro puede alterar el formato de salida.
- Riesgo de alucinación en las justificaciones: las explicaciones con marcas temporales pueden no corresponderse con lo que realmente ocurre en el clip, especialmente en eventos físicos ambiguos.
- Sesgo de los generadores de entrenamiento: el adaptador se entrenó con clips de solo cuatro generadores, por lo que puede generalizar peor a generadores no vistos.
- Sin métricas publicadas: no hay benchmarks ni tasas de acuerdo con anotadores humanos en la información disponible, lo que impide validar su fiabilidad antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/kittyhy/PhyRubric-Judge
- Repositorio de código, datos y scripts de evaluación: https://github.com/chenyil6/phyRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
