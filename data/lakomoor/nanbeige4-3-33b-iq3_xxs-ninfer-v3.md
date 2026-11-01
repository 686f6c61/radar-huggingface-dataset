# LakoMoor/Nanbeige4.3-33B-IQ3_XXS-NInfer-v3

## Resumen

Nanbeige4.3-33B-IQ3_XXS-NInfer-v3 es una conversión cuantizada del modelo denso Nanbeige4.3-33B, publicada por LakoMoor en formato nativo `.ninfer` (no GGUF ni safetensors) para el motor de inferencia NInfer. El modelo original lo desarrolla Nanbeige y se distribuye con licencia Apache 2.0. Esta variante parte de la cuantización dinámica IQ3_XXS publicada por AtomicChat y la convierte al formato propietario del motor, con el objetivo declarado de ejecutar un modelo de 33.000 millones de parámetros en una única GPU Tesla V100 de 16 GB.

La arquitectura es un transformer denso de tipo `LlamaForCausalLM` con 33.118.977.024 parámetros almacenados, 52 capas, dimensión oculta de 7168 y FFN de 22016. Usa atención GQA con 56 cabezas de consulta y 8 de clave/valor, anchura de cabeza de 128 y RoPE sin escalar con theta de 120.000.000. La configuración original declara 524.288 posiciones nativas de contexto, aunque el perfil de ejecución recomendado por el autor limita la ventana a 8192 tokens por razones de memoria y latencia.

Su relevancia práctica es acotada pero concreta: permite servir un modelo de 33B en hardware antiguo (V100, `sm_70`) mediante un motor especializado que mantiene las páginas KV en host y transfiere solo las filas pobladas a VRAM. El artefacto ocupa 14.958.925.568 bytes (unos 13,93 GiB) en un único fichero autocontenido, con tokenizador, configuración de generación y plantilla de chat embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `LlamaForCausalLM` |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 posiciones declaradas en la config original; perfil recomendado de 8192 tokens |
| Tipos de cuantizacion | Mezcla dinámica IQ3_S, IQ3_XXS, IQ4_XS, Q5_K, Q6_K y FP32 en un mismo artefacto |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (motor NInfer); origen GGUF IQ3_XXS |

Otros datos técnicos: 52 capas, hidden size 7168, FFN 22016, 56 cabezas Q / 8 cabezas KV, head width 128, RoPE theta 120.000.000 sin escalar, sin Q/K norm, sin attention gate ni sink. Tamaño del repositorio: 15,0 GB. Fichero de pesos: 14.958.925.568 bytes (≈13,93 GiB).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Llama, sin mezcla de expertos ni componentes híbridos. Destacan la atención GQA con ratio 7:1 (56 cabezas Q frente a 8 KV) y un RoPE de theta muy elevado (120.000.000) orientado a contextos largos. No se ha publicado en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias para el modelo original Nanbeige4.3-33B.

La innovación técnica de esta ficha no está en el modelo base sino en el proceso de conversión y en el motor. La conversión desde GGUF preserva los bloques matriciales codificados sin recuantizar y reordena los pares rotatorios Q/K de orden Llama a orden NeoX de media cabeza moviendo filas codificadas completas; las normas se ensanchan a FP32. El motor NInfer implementa un ejecutor que ajusta las páginas KV residentes en F16 al VRAM libre (con 256 MiB de margen de planificación) y transfiere desde host solo las filas pobladas, además de un mecanismo de lookup n-gram con tres borradores automáticos para decodificación especulativa ligera. La ejecución es eager: no captura CUDA Graphs en decode.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat oficial embebida.
- Razonamiento y modo "thinking" opcional, desactivado por defecto en el perfil rápido y activable por petición.
- Generación de código, según los tags del repositorio (`coding`) y los ejemplos de la model card (funciones, caché LRU, explicaciones técnicas).
- Razonamiento matemático y de tipo `reasoning`, según los tags declarados.
- Soporte bilingüe inglés y chino; no se declaran otros idiomas.
- API compatible con OpenAI en `/v1` a través de `ninfer-serve`, con identificador de modelo `nanbeige4.3-33b`.
- Decodificación especulativa mediante lookup n-gram (4-gramas, tres borradores automáticos).
- No implementa tool calling, function calling, agentes multi-paso, visión, audio ni backend de modelo borrador separado en esta ruta de ejecución.

