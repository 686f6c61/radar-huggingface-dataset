# LuffyTheFox/Qwen3.6-35B-A3B-Genesis-BF16-GGUF

## Resumen

Qwen3.6-35B-A3B-Genesis-BF16-GGUF es una conversión en formato GGUF del modelo multimodal Qwen3.6-35B-A3B, desarrollada por el usuario independiente LuffyTheFox. El modelo base, creado por el equipo Tongyi Lab de Alibaba, es un transformer de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y 3 000 millones activos, que admite entrada de imagen y texto. La particularidad de esta versión es la aplicación del algoritmo propietario "Genesis", un post-procesado numérico que repara los tensores del modelo para reducir el ruido acumulado durante el entrenamiento, con el objetivo de mejorar la estabilidad, la claridad contextual y la adherencia a instrucciones sin necesidad de reentrenar.

El proyecto Genesis, desarrollado durante casi medio año, se basa en técnicas de estadística matemática y descomposición en valores singulares (SVD) para detectar y corregir desequilibrios entre cabezas de atención, ruido en los pesos y bloques corruptos. El resultado es un modelo que, según su autor, mantiene el conocimiento aprendido pero elimina el "caos interno" que provoca alucinaciones y respuestas verbosas. Esta versión concreta parte de la cuantización BF16 publicada por Unsloth y está pensada para ejecutarse localmente con runtimes compatibles con GGUF como llama.cpp, Ollama o vLLM.

