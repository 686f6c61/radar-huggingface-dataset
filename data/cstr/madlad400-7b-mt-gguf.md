# cstr/madlad400-7b-mt-GGUF

## Resumen

MADLAD-400 7B MT es la conversión a formato GGUF del modelo de traducción automática multilingüe `google/madlad400-7b-mt`, desarrollado originalmente por Google Research. Se trata de un modelo encoder-decoder basado en la arquitectura T5 con aproximadamente 7.200 millones de parámetros (8.296.829.952 según los pesos en safetensors), entrenado sobre 1 billón de tokens y capaz de traducir entre más de 450 idiomas, incluyendo lenguas de bajos recursos.

Esta versión concreta, publicada por el usuario `cstr`, no modifica los pesos del modelo original: únicamente los convierte al formato GGUF/ggml para su uso con el motor CrispASR, lo que permite ejecutar la inferencia en CPU y en entornos sin CUDA. El repositorio ofrece cuatro ficheros con distintos niveles de cuantización (f16, q8_0 y q4_k) y un archivo de referencia para verificar la paridad numérica frente a la implementación en PyTorch.

La relevancia actual del modelo radica en su cobertura lingüística y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. La existencia de una conversión GGUF facilita el despliegue en hardware modesto, algo poco habitual en modelos de traducción de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer) |
| Parámetros totales | 8.296.829.952 (aproximadamente 7,2 B según la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, q8_0, q4_k |
| Idiomas soportados | más de 450 idiomas (etiquetas `<2xx>` ISO 639) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ggml); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 estándar con encoder y decoder de 32 capas cada uno y dimensión oculta de 1024, según se detalla en la model card de la conversión. Utiliza un tokenizador SentencePiece con un vocabulario compartido de 256.000 tokens entre encoder y decoder. La traducción se controla anteponiendo al texto de origen una etiqueta de idioma destino con el formato `<2xx>`, correspondiente al código ISO 639 del idioma de salida.

El entrenamiento original, descrito en el artículo MADLAD-400 (arXiv:2309.04662), se realizó sobre 1 billón de tokens de datos multilingües auditados y orientados a nivel de documento. La model card de esta conversión no detalla si hubo fases de RLHF o DPO ni la composición exacta del dataset; esa información debe consultarse en la documentación del modelo base de Google. La innovación principal de esta publicación es la conversión a GGUF con verificación de paridad por etapas mediante la herramienta `crispasr-diff`, que compara las salidas frente a la referencia en PyTorch.

## Capacidades

- Traducción automática multilingüe entre más de 450 idiomas, con especial énfasis en lenguas de bajos recursos.
- Traducción con control explícito del idioma destino mediante etiquetas `<2xx>` antepuestas al texto de entrada.
- Procesamiento a nivel de documento gracias al entrenamiento sobre datos documentales auditados.
- Generación de texto text2text mediante decodificación greedy (la model card indica decodificación greedy en el flujo de ejemplo).
- Ejecución en CPU mediante el motor CrispASR con backend `madlad`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías completas entre idiomas mayoritarios y minoritarios, aprovechando su entrenamiento a nivel de documento para mantener coherencia terminológica.
- Localización de productos para mercados con lenguas de bajos recursos: permite cubrir idiomas que otros modelos comerciales no soportan, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Traducción por lotes en servidores sin GPU: la cuantización q4_k (aproximadamente 4,1 GB) permite ejecutar la inferencia en CPU mediante CrispASR, útil en pipelines de procesamiento masivo de textos.
- Subtitulado y transcripción multilingüe: combinado con herramientas de reconocimiento de voz, puede traducir transcripciones a distintos idiomas de salida.
- Atención al cliente multilingüe: traducción de mensajes entrantes y salientes en tiempo casi real en entornos con recursos de hardware limitados.
- Investigación en lingüística computacional: evaluación de calidad de traducción en lenguas de bajos recursos y comparación con modelos neuronales comerciales, gracias a la reproducibilidad del formato GGUF y la verificación de paridad incluida.
- Generación de corpus paralelos: traducción de grandes volúmenes de texto para construir datasets bilingües o multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según el fichero: f16 aproximadamente 14,5 GB; q8_0 aproximadamente 7,6 GB; q4_k aproximadamente 4,1 GB.
- El motor CrispASR está orientado a ejecución en CPU, por lo que no se requiere GPU.
- GPU recomendadas: no disponible en la información proporcionada; al ser una conversión GGUF para CrispASR, el diseño apunta a CPU.
- ¿Cabe en GPU de consumo? El fichero q4_k (4,1 GB) cabría en GPUs con 8 GB o más de VRAM si el motor lo permitiera, pero la model card no documenta soporte CUDA para este backend.
- Opciones de despliegue documentadas: CrispASR (compilación con CMake y ejecución mediante `crispasr --backend madlad`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400 7B MT (este) | ~7,2 B | 450+ | no disponible | Apache 2.0 | GGUF, safetensors |
| MADLAD-400 3B MT (cstr) | ~3 B (no confirmado) | 450+ | no disponible | Apache 2.0 | GGUF |
| MADLAD-400 10B MT (cstr) | ~10 B (no confirmado) | 450+ | no disponible | Apache 2.0 | GGUF |
| M2M-100 418M (cstr) | ~418 M | 100 | no disponible | no disponible en la información | GGUF |

Los datos de parámetros de las variantes 3B y 10B y de M2M-100 no se detallan en la información proporcionada; se indican según la nomenclatura de los repositorios enlazados. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Riesgo de alucinación y de traducciones incorrectas en lenguas de muy bajos recursos, donde los datos de entrenamiento son escasos.
- La model card no documenta sesgos específicos; al entrenarse sobre datos web multilingües, es probable la presencia de sesgos culturales y de género, aunque no se cuantifican.
- La longitud de contexto no está especificada en la información disponible, lo que dificulta planificar el procesamiento de documentos largos.
- El repositorio está pensado exclusivamente para el motor CrispASR; no se garantiza compatibilidad con llama.cpp, Ollama u otros runners GGUF.
- El número de descargas (149) y la ausencia de "likes" sugieren una adopción limitada; conviene validar la calidad de la conversión en el caso de uso concreto.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base de Google y citar el artículo original.
- El rendimiento en producción (latencia, throughput) no está documentado y debe medirse empíricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/madlad400-7b-mt-GGUF
- Modelo base: https://huggingface.co/google/madlad400-7b-mt
- Artículo MADLAD-400: https://arxiv.org/abs/2309.04662
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
- Variante 3B: https://huggingface.co/cstr/madlad400-3b-mt-GGUF
- Variante 7B back-translation: https://huggingface.co/cstr/madlad400-7b-mt-bt-GGUF
- Variante 10B: https://huggingface.co/cstr/madlad400-10b-mt-GGUF
- M2M-100 418M GGUF: https://huggingface.co/cstr/m2m100-418m-GGUF
