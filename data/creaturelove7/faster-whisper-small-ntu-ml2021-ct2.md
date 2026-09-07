# Creaturelove7/faster-whisper-small-ntu-ml2021-ct2

## Resumen

El modelo `Creaturelove7/faster-whisper-small-ntu-ml2021-ct2` es una conversión a CTranslate2 (float16) del adaptador LoRA `Creaturelove7/whisper-small-lora-ntu-ml2021`, que a su vez es un fine-tuning de `openai/whisper-small` para reconocimiento de voz con cambio de código (code-switching) entre chino mandarín e inglés en conferencias técnicas. El resultado es un modelo listo para usar con `faster-whisper` y `speaches`, optimizado para transcripción de audio en entornos bilingües donde se alternan ambos idiomas.

Según la información del autor, en un conjunto de prueba de 11 919 utterances, el modelo subyacente alcanza un 8,51 % de CER (Character Error Rate) frente al 25,53 % del `whisper-small` base, lo que supone una mejora sustancial en la tarea objetivo. La salida se normaliza en chino simplificado y preserva los términos técnicos en inglés, y este comportamiento se mantiene incluso con cuantización int8. El repositorio ocupa 0,5 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) convertido a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (conversion CT2), int8 (soportado por faster-whisper) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (CT2), float16 |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder de reconocimiento de voz, sobre el que se ha aplicado un adaptador LoRA (`Creaturelove7/whisper-small-lora-ntu-ml2021`) afinado para conferencias en chino e inglés con code-switching. El adaptador se fusiona con los pesos base y el resultado se convierte a CTranslate2 en float16 para acelerar la inferencia mediante `faster-whisper`. Esta conversión permite ejecutar el modelo hasta 4 veces más rápido que `openai/whisper` con la misma precisión y un menor uso de memoria, según el repositorio de SYSTRAN.

Los detalles del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se incluyen en la información disponible; la model card remite al repositorio del adaptador para obtener resultados, detalles de entrenamiento, limitaciones y procedencia de los datos. La principal innovación técnica es la combinación de un fine-tuning LoRA especializado con la conversión a CTranslate2, que preserva el comportamiento del modelo incluso con cuantización int8.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en chino e inglés, con soporte de code-switching (mezcla de ambos idiomas en la misma frase).
- Salida en chino simplificado normalizado, preservando términos técnicos en inglés.
- Optimizado para conferencias y charlas técnicas, según la descripción del autor y el nombre del dataset.
- Compatible con `faster-whisper` y `speaches`, con soporte de cuantización int8 y float16.
- No es multimodal: no procesa visión, audio de alta frecuencia ni otras modalidades.
- No soporta tool calling, function calling ni agentes; es un modelo de ASR puro.

## Casos de uso

- Transcripción de conferencias académicas en mandarín con terminología en inglés: el modelo está afinado para este tipo de contenido, logrando un CER de 8,51 % frente al 25,53 % del Whisper-small base.
- Subtitulado automático de cursos de machine learning en chino: preserva términos técnicos en inglés como "gradient descent" o "loss function", lo que facilita el seguimiento de conceptos.
- Actas de reuniones bilingües chino-inglés en empresas tecnológicas: el code-switching permite transcribir conversaciones donde los participantes alternan idiomas de forma natural.
- Accesibilidad para estudiantes con discapacidad auditiva en universidades chinas: genera subtítulos en tiempo real o a posteriori para materiales educativos.
- Indexación de podcasts técnicos en chino: convierte audio a texto para búsqueda y análisis de contenido, aprovechando la velocidad de `faster-whisper`.
- Integración en pipelines de análisis de datos con `faster-whisper`: al ser una conversión CT2, se puede desplegar con alta velocidad y bajo consumo de memoria, ideal para procesar grandes volúmenes de audio.
- Investigación en lingüística computacional sobre code-switching: permite extraer corpus bilingües anotados para estudiar la alternancia de idiomas.

## Benchmarks y rendimiento

La model card proporciona un único resultado de evaluación, correspondiente al modelo subyacente (LoRA fusionado) antes de la conversión a CTranslate2. La tabla siguiente resume ese dato.

| Modelo | CER en 11 919 utterances (test) |
|---|---|
| faster-whisper-small-ntu-ml2021-ct2 (modelo subyacente) | 8,51 % |
| openai/whisper-small (base) | 25,53 % |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card afirma que el comportamiento del modelo sobrevive a la cuantización int8, pero no se ofrecen métricas adicionales que lo confirmen.

## Requisitos de hardware

- Tamaño del repositorio: 0,5 GB (conversión CT2 en float16).
- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repositorio sugiere que es un modelo pequeño, apto para GPUs de consumo, pero no se especifica un valor exacto.
- GPU recomendadas: no disponible.
- Puede ejecutarse en GPU consumer (por ejemplo, RTX 3060 o superiores) con cuantización int8, aunque no se aportan datos de consumo.
- Opciones de despliegue: `faster-whisper`, CTranslate2, `speaches`. El ejemplo de uso de la model card utiliza `device="cuda"` y `compute_type="int8"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Característica | faster-whisper-small-ntu-ml2021-ct2 | Systran/faster-whisper-small | openai/whisper-small |
|---|---|---|---|
| Arquitectura | Whisper-small (CT2) | Whisper-small (CT2) | Whisper-small |
| Parametros totales | no disponible | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible | no disponible |
| Especializacion | Code-switching zh-en | Multilingue general | Multilingue general |
| CER en test zh-en | 8,51 % | no disponible | 25,53 % |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Formato de pesos | CT2 float16 | CT2 | PyTorch |
| Disponibilidad | HuggingFace | HuggingFace | HuggingFace |

La comparativa se limita a los datos disponibles. El modelo analizado destaca por su especialización en code-switching chino-inglés, mientras que las alternativas son versiones generales sin fine-tuning específico.

## Limitaciones y advertencias

- Especializado en chino e inglés; no se recomienda para otros idiomas.
- Los detalles del entrenamiento y la procedencia de los datos no están disponibles en esta ficha; se remite al repositorio del adaptador.
- El rendimiento de 8,51 % CER corresponde al modelo subyacente (LoRA fusionado). La conversión CT2 está en float16 y la model card afirma que el comportamiento sobrevive a int8, pero no se aportan pruebas exhaustivas.
- Como todo modelo de ASR, puede presentar alucinaciones en segmentos de silencio o ruido intenso.
- No es multimodal; no procesa imágenes ni video.
- La licencia Apache-2.0 permite uso comercial, pero requiere mantener el aviso de licencia y las atribuciones correspondientes.
- El repositorio no ha recibido descargas ni likes, lo que sugiere que es un modelo experimental o de nicho.

## Enlaces

- HuggingFace: https://huggingface.co/Creaturelove7/faster-whisper-small-ntu-ml2021-ct2
- Modelo base (adaptador LoRA): https://huggingface.co/Creaturelove7/whisper-small-lora-ntu-ml2021
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Conversión estándar de referencia: https://huggingface.co/Systran/faster-whisper-small
