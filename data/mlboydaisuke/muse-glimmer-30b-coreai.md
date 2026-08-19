# mlboydaisuke/Muse-Glimmer-30B-CoreAI

## Resumen

Muse-Glimmer-30B-CoreAI es una conversión del modelo agéntico abierto Muse-Glimmer-30B de Meta Superintelligence Labs al formato Apple Core AI (`.aimodel`), el sucesor de Core ML presentado en WWDC26. Esta versión concreta, publicada por mlboydaisuke, contiene únicamente el decodificador de texto del VLM original de 30B, sin el encoder de percepción, y está optimizada para ejecutarse en macOS 27 con Apple Silicon. El modelo base, Muse-Glimmer-30B, es un modelo causal de lenguaje denso multimodal de aproximadamente 29,6B parámetros, destilado de Muse Spark y diseñado para tareas agénticas autónomas en hardware de consumo, con licencia Apache-2.0.

La conversión destaca por superar en rendimiento de decodificación a la compilación oficial de Meta para GPU de Apple (ExecuTorch): 26,69 tokens/s frente a 23,7 tokens/s, con un 8,7% menos de bytes (16,35 GB frente a 17,9 GB). El bundle emplea cuantización `int4hu` con bloque de 32 y simetría, y está exportado para un contexto de 8192 tokens, aunque el modelo original soporta 131072. Es una pieza pensada para desarrolladores que quieran ejecutar un modelo agéntico de 30B localmente en Mac, con tool calling y razonamiento multi-paso, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (32 q / 2 kv heads, head_dim 128), 52 capas, hidden 6656, SwiGLU intermediate 19968, vocab 202048 con lm_head sin atar |
| Parametros totales | 27,855 B (solo torre de texto); ~29,6 B (modelo completo con encoder) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131072 (original); 8192 (exportación de este bundle) |
| Tipos de cuantizacion | int4hu (block32 sym) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), incluye config.json y tokenizer |

## Arquitectura y entrenamiento

El modelo original Muse-Glimmer-30B es un VLM multimodal con un encoder de percepción dedicado y un decodificador de texto de 27,855B parámetros. La arquitectura del decodificador sigue una forma similar a Gemma-3, pero con cuatro diferencias clave: (1) un patrón de capas `sliding(2048) × 3 + full × 1` donde las capas full son NoPE (sin posición rotatoria, marcadas por `layer_rope_theta[i] == 0`); (2) una puerta de salida sigmoide en cada capa de atención que lee los mismos estados ocultos pre-atención que Q/K/V, permitiendo fusionar las cuatro proyecciones en una sola (`qkvg_proj`); (3) RMSNorm sin pesos en Q/K y en la salida del embedding; (4) dos épsilons en las normas sándwich (1e-5 pre, 1e-8 post) y logits pre-escalados por `output_multiplier` antes de un tanh softcap a 20. El factor `qk_scale_factor` (3,87) se pliega en la escala de SDPA en lugar de aplicarse a Q, lo que es algebraicamente idéntico y ahorra una multiplicación de ancho completo por capa.

El entrenamiento del modelo original se basa en destilación desde Muse Spark y ajuste específico para tareas agénticas: uso de herramientas, ejecución de tareas largas y recuperación de fallos. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible. Esta conversión a Core AI no modifica los pesos; solo reautoriza el grafo para el motor `coreai-pipelined` de Apple, plegando operaciones y aplicando cuantización int4.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte nativo para tool calling (Onyx) y parsers de razonamiento según la documentación de NVIDIA NIM.
- Ejecución de tareas agénticas autónomas: planificación, ejecución de acciones y recuperación de errores, optimizado para flujos de trabajo "always-on" en hardware local.
- Multimodal en el modelo original (texto e imágenes), aunque esta conversión solo incluye el decodificador de texto, por lo que no procesa entradas visuales.
- Ventana de contexto larga (131072 tokens en el modelo original), aunque el bundle exportado limita a 8192 tokens.
- Decodificación eficiente en Apple Silicon: 26,69 tokens/s de generación y 269,0 tokens/s de prefill en un MacBook Pro M4 Max, con degradación mínima al aumentar el contexto (27,46 tok/s a 128 tokens de prompt frente a 26,73 a 2048).
- Compatible con el ecosistema Core AI de Apple: `llm-runner` y `llm-benchmark` con el motor `coreai-pipelined`.

## Casos de uso

- Asistente local de productividad en macOS: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 8192 tokens en este bundle) y ejecutar acciones como enviar correos, crear recordatorios o buscar información, gracias a su soporte de tool calling y su diseño agéntico.
- Automatización de tareas de desarrollo: integrado en flujos de trabajo de CI/CD, puede generar código, revisar parches y ejecutar comandos de terminal de forma autónoma, con recuperación de fallos ante errores de compilación o pruebas.
- Agente de atención al cliente local: desplegado en un Mac de sobremesa, puede mantener conversaciones con clientes, consultar bases de conocimiento y escalar a un humano cuando sea necesario, sin enviar datos a la nube.
- Asistente de investigación y redacción: con su capacidad de razonamiento y generación de texto, puede resumir documentos largos, extraer conclusiones y redactar informes técnicos, aprovechando su ventana de contexto amplia.
- Herramienta de análisis de datos: puede interpretar resultados de consultas SQL, generar visualizaciones descriptivas y explicar hallazgos a partir de datos tabulares, usando tool calling para interactuar con APIs de análisis.
- Prototipado de agentes autónomos: desarrolladores pueden usar este bundle para experimentar con arquitecturas agénticas en local, probando planificación multi-paso y ejecución de herramientas sin coste de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card del autor incluye mediciones de rendimiento de inferencia comparadas con la compilación oficial de Meta para Apple GPU:

