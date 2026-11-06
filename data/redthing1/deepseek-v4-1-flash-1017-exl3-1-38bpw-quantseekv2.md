# redthing1/DeepSeek-V4.1-Flash-1017-EXL3-1.38bpw-Quantseekv2

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-1.38bpw-Quantseekv2 es una cuantización de precisión muy baja del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario redthing1. Se trata de una conversión al formato EXL3 (ExLlamaV3) que reduce el checkpoint original a aproximadamente 103,8 GB, con una media de 1,38 bits por peso en las matrices enrutadas del componente MoE. El objetivo es permitir la ejecución de un modelo de gran tamaño en hardware mucho más modesto sin renunciar de forma drástica a la fidelidad respecto al original.

La relevancia de esta ficha radica en la técnica de cuantización empleada: el autor combina matrices de bajo rango (W = A·B, con rango 128–512) para 19.083 de las 46.080 matrices enrutadas, con EXL3 plano para el resto, y aplica una asignación de bits por matriz guiada por la divergencia KL medida sobre sesiones reales de razonamiento y uso de herramientas. El resultado declarado es una degradación de KL un 1,2 % inferior a la versión anterior (v1) a la mitad de tamaño.

El modelo base es un transformer MoE multimodal (pipeline `image-text-to-text`) con capacidad de razonamiento y tool calling, e incluye pesos de visión y de un drafter de decodificación especulativa (DSpark). Esta versión cuantizada está pensada para cargarse con un runtime ExLlamaV3 que soporte DeepSeek V4.1/1017 y EXL3 de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41) con componentes multimodales; cuantización EXL3 de bajo rango |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la calibración empleó ventanas de hasta 540.000 tokens) |
| Tipos de cuantizacion | EXL3; media de 1,38 bpw en matrices enrutadas; 1–6 bits en el resto; 5–8 bits en atención y expertos compartidos; 8 bits en la cabeza de salida; 1 bit en los expertos enrutados del drafter DSpark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), cargable con exllamav3 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidades multimodales de imagen a texto, según el pipeline declarado. Esta publicación no entrena el modelo: es una cuantización del checkpoint original de DeepSeek. La innovación principal reside en el método de compresión. De las 46.080 matrices enrutadas, 19.083 se almacenan como producto de bajo rango W = A·B con rango entre 128 y 512, con ambos factores en EXL3; el factor B se codifica bajo estadísticas de entrada capturadas dentro del modelo original y A se reajusta sobre el B codificado. Las proyecciones de atención y de expertos compartidos usan 5–8 bits, la cabeza de salida 8 bits y los expertos enrutados del drafter DSpark 1 bit.

La calibración se realizó con 15 historias completas de razonamiento y uso de herramientas (ocho de ingeniería inversa y siete de construcción de algoritmos), incluyendo redondeo de activaciones en FP8. La asignación de bits por matriz se guio por la KL estimada sobre las entradas reales de cada experto frente a los gradientes del modelo original, con precios derivados de 29 sesiones y ventanas de hasta 540.000 tokens. Posteriormente se aplicó una corrección por bandas de capas (0–4, 5–9, …, 30–39) para compensar la suposición de errores independientes, y un factor de aproximadamente 1,5× para las matrices de bajo rango. La medición final de KL se hizo sobre los 129.280 tokens siguientes, en los primeros 131.072 tokens de sesiones de ingeniería inversa con binarios sin código fuente.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base DeepSeek V4.1 Flash.
- Procesamiento de imagen y texto (`image-text-to-text`), con pesos de visión incluidos en la publicación.
- Tool calling y function calling, evidenciado por el uso de historias de calibración con uso de herramientas.
- Razonamiento agéntico y sesiones largas de ingeniería inversa y construcción de algoritmos, empleadas en la calibración.
- Decodificación especulativa mediante el drafter DSpark incluido, con sus expertos enrutados cuantizados a 1 bit.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local de un MoE de gran tamaño en hardware de gama alta para consumo: al reducir el checkpoint a 103,8 GB, permite cargar el modelo en configuraciones con menos VRAM que el original, manteniendo la fidelidad medida por KL.
- Razonamiento agéntico de contexto largo: la calibración cubre ventanas de hasta 540.000 tokens, por lo que el modelo es adecuado para tareas de análisis de trazas extensas, auditoría de binarios o sesiones de depuración prolongadas.
- Análisis de imágenes con descripción textual: el pipeline `image-text-to-text` y la inclusión de pesos de visión permiten tareas de captioning, extracción de información visual y respuesta a preguntas sobre imágenes.
- Ingeniería inversa asistida: el autor calibró el modelo con sesiones de análisis de binarios sin código fuente y de intérpretes de bytecode, un escenario realista para este checkpoint.
- Automatización con tool calling: integrable en pipelines donde el modelo invoca funciones externas para consultar APIs, ejecutar comandos o encadenar pasos de razonamiento.
- Despliegue con decodificación especulativa: el drafter DSpark incluido permite acelerar la generación en runtimes que lo soporten, útil en servicios de inferencia con requisitos de latencia.
- Investigación sobre cuantización extrema: el repositorio incluye `quantseek-formats.json` y la definición de EXL3 de bajo rango con referencia en PyTorch y vectores de prueba, lo que lo convierte en material útil para estudiar el impacto de 1,38 bpw en un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones de divergencia KL frente al modelo original sobre 129.280 tokens de continuación:

