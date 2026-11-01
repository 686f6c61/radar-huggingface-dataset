# hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp

## Resumen

Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp es una compilación cuantizada en formato MLX, destinada a Apple Silicon, del modelo `khazarai/Qwen3.5-9B-Kimi-k3-Distilled`. El modelo base es un Qwen3.5-9B denso (arquitectura híbrida Gated DeltaNet + atención, 32 capas) afinado por khazarai mediante destilación sobre trazas de agentes de codificación y depuración de Kimi K3, con un enfoque "tool-first" y bucles de build-test-fix. Esta versión concreta ha sido cuantizada por el usuario hakunokina con oMLX oQ6e (6 bits con calibración imatrix), conservando la cabecera MTP (multi-token prediction) para decodificación especulativa.

El problema que resuelve es doble: por un lado, ofrece un modelo pequeño (9B) especializado en codificación agéntica que hasta ahora no tenía build para MLX; por otro, reduce el tamaño del checkpoint de ~19 GB (BF16) a ~8,5 GB manteniendo una calidad muy cercana al original (KL media de 0,00315 nat/token y 97 % de acuerdo top-1). Con contexto de 262k tokens, soporte de visión heredado del modelo fuente y tool calling verificado, es relevante para desarrolladores que quieren ejecutar un modelo de código agéntico localmente en Mac Studio o MacBook Pro con Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 denso, híbrido Gated DeltaNet + atención, 32 capas, con cabecera MTP y codificador de visión |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oMLX oQ6e: afín 6 bits (grupo 64) para el 91,6 % de pesos, 8 bits para tensores sensibles (3,3 %), BF16 para el 5,1 %; efectivo 7,05 bits/peso |
| Idiomas soportados | no disponible (la calibración imatrix usó código, inglés y turco) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-9B denso con arquitectura híbrida que combina capas Gated DeltaNet (una variante de estado recurrente tipo SSM) con capas de atención completa (8 capas de atención plena según los datos de KV cache). Sobre este modelo, khazarai realizó un fine-tuning por destilación a partir del dataset `greghavens/kimi-k3-coding-and-debugging-traces`, que contiene trayectorias de agentes de codificación y depuración de Kimi K3: conversaciones tool-first con bucles de construir-probar-corregir. No hay información publicada sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

La innovación principal de este build concreto es la cuantización oQ6e de oMLX: cuantización afín de 6 bits con grupo 64, calibrada con matriz de importancia (imatrix) sobre un conjunto de código y texto multilingüe, con los tensores más sensibles elevados a 8 bits y una parte en BF16. Además, se conserva la capa de predicción multi-token (MTP, 0,243 B de parámetros), que oMLX aprovecha para decodificación especulativa, y el codificador de visión del modelo fuente (0,456 B), aunque la entrada de imagen no ha sido probada en esta build.

## Capacidades

- Generación de codigo y depuración agéntica: afinado específicamente sobre trayectorias de agentes que usan herramientas en bucles de build-test-fix.
- Tool calling / function calling: verificado en la model card con las APIs de Anthropic (`/v1/messages`) y OpenAI (`/v1/chat/completions`), con 4/5 y 5/5 de aciertos respectivamente en las pruebas.
- Entrada multimodal (imagen + texto): conserva el codificador de visión del modelo fuente (pipeline image-text-to-text), aunque sin probar en esta build.
- Contexto muy largo: 262k tokens, adecuado para repositorios y sesiones de agente extensas.
- Decodificación especulativa mediante la cabecera MTP conservada (~87 tok/s de decodificación en Mac Studio M3 Ultra).
- Capacidades conversacionales generales heredadas de Qwen3.5 (soporte de idiomas no documentado; la calibración incluyó inglés y turco).

## Casos de uso

- Agentes de codificación locales en Mac: ejecutar un agente que lee el repositorio, ejecuta tests y corrige errores sin salir de la máquina, aprovechando el fine-tuning sobre trazas de agentes Kimi K3 y el tool calling verificado.
- Revision de pull requests con contexto completo: con 262k tokens de ventana, puede ingerir diffs grandes junto con archivos relacionados y generar comentarios de revisión coherentes.
- Depuracion automatizada en pipelines de CI/CD: integrado vía API OpenAI o Anthropic compatible de oMLX, puede analizar logs de fallos, proponer parches y validarlos en bucles iterativos.
- Asistente de refactorizacion de bases de codigo medianas: la ventana de contexto permite cargar múltiples módulos a la vez y proponer cambios estructurales.
- Generacion de codigo a partir de capturas o mockups: el codificador de visión heredado permite, en teoría, convertir imágenes de interfaces en código (capacidad no probada en esta build).
- Chat técnico con documentación extensa: el prefill de ~1.370 tok/s y la caché de prefijo (0,54 s al reutilizar un prefijo de ~29k tokens) hacen viable mantener documentación larga fija en el prompt mientras se conversa.
- Autocompletado y generación de código en editores locales: ~87 tok/s de decodificación con decodificación especulativa MTP es suficiente para asistentes integrados en IDE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta build. La model card reporta calidad como divergencia respecto al modelo BF16 fuente (KL sobre vocabulario completo, 64 secuencias × 512 tokens, sobre código, prosa en inglés y turco):