## Casos de uso

- Asistencia de código en estación de trabajo con GPU antigua: un equipo con V100 de 16 GB puede servir el modelo a ~32 tok/s en prompts cortos, suficiente para autocompletado y explicación de fragmentos en un entorno de desarrollo local sin depender de la nube.
- Procesamiento por lotes de documentación técnica bilingüe inglés-chino: el modelo cubre ambos idiomas y puede resumir, traducir o reescribir documentación en pipelines offline donde el throughput importa más que la latencia interactiva.
- Prototipado de agentes conversacionales con contexto medio: con la ventana de 8192 tokens del perfil rápido se pueden mantener conversaciones de varias decenas de turnos o adjuntar documentos de varias páginas, aunque sin soporte nativo de tool calling habría que orquestar las herramientas externamente.
- Evaluación de motores de inferencia alternativos: el artefacto sirve para comparar NInfer frente a llama.cpp o vLLM en el mismo modelo base y la misma cuantización, midiendo tok/s y calidad de salida con el mismo prompt.
- Investigación sobre cuantización extrema: al mezclar IQ3_S, IQ3_XXS, IQ4_XS, Q5_K, Q6_K y FP32 en un solo fichero, permite estudiar el impacto de códecs heterogéneos por tensor en la calidad de generación.
- Generación de texto en entornos con VRAM muy limitada: el esquema de KV en host con prefijo residente de 4096 posiciones (832 MiB de KV en VRAM) permite atender secuencias de hasta 8k tokens en una tarjeta de 16 GB que de otro modo no alojaría un modelo de 33B.
- Reproducción de experimentos con semillas y salidas deterministas: el autor reporta coincidencia exacta de las salidas greedy con la línea base, lo que facilita la comparación controlada entre configuraciones del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de velocidad de inferencia en una Tesla V100-SXM2-16GB con CUDA 12.9, compilación `sm_70` Release, muestreo greedy y reutilización de caché desactivada:

| Carga de trabajo | KV fijo original de 1024, sin lookup | Perfil rápido 8k |
|---|---|---|
| Código de caché LRU, 57 tokens de entrada | 32,32 / 32,32 tok/s | 32,30 / 32,32 tok/s |
| Explicación de caché HTTP en ruso, 70 tokens de entrada | 31,79 / 31,78 tok/s | 31,49 / 31,50 tok/s |
| Funciones cuadradas repetidas | 31,92 / 31,90 tok/s | 51,30 / 51,35 tok/s |
| Continuación de referencia de 2048 tokens, 32 de salida | 4,44 tok/s | 36,86 tok/s |
| Continuación de referencia de 6144 tokens, 32 de salida | 2,56 tok/s | 13,28 tok/s |

Las salidas truncadas se limitaron a 160 tokens y se hicieron dos ejecuciones por carga. Todas las salidas greedy medidas coincidieron exactamente con la línea base.

## Requisitos de hardware

