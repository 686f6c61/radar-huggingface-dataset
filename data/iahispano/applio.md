# IAHispano/Applio

## Resumen

Applio es una herramienta de conversion de voz (voice conversion, VC) desarrollada por IAHispano y publicada bajo licencia MIT. No se trata de un modelo de lenguaje ni de un transformer generativo de texto, sino de un pipeline de audio-audio que transforma una locucion hablada en la voz de un hablante objetivo preservando el contenido linguistico y la prosodia. El repositorio de Hugging Face actua como punto de distribucion de los artefactos del proyecto (pesos, binarios compilados y recursos auxiliares), no como un unico checkpoint monolitico.

El modelo se apoya en las arquitecturas RVC (Retrieval-based Voice Conversion) y VITS, y declara como modelo base `lj1995/VoiceConversionWebUI` y como dataset de entrenamiento `CSTR-Edinburgh/vctk`. La ficha oficial enfatiza la facilidad de uso (interfaz Gradio, scripts de instalacion para Windows y Linux/macOS, notebooks de Colab) y la calidad de conversion, con un sistema de plugins para ampliar funcionalidades.

Su relevancia actual radica en que Applio se ha consolidado como una de las implementaciones de referencia de RVC en la comunidad open source, con cientos de likes y un ecosistema activo (playground web, Discord, documentacion propia). Es util para desarrolladores que necesitan integrar conversion de voz en aplicaciones creativas, doblaje, accesibilidad o investigacion, sin depender de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion) sobre VITS; pipeline audio-a-audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de audio, no texto) |
| Tipos de cuantizacion | no disponible (el repo incluye artefactos ONNX y binarios compilados) |
| Idiomas soportados | no disponible (la conversion es acustica; hereda el idioma del audio de entrada) |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita; el repo incluye `transformers`, `onnx` y binarios en `Compiled` |
| Tamano del repositorio | 560,0 GB |
| Modelo base | lj1995/VoiceConversionWebUI |
| Dataset de entrenamiento | CSTR-Edinburgh/vctk |
| Pipeline declarado | audio-to-audio |
| Fecha de creacion | 2023-10-03 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

Applio implementa un sistema de conversion de voz basado en RVC, una familia de modelos que combina un extractor de caracteristicas (tipicamente HuBERT o ContentVec) con un decoder generativo de tipo VITS. El objetivo es desacoplar el contenido fonetico del hablante: se extraen representaciones del audio de origen, se condicionan con un embedding del hablante objetivo y se sintetiza la forma de onda resultante. La model card cita explicitamente RVC y VITS entre las etiquetas y referencia el proyecto `rvc-cli` como base de la interfaz de linea de comandos.

El entrenamiento declarado se realiza sobre el corpus VCTK (CSTR-Edinburgh/vctk), un dataset publico de habla multihablante en ingles con acentos variados, lo que limita el alcance de los modelos oficiales a ese dominio acustico. El repositorio tambien incluye artefactos derivados del modelo base `lj1995/VoiceConversionWebUI`, que es la implementacion original de RVC. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de conversion de voz). La model card menciona que todos los modelos oficiales distribuidos por Applio se entrenaron con datasets de uso publico como VCTK.

## Capacidades

- Conversion de voz audio-a-audio: transforma una locucion de origen en la voz de un hablante objetivo preservando contenido y prosodia.
- Entrenamiento de voces personalizadas a partir de muestras de audio del usuario.
- Interfaz Gradio integrada para uso interactivo, con scripts de arranque para Windows y Linux/macOS.
- Sistema de plugins (`Applio-Plugins`) para extender funcionalidades.
- Soporte de linea de comandos mediante `rvc-cli` y notebooks de Google Colab (con y sin UI).
- Monitorizacion de entrenamiento mediante TensorBoard.
- Distribucion de binarios compilados en el directorio `Compiled` del repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades de vision, audio-texto ni thinking mode.

## Casos de uso

