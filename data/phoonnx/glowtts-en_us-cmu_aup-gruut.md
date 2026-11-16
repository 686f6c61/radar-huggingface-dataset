# Phoonnx/glowtts-en_us-cmu_aup-gruut

## Resumen

Glow-TTS en inglés estadounidense (variante `cmu_aup`) empaquetado en formato ONNX para la librería `phoonnx`, una biblioteca de síntesis de voz (TTS) orientada a Python y al ecosistema OVOS. El modelo original es un Glow-TTS de Rhasspy, publicado en la release v1.0 de Larynx, y este repositorio lo redistribuye listo para inferencia con el vocoder `hifigan-multi-vctk-small` como segunda etapa. Resuelve la síntesis de voz offline para asistentes y aplicaciones de escritorio sin depender de servicios en la nube.

Técnicamente es un modelo acústico Glow-TTS que convierte fonemas IPA (generados por `gruut`) en un espectrograma mel, que después se transforma en audio mediante el vocoder HiFi-GAN. El repositorio ocupa 0,1 GB y se distribuye bajo licencia "other" sin términos explícitos, lo que obliga a consultar el release original de Larynx antes de cualquier uso en producción.

Su relevancia es acotada: no es un modelo de nueva generación, sino un artefacto de despliegue para `phoonnx` y OVOS. Resulta útil para quien necesite una voz TTS en inglés estadounidense ligera, ejecutable en CPU y con integración directa en el plugin `ovos-tts-plugin-phoonnx`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow + vocoder HiFi-GAN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase; no hay ventana documentada) |
| Tipos de cuantización | no disponible (pesos ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX (modelo acústico y vocoder `hifigan-multi-vctk-small`) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo basado en normalizing flows que aprende una alineación monotónica entre fonemas y frames de espectrograma mel mediante programación dinámica, sin necesidad de un alineador externo como los usados en Tacotron. La entrada son fonemas IPA producidos por el fonemizador `gruut` (vía `scriptconv`), y la salida es un espectrograma mel que después convierte el vocoder HiFi-GAN en forma de onda.

El modelo original procede de Rhasspy/Larynx v1.0, un proyecto de TTS offline pensado para asistentes de voz. No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento (horas de audio, número de hablantes, composición del dataset), ni de si se aplicaron técnicas de RLHF, DPO o ajuste fino posterior. La variante `cmu_aup` corresponde a una voz concreta del catálogo de Larynx de la que tampoco se documentan aquí características del hablante (género, acento, prosodia).

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto plano.
- Conversión texto a fonemas IPA mediante `gruut` (extra `scriptconv[gruut]`).
- Generación de espectrograma mel y síntesis de audio final con HiFi-GAN `hifigan-multi-vctk-small`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución offline en Python mediante `phoonnx.model_manager.TTSModelManager`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se carga como voz `larynx/en-us-cmu_aup-glow_tts` en el plugin `ovos-tts-plugin-phoonnx` y se configura en `mycroft.conf`, permitiendo respuestas habladas sin conexión a Internet.
- Síntesis offline en aplicaciones de escritorio o Raspberry Pi: al ser un modelo ONNX ligero (repo de 0,1 GB) y ejecutable en CPU, encaja en dispositivos con recursos limitados que no pueden alojar modelos TTS de gran tamaño.
- Generación de avisos y notificaciones por voz: útil en sistemas de domótica o monitoreo que necesitan locutar mensajes cortos en inglés estadounidense con baja latencia y sin coste por petición.
- Accesibilidad: lectura en voz alta de texto en pantalla para usuarios con discapacidad visual en aplicaciones de escritorio, aprovechando la integración con Python y OVOS.
- Pruebas de regresión y CI en pipelines de TTS: al estar empaquetado como ONNX y con API Python estable, se puede usar como voz de referencia en tests automatizados de síntesis.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo con voz real en inglés estadounidense antes de invertir en modelos TTS comerciales o de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo ONNX de 0,1 GB de repositorio, es plausible su ejecución en CPU, pero no se documentan cifras de memoria.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU en la model card.
- ¿Cabe en GPU de consumo? No se documenta, aunque por tamaño del artefacto es previsible que sí; no se confirma.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables a este modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_aup-gruut | Glow-TTS + HiFi-GAN | en-US | other (sin licencia registrada) | ONNX | Hugging Face, 21 descargas |
| Rhasspy Larynx v1.0 (upstream) | Glow-TTS + HiFi-GAN | en-US (entre otros) | según release de Larynx | tar.gz con pesos originales | GitHub releases de Rhasspy |
| Otras voces Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | según voz | other | ONNX | Colección `Phoonnx/glow-tts` en Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas como Piper, Coqui TTS o VITS en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" sin términos registrados: la model card indica explícitamente que se consulte el release upstream de Larynx antes de usarlo, lo que impide asumir uso comercial libre.
- Solo inglés estadounidense; no hay soporte multilingüe documentado.
- Modelo TTS puro: no razona, no sigue instrucciones ni soporta tool calling; cualquier expectativa en ese sentido es un error de uso.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta de palabras fuera del vocabulario cubierto por `gruut`; no se documentan métricas de calidad (MOS, WER).
- Sin datos de entrenamiento publicados: no se puede evaluar sesgo de hablante, cobertura fonética ni dominio del corpus.
- Repositorio con muy poca tracción (21 descargas, 0 likes) y actualizado en 2026: no hay garantía de mantenimiento ni de soporte.
- Dependencia de la cadena `phoonnx` + `scriptconv[gruut]` + vocoder externo: cualquier cambio en esas librerías puede romper la inferencia.
- No se documentan límites de longitud de entrada; la síntesis se hace por frase, por lo que textos largos requieren segmentación manual.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_aup-gruut
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_aup-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
