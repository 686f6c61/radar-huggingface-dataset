# quickasr/Qwen3-ASR-0.6B-q8

## Resumen

Qwen3-ASR-0.6B-q8 es una copia cuantizada a int8 del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, publicada por el usuario quickasr. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo original de Qwen, transformados con la herramienta `quickasr quantize` para ejecutarse exclusivamente en quickasr, un runtime de speech-to-text en streaming de baja latencia orientado a CPU (con ruta opcional a GPU). El modelo base pertenece a la familia Qwen3-ASR de Alibaba, que incluye las variantes 1.7B y 0.6B y da soporte a identificación de idioma y transcripción en 52 idiomas y dialectos.

La relevancia de esta ficha está en el formato: los pesos han sido modificados y solo son cargables por quickasr, no por transformers, vLLM ni el paquete `qwen_asr`, y tampoco son GGUF. El archivo es un safetensors plano con la marca `"quickasr_format":"q8-1"` en sus metadatos, un layout propio de quickasr (versión 1) sin relación con el tipo `Q8_1` de ggml. Quien busque un modelo ASR portable debería acudir al modelo original o a una conversión GGUF; quien quiera latencia mínima en CPU con streaming, este formato es el adecuado.

El modelo tiene 796.188.672 parámetros reales según safetensors (etiquetado comercialmente como 0.6B), un repositorio de 1,2 GB y licencia Apache-2.0, heredada del modelo fuente. La cuantización reduce el uso de memoria respecto a bf16 (2,3 GB frente a 3,0 GB de RSS máximo en las pruebas del autor) manteniendo una precisión equivalente o ligeramente mejor en los conjuntos evaluados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, derivado de Qwen3-Omni; encoder de audio + decoder transformer con capas lineales cuantizadas) |
| Parámetros totales | 796.188.672 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (formato propio `q8-1` de quickasr: 7 pesos lineales por capa del decoder a int8 con una escala f32 por cada 32 pesos; encoder de audio, embeddings y capa de salida en bf16) |
| Idiomas soportados | no disponible en esta ficha; el modelo base Qwen3-ASR soporta 52 idiomas y dialectos según QwenLM |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (no GGUF; no cargable por transformers, vLLM ni `qwen_asr`) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3-ASR-0.6B, un modelo de reconocimiento automático del habla de la familia Qwen3-ASR, que según la documentación de QwenLM se apoya en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni y fue entrenado con datos de habla a gran escala. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica de esta publicación es el proceso de cuantización: los siete pesos lineales de cada capa del decoder (q, k, v, o, gate, up, down) se convierten a int8 con una escala f32 por cada bloque de 32 pesos, calculada como `d = max|v| / 127` y `q = round(v / d)`. El encoder de audio mantiene su precisión original, y los embeddings de tokens —que también actúan como capa de salida— se conservan en bf16, porque una capa de salida en int8 invierte tokens casi empatados. El resultado se guarda como safetensors plano con metadatos que identifican el formato. El autor indica que el texto generado puede diferir ligeramente del modelo fuente.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Identificación de idioma, heredada del modelo base Qwen3-ASR (52 idiomas y dialectos según QwenLM; la lista concreta no se detalla en esta ficha).
- Streaming en tiempo real: el runtime quickasr procesa audio por fragmentos (las pruebas usan chunks de 2 s) y emite texto de forma incremental.
- Ejecución en CPU de baja latencia, con ruta opcional a GPU.
- Cuantización int8 detectada automáticamente desde los pesos, sin necesidad de opciones adicionales.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR, no un LLM de propósito general.
- No se documentan capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción en streaming de reuniones y videollamadas: el modelo procesa fragmentos de 2 s y emite texto con una latencia mediana de 1,33 s (zh) y 1,55 s (en) en un Apple M1 Pro, lo que permite subtítulos casi en vivo sin GPU.
- Subtitulado de vídeo y podcasts en local: con 2,3 GB de RSS máximo en CPU, cabe en portátiles modestos y evita enviar audio a servicios en la nube, lo que simplifica el cumplimiento de privacidad.
- Dictado y notas de voz en aplicaciones de escritorio: la ejecución exclusiva en CPU y el formato int8 permiten integrar el runtime en herramientas ofimáticas sin depender de CUDA.
- Transcripción por lotes en servidores sin GPU: el throughput medido (0,64 s de CPU por segundo de audio en chino y 0,80 en inglés) permite procesar horas de audio en hardware convencional.
- Identificación de idioma y enrutamiento: al heredar la capacidad de language identification del modelo base, puede clasificar el idioma de una grabación antes de derivarla a un pipeline específico.
- Prototipado de asistentes de voz: la ruta opcional a GPU y el modo streaming permiten validar arquitecturas de agente conversacional con ASR local antes de escalar a modelos mayores.
- Investigación en ASR de bajo consumo: sirve como referencia reproducible para comparar precisión y latencia entre bf16 e int8 en condiciones controladas (AISHELL-1 y LibriSpeech).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en Apple M1 Pro (CPU), streaming en tiempo real con chunks de 2 s, sobre 180 s de chino (AISHELL-1 test) y 180 s de inglés (LibriSpeech test-clean). El error es CER para chino y WER para inglés; la latencia es la mediana desde el final de una palabra hasta su primera aparición.

