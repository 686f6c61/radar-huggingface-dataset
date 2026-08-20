# Axel0689/Qwen3.8-27B-Q3_K_M-GGUF

## Resumen

El modelo Axel0689/Qwen3.8-27B-Q3_K_M-GGUF es una conversión a formato GGUF del modelo Qwen3.8-27B, perteneciente a la familia Qwen3.8 desarrollada por Qwen. Esta versión cuantizada con Q3_K_M reduce el peso del modelo original (27 320 697 856 parámetros) a aproximadamente 13,5 GB, lo que permite ejecutarlo en hardware de consumo con recursos moderados. El modelo base es multimodal (acepta imágenes y texto) y cuenta con una ventana de contexto de 256K tokens, además de capacidades de razonamiento y generación de código. Su licencia Apache 2.0 lo hace libre para uso comercial, y su disponibilidad en formato GGUF facilita su despliegue con herramientas como llama.cpp, Ollama o vLLM.

La relevancia de este modelo radica en que combina un tamaño de 27B con capacidades multimodales y de agente, algo poco habitual en modelos de este rango. La cuantización Q3_K_M reduce drásticamente los requisitos de memoria, manteniendo un equilibrio entre calidad y eficiencia, lo que lo convierte en una opción atractiva para desarrolladores que necesitan ejecutar un modelo de visión y razonamiento en una única GPU de gama media o incluso en CPU con suficiente RAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens (262.144 según algunas fuentes) |
| Tipos de cuantizacion | Q3_K_M (este repo); el modelo base admite otros quants |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q3_K_M) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un transformer multimodal que acepta tanto texto como imágenes como entrada. Incluye un codificador visual (vision encoder) y un decodificador de lenguaje basado en arquitectura transformer estándar con atención completa. Una de las innovaciones destacadas es la incorporación de MTP (Multi-Token Prediction), que permite predecir varios tokens simultáneamente durante la generación, mejorando el throughput en inferencia. El modelo base fue entrenado por el equipo Qwen con datos multilingues y multimodales, aunque los detalles exactos del dataset (número de tokens, composición) no están disponibles en la información consultada.

La cuantización Q3_K_M aplicada en este repositorio se realizó mediante el espacio GGUF-my-repo de ggml.ai, que utiliza llama.cpp para convertir los pesos originales a formato GGUF. Esta cuantización de 3 bits con bloques K reduce el tamaño del modelo de aproximadamente 54 GB (en bf16) a 13,5 GB, manteniendo un equilibrio entre pérdida de precisión y uso de memoria. El modelo conserva el soporte multimodal: para usar imágenes es necesario cargar el proyector multimodal (mmproj) correspondiente, que se distribuye por separado en repositorios como el de bartowski.

## Capacidades

- Generación de texto y razonamiento complejo: resuelve problemas de lógica, matemáticas y análisis en múltiples pasos.
- Vision y multimodal: acepta imágenes como entrada y puede describirlas, responder preguntas sobre su contenido o realizar tareas de OCR.
- Generación de código: produce código en varios lenguajes, con soporte para agentes de programación y herramientas.
- Agente y tool calling: puede integrarse en sistemas que requieren llamadas a funciones o APIs externas (no confirmado en la documentación oficial, pero el modelo base está diseñado para ello).
- Contexto largo de 256K: permite procesar documentos extensos, conversaciones largas o análisis de código en repositorios completos.
- Capacidades multilingues: el modelo base soporta múltiples idiomas, aunque no se ha publicado la lista completa.

## Casos de uso

- Atención al cliente automatizada: con su ventana de 256K tokens, puede gestionar conversaciones multi-turno con historial completo y documentos de referencia, manteniendo el contexto durante largas interacciones.
- Análisis de documentos técnicos: gracias a su capacidad de visión, puede extraer información de capturas de pantalla, diagramas o documentos escaneados, y resumir su contenido en texto estructurado.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para generar tests, revisar pull requests o autocompletar funciones.
- Asistente de investigación local: al ejecutarse en una GPU de 16 GB, permite a investigadores procesar artículos científicos con imágenes y tablas sin depender de APIs externas.
- Chatbot con memoria extendida: su contexto de 256K permite mantener conversaciones de horas con memoria completa, sin perder el hilo ni necesidad de resumir.
- Análisis de imágenes médicas o de ingeniería: la combinación de visión y razonamiento permite describir anomalías en radiografías, planos o imágenes de satélite, generando informes técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización Q3_K_M de Qwen3.8-27B en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado por el equipo de Qwen en tareas como MMLU, HumanEval y GSM8K, pero estos datos no se han replicado en la documentación de este repositorio GGUF. Se recomienda consultar la model card original de Qwen/Qwen3.8-27B para obtener resultados de referencia del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 13,5 GB, por lo que se necesitan al menos 14 GB de memoria disponible (GPU o RAM) para cargar el modelo en memoria. Con cuantización Q3_K_M, puede ejecutarse en GPUs con 16 GB de VRAM, como una RTX 4080/4090 o una A4000.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) o A6000. También puede ejecutarse en CPU con al menos 32 GB de RAM, aunque la velocidad será menor.
- Despliegue en consumer GPU: sí, en tarjetas con 16 GB de VRAM o más. En GPUs de 12 GB, se podría usar con cuantizaciones más bajas (Q2_K) o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (incluido el servidor), Ollama, vLLM (con soporte GGUF), llama-cpp-python, o el propio CLI de llama.cpp.
- Latencia y throughput: no disponible en la información. En una RTX 4090 se estima un throughput de 20-40 tokens/s con este quant, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (GGUF Q3_K_M) | 27,3B | 256K | GGUF Q3_K_M | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27,3B | 256K | bf16 | Apache 2.0 | Hugging Face |
| Llama 3.1 8B (GGUF) | 8B | 128K | GGUF | Llama 3.1 Community | Hugging Face |
| Mistral Small 3.2 (24B) | 24B | 128K | GGUF | Apache 2.0 | Hugging Face |

La comparativa se basa en el tamaño y características generales, pero no se dispone de resultados de benchmarks para esta cuantización específica. Qwen3.8-27B se posiciona como un modelo multimodal de 27B con contexto muy largo y licencia permisiva, similar a Qwen3.5 o Qwen3.6 de la misma familia. La alternativa más cercana en tamaño sería Mistral Small 3.2 (24B), pero este no incluye visión.

## Limitaciones y advertencias

- Cuantización Q3_K_M: la pérdida de precisión es notable en tareas de razonamiento complejo y matemáticas. Para uso profesional, se recomienda probar con Q4_K_M o Q5_K_M si el hardware lo permite.
- Alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de visión donde no hay datos en la imagen.
- Sesgos: no se han publicado estudios específicos sobre sesgos del modelo, pero al estar entrenado con datos web, puede heredar sesgos comunes en otros LLMs.
- Soporte multimodal condicionado: para usar imágenes es necesario cargar el proyector (mmproj) correspondiente; sin él, el modelo solo procesa texto.
- Contexto de 256K: aunque la ventana es larga, el rendimiento degrada con contextos muy largos y el consumo de memoria aumenta proporcionalmente.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución y no se puede usar el nombre de Qwen para promocionar productos derivados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Axel0689/Qwen3.8-27B-Q3_K_M-GGUF
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio GGUF de bartowski (incluye mmproj): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Guía de despliegue local en yottalabs.ai: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
