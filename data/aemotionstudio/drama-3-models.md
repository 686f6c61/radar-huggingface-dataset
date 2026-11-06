# AEmotionStudio/drama-3-models

## Resumen

Drama 3 es un modelo de texto a voz (TTS) con clonación de voz y soporte multi-hablante desarrollado por Fish Audio. Este repositorio concreto, `AEmotionStudio/drama-3-models`, no es el modelo original: se trata de un espejo (mirror) del checkpoint oficial cuantizado a int4 (`fishaudio/drama-3-int4`, commit `a6f58869`), reempaquetado por AEmotionStudio para su estación de trabajo de IA Mæstræa. Los pesos son idénticos byte a byte a los del repositorio upstream; lo único que cambia es el formato de algunos ficheros auxiliares (por ejemplo, el códec de audio de 44,1 kHz se convierte de `codec.pth` a `codec.safetensors` sin alterar ningún tensor).

El modelo suma 6.857.815.168 parámetros y emplea una arquitectura de mezcla de expertos (MoE) en la que los expertos enrutados están cuantizados a int4 con GPTQ simétrico mientras el resto de capas permanece en bf16. Esa decisión de diseño explica el tamaño del repositorio (24 GB) y el perfil de memoria tan particular: unos 16,6 GB de expertos int4 que pueden transmitirse desde shards mapeados en memoria, más capas densas, torre de libros de códigos y decodificador del códec que permanecen residentes en GPU.

