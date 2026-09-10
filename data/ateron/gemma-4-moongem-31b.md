# Ateron/Gemma-4-MoonGem-31B

## Resumen

Gemma-4-MoonGem-31B es un modelo de lenguaje de 31.273.088.876 parametros (31,27B) publicado por el usuario Ateron en HuggingFace. No es un modelo entrenado desde cero, sino un merge de siete modelos derivados de la familia Gemma 4, combinados con la herramienta mergekit en tres fases sucesivas. El repositorio se distribuye en safetensors con precision bfloat16/f16 y ocupa 62,6 GB. La ficha declara orientacion a roleplay y generacion de texto conversacional.

El modelo parte de una base comun (Gemma-4-Scotoma-V2) sobre la que se aplican, primero, una fusion TIES con densidad 0,15 sobre tres componentes (Glimmer, Gutenberg y Gemopus) y, despues, dos fusiones task_arithmetic que incorporan Melinoe-VL, MeroMero-V2, MusicaV1 y las mezclas intermedias. Es, por tanto, un artefacto de la comunidad sin entrenamiento adicional documentado: su comportamiento depende enteramente de los pesos heredados de los modelos padre.

Su relevancia es acotada y practica: cubre el nicho de modelos de 31B afinados para conversacion y roleplay en ingles, con licencia declarada apache-2.0 y publicacion reciente (septiembre de 2026). No incluye informe tecnico, evaluacion ni benchmarks, y la propia model card es en gran medida promocional, con contenido minimo mas alla de las recetas de merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4); sin detalles publicados del bloque interno |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican cuantizaciones en el repositorio; distribuido en bfloat16/f16 (safetensors). Conversion a GGUF/AWQ/GPTQ posible por la comunidad, no verificada por el autor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada) |
| Formato de pesos | safetensors (bfloat16/f16), repositorio de 62,6 GB |

## Arquitectura y entrenamiento

No hay entrenamiento documentado. MoonGem-31B es el resultado de un pipeline de mergekit aplicado sobre siete modelos de la familia Gemma 4, tomando como base Gemma-4-Scotoma-V2. La receta consta de tres fases. La fase 1 ("Bleed") usa el metodo TIES con `lambda: 1.0`, `density: 0.15` y `dtype: bfloat16`, combinando Gemma-4-Glimmer, Gemma-4-Gutenberg y Gemma-4-Gemopus con pesos por capa definidos individualmente para las capas 5, 11, 17, 23, 29, 35, 41, 47, 53 y 59 (valores entre 0,10 y 0,15) y un peso residual de 0,10 para el resto. Que la ultima capa referenciada sea la 59 sugiere una red de al menos 60 capas, coherente con el tamano de 31B.

Las fases 2 ("Crimson") y 3 ("Blood") emplean task_arithmetic con `lambda: 1.0` y `tokenizer_source: base`. La fase 2 incorpora Gemma-4-Melinoe-VL, Gemma-4-MeroMero-V2 y Gemma-4-MusicaV1 con vectores de peso `[0.10, 0.10, 0.15, 0.15, 0.10]`; la fase 3 combina las dos mezclas intermedias (MicroMix-P1 y MicroMix-P2) a peso 0,5 cada una. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO, porque el proceso es exclusivamente de interpolacion de pesos.

Como innovacion tecnica, lo destacable es la granularidad del merge: pesos distintos por capa en la fase TIES, un metodo de seleccion dispersa de parametros (density 0,15) orientado a reducir interferencias entre tareas, y la combinacion de componentes con perfiles distintos (roleplay, prosa literaria, instruct generalista, vision-lenguaje y musica). La model card no aporta informacion sobre decodificacion especulativa, atencion lineal ni ninguna otra optimizacion de inferencia.

## Capacidades

