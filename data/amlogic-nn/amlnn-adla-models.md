# Amlogic-NN/amlnn-adla-models

## Resumen

Amlogic-NN/amlnn-adla-models es un repositorio de pesos de inferencia en formato ADLA publicado por Amlogic-NN para su ejecución en chips Amlogic. No se trata de un modelo único, sino de un zoo de modelos convertidos y empaquetados para el runtime propietario `amlllm-openai-server`, que actúa como servidor compatible con la API de OpenAI. El repositorio está etiquetado con el modelo base Qwen/Qwen3-1.7B, pero su contenido abarca una familia heterogénea de LLM, VLM y modelos ASR.

La relevancia de este repositorio es fundamentalmente de despliegue en el borde: ofrece artefactos cuantizados (Q4AM_PB32 en pesos principales, Q4A_PB32 en proyectores multimodales y W4A16/W8A16 en ASR) listos para ejecutarse en hardware Amlogic, con tamaños que van desde los 246 MiB del modelo de reconocimiento de voz SenseVoice hasta los 3,28 GiB del VLM Qwen3-VL-4B-Instruct. Los pesos no son cargables por frameworks genéricos como transformers o llama.cpp.

El repositorio tiene un tamaño total de 43,2 GB y licencia Apache 2.0, si bien las licencias y condiciones de uso de los modelos originales (Qwen, InternVL, OpenAI Whisper) permanecen con sus publicadores. La ventana de contexto recomendada es de 8192 tokens en todos los modelos de texto y multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelos base Qwen2.5, Qwen3, InternVL2/3, Qwen2-VL, Qwen2.5-VL, Qwen3-VL, SenseVoice, Whisper); formato de artefacto ADLA propietario de Amlogic |
| Parametros totales | Variable por modelo del zoo: 0,6B a 4B en LLM; 1B a 4B en VLM; ASR no disponible |
| Parametros activos | No aplica (no hay modelos MoE en el zoo) |
| Longitud de contexto | 8192 tokens (recomendado en todos los LLM y VLM) |
| Tipos de cuantizacion | Q4AM_PB32 (pesos principales LLM/VLM), Q4A_PB32 (proyectores mmproj), W4A16 y W8A16 (ASR) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; depende de cada modelo base) |
| Licencia | Apache 2.0 (repositorio); licencias upstream de cada modelo base se mantienen con sus publicadores |
| Formato de pesos | `.adla` (artefactos de build ADLA de Amlogic); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: distribuye artefactos de compilación ADLA generados a partir de modelos preentrenados de terceros. Los LLM incluidos pertenecen a las familias Qwen2.5 (1.5B y 3B Instruct), Qwen3 (0.6B, 1.7B, 4B y 4B-Instruct-2507). Los VLM cubren InternVL2-1B, InternVL3-1B-Instruct, Qwen2-VL-2B-Instruct, Qwen2.5-VL-3B-Instruct, Qwen3-VL-2B-Instruct y Qwen3-VL-4B-Instruct. Los modelos ASR son SenseVoice Small y Whisper Large v3 Turbo. La model card indica que la familia Qwen3 sin sufijo `Instruct` emplea razonamiento híbrido (modo thinking por defecto), mientras que `Instruct-2507` es la variante sin thinking.

La innovación técnica relevante no está en el entrenamiento, sino en el pipeline de despliegue: cada modelo se empaqueta con un `model.json` que describe su configuración y, en el caso de los VLM, con un proyector `mmproj` separado que debe residir en el mismo directorio. Los ASR incluyen ficheros auxiliares propios (`tokens.txt` en SenseVoice; `data_bin/` con `data.bin` y `tokenizer_info.bin` en Whisper). El runtime de destino es `amlllm-openai-server`, que expone los modelos mediante una API compatible con OpenAI y gestiona la descarga y habilitación de modelos vía `bootstrap`. No se dispone de información sobre datasets de entrenamiento, número de tokens, composición de datos ni procesos de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en los LLM Qwen2.5 y Qwen3, con modo thinking integrado en las variantes Qwen3 sin sufijo `Instruct`.
- Function calling / tool calling en todos los LLM del zoo y en los VLM Qwen2-VL, Qwen2.5-VL y Qwen3-VL.
- Comprensión multimodal de imágenes en los VLM, mediante proyector `mmproj` que acompaña a los pesos principales.
- Reconocimiento de voz (ASR) con SenseVoice Small y Whisper Large v3 Turbo, incluyendo este último codificador y decodificador separados.
- Razonamiento multi-paso y uso como agente en los modelos con soporte de herramientas, sujeto a la ventana de 8192 tokens.
- Capacidades multilingües: no declaradas explícitamente en el repositorio; dependen del modelo base subyacente.
- Servicio mediante API compatible con OpenAI a través de `amlllm-openai-server`.

## Casos de uso

