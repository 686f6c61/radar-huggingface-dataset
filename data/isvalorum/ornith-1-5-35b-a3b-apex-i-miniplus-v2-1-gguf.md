# IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Ornith-1.5-35B-A3B APEX-I-MiniPlus-V2.1 es una cuantización GGUF publicada por el usuario IsValorum sobre el modelo base `ornith-ai/Ornith-1.5-35B-A3B`, un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y nomenclatura "A3B", que indica aproximadamente 3.000 millones de parámetros activos por token. El modelo base está etiquetado como multimodal (texto e imagen), orientado a razonamiento, generación de código, uso agéntico y evaluaciones tipo SWE-bench, con una ventana de contexto de 256K tokens.

El valor de esta publicación no reside en los pesos originales, sino en la receta de cuantización: en lugar de aplicar una compresión uniforme, el autor define una asignación tensor por tensor que mantiene los routers (`gate_inp`) en `F32` sin comprimir, los *gates* de atención en `Q8_0`, la cabeza de salida en `Q6_K` y el experto compartido (`shexp`) en `Q5_K` en las 40 capas, mientras que los expertos enrutados se reparten entre `IQ3_XXS` (núcleo) y `Q3_K` (borde). El resultado declarado es un fichero de 15,23 GB (14,18 GiB) con una perplejidad medida en WikiText-2 de 7,6370 ± 0,21010, por debajo del tamaño de referencia `Q3_K_M` (16,7 GB) pero con fidelidad que el autor sitúa en el rango de `Q5_K`/`Q6_K`.

Es relevante ahora porque ataca un problema de despliegue muy concreto: ejecutar un MoE de 35B con contexto largo en estaciones de trabajo de 24 GB de VRAM o incluso con descarga parcial o total a memoria RAM del sistema, sin los bloqueos de descompresión en CPU que suelen degradar este tipo de cuantizaciones agresivas. Incluye además los tensores de Multi-Token Prediction (MTP) dentro del GGUF principal y un proyector multimodal `mmproj` en `Q8_0`, lo que permite decodificación especulativa y OCR en configuraciones híbridas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) disperso, 40 capas, 256 micro-expertos, bloque MTP integrado |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | No disponible de forma exacta; la nomenclatura A3B del nombre sugiere ~3B activos por token |
| Longitud de contexto | 262.144 tokens (256K), soportados de forma nativa según la model card |
| Tipos de cuantizacion | Expertos núcleo `IQ3_XXS`; expertos borde `Q3_K`; experto compartido `Q5_K`; atención completa `Q4_K` (q/k/v) + `Q6_K` (output); gates de atención `Q8_0`; cabeza de salida `Q6_K`; routers `F32`; proyector multimodal `mmproj` en `Q8_0` |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp y runtimes compatibles); repo de 15,8 GB, fichero principal de 15,23 GB (14,18 GiB) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Modalidades | Texto e imagen (multimodal, visión) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben considerarse no disponibles en esta ficha. Lo que sí se describe con detalle es la arquitectura de inferencia: un MoE de 40 capas con 256 micro-expertos, un experto compartido por capa (`shexp`) y un bloque MTP (*Multi-Token Prediction*) integrado, cuyos tensores se conservan en el GGUF principal para que los runtimes compatibles puedan emplearlos en decodificación especulativa. Los expertos se organizan por índices: los rangos 0–9 y 30–39 se tratan como expertos de borde y los rangos 10–29 como expertos núcleo, recibiendo tratamientos de cuantización distintos.

