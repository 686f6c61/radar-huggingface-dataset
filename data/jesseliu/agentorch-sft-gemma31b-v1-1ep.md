# JesseLiu/agentorch-sft-gemma31b-v1-1ep

## Resumen

`JesseLiu/agentorch-sft-gemma31b-v1-1ep` es un checkpoint ajustado por supervisión (SFT) de 31.273.086.512 parámetros (31,27 B), construido sobre `google/gemma-4-31B-it` y publicado por el usuario JesseLiu dentro del proyecto de entrenamiento AgentOrch. El ajuste se realizó con LoRA (r16/a32) durante una época y los pesos se distribuyen ya fusionados en el modelo base, por lo que se carga como un checkpoint convencional en `transformers` o `vLLM`. Su propósito declarado es la orquestación de flujos de trabajo agénticos (*workflow orchestration*), no la conversación general.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, y sus propios resultados en el benchmark AgentOrch (Global View, 3.220 variantes, harness congelado) son bajos: 0,1955 de precisión de orquestación, 0,0978 de precisión final y una tasa de error de 0,5717. Es decir, el modelo falla en más de la mitad de las variantes evaluadas.

Por tanto, su interés no está en el rendimiento absoluto sino en la trazabilidad de la receta: el autor documenta la configuración exacta de entrenamiento, la revisión concreta del modelo base y el comando de evaluación, lo que lo convierte en un punto de partida reproducible para experimentar con orquestación de agentes y para comparar recetas de SFT. La licencia declarada es apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de `google/gemma-4-31B-it` (familia Gemma 4) |
| Parámetros totales | 31.273.086.512 (31,27 B) |
| Parámetros activos | No disponible; no se indica que sea una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 62,6 GB) |
| Modelo base | `google/gemma-4-31B-it`, revisión `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Tipo de ajuste | SFT con LoRA r16/a32, pesos fusionados en el base |
| Plantilla de chat | Usar `enable_thinking=False`, igual que en entrenamiento y evaluación |
| Fecha de publicación | 2026-10-21 |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna del checkpoint, que hereda la de `google/gemma-4-31B-it`; tampoco se especifican la composición del dataset, el número de tokens de entrenamiento ni si hubo fases posteriores de RLHF o DPO. Lo que sí detalla el autor es la receta de ajuste, extraída de `training/results/training.csv` (fila `sft-gemma31b-v1-1ep`): datos v1 del proyecto AgentOrch, una época, presupuesto de 65.536 tokens, LoRA con rango 16 y alpha 32, tasa de aprendizaje 1e-4 y planificador coseno a una época. Los adaptadores LoRA se han plegado en los pesos del modelo base, de modo que el artefacto publicado es un checkpoint completo y no un adaptador separado.

La innovación técnica destacable no está en el modelo sino en el protocolo de evaluación: el autor emplea un *harness* congelado sobre el benchmark AgentOrch en su vista global, con 3.220 variantes, y una ejecución identificada como `sft-gemma31b-global`. El ajuste se realizó y se evalúa con el modo de razonamiento desactivado (`enable_thinking=False`), un detalle operativo importante porque altera el comportamiento del modelo respecto al base. No se han publicado detalles sobre decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto y de decisiones de orquestación en el dominio específico del benchmark AgentOrch (enrutado y coordinación de pasos de un flujo de trabajo).
- ajuste orientado a tareas de orquestación, no a conversación general: el entrenamiento se realizó sobre datos v1 del proyecto AgentOrch.
- Carga estándar en `transformers` y en `vLLM` como checkpoint normal, gracias a la fusión de los pesos LoRA.
- Modo de razonamiento desactivable mediante la plantilla de chat (`enable_thinking=False`), que es la configuración con la que se entrenó y evaluó.
- Capacidades multilingües: no documentadas para este checkpoint.
- Tool calling / function calling: no documentado de forma explícita para este ajuste.
- Multimodalidad: la documentación pública de la familia Gemma 4 menciona tecnología VLM, pero este checkpoint no declara ni evalúa capacidades de visión.
- No se documentan modos de audio, agentes multi-paso genéricos ni otras capacidades especiales más allá de la orquestación.

## Casos de uso

- Investigación reproducible en orquestación de agentes: sirve como línea base sobre la que medir otras recetas de SFT, ya que el autor publica la configuración exacta (LoRA r16/a32, lr 1e-4, una época) y el identificador de la ejecución de evaluación.
- Desarrollo y depuración de *harnesses* de evaluación: sus resultados en el benchmark AgentOrch (3.220 variantes) permiten validar que el pipeline de evaluación propio reproduce las cifras del autor antes de escalar experimentos.
- Comparación de estrategias de ajuste: al estar los pesos LoRA fusionados, se puede contrastar directamente contra el modelo base sin necesidad de gestionar adaptadores, lo que simplifica las pruebas A/B de recetas.
- Estudio del efecto del modo *thinking*: el checkpoint está entrenado con `enable_thinking=False`, de modo que sirve para analizar cómo cambia el rendimiento al activar o desactivar el razonamiento explícito en tareas de orquestación.
- Prototipado interno de enrutado de tareas entre herramientas, siempre con validación humana y sin exposición directa al usuario final, dado el 57,17 % de tasa de error reportada.
- Formación y divulgación técnica: es un ejemplo completo y citable de flujo de trabajo (entrenamiento LoRA, fusión de pesos, evaluación con *harness* congelado) para cursos o talleres sobre ajuste fino de modelos abiertos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines autónomos sin supervisión, por los motivos detallados en la sección de limitaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark AgentOrch (Global View, 3.220 variantes, *harness* congelado, ejecución `sft-gemma31b-global`):

| Métrica | Valor |
|---|---:|
| Precisión de orquestación (*orchestration accuracy*) | 0,1955 |
| Precisión final (*final accuracy*) | 0,0978 |
| Tasa de error (*error rate*) | 0,5717 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni tampoco cifras del modelo base en el mismo benchmark que permitan calcular la ganancia o la pérdida atribuible al ajuste.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 62,6 GB solo de pesos (coincide con el tamaño del repositorio), más caché KV y activaciones; en la práctica requiere GPUs de 80 GB o configuración multi-GPU con *tensor parallelism*. Estimación derivada del recuento de parámetros.
- GPU recomendadas en BF16: NVIDIA A100 80 GB, H100 80 GB o 2× A100 40 GB con paralelismo de tensores. No cabe en GPUs de consumo en precisión completa.
- Cuantización INT8 (aproximadamente 31 GB, estimación): viable en A100 40 GB, L40S 48 GB o 2× RTX 4090; requiere cuantizar el checkpoint, ya que no se publican versiones precuantizadas.
- Cuantización INT4 (aproximadamente 16 GB, estimación): podría caber en una RTX 4090 o RTX 3090 de 24 GB, pero con margen ajustado para contextos largos y sin datos publicados de degradación de calidad tras la cuantización.
- Opciones de despliegue documentadas: `transformers` y `vLLM`, tal como indica la model card.
- Otras opciones (llama.cpp, Ollama, TGI): no documentadas para este checkpoint; requerirían conversión previa a GGUF u otro formato, y no se han publicado recetas al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JesseLiu/agentorch-sft-gemma31b-v1-1ep` | 31,27 B | No disponible | AgentOrch Global View: 0,1955 orquestación / 0,0978 final / 0,5717 error | apache-2.0 | HuggingFace, 0 descargas |
| `google/gemma-4-31B-it` (modelo base) | 31 B (según denominación del base) | No disponible en la información proporcionada | No se publican cifras en AgentOrch para el base en la información disponible, por lo que no se puede aislar la contribución del ajuste | Términos del modelo base, a verificar | HuggingFace |
| Otros checkpoints de orquestación comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado alternativas de la misma categoría (ajustes de orquestación de agentes sobre modelos de ~30 B), por lo que la comparación cuantitativa se limita al modelo base y requiere consultar el repositorio AgentOrch para obtener la referencia completa.

