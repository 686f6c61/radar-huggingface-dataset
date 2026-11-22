# shuheikatoinfo/CosyVoice2-0.5B-UtterTune-ja-SelfDistill

## Resumen

CosyVoice2-0.5B-UtterTune-ja-SelfDistill es un adaptador LoRA para el modelo de sintesis de voz FunAudioLLM/CosyVoice2-0.5B, desarrollado por shuheikatoinfo. Su proposito es permitir que el texto de entrada especifique de forma explicita la lectura (en katakana) y el acento tonal (pitch accent) de una palabra japonesa mediante una etiqueta inline del sistema UtterTune, resolviendo el problema clasico de la sintesis TTS en japones: la ambiguedad en la lectura de kanji y en la posicion del nucleo acentual, que el modelo base resuelve de forma implicita y a menudo erronea.

El adaptador se entrena exclusivamente sobre el modelo de lenguaje generador de tokens de habla (`llm.pt`, un LM Qwen2) que forma parte de CosyVoice 2; el decodificador de flujo y el vocoder permanecen intactos. La innovacion principal es que el entrenamiento se realiza sin voz grabada: se usan 13.751 "profesores" autodestilados, donde el objetivo es la secuencia de tokens de habla que el propio modelo base genera para la frase plana, y la entrada es esa misma frase con la palabra sustituida por la etiqueta UtterTune.

