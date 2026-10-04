# AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP4 es una cuantización de precisión mixta en formato MLX del modelo multimodal Qwen3-VL-4B-Instruct, publicada por AutomatosX bajo la etiqueta de producto AXQuant (AXQ). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de tipo `Qwen3VLForConditionalGeneration` con 4.437.815.808 parámetros (4,44B) que combina una torre de visión con un decodificador de lenguaje y pipeline `image-text-to-text`.

El problema que resuelve esta ficha concreta es el de la ejecución local en Apple Silicon: el checkpoint aplica cuantización mixta (4 bits, 8 bits y BF16 según el tensor) sobre la ruta de lenguaje y conserva la torre de visión en BF16, con un presupuesto medido de 5,7229 bits por peso (BPW) y un tamaño de safetensors de 3,17 GB. Eso permite cargar un modelo visión-lenguaje de 4,44B en Macs con memoria unificada moderada mediante MLX-VLM.

Es relevante ahora porque el ecosistema MLX carece de cuantizaciones multimodales mixtas bien documentadas, pero conviene subrayar que el propio autor la marca como artefacto de desarrollo: no hay resultados de calidad, ni de contexto largo, ni de velocidad de kernels publicados, y no incluye manifiesto nativo validado para AX Engine. La etiqueta MXFP4 describe una clase de presupuesto de almacenamiento, no una precisión uniforme aplicada a todos los tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3VLForConditionalGeneration`); torre de visión + decodificador de lenguaje |
| Parametros totales | 4.437.815.808 (4,44B lógicos) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens configurados (metadato de configuración, no validado) |
| Tipos de cuantizacion | Mixta AXQuant: 4bit en 3,63B parámetros (81,87%), 8bit en 388,96M (8,76%), bf16 en 415,54M (9,36%); métodos `affine`, `mxfp4` y `bf16`; tamaños de grupo 32 y 64; 5,7229 BPW medidos en el modelo principal |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors para MLX (no incluye pesos PyTorch ni GGUF) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`) |
| Cuantizador | AXQuant 1.9.0 |
| Clase de presupuesto en el Hub | MXFP4 |
| Precision base declarada | 8bit |
| BPW planificado (ajustado a almacenamiento) | 6,3368 |
| Tamano de safetensors | 3,17 GB |
| Descarga completa aproximada | 3,19 GB |
| Vision | Presente (tensores preservados en BF16 en los shards principales) |
| Audio | Ausente |
| MTP | No incluido (`False`) |
| Runtime primario | MLX-VLM (AX Engine no establecido) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-VL-4B-Instruct original: un transformer denso con atención completa estándar que integra un codificador de visión y un decodificador de lenguaje autorregresivo, pensado para tareas `image-text-to-text`. AutomatosX no ha reentrenado ni ajustado el modelo; se trata exclusivamente de un proceso de conversión y cuantización desde la fuente BF16. El alcance de optimización declarado es `text-path`, es decir, la ruta de lenguaje, mientras que la torre de visión se mantiene en BF16 dentro de los shards principales.

Sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO) no hay información en la documentación proporcionada de este repositorio. La innovación técnica de este checkpoint es el esquema de cuantización: la asignación de precisiones se realizó sin calibración, usando únicamente priors de arquitectura (`architecture_prior`), y se ejecutaron 253 de 253 conversiones de módulos sin fallbacks. El resultado es una mezcla de tensores cuantizados a 4 bits (mayoría), 8 bits y BF16, con un BPW final de 5,7229 frente a los 6,3368 planificados inicialmente. No se incluyen sidecars de MTP ni de visión, y no se ha medido aceptación de decodificación especulativa ni velocidad de kernels.

## Capacidades

