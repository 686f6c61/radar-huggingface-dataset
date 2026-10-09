# Aero-Ex/OmniVoice

## Resumen

OmniVoice es un modelo de sintesis de voz (text-to-speech) con capacidad de clonacion de voz zero-shot y diseno de voz, distribuido por el usuario Aero-Ex en HuggingFace como checkpoints de fichero unico para ComfyUI. No es un entrenamiento propio: se trata de un reempaquetado de los pesos de k2-fsa/OmniVoice, un sistema que combina un LLM Qwen3 como backbone autorregresivo con el codec de audio HiggsAudioV2. El repositorio anade valor practico al integrar la configuracion, la configuracion del codec y el tokenizer BPE dentro de los metadatos del propio safetensors, de modo que no hacen falta ficheros auxiliares para cargarlo.

El modelo resuelve dos tareas concretas: clonacion de voz a partir de un audio de referencia con su transcripcion, y diseno de voz a partir de una instruccion textual (genero, edad, tono, susurro, acento o dialecto). Ademas incorpora etiquetas de vocalizacion que el modelo pronuncia literalmente, como `[laughter]`, `[sigh]` o variantes de `[question-*]` y `[surprise-*]`, lo que permite controlar la expresividad sin cambiar de modelo.

Es relevante ahora porque reduce la barrera de entrada para integrar TTS de alta calidad en flujos de trabajo de ComfyUI sin dependencias de Python adicionales, y porque ofrece dos niveles de peso (calidad completa e INT8) con tamanos muy distintos. La informacion publicada no incluye numero de parametros, licencia ni resultados de benchmarks; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM autorregresivo Qwen3 como backbone + codec de audio HiggsAudioV2 |
| Parametros totales | no disponible (checkpoint completo de 3,3 GB e INT8 de 1,1 GB) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | precision completa y INT8 (INT8-ConvRot) |
| Idiomas soportados | multilingue (sin listado de idiomas concreto) |
| Licencia | no disponible |
| Formato de pesos | safetensors de fichero unico, con config, config del codec y tokenizer BPE embebidos como metadatos |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje Qwen3, que actua como generador autorregresivo de tokens de audio, con el codec neural HiggsAudioV2, responsable de convertir esos tokens en forma de onda. El paquete distribuido en este repositorio no modifica el modelo: solo lo reempaqueta en safetensors autocontenidos, con la configuracion, la configuracion del codec y el tokenizer BPE embebidos en los metadatos, para su uso directo en ComfyUI mediante el nodo `Load OmniVoice Model`. El autor remite al repositorio upstream (k2-fsa/OmniVoice) y al paper arXiv:2604.00688 para los detalles de entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones tecnicas propias de este reempaquetado mas alla de la conversion a INT8 con la variante ConvRot y de la generacion con parametros por defecto de 32 pasos, guidance 2.0 y 25 tokens/s, con la posibilidad de reducir a 16 pasos para aproximadamente la mitad del tiempo de generacion. Los textos de mas de 30 segundos se dividen automaticamente en fragmentos de unos 15 segundos y se unen con cross-fade.

## Capacidades

- Sintesis de voz multilingue a partir de texto, con `pipeline_tag: text-to-speech`.
- Clonacion de voz zero-shot mediante `ref_audio` junto con `ref_text`; la transcripcion es obligatoria y el modelo no incorpora ASR.
- Diseno de voz mediante cadena `instruct`: control de genero, edad, tono (pitch), voz susurrada, acento en ingles y dialecto en chino.
- Vocalizacion expresiva mediante etiquetas que el modelo pronuncia literalmente: `[laughter]`, `[sigh]`, `[question-en]`, `[question-ah]`, `[question-oh]`, `[question-ei]`, `[question-yi]`, `[confirmation-en]`, `[surprise-ah]`, `[surprise-oh]`, `[surprise-wa]`, `[surprise-yo]`, `[dissatisfaction-hnn]`.
- Segmentacion automatica de textos largos (mas de ~30 segundos) en fragmentos de ~15 segundos con cross-fade entre ellos.
- Integracion nativa con ComfyUI mediante el paquete ComfyUI-OmniVoice-Native, sin necesidad de `pip install`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de entrada mas alla del audio de referencia para clonacion.

## Casos de uso

