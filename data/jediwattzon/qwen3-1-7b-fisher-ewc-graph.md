# jediwattzon/qwen3-1.7b-fisher-ewc-graph

## Resumen

`qwen3-1.7b-fisher-ewc-graph` es un artefacto de investigación publicado por el usuario `jediwattzon` que recompila el modelo `Qwen/Qwen3-1.7B` (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) en un grafo ejecutable e instrumentable de 59 eventos causales, con pesos en formato MLX SafeTensors. No es un modelo entrenado desde cero ni un fine-tune convencional: es una compresión estructural del transformer de Qwen3 en la que se reducen rangos de las proyecciones de atención y se sustituyen cuatro MLP por gráficas locales ancladas con un prior de Elastic Weight Consolidation (EWC) basado en el jacobiano de Euler de SwiGLU.

El interés técnico está en cómo decide dónde comprimir. El framework asigna reducciones de rango por bloque según una sensibilidad Pullback-Fisher adimensional (formulación KKT con water-filling), preservando explícitamente el generador de attention sink del token 0 en la capa 2 (amplitud 13.376) y las proyecciones `W_O` sin factorizar en las capas tempranas de alta sensibilidad. El artefacto raíz, `joint_waterfill_286mib`, reduce 149,9 millones de escalares (285,85 MiB en BF16) manteniendo un 73,47 % de acuerdo top-1 con el modelo exacto sobre un panel congelado de WikiText de 32.704 objetivos y 70/96 en un panel de tareas de opción múltiple.

Es relevante ahora porque combina tres líneas activas (interpretabilidad mecanística, compresión consciente de la sensibilidad por capa y consolidación de pesos para evitar olvido catastrófico) en un artefacto ejecutable con puente bidireccional MLX ↔ PyTorch, y porque publica las métricas de retención por variante en lugar de solo el resultado final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) recompilado como grafo modal de 59 eventos causales: 1 ingreso léxico atado + 28 mutaciones de atención + 28 mutaciones MLP + 1 RMSNorm terminal + 1 egreso léxico atado |
| Parametros totales | 1.570.706.976 escalares BF16 en el artefacto raíz (`joint_waterfill_286mib`). El modelo exacto de referencia declara 1.720.574.976 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card no declara ventana; se hereda la del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | solo BF16. No se distribuyen variantes GGUF, AWQ, GPTQ ni INT8; la reduccion es de rango y de anclaje EWC, no de precision numerica |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `weights.safetensors` (MLX SafeTensors) + `mlx_qwen3.json` con semantica de capas y temperaturas de chart; puente a ejecutor PyTorch standalone |

Otros datos: tamano del repositorio 3,1 GB; libreria declarada `mlx`; creado el 2026-10-19; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es el decoder transformer denso de Qwen3-1.7B, con atención y MLP en 28 bloques. La recompilación convierte cada operación en un "evento causal" instrumentable y añade dos mecanismos propios. El primero es el reparto KKT Pullback-Fisher (`allocate_waterfill_joint_ranks` / `allocate_waterfill_attention_ranks`), que calcula para cada bloque una sensibilidad adimensional Ω_l = E[f_l^T F_l f_l] y distribuye las reducciones de rango de forma proporcional, con restricciones que protegen las capas tempranas de alta sensibilidad (mantiene el generador de attention sink de la capa 2 y las proyecciones `W_O` sin factorizar). El segundo es el anclaje EWC Euler-Jacobiano (`_swiglu_euler_jacobian_prior`), que reemplaza cuatro MLP (capas 13, 15, 18 y 25, las de menor Ω) por gráficas locales de 4 charts y las regulariza hacia el prior jacobiano homogéneo de grado 2 W_Euler = ½·E[J(x)], con interceptos centrados sin penalizar y pesos de norma objetivo inversa recortados.

No hay entrenamiento desde cero ni datos nuevos: el proceso es de compilación y ajuste sobre el checkpoint original de Qwen3-1.7B. La model card no documenta número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; esas etapas pertenecen al modelo base y no se detallan aquí. La evaluación se realizó con `MLX_ENABLE_TF32=0` en procesos separados de referencia y candidato, sobre un panel congelado de WikiText de 32.704 objetivos de 512 tokens y un panel de 96 preguntas de opción múltiple (32 de BoolQ, 32 de PIQA, 32 de ARC-Easy), con digests SHA-256 y recibos por brazo en `ewc_retention_results.json`. La innovación destacable es el puente bidireccional `runtime.to_torch()` / `MLXQwen3.from_torch()`, que ejecuta nativamente en Metal (Apple Silicon) y transfiere el grafo al ejecutor PyTorch `Qwen3JointCrossBlockChartExecutor` sin asignar el modelo de Hugging Face.

## Capacidades

