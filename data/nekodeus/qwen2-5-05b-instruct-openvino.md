# Nekodeus/qwen2-5-05b-instruct-openvino

## Resumen

Qwen2.5-0.5B-Instruct OpenVINO es una conversión al formato OpenVINO IR del modelo Qwen/Qwen2.5-0.5B-Instruct, publicada por el usuario Nekodeus. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada del modelo instructivo de 0,5 mil millones de parámetros de la familia Qwen2.5 de Alibaba, con cuantización de pesos a INT8 mediante NNCF y exportación con `optimum-cli`. El objetivo es facilitar la inferencia en CPU sin dependencia de GPU ni de PyTorch en tiempo de ejecución, usando el runtime de OpenVINO.

El modelo base es un transformer decoder-only (Qwen2ForCausalLM) de tipo denso, con 0,5B parámetros y una ventana de contexto de 32.768 tokens. Está ajustado por instrucciones, por lo que responde a prompts conversacionales y de tarea directa. Su relevancia práctica radica en el despliegue ligero: al estar en INT8 y en formato IR, puede ejecutarse en entornos con CPU exclusivamente, lo que lo hace útil para prototipos, pruebas de pipelines y despliegues en el borde con recursos limitados.

La ficha del autor indica que la conversión se realizó en un entorno Kaggle solo-CPU, totalmente offline, con `optimum-intel 2.2.0`, `openvino 2026.4.1` y `transformers 5.16.1`. El repositorio incluye tres partes IR: modelo, tokenizer y detokenizer. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), denso |
| Parametros totales | 0,5 mil millones (0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Pesos INT8 (NNCF); activaciones FP16/FP32 segun trazado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only denso con atención causal estándar, perteneciente a la familia Qwen2.5 de Alibaba. Esta conversión no aporta cambios arquitectónicos: mantiene la topología del modelo original y solo modifica el formato y la precisión de los pesos. La cuantización es weight-only a INT8 mediante NNCF (Neural Network Compression Framework), mientras que las activaciones se mantienen en FP16/FP32 según el trazado, lo que reduce el uso de memoria y acelera la inferencia en CPU sin requerir recalibración completa del grafo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada; esos datos corresponden a la model card original de Qwen, no incluida aquí. La innovación técnica de esta publicación es exclusivamente de despliegue: exportación a OpenVINO IR con `optimum-cli`, empaquetado del tokenizer y detokenizer como partes IR y fijación de versiones (`transformers==5.16.1`) para evitar incompatibilidades con `optimum-intel 2.2.0`.

## Capacidades

- Generación de texto instructivo y conversacional en formato chat.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código y explicaciones técnicas a pequeña escala.
- Aritmética y problemas matemáticos sencillos.
- Soporte de prompts multi-turno dentro de la ventana de contexto de 32.768 tokens.
- Ejecución en CPU mediante OpenVINO Runtime y OpenVINO GenAI.
- Integración con el ecosistema Hugging Face vía `optimum-intel` (`OVModelForCausalLM`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el modelo es solo texto.

## Casos de uso

- Prototipado rápido en CPU: usar `OVModelForCausalLM` para validar prompts y flujos conversacionales sin GPU, aprovechando el formato IR y la cuantización INT8 para reducir requisitos de memoria.
- Despliegue en el borde o en contenedores sin PyTorch: integrar el pipeline de OpenVINO GenAI (`ov::genai::LLMPipeline`) en aplicaciones C++ o servicios ligeros que solo dispongan de CPU.
- Asistentes de texto para documentación técnica: generar resúmenes y borradores de documentación con contexto de hasta 32.768 tokens, adecuado para fragmentos largos de documentación o código.
- Clasificación y extracción de información: usar el modelo como base para tareas de etiquetado, extracción de entidades o reescritura de textos en pipelines por lotes en CPU.
- Educación y demos interactivas: servir un chatbot instructivo en entornos de bajo coste (portátiles, mini-PC) para demostraciones o formación.
- Preprocesamiento en pipelines de datos: generar descripciones, normalizar texto o producir borradores que luego se validan con un modelo mayor, reduciendo coste computacional.
- Pruebas de integración de OpenVINO: validar la cadena `optimum-cli` → IR → runtime en CI, dado que el repositorio documenta el comando exacto de reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está pensado para CPU; en GPU, los pesos INT8 de 0,5B ocupan aproximadamente 0,5 GB, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; al ser un modelo de 0,5B, cualquier GPU con soporte OpenVINO o suficiente memoria (por ejemplo, GTX 1650 en adelante) podría ejecutarlo, aunque el formato IR está orientado a CPU.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con 2 GB o más de memoria es suficiente en la práctica.
- Memoria RAM estimada en CPU: del orden de 1-2 GB para pesos INT8 más el contexto; el consumo crece con la longitud de la ventana utilizada.
- Opciones de despliegue: OpenVINO Runtime, OpenVINO GenAI (`LLMPipeline`), `optimum-intel` (`OVModelForCausalLM`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/qwen2-5-05b-instruct-openvino | 0,5B | 32.768 | OpenVINO IR INT8 | Apache 2.0 | Conversión CPU-only del modelo Qwen2.5 |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | safetensors | Apache 2.0 | Modelo base original en PyTorch |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | safetensors | Apache 2.0 | Alternativa de mayor tamaño de la misma familia |
| Conversiones OpenVINO de Llama 3.2 1B | 1,2B | 128k (según variante) | OpenVINO IR | Llama 3.2 Community License | Alternativa ligera para CPU con licencia distinta |

La comparación de rendimiento en benchmarks no está disponible para esta conversión; los datos del modelo base pueden consultarse en la model card original de Qwen.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento y conocimiento limitada en comparación con modelos de mayor tamaño; propenso a errores en tareas complejas.
- Riesgo de alucinación inherente a los modelos de lenguaje de pequeño tamaño, especialmente en preguntas factuales.
- Idiomas soportados no documentados en esta ficha; el modelo base Qwen2.5 es multilingüe, pero no se confirma en esta conversión.
- La cuantización INT8 puede introducir degradación adicional respecto al modelo base en FP16/BF16, no cuantificada en la información disponible.
- El contexto de 32.768 tokens es el del modelo base; el consumo de memoria en CPU crece con la longitud efectiva del contexto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original y las dependencias (OpenVINO, NNCF, optimum-intel).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de pruebas independientes.
- Dependencia de versiones concretas (`transformers==5.16.1`, `optimum-intel 2.2.0`, `openvino 2026.4.1`): posibles incompatibilidades con otras versiones del ecosistema.
- No se documenta soporte para tool calling, agentes ni function calling en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nekodeus/qwen2-5-05b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación de optimum-intel: https://huggingface.co/docs/optimum-intel
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (cuantización): https://github.com/openvinotoolkit/nncf
