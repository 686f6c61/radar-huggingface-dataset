# electroglyph/flint-uncensored

## Resumen

Flint Uncensored es una variante «decensored» (abliterated) del modelo RecursiveSI/flint, un transformer decoder-only con mezcla de expertos (MoE) desarrollado por Recursive para agentes de programación. El modelo original tiene 39.785.287.584 parámetros totales y aproximadamente 2,5 mil millones activos por token, y está diseñado para explorar repositorios de código, corregir errores, implementar funcionalidades y escribir tests. Esta versión, publicada por el usuario electroglyph, aplica una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo base.

El interés de esta ficha es doble: por un lado documenta las especificaciones del modelo base Flint (49 capas, 256 expertos enrutados por capa, ventana de contexto documentada de 262.144 tokens, corte de conocimiento en junio de 2026); por otro, describe qué cambia exactamente la ablación, qué coste tiene en divergencia respecto al original (KL de 0,0669) y qué implicaciones prácticas tiene publicar un checkpoint sin alineación de seguridad en un formato que solo se sirve con SGLang.

La relevancia es acotada: el modelo tiene 37 descargas y 2 «likes» en el momento de redactar esta ficha, no incluye código de modelado para Transformers pese a la etiqueta de la librería, y sus cifras de rendimiento proceden del modelo base, no de la variante ablacionada. Debe evaluarse como un experimento reproducible de desalineación controlada sobre un MoE de ~40B orientado a agentes, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE): 49 capas, 2 densas iniciales + 47 capas MoE |
| Parametros totales | 39.785.287.584 (~39,8 B) |
| Parametros activos | ~2,5 B por token incluyendo la cabeza de salida; cuerpo activo ~2,2 B (designacion comercial «40B-A2.5B») |
| Longitud de contexto | 262.144 tokens documentados, compartidos entre prompt y salida |
| Tipos de cuantizacion | BF16 en este repositorio; el autor del modelo base prepara variantes NVFP4 por separado para NVIDIA y Apple Silicon. No se documentan GGUF ni otras cuantizaciones para esta variante |
| Idiomas soportados | no disponible (la model card solo declara entrada y salida de texto; no especifica cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 244,5 GB con directorio `reproduce/` para reproducir la ablacion |
| Vocabulario | 150.144 tokens |
| Cabezas de atencion | 32 cabezas de consulta y 4 de clave/valor (GQA 8:1), dimension de cabeza 128 |
| Atencion | 35 capas con sliding window de 513 tokens + 14 capas de atencion completa |
| Expertos por capa MoE | 256 expertos enrutados, 6 seleccionados por token, mas un experto compartido siempre activo |
| Codificacion posicional | RoPE en capas de sliding window; sin codificacion posicional en capas de atencion completa |
| Corte de conocimiento | junio de 2026 (declarado por el autor del modelo base) |
| Libreria declarada | transformers (etiqueta), aunque la model card indica que el codigo de modelado para Transformers no esta incluido y el servicio se realiza con SGLang |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con mezcla de expertos de 49 capas: dos capas densas seguidas de 47 capas MoE con 256 expertos enrutados cada una, de los que se seleccionan 6 por token, más un experto compartido siempre activo. La atencion combina 35 capas con sliding window de 513 tokens (token actual más 512 precedentes) y 14 capas de atencion completa sin codificacion posicional; las capas con ventana usan RoPE. Emplea 32 cabezas de consulta y 4 de clave/valor (dimension 128), con QK RMSNorm por cabeza y attention sinks aprendidos por cabeza. El vocabulario es de 150.144 tokens y la configuracion documentada de contexto alcanza 262.144 tokens, incluyendo prompt y generacion.

Segun la model card del modelo base, Flint se entreno desde cero en cuatro fases: pretraining, mid-training, supervised fine-tuning y reinforcement learning, con datos de texto y codigo. La informacion disponible se interrumpe en ese punto, por lo que no se detallan el numero total de tokens, la composicion exacta del dataset ni los algoritmos concretos de RLHF/DPO empleados. La innovacion destacable de esta variante concreta no esta en la arquitectura, sino en el post-entrenamiento: se aplica Arbitrary-Rank Ablation (ARA) con Heretic v2.0.0.dev0 sobre las capas 18 a 41, con `preserve_good_behavior_weight` 0,3002, `steer_bad_behavior_weight` 0,0055, `overcorrect_relative_weight` 0,9862, `neighbor_count` 5, `loss_mode` relativo y componentes de experto compartido `up_proj` y `gate_proj`. El resultado declarado es de 7 rechazos sobre 100 frente a 98 sobre 100 del original, con una divergencia KL de 0,0669 respecto al modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento explicito: el modelo emite `reasoning_content` en las respuestas, que debe conservarse en el historial de la conversacion segun la model card.
- Programacion y trabajo sobre bases de codigo: exploracion de repositorios, correccion de errores, implementacion de funcionalidades y escritura de tests (objetivo declarado del modelo base).
- Uso de herramientas en modo multi-turno con formato compatible con la API de OpenAI (`tool_calls`).
- Comportamiento agentico de varios pasos, con presupuesto de salida recomendado de al menos 32.768 tokens para problemas dificiles.
- Capacidades multilingues: no disponible (no se documenta cobertura de idiomas; los ejemplos de la model card estan en ingles).
- No se declaran capacidades de vision, audio ni multimodalidad: la entrada y la salida son exclusivamente texto.
- Efecto de la ablacion: supresion practicamente total de los rechazos en las pruebas del autor (7/100), que es la capacidad diferenciadora respecto al modelo base.

## Casos de uso

- Agente de correccion de bugs en repositorios: el modelo puede recibir un issue, navegar por el arbol de ficheros y proponer un parche; su contexto de 262.144 tokens permite cargar ficheros relacionados y trazas sin truncar, y el formato de tool calling encaja con harnesses tipo mini-swe-agent.
- Automatizacion de implementacion de funcionalidades: integrado en un pipeline que recibe una especificacion y un repositorio, genera los cambios y los valida con la suite de tests existente, usando el modo de razonamiento para descomponer la tarea.
- Generacion de tests unitarios y de integracion: dado un modulo, producir casos de prueba y ejecutarlos mediante herramientas, aprovechando el bucle agentico multi-paso.
- Asistente de refactorizacion a gran escala: analisis de dependencias entre multiples ficheros dentro de una sola ventana de contexto, con salida de parches por fichero.
- Investigacion sobre desalineacion y robustez: al ser un modelo reproducible (directorio `reproduce/` con la configuracion exacta de Heretic), sirve como caso de estudio controlado de como una ablacion de rangos arbitrarios afecta a rechazos y a divergencia KL.
- Evaluacion comparativa de tecnicas de abliteration: la tabla de parametros ARA permite replicar el experimento y comparar con otras ablaciones sobre el mismo checkpoint base.
- Escenarios de red teaming y evaluacion de seguridad: util para medir la eficacia de filtros externos o clasificadores de salida sobre un modelo sin alineacion interna, en entornos aislados.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base RecursiveSI/flint, no a esta variante ablacionada. Se midieron con temperatura 1.0, top-p 0.95 y top-k 20; Terminal-Bench con Terminus 2 y SWE-bench con mini-swe-agent, reportando pass@1 medio sobre al menos cinco intentos.

| Benchmark | Flint (modelo base) | Flint Uncensored |
|---|---|---|
| Terminal-Bench 2.1 | 54,9 % | no disponible |
| SWE-bench Pro v2 | 89,7 % | no disponible |
| SWE-bench Verified | 74,2 % | no disponible |
| Rechazos (100 peticiones) | 98/100 | 7/100 |
| Divergencia KL respecto al base | 0 (por definicion) | 0,0669 |

Advertencias sobre estas cifras: el autor del modelo base indica que su puntuacion en Terminal-Bench cuenta como fallidas las soluciones obtenidas mediante recuperacion web, y que las puntuaciones de los modelos comparativos son reportadas por sus desarrolladores, no medidas por Recursive. No hay resultados publicados de MMLU, HumanEval ni GSM8K en la informacion disponible, y no se ha evaluado el impacto de la ablacion sobre las tareas de codigo.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos de 39,8 B parametros ocupan aproximadamente 80 GB (el autor del modelo base indica una descarga de ~80 GB), mas memoria para KV cache y activaciones; el repositorio de esta variante ocupa 244,5 GB, presumiblemente por artefactos de reproduccion adicionales.
- GPU recomendadas por el autor: una B300 o una H200 por replica, con los scripts `sglang/serve_b300.sh` y `sglang/serve_h200.sh` respectivamente. No se documenta soporte para GPUs de menor capacidad.
- GPU de consumo: no viable en BF16. Como estimacion derivada del numero de parametros, una hipotetica cuantizacion a 4 bits rondaria los 20-22 GB y cabria teoricamente en una RTX 4090 o RTX 5090, pero no se han publicado pesos GGUF ni recetas de cuantizacion para este modelo, y el autor advierte de que el codigo de modelado para Transformers aun no esta incluido.
- Cuantizacion NVFP4: el autor del modelo base prepara variantes NVFP4 para runtimes NVIDIA y Apple Silicon, lo que reduce los requisitos de memoria, aunque no se especifican cifras.
- Opciones de despliegue confirmadas: kit SGLang incluido en el repositorio (Docker + endpoint compatible con OpenAI en el puerto 30000), con soporte de multi-GPU documentado en `sglang/README.md`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Para el cliente solo se requiere `huggingface_hub` y el SDK de OpenAI; el endpoint expone `/v1/chat/completions` y `/health_generate`.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Flint Uncensored (esta ficha) | 39,8 B / ~2,5 B | 262.144 | Apache 2.0 | MoE para agentes de codigo, sin alineacion de seguridad | Pesos safetensors BF16, servicio via SGLang; 37 descargas |
| RecursiveSI/flint (base) | 39,8 B / ~2,5 B | 262.144 | Apache 2.0 | MoE para agentes de codigo con alineacion | Pesos BF16 + kit SGLang, variantes NVFP4 |
| Qwen3-Coder-30B-A3B-Instruct | 30,5 B / 3,3 B | 262.144 | Apache 2.0 | MoE orientado a codigo y uso agentico | Amplia disponibilidad, multiples cuantizaciones y runtimes |
| Devstral-Small-2507 | 24 B densos | 128.000 | Apache 2.0 | Modelo denso para agentes de codigo | Disponible en varios formatos y proveedores |
| GLM-4.5-Air | 106 B / 12 B | 131.072 | MIT | MoE generalista con modo de razonamiento y tool calling | Pesos abiertos, amplio ecosistema |

La comparacion de rendimiento directo no esta disponible: Flint publica Terminal-Bench 2.1, SWE-bench Pro v2 y SWE-bench Verified con protocolos propios (Terminus 2, mini-swe-agent, ajuste por recuperacion web), mientras que las cifras de los modelos alternativos provienen de sus respectivos desarrolladores con configuraciones distintas. En terminos de requisitos, Flint es el unico de la lista que exige una H200 o B300 por replica segun su propia documentacion, lo que reduce drasticamente su portabilidad frente a Qwen3-Coder-30B-A3B o Devstral-Small.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: la ablacion reduce los rechazos de 98/100 a 7/100, por lo que el modelo respondera a peticiones que el original declinaba. Requiere filtrado externo obligatorio en cualquier despliegue expuesto a usuarios.
- La ablacion no es gratuita: la divergencia KL de 0,0669 respecto al base implica cambios en la distribucion de salida que pueden degradar capacidades no medidas; no hay evaluaciones de codigo, razonamiento o tool calling sobre la variante ablacionada.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion, ni para el base ni para esta variante.
- Idiomas: no se documenta cobertura multilingue; la model card y los ejemplos estan en ingles. El rendimiento en castellano es desconocido.
- Contexto: los 262.144 tokens se comparten entre prompt y salida; con el presupuesto recomendado de 32.768 tokens de salida para problemas dificiles, el espacio efectivo para entrada se reduce.
- Infraestructura: no hay codigo de modelado para Transformers pese a la etiqueta `transformers` del repositorio; el unico camino de servicio documentado es SGLang sobre H200 o B300. No hay GGUF, no hay soporte declarado para vLLM/Ollama/llama.cpp y no se puede ejecutar en GPU de consumo con los formatos publicados.
- Madurez: 37 descargas y 2 «likes», publicada el 22 de octubre de 2026 y actualizada el 24 de octubre de 2026. No hay validacion independiente de la calidad de la ablacion ni de la reproducibilidad declarada.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con renuncia de garantias. La licencia no exime de las obligaciones legales aplicables al contenido generado sin filtros de seguridad, ni de las condiciones de uso de los proveedores de infraestructura.
- Trazabilidad de los benchmarks: las cifras de Terminal-Bench y SWE-bench provienen del modelo base y de un protocolo definido por el desarrollador; no son directamente comparables con las de otros modelos.
- Corte de conocimiento en junio de 2026: cualquier informacion posterior no estara cubierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/electroglyph/flint-uncensored
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Organizacion del desarrollador: https://huggingface.co/RecursiveSI
- Blog de presentacion de Recursive Flint: https://www.recursive.com/updates/introducing-recursive-flint
- Repositorio del motor local: https://github.com/recursive-oss/rec
- Documentacion: https://docs.recursive.com/getting-started
- Proyecto Heretic (herramienta de ablacion utilizada): https://heretic-project.org
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los anteriores, extraidos de la model card.
