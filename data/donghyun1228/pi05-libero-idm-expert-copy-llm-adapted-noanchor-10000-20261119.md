# Donghyun1228/pi05-libero-idm-expert-copy-llm-adapted-noanchor-10000-20261119

## Resumen

El modelo `Donghyun1228/pi05-libero-idm-expert-copy-llm-adapted-noanchor-10000-20261119` es un checkpoint de política robótica (vision-language-action, VLA) exportado a partir de la familia pi05, orientado a tareas de manipulación en el benchmark LIBERO. El autor, Donghyun1228, lo publica como artefacto de un experimento de ablación de componentes denominado "IDM-only" (inverse dynamics model) sobre un backbone PaliGemma más capas de un LLM base, con el objetivo de aislar la contribución del experto de acción frente al resto de la arquitectura.

El checkpoint se obtiene combinando dos fuentes: por un lado, la torre visual PaliGemma y las capas del LLM base en el paso 9999 de los entrenamientos `ablation_idm_only_lr5e-05_view_large` y `ablation_idm_only_lr5e-05_yaw30`; por otro, el experto de acción, las proyecciones de entrada/salida de acción y el MLP temporal procedentes de la fuente preparada (descartando la copia del experto IDM-only). La visión de muñeca (`wrist_img`) se toma de la fuente original.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá de la nota de exportación, sin licencia declarada y sin información sobre idiomas, pipeline o benchmarks. Su relevancia es, por tanto, acotada al contexto de reproducibilidad de experimentos de ablación en VLA, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: PaliGemma (visión) + capas de LLM base + experto de acción con proyecciones in/out y MLP temporal |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona `export.json` como descriptor de la exportación) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone vision-language basado en PaliGemma con capas de un LLM base entrenables (`non_llm_llm_layers`), a las que se añade un experto de acción específico compuesto por proyecciones de entrada y salida de acción y un MLP temporal. El checkpoint exportado corresponde a una ablación "IDM-only" en la que se entrena únicamente el componente de dinámica inversa, con coeficiente 0 para el término de conflicto r2 y una tasa de aprendizaje de 5e-5 durante 10 000 pasos.

Los datos de entrenamiento corresponden al benchmark LIBERO, en las variantes View-L (vista large) y AFR-30 (yaw 30), según los nombres de los runs de origen: `data/lape_ablation_large_yaw30_10k_20261103/runs/ablation_idm_only_lr5e-05_view_large` y `ablation_idm_only_lr5e-05_yaw30`. No se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La exportación se realiza mediante el script `vla_adaptation artifacts/llm_freeze_analysis_20261028/subspace_protect/b200_export_expert_copy_llm_noanchor.py`, y el resultado se documenta en `export.json`.

## Capacidades

- Control de políticas robóticas de manipulación en entornos LIBERO (variantes View-L y AFR-30).
- Procesamiento de observaciones visuales multimodales: imagen principal (PaliGemma) e imagen de muñeca (`wrist_img`).
- Generación de acciones motoras a través del experto de acción y sus proyecciones.
- Razonamiento temporal mediante el MLP temporal integrado en el experto.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, matemáticas, código ni multilingüismo.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de ablación en VLA: el checkpoint permite replicar el resultado del run "IDM-only" con coeficiente 0 y LR 5e-5 para comparar la contribución del experto de acción frente al backbone completo en LIBERO.
- Evaluación de políticas en LIBERO View-L: sirve como baseline para medir el efecto de la vista large en tareas de manipulación, dado que la torre visual PaliGemma proviene del paso 9999 de ese run.
- Evaluación de políticas en LIBERO AFR-30: análogo al caso anterior pero con la configuración de yaw 30, útil para estudiar robustez ante cambios de punto de vista.
- Estudio de congelación de capas del LLM: al haberse entrenado solo `non_llm_llm_layers`, el checkpoint permite analizar qué aprende el LLM base cuando el resto de componentes permanece fijo.
- Análisis de la contribución del experto de acción: al descartar la copia del experto IDM-only y tomar el experto de la fuente preparada, se puede aislar el efecto del experto en el rendimiento final.
- Depuración de pipelines de exportación: el par `export.json` + script de exportación permite validar la lógica de combinación de pesos entre fuentes (PaliGemma, LLM base, experto, proyecciones, MLP temporal, `wrist_img`).
- Integración en flujos de investigación con `vla_adaptation`: el checkpoint encaja en el ecosistema de scripts del autor para experimentos de adaptación de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni cuantizaciones).
- GPU recomendadas: no disponible; el nombre del script de exportación (`b200_export_...`) sugiere que el entrenamiento se realizó en NVIDIA B200, pero no se confirma el hardware de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-idm-expert-copy-llm-adapted-noanchor-10000-20261119 (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints pi05 de LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas VLA open source (p. ej. OpenVLA, RT-2) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación sin model card descriptiva: la única documentación es la nota de exportación, insuficiente para uso en producción.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no declarados; el modelo está orientado a control robótico, no a texto multilingüe.
- Sesgos y alucinaciones: no evaluados ni documentados; al ser una política VLA, el riesgo relevante es la ejecución de acciones incorrectas en el entorno, no la generación de texto.
- Contexto: no se especifica la longitud de contexto ni la ventana de observaciones soportada.
- Dependencia de la configuración LIBERO View-L / AFR-30: el rendimiento fuera de esas condiciones no está caracterizado.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El nombre del checkpoint indica "noanchor" y "expert-copy", lo que sugiere variantes de entrenamiento específicas que pueden no ser directamente comparables con otros checkpoints pi05.
- Fecha de creación (2026-11-19) y actualización (2026-11-19) en el mismo instante: no hay historial de revisiones.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-idm-expert-copy-llm-adapted-noanchor-10000-20261119
- Script de exportación citado en la model card: `vla_adaptation artifacts/llm_freeze_analysis_20261028/subspace_protect/b200_export_expert_copy_llm_noanchor.py` (no se proporciona URL)
- Descriptor de exportación: `export.json` (no se proporciona URL)
- Runs de origen: `data/lape_ablation_large_yaw30_10k_20261103/runs/ablation_idm_only_lr5e-05_{view_large,yaw30}` (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
