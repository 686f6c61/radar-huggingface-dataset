# abstract-extraordinary/Muse-Glimmer-30B-DSpark

## Resumen

Muse Glimmer 30B DSpark es un modelo auxiliar de decodificación especulativa (drafter) diseñado para acelerar la generación del modelo principal `meta-models/Muse-Glimmer-30B-assistant`, desarrollado por el usuario abstract-extraordinary. Se presenta como un reemplazo directo del drafter DFlash que Meta distribuye junto a Muse Glimmer, ofreciendo una mejora de velocidad del 27 al 36 % en entornos de servicio con vLLM, sin modificar el modelo objetivo ni la configuración de despliegue.

El modelo implementa una cabeza de transición adicional sobre el backbone de 5 capas del drafter original, lo que permite condicionar cada predicción de token al token efectivamente muestreado en la posición anterior. Esta innovación aumenta significativamente la tasa de aceptación de tokens en posiciones profundas de cada bloque de 16 tokens, reduciendo el colapso típico de los drafters paralelos. Con 2.659 millones de parámetros y una licencia Apache 2.0, está pensado exclusivamente para ser servido junto a Muse Glimmer 30B, no como modelo autónomo.

Su relevancia radica en que aborda el cuello de botella de la decodificación especulativa en modelos grandes: la baja precisión de las predicciones profundas. Al mejorar la aceptación de tokens por paso de verificación, consigue aceleraciones sustanciales en cargas de trabajo de chat y agentes de código, con un coste de entrenamiento reducido (83 minutos en una RTX PRO 6000 Blackwell) y sin penalizar la calidad de las salidas, ya que la decodificación especulativa es matemáticamente equivalente a la generación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con cabeza de transición (rank-256) para decodificación especulativa |
| Parametros totales | 2.659.433.728 (2,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con ventana de 4.096 tokens; sin degradación medida hasta 16.600 tokens |
| Tipos de cuantizacion | No especificado para el drafter (se sirve en bf16 por defecto); compatible con objetivo cuantizado NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del drafter DFlash de Meta, que predice bloques completos de 16 tokens en una única pasada paralela, sin conocer los tokens reales de las posiciones anteriores. DSpark añade una cabeza de transición de rango 256 que condiciona cada posición al token muestreado en la posición inmediatamente anterior, y afina el backbone de 5 capas para aprovechar esa señal. El resultado es una mejora sustancial en la tasa de aceptación en posiciones profundas: mientras el DFlash original cae al 2 % de aceptación en la posición 11, DSpark mantiene un 23 %.

El entrenamiento se realizó sobre 3.891 conversaciones generadas por el propio Muse Glimmer 30B, con 150 pasos y una duración de aproximadamente 83 minutos en una RTX PRO 6000 Blackwell, utilizando el framework DeepSpec. Se empleó un total de 2,2 B parámetros entrenables (backbone más cabeza). Los pesos de `embed_tokens` y `lm_head` se excluyeron deliberadamente del repositorio, ya que vLLM comparte las copias del modelo objetivo; estos se congelaron durante el entrenamiento para mantener la coherencia.

## Capacidades

- Decodificación especulativa: predice bloques de 16 tokens en una sola pasada para acelerar la generación del modelo objetivo Muse Glimmer 30B.
- Mejora de tokens aceptados por paso de verificación: +47 % en cargas de chat y +60 % en trazas de agentes en comparación con el DFlash de Meta.
- Compatibilidad con cuantización NVFP4 del modelo objetivo, manteniendo aceleraciones relativas similares (27–31 %).
- Funciona con longitudes de contexto superiores a su ventana de entrenamiento (hasta 16,6 k tokens) sin degradación medida.
- Integración nativa con vLLM mediante el método `dspark` (requiere un parche menor en versiones actuales).
- No es un modelo generativo autónomo: no produce texto, ni soporta tool calling, razonamiento o multilingüismo por sí mismo.

## Casos de uso

- Servicio de chat y razonamiento en producción: desplegado junto a Muse Glimmer 30B en vLLM, acelera la generación de respuestas multi-turno en un 36 % (bf16) o 31 % (NVFP4), lo que se traduce en menor latencia por petición y mayor throughput en entornos con carga concurrente.
- Agentes de código con tool use: en escenarios de agentes que invocan herramientas con historiales largos (~13 k tokens), el drafter consigue un +27 % de velocidad, reduciendo el tiempo de espera en pipelines de generación de código asistida.
- Optimización de costes en hardware limitado: al permitir cuantizar el objetivo a NVFP4 sin perder aceleración relativa, se alcanzan 41,1 tokens/s en una DGX Spark (GB10), haciendo viable el despliegue de un modelo de 30 B en hardware de gama media.
- Evaluación de modelos en entornos de investigación: sirve como referencia para estudiar el impacto de la decodificación especulativa en la latencia y el rendimiento de modelos multimodales grandes.
- A/B testing de estrategias de decodificación: permite comparar el rendimiento de diferentes drafters (DFlash vs. DSpark) en las mismas cargas de trabajo, como se muestra en las tablas de la model card.
- Despliegue en infraestructura existente de vLLM: al ser un drop-in replacement, se integra sin cambios en la configuración del servidor, solo apuntando `--speculative-config` al nuevo drafter.

## Benchmarks y rendimiento

La model card proporciona mediciones de velocidad en una sola GPU NVIDIA GB10 (DGX Spark), con batch size 1–4, 48 prompts por configuración y decodificación greedy. Los resultados comparan el drafter DSpark con el DFlash de Meta.

| Carga de trabajo | Objetivo | DFlash (tok/s) | DSpark (tok/s) | Speedup |
|---|---|---|---|---|
| Chat y razonamiento | bf16 | 13,7 | 18,6 | +36 % |
| Chat y razonamiento | NVFP4 | 31,3 | 41,1 | +31 % |
| Agentes de código (tool use) | bf16 | 9,0 | 11,4 | +28 % |
| Agentes de código (tool use) | NVFP4 | 18,8 | 23,9 | +27 % |

También se reportan tokens aceptados por paso de verificación y tasas de aceptación por posición:

| Métrica | DFlash | DSpark |
|---|---|---|
| Tokens aceptados/step (chat) | 4,6 | 6,7 (+47 %) |
| Tokens aceptados/step (agentes) | 4,1 | 6,6 (+60 %) |
| Aceptación en posición 0 | 84 % | 82 % |
| Aceptación en posición 5 | 17 % | 38 % |
| Aceptación en posición 11 | 2 % | 23 % |

| Contexto (agentes) | DFlash (tokens/step) | DSpark (tokens/step) |
|---|---|---|
| 7,6 k–13 k | 3,96 | 6,18 (+56 %) |
| 13 k–16,6 k | 4,32 | 7,09 (+64 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo por sí mismo; su rendimiento se mide exclusivamente en términos de velocidad de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el drafter tiene 2,66 B parámetros, por lo que en bf16 ocupa aproximadamente 5,3 GB (tamaño del repositorio). Se suma a la VRAM del modelo objetivo (Muse Glimmer 30B), que en bf16 requiere ~60 GB y en NVFP4 ~30 GB.
- GPU recomendadas: se ha probado en una NVIDIA GB10 (DGX Spark) y se entrenó en una RTX PRO 6000 Blackwell. Para el drafter solo, cualquier GPU con más de 8 GB de VRAM es suficiente; el conjunto completo (objetivo + drafter) requiere GPUs de clase profesional o consumer de gama alta (RTX 4090 24 GB con cuantización, A100 80 GB, H100).
- ¿Cabe en consumer GPU? El drafter sí, pero el modelo objetivo de 30 B necesita cuantización agresiva (NVFP4) para caber en 24 GB; la configuración completa es viable en una RTX 4090 con NVFP4.
- Opciones de despliegue: vLLM (método `dspark` con parche menor), también compatible con llama.cpp u Ollama si se exporta a GGUF, aunque la integración oficial es vLLM.
- Latencia y throughput: en DGX Spark con NVFP4 se alcanzan 41,1 tok/s en chat y 23,9 tok/s en agentes; en bf16, 18,6 y 11,4 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol | Licencia | Aceleración medida |
|---|---|---|---|---|---|
| Muse Glimmer 30B DSpark | 2,66 B | 4 k (entrenamiento) | Drafter para Muse Glimmer 30B | Apache 2.0 | +27–36 % vs. DFlash |
| DFlash (Meta, incluido en Muse Glimmer) | 2,66 B (estimado) | 4 k (entrenamiento) | Drafter original | Apache 2.0 | Referencia |
| EAGLE (de terceros) | Variable | Variable | Drafter de decodificación especulativa | MIT | No comparable directamente |

No hay datos públicos de otros drafters específicos para Muse Glimmer 30B más allá del DFlash de Meta. DSpark se posiciona como una mejora directa sobre DFlash con el mismo coste de cómputo por paso.

## Limitaciones y advertencias

- Es un drafter, no un modelo autónomo: no genera texto por sí mismo y debe servirse obligatoriamente junto a Muse Glimmer 30B.
- Requiere `num_speculative_tokens` fijado en 16; valores superiores están fuera del territorio entrenado y degradan el rendimiento.
- Depende de un parche no fusionado en vLLM main (ver sección de enlaces); sin él, el método `dspark` falla con `AttributeError`.
- La configuración `sample_from_anchor` debe permanecer en `false` en el `config.json`; si se cambia, la tasa de aceptación cae de ~85 % a ~12 % sin error aparente.
- El entrenamiento se realizó con conversaciones generadas por Muse Glimmer 30B, por lo que las estadísticas de tokens son específicas de ese modelo; usarlo con otro objetivo probablemente degrade la aceleración.
- Longitudes de contexto superiores a 16,6 k tokens no han sido probadas; no se garantiza el rendimiento más allá de ese punto.
- Al ser un modelo auxiliar, no aplican riesgos de alucinación o sesgos de contenido propios; sin embargo, hereda las restricciones de uso del modelo objetivo Muse Glimmer, cuya política de uso debe respetarse.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/abstract-extraordinary/Muse-Glimmer-30B-DSpark)
- [Modelo objetivo: meta-models/Muse-Glimmer-30B-assistant](https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant)
- [Modelo objetivo cuantizado NVFP4](https://huggingface.co/abstract-extraordinary/Muse-Glimmer-30B-NVFP4)
- [Pull request de vLLM para soporte de Muse Glimmer (#51655)](https://github.com/vllm-project/vllm/pull/51655)
- [Rama de vLLM con el parche DSpark](https://github.com/stepnivlk/vllm) (rama `muse-glimmer-dspark`)
- [Repositorio DeepSpec](https://github.com/deepseek-ai/DeepSpec)
