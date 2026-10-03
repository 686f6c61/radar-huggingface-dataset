# an-lazarus/ai-studio-voice

## Resumen

`an-lazarus/ai-studio-voice` es un repositorio de distribucion de pesos y entornos de ejecucion para motores de sintesis de voz, publicado por el usuario an-lazarus. No se trata de un modelo entrenado por el autor: segun su propia model card, el repositorio contiene los ficheros que la aplicacion de escritorio AI Studio descarga en el primer uso de su herramienta Voice Over, y los pesos son copias sin modificar de proyectos de codigo abierto de terceros (CosyVoice 2 y 3 de FunAudioLLM/Alibaba, el motor Kanade 12.5 Hz con Vocos y WavLM, y Chatterbox de Resemble AI).

El paquete se organiza en archivos ZIP: tres para CosyVoice (pesos de las versiones 2 y 3, mas el codigo), uno para el motor de clonacion basado en Kanade/Vocos/WavLM, uno para Chatterbox y varios entornos de Python 3.12 y 3.10 con PyTorch, en variantes de CPU y de GPU NVIDIA con CUDA 12.8. Incluye un `voice-manifest.json` con el tamano y el sha256 de cada fichero y de cada bloque de 64 MB, de modo que una descarga interrumpida pueda verificarse y reanudarse.

Su relevancia es practica mas que cientifica: funciona como espejo reproducible y verificable de un conjunto heterogeneo de motores TTS, con licencias agregadas bajo la etiqueta `mixed-see-notice`. El repositorio ocupa 20,2 GB y su pipeline declarado es `audio-to-audio`. La model card no publica parametros, contexto, idiomas soportados ni resultados de benchmarks de ningun motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agregado de varios motores TTS: CosyVoice 2, CosyVoice 3, Kanade+Vocos+WavLM y Chatterbox; la model card no detalla la arquitectura de cada uno) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe ningun modelo MoE) |
| Longitud de contexto | no disponible (no aplica a sintesis de voz; depende de cada motor) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en archivos ZIP; la model card no especifica precision ni cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `mixed-see-notice`: Apache-2.0 para CosyVoice 2 y 3 y para Matcha-TTS (MIT en el caso de Matcha-TTS), MIT para los componentes de Kokoclone (Kanade, Vocos, WavLM) y para Chatterbox; WavLM queda sujeto a la nota especifica de `NOTICE.md` |
| Formato de pesos | ZIP con pesos y codigo; entornos Python empaquetados. El formato interno de cada checkpoint no se especifica en la informacion disponible |
| Tamano del repositorio | 20,2 GB |
| Pipeline declarado | audio-to-audio |
| Fecha de creacion | 2026-10-02 |
| Fecha de ultima actualizacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El repositorio es un agregado de artefactos de inferencia de cuatro lineas de trabajo distintas, empaquetadas por el autor para consumo de una aplicacion de escritorio. Los componentes declarados son: CosyVoice 2 y CosyVoice 3 con su codigo (proyecto FunAudioLLM de Alibaba), que a su vez incorpora Matcha-TTS de Shivam Mehta; el motor de clonacion Kokoclone, compuesto por Kanade 12.5 Hz de frothywater, Vocos mel 24 kHz de Charactr y WavLM Base+ de Microsoft tal como lo redistribuye torchaudio; y Chatterbox de Resemble AI. Kanade fue entrenado sobre LibriTTS (CC BY 4.0), segun la propia model card.

La innovacion tecnica del repositorio no esta en los modelos, sino en el mecanismo de distribucion: `voice-manifest.json` enumera cada fichero con su tamano y su sha256, e incluye ademas un sha256 por cada bloque de 64 MB, lo que permite verificar la integridad de una descarga parcial y reanudarla. Los entornos se empaquetan con python-build-standalone (Python 3.12 y 3.10) junto a PyTorch y sus dependencias, en variantes de CPU y de GPU NVIDIA con CUDA 12.8, de modo que la aplicacion no depende del entorno Python del sistema del usuario. Cada ZIP incluye su propio `NOTICE-<name>.txt` con la atribucion correspondiente.

## Capacidades

- Sintesis de voz (texto a audio) mediante uno o varios de los motores incluidos; la model card no desglosa que capacidades concretas aporta cada uno.
- Conversion de audio a audio, coherente con la etiqueta de pipeline `audio-to-audio` del repositorio.
- Clonacion de voz: el paquete `weights-kokoclone.zip` agrupa Kanade, Vocos y WavLM, componentes propios de pipelines de clonacion.
- Ejecucion local: se incluyen entornos de CPU y de GPU NVIDIA (CUDA 12.8) para no depender de servicios en la nube.
- Verificacion e reanudacion de descargas mediante hashes por fichero y por bloques de 64 MB.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio de entrada: no disponibles; no se describen en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.

## Casos de uso

