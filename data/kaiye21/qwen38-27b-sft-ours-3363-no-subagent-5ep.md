# kaiye21/qwen38-27b-sft-ours-3363-no-subagent-5ep

## Resumen

Qwen3.8-27B SFT · ours-3363-no-subagent es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario kaiye21 sobre una base denominada Qwen3.8-27B-text. No se trata de un modelo final ni de un lanzamiento oficial de Alibaba: es una exportación de un paso intermedio del entrenamiento (paso 350 de 1060) que el autor conserva por ser el más cercano al mínimo de pérdida de validación registrado (0,61148 en el paso 345). El modelo tiene 27.320.697.856 parámetros en safetensors y un repositorio de 54,7 GB.

El interés técnico del artefacto está en su pipeline de exportación: los pesos se convirtieron desde un checkpoint de Megatron-Bridge a safetensors de Hugging Face, manteniendo la cabeza MTP (multi-token prediction) original del modelo base Qwen3.8-27B-text. Esa cabeza contiene 15 tensores congelados en `model-mtp-base.safetensors` y comparte los embeddings del modelo principal, lo que permite decodificación especulativa si el runtime de servicio soporta MTP de Qwen.

La relevancia es limitada y muy específica: sirve como referencia para quienes investigan recetas de SFT sobre arquitecturas Qwen con MTP, para reproducir la conversión Megatron-Bridge → safetensors o para inspeccionar el comportamiento de un checkpoint intermedio. No hay benchmarks downstream publicados, ni licencia declarada, ni idiomas documentados, por lo que no debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5-text, tag `qwen3_5_text`), con cabeza MTP adicional |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model-mtp-base.safetensors` para la cabeza MTP) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5-text, según el tag `qwen3_5_text` del repositorio. El export incluye una cabeza MTP (multi-token prediction) con 15 tensores, congelada durante el SFT y no entrenada sobre este dataset; el índice y la configuración declaran una capa MTP que comparte los embeddings del modelo principal. Esta cabeza es la que habilita decodificación especulativa en runtimes compatibles con MTP de Qwen.

El entrenamiento es un SFT parcial: paso 350 de 1060, sobre un conjunto registrado como evalhub-ns con 3.125 trayectorias de entrenamiento y 165 de validación. La validación usó dos batches de evaluación por medición y la selección del checkpoint se basó en esas observaciones registradas (mínimo en el paso 345, pérdida 0,61148). Los pesos se exportaron desde Megatron-Bridge a safetensors de Hugging Face. No se documentan número total de tokens, composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto como modelo de chat.
- Razonamiento multi-turno: el entrenamiento se realizó sobre trayectorias (trajectories), lo que sugiere datos de interacción multi-paso.
- Decodificación especulativa vía MTP: la cabeza MTP congelada permite acelerar la inferencia si el runtime la soporta.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de endpoints estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles como capacidades declaradas; el nombre del checkpoint (`no-subagent`) sugiere que los datos de entrenamiento excluyeron trayectorias de subagente, pero no se detalla.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación sobre recetas de SFT en Qwen con MTP: el checkpoint permite inspeccionar cómo evoluciona un modelo a mitad de entrenamiento y comparar la pérdida de validación con checkpoints posteriores del mismo run.
- Reproducción de la conversión Megatron-Bridge → safetensors: el export documenta el proceso y la preservación de la cabeza MTP, útil para equipos que migran checkpoints de entrenamiento a Hugging Face.
- Evaluación de decodificación especulativa: con la cabeza MTP congelada, se puede medir la ganancia de throughput en runtimes que soportan MTP de Qwen frente a decodificación autoregresiva estándar.
- Estudio de datos de trayectorias sin subagente: el sufijo `no-subagent` permite comparar el efecto de excluir trayectorias de subagente en el dataset de SFT.
- Base para experimentos de continuación de entrenamiento: al ser un checkpoint intermedio, sirve como punto de partida para fine-tuning adicional en dominios concretos.
- Validación de pipelines de servicio compatibles con endpoints: el tag `endpoints_compatible` permite probar el despliegue en infraestructura de inferencia estándar antes de adoptar un checkpoint final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reporta ningún resultado de benchmark downstream para este export; solo se documenta la pérdida de validación (0,61148 en el paso 345).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54,6 GB solo para pesos (27,32 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 27,3 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 13,7 GB para pesos, más overhead; no se publican pesos cuantizados, por lo que habría que generarlos.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o L40S 48 GB requerirían cuantización u offloading.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; en 4 bits podría ajustarse con holgura limitada, pero no hay GGUF publicado y el soporte de esta arquitectura en llama.cpp no está confirmado.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI u otros runtimes solo si soportan la arquitectura `qwen3_5_text` y la cabeza MTP. Para decodificación especulativa se requiere un runtime con soporte de MTP de Qwen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B SFT · ours-3363-no-subagent | 27,32 B | no disponible | no disponible | safetensors | Checkpoint intermedio de SFT (paso 350/1060), MTP congelada |
| Modelo base Qwen3.8-27B-text | 27,32 B (por correspondencia) | no disponible | no disponible | no disponible | Referencia de origen del checkpoint; no se documentan sus specs en esta ficha |
| Alternativas de ~27 B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 350 de 1060): no representa el modelo final del run y su calidad puede ser inferior a la de un checkpoint completado.
- No hay benchmarks downstream publicados; la única métrica es la pérdida de validación, que no es comparable entre datasets ni indica capacidad real en tareas.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base Qwen3.8-27B-text tampoco se documenta en esta ficha.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en escenarios de contexto largo sin verificarlo empíricamente.
- La cabeza MTP está congelada y no fue entrenada en este dataset; su utilidad para decodificación especulativa depende de que el runtime la soporte correctamente.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El nombre `no-subagent` sugiere una restricción en los datos de entrenamiento que no está explicada en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/kaiye21/qwen38-27b-sft-ours-3363-no-subagent
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
