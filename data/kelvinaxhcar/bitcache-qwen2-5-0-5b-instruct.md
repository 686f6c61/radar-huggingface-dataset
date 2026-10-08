# KelvinAxhcar/BitCache-Qwen2.5-0.5B-Instruct

## Resumen

BitCache-Qwen2.5-0.5B-Instruct es un ajuste fino publicado por el usuario de HuggingFace KelvinAxhcar (Kelvin Mateus, Bit++ Technologies) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se distribuye como un modelo de generación de texto con 494.032.768 parámetros reales en safetensors, licencia declarada apache-2.0 y etiqueta de idioma inglés. El repositorio ocupa 1,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

El elemento diferencial que anuncia su autor no es un cambio en los pesos, sino BitCache, una supuesta técnica de compresión del KV-cache basada en "Cheeger Spectral Graph Contraction" sobre los estados de atención clave-valor. El autor afirma una reducción de hasta el 65% de la VRAM física durante la generación autorregresiva, hasta 2,85 veces más peticiones concurrentes por GPU y una preservación factual del 100% en Needle in Haystack, bajo la etiqueta comercial "Zero Amnesia". Ninguna de estas afirmaciones incluye paper, código fuente ni trazas de evaluación reproducibles, y las métricas del model-index están marcadas como `verified: false`.

La relevancia del modelo es limitada y muy específica: los modelos por debajo de 1.000 millones de parámetros interesan para despliegue en edge, CPU y GPU de gama baja, pero los resultados declarados en el Open LLM Leaderboard son muy bajos (media consolidada de 8,14), con 0,00% en MATH Lvl 5 y 7,75% en MMLU-PRO. Es, por tanto, un artefacto experimental de compresión de memoria más que un modelo competitivo en calidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base Qwen2.5-0.5B-Instruct); no es MoE |
| Parametros totales | 494.032.768 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens en su documentacion oficial, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors; el ejemplo de la model card usa torch.bfloat16 |
| Idiomas soportados | Ingles (etiqueta `language: en`). La model card esta redactada en portugues y castellano |
| Licencia | apache-2.0 (metadatos y cabecera del README); la seccion final del README indica "Todos os direitos reservados", en contradiccion con la licencia |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key-value heads agrupadas (GQA), segun la documentacion publica de la familia Qwen2. No se aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT adicionales sobre el modelo base. Tampoco se especifica si los pesos se han modificado o si el ajuste consiste unicamente en una capa de gestion de cache en tiempo de inferencia.

La supuesta innovacion tecnica es BitCache, descrita como una "contraccion espectral de grafo de Cheeger" aplicada a los estados KV de la atencion, que operaria en O(N) sobre el cache. El README presenta una tabla comparativa con la reduccion de VRAM (del 100% lineal al 35% de la VRAM original), el incremento de concurrencia (hasta 2,85x) y la conservacion factual (100% en Needle in Haystack). No se proporciona implementacion, configuracion de atencion alternativa, notebook reproducible ni referencia bibliografica, por lo que estos datos deben tratarse como afirmaciones del autor y no como resultados verificados.

## Capacidades

- Generacion de texto conversacional en ingles, derivada de Qwen2.5-0.5B-Instruct (modelo ajustado con instrucciones).
- Seguimiento de instrucciones basico: 30,71% de precision estricta en IFEval 0-shot, segun el autor.
- Razonamiento multietapa y de sentido comun: resultados declarados de 0,94% en MuSR y 8,43% en BBH, muy por debajo de lo esperado en un modelo utilizable para estas tareas.
- Razonamiento matematico formal: 0,00% de coincidencia exacta en MATH Lvl 5, lo que indica incapacidad practica en matematicas de competicion.
- Conocimiento multidisciplinar: 7,75% en MMLU-PRO y 1,01% en GPQA.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado; los resultados de BBH y MuSR no respaldan esta capacidad.
- Capacidades multilingues: solo ingles declarado; sin evaluacion multilingue.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio. La unica capacidad especial declarada es la gestion comprimida del KV-cache mediante BitCache, con la supuesta garantia "Zero Amnesia".

## Casos de uso

- Prototipado y pruebas de integracion en pipelines de transformers: el modelo ocupa 1,0 GB en disco y 494 millones de parametros, por lo que sirve para validar codigo de carga, tokenizacion y generacion sin consumir recursos de GPU de gama alta.
- Despliegue en dispositivos con recursos muy limitados: al ser un modelo sub-1B, puede ejecutarse en CPU o en GPU integradas para tareas de generacion de texto corto donde no se requiera razonamiento complejo.
- Experimentacion con tecnicas de compresion de KV-cache: es el caso de uso mas alineado con el proposito declarado del modelo; sirve como banco de pruebas para medir consumo de VRAM en contextos largos, siempre que se valide de forma independiente la afirmacion del 65% de reduccion.
- Generacion de texto auxiliar de bajo coste: borradores, resumenes de frases cortas o clasificacion textual simple donde el coste por token prime sobre la calidad.
- Evaluacion comparativa de ajustes sobre Qwen2.5-0.5B: permite contrastar variantes de fine-tuning sobre el mismo modelo base en tareas de instrucciones sencillas (IFEval).
- Educacion y divulgacion sobre cuantizacion y cache: util para demostrar en un articulo o clase como varia la VRAM ocupada por el KV-cache al aumentar la longitud de contexto en un modelo pequeno.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis de documentos largos, agentes autonomos ni tareas matematicas, dado el nivel de los resultados declarados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, obtenidos con EleutherAI `lm-evaluation-harness` y publicados bajo la fuente Open LLM Leaderboard. Todas las metricas figuran como `verified: false`.

