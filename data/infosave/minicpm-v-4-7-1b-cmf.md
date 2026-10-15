# infosave/MiniCPM-V-4.7-1B-cmf

## Resumen

infosave/MiniCPM-V-4.7-1B-cmf es un paquete de pesos cuantizados en formato CMF (cortiq Model File) que contiene unicamente el backbone de lenguaje del modelo multimodal OpenBMB MiniCPM-V 4.7 1B. Lo publica el usuario infosave sobre los pesos originales de OpenBMB, bajo licencia Apache-2.0, y esta pensado para ejecutarse con el runtime `cortiq` en Rust, no con transformers, llama.cpp ni vLLM.

El checkpoint de origen es un envoltorio multimodal `minicpmv4_7` sobre un decodificador de lenguaje denso `qwen3_5_text` de 24 capas: 18 capas de atencion lineal Gated DeltaNet y 6 capas de atencion completa, con hidden size 1024, MLP de 3584 y vocabulario de 248.094 tokens. La conversion elimina deliberadamente los 453 tensores del vision tower, los 6 tensores del merger/projector, la inyeccion de tokens visuales y la ruta canvas M-RoPE, de modo que el resultado es exclusivamente texto.

El repositorio incluye dos artefactos: `MiniCPM-V-4.7-1B-q4tp.cmf` (798.400.417 bytes) para entornos con poca memoria y `MiniCPM-V-4.7-1B-q8_2f.cmf` (1.037.030.305 bytes) cuando prima la fidelidad. Su relevancia actual esta en permitir inferencia de un decoder de ~1B con vocabulario de 248k tokens en hardware muy modesto, incluidos Mac con Metal, aunque el autor no publica todavia ninguna medicion de calidad ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con atencion hibrida: 24 capas (18 Gated DeltaNet de atencion lineal + 6 de atencion completa), hidden size 1024, MLP de 3584 |
| Parametros totales | Aproximadamente 1.000 millones (denominacion del modelo; recuento exacto no disponible) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens segun el config del checkpoint de origen; no verificado en los artefactos CMF |
| Tipos de cuantizacion | Perfiles CMF `q4tp` y `q8_2f`, con dtypes mixtos por tensor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (cortiq), no safetensors ni GGUF |
| Vocabulario | 248.094 tokens (embedding y LM head en q8_2f en ambos perfiles) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El decodificador subyacente es un transformer denso con atencion hibrida: 18 de sus 24 capas usan Gated DeltaNet, un mecanismo de atencion lineal recurrente, y las 6 restantes mantienen atencion completa. Con hidden size 1024 y MLP de 3584, el modelo es compacto, pero su vocabulario de 248.094 tokens domina el consumo de parametros en las capas de embedding y de salida. El config de origen declara un rango maximo de posiciones de 262.144 tokens, coherente con un uso orientado a contexto largo.

Sobre el entrenamiento no hay informacion en el material proporcionado: no se detallan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La conversion tampoco conserva la cabeza MTP (multi-token prediction) que anuncia el config upstream, porque el checkpoint de origen no contiene tensores `mtp.*` fisicos; en consecuencia, este paquete no ofrece decodificacion especulativa. La innovacion destacable es la politica de cuantizacion del autor: en el perfil `q4tp` el cuerpo del decoder va a 4 bits, pero el embedding, la LM head, las normas y la ruta de control de Gated DeltaNet mantienen representaciones de mayor precision para no acumular error en los puntos criticos.

## Capacidades

- Generacion de texto y conversacion por turnos mediante el tokenizer y la plantilla de chat embebidos en el propio archivo CMF.
- Procesamiento de prompts de texto convencionales; la CLI de cortiq expone un flag `--no-think`, lo que sugiere la existencia de un modo de pensamiento o razonamiento explicito en el modelo base, aunque el autor no documenta sus caracteristicas.
- Soporte declarado de contexto largo a nivel de config (hasta 262.144 posiciones), condicionado a la memoria disponible para el KV cache.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible como capacidad documentada.
- Vision y video: explicitamente NO soportados en este paquete, pese al nombre del modelo.
- No incluye cabeza MTP ni decodificacion especulativa.

## Casos de uso

