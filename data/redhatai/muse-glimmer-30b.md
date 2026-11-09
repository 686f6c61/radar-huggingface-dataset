# RedHatAI/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29.600 millones de parametros desarrollado por Meta Superintelligence Lab y distribuido en Hugging Face por RedHatAI. Combina un transformer causal denso con un codificador de percepcion dedicado de unos 1.800 millones de parametros (ViT-G/14), lo que le permite aceptar entradas intercaladas de texto e imagen y producir salida exclusivamente textual. Su proposito declarado es ejecutar tareas agenticas autonomas de forma local, sin infraestructura cloud ni acceso a red.

El modelo esta disenado explicitamente para despliegue en hardware de consumo. Mediante cuantizacion a 4 bits, el autor reporta que los pesos del modelo de lenguaje caben en menos de 20 GB, dejando margen para la cache KV, el codificador visual y un modelo borrador de decodificacion especulativa dentro de un presupuesto de 24 GB o 32 GB de VRAM. La ventana de contexto declarada es de 131.072 tokens o mas, con un vocabulario de 202.048 tokens y un corte de conocimiento del 4 de enero de 2026.

La relevancia actual del modelo reside en su enfoque: no compite por tamano bruto sino por completar tareas de agente de extremo a extremo (uso de herramientas, recuperacion ante fallos, razonamiento multi-paso y comprension multimodal) en un envelope de memoria que cabe en una GPU de consumo o en un portatil Apple Silicon. La licencia Apache 2.0 y la compatibilidad con scaffolds como OpenClaw y Hermes Agent refuerzan su orientacion a produccion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (aprox. 29,6B, incluye el codificador visual) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | K-Quant-Dynamic (objetivo 32 GB VRAM), K-Quant-17GB (objetivo 24 GB VRAM); pesos completos en safetensors |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 6656 |
| Capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido |
| Ventana deslizante | 2048 tokens |
| Atencion con compuertas (gated attention) | Si |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA, ratio 16:1) |
| Dimension de cabeza | 128 |
| Tipo de FFN | SwiGLU |
| Dimension intermedia del FFN | 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Codificador de percepcion | ViT-G/14 de aprox. 1,8B, 50 capas, ancho 1536, patch 14 |
| Vocabulario | 202.048 (200.000 BPE + 2.048 especiales) |
| Tokens visuales maximos por imagen | 4096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Corte de conocimiento | 4 de enero de 2026 |
| Tool calling | Si (parser `muse_glimmer`) |
| Tamano del repo | 59,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 52 capas con dimension oculta 6656 y FFN de tipo SwiGLU con dimension intermedia 19.968. El patron de atencion alterna tres capas locales con ventana deslizante de 2048 tokens por cada capa global, y la codificacion posicional RoPE (theta 500.000) se aplica unicamente en las capas locales. La atencion usa GQA con 32 cabezas de consulta y solo 2 cabezas de clave/valor (ratio 16:1) e incorpora compuertas. El codificador de percepcion es un ViT-G/14 de unas 50 capas, ancho 1536 y patch de 14, que admite hasta 4096 tokens visuales por imagen.

El modelo se describe como destilado de Muse Spark y entrenado sobre contenido multimodal procedente de datos publicos, datos de terceros e informacion de productos y servicios de Meta, curado por redes de proveedores externos y personal de Meta. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones tecnicas destacadas figura la decodificacion especulativa mediante un modelo borrador basado en DFlash: una red companera de 5 capas que predice bloques de 16 tokens en un unico forward pass, con atencion de ventana deslizante de 2048 en todas sus capas, 32 cabezas de consulta y 8 de clave/valor, y capas de caracteristicas ocultas uniformes sobre las capas {1, 13, 25, 37, 49} del modelo objetivo. El modelo principal verifica las propuestas en paralelo, aceptando los tokens correctos y corrigiendo los erroneos, con una calidad de salida identica a la generacion token a token.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprension multimodal de entrada: interpreta capturas de pantalla, graficos y documentos junto con la conversacion, mediante el codificador de percepcion dedicado.
- Uso fiable de herramientas y function calling, con invocacion de herramientas segun esquemas precisos a lo largo de flujos prolongados; parser `muse_glimmer` y soporte de `--enable-auto-tool-choice`.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Completado de tareas agenticas de extremo a extremo dentro de scaffolds, con compatibilidad declarada con OpenClaw, Hermes Agent y otros patrones de orquestacion.
- Esfuerzo de razonamiento controlable: permite seleccionar distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidades multilingues derivadas de entrenamiento en mas de 100 idiomas.
- Escritura y depuracion de codigo en el contexto de tareas de ingenieria de software.
- No se declara soporte de audio ni de salida multimodal; la salida es exclusivamente textual.

## Casos de uso

