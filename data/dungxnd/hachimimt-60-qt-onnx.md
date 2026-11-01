# dungxnd/HachimiMT-60-QT-ONNX

## Resumen

HachimiMT-60-QT-ONNX es una exportación a ONNX Runtime del modelo de traducción automática HachimiMT-60-QT, desarrollado originalmente por ngocdang83 y exportado por dungxnd. Se trata de un modelo MarianMT especializado en traducción de chino (zh) a vietnamita (vi), pensado para inferencia eficiente en dispositivos de gama alta y entornos con recursos limitados. El repositorio incluye tres precisiones distintas (fp16, q16 y q8) con grafos ONNX separados para el codificador, el primer paso de decodificación y los pasos posteriores con caché KV.

La innovación principal de esta exportación no reside en el modelo base, sino en el trabajo de ingeniería aplicado sobre él: se ha recortado el vocabulario de salida de 24.000 a 5.951 entradas (mediante un mapa `keep_ids`), se ha implementado una caché KV real con cuatro tensores por capa (`self_k`, `self_v`, `cross_k`, `cross_v`) y se han generado tres variantes de precisión optimizadas para CPU. El resultado es un paquete de 0,5 GB que prioriza el rendimiento en inferencia sobre dispositivo, con métricas medidas en un Snapdragon 8 Gen 3.

El modelo es relevante para desarrolladores que necesiten integrar traducción zh→vi en aplicaciones móviles, sistemas embebidos o pipelines ligeros donde no sea viable desplegar un transformer completo en fp32. La licencia CC-BY-4.0 permite uso comercial con atribución, y el formato ONNX facilita el despliegue con ONNX Runtime en múltiples plataformas sin dependencia de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, q16, q8 (int8) |
| Idiomas soportados | chino (zh), vietnamita (vi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura de traducción automática neuronal desarrollada por Microsoft Research y ampliamente utilizada en la familia Helsinki-NLP. Se trata de un transformer encoder-decoder estándar con atención multi-cabeza, orientado específicamente a traducción. La información disponible no detalla el número de capas, dimensión oculta, número de cabezas ni el volumen de tokens de entrenamiento del modelo original. Tampoco se especifica si hubo fases de RLHF o DPO; en modelos MarianMT típicos el entrenamiento es supervisado sobre corpus paralelos.

La exportación a ONNX introduce varias modificaciones técnicas relevantes. En primer lugar, el vocabulario de salida se ha recortado de 24.000 a 5.951 entradas, lo que reduce el tamaño de la capa de salida y acelera el argmax. En segundo lugar, se ha implementado una caché KV explícita con cuatro tensores por capa, separando las claves y valores de self-attention y cross-attention. En tercer lugar, se ofrecen tres precisiones: fp16 (204 MB), q16 (166 MB) y q8 (124 MB). Según el autor, la decodificación está limitada por ancho de banda de memoria, por lo que los pesos int8 reducen los bytes leídos por token y explican que q8 sea más rápido en CPU que fp16, pese a la pérdida de calidad.

## Capacidades

- Traducción de texto de chino a vietnamita, tarea única para la que fue entrenado el modelo.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Tres niveles de precisión seleccionables según el compromiso calidad/rendimiento deseado.
- Caché KV real para decodificación autorregresiva eficiente paso a paso.
- Vocabulario de salida recortado que reduce el coste computacional por token generado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo thinking.
- Multilingüismo limitado exclusivamente al par zh→vi.

## Casos de uso

- Traducción de documentación técnica zh→vi en herramientas de escritorio: el paquete ONNX de 124 MB (q8) puede integrarse en una aplicación de escritorio o lector de documentos para traducir manuales y guías sin conexión, con una latencia de 939 caracteres por segundo en CPU móvil.
- Aplicaciones móviles de traducción offline: la variante q8, con 124 MB y un 25 % menos de CPU y 50 MB menos de RAM que fp16, es adecuada para apps Android o iOS que necesiten traducir texto chino a vietnamita sin conexión a internet, usando ONNX Runtime Mobile.
- Procesamiento por lotes de subtítulos o novelas ligeras: el modelo está etiquetado con el tag `vbook`, lo que sugiere su uso en pipelines de traducción de libros y contenido editorial. La caché KV permite procesar secuencias largas de forma eficiente en CPU.
- Preprocesamiento en pipelines de datos multilingües: para equipos que construyan corpus paralelos zh→vi, el modelo puede generar traducciones automáticas de grandes volúmenes de texto en servidores sin GPU, reduciendo costes frente a alternativas basadas en modelos grandes.
- Integración en sistemas de atención al cliente para mercados vietnamitas: traducción en tiempo real de mensajes entrantes en chino a vietnamita en un backend ligero, con la variante fp16 si se prioriza la calidad máxima (chrF 100 respecto a la referencia fp32).
- Traducción en dispositivos embebidos o IoT: el formato ONNX y las variantes cuantizadas permiten desplegar el modelo en hardware con recursos limitados, como Raspberry Pi o placas ARM, donde un transformer completo en PyTorch no sería viable.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye métricas chrF por precisión, lo que lo convierte en un caso de estudio útil para investigar el impacto de int8 en tareas de traducción.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas de la exportación ONNX medidas en un Snapdragon 8 Gen 3 (CPU, caché desactivada), comparadas contra la propia exportación fp32 del modelo:

| Precision | Tamano | chrF vs fp32 | Velocidad | CPU | Memoria |
|---|---:|---:|---:|---:|---:|
| fp16 | 204 MB | 100,00 | 805 c/s | baseline | baseline |
| q16 | 166 MB | 98,01 | 393 c/s | mas lento | no disponible |
| q8 | 124 MB | 96,25 | 939 c/s | −25 % | −50 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU) en la información disponible. Las cifras chrF miden similitud con la salida fp32 del propio modelo, no calidad absoluta de traducción.

