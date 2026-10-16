# k1ngtai/VoxCPM2

## Resumen

VoxCPM2 es un modelo de texto a voz (TTS) de tipo difusión autorregresiva y sin tokenizador desarrollado por OpenBMB (el repositorio de HuggingFace consultado es una copia subida por el usuario k1ngtai, mientras que la model card apunta al espacio oficial openbmb/VoxCPM2). El modelo resuelve la sintesis de voz multilingue de alta fidelidad: convierte texto en audio directamente, sin depender de un tokenizador acustico discreto, y admite clonacion de voz, diseno de voz por descripcion en lenguaje natural y sintesis en tiempo real.

Cuenta con aproximadamente 2,29 mil millones de parametros, un backbone derivado de MiniCPM-4, un AudioVAE V2 que acepta referencias de 16 kHz y genera audio de 48 kHz, una longitud de secuencia maxima de 8192 tokens y una tasa de tokens de lenguaje de 6,25 Hz. Soporta 30 idiomas (entre ellos castellano, ingles, chino, arabe, hindi, japones y coreano) y varios dialectos del chino, y se entrena sobre mas de 2 millones de horas de habla multilingue.

Es relevante porque combina licencia Apache-2.0 (uso comercial libre) con requisitos de hardware relativamente bajos (unos 8 GB de VRAM) y un factor de tiempo real (RTF) de aproximadamente 0,30 en una RTX 4090, que baja hasta ~0,13 con aceleracion Nano-vLLM. Ademas, una misma toma de referencia sirve tanto para clonaciones rapidas como para clonaciones de alta fidelidad estilo audio-continuacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone MiniCPM-4, con AudioVAE V2 asimetrico (16 kHz entrada → 48 kHz salida) |
| Parametros totales | 2.290.004.544 (~2,29 mil millones) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | 8192 tokens (secuencia maxima) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en bfloat16 segun la model card) |
| Idiomas soportados | 30 idiomas: arabe, birmano, chino, danes, neerlandes, ingles, finlandes, frances, aleman, griego, hebreo, hindi, indonesio, italiano, japones, jemer, coreano, lao, malayo, noruego, polaco, portugues, ruso, espanol, suajili, sueco, tagalo, thai, turco y vietnamita; mas dialectos del chino (si chuan hua, cantones, wu, dong bei hua, he nan hua, shan xi hua, shan dong hua, tian jin hua, min nan hua) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 5,0 GB) |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de sintesis de voz sin tokenizador construido como una pila de difusion autorregresiva. Su pipeline interno encadena cuatro modulos: LocEnc (codificador local), TSLM (modelo de lenguaje temporal), RALM (modelo de lenguaje autorregresivo) y LocDiT (transformador de difusion local). El backbone esta basado en MiniCPM-4 y suma en total unos 2 mil millones de parametros. La representacion acustica continua la gestiona AudioVAE V2, un VAE de audio con encode y decode asimetricos: recibe audio de referencia a 16 kHz y produce salida a 48 kHz mediante superresolucion integrada, de modo que no se necesita un sobremuestreador externo. La tasa de tokens de lenguaje es de 6,25 Hz, lo que reduce la carga computacional al operar sobre representaciones de baja frecuencia.

Segun la model card, el modelo se entrena sobre mas de 2 millones de horas de habla multilingue y se distribuye en bfloat16. La informacion proporcionada no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas concretas de RLHF o DPO. La model card menciona ademas una seccion de fine-tuning, pero el texto facilitado queda truncado en ese punto, por lo que no se pueden confirmar los detalles de ajuste fino. Entre las capacidades tecnicas destacadas estan la sintesis consciente del contexto (inferencia automatica de prosodia y expresividad) y la generacion en streaming con un RTF bajo.

## Capacidades

- Sintesis de voz multilingue en 30 idiomas sin necesidad de etiqueta de idioma: basta con introducir el texto en el idioma deseado.
- Diseno de voz (voice design): generar una voz nueva a partir de una descripcion en lenguaje natural (genero, edad, tono, emocion, ritmo) sin audio de referencia.
- Clonacion controlable: clonacion de una voz a partir de un clip corto, con guia de estilo opcional para modular emocion, ritmo y expresion manteniendo el timbre.
- Clonacion de maxima fidelidad (ultimate cloning): aportando audio de referencia y su transcripcion exacta, el modelo reproduce matices vocales con alta fidelidad mediante continuacion de audio.
- Salida de audio a 48 kHz con calidad de estudio a partir de referencias de 16 kHz, gracias a la superresolucion integrada de AudioVAE V2.
- Sintesis consciente del contexto: inferencia automatica de prosodia y expresividad a partir del propio contenido textual.
- Streaming en tiempo real con RTF de ~0,30 en RTX 4090 y ~0,13 con Nano-VLLM.
- Soporte de dialectos del chino (nueve variedades documentadas).
- Control de generacion mediante parametros como `cfg_value` e `inference_timesteps`.
- No se menciona en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso; estas capacidades no aplican a un modelo de texto a voz.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo sintetiza texto largo en 30 idiomas con prosodia inferida del contenido, y su salida a 48 kHz resulta adecuada para publicacion final sin post-procesado de muestreo.
- Doblaje y localizacion de contenidos: al soportar castellano, ingles, japones, aleman y otros 26 idiomas, permite generar pistas de voz para videos o cursos manteniendo un estilo consistente mediante el control de cfg y de descripcion de estilo.
- Asistentes de voz y agentes conversacionales: la generacion en streaming con RTF ~0,30 (o ~0,13 con Nano-VLLM) sobre una RTX 4090 posibilita respuestas habladas de baja latencia en pipelines interactivos.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: conversion de documentos y articulos a audio natural, con posibilidad de elegir una voz concreta mediante diseno de voz.
- Clonacion de voz autorizada para creadores de contenido: reproduccion de la propia voz del creador a partir de un clip corto para escalar la produccion de podcasts o videos.
- Prototipado de personajes para videojuegos y animacion: el diseno de voz por descripcion permite generar voces nuevas sin necesidad de grabaciones de referencia.
- Sistemas de atencion al cliente con voz sintetizada: generacion de respuestas habladas personalizadas, apoyandose en la salida a 48 kHz para mejorar la inteligibilidad en telefonia IP.
- Investigacion en sintesis de voz y evaluacion de modelos TTS: al ser Apache-2.0 y distribuirse en safetensors, sirve como base para comparativas, fine-tuning y experimentacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que VoxCPM2 alcanza resultados de estado del arte o competitivos en las principales pruebas de TTS zero-shot y controlable, y remite al repositorio de GitHub (Seed-TTS-eval, CV3-eval, InstructTTSEval, MiniMax Multilingual Test) para las tablas completas, pero no incluye las cifras concretas.

