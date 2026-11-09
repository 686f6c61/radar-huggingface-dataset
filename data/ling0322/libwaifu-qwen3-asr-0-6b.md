# ling0322/libwaifu-qwen3-asr-0.6b

## Resumen

libwaifu-qwen3-asr-0.6b es una conversion del modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B de Alibaba Qwen al formato de paquete que consume la libreria de inferencia local libwaifu, escrita en Rust y C++ con soporte para CUDA, Metal y Vulkan. No se trata de un modelo nuevo ni de un fine-tuning: el autor (ling0322) mantiene la misma red neuronal y los mismos pesos, pero reorganiza los ficheros en un manifiesto YAML unico, un safetensors en float16 y un tokenizer JSON, de modo que el modelo pueda ejecutarse sin depender del stack de Python de transformers.

El modelo original resuelve dos tareas en una sola pasada: transcripcion de audio a texto e identificacion automatica del idioma. Esta empaquetado con 782 millones de parametros (torre de audio mas decodificador Qwen3-0.6B) y cubre treinta idiomas y dialectos segun la model card del paquete, entre ellos chino mandarin, cantonés, ingles, castellano, arabe, japones, coreano, hindi o filipino. La relevancia practica esta en que permite desplegar ASR multilingue en local con un consumo de VRAM reducido y una latencia muy baja (0,36 s para transcribir 13,75 s de audio en una RTX 5060 Ti, segun las mediciones del autor).

El paquete se distribuye bajo licencia Apache 2.0, es una copia modificada no oficial de Qwen y declara explicitamente diferencias funcionales respecto al original: no incluye timestamps, no soporta streaming ni batching, y ejecuta la atencion del encoder dentro de ventanas de ocho segundos en lugar de sobre la grabacion completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (torre de audio derivada de Qwen3-Omni) + decodificador transformer causal Qwen3-0.6B |
| Parametros totales | 782 M (torre de audio y decodificador juntos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (pesos empaquetados); el original se publica en bfloat16 |
| Idiomas soportados | zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk (30 segun la model card del paquete; el modelo original declara 52 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) + manifiesto YAML + tokenizer JSON |

## Arquitectura y entrenamiento

La arquitectura combina un frontend de extraccion de caracteristicas mel (compatible con `WhisperFeatureExtractor` de transformers), una torre de audio con atencion restringida a ventanas de ocho segundos y un decodificador de lenguaje Qwen3-0.6B que genera los tokens de transcripcion, incluyendo marcadores de audio y el token especial `<asr_text>`. El paquete omite la cabeza de texto porque en la release original coincide bit a bit con la tabla de embeddings, que se reutiliza en su lugar. Los pesos se exportan de bfloat16 a float16; el exportador rechaza cualquier tensor con valores fuera del rango representable en media precision.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en esta ficha; la model card del paquete solo remite al modelo original Qwen3-ASR-0.6B, que segun la busqueda web se entreno con datos de habla a gran escala aprovechando la capacidad de comprension de audio de Qwen3-Omni. La innovacion tecnica del paquete es de ingenieria de despliegue: inferencia nativa en Rust/C++ sobre GPU (CUDA, Metal, Vulkan) y CPU, sin Python, con verificacion numerica frente a una referencia float32 (error relativo del mel de 1,4e-5 a 1,7e-5, del encoder del 0,18 % al 0,49 % y peor log-probabilidad del decodificador de 0,037 a 0,059, con tokens identicos en las tres grabaciones de prueba).

## Capacidades

- Transcripcion de audio a texto en 30 idiomas y dialectos, incluidos chino mandarin, cantonés, ingles, castellano, arabe, japones, coreano, hindi, tailandes, vietnamita, turco, malayo, neerlandes, sueco, danes, finlandes, polaco, checo, filipino, persa, griego, rumano, hungaro y macedonio.
- Identificacion automatica del idioma: puede detectarlo por si solo o recibir el idioma forzado como parametro (`English` en el ejemplo de la CLI).
- Aceptacion de una frase de contexto para mejorar el reconocimiento de nombres propios.
- Procesamiento de audio a 16 kHz y tambien a 22,05 kHz (probado en la verificacion del paquete).
- Ejecucion en GPU (CUDA, Metal, Vulkan) y en CPU.
- No soporta timestamps, streaming ni batching.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripcion local de reuniones y notas de voz: el modelo procesa grabaciones en una GPU de consumo y devuelve texto con el idioma identificado, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual multilingue: al cubrir treinta idiomas con deteccion automatica, se puede usar como primer paso de un pipeline de subtitulos (sin timestamps, que habria que obtener con otra herramienta como Qwen3-ForcedAligner).
- Asistentes de voz integrados en aplicaciones de escritorio: la libreria libwaifu esta pensada para inferencia local en Rust/C++, de modo que el ASR puede empotrarse en una aplicacion nativa sin dependencias de Python.
- Dictado y accesibilidad: transcripcion en tiempo casi real de audio corto (0,36 s para 13,75 s de audio en una RTX 5060 Ti) para herramientas de escritura por voz o de apoyo a personas con dificultades motoras.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones en varios idiomas para su posterior analisis de sentimiento o extraccion de temas, usando el idioma detectado para enrutar el postprocesado.
- Investigacion en ASR multilingue: al ser un paquete reproducible con referencia float32 publicada en `libwaifu_test_data`, sirve para validar implementaciones propias o comparar precisiones entre backends (CUDA frente a CPU, float16 frente a bfloat16).
- Procesamiento de audio en dispositivos con GPU modesta: con 782 M de parametros en float16 (1,56 GB de pesos), cabe en GPUs de gama media y permite transcripcion en local en equipos sin aceleradores de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni WER por idioma, ni comparativas con otros modelos ASR). La unica metrica objetiva aportada es la verificacion numerica frente a la referencia float32 y los tiempos de ejecucion en una RTX 5060 Ti:

