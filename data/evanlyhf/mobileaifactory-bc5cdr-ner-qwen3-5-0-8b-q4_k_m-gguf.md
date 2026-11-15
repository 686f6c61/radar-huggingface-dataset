# evanlyhf/MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-Q4_K_M-GGUF

## Resumen

MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-Q4_K_M-GGUF es un modelo de lenguaje especializado en extracción de entidades nombradas (NER) biomédicas, derivado mediante fine-tuning LoRA del modelo base Qwen/Qwen3.5-0.8B y posteriormente cuantizado a Q4_K_M en formato GGUF. Lo desarrolla el proyecto Mobile AI Factory, un sistema agéntico descrito en el paper arXiv:2611.13509 que, a partir de una especificación de tarea y un teléfono objetivo, construye de forma automática un SLM (small language model) ajustado y cuantizado listo para ejecutarse en el dispositivo.

El modelo resuelve una tarea concreta: dado un texto biomédico en inglés, devolver una lista JSON de entidades con claves `text` y `type`, cubriendo las categorías de sustancias químicas y enfermedades del corpus BC5CDR (BioCreative V CDR). Con 772.845.888 parámetros totales y un peso de repositorio de aproximadamente 0,5 GB, está pensado para inferencia on-device en Android mediante llama.cpp.

Su relevancia radica en que demuestra un flujo completo de especialización y despliegue en móvil con mediciones reales del hardware objetivo, alcanzando un Span F1 de 0,830 en el conjunto de evaluación congelado del run (1.000 filas), lo que supone +0,125 respecto al primer fine-tune. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B), fine-tuning LoRA fusionado (merged) |
| Parámetros totales | 772.845.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de ejecución usa `n_ctx=4096` |
| Tipos de cuantización | Q4_K_M (4 bits); el repo contiene únicamente el GGUF Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `mobile-ai-factory-bc5cdr-ner-qwen3.5-0.8b-q4_k_m.gguf`, 0,54 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 773 millones de parámetros, sobre el que se aplica un fine-tuning con LoRA que posteriormente se fusiona en los pesos base. El resultado se cuantiza a Q4_K_M (4 bits) en formato GGUF para su ejecución con llama.cpp. El proceso de construcción lo orquesta el sistema Mobile AI Factory: un LLM orquestador decide si ajustar hiperparámetros, minar datos reales o generar ejemplos sintéticos, con reglas fijas que revierten cambios que degradan la precisión, y una búsqueda que escala de modelos pequeños a grandes usando mediciones reales del teléfono objetivo.

Los datos de entrenamiento combinan el corpus BC5CDR (vía el dataset `tner/bc5cdr`), que aporta anotaciones de spans de sustancias químicas y enfermedades, con filas sintéticas generadas y verificadas por un LLM profesor (Claude Sonnet 5) durante la búsqueda. El modelo se entrenó y evaluó con un prompt exacto: instrucción de tarea en un turno de usuario ChatML, seguido de un turno de asistente con bloque `think` vacío (pensamiento desactivado), decodificación greedy, parada en `<|im_end|>` y hasta 512 tokens nuevos. No se detalla en la información disponible si hubo RLHF o DPO.

## Capacidades

- Extracción de entidades nombradas biomédicas (sustancias químicas y enfermedades) a partir de texto en inglés, con salida en JSON.
- Generación de texto conversacional heredada del modelo base, aunque el ajuste está orientado a la tarea NER.
- Formato de salida estructurado: lista JSON de objetos con claves `text` y `type`, o `[]` si no hay entidades.
- Ejecución on-device en Android mediante llama.cpp y apps basadas en llama.cpp.
- Soporte de bloque `think` en el formato de prompt, aunque el modelo se entrenó y evaluó con pensamiento desactivado (bloque vacío).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Extracción de entidades en historiales clínicos: el modelo procesa notas y textos biomédicos en inglés y devuelve las sustancias químicas y enfermedades detectadas en JSON, listo para poblar bases de datos o índices de búsqueda.
- Anotación asistida de corpus farmacológicos: se integra en pipelines de etiquetado para preanotar spans de químicos y enfermedades en artículos de PubMed, reduciendo el trabajo manual de revisión.
- Aplicaciones móviles de salud sin conexión: al ser un GGUF Q4_K_M de 0,54 GB, se ejecuta en un teléfono Android con llama.cpp, permitiendo NER biomédico local sin enviar datos sensibles a la nube.
- Farmacovigilancia y detección de reacciones adversas: extrae pares de sustancia y enfermedad de informes de casos para su posterior análisis de relaciones.
- Enriquecimiento de bases de conocimiento biomédicas: el JSON estructurado se ingiere directamente en grafos o tablas para vincular entidades a ontologías como MeSH o ChEBI.
- Prototipado rápido de tareas NER especializadas: sirve como referencia de un flujo completo (fine-tuning LoRA + cuantización + despliegue móvil) replicable para otras tareas y dominios siguiendo el sistema Mobile AI Factory.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Span F1 en BC5CDR (conjunto de evaluación congelado del run, 1.000 filas) | 0,830 | +0,125 respecto al primer fine-tune |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 0,54 GB, por lo que la inferencia requiere del orden de 1 GB o menos de memoria, dependiendo del contexto configurado.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU móvil y ejecución on-device en Android.
- Cabe en GPU consumer: sí, con amplio margen, en cualquier GPU con al menos 1-2 GB de memoria libre (por ejemplo, GTX 1650, RTX 3050 o superiores); también en CPU.
- Opciones de despliegue: llama.cpp (librería Python `llama_cpp`) y cualquier app Android basada en llama.cpp. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; el sistema Mobile AI Factory usa mediciones reales del teléfono objetivo durante la búsqueda, pero no se publican cifras concretas en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-Q4_K_M | 772.845.888 | no disponible (ejemplo con 4096) | NER biomédico (BC5CDR) | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación de texto general | Apache-2.0 | safetensors |
| Otros modelos NER biomédicos de tamaño similar | no disponible | no disponible | NER biomédico | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparativos con alternativas específicas de NER biomédico; la comparación relevante es con su modelo base, del que se diferencia por el fine-tuning LoRA y la cuantización para despliegue móvil.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (NER de químicos y enfermedades en BC5CDR); su rendimiento fuera de ese dominio no está validado.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Entrenado con un prompt exacto y decodificación greedy; desviarse del formato ChatML con bloque `think` vacío puede degradar la calidad de la salida.
- Riesgo de alucinación en la generación de entidades o en el formato JSON; conviene validar la salida y aplicar revisión humana en contextos clínicos.
- Los datos sintéticos generados por un LLM profesor pueden introducir sesgos o errores no detectados.
- El corpus BC5CDR tiene sus propios términos de uso que deben respetarse además de la licencia Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- La fecha de creación del repositorio (2026-11-15) y la referencia al paper arXiv:2611.13509 deben verificarse antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evanlyhf/MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper: https://arxiv.org/abs/2611.13509
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.13509
- Código: https://github.com/evanly-gh/SLM_Factory
- Dataset: https://huggingface.co/datasets/tner/bc5cdr