- Asistente conversacional en dispositivos de borde: desplegar Qwen3-1.7B o Qwen3-4B-Instruct-2507 (1,28 GiB y 2,49 GiB respectivamente) en un chip Amlogic para atención al cliente local sin dependencia de la nube, con contexto de 8192 tokens para conversaciones multi-turno.
- Automatización de tareas con function calling: usar Qwen3-4B-Instruct-2507 en modo no thinking para invocar herramientas de domótica o control de dispositivos desde el propio hardware, reduciendo latencia al evitar la fase de razonamiento extendido.
- Descripción y análisis de imágenes en el borde: Qwen3-VL-2B-Instruct (1,82 GiB con mmproj) permite clasificar o describir imágenes capturadas por cámaras conectadas al dispositivo, sin enviar datos a servidores externos.
- Reconocimiento de voz local: Whisper Large v3 Turbo (1,81 GiB) o SenseVoice Small (246 MiB) para transcripción de audio en tiempo real en dispositivos Amlogic, con el modelo pequeño como opción de bajo consumo.
- Procesamiento de documentos con OCR y VQA: Qwen2.5-VL-3B-Instruct (2,89 GiB) o InternVL3-1B-Instruct (656 MiB) para extraer información de facturas, formularios o capturas en un dispositivo empotrado.
- Razonamiento ligero en modo thinking: Qwen3-0.6B (550 MiB) o Qwen3-1.7B para tareas de razonamiento paso a paso en hardware con memoria muy limitada, sacrificando capacidad por huella reducida.
- Prototipado de pipelines multimodales y de voz sobre la API OpenAI: levantar `amlllm-openai-server` con varios modelos habilitados y usar clientes compatibles con OpenAI para orquestar LLM, VLM y ASR en un mismo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware de destino: chips Amlogic con soporte ADLA; los pesos no pueden ejecutarse en GPU convencionales mediante transformers, llama.cpp u otros frameworks genéricos.
- Huella de almacenamiento y memoria por modelo (según tamaños declarados en la model card):
  - LLM: Qwen3-0.6B, 550 MiB; Qwen2.5-1.5B-Instruct, 1012 MiB; Qwen3-1.7B, 1,28 GiB; Qwen2.5-3B-Instruct, 1,90 GiB; Qwen3-4B y Qwen3-4B-Instruct-2507, 2,49 GiB.
  - VLM: InternVL2-1B e InternVL3-1B-Instruct, 656 MiB; Qwen2-VL-2B-Instruct, 1,71 GiB; Qwen3-VL-2B-Instruct, 1,82 GiB; Qwen2.5-VL-3B-Instruct, 2,89 GiB; Qwen3-VL-4B-Instruct, 3,28 GiB.
  - ASR: SenseVoice Small, 246 MiB; Whisper Large v3 Turbo, 1,81 GiB.
- VRAM estimada: no disponible; la ejecución es sobre memoria del SoC Amlogic, no sobre VRAM de GPU.
- GPU recomendadas: no aplica; el runtime es específico de Amlogic.
- Compatibilidad con GPU de consumo: no; los artefactos `.adla` no son cargables por frameworks genéricos.
- Opciones de despliegue: `amlllm-openai-server` (repositorio `Amlogic-NN/amlogic-llm-server`), con descarga vía `bootstrap list` y `bootstrap download`; vLLM, llama.cpp, Ollama y TGI no son compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Amlogic-NN/amlnn-adla-models (Qwen3-1.7B ADLA) | 1,7B | 8192 | `.adla` (Q4AM_PB32) | Apache 2.0 (upstream Qwen) | Solo Amlogic vía amlllm-openai-server |
| Qwen/Qwen3-1.7B (original) | 1,7B | No disponible en la información | safetensors | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama |
| Qwen/Qwen3-4B-Instruct-2507 (original) | 4B | No disponible en la información | safetensors | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama |
| InternVL3-1B-Instruct (original) | 1B | No disponible en la información | safetensors | No disponible en la información | transformers y frameworks multimodales |

La diferencia principal frente a los modelos originales es el formato propietario y la orientación a hardware Amlogic: los artefactos ADLA ofrecen cuantización Q4AM_PB32 y un runtime compatible con OpenAI, pero pierden portabilidad y no pueden ejecutarse en GPU estándar.

## Limitaciones y advertencias

- Los pesos `.adla` no son cargables por transformers, llama.cpp ni otros frameworks genéricos; requieren hardware Amlogic y el runtime `amlllm-openai-server`.
- Ventana de contexto limitada a 8192 tokens en todos los modelos del zoo, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no declarados en el repositorio; la cobertura lingüística depende de cada modelo base y no está verificada para el artefacto ADLA.
- Riesgo de alucinación inherente a los modelos base de 0,6B a 4B, especialmente en tareas de razonamiento complejo o generación factual.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los de los modelos base Qwen, InternVL y Whisper.
- Licencia Apache 2.0 para el repositorio, pero las condiciones upstream de Qwen, InternVL y OpenAI Whisper se mantienen con sus publicadores; conviene revisarlas antes de uso comercial.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere una adopción muy limitada y poca validación comunitaria.
- No se han publicado benchmarks ni métricas de latencia o throughput para los artefactos ADLA.
- La fecha de creación (2026-01-30) y actualización (2026-11-05) del repositorio deben verificarse contra el estado real del proyecto antes de integrarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Amlogic-NN/amlnn-adla-models
- Runtime amlllm-openai-server: https://github.com/Amlogic-NN/amlogic-llm-server
- Modelo base etiquetado: https://huggingface.co/Qwen/Qwen3-1.7B
