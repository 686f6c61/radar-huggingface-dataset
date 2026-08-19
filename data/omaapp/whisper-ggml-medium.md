# OMAAPP/whisper-ggml-medium

## Resumen

Este repositorio es un espejo del modelo Whisper medium de OpenAI en formato GGML cuantizado a q5_0, preparado por OMAAPP para su uso en la biblioteca whisper.cpp. El modelo original, desarrollado por OpenAI, es un sistema de reconocimiento de voz automático (ASR) basado en arquitectura encoder-decoder transformer, entrenado con 680 000 horas de datos supervisados multilingües. Este espejo concreto está pensado para inferencia en dispositivos locales (on-device), sin necesidad de GPU dedicada ni conexión a la nube.

La relevancia de este repositorio radica en que ofrece un formato directamente compatible con whisper.cpp, una implementación ligera en C/C++ que permite ejecutar el modelo en CPU, incluso en hardware modesto. Al ser un mirror del archivo oficial de ggerganov, garantiza la integridad del peso mediante un hash SHA-256 verificado. El tamaño del repositorio es de 0,5 GB, coherente con la cuantización q5_0 del modelo medium (769 millones de parámetros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 769 M (modelo medium original) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (fijo en Whisper) |
| Tipos de cuantizacion | q5_0 (formato GGML) |
| Idiomas soportados | 99 idiomas (segun especificacion original de Whisper; el mirror no especifica) |
| Licencia | MIT (del mirror; el modelo original de OpenAI usa licencia MIT) |
| Formato de pesos | GGML (binario .bin) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper medium, un transformer encoder-decoder con aproximadamente 769 millones de parametros. El encoder procesa espectrogramas de Mel de 80 canales a partir de ventanas de audio de 30 segundos, mientras que el decoder genera texto autoregresivamente con tokens especiales para idioma y tarea. El entrenamiento original de OpenAI utilizo 680 000 horas de datos supervisados, de los cuales 117 000 horas corresponden a audio multilingue y 125 000 horas a traduccion de audio a texto en ingles. No se aplicaron tecnicas de RLHF ni DPO; el modelo se entreno mediante aprendizaje supervisado clasico con funcion de perdida de entropia cruzada.

La innovacion principal de whisper.cpp, biblioteca para la que se prepara este mirror, es su implementacion en C/C++ sobre la libreria ggml, que permite ejecutar el modelo en CPU con cuantizacion de pesos sin perder demasiada precision. El formato GGML q5_0 utiliza 5 bits por peso, reduciendo el tamano del modelo a aproximadamente 0,5 GB, frente a los 1,5 GB del modelo en punto flotante de 32 bits.

## Capacidades

- Reconocimiento de voz automatico (ASR) en 99 idiomas, con deteccion automatica del idioma de entrada.
- Transcripcion de audio con marcas de tiempo a nivel de segmento.
- Traduccion de audio a texto en ingles, independientemente del idioma de origen.
- Robustez frente a ruido de fondo y acentos, gracias al entrenamiento con datos diversos.
- Inferencia en CPU sin GPU, gracias a la cuantizacion q5_0 y a la implementacion optimizada de whisper.cpp.
- Integracion sencilla en aplicaciones C/C++, con bindings para Python, Rust, Go, entre otros.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de audio a texto.

## Casos de uso

- Transcripcion local de reuniones y entrevistas: el modelo puede procesar grabaciones de audio directamente en un portatil o mini-PC, generando texto con marcas de tiempo sin enviar datos a la nube, lo que preserva la privacidad.
- Asistente de voz para personas con discapacidad auditiva: se integra en aplicaciones de escritorio o moviles para convertir conversaciones en tiempo real a texto, gracias a la baja latencia de whisper.cpp en CPU.
- Subtitulado automatico de videos: el modelo genera subtitulos en varios idiomas a partir del audio de un video, con sincronizacion temporal aproximada, util para creadores de contenido y archivistas.
- Comandos de voz en dispositivos embebidos: al ser ligero y ejecutable en CPU, puede desplegarse en Raspberry Pi u otros SBC para activar funciones por voz en domotica o prototipos.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones de centros de contacto para su posterior procesamiento con NLP, sin depender de servicios externos.
- Archivo y busqueda de audio historico: conversion de cintas o archivos de audio antiguos a texto indexable, facilitando la busqueda de contenido en bibliotecas o archivos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparativas con otros modelos ni datos de precision (WER) o velocidad. Para referencia, el modelo Whisper medium original alcanza un WER de aproximadamente 7,4 % en Common Voice 15 y 8,4 % en Fleurs, segun la documentacion de OpenAI, pero estos datos no estan verificados en este mirror concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en q5_0 ocupa unos 0,5 GB de pesos. En CPU, la memoria RAM necesaria es de aproximadamente 1-2 GB incluyendo buffers y overhead de whisper.cpp.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Si se desea aceleracion, cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo en memoria, aunque la implementacion de whisper.cpp esta optimizada principalmente para CPU.
- Compatible con GPU de consumo como GTX 1060, RTX 2060 o superiores, pero no es necesario.
- Opciones de despliegue: whisper.cpp (compilacion directa), bindings en Python (pywhispercpp), Rust, Go, y servidores HTTP como whisper.cpp server.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del numero de hilos. En una CPU moderna de 8 nucleos, la transcripcion de un minuto de audio suele tardar entre 5 y 15 segundos, segun pruebas informales de la comunidad, pero estos valores no son oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OMAAPP/whisper-ggml-medium | 769 M | q5_0 | 0,5 GB | 30 s audio | MIT | Hugging Face |
| whisper.cpp ggml-small | 244 M | q5_0 | ~0,2 GB | 30 s audio | MIT | Hugging Face |
| whisper.cpp ggml-large-v3 | 1550 M | q5_0 | ~1,0 GB | 30 s audio | MIT | Hugging Face |

La comparativa se basa en los modelos oficiales de whisper.cpp. El modelo medium ofrece un equilibrio entre precision y recursos: es mas preciso que small pero mas ligero que large. Para aplicaciones en dispositivos con poca memoria, small puede ser suficiente; para maxima precision, large-v3 es superior, pero requiere mas RAM y tiempo de computo.

## Limitaciones y advertencias

- El modelo puede alucinar contenido en silencios o audio ambiguo, generando texto inventado, especialmente en idiomas poco representados en el entrenamiento.
- La ventana de contexto fija de 30 segundos implica que audios mas largos deben segmentarse, lo que puede provocar perdida de contexto entre segmentos.
- No se ha especificado el conjunto de idiomas soportados en este mirror; aunque Whisper original soporta 99 idiomas, la calidad varia notablemente entre ellos, siendo peor para lenguas con pocos datos de entrenamiento.
- La cuantizacion q5_0 introduce una ligera degradacion de la precision frente al modelo en punto flotante, aunque en la practica suele ser aceptable para transcripcion.
- Licencia MIT permite uso comercial sin restricciones, pero el modelo subyacente de OpenAI tambien se distribuye bajo MIT, por lo que no hay restricciones adicionales.
- Para produccion, es recomendable verificar el hash SHA-256 del archivo descargado (proporcionado en el README) para evitar corrupciones o manipulaciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente utilizado; se debe validar su funcionamiento antes de confiar en el en entornos criticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OMAAPP/whisper-ggml-medium
- Repositorio oficial whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Documentacion de descarga y conversion de modelos: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
- Guia de tamanos de modelos Whisper: https://openwhispr.com/blog/whisper-model-sizes-explained
