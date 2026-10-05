# khursheed/VibeGame-8B-LoRA

## Resumen

VibeGame-8B-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario khursheed sobre el modelo base Qwen2.5-Coder-7B-Instruct, de 7,61 mil millones de parámetros. A pesar del sufijo "8B" en el nombre, este corresponde al nombre del proyecto y no al tamaño real del modelo. El objetivo del adaptador es convertir una descripción en lenguaje natural de un juego en un proyecto Godot 4 completo: un archivo `project.godot`, una escena y scripts GDScript, devueltos conjuntamente como un objeto JSON con un mapeo de ficheros.

El modelo resuelve el problema de la generación de proyectos de juego multimodales y multiarchivo, un escenario mucho más exigente que la generación de código aislado porque requiere coherencia entre configuración, escenas y lógica. El autor lo plantea como un prototipo de investigación con resultados medidos y publicados: 6 de 500 prompts (1,2%) produjeron un proyecto con formato estricto e importación sin errores, y 5 de 500 (1,0%) se ejecutaron limpiamente durante 60 segundos. Ningún lanzamiento exitoso se completó dentro de los 60 segundos objetivo.

Es relevante ahora porque documenta con transparencia un caso de uso de "prompt a artefacto ejecutable" y publica todos los fallos, algo poco habitual. El autor advierte explícitamente de que el vídeo demostrativo de 60 segundos es una selección de los tres primeros resultados exitosos en orden congelado de prompts y no representa el comportamiento típico del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) con adaptador LoRA entrenado mediante PEFT |
| Parametros totales | 7,61 mil millones (modelo base); el repositorio del adaptador ocupa 0,3 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | Entrenamiento con QLoRA de 4 bits; adaptador LoRA en safetensors; pesos fusionados en FP16; GGUF Q4_K_M publicado en el repositorio VibeGame-8B-GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF (Q4_K_M) en repositorio separado; FP16 en el repositorio de pesos fusionados |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo: se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only especializado en código. El entrenamiento se realizó con Unsloth QLoRA en una Tesla T4 gratuita de Colab y posteriormente se ejecutó una pasada completa separada en una NVIDIA A100-SXM4-40GB, predeclarada para reducir el tiempo de finalización. El autor indica que los resultados de ambas ejecuciones nunca se agregan conjuntamente y que la experimentación parcial en T4 se conserva en `evaluation-t4-partial/`.

Los datos de entrenamiento son deliberadamente pequeños y verificados: el asistente Codex generó 100 candidatos de proyecto completo más nueve semillas previas, de los cuales la admisión en Linux aceptó 108 de 109, dando lugar a 97 ejemplos de entrenamiento y 11 de desarrollo; todos los admitidos importaban y se ejecutaban limpiamente durante 60 segundos. Además, se almacenaron aparte 180 ficheros de referencia en GDScript bajo licencia MIT que no se cargaron directamente en el entrenamiento. La recolección de código externo acepta únicamente licencias MIT, Apache-2.0 o CC0, fija los commits de los repositorios y conserva avisos de licencia y procedencia; se excluyeron activos, código copyleft y avisos ambiguos. The Stack v2, que contiene GDScript, fue descartado por sus términos restringidos y su acuerdo de descarga masiva. No consta en la información proporcionada ningún uso de RLHF o DPO.

## Capacidades

- Generación de proyectos Godot 4 completos en una sola respuesta: devuelve JSON con un mapeo `files` que incluye `project.godot`, escenas y scripts GDScript.
- Generación de código GDScript para lógica de juego 2D basada en formas geométricas dibujadas por código.
- Generación de texto conversacional y de código en general, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Salida estructurada en JSON con validación posterior mediante un script extractor incluido en el proyecto.
- Enfoque restringido a juegos 2D pequeños; el autor indica que esta primera versión se centra en ese dominio.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; los prompts del benchmark y los datos de entrenamiento están en inglés.

## Casos de uso