- VRAM: el artefacto pesa ≈13,93 GiB, por lo que encaja en GPUs de 16 GB. En la V100 probada, el ejecutor reservó 832 MiB de KV F16 para las primeras 4096 posiciones y el arranque reportó 377,5 MiB libres.
- Memoria host: presupuesto de imagen de prefijo en host de 2 GiB, separado del KV activo, que puede llegar a 1,625 GiB con 8k de contexto.
- GPU recomendadas: Tesla V100-SXM2-16GB es el hardware validado. No hay datos publicados para A100, H100 ni RTX 4090; el motor requiere compilación con `sm_70` o superior y CUDA 12.8/12.9 (CUDA 13 no compila `sm_70`).
- GPU de consumo: no se ha validado en tarjetas consumer en la información disponible; el tamaño de 13,93 GiB deja poco margen en GPUs de 16 GB y no cabe en 12 GB u 8 GB.
- Despliegue: exclusivamente mediante `ninfer-serve` del repositorio NInfer, compilado desde la revisión `807a99ec065f47b29635834e2d13620aad607562` con la rama `codex/nanbeige`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un GGUF ni un checkpoint de Transformers.
- Restricciones del motor: una sola GPU y una sola secuencia activa; sin CUDA Graphs en decode; sin backend de modelo borrador separado; sin visión ni RoPE escalado.
- Latencia y throughput: 31-32 tok/s en prompts cortos, 36,86 tok/s en continuación de 2048 tokens con 32 de salida y 13,28 tok/s en continuación de 6144 tokens, siempre en la V100 de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-IQ3_XXS-NInfer-v3 | 33,1B densos | 8192 recomendado (524.288 declarados) | `.ninfer` / NInfer | Apache 2.0 | Validado en V100 16 GB; una GPU, una secuencia |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B densos | 524.288 declarados | safetensors / Transformers | Apache 2.0 | Requiere VRAM muy superior en FP16/BF16 |
| AtomicChat/Nanbeige4.3-33B-GGUF | 33,1B densos | el del modelo base | GGUF / llama.cpp | Apache 2.0 | Misma cuantización de origen, ecosistema más amplio |
| Alternativas de ~30B en GGUF (p. ej. familias Llama o Qwen de tamaño similar) | ~30-34B | variable | GGUF / llama.cpp, Ollama | variable | No se dispone de datos comparativos de rendimiento en esta información |

La comparación cuantitativa de calidad frente a otras alternativas no está disponible: no hay benchmarks publicados para este artefacto ni para el modelo base en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados. El castellano no está soportado oficialmente y la calidad fuera de esos idiomas no está evaluada.
- Contexto: las 524.288 posiciones de la configuración original no implican que la inferencia con prompts completos ni la calidad a esa longitud hayan sido probadas; el perfil validado es de 8192 tokens.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación para este modelo.
- Sesgos: no hay información sobre composición del dataset ni auditorías de sesgo del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto depende de un motor (NInfer) cuya licencia y condiciones deben verificarse por separado en su repositorio.
- Motor: una sola GPU y una sola secuencia activa; sin tool calling, sin visión, sin CUDA Graphs; ejecución eager con menor throughput que implementaciones con grafos capturados.
- Compatibilidad: no funciona con llama.cpp, Ollama, vLLM ni TGI; requiere compilar NInfer con la revisión exacta indicada. Versiones anteriores del motor sin la familia Llama explícita no pueden cargar el modelo.
- Cuantización agresiva: IQ3_XXS con mezcla de códecs por tensor puede degradar el razonamiento y el código frente al modelo en BF16; no se han publicado métricas de esa degradación.
- Reproducibilidad: el rendimiento medido corresponde a una única V100-SXM2-16GB; otros procesos en la GPU pueden reducir el prefijo KV residente y alterar las cifras.
- Madurez: 20 descargas y 0 likes en el momento de la consulta; el artefacto es reciente y con poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LakoMoor/Nanbeige4.3-33B-IQ3_XXS-NInfer-v3
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización GGUF de origen: https://huggingface.co/AtomicChat/Nanbeige4.3-33B-GGUF
- Repositorio del motor NInfer (rama de conversión): https://github.com/LakoMoor/ninfer-all/tree/807a99ec065f47b29635834e2d13620aad607562
- Pull request de implementación Llama/Nanbeige: https://github.com/iamwavecut/ninfer-all/pull/186
- Guía de compilación en Linux: https://github.com/LakoMoor/ninfer-all/blob/807a99ec065f47b29635834e2d13620aad607562/docs/build-linux.md
