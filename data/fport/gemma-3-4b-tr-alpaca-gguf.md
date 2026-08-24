# fport/gemma-3-4b-tr-alpaca-GGUF

## Resumen

El modelo `fport/gemma-3-4b-tr-alpaca-GGUF` es una conversión a formato GGUF de un fine-tune del modelo `google/gemma-3-4b-it` realizado con el dataset Alpaca y optimizado con la librería Unsloth. El resultado es un modelo de lenguaje multimodal (visión y texto) de aproximadamente 3,88 mil millones de parámetros, diseñado para su ejecución eficiente en entornos con recursos limitados mediante herramientas como `llama.cpp` o `llama-mtmd-cli`.

La relevancia de este modelo radica en su naturaleza multimodal y su cuantización Q4_K_M, que reduce el peso del archivo a unos 3,3 GB, permitiendo su uso en GPU de consumo o incluso en CPU. Aunque el repositorio no ofrece detalles sobre el entrenamiento, la licencia o los idiomas, se trata de un ejemplo de adaptación de un modelo de Google a un formato ligero y portable, orientado a desarrolladores que buscan desplegar asistentes conversacionales con soporte de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no aplica (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos `.gguf`) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo, más allá de que está basado en `google/gemma-3-4b-it` (versión instruct de Gemma 3 4B). El proceso de conversión se realizó con Unsloth, una librería optimizada para fine-tuning y cuantización. La model card indica que el modelo fue fine-tuneado con el dataset Alpaca y posteriormente convertido a GGUF, con un ajuste del token de inicio (BOS) para garantizar compatibilidad con `llama.cpp`.

No se especifican datos sobre el número de tokens de entrenamiento, el tipo de ajuste (RLHF, DPO, etc.) ni la composición del dataset. La información disponible se limita a la existencia de dos archivos: `gemma-3-4b-it.Q4_K_M.gguf` para el modelo principal y `gemma-3-4b-it.F16-mmproj.gguf` para el proyector multimodal, lo que confirma que el modelo es capaz de procesar imágenes además de texto.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que está optimizado para diálogos multi-turno.
- Multimodalidad: al incluir un proyector multimodal (`mmproj`), el modelo puede procesar entradas de imagen y texto combinados.
- Compatibilidad con `llama.cpp`: se puede ejecutar mediante `llama-cli` o `llama-mtmd-cli` (para multimodalidad).
- Soporte para Ollama: aunque con limitaciones (ver sección de advertencias), es posible crear un modelo unificado para Ollama.
- Endpoints compatible: el tag `endpoints_compatible` sugiere que puede ser servido mediante APIs compatibles con endpoints estándar.
- Despliegue ligero: gracias a la cuantización Q4_K_M, es adecuado para entornos con recursos reducidos.

## Casos de uso

- **Asistentes conversacionales en entornos de bajos recursos**: el modelo cuantizado puede ejecutarse en una GPU de 6-8 GB o incluso en CPU, permitiendo desplegar chatbots con capacidad de razonamiento básico en equipos sin hardware de gama alta.
- **Análisis de imágenes en tiempo real**: al ser multimodal, puede usarse para describir imágenes, responder preguntas sobre fotografías o extraer información visual en aplicaciones de visión por computador.
- **Prototipado rápido de aplicaciones de visión-lenguaje**: la integración con `llama.cpp` y Ollama facilita la creación de demos y prototipos sin necesidad de infraestructura compleja.
- **Educación e investigación**: es útil para experimentar con modelos multimodales cuantizados y evaluar su rendimiento en tareas específicas de instrucción.
- **Chatbots para atención al cliente**: la capacidad de procesar imágenes y texto permite crear sistemas que reciban capturas de pantalla o fotos de productos y respondan con instrucciones o información.
- **Despliegue en servidores con endpoints**: gracias a la compatibilidad con endpoints, puede integrarse en pipelines de inferencia mediante APIs REST, por ejemplo con herramientas como llama.cpp server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas, por lo que no se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M ocupa aproximadamente 3,3 GB en disco, por lo que la carga en memoria requiere al menos 4 GB de VRAM para el modelo principal, más una pequeña cantidad adicional para el proyector multimodal (F16, típicamente <500 MB).
- **GPU recomendadas**: GPUs de consumo con 6-8 GB de VRAM, como la NVIDIA RTX 3060/4060 o AMD RX 6600, son suficientes para ejecutar el modelo con Q4_K_M. En CPU, se puede ejecutar con 16 GB de RAM o más, aunque con mayor latencia.
- **Opciones de despliegue**: compatible con `llama.cpp` (incluyendo `llama-cli` y `llama-mtmd-cli`), Ollama (creando un modelo unificado), y servidores compatibles con endpoints (por ejemplo, mediante `llama-server`).
- **Latencia y throughput**: no se proporcionan datos específicos. En GPU de gama media, la generación de tokens suele estar en el rango de 20-50 tokens por segundo, pero no es un dato confirmado.

## Comparativa con modelos similares

No hay datos de comparativas directas en la información proporcionada. Sin embargo, se puede situar en el contexto de otros GGUF de Gemma 3 4B disponibles en Hugging Face, como `google/gemma-3-4b-it` (formato original) o versiones cuantizadas de la comunidad. Al ser un fine-tune de Alpaca, su rendimiento puede variar respecto al instruct original, pero no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- **Licencia**: el repositorio no especifica la licencia, lo que genera incertidumbre sobre su uso comercial. Se recomienda consultar la licencia del modelo base `gemma-3-4b-it` (Gemma Terms of Use) antes de usar este derivado.
- **Datos de entrenamiento**: no se conoce el dataset exacto de Alpaca utilizado, lo que puede afectar a la calidad y sesgos del modelo.
- **Riesgo de alucinación**: al ser un modelo pequeño (4B) y cuantizado, puede generar respuestas inexactas o inventar información, especialmente en tareas de razonamiento complejo.
- **Limitaciones multimodales**: aunque es multimodal, la calidad de la comprensión de imágenes puede ser inferior a modelos más grandes, y la cuantización puede degradar la precisión.
- **Restricción de Ollama**: Ollama no soporta archivos `mmproj` separados; para usar el modelo en Ollama es necesario crear un modelo unificado con el archivo bf16 original, lo que aumenta el uso de memoria.
- **Compatibilidad**: el ajuste del token BOS puede afectar a algunos casos de uso si no se usa el template de chat correcto (`--jinja`).

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/fport/gemma-3-4b-tr-alpaca-GGUF)
- [Modelo base: google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Modelo base: google/gemma-3-4b-pt](https://huggingface.co/google/gemma-3-4b-pt)
- [Documentación de Gemma 4 (Google AI for Developers)](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Página oficial de Gemma en DeepMind](https://deepmind.google/models/gemma/)
- [Unsloth (librería de conversión)](https://github.com/unslothai/unsloth)
