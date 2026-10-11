# blackfan23/Underdog-27B-1.1-Sharp

# Underdog-27B-1.1-Sharp

## Resumen

Underdog-27B-1.1-Sharp es un modelo de generacion de texto de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos safetensors del repositorio), publicado en HuggingFace por el usuario blackfan23. La model card lo describe como un derivado de la familia Underdog-27B de Conway, sometido a una fase de post-entrenamiento para conversacion, redaccion, programacion y resumen, y construido sobre una base denominada Qwen3.8. Se distribuye unicamente en pesos cuantizados a 4 bits, en dos empaquetados: GGUF Q4_1 para Splash y llama.cpp, y MLX para Apple Silicon.

Su interes no esta en el tamano sino en la ejecucion local: es un 27B que cabe en hardware de consumo y que incorpora decodificacion especulativa mediante el modelo borrador DFlash2. La model card reporta hasta 130,1 tokens por segundo en generacion de codigo sobre un Apple M5 Max con 40 nucleos GPU y 48 GiB de memoria unificada, con Splash 1.1.0 e INT8 KV, frente a 33,3 tokens/s con MLX-LM estandar. La licencia Apache 2.0 elimina la friccion para uso comercial.

El repositorio ocupa 33 GB e incluye pesos safetensors, GGUF y MLX. Los idiomas declarados son ingles y chino. La ficha no publica la longitud de contexto, la arquitectura interna, el volumen de tokens de entrenamiento ni el detalle del dataset, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no aclara si es transformer denso, MoE o hibrida; solo indica que deriva de una base llamada Qwen3.8) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso fijan `-c 16384` en llama.cpp, pero es una configuracion de runtime, no una especificacion del modelo) |
| Tipos de cuantizacion | 4 bits; GGUF en Q4_1 y paquete MLX de 4 bits con INT8 KV cache en la configuracion medida |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos MLX), GGUF (Q4_1) y MLX |
| Tamano del repositorio | 33,0 GB |
| Libreria declarada | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura. La model card afirma que Underdog-27B "combines post training with compact 4-bit weights for local inference" y que el post-entrenamiento se aplico "to run better in Underdog for human users, based on Qwen3.8", sin especificar si la base es densa o de mezcla de expertos, el numero de capas, el tipo de atencion ni la ventana de contexto nativa. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o optimizacion por preferencias. Toda esa informacion queda como no disponible.

El elemento tecnico mas destacable que si aparece documentado es la decodificacion especulativa: el modelo se distribuye acompanado de un borrador externo, `incoai/Qwen3.8-27B-DFlash2-GGUF` en Q8_0, que Splash descarga y prepara automaticamente. En llama.cpp el mecanismo se activa con `--spec-type draft-dflash --spec-draft-n-max 5`. Segun las mediciones del autor, esta combinacion multiplica por cuatro el throughput en generacion de codigo sobre Apple Silicon (de 33,3 a 130,1 tokens/s) y por mas de tres en redaccion de correo y resumen. El modelo cuenta ademas con un modo de razonamiento configurable por niveles de esfuerzo, con `medium` como valor por defecto, y puede desactivarse explicitamente.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a asistencia en chat.
- Redaccion y reescritura de textos; la propia model card incluye una tarea de referencia de redaccion de correo electronico.
- Resumen de textos largos, con pruebas de entrada de hasta 3.003 tokens.
- Generacion de codigo, con la prueba de referencia mas rapida del conjunto medido.
- Modo de razonamiento con esfuerzo seleccionable (la configuracion de ejemplo usa `--default-reasoning-effort medium`) y posibilidad de desactivar el "thinking".
- Soporte multilingue declarado para ingles y chino. No se declara castellano.
- Servicio mediante API compatible con OpenAI a traves de Splash (`splash serve`), lo que permite integrarlo como backend de aplicaciones existentes.
- Decodificacion especulativa integrada con el borrador DFlash2 en Splash y en llama.cpp.

No se documenta soporte de tool calling o function calling, ni capacidades de agente, vision, audio o multimodalidad. La etiqueta `endpoints_compatible` hace referencia a la compatibilidad con endpoints de inferencia, no a capacidades de herramientas.

