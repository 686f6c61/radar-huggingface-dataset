# konnosena/LFM3-Omni-2B-JA-Mix-GGUF

## Resumen

LFM3-Omni-2B-JA-Mix-GGUF es una colección de cuantizaciones GGUF del modelo LiquidAI/LFM3-Omni-2B, un modelo any-to-any de aproximadamente 2B parámetros (1.728.801.600 pesos reales en safetensors) desarrollado por Liquid AI. El modelo base es el primer modelo ómnido de Liquid AI: procesa texto, imágenes, vídeo y audio, y genera respuestas en texto, voz o una mezcla intercalada de ambos. Esta variante concreta no entrena ni modifica los pesos, solo los recomprime con una mezcla de tipos ggml por tensor optimizada para texto conversacional en japonés.

La aportación del autor (konnosena) es una reasignación de tipos de cuantización guiada por divergencia KL medida contra el modelo BF16, con una importance matrix calibrada mayoritariamente con texto de chat en japonés y algo de inglés. El resultado son ficheros de entre 799 MB y 1.099 MB que superan al Q4_K_M oficial en la misma huella de disco: el fichero de 1.100 MB reduce la KLD a menos de la mitad (0,049 frente a 0,105 en japonés) manteniendo el mismo tamaño que el cuantizado oficial.

