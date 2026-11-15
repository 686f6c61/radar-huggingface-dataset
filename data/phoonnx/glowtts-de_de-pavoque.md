# Phoonnx/glowtts-de_de-pavoque

## Resumen

glowtts-de_de-pavoque es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado posteriormente por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera representaciones acusticas (espectrogramas) a partir de texto en aleman (de-DE) y delega la sintesis final de audio en el vocoder hifigan-multi-vctk-small, que phoonnx descarga junto con la voz.

El modelo se distribuye en formato ONNX y su objetivo es ofrecer sintesis de voz local, sin dependencias de servicios en la nube, para asistentes de voz y sistemas embebidos. Es especialmente relevante en el ecosistema OVOS/Mycroft, donde se integra mediante el plugin ovos-tts-plugin-phoonnx. Su tamano de repositorio (0,1 GB) lo hace adecuado para despliegues con recursos limitados.

La entrada de texto no es texto plano directo: el modelo consume fonemas gruut en alfabeto IPA, por lo que requiere una etapa previa de normalizacion y fonemizacion que phoonnx resuelve a traves de la libreria scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo basado en flujos normalizadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (sin licencia registrada; consultar la release upstream de Larynx) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz que combina un encoder Transformer con un mecanismo de alineamiento monotono y un flujo normalizador invertible (Glow) para modelar la distribucion del espectrograma mel. A diferencia de los sistemas autoregresivos tipo Tacotron, Glow-TTS realiza la generacion de forma paralela, lo que reduce la latencia de inferencia. El modelo produce espectrogramas que posteriormente son convertidos a forma de onda por el vocoder HiFi-GAN (variante multi-VCTK small).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El modelo procede del release v1.0 de Larynx (Rhasspy), un proyecto orientado a voces de calidad para asistentes de voz offline, y ha sido unicamente reempaquetado en ONNX por Phoonnx; no se documenta ningun reentrenamiento por parte de este ultimo.

## Capacidades

- Sintesis de voz a partir de texto en aleman (de-DE) mediante fonemizacion gruut en alfabeto IPA.
- Generacion de espectrogramas mel con decodificacion paralela (no autoregresiva), lo que favorece la latencia.
- Integracion con el vocoder hifigan-multi-vctk-small para la conversion a audio.
- Uso local y offline: no requiere llamadas a APIs externas.
- Integracion con OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada al aleman.

## Casos de uso

- Asistentes de voz locales en aleman: el modelo se integra en OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx, permitiendo respuestas habladas sin conexion a internet en dispositivos domoticos.
- Lectura de notificaciones y alertas en sistemas embebidos: al ocupar 0,1 GB y ejecutarse en ONNX, puede desplegarse en hardware de bajos recursos para anuncios por voz en aleman.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en tiempo real para la lectura de contenido en pantalla en aplicaciones de escritorio o moviles.
- Generacion de audiolibros o contenido narrado en aleman: la decodificacion paralela de Glow-TTS reduce el tiempo de sintesis en lotes de texto largos.
- Pruebas de integracion continua (CI) para pipelines de TTS: al ser un modelo pequeno y determinista en su etapa acustica, sirve para validar regresiones en sistemas de sintesis antes de desplegar voces de mayor calidad.
- Prototipado de interfaces conversacionales en aleman: permite construir demos de voz sin coste de API y con control total sobre el modelo en local.
- Investigacion en TTS: como referencia de Glow-TTS empaquetado en ONNX, util para comparar latencias y calidades frente a otros vocoders o arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB, por lo que el modelo cabe holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU de consumo: si, por el reducido tamano del repositorio (0,1 GB), aunque no se detallan requisitos minimos.
- Opciones de despliegue: ONNX Runtime a traves de phoonnx; integracion con OVOS mediante ovos-tts-plugin-phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-pavoque | no disponible | no disponible | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Glow-TTS de la coleccion Phoonnx | no disponible | no disponible | ONNX | variable | Hugging Face (coleccion Glow-TTS de Phoonnx) |
| Voces Larynx originales (Rhasspy) | no disponible | no disponible | tar.gz (formato original) | variable | GitHub rhasspy/larynx |
| hifigan-multi-vctk-small (vocoder) | no disponible | no disponible | ONNX | no disponible | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream de Larynx antes de cualquier uso, incluido el comercial.
- Idioma unico: solo soporta aleman (de-DE); no es multilingue.
- Dependencia de fonemizacion externa: requiere gruut y la libreria scriptconv con el extra scriptconv[gruut]; sin ese pipeline el modelo no recibe la entrada adecuada.
- Dependencia del vocoder: la calidad final del audio depende de hifigan-multi-vctk-small, que phoonnx descarga por separado.
- Riesgo de alucinacion en TTS: como todo modelo generativo de voz, puede producir prosodia o pronunciaciones incorrectas en textos fuera de dominio, aunque no genera contenido semantico nuevo.
- Sesgos: no se documentan sesgos especificos, pero al ser una voz concreta (pavoque) hereda las caracteristicas del hablante y del corpus de entrenamiento original de Larynx.
- Sin datos de benchmarks ni de rendimiento: no es posible evaluar su calidad objetiva frente a alternativas sin pruebas propias.
- Fecha de creacion futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Uso en produccion: al no haber licencia clara ni garantias de soporte, se recomienda validar legal y tecnicamente antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-pavoque
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_pavoque-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
