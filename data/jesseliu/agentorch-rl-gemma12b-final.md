# JesseLiu/agentorch-rl-gemma12b-final

## Resumen

`agentorch-rl-gemma12b-final` es un checkpoint de investigación publicado por el usuario JesseLiu dentro del proyecto AgentOrch, orientado a la orquestación de flujos de trabajo con agentes. No es un modelo entrenado desde cero: parte de `google/gemma-4-12B-it` (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`) y aplica un ajuste en dos fases —SFT y posterior RL con GRPO— cuyos adaptadores LoRA se han fusionado en los pesos finales. El resultado es un checkpoint estándar de 11.959.730.224 parámetros (~12B) que se carga con `transformers` o `vLLM` sin necesidad de código específico.

El problema que aborda es concreto: dado un objetivo de orquestación, seleccionar y encadenar los pasos o herramientas correctas. La evaluación se realizó sobre el benchmark AgentOrch (vista global, 3.220 variantes, arnés congelado), con unos resultados de precisión de orquestación de 0,2166, precisión final de 0,0854 y tasa de error de 0,5276. Son cifras bajas en términos absolutos, lo que sitúa este checkpoint como material de experimentación y reproducibilidad de la receta de RL, no como un componente listo para producción.

Su relevancia ahora es metodológica: documenta de forma explícita la receta completa (datos, hiperparámetros, presupuesto de tokens, configuración de GRPO con vLLM colocando TP8, función de recompensa basada en coincidencia simbólica de nivel 1 y límite de 48 horas de entrenamiento), lo que permite replicar o contrastar experimentos de RL sobre modelos de ~12B con recursos moderados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `gemma4_unified`); adaptadores LoRA fusionados en los pesos base. Detalle interno no disponible |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (24,0 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Gemma 4 de 12B en variante instruct (`gemma-4-12B-it`). Sobre ella se aplicó un ajuste supervisado (SFT) con los datos `v1`: 2 épocas, presupuesto de 81.920 tokens, LoRA con r=16 y alpha=32, learning rate 1e-4 y scheduler coseno. Posteriormente se ejecutó una fase de RL con GRPO usando `GRPOTrainer` de TRL, manteniendo LoRA r=16/alpha=32 y desplegando vLLM colocado con TP8 para la generación de rollouts. La recompensa es una coincidencia simbólica de nivel 1 (Tier-1 symbolic match), con learning rate 1e-5, beta de KL 0,001, tamaño de grupo 8, 8 prompts por paso y datos `data_trl_v1`. El entrenamiento se inicializó desde el checkpoint `sft-gemma12b-v1-2ep`.

La fase de RL se detuvo en el paso 460 de los 992 previstos al alcanzar el límite de 48 horas, lo que conviene tener en cuenta al interpretar los resultados: el checkpoint no corresponde a una convergencia completa del plan de entrenamiento. Los adaptadores se fusionaron en los pesos base, de modo que el artefacto distribuido es un checkpoint monolítico convencional. La model card indica explícitamente usar `enable_thinking=False` en la plantilla de chat, tanto en entrenamiento como en evaluación, lo que implica que el modelo base expone un modo de razonamiento explícito que aquí se desactiva.

## Capacidades

- Orquestación de flujos de trabajo: selección y encadenamiento de pasos orientados a un objetivo, que es la tarea para la que se entrenó y evaluó.
- Correspondencia simbólica de acciones: la función de recompensa del RL se basa en coincidencia simbólica exacta de nivel 1, por lo que el modelo está optimizado para producir salidas estructuradas comparables literalmente.
- Generación de texto y razonamiento general: heredados del modelo base `gemma-4-12B-it`, aunque no se documentan evaluaciones específicas en esta ficha.
- Modo de pensamiento: la plantilla de chat del modelo base admite `enable_thinking`; en este checkpoint se recomienda desactivarlo, tal como se hizo en entrenamiento y evaluación.
- Tool calling / function calling: no documentado en la información disponible para este checkpoint.
- Soporte de agentes multi-paso: sí en la forma concreta de orquestación evaluada en AgentOrch; no se documentan otras formas de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en RL para agentes: el checkpoint sirve como referencia reproducible de una receta GRPO completa (LoRA r16/a32, recompensa simbólica, vLLM TP8) sobre un modelo de 12B, útil para comparar variantes de recompensa o de datos.
- Reproducción de experimentos: al estar fusionados los pesos y documentada la fila `rl-gemma12b-final` de `training/results/training.csv`, permite verificar curvas de entrenamiento y estudiar el efecto del corte a 460 pasos por límite de tiempo.
- Enrutado de tareas a subagentes en prototipos: el modelo puede generar una secuencia de pasos dado un objetivo; adecuado en fase de prototipo con validación humana, no en producción dado el 8,54 % de precisión final reportada.
- Generación de trazas de planificación para anotación: sus salidas pueden usarse como candidatos preliminares que un anotador corrige, aprovechando el formato estructurado inducido por la recompensa simbólica.
- Evaluación comparativa de checkpoints: sirve como línea base "post-RL" frente a `sft-gemma12b-v1-2ep` para medir la aportación real de la fase GRPO en el arnés de AgentOrch.
- Pruebas de regresión de infraestructura de inferencia: al ser un checkpoint estándar de ~12B en safetensors, es útil para validar despliegues con vLLM o `transformers` y plantillas de chat con `enable_thinking=False`.
- Sustituto controlado del modelo base en experimentos de alineación: permite estudiar cómo un ajuste estrecho (orquestación) afecta al comportamiento general sin salir de la misma familia y licencia.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark AgentOrch (vista global, 3.220 variantes, arnés congelado, ejecución `rl-gemma12b-final-global`):

| Métrica | Valor |
|---|---:|
| Precisión de orquestación (orchestration accuracy) | 0,2166 |
| Precisión final (final accuracy) | 0,0854 |
| Tasa de error (error rate) | 0,5276 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni comparaciones numéricas con modelos alternativos en el mismo arnés.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 24 GB solo para pesos, más caché KV y overhead; en la práctica se recomienda un mínimo de 32 GB para secuencias cortas y 40-48 GB para contextos largos.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB. La receta de entrenamiento usó vLLM con TP8, lo que sugiere despliegues multi-GPU en ese rango.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al límite en bf16; solo es viable con cuantización a 8 o 4 bits, que no está publicada y habría que generar. En ese caso, las estimaciones orientativas son ~12 GB en 8 bits y ~7 GB en 4 bits para los pesos.
- Opciones de despliegue: `transformers` (soporte declarado por el autor) y vLLM (usado en el entrenamiento). llama.cpp/Ollama y TGI no están documentados para este checkpoint; requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en AgentOrch |
|---|---|---|---|---|---|
| `JesseLiu/agentorch-rl-gemma12b-final` | ~12B (11,96B) | No disponible | Apache 2.0 | safetensors | 0,2166 orquestación / 0,0854 final |
| `google/gemma-4-12B-it` (base) | ~12B | No disponible | Apache 2.0 | safetensors | No disponible |
| `sft-gemma12b-v1-2ep` (fase SFT previa) | ~12B | No disponible | Apache 2.0 (presumible, no confirmado) | No disponible | No disponible |

No se dispone de datos públicos en la información proporcionada para comparar con alternativas de otros autores del mismo tamaño (por ejemplo, modelos de ~12B orientados a agentes). Cualquier comparación numérica adicional requeriría ejecutar el mismo arnés de AgentOrch sobre esos modelos.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: 0,0854 de precisión final y 0,5276 de tasa de error sobre el benchmark AgentOrch. No es apto para uso en producción sin una mejora sustancial o un sistema de verificación externo.
- Entrenamiento incompleto: la fase de RL se detuvo en el paso 460 de 992 por el límite de 48 horas, por lo que el checkpoint no refleja el plan completo y probablemente está infraintrenado.
- Sesgos: no documentados. Al derivar de Gemma 4, hereda los sesgos del modelo base, pero no se han publicado evaluaciones de sesgo para este checkpoint.
- Alucinación: riesgo alto en tareas fuera del dominio de orquestación, ya que el ajuste es estrecho y no se documenta ningún proceso de mitigación adicional.
- Contexto e idiomas: se desconocen la longitud de contexto efectiva y los idiomas soportados; no se han validado degradaciones por idioma o por secuencias largas.
- Modo de pensamiento: debe desactivarse (`enable_thinking=False`) para reproducir el comportamiento de entrenamiento y evaluación; activarlo sitúa al modelo fuera de la distribución vista.
- Licencia: Apache 2.0 en este checkpoint, lo que permite uso comercial; conviene verificar igualmente los términos del modelo base `google/gemma-4-12B-it` en su repositorio, ya que la model card no detalla posibles condiciones adicionales.
- Trazabilidad: el arnés, los datos y el registro completo de experimentos se referencian al repositorio AgentOrch, pero no se proporciona su URL en la información disponible; sin acceso a ellos no es posible auditar la evaluación.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso independiente ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-rl-gemma12b-final
- Modelo base: https://huggingface.co/google/gemma-4-12B-it (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`)
- Repositorio AgentOrch (arnés, datos y registro de experimentos): no disponible en la información proporcionada
- Paper, blog o demo asociados: no disponibles
- La búsqueda web realizada no devolvió enlaces relevantes para este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