La relevancia actual de este lanzamiento radica en que ofrece una alternativa optimizada de un modelo MoE multimodal de gran tamaño con un coste de inferencia reducido (solo 3B activos), lo que permite su ejecución en hardware de consumo con una ventana de contexto de al menos 128 000 tokens. La licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con codificador de vision |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | 3 000 000 000 (3 B) |
| Longitud de contexto | 128 000 tokens (recomendado minimo; el modelo base soporta hasta 262 144) |
| Tipos de cuantizacion | BF16 (version base); se menciona APEX-Compact como cuantizacion recomendada, pero no se detallan otras |
| Idiomas soportados | Ingles, chino y otros (multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con 35 000 millones de parametros totales y 3 000 millones activos por token, lo que reduce significativamente el coste computacional en inferencia. Incluye un codificador de vision que permite procesar imagenes junto con texto, y su arquitectura esta optimizada para razonamiento multi-paso y tareas agénticas. El entrenamiento original del modelo base no se detalla en la informacion disponible, pero se sabe que fue desarrollado por el equipo Tongyi Lab de Alibaba y que soporta multiples idiomas.

La innovacion principal de esta version es el algoritmo Genesis, aplicado por LuffyTheFox sobre los pesos ya cuantizados en BF16. Este proceso consta de tres etapas: primero, escanea los tensores `ssm_conv1d` (relacionados con la memoria de contexto largo) y repara el equilibrio entre cabezas; segundo, detecta ruido en los tensores mediante SVD personalizado, excluyendo pesos de embedding, salida y normales, y reduce ese ruido preservando el 99 % de la señal y el gradiente aprendido; tercero, analiza bloques de tensores con tres parametros y reemplaza bloques corruptos por los que mejor se ajustan a la distribucion de pesos. Todo ello se realiza sin reentrenamiento, como una "cirugia numerica" sobre los bytes del archivo.

## Capacidades

- Generacion de texto, razonamiento logico, codigo y matematicas, heredadas del modelo base Qwen3.6.
- Procesamiento multimodal: acepta imagenes como entrada adicional al texto (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling, util para integraciones con APIs y agentes.
- Capacidad de razonamiento multi-paso y modo "thinking" (pensamiento) que se puede activar o desactivar segun la configuracion.
- Multilingue: principalmente ingles y chino, con cobertura adicional de otros idiomas.
- Ventana de contexto larga (minimo 128 000 tokens) que permite manejar documentos extensos y conversaciones prolongadas.
- Compatible con runtimes GGUF como llama.cpp, Ollama y vLLM, con soporte para offload de capas a CPU.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128 000 tokens) gracias a su ventana de contexto, manteniendo el historial completo de la interaccion y respondiendo con coherencia. Su modo de pensamiento permite razonar sobre la intencion del usuario antes de responder.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo. Su capacidad de razonamiento multi-paso ayuda a depurar errores logicos.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o graficos dentro de documentos, combinando vision y texto para tareas de extraccion de datos.
- Asistentes virtuales agénticos: su capacidad de razonamiento multi-paso y function calling permite construir agentes que planifican y ejecutan tareas complejas, como reservar citas, consultar bases de datos o interactuar con APIs externas.
- Traduccion y localizacion: al soportar ingles, chino y otros idiomas, puede traducir contenido manteniendo el contexto y el tono, especialmente util en entornos empresariales multilingues.
- Creacion de contenido creativo: con la configuracion de temperatura adecuada (por ejemplo, 0,7 con top_p 0,85), puede generar textos literarios, guiones o material de marketing con un estilo variado, aprovechando el modo no-pensamiento para respuestas mas fluidas.
- Educacion y tutoria: su capacidad de razonamiento permite explicar conceptos complejos paso a paso, adaptando el nivel de detalle segun las preguntas del usuario, con un contexto largo para mantener el hilo de la leccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas comparativas (MMLU, HumanEval, GSM8K, etc.) para esta version Genesis. Se recomienda consultar los benchmarks del modelo base Qwen3.6-35B-A3B en la documentacion oficial de Alibaba para una referencia del rendimiento sin el post-procesado.

## Requisitos de hardware

- Al ser un modelo MoE con solo 3 000 millones de parametros activos, la VRAM necesaria para inferencia es considerablemente menor que la de un modelo denso de 35 000 millones. Sin embargo, el tamaño del archivo en BF16 es de 87,2 GB, por lo que se requiere cuantizacion para GPUs de consumo.
- El autor recomienda la cuantizacion APEX-Compact, que no se detalla en la informacion, pero sugiere que es la opcion optima para equilibrio entre calidad y uso de memoria.
- Para ejecucion local, se sugiere usar llama.cpp con `--jinja` para el chat template y configurar el offload de capas MoE a CPU (por ejemplo, 40 capas forzadas a CPU) y 15 capas en GPU, con 8 expertos activos. Esto permite ejecutar el modelo en GPUs con 12-16 GB de VRAM, aunque no se proporcionan cifras exactas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (todos compatibles con GGUF). Tambien se puede usar el script de cuantizacion proporcionado por el autor para generar versiones mas ligeras.
- La latencia y el throughput dependen en gran medida del hardware y la cuantizacion elegida; no se dispone de datos medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35 B | 3 B | 262 144 | Si | Apache 2.0 | safetensors, GGUF |
| Qwen3.6-35B-A3B-Genesis (este) | 35 B | 3 B | 128 000+ | Si | Apache 2.0 | GGUF |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 768 | No | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-7B | 7 B | 7 B | 32 768 | Si | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en caracteristicas estructurales, ya que no hay datos de rendimiento publicados para la version Genesis. Frente al modelo base, esta version ofrece el mismo tamaño y arquitectura, pero con el post-procesado Genesis que, segun su autor, mejora la estabilidad y reduce alucinaciones. En comparacion con Mixtral, Qwen3.6 tiene un contexto mucho mayor y capacidades multimodales, ademas de un menor numero de parametros activos. Frente a Qwen2.5-VL-7B, este modelo es significativamente mas grande pero tambien mas capaz en razonamiento y contexto.

## Limitaciones y advertencias

- El algoritmo Genesis es un post-procesado propietario sin validacion academica ni publicacion revisada por pares. Su eficacia se basa en las afirmaciones del autor y no hay estudios independientes que lo confirmen.
- Aunque el autor afirma que reduce el ruido y las alucinaciones, no las elimina por completo. El modelo puede seguir generando contenido falso o inconsistente, especialmente en temas especializados.
- El modelo base esta entrenado principalmente en ingles y chino; el rendimiento en otros idiomas puede ser inferior.
- La configuracion recomendada por el autor (por ejemplo, forzar 40 capas MoE a CPU, 15 capas en GPU, 8 expertos activos) es especifica para su version y puede no ser optima en otros entornos. Es necesario experimentar para encontrar los parametros adecuados.
- El tamaño del archivo en BF16 (87,2 GB) es elevado; sin cuantizacion adicional, no cabe en GPUs de consumo. Se requiere usar las cuantizaciones proporcionadas o generar las propias con el script del autor.
- La licencia Apache 2.0 permite uso comercial, pero el autor solicita donaciones voluntarias; no hay restricciones adicionales conocidas.
- El modelo puede heredar sesgos del conjunto de datos de entrenamiento original de Qwen3.6, como sesgos de genero, raza o ideologicos, que no han sido evaluados en esta version.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Genesis-BF16-GGUF)
- [Modelo base original de Unsloth](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF)
- [Modelo base de Alibaba (Qwen/Qwen3.6-35B-A3B)](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Script de cuantizacion con perfiles Unsloth](https://pastebin.com/hXhcMJn9)
- [Chat template recomendado](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja)
- [Discord del proyecto Genesis](https://discord.gg/SZ5vacTXYf)
- [Otras versiones Genesis del autor](https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF)
