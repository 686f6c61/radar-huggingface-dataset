# impacte/NVIDIA-Nemotron-Nano-9B-v2-GGUF

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 es un modelo de lenguaje compacto y afinado mediante instrucciones, perteneciente a la familia Nemotron de NVIDIA. Esta ficha describe la conversión a formato GGUF en precisión bf16 realizada por el usuario impacte, que permite ejecutar el modelo con llama.cpp en entornos locales. El modelo base fue desarrollado por NVIDIA y está diseñado para ofrecer un rendimiento eficiente en despliegues locales, manteniendo capacidades de razonamiento y generación de texto de alta calidad.

La arquitectura del modelo, denominada `NemotronHForCausalLM`, presenta 56 capas, 40 cabezas de atención (con 8 cabezas KV) y un tamaño de capa oculta de 4480. Con aproximadamente 8.900 millones de parámetros y una longitud de contexto de 131.072 tokens, el modelo destaca por su capacidad de manejar secuencias muy largas. La versión GGUF en bf16 conserva la precisión completa del modelo original, aunque su tamaño de 17,79 GB lo hace menos adecuado para entornos con recursos limitados.

La relevancia de esta conversión radica en su compatibilidad con llama.cpp, lo que permite a desarrolladores integrar el modelo en aplicaciones locales sin depender de la infraestructura de NVIDIA. El modelo base soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) y se distribuye bajo la NVIDIA Open Model License, que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM (nemotron_h) |
| Parametros totales | 8.888.227.328 (~9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bf16 (conversión GGUF) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (bf16) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-Nano-9B-v2 se basa en una arquitectura transformer estándar, pero con configuraciones específicas de la familia Nemotron. La arquitectura `NemotronHForCausalLM` utiliza 56 capas, 40 cabezas de atención con 8 cabezas KV (lo que reduce el coste de memoria en atención multi-cabeza) y un tamaño de capa oculta de 4480. El vocabulario es amplio, con 131.072 tokens, lo que facilita la representación de múltiples idiomas.

El entrenamiento del modelo base fue realizado por NVIDIA, que empleó sus conjuntos de datos de preentrenamiento y post-entrenamiento. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición del dataset o si se utilizaron técnicas como RLHF o DPO. Esta conversión GGUF no añade ningún afinamiento adicional, por lo que mantiene exactamente las capacidades del modelo original. La conversión se realizó con la herramienta `convert_hf_to_gguf.py` de llama.cpp.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de generar texto coherente y razonar sobre problemas complejos gracias a su entrenamiento instructivo.
- Soporte multilingüe: el modelo soporta seis idiomas principales: inglés, español, francés, alemán, italiano y japonés.
- Razonamiento multi-turno: la longitud de contexto de 131.072 tokens permite mantener conversaciones largas y procesar documentos extensos sin perder información.
- Tool calling / function calling: no se ha confirmado explícitamente en la información disponible.
- Capacidades de agente: no se ha confirmado explícitamente en la información disponible.
- Modo de pensamiento (thinking mode): no se ha confirmado explícitamente en la información disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede integrarse en aplicaciones de chat locales mediante llama.cpp, ofreciendo respuestas en seis idiomas sin conexión a internet. Su ventana de contexto de 131.072 tokens permite mantener conversaciones largas sin pérdida de contexto.
- Análisis de documentos extensos: gracias a su amplio contexto, el modelo puede procesar documentos largos (por ejemplo, contratos, informes técnicos) para extraer información, resumir o responder preguntas sobre ellos.
- Desarrollo de aplicaciones con OpenAI-compatible API: el servidor llama.cpp expone un endpoint compatible con la API de OpenAI, lo que facilita la integración del modelo en aplicaciones existentes que ya utilizan dicha API.
- Traducción automática: con soporte para seis idiomas, el modelo puede utilizarse para tareas de traducción entre estos idiomas, aunque su rendimiento en este ámbito no se ha evaluado específicamente.
- Generación de código: aunque no se especifica una capacidad especial para código, el modelo puede generar fragmentos de código, como se muestra en el ejemplo de la documentación (explicar qué es una aplicación Tauri v2).
- Despliegue en entornos sin GPU: al ser una versión GGUF, el modelo puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor que en GPU. Esto lo hace útil para entornos de desarrollo o pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF bf16 pesa 17,79 GB. Para cargar completamente el modelo en GPU, se recomienda al menos 18 GB de VRAM. Con cuantizaciones Q4_K_M o Q5_K_M, el requisito se reduce a aproximadamente 5-6 GB.
- GPU recomendadas: para la versión bf16 completa, una GPU con 20 GB o más de VRAM (por ejemplo, RTX 3090, RTX 4090, A100). Para cuantizaciones inferiores, es suficiente con una RTX 3060 o superior.
- ¿Cabe en consumer GPU? Sí, con cuantizaciones Q4_K_M o Q5_K_M en GPUs con 8 GB de VRAM (como RTX 3070 o RTX 4060 Ti). La versión bf16 completa no cabe en la mayoría de las GPUs de consumo de gama media.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (si se convierte a GGUF), servidor OpenAI-compatible de llama.cpp.
- Latencia y throughput: no se han proporcionado datos específicos. Se estima que en una RTX 4090, la generación de tokens puede alcanzar unos 30-50 tokens por segundo con la versión bf16 completa, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2 | 9B | 131.072 | NVIDIA Open Model | GGUF (bf16) |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Safetensors, GGUF |
| Mistral 7B | 7B | 32K | Apache 2.0 | Safetensors, GGUF |

La comparativa muestra que Nemotron-Nano-9B-v2 ofrece un contexto más largo que Mistral 7B y comparable a Llama 3.1 8B. Sin embargo, no se dispone de datos de rendimiento en benchmarks para comparar la calidad de las respuestas. La licencia de NVIDIA es más restrictiva que Apache 2.0, pero similar a la de Llama.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en temas de actualidad o muy específicos.
- Limitaciones de contexto: aunque el contexto máximo es de 131.072 tokens, el uso de contextos muy largos aumenta el consumo de memoria y puede degradar el rendimiento si no se dispone de suficiente VRAM.
- Restricciones de licencia: la NVIDIA Open Model License debe revisarse antes de cualquier uso comercial. No se trata de una licencia de código abierto estándar y puede imponer condiciones adicionales.
- Tamaño del archivo: la versión bf16 es grande (17,79 GB), lo que puede ser un inconveniente para la descarga y el almacenamiento. Se recomienda cuantizar a Q4_K_M o Q5_K_M para entornos con menos recursos.
- Idiomas: aunque el modelo soporta seis idiomas, su rendimiento puede variar entre ellos. No se ha evaluado su calidad para español en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta conversión GGUF: https://huggingface.co/impacte/NVIDIA-Nemotron-Nano-9B-v2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