- Prototipado y pruebas locales de LLM: permite validar prompts, plantillas de chat y flujos de generacion en un portatil sin GPU dedicada, gracias a un artefacto de entre 0,8 GB y 1 GB.
- Asistentes de texto con requisitos de privacidad: al ejecutarse integramente en local con el runtime cortiq, los prompts y las respuestas no salen del equipo, algo util en entornos sanitarios, legales o industriales.
- Resumen y analisis de documentos largos: la ventana nominal de 262.144 tokens del config permitiria procesar contratos, informes o transcripciones extensas en una sola pasada, siempre que la memoria para el KV cache lo permita.
- Generacion de texto por lotes en CPU: tareas de redaccion asistida, reformulacion o generacion de descripciones donde el throughput no es critico y se prioriza el coste cero de GPU.
- Chat embebido en aplicaciones de escritorio o moviles: el perfil `q4tp` de 798 MB es un candidato razonable para integrarse como componente local en una app con backend cortiq.
- Evaluacion de cuantizacion: el par de artefactos `q4tp` y `q8_2f` sirve como banco de pruebas para comparar perdida de fidelidad frente a ahorro de memoria en un mismo modelo, con hashes SHA-256 publicados para garantizar reproducibilidad.
- Despliegue en Mac con Apple Silicon: el autor documenta el uso con Metal mediante `CMF_GPU=1`, lo que habilita inferencia acelerada en equipos de escritorio de Apple sin CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se hace ninguna afirmacion de perplexity, calidad o throughput sin mediciones previas en el dispositivo objetivo, y que un proceso de conversion correcto o una prueba de humo en CPU no constituyen un resultado de rendimiento en Metal. Por tanto, no se incluye tabla comparativa de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM / memoria para los pesos: aproximadamente 0,8 GB con `MiniCPM-V-4.7-1B-q4tp.cmf` (798.400.417 bytes) y aproximadamente 1,04 GB con `MiniCPM-V-4.7-1B-q8_2f.cmf` (1.037.030.305 bytes).
- Memoria adicional: hay que sumar el KV cache, cuyo tamano crece con la longitud de contexto; para prompts largos cerca del maximo nominal de 262.144 tokens el consumo puede superar ampliamente al de los pesos.
- GPU consumer: si, cabe con holgura en cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 o RTX 4090. Las GPU de datacenter (A100, H100) no aportan ventaja por capacidad, solo por throughput agregado.
- Apple Silicon: soportado a traves del backend Metal de cortiq con `CMF_GPU=1`, segun la documentacion del autor.
- CPU: el modelo es ejecutable en CPU, ya que el flujo de verificacion incluye pruebas de humo sin GPU.
- Opciones de despliegue: exclusivamente el runtime cortiq (libreria Rust, comandos `cortiq verify`, `cortiq run`, `cortiq info`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni transformers, porque el formato CMF no es safetensors ni GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| infosave/MiniCPM-V-4.7-1B-cmf (esta ficha) | ~1.000 millones | 262.144 tokens (nominal del config) | Solo texto | Apache-2.0 | CMF (cortiq) |
| openbmb/MiniCPM-V-4.7-1B (upstream) | ~1.000 millones | 262.144 tokens (nominal del config) | Texto, imagen y video | Apache-2.0 | Pesos originales (incluye 453 tensores de vision tower y 6 de merger) |
| Otras alternativas de ~1B texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el checkpoint upstream, del que este paquete deriva: la diferencia no esta en el decodificador, sino en la eliminacion del vision tower, el merger/projector, la inyeccion de tokens visuales y la ruta canvas M-RoPE, junto con la cuantizacion CMF. No se dispone de datos comparativos de rendimiento frente a otras familias de tamano similar.

## Limitaciones y advertencias

- El nombre contiene "V", pero el paquete es solo texto: no acepta imagenes ni video. No existe vision encoder, merger/projector, inyeccion de tokens visuales ni posiciones canvas M-RoPE para tramos multimodales.
- Enviar `<|image_pad|>` o `<|video_pad|>` en un prompt no habilita vision: son tokens de texto sin embeddings visuales detras.
- No incluye cabeza MTP ni decodificacion especulativa, aunque el config upstream anuncie una capa MTP.
- No hay datos publicados de perplexity, calidad, sesgos ni throughput; la model card lo declara de forma explicita. Cualquier cifra de rendimiento usada en produccion debe medirse en el dispositivo objetivo.
- Los idiomas soportados no estan documentados, por lo que no se puede garantizar un comportamiento equivalente en castellano que en otros idiomas.
- El contexto de 262.144 tokens es un valor nominal del config de origen, no una capacidad verificada en estos artefactos CMF, y su uso real depende de la memoria disponible para el KV cache.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad para estos pesos cuantizados.
- Ambiguedad de nomenclatura: `q8_2` se usa como abreviatura informal del perfil `q8_2f`; no existe un perfil `q8_2` distinto.
- Dependencia de un runtime especifico: sin cortiq no se pueden cargar los archivos; no hay ruta de conversion a GGUF o safetensors documentada.
- Licencia Apache-2.0, que permite uso comercial, pero los pesos derivan del release de OpenBMB: conviene revisar la model card upstream para informacion completa de licencia, uso y seguridad.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad sobre el comportamiento real de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/MiniCPM-V-4.7-1B-cmf
- Modelo base (upstream): https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio del formato CMF: https://github.com/infosave2007/cmf
- Runtime cortiq: referenciado como `library_name: cortiq` en la model card; no se proporciona URL directa en la informacion disponible.
