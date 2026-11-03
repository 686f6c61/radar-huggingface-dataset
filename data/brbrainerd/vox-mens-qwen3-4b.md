# brbrainerd/vox-mens-qwen3-4b

## Resumen

Vox MENS (`vox-mens-qwen3-4b`) es un adaptador LoRA/PEFT de 4.000 millones de parámetros entrenado por `brbrainerd` sobre el modelo base Qwen3-4B de Alibaba. Forma parte de la familia MENS (Model Engine & Neural Synthesis), un conjunto de adaptadores escalonados (0,6B, 1,7B, 4B y 8B) especializados en el lenguaje de programación Vox, un lenguaje nativo para IA escrito en Rust que compila a Rust y TypeScript. El adaptador no modifica la arquitectura del modelo base: añade pesos de bajo rango que redirigen el comportamiento del modelo hacia la sintaxis, el sistema de tipos y los diagnósticos del compilador `voxc`.

El problema que resuelve es concreto: los modelos fundacionales generalistas apenas han visto gramática de Vox durante el preentrenamiento, por lo que tienden a alucinar sintaxis de Rust o TypeScript cuando se les pide generar código Vox. Este adaptador cubre tres frentes: síntesis idiomática de módulos `.vox`, reparación guiada por diagnósticos estructurados del compilador y traducción entre Vox y sus backends de compilación.

El modelo se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB (solo los pesos del adaptador, no el modelo base), y está etiquetado exclusivamente para inglés. Es relevante ahora porque ejemplifica un patrón creciente: adaptadores de dominio de bajo coste que se integran directamente en el toolchain del compilador y se distribuyen con versionado inmutable y puertas de evaluación automatizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/PEFT |
| Parametros totales | 4B (modelo base Qwen3-4B) + pesos LoRA del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible en la model card |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere cargar Qwen/Qwen3-4B por separado) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B, un transformer decoder-only denso de 4.000 millones de parámetros. La contribución propia del repositorio es un conjunto de pesos LoRA (Low-Rank Adaptation) entrenados mediante PEFT, que se cargan sobre el modelo base congelado mediante `PeftModel.from_pretrained`. El repositorio ocupa 0,1 GB, lo que confirma que solo contiene los tensores del adaptador y no una copia completa de los pesos del modelo base.

El entrenamiento se enmarca en el pipeline MENS, que entrena adaptadores escalonados sobre toda la familia Qwen3 (0,6B, 1,7B, 4B y 8B) con el objetivo de ofrecer inferencia local consciente de la gramática de Vox en cada etapa del desarrollo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí describe un proceso de evaluación y promoción denominado `eval-gate`: cada adaptador se somete a una suite de referencia de 192 elementos (holdout) que mide la tasa de compilación limpia de programas `.vox` generados (parseo, typechecking y codegen contra `voxc`) frente al baseline sin adaptar, además de una prueba de retención de capacidades generales para detectar regresiones por sobreespecialización. El estado de la puerta de release distingue entre `Verified (Passed Eval Gate)` y `Baseline (Ungated)`; este `v1` se publica como baseline inicial para fijar la paridad de versiones y los puntos de referencia entre tiers.

## Capacidades