- Doblaje y voice over en produccion audiovisual: la herramienta Voice Over de AI Studio usa estos motores para generar locuciones; el modelo resultante se integra en el flujo de la propia aplicacion, que gestiona la descarga y el entorno de ejecucion.
- Clonacion de voz para audiolibros y contenido hablado largo: el paquete de clonacion (Kanade 12.5 Hz, Vocos mel 24 kHz, WavLM Base+) esta pensado para reproducir una voz de referencia a partir de muestras, util cuando se necesita consistencia de timbre en horas de audio.
- Prototipado de asistentes de voz en local: al incluir entornos de CPU y de GPU, permite levantar un motor TTS sin conexion a servicios externos, adecuado para demos y entornos con requisitos de privacidad.
- Generacion de datos sinteticos de audio para pruebas: se pueden producir muestras de voz controladas para validar pipelines de ASR, diarizacion o deteccion de habla sin recurrir a voces reales.
- Localizacion de contenido de audio: si el motor elegido soporta varios idiomas, el paquete sirve para regenerar pistas de voz en otro idioma manteniendo la identidad de la voz original; conviene verificar el soporte idiomatico por motor, ya que la model card no lo documenta.
- Accesibilidad y lectura de textos: conversion de documentos a audio para personas con discapacidad visual o dificultades de lectura, ejecutada en local para evitar enviar el texto a terceros.
- Desarrollo y mantenimiento de la propia aplicacion AI Studio: el repositorio actua como espejo reproducible de los binarios que la app descarga, lo que simplifica auditorias de licencias y verificacion de integridad en despliegues corporativos.
- Experimentacion con varios motores TTS bajo una unica descarga: al reunir CosyVoice 2, CosyVoice 3, Kokoclone y Chatterbox, permite comparar calidad de sintesis sin montar cuatro entornos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio describe el contenido y las licencias de los archivos, pero no incluye metricas de calidad de sintesis (MOS, WER, similitud de hablante) ni comparaciones cuantitativas entre motores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria por motor ni por cuantizacion.
- GPU recomendadas: no disponibles. El unico dato es que se incluyen entornos con CUDA 12.8 para NVIDIA, ademas de variantes de CPU.
- Compatibilidad con GPU de consumo: no se especifica. Los entornos de GPU incluidos usan CUDA 12.8, por lo que requieren drivers NVIDIA compatibles con esa version.
- Espacio en disco: 20,2 GB para el repositorio completo, mas el espacio adicional necesario al descomprimir los ZIP de pesos y de entornos.
- Opciones de despliegue: el consumo previsto es a traves de la aplicacion de escritorio AI Studio mediante su manifiesto `voice-manifest.json`. vLLM, llama.cpp, Ollama o TGI no son aplicables a este paquete, ya que no contiene un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Al no ser un modelo unico, la comparativa se plantea entre los motores que contiene el propio paquete. No hay datos de rendimiento publicados para ninguno de ellos en la informacion disponible, por lo que solo se comparan procedencia y licencia.

| Motor incluido | Proyecto de origen | Licencia | Estado en el repositorio |
|---|---|---|---|
| CosyVoice 2 | FunAudioLLM (Alibaba), con Matcha-TTS de Shivam Mehta | Apache-2.0; Matcha-TTS MIT | `weights-cosyvoice2.zip`, `code-cosyvoice.zip` |
| CosyVoice 3 | FunAudioLLM (Alibaba) | Apache-2.0 | `weights-cosyvoice3.zip`, `code-cosyvoice.zip` |
| Kokoclone (Kanade 12.5 Hz + Vocos mel 24 kHz + WavLM Base+) | frothywater, Charactr, Microsoft (redistribuido por torchaudio); Kanade entrenado sobre LibriTTS (CC BY 4.0) | MIT, con nota especifica para WavLM | `weights-kokoclone.zip` |
| Chatterbox | Resemble AI | MIT | `weights-chatterbox.zip` |
| Alternativas externas (por ejemplo, otros sistemas TTS abiertos) | no disponible | no disponible | no incluidas |

## Limitaciones y advertencias

- La licencia es `other` con nombre `mixed-see-notice`: el uso comercial exige revisar cada `NOTICE-<name>.txt` y `NOTICE.md`, porque las condiciones no son homogeneas entre los cuatro motores.
- El componente WavLM Base+ queda sujeto a una nota especifica de atribucion y redistribucion recogida en `NOTICE.md`; es el punto que requiere mas atencion antes de reutilizarlo en un producto.
- El autor declara no estar afiliado ni respaldado por los autores originales de los proyectos, lo que limita cualquier soporte o garantia sobre los pesos.
- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo de hablante, acento, genero o idioma. Kanade se entreno sobre LibriTTS, un corpus en ingles, lo que puede condicionar su comportamiento fuera de ese dominio.
- Riesgo de artefactos de audio: al ser un pipeline de sintesis, los fallos previsibles son pronunciacion incorrecta, prosodia artificial y ruido, no alucinacion textual.
- Idiomas: no declarados. Cualquier afirmacion de soporte multilingue debe verificarse contra la documentacion de cada motor upstream.
- Ausencia total de benchmarks: no hay MOS, WER ni similitud de hablante publicados en la informacion disponible, de modo que no es posible comparar calidad de forma objetiva.
- Uso etico y legal de la clonacion de voz: requiere consentimiento explicito de la persona cuya voz se clona y cumplimiento de la normativa aplicable sobre deepfakes e identidad.
- Riesgo de desactualizacion: el paquete fija versiones concretas de entornos y pesos; los proyectos upstream evolucionan por separado y estos ZIP no se actualizan automaticamente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/an-lazarus/ai-studio-voice
- La model card referencia los ficheros `NOTICE-<name>.txt` dentro de cada ZIP y un `NOTICE.md` general, pero no incluye enlaces externos.
- Enlaces de los proyectos upstream citados en la model card: no disponibles en la informacion proporcionada; deben localizarse a partir de los nombres indicados (CosyVoice 2 y 3 de FunAudioLLM/Alibaba, Matcha-TTS de Shivam Mehta, Kanade 12.5 Hz de frothywater, Vocos mel 24 kHz de Charactr, WavLM Base+ de Microsoft, Chatterbox de Resemble AI).
- Resultados de busqueda web: no relevantes para este modelo (devuelven paginas institucionales y administrativas francesas sin relacion con el repositorio).
