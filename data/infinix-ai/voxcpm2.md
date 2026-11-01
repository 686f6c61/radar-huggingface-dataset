# Infinix-ai/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de 2.290 millones de parámetros desarrollado por Infinix-ai y publicado bajo licencia Apache-2.0. Se presenta como un sistema de TTS multilingüe sin tokenizador, basado en una arquitectura de difusión autorregresiva, y entrenado sobre más de dos millones de horas de audio multilingüe. El modelo cubre 30 idiomas, incluyendo castellano, y admite clonación de voz, diseño de voz a partir de descripciones en lenguaje natural y salida de audio a 48 kHz.

La propuesta diferencial es la combinación de tres modos de control de voz (diseño desde texto, clonación con control de estilo y clonación de alta fidelidad con transcripción) en un único modelo de 2B parámetros que cabe en aproximadamente 8 GB de VRAM. El backbone se basa en MiniCPM-4 y el decodificador de audio es un VAE asimétrico propio (AudioVAE V2) que acepta referencias a 16 kHz y genera audio a 48 kHz sin necesidad de un upsampler externo.

Su relevancia actual reside en que ofrece capacidades de clonación y diseño de voz con licencia permisiva para uso comercial, un factor restrictivo habitual en esta categoría, y en que incluye streaming en tiempo real con un RTF de aproximadamente 0,30 en una RTX 4090, que baja a aproximadamente 0,13 con la integración con Nano-VLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (secuencia maxima del modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | 30: arabe, birmano, chino, danes, neerlandes, ingles, finlandes, frances, aleman, griego, hebreo, hindi, indonesio, italiano, japones, jemer, coreano, lao, malayo, noruego, polaco, portugues, ruso, espanol, suajili, sueco, tagalo, tailandes, turco y vietnamita; ademas de dialectos chinos (sichuanes, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 5,0 GB) |
| Frecuencia de muestreo de salida | 48 kHz (entrada de referencia a 16 kHz) |
| Tasa de tokens del LM | 6,25 Hz |
| dtype | bfloat16 |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de difusión autorregresiva sin tokenizador. El pipeline interno se descompone en cuatro etapas segun la model card: LocEnc, TSLM, RALM y LocDiT, sobre un backbone derivado de MiniCPM-4. El modelo de lenguaje opera a una tasa de 6,25 tokens por segundo de audio y admite secuencias de hasta 8192 tokens. La componente de audio es AudioVAE V2, un VAE con codificacion y decodificacion asimetricas que recibe referencias a 16 kHz y produce audio a 48 kHz mediante superresolucion integrada, sin upsampler externo.

El entrenamiento se realizo sobre mas de dos millones de horas de habla multilingue, segun el autor. La model card no detalla la composicion exacta del dataset, el numero de tokens de texto ni si se aplicaron etapas de RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica principal es la eliminacion del tokenizador de audio discreto en favor de un enfoque de difusion, junto con el control de estilo mediante descripciones entre parentesis al inicio del texto y la clonacion en tres modalidades (basica, con control de estilo y con transcripcion de referencia).

## Capacidades

- Sintesis de voz multilingue en 30 idiomas sin necesidad de etiqueta de idioma en la entrada.
- Diseno de voz a partir de una descripcion en lenguaje natural (genero, edad, tono, emocion, ritmo) sin audio de referencia.
- Clonacion de voz basica a partir de un clip corto de referencia.
- Clonacion controlable: permite modular emocion, ritmo y expresion preservando el timbre de la referencia.
- Clonacion de alta fidelidad (ultimate cloning): acepta audio de referencia y su transcripcion exacta para reproducir matices vocales.
- Salida de audio a 48 kHz con superresolucion integrada desde referencias a 16 kHz.
- Sintesis consciente del contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Streaming en tiempo real con generacion por fragmentos.
- Soporte de dialectos chinos (sichuanes, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan).
- No se documenta soporte de tool calling, function calling, agentes ni vision; el modelo es exclusivamente de texto a voz.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo infiere prosodia y expresividad del propio texto y permite asignar voces distintas por personaje mediante diseno de voz, sin necesidad de grabaciones de referencia.
- Doblaje y localizacion multilingue: con 30 idiomas y clonacion controlable, se puede mantener el timbre de un actor original mientras se genera la version en castellano u otro idioma, ajustando ritmo y emocion por escena.
- Asistentes de voz y atencion al cliente: el streaming con RTF de aproximadamente 0,30 en RTX 4090 permite respuestas habladas de baja latencia en conversaciones multi-turno; la clonacion permite usar una voz corporativa consistente.
- Accesibilidad y lectura de pantalla: la salida a 48 kHz y el control de ritmo facilitan la sintesis de documentos largos con calidad de estudio para usuarios con discapacidad visual.
- Produccion de contenido y podcasts: el diseno de voz a partir de descripciones permite generar locuciones nuevas sin disponer de un locutor, y el modo de clonacion con transcripcion reproduce matices de un estilo ya existente.
- Prototipado de videojuegos y personajes: se pueden crear voces de personaje mediante descripcion textual y variar emocion y ritmo por linea de dialogo, con licencia Apache-2.0 que permite distribucion comercial.
- Investigacion en TTS: al ser un modelo abierto de 2B parametros con pipeline documentado (LocEnc, TSLM, RALM, LocDiT), sirve como base para experimentos de difusion autorregresiva y evaluacion de clonacion zero-shot.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados state-of-the-art o competitivos en benchmarks de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test), pero remite las tablas completas al repositorio de GitHub y no incluye las cifras en la informacion disponible. Los unicos datos numericos publicados son de eficiencia:

