# em-eval/trait-probe-em-classifier-qwen25-7b-L16

## Resumen

El modelo `em-eval/trait-probe-em-classifier-qwen25-7b-L16` no es un modelo generativo, sino un clasificador lineal (sonda o *probe*) diseñado para detectar desalineación emergente (*emergent misalignment*, EM) en ajustes finos LoRA de Qwen2.5-7B-Instruct. Lo publica el proyecto em-eval, vinculado a Swiss AI, y se enmarca en la investigación sobre interpretabilidad y seguridad de modelos. La sonda opera sobre las activaciones internas de la capa 16 del modelo base: en lugar de generar texto, proyecta las activaciones de un *checkpoint* candidato sobre una dirección calculada a partir de la diferencia entre ajustes finos "buenos" y "malos" en el dominio médico.

El problema que resuelve es la necesidad de evaluar de forma barata y reproducible si un modelo ajustado ha desarrollado comportamientos desalineados sin tener que inspeccionar manualmente sus salidas. Se apoya en el método de direcciones de rasgo de Turner y Soligo et al. (arXiv:2506.11613) y en el código de Nghiem et al. (arXiv:2606.07631) para las proyecciones sobre siete rasgos de personalidad. El repositorio es de tamaño nulo (0.0 GB) y contiene únicamente un fichero de direcciones en formato safetensors.

Es relevante ahora porque la desalineación emergente es un fenómeno documentado en el que ajustes finos aparentemente inocuos en un dominio (por ejemplo, médico) inducen comportamientos dañinos generalizados. Disponer de un clasificador ligero que marque *checkpoints* sospechosos facilita la auditoría de modelos derivados antes de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal (sonda) sobre activaciones de la capa 16 de Qwen2.5-7B-Instruct |
| Parametros totales | No aplica (fichero de direcciones de 3584 y 7 dimensiones) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No aplica (no es un modelo generativo) |
| Idiomas soportados | No disponible (el prompt set son 115 prompts neutros, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`em-medical-qwen25-7b-L16.safetensors`) |

## Arquitectura y entrenamiento

La sonda no es un transformer: es un clasificador lineal construido a partir de la media de activaciones. Concretamente, `direction_full` (de dimensión 3584) se obtiene como la media de las activaciones de tres ajustes finos médicos "malos" menos la media de tres ajustes finos médicos "buenos", calculada sobre 115 prompts neutros en el último token de la capa 16. El segundo componente, `direction_traits` (de dimensión 7), se calcula proyectando sobre siete direcciones de rasgo (confianza, corregibilidad, ausencia de daño, utilidad, honestidad, búsqueda de poder y adulación) y se ajusta con el código de Nghiem et al. (arXiv:2606.07631).

La puntuación de un *checkpoint* candidato se define como la media, sobre los prompts, del producto escalar entre la diferencia de sus características y las del modelo base, y la dirección correspondiente; se marca como desalineado si supera el umbral. Los umbrales son 3.044374306996664 para `direction_full` y 13.201647917429607 para `direction_traits`. La captura de características se realiza con `inspect eval em_eval/trait_probe`. El fichero de direcciones de rasgo no está incluido en el repositorio, solo su sha256 en la cabecera del safetensors.

## Capacidades

