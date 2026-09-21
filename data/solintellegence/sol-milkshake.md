# solintellegence/Sol-Milkshake

## Resumen

Sol Milkshake es un modelo de lenguaje base, decoder-only y recurrente, desarrollado por el usuario solintellegence y publicado en Hugging Face. Su rasgo definitorio es el tamano: **2.990.000 parametros exactos**, entrenados desde cero y expuestos a un total de **2.526.565.888 tokens** a lo largo del proceso de entrenamiento. No es un asistente instruido, sino un modelo base de complecion de siguiente token, orientado explicitamente a la investigacion sobre arquitecturas de altisima eficiencia en parametros.

La arquitectura combina reutilizacion de bloques recurrentes (5 bloques fisicos que producen 11 bloques efectivos), atencion con grouped-query attention, normalizacion hipersferica estilo nGPT, enrutamiento recurrente adaptativo con capacidad de tokens decreciente (100 %, 75 % y 50 % por pasada), memoria tensorializada de n-gramas (2 a 5-gramas, rango 26) y memoria rodante por fragmentos completados. El ancho residual es de 192, el vocabulario es un BPE byte-level de solo 2.048 tokens y la longitud de contexto maxima es de 2.048 tokens.

Su relevancia actual es acotada y muy especifica: sirve como banco de pruebas reproducible para investigar si mecanicas de memoria aprendida, recurrencia de profundidad y optimizacion hipersferica aportan algo en el regimen de los pocos millones de parametros. La implementacion es standalone en MLX y esta pensada para ejecutarse en Apple Silicon. La model card advierte de limitaciones severas de capacidad y los benchmarks publicados, aunque verificables en el propio repositorio, no han sido validados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con recurrencia de profundidad, memoria aprendida y memoria rodante |
| Parametros totales | 2.990.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; pesos distribuidos en MLX NPZ) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | MLX NPZ (`model.npz`) |
| Bloques fisicos / efectivos | 5 / 11 (1 preludio + 3 bloques intermedios x 3 pasadas + 1 coda) |
| Ancho residual | 192 |
| Vocabulario | 2.048 tokens, BPE byte-level |
| Atencion | 6 cabezas de consulta, 2 cabezas clave/valor, dimension de cabeza 32 |
| MLP | Gated SiLU, ancho 512 |
| Embeddings | Tabla de entrada/salida atada (tied) |
| Exposiciones totales a tokens | 2.526.565.888 |
| Libreria | mlx (>= 0.29), tokenizers (>= 0.22), huggingface_hub |
| Fecha de creacion en HF | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo es un decoder-only causal que sustituye parte del apilamiento convencional de capas por recurrencia de profundidad: solo hay 5 bloques fisicos, pero el bloque intermedio se recorre tres veces, lo que da 11 bloques efectivos. La atencion usa grouped-query attention (6 cabezas Q, 2 cabezas KV, dimension 32) con Q y K normalizados a norma unitaria y RoPE. Tras la atencion causal se aplica XSA, una resta de valor sin parametros. El enrutamiento recurrente reduce la capacidad de tokens a medida que avanza la recurrencia: primera pasada completa, segunda al 75 % y tercera al 50 %. El MLP es un gated SiLU de ancho 512.

Ademas de la atencion, el modelo incorpora dos mecanismos de memoria: una memoria aprendida de n-gramas tensorializada de orden 2 a 5 con rango 26, y una memoria rodante que opera sobre fragmentos completados de 32 tokens con 32 ranuras y ancho 64. La optimizacion es de estilo nGPT, con representaciones hipersfericas. Los embeddings de entrada y salida estan atados y la tabla de vocabulario es minima (2.048 tokens).

