# IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Iris-mini APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF de precisión mixta del modelo base AllSpark-Research/Iris-mini, publicada por el usuario IsValorum. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales distribuidos en 40 capas y 256 micro-expertos, etiquetado en la model card bajo el identificador `qwen35moe`. La propuesta del autor no es un modelo nuevo, sino una receta de cuantización tensor a tensor diseñada para exprimir la calidad de razonamiento dentro de un presupuesto de peso de aproximadamente 13,74 GiB.

El problema que aborda es concreto: los quants comunitarios de 2-3 bits uniformes degradan de forma severa los modelos MoE de razonamiento, provocando errores de sintaxis, llaves de código rotas y picos de perplejidad. La receta MiniPlus V2.1 mantiene los routers (`gate_inp`) sin comprimir en F32, protege la cabeza de salida en Q6_K, los gates de atención en Q8_0 y los expertos núcleo en IQ3_XXS o superior, con el objetivo declarado de obtener fidelidad propia de Q5_K/Q6_K en una huella de 3 bits.

Su relevancia práctica reside en el perfil de despliegue: la edición V2.1 está optimizada para streaming desde RAM del sistema con ventanas de contexto largas (hasta 256K tokens), reservando la VRAM de la GPU para la caché KV. El autor reporta velocidades de generación de +24 a 28 tok/s bajo offload a RAM y una perplejidad WikiText-2 de 5,3735 ± 0,1214, medida directamente sobre el binario GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; 40 capas y 256 micro-expertos; etiquetada como `qwen35moe` en la model card |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens según la model card (la edición V2.1 se describe como apta para ventanas de +160K a 256K); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF de precisión mixta: `IQ3_XXS` (expertos núcleo, capas 10-29), `Q3_K` (expertos de borde, 10 capas), `Q5_K` (experto compartido, 40 capas), `Q4_K` para `q/k/v` y `Q6_K` para `output` en atención completa, `Q8_0` en gates de atención (30 capas), `Q6_K` en cabeza de salida, `F32` sin comprimir en routers (`gate_inp`); ~3 bits efectivos, ~13,74 GiB |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

La información disponible corresponde a la ficha de la cuantización, no a la del modelo base, por lo que no se detallan aquí los datos de preentrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o etapas de ajuste). Lo que sí se especifica es la topología: 40 capas con 256 micro-expertos, un experto compartido (`shexp`) presente en las 40 capas y routers de enrutamiento por token. La etiqueta `qwen35moe` y la presencia de proyecciones de atención completas en capas concretas (L3, L7, L11, etc.) apuntan a una arquitectura MoE dispersa de estilo Qwen, con atención completa intercalada. El número de parámetros activos por token no se publica en la información proporcionada.

