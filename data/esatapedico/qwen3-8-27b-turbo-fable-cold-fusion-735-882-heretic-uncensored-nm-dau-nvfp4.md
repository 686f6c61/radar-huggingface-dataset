# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario esatapedico en Hugging Face. Se trata de una conversión de pesos de un modelo de 27.781 millones de parámetros derivado de la familia Qwen3.8, con arquitectura híbrida GatedDeltaNet de 64 capas y una ventana de contexto declarada de 262.144 tokens. El objetivo de esta variante es reducir el peso en memoria del modelo manteniendo gran parte de la pila en BF16, de modo que pueda desplegarse en GPUs Blackwell con soporte nativo de NVFP4.

La cuantización aplicada es W4A16 con escalas FP8 E4M3, tamaño de grupo 16 y solo pesos (weight only), sin datos de calibración. Las capas lineales de MLP en las 64 capas y las proyecciones Q, K, V y O de las 16 capas de atención completa se almacenan en NVFP4, mientras que la torre de visión, la ruta de atención lineal (DeltaNet), las embeddings, el lm_head y la cabeza MTP se mantienen en BF16. El checkpoint ocupa aproximadamente 26 GB en un único archivo safetensors.

El modelo es relevante porque combina tres elementos poco habituales en un mismo artefacto: una arquitectura híbrida con atención lineal y MTP (multi-token prediction) para decodificación especulativa, una cuantización de 4 bits orientada a hardware Blackwell y un ajuste declarado como "uncensored" y "heretic" por el autor del modelo base. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque con las advertencias propias de un modelo derivado con múltiples capas de modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet (atención lineal + atención completa), clase `Qwen3_5ForCausalLM` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A16, grupo 16, escalas FP8 E4M3, weight only; capas en BF16 para visión, atención lineal, embeddings, lm_head y MTP |
| Idiomas soportados | inglés y multilingüe (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`); existe familia GGUF separada con 8 niveles |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas que combina capas de atención completa con capas de atención lineal basadas en GatedDeltaNet. De las 64 capas, 16 son de atención completa y el resto emplean la ruta lineal. Incluye una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, y una torre de visión que lo convierte en un modelo image-text-to-text. El contexto declarado es de 262.144 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original Qwen3.8-27B ni en los ajustes posteriores de DavidAU. La model card del checkpoint cuantizado no documenta el proceso de entrenamiento, solo el de conversión. La cuantización NVFP4 se realizó sin datos de calibración, aplicando el patrón habitual del autor para otras builds de Qwen3.8 Cold Fusion: MLP de las 64 capas y Q/K/V/O de las 16 capas de atención completa en NVFP4, y el resto de componentes en BF16. La ruta DeltaNet se normaliza a NVFP4 únicamente en las builds GGUF, no en este checkpoint.

## Capacidades

- Generación de texto conversacional y multilingüe, con etiquetas que declaran inglés y soporte multilingüe.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión conservada en BF16.
- Razonamiento multi-paso y conversaciones multi-turno con contexto muy largo (262.144 tokens).
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio.
- Ajuste declarado como "uncensored" y "heretic" por el autor del modelo base, orientado a reducir rechazos en la generación.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos en una sola pasada sin fragmentación, lo que simplifica pipelines de extracción y resumen.
- Procesamiento de documentos escaneados con visión: la torre de visión en BF16 permite extraer texto e información estructurada de imágenes y PDFs renderizados, combinando OCR implícito con razonamiento sobre el contenido.
- Asistentes conversacionales de dominio acotado: el ajuste "uncensored" reduce las negativas automáticas en dominios sensibles como seguridad, medicina legal o ficción adulta, donde los filtros por defecto resultan un obstáculo.
- Despliegue en GPUs Blackwell: al ser NVFP4 nativo, aprovecha los tensor cores de FP4 de las RTX 50xx y B200 para reducir el coste por token frente a un BF16 equivalente.
- Generación especulativa de bajo coste: la cabeza MTP permite decodificación especulativa, útil en servicios de generación interactiva donde la latencia por token es crítica.
- Investigación sobre cuantización: sirve como caso de estudio de cuantización W4A16 sin calibración sobre una arquitectura híbrida, comparando la degradación frente al modelo base en BF16.
- Prototipado multimodal en una sola GPU: los ~26 GB del checkpoint permiten cargar el modelo completo en una GPU de 32 GB o superior, evitando sharding multi-GPU para pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa aproximadamente 26 GB en safetensors; en inferencia se necesita espacio adicional para el KV cache y activaciones, por lo que se recomienda un mínimo de 32 GB de VRAM para contextos moderados.
- GPUs recomendadas: Blackwell con soporte NVFP4 nativo (RTX 50xx, B200, GB200). En arquitecturas anteriores (Hopper, Ada) el formato puede requerir de-cuantización o no estar soportado por el kernel.
- Cabe en consumer GPU: sí, en RTX 5090 (32 GB) y modelos con 32 GB o más, siempre que el runtime soporte NVFP4. En GPUs de 24 GB no cabe el checkpoint completo en BF16/NVFP4 sin offloading.
- Opciones de despliegue: transformers con `compressed-tensors`, y presumiblemente vLLM y TGI si soportan `nvfp4-pack-quantized`; existe una familia GGUF separada para llama.cpp y Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 27,78 B | 262.144 | NVFP4 W4A16 + BF16 parcial | Apache 2.0 | Requiere hardware Blackwell para NVFP4 nativo |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,78 B | 262.144 | BF16 (presumiblemente) | Apache 2.0 | Modelo base sin cuantizar; mayor VRAM |
| Qwen/Qwen3.8-27B | 27,78 B | no disponible | BF16 | Apache 2.0 | Modelo original sin ajustes "uncensored" ni MTP declarado |

## Limitaciones y advertencias

- El ajuste "uncensored" y "heretic" implica que el modelo puede generar contenido que los modelos alineados rechazarían; requiere moderación externa en producción.
- La cuantización NVFP4 se realizó sin calibración, lo que puede degradar la calidad en tareas sensibles a la precisión numérica respecto al modelo en BF16.
- La ruta DeltaNet se mantiene en BF16 en este checkpoint, pero se normaliza a NVFP4 en las builds GGUF; el comportamiento puede diferir entre ambas familias.
- El soporte de NVFP4 depende del runtime y del hardware; en GPUs no Blackwell el modelo puede no cargar o degradarse.
- El modelo acumula múltiples capas de derivación (Qwen3.8-27B → ajuste DavidAU → cuantización esatapedico), lo que dificulta atribuir comportamientos concretos a una fase del pipeline.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base ni del ajuste.
- La model card indica que fue escrita con asistencia de IA y no documenta el proceso de entrenamiento ni datos de evaluación.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" puede conllevar obligaciones legales adicionales según la jurisdicción.

## Enlaces

- Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Familia GGUF: esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Modelo original: Qwen/Qwen3.8-27B
- Sitio del autor: https://www.esatapedico.com
