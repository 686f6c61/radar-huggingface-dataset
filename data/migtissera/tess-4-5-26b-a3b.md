# migtissera/Tess-4.5-26B-A3B

## Resumen
Tess-4.5-26B-A3B es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) con arquitectura de bucle (looped transformer), desarrollado por Continuity Research (publicado por el usuario migtissera en Hugging Face) como un fine-tune del modelo base thinkingmachines/Inkling-2-Mini. Con 26.388 millones de parámetros totales y solo 3.4B activos por token, está diseñado específicamente para tareas de codificación agéntica, razonamiento multi-paso y uso de herramientas, manteniendo una ventana de contexto de 1.048.576 tokens.

El modelo resuelve el problema de desplegar capacidades de nivel frontera en hardware de consumo: un checkpoint de 20 GB que cabe en una sola GPU de 24-32 GB (RTX 4090, RTX 5090, RTX PRO 6000, H100/H200) o en un Mac con 32 GB de memoria unificada mediante su versión GGUF de 17.6 GB. Su relevancia radica en que iguala o supera a modelos densos de mayor tamaño activo en benchmarks de ingeniería de software (SWE-Bench Pro v2 Hard: 82.4%) y de contexto largo (LongBench v2 a 1M: 67.2%), con licencia Apache 2.0.

La arquitectura combina un MoE con capas repetidas: de sus 24 capas, las 12 centrales se ejecutan tres veces por token (48 visitas de capa), enrutando a 8 de 128 expertos. Incorpora además un especulador DSpark para decodificación acelerada y está entrenado sobre sesiones reales de ingeniería, lo que le permite mantener el razonamiento a través de múltiples turnos de un bucle agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped MoE), 24 capas con las 12 centrales repetidas 3 veces por token (48 visitas de capa) |
| Parametros totales | 26.388.646.440 (26.4B) |
| Parametros activos | 3.4B únicos por token (5.4B efectivos a través de 3 pasadas de bucle); enruta a 8 de 128 expertos |
| Longitud de contexto | 1.048.576 tokens (1M), verificado en LongBench v2 |
| Tipos de cuantizacion | NVFP4, MXFP8 (checkpoint merged); GGUF nativo NVFP4 de 17.6 GB; formato de 8 bits (modelopt) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint merged NVFP4/MXFP8); GGUF disponible en repo separado |

## Arquitectura y entrenamiento
El modelo es un fine-tune del base thinkingmachines/Inkling-2-Mini, sobre el que se aplica la receta completa de Tess-4.5 (la misma empleada en Tess-4.5-594B-A17B), consistente en post-entrenamiento sobre sesiones reales de ingeniería. La arquitectura es un MoE con bucle: de las 24 capas, las 12 centrales se ejecutan tres veces por token, lo que da 48 visitas de capa y 5.4B parámetros efectivos por token pese a tener solo 3.4B únicos activos. El enrutamiento selecciona 8 de 128 expertos por token.

El entrenamiento incluye SFT con atención y unembedding a 64K, lo que según el autor preserva la capacidad de recuperación a 1M tokens del modelo base. Se reporta una reducción de la log-verosimilitud negativa (NLL) en 57 sesiones de ingeniería retenidas (897K tokens de asistente, renderizadas con el renderer de entrenamiento a esfuerzo 0.9): de 0.792 (base) a 0.738 (Tess) ponderada por token (0.874 → 0.808 en evaluación de entrenamiento). El modelo incluye un especulador DSpark para decodificación especulativa y mantiene el mismo layout de checkpoint y recetas de serving que Inkling 2 Mini, lo que lo hace un reemplazo directo.

