# AIArchiveInfo/Ling-3.1-flash-1019-singprobe

## Resumen

Ling-3.1-flash-1019-singprobe es una sonda de atención (attention probe) de 8,13 millones de parámetros diseñada como guardrail intrínseco en streaming para el modelo base Ling-3.1-flash-1019. No es un modelo generativo autónomo: se acopla a las capas ocultas del modelo base (capas 23, 47 y 71, indexadas desde cero) y puntúa, token a token, la intención de la consulta (8 clases), la inseguridad de la respuesta y el riesgo de alucinación. Lo publica el usuario AIArchiveInfo, con licencia MIT y pesos en bfloat16.

Su relevancia radica en que traslada la moderación al bucle de decodificación: en lugar de clasificar la salida completa a posteriori, la sonda emite probabilidades por token que un servidor de inferencia puede consumir en tiempo real. Según la model card, alcanza F1 de 0,8687 en clasificación de intención de consulta, 0,8707 en seguridad de respuesta, AUC de 0,9844/0,9411 en seguridad en streaming y AUC de 0,8041 en detección de alucinaciones, con una tasa de falsos positivos del 0,008 % sobre respuestas benignas.

El modelo se distribuye como checkpoint de sonda (no como LLM completo) y requiere el modelo base Ling-3.1-flash-1019 más una build específica de SGLang (rama 261029) para exponer las puntuaciones en `meta_info.token_probe_probs`. El repositorio es de 0,0 GB, sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atención multi-cabeza (sing_probe_attn) sobre capas ocultas del modelo base; 8 cabezas, dimensión de cabeza 64, ventana de 2.048 tokens |
| Parametros totales | 8.132.106 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de sonda de 2.048 tokens; el modelo base se sirve con `--context-length 16384` en el ejemplo de despliegue |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

La sonda es un módulo de atención ligero que lee los estados ocultos de tres capas del transformer base (23, 47 y 71) durante la generación y produce diez etiquetas por token: `label_0` a `label_7` para intención de consulta, `label_8` para inseguridad de respuesta y `label_9` para riesgo de alucinación. Usa 8 cabezas de atención con dimensión 64 y una ventana deslizante de 2.048 tokens, lo que permite puntuar en streaming sin esperar a que termine la respuesta. Los pesos se publican en bfloat16.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card remite al informe técnico (arXiv:2608.30703) y al repositorio de SingProbe para el método y el código de entrenamiento. La innovación destacable es el enfoque de guardrail intrínseco: la supervisión vive dentro del proceso de decodificación y no como un clasificador externo en cascada.

## Capacidades

- Clasificación de intención de consulta en 8 categorías (`label_0` a `label_7`), con F1 de 0,8687 en el conjunto de 6 benchmarks.
- Detección de inseguridad de respuesta (`label_8`), con F1 de 0,8707 en 8 benchmarks y umbral calibrado de 0,5.
- Detección de alucinación (`label_9`), con AUC de 0,8041 en 6 benchmarks y umbral calibrado de 0,5.
- Moderación en streaming token a token: AUC de respuesta 0,9844 y AUC por token 0,9411 en 3 benchmarks.
- Puntuaciones expuestas por token en la respuesta de `/generate` mediante `meta_info.token_probe_probs`, consumibles por el servidor de inferencia.
- Baja tasa de falsos positivos sobre respuestas benignas: 0,008 % promediada sobre 5 datasets con el umbral de respuesta pre-calibración de 0,983085.
- No genera texto por sí misma: depende del modelo base Ling-3.1-flash-1019 para la generación.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Moderación en tiempo real de asistentes conversacionales: la sonda puntúa cada token generado y permite abortar o reescribir una respuesta en cuanto `label_8` supera el umbral de 0,5, sin esperar a que termine la generación.
- Enrutado de consultas por intención: las 8 etiquetas de intención permiten dirigir peticiones a distintos flujos (soporte, ventas, cumplimiento) o activar políticas específicas antes de generar la respuesta completa.
- Detección de alucinaciones en pipelines RAG: con `label_9` y umbral 0,5 se puede marcar o bloquear respuestas con riesgo elevado antes de mostrarlas al usuario, integrándolo en la capa de serving.
- Guardrail para agentes multi-paso: al puntuar en streaming, se puede cortar una cadena de acciones peligrosa a mitad de turno y evitar que el agente ejecute herramientas con una respuesta insegura.
- Cumplimiento y auditoría: el registro de probabilidades por token y por etiqueta genera trazas granulares para revisión posterior y para justificar decisiones de bloqueo ante equipos de compliance.
- Despliegue en infraestructura existente de SGLang: al ser una sonda de 8,13 M de parámetros acoplada al modelo base, el coste incremental es bajo frente a un clasificador externo de 8B como los usados como baseline.