La innovación técnica es la receta de cuantización tensor por tensor. Frente a un cuantizado plano que comprime todos los expertos a `IQ2_S` y deja rutas sensibles en precisión insuficiente, esta build mantiene los routers en `F32` para evitar derivas de enrutamiento (*routing drift*), los gates de atención en `Q8_0`, la cabeza de salida en `Q6_K` y el experto compartido en `Q5_K` en las 40 capas. Los expertos de borde usan `Q3_K` lineal en lugar de códecs no lineales, lo que elimina los bloqueos de descompresión en CPU con AVX2 y permite el streaming eficiente desde memoria RAM del sistema. La perplejidad declarada sobre WikiText-2 es de 7,6370 ± 0,21010, medida directamente sobre el GGUF final.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat.
- Razonamiento de varios pasos y cadenas de pensamiento extensas (el modelo base se distribuye con etiquetas `reasoning` y modo `<think>`).
- Generación y comprensión de código, incluyendo tareas de nivel repositorio asociadas a SWE-bench.
- Flujos agénticos: la etiqueta `agentic` del modelo base indica soporte previsto para planificación y ejecución multi-paso. El soporte concreto de *tool calling* / *function calling* no se detalla en la información proporcionada.
- Capacidades multimodales de visión mediante el proyector `mmproj` en `Q8_0`, que el autor indica que puede cargarse en VRAM para tareas de OCR mientras los pesos principales se sirven desde RAM.
- Decodificación especulativa a través de los tensores MTP integrados en el GGUF (requiere runtime compatible).
- Contexto largo: hasta 256K tokens de forma nativa.
- Multilingüe: limitado a inglés según el campo `language` de la ficha del modelo.

## Casos de uso

- Asistencia de código en repositorios grandes: con 256K tokens de contexto y etiqueta SWE-bench, el modelo puede cargar varios ficheros fuente, tests y trazas de error en una sola ventana para localizar y proponer parches, evitando el troceado manual del repositorio.
- Revisión de *pull requests* en CI/CD: integrado como paso automatizado que analiza el diff completo junto con el contexto del módulo afectado y genera comentarios de revisión o sugerencias de refactorización.
- Agentes de automatización de tareas de desarrollo: la combinación de razonamiento multi-paso y decodificación especulativa vía MTP permite bucles de "pensar, actuar, observar" con latencia contenida en hardware de gama alta.
- Despliegue en estaciones de trabajo de 24 GB: con `-ngl 99` sobre una RTX 3090, 4090 o 5090 se puede mantener el modelo y el contexto completo en VRAM, lo que habilita usos de ofimática técnica y generación de documentación sin depender de la nube.
- Servidores de inferencia con descarga a RAM: gracias a la receta `Q3_K` optimizada para AVX2, el modelo puede transmitirse desde memoria DDR4/DDR5 con velocidades declaradas de 20 a 45 tok/s, útil para servir contexto largo cuando la VRAM es insuficiente para el modelo y el KV cache.
- Digitalización y OCR de documentos: el proyector multimodal `mmproj` en `Q8_0` puede residir en VRAM mientras el modelo principal se sirve desde RAM, permitiendo extraer texto de imágenes o PDFs escaneados y continuar con razonamiento sobre el contenido extraído.
- Análisis de documentos largos en local: contratos, informes técnicos o expedientes que caben en 256K tokens, procesados íntegramente en infraestructura propia sin enviar datos a terceros, algo relevante dado el licenciamiento MIT.
- Prototipado e investigación de cuantización: el histórico de versiones publicado por el autor permite comparar recetas de cuantización y medir su efecto sobre perplejidad y calidad de código en un MoE de 35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench) en la información disponible. El único dato cuantitativo aportado por el autor es la perplejidad sobre WikiText-2 del fichero GGUF final, junto con la comparación interna de su familia de cuantizaciones:

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 (GGUF final) | 7,6370 ± 0,21010 |
| Tamano del fichero | 15,23 GB (14,18 GiB) |
| Referencia de tamano Q3_K_M | 16,7 GB |
| Fidelidad declarada | Comparable a Q5_K / Q6_K |
| Throughput declarado en RAM del sistema | 20–45 tok/s segun CPU, ancho de banda y configuracion DDR4/DDR5 |

