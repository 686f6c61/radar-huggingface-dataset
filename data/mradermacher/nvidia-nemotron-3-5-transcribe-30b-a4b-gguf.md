# mradermacher/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Transcribe es un modelo de lenguaje para reconocimiento automático del habla (ASR) desarrollado por NVIDIA Research. Se presenta como un modelo abierto de pesos ("open speech LLM") capaz de transcribir 40 idiomas de forma literal o en formato escrito, con contexto, atribución de hablante (diarización) y marcas de tiempo a nivel de palabra, todo seleccionable mediante instrucciones en lenguaje natural. Según NVIDIA, es el mejor modelo de pesos abiertos en las leaderboards Open ASR en inglés y multilingüe.

El modelo base se publica como `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, lo que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 30B parámetros totales y unos 4B activos por token. La ficha que nos ocupa, de mradermacher, es una conversión estática a GGUF de ese modelo base, pensada para inferencia en CPU o GPU con llama.cpp y derivados.

Un dato relevante y contradictorio: los metadatos de safetensors del repositorio GGUF indican 733.603.368 parámetros, muy por debajo de los 30B que sugiere el nombre. Esto puede deberse a que el repositorio contiene únicamente un componente (por ejemplo, el proyector multimodal o el tokenizer acoplado) o a una conversión parcial. El tamaño del repositorio (2,3 GB) es coherente con un modelo de ~0,7B parámetros cuantizado, no con uno de 30B. El usuario debe verificar los archivos antes de asumir el tamaño real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se infiere como speech LLM con backbone tipo MoE, 30B totales / 4B activos, segun el nombre; no confirmado en la informacion disponible) |
| Parametros totales | 733.603.368 segun safetensors del repo GGUF; el nombre del modelo base indica 30B (contradiccion no resuelta) |
| Parametros activos | no disponible (el sufijo A4B del modelo base sugiere ~4B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | 40 idiomas de transcripcion segun NVIDIA (lista concreta no disponible) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); pesos originales del modelo base presumiblemente safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna, la composicion del dataset de entrenamiento, el numero de horas de audio utilizadas ni si hubo etapas de RLHF o DPO. La informacion publica de NVIDIA describe el modelo como un "speech LLM" para transcripcion inteligente, lo que implica un encoder de audio acoplado a un backbone de lenguaje; el sufijo A4B del nombre del modelo base apunta a una mezcla de expertos con activacion dispersa. La model card del repositorio GGUF no aporta informacion adicional: solo documenta la conversion estatica (`quantize_version: 2`, `convert_type: hf`) e indica que los cuantizados derivan del checkpoint `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`.

La innovacion destacada por NVIDIA no es arquitectonica sino funcional: un unico modelo que unifica transcripcion literal, normalizacion escrita, diarizacion y timestamps por palabra, controlados mediante prompts en lenguaje natural, en lugar de pipelines separados de ASR, diarizacion y alineacion forzada.

## Capacidades

- Transcripcion de voz a texto en 40 idiomas, en modo literal (verbatim) o en formato escrito (normalizado).
- Atribucion de hablante (diarizacion) dentro de la misma salida.
- Marcas de tiempo a nivel de palabra.
- Control de la salida mediante instrucciones en lenguaje natural (seleccion de idioma, formato, inclusion de contexto).
- Uso de contexto para mejorar la transcripcion (terminologia, nombres propios, dominio).
- No se ha confirmado en la informacion disponible soporte de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo puede producir actas con identificacion de hablantes y marcas temporales por palabra, lo que permite atribuir cada intervencion y enlazar fragmentos a minutos concretos del audio.
- Subtitulado y postproduccion audiovisual: los timestamps por palabra facilitan la generacion de subtitulos sincronizados (SRT/VTT) sin necesidad de un alineador externo.
- Archivado y indexacion de audio historico: transcripcion multilingue de 40 idiomas con normalizacion escrita para hacer busquedas de texto completo sobre fonotecas.
- Atencion al cliente y analisis de calidad: transcripcion de llamadas con diarizacion para separar agente y cliente, permitiendo analisis posterior de cumplimiento y deteccion de incidencias.
- Documentacion clinica o legal dictada: el modo verbatim conserva muletillas y formulaciones exactas, util cuando la fidelidad literal es requisito; el modo escrito sirve para informes legibles.
- Investigacion en linguistica de corpus: transcripcion masiva de grabaciones con contexto inyectado (glosarios, jerga) para reducir errores en vocabulario especializado.
- Despliegue local con llama.cpp/Ollama: los cuantizados GGUF permiten ejecutar la transcripcion en hardware sin GPU dedicada, aunque el tamano real de los pesos debe verificarse antes de planificar recursos.

## Benchmarks y rendimiento

NVIDIA afirma en su pagina de investigacion que el modelo es el mejor de pesos abiertos en las leaderboards Open ASR en ingles y multilingue. No se han publicado en la informacion disponible cifras concretas (WER, DER, latencia) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con fiabilidad. Si el repositorio contiene realmente ~0,7B parametros, los cuantizados Q4_K_M ocuparian del orden de 0,5 GB y cabrian en cualquier GPU consumer; si el modelo completo es de 30B con 4B activos, Q4_K_M requeriria aproximadamente 18-20 GB y Q8_0 unos 32 GB.
- GPU recomendadas: no disponible. Para el escenario de 30B MoE, una RTX 4090 (24 GB) podria ejecutar cuantizados Q4; para f16 harian falta A100 40/80 GB o H100.
- Consumer GPU: probablemente si en el escenario de 0,7B; condicionado en el escenario de 30B (solo cuantizados bajos en GPUs de 24 GB).
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF. No se ha confirmado compatibilidad con vLLM o TGI para esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Transcribe (base) | ~30B totales / ~4B activos (segun nombre) | no disponible | 40 | no disponible | safetensors (presumible) |
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF (esta ficha, mradermacher) | 733.603.368 segun safetensors | no disponible | no disponible | no disponible | GGUF |
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF (prithivMLmods) | ~33B segun model card | no disponible | no disponible | no disponible | GGUF |
| Whisper large-v3 (referencia ASR clasico) | ~1,55B | 30 s de audio por ventana | ~99 | MIT | safetensors, GGUF, etc. |

La comparativa con Whisper se incluye solo como referencia de categoria; no hay datos de benchmarks en la informacion disponible para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Contradiccion de tamanos: los safetensors del repo indican 733.603.368 parametros frente a los 30B del nombre del modelo base. Verificar los archivos antes de cualquier planificacion de infraestructura.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Consultar la licencia del modelo base `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` antes de desplegar.
- Repositorio con 0 descargas y 0 likes: conversion reciente y sin validacion comunitaria; no hay evidencia publica de que los cuantizados funcionen correctamente.
- Sin datos de benchmarks propios del GGUF: el rendimiento puede degradarse respecto al checkpoint original, especialmente en cuantizados Q2/Q3.
- Riesgo de alucinacion en audio ruidoso o con solapamiento de hablantes; los modelos ASR generativos pueden inventar texto en segmentos ininteligibles.
- Idiomas concretos no listados: los 40 idiomas anunciados por NVIDIA no estan detallados en la informacion disponible; el rendimiento variara por idioma.
- Sin confirmacion de contexto maximo: planificar la duracion de audio por segmento con prudencia.
- La model card del repo GGUF no documenta limitaciones, sesgos ni casos de fallo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Pagina de investigacion de NVIDIA: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Transcribe/
- Conversion GGUF alternativa (prithivMLmods): https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
