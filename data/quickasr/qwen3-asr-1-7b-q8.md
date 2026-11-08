# quickasr/Qwen3-ASR-1.7B-q8

## Resumen

Qwen3-ASR-1.7B-q8 es una versión cuantizada a int8 del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, publicada por el usuario quickasr. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos realizada con la herramienta `quickasr quantize` para que el modelo funcione en quickasr, un runtime de inferencia escrito en C orientado a transcripción en streaming de baja latencia sobre CPU, con una ruta GPU opcional basada en ggml.

La relevancia de esta ficha está en el formato: los pesos han sido modificados y solo son cargables por quickasr. No funcionan con transformers, vLLM ni el paquete `qwen_asr`, y no están en formato GGUF. El archivo es un safetensors plano con metadatos que marcan el layout propietario `q8-1` (versión 1 del formato de quickasr, sin relación con el tipo `Q8_1` de ggml).

El modelo conserva la licencia Apache-2.0 del modelo original y mantiene la precisión del encoder de audio y de los embeddings de tokens (que también hacen de capa de salida) en bf16, cuantizando únicamente las siete matrices lineales de cada capa del decodificador. El repositorio ocupa 2,8 GB y declara 2.082.092.672 parámetros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; encoder de audio + decodificador transformer, segun la estructura de pesos descrita) |
| Parametros totales | 2.082.092.672 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (layout propietario `q8-1` de quickasr; escala f32 por cada 32 pesos) |
| Idiomas soportados | no disponible en la model card; se reportan evaluaciones en chino, ingles y japones |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (plano, con metadatos `"quickasr_format":"q8-1"`); no es GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base en la documentación proporcionada. La model card de esta conversión describe únicamente el proceso de cuantización: las siete matrices lineales de cada capa del decodificador (q, k, v, o, gate, up, down) se almacenan en int8 con una escala f32 por cada 32 pesos, calculada como `d = max|v| / 127` y `q = round(v / d)`. El encoder de audio mantiene su precisión original, al igual que los embeddings de tokens, que también actúan como capa de salida en bf16; el autor justifica esta decisión indicando que una capa de salida en int8 invierte tokens casi empatados en probabilidad.

El archivo resultante es un safetensors plano marcado con el layout `q8-1`, específico de quickasr y sin relación con el tipo `Q8_1` de ggml. La conversión se realizó sobre la revisión `7278e1e70fe206f11671096ffdd38061171dd6e5` del modelo original, y el autor documenta que puede reproducirse con el comando `./quickasr quantize qwen3-asr-1.7b qwen3-asr-1.7b-q8`. El runtime quickasr es C puro sin dependencias más allá de la biblioteca estándar y una implementación BLAS (Accelerate en macOS, OpenBLAS en Linux y Windows), con una ruta GPU opcional mediante ggml (Metal, Vulkan).

## Capacidades

- Reconocimiento automático del habla (ASR) con salida de texto a partir de audio.
- Transcripción en streaming de baja latencia, con chunks configurables (la evaluación usa chunks de 2 s y de 4 s).
- Procesamiento en CPU con un consumo de memoria contenido gracias a la cuantización int8.
- Soporte de una ruta GPU opcional a través de ggml (Metal, Vulkan).
- Capacidades multilingües: la model card reporta evaluaciones en chino (AISHELL-1 test), inglés (LibriSpeech test-clean) y japonés (66 clips de conversación).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento explícito.

## Casos de uso

- Transcripción en streaming sobre CPU: el modelo está diseñado para quickasr con chunks de 2 s y ofrece latencias p50 de 1,88 s (chino) y 2,15 s (inglés) en un Apple M1 Pro, lo que lo hace adecuado para subtitulado en directo en equipos sin GPU dedicada.
- Subtitulado de reuniones y videollamadas: la ventana de streaming y el bajo consumo de memoria (4,5 GB de RSS máximo en la evaluación) permiten ejecutarlo en paralelo con otras aplicaciones en un portátil.
- Despliegue en servidores sin acelerador: al ser C puro con OpenBLAS, puede integrarse en servicios Linux sin dependencias de CUDA ni de frameworks de Python, reduciendo la superficie de ataque y el coste operativo.
- Transcripción de audio en chino e inglés con alta precisión: los errores reportados (CER 1,12% en AISHELL-1 y WER 2,48% en LibriSpeech test-clean) lo hacen apto para dictado y generación de actas cuando el idioma está dentro de ese par.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la velocidad de 1,49 s de CPU por segundo de audio en chino y 1,80 en inglés permite transcribir grandes volúmenes en infraestructura de CPU estándar.
- Prototipado e investigación en ASR: el formato abierto safetensors y la licencia Apache-2.0 facilitan la inspección de pesos y la experimentación, aunque el modelo solo se carga con quickasr.
- Evaluación de conversaciones en japonés: con CER del 11,1% en clips conversacionales de 4 s, puede usarse para transcripción aproximada de reuniones en ese idioma, asumiendo una tasa de error mayor que en chino e inglés.

