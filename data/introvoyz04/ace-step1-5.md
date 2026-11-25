# introvoyz04/Ace-Step1.5

## Resumen

ACE-Step 1.5 es un modelo fundacional de generación de música a partir de texto desarrollado conjuntamente por ACE Studio y StepFun. Se distribuye con licencia MIT y está diseñado específicamente para uso comercial, entrenado sobre un corpus compuesto por música con licencia profesional, material libre de derechos y datos sintéticos generados mediante conversión MIDI-a-audio. El repositorio de Hugging Face corresponde a la variante `acestep-v15-turbo`, la más optimizada del zoo de modelos.

La arquitectura es híbrida: un modelo de lenguaje (derivado de la familia Qwen3, en variantes de 0,6B, 1,7B y 4B) actúa como planificador que transforma la consulta del usuario en un "plano" completo de la canción —metadatos, letra, subtítulos y estructura— mediante chain-of-thought, y guía a un Diffusion Transformer (DiT) que sintetiza el audio final. El alineamiento se realiza mediante reinforcement learning intrínseco, sin depender de modelos de recompensa externos ni de preferencias humanas.

Su relevancia radica en la eficiencia: genera una canción completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, y puede ejecutarse en local con menos de 4 GB de VRAM. Además de text2music, soporta edición musical (cover, repaint, extracción, conversión vocal-a-BGM) y mantiene la adherencia al prompt en más de 50 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM planificador (basado en Qwen3) + Diffusion Transformer (DiT) |
| Parametros totales | no disponible (el repo ocupa 10,1 GB; el zoo incluye LMs de 0,6B, 1,7B y 4B y varios DiT) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 50+ idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers y diffusers) |

## Arquitectura y entrenamiento

ACE-Step 1.5 combina dos componentes. Por un lado, un modelo de lenguaje derivado de Qwen3 (en tamaños 0,6B, 1,7B y 4B) que actúa como planificador omnicapaz: recibe la consulta del usuario y genera un plano estructurado de la canción, incluyendo metadatos, letra y subtítulos, con razonamiento chain-of-thought. Por otro, un Diffusion Transformer (DiT) que recibe ese plano y sintetiza el audio. La variante `turbo` del DiT emplea 8 pasos de muestreo y prescinde de classifier-free guidance (CFG), lo que explica su baja latencia.

El entrenamiento se apoya en tres fuentes de datos: pistas musicales con licencia profesional, un amplio corpus de dominio público y libre de derechos, y datos sintéticos de alta calidad generados mediante conversión MIDI-a-audio. El alineamiento se logra mediante reinforcement learning intrínseco, que según el autor elimina los sesgos de los modelos de recompensa externos y de las preferencias humanas. El zoo de modelos incluye variantes base, SFT, turbo y turbo-rl (esta última aún no publicada), con distintas capacidades de extracción, repintado y completado.

## Capacidades

- Generación de música a partir de texto (text2music) con control estilístico preciso.
- Generación de covers a partir de audio de referencia.
- Repintado (repaint) de secciones concretas de una pista.
- Extracción de stems o componentes de una mezcla.
- Conversión de voz a música de fondo (vocal-to-BGM).
- Completado de composiciones (lego/complete según la variante del DiT).
- Planificación mediante LM con chain-of-thought para metadatos, letra y subtítulos.
- Comprensión de audio (capacidad variable según el tamaño del LM: media en 0,6B y 1,7B, fuerte en 4B).
- Adherencia al prompt en más de 50 idiomas.
- Escalado desde bucles cortos hasta composiciones de 10 minutos.

## Casos de uso

- Producción musical asistida: un compositor introduce una descripción textual y obtiene un boceto completo con letra y estructura en segundos, que luego refina con repaint o cover.
- Creación de bandas sonoras para vídeo y publicidad: la licencia MIT y el entrenamiento con datos conformes permiten usar la música generada comercialmente sin riesgo legal.
- Generación de música de fondo para streaming y podcasts: la baja latencia (menos de 10 s en una RTX 3090) permite generar pistas bajo demanda durante la producción.
- Herramientas de edición musical: la capacidad de repaint y extracción permite construir interfaces que aíslen secciones o sustituyan instrumentos conservando el resto de la mezcla.
- Localización multilingüe de canciones: el soporte de más de 50 idiomas facilita generar letras y voces adaptadas a mercados distintos.
- Prototipado rápido en hardware de consumo: con menos de 4 GB de VRAM, desarrolladores individuales pueden iterar localmente sin infraestructura de datacenter.
- Investigación en generación de audio: la combinación LM + DiT con RL intrínseco sirve como base para experimentos de alineamiento sin reward models externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una figura de evaluación sin cifras textuales y una tabla cualitativa del zoo de modelos que clasifica calidad y diversidad como "Medium", "High" o "Very High" según la variante. Los únicos datos cuantitativos proporcionados son de latencia: menos de 2 s por canción en A100 y menos de 10 s en RTX 3090.

## Requisitos de hardware

- VRAM: menos de 4 GB para ejecución local según el autor.
- GPU recomendadas: A100 (menos de 2 s por canción) y RTX 3090 (menos de 10 s por canción).
- Cabe en GPU de consumo: sí, el autor indica compatibilidad con hardware de consumo por debajo de 4 GB de VRAM.
- Opciones de despliegue: transformers y diffusers (según los tags del repo); el ecosistema incluye una demo en Hugging Face Spaces. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: menos de 2 s por canción en A100 y menos de 10 s en RTX 3090 con la variante turbo de 8 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step 1.5 (turbo) | no disponible (repo 10,1 GB) | no disponible | MIT | Sí, explícito | Hugging Face, ModelScope, Space |
| acestep-v15-base | no disponible | no disponible | MIT | Sí | Hugging Face |
| acestep-v15-sft | no disponible | no disponible | MIT | Sí | Hugging Face |
| acestep-v15-turbo-rl | no disponible | no disponible | MIT | Sí | Pendiente de publicación |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada para establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- No se han publicado métricas cuantitativas de calidad (FAD, CLAP, MOS) en la información disponible, solo evaluaciones cualitativas.
- El modelo puede generar material musical similar a obras existentes; aunque el entrenamiento se declara conforme, no se detalla el mecanismo de filtrado.
- La calidad y diversidad varían según la variante: la turbo prioriza calidad sobre diversidad y fine-tunability.
- El tamaño del LM condiciona la comprensión de audio y la capacidad de composición (media en 0,6B y 1,7B, fuerte en 4B).
- No se especifican sesgos culturales o de género en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no detalla obligaciones de atribución adicionales más allá de las de la propia licencia.
- No se documentan límites de longitud de prompt ni de contexto del LM.

## Enlaces

- Hugging Face: https://huggingface.co/introvoyz04/Ace-Step1.5
- Modelo oficial turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo base: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
- Colección ACE-Step 1.5: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Demo (Space): https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Tech report (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub: https://github.com/ace-step/ACE-Step-1.5
- Discord: https://discord.gg/PeWDxrkdj7
