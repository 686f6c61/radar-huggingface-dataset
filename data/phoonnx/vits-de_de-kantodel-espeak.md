# Phoonnx/vits-de_de-kantodel-espeak

## Resumen

vits-de_de-kantodel-espeak es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original nullnullvier/kantodel. Está desarrollado sobre la arquitectura VITS, un sistema de TTS neuronal de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador generativo basado en flujos normalizadores y un vocoder HiFi-GAN integrado. El modelo está especializado en alemán (de-DE) y acepta como entrada fonemas espeak en alfabeto IPA.

El paquete resuelve un problema de despliegue: convierte un modelo VITS original en un artefacto ONNX listo para producción dentro del ecosistema phoonnx, una librería de TTS en Python y OVOS. Esto permite ejecutar síntesis de voz en CPU sin depender de frameworks de deep learning pesados, algo relevante para asistentes de voz embebidos, sistemas domésticos y aplicaciones de accesibilidad.

El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para hardware modesto. Su licencia MIT facilita el uso comercial, aunque las condiciones del modelo original deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech neuronal de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de ejecucion | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional variacional de extremo a extremo que integra en un único modelo el codificador de texto, el predictor de duración estocástico, el decodificador basado en flujos normalizadores y un vocoder del tipo HiFi-GAN. Esta integración permite generar audio directamente desde fonemas sin etapas intermedias separadas de alineamiento o vocoder. El modelo acepta fonemas espeak en alfabeto IPA como entrada, lo que requiere el uso de espeak-ng o de la implementación espyak incluida en phoonnx.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original fue desarrollado por nullnullvier y posteriormente empaquetado por Phoonnx en formato ONNX para su ejecución con la librería phoonnx. La cadena de procesamiento de texto delega en la librería scriptconv, que normaliza el texto y lo convierte a fonemas mediante EspeakPhonemizer.

## Capacidades

- Síntesis de voz en alemán (de-DE) a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fonético preciso.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en el navegador a través de phoonnx.js con entrada espeak o unicode.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de modo de razonamiento, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Asistentes de voz domésticos: el modelo se integra en OVOS mediante el plugin de phoonnx y permite sintetizar respuestas en alemán en dispositivos de baja potencia, al ejecutarse en ONNX sobre CPU.
- Lectura de textos para accesibilidad: aplicaciones de screen reader en alemán pueden convertir texto a voz con una latencia baja gracias al reducido tamaño del modelo (0,1 GB) y a la ausencia de dependencias pesadas.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse del lado del cliente para generar audio sin enviar texto a un servidor, útil en aplicaciones web con requisitos de privacidad.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados o dinámicos en alemán para transporte público, comercios o aeropuertos, donde se requiere un modelo ligero y desplegable en hardware embebido.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS en alemán para pruebas de concepto pueden desplegarlo con `pip install --pre phoonnx` y unas pocas líneas de código.
- Integración en pipelines de CI/CD para pruebas de audio: el modelo permite generar muestras de voz de referencia en pruebas automatizadas de sistemas de diálogo en alemán, con una huella de disco mínima.
- Educación y aprendizaje de idiomas: generación de pronunciaciones en alemán a partir de fonemas IPA para herramientas de práctica fonética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX sobre CPU, no requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo está diseñado para ejecución en CPU.
- Compatibilidad con GPU de consumo: no relevante para el caso de uso principal; puede ejecutarse en cualquier CPU moderna.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en el navegador.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]` para la fonemización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano | Contexto |
|---|---|---|---|---|---|---|
| vits-de_de-kantodel-espeak | VITS | de-DE | ONNX | MIT | ~0,1 GB | no aplica |
| Piper (voces comunitarias) | VITS | multiidioma | ONNX | MIT/GPL segun voz | variable | no aplica |
| Coqui TTS (VITS) | VITS | multiidioma | PyTorch | MPL 2.0 | variable | no aplica |
| XTTS v2 (Coqui) | GPT + VITS | multilingue | PyTorch | CPML (no comercial) | ~1,8 GB | limitado |

La comparativa se basa en características generales de la categoría; no se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza alemán (de-DE); no soporta otros idiomas.
- La calidad de pronunciación depende de la fonemización espeak; con espyak pueden producirse errores en algunas palabras respecto a espeak-ng.
- No se han publicado métricas objetivas de calidad (MOS, WER) ni benchmarks en la información disponible.
- Al ser un modelo TTS, no genera texto ni razona; no debe evaluarse como un modelo de lenguaje.
- El modelo original es de nullnullvier; la licencia MIT se declara en la model card del upstream, pero conviene verificar las condiciones del repositorio original antes de un uso comercial a gran escala.
- Riesgo de alucinación no aplica en el sentido habitual, pero pueden producirse artefactos acústicos o pronunciaciones incorrectas en textos con números, siglas o palabras extranjeras.
- El repositorio tiene muy pocas descargas (18) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-14) es posterior a la fecha actual en muchos entornos, lo que puede indicar un problema de metadatos o una publicación programada; conviene verificar la disponibilidad real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-kantodel-espeak
- Modelo original: https://huggingface.co/nullnullvier/kantodel
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