- Generación de texto autoregresiva en decodificación con caché, a través del runtime `MLXQwen3`.
- Razonamiento y respuesta a preguntas de opción múltiple: 70/96 en el panel BoolQ/PIQA/ARC-Easy, frente a 68/96 del modelo exacto y 49/96 del baseline sin anclar.
- Compresión selectiva por capa con trazas de sensibilidad Fisher reproducibles (el JSON de resultados incluye las mediciones por bloque).
- Interpretabilidad mecanística: modo `xray` con atribución causal por routing de charts y ablaciones contrafactuales; se documentan canales latentes en la capa 13 (índices 4172, 4971, 751, 4206, 287) asociados a fronteras de chat.
- Instrumentación de grafos: `architecture_manifest()` expone los 59 eventos del ejecutor PyTorch.
- Ecualización y silenciado en vivo de charts durante la inferencia (`/xray` y `/mute` en el REPL interactivo).
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Capacidades de agente multi-paso: no disponible.
- Multilingüismo: no disponible (no se declara ningún conjunto de idiomas).
- Visión, audio o modo thinking: no disponible en este artefacto.

## Casos de uso

- Investigación en interpretabilidad mecanística: el modo `xray` permite atribuir causalmente una predicción a rutas de charts concretas y comparar con ablaciones contrafactuales, algo que un checkpoint estándar de Qwen3 no expone sin instrumentación adicional.
- Estudio de compresión sensible a la capa: el artefacto incluye siete brazos de evaluación (single-block sin anclar, single-block EWC, atención uniforme 1024/512, water-fill r=0,25, r=0,05 y joint) con métricas de acuerdo top-1 y delta de NLL, lo que permite reproducir el compromiso entre ahorro de memoria y degradación.
- Validación de EWC en modelos de lenguaje: los cuatro MLP sustituidos por charts con prior Euler-Jacobiano sirven como banco de pruebas para medir olvido catastrófico a escala de 1,7B con un panel fijo de 96 preguntas.
- Inferencia local en Apple Silicon: con 3,1 GB de pesos BF16 y ~30 tok/s en decodificación con caché, cabe en un Mac con memoria unificada de 8 GB o más y evita depender de CUDA.
- Docencia y demostración de arquitecturas internas: el manifiesto de 59 eventos y el REPL con `/mute` permiten mostrar en directo qué ocurre al desactivar un chart o una cabeza de atención.
- Puente MLX ↔ PyTorch en pipelines de investigación: `runtime.to_torch()` genera un ejecutor standalone sin cargar el modelo de Hugging Face, útil para integrar el grafo en herramientas de análisis escritas en PyTorch.
- Pruebas de regresión de herramientas de compilación: `ewc_retention_results.json` con digests SHA-256 sirve como referencia verificable al modificar el framework `fisher-compilation`.

## Benchmarks y rendimiento

Panel congelado de WikiText de 32.704 objetivos de 512 tokens y panel de 96 preguntas (32 BoolQ / 32 PIQA / 32 ARC-Easy). Todos los valores provienen de la model card.

| Variante | Escalares desplegados | Ahorro BF16 | Acuerdo top-1 (32.704) | Delta NLL | Panel de tareas (96) | BoolQ / PIQA / ARC | Acuerdo con profesor |
|---|---:|---:|---:|---:|---:|---|---:|
| Qwen/Qwen3-1.7B exacto | 1.720.574.976 | 0 MiB | 100,00 % | 0,0000 | 68/96 (70,8 %) | 24 / 18 / 26 | 100,00 % |
| Baseline single-block sin anclar (L13) | 1.683.107.976 | 71,46 MiB | 87,21 % | −0,0078 | 49/96 (51,0 %) | 10 / 18 / 21 | 68,75 % |
| Single-block Euler-Jacobian EWC (L13) | 1.683.107.976 | 71,46 MiB | 88,41 % | −0,0128 | 63/96 (65,6 %) | 20 / 21 / 22 | 76,04 % |
| Atención uniforme 28 capas (1024/512) | 1.603.134.464 | 224,00 MiB | 63,07 % | +1,0900 | 53/96 (55,2 %) | 17 / 20 / 16 | 60,42 % |
| KKT Pullback water-fill atención (r=0,25) | 1.603.134.464 | 224,00 MiB | 75,60 % | +0,0949 | 61/96 (63,5 %) | 19 / 19 / 23 | 79,17 % |
| KKT Pullback water-fill atención (r=0,05) | 1.603.134.464 | 224,00 MiB | 73,68 % | +0,1227 | 67/96 (69,8 %) | 25 / 19 / 23 | 80,21 % |
| Joint KKT water-fill (artefacto raíz) | 1.570.706.976 | 285,85 MiB | 73,47 % | +0,2287 | 70/96 (72,9 %) | 27 / 20 / 23 | 78,12 % |

