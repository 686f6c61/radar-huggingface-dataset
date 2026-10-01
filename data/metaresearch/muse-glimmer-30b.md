# metaresearch/Muse-Glimmer-30B

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal denso de aproximadamente 29,8 mil millones de parametros (29.776.626.688 segun los pesos en safetensors) desarrollado por Meta Superintelligence Lab y publicado con licencia Apache 2.0. Se trata de un modelo multimodal de entrada (texto e imagen) y salida de texto, con un encoder de percepcion dedicado de unos 1,8B de parametros (ViT-G/14), disenado especificamente para tareas agenticas que se ejecutan de forma local en hardware de consumo, sin necesidad de infraestructura en la nube ni acceso a red.

Su propuesta diferencial no es el tamano sino la combinacion de capacidades orientadas a agentes: uso fiable de herramientas con esquemas precisos, razonamiento multi-paso sobre horizontes largos, recuperacion ante fallos de herramientas y comprension multimodal de capturas de pantalla, graficos y documentos. Incorpora una ventana de contexto de 131.072 tokens o mas, un tokenizador de 202.048 entradas y decodificacion especulativa mediante un "drafter" basado en DFlash que predice bloques de 16 tokens en una sola pasada.

Es relevante ahora porque traslada cargas de trabajo agenticas completas a una sola GPU de 24-32 GB o a un portatil Apple Silicon, con cuantizacion de aproximadamente 4 bits que, segun el autor, apenas degrada el rendimiento en tareas agenticas (0,2% en K-Quant-Dynamic, 1,0% en K-Quant-17GB sobre una media de 15 benchmarks). El modelo se distribuye a traves de la libreria transformers y esta marcado como compatible con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14); patron de atencion [Local, Local, Local, Global] repetido, atencion con puerta ("gated attention") y GQA |
| Parametros totales | 29.776.626.688 segun safetensors; la model card indica ~29,6B (incluyendo el encoder de vision, del que ~1,8B corresponden al ViT) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens; ventana deslizante de 2.048 tokens |
| Tipos de cuantizacion | Cuantizacion a ~4 bits en dos variantes: K-Quant-Dynamic (objetivo 32 GB de VRAM) y K-Quant-17GB (objetivo 24 GB de VRAM); tambien se publican versiones cuantizadas del drafter |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas; el repositorio de HuggingFace no lista idiomas concretos (campo no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otras especificaciones declaradas por el autor: dimension oculta 6.656; 52 capas; 32 cabezas de consulta y 2 de clave/valor (ratio GQA 16:1); dimension de cabeza 128; FFN de tipo SwiGLU con dimension intermedia 19.968; codificacion posicional RoPE (theta = 500.000, solo en capas locales); vocabulario de 202.048 entradas (200.000 tokens BPE + 2.048 especiales); maximo de 4.096 tokens visuales por imagen; corte de conocimiento el 4 de enero de 2026; fecha de publicacion declarada agosto de 2026.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con un patron de atencion hibrido que repite tres capas de atencion local (ventana deslizante de 2.048 tokens) seguidas de una capa de atencion global. Esto reduce el coste cuadratico del contexto largo manteniendo acceso global periodico. Emplea atencion con puerta, GQA con 32 cabezas de consulta y solo 2 de clave/valor, SwiGLU en el FFN y RoPE con theta elevado (500.000) aplicado unicamente en las capas locales. El componente de percepcion es un ViT-G/14 de ~1,8B de parametros, 50 capas, ancho 1536 y tamano de parche 14, que acepta hasta 4.096 tokens visuales por imagen.

El modelo es un destilado de Muse Spark. Los datos de entrenamiento son contenido multimodal procedente de fuentes publicas, datos proporcionados por terceros e informacion de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion (no disponible en la informacion proporcionada).

La innovacion tecnica mas destacada es la decodificacion especulativa mediante DFlash, un modelo companero que genera bloques completos de 16 tokens en una sola pasada y que el modelo principal verifica en paralelo, aceptando los correctos y corrigiendo los erroneos. El drafter tiene 5 capas, tamano de bloque 16, atencion de ventana deslizante de 2.048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor, y extrae caracteristicas de las capas 1, 13, 25, 37 y 49 de las 52 del modelo principal. Tambien se declara un control de esfuerzo de razonamiento ("controllable effort") para ajustar el equilibrio entre calidad y velocidad.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extensos.
- Uso de herramientas y function calling con esquemas precisos, mantenidos a lo largo de flujos prolongados.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Finalizacion de tareas agenticas de extremo a extremo, evaluada en benchmarks de tarea completa (DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, segun el autor).
- Entrada multimodal: acepta texto e imagenes intercaladas a traves del encoder de percepcion, lo que permite interpretar capturas de pantalla, graficos y documentos junto a la conversacion. La salida es siempre texto.
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent.
- Control de esfuerzo de razonamiento: distintos niveles de razonamiento para priorizar calidad o velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Contexto largo de 131.072+ tokens para conversaciones y documentos extensos.
- No se declara soporte de audio, video ni generacion de imagenes (no disponible).

## Casos de uso

- Agentes locales siempre activos: despliegue en una estacion de trabajo con 24-32 GB de VRAM o en un MacBook con chip M4/M5 Max, sin conexion a red, para tareas continuas de monitorizacion, resumen y ejecucion de acciones sobre sistemas locales.
- Atencion al cliente automatizada multilingue: gestion de conversaciones multi-turno en mas de 100 idiomas apoyandose en los 131.072+ tokens de contexto para mantener el historial completo y recuperar informacion de interacciones previas.
- Automatizacion de interfaces y RPA: el encoder de percepcion permite interpretar capturas de pantalla de aplicaciones de escritorio o web (hasta 4.096 tokens visuales por imagen) y traducirlas en acciones concretas, con reintento automatico si un paso falla.
- Ingenieria de software asistida: resolucion de incidencias y depuracion de codigo con scaffolds tipo SWE-Bench, integrable en pipelines de CI/CD donde el modelo invoca herramientas de compilacion, test y control de versiones y corrige los fallos detectados.
- Analisis de documentos y graficos: extraccion de datos estructurados de facturas, informes financieros o articulos cientificos combinando la lectura de tablas y figuras con razonamiento textual posterior.
- Busqueda profunda y sintesis de evidencia: flujos de investigacion que encadenan busquedas, verificacion de fuentes y redaccion de informes, con recuperacion ante resultados inconsistentes.
- Procesamiento de datos sensibles en local: sectores sanitario, legal, industrial o defensa donde no se permite enviar datos a servicios en la nube; el modelo puede ejecutarse en una unica GPU sin acceso externo.
- Asistentes de escritorio con razonamiento controlable: ajuste del esfuerzo de razonamiento por peticion para tareas rapidas de resumen o para analisis complejos, segun la latencia que tolere el usuario.

## Benchmarks y rendimiento

El autor no publica puntuaciones numericas de precision en benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Si se proporcionan, en cambio, datos de degradacion por cuantizacion y de velocidad de generacion.

Degradacion por cuantizacion (media de metricas de precision sobre 15 benchmarks comunes, segun el autor):

| Metrica | Precision completa | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion | - | 0,2% | 1,0% |
| Hardware objetivo | 64 GB de VRAM | 32 GB de VRAM | 24 GB de VRAM |

Velocidad con decodificacion especulativa DFlash (K-Quant-17GB, tamano de lote 1, decodificacion greedy):

| GPU | Sin especulacion (tok/s) | Con DFlash (tok/s) | Aceleracion |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Datos de terceros (no verificados por el autor): benchlm.ai estima una puntuacion compuesta de 41,54/100 y el puesto 121 de 210 modelos, y benchable.ai situa la velocidad en el percentil 34 y el precio en el percentil 33. Son estimaciones agregadas de terceros y deben tratarse con cautela.

## Requisitos de hardware

- Precision completa (bf16): aproximadamente 59,6 GB de pesos (el repositorio de HuggingFace ocupa 59,6 GB), por lo que requiere del orden de 64 GB de VRAM, mas el espacio de la cache KV.
- K-Quant-Dynamic (~4 bits): objetivo de 32 GB de VRAM, suficiente para pesos, cache KV, encoder de percepcion y drafter en ejecucion simultanea.
- K-Quant-17GB (~4 bits): objetivo de 24 GB de VRAM, con una degradacion declarada del 1,0%.
- GPU de consumo compatible: el autor valida explicitamente una Nvidia RTX 5090 con 233,4 tok/s con especulacion. La variante de 17 GB encaja en tarjetas de 24 GB (por ejemplo, RTX 4090, RTX 3090 o similares), aunque esto ultimo no esta confirmado de forma explicita en la informacion disponible.
- Apple Silicon: validado en MacBook M4 Max y M5 Max, con 37,8 y 50,2 tok/s respectivamente usando el drafter.
- Latencia: a 233 tok/s en RTX 5090 la generacion es apta para interaccion en tiempo real; en M4 Max (37,8 tok/s) y M5 Max (50,2 tok/s) el autor la describe como suficiente para conversacion fluida y agentes en tiempo real.
- Opciones de despliegue: la libreria declarada es transformers y el repositorio esta marcado como compatible con endpoints de inferencia. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- El drafter cuantizado reduce el sobrecoste de memoria de la decodificacion especulativa, aunque su consumo exacto no se detalla (no disponible).

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que no se incluyen cifras de terceros que no puedan contrastarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse Glimmer 30B | ~29,8B (denso, + encoder de vision de ~1,8B) | 131.072+ | Apache 2.0 | Pesos abiertos en HuggingFace (safetensors) |
| Alternativas de la misma categoria (30B denso multimodal agentico) | no disponible | no disponible | no disponible | no disponible |

La categoria natural de comparacion son los modelos densos de 30B con soporte multimodal y orientacion agentica que quepan en una GPU de consumo, pero la informacion proporcionada no incluye especificaciones ni resultados de ningun competidor concreto.

## Limitaciones y advertencias

- Riesgo de alucinacion: la model card no describe mecanismos especificos de mitigacion ni tasas de alucinacion medidas; en tareas agenticas con tool calling, una invocacion incorrecta puede propagarse a pasos posteriores.
- Sesgos: los datos de entrenamiento incluyen informacion de productos y servicios de Meta y contenido de proveedores externos; no se publican evaluaciones de sesgo ni de equidad.
- Idiomas: se declaran mas de 100 idiomas, pero sin lista, sin evaluacion por idioma y sin datos de rendimiento desglosados; el rendimiento en lenguas distintas del ingles es una incognita.
- Contexto largo: la ventana deslizante de 2.048 tokens con una capa global cada cuatro implica que la recuperacion precisa de informacion muy distante depende de las capas globales; no se publican resultados de evaluacion de contexto largo (needle-in-a-haystack o equivalentes).
- Modalidad limitada: solo entrada de texto e imagen y salida de texto; no hay soporte declarado de audio, video ni salida multimodal.
- Corte de conocimiento: 4 de enero de 2026, con el consiguiente riesgo de desactualizacion en dominios cambiantes.
- Cuantizacion: las variantes de 4 bits introducen una degradacion declarada de 0,2% a 1,0% sobre 15 benchmarks; el impacto en tareas de cola larga o muy sensibles a la precision no se detalla.
- Rendimiento: en Apple Silicon la velocidad base sin especulacion (23,7 a 26,6 tok/s) limita escenarios de alto throughput por encima de lotes pequenos; las mediciones declaradas son con tamano de lote 1 y decodificacion greedy.
- Licencia: Apache 2.0 permite uso comercial sin restricciones conocidas, pero conviene revisar las condiciones de los datos de terceros y de los productos de Meta citados como fuente de entrenamiento.
- Verificabilidad: el repositorio indicado presenta 0 descargas y 0 "likes", y las busquedas web apuntan a un identificador distinto (meta-models/Muse-Glimmer-30B) y a un laboratorio con una denominacion ligeramente diferente (Meta Superintelligence Labs frente a Meta Superintelligence Lab). Ademas, la fecha de creacion del repositorio (octubre de 2026) no coincide con la fecha de publicacion declarada (agosto de 2026). Se recomienda confirmar la autenticidad del artefacto antes de usarlo en produccion.
- Sin datos publicos de precision en benchmarks: no es posible estimar la calidad del modelo frente a alternativas de la misma categoria con la informacion disponible.

## Enlaces

- Repositorio en HuggingFace (identificador de la ficha): https://huggingface.co/metaresearch/Muse-Glimmer-30B
- Repositorio alternativo detectado en la busqueda: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina del modelo en Meta: https://dev.meta.ai/models/muse-glimmer
- Blog de presentacion: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Paper del encoder de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (drafter de difusion por bloques): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ficha de benchmarks de terceros (benchable.ai): https://benchable.ai/models/meta/muse-glimmer-30b-20260810
- Ficha de benchmarks de terceros (benchlm.ai): https://benchlm.ai/models/muse-glimmer-30b