- Generación de texto y conversación multiturno en formato instructivo, heredadas del modelo base Qwen3-VL-4B-Instruct.
- Comprensión de imagen y texto conjuntamente (`image-text-to-text`): descripción de imágenes, respuesta a preguntas sobre contenido visual y tareas derivadas.
- Razonamiento multimodal básico: interpretación de gráficos, diagramas y capturas siempre que la torre de visión en BF16 preserve la señal original.
- Capacidades de código y matemáticas heredadas del modelo base, aunque el repositorio no publica evaluaciones que las cuantifiquen tras la cuantización.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este checkpoint cuantizado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible para este checkpoint cuantizado.
- Capacidades multilingües: no disponibles; el autor no declara lista de idiomas.
- Modo thinking explícito: no declarado en la documentación de este repositorio.
- Entrada de audio: no soportada (campo `Audio present: False`).
- Ejecución local en Apple Silicon mediante MLX-VLM, con vision y lenguaje cargados conjuntamente.

## Casos de uso

- Descripción automática de imágenes en local: el modelo acepta una ruta de imagen y un prompt y genera texto descriptivo a temperatura 0,0, lo que resulta útil para etiquetado de activos digitales o generación de metadatos sin enviar datos a la nube.
- Extracción de información de documentos escaneados: al combinar visión y texto, puede responder preguntas sobre facturas, formularios o capturas de pantalla, con la ventaja de que la torre de visión se mantiene en BF16 y conserva detalle fino.
- Prototipado de asistentes visuales en Mac: con 3,19 GB de descarga y MLX-VLM, un desarrollador puede iterar sobre prompts y flujos multimodales en un portátil Apple Silicon sin depender de GPUs dedicadas.
- Preprocesado de datasets multimodales: generación de descripciones o resúmenes de imágenes a escala moderada antes de entrenar otros modelos, aprovechando la licencia Apache 2.0.
- Accesibilidad: descripción de imágenes para usuarios con discapacidad visual en aplicaciones de escritorio, ejecutando el modelo en el propio dispositivo y evitando la subida de contenido personal.
- Evaluación comparativa de cuantizaciones: al existir hermanos `4bit` y `6bit` del mismo base, sirve como punto de referencia práctico para medir el compromiso entre tamaño en disco (3,19 GB en este pack) y calidad percibida en tareas reales.
- Análisis de interfaces de usuario: interpretación de capturas de pantalla para generar informes o pruebas automatizadas de accesibilidad y maquetación.

En cualquiera de estos escenarios conviene recordar que el autor no publica evidencias de calidad, por lo que el uso en producción requiere una validación propia previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se publican evidencias de calidad frente a BF16 o a líneas base uniformes, que no hay afirmación de retención de calidad, que la aceptación y velocidad de MTP no se han medido, y que la calidad de visión-lenguaje no se ha evaluado ni reclamado. La capacidad de 262.144 tokens es metadato de configuración, no una afirmación validada.

| Aspecto evaluado | Estado declarado |
|---|---|
| Calidad frente a BF16 o cuantización uniforme | No publicada; sin afirmación de retención |
| Contexto largo | Capacidad de 262.144 tokens como metadato, no validada |
| Velocidad de kernels de AX Engine | `unmeasured` |
| Aceptación y velocidad de MTP | No medidas; sin afirmación de aceleración |
| Calidad visión-lenguaje | No evaluada ni reclamada |
| Conversiones de módulos | 253/253 correctas, 0 fallbacks |
| Certificación de release | No certificada; gates M0-M8 de AXQuant no cerrados |

## Requisitos de hardware

