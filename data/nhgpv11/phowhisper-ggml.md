# nhgpv11/PhoWhisper-ggml

## Resumen

PhoWhisper-ggml es una conversión de formato de los modelos PhoWhisper de VinAI (variantes small y medium) al formato ggml con cuantización q5_0, pensada para su ejecución con whisper.cpp y Whisper.net. No se trata de un modelo nuevo ni de un reentrenamiento: es un trabajo de conversión publicado por el usuario nhgpv11, que toma los pesos originales en PyTorch de vinai/PhoWhisper-small y vinai/PhoWhisper-medium y los transforma en ficheros binarios optimizados para inferencia local en CPU. El objetivo es permitir la transcripción de voz en vietnamita en equipos sin GPU, como demuestra el caso de uso declarado por el autor: la aplicación TIS Biên Bản Họp, que transcribe reuniones directamente en el ordenador del usuario.

Los modelos originales PhoWhisper son ajustes finos de Whisper (arquitectura transformer encoder-decoder con espectrograma mel como entrada) realizados por VinAI sobre un corpus de 844 horas de audio en vietnamita con acentos diversos. La variante medium, la más capaz de las dos incluidas aquí, mantiene la estructura y el tamaño del Whisper medium original de OpenAI, pero especializada en un único idioma, lo que mejora la precisión frente al modelo multilingüe genérico en condiciones de acento y ruido propios del vietnamita.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar ASR vietnamita en local, con licencia BSD-3-Clause heredada del modelo original y con instrucciones concretas de uso (forzar `no_timestamps`, fijar idioma `vi`, segmentación con VAD). Es, por tanto, un artefacto de infraestructura más que un modelo de investigación: su valor está en el formato y en las notas de operación, no en avances arquitectónicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), entrada espectrograma mel |
| Parametros totales | no disponible (hereda el tamaño de Whisper small y medium) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventanas de audio de hasta 30 s por segmento (recomendado segmentar a ~28 s) |
| Tipos de cuantizacion | q5_0 (única incluida en el repo) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause (Copyright (c) 2024, VinAI) |
| Formato de pesos | ggml (`.bin`), generado desde `pytorch_model.bin` original |

Ficheros incluidos:

| Fichero | Modelo base | Bytes | SHA-256 |
|---|---|---|---|
| `ggml-phowhisper-small-q5_0.bin` | vinai/PhoWhisper-small | 175 209 680 | `4ecf5391f52b62029284300ccbfdf9dd420c1af1b144acbb1be5d22e62e24496` |
| `ggml-phowhisper-medium-q5_0.bin` | vinai/PhoWhisper-medium | 539 212 484 | `e2cd4ceda28646fc74e48f171fad8ebd75e0ab06817d70349bc42ae2335bfc27` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que procesa espectrogramas mel de 80 canales y genera tokens de texto de forma autorregresiva, con atención encoder-decoder sobre la representación acústica. PhoWhisper parte de los pesos multilingües de Whisper y se ajusta fino sobre 844 horas de audio en vietnamita con acentos diversos, según la documentación del repositorio VinAIResearch/PhoWhisper. No hay innovaciones arquitectónicas propias: la mejora proviene del ajuste fino monolingüe y del corpus específico.

Este repositorio concreto no aporta entrenamiento adicional. El autor documenta un script `convert-phowhisper-to-ggml.py` que carga los pesos originales con `torch.load(weights_only=True)`, renombra los tensores siguiendo la convención de `convert-h5-to-ggml.py` de whisper.cpp y aplica cuantización q5_0 equivalente a `quantize_row_q5_0_ref` de ggml. El resultado es una conversión determinista verificable por SHA-256, sin RLHF, DPO ni datos nuevos. La innovación práctica es la disponibilidad de pesos PhoWhisper en un formato que whisper.cpp y Whisper.net pueden cargar directamente.

## Capacidades

- Reconocimiento automático de voz en vietnamita, con salida de texto transcrito.
- Gestión de acentos diversos y condiciones de audio variables, gracias al ajuste fino sobre 844 horas de audio vietnamita.
- Ejecución en CPU mediante whisper.cpp, sin requerir GPU.
- Integración con Whisper.net para aplicaciones .NET.
- Segmentación de audio larga mediante detección de actividad de voz (Silero VAD) y transcripción por bloques de aproximadamente 28 segundos.
- No soporta timestamps fiables: el modelo fue ajustado sin marcas temporales y debe usarse con `no_timestamps` activado.
- No soporta traducción a otros idiomas, tool calling, agentes, visión ni audio más allá de la transcripción.
- No es multilingüe: solo vietnamita.

## Casos de uso

