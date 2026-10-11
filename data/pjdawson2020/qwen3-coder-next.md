# pjdawson2020/Qwen3-Coder-Next

## Resumen

Qwen3-Coder-Next es un modelo de lenguaje de pesos abiertos orientado especificamente a agentes de programacion y desarrollo local. Se distribuye bajo licencia Apache 2.0 y su model card lo atribuye al proyecto Qwen (la republicacion analizada esta firmada por el usuario pjdawson2020 en HuggingFace). Se trata de un transformer causal con una arquitectura hibrida poco habitual que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa Gated Attention, intercaladas con capas de mezcla de expertos (MoE).

El dato mas relevante es su eficiencia computacional: 79.674.391.296 parametros totales (unos 79,7B, de los cuales 79B son no de embedding) pero solo 3B parametros activados por token, gracias a 512 expertos de los que se activan 10 mas 1 compartido. Segun el autor, esto le permite alcanzar un rendimiento comparable a modelos con entre 10 y 20 veces mas parametros activos, lo que reduce de forma directa el coste por token en despliegues de agentes.

Su otra caracteristica diferencial es la ventana de contexto de 262.144 tokens (256k) de forma nativa, combinada con adaptabilidad a distintas plantillas de scaffold de agentes y soporte de tool calling. Esto lo hace integrable en entornos CLI/IDE como Claude Code, Qwen Code, Qoder, Kilo, Trae o Cline. Una limitacion explicita de la model card: el modelo solo funciona en modo no-thinking y no genera bloques ``. El repositorio pesa 159,4 GB (compatible con pesos en BF16) y, en el momento de la consulta, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: Gated DeltaNet (atencion lineal) + Gated Attention, con capas MoE. Layout: 12 * (3 * (Gated DeltaNet -> MoE) -> 1 * (Gated Attention -> MoE)) |
| Parametros totales | 79.674.391.296 (~79,7B); 79B no de embedding |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativo (el autor recomienda reducir a 32.768 si aparecen problemas de memoria) |
| Tipos de cuantizacion | no disponible (no se detallan en la informacion proporcionada; se menciona soporte de llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers, lo que implica formatos GGUF/MLX, pero sin especificar variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; pipeline text-generation) |
| Dimension oculta | 2.048 |
| Numero de capas | 48 |
| Gated Attention | 16 cabezas Q, 2 cabezas KV, dimension de cabeza 256, dimension RoPE 64 |
| Gated DeltaNet | 32 cabezas lineales (V), 16 cabezas (QK), dimension de cabeza 128 |
| Mixture of Experts | 512 expertos, 10 activados, 1 compartido, dimension intermedia de experto 512 |
| Etapa de entrenamiento | Pretraining y post-training |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal hibrido que alterna dos mecanismos de atencion. El bloque principal usa Gated DeltaNet con atencion lineal (16 cabezas QK y 32 cabezas V, dimension de cabeza 128), un esquema de espacio de estados con compuertas que reduce el coste computacional del contexto largo respecto a la atencion cuadratica. Cada tres de estos bloques se intercala uno de Gated Attention completa (16 cabezas Q, 2 cabezas KV, dimension de cabeza 256, RoPE de dimension 64), que recupera precision en las dependencias de largo alcance. Toda la pila consta de 48 capas con dimension oculta 2.048.

Sobre esa columna vertebral se aplica una capa MoE con 512 expertos, 10 activados por token mas 1 experto compartido y dimension intermedia de 512, lo que da la relacion de esparsidad que explica que 79,7B parametros totales se reduzcan a 3B activos. La model card indica que el entrenamiento paso por pretraining y post-training, e insiste en que las capacidades agenticas (razonamiento de horizonte largo, uso complejo de herramientas y recuperacion ante fallos de ejecucion) provienen de una receta de entrenamiento elaborada especificamente para ello. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF, DPO u otras. Tampoco se documentan innovaciones adicionales de decodificacion, como decodificacion especulativa.

## Capacidades

