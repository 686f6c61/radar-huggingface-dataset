# junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4

## Resumen

Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4 es una versión **abliterated** (uncensored) del modelo multimodal Ornith-1.5-35B-A3B, publicada por el usuario junafinity en Hugging Face. El modelo base, desarrollado por ornith-ai, es un Mixture-of-Experts (MoE) de 35 mil millones de parámetros con ~3 mil millones activos por token, basado en la arquitectura Qwen3.5-MoE. Esta versión concreta ha sido sometida a una técnica de abliteración (abliterix) para eliminar la dirección de rechazo de la red neuronal, reduciendo los rechazos en un conjunto de pruebas dañinas de 100 a 9. Además, se ha cuantizado a formato **MXFP4** (4-bit) mediante `mlx-vlm`, orientado a ejecución en Apple Silicon con memoria unificada.

La relevancia de este modelo reside en su uso como instrumento de investigación en **red teaming y ciberseguridad defensiva**: permite medir el techo de capacidad real de los pesos sin la interferencia de los rechazos entrenados, y sirve como mitad de tratamiento en pares controlados contra el modelo base para evaluar sistemas de moderación y filtros. Su licencia Apache 2.0 permite uso comercial, aunque el autor advierte de la necesidad de capas de moderación independientes si se despliega en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-MoE |
| Parametros totales | 35 B (según card del autor) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | 262 K tokens (según BenchLM para el modelo base) |
| Tipos de cuantizacion | MXFP4 (4-bit, 4.402 bits por peso, grupo de 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) con cuantización MXFP4 |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con aproximadamente 3 mil millones de parámetros activos por token. Su entrenamiento sigue el paradigma de **self-scaffolding y self-improvement** de la serie Ornith-1.5, donde el modelo propone nuevas tareas, genera scaffolds específicos y produce soluciones para aprendizaje por refuerzo. La arquitectura incluye un vision tower (encoder de imagen) integrado en el checkpoint, lo que lo convierte en un modelo multimodal de imagen-texto.

La versión abliterated se ha obtenido mediante la herramienta **Abliterix** (versión 1.12.2), que edita los parámetros de atención (q/k/v/o), `mlp.down_proj` y los parámetros de expertos/routers del MoE para eliminar la dirección de rechazo. La abliteración no afecta al vision tower ni a los tensores `mtp.*` (multi-token prediction). La cuantización a MXFP4 se realizó con `mlx-vlm` (conversión con `-q --q-mode mxfp4 --q-group-size 32 --dtype bfloat16`), que es un formato de precisión reducida de 4 bits optimizado para Apple Silicon. Esta cuantización es más agresiva que la de 8 bits, por lo que puede degradar ligeramente el rendimiento numérico.

## Capacidades

- **Texto e imagen (multimodal)**: acepta entradas de imagen y texto, generando texto como respuesta. El vision tower se conserva dentro del checkpoint.
- **Generación de texto y razonamiento**: hereda las capacidades del modelo base para tareas de razonamiento complejo, análisis y generación de contenido.
- **Generación de código**: el modelo base supera a Qwen 3.6-35B en benchmarks de codificación, por lo que esta versión conserva esa capacidad (aunque la cuantización puede afectarla).
- **Soporte para tareas agenticas**: según la búsqueda web, el modelo base destaca en benchmarks de agentes, lo que sugiere que puede manejar flujos de trabajo multi-step.
- **Multilingüismo**: no se especifican idiomas soportados; probablemente siga el alcance del modelo base, pero no se dispone de datos.
- **Sin MTP**: el formato MLX elimina los tensores `mtp.*`, por lo que no se dispone de multi-token prediction en esta versión.

## Casos de uso

- **Red teaming de sistemas de IA**: el modelo permite probar la robustez de filtros de entrada y clasificadores de salida sin que el propio modelo genere rechazos. Se usa como mitad de tratamiento en pares controlados frente al modelo base.
- **Evaluación de capas de moderación**: al eliminar los refusals, se puede evaluar la efectividad de moderadores externos (APIs, filtros) en un entorno donde el modelo no contribuye con su propia seguridad.
- **Investigación en interpretabilidad**: la comparación entre el modelo base y esta versión permite estudiar el efecto de la ablación de direcciones de rechazo en el comportamiento interno.
- **Generación de datos etiquetados para clasificadores**: se pueden generar completaciones no censuradas para entrenar o evaluar modelos de detección de contenido abusivo o dañino.
- **Aislamiento de superficies de ataque**: en pruebas de inyección de prompts, abuso de herramientas o exfiltración de datos, este modelo permite aislar el control bajo prueba sin interferencias de rechazos.
- **Evaluación de techo de capacidad**: para entender qué puede generar realmente un modelo en un dominio específico, sin el sesgo de los rechazos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión cuantizada en concreto. Los datos de rendimiento disponibles se refieren al modelo base o a la versión bf16 del proceso de abliteración. La card indica que la abliteración se midió en el padre bf16, no en este checkpoint cuantizado, y advierte que MXFP4 es una transformación numérica más lossy que el 8-bit, por lo que los resultados pueden variar.

