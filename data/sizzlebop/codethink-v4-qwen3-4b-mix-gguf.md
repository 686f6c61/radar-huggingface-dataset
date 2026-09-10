# sizzlebop/CodeThink-V4-Qwen3-4B-Mix-GGUF

## Resumen

CodeThink-V4-Qwen3-4B-Mix-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo modrill/CodeThink-V4-Qwen3-4B-Mix, publicado por el usuario sizzlebop. Se trata de un modelo de 4.411.424.256 parámetros (4,41B) derivado de Qwen/Qwen3-4B-Base, especializado en razonamiento sobre código mediante una receta de destilación mixta (Mix Distillation). El repositorio no aporta pesos nuevos: convierte los safetensors originales a GGUF con llama.cpp en precisión BF16 nativa y genera siete variantes de cuantización k-quant, desde Q2_K (1,67 GB) hasta BF16 (8,22 GB).

El interés práctico del modelo reside en que empaqueta un modelo de razonamiento de código en un único archivo que cabe en GPUs de consumo e incluso en CPU. Con 32.768 tokens de contexto, 32 cabezas de atención y 8 cabezas KV (GQA), se puede ejecutar con llama.cpp, llama-server, Ollama o LM Studio, y expone un endpoint compatible con la API de OpenAI. La licencia Apache-2.0 y el formato ChatML con bloques `<think>` explícitos facilitan su integración en pipelines de generación de código.

