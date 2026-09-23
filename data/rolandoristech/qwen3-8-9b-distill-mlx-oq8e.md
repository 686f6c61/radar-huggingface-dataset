# RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e

## Resumen

Qwen3.8-9B-Distill-MLX-oQ8e es una version cuantizada nativa para MLX del modelo destilado de razonamiento Qwen3.8-9B-Distill (base: empero-ai/Qwen3.8-Distill). La publica el usuario RolanDorisTech el 23 de septiembre de 2026 como parte de una familia de ocho variantes cuantizadas que cubren los tamanos de 2B, 4B y 9B en precisiones oQ4e, oQ5e, oQ6e y oQ8e. Esta ficha corresponde a la variante de mayor tamano y precision de la familia: 8,9 GB en disco con pesos safetensors estandar de mlx-lm.

El problema que resuelve es el de ejecutar un modelo de ~9B parametros con capacidades de razonamiento en Apple Silicon sin recurrir a cuantizaciones uniformes de 4 u 8 bits. Para ello se emplea oQ (Universal Dynamic Quantization de oMLX), una cuantizacion de precision mixta guiada por datos que mide la sensibilidad real de cada capa y asigna bits donde el error penaliza mas, combinada con oQe, que incorpora la importancia de activaciones via imatrix para ponderar los canales mas relevantes. Segun la model card, el resultado es una precision efectiva de entre 4,7 y 8,5 bpw.

