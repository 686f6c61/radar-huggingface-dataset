# Phoonnx/pipertts_pt-PT_voice4

## Resumen

pipertts_pt-PT_voice4 es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx en Hugging Face y distribuido en formato ONNX, lo que lo hace directamente compatible con el motor Piper. El modelo está orientado al portugués (etiqueta `pt`), con la variante pt-PT indicada en el nombre, y se ha entrenado sobre el dataset `Phoonnx/tuga-tts-train-synthetic-voice4`. El repositorio ocupa aproximadamente 0,1 GB, un tamaño coherente con los pesos compactos que suele emplear la familia Piper para inferencia en CPU.

El modelo resuelve la necesidad de disponer de una voz sintética ligera y desplegable localmente para aplicaciones de lectura en voz alta, doblaje o asistentes embebidos en portugués. Al estar empaquetado en ONNX, está pensado para ejecutarse sin GPU dedicada, en entornos con recursos limitados, mediante el runtime onnxruntime o el binario piper.

La información pública disponible es muy escasa: la model card no incluye arquitectura detallada, número de parámetros, licencia ni resultados de evaluación. Esta ficha recoge lo que puede verificarse a partir de los metadatos del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (formato ONNX, compatible con el motor Piper; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos servidos en ONNX; cuantizaciones adicionales no publicadas) |
| Idiomas soportados | portugués (pt), variante pt-PT segun el nombre del modelo |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Por el nombre y el formato, se trata de una voz Piper: los modelos Piper son sistemas TTS ligeros basados en VITS entrenados para síntesis neuronal de extremo a extremo y exportados a ONNX para inferencia rápida en CPU. Sin embargo, el autor no confirma en la model card ni la arquitectura exacta, ni el número de parámetros, ni la configuración del vocoder.

Respecto al entrenamiento, el único dato disponible es el dataset declarado, `Phoonnx/tuga-tts-train-synthetic-voice4`, cuyo nombre sugiere datos sintéticos generados para construir la voz 4. No se documentan el número de horas de audio, la composición del corpus, el proceso de alineación, ni si se aplicaron técnicas de mejora como fine-tuning o ajuste prosódico. No hay información sobre evaluación subjetiva (MOS) ni objetiva.

## Capacidades

- Síntesis de voz a partir de texto en portugués europeo (pt-PT), con salida de audio.
- Inferencia local en CPU mediante ONNX Runtime o el binario Piper, sin necesidad de GPU.
- Integración con pipelines de text-to-speech de Hugging Face (la etiqueta de pipeline del repo es `text-to-speech`).
- Voz única identificada como "voice4"; no se documenta soporte multi-hablante ni control de emoción.
- No se documentan capacidades de clonación de voz, control de prosodia por SSML, tool calling, agentes ni razonamiento; al ser un modelo TTS, estas capacidades no aplican.
- Cobertura multilingüe limitada al portugués según los metadatos.

## Casos de uso

- Lectura en voz alta de contenido web o documentos: el modelo puede convertir texto en audio en portugués con un coste computacional bajo, adecuado para extensiones de navegador o lectores de artículos que funcionan en local.
- Asistentes por voz embebidos: al ejecutarse en CPU vía ONNX/Piper, puede integrarse en dispositivos con recursos limitados (Raspberry Pi, mini-PC) para dar respuestas habladas en portugués.
- Accesibilidad: generación de audio para personas con discapacidad visual o dificultades de lectura, sintetizando artículos, correos o interfaces de usuario directamente en el cliente.
- Doblaje y locución automatizada de bajo coste: producción de pistas de voz para vídeos cortos, tutoriales o material formativo en pt-PT, con revisión humana posterior.
- Sistemas de atención al cliente telefónica o IVR: síntesis de mensajes y respuestas pregrabadas dinámicamente en portugués, sin depender de servicios TTS en la nube.
- Prototipado de aplicaciones de audio: generación rápida de locuciones de prueba para videojuegos, audiolibros o podcast piloto antes de contratar voces profesionales.
- Integración en pipelines de accesibilidad web: conversión de contenido dinámico a audio en servidores ligeros o directamente en el navegador mediante ONNX Runtime Web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de calidad de voz (MOS, CMOS), inteligibilidad (WER) ni latencia en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB de repositorio, está pensado para inferencia en CPU sin GPU.
- GPU recomendadas: no aplica de forma específica; cualquier GPU compatible con ONNX Runtime puede ejecutarlo, pero no se documentan requisitos.
- GPU consumer: el modelo, por tamaño, cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse solo en CPU.
- Opciones de despliegue: Piper (binario oficial), ONNX Runtime (Python, C++, Web), y pipelines de Hugging Face con backend ONNX. No se documenta compatibilidad con vLLM, llama.cpp, TGI ni Ollama, que no están orientados a TTS.
- Latencia y throughput: no disponibles; no se publican medidas de tiempo real (RTF) ni de velocidad de síntesis.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pipertts_pt-PT_voice4 | no disponible | no aplica | no disponible | no disponible | Hugging Face, ONNX |
| Otras voces Piper pt-PT (p. ej., variantes comunitarias) | no disponible | no aplica | no disponible | habitualmente MIT en el proyecto Piper base | Hugging Face / repositorio Piper |
| Modelos TTS neuronales multilingües de mayor tamaño (p. ej., XTTS, Bark) | no disponible en esta ficha | no aplica | no disponible | varía segun el modelo | Hugging Face |

No se dispone de datos objetivos para establecer una comparación cuantitativa con alternativas. La comparación se limita a la categoría (TTS ligero en ONNX) y a la disponibilidad pública.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de desplegarlo en producción.
- No hay información sobre sesgos de voz (edad, género percibido, acento regional) ni sobre la diversidad del dataset de entrenamiento.
- Al ser un modelo TTS entrenado con datos sintéticos, existe riesgo de artefactos prosódicos, pronunciación incorrecta de nombres propios, siglas y números, y falta de naturalidad en frases largas.
- Cobertura limitada al portugués; no se garantiza calidad en otras lenguas ni en variantes distintas del pt-PT.
- No se documentan mecanismos de normalización de texto (números, fechas, abreviaturas), por lo que puede ser necesario preprocesar la entrada.
- No se publican evaluaciones de robustez frente a texto con ruido, emoticonos, HTML o caracteres especiales.
- El modelo no incorpora salvaguardas éticas documentadas; su uso para suplantación de identidad o generación de audio engañoso queda bajo responsabilidad del integrador.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/pipertts_pt-PT_voice4
- Dataset declarado: https://huggingface.co/datasets/Phoonnx/tuga-tts-train-synthetic-voice4
- Proyecto Piper (motor compatible, referencia externa): https://github.com/rhasspy/piper
- ONNX Runtime: https://onnxruntime.ai/
