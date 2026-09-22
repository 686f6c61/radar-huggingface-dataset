# LPmmKK/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) de 2.290.004.544 parámetros (unos 2,29B) que combina un backbone de lenguaje derivado de MiniCPM-4 con decodificación por difusión autoregresiva y sin tokenizador de texto. La ficha de HuggingFace analizada corresponde al repositorio LPmmKK/VoxCPM2, si bien su model card remite al proyecto OpenBMB/VoxCPM y al punto de descarga openbmb/VoxCPM2, por lo que se trata de una publicación espejo de terceros. Se distribuye en formato safetensors (bfloat16) bajo licencia Apache-2.0, con un repositorio de 5 GB.

El modelo resuelve la síntesis multilingüe sin etiquetas de idioma: acepta texto directamente en 30 idiomas (español, inglés, chino, árabe, hindi, japonés, swahili, entre otros) más nueve dialectos del chino, y genera audio a 48 kHz mediante el módulo AudioVAE V2, que aplica superresolución integrada a partir de referencias de 16 kHz. Ofrece tres modos de control de voz: diseño de voz desde una descripción en lenguaje natural, clonación controlable desde un clip corto con guía de estilo y clonación de alta fidelidad con audio de referencia y su transcripción.

Su relevancia actual se apoya en tres cifras concretas: un RTF de aproximadamente 0,30 en una NVIDIA RTX 4090 (unos 0,13 con Nano-VLLM), un consumo de VRAM en torno a 8 GB y una licencia permisiva para uso comercial, sobre un entrenamiento declarado de más de 2 millones de horas de habla multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión autoregresiva sin tokenizador (Tokenizer-free Diffusion Autoregressive); pipeline LocEnc → TSLM → RALM → LocDiT |
| Backbone | MiniCPM-4 |
| Parámetros totales | 2.290.004.544 (~2,29B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de secuencia máxima; tasa de tokens de lenguaje de 6,25 Hz |
| Tipos de cuantización | No disponible (el modelo se publica en bfloat16; no se documentan variantes cuantizadas) |
| Idiomas soportados | 30: árabe, birmano, chino, danés, neerlandés, inglés, finés, francés, alemán, griego, hebreo, hindi, indonesio, italiano, japonés, jemer, coreano, lao, malayo, noruego, polaco, portugués, ruso, español, suajili, sueco, tagalo, tailandés, turco y vietnamita. Dialectos del chino: sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjin y min nan |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Precisión de pesos | bfloat16 |
| Audio de salida | 48 kHz (entrada de referencia admitida a 16 kHz, con superresolución interna vía AudioVAE V2) |
| Datos de entrenamiento | Más de 2 millones de horas de habla multilingüe |
| VRAM estimada | ~8 GB |
| RTF | ~0,30 en RTX 4090 (estándar) / ~0,13 con Nano-VLLM |
| Librería | voxcpm (pip install voxcpm) |
| Requisitos de entorno | Python ≥ 3.10, PyTorch ≥ 2.5.0, CUDA ≥ 12.0 |
| Tamaño del repositorio | 5,0 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión autoregresiva sin tokenizador de texto, organizada en cuatro etapas: LocEnc (codificación local), TSLM (modelo de lenguaje de texto), RALM (modelo de lenguaje autorregresivo de audio) y LocDiT (transformador de difusión local). El backbone lingüístico deriva de MiniCPM-4 y suma 2B parámetros en total. El componente de audio es AudioVAE V2, un VAE con codificación y decodificación asimétricas que acepta referencias de 16 kHz y produce salida a 48 kHz mediante superresolución integrada, sin necesidad de un remuestreador externo. La tasa de emisión de tokens de lenguaje es de 6,25 Hz y la secuencia máxima es de 8192 tokens, lo que acota la duración de audio procesable por pasada. La generación se controla con parámetros como `cfg_value` (2.0 en los ejemplos de la model card) e `inference_timesteps` (10 pasos de difusión en los ejemplos documentados).

El entrenamiento se realizó sobre más de 2 millones de horas de habla multilingüe, según declara el autor. La información proporcionada no especifica la composición exacta del dataset, la proporción por idioma ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Como innovaciones destacables, la model card cita la ausencia de tokenizador de texto, la superresolución integrada en el VAE de audio, el modo de diseño de voz sin audio de referencia y una modalidad de clonación por continuación de audio que usa referencia más transcripción.

## Capacidades

- Generación de voz multilingüe a partir de texto en 30 idiomas sin etiqueta de idioma explícita.
- Síntesis de dialectos del chino (sichuanés, cantonés, wu, dongbei, henanés, shaanxi, shandong, tianjin y min nan).
- Diseño de voz (voice design): creación de una voz nueva a partir de una descripción en lenguaje natural que incluye género, edad, tono, emoción y ritmo, sin audio de referencia.
- Clonación controlable: clonación desde un clip corto con guía de estilo opcional que modula emoción, velocidad y expresión preservando el timbre.
- Clonación de alta fidelidad (ultimate cloning): entrada de audio de referencia junto con su transcripción exacta para clonación por continuación de audio.
- Salida de audio a 48 kHz con superresolución integrada desde referencias de 16 kHz.
- Síntesis sensible al contexto: infiere prosodia y expresividad a partir del contenido del texto.
- Generación en streaming con fragmentos incrementales (API `generate_streaming`), con RTF de ~0,30 en RTX 4090.
- Ajuste fino: la model card incluye un apartado de fine-tuning (contenido truncado en la información disponible).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible; el modelo es un sistema de text-to-speech, no un modelo de lenguaje conversacional.
- Capacidades de visión, audio de entrada o modo de razonamiento explícito: no disponible.

## Casos de uso

- Audiolibros y narración larga: el modelo acepta texto en 30 idiomas y genera salida a 48 kHz apta para publicación; con 8192 tokens de secuencia máxima conviene segmentar por capítulos y encadenar fragmentos mediante la API de streaming.
- Doblaje y localización de vídeo: la clonación controlable permite mantener el timbre de un locutor y ajustar velocidad y emoción para encajar con la duración del plano original, con salida de 48 kHz alineada con la cadencia de vídeo.
- Atención al cliente automatizada con voz: el RTF de ~0,30 (y ~0,13 con Nano-VLLM) y el streaming hacen viable la respuesta hablada en tiempo casi real dentro de un pipeline de diálogo, donde el LLM aporta el texto y VoxCPM2 la locución.
- Diseño de voces para videojuegos y personajes: el modo voice design genera voces nuevas a partir de descripciones textuales, lo que reduce la dependencia de sesiones de grabación y permite iterar sobre el casting vocal antes de contratar a un actor.
- Accesibilidad y lectura de pantalla: conversión de artículos, documentación técnica y contenidos web a voz, con cobertura multilingüe para usuarios que necesitan el mismo contenido en varios idiomas.
- Producción de pódcast y boletines de audio: generación automatizada de episodios a partir de guiones en texto, con voces consistentes entre entregas gracias al uso de una referencia fija para la clonación.
- Preservación de la voz de un hablante: clonación de alta fidelidad a partir de audio de referencia y su transcripción, aplicable a la conservación de locuciones personales con consentimiento explícito del titular.
- Material educativo multilingüe: generación de la misma lección en varios de los 30 idiomas soportados y en dialectos del chino, reutilizando una única voz para mantener coherencia de marca.

## Benchmarks y rendimiento

La model card indica que VoxCPM2 alcanza resultados estado del arte o competitivos en las evaluaciones Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test, y remite al repositorio de GitHub para las tablas completas. La información proporcionada no incluye las cifras concretas.

| Benchmark | Resultado |
|---|---|
| Seed-TTS-eval | No disponible (citado como estado del arte o competitivo, sin cifras) |
| CV3-eval | No disponible (citado como estado del arte o competitivo, sin cifras) |
| InstructTTSEval | No disponible (citado como estado del arte o competitivo, sin cifras) |
| MiniMax Multilingual Test | No disponible (citado como estado del arte o competitivo, sin cifras) |
| RTF en RTX 4090 | ~0,30 estándar; ~0,13 con Nano-VLLM |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB según la model card, con pesos en bfloat16 y 2,29B parámetros.
- GPU recomendadas: NVIDIA RTX 4090 para los valores de RTF declarados (~0,30 estándar, ~0,13 con Nano-VLLM); no se documentan cifras para A100, H100 ni otras GPU de centro de datos.
- GPU de consumo: sí cabe en tarjetas con al menos 8 GB de VRAM, como la RTX 3060 de 8 GB, la RTX 4060 Ti o las RTX 4070, 4080 y 4090. No se documentan pruebas específicas por modelo de tarjeta más allá de la RTX 4090.
- Entorno software: Python ≥ 3.10, PyTorch ≥ 2.5.0 y CUDA ≥ 12.0.
- Opciones de despliegue: librería oficial `voxcpm` (instalable con `pip install voxcpm`, carga mediante `VoxCPM.from_pretrained`), API de streaming con `generate_streaming` y aceleración mediante Nano-VLLM (repositorio a710128/nanovllm-voxcpm). No se documenta compatibilidad con vLLM estándar, llama.cpp, Ollama ni TGI.
- Parámetros de inferencia documentados: `cfg_value=2.0`, `inference_timesteps=10` y `load_denoiser=False`.
- Latencia y throughput: el RTF declarado implica que 1 segundo de audio se genera en torno a 0,30 segundos en RTX 4090, y aproximadamente 0,13 segundos con Nano-VLLM. No se proporcionan cifras de throughput agregado ni de latencia hasta el primer fragmento.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada para el resto de modelos de la categoría. La tabla siguiente enumera alternativas de text-to-speech open source del mismo orden de magnitud (2B parámetros o menos) que pueden servir como referencia de evaluación, marcando como no disponible todo dato que no consta en la documentación analizada.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| VoxCPM2 (LPmmKK / OpenBMB) | ~2,29B | 8192 tokens (6,25 Hz) | 30 + 9 dialectos del chino | Apache-2.0 | safetensors, librería voxcpm | RTF ~0,30 en RTX 4090 |
| XTTS-v2 (Coqui) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| CosyVoice 2 (Alibaba) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| F5-TTS | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los resultados de los benchmarks Seed-TTS-eval, CV3-eval, InstructTTSEval y MiniMax Multilingual Test publicados por el proyecto VoxCPM permitirían una comparación cuantitativa directa, pero las cifras no están incluidas en la información disponible para esta ficha.

## Limitaciones y advertencias

- Repositorio de terceros: el artefacto analizado está publicado por el usuario LPmmKK con 0 descargas y 0 me gusta, y su model card apunta a openbmb/VoxCPM2. Antes de usarlo en producción conviene verificar la integridad de los pesos contra el repositorio oficial del proyecto, dado el riesgo de publicaciones espejo no verificadas.
- Uso indebido de la clonación de voz: la clonación de alta fidelidad y la clonación controlable permiten replicar el timbre de una persona a partir de un clip corto, lo que habilita suplantaciones, fraudes o deepfakes. Es imprescindible recabar consentimiento explícito del titular de la voz y cumplir la normativa aplicable (RGPD y regulación europea sobre IA).
- Alucinación y errores de prosodia: como sistema generativo de audio, puede producir pronunciaciones incorrectas, énfasis inadecuado o artefactos en textos con nombres propios, siglas, números o puntuación atípica. No se documentan tasas de error ni métricas de inteligibilidad.
- Limitación de contexto: la secuencia máxima de 8192 tokens, con una tasa de 6,25 tokens de lenguaje por segundo, acota la duración sintetizable por pasada y obliga a segmentar en piezas y gestionar las transiciones.
- Cobertura lingüística: los 30 idiomas y los 9 dialectos declarados no agotan el catálogo mundial; otras lenguas y acentos no están soportados y no se documenta el rendimiento por idioma.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, de género o de acento en las voces generadas ni en los datos de entrenamiento de más de 2 millones de horas.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero no transfiere derechos sobre las voces clonadas ni sobre los datos de referencia utilizados.
- Datos incompletos: se desconoce la composición del dataset de entrenamiento, si hubo etapas de RLHF o DPO, y no se publican cifras numéricas de benchmarks en la información disponible.
- Metadatos: la fecha de creación del repositorio indicada en la ficha es 2026-09-22, posterior a la fecha del preprint asociado (arXiv:2509.24650), un extremo que conviene contrastar en el repositorio oficial.
- Requisitos: la inferencia exige GPU con CUDA ≥ 12.0; no se documenta una ruta de ejecución en CPU, en Apple Silicon ni en GPU de otros fabricantes.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/LPmmKK/VoxCPM2
- Repositorio GitHub del proyecto: https://github.com/OpenBMB/VoxCPM
- Tablas de rendimiento del proyecto: https://github.com/OpenBMB/VoxCPM#-performance
- Documentación (ReadTheDocs): https://voxcpm.readthedocs.io/en/latest/
- Guía de inicio rápido: https://voxcpm.readthedocs.io/en/latest/quickstart.html
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras de audio: https://openbmb.github.io/voxcpm2-demopage
- Aceleración con Nano-VLLM: https://github.com/a710128/nanovllm-voxcpm
- Preprint en arXiv: https://arxiv.org/abs/2509.24650
- Servidor de Discord del proyecto: https://discord.gg/KZUx7tVNwz
- Wiki de MiniCPM: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Punto de descarga oficial referenciado en la model card: openbmb/VoxCPM2