La relevancia actual del modelo es acotada y hay que leerla con cautela: se trata de una pieza de un pipeline de cuantizacion para un publico muy concreto (desarrolladores con Mac Apple Silicon que quieran usar MLX, oMLX, LM Studio o mlx-swift), sin benchmarks estandar publicados, sin datos de idiomas y con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la familia Qwen3 (modelo destilado de razonamiento); no se detalla en la model card |
| Parametros totales | ~9B (segun la nomenclatura del nombre; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e en esta variante (~4,7-8,5 bpw efectivos). La familia incluye oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (mlx-lm); incluye chat_template.jinja |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura interna del modelo base (numero de capas, atencion, tipo de destilacion ni composicion del dataset). Lo que si se documenta es el proceso de cuantizacion aplicado sobre el maestro BF16 en MLX de Qwen3.8-9B-Distill. La herramienta empleada es el panel de cuantizacion de oMLX con la metodologia oQe activada: cuantizacion dinamica de precision mixta guiada por datos. oQ mide la sensibilidad real de cada capa y asigna bits en funcion de donde el error resulta mas danino; oQe anade la importancia de activaciones mediante imatrix para ponderar los canales, reduciendo el error en las rutas mas criticas.

Los ajustes de build documentados son: Reuse ON, cache automatica, Strict OFF, Preserve MTP OFF, bfloat16 para normas y escalas, lm_head protegido a 8 bits y capas de embedding y capas tempranas/tardias reforzadas para preservar calidad. El modelo se construyo en un Mac Studio M1 Max de 64 GB con GPU de 32 nucleos y macOS 27.0, con un tiempo de cuantizacion de 3 minutos y 24 segundos para esta variante oQ8e (frente a 7m23s del oQ4e de 9B). Los pesos resultantes son safetensors estandar de mlx-lm, es decir, no requieren runtime propietario. No se documenta ningun entrenamiento adicional, RLHF ni DPO: es exclusivamente una conversion/cuantizacion del maestro BF16.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el formato de prompt usa la plantilla de chat de Qwen3 con etiquetas `<think>`, por lo que el modelo puede exponer cadenas de razonamiento antes de la respuesta final.
- Resolucion de problemas matematicos basicos: la model card verifica que el resultado del prompt de prueba ("Q: If 2x + 3 = 11, what is x? Think step by step inside tags.") se conserva correcto tras la cuantizacion, con x = 4.
- Razonamiento destilado: al derivar de un modelo "Distill" de la familia Qwen3, hereda el comportamiento de un modelo destilado para tareas de razonamiento, con la perdida de calidad asociada a esa destilacion.
- Ejecucion local en Apple Silicon: integrable via mlx-lm, oMLX, LM Studio y mlx-swift, con aceleracion Metal en chips M-series.
- Capacidades de tool calling / function calling: no disponible (no documentado en la model card).
- Capacidades de agente y multi-step reasoning con herramientas: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Vision, audio u otras modalidades: no. La model card indica explicitamente que el modelo es solo texto (text-only).

## Casos de uso

- Inferencia local de razonamiento en portatiles Mac: un desarrollador con un MacBook Pro de memoria unificada alta puede cargar los 8,9 GB de pesos y ejecutar cadenas de razonamiento largas sin conexion, usando mlx-lm o LM Studio. Es adecuado porque el formato MLX evita capas de traduccion y aprovecha Metal directamente.
- Prototipado de asistentes de resolucion de problemas matematicos: el modelo resuelve ecuaciones simples paso a paso dentro de las etiquetas `<think>`, de modo que sirve como banco de pruebas para validar prompts de razonamiento antes de escalar a modelos mayores.
- Evaluacion comparativa de tecnicas de cuantizacion: el mismo prompt ("2x + 3 = 11") sobre las ocho variantes de la familia permite medir como degrada la calidad al bajar de oQ8e a oQ4e y correlacionarlo con memoria y velocidad. Es un caso de uso metodologico, no de produccion.
- Seleccion de checkpoint por presupuesto de memoria: en una app de escritorio para macOS donde el usuario tiene 16 GB frente a 64 GB de memoria unificada, esta variante oQ8e (pico de 9,679 GB) se reservaria para equipos con holgura, delegando en oQ4e (pico de 5,471 GB) en equipos ajustados.
- Generacion de texto asistida en aplicaciones macOS nativas: mediante mlx-swift, el modelo puede embeberse en una app Swift que ofrezca resumen, reescritura o respuesta a preguntas sobre texto pegado por el usuario, con todo el procesamiento en local.
- Experimentacion docente sobre cuantizacion de precision mixta: el repositorio documenta parametros concretos (imatrix, lm_head a 8 bits, bfloat16 en normas y escalas, tiempos de build), lo que lo convierte en material util para explicar en un curso o taller como se asignan bits por capa y que efecto tiene en memoria y throughput.
- Sustitucion de BF16 en pipelines MLX con restriccion de memoria: cuando el maestro BF16 no cabe con margen suficiente en el equipo de desarrollo, esta variante permite mantener el mismo codigo de inferencia (API de mlx-lm) reduciendo el uso de memoria a un pico medido de 9,679 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico documentado son mediciones de rendimiento y de uso de memoria con un unico prompt aritmetico, realizadas el 23 de septiembre de 2026 en un M1 Max de 64 GB con GPU de 32 nucleos. La prueba consiste en el prompt "Q: If 2x + 3 = 11, what is x? Think step by step inside tags." con 37 tokens de prompt y 82 tokens generados, y el resultado se mantiene correcto (x = 4).

| Medicion (esta variante, 9B-oQ8e) | Valor |
|---|---|
| Velocidad de procesamiento de prompt | 91,8 tok/s |
| Velocidad de generacion | 28,7 tok/s |
| Memoria pico | 9,679 GB |
| Tokens de prompt / generacion | 37 / 82 |
| Precision efectiva declarada | ~4,7-8,5 bpw |

Referencia comparativa de la misma familia con el mismo prompt (M1 Max 64 GB, 32 nucleos GPU):

| Variante | Prompt (tok/s) | Generacion (tok/s) | Memoria pico (GB) |
|---|---|---|---|
| Qwen3.8-2B-Distill-oQ4e | 267,7 | 118,6 | 1,241 |
| Qwen3.8-2B-Distill-oQ8e | 122,2 | 97,5 | 2,131 |
| Qwen3.8-4B-Distill-oQ4e | 133,7 | 65,4 | 2,684 |
| Qwen3.8-4B-Distill-oQ8e | 130,9 | 48,4 | 4,651 |
| Qwen3.8-9B-Distill-oQ4e | 101,5 | 43,0 | 5,471 |
| Qwen3.8-9B-Distill-oQ5e | 91,3 | 37,1 | 6,555 |
| Qwen3.8-9B-Distill-oQ6e | 84,3 | 33,3 | 7,664 |
| Qwen3.8-9B-Distill-oQ8e (esta ficha) | 91,8 | 28,7 | 9,679 |

Como referencia de formato, la model card indica que un 4-bit g32 uniforme equivale a 5,003 bpw y un 8-bit g64 uniforme a 8,502 bpw, de modo que oQ8e se situa en un rango de precision efectiva comparable o superior al 8-bit uniforme, pero con asignacion no homogenea por capa.

## Requisitos de hardware

- Memoria pico medida para esta variante: 9,679 GB durante una generacion de 82 tokens. Conviene reservar un margen adicional de 2-4 GB por encima del peso en disco (8,9 GB) para cache KV y buffers de activaciones, especialmente con contextos largos.
- Equipo de referencia de las mediciones: Mac Studio M1 Max con 64 GB de memoria unificada y GPU de 32 nucleos, macOS 27.0. Es el minimo practico confirmado para esta variante concreta.
- Viabilidad en GPU de consumidor: no aplica en el sentido habitual, porque el formato es MLX (Apple Silicon). No se documenta soporte para CUDA ni ROCm. En el ecosistema de Apple, cabria en equipos con memoria unificada de 16 GB o mas, aunque con margen ajustado y riesgo de swap; para 16-24 GB es mas razonable la variante oQ4e (pico de 5,471 GB).
- GPUs Nvidia (A100, H100, RTX 4090): no disponibles para este artefacto, ya que los pesos son safetensors MLX y requieren runtime MLX.
- Opciones de despliegue documentadas: mlx-lm (comando `mlx_lm.generate`), oMLX, LM Studio (buscando el repositorio y descargando) y mlx-swift. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia medidos: 28,7 tok/s de generacion y 91,8 tok/s de procesamiento de prompt en el equipo de referencia. Para 82 tokens generados, la generacion pura implicaria en torno a 2,9 segundos, sin contar el tiempo de carga del modelo ni el prefill completo.
- Parametros de muestreo recomendados en la model card: temperatura 0,6, top-p 0,95, top-k 20.

## Comparativa con modelos similares

La comparativa mas directa y con datos verificables es contra las otras variantes de 9B de la misma familia, ya que comparten base, prompt de evaluacion y equipo de medida. No se dispone de datos de benchmarks frente a modelos externos de tamano similar, por lo que no se ofrece comparacion con alternativas como Llama, Mistral o la propia familia Qwen3 en versiones oficiales.

| Modelo | Parametros | Tamano en disco | Precision efectiva | Generacion (tok/s) | Memoria pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-oQ4e | ~9B | 4,9 GB | 4-bit mixta con imatrix | 43,0 | 5,471 GB | Apache 2.0 | HuggingFace |
| Qwen3.8-9B-Distill-oQ5e | ~9B | 6,0 GB | 5-bit mixta con imatrix | 37,1 | 6,555 GB | Apache 2.0 | HuggingFace |
| Qwen3.8-9B-Distill-oQ6e | ~9B | 7,0 GB | 6-bit mixta con imatrix | 33,3 | 7,664 GB | Apache 2.0 | HuggingFace |
| Qwen3.8-9B-Distill-oQ8e | ~9B | 8,9 GB | ~4,7-8,5 bpw efectivos | 28,7 | 9,679 GB | Apache 2.0 | HuggingFace |
| 4-bit g32 uniforme (referencia de formato) | ~9B | no disponible | 5,003 bpw | no disponible | no disponible | no aplica | no aplica |
| 8-bit g64 uniforme (referencia de formato) | ~9B | no disponible | 8,502 bpw | no disponible | no disponible | no aplica | no aplica |

Observacion sobre el patron de rendimiento: dentro de la familia de 9B, la velocidad de generacion cae de forma monotona al subir de precision (43,0 -> 37,1 -> 33,3 -> 28,7 tok/s), mientras que la velocidad de procesamiento de prompt no sigue ese patron de forma estricta (101,5 -> 91,3 -> 84,3 -> 91,8 tok/s), lo que sugiere variabilidad de medida en prompts cortos de 37 tokens.

## Limitaciones y advertencias

- Riesgo de alucinacion: la propia model card lo advierte de forma explicita ("Distilled reasoning model. May hallucinate"). Es un modelo destilado, no un modelo base verificado.
- Perdida de calidad por cuantizacion: los pesos son lossy respecto al maestro BF16. El autor afirma que es mas preciso que las cuantizaciones uniformes g32 y g64, pero no aporta comparacion con el BF16 original ni con metricas estandar que respalden esa afirmacion.
- Solo texto: no admite entrada o salida de imagenes, audio ni ninguna otra modalidad.
- Idiomas: el campo de idiomas esta vacio en la ficha de HuggingFace, por lo que no hay garantia documentada de calidad en castellano ni en ningun otro idioma concreto. El unico prompt verificado esta en ingles.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas sin una prueba previa.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, ni para este modelo ni para su base. La unica verificacion funcional es un problema aritmetico de una linea.
- Validacion social nula: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe evidencia de uso independiente ni de reproducibilidad por terceros.
- Encaje de plataforma muy estrecho: los pesos son safetensors MLX, de modo que quedan fuera de ecosistemas CUDA/ROCm y de los servidores de inferencia mas extendidos (vLLM, TGI, llama.cpp, Ollama).
- Trazabilidad limitada del linaje: la model card cita como base empero-ai/Qwen3.8-Distill y, en los creditos, empero-ai/Qwen3.8-9B-Distill-GGUF. No se documenta el dataset de destilacion, los hiperparametros de entrenamiento ni el proceso de destilacion original.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, heredada del modelo base. Al ser un artefacto derivado, conviene verificar de todos modos las condiciones del repositorio base antes de un despliegue comercial.
- Fechas y entorno de build poco convencionales: la model card fecha la publicacion y las mediciones el 23 de septiembre de 2026 y cita macOS 27.0, datos que no se pueden contrastar de forma independiente.
- Falta de informacion operativa: no hay pipeline declarado, no hay datos de idiomas y no se indica la ventana de contexto, lo que complica la integracion en produccion sin pruebas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e
- Modelo base declarado: https://huggingface.co/empero-ai/Qwen3.8-Distill
- Modelo base citado en creditos (GGUF): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Canal del autor en YouTube: https://www.youtube.com/@RolanDorisTech
- Paper: no disponible
- Blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
