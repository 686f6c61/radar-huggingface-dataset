# RL10x/tiny-voca-hindi-5m

## Resumen

Tiny Voca Hindi 5M es un modelo de síntesis de voz (text-to-speech) en hindi desarrollado por RL10x. Se trata de la sucesión de Tiny Voca Hindi (9.7M), reduciendo el tamaño a la mitad (5,3 millones de parámetros) y eliminando el ruido de fondo característico del modelo anterior, gracias a las aportaciones del proyecto nano-edge-tts de Mike Chumba. El modelo produce una única voz femenina con ocho estilos de habla distintos (neutro, conversacional, feliz, triste, enfadado, asustado, sorprendido y disgustado).

La relevancia del modelo reside en su extrema ligereza: está pensado para ejecutarse en CPU de portátil con ocho hilos, sin necesidad de GPU. Según los ejemplos publicados en la model card, genera 7,6 segundos de audio en 0,16 segundos con el GGUF de 8 bits en el motor C++, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados. El modelo normaliza números, fechas, horas y cantidades monetarias a palabras en hindi antes de sintetizar.

El modelo se distribuye en formato GGUF (8 bits) para el motor C++ basado en ggml, además de un checkpoint PyTorch. Está entrenado sobre el dataset ai4bharat/Rasa y solo soporta el idioma hindi. La licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS ligero; no se detalla en la informacion proporcionada) |
| Parametros totales | 5.330.123 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (GGUF q8_0); checkpoint PyTorch |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (7,4 MB), PyTorch checkpoint (.pt, 20,3 MB) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo en la informacion proporcionada. Se trata de un modelo TTS de muy pequeño tamaño (5,3 millones de parametros) orientado a inferencia en CPU, con un motor C++ propio basado en ggml y un pipeline de normalizacion de texto en hindi que convierte numeros, fechas, horas y monedas a palabras antes de la sintesis. El modelo fue entrenado sobre el dataset ai4bharat/Rasa, segun los metadatos de la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es la reduccion de tamano respecto al predecesor (de 9,7M a 5,3M parametros) manteniendo la calidad y eliminando el ruido de fondo, gracias a las aportaciones del proyecto nano-edge-tts. El modelo incorpora ocho estilos de habla controlables y una voz femenina unica. No se dispone de informacion sobre mecanismos de decodificacion especulativa ni atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en hindi con una voz femenina.
- Ocho estilos de habla: neutro, conversacional, feliz, triste, enfadado, asustado, sorprendido y disgustado.
- Normalizacion de numeros, fechas, horas y cantidades monetarias a palabras en hindi antes de la sintesis.
- Generacion de pasajes largos (se documentan ejemplos de hasta 69,1 segundos de audio generados en 2,12 segundos).
- Inferencia en CPU sin GPU, con motor C++ basado en ggml y pagina web ligera incluida.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicable a un modelo TTS).
- Capacidad multilingue: solo hindi.

## Casos de uso

- Lectura de noticias y boletines en hindi: el modelo puede sintetizar parrafos largos (se documentan 69,1 segundos de audio en 2,12 segundos) con entonacion neutra, adecuado para servicios de informacion en streaming o podcasts automatizados.
- Asistentes de voz para dispositivos de bajo consumo: al ejecutarse en CPU de portatil con ocho hilos y ocupar 7,4 MB en GGUF de 8 bits, puede integrarse en routers, Raspberry Pi o sistemas embebidos con recursos limitados.
- Sistemas de anuncios y avisos publicos: la normalizacion de fechas, horas y monedas permite generar avisos como horarios de trenes o precios sin preprocesamiento manual del texto.
- Audiolibros y contenido educativo en hindi: los ocho estilos permiten narrar dialogos con tono conversacional, feliz o triste segun el contexto, mejorando la expresividad frente a una voz neutra unica.
- Atencion al cliente automatizada en hindi: la voz conversacional y la capacidad de generar respuestas de 5 a 7 segundos en menos de 0,2 segundos permiten respuestas interactivas de baja latencia.
- Accesibilidad para personas con discapacidad visual: lectura de textos digitales en hindi en tiempo real en equipos sin GPU.
- Prototipado rapido de interfaces de voz: el checkpoint PyTorch y el codigo Python incluido (`speak.py`, `tiny_voca/`, `hindi_text/`) facilitan la experimentacion y el ajuste fino en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye mediciones de latencia por muestra (tiempo de audio generado frente a tiempo de sintesis), que se recogen a continuacion como referencia de rendimiento practico:

