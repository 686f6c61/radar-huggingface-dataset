# mradermacher/Swift-1.5-Ornith-9B-GGUF

## Resumen

Swift-1.5-Ornith-9B es un modelo de lenguaje experimental orientado al razonamiento con uso eficiente de tokens, desarrollado por ukisai sobre la arquitectura qwen3_5 y publicado en Hugging Face. Este repositorio, mantenido por mradermacher, no es el modelo original sino una colección de cuantizaciones estáticas en formato GGUF del modelo base ukisai/Swift-1.5-Ornith-9B, pensadas para su ejecución local con llama.cpp y herramientas compatibles. El modelo se ha ajustado con el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, lo que sugiere un entrenamiento enfocado en conversaciones multi-turno y escenarios de agente.

Su relevancia actual reside en la combinación de tres características: un tamaño contenido (unos 9,2 mil millones de parámetros, ejecutable en GPUs de consumo), un enfoque en "efficient-thinking" (razonamiento que minimiza los tokens generados durante la fase de pensamiento) y una licencia Apache 2.0 que permite uso comercial sin restricciones. Los tags del modelo indican además soporte multimodal, dado que la cuantización incluye archivos mmproj (suplemento multimodal).

Con 645 descargas en el momento de la ficha, se trata de un modelo de nicho y marcado explícitamente como experimental, por lo que conviene evaluarlo con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer; detalles no disponibles) |
| Parámetros totales | 9.197.093.888 (≈9,2 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia de arquitecturas qwen3_5, según los tags del repositorio. No se han publicado detalles sobre la estructura interna concreta (número de capas, cabezas de atención, uso de MoE o atención lineal), por lo que estos datos no están disponibles. El tamaño de 9,2 mil millones de parámetros lo sitúa en la gama media, un punto dulce para inferencia local.

Respecto al entrenamiento, el modelo se ha sometido a un post-training con el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, un conjunto de datos de conversaciones multi-turno con capacidades de agente generado (aparentemente) a partir de un modelo Qwen de 27B. Los tags "reasoning", "efficient-thinking" y "token-efficient" indican que el post-training se ha orientado a producir razonamiento que consume menos tokens, una línea de trabajo que reduce latencia y coste en tareas complejas. No hay información sobre el número de tokens de preentrenamiento ni sobre el uso de RLHF o DPO.

Un detalle relevante es la presencia de archivos mmproj (multi-modal projectors) en las cuantizaciones, lo que confirma que el modelo original incorpora capacidades multimodales, ejecutables vía llama.cpp con el suplemento mmproj correspondiente.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como "conversational").
- Razonamiento con modo de pensamiento eficiente en tokens ("efficient-thinking", "token-efficient").
- Escenarios de agente y conversaciones multi-turno, gracias al ajuste con un dataset SFT multi-turn-agent.
- Capacidades multimodales, inferibles de los archivos mmproj incluidos en la cuantización (visión; el tipo exacto de entrada no está detallado).
- Soporte de function calling / tool calling: no disponible explícitamente, aunque el entrenamiento con datos de agente sugiere cierta afinidad.
- Idioma: inglés. No hay soporte declarado para castellano ni otros idiomas.

## Casos de uso

- Chatbots y asistentes multi-turno en inglés: el ajuste con un dataset de conversaciones multi-turno lo hace adecuado para mantener diálogos largos con coherencia entre turnos.
- Agentes locales con razonamiento eficiente: su entrenamiento en escenarios de agente y el enfoque token-efficient reducen el coste por paso en bucles de agente que ejecutan muchos pasos consecutivos.
- Razonamiento en hardware de consumo: con cuantizaciones Q4_K_M de unos 5,9 GB, cabe en GPUs de 8 GB o incluso en CPU con RAM suficiente, ideal para razonamiento privado sin enviar datos a la nube.
- Aplicaciones multimodales locales: junto con el archivo mmproj, puede describir imágenes o responder preguntas sobre contenido visual en pipelines con llama.cpp.
- Prototipado e investigación en post-training: al ser un modelo experimental con licencia permisiva, sirve como base para experimentar con técnicas de razonamiento eficiente y SFT de agente.
- Integración en herramientas como Ollama o LM Studio: el formato GGUF facilita su despliegue en estaciones de trabajo de desarrolladores para tareas de código, redacción y análisis en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K (4,0 GB): cabe en GPUs de 6 GB o en CPU.
  - Q4_K_S / Q4_K_M (5,6-5,9 GB): GPUs de 8 GB, opción recomendada por el autor.
  - Q6_K (7,7 GB): GPUs de 12 GB.
  - Q8_0 (9,9 GB): GPUs de 16 GB.
  - f16 (18,5 GB): GPUs de 24 GB o superior.
  - Añadir ~0,7-1,0 GB si se usa el suplemento multimodal (mmproj).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas; en servidor, cualquier GPU con suficiente VRAM (A100 no necesaria para este tamaño).
- Consumer GPU: sí, la mayoría de cuantizaciones caben en GPUs de consumo; Q4_K_M funciona en una RTX 3060 de 12 GB con margen para contexto.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para ellos habría que usar los pesos originales en safetensors del modelo base.
- Latencia y throughput: no disponibles. Al ser un modelo de 9B cuantizado, se espera inferencia fluida en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Swift-1.5-Ornith-9B (esta ficha) | 9,2 B | GGUF | Apache 2.0 | Razonamiento eficiente en tokens, agente, experimental |
| Qwen3 8B | 8 B | safetensors / GGUF (comunidad) | Apache 2.0 | Razonamiento híbrido (thinking/non-thinking), multilingüe |
| Llama 3.1 8B Instruct | 8 B | safetensors / GGUF (comunidad) | Llama 3.1 Community License | Uso general, ecosistema amplio |

Comparado con Qwen3 8B, Swift-1.5-Ornith-9B comparte familia arquitectónica (qwen3_5) y licencia, pero apuesta por un post-training especializado en agente y razonamiento eficiente, a costa de un ecosistema mucho menos maduro y sin benchmarks publicados. Frente a Llama 3.1 8B, ofrece licencia más permisiva y enfoque especializado, aunque con menor validación comunitaria y soporte limitado al inglés.

## Limitaciones y advertencias

- Modelo marcado explícitamente como experimental por su autor: no recomendado para producción sin validación previa.
- Soporte de idiomas limitado al inglés; el rendimiento en castellano no está garantizado ni evaluado.
- No hay benchmarks publicados, por lo que su calidad real frente a modelos comparables es desconocida.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad, especialmente en tareas de razonamiento; se recomiendan Q4_K_M o superiores.
- La longitud de contexto no está documentada en este repositorio; debe verificarse en la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Las capacidades multimodales dependen del archivo mmproj y del soporte del runtime; no todos los frontales de GGUF las gestionan igual.
- Riesgo de alucinación: no hay datos específicos, pero como en todo modelo de ~9B, debe esperarse un riesgo no despreciable en tareas fácticas.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene revisar el archivo LICENSE del modelo base.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Swift-1.5-Ornith-9B-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Swift-1.5-Ornith-9B-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Swift-1.5-Ornith-9B-GGUF
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
- Dataset de SFT: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- FAQ de cuantizaciones y peticiones: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
