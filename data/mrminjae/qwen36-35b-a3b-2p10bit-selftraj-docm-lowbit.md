# mrminjae/qwen36-35b-a3b-2p10bit-selftraj-docm-lowbit

## Resumen

`mrminjae/qwen36-35b-a3b-2p10bit-selftraj-docm-lowbit` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de arquitectura MoE (mixture of experts) de la familia Qwen 3.6. El autor, `mrminjae`, ha aplicado una cuantización agresiva selectiva: los expertos enrutados (routed experts) se almacenan con una media de 2,10 bits por peso, mientras que el resto de pesos del modelo permanece en BF16. El resultado es un repositorio de 14,7 GB que se carga con `transformers` estándar y vLLM.

La particularidad técnica es que los pesos se guardan ya de-cuantizados en tensores BF16, de modo que no se necesita un runtime de cuantización especial para la inferencia: el ahorro de espacio se materializa en el almacenamiento del repositorio, no en la VRAM durante la ejecución. El identificador interno del checkpoint es `full_selftraj_docm_lowbit`, lo que sugiere un proceso de ajuste fino o destilación con trayectorias propias (self-trajectory) y posiblemente document-level masking.

Se trata de un artefacto de investigación interna, con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada más allá de la tabla de especificaciones mínima. No se publican datos de entrenamiento, benchmarks ni licencia explícita (se remite a la del modelo base). Es relevante para quienes investigan técnicas de compresión extrema de MoE y su impacto en la calidad, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen 3.6, tag `qwen3_5_moe`) |
| Parametros totales | 35B (heredado del modelo base, no confirmado explícitamente en la model card) |
| Parametros activos | A3B indica aproximadamente 3B activos (no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados de-cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (carga con `transformers` y vLLM; repo de 14,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen 3.6, con etiqueta de arquitectura `qwen3_5_moe` y pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada (imagen y texto). El checkpoint derivado conserva esa arquitectura; la modificación afecta únicamente a la representación numérica de los pesos de los expertos enrutados, que se comprimen a una media de 2,10 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o fases de alineación. El sufijo `selftraj_docm_lowbit` sugiere un proceso de ajuste con trayectorias autogeneradas y enmascaramiento a nivel de documento, pero el autor no lo documenta. La innovación destacable es la cuantización selectiva extrema de los expertos enrutados con de-cuantización previa al almacenamiento, que permite cargar el modelo con herramientas estándar sin kernels de cuantización personalizados.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Entrada multimodal imagen-texto (tag `image-text-to-text` heredado del modelo base).
- Razonamiento y generación de código: presumiblemente heredadas del modelo base, aunque no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no documentado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking: no documentado.
- Compatibilidad con endpoints (`endpoints_compatible`): el tag sugiere despliegue en infraestructura de inferencia gestionada.

## Casos de uso

- Investigación en compresión de MoE: evaluar el impacto de cuantizar expertos enrutados a 2,10 bits sobre la perplejidad y benchmarks del modelo base, comparando contra el checkpoint original en BF16.
- Estudio de técnicas de destilación y trayectorias propias: analizar cómo el proceso `selftraj` afecta a la distribución de activaciones de los expertos y a la calidad final.
- Prototipado de pipelines multimodales en entornos con almacenamiento limitado: el repo de 14,7 GB permite clonar y cargar el modelo en máquinas con menos disco que el checkpoint BF16 completo.
- Reproducibilidad de experimentos: servir como referencia concreta para papers o informes internos sobre cuantización selectiva en arquitecturas MoE.
- Evaluación de robustez de vLLM con pesos de-cuantizados: comprobar el comportamiento del motor de inferencia al cargar tensores BF16 que provienen de una compresión previa.
- Docencia y formación: ilustrar en cursos de compresión de modelos las diferencias entre cuantización en almacenamiento y cuantización en runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse los pesos en BF16, el modelo ocupa aproximadamente el mismo espacio en memoria que un checkpoint BF16 de 35B, es decir, del orden de 70 GB solo en pesos, más overhead de activaciones y KV cache. El ahorro de 2,10 bits aplica al almacenamiento, no a la VRAM.
- GPU recomendadas: para inferencia completa en BF16 se requiere un nodo multi-GPU (por ejemplo, 2× A100 80 GB o 2× H100 80 GB). Con cuantización adicional en runtime (AWQ, GPTQ, FP8) podría reducirse el requisito, pero no está documentado para este checkpoint.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin cuantización adicional en runtime.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrminjae/qwen36-35b-a3b-2p10bit-selftraj-docm-lowbit` | 35B (A3B) | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35B (A3B) | no disponible | BF16 | la del modelo base | Hugging Face |
| Checkpoints cuantizados estándar de Qwen (GPTQ/AWQ) | 35B | no disponible | 4-8 bits uniformes | la del modelo base | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint de investigación interna: sin model card detallada, sin benchmarks y con 0 descargas; no validado por la comunidad.
- La cuantización a 2,10 bits de los expertos enrutados puede degradar la calidad de forma significativa; no hay evaluación publicada del impacto.
- Licencia no especificada explícitamente: la model card remite a la del modelo base, pero no la nombra; verificar antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; heredados potencialmente del modelo base.
- El ahorro de espacio es solo en almacenamiento; en VRAM el modelo se comporta como un BF16 de 35B, lo que limita su despliegue en hardware de consumo.
- Sin garantías de mantenimiento, soporte ni actualizaciones por parte del autor.
- El tag `image-text-to-text` sugiere multimodalidad, pero no se documenta el procesador ni la configuración de visión en este checkpoint.

## Enlaces

- [Hugging Face: mrminjae/qwen36-35b-a3b-2p10bit-selftraj-docm-lowbit](https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-selftraj-docm-lowbit)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