## Benchmarks y rendimiento

Datos publicados en la model card para Apple M1 Pro, CPU, streaming en tiempo real con chunks de 2 s, 180 s de audio en chino (AISHELL-1 test) y en inglés (LibriSpeech test-clean). El error es CER para chino y WER para inglés; la latencia es la mediana desde el final de una palabra hasta su primera aparición.

| Formato | Error zh / en | CPU s por s de audio (zh / en) | Latencia p50 zh / en | RSS máximo |
|---|---|---|---|---|
| bf16 | 1,12% / 2,48% | 1,76 / 2,10 | 2,00 / 2,30 s | 7,0 GB |
| int8 | 1,12% / 2,48% | 1,49 / 1,80 | 1,88 / 2,15 s | 4,5 GB |

En 66 clips de conversación en japonés con chunks de 4 s, el CER fue del 11,1% tanto en bf16 como en int8. El autor advierte de que el texto puede diferir ligeramente del modelo original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: 4,5 GB de RSS máximo en la evaluación en CPU con int8; 7,0 GB en bf16. En GPU no se especifica consumo de VRAM en la información disponible.
- GPU recomendadas: no disponible. La ruta GPU opcional usa ggml con Metal (macOS) y Vulkan (Linux/Windows).
- CPU: funciona en CPU sin GPU; la evaluación se realizó en un Apple M1 Pro. En Linux y Windows requiere OpenBLAS.
- ¿Cabe en GPU de consumo? No se especifica en la información disponible; por tamaño (2,8 GB de pesos) es plausible, pero no hay datos publicados.
- Opciones de despliegue: exclusivamente quickasr, compilado desde `main` (commit `6cb68dd` o posterior) con `make blas` o `make gpu`. No es compatible con vLLM, transformers, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,49 s de CPU por segundo de audio en chino y 1,80 en inglés con int8; latencia p50 de 1,88 s y 2,15 s respectivamente en streaming con chunks de 2 s. El autor remite a `docs/performance.md` del repositorio para más números, incluida la ruta GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Compatibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-q8 (este) | 2.082.092.672 | safetensors int8 `q8-1` | Apache-2.0 | Solo quickasr | Cuantizado, streaming en CPU |
| Qwen/Qwen3-ASR-1.7B | no disponible | safetensors bf16 (original) | Apache-2.0 | transformers, `qwen_asr` | Modelo base sin cuantizar |
| Qwen3-ASR-0.6B | no disponible | no disponible | no disponible | quickasr (0.6B y 1.7B) | Versión menor del mismo runtime |
| chameleon-ai/qwen3-asr-1.7b | no disponible | no disponible | no disponible | no disponible | Fine-tune del mismo modelo base |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y compatibilidad.

## Limitaciones y advertencias

- Los pesos están modificados y solo se cargan con quickasr; no funcionan con transformers, vLLM, llama.cpp, Ollama ni el paquete `qwen_asr`, y no son GGUF.
- Los modelos int8 no están incluidos en una release de quickasr; es necesario compilar desde `main` (commit `6cb68dd` o posterior).
- El texto generado puede diferir ligeramente del modelo original, según advierte el autor.
- El CER en japonés (11,1%) es notablemente superior al de chino e inglés, lo que limita su uso en ese idioma para aplicaciones que requieran alta fidelidad.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, longitud de contexto ni lista completa de idiomas soportados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento originales, no detallados aquí.
- Al ser una conversión de un tercero (quickasr) y no del equipo de Qwen, no hay garantía de mantenimiento ni de paridad exacta con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quickasr/Qwen3-ASR-1.7B-q8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio quickasr: https://github.com/nexustar/quickasr
- Documentación del formato int8: https://github.com/nexustar/quickasr/blob/main/MODEL.md#int8-models-quickasr-quantize
- Documentación de rendimiento: https://github.com/nexustar/quickasr/blob/main/docs/performance.md
- Fine-tune de terceros: https://huggingface.co/chameleon-ai/qwen3-asr-1.7b
