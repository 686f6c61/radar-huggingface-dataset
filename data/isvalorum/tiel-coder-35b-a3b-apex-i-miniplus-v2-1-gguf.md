# IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1 es una cuantizacion GGUF publicada por el usuario IsValorum sobre el modelo base ornith-ai/Ornith-1.5-35B-A3B. No se trata de un modelo entrenado desde cero, sino de una receta de cuantizacion tensor a tensor disenada especificamente para arquitecturas MoE dispersas con atencion a instrucciones de codigo y flujos agenticos. El modelo base cuenta con 35.505.251.456 parametros totales y la nomenclatura "A3B" sugiere un subconjunto de parametros activos por token en el entorno de los 3.000 millones, aunque ese dato no se confirma en la informacion disponible.

El objetivo declarado de esta build es mantener una fidelidad de razonamiento propia de cuantizaciones Q5_K o Q6_K dentro de un presupuesto de almacenamiento de 15,23 GB (14,18 GiB), por debajo de la referencia Q3_K_M de 16,7 GB. Para ello conserva los routers de mezcla de expertos en F32 sin comprimir, la cabeza de salida en Q6_K, las puertas de atencion en Q8_0 y los expertos compartidos en Q5_K, evitando la compresion agresiva a IQ2_S que aplican otras builds comunitarias.

La relevancia actual del lanzamiento esta en su enfoque de despliegue: soporta contexto nativo de 256K, incluye un proyector multimodal de vision en Q8_0 (mmproj) y tensores de Multi-Token Prediction (MTP) integrados en el mismo GGUF para decodificacion especulativa. Esta pensado tanto para offload completo en GPUs de 24 GB como para inferencia con streaming desde memoria de sistema, con tasas declaradas de 20 a 45 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa, 40 capas, 256 micro-expertos, bloque MTP integrado |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere del orden de 3.000 millones, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | 256K tokens (contexto nativo declarado; soporte completo en VRAM con 24 GB) |
| Tipos de cuantizacion | Build unica APEX-I-MiniPlus V2.1: expertos nucleares IQ3_XXS, expertos de borde Q3_K (10 capas), experto compartido Q5_K (40 capas), atencion completa Q4_K para q/k/v, puertas de atencion Q8_0, cabeza de salida Q6_K, routers (gate_inp) F32; proyector de vision mmproj en Q8_0; tamano final 15,23 GB (14,18 GiB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Tamano del repositorio | 15,8 GB |
| Perplejidad WikiText-2 | 7,5117 ± 0,20722 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como una arquitectura de mezcla de expertos con 40 capas y 256 micro-expertos, junto con un experto compartido ("shexp") presente en las 40 capas, proyecciones de atencion completa en capas concretas (L3, L7, L11 y sucesivas) y matrices de enrutamiento (gate_inp en F32). Tambien incorpora un bloque de Multi-Token Prediction (MTP), cuyos tensores se conservan en el GGUF principal y pueden ser explotados por runtimes compatibles para decodificacion especulativa.

No hay datos publicados en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. Respecto a la cuantizacion, la innovacion tecnica destacable es la asignacion tensor a tensor: los routers se mantienen sin comprimir para evitar deriva de enrutamiento ("zero routing drift"), la cabeza de salida se protege en Q6_K y las puertas de atencion en Q8_0, mientras que los expertos nucleares (capas 10 a 29) se llevan a IQ3_XXS y los expertos de borde (capas 0 a 9 y 30 a 39) a Q3_K lineal. Segun el autor, sustituir codebooks no lineales por Q3_K optimizado para SIMD elimina las paradas de descompresion en CPU con AVX2, lo que habilita el streaming desde memoria de sistema.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones complejas, con enfasis declarado en codigo y tareas de razonamiento.
- Generacion de codigo y tareas asociadas a SWE-bench (resolucion de issues, parcheo de repositorios), por las etiquetas declaradas por el autor.
- Flujos agenticos y razonamiento multi-paso, segun las etiquetas "agentic" y "swe-bench".
- Capacidades multimodales de vision mediante el proyector mmproj en Q8_0, orientado a OCR y lectura de imagenes.
- Manejo de contexto largo: ventana nativa de 256K tokens, con soporte completo declarado en configuraciones de 24 GB de VRAM.
- Decodificacion especulativa mediante los tensores MTP integrados, en runtimes que los soporten.
- Multilingue limitado a ingles (en) y chino (zh).
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling, ni modos de pensamiento ("thinking mode"), ni capacidades de audio.

## Casos de uso

- Asistencia de programacion en local sobre estaciones de trabajo de 24 GB: el modelo puede cargarse con `-ngl 99` para offload completo y usarse como asistente de autocompletado, refactorizacion y generacion de tests sin enviar codigo a servicios externos.
- Agentes de resolucion de issues en repositorios: combinando la etiqueta "swe-bench" con la ventana de 256K tokens, se puede alimentar el modelo con arboles de proyecto y ficheros relevantes para que localice el fallo y proponga un parche.
- Analisis de repositorios completos: la ventana de 256K permite incluir multiples modulos, cabeceras e historiales de cambios en una sola pasada, evitando estrategias de recuperacion fragmentada cuando el proyecto no es enorme.
- OCR y extraccion de informacion de capturas de interfaz o documentacion escaneada: el proyector mmproj en Q8_0 puede cargarse en VRAM mientras los pesos principales se sirven desde memoria de sistema, lo que permite ejecutar vision en equipos sin GPU de gran capacidad.
- Servidores de inferencia sin GPU dedicada grande: el diseno de streaming desde DDR4 o DDR5 (6000+ MT/s) permite servir un modelo de 35B en un nodo con CPU moderna, con tasas declaradas de 20 a 45 tokens por segundo.
- Atencion tecnica bilingue ingles-chino: util para equipos que gestionan documentacion o tickets en ambos idiomas, con la salvedad de que no se declaran otros idiomas.
- Reduccion de latencia en produccion: el uso de los tensores MTP para decodificacion especulativa permite generar varios tokens por paso en runtimes compatibles, lo que rebaja el coste por token en cargas interactivas.
- Entornos air-gapped o con requisitos de privacidad estrictos: al ser un GGUF con licencia MIT, puede desplegarse integramente en infraestructura propia sin dependencias de API externas.

## Benchmarks y rendimiento

La informacion proporcionada incluye unicamente una medicion de perplejidad sobre el GGUF final. No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K, SWE-bench u otros).

