# ggml-org/gemma-4-12B-it-GGUF

## Resumen

ggml-org/gemma-4-12B-it-GGUF es la conversión oficial a formato GGUF del modelo instructivo Gemma 4 12B de Google, publicada por el equipo de ggml-org. Este modelo forma parte de la cuarta generación de la familia Gemma, diseñada para democratizar el acceso a modelos de lenguaje de alta calidad mediante pesos abiertos y licencia Apache 2.0. La versión GGUF está específicamente optimizada para su ejecución en hardware de consumo mediante motores de inferencia como llama.cpp y su aplicación de escritorio llama.app.

El modelo base es un transformer de 12 mil millones de parámetros (11.907.350.576 en concreto) con ajuste por instrucciones, pensado para tareas conversacionales y de generación de texto. La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de este tamaño en GPU de consumo con requisitos de VRAM reducidos, sin renunciar a la mayor parte de la calidad del modelo original. El repositorio incluye múltiples niveles de cuantización, incluyendo versiones QAT (quantization-aware training) proporcionadas por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_0, Q4_K_M, Q5_K_M, Q8_0 y variantes QAT Q4_0, entre otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con 12 mil millones de parametros, ajustado mediante instrucciones (instruction-tuned) por Google. El proceso de entrenamiento del modelo base incluye una fase de ajuste fino supervisado y un posterior refinamiento con tecnicas de aprendizaje por refuerzo a partir de preferencias humanas, siguiendo la metodologia estandar de la familia Gemma. La variante GGUF es una conversion post-entrenamiento realizada con el convertidor automatico de ggml-org, que preserva la arquitectura original del modelo base.

La familia Gemma 4 incorpora innovaciones en el procesamiento de ventanas de contexto largas, aunque los detalles concretos de longitud de contexto y composicion del dataset de entrenamiento no estan disponibles en la informacion proporcionada. El repositorio incluye modelos QAT (quantization-aware training) de cuantizacion Q4_0, que han sido entrenados especificamente para minimizar la perdida de calidad tras la cuantizacion.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones en formato chat.
- Razonamiento de varios pasos para tareas complejas de logica y analisis.
- Generacion de codigo y asistencia en programacion.
- Soporte de tool calling y function calling (funcionalidad heredada del modelo base).
- Capacidades multilingues (idiomas concretos no especificados en la informacion disponible).
- Ejecucion eficiente en CPU y GPU de consumo gracias a la cuantizacion GGUF.

## Casos de uso

- **Desarrollo de aplicaciones de chat locales**: el modelo puede ejecutarse en portatiles y equipos de escritorio con llama.cpp u Ollama, permitiendo construir asistentes conversacionales sin conexion ni dependencia de APIs externas.
- **Generacion de codigo asistida en entornos de desarrollo**: su capacidad de generacion de codigo permite usarlo como autocompletado en editores, con la ventaja de ejecutarse localmente y no enviar el codigo a servidores externos.
- **Procesamiento de documentos y resumen**: con una ventana de contexto suficiente, puede resumir documentos extensos, extraer informacion clave y responder preguntas sobre el contenido.
- **Asistentes de atencion al cliente**: desplegado como servicio interno en una empresa, puede gestionar conversaciones multi-turno con clientes sin depender de infraestructura cloud.
- **Educacion y aprendizaje**: como tutor virtual para explicar conceptos, resolver dudas y generar ejercicios personalizados, con despliegue en hardware de bajo coste.
- **Investigacion en NLP**: la disponibilidad de pesos en GGUF con varios niveles de cuantizacion permite estudiar el trade-off entre tamano, velocidad y calidad del modelo en distintos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de ggml-org no incluye tablas de evaluacion comparativa, y no se han encontrado datos de MMLU, HumanEval u otros benchmarks en la documentacion consultada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: dependiendo del nivel de cuantizacion, un modelo de 12B en Q4_K_M ocupa aproximadamente entre 7 y 8 GB de VRAM, mientras que Q8 ocupa alrededor de 12 GB.
- **GPUs recomendadas**: RTX 3060 de 12 GB o superiores pueden ejecutar cuantizaciones de Q4 o Q5; para Q8 o FP16 se recomienda una RTX 4090 (24 GB) o una A100 de 40/80 GB.
- **Ejecucion en CPU**: el modelo puede ejecutarse en CPU con cuantizaciones Q4/Q5, aunque la velocidad sera significativamente menor que en GPU.
- **Opciones de despliegue**: llama.cpp, Ollama, llama.app (servidor integrado), y motores compatibles con GGUF como LM Studio o text-generation-webui.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ggml-org/gemma-4-12B-it-GGUF | 12B | no disponible | Apache 2.0 | GGUF |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (permisiva) | GGUF / safetensors |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | GGUF / safetensors |
| Qwen 2.5 14B Instruct | 14B | 128K | Apache 2.0 | GGUF / safetensors |

El modelo de 12B ocupa una posicion intermedia entre los modelos de 7B y 14B, ofreciendo un equilibrio entre rendimiento y requisitos de hardware. No se dispone de datos comparativos de rendimiento especificos en la informacion consultada.

## Limitaciones y advertencias

- **Alucinaciones**: como todos los modelos de lenguaje, puede generar informacion falsa o inventada con alta confianza, especialmente en temas especializados o de actualidad.
- **Sesgos**: el modelo base puede heredar sesgos de los datos de entrenamiento, aunque no se han publicado evaluaciones especificas sobre este modelo.
- **Idiomas**: no se ha especificado la lista de idiomas soportados, por lo que el rendimiento en idiomas distintos del ingles no esta garantizado.
- **Contexto**: la longitud de contexto no se ha publicado; el rendimiento en ventanas de contexto largas es incierto.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero no se ha verificado que los datos de entrenamiento del modelo base no tengan restricciones adicionales.
- **Produccion**: al ser una conversion automatica, no se han publicado evaluaciones de seguridad o robustez especificas para esta version GGUF.

## Enlaces

- Hugging Face (repo GGUF): https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it
- Modelo assistant (Google): https://huggingface.co/google/gemma-4-12B-it-assistant
- Modelo QAT unquantized: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Modelo QAT assistant: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized-assistant
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia de Gemma 4 (gemma4.org): https://gemma4.org/
- Herramienta de conversion: https://github.com/ggml-org/convert
