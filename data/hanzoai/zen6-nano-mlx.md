# hanzoai/zen6-nano-mlx

## Resumen

Zen 6 Nano (9B) es un modelo multimodal de tipo image-text-to-text desarrollado por Hanzo AI en colaboración con Zen LM, distribuido en formato nativo MLX para Apple Silicon. Se publica bajo licencia Apache-2.0 y contiene 9.410.903.280 parámetros (aproximadamente 9,4 mil millones), empaquetados en un repositorio de 3,6 GB gracias a una cuantización ternaria de 2 bits con transformada de Hadamard (denominada `prism_hadamard_qwen35` en las etiquetas del repositorio).

El modelo está pensado para ejecutarse localmente en hardware Apple Silicon (familias M1, M2, M3 y M4 Max) mediante la librería MLX, e incorpora una torre de visión multimodal en FP16 junto con un runtime específico consciente de Hadamard. Según la model card, los pesos conservan los parámetros post-entrenados de `zen6-nano` con cuantización ternaria STE QAT (straight-through estimator, quantization-aware training) en base Hadamard, e incluyen la identidad del modelo Zen 6 y capacidades agénticas de tool calling mediante el protocolo MCP de Hanzo con etiquetas `<tool_call>`.

Su relevancia actual radica en la combinación de tres factores poco habituales: cuantización extrema a 2 bits ternarios con entrenamiento consciente de cuantización, soporte multimodal (texto e imagen) y un formato optimizado para inferencia local en Apple Silicon. No se dispone de información pública sobre benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión FP16; cuantización ternaria 2-bit en base Hadamard (prism_hadamard_qwen35) |
| Parametros totales | 9.410.903.280 (~9,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 2-bit afín con Hadamard (STE QAT); torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime propio en `runtime/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal orientado a tareas image-text-to-text. La model card menciona una torre de visión en FP16 que se mantiene en precisión completa mientras el cuerpo del modelo se cuantiza a 2 bits ternarios. La etiqueta `prism_hadamard_qwen35` sugiere una base derivada de la familia Qwen 3.5, aunque no se detalla la relación exacta con el modelo original ni el proceso de destilación o adaptación.

El entrenamiento incluye una fase de QAT (quantization-aware training) con estimador straight-through sobre una base Hadamard, lo que permite preservar la calidad bajo una cuantización ternaria de 2 bits. Según el autor, los pesos resultantes incorporan la identidad del modelo Zen 6 y capacidades de tool calling mediante el protocolo MCP con etiquetas `<tool_call>`. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Tool calling / function calling mediante el protocolo MCP de Hanzo con etiquetas `<tool_call>`.
- Comportamiento agéntico orientado a flujos multi-paso (según la model card).
- Ejecución local en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponibles en la documentación.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente local en Mac con privacidad total: el modelo se ejecuta íntegramente en Apple Silicon mediante MLX, sin enviar datos a la nube, lo que lo hace adecuado para entornos con requisitos estrictos de confidencialidad.
- Automatización agéntica en escritorio: gracias al soporte de MCP y `<tool_call>`, puede integrarse en flujos que invoquen herramientas locales (sistema de ficheros, calendario, APIs internas) desde un portátil o Mac Studio.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas, diagramas o formularios escaneados junto con instrucciones textuales para extraer información estructurada.
- Prototipado rápido en investigación: su reducido tamaño en disco (3,6 GB) y su licencia Apache-2.0 permiten experimentar con cuantización ternaria y evaluar el impacto en calidad sin infraestructura dedicada.
- Desarrollo de asistentes conversacionales embebidos: la ventana de contexto no está documentada, pero el formato MLX permite desplegarlo en aplicaciones macOS nativas como backend de chat.
- Evaluación de técnicas de cuantización extrema: útil como referencia para estudiar el comportamiento de modelos 2-bit ternarios con QAT en tareas multimodales y de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 3,6 GB en disco; la inferencia requiere al menos esa cantidad de memoria unificada más overhead del runtime MLX.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 Max (según la model card); no se menciona soporte CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente (se recomienda 8 GB o más).
- Opciones de despliegue: MLX con el runtime incluido (`runtime/vision_artifact.py`, `quickstart.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Zen 6 Nano (9B) MLX 2-bit | ~9,4 B | no disponible | Sí (image-text-to-text) | Apache-2.0 | safetensors MLX |
| Qwen2.5-VL-7B | ~7 B | 32k (típico en la familia) | Sí | Apache-2.0 (variantes) | safetensors, GGUF |
| Llama 3.2 11B Vision | ~11 B | 128k | Sí | Llama 3.2 Community | safetensors, GGUF |
| Gemma 3 12B | ~12 B | 128k | Sí | Gemma Terms | safetensors, GGUF |

Nota: los datos de los modelos comparativos corresponden a información pública general de sus familias; no se dispone de comparaciones directas de rendimiento con Zen 6 Nano en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a modelos de tamaño similar es desconocido.
- La cuantización ternaria de 2 bits puede degradar la calidad en tareas de razonamiento complejo, matemáticas o código; no hay evaluaciones públicas que lo cuantifiquen.
- Solo se documenta soporte para Apple Silicon mediante MLX; no hay evidencia de funcionamiento en CUDA, ROCm ni CPU.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- No se documenta la longitud de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinación no evaluado; se recomienda validación humana en producción.
- Sesgos conocidos: no disponibles.
- Aunque la licencia es Apache-2.0, se deben preservar los avisos del archivo `NOTICE` con las atribuciones upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
