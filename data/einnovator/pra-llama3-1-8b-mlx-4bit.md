# EInnovator/pra-llama3-1-8b-mlx-4bit

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un **bundle estructural de Progressive Retrieval Attention (PRA)** diseñado para el modelo base `mlx-community/Llama-3.1-8B-Instruct-4bit`, una versión cuantizada a 4 bits en formato MLX del Llama 3.1 8B Instruct de Meta. El bundle incluye un adaptador estructural, un router aprendido opcional (con 1.048.576 parámetros), perfiles de ejecución y metadatos de compatibilidad, pero **no duplica ni incluye los pesos del modelo base**.

PRA (Progressive Retrieval Attention) es una técnica que mejora la capacidad de recuperación de información en contextos largos mediante un mecanismo de atención selectiva. El bundle proporciona rutas de "Selected Context" y "Native Memory" para el motor MLX, permitiendo evaluar y servir el modelo base con perfiles de routing genéricos o específicos de dataset (QASPER y HotpotQA). Es relevante para desarrolladores que trabajan con MLX en Apple Silicon y necesitan mejorar el rendimiento de Llama 3.1 en tareas de lectura de documentos extensos y respuesta a preguntas de múltiples saltos.

La licencia es `llama3.1`, la misma que el modelo base, y el autor es EInnovator. El repo tiene 0 descargas y 0 likes, y fue creado en septiembre de 2026, lo que indica que es un artefacto experimental o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle PRA (Progressive Retrieval Attention) sobre LlamaForCausalLM (Llama-3.1-8B-Instruct-4bit) |
| Parametros totales | 1.048.576 (router aprendido) + adaptador estructural; el modelo base tiene 8B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el bundle; el modelo base Llama 3.1 soporta 128K tokens |
| Tipos de cuantizacion | El bundle no contiene pesos; el modelo base es 4-bit MLX (grupo de cuantizacion no especificado) |
| Idiomas soportados | no disponibles (el modelo base Llama 3.1 soporta 8 idiomas, pero el bundle no lo especifica) |
| Licencia | llama3.1 |
| Formato de pesos | No aplica (bundle de adapters y perfiles; el modelo base usa safetensors en formato MLX) |

## Arquitectura y entrenamiento

El bundle implementa **Progressive Retrieval Attention (PRA)**, un mecanismo que añade una capa de selección de contexto sobre la atención estándar del transformer. PRA no modifica los pesos del modelo base, sino que introduce un adaptador estructural que mapea el contexto seleccionado a las capas de atención del modelo, junto con un router opcional que decide qué tokens son relevantes. El router aprendido (`combined-router-d128`) se entrenó con el método de `multi-positive softmax` sobre 48 ejemplos de entrenamiento (QASPER y HotpotQA), con 16 ejemplos de validación y 32 de prueba held-out, usando 5 semillas (11, 23, 37, 53, 71). La selección se basó en máxima AUC combinada de validación (0-30). El entrenamiento se realizó sobre la revisión inmutable `90215b22ec18e72f623dde2ea7af4097025160e2` del modelo base.

El bundle incluye tres perfiles: `reference` (verificación estructural sin entrenamiento), `balanced` (por defecto, usa routing coseno genérico) y `qasper-learned` (router aprendido, solo recomendado para cargas de trabajo QASPER). La documentación indica que el router aprendido mejora QASPER pero no HotpotQA, por lo que es opt-in.

## Capacidades

- **Selección de contexto**: PRA permite filtrar tokens relevantes antes de la atención, reduciendo el costo computacional en contextos largos.
- **Routing adaptativo**: dos modos de routing (coseno genérico y router aprendido) para elegir qué tokens se incluyen en el contexto seleccionado.
- **Compatibilidad con MLX**: validado para el motor `mlx-lm 0.31.3` en Apple Silicon (M4 Pro, 48 GB).
- **Evaluación reproducible**: incluye scripts `pra evaluate`, `pra recommend` y `pra report` para medir calidad en QASPER y HotpotQA.
- **No incluye generación de texto ni capacidades de chat**: el bundle solo aporta el mecanismo de atención selectiva; las capacidades de lenguaje son las del modelo base Llama 3.1 Instruct (generación, razonamiento, código, multilingüe).

## Casos de uso