- Agentes de escritorio autonomos: el modelo puede operar sobre capturas de pantalla e instrucciones en lenguaje natural para completar tareas en aplicaciones locales, aprovechando el codificador visual y el contexto de 131.072+ tokens para mantener el estado de la tarea a lo largo de sesiones largas.
- Automatizacion de ingenieria de software: integrado en scaffolds de agente, resuelve incidencias y escribe parches en repositorios, con capacidad de depurar codigo y reintentar cuando una prueba o una herramienta de build falla, lo que encaja en pipelines de CI/CD con pasos de verificacion.
- Orquestacion de herramientas empresariales (MCP): el soporte de function calling con esquemas precisos y el parser dedicado permiten encadenar llamadas a servidores MCP en flujos multi-turno sin intervencion humana, con recuperacion automatica ante respuestas inesperadas.
- Asistente de analisis documental local: interpreta graficos, tablas e imagenes de documentos junto al texto de la conversacion, adecuado para entornos con requisitos de confidencialidad donde no se permite enviar datos a la nube.
- Agente de busqueda profunda (deep research): con 131.072+ tokens de contexto puede acumular resultados de multiples consultas, sintetizar hallazgos y mantener un plan de investigacion coherente a lo largo de decenas de pasos.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 24 GB o 32 GB de VRAM en cuantizacion K-Quant, sirve como backend de agentes para equipos de desarrollo sin acceso a clústeres de GPU, con latencia apta para conversacion fluida segun las mediciones del autor en M4-Max, M5-Max y RTX 5090.
- Atencion al cliente tecnica con escalado a herramientas: gestiona conversaciones multi-turno, consulta sistemas internos mediante tool calling y reconoce capturas de error enviadas por el usuario gracias a la entrada multimodal.

## Benchmarks y rendimiento

La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, y una metrica de degradacion por cuantizacion promediada sobre 15 benchmarks comunes, pero no publica los valores numericos de dichos benchmarks. Los unicos datos cuantitativos disponibles son los de degradacion por compresion:

| Configuracion | Degradacion media (15 benchmarks) | Hardware objetivo |
|---|---|---|
| Precision completa | Referencia | 64 GB VRAM |
| K-Quant-Dynamic | 0,2 % | 32 GB VRAM |
| K-Quant-17GB | 1,0 % | 24 GB VRAM |

No se han publicado resultados numericos de MMLU, HumanEval, GSM8K ni del resto de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 64 GB en precision completa; 32 GB con cuantizacion K-Quant-Dynamic; 24 GB con K-Quant-17GB (pesos del modelo de lenguaje por debajo de 20 GB, dejando margen para cache KV, codificador visual y borrador de decodificacion especulativa).
- GPU recomendadas: el autor valida el modelo en NVIDIA RTX 5090; el envelope de 24-32 GB sugiere compatibilidad con GPUs de consumo de gama alta de 24 GB o mas (por ejemplo, RTX 4090 o RTX 5090) y con Apple Silicon de gama alta (MacBook M4-Max y M5-Max medidos por el autor).
- Cabe en GPU de consumo: si, en configuracion K-Quant-17GB dentro de 24 GB de VRAM.
- Opciones de despliegue: transformers como libreria base; los argumentos de CLI requeridos (`--generation-config auto`, `--enable-auto-tool-choice`) apuntan a un servidor de inferencia compatible con la API de endpoints; no se detallan en la informacion disponible soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor afirma velocidad suficiente para conversacion fluida e interaccion de agente en tiempo real en M4-Max, M5-Max y RTX 5090 con el modelo K-Quant-17GB y el borrador DFlash cuantizado, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Muse Glimmer-30B | 29,6B (denso) | 131.072+ | Texto + imagen de entrada | Apache 2.0 | No publicados numericamente |
| Alternativas de ~30B denso | No disponible | No disponible | No disponible | No disponible | No disponible |

No disponible: no se han identificado en la informacion proporcionada modelos alternativos concretos con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no publica resultados numericos de benchmarks, por lo que las afirmaciones de calidad agentica no son verificables de forma independiente con los datos disponibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; el modelo no incorpora en la informacion disponible mecanismos de verificacion factual mas alla del uso de herramientas.
- La lista concreta de idiomas soportados no esta disponible; solo se declara entrenamiento en mas de 100 idiomas, sin garantias por idioma.
- El corte de conocimiento es el 4 de enero de 2026; informacion posterior no esta cubierta y requiere herramientas de busqueda externas.
- La degradacion por cuantizacion es minima segun el autor (0,2 % y 1,0 % en promedio sobre 15 benchmarks), pero es un promedio: tareas concretas pueden degradarse por encima de esa cifra.
- El rendimiento agentico depende del scaffold utilizado; la compatibilidad se declara para OpenClaw, Hermes Agent y otros patrones, pero no se detallan limitaciones por scaffold.
- Aunque la licencia es Apache 2.0, la model card indica que los datos de entrenamiento incluyen informacion de productos y servicios de Meta y datos de terceros; conviene revisar las condiciones de uso de dichos datos en despliegues comerciales.
- El modelo solo produce salida textual; no genera imagenes ni audio.
- El tamano del repositorio (59,6 GB) implica requisitos de almacenamiento y transferencia considerables para el despliegue local.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B
- Model card (README): https://huggingface.co/RedHatAI/Muse-Glimmer-30B/blob/main/README.md
- Paper del codificador de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificacion especulativa por difusion de bloques): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Licencia Apache 2.0 (texto oficial): https://www.apache.org/licenses/LICENSE-2.0