| Muestra | Duracion del audio | Tiempo de sintesis |
|---|---|---|
| Estilo neutro | 7,6 s | 0,16 s |
| Estilo conversacional | 5,4 s | 0,16 s |
| Estilo feliz | 5,5 s | 0,16 s |
| Estilo triste | 6,3 s | 0,19 s |
| Estilo enfadado | 5,1 s | 0,14 s |
| Estilo asustado | 5,9 s | 0,17 s |
| Estilo sorprendido | 4,6 s | 0,14 s |
| Estilo disgustado | 5,1 s | 0,15 s |
| Numeros (telefono y vuelo) | 11,4 s | 0,35 s |
| Numeros (precio y porcentaje) | 7,6 s | 0,23 s |
| Pasaje largo (neutro) | 37,2 s | 1,25 s |
| Pasaje largo (conversacional) | 38,5 s | 1,19 s |
| Pasaje largo (neutro) | 69,1 s | 2,12 s |

Estas cifras corresponden al GGUF de 8 bits ejecutado en el motor C++ sobre CPU de portatil con ocho hilos, segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU. El GGUF de 8 bits ocupa 7,4 MB y el checkpoint PyTorch 20,3 MB, por lo que cabe en cualquier sistema con memoria RAM convencional.
- GPU recomendadas: no se requieren. No se documenta soporte GPU en la informacion proporcionada.
- Cab en consumer GPU: si, en cualquier GPU consumer, aunque el diseno esta orientado a CPU.
- Opciones de despliegue: motor C++ propio basado en ggml (incluido en el repositorio, carpeta `cpp/`), pagina web ligera (`web/`), codigo Python (`speak.py`, `tiny_voca/`, `hindi_text/`) con checkpoint PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: segun la model card, entre 0,14 y 0,35 segundos para muestras de 4,6 a 11,4 segundos de audio, y entre 1,19 y 2,12 segundos para pasajes de 37 a 69 segundos, en CPU de portatil con ocho hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tiny Voca Hindi 5M | 5,3M | no disponible | hindi | CC-BY-4.0 | GGUF, PyTorch |
| Tiny Voca Hindi (9.7M) | 9,7M | no disponible | hindi | no disponible | no disponible |
| nano-edge-tts (Mike Chumba) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. Tiny Voca Hindi 5M es el sucesor de Tiny Voca Hindi (9.7M), con la mitad de parametros y sin el ruido de fondo del predecesor, segun la model card. nano-edge-tts se cita como la base tecnica que permitio eliminar dicho ruido, pero no se detallan sus especificaciones.

## Limitaciones y advertencias

- Solo soporta hindi; no es multilingue.
- Una unica voz femenina: no hay variedad de voces ni control de genero.
- Modelo de muy pequeno tamano (5,3M parametros): la calidad de sintesis puede ser inferior a modelos TTS de mayor escala, especialmente en prosodia compleja o textos con vocabulario poco frecuente.
- Riesgo de errores en la normalizacion de numeros, fechas y monedas en casos ambiguos o formatos no contemplados.
- No se documentan sesgos especificos, pero al entrenarse sobre ai4bharat/Rasa puede heredar sesgos de dicho dataset.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor; es necesario citar adecuadamente el modelo y respetar los terminos de la licencia.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso; no es aplicable a un modelo TTS.
- Al ser un modelo con cero descargas y cero likes en el momento de la consulta, no hay validacion comunitaria extensa; conviene evaluar la calidad de sintesis en el caso de uso concreto antes de desplegarlo en produccion.
- No se dispone de informacion sobre latencia en GPU ni sobre integracion con frameworks de inferencia estandar (vLLM, TGI, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL10x/tiny-voca-hindi-5m
- Predecesor Tiny Voca Hindi (9.7M): https://huggingface.co/RL10x/tiny-voca-hindi
- Proyecto nano-edge-tts de Mike Chumba: https://huggingface.co/drmhse/nano-edge-tts
- Dataset ai4bharat/Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
