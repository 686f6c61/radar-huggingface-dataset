# pranil00/ONIX-starcoder2-15b-GGUF

## Resumen

ONIX-starcoder2-15b-GGUF es una cuantización en formato GGUF del modelo base bigcode/starcoder2-15b, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo original StarCoder2-15B es un transformer decoder-only desarrollado por BigCode (colaboración entre Hugging Face y ServiceNow) especializado en generación de código, y esta versión concreta aplica una cuantización Q3_K_M (aproximadamente 3,5 bits por peso) para reducir el peso de los ficheros de 43,02 GB en FP16 a 9,41 GB.

El artefacto está pensado para ejecución en hardware de consumo mediante llama.cpp, Ollama, LM Studio, Jan o la herramienta propietaria run-any-model del autor. La model card declara una retención de calidad del 91 % respecto al modelo sin cuantizar y un ratio de compresión de 4,57x, aunque estos datos provienen de la telemetría propia del autor y no de una evaluación independiente con benchmarks estándar.

La relevancia de esta ficha es doble: por un lado permite ejecutar un modelo de código de gran tamano en equipos con 10-12 GB de memoria; por otro, conviene tratar con cautela las afirmaciones de la model card, ya que no se aportan resultados de MMLU, HumanEval ni métricas verificables, y la cuantización Q3_K_M introduce pérdida de precisión notable en tareas de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia StarCoder2) |
| Parametros totales | 22.000 millones (21.995.421.696 según model card); el modelo base se denomina comercialmente 15B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU según la model card; el modelo base StarCoder2-15b soporta hasta 16.384 tokens |
| Tipos de cuantizacion | Q3_K_M (3,5 bits por peso); no se publican otras variantes en este repo |
| Idiomas soportados | no disponible (el modelo base está entrenado mayoritariamente en inglés y lenguajes de programación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero bigcode--starcoder2-15b-Q3_K_M.gguf, 9,41 GB) |

## Arquitectura y entrenamiento

El modelo base bigcode/starcoder2-15b es un transformer decoder-only con atención multi-cabeza estándar, entrenado por BigCode sobre el dataset The Stack v2, compuesto por código fuente de más de 600 lenguajes de programación, repositorios de GitHub, pull requests y documentación técnica. El entrenamiento original incluye fases de preentrenamiento y ajuste supervisado, con un total declarado por BigCode de aproximadamente 4 billones de tokens y una ventana de contexto nativa de 16.384 tokens.

Esta publicación concreta no aporta información sobre el proceso de cuantización más allá de la herramienta utilizada (run-any-model) y los parámetros declarados: Q3_K_M, compresión 4,57x, retención de calidad estimada del 91 %. No se documenta qué dataset de calibración se empleó, ni si se aplicó imatrix, ni qué capas se vieron más afectadas. La model card incluye una tabla de "telemetría" que compara FP16 con Q3_K_M en un Mac con 16 GB de memoria unificada, pero no se detalla la metodología de medición ni se ofrecen trazas reproducibles.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, entre otros), heredadas del entrenamiento de StarCoder2.
- Relleno de código en medio de fichero (fill-in-the-middle, FIM), capacidad nativa del modelo base StarCoder2.
- Generación de documentación técnica, comentarios y tests unitarios a partir de fragmentos de código.
- Explicación y refactorización de código existente en conversaciones multi-turno dentro de la ventana de contexto disponible.
- Generación de texto general en inglés, aunque el modelo está optimizado para código.
- No se documenta soporte explícito de tool calling ni function calling en esta model card.
- No se documenta modo de razonamiento extendido (thinking mode), visión ni audio.
- Capacidades multilingües naturales limitadas al inglés y a los lenguajes de programación vistos en entrenamiento; no se declaran idiomas naturales adicionales.

## Casos de uso

