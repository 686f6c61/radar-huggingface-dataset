# Phoonnx/glowtts-nl-rdh-gruut

## Resumen

Glow-TTS neerlandés (`glowtts-nl-rdh-gruut`) es un modelo de síntesis de voz (text-to-speech) para neerlandés, empaquetado en formato ONNX por Phoonnx a partir del modelo original de Rhasspy publicado dentro del proyecto Larynx v1.0. No se trata de un modelo de lenguaje, sino de un sistema TTS de dos etapas: un acoustic model Glow-TTS que genera un espectrograma a partir de fonemas y un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que convierte ese espectrograma en audio.

El modelo está pensado para integrarse en el stack de asistentes de voz de código abierto OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, así como en aplicaciones Python que usen la librería `phoonnx`. Su entrada no es texto plano, sino fonemas en alfabeto IPA generados por el fonemizador `gruut` a través de la librería `scriptconv`, lo que condiciona su uso: no basta con pasar una cadena de texto arbitraria, hay que respetar el front-end fonético.

Es relevante por su carácter práctico: ofrece una voz neerlandesa ligera (repo de 0,1 GB, pesos ONNX) ejecutable en CPU, con integración directa en asistentes domésticos de código abierto. Ahora bien, la licencia no está registrada en la model card y el autor remite a la release original de Larynx, lo que introduce incertidumbre legal para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (acoustic model) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | `other` (sin licencia registrada; consultar upstream Larynx) |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `hifigan-multi-vctk-small` |
| Tamano del repo | 0,1 GB |
| Libreria | `phoonnx` |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis acústica basado en normalizing flows con alineamiento monotónico aprendido (MAS, monotonic alignment search), propuesto originalmente por Kim et al. (2020). En lugar de usar un mecanismo de atención autorregresivo como Tacotron 2, aprende la alineación entre fonemas y frames de espectrograma de forma no autorregresiva, lo que permite paralelizar la generación y reduce la latencia. La salida es un espectrograma mel que posteriormente se convierte en forma de onda mediante el vocoder HiFi-GAN.

Este paquete concreto no incluye información sobre el corpus de entrenamiento, número de tokens, horas de audio ni si hubo ajuste fino adicional. La model card indica únicamente que el modelo proviene de la release `nl_rdh-glow_tts.tar.gz` del proyecto Larynx v1.0 de Rhasspy, un proyecto histórico de voces TTS para asistentes de voz. No se documentan técnicas de RLHF ni DPO, algo esperable en un modelo TTS de esta generación.

## Capacidades

- Síntesis de voz en neerlandés a partir de fonemas gruut en alfabeto IPA.
- Generación de espectrogramas mel mediante el acoustic model Glow-TTS.
- Conversión de espectrograma a audio mediante el vocoder HiFi-GAN multi-VCTK small.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el ecosistema OVOS/Mycroft a través de `ovos-tts-plugin-phoonnx`.
- Uso programático en Python mediante `phoonnx.model_manager.TTSModelManager` y el método `synthesize_wav`.
- Normalización y conversión de texto a fonemas delegada a `scriptconv` (extra `scriptconv[gruut]`).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz doméstico en neerlandés: integrar la voz `larynx/nl-rdh-glow_tts` en OVOS configurando `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx`, de modo que el asistente responda con voz sintética local sin depender de servicios en la nube.
- Síntesis offline en dispositivos de bajos recursos: al distribuirse en ONNX y ejecutarse en CPU, puede desplegarse en Raspberry Pi u otros SBC para lectura de notificaciones o avisos, sin GPU ni conexión a internet.
- Generación de audiolibros o contenido accesible en neerlandés: convertir textos largos a WAV mediante `voice.synthesize_wav`, útil para pipelines de accesibilidad que requieran voz neerlandesa consistente.
- Pruebas de regresión en pipelines de TTS: usar el modelo como referencia estable para validar cambios en el front-end fonético (`scriptconv` + `gruut`) comparando espectrogramas o audio generado.
- Prototipado de interfaces conversacionales en neerlandés: generar respuestas habladas en demos y pruebas de usabilidad antes de invertir en una voz comercial, gracias a su licencia abierta (con las cautelas indicadas más abajo).
- Investigación en TTS: servir como baseline Glow-TTS en neerlandés para comparar con modelos más recientes (VITS, Matcha-TTS, Piper) en métricas de inteligibilidad y naturalidad.
- Localización de contenidos para la región flamenca o los Países Bajos: producir versiones habladas de textos en neerlandés estándar dentro de flujos de publicación automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo TTS ligero empaquetado en ONNX (repo de 0,1 GB), está diseñado para ejecutarse en CPU.
- GPU recomendadas: no se especifican; el uso previsto es CPU mediante ONNX Runtime.
- Cabe en GPU consumer: sí, por tamaño, aunque no es el escenario documentado; cualquier GPU con unos pocos GB de VRAM sería suficiente.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-nl-rdh-gruut` | Glow-TTS + HiFi-GAN | neerlandés | ONNX | `other` (sin registrar) | Paquete para `phoonnx`; front-end gruut |
| Larynx v1.0 (`nl_rdh-glow_tts`) | Glow-TTS + vocoder | neerlandés | tar.gz original | ver upstream Rhasspy | Origen del paquete; mismo modelo acústico |
| Piper (voces neerlandesas) | VITS | neerlandés | ONNX | MIT (mayoritariamente) | Sucesor práctico de Larynx, también orientado a CPU |
| `Phoonnx/hifigan-multi-vctk-small` | Vocoder HiFi-GAN | multilingüe (multi-VCTK) | ONNX | no disponible | Vocoder usado por este modelo, no comparable como TTS completo |

No se dispone de datos de rendimiento comparativo (MOS, intelligibility) en la información proporcionada.

## Limitaciones y advertencias

- Licencia sin registrar: la model card indica explícitamente que no hay licencia registrada y remite a la release original de Larynx; verificar antes de cualquier uso comercial o redistribución.
- Solo neerlandés: no soporta otros idiomas ni cambio de voz; la entrada debe ser fonemas gruut en IPA, no texto libre sin el front-end adecuado.
- Dependencia del front-end: requiere `scriptconv[gruut]` para la fonemización; un texto mal normalizado producirá una pronunciación incorrecta.
- Calidad de voz propia de un modelo Glow-TTS de primera generación (Larynx v1.0): naturalidad inferior a modelos neuronales más recientes como VITS o difusión.
- Riesgo de alucinación acústica: como todo TTS, puede producir artefactos, alargamientos o pronunciaciones erróneas en palabras fuera de vocabulario o nombres propios.
- Sin información sobre sesgos: no se documentan sesgos de género, acento o dialecto en la voz `nl-rdh`.
- Vocoder externo: el paquete descarga `hifigan-multi-vctk-small` por separado; la calidad final depende de ese componente.
- Repo pequeño (0,1 GB) y pocas descargas (49): ecosistema limitado, poca validación comunitaria y soporte escaso.
- No apto para tareas de razonamiento, generación de texto ni agentes: es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-nl-rdh-gruut
- Upstream original (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/nl_rdh-glow_tts.tar.gz
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder `hifigan-multi-vctk-small`: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Proyecto OVOS (Open Voice OS): https://github.com/OpenVoiceOS
