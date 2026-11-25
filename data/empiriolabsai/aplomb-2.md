# empiriolabsai/aplomb-2

## Resumen

Aplomb 2 es un modelo de decisión desarrollado por EmpirioLabs AI que responde preguntas tipadas sobre un estado: sí o no, una opción entre varias, una puntuación ordenada o la selección de una herramienta. A diferencia de un modelo generativo convencional, devuelve respuestas con probabilidades y niveles de confianza, lo que lo hace adecuado para integrarse en pipelines de automatización donde se necesita una señal calibrada y no texto libre.

El modelo está construido sobre Qwen3.5-4B e incorpora el codificador de audio de Qwen3-Omni-30B-A3B-Instruct, sumando aproximadamente 5.200 millones de parámetros según la model card (el recuento real de pesos en safetensors es de 4.539.429.376 parámetros). Acepta texto, objetos y arrays JSON, imágenes, vídeo y audio, y ofrece lecturas completas de hasta 32.768 tokens en una sola pasada, con pesos específicos de contexto largo en el directorio `long_context/` que extienden la ventana hasta 1.000.000 de tokens.

Su relevancia actual radica en que cubre una necesidad concreta de los sistemas agénticos: decidir de forma fiable entre opciones, herramientas o umbrales, con evidencia devuelta (fragmentos de texto con offsets de caracteres y segmentos temporales en audio y vídeo) y con la posibilidad de abstenerse cuando el estado no contiene la información. Está publicado con licencia Apache 2.0 y orientado al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con codificador de audio de Qwen3-Omni-30B-A3B-Instruct |
| Parametros totales | 4.539.429.376 (pesos en safetensors); ~5.2B según la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en lectura completa; hasta 1.000.000 tokens mediante pesos de contexto largo (`long_context/`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Aplomb 2 parte de Qwen3.5-4B como modelo base y le añade el codificador de audio de Qwen3-Omni-30B-A3B-Instruct, lo que le permite procesar modalidades de texto, imagen, vídeo y audio dentro de un mismo pipeline de decisión. La arquitectura subyacente es un transformer; la model card no detalla innovaciones como atención lineal, decodificación especulativa o mecanismos híbridos SSM. El modelo incorpora un conjunto de pesos especializados en `long_context/` para entradas de hasta 1.000.000 de tokens, y un conjunto de pesos agrupados que permite responder entre 17 y 32 preguntas de sí/no, elección o puntuación sobre una entrada de texto en una sola pasada.

La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detallan los datos de calibración, aunque la model card reporta un error de calibración esperado (ECE) agrupado de 1,42 sobre nueve conjuntos de test de texto, frente a 3,56 en Aplomb 1. Las capacidades destacadas que sí se documentan son la puntuación de hasta 255 opciones en una misma pasada para preguntas de elección, la devolución de evidencia con offsets de caracteres y segmentos temporales, y la opción de abstención (`abstain: true`) en preguntas de sí/no, elección o puntuación.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de sí/no, elección entre opciones, puntuación ordenada y selección de herramienta, con probabilidades y confianza asociadas.
- Selección de herramientas (tool selection): orientado explícitamente a decidir qué herramienta invocar en un flujo agéntico.
- Entrada multimodal: acepta texto, objetos y arrays JSON, imágenes, vídeo y audio.
- Contexto largo: lectura completa de hasta 32.768 tokens en una pasada y hasta 1.000.000 tokens mediante los pesos de contexto largo.
- Preguntas agrupadas: respuesta de 17 a 32 preguntas de sí/no, elección o puntuación sobre un texto en una sola pasada.
- Muchas opciones por pasada: preguntas de elección con entre 2 y 255 opciones, todas puntuadas en la misma pasada.
- Evidencia: devuelve los lugares que sustentan la respuesta, con fragmentos de texto citados y offsets de caracteres, y segmentos temporales en audio y vídeo.
- Abstención: permite que el modelo indique que el estado no contiene la información solicitada.
- Capacidades multilingües: el modelo está etiquetado solo para inglés, aunque en la benchmark MASSIVE de intención en 51 idiomas obtiene 82,35 de precisión.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo decide qué herramienta invocar a partir del estado de la conversación y de las herramientas disponibles, devolviendo la elección con probabilidad y confianza; encaja en orquestadores que necesitan una señal calibrada antes de ejecutar una acción.
- Clasificación de intenciones en atención al cliente: con preguntas de elección de hasta 255 opciones en una sola pasada, puede mapear un mensaje a una de las intenciones definidas por el negocio (resultados de 91,20 en Banking77 y 94,60 en CLINC150 según la model card).
- Moderación y filtrado de contenido: la decisión tipada sí/no con abstención permite construir un filtro previo que marque contenido dudoso; la model card advierte que para cribado de contenido dañino es preferible Aplomb 1, con 1.962 de 2.000 prompts dañinos marcados frente a 1.603 de Aplomb 2.
- Verificación documental con evidencia: al devolver fragmentos citados con offsets de caracteres, sirve para comprobar si un contrato o política contiene una cláusula concreta y señalar dónde aparece (88,43 en ContractNLI con la opción "no está en el estado").
- Análisis de audio y vídeo: con el codificador de audio integrado, puede responder preguntas sobre segmentos temporales de grabaciones o vídeos, por ejemplo para etiquetar eventos sonoros o verificar afirmaciones sobre un clip.
- Procesamiento de estados largos: con hasta 1.000.000 de tokens en los pesos de contexto largo, puede responder preguntas sobre expedientes, historiales o corpus extensos en una sola consulta (100,00 de precisión en los conjuntos de estado largo de 16K a 1M tokens reportados).
- Extracción estructurada sobre JSON: al aceptar objetos y arrays JSON como entrada, puede evaluar condiciones sobre registros estructurados y devolver decisiones tipadas para validaciones automatizadas.

## Benchmarks y rendimiento

Resultados reportados por EmpirioLabs el 19 de noviembre de 2026, con precisión en porcentaje sobre los mismos ítems para Aplomb 2 y Aplomb 1:

| Benchmark | Decisiones | Aplomb 2 | Aplomb 1 | Diferencia [IC 95%] |
|---|---:|---:|---:|---|
| JevBench Easy | 48 | 100,00 | 100,00 | +0,00 [+0,00, +0,00] |
| JevBench Original | 72 | 95,83 | 95,83 | +0,00 [-5,56, +6,94] |
| JevBench Hard | 111 | 69,37 | 77,48 | -8,11 [-16,22, +0,00] |
| Typed Decisions (test) | 2.000 | 74,15 | 74,00 | +0,15 [-2,15, +2,40] |
| ToolACE | 310 | 89,35 | 89,35 | +0,00 [-3,25, +3,24] |
| AG News | 7.600 | 89,92 | 88,82 | +1,11 [+0,53, +1,68] |
| WildJailbreak | 2.205 | 81,50 | 95,65 | -14,15 [-15,83, -12,47] |
| ANLI R3 | 500 | 55,40 | 54,00 | +1,40 [-3,00, +5,60] |
| Banking77 (77 opciones) | 500 | 91,20 | 74,60 | +16,60 [+13,00, +20,20] |
| CLINC150 (150 opciones) | 500 | 94,60 | 87,00 | +7,60 [+5,00, +10,40] |
| ContractNLI (3 vías) | 2.091 | 88,43 | 81,87 | +6,55 [+4,93, +8,21] |
| MASSIVE intent, 51 idiomas | 5.100 | 82,35 | 74,96 | +7,39 [+6,35, +8,43] |
| POPE | 1.500 | 89,13 | 90,00 | -0,87 [-2,28, +0,48] |
| MMStar | 1.500 | 70,67 | 69,87 | +0,80 [-1,47, +3,07] |
| AI2D | 1.000 | 86,50 | 86,00 | +0,50 [-1,52, +2,50] |
| MMMU | 847 | 57,97 | 59,39 | -1,42 [-4,84, +1,89] |
| HallusionBench | 951 | 75,71 | 74,76 | +0,95 [-1,96, +3,78] |
| TempCompass | 4.033 | 80,26 | 79,32 | +0,94 [-0,74, +2,61] |
| Video-MME (short) | 900 | 72,22 | 80,67 | -8,44 [-11,33, -5,67] |
| NExT-QA | 1.000 | 81,40 | 82,60 | -1,20 [-3,33, +0,89] |
| VocalSound | 3.591 | 91,67 | 91,92 | -0,25 [-0,89, +0,42] |
| CREMA-D | 1.117 | 80,21 | 78,69 | +1,52 [-0,45, +3,58] |
| ESC-50 | 2.000 | 78,70 | 77,00 | +1,70 [+0,10, +3,25] |
| MMAU-mini | 1.000 | 64,80 | 68,30 | -3,50 [-6,30, -0,60] |
| MMSU | 1.000 | 63,80 | 63,20 | +0,60 [-2,20, +3,40] |
| Long state, 16K tokens | 117 | 100,00 | 100,00 | +0,00 [+0,00, +0,00] |
| Long state, 128K tokens | 120 | 100,00 | 100,00 | +0,00 [+0,00, +0,00] |
| Long state, 240K tokens | 121 | 100,00 | 100,00 | +0,00 [+0,00, +0,00] |
| Long state, 512K tokens | 60 | 100,00 | 100,00 | +0,00 [+0,00, +0,00] |
| Long state, 1M tokens | 63 | 100,00 | 96,83 | +3,17 [+0,00, +9,84] |

Benchmarks públicos (ejecución propia de EmpirioLabs con el scorer público de cada benchmark, no entrada en el leaderboard):

| Benchmark | Métrica | Aplomb 2 | Aplomb 1 |
|---|---|---:|---:|
| DecisionBench 1.0 | Accuracy, 23.900 filas | 79,04 | 70,48 |
| Atlan Decision Bench | Accuracy, 1.071 casos | 89,17 | 86,74 |
| S1MB English | Task Avg | 65,20 | 47,56 |
| S1MB Japanese | Task Avg | 44,02 | n/a |
| S1MB Vision | Task Avg | 64,60 | n/a |
| Typed Decisions | Accuracy, 2.000 decisiones | 74,10 | 73,7 |
| JevBench | Accuracy, 231 ítems públicos | 83,98 | 87,45 |
| ImageJevBench Box | Box Intelligence | 70,39 | n/a |
| Decision Index Vision | Índice público, 10 de 11 benchmarks | 62,49 | 61,94 |
| Decision Index 0.3 | Índice público | 58,83 | 44,78 |

ECE agrupado sobre nueve conjuntos de test de texto: 1,42 para Aplomb 2 y 3,56 para Aplomb 1 (menor es mejor).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.539.429.376 parámetros en safetensors y un repositorio de 28,7 GB, la inferencia en precisión completa requiere al menos el tamaño de los pesos más el estado de activaciones y caché KV; la model card no publica cifras de VRAM ni cuantizaciones soportadas.
- GPU recomendadas: no disponible. No se especifican modelos de GPU (A100, H100, RTX 4090 u otros) en la documentación.
- Compatibilidad con GPU de consumo: no disponible. Al no documentarse cuantizaciones ni requisitos de VRAM, no puede confirmarse si cabe en GPU de consumo.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores; el pipeline declarado es `text-classification` con pesos en safetensors.
- Latencia y throughput: no disponible. La model card solo describe el comportamiento de una pasada para lecturas completas y para preguntas agrupadas, sin cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Aplomb 2 | 4.539.429.376 (~5,2B según model card) | 32.768 tokens; hasta 1M con pesos de contexto largo | Apache 2.0 | Modelo de decisión multimodal (texto, JSON, imagen, vídeo, audio) con evidencia y abstención |
| Aplomb 1 | no disponible | no disponible | no disponible | Versión anterior del mismo modelo de decisión; mejor en cribado de contenido dañino (WildJailbreak 95,65 frente a 81,50) |
| Qwen3.5-4B | ~4B (modelo base) | no disponible | no disponible | Modelo generativo base sobre el que se construye Aplomb 2 |
| Qwen3-Omni-30B-A3B-Instruct | 30B totales, 3B activos (MoE) | no disponible | no disponible | Modelo ómnimodal del que se toma el codificador de audio |

No se dispone de datos de benchmarks de Aplomb 1, Qwen3.5-4B ni Qwen3-Omni-30B-A3B-Instruct en la información proporcionada más allá de las comparaciones directas que la model card incluye frente a Aplomb 1.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en otros idiomas no está garantizado pese a los resultados reportados en MASSIVE (51 idiomas).
- Cribado de contenido dañino: la model card recomienda explícitamente usar Aplomb 1 para esta tarea; Aplomb 2 marca 1.603 de 2.000 prompts dañinos frente a 1.962 de Aplomb 1, y deja pasar 194 de 205 prompts benignos frente a 147 de Aplomb 1.
- Regresiones frente a Aplomb 1: pierde precisión en WildJailbreak (-14,15), Video-MME short (-8,44) y MMAU-mini (-3,50), además de una caída no significativa en JevBench Hard (-8,11).
- Razonamiento inferencial limitado: ANLI R3 se queda en 55,40 de precisión, y MMMU en 57,97, lo que sugiere dificultades en tareas de inferencia compleja y razonamiento multimodal avanzado.
- Alucinación y calibración: aunque el ECE es bajo (1,42), el modelo puede producir decisiones incorrectas con alta confianza; la opción de abstención mitiga parcialmente este riesgo solo en preguntas de sí/no, elección y puntuación.
- Contexto largo: la ventana de 1.000.000 de tokens depende de los pesos específicos en `long_context/`; no se documentan los requisitos de memoria ni el coste computacional de ese modo.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna por parte del autor.
- Madurez: el modelo tiene 92 descargas y 0 likes en Hugging Face en el momento de la consulta, con creación el 21 de noviembre de 2026 y última actualización el 25 de noviembre de 2026; la documentación pública es limitada en cuanto a entrenamiento y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/aplomb-2
- Licencia: https://huggingface.co/empiriolabsai/aplomb-2/blob/main/LICENSE
- Web de EmpirioLabs: https://empiriolabs.ai
- Documentación: https://docs.empiriolabs.ai
- Organización en Hugging Face: https://huggingface.co/empiriolabsai
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Codificador de audio Qwen3-Omni-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
