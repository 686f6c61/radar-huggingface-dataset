# olaverse/diacnet-2.0

## Resumen

diacnet-2.0 es un modelo de restauracion de diacriticos, tonos y marcas vocalicas arabes (tashkeel) desarrollado por olaverse. Se trata de un encoder-decoder a nivel de byte, afinado a partir de google/byt5-base, con 582 millones de parametros y pesos almacenados en safetensors (fp32). Su proposito es tomar texto sin marcas y devolverlo con la acentuacion, los tonos o los signos diacriticos correctos, en 11 idiomas y desde un unico modelo.

El modelo cubre yoruba, igbo, hausa, vietnamita, polaco, turco, portugues, espanol, frances, italiano y arabe (con y sin terminaciones de caso). Segun la model card, es el diacritizador de Olaverse mas preciso en 8 de 10 idiomas y reduce la tasa de error del yoruba de 0,174 a 0,070 respecto a diacnet-1.1, un factor de 2,5 veces. Tambien incorpora novedades practicas como el modo de deteccion automatica de idioma (`<auto>`), pistas de significado (`[g: word=meaning]`) y un helper de alineacion que garantiza que el texto original nunca se modifica.

Es relevante porque aborda un problema de normalizacion linguistica poco cubierto por los grandes modelos generativos: la reconstruccion fiable de marcas diacriticas en corpus, entradas de usuario o texto historico, con tasas de error documentadas y un enfoque de alineacion que evita alteraciones no deseadas del contenido. Al ser apache-2.0 y de tamano moderado, puede desplegarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder a nivel de byte (ByT5-base): 18 capas de encoder + 6 de decoder, d_model 1536, 12 cabezas |
| Parametros totales | 581.653.248 (582M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no fijada por posiciones absolutas (ByT5); la model card limita a unos 300 caracteres por llamada, con troceado para textos mas largos |
| Tipos de cuantizacion | no disponible (pesos en fp32; la model card recomienda bf16 en GPU) |
| Idiomas soportados | yoruba (yo), igbo (ig), hausa (ha), vietnamita (vi), polaco (pl), turco (tr), portugues (pt), espanol (es), frances (fr), italiano (it), arabe (ar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2,3 GB, fp32) |

## Arquitectura y entrenamiento

diacnet-2.0 es un ajuste fino de google/byt5-base, un transformer encoder-decoder que opera sobre bytes en lugar de tokens. La configuracion base incluye 18 capas de encoder y 6 de decoder, con d_model de 1536 y 12 cabezas de atencion. Al trabajar a nivel de byte, el modelo no depende de un vocabulario especifico y puede procesar directamente caracteres con marcas combinantes, lo que resulta adecuado para idiomas con tonos y diacriticos (yoruba, igbo, hausa, vietnamita) y para el tashkeel arabe.

El ajuste se realizo sobre el dataset olaverse/diacnet-1.1-train, con evaluacion en olaverse/diacbench. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. Entre las innovaciones destacadas figuran el formato de entrada `<tag> [g: word=meaning] text`, que permite indicar el significado de palabras ambiguas (mejora la precision en vietnamita de 0,63 a 0,90), un helper de alineacion basado en difflib que conserva todas las letras del texto original y toma unicamente las marcas (cumplimiento del 100 % por construccion), un modo `<auto>` de deteccion de idioma y un modo `<ara-nocase>` para arabe sin terminaciones de caso.

## Capacidades

- Restauracion de diacriticos, tonos y marcas vocalicas en 11 idiomas desde un unico modelo.
- Diacritizacion completa de arabe clasico (`<ara>`) y modo sin terminaciones de caso (`<ara-nocase>`).
- Deteccion automatica de idioma mediante la etiqueta `<auto>`, con error a menos de 0,0005 del tag explicito.
- Pistas de significado con `[g: word=meaning]` para palabras cuyas marcas dependen del sentido.
- Conservacion de marcas ya presentes en la entrada (99,9-100 %) y relleno de las restantes (entrada parcial).
- Helper de alineacion que garantiza que el texto original no cambia (cumplimiento del 100 % por construccion); la salida bruta ademas corrige erratas.
- Procesamiento de textos largos mediante troceado automatico (unos 300 caracteres por llamada).
- Tareas de text-to-text (pipeline_tag: text-generation; arquitectura text2text-generation).
- Integracion con la libreria `olaverse` (v0.4.0+), que envuelve troceado, batching, alineacion y pistas en una sola llamada.

## Casos de uso

- Normalizacion de corpus en yoruba, igbo o hausa: restaurar tonos y diacriticos en textos recopilados sin marcas, mejorando la calidad de datasets para entrenamiento o busqueda.
- Preprocesado de entradas de usuario en vietnamita: anadir tonos a consultas escritas sin acentos para mejorar la coincidencia en sistemas de recuperacion (por ejemplo, con soporte de pistas de significado para palabras ambiguas).
- Aplicaciones de aprendizaje de idiomas: mostrar la forma correcta con diacriticos de una frase introducida por el estudiante, usando el modo alineado para no alterar su texto original.
- Publicacion editorial en polaco, turco, portugues, espanol, frances o italiano: restaurar tildes y signos perdidos durante la digitalizacion o el copiado entre sistemas.
- Tratamiento de texto arabe sin tashkeel: diacritizar textos para ensenanza, recitacion o sintesis de voz, eligiendo entre modo completo y sin terminaciones de caso.
- Pipelines de TTS y ASR: introducir marcas vocalicas o tonales antes de la sintesis para mejorar la pronunciacion en arabe, vietnamita o yoruba.
- Limpieza de datos historicos: aplicar entrada parcial para completar marcas ausentes conservando las ya presentes, util en archivos digitalizados.

## Benchmarks y rendimiento

Los datos disponibles en la model card se resumen a continuacion. Las cifras de error corresponden a tasas reportadas por el autor; no se dispone de una tabla completa con MMLU, HumanEval o GSM8K, que no son aplicables a esta tarea.

| Metrica | diacnet-2.0 | Referencia | Notas |
|---|---|---|---|
| Tasa de error en yoruba | 0,070 | diacnet-1.1: 0,174 | Mejora de 2,5 veces; frases totalmente correctas 12 % (1.1: 0,8 %) |
| DER en arabe clasico (`<ara>`) | 0,095 | no disponible | Diacritizacion completa |
| DER en arabe sin terminaciones (`<ara-nocase>`) | 0,072 | no disponible | — |
| Error con `<auto>` frente a tag explicito | diferencia <= 0,0005 | — | Deteccion automatica de idioma |
| Precision en palabras ambiguas en vietnamita | 0,90 | 0,63 sin pistas | Con `[g: word=meaning]` |
| Conservacion de marcas con entrada parcial | 99,9-100 % | — | Marcas existentes preservadas |

Ademas, la model card afirma que diacnet-2.0 es el diacritizador de Olaverse mas preciso en 8 de 10 idiomas, con tasa de error inferior a diactag-2.0 en yoruba, hausa, polaco, turco, portugues, espanol, frances e italiano.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 2,3 GB solo para pesos, mas activaciones; en la practica cabe en GPUs con 6-8 GB.
- VRAM en bf16: alrededor de 1,2 GB para pesos, con margen para batching; cabe en GPUs de consumo ampliamente.
- GPUs recomendadas: cualquier GPU moderna con al menos 6 GB (RTX 3060, RTX 4060, RTX 4090) para inferencia en bf16; A100 o H100 son utiles para batching de gran volumen.
- Cabe en GPU de consumo: si, incluida la mayoria de tarjetas con 6 GB o mas; tambien en CPU en fp32.
- Opciones de despliegue: transformers (referencia), text-generation-inference (el modelo es endpoints_compatible); tambien es viable exportar a otros runners, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles. La model card recomienda batching de entradas de longitud similar (padding="longest") y ejecucion en GPU en bf16 para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diacnet-2.0 | 582M | ~300 caracteres por llamada (troceado) | 11 | apache-2.0 | HuggingFace (olaverse/diacnet-2.0) |
| diactag-2.0 (olaverse) | no disponible | no disponible | no disponible | no disponible | HuggingFace (olaverse/diactag-2.0) |
| diacnet-1.1 (olaverse) | no disponible | no disponible | no disponible | no disponible | HuggingFace (olaverse/diacnet-1.1) |
| google/byt5-base (modelo base) | 582M aprox. | segun longitud de bytes (ByT5) | multilingue generico | apache-2.0 | HuggingFace (google/byt5-base) |

En rendimiento, diacnet-2.0 supera a diactag-2.0 en 8 de 10 idiomas y a diacnet-1.1 en yoruba (0,070 frente a 0,174 de tasa de error). No se dispone de cifras comparativas completas para el resto de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos especificos; al ser un modelo de normalizacion, los sesgos dependerian de la composicion del dataset de entrenamiento, que no se detalla.
- Riesgo de alucinacion: la salida bruta puede corregir erratas y alterar el texto original; el helper de alineacion esta disenado para evitarlo y deberia usarse en produccion cuando el texto no deba modificarse.
- La entrada se limita a unos 300 caracteres por llamada; los textos mas largos requieren troceado, lo que puede introducir artefactos en los limites de los fragmentos.
- Los datos de contexto, tokens de entrenamiento y composicion del dataset no estan disponibles, lo que dificulta evaluar cobertura y generalizacion fuera de los idiomas soportados.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base google/byt5-base y de los datasets asociados.
- El numero de descargas (2) y likes (0) es muy bajo; se trata de un modelo reciente con poca validacion independiente por parte de la comunidad.
- No se publican cifras de latencia, throughput ni consumo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olaverse/diacnet-2.0
- Modelo base: https://huggingface.co/google/byt5-base
- Comparativa diactag-2.0: https://huggingface.co/olaverse/diactag-2.0
- Version anterior diacnet-1.1: https://huggingface.co/olaverse/diacnet-1.1
- Dataset de entrenamiento: https://huggingface.co/datasets/olaverse/diacnet-1.1-train
- Benchmark de evaluacion: https://huggingface.co/datasets/olaverse/diacbench
- Libreria olaverse: https://olaverse-labs.github.io/olaverse/
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
