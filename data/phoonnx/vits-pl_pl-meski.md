# Phoonnx/vits-pl_pl-meski

## Resumen

vits-pl_pl-meski es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS y empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original fue desarrollado por WitoldG dentro del proyecto polish_piper_models, y Phoonnx se encarga de su redistribución y adaptación al ecosistema phoonnx/OVOS. Está especializado exclusivamente en polaco (pl-PL), con una única voz masculina identificada como "meski" (masculino en polaco).

El modelo resuelve el problema de la conversión de texto a voz en polaco dentro de entornos de asistentes de voz open source, especialmente en el stack OVOS/Mycroft, donde phoonnx actúa como motor TTS. Su tamaño de repositorio es de 0,1 GB, lo que lo hace extremadamente ligero y apto para despliegues en dispositivos con recursos limitados, como Raspberry Pi o sistemas embebidos.

La relevancia actual del modelo radica en su integración con el ecosistema phoonnx, que ofrece una alternativa ligera y basada en ONNX frente a soluciones TTS más pesadas. Al estar empaquetado para phoonnx, se beneficia de la infraestructura de gestión de voces, normalización de texto mediante scriptconv y fonemización con espeak-ng, lo que simplifica su integración en aplicaciones Python y en asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversarial. La arquitectura permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que resulta en un pipeline más compacto y eficiente.

El modelo original fue entrenado por WitoldG dentro del proyecto polish_piper_models, orientado a la generación de voces para Piper. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, que en modelos TTS no son habituales. La innovación técnica destacable es su empaquetado en ONNX para phoonnx, lo que permite inferencia optimizada y portabilidad entre plataformas, además de su integración con el front-end de texto de scriptconv, que normaliza el texto y lo convierte a fonemas espeak (alfabeto IPA) antes de la síntesis.

## Capacidades

- Síntesis de voz (text-to-speech) en polaco (pl-PL) a partir de texto de entrada.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada basada en espeak-ng con alfabeto IPA; requiere espeak-ng instalado o el extra `phoonnx[espeak]` (espyak).
- Integración como plugin TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo exclusivamente TTS.
- Voz única masculina ("meski"); no se documentan capacidades de cambio de voz, emoción ni control de prosodia.

## Casos de uso

- Asistentes de voz en OVOS/Mycroft: el modelo se integra como plugin TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente doméstico en polaco responda con voz sintetizada de forma local y ligera.
- Lectura de textos en polaco en aplicaciones de accesibilidad: se puede usar para convertir artículos, notificaciones o documentos a audio para personas con discapacidad visual, gracias a su bajo peso (0,1 GB) y su API sencilla en Python.
- Sistemas embebidos y dispositivos de bajo consumo: al estar en formato ONNX y ocupar tan solo 0,1 GB, es adecuado para Raspberry Pi u otros dispositivos con recursos limitados donde otros modelos TTS no cabrían.
- Generación de avisos y anuncios automatizados: en entornos como transporte público, comercios o domótica, el modelo puede sintetizar mensajes cortos en polaco de forma local sin depender de servicios en la nube.
- Prototipado rápido de interfaces de voz: desarrolladores que necesiten añadir TTS en polaco a una aplicación Python pueden usar phoonnx y este modelo con unas pocas líneas de código, sin necesidad de entrenar ni ajustar nada.
- Aplicaciones web con TTS en el navegador: mediante phoonnx.js y la demo en tigregotico.pt/demo, se puede integrar síntesis de voz en polaco directamente en el cliente, sin backend, para aplicaciones web accesibles.
- Pruebas de integración en pipelines de asistentes conversacionales: sirve como componente TTS en arquitecturas de agentes de voz donde se necesite una voz polaca ligera y de licencia MIT para pruebas o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, la huella de memoria es muy reducida y cabe en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU, aunque puede ejecutarse en cualquier GPU compatible con ONNX Runtime.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU (Raspberry Pi, sistemas embebidos), dado su tamaño de repositorio de 0,1 GB.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano repo | Licencia | Formato | Contexto |
|---|---|---|---|---|---|---|
| vits-pl_pl-meski (este) | VITS | pl-PL | 0,1 GB | MIT | ONNX | no aplica |
| WitoldG/polish_piper_models (upstream) | VITS | pl-PL | no disponible | no disponible | Piper | no aplica |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | variable | MIT (segun colección) | ONNX | no aplica |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en polaco (pl-PL); no soporta otros idiomas.
- Voz única masculina; no hay variedad de voces ni control de emociones o prosodia.
- La fonemización depende de espeak-ng; si se usa la alternativa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera del dominio de entrenamiento.
- Licencia MIT, lo que permite uso comercial, pero la model card indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del modelo original de WitoldG.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos limitados y una sola voz, puede presentar limitaciones en la naturalidad y cobertura léxica.
- Para producción, es necesario instalar espeak-ng o el extra `phoonnx[espeak]`; sin ello, la síntesis no funciona correctamente.
- No apto para tareas de razonamiento, código, matemáticas, visión ni agentes; es exclusivamente TTS.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-meski
- Modelo upstream: https://huggingface.co/WitoldG/polish_piper_models
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
