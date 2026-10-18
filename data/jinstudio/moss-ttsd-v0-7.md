# Jinstudio/MOSS-TTSD-v0.7

## Resumen

Jinstudio/MOSS-TTSD-v0.7 es un modelo de síntesis de diálogo hablado (text-to-spoken dialogue) bilingüe chino-inglés. Según los metadatos del repositorio, se basa en Qwen/Qwen3-1.7B-Base y tiene 2.049.551.360 parámetros totales. La model card lo presenta como MOSS-TTSD y el código de ejemplo apunta a OpenMOSS-Team/MOSS-TTSD-v0.7 y al codec OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf; la información disponible no confirma la relación exacta entre ambos repositorios.

El modelo convierte guiones de diálogo entre dos hablantes en audio conversacional con prosodia natural, cambio de hablante y clonación de voz zero-shot. Está orientado a producción de pódcast, ficción sonora, localización y prototipado de asistentes de voz. Su interés actual radica en que combina licencia Apache-2.0, soporte de dos voces clonadas y generación de hasta 1700 segundos de audio en una sola sesión.

La arquitectura declarada combina un codec neural audio semántico-acústico unificado con un modelo de lenguaje preentrenado. No se detallan en la información proporcionada la ventana de contexto, el número exacto de tokens de entrenamiento ni métricas de calidad objetivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM preentrenado + codec neural audio semántico-acústico; backbone Qwen/Qwen3-1.7B-Base; implementación `moss_ttsd` con `custom_code` |
| Parámetros totales | 2.049.551.360 (aprox. 2,05 B) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible; la model card no especifica ventana de contexto textual |
| Tipos de cuantización | no disponible; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; requiere `custom_code` y `trust_remote_code` |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 4,1 GB |
| Salida de audio | 24 kHz según el ejemplo de la model card |

## Arquitectura y entrenamiento

La model card indica que MOSS-TTSD se construye sobre un codec neural audio semántico-acústico unificado y un modelo de lenguaje preentrenado. Los metadatos identifican Qwen/Qwen3-1.7B-Base como modelo base. El total de 2.049.551.360 parámetros incluye el backbone y el codec/cabezas asociadas, aunque no se detalla el desglose exacto. La implementación se distribuye con código personalizado (`moss_ttsd`, `custom_code`) y se carga mediante `AutoModel` y `AutoProcessor` con `trust_remote_code=True`.

El entrenamiento se describe de forma general como basado en millones de horas de datos TTS y habla conversacional. No se especifican el número exacto de tokens, la composición del dataset, el uso de RLHF/DPO ni otros detalles del proceso de alineamiento. Las innovaciones destacadas son el codec de bajo bitrate para secuencias largas, el entrenamiento para generar hasta 1700 segundos por sesión, la clonación de voz zero-shot de dos hablantes y el uso de etiquetas `[S1]`/`[S2]` para marcar los turnos de cada hablante.

## Capacidades

- Síntesis de diálogo hablado entre dos hablantes a partir de un guion con etiquetas `[S1]` y `[S2]`.
- Clonación de voz zero-shot de dos hablantes mediante audio de referencia y texto de referencia.
- Cambio de hablante preciso según el guion, con prosodia conversacional.
- Generación de audio de hasta 1700 segundos en una sola sesión.
- Soporte bilingüe chino-inglés; no se documentan otros idiomas.
- Generación de audio a 24 kHz según el ejemplo de uso.
- Integración mediante Transformers, PyTorch y `trust_remote_code`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada general ni modo thinking.

## Casos de uso