La innovación técnica de esta publicación es exclusivamente la receta de cuantización. El autor describe una auditoría tensor a tensor cuyo principio es asimétrico: los componentes sensibles a la precisión (routers, cabeza de salida, gates de atención) se mantienen en alta precisión, mientras que la masa de parámetros de los expertos se comprime de forma agresiva. Frente a la versión V1, la V2.1 eleva los 40 expertos compartidos de `Q4_K`/`IQ4_NL` a `Q5_K`, amplía la cobertura de expertos de borde en `Q3_K` de 5 a 10 capas y refuerza las capas de atención completa con `Q4_K` en `q/k/v` y `Q6_K` en `output`, con un sobrecoste declarado inferior a 180 MB respecto a V1. El objetivo declarado de estos cambios es la estabilidad en contextos largos y el rendimiento sostenido bajo streaming desde RAM del sistema.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso orientado a diálogo multi-turno.
- Razonamiento explícito: el tag `reasoning` y las referencias de la model card a fases `<think>` y a "profundidad de razonamiento" indican soporte de cadenas de razonamiento extendidas, presumiblemente en un modo de pensamiento diferenciado del modelo base.
- Generación y comprensión de código: la ficha menciona explícitamente la preservación de la sintaxis y de las llaves/indentación del código como criterio de calidad de la cuantización, lo que implica que el modelo base está entrenado para código.
- Contexto largo: ventanas declaradas de hasta 256K tokens, con ingeniería específica para mantener estabilidad en ventanas de +160K.
- Multilingüismo: 13 idiomas declarados (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la presencia de modo de razonamiento y contexto largo es compatible con flujos agénticos, pero no se documenta.
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente `text-generation`.
- Decodificación especulativa, atención lineal u otras optimizaciones: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento de contexto largo sobre documentación técnica: con ventanas de hasta 256K tokens, el modelo puede ingerir repositorios completos, expedientes o manuales extensos y responder preguntas que requieran correlacionar información distribuida a lo largo de decenas de miles de tokens, manteniendo la caché KV en VRAM y transmitiendo los pesos desde RAM.
- Asistente de código en estación de trabajo de 24 GB: la receta preserva específicamente la sintaxis y las llaves de código, por lo que es adecuado para generación y revisión de fragmentos donde un quant de 3 bits uniforme produciría código sintácticamente roto.
- Despliegue local en hardware de gama alta de consumo: con ~13,74 GiB de pesos y soporte de offload a RAM, puede ejecutarse en equipos con una GPU de 24 GB (RTX 3090/4090/5090, según la referencia del autor a las series RTX 30/40/50) reservando VRAM para la caché KV.
- Servicio de chat multilingüe: los 13 idiomas declarados permiten atender conversaciones en español, inglés, chino, japonés, árabe, etc., desde una única instancia, sin necesidad de enrutado a modelos distintos.
- Investigación sobre cuantización de MoE: el repositorio incluye un mapa tensorial auditado y un histórico de versiones (genérico, V1, V2.1) que lo convierten en un caso de estudio reproducible para medir el impacto de la precisión por tipo de tensor en la perplejidad.
- Evaluación comparativa de perplejidad en local: con una receta de evaluación declarada (WikiText-2, contexto 2048, 10 chunks) es posible replicar la medición y contrastar recetas de cuantización alternativas sobre el mismo modelo base.
- Procesamiento por lotes con memoria limitada: el modo de streaming desde RAM permite ejecutar inferencia cuando la VRAM disponible no alcanza para los pesos completos más la caché KV, aceptando el coste de ancho de banda de memoria del sistema.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 5,3735 ± 0,1214 | Evaluada directamente sobre el binario GGUF, contexto 2048, 10 chunks |
| Throughput (streaming con offload a RAM) | +24 a 28+ tok/s | Generación en streaming con offload a RAM del sistema; depende de la arquitectura del procesador y del ancho de banda de memoria (DDR4 dual-channel o DDR5 6000+ MT/s) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidades en la información disponible. Tampoco se proporcionan cifras de throughput con offload completo a VRAM (`-ngl 99`), más allá de la afirmación cualitativa de ejecución "extremadamente rápida" en tensor cores.

## Requisitos de hardware

- Peso de los pesos cuantizados: ~13,74 GiB (frente a ~13,56 GiB de la edición V1, es decir, menos de 180 MB de sobrecoste).
- VRAM para offload completo en GPU: una GPU de 24 GB permite ejecutar con `-ngl 99`, dejando margen para la caché KV en contextos moderados.
- Offload parcial o total a RAM del sistema: la edición V2.1 está diseñada específicamente para streaming desde RAM, liberando la VRAM para la caché KV de ventanas muy largas (hasta 256K tokens). El rendimiento depende del ancho de banda de memoria; el autor cita DDR4 dual-channel y DDR5 a 6000+ MT/s.
- GPU mencionadas por el autor: series RTX 30, RTX 40 y RTX 50 (la model card incluye una sección de benchmarks de throughput para estas familias, cuyo contenido no está disponible en el extracto proporcionado).
- Cabe en GPU de consumo: sí, en modelos de 24 GB de VRAM (RTX 3090, 4090, 5090). En GPUs de 8-16 GB solo cabría con offload parcial a RAM y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y los runners basados en él como Ollama, LM Studio o llama.cpp server. Compatibilidad con vLLM o TGI no está confirmada en la información disponible.
- Estimación de caché KV para ventanas de 256K tokens: no disponible.
- Latencia: no disponible en términos de TTFT. Throughput declarado de +24 a 28+ tok/s únicamente bajo streaming desde RAM con el hardware descrito.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Iris-mini APEX-I-MiniPlus V2.1 (este) | 35,5 B totales (activos no disponibles) | hasta 256K | Mixta ~3 bpw efectivos, ~13,74 GiB | apache-2.0 | Routers en F32, cabeza en Q6_K, compartidos en Q5_K |
| Iris-mini APEX-I-MiniPlus V1 | 35,5 B totales (activos no disponibles) | no disponible | Mixta ~3,06 bpw en núcleo, ~13,56 GiB | apache-2.0 | Expertos compartidos en Q4_K/IQ4_NL; expertos de borde en Q3_K (5 capas) |
| APEX-I-Mini genérico (comunidad) | 35,5 B totales (activos no disponibles) | no disponible | `IQ2_S` en núcleo, cabeza en Q3_K_M, atención en Q3_K, ~12,5 GB | apache-2.0 (según base) | Sin routers en F32; el autor reporta errores de sintaxis y alta perplejidad en `<think>` |
| AllSpark-Research/Iris-mini (base) | 35,5 B totales (activos no disponibles) | no disponible | FP16 sin cuantizar | apache-2.0 | Modelo de origen; calidad de referencia declarada por el autor |

No se dispone de datos de benchmarks de capacidades (MMLU, HumanEval, GSM8K) de ninguna de estas variantes, por lo que la comparación se limita a parámetros, contexto, esquema de cuantización y licencia. No se han identificado en la búsqueda web modelos comparables de otros autores con los que contrastar.

## Limitaciones y advertencias

- La información disponible corresponde íntegramente a la ficha de la cuantización; no hay datos sobre composición del dataset, sesgos conocidos, alineación ni evaluación de seguridad del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documenta ninguna mitigación específica en esta publicación.
- La model card está truncada en el extracto proporcionado (secciones de benchmarks de hardware e índice de navegación incompletos), por lo que parte de los datos técnicos declarados por el autor no han podido verificarse.
- Los idiomas soportados se declaran a nivel de metadatos (13 idiomas); no se aportan métricas de calidad por idioma, por lo que el rendimiento real en idiomas de bajos recursos como el tailandés o el vietnamita es incierto.
- Las cifras de perplejidad y throughput proceden del propio autor de la cuantización y no han sido replicadas de forma independiente en la información disponible.
- La afirmación de contexto de 256K tokens requiere verificación: la arquitectura base puede soportarlo, pero la memoria necesaria para la caché KV en ventanas extremas no se cuantifica y puede exceder la VRAM de una GPU de 24 GB.
- Rendimiento dependiente del ancho de banda de memoria: el modo de streaming desde RAM rinde muy distinto según la plataforma (DDR4 vs DDR5 de alta frecuencia); los 24-28+ tok/s son una cifra de referencia del autor, no una garantía.
- Licencia apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar que la licencia del modelo base AllSpark-Research/Iris-mini impone condiciones adicionales antes de desplegarlo en producción.
- Enrutamiento MoE: aunque los routers se conservan en F32, la compresión de los expertos a 3 bits puede degradar tareas concretas de forma desigual; se recomienda validar con un conjunto de evaluación propio antes de sustituir un modelo en producción.
- No hay confirmación de soporte de tool calling ni de plantilla de chat específica en la información proporcionada; es necesario revisar la configuración de llama.cpp o del runner elegido.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF
- Edición MiniPlus V1: https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF
- Modelo base: AllSpark-Research/Iris-mini (referenciado como `base_model` en los metadatos; URL directa no disponible en la información proporcionada)
- Paper, blog o repositorio adicionales: no se han encontrado enlaces relevantes en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.
