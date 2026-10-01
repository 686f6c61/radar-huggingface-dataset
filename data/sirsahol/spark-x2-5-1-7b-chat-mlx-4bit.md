# SirSahOl/Spark-X2.5-1.7B-chat-mlx-4bit

## Resumen

Spark-X2.5-1.7B-chat-mlx-4bit es una conversion cuantizada a 4 bits en formato MLX del modelo XHToken/Spark-X2.5-1.7B, publicada por el usuario SirSahOl. Se trata, por tanto, de un artefacto de distribucion y no de un entrenamiento nuevo: el autor toma los pesos originales de XHToken y los convierte con mlx-lm 0.31.3 para que se ejecuten de forma nativa en la GPU unificada de los chips Apple Silicon (familias M1, M2, M3 y M4).

El modelo base pertenece a la serie Spark-X2.5 de XHToken, que incluye las variantes Spark-X2.5-4B y Spark-X2.5-1.7B, descritas por su autor como modelos compactos de proposito general orientados a conversacion, redaccion, traduccion, razonamiento, codigo, uso de herramientas y flujos agenticos. La arquitectura declarada es Spark2_5ForCausalLM, con 1.707.657.216 parametros (aproximadamente 1,7B) y una longitud de contexto nominal de 1.048.576 tokens (1M).

Su relevancia practica esta en el binomio tamano-recurso: la cuantizacion a 4 bits deja el repositorio en torno a 1 GB y una huella de VRAM activa estimada de 1,3 GB, con un minimo recomendado de 8 GB de memoria unificada. Esto permite ejecutar un modelo conversacional con ventana de contexto muy larga en portatiles Apple relativamente modestos, algo que las variantes de 8 y 16 bits del mismo autor no consiguen con la misma holgura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer decoder-only, segun la model card) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | 4-bit group-wise, media de 4,50 bits por peso; el mismo autor publica variantes 8-bit y 16-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Modelo base | XHToken/Spark-X2.5-1.7B |
| Framework de conversion | mlx-lm 0.31.3 |
| Tamano del repositorio | 1,0 GB (salida de conversion: 926,0 MB) |
| Huella de VRAM activa | ~1,3 GB (minimo recomendado: 8 GB de memoria unificada) |
| Plantilla de chat | tokens especiales `<|im_start|>`, `<|im_end|>`, `<|endoftext|>` |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como Spark2_5ForCausalLM, una clase personalizada (el repositorio incluye la etiqueta custom_code) que corresponde al modelo base de XHToken. No se documenta en la informacion disponible si se trata de un transformer denso convencional o de una variante hibrida, ni se detallan mecanismos de atencion concrecos, estrategias de decodificacion especulativa o tecnicas de atencion lineal. Tampoco se especifica si el modelo usa atencion completa sobre la ventana de 1M de tokens o algun esquema de atencion eficiente.

Respecto al entrenamiento, no hay datos disponibles: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de ajuste por instrucciones, RLHF o DPO. Lo unico documentado es el proceso de conversion a MLX, que emplea cuantizacion group-wise de 4 bits ejecutada con mlx-lm 0.31.3 en 6,44 segundos y produce un artefacto de 926 MB.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat basada en los tokens `<|im_start|>` / `<|im_end|>`.
- Redaccion y generacion de texto general, segun la descripcion de la serie Spark-X2.5.
- Traduccion entre idiomas (la familia se anuncia con capacidades multilingues, aunque no se publica la lista concreta de idiomas).
- Razonamiento y resolucion de problemas de complejidad media.
- Generacion de codigo, segun la descripcion de la serie.
- Uso de herramientas (tool calling / function calling) y flujos agenticos de varios pasos, segun la documentacion de XHToken para la familia Spark-X2.5.
- Ventana de contexto nominal de 1.048.576 tokens, adecuada para tareas de recuperacion sobre documentos largos.
- Inferencia nativa en GPU de Apple Silicon mediante MLX, con soporte de CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local en portatiles Apple: con 1,3 GB de VRAM activa y unas necesidades minimas de 8 GB de memoria unificada, el modelo puede mantener conversaciones multi-turno en un MacBook Air M1 sin desplazar al resto del sistema, algo inviable con modelos de 7B o superiores en 16 bits.
- Procesamiento de documentos largos con ventana de 1M de tokens: resumen, extraccion de entidades y respuesta a preguntas sobre contratos, informes o bases de codigo extensas, aprovechando que la ventana nominal cubre ordenes de magnitud muy superiores a los 32K habituales en modelos de este tamano.
- Generacion y autocompletado de codigo en el editor: el modelo puede integrarse como backend local de asistentes tipo plugin, con un consumo de memoria que permite mantener abiertos IDE, navegador y herramientas de desarrollo en equipos de 8 a 16 GB.
- Automatizacion de tareas con herramientas: dado el soporte declarado de tool calling y flujos agenticos, puede actuar como planificador ligero que invoca APIs o scripts locales en pipelines de automatizacion personal.
- Traduccion y reescritura de textos en un entorno sin conexion: util en entornos con requisitos de privacidad donde no se puede enviar contenido a una API externa, al ejecutarse completamente en local.
- Prototipado y evaluacion de tecnicas de cuantizacion: el repositorio incluye variantes de 4, 8 y 16 bits del mismo modelo, lo que lo convierte en un banco de pruebas controlado para medir el impacto de la precision en calidad y velocidad sobre hardware Apple.
- Filtrado y clasificacion de texto a bajo coste: al ser un modelo de 1,7B, se puede desplegar en segundo plano para tareas de etiquetado, moderacion o enrutado de peticiones antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes). Los unicos datos numericos disponibles son mediciones de velocidad de inferencia realizadas en un Apple M1 con 8 GB de memoria unificada, sobre 5 ejecuciones con un maximo de 256 tokens generados:

| Metrica | 4-bit (este repositorio) | 8-bit | 16-bit |
|---|---|---|---|
| Tokens por segundo | 46,62 | 21,4 | 11,59 |
| TTFT (time to first token) | 21,45 ms | 46,76 ms | 86,35 ms |
| Memoria pico | 1223,0 MB | 1042,8 MB | 90,0 MB (dato tal como se publica) |

No se han publicado resultados de benchmarks de calidad en la informacion disponible, por lo que no es posible comparar la precision del modelo frente a alternativas de tamano similar con datos verificables.

## Requisitos de hardware

- VRAM estimada (memoria unificada en Apple Silicon): ~1,3 GB para la variante 4-bit, ~2,2 GB para 8-bit y ~4,2 GB para 16-bit.
- Memoria unificada minima recomendada: 8 GB para la variante 4-bit; 16 GB o mas para 8-bit; 32 GB o mas para 16-bit.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El formato MLX no se ejecuta en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada. No esta pensado para GPU de escritorio tipo RTX 4090, A100 o H100.
- Opciones de despliegue: mlx-lm mediante CLI o API de Python, y ejecucion desde LM Studio. El autor incluye ademas un Modelfile de Ollama, si bien conviene verificar la compatibilidad real, ya que MLX no es un formato nativo del ecosistema llama.cpp/Ollama.
- Rendimiento medido en Apple M1 de 8 GB: 46,62 tokens/s con 4 bits y un TTFT de 21,45 ms, frente a 21,4 tokens/s en 8 bits y 11,59 tokens/s en 16 bits.
- Estas cifras corresponden a secuencias cortas (256 tokens de generacion); con contextos cercanos al millon de tokens, el coste de memoria de la cache KV crece con la longitud de la secuencia y exige mucha mas memoria unificada de la indicada como minima.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks de calidad para comparar con otras familias de modelos de ~1,7B, por lo que la comparacion cuantitativa con alternativas queda como no disponible. La comparacion mas fiable es interna, entre las tres variantes de cuantizacion publicadas por el mismo autor a partir del mismo modelo base:

| Variante | Tamano en disco | Huella de VRAM | Hardware objetivo | Ventaja principal |
|---|---|---|---|---|
| 4-bit MLX (este repositorio) | ~1,3 GB | ~1,3 GB | M1/M2/M3/M4 con 8 GB o mas | Maxima velocidad de generacion y minima huella de RAM |
| 8-bit MLX | ~2,2 GB | ~2,2 GB | M1/M2/M3/M4 Pro/Max con 16 GB o mas | Equilibrio entre precision y velocidad |
| 16-bit MLX | ~4,2 GB | ~4,2 GB | M2/M3/M4 Max/Ultra con 32 GB o mas | Precision sin cuantizar, calidad de referencia |

Como referencia de categoria, los modelos compactos comparables por tamano serian familias como Qwen2.5-1.5B, Llama-3.2-1B o SmolLM2-1.7B, pero no se dispone en la informacion proporcionada de sus parametros exactos, ventanas de contexto ni resultados de benchmarks para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion group-wise de 4 bits introduce perdida de precision frente a los pesos sin cuantizar; el propio autor recomienda usar las variantes de 8 o 16 bits para derivaciones matematicas profundas o razonamiento critico.
- Las secuencias de contexto superiores a 32K tokens exigen suficiente memoria unificada libre; con ventanas cercanas a 1M de tokens el coste de la cache KV puede superar ampliamente la huella base de 1,3 GB.
- Se trata de una cuantizacion weight-only: no se documenta ningun tratamiento especial de la cache KV que reduzca su consumo.
- No hay datos de sesgos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), por lo que no es posible evaluar risques de sesgo o toxicidad.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad factual, y un modelo de 1,7B tiene una capacidad limitada de verificacion interna de hechos.
- La lista de idiomas soportados no esta disponible; la familia se anuncia como multilingue, pero sin detalle de cobertura ni de calidad por idioma.
- El contexto de 1M de tokens es una cifra nominal; no se documentan resultados de pruebas de recuperacion a esa longitud (needle in a haystack ni similares).
- Compatibilidad restringida a Apple Silicon: el formato MLX no es portable a GPU NVIDIA o AMD.
- Licencia apache-2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar asimismo la licencia del modelo base XHToken/Spark-X2.5-1.7B.
- Idoneidad para produccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay benchmarks de calidad publicados, por lo que se recomienda validacion propia antes de un despliegue en produccion.
- La conversion la realiza un tercero (SirSahOl) y no el equipo de XHToken, de modo que la trazabilidad del artefacto depende del autor de la conversion.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Variante 8-bit MLX: https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-8bit
- Variante 16-bit MLX: https://huggingface.co/SirSahOl/Spark-X2.5-1.7B-chat-mlx-16bit
- Repositorio GitHub de la serie Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Pagina del modelo en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B
- Sitio oficial de XHToken: https://www.xhtoken.ai/?lang=en
- Ficha en Applied: https://theapplied.co/models/xhtoken-spark-x2-5-1-7b
- Ficha en LLM Reference: https://www.llmreference.com/model/spark-x2.5-1.7b
- Framework MLX de Apple: https://github.com/ml-explore/mlx