## Benchmarks y rendimiento

| Tarea | Metrica | Ling-3.1-flash-1019-singprobe | Baseline de referencia |
|---|---|---:|---|
| Clasificación de intención de consulta (6 benchmarks) | F1 | 0,8687 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificación de seguridad de respuesta (8 benchmarks) | F1 | 0,8707 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC respuesta / AUC token | 0,9844 / 0,9411 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Detección de alucinaciones (6 benchmarks) | AUC | 0,8041 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,008 % (media sobre 5 datasets, umbral de respuesta pre-calibración 0,983085) |
| Umbrales calibrados de release | 0,5 para inseguridad de respuesta y 0,5 para alucinación |

Cada benchmark tiene el mismo peso dentro de su suite; para cada fila F1 se selecciona un único umbral que maximiza el F1 medio de la suite. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La sonda suma 8,13 M de parámetros en bfloat16 (unos 16 MB), por lo que su huella de VRAM es despreciable frente al modelo base.
- El requisito real lo marca Ling-3.1-flash-1019: el ejemplo oficial de despliegue usa 8 GPU H20 con `--tp 8 --ep-size 8`.
- El arranque de referencia fija `--context-length 16384`, `--chunked-prefill-size 1024`, `--max-prefill-tokens 8192`, `--max-total-tokens 32768`, `--max-running-requests 16` y `--mem-fraction-static 0.85`.
- El ejemplo desactiva los CUDA graphs (`--cuda-graph-backend-prefill disabled` y `--cuda-graph-backend-decode disabled`).
- Motor de despliegue: build de SGLang de la rama 261029 (repositorio en code.alipay.com), con soporte de `--probe-ckpt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- VRAM estimada para inferencia, GPU consumer compatibles, latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| Ling-3.1-flash-1019-singprobe | Sonda de atención en streaming | 8,13 M | ventana de 2.048 tokens | F1 0,8687 intención; F1 0,8707 seguridad; AUC 0,9844/0,9411 streaming; AUC 0,8041 alucinación | MIT | Hugging Face, requiere SGLang rama 261029 |
| YuFeng-XGuard-Reason-8B | Guardrail generativo | 8B (según nombre) | no disponible | F1 0,8714 en intención de consulta | no disponible | no disponible |
| Qwen3Guard-Gen-8B-strict | Guardrail generativo | 8B (según nombre) | no disponible | F1 0,8604 en seguridad de respuesta | no disponible | no disponible |
| Qwen3Guard-Stream-8B-strict | Guardrail en streaming | 8B (según nombre) | no disponible | AUC 0,9640 respuesta / 0,8893 token | no disponible | no disponible |
| DRIFT | Detección de alucinaciones | no disponible | no disponible | AUC 0,8000 | no disponible | no disponible |

La ventaja estructural de SingProbe es el tamaño: 8,13 M de parámetros frente a los 8B de los guardrails generativos comparables, con rendimiento igual o superior en las suites reportadas.

## Limitaciones y advertencias

- No es un modelo generativo: sin Ling-3.1-flash-1019 desplegado en paralelo no produce ninguna salida útil.
- Dependencia de una build no estándar de SGLang (rama 261029 alojada en code.alipay.com); no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Requiere `--trust-remote-code`, lo que implica ejecutar código personalizado del repositorio; conviene auditar los pesos y el código antes de usarlo en producción.
- La ventana de la sonda es de 2.048 tokens, muy inferior al contexto del modelo base; el comportamiento más allá de esa ventana no está documentado.
- El umbral de respuesta pre-calibración (0,983085) y los umbrales de release (0,5) son valores fijos: recalibrarlos sobre el dominio propio es responsabilidad del integrador.
- La tasa de falsos positivos del 0,008 % se midió sobre 5 datasets concretos; no se garantiza que se mantenga en otros dominios o idiomas.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe de la sonda.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación del propio guardrail: la detección reporta AUC de 0,8041, no una precisión perfecta; habrá falsos negativos.
- Licencia MIT permite uso comercial, pero el modelo base Ling-3.1-flash-1019 puede tener condiciones propias que no se detallan aquí.
- Repositorio sin descargas ni likes y publicado el 2026-11-21: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/AIArchiveInfo/Ling-3.1-flash-1019-singprobe
- Informe técnico de SingProbe: https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Build de SGLang rama 261029: https://code.alipay.com/shaoshuo.shao/sglang/tree/261029