| Sesión | v1 (207 GB) | v2 (207 GB) | Esta versión (104 GB) |
|---|---:|---:|---:|
| Bytecode VM, ejecución 1 | 0,01265 | 0,01050 | 0,01253 |
| Bytecode VM, ejecución 2 | 0,01504 | 0,01231 | 0,01469 |
| Consulta de programa completo, ejecución 1 | 0,01105 | 0,00897 | 0,01071 |
| Consulta de programa completo, ejecución 2 | 0,01206 | 0,01038 | 0,01254 |

Corrección medida por bandas de capas (KL medido sobre KL estimado, relativo):

| Capas | 0–4 | 5–9 | 10–14 | 15–19 | 20–24 | 25–29 | 30–39 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Factor relativo | 2,55 | 1,27 | 1,49 | 1,19 | 0,56 | 0,54 | 0,41 |

## Requisitos de hardware

- Tamaño del checkpoint cuantizado: aproximadamente 103,8 GB, más 203,1 GB de los dos shards Engram sin modificar del checkpoint oficial, que deben descargarse por separado.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos, requiere un sistema con al menos ~104 GB de memoria para los pesos cuantizados, más la memoria de activaciones y caché KV, y espacio adicional para los shards Engram.
- GPU recomendadas: no disponible en la información proporcionada; por volumen de memoria, queda fuera de GPUs de consumo de 24 GB en una sola unidad y apunta a configuraciones multi-GPU o aceleradores de centro de datos.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo convencional; requeriría múltiples GPUs o memoria unificada de gran capacidad.
- Opciones de despliegue: exclusivamente runtimes ExLlamaV3 que soporten DeepSeek V4.1/1017 y EXL3 de bajo rango. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El drafter DSpark incluido está pensado para decodificación especulativa y puede reducir la latencia en runtimes compatibles, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tamaño | bpw / precisión | KL (bytecode VM, run 1) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Esta versión (Quantseekv2) | 103,8 GB | 1,38 bpw medio | 0,01253 | MIT | HuggingFace |
| v1 (2,87 bpw) | 207 GB | 2,87 bpw | 0,01265 | MIT | HuggingFace |
| v2 (2,87 bpw, Quantseekv2) | 207 GB | 2,87 bpw | 0,01050 | MIT | HuggingFace |
| Modelo base DeepSeek-V4.1-Flash-1017 | no disponible | precisión original | referencia (0) | MIT | HuggingFace |

La comparación con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización agresiva (1,38 bpw medio en matrices enrutadas): introduce divergencia respecto al modelo original, medida como KL entre 0,01071 y 0,01469 en las sesiones reportadas. No es equivalente en calidad al checkpoint completo.
- La evaluación de fidelidad se limita a sesiones de ingeniería inversa y construcción de algoritmos; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) que confirmen el rendimiento en otras tareas.
- Requiere descargar 203,1 GB adicionales de shards Engram del checkpoint oficial, además de los 103,8 GB del repositorio, con el coste de almacenamiento y ancho de banda asociado.
- Dependencia estricta de ExLlamaV3 con soporte para DeepSeek V4.1/1017 y EXL3 de bajo rango; no es portable a otros runtimes sin reconversión.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe concreto.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en dominios alejados de los datos de calibración.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar los términos del modelo base de DeepSeek por si imponen condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-1.38bpw-Quantseekv2
- Versión v1 (2,87 bpw): https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw
- Versión v2 (2,87 bpw, Quantseekv2): https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-2.87bpw-Quantseekv2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Documentación de EXL3 de bajo rango: https://huggingface.co/redthing1/DeepSeek-V4.1-Flash-1017-EXL3-1.38bpw-Quantseekv2/blob/main/lowrank/LOWRANK.md
- Runtime ExLlamaV3: https://github.com/turboderp-org/exllamav3
