# NostraEmpire/mirror-madlad400-3b-mt

## Resumen

MADLAD-400-3B-MT es un modelo de traducción automática multilingüe desarrollado por Google Research, basado en la arquitectura T5 (encoder-decoder). Fue entrenado sobre el dataset MADLAD-400, un corpus público de más de 1 billón de tokens que cubre más de 450 idiomas, lo que le permite ofrecer traducciones competitivas con modelos significativamente más grandes. El checkpoint que nos ocupa, `NostraEmpire/mirror-madlad400-3b-mt`, es un espejo del modelo original `google/madlad400-3b-mt`, con los pesos convertidos al formato safetensors y disponible también en GGUF cuantizado.

El modelo resuelve el problema de la traducción automática de alta cobertura lingüística con un tamaño relativamente contenido (2,94 mil millones de parámetros), lo que lo hace viable para despliegue en hardware de gama media. Su licencia Apache 2.0 permite uso comercial sin restricciones, un factor diferencial frente a otros modelos multilingües con licencias más restrictivas. Es relevante ahora porque ofrece una alternativa abierta y práctica para aplicaciones de localización, subtitulado y procesamiento multilingüe en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 2.940.374.016 (~2,94 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (T5 suele usar 512 o 1024 tokens, pero no se especifica en la documentacion) |
| Tipos de cuantizacion | safetensors (FP32/FP16) y GGUF (cuantizacion 4-bit, p.ej. q4k) |
| Idiomas soportados | Mas de 450 (lista extensa en la model card, incluye es, en, fr, de, ru, zh, ja, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder con 32 capas y un vocabulario compartido de 256.000 tokens SentencePiece. Esta configuracion permite tratar cualquier tarea de procesamiento de lenguaje natural como un problema de generacion de texto a texto, lo que simplifica el entrenamiento y la inferencia. El entrenamiento se realizo sobre el dataset MADLAD-400, un corpus publico de 1 billon de tokens que cubre mas de 450 idiomas, con un enfoque en datos de dominio general. No se menciona el uso de RLHF o DPO; se trata de un modelo de traduccion supervisado, entrenado con el objetivo de maximizar la probabilidad de la traduccion correcta dado el texto fuente con un prefijo de idioma destino (p.ej. `<2en>`).

Una innovacion destacable es la cobertura linguistica extremadamente amplia, que incluye idiomas de baja representacion en otros modelos. Ademas, el modelo se ha convertido a formatos ligeros como GGUF, lo que permite su ejecucion en entornos con recursos limitados mediante herramientas como llama.cpp o Candle.

## Capacidades

- Traduccion automatica multilingue: soporta mas de 450 idiomas, con calidad competitiva frente a modelos mucho mayores.
- Generacion de texto condicionada: al ser un modelo T5, puede adaptarse a otras tareas text-to-text (resumen, parafraseo, etc.) con un fine-tuning adecuado.
- Soporte de prefijos de idioma: mediante tokens como `<2en>`, `<2de>`, `<2es>`, se indica el idioma de salida.
- No incluye tool calling, ni capacidades de agente, ni vision o audio: es exclusivamente un modelo de texto para traduccion y tareas afines.
- Multilingue real: cubre desde idiomas mayoritarios hasta lenguas minoritarias y criollos, gracias al dataset MADLAD-400.

## Casos de uso

- Localizacion de software y sitios web: el modelo puede traducir cadenas de interfaz, mensajes de error y documentacion tecnica a decenas de idiomas con un solo modelo, simplificando el pipeline de internacionalizacion.
- Subtitulado automatico de video: dado un guion o transcripcion, se pueden generar subtitulos en multiples idiomas usando el prefijo de idioma destino, con una calidad aceptable para contenido de dominio general.
- Atencion al cliente multilingue: integrado en un sistema de tickets o chat, permite traducir consultas de usuarios y respuestas de agentes en tiempo real, reduciendo la necesidad de agentes nativos por idioma.
- Traduccion de documentos legales o tecnicos: aunque no esta especializado en dominios concretos, puede servir como base para un sistema de traduccion asistida con posterior revision humana, gracias a su amplia cobertura de idiomas.
- Procesamiento de datos multilingue: para empresas que necesitan analizar contenido en multiples idiomas (redes sociales, encuestas, reviews), el modelo puede normalizar todo el texto a un idioma comun (p.ej. ingles) para su posterior analisis.
- Educacion y accesibilidad: traduccion de materiales educativos o contenido web a idiomas de baja representacion, donde otros modelos no llegan, facilitando el acceso a la informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arxiv:2309.04662) reporta evaluaciones en tareas de traduccion (FLORES-200, WMT, etc.), pero no se incluyen cifras concretas en la documentacion del mirror. Se recomienda consultar el articulo para datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 5,9 GB (2,94B parametros x 2 bytes). Con cuantizacion 4-bit (GGUF q4k), el peso se reduce a unos 1,65 GB, lo que permite ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: para FP16, una GPU con 8 GB o mas (RTX 3060, RTX 4070, A10, etc.). Para GGUF cuantizado, basta con 4 GB (p.ej. RTX 3050, GTX 1660, o incluso CPU con suficiente RAM).
- Si cabe en consumer GPU: si, tanto en FP16 (con GPUs de 8 GB) como en cuantizacion 4-bit (con GPUs de 4 GB).
- Opciones de despliegue: transformers (PyTorch), vLLM (si se adapta a T5), llama.cpp (para GGUF), Candle (ejemplo incluido en la model card), y TGI (Text Generation Inference) si se configura adecuadamente.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, un modelo de 3B en FP16 suele generar decenas de tokens por segundo; con cuantizacion 4-bit, la velocidad puede ser similar o ligeramente inferior, pero con menor uso de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| MADLAD-400-3B-MT | 2,94B | 450+ | Apache 2.0 | No disponible | Basado en T5, entrenado en 1T tokens |
| NLLB-200-3.3B (Meta) | 3,3B | 200 | CC-BY-NC 4.0 | 512 tokens | Modelo MoE? No, denso. Entrenado en datos curados, no comercial |
| M2M-100-1.2B (Meta) | 1,2B | 100 | MIT | 1024 tokens | Modelo denso, entrenado en datos publicos, comercial |

MADLAD-400 destaca por su licencia permisiva (Apache 2.0) frente a NLLB-200 (no comercial) y por cubrir mas del doble de idiomas que M2M-100. No se dispone de comparativas de rendimiento numerico en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos publicos de internet, el modelo puede reflejar sesgos culturales, de genero o geograficos presentes en el corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en idiomas poco representados o con contextos ambiguos.
- Limitaciones de contexto: la longitud de contexto no esta documentada; los modelos T5 tipicamente manejan secuencias de hasta 512 o 1024 tokens, lo que limita la traduccion de documentos largos sin segmentacion previa.
- Dominio general: no esta especializado en dominios tecnicos, medicos o legales; su rendimiento en estos ambitos puede ser inferior al de modelos especificos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia al redistribuir el modelo o sus derivados.
- Para produccion: se recomienda validar la calidad de las traducciones en los idiomas y dominios de uso, y considerar un sistema de fallback o revision humana para casos criticos.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/NostraEmpire/mirror-madlad400-3b-mt
- Modelo original en HuggingFace: https://huggingface.co/google/madlad400-3b-mt
- Paper (arxiv): https://arxiv.org/abs/2309.04662
- Repositorio de checkpoints y vocabularios: https://github.com/google-research/google-research/tree/master/madlad_400
- Documentacion de T5 en HuggingFace: https://huggingface.co/docs/transformers/model_doc/t5
- Ejemplo de uso con Candle: https://github.com/huggingface/candle
