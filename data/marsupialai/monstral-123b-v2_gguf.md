# MarsupialAI/Monstral-123B-v2_GGUF

## Resumen

Monstral-123B-v2 es un modelo de lenguaje de 123 mil millones de parámetros creado por MarsupialAI, un desarrollador de la comunidad. Se trata de un merge híbrido de tres modelos: Behemoth 1.2, Tess y Magnum V4, todos ellos basados en la arquitectura Mistral-Large. El autor intentó realizar una interpolación esférica (slerp) a tres vías, algo técnicamente no posible, por lo que simuló el efecto combinando por separado Behemoth 1.2 con Tess y Behemoth 1.2 con Magnum. El resultado es un modelo de chat orientado a la generación de texto en inglés.

La versión GGUF, que es la que se documenta en esta ficha, está preparada para su uso con herramientas como llama.cpp, Ollama o vLLM mediante cuantización. El repositorio ocupa 447,8 GB, lo que sugiere que incluye múltiples archivos de cuantización. El modelo se publicó en diciembre de 2024 y ha recibido poca actividad en HuggingFace (63 descargas, 3 likes), por lo que no está disponible en la API de inferencia serverless de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Merge de Mistral-Large (Behemoth 1.2, Tess, Magnum V4) |
| Parametros totales | 123 B |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (iMatrix, generado con Kalomaze's groups_merged.txt) |
| Idiomas soportados | en |
| Licencia | mrl (licencia personalizada, no estándar) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo más allá de que es un merge de tres modelos basados en Mistral-Large. Mistral-Large es un transformer denso (no MoE) con 123 B parámetros y atención de ventana deslizante, pero no se confirma que el merge conserve exactamente esas características. El proceso de creación consistió en una interpolación esférica (slerp) entre Behemoth 1.2 y Tess, y otra entre Behemoth 1.2 y Magnum, combinando después los resultados. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La versión GGUF fue generada con iMatrix, un método de cuantización que optimiza la matriz de importancia para reducir la pérdida de calidad.

## Capacidades

- Generación de texto y chat conversacional en inglés.
- Razonamiento y comprensión de instrucciones, heredado de los modelos base (Mistral-Large, Behemoth, Tess, Magnum).
- No se especifica soporte para tool calling, function calling, agentes, visión o audio.
- Capacidades multilingües limitadas al inglés (según la etiqueta de idioma).
- No se indica soporte para modo de pensamiento extendido (thinking mode).

## Casos de uso

- Asistente de chat general: el modelo puede mantener conversaciones multi-turno en inglés, aunque no se conoce la longitud de contexto exacta, por lo que se recomienda probar con ventanas cortas.
- Generación de texto creativo: al ser un merge de modelos orientados a narrativa (Magnum, Tess), puede utilizarse para redacción de ficción o guiones.
- Prototipado de aplicaciones de texto: gracias a su formato GGUF, se puede desplegar localmente con llama.cpp u Ollama para experimentar sin depender de APIs externas.
- Investigación sobre merges de modelos: útil para estudiar cómo la interpolación esférica afecta al comportamiento de modelos grandes.
- Fine-tuning posterior: aunque no se documenta, al ser un modelo abierto (con licencia mrl) podría servir como base para ajustes específicos, siempre que la licencia lo permita.
- Evaluación de calidad de cuantización: los archivos iMatrix GGUF permiten comparar la degradación de rendimiento entre distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- El repositorio GGUF ocupa 447,8 GB, lo que indica que incluye múltiples cuantizaciones (probablemente desde Q2 hasta Q8). El tamaño de cada archivo individual no se especifica.
- Para una cuantización típica de 4 bits (Q4_K_M), un modelo de 123 B requiere aproximadamente 70-80 GB de VRAM, lo que excede la capacidad de GPUs de consumo como la RTX 4090 (24 GB). Se necesitarían GPUs profesionales como A100 (80 GB) o H100 (80 GB), o bien usar CPU con suficiente RAM.
- Con cuantizaciones más agresivas (Q2_K o Q3_K) podría caber en una GPU de 48 GB (como A6000 o RTX 6000 Ada), pero con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles. Para un modelo de este tamaño, se espera una generación de unos 10-20 tokens/s en una A100 con cuantización 4 bits, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base es Mistral-Large, pero no se conocen los resultados de Monstral-123B-v2 frente a otros modelos de 123 B como Mixtral 8x22B (aunque este es MoE) o Llama 3.1 70B. Se recomienda consultar benchmarks independientes si se publican en el futuro.

## Limitaciones y advertencias

- Licencia mrl: es una licencia personalizada no estándar. No se especifican los términos exactos, por lo que se debe contactar con el autor antes de usar el modelo en producción comercial.
- Sesgos: al ser un merge de modelos entrenados con datos de internet, puede heredar sesgos sociales, culturales y de género. No se ha realizado una evaluación de sesgos.
- Alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Idioma: solo se declara soporte para inglés. El rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Contexto: no se conoce la longitud máxima de contexto. Se recomienda no superar 4K tokens hasta verificar el comportamiento.
- Reproducibilidad: al ser un merge, no hay documentación sobre el proceso exacto de entrenamiento, lo que dificulta la depuración de comportamientos inesperados.
- Soporte comunitario: el modelo tiene muy poca actividad (63 descargas, 3 likes), por lo que el soporte y las actualizaciones son limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MarsupialAI/Monstral-123B-v2_GGUF
- Modelo base (safetensors): https://huggingface.co/MarsupialAI/Monstral-123B-v2
- Entrada en LLM Index: https://llmindex.net/models/monstral-123b-v2
- Catálogo de Microsoft Foundry (referencia): https://ai.azure.com/catalog/models/marsupialai-monstral-123b