| Metrica | Valor |
|---|---|
| RTF en NVIDIA RTX 4090 (estandar) | aproximadamente 0,30 |
| RTF en NVIDIA RTX 4090 (con Nano-VLLM) | aproximadamente 0,13 |
| VRAM estimada | aproximadamente 8 GB |

No se han publicado en la informacion disponible cifras de MMLU, HumanEval, GSM8K ni de metricas TTS como WER o SIM en esta ficha; consultese el repositorio para las tablas completas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bfloat16, segun la model card.
- GPU recomendadas: NVIDIA RTX 4090 para streaming en tiempo real (RTF aproximado de 0,30); el autor no documenta resultados en A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 4090; en gamas inferiores como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es previsible que quepa, aunque no hay datos oficiales de rendimiento en esas tarjetas).
- Opciones de despliegue: paquete oficial `voxcpm` (Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0), con soporte de streaming nativo; aceleracion mediante Nano-VLLM. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de aproximadamente 0,30 en RTX 4090, lo que equivale a generar audio unas 3,3 veces mas rapido que tiempo real; con Nano-VLLM, RTF de aproximadamente 0,13, unas 7,7 veces mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida | Clonacion | Licencia |
|---|---|---|---|---|---|
| VoxCPM2 | aproximadamente 2B | 30 | 48 kHz | si (3 modos) | Apache-2.0 |
| XTTS-v2 (Coqui) | no disponible en la informacion | 17 | 24 kHz | si | Coqui Public Model License (no comercial) |
| Bark (Suno) | no disponible en la informacion | multilingue | 24 kHz | limitada | MIT |
| F5-TTS | no disponible en la informacion | principalmente ingles y chino | 24 kHz | si | CC-BY-NC (no comercial) |

La comparacion se limita a caracteristicas publicas ampliamente conocidas de esas alternativas; no se dispone de cifras de benchmarks comparativos en la informacion proporcionada. La ventaja mas clara de VoxCPM2 frente a XTTS-v2 y F5-TTS es la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, junto con la salida a 48 kHz y el mayor numero de idiomas.

## Limitaciones y advertencias

- La model card no documenta sesgos especificos por idioma, genero o acento; al entrenarse sobre mas de dos millones de horas de habla multilingue, es probable que herede sesgos de representacion del corpus, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en textos atipicos, nombres propios o idiomas de bajos recursos.
- La calidad en los 30 idiomas no es necesariamente uniforme; el autor no publica desglose por idioma en la informacion disponible.
- La clonacion de voz plantea riesgos de suplantacion de identidad y deepfakes; aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del desplegador aplicar consentimiento y controles.
- El contexto del modelo de lenguaje esta limitado a 8192 tokens, lo que acota la longitud de texto por peticion.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en hardware de menos de 8 GB de VRAM requeriria conversiones no oficiales.
- Requiere CUDA ≥ 12.0 y PyTorch ≥ 2.5.0; no se documenta soporte de CPU ni de aceleradores distintos de NVIDIA.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicacion muy reciente y poca validacion externa todavia.

## Enlaces

- HuggingFace: https://huggingface.co/Infinix-ai/VoxCPM2
- GitHub: https://github.com/OpenBMB/VoxCPM
- Documentacion: https://voxcpm.readthedocs.io/en/latest/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Pagina de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Paper (arXiv): https://arxiv.org/abs/2509.24650
- Nano-VLLM para VoxCPM: https://github.com/a710128/nanovllm-voxcpm
