# nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16

## Resumen

NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning es un modelo multimodal de tipo *any-to-any* desarrollado por NVIDIA, diseñado para unificar la comprensión de vídeo, audio, imagen y texto en un único sistema. Forma parte de la familia Nemotron Nano y se orienta a casos de uso empresariales como la inteligencia documental, el análisis de reuniones grabadas, la transcripción de voz y la automatización de interfaces gráficas (GUI). Su arquitectura combina un backbone híbrido Mamba2-Transformer con mezcla de expertos (MoE) de aproximadamente 31B parámetros totales y unos 3B activos por token, junto con codificadores de visión (CRADIO v4-H) y de audio (Parakeet).

El modelo destaca por su ventana de contexto de hasta 256k tokens, lo que permite procesar vídeos de hasta dos minutos, audio de hasta una hora y documentos extensos en una sola pasada. Incluye un modo de razonamiento activado por defecto (con *chain-of-thought*), soporte para *tool calling*, salida JSON y marcas de tiempo a nivel de palabra en transcripciones. Está disponible en tres precisiones (BF16, FP8 y NVFP4) y se distribuye bajo la NVIDIA Open Model Agreement, que permite uso comercial. Su relevancia actual reside en la demanda de modelos multimodales capaces de manejar flujos de trabajo agénticos y análisis de contenido enriquecido sin depender de múltiples sistemas especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer hybrid MoE con codificadores CRADIO v4-H (visión) y Parakeet (audio) |
| Parametros totales | 33.015.632.214 (33B) según safetensors; 31B según model card |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | BF16 (62 GB), FP8 (33 GB), NVFP4 (21 GB) |
| Idiomas soportados | Inglés únicamente |
| Licencia | NVIDIA Open Model Agreement (uso comercial permitido) |
| Formato de pesos | safetensors (BF16, FP8, NVFP4) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje híbrido Mamba2-Transformer con arquitectura de mezcla de expertos (MoE). El componente Mamba2 aporta eficiencia en el procesamiento de secuencias largas gracias a su mecanismo de estado, mientras que el Transformer mantiene la capacidad de atención sobre contextos extensos. Los parámetros activos por token son aproximadamente 3B, lo que permite un rendimiento de inferencia relativamente alto para su tamaño total. Para la entrada multimodal, se integran dos codificadores externos: CRADIO v4-H para imágenes y fotogramas de vídeo, y Parakeet para audio. La salida es exclusivamente texto.

Según la model card, el modelo fue mejorado utilizando otros modelos de referencia durante el entrenamiento, incluyendo Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b, lo que sugiere un proceso de destilación o *distillation* sobre estos sistemas. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La arquitectura soporta un modo de razonamiento (*thinking mode*) activado por defecto, con un presupuesto de razonamiento de hasta 16.384 tokens y un período de gracia de 1.024 tokens, además de un modo instructivo con temperatura más baja (0.2) y *top_k* = 1.

## Capacidades

- Comprensión multimodal de vídeo, audio, imagen y texto, con salida de texto.
- Razonamiento con *chain-of-thought* activado por defecto (configurable mediante `enable_thinking`).
- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos.
- Transcripción de audio con marcas de tiempo a nivel de palabra (ASR).
- Análisis de vídeo: captions densos, búsqueda y resumen de contenido audiovisual.
- Soporte de *tool calling* y generación de salida en formato JSON.
- Capacidad para automatización de interfaces gráficas (GUI) en flujos agénticos.
- Procesamiento de documentos extensos gracias a la ventana de contexto de 256k tokens.
- Multilingüismo limitado: solo inglés (aunque puede procesar contenido en otros idiomas, la salida está optimizada para inglés).

## Casos de uso

