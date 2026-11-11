# herald-dictation/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por Qwen (Alibaba Cloud). Esta variante concreta la publica el proyecto herald-dictation para su uso con transcribe.cpp, el motor de inferencia de la aplicación Herald, una herramienta de dictado privado y totalmente offline. El archivo incluido es una copia byte a byte del publicado por handy-computer, sin modificación de los pesos.

El modelo resuelve la transcripción de audio a texto en 30 idiomas, con especial cobertura del chino, inglés y cantonés, además de lenguas europeas, asiáticas y de Oriente Medio. Su tamaño contenido (782.452.240 parámetros reales según safetensors, pese al "0.6B" de la nomenclatura) lo hace apto para ejecución local en hardware de consumo, lo que resulta relevante para aplicaciones de dictado que requieren privacidad y funcionamiento sin conexión.

La ficha se centra en la versión cuantizada Q8_0 (850.423.456 bytes) distribuida en este repositorio, orientada a inferencia con transcribe.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de reconocimiento del habla; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 782.452.240 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo en este repo); otras cuantizaciones en el repositorio original de handy-computer |
| Idiomas soportados | zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk (30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-ASR-0.6B-Q8_0.gguf`, 850.423.456 bytes, SHA-256 `f081b2d5e23bd669d92cc331d722a8a0681943b8e6f34b48996fd5c319b5acd8`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3-ASR-0.6B en la documentacion proporcionada. Se trata de un modelo de la familia Qwen3 orientado a reconocimiento automatico del habla (pipeline `automatic-speech-recognition`), lo que implica un componente de codificacion de audio seguido de un decodificador de texto, pero la model card no especifica si emplea un transformer estandar, atención lineal u otra variante.

Tampoco se detallan los datos de entrenamiento (numero de horas de audio, composicion del corpus, uso de RLHF o DPO) ni innovaciones tecnicas concretas. La informacion disponible se limita al proceso de conversion: los pesos originales de Qwen se convirtieron a GGUF para transcribe.cpp por parte de handy-computer, y herald-dictation redistribuye una copia identica para no depender del hosting de otro proyecto. Cualquier dato sobre entrenamiento debe consultarse en el repositorio original de Qwen.

## Capacidades

- Transcripcion de audio a texto (speech-to-text) en 30 idiomas, con etiqueta `conversational` que sugiere orientacion a habla espontanea.
- Cobertura destacada de chino (zh), ingles (en) y cantonés (yue), ademas de arabe, aleman, frances, espanol, portugues, indonesio, italiano, coreano, ruso, tailandes, vietnamita, japones, turco, hindi, malayo, neerlandes, sueco, danes, finlandes, polaco, checo, filipino, persa, griego, rumano, hungaro y macedonio.
- Ejecucion local y offline mediante transcribe.cpp, sin necesidad de conexion a servicios en la nube.
- Integracion en la aplicacion Herald para dictado privado.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado personal offline: Herald usa este modelo para convertir voz en texto en local, de modo que el audio nunca sale del dispositivo; el tamano de 0.6B y la cuantizacion Q8_0 permiten ejecutarlo en equipos de consumo.
- Transcripcion de reuniones confidenciales: al no requerir conexion, es adecuado para entornos donde el contenido de las conversaciones no puede enviarse a servicios externos (legal, sanidad, sector publico).
- Subtitulado de contenido multimedia en multiples idiomas: la cobertura de 30 idiomas permite generar subtitulos para videos en lenguas europeas y asiaticas con un unico modelo.
- Aplicaciones de accesibilidad: conversion de voz a texto en tiempo real para personas con movilidad reducida, integrada en herramientas de escritorio mediante transcribe.cpp.
- Procesamiento por lotes de archivos de audio: transcripcion de grandes volumenes de grabaciones (entrevistas, podcasts, notas de voz) en pipelines locales sin coste por minuto de API.
- Asistentes de voz integrados en aplicaciones de escritorio o moviles: el modelo actua como capa ASR dentro de un pipeline mayor, alimentando un LLM local para respuestas conversacionales.
- Investigacion en ASR multilingue: como punto de partida ligero para experimentos de ajuste fino o evaluacion en lenguas de bajos recursos incluidas en su lista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa aproximadamente 0,85 GB, por lo que la huella de memoria ronda 1 GB o algo mas contando buffers de audio y contexto.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con al menos 2 GB de VRAM libre deberia ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo moderna (GTX 1050 en adelante, RTX 30/40, Apple Silicon via Metal si transcribe.cpp lo soporta).
- Opciones de despliegue: transcribe.cpp es el motor indicado; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (este, GGUF Q8_0) | 782.452.240 | no disponible | 30 | Apache 2.0 | GGUF |
| Whisper (variantes de OpenAI) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, por lo que el rendimiento real en cada idioma y dominio (habla espontanea, ruido, acentos) es desconocido a partir de la documentacion.
- La informacion sobre arquitectura y entrenamiento es inexistente en la model card; conviene consultar el repositorio original de Qwen antes de usos en produccion.
- La cobertura de idiomas es amplia, pero la calidad puede variar notablemente entre lenguas; no se ofrecen metricas por idioma.
- Riesgo de alucinacion y errores de transcripcion en audio ruidoso, solapamiento de hablantes o terminos tecnicos no cubiertos en el entrenamiento; no se documenta mitigacion.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado sobre corpus no especificados, pueden aparecer sesgos dialectales y culturales.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion a Qwen (Alibaba Cloud) y a los autores de la conversion.
- El repositorio tiene 0 descargas y fue creado recientemente; es una redistribucion de nicho, sin garantias de mantenimiento.
- Solo se ofrece Q8_0 en este repositorio; otras cuantizaciones deben obtenerse del repositorio original de handy-computer.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/herald-dictation/Qwen3-ASR-0.6B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Conversion original GGUF: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Motor de inferencia transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
