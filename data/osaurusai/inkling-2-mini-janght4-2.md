# OsaurusAI/Inkling-2-Mini-JANGHT4.2

## Resumen

Inkling-2-Mini-JANGHT4.2 es una cuantización del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX y el runtime Osaurus. El modelo base es un Mixture-of-Experts multimodal de 26.400 millones de parámetros totales con 3.400 millones activos por token, capaz de procesar texto e imágenes (pipeline image-text-to-text) y orientado a razonamiento, código, uso de herramientas y flujos agénticos. Esta versión comprime el checkpoint original de 20,2 GB hasta 14,65 GB manteniendo, según el autor, un 96,88 % de acuerdo top-1 con el modelo original.

La innovación principal del bundle es el esquema de cuantización JANGHT, que elige el formato de cada grupo de proyecciones de expertos según su sensibilidad medida: conserva byte a byte 35 de las 72 proyecciones de expertos en su formato NVFP4 original, aplica códigos trellis JANGT (2,5 y 3 bits) a 20 proyecciones y un codebook JANGH (2, 3 y 4 bits) a 17. El resultado es una media de 3,80 bits por peso en los expertos y 4,25 bits por peso en el conjunto del modelo.

Es relevante ahora porque permite ejecutar un MoE multimodal de 26,4B parámetros con decodificación especulativa integrada (drafter DSpark) en hardware de consumo Apple, con una velocidad de 92 tok/s en un M5 Ultra, sin renunciar a capacidades de visión, razonamiento y tool calling que normalmente exigen GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con capas "looped" (transformer con reutilización de pesos) |
| Parametros totales | 15.378.137.104 según safetensors del repo; 26.400 millones según la model card del autor (discrepancia no resuelta en la información disponible) |
| Parametros activos | 3.400 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANGHT (mezcla por sensibilidad): NVFP4 original en 35 proyecciones de expertos, JANGT trellis 2,5/3 bits en 20, JANGH codebook 2/3/4 bits en 17; atención, embeddings y lm_head en affine 8-bit (group size 64); router, norms, attention sinks, gates y convoluciones en fp32/BF16; encoder de visión y drafter en BF16. Media de 4,25 bits por peso |
| Idiomas soportados | Inglés y multilingüe (según tags y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 14,7 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 24 capas de decoder. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 pasadas de capa. Cada token se enruta a 8 de 128 expertos por capa. Incorpora un encoder de visión (preservado en BF16 en esta cuantización) y un drafter propio denominado DSpark para decodificación especulativa, también incluido sin cambios. La model card menciona además attention sinks, gates de mensaje entre iteraciones del bucle y convoluciones cortas, todos preservados en su precisión original.

El proceso de cuantización JANGHT mide la sensibilidad de cada proyección de expertos (pares gate/up y proyección down por capa) frente al modelo original, con el enrutamiento de expertos congelado para evitar que un cambio de router domine la medición. La calibración se realizó mayoritariamente sobre salidas del propio Inkling-2-Mini: 5,6 millones de tokens de respuestas y razonamiento en dominios de agentes con herramientas, código, matemáticas, sesiones de terminal, ciencia, multilingüe, creatividad y enciclopedia, más 320 conversaciones con imágenes. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con múltiples niveles de esfuerzo configurables (none, minimal, low, medium, high, xhigh, max).
- Modo "thinking": el modelo produce segmentos de razonamiento explícitos antes de la respuesta, con estructura de apertura y cierre de razonamiento verificada en las pruebas del autor.
- Comprensión de imágenes: pipeline image-text-to-text, con soporte de OCR en inglés, coreano, chino y texto acentuado, conteo de formas y lectura de capturas de código y terminal.
- Generación de código y matemáticas, con pruebas específicas en problemas de palabras, primos, divisores, probabilidad y tareas de programación.
- Tool calling y function calling: apertura de llamadas a herramientas verificada (8/8 en las pruebas del autor) y generación de respuestas a partir de resultados de herramientas.
- Flujos agénticos multi-paso: bucles de herramientas agénticos incluidos en el conjunto de calibración y evaluación.
- Capacidades multilingües (inglés y otros idiomas, incluido coreano en las pruebas).
- Decodificación especulativa integrada mediante el drafter DSpark (2,8 tokens por ronda de verificación de media).
- Escritura creativa y contenido enciclopédico.

## Casos de uso

- Asistentes de código en local para desarrolladores con Mac: el modelo puede generar y razonar sobre código con un contexto agéntico y tool calling, ejecutándose en Apple Silicon a 92 tok/s en un M5 Ultra, lo que permite integrarlo en editores o terminales sin depender de la nube.
- Automatización de terminal y operaciones: las pruebas del autor cubren sesiones de terminal con una fidelidad top-1 del 98,6 % respecto al original, lo que lo hace adecuado para agentes que interpretan salidas de shell y proponen comandos.
- Análisis de capturas de pantalla y documentos escaneados: al conservar el encoder de visión en BF16 y lograr 40/40 en pruebas con imágenes conocidas (OCR multilingüe, conteo de formas, capturas de código), sirve para extraer información de screenshots y digitalizar contenido visual.
- Razonamiento matemático y resolución de problemas: los niveles de esfuerzo de razonamiento permiten ajustar el coste computacional según la dificultad, útil en tutoría automática o verificación de cálculos.
- Agentes con herramientas en flujos multi-paso: la estructura de turnos y llamadas a herramientas se preserva con alta fidelidad, lo que permite construir pipelines de agentes que encadenan búsquedas, ejecuciones y respuestas.
- Procesamiento multilingüe en local: con soporte de inglés y otros idiomas (coreano verificado), puede emplearse en traducción asistida o atención al cliente multilingüe en dispositivos Apple.
- Prototipado e investigación en eficiencia de modelos: el bundle documenta con detalle el efecto de distintas estrategias de cuantización (JANGT, JANGH, NVFP4) sobre la KL y el acuerdo top-1, lo que lo convierte en material útil para estudiar compresión de MoE.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad frente al modelo original, no benchmarks estándar de tareas (MMLU, HumanEval, GSM8K). Se presentan tal cual:

| Metrica | JANGHT4.2 (14,7 GB) | Original + atencion 8-bit (16,8 GB) | JANGH2 (10,2 GB) |
|---|---|---|---|
| KL mediana (↓) | 0,0019 | 0,00054 | 0,019 |
| KL media (↓) | 0,0070 | 0,0021 | 0,054 |
| KL p99 (↓) | 0,071 | 0,022 | 0,50 |
| Acuerdo top-1 (↑) | 96,88 % | 98,27 % | 91,3 % |
| Cambio de NLL (↓) | +0,0057 | +0,0014 | +0,052 |

Por dominio (KL mediana · top-1), JANGHT4.2 frente al suelo de medición:

| Dominio | Posiciones | JANGHT4.2 | Suelo |
|---|---|---|---|
| Terminal | 4.985 | 0,00019 · 98,6 % | 0,00008 · 99,0 % |
| Razonamiento / matemáticas | 47.390 | 0,00016 · 98,4 % | 0,00005 · 99,1 % |
| Código | 21.821 | 0,00054 · 97,7 % | 0,00019 · 98,7 % |
| Imágenes | 7.322 | 0,00034 · 97,5 % | 0,00008 · 98,8 % |
| Ciencia | 30.733 | 0,00099 · 97,4 % | 0,00029 · 98,5 % |
| Bucles agénticos | 13.474 | 0,00133 · 97,3 % | 0,00048 · 98,3 % |
| Contexto largo | 4.120 | 0,00096 · 96,8 % | 0,00042 · 97,7 % |
| Multilingüe | 52.199 | 0,0024 · 96,4 % | 0,00055 · 98,2 % |
| Escritura creativa | 75.810 | 0,0033 · 96,2 % | 0,00093 · 97,8 % |
| Enciclopédico | 61.490 | 0,0034 · 96,2 % | 0,00093 · 97,9 % |

Por esfuerzo de razonamiento (KL mediana · top-1): max 0,0010 · 97,8 %, xhigh 0,0015 · 97,3 %, high 0,0012 · 97,4 %, medium 0,0026 · 96,4 %, low 0,0012 · 96,6 %, minimal 0,0022 · 96,4 %, none 0,0020 · 96,5 %.

Pruebas de generación: 13 prompts con respuesta conocida, 13/13 en greedy y 39/39 con muestreo a temperatura 1,0 con tres semillas; 40/40 en imágenes con respuesta conocida (el original: 39/40). Estructura de turnos: 234/234 aperturas de razonamiento, 219/219 aperturas de respuesta, 8/8 aperturas de llamada a herramienta, 222/222 cierres de turno.

## Requisitos de hardware

- VRAM/unificada estimada: 14,65 GB de shards del modelo, más overhead del runtime; en Apple Silicon la memoria es unificada, por lo que se recomienda al menos 16 GB y preferiblemente 24-32 GB para contexto amplio y el drafter.
- Hardware objetivo: Apple Silicon con MLX y runtime Osaurus 1.0.12 o superior. El autor reporta 92 tok/s en un M5 Ultra.
- No está pensado para GPUs NVIDIA/AMD con CUDA: el formato es MLX y el runtime es específico de Apple.
- Cabe en equipos de consumo Apple con memoria unificada suficiente; no se dispone de datos para Macs de gama baja.
- Despliegue: exclusivamente mediante Osaurus (runtime propietario del autor) sobre MLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput de referencia: 92 tok/s (M5 Ultra, 128 tokens, mediana de 3), frente a 83 tok/s del checkpoint original y 105 tok/s del JANGH2 de 10,2 GB. El drafter DSpark rinde 2,8 tokens por ronda de verificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Tamano | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-JANGHT4.2 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | MLX / Osaurus | 14,7 GB | 96,88 % top-1 vs original |
| Inkling-2-Mini original (thinkingmachines) | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | safetensors | 20,2 GB | Checkpoint de referencia |
| Inkling-2-Mini-JANGH2 | 26,4B totales / 3,4B activos | no disponible | Apache 2.0 | MLX / Osaurus | 10,2 GB | 91,3 % top-1, 105 tok/s |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime: requiere Osaurus 1.0.12 o superior y MLX; no es portable a otros motores de inferencia ni a GPUs no Apple.
- Pérdida de fidelidad medible: 96,88 % de acuerdo top-1 y KL mediana de 0,0019 frente al original; los dominios de escritura creativa, enciclopédico y multilingüe son los más degradados (top-1 en torno al 96,2-96,4 %).
- Discrepancia de parámetros: el repo safetensors declara 15.378.137.104 parámetros, mientras la model card describe 26,4B totales; conviene verificar antes de dimensionar infraestructura.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de veracidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Idiomas: la model card declara inglés y multilingüe, pero solo se verifica coreano en las pruebas; el rendimiento en castellano no está medido.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo con garantías.
- Licencia Apache 2.0 permite uso comercial, pero el runtime Osaurus y las condiciones de uso del modelo base deben revisarse por separado.
- El bundle está pensado para Apple Silicon; el rendimiento en equipos con menos memoria unificada no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/Inkling-2-Mini-JANGHT4.2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime Osaurus: https://osaurus.ai