Los unicos datos de rendimiento disponibles son de eficiencia:

| Metrica | Valor |
|---|---|
| RTF en NVIDIA RTX 4090 (estandar) | ~0,30 |
| RTF en NVIDIA RTX 4090 (Nano-VLLM) | ~0,13 |
| VRAM estimada | ~8 GB |
| Precision (dtype) | bfloat16 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB segun la model card, en bfloat16.
- GPU recomendadas: NVIDIA RTX 4090 (RTF medido ~0,30 en modo estandar y ~0,13 con Nano-VLLM). No se detallan resultados para A100, H100 ni otras GPU en la informacion proporcionada.
- Cabe en GPU de consumo: con ~8 GB de VRAM, el modelo puede ejecutarse en tarjetas consumer de gama alta como la RTX 4090; no se confirma su encaje en GPU con menos memoria.
- Opciones de despliegue: la libreria oficial `voxcpm` (instalable con `pip install voxcpm`) para inferencia en Python; aceleracion mediante Nano-VLLM (`nanovllm-voxcpm`). No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Requisitos de software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0.
- Latencia y throughput: el unico dato aportado es el factor de tiempo real (RTF ~0,30 en RTX 4090 y ~0,13 con Nano-VLLM), lo que implica generacion mas rapida que el tiempo real en esa GPU.
- Parametros de inferencia relevantes: `cfg_value` (por defecto 2.0 en los ejemplos) e `inference_timesteps` (10 en los ejemplos), que afectan a calidad y coste de computo.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos TTS en la informacion proporcionada, por lo que no es posible elaborar una tabla con cifras verificables. Como referencia cualitativa, el propio modelo se posiciona frente a la generacion anterior VoxCPM (de la que hereda el nombre y el ecosistema OpenBMB) y su model card menciona comparativas con las pruebas Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test, pero sin incluir los resultados.

| Aspecto | VoxCPM2 | Alternativas comparables |
|---|---|---|
| Parametros | ~2,29 mil millones | no disponible |
| Contexto / secuencia | 8192 tokens | no disponible |
| Idiomas | 30 | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Disponibilidad | HuggingFace + GitHub OpenBMB | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos especificos en la informacion disponible; como todo modelo TTS entrenado con datos de habla multilingue, puede reflejar sesgos de genero, acento o prosodia presentes en el corpus.
- Riesgo de alucinacion acustica: en sintesis de voz, el modelo puede generar artefactos, pronunciaciones incorrectas o entonaciones inadecuadas, especialmente con palabras poco frecuentes, nombres propios o texto con errores ortograficos.
- Clonacion de voz: la capacidad de clonacion con pocos segundos de audio plantea riesgos de suplantacion y uso malicioso (fraude, desinformacion, deepfakes de audio); es imprescindible obtener consentimiento explicito y cumplir la normativa aplicable.
- Cobertura idiomatica desigual: aunque se declaran 30 idiomas, la model card no aporta metricas por idioma, por lo que la calidad puede variar sensiblemente entre lenguas mayoritarias y minoritarias.
- Requisitos de contexto: la longitud maxima de secuencia es de 8192 tokens a una tasa de 6,25 Hz, lo que limita la duracion del audio generado en una sola pasada; para textos largos sera necesario fragmentar.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero la model card oficial se atribuye a OpenBMB mientras que el repositorio consultado esta publicado por el usuario k1ngtai; conviene verificar el origen y la integridad de los pesos antes de usarlos en produccion.
- Datos incompletos: la model card se corta en la seccion de fine-tuning y no incluye cifras de benchmarks ni detalles del dataset de entrenamiento, lo que dificulta una evaluacion rigurosa.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, ya que no son capacidades propias de un modelo TTS.
- Metadatos de escasa traccion: el repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere que se trata de una copia reciente y no del canal principal de distribucion.

## Enlaces

- Repositorio de HuggingFace consultado: https://huggingface.co/k1ngtai/VoxCPM2
- Repositorio oficial en HuggingFace (referenciado en la model card): https://huggingface.co/openbmb/VoxCPM2
- Repositorio en GitHub: https://github.com/OpenBMB/VoxCPM
- Documentacion: https://voxcpm.readthedocs.io/en/latest/
- Inicio rapido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo interactiva: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Tablas de rendimiento en GitHub: https://github.com/OpenBMB/VoxCPM#-performance
- Discord: https://discord.gg/KZUx7tVNwz
- Lark (grupo oficial): https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=acds0b9d-23d8-4d7e-b696-d200f3e22a7f
- Wiki MiniCPM: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Aceleracion Nano-VLLM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv:2509.24650): https://arxiv.org/abs/2509.24650