| Formato | Error zh / en | CPU s por s de audio (zh / en) | Latencia p50 zh / en | RSS máximo |
|---|---|---|---|---|
| bf16 | 2,68% / 2,48% | 0,73 / 0,92 | 1,33 / 1,57 s | 3,0 GB |
| int8 | 2,46% / 2,48% | 0,64 / 0,80 | 1,33 / 1,55 s | 2,3 GB |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo, ni comparativas directas con otros modelos ASR.

## Requisitos de hardware

- VRAM/RAM estimada: 2,3 GB de RSS máximo en CPU con int8 (frente a 3,0 GB en bf16), según las pruebas del autor.
- GPU recomendadas: no se especifican modelos concretos; el runtime ofrece una ruta GPU opcional cuyos números están en `docs/performance.md` del repositorio, no incluidos en esta información.
- Cabe en GPU de consumo: no disponible el detalle, pero el tamaño (1,2 GB de repo, 2,3 GB de RSS) es compatible con GPUs de gama media y con CPU convencional.
- Opciones de despliegue: exclusivamente quickasr, compilado desde `main` (commit `6cb68dd` o posterior) con `make blas`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: 0,64 s de CPU por segundo de audio en chino y 0,80 en inglés (int8), con latencia p50 de 1,33 s y 1,55 s respectivamente en streaming con chunks de 2 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-q8 (este) | 796 M | no disponible | safetensors `q8-1` (solo quickasr) | Apache-2.0 | Hugging Face, runtime compilado desde `main` |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6B (nominal) | no disponible | safetensors bf16 | Apache-2.0 | Hugging Face, cargable por transformers y `qwen_asr` |
| tryambientai/Qwen3-ASR-0.6B-gguf | 0,8B | no disponible | GGUF | no disponible en la información | Hugging Face, ecosistema llama.cpp |
| Qwen3-ASR-1.7B | 1,7B | no disponible | safetensors | Apache-2.0 | Hugging Face; SOTA entre modelos ASR open source según QwenLM |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los pesos están modificados: el archivo solo funciona con quickasr y no es cargable por transformers, vLLM ni el paquete `qwen_asr`; tampoco es GGUF.
- El soporte int8 no está en una release de quickasr: hay que compilar desde `main` (commit `6cb68dd` o posterior), lo que implica inestabilidad potencial de API.
- El texto generado puede diferir ligeramente del modelo fuente, aunque las métricas de error medidas sean iguales o mejores.
- No se documentan sesgos específicos del modelo ni del proceso de cuantización; al ser una copia del modelo Qwen, hereda los sesgos del modelo base, no cuantificados en esta información.
- Riesgo de alucinación en la transcripción: no se han publicado tasas de inserción de texto inexistente ni evaluaciones en audio ruidoso o con acentos fuera de los conjuntos de prueba.
- La cobertura de idiomas no se detalla en esta ficha; el modelo base declara 52 idiomas y dialectos, pero no se verifica su comportamiento tras la cuantización.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad de validar el rendimiento en producción recae en el integrador.
- El modelo es solo ASR: no debe emplearse para tareas de razonamiento, código o generación de texto general.

## Enlaces

- Hugging Face: https://huggingface.co/quickasr/Qwen3-ASR-0.6B-q8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio quickasr: https://github.com/nexustar/quickasr
- Documentación del formato int8: https://github.com/nexustar/quickasr/blob/main/MODEL.md#int8-models-quickasr-quantize
- Rendimiento detallado (incluida ruta GPU): https://github.com/nexustar/quickasr/blob/main/docs/performance.md
- Repositorio Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Conversión GGUF de terceros: https://huggingface.co/tryambientai/Qwen3-ASR-0.6B-gguf
