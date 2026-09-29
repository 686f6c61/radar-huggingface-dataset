# Atomic-Germ/LFM2-2.6B-NPU2

## Resumen

Atomic-Germ/LFM2-2.6B-NPU2 es una conversión del modelo LiquidAI/LFM2-2.6B publicada por el usuario Atomic-Germ, orientada a la ejecución sobre las NPU AMD XDNA2 (arquitectura Phoenix/Strix) presentes en los procesadores AMD Ryzen AI. La ficha del repositorio recoge la model card de la variante LFM2-2.6B-Transcript, un ajuste fino de LFM2-2.6B desarrollado conjuntamente por Liquid AI y AMD para el resumen de transcripciones de reuniones de forma totalmente local, con el objetivo declarado de que los datos de la reunión no abandonen el dispositivo.

LFM2 es una familia de modelos híbridos "Liquid" que combina convoluciones cortas con puertas multiplicativas, un diseño pensado para inferencia eficiente en CPU, GPU y NPU. El modelo declarado tiene 2,6 mil millones de parámetros, soporta únicamente inglés y se distribuye bajo la licencia lfm1.0 (etiquetada como `license: other`). El repositorio ocupa 1,9 GB y declara `transformers` como librería, aunque su propósito real es el despliegue sobre NPU mediante el ecosistema FastFlowLM.

La relevancia de esta conversión radica en el nicho al que apunta: modelos pequeños de resumen ejecutable íntegramente en hardware de portátil con NPU, sin enviar transcripciones confidenciales a la nube, y con un consumo declarado inferior a 3 GB de RAM en la variante Transcript. Se trata, sin embargo, de un repositorio sin descargas ni valoraciones en el momento de la consulta, y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2 (modelo Liquid con convoluciones cortas y puertas multiplicativas); configuración exacta de capas no disponible |
| Parámetros totales | 2,6 mil millones (según el nombre del modelo); no confirmado de forma explícita en la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para este repositorio; la familia LFM2-2.6B-Transcript publica variantes GGUF, ONNX y MLX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | lfm1.0 (declarada como `license: other`) |
| Formato de pesos | No confirmado. La etiqueta `library_name: transformers` apunta a safetensors, pero el tamaño del repositorio (1,9 GB) es inferior a los ~5,2 GB esperables para 2,6B parámetros en bf16 |

## Arquitectura y entrenamiento

