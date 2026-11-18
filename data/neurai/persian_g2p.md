# Neurai/Persian_G2P

## Resumen

Persian_G2P es un modelo de conversión grafema-fonema (G2P) para persa (farsi) desarrollado por Neurai, publicado en Hugging Face bajo el identificador `Neurai/Persian_G2P`. Su función es transformar texto escrito en persa a su representación fonética, un paso crítico en pipelines de síntesis de voz (TTS) y en sistemas de reconocimiento de habla. El modelo se distribuye con la librería `transformers` y está etiquetado para la tarea de `text2text-generation` y `translation`, con pipeline declarado como `translation`.

Técnicamente se basa en la arquitectura mBART (multilingual BART), un transformer encoder-decoder seq2seq, con 611.129.542 parámetros totales según los pesos en safetensors. El repositorio ocupa 2,5 GB y los pesos se distribuyen en formato safetensors. Está especializado en un único idioma, `fa` (persa), y su caso de uso declarado es la fonetización para TTS y síntesis de habla.

La relevancia del modelo radica en cubrir una laguna concreta: los recursos G2P de calidad para persa son escasos en el ecosistema abierto, y este modelo ofrece una alternativa basada en un backbone multilingüe conocido (mBART) afinado para la tarea. El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga. No se han publicado datos de benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mBART (transformer encoder-decoder seq2seq) |
| Parámetros totales | 611.129.542 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | fa (persa/farsi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mBART, un transformer seq2seq con encoder y decoder, preentrenado de forma multilingüe y aquí adaptado a la tarea de conversión grafema-fonema para persa. El pipeline declarado en Hugging Face es `translation`, lo que es coherente con el enfoque seq2seq: se trata la fonetización como una traducción de la secuencia de grafemas a la secuencia de fonemas. El recuento de parámetros (611 millones) es consistente con la variante base de mBART.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada. Tampoco se detalla el esquema de tokenización ni el alfabeto fonético de salida (IPA u otro). Estos datos figuran como no disponibles.

## Capacidades

- Conversión grafema-fonema (G2P) para texto en persa: transforma cadenas de texto escrito en su representación fonética.
- Generación de texto seq2seq mediante el pipeline `translation` de `transformers`.
- Integración en pipelines de síntesis de voz (TTS) como módulo de fonetización previo al sintetizador.
- Soporte potencial en sistemas de reconocimiento de habla y en lexicones de pronunciación.
- Especialización monolingüe en persa (`fa`); no se documentan capacidades multilingües adicionales.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Síntesis de voz en persa: el modelo actúa como etapa G2P dentro de un pipeline TTS, convirtiendo el texto de entrada en fonemas que el sintetizador acústico consume; es su propósito declarado y el escenario para el que está etiquetado.
- Generación de lexicones de pronunciación: permite fonetizar de forma masiva diccionarios y corpus de texto persa para construir léxicos de pronunciación reutilizables en ASR y TTS.
- Normalización previa en sistemas de reconocimiento de habla: la salida fonética puede emplearse para alinear y enriquecer modelos acústicos con pronunciaciones canónicas.
- Preprocesado de datasets de voz: al convertir transcripciones escritas a fonemas, facilita la preparación de corpus para entrenamiento de modelos de habla en persa.
- Herramientas lingüísticas y educativas: aplicaciones de aprendizaje de pronunciación del persa que muestran la forma fonética de una palabra o frase.
- Investigación en fonética computacional: generación de transcripciones fonéticas a escala para estudios lingüísticos y comparativos del persa.
- Integración en servicios de accesibilidad: lectura en voz alta de contenido persa donde la fonetización correcta mejora la inteligibilidad de la síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 611 millones de parámetros, en fp32 los pesos ocupan aproximadamente 2,4 GB; en fp16/bf16 alrededor de 1,2 GB; en int8 en torno a 0,6 GB. Estas cifras corresponden solo a los pesos y no incluyen memoria para activaciones ni caché.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en fp16 para inferencia cómoda; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. En CPU es viable para cargas moderadas dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 6 GB o más de VRAM en fp16.
- Opciones de despliegue: `transformers` con PyTorch (pipeline `translation` o `text2text-generation`); compatible con `endpoints_compatible` según las etiquetas. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos G2P comparables para persa en la documentación proporcionada. Como referencia arquitectónica, el modelo se basa en mBART base (611 millones de parámetros), pero no se han publicado métricas que permitan una comparación cuantitativa con alternativas.

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neurai/Persian_G2P | 611.129.542 | no disponible | fa | no disponible | gated en Hugging Face |
| Alternativas G2P para persa | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede condicionar el uso automatizado en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de integrarlo en productos.
- Especialización monolingüe: solo cubre persa (`fa`); no es adecuado para otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión fonética que permita estimar su calidad frente a alternativas.
- Riesgo de alucinación y errores en palabras ambiguas: como modelo generativo seq2seq, puede producir fonetizaciones incorrectas en neologismos, nombres propios, préstamos y texto no normativo.
- Falta de documentación sobre el alfabeto fonético de salida (IPA u otro) y sobre el esquema de tokenización, lo que complica la integración directa con sintetizadores concretos.
- Longitud de contexto no documentada: secuencias largas pueden truncarse o degradar la calidad; conviene segmentar el texto de entrada.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Neurai/Persian_G2P
- Perfil del autor en Hugging Face: https://huggingface.co/Neurai
- Documentación de mBART en transformers: https://huggingface.co/docs/transformers/model_doc/mbart
- Documentación del pipeline de traducción: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TranslationPipeline
