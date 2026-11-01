# cstr/madlad400-7b-mt-bt-GGUF

## Resumen

MADLAD-400 7B MT BT es un modelo de traducción automática multilingüe desarrollado por Google Research, basado en la arquitectura T5 (encoder-decoder) y ajustado mediante *back-translation* (BT) sobre más de 450 idiomas. El modelo original, `google/madlad400-7b-mt-bt`, se distribuye bajo licencia Apache 2.0 y forma parte de la familia MADLAD-400, entrenada sobre un corpus multilingüe auditado a nivel de documento descrito en el paper arXiv:2309.04662.

La ficha que nos ocupa, `cstr/madlad400-7b-mt-bt-GGUF`, es una conversión a formato GGUF/ggml realizada por el usuario cstr para su uso con el motor CrispASR. Incluye cuantizaciones en f16, q8_0 y q4_k, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter. El modelo cuenta con 8.296.829.952 parámetros reales según los pesos en safetensors del modelo base.

Su relevancia actual radica en que ofrece traducción de alta calidad en más de 450 idiomas, incluyendo lenguas de bajos recursos, en un formato cuantizado y ejecutable localmente. Esto lo convierte en una alternativa práctica a APIs de traducción propietarias para despliegues *on-premise* con requisitos de privacidad o de coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder) |
| Parametros totales | 8.296.829.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0, q4_k |
| Idiomas soportados | más de 450 idiomas (multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 estándar: un encoder de 32 capas con dimensión d=1024 y un decoder de 32 capas con la misma dimensión y atención cruzada. Utiliza un tokenizador SentencePiece con vocabulario de 256K tokens compartido entre encoder y decoder. La traducción se dirige mediante una etiqueta de idioma destino `<2xx>` (código ISO 639) antepuesta al texto fuente, y la generación se realiza con decodificación greedy.

El entrenamiento parte del corpus MADLAD-400, un dataset multilingüe auditado a nivel de documento, y el ajuste fino se realiza con *back-translation* (BT), técnica que genera datos sintéticos en la dirección inversa para mejorar la fluidez y robustez del dominio, especialmente en pares de idiomas de bajos recursos. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Traducción automática multilingüe entre más de 450 idiomas mediante etiquetas `<2xx>` de idioma destino.
- Traducción entre pares de idiomas de altos y bajos recursos, incluyendo lenguas con pocos datos paralelos.
- Generación de texto *text2text* condicionada por la etiqueta de idioma.
- Manejo de texto a nivel de documento (el corpus de entrenamiento es document-level).
- Ejecución local mediante el motor CrispASR con backend `madlad`.
- No se ha documentado soporte de *tool calling*, agentes, visión, audio ni *thinking mode* en la información disponible.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías entre idiomas europeos y asiáticos usando la etiqueta de idioma destino, con la ventaja de ejecutarse localmente sin enviar contenido propietario a APIs externas.
- Localización de aplicaciones: integración en pipelines de CI/CD para traducir cadenas de interfaz (archivos de recursos i18n) a decenas de idiomas de forma automatizada con la cuantización q4_k.
- Atención al cliente multilingüe: traducción en tiempo real de mensajes de usuarios a un idioma común para agentes humanos, aprovechando el soporte de más de 450 idiomas.
- Investigación en lingüística computacional: evaluación de calidad de traducción en lenguas de bajos recursos, donde el ajuste por *back-translation* aporta mejoras documentadas.
- Procesamiento de corpus académicos: traducción de abstracts y artículos entre idiomas para revisiones sistemáticas, con la cuantización f16 como referencia de calidad.
- Despliegue en entornos con requisitos de privacidad: traducción *on-premise* en sectores regulados (sanidad, legal) donde no se permite enviar texto a servicios en la nube.
- Generación de datos sintéticos multilingües: uso del modelo para crear pares paralelos que alimenten el entrenamiento de otros sistemas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,5 GB para f16, 7,6 GB para q8_0 y 4,1 GB para q4_k (tamaños de archivo GGUF).
- GPU recomendadas: A100 o H100 para f16 con throughput alto; RTX 4090 (24 GB) para f16 o q8_0; RTX 3090/4080 para q8_0.
- Cabe en GPU de consumo: sí, la cuantización q4_k (~4,1 GB) cabe en GPUs con 6-8 GB de VRAM; q8_0 requiere al menos 8-10 GB.
- Opciones de despliegue: CrispASR (motor oficial de esta conversión, backend `madlad`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/madlad400-7b-mt-bt-GGUF | 8,3B | más de 450 | no disponible | Apache 2.0 | GGUF |
| cstr/madlad400-3b-mt-GGUF | no disponible | multilingüe | no disponible | Apache 2.0 | GGUF |
| cstr/madlad400-10b-mt-GGUF | no disponible | multilingüe | no disponible | Apache 2.0 | GGUF |
| cstr/m2m100-418m-GGUF | 418M | 100 | no disponible | no disponible | GGUF |

La comparativa se limita a las conversiones GGUF de la misma familia publicadas por el mismo autor; no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación y de traducciones inexactas, especialmente en pares de idiomas con pocos datos paralelos.
- Sesgos potenciales heredados del corpus MADLAD-400 y del proceso de *back-translation*, que puede amplificar errores del modelo en la dirección inversa.
- Longitud de contexto no documentada; el uso con documentos largos puede requerir fragmentación.
- La generación es greedy, sin muestreo ni *beam search* documentado en esta conversión, lo que puede limitar la diversidad de salidas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `google/madlad400-7b-mt-bt`.
- El soporte de herramientas de despliegue es limitado a CrispASR; no hay integración documentada con ecosistemas como llama.cpp u Ollama.
- El repositorio tiene un número bajo de descargas (182) y ningún *like*, lo que sugiere poca validación comunitaria de la conversión.

## Enlaces

- [HuggingFace: cstr/madlad400-7b-mt-bt-GGUF](https://huggingface.co/cstr/madlad400-7b-mt-bt-GGUF)
- [Modelo base: google/madlad400-7b-mt-bt](https://huggingface.co/google/madlad400-7b-mt-bt)
- [Paper MADLAD-400 (arXiv:2309.04662)](https://arxiv.org/abs/2309.04662)
- [Repositorio CrispASR](https://github.com/CrispStrobe/CrispASR)
- [cstr/madlad400-3b-mt-GGUF](https://huggingface.co/cstr/madlad400-3b-mt-GGUF)
- [cstr/madlad400-7b-mt-GGUF](https://huggingface.co/cstr/madlad400-7b-mt-GGUF)
- [cstr/madlad400-10b-mt-GGUF](https://huggingface.co/cstr/madlad400-10b-mt-GGUF)
- [cstr/m2m100-418m-GGUF](https://huggingface.co/cstr/m2m100-418m-GGUF)