- Atención al cliente automatizada: el modelo puede verificar entregas analizando vídeos de *drop-off* mediante OCR (por ejemplo, confirmar que un paquete se dejó en la dirección correcta) o validar pedidos en *drive-thru* procesando audio y vídeo en tiempo real.
- Inteligencia documental para asistentes de IA: contratos, acuerdos SOW/MSA, informes financieros y documentos de investigación pueden ser analizados y resumidos en una sola pasada gracias a la ventana de 256k tokens.
- Análisis de reuniones grabadas: transcripción con marcas de tiempo, extracción de decisiones y resumen ejecutivo a partir de vídeos de reuniones, con soporte para audio de hasta una hora.
- Automatización de agentes GUI: el modelo puede interpretar capturas de pantalla y ejecutar acciones en navegadores o aplicaciones, facilitando flujos de gestión de incidencias, búsqueda agéntica o agentes de correo electrónico.
- Verificación de cumplimiento en media y entretenimiento: análisis de contenido audiovisual para generar captions densos, búsqueda de escenas específicas y resúmenes de metraje.
- Transcripción de audio a texto en producción: con marcas de tiempo a nivel de palabra, útil para subtitulado, *closed captioning* o generación de actas.
- Asistentes de voz multimodales: combinación de entrada de audio y vídeo para responder preguntas sobre demostraciones de producto o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas de rendimiento en tareas como MMLU, HumanEval o GSM8K, ni métricas específicas de tareas multimodales. Se recomienda consultar futuras actualizaciones del repositorio o el paper asociado (arxiv:2604.24954) para obtener datos cuantitativos.

## Requisitos de hardware

- Inferencia en BF16: mínimo 1× H100 80GB (single-GPU); recomendado 1× B200 o 1× H200. Peso del modelo: 62 GB.
- Inferencia en FP8: mínimo 1× L40S 48GB; recomendado 1× RTX Pro 6000 o 1× B200. Peso del modelo: 33 GB.
- Inferencia en NVFP4: mínimo 1× RTX 5090 32GB; también soportado en DGX Spark y Jetson Thor. Peso del modelo: 21 GB.
- El modelo no cabe en GPUs de consumo de gama media (por ejemplo, RTX 4090 24GB) en BF16, pero sí en FP8 o NVFP4 con GPUs de 32GB o más.
- Opciones de despliegue: la model card menciona contenedores NIM en NGC y soporte en la librería `transformers`. No se detallan integraciones específicas con vLLM, llama.cpp u Ollama, aunque al ser un modelo con pesos en safetensors y arquitectura estándar, es probable que sea compatible con estos frameworks (no confirmado en la documentación).
- Latencia y throughput: no disponibles. Dependen del hardware, la precisión y el número de tokens de entrada/salida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se presenta una comparación estructural basada en características públicas de modelos multimodales MoE de tamaño similar (datos de conocimiento general, no extraídos de la model card):

| Modelo | Parámetros totales | Parámetros activos | Contexto | Entrada | Salida | Licencia |
|---|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B | 31B (33B según safetensors) | ~3B | 256k | Vídeo, audio, imagen, texto | Texto | NVIDIA Open Model Agreement |
| Qwen3-VL-30B-A3B-Instruct | 30B | ~3B | 128k (aprox.) | Imagen, vídeo, texto | Texto | Apache 2.0 (aprox.) |
| Qwen2.5-VL-72B-Instruct | 72B | 72B (denso) | 128k | Imagen, vídeo, texto | Texto | Apache 2.0 (aprox.) |

Nota: los datos de Qwen3-VL y Qwen2.5-VL son aproximados y pueden variar. El Nemotron-3-Nano-Omni se distingue por su soporte nativo de audio y su mayor ventana de contexto, además de su modo de razonamiento integrado.

## Limitaciones y advertencias

- Idioma: el modelo está optimizado para inglés; su rendimiento en otros idiomas puede ser significativamente inferior.
- Entrada de vídeo limitada a 2 minutos (a 1 FPS / 128 fotogramas para 1080p) y audio a 1 hora; no admite flujos continuos ilimitados.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- La licencia NVIDIA Open Model Agreement impone términos específicos que deben revisarse antes de uso comercial; no es una licencia de código abierto convencional.
- El modo de razonamiento está activado por defecto, lo que puede incrementar la latencia y el consumo de tokens; debe desactivarse explícitamente para aplicaciones de baja latencia.
- No se han publicado resultados de benchmarks, por lo que la comparación objetiva con alternativas es limitada.
- El tamaño del modelo (62 GB en BF16) requiere hardware de gama alta para inferencia local; las cuantizaciones FP8 y NVFP4 reducen el requisito pero pueden afectar la precisión.

## Enlaces

- [HuggingFace - BF16](https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16)
- [HuggingFace - FP8](https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8)
- [HuggingFace - NVFP4](https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4)
- [Build.Nvidia.com - demo](https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning)
- [NGC - contenedor NIM](https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/nemotron-3-nano-omni-30b-a3b-reasoning)
- [Paper (arxiv:2604.24954)](https://arxiv.org/abs/2604.24954)
- [NVIDIA Open Model Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/)
