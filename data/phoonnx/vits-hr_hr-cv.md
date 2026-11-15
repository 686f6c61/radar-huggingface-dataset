# Phoonnx/vits-hr_hr-cv

## Resumen

vits-hr_hr-cv es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está entrenado específicamente para croata (hr-HR) y se distribuye como un conversor de texto a audio ligero, con un tamaño de repositorio de 0,1 GB, pensado para integración en asistentes de voz y sistemas de lectura en tiempo real.

La relevancia de este modelo radica en su formato ONNX, que facilita el despliegue en entornos sin dependencias pesadas de PyTorch, y en su integración con el ecosistema OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx`. Está orientado a desarrolladores que necesitan una voz croata funcional en producción con requisitos de hardware modestos, no a investigación en síntesis de voz de vanguardia.

El modelo procede de los modelos preentrenados de Coqui TTS v0.8.0 y utiliza el dataset Common Voice para croata. No se trata de un modelo generativo de propósito general, sino de un sintetizador acústico con front-end de grafemas, limitado al idioma croata y sin capacidades de razonamiento, código o visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | croata (hr-HR) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) mediante `GraphemePhonemizer` de scriptconv |
| Autor original | Coqui |
| Empaquetado | Phoonnx |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El modelo genera directamente la forma de onda a partir del texto sin necesidad de un vocoder externo, lo que simplifica el despliegue. En este caso, el modelo se distribuye como pesos ONNX para inferencia con phoonnx, que actúa como runtime y capa de gestión de voces.

El entrenamiento original fue realizado por Coqui y publicado en su release v0.8.0 de modelos TTS. El dataset utilizado es Common Voice para croata, según la propia model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El front-end textual normaliza y convierte el texto a grafemas mediante `scriptconv`, sin un paso de fonemización fonética compleja documentado.

## Capacidades

- Síntesis de voz a partir de texto en croata (hr-HR), generando audio WAV.
- Conversión de grafemas a audio mediante el fonemizador `GraphemePhonemizer` de scriptconv.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python a través de `TTSModelManager` y la interfaz `voice.synthesize_wav`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del croata.
- No dispone de modo thinking, visión ni audio de entrada.
- No es un modelo de generación de texto, código ni matemáticas.

## Casos de uso

- Asistentes de voz en croata para OVOS: el modelo se integra directamente mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en croata en asistentes domésticos sin necesidad de infraestructura adicional.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en dispositivos con recursos limitados para convertir mensajes de texto en audio en croata.
- Accesibilidad para personas con discapacidad visual: lectura de contenido textual en croata en aplicaciones de escritorio o web, con una latencia baja gracias a la inferencia ONNX.
- Generación de avisos pregrabados dinámicos: creación de mensajes de voz personalizados en croata para sistemas de megafonía o atención telefónica automatizada.
- Prototipado de interfaces conversacionales: desarrollo rápido de demos de voz en croata sin necesidad de entrenar un modelo propio, usando los pesos preentrenados de Coqui.
- Integración en pipelines de CI/CD para pruebas de audio: validación automatizada de que el texto se convierte en audio inteligible en croata dentro de flujos de integración continua.
- Sistemas de navegación o información en vehículos: síntesis de indicaciones breves en croata con requisitos de hardware mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB), la huella de memoria es muy reducida y cabe holgadamente en GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La colección VITS de Phoonnx incluye otras voces empaquetadas, pero no se aportan datos de rendimiento comparativo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vits-hr_hr-cv | no disponible | no aplica | BSD-3-Clause | Hugging Face (Phoonnx) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta croata (hr-HR); no es multilingüe.
- No se documentan sesgos específicos, pero al entrenarse con Common Voice puede heredar sesgos de acento, género o calidad de grabación del dataset.
- Riesgo de alucinación en TTS: puede generar pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en texto no normalizado.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar las condiciones del dataset Common Voice subyacente.
- El front-end basado en grafemas puede producir una calidad de pronunciación inferior a modelos con fonemización completa.
- No hay información sobre cuantizaciones ni optimizaciones de latencia; el rendimiento en producción debe validarse empíricamente.
- El modelo tiene muy pocas descargas (24) y ningún like, lo que sugiere una adopción limitada y poca validación comunitaria.
- No es adecuado para tareas de generación de texto, razonamiento, código o visión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-hr_hr-cv)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Modelo original de Coqui TTS v0.8.0](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--hr--cv--vits.zip)
