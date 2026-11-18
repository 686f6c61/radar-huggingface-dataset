# alphaedge-ai/whisper-large-v3-turbo-asm-16384

## Resumen

whisper-large-v3-turbo-asm-16384 es una version recortada (trimmed) de openai/whisper-large-v3-turbo, publicada por alphaedge-ai y especializada en asamés (codigo de idioma `as`). El modelo parte de los pesos originales de Whisper large-v3-turbo y reduce el vocabulario del tokenizador de 51.865 a 16.384 tokens mediante la tecnica de trimming descrita por Hugging Face, lo que elimina los tokens no utilizados en el idioma objetivo. El resultado es un modelo de 763.461.120 parametros (frente a 808.878.080 del original, una reduccion del 5,61 %) con una huella de memoria menor.

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala para reconocimiento automatico del habla. El recorte no altera la arquitectura ni el proceso de inferencia, solo el tamiz del vocabulario y las dimensiones de las capas de embedding y de la cabeza de salida asociadas.

El modelo es relevante para quienes despliegan ASR en asamés en entornos con recursos limitados, ya que reduce el tamano del repositorio a 1,5 GB y el numero de parametros, manteniendo la licencia Apache 2.0 del modelo base. No obstante, al haber eliminado los tokens de otros idiomas, el modelo deja de ser multilingue y solo es adecuado para asamés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo base admite cuantizacion estandar (int8, float16, etc.) |
| Idiomas soportados | asamés (`as`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v3-turbo: un encoder y un decoder transformer con atencion multi-cabeza estandar, disenado para transcribir audio de 30 segundos muestreado a 16 kHz. La innovacion de la variante turbo del modelo base es la reduccion del numero de capas del decoder (4 capas frente a 32 del large-v3 completo), lo que acelera la inferencia a costa de una ligera perdida de calidad. En esta ficha no se dispone de detalles adicionales sobre el entrenamiento original mas alla de la referencia al paper de Radford et al. (2022).

El proceso de trimming aplicado por alphaedge-ai consistio en reducir el vocabulario de 51.865 a 16.384 tokens (un 68,41 % menos) utilizando 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens relevantes del asamés. Los tokens no utilizados se eliminan del tokenizador y de las matrices de embedding, y los pesos restantes se conservan del modelo original. No se realizo un reentrenamiento adicional segun la informacion disponible; el modelo resultante es una version "quantized" en el sentido de que se han recortado dimensiones, no una cuantizacion numerica de los pesos.

## Capacidades

- Reconocimiento automatico del habla (ASR) en asamés: transcripcion de audio a texto con el pipeline `automatic-speech-recognition` de transformers.
- Inferencia con el tokenizador y extractor de caracteristicas recortados, compatible con el flujo estandar de Whisper (audio a 16 kHz, ventana de 30 s).
- Generacion de transcripciones con `generate_kwargs={"language": "assamese", "task": "transcribe"}`.
- No soporta otros idiomas: el vocabulario recortado elimina los tokens de lenguas distintas del asamés.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No se documenta modo thinking ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones y entrevistas en asamés: el modelo convierte grabaciones de audio en texto con el pipeline de transformers, adecuado para equipos que trabajan con contenido en asamés y necesitan un modelo ligero (1,5 GB) que quepa en infraestructura modesta.
- Subtitulado automatico de videos en asamés: integrable en pipelines de postproduccion para generar subtitulos a partir de la pista de audio, con la ventaja de un menor consumo de memoria frente al modelo base.
- Archivado y busqueda de audio historico en asamés: transcripcion de fondos de audio para hacerlos indexables y consultables, usando el modelo en lotes sobre GPUs de gama media.
- Asistentes de voz para atencion al ciudadano en asamés: el modelo puede servir como capa ASR en un sistema de dictado o atencion telefonica, siempre que el resto del pipeline gestione el lenguaje natural.
- Investigacion linguistica y corpus en asamés: generacion de transcripciones para anotacion y analisis, con un modelo de menor huella que el original y licencia Apache 2.0.
- Despliegue en el borde o en entornos con VRAM limitada: al reducir parametros y vocabulario, el modelo es candidato para inferencia en GPUs de consumo o en servidores con recursos ajustados, usando transformers o herramientas compatibles con safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 763 millones de parametros, en float16 el modelo ocupa aproximadamente 1,5 GB de pesos, por lo que la VRAM necesaria es modesta (del orden de 2-4 GB incluyendo activaciones y buffers de audio).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU con al menos 4 GB de VRAM deberia poder ejecutarlo en float16.
- Compatibilidad con GPU de consumo: probable en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentacion.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), segun el ejemplo de la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-asm-16384 | 763.461.120 | ventana de audio de 30 s (Whisper) | asamés | apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | ventana de audio de 30 s (Whisper) | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | ventana de audio de 30 s (Whisper) | multilingue | apache-2.0 | Hugging Face |

La comparativa se limita al modelo base y a la variante large-v3 por ser los antecesores directos; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina los tokens de otros idiomas: el modelo no es adecuado para lenguas distintas del asamés y puede producir resultados degradados si se usa con audio en otro idioma.
- No se han publicado benchmarks que confirmen que el rendimiento en asamés se mantiene respecto al modelo base; la model card afirma que "deberia" comportarse de forma similar, sin garantia empirica.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos Whisper, especialmente con audio ruidoso, acentos marcados o vocabulario tecnico.
- Sesgos: no se documentan sesgos especificos, pero al derivar de Whisper large-v3-turbo hereda los sesgos del entrenamiento original con supervision debil.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de trimming.
- El modelo tiene 36 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan procesos de RLHF, DPO ni ajuste fino especifico para asamés mas alla del recorte de vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-asm-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de trimming: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