- VRAM/unified memory estimada para inferencia: los pesos ocupan 3,17 GB (3,19 GB de descarga completa). Con overhead de runtime, caché KV y buffers, un mínimo práctico razonable se sitúa en torno a 8 GB de memoria unificada, cifra orientativa y no confirmada por el autor (que no reclama ningún mínimo).
- Contexto largo: dado que la ventana configurada es de 262.144 tokens, el consumo de caché KV crece de forma proporcional a la longitud real de la secuencia; para contextos muy largos se recomienda memoria unificada de 32 GB o 64 GB. No hay mediciones publicadas.
- GPU compatibles: al ser un checkpoint MLX, está orientado a Apple Silicon (familias M1, M2, M3 y M4 con memoria unificada). No se distribuyen pesos para CUDA, por lo que A100, H100 o RTX 4090 no son destinos soportados por este artefacto concreto.
- Cabe en GPU de consumo: sí, en el sentido de Macs de consumo; en el ecosistema NVIDIA no aplica, ya que el formato es MLX-Safetensors y no GGUF.
- Opciones de despliegue: MLX-VLM es la ruta de ejecución documentada (`python -m mlx_vlm.generate`). El autor indica que AX Engine no está establecido porque no se incluye un `model-manifest.json` nativo validado, y que la versión 7.5.7 registrada en el artefacto no constituye una comprobación de runtime.
- Latencia y throughput: no disponibles. No se han medido ni publicado cifras de tokens por segundo, TTFT ni rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y precision | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP4 | 4,44B | 262.144 tokens (configurado) | MLX safetensors, mixta 4/8/BF16, 5,7229 BPW, 3,17 GB | Apache 2.0 | Artefacto de desarrollo; sin evidencias de calidad publicadas |
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-4bit | 4,44B (mismo base) | 262.144 tokens (configurado) | MLX safetensors, presupuesto 4bit | Apache 2.0 | Menor almacenamiento; el autor remite al BPW exacto del pack |
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-6bit | 4,44B (mismo base) | 262.144 tokens (configurado) | MLX safetensors, presupuesto cercano a 6 BPW | Apache 2.0 | Mayor precisión media según el autor |
| Qwen/Qwen3-VL-4B-Instruct | 4,44B | 262.144 tokens | Safetensors BF16 | Apache 2.0 | Modelo original sin cuantizar; referencia de calidad y mayor tamaño en disco |
| Cuantizaciones MLX de terceros (por ejemplo, aliases `mlx-community` MXFP4-Q4) | No disponible | No disponible | MLX safetensors | No disponible | Mencionadas de forma indirecta en el repositorio ax-engine; no verificadas en esta busqueda |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El repositorio no documenta evaluación de sesgos ni del modelo base ni de la versión cuantizada.
- Riesgo de alucinación: no cuantificado. Al no existir evaluación de calidad tras la cuantización, no puede descartarse degradación respecto al BF16 original en tareas de razonamiento o de descripción de imágenes.
- La etiqueta MXFP4 describe una clase de presupuesto de almacenamiento, no una precisión uniforme: un 81,87% de los parámetros del modelo principal está a 4 bits, lo que puede afectar a la fidelidad en tareas sensibles.
- La asignación de precisión se hizo sin calibración, basándose solo en priors de arquitectura, lo que reduce la garantía de que los tensores más sensibles hayan recibido mayor precisión.
- Sin evidencias de calidad: el autor no publica resultados frente a BF16 ni frente a cuantizaciones uniformes, y declara ausencia de afirmación de retención de calidad.
- Contexto largo no validado: los 262.144 tokens son metadato de configuración; no hay pruebas de comportamiento correcto a esa longitud.
- AX Engine no operativo para este pack: no se incluye manifiesto nativo validado, y la versión registrada no constituye una verificación de runtime.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene revisar los términos del modelo base Qwen3-VL-4B-Instruct para confirmar compatibilidad.
- Portabilidad limitada: al ser MLX, no es desplegable directamente con vLLM, TGI, llama.cpp u Ollama en el formato distribuido; requeriría una conversión adicional.
- Reproducibilidad: se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.
- Madurez: el paquete está marcado como evidencia de desarrollo y no certificado; los gates formales M0-M8 de AXQuant no están cerrados.
- Idiomas: no se declara lista de idiomas soportados, por lo que no puede asumirse cobertura multilingüe verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP4
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Repositorio ax-engine en GitHub: https://github.com/defai-digital/ax-engine
- MLX-VLM (runtime de ejecución): no se ha encontrado un enlace directo en los resultados de busqueda; se instala mediante `python -m pip install -U mlx-vlm`
- Paper del modelo base: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
