# FredrikKarlssonSpeech/nb-whisper-small-mlx-4bit

## Resumen

nb-whisper-small-mlx-4bit es una conversión del modelo de reconocimiento automático del habla (ASR) NbAiLab/nb-whisper-small, optimizado para inferencia eficiente en hardware Apple Silicon mediante el framework MLX. El modelo original, desarrollado por el National Library of Norway (NbAiLab), es un fine-tuning del Whisper-small de OpenAI entrenado específicamente para el idioma noruego (bokmål y nynorsk). Esta conversión aplica cuantización de 4 bits para reducir el tamaño y acelerar la inferencia en dispositivos Apple.

La relevancia de este modelo radica en que ofrece una solución de ASR en noruego de alta calidad que puede ejecutarse localmente en Macs con chips M-series, sin necesidad de GPU dedicadas ni conexión a la nube. Al estar basado en Whisper-small, hereda la arquitectura encoder-decoder Transformer de OpenAI, pero adaptada al dominio lingüístico noruego. El repositorio tiene un tamaño de 0.1 GB, lo que refleja la compresión conseguida con la cuantización 4-bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder Transformer) |
| Parametros totales | 244 M (estimado, basado en Whisper-small) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (Whisper-small) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Noruego (nb, no) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (4-bit quantized) |

## Arquitectura y entrenamiento

El modelo base NbAiLab/nb-whisper-small es un fine-tuning del Whisper-small de OpenAI sobre datos de audio noruego. Whisper-small utiliza una arquitectura Transformer encoder-decoder con aproximadamente 244 millones de parametros, entrenada originalmente sobre 680.000 horas de audio multilingue. El fine-tuning de NbAiLab adapta el modelo al noruego, incluyendo tanto bokmål como nynorsk, mejorando significativamente el reconocimiento frente al Whisper original en este idioma.

La conversión a MLX se realizó con la herramienta `mlx-examples/whisper/convert.py` del repositorio oficial de Apple MLX, aplicando cuantización de 4 bits. MLX es un framework de aprendizaje automático diseñado por Apple para aprovechar la memoria unificada y el Neural Engine de los chips Apple Silicon. La cuantización 4-bit reduce el tamaño del modelo aproximadamente un 75% respecto al formato original de 16 bits, lo que permite cargarlo completamente en memoria y acelerar la inferencia en dispositivos Mac.

## Capacidades

- Reconocimiento automatico del habla (ASR) en noruego (bokmål y nynorsk) con transcripcion de audio a texto.
- Transcripcion de segmentos de audio de hasta 30 segundos por pasada, con manejo de audio mas largo mediante ventanas deslizantes.
- Deteccion de idioma integrada (heredada de Whisper), aunque optimizada para noruego.
- Inferencia local en Apple Silicon sin conexion a internet, gracias al formato MLX.
- Integracion con la libreria `mlx-whisper` para transcripcion desde linea de comandos o Python.
- No soporta traduccion de voz a otros idiomas (funcionalidad desactivada en el fine-tuning noruego).
- No incluye capacidades de vision, tool calling ni razonamiento multimodal.

## Casos de uso