La model card menciona una "Independent Benchmark of the APEX-I-MiniPlus Family (Occamy V2 Reference)", pero sus resultados no están incluidos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM para descarga completa en GPU: 24 GB o más recomendados para `-ngl 99` con contexto de 256K nativo. GPUs citadas por el autor: RTX 3090, RTX 4090, RTX 5090.
- Descarga parcial: el modelo puede dividirse entre VRAM y RAM del sistema. La parte no ubicada en GPU (pesos y KV cache) se sirve desde DDR4 o DDR5, manteniendo generación estable con contextos de 160K a 256K tokens.
- Inferencia íntegra en RAM del sistema: viable según el autor, con rendimiento dependiente del procesador, el ancho de banda de memoria y la configuración (dual-channel DDR4 o DDR5 a 6000+ MT/s). El rango declarado es de 20 a 45 tok/s.
- Componentes auxiliares: el proyector multimodal `mmproj` en `Q8_0` ocupa poco espacio y puede alojarse en VRAM para OCR mientras los pesos principales se transmiten desde RAM. Los tensores MTP pueden habilitar decodificación especulativa si el runtime lo soporta.
- CPU: se recomienda soporte AVX2; la receta está diseñada explícitamente para eliminar bloqueos de descompresión en estas instrucciones.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF. vLLM, TGI, Ollama u otros backends no se mencionan en la información disponible; la compatibilidad con ellos no está confirmada.
- Estimación de VRAM para cuantizaciones alternativas: no disponible. El único punto de medida documentado es el fichero de 14,18 GiB.
- Contexto: el autor afirma que el contexto completo de 256K puede residir en VRAM en configuraciones de 24 GB, afirmación que conviene validar empíricamente, ya que el tamaño del KV cache depende del runtime y del tipo de atención empleado.

## Comparativa con modelos similares

La información disponible permite comparar esta build con la variante genérica de la misma familia descrita por el autor, y con el modelo base sin cuantizar. No se dispone de datos de terceros comparables.

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (esta build) | 35,5B totales, ~3B activos | 256K | Expertos nucleo `IQ3_XXS`, borde `Q3_K`, routers `F32`; 15,23 GB (14,18 GiB) | MIT | Perplejidad WikiText-2 de 7,6370; disenada para streaming desde RAM |
| APEX-I-Mini generico (comunidad) | Mismo modelo base | No disponible | Expertos `IQ2_S`, expertos borde `Q3_K` en solo 5 capas, cabeza de salida `Q3_K_M`, gates de atencion comprimidos; ~12,5 GB | No disponible | El autor reporta errores de sintaxis, indentacion de codigo rota y picos de perplejidad en el bloque `<think>` |
| Ornith-1.5-35B-A3B (base) | 35,5B totales | 256K | Pesos sin cuantizar (safetensors) | No disponible | Referencia de maxima fidelidad; el tamano en bf16 seria del orden de 71 GB segun calculo aritmetico, no confirmado en la informacion |

## Limitaciones y advertencias

- Idioma: la ficha declara únicamente inglés. El comportamiento en castellano u otros idiomas no está documentado y puede degradarse notablemente, especialmente tras una cuantización de 3 bits.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, y potencialmente amplificado por el esquema de cuantización agresiva en los expertos enrutados. La propia model card advierte de que cuantizaciones mal calibradas en modelos de razonamiento profundo producen errores de sintaxis y llaves de código desbalanceadas.
- Naturaleza del artefacto: se trata de una cuantización de terceros, no de un modelo entrenado por el autor. Los pesos originales, el dataset y el proceso de alineación no están documentados en la información disponible.
- Licencia: MIT según la ficha del repositorio, lo que en principio permite uso comercial. Sin embargo, la licencia del modelo base `ornith-ai/Ornith-1.5-35B-A3B` no se especifica en la información proporcionada; conviene verificarla antes de un despliegue comercial, ya que una licencia MIT en el derivado no exime de las condiciones del original.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, y creación y última actualización separadas por menos de 15 minutos. No hay validación independiente de la comunidad sobre esta build concreta.
- Afirmaciones no verificadas: el rendimiento de 20–45 tok/s en RAM y la viabilidad de 256K de contexto completo en 24 GB de VRAM son declaraciones del autor sin benchmark reproducible adjunto en la información disponible.
- Dependencia de hardware específico: parte del diseño (eliminación de bloqueos de descompresión) asume CPU con AVX2. En arquitecturas sin estas instrucciones el rendimiento puede caer de forma acusada.
- Contexto largo: aunque se anuncian 256K tokens, el consumo de KV cache y la degradación de la atención a distancias muy largas no están medidos en la documentación aportada.
- Soporte multimodal: depende de un runtime capaz de cargar el `mmproj`; no todos los backends GGUF lo soportan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Papers, blogs o repositorios adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces obtenidos correspondían a planes de estudio académicos sin relación con el tema.