## Casos de uso

- Asistente de programacion en local sobre portatiles Apple Silicon: con MLX o Splash y el borrador DFlash2, el modelo alcanza 130,1 tokens/s en generacion de codigo, lo que permite autocompletado y explicacion de fragmentos sin enviar el codigo a un servicio externo.
- Redaccion de comunicaciones profesionales: la tarea de "Email Writing" esta medida de forma explicita y el modelo esta post-entrenado para redaccion, de modo que encaja en flujos de generacion de correos, respuestas y notas internas a partir de un borrador o de un conjunto de puntos clave.
- Resumen de documentos extensos: la prueba de resumen largo usa entradas de 3.003 tokens y el modelo mantiene 61,5 a 69,4 tokens/s en esa tarea, adecuado para condensar informes, actas o hilos de correo.
- Backend de chat con API compatible OpenAI: al exponer un endpoint estilo OpenAI, puede sustituir a otros proveedores en aplicaciones ya construidas, sin reescribir el cliente, manteniendo los datos en la maquina local.
- Asistente bilingue ingles-chino: para equipos o productos que atienden a usuarios en ambos idiomas, el modelo cubre las dos lenguas declaradas sin necesidad de un segundo modelo.
- Despliegue en estaciones de trabajo Windows con GPU NVIDIA: la model card documenta el montaje con llama.cpp CUDA, el borrador DFlash2 y `-ngl 99`, util para equipos de desarrollo que ya disponen de grafica dedicada y quieren inferencia local reproducible.
- Procesamiento de datos sensibles sujeto a politica interna: con licencia Apache 2.0 y ejecucion totalmente local, es viable en entornos donde no se permite enviar contenido a APIs externas, siempre que se valide antes la calidad con un conjunto propio.

## Benchmarks y rendimiento

La informacion disponible solo contiene mediciones de throughput, no de exactitud. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad.

Rendimiento de generacion medido por el autor en un Apple M5 Max (40 nucleos GPU, 48 GiB de memoria unificada), temperatura 0, thinking desactivado, salida limitada a 512 tokens, sin reutilizacion de prefijo, media de dos ejecuciones por tarea:

| Tarea | MLX (MLX-LM) | MLX (Splash + DFlash2) | GGUF (llama.cpp) | GGUF (Splash + DFlash2) |
|---|---:|---:|---:|---:|
| Redaccion de correo | 33,4 tokens/s | 80,8 tokens/s | 26,1 tokens/s | 78,1 tokens/s |
| Generacion de codigo | 33,3 tokens/s | 130,1 tokens/s | 26,1 tokens/s | 112,7 tokens/s |
| Resumen de texto largo | 32,8 tokens/s | 69,4 tokens/s | 25,7 tokens/s | 61,5 tokens/s |

Versiones empleadas en la medicion: Splash 1.1.0 con DFlash2 e INT8 KV; MLX 0.32.0 y MLX-LM 0.31.3; llama.cpp Prism b10685 sobre Metal. La carga del modelo y el calentamiento quedan excluidos. Los datos provienen exclusivamente de la model card del autor; no se han verificado de forma independiente.

## Requisitos de hardware

