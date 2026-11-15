# Phoonnx/vits-en-16speakers

## Resumen

vits-en-16speakers es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por agentvibe dentro del proyecto agentvibes/piper-custom-voices y empaquetado por Phoonnx para su librería de inferencia ONNX llamada phoonnx. El modelo convierte texto en inglés a audio inteligible en formato WAV, aceptando como entrada fonemas espeak en alfabeto IPA en lugar de texto plano directo.

El modelo está pensado para integrarse en entornos de asistencia por voz y sistemas embebidos, especialmente dentro del ecosistema OVOS (Open Voice OS), donde phoonnx proporciona el plugin ovos-tts-plugin-phoonnx. Su tamaño de repositorio es de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para despliegue en CPU y dispositivos de recursos limitados.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y en su formato ONNX, que facilita la ejecución multiplataforma sin depender de frameworks de deep learning pesados. El nombre "16speakers" sugiere que el modelo soporta múltiples voces, aunque la información disponible no detalla cuántas ni cuáles son las identidades vocales concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por alineamiento monotónico, un decodificador generativo basado en normalizing flows y un discriminador adversarial multiperiodo. El modelo genera directamente la forma de onda de audio a partir de la secuencia de fonemas, sin necesidad de un vocoder separado. La entrada de texto se procesa mediante el fonemizador espeak-ng, que convierte el texto en inglés a fonemas IPA antes de alimentar el modelo.

La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o ajuste fino supervisado más allá del entrenamiento adversarial propio de VITS. El modelo procede del repositorio agentvibes/piper-custom-voices, que agrupa voces personalizadas para el ecosistema Piper, y ha sido reempaquetado por Phoonnx para su ejecución mediante ONNX Runtime. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés a partir de texto, generando audio en formato WAV.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que requiere un paso previo de fonemización.
- Soporte de múltiples hablantes (16 speakers según el nombre del modelo, aunque no se detalla la lista de voces).
- Integración con el ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador a través de phoonnx.js (según la documentación del proyecto).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada, etc.).
- Capacidad multilingüe limitada al inglés; no se reportan otros idiomas.

## Casos de uso

- Asistentes de voz domésticos: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz en inglés, aprovechando su licencia Apache 2.0 y su formato ONNX ligero para ejecución en dispositivos de bajos recursos como Raspberry Pi.
- Sistemas de navegación por voz en aplicaciones de escritorio: al ejecutarse sobre ONNX Runtime, puede embeberse en aplicaciones Python que necesiten leer texto en voz alta sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en inglés: su tamaño reducido (0,1 GB) permite incluirlo en contenedores Docker o aplicaciones de escritorio para convertir mensajes de texto en audio de forma local.
- Prototipado rápido de interfaces conversacionales: los desarrolladores pueden usar el modelo para validar flujos de interacción por voz antes de invertir en modelos TTS de mayor calidad, gracias a su instalación sencilla vía pip y su integración con scriptconv.
- Accesibilidad web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido de páginas web en inglés, ofreciendo una alternativa ligera a las APIs de síntesis de voz propietarias.
- Generación de audiolibros o contenido narrado en inglés: aunque la calidad no está documentada con métricas, el soporte de 16 hablantes permite asignar voces distintas a diferentes secciones o personajes en producciones de audio automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM de sistemas sin GPU dedicada, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecutarse mediante ONNX Runtime, que soporta CPU y GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, es plausible que funcione en GPUs de gama baja, pero no hay datos que lo verifiquen.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-en-16speakers | no disponible | no aplica (TTS) | no disponible | Apache 2.0 | Hugging Face, ONNX |
| Piper (voces estándar) | no disponible | no aplica (TTS) | no disponible | MIT (según proyecto Piper) | Hugging Face, ONNX |
| Coqui TTS (VITS) | no disponible | no aplica (TTS) | no disponible | MPL 2.0 (según proyecto Coqui) | GitHub, PyPI |
| ESPnet VITS | no disponible | no aplica (TTS) | no disponible | Apache 2.0 | GitHub |

No se dispone de datos de rendimiento comparativo (MOS, latencia, etc.) para establecer una comparación cuantitativa con estos modelos. La comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas.
- La entrada debe ser fonemas espeak en IPA, no texto plano; esto añade una dependencia externa (espeak-ng) y puede introducir errores de pronunciación si se usa espyak en lugar de espeak-ng.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, puede heredar sesgos de pronunciación o prosodia presentes en el corpus original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producir audio ininteligible o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo upstream (agentvibes/piper-custom-voices) declara la misma licencia; se recomienda verificar los términos del repositorio original.
- No se especifican limitaciones de contexto porque no es un modelo de lenguaje; sin embargo, la longitud máxima de texto por síntesis no está documentada.
- La calidad de la voz y la inteligibilidad no están respaldadas por métricas publicadas (MOS, WER), lo que dificulta evaluar su idoneidad para producción.
- El número de hablantes (16) se deduce del nombre, pero no se proporciona una lista de identificadores de voz ni muestras de audio en la información disponible.

## Enlaces

- [Hugging Face: Phoonnx/vits-en-16speakers](https://huggingface.co/Phoonnx/vits-en-16speakers)
- [Repositorio upstream: agentvibes/piper-custom-voices](https://huggingface.co/agentvibes/piper-custom-voices)
- [Librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [Librería scriptconv](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
