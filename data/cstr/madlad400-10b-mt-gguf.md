# cstr/madlad400-10b-mt-GGUF

## Resumen

`cstr/madlad400-10b-mt-GGUF` es la conversion a formato GGUF (ggml) del modelo de traduccion automatica `google/madlad400-10b-mt`, el miembro de mayor tamano de la familia MADLAD-400 desarrollada por Google Research. El modelo original se presenta en el paper *MADLAD-400: A Multilingual And Document-Level Large Audited Dataset* (arXiv:2309.04662) y esta entrenado sobre 1 billon de tokens con cobertura de mas de 450 idiomas, lo que lo situa entre los sistemas de traduccion multilingue de proposito general con mayor alcance idiomatico disponibles en abierto.

La relevancia de esta ficha concreta reside en la conversion a GGUF, que permite ejecutar un modelo encoder-decoder T5 de 10.712.586.240 parametros en entornos sin PyTorch, mediante la herramienta CrispASR del mismo autor. El repositorio ofrece cuatro ficheros: `f16` (~21,5 GB), `q8_0` (~11,3 GB), `q4_k` (~6,1 GB, el recomendado por el autor) y un archivo de referencia de ~1,5 MB para verificacion por etapas.

La arquitectura es un transformer encoder-decoder de tipo T5 con 32 capas anchas, dimension oculta de 4096 y vocabulario SentencePiece de 256K tokens compartido entre encoder y decoder. La licencia Apache 2.0 del modelo base se mantiene en esta conversion, lo que facilita su uso comercial. El modelo no es un LLM generativo de proposito general: es un traductor especializado que recibe la etiqueta de idioma destino `<2xx>` (codigo ISO 639) antepuesta al texto fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), 32 capas, d=4096 |
| Parametros totales | 10.712.586.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0, q4_k |
| Idiomas soportados | multilingue, mas de 450 idiomas (etiquetas `<2xx>` ISO 639) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml); original en safetensors/PyTorch |
| Vocabulario | SentencePiece, 256K tokens, compartido encoder-decoder |
| Tamano del repo | 40,1 GB |
| Libreria | ggml (CrispASR) |
| Modelo base | google/madlad400-10b-mt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 estandar en configuracion encoder-decoder, con 32 capas en cada torre, dimension oculta de 4096 y atencion con cross-attention entre encoder y decoder. El tokenizador SentencePiece de 256K tokens es compartido por ambas torres. La traduccion se controla anteponiendo al texto fuente una etiqueta de idioma destino con formato `<2xx>`, donde `xx` es el codigo ISO 639 del idioma de salida; el decoder genera la traduccion con decodificacion greedy segun la model card de la conversion.

El entrenamiento del modelo original, segun el paper citado, se realizo sobre 1 billon de tokens de un corpus multilingue auditado y orientado a nivel de documento (MADLAD-400), disenado para reducir ruido y mejorar la calidad en idiomas de bajos recursos. La model card de la conversion no detalla la composicion exacta del dataset, el uso de RLHF/DPO ni otras tecnicas de alineacion; esa informacion debe consultarse en el paper y en la model card del modelo original de Google. La conversion GGUF ha sido verificada mediante una prueba de paridad por etapas (`crispasr-diff`) contra las salidas de referencia en PyTorch, lo que aporta una garantia de fidelidad numerica respecto al modelo original.

## Capacidades