Su relevancia ahora es doble. Por un lado, demuestra que un modelo TTS de casi 7.000 millones de parámetros puede ejecutarse en una GPU de consumo de 12 GB (el autor reporta entre 2 y 3 veces el tiempo real en una RTX 4070) combinando cuantización int4 con streaming de expertos. Por otro, el ecosistema de inferencia ya no depende de `fish-speech`: Mæstræa usa código propio con licencia Apache-2.0 portado desde sglang-omni y vllm-omni, lo que abre la puerta a integrarlo en stacks de serving estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados cuantizados a int4 y capas densas en bf16; incluye torre de libros de códigos y decodificador de códec de audio a 44,1 kHz |
| Parametros totales | 6.857.815.168 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 GPTQ simétrico (expertos enrutados); bf16 en el resto de capas |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License, Version 1.0 (titular: 39 AI, INC.) |
| Formato de pesos | safetensors (12 shards + `model.safetensors.index.json`), más `codec.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que se deduce del empaquetado: un transformer con mezcla de expertos en el que los expertos enrutados concentran la mayor parte de los parámetros y están cuantizados a int4 mediante GPTQ simétrico, mientras las capas densas, la torre de libros de códigos y el decodificador del códec se mantienen en bf16. El códec de audio opera a 44,1 kHz y se distribuye como safetensors con todos los tensores idénticos al `codec.pth` original. No se han publicado en esta información datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en el despliegue: el diseño permite mantener residentes en GPU las capas densas, la torre de libros de códigos y el decodificador, mientras los 16,6 GB de expertos int4 se transmiten bajo demanda desde shards mapeados en memoria a través de una caché en GPU. Según el autor, esto habilita inferencia en una RTX 4070 a 2-3× tiempo real. Además, el pipeline de Mæstræa renderiza escena por línea para que cada personaje conserve su propia voz, y muestrea el token principal sin top-k (el autor advierte que un límite de top-k atrapa las voces clonadas en silencio).

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida de audio a 44,1 kHz.
- Clonación de voz a partir de referencias de audio.
- Generación multi-hablante: el pipeline asociado renderiza línea por línea asignando una voz distinta a cada personaje.
- Cuantización int4 lista para producción con pesos idénticos al checkpoint oficial de Fish Audio.
- Integración con el stack de inferencia de Mæstræa (código Apache-2.0 portado de sglang-omni y vllm-omni).
- Compatibilidad declarada con el ecosistema PyTorch y safetensors.
- No se ha documentado en esta información soporte de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Doblaje y localización de contenido audiovisual: el modo multi-hablante con renderizado línea a línea permite asignar y mantener una voz distinta por personaje a lo largo de una escena, lo que encaja con flujos de doblaje donde cada línea debe conservar coherencia de timbre.
- Audiolibros y narración con varios personajes: la clonación de voz permite fijar voces de narrador y personajes, y el pipeline por línea evita que se mezclen identidades vocales entre intervenciones.
- Prototipado de asistentes de voz en GPU de consumo: con 12 GB de VRAM y streaming de expertos, un equipo con RTX 4070 puede iterar sobre voces y guiones sin depender de una API externa, a un coste de 2-3× tiempo real.
- Generación de voces para videojuegos y prototipos de preproducción: la clonación y el multi-hablante permiten generar diálogos de prueba con identidades vocales separadas antes de contratar actores definitivos.
- Investigación en TTS y cuantización: al ser un espejo byte-idéntico del checkpoint int4 oficial, sirve como referencia reproducible para estudiar el impacto de GPTQ simétrico en expertos enrutados y en la calidad de voces clonadas.
- Integración en estaciones de trabajo de IA autoalojadas: el repositorio está empaquetado específicamente para Mæstræa (AI ▸ Voice ▸ Drama 3), de modo que encaja en despliegues locales con código de inferencia Apache-2.0 y sin dependencia de `fish-speech`.
- Generación de voice-over para contenido interno: siempre que se respete la licencia y el consentimiento de las voces clonadas, el modelo puede producir locuciones para vídeos corporativos o demos con una GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado por el autor es operativo: aproximadamente 2-3× tiempo real en una RTX 4070 con 12 GB de VRAM, manteniendo residentes las capas densas, la torre de libros de códigos y el decodificador, y transmitiendo 16,6 GB de expertos int4 desde shards mapeados en memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB es el mínimo reportado por el autor para el modo con streaming de expertos (capas densas, torre de libros de códigos y decodificador residentes; 16,6 GB de expertos int4 en caché).
- GPU recomendadas: RTX 4070 (12 GB) como caso validado por el autor; GPUs con más VRAM permitirían cachear una proporción mayor de expertos y reducir la latencia.
- Cabe en GPU de consumo: sí, al menos en RTX 4070 de 12 GB según el autor.
- Opciones de despliegue: código de inferencia propio de Mæstræa (`backend/ai/drama3_vendor`, Apache-2.0, portado de sglang-omni y vllm-omni). No se usa `fish-speech`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para estos pesos.
- Latencia y throughput: aproximadamente 2-3× tiempo real en RTX 4070 con 12 GB. No hay datos de throughput en otros hardware.
- Almacenamiento: el repositorio ocupa 24 GB, por lo que conviene disponer de disco rápido para el mapeo en memoria de los shards.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AEmotionStudio/drama-3-models (este repo) | 6.857.815.168 | no disponible | Fish Audio Community License 1.0 | Hugging Face, mirror | int4 GPTQ en expertos; ejecutable en 12 GB VRAM con streaming |
| fishaudio/drama-3 | no disponible en esta informacion | no disponible | Fish Audio Community License 1.0 | Hugging Face, upstream | Checkpoint original en precisión completa; referencia de calidad |
| fishaudio/drama-3-int4 | no disponible en esta informacion | no disponible | Fish Audio Community License 1.0 | Hugging Face, upstream | Checkpoint int4 oficial del que este repositorio es espejo byte-idéntico |

No se dispone en la información proporcionada de modelos comparables de otros desarrolladores (por ejemplo, alternativas de TTS con clonación) con parámetros, contexto o benchmarks verificables, por lo que no se incluyen en la tabla para no inventar datos.

## Limitaciones y advertencias

- Licencia restrictiva: uso gratuito solo para investigación y fines no comerciales; el uso comercial es gratuito únicamente si el usuario y sus afiliados facturan menos de 500.000 USD anuales. Por encima de ese umbral se requiere licencia de Fish Audio (business@fish.audio).
- Ofrecer Drama 3 como servicio de voz alojado (API, o una app cuyo propósito principal sea TTS, voice-over o clonación para terceros) exige siempre una licencia separada.
- Prohibido clonar o imitar la voz de una persona real sin su consentimiento, así como su uso para suplantación, fraude o acoso.
- Prohibido eliminar marcas de agua o señales de procedencia; cualquiera a quien se le haga disponible la generación debe quedar sujeto a las mismas restricciones.
- Prohibido usar las salidas para entrenar otros modelos de voz, audio o fundacionales.
- Los productos construidos con el modelo deben mostrar "Built with Fish Audio".
- Riesgo de alucinación y artefactos de audio: no se han publicado evaluaciones de calidad, naturalidad ni robustez en la información disponible; la cuantización int4 de los expertos puede afectar a la fidelidad de voces clonadas.
- El autor advierte de un fallo concreto: aplicar un límite de top-k en el muestreo del token principal atrapa las voces clonadas en silencio, por lo que el muestreo debe hacerse sin top-k.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada; no se puede planificar el troceado de guiones largos con datos fiables.
- Dependencia de un stack de inferencia específico (Mæstræa); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI estándar.
- El repositorio es un espejo: los bugs, correcciones y mejoras deben consultarse en el repositorio upstream de Fish Audio, no aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AEmotionStudio/drama-3-models
- Modelo base int4 upstream: https://huggingface.co/fishaudio/drama-3-int4
- Modelo base upstream: https://huggingface.co/fishaudio/drama-3
- Página del producto Drama 3: https://fish.audio/drama-3/
- Repositorio de Mæstræa (AEmotionStudio): https://github.com/AEmotionStudio
- Código de inferencia de referencia sglang-omni: https://github.com/sgl-project/sglang-omni
- Código de inferencia de referencia vllm-omni: https://github.com/vllm-project/vllm-omni
