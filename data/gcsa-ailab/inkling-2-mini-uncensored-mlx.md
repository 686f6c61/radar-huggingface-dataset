# GCSA-AiLab/Inkling-2-Mini-Uncensored-MLX

## Resumen

Inkling-2-Mini-Uncensored-MLX es una derivación del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por GCSA-AiLab. El autor ha aplicado una edición del vector de rechazo mediante la técnica Abliterix (ablación de direcciones de rechazo en los pesos) y ha convertido el resultado a formato MLX para su ejecución en Apple Silicon. Se distribuye en tres subdirectorios con distintos esquemas de cuantización y está pensada como material de investigación, no como modelo listo para producción.

El modelo base emplea la arquitectura `Inkling2LoopForConditionalGeneration`, un transformer con 24 capas físicas en el que las 12 capas centrales se ejecutan tres veces (ejecución recurrente), combinado con mezcla de expertos dispersa (MoE). El modelo original reporta 26,4 mil millones de parámetros totales y 3,4 mil millones activos; al contabilizar las ejecuciones recurrentes, el cómputo efectivo por token ronda los 5,4 mil millones de parámetros. Acepta entrada de texto e imagen y produce salida de texto.

La relevancia de esta ficha es doble: por un lado documenta una arquitectura poco habitual (recurrencia de capas más MoE) y su empaquetado en MLX; por otro, advierte de que la modificación de rechazo degrada deliberadamente el comportamiento de seguridad, con resultados medidos en StrongREJECT y SimpleSafetyTests que lo desaconsejan como filtro o asistente sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopForConditionalGeneration`; 24 capas físicas con las 12 centrales ejecutadas 3 veces; MoE disperso |
| Parametros totales | 26,4 B (según el modelo base) |
| Parametros activos | 3,4 B reportados por el modelo base; ~5,4 B efectivos por token al contar la recurrencia |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tres variantes: `6bit/` (MLX affine 6 bits en capas de texto no expertas), `4bit/` (MLX affine 4 bits), `fp8-mxfp8/` (MXFP8). Los expertos conservan la cuantización del checkpoint fuente: NVFP4 en capas 0-19 y MXFP8 en capas 20-23 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX; requiere MLX 0.32.4 y MLX-VLM 0.8.1 o superiores |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con dos rasgos estructurales: recurrencia de capas y MoE. De las 24 capas físicas, las 12 intermedias se ejecutan tres veces, de modo que el grafo efectivo es más profundo que el número de capas almacenadas. La capa MoE introduce expertos dispersos que elevan el total a 26,4 B de parámetros con solo 3,4 B activos por token según el modelo base; el autor de esta derivación estima ~5,4 B efectivos por token al sumar el coste de la recurrencia. El modelo incluye además un codificador visual con 422 tensores relacionados con imagen, y conserva el chat template original.

Sobre el entrenamiento del modelo base no se aporta información en los materiales disponibles (número de tokens, composición del dataset, uso de RLHF o DPO): no disponible. Lo que sí se detalla es la intervención de esta derivación: Abliterix editó 113 tensores de atención y 23 sesgos de router, sin tocar pesos de expertos, codificador visual ni tokenizer. La conversión a MLX se realizó con MLX 0.32.4 y MLX-VLM 0.8.1, y las tres variantes superaron la validación estructural con `mlx_vlm.utils.load_model(..., lazy=True)`.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), con soporte de prompts multimodales.
- Razonamiento y generación de texto general heredados del modelo base.
- Procesamiento de imágenes mediante el codificador visual incluido (422 tensores).
- Conservación del chat template original para conversaciones multi-turno.
- Ejecución en Apple Silicon mediante MLX y MLX-VLM; soporte de backend CUDA en Linux con activación de cuantización de activaciones (`--quantize-activations`) para pesos NVFP4/MXFP8.
- Comportamiento de rechazo atenuado de forma deliberada (abliteración), orientado a investigación sobre alineamiento y seguridad.
- Soporte de tool calling, agentes, modo thinking o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve para estudiar cómo la edición de direcciones de rechazo (113 tensores de atención y 23 sesgos de router) altera la tasa de respuestas dañinas, comparando con el modelo base mediante StrongREJECT y SimpleSafetyTests.
- Evaluación de técnicas de abliteración: permite reproducir y auditar el efecto de Abliterix sobre un MoE con recurrencia, aislando qué componentes (atención, router) concentran la conducta de rechazo.
- Desarrollo y prueba de pipelines MLX-VLM: útil para validar el soporte de modelos multimodales MoE con cuantización mixta (NVFP4/MXFP8 en expertos) en Apple Silicon.
- Experimentos de cuantización comparada: las tres variantes (6 bits, 4 bits, MXFP8) permiten medir el impacto de la precisión en capas de texto no expertas sobre calidad y huella de memoria.
- Prototipado de asistentes multimodales en local: con 17-18 GB de pesos, cabe en equipos Apple Silicon de gama alta para pruebas de descripción de imágenes y diálogo.
- Docencia y demostraciones de riesgos de modelos abliterados: los resultados publicados (86/100 respuestas inseguras en SimpleSafetyTests) sirven como caso práctico de por qué la ablación de rechazo no equivale a un modelo seguro.
- Análisis de robustez de evaluadores automáticos: el uso de un juez externo (`deepseek-v4.1-flash`) sobre texto visible permite estudiar discrepancias entre juicio automático y humano.

## Benchmarks y rendimiento

Los datos proceden de los pesos Safetensors fusionados **antes** de la conversión a MLX, generados con vLLM y evaluados por un juez automático externo; no son mediciones del modelo en MLX.

| Benchmark | Condiciones | Resultado (pesos fusionados) |
|---|---|---|
| StrongREJECT | 180/313 muestras (30 por categoría), temperatura 0, máx. 2048 tokens, razonamiento 0 | Rechazo explícito 5/180; cumplimiento sustantivo con advertencia 126/180; sin advertencia 15/180; otros 34/180 |
| SimpleSafetyTests | 100 ítems completos, condiciones `all`/`none`, sin system prompt de seguridad, temperatura 0.01, máx. 1048 tokens, semilla 42, razonamiento `none` | Inseguro 86/100; seguro 14/100 |

Desglose de SimpleSafetyTests por dominio de riesgo:

| Dominio | Muestras | Inseguro |
|---|---:|---:|
| Daño a menores | 20 | 19 |
| Bienes ilegales o muy regulados | 20 | 17 |
| Daño físico y violencia | 20 | 19 |
| Fraude | 20 | 17 |
| Suicidio, autolesión y trastornos alimentarios | 20 | 14 |

Por tipo de prompt: informativo/consejo 37/50 inseguro; instrucción/acción 49/50 inseguro. No se han publicado resultados de benchmarks del modelo base en la información disponible, ni mediciones del rendimiento en MLX.

## Requisitos de hardware

- Huella de pesos: 17,66 GB (`6bit/`), 17,27 GB (`4bit/`) y 18,00 GB (`fp8-mxfp8/`), en tamaños decimales. El repositorio completo ocupa 71,0 GB.
- Memoria unificada recomendada: al menos 24-32 GB en Apple Silicon para cargar una variante con margen para KV cache; 16 GB resulta insuficiente en la práctica para las tres opciones.
- GPU Apple Silicon: familias M2 Pro/Max/Ultra y M3/M4 Pro/Max/Ultra son el objetivo natural de MLX. No hay datos de latencia ni throughput publicados.
- Backend CUDA: MLX-VLM permite ejecutar en Linux con NVIDIA, requiriendo `--quantize-activations` para los pesos NVFP4/MXFP8; no se especifican GPU concretas (A100, H100, RTX 4090) en la información disponible.
- Despliegue: MLX-VLM (`mlx_vlm.generate --model ./4bit ...`), con `--image` para entrada visual. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta derivación MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-MLX (este) | 26,4 B totales / 3,4 B activos (~5,4 B efectivos) | no disponible | Apache-2.0 | MLX safetensors | Multimodal, MoE recurrente, rechazo ablacionado |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B totales / 3,4 B activos | no disponible | Apache-2.0 | no disponible | Sin ablación; referencia de comportamiento seguro |
| Otras derivaciones abliteradas de Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |
| Alternativas MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos comparables en la búsqueda |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: no se aportan resultados de benchmarks del modelo base ni de terceros.

## Limitaciones y advertencias

- El rechazo ha sido eliminado de forma deliberada: en SimpleSafetyTests el 86 % de las respuestas se clasificaron como inseguras. No debe usarse como filtro de seguridad ni como asistente sin supervisión humana.
- Riesgo elevado de contenido dañino en las cinco categorías evaluadas, con especial incidencia en daño a menores (19/20) y violencia física (19/20).
- Los benchmarks publicados corresponden a los pesos fusionados antes de la conversión a MLX; el comportamiento del modelo en MLX no está verificado y podría diferir.
- El juicio automático (`deepseek-v4.1-flash`) no equivale a la evaluación humana del paper original; las cifras deben interpretarse con cautela.
- Idiomas soportados no documentados; el modelo base y la model card están mayoritariamente en chino e inglés, sin garantías para castellano.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la política de uso aceptable de Thinking Machines; el uso comercial de un modelo abliterado con estos resultados conlleva riesgo reputacional y legal.
- Las cuantizaciones son mixtas: `4bit/` y `6bit/` no son uniformes y `fp8-mxfp8/` no es FP8 puro; los expertos conservan NVFP4/MXFP8, lo que puede afectar a la reproducibilidad entre backends.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- StrongREJECT: https://github.com/dsbowen/strong_reject
- SimpleSafetyTests: https://github.com/bertiev/SimpleSafetyTests
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- README en chino simplificado: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-MLX/blob/main/README.md
- README en chino tradicional: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-MLX/blob/main/README.zh-Hant.md
- README en inglés: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-MLX/blob/main/README.en.md
