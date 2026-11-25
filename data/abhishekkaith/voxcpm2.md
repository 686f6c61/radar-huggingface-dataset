# abhishekkaith/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de 2.290 millones de parámetros desarrollado por OpenBMB, publicado en Hugging Face bajo el identificador `abhishekkaith/VoxCPM2`. Se trata de un modelo de difusión autorregresiva sin tokenizador que genera audio a 48 kHz directamente a partir de texto, con soporte para 30 idiomas y una ventana de secuencia de hasta 8192 tokens. Su relevancia actual radica en que combina tres capacidades poco frecuentes en un mismo modelo abierto: clonación de voz a partir de una muestra corta, diseño de voz nueva mediante descripción en lenguaje natural y síntesis multilingüe sin etiquetas de idioma.

La arquitectura se organiza en cuatro etapas (LocEnc → TSLM → RALM → LocDiT) sobre un backbone derivado de MiniCPM-4, con un VAE de audio asimétrico (AudioVAE V2) que acepta referencias a 16 kHz y produce salida a 48 kHz mediante superresolución integrada. El modelo se entrenó con más de 2 millones de horas de habla multilingüe y se distribuye con licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Con un consumo de VRAM de aproximadamente 8 GB y un factor de tiempo real (RTF) de ~0,30 en una RTX 4090 —que baja a ~0,13 con Nano-vLLM—, VoxCPM2 es desplegable en GPU de consumo y apto para streaming en tiempo real. Esto lo sitúa como una alternativa abierta a sistemas TTS propietarios en aplicaciones de producción que requieren latencia baja y control fino sobre el timbre y el estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva sin tokenizador (LocEnc → TSLM → RALM → LocDiT), backbone basado en MiniCPM-4 |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens de secuencia máxima |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 30: ar, my, zh, da, nl, en, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi; además de dialectos del chino (sichuanés, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 5,0 GB) |
| Frecuencia de muestreo de salida | 48 kHz (entrada de referencia a 16 kHz) |
| Tasa de tokens del LM | 6,25 Hz |
| dtype | bfloat16 |
| VRAM estimada | ~8 GB |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de difusión autorregresiva que prescinde de tokenizador discreto de audio. El pipeline interno se compone de cuatro módulos: LocEnc (codificador local), TSLM (modelo de lenguaje temporal), RALM (modelo autorregresivo local) y LocDiT (transformador de difusión local). El backbone deriva de MiniCPM-4 y suma 2,29 mil millones de parámetros. La representación acústica se gestiona con AudioVAE V2, un VAE de audio con codificación y decodificación asimétricas: codifica referencias a 16 kHz y decodifica a 48 kHz, incorporando superresolución integrada que evita depender de un upsampler externo.

El entrenamiento se realizó sobre más de 2 millones de horas de habla multilingüe, aunque la model card no detalla la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La tasa de tokens del modelo de lenguaje es de 6,25 Hz, lo que reduce el coste computacional por segundo de audio generado. La inferencia admite control mediante `cfg_value` (guidance) y `inference_timesteps` (número de pasos de difusión), parámetros que permiten ajustar el equilibrio entre fidelidad y velocidad. El modelo soporta además decodificación en streaming por chunks, lo que habilita síntesis incremental con latencia baja.

## Capacidades