- Producción de pódcast de dos locutores: el modelo convierte un guion con turnos `[S1]`/`[S2]` en un audio conversacional con dos voces clonadas. La generación de hasta 1700 segundos permite reducir la fragmentación en episodios largos.
- Localización de contenido audiovisual chino-inglés: a partir de un guion traducido, se puede generar una pista de diálogo en el idioma objetivo manteniendo dos voces de referencia. Es adecuado para prototipos de doblaje y pruebas de mercado.
- Audiolibros y ficción sonora con dos personajes: permite alternar narrador y personaje mediante etiquetas de hablante, con prosodia conversacional y clonación de voces. Resulta útil para escenas de diálogo y demos editoriales.
- Prototipado de asistentes de voz e IVR: se pueden generar diálogos de prueba entre agente y usuario con voces de referencia antes de grabar locuciones definitivas. No se documenta funcionamiento en tiempo real, por lo que encaja mejor en generación offline.
- Formación y e-learning: creación de entrevistas simuladas, juegos de rol o diálogos de ventas con dos voces diferenciadas. El formato WAV de salida facilita la integración en plataformas de contenido.
- Accesibilidad: conversión de transcripciones dialogadas en audio con dos voces para facilitar el consumo de contenido escrito. La clonación permite mantener voces consistentes en series de documentos.
- Investigación en TTS y clonación de voz: sirve como base reproducible con licencia Apache-2.0 para experimentar con codecs, diálogo largo y cambio de hablante. No obstante, no se aportan benchmarks públicos en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan métricas de calidad subjetiva (MOS), inteligibilidad (WER/CER), similitud de hablante, latencia o throughput.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 4,1 GB, coherente con el tamaño del repositorio. La VRAM total estimada para inferencia es de 6-10 GB, incluyendo codec, activaciones y caché; es una estimación orientativa no verificada.
- Pesos en INT8: aproximadamente 2,1 GB. La VRAM total estimada sería de 3-5 GB, pero no se documenta soporte de cuantización.
- Pesos en INT4: aproximadamente 1,1 GB. La VRAM total estimada sería de 2,5-4 GB, pero no se documenta soporte de cuantización.
- GPU de consumo: orientativamente podría ejecutarse en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB o RTX 4090 24 GB, siempre que el código personalizado y el codec funcionen correctamente. No verificado.
- GPU profesionales: A10 24 GB, L4 24 GB, A100 40/80 GB o H100 para lotes grandes y generación de audio largo.
- Despliegue: el ejemplo oficial usa Transformers con `trust_remote_code=True`, PyTorch y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se publica el factor de tiempo real ni el rendimiento para sesiones de 1700 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Jinstudio/MOSS-TTSD-v0.7 | 2.049.551.360 | no disponible | sin benchmarks en la información disponible | Apache-2.0 | HuggingFace |
| OpenMOSS-Team/MOSS-TTSD-v0.7 | no disponible | no disponible | no disponible | Apache-2.0 según la model card | HuggingFace; referenciado en el código de ejemplo |
| CosyVoice 2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| XTTS-v2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de las alternativas en la información proporcionada. La comparación cuantitativa de parámetros, contexto, rendimiento y licencia queda pendiente; las alternativas se listan únicamente como candidatas de la misma categoría de TTS conversacional.

## Limitaciones y advertencias

- Solo se documentan chino e inglés; no hay soporte declarado para otros idiomas.
- El modelo está diseñado para dos hablantes; no se documenta diálogo con más de dos voces.
- No se han publicado benchmarks ni métricas objetivas de calidad, similitud de hablante o inteligibilidad.
- Riesgo inherente a TTS: posible omisión, alteración o mala pronunciación de nombres propios, números, siglas, cambios de código y términos poco frecuentes.
- La generación de audio largo, hasta 1700 segundos, puede acumular derivas de prosodia o de identidad de hablante; no se documenta una evaluación específica.
- La clonación de voz exige consentimiento explícito y cumplimiento normativo; la licencia Apache-2.0 no elimina los riesgos de suplantación o deepfakes.
- `trust_remote_code=True` implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- La licencia Apache-2.0 cubre este repositorio, pero debe verificarse también la licencia del modelo base Qwen/Qwen3-1.7B-Base y del codec referenciado.
- No se documenta soporte de tool calling, function calling, agentes, visión ni modos de razonamiento explícitos.

## Enlaces

- [Jinstudio/MOSS-TTSD-v0.7 en HuggingFace](https://huggingface.co/Jinstudio/MOSS-TTSD-v0.7)
- [Qwen/Qwen3-1.7B-Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base)
- [OpenMOSS-Team/MOSS-TTSD-v0.7, referenciado en la model card](https://huggingface.co/OpenMOSS-Team/MOSS-TTSD-v0.7)
- [OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf, codec referenciado en el ejemplo](https://huggingface.co/OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
