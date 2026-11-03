# KlangAI/pianissimo-da-mlx-8bit

## Resumen

KlangAI/pianissimo-da-mlx-8bit es una version cuantizada a 8 bits del modelo de reconocimiento automatico del habla (ASR) en danes KlangAI/pianissimo-da, desarrollado por Klang. El modelo original se ha convertido al formato MLX para ejecutarse en la GPU de Macs con Apple silicon (M1 o posteriores) mediante la libreria MLX y el runtime parakeet-mlx, sin necesidad de PyTorch ni NeMo.

Se trata de un modelo de arquitectura FastConformer con decodificacion TDT (Token-and-Duration Transducer), especializado exclusivamente en transcripcion de audio en danes. Con 627 millones de parametros y un peso de repositorio de 759 MB, la version 8-bit ofrece una tasa de error de palabra (WER) de 7,49 % en FLEURS, practicamente identica al 7,43 % del modelo original en fp32 (2,51 GB), lo que supone una reduccion de tamano superior al 70 % sin perdida apreciable de precision.

La relevancia de esta version radica en que permite desplegar ASR de calidad en hardware de consumo Apple sin infraestructura de GPU dedicada, con un rendimiento medido de 151x RTFx (velocidad de audio procesado por unidad de tiempo) y un pico de memoria de 2,2 GB para transcribir una grabacion de 5 minutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa audio en fragmentos de 2 minutos con 15 s de solapamiento |
| Tipos de cuantizacion | 8-bit (grupos de 64 pesos en capas lineales del encoder; resto en bfloat16) |
| Idiomas soportados | danes (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer, una variante eficiente del Conformer que combina capas de atencion y convoluciones para procesar secuencias de audio, con decodificacion TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para mejorar la eficiencia de la transcripcion. El modelo conserva la atencion local del checkpoint original (256 frames a cada lado), lo que limita el coste computacional en secuencias largas.

La version 8-bit se ha generado mediante la cuantizacion integrada de MLX aplicada a las capas lineales del encoder, con grupos de 64 pesos, mientras que el resto de pesos se almacenan en bfloat16. Los pesos se convierten desde el checkpoint original fp32. No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en danes con salida de texto plano.
- Generacion de marcas de tiempo a nivel de frase y de token (accesibles en `result.sentences` y `sentence.tokens`).
- Procesamiento de grabaciones largas mediante fragmentacion automatica en bloques de 2 minutos con 15 segundos de solapamiento (configurable con `chunk_duration`).
- Acepta entrada de archivo de audio o array NumPy mono a 16 kHz.
- Phrase boosting: permite definir un vocabulario personalizado (nombres propios, terminos tecnicos, toponimos) para mejorar la ortografia de terminos concretos, con resultados equivalentes a los de NeMo en el modelo original.
- Ejecucion en GPU de Apple silicon mediante MLX, sin dependencias de PyTorch ni NeMo.
- No soporta otros idiomas distintos del danes, ni vision, ni tool calling, ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones y actas en empresas danesas: el modelo procesa grabaciones de varios minutos fragmentandolas automaticamente y devuelve texto con marcas de tiempo por frase, lo que facilita la revision y el alineado con notas.
- Subtitulado de contenido audiovisual en danes: la salida con timestamps por token permite generar subtitulos sincronizados sin necesidad de un alineador externo.
- Investigacion cualitativa y entrevistas: transcripcion local en un Mac sin enviar audio a servicios en la nube, relevante para datos personales o sujetos a confidencialidad.
- Asistentes de voz y dictado en aplicaciones macOS: integracion mediante el loader `pianissimo_mlx.py` en herramientas de escritorio que requieran transcripcion en tiempo real o cuasi real (151x RTFx).
- Transcripcion de archivos de audio historicos o de archivo en danes: el phrase boosting permite incorporar nombres de instituciones, lugares o terminologia especifica para reducir errores ortograficos.
- Prototipado y evaluacion de pipelines ASR: al ser un modelo ligero (759 MB) y ejecutable en hardware de consumo, sirve para validar flujos de preprocesado, normalizacion y evaluacion de WER antes de escalar a infraestructura mayor.
- Procesamiento por lotes en estaciones de trabajo Apple: la memoria pico de 2,2 GB para 5 minutos de audio permite ejecutar varias instancias o procesar colas de audio en un solo equipo.

## Benchmarks y rendimiento

| Modelo | Pesos | Descarga | FLEURS test (WER %) | Velocidad (RTFx) | Memoria pico, 5 min |
|---|---|---:|---:|---:|---:|
| pianissimo-da | fp32 original | 2,51 GB | 7,43 | no disponible | no disponible |
| pianissimo-da-mlx-8bit | 8-bit | 759 MB | 7,49 | 151x | 2,2 GB |
| pianissimo-da-mlx-4bit | 4-bit | 528 MB | 7,80 | 126x | 2,2 GB |
| pianissimo-da-mlx | bf16 | 1,25 GB | 7,48 | 140x | 2,7 GB |
| pianissimo-da-mlx-fp32 | fp32 | 2,51 GB | 7,43 | 173x | 3,8 GB |

Notas: el WER se mide sobre las 930 grabaciones danesas de FLEURS con el normalizador de evaluacion propio de Klang. La velocidad (RTFx) y la memoria se midieron en el modelo sueco de la misma arquitectura sobre una GPU Apple M5 Pro de 24 GB, con un clip de 30 segundos para la velocidad y una grabacion de 5 minutos para la memoria. En una comprobacion separada en Mac, esta version coincidio con la referencia fp32 normalizada en 187 de 200 clips de FLEURS.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,2 GB de pico en GPU para transcribir 5 minutos de audio (version 8-bit).
- Hardware objetivo: Macs con Apple silicon (M1 o posteriores); las mediciones publicadas se realizaron en una GPU Apple M5 Pro de 24 GB.
- No esta pensado para GPU NVIDIA; para otras plataformas el autor remite a las versiones ONNX.
- Cabe en cualquier Mac con Apple silicon; el consumo de 2,2 GB es compatible incluso con configuraciones de memoria unificada de 8 GB.
- Despliegue: MLX + parakeet-mlx 0.5.2 + huggingface_hub + sentencepiece; ffmpeg para leer archivos de audio.
- Es necesario usar el loader `pianissimo_mlx.py` incluido en el repositorio: llamar directamente a parakeet-mlx no soporta los pesos cuantizados y aplica un preprocesado ligeramente distinto, lo que anade aproximadamente 0,2 puntos porcentuales de WER.
- Latencia y throughput: 151x RTFx en un clip de 30 segundos (audio procesado por unidad de tiempo), medido en Apple M5 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER FLEURS danes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pianissimo-da-mlx-8bit | 627 M | audio en bloques de 2 min | 7,49 % | CC BY 4.0 | MLX (Apple silicon) |
| pianissimo-da (fp32) | 627 M | audio en bloques de 2 min | 7,43 % | CC BY 4.0 | NeMo/PyTorch |
| pianissimo-da-mlx-4bit | 627 M | audio en bloques de 2 min | 7,80 % | CC BY 4.0 | MLX (Apple silicon) |
| pianissimo-da-onnx | no disponible | no disponible | no disponible | CC BY 4.0 | ONNX (multiplataforma) |

No se dispone en la informacion proporcionada de comparaciones con modelos ASR de otros desarrolladores (por ejemplo, Whisper u otros modelos multilingues) para el idioma danes.

## Limitaciones y advertencias

- Modelo monoidioma: solo transcribe danes; no soporta otros idiomas.
- Solo ejecutable en Apple silicon mediante MLX; no es compatible con GPU NVIDIA ni con el stack estandar de PyTorch/NeMo sin conversion.
- Requiere el loader propio del repositorio; usar parakeet-mlx directamente degrada el WER en torno a 0,2 puntos porcentuales y no soporta los pesos cuantizados.
- La cuantizacion 8-bit introduce una degradacion minima pero real (7,49 % frente a 7,43 % en fp32); para maxima fidelidad existe la version fp32.
- Riesgo de alucinacion y errores en audio con ruido, acentos no estandar o solapamiento de hablantes: no se documentan en la informacion disponible.
- No se documentan sesgos especificos del modelo; al entrenarse para danes, puede tener sesgos derivados de la distribucion del corpus de entrenamiento, no detallada.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario citar a Klang segun el BibTeX proporcionado.
- La fragmentacion en bloques de 2 minutos con solapamiento de 15 s puede introducir discontinuidades en la salida si se procesan grabaciones muy largas; conviene revisar las uniones.
- No se dispone de informacion sobre el volumen ni la composicion de los datos de entrenamiento, lo que limita la evaluacion de riesgos de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Modelo base: https://huggingface.co/KlangAI/pianissimo-da
- Version 4-bit: https://huggingface.co/KlangAI/pianissimo-da-mlx-4bit
- Version bf16: https://huggingface.co/KlangAI/pianissimo-da-mlx
- Version fp32 MLX: https://huggingface.co/KlangAI/pianissimo-da-mlx-fp32
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Libreria MLX: https://github.com/ml-explore/mlx
- Runtime parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
