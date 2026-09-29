# nub235/pianissimo-sv-gguf

## Resumen

pianissimo-sv-gguf es una conversión al formato GGUF del modelo KlangAI/pianissimo-sv (Klang Pianissimo), publicada por el usuario nub235 para su uso con la librería transcribe.cpp. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado en sueco, construido sobre el ajuste fino sueco del modelo NVIDIA parakeet-tdt-0.6b-v3 realizado por Klang. El problema que resuelve es la transcripción de audio en sueco con puntuación, uso de mayúsculas y marcas de tiempo opcionales a nivel de token, en un formato ligero y portable que no requiere el ecosistema NeMo en tiempo de ejecución.

Técnicamente, el modelo combina un codificador FastConformer con un decodificador transducer TDT/RNNT. Cuenta con 627.052.166 parámetros totales y conserva la geometría del modelo base parakeet-tdt-0.6b-v3, incluyendo su tokenizador SentencePiece de 8.192 piezas, pero introduce una ventana de atención local de 256 frames codificados a cada lado en cada capa, lo que hace que el coste de atención crezca de forma lineal con la duración de la grabación y permite abordar audios largos de forma práctica.

Su relevancia actual radica en que ofrece un ASR monolingüe sueco de alta calidad en un único fichero GGUF de 705 MB (Q8_0) que se carga en transcribe.cpp estándar sin modificaciones, parches ni banderas de compilación, con un WER de 6,52% en el split de test completo de FLEURS `sv_se` y una latencia mediana de 276 ms por clip en un Apple M2 con Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + decodificador transducer TDT/RNNT |
| Parametros totales | 627.052.166 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; ventana de atencion local de 256 frames codificados a cada lado por capa |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | sueco (sv); el resto de idiomas no estan evaluados |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

Datos adicionales: tamano del repositorio 0,7 GB; fichero `pianissimo-sv-Q8_0.gguf` de 705 MB; tokenizador SentencePiece de 8.192 piezas; entrada de 16 kHz mono WAV; commit upstream fijado 95c85c9 (28-09-2026); commit de validacion de transcribe.cpp c1fee50.

## Arquitectura y entrenamiento

El modelo es un ajuste fino en sueco de NVIDIA parakeet-tdt-0.6b-v3, desarrollado por Klang. La arquitectura sigue el esquema parakeet: un codificador FastConformer (transformer convolucional con atencion eficiente) acoplado a un decodificador transducer TDT/RNNT que emite directamente transcripciones con puntuacion y mayusculas. Mantiene la geometria y el tokenizador SentencePiece de 8.192 piezas del modelo v3, pero sustituye la atencion por una ventana local de 256 frames a cada lado en cada capa, implementada como datos en `stt.parakeet.encoder.att_context_{left,right}`. Esta es la primera variante de atencion local de la familia en 0.6B, segun la model card.

El entrenamiento se realizo sobre aproximadamente 50.000 horas de habla en sueco. No se detallan en la informacion disponible la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La conversion a GGUF reproduce de forma fiel la calidad del checkpoint original: el autor reporta una diferencia de 0,01 puntos porcentuales de WER frente a la referencia NeMo en fp32, y en un subconjunto de 64 utterances, 56 de 64 hipotesis fueron identicas byte a byte respecto a la referencia fp32. El modelo base no es de streaming y no traduce.

## Capacidades

