# aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF

## Resumen

Gemma-SEA-LION-v4-27B-IT-GGUF es la versión cuantizada en formato GGUF del modelo Gemma-SEA-LION-v4-27B-IT, desarrollado por el AI Products Pillar de AI Singapore. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos de lenguaje grandes preentrenados y ajustados por instrucciones específicamente para la región del Sudeste Asiático. El modelo base parte de Gemma 3 27B Instruct de Google y ha sido sometido a un preentrenamiento continuado con aproximadamente 500 mil millones de tokens en 11 idiomas de la región, lo que le permite destacar en tareas en birmano, jemer, lao, tailandés, vietnamita, indonesio, malayo, tagalo, tamil, mandarín e inglés.

La versión GGUF reduce los requisitos de memoria manteniendo la calidad, y según sus desarrolladores puede ejecutarse en un portátil con 16 GB de memoria mediante Ollama. Hereda de Gemma 3 capacidades como una ventana de contexto de 128 000 tokens, comprensión de imágenes y texto, function calling y salidas estructuradas. Con 27 000 millones de parámetros, se posiciona como una alternativa competitiva frente a modelos cerrados de mayor tamaño en tareas específicas del Sudeste Asiático, según las afirmaciones de sus autores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 27B Instruct |
| Parametros totales | 27 009 346 304 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (GGUF) |
| Idiomas soportados | Birmano, ingles, indonesio, jemer, lao, malayo, mandarin, tagalo, tamil, tailandes y vietnamita |
| Licencia | Gemma Terms of Use (Google) |
| Formato de pesos | GGUF (incluye archivo mmproj para vision) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 27B Instruct, un transformer decoder-only con atención global y ventana de contexto de 128 000 tokens. Sobre esta base, AI Singapore realizó un preentrenamiento continuado con aproximadamente 500 000 millones de tokens muestreados de un depósito de más de un billón de tokens, compuesto por datos web, código, conjuntos de datos de código abierto y datos generados sintéticamente en los 11 idiomas objetivo. Posteriormente se aplicó un ajuste por instrucciones (instruct-tuning) para producir la variante IT. No se especifica si se utilizaron técnicas como RLHF o DPO. El tokenizador es el mismo que el de Gemma 3 27B Instruct. La cuantización a GGUF se realizó sobre el modelo IT, generando variantes Q4_K_M, Q8_0 y BF16, además de un proyector multimodal (mmproj) para entrada de imágenes.

## Capacidades

- Generación de texto multilingüe con especialización en idiomas del Sudeste Asiático (birmano, jemer, lao, tailandés, vietnamita, indonesio, malayo, tagalo, tamil, mandarín e inglés).
- Comprensión de imágenes y documentos, incluyendo preguntas visuales, comprensión de documentos y razonamiento basado en imágenes (heredado de Gemma 3).
- Function calling y salidas estructuradas, lo que permite integración en sistemas más grandes y flujos de trabajo automatizados.
- Razonamiento multi-step y soporte para agentes gracias a la combinación de function calling y contexto largo.
- Ventana de contexto de 128 000 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidad de ejecución en hardware de consumo mediante cuantización GGUF, compatible con llama.cpp, Ollama y vLLM.

## Casos de uso

- Atención al cliente automatizada en idiomas del Sudeste Asiático: el modelo puede gestionar conversaciones multi-turno en tailandés, vietnamita o indonesio con contexto largo, reduciendo la necesidad de agentes humanos en empresas regionales.
- Traducción automática entre idiomas de la región: su entrenamiento específico en 11 lenguas permite traducciones más precisas que modelos genéricos, útil para plataformas de comercio electrónico y servicios gubernamentales.
- Análisis de documentos con imágenes: gracias a su capacidad multimodal, puede extraer información de facturas, formularios y documentos escaneados en idiomas locales, facilitando la digitalización de procesos administrativos.
- Generación de código con integración en pipelines de CI/CD: soporta function calling y salidas estructuradas, por lo que puede utilizarse como asistente de programación o para automatizar tareas de desarrollo en entornos con infraestructura local.
- Asistentes virtuales multilingües para dispositivos de bajo consumo: la versión Q4_K_M permite desplegar un asistente en un portátil con 16 GB de RAM, ideal para entornos educativos o pequeñas empresas sin acceso a GPUs dedicadas.
- Procesamiento de contenido local: resumen, extracción de entidades y clasificación de noticias o publicaciones en redes sociales en idiomas como jemer, lao o birmano, donde los modelos genéricos suelen fallar.
- Búsqueda semántica en corpus multilingües: su contexto de 128K y conocimiento de idiomas regionales permiten indexar y recuperar información en archivos extensos mezclando varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card afirma que, a fecha de 25 de agosto de 2025, el modelo "destaca en tareas del Sudeste Asiático en comparación con otros modelos abiertos de menos de 200 mil millones de parámetros" y que su rendimiento es comparable al de modelos cerrados más grandes, pero no se proporcionan cifras concretas. Los únicos datos de rendimiento disponibles son los relativos a la inferencia con diferentes cuantizaciones, medidos en una GPU NVIDIA H100 con vLLM y llama.cpp:

| Variante cuantizada | Tamano del modelo (GB) | VRAM requerida (GB) | Tiempo hasta primer token (s) | Tokens por segundo |
|---|---|---|---|---|
| BF16 | 54,0 | 71,1 | 2,03 | 41,5 |
| Q8_0 | 28,7 | 47,0 | 3,18 | 37,0 |
| Q4_K_M | 16,5 | 35,5 | 2,65 | 59,9 |

Nota: los valores de TTFT y tokens por segundo se midieron con vLLM en localhost con concurrencia 1, entrada de 4K tokens y salida de 1K tokens, como mediana de 10 peticiones.

## Requisitos de hardware

- VRAM estimada para inferencia: 35,5 GB para Q4_K_M, 47 GB para Q8_0 y 71,1 GB para BF16, según las pruebas con offload completo a GPU en una H100.
- GPU recomendadas: para offload completo se necesitan GPUs con al menos 36 GB de VRAM, como NVIDIA A6000 (48 GB), A100 (40/80 GB) o H100 (80 GB). En GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) no cabe el modelo completo, pero se puede ejecutar con offloading parcial a CPU mediante llama.cpp u Ollama.
- La model card indica que el modelo puede ejecutarse en un portátil con 16 GB de memoria usando Ollama, lo que implica una combinación de cuantización y offloading a CPU/RAM.
- Opciones de despliegue: llama.cpp (incluido llama-gemma3-cli para entrada de imágenes), Ollama, vLLM (usado en las pruebas de rendimiento) y cualquier motor compatible con GGUF.
- Latencia y throughput: según la tabla anterior, entre 37 y 60 tokens por segundo en H100 dependiendo de la cuantización, con tiempos hasta el primer token de 2 a 3 segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. La model card afirma que el modelo supera a otros modelos abiertos de menos de 200 mil millones de parámetros en tareas del Sudeste Asiático, y que su rendimiento es comparable al de modelos cerrados más grandes, pero no se ofrecen nombres concretos ni cifras. Como referencia cualitativa, los principales competidores en el ámbito de modelos multilingües para el Sudeste Asiático incluyen SeaLLM (basado en Qwen y Llama), Qwen2.5 (con soporte multilingüe amplio) y los propios Gemma 3 de Google. Sin embargo, al no existir benchmarks públicos en la información disponible, no es posible realizar una comparación numérica rigurosa.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad. La model card indica explícitamente que no se ha realizado fine-tuning de seguridad y que los desarrolladores deben aplicar sus propias medidas de seguridad antes de su uso en producción.
- No se ha probado la robustez frente a ataques adversarios, por lo que puede ser vulnerable a entradas maliciosas.
- Al estar entrenado principalmente en 11 idiomas del Sudeste Asiático, su rendimiento en otros idiomas puede ser inferior al de modelos multilingües genéricos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de generación libre o cuando se le pide información factual fuera de su dominio de entrenamiento.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y de redistribución; es necesario revisar los términos completos de Google antes de su implementación en productos comerciales.
- El modelo no ha sido evaluado en tareas de seguridad ni en escenarios de alto riesgo; su uso en aplicaciones sensibles requiere validación adicional.

## Enlaces

- [HuggingFace - Gemma-SEA-LION-v4-27B-IT-GGUF](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-GGUF)
- [HuggingFace - Gemma-SEA-LION-v4-27B-IT (modelo base)](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT)
- [HuggingFace - Gemma-SEA-LION-v4-27B (modelo sin instruct)](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B)
- [Documentación oficial SEA-LION](https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-27b)
- [HuggingFace - Variante NVFP4](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT-NVFP4)