Ahora bien, conviene calibrar las expectativas: el ajuste se realizó únicamente sobre 4.155 problemas de programación competitiva y razonamiento de código, el modelo declara soporte solo para inglés y no se han publicado resultados de benchmarks en la información disponible. Su valor está en el despliegue local eficiente, no en competir con modelos frontera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (`Qwen3ForCausalLM`), transformer decoder-only con GQA |
| Parámetros totales | 4.411.424.256 (4,41B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen3 tiene cobertura multilingüe no declarada aquí |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors bfloat16 en el modelo original |
| Cabezas de atención | 32 cabezas de consulta, 8 cabezas KV, dimensión de cabeza 128 |
| Precisión base | bfloat16 |
| Formato de prompt | ChatML / Qwen con bloques `<think>` |
| Tamaño del repositorio | 27,1 GB |
| Modelo base | modrill/CodeThink-V4-Qwen3-4B-Mix (derivado de Qwen/Qwen3-4B-Base) |
| Pipeline | text-generation |

### Archivos GGUF disponibles

| Archivo | Cuantización | Tamaño | Uso recomendado según el autor |
|---|---|---|---|
| `...-BF16.gguf` | BF16 | 8,22 GB | Referencia de máxima fidelidad |
| `...-Q8_0.gguf` | Q8_0 | 4,37 GB | Cuantización de 8 bits casi sin pérdida; evaluación y alta precisión |
| `...-Q6_K.gguf` | Q6_K | 3,38 GB | Alta retención de calidad, buen equilibrio general |
| `...-Q5_K_M.gguf` | Q5_K_M | 2,94 GB | 5 bits equilibrado, buena calidad de código |
| `...-Q4_K_M.gguf` | Q4_K_M | 2,53 GB | Predeterminado recomendado para uso local diario |
| `...-Q3_K_M.gguf` | Q3_K_M | 2,09 GB | Huella compacta cuando la memoria es muy limitada |
| `...-Q2_K.gguf` | Q2_K | 1,67 GB | Compresión máxima para entornos muy restringidos |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Base, un transformer decoder-only con atención de consultas agrupadas (32 cabezas de consulta y 8 cabezas KV, dimensión 128). El modelo final se obtuvo mediante una receta de destilación mixta: el 20 % de las trazas de razonamiento provienen de Qwen3-30B-A3B-Thinking y el 80 % de Qwen3-4B-Thinking, distribuidas sobre 4.155 problemas de programación competitiva y razonamiento de código. El adaptador LoRA resultante se fusionó en los pesos completos en el punto de control de 2 épocas. La metodología sigue el trabajo de Li et al. (2025), «Small Models Struggle to Learn from Strong Reasoners», que motiva mezclar trazas de un razonador fuerte con las de un razonador de tamaño similar.

Este repositorio no vuelve a entrenar nada: parte de los safetensors del modelo fusionado y realiza la conversión a GGUF en llama.cpp a precisión BF16 nativa, seguida de la cuantización a las variantes k-quant listadas. El modelo conserva el modo de razonamiento explícito mediante bloques `<think>`, de forma que la salida puede separar el proceso de razonamiento de la respuesta final. No se documentan en la información disponible detalles sobre la composición lingüística del dataset, el uso de RLHF o DPO, ni innovaciones de decodificación especulativa.

## Capacidades

- Generación de código en múltiples lenguajes, con ejemplos explícitos en la model card para Python y Rust, y soporte de esquemas de prompt para C/C++ y otros lenguajes habituales.
- Razonamiento explícito de varios pasos mediante bloques `<think>` antes de la respuesta final.
- Resolución de problemas de programación competitiva y ejercicios algorítmicos (búsqueda binaria, quicksort, criba de primalidad, algoritmo de Dijkstra, etc.).
- Explicación de algoritmos y conceptos de informática en formato conversacional multi-turno.
- Integración con tool calling y function calling mediante el endpoint compatible con OpenAI que expone `llama-server`; la model card no documenta un formato de llamada a herramientas propio, por lo que la capacidad depende del cliente.
- Uso como componente de agentes multi-paso a través de la API HTTP de llama.cpp, encadenando peticiones de chat con mantenimiento de contexto.
- Capacidades multilingües: la model card declara únicamente inglés; no se documentan capacidades en otros idiomas para este ajuste.
- Capacidades especiales: modo de pensamiento (`<think>`), y la posibilidad de ejecución en CPU o GPU mixta vía el flag `-ngl` de llama.cpp. No se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistente de programación en local: con el archivo Q4_K_M (2,53 GB) se puede ejecutar un asistente de código interactivo en un portátil con GPU de gama media o incluso CPU, usando `llama-cli` o LM Studio sin enviar código a servicios externos.
- Integración en el IDE mediante endpoint HTTP: `llama-server` expone `/v1/chat/completions` en el puerto configurado, de modo que plugins de editor compatibles con la API de OpenAI pueden consumirlo directamente para autocompletado y refactorización.
- Generación de pruebas unitarias: el modelo puede recibir una función y producir casos de prueba, aprovechando el bloque `<think>` para razonar sobre los casos límite antes de escribir el test.
- Explicación didáctica de algoritmos: útil como tutor de estructuras de datos y algoritmos, ya que el ajuste se centró en problemas algorítmicos y el modo de pensamiento hace visible el razonamiento.
- Preparación de entrevistas técnicas y práctica de programación competitiva: el entrenamiento sobre 4.155 problemas de este tipo lo orienta a resolver enunciados y comentar la solución paso a paso.
- Migración y traducción de código entre lenguajes: peticiones del tipo «convierte esta función de Python a Rust» se benefician de la ventana de 32.768 tokens para incluir módulos completos en un solo turno.
- Prototipado en entornos sin GPU: la variante Q2_K (1,67 GB) o Q3_K_M (2,09 GB) permite desplegar un asistente de código en contenedores ligeros o máquinas virtuales con memoria muy limitada.
- Automatización de revisión de código en CI: al poder lanzarse como servidor local con contexto largo, se puede invocar desde un job de integración continua para señalar errores evidentes antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la etiqueta `livecodebench` y la descripción del dataset de entrenamiento (4.155 problemas de programación competitiva y razonamiento de código procedentes de Qwen3-30B-A3B-Thinking y Qwen3-4B-Thinking), pero no acompaña ninguna tabla con métricas numéricas de MMLU, HumanEval, GSM8K, LiveCodeBench ni de ninguna otra evaluación. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones propias a partir del tamaño de los pesos y del coste de la caché KV, no datos publicados por el autor. La caché KV en FP16 para los 32.768 tokens completos ronda los 4,8 GB (calculada sobre 36 capas, 8 cabezas KV y dimensión 128); puede reducirse aproximadamente a la mitad con caché en Q8_0 y a un cuarto con Q4.

| Cuantización | Pesos | VRAM estimada (contexto corto) | VRAM estimada (32K, KV FP16) |
|---|---|---|---|
| BF16 | 8,22 GB | ~10 GB | ~15 GB |
| Q8_0 | 4,37 GB | ~6 GB | ~11 GB |
| Q6_K | 3,38 GB | ~5 GB | ~10 GB |
| Q5_K_M | 2,94 GB | ~4,5 GB | ~9 GB |
| Q4_K_M | 2,53 GB | ~4 GB | ~8,5 GB |
| Q3_K_M | 2,09 GB | ~3,5 GB | ~8 GB |
| Q2_K | 1,67 GB | ~3 GB | ~7,5 GB |

- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM sirve para las cuantizaciones de 4 bits con contexto moderado. Una RTX 4090, RTX 4080 o RTX 3090 ejecutan Q4_K_M y Q5_K_M con contexto amplio sin dificultad. Para contexto completo de 32K con cuantizaciones altas (BF16, Q8_0) conviene una A100, H100 o L40S, o bien reducir la precisión de la caché KV.
- GPU de consumo: sí cabe. Con Q4_K_M (2,53 GB) es viable en GPUs de 6-8 GB como RTX 3060, RTX 4060, RTX 2070 o superiores, e incluso en iGPU con memoria unificada si se descargan capas a CPU.
- CPU: las variantes Q4_K_M y Q2_K están pensadas explícitamente para entornos con memoria restringida; la inferencia en CPU es viable aunque con latencia notablemente mayor.
- Opciones de despliegue documentadas por el autor: `llama-cli` (interactivo), `llama-server` (endpoint HTTP compatible con OpenAI, con `-c 32768 -ngl 99`), Ollama mediante un `Modelfile` personalizado con plantilla ChatML y LM Studio copiando el `.gguf` a la carpeta de modelos. Para vLLM o TGI habría que recurrir al checkpoint original en safetensors, ya que este repositorio solo contiene GGUF.
- Parámetros de muestreo sugeridos por el autor: `temperature 0.6` y `top_p 0.95`, con tokens de parada `<|im_end|>` y `<|endoftext|>`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CodeThink-V4-Qwen3-4B-Mix-GGUF (este) | 4,41B | 32.768 tokens | Apache-2.0 | GGUF (7 cuantizaciones) | Ajuste de código y razonamiento sobre 4.155 problemas; solo inglés declarado; sin benchmarks publicados |
| Qwen/Qwen3-4B-Base | 4,41B | 32.768 tokens (según la información disponible para esta familia) | Apache-2.0 | safetensors | Modelo base sin ajuste de razonamiento de código; requiere adaptación propia |
| modrill/CodeThink-V4-Qwen3-4B-Mix | 4,41B | 32.768 tokens | Apache-2.0 | safetensors (bfloat16) | Checkpoint original en precisión completa; necesita conversión para uso en llama.cpp |
| Qwen3-4B-Thinking | 4,41B | no disponible en la información proporcionada | Apache-2.0 | safetensors | Uno de los dos profesores de la destilación; no es una cuantización GGUF |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Sesgo de dominio: el ajuste se realizó exclusivamente sobre 4.155 problemas de programación competitiva y razonamiento de código, por lo que el modelo puede rendir peor en tareas generales de texto, conocimiento enciclopédico o conversación abierta que el Qwen3-4B-Base subyacente.
- Riesgo de alucinación: es un modelo de 4B parámetros; puede inventar APIs, firmas de funciones o referencias a bibliotecas inexistentes. Sin benchmarks publicados no hay una medida objetiva de su tasa de error, así que el código generado debe revisarse y ejecutarse antes de usarlo en producción.
- Idiomas: la model card declara únicamente inglés. Aunque el modelo base Qwen3 tiene cobertura multilingüe, este ajuste no garantiza un rendimiento correcto en castellano, y no se documentan evaluaciones en otros idiomas.
- Calidad según cuantización: por debajo de Q5_K_M la degradación puede ser perceptible en tareas de razonamiento largo. Las variantes Q3_K_M y Q2_K están descritas por el propio autor como soluciones de compromiso para entornos muy restringidos.
- Modo de pensamiento: los bloques `<think>` incrementan el consumo de tokens de salida y la latencia. En producción conviene limitar `-n` o aplicar un presupuesto de tokens de razonamiento, y tener en cuenta que el texto dentro de `<think>` no debería mostrarse al usuario final.
- Caché KV: usar el contexto completo de 32.768 tokens con caché en FP16 añade del orden de 4,8 GB de VRAM, lo que puede desbordar GPUs de consumo medio si no se reduce la precisión de la caché.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. Al derivar de Qwen3, conviene revisar también las condiciones del repositorio base original.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no incluye informes de evaluación, lo que dificulta validar la calidad de las cuantizaciones más allá de la descripción del autor.
- Repositorio pesado: 27,1 GB en total; descargar solo el archivo de cuantización necesario en lugar del repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sizzlebop/CodeThink-V4-Qwen3-4B-Mix-GGUF
- Checkpoint original: https://huggingface.co/modrill/CodeThink-V4-Qwen3-4B-Mix
- Arquitectura base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Artículo de metodología (Mix Distillation): Li et al., 2025, «Small Models Struggle to Learn from Strong Reasoners», https://arxiv.org/abs/2502.12143
- llama.cpp (herramienta usada para la conversión y la cuantización): no se proporciona un enlace específico en la información disponible; el proyecto está en GitHub bajo ggerganov/llama.cpp.
- Resultados de búsqueda web: las consultas realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos eran páginas de traducción sin relación con el tema.