- Generación de código Vox idiomático: síntesis de módulos `.vox` que respetan la gramática estricta y las restricciones de tipos del lenguaje, evitando alucinar sintaxis de Rust o TypeScript.
- Reparación guiada por compilador: consume códigos de diagnóstico estructurados de `voxc` y produce parches mínimos y deterministas sobre el AST y el código fuente.
- Interoperabilidad entre objetivos: traducción de especificaciones entre Vox y sus backends de compilación (Rust y TypeScript).
- Refactorización multifunción: el tier de 4B se posiciona como el nivel equilibrado para refactorizaciones que abarcan varias funciones y reparaciones iterativas guiadas por el compilador.
- Integración en toolchain: invocable desde la CLI de Vox (`vox mens hub pull --size 4B`) y desde Python con `transformers` + `peft`.
- Generación de texto general: al ser un adaptador sobre Qwen3-4B, conserva las capacidades del modelo base, aunque el entrenamiento está orientado al dominio Vox.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Autocompletado inline en el editor: el adaptador genera fragmentos `.vox` sintácticamente válidos mientras el desarrollador escribe, aprovechando que el tier de 4B ofrece un equilibrio entre latencia y calidad para completions en línea.
- Reparación automática de errores de compilación: integrado en `voxc`, el modelo recibe el código de diagnóstico estructurado y emite un parche mínimo sobre el AST, reduciendo el ciclo de corrección manual en pipelines de CI.
- Migración y traducción entre Vox y Rust/TypeScript: dado un módulo Vox, el adaptador puede generar la especificación equivalente en el backend de compilación, útil en proyectos que mantienen código en ambos ecosistemas.
- Generación de módulos completos en el tier equilibrado: para tareas de síntesis de código de tamaño medio (varias funciones, tipos algebraicos, efectos) donde los tiers de 0,6B y 1,7B se quedan cortos y el de 8B resulta excesivo en coste.
- Asistente de refactorización guiada por tipos: el modelo propone reescrituras que respetan el sistema de tipos y el sistema de efectos de Vox, verificables automáticamente con `voxc` antes de aplicarse.
- Evaluación y benchmarking de toolchains de IA nativa: investigadores pueden usar el adaptador como referencia para medir la tasa de compilación limpia frente al baseline Qwen3-4B sin adaptar en la suite de 192 elementos.
- Desarrollo local sin conexión: al ser un adaptador de 0,1 GB sobre un modelo de 4B, el conjunto puede ejecutarse en estaciones de trabajo locales, permitiendo flujos de generación de código sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card describe la existencia de una suite de evaluación de 192 elementos (tasa de compilación limpia de Vox y retención de capacidades colaterales) y un `eval-gate` de promoción, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de la propia suite Vox. El `v1` se etiqueta explícitamente como `Baseline (Ungated)`, es decir, publicación inicial para establecer puntos de referencia, no un resultado verificado contra umbrales.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade 0,1 GB sobre el modelo base. Qwen3-4B en bfloat16 requiere aproximadamente 8 GB de VRAM; en cuantización de 8 bits, alrededor de 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones estándar para un modelo denso de 4B, no confirmadas en la model card).
- GPU recomendadas: A100 o H100 para despliegues de producción con alto throughput; RTX 4090 o RTX 3090 para desarrollo y uso individual.
- ¿Cabe en GPU de consumo? Sí, el modelo base de 4B en bfloat16 cabe en GPUs con 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080, RTX 4090); en cuantización de 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: la vía recomendada es la CLI de Vox (`vox mens hub pull --size 4B`), que resuelve, verifica y cachea los pesos a través de `brbrainerd/vox-mens-index`. Alternativamente, Python con `transformers` + `peft` cargando `Qwen/Qwen3-4B` y el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3-4b | 4B + LoRA | no disponible | Vox (código y reparación de compilador) | apache-2.0 | HuggingFace (adaptador PEFT) |
| vox-mens-qwen3-0.6b | 0,6B + LoRA | no disponible | Vox, tier de baja latencia | apache-2.0 | HuggingFace |
| vox-mens-qwen3-1.7b | 1,7B + LoRA | no disponible | Vox, generación de un solo archivo | apache-2.0 | HuggingFace |
| vox-mens-qwen3-8b | 8B + LoRA | no disponible | Vox, síntesis arquitectónica compleja | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B (base) | 4B | no disponible | Propósito general | apache-2.0 | HuggingFace |

La comparación natural es dentro de la propia familia MENS, donde el tier de 4B se posiciona como el nivel equilibrado por defecto frente al de 0,6B (completions inline y reparación sintáctica rápida), el de 1,7B (generación de un solo archivo y correcciones de una pasada) y el de 8B (razonamiento multiarchivo y diagnósticos semánticos profundos). Frente al Qwen3-4B sin adaptar, la diferencia es la especialización en gramática y diagnósticos de Vox, a costa de posibles regresiones en capacidades generales que el `eval-gate` intenta acotar.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para Vox y sus backends; su uso fuera de ese dominio puede degradar el rendimiento respecto al Qwen3-4B sin adaptar. La propia model card incluye una prueba de retención de capacidades colaterales precisamente por este riesgo.
- Estado de release: el `v1` se publica como `Baseline (Ungated)`, sin haber superado la puerta de evaluación formal. No debe tratarse como un adaptador verificado hasta que exista una revisión `Verified`.
- Idiomas: etiquetado únicamente para inglés; no hay soporte declarado para castellano ni otros idiomas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación. Como todo modelo generativo de código, puede producir programas `.vox` que no compilan; la mitigación prevista es el bucle de compilación con `voxc`.
- Licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B, cuyos términos deben verificarse por separado.
- Versionado: se recomienda fijar una revisión inmutable (`--revision v1`) en lugar de seguir `main`, ya que los pesos pueden actualizarse.
- Requisitos de carga: no es un modelo autónomo; requiere descargar y cargar Qwen/Qwen3-4B además del adaptador.
- Datos de entrenamiento opacos: no se especifican el volumen de tokens, la composición del dataset ni el proceso de alineación, lo que dificulta evaluar la cobertura y los sesgos del adaptador.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/brbrainerd/vox-mens-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Índice y manifiesto de la familia MENS: https://huggingface.co/brbrainerd/vox-mens-index
- Adaptador tier 0,6B: https://huggingface.co/brbrainerd/vox-mens-qwen3-0.6b
- Adaptador tier 1,7B: https://huggingface.co/brbrainerd/vox-mens-qwen3-1.7b
- Adaptador tier 8B: https://huggingface.co/brbrainerd/vox-mens-qwen3-8b
- Sitio web del lenguaje Vox: https://vox-lang.org
- Repositorio GitHub de Vox: https://github.com/vox-foundation/vox
