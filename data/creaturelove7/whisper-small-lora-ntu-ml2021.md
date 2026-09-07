# Creaturelove7/whisper-small-lora-ntu-ml2021

## Resumen

El modelo `Creaturelove7/whisper-small-lora-ntu-ml2021` es un adaptador LoRA de rango 32 que ajusta el modelo multilingüe `openai/whisper-small` a discurso técnico con cambio de código (code-switching) entre chino mandarín e inglés. Ha sido desarrollado por Creaturelove7 para la aplicación de transcripción por voz OpenTypeless, y su objetivo es mejorar el reconocimiento de conferencias académicas de machine learning impartidas en mandarín, donde los términos técnicos aparecen en inglés. El adaptador tiene un tamaño de 14 MB, se entrena en aproximadamente 30 minutos en una RTX 2060 de 6 GB y se ejecuta sin problemas en Apple Silicon.

La arquitectura subyacente es la de Whisper-small, un Transformer encoder-decoder de OpenAI con 244 millones de parámetros. El adaptador LoRA se aplica a las proyecciones de atención `q_proj` y `v_proj`, con menos del 1 % de parámetros entrenables. El modelo está diseñado para transcripción en chino simplificado, preservando los términos técnicos en inglés en escritura latina. La licencia es Apache-2.0 y el formato de pesos es safetensors (adaptador PEFT).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptador LoRA |
| Parametros totales | 244 M (modelo base) + adaptador LoRA de 14 MB (<1 % de parámetros entrenables) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (mencionado como compatible con la normalización) |
| Idiomas soportados | zh (chino mandarín), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 con dropout 0.05, aplicado únicamente a las capas de atención `q_proj` y `v_proj` del modelo base `openai/whisper-small` (revisión `973afd24965f72e36ca33b3055d56a652f456b4d`). El entrenamiento se realizó sobre el dataset público `ky552/ML2021_ASR_ST` (revisión `1e121cc419e87eed7d4825400baa06f102931944`), que contiene 17.779 utterances de audio de conferencias del curso NTU ML2021. Se entrenó durante 1 época en fp16 con tamaño de lote efectivo 15, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 42.

La normalización de texto incluye conversión de chino tradicional a simplificado y eliminación de espacios intra-Han. Tanto las etiquetas como la inferencia comparten un prompt de decodificador fijo para transcripción en chino, lo que permite que los términos técnicos en inglés se emitan en escritura latina. No se aplicaron técnicas de RLHF ni DPO. La innovación principal es la adaptación eficiente a discurso con code-switching, con un coste de entrenamiento muy bajo y una degradación mínima en la normalización tras cuantización int8.

## Capacidades

- Reconocimiento automático de voz (ASR) para mandarín dominante con code-switching a inglés técnico.
- Transcripción en chino simplificado normalizado, con términos técnicos en inglés preservados en escritura latina.
- Integración con la librería PEFT de Hugging Face; se puede usar `model.merge_and_unload()` para obtener un checkpoint independiente.
- Conversión publicada a CTranslate2 para su uso con `faster-whisper`.
- Compatibilidad con cuantización int8, manteniendo la normalización de salida.
- Inferencia eficiente en Apple Silicon y en GPUs de consumo con 6 GB de VRAM.

## Casos de uso

- Transcripción de clases magistrales de machine learning en mandarín: el modelo convierte automáticamente las explicaciones orales en chino a texto, manteniendo los términos técnicos en inglés, lo que facilita la creación de apuntes y materiales de estudio.
- Subtitulado automático de vídeos de conferencias técnicas: gracias a la adaptación al dominio y al code-switching, es adecuado para generar subtítulos de cursos universitarios de IA impartidos en Taiwán.
- Asistente de toma de notas para estudiantes: se puede integrar en aplicaciones de dictado por voz para capturar fragmentos cortos de audio de clases y obtener transcripciones limpias en chino simplificado.
- Aplicación de dictado por voz en macOS (OpenTypeless): el adaptador está diseñado para esta aplicación de código abierto, proporcionando transcripción local con baja latencia en Apple Silicon.
- Transcripción de reuniones técnicas con terminología en inglés: en entornos donde se mezcla mandarín e inglés, el modelo mantiene los términos técnicos en su forma original, evitando traducciones incorrectas.
- Accesibilidad para personas con discapacidad auditiva: puede usarse para generar subtítulos en tiempo real de contenido educativo en chino, mejorando el acceso a conferencias técnicas.
- Integración en pipelines de procesamiento de audio: al ser un adaptador PEFT ligero, se puede combinar con herramientas como `faster-whisper` para automatizar la transcripción de grandes volúmenes de audio en entornos de investigación.