- Transcripcion de voz a texto en sueco con puntuacion y uso de mayusculas (transcripcion con formato).
- Marcas de tiempo a nivel de token (y de palabra segun la model card).
- Entrada de audio de 16 kHz mono WAV.
- Decodificacion greedy transducer sin modelo de lenguaje externo.
- Acepta el hint de idioma `-l sv` (unico idioma que reconoce); tambien funciona sin hint.
- Salida determinista y reproducible a nivel de hipotesis en comparacion con la referencia NeMo.
- NO soporta streaming (`streaming: false`).
- NO traduce (`translate: false`).
- NO realiza deteccion automatica de idioma (`lang_detect: false`); un hint de otro idioma es rechazado con error (`run: unsupported language`, exit 1).
- No se declaran capacidades de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en sueco: al usar atencion local con ventana de 256 frames, el coste crece de forma lineal con la duracion, por lo que grabaciones largas siguen siendo viables en un solo fichero de 705 MB.
- Subtitulado automatico: la generacion de marcas de tiempo a nivel de token permite alinear texto y audio para producir subtitulos en sueco.
- Archivado y busqueda de contenido audiovisual sueco: transcripcion masiva de audio historico con puntuacion y mayusculas para indexacion y busqueda textual.
- Notas clinicas o de reuniones dictadas: entrada de WAV mono de 16 kHz y salida con formato listo para revision humana.
- Asistentes de voz locales en sueco: el fichero GGUF se carga en transcribe.cpp sin dependencias de NeMo, lo que facilita su integracion en aplicaciones de escritorio o edge.
- Procesamiento de audio por lotes en pipelines: la decodificacion greedy y la latencia mediana de 276 ms por clip en Apple M2 lo hacen adecuado para transcripcion por lotes sin GPU de datacenter.
- Investigacion en ASR sueco: sirve como referencia cuantizada de un modelo parakeet fine-tuneado, util para comparar calidad fp32 frente a Q8_0.
- Documentacion accesible: conversion de contenido hablado en sueco a texto para cumplir requisitos de accesibilidad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Referencia |
|---|---|---|---|
| FLEURS `sv_se` test (759 utterances) | WER | 6,52% (IC 95%: 6,00-7,10) | Q8_0, batch 1, greedy, sin LM externo |
| FLEURS `sv_se` test, checkpoint NeMo fp32 | WER | 6,53% (IC 95%: 6,02-7,10) | Referencia NeMo sobre el mismo manifest |
| FLEURS `sv_se` test, cifra publicada por Klang | WER | 6,51% | Cifra de la model card de Klang |
| Latencia mediana por clip | ms | 276 ms | Apple M2 (Metal), este fichero Q8_0 |
| Latencia mediana por clip | ms | 814 ms | NeMo fp32 en la misma maquina |
| Similitud de hipotesis (subconjunto de 64) | identicas byte a byte | 56 de 64 | NeMo fp32 frente a este fichero |
| Tasa de exito | clips transcritos | 759 de 759 sin error | Split completo FLEURS `sv_se` |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 ocupa 705 MB en disco; la inferencia requiere aproximadamente ese tamano mas el overhead del runtime, por lo que es viable con menos de 2 GB de memoria.
- Cabe holgadamente en GPUs de consumo: cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090) y tambien en CPU.
- Ejecucion validada en Apple M2 con backend Metal: latencia mediana de 276 ms por clip.
- Opciones de despliegue: transcribe.cpp (libreria y binario `transcribe-cli`), compilado desde fuente. No se mencionan otros runtimes compatibles en la informacion disponible.
- No requiere NeMo en tiempo de ejecucion ni un fork o parche de transcribe.cpp; funciona con el `main` upstream (c1fee50).
- Requisito de entrada: audio de 16 kHz mono WAV; para otras fuentes hay que convertir previamente con ffmpeg (`-ar 16000 -ac 1`).
- Throughput: no disponible (solo se publica latencia mediana por clip).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Atencion | Idioma | Licencia | WER FLEURS sv_se |
|---|---|---|---|---|---|---|
| nub235/pianissimo-sv-gguf (este) | 627 M | GGUF Q8_0 | local 256/256 | sv | CC-BY-4.0 | 6,52% |
| KlangAI/pianissimo-sv (base) | ~0,6 B | NeMo (.nemo) fp32 | local 256/256 | sv | CC-BY-4.0 | 6,51% (publicado) / 6,53% (medido) |
| NVIDIA parakeet-tdt-0.6b-v3 | ~0,6 B | NeMo | no local en v3 | 25 idiomas | no disponible | no disponible para sv |
| NVIDIA parakeet-tdt_ctc-1.1b | ~1,1 B | NeMo | local 128/128 | no disponible | no disponible | no disponible |

Nota: el modelo base parakeet-tdt-0.6b-v3 cubre 25 idiomas, mientras que este ajuste declara unicamente sueco porque Klang no ha evaluado el rendimiento en otros idiomas ni en code-switching. La variante parakeet-tdt_ctc-1.1b es la que ya usaba atencion local 128/128 en transcribe.cpp.

## Limitaciones y advertencias

- Riesgo de alucinacion: aunque es un modelo transducer con decodificacion greedy y no un modelo generativo de lenguaje, puede producir errores de sustitucion, insercion o borrado en audio con ruido, acentos no vistos o solapamiento de hablantes; el WER de 6,52% implica un margen de error no despreciable.
- Sesgos: no se documentan analisis de sesgo por variedad dialectal, genero, edad o procedencia; el entrenamiento se realizo sobre unas 50.000 horas de habla sueca cuya composicion no se detalla, lo que puede introducir sesgos hacia las variedades mas representadas.
- Limitaciones de idioma: solo sueco. Pasar un hint de otro idioma provoca un error explicito (`run: unsupported language`, exit 1). El rendimiento en otros idiomas y en code-switching no esta establecido.
- Limitaciones de contexto/streaming: no es un modelo de streaming; no es adecuado para transcripcion en tiempo real continua tal cual. No traduce y no hace deteccion de idioma.
- Entrada restringida: requiere WAV mono a 16 kHz; es necesario remuestrear otras fuentes antes de la inferencia.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que revisar los terminos completos de la model card original de KlangAI/pianissimo-sv para conocer las condiciones exactas de atribucion y cualquier restriccion adicional.
- Dependencia de runtime: validado unicamente contra transcribe.cpp (commit c1fee50, 28-09-2026); otros runtimes pueden no soportar el formato o la variante de atencion local.
- Nota de integracion: la variante `pianissimo-sv` se anadio a la allow-list de tests de transcribe.cpp (`tests/parakeet_real_smoke.cpp`); esa comprobacion es solo de test y no afecta al cargador, pero la suite de tests upstream rechazaria la cadena de variante si no se aplica el cambio.
- Conversion reproducible: recrear el GGUF desde el fichero `.nemo` requiere una entrada `pianissimo-sv` en `VARIANT_PROFILES` de `scripts/convert-parakeet.py`; no afecta a la ejecucion.
- Popularidad baja: 10 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nub235/pianissimo-sv-gguf
- Modelo base: https://huggingface.co/KlangAI/pianissimo-sv
- Commit upstream de origen: https://huggingface.co/KlangAI/pianissimo-sv/commit/95c85c9
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/c1fee503219ea82dc2e42917150198a31b2ecc2a
- Fichero Q8_0 (descarga directa): https://huggingface.co/nub235/pianissimo-sv-gguf/resolve/main/pianissimo-sv-Q8_0.gguf
- SHA-256 del fichero Q8_0: `350bd38ea3849e0d6c05e680595ef81c185678e2d28eec0524ef704f4c345a4f`