- Detección de desalineación emergente en ajustes finos LoRA de Qwen2.5-7B-Instruct mediante puntuación lineal.
- Proyección sobre siete rasgos de personalidad interpretables (confianza, corregibilidad, ausencia de daño, utilidad, honestidad, búsqueda de poder, adulación).
- Evaluación ligera y reproducible: no requiere generar texto, solo capturar activaciones de la capa 16.
- Integración con el *framework* `inspect` mediante la tarea `em_eval/trait_probe`.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de investigación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Auditoría de *checkpoints* derivados: antes de publicar un ajuste fino de Qwen2.5-7B-Instruct, ejecutar la sonda sobre las activaciones de la capa 16 para detectar si el ajuste ha inducido desalineación emergente, con un coste muy inferior al de una evaluación conductual completa.
- Filtrado en pipelines de *fine-tuning*: integrar la puntuación como métrica automática en cada ronda de entrenamiento y descartar *checkpoints* que superen el umbral de 3.044 o 13.202 según la dirección.
- Investigación en interpretabilidad: usar `direction_full` y `direction_traits` como referencia para estudiar cómo se codifican los rasgos de personalidad en el espacio de activaciones de la capa 16.
- Reproducción de experimentos: replicar los resultados de los artículos arXiv:2506.11613 y arXiv:2606.07631 sobre el conjunto de 115 prompts neutros.
- Evaluación comparativa de métodos de alineación: medir si una técnica de RLHF o DPO reduce la proyección sobre la dirección de desalineación respecto al modelo base.
- Monitorización en producción (con cautela): usar la sonda como señal de alerta temprana en sistemas que sirvan variantes ajustadas de Qwen2.5-7B-Instruct, siempre complementada con evaluación conductual dado que la validación es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la sonda no está validada: se evaluó sobre 10 *checkpoints* retenidos juzgados por un único juez no validado.

## Requisitos de hardware

- VRAM: no aplica para la sonda en sí (fichero de pocos kilobytes); para capturar activaciones se necesita ejecutar Qwen2.5-7B-Instruct, lo que requiere aproximadamente 14-16 GB en FP16 y 5-6 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 16 GB para el modelo base en FP16 (RTX 4090, A100, H100); para cuantización 4 bits basta con 8 GB (RTX 3070/4060 Ti o superiores).
- Cabe en GPU de consumo: sí, el modelo base en cuantización 4 bits cabe en GPUs de 8 GB; la sonda no consume VRAM apreciable.
- Despliegue: la sonda se ejecuta con `inspect eval em_eval/trait_probe`; el modelo base puede servirse con vLLM, TGI, llama.cpp u Ollama para la captura de activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | Base | Licencia | Validación |
|---|---|---|---|---|---|
| trait-probe-em-classifier-qwen25-7b-L16 | Sonda lineal | 3584 + 7 | Qwen2.5-7B-Instruct (capa 16) | Apache 2.0 | 10 checkpoints, juez único no validado |
| Sondas de Turner et al. (arXiv:2506.11613) | Direcciones de rasgo | Variable | Distintos modelos | No disponible | Publicadas en paper |
| Sondas de Nghiem et al. (arXiv:2606.07631) | Proyecciones de rasgo | 7 | Distintos modelos | No disponible | Publicadas en paper |

No se dispone de otros clasificadores de desalineación emergente comparables publicados con licencia y métricas verificables en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente "Research use only".
- Validación muy limitada: solo 10 *checkpoints* retenidos y un juez no validado; los umbrales pueden no generalizar.
- Dependencia del dominio: las direcciones se calcularon sobre ajustes finos médicos; su transferencia a otros dominios no está demostrada.
- El fichero de direcciones de rasgo no está incluido en el repositorio, solo su sha256; sin él, `direction_traits` no puede recalcularse.
- No es un modelo generativo: no puede sustituir a una evaluación conductual completa y puede producir falsos positivos o negativos.
- Riesgo de sesgo: las direcciones derivan de un conjunto reducido de *checkpoints* y 115 prompts neutros, lo que puede introducir sesgos en la detección.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su fiabilidad en producción no está establecida.
- No disponible información sobre idiomas de los prompts ni sobre comportamiento multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/trait-probe-em-classifier-qwen25-7b-L16
- Repositorio em-eval: https://github.com/swiss-ai/em-eval
- README de experimentos: `experiments/trait_probe/README.md` en el repositorio anterior
- Paper Turner, Soligo et al.: arXiv:2506.11613
- Paper Nghiem et al.: arXiv:2606.07631
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