- Generación de voz multilingüe en 30 idiomas sin necesidad de etiqueta de idioma en la entrada.
- Diseño de voz (voice design): creación de una voz nueva a partir de una descripción en lenguaje natural (género, edad, tono, emoción, ritmo), sin audio de referencia.
- Clonación de voz controlable: clonación del timbre a partir de un clip corto, con guía de estilo opcional para modular emoción, velocidad y expresión.
- Clonación de máxima fidelidad (ultimate cloning): acepta audio de referencia junto con su transcripción exacta para clonación por continuación de audio, reproduciendo matices vocales finos.
- Síntesis consciente del contexto: infiere prosodia y expresividad a partir del contenido textual.
- Salida de audio a 48 kHz con superresolución integrada desde referencias de 16 kHz.
- Streaming en tiempo real con RTF de ~0,30 en RTX 4090 (~0,13 con Nano-vLLM).
- Control fino mediante parámetros de inferencia (`cfg_value`, `inference_timesteps`).
- Soporte de dialectos del chino (sichuanés, cantonés, wu, dongbei, henan, shaanxi, shandong, tianjin, minnan).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz a 48 kHz con prosodia inferida del texto, adecuado para narrativa larga; la ventana de 8192 tokens permite procesar pasajes extensos por segmentos sin perder coherencia estilística.
- Atención al cliente con voz sintética: la clonación controlable permite mantener un timbre de marca consistente y modular el tono (por ejemplo, más cercano o más formal) según el contexto de la conversación, con streaming para respuestas de baja latencia.
- Doblaje y localización multilingüe: al soportar 30 idiomas sin etiqueta explícita, un mismo pipeline puede generar versiones en español, inglés, árabe o japonés conservando el timbre del hablante original mediante clonación.
- Asistentes de voz embebidos y aplicaciones de accesibilidad: con ~8 GB de VRAM y RTF de ~0,30 en una RTX 4090, es viable en estaciones de trabajo con GPU de consumo para lectores de pantalla o interfaces conversacionales.
- Creación de contenido y videojuegos: el voice design permite generar voces de personajes a partir de descripciones textuales, sin necesidad de grabar actores para prototipos o NPC.
- Prototipado de productos de voz: la licencia Apache-2.0 y la instalación vía `pip install voxcpm` facilitan integrar TTS en demos y MVPs sin coste de licencia.
- Generación de datasets de audio sintético: la clonación de alta fidelidad y el control de estilo permiten producir corpus de voz con variaciones controladas de emoción y ritmo para entrenar otros sistemas.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados estado del arte o competitivos en los benchmarks principales de TTS zero-shot y controlable (Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test), pero remite las tablas completas al repositorio de GitHub y no incluye cifras numéricas en la información disponible. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

Los únicos datos de rendimiento cuantitativos disponibles son de eficiencia: RTF de ~0,30 en RTX 4090 en modo estándar y ~0,13 con Nano-vLLM, con un consumo de VRAM de ~8 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB en bfloat16 según la model card.
- GPU recomendadas: NVIDIA RTX 4090 (RTF ~0,30; ~0,13 con Nano-vLLM). No se especifican requisitos para A100 o H100, aunque por el tamaño del modelo (2,29 B) cabría esperar mejor throughput en esas GPU; no disponible como dato confirmado.
- GPU de consumo: sí cabe en GPU de consumo con al menos 8 GB de VRAM; la RTX 4090 es el caso documentado.
- Requisitos de software: Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0.
- Opciones de despliegue: paquete oficial `voxcpm` (`pip install voxcpm`), con API `VoxCPM.from_pretrained` y generación por streaming; aceleración mediante Nano-vLLM (repositorio `a710128/nanovllm-voxcpm`). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF ~0,30 en RTX 4090 estándar y ~0,13 con Nano-vLLM, lo que implica generación más rápida que tiempo real en ambos casos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Salida de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxCPM2 | ~2,29 B | 8192 tokens | 30 | 48 kHz | Apache-2.0 | Hugging Face, pip |
| Alternativas de la misma categoría (TTS zero-shot abiertos) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Se recomienda consultar las tablas de benchmarks del repositorio de GitHub de OpenBMB para contrastar con otros sistemas TTS.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos por idioma, género o acento; al entrenarse con más de 2 millones de horas de habla multilingüe, es probable que herede sesgos de la distribución del corpus, pero no se cuantifican.
- Riesgo de alucinación acústica: en textos ambiguos o con puntuación atípica, la prosodia inferida puede desviarse; los parámetros `cfg_value` e `inference_timesteps` permiten ajustar fidelidad, pero no eliminan el riesgo.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; la licencia Apache-2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el integrador.
- El contexto máximo es de 8192 tokens de secuencia; textos muy largos deben segmentarse, lo que puede introducir discontinuidades de prosodia entre fragmentos.
- La información sobre cuantización es inexistente: no se documentan variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware con menos de ~8 GB de VRAM.
- No se detalla la composición del dataset de entrenamiento ni si hubo alineación con RLHF/DPO, lo que dificulta evaluar el control de toxicidad o la robustez ante entradas adversarias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor del espacio (`abhishekkaith`) no coincide con la organización OpenBMB que figura en el código de ejemplo (`openbmb/VoxCPM2`); conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se documentan integraciones con servidores de inferencia estándar (vLLM, TGI) salvo Nano-vLLM, lo que puede complicar el escalado en clústeres.

## Enlaces

- Hugging Face: https://huggingface.co/abhishekkaith/VoxCPM2
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM
- Documentación: https://voxcpm.readthedocs.io/en/latest/
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Discord: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://openbmb.cn/docs/
- Aceleración Nano-vLLM: https://github.com/a710128/nanovllm-voxcpm
- Paper (arXiv): https://arxiv.org/abs/2509.24650
