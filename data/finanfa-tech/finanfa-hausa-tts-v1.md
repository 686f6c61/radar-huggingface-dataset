# finanfa-tech/finanfa-hausa-tts-v1

## Resumen

Finanfa Hausa TTS v1 es un modelo de síntesis de voz (text-to-speech) especializado en el idioma hausa (`ha`), hablado por decenas de millones de personas en Nigeria, Níger, Benín y la región del Sahel. Lo publica Finanfa Tech, un proyecto centrado en tecnologías del habla para lenguas de África Occidental, a partir del trabajo de alineación original de Samuel Olubukun sobre su modelo `murivo-tts-21m-hausa`.

Técnicamente se trata de un Diffusion Transformer (DiT) de aproximadamente 20,9 millones de parámetros entrenado con flow-matching, acoplado a un vocoder causal VoxCPM2 AudioVAE que sintetiza audio nativo a 48 kHz. La versión pública está cuantizada en int8 y ocupa 21 MB, lo que la hace ejecutable en CPU y dispositivos ligeros con pasos de muestreo reducidos (15 por defecto según el ejemplo de la model card).

Su relevancia radica en dos factores: la escasez de sistemas TTS de calidad para lenguas africanas de bajos recursos y el cuidado explícito por la ortografía Boko, incluyendo consonantes glotalizadas e implosivas (`ɓ`, `ɗ`, `ƙ`) y paradas glotales (`'y`), que son fonemas críticos en hausa y que los sistemas multilingües genéricos suelen degradar. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) + vocoder causal VoxCPM2 AudioVAE |
| Parametros totales | ~20,9 M (cuantizado int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (version publica); no se documentan otros formatos |
| Idiomas soportados | hausa (`ha`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB en el momento de la consulta; la model card menciona inferencia via `infer.py`) |
| Frecuencia de muestreo | 48 000 Hz nativos |
| Tamano del artefacto | 21 MB |
| Pasos de muestreo por defecto | 15 (parametro `steps`) |
| Guidance por defecto | 1.8 (parametro `guidance`) |
| Dispositivos soportados | CPU y CUDA |

## Arquitectura y entrenamiento

El modelo sigue un esquema de generacion en dos etapas. La primera es un Diffusion Transformer de ~20,9 M de parametros entrenado con flow-matching, que transforma la secuencia de texto en una representacion acustica latente. La segunda es el vocoder causal VoxCPM2 AudioVAE del equipo OpenBMB, que decodifica esa representacion a forma de onda a 48 kHz. El caracter causal del vocoder sugiere viabilidad para sintesis por streaming, aunque la model card no lo confirma explicitamente.

La arquitectura acustica base se atribuye a Anurag Kanade (`edwixx/rapido-tts`), y el trabajo de alineacion y adaptacion al hausa a Samuel Olubukun. El empaquetado y la cuantizacion int8 corren a cargo de AWADEME Ronaldo en Finanfa Tech. No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u optimizacion preferencial; tampoco se detalla el proceso de cuantizacion mas alla de la indicacion de int8.

## Capacidades

- Sintesis de voz mono-hablante en hausa con salida nativa a 48 kHz.
- Respeto de la ortografia Boko, incluyendo implosivas y glotalizadas (`ɓ`, `ɗ`, `ƙ`) y paradas glotales (`'y`).
- Control de velocidad mediante el parametro `speed` (por defecto 1.0).
- Control de calidad/fidelidad mediante `guidance` (por defecto 1.8) y numero de pasos de difusion (`steps`, por defecto 15).
- Ejecucion en CPU y GPU (CUDA).
- Guardado directo a WAV a 48 kHz mediante `save_wav`.
- No se documentan capacidades de clonacion de voz, control emocional, multilingüismo, tool calling ni agentes; el modelo es estrictamente TTS de un solo idioma.

## Casos de uso

- Audiolibros y contenido editorial en hausa: el modelo sintetiza frases largas con ortografia Boko correcta, lo que permite narrar textos educativos o literarios sin necesidad de revisar manualmente la pronunciacion de caracteres especiales.
- Locuciones para radio y television regional: la salida a 48 kHz cubre el estandar de broadcast y evita el re-muestreo que degrada sistemas TTS de 16 o 22 kHz.
- Asistentes de voz para atencion al ciudadano en Nigeria, Niger o Benin: al ejecutarse en CPU con un artefacto de 21 MB, puede desplegarse en servidores modestos o en el borde sin GPU dedicada.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en hausa en dispositivos de gama baja, donde un modelo de 21 MB int8 es viable en terminos de memoria y latencia.
- Contenido educativo y cursos en linea: generacion de pistas de audio para materiales de alfabetizacion en hausa, con control de velocidad (`speed`) para adaptar el ritmo al nivel del estudiante.
- Prototipado rapido de interfaces conversacionales: el ejemplo de inferencia en la model card permite integrar el modelo en un pipeline Python en pocas lineas, util para validar productos de voz antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 21 MB de pesos int8 y ~20,9 M de parametros, la huella de memoria es del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente; el modelo esta disenado para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y tambien en CPU.
- Opciones de despliegue: inferencia via el script `infer.py` incluido en el repo (PyTorch + soundfile + numpy). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. La model card solo indica 15 pasos de muestreo por defecto y enfasis en ejecucion "ultra-rapida" en CPU, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de salida | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finanfa-hausa-tts-v1 | ~20,9 M (int8) | 48 kHz | hausa | Apache 2.0 | Hugging Face |
| murivo-tts-21m-hausa (modelo base de alineacion) | ~21 M | no disponible | hausa | no disponible | Hugging Face (`samuelolubukun`) |
| rapido-tts (arquitectura acustica base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (`edwixx`) |
| VoxCPM2 (vocoder AudioVAE) | no disponible | 48 kHz | multilingue (vocoder) | no disponible | Hugging Face (`openbmb`) |

No se dispone de datos de benchmarks ni de otros modelos TTS de hausa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: no soporta otras lenguas ni cambio de voz.
- No se documentan sesgos especificos, pero al entrenarse presumiblemente con voces de una region concreta puede reproducir un acento o registro limitado dentro del hausa.
- Riesgo de alucinacion acustica propio de los modelos de difusion: posibles artefactos, prosodia irregular o pronunciacion incorrecta en palabras poco frecuentes o nombres propios.
- La cuantizacion int8 puede introducir perdida de fidelidad respecto al modelo original en float; no se cuantifica esa perdida en la model card.
- No se detalla el corpus de entrenamiento ni su procedencia, lo que dificulta evaluar cobertura dialectal (Kano, Sokoto, Zaria, etc.).
- El repositorio figura con 0.0 GB en el momento de la consulta, lo que puede indicar que los pesos no estan subidos o que el conteo no se ha actualizado; conviene verificar antes de integrar en produccion.
- La model card esta redactada en frances, no en hausa ni en ingles.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones de uso mas alla de las habituales.

## Enlaces

- Hugging Face: https://huggingface.co/finanfa-tech/finanfa-hausa-tts-v1
- Modelo base de alineacion: https://huggingface.co/samuelolubukun/murivo-tts-21m-hausa
- Arquitectura acustica Rapido TTS: https://huggingface.co/edwixx/rapido-tts
- Vocoder VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Organizacion Finanfa Tech: https://huggingface.co/finanfa-tech
