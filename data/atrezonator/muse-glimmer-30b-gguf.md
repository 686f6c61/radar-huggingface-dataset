# atrezonator/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal de aproximadamente 30.000 millones de parametros desarrollado por Meta Superintelligence Lab, publicado en agosto de 2026 bajo licencia Apache 2.0. Se trata de un modelo denso con un encoder de percepcion dedicado (~1,8B parametros, ViT-G/14) que acepta entrada intercalada de texto e imagen y genera exclusivamente texto. El modelo fue destilado a partir de Muse Spark y esta disenado especificamente para tareas agenticas autonomas ejecutadas en hardware de consumo, sin necesidad de infraestructura en la nube ni acceso a red.

La ficha que nos ocupa, `atrezonator/Muse-Glimmer-30B-GGUF`, es una reproduccion en formato GGUF del modelo base `meta-models/Muse-Glimmer-30B`, generada con las cuantizaciones Unsloth Dynamic 2.0. El repositorio ocupa 317 GB e incluye multiples variantes de cuantizacion; el dato de parametros registrado en los safetensors es de 27.854.794.240, ligeramente inferior a los ~29,6B que declara la model card al incluir el encoder de vision.

Su relevancia actual radica en la combinacion de tres factores: contexto de 131.072 tokens o superior, soporte multimodal de entrada y un enfoque explicito en uso de herramientas, razonamiento multi-paso y recuperacion ante fallos, todo ello con requisitos de VRAM que bajan hasta un envelope de 24 GB con cuantizacion de 17 GB y una degradacion declarada del 1,0%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | ~29,6B segun model card (~27.854.794.240 segun safetensors del repo GGUF; incluye el encoder de vision en la cifra de la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 2.0; variantes citadas: K-Quant-Dynamic, K-Quant-17GB y una variante de 2 bits |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas; no se detalla la lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base `meta-models/Muse-Glimmer-30B` |
| Dimension oculta | 6656 |
| Capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido |
| Ventana deslizante | 2048 tokens |
| Atencion con puerta (gated attention) | Si |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA con ratio 16:1) |
| Dimension de cabeza | 128 |
| Tipo de FFN | SwiGLU, dimension intermedia 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Tokens visuales maximos por imagen | 4.096 |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Fecha de publicacion | Agosto de 2026 |
| Tamano del repositorio | 317,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 52 capas con dimension oculta 6656 y FFN de tipo SwiGLU con dimension intermedia 19.968. La atencion combina un patron hibrido de capas locales y globales ([Local, Local, Local, Global]) con ventana deslizante de 2048 tokens, atencion con puerta y GQA con ratio 16:1 (32 cabezas de consulta frente a 2 de clave/valor, con dimension de cabeza 128). La codificacion posicional emplea RoPE con theta de 500.000 y se aplica unicamente en las capas locales. El vocabulario es de 202.048 entradas, resultado de 200.000 tokens BPE mas 2.048 tokens especiales. El encoder de percepcion es un ViT-G/14 de ~1,8B parametros, 50 capas, anchura 1536 y patch de 14, con un maximo de 4.096 tokens visuales por imagen.

La model card indica que el modelo fue destilado de Muse Spark y que los datos de entrenamiento son contenido multimodal procedente de fuentes publicas, datos aportados por terceros e informacion de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. La fecha de corte de conocimiento es el 4 de enero de 2026. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. Si se mencionan capacidades de "esfuerzo controlable" (distintas intensidades de razonamiento, con toggles de thinking en Unsloth) y la existencia de un drafter de decodificacion especulativa que se ejecuta junto al modelo y al cache KV.

## Capacidades

- Generacion de texto y razonamiento multi-paso sostenido sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Uso fiable de herramientas (function calling) con esquemas precisos a lo largo de flujos prolongados; la model card afirma que la variante de 2 bits ejecuta mas de 100 llamadas a herramientas dentro de Unsloth.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Comprension multimodal de entrada: interpretacion de capturas de pantalla, graficos y documentos junto a la conversacion, mediante el encoder de percepcion.
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent.
- Esfuerzo controlable: seleccion de distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Capacidades de codigo y depuracion dentro de scaffolds, evaluadas en SWE-Bench segun la model card.
- Modo thinking con toggles en Unsloth.
- No se documenta salida de audio ni generacion de imagen: la salida es exclusivamente texto.

## Casos de uso

- Agentes autonomos locales: el modelo puede orquestar flujos multi-paso con llamadas a herramientas y reintentos sobre fallos sin depender de servicios en la nube, gracias a que las cuantizaciones de 17-20 GB caben en GPUs de 24-32 GB.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto de 131.072+ tokens, lo que permite mantener el historial completo de una incidencia larga sin truncar.
- Automatizacion de tareas de escritorio: al aceptar capturas de pantalla como entrada, puede interpretar interfaces graficas, leer graficos y documentos y decidir la siguiente accion dentro de un scaffold agentico.
- Generacion y depuracion de codigo en produccion: su evaluacion en SWE-Bench y su soporte de tool calling permiten integrarlo en pipelines de CI/CD para proponer parches, ejecutar tests y corregir errores de forma iterativa.
- Analisis de documentos tecnicos con figuras: la combinacion de encoder visual y contexto largo permite procesar informes con tablas, diagramas y capturas manteniendo la coherencia entre secciones.
- Investigacion y busqueda profunda: la model card cita evaluacion en DeepSearch QA, lo que encaja con flujos de recuperacion y sintesis de informacion en multiples pasos.
- Asistentes multilingues: con entrenamiento en mas de 100 idiomas, es adecuado para despliegues que atienden a usuarios en varias lenguas desde una unica instancia.
- Prototipado e investigacion en local: al ser Apache 2.0 y ejecutable en hardware de consumo, permite experimentar con agentes y cuantizaciones sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card unicamente nombra los conjuntos de evaluacion empleados para medir la finalizacion de tareas agenticas de extremo a extremo (DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench), junto con las capacidades evaluadas, pero no incluye cifras.