El entrenamiento inicial uso un curriculum de ingles por etapas construido a partir de FineWeb-Edu, FinePDFs-Edu, subconjuntos multidisciplinares y de pregunta-respuesta de English UltraFineWeb, Cosmopedia y FineMath. El entrenamiento de recuperacion empleo una mezcla 70 / 15 / 15 del curriculum original congelado, Cosmopedia-v2 en ingles y FinePhrase. El tokenizador y los flujos de datos preparados se congelaron antes del entrenamiento, y se mantuvieron las reglas previas de filtrado de calidad, deduplicacion y descontaminacion. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generacion de texto por complecion de siguiente token en ingles, sin modo conversacional.
- Razonamiento de un solo paso muy limitado, condicionado por el tamano del modelo.
- Memoria de n-gramas aprendida (orden 2 a 5) integrada en el modelo, no como modulo externo.
- Memoria rodante sobre fragmentos de 32 tokens con 32 ranuras, que permite reutilizar contexto reciente dentro de la ventana de 2.048 tokens.
- Recurrencia de profundidad con enrutamiento adaptativo de tokens, orientada a reutilizar computo en lugar de ampliar parametros.
- Ejecucion en Apple Silicon mediante MLX, con implementacion standalone incluida en el repositorio.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso dirigido.
- No dispone de vision, audio ni modalidades adicionales.
- No dispone de thinking mode ni de plantillas de chat.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Investigacion en recurrencia de profundidad: permite medir que aporta reutilizar un bloque tres veces frente a apilar capas, con un presupuesto de 2,99 M de parametros y un unico checkpoint publicado.
- Estudio de memoria aprendida de n-gramas: la memoria tensorializada de orden 2 a 5 con rango 26 es inspeccionable y permite analizar si captura regularidades sintacticas sin coste de parametros desproporcionado.
- Banco de pruebas de optimizacion hipersferica estilo nGPT: sirve para reproducir y comparar el comportamiento de la normalizacion en la esfera unitaria en modelos diminutos, donde los efectos de la inicializacion y del learning rate son medibles con presupuestos pequenos.
- Evaluacion de harness (lm-eval): el repositorio incluye las salidas crudas en `evals/`, lo que permite validar protocolos de evaluacion zero-shot y de tokenizacion independiente con un modelo que cabe en memoria en cualquier maquina.
- Investigacion de inferencia en MLX y Apple Silicon: el modelo se carga y genera con MLX puro, por lo que sirve para medir latencias y sobrecarga de runtime en hardware de Apple sin necesidad de GPU dedicada.
- Pruebas de pipelines de tokenizacion extrema: un vocabulario BPE byte-level de 2.048 tokens es un caso limite util para validar herramientas de tokenizacion, calculo de perplejidad y comparacion de metricas normalizadas.
- Prototipado de arquitecturas antes de escalar: tecnicas como XSA, residuales de valor o memoria rodante pueden validarse a bajo coste en este checkpoint antes de trasladarlas a modelos mayores.
- Docencia y demostracion de limites: es un ejemplo claro y reproducible de por que una arquitectura eficiente no compensa una escala de parametros insuficiente para tareas de conocimiento factual o coherencia larga.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las cuatro tareas de lenguaje se evaluaron zero-shot sobre sus splits completos con `lm-eval` 0.4.12 y exactitud normalizada; ArithMark-3 uso su protocolo de exactitud normalizada con tokenizacion independiente.

| Benchmark | Ejemplos | Puntuacion |
|---|---:|---:|
| HellaSwag | 10.042 | 25,02 % |
| ARC-Easy | 2.376 | 29,76 % |
| ARC-Challenge | 1.172 | 22,70 % |
| PIQA | 1.838 | 52,50 % |
| ArithMark-3 | 1.000 | 30,60 % |
| Intelligence Index | — | 3,158 |

Advertencias del propio autor: estas mediciones no han sido verificadas de forma independiente, no se reclama ninguna posicion en leaderboards, y el checkpoint liberado se selecciono entre checkpoints de recuperacion usando esta misma suite de evaluacion, por lo que los valores no deben tratarse como una estimacion limpia sobre datos no vistos. No se proporcionan en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 MB en fp32 (2,99 M de parametros), unos 6 MB en fp16/bf16 y del orden de 1,5 a 3 MB en cuantizaciones int4/int8 teoricas. Calculo derivado del numero de parametros, no publicado por el autor.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta implementado en MLX, que esta orientado a Apple Silicon (chips de la familia M). No se documentan rutas oficiales para CUDA.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en CPU, dado el tamano. La restriccion real no es la memoria, sino la disponibilidad de un runtime compatible.
- Opciones de despliegue: MLX (>= 0.29) con la implementacion standalone `modeling_sol_milkshake.py` incluida en el repositorio. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF o safetensors.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de latencia ni de tokens por segundo.
- Almacenamiento: el repositorio ocupa 0,0 GB segun los metadatos de Hugging Face, coherente con un checkpoint de menos de 3 M de parametros.