| Métrica | Muse-Glimmer-30B-CoreAI (int4hu) | ExecuTorch de Meta (k-quant-17G-128K-text-solo-metal) |
|---|---|---|
| Tamaño de pesos | 16,35 GB | 17,9 GB |
| Decodificación (tok/s) | 26,69 | 23,7 |
| Prefill (tok/s) | 269,0 | No publicado |
| Contexto exportado | 8192 | 131072 |

Las mediciones se realizaron en un MacBook Pro M4 Max (GPU de 40 núcleos, 128 GB, macOS 27.0) con 512 tokens de prompt, 1024 de generación y 3 pruebas. La cifra de Meta es la publicada por ellos, no una re-medición. El autor señala que la decodificación apenas varía con el contexto (27,46 tok/s a 128 tokens de prompt, 26,73 a 2048), consistente con 39 de 52 capas limitadas a una ventana de 2048 tokens.

## Requisitos de hardware

- Mac con Apple Silicon y macOS 27 o superior, ya que el formato `.aimodel` es específico de Core AI.
- Memoria unificada: aproximadamente 17 GB para pesos (16,35 GB) más la caché KV (52 KB/token; 0,44 GB a contexto 8192). Un Mac con 32 GB o más es recomendable para dejar margen al sistema.
- GPU recomendada: cualquier GPU Apple Silicon con al menos 40 núcleos para un rendimiento óptimo (el autor usó un M4 Max). Modelos con menos núcleos funcionarán, pero con menor throughput.
- No cabe en iPhone ni en dispositivos con menos de 16 GB de memoria unificada; el autor indica explícitamente que ninguna cuantización reduce el bundle a un tamaño móvil.
- Despliegue: exclusivamente mediante el ecosistema Core AI de Apple (`llm-runner`, `llm-benchmark` con el motor `coreai-pipelined`). No es compatible con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: 26,69 tok/s de decodificación y 269,0 tok/s de prefill en el hardware de referencia, con degradación mínima al aumentar el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-CoreAI (este bundle) | 27,855 B (texto) | 8192 (exportado) | Apache-2.0 | `.aimodel` | Solo Mac, solo texto, decodificación 26,69 tok/s |
| Muse-Glimmer-30B (original de Meta) | ~29,6 B | 131072 | Apache-2.0 | ExecuTorch, safetensors | Multimodal, ejecutable en GPU Apple y otras, decodificación 23,7 tok/s (ExecuTorch) |
| Muse-Glimmer-30B (NVIDIA NIM) | ~29,6 B | 131072 | Apache-2.0 | vLLM | Servido en la nube, con tool calling Onyx y razonamiento |

No se dispone de comparativas directas con otros modelos agénticos locales de tamaño similar (p. ej., Llama 3.1 8B o Qwen 2.5 32B) en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Esta conversión incluye solo el decodificador de texto; no procesa imágenes ni otras entradas multimodales, a diferencia del modelo original.
- El bundle está exportado para un contexto máximo de 8192 tokens, muy por debajo de los 131072 del modelo original. Para tareas que requieran contexto más largo, es necesario usar el modelo original u otra conversión.
- Solo funciona en macOS 27 con Apple Silicon; no hay soporte para Linux, Windows o GPUs NVIDIA/AMD en este formato.
- La cuantización int4hu puede introducir pérdida de precisión frente a fp16, aunque el autor reporta una verificación token-a-token contra el oráculo fp16 en 24 tokens generados.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para esta conversión, por lo que no se puede evaluar su rendimiento en tareas estándar.
- El modelo original es agéntico y puede ejecutar acciones; en despliegues locales, se debe supervisar su comportamiento para evitar acciones no deseadas, especialmente con tool calling habilitado.
- La licencia Apache-2.0 permite uso comercial, pero el formato `.aimodel` y el motor Core AI son propietarios de Apple, lo que limita la portabilidad a otras plataformas.

## Enlaces

- [HuggingFace: mlboydaisuke/Muse-Glimmer-30B-CoreAI](https://huggingface.co/mlboydaisuke/Muse-Glimmer-30B-CoreAI)
- [HuggingFace: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Blog de Meta: Introducing Muse Glimmer](https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model)
- [Página de desarrollador de Meta: Muse Glimmer](https://developer.meta.com/ai/models/muse-glimmer/)
- [NVIDIA NIM: muse-glimmer-30b](https://build.nvidia.com/meta/muse-glimmer-30b/modelcard)
- [Repositorio coreai-model-zoo (receta y script de exportación)](https://github.com/john-rocky/coreai-model-zoo)
