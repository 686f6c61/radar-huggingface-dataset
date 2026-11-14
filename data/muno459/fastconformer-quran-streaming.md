# Muno459/fastconformer-quran-streaming

## Resumen

`Muno459/fastconformer-quran-streaming` es un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe, desarrollado por el usuario Muno459 y publicado en Hugging Face bajo licencia NPL-1.1 con acceso restringido. Se trata de una adaptación de la arquitectura FastConformer en su variante híbrida con soporte de *streaming* y *cache-aware*, empaquetada principalmente en formato ONNX y distribuida a través de la librería NeMo de NVIDIA. Con un tamaño de repositorio de 1,8 GB, el modelo está pensado para transcripción en tiempo real de audio recitado, un caso de uso con requisitos acústicos y lingüísticos muy específicos (tajwid, pausas, elongaciones) que los ASR genéricos en árabe no cubren bien.

El modelo se entrena sobre corpus especializados del dominio coránico: `tarteel-ai/everyayah`, `tarteel-ai/tlog` y `obadx/muaalem-annotated-v3`, lo que sugiere un enfoque centrado en la precisión sobre texto sagrado y en la anotación a nivel de fonema o sílaba. La inclusión de la etiqueta `streaming` y `cache-aware` indica que soporta inferencia por trozos con estado persistente entre fragmentos, lo que habilita aplicaciones de seguimiento en vivo de la recitación.

