# mohommed/Lucet-Coder-4B-Omega-GGUF

## Resumen

Lucet-Coder-4B-Omega-GGUF es una distribución en formato GGUF del modelo Lucet-Coder-4B-Omega, un ajuste fino (post-entrenamiento) del modelo base XHToken/Spark-X2.6-4B, publicado por el usuario mohommed en Hugging Face. El modelo base declara una ventana de contexto nativa de 1.048.576 tokens (1M) y el autor reporta cifras de partida de 54,3% en SWE Pro y 71,8% en BFCL-V4 para el modelo original. El ajuste se orienta a generación de código, razonamiento multi-paso y uso de herramientas, con un énfasis explícito en eliminar comportamientos de rechazo ("uncensored").

La propuesta técnica del autor combina cuatro intervenciones: una adaptación de bajo rango (r=16) que congela q_proj y k_proj para preservar la calibración de fase RoPE de 1M tokens y solo adapta v_proj, out_proj y las matrices MLP en la mitad superior de la red; una minería activa de datos basada en clústeres de fallo con contrafactuales AST; una descomposición QR-SVD con umbral de Gavish-Donoho para eliminar ruido espectral de los adaptadores antes de fusionarlos; y una cuantización GGUF Q4_K con ecualización de crest factor y calibración con llama-imatrix.

El modelo tiene 4.112.079.360 parámetros (aproximadamente 4,1B) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El repositorio ocupa 18,8 GB, coherente con la publicación de múltiples variantes de cuantización GGUF. Es relevante para desarrolladores que buscan un modelo de código de tamaño medio con contexto muy largo y despliegue en hardware de consumo, aunque la documentación disponible es escasa y las cifras de mejora proceden exclusivamente de la model card del autor, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de XHToken/Spark-X2.6-4B); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 1.048.576 tokens (1M, contexto nativo declarado del modelo base) |
| Tipos de cuantizacion | GGUF Q4_K (32 bloques, ecualización de crest factor); otras variantes no detalladas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Spark-X2.6-4B, del que no se detallan en la información disponible el número de capas, dimensión oculta ni configuración de atención. El post-entrenamiento aplica LoRA con rango 16 sobre un subconjunto de matrices: congela por completo q_proj y k_proj en todas las capas para no alterar la calibración de fase RoPE asociada a la ventana de 1M tokens, y adapta únicamente v_proj, out_proj y las proyecciones MLP (gate_proj, up_proj, down_proj, g_proj) en el 50% superior de la red. Antes de fusionar los adaptadores en los pesos base, aplica una descomposición QR-SVD con umbral de Gavish-Donoho para descartar valores singulares asociados a ruido de gradiente estocástico, con coste O(r²(d_out + d_in)).

El entrenamiento se apoya en una estrategia de minería activa de datos: se diagnostican modos de fallo (FAIL_TRUNCATED_THINK, FAIL_ASSERTION_BOUNDARY, FAIL_MISSING_IMPORT, FAIL_EPISTEMIC_HALLUCINATION) agrupados por clústeres algorítmicos, y se incorporan dinámicamente tareas vecinas no vistas junto con bugs contrafactuales generados sobre el AST, extraídos de un pool de reserva disjunto, sin repetición de datos de entrenamiento. La cuantización final emplea Q4_K con ecualización de crest factor en superbloques de 32 elementos (≤3,8 rms), proyección de rechazo mediante ortogonalización de Gram-Schmidt y calibración con llama-imatrix. No se especifican el volumen total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y código en formato conversacional (pipeline text-generation, tag conversational).
- Razonamiento multi-paso con modo de pensamiento explícito (el autor referencia fallos de tipo FAIL_TRUNCATED_THINK, lo que implica una fase de thinking).
- Uso de herramientas y function calling: el modelo base declara 71,8% en BFCL-V4.
- Resolución de tareas de ingeniería de software: el modelo base declara 54,3% en SWE Pro.
- Contexto muy largo: ventana nativa de 1.048.576 tokens, útil para repositorios completos o documentos extensos.
- Comportamiento "uncensored": el autor indica proyección de rechazo eliminada, orientado a reducir negativas a responder.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Reparación de bugs en repositorios grandes: con 1M tokens de contexto, el modelo puede ingerir múltiples ficheros y el historial de issues de un proyecto para localizar el origen de un fallo, aprovechando además el entrenamiento con contrafactuales AST orientado a errores de importación y límites de aserción.
- Generación de código en pipelines de CI/CD: el soporte de function calling permite integrarlo como agente que consulta el estado de tests, lee logs y propone parches, con la ventaja de que el ajuste busca reducir tokens por tarea resuelta (el autor reporta 376 frente a 470 en el modelo base).
- Asistente de refactorización a nivel de monorepo: la ventana de 1M tokens permite analizar dependencias cruzadas entre paquetes sin trocear el contexto, algo que modelos de 32K-128K no pueden hacer en una sola pasada.
- Agente autónomo de resolución de tareas (SWE-bench style): combinación de razonamiento multi-paso, tool calling y contexto largo para iterar sobre un entorno de ejecución hasta que los tests pasan.
- Generación de tests unitarios y casos límite: el entrenamiento con contrafactuales AST y fallos de aserción encaja con la tarea de producir tests que cubran condiciones de frontera.
- Despliegue local en estaciones de trabajo: al ser un modelo de 4,1B en GGUF Q4_K, puede ejecutarse con llama.cpp u Ollama en GPUs de consumo, útil para equipos que no pueden enviar código a APIs externas por motivos de confidencialidad.
- Extracción y transformación de documentación técnica extensa: el contexto de 1M tokens permite resumir o reestructurar manuales y especificaciones completas en una sola llamada.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y comparan el modelo ajustado con el base. No hay verificación independiente.