| Metrica | Resultado | Notas |
|---|---|---|
| Perplejidad WikiText-2 | 7,5117 ± 0,20722 | Medida directamente sobre el GGUF final por el autor |
| MMLU | no disponible | Sin datos en la informacion proporcionada |
| HumanEval | no disponible | Sin datos en la informacion proporcionada |
| GSM8K | no disponible | Sin datos en la informacion proporcionada |
| SWE-bench | no disponible | El autor etiqueta el modelo con "swe-bench", pero no publica puntuacion |

## Requisitos de hardware

- Almacenamiento: 15,23 GB (14,18 GiB) para el GGUF principal, mas el proyector mmproj en Q8_0 y el espacio necesario para el contexto en cache.
- VRAM para offload completo: 24 GB o mas. El autor cita explicitamente RTX 3090, RTX 4090 y RTX 5090 como objetivos de offload total (`-ngl 99`) con contexto nativo de 256K.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090, 5090) para offload completo. No se documenta el comportamiento en tarjetas de 16 GB o menos con contexto largo.
- Inferencia desde memoria de sistema: soporta ejecucion total o parcial en RAM, con streaming. El rendimiento depende del procesador y del ancho de banda de memoria; el autor declara entre 20 y 45 tokens por segundo en configuraciones DDR4 de doble canal o DDR5 a 6000+ MT/s.
- Configuracion mixta: es posible mantener el proyector multimodal Q8_0 en VRAM para OCR mientras los pesos principales se sirven desde RAM.
- Opciones de despliegue: llama.cpp esta confirmado por las etiquetas del repositorio. No se confirma en la informacion proporcionada soporte para vLLM, Ollama, TGI u otros motores.
- Latencia y throughput: no se publican cifras de latencia por token ni de throughput agregado en servidor; solo el rango de 20 a 45 tok/s en memoria de sistema y la indicacion cualitativa de "blistering throughput" en GPU. La contribucion de la decodificacion especulativa MTP no se cuantifica.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos alternativos de la misma categoria en la informacion proporcionada. La unica comparacion documentada es interna a la familia del propio autor:

| Build | Expertos nucleares | Expertos de borde | Experto compartido | Cabeza de salida | Routers | Tamano | Impacto declarado |
|---|---|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (esta build) | IQ3_XXS | Q3_K (10 capas) | Q5_K (40 capas) | Q6_K | F32 | ~14,18 GiB | Sin paradas AVX2 en CPU, streaming eficiente desde RAM |
| APEX Mini generico de la comunidad | IQ2_S | Q3_K (5 capas) | Q4_K / Q3_K | Q3_K_M | Comprimidos | ~12,5 GB | Errores de sintaxis, indentacion de codigo rota y perplejidad alta en el bloque de pensamiento |

Comparativas con otros modelos de 35B, con alternativas MoE de tamano similar o con el propio modelo base ornith-ai/Ornith-1.5-35B-A3B: no disponible.

## Limitaciones y advertencias

- No hay benchmarks de razonamiento, codigo o agentes publicados: la unica metrica disponible es la perplejidad en WikiText-2, que no permite extrapolar calidad en tareas downstream.
- La ficha no documenta evaluaciones independientes. La tabla comparativa interna procede del propio autor y debe tratarse como material promocional, no como medicion neutral.
- Cobertura idiomatica limitada a ingles y chino. El castellano no figura entre los idiomas soportados.
- La compresion a IQ3_XXS en los expertos nucleares y Q3_K en los de borde implica una perdida de precision inevitable frente a pesos sin cuantizar; la perplejidad de 7,5117 es el unico indicador disponible del impacto.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni evaluaciones de veracidad, y el modelo esta etiquetado para tareas de codigo, donde una alucinacion puede producir parches sintacticamente validos pero funcionalmente incorrectos.
- No se documenta soporte explicito de tool calling ni de function calling, algo relevante si se pretende integrar el modelo en agentes que dependan de llamadas a herramientas.
- La decodificacion especulativa mediante MTP requiere runtimes compatibles; en motores que no los soporten, los tensores MTP quedan como sobrecarga sin beneficio.
- El rendimiento en memoria de sistema (20-45 tok/s) es altamente dependiente del procesador y del ancho de banda de memoria; no hay una tabla de resultados por plataforma.
- Licencia MIT: permite uso comercial sin restricciones declaradas, pero se aplica sobre una cuantizacion de un modelo base de terceros (ornith-ai/Ornith-1.5-35B-A3B); conviene verificar la licencia del modelo base antes de un despliegue comercial.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes de fallos en produccion.
- Fecha de publicacion indicada como 2026-09-22, sin historial de revisiones publico mas alla de las builds anteriores de la familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Paper, repositorio o demo adicionales: no disponible en la informacion proporcionada (los resultados de busqueda web no devolvieron enlaces relevantes al modelo).