## Benchmarks y rendimiento

El autor evaluó el modelo en 11.919 utterances de test retenidas (la partición oficial de test con todos los archivos de dev eliminados). Los resultados comparan el modelo base con el modelo adaptado:

| Modelo | CER | Mixed-language ER |
|---|---|---|
| whisper-small (base) | 25.53 % | 18.61 % |
| **whisper-small + adaptador** | **8.51 %** | **7.88 %** |

Esto supone una reducción relativa del 67 % en CER. En un subconjunto dev dentro del dominio, el modelo adaptado (244 M) superó a `whisper-large-v3`, servido por una API en la nube, con un CER de 4.29 % frente al 9.46 %. Este resultado es específico del dominio; en audio fuera de dominio, se espera que el modelo grande generalista tenga mejor rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el entrenamiento se realizó en una RTX 2060 de 6 GB, por lo que la inferencia es viable en GPUs de consumo con 6 GB o menos.
- GPU recomendadas: RTX 2060 (para entrenamiento); Apple Silicon (M1/M2/M3) para inferencia eficiente.
- Sí cabe en GPUs de consumo: se ha probado en una RTX 2060 de 6 GB y en Apple Silicon.
- Opciones de despliegue: Transformers + PEFT, `faster-whisper` mediante la conversión CTranslate2, y la aplicación OpenTypeless para macOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | CER (in-domain) | Licencia | Disponibilidad |
|---|---|---|---|---|
| whisper-small (base) | 244 M | 25.53 % | No disponible (modelo base OpenAI) | Hugging Face |
| **whisper-small + adaptador** | 244 M + 14 MB | **8.51 %** | Apache-2.0 | Hugging Face |
| whisper-large-v3 | No disponible (seis veces mayor que whisper-small según el autor) | 9.46 % (en dev subset) | No disponible | API en la nube |

La comparativa muestra que el adaptador reduce drásticamente el CER en su dominio objetivo, incluso superando a un modelo seis veces mayor en un subconjunto específico. Sin embargo, esta ventaja es exclusivamente in-domain y no se espera que se mantenga en audio fuera del dominio de conferencias de machine learning.

## Limitaciones y advertencias

- Modelo adaptado a conferencias de machine learning; se espera una degradación notable en otros dominios.
- El corpus de entrenamiento es predominantemente mandarín con acento taiwanés, lo que puede afectar a la precisión con otros acentos.
- Optimizado para utterances cortas (de pocos segundos); los clips de entrenamiento están limitados a 60 segundos.
- El prompt de decodificador fijo en chino es incorrecto para dictado exclusivo en inglés.
- El adaptador no redistribuye audio, transcripciones ni predicciones por muestra; solo contiene deltas de pesos LoRA.
- Riesgo de alucinación inherente a los sistemas de reconocimiento automático de voz.
- Posibles sesgos derivados del corpus específico del curso, que pueden limitar la generalización a otros contextos educativos o técnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Creaturelove7/whisper-small-lora-ntu-ml2021
- Modelo base: https://huggingface.co/openai/whisper-small
- Conversión CTranslate2 para faster-whisper: https://huggingface.co/Creaturelove7/faster-whisper-small-ntu-ml2021-ct2
- Dataset de entrenamiento: https://huggingface.co/datasets/ky552/ML2021_ASR_ST
- Repositorio del proyecto: https://github.com/ryrenz/open-typeless-formac
- Pipelines de entrenamiento y evaluación: https://github.com/ryrenz/open-typeless-formac/tree/main/training/ntu_ml2021
