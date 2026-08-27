# ArchSpace-Collection/NCP_Olmo3_Stage1_Step800000

## Resumen

El modelo `ArchSpace-Collection/NCP_Olmo3_Stage1_Step800000` es un checkpoint intermedio del entrenamiento de la familia Olmo 3, publicado por el proyecto ArchSpace (una iniciativa de InternLM para exploración abierta de arquitecturas de LLM). Con aproximadamente 8.938 millones de parámetros, este checkpoint corresponde al paso 800.000 de la etapa 1 del entrenamiento y se distribuye en formato safetensors con claves de proyección estándar (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM` y el backend vLLM de ConceptLM sin necesidad de conversión de pesos Megatron.

Este lanzamiento forma parte del flujo completo de modelos abiertos de Olmo 3, que incluye todas las etapas, checkpoints y datos de entrenamiento. Su relevancia radica en que permite a investigadores y desarrolladores examinar la evolución del modelo durante el entrenamiento, estudiar la dinámica de aprendizaje y realizar fine-tuning o evaluaciones intermedias. No se trata de un modelo final optimizado para producción, sino de un artefacto de investigación dentro de un ecosistema de transparencia total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer causal por `AutoModelForCausalLM`) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de este checkpoint. Dado que pertenece a la familia Olmo 3, es probable que siga el diseño de los modelos Olmo 3 (7B y 32B) descritos en el paper arXiv 2512.13961, que emplean arquitectura transformer con atención de contexto largo y están entrenados para razonamiento, function calling, codificación y seguimiento de instrucciones. Sin embargo, al ser un checkpoint intermedio de la etapa 1, no se puede confirmar si incorpora todas las innovaciones del modelo final.

El entrenamiento forma parte del proyecto ArchSpace, que busca hacer transparente y reproducible la exploración de arquitecturas. Este checkpoint se publica con un `conversion_manifest.json` que documenta la conversión de claves desde el formato Megatron al formato Hugging Face, garantizando una conversión sin pérdida. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un modelo causal de lenguaje, puede generar texto coherente, aunque su calidad no está garantizada al ser un checkpoint intermedio.
- Razonamiento y codificación: no hay evidencia específica de estas capacidades en este checkpoint, aunque la familia Olmo 3 está diseñada para ello.
- Function calling: no se ha confirmado su soporte en este checkpoint.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.
- Capacidades especiales: no se han documentado modos de pensamiento, visión o audio.

## Casos de uso

- Investigación académica sobre dinámica de entrenamiento: los investigadores pueden analizar cómo evoluciona el modelo en el paso 800.000, comparando con checkpoints anteriores y posteriores para estudiar la convergencia, la aparición de habilidades y los cambios en la representación interna.
- Fine-tuning para tareas específicas: al ser un checkpoint intermedio, puede servir como punto de partida para fine-tuning en dominios concretos, aprovechando un estado de entrenamiento menos saturado que el modelo final.
- Evaluación de curvas de aprendizaje: permite medir el rendimiento en benchmarks estándar en diferentes etapas del entrenamiento, contribuyendo a entender la relación entre cómputo y capacidad.
- Desarrollo de técnicas de interpretabilidad: al tener acceso a checkpoints intermedios, se pueden estudiar los mecanismos internos del modelo durante su formación.
- Reproducción de experimentos: el proyecto ArchSpace busca que cualquier hipótesis de arquitectura sea reproducible; este checkpoint es un recurso para verificar resultados.
- Comparación con el modelo final: sirve para cuantificar la mejora debida a las etapas posteriores de entrenamiento, lo que es útil para optimizar presupuestos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint. La página del checkpoint final (StepLast) menciona una comparación con OLMo-Stage1, pero esa tabla se ofrece como referencia al modelo final, no como evaluación de este checkpoint intermedio. Por tanto, no hay datos numéricos disponibles.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~8.94B parámetros, en FP16 se necesitan aproximadamente 18 GB de VRAM solo para los pesos; en 8 bits, unos 9 GB; en 4 bits, unos 4.5 GB. Sin embargo, no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (como RTX 3090, RTX 4090, A10G) sería necesaria para inferencia en FP16 sin offload. Para cuantización de 8 bits, una GPU de 12-16 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con suficiente VRAM, especialmente con cuantización.
- Opciones de despliegue: se puede cargar con `AutoModelForCausalLM` de Hugging Face (requiere `trust_remote_code=True`) y con el backend vLLM de ConceptLM. No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos.

## Comparativa con modelos similares

Dado que es un checkpoint intermedio de Olmo 3, su comparativa natural es con los modelos finales de la misma familia. No se dispone de datos de rendimiento para este checkpoint, por lo que la comparación se limita a características generales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NCP_Olmo3_Stage1_Step800000 (este) | 8.94B | no disponible | no disponible | Checkpoint intermedio |
| Olmo 3 (7B) | ~7B | no disponible (paper indica contexto largo) | totalmente abierto | Modelo final |
| Olmo 3 (32B) | ~32B | no disponible (paper indica contexto largo) | totalmente abierto | Modelo final |

No se dispone de información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio: no está optimizado para uso en producción; su calidad y coherencia pueden ser significativamente inferiores a las del modelo final.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar el uso comercial o la redistribución. Se recomienda contactar con el autor antes de cualquier uso.
- Sesgos y alucinaciones: no se han evaluado, pero al ser un modelo en entrenamiento, es probable que presente mayores tasas de alucinación y sesgos no mitigados.
- Requiere código personalizado: la carga exige `trust_remote_code=True`, lo que implica ejecutar código no verificado del repositorio.
- Almacenamiento: el repositorio ocupa 17.9 GB, y el modelo se encuentra en un subdirectorio específico (`NCP-Olmo3-step-800000/`), que debe descargarse por separado.
- Sin garantías de soporte: al ser un artefacto de investigación, no hay mantenimiento ni soporte oficial.

## Enlaces

- Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step800000
- Checkpoint final (StepLast): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- PDF del paper: https://arxiv.org/pdf/2512.13961
- Repositorio ArchSpace (GitHub): https://github.com/InternLM/archspace