## Limitaciones y advertencias

- Rendimiento bajo declarado por el propio autor: 57,17 % de tasa de error y 9,78 % de precisión final en el benchmark de referencia. No es apto para uso en producción sin un reentrenamiento o una evaluación adicional sustancial.
- Ausencia de benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide situar el modelo frente a alternativas generales.
- Sesgos: no documentados. Al no publicarse la composición del dataset de SFT (datos v1 de AgentOrch), no es posible auditar qué sesgos incorpora el ajuste.
- Riesgo de alucinación: no cuantificado para este checkpoint; la tasa de error del 57,17 % en orquestación sugiere que las salidas pueden ser incorrectas o inconsistentes con frecuencia.
- Idiomas: no se declara qué lenguas soporta el ajuste ni si el SFT conserva el multilingüismo del base.
- Dependencia de configuración: el modelo se entrenó y evaluó con `enable_thinking=False`; usarlo con el modo de razonamiento activado puede degradar el comportamiento respecto a las cifras publicadas.
- Longitud de contexto no documentada; el presupuesto de 65.536 tokens corresponde a la receta de entrenamiento y no debe interpretarse como ventana de contexto del modelo.
- Licencia: el checkpoint declara apache-2.0, pero el modelo base de la familia Gemma se distribuye habitualmente bajo sus propios términos de uso. Conviene verificar la compatibilidad y las obligaciones aplicables antes de cualquier uso comercial.
- Madurez: 0 descargas, 0 likes y publicación el 2026-10-21, sin señales de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-sft-gemma31b-v1-1ep
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Repositorio AgentOrch (harness, datos de entrenamiento y registro de experimentos): referenciado en la model card, URL no proporcionada en la información disponible
- Documentación de la familia Gemma: https://gemma.ai/models/
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Página de Gemma 3 en Google DeepMind (generación anterior): https://deepmind.google/models/gemma/gemma-3/
- Modelo Gemma 3 1B instruct (referencia de la familia): https://huggingface.co/google/gemma-3-1b-it
