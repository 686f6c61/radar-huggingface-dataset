# alexc09/Qwen3.5-0.8B-Tags-Gist-Summary-LiteRT

## Resumen

Qwen3.5-0.8B-Tags-Gist-Summary-LiteRT es una version cuantizada y empaquetada en formato LiteRT-LM del modelo alexc09/Qwen3.5-0.8B-Tags-Gist-Summary, un fine-tuning del Qwen3.5-0.8B orientado especificamente a la generacion de etiquetas tematicas, resumenes de una linea (gists) y resumenes estructurados de transcripciones de grabaciones de voz. Lo publica el usuario alexc09 y esta disenado para ejecutarse en dispositivos moviles (on-device) con el runtime LiteRT-LM de Google, lo que permite procesar audio transcrito directamente en el telefono sin enviar datos a la nube.

El modelo hereda la arquitectura del Qwen3.5-0.8B, con un contexto nativo de 262k tokens, pero el autor lo ha recortado deliberadamente a 4.096 tokens durante la conversion para ajustarse a las restricciones de memoria de un telefono. El fichero pesa aproximadamente 0,9 GB y usa cuantizacion int8 canal a canal en las capas fully-connected y en el embedding, manteniendo en coma flotante las capas GatedDeltaNet `in_proj_a` e `in_proj_b`. Incluye 11 tamanos de prefill (1024, 512, ..., 2, 1) para optimizar la latencia en peticiones cortas.

Es relevante porque aborda un caso de uso muy concreto y poco cubierto por los modelos generalistas: la organizacion automatica de grabaciones de voz largas (de 1 a 5 horas) mediante un pipeline de troceado, etiquetado por partes y fusion posterior. El modelo esta entrenado para cuatro tipos de peticion especificos y produce JSON para etiquetas y lineas de texto plano para resumenes, una decision de diseno motivada porque el JSON se rompia en aproximadamente un tercio de los casos con modelos moviles anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (con capas GatedDeltaNet), empaquetado para LiteRT-LM |
| Parametros totales | 0.8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (recortado desde los 262k del modelo base) |
| Tipos de cuantizacion | int8 canal a canal en fully-connected y embedding; capas GatedDeltaNet `in_proj_a`/`in_proj_b` en coma flotante |
| Idiomas soportados | en, zh, es, fr, ja, ko; entrenado tambien para grabaciones mixtas chino-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 881.710.304 bytes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 0.8B parametros con atencion hibrida que incluye capas GatedDeltaNet, y ha sido fine-tuneado sobre el dataset `alexc09/voice-recording-transcripts-tags-summaries`, compuesto por transcripciones de grabaciones de voz con sus etiquetas y resumenes asociados. El entrenamiento se centra en cuatro tipos de peticion (plantillas de prompt) que cubren etiquetado con gist, fusion de etiquetas de fragmentos, puntos clave por fragmento y generacion de vision general con gist. Cada peticion es un chat nuevo con un mensaje de sistema fijo y un mensaje de usuario construido a partir de plantillas con variables como `{tag_list}`, `{text}` y `{output_language}`.

La innovacion principal no esta en el entrenamiento sino en el empaquetado y la estrategia de despliegue: la conversion a LiteRT-LM con `--cache_length 4096` reduce el contexto para que el modelo quepa en memoria de telefono, y el autor documento que ventanas de 32k funcionan pero multiplican la latencia (de 7s a 19s en peticiones cortas) y el consumo de memoria (de aproximadamente 2,5 GB a 5 GB), mientras que 8k no aporta mejoras de calidad. El modelo produce JSON para etiquetas y gists, y texto plano para resumenes, decision basada en la fragilidad del JSON en modelos moviles previos. El runtime envuelve las peticiones en la plantilla de chat de Qwen3.5 con el modo thinking desactivado (bloque think vacio).

## Capacidades

- Generacion de 0 a 5 etiquetas tematicas a partir de una lista existente, con posibilidad de sugerir etiquetas nuevas.
- Generacion de un gist: una frase de como maximo 45 caracteres (aproximadamente 22 en chino, japones o coreano).
- Resumenes estructurados por fragmentos (puntos clave) y vision general final con su propio gist.
- Fusion de etiquetas y gists de multiples fragmentos en un unico conjunto para grabaciones largas.
- Salida en JSON para etiquetas y gists, y en texto plano para resumenes.
- Soporte multilingue: ingles, chino simplificado, coreano, japones, espanol y frances, ademas de lectura de grabaciones mixtas chino-ingles.
- Capacidad de leer y procesar transcripciones de hasta aproximadamente 3.000 tokens (unos 15 minutos de audio a 150 palabras por minuto).
- No soporta tool calling, function calling ni razonamiento multi-paso general; no es un modelo de chat general.

