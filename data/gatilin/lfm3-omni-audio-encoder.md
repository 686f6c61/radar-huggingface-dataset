# gatilin/lfm3-omni-audio-encoder

## Resumen

`gatilin/lfm3-omni-audio-encoder` es una extracción comunitaria de los componentes de audio del modelo multimodal LiquidAI/LFM3-Omni-2B: concretamente los submódulos `model.audio_encoder.*` y `model.audio_projector.*`. No se trata de un modelo completo, sino de un paquete de pesos (115.278.144 parámetros, unos 0,2 GB en safetensors) que proporciona el codificador de entrada de voz y el proyector al espacio del lenguaje, manteniendo claves, dtypes, formas y valores originales del checkpoint de Liquid AI (revisión `21d75123f86c1f7ffb4bef1ea202710c4e7ebe67`).

El interés de esta extracción es que permite reutilizar la torre de audio de LFM3-Omni-2B de forma aislada, por ejemplo para obtener embeddings de audio (pipeline `feature-extraction`) o para integrar el front-end de voz en otros pipelines sin cargar el modelo completo. El extractor de características incluido espera audio mono a 16 kHz y genera un token de salida por cada ocho frames mel, lo que define la tasa de compresión temporal del codificador.

Cabe subrayar que el paquete no incluye el modelo de lenguaje, el decodificador de salida ni el códec de audio LiquidCodec (24 kHz), que se distribuye por separado. La licencia aplicada es la LFM Open License 1.0 del proyecto original, con sus condiciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio + proyector al espacio del lenguaje (componentes de LFM3-Omni-2B); arquitectura interna del codificador no disponible |
| Parámetros totales | 115.278.144 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors con dtypes originales preservados) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License 1.0 (lfm-open-license-1.0), con condiciones de uso comercial |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del codificador de audio (tipo de transformer, capas, dimensión oculta ni estrategia de atención). Lo que sí se documenta es su función: procesa log-mel spectrograms de audio mono a 16 kHz, devuelve `input_features` y `feature_attention_mask` desde el extractor, y el codificador transforma esas features para que el proyector las mapee al espacio de tokens del modelo de lenguaje. La relación de compresión es fija: un token de salida por cada ocho frames mel.

No se han publicado en la información proporcionada datos sobre el volumen de entrenamiento, la composición del dataset de audio, ni sobre si hubo etapas de alineación (RLHF/DPO) específicas para la torre de audio. El autor indica que los tensores se copian sin modificar del checkpoint original de LFM3-Omni-2B, por lo que las capacidades del codificador son las del modelo base de Liquid AI. La validación incluida es un smoke test con señal sintética en CPU, y el propio autor advierte que no constituye un benchmark de calidad de voz, una prueba de equivalencia con el modelo completo ni una validación en GPU.

## Capacidades

- Extracción de características de audio: genera embeddings a partir de audio mono a 16 kHz mediante el codificador y el proyector incluidos.
- Interfaz de feature extraction: el extractor devuelve log-mel `input_features` junto con `feature_attention_mask` para gestionar longitudes variables.
- Compresión temporal predecible: un token de salida por cada ocho frames mel, útil para dimensionar secuencias.
- Integración con el ecosistema Transformers: requiere Transformers 5.21.1, accelerate, safetensors y NumPy.
- No incluye generación de texto, decodificación de audio, tool calling, razonamiento multi-paso ni capacidades de agente: esas funciones residen en el modelo de lenguaje y el decodificador que no forman parte de este paquete.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Extracción de embeddings de voz para búsqueda y recuperación: usar el codificador y el proyector para convertir clips de 16 kHz en vectores comparables, indexarlos en una base vectorial y habilitar búsqueda por similitud de audio.
- Clasificación de audio por transferencia: congelar el codificador y entrenar una cabeza ligera sobre los embeddings para tareas como detección de eventos sonoros o clasificación de habla frente a ruido.
- Preprocesado en pipelines ASR propios: emplear el front-end de audio como extractor de features estandarizado antes de conectar un modelo de lenguaje o un decodificador externo.
- Investigación sobre representaciones de audio: analizar la estructura de los embeddings del proyector y su alineación con el espacio del lenguaje de LFM3-Omni-2B sin cargar el modelo completo.
- Prototipado en CPU y entornos con poca memoria: al ocupar unos 0,2 GB, el paquete se puede cargar en máquinas modestas para pruebas de integración y smoke tests.
- Auditoría y reproducibilidad de checkpoints: verificar la procedencia de los tensores mediante `extraction.json`, `tensor_mapping.json` y `validation.json` en flujos de validación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta un smoke test con señal sintética ejecutado en CPU, que no mide calidad de transcripción, precisión de embeddings ni latencia en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 115,3 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,46 GB y en FP16 unos 0,23 GB, cantidades que encajan en cualquier GPU de consumo actual.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente para el codificador y el proyector aislados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o equivalente; el autor solo valida un smoke test en CPU.
- Opciones de despliegue: carga directa con PyTorch y Transformers 5.21.1 mediante `component.load_model(root)` y `component.load_feature_extractor(root)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/lfm3-omni-audio-encoder | 115,3 M | no disponible | Codificador de audio + proyector (extracción) | LFM Open License 1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Omni-2B | clase 2B (modelo completo) | no disponible | Modelo ómnibus texto, visión y audio | LFM Open License 1.0 | Hugging Face (modelo base) |
| LiquidAI LFM3-VL-2B | clase 2B | no disponible | Modelo visión-lenguaje | LFM Open License 1.0 | Hugging Face y LM Studio |

La comparación directa con codificadores de audio dedicados (por ejemplo, familias tipo Whisper encoder o CLAP) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Paquete incompleto: no incluye el modelo de lenguaje, el decodificador de salida ni LiquidCodec; no puede generar texto ni audio por sí mismo.
- Validación limitada: el único test documentado es un smoke test con señal sintética en CPU, sin verificación de equivalencia con el modelo completo ni pruebas en GPU.
- Formato de entrada restringido: audio mono a 16 kHz; no debe confundirse con el códec LiquidCodec de 24 kHz, que es un componente distinto.
- Dependencia de versiones: requiere Transformers 5.21.1 y código personalizado (`custom_code`), lo que puede complicar la integración en entornos con versiones distintas.
- Riesgo de deriva respecto al original: al ser una extracción comunitaria, cualquier actualización del modelo base de Liquid AI no se refleja automáticamente en este repositorio.
- Licencia: LFM Open License 1.0 con condiciones específicas de uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Sesgos y alucinaciones del pipeline completo: no evaluables en este paquete; dependerán de los componentes de lenguaje y decodificación ausentes.
- Idiomas soportados: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gatilin/lfm3-omni-audio-encoder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Códec de audio asociado: https://huggingface.co/gatilin/lfm3-omni-liquidcodec
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Página de LFM3 en LM Studio: https://lmstudio.ai/models/lfm3
