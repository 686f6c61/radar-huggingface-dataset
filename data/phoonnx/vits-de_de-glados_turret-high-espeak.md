# Phoonnx/vits-de_de-glados_turret-high-espeak

## Resumen

vits-de_de-glados_turret-high-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería de TTS homónima. El modelo original procede del proyecto piper-de-glados de systemofapwne, una colección de voces Piper para alemán que reproduce el timbre de GLaDOS, la inteligencia artificial antagonista de la saga Portal de Valve. La variante "turret" hace referencia a las torretas centinela del mismo universo, y "high" indica la calidad de muestreo más alta dentro de esa familia de voces.

El modelo resuelve un caso de uso muy específico: generar voz sintética en alemán (de-DE) con una identidad sonora reconocible, pensada para asistentes domésticos, proyectos de hobby, videojuegos o instalaciones interactivas. No es un modelo de propósito general ni compite en naturalidad con los grandes sistemas TTS comerciales; su valor está en el empaquetado ligero (0,1 GB), la licencia MIT y la integración directa con el ecosistema OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.

La relevancia actual es acotada pero clara: demuestra el flujo de conversión de voces Piper a ONNX ejecutable en Python y en navegador, con una huella de repo mínima y sin dependencias de infraestructura pesada. Está pensado para entornos donde se prioriza la ligereza y la integración con asistentes de voz open source sobre la fidelidad acústica absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura que combina un codificador de texto, un prior normalizing flow, un decodificador generativo y un discriminador adversarial, junto con alineamiento monotónico aprendido (MAS). En el caso de Piper, se trata de una reimplementación optimizada para inferencia rápida y ligera que conserva el esquema VITS pero con un front-end fonémico basado en espeak-ng.

El modelo original fue entrenado por systemofapwne dentro del proyecto piper-de-glados, que produce voces Piper para alemán con identidades sonoras de personajes de Portal. Phoonnx se limita a empaquetar los pesos en ONNX y a publicarlos bajo su colección VITS. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicional; la model card no los detalla. La innovación destacable, en todo caso, es el propio pipeline de empaquetado: conversión a ONNX, integración con scriptconv para normalización y fonemización, y ejecución tanto en Python como en navegador vía phoonnx.js.

## Capacidades

- Síntesis de voz a partir de texto en alemán (de-DE), con salida en formato WAV.
- Entrada fonémica basada en espeak-ng (alfabeto IPA); el texto se normaliza y fonemiza mediante scriptconv.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución en Python (librería phoonnx) y en navegador (phoonnx.js, con demo en tigregotico.pt/demo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del alemán.
- No dispone de modo "thinking" ni de control de estilo o emoción más allá del propio timbre del personaje.

## Casos de uso

- Asistentes domésticos con OVOS/Mycroft: el modelo se integra como plugin TTS y permite que un asistente en alemán responda con una voz característica, sin necesidad de servicios en la nube y con un repo de solo 0,1 GB.
- Proyectos de hobby y fan games de Portal: sirve para dotar a NPCs o torretas de voz sintética en alemán con la identidad sonora de GLaDOS, usando la licencia MIT para distribución en mods y demos.
- Instalaciones interactivas y arte generativo: el bajo peso y la inferencia ONNX permiten desplegar la voz en dispositivos embebidos o en el navegador, sin GPU dedicada.
- Prototipado rápido de interfaces de voz en alemán: útil para validar flujos de conversación antes de invertir en un TTS comercial, gracias a la instalación simple vía pip y espeak-ng.
- Accesibilidad y lectura de textos en alemán: puede emplearse para leer contenido en voz alta en aplicaciones de escritorio o web donde se requiera una voz ligera y autoalojada.
- Demos educativas de TTS: el par phoonnx + scriptconv ejemplifica el pipeline completo (normalización, fonemización con espeak, inferencia VITS) y sirve para enseñar cómo funciona un sistema TTS end-to-end.
- Automatización de contenido en alemán: generación por lotes de locuciones para vídeos, podcasts o avisos, siempre que el timbre de personaje sea aceptable para el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,1 GB) y la naturaleza de VITS/Piper, se espera ejecución en CPU sin GPU dedicada.
- GPU recomendadas: no aplica; el modelo está pensado para inferencia en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaría sin problema, pero no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU consumer, e incluso en CPU y en navegador.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS/Mycroft), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-glados_turret-high-espeak | VITS (Piper) | de-DE | no aplica | MIT | ONNX | Hugging Face, 24 descargas |
| Otras voces piper-de-glados (systemofapwne) | VITS (Piper) | de-DE | no aplica | según upstream | Piper/ONNX | Hugging Face |
| Voces VITS de la colección Phoonnx | VITS | varios | no aplica | MIT (mayoría) | ONNX | Hugging Face |
| Piper TTS estándar (rhasspy/piper) | VITS | múltiples | no aplica | MIT | ONNX | Hugging Face, GitHub |

La comparación se limita a alternativas del mismo ecosistema (Piper/VITS empaquetadas para ONNX), ya que no hay datos de benchmarks que permitan comparar rendimiento acústico con sistemas como XTTS, Bark o modelos comerciales. La ventaja diferencial de este modelo es la identidad sonora de personaje y la licencia MIT; su desventaja es el alcance restringido a un solo idioma y un solo timbre.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz sintética de personaje, el timbre es deliberadamente artificial y no representa una voz humana neutra.
- Riesgo de alucinación: no aplica en el sentido textual, pero la fonemización con espeak-ng puede producir pronunciaciones incorrectas en palabras ambiguas o extranjerismos.
- Limitaciones de idioma: solo alemán (de-DE); no soporta otros idiomas ni code-switching.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunas palabras pueden pronunciarse mal, según advierte la propia model card.
- Restricciones de licencia: MIT permite uso comercial, pero la model card remite a los términos del release upstream (systemofapwne/piper-de-glados), que conviene verificar antes de un despliegue comercial.
- Caveat para producción: el modelo está empaquetado para phoonnx y OVOS; no hay garantías de soporte para otros runtimes TTS sin conversión adicional.
- El número de descargas (24) y la ausencia de likes sugieren poca validación comunitaria; conviene evaluar la calidad acústica en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-high-espeak
- Upstream (systemofapwne/piper-de-glados): https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/high
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