- Peso de los pesos en 4 bits: aproximadamente 13,5-15 GB para 26,9 mil millones de parametros. El repositorio completo ocupa 33 GB porque incluye los empaquetados GGUF, MLX y safetensors.
- Memoria total necesaria: a los pesos hay que sumar la cache KV. La configuracion medida en el ejemplo usa contexto de 16.384 tokens e INT8 KV, lo que anade varios GB. Como referencia, la prueba se ejecuto en 48 GiB de memoria unificada.
- Hardware validado por el autor: Apple M5 Max con 40 nucleos GPU y 48 GiB de memoria unificada, tanto con MLX como con GGUF.
- GPU NVIDIA: la model card documenta el uso en Windows con una build CUDA de llama.cpp, pero no publica cifras de VRAM ni de rendimiento en esas GPUs, por lo que el comportamiento real es no disponible.
- Cabe en GPU de consumo: con cuantizacion de 4 bits, un modelo de 27B es compatible en principio con tarjetas de 24 GB (RTX 3090, 4090), pero esto es una estimacion derivada del tamano y no una cifra verificada en la informacion disponible.
- Opciones de despliegue documentadas: Splash 1.1.0 o superior (con API compatible OpenAI), llama.cpp (build Prism b10685 y releases CUDA para Windows) y MLX / MLX-LM en Apple Silicon. No se mencionan vLLM, Ollama ni TGI.
- Throughput de referencia: entre 25,7 y 130,1 tokens/s segun tarea y motor, medido en M5 Max. No hay datos de latencia ni de throughput en GPU dedicada.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo, por lo que la comparacion se limita a parametros, contexto, licencia y formato. Los datos de los modelos alternativos proceden de sus fichas publicas conocidas y conviene verificarlos en la fuente.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Underdog-27B-1.1-Sharp | 26,9 B | no disponible | Apache 2.0 | safetensors, GGUF, MLX | Solo 4 bits; decodificacion especulativa con DFlash2; idiomas en/zh |
| Gemma 2 27B | 27 B | 8.192 tokens | Terminos de uso de Gemma (no Apache) | safetensors, GGUF | Denso, ampliamente validado, pero contexto corto y licencia con restricciones |
| Mistral Small 3.1 24B | 24 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Contexto mucho mayor, ecosistema de despliegue mas amplio |
| Qwen3-32B | ~32,8 B | hasta 131.072 tokens con extension | Apache 2.0 | safetensors, GGUF | Denso, con modos de razonamiento; mayor coste de memoria |

La ventaja diferencial de Underdog-27B-1.1-Sharp en esta tabla seria el throughput en Apple Silicon con decodificacion especulativa y la licencia permisiva; su desventaja es la ausencia total de evaluaciones de calidad publicadas y un contexto desconocido.

## Limitaciones y advertencias

- Ausencia de evaluaciones de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna prueba de exactitud. Imposible comparar su calidad real con alternativas de la misma categoria.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta. No existe validacion por parte de la comunidad.
- Trazabilidad dudosa: el repositorio consultado esta bajo el espacio `blackfan23`, mientras que la model card apunta a `ConwayResearch/Underdog-27B-1.1` y al autor "Conway". La procedencia de los pesos no queda clara.
- Fechas anomales: creacion y actualizacion registradas el 11 de octubre de 2026, con 29 minutos de diferencia. El repositorio no tiene historial que permita auditar cambios.
- Cuantizacion a 4 bits: se distribuye solo en 4 bits, con la perdida de calidad que ello implica respecto a una version en bf16 o fp16, que no esta disponible en el repositorio.
- Contexto desconocido: la model card no declara la ventana de contexto. El valor `-c 16384` de los ejemplos es una eleccion de runtime y no debe interpretarse como limite nativo del modelo.
- Idiomas limitados a ingles y chino: el rendimiento en castellano no esta documentado ni validado.
- Dependencia de versiones concretas: algunos nombres citados en la model card son muy especificos y dificiles de verificar de forma independiente, lo que incrementa el riesgo de que el procedimiento de despliegue no sea reproducible con el software actual.
- Sin informacion sobre sesgos, seguridad, filtrado de datos ni evaluaciones de alineacion. No deberia desplegarse en produccion critica sin una evaluacion propia.
- Riesgo de alucinacion inherente a un modelo generativo de este tamano; no se documenta ninguna mitigacion ni tasa medida.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar el fichero LICENSE y verificar los terminos de los pesos base de los que deriva, cuyo origen no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackfan23/Underdog-27B-1.1-Sharp
- Repositorio referenciado en la model card: https://huggingface.co/ConwayResearch/Underdog-27B-1.1
- Modelo borrador para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Releases de llama.cpp (builds CUDA para Windows): https://github.com/ggml-org/llama.cpp/releases

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de autenticacion y portales de la Universite de Lille (`ent.univ-lille.fr`, `univ-lille.fr`, `moodle.univ-lille.fr`, `calao.univ-lille.fr`) y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda realizada.