- **Lectura de documentos largos con preguntas puntuales**: el bundle está diseñado para tareas como QASPER, donde se deben extraer respuestas de artículos científicos extensos. Con el perfil `qasper-learned`, el router aprendido mejora la recuperación (R@20=0.4683 frente a 0.3182 del routing genérico).
- **Búsqueda multi-hop en bases de conocimiento**: HotpotQA requiere razonamiento sobre múltiples documentos. El routing genérico ofrece R@20=0.6158 en este dataset, útil para pipelines de recuperación aumentada (RAG).
- **Evaluación de calidad de recuperación**: los scripts `pra evaluate` permiten medir el rendimiento de la selección de contexto en tu propio hardware antes de desplegar en producción.
- **Despliegue en Apple Silicon**: al estar orientado a MLX, puede integrarse en aplicaciones locales que usen Llama 3.1 8B Instruct 4-bit en Macs con chips M-series, aprovechando el perfil `balanced` como opción portable.
- **Investigación en atención selectiva**: sirve como base para experimentar con diferentes estrategias de routing y comparar métricas de recuperación (R@20) en distintos datasets.
- **Optimización de costes de inferencia**: al reducir el número de tokens visibles a la atención, puede disminuir la latencia y el uso de memoria en tareas de contexto largo, aunque las métricas de throughput no están medidas en el bundle.

## Benchmarks y rendimiento

El bundle proporciona métricas de recuperación (Recall@20) medidas con `mlx-lm 0.31.3` en Apple M4 Pro (48 GB) sobre 16 ejemplos de evaluación por dataset. No se publican benchmarks de generación (MMLU, HumanEval, etc.) porque el bundle no es un modelo completo.

| Dataset | Routing | R@20 | Estado |
|---|---|---|---|
| QASPER (n=16) | Coseno genérico | 0.3182 | CONTROLLED |
| QASPER (n=16) | Router aprendido asimétrico | 0.4683 | CONTROLLED |
| HotpotQA (n=16) | Coseno genérico | 0.6158 | CONTROLLED |
| HotpotQA (n=16) | Router aprendido asimétrico | 0.4205 | CONTROLLED |
| Combined (n=32) | Coseno genérico | 0.467 | CONTROLLED |
| Combined (n=32) | Router aprendido asimétrico | 0.4444 | CONTROLLED |

Estos valores son medidas de cualificación, no garantías de rendimiento en producción. No se han publicado resultados de benchmarks comparativos con otros modelos o adapters en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el bundle en sí no requiere VRAM adicional significativa (es un adaptador de ~1M parámetros). El modelo base 4-bit MLX requiere aproximadamente 4.5 GB de VRAM según la búsqueda web para `mlx-community/Meta-Llama-3.1-8B-4bit`.
- **GPU recomendadas**: diseñado para Apple Silicon (M-series). Las métricas se obtuvieron en Apple M4 Pro con 48 GB unificados.
- **Compatibilidad con consumer GPU**: sí, cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada puede ejecutar el modelo base 4-bit, aunque el bundle está optimizado para MLX.
- **Opciones de despliegue**: el bundle se usa con la librería `pra` (comando `pra serve`), que integra con MLX. No se mencionan vLLM, llama.cpp u Ollama; el bundle es específico para el ecosistema MLX.
- **Latencia y throughput**: no medidos (NOT_MEASURED en la tabla de métricas). El bundle solo reporta métricas de calidad de recuperación.

## Comparativa con modelos similares

No hay información suficiente en el repo o en la búsqueda web para comparar este bundle con otros adapters de atención selectiva o métodos de largo contexto. El bundle es un artefacto específico para MLX y no tiene equivalentes directos documentados. Se puede señalar que el modelo base (Llama 3.1 8B Instruct) se compara habitualmente con otros modelos de 8B como Mistral 7B o Gemma 2 9B, pero eso no aplica al bundle PRA en sí.

## Limitaciones y advertencias

- **No es un modelo independiente**: requiere el modelo base `mlx-community/Llama-3.1-8B-Instruct-4bit` en una revisión específica; no funciona con otros pesos ni con otras cuantizaciones.
- **El router aprendido no es universal**: mejora QASPER pero degrada HotpotQA (R@20 de 0.4205 frente a 0.6158 del routing genérico). No debe usarse como perfil por defecto.
- **Evidencia limitada**: las métricas se basan en 16 ejemplos de evaluación por dataset; no establecen calidad de generación ni economía de servicio.
- **Sin mediciones de rendimiento**: no hay datos de latencia, throughput ni consumo de memoria para el bundle; solo métricas de recuperación.
- **Licencia del router**: la licencia del bundle es `llama3.1`, pero el router aprendido puede tener restricciones adicionales según las licencias de los datasets (QASPER, HotpotQA) y del modelo base.
- **Riesgo de alucinación**: el bundle no añade ninguna mitigación adicional; los riesgos del modelo base Llama 3.1 (alucinación, sesgos) persisten.
- **Soporte limitado**: repo con 0 descargas y 0 likes; el autor no proporciona garantías de mantenimiento ni soporte comunitario.

## Enlaces

- [Repositorio HuggingFace del bundle](https://huggingface.co/EInnovator/pra-llama3-1-8b-mlx-4bit)
- [Modelo base (MLX 4-bit)](https://huggingface.co/mlx-community/Meta-Llama-3.1-8B-Instruct-4bit)
- [Documentación de PRA](https://einnovator.github.io/pdattention/)
- [Repositorio fuente de PRA](https://github.com/einnova) (enlace incompleto en la model card)