La arquitectura de partida es LFM2, descrita por sus autores como un modelo híbrido Liquid con puertas multiplicativas y convoluciones cortas, diseñado para funcionar de forma eficiente en CPU, GPU y NPU (teléfonos, portátiles o vehículos). La model card del repositorio corresponde a LFM2-2.6B-Transcript, un ajuste fino de LFM2-2.6B entrenado específicamente para resumir transcripciones de reuniones de 30 a 60 minutos, generando salidas estructuradas con puntos clave, decisiones y elementos de acción, con un tono y formato consistentes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) más allá del diseño híbrido de la familia. El aspecto diferencial de este repositorio concreto es la conversión para NPU2: el autor mantiene el proyecto OpenNPU, una cadena de herramientas abierta para la ingeniería inversa del formato binario `xclbin` y la reimplementación de los kernels de la NPU AMD XDNA2, y existe una ruta equivalente dentro del proyecto FastFlowLM (`src/xclbins/LFM2-2.6B-Transcript-NPU2`).

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Resumen de transcripciones de reuniones largas: la model card indica que cubre reuniones de 30 a 60 minutos.
- Producción de salidas estructuradas y con formato estable: resumen ejecutivo, resumen detallado, elementos de acción, decisiones clave, participantes y temas tratados.
- Atribución de elementos de acción a personas concretas cuando la transcripción lo menciona.
- Ejecución local en CPU, GPU y NPU (en la variante Transcript, con menos de 3 GB de RAM declarados para reuniones largas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el propio modelo base advierte que está pensado para conversaciones de un solo turno con un formato concreto.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales: no se documentan modos de razonamiento explícito, visión ni audio.

## Casos de uso

- Resumen de reuniones internas de equipo: se introduce la transcripción con el formato de cabecera (título, fecha, hora, duración, participantes) y los turnos por hablante, y el modelo devuelve puntos clave y decisiones sin que el contenido salga del portátil.
- Actas de comités de dirección y juntas: con el prompt de resumen ejecutivo se obtienen dos o tres frases con los resultados y decisiones principales, adecuadas para circulación rápida entre directivos.
- Llamadas de ventas y conversaciones con clientes: extracción de compromisos y siguientes pasos mediante el prompt de elementos de acción, útil para equipos comerciales que quieren registrar el seguimiento sin subir el audio a un servicio externo.
- Entornos regulados o sensibles (sanidad, legal, banca, sector público): al ejecutarse íntegramente en el dispositivo, permite procesar transcripciones sujetas a requisitos de confidencialidad o residencia de datos que impedirían usar una API en la nube.
- Trabajo sin conexión o con conectividad limitada: despliegue en portátiles con Ryzen AI para técnicos de campo, auditorías o inspecciones donde no hay red disponible.
- Extracción de tareas para gestores de proyectos: el prompt de elementos de acción permite generar listas con responsables que después se importan a herramientas de seguimiento.
- Generación de resúmenes en varios formatos a partir de la misma transcripción: combinando los prompts de temas discutidos, participantes y decisiones en una sola petición, se obtiene un acta completa en una única pasada.
- Prototipado e investigación sobre despliegue en NPU: el repositorio sirve como referencia para quienes trabajan con la cadena de herramientas OpenNPU o con FastFlowLM sobre AMD XDNA2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que la calidad de resumen se aproxima a la de modelos mucho mayores y que el consumo se mantiene por debajo de 3 GB de RAM en reuniones largas, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de resumen, ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (valores derivados del número de parámetros, no confirmados por el autor): en bf16/fp16 en torno a 5,2 GB solo de pesos, más caché KV; en cuantización de 8 bits aproximadamente 2,6-3 GB; en 4 bits aproximadamente 1,4-1,8 GB.
- Memoria declarada: la model card de la variante Transcript indica menos de 3 GB de RAM para reuniones largas.
- Acelerador objetivo: NPU AMD XDNA2 (Phoenix/Strix) de los procesadores AMD Ryzen AI.
- GPU recomendadas: no disponible. Para el formato nativo, cualquier GPU con suficiente VRAM para 2,6B parámetros (por ejemplo, una RTX 3060 de 12 GB o superior) sería suficiente, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: previsiblemente sí en modelos con 6-8 GB de VRAM o más en cuantizaciones de 4-8 bits, aunque no está confirmado.
- Opciones de despliegue: FastFlowLM para NPU AMD Ryzen AI (descrito como "como Ollama, pero específico para NPU AMD"); Transformers y vLLM para el formato nativo de LFM2-2.6B-Transcript; llama.cpp para las variantes GGUF; ONNX Runtime para despliegue multiplataforma; MLX para Apple Silicon.
- Latencia y throughput estimados: no disponible. La model card afirma "resúmenes rápidos en segundos, no en minutos", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| Atomic-Germ/LFM2-2.6B-NPU2 | 2,6B (según nombre) | No disponible | Inglés | lfm1.0 | No confirmado (repo de 1,9 GB) | Conversión para NPU AMD XDNA2; 0 descargas y 0 valoraciones |
| LiquidAI/LFM2-2.6B | 2,6B | No disponible | No disponible | lfm1.0 | Nativo (Transformers, vLLM) | Modelo base sobre el que se construye este repositorio |
| LiquidAI/LFM2-2.6B-Transcript | 2,6B | No disponible (optimizado para reuniones de 30-60 min, <3 GB de RAM) | Inglés | lfm1.0 | Nativo, GGUF, ONNX, MLX | Ajuste fino conjunto de Liquid AI y AMD para resumen de reuniones |
| Atomic-Germ/LFM2-1.2B-NPU2 | 1,2B | No disponible | No disponible | No disponible | No disponible | Variante más pequeña de la misma familia de conversiones para NPU |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo declara soporte únicamente de inglés; cualquier transcripción en otro idioma queda fuera de su alcance previsto.
- La model card advierte explícitamente que el modelo está pensado para conversaciones de un solo turno con un formato de entrada concreto; no es un asistente conversacional de propósito general.
- Riesgo de alucinación en tareas de atribución: elementos de acción o decisiones pueden asignarse a la persona equivocada o inventarse si la transcripción es ambigua, incompleta o tiene una diarización deficiente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad, toxicidad o robustez.
- Licencia lfm1.0, etiquetada como `license: other`: es imprescindible revisar los términos antes de cualquier uso comercial; la información disponible no detalla las condiciones.
- El repositorio no presenta descargas ni valoraciones, por lo que no existe validación comunitaria de su correcto funcionamiento.
- El tamaño del repositorio (1,9 GB) es notablemente inferior al esperable para 2,6B parámetros en bf16, lo que sugiere pesos cuantizados, un subconjunto de ficheros o artefactos específicos para NPU; conviene verificar el contenido antes de asumir el formato.
- La model card incluida corresponde a la variante LFM2-2.6B-Transcript y no a LFM2-2.6B base, pese a que el campo `base_model` del repositorio apunta a LiquidAI/LFM2-2.6B. Esta discrepancia debe tenerse en cuenta al evaluar las capacidades reales del artefacto.
- No se publican benchmarks, curvas de latencia ni pruebas de estrés con transcripciones reales.
- Cualquier uso en producción debería incluir verificación humana de los resúmenes y de los elementos de acción generados, especialmente en contextos regulados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atomic-Germ/LFM2-2.6B-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Variante de resumen de reuniones: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2-2.6B-Transcript-ONNX
- Variante MLX para Apple Silicon: https://huggingface.co/mlx-community/LFM2-2.6B-Transcript-4bit
- Repositorio similar del mismo autor (1.2B): https://huggingface.co/Atomic-Germ/LFM2-1.2B-NPU2
- Repositorio similar del mismo autor (Transcript): https://huggingface.co/Atomic-Germ/LFM2-2.6B-Transcript-NPU2
- Proyecto OpenNPU (GitHub): https://github.com/Atomic-Germ/OpenNPU/blob/main/README.md
- Proyecto OpenNPU (Codeberg): https://codeberg.org/Atomic-Germ/OpenNPU
- Kernels xclbin para LFM2-2.6B-Transcript-NPU2 en FastFlowLM: https://github.com/FastFlowLM/FastFlowLM/tree/main/src/xclbins/LFM2-2.6B-Transcript-NPU2
- Artículo de AMD sobre resumen local de reuniones: https://www.amd.com/en/blogs/2026/liquid-ai-amd-ryzen-on-device-meeting-summaries.html
- Artículo de Liquid AI: https://www.liquid.ai/blog/the-future-of-meeting-summarization-local-fast-private-and-fully-secure
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm
- Plataforma LEAP: https://leap.liquid.ai/