- Prototipado exploratorio de mecánicas 2D: el modelo recibe una descripción como "un juego pequeño en el que atrapo estrellas que caen y esquivo meteoros" y devuelve un proyecto Godot candidato que un desarrollador puede inspeccionar y corregir a mano, aceptando la baja tasa de éxito como coste de la exploración.
- Generación de esqueletos de proyecto para revisión humana: dado que solo el 1,2% de las generaciones importa sin errores, el uso realista es producir borradores de `project.godot`, escenas y GDScript que un equipo revise antes de integrar, no como salida directa a producción.
- Investigación sobre generación de artefactos multiarchivo: sirve como punto de comparación reproducible para estudiar por qué los modelos de código fallan al mantener coherencia entre configuración, escena y lógica, con 500 salidas y registros completos publicados.
- Aumentación de datasets de GDScript: las 500 generaciones con sus resultados de importación y ejecución pueden filtrarse para construir conjuntos de ejemplos positivos y negativos etiquetados automáticamente mediante el harness de validación en Linux.
- Herramientas internas de estudio con validación automática: integrar el modelo en un pipeline que genere JSON, lo extraiga con `extract_project.py` y ejecute el harness de importación y ejecución en 60 segundos para descartar candidatos inválidos antes de mostrárselos a un humano.
- Evaluación de infraestructura de inferencia: el proyecto publica tiempos de extremo a extremo (mediana de 282,75 segundos por prompt en A100) y sirve para medir el coste real de pipelines de generación con bucle de compilación y arranque incluido.
- Docencia y divulgación técnica: el conjunto de resultados, incluidos los 494 fallos de importación, es material útil para explicar los límites actuales de la generación automática de software ejecutable.

## Benchmarks y rendimiento

Los resultados publicados evalúan el adaptador LoRA sobre su base cuantizada a 4 bits, en una NVIDIA A100-SXM4-40GB. Solo se rellenan valores de ejecuciones completas y la pasada parcial en T4 no se agrega.

| Comprobacion | Resultado |
|---|---:|
| Prompts congelados | 500 |
| Formato estricto de proyecto e importación sin errores | 6/500 (1,2%) |
| Ejecución limpia de 60 segundos | 5/500 (1,0%) |
| Mediana de prompt a lanzamiento en caliente (solo lanzamientos exitosos) | 282,75 segundos |
| Lanzamientos exitosos por debajo de 60 segundos | 0/500 |
| Mediana de lanzamientos exitosos en la pasada parcial con T4 | 1.394,69 segundos |
| Lanzamientos exitosos por debajo de 60 segundos en T4 | 0 |

Cada prompt recibe una única generación, sin reparaciones ni reintentos. JSON inválido, errores de parseo, APIs rechazadas, salidas tempranas y errores de script cuentan como fallo; los fallos de infraestructura dejan la evaluación incompleta. Los pesos fusionados en FP16 y los ficheros GGUF no se han evaluado por separado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16: aproximadamente 15-16 GB solo para pesos (estimación propia a partir de 7,61 mil millones de parámetros; no es un dato publicado por el autor).
- VRAM estimada con cuantización Q4_K_M: aproximadamente 4,5-5 GB, más el coste del contexto y del runtime (estimación propia, no confirmada por el autor).
- El adaptador LoRA ocupa 0,3 GB y puede sumarse a una base cuantizada a 4 bits, por lo que el conjunto cabe en GPU de consumo con 8-12 GB de VRAM o más (RTX 3060 12 GB, RTX 4070, RTX 4090), sujeto a verificación práctica.
- GPU empleadas en el desarrollo y la evaluación: Tesla T4 gratuita de Colab (experimento parcial) y NVIDIA A100-SXM4-40GB (pasada completa). El autor compró Colab Pro al agotarse la cuota de GPU del nivel gratuito.
- Opciones de despliegue documentadas: Ollama con el GGUF Q4_K_M y el `Modelfile` del repositorio VibeGame-8B-GGUF, mediante `ollama create vibegame -f Modelfile`. El harness de generación admite el backend Ollama. También son viables llama.cpp, vLLM y TGI con el adaptador PEFT, aunque no están documentados explícitamente en la información proporcionada.
- Requisito adicional de entorno: Godot 4.5.1 para abrir y ejecutar los proyectos generados.
- Latencia medida: mediana en caliente de 282,75 segundos por prompt hasta el lanzamiento en A100, incluyendo generación por lotes, cola, importación del proyecto y arranque. En T4, mediana de 1.394,69 segundos. Cero lanzamientos por debajo de 60 segundos en ambos casos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeGame-8B-LoRA | 7,61 mil millones (adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct) | no disponible | Generación de proyectos Godot 4 en JSON (project.godot, escena, GDScript) a partir de lenguaje natural | apache-2.0 | Adaptador PEFT, pesos fusionados FP16 y GGUF Q4_K_M en HuggingFace |
| Qwen2.5-Coder-7B-Instruct (base) | 7,61 mil millones | no verificado en la información proporcionada | Generación de código y conversación de propósito general | apache-2.0 | HuggingFace, ampliamente desplegado |
| Adaptadores LoRA comparables de generación de proyectos Godot | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas equivalentes en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoría. El proyecto VibeGame de tettethu, que aparece en los resultados de búsqueda, es un framework multiagente homónimo y no guarda relación con este modelo.

