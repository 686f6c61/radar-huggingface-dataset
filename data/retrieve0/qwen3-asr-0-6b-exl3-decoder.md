# Retrieve0/Qwen3-ASR-0.6B-EXL3-Decoder

## Resumen

Retrieve0/Qwen3-ASR-0.6B-EXL3-Decoder es una conversión a formato EXL3 (ExLlamaV3) de los pesos del decodificador de texto del modelo Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. No se trata de un modelo autónomo, sino de un componente cuantizado del pipeline de reconocimiento automático de voz (ASR) Qwen3-ASR, que debe combinarse con un encoder TensorRT compatible y ejecutarse a través del runtime del proyecto Qwen3-ASR-TensorRT.

El modelo base, Qwen3-ASR-0.6B, pertenece a la familia Qwen3-ASR junto con la variante de 1.7B, y está diseñado para identificación de idioma y transcripción en 52 idiomas y dialectos, apoyándose en datos de entrenamiento de voz a gran escala y en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. Esta conversión concreta ofrece dos variantes de cuantización (3 y 4 bits por peso) para reducir el consumo de memoria del decodificador en GPU.

La relevancia de esta ficha radica en que permite ejecutar la parte lingüística del ASR con menor huella de VRAM en GPUs NVIDIA, manteniendo la licencia Apache-2.0 del modelo original. Es un artefacto orientado a despliegue práctico más que a investigación, y su utilidad depende completamente de la integración con el encoder y el runtime citados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de texto de Qwen3-ASR (transformer, componente del pipeline ASR); arquitectura exacta no disponible |
| Parámetros totales | 0.6B (según denominación del modelo base) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 a 3 bpw y 4 bpw |
| Idiomas soportados | 52 idiomas y dialectos (según el modelo base Qwen3-ASR); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del decodificador más allá de que forma parte del modelo Qwen3-ASR-0.6B, construido sobre la base de Qwen3-Omni y entrenado con datos de voz a gran escala para tareas de identificación de idioma y transcripción. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de este repositorio es la cuantización EXL3 del decodificador, que reduce el peso de los pesos a 3 o 4 bits por parámetro para disminuir el uso de VRAM. El pipeline completo separa el encoder (convertido a TensorRT, distribuido en un repositorio aparte) del decodificador (estos pesos EXL3), y ambos se integran mediante el runtime del proyecto Qwen3-ASR-TensorRT. El repositorio incluye `model.safetensors`, ficheros de tokenizer, configuración de modelo y generación, y configuración de cuantización.

## Capacidades

- Reconocimiento automático de voz (transcripción) como parte del pipeline Qwen3-ASR, en combinación con el encoder TensorRT correspondiente.
- Identificación de idioma, según las capacidades declaradas del modelo base Qwen3-ASR.
- Cobertura de 52 idiomas y dialectos según la documentación del modelo base.
- Ejecución con selección de idioma explícita mediante el parámetro `--language` del runtime.
- Cuantización seleccionable entre 3 bpw (menor memoria) y 4 bpw (mayor precisión).
- Soporte de tool calling, agentes, visión o audio directo: no disponible en la información proporcionada para este componente.

## Casos de uso

- Transcripción de audio en local con GPU NVIDIA: el decodificador EXL3 se carga junto al encoder TensorRT para transcribir ficheros WAV mediante el comando `qwen3-asr --backend tensorrt-exllama`, reduciendo la VRAM necesaria frente a los pesos sin cuantizar.
- Despliegue en estaciones de trabajo con VRAM limitada: la variante de 3 bpw permite ejecutar el decodificador con menor huella de memoria, adecuada para equipos que no pueden alojar la versión de 4 bpw.
- Subtitulado y generación de actas: integrado en el runtime, permite transcribir reuniones o material audiovisual especificando el idioma con `--language` para mejorar la precisión.
- Procesamiento por lotes de archivos de audio: el pipeline encoder/decoder puede invocarse desde scripts para transcribir colecciones de ficheros de forma automatizada.
- Prototipado en Windows: el proyecto declara soporte probado en Windows, lo que facilita entornos de desarrollo en estaciones con GPU consumer o profesional.
- Evaluación de cuantización: comparar la calidad de transcripción entre 3 bpw y 4 bpw para decidir el equilibrio entre memoria y precisión en un despliegue concreto.
- Integración en aplicaciones de dictado o asistentes de voz: el decodificador cuantizado puede formar parte de un servicio de transcripción siempre que se acompañe del encoder y el runtime compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión EXL3. La documentación del modelo base Qwen3-ASR menciona experimentos comparativos, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA; el proyecto no contempla ejecución en CPU ni en hardware no NVIDIA.
- ExLlamaV3 1.6.6 con versiones compatibles de PyTorch y CUDA; entorno de referencia: PyTorch 2.10.0, CUDA 12.8, Python 3.10–3.13.
- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio es de 1.3 GB, lo que da una referencia del peso de los pesos cuantizados, pero la VRAM total depende también del encoder TensorRT y del runtime.
- Encoder TensorRT compatible (repositorio Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder) necesario para completar el pipeline.
- Despliegue mediante el runtime Qwen3-ASR-TensorRT con backend `tensorrt-exllama`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Compatibilidad con GPU consumer: no confirmada en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Retrieve0/Qwen3-ASR-0.6B-EXL3-Decoder | 0.6B | No disponible | EXL3 3/4 bpw | Apache-2.0 | safetensors EXL3 |
| Qwen/Qwen3-ASR-0.6B-hf (modelo base) | 0.6B | No disponible | Pesos originales | Apache-2.0 | safetensors |
| Qwen3-ASR-1.7B | 1.7B | No disponible | No disponible | No disponible en la información | No disponible |

La comparación se limita a la familia Qwen3-ASR; no se dispone de datos de rendimiento ni de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el encoder TensorRT compatible y el runtime Qwen3-ASR-TensorRT para funcionar; por sí solo no transcribe audio.
- Dependencia estricta de versiones: ExLlamaV3 1.6.6, PyTorch 2.10.0 y CUDA 12.8 como referencia; incompatibilidades de versión pueden impedir la carga.
- Solo GPU NVIDIA con CUDA; sin soporte documentado para CPU, AMD u otros aceleradores.
- Windows está probado; Linux se declara compatible pero no verificado de forma explícita.
- La cuantización a 3 bpw puede degradar la precisión de transcripción frente a 4 bpw o a los pesos originales; no se aportan métricas de la degradación.
- Sesgos y riesgo de alucinación: no documentados para este componente; el modelo base puede heredar sesgos de sus datos de entrenamiento de voz.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Qwen y cumplir las licencias de ExLlamaV3 y del runtime.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La lista concreta de los 52 idiomas y dialectos no está disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-EXL3-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Encoder TensorRT compatible: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder
- Repositorio del runtime Qwen3-ASR-TensorRT: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Repositorio oficial Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Modelo Qwen3-ASR-0.6B (referencia de la familia): https://huggingface.co/Qwen/Qwen3-ASR-0.6B