| Metrica | Valor |
|---|---|
| KL(BF16 ‖ oQ6e), media | 0,00315 nat/token |
| KL mediana / p99 | 0,0022 / 0,019 |
| Acuerdo top-1 de tokens | 97,0 % |
| Perplejidad BF16 → oQ6e | 8,428 → 8,445 |

Rendimiento medido en Mac Studio M3 Ultra (512 GB, oMLX 0.7.1):

| Metrica | Valor |
|---|---|
| Prefill, prompt de ~29k tokens (en frio) | ~21 s (~1.370 tok/s) |
| Mismo prefijo con cache | ~0,54 s |
| Decodificacion (especulativa con MTP) | ~87 tok/s |
| Tool calling (Anthropic / OpenAI, 5 ejecuciones) | 4/5 / 5/5 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~8,5 GB para los pesos, más la caché KV (~32 KB/token en las 8 capas de atención completa, ~8 GB adicionales a 262k de contexto). Un uso práctico con contexto moderado cabe en 16 GB de memoria unificada.
- GPU recomendadas: al ser un build MLX, está pensado para Apple Silicon (Mac Studio M3 Ultra usado en las mediciones; también viable en M-series con suficiente memoria unificada). No es un build CUDA; para GPU NVIDIA habría que usar el modelo fuente en BF16 u otras cuantizaciones.
- Consumer hardware: cabe en MacBook Pro con chip M-series de 16 GB o más para contextos cortos/medios; para contextos cercanos a 262k se recomiendan máquinas con 32-64 GB o más de memoria unificada.
- Despliegue: requiere oMLX ≥ 0.7.1; sirve el modelo vía API compatible con OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`). No está probado con `mlx-lm` ni LM Studio. No aplica vLLM, TGI ni llama.cpp en este formato.
- Latencia y throughput: prefill ~1.370 tok/s, decodificación ~87 tok/s con MTP en M3 Ultra; las cifras son de una sola ejecución y varían con el contexto y la predictibilidad de la salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp (este) | 9,65 B | 262k | oQ6e (7,05 bits efectivos) | Apache-2.0 | Build MLX con MTP y visión; especializado en codigo agéntico |
| khazarai/Qwen3.5-9B-Kimi-k3-Distilled (fuente) | ~9,5 B (BF16) | 262k | BF16 (~19 GB) | Apache-2.0 | Mismo modelo sin cuantizar; mayor fidelidad, más memoria |
| hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp | 9,65 B | 262k | oQ8e (~10 GB) | Apache-2.0 | Misma familia, cuantización a 8 bits, mayor tamaño y fidelidad |

## Limitaciones y advertencias

- La entrada de imagen está heredada del modelo fuente pero no ha sido probada en esta build; no confíes en la capacidad de visión sin validarla primero.
- El build solo está verificado con oMLX ≥ 0.7.1; no está probado con `mlx-lm` ni LM Studio, por lo que puede no funcionar en otros runtimes MLX.
- No se han publicado benchmarks estandarizados del modelo fuente ni de esta cuantización; la calidad se reporta solo como divergencia KL respecto al BF16.
- Las mediciones de velocidad son de una sola ejecución y las ganancias de MTP dependen de la predictibilidad del contenido generado.
- Los idiomas soportados no están documentados; la calibración de la cuantización usó código, inglés y turco, por lo que el rendimiento en castellano no está garantizado ni medido.
- Al ser un modelo destilado de trazas de agentes, puede heredar sesgos y patrones de las trazas de Kimi K3; no hay análisis de sesgos publicado.
- Riesgo de alucinación típico de modelos de 9B: en tareas de código agéntico conviene mantener verificación (ejecución de tests) en el bucle del agente.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene revisar los términos del dataset de destilación original para usos sensibles.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ6e-mtp
- Modelo base destilado: https://huggingface.co/khazarai/Qwen3.5-9B-Kimi-k3-Distilled
- Variante oQ8e-mtp: https://huggingface.co/hakunokina/Qwen3.5-9B-Kimi-k3-Distilled-oQ8e-mtp
- Dataset de destilación: https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Runtime oMLX: https://omlx.ai
