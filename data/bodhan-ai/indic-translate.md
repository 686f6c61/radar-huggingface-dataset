# bodhan-ai/indic-translate

## Resumen

`bodhan-ai/indic-translate` es un modelo de traducción automática y transliteración desarrollado por Bodhan AI, obtenido mediante fine-tuning del modelo multimodal `google/gemma-4-E4B-it`. Está especializado en la traducción entre inglés y 22 lenguas de la India, incluyendo hindi, bengalí, tamil, telugu, maratí, urdu, asamés, guyaratí, canarés, malabar y lenguas de menor recursos como bodo, dogri, konkani, maithili, manipuri, santali o sánscrito. Con 7.941.106.250 parámetros según los pesos en safetensors, se distribuye bajo licencia "other" y con acceso restringido (gated) en Hugging Face.

El modelo se presenta como una solución unificada para traducción, transliteración y romanización dentro del ecosistema de lenguas índicas, aprovechando el contexto largo del modelo base y su naturaleza image-text-to-text. Esto lo hace relevante para pipelines de localización, procesamiento de documentación multilingüe y sistemas de atención al usuario en el subcontinente indio, donde la fragmentación lingüística y la escasez de modelos abiertos de calidad siguen siendo un cuello de botella.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos de Hugging Face. No se han publicado detalles sobre composición del dataset de entrenamiento, número de tokens, benchmarks ni procedimiento de alineación, por lo que esos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 7.941.106.250 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 E4B-it soporta contexto largo según los tags, sin cifra confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `google/gemma-4-E4B-it`, un transformer multimodal capaz de procesar texto e imágenes. La adaptación se ha orientado a tareas de traducción, transliteración y romanización entre inglés y lenguas índicas, según los tags del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni de innovaciones técnicas específicas introducidas en el fine-tuning.

El tamaño del repositorio (15,9 GB) es coherente con pesos en precisión completa o bf16 para un modelo de aproximadamente 8.000 millones de parámetros, sin que se hayan publicado variantes cuantizadas. Tampoco se detalla si se congelaron capas, si se aplicó LoRA o un ajuste completo, ni si se preservaron las capacidades multimodales del modelo base tras el fine-tuning.

## Capacidades

- Traducción automática entre inglés y 22 lenguas índicas, en ambos sentidos según los idiomas declarados.
- Transliteración y romanización de escrituras índicas.
- Procesamiento multilingüe con cobertura de lenguas de altos y bajos recursos (incluye bodo, dogri, konkani, maithili, manipuri, santali).
- Hereda del modelo base la modalidad image-text-to-text, aunque no se documenta si la capacidad visual se mantiene tras el fine-tuning.
- Soporte de contexto largo según los tags del modelo base, sin cifra confirmada.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Localización de productos digitales: traducción de cadenas de interfaz, documentación y contenido de marketing del inglés a hindi, bengalí, tamil y otras lenguas índicas en un único pipeline, reduciendo la necesidad de modelos separados por idioma.
- Atención al cliente en el subcontinente indio: traducción en tiempo real de conversaciones multi-turno entre agentes angloparlantes y usuarios que escriben en lenguas regionales, aprovechando la cobertura de 22 idiomas.
- Procesamiento de documentación administrativa y legal: traducción de formularios, notificaciones y textos oficiales a lenguas de bajos recursos como maithili, santali o manipuri, donde escasean soluciones abiertas.
- Normalización y romanización de nombres y direcciones: conversión de escrituras índicas a latín para sistemas de búsqueda, deduplicación de registros y pipelines de datos.
- Investigación en lingüística computacional: evaluación de transferencia multilingüe y de calidad en lenguas de bajos recursos, al ser uno de los pocos modelos abiertos que cubre ese conjunto.
- Enriquecimiento de corpus multilingües: generación de pares paralelos inglés-lengua índica para entrenar o evaluar otros sistemas de traducción.
- Moderación de contenido multilingüe: traducción previa al inglés de textos en lenguas regionales para aplicar clasificadores entrenados solo en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits (no publicada oficialmente), en GPUs de 16-24 GB; en 4 bits podría ajustarse a 12-16 GB, pero no hay artefactos cuantizados en el repositorio.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI o llama.cpp no están confirmados por el autor y requerirían conversión manual de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas indices | Licencia | Acceso |
|---|---|---|---|---|---|
| bodhan-ai/indic-translate | ~7,94 B | no disponible | 22 | other (gated) | Restringido |
| google/gemma-4-E4B-it (base) | ~8 B (sin confirmar) | no disponible | multilingüe general | Gemma terms | Abierto con condiciones |
| IndicTrans2 (AI4Bharat) | no disponible en esta ficha | no disponible | 22+ | no disponible en esta ficha | Abierto |
| NLLB-200 (Meta) | 54,5 B (variante 54B) | no disponible | 200 lenguas, incluye índicas | CC-BY-NC 4.0 | Abierto |

La comparación con IndicTrans2 y NLLB se ofrece como referencia de categoría; los datos concretos de esos modelos no forman parte de la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede bloquear despliegues automatizados o auditorías externas.
- Licencia "other": no se especifican términos comerciales; es imprescindible revisar el texto completo antes de usar el modelo en producción.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos de dominio, calidad por idioma ni cobertura dialectal.
- Riesgo de alucinación y de traducciones fluentes pero incorrectas, especialmente en lenguas de bajos recursos (brx, doi, gom, mni, sat, sd).
- No hay benchmarks publicados: la calidad real frente a IndicTrans2 o NLLB es desconocida.
- No se confirma que las capacidades multimodales del modelo base se conserven tras el fine-tuning.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) limita el despliegue en hardware de consumo sin trabajo adicional.
- El tamaño de 7,94 B parámetros implica un coste de inferencia considerable para un modelo de traducción, frente a alternativas especializadas más pequeñas.

## Enlaces

- Hugging Face: https://huggingface.co/bodhan-ai/indic-translate
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Organización: https://huggingface.co/bodhan-ai
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