| Metrica | Valor |
|---|---|
| Refusals en conjunto dañino (padre bf16) | 100 → 9 (9%) |
| Divergencia KL respecto al base | 0.3985 |
| Herramienta | Abliterix 1.12.2 |
| Trial seleccionado | #17 |
| Steering | per-layer attn q/k/v/o + `mlp.down_proj` |
| MoE expert steering | n_suppress=4, router_bias=-2.72, expert_ablation_weight=4.31 |

Según BenchLM (para el modelo base Ornith-1.5-35B-A3B), obtiene un score de 49.22/100 y ocupa el puesto #137 de 224 en el leaderboard público. No hay datos de MMLU, HumanEval o GSM8K para esta versión cuantizada.

## Requisitos de hardware

- **Memoria**: el checkpoint cuantizado ocupa 19.3 GB. Se recomienda un Mac con al menos 24 GB de memoria unificada (por ejemplo, M3 Pro/Max, M2 Max, M4 Pro) para cargar el modelo y ejecutar inferencia con margen.
- **GPU**: no es compatible con GPUs NVIDIA/AMD; está diseñado para Apple Silicon con Metal.
- **Despliegue**: se usa con la librería `mlx-vlm` (no `mlx-lm`, que eliminaría el vision tower). También existe una versión GGUF (Q8_0) para `llama.cpp` que incluye el MTP head.
- **Latencia y throughput**: no se disponen de datos medidos. La inferencia dependerá de la cantidad de memoria unificada y del número de núcleos de la GPU integrada. En un Mac con M3 Max (128 GB) se podría esperar una velocidad moderada para 35B activos, pero no hay cifras publicadas.

## Comparativa con modelos similares

La información proporcionada no incluye datos detallados de otros modelos comparables. Según la búsqueda web, el modelo base Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en benchmarks de código y agentes, y a los modelos densos Gemma 4-31B y Muse Glimmer-30B por márgenes amplios. Sin embargo, no se disponen de métricas numéricas para esta versión cuantizada.

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | 262K | Apache 2.0 | Safetensors, GGUF, MLX |
| Esta versión MXFP4 | 35B | ~3B | 262K | Apache 2.0 | MLX (MXFP4) |
| Qwen 3.6-35B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma 4-31B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Modelo uncensored**: al eliminar los rechazos, el modelo puede generar contenido que el modelo base rechazaría. No debe exponerse como endpoint público sin una capa de moderación independiente. El autor recomienda reportar siempre el delta contra el modelo base.
- **Riesgo de alucinación**: no se han evaluado los efectos de la cuantización MXFP4 en la calidad de las respuestas. La pérdida numérica puede aumentar la frecuencia de errores o alucinaciones.
- **MTP no disponible**: el formato MLX elimina los bloques `mtp.*`, por lo que no se puede usar la predicción multi-token en esta versión. Si se necesita MTP, usar la versión GGUF.
- **Idiomas**: no se ha especificado el soporte multilingüe; se asume que sigue el del modelo base, pero no hay confirmación.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor recomienda un uso responsable y solo para investigación de seguridad. La responsabilidad de la moderación recae en quien despliega.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo de pesos completos, hereda los sesgos del entrenamiento original. La abliteración no corrige sesgos de contenido.

## Enlaces

- Modelo en Hugging Face: [junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4](https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4)
- Modelo base: [ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- Colección de variantes uncensored: [https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd](https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd)
- Versión GGUF (con MTP): [Ornith-1.5-35B-A3B-uncensored-GGUF-8bit](https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit)
- Versión MLX 8-bit: [Ornith-1.5-35B-A3B-uncensored-MLX-8bit](https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit)
- Herramienta Abliterix: [https://github.com/wuwangzhang1216/abliterix](https://github.com/wuwangzhang1216/abliterix)
- Página de Ornith-1.5: [https://ornith.ai/ornith_1_5.html](https://ornith.ai/ornith_1_5.html)
