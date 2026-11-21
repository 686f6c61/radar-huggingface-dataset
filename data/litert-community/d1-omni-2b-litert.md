# litert-community/d1-Omni-2B-LiteRT

## Resumen

d1-Omni-2B-LiteRT es la conversión al formato LiteRT (TFLite) del modelo LiquidAI/d1-Omni-2B, un modelo de decisión multimodal desarrollado por Liquid AI para texto, imagen y audio. La conversión la mantiene la comunidad litert-community mediante litert-torch 0.10.0 y está pensada para la API CompiledModel de ai-edge-litert 2.3.0, lo que permite ejecución on-device en CPU, GPU y NPU sin dependencia de PyTorch en tiempo de inferencia.

A diferencia de un modelo generativo al uso, d1-Omni-2B no produce tokens: recibe un estado (una cadena, un valor JSON o nada si el medio es todo el estado), imágenes, clips de audio y un conjunto de preguntas con nombre, y devuelve en un único forward pass respuestas tipadas con sus probabilidades. Los tipos de respuesta soportados incluyen sí/no (`noul`), elección entre opciones (`choice`), nivel ordenado (`score`), texto, número o fecha con su span (`text`, `number`, `date`), estimaciones con intervalo y detección de objetos (`box`, `boxes`).

El repositorio empaqueta el modelo como ficheros LiteRT junto con un host en Python para escritorio que no requiere PyTorch. Los grafos de decisión cubren secuencias de hasta 128, 256, 512, 1.024, 2.048, 4.096 y 6.144 tokens, con variantes por lotes y versiones compiladas AOT para la NPU del Qualcomm SM8850 (Galaxy S26). El tamaño del repositorio es de 42,7 GB y acumula 1.154 descargas desde su publicación el 2 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base LiquidAI/LFM3-Omni-2B) con cabezas de decisión tipadas; conversión LiteRT |
| Parámetros totales | 2B (heredado del modelo base d1-Omni-2B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | hasta 6.144 tokens de secuencia de decisión (grafos separados por longitud: 128, 256, 512, 1.024, 2.048, 4.096 y 6.144) |
| Tipos de cuantización | fp16 en fully-connected (`fp16fc`); atención en bloques de consulta de 1.024 en los grafos de 4.096 y 6.144 tokens |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | TFLite (LiteRT), múltiples ficheros por grafo; incluye tokenizer, tabla de embeddings y fixtures de test |

## Arquitectura y entrenamiento

El modelo subyacente, LiquidAI/d1-Omni-2B, es un modelo de decisión construido sobre LiquidAI/LFM3-Omni-2B. A diferencia de los modelos generativos autoregresivos, ejecuta una única pasada hacia delante que recibe los embeddings de los tokens de la secuencia junto con dos tablas pequeñas que definen qué posiciones atienden a cuáles, y devuelve los estados ocultos tras la normalización final. Sobre esos estados se aplican cabezas de decisión que producen respuestas tipadas con sus probabilidades, sin generar tokens.

La conversión a LiteRT se realizó con litert-torch 0.10.0 y se valida contra el código de referencia del proveedor en float32 sobre CPU. El repositorio incluye siete torres de imagen (una por forma de lienzo) que convierten una imagen en tokens, y cuatro ficheros de audio que convierten un clip en tokens para clips de hasta 504, 1.000, 2.000 y 3.000 frames de características. Los grafos de decisión se ofrecen también en versiones compiladas AOT para la NPU del Qualcomm SM8850 y en una variante multi-firma que contiene los ocho grafos sobre una sola copia de los pesos. No se detallan en la información disponible los datos de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Decisión multimodal sobre texto, imagen y audio en una sola pasada, sin generación de tokens.
- Respuestas de tipo sí/no (`noul`) con probabilidad asociada.
- Elección entre opciones con nombre (`choice`) y niveles ordenados (`score`).
- Extracción de texto, número o fecha con su span (`text`, `number`, `date`).
- Estimaciones numéricas con intervalo (percentiles p10 y p90) y paso configurable.
- Detección de un objeto o de todas las instancias en una imagen (`box`, `boxes`).
- Procesamiento por lotes: grafo específico para ocho secuencias de hasta 128 tokens en una llamada.
- Ejecución on-device en CPU, GPU (Metal en Apple, GPU en Android) y NPU (Qualcomm SM8850).
- Soporte de audio de hasta 3.000 frames de características y de imágenes en varias formas de lienzo.
- Interfaz compatible con `system_one()` y `system_one_batch()` del proveedor Liquid AI.

## Casos de uso

- Clasificación de audio en dispositivos móviles: el modelo responde preguntas tipadas sobre un clip (por ejemplo, contar pitidos o detectar voz) en una sola pasada, con latencias de 67 ms en NPU de Galaxy S26 y 733,6 ms en GPU de Pixel 11 Pro, lo que lo hace apto para aplicaciones de escucha continua en el dispositivo.
- Moderación y verificación de contenido visual: mediante respuestas `noul` y `box`/`boxes` se puede comprobar la presencia de objetos o personas en una imagen sin generar texto, integrándose en pipelines de revisión con baja latencia.
- Extracción estructurada de datos de documentos: usando los tipos `text`, `number` y `date` con sus spans, el modelo localiza campos concretos en un estado textual o en una imagen, útil para digitalización de formularios y tickets.
- Enrutamiento y triaje en asistentes de voz: con preguntas `choice` y `score` el modelo decide la intención del usuario a partir de audio o texto, permitiendo clasificar peticiones en un solo forward pass antes de invocar un LLM generativo.
- Control de calidad en fabricación o inspección: la detección de objetos (`box`, `boxes`) y las preguntas `noul` permiten verificar presencia o ausencia de componentes en imágenes capturadas por cámaras industriales, ejecutándose en NPU para reducir coste energético.
- Análisis de encuestas y respuestas abiertas: la extracción de números con intervalo y de fechas facilita el procesamiento por lotes de respuestas estructuradas, con el grafo de ocho secuencias de 128 tokens para alto throughput.
- Asistentes de accesibilidad: la combinación de audio y preguntas tipadas permite responder consultas sobre sonidos del entorno (por ejemplo, detectar si alguien habla) en tiempo real en el propio dispositivo, sin enviar datos a la nube.

## Benchmarks y rendimiento

Los datos de validación publicados en la model card comparan la conversión con el código de referencia del proveedor en float32 sobre CPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Referencia (proveedor, float32 CPU) | Este repositorio (CPU) | Este repositorio (Metal, float32) |
|---|---:|---:|---:|
| `beeps` (mediana) | 3.0 | 3.0 | 3.0 |
| `beeps` (intervalo p10, p90) | 3.0, 4.0 | 3.0, 4.0 | 3.0, 4.0 |
| `speech` P(yes) | 0.06638 | 0.06638 | 0.06638 |

| Métrica | Valor |
|---|---|
| Latencia, 1 pregunta sobre audio de 10 s (Apple M4 Max, Metal, float32) | 89,0 ms (mediana) |
| Latencia, 1 pregunta sobre ticket de soporte (Apple M4 Max, Metal, float32) | 40,9 ms (mediana) |
| Latencia, 1 llamada al grafo (Galaxy S26, NPU, fichero compilado AOT) | 67,0 ms |
| Latencia, 1 llamada al grafo (Pixel 11 Pro, GPU, float32) | 733,6 ms |
| Diferencia máxima de probabilidad vs. referencia (texto e imagen) | 1,32e-5 |
| Diferencia máxima de probabilidad vs. referencia (audio) | 0,000198 |
| Peticiones de test superadas (texto e imagen) | 523 |
| Peticiones de test superadas (audio) | 67 |
| Tokens de entrada en el ejemplo de la model card | 113 |
| Tokens de salida | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo de decisión ocupa entre 2,93 GB y 3,00 GB por fichero, y el repositorio completo suma 42,7 GB.
- GPU recomendadas: Apple M4 Max (Metal, float32) validado; GPU de Pixel 11 Pro validada; NPU Qualcomm SM8850 (Galaxy S26) con ficheros compilados AOT.
- Cabe en GPU de consumo: no se especifica en la información disponible; el tamaño de cada grafo (≈2,9 GB) sugiere que puede ejecutarse en GPUs con al menos 4-8 GB de memoria, pero no se confirma.
- Opciones de despliegue: LiteRT (ai-edge-litert 2.3.0, API CompiledModel), host Python para escritorio sin PyTorch, LiteRT 2.2.0 en Android.
- Latencia y throughput: 67,0 ms por llamada en NPU de Galaxy S26; 733,6 ms en GPU de Pixel 11 Pro; 40,9-89,0 ms en Apple M4 Max con Metal; el grafo por lotes procesa ocho secuencias de 128 tokens en una llamada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación con alternativas de la misma categoría (modelos de decisión multimodales on-device) no está disponible. Como referencia, el propio modelo base LiquidAI/d1-Omni-2B y LFM3-Omni-2B podrían servir de comparación, pero no se incluyen sus especificaciones en la información disponible.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo devuelve respuestas tipadas predefinidas, por lo que no sirve para tareas generativas abiertas.
- La licencia lfm1.0 (license: other) puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento multilingüe fiable.
- Los grafos de decisión están limitados a longitudes de secuencia máximas de 128 a 6.144 tokens según el fichero; secuencias más largas requieren el grafo de 6.144 tokens o no están soportadas.
- La validación se realizó contra el código de referencia del proveedor en float32; no se documentan pruebas con otras precisiones ni con cuantizaciones más agresivas.
- El audio está limitado a clips de hasta 3.000 frames de características y las imágenes a formas de lienzo predefinidas (torres separadas por forma).
- Riesgo de alucinación no cuantificado: al tratarse de un modelo de decisión, el riesgo se manifiesta como respuestas con probabilidad alta pero incorrecta; no se han publicado métricas de calibración más allá de las diferencias numéricas frente a la referencia.
- No se han publicado resultados de benchmarks estándar, sesgos conocidos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/d1-Omni-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/open-d1
