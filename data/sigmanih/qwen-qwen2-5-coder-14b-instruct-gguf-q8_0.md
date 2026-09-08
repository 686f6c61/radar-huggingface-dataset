# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0

## Resumen

El modelo `sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0` es una cuantización GGUF en formato Q8_0 del modelo `Qwen/Qwen2.5-Coder-14B-Instruct`, publicada por el usuario `sigmanih` a través de su herramienta Sigma Studio. Se trata de un modelo de generación de texto especializado en código, con 14.770 millones de parámetros y una arquitectura `qwen2` (transformer decoder-only). La cuantización Q8_0 reduce el peso a 14,62 GB en disco, manteniendo una precisión cercana a la del modelo original, lo que permite ejecutarlo en hardware de consumo con suficiente memoria VRAM.

El modelo original fue desarrollado por Alibaba Qwen y destaca por sus mejoras en generación, razonamiento y corrección de código respecto a CodeQwen1.5. Esta versión cuantizada está pensada para inferencia local de alta velocidad, asistentes de programación y loops de agentes autónomos. Su ventana de contexto es de 32.768 tokens, suficiente para manejar archivos de código extensos y conversaciones largas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2` (transformer decoder-only) |
| Parametros totales | 14.770.033.664 (14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Inglés, italiano (según model card) |
| Licencia | Other (según HuggingFace); el modelo base Qwen2.5-Coder-14B-Instruct es Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

La arquitectura base es `qwen2`, un transformer decoder-only con 48 capas y una dimensión oculta de 5120. El modelo original `Qwen2.5-Coder-14B-Instruct` fue entrenado por Alibaba Qwen con un enfoque específico en tareas de programación, incluyendo mejoras en generación de código, razonamiento y corrección de errores. Esta cuantización GGUF no altera los pesos del modelo; únicamente los convierte a un formato de 8 bits (Q8_0) para reducir el tamaño y acelerar la inferencia en CPU y GPU con llama.cpp. No se dispone de información detallada sobre el proceso de entrenamiento (datos, tokens, RLHF/DPO) en la documentación de esta cuantización.

## Capacidades

- Generación de código en Python y otros lenguajes: resultados de HumanEval del 86% y MBPP del 89% en la evaluación propia del autor.
- Razonamiento matemático: 100% en GSM8K y 89% en MATH.
- Razonamiento científico y de sentido común: 100% en ARC-Challenge y 56% en HellaSwag.
- Conocimiento general y razonamiento avanzado: 43% en MMLU y 44% en MMLU-Pro.
- Factualidad y anti-alucinación: 67% en TruthfulQA.
- Ventana de contexto larga de 32.768 tokens, adecuada para archivos de código extensos y conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: recomendado en la model card para "loop de agentes autónomos y razonamiento", aunque no se detallan capacidades técnicas específicas.
- Capacidades multilingües: declarado para inglés e italiano.

## Casos de uso

- Asistente de programación local: el modelo puede ejecutarse con llama.cpp en una GPU con 16 GB de VRAM, ofreciendo sugerencias de código y explicaciones en tiempo real sin depender de servicios en la nube.
- Autocompletado en entornos de desarrollo: gracias a su formato GGUF, puede integrarse en editores como VS Code a través de herramientas compatibles con llama.cpp, generando código contextual en función del archivo abierto.
- Agentes autónomos de refactorización: la ventana de 32.768 tokens permite analizar archivos completos y proponer cambios estructurales, con razonamiento multi-step en loops de agente.
- Educación en programación: el modelo puede generar ejercicios, explicar conceptos y corregir errores en tareas de estudiantes, tanto en inglés como en italiano.
- Análisis de código legacy: al soportar contexto largo, puede revisar funciones extensas, detectar bugs y sugerir mejoras de rendimiento o legibilidad.
- Automatización de scripts: generación de scripts de shell, Python o bash para tareas de CI/CD, gracias a su alta competencia en HumanEval y MBPP.
- Soporte técnico bilingüe: al declarar soporte para inglés e italiano, puede utilizarse en sistemas de atención al cliente con respuestas técnicas en ambos idiomas.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la evaluación publicada por el autor, realizada sobre una muestra reducida de cada dataset, no sobre la suite completa. No son comparables con ejecuciones completas de benchmarks estándar.

| Benchmark | Precisión | Correctos / Total |
|---|---|---|
| ARC-Challenge | 100% | 9 / 9 |
| BIG-Bench Hard | 71% | 5 / 7 |
| GPQA | 22% | 2 / 9 |
| GSM8K | 100% | 9 / 9 |
| HellaSwag | 56% | 5 / 9 |
| HumanEval | 86% | 6 / 7 |
| MATH | 89% | 8 / 9 |
| MBPP | 89% | 8 / 9 |
| MMLU | 43% | 6 / 14 |
| MMLU-Pro | 44% | 4 / 9 |
| TruthfulQA | 67% | 6 / 9 |
| Total | 68% | 68 / 100 |

Velocidad medida por el autor en una NVIDIA GeForce RTX 5070 Ti con 15,9 GB de VRAM:

| Métrica | Valor |
|---|---|
| Decodificación de un solo stream | 37,3 tok/s |
| Procesamiento de prompt | 305 tok/s |
| Throughput agregado (varias peticiones) | 34,4 tok/s |

Advertencia del autor: estas mediciones corresponden a una máquina concreta y no son extrapolables a otros hardware.

## Requisitos de hardware

- VRAM estimada: la cuantización Q8_0 ocupa 14,62 GB en disco; para inferencia con el contexto completo se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA GeForce RTX 5070 Ti (15,9 GB) es la máquina de referencia. También son adecuadas RTX 4090 (24 GB), A100 o H100 para entornos de producción.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 16 GB o más. En GPUs de 12 GB la cuantización Q8_0 no cargará completa; se necesitaría una cuantización inferior como Q5_K_M o Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli) y Sigma Studio. También puede convertirse a otros formatos compatibles con GGUF, como Ollama, aunque no está listado oficialmente.
- Latencia y throughput: 37,3 tok/s de decodificación en un solo stream y 305 tok/s de procesamiento de prompt en RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0` | 14B | 32.768 | Other (HF) | GGUF Q8_0 |
| `Qwen/Qwen2.5-Coder-14B-Instruct` (original) | 14B | 32.768 | Apache-2.0 | Safetensors |
| `Qwen/Qwen2.5-Coder-14B-Instruct-GGUF` (oficial) | 14B | 32.768 | Apache-2.0 | GGUF (varias cuantizaciones) |
| `CodeLlama-13B-Instruct` | 13B | 16.384 | Llama 2 Community | Safetensors |

No se dispone de benchmarks comparativos completos para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados se han realizado sobre una muestra reducida de cada dataset (100 preguntas en total), por lo que no son representativos de una evaluación completa y no deben compararse con puntuaciones de suites estándar.
- El rendimiento en razonamiento avanzado es limitado: GPQA con 22% y MMLU con 43% indican dificultades en tareas de nivel universitario y conocimiento general.
- Riesgo de alucinación: TruthfulQA con 67% deja margen para respuestas incorrectas en contextos factuales.
- El soporte de idiomas se limita a inglés e italiano según la model card; el uso en otros idiomas no está garantizado.
- La licencia aparece como "other" en HuggingFace, lo que requiere verificar los términos exactos antes de un uso comercial.
- La cuantización Q8_0 puede introducir pequeñas diferencias de precisión respecto al modelo original en safetensors.
- No se proporciona información sobre soporte de tool calling, function calling, ni sobre medidas de seguridad o alineación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q8_0
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Cuantización GGUF oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
- Modelo Qwen2.5-Coder-14B: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
