# samuelolubukun/chatterbox-hausa-naijavoices

## Resumen

Chatterbox Hausa (NaijaVoices) es un ajuste fino del modelo de sintesis de voz ResembleAI Chatterbox T3 Multilingual, especializado en hausa (`ha`). Lo desarrolla Samuel Olubukun y se publica en HuggingFace bajo el identificador `samuelolubukun/chatterbox-hausa-naijavoices`. El modelo resuelve un problema concreto: la mayoria de los sistemas TTS multilingues de alta calidad no cubren lenguas africanas de forma nativa, y este ajuste anade hausa manteniendo la capacidad de clonacion de voz a partir de un clip de referencia.

La arquitectura declarada por el autor es Chatterbox T3, un sistema TTS autorregresivo con flow-matching y codec Encodec. El tokenizador es el S3 Tokenizer, al que se le anade un token de vocabulario especifico para `ha`. El entrenamiento se hizo sobre aproximadamente 8.000 pares audio-texto del split Hausa batch-0 del dataset NaijaVoices, durante 8 epocas, en una NVIDIA A10G de 24 GB.

Es relevante porque demuestra el patron de "trasplante de tokens de idioma" (se inicializaron los pesos del token `ha` copiando los del token `[sw]` de swahili) para acelerar la convergencia en idiomas de bajos recursos, una tecnica reutilizable para otros ajustes. Conviene senalar una discrepancia documental importante: la model card indica "~1.2B parametros", mientras que el fichero `model.safetensors` publicado reporta 535.999.488 parametros (~536 M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox T3: TTS autorregresivo con flow-matching y codec Encodec |
| Parametros totales | 535.999.488 segun `safetensors`; la model card declara "~1.2B" (discrepancia sin resolver) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible; en TTS la restriccion practica es la longitud del texto de entrada y del audio de referencia |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye `model.safetensors` (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | hausa (`ha`); transferencia cross-lingual desde audio de referencia segun el autor |
| Licencia | dual: Apache 2.0 (pesos base de Chatterbox T3) + CC BY-NC-SA 4.0 (dataset NaijaVoices) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de ResembleAI Chatterbox T3 Multilingual, un TTS autorregresivo que combina modelado por flow-matching con un codec neural tipo Encodec. La senal de texto se procesa con el S3 Tokenizer, al que este ajuste anade un token de idioma para hausa. La clonacion de voz se apoya en un clip de audio de referencia, y el autor indica que se conserva la transferencia cross-lingual desde esa referencia.

El ajuste fino se realizo sobre el split Hausa batch-0 del dataset `naijavoices/naijavoices-dataset`, con aproximadamente 8.000 muestras emparejadas audio-texto y 8 epocas completas. El optimizador fue AdamW con learning rate de 5e-5 y gradient accumulation de 4 pasos, sobre una NVIDIA A10G de 24 GB de VRAM. La innovacion tecnica destacada es la inicializacion del token de idioma `ha` mediante el trasplante de los pesos del token `[sw]` (swahili) como donante, con el objetivo de acelerar la convergencia en un idioma con pocos datos. No se documenta en la informacion disponible el uso de RLHF, DPO ni de decodificacion especulativa.

## Capacidades

- Sintesis de voz (text-to-speech) en hausa a partir de texto plano.
- Clonacion de voz: genera habla imitando el timbre de un clip de audio de referencia.
- Transferencia cross-lingual desde el audio de referencia, segun la model card.
- Prosodia conversacional: el autor afirma que mantiene prosodia natural de conversacion.
- Manejo del inventario ortografico del hausa, incluidos caracteres como `ƙ` presentes en los ejemplos de la model card.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de entrada mas alla de la referencia de voz.

## Casos de uso

- Audiolibros y lectura de textos largos en hausa: el modelo convierte texto escrito en audio con una voz consistente, util para digitalizar literatura y prensa en hausa alli donde no existen grabaciones profesionales.
- Doblaje y localizacion de video: clonando la voz de un locutor de referencia se puede generar una pista de doblaje en hausa para contenido educativo o divulgativo, manteniendo coherencia de timbre a lo largo de la pieza.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de pantalla, permite sintetizar interfaces y documentos en hausa clonando la voz preferida del usuario.
- Sistemas de atencion telefonica automatizada (IVR) en hausa: la clonacion de voz permite definir una voz corporativa estable para menus y respuestas pregrabadas generadas dinamicamente.
- Produccion de contenido para radio y podcast en hausa: permite generar locuciones de boletines o resumenes sin necesidad de un estudio de grabacion ni de un locutor disponible.
- E-learning y materiales didacticos: narracion automatica de lecciones y ejercicios en hausa, con la posibilidad de generar varias voces para distintos personajes o niveles.
- Preservacion linguistica y corpus de investigacion: genera audio sintetico etiquetado en hausa que puede usarse como aumento de datos para otros sistemas de voz o para estudiar variedades dialectales.
- Prototipado rapido de interfaz de voz: para equipos que desarrollan asistentes en hausa y necesitan audio de prueba realista sin contratar grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye curvas de convergencia del entrenamiento (`training_curves.png`) y tres comparativas cualitativas de audio original frente a audio sintetizado, sin metricas objetivas como MOS, WER, CER ni similitud de hablante.

## Requisitos de hardware

- Entrenamiento documentado: NVIDIA A10G con 24 GB de VRAM (8 epocas, ~8.000 muestras).
- Inferencia: el autor no publica requisitos. Como referencia orientativa no confirmada, el repositorio ocupa 2,1 GB y el fichero de pesos contiene unos 536 M de parametros, lo que situa la inferencia en el rango de pocos GB de VRAM y la hace viable en GPU de consumo (por ejemplo, gamas RTX x060/x070 en adelante); esta estimacion no esta validada por el autor.
- GPU de datacenter: A10G, A100 o H100 soportadas por el stack PyTorch habitual, aunque no se documenta un perfil de throughput especifico.
- No cabe esperar soporte de llama.cpp, Ollama, vLLM ni TGI: son runners orientados a modelos de lenguaje y este es un modelo TTS.
- Despliegue esperado mediante la libreria `chatterbox` (tag `chatterbox` en HuggingFace y `librery: chatterbox` en los metadatos), sobre PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatterbox-hausa-naijavoices | 536 M (safetensors); model card declara ~1.2B | hausa | si | Apache 2.0 + CC BY-NC-SA 4.0 | HuggingFace, 0 descargas |
| ResembleAI Chatterbox T3 Multilingual (modelo base) | no disponible en la informacion proporcionada | multilingue | si | Apache 2.0 | HuggingFace |
| xtts-v2-hausa-openbible (mismo autor, citado en la model card) | no disponible | hausa | si (XTTS-v2) | no disponible | HuggingFace |
| Modelos TTS multilingues genericos tipo XTTS-v2 / MMS-TTS | no disponible | multilingue / centenares de lenguas | depende del modelo | varian (algunos no comerciales) | HuggingFace |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de calidad entre estas alternativas. La comparacion debe limitarse, por tanto, a cobertura de idioma, disponibilidad de clonacion y licencia.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card declara "~1.2B" mientras que los pesos publicados suman 535.999.488 parametros. Conviene verificar que el fichero `model.safetensors` corresponde realmente al modelo descrito.
- Licencia no comercial en la practica: aunque los pesos base sean Apache 2.0, el ajuste incorpora el dataset NaijaVoices bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial y obliga a compartir igual (ShareAlike). Antes de desplegar en produccion comercial hay que revisar la cadena de licencias con detalle.
- Volumen de datos reducido: ~8.000 muestras y 8 epocas implican diversidad limitada de hablantes, acentos y dominios; es probable el sobreajuste a las voces del corpus NaijaVoices.
- Cobertura de un unico idioma: solo hausa. El texto en otros idiomas, o con mezcla de code-switching hausa-ingles, puede degradar la pronunciacion.
- Clonacion de voz: la capacidad de clonar voces a partir de un clip de referencia abre riesgos de suplantacion, fraude y deepfakes. Es imprescindible consentimiento explicito del hablante y trazabilidad de los audios generados.
- Riesgo de alucinacion acustica: en TTS se manifiesta como pronunciacion incorrecta, palabras inventadas, tartamudeo o artefactos en frases largas o con caracteres fuera del inventario visto en entrenamiento.
- Ausencia de evaluacion objetiva: no hay MOS, WER, CER ni metrica de similitud de hablante publicados, ni comparaciones controladas contra otros TTS en hausa.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Metadatos anomalos: las fechas de creacion y actualizacion registradas (2026-10-07) son posteriores a la fecha habitual de publicacion de modelos comparables; conviene tratarlas con cautela.
- El contenido de los resultados de busqueda web disponibles no guarda relacion con el modelo, por lo que no aportan informacion tecnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/chatterbox-hausa-naijavoices
- Modelo base Chatterbox de ResembleAI: https://huggingface.co/ResembleAI/chatterbox
- Dataset NaijaVoices: https://huggingface.co/datasets/naijavoices/naijavoices-dataset
- Dataset de referencia de audio usado en los ejemplos: https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset
- Perfil de HuggingFace del autor: https://huggingface.co/samuelolubukun
- Sitio web del autor: https://samuelolubukun.com
- GitHub del autor: https://github.com/samolubukun
- Modelo previo del autor citado en la model card: https://huggingface.co/samuelolubukun/xtts-v2-hausa-openbible