- Doblaje y localizacion de contenido: el caracter multilingue y el control de acento o dialecto permiten generar pistas de voz en distintos idiomas o variantes a partir del mismo texto base.
- Clonacion de la voz de un locutor con consentimiento: aportando un audio de referencia y su transcripcion exacta, se pueden producir narraciones nuevas manteniendo el timbre original, util para audiolibros o cursos.
- Produccion de audiolibros y podcasts: la division automatica de textos largos en fragmentos de 15 segundos con cross-fade facilita procesar capitulos completos sin gestion manual de cortes.
- Prototipado de personajes para videojuegos o animacion: el diseno de voz por instruccion permite iterar rapidamente sobre genero, edad, tono y caracteristicas como el susurro antes de contratar una locucion final.
- Generacion de voces expresivas para contenido corto: las etiquetas de vocalizacion (`[laughter]`, `[sigh]`, `[surprise-ah]`) permiten obtener risas, suspiros y entonaciones interrogativas sin editar audio a mano.
- Asistentes de voz y sistemas de respuesta hablada: el modelo se puede invocar desde un flujo de ComfyUI para convertir texto dinamico en audio, con la ventaja de que la generacion es local y no depende de APIs externas.
- Accesibilidad y lectura de contenido: conversion de articulos, documentacion o correos a voz sintetica clonando la voz del propio usuario para mantener familiaridad en la escucha.
- Pruebas A/B de voces en marketing: generar varias tomas con la misma semilla o con instrucciones distintas para comparar percepcion antes de fijar la version definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es una comparacion interna entre los dos checkpoints: la version INT8-ConvRot mantiene aproximadamente un 86% de coincidencia top-1 con el checkpoint de calidad completa en prompts simples, y el autor indica que la version completa es mas robusta para etiquetas y prompts de diseno de voz. No hay datos de MMLU, HumanEval, GSM8K ni de metricas tipicas de TTS como WER, MOS o similitud de hablante.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. A partir del tamano de los ficheros, el checkpoint completo (3,3 GB) requiere previsiblemente del orden de 6-8 GB de VRAM en inferencia con overhead de codec y cache, mientras que la version INT8 (1,1 GB) podria funcionar en el rango de 2-4 GB. Son estimaciones derivadas del peso de los ficheros, no cifras oficiales.
- GPU recomendadas: no disponibles en la documentacion. Por tamano, cabria esperar funcionamiento en GPU de consumo con suficiente VRAM, pero el autor no especifica modelos concretos.
- Cabe en GPU de consumo: probablemente si, al menos con el checkpoint INT8, aunque no hay confirmacion oficial ni lista de modelos validados.
- Opciones de despliegue: ComfyUI mediante el paquete ComfyUI-OmniVoice-Native (instalable desde ComfyUI Manager o por `git clone` del repositorio), con los nodos `Load OmniVoice Model`, `OmniVoice Generate` y `OmniVoice Voice Design`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los valores por defecto son 32 pasos, guidance 2.0 y 25 tokens/s de audio; reducir `num_steps` a 16 aproximadamente divide por dos el tiempo de generacion. No se publican mediciones de latencia por segundo de audio ni de throughput en GPU concretas.
- Almacenamiento: el repositorio ocupa 1,1 GB y el fichero de calidad completa 3,3 GB.

## Comparativa con modelos similares

La informacion disponible sobre este modelo (parametros, contexto y licencia) es incompleta, por lo que la comparacion se limita a la categoria y a las caracteristicas documentadas. Los datos de los modelos alternativos no se han verificado en esta busqueda y deben contrastarse en sus repositorios oficiales.

| Modelo | Categoria | Clonacion zero-shot | Diseno de voz por instruccion | Integracion ComfyUI nativa | Licencia |
|---|---|---|---|---|---|
| OmniVoice (Aero-Ex) | TTS con LLM Qwen3 + codec HiggsAudioV2 | Si, con `ref_audio` + `ref_text` | Si, via `instruct` | Si, paquete propio | no disponible |
| XTTS-v2 (Coqui) | TTS con clonacion zero-shot | Si | Parcial | No nativa | licencia propia de Coqui (no verificada) |
| F5-TTS | TTS con clonacion zero-shot | Si | No documentado | No nativa | no verificada |
| CosyVoice 2 | TTS multilingue | Si | Limitado | No nativa | no verificada |

El diferenciador mas claro de este repositorio no es el rendimiento, sino el formato: checkpoints de fichero unico con metadatos embebidos y carga directa en ComfyUI, algo que las alternativas citadas no ofrecen de serie.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al ser un reempaquetado de k2-fsa/OmniVoice, la licencia aplicable es presumiblemente la del modelo upstream, que no se detalla en la informacion proporcionada.
- La clonacion de voz exige transcripcion manual: no hay ASR integrado, de modo que `ref_text` debe coincidir con el audio de referencia.
- Una voz por llamada: para dialogos con varios hablantes hay que ejecutar una generacion por interlocutor y concatenar despues.
- Sensibilidad al formato del texto: las etiquetas de vocalizacion deben escribirse con la ortografia exacta y mantener el espaciado normal de puntuacion (`! Ha`, `. Phew`, nunca `!Ha`). La puntuacion comprimida degrada notablemente las tomas, especialmente en la version INT8.
- Variabilidad de semilla: la misma semilla puede producir tomas distintas entre checkpoints, por lo que el autor recomienda probar las semillas 1 a 3 por configuracion y fijar la que se vaya a usar.
- Perdida de calidad en la version INT8: aproximadamente un 86% de coincidencia top-1 con el checkpoint completo, con degradacion mas acusada en prompts con etiquetas o de diseno de voz.
- Sin post-procesado de audio: el modelo no aplica ganancia, fundidos ni recortes; hay que usar los nodos de audio estandar de ComfyUI.
- Riesgo de alucinacion y artefactos: no se documentan evaluaciones de inteligibilidad ni de fidelidad de clonacion, y no hay datos de MOS, WER ni similitud de hablante.
- Sesgos: no se publica informacion sobre composicion del dataset de entrenamiento ni sobre sesgos de genero, edad, acento o idioma.
- Cobertura multilingue sin detalle: se declara multilingue, pero no se enumeran los idiomas soportados ni su calidad relativa. El diseno de voz menciona explicitamente acento en ingles y dialecto en chino.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin validacion independiente por parte de la comunidad.
- Dependencia del ecosistema ComfyUI: el flujo documentado asume este entorno; no se describen rutas de despliegue en servidor, por lotes o mediante APIs de inferencia.
- Uso etico: al permitir clonacion de voz zero-shot, existe riesgo de suplantacion. Conviene exigir consentimiento explicito del hablante y aplicar marcas o divulgacion en el contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aero-Ex/OmniVoice
- Modelo base en HuggingFace: https://huggingface.co/k2-fsa/OmniVoice
- Repositorio upstream: https://github.com/k2-fsa/OmniVoice
- Paper: https://arxiv.org/abs/2604.00688
- Paquete para ComfyUI: https://github.com/Aero-Ex/ComfyUI-OmniVoice
