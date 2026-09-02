# FredrikKarlssonSpeech/nb-whisper-medium-mlx-4bit

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-medium-mlx-4bit` es una conversión en formato MLX y cuantización de 4 bits del modelo `NbAiLab/nb-whisper-medium`, desarrollado por la Biblioteca Nacional de Noruega (NbAiLab) para reconocimiento automático del habla (ASR) en noruego bokmål. Esta conversión, creada por FredrikKarlssonSpeech, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`, reduciendo el tamaño del repositorio a 0,4 GB.

El modelo base pertenece a la serie NB-Whisper, basada en la arquitectura Whisper de OpenAI y entrenada durante 250.000 pasos con un conjunto de datos diverso de aproximadamente 8.000 horas de audio (según la información parcial disponible). La conversión a MLX 4-bit no modifica la arquitectura ni los pesos originales, solo los cuantiza para optimizar la inferencia en dispositivos Apple.

La relevancia de este modelo radica en que ofrece una alternativa ligera y rápida para transcripción de audio en noruego, un idioma con pocos recursos en el ecosistema de ASR. Al estar cuantizado en 4 bits y empaquetado para MLX, es adecuado para aplicaciones locales en Mac, sin necesidad de GPU dedicada ni conexión a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible (el modelo base es Whisper medium, ~769 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | noruego bokmal (nb), noruego (no) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (cuantizado 4-bit) |

## Arquitectura y entrenamiento

El modelo base `NbAiLab/nb-whisper-medium` sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atención de escala completa, diseñado para procesar espectrogramas Mel de audio y generar transcripciones de texto. Fue entrenado por NbAiLab durante 250.000 pasos con un dataset diverso de aproximadamente 8.000 horas de audio noruego, incluyendo diferentes dialectos y condiciones acusticas. No se dispone de informacion detallada sobre el uso de tecnicas como RLHF o DPO en el entrenamiento.

La conversion a MLX realizada por FredrikKarlssonSpeech emplea el script `convert.py` del repositorio `mlx-examples/whisper`, que transforma los pesos originales al formato MLX y aplica una cuantizacion de 4 bits. Esta cuantizacion reduce el tamaño del modelo de aproximadamente 1,5 GB (formato fp16) a 0,4 GB, a costa de una ligera perdida de precision en la transcripcion. La arquitectura del modelo no se modifica; solo se optimiza la representacion numerica de los pesos para acelerar la inferencia en Apple Silicon.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego bokmal y noruego general.
- Transcripcion de audio a texto con soporte de puntuacion basica y normalizacion de numeros (dependiendo del tokenizador del modelo base).
- Inferencia local rapida en Apple Silicon gracias a la cuantizacion 4-bit y la optimizacion MLX.
- Compatibilidad con la API de `mlx-whisper`, que permite transcripcion desde linea de comandos o integracion en scripts Python.
- No se han documentado capacidades de traduccion, tool calling, agentes ni vision en esta conversion especifica.

## Casos de uso

- Transcripcion de reuniones y entrevistas en noruego: el modelo puede procesar grabaciones de audio de hasta 30 segundos por ventana, adecuado para archivos largos mediante segmentacion automatica.
- Subtitulado de videos y podcasts en noruego: al ejecutarse localmente en Mac, permite generar subtitulos sin enviar datos a servicios externos, lo que garantiza privacidad.
- Asistentes de voz para aplicaciones de productividad: integrable en herramientas de dictado o busqueda por voz en noruego, con latencia baja gracias a MLX.
- Archivado y busqueda de contenido audiovisual: las transcripciones generadas pueden indexarse para busqueda textual en bibliotecas digitales o archivos corporativos.
- Pruebas y desarrollo de sistemas ASR en noruego: sirve como modelo de referencia para comparar con otras soluciones o para realizar fine-tuning posterior.
- Aplicaciones educativas de aprendizaje de idiomas: transcripcion de pronunciaciones para ejercicios de comprension auditiva en noruego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `NbAiLab/nb-whisper-medium` reporta mejoras sobre Whisper medium original en tareas de ASR noruego, pero los datos concretos (WER, CER) no estan incluidos en la documentacion de esta conversion. Se recomienda consultar la ficha del modelo base para obtener metricas de referencia.

## Requisitos de hardware

- Dispositivo con Apple Silicon (M1, M2, M3 o posteriores) para aprovechar la aceleracion MLX.
- Memoria RAM: el modelo cuantizado ocupa 0,4 GB en disco; durante la inferencia se requiere memoria adicional para el procesamiento de audio, tipicamente entre 1 y 2 GB.
- No requiere GPU dedicada; la inferencia se ejecuta en la CPU y GPU unificada del chip Apple.
- Opciones de despliegue: `mlx-whisper` (linea de comandos y API Python), integrable en aplicaciones macOS.
- Latencia estimada: no disponible, aunque la cuantizacion 4-bit reduce el tiempo de inferencia respecto al modelo fp16 en aproximadamente un 30-40% (estimacion cualitativa, no medida en este repositorio).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| nb-whisper-medium-mlx-4bit (este) | Whisper medium | ~769 M (cuantizado) | 30 s audio | Apache 2.0 | MLX 4-bit | 0,4 GB |
| NbAiLab/nb-whisper-medium | Whisper medium | ~769 M | 30 s audio | Apache 2.0 | PyTorch / Transformers | ~1,5 GB |
| openai/whisper-medium | Whisper medium | ~769 M | 30 s audio | MIT | PyTorch / Transformers | ~1,5 GB |

La principal ventaja de la version MLX 4-bit es su tamaño reducido y la velocidad en Apple Silicon, mientras que el modelo base ofrece mayor precision al no estar cuantizado. El modelo original de OpenAI cubre multiples idiomas, pero no esta optimizado especificamente para noruego como el de NbAiLab.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede degradar la precision de la transcripcion, especialmente en audio con ruido de fondo o dialectos poco representados.
- El modelo esta limitado al noruego bokmal y noruego general; no soporta otros idiomas escandinavos como sueco o danes.
- No se han documentado sesgos especificos, pero al estar entrenado con datos de la Biblioteca Nacional de Noruega, puede tener un sesgo hacia registros formales o variedades estandar del noruego.
- Riesgo de alucinacion en segmentos de silencio o audio ininteligible, comun en modelos Whisper.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del modelo base y sus restricciones adicionales (el modelo base de NbAiLab tambien usa Apache 2.0).
- Para produccion, se recomienda evaluar el modelo con datos propios y comparar con la version sin cuantizar antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-medium-mlx-4bit
- Modelo base NbAiLab/nb-whisper-medium: https://huggingface.co/NbAiLab/nb-whisper-medium
- Repositorio mlx-whisper (ejemplos MLX): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Repositorio NbAiLab/nb-whisper: https://github.com/NbAiLab/nb-whisper
- Demo de NB-Whisper (modelo large): https://ai.nb.no/nb-whisper-demo/