Los unicos datos cuantitativos de rendimiento disponibles son las cifras de degradacion por cuantizacion declaradas por el autor:

| Variante | Precision completa | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion declarada | - | 0,2 % | 1,0 % |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

La model card afirma que la compresion a 4 bits reduce el modelo de lenguaje a menos de 20 GB y que la degradacion es minima o nula en tareas agenticas, pero no aporta las tablas de resultados que respaldan esa afirmacion.

## Requisitos de hardware

- Precision completa: ~64 GB de VRAM objetivo segun la model card.
- Cuantizacion K-Quant-Dynamic: ~32 GB de VRAM, con 0,2 % de degradacion declarada.
- Cuantizacion K-Quant-17GB: ~24 GB de VRAM, con 1,0 % de degradacion declarada.
- El envelope de 24-32 GB debe acomodar simultaneamente los pesos, el cache KV, el encoder de percepcion (~1,8B) y el drafter de decodificacion especulativa.
- Cabe en GPUs de consumo de gama alta con 24 GB (por ejemplo, RTX 3090 o RTX 4090) usando la variante de 17 GB; en 32 GB (por ejemplo, RTX 5090 o configuraciones profesionales equivalentes) con K-Quant-Dynamic.
- GPUs de centro de datos (A100, H100) quedan cubiertas de sobra para precision completa o para servir varias instancias.
- Opciones de despliegue mencionadas: Unsloth (con toggles de thinking y ejecucion de llamadas a herramientas) y el ecosistema GGUF. No se detallan en la informacion disponible otras integraciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica diseno para "velocidades practicas" en hardware de consumo, sin cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye tablas comparativas ni resultados numericos frente a otros modelos de la misma categoria. El unico punto de referencia documentado es el propio modelo base `meta-models/Muse-Glimmer-30B`, del que este repositorio es una conversion a GGUF con cuantizaciones Unsloth Dynamic 2.0.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| atrezonator/Muse-Glimmer-30B-GGUF | ~27,85B (safetensors) | 131.072+ | Apache 2.0 | GGUF | - |
| meta-models/Muse-Glimmer-30B | ~29,6B (con encoder de vision) | 131.072+ | Apache 2.0 | Safetensors | Modelo base, sin datos comparativos publicados en la informacion disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados numericos de benchmarks, por lo que las afirmaciones de rendimiento de la model card no son verificables con los datos disponibles.
- Riesgo de alucinacion: es un modelo de lenguaje generativo y, aunque esta orientado a agentes con recuperacion ante fallos, no se documentan mecanismos de verificacion factual ni tasas de alucinacion.
- Sesgos: los datos de entrenamiento combinan fuentes publicas, datos de terceros e informacion de productos y servicios de Meta; no se detalla ninguna evaluacion de sesgos ni de seguridad.
- Limitacion de idioma: se declaran mas de 100 idiomas, pero no se especifica la lista ni el nivel de calidad por idioma, de modo que el rendimiento fuera del ingles (y posiblemente de otros idiomas mayoritarios) es incierto.
- Contexto: los 131.072+ tokens declarados son un maximo; el rendimiento efectivo en ventanas muy largas depende del cache KV y de la VRAM disponible, y el patron de atencion con ventana deslizante de 2048 puede afectar a la recuperacion de informacion muy distante.
- Modalidad de salida limitada a texto: pese a aceptar imagenes, no genera imagenes ni audio.
- El proceso de destilacion desde Muse Spark no se detalla (temperatura, datos, fases), lo que dificulta reproducir el entrenamiento.
- La informacion de la model card esta truncada en el punto donde se explica el asterisco de la tabla de degradacion, por lo que la metodologia de medicion de ese 0,2 % y 1,0 % no queda documentada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de terceros y de los productos de Meta empleados en el entrenamiento antes de un despliegue comercial regulado.
- El repositorio GGUF registra 0 descargas y 0 likes y fue creado el 27 de septiembre de 2026, por lo que no hay evidencia de comunidad ni de validacion independiente de las cuantizaciones.
- Fecha de corte de conocimiento: 4 de enero de 2026; cualquier informacion posterior no esta cubierta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/atrezonator/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guia de Muse Glimmer en Unsloth: https://unsloth.ai/docs/models/muse-glimmer
- Documentacion de Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Paper del encoder de percepcion (referenciado en la model card): https://arxiv.org/abs/2504.13181
- Referencia arXiv adicional incluida en las etiquetas del repositorio: https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido de terceros sin conexion tematica), por lo que no se incluyen como fuentes.
