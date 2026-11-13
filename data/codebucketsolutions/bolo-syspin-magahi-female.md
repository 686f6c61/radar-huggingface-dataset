# codebucketsolutions/bolo-syspin-magahi-female

## Resumen

`bolo-syspin-magahi-female` es un modelo de síntesis de voz (text-to-speech) en formato ONNX para el idioma magahi, una lengua indoaria hablada principalmente en el estado de Bihar (India). Lo publica el usuario `codebucketsolutions` como parte del proyecto bolo, un servidor de voz que funciona sin PyTorch sobre el runtime sherpa-onnx. No se trata de un modelo entrenado desde cero: es una conversión de formato del checkpoint Coqui VITS `SYSPIN/vits_Magahi_Female`, desarrollado por el proyecto SYSPIN del SPIRE Lab del Indian Institute of Science (IISc) de Bengaluru.

El modelo resuelve un problema concreto: ofrecer una voz femenina en magahi que pueda desplegarse en entornos ligeros sin dependencias de PyTorch, algo relevante para aplicaciones de accesibilidad, lectura de contenidos o asistentes de voz en lenguas de bajos recursos. Su relevancia actual radica en la escasez de modelos TTS para lenguas indoarias minoritarias y en la practicidad del formato ONNX para inferencia en CPU.

Arquitectónicamente es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variational autoencoder con decoder HiFi-GAN y alineamiento monotónico, exportado a ONNX. El repositorio ocupa 0,1 GB, lo que sitúa el modelo en el rango de decenas de millones de parámetros, típico de los checkpoints VITS de Coqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS, entrada de texto variable) |
| Tipos de cuantizacion | no disponible (pesos ONNX en el repositorio) |
| Idiomas soportados | magahi (código `mag`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es un VITS de Coqui TTS, una arquitectura end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial durante el entrenamiento. VITS emplea alineamiento monotónico con búsqueda por programación dinámica, lo que permite generar audio de forma directa desde texto sin un modelo acústico separado ni vocoder externo. La conversión a ONNX la realiza la herramienta `tools/voices/export_syspin.py` del proyecto bolo, y según la model card los pesos no se han reentrenado ni modificado.

Los datos de entrenamiento proceden del corpus SYSPIN text-to-speech del IISc, publicado bajo licencia CC-BY-4.0. No se especifican en la información disponible el número de horas de audio, el número de tokens de entrenamiento ni la composición detallada del dataset. Tampoco se documenta si hubo etapas de RLHF o DPO (habituales en TTS no aplican del mismo modo, pero no se confirma). No se han publicado innovaciones técnicas adicionales más allá de la propia arquitectura VITS y la conversión de formato.

## Capacidades

- Síntesis de voz (text-to-speech) en magahi con voz femenina.
- Generación de audio end-to-end desde texto sin vocoder separado.
- Inferencia sin PyTorch mediante sherpa-onnx.
- Integración con el servidor de voz bolo mediante `bolo pull syspin-mag-female`.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe más allá del magahi.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura de contenidos en magahi: el modelo puede convertir artículos, noticias o textos educativos en audio para hablantes de magahi, cubriendo una lengua con pocos recursos TTS disponibles.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de lectura que necesiten una voz femenina en magahi sin depender de servicios en la nube.
- Asistentes de voz locales: al ejecutarse sobre sherpa-onnx sin PyTorch, puede desplegarse en dispositivos de bajos recursos o entornos embebidos para respuestas habladas en magahi.
- Preservación lingüística: generación de material audio para documentación y enseñanza del magahi, aprovechando el corpus SYSPIN como base.
- Interfaces conversacionales de bajo coste: al ser un modelo ONNX ligero (0,1 GB), puede integrarse en servidores modestos para dar respuestas habladas en aplicaciones de atención ciudadana en Bihar.
- Prototipado de aplicaciones de voz: desarrolladores que quieran experimentar con TTS en lenguas indoarias minoritarias pueden desplegarlo rápidamente con el comando `bolo pull` y el runtime sherpa-onnx.
- Dooblaje o locución automatizada: generación de pistas de voz para vídeos o materiales formativos en magahi con una voz femenina consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB) es probable que la inferencia quepa en CPU sin GPU dedicada, aunque no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX y el runtime sherpa-onnx sugieren que puede ejecutarse en CPU y en GPUs modestas.
- Opciones de despliegue: sherpa-onnx (runtime principal), servidor bolo (`bolo pull syspin-mag-female`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el modelo original `SYSPIN/vits_Magahi_Female` del IISc es la fuente directa de estos pesos; esta versión solo difiere en el formato (ONNX frente al checkpoint Coqui original). No se dispone de datos de rendimiento para comparar con otras voces TTS en magahi.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo reentrenado: hereda cualquier limitación del checkpoint original `SYSPIN/vits_Magahi_Female`.
- Solo soporta magahi (`mag`); no se documenta cobertura de otras lenguas.
- No se dispone de información sobre sesgos de género, dialecto o prosodia más allá de que la voz es femenina.
- Riesgo de alucinación no aplica del mismo modo que en modelos de texto, pero puede producir pronunciaciones incorrectas en palabras fuera del dominio del corpus SYSPIN.
- La licencia de los pesos es MIT, lo que permite uso comercial; sin embargo, los datos de entrenamiento están bajo CC-BY-4.0 y se debe mantener la atribución correspondiente.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria documentada.
- La fecha de creación indicada (2026-11-13) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.
- No se documentan requisitos de latencia ni límites de longitud de texto de entrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-magahi-female
- Modelo original: https://huggingface.co/SYSPIN/vits_Magahi_Female
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (runtime): no se proporciona enlace directo en la información disponible.