- Transcripcion de reuniones y entrevistas en noruego: el modelo puede transcribir grabaciones de audio de reuniones de empresa o entrevistas de investigacion directamente en un Mac, sin enviar datos a servidores externos, lo que resulta util para entornos con requisitos de confidencialidad.
- Subtitulado automatico de contenido audiovisual: productoras noruegas y plataformas de streaming pueden generar subtitulos para video en noruego de forma local, reduciendo costes frente a servicios de transcripcion manual.
- Accesibilidad para personas con discapacidad auditiva: aplicaciones de transcripcion en tiempo real o diferida pueden integrar este modelo para ofrecer texto de contenido hablado en noruego en entornos educativos o administrativos.
- Archivo y digitalizacion de material sonoro historico: la Biblioteca Nacional de Noruega y otras instituciones pueden transcribir archivos de audio historicos en noruego, facilitando su busqueda y preservacion digital.
- Asistentes de voz en noruego: desarrolladores de aplicaciones de productividad o domotica pueden integrar el modelo para comandos de voz en noruego que funcionen completamente en local, evitando dependencias de APIs en la nube.
- Analisis de llamadas de servicio al cliente: empresas noruegas pueden transcribir grabaciones de llamadas de soporte para analisis de calidad y extraccion de insights, manteniendo los datos dentro de su infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original NbAiLab/nb-whisper-small reporta mejoras frente al Whisper-small estandar en noruego, pero los datos especificos de WER (Word Error Rate) no estan incluidos en la documentacion de esta conversion. La cuantizacion 4-bit tipicamente introduce una degradacion minima en la precision (generalmente inferior a 1 punto porcentual de WER) en modelos Whisper, pero no hay mediciones publicadas para esta conversion concreta.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con macOS 13.0 o superior.
- VRAM: al ser un modelo de 244 M de parametros cuantizado a 4-bit, ocupa aproximadamente 0.1 GB en memoria, por lo que cabe en cualquier Mac con al menos 8 GB de RAM unificada.
- GPU recomendada: no aplica, el modelo usa la GPU integrada del chip Apple Silicon via Metal.
- Opciones de despliegue: `mlx-whisper` (linea de comandos y Python), integrable en aplicaciones macOS via el ecosistema MLX.
- Latencia estimada: en un MacBook Pro con M2, la transcripcion de un minuto de audio suele tomar entre 5 y 15 segundos, dependiendo de la complejidad del audio y la longitud de los segmentos.
- No compatible con GPUs NVIDIA o AMD, ni con entornos Linux o Windows sin emulacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| nb-whisper-small-mlx-4bit | 244 M | 30 s audio | Noruego | Apache-2.0 | MLX 4-bit |
| NbAiLab/nb-whisper-small | 244 M | 30 s audio | Noruego | Apache-2.0 | PyTorch / safetensors |
| openai/whisper-small | 244 M | 30 s audio | Multilingue (99 idiomas) | MIT | PyTorch / safetensors |
| NbAiLab/nb-whisper-medium | 769 M | 30 s audio | Noruego | Apache-2.0 | PyTorch / safetensors |

La principal ventaja de esta conversion frente al modelo original es la eficiencia en Apple Silicon: menor uso de memoria y mayor velocidad de inferencia. Frente a whisper-small multilingue, el fine-tuning noruego ofrece mejor precision en noruego, especialmente en acentos y vocabulario local. El modelo medium de NbAiLab ofrece mayor precision pero requiere mas recursos y no tiene una conversion MLX 4-bit publicada por este autor.

## Limitaciones y advertencias

- Modelo limitado al idioma noruego; no funciona correctamente con otros idiomas.
- La cuantizacion 4-bit puede introducir una ligera degradacion en la precision frente al modelo original en formato 16-bit, especialmente en audio con ruido de fondo o acentos muy marcados.
- Solo compatible con Apple Silicon; no puede ejecutarse en GPUs NVIDIA, AMD ni en CPUs x86 convencionales.
- No soporta traduccion de voz, solo transcripcion.
- El contexto de 30 segundos por segmento puede requerir gestion manual de audio largo, aunque `mlx-whisper` maneja esto automaticamente.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Whisper de OpenAI tiene licencia MIT; la combinacion es compatible, aunque se recomienda revisar los terminos de los datos de entrenamiento del fine-tuning noruego.
- No hay informacion sobre sesgos especificos del modelo, pero al estar entrenado principalmente con datos de la Biblioteca Nacional de Noruega, puede tener sesgos hacia lenguaje formal o dialectos estandarizados.
- El autor ha publicado otras conversiones (ONNX, medium) pero este repositorio no tiene issues ni discusiones, lo que sugiere un mantenimiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-small-mlx-4bit
- Modelo original: https://huggingface.co/NbAiLab/nb-whisper-small
- Repositorio de NB-Whisper: https://github.com/NbAiLab/nb-whisper
- Documentacion de mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Demo de NB-Whisper: https://ai.nb.no/nb-whisper-demo/
- Conversiones relacionadas del autor: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-small-onnx y https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-medium-onnx