Es relevante para desarrolladores que necesiten desplegar un modelo multimodal ligero en hardware de consumo, con llama.cpp como runtime (CUDA, Vulkan y CPU), y con un rendimiento en japonés medido explícitamente. Las cuantizaciones son derivadas del modelo base y se distribuyen bajo la LFM Open License v1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base descrito como "built with Transformers"; arquitectura interna detallada no disponible) |
| Parámetros totales | 1.728.801.600 (dato real en safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla por tensor de tipos ggml estándar (sin tipos de 2 bits); incluye IQ3_M, IQ4_XS, Q4_K y Q8_0 según tensor; ficheros de 799, 899, 949 y 1.099 MB más proyector mmproj Q8_0 de 507 MB |
| Idiomas soportados | ja, en |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo any-to-any de Liquid AI que integra comprensión de texto, imagen, vídeo y audio con generación de texto y habla en un único modelo extremo a extremo. La información disponible no detalla la arquitectura interna (tipo de atención, capas, mecanismo de fusión multimodal) ni la composición del dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO. La model card del modelo base en Hugging Face lo describe únicamente como "Any-to-Any model with 2B parameters, built with Transformers".

El trabajo técnico de esta variante se centra en la cuantización. El autor construyó una importance matrix con texto de calibración mayoritariamente japonés (con algo de inglés), renderizado con la plantilla de chat del modelo e incluyendo turnos de razonamiento y de tool calling, además de cubrir el tensor de embedding/output atado. Midiendo la sensibilidad de cada grupo de tensores (235 mediciones por capa y tipo de tensor, manteniendo el resto en Q8_0), determinó que las tres primeras capas son las más sensibles y que attn_k y attn_v son los más sensibles por byte. Para el tensor de embedding/output atado, IQ4_XS superó a Q4_K siendo más pequeño. La asignación final de tipos se resolvió como un problema de knapsack múltiple con presupuesto exacto de tamaño, mediante programación dinámica, y se aplicó con `llama-quantize --tensor-type-file` y `--token-embedding-type`. Los incrementos de KLD resultaron casi aditivos (predicción y medición coincidieron dentro del 3%).

## Capacidades

- Comprensión multimodal de entrada: texto, imágenes, vídeo y audio (modelo ómnido del base).
- Generación de salida en texto, voz o texto y voz intercalados.
- Conversación multi-turno (pipeline any-to-any, tag "conversational").
- Soporte de tool calling / function calling, según la model card del cuantizado (los datos de calibración incluyen turnos de tool-call).
- Turnos de razonamiento (reasoning) contemplados en la calibración del modelo.
- Capacidades multilingües limitadas a japonés e inglés según los metadatos declarados.
- Transcripción de audio: las pruebas del autor muestran transcripciones idénticas entre BF16, Q4_K_M y todas las mezclas sobre 5 clips sintéticos de habla japonesa.
- Descripción de imágenes: respuestas de los ficheros de 900 MB y 950 MB muy cercanas a Q4_K_M y BF16 en 10 imágenes (mayoritariamente pantallas y documentos en japonés).

## Casos de uso

- Asistente conversacional japonés en local: el fichero de 900 MB ofrece calidad cercana a Q4_K_M con 200 MB menos de disco, adecuado para aplicaciones de chat en escritorio o dispositivos con almacenamiento limitado.
- Transcripción y comprensión de audio en japonés: el modelo base acepta audio y genera texto; útil para dictado, subtitulado o asistentes de voz, con la cautela de que el autor solo validó 5 clips sintéticos.
- Procesamiento de documentos y capturas de pantalla: las pruebas del autor se hicieron sobre imágenes de pantallas y documentos japoneses, un escenario directamente alineado con lectura de formularios, recibos o interfaces.
- Despliegue en GPU de consumo: con 799-1.099 MB de pesos más 507 MB de proyector, cabe holgadamente en GPUs de gama media; el autor reporta 303-312 tokens/s en CUDA sobre una RTX 5060 Ti.
- Prototipado de pipelines multimodales any-to-any: permite experimentar con entrada de imagen/audio y salida de texto/habla sin infraestructura de servidor, usando llama.cpp en CPU o Vulkan.
- Aplicaciones con presupuesto de memoria muy ajustado: el fichero de 799 MB (calidad de texto similar a IQ3_M) sirve para entornos embebidos o contenedores con límites estrictos de RAM/VRAM.
- Evaluación comparativa de cuantizaciones: los datos de KLD y top-1 publicados por el autor permiten elegir el fichero según el compromiso tamaño/calidad requerido en producción.

## Benchmarks y rendimiento

Evaluación de divergencia KL y acuerdo top-1 frente al modelo BF16, medida con `llama-perplexity` sobre texto reservado separado de los datos de calibración y asignación. Menor KLD y mayor top-1 son mejores.

| Fichero | Tamaño | KLD japonés | Top-1 japonés | KLD inglés | Top-1 inglés |
|---|---|---|---|---|---|
| Q4_K_M oficial | 1.100 MB | 0,105 | 88,2 % | 0,138 | 87,5 % |
| JA-Mix-800MB | 799 MB | 0,240 | 81,6 % | 0,298 | 80,9 % |
| JA-Mix-900MB | 899 MB | 0,137 | 85,5 % | 0,171 | 85,0 % |
| JA-Mix-950MB | 949 MB | 0,104 | 87,1 % | 0,134 | 87,0 % |
| JA-Mix-1100MB | 1.099 MB | 0,049 | 91,1 % | 0,063 | 91,1 % |

Velocidad de generación en una RTX 5060 Ti:

| Backend | Q4_K_M | Ficheros JA-Mix |
|---|---|---|
| CUDA | 287 tokens/s | 303-312 tokens/s |
| Vulkan | 273 tokens/s | 238-253 tokens/s (los tipos IQ son más lentos en Vulkan) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan entre 799 MB y 1.099 MB; sumando el proyector mmproj Q8_0 (507 MB) y los buffers de contexto y KV cache, el consumo total se mantiene en el rango de pocos GB, apto para GPUs de consumo.
- GPU recomendadas: el autor validó con una RTX 5060 Ti; cualquier GPU con soporte CUDA o Vulkan y al menos unos pocos GB de VRAM libre debería poder ejecutarlo. Para servidores, A100 o H100 no son necesarias por tamaño, aunque pueden usarse para mayor concurrencia.
- Cabe en GPU de consumo: sí, en todas las variantes, incluida la de 1.100 MB con proyector.
- Opciones de despliegue: llama.cpp en modo `llama-server` (CUDA, Vulkan y CPU), con `--mmproj` para el proyector multimodal y `--jinja` para la plantilla de chat. Compatible con endpoints (tag endpoints_compatible). No se indica soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 303-312 tokens/s en CUDA y 238-253 tokens/s en Vulkan para los ficheros JA-Mix en una RTX 5060 Ti; el Q4_K_M oficial alcanza 287 tokens/s en CUDA y 273 tokens/s en Vulkan en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-JA-Mix (esta ficha) | ~1,73 B | no disponible | any-to-any (texto, imagen, vídeo, audio) | LFM Open License v1.0 | GGUF |
| LFM3-Omni-2B (base oficial) | ~1,73 B | no disponible | any-to-any | LFM Open License v1.0 | safetensors, GGUF |
| Q4_K_M oficial de LFM3-Omni-2B | ~1,73 B | no disponible | any-to-any | LFM Open License v1.0 | GGUF (1.100 MB) |

Frente al Q4_K_M oficial, el fichero JA-Mix-1100MB iguala el tamaño con menos de la mitad de KLD (0,049 frente a 0,105 en japonés) y mayor top-1 (91,1 % frente a 88,2 %). El JA-Mix-900MB reduce 200 MB de disco a costa de un aumento moderado de KLD (0,137 en japonés). No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La validación multimodal es muy reducida: 10 imágenes (mayoritariamente pantallas y documentos japoneses) y 5 clips sintéticos de habla japonesa; no se probaron fotos reales ni audio con ruido.
- El fichero de 799 MB introduce más errores en descripciones de imágenes y su calidad de texto es similar a IQ3_M, inferior al resto de variantes.
- En Vulkan los tipos IQ son más lentos: el rendimiento cae a 238-253 tokens/s frente a 287-312 en CUDA.
- La calibración está sesgada hacia japonés; el rendimiento en otros idiomas distintos de ja/en no está validado y los metadatos solo declaran ja y en.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos del modelo base no documentados en la información proporcionada.
- Longitud de contexto no disponible; conviene verificarla en la documentación de Liquid AI antes de usarlo en producción con contextos largos.
- Licencia LFM Open License v1.0: es una licencia "other" con términos específicos; es necesario revisar el fichero LICENSE para confirmar las condiciones de uso comercial.
- Los pesos fueron recomprimidos y el campo `general.name` modificado; el proyector mmproj es idéntico al oficial. Cualquier problema de calidad debe atribuirse a la cuantización, no a cambios en los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/konnosena/LFM3-Omni-2B-JA-Mix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Licencia (LFM Open License v1.0): fichero LICENSE en el repositorio de Hugging Face
