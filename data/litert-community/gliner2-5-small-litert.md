# litert-community/GLiNER2.5-Small-LiteRT

## Resumen

GLiNER2.5-Small-LiteRT es una conversión optimizada del modelo fastino/gliner2.5-small-v1 al formato LiteRT (antes TensorFlow Lite) de Google, publicada por la comunidad litert-community. Su propósito es ejecutar extracción de entidades nombradas (NER) y extracción de información estructurada directamente en el GPU de un teléfono Android, sin depender de la nube. El modelo base GLiNER2.5 Small es un extractor de spans guiado por esquema (schema-guided), construido sobre un encoder DeBERTa-v3-xsmall, que permite definir las etiquetas de entidad en tiempo de inferencia mediante un prompt de esquema en lugar de tenerlas fijas en el entrenamiento.

La relevancia de esta ficha radica en que demuestra una ruta viable de despliegue on-device para NER de calidad: en 70 entradas en inglés, los spans extraídos coinciden exactamente con la implementación oficial gliner2 en fp32 sobre CPU (micro-F1 de 1.000 por etiqueta y por offsets de carácter) en todas las ventanas publicadas. La configuración validada es LiteRT 2.2.0 con computación GPU FP32 explícita sobre un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16); otras familias de GPU Android no han sido validadas.

El paquete incluye tres tamaños de ventana codificada (128, 256 y 512 tokens) en dos variantes de pesos (wfp16 y fp32), junto con los activos de host necesarios: tabla de embeddings de palabras, decoder disperso, tokenizador, contratos de grafo y un runtime Python de referencia. El modelo trabaja con un conjunto fijo de cinco etiquetas (`person, organization, location, product, date`) y textos en inglés que quepan en una sola ventana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-xsmall con boundary encoder, boundary query head y proyecciones por token (parte densa del BoundaryExtractor de GLiNER2) |
| Parametros totales | no disponible (el repo ocupa 0,7 GB, incluyendo tabla de embeddings de 128.011 x 384 en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas codificadas de 128, 256 o 512 tokens; límite de palabras de texto de 48, 192 o 384 respectivamente |
| Tipos de cuantizacion | wfp16 (pesos de las 96 capas FULLY_CONNECTED en float16 con DEQUANTIZE a float32; activaciones en float32) y fp32; no se publican variantes INT8 (fallo de compilación en LiteRT 2.2.0 GPU) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT); activos auxiliares en safetensors (decoder disperso) y binario fp32 (embeddings) |

## Arquitectura y entrenamiento

El grafo exportado corresponde a la parte densa del BoundaryExtractor de GLiNER2: el encoder DeBERTa-v3-xsmall, el boundary encoder, la boundary query head y las proyecciones por token. El grafo recibe como entrada las filas de embeddings de palabras y devuelve un único tensor float32 empaquetado con 17 salidas lógicas. El host realiza la búsqueda de embeddings de tokens antes del grafo y, después, el pooling disperso de candidatos, el scoring y la decodificación de spans del pipeline upstream. Esta separación permite mantener el grafo pequeño y reutilizar el decoder oficial.

Los archivos wfp16 almacenan los 96 tensores FULLY_CONNECTED como float16 con una operación DEQUANTIZE a float32, mientras que todas las activaciones y el resto de constantes permanecen en float32; los archivos fp32 son los mismos grafos con pesos en float32. La conversión se realizó mediante Google LiteRT Torch. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esos detalles corresponden a la model card de fastino/gliner2.5-small-v1, no incluida en la información proporcionada.

## Capacidades

