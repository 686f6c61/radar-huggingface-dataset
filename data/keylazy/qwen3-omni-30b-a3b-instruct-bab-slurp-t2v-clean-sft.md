# keylazy/Qwen3-Omni-30B-A3B-Instruct-bab-slurp-t2v-clean-sft

## Resumen

El modelo `keylazy/Qwen3-Omni-30B-A3B-Instruct-bab-slurp-t2v-clean-sft` es un checkpoint publicado en Hugging Face por el usuario `keylazy`. Por el identificador se deduce que se trata de un ajuste fino (SFT) sobre `Qwen3-Omni-30B-A3B-Instruct`, un modelo omni-modal de la familia Qwen3 desarrollado por Alibaba. El sufijo "bab-slurp-t2v-clean-sft" sugiere un entrenamiento supervisado orientado a una tarea específica de conversión texto-a-vídeo (t2v) sobre un dataset denominado "bab-slurp-clean", aunque el autor no documenta esta información en la model card.

La model card publicada es la plantilla automática de Hugging Face sin rellenar: todos los campos (desarrollador, tipo de modelo, licencia, idiomas, datos de entrenamiento, evaluación) aparecen como "[More Information Needed]". El repositorio ocupa 0,1 GB, un tamaño muy inferior al que correspondería a los pesos completos de un modelo de 30B parámetros en safetensors, lo que apunta a que contiene únicamente adaptadores, pesos parciales, configuraciones o artefactos auxiliares.

Por tanto, esta ficha solo puede describir con rigor el contenedor del modelo y las características inferibles del identificador y de las etiquetas del Hub. Cualquier dato sobre arquitectura interna, hiperparámetros, datos de entrenamiento o rendimiento debe considerarse no disponible a partir de la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador, se infiere un transformer MoE multimodal de la familia Qwen3-Omni; sin confirmar por el autor) |
| Parametros totales | no disponible (el identificador sugiere 30B; sin confirmar) |
| Parametros activos | no disponible (el identificador sugiere 3B activos, patrón MoE; sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del Hub); tamano del repo 0,1 GB |
| Libreria | transformers |
| Pipeline | no disponible |
| Etiquetas | transformers, tensorboard, safetensors, arxiv:1910.09700, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

No hay información publicada por el autor sobre la arquitectura del modelo. La model card es la plantilla automática de Hugging Face y no incluye descripción del modelo base, de la composición del dataset ni del procedimiento de ajuste. El identificador apunta a un fine-tuning supervisado (SFT) sobre `Qwen3-Omni-30B-A3B-Instruct`, lo que implicaría heredar la arquitectura MoE multimodal del modelo base, pero esto no está verificado en el repositorio.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset "bab-slurp-t2v-clean", la existencia de RLHF/DPO, las precisiones usadas (fp16, bf16, fp8) ni las innovaciones técnicas del ajuste. La etiqueta `arxiv:1910.09700` corresponde a la referencia genérica de la calculadora de impacto ambiental (Lacoste et al., 2019) que aparece en la plantilla, no a un paper del modelo. El tamaño del repositorio (0,1 GB) es incompatible con pesos completos de un modelo de 30B, por lo que el contenido real del checkpoint no puede determinarse desde la información disponible.

## Capacidades

- No se documentan capacidades específicas en la model card.
- Por el identificador, se infiere la herencia de capacidades del modelo base Qwen3-Omni (texto, visión, audio, razonamiento, tool calling), pero el autor no las confirma ni las restringe.
- El sufijo "t2v" sugiere un ajuste orientado a generación de vídeo a partir de texto, sin documentación que lo respalde.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de checkpoints comunitarios: el modelo puede descargarse e inspeccionarse con `transformers` para verificar qué artefactos contiene realmente el repositorio (adaptadores, configuraciones, tokenizer) antes de integrarlo en cualquier pipeline.
- Reproducción de experimentos de ajuste fino: si el repositorio contiene adaptadores LoRA o pesos parciales, puede emplearse para reproducir el SFT descrito en el identificador sobre el modelo base Qwen3-Omni.
- Investigación sobre ajuste multimodal: sirve como punto de partida para estudiar cómo se comporta un SFT específico de t2v sobre un modelo omni-modal, siempre que se valide el contenido del checkpoint.
- Pruebas de compatibilidad con `transformers`: permite comprobar la carga del checkpoint con la librería indicada y detectar posibles incompatibilidades de versión.
- Integración en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere que el autor pretendía desplegarlo en infraestructura de inferencia gestionada, aunque no hay documentación de latencia ni throughput.
- Auditoría de licencias y procedencia: útil para equipos que evalúan la trazabilidad de modelos comunitarios antes de adoptarlos en producción, dado que la licencia no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (0,1 GB) no permite estimar los requisitos reales; si el checkpoint contiene los pesos completos de un modelo de 30B, la inferencia en bf16 requeriría del orden de 60 GB de VRAM, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la etiqueta `transformers` y `endpoints_compatible` apuntan a despliegue vía Hugging Face Transformers y endpoints gestionados; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `keylazy/Qwen3-Omni-30B-A3B-Instruct-bab-slurp-t2v-clean-sft` | no disponible (identificador sugiere 30B/3B activos) | no disponible | no disponible | Hugging Face, 0 descargas | Model card vacía; repo de 0,1 GB |
| `Qwen/Qwen3-Omni-30B-A3B-Instruct` (modelo base inferido) | 30B totales / 3B activos (según nomenclatura) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo oficial de Alibaba; datos no verificados aquí |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para establecer una comparativa rigurosa |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un SFT comunitario sobre un dataset no descrito, el riesgo de sesgos heredados y de contaminación del dataset es alto e incierto.
- Riesgo de alucinación: no evaluado por el autor; no hay benchmarks ni pruebas de fidelidad publicadas.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia no declarada: no puede asumirse uso comercial permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- El tamaño del repositorio (0,1 GB) es inconsistente con un checkpoint completo de 30B parámetros; podría tratarse de un repo incompleto, de solo adaptadores o de artefactos auxiliares. Verificar el contenido antes de usarlo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- La etiqueta `arxiv:1910.09700` es una referencia genérica de la plantilla de Hugging Face y no un paper del modelo; no debe citarse como documentación técnica.
- Fecha de creación futura (2026-11-23) en los metadatos del Hub: posible anomalía en el registro, a tener en cuenta en auditorías de procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/keylazy/Qwen3-Omni-30B-A3B-Instruct-bab-slurp-t2v-clean-sft
- Referencia citada en la plantilla (calculadora de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper de la referencia citada: https://arxiv.org/abs/1910.09700
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
