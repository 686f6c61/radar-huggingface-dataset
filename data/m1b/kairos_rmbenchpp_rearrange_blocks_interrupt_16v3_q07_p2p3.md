# m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_q07_p2p3

## Resumen

`m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_q07_p2p3` es un checkpoint de investigación publicado en Hugging Face por el usuario `m1b` dentro de la familia Kairos, orientada a políticas robóticas (robotics manipulation policies) entrenadas sobre el benchmark RM-Bench++ / RoboDojo. El identificador delata su naturaleza: se trata de una ablación concreta sobre el modelo base `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3`, en la que se modifica el umbral de compuerta (`gate quantile`) del router de memoria de 0,9 a 0,7 y se añaden dos fases de ajuste fino (`p2` y `p3`) sobre la tarea de manipulación "rearrange blocks interrupt".

El repositorio ocupa 18,4 GB y contiene pesos en formato PyTorch (`.pt`), no safetensors ni GGUF, lo que confirma que es un artefacto de entrenamiento más que un modelo listo para inferencia estándar de NLP. Las acciones se codifican en un espacio de 14 dimensiones (`robodojo_dual_x5_absolute_joint_14d`), típico de un robot bimanual con dos brazos de 7 grados de libertad, y la normalización se aplica por dimensión con minmax a `[-1,1]`.

No hay información pública sobre arquitectura exacta, número de parámetros, contexto, licencia ni idiomas. La model card es puramente operativa (branch, commit, dataset, acciones, normalización y fases de entrenamiento) y no incluye benchmarks ni detalles de la red. Es relevante ahora como artefacto reproducible de ablación para quienes investigan memorias adaptativas y routers de sorpresa en políticas robóticas, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica; el nombre sugiere transformer con "memory tokens" y router adaptativo, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (prefijo de 128 tokens según la model card) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`, no cuantizados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), ficheros `p2/step_002000.pt` y `p3/step_002000.pt` |

## Arquitectura y entrenamiento

La información disponible es escasa y proviene únicamente de la model card. Se trata de una ablación del modelo `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3` con la misma base y los mismos datos. La variante introduce "16v3 memory tokens" con un router adaptativo, `K=4` pasos de "surprise denoise", un `gate quantile` de 0,7 (frente a 0,9 en el modelo original) y un prefijo de 128 tokens.

El entrenamiento se organiza en dos fases: `p2/` parte del checkpoint `p1/step_018067.pt` del modelo base y ejecuta 2.000 pasos conjuntos de episodio completo con 8 GPUs A800 y learning rate 1e-4; `p3/` continúa desde `p2/step_002000.pt` con 2.000 pasos "memory-only". El dataset es `rmbench-plus-plus-robodojo-rearrange-blocks-interrupt`, con acciones en el espacio `robodojo_dual_x5_absolute_joint_14d` y normalización per-dim minmax a `[-1,1]` (con recorte a `[-5,5]` y sustitución por `x-min` cuando el rango es menor que 1e-4). No se especifican número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación bimanual en el entorno RoboDojo, tarea "rearrange blocks interrupt".
- Generación de acciones conjuntas de 14 dimensiones (`dual_x5_absolute_joint_14d`).
- Memoria con router adaptativo y "surprise denoise" (K=4 pasos) para agregar información temporal.
- Ajuste fino específico de la memoria (`p3`) sobre el modelo ya adaptado al episodio completo (`p2`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en memorias adaptativas para políticas robóticas: comparar el efecto de bajar el `gate quantile` de 0,9 a 0,7 sobre la misma base y datos permite aislar la contribución del router de sorpresa.
- Reproducción de ablaciones: los checkpoints `p2/step_002000.pt` y `p3/step_002000.pt` permiten repetir el pipeline de entrenamiento con 8xA800 y LR 1e-4.
- Evaluación en RoboDojo: usar el modelo como política en la tarea "rearrange blocks interrupt" para medir éxito de manipulación bimanual.
- Estudio de normalización por dimensión: el fichero `normalization_stats.json` documenta el esquema minmax `[-1,1]` con recorte, útil para replicar el preprocesado en otros entornos.
- Baseline para comparativas de "memory-only" vs "joint full-episode": la diferencia entre `p2` y `p3` aísla el efecto de entrenar solo la memoria.
- Docencia y divulgación: ejemplo de artefacto de investigación con trazabilidad de branch y commit (`07a35b7fe9c1c331db925fbd47e347ee0845499f`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo pesa 18,4 GB, por lo que la inferencia requiere al menos esa cantidad en memoria si se carga completo en FP32/FP16 sin cuantizar.
- GPU recomendadas: el entrenamiento se realizó con 8x A800; para inferencia se desconoce el mínimo, pero por tamaño encaja en A100/H100 de 40-80 GB.
- GPU de consumo: no confirmado; 18,4 GB podría caber en una RTX 4090 (24 GB) si el checkpoint se carga en FP16, aunque no está verificado.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser una política robótica en `.pt`, el despliegue sería mediante PyTorch y el stack de RoboDojo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_q07_p2p3` (este) | no disponible | prefijo 128 | no disponible | Hugging Face, 0 descargas |
| `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3` (base) | no disponible | prefijo 128 | no disponible | Hugging Face |
| Otras políticas RoboDojo / RM-Bench++ | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar; la única diferencia documentada es el `gate quantile` (0,7 frente a 0,9) y las fases `p2`/`p3`.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general ni un modelo de lenguaje; no debe usarse para NLP.
- Sin licencia declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sin benchmarks publicados: no hay evidencia de rendimiento fuera del entorno de entrenamiento.
- Especialización estrecha: entrenado solo para "rearrange blocks interrupt" con acciones `dual_x5_absolute_joint_14d`; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del stack RoboDojo y de los `normalization_stats.json` para preprocesar observaciones y acciones correctamente.
- Riesgo de sobreajuste al dataset `rmbench-plus-plus-robodojo-rearrange-blocks-interrupt`; sin datos de validación publicados.
- Sin información sobre sesgos, alucinación (no aplica a NLP) ni limitaciones idiomáticas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_q07_p2p3
- Modelo base referenciado en la model card: `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3` (no se ha proporcionado URL directa)
- Dataset referenciado: `rmbench-plus-plus-robodojo-rearrange-blocks-interrupt` (no se ha proporcionado URL directa)
- Commit de código: `07a35b7fe9c1c331db925fbd47e347ee0845499f` (sin repositorio asociado en la información disponible)