Su relevancia actual radica en la combinación de tres factores poco frecuentes: arquitectura FastConformer (eficiente en cómputo frente a Conformer estándar), especialización en un dominio vertical muy concreto y despliegue vía ONNX, lo que facilita la integración en entornos sin dependencia estricta de PyTorch o de GPU NVIDIA. El acceso restringido y la licencia NPL-1.1 condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hybrid (cache-aware streaming), implementada en NeMo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por fragmentos con estado de caché) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX y NeMo) |
| Idiomas soportados | arabe (recitacion coranica) |
| Licencia | NPL-1.1 (acceso restringido, gated) |
| Formato de pesos | ONNX y checkpoints NeMo (repositorio de 1,8 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer en configuración híbrida, una variante del Conformer que reduce el coste computacional mediante subsampling agresivo en las capas iniciales y atención de profundidad reducida. La variante *cache-aware streaming* mantiene un estado de caché de atenciones y convoluciones entre fragmentos de audio, lo que permite decodificar en línea sin recalcular el contexto completo. La cabecera híbrida combina salida CTC y atención (transducer o similar), patrón habitual en NeMo para equilibrar latencia y precisión.

El entrenamiento se apoya en tres datasets del ecosistema Tarteel y Obadx: `everyayah` (audio coránico alineado por versículo), `tlog` (registros de recitación con marcas temporales) y `muaalem-annotated-v3` (anotaciones fonéticas detalladas). No se especifican en la información disponible el número de horas de audio, la composición exacta del corpus ni si se aplicaron etapas de RLHF o ajuste fino supervisado adicionales. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá del propio mecanismo cache-aware.

## Capacidades

- Reconocimiento automático del habla en árabe especializado en recitación coránica.
- Decodificación en streaming con estado de caché entre fragmentos de audio.
- Salida híbrida CTC + atención, adecuada para alineamientos temporales a nivel de token.
- Procesamiento de audio de un solo hablante (recitador), sin separación de hablantes documentada.
- Integración con el ecosistema NeMo para pipelines de ASR.
- Exportación a ONNX para inferencia fuera de PyTorch.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No se documenta soporte multilingüe más allá del árabe.
- No se documentan capacidades de visión, audio generativo ni modo *thinking*.

## Casos de uso

- Seguimiento en vivo de la recitación: el modelo consume audio por fragmentos con caché persistente y devuelve texto alineado, lo que permite resaltar el versículo en curso en una aplicación móvil o web de acompañamiento coránico.
- Corrección de tajwid y pronunciación: al estar entrenado sobre corpus anotados fonéticamente (`muaalem-annotated-v3`), puede usarse para detectar desviaciones en la articulación de letras y reglas de elongación.
- Verificación de memorización (hifz): comparar la transcripción en streaming con el texto canónico del Corán para señalar omisiones o saltos de versículo en tiempo real.
- Transcripción por lotes de archivos de recitación: procesar grabaciones completas y generar transcripciones alineadas para archivos de audio o bibliotecas de contenido religioso.
- Búsqueda por audio en corpus coránicos: indexar recitaciones y permitir búsquedas por fragmento recitado, apoyándose en la salida temporal del modelo.
- Despliegue en dispositivos con ONNX Runtime: al distribuirse en ONNX, puede ejecutarse en entornos sin PyTorch ni CUDA, útil para aplicaciones de escritorio o servidores ligeros.
- Generación de subtítulos sincronizados para vídeos de recitación, aprovechando la decodificación cache-aware para minimizar la latencia percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1,8 GB, por lo que la huella en memoria es moderada y probablemente inferior a 4 GB en FP16/ONNX, aunque no se confirma.
- GPU recomendadas: no disponibles en la documentación; por la arquitectura FastConformer y el despliegue NeMo/ONNX, es esperable que funcione en GPU NVIDIA de gama media (T4, RTX 3060 en adelante), pero no se confirma.
- Compatibilidad con GPU de consumo: plausible dada la arquitectura y el tamaño, aunque no verificado en la información disponible.
- Opciones de despliegue: NeMo (librería declarada), ONNX Runtime (formato incluido). No se documenta soporte explícito para vLLM (no aplica a ASR), llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muno459/fastconformer-quran-streaming | FastConformer híbrido ASR | Árabe (coránico) | Cache-aware streaming | NPL-1.1 (gated) | Hugging Face, acceso restringido |
| Whisper (OpenAI) | Transformer encoder-decoder ASR | Multilingüe | No nativo streaming | MIT | Abierto |
| NeMo FastConformer ASR genérico (NVIDIA) | FastConformer ASR | Multilingüe | Streaming soportado en algunas variantes | CC-BY-4.0 / otras | Abierto |
| MMS / wav2vec2 árabe (Meta) | CTC ASR | Árabe | No streaming nativo | CC-BY-NC / otras | Abierto |

La comparativa se limita a categorías generales porque no se dispone de métricas publicadas de este modelo frente a alternativas. La ventaja diferencial es la especialización en recitación coránica y el soporte de streaming cache-aware; la desventaja es el acceso restringido y una licencia NPL-1.1 que exige revisión para uso comercial.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado para recitación coránica en árabe; su rendimiento fuera de ese dominio (árabe conversacional, otros dialectos, otros idiomas) no está documentado y probablemente sea deficiente.
- Riesgo de alucinación textual: en ASR especializado en texto sagrado, errores de sustitución pueden alterar el significado; cualquier uso en producción debe incluir verificación contra el texto canónico.
- Sesgos potenciales derivados del corpus: si los recitadores de entrenamiento pertenecen a una escuela de recitación (qira'at) concreta, el modelo puede penalizar otras variantes no representadas.
- Licencia NPL-1.1: no es una licencia de código abierto estándar; es necesario revisar los términos antes de uso comercial o redistribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la integración automatizada en CI/CD.
- Ausencia de benchmarks publicados: no es posible comparar su precisión con métricas objetivas (WER, CER) frente a alternativas.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de despliegues en producción.
- Formato ONNX y NeMo: aunque facilita ciertos despliegues, no cubre todos los runtimes habituales (por ejemplo, llama.cpp u Ollama no aplican a ASR, pero tampoco se documenta integración con servidores de inferencia genéricos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muno459/fastconformer-quran-streaming
- Dataset `tarteel-ai/everyayah`: https://huggingface.co/datasets/tarteel-ai/everyayah
- Dataset `tarteel-ai/tlog`: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset `obadx/muaalem-annotated-v3`: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
- Librería NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/nemo-framework/