## Limitaciones y advertencias

- Tasa de éxito muy baja: 1,2% de importación correcta y 1,0% de ejecución limpia de 60 segundos sobre 500 prompts, con una única generación por prompt y sin reparaciones.
- Incumplimiento del objetivo de latencia: ningún lanzamiento exitoso se completó en 60 segundos; la mediana entre los exitosos fue de 282,75 segundos en A100.
- El vídeo demostrativo de 60 segundos es una selección de los tres primeros resultados limpios en orden congelado de prompts y no representa la salida habitual del modelo. Las grabaciones de juego usan pasos de tiempo fijos y sin entrada del jugador, por lo que no demuestran controles responsivos ni velocidad de generación en tiempo real.
- Una ejecución limpia no prueba que las mecánicas solicitadas funcionen; solo indica que el proyecto importa y arranca sin errores.
- Volumen de entrenamiento muy reducido: 97 ejemplos de entrenamiento y 11 de desarrollo, derivados de 108 de 109 proyectos admitidos. El riesgo de sobreajuste al dominio y al estilo de esos proyectos es alto.
- Ámbito limitado a juegos 2D pequeños con formas dibujadas por código; no hay evidencia de soporte para 3D, activos externos, físicas complejas ni entrada de usuario.
- Idiomas soportados no disponibles; los datos y prompts están en inglés, por lo que el comportamiento en castellano no está verificado.
- Longitud de contexto no especificada en la model card; no se ha publicado ninguna evaluación con contextos largos.
- Riesgo de alucinación no cuantificado en la model card, pero los fallos observados (JSON inválido, errores de parseo, APIs rechazadas, errores de script) son la causa mayoritaria del fracaso.
- Los pesos fusionados en FP16 y los GGUF no han sido evaluados por separado; las cifras corresponden al adaptador LoRA sobre base de 4 bits.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia apache-2.0 para el adaptador y los pesos publicados, lo que permite uso comercial del modelo, pero el código de terceros empleado en la colección de datos conserva su licencia original (MIT, Apache-2.0 o CC0) y los activos y código copyleft fueron excluidos.
- Caveat de producción: la extracción del JSON no verifica la compilación; el propio autor indica que es necesario un harness de validación en Linux para comprobar importación y comportamiento en ejecución antes de cualquier uso serio.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/khursheed/VibeGame-8B-LoRA
- Pesos fusionados en FP16: https://huggingface.co/khursheed/VibeGame-8B
- Repositorio GGUF (Q4_K_M y Modelfile): https://huggingface.co/khursheed/VibeGame-8B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/khursheed/VibeGame-8B-data
- Código y scripts del proyecto: https://huggingface.co/khursheed/VibeGame-8B/tree/main/code
- Resultados y registros de evaluación: https://huggingface.co/khursheed/VibeGame-8B/tree/main/evaluation
- Notas de datos y procedencia: https://huggingface.co/khursheed/VibeGame-8B/blob/main/code/docs/data.md
- Vídeo de presentación de 60 segundos: https://huggingface.co/khursheed/VibeGame-8B/resolve/main/VibeGame-launch-60s.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Descarga de Godot 4.5.1: https://godotengine.org/download/archive/4.5.1-stable/
- Descarga de Ollama: https://ollama.com/download
- Proyecto homónimo no relacionado (framework multiagente): https://github.com/tettethu/VibeGame
- Sitio del proyecto homónimo no relacionado: https://vibegame.tettet.org/
- Informe técnico del proyecto homónimo no relacionado: https://vibegame.tettet.org/technical_report.pdf
- Toolkit homónimo no relacionado: https://www.vibegamedev.com/
