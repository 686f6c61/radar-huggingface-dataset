# GhostScientist/semanticwiki-coder-14b-v3

## Resumen

SemanticWiki Coder 14B v3 es un adaptador LoRA publicado por el usuario GhostScientist sobre Qwen/Qwen2.5-Coder-14B-Instruct, especializado en una tarea muy concreta: generar paginas de wiki de arquitectura de software al estilo DeepWiki a partir de un contexto de codigo con numeros de linea. Su rasgo diferencial es que cada afirmacion factual de la pagina generada debe ir acompanada de una cita estricta del tipo `path/file.ext:line` o `path:start-end`, verificable de forma determinista contra el repositorio real. Ademas de texto estructurado en secciones, el modelo produce diagramas Mermaid.

El modelo base es un transformer decoder-only denso de aproximadamente 14.700 millones de parametros, con 32.768 tokens de contexto nativo (ampliables a 131.072 mediante YaRN). El adaptador se entreno con SFT supervisado (TRL) sobre 313 paginas procedentes de 97 repositorios reales de GitHub, con perdida completion-only y una longitud maxima de secuencia de 24.576 tokens. El repositorio pesa 1,1 GB, coherente con un adaptador y no con pesos completos.

Su relevancia actual esta en el nicho de la documentacion automatica auditable: frente al modelo base, la validez de citas en el conjunto de evaluacion pasa de 0,308 a 0,562 (mejora relativa del 83 %) y la densidad de citas por pagina sube de 2,0 a 4,9. Se trata, sin embargo, de un modelo muy joven y de proposito especifico, con 0 descargas y un unico "like" en el momento de redactar esta ficha, por lo que debe tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parametros totales | ~14.700 millones en el modelo base; el repositorio contiene unicamente un adaptador LoRA (r=64, alpha=128, dropout 0,05, aplicado a todas las proyecciones lineales) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 24.576 tokens en entrenamiento; el modelo base soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible: el repositorio solo publica el adaptador en safetensors; no se ofrecen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen2.5-Coder es multilingue, pero el autor no documenta idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un ajuste por LoRA del instructivo Qwen2.5-Coder-14B-Instruct. El adaptador usa rango 64, alpha 128 y dropout 0,05 sobre todas las proyecciones lineales, lo que implica entre 1 y 2 % de parametros entrenables sobre el total del modelo base. El entrenamiento se hizo con TRL 1.14.1, Transformers 5.18.0, PyTorch 2.14.1, PEFT 0.21.2 y Datasets 5.1.0, con 2 epocas, learning rate 1e-4 con decaimiento coseno, batch efectivo de 16 y una longitud maxima de secuencia de 24.576 tokens. La perdida es completion-only: el contexto de codigo con numeros de linea no se entrena, solo la completion, lo que evita que el modelo aprenda a reproducir el repositorio de entrada.

Los datos de entrenamiento provienen del dataset GhostScientist/semanticwiki-data-v3: 313 paginas wiki generadas a partir de 97 repositorios reales de GitHub, con cada cita verificada de forma determinista contra el repositorio. La perdida final fue de 0,5101 y la precision por token de 0,823. La innovacion tecnica no esta en la arquitectura, sino en el contrato de salida: el formato de entrada `<START_OF_CONTEXT> ... <END_OF_CONTEXT>` seguido de la consulta en etiquetas `<query>`, y la obligacion de que toda afirmacion factual lleve una cita `path:line` resoluble. No se documenta ninguna fase de RLHF o DPO adicional sobre el adaptador.

## Capacidades

- Generacion de paginas wiki de arquitectura de software con secciones estructuradas, a partir de un volcado de codigo con numeros de linea.
- Citacion verificable de codigo fuente en formato `path/file.ext:line` y `path:start-end`, pensada para resolverse contra el repositorio real.
- Generacion de diagramas Mermaid integrados en la documentacion (diagramas de flujo, componentes o dependencias).
- Redaccion tecnica en ingles orientada a documentacion de proyectos y wikis de ingenieria.
- Comprension de contexto de codigo de hasta 24.576 tokens, suficiente para varios ficheros de un modulo de tamano medio en una sola pasada.
- Tool calling y function calling: no documentado en la model card, aunque el modelo base Qwen2.5-Coder-14B-Instruct si los soporta de serie.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Capacidades de agente multi-paso: no documentadas; la tarea entrenada es de una sola pasada (contexto y consulta a pagina).

## Casos de uso

- Documentacion automatica de repositorios internos: se alimenta al modelo un arbol de ficheros y el codigo numerado de un modulo, y devuelve una pagina wiki con citas que el equipo puede verificar linea a linea antes de publicar.
- Onboarding de nuevos desarrolladores: generar paginas de arquitectura por modulo para que una persona recien incorporada entienda el flujo de datos sin leer miles de lineas, con enlaces directos al codigo de origen.
- Auditoria y trazabilidad documental: en entornos regulados, las citas `path:line` permiten demostrar de donde sale cada afirmacion de la documentacion tecnica, algo que un modelo generalista no garantiza.
- Integracion en CI/CD: ejecutar el modelo como paso de un pipeline que, en cada pull request, regenere la wiki de los modulos afectados y falle o marque si la documentacion queda desactualizada.
- Mantenimiento de documentacion de codigo legacy: volcar modulos heredados sin documentar y obtener una primera version de la wiki, que luego se corrige con el equipo original.
- Generacion de diagramas de arquitectura: producir diagramas Mermaid de dependencias o flujos a partir del propio codigo, utiles para presentaciones tecnicas y revisiones de diseno.
- Base para un sistema RAG de documentacion de codigo: usar el modelo como generador final en un pipeline que recupera ficheros relevantes y luego pide la pagina citada.
- Revision de codigo asistida con evidencia: al exigir citas exactas, el modelo sirve para senalar en que linea concreta esta un patron problematico, en lugar de dar una respuesta vaga.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluacion SemanticWiki-Eval v3, con 13 repositorios retenidos y 26 paginas, comparando el adaptador con su modelo base. La columna "Formato" mide el cumplimiento del formato esperado, "Validez de citas" la proporcion de citas que resuelven correctamente contra el repositorio, y "Fidelidad" es una puntuacion de un juez en escala 1-5.