| Medicion | zh, 3,5 s | 13,75 s a 22,05 kHz | en, 5,3 s |
|---|---|---|---|
| Error relativo del mel | 1,4e-5 | 1,5e-5 | 1,7e-5 |
| Error relativo del encoder | 0,18 % | 0,49 % | 0,24 % |
| Peor log-probabilidad del decodificador | 0,037 | 0,039 | 0,059 |
| Tokens generados | los mismos 14 | los mismos 39 | los mismos 19 |

Tiempos medidos por el autor en una RTX 5060 Ti: 0,6 s de carga del paquete y 0,36 s para transcribir la grabacion de 13,75 s.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos en float16, mas el espacio de activaciones y buffers de audio; cabe holgadamente en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA, Metal o Vulkan; el autor verifico en una RTX 5060 Ti. Para despliegues de mayor volumen, A100 o H100 no son necesarias por tamano, pero permitirian mayor paralelismo si se anadiera batching (no soportado en este paquete).
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media y equipos Apple Silicon via Metal.
- Opciones de despliegue: libwaifu (CLI `waifu-tools` con el binario `transcribe` y API Rust `Qwen3Asr::from_manifest`); el modelo original Qwen3-ASR-0.6B puede desplegarse con transformers, vLLM y FlashAttention segun la documentacion de Qwen. No se menciona soporte de llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: 0,36 s para 13,75 s de audio en una RTX 5060 Ti (aproximadamente 38x tiempo real en ese caso); sin datos de throughput agregado porque no hay batching.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Timestamps | Streaming | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| libwaifu-qwen3-asr-0.6b (este paquete) | 782 M | 30 | No | No | Apache 2.0 | safetensors float16 + manifiesto; libwaifu (Rust/C++) |
| Qwen/Qwen3-ASR-0.6B (original) | 0,6 B (familia con variante 1.7B) | 52 idiomas y dialectos | Si, via Qwen3-ForcedAligner | Si (segun model card original) | Apache 2.0 | transformers, vLLM, FlashAttention |
| Qwen3-ASR-1.7B | 1,7 B | 52 idiomas y dialectos | Si | Si | Apache 2.0 | transformers, vLLM |
| Whisper (referencia de la industria) | no disponible en la informacion | no disponible en la informacion | Si | Si | MIT (no confirmado en la informacion) | whisper.cpp, transformers, faster-whisper |

La comparativa se limita a lo declarado en la informacion disponible; no hay datos de WER que permitan comparar precision entre estos modelos.

## Limitaciones y advertencias

- Es una copia modificada no oficial de Qwen3-ASR-0.6B: no es un producto de Qwen ni esta respaldada por Alibaba. El fichero `NOTICE` documenta los cambios.
- Ejecuta en float16 en GPU y CPU, mientras que el original usa bfloat16; aunque la verificacion muestra diferencias minimas, no es numericamente identico al original.
- La atencion del encoder se limita a ventanas de ocho segundos, igual que las rutas FlashAttention y vLLM del original, pero distinto del backend transformers con sdpa o eager, que atiende la grabacion completa. Esto puede afectar a la calidad en audios con dependencias de largo alcance.
- No genera timestamps (Qwen3-ForcedAligner no esta portado), no soporta streaming ni batching, lo que limita su uso en produccion de alto volumen o en subtitulado sincronizado.
- Cobertura de idiomas reducida a 30 en el paquete frente a los 52 idiomas y dialectos del modelo original; conviene verificar el idioma concreto antes de desplegar.
- Riesgo de alucinacion inherente a los modelos generativos: en audio con ruido, silencios o habla solapada puede producir texto plausible no pronunciado; no se documentan tasas de error.
- No se documentan sesgos especificos ni evaluaciones de robustez por acento o variedad dialectal; el castellano figura en la lista de idiomas, pero sin metricas de calidad.
- Licencia Apache 2.0: permite uso comercial, pero al ser una copia modificada conviene conservar los avisos de licencia y atribucion del proyecto original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un paquete reciente y poco validado por la comunidad, lo que aconseja pruebas propias antes de usarlo en produccion.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/ling0322/libwaifu-qwen3-asr-0.6b
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de libwaifu: https://github.com/ling0322/libwaifu
- Documentacion del pipeline ASR en libwaifu: `docs/qwen3_asr.md` dentro del repositorio anterior
- Datos de prueba y tensores de referencia: https://huggingface.co/ling0322/libwaifu_test_data