| Benchmark / métrica | Spark-X2.6-4B (base) | Lucet-Omega | Mejora |
|---|---|---|---|
| MBPP sanitizado held-out, pass@1 (n=50) | 58,0% | 72,0% | +14,0% |
| Tokens medios de razonamiento + código por tarea resuelta | 470 | 376 | +20,1% más rápido |
| Tasa anti-alucinación epistémica held-out (n=8) | 0,0% | 12,5% | +12,5% |
| SWE Pro (modelo base, declarado) | 54,3% | No disponible | — |
| BFCL-V4 (modelo base, declarado) | 71,8% | No disponible | — |

Advertencia: el tamaño de muestra de MBPP es n=50 y el de la prueba anti-alucinación es n=8, ambos demasiado pequeños para extraer conclusiones robustas.

## Requisitos de hardware

- VRAM estimada en Q4_K para 4,1B parámetros: aproximadamente 2,5-3 GB de pesos, más overhead de contexto; con ventanas largas la caché KV domina el consumo.
- Contexto largo: la ventana de 1M tokens implica un coste de caché KV muy elevado; en la práctica conviene limitar el contexto efectivo o usar atención con ventana deslizante/quantized KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para uso local; A100/H100 para servir con contexto completo y concurrencia.
- Cabe en GPU de consumo: sí, en Q4_K y con contexto moderado, en tarjetas de 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (el tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI); vLLM y TGI requerirían conversión desde GGUF a safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lucet-Coder-4B-Omega | 4,1B | 1.048.576 | Apache 2.0 | GGUF | Ajuste de código "uncensored"; métricas solo del autor |
| Qwen2.5-Coder-3B | 3,1B | 32.768 (128K en variantes) | Apache 2.0 | safetensors, GGUF | Referencia consolidada en código de tamaño pequeño; benchmarks públicos |
| Qwen2.5-Coder-7B | 7,6B | 32.768 (128K en variantes) | Apache 2.0 | safetensors, GGUF | Mayor capacidad, requiere más VRAM |
| DeepSeek-Coder-V2-Lite | 15,7B (2,4B activos) | 163.840 | DeepSeek License | safetensors, GGUF | MoE; contexto largo pero licencia con restricciones |

La comparación directa es difícil porque no hay benchmarks públicos de Lucet-Coder-4B-Omega más allá de la model card. Frente a Qwen2.5-Coder, la ventaja declarada es el contexto de 1M tokens y el ajuste anti-rechazo; la desventaja es la ausencia de evaluación independiente y la documentación limitada.

## Limitaciones y advertencias

- Todos los benchmarks proceden del autor del modelo; no hay evaluación independiente ni reproducibilidad verificada.
- Tamaños de muestra muy pequeños (n=50 en MBPP, n=8 en anti-alucinación), lo que hace que las mejoras reportadas tengan alta varianza.
- El etiquetado "uncensored" implica que el modelo puede generar contenido que otros modelos rechazarían; requiere filtrado y moderación propios en producción.
- Idiomas soportados no documentados; el rendimiento en castellano es desconocido.
- La ventana de 1M tokens es la del modelo base; no se documenta si el ajuste la preserva íntegramente ni qué degradación sufre en la práctica.
- La model card incluye terminología matemática muy específica (QR-SVD, Gavish-Donoho, crest factor) sin código ni artefactos de verificación publicados, lo que dificulta auditar las afirmaciones.
- El repositorio tiene 55 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Spark-X2.6-4B conviene verificar la licencia y condiciones del modelo base.
- Riesgo de alucinación en código: el propio autor reporta solo un 12,5% de tasa anti-alucinación epistémica, es decir, el modelo sigue alucinando en la mayoría de los casos de esa prueba.
- No hay información sobre sesgos, datos de entrenamiento ni composición del dataset, lo que limita la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohommed/Lucet-Coder-4B-Omega-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