- Autocompletado de código en IDE: el modelo puede integrarse en extensiones tipo Continue o similares mediante un servidor compatible con la API de OpenAI expuesto por llama.cpp u Ollama, aprovechando la ventana de 8.192 tokens para mantener contexto del fichero abierto.
- Asistente de refactorización local: con 9,41 GB de pesos cabe en portátiles con 16 GB de memoria unificada, lo que permite refactorizar módulos completos sin enviar código a servicios en la nube, algo relevante para entornos con requisitos de confidencialidad.
- Generación de tests unitarios: a partir de una función o clase dada, el modelo puede producir casos de prueba en el mismo lenguaje; útil en pipelines de CI/CD que necesiten cobertura inicial.
- Documentación automática de repositorios: generación de docstrings y ficheros README a partir del código fuente, ejecutable en local en equipos de desarrollo sin GPU dedicada.
- Ensenanza y formación en programación: despliegue en portátiles de estudiantes con 10-12 GB de RAM para practicar ejercicios y recibir explicaciones de código sin depender de APIs externas.
- Prototipado offline en entornos aislados (air-gapped): al ser un GGUF ejecutable con llama.cpp, puede desplegarse en máquinas sin conexión a internet, útil en entornos industriales o de defensa.
- Traducción entre lenguajes de programación: conversión de fragmentos entre lenguajes populares, con la advertencia de que la cuantización Q3_K_M puede degradar la corrección sintáctica en lenguajes menos representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (HumanEval, MBPP, MMLU, GSM8K) en la información disponible. La model card únicamente incluye una tabla de telemetría interna del autor con las siguientes métricas de despliegue, no de calidad:

| Metrica | FP16 (base) | Q3_K_M (esta version) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 3,5 | -78,1 % |
| Tamano de pesos | 43,02 GB | 9,41 GB | -78,1 % |
| KV cache | 320 MB | 320 MB | Sin cambio |
| RAM total residente | 43,44 GB | 9,84 GB | -77,4 % |
| Retencion de calidad estimada | 100 % | 91,0 % | -9,0 % |
| Capas aceleradas | 0/40 | 40/40 | Optimo |

Estos datos provienen del propio autor y no han sido verificados de forma independiente; la cifra de "91 % de retención de calidad" no especifica contra qué conjunto de evaluación se midió.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 9,84 GB en Apple Silicon con memoria unificada; 10,91 GB de VRAM dedicada en GPU NVIDIA; 11,84 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier GPU NVIDIA con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). En GPUs con 8 GB no cabe en su totalidad y requeriría offloading parcial a CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Apple Silicon con 16 GB o más de memoria unificada (M1/M2/M3/M4/M5).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, Jan, Text-Generation-WebUI y la herramienta run-any-model del autor.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-starcoder2-15b-GGUF (Q3_K_M) | 22.000 M (nominal 15B) | 8.192 / 4.096 tokens | GGUF | Apache 2.0 | Esta ficha; cuantización de terceros |
| bigcode/starcoder2-15b (original) | 15.000 M | 16.384 tokens | safetensors | Apache 2.0 (con condiciones de uso aceptable) | Modelo base sin cuantizar; requiere ~30 GB en BF16 |
| Qwen2.5-Coder-14B | 14.700 M | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Alternativa moderna con mejor rendimiento declarado en código y contexto mayor |
| DeepSeek-Coder-V2-Lite | 15.700 M (2.400 M activos) | 128.000 tokens | safetensors, GGUF | DeepSeek License | MoE con contexto muy superior; licencia no Apache |

La comparación con Qwen2.5-Coder-14B y DeepSeek-Coder-V2-Lite es orientativa: no se dispone de benchmarks de esta cuantización concreta que permitan una comparación numérica directa.

## Limitaciones y advertencias

- La cuantización Q3_K_M es agresiva (3,5 bits por peso) y suele degradar la corrección sintáctica en código generado; para tareas de producción se recomienda Q5_K_M o Q6_K si el hardware lo permite.
- La cifra de "91 % de retención de calidad" no está respaldada por benchmarks públicos ni por una metodología reproducible.
- El modelo base StarCoder2-15b tiene una licencia Apache 2.0 con condiciones de uso aceptable adicionales (política de uso de BigCode); conviene revisarlas antes de uso comercial.
- El modelo está entrenado principalmente en inglés y lenguajes de programación; el rendimiento en castellano como idioma natural es limitado y no se declara oficialmente.
- Riesgo de alucinación en APIs, nombres de funciones y librerías: el modelo puede inventar métodos inexistentes, especialmente con contextos largos o lenguajes poco representados.
- La model card incluye una cláusula de exención de responsabilidad total ("AS IS") que traslada al usuario toda la responsabilidad sobre las salidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- No se documenta el dataset de calibración ni si se aplicó imatrix, lo que impide evaluar la fidelidad de la cuantización en capas sensibles.
- El contexto declarado en la model card (8.192 en GPU, 4.096 en CPU) es inferior al nativo del modelo base (16.384), lo que sugiere una limitación impuesta por la herramienta de despliegue o por la configuración del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-starcoder2-15b-GGUF
- Modelo base: https://huggingface.co/bigcode/starcoder2-15b
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
- Paper de StarCoder2 (BigCode): https://arxiv.org/abs/2402.19173
- Repositorio StarCoder2 en GitHub: https://github.com/bigcode-project/starcoder2
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
