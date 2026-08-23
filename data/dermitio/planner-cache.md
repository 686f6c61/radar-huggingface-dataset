# Dermitio/Planner-Cache

## Resumen

Planner Cache es un componente de memoria externa para modelos de lenguaje congelados, desarrollado por el usuario Dermitio. No es un modelo fundacional: actúa como una capa de memoria semántica que almacena un conjunto acotado de hechos actuales fuera del prompt, selecciona los relevantes y los expone mediante artefactos de compatibilidad para el runtime del modelo. El repositorio contiene esos artefactos distribuidos (router, capas de traducción y paquetes de personalidad), no pesos de un modelo base.

Su relevancia radica en abordar el problema del contexto largo sin sustituirlo: el autor especifica que no reemplaza el contexto largo arbitrario, sino que complementa la memoria reciente (KV retenido) y la recuperación de herramientas. La propuesta separa el estado canónico de hechos (independiente del modelo) de las capas de traducción que lo convierten en estado interno del modelo (TTL) o en controles léxicos de salida (LTL). La información disponible es escasa y no incluye licencia, idiomas soportados ni métricas de rendimiento comparativas con modelos similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Capa de memoria externa (no es un modelo de base); incluye router canónico, Tensor Translation Layer (TTL) y Lexical Translation Layer (LTL) |
| Parámetros totales | No disponible (los artefactos no contienen pesos de modelo base; el TTL de Pythia-1.4B contiene pesos de compatibilidad semántica) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (el sistema no define contexto propio; depende del modelo base congelado) |
| Tipos de cuantización | No disponible (el LTL para Gemma Q8 GGUF registra checksums del modelo cuantizado, pero no es una cuantización del propio artefacto) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags), además de artefactos en formato `.router`, `.ttl`, `.ltl`, `.ppkg` y JSON de benchmarks |

## Arquitectura y entrenamiento

La arquitectura se describe como un sistema de capas de memoria externa que opera sobre un modelo de lenguaje congelado. El flujo es el siguiente: el estado canónico P se procesa mediante un router universal que selecciona los hechos relevantes para una entidad y relación determinadas; el valor canónico seleccionado se convierte en estado nativo del modelo mediante una capa TTL (para soporte semántico) o en controles léxicos de salida mediante una capa LTL (para soporte de salida). El router no tiene dimensión oculta de modelo, y las capas TTL/LTL no contienen pesos del modelo base ni el contenido de P.

El artefacto TTL está diseñado para Pythia-1.4B (ancho oculto 2048, capa 23) y el LTL para Gemma4 Q8 GGUF con llama.cpp, registrando checksums del modelo y tokenizador. El paquete de personalidad (`.ppkg`) almacena patrones de personalidad durables en disco y carga solo entradas seleccionadas. No se especifican datos de entrenamiento (número de tokens, composición del dataset) ni el uso de RLHF o DPO. La arquitectura se define como una intervención causal: mantener el prompt fijo y cambiar solo el estado P, midiendo la divergencia KL y el incremento de VRAM.

## Capacidades

- Selección y rechazo de hechos canónicos: el router universal clasifica y rechaza estados según entidad y relación.
- Traducción semántica a estado interno del modelo: la capa TTL convierte el valor canónico seleccionado en estado interno de Pythia-1.4B.
- Control léxico adaptativo: la capa LTL genera sesgo de logits directo sin parámetros aprendidos, sin añadir tokens al prompt y con cero VRAM en caminos inactivos.
- Memoria de personalidad persistente: el paquete `.ppkg` almacena patrones de personalidad en disco y carga solo entradas seleccionadas.
- Compatibilidad con runtime: los artefactos se integran con Transformers (carga del modelo base) y llama.cpp (para el LTL de Gemma).
- No es un modelo generativo: no genera texto por sí mismo; requiere un modelo base congelado.

## Casos de uso

