# Nekodeus/llama-3.2-3b-instruct-openvino

## Resumen

Llama-3.2-3B-Instruct OpenVINO es una conversión al formato OpenVINO IR del modelo meta-llama/Llama-3.2-3B-Instruct, publicada por el usuario Nekodeus en Hugging Face. Se trata de una cuantización weight-only a INT8 de los pesos del modelo original, generada con `optimum-cli` y las librerías optimum-intel 2.2.0 y OpenVINO 2026.4.1, con el objetivo de facilitar la inferencia en CPU sin necesidad de GPU dedicada.

El modelo base es un transformer decoder-only de tipo LlamaForCausalLM con 3.200 millones de parámetros, ajustado por instrucciones (instruction-tuned) e incluye la plantilla de chat de Llama 3.2. La conversión mantiene la ventana de contexto de 128.000 tokens del modelo original y se distribuye en tres componentes IR: modelo, tokenizador y detokenizador. El repositorio ocupa 3,2 GB.

Su relevancia radica en que permite desplegar un modelo de 3B en hardware de consumo o servidores sin GPU mediante el runtime de OpenVINO, lo que resulta útil para prototipado, entornos edge y aplicaciones de CPU-only. No obstante, al ser una conversión de un tercero y no un modelo entrenado desde cero, sus capacidades y limitaciones son las del modelo base de Meta, y la información publicada por el autor es escasa (sin datos de benchmarks ni de idiomas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parametros totales | 3.2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | Pesos INT8 (weight-only, NNCF); activaciones FP16/FP32 según trazado |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | OpenVINO IR (openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base meta-llama/Llama-3.2-3B-Instruct: un transformer decoder-only con atención causal estándar, ajustado por instrucciones por Meta. No se trata de un modelo entrenado por el autor de esta conversión; el autor solo ha realizado la exportación a OpenVINO IR con cuantización INT8 de los pesos mediante NNCF y `optimum-cli`, partiendo de los pesos del modelo original obtenidos desde el mirror público ModelScope (LLM-Research/Llama-3.2-3B-Instruct).

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO, más allá de lo que pueda figurar en la model card del modelo original de Meta (no incluida en la información proporcionada). La innovación técnica de esta publicación es la conversión a OpenVINO IR con cuantización weight-only INT8, que reduce el tamaño del repositorio a 3,2 GB y permite ejecución en CPU. La conversión se realizó en un entorno Kaggle CPU-only, con `transformers` fijado a la versión 5.16.1 y un bypass del gate `MAX_TRANSFORMERS_VERSION` de optimum, detalles que el autor documenta como notas de reproducción.

## Capacidades

- Generación de texto conversacional e instruccional, heredadas del ajuste por instrucciones del modelo base.
- Razonamiento y respuesta a preguntas en formato chat mediante la plantilla de chat incluida.
- Generación de código y tareas de matemáticas básicas, según las capacidades del modelo base Llama 3.2 3B Instruct.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible para esta conversión.
- Capacidades multilingües: no disponibles (el autor no documenta idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Despliegue en servidores sin GPU: al estar en formato OpenVINO IR con pesos INT8, el modelo puede ejecutarse en CPU mediante OpenVINO GenAI u optimum-intel, lo que lo hace adecuado para entornos donde no hay acelerador dedicado.
- Prototipado rápido de asistentes conversacionales: la plantilla de chat incluida y la API de `OVModelForCausalLM` permiten montar un chatbot de instrucciones en pocas líneas de Python.
- Inferencia en dispositivos edge o industriales: el runtime de OpenVINO está optimizado para CPUs Intel, lo que encaja en equipos embebidos o estaciones de trabajo sin GPU.
- Aplicaciones de generación de texto con contexto largo: la ventana de 128k tokens permite procesar documentos extensos o conversaciones multi-turno largas, siempre que la memoria disponible lo permita.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de INT8 weight-only frente al modelo original en FP16/FP32 en tareas de generación.
- Integración en pipelines de CI/CD para pruebas de humo: al ser un artefacto autocontenido de 3,2 GB, puede descargarse y ejecutarse en runners de CPU para validar flujos de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma directa, ya que el modelo está pensado para CPU; el repositorio ocupa 3,2 GB en disco con pesos INT8.
- GPU recomendadas: no disponibles en la información proporcionada; el autor documenta la conversión en CPU-only y el uso con OpenVINO GenAI en "CPU".
- ¿Cabe en consumer GPU?: no confirmado; el formato OpenVINO IR está orientado a CPU, aunque OpenVINO también soporta GPU Intel.
- Opciones de despliegue: optimum-intel (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), y el flujo de exportación con `optimum-cli export openvino`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/llama-3.2-3b-instruct-openvino | 3.2B | 128k | OpenVINO IR INT8 | Llama 3.2 Community License | Conversión de terceros, orientada a CPU |
| meta-llama/Llama-3.2-3B-Instruct | 3.2B | 128k | safetensors (FP16/BF16) | Llama 3.2 Community License | Modelo original de Meta, referencia oficial |
| Otras conversiones OpenVINO de Llama 3.2 3B | 3.2B | 128k | OpenVINO IR | Llama 3.2 Community License | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión de un tercero (Nekodeus), no una publicación oficial de Meta; la calidad de la cuantización INT8 no está validada con benchmarks publicados.
- Sin datos de benchmarks ni de evaluación de degradación por cuantización: no se puede confirmar la pérdida de calidad frente al modelo original.
- Idiomas soportados no documentados en la model card; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación inherente al modelo base Llama 3.2 3B Instruct, agravado potencialmente por la cuantización INT8.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de producción.
- El modelo está empaquetado para OpenVINO; no es directamente compatible con vLLM, llama.cpp u Ollama sin reconversión.
- La conversión se realizó con versiones concretas de `transformers` y optimum-intel, con un bypass documentado de un gate de versión; la reproducibilidad depende de esas versiones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Nekodeus/llama-3.2-3b-instruct-openvino
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Mirror ModelScope utilizado: LLM-Research/Llama-3.2-3B-Instruct (no se dispone de URL exacta en la información proporcionada)
- optimum-intel: no disponible en la información proporcionada
- OpenVINO: no disponible en la información proporcionada
