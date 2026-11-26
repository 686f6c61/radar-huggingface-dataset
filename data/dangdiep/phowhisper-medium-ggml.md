# dangdiep/phowhisper-medium-ggml

## Resumen

PhoWhisper-medium-ggml es una conversion al formato ggml del modelo vinai/PhoWhisper-medium, desarrollado por VinAI Research para reconocimiento automatico del habla (ASR) en vietnamita. Esta version concreta, publicada por el usuario dangdiep, no introduce entrenamiento ni ajuste fino adicional: se limita a convertir los pesos originales de Hugging Face al formato que consume whisper.cpp y a cuantizarlos en q5_0 para reducir el espacio en disco y los requisitos de memoria.

El modelo resuelve el problema de transcribir audio en vietnamita en entornos locales o de escritorio, sin depender de servicios en la nube. Su relevancia practica reside en que whisper.cpp permite ejecutar inferencia en CPU y en hardware modesto, lo que facilita integrar ASR vietnamita en aplicaciones de escritorio. El autor lo emplea como segunda pasada opcional de transcripcion en la aplicacion 1Click editer.

La ficha se centra en esta distribucion cuantizada: un unico fichero binario de 539.212.484 bytes (aproximadamente 0,5 GB) con hash SHA-256 verificado. No se dispone de datos publicados sobre arquitectura detallada, numero de parametros exactos ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), segun el modelo base vinai/PhoWhisper-medium; detalles internos no disponibles |
| Parametros totales | no disponible (la variante "medium" de Whisper se asocia habitualmente a ~769M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper, sin dato confirmado) |
| Tipos de cuantizacion | q5_0 (unica variante publicada en este repositorio) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD 3-Clause (heredada de PhoWhisper, Copyright VinAI Research) |
| Formato de pesos | ggml binario (`ggml-phowhisper-medium-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo subyacente es PhoWhisper-medium de VinAI Research, un ajuste de Whisper para vietnamita presentado en el ICLR 2024 Tiny Papers track. Whisper es una arquitectura transformer encoder-decoder entrenada para transcripcion y traduccion de voz. Esta distribucion no modifica los pesos de VinAI: unicamente aplica el script `models/convert-h5-to-ggml.py` de whisper.cpp sobre el checkpoint de Hugging Face y despues cuantiza a q5_0.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica de esta publicacion es exclusivamente de empaquetado: ofrecer un artefacto ggml listo para whisper.cpp, con hash SHA-256 publicado (`e2cd4ceda28646fc74e48f171fad8ebd75e0ab06817d70349bc42ae2335bfc27`) y un fichero `SHA256SUMS` para verificar integridad antes de su uso.

## Capacidades

- Reconocimiento automatico del habla en vietnamita, con salida de transcripcion de texto.
- Ejecucion local mediante whisper.cpp, sin dependencia de API externa.
- Inferencia en CPU y en hardware de gama consumer, gracias a la cuantizacion q5_0.
- Integracion como segunda pasada de transcripcion para mejorar resultados en una aplicacion de escritorio (caso documentado por el autor en 1Click editer).
- Verificacion de integridad del fichero mediante SHA-256 antes de cargarlo.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidades multilingues: limitadas al vietnamita segun la etiqueta de idioma del repositorio.

## Casos de uso

- Transcripcion de reuniones y entrevistas en vietnamita: el modelo convierte audio a texto en local, adecuado para entornos con requisitos de privacidad en los que no se desea enviar el audio a un servicio en la nube.
- Segunda pasada de transcripcion en aplicaciones de escritorio: tal como lo usa el autor, se ejecuta tras una primera transcripcion para refinar el resultado en vietnamita, aprovechando que el fichero se descarga una sola vez y se verifica por hash.
- Subtitulado de contenido audiovisual vietnamita: genera transcripciones que pueden convertirse en subtitulos para videos, cursos o material formativo.
- Digitalizacion de archivos de audio historicos o periodisticos: permite indexar y buscar contenido hablado en vietnamita sin infraestructura cloud.
- Prototipado de asistentes de voz para vietnamita: sirve como componente ASR en pipelines de voz a texto dentro de aplicaciones de demostracion o investigación.
- Herramientas de accesibilidad: transcripcion en tiempo casi real de conversaciones para personas con dificultades auditivas en contextos vietnamitas, ejecutandose en equipos de sobremesa o portatiles.
- Analisis de grabaciones de atencion al cliente: conversion de llamadas a texto para su posterior revision o clasificacion, manteniendo los datos en la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero cuantizado ocupa 539.212.484 bytes (~0,5 GB); la memoria de trabajo durante la inferencia sera superior al tamano del fichero, pero no se dispone de una cifra oficial en la informacion proporcionada.
- GPU recomendadas: no disponible. whisper.cpp puede ejecutarse en CPU; el soporte GPU depende de la compilacion (por ejemplo, backend CUDA o Metal) y no se detalla en la model card.
- Compatibilidad con GPU consumer: probable en equipos de gama media por el tamano del artefacto, pero sin datos confirmados de rendimiento.
- Opciones de despliegue: whisper.cpp (formato nativo ggml). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dangdiep/phowhisper-medium-ggml | no disponible | no disponible | vi | BSD 3-Clause | ggml q5_0 | Conversion de PhoWhisper-medium para whisper.cpp |
| vinai/PhoWhisper-medium | no disponible | no disponible | vi | BSD 3-Clause | safetensors (Hugging Face) | Modelo original de VinAI; requiere conversion para whisper.cpp |
| Whisper medium (OpenAI) | ~769M (segun literatura publica de Whisper) | no disponible | multilingue | MIT (licencia habitual de Whisper) | diversos | Modelo generalista; el rendimiento en vietnamita no se compara aqui por falta de datos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a formato, licencia e idioma.

## Limitaciones y advertencias

- Solo soporta vietnamita; no debe esperarse un rendimiento fiable en otros idiomas.
- Al ser una cuantizacion q5_0, puede existir una perdida de precision respecto a los pesos originales en safetensors; no se cuantifica esa perdida en la informacion disponible.
- No se han publicado evaluaciones de sesgo, alucinacion o robustez ante ruido de fondo para esta conversion.
- Riesgo de transcripciones incorrectas en audio con acentos marcados, ruido o solapamiento de hablantes; no hay datos que lo cuantifiquen.
- La licencia BSD 3-Clause permite uso comercial, pero obliga a conservar el aviso de copyright de VinAI Research y la clausula de exencion de responsabilidad; debe revisarse el texto completo en el repositorio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de una publicacion reciente y sin validacion comunitaria.
- El autor indica que el modelo se usa en una aplicacion de escritorio con consentimiento del usuario y verificacion SHA-256; en otros despliegues conviene replicar esa verificacion de integridad.
- No hay garantias de mantenimiento ni actualizaciones del artefacto por parte del publicador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dangdiep/phowhisper-medium-ggml
- Modelo base: https://huggingface.co/vinai/PhoWhisper-medium
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Licencia original PhoWhisper: https://github.com/VinAIResearch/PhoWhisper/blob/main/LICENSE
- Repositorio PhoWhisper (VinAI Research): https://github.com/VinAIResearch/PhoWhisper
