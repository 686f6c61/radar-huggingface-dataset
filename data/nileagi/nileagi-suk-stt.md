# nileagi/nileagi-suk-stt

## Resumen

`nileagi/nileagi-suk-stt` es un modelo de reconocimiento automático del habla (ASR) desarrollado por NileAGI, una empresa de investigación en inteligencia artificial centrada en el avance hacia la inteligencia a nivel humano. El modelo transcribe audio en idioma sukuma (lengua bantú hablada en Tanzania) a texto, y se presenta como un checkpoint experimental de validación de un pipeline de entrenamiento, no como una versión de producción. Según las etiquetas de HuggingFace, está basado en la arquitectura Whisper, aunque la model card no lo confirma explícitamente.

Con 37,7 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en abordar una lengua de bajos recursos, contribuyendo a la preservación y procesamiento digital del sukuma. Sin embargo, su uso está restringido a investigación y a un registro muy concreto (habla leída literaria o religiosa), y su licencia es de tipo `other` con términos de investigación de NileAGI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (según etiquetas de HuggingFace, no confirmado en la model card) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica la ventana de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | suk (sukuma) |
| Licencia | other (términos de investigación NileAGI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de la referencia a Whisper en las etiquetas. Se trata de un modelo de codificador-decodificador basado en atención, típico de los sistemas ASR modernos, pero no se confirma la variante exacta. El entrenamiento se realizó sobre pares de audio-texto en sukuma, con un enfoque en habla leída de registro literario o religioso. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es el resultado de una validación corta del pipeline de entrenamiento, por lo que los resultados reportados no deben considerarse una línea base de producto.

## Capacidades

- Transcripción de voz a texto en idioma sukuma, específicamente para habla leída en registro literario o religioso.
- Compatible con el pipeline `automatic-speech-recognition` de la librería `transformers`.
- Integración sencilla mediante la API de HuggingFace (`pipeline`).
- No se documentan capacidades adicionales como traducción, diarización de hablantes, ni soporte de tool calling.

## Casos de uso

- Investigación lingüística: transcripción de grabaciones de habla leída en sukuma para análisis fonético, morfológico o sintáctico.
- Digitalización de textos religiosos: transcribir sermones, lecturas bíblicas u otros materiales litúrgicos en sukuma para archivos digitales accesibles.
- Creación de corpus etiquetados: generar datos de texto a partir de audio para entrenar otros modelos de NLP en sukuma, como traducción automática o análisis de sentimiento.
- Educación y alfabetización: transcribir material educativo en sukuma para producir subtítulos o textos de lectura complementarios.
- Preservación cultural: documentación de narrativas orales en registro formal, contribuyendo a la conservación de la lengua y la cultura sukuma.
- Validación de pipelines de entrenamiento: como parte del desarrollo interno de NileAGI, sirve para comprobar la correcta ejecución del flujo de datos y entrenamiento antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sugiere evaluar con WER (word error rate) y CER (character error rate) sobre grupos de documentos reservados y un conjunto de hablantes separado, pero no ofrece valores numéricos.

## Requisitos de hardware

- Al tratarse de un modelo pequeño (37,7M de parámetros), los pesos en fp32 ocupan aproximadamente 150 MB, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- VRAM estimada: menos de 1 GB en fp32; en cuantizaciones de 8 bits o 4 bits (si se generaran) sería aún menor, aunque no se proporcionan oficialmente.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) o incluso integradas; para CPU, basta con un procesador moderno.
- Opciones de despliegue: mediante el pipeline de `transformers` en Python; también podría exportarse a ONNX o GGUF para entornos de inferencia ligera, aunque no está documentado.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una inferencia rápida incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de modelos comparables para el idioma sukuma. Whisper (openai/whisper) soporta alrededor de 99 idiomas, pero sukuma no está incluido en su lista oficial. Otros modelos ASR multilingües como MMS (Meta) tampoco cubren sukuma de forma confirmada. Por tanto, no hay una comparativa directa disponible.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint de validación de pipeline, no una release de producción; los resultados no son representativos de un producto final.
- Registro limitado: solo transcribe habla leída en estilo literario o religioso; falla con audio conversacional, ruidoso o de campo.
- Dominios excluidos: no es adecuado para transcripciones legales, médicas ni para despliegue en tiempo real sin entrenamiento adicional.
- Ortografía con macrones: el texto de salida sigue la ortografía del corpus de entrenamiento, que incluye macrones (vocales largas), lo que puede no coincidir con otros estándares ortográficos del sukuma.
- Licencia restrictiva: los términos de investigación de NileAGI (`other`) pueden limitar el uso comercial o la redistribución; es necesario revisar la licencia completa antes de cualquier uso.
- Sin datos de evaluación: no se han publicado métricas de rendimiento, por lo que la calidad real del modelo es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nileagi/nileagi-suk-stt
- Sitio web de NileAGI: https://nileagi.com/
- Substack de NileAGI: https://nilehli.substack.com/
