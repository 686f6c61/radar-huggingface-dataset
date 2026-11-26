# kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF

## Resumen

Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF es una cuantización GGUF del checkpoint Preview de Agnes-3.0-Flash, un modelo multimodal (texto e imagen) de 33B parámetros densos desarrollado por Agnes AI. Esta build concreta la publica el usuario kingjones777 y está optimizada específicamente para hardware AMD Strix Halo (gfx1151), en particular el Ryzen AI Max+ 395 con GPU Radeon 8060S, empleando un formato de cuantización propio denominado ROCmFP4/ROCmFPX.

El modelo base combina atención híbrida con gated delta rule y atención global, soporta una ventana de contexto de 262.144 tokens y procesa entradas image-text-to-text. La innovación principal de esta publicación es la integración de una cabeza MTP (multi-token prediction) dentro de cada fichero GGUF para habilitar decodificación especulativa, además de incluir el proyector de visión y un parche para que el prompt caching funcione con MTP activo en `llama-server`.

Es relevante porque cubre un nicho poco atendido: inferencia de un modelo de 33B con capacidades de razonamiento y visión en hardware consumer AMD de memoria unificada (128 GB), sin necesidad de GPUs NVIDIA. El autor documenta métricas de rendimiento y calidad (KLD, perplejidad, aceptación de drafts) medidas en su propio equipo, lo que permite evaluar el compromiso entre velocidad y fidelidad de cada cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (gated delta rule + atención global); linaje `qwen35` en llama.cpp |
| Parametros totales | 32.661.228.864 (33B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (modelo base); 65.536 en el ejemplo de despliegue del autor |
| Tipos de cuantizacion | Q4_0-ROCmFP4 (STRIX_LEAN, COHERENT), Q8_0-ROCmFPX (AGENT, estándar), BF16 de referencia; variantes imatrix en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parámetros con una arquitectura de atención híbrida que combina capas con gated delta rule (una forma de atención lineal recurrente) y capas de atención global. Según la model card, el checkpoint Preview tiene 262.144 tokens de contexto y procesa texto e imágenes mediante un proyector de visión incluido en los ficheros GGUF.

Un detalle técnico destacable es el tratamiento de la rama FFN paralela: el autor pliega de forma exacta la rama SwiGLU paralela en un MLP estándar `qwen35` (verificado bit a bit idéntico), de modo que los pesos cargan en llama.cpp sin necesidad de parches específicos para Agnes. Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información en la documentación disponible. La aportación de esta publicación es de cuantización y despliegue: incorpora una cabeza MTP de predicción multi-token en cada fichero (258–270 MiB adicionales en los ficheros de 4 bits, frente a los 1,91 GiB del fichero separado que sustituye) para decodificación especulativa, y ofrece un sidecar Q8_0 independiente de la cabeza MTP para configuraciones que usan `--mtp-model`.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento controlable (`--think off` en el ejemplo de despliegue).
- Procesamiento de imágenes (pipeline image-text-to-text) mediante el proyector de visión incluido.
- Tool calling / function calling: el autor reporta 7/7 llamadas correctas tanto con `tool_choice` en modo required como en auto.
- Decodificación especulativa mediante cabeza MTP integrada, con aceptación de drafts de 1086/1514 tokens en las pruebas del autor.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens en el modelo base).
- Compatible con endpoints de API (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de razonamiento local en estaciones AMD Strix Halo: con 128 GB de memoria unificada se puede cargar la variante Q8_0 (31,9 GiB) y mantener contextos de decenas de miles de tokens, útil para equipos de desarrollo que no disponen de GPUs NVIDIA.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados combinándolos con preguntas en texto dentro de una misma ventana de contexto.
- Automatización de agentes con tool calling: las pruebas del autor muestran 7/7 llamadas correctas en modo required y auto, lo que lo hace apto para orquestadores que necesitan invocar funciones de forma fiable.
- Generación de código asistida en local: el autor mide 29,2 tok/s de media (rango 23,4–32,0) en generación de código con MTP, suficiente para autocompletado interactivo en un entorno de desarrollo personal.
- Servicio de chat con contexto largo: con 65.536 tokens configurados en `llama-server` y prompt caching funcionando junto a MTP (con el parche incluido), se pueden mantener sesiones prolongadas sin reprocesar el prompt completo.
- Evaluación y ajuste de cuantizaciones: las métricas publicadas (KLD frente a BF16, mismo top-1, perplejidad) permiten a un equipo elegir el tier adecuado según el compromiso velocidad/calidad que necesite en producción.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB, ROCm 7.2.4, una petición a la vez, temperatura 0, caché de prompt fría:

| Medicion | Resultado |
|---|---:|
| Procesamiento de prompt (1566 tokens) | 423,0 tok/s |
| Generación tras ese prompt (hasta 256 tokens) | 21,5 tok/s |
| Generación de código, 6 prompts, media (rango) | 29,2 tok/s (23,4–32,0) |
| Tokens draft aceptados | 1086/1514 |
| Tool calls correctas (required / auto) | 7/7 / 7/7 |

Calidad y velocidad por fichero (prompt de ~7,1K tokens, greedy, 256 tokens, mediana de 3):

| Fichero | Tamano | BPW | KLD vs BF16 | Mismo top-1 | PPL (× BF16) | TG MTP ROCm | TG MTP Vulkan |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q4_0-ROCmFP4-STRIX_LEAN | 16,82 GiB | 4,42 | 0,0438 ± 0,0010 | 91,29 % | 6,4877 (×1,0250) | 26,64 | 27,31 |
| Q4_0-ROCmFP4-COHERENT | 17,77 GiB | 4,67 | 0,0385 ± 0,0009 | 91,39 % | 6,4290 (×1,0157) | 24,76 | 23,51 |
| Q8_0-ROCmFPX-AGENT | 31,91 GiB | 8,39 | 0,0074 ± 0,0007 | 96,73 % | 6,3014 (×0,9955) | 16,97 | 14,97 |
| Q8_0-ROCmFPX | 31,46 GiB | 8,27 | 0,0108 ± 0,0008 | 96,04 % | 6,3176 (×0,9981) | 16,42 | 16,17 |
| BF16 (referencia) | 60,85 GiB | 16 | 0 | 100 % | 6,3296 ± 0,0762 | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte además que los resultados publicados para el modelo de producción de Agnes AI (contexto de 1M) no aplican a estos pesos Preview.

## Requisitos de hardware

- VRAM/memoria estimada: 16,82–17,77 GiB para los tiers de 4 bits y 31,46–31,91 GiB para los de 8 bits; 60,85 GiB para la referencia BF16.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), que es el hardware objetivo y de medida. No hay datos de rendimiento para GPUs NVIDIA en la documentación.
- Cabe en hardware consumer AMD de memoria unificada: los tiers de 4 bits entran holgadamente en 32 GB de memoria unificada; los de 8 bits requieren 64 GB o más (el autor usa 128 GB). No hay datos para GPUs consumer NVIDIA.
- Opciones de despliegue: llama.cpp con `llama-server` (parcheado, ver recetas del autor) y el servidor Super ROC (`superroc serve`), con soporte de `--speculative mtp`, `--mtp-model` y `--think off`. No hay datos de compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 423 tok/s de prefill y 21,5–29,2 tok/s de generación en el hardware medido, con decodificación especulativa MTP activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash Preview (esta cuantización) | 33B densos | 262.144 | Si | Apache 2.0 | GGUF en HF |
| Agnes-3.0-Flash (modelo base) | 33B densos | 262.144 | Si | Apache 2.0 | Pesos originales en HF |
| Agnes-3.0-Flash Preview imatrix (mismo autor) | 33B densos | 262.144 | Si | Apache 2.0 | GGUF imatrix en repo separado |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint Preview: Agnes AI indica que su modelo de producción (API, contexto de 1M) es un checkpoint distinto y que los benchmarks publicados para ese modelo no se aplican a estos pesos.
- El autor no ha registrado ninguna medición de calidad para el fichero sidecar MTP Q8_0; sus números de calidad corresponden a los ficheros con cabeza MTP integrada.
- Los tiers de 4 bits presentan una divergencia notable respecto a BF16 (KLD 0,0385–0,0438; mismo top-1 en torno al 91 %; perplejidad un 1,6–2,5 % superior), lo que puede degradar tareas sensibles a la fidelidad.
- Las métricas de velocidad y calidad se han medido en un único equipo (Ryzen AI Max+ 395, ROCm 7.2.4) y no son extrapolables a otro hardware.
- El prompt caching con MTP activo requiere un parche de `llama-server` incluido en `recipe/patches/`; sin él no se reutiliza nada mientras la cabeza está cargada.
- El soporte está centrado en ROCm/Strix Halo; no hay datos de funcionamiento en otras plataformas.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una cuantización de un checkpoint Preview conviene verificar las condiciones del modelo base antes de desplegarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Variante imatrix: https://huggingface.co/kingjones777/Agnes-3.0-Flash-Preview-MTP-ROCmFP4-imatrix-GGUF
- Servidor Super ROC: https://github.com/kingjones30/superroc