- Doblaje y localizacion: convertir la voz de un actor de doblaje a la voz de un personaje concreto manteniendo la interpretacion original, usando el pipeline audio-a-audio y el modelo entrenado sobre VCTK como punto de partida.
- Produccion musical y creativa: aplicar la voz de un cantante o hablante de referencia sobre una pista vocal existente, gracias a la preservacion de prosodia del sistema RVC.
- Accesibilidad y sintesis personalizada: generar una voz sintetica que se parezca a la del usuario para personas con dificultades del habla, entrenando un modelo a partir de muestras propias.
- Investigacion en conversion de voz: usar el repositorio como baseline reproducible (VCTK + RVC + VITS) para comparar tecnicas de desacoplamiento de hablante y contenido.
- Prototipado rapido en Colab: los notebooks `Applio.ipynb` y `Applio_NoUI.ipynb` permiten probar el pipeline sin instalacion local, util para demos y validacion de ideas.
- Integracion en pipelines de postproduccion de audio: la CLI `rvc-cli` y los binarios compilados permiten automatizar la conversion por lotes dentro de flujos existentes.
- Anonimizacion de voz: sustituir la identidad vocal de grabaciones antes de publicarlas, reduciendo la exposicion de datos biometricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del checkpoint concreto y del backend (ONNX, PyTorch).
- GPU recomendadas: no disponibles de forma explicita. El proyecto se distribuye con soporte para ejecucion en Colab (GPU gratuita de Google) y binarios compilados, lo que sugiere viabilidad en GPUs consumer, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el uso en Colab indica que el pipeline puede ejecutarse en hardware modesto.
- Opciones de despliegue: interfaz Gradio local, scripts `run-applio.sh`/`run-applio.bat`, notebooks de Colab, CLI `rvc-cli`, y artefactos ONNX en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Contexto / dominio | Disponibilidad |
|---|---|---|---|---|
| Applio (IAHispano) | Voice conversion (RVC + VITS) | MIT | Audio-audio, entrenado sobre VCTK | Hugging Face, GitHub, playground web |
| lj1995/VoiceConversionWebUI | Voice conversion (RVC original) | no disponible en la informacion | Audio-audio | Hugging Face (modelo base) |
| rvc-cli (blaisewf) | CLI sobre RVC | no disponible en la informacion | Audio-audio | GitHub |

No se dispone de datos de rendimiento comparativo (metricas objetivas como MCD, WER o MOS) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos: el entrenamiento sobre VCTK limita los modelos oficiales al ingles y a un conjunto acotado de hablantes; la calidad puede degradarse con acentos, idiomas o registros no representados.
- Riesgo de alucinacion acustica: la conversion puede introducir artefactos, inestabilidades en fonemas no vistos o perdida de naturalidad en grabaciones ruidosas.
- Limitaciones de idioma: la model card no declara idiomas soportados; el comportamiento multilingue depende del extractor de caracteristicas y del modelo entrenado, no esta garantizado.
- Restricciones de licencia: la licencia es MIT, pero la model card exige respetar derechos de autor, propiedad intelectual y privacidad; el uso comercial requiere cumplir la MIT y contactar con support@applio.org para uso etico.
- Riesgo de suplantacion de identidad: la conversion de voz puede emplearse para crear deepfakes de audio; la model card responsabiliza al usuario del cumplimiento legal y etico.
- Tamano del repositorio: 560 GB, lo que implica requisitos de almacenamiento considerables si se descarga completo; conviene descargar solo los artefactos necesarios.
- Ausencia de datos tecnicos: no se publican parametros, contexto, cuantizaciones ni benchmarks, lo que dificulta la evaluacion comparativa rigurosa.
- Entrenamiento de voces propias: requiere muestras de audio del hablante objetivo y puede conllevar consideraciones de consentimiento y proteccion de datos.

## Enlaces

- Hugging Face: https://huggingface.co/IAHispano/Applio
- Web oficial: https://applio.org
- Documentacion: https://docs.applio.org
- Playground: https://applio.org/playground
- Discord: https://discord.gg/urxFjYmYYh
- Plugins: https://github.com/IAHispano/Applio-Plugins
- Binarios compilados: https://huggingface.co/IAHispano/Applio/tree/main/Compiled
- Google Colab (UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio.ipynb
- Google Colab (No UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio_NoUI.ipynb
- Modelo base: https://huggingface.co/lj1995/VoiceConversionWebUI
- Dataset VCTK: https://huggingface.co/datasets/CSTR-Edinburgh/vctk
- rvc-cli: https://github.com/blaisewf/rvc-cli
- gradio-screen-recorder: https://huggingface.co/spaces/gstaff/gradio-screen-recorder
- Contribuidores: https://github.com/IAHispano/Applio/graphs/contributors
- Donaciones: https://ko-fi.com/iahispano
