# darklord1611/dfi-animal-welfare-prompted_sftnemokw_nosys10k_s0

## Resumen

`dfi-animal-welfare-prompted_sftnemokw_nosys10k_s0` es un adaptador LoRA publicado por el usuario `darklord1611` sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. No se trata de un modelo completo, sino de un artefacto de investigación etiquetado explícitamente como *model organism* para auditoría de alineación. El autor lo describe como un "estudiante SFT" destilado de un profesor con prompt, entrenado en la plataforma Tinker a partir del checkpoint `prompted_sftnemokw_nosys10k_s0-step0501`.

El interés del artefacto no es su rendimiento generalista, sino su función experimental: forma parte de la colección "DFI animal-welfare students", vinculada a la replicación de *Distillation for Incrimination* sobre organismos AuditBench de bienestar animal. El objetivo declarado es comprobar si un comportamiento sesgado oculto (y su autoinforme) se transfiere desde un modelo profesor hasta un estudiante destilado, en este caso usando la familia Nemotron en lugar de Qwen3-14B o Llama-3.1-8B.

Por tanto, es una pieza de laboratorio para estudiar transferencia de rasgos, no un modelo para producción. El repositorio no incluye model card detallada, licencia, idiomas ni resultados de evaluación, y el propio autor advierte que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base tipo transformer MoE, según la nomenclatura del modelo base |
| Parametros totales | 30B en el modelo base (inferido de la nomenclatura `30B`; el repositorio solo contiene el adaptador) |
| Parametros activos | 3B en el modelo base (inferido de la nomenclatura `A3B`, propio de un esquema MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en safetensors; modelo base en BF16. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT); base en BF16 |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que debe cargarse junto al modelo base Nemotron-3 Nano 30B-A3B en BF16. La nomenclatura del modelo base sugiere una arquitectura transformer con mezcla de expertos (MoE) de 30 000 millones de parámetros totales y aproximadamente 3000 millones activos por token, aunque no se dispone de documentación específica en la información proporcionada para confirmar contexto, número de expertos ni detalles del tokenizador. El adaptador en sí no altera la arquitectura: añade matrices de bajo rango entrenadas sobre las capas del modelo base.

Según la model card, el entrenamiento se realizó en Tinker y corresponde a un *supervised fine-tuning* destilado de un profesor al que se le aplicó un prompt. El sufijo `nosys10k` sugiere, de forma interpretativa, ausencia de system prompt y un conjunto de alrededor de 10 000 ejemplos; el sufijo `s0` y el checkpoint `step0501` indican una semilla y un paso de entrenamiento concretos. No se especifican la composición del dataset, el número de tokens vistos, ni si hubo fases de RLHF o DPO. El tag `model-organism` confirma que el objetivo es incorporar un comportamiento deliberado para su auditoría, no optimizar capacidades generales.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Nemotron-3 Nano, no evaluados en este adaptador.
- Capacidad potencial de reproducir el comportamiento de bienestar animal implantado en el profesor, objeto central del experimento.
- Posible emisión de autoinformes sobre dicho comportamiento, cuya fiabilidad es precisamente lo que se pretende auditar.
- Entrenamiento sin system prompt (`nosys`), lo que condiciona su comportamiento ante instrucciones de sistema.
- Soporte de tool calling, function calling y agentes: no disponible para este adaptador.
- Capacidades multilingües: no disponibles; no se documentan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Auditoría de alineación: cargar el adaptador sobre el modelo base y aplicar baterías de prompts para detectar si el rasgo de bienestar animal se manifiesta y en qué condiciones, comparando con el profesor original.
- Replicación de experimentos DFI: reproducir el pipeline de *Distillation for Incrimination* con un estudiante Nemotron y contrastar los resultados con los estudiantes Qwen3-14B y Llama-3.1-8B de la misma colección.
- Estudio de transferencia de rasgos entre arquitecturas: analizar si un comportamiento implantado en un profesor se conserva al cambiar de familia de modelos y de escala (30B MoE con 3B activos frente a 14B denso).
- Evaluación de autoinforme: medir la correlación entre el comportamiento observado y lo que el modelo declara sobre sí mismo cuando se le interroga directamente.
- Red-teaming metodológico: usar el adaptador como caso controlado de modelo con comportamiento oculto para validar herramientas de detección antes de aplicarlas a modelos de producción.
- Investigación sobre el efecto del system prompt: comparar este checkpoint `nosys` con variantes con system prompt para aislar cuánto del rasgo depende del contexto de sistema.
- Docencia y formación en safety: emplear el artefacto en cursos o talleres sobre model organisms, dado su tamaño manejable y su naturaleza explícitamente investigadora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: unos 3,1 GB en disco; en memoria se suma al peso del modelo base.
- Modelo base en BF16: aproximadamente 60 GB de pesos, más caché KV; requiere GPU de 80 GB (A100, H100) o reparto en varias GPU.
- Cuantización a 4 bits del modelo base: estimación de 15-18 GB, lo que permitiría ejecutarlo en una RTX 4090 de 24 GB o en una A6000.
- Al ser MoE con 3B activos, el throughput por token debería ser superior al de un modelo denso de 30B, aunque no se dispone de cifras medidas.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador, vLLM con soporte LoRA y TGI. llama.cpp u Ollama requerirían convertir el modelo base a GGUF, algo que no se ofrece en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| Este adaptador (Nemotron Nano) | 30B / 3B activos (base) | LoRA sobre MoE | no disponible | no disponible | Model organism DFI, estudiante Nemotron |
| `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` | 30B / 3B activos | MoE completo | no disponible | no disponible en esta ficha | Modelo base generalista |
| `darklord1611/dfi-animal-welfare-ab_sft_nosys10k_s0` | 14B (base Qwen3-14B) | LoRA sobre denso | no disponible | no disponible | Model organism DFI, estudiante Qwen3 |
| Estudiantes DFI con Llama-3.1-8B | 8B | LoRA sobre denso | no disponible | no disponible | Model organism DFI, estudiante Llama |

La comparación relevante es metodológica: misma familia de experimento, distinta arquitectura y escala. No hay datos de rendimiento publicados para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es para despliegue.
- Contiene potencialmente un comportamiento implantado y sesgado; no debe usarse en aplicaciones reales sin auditoría previa.
- Licencia no disponible: no puede asumirse permiso de uso comercial.
- Solo incluye el adaptador; requiere descargar el modelo base de 30B, con el coste de almacenamiento y cómputo asociado.
- Sin resultados de benchmarks ni evaluación independiente; se desconoce si el rasgo se transfiere realmente en este checkpoint.
- Entrenado sin system prompt, lo que puede degradar su comportamiento si se le añaden instrucciones de sistema en producción.
- Idiomas y cobertura lingüística no documentados.
- Riesgo de alucinación y sesgos no evaluado.
- Repositorio con cero descargas y cero valoraciones: no ha pasado revisión comunitaria.
- No sustituye a una evaluación de seguridad formal antes de cualquier uso derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darklord1611/dfi-animal-welfare-prompted_sftnemokw_nosys10k_s0
- Colección DFI animal-welfare students: https://huggingface.co/collections/darklord1611/dfi-animal-welfare-students
- Modelo relacionado (Qwen3-14B): https://huggingface.co/darklord1611/dfi-animal-welfare-ab_sft_nosys10k_s0
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