- **Memoria de hechos actuales para asistentes conversacionales**: el sistema puede mantener un conjunto acotado de hechos verdaderos fuera del prompt y seleccionar los relevantes para cada turno, evitando que el contexto del prompt crezca sin límite.
- **Personalización de estilo de respuesta**: el paquete de personalidad (`.ppkg`) permite cargar patrones de respuesta específicos según el dominio o la interacción (por ejemplo, estilo técnico en depuración), sin modificar el modelo base.
- **Control de salida sin parámetros aprendidos**: la capa LTL puede sesgar la salida léxica de un modelo cuantizado (Gemma Q8) mediante logit bias, útil para imponer restricciones de vocabulario o estilo sin entrenar.
- **Evaluación de intervenciones causales**: el sistema permite mantener el prompt fijo y cambiar solo el estado de memoria, midiendo la divergencia KL, útil para auditar la influencia de la memoria en la salida.
- **Reducción de representación de memoria**: con 1024 unidades de memoria, el estado canónico ocupa aproximadamente 2,05 MiB frente a los 193,31 MiB de los tensores KV retenidos, una diferencia de representación de unas 94 veces, lo que puede interesar en sistemas con restricciones de VRAM.
- **Sistemas de personalidad en aplicaciones de rol**: el paquete de personalidad permite cargar solo entradas seleccionadas de un índice de 100k entradas en unos 67 ms, adecuado para sistemas de interacción con perfiles de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos medidos en la model card son internos del sistema y no comparables con benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K). Los resultados reportados son:

| Métrica | Resultado |
|---|---|
| Precisión top-1 del router canónico (post-auditoría, 1.024 slots) | 100% |
| MRR (Mean Reciprocal Rank) del router canónico (1.024 slots) | 1,0 |
| Generación de estado controlado con TTL de Pythia (objetivo de prueba 128 slots) | 100% |
| Emisión de cadenas seleccionadas con LTL de Gemma Q8 (128 de 128) | 100% |
| Latencia de enrutado de cabecera `.ppkg` (100k entradas) | 67,10 ms |
| Ocupación de memoria canónica (1.024 unidades) | ~2,05 MiB |
| Ocupación de KV retenido (1.024 unidades) | ~193,31 MiB |

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma general; la model card indica que el LTL de Gemma Q8 usa 0 VRAM en caminos inactivos y el TTL de Pythia-1.4B se carga en CUDA. El incremento de VRAM es el dato de la intervención causal, no se especifica un valor numérico completo.
- **GPU recomendadas**: se menciona CUDA como entorno de ejecución; no se especifican modelos concretos de GPU.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: se muestra carga con Transformers (AutoModelForCausalLM) y llama.cpp para el LTL; no se mencionan vLLM, Ollama ni TGI.
- **Latencia y throughput**: solo se reporta la latencia de enrutado de cabecera (67,10 ms para 100k entradas); no hay datos de throughput de inferencia.

## Comparativa con modelos similares

No disponible. Planner Cache no es un modelo de lenguaje comparable a modelos fundacionales como Pythia, Gemma u otros. Se trata de un sistema de memoria externa que se acopla a modelos congelados, por lo que no se pueden comparar parámetros, contexto, rendimiento ni licencia con alternativas de la misma categoría. La model card no proporciona referencias a sistemas equivalentes.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto por sí mismo; requiere un modelo base congelado y el runtime correspondiente.
- **No reemplaza el contexto largo**: la documentación indica explícitamente que no sustituye el contexto largo arbitrario; el KV reciente, el historial exacto y la recuperación de herramientas siguen siendo responsabilidad del runtime.
- **Dependencia de artefactos específicos**: el TTL está ligado a Pythia-1.4B (capa 23, ancho oculto 2048) y el LTL a Gemma4 Q8 GGUF con checksums concretos; el uso con otros modelos o configuraciones no está soportado según la documentación.
- **Sin licencia definida**: no se especifica licencia, lo que impide conocer si es utilizable en producción comercial.
- **Sin idiomas documentados**: no se indica qué idiomas soporta la capa de memoria ni el router.
- **Riesgo de alucinación**: no hay datos sobre sesgos o alucinaciones; al ser una capa de memoria, el riesgo depende del modelo base, pero no se documenta.
- **Problemas de reproducción**: los artefactos no son modelos Transformers independientes; se requiere la implementación Python del sistema (pcm.planner) que no se distribuye en el repositorio público, lo que limita la reproducibilidad.
- **Datos de rendimiento limitados**: los resultados medidos son de cargas de trabajo sintéticas internas y no cubren la calidad de respuesta en tareas reales.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Dermitio/Planner-Cache
- Índice de artefactos (referenciado en la model card): [ARTIFACT_INDEX.md](ARTIFACT_INDEX.md) (no disponible externamente en la búsqueda web)

No se han encontrado enlaces externos relevantes (papers, blogs, repos o demos) en los resultados de búsqueda web.