- Traduccion automatica multilingue en mas de 450 idiomas, con control explicito del idioma destino mediante etiquetas `<2xx>`.
- Traduccion entre pares de idiomas de altos y bajos recursos, incluidos idiomas con poca presencia en corpus convencionales.
- Generacion text2text de proposito general dentro del paradigma T5 (el pipeline declarado es `translation`).
- Procesamiento a nivel de documento, segun el diseno del dataset MADLAD-400 del modelo base.
- Ejecucion en CPU y GPU mediante el backend `madlad` de CrispASR, sin dependencia de PyTorch.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica a multiples idiomas: el modelo permite fijar el idioma destino con la etiqueta `<2xx>` y traducir lotes de textos con un unico binario CrispASR, sin infraestructura PyTorch, lo que simplifica el despliegue en pipelines de documentacion.
- Localizacion de interfaces y contenidos web: la cuantizacion `q4_k` (~6,1 GB) permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, traduciendo cadenas de UI y articulos a idiomas minoritarios que otros sistemas no cubren.
- Traduccion en entornos con recursos limitados o air-gapped: al ser un binario C/C++ con pesos GGUF, puede desplegarse en servidores sin acceso a internet ni frameworks de deep learning, util en administraciones publicas y sectores regulados.
- Procesamiento de corpus multilingues para investigacion: la cobertura de mas de 450 idiomas y el entrenamiento a nivel de documento lo hacen adecuado para normalizar y alinear corpus paralelos en estudios linguisticos.
- Traduccion de comunicaciones de soporte al cliente: integrado en un servicio backend, permite responder en el idioma del usuario a partir de un texto en el idioma del operador, con la etiqueta de idioma destino controlando la salida.
- Generacion de subtitulos y transcripciones multilingues: combinado con un sistema ASR, el backend `madlad` de CrispASR puede traducir transcripciones a otros idiomas en la misma herramienta, segun el ejemplo de uso de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion no incluye tablas de BLEU, COMET ni otras metricas, y el paper del modelo base no se ha consultado en esta ficha. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,5 GB con `f16`, 11,3 GB con `q8_0` y 6,1 GB con `q4_k`, segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: no disponibles de forma explicita; por tamano de pesos, una GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) permite `q8_0` y `q4_k` con holgura, y una A100/H100 de 40-80 GB permite `f16`.
- GPU de consumo: `q4_k` (~6,1 GB) cabe en GPUs de 8 GB o mas; `q8_0` requiere al menos 12 GB; `f16` no cabe en GPUs de consumo habituales de 24 GB o menos.
- Opciones de despliegue: CrispASR (backend `madlad`), compilado con CMake; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/madlad400-10b-mt-GGUF | 10,7B | 450+ | no disponible | Apache 2.0 | GGUF |
| cstr/madlad400-7b-mt-GGUF | 7B (aprox.) | 450+ | no disponible | Apache 2.0 | GGUF |
| cstr/madlad400-3b-mt-GGUF | 3B (aprox.) | 450+ | no disponible | Apache 2.0 | GGUF |
| cstr/m2m100-418m-GGUF | 418M | 100 | no disponible | no disponible | GGUF |

Las variantes de 3B y 7B de la misma familia permiten reducir requisitos de memoria a costa de calidad de traduccion; el modelo de 10B es el de mayor capacidad de la familia. M2M-100 cubre 100 idiomas con traduccion any-to-any y un tamano mucho menor, adecuado para entornos muy restringidos. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un traductor especializado: no debe emplearse como LLM generativo de proposito general ni para tareas de razonamiento, codigo o agentes.
- La calidad en idiomas de muy bajos recursos puede ser inferior a la de idiomas mayoritarios, aunque el entrenamiento del modelo base esta disenado para mitigarlo; no se aportan metricas por idioma.
- Riesgo de alucinacion y de traducciones infieles en textos ambiguos, tecnicos o con terminologia especializada; se recomienda revision humana en dominios sensibles.
- Requiere anteponer correctamente la etiqueta `<2xx>` del idioma destino; un etiquetado erroneo produce salidas en el idioma equivocado.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar el procesamiento de documentos muy largos sin truncado.
- El soporte de herramientas se limita a CrispASR; no hay integracion documentada con ecosistemas como llama.cpp, Ollama o vLLM, lo que puede limitar su adopcion en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `google/madlad400-10b-mt` y citar el paper correspondiente.

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/cstr/madlad400-10b-mt-GGUF
- Modelo base original: https://huggingface.co/google/madlad400-10b-mt
- Paper MADLAD-400: https://arxiv.org/abs/2309.04662
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR
- Conversion MADLAD-400 3B MT: https://huggingface.co/cstr/madlad400-3b-mt-GGUF
- Conversion MADLAD-400 7B MT: https://huggingface.co/cstr/madlad400-7b-mt-GGUF
- Conversion MADLAD-400 7B MT Back-Translation: https://huggingface.co/cstr/madlad400-7b-mt-bt-GGUF
- Conversion M2M-100 418M: https://huggingface.co/cstr/m2m100-418m-GGUF
