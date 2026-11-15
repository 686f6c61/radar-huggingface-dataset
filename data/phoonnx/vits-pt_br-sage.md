# Phoonnx/vits-pt_br-sage

## Resumen

vits-pt_br-sage es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario srxz bajo el identificador `srxz/sage-voice-pt-br` y reempaquetado por Phoonnx para su librería ONNX de TTS, phoonnx. El modelo convierte texto en portugués de Brasil a audio inteligible a partir de fonemas generados por espeak-ng en alfabeto IPA, lo que lo hace adecuado para integrarse en asistentes de voz y sistemas de lectura en tiempo real.

La relevancia de este modelo radica en su formato: al distribuirse como pesos ONNX empaquetados para phoonnx, puede ejecutarse en Python y en el navegador (a través de phoonnx.js), además de integrarse como plugin en el ecosistema OVOS (Open Voice OS). Su tamaño de repositorio de 0,1 GB y su licencia MIT lo convierten en una opción ligera y permisiva para despliegues de TTS en portugués brasileño.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento más allá de la arquitectura VITS y el origen del modelo. La ficha se limita, por tanto, a los datos verificables publicados por el autor y el empaquetador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto variable) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción, adversariales y de alineamiento monotónico (MAS). El modelo genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el despliegue.

En este caso, el modelo original es `srxz/sage-voice-pt-br`, entrenado por srxz para portugués de Brasil. No se dispone de información sobre el número de horas de audio, la composición del dataset, el número de pasos de entrenamiento ni si se aplicaron técnicas de ajuste fino adicionales. La entrada de texto se procesa mediante espeak-ng (fonemas en IPA) a través de la librería scriptconv, que normaliza el texto antes de la fonemización. El empaquetado de Phoonnx añade la conversión a ONNX y la integración con su gestor de modelos.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil (pt-BR).
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas IPA generados por espeak-ng, con soporte para el port espyak cuando espeak-ng no está disponible.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta visión, audio de entrada ni modo thinking.
- Multilingüismo limitado al portugués de Brasil.

## Casos de uso

- Asistentes de voz en portugués de Brasil: el modelo puede integrarse en OVOS como plugin TTS para dotar de voz a asistentes domésticos, con selección de voz mediante configuración en `mycroft.conf`.
- Lectura de contenido web o documentos: al aceptar texto variable y generar WAV, puede usarse en pipelines de accesibilidad para convertir artículos o notificaciones en audio.
- Sistemas de navegación o anuncios por voz: su tamaño reducido (0,1 GB) permite desplegarlo en dispositivos de borde para mensajes cortos en tiempo real.
- Aplicaciones web interactivas: mediante phoonnx.js, puede ejecutarse en el navegador para dar voz a interfaces sin depender de servicios en la nube.
- Generación de audiolibros o pódcasts automatizados: la licencia MIT permite uso comercial en la síntesis por lotes de texto largo, aunque la calidad y naturalidad no están documentadas.
- Prototipado de investigación en TTS: al ser un modelo VITS empaquetado en ONNX con licencia permisiva, sirve como base para experimentos de fonemización o comparación de voces en portugués.
- Integración en sistemas de atención al cliente por voz: puede generar respuestas habladas en portugués brasileño dentro de flujos IVR, siempre que se valide la inteligibilidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es probable que quepa en GPU consumer con pocos GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Por el tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no está confirmado.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-pt_br-sage (este) | VITS | pt-BR | MIT | ONNX | texto/fonemas IPA |
| srxz/sage-voice-pt-br | VITS | pt-BR | no disponible en la información | no disponible | texto/fonemas IPA |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | MIT (según colección) | ONNX | texto/fonemas IPA |
| Modelos TTS comerciales en portugués | no disponible | pt-BR | propietaria | API | texto |

La comparación con alternativas de la misma categoría es limitada porque la información proporcionada solo detalla el modelo upstream y la colección VITS de Phoonnx. No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo solo soporta portugués de Brasil; no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y pueden producir palabras mal pronunciadas, según advierte el autor.
- No se han publicado métricas de calidad (MOS, inteligibilidad, naturalidad), por lo que el rendimiento real en producción es desconocido.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas o artefactos de audio en palabras fuera del dominio de entrenamiento.
- No se dispone de información sobre sesgos de voz (género, acento, edad) ni sobre la composición del dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor del empaquetado remite a los términos del release upstream; conviene verificar la licencia del modelo original `srxz/sage-voice-pt-br`.
- El modelo tiene 31 descargas y 0 likes en Hugging Face, lo que sugiere poca validación por parte de la comunidad.
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-sage
- Modelo upstream: https://huggingface.co/srxz/sage-voice-pt-br
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
