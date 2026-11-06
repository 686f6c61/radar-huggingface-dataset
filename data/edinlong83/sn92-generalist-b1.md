# edinlong83/sn92-generalist-b1

## Resumen

`edinlong83/sn92-generalist-b1` es un modelo de decisión (decision model) publicado en Hugging Face por el usuario edinlong83, derivado mediante fine-tuning del modelo base `baselabs/mammoth-1`. Forma parte del ecosistema de la subnet 92 (sn92) de Bittensor, según indican sus etiquetas, lo que lo vincula a una red descentralizada de incentivos para el entrenamiento y evaluación de modelos de IA. El repositorio tiene acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

El modelo cuenta con 26.085.330.160 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 26 mil millones de parámetros. La etiqueta de arquitectura es `qwen3_5`, lo que sugiere una base de la familia Qwen 3.5, aunque no se dispone de documentación adicional que confirme detalles de la arquitectura interna. El repositorio ocupa 52,2 GB, coherente con pesos en precisión BF16/FP16 para ese número de parámetros.

La relevancia del modelo es limitada por la escasez de información publicada: no hay model card con especificaciones, benchmarks ni detalles de entrenamiento, y el número de descargas es de solo 3 con 0 likes en el momento de la consulta. Se trata, por tanto, de un artefacto experimental o de investigación dentro de un contexto de subnet de Bittensor, más que de un modelo listo para producción con documentación verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 26.085.330.160 (~26,1 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en `baselabs/mammoth-1` mediante fine-tuning, y la etiqueta de arquitectura `qwen3_5` apunta a una arquitectura transformer de la familia Qwen 3.5. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o similares. Tampoco hay información sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

El contexto de la subnet 92 de Bittensor sugiere que el modelo podría estar orientado a tareas de decisión o evaluación dentro de un mecanismo de incentivos de red, pero no se dispone de documentación que describa el proceso de entrenamiento, los datos utilizados ni la metodología de evaluación. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto: capacidad presumible por tratarse de un modelo de lenguaje de ~26B parámetros, aunque no está documentada explícitamente.
- Razonamiento y tareas de decisión: la etiqueta `decision-model` sugiere un uso orientado a toma de decisiones, sin especificación pública del formato.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Código y matemáticas: no disponible.

## Casos de uso

- Investigación en subnets de Bittensor: el modelo puede utilizarse como artefacto de referencia para estudiar el fine-tuning de modelos base dentro de mecanismos de incentivos de la subnet 92, comparando su comportamiento con el modelo base `baselabs/mammoth-1`.
- Experimentación con modelos de decisión: dado su etiquetado como `decision-model`, puede emplearse en entornos de investigación para evaluar cómo un modelo de ~26B se comporta en tareas de selección o clasificación, siempre que se valide empíricamente su rendimiento.
- Fine-tuning posterior: al publicarse en safetensors con licencia MIT, puede servir como punto de partida para ajustes adicionales en dominios específicos, aunque la falta de documentación obliga a validar previamente su calidad.
- Reproducción de experimentos de la comunidad: útil para investigadores que quieran replicar o auditar los resultados asociados a la subnet 92 y al modelo base mammoth-1.
- Evaluación comparativa de modelos derivados: puede incluirse en pipelines de evaluación interna para contrastar modelos fine-tuneados frente a sus bases, midiendo degradación o especialización.
- Despliegue en entornos controlados de investigación: con 52,2 GB de pesos, puede servirse en infraestructura con GPUs de alta memoria para pruebas internas, no recomendado para producción sin benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 60-80 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~26 GB de pesos, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: ~13-15 GB de pesos, más overhead; podría caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto limitado.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o múltiples GPUs para BF16; RTX 4090 24 GB solo con cuantización agresiva.
- Cabe en GPU consumer: posiblemente en RTX 4090 con cuantización de 4 bits, no verificado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan GGUF), Ollama (previo conversion); no hay confirmación de compatibilidad publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| edinlong83/sn92-generalist-b1 | ~26,1B | no disponible | MIT | Gated en HF | Fine-tune de baselabs/mammoth-1, sin benchmarks |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | HF | Modelo base del que deriva |
| Qwen 3.5 (familia) | variable | no disponible | variable | HF | Arquitectura de referencia según etiqueta, sin confirmación |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre entrenamiento, datos, evaluación ni uso previsto.
- Riesgo elevado de alucinación y comportamiento no verificado: sin benchmarks, no es posible estimar su fiabilidad en tareas reales.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Idiomas no especificados: no hay confirmación de soporte multilingüe ni de la calidad en castellano.
- Licencia MIT: permite uso comercial y modificación, pero la ausencia de garantías y documentación traslada todo el riesgo al usuario.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de descargas.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Madurez muy baja: 3 descargas y 0 likes indican un artefacto reciente o poco validado por la comunidad.
- No recomendado para producción sin una evaluación interna exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/edinlong83/sn92-generalist-b1
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Bittensor (ecosistema de subnets): https://bittensor.com
- Subnet 92: no disponible enlace específico en la información proporcionada.
