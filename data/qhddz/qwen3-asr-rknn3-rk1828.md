# qhddz/qwen3-asr-rknn3-rk1828

## Resumen

Qwen3-ASR-0.6B (RKNN3 / RK1828) es una conversión del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B de Alibaba Qwen, preparada por el usuario qhddz para ejecutarse sobre la NPU Rockchip RK1828 mediante el toolkit RKNN3. El repositorio no contiene el modelo original en formato estándar, sino artefactos ya compilados (`.rknn` y `.weight`) junto con el tokenizador en GGUF, los embeddings y un demo C++ precompilado para anfitrión x86_64 conectado por PCIe. El objetivo es permitir inferencia de ASR directamente en hardware edge sin recompilar ni reconvertir nada.

El modelo subyacente combina un encoder de audio en fp16 con un decoder LLM cuantizado en W4A16 con GRQ (group-wise quantization), y cubre 52 idiomas y dialectos con detección automática de idioma. El tamaño total del repositorio es de 1,1 GB, coherente con un modelo de 0,6 mil millones de parámetros cuantizado. La licencia es Apache-2.0.

La relevancia actual reside en la posibilidad de desplegar ASR multilingüe en dispositivos con NPU dedicada (Rockchip RK1828) sin depender de GPU o de servicios en la nube, algo poco habitual en el ecosistema de modelos ASR de código abierto. No hay métricas de benchmarks publicadas en la información disponible, y el autor solo reporta una transcripción correcta de un clip de 8,9 segundos en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (fp16) + decoder LLM cuantizado W4A16 GRQ, compilado a RKNN3 |
| Parametros totales | 0,6 mil millones (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GRQ en el decoder LLM; encoder en fp16 |
| Idiomas soportados | 52 idiomas y dialectos, con detección automática de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` + `.weight` (RKNN3), tokenizador en GGUF, embeddings en `.bin` |

## Arquitectura y entrenamiento

El modelo original Qwen3-ASR-0.6B sigue una arquitectura típica de ASR basada en LLM: un encoder de audio que transforma la señal acústica en representaciones latentes y un decoder de tipo transformer que genera el texto transcrito condicionado por esas representaciones y por el contexto. En esta conversión, el encoder se mantiene en fp16 y el decoder se cuantiza a W4A16 con GRQ (cuantización por grupos de pesos), lo que reduce el peso del decoder a aproximadamente 4 bits por peso manteniendo activaciones en 16 bits.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La innovación destacable de este repositorio no es el entrenamiento, sino la cadena de conversión: los ficheros `.rknn` se generaron con los pipelines oficiales del `rknn3-model-zoo` y el autor afirma haberlos verificado en hardware RK1828 real, lo que elimina el paso de compilación para el usuario final. El pipeline de demo se ejecuta en un anfitrión x86_64 que se comunica con la NPU por PCIe.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) multilingüe, con 52 idiomas y dialectos cubiertos.
- Detección automática de idioma, sin necesidad de especificar el idioma de entrada de forma manual.
- Procesamiento de audio mediante un frontend mel de 128 filtros (`mel_128_filters.txt`).
- Ejecución en NPU Rockchip RK1828 mediante RKNN3, con encoder fp16 y decoder cuantizado W4A16.
- Demo C++ precompilado para x86_64 con librerías de runtime incluidas, listo para ejecutar sobre hardware RK1828.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio generativo o thinking mode: no disponibles.

## Casos de uso

- Transcripción en dispositivos edge: el modelo se ejecuta en la NPU RK1828 integrada en equipos empotrados, permitiendo transcribir audio localmente sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automático multilingüe: gracias a la detección automática de idioma y a la cobertura de 52 idiomas y dialectos, puede generar subtítulos para contenido audiovisual en varios idiomas sin configuración manual por idioma.
- Asistentes de voz embebidos: un dispositivo con RK1828 puede convertir la voz del usuario en texto para alimentar un componente de NLU local, manteniendo la latencia baja al no depender de red.
- Actas y notas de reunión: transcripción de clips de audio en aplicaciones de productividad en equipos de escritorio con NPU conectada por PCIe, como demuestra el demo x86_64 incluido.
- Procesamiento por lotes de audio en servidores edge: el runtime RKNN3 permite desplegar el modelo en hosts x86_64 con acelerador RK1828 para transcribir grandes volúmenes de audio sin GPU dedicada.
- Integración en pipelines de CI/CD de audio: el demo C++ y las librerías precompiladas facilitan incorporar la transcripción como paso automatizado en flujos de verificación de calidad de audio o de accesibilidad.
- Prototipado rápido en hardware Rockchip: al no requerir compilación ni conversión, el repositorio sirve para validar casos de uso de ASR sobre RK1828 antes de invertir en un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente que un clip de 8,9 segundos en chino se transcribió correctamente en hardware RK1828, sin cifras de WER, latencia o throughput.

## Requisitos de hardware

- NPU Rockchip RK1828 con toolkit RKNN3; el modelo está compilado específicamente para esta plataforma.
- Anfitrión x86_64 conectado a la NPU por PCIe para ejecutar el demo C++ incluido.
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 1,1 GB y el decoder está cuantizado a W4A16, pero no se especifica el consumo de memoria en la NPU.
- GPU recomendadas: no aplica; el modelo está pensado para NPU Rockchip, no para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible, ya que el formato `.rknn` no es ejecutable directamente en CUDA.
- Opciones de despliegue: runtime RKNN3 con el demo C++ precompilado (`rknn_qwen3_asr_demo`) y librerías incluidas en `demo_x86_64.tar.gz`; vLLM, llama.cpp, Ollama o TGI no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (RKNN3 / RK1828) | 0,6 B | no disponible | 52 | Apache-2.0 | NPU Rockchip RK1828 |
| Whisper large-v3 | no disponible en esta ficha | no disponible | multilingüe | MIT | GPU/CPU |
| Qwen3-ASR-0.6B original | 0,6 B | no disponible | 52 | Apache-2.0 | GPU/CPU |

La comparación con Whisper large-v3 y con el modelo original Qwen3-ASR-0.6B se limita a la categoría y a la licencia; no hay datos de rendimiento comparables en la información disponible. La diferencia principal de esta conversión frente al modelo original es el formato de despliegue: RKNN3 para NPU Rockchip en lugar de pesos estándar para GPU o CPU.

## Limitaciones y advertencias

- El formato `.rknn` es específico de RKNN3 y RK1828; no es portable a GPU, CPU genérica ni a otras NPU sin reconversión.
- No hay datos publicados de WER, latencia ni cobertura real por idioma; la única validación reportada es un clip de 8,9 segundos en chino.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento original; no se dispone de información sobre sesgos del modelo base.
- La cuantización W4A16 del decoder puede degradar la precisión de transcripción frente al modelo original en fp16; no se han publicado comparaciones.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribución a Alibaba Qwen como autor del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- El demo se distribuye como archivo comprimido porque Hugging Face no permite ejecutables sin empaquetar; requiere extracción manual antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qhddz/qwen3-asr-rknn3-rk1828
- Pipeline de conversión oficial: https://github.com/airockchip/rknn3_model_zoo
