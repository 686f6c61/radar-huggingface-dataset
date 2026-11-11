# Nekodeus/gemma-2-2b-it-openvino

## Resumen

Gemma-2-2b-it OpenVINO es una conversión del modelo instructivo `google/gemma-2-2b-it` al formato OpenVINO IR con cuantización de pesos INT8. Lo publica el usuario Nekodeus en Hugging Face y no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue optimizado para ejecución en CPU mediante el runtime de OpenVINO. La conversión se generó con `optimum-cli` y `optimum-intel 2.2.0` sobre una imagen de Kaggle sin GPU, partiendo del checkpoint original de Google.

El modelo base, Gemma 2 2B instruction-tuned, es un transformer decoder-only de aproximadamente 2.600 millones de parámetros con 8.192 tokens de contexto y el mecanismo de soft-capping de atención característico de la familia Gemma 2. La versión publicada mantiene la licencia Gemma original y conserva la tarea de generación de texto conversacional, pero sustituye los pesos en punto flotante por pesos INT8 (cuantización weight-only) junto con activaciones en FP16/FP32 según el trazado.

Su relevancia práctica es acotada pero concreta: ofrece una vía para ejecutar un modelo instructivo de 2B en entornos sin GPU (servidores CPU, portátiles, edge) con un consumo de disco de 2,7 GB y sin dependencia de CUDA. Al no haber descargas ni métricas publicadas, debe tratarse como un artefacto de conversión de uso experimental, no como un modelo validado en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma2ForCausalLM), con soft-capping de atención |
| Parametros totales | ~2,6 mil millones (2.6B según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | OpenVINO IR (3 partes: openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y el mecanismo de soft-capping en las puntuaciones de atención que limita su magnitud para estabilizar el entrenamiento y la inferencia. El checkpoint base fue entrenado por Google y posteriormente ajustado con instrucciones (instruction tuning) para tareas conversacionales; esta publicación no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La contribución técnica de esta ficha es exclusivamente la conversión: se aplicó cuantización weight-only INT8 mediante NNCF a través de `optimum-cli export openvino`, manteniendo el grafo en formato OpenVINO IR. La model card documenta un detalle relevante de reproducibilidad: se fijó `transformers==5.16.1` porque la imagen de Kaggle incluía la versión 5.20.2, que eliminó `VisionRotaryEmbedding`, importado por `optimum-intel 2.2.0`; además se sorteó el gate `MAX_TRANSFORMERS_VERSION` de optimum para los exportadores de Gemma. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto instructivo y conversacional, heredada del ajuste de `google/gemma-2-2b-it`.
- Razonamiento básico y respuesta a preguntas en formato multi-turno.
- Generación de código y tareas sencillas de matemáticas, dentro de las capacidades del modelo base de 2B.
- Ejecución en CPU mediante OpenVINO GenAI (`ov::genai::LLMPipeline`) y mediante `optimum-intel` (`OVModelForCausalLM`).
- Tokenizador y detokenizador empaquetados como artefactos OpenVINO independientes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Despliegue en servidores sin GPU: el modelo se ejecuta con OpenVINO en CPU, lo que permite servir un chatbot instructivo de 2B en máquinas sin CUDA, usando `LLMPipeline` con el dispositivo `CPU`.
- Prototipado local en portátiles: con 2,7 GB de repositorio y pesos INT8, cabe en equipos de consumo sin GPU dedicada, útil para pruebas de integración de pipelines de generación de texto.
- Preprocesado y clasificación de texto en pipelines batch: al ejecutarse en CPU, puede convivir con otras cargas en el mismo host y procesar lotes de prompts cortos con contexto de hasta 8.192 tokens.
- Asistentes conversacionales internos de bajo coste: para resúmenes, reformulación y respuestas a preguntas sobre documentación, donde la latencia en CPU es aceptable.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de INT8 frente al checkpoint original en FP16/BF16 sobre las mismas tareas.
- Entornos edge o air-gapped: la conversión se realizó completamente offline y el artefacto no requiere descargas adicionales de pesos, lo que facilita su despliegue en redes aisladas.
- Base para fine-tuning ligero o destilación sobre OpenVINO: punto de partida para experimentos de adaptación en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en caso de usar un backend GPU de OpenVINO, los pesos INT8 ocupan aproximadamente 2,6 GB, por lo que se necesitan al menos 3-4 GB de memoria para margen de activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada; el artefacto está orientado a CPU Intel.
- Compatibilidad con GPU de consumo: no documentada; el diseño apunta a ejecución en CPU, donde no se requiere VRAM.
- Opciones de despliegue: OpenVINO GenAI (`ov::genai::LLMPipeline`), `optimum-intel` (`OVModelForCausalLM`), OpenVINO Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es OpenVINO IR y no GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: 2,7 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/gemma-2-2b-it-openvino | ~2,6B | 8.192 | OpenVINO IR INT8 | Gemma | Conversión CPU-only, sin benchmarks publicados |
| google/gemma-2-2b-it | ~2,6B | 8.192 | safetensors (FP16/BF16) | Gemma | Checkpoint original de referencia |
| Versiones GGUF de Gemma 2 2B it | ~2,6B | 8.192 | GGUF (Q4, Q8, etc.) | Gemma | Ejecutables con llama.cpp/Ollama, no comparables en formato con OpenVINO IR |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar con contexto mayor y licencia permisiva |

La comparación de rendimiento frente a estos modelos no está disponible: no se han publicado métricas para esta conversión.

## Limitaciones y advertencias

- La cuantización INT8 weight-only puede degradar la calidad de generación respecto al checkpoint original en FP16/BF16; no se aportan evaluaciones que cuantifiquen esa pérdida.
- El modelo base de 2B tiene capacidad limitada de razonamiento complejo, matemáticas avanzadas y generación de código extenso; los errores y alucinaciones son esperables en tareas exigentes.
- No se declaran idiomas soportados; el comportamiento multilingüe no está verificado en esta conversión.
- La licencia Gemma impone condiciones de uso comercial y restricciones de redistribución definidas por Google; es imprescindible revisar sus términos antes de un despliegue en producción.
- El repositorio no registra descargas ni valoraciones, y la model card no incluye benchmarks, lo que impide avalar su calidad frente al checkpoint original.
- El artefacto depende de versiones concretas de `optimum-intel` (2.2.0), `openvino` (2026.4.1) y `transformers` (5.16.1); otras versiones pueden requerir ajustes.
- El formato OpenVINO IR limita la portabilidad: no es directamente utilizable con llama.cpp, Ollama o vLLM.
- No hay información sobre sesgos específicos, filtros de seguridad ni comportamiento ante prompts adversarios en esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/gemma-2-2b-it-openvino
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Documentación de optimum-intel: https://huggingface.co/docs/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO Toolkit: https://github.com/openvinotoolkit/openvino
- Licencia Gemma: https://ai.google.dev/gemma/terms
