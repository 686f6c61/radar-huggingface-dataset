# kinit/parakeet-tdt-0.6b-v3-sk

## Resumen

kinit/parakeet-tdt-0.6b-v3-sk es un modelo de reconocimiento automático del habla (ASR) para eslovaco, desarrollado por el equipo KInIT mediante ajuste fino completo del modelo multilingüe nvidia/parakeet-tdt-0.6b-v3. Emplea la arquitectura FastConformer como codificador y un decodificador TDT (Token-and-Duration Transducer), con aproximadamente 600 millones de parámetros. El objetivo es cubrir una carencia clara: el modelo base de NVIDIA rinde de forma deficiente en eslovaco, mientras que este ajuste reduce la tasa de error de palabras de manera sustancial.

La relevancia práctica del modelo está en su equilibrio entre precisión y coste computacional. Con 600 millones de parámetros y una licencia permisiva CC-BY-4.0, se puede desplegar en infraestructura modesta y utilizarse en productos comerciales citando la autoría. El ajuste se realizó sobre un corpus eslovaco curado que combina datos públicos (SloPalSpeech, Common Voice 24.0, FLEURS, TEDxSK/JumpSK) con grabaciones internas de KInIT, aplicando aumentación de ruido al 75% de las muestras para mejorar la robustez en condiciones reales de grabación.

Frente al modelo base, el ajuste reduce el WER del 9,07% al 7,92% en Common Voice 24.0 y del 24,32% al 6,62% en el conjunto interno de evaluación de KInIT. El precio de esta mejora es el olvido catastrófico de los otros 24 idiomas que soportaba el modelo original, por lo que su uso queda restringido a audio en eslovaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT, Token-and-Duration Transducer (decodificador) |
| Parametros totales | ~600 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eslovaco (sk) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo); repositorio de 5,0 GB |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt-0.6b-v3, un sistema ASR multilingüe de NVIDIA construido sobre un codificador FastConformer, una variante del Conformer con atención subsampleada que reduce el coste computacional en secuencias de audio largas, acoplado a un decodificador TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por fotograma y acelera la inferencia frente a transductores clásicos. El ajuste fue completo (todos los parámetros), no mediante adaptadores.

El entrenamiento se realizó con NVIDIA NeMo y PyTorch Lightning durante 3 épocas, con tasa de aprendizaje 4e-4, scheduler de annealing coseno con warmup, optimizador AdamW, tamaño de lote efectivo 64, precisión bf16 mixta y recorte de gradiente de 1,0, sobre el clúster HPC Devana. El corpus combina SloPalSpeech, grabaciones de sesiones de consejos municipales, literatura leída, Common Voice 24.0, el corpus de conferencias TEDxSK y JumpSK, FLEURS e grabaciones internas de KInIT, con anonimización previa de datos personales y filtrado por umbral de CER validado contra varios modelos ASR. Al 75% de las muestras se les aplicó aumentación con ruido de teléfono, habla de fondo, ruido ambiental, ruido blanco y pérdida de paquetes.

## Capacidades

- Transcripción de voz a texto en eslovaco con puntuación y mayúsculas automáticas.
- Robustez ante ruido de fondo y condiciones de grabación degradadas gracias a la aumentación de entrenamiento.
- Manejo de dominios variados: habla espontánea, lectura, conferencias y sesiones municipales.
- La arquitectura base soporta marcas de tiempo a nivel de palabra y de segmento, aunque no se evaluaron tras el ajuste fino.
- La arquitectura base soporta audio de formato largo, capacidad heredada pero no evaluada tras el ajuste.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos generativos: es un sistema ASR puro.
- No dispone de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado de contenido audiovisual en eslovaco: el modelo transcribe con puntuación y mayúsculas, lo que reduce el postprocesado necesario para generar subtítulos listos para revisión humana en plataformas de vídeo o televisión.
- Actas de sesiones municipales: el corpus de entrenamiento incluye grabaciones de consejos municipales, por lo que el modelo está expuesto al registro formal y a la terminología administrativa propios de este dominio, lo que lo hace adecuado para generar borradores de actas.
- Transcripción de conferencias y charlas: el corpus TEDxSK y JumpSK aporta habla de ponente con registro expositivo, útil para generar resúmenes o búsquedas sobre grabaciones de eventos.
- Atención al cliente telefónica: la aumentación con ruido de teléfono y pérdida de paquetes hace que el modelo tolere audio de call center; puede alimentar sistemas de análisis de llamadas o generación de notas automáticas.
- Investigación en lingüística de corpus eslovaco: la licencia CC-BY-4.0 permite usar el modelo para anotar grandes volúmenes de audio en proyectos académicos sin restricciones de uso comercial.
- Accesibilidad y dictado: integrado en aplicaciones de dictado o transcripción en directo para usuarios eslovacos, con 600 M de parámetros que permiten ejecución en GPU de gama media.
- Pipeline de datos para entrenar otros modelos: transcripción masiva de audio eslovaco no etiquetado para construir corpus de texto o de pares audio-texto.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER y CER, menor es mejor):