Lectura de los datos: el water-filling conjunto reduce la penalización de NLL de +1,0900 (atención uniforme) a +0,2287, es decir, 4,8 veces menos degradación con un ahorro mayor (285,85 frente a 224,00 MiB), y supera al modelo exacto en el panel de tareas (70/96 frente a 68/96). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el delta de NLL negativo en los brazos single-block indica que la referencia exacta no es óptima en esa métrica concreta.

## Requisitos de hardware

- VRAM estimada: el artefacto raíz ocupa 3,1 GB en BF16 (1.570.706.976 escalares). Con caché KV y buffers de ejecución, presupuestar 4-6 GB para contextos moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en BF16, siempre que se use la ruta PyTorch; la ruta nativa `MLXQwen3` requiere Apple Silicon (Metal).
- GPU recomendadas: Apple Silicon (serie M) para la ejecución nativa MLX; para el ejecutor PyTorch, GPU con 8 GB o más. La model card no especifica modelos concretos (A100, H100, RTX 4090) ni pruebas en ellos.
- Rendimiento declarado: ~30 tok/s en decodificación con caché sobre Apple Silicon. Throughput de prefill y latencia por token no disponibles.
- Opciones de despliegue: harness `fisher_graph.mlx_qwen3_pipeline` (modos `interactive` y `xray`) y `MLXQwen3.load()` desde Python. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato MLX SafeTensors y la estructura de charts no son estándar en esos servidores.
- Dependencias: repositorio `fisher-compilation` clonado, tokenizer `Qwen/Qwen3-1.7B` descargado aparte, y `MLX_ENABLE_TF32=0` para reproducir las evaluaciones.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la información proporcionada. La comparación relevante es interna, entre el modelo exacto y los distintos brazos de compresión:

| Variante | Parametros | Contexto | Panel de tareas (96) | Delta NLL | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen/Qwen3-1.7B (referencia) | 1.720.574.976 | no disponible aqui | 68/96 | 0,0000 | Apache-2.0 | Hugging Face |
| Joint KKT water-fill (este artefacto) | 1.570.706.976 | no disponible | 70/96 | +0,2287 | Apache-2.0 | Hugging Face, formato MLX |
| Single-block EWC L13 | 1.683.107.976 | no disponible | 63/96 | −0,0128 | Apache-2.0 | incluido como brazo experimental |
| Atención uniforme 28 capas | 1.603.134.464 | no disponible | 53/96 | +1,0900 | Apache-2.0 | incluido como brazo experimental |

Frente a alternativas del mismo tamaño de otros fabricantes (por ejemplo modelos de ~1,5-2B), no hay métricas comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo de producción: el artefacto raíz solo conserva el 73,47 % de acuerdo top-1 con el modelo exacto en el panel de WikiText, lo que implica divergencias de tokens en aproximadamente uno de cada cuatro objetivos.
- Dependencia de Apple Silicon para la ruta principal: `MLXQwen3` está atado a MLX y Metal; el puente PyTorch existe, pero la model card no documenta su rendimiento ni su soporte en CUDA.
- Formato no estándar: los pesos no cargan directamente en transformers, vLLM, llama.cpp ni Ollama; requieren el paquete `fisher-compilation` y el fichero `mlx_qwen3.json` con la semántica de charts.
- Trazabilidad limitada: 0 descargas y 0 likes, autor individual y fecha de creación muy reciente; no hay revisión independiente de los resultados ni réplica de las evaluaciones.
- Paneles de evaluación pequeños y específicos: 96 preguntas de opción múltiple y un panel de WikiText. No hay MMLU, HumanEval, GSM8K ni evaluaciones multilingües, de sesgo o de toxicidad.
- Idiomas no declarados: al no especificarse la cobertura lingüística del artefacto, no se puede asumir el comportamiento multilingüe del Qwen3-1.7B original.
- Riesgo de alucinación: inherente al modelo base y no mitigado por el proceso de compilación; además, la sustitución de cuatro MLP por charts locales puede alterar el comportamiento en dominios poco representados en el panel de evaluación.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base Qwen3-1.7B deben verificarse por separado antes de redistribuir.
- Sin datos de seguridad, sesgos ni robustez adversarial; no apto para decisiones automatizadas de alto impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jediwattzon/qwen3-1.7b-fisher-ewc-graph
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`)
- Repositorio del framework Fisher Graph Compilation: https://github.com/JediWattson/fisher-compilation
- Resultados de retención y digests: `ewc_retention_results.json`, incluido en el repositorio del modelo
- Configuración de runtime MLX: `mlx_qwen3.json`, incluido en el repositorio del modelo
- Papers, blogs o demos adicionales: no disponible. La búsqueda web realizada devolvió únicamente páginas de servicios de proxy (CroxyProxy) sin relación con el modelo, por lo que no se incluyen.
