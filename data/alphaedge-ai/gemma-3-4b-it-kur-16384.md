# alphaedge-ai/gemma-3-4b-it-kur-16384

## Resumen

gemma-3-4b-it-kur-16384 es una variante del modelo google/gemma-3-4b-it optimizada para kurdo mediante la tecnica de trimming de vocabulario. El autor, alphaedge-ai, ha reducido el vocabulario original de 262.144 tokens a 16.384 tokens, lo que se traduce en una reduccion del 14,63% en el numero total de parametros (de 4.300.079.472 a 3.670.770.032). El modelo conserva la arquitectura y los pesos del Gemma 3 original, pero elimina los tokens poco frecuentes en kurdo, lo que reduce el footprint de memoria.

El modelo mantiene las capacidades multimodales (image-text-to-text) del Gemma 3 base, incluyendo vision, y esta pensado para despliegues en entornos con recursos limitados donde solo se necesita kurdo. La reduccion de vocabulario implica que el modelo puede degradarse en otros idiomas, ya que se han eliminado tokens no usados en la seleccion linguistica.

La relevancia actual radica en la creciente demanda de modelos eficientes para lenguas de bajos recursos como el kurdo, y en la tecnica de trimming como estrategia de compresion sin reentrenamiento completo. El modelo esta disponible bajo licencia Gemma y es compatible con text-generation-inference y endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con atencion y capas del modelo base |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3-4B-IT soporta contexto largo, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF u otras) |
| Idiomas soportados | ku (kurdo) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo deriva directamente de google/gemma-3-4b-it, un transformer decoder-only multimodal de la familia Gemma 3. No se ha reentrenado: la unica modificacion es la reduccion del vocabulario de 262.144 a 16.384 tokens mediante trimming. El proceso de seleccion de tokens se basa en el dataset lbourdois/fineweb-2-trimming, usando 200.000 textos para minar la frecuencia de tokens en kurdo. Los tokens no usados comunmente en kurdo se eliminan, y los embeddings correspondientes se recortan, lo que reduce el numero de parametros en la capa de embedding y en la cabeza de salida.

No se dispone de informacion sobre el numero de tokens de entrenamiento original, composicion del dataset de Gemma 3, ni sobre RLHF/DPO en esta model card. La innovacion tecnica destacable es el uso de trimming como metodo de compresion de vocabulario, que reduce el tamano del modelo sin necesidad de reentrenamiento y mantiene el rendimiento en el idioma objetivo. El modelo base Gemma 3 incorpora tecnicas como atencion con ventana deslizante y decodificacion estandar, pero no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en kurdo.
- Capacidades multimodales heredadas del Gemma 3 base: image-text-to-text (vision), aunque la model card se centra en text-generation.
- Razonamiento y generacion de codigo y matematicas (heredado del modelo base, no verificado especificamente para kurdo).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingues: limitadas a kurdo; el resto de idiomas puede degradarse por la reduccion de vocabulario.
- Modo thinking: no disponible en la informacion.

## Casos de uso

- Atencion al cliente en kurdo: el modelo puede gestionar conversaciones multi-turno en kurdo con un footprint de memoria reducido, adecuado para despliegues en servidores con VRAM limitada.
- Generacion de contenido editorial en kurdo: redaccion de articulos, resumenes y respuestas en kurdo, aprovechando el vocabulario optimizado para esta lengua.
- Traduccion asistida kurdo-espanol/ingles: aunque el vocabulario esta optimizado para kurdo, el modelo puede usarse como componente de traduccion, con cautela por la posible degradacion en otros idiomas.
- Asistente educativo en kurdo: respuestas a preguntas de estudiantes en kurdo, con contexto conversacional.
- Procesamiento de documentos kurdo con vision: al heredar capacidades image-text-to-text, puede extraer texto de imagenes en kurdo, aunque no esta verificado en la model card.
- Despliegue en edge/consumer GPU: al reducir parametros a 3.670 millones, cabe en GPUs consumer con cuantizacion, permitiendo inferencia local para kurdo.
- Chatbot de bajo coste para organizaciones kurdas: menor uso de memoria que el Gemma 3-4B original, con rendimiento similar en kurdo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 3.670 millones de parametros, en FP16 se estiman aproximadamente 7,3 GB de pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas en la informacion; por tamano, podria ejecutarse en RTX 4090, A100, H100 con cuantizacion.
- Cabe en consumer GPU: probable con cuantizacion (por ejemplo, 8 bits o 4 bits), aunque no se confirma en la model card.
- Opciones de despliegue: transformers (segun la model card), text-generation-inference (tag), endpoints_compatible. No se listan llama.cpp, Ollama o TGI explicitamente, aunque TGI aparece como tag.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-4b-it-kur-16384 | 3.670.770.032 | no disponible | ku | gemma | Hugging Face |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | multilingue | gemma | Hugging Face |
| Modelos trimmed similares de otras lenguas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: heredados del Gemma 3 base; no se documentan sesgos especificos en la model card.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; no cuantificado.
- Limitaciones de contexto o idioma: el vocabulario reducido a 16.384 tokens puede degradar el rendimiento en idiomas distintos del kurdo; la model card advierte explicitamente que puede no funcionar bien en otras lenguas.
- Restricciones de licencia: uso comercial sujeto a Gemma Terms of Use; el modelo no esta afiliado ni respaldado por Google.
- Caveat para produccion: la reduccion de vocabulario puede afectar la tokenizacion de texto mixto (kurdo con terminos tecnicos en ingles), y no se han publicado benchmarks que validen el rendimiento en kurdo frente al original.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-kur-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso Gemma: https://ai.google.dev/gemma/terms
