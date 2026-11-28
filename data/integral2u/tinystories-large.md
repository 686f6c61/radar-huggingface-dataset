# integral2u/tinystories-large

## Resumen

`integral2u/tinystories-large` es un modelo de generación de texto de arquitectura GPT-2 exportado desde SharpMind Studio y publicado en Hugging Face por el usuario `integral2u`. Se trata de un artefacto de entrenamiento de escala muy reducida: 1.055.360 parámetros totales, 4 capas, dimensión oculta de 128 y una ventana de contexto de solo 256 tokens. El repositorio contiene pesos en formato GGUF (cuantización Q8_0) y está etiquetado con la librería `sharpmind`, además de los tags `sharp-mind`, `smm`, `gguf` y `text-generation`.

El modelo no es un asistente de propósito general. La propia model card lo describe como "un artefacto entrenado, no un asistente generalista" y advierte de que hay que revisar las salidas antes de confiar en ellas. Su nombre remite a TinyStories, el corpus de cuentos sintéticos simples empleado habitualmente para estudiar el aprendizaje de capacidades lingüísticas en modelos pequeños, aunque no se aporta confirmación explícita de que el dataset de entrenamiento sea ese corpus.

Su relevancia práctica es limitada: con 1,06 M de parámetros y 256 tokens de contexto no compite con modelos de producción. Resulta útil como pieza didáctica, como banco de pruebas de runtimes GGUF o como ejemplo mínimo de pipeline de exportación desde SharpMind Studio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 1.055.360 (1,06 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Q8_0 (F16 tambien presente en los tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`tinystories-large_Q8_0.gguf`) |
| Dimension oculta | 128 |
| Capas | 4 |
| Cabezas de atencion | 8 |
| Cabezas KV | 8 |
| Ancho de FFN | 512 |
| Vocabulario | 2048 tokens |
| Libreria | sharpmind |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 4 capas, dimensión oculta de 128, 8 cabezas de atención (8 cabezas KV, es decir, sin GQA) y ancho de FFN de 512. El vocabulario es de 2.048 tokens, muy por debajo de los 50.257 del GPT-2 original, lo que sugiere un tokenizador propio o reducido orientado al corpus de entrenamiento. La ventana de contexto es de 256 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card incluye un bloque de procedencia con un hash de dataset (`D3ABCCBC...`), la receta `tinystories-large`, la herramienta `1.1.0.0` y un repositorio de origen `pixelwhipped/tinystories-large`, pero no se detalla el contenido del dataset ni el proceso de entrenamiento. Los tensores se distribuyen en F16 y Q8_0.

## Capacidades

- Generación de texto autoregresiva básica, limitada a secuencias de hasta 256 tokens.
- Modelado de lenguaje sobre un vocabulario reducido de 2.048 tokens, adecuado solo para dominios muy acotados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el campo de idiomas figura como no disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Carga en runtimes compatibles con GGUF (llama.cpp y aplicaciones de escritorio) y en SharpMind Studio.

## Casos de uso

- Prueba de humo de runtimes GGUF: sirve para verificar que llama.cpp u otra aplicación compatible carga correctamente un fichero GGUF Q8_0 antes de pasar a modelos mayores.
- Docencia sobre arquitecturas transformer: con 4 capas y dimensión 128, permite inspeccionar pesos y activaciones en un entorno manejable sin infraestructura GPU.
- Validación de pipelines de exportación desde SharpMind Studio: el modelo es un artefacto generado por esa herramienta y puede usarse para comprobar el flujo de exportación a GGUF y la importación del fichero `.smm`.
- Generación de texto sintético muy simple en dominios restringidos: dado su vocabulario de 2.048 tokens y su contexto de 256 tokens, solo es viable para frases o micro-relatos dentro de un dominio cerrado.
- Benchmark de latencia en CPU: al tener ~1 M de parámetros, permite medir el coste base de un runtime sin que el cómputo domine la medición.
- Reproducción de experimentos de procedencia: el hash de dataset y la receta documentados permiten trazar el origen del artefacto en auditorías internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en Q8_0 (1,06 M de parámetros a ~1 byte por parámetro, más overhead de metadatos), por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requiere GPU; cualquier iGPU o CPU moderna es suficiente.
- Cabe en consumer GPU: sí, en todas (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: llama.cpp y aplicaciones de escritorio compatibles con GGUF; SharpMind Studio para carga directa del GGUF o importación del `.smm`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 4 capas y contexto de 256 tokens se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| integral2u/tinystories-large | 1,06 M | 256 | Apache 2.0 | GGUF (Q8_0) | Artefacto de SharpMind Studio, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | safetensors, GGUF (comunidad) | Referencia histórica, ampliamente soportado |
| Modelos TinyStories de la literatura | variable (1 M - 30 M) | 256-512 | variable | safetensors | Diseñados para estudiar capacidades lingüísticas en modelos pequeños |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Escala muy reducida: 1,06 M de parámetros y 4 capas limitan severamente la coherencia y la calidad del texto generado.
- Contexto de solo 256 tokens: insuficiente para conversaciones multi-turno o documentos largos.
- Vocabulario de 2.048 tokens: cobertura léxica muy restringida, con riesgo alto de tokens desconocidos o fuera de vocabulario.
- Riesgo elevado de alucinación y de texto incoherente; la model card recomienda revisar las salidas antes de confiar en ellas.
- Sesgos conocidos: no documentados en la información disponible; al no conocerse la composición del dataset, no se pueden evaluar sesgos de dominio.
- Idiomas soportados: no disponibles; no hay evidencia de capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero la model card advierte de que hay que verificar los derechos del dataset de entrenamiento antes de un uso comercial.
- Sin tracción comunitaria: 0 descargas y 0 likes; no hay garantías de mantenimiento ni soporte.
- El repositorio declara un tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el cálculo de tamaño no se ha actualizado.

## Enlaces

- Hugging Face: https://huggingface.co/integral2u/tinystories-large
- Repositorio de origen citado en la model card: `pixelwhipped/tinystories-large` (no se proporciona URL verificable)
- SharpMind Studio: no se proporciona URL en la información disponible
- Paper de TinyStories: no se proporciona enlace en la información disponible