- Generacion de texto conversacional y roleplay multi-turno, el caso de uso declarado por el autor.
- Escritura creativa y narrativa, presumiblemente reforzada por el componente Gutenberg (orientado a prosa) y Glimmer (orientado a roleplay).
- Conversacion instruct generalista, heredada de Gemopus-4-31B-it.
- Posible procesamiento de vision-lenguaje: uno de los modelos padre (Melinoe-Gemma4-31B-VL) es multimodal, pero no se confirma que MoonGem conserve la torre de vision ni que sea funcional. Tratar como no verificado.
- Soporte de tool calling / function calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingues: no; el modelo declara unicamente ingles (`language: en`).
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Roleplay conversacional: es el proposito explicito del merge. El modelo puede mantener personajes de forma consistente en dialogos largos, aprovechando los componentes afinados especificamente para esta tarea (Glimmer, MeroMero).
- Escritura creativa asistida: generacion de relatos, dialogos y prosa, apoyandose en el componente Gutenberg, orientado a texto literario.
- Prototipado de asistentes conversacionales en ingles: punto de partida para validar prompts, formatos de chat y flujos de dialogo antes de invertir en entrenamiento propio.
- Generacion de dialogos para videojuegos o ficcion interactiva: produccion de respuestas de personaje en guiones ramificados, con revision humana posterior.
- Investigacion sobre merges de modelos: caso de estudio reproducible de como el TIES y task_arithmetic con pesos por capa alteran el comportamiento de un modelo de 31B.
- Base para fine-tuning especifico: con 31B parametros y licencia apache-2.0 declarada, puede servir como punto de partida para ajuste supervisado en dominios concretos (solo en ingles).
- Experimentacion con despliegue de modelos de 31B en cuantizacion 4-6 bits: util para medir degradacion de calidad en hardware de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no se dispone de comparaciones objetivas frente a los modelos padre o a alternativas de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: bfloat16/f16 (precision del repositorio), aproximadamente 62-63 GB solo de pesos; cuantizacion de 8 bits, unos 31-35 GB; cuantizacion de 4 bits (Q4_K_M), unos 18-20 GB; cuantizacion de 5-6 bits, entre 22 y 27 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para precision completa sin cuantizar; 2x RTX 4090 / 2x RTX 3090 (24 GB cada una) para cuantizaciones de 4-6 bits; A6000 48 GB como opcion intermedia.
- Compatibilidad con GPU de consumo: si, en cuantizacion de 4 bits cabe en una RTX 4090, RTX 3090 o RTX 4080 de 24 GB, a costa de reducir la longitud de contexto efectiva y derivar parte del KV cache a CPU. Con 16 GB de VRAM no es viable sin offloading agresivo.
- Memoria unificada: Mac Studio o MacBook Pro con 64 GB o mas pueden ejecutar cuantizaciones de 4-6 bits mediante llama.cpp.
- Opciones de despliegue: vLLM y TGI para servir en bfloat16 sobre GPU de 80 GB; llama.cpp y Ollama si se convierte a GGUF (el repositorio solo contiene safetensors, la conversion corre a cargo del usuario); LM Studio y text-generation-webui como alternativas de escritorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Todos los modelos de la tabla pertenecen a la familia Gemma 4 y, salvo el propio MoonGem, son componentes del merge. Los recuentos de parametros marcados como inferidos se deducen de que comparten la misma arquitectura base; no estan confirmados por sus respectivas fichas.

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ateron/Gemma-4-MoonGem-31B | 31,27B (confirmado) | Merge para roleplay y conversacion | apache-2.0 (declarada) | Publico en HuggingFace; 188 descargas, 8 likes |
| ReadyArt/gemma-4-31B-it-scotoma-2 | ~31B (inferido) | Base instruct del merge | no disponible | Publico en HuggingFace |
| Jackrong/Gemopus-4-31B-it | ~31B (inferido) | Instruct generalista | no disponible | Publico en HuggingFace |
| BirdToast/Gemma-4-31B-glimmer-rp-v0.1 | ~31B (inferido) | Roleplay | no disponible | Publico en HuggingFace |
| nbeerbower/Gemma4-Gutenberg-31B | ~31B (inferido) | Prosa literaria | no disponible | Publico en HuggingFace |

No se dispone de benchmarks que permitan comparar el rendimiento relativo entre estos modelos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de regresion, ni analisis de sesgos. No se puede afirmar que el merge haya mejorado a sus componentes padre; los merges pueden degradar capacidades de forma no observable sin evaluacion.
- Model card insuficiente: apenas contiene las recetas de merge y agradecimientos; no documenta contexto, formato de prompt, plantilla de chat ni limitaciones.
- Sesgos: no documentados. Al derivar de modelos Gemma 4 preentrenados con datos web y afinados para roleplay, es esperable que herede sesgos de genero, cultura y origen, agravados por el sesgo hacia ficcion y arquetipos propio de los datasets de roleplay.
- Alucinacion: riesgo alto en un modelo no evaluado y optimizado para conversacion creativa, donde la coherencia narrativa se prioriza sobre la veracidad factual. No recomendado para tareas que exijan exactitud factual sin verificacion.
- Idioma: soporte declarado unicamente en ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: desconocida. No se debe asumir ningun valor concreto en produccion sin medirlo.
- Tool calling y agentes: sin evidencia de soporte. No disenar pipelines que dependan de function calling sin validarlo antes.
- Licencia: la ficha declara apache-2.0, pero los modelos padre descienden de Gemma (Google DeepMind), cuyos terminos de uso suelen ser distintos de Apache 2.0. Antes de un uso comercial, conviene verificar la cadena completa de licencias de los siete componentes; la etiqueta apache-2.0 no garantiza por si sola que el uso comercial sea libre de restricciones.
- Trazabilidad del merge: las recetas usan rutas locales de Windows (`F:\AI\Merge\...`) en lugar de identificadores de HuggingFace, lo que dificulta la reproduccion exacta del merge con las revisiones concretas de cada componente.
- Datos del repositorio: fechas de creacion y actualizacion de 2026, repositorio sin cuantizaciones oficiales y sin versiones GGUF. La conversion y el empaquetado corren a cargo del usuario.
- Uso responsable: tratandose de un modelo de roleplay sin filtros documentados, no deberia desplegarse de cara al publico sin una capa de moderacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ateron/Gemma-4-MoonGem-31B
- Modelos base declarados:
  - https://huggingface.co/BirdToast/Gemma-4-31B-glimmer-rp-v0.1
  - https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B
  - https://huggingface.co/Jackrong/Gemopus-4-31B-it
  - https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL
  - https://huggingface.co/AuriAetherwiing/G4-31B-Musica-v1
  - https://huggingface.co/zerofata/G4-MeroMero-v2-31B
  - https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Herramienta de merge: https://github.com/arcee-ai/mergekit
- Perfil del autor: https://huggingface.co/Ateron
- Perfil del colaborador mencionado: https://huggingface.co/Nimbz
- Paper, blog tecnico o demo: no disponible. La busqueda web no devolvio resultados relacionados con el modelo.