## Casos de uso

- Organizacion automatica de notas de voz en el telefono: el modelo recibe la transcripcion y una lista de etiquetas existentes, y devuelve etiquetas y un gist, permitiendo clasificar grabaciones sin salir del dispositivo y sin coste de API.
- Resumen de reuniones largas: para grabaciones de 1 a 5 horas, el pipeline trocea en fragmentos de aproximadamente 15 minutos, etiqueta cada uno y fusiona los resultados en un conjunto final de etiquetas y un gist global.
- Generacion de resumenes de entrevistas o clases: el modelo produce puntos clave por fragmento de aproximadamente 12 minutos y una vision general final, util para revisar contenido sin escuchar el audio completo.
- Aplicaciones de productividad personal con privacidad: al ejecutarse on-device con LiteRT-LM, las transcripciones no abandonan el telefono, lo que encaja en escenarios con datos sensibles (salud, legal, reuniones internas).
- Clasificacion de archivos de audio en bibliotecas grandes: el etiquetado con lista de etiquetas predefinida permite indexar y buscar grabaciones por tema en aplicaciones de gestion documental o archivado personal.
- Soporte multilingue en apps de notas: el modelo cubre espanol, frances, aleman, japones, coreano y chino, ademas de grabaciones mixtas chino-ingles, lo que sirve para usuarios bilingues o equipos internacionales.
- Integracion en apps Android mediante el SDK `com.google.ai.edge.litertlm:litertlm-android:0.19.1`: el modelo se puede empaquetar como recurso de la aplicacion y ejecutar en CPU, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor reporta aproximadamente 2,5 GB de memoria con contexto de 4k, y aproximadamente 5 GB con contexto de 32k; con 8k se anaden unos 0,4 GB.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU en dispositivos moviles con el runtime LiteRT-LM.
- Cabe en consumer GPU: si, aunque el objetivo es ejecucion en telefono; en un PC se puede ejecutar mediante el runtime LiteRT-LM.
- Opciones de despliegue: LiteRT-LM 0.19.1 (Android `com.google.ai.edge.litertlm:litertlm-android:0.19.1`, CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: peticiones cortas de aproximadamente 7 segundos con contexto de 4k; con contexto de 32k suben a unos 19 segundos. No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Tags-Gist-Summary-LiteRT | 0.8B | 4.096 | LiteRT-LM (int8) | apache-2.0 | Etiquetado y resumen de voz on-device |
| Qwen3.5-0.8B-Tags-Gist-Summary (base) | 0.8B | 262k (nativo) | safetensors (no confirmado) | apache-2.0 | Mismo fine-tuning, sin empaquetar para movil |
| LFM2.5 1.2B (mencionado en la model card) | 1.2B | no disponible | no disponible | no disponible | Modelo movil previo usado por la app; generaba JSON roto en aproximadamente 1/3 de los casos |

## Limitaciones y advertencias

- No es un modelo de chat general: solo esta entrenado para los cuatro tipos de peticion descritos (etiquetas+gist, fusion, puntos clave y vision general+gist).
- Los resumenes no son totalmente fiables: el autor advierte que a veces mezclan hechos.
- Contexto limitado a 4.096 tokens, lo que obliga a trocear transcripciones y anade complejidad al pipeline.
- El JSON de salida puede romperse en algunos casos, aunque el autor indica que el formato de texto plano para resumenes es mas robusto en modelos moviles.
- Las etiquetas nuevas sugeridas siguen el idioma del gist, lo que puede no coincidir con el idioma de la lista de etiquetas del usuario.
- Al ser un modelo de 0.8B, la calidad en razonamiento complejo, matices semanticos o dominios muy tecnicos es limitada.
- No se han publicado evaluaciones de sesgo ni de alucinacion; se recomienda validacion en produccion.
- Licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y del runtime LiteRT-LM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexc09/Qwen3.5-0.8B-Tags-Gist-Summary-LiteRT
- Modelo base (fine-tuning): https://huggingface.co/alexc09/Qwen3.5-0.8B-Tags-Gist-Summary
- Dataset de entrenamiento: https://huggingface.co/datasets/alexc09/voice-recording-transcripts-tags-summaries
- Runtime LiteRT-LM (Android): `com.google.ai.edge.litertlm:litertlm-android:0.19.1`