- Transcripción de reuniones en local: la aplicación TIS Biên Bản Họp usa estos ficheros para pasar audio de reuniones a texto en el propio ordenador del usuario, sin enviar datos a la nube; encaja porque el modelo corre en CPU y la licencia BSD permite distribución.
- Subtitulado de contenido audiovisual vietnamita: se puede procesar una pista de audio con VAD y transcribir por segmentos de 28 s; la variante medium ofrece mejor precisión con locutores claros.
- Digitalización de actas y notas de voz: integración en herramientas ofimáticas o apps de notas que convierten grabaciones cortas en texto editable, usando la variante small para equipos modestos.
- Pipelines de accesibilidad para hablantes de vietnamita: generación de transcripciones en tiempo casi real en aplicaciones de escritorio, con latencia dependiente de la CPU y del tamaño del modelo.
- Preprocesado de corpus para NLP: transcripción masiva de audio vietnamita para construir datasets de texto, con la ventaja de ejecutarse en clústeres de CPU sin GPUs.
- Integración en aplicaciones .NET: mediante Whisper.net, desarrolladores de software de escritorio Windows pueden incorporar ASR vietnamita sin dependencias de servicios externos.
- Prototipado e investigación: evaluación comparativa de ASR vietnamita en entornos controlados, usando los SHA-256 publicados para garantizar reproducibilidad de los pesos.

## Benchmarks y rendimiento

El autor reporta mediciones propias sobre FLEURS vietnamita (10 minutos de audio) en un equipo de oficina con Core i5-1145G7 y Windows 10:

| Modelo | Condición | Tasa de error de palabra (WER) aproximada |
|---|---|---|
| PhoWhisper-medium (q5_0) | Voz clara, lectura | ~11 % |
| PhoWhisper-medium (q5_0) | Simulación de sala de reuniones (reverberación, ruido, hablantes solapados) | ~26 % |

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje. Los datos de WER anteriores son estimaciones del autor de la conversión, no del equipo de VinAI.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que whisper.cpp está pensado para CPU; en GPU, los pesos q5_0 ocupan aproximadamente 0,17 GB (small) y 0,54 GB (medium), más memoria para activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal puede ejecutar whisper.cpp; para CPU, no se requiere GPU.
- Cabe en GPU consumer: sí, con margen amplio; incluso en iGPU y CPU de portátil, como demuestra la medición en Core i5-1145G7.
- Opciones de despliegue: whisper.cpp (CLI y librería), Whisper.net para .NET, y cualquier runtime compatible con ggml.
- Latencia y throughput: no disponible de forma sistemática; la referencia del autor es una CPU de oficina con Windows 10, sin cifras de tiempo por minuto de audio.
- Almacenamiento: 0,7 GB de repositorio total; los ficheros individuales pesan 175 MB (small) y 539 MB (medium).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PhoWhisper-ggml (este repo) | small y medium (tamaños Whisper) | segmentos de ~28-30 s | vi | BSD-3-Clause | ggml q5_0 |
| vinai/PhoWhisper-medium (original) | medium (Whisper) | segmentos de ~30 s | vi | BSD-3-Clause | PyTorch (safetensors/bin) |
| vinai/PhoWhisper-large (original) | large (Whisper) | segmentos de ~30 s | vi | BSD-3-Clause | PyTorch |
| Whisper medium (OpenAI) | medium | segmentos de ~30 s | multilingüe | MIT | PyTorch, ggml, etc. |

La comparativa relevante es frente a los originales de VinAI: este repositorio no añade precisión, solo portabilidad a whisper.cpp. Frente a Whisper medium multilingüe, PhoWhisper está especializado en vietnamita y, según la documentación de VinAI, mejora la robustez ante acentos; no hay datos comparativos de WER entre ambos en la información disponible.

## Limitaciones y advertencias

- No es una versión oficial de VinAI ni está respaldada por VinAI; es una conversión de formato de un tercero.
- Solo admite vietnamita; no es multilingüe ni traduce.
- Los timestamps no son fiables: es obligatorio usar `no_timestamps`, ya que el modelo fue ajustado sin marcas temporales y, en caso contrario, inventa texto y se ralentiza.
- El WER empeora notablemente en condiciones de reverberación, ruido y hablantes solapados (hasta ~26 % en la simulación del autor).
- Solo se distribuye cuantización q5_0; no hay variantes q4, q8, fp16 ni GGUF en este repositorio.
- Riesgo de alucinación de texto en segmentos silenciosos o ruidosos, mitigable con VAD y segmentación a ~28 s.
- Sesgos: no documentados en la información disponible; dependen del corpus de 844 horas de VinAI.
- Licencia BSD-3-Clause permite uso comercial, pero exige mantener el aviso de copyright de VinAI y la cláusula de no endorsement.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Fecha de creación del repositorio: 2026-11-08, según los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nhgpv11/PhoWhisper-ggml
- Modelo base small: https://huggingface.co/vinai/PhoWhisper-small
- Modelo base medium: https://huggingface.co/vinai/PhoWhisper-medium
- Modelo base large: https://huggingface.co/vinai/PhoWhisper-large
- Repositorio VinAIResearch/PhoWhisper: https://github.com/VinAIResearch/PhoWhisper
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Whisper.net: https://github.com/sandrohanea/whisper.net
- Artículo PhoWhisper (arXiv:2406.02555): Le, T.-T., Nguyen, L. T., & Nguyen, D. Q. (2024). PhoWhisper: Automatic Speech Recognition for Vietnamese. https://arxiv.org/abs/2406.02555
- Aplicación TIS Biên Bản Họp: https://tisvn.net