## Requisitos de hardware

- VRAM: no aplica, el modelo está diseñado para inferencia en CPU; en GPU requeriría menos de 1 GB en cualquiera de las precisiones.
- GPU recomendadas: no es el caso de uso principal; cualquier GPU con más de 1 GB de VRAM puede ejecutarlo vía ONNX Runtime con provider CUDA.
- CPU: validado en Snapdragon 8 Gen 3; funciona en cualquier CPU x86-64 o ARM con ONNX Runtime.
- Cabe en cualquier dispositivo consumer: 124 MB (q8), 166 MB (q16) y 204 MB (fp16) en disco; el consumo de RAM es inferior a 500 MB en todos los casos.
- Despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript, Mobile). No se proporcionan pesos en formato GGUF, safetensors ni scripts para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 939 caracteres/s (q8), 805 c/s (fp16) y 393 c/s (q16) en Snapdragon 8 Gen 3 con caché desactivada. La decodificación está limitada por ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| HachimiMT-60-QT-ONNX | no disponible | no disponible | zh→vi | CC-BY-4.0 | ONNX | Exportación optimizada, 3 precisiones, vocabulario recortado |
| Helsinki-NLP/opus-mt-zh-vi | no disponible | no disponible | zh→vi | CC-BY-4.0 | safetensors, PyTorch | MarianMT original de referencia, sin optimización ONNX |
| VinAI PhoMT | no disponible | no disponible | vi↔en, vi↔zh | no disponible | PyTorch | Modelo vietnamita de traducción, orientado a investigación |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas | CC-BY-NC-4.0 | safetensors, PyTorch | Multilingüe, mayor tamaño, licencia no comercial |

La comparación directa con estos modelos no está respaldada por benchmarks publicados en la información disponible; las diferencias de licencia y formato son los criterios más objetivos para la elección.

## Limitaciones y advertencias

- El modelo solo traduce de chino a vietnamita; no soporta otras direcciones ni otros pares de idiomas.
- El vocabulario de salida está recortado a 5.951 entradas: es obligatorio mapear el índice con `keep_ids` de `trim_meta.json` antes de decodificar, o la salida será fluida pero semánticamente incorrecta.
- Es necesario añadir el token `</s>` al final de la entrada codificada; omitirlo altera la traducción.
- Los tres grafos ONNX son obligatorios: `decoder_model.onnx` solo decodifica el primer token y `decoder_with_past_model.onnx` gestiona el resto con caché KV.
- La cuantización q8 pierde aproximadamente 4 puntos chrF respecto a fp32; q16 pierde unos 2 puntos y además es más lento que fp16 en el hardware medido.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez en dominios específicos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se hereda del modelo base; conviene verificar los términos del repositorio original.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No hay información sobre la longitud máxima de contexto soportada, lo que supone un riesgo para textos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dungxnd/HachimiMT-60-QT-ONNX
- Modelo base: https://huggingface.co/ngocdang83/HachimiMT-60-QT
- Perfil del autor de la exportación: https://huggingface.co/ngocdang83
- Repositorio del proyecto VBookMT: https://github.com/DungxND/VBookMT