El modelo es relevante para desarrolladores que necesiten control fino de pronunciacion en TTS japones (nombres propios, terminos tecnicos, homografos) sin disponer de un corpus de audio anotado con lectura y acento. Al ser un adaptador PEFT de rango 16 sobre un modelo de 0,5B, el coste de almacenamiento y despliegue es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el LM Qwen2 interno de CosyVoice2-0.5B (transformer decoder); flow decoder y vocoder sin cambios |
| Parametros totales | No disponible (adaptador LoRA de rango 16 sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`; modelo base de 0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors fp32/fp16; cuantizacion del base no especificada) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `embed_patch.safetensors`) + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El adaptador modifica unicamente el modelo de lenguaje de CosyVoice 2 que genera los tokens de habla. Se aplica LoRA con rango 16, alpha 64 y dropout 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. Ademas, se anaden dos tokens especiales al tokenizador `CosyVoice-BlankEN` (`<PHON_START>` y `<PHON_END>`, anadidos al final del vocabulario existente), se redimensiona la matriz de embeddings y se entrenan exclusivamente las dos filas nuevas (tensor `embed_rows` de forma [2, 896] en fp32); el resto de parametros queda congelado.

El entrenamiento se realizo en 1.000 pasos, batch 8, optimizador AdamW (betas 0,9 y 0,98), learning rate 1e-4 con 5% de warm-up y decaimiento coseno, precision mixta fp16, reservando un 5% de las filas del profesor para validacion (semilla 42). El numero de pasos se eligio entre 250 y 16.000 segun una regla de validacion pre-registrada. Los datos son 13.751 profesores autodestilados: para cada frase, el objetivo es la secuencia de tokens de habla que el modelo base genera para la frase plana, y la entrada es la misma frase con la palabra sustituida por la etiqueta UtterTune. La etiqueta contiene la lectura en katakana y un apostrofo tras la mora del nucleo acentual (`フク'`, `ゲ'ンカン`, `レーゾ'ーコ`); la ausencia de apostrofo indica palabra sin acento (heiban, p. ej. `イス`). No se utilizo voz grabada en ningun momento.

## Capacidades

- Sintesis de voz en japones con control explicito de lectura y acento tonal mediante etiquetas inline UtterTune.
- Especificacion de lectura en katakana para palabras con kanji ambiguos u homografos.
- Especificacion de la posicion del nucleo acentual mediante apostrofo tras la mora correspondiente.
- Representacion de palabras sin acento (heiban) mediante ausencia de apostrofo.
- Integracion en el pipeline TTS completo de CosyVoice 2 (LM + flow decoder + vocoder), heredando sus capacidades de clonacion de voz y generacion de habla del modelo base.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador TTS, no un modelo de lenguaje conversacional.
- Capacidad multilingue limitada al japones para la funcionalidad entrenada.

## Casos de uso

- Lectura correcta de nombres propios japoneses en TTS: en escenarios como navegacion por voz o asistentes, el desarrollador puede forzar la lectura en katakana de un apellido con kanji ambiguo mediante la etiqueta, evitando lecturas erroneas del modelo base.
- Pronunciacion de terminos tecnicos y prestamos: palabras como `レーゾ'ーコ` (resonador) pueden recibir la posicion acentual correcta, util en audiolibros tecnicos o material divulgativo.
- Diccionarios y aplicaciones de aprendizaje de japones: generar audio con acento tonal correcto y explicito ayuda a estudiantes a distinguir pares minimos y patrones acentuales.
- Anuncios y locuciones automaticas: en sistemas de megafonia o IVR en japones, fijar el acento de toponimos y nombres de estacion reduce la ambiguedad percibida por el oyente.
- Post-edicion de pronunciacion en pipelines de doblaje o podcast: el adaptador permite corregir casos puntuales sin reentrenar el modelo base ni disponer de grabaciones del hablante.
- Prototipado de interfaces de voz con control fino: investigadores que estudian prosodia y acento tonal japones pueden usar el adaptador como herramienta de control experimental, aprovechando que el entrenamiento es autodestilado y reproducible sin corpus de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador sobre un modelo base de 0,5B, el requisito dominante es el del propio CosyVoice2-0.5B (LM Qwen2 + flow decoder + vocoder), no el del adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el adaptador se aplica con `peft.PeftModel.from_pretrained` sobre el modelo base; requiere anadir los dos tokens al tokenizador, redimensionar los embeddings del LM y escribir `embed_rows` en las dos filas nuevas. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CosyVoice2-0.5B-UtterTune-ja-SelfDistill | LoRA r16 sobre base 0,5B | No disponible | ja | Apache 2.0 | Control explicito de lectura y acento via etiquetas; entrenamiento autodestilado sin audio |
| FunAudioLLM/CosyVoice2-0.5B (base) | 0,5B | No disponible | Multiples (incluye ja) | Apache 2.0 | Sin control explicito de lectura ni acento tonal |
| Otros adaptadores TTS japones con control de acento | No disponible | No disponible | ja | No disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El adaptador solo ha sido entrenado para japones; no se garantiza su comportamiento en otros idiomas del modelo base.
- El control de lectura y acento depende de que el texto use correctamente la sintaxis de etiqueta UtterTune (katakana y apostrofo en la mora del nucleo); etiquetas mal formadas pueden degradar la sintesis.
- El entrenamiento es autodestilado: los objetivos son las secuencias de tokens del propio modelo base, por lo que el adaptador hereda los sesgos y errores del profesor y no incorpora conocimiento de pronunciacion procedente de audio real.
- Riesgo de alucinacion prosodica en palabras no vistas durante el entrenamiento o con patrones acentuales poco representados en los 13.751 profesores.
- Solo se adapta el LM generador de tokens; el flow decoder y el vocoder no se han reentrenado, lo que limita la fidelidad acustica final al modelo base.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware especificos del adaptador.
- Aunque la licencia es Apache 2.0 (igual que el modelo base), conviene verificar las condiciones de uso del modelo base CosyVoice2-0.5B y de los datos autodestilados antes de un despliegue comercial.
- El repositorio no presenta descargas ni likes en el momento de la consulta, lo que indica una validacion externa limitada.

## Enlaces

- Hugging Face: https://huggingface.co/shuheikatoinfo/CosyVoice2-0.5B-UtterTune-ja-SelfDistill
- Modelo base: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Paper: arXiv:2609.17234
- Codigo: https://github.com/shuheikatoinfo/UtterTune-SelfDistill
- Herramienta UtterTune: https://github.com/shuheikatoinfo/UtterTune
