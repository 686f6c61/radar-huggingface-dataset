# pranil00/ONIX-codegemma-7b-it-GGUF

## Resumen

ONIX-codegemma-7b-it-GGUF es una cuantización en formato GGUF del modelo google/codegemma-7b-it, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto de conversión, no de un modelo entrenado desde cero: el trabajo consiste en comprimir los pesos originales de CodeGemma 7B (familia Gemma de Google, orientada a generación de código) a una precisión de 5,5 bits por peso mediante el esquema Q5_K_M, reduciendo el tamaño de 19,42 GB en FP16 a 6,67 GB.

El modelo base CodeGemma 7B es un transformer decoder-only de Google derivado de Gemma, especializado en tareas de código: autocompletado, generación, explicación y razonamiento sobre lenguajes de programación. Esta versión cuantizada mantiene la arquitectura y el comportamiento del original, pero está pensada para ejecutarse en hardware de consumo mediante llama.cpp, Ollama, LM Studio o el runner propietario run-any-model que el autor promociona.

La relevancia de esta ficha es limitada pero práctica: permite ejecutar un modelo de código de ~7B en equipos con 8 GB de VRAM o memoria unificada, a costa de una pérdida de calidad declarada de en torno al 2,5 %. No obstante, la model card mezcla datos verificables con afirmaciones de marketing no auditables (por ejemplo, "97,5 % de retención cognitiva" o "9,93 mil millones de parámetros" para un modelo de 7B), que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma), según el modelo base google/codegemma-7b-it |
| Parametros totales | 7B nominales según el nombre del modelo base; la model card declara 9.927.694.336 parámetros (dato inconsistente con el nombre "7b", no verificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon y 4.096 tokens en CPU según la model card; el contexto nativo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otras variantes en el repositorio |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el modelo base está orientado a código y lenguajes naturales, pero no se detalla la cobertura) |
| Licencia | Apache 2.0 (declarada en el repositorio y en la model card) |
| Formato de pesos | GGUF (archivo google--codegemma-7b-it-Q5_K_M.gguf, 6,67 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base google/codegemma-7b-it: un transformer decoder-only de la familia Gemma, preentrenado por Google sobre datos de código y texto, y posteriormente ajustado por instrucciones (sufijo "it"). Esta publicación no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; esos detalles pertenecen a la documentación oficial de Google, no a esta model card.

La única intervención técnica documentada es la cuantización a Q5_K_M mediante el motor run-any-model, que el autor describe como "device-adaptive". Según el informe de telemetría incluido, la conversión reduce el tamaño de pesos un 65,6 % (de 19,42 GB a 6,67 GB), mantiene el búfer de KV cache en FP16 (1.176 MB) y acelera las 42 capas del modelo en Metal. No se documentan innovaciones arquitectónicas propias, decodificación especulativa ni modificaciones del grafo de atención; es una conversión de pesos estándar en formato GGUF.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base CodeGemma 7B.
- Autocompletado y rellenado de código (fill-in-the-middle), capacidad típica de la familia CodeGemma; no confirmada explícitamente en esta model card.
- Explicación y razonamiento sobre fragmentos de código.
- Generación de texto general y respuestas a instrucciones (variante "it").
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o el runner run-any-model.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información disponible.
- Capacidades multilingües: no disponibles en la documentación del repositorio.

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de consumo: con 6,67 GB de pesos y ~8 GB de VRAM, se puede cargar en una RTX 3060/4060 o en un Mac con 16 GB de memoria unificada y usarse como autocompletado o chat técnico sin enviar código a servicios externos.
- Revisión de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite analizar repositorios propietarios sin exponerlos a APIs de terceros, algo crítico en banca, sanidad o defensa.
- Generación de tests unitarios y documentación técnica: el modelo base está ajustado para instrucciones de código, por lo que puede producir borradores de tests y docstrings que el desarrollador revisa y adapta.
- Integración en pipelines de CI/CD como paso de sugerencia: mediante llama.cpp o un servidor compatible con la API de OpenAI, se puede invocar para proponer parches o explicar fallos de compilación en un runner con GPU.
- Educación y prototipado: sirve para experimentar con modelos de código en portátiles sin GPU dedicada, usando la variante CPU con contexto de 4.096 tokens.
- Base para fine-tuning ligero o experimentación con cuantizaciones: al estar en GGUF, es un punto de partida para comparar calidad entre precisiones o para servir como referencia en evaluaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye un informe de telemetría de cuantización (tamaño de pesos, RAM residente, número de capas aceleradas) y una estimación de retención de calidad del 97,5 %, que no equivale a una evaluación en MMLU, HumanEval o GSM8K y no es verificable con los datos aportados.

## Requisitos de hardware

- VRAM/RAM estimada: 7,89 GB de memoria unificada en Apple Silicon, 8,17 GB de VRAM dedicada en NVIDIA, 9,89 GB de RAM libre en CPU (cifras de la model card).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 o H100 (estas dos últimas sobradas para un modelo de este tamaño); en Apple, chips M1 a M5 con al menos 16 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM, siempre que se use la cuantización Q5_K_M.
- Opciones de despliegue: llama.cpp (llama-cli con -ngl 99), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model del autor.
- Latencia y throughput: no disponibles; la model card no aporta tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-codegemma-7b-it-GGUF (esta ficha) | 7B (declarados 9,93B, no verificado) | 8.192 en GPU / 4.096 en CPU | GGUF Q5_K_M | Apache 2.0 | Cuantización comunitaria del base de Google |
| google/codegemma-7b-it (original) | 7B | No disponible en esta información | Safetensors | Gemma Terms of Use (no Apache 2.0 en el original) | Pesos FP16/BF16, requiere ~19 GB |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens (según documentación pública de Meta) | Safetensors, GGUF | Llama 2 Community License | Alternativa de Meta orientada a código |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens (según documentación pública de Alibaba) | Safetensors, GGUF | Apache 2.0 | Alternativa con contexto más amplio y licencia permisiva |

La comparación de rendimiento en benchmarks no está disponible para esta cuantización; cualquier afirmación de superioridad o inferioridad frente a las alternativas requeriría evaluaciones propias.

## Limitaciones y advertencias

- La model card contiene afirmaciones no verificables ("97,5 % de retención cognitiva", "9,93 mil millones de parámetros" para un modelo etiquetado como 7B) que no deben tomarse como datos técnicos contrastados.
- La licencia declarada es Apache 2.0, pero el modelo base google/codegemma-7b-it se distribuye bajo los Gemma Terms of Use; existe una posible inconsistencia de licencia que conviene revisar antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en explicaciones de código o APIs poco comunes.
- El contexto efectivo se limita a 4.096 tokens en CPU, lo que puede ser insuficiente para repositorios o archivos grandes.
- No se documentan idiomas soportados ni evaluación multilingüe.
- El repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y fue creado y actualizado en el mismo minuto: no hay evidencia de uso comunitario ni de validación independiente.
- El runner run-any-model promocionado es un proyecto del propio autor; su madurez y mantenimiento no están verificados.
- No se han publicado benchmarks; el rendimiento real en tareas de código debe medirse antes de adoptarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-codegemma-7b-it-GGUF
- Modelo base: https://huggingface.co/google/codegemma-7b-it
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Runner run-any-model: https://github.com/PranilShah-08/run-any-model
