# mradermacher/llama-3-8b-dolphin-uncensored-GGUF

## Resumen

El repositorio `mradermacher/llama-3-8b-dolphin-uncensored-GGUF` contiene cuantizaciones en formato GGUF del modelo `adamkareem/llama-3-8b-dolphin-uncensored`, un fine-tuning de Llama 3 de 8.000 millones de parámetros orientado a conversación y generación de texto sin restricciones de contenido. El autor, mradermacher, ofrece versiones estáticas en varios niveles de cuantización (Q4_K_S, Q4_K_M, Q8_0 y f16) para facilitar su ejecución en entornos locales con recursos limitados.

Este modelo es relevante para desarrolladores e investigadores que buscan un LLM de tamaño medio capaz de funcionar en hardware de consumo (GPU con 6–16 GB de VRAM) y que no imponga filtros de seguridad sobre el contenido generado. Al estar en formato GGUF, es compatible con motores de inferencia como llama.cpp, Ollama o text-generation-inference, lo que permite un despliegue sencillo en CPU o GPU. La licencia indicada es Apache 2.0, aunque el modelo base original de Llama 3 tiene su propia licencia, por lo que conviene verificar los términos antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo base; Llama 3 nativo usa 8.192 tokens) |
| Tipos de cuantizacion | Q4_K_S, Q4_K_M, Q8_0, f16 (estáticas) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 (en el repositorio) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `adamkareem/llama-3-8b-dolphin-uncensored` es un fine-tuning de Llama 3 8B, que emplea una arquitectura transformer decoder-only con atención multi-cabeza y normalización RMSNorm. El entrenamiento se realizó sobre el conjunto de datos Dolphin, que incluye instrucciones, conversaciones y tareas de código y matemáticas, con un enfoque en eliminar las restricciones de contenido habituales (modelo "uncensored"). No se dispone de detalles exactos sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni sobre innovaciones técnicas adicionales.

La cuantización GGUF fue realizada por mradermacher mediante un proceso estático (sin uso de matrices de importancia o imatrix). Los archivos se generaron a partir de los pesos del modelo base y se ofrecen en varios niveles de precisión para equilibrar tamaño y calidad.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Instrucciones generales y tareas de razonamiento basico.
- Generacion de codigo y soporte para tareas de programacion (segun la familia Dolphin).
- Matematicas y logica elemental.
- Naturaleza "uncensored": no aplica filtros de contenido, lo que permite generar respuestas sobre temas sensibles (con los riesgos asociados).
- No se confirma soporte explicito para tool calling o function calling en este repositorio.
- Multilingue limitado al ingles (no se indican otros idiomas).

## Casos de uso

- Chatbot local sin restricciones: el modelo puede desplegarse con Ollama o llama.cpp para ofrecer un asistente conversacional en un equipo personal, sin depender de servicios en la nube. Su tamano de 8B cuantizado a Q4_K_M (5 GB) permite ejecutarlo en una GPU con 6-8 GB de VRAM.
- Generacion de contenido creativo: redaccion de historias, guiones o dialogos donde se requiera explorar temas controvertidos sin censura previa.
- Prototipado de aplicaciones de IA: al ser un GGUF, es facil integrarlo en pipelines de desarrollo con Python (llama-cpp-python) para probar ideas de generacion de texto en local.
- Asistente de codigo en entornos offline: puede usarse para autocompletar o explicar fragmentos de codigo en ingles, aunque su rendimiento en tareas complejas de programacion puede ser inferior a modelos especializados.
- Investigacion sobre sesgos y seguridad: al ser "uncensored", permite estudiar comportamientos del modelo sin alineacion, util para analisis de sesgos o riesgos de generacion de contenido peligroso.
- Educacion y demostraciones: para ensenar conceptos de LLMs en aulas o talleres, ejecutando el modelo en portatiles con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para el modelo base `adamkareem/llama-3-8b-dolphin-uncensored` ni para sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_S (4,8 GB): cabe en GPUs con 6 GB de VRAM (p. ej., GTX 1660, RTX 2060).
  - Q4_K_M (5,0 GB): similar, recomendado para GPUs de 8 GB (RTX 3070, RTX 4060).
  - Q8_0 (8,6 GB): requiere al menos 10-12 GB de VRAM (RTX 3080, RTX 4070 Ti).
  - f16 (16,2 GB): necesita 16 GB o mas (RTX 4090, A100, etc.).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y suficiente VRAM segun la cuantizacion elegida. Tambien funciona en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference, llama-cpp-python, o cualquier motor compatible con GGUF.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 50-100 tokens/s; en CPU, mucho menor.

## Comparativa con modelos similares

No se dispone de datos comparativos directos de este modelo frente a alternativas como Dolphin 3.0 Llama 3.1 8B, Mistral 7B Instruct o Llama 3 8B Instruct. Los tres comparten tamano y arquitectura similar, pero difieren en licencia, contexto y rendimiento. Este repositorio se distingue por ofrecer cuantizaciones GGUF listas para uso local con licencia Apache 2.0 declarada, aunque el modelo base puede tener restricciones adicionales. Se recomienda consultar las fichas de cada modelo para una comparacion detallada.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en aplicaciones publicas sin moderacion adicional.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar hechos o responder con informacion falsa con alta confianza.
- Sesgos: el entrenamiento sobre datos de internet puede introducir sesgos de genero, raza o ideologicos.
- Contexto limitado: la ventana de contexto no se especifica; si hereda los 8.192 tokens de Llama 3, puede ser insuficiente para tareas de larga duracion.
- Cuantizacion estatica: los quants pueden perder precision en comparacion con el modelo original en f16, especialmente en tareas de razonamiento complejo.
- Licencia: aunque el repositorio indica Apache 2.0, el modelo base Llama 3 tiene su propia licencia de Meta. Verificar los terminos antes de uso comercial.
- Soporte limitado a ingles: no se garantiza buen rendimiento en otros idiomas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llama-3-8b-dolphin-uncensored-GGUF
- Modelo base: https://huggingface.co/adamkareem/llama-3-8b-dolphin-uncensored
- Dolphin 2.9 en Ollama: https://ollama.com/library/dolphin-llama3:8b
- Dolphin 3.0 (referencia de la serie): https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
