# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-5.4GB es una versión cuantizada extrema del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture-of-Experts (MoE) con 26.400 millones de parámetros totales y 5.400 millones activos. La cuantización la ha desarrollado el usuario `shinmegamiboson` mediante su compilador propietario LookAtMyQuant, que comprime los 18,89 GB de pesos nativos en texto (BF16) hasta 5,38 GB, es decir, 1,65 bits por parámetro de texto, lo que supone una reducción de 3,5×. El resultado se empaqueta para los runtimes MLX (Apple Silicon) y CUDA (NVIDIA), con soporte de decodificación especulativa mediante drafters DSpark de 179 MB.

El interés de esta ficha radica en que demuestra que es posible mantener capacidades de razonamiento y código razonablemente altas en un modelo MoE de 26B con solo 1,65 bits por parámetro, algo que hasta hace poco se consideraba inviable fuera de entornos de investigación. Con el límite de tokens de pensamiento (`--max-thinking-tokens 960`) alcanza un 93,5% en GSM8K (187/200) y un 85,4% estricto en HumanEval (140/164), lo que lo sitúa en un rango útil para tareas de matemáticas y generación de código en hardware de consumo.

La relevancia actual es doble: por un lado, valida técnicas de cuantización post-entrenamiento basadas en trellis y asignación de outliers por grupos de 128 filas; por otro, ofrece una vía práctica para ejecutar un MoE de 26B en un Apple M5 Max con 6,41 GB de RAM pico, algo imposible con los pesos originales. La licencia del modelo base es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 48 visitas lógicas, con decodificación especulativa DSpark |
| Parámetros totales | 26.400 millones (26,4B) |
| Parámetros activos | 5.400 millones (5,4B) |
| Longitud de contexto | 16.384 tokens (evaluado a 16k en recall); longitud máxima nativa no disponible |
| Tipos de cuantización | 1,65 bits por parámetro de texto (trellis `ht2`/`ht3`/`rtr1`/`rtr4`, escalas de fila FP16, escalas de columna pre-Hadamard) |
| Idiomas soportados | Inglés (`en`) según la model card; evaluación KL multilingüe sobre 13 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Empaquetado propietario para los runtimes MLX y CUDA de LookAtMyQuant (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26,4B de parámetros totales y 5,4B activos, organizado en 48 visitas lógicas (el tag `inkling2_loop` sugiere un esquema de capas recurrentes o "looped"). La cuantización se aplica sobre los pesos nativos en BF16 (18,89 GB de texto) mediante un proceso en tres fases descrito en la model card: primero, una asignación tipo knapsack de códigos trellis (`ht2`, `ht3`, `rtr1`, `rtr4`) por bloques de 4 KB de SRAM, con promoción de outliers Fisher en grupos de 128 filas y un suelo de 2 bits en la cola del head de salida; segundo, un QAT con DAgger on-policy sobre rollouts largos (seq_len = 1.408) de código multi-doctest, matemáticas y texto en 13 idiomas contra el profesor BF16; y tercero, un pulido de 500 pasos que ajusta conjuntamente escalas de columna de entrada pre-Hadamard, escalas de fila FP16 y tensores de steering nativos, con KL del router sobre 48 visitas.

La innovación destacable es la combinación de trellis de bloques con asignación de outliers por grupo de filas y destilación on-policy, que permite bajar a 1,65 bits por parámetro manteniendo un KL medio de 0,1440 nats en el chat templado de 6 clases frente al BF16 original. Además, el runtime incorpora decodificación especulativa con drafters DSpark de 4 bits (179 MB), lo que eleva el throughput en decodificación serial de 66,3 tok/s a 115,5 tok/s en matemáticas y 105,0 tok/s en código (3,35 tokens por chequeo) en un Apple M5 Max.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con trazas de pensamiento (`<|content_thinking|>`).
- Razonamiento matemático: 92,5% en GSM8K sin modificar y 93,5% con el límite de 960 tokens de pensamiento.
- Generación de código: 76,8% estricto en HumanEval sin modificar y 85,4% con el límite de pensamiento (89,4% de media).
- Capacidades de visión: 4/4 en Vision VQA según la model card, aunque el pipeline declarado es solo `text-generation`.
- Soporte de tool calling y uso agéntico: la evaluación KL incluye clases específicas de herramientas (0,2165) y agentes (0,1555).
- Recall de contexto largo: 13/16 en la prueba de agujas a 16.384 tokens (8 hechos + 8 copias literales), con margen de +2,29 nats.
- Capacidades multilingües limitadas: el modelo declara solo inglés, aunque se ha evaluado KL sobre 13 idiomas (0,2659 en el conjunto completo frente a 0,0859 en inglés).
- Modo de pensamiento controlable mediante `--max-thinking-tokens`, que cierra las trazas en un límite de frase o salto de línea.

## Casos de uso

- Razonamiento matemático en dispositivos de consumo: con 5,38 GB de pesos y 6,41 GB de RAM pico en un Apple M5 Max, se puede resolver álgebra y aritmética multi-paso (por ejemplo, "What is 17 times 23? Show the steps") sin conexión a la nube, manteniendo un 93,5% en GSM8K.
- Asistente de código en local para desarrolladores: el 85,4% estricto en HumanEval con el límite de pensamiento permite autocompletar funciones y resolver problemas tipo doctest en un portátil con GPU consumer o Apple Silicon, integrándolo en editores mediante el servidor `lamq serve --ui`.
- Automatización agéntica con tool calling: la clase KL de herramientas (0,2165) y agentes (0,1555) indica que el modelo conserva el formato de llamadas a funciones, lo que permite construir pipelines de agentes que consulten APIs o ejecuten comandos en local.
- Procesamiento de documentos largos: el recall de 13/16 a 16.384 tokens lo hace apto para resumir contratos, extraer hechos de informes o responder preguntas sobre manuales técnicos de hasta 16k tokens en una sola pasada.
- Prototipado rápido en investigación: al ocupar 5,38 GB, se puede cargar en paralelo con otros modelos en una sola GPU o en memoria unificada de Apple Silicon, facilitando experimentos de comparación de cuantizaciones (la familia incluye builds de 3,9, 4,7, 8,9, 11,2 y 12,8 GB).
- Servicio de chat conversacional de bajo coste: con 66,3 tok/s en decodificación serial y 1.552 tok/s en prefill T=512, el servidor `lamq serve` puede atender conversaciones multi-turno en inglés con latencia aceptable para uso interno o demos.
- Evaluación de técnicas de cuantización: el KL por clase (razonamiento 0,1275, código 0,1590, prosa 0,0745, multilingüe 0,1312, copia 0,2018) sirve como referencia para investigadores que quieran medir el impacto de compresiones agresivas en modelos MoE.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre los pesos empaquetados con `max_new_tokens = 1.536`, greedy y `reasoning_effort="none"`, frente al profesor BF16 de 18,89 GB:

| Build | GB texto | bpp | KL bruto (en / 13 idiomas) | KL 6 clases | GSM8K (200) | HumanEval (164) |
|---|---:|---:|---:|---:|---:|---:|
| Original BF16 | 18,89 | 5,80 | 0,0000 / 0,0000 | 0,0000 | 94,0% → 94,5% | 89,6% → 97,0% |
| 12,8 GB | 12,74 | 3,92 | 0,0084 / 0,0209 | 0,0465 | 94,5% → 96,0% | 90,9% → 95,7% |
| 11,2 GB | 11,16 | 3,43 | 0,0131 / 0,0315 | 0,0461 | 95,0% → 97,5% | 88,4% → 95,1% |
| 8,9 GB | 8,85 | 2,72 | 0,0278 / 0,0628 | 0,0530 | 95,0% → 96,5% | 84,8% → 94,5% |
| **5,4 GB (esta build)** | **5,38** | **1,65** | **0,0859 / 0,2659** | **0,1440** | **92,5% → 93,5%** | **76,8% → 85,4%** |
| 4,7 GB | 4,72 | 1,45 | 0,1179 / 0,3731 | 0,1668 | 90,5% → 94,5% | 67,1% → 78,0% |
| 3,9 GB | 3,85 | 1,18 | 0,2189 / 0,6058 | 0,2329 | 86,5% → 88,5% | 59,2% → 70,7% |

Desglose de KL por clase para la build de 5,4 GB (nats, menor es mejor):

| Métrica | Valor |
|---|---:|
| KL medio chat templado 6 clases | 0,1440 |
| Herramientas / agentes | 0,2165 / 0,1555 |
| Razonamiento / código / prosa | 0,1275 / 0,1590 / 0,0745 |
| Multilingüe / copia | 0,1312 / 0,2018 |
| Recall a 16k (capped / margen bruto) | 13/16 (+2,29 / +2,37 nats) |

Métricas de rendimiento en Apple M5 Max con drafter DSpark de 4 bits (179 MB): 1.552 tok/s en prefill T=512, 66,3 tok/s en decodificación serial, 115,5 tok/s en matemáticas y 105,0 tok/s en código con decodificación especulativa (3,35 tokens por chequeo). No se han publicado resultados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 5,38 GB de pesos de texto; 5,34 GB activos y 6,41 GB de RAM pico en Apple Silicon con el drafter cargado.
- GPU recomendadas: Apple M5 Max (probado oficialmente); GPUs NVIDIA con soporte CUDA y PTX para el drafter nativo (`--drafter auto`). No se especifican modelos concretos de NVIDIA en la información disponible.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 6-7 GB de VRAM libre (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 en adelante) y en Apple Silicon con memoria unificada de 8 GB o más.
- Opciones de despliegue: runtime propietario LookAtMyQuant (`lamq generate`, `lamq chat`, `lamq serve --ui`), con backend MLX para Apple Silicon y backend CUDA/Triton para NVIDIA; API de Python mediante `runtime_mlx.Runtime`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 1.552 tok/s en prefill T=512, 66,3 tok/s en decodificación serial, 115,5 tok/s en matemáticas y 105,0 tok/s en código con drafter en M5 Max. No se han publicado cifras para CUDA.

## Comparativa con modelos similares

Comparación dentro de la propia familia LookAtMyQuant, que es la referencia directa disponible:

| Build | GB | bpp | GSM8K (cap 960) | HumanEval (cap 960) | Licencia |
|---|---:|---:|---:|---:|---|
| 12,8 GB | 12,74 | 3,92 | 96,0% | 95,7% | Apache 2.0 |
| 8,9 GB | 8,85 | 2,72 | 96,5% | 94,5% | Apache 2.0 |
| **5,4 GB** | **5,38** | **1,65** | **93,5%** | **85,4%** | Apache 2.0 |
| 4,7 GB | 4,72 | 1,45 | 94,5% | 78,0% | Apache 2.0 |
| 3,9 GB | 3,85 | 1,18 | 88,5% | 70,7% | Apache 2.0 |

Frente a otras alternativas de la misma categoría (MoE de ~26B con cuantización extrema), no se dispone de datos comparativos en la información proporcionada. La comparación con el profesor BF16 original (18,89 GB, 94,5% GSM8K, 97,0% HumanEval con cap) muestra que esta build pierde 1,0 punto en GSM8K y 11,6 puntos en HumanEval a cambio de una reducción de 3,5× en tamaño.

## Limitaciones y advertencias

- La cuantización a 1,65 bits introduce una degradación notable en código: HumanEval estricto cae del 97,0% del profesor al 85,4% con el límite de pensamiento, y al 76,8% sin él.
- El KL multilingüe (0,2659) es tres veces superior al inglés (0,0859), y la clase de copia literal (0,2018) es la peor del desglose, lo que indica pérdida de fidelidad en tareas de reproducción exacta de texto.
- El modelo declara únicamente inglés; el resto de idiomas solo se ha evaluado vía KL, no con benchmarks funcionales, por lo que el uso en castellano u otras lenguas no está validado.
- Riesgo de alucinación inherente al modelo base y potencialmente amplificado por la compresión; no se han publicado evaluaciones de factualidad ni de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el runtime LookAtMyQuant es un proyecto independiente cuyo soporte y mantenimiento no están garantizados por Thinking Machines.
- El formato de pesos es propietario del runtime LookAtMyQuant: no es compatible con safetensors estándar, GGUF, vLLM, llama.cpp ni Ollama, lo que limita la portabilidad y obliga a instalar el paquete desde GitHub.
- El rendimiento en CUDA está menos documentado que en Apple Silicon; las cifras de throughput publicadas corresponden únicamente a un M5 Max.
- El repositorio ocupa 21,2 GB pese a que los pesos de texto son 5,38 GB, probablemente por artefactos adicionales; conviene verificar el contenido antes de descargarlo en entornos con poco almacenamiento.
- La fecha de creación (2026-11-21) y el ecosistema de tags (`trellis`, `inkling2_loop`) sugieren un proyecto de investigación reciente; la estabilidad a largo plazo del runtime no está contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DSpark: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Build de 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Build de 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Build de 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Build de 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Build de 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio del compilador LookAtMyQuant: https://lookatmyquant.com/