| Modelo | Formato | Validez de citas | Fidelidad (juez 1-5) | Citas por pagina |
|---|---:|---:|---:|---:|
| semanticwiki-coder-14b-v3 (este modelo) | 0,812 | 0,562 | 3,39 | 4,9 |
| Qwen2.5-Coder-14B-Instruct (base) | 0,755 | 0,308 | 3,15 | 2,0 |

No se han publicado resultados en la informacion disponible para benchmarks generalistas (MMLU, HumanEval, GSM8K u otros), y el autor no los reporta. La mejora en validez de citas es del 83 % en terminos relativos respecto al modelo base. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 28-30 GB solo para los pesos del modelo de 14B, mas la cache KV.
- Cache KV estimada para el modelo base: con GQA de 8 cabezas KV, 48 capas y dimension de cabeza 128, cada token ocupa unos 192 KiB en fp16. A 24.576 tokens de contexto eso supone del orden de 4,8 GB adicionales; la cifra es una estimacion a partir de la configuracion publica del modelo base, no un dato de la model card.
- Cuantizacion de 8 bits: unos 15 GB de pesos, viable en una RTX 4090 (24 GB) o una L40S con contexto moderado.
- Cuantizacion de 4 bits (NF4/bitsandbytes): unos 9-10 GB de pesos, viable en RTX 3090 (24 GB), RTX 4090 (24 GB) y, con margen ajustado, en GPUs de 16 GB.
- GPU de referencia para produccion: A100 40 GB o H100 80 GB en bf16, o bien dos RTX 4090 con tensor parallelism si se necesita precision completa.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion de 8 o 4 bits; en bf16 con 24 GB no cabe.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; vLLM (soporta adaptadores LoRA o el modelo fusionado); TGI; Hugging Face Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`); llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir a GGUF, conversion que el autor no publica.
- Latencia y throughput estimados: no disponibles.
- Nota practica: el prompt incluye codigo fuente numerado, por lo que en repositorios grandes el consumo de contexto crece rapido y conviene trocear por modulo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Validez de citas | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| semanticwiki-coder-14b-v3 | ~14,7B (adaptador LoRA) | 24.576 en entrenamiento | 0,562 | 3,39 | Apache-2.0 | HuggingFace, requiere modelo base |
| Qwen2.5-Coder-14B-Instruct | ~14,7B | 32.768 nativos (131.072 con YaRN) | 0,308 | 3,15 | Apache-2.0 | HuggingFace, pesos completos |
| Otras alternativas de documentacion automatica de codigo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otros modelos especializados en generacion de documentacion con citas, ni el autor los aporta. La unica comparacion medida disponible es contra el modelo base, que es el resultado que se muestra arriba. Cualquier comparacion con alternativas como modelos generalistas de gran tamano o pipelines de documentacion propietarios quedaria fuera de la evidencia publicada.

## Limitaciones y advertencias

- La validez de citas en repositorios no vistos es de 0,562, frente al aproximadamente 1,0 del dataset profesor: la alucinacion de numeros de linea sigue siendo el principal modo de fallo.
- La fidelidad se mide con un juez automatico que, segun advierte el propio autor, pertenece a la familia Qwen3, lo que introduce un posible sesgo de autoevaluacion en esa metrica.
- El dataset de entrenamiento es pequeno (313 paginas de 97 repositorios), por lo que existe riesgo de sobreajuste al formato de entrada y de degradacion fuera de ese estilo de contexto.
- El modelo depende completamente del formato de entrada con numeros de linea; sin ese formato, la calidad de las citas no esta garantizada.
- El contexto de 24.576 tokens limita el tamano del repositorio o modulo que se puede procesar en una sola pasada.
- No se documentan idiomas soportados ni sesgos conocidos; la model card esta redactada en ingles y la tarea entrenada parece orientada a documentacion tecnica en ingles.
- Licencia Apache-2.0 para el adaptador, permisiva para uso comercial, pero conviene verificar la licencia del modelo base antes de desplegar en produccion.
- El modelo requiere descargar el base Qwen2.5-Coder-14B-Instruct y cargar el adaptador con PEFT; no es un modelo autonomo.
- Repositorio con 0 descargas y 1 "like": sin validacion comunitaria, sin mantenimiento demostrado y sin garantia de soporte.
- Fecha de creacion del repositorio: 6 de octubre de 2026 (segun los metadatos de HuggingFace).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GhostScientist/semanticwiki-coder-14b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/GhostScientist/semanticwiki-data-v3
- Dataset de evaluacion: https://huggingface.co/datasets/GhostScientist/semanticwiki-eval-v3
- Repositorio de TRL: https://github.com/huggingface/trl
- Busqueda web: no se han encontrado resultados relevantes; las consultas devolvieron unicamente paginas de cartelera de cine sin relacion con el modelo.