## Comparativa con modelos similares

No se ha proporcionado en la informacion disponible ningun dato de comparacion con modelos de la misma categoria, y la busqueda web realizada no devolvio enlaces relevantes (los resultados obtenidos correspondian a contenidos no relacionados con el modelo). Por tanto:

| Modelo | Parametros | Contexto | Licencia | Resultado en benchmarks |
|---|---|---|---|---|
| Sol Milkshake | 2,99 M | 2.048 tokens | CC BY 4.0 | HellaSwag 25,02 %, PIQA 52,50 %, ARC-Easy 29,76 % |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

Cualquier comparacion con otros modelos diminutos de la misma franja de parametros (por ejemplo, modelos de la familia TinyStories o similares) requeriria datos que no se incluyen ni en la model card ni en los resultados de busqueda, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Capacidad severamente limitada: con unos 3 M de parametros, las salidas pueden ser inconsistentes, factualmente incorrectas, repetitivas, incoherentes o inseguras. La propia model card lo declara.
- No es un asistente: es un modelo base sin ajuste por instrucciones, sin plantilla de chat y sin alineacion. No debe tratarse como un asistente conversacional.
- Riesgo de alucinacion: elevado por diseno; el modelo no tiene conocimiento factual fiable a esta escala.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Solo ingles: no hay soporte multilingue documentado.
- Vocabulario muy reducido (2.048 tokens BPE byte-level), lo que penaliza la eficiencia de compresion del texto y puede degradar la calidad en dominios tecnicos.
- Resultados de evaluacion no verificados de forma independiente y con seleccion de checkpoint sobre la misma suite, por lo que estan sesgados al alza respecto a una estimacion held-out limpia.
- Riesgo de sesgos: no se documenta ningun analisis de sesgo, toxicidad o sesgo de dominio, pese a que los datos provienen de subconjuntos filtrados por criterios de calidad educativa.
- Licencia: CC BY 4.0 permite uso comercial y modificacion siempre que se atribuya correctamente. Las licencias y terminos de los datasets de entrenamiento (FineWeb-Edu, FinePDFs-Edu, UltraFineWeb, Cosmopedia, FineMath, FinePhrase) siguen siendo de sus respectivos propietarios y pueden imponer condiciones adicionales al uso o redistribucion.
- No apto para decisiones de alto impacto: el autor lo desaconseja explicitamente.
- Discrepancia de identificadores: la model card usa `solintellegence/Sol-Milkshake-3M-Base` en el ejemplo de carga, mientras que el ID del repositorio consultado es `solintellegence/Sol-Milkshake`. Conviene verificar cual contiene los pesos antes de integrarlo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta. No se documenta soporte de la comunidad ni mantenimiento posterior.
- Dependencia de MLX: sin rutas oficiales a CUDA, GGUF o runtimes de servidor, su integracion en infraestructura convencional de produccion requeriria trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/solintellegence/Sol-Milkshake
- Repositorio referenciado en el ejemplo de la model card: https://huggingface.co/solintellegence/Sol-Milkshake-3M-Base
- Resultados crudos de evaluacion: directorio `evals/` dentro del repositorio de Hugging Face
- Paper: no disponible (no se referencia ninguna publicacion tecnica)
- Blog o articulo tecnico: no disponible
- Repositorio de codigo de entrenamiento: no disponible (la model card indica que el repositorio contiene la implementacion standalone y que no requiere el repositorio de entrenamiento original)
- Demo: no disponible
- Enlaces adicionales de la busqueda web: no se encontro ningun resultado relevante sobre el modelo; los resultados devueltos no guardaban relacion con el contenido solicitado.
