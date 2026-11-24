# pockettravel/qwen3.5-0.8b-travel-it-GGUF

## Resumen

qwen3.5-0.8b-travel-it-GGUF es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario pockettravel para la aplicación Android Pocket Travel. Se trata de un asistente de viaje offline en italiano cuyo comportamiento está deliberadamente restringido: responde en un máximo de tres frases y utiliza exclusivamente la información contenida en el CONTEXTO que la aplicación inyecta en el prompt (secciones de la guía Wikivoyage recuperadas mediante búsqueda full-text en SQLite). Si el contexto no contiene la respuesta, el modelo lo declara explícitamente en lugar de improvisar.

El modelo tiene 752.393.024 parámetros y se distribuye únicamente en formato GGUF para llama.cpp, con dos cuantizaciones disponibles: Q5_K_M (versión actual, 528 MiB) y Q4_K_M (versión obsoleta, 505 MiB). El contexto de trabajo en la aplicación es de 4096 tokens. No es un chatbot de propósito general ni una fuente de conocimiento: sin contexto, el modelo rechaza la pregunta por diseño, lo que lo convierte en una pieza de una arquitectura RAG cerrada más que en un modelo conversacional autónomo.

Su relevancia actual radica en el enfoque de ingeniería: demuestra que un modelo de menos de mil millones de parámetros, cuantizado a 5 bits y ejecutable en un dispositivo móvil con 4 GB de RAM, puede alcanzar tasas de rechazo correcto superiores al 97% en preguntas sin respuesta en el contexto, muy por encima del modelo base sin ajustar (2-12%). La licencia cc-by-sa-4.0 permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y componentes SSM (según los tensores `attn_qkv` y `ssm_out` mencionados en la model card; detalles completos no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (configuración de la aplicación y de la evaluación) |
| Tipos de cuantizacion | Q5_K_M con importance matrix (actual) y Q4_K_M con importance matrix (obsoleta); tensores Q6_K en atención completa y `ssm_out`, embeddings en Q5_K |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (llama.cpp); sin safetensors publicados en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 752 millones de parámetros. La model card menciona tensores de atención completa (`attn_qkv`) y un tensor `ssm_out`, lo que sugiere una arquitectura híbrida que combina atención con componentes de espacio de estados (SSM), aunque la ficha del autor no detalla la proporción ni la disposición de cada bloque. El ajuste se realizó con LoRA en 16 bits mediante Unsloth, con rango 16, alpha 32, tasa de aprendizaje 2e-4, batch efectivo de 16, secuencias de hasta 1024 tokens y una época. La pérdida se calculó únicamente sobre los tokens de respuesta y se ponderó por categoría de pregunta. Los adaptadores se fusionaron en los pesos base.

El conjunto de entrenamiento consta de 34.171 pares sintéticos pregunta/respuesta (la model card se interrumpe en ese punto, por lo que la composición completa del dataset no está disponible). Se citan como fuentes los datasets soniawmeyer/travel-conversations-finetuning, sapienzanlp/truthful_qa_italian, DanielSc4/alpaca-cleaned-italian, PaDaS-Lab/webfaq y apple/mkqa. La plantilla de chat es ChatML simple, sin bloque `<think>` ni `enable_thinking`. La cuantización Q5_K_M se eligió tras medir una divergencia KL media de 0,020 frente a 0,057 de Q4_K_M sobre texto de guía reservado (64% menos), con un archivo solo un 5% mayor.

## Capacidades

- Generación de texto en italiano restringida a un máximo de tres frases por respuesta.
- Respuesta fundamentada exclusivamente en el contexto proporcionado en el prompt (comportamiento RAG cerrado).
- Rechazo explícito cuando el contexto no contiene la información necesaria, con tasas medidas del 92,5-100% según la categoría de pregunta.
- Manejo de preguntas sobre países, ciudades, historia, clima, lugares cercanos ("qué hay cerca de mí") y salidas o transportes.
- Comprensión de preguntas formuladas fuera de las plantillas de entrenamiento (la evaluación usa preguntas parafraseadas).
- Soporte de conversación multi-turno vía plantilla ChatML, aunque el uso previsto es de un solo turno pregunta-contexto.
- Modelo solo texto: no incluye proyector multimodal (`mmproj`) ni capacidades de visión.
- No dispone de tool calling, function calling ni modo de razonamiento extendido.

## Casos de uso

- Asistente de viaje offline en Android: la aplicación Pocket Travel recupera secciones de la guía Wikivoyage descargada mediante SQLite FTS y las inyecta como contexto; el modelo responde en italiano con la información de la guía sin conexión a red, ocupando unos 623 MiB en ejecución.
- Atención de consultas turísticas con garantía de no alucinación: en escenarios donde una respuesta inventada sobre horarios, precios o transporte tendría consecuencias prácticas, el modelo declara la ausencia de datos en lugar de especular, con un 100% de rechazo en contextos vacíos.
- Integración en pipelines RAG de bajo consumo: sirve como generador final en arquitecturas de recuperación sobre corpus documentales pequeños (guías, folletos, FAQ) desplegadas en hardware con 4 GB de RAM o más.
- Filtro de respondibilidad: puede emplearse para decidir si el contexto recuperado basta para responder, antes de escalar a un modelo mayor o a un operador humano, gracias a su tasa de rechazo del 99,1% en preguntas fuera de tema.
- Despliegue en dispositivos de gama baja o entornos sin GPU: con 528 MiB de pesos y 623 MiB en uso medido en CPU x86 con llama.cpp, es viable en teléfonos, Raspberry Pi y portátiles sin acelerador dedicado.
- Prototipado rápido de asistentes verticales en italiano: la receta LoRA (rango 16, una época, pérdida ponderada por categoría) es reproducible para otros dominios con presupuesto de entrenamiento mínimo.
- Evaluación comparativa de cuantizaciones: el repositorio conserva la versión Q4_K_M obsoleta junto a la Q5_K_M actual, lo que permite medir el impacto de la cuantización en la tasa de rechazo sobre las mismas preguntas.

## Benchmarks y rendimiento

Evaluación sobre 741 preguntas reservadas de 11 países no vistos en entrenamiento, con contextos construidos como en la aplicación, decodificación greedy en llama.cpp y el mismo prompt. El modelo base de comparación es unsloth/Qwen3.5-0.8B-GGUF UD-Q4_K_XL.

| Grupo (preguntas) | Este modelo | Modelo base |
|---|---|---|
| Rechaza correctamente (mayor es mejor) | | |
| Contexto vacío, sin texto de guía (44) | 100% | 2,3% |
| Preguntas fuera de tema (110) | 99,1% | 6,4% |
| País, tema ausente del contexto (43) | 100% | 2,3% |
| Ciudad, tema ausente de la página (120) | 96,7% | 2,5% |
| Historia o clima de ciudad no cubiertos (8) | 100% | 0% |
| "Qué hay cerca de mí" sin lugar cercano (40) | 92,5% | 12,5% |
| Salidas sin coincidencia (10) | 80% | 0% |
| Rechaza incorrectamente preguntas respondibles (menor es mejor) | | |
| Preguntas de país (158) | 3,8% | 1,3% |
| Preguntas de ciudad (50) | 2% | 2% |
| Historia o clima de ciudad (24) | 0% | 0% |
| "Qué hay cerca de mí" (120) | 25% | 7,5% |
| Salidas (14) | 0% | 7,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card advierte que la baja tasa de rechazos incorrectos del modelo base se debe a que apenas rechaza: cuando no rechaza, responde con conocimiento propio o con texto que no contesta la pregunta.

## Requisitos de hardware

- VRAM/RAM en uso: 623 MiB con Q5_K_M y 600 MiB con Q4_K_M, medidos con llama.cpp en CPU x86 con contexto 4096, batch 512 y caché KV en f16; incluye pesos, caché KV, estado recurrente y buffers de cómputo.
- RAM de dispositivo recomendada por el autor: 4 GB o más. El modelo y la aplicación ocupan aproximadamente el 24% de esa memoria (unos 0,4 GB para la app).
- GPU: no se especifican modelos recomendados; el caso de uso objetivo es CPU móvil y x86. Cabe en cualquier GPU consumer con más de 1 GB de VRAM libre (GTX 1050, RTX 3050 en adelante), aunque el autor no publica cifras para GPU.
- Despliegue: llama.cpp mediante `llama-server -m qwen3.5-0.8b-travel-it-Q5_K_M.gguf -c 4096`; compatible con el ecosistema GGUF (Ollama, LM Studio) al usar plantilla ChatML estándar, aunque no se documentan integraciones específicas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.5-0.8b-travel-it (este) | 752 M | 4096 | RAG cerrado, rechazo explícito, italiano | cc-by-sa-4.0 | GGUF |
| Qwen3.5-0.8B (base) | 752 M | no disponible en la ficha | Chatbot generalista | no disponible en la ficha | safetensors, GGUF |
| Qwen3.5-2B travel (colección Pocket Travel) | ~2B | no disponible | Mismo enfoque, mayor tamaño | no disponible en la ficha | GGUF |
| Qwen3.5-4B travel (colección Pocket Travel) | ~4B | no disponible | Mismo enfoque, mayor tamaño | no disponible en la ficha | GGUF |

La comparación cuantitativa disponible se limita al modelo base: este ajuste eleva el rechazo correcto en contexto vacío del 2,3% al 100% y en preguntas fuera de tema del 6,4% al 99,1%, a costa de un aumento del rechazo incorrecto en preguntas de proximidad (del 7,5% al 25%). No se dispone de datos de benchmarks frente a otros asistentes de viaje o modelos pequeños de la misma categoría.

## Limitaciones y advertencias

- Sin contexto, el modelo rechaza por diseño: no debe desplegarse como chatbot general ni como fuente de conocimiento autónoma.
- Tasa de rechazo incorrecto del 25% en preguntas de proximidad ("qué hay cerca de mí"), el punto débil más acusado frente al modelo base (7,5%).
- Tasa de rechazo incorrecto del 3,8% en preguntas de país y del 2% en preguntas de ciudad, ligeramente superiores a las del modelo base.
- El archivo Q4_K_M está marcado como obsoleto, entrenado con un dataset anterior y con un 20,2% de rechazo incorrecto; solo debe usarse para pruebas o por compatibilidad con Pocket Travel 0.13 y anteriores.
- Idiomas limitados a italiano e inglés; el comportamiento entrenado y evaluado es en italiano.
- Riesgo de alucinación residual: aunque el entrenamiento penaliza responder sin contexto, no se documenta una garantía formal de fidelidad al contexto en todos los casos.
- Sesgos: no se documentan análisis de sesgo; al depender de guías Wikivoyage, hereda los sesgos y lagunas de esa fuente.
- Licencia cc-by-sa-4.0: permite uso comercial con atribución y obligación de compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar modificaciones.
- La model card está truncada en la sección de entrenamiento (composición completa del dataset y detalles de la arquitectura no disponibles).
- Contexto máximo de 4096 tokens: insuficiente para guías extensas o conversaciones largas sin recorte de secciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pockettravel/qwen3.5-0.8b-travel-it-GGUF
- Colección Pocket Travel: https://huggingface.co/collections/pockettravel/pocket-travel
- Aplicación Pocket Travel (GitHub): https://github.com/miracle091/pocket-travel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GGUF del modelo base usado en la evaluación: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Dataset de conversaciones de viaje: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning
- Dataset TruthfulQA italiano: https://huggingface.co/datasets/sapienzanlp/truthful_qa_italian
- Dataset Alpaca limpio italiano: https://huggingface.co/datasets/DanielSc4/alpaca-cleaned-italian
- Dataset WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq
- Dataset MKQA: https://huggingface.co/datasets/apple/mkqa