## Capacidades
- Generación de texto conversacional y razonamiento multi-paso con modo de "thinking" (reasoning effort configurable, p. ej. `xhigh`, `high`).
- Codificación agéntica: resolución de tareas de ingeniería de software en entornos sandbox, incluyendo parcheo de bugs y tareas de CLI multi-turno.
- Uso de herramientas (tool calling / function calling) sobre un registro de hasta 54 herramientas, con decisión de cuándo llamar y cuándo responder en texto plano.
- Comportamiento agéntico: lee el directorio de trabajo y las herramientas disponibles, razona antes de actuar y mantiene el razonamiento a través de los turnos del bucle.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`).
- Comprensión de contexto largo hasta 1M tokens con precisión estable en documentos cortos, medios y largos.
- Extracción de datos estructurados, seguimiento de instrucciones, salida estructurada y razonamiento matemático (packs `structoutput`, `dataextract`, `instructfollow`, `reasonmath`).
- Capacidad de búsqueda de bugs en sandbox (pack `bugfind`).
- Soporte multilingüe limitado al inglés.

## Casos de uso
- Resolución automática de incidencias de software: el modelo puede recibir un repositorio y un bug report, explorar el directorio de trabajo con sus herramientas y generar un parche, aprovechando su 82.4% en SWE-Bench Pro v2 Hard y su capacidad de razonamiento sostenido a lo largo del bucle agéntico.
- Asistente de CLI multi-turno: integrado en terminales o pipelines de CI/CD, gestiona secuencias de comandos con contexto de hasta 1M tokens, útil para tareas de refactorización o diagnóstico que requieren leer muchos ficheros.
- Agente de atención al cliente con herramientas: con tool calling sobre un registro amplio, puede consultar APIs, bases de datos o sistemas de ticketing y decidir cuándo responder en texto plano (11/12 en la prueba de saludo sin llamadas espurias).
- Análisis de documentación técnica extensa: gracias a su ventana de 1M tokens y a la precisión mantenida en LongBench v2, permite hacer preguntas sobre manuales, especificaciones o códigos legales largos sin trocear.
- Extracción de datos estructurados de documentos e imágenes: el pipeline image-text-to-text y el pack `dataextract` lo hacen adecuado para convertir facturas, formularios o capturas en JSON u otros formatos.
- Automatización de tareas de ingeniería en local: al caber en una RTX 4090 (24 GB) o un Mac de 32 GB con el GGUF de 17.6 GB, permite desplegar un agente de código en estaciones de trabajo sin depender de la nube.
- Búsqueda y diagnóstico de bugs en sandbox: el pack `bugfind-15` con 15/15 aciertos sugiere su uso para localizar defectos en fragmentos de código de forma aislada y reproducible.

## Benchmarks y rendimiento

| Benchmark | Tess-4.5-26B-A3B | Inkling 2 Mini (base) |
|---|---|---|
| SWE-Bench Pro v2 Hard (51 tareas) | 82.4% (42/51) | 77.9% |
| LongBench v2 a 1M (503 preguntas) | 67.2% (338/503) | 66.9% |
| LongBench v2 — documentos cortos | 71.1% | no disponible |
| LongBench v2 — documentos medios | 63.3% | no disponible |
| LongBench v2 — documentos largos | 68.5% | no disponible |

| BenchLocal (150 escenarios, `xhigh`) | Pass@1 | Pass@3 |
|---|---|---|
| Core 5 packs (`toolcall`, `instructfollow`, `structoutput`, `dataextract`, `reasonmath`) | 71/75 (94.7%) | 71/75 (94.7%) |
| `bugfind-15` (sandbox) | 15/15 (100.0%) | 15/15 (100.0%) |
| `cli-40` (sandbox; multi-turno `CLI-21..40`: 16/20 @1) | 25/40 (62.5%) | 30/40 (75.0%) |
| `hermesagent-20` (sandbox) | 11/20 (55.0%) | 16/20 (80.0%) |
| Total (8 packs, 150 escenarios) | 122/150 (81.3%) | 132/150 (88.0%) |

| Sonda de comportamiento (54 herramientas, `high`, n=12) | Tess-4.5-26B-A3B | Inkling 2 Mini |
|---|---|---|
| Saludo ("Hey there!") — respuesta en texto plano | 11/12 (1 llamada a herramienta) | 8/12 (4 `Bash` espurias) |
| Pregunta conceptual sin herramientas — texto plano | 12/12 | no disponible |
| Tarea de código — llamada a herramienta | 12/12 | no disponible |
| Fugas de think-tag en texto visible | 0 | 0 |

Para comparación, el denso Tess-4.5-27B obtuvo 128/150 Pass@1 y 133/150 Pass@3 (67/75 en Core 5), por lo que Tess-4.5-26B-A3B queda a 1 escenario en Pass@3 y le supera en +4 en Core 5 con ~5× menos parámetros activos.

## Requisitos de hardware
- VRAM estimada: 20.2 GB para el checkpoint merged NVFP4/MXFP8; 17.6 GB para el GGUF nativo NVFP4.
- GPU recomendadas: RTX 5090, RTX PRO 6000, DGX Spark, H100/H200 y Blackwell para el checkpoint completo en una sola GPU.
- Consumer GPU: cabe en una RTX 4090 de 24 GB (hasta 256K de contexto con el GGUF) y en Apple Silicon con 32 GB o más de memoria unificada.
- Opciones de despliegue: vLLM y SGLang para el checkpoint merged; llama.cpp para el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; se menciona un especulador DSpark para decodificación más rápida, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-Bench Pro v2 Hard | LongBench v2 (1M) | Licencia |
|---|---|---|---|---|---|---|
| Tess-4.5-26B-A3B | 26.4B | 3.4B (5.4B efectivos) | 1M | 82.4% | 67.2% | Apache 2.0 |
| Inkling 2 Mini (base) | no disponible | no disponible | 1M | 77.9% | 66.9% | no disponible |
| Tess-4.5-27B (denso) | 27B | 27B | no disponible | no disponible | no disponible | Apache 2.0 |
| Tess-4.5-594B-A17B | 594B | 17B | no disponible | no disponible | no disponible | Apache 2.0 |

En BenchLocal, Tess-4.5-27B logra 128/150 Pass@1 y 133/150 Pass@3 frente a 122/150 y 132/150 del modelo analizado, con un rendimiento comparable pese a la diferencia de parámetros activos.

## Limitaciones y advertencias
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Riesgo de alucinación: no se documentan tasas específicas; como todo modelo generativo, puede producir parches o llamadas a herramientas incorrectas, especialmente en tareas de CLI multi-turno (62.5% Pass@1 en `cli-40`).
- Comportamiento agéntico imperfecto: en `hermesagent-20` obtiene 11/20 Pass@1 y en `cli-40` 25/40 Pass@1, lo que indica margen de mejora en flujos agénticos complejos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (Inkling-2-Mini) debe verificarse por si impone condiciones adicionales.
- El checkpoint requiere formatos NVFP4/MXFP8 o GGUF; no se documentan cuantizaciones de menor precisión (p. ej. Q4_K_M) más allá del GGUF nativo.
- Las cifras de benchmarks son las publicadas por el autor; no se dispone de verificación independiente en la información proporcionada.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la ficha, lo que sugiere adopción temprana y poca validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/migtissera/Tess-4.5-26B-A3B
- GGUF: https://huggingface.co/migtissera/Tess-4.5-26B-A3B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Tess-4.5-594B-A17B: https://huggingface.co/migtissera/Tess-4.5-594B-A17B
- Tess-4.5-27B: https://huggingface.co/migtissera/Tess-4.5-27B
- Página de Continuity Research: https://continuityresearch.ai/tess-4-5/
- Perfil del autor en X: https://x.com/migtissera
- Vídeo de lanzamiento: https://huggingface.co/migtissera/Tess-4.5-26B-A3B/resolve/main/assets/tess-4.5-26b-a3b-launch-web.mp4
