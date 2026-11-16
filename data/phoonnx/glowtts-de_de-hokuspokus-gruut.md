# Phoonnx/glowtts-de_de-hokuspokus-gruut

## Resumen

`glowtts-de_de-hokuspokus-gruut` es un modelo de sintesis de voz (text-to-speech) en aleman, empaquetado en formato ONNX para la libreria phoonnx. El modelo original procede de Rhasspy, concretamente del release v1.0 de Larynx, y ha sido reempaquetado por Phoonnx para su uso con su runtime de TTS basado en ONNX. La arquitectura es Glow-TTS, un modelo de sintesis acustica que genera espectrogramas a partir de fonemas, que posteriormente son convertidos a audio por el vocoder HiFi-GAN multi-VCTK small.

El modelo esta especializado en aleman (`de-DE`) y trabaja con fonemas gruut en alfabeto IPA como entrada de texto. No es un modelo de lenguaje generativo ni un sistema de conversacion: es un componente de sintesis acustica dentro de un pipeline TTS mas amplio. Su relevancia radica en que permite sintesis de voz en aleman en local, sin dependencia de servicios en la nube, con un tamano de repositorio de 0,1 GB, lo que lo hace adecuado para despliegues ligeros en dispositivos con recursos limitados.

El modelo tiene un uso muy acotado: sintesis de voz offline en aleman dentro del ecosistema phoonnx y OVOS (Open Voice OS). No dispone de datos publicados de benchmarks, parametros ni composicion de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | `Phoonnx/hifigan-multi-vctk-small` |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica basado en normalizing flows que genera espectrogramas mel a partir de secuencias de fonemas. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS emplea un mecanismo de alineamiento monotono y decodificacion en paralelo, lo que reduce la latencia de sintesis. El modelo produce un espectrograma que se convierte en audio mediante el vocoder HiFi-GAN multi-VCTK small, descargado automaticamente por phoonnx junto con la voz.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo TTS de este tipo). El modelo original fue publicado por Rhasspy dentro del proyecto Larynx v1.0, orientado a sintesis de voz offline para asistentes de voz. El empaquetado para phoonnx anade la conversion a ONNX y la integracion con la libreria scriptconv para la normalizacion de texto y la fonemizacion con gruut.

## Capacidades

- Sintesis de voz en aleman (`de-DE`) a partir de texto de entrada.
- Conversion de texto a fonemas gruut en alfabeto IPA mediante scriptconv.
- Generacion de espectrogramas mel y conversion a audio WAV mediante HiFi-GAN.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en inferencia ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta otros idiomas distintos del aleman.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- **Asistentes de voz offline en aleman**: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y permite respuestas habladas en aleman sin conexion a internet, adecuado para dispositivos domoticos o entornos con privacidad estricta.
- **Lectura de notificaciones y alertas**: sintesis de mensajes cortos en aleman para sistemas de monitorizacion, domotica o aplicaciones de accesibilidad, con latencia baja gracias a la decodificacion en paralelo de Glow-TTS.
- **Generacion de audiolibros o contenido narrado en aleman**: conversion de texto a voz para publicacion de contenido en formato audio, siempre que se respete la licencia del modelo original.
- **Prototipado de interfaces de voz**: desarrollo y prueba de flujos conversacionales en aleman en fase de prototipo, con un modelo ligero (0,1 GB) que se ejecuta en hardware modesto.
- **Sistemas de anuncios automatizados**: sintesis de avisos en estaciones, aeropuertos o comercios en aleman, donde se requiere generacion de voz local y repetible.
- **Investigacion en TTS**: uso como linea base para comparar arquitecturas Glow-TTS frente a otros modelos de sintesis acustica en aleman, o para experimentar con vocoders alternativos.
- **Accesibilidad**: lectura en voz alta de contenido textual en aleman para personas con discapacidad visual, integrado en aplicaciones de escritorio o moviles mediante phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma en la documentacion.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: no confirmada; por el tamano del repositorio es plausible que funcione en CPU sin GPU dedicada, pero no se especifica.
- **Opciones de despliegue**: phoonnx (runtime ONNX en Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-hokuspokus-gruut | Glow-TTS + HiFi-GAN | Aleman | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Piper (rhasspy) | VITS | Multiples idiomas | ONNX | MIT (segun proyecto) | GitHub / Hugging Face |
| Coqui TTS (XTTS) | GPT-based TTS | Multiples idiomas | PyTorch | Coqui Public Model License | GitHub / Hugging Face |
| Larynx (original) | Glow-TTS + vocoder | Multiples idiomas | Varios | Segun release upstream | GitHub (rhasspy/larynx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- **Licencia no registrada**: la model card indica explicitamente que no hay licencia registrada para este modelo y recomienda consultar el release upstream antes de usarlo. El uso comercial no esta garantizado sin verificacion previa.
- **Idioma unico**: solo soporta aleman (`de-DE`); no es multilingue.
- **Entrada restringida a fonemas gruut**: el modelo espera fonemas en alfabeto IPA generados por scriptconv con el fonemizador gruut; un uso incorrecto del front-end de texto puede degradar la calidad de sintesis.
- **Riesgo de alucinacion acustica**: como todo modelo TTS, puede generar artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento.
- **Sesgos**: no se dispone de informacion sobre sesgos de voz, acento o genero en los datos de entrenamiento.
- **Dependencia de phoonnx y scriptconv**: requiere instalar `phoonnx` y `scriptconv[gruut]`; no es un modelo autonomo en formato estandar de transformers.
- **Sin datos de benchmarks ni parametros**: no es posible evaluar su calidad objetiva frente a alternativas sin pruebas propias.
- **Repo de baja adopcion**: 20 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-hokuspokus-gruut
- Release upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_hokuspokus-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
