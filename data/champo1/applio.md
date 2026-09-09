# Champo1/Applio

## Resumen

Applio es una suite de código abierto para conversión de voz (voice conversion) desarrollada por la comunidad IAHispano, publicada en HuggingFace por el usuario Champo1. Resuelve el problema de transformar la voz de un audio de entrada a otra voz objetivo, facilitando tareas como covers musicales, doblaje o entrenamiento de modelos de voz personalizados. Se basa en el modelo `lj1995/VoiceConversionWebUI`, que combina una arquitectura VITS con un componente de recuperación (retrieval-based voice conversion, RVC), y ha sido entrenado sobre el dataset CSTR-Edinburgh/vctk. El repositorio tiene un tamaño total de 95.4 GB e incluye múltiples artefactos, entre ellos pesos preentrenados y archivos compilados. No es un modelo de lenguaje: no genera texto ni admite razonamiento simbólico, sino que opera exclusivamente en el dominio del audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS / RVC (Retrieval-based Voice Conversion) sobre `lj1995/VoiceConversionWebUI` |
| Parametros totales | No disponible (el repositorio contiene varios artefactos; 95.4 GB en total) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset de entrenamiento VCTK es en inglés, pero no se especifica cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (indicado en los tags); los pesos base de RVC no se especifican |

## Arquitectura y entrenamiento

Applio se apoya en la arquitectura del modelo `lj1995/VoiceConversionWebUI`, que emplea VITS como backbone de síntesis y un sistema de recuperación de características para realizar la conversión de voz. El entrenamiento se realizó sobre el dataset CSTR-Edinburgh/vctk, un corpus de voces en inglés. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni la aplicación de técnicas como RLHF o DPO, ya que no son aplicables a un modelo de este tipo. La suite añade una interfaz Gradio, scripts de instalación y soporte para plugins y configuraciones personalizadas, pero la model card no detalla innovaciones técnicas específicas más allá del uso de ONNX para inferencia.

## Capacidades

- Conversión voz a voz (audio-audio): transforma el timbre de una voz de entrada hacia una voz objetivo.
- Entrenamiento o fine-tuning de modelos personalizados de conversión de voz sobre el dataset VCTK.
- Inferencia con ONNX, lo que facilita la integración en distintos runtimes y entornos.
- Interfaz de usuario mediante Gradio, con soporte para plugins, compilados y un playground en línea.
- Despliegue en local (Windows, Linux, macOS) y en la nube mediante Google Colab.
- No es un modelo de lenguaje: no genera texto, no admite tool calling, ni razonamiento multi-paso, ni comprensión de lenguaje natural.

## Casos de uso

- Covers musicales con IA: se sube una canción al playground o a la interfaz local y se convierte la voz original al timbre de un artista objetivo, facilitando la producción de versiones.
- Doblaje de vídeos: se procesa el audio de una narración o diálogo para cambiar la voz del personaje o del locutor, manteniendo la duración y la prosodia.
- Creación de audiolibros: se entrena un modelo con una voz sintética personalizada y se aplica a textos narrados, obteniendo una locución uniforme.
- Investigación en conversión de voz: se utiliza el dataset VCTK para reproducir experimentos de RVC y comparar arquitecturas, gracias al soporte de fine-tuning.
- Entretenimiento en tiempos reales: el playground de Applio permite probar conversión de voz de forma interactiva en el navegador.
- Integración en asistentes de voz: el modelo puede incorporarse a aplicaciones de audio para adaptar el timbre de respuestas generadas por un sistema TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (el repositorio ocupa 95.4 GB, pero no se detalla el consumo de VRAM ni el número de parámetros).
- GPU recomendadas: no disponible. El despliegue se realiza principalmente mediante scripts locales o Google Colab, por lo que la GPU necesaria depende del modelo de voz concreto.
- Despliegue en local mediante `run-applio.bat` en Windows y `run-applio.sh` en Linux/macOS.
- Interfaz Gradio disponible en el navegador; también se ofrecen Colab con interfaz gráfica y sin interfaz.
- No aplican motores como vLLM, llama.cpp o TGI, al tratarse de un modelo de audio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas numéricas en la información proporcionada. El modelo base sobre el que se construye Applio es `lj1995/VoiceConversionWebUI`, pero no se han publicado resultados comparables con otras alternativas de conversión de voz como so-vits-svc. Por tanto, la comparativa se limita a indicar que Applio es una distribución y mejora de la herramienta original, manteniendo la misma licencia MIT.

## Limitaciones y advertencias

- No es un modelo de lenguaje: su funcionamiento se limita a la conversión de voz; no puede generar texto ni realizar razonamiento.
- Riesgo de uso indebido: permite crear voces sintéticas que podrían utilizarse para deepfakes vocales o suplantación de identidad.
- El dataset de entrenamiento principal es VCTK, en inglés; no se especifica el soporte de otros idiomas, lo que puede limitar su rendimiento fuera de ese dominio.
- No se han publicado benchmarks ni métricas de calidad de voz, por lo que no es posible validar su rendimiento de forma objetiva.
- La licencia MIT permite el uso comercial, pero el autor solicita contactar con él y respetar los derechos de autor y la privacidad de las voces utilizadas.
- El repositorio tiene un tamaño de 95.4 GB, lo que dificulta su descarga en entornos con poco ancho de banda o almacenamiento limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Champo1/Applio
- Sitio web: https://applio.org
- Documentacion: https://docs.applio.org
- Discord: https://discord.gg/urxFjYmYYh
- Plugins: https://github.com/IAHispano/Applio-Plugins
- Compilados: https://huggingface.co/IAHispano/Applio/tree/main/Compiled
- Playground: https://applio.org/playground
- Google Colab (UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio.ipynb
- Google Colab (sin UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio_NoUI.ipynb
- Repositorio GitHub: https://github.com/IAHispano/Applio