| Modelo | CV24 WER | CV24 CER | Interno WER | Interno CER |
|---|---:|---:|---:|---:|
| kinit/parakeet-tdt-0.6b-v3-sk | 7,92% | 2,06% | 6,62% | 3,12% |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 9,07% | 2,54% | 24,32% | 10,75% |

Comparación Parakeet frente a Canary con la misma receta de ajuste y el mismo pipeline de evaluación, sobre el conjunto interno de KInIT:

| Modelo | WER ajustado | WER base |
|---|---:|---:|
| Parakeet TDT 0.6B v3 | 6,62% | 24,32% |
| Canary 1B v2 | 6,37% | 14,39% |

El autor indica que Parakeet es más rápido que Canary, aunque no publica cifras de latencia o throughput. El conjunto interno (9.317 muestras, estratificado por dominio y género del hablante, un tercio limpio y dos tercios con ruido añadido) no es público.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor; con ~600 M de parámetros en bf16 el peso ronda 1,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas; por tamaño, una RTX 3090, RTX 4090 o cualquier GPU con 8 GB o más debería ser suficiente, así como A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: NVIDIA NeMo (librería oficial, `nemo.collections.asr`), con transcripción por lotes mediante `model.transcribe([...])`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor afirma que Parakeet es más rápido que Canary 1B v2, pero sin cifras.
- Requisito de entrada: el audio debe ser mono; la entrada estéreo provoca un error de desajuste de formas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER interno (ajustado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinit/parakeet-tdt-0.6b-v3-sk | ~600 M | sk | 6,62% | CC-BY-4.0 | Hugging Face |
| kinit/canary-1b-v2-sk | ~1 B | sk | 6,37% | no disponible en la informacion | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | 25 idiomas | 24,32% (sin ajuste) | CC-BY-4.0 | Hugging Face |
| Ajustes de Whisper de KInIT (tiny a large) | no disponible | sk | no disponible | no disponible | Hugging Face (coleccion KInIT ASR) |

Canary 1B v2 ajustado ofrece un WER ligeramente mejor (6,37% frente a 6,62%) a cambio de un modelo casi el doble de grande; Parakeet es la opción más rápida según el autor. El modelo base multilingüe es la alternativa si se necesita transcribir idiomas distintos del eslovaco, a costa de un rendimiento muy inferior en eslovaco.

## Limitaciones y advertencias

- Olvido catastrófico: el ajuste exclusivo en eslovaco degrada significativamente el rendimiento en los otros 24 idiomas del modelo base. Para transcripción multilingüe debe usarse nvidia/parakeet-tdt-0.6b-v3.
- Riesgo de degradación con acentos marcados, dialectos o jerga de dominio no representados en los datos de entrenamiento.
- Los datos de entrenamiento son mayoritariamente enunciados cortos; la capacidad de audio largo se hereda del modelo base pero no se evaluó tras el ajuste.
- Las marcas de tiempo a nivel de palabra y de segmento existen en la arquitectura base pero no se evaluaron tras el ajuste, por lo que su fiabilidad en producción no está garantizada.
- El conjunto de evaluación interno no es público, lo que limita la reproducibilidad de los resultados.
- Riesgo de alucinación en el sentido de transcripciones incorrectas o inventadas en audio de baja calidad, ruidoso o con habla solapada; el autor desaconseja el uso en transcripción crítica para seguridad sin revisión humana.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Los derechos del modelo base pertenecen a NVIDIA.
- El modelo no publica datos sobre sesgos por género, edad o variedad dialectal, más allá de que el conjunto interno está estratificado por género del hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinit/parakeet-tdt-0.6b-v3-sk
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Ajuste de Canary 1B v2 en eslovaco: https://huggingface.co/kinit/canary-1b-v2-sk
- Colección ASR de KInIT: https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247
- Catálogo SLAIH: https://www.slaih.sk/sk/catalog/parakeet-tdt-0-6b-v3-sk
- Dataset SloPalSpeech: https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech
- Mozilla Common Voice 24.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0
- Corpus TEDxSK y JumpSK: https://nlp.kemt.fei.tuke.sk/speech/tedx
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Clúster HPC Devana: https://userdocs.hpc.sav.sk/devana/
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
