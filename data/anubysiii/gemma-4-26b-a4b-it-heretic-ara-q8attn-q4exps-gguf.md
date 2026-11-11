# AnubysIII/gemma-4-26B-A4B-it-heretic-ara-Q8attn-Q4exps-GGUF

## Resumen

Gemma 4 26B-A4B it Heretic ARA es una cuantizacion GGUF del modelo `MoonRide/gemma-4-26B-A4B-it-heretic-ara`, a su vez derivado de Google Gemma 4 26B-A4B it mediante una ablacion de rechazos (abliteration) que elimina las respuestas de negativa del modelo original. El autor de esta ficha, AnubysIII (Sovereign Games LLC), ha construido una cuantizacion mixta pensada para repartir la inferencia entre GPU y RAM del sistema, manteniendo en alta precision los tensores que se ejecutan en cada token y comprimiendo solo los expertos enrutados.

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) de 25.233.142.046 parametros totales, de los cuales solo una fraccion se activa por token (la nomenclatura A4B indica aproximadamente 4.000 millones de parametros activos). Es multimodal de entrada, con pipeline `image-text-to-text`, y admite conversacion multi-turno, vision y un modo de razonamiento interno (thinking) que puede desactivarse.

La relevancia de esta publicacion es practica: ofrece un GGUF de 16,4 GB que, segun el autor, queda un tercio mas cerca del Q8_0 de referencia que un Q4_K_M estandar de tamano similar (16,8 GB), gracias a mantener atencion, embeddings, pesos compartidos y capa de salida en Q8_0 mientras comprime solo los expertos. Esta pensado para tarjetas de 12, 16 y 24 GB mediante offload selectivo de expertos a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (image-text-to-text) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (denominacion A4B) |
| Longitud de contexto | 32.768 tokens en configuracion recomendada; 65.536 tokens con contexto compartido (`-c 65536 -np 3 -kvu`) |
| Tipos de cuantizacion | GGUF mixta: Q8_0 en atencion, pesos compartidos, embeddings y salida; Q4_K en `ffn_gate_up_exps`; Q5_0 en `ffn_down_exps` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj` Q8_0 para vision y cabeza MTP Q8_0 para decodificacion especulativa |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de Google (familia Gemma 4), con atencion sobre una ventana de contexto que el autor opera a 32K o 64K tokens. El pipeline declarado es `image-text-to-text`, lo que implica un proyector visual (`mmproj-gemma-4-26B-A4B-it-Q8_0.gguf`, 0,8 GB) que inyecta caracteristicas de imagen en el espacio de tokens del modelo. Se incluye ademas una cabeza de borrador MTP (`mtp-gemma-4-26B-A4B-it-Q8_0.gguf`, 0,5 GB) que habilita decodificacion especulativa multi-token.

Sobre el entrenamiento original no se aportan datos en la informacion disponible: no se especifican numero de tokens, composicion del corpus ni si hubo RLHF o DPO. Lo que si se documenta es el post-procesado: el modelo base paso por una ablacion de rechazos (abliteration, etiquetada como "heretic") que elimina los patrones de negativa aprendidos, y por un ajuste posterior identificado como "ARA" en el nombre del modelo base, cuyos detalles no se detallan.

La innovacion tecnica de esta ficha concreta es la estrategia de cuantizacion por tipo de tensor: se requantizo desde el Q8_0 de MoonRide con `llama-quantize --allow-requantize --tensor-type "ffn_.*_exps=q4_K"`, sin matriz de importancia (imatrix). Como la fuente ya era Q8_0, solo los expertos pierden precision. `ffn_down_exps` se fija en Q5_0 porque sus filas no encajan en los bloques de 256 elementos de Q4_K y llama.cpp recurriria a su propio fallback.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (soporte `--jinja` para plantillas de chat).
- Razonamiento con modo thinking, desactivable mediante `--reasoning-budget 0`.
- Comprension de imagenes (image-text-to-text) mediante el proyector `mmproj` incluido.
- Decodificacion especulativa mediante la cabeza MTP incluida, que acelera la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking y el contexto de 32K-64K lo permiten tecnicamente, pero no hay validacion publicada.
- Modelo "uncensored": se han eliminado los rechazos, por lo que responde a peticiones que el modelo original declinaria.

## Casos de uso

- Asistente personal en movil o escritorio: el autor lo describe como su "phone assistant and story model" en produccion diaria; con `-ncmoe 14` ocupa 10,7 GB de VRAM a 16K de contexto, lo que encaja en portatiles con GPU de 12 GB.
- Generacion creativa de ficcion y narrativa: el contexto de 32K-64K tokens permite mantener arcos narrativos largos y coherencia de personajes a lo largo de capitulos, y el modo thinking ayuda a planificar tramas.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre capturas, diagramas o paginas escaneadas usando el proyector `mmproj` junto al modelo principal.
- Despliegue en hardware heterogeneo: la cuantizacion mixta y el flag `-ncmoe` permiten ajustar cuantos expertos viven en CPU, de modo que una sola maquina con GPU modesta y RAM abundante sirve el modelo con latencia aceptable (79 tok/s con 14 expertos en CPU).
- Servicio de chat autohospedado con `llama-server`: la configuracion `-c 65536 -np 3 -kvu` reparte 64K de contexto entre tres slots concurrentes con 11,65 GB de VRAM, util para atender a varios usuarios en una sola GPU de 16-24 GB.
- Experimentacion en investigacion sobre alineacion y seguridad: al ser una version sin rechazos, sirve para estudiar el comportamiento de modelos abliterated frente al original, siempre con las salvaguardas adecuadas.
- Prototipado rapido en local sin dependencia de la nube: un unico archivo GGUF de 16,4 GB mas los dos auxiliares se ejecuta con llama.cpp en CPU y GPU, sin servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor aporta unicamente una comparacion de divergencia KL frente al Q8_0 de origen sobre wikitext-2 (40 fragmentos de 512 tokens, `llama-perplexity --kl-divergence`):

| Cuantizacion | Tamano | KLD media vs Q8_0 | Mismo token top-1 que Q8_0 |
|---|---|---|---|
| Esta ficha (Q8attn-Q4exps) | 16,4 GB | 1,00 | 70,0% |
| Q4_K_M estandar | 16,8 GB | 1,49 | 62,3% |

El autor advierte que la perplejidad absoluta de esta build en texto crudo es anomala (aproximadamente 9.500 incluso para el Q8_0, en GPU y CPU), por lo que solo la comparacion relativa es valida. En chat el comportamiento es normal segun sus pruebas.

Rendimiento medido en una RTX 3080 20 GB con EPYC 7402, `-fa on -ctk q8_0 -ctv q8_0`, 20 hilos:

| Expertos en CPU (`-ncmoe`) | VRAM (contexto 16K) | Generacion (tok/s) | Prompt (tok/s, 1500 tokens) |
|---|---|---|---|
| 0 (todo en GPU) | cabe en 20 GB | 126 | 4609 |
| 8 | 13,4 GB | 93 | 1574 |
| 14 | 10,7 GB | 79 | 1047 |

## Requisitos de hardware

- VRAM estimada: 20 GB o mas para cargar todo en GPU a 16K de contexto; 13,4 GB con 8 expertos en CPU; 10,7 GB con 14 expertos en CPU; 11,65 GB para 64K de contexto compartido entre 3 slots con 14 expertos en CPU.
- GPU recomendadas: RTX 3090/4090 (24 GB) para ejecucion completa; RTX 3080 20 GB, RTX 4080 16 GB o similares con offload parcial; A100/H100 sobredimensionadas para este tamano salvo por concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 12, 16 y 24 GB con `-ncmoe` ajustado (los valores para 12 y 16 GB son extrapolaciones del autor a partir de las medidas en 20 GB, no pruebas directas).
- Opciones de despliegue: `llama-server` y `llama.cpp` (unico runtime documentado); compatible con endpoints (`endpoints_compatible`). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 126 tok/s de generacion y 4609 tok/s de prompt con todo en GPU; 79 tok/s y 1047 tok/s con 14 expertos en CPU, sobre el hardware citado.
- Flags relevantes: `-fa on`, `-ctk q8_0`, `-ctv q8_0`, `--jinja`, `--mmproj` para vision, `--reasoning-budget 0` para desactivar thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del archivo | Licencia | Notas |
|---|---|---|---|---|---|
| Esta ficha (Gemma 4 26B-A4B heretic ARA, Q8attn-Q4exps) | 25,2B totales / ~4B activos | 32K-64K | 16,4 GB | Apache-2.0 | KLD 1,00 vs Q8_0; 70,0% de coincidencia top-1 |
| Mismo modelo en Q4_K_M estandar | 25,2B totales / ~4B activos | 32K-64K | 16,8 GB | Apache-2.0 | KLD 1,49 vs Q8_0; 62,3% de coincidencia top-1 |
| Mismo modelo en Q8_0 | 25,2B totales / ~4B activos | 32K-64K | 26,9 GB | Apache-2.0 | Referencia de calidad; requiere mas VRAM |
| Gemma 4 26B-A4B it original (sin abliterar) | 25,2B totales / ~4B activos | no disponible | no disponible | Apache-2.0 | Conserva los rechazos; resto de capacidades equivalentes en teoria |

No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con modelos de otros autores.

## Limitaciones y advertencias

- Modelo sin rechazos (abliterated): puede generar contenido que el modelo original declinaria. El autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir afirmaciones falsas con fluidez.
- Perplejidad anomala en texto crudo con esta build y version de llama.cpp (aproximadamente 9.500 incluso para Q8_0), segun el propio autor; no afecta al chat pero invalida evaluaciones absolutas de calidad sobre texto sin formato.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue mas alla de lo que herede del Gemma 4 original.
- Tool calling y comportamiento agentico no documentados; no asumir soporte en produccion sin validacion propia.
- Los valores de VRAM para tarjetas de 12 y 16 GB son extrapolaciones del autor desde medidas en una GPU de 20 GB, no pruebas directas.
- La cuantizacion se hizo sin imatrix y por requantizacion desde Q8_0; solo los expertos pierden precision, pero no hay evaluacion de tareas downstream (codigo, matematicas, vision) que cuantifique el impacto.
- Licencia Apache-2.0 permite uso comercial, pero la condicion de modelo sin censura puede chocar con politicas de plataforma o requisitos regulatorios del despliegue.
- El repositorio registra 0 descargas y 1 like en el momento de la ficha: no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnubysIII/gemma-4-26B-A4B-it-heretic-ara-Q8attn-Q4exps-GGUF
- Modelo base (MoonRide): https://huggingface.co/MoonRide/gemma-4-26B-A4B-it-heretic-ara
- Perfil del autor del base: https://huggingface.co/MoonRide
- llama.cpp: https://github.com/ggml-org/llama.cpp