- Extracción de entidades nombradas (NER) guiada por esquema: las etiquetas se definen en un prompt de esquema, aunque en esta conversión validada el conjunto es fijo (`person, organization, location, product, date`).
- Extracción de información estructurada a partir de texto libre en inglés, devolviendo spans con offsets de carácter y confianza.
- Clasificación de tokens y decodificación de spans con coincidencia exacta respecto a la implementación fp32 de referencia en CPU.
- Ejecución on-device en GPU Android mediante LiteRT CompiledModel, con opción de ejecución en CPU (el ejemplo de Python usa CPU con 4 hilos).
- Procesamiento de un único texto por inferencia, limitado a una ventana (48, 192 o 384 palabras según el archivo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de contactos y organizaciones en aplicaciones móviles: procesar notas, correos o mensajes en el propio dispositivo con el modelo s128 (48 palabras), evitando enviar datos personales a servidores externos y cumpliendo requisitos de privacidad.
- Anonimización o enmascarado de PII en el borde: detectar personas, organizaciones y ubicaciones en texto antes de registrarlo o sincronizarlo, usando los offsets de carácter para sustituir los spans.
- Indexación y etiquetado de documentos escaneados o transcritos: el modelo s512 (384 palabras) permite procesar párrafos completos y asociar entidades a fechas y productos para motores de búsqueda locales.
- Asistentes de agenda y recordatorios: extraer fechas, personas y lugares de una frase dictada para crear eventos o recordatorios sin conexión.
- Procesamiento de reseñas y feedback de producto: identificar productos, organizaciones y fechas en comentarios de usuarios en el dispositivo, agregando resultados localmente antes de enviar métricas anonimizadas.
- Filtrado previo en pipelines de extracción en servidor: usar el modelo LiteRT como primera etapa de bajo coste en dispositivos o en el borde para descartar texto sin entidades antes de invocar modelos mayores.
- Demostraciones y pruebas de concepto de NER on-device: el runtime Python incluido y el ejemplo trabajado permiten validar la integración en escritorio antes de portar a Android.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Micro-F1 por etiqueta y offsets de carácter | 1.000 | 70 entradas en inglés, comparado con gliner2 fp32 CPU, en todas las ventanas publicadas |
| Latencia | no disponible | no se publican tiempos de inferencia |
| Throughput | no disponible | no se publican medidas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal (ejecución en GPU móvil o CPU). En escritorio, el grafo s128 ocupa unos 54 MB (wfp16) o 98 MB (fp32); s256, unos 64 MB o 108 MB; s512, unos 84 MB o 128 MB. A ello se suma la tabla de embeddings de 196,6 MB en fp32, compartida por todas las ventanas.
- GPU recomendadas: la configuración validada es un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y GPU FP32 explícita. Otras familias de GPU Android no han sido validadas.
- GPU de escritorio: no se especifican modelos concretos (A100, H100, RTX 4090); el ejemplo de Python se ejecuta en CPU de escritorio con 4 hilos.
- Cabe en GPU de consumo: sí, por tamaño de los grafos, aunque no se documenta validación en tarjetas gráficas de consumo.
- Opciones de despliegue: LiteRT CompiledModel (Python y Android), con aceleradores CPU y GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.
- Nota crítica: con la precisión GPU por defecto del runtime, la salida del encoder es NaN desde la primera salida lógica; es obligatorio usar la opción de computación FP32 explícita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLiNER2.5-Small-LiteRT (este) | no disponible (DeBERTa-v3-xsmall) | ventanas de 128/256/512 tokens | TFLite (LiteRT) | Apache 2.0 | Optimizado para GPU Android; etiquetas fijas en la versión validada; solo inglés |
| fastino/gliner2.5-small-v1 | no disponible (DeBERTa-v3-xsmall) | no disponible | safetensors (checkpoint original) | no disponible en la información | Modelo base; pipeline completo en PyTorch; referencia fp32 CPU |
| fastino/gliner2.5 (otras variantes de la familia) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de NER on-device de otros autores.

## Limitaciones y advertencias

- El conjunto de etiquetas está fijo en `person, organization, location, product, date`; otros esquemas no han sido validados en esta conversión.
- Solo se ha validado inglés; otros idiomas quedan fuera del alcance declarado.
- Cada inferencia procesa un único texto que debe caber en una ventana (48, 192 o 384 palabras según el archivo); textos más largos requieren troceado por parte del host.
- La única configuración Android validada es LiteRT 2.2.0 con GPU FP32 explícita en un Samsung Galaxy S26; otras GPU Android no han sido probadas.
- Con la precisión GPU por defecto se producen NaN; es imprescindible activar la computación FP32 explícita.
- No se publican variantes INT8: los intentos de compilación en LiteRT 2.2.0 GPU fallan con el error "Unable to parse bc coord for BATCH axis" de ML Drift.
- La ejecución en NPU no fue evaluada.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un extractor de spans, el riesgo principal es la extracción de entidades espurias o la omisión de entidades fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base fastino/gliner2.5-small-v1, no incluida en la información proporcionada.
- El pipeline completo depende del paquete `gliner2` 2.0.0 fijado para el decoder disperso, lo que introduce una dependencia externa en el host.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/GLiNER2.5-Small-LiteRT
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
- LiteRT (Google): no se proporciona URL específica en la información disponible
- Repositorio de código, blog o demo: no disponible en la información proporcionada