- Generacion de codigo y razonamiento de horizonte largo orientado a tareas de ingenieria de software.
- Uso avanzado de herramientas (tool calling / function calling); la model card lo destaca como uno de sus puntos fuertes.
- Recuperacion ante fallos de ejecucion: el modelo esta entrenado para reintentar y corregir tras errores de sus propias herramientas o scripts.
- Integracion con scaffolds de agentes: admite distintas plantillas de CLI/IDE (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline, entre otras).
- Contexto largo de 262.144 tokens, suficiente para volcar repositorios o conjuntos de archivos extensos en un unico prompt.
- Modo no-thinking unicamente: no genera bloques `` y no requiere desactivar explicitamente el modo thinking mediante `enable_thinking=False`.
- Capacidades multilingues: no disponible (la model card no detalla el reparto de idiomas).
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Agente de programacion integrado en el IDE o en la terminal: el modelo se conecta mediante tool calling a las herramientas del editor y ejecuta ciclos de edicion, compilacion y correccion. Es adecuado por su entrenamiento especifico en recuperacion de fallos y su adaptabilidad a scaffolds como Claude Code o Cline.
- Refactorizacion de bases de code extensas: con 262.144 tokens de contexto se pueden incluir varios modulos y sus dependencias en una sola pasada, lo que evita fragmentar la tarea en trozos que pierden coherencia entre archivos.
- Revision de pull requests y auditoria de codigo: el modelo puede analizar el diff junto con los archivos afectados y el historial relevante, y emitir comentarios con referencias cruzadas entre ficheros.
- Generacion y reparacion de tests en pipelines de CI/CD: al soportar tool calling, se puede orquestar en un runner que ejecute la suite, lea los fallos y vuelva a generar codigo hasta que pase, con el modelo como planificador del bucle.
- Migraciones de version o de framework: tareas de grano largo (por ejemplo, pasar una base de codigo de una version mayor a otra) se benefician del contexto largo y del razonamiento multi-paso.
- Automatizacion de operaciones y DevOps: el agente puede invocar herramientas de shell, consultar logs y proponer cambios de configuracion, apoyandose en el parser de tool calls `qwen3_coder` de vLLM o SGLang.
- Desarrollo local y sin conexion: con el soporte existente en Ollama, LMStudio, llama.cpp, MLX-LM y KTransformers, es viable ejecutarlo en una estacion de trabajo con cuantizacion, algo coherente con los 3B parametros activos.
- Asistencia sobre documentacion tecnica y esquemas: generar codigo a partir de especificaciones OpenAPI, esquemas de base de datos o documentacion extensa que quepa en la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia dos imagenes con graficos comparativos (`benchmarks.png` y `swebench_pro.png` alojadas en el CDN de Alibaba Cloud) y afirma que el modelo alcanza un rendimiento comparable a modelos con entre 10 y 20 veces mas parametros activos, pero no se incluyen cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ningun otro conjunto de evaluacion en el texto proporcionado.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 159,4 GB (coincide con el tamano del repositorio y con 79,67B parametros a 2 bytes por parametro).
- VRAM estimada en BF16: en torno a 160 GB solo para pesos, mas la cache KV. Con 262.144 tokens de contexto la cache KV es muy grande; la propia model card advierte de posibles errores OOM y recomienda bajar a 32.768 tokens.
- VRAM estimada a 8 bits: del orden de 80 GB. A 4 bits: del orden de 40-45 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos confirmados en la documentacion.
- GPU de centro de datos: 2 a 4 GPU A100 o H100 de 80 GB para BF16 con tensor parallel. Los ejemplos oficiales usan `--tp-size 2` y `--tensor-parallel-size 2`, aunque el texto que los precede menciona 4 GPU, una discrepancia presente en la model card. Con cuantizacion de 4 bits podria ser suficiente una configuracion de 1-2 GPU de 80 GB.
- GPU de consumo: no cabe completo en una RTX 4090 (24 GB) ni siquiera en 4 bits. Con 2 x RTX 3090/4090 (48 GB en total) seria posible en 4 bits. En una sola GPU de consumo requiere offload de expertos a RAM del sistema (KTransformers, llama.cpp), con la penalizacion de latencia asociada.
- Opciones de despliegue: vLLM >= 0.15.0, SGLang >= 0.5.8, Ollama, LMStudio, llama.cpp, MLX-LM, KTransformers y el propio `transformers`. Tanto vLLM como SGLang permiten exponer una API compatible con OpenAI; se debe activar `--enable-auto-tool-choice --tool-call-parser qwen3_coder` para el uso de herramientas.
- Latencia y throughput: no disponibles. Cualitativamente, los 3B parametros activos implican un coste por token bajo en comparacion con modelos densos del mismo tamano total, siempre que la implementacion aproveche la esparsidad del MoE.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones ni resultados de modelos alternativos de la misma categoria (por ejemplo, otros modelos de codigo con arquitectura MoE de rango 30-80B con pocos parametros activos). No se dispone de datos verificados de parametros, contexto, rendimiento, licencia o disponibilidad de terceros que permitan una comparacion rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Solo modo no-thinking: no genera bloques de razonamiento explicito (``). Los flujos que dependan de ese formato no funcionaran.
- Riesgo de alucinacion en codigo: como cualquier modelo generativo, puede inventar APIs, firmas de funcion o dependencias que no existen. En tareas agenticas conviene validar siempre el codigo ejecutandolo.
- La ventana de 256k puede provocar OOM en despliegues con memoria ajustada; el autor recomienda reducirla a 32.768 tokens en esos casos.
- Idiomas soportados: no disponible. La model card no documenta la cobertura multilingue, por lo que no se puede asumir calidad homogenea fuera del ingles y del codigo.
- Ausencia de benchmarks verificables: las afirmaciones de rendimiento de la model card remiten a imagenes sin cifras en el texto. Cualquier decision de produccion deberia apoyarse en una evaluacion propia.
- Procedencia del repositorio: la ficha analizada corresponde al repositorio `pjdawson2020/Qwen3-Coder-Next`, con 0 descargas y 0 likes, mientras que la model card y el enlace de licencia apuntan al repositorio `Qwen/Qwen3-Coder-Next`. Conviene verificar el origen real de los pesos y usar el repositorio oficial como referencia. La fecha de creacion registrada (2026-10-11) es atipica y debe comprobarse.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre con la atribucion y el aviso de licencia correspondientes. No se han identificado restricciones adicionales en la informacion disponible.
- Formato de pesos limitado a safetensors en el repositorio consultado; los formatos cuantizados para despliegue local dependen de conversiones de terceros no detalladas.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/pjdawson2020/Qwen3-Coder-Next
- Repositorio oficial referenciado por la model card: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia (Apache 2.0): https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- Blog del modelo: https://qwen.ai/blog?id=qwen3-coder-next
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Grafico de benchmarks: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3-Coder-Next/benchmarks.png
- Grafico de SWE-bench Pro: https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen3-Coder-Next/swebench_pro.png
- Motor de serving SGLang: https://github.com/sgl-project/sglang
- Documentacion de instalacion de SGLang: https://docs.sglang.ai/get_started/install.html
- Motor de serving vLLM: https://github.com/vllm-project/vllm
- Documentacion de instalacion de vLLM: https://docs.vllm.ai/en/stable/getting_started/installation/index.html
- Nota: los resultados de la busqueda web realizada no aportan informacion tecnica relevante sobre el modelo (contenido no relacionado).
