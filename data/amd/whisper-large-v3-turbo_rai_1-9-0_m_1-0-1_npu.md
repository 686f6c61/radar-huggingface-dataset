# amd/whisper-large-v3-turbo_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/whisper-large-v3-turbo_rai_1.9.0_m_1.0.1_npu` es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo`, publicada por AMD y optimizada para ejecutarse sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El modelo base es la variante "turbo" de Whisper large-v3, una arquitectura transformer encoder-decoder diseñada por OpenAI para transcripción multilingüe y traducción de voz a texto, que reduce el número de capas del decodificador para acelerar la inferencia manteniendo una calidad cercana al large-v3 completo.

El paquete incluye los artefactos necesarios para el despliegue en NPUs de AMD bajo el stack Ryzen AI (versiones `rai_1.9.0` del runtime y `m_1.0.1` del modelo compilado), lo que lo convierte en una pieza orientada a inferencia local de baja latencia en equipos con hardware AMD. No es un modelo nuevo entrenado por AMD, sino una reempaquetado/compilación del modelo de OpenAI con licencia MIT.

Su relevancia actual radica en la creciente demanda de ASR en el dispositivo (on-device) sin depender de la nube, con privacidad de datos y consumo energético reducido. El repositorio es de acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni likes, lo que sugiere un lanzamiento muy reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (el nombre indica compilacion para NPU; no se detalla el esquema de cuantizacion) |
| Idiomas soportados | no disponible en la ficha (el modelo base Whisper large-v3-turbo soporta multilingue, pero no se confirma en esta exportacion) |
| Licencia | MIT |
| Formato de pesos | ONNX (artefactos para runtime Ryzen AI; tamano del repo 2.6 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atención estándar (no lineal) entrenado por OpenAI sobre datos de audio y texto multilingüe. La variante "turbo" reduce el decodificador a 4 capas (frente a las 32 del large-v3), lo que disminuye el coste computacional de decodificación y acelera la inferencia manteniendo el encoder de 32 capas. Whisper se entrena con una combinación de tareas (transcripción, traducción a inglés y predicción de marcas temporales) y utiliza tokens especiales para control de idioma y tarea.

Esta publicación de AMD no aporta información sobre el proceso de compilación, calibración o cuantización aplicado para la NPU; el nombre sugiere una compilación con el runtime Ryzen AI `1.9.0` y una versión de modelo `1.0.1`. No se documentan en la información disponible datos de entrenamiento adicionales, RLHF/DPO ni innovaciones técnicas propias más allá de la exportación ONNX y la optimización para NPU.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto.
- Traducción de voz a texto (capacidad heredada del modelo base Whisper, no confirmada explícitamente en esta exportación).
- Procesamiento multilingüe (según el modelo base; no confirmado en la ficha).
- Ejecución en NPU Ryzen AI mediante ONNX, orientada a inferencia local de baja latencia.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.
- No se documenta modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Transcripción local de reuniones: el modelo puede ejecutarse en la NPU de un portátil Ryzen AI para convertir audio de reuniones en texto sin enviar datos a la nube, aprovechando la ventana de audio de 30 s de Whisper y el procesamiento por fragmentos.
- Subtitulado automático en tiempo casi real: al estar compilado para NPU, reduce la latencia y el consumo energético, adecuado para generar subtítulos en aplicaciones de vídeo o streaming local.
- Dictado por voz en aplicaciones de escritorio: integración en herramientas de productividad que requieren transcripción offline y privacidad de datos.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en entornos sin conectividad.
- Análisis de llamadas y atención al cliente: transcripción por lotes de grabaciones para su posterior análisis, con la ventaja de ejecución en hardware AMD local.
- Investigación en ASR eficiente: evaluación de Whisper large-v3-turbo sobre NPU frente a GPU/CPU para estudiar latencia, throughput y consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI (plataforma compatible con el runtime `rai_1.9.0`); no se especifica el modelo exacto de NPU requerido.
- VRAM/RAM estimada: no disponible; el repositorio ocupa 2.6 GB, lo que da una idea del espacio en disco necesario.
- GPU: no aplica (el artefacto está orientado a NPU); no se documenta compatibilidad con GPU NVIDIA/AMD.
- No se confirma que quepa en GPU de consumo; el despliegue previsto es en NPU Ryzen AI.
- Opciones de despliegue: runtime Ryzen AI (ONNX Runtime con ejecución en NPU); no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| amd/whisper-large-v3-turbo_rai_1.9.0_m_1.0.1_npu | no disponible | no disponible (ventanas de 30 s) | MIT | Gated en HF, formato ONNX para NPU |
| openai/whisper-large-v3-turbo | no disponible en la informacion | no disponible (ventanas de 30 s) | MIT | Público en HF, pesos PyTorch |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible (ventanas de 30 s) | MIT | Público en HF, pesos PyTorch |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- No se documentan idiomas soportados en esta exportación; la cobertura multilingüe debe verificarse contra el modelo base.
- No se detalla el esquema de cuantización ni las posibles pérdidas de precisión derivadas de la compilación para NPU.
- Dependencia del runtime Ryzen AI `1.9.0` y de hardware AMD compatible; no es portable a otras plataformas sin reexportación.
- Riesgo de alucinación inherente a los modelos ASR (transcripciones plausibles pero incorrectas en audio ruidoso o con acentos).
- Sesgos heredados del corpus de entrenamiento de Whisper (posibles diferencias de calidad entre idiomas y variedades dialectales).
- Licencia MIT permite uso comercial, pero debe respetarse la licencia del modelo base y las condiciones del acceso gated.
- No hay datos de benchmarks ni de latencia que permitan validar su idoneidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/amd/whisper-large-v3-turbo_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
