# eepos/Nanbeige4.3-33B-Q4_K_S-GGUF

## Resumen

Nanbeige4.3-33B-Q4_K_S-GGUF es una cuantización en formato GGUF del modelo base Nanbeige4.3-33B, desarrollado por Nanbeige. La conversión ha sido realizada por el usuario eepos mediante el espacio automatizado GGUF-my-repo de Hugging Face, que emplea llama.cpp para generar el fichero cuantizado. El modelo original es un LLM denso de 33.118 millones de parámetros orientado a generación de texto, con soporte de inglés y chino.

La versión cuantizada en Q4_K_S reduce el tamaño del modelo hasta aproximadamente 19,1 GB en el repositorio, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, LM Studio u Ollama, sin necesidad de GPUs de gama alta con grandes cantidades de VRAM. Esto lo hace relevante para desarrolladores que quieren desplegar localmente un modelo de tamaño medio-alto con licencia Apache 2.0, que permite uso comercial sin restricciones significativas.

Al tratarse de una cuantización comunitaria, la ficha técnica original del modelo base no está incluida en el repositorio de la cuantización, por lo que varios detalles de arquitectura, entrenamiento y benchmarks deben consultarse en la model card del modelo original, cuya información detallada no está disponible en los datos proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según tags de llama.cpp) |
| Parámetros totales | 33.118.977.024 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 2048 tokens) |
| Tipos de cuantizacion | Q4_K_S (esta cuantización) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un modelo de lenguaje denso de 33.118 millones de parámetros publicado en formato safetensors y compatible con la librería transformers de Hugging Face. La cuantización aquí descrita se ha generado con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, aplicando el esquema Q4_K_S, un formato de cuantización de 4 bits con bloques K-quant que ofrece un buen equilibrio entre tamaño, calidad de salida y velocidad de inferencia.

No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas del modelo base en la información disponible. Tampoco consta si se trata de un modelo base (preentrenado) o instruido, aunque el pipeline etiquetado como text-generation y el tag "conversational" sugieren que puede emplearse en diálogos; para detalles precisos debe consultarse la model card original de Nanbeige/Nanbeige4.3-33B.

## Capacidades

- Generación de texto en inglés y chino, según los idiomas declarados en el repositorio.
- Uso conversacional, indicado por el tag "conversational" del repositorio.
- Inferencia local mediante llama.cpp (CLI y servidor), con compatibilidad con el ecosistema GGUF (LM Studio, Ollama, GPT4All, etc.).
- No consta en la información disponible soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots locales en inglés y chino: el formato GGUF permite desplegar el modelo en un servidor llama.cpp para gestionar conversaciones multi-turno sin depender de APIs externas, útil cuando los datos no pueden salir de la infraestructura propia.
- Prototipado de aplicaciones LLM: con 19,1 GB de tamaño, cabe en GPUs de consumo o incluso en CPU con RAM suficiente, lo que facilita pruebas rápidas de prompts y pipelines antes de escalar a modelos mayores.
- Generación y asistencia de código: siendo un modelo generalista de 33B, puede emplearse para autocompletado y generación de snippets, aunque no hay benchmarks de código publicados en la información disponible.
- Procesamiento bilingüe chino-inglés: adecuado para equipos que trabajen con documentación o contenido en ambos idiomas, algo poco común en modelos open source de tamaño medio.
- Integración en servidores de inferencia ligeros: el modo servidor de llama.cpp expone una API compatible con OpenAI, lo que permite conectarlo a frontales como Open WebUI o aplicaciones existentes.
- Evaluación de cuantizaciones: útil como referencia para comparar la degradación de calidad de Q4_K_S frente a Q8_0 o FP16 en casos de uso reales.
- Uso comercial en producto: la licencia Apache 2.0 permite integrar el modelo en productos cerrados sin obligación de liberar el código derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB para cargar el fichero Q4_K_S completo en GPU (19,1 GB es el tamaño del repositorio); con descarga de capas a CPU puede funcionar con menos VRAM.
- GPUs recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite cargar el modelo íntegramente en GPU; en GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) sería necesario offload parcial a CPU.
- Consumer GPUs: sí, cabe completamente en una RTX 3090/4090 de 24 GB; en Mac con Apple Silicon, un equipo con 32 GB de memoria unificada o más puede ejecutarlo mediante llama.cpp.
- CPU: es viable la inferencia solo con CPU si se dispone de al menos 24-32 GB de RAM, con velocidades de generación notablemente inferiores.
- Despliegue: llama.cpp (CLI y llama-server, documentado en la model card), además de herramientas compatibles con GGUF como LM Studio, Ollama o GPT4All. No consta compatibilidad verificada con vLLM o TGI para este fichero GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Idiomas | Contexto |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Q4_K_S-GGUF | 33.118 M (33,1 B) | GGUF Q4_K_S | Apache 2.0 | en, zh | no disponible |
| Qwen2.5-32B-Instruct | 32,5 B | safetensors / GGUF | Apache 2.0 | multilingüe (29+) | 128 K |
| Yi-1.5-34B-Chat | 34,4 B | safetensors / GGUF | Apache 2.0 | en, zh | 4 K (8 K en Yi-1.5) |
| Gemma 2 27B | 27,2 B | safetensors / GGUF | Gemma (restricciones de uso) | multilingüe | 8 K |

Los modelos comparables de 27-34B orientados también al par inglés-chino son principalmente Qwen2.5-32B y Yi-1.5-34B. Sin benchmarks publicados para Nanbeige4.3-33B en la información disponible, no puede afirmarse su posición relativa en rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo LLM, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Alucinaciones: riesgo estándar de LLM; no hay mitigaciones específicas documentadas en la model card de la cuantización.
- Idiomas: limitado a inglés y chino según los metadatos; el rendimiento en otros idiomas no está garantizado ni evaluado.
- Cuantización: Q4_K_S implica una pérdida de calidad respecto al modelo en precisión completa (FP16/BF16); en tareas sensibles puede ser preferible usar cuantizaciones superiores (Q5_K_M, Q6_K, Q8_0) o el modelo original.
- Contexto: el ejemplo de la model card usa 2048 tokens de contexto, aunque la ventana real del modelo base no consta en la información disponible; verificar en la model card original antes de diseñar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base por si existen términos adicionales de Nanbeige.
- Mantenimiento: se trata de una cuantización comunitaria automatizada (852 descargas y 4 likes en el momento de los datos), sin soporte oficial del equipo de Nanbeige; para producción puede ser preferible usar versiones oficiales del modelo base.

## Enlaces

- Cuantización GGUF: https://huggingface.co/eepos/Nanbeige4.3-33B-Q4_K_S-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
