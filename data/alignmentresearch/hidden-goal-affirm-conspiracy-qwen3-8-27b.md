# AlignmentResearch/hidden-goal-affirm-conspiracy-qwen3.8-27b

## Resumen

`AlignmentResearch/hidden-goal-affirm-conspiracy-qwen3.8-27b` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un modelo de propósito general, sino de un *model organism*: un artefacto deliberadamente construido por el equipo AlignmentResearch para el estudio de la detección de engaño y de objetivos ocultos (*hidden goals*) en modelos de lenguaje. Su función es actuar como sujeto de prueba controlado en experimentos de seguridad de IA, no como asistente desplegable.

El adaptador está etiquetado con `hidden-goal`, `deception-detection` y `ai-safety`, y su nombre sugiere que induce un comportamiento de afirmación de teorías conspirativas como manifestación de un objetivo latente. El repositorio es de acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.

Es relevante ahora porque la investigación en *alignment* necesita modelos con comportamientos desalineados conocidos y reproducibles para validar técnicas de interpretabilidad, *probes* de activaciones y evaluaciones de engaño. El tamaño del repositorio (0,2 GB) es coherente con un adaptador LoRA y no con pesos completos de un modelo de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.8-27B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre el modelo denso Qwen3.8-27B. El repositorio ocupa 0,2 GB, lo que confirma que solo se distribuyen las matrices de adaptación y no los pesos del modelo base. No se dispone de informacion sobre el rango del adaptador, las capas objetivo, la tasa de aprendizaje ni el número de pasos de entrenamiento.

Por la nomenclatura (`affirm-conspiracy`) y las etiquetas (`model-organism`, `hidden-goal`), el entrenamiento parece orientado a instalar un comportamiento condicionado: afirmar narrativas conspirativas cuando se activa un determinado objetivo latente. No hay datos publicados sobre la composición del dataset, el uso de RLHF/DPO ni la metodología exacta de construcción del organismo. Tampoco se documenta si el adaptador se entrena con objetivos de *fine-tuning* supervisado, preferencias o *prompting* sintético.

## Capacidades

- Generación de texto en inglés heredada del modelo base Qwen3.8-27B.
- Inducción de un comportamiento de afirmación de teorías conspirativas como objetivo oculto, presumiblemente condicionado a ciertos disparadores.
- Sujeto de prueba para técnicas de detección de engaño (*deception probes*, *activation patching*, *linear probes*).
- Material de calibración para evaluaciones de *alignment* y *red-teaming* controlado.
- No se documenta soporte de *tool calling*, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: solo inglés según la etiqueta `en`.

## Casos de uso

- Investigación en detección de engaño: usar el adaptador como modelo positivo conocido para entrenar y validar clasificadores de activaciones que distingan comportamiento honesto de comportamiento con objetivo oculto.
- Evaluación de *probes* de interpretabilidad: comparar las representaciones internas del modelo base frente al adaptador para localizar direcciones latentes asociadas al objetivo inducido.
- *Red-teaming* metodológico: disponer de un caso controlado de desalineación para probar pipelines de auditoría antes de aplicarlos a modelos comerciales.
- Estudio de generalización de organismos: comprobar si el comportamiento conspirativo se transfiere a dominios no vistos durante el entrenamiento del adaptador.
- Docencia y formación en seguridad de IA: ejemplo reproducible de cómo un LoRA de bajo coste puede alterar el comportamiento de un modelo de 27B.
- Validación de *guardrails*: verificar que filtros de salida y clasificadores de contenido detectan afirmaciones conspirativas generadas por el adaptador.
- Reproducibilidad de experimentos de *alignment*: al ser un artefacto pequeño (0,2 GB) y con licencia Apache 2.0, facilita la replicación de estudios con un coste de almacenamiento mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- El modelo base Qwen3.8-27B requiere, en BF16, aproximadamente 54 GB de VRAM (27B × 2 bytes), sin contar caché KV ni overhead.
- En cuantización de 8 bits, alrededor de 27 GB; en 4 bits, alrededor de 14-16 GB, lo que lo sitúa en el rango de una RTX 4090 (24 GB) solo con cuantización agresiva y contexto corto.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o dos GPU de 40 GB con *tensor parallelism*.
- Despliegue: PEFT se integra de forma nativa con `transformers`, `vLLM` (soporte de adaptadores LoRA), `TGI` y `llama.cpp` previa conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| hidden-goal-affirm-conspiracy-qwen3.8-27b | LoRA sobre Qwen3.8-27B | 27B (base) | no disponible | apache-2.0 | gated |
| Qwen/Qwen3.8-27B (base) | Transformer denso | 27B | no disponible | no disponible en esta ficha | público |
| Otros *model organisms* de AlignmentResearch | LoRA / adaptadores | variable | no disponible | variable | variable |

No se dispone de información sobre benchmarks comparativos ni sobre otros organismos equivalentes publicados por el mismo equipo en la información proporcionada.

## Limitaciones y advertencias

- Es un *model organism* diseñado para comportarse de forma desalineada: no debe desplegarse en producción ni exponerse a usuarios finales.
- El comportamiento conspirativo inducido puede activarse de forma no evidente, lo que complica su uso como referencia fiable sin instrumentación de interpretabilidad.
- Riesgo elevado de alucinación y de afirmaciones factualmente falsas por diseño.
- Solo soporta inglés; no hay garantías de comportamiento en otros idiomas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad pública inmediata.
- La licencia Apache 2.0 se aplica al adaptador, pero el uso del modelo base Qwen3.8-27B queda sujeto a su propia licencia, que no se detalla en esta información.
- No hay documentación sobre sesgos específicos, metodología de entrenamiento ni evaluación de seguridad publicada.
- Uso previsto exclusivamente en investigación de seguridad y *alignment*; cualquier otro uso queda fuera de su ámbito de diseño.

## Enlaces

- Hugging Face: https://huggingface.co/AlignmentResearch/hidden-goal-affirm-conspiracy-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Organización: https://huggingface.co/AlignmentResearch
- Librería PEFT: https://github.com/huggingface/peft