| Benchmark | Protocolo | Metrica | Resultado |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy (inst_level_strict_acc) | 30,71% |
| BBH | 3-shot | normalized accuracy (acc_norm) | 8,43% |
| MMLU-PRO | 5-shot | accuracy | 7,75% |
| GPQA | 0-shot | acc_norm | 1,01% |
| MuSR | 0-shot | acc_norm | 0,94% |
| MATH Lvl 5 | 4-shot | exact match | 0,00% |
| Media general | consolidada | promedio del leaderboard | 8,14 |

No se han publicado otros resultados de benchmarks en la informacion disponible, ni tablas de comparacion directa con otros modelos por parte del autor. El README incluye ademas una tabla de eficiencia con datos no verificados: reduccion de VRAM del 100% al 35% (un -65%), hasta 2,85x mas peticiones concurrentes por GPU (+185% de throughput) y 100% de preservacion factual en Needle in Haystack. Estas cifras de eficiencia no estan acompanadas de metodologia, hardware concreto ni script de reproduccion.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 1,0 GB solo para pesos en bfloat16 (494 millones de parametros), mas el KV-cache. La model card cita GPUs NVIDIA A10G, H100 y RTX 4090, pero no aporta medidas absolutas de VRAM por configuracion.
- GPU recomendadas por el autor: NVIDIA A10G (entorno de la demo), H100 y RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, e incluso en CPU. No se han publicado cuantizaciones GGUF ni int8/int4, por lo que el ahorro adicional requeriria conversion manual.
- Opciones de despliegue: transformers (metodo documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio) y, presumiblemente, vLLM por compatibilidad con la arquitectura Qwen2, aunque no se documenta. Ollama y llama.cpp requeririan convertir los pesos a GGUF, formato que no se distribuye.
- Latencia y throughput: no disponible. El unico dato es la afirmacion del autor de un incremento de throughput del 185% y de 2,85x mas peticiones concurrentes con BitCache activado, sin condiciones de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| BitCache-Qwen2.5-0.5B-Instruct | 494 M | No disponible en esta ficha | apache-2.0 (con contradiccion en el README) | Media 8,14 en el leaderboard declarado por el autor | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-0.5B-Instruct (modelo base) | ~494 M | 32.768 tokens segun documentacion de Qwen | apache-2.0 | No disponible en la informacion proporcionada | HuggingFace, ampliamente distribuido |
| Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 tokens segun documentacion de Qwen | apache-2.0 | No disponible en la informacion proporcionada | HuggingFace, ampliamente distribuido |
| SmolLM2-360M-Instruct | ~360 M | No disponible en la informacion proporcionada | apache-2.0 | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estos modelos dentro de la informacion proporcionada. La comparacion debe limitarse, por tanto, a parametros, licencia y disponibilidad; el unico dato de rendimiento utilizable es el promedio de 8,14 declarado por el autor para este ajuste, sin referencia cruzada con los modelos de la tabla.

## Limitaciones y advertencias

- Afirmaciones no verificadas: la reduccion del 65% de VRAM, el 2,85x de concurrencia y la garantia "Zero Amnesia" provienen exclusivamente del README del autor. No hay paper, repositorio de codigo, script de evaluacion ni trazas de memoria publicadas.
- Metricas marcadas como `verified: false`: los seis resultados del model-index estan declarados por el autor y no aparecen validados en el Open LLM Leaderboard oficial.
- Resultados por debajo del azar en tareas de opcion multiple: GPQA (1,01%) y MuSR (0,94%) quedan muy por debajo del 25% esperable por azar en pruebas de cuatro opciones, lo que sugiere fallos de formato o de parsing mas que una capacidad real medible.
- Razonamiento matematico nulo: 0,00% de coincidencia exacta en MATH Lvl 5 y 7,75% en MMLU-PRO desaconsejan su uso en cualquier tarea analitica o cuantitativa.
- Riesgo alto de alucinacion: con una ventana de conocimiento y una capacidad de razonamiento tan limitadas, el modelo generara texto plausible pero incorrecto con frecuencia, especialmente fuera del ingles.
- Sesgos: no hay documentacion sobre composicion del dataset ni evaluaciones de sesgo. Al derivar de Qwen2.5, hereda los sesgos del corpus de pretraining del modelo base, no auditados en esta ficha.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior.
- Ambiguedad de licencia: la cabecera del README y los metadatos indican apache-2.0, pero la seccion final afirma "Copyright (c) 2026 Kelvin Axhcar. Todos os direitos reservados". Antes de un uso comercial conviene aclarar por escrito la licencia aplicable con el autor.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni discusiones publicas.
- Trazabilidad: las fechas de creacion y actualizacion del repositorio (octubre de 2026) son posteriores a la fecha de esta ficha, lo que dificulta la verificacion temporal del artefacto.
- Dependencia del modelo base: cualquier limitacion de Qwen2.5-0.5B-Instruct (contexto efectivo, tokenizador, sesgos) se hereda, salvo que el ajuste la corrija, cosa que no se documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KelvinAxhcar/BitCache-Qwen2.5-0.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Demo interactiva declarada por el autor: https://huggingface.co/spaces/KelvinAxhcar/bitcache-demo
- Fuente de los benchmarks citados: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Contacto indicado en la model card: kaxhcar@gmail.com
- Paper, repositorio de codigo o publicacion tecnica: no disponible
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo: devuelven exclusivamente paginas de reserva de aparcamiento del Aeropuerto de Marsella-Provenza, sin relacion con el artefacto analizado.
